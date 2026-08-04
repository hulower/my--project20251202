import { Routes, Route } from 'react-router-dom';
import BlogPage from '../features/blog/pages/BlogPage';
import PostDetailPage from '../features/blog/pages/PostDetailPage';
import EditorPage from '../features/blog/pages/EditorPage';
import ArchivePage from '../features/blog/pages/ArchivePage';
import TagManagePage from '../features/blog/pages/TagManagePage';
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
      <Route path="/" element={<BlogPage />} />
      <Route path="/blog/post/:slug" element={<PostDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/mood" element={<BlogPage />} />
      <Route path="/blog/notes" element={<BlogPage />} />
      <Route path="/blog/tech" element={<BlogPage />} />
      <Route path="/blog/archives" element={<ArchivePage />} />
      
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
        path="/blog/new"
        element={
          <ProtectedRoute roles={['editor', 'admin']}>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blog/edit/:id"
        element={
          <ProtectedRoute roles={['editor', 'admin']}>
            <EditorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/music-manage" 
        element={
          <ProtectedRoute roles={['editor', 'admin']}>
            <MusicManagePage />
          </ProtectedRoute>
        } 
      />
      
      {/* 标签管理 - 仅管理员 */}
      <Route 
        path="/tag-manage" 
        element={
          <ProtectedRoute roles={['admin']}>
            <TagManagePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
