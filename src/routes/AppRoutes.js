import { Routes, Route } from 'react-router-dom';
import HomePage from '../features/home/pages/HomePage';
import BlogPage from '../features/blog/pages/BlogPage';
import ParticlePage from '../features/particles/pages/ParticlePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/particles" element={<ParticlePage />} />
    </Routes>
  );
}

export default AppRoutes;
