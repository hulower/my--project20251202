# 🏛️ 后端架构详解

这份文档用图解的方式帮助你理解后端的工作原理。

---

## 📊 完整的数据流向图

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                      │
│                     http://localhost:3000/blog                            │
│                                                                            │
│  [发表文章] 按钮被点击                                                        │
│  ↓                                                                         │
│  前端调用 API:                                                              │
│  fetch('http://localhost:5001/api/posts', {                              │
│    method: 'POST',                                                        │
│    body: JSON.stringify({ title: "标题", content: "内容" })               │
│  })                                                                        │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓ HTTP POST 请求
┌───────────────────────────────────────────────────────────────────────────┐
│                          Express 服务器                                     │
│                      http://localhost:5001                                │
│                                                                            │
│  📍 步骤 1: 请求到达 server/index.js                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  const app = createApp();                                        │    │
│  │  app.listen(5001);  // 服务器在 5001 端口监听                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                       │
│  📍 步骤 2: 通过 CORS 中间件 (src/app.js)                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  app.use(cors({                                                  │    │
│  │    origin: 'http://localhost:3000'  // 允许前端访问              │    │
│  │  }));                                                            │    │
│  │  app.use(express.json());  // 解析 JSON 请求体                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                       │
│  📍 步骤 3: 路由匹配 (src/routes/postRoutes.js)                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  POST /api/posts -> postController.createPost                   │    │
│  │                                                                  │    │
│  │  路由表:                                                          │    │
│  │  GET    /api/posts      -> listPosts                            │    │
│  │  GET    /api/posts/:id  -> getPost                              │    │
│  │  POST   /api/posts      -> createPost   ← 匹配这里！             │    │
│  │  PUT    /api/posts/:id  -> updatePost                           │    │
│  │  DELETE /api/posts/:id  -> deletePost                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                       │
│  📍 步骤 4: Controller 处理 (src/controllers/postController.js)           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  async function createPost(req, res, next) {                    │    │
│  │    console.log('收到请求:', req.body);                           │    │
│  │    // req.body = { title: "标题", content: "内容" }             │    │
│  │                                                                  │    │
│  │    const created = await postService.createPost(req.body);      │    │
│  │    res.status(201).json(created);  // 返回 201 Created          │    │
│  │  }                                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                       │
│  📍 步骤 5: Service 业务逻辑 (src/services/postService.js)                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  async createPost({ title, content }) {                         │    │
│  │    // 业务验证                                                   │    │
│  │    if (!title || !content) {                                    │    │
│  │      throw new Error('标题和内容不能为空');                       │    │
│  │    }                                                             │    │
│  │                                                                  │    │
│  │    // 调用数据访问层                                              │    │
│  │    return await postRepository.createPost({ title, content });  │    │
│  │  }                                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                       │
│  📍 步骤 6: Repository 数据访问 (src/models/postRepository.js)            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  async function createPost({ title, content }) {                │    │
│  │    // 执行 SQL 插入                                              │    │
│  │    const [result] = await db.query(                             │    │
│  │      'INSERT INTO posts (title, content) VALUES (?, ?)',        │    │
│  │      [title, content]                                           │    │
│  │    );                                                            │    │
│  │                                                                  │    │
│  │    // 返回新创建的文章（包含自动生成的 id）                        │    │
│  │    return findPostById(result.insertId);                        │    │
│  │  }                                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓ SQL 查询
┌───────────────────────────────────────────────────────────────────────────┐
│                            MySQL 数据库                                     │
│                         my_node_app.posts                                 │
│                                                                            │
│  执行 SQL:                                                                 │
│  INSERT INTO posts (title, content) VALUES ('标题', '内容');              │
│                                                                            │
│  posts 表:                                                                 │
│  ┌────┬──────┬──────┬────────────────────┬────────────────────┐         │
│  │ id │ title│content│ created_at         │ updated_at         │         │
│  ├────┼──────┼──────┼────────────────────┼────────────────────┤         │
│  │ 1  │ ...  │ ...  │ 2024-12-25 10:00   │ 2024-12-25 10:00   │         │
│  │ 2  │ ...  │ ...  │ 2024-12-25 11:00   │ 2024-12-25 11:00   │         │
│  │ 3  │ 标题  │ 内容  │ 2024-12-25 12:00   │ 2024-12-25 12:00   │ ← 新    │
│  └────┴──────┴──────┴────────────────────┴────────────────────┘         │
│                                                                            │
│  返回: insertId = 3                                                        │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓ 查询结果
┌───────────────────────────────────────────────────────────────────────────┐
│                          Express 服务器                                     │
│                                                                            │
│  📍 步骤 7: Repository 返回完整数据                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  const newPost = await findPostById(3);                         │    │
│  │  // 返回:                                                        │    │
│  │  {                                                               │    │
│  │    id: 3,                                                        │    │
│  │    title: "标题",                                                │    │
│  │    content: "内容",                                              │    │
│  │    createdAt: "2024-12-25T12:00:00.000Z",                       │    │
│  │    updatedAt: "2024-12-25T12:00:00.000Z"                        │    │
│  │  }                                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                       │
│  📍 步骤 8: Service 返回给 Controller                                      │
│  📍 步骤 9: Controller 返回 HTTP 响应                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  res.status(201).json(newPost);                                 │    │
│  │  // HTTP/1.1 201 Created                                        │    │
│  │  // Content-Type: application/json                              │    │
│  │  // { id: 3, title: "标题", ... }                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓ HTTP 响应
┌───────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                      │
│                                                                            │
│  前端接收响应:                                                              │
│  {                                                                         │
│    id: 3,                                                                 │
│    title: "标题",                                                          │
│    content: "内容",                                                        │
│    createdAt: "2024-12-25T12:00:00.000Z",                                │
│    updatedAt: "2024-12-25T12:00:00.000Z"                                 │
│  }                                                                         │
│                                                                            │
│  前端更新页面，显示新文章 ✅                                                  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 各层的类比

