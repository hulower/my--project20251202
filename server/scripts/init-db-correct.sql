-- ============================================
-- 完整数据库初始化脚本（与实际代码完全匹配）
-- 项目需要 7 个表：users, music, posts, comments, likes, tags, post_tags
-- 基于实际运行的数据库结构生成
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `my_node-app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用该数据库
USE `my_node-app`;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  avatar_url VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  bio TEXT DEFAULT NULL COMMENT '个人简介',
  role ENUM('visitor', 'user', 'editor', 'admin') DEFAULT 'user' COMMENT '用户角色',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活',
  refresh_token VARCHAR(500) DEFAULT NULL COMMENT '刷新令牌',
  last_login TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 音乐表 (music) - 必须在 posts 表之前创建
-- ============================================
CREATE TABLE IF NOT EXISTS music (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '音乐ID',
  title VARCHAR(255) NOT NULL COMMENT '歌曲标题',
  artist VARCHAR(255) DEFAULT '未知艺术家' COMMENT '艺术家',
  album VARCHAR(255) DEFAULT NULL COMMENT '专辑名称',
  file_path VARCHAR(500) NOT NULL COMMENT '音乐文件路径',
  cover_path VARCHAR(500) DEFAULT NULL COMMENT '封面图片路径',
  duration INT DEFAULT 0 COMMENT '时长（秒）',
  file_size BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  format VARCHAR(10) DEFAULT 'mp3' COMMENT '文件格式（mp3/wav/ogg）',
  play_count INT DEFAULT 0 COMMENT '播放次数',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  lyrics TEXT DEFAULT NULL COMMENT '歌词内容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_title (title),
  INDEX idx_artist (artist),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='音乐表';

-- ============================================
-- 3. 博客文章表 (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
  title VARCHAR(255) NOT NULL COMMENT '文章标题',
  slug VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL友好的唯一标识',
  content TEXT NOT NULL COMMENT '文章内容',
  category VARCHAR(50) NOT NULL DEFAULT '技术博客' COMMENT '文章分类',
  cover_image VARCHAR(500) DEFAULT NULL COMMENT '封面图片路径',
  music_id INT DEFAULT NULL COMMENT '关联的音乐ID',
  view_count INT DEFAULT 0 COMMENT '浏览次数',
  likes_count INT DEFAULT 0 COMMENT '点赞数',
  comments_count INT DEFAULT 0 COMMENT '评论数',
  summary TEXT DEFAULT NULL COMMENT 'AI 摘要',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_music_id (music_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_posts_music FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ============================================
-- 4. 评论表 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
  post_id INT NOT NULL COMMENT '文章ID',
  user_id INT NOT NULL COMMENT '用户ID',
  parent_id INT DEFAULT NULL COMMENT '父评论ID（用于回复功能）',
  content TEXT NOT NULL COMMENT '评论内容',
  os VARCHAR(50) DEFAULT NULL COMMENT '操作系统信息',
  browser VARCHAR(50) DEFAULT NULL COMMENT '浏览器信息',
  location VARCHAR(100) DEFAULT NULL COMMENT '地理位置',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT comments_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_3 FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 5. 点赞表 (likes)
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
  post_id INT NOT NULL COMMENT '文章ID',
  user_id INT NOT NULL COMMENT '点赞用户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  UNIQUE KEY unique_user_post (user_id, post_id),
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  CONSTRAINT likes_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT likes_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ============================================
-- 6. 标签表 (tags)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  slug VARCHAR(50) NOT NULL UNIQUE COMMENT '标签别名',
  description TEXT DEFAULT NULL COMMENT '标签描述',
  color VARCHAR(20) DEFAULT '#3B82F6' COMMENT '标签颜色（用于前端显示）',
  posts_count INT DEFAULT 0 COMMENT '使用该标签的文章数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY name (name),
  UNIQUE KEY slug (slug),
  INDEX idx_name (name),
  INDEX idx_slug (slug),
  INDEX idx_posts_count (posts_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- ============================================
-- 7. 文章标签关联表 (post_tags)
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
  post_id INT NOT NULL COMMENT '文章ID',
  tag_id INT NOT NULL COMMENT '标签ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY unique_post_tag (post_id, tag_id) COMMENT '确保一篇文章不会重复添加同一个标签',
  INDEX idx_post_id (post_id),
  INDEX idx_tag_id (tag_id),
  CONSTRAINT post_tags_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT post_tags_ibfk_2 FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- ============================================
-- 插入初始数据
-- ============================================

-- 插入测试用户（密码：admin123，需要通过注册接口创建）
-- 这里只插入基本信息，实际使用需要通过注册接口
INSERT INTO users (username, email, password, bio, role) VALUES
('admin', 'admin@example.com', '$2b$10$dummy.password.hash.for.initial.setup.only', '系统管理员', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- 插入示例文章
INSERT INTO posts (title, slug, content, category) VALUES
('欢迎来到我的博客', 'welcome-to-my-blog', '# 欢迎\n\n这是我的第一篇博客。', '说说'),
('Node.js 学习笔记', 'nodejs-learning-notes', '# Node.js 基础\n\n学习笔记...', '技术博客')
ON DUPLICATE KEY UPDATE title = title;

-- ============================================
-- 验证创建
-- ============================================
SHOW TABLES;
SELECT '✅ 数据库初始化完成！' as message;

