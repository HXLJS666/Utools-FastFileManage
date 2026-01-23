// 快速文件管理工具 - 主功能逻辑

// DOM元素
const searchInput = document.getElementById('searchInput');
const driveList = document.getElementById('driveList');
const fileList = document.getElementById('fileList');
const pathRegion = document.getElementById('pathRegion');
const currentPath = document.getElementById('currentPath');

// 当前状态
let currentDir = null;
let selectedFiles = [];
let focusedIndex = 0;

// 初始化应用
async function initApp() {
    // 添加事件监听器
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 初始加载盘符列表
    await loadDriveList();
    
    // 初始加载欢迎信息
    showWelcomeMessage();
}

// 欢迎信息
function showWelcomeMessage() {
    fileList.innerHTML = `
        <div class="welcome-message">
            <h2>欢迎使用快速文件管理</h2>
            <p>在上方搜索框中输入关键词，开始搜索文件</p>
        </div>
    `;
}

// 处理搜索事件
function handleSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
        showMessage('请输入搜索关键词', 'warning');
        return;
    }
    
    // 调用preload.js提供的搜索功能
    window.fileManagerApi?.searchFiles(keyword).then(files => {
        displayFiles(files);
    }).catch(error => {
        showMessage(`搜索失败: ${error.message}`, 'error');
    });
}

// 显示文件列表
function displayFiles(files) {
    if (!files || files.length === 0) {
        fileList.innerHTML = `
            <div class="empty-message">
                <p>未找到匹配的文件</p>
            </div>
        `;
        return;
    }
    
    const fileItems = files.map(file => `
        <div class="file-item" data-path="${file.path}">
            <div class="file-icon">📄</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-path">${file.path}</div>
                <div class="file-meta">
                    <span class="file-size">${formatSize(file.size)}</span>
                    <span class="file-date">${formatDate(file.mtime)}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-btn open-btn" title="打开文件">
                    📂
                </button>
                <button class="action-btn preview-btn" title="预览文件">
                    👁️
                </button>
            </div>
        </div>
    `).join('');
    
    fileList.innerHTML = fileItems;
    
    // 添加文件操作事件监听器
    addFileActionListeners();
}

// 添加文件操作事件监听器
function addFileActionListeners() {
    const openBtns = document.querySelectorAll('.open-btn');
    const previewBtns = document.querySelectorAll('.preview-btn');
    const fileItems = document.querySelectorAll('.file-item');
    
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filePath = btn.closest('.file-item').dataset.path;
            window.fileManagerApi?.openFile(filePath);
        });
    });
    
    previewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const filePath = btn.closest('.file-item').dataset.path;
            window.fileManagerApi?.previewFile(filePath);
        });
    });
    
    fileItems.forEach(item => {
        item.addEventListener('dblclick', () => {
            const filePath = item.dataset.path;
            window.fileManagerApi?.openFile(filePath);
        });
    });
}

// 显示消息
function showMessage(message, type = 'info') {
    fileList.innerHTML = `
        <div class="message ${type}">
            <p>${message}</p>
        </div>
    `;
}

// 加载盘符列表
async function loadDriveList() {
    try {
        const drives = await window.fileManagerApi?.getDrives();
        displayDriveList(drives);
    } catch (error) {
        console.error('加载盘符列表失败:', error);
        showMessage('加载盘符列表失败', 'error');
    }
}

// 显示盘符列表
function displayDriveList(drives) {
    if (!drives || drives.length === 0) {
        driveList.innerHTML = `
            <div class="empty-drives">
                <p>未检测到可用盘符</p>
            </div>
        `;
        return;
    }
    
    const driveItems = drives.map(drive => `
        <div class="drive-item" data-path="${drive.path}">
            <span class="drive-label">${drive.label}</span>
        </div>
    `).join('');
    
    driveList.innerHTML = driveItems;
    
    // 添加盘符点击事件
    addDriveActionListeners();
}

// 添加盘符操作事件监听器
function addDriveActionListeners() {
    const driveItems = document.querySelectorAll('.drive-item');
    
    driveItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const drivePath = item.dataset.path;
            loadDirectoryContents(drivePath);
        });
    });
}

// 加载目录内容
async function loadDirectoryContents(dirPath) {
    try {
        const contents = await window.fileManagerApi?.getDirectoryContents(dirPath);
        currentDir = dirPath;
        updatePathDisplay(dirPath);
        displayDirectoryContents(contents);
    } catch (error) {
        console.error('加载目录内容失败:', error);
        showMessage(`加载目录内容失败: ${error.message}`, 'error');
    }
}

// 更新路径显示
function updatePathDisplay(dirPath) {
    currentPath.textContent = dirPath;
}

// 显示目录内容
function displayDirectoryContents(contents) {
    if (!contents || contents.length === 0) {
        fileList.innerHTML = `
            <div class="empty-message">
                <p>目录为空</p>
            </div>
        `;
        return;
    }
    
    // 排序：文件夹在前，文件在后，按名称排序
    contents.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
    });
    
    const fileItems = contents.map(item => {
        const icon = item.isDirectory ? '📁' : '📄';
        return `
            <div class="file-item" data-path="${item.path}" data-type="${item.type}">
                <div class="file-icon">${icon}</div>
                <div class="file-info">
                    <div class="file-name">${item.name}</div>
                    <div class="file-meta">
                        ${item.isDirectory ? '' : `<span class="file-size">${formatSize(item.size)}</span>`}
                        <span class="file-date">${formatDate(item.mtime)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    fileList.innerHTML = fileItems;
    
    // 添加文件操作事件监听器
    addFileActionListeners();
}

// 添加文件操作事件监听器
function addFileActionListeners() {
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const filePath = item.dataset.path;
            const fileType = item.dataset.type;
            
            if (fileType === 'directory') {
                // 进入目录
                loadDirectoryContents(filePath);
            } else {
                // 打开文件
                openFile(filePath);
            }
        });
    });
}

// 打开文件
function openFile(filePath) {
    try {
        window.fileManagerApi?.openFile(filePath);
    } catch (error) {
        console.error('打开文件失败:', error);
        showMessage(`打开文件失败: ${error.message}`, 'error');
    }
}

// 格式化文件大小
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);