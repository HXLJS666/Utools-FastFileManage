// preload.js - 用于主进程和渲染进程之间的通信
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { ipcRenderer, shell } = require('electron');

// 将API暴露给渲染进程
window.fileManagerApi = {
    searchFiles,
    openFile,
    previewFile
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

// 监听主进程消息
ipcRenderer.on('message', (event, message) => {
    console.log('收到主进程消息:', message);
});