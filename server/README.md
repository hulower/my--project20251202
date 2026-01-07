# 🚀 后端架构说明文档

这份文档帮助你快速理解整个后端项目的结构和工作原理。

---

## 📂 项目结构

```
server/
├── index.js                    # 🎯 入口文件（启动服务器）
├── src/
│   ├── app.js                 # ⚙️  Express 应用配置
│   ├── config/
│   │   └── db.js              # 💾 数据库连接配置
│   ├── models/                # 🗄️  数据访问层（Repository）
│   │   ├── commentRepository.js
│   │   ├── likeRepository.js
│   │   ├── musicRepository.js
│   │   ├── postRepository.js
│   │   ├── tagRepository.js
│   │   └── userRepository.js
│   ├── services/              # 🧠 业务逻辑层
│   │   ├── authService.js
│   │   ├── commentService.js
│   │   ├── likeService.js
│   │   ├── musicService.js
│   │   ├── postService.js
│   │   ├── tagService.js
│   │   ├── uploadService.js
│   │   └── userService.js
│   ├── controllers/           # 🎮 控制器层
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── likeController.js
│   │   ├── musicController.js
│   │   ├── postController.js
│   │   ├── tagController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── middleware/            # 🔧 中间件
│   │   ├── authMiddleware.js
│   │   ├── contentImageUpload.js
│   │   ├── musicUpload.js
│   │   └── postCoverUpload.js
│   ├── routes/                # 🛣️  路由层
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── likeRoutes.js
│   │   ├── musicRoutes.js
│   │   ├── postRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   └── utils/                 # 🛠️  工具函数
│       ├── geoip.js
│       ├── jwt.js
│       ├── password.js
│       └── response.js
├── scripts/
│   └── init-db-correct.sql    # 🛠️  数据库初始化脚本（完整版，7个表）
├── uploads/                   # 📁 用户上传文件存储
│   ├── avatars/               # 用户头像
│   ├── content/images/        # 文章内容图片
│   ├── music/                 # 音乐文件和封面
│   └── posts/covers/          # 文章封面
├── ARCHITECTURE.md            # 📚 架构设计详解
├── DATABASE_GUIDE.md          # 📚 数据库配置指南
└── README.md                  # 📖 本文件
```

---

## 🏗️ 三层架构设计

这个项目采用经典的**三层架构**（Three-Layer Architecture），职责清晰、易于维护：

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│                  http://localhost:3000                      │
└─────────────────────────────────────────────────────────────┘
                              ↕️ HTTP 请求
┌─────────────────────────────────────────────────────────────┐
│                   后端 (Node.js + Express)                  │
│                  http://localhost:5001                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  1. Routes 层 (路由层)                               │   │
│  │  - 定义 URL 路径和 HTTP 方法                         │   │
│  │  - 将请求分发到对应的 Controller                     │   │
│  │  📄 postRoutes.js, healthRoutes.js                  │   │
│  └────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │  2. Controller 层 (控制器层)                         │   │
│  │  - 接收 HTTP 请求                                    │   │
│  │  - 提取请求参数                                      │   │
│  │  - 调用 Service 层                                   │   │
│  │  - 返回 HTTP 响应                                    │   │
│  │  📄 postController.js                               │   │
│  └────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │  3. Service 层 (业务逻辑层)                          │   │
│  │  - 处理业务逻辑                                      │   │
│  │  - 数据验证                                          │   │
│  │  - 权限检查                                          │   │
│  │  - 调用 Repository 层                               │   │
│  │  📄 postService.js                                  │   │
│  └────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │  4. Repository 层 (数据访问层)                       │   │
│  │  - 执行 SQL 查询                                     │   │
│  │  - 与数据库交互                                      │   │
│  │  - 数据格式转换                                      │   │
│  │  📄 postRepository.js                               │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕️ SQL 查询
┌─────────────────────────────────────────────────────────────┐
│                    MySQL 数据库                              │
│                   my_node_app                               │
│                   表: posts                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 请求处理流程

