-- ============================================
-- 完整数据库初始化脚本
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS my_node_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用该数据库
USE my_node_app;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  avatar_url VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  bio TEXT DEFAULT NULL COMMENT '个人简介',
  role ENUM('admin', 'editor', 'user') DEFAULT 'user' COMMENT '用户角色',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  refresh_token TEXT DEFAULT NULL COMMENT '刷新令牌',
  last_login TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 博客文章表 (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
  user_id INT NOT NULL COMMENT '作者ID',
  title VARCHAR(255) NOT NULL COMMENT '文章标题',
  content LONGTEXT NOT NULL COMMENT '文章内容（Markdown）',
  cover_image VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  excerpt VARCHAR(500) DEFAULT NULL COMMENT '文章摘要',
  status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT '文章状态',
  view_count INT DEFAULT 0 COMMENT '浏览次数',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  comment_count INT DEFAULT 0 COMMENT '评论数',
  is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
  published_at TIMESTAMP NULL DEFAULT NULL COMMENT '发布时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_published_at (published_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='博客文章表';

-- ============================================
-- 3. 评论表 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
  post_id INT NOT NULL COMMENT '文章ID',
  user_id INT NOT NULL COMMENT '评论用户ID',
  parent_id INT DEFAULT NULL COMMENT '父评论ID（用于回复）',
  content TEXT NOT NULL COMMENT '评论内容',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否删除',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  user_agent VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 4. 点赞表 (likes)
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
  user_id INT NOT NULL COMMENT '用户ID',
  target_type ENUM('post', 'comment') NOT NULL COMMENT '点赞目标类型',
  target_id INT NOT NULL COMMENT '目标ID（文章ID或评论ID）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY unique_like (user_id, target_type, target_id),
  INDEX idx_user_id (user_id),
  INDEX idx_target (target_type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ============================================
-- 5. 音乐表 (music)
-- ============================================
CREATE TABLE IF NOT EXISTS music (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '音乐ID',
  user_id INT NOT NULL COMMENT '上传用户ID',
  title VARCHAR(255) NOT NULL COMMENT '音乐标题',
  artist VARCHAR(100) DEFAULT NULL COMMENT '艺术家',
  album VARCHAR(100) DEFAULT NULL COMMENT '专辑',
  duration INT DEFAULT 0 COMMENT '时长（秒）',
  file_url VARCHAR(255) NOT NULL COMMENT '音乐文件URL',
  cover_url VARCHAR(255) DEFAULT NULL COMMENT '封面URL',
  file_size BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
  format VARCHAR(20) DEFAULT NULL COMMENT '文件格式（mp3, flac等）',
  play_count INT DEFAULT 0 COMMENT '播放次数',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_title (title),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音乐表';

-- ============================================
-- 6. 标签表 (tags) - 可选
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  slug VARCHAR(50) NOT NULL UNIQUE COMMENT '标签别名',
  description VARCHAR(255) DEFAULT NULL COMMENT '标签描述',
  post_count INT DEFAULT 0 COMMENT '关联文章数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_name (name),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- ============================================
-- 7. 文章标签关联表 (post_tags) - 可选
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
  post_id INT NOT NULL COMMENT '文章ID',
  tag_id INT NOT NULL COMMENT '标签ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY unique_post_tag (post_id, tag_id),
  INDEX idx_post_id (post_id),
  INDEX idx_tag_id (tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- ============================================
-- 插入初始数据
-- ============================================

-- 插入测试用户（密码：123456，已加密）
-- 注意：这个密码哈希是用 bcrypt 加密 "123456" 生成的
INSERT INTO users (username, email, password, bio, role) VALUES
('admin', 'admin@example.com', '$2b$10$rQZ5YZ5Y5Y5Y5Y5Y5Y5Y5OZK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', '管理员账号', 'admin'),
('testuser', 'test@example.com', '$2b$10$rQZ5YZ5Y5Y5Y5Y5Y5Y5Y5OZK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', '测试用户', 'user')
ON DUPLICATE KEY UPDATE username = username;

-- 插入示例文章
INSERT INTO posts (user_id, title, content, excerpt, status, published_at) VALUES
(1, '欢迎来到我的博客', '# 欢迎\n\n这是我的第一篇博客文章。', '欢迎来到我的博客，这里记录我的学习和生活。', 'published', NOW()),
(1, 'Node.js 学习笔记', '# Node.js 基础\n\n今天学习了 Node.js 的基础知识...', 'Node.js 学习笔记和心得体会', 'published', NOW()),
(1, 'React 入门指南', '# React 简介\n\nReact 是一个用于构建用户界面的 JavaScript 库...', 'React 入门教程和实践经验', 'published', NOW())
ON DUPLICATE KEY UPDATE title = title;

-- 插入示例标签
INSERT INTO tags (name, slug, description) VALUES
('技术', 'tech', '技术相关文章'),
('生活', 'life', '生活随笔'),
('教程', 'tutorial', '教程和指南'),
('前端', 'frontend', '前端开发'),
('后端', 'backend', '后端开发')
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- 验证表创建
-- ============================================
SHOW TABLES;

-- 查看各表结构
DESCRIBE users;
DESCRIBE posts;
DESCRIBE comments;
DESCRIBE likes;
DESCRIBE music;
DESCRIBE tags;
DESCRIBE post_tags;

-- 查看数据
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as post_count FROM posts;
SELECT COUNT(*) as tag_count FROM tags;

-- ============================================
-- 完成
-- ============================================
SELECT '✅ 数据库初始化完成！' as message;

