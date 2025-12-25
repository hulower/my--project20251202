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
│   ├── models/
│   │   ├── postRepository.js  # 🗄️  数据访问层（与数据库交互）
│   │   └── postStore.js       # 📦 内存存储（已废弃，使用数据库替代）
│   ├── services/
│   │   └── postService.js     # 🧠 业务逻辑层（处理业务规则）
│   ├── controllers/
│   │   └── postController.js  # 🎮 控制器层（处理 HTTP 请求）
│   └── routes/
│       ├── healthRoutes.js    # 🏥 健康检查路由
│       └── postRoutes.js      # 📝 博客文章路由
├── scripts/
│   ├── init-db.sql            # 🛠️  数据库初始化脚本
│   └── test-connection.js     # 🔍 数据库连接测试脚本
└── DATABASE_GUIDE.md          # 📚 数据库配置指南
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

### 健康检查接口

| 方法 | 路径 | 说明 | 示例 |
|------|------|------|------|
| GET | `/api/hello` | 测试服务器是否正常 | `curl http://localhost:5001/api/hello` |
| GET | `/api/status` | 查看服务器状态 | `curl http://localhost:5001/api/status` |

### 博客文章接口

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/posts` | 获取所有文章 | - | `[{...}, {...}]` |
| GET | `/api/posts/:id` | 获取单篇文章 | - | `{id, title, content, ...}` |
| POST | `/api/posts` | 创建新文章 | `{title, content}` | `{id, title, content, ...}` |
| PUT | `/api/posts/:id` | 更新文章 | `{title, content}` | `{id, title, content, ...}` |
| DELETE | `/api/posts/:id` | 删除文章 | - | `{id, title, content, ...}` |

---

## 💾 数据库设计

### posts 表结构

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | INT | 主键，自增 | `1, 2, 3...` |
| `title` | VARCHAR(255) | 文章标题 | `"我的第一篇博客"` |
| `content` | TEXT | 文章内容 | `"这是内容..."` |
| `created_at` | TIMESTAMP | 创建时间 | `2024-12-25 10:00:00` |
| `updated_at` | TIMESTAMP | 更新时间 | `2024-12-25 11:30:00` |

---

## 🚀 快速开始

### 1. 启动 MySQL 服务
```bash
brew services start mysql
```

### 2. 初始化数据库
```bash
mysql -u root -p < server/scripts/init-db.sql
```

### 3. 测试数据库连接
```bash
npm run db:test
```

### 4. 启动后端服务
```bash
npm run server
```

### 5. 测试接口
```bash
# 测试健康检查
curl http://localhost:5001/api/hello

# 测试获取文章列表
curl http://localhost:5001/api/posts
```

---

## 🔧 常用命令

```bash
# 启动后端服务（开发环境）
npm run server

# 启动后端服务（生产环境）
npm run server:prod

# 同时启动前后端
npm run dev

# 测试数据库连接
npm run db:test
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
**A**: 可以：
1. 创建 `userRoutes.js`、`userController.js`、`userService.js`、`userRepository.js`
2. 创建 `authMiddleware.js` 中间件验证 Token
3. 在需要认证的路由上添加中间件

---

## 📞 需要帮助？

如果你有任何问题，可以：
1. 查看各个文件中的详细注释
2. 阅读 `DATABASE_GUIDE.md` 了解数据库配置
3. 查看控制台日志（每个请求都会有日志输出）

---

**祝你学习愉快！🎉**