### 示例：前端请求获取文章列表

```
1. 前端发起请求
   GET http://localhost:5001/api/posts

2. Express 接收请求 (server/index.js)
   ↓

3. CORS 中间件检查 (src/app.js)
   - 验证请求来源是否允许
   ↓

4. 路由匹配 (src/routes/postRoutes.js)
   - 匹配到 GET / -> postController.listPosts
   ↓

5. Controller 处理 (src/controllers/postController.js)
   - 记录日志
   - 调用 postService.getAllPosts()
   ↓

6. Service 处理业务逻辑 (src/services/postService.js)
   - (这里没有额外的业务逻辑)
   - 调用 postRepository.listPosts()
   ↓

7. Repository 查询数据库 (src/models/postRepository.js)
   - 执行 SQL: SELECT * FROM posts ORDER BY created_at DESC
   - 将数据库字段名转换为驼峰命名
   ↓

8. MySQL 数据库 (my_node_app.posts)
   - 返回查询结果
   ↓

9. 层层返回
   Repository -> Service -> Controller
   ↓

10. Controller 返回 JSON 响应
    res.json([{ id: 1, title: "...", ... }])
    ↓

11. 前端接收数据
    显示在页面上
```

---

## 📝 各层职责详解

### 1. Routes 层（路由层）
**文件**: `src/routes/postRoutes.js`, `src/routes/healthRoutes.js`

**职责**:
- 定义 URL 路径和 HTTP 方法的映射
- 将请求分发到对应的 Controller

**比喻**: 就像公司的前台接待，知道不同的问题该找哪个部门

**示例**:
```javascript
router.get('/', postController.listPosts);
// 意思：当收到 GET /api/posts 请求时，调用 listPosts 函数
```

---

### 2. Controller 层（控制器层）
**文件**: `src/controllers/postController.js`

**职责**:
- 接收 HTTP 请求
- 提取请求参数（路径参数、查询参数、请求体）
- 调用 Service 层处理业务
- 将结果转换为 HTTP 响应

**比喻**: 就像餐厅的服务员，接收顾客点单，交给厨房，再把菜端给顾客

**示例**:
```javascript
async function listPosts(req, res, next) {
  const posts = await postService.getAllPosts(); // 调用 Service
  res.json(posts); // 返回响应
}
```

---

### 3. Service 层（业务逻辑层）
**文件**: `src/services/postService.js`

**职责**:
- 处理业务逻辑
- 数据验证（比如检查标题和内容不能为空）
- 权限检查（比如检查用户是否有权限删除文章）
- 调用 Repository 层获取或保存数据

**比喻**: 就像餐厅的厨房，负责按照菜谱做菜，确保菜品质量

**示例**:
```javascript
async createPost({ title, content }) {
  // 业务逻辑：验证数据
  if (!title || !content) {
    throw new Error('标题和内容不能为空');
  }
  // 调用 Repository 保存数据
  return await postRepository.createPost({ title, content });
}
```

---

### 4. Repository 层（数据访问层）
**文件**: `src/models/postRepository.js`

**职责**:
- 直接与数据库交互
- 执行 SQL 查询（增删改查）
- 将数据库字段名转换为前端友好的驼峰命名

**比喻**: 就像仓库管理员，负责从仓库存取货物

**示例**:
```javascript
async function listPosts() {
  const [rows] = await db.query('SELECT * FROM posts');
  return rows;
}
```

---

## 🛣️ API 接口列表

### 认证接口 `/api/auth`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/register` | 用户注册 | 公开 |
| POST | `/login` | 用户登录 | 公开 |
| POST | `/refresh` | 刷新 Token | 公开 |
| POST | `/logout` | 用户登出 | 需登录 |

