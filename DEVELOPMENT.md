# 快速文件管理插件 - 开发文档

## 项目概述

**项目名称**: 快速文件管理插件 (FastFileManage)
**当前版本**: 1.0.0
**项目路径**: `f:\AI_M_Program\2026_Utool-FastFileManage\Utools-FastFileManage`

---

## 目录

- [技术栈说明](#技术栈说明)
- [uTools API 本地知识库](#utools-api-本地知识库)
- [开发规范](#开发规范)
- [开发日志](#开发日志)
- [版本管理](#版本管理)

---

## 技术栈说明

### 核心框架
- **uTools平台** - 基于Electron的效率工具平台
- **Electron** - 跨平台桌面应用框架
- **Node.js 16.x** - 运行时环境（uTools内置）

### 前端技术
- **HTML5** - 页面结构
- **CSS3** - 样式和布局  
- **原生JavaScript (ES6+)** - 前端逻辑（未使用前端框架）

### 后端/系统集成
- **文件系统API** (`fs/promises`) - 异步文件操作
- **路径处理API** (`path`) - 文件路径处理
- **Electron API** (`shell`, `ipcRenderer`) - 系统集成

### 开发规范
- **CommonJS模块系统** - 模块引入规范
- **异步优先设计** - 使用async/await避免UI阻塞

### 当前使用的核心库
```javascript
// preload.js 中已引入的模块
const fs = require('fs/promises');     // 异步文件操作
const fsSync = require('fs');         // 同步文件操作（备用）
const path = require('path');         // 路径处理
const { ipcRenderer, shell } = require('electron'); // Electron API
```

---

## uTools API 本地知识库

### 文档位置
本地uTools开发文档位于：`f:\AI_M_Program\2026_Utool-FastFileManage\Utools-FastFileManage\docs\`

### 可用文档
1. **[基础文档](docs/基础文档.md)** - uTools开发基础概念
2. **[插件应用目录结构](docs/插件应用目录结构.md)** - 项目文件结构规范  
3. **[plugin.json配置](docs/plugin.json配置.md)** - 插件配置文件详解
4. **[preload.js开发](docs/preload.js开发.md)** - 预加载脚本开发指南
5. **[API文档](docs/API文档.md)** - uTools API接口参考
6. **[开发最佳实践](docs/开发最佳实践.md)** - 开发规范和技巧

### 开发时查阅建议
- 开发前：阅读基础文档和项目结构
- 配置时：参考plugin.json配置文档  
- 编码时：查阅preload.js开发和API文档
- 优化时：遵循最佳实践指南

---

## 开发规范

### 1. 优先使用成熟库和模块

#### 文件操作规范
```javascript
// ✅ 推荐：使用fs库的成熟方法
const fs = require('fs/promises');

// 文件读取
await fs.readFile(filePath, 'utf8');

// 文件写入
await fs.writeFile(filePath, content);

// 目录操作
await fs.readdir(dirPath, { withFileTypes: true });
await fs.mkdir(dirPath, { recursive: true });

// 文件信息
await fs.stat(filePath);
await fs.access(filePath);
```

#### 避免造轮子原则
- **优先使用**：Node.js内置模块、Electron API、uTools API
- **谨慎引入**：第三方npm包（需保持代码可读性）
- **避免自定义**：重复实现已有成熟功能

### 2. 代码质量要求

#### 异步优先
```javascript
// ✅ 推荐：异步操作
async function searchFiles(keyword) {
    const files = await recursiveSearch(keyword);
    return files;
}

// ❌ 避免：同步阻塞
function searchFilesSync(keyword) {
    const files = recursiveSearchSync(keyword); // 会导致UI卡顿
    return files;
}
```

#### 错误处理规范
```javascript
// 统一错误处理
class PluginError extends Error {
    constructor(type, message, originalError = null) {
        super(message);
        this.type = type;
        this.originalError = originalError;
    }
}

async function safeOperation() {
    try {
        return await someAsyncOp();
    } catch (error) {
        throw new PluginError('OPERATION_FAILED', '操作失败', error);
    }
}
```

### 3. 文件操作最佳实践

#### 使用fs/promises进行所有文件操作
```javascript
// 所有文件操作都应使用异步版本
const fs = require('fs/promises');

// 搜索文件
async function searchFiles(keyword) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    // 异步处理每个文件
}

// 文件预览
async function previewFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
}

// 文件操作
async function manageFile(filePath, operation) {
    const stats = await fs.stat(filePath);
    // 基于stats进行相应操作
}
```

---

## 开发日志

### 开发记录格式
```
版本号: 日期 - 开发内容概要
- 具体修改1
- 具体修改2
- 解决的问题
```

### 开发日志记录

#### 版本 1.0.0 - 2026-01-21 - 项目初始化和基础功能
- 创建项目基础文件结构
- 实现plugin.json配置文件
- 开发preload.js预加载脚本
- 实现文件搜索功能（异步递归搜索）
- 开发前端界面和交互逻辑
- 创建完整的uTools开发文档知识库

#### 版本 1.0.1 - 2026-01-21 - preload.js优化和API规范
- 将API命名空间从window.utools改为window.fileManagerApi
- 修复openFile函数，使用Electron的shell.openPath
- 将同步文件操作改为异步操作（fs/promises）
- 更新index.js中的API调用
- 创建项目开发文档体系

#### 版本 1.0.2 - 2026-01-21 - 开发文档完善
- 创建DEVELOPMENT.md开发主文档
- 完善技术栈说明和开发规范
- 建立开发日志记录系统
- 制定版本号管理机制
- 明确优先使用成熟库的开发原则

#### 版本 1.0.3 - 2026-01-21 - UI界面开发
- 创建UI-Config.js颜色配置文件
- 实现四区域布局（Top搜索框、路径显示、左侧盘符、右侧文件列表）
- 应用深灰色背景、绿色边框、红色聚焦的颜色主题
- 实现白色文字和交互状态颜色
- 优化CSS样式和响应式设计

#### 版本 1.0.4 - 2026-01-23 - 键盘导航功能
- 实现W/S键上下选择文件功能
- 实现Enter键确认选择功能
- 实现Backspace键返回上级目录功能
- 实现A/D键区域切换功能
- 实现焦点管理和选中状态样式
- 优化鼠标点击和悬停交互

---

## 版本管理

### 版本号格式：`主版本.次版本.修订版本`
- **主版本**：重大功能更新或架构调整
- **次版本**：新功能添加或重要改进
- **修订版本**：bug修复、优化、文档更新

### 版本更新规则
1. **每次开发会话结束时**更新版本号
2. **修订版本号+1**：日常开发、bug修复、优化
3. **次版本号+1**：添加新功能模块
4. **主版本号+1**：重大架构调整或功能重构

### 当前版本状态
- **当前版本**: 1.0.4
- **下一个版本**: 1.0.5（日常开发）
- **目标版本**: 根据后续需求确定

### 版本历史
| 版本号 | 日期 | 主要内容 | 状态 |
|--------|------|----------|------|
| 1.0.0 | 2026-01-21 | 项目初始化和基础功能 | 已完成 |
| 1.0.1 | 2026-01-21 | preload.js优化和API规范 | 已完成 |
| 1.0.2 | 2026-01-21 | 开发文档完善 | 已完成 |
| 1.0.3 | 2026-01-21 | UI界面开发 | 已完成 |
| 1.0.4 | 2026-01-23 | 键盘导航功能 | 当前版本 |
| 1.0.5 | 待定 | 根据后续需求开发 | 规划中 |

---

## 后续开发计划

### 待开发功能（根据需求确定）
- [ ] 文件预览功能增强
- [ ] 文件操作（复制、移动、删除）
- [ ] 搜索优化和过滤
- [ ] 用户设置和偏好
- [ ] 性能优化和缓存机制

### 技术债务
- [ ] 代码注释完善
- [ ] 错误处理统一化
- [ ] 测试用例编写
- [ ] 性能监控集成

---

**文档最后更新**: 2026-01-23  
**当前开发版本**: 1.0.4  
**下一个版本**: 1.0.5