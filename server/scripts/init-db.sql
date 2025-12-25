-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS my_blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用该数据库
USE my_blog_db;

-- 创建博客文章表
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例数据
INSERT INTO posts (title, content) VALUES
('我的第一篇博客', '这是一个示例博客内容。'),
('学习 Node.js', '今天学习了如何用 Node.js 连接 MySQL 数据库。'),
('React 实践', '用 React 搭建了一个个人博客系统。');

-- 查看表结构
DESCRIBE posts;

-- 查看数据
SELECT * FROM posts;



