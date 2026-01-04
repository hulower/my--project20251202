/**
 * ============================================
 * 文件名：src/contexts/AuthContext.js
 * 作用：全局认证状态管理
 * ============================================
 * 
 * 提供全局的认证状态和方法：
 * - 用户信息
 * - 登录/登出/注册
 * - 权限检查
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStorage } from '../utils/auth';
import * as authApi from '../api/authApi';

// ========================================
// 创建 Context
// ========================================
const AuthContext = createContext(null);

// ========================================
// AuthProvider 组件
// ========================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ========================================
  // 初始化：从 localStorage 加载用户信息
  // ========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = authStorage.getUser();
        const token = authStorage.getAccessToken();
        
        if (savedUser && token) {
          // 有缓存的用户信息和 Token，尝试获取最新信息
          try {
            const freshUser = await authApi.getCurrentUser();
            setUser(freshUser);
            authStorage.setUser(freshUser);
          } catch (err) {
            // 获取失败，使用缓存的用户信息
            console.warn('获取用户信息失败，使用缓存数据:', err);
            setUser(savedUser);
          }
        }
      } catch (err) {
        console.error('初始化认证失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // ========================================
  // 登录
  // ========================================
  const login = async (credentials) => {
    try {
      // 登录前清除旧的认证信息，避免过期 token 影响登录
      authStorage.clear();
      
      const data = await authApi.login(credentials);
      
      // 保存 Token 和用户信息
      authStorage.setTokens(data.accessToken, data.refreshToken);
      authStorage.setUser(data.user);
      setUser(data.user);
      
      return data.user;
    } catch (err) {
      console.error('登录失败:', err);
      throw err;
    }
  };
  
  // ========================================
  // 注册
  // ========================================
  const register = async (userData) => {
    try {
      // 注册前清除旧的认证信息
      authStorage.clear();
      
      const data = await authApi.register(userData);
      
      // 保存 Token 和用户信息
      authStorage.setTokens(data.accessToken, data.refreshToken);
      authStorage.setUser(data.user);
      setUser(data.user);
      
      return data.user;
    } catch (err) {
      console.error('注册失败:', err);
      throw err;
    }
  };
  
  // ========================================
  // 登出
  // ========================================
  const logout = async () => {
    try {
      // 调用后端登出接口
      await authApi.logout();
    } catch (err) {
      console.error('登出接口调用失败:', err);
      // 即使后端失败，也继续清除本地数据
    } finally {
      // 清除本地数据
      authStorage.clear();
      setUser(null);
    }
  };
  
  // ========================================
  // 更新用户信息
  // ========================================
  /**
   * 更新当前用户信息（用于个人资料修改后同步）
   * @param {Object} updatedData - 更新的用户数据
   */
  const updateUser = (updatedData) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...updatedData,
    };
    
    setUser(updatedUser);
    authStorage.setUser(updatedUser);
  };
  
  // ========================================
  // 权限检查函数
  // ========================================
  
  /**
   * 检查是否有指定角色
   * @param {string|string[]} roles - 角色或角色数组
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return false;
  };
  
  /**
   * 检查是否为资源所有者
   * @param {number} resourceAuthorId - 资源作者 ID
   * @returns {boolean}
   */
  const isOwner = (resourceAuthorId) => {
    return user && user.id === resourceAuthorId;
  };
  
  /**
   * 检查是否可以编辑资源
   * @param {number} resourceAuthorId - 资源作者 ID
   * @returns {boolean}
   */
  const canEdit = (resourceAuthorId) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // 管理员可以编辑所有
    return user.id === resourceAuthorId; // 作者可以编辑自己的
  };
  
  /**
   * 检查是否可以删除资源
   * @param {number} resourceAuthorId - 资源作者 ID
   * @returns {boolean}
   */
  const canDelete = (resourceAuthorId) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // 管理员可以删除所有
    return user.id === resourceAuthorId; // 作者可以删除自己的
  };
  
  // ========================================
  // 提供的值
  // ========================================
  const value = {
    user,                              // 当前用户信息
    loading,                           // 是否正在加载
    isAuthenticated: !!user,           // 是否已登录
    login,                             // 登录函数
    logout,                            // 登出函数
    register,                          // 注册函数
    updateUser,                        // 更新用户信息函数
    hasRole,                           // 角色检查
    isOwner,                           // 所有权检查
    canEdit,                           // 编辑权限检查
    canDelete,                         // 删除权限检查
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// useAuth Hook
// ========================================

/**
 * 使用认证上下文的 Hook
 * @returns {Object} 认证相关的状态和方法
 * 
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <div>请先登录</div>;
 *   }
 *   
 *   return <div>欢迎，{user.username}！</div>;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// ========================================
// 使用示例
// ========================================
/*
// 1. 在 App.js 中包裹整个应用
<AuthProvider>
  <AppRoutes />
</AuthProvider>

// 2. 在组件中使用
function MyComponent() {
  const { user, isAuthenticated, login, logout, hasRole, canEdit } = useAuth();
  
  // 检查登录状态
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // 显示用户信息
  return (
    <div>
      <h1>欢迎，{user.username}！</h1>
      <p>角色：{user.role}</p>
      
      {hasRole('admin') && <button>管理员功能</button>}
      {hasRole(['editor', 'admin']) && <button>编辑功能</button>}
      {canEdit(post.authorId) && <button>编辑文章</button>}
      
      <button onClick={logout}>登出</button>
    </div>
  );
}
*/

