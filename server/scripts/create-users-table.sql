-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100),
  avatar_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认用户
INSERT INTO users (username, email, bio, avatar_url) VALUES
('博主', 'admin@myblog.com', '趁年轻，做自己想做的！', NULL)
ON DUPLICATE KEY UPDATE username = username;

-- 查看表结构
DESCRIBE users;

-- 查看数据
SELECT * FROM users;