### 🏪 比喻 1: 开餐厅

| 层 | 餐厅角色 | 职责 |
|----|---------|------|
| **Routes** | 门牌号 | 告诉顾客去哪个窗口 |
| **Controller** | 服务员 | 接收点单，端菜 |
| **Service** | 厨师长 | 检查食材，决定怎么做 |
| **Repository** | 仓库管理员 | 去仓库取食材 |
| **Database** | 仓库 | 存放食材 |

**流程**:
1. 顾客看门牌号找到餐厅 (Routes)
2. 服务员接待并记录点单 (Controller)
3. 厨师长检查食材是否够，决定怎么烹饪 (Service)
4. 仓库管理员去仓库取食材 (Repository)
5. 从仓库拿出食材 (Database)
6. 做好菜 -> 服务员端给顾客 -> 顾客吃到菜 ✅

---

### 🏢 比喻 2: 公司办事

| 层 | 公司角色 | 职责 |
|----|---------|------|
| **Routes** | 前台 | 告诉你找哪个部门 |
| **Controller** | 部门接待 | 接收申请表，返回处理结果 |
| **Service** | 部门经理 | 审核申请，做决策 |
| **Repository** | 档案室管理员 | 查找和存储文件 |
| **Database** | 档案室 | 存放文件 |

**流程**:
1. 你去公司前台："我要办理业务" (Routes)
2. 前台："请去 3 楼业务部" (Routes 分发)
3. 业务部接待："请填写这个表格" (Controller 接收)
4. 经理审核："材料齐全，可以办理" (Service 验证)
5. 档案室管理员："帮你存档了" (Repository 存储)
6. 档案室：文件存入柜子 (Database)
7. 层层返回，你拿到办理结果 ✅

---

## 📁 文件职责速查表

