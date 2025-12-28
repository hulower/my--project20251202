import { Routes, Route } from 'react-router-dom';
import HomePage from '../features/home/pages/HomePage';
import BlogPage from '../features/blog/pages/BlogPage';
import PostDetailPage from '../features/blog/pages/PostDetailPage';
import ParticlePage from '../features/particles/pages/ParticlePage';
import MusicManagePage from '../features/music/pages/MusicManagePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog/post/:slug" element={<PostDetailPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/mood" element={<BlogPage />} />
      <Route path="/blog/notes" element={<BlogPage />} />
      <Route path="/particles" element={<ParticlePage />} />
      <Route path="/music-manage" element={<MusicManagePage />} />
    </Routes>
  );
}

export default AppRoutes;
