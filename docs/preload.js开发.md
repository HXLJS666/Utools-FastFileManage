# preload.js 开发指南

## 概述

`preload.js` 是 uTools 插件开发中的关键文件，负责连接主进程和渲染进程，提供安全的系统 API 访问能力。

## 核心功能

### 1. 沙箱突破
- 渲染进程运行在沙箱环境中，无法直接访问系统资源
- preload.js 可以调用 Node.js API 和 Electron 渲染进程 API
- 通过 `window` 对象向渲染进程暴露安全接口

### 2. 模块引入
- 遵循 CommonJS 规范
- 可以引入 Node.js 原生模块
- 支持自定义模块和第三方模块

## 基本结构

```javascript
// preload.js - 预加载脚本模板
const fs = require('fs/promises');
const path = require('path');
const { shell, clipboard } = require('electron');

// 向渲染进程暴露 API
window.fileManagerApi = {
    searchFiles,
    openFile,
    previewFile
};

// 异步文件搜索函数
async function searchFiles(keyword) {
    // 实现文件搜索逻辑
}

// 文件打开函数
async function openFile(filePath) {
    return shell.openPath(filePath);
}

// 文件预览函数
async function previewFile(filePath) {
    return fs.readFile(filePath, 'utf8');
}
```

## 模块引入规范

### 1. Node.js 原生模块
```javascript
const fs = require('fs/promises');        // 文件系统（推荐异步）
const fsSync = require('fs');             // 文件系统（同步）
const path = require('path');             // 路径处理
const os = require('os');                 // 操作系统信息
const child_process = require('child_process'); // 子进程
```

### 2. Electron 渲染进程 API
```javascript
const { shell, clipboard, nativeImage } = require('electron');
```

### 3. 自定义模块
```javascript
// 引入同级目录下的模块
const fileUtils = require('./libs/fileUtils.js');

// 引入子目录下的模块
const searchUtils = require('./libs/search/searchUtils.js');
```

### 4. 第三方模块
```javascript
// 需要独立的 package.json 和 node_modules
const colord = require('colord');
```

## API 暴露规范

### 1. 命名空间规范
- **避免使用**: `window.utools`（与 uTools 原生 API 冲突）
- **推荐使用**: `window.fileManagerApi`、`window.pluginApi` 等自定义命名空间

### 2. 函数设计规范
```javascript
// 良好的函数设计
window.fileManagerApi = {
    // 异步函数，返回 Promise
    searchFiles: async (keyword) => {
        // 实现逻辑
    },
    
    // 同步函数，直接返回值
    getPlatform: () => {
        return process.platform;
    },
    
    // 带参数验证的函数
    openFile: (filePath) => {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('文件路径无效');
        }
        return shell.openPath(filePath);
    }
};
```

## 异步操作最佳实践

### 1. 使用 async/await
```javascript
// 推荐：使用异步操作
async function searchFiles(keyword) {
    try {
        const files = await recursiveSearch(homeDir, keyword);
        return files;
    } catch (error) {
        console.error('搜索失败:', error);
        throw error;
    }
}

// 避免：同步阻塞操作
function searchFilesSync(keyword) {
    // 同步操作会导致 UI 卡顿
    const files = recursiveSearchSync(homeDir, keyword);
    return files;
}
```

### 2. 错误处理
```javascript
async function safeFileOperation(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error('文件不存在');
        } else if (error.code === 'EACCES') {
            throw new Error('无权限访问文件');
        } else {
            throw error;
        }
    }
}
```

## 快速文件管理插件示例

基于当前项目的优化实现：

```javascript
// preload.js - 优化后的实现
const fs = require('fs/promises');
const path = require('path');
const { shell } = require('electron');

// 向渲染进程暴露 API
window.fileManagerApi = {
    searchFiles,
    openFile,
    previewFile
};

/**
 * 异步搜索文件
 */
async function searchFiles(keyword) {
    try {
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
 */
async function searchDirectory(dir, keyword, results) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            // 跳过隐藏文件
            if (entry.name.startsWith('.')) continue;
            
            try {
                if (entry.isDirectory()) {
                    await searchDirectory(fullPath, keyword, results);
                } else if (entry.isFile() && 
                          entry.name.toLowerCase().includes(keyword.toLowerCase())) {
                    const stats = await fs.stat(fullPath);
                    results.push({
                        name: entry.name,
                        path: fullPath,
                        size: stats.size,
                        mtime: stats.mtimeMs
                    });
                }
            } catch (error) {
                // 忽略权限错误
                continue;
            }
        }
    } catch (error) {
        // 忽略目录访问错误
        return;
    }
}

/**
 * 打开文件
 */
async function openFile(filePath) {
    return shell.openPath(filePath).then((result) => {
        if (result) {
            throw new Error(`打开文件失败: ${result}`);
        }
    });
}

/**
 * 预览文件内容
 */
async function previewFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content.substring(0, 10000); // 限制预览大小
    } catch (error) {
        console.error('预览文件失败:', error);
        throw error;
    }
}
```

## 开发规范

### 1. 代码可读性
- 禁止代码压缩/混淆
- 保持清晰的代码结构
- 添加必要的注释说明

### 2. 安全性
- 只暴露必要的 API
- 验证输入参数
- 处理权限错误

### 3. 性能优化
- 使用异步操作避免 UI 阻塞
- 合理限制递归深度
- 缓存重复操作结果

### 4. 错误处理
- 提供详细的错误信息
- 区分不同类型的错误
- 保持错误信息用户友好

## 调试技巧

### 1. 控制台输出
```javascript
// 在 preload.js 中输出调试信息
console.log('preload.js 已加载');
console.log('可用 API:', Object.keys(window.fileManagerApi));
```

### 2. 错误追踪
```javascript
// 使用 try-catch 包装关键操作
try {
    await someOperation();
} catch (error) {
    console.error('操作失败:', error);
    console.trace(); // 输出调用栈
}
```

### 3. 性能监控
```javascript
// 监控函数执行时间
async function timedOperation() {
    const start = Date.now();
    await someAsyncOperation();
    const duration = Date.now() - start;
    console.log(`操作耗时: ${duration}ms`);
}
```

## 常见问题

### 1. API 未定义
- 检查 preload.js 是否正确加载
- 确认 window 对象属性名称正确
- 验证函数是否正确定义

### 2. 权限错误
- 处理文件访问权限错误
- 提供友好的错误提示
- 记录详细的错误信息

### 3. 性能问题
- 避免同步阻塞操作
- 限制递归深度和文件数量
- 使用分页或流式处理大数据

---

**下一步**: 了解 [API 文档](API文档.md)