import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, BookMarked, Archive, Music, Tag, Layers, Code } from 'lucide-react';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import UserMenu from './components/UserMenu';
import SearchBar from './components/SearchBar';
import DropdownMenu from './components/DropdownMenu';

function AppContent() {
  const location = useLocation();
  const { hasRole } = useAuth();
  
  // 不显示导航栏的路径列表
  const hideNavPaths = ['/login', '/register'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);
  
  // 检查用户是否有音乐管理权限（editor 或 admin）
  const canAccessMusicManage = hasRole(['editor', 'admin']);
  
  // 检查用户是否有标签管理权限（仅 admin）
  const canAccessTagManage = hasRole(['admin']);
  
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
                 display: 'grid',
                 gridTemplateColumns: '1fr auto 1fr',
                 alignItems: 'center',
                 padding: '0.75rem 2rem',
                 backgroundColor: 'rgba(255, 255, 255, 0.9)',
                 backdropFilter: 'blur(10px)',
                 zIndex: 1000,
                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                 borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
               }}
             >
               {/* Logo + 搜索框 - 左侧 */}
               <div
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '1.5rem',
                   justifyContent: 'flex-start',
                 }}
               >
                 {/* Logo */}
                 <Link
                   to="/"
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem',
                     textDecoration: 'none',
                     fontSize: '20px',
                     fontWeight: '700',
                     color: '#d4988b',
                     letterSpacing: '0.5px',
                     transition: 'all 0.2s ease',
                     whiteSpace: 'nowrap',
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'scale(1.05)';
                     e.currentTarget.style.color = '#c5897c';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'scale(1)';
                     e.currentTarget.style.color = '#d4988b';
                   }}
                 >
                   <span>Betsy'Blog</span>
                 </Link>
                 
                 {/* 搜索框 */}
                 <div style={{ width: '280px' }}>
                   <SearchBar />
                 </div>
               </div>

               {/* 导航链接 - 居中 */}
               <div
                 style={{
                   display: 'flex',
                   justifyContent: 'center',
                   alignItems: 'center',
                   gap: '0.5rem',
                 }}
               >
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
                <span>首页</span>
              </Link>
              {/* 分类下拉菜单 */}
              <DropdownMenu
                label="分类"
                icon={Layers}
                navLinkStyle={navLinkStyle}
                items={[
                  { 
                    label: '说说', 
                    path: '/blog/mood', 
                    icon: MessageCircle 
                  },
                  { 
                    label: '学习笔记', 
                    path: '/blog/notes', 
                    icon: BookMarked 
                  },
                  { 
                    label: '技术博客', 
                    path: '/blog/tech', 
                    icon: Code 
                  },
                ]}
              />
              <Link 
                to="/blog/archives" 
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
                <Archive size={18} strokeWidth={2.5} />
                <span>归档</span>
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
             
             {/* 标签管理 - 仅对 admin 可见 */}
             {canAccessTagManage && (
               <Link 
                 to="/tag-manage" 
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
                 <Tag size={18} strokeWidth={2.5} />
                 <span>标签管理</span>
               </Link>
             )}
               </div>
               
               {/* 用户菜单 - 右侧 */}
               <div
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'flex-end',
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
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
