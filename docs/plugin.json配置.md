# plugin.json 配置

## 配置文件概述

`plugin.json` 是 uTools 插件应用的核心配置文件，定义了插件的基本信息、功能特性、窗口设置等。

## 配置结构

```json
{
  "pluginName": "插件名称",
  "description": "插件描述",
  "version": "1.0.0",
  "main": "index.html",
  "preload": "preload.js",
  "logo": "logo.png",
  "features": [
    {
      "code": "功能代码",
      "explain": "功能说明",
      "cmds": ["命令1", "命令2"]
    }
  ],
  "development": {
    "main": "index.html",
    "preload": "preload.js"
  }
}
```

## 必需配置项

### 1. pluginName
- **类型**: string
- **说明**: 插件名称，显示在 uTools 插件列表中
- **示例**: `"快速文件管理"`

### 2. description
- **类型**: string
- **说明**: 插件描述，简要说明插件功能
- **示例**: `"快速搜索和管理本地文件"`

### 3. version
- **类型**: string
- **说明**: 插件版本号，遵循语义化版本规范
- **示例**: `"1.0.0"`

### 4. main
- **类型**: string
- **说明**: 主界面文件路径，相对于插件根目录
- **示例**: `"index.html"`

### 5. preload
- **类型**: string
- **说明**: 预加载脚本文件路径，相对于插件根目录
- **示例**: `"preload.js"`

### 6. logo
- **类型**: string
- **说明**: 插件图标文件路径，相对于插件根目录
- **示例**: `"logo.png"`

## 可选配置项

### 1. features
- **类型**: array
- **说明**: 插件功能列表，定义插件的功能特性
- **结构**:
  ```json
  {
    "code": "功能唯一标识",
    "explain": "功能说明",
    "cmds": ["触发命令1", "触发命令2"]
  }
  ```

### 2. development
- **类型**: object
- **说明**: 开发环境配置，用于本地开发调试
- **结构**:
  ```json
  {
    "main": "index.html",
    "preload": "preload.js"
  }
  ```

### 3. platform
- **类型**: array
- **说明**: 支持的平台列表
- **可选值**: `["win32", "darwin", "linux"]`
- **默认**: 支持所有平台

### 4. windowOptions
- **类型**: object
- **说明**: 窗口设置，控制插件窗口的显示效果
- **配置项**:
  ```json
  {
    "width": 800,           // 窗口宽度
    "height": 600,          // 窗口高度
    "resizable": true,      // 是否可调整大小
    "minWidth": 400,        // 最小宽度
    "minHeight": 300        // 最小高度
  }
  ```

## 快速文件管理插件配置示例

以当前项目为例的完整配置：

```json
{
  "pluginName": "快速文件管理",
  "description": "快速搜索和管理本地文件",
  "version": "1.0.0",
  "author": "开发者名称",
  "homepage": "https://github.com/username/repo",
  "main": "index.html",
  "preload": "preload.js",
  "logo": "logo.png",
  "platform": ["win32", "darwin", "linux"],
  "features": [
    {
      "code": "file-manager",
      "explain": "文件管理功能",
      "cmds": ["文件管理", "file manage", "文件搜索"]
    }
  ],
  "windowOptions": {
    "width": 800,
    "height": 600,
    "resizable": true,
    "minWidth": 400,
    "minHeight": 300
  },
  "development": {
    "main": "index.html",
    "preload": "preload.js"
  }
}
```

## 配置验证规则

### 文件路径验证
- `main` 和 `preload` 文件必须存在
- `logo` 文件必须存在且为有效图片格式
- 所有路径必须相对于插件根目录

### 格式验证
- JSON 格式必须正确
- 必需字段不能为空
- 版本号必须符合语义化版本规范

### 内容验证
- 插件名称不能包含特殊字符
- 功能命令不能重复
- 窗口尺寸必须在合理范围内

## 开发注意事项

### 1. 路径配置
- 使用相对路径，避免绝对路径
- 确保文件路径大小写正确（Linux/macOS 区分大小写）

### 2. 功能配置
- 为每个功能设置唯一的 code
- 命令列表支持多语言和别名
- 合理设置窗口尺寸，适配不同屏幕

### 3. 版本管理
- 每次更新插件时递增版本号
- 遵循语义化版本规范
- 在更新日志中记录变更内容

### 4. 图标规范
- 推荐尺寸：64x64 像素
- 支持格式：PNG、JPG
- 保持图标简洁明了

## 调试技巧

### 1. 配置检查
```javascript
// 在 preload.js 中检查配置
console.log('插件配置:', require('./plugin.json'));
```

### 2. 错误处理
- 配置文件格式错误时，uTools 会显示错误信息
- 缺失必需文件时，插件无法正常启动
- 路径配置错误时，检查控制台错误信息

### 3. 热重载
- 修改 plugin.json 后需要重启插件
- 开发时可以使用 uTools 的开发模式

## 最佳实践

1. **配置标准化**
   - 使用标准的 JSON 格式
   - 保持配置项的顺序一致
   - 添加必要的注释说明

2. **功能模块化**
   - 为不同功能设置独立的 feature
   - 使用有意义的 code 标识
   - 提供多语言命令支持

3. **用户体验优化**
   - 设置合理的窗口尺寸
   - 支持窗口调整大小
   - 适配不同平台特性

---

**下一步**: 了解 [preload.js 开发](preload.js开发.md)