// 快速文件管理工具 - 主功能逻辑

// DOM元素
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const fileList = document.getElementById('fileList');

// 初始化应用
function initApp() {
    // 添加事件监听器
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
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