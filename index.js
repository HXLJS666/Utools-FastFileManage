// 快速文件管理工具 - 主功能逻辑

// DOM元素
const searchInput = document.getElementById('searchInput');
const driveList = document.getElementById('driveList');
const fileList = document.getElementById('fileList');
const pathRegion = document.getElementById('pathRegion');
const currentPath = document.getElementById('currentPath');
const leftRegion = document.getElementById('leftRegion');
const rightRegion = document.getElementById('rightRegion');

// 路径分隔符，根据当前操作系统自动设置
const pathSep = /^win/.test(navigator.platform) ? '\\' : '/';

// 当前状态
let currentDir = null;
let selectedFiles = [];
let focusedIndex = 0;
let config = null;
let keyMapping = null;
let currentFocusedRegion = 'search'; // search, drive, file

// 初始化应用
async function initApp() {
    // 加载配置
    await loadConfig();
    
    // 添加事件监听器
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 添加焦点事件监听器，用于跟踪当前聚焦区域
    searchInput.addEventListener('focus', () => {
        currentFocusedRegion = 'search';
    });
    
    leftRegion.addEventListener('focus', () => {
        currentFocusedRegion = 'drive';
    });
    
    rightRegion.addEventListener('focus', () => {
        currentFocusedRegion = 'file';
    });
    
    // 添加全局Tab键处理
    document.addEventListener('keydown', handleTabKey);
    
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

// 加载配置
async function loadConfig() {
    try {
        config = await window.fileManagerApi?.getConfig();
        buildKeyMapping();
        console.log('配置加载成功:', config);
    } catch (error) {
        console.error('加载配置失败:', error);
        // 加载默认配置
        config = await window.fileManagerApi?.getDefaultConfig();
        buildKeyMapping();
    }
}

// 重新加载配置
async function reloadConfig() {
    await loadConfig();
    console.log('配置已重新加载');
    // 配置重新加载后，键盘事件处理会自动使用新配置
}

// 保存配置
async function saveCurrentConfig() {
    try {
        const success = await window.fileManagerApi?.saveConfig(config);
        if (success) {
            console.log('配置保存成功');
            return true;
        } else {
            console.error('配置保存失败');
            return false;
        }
    } catch (error) {
        console.error('保存配置失败:', error);
        return false;
    }
}

// 更新配置项
async function updateConfig(newConfig) {
    try {
        config = { ...config, ...newConfig };
        buildKeyMapping();
        return await saveCurrentConfig();
    } catch (error) {
        console.error('更新配置失败:', error);
        return false;
    }
}

// 构建按键映射
function buildKeyMapping() {
    if (!config?.keyboard) {
        return;
    }
    
    keyMapping = {
        navigation: {
            up: config.keyboard.navigation.up.toLowerCase(),
            down: config.keyboard.navigation.down.toLowerCase(),
            left: config.keyboard.navigation.left.toLowerCase(),
            right: config.keyboard.navigation.right.toLowerCase(),
            enter: config.keyboard.navigation.enter.toLowerCase(),
            backspace: config.keyboard.navigation.backspace.toLowerCase(),
            tab: config.keyboard.navigation.tab.toLowerCase()
        },
        fileOperations: {
            copy: config.keyboard.fileOperations.copy.toLowerCase(),
            paste: config.keyboard.fileOperations.paste.toLowerCase(),
            cut: config.keyboard.fileOperations.cut.toLowerCase(),
            delete: config.keyboard.fileOperations.delete.toLowerCase(),
            open: config.keyboard.fileOperations.open.toLowerCase(),
            openInExplorer: config.keyboard.fileOperations.openInExplorer.toLowerCase()
        },
        selection: {
            multiSelect: config.keyboard.selection.multiSelect.toLowerCase(),
            selectAll: config.keyboard.selection.selectAll.toLowerCase(),
            clearSelection: config.keyboard.selection.clearSelection.toLowerCase()
        },
        search: {
            focusSearch: config.keyboard.search.focusSearch.toLowerCase(),
            clearSearch: config.keyboard.search.clearSearch.toLowerCase()
        }
    };
}

// 检查按键是否匹配配置
function isKeyPressed(event, keyConfig) {
    const key = event.key.toLowerCase();
    const keyParts = keyConfig.split('+');
    
    // 检查修饰键
    const hasCtrl = !keyParts.includes('ctrl') || event.ctrlKey;
    const hasShift = !keyParts.includes('shift') || event.shiftKey;
    const hasAlt = !keyParts.includes('alt') || event.altKey;
    const hasMeta = !keyParts.includes('meta') || event.metaKey;
    
    // 检查主要按键
    const mainKey = keyParts[keyParts.length - 1];
    const keyMatch = key === mainKey;
    
    return hasCtrl && hasShift && hasAlt && hasMeta && keyMatch;
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
    // 清空当前路径内容
    currentPath.innerHTML = '';
    
    // 处理路径分隔符，统一为/进行处理
    let normalizedPath = dirPath.replace(/\\/g, '/');
    
    // 处理Windows根目录（如C:/）
    let root = '';
    if (normalizedPath.match(/^[A-Za-z]:/)) {
        root = normalizedPath.substring(0, 2);
        normalizedPath = normalizedPath.substring(2);
    } else if (normalizedPath.startsWith('/')) {
        // Unix根目录
        root = '/';
        normalizedPath = normalizedPath.substring(1);
    }
    
    // 拆分路径为各级目录
    let pathParts = normalizedPath.split('/').filter(part => part.trim() !== '');
    
    // 创建根目录元素
    const rootElement = document.createElement('span');
    rootElement.className = 'path-segment';
    rootElement.textContent = root;
    rootElement.dataset.path = root === '/' ? root : root + '/';
    rootElement.addEventListener('click', () => {
        loadDirectoryContents(rootElement.dataset.path);
    });
    currentPath.appendChild(rootElement);
    
    // 添加分隔符
    if (root && pathParts.length > 0) {
        const separator = document.createElement('span');
        separator.className = 'path-separator';
        separator.textContent = '/';
        currentPath.appendChild(separator);
    }
    
    // 处理各级目录
    let currentPathStr = root === '/' ? root : root + '/';
    
    pathParts.forEach((part, index) => {
        currentPathStr += part;
        
        // 创建目录元素
        const pathElement = document.createElement('span');
        pathElement.className = 'path-segment';
        pathElement.textContent = part;
        pathElement.dataset.path = currentPathStr;
        pathElement.addEventListener('click', () => {
            loadDirectoryContents(pathElement.dataset.path);
        });
        currentPath.appendChild(pathElement);
        
        // 添加分隔符（除了最后一级）
        if (index < pathParts.length - 1) {
            const separator = document.createElement('span');
            separator.className = 'path-separator';
            separator.textContent = '/';
            currentPath.appendChild(separator);
        }
        
        // 添加路径分隔符
        currentPathStr += '/';
    });
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
    
    fileItems.forEach((item, index) => {
        // 点击事件 - 处理选择和打开
        item.addEventListener('click', (e) => {
            // 移除其他项的聚焦状态
            fileItems.forEach(i => i.classList.remove('focused', 'selected'));
            
            // 设置当前项为聚焦和选中状态
            item.classList.add('focused', 'selected');
            
            // 更新当前聚焦索引
            focusedIndex = index;
            
            // 处理点击行为
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
        
        // 鼠标悬停事件
        item.addEventListener('mouseenter', () => {
            // 移除其他项的聚焦状态
            fileItems.forEach(i => i.classList.remove('focused'));
            
            // 设置当前项为聚焦状态
            item.classList.add('focused');
            
            // 更新当前聚焦索引
            focusedIndex = index;
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

// 键盘事件监听器
document.addEventListener('keydown', handleKeyDown);

// 处理Tab键事件
function handleTabKey(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        
        // 正向Tab键（无Shift）：搜索框 -> 盘符列表 -> 文件列表
        // 反向Tab键（有Shift）：文件列表 -> 盘符列表 -> 搜索框
        if (event.shiftKey) {
            // 反向切换
            switch (currentFocusedRegion) {
                case 'search':
                    // 从搜索框反向切换到文件列表
                    switchToFileList();
                    break;
                case 'drive':
                    // 从盘符列表反向切换到搜索框
                    searchInput.focus();
                    break;
                case 'file':
                    // 从文件列表反向切换到盘符列表
                    switchToDriveList();
                    break;
            }
        } else {
            // 正向切换
            switch (currentFocusedRegion) {
                case 'search':
                    // 从搜索框切换到盘符列表
                    switchToDriveList();
                    break;
                case 'drive':
                    // 从盘符列表切换到文件列表
                    switchToFileList();
                    break;
                case 'file':
                    // 从文件列表切换到搜索框
                    searchInput.focus();
                    break;
            }
        }
    }
}

// 处理键盘按键事件
function handleKeyDown(event) {
    // 忽略在输入框中按下的键
    if (event.target === searchInput) {
        return;
    }
    
    // 根据当前聚焦区域处理不同的列表
    if (currentFocusedRegion === 'drive') {
        // 处理盘符列表的键盘事件
        const driveItems = Array.from(document.querySelectorAll('.drive-item'));
        
        // 获取当前聚焦项索引
        let currentIndex = driveItems.findIndex(item => item.classList.contains('focused'));
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        // 检查导航按键
        if (isKeyPressed(event, keyMapping.navigation.up)) {
            event.preventDefault();
            if (driveItems.length > 0) {
                moveDriveSelection(currentIndex - 1, driveItems);
            }
        } else if (isKeyPressed(event, keyMapping.navigation.down)) {
            event.preventDefault();
            if (driveItems.length > 0) {
                moveDriveSelection(currentIndex + 1, driveItems);
            }
        } else if (isKeyPressed(event, keyMapping.navigation.enter)) {
            event.preventDefault();
            if (driveItems.length > 0) {
                const selectedItem = driveItems[currentIndex];
                if (selectedItem) {
                    const drivePath = selectedItem.dataset.path;
                    loadDirectoryContents(drivePath);
                }
            }
        } else if (isKeyPressed(event, keyMapping.navigation.right)) {
            event.preventDefault();
            switchToFileList();
        }
    } else if (currentFocusedRegion === 'file') {
        // 处理文件列表的键盘事件
        const fileItems = Array.from(document.querySelectorAll('.file-item'));
        
        // 获取当前聚焦项索引
        let currentIndex = fileItems.findIndex(item => item.classList.contains('focused'));
        if (currentIndex === -1) {
            currentIndex = focusedIndex;
        }
        
        // 检查导航按键
        if (isKeyPressed(event, keyMapping.navigation.up)) {
            event.preventDefault();
            if (fileItems.length > 0) {
                moveSelection(currentIndex - 1, fileItems);
            }
        } else if (isKeyPressed(event, keyMapping.navigation.down)) {
            event.preventDefault();
            if (fileItems.length > 0) {
                moveSelection(currentIndex + 1, fileItems);
            }
        } else if (isKeyPressed(event, keyMapping.navigation.enter)) {
            event.preventDefault();
            if (fileItems.length > 0) {
                confirmSelection(fileItems, currentIndex);
            }
        } else if (isKeyPressed(event, keyMapping.navigation.backspace)) {
            event.preventDefault();
            navigateUp();
        } else if (isKeyPressed(event, keyMapping.navigation.left)) {
            event.preventDefault();
            switchToDriveList();
        }
    }
    
    // 检查文件操作按键（预留，后续实现）
    // ...
    
    // 检查选择操作按键（预留，后续实现）
    // ...
    
    // 检查搜索操作按键（预留，后续实现）
    // ...
}

// 移动选择
function moveSelection(newIndex, fileItems) {
    // 移除所有聚焦状态
    fileItems.forEach(item => {
        item.classList.remove('focused');
    });
    
    // 确保索引在有效范围内
    if (newIndex < 0) {
        newIndex = 0;
    }
    if (newIndex >= fileItems.length) {
        newIndex = fileItems.length - 1;
    }
    
    // 设置新的聚焦项
    fileItems[newIndex].classList.add('focused');
    fileItems[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // 更新当前聚焦索引
    focusedIndex = newIndex;
}

// 移动盘符选择
function moveDriveSelection(newIndex, driveItems) {
    // 移除所有聚焦状态
    driveItems.forEach(item => {
        item.classList.remove('focused');
    });
    
    // 确保索引在有效范围内
    if (newIndex < 0) {
        newIndex = 0;
    }
    if (newIndex >= driveItems.length) {
        newIndex = driveItems.length - 1;
    }
    
    // 设置新的聚焦项
    driveItems[newIndex].classList.add('focused');
    driveItems[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 确认选择
function confirmSelection(fileItems, index) {
    if (index < 0 || index >= fileItems.length) {
        index = focusedIndex;
    }
    
    const selectedItem = fileItems[index];
    if (!selectedItem) return;
    
    const filePath = selectedItem.dataset.path;
    const fileType = selectedItem.dataset.type;
    
    if (fileType === 'directory') {
        // 进入目录
        loadDirectoryContents(filePath);
    } else {
        // 打开文件
        openFile(filePath);
    }
}

// 返回上级目录
function navigateUp() {
    if (!currentDir) return;
    
    // 处理Windows根目录（如C:\）和Unix根目录（如/）
    if (currentDir.length === 2 && currentDir.endsWith(':')) {
        // Windows根目录（如C:）
        return;
    } else if (currentDir === '/' || currentDir === '\\') {
        // Unix或Windows根目录
        return;
    }
    
    // 获取最后一个路径分隔符的位置
    let lastSepIndex = currentDir.lastIndexOf('/');
    // 如果没找到'/'，尝试查找'\'
    if (lastSepIndex === -1) {
        lastSepIndex = currentDir.lastIndexOf('\\');
    }
    
    // 如果没找到路径分隔符，返回
    if (lastSepIndex === -1) {
        return;
    }
    
    const parentDir = currentDir.substring(0, lastSepIndex);
    // 对于Windows根目录（如C:\），确保返回正确的格式
    if (parentDir.length === 1 && parentDir.endsWith(':')) {
        loadDirectoryContents(parentDir + pathSep);
    } else if (parentDir) {
        loadDirectoryContents(parentDir);
    }
}

// 切换到左侧盘符列表
function switchToDriveList() {
    const leftRegion = document.getElementById('leftRegion');
    const driveItems = Array.from(document.querySelectorAll('.drive-item'));
    
    // 设置区域聚焦
    leftRegion.focus();
    
    // 设置第一个盘符项为聚焦状态
    if (driveItems.length > 0) {
        // 移除所有其他聚焦状态
        driveItems.forEach(item => item.classList.remove('focused'));
        // 设置第一个盘符为聚焦状态
        driveItems[0].classList.add('focused');
    }
}

// 切换到右侧文件列表
function switchToFileList() {
    const rightRegion = document.getElementById('rightRegion');
    const fileItems = Array.from(document.querySelectorAll('.file-item'));
    
    // 设置区域聚焦
    rightRegion.focus();
    
    // 确保文件列表有聚焦项
    if (fileItems.length > 0) {
        const hasFocused = fileItems.some(item => item.classList.contains('focused'));
        if (!hasFocused) {
            fileItems[0].classList.add('focused');
        }
    }
}