### 用户接口 `/api/users`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/profile` | 获取当前用户信息 | 需登录 |
| PUT | `/profile` | 更新用户信息 | 需登录 |
| POST | `/avatar` | 上传头像 | 需登录 |

### 文章接口 `/api/posts`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/` | 获取文章列表 | 公开 |
| GET | `/:id` | 获取文章详情 | 公开 |
| GET | `/slug/:slug` | 通过 slug 获取文章 | 公开 |
| POST | `/` | 创建文章 | editor+ |
| PUT | `/:id` | 更新文章 | editor+ |
| DELETE | `/:id` | 删除文章 | editor+ |

### 评论接口 `/api/comments`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/post/:postId` | 获取文章评论 | 公开 |
| POST | `/` | 发表评论 | user+ |
| DELETE | `/:id` | 删除评论 | admin |

### 点赞接口 `/api/likes`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/` | 点赞文章 | user+ |
| DELETE | `/post/:postId` | 取消点赞 | user+ |
| GET | `/post/:postId/status` | 获取点赞状态 | user+ |

### 音乐接口 `/api/music`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/list` | 获取音乐列表 | 公开 |
| GET | `/:id` | 获取音乐详情 | 公开 |
| POST | `/upload` | 上传音乐 | editor+ |
| PUT | `/:id` | 更新音乐信息 | editor+ |
| DELETE | `/:id` | 删除音乐 | editor+ |

### 标签接口 `/api/tags`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/` | 获取标签列表 | 公开 |
| GET | `/:id` | 获取标签详情 | 公开 |
| POST | `/` | 创建标签 | admin |
| PUT | `/:id` | 更新标签 | admin |
| DELETE | `/:id` | 删除标签 | admin |

### 上传接口 `/api/upload`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/image` | 上传图片 | user+ |
| POST | `/avatar` | 上传头像 | user+ |

### 健康检查 `/api`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/health` | 服务健康检查 | 公开 |
| GET | `/status` | 服务状态 | 公开 |

---

## 💾 数据库设计

### 数据表概览

项目使用 **7 个数据表**：

| 表名 | 说明 | 主要功能 |
|------|------|---------|
| `users` | 用户表 | 用户认证、角色权限 |
| `posts` | 文章表 | 博客文章、分类、标签 |
| `comments` | 评论表 | 文章评论、嵌套回复 |
| `likes` | 点赞表 | 文章点赞记录 |
| `music` | 音乐表 | 音乐文件、歌词 |
| `tags` | 标签表 | 文章标签管理 |
| `post_tags` | 文章标签关联表 | 多对多关系 |

### 核心表结构示例

#### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT | 主键 |
| `username` | VARCHAR(50) | 用户名（唯一） |
| `email` | VARCHAR(100) | 邮箱 |
| `password` | VARCHAR(255) | 密码（bcrypt 加密） |
| `role` | ENUM | visitor/user/editor/admin |
| `avatar_url` | VARCHAR(255) | 头像 URL |

#### posts 表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT | 主键 |
| `title` | VARCHAR(255) | 文章标题 |
| `slug` | VARCHAR(255) | URL 友好标识（唯一） |
| `content` | TEXT | 文章内容 |
| `category` | VARCHAR(50) | 分类（技术博客/说说/学习笔记） |
| `cover_image` | VARCHAR(500) | 封面图片 |
| `music_id` | INT | 关联音乐 ID |
| `view_count` | INT | 浏览量 |
| `likes_count` | INT | 点赞数 |
| `comments_count` | INT | 评论数 |

#### music 表
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT | 主键 |
| `title` | VARCHAR(255) | 歌曲标题 |
| `artist` | VARCHAR(255) | 艺术家 |
| `file_path` | VARCHAR(500) | 音乐文件路径 |
| `cover_path` | VARCHAR(500) | 封面图片路径 |
| `lyrics` | TEXT | 歌词内容（LRC 格式） |
| `duration` | INT | 时长（秒） |
| `play_count` | INT | 播放次数 |

