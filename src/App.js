import { Link } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: '#20232a',
        }}
      >
        <Link to="/" style={{ color: '#61dafb', textDecoration: 'none' }}>
          首頁
        </Link>
        <Link to="/blog" style={{ color: '#61dafb', textDecoration: 'none' }}>
          個人博客
        </Link>
      </nav>
      <AppRoutes />
    </>
  );
}

export default App;
