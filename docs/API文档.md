# API 文档

## uTools API 分类

uTools 提供了丰富的 API 接口，分为以下几个主要类别：

### 1. 事件 API
用于处理插件生命周期和用户交互事件。

### 2. 窗口 API
控制 uTools 窗口的显示和行为。

### 3. 复制 API
执行文本、图像、文件的复制操作。

### 4. 输入 API
向系统窗口粘贴文本、图片、文件及输入文本。

### 5. 系统 API
弹出通知、打开文件、在资源管理器中显示文件等系统操作。

### 6. 屏幕 API
取色、截图、获取屏幕信息。

### 7. 用户 API
获取用户基本信息、临时 token 等。

### 8. 动态指令 API
动态控制插件应用的功能指令。

### 9. 模拟按键 API
模拟用户的键盘与鼠标按键操作。

### 10. AI API
调用 AI 能力，支持 Function Calling。

### 11. FFmpeg API
调用 FFmpeg 进行音视频处理。

### 12. 本地数据库 API
数据存储（离线优先，支持云备份&同步）。

### 13. 可编程浏览器 API
使用 uTools browser (ubrowser) 进行网页操作。

## 核心 API 详解

### 事件 API

#### onPluginReady
插件准备就绪时触发。

```javascript
utools.onPluginReady(() => {
    console.log('插件已准备就绪');
});
```

#### onPluginEnter
用户进入插件时触发。

```javascript
utools.onPluginEnter(({ code, type, payload }) => {
    console.log('用户进入插件:', code, type, payload);
});
```

#### onPluginOut
用户退出插件时触发。

```javascript
utools.onPluginOut(() => {
    console.log('用户退出插件');
});
```

### 窗口 API

#### showMainWindow
显示主窗口。

```javascript
utools.showMainWindow();
```

#### hideMainWindow
隐藏主窗口。

```javascript
utools.hideMainWindow();
```

#### setExpendHeight
设置窗口扩展高度。

```javascript
utools.setExpendHeight(400);
```

### 系统 API

#### shellOpenExternal
使用默认程序打开外部链接。

```javascript
utools.shellOpenExternal('https://u.tools');
```

#### shellShowItemInFolder
在资源管理器中显示文件。

```javascript
utools.shellShowItemInFolder('/path/to/file');
```

#### showNotification
显示系统通知。

```javascript
utools.showNotification({
    title: '提示',
    body: '操作已完成'
});
```

### 复制 API

#### copyText
复制文本到剪贴板。

```javascript
utools.copyText('要复制的文本');
```

#### copyImage
复制图片到剪贴板。

```javascript
utools.copyImage('/path/to/image.png');
```

### 输入 API

#### setSubInputValue
设置子输入框的值。

```javascript
utools.setSubInputValue('预设文本');
```

#### setSubInputPlaceholder
设置子输入框的占位符。

```javascript
utools.setSubInputPlaceholder('请输入关键词');
```

## 快速文件管理插件 API 设计

### 自定义 API 接口

基于当前项目的 preload.js 实现，我们定义了以下自定义 API：

#### searchFiles(keyword: string): Promise<Array>
搜索包含关键词的文件。

**参数:**
- `keyword`: 搜索关键词

**返回值:**
- `Promise<Array>`: 文件信息数组

**文件信息结构:**
```javascript
{
    name: string,     // 文件名
    path: string,     // 完整路径
    size: number,     // 文件大小（字节）
    mtime: number     // 修改时间（时间戳）
}
```

**使用示例:**
```javascript
window.fileManagerApi.searchFiles('document')
    .then(files => {
        console.log('找到文件:', files);
    })
    .catch(error => {
        console.error('搜索失败:', error);
    });
```

#### openFile(filePath: string): Promise<void>
使用默认程序打开文件。

**参数:**
- `filePath`: 文件路径

**返回值:**
- `Promise<void>`: 操作完成 Promise

**使用示例:**
```javascript
window.fileManagerApi.openFile('/path/to/file.txt')
    .then(() => {
        console.log('文件已打开');
    })
    .catch(error => {
        console.error('打开失败:', error);
    });
```

#### previewFile(filePath: string): Promise<string>
预览文件内容。

**参数:**
- `filePath`: 文件路径

**返回值:**
- `Promise<string>`: 文件内容字符串

**使用示例:**
```javascript
window.fileManagerApi.previewFile('/path/to/file.txt')
    .then(content => {
        console.log('文件内容:', content.substring(0, 100));
    })
    .catch(error => {
        console.error('预览失败:', error);
    });
```

### API 错误处理

所有自定义 API 都遵循统一的错误处理规范：

```javascript
// 错误类型定义
const ErrorTypes = {
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INVALID_PATH: 'INVALID_PATH',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// 统一错误格式
class PluginError extends Error {
    constructor(type, message, originalError) {
        super(message);
        this.type = type;
        this.originalError = originalError;
    }
}

// 使用示例
async function safeFileOperation(filePath) {
    try {
        await fs.access(filePath);
        // 正常操作...
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new PluginError(ErrorTypes.FILE_NOT_FOUND, '文件不存在', error);
        } else if (error.code === 'EACCES') {
            throw new PluginError(ErrorTypes.PERMISSION_DENIED, '无权限访问', error);
        } else {
            throw new PluginError(ErrorTypes.UNKNOWN_ERROR, '未知错误', error);
        }
    }
}
```

## API 使用最佳实践

### 1. 异步操作
```javascript
// 推荐：使用 Promise 和 async/await
async function handleUserAction() {
    try {
        const result = await window.fileManagerApi.someAsyncOperation();
        // 处理结果
    } catch (error) {
        // 统一错误处理
        showErrorMessage(error.message);
    }
}
```

### 2. 参数验证
```javascript
// 在 preload.js 中验证参数
function validatedOperation(param) {
    if (typeof param !== 'string' || param.trim() === '') {
        throw new Error('参数必须为非空字符串');
    }
    // 继续操作...
}
```

### 3. 性能优化
```javascript
// 使用防抖和节流
let searchTimeout;
function handleSearchInput(keyword) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        window.fileManagerApi.searchFiles(keyword);
    }, 300);
}
```

### 4. 错误恢复
```javascript
// 提供重试机制
async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

## 调试和测试

### 1. API 可用性检查
```javascript
// 检查 API 是否已加载
if (window.fileManagerApi) {
    console.log('文件管理 API 可用');
} else {
    console.error('文件管理 API 未定义');
}
```

### 2. 性能监控
```javascript
// 监控 API 调用性能
async function monitoredAPICall(apiCall) {
    const startTime = performance.now();
    const result = await apiCall();
    const duration = performance.now() - startTime;
    console.log(`API 调用耗时: ${duration}ms`);
    return result;
}
```

### 3. 错误日志
```javascript
// 统一的错误日志记录
function logAPIError(apiName, error) {
    console.error(`API ${apiName} 调用失败:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}
```

## 扩展建议

根据快速文件管理插件的需求，可以考虑扩展以下 API：

### 1. 文件操作 API
- `createFile`: 创建新文件
- `deleteFile`: 删除文件
- `renameFile`: 重命名文件
- `copyFile`: 复制文件

### 2. 目录操作 API
- `createDirectory`: 创建目录
- `listDirectory`: 列出目录内容
- `getFileInfo`: 获取文件详细信息

### 3. 搜索优化 API
- `setSearchScope`: 设置搜索范围
- `getSearchHistory`: 获取搜索历史
- `clearSearchCache`: 清除搜索缓存

---

**下一步**: 了解 [开发最佳实践](开发最佳实践.md)