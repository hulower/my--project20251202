/**
 * ============================================
 * 文件名：ThemeContext.js
 * 作用：主题管理 Context
 * ============================================
 * 功能：
 * 1. 管理主题状态（light, dark, auto）
 * 2. 持久化到 localStorage
 * 3. 自动模式下监听系统主题变化
 * 4. 应用主题类名到 <html> 元素
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// 主题模式：light（浅色）, dark（深色）, auto（自动）
const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// LocalStorage 键名
const THEME_STORAGE_KEY = 'betsy-blog-theme';

/**
 * 获取系统主题偏好
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * 应用主题到 HTML 元素
 */
function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }) {
  // 从 localStorage 读取保存的主题模式，默认为 'auto'
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || THEME_MODES.AUTO;
  });

  // 当前实际应用的主题（light 或 dark）
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === THEME_MODES.LIGHT) return 'light';
    if (saved === THEME_MODES.DARK) return 'dark';
    return getSystemTheme(); // auto 模式下使用系统主题
  });

  /**
   * 切换主题模式
   */
  const changeTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    let actualTheme;
    if (mode === THEME_MODES.LIGHT) {
      actualTheme = 'light';
    } else if (mode === THEME_MODES.DARK) {
      actualTheme = 'dark';
    } else {
      // auto 模式：使用系统主题
      actualTheme = getSystemTheme();
    }

    setCurrentTheme(actualTheme);
    applyTheme(actualTheme);
  };

  /**
   * 监听系统主题变化（仅在 auto 模式下生效）
   */
  useEffect(() => {
    if (themeMode !== THEME_MODES.AUTO) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setCurrentTheme(newTheme);
      applyTheme(newTheme);
    };

    // 添加监听器
    mediaQuery.addEventListener('change', handleChange);

    // 清理监听器
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  /**
   * 初始化时应用主题
   */
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const value = {
    themeMode,        // 用户选择的主题模式（light/dark/auto）
    currentTheme,     // 当前实际应用的主题（light/dark）
    changeTheme,      // 切换主题的方法
    isDark: currentTheme === 'dark',  // 当前是否为深色主题
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * 使用主题的 Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