**完整数据库设计**请查看 `DATABASE_GUIDE.md` 和 `init-db-correct.sql`

---

## 🚀 快速开始

### 1. 启动 MySQL 服务
```bash
# macOS
brew services start mysql

# Linux
systemctl start mysql
```

### 2. 初始化数据库
```bash
# 方式 1：命令行导入
mysql -u root -p < server/scripts/init-db-correct.sql

# 方式 2：MySQL 客户端
mysql -u root -p
mysql> source /path/to/server/scripts/init-db-correct.sql;

# 方式 3：宝塔面板
# 进入数据库管理 -> 导入 -> 选择 init-db-correct.sql
```

### 3. 配置环境变量
```bash
# 在项目根目录创建 .env 文件
vim .env
```

**必需的环境变量**：
```env
DB_HOST=127.0.0.1
DB_USER=my_node-app
DB_PASSWORD=your_password
DB_NAME=my_node-app
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
PORT=5001
API_BASE_URL=http://localhost:5001
```

### 4. 启动后端服务
```bash
npm run server
```

### 5. 测试接口
```bash
# 测试健康检查
curl http://localhost:5001/api/health

# 测试获取文章列表
curl http://localhost:5001/api/posts

# 测试用户注册
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

---

## 🔧 常用命令

```bash
# 📦 依赖管理
npm install                    # 安装依赖
npm update                     # 更新依赖

# 🚀 开发环境
npm run server                 # 启动后端服务（开发环境）
npm run dev                    # 同时启动前后端

# 🏗️ 生产环境
npm run server:prod            # 启动后端服务（生产环境）
pm2 start server/index.js --name blog-backend  # PM2 启动
pm2 logs blog-backend          # 查看日志
pm2 restart blog-backend       # 重启服务
pm2 stop blog-backend          # 停止服务

# 🔍 调试
curl http://localhost:5001/api/health  # 测试后端健康状态
```

---

## 📚 学习资源

### 三层架构
- Controller -> Service -> Repository
- 职责分离，易于维护和测试

### RESTful API
- GET: 查询
- POST: 创建
- PUT: 更新
- DELETE: 删除

### 设计模式
- Repository Pattern（仓库模式）
- Service Pattern（服务模式）
- MVC Pattern（Model-View-Controller）

---

## 💡 常见问题

### Q1: 为什么要分这么多层？
**A**: 职责分离，让每一层只做自己的事情：
- **Controller**: 只负责接收请求和返回响应
- **Service**: 只负责业务逻辑
- **Repository**: 只负责数据存取

这样代码更清晰，更容易维护和测试。

### Q2: 如果要换数据库，要改哪些文件？
**A**: 只需要改 `postRepository.js`，其他文件都不用改。这就是分层架构的好处！

### Q3: 如何添加新的 API 接口？
**A**: 按照以下步骤：
1. 在 `postRoutes.js` 添加路由
2. 在 `postController.js` 添加控制器函数
3. 在 `postService.js` 添加业务逻辑
4. 在 `postRepository.js` 添加数据库操作（如果需要）

### Q4: 如何添加用户认证？
**A**: 项目已经实现了完整的用户认证系统：
1. ✅ JWT 双 Token 认证（Access Token + Refresh Token）
2. ✅ 角色权限管理（visitor / user / editor / admin）
3. ✅ `authMiddleware.js` 中间件验证 Token
4. ✅ 在需要认证的路由上已添加中间件

查看 `src/routes/authRoutes.js` 和 `src/middleware/authMiddleware.js` 了解实现细节。

---

## 📞 需要帮助？

如果你有任何问题，可以：
1. 查看各个文件中的详细注释
2. 阅读 `DATABASE_GUIDE.md` 了解数据库配置
3. 查看控制台日志（每个请求都会有日志输出）

---

**祝你学习愉快！🎉**



