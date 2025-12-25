# 🗄️ 数据库连接指南

本项目使用 MySQL 作为数据存储，以下是完整的配置和使用步骤。

---

## 📋 前置准备

### 1. 确保 MySQL 已安装

```bash
# 检查 MySQL 版本
mysql --version

# 如果未安装，可以使用 Homebrew 安装（macOS）
brew install mysql

# 启动 MySQL 服务
brew services start mysql
```

### 2. 登录 MySQL

```bash
# 使用 root 用户登录
mysql -u root -p
```

---

## 🔧 数据库配置步骤

### 步骤 1：安装依赖

```bash
npm install mysql2 dotenv
```

### 步骤 2：配置数据库连接

在 `server/src/config/db.js` 中已经配置好了数据库连接：

```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '你的密码',
  database: process.env.DB_NAME || 'my_blog_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**重要提示**：请直接在 `db.js` 文件中修改密码，或者你可以创建 `.env` 文件（推荐）。

### 步骤 3：初始化数据库和表

运行以下 SQL 脚本创建数据库和表：

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
mysql -u root -p < server/scripts/init-db.sql
```

或者手动执行：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS my_blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用该数据库
USE my_blog_db;

-- 创建 posts 表
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
```

### 步骤 4：测试数据库连接

```bash
npm run db:test
```

你应该看到类似的输出：

```
🔍 正在测试数据库连接...

✅ 测试 1: 基本连接成功
   结果: 2

✅ 测试 2: 当前数据库
   数据库名: my_blog_db

✅ 测试 3: posts 表已存在
   表结构:
   - id: int
   - title: varchar(255)
   - content: text
   - created_at: timestamp
   - updated_at: timestamp
   数据量: 3 条

✅ 数据库连接测试完成！
```

### 步骤 5：启动后端服务

```bash
npm run server
```

你应该看到：

```
Server is running on port 5001
数据库连接池已初始化
✅ MySQL 连接成功！
```

---

## 📂 项目结构说明

```
server/
├── src/
│   ├── config/
│   │   └── db.js              # 数据库连接配置
│   ├── models/
│   │   ├── postStore.js       # 旧的内存存储（已废弃）
│   │   └── postRepository.js  # 新的数据库访问层
│   ├── services/
│   │   └── postService.js     # 业务逻辑层（已更新使用数据库）
│   ├── controllers/
│   │   └── postController.js  # 控制器层
│   └── routes/
│       └── postRoutes.js      # 路由层
├── scripts/
│   ├── init-db.sql            # 数据库初始化脚本
│   └── test-connection.js     # 数据库连接测试脚本
└── index.js                   # 入口文件
```

---

## 🔍 数据库操作示例

### 查询所有文章

```javascript
const postRepository = require('./src/models/postRepository');

const posts = await postRepository.listPosts();
console.log(posts);
```

### 创建新文章

```javascript
const newPost = await postRepository.createPost({
  title: '新文章标题',
  content: '文章内容...'
});
```

### 更新文章

```javascript
const updated = await postRepository.updatePost(1, {
  title: '更新后的标题',
  content: '更新后的内容'
});
```

### 删除文章

```javascript
const deleted = await postRepository.deletePost(1);
```

---

## ⚠️ 常见问题

### 问题 1：连接失败 (ECONNREFUSED)

**原因**：MySQL 服务未启动

**解决方法**：
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 问题 2：访问被拒绝 (Access denied)

**原因**：用户名或密码错误

**解决方法**：检查 `server/src/config/db.js` 中的配置

### 问题 3：数据库不存在

**原因**：未创建数据库

**解决方法**：运行初始化脚本 `server/scripts/init-db.sql`

### 问题 4：表不存在

**原因**：未创建 posts 表

**解决方法**：运行初始化脚本中的 CREATE TABLE 语句

---

## 🚀 部署到生产环境

### 1. 使用环境变量（推荐）

创建 `.env` 文件（不要提交到 Git）：

```env
DB_HOST=your-production-host.com
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=my_blog_db
PORT=5001
NODE_ENV=production
```

### 2. 配置云数据库

常见的云数据库服务：
- **AWS RDS** (MySQL)
- **Google Cloud SQL**
- **Azure Database for MySQL**
- **PlanetScale** (无服务器 MySQL)
- **Railway** (简单易用)

### 3. 连接池配置调优

生产环境建议增加连接池大小：

```javascript
const pool = mysql.createPool({
  // ...其他配置
  connectionLimit: 50,  // 增加到 50
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

---

## 📚 参考资源

- [mysql2 官方文档](https://github.com/sidorares/node-mysql2)
- [MySQL 8.0 文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ 完成检查清单

- [ ] MySQL 服务已启动
- [ ] 已安装 `mysql2` 和 `dotenv` 依赖
- [ ] 已配置 `server/src/config/db.js`
- [ ] 已运行 `init-db.sql` 创建数据库和表
- [ ] 运行 `npm run db:test` 测试通过
- [ ] 启动后端服务成功
- [ ] 前端可以正常进行 CRUD 操作

---

🎉 恭喜！你已经成功将项目从内存存储升级到 MySQL 数据库！



