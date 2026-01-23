// Key-Config.js - 配置管理模块
const fs = require('fs/promises');
const path = require('path');

/**
 * 获取默认快捷键配置
 * @returns {Object} - 默认配置对象
 */
function getDefaultConfig() {
    return {
        version: "1.0.0",
        keyboard: {
            navigation: {
                up: "w",
                down: "s",
                left: "a",
                right: "d",
                enter: "enter",
                backspace: "backspace",
                tab: "tab"
            },
            fileOperations: {
                copy: "ctrl+c",
                paste: "ctrl+v",
                cut: "ctrl+x",
                delete: "delete",
                open: "space",
                openInExplorer: "ctrl+e"
            },
            selection: {
                multiSelect: "shift",
                selectAll: "ctrl+a",
                clearSelection: "escape"
            },
            search: {
                focusSearch: "ctrl+f",
                clearSearch: "escape"
            }
        },
        ui: {
            theme: "dark",
            showHiddenFiles: false,
            sortBy: "name",
            sortOrder: "asc"
        }
    };
}

/**
 * 获取配置文件路径
 * @returns {string} - 配置文件路径
 */
function getConfigPath() {
    const platform = process.platform;
    let configDir;
    
    if (platform === 'win32') {
        configDir = path.join(process.env.APPDATA, 'FastFileManage');
    } else if (platform === 'darwin') {
        configDir = path.join(process.env.HOME, 'Library', 'Application Support', 'FastFileManage');
    } else {
        configDir = path.join(process.env.HOME, '.config', 'FastFileManage');
    }
    
    return path.join(configDir, 'key-config.json');
}

/**
 * 确保配置目录存在
 */
async function ensureConfigDir() {
    const configDir = path.dirname(getConfigPath());
    try {
        await fs.access(configDir);
    } catch {
        await fs.mkdir(configDir, { recursive: true });
    }
}

/**
 * 获取配置
 * @returns {Promise<Object>} - 配置对象
 */
async function getConfig() {
    try {
        await ensureConfigDir();
        const configPath = getConfigPath();
        
        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            return JSON.parse(configContent);
        } catch (error) {
            // 配置文件不存在或解析失败，返回默认配置
            const defaultConfig = getDefaultConfig();
            await saveConfig(defaultConfig);
            return defaultConfig;
        }
    } catch (error) {
        console.error('获取配置失败:', error);
        return getDefaultConfig();
    }
}

/**
 * 保存配置
 * @param {Object} config - 配置对象
 * @returns {Promise<boolean>} - 是否保存成功
 */
async function saveConfig(config) {
    try {
        await ensureConfigDir();
        const configPath = getConfigPath();
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('保存配置失败:', error);
        return false;
    }
}

module.exports = {
    getDefaultConfig,
    getConfig,
    saveConfig,
    getConfigPath
};