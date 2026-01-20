// UI-Config.js - 用户界面颜色配置

const UIConfig = {
    // 背景颜色
    backgroundColor: '#2d2d2d', // 深灰色背景
    
    // 文字颜色
    textColor: '#ffffff', // 白色文字
    
    // 边框和框体颜色
    borderColor: '#00ff00', // 绿色边框（默认）
    
    // 聚焦状态颜色
    focusColor: '#ff0000', // 红色聚焦
    
    // 各区域颜色配置
    regions: {
        // Top区域 - 搜索框
        top: {
            backgroundColor: '#2d2d2d',
            borderColor: '#00ff00',
            focusColor: '#ff0000',
            textColor: '#ffffff'
        },
        
        // 路径显示区域
        path: {
            backgroundColor: '#2d2d2d',
            borderColor: '#00ff00',
            focusColor: '#ff0000',
            textColor: '#ffffff'
        },
        
        // 左侧栏 - 盘符列表
        left: {
            backgroundColor: '#2d2d2d',
            borderColor: '#00ff00',
            focusColor: '#ff0000',
            textColor: '#ffffff'
        },
        
        // 右侧栏 - 文件列表
        right: {
            backgroundColor: '#2d2d2d',
            borderColor: '#00ff00',
            focusColor: '#ff0000',
            textColor: '#ffffff'
        }
    },
    
    // 文件项颜色
    fileItem: {
        normal: {
            backgroundColor: 'transparent',
            textColor: '#ffffff'
        },
        selected: {
            backgroundColor: '#00ff00', // 选中项绿色背景
            textColor: '#000000' // 黑色文字提高可读性
        },
        focused: {
            backgroundColor: '#ff0000', // 聚焦项红色背景
            textColor: '#ffffff'
        }
    },
    
    // 按钮颜色
    button: {
        normal: {
            backgroundColor: '#00ff00',
            textColor: '#000000'
        },
        hover: {
            backgroundColor: '#00cc00',
            textColor: '#000000'
        },
        active: {
            backgroundColor: '#ff0000',
            textColor: '#ffffff'
        }
    },
    
    // 输入框颜色
    input: {
        normal: {
            backgroundColor: '#1a1a1a',
            borderColor: '#00ff00',
            textColor: '#ffffff'
        },
        focus: {
            backgroundColor: '#1a1a1a',
            borderColor: '#ff0000',
            textColor: '#ffffff'
        }
    }
};

// 配置导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIConfig;
} else {
    window.UIConfig = UIConfig;
}