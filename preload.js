// preload.js - 用于主进程和渲染进程之间的通信
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { ipcRenderer, shell } = require('electron');

// 引入配置管理模块
const { getConfig, saveConfig, getDefaultConfig, getConfigPath } = require('./Key-Config.js');

// 将API暴露给渲染进程
window.fileManagerApi = {
    searchFiles,
    openFile,
    previewFile,
    getDrives,
    getDirectoryContents,
    getConfig,
    saveConfig,
    getDefaultConfig
};

/**
 * 搜索文件
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} - 文件列表
 */
async function searchFiles(keyword) {
    try {
        // 获取用户目录
        const userHome = process.platform === 'win32' 
            ? process.env.USERPROFILE 
            : process.env.HOME;
        
        const results = [];
        await searchDirectory(userHome, keyword, results);
        return results;
    } catch (error) {
        console.error('搜索文件失败:', error);
        throw error;
    }
}

/**
 * 递归搜索目录
 * @param {string} dir - 目录路径
 * @param {string} keyword - 搜索关键词
 * @param {Array} results - 结果数组
 */
async function searchDirectory(dir, keyword, results) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            // 跳过隐藏文件和目录
            if (entry.name.startsWith('.')) {
                continue;
            }
            
            try {
                if (entry.isDirectory()) {
                    // 递归搜索子目录
                    await searchDirectory(fullPath, keyword, results);
                } else if (entry.isFile()) {
                    // 检查文件名是否包含关键词
                    if (entry.name.toLowerCase().includes(keyword.toLowerCase())) {
                        const stats = await fs.stat(fullPath);
                        results.push({
                            name: entry.name,
                            path: fullPath,
                            size: stats.size,
                            mtime: stats.mtimeMs
                        });
                    }
                }
            } catch (error) {
                // 忽略无权限访问的文件或目录
                continue;
            }
        }
    } catch (error) {
        // 忽略无权限访问的目录
        return;
    }
}

/**
 * 打开文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<void>} - Promise对象
 */
function openFile(filePath) {
    return shell.openPath(filePath).then((result) => {
        if (result) {
            console.error('打开文件失败:', result);
            throw new Error(result);
        }
    }).catch((error) => {
        console.error('打开文件失败:', error);
        throw error;
    });
}

/**
 * 预览文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>} - 文件内容
 */
async function previewFile(filePath) {
    try {
        // 简单实现：读取文件内容并返回
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error('预览文件失败:', error);
        throw error;
    }
}

/**
 * 获取系统中所有可用的盘符
 * @returns {Promise<Array>} - 盘符列表
 */
async function getDrives() {
    const platform = process.platform;
    
    if (platform === 'win32') {
        // Windows系统：检查A-Z盘符
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const drives = [];
        
        for (const letter of letters) {
            const drive = `${letter}:\\`;
            try {
                // 检查盘符是否存在
                await fs.access(drive);
                // 获取盘符信息
                const stats = await fs.stat(drive);
                drives.push({
                    name: drive,
                    label: letter + ':',
                    isDrive: true,
                    type: 'drive',
                    path: drive
                });
            } catch {
                // 忽略不存在的盘符
                continue;
            }
        }
        
        return drives;
    } else if (platform === 'darwin') {
        // macOS系统：返回主要挂载点
        const mountPoints = ['/', '/Users', '/Volumes'];
        const drives = [];
        
        for (const mountPoint of mountPoints) {
            try {
                await fs.access(mountPoint);
                const stats = await fs.stat(mountPoint);
                drives.push({
                    name: path.basename(mountPoint) || '/',
                    label: mountPoint,
                    isDrive: true,
                    type: 'drive',
                    path: mountPoint
                });
            } catch {
                continue;
            }
        }
        
        return drives;
    } else {
        // Linux系统：返回常见挂载点
        const mountPoints = ['/', '/home', '/mnt', '/media'];
        const drives = [];
        
        for (const mountPoint of mountPoints) {
            try {
                await fs.access(mountPoint);
                const stats = await fs.stat(mountPoint);
                drives.push({
                    name: path.basename(mountPoint) || '/',
                    label: mountPoint,
                    isDrive: true,
                    type: 'drive',
                    path: mountPoint
                });
            } catch {
                continue;
            }
        }
        
        return drives;
    }
}

/**
 * 获取目录内容
 * @param {string} dirPath - 目录路径
 * @returns {Promise<Array>} - 目录内容列表
 */
async function getDirectoryContents(dirPath) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const contents = [];
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            // 跳过隐藏文件和目录
            if (entry.name.startsWith('.')) {
                continue;
            }
            
            try {
                const stats = await fs.stat(fullPath);
                const item = {
                    name: entry.name,
                    path: fullPath,
                    isDirectory: entry.isDirectory(),
                    type: entry.isDirectory() ? 'directory' : 'file',
                    size: stats.size,
                    mtime: stats.mtimeMs
                };
                
                contents.push(item);
            } catch {
                // 忽略无权限访问的文件或目录
                continue;
            }
        }
        
        return contents;
    } catch (error) {
        console.error('获取目录内容失败:', error);
        throw error;
    }
}



// 监听主进程消息
ipcRenderer.on('message', (event, message) => {
    console.log('收到主进程消息:', message);
});