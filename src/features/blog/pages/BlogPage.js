import { useEffect, useState } from 'react';
import {
  fetchPosts as apiFetchPosts,
  createPost as apiCreatePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost,
} from '../../../api/blogApi';

const METEOR_COUNT = 50;

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 流星方向角度（度），根據滑鼠位置實時更新
  const [directionAngle, setDirectionAngle] = useState(20);

  // 在頁面加載時生成一組隨機的流星配置
  const [meteors] = useState(
    () =>
      Array.from({ length: METEOR_COUNT }, (_, index) => {
        // 更明顯：縮短持續時間、縮短延遲
        const duration = 1.8 + Math.random() * 1.7; // 1.8s - 3.5s 之間
        const delay = -Math.random() * 3; // -3s 以內的負延遲
        const topOffset = Math.random() * 100; // 0 - 100%，用於 top 分佈高度

        return {
          id: index,
          top: topOffset,
          duration,
          delay,
        };
      }),
  );

  // 根據滑鼠位置計算角度，控制流星整體滑動方向
  useEffect(() => {
    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;

      const angleRad = Math.atan2(dy, dx);
      const angleDeg = (angleRad * 180) / Math.PI;

      setDirectionAngle(angleDeg);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetchPosts();
      setPosts(data);
    } catch (err) {
      console.error('加載文章列表出錯:', err);
      setError(`加載文章列表失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('標題和內容不能為空');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (editingId) {
        await apiUpdatePost(editingId, { title, content });
      } else {
        await apiCreatePost({ title, content });
      }
      await fetchPosts();
      resetForm();
    } catch (err) {
      console.error('保存文章出錯:', err);
      setError(`保存文章失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這篇文章嗎？')) return;
    try {
      setLoading(true);
      setError(null);
      await apiDeletePost(id);
      await fetchPosts();
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('刪除文章出錯:', err);
      setError(`刪除文章失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-page">
      <div
        className="blog-meteors"
        style={{ transform: `rotate(${directionAngle}deg)` }}
      >
        {meteors.map((meteor) => (
          <span
            key={meteor.id}
            className="meteor"
            style={{
              top: `${meteor.top}%`,
              animationDuration: `${meteor.duration}s`,
              animationDelay: `${meteor.delay}s`,
            }}
          />
        ))}
      </div>
      <section className="blog-hero">
        <h1 className="blog-hero-title">我的個人博客</h1>
        <p className="blog-hero-subtitle">
          記錄當下的想法與靈感，一點點搭建屬於自己的網絡花園。
        </p>
      </section>

      <div className="blog-layout">
        <section className="blog-card blog-form">
          <h2 className="blog-card-title">
            {editingId ? '編輯文章' : '發表新文章'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="blog-form-field">
              <label>
                標題：
                <input
                  type="text"
                  className="blog-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="今天想記下些什麼？"
                />
              </label>
            </div>
            <div className="blog-form-field">
              <label>
                內容：
                <textarea
                  rows={6}
                  className="blog-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="隨便寫點筆記、想法或學到的東西吧～"
                />
              </label>
            </div>
            <div className="blog-form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {editingId ? '保存修改' : '發表文章'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  取消編輯
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="blog-card">
          {error && <p className="blog-error">{error}</p>}
          <h2 className="blog-section-title">文章列表</h2>
          {loading && <p className="blog-empty">正在加載...</p>}
          {!loading && posts.length === 0 && (
            <p className="blog-empty">暫時還沒有文章，先發一篇試試吧。</p>
          )}
          <ul className="blog-list">
            {posts.map((post) => (
              <li key={post.id} className="blog-post-card">
                <h3 className="blog-post-title">{post.title}</h3>
                <p className="blog-post-content">{post.content}</p>
                <div className="blog-meta">
                  創建於：{new Date(post.createdAt).toLocaleString()}
                  <br />
                  更新於：{new Date(post.updatedAt).toLocaleString()}
                </div>
                <div className="blog-post-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleEdit(post)}
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(post.id)}
                  >
                    刪除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default BlogPage;




