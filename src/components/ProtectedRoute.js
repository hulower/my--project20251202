/**
 * ============================================
 * 文件名：src/components/ProtectedRoute.js
 * 作用：路由保护组件 - 实现路由鉴权
 * ============================================
 * 
 * 功能：
 * 1. ProtectedRoute - 需要登录才能访问
 * 2. RoleGuard - 需要特定角色才能访问
 * 3. GuestOnly - 只允许未登录用户访问（如登录页）
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// ========================================
// 1. 受保护的路由 - 需要登录
// ========================================

/**
 * ProtectedRoute - 保护需要登录的路由
 * 
 * @param {ReactNode} children - 子组件
 * @param {string|string[]} roles - 允许的角色（可选）
 * @param {string} redirectTo - 重定向路径（默认 /login）
 * 
 * @example
 * <Route 
 *   path="/profile" 
 *   element={
 *     <ProtectedRoute>
 *       <ProfilePage />
 *     </ProtectedRoute>
 *   } 
 * />
 * 
 * @example
 * // 需要特定角色
 * <Route 
 *   path="/admin" 
 *   element={
 *     <ProtectedRoute roles={['admin']}>
 *       <AdminPage />
 *     </ProtectedRoute>
 *   } 
 * />
 */
export function ProtectedRoute({ 
  children, 
  roles = null, 
  redirectTo = '/login',
  fallback = null,
}) {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();
  
  // 加载中显示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // 需要特定角色
  if (roles && !hasRole(roles)) {
    // 如果提供了 fallback，显示 fallback
    if (fallback) {
      return fallback;
    }
    
    // 否则显示权限不足页面
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">权限不足</h1>
          <p className="text-muted-foreground mb-6">
            您没有访问此页面的权限
          </p>
          <p className="text-sm text-muted-foreground">
            需要角色：{Array.isArray(roles) ? roles.join(', ') : roles}
          </p>
        </div>
      </div>
    );
  }
  
  // 验证通过，渲染子组件
  return children;
}

// ========================================
// 2. 角色守卫 - 更细粒度的权限控制
// ========================================

/**
 * RoleGuard - 条件渲染组件（基于角色）
 * 
 * @param {string|string[]} roles - 允许的角色
 * @param {ReactNode} children - 有权限时显示的内容
 * @param {ReactNode} fallback - 无权限时显示的内容
 * 
 * @example
 * <RoleGuard roles={['admin', 'editor']}>
 *   <button>编辑</button>
 * </RoleGuard>
 * 
 * @example
 * // 带 fallback
 * <RoleGuard 
 *   roles="admin" 
 *   fallback={<div>仅管理员可见</div>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({ roles, children, fallback = null }) {
  const { hasRole, isAuthenticated } = useAuth();
  
  // 未登录或无权限
  if (!isAuthenticated || !hasRole(roles)) {
    return fallback;
  }
  
  return children;
}

// ========================================
// 3. 访客专用路由 - 只允许未登录用户访问
// ========================================

/**
 * GuestOnly - 只允许未登录用户访问（如登录页、注册页）
 * 
 * @param {ReactNode} children - 子组件
 * @param {string} redirectTo - 已登录时重定向路径（默认 /）
 * 
 * @example
 * <Route 
 *   path="/login" 
 *   element={
 *     <GuestOnly>
 *       <LoginPage />
 *     </GuestOnly>
 *   } 
 * />
 */
export function GuestOnly({ children, redirectTo = '/' }) {
  const { isAuthenticated, loading } = useAuth();
  
  // 加载中显示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 已登录，重定向到首页
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // 未登录，显示页面
  return children;
}

// ========================================
// 使用示例
// ========================================

/*
// 在 AppRoutes.js 中使用

import { ProtectedRoute, RoleGuard, GuestOnly } from '../components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      // 1. 公开路由 - 任何人都可以访问
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      
      // 2. 访客专用 - 只有未登录用户可以访问
      <Route 
        path="/login" 
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        } 
      />
      <Route 
        path="/register" 
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        } 
      />
      
      // 3. 需要登录 - 所有登录用户都可以访问
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      // 4. 需要特定角色 - 只有编辑和管理员可以访问
      <Route 
        path="/music-manage" 
        element={
          <ProtectedRoute roles={['editor', 'admin']}>
            <MusicManagePage />
          </ProtectedRoute>
        } 
      />
      
      // 5. 只有管理员可以访问
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute roles="admin">
            <AdminPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

// 在组件中使用 RoleGuard
function BlogPage() {
  return (
    <div>
      <h1>博客列表</h1>
      
      // 只有编辑和管理员可以看到新建按钮
      <RoleGuard roles={['editor', 'admin']}>
        <button>新建文章</button>
      </RoleGuard>
      
      // 只有管理员可以看到管理按钮
      <RoleGuard roles="admin">
        <button>管理面板</button>
      </RoleGuard>
    </div>
  );
}
*/


