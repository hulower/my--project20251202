import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Sparkles, MessageCircle, BookMarked, Music } from 'lucide-react';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UserMenu from './components/UserMenu';

function AppContent() {
  const location = useLocation();
  const { hasRole } = useAuth();
  
  // 不显示导航栏的路径列表
  const hideNavPaths = ['/login', '/register'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);
  
  // 检查用户是否有音乐管理权限（editor 或 admin）
  const canAccessMusicManage = hasRole(['editor', 'admin']);
  
  const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#334155',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    letterSpacing: '0.3px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    transition: 'all 0.2s ease',
  };

  return (
    <>
      {!shouldHideNav && (
             <nav
               style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 right: 0,
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 padding: '0.75rem 2rem',
                 backgroundColor: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(10px)',
                 zIndex: 1000,
                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                 borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
               }}
             >
               {/* 导航链接 - 居中 */}
               <div
                 style={{
                   display: 'flex',
                   justifyContent: 'center',
                   alignItems: 'center',
                   gap: '0.5rem',
                   flex: 1,
                 }}
               >
               <Link 
                 to="/" 
                 style={navLinkStyle}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
                   e.currentTarget.style.color = '#0f172a';
                   e.currentTarget.style.transform = 'translateY(-1px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                   e.currentTarget.style.color = '#334155';
                   e.currentTarget.style.transform = 'translateY(0)';
                 }}
               >
                 <Home size={18} strokeWidth={2.5} />
                 <span>首页</span>
               </Link>
              <Link 
                to="/blog" 
                style={navLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <BookOpen size={18} strokeWidth={2.5} />
                <span>个人博客</span>
              </Link>
              <Link 
                to="/blog/mood" 
                style={navLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MessageCircle size={18} strokeWidth={2.5} />
                <span>说说</span>
              </Link>
              <Link 
                to="/blog/notes" 
                style={navLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <BookMarked size={18} strokeWidth={2.5} />
                <span>学习笔记</span>
              </Link>
             <Link 
               to="/particles" 
               style={navLinkStyle}
               onMouseEnter={(e) => {
                 e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
                 e.currentTarget.style.color = '#0f172a';
                 e.currentTarget.style.transform = 'translateY(-1px)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.backgroundColor = 'transparent';
                 e.currentTarget.style.color = '#334155';
                 e.currentTarget.style.transform = 'translateY(0)';
               }}
             >
               <Sparkles size={18} strokeWidth={2.5} />
               <span>粒子</span>
             </Link>
             {/* 音乐管理 - 仅对 editor 和 admin 可见 */}
             {canAccessMusicManage && (
               <Link 
                 to="/music-manage" 
                 style={navLinkStyle}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.08)';
                   e.currentTarget.style.color = '#0f172a';
                   e.currentTarget.style.transform = 'translateY(-1px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                   e.currentTarget.style.color = '#334155';
                   e.currentTarget.style.transform = 'translateY(0)';
                 }}
               >
                 <Music size={18} strokeWidth={2.5} />
                 <span>音乐管理</span>
               </Link>
             )}
               </div>
               
               {/* 用户菜单 - 右侧 */}
               <div
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                 }}
               >
                 <UserMenu />
               </div>
            </nav>
      )}
      <AppRoutes />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
