import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="earth-wrapper">
          <div className="earth" />
        </div>
        <p>前端已與 Node.js 後端打通，你可以進入個人博客頁面體驗 CRUD。</p>
        <Link
          to="/blog"
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: 4,
            backgroundColor: '#61dafb',
            color: '#000',
            textDecoration: 'none',
          }}
        >
          進入博客頁面
        </Link>
      </header>
    </div>
  );
}

export default HomePage;


