import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="earth-wrapper">
          <div className="earth" />
        </div>
        <p
          style={{
            fontWeight: '400',
            letterSpacing: '0.01em',
            lineHeight: '1.6',
          }}
        >
          前端已與 Node.js 後端打通，你可以進入個人博客頁面體驗 CRUD。
        </p>
        <Link
          to="/blog"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#61dafb',
            color: '#000',
            textDecoration: 'none',
            fontWeight: '500',
            letterSpacing: '0.01em',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(97, 218, 251, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(97, 218, 251, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(97, 218, 251, 0.3)';
          }}
        >
          進入博客頁面
        </Link>
      </header>
    </div>
  );
}

export default HomePage;


