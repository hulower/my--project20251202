import { Routes, Route } from 'react-router-dom';
import HomePage from '../features/home/pages/HomePage';
import BlogPage from '../features/blog/pages/BlogPage';
import PostDetailPage from '../features/blog/pages/PostDetailPage';
import ParticlePage from '../features/particles/pages/ParticlePage';
import MusicManagePage from '../features/music/pages/MusicManagePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ProfilePage from '../features/user/pages/ProfilePage';
import SettingsPage from '../features/user/pages/SettingsPage';
import { ProtectedRoute, GuestOnly } from '../components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* 公开路由 - 任何人都可以访问 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/blog/post/:slug" element={<PostDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/mood" element={<BlogPage />} />
      <Route path="/blog/notes" element={<BlogPage />} />
      <Route path="/particles" element={<ParticlePage />} />
      
      {/* 访客专用路由 - 只有未登录用户可以访问 */}
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
      
      {/* 受保护路由 - 需要登录 */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* 受保护路由 - 需要登录且需要特定角色 */}
      <Route 
        path="/music-manage" 
        element={
          <ProtectedRoute roles={['editor', 'admin']}>
            <MusicManagePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