| 文件 | 作用 | 核心代码 | 何时修改 |
|------|------|---------|---------|
| **server/index.js** | 启动服务器 | `app.listen(PORT)` | 基本不需要改 |
| **src/app.js** | 配置 Express | `app.use(cors())` | 添加全局中间件时 |
| **src/config/db.js** | 数据库连接 | `mysql.createPool()` | 修改数据库配置时 |
| **src/routes/*.js** | 定义路由 | `router.get('/', ...)` | 添加新接口时 |
| **src/controllers/*.js** | 处理请求 | `res.json(data)` | 修改请求/响应格式时 |
| **src/services/*.js** | 业务逻辑 | `if (!title) throw ...` | 修改业务规则时 |
| **src/models/*.js** | 数据访问 | `db.query('SELECT ...')` | 修改数据库查询时 |

---

## 🔄 增删改查（CRUD）完整流程

### 📖 查询所有文章 (Read - List)

```
前端: GET /api/posts

Routes: router.get('/', listPosts)
  ↓
Controller: listPosts()
  - 调用 postService.getAllPosts()
  ↓
Service: getAllPosts()
  - 调用 postRepository.listPosts()
  ↓
Repository: listPosts()
  - SQL: SELECT * FROM posts ORDER BY created_at DESC
  ↓
Database: 返回所有文章
  ↓
层层返回
  ↓
前端: 收到文章数组 [{...}, {...}, ...]
```

---

### 📖 查询单篇文章 (Read - Detail)

```
前端: GET /api/posts/1

Routes: router.get('/:id', getPost)
  ↓
Controller: getPost(req, res, next)
  - id = req.params.id = 1
  - 调用 postService.getPostById(1)
  ↓
Service: getPostById(1)
  - 调用 postRepository.findPostById(1)
  - 如果找不到，抛出 404 错误
  ↓
Repository: findPostById(1)
  - SQL: SELECT * FROM posts WHERE id = 1
  ↓
Database: 返回文章或 null
  ↓
层层返回或抛出错误
  ↓
前端: 收到文章 {id: 1, ...} 或 404 错误
```

---

### ✏️ 创建文章 (Create)

```
前端: POST /api/posts
      Body: { title: "标题", content: "内容" }

Routes: router.post('/', createPost)
  ↓
Controller: createPost(req, res, next)
  - body = req.body = { title: "标题", content: "内容" }
  - 调用 postService.createPost(body)
  ↓
Service: createPost({ title, content })
  - 验证: if (!title || !content) 抛出 400 错误
  - 调用 postRepository.createPost({ title, content })
  ↓
Repository: createPost({ title, content })
  - SQL: INSERT INTO posts (title, content) VALUES (?, ?)
  - 获取 insertId
  - SQL: SELECT * FROM posts WHERE id = insertId
  ↓
Database: 插入数据，返回完整文章
  ↓
层层返回
  ↓
前端: 收到新文章 {id: 3, title: "标题", ...}，状态码 201
```

---

### 🔄 更新文章 (Update)

```
前端: PUT /api/posts/1
      Body: { title: "新标题", content: "新内容" }

Routes: router.put('/:id', updatePost)
  ↓
Controller: updatePost(req, res, next)
  - id = req.params.id = 1
  - body = req.body = { title: "新标题", content: "新内容" }
  - 调用 postService.updatePost(1, body)
  ↓
Service: updatePost(1, { title, content })
  - 调用 postRepository.updatePost(1, { title, content })
  - 如果找不到，抛出 404 错误
  ↓
Repository: updatePost(1, { title, content })
  - SQL: UPDATE posts SET title=?, content=? WHERE id=1
  - 如果 affectedRows = 0，返回 null
  - SQL: SELECT * FROM posts WHERE id = 1
  ↓
Database: 更新数据，返回更新后的文章
  ↓
层层返回
  ↓
前端: 收到更新后的文章 {id: 1, title: "新标题", ...}
```

---

### 🗑️ 删除文章 (Delete)

```
前端: DELETE /api/posts/1

Routes: router.delete('/:id', deletePost)
  ↓
Controller: deletePost(req, res, next)
  - id = req.params.id = 1
  - 调用 postService.deletePost(1)
  ↓
Service: deletePost(1)
  - 调用 postRepository.deletePost(1)
  - 如果找不到，抛出 404 错误
  ↓
Repository: deletePost(1)
  - SQL: SELECT * FROM posts WHERE id = 1 (先查询)
  - 如果找不到，返回 null
  - SQL: DELETE FROM posts WHERE id = 1 (再删除)
  ↓
Database: 删除数据，返回被删除的文章
  ↓
层层返回
  ↓
前端: 收到被删除的文章 {id: 1, title: "...", ...}
```

---

## 🎯 为什么要这样设计？

### ✅ 优点

1. **职责清晰**
   - 每一层只做自己的事
   - Controller 不关心数据库，Repository 不关心请求响应

2. **易于维护**
   - 修改数据库查询，只改 Repository
   - 修改业务规则，只改 Service
   - 修改响应格式，只改 Controller

3. **易于测试**
   - 可以独立测试每一层
   - 不需要真实数据库也能测试 Service（Mock Repository）

4. **易于扩展**
   - 添加新功能：新建对应的 Route/Controller/Service/Repository
   - 换数据库：只需要改 Repository 层

### ⚠️ 注意事项

1. **不要跨层调用**
   - ❌ Controller 直接调用 Repository
   - ✅ Controller -> Service -> Repository

2. **错误处理要完善**
   - Service 层要验证数据并抛出有意义的错误
   - Controller 层要 try-catch 并传递给错误处理中间件

3. **保持一致性**
   - 所有 API 返回格式一致
   - 错误响应格式统一

---

## 📚 下一步学习

现在你已经理解了后端架构，可以尝试：

1. **添加用户功能**
   - 创建 userRoutes.js
   - 创建 userController.js
   - 创建 userService.js
   - 创建 userRepository.js

2. **添加认证功能**
   - 安装 jsonwebtoken
   - 创建 authMiddleware.js
   - 在需要的路由上添加中间件

3. **添加日志功能**
   - 安装 winston 或 morgan
   - 记录所有请求和错误

4. **优化性能**
   - 添加 Redis 缓存
   - 数据库索引优化
   - 分页查询

---

**祝你学习顺利！如果有任何问题，请查看各个文件中的详细注释。** 🚀



