# 🎨 个人博客全栈应用

> 一个功能完善的全栈博客系统，支持文章发布、音乐播放、评论互动、标签管理等功能

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## 🌐 在线体验

🚀 **在线预览**：[https://www.betsy.cloud](https://www.betsy.cloud)

欢迎访问在线演示站点，体验完整功能！

---

## ✨ 项目特色

### 🎯 核心功能

- **📝 博客系统** - 支持 Markdown 富文本编辑、文章分类、标签管理、全屏独立编辑页
- **🤖 AI 摘要生成** - 基于 DeepSeek + LangChain 自动生成文章摘要，支持一键生成与展示
- **🎵 音乐播放器** - 集成音乐播放功能，支持歌词同步显示（.lrc 格式）
- **💬 评论系统** - 支持嵌套回复、用户互动、设备信息显示
- **👍 点赞功能** - 文章点赞、实时统计、防重复点赞
- **🏷️ 标签管理** - 多标签支持、标签云展示、智能推荐
- **👤 用户系统** - 注册/登录、JWT 认证、角色权限（visitor/user/editor/admin）
- **🖼️ 文件上传** - 支持图片/音乐上传、自动压缩优化、封面生成
- **🔍 搜索归档** - 文章搜索、时间归档、分类筛选
- **🎨 现代 UI** - 毛玻璃效果、深色模式支持、响应式设计

### 🚀 技术亮点

- **🎭 MediaPipe 手势识别** - 集成 Google MediaPipe 实现手势交互
- **✨ Three.js 粒子特效** - 首页 3D 粒子背景动画
- **🎨 富文本编辑器** - 基于 TipTap 的现代化编辑器，支持图片插入、链接、代码高亮等，全屏独立编辑页
- **🤖 AI 摘要生成** - 基于 LangChain.js + DeepSeek API，支持一键生成文章摘要
- **🔐 JWT 双 Token 认证** - Access Token + Refresh Token 机制
- **📦 图片优化** - Sharp 自动压缩、WebP 格式转换
- **🌐 GeoIP 定位** - 评论自动显示用户地理位置
- **🎵 歌词解析** - 支持 LRC 格式歌词同步显示

---

## 📋 目录

- [项目特色](#-项目特色)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [环境配置](#-环境配置)
- [功能模块](#-功能模块)
- [API 接口](#-api-接口)
- [部署指南](#-部署指南)
- [常见问题](#-常见问题)

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | 前端框架 |
| React Router | 6.28.0 | 路由管理 |
| TailwindCSS | 3.4.19 | 样式框架 |
| Radix UI | Latest | 无障碍 UI 组件库 |
| TipTap | 3.14.0 | 富文本编辑器 |
| MediaPipe | 0.4.x | 手势识别 |
| Three.js | 0.181.2 | 3D 粒子效果 |
| Lucide React | 0.562.0 | 图标库 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.21.2 | Web 框架 |
| MySQL | 8.0+ | 数据库 |
| MySQL2 | 3.16.0 | 数据库驱动 |
| JWT | 9.0.3 | 身份认证 |
| Bcrypt | 6.0.0 | 密码加密 |
| Multer | 2.0.2 | 文件上传 |
| Sharp | 0.34.5 | 图片处理 |
| GeoIP Lite | 1.4.10 | IP 定位 |
| CORS | 2.8.5 | 跨域处理 |
| LangChain.js | 1.x | AI 摘要生成 |
| DeepSeek API | Latest | 大模型服务 |

---

## 📂 项目结构

```
my-react-app/
├── 📁 public/                      # 静态资源
│   ├── favicon.ico
│   ├── index.html
│   └── images/                     # 公共图片
│
├── 📁 src/                         # 前端源码
│   ├── 📁 api/                     # API 接口层
│   │   ├── authApi.js              # 认证 API
│   │   ├── blogApi.js              # 博客 API
│   │   ├── commentApi.js           # 评论 API
│   │   ├── likeApi.js              # 点赞 API
│   │   ├── musicApi.js             # 音乐 API
│   │   ├── tagApi.js               # 标签 API
│   │   ├── uploadApi.js            # 上传 API
│   │   ├── userApi.js              # 用户 API
│   │   └── httpClient.js           # Axios 封装
│   │
│   ├── 📁 components/              # 公共组件
│   │   ├── ArticleMusicPlayer/     # 文章音乐播放器
│   │   ├── Comments/               # 评论组件
│   │   ├── ConfirmDialog/          # 确认对话框
│   │   ├── LikeButton/             # 点赞按钮
│   │   ├── MarkdownEditor/         # Markdown 编辑器
│   │   ├── MusicPlayer/            # 音乐播放器
│   │   ├── RichTextEditor/         # 富文本编辑器
│   │   ├── ui/                     # Shadcn UI 组件
│   │   ├── DropdownMenu.js         # 下拉菜单
│   │   ├── ProtectedRoute.js       # 路由守卫
│   │   ├── SearchBar.js            # 搜索栏
│   │   └── UserMenu.js             # 用户菜单
│   │
│   ├── 📁 contexts/                # React Context
│   │   ├── AuthContext.js          # 认证上下文
│   │   └── ThemeContext.js         # 主题上下文
│   │
│   ├── 📁 features/                # 功能模块
│   │   ├── 📁 auth/                # 认证模块
│   │   │   └── pages/              # 登录/注册页面
│   │   ├── 📁 blog/                # 博客模块
│   │   │   ├── components/         # 博客组件
│   │   │   ├── pages/              # 博客页面
│   │   │   └── styles/             # 样式文件
│   │   ├── 📁 home/                # 首页模块
│   │   ├── 📁 music/               # 音乐模块
│   │   ├── 📁 particles/           # 粒子特效模块
│   │   └── 📁 user/                # 用户模块
│   │
│   ├── 📁 hooks/                   # 自定义 Hooks
│   ├── 📁 routes/                  # 路由配置
│   ├── 📁 utils/                   # 工具函数
│   ├── App.js                      # 主应用组件
│   ├── App.css                     # 全局样式
│   └── index.js                    # 入口文件
│
├── 📁 server/                      # 后端源码
│   ├── 📁 src/
│   │   ├── 📁 config/              # 配置文件
│   │   │   └── db.js               # 数据库连接
│   │   │
│   │   ├── 📁 controllers/         # 控制器层
│   │   │   ├── authController.js   # 认证控制器
│   │   │   ├── commentController.js
│   │   │   ├── likeController.js
│   │   │   ├── musicController.js
│   │   │   ├── postController.js
│   │   │   ├── tagController.js
│   │   │   ├── uploadController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── 📁 models/              # 数据访问层（Repository）
│   │   │   ├── commentRepository.js
│   │   │   ├── likeRepository.js
│   │   │   ├── musicRepository.js
│   │   │   ├── postRepository.js
│   │   │   ├── tagRepository.js
│   │   │   └── userRepository.js
│   │   │
│   │   ├── 📁 services/            # 业务逻辑层
│   │   │   ├── authService.js
│   │   │   ├── commentService.js
│   │   │   ├── likeService.js
│   │   │   ├── musicService.js
│   │   │   ├── postService.js
│   │   │   ├── tagService.js
│   │   │   ├── uploadService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── 📁 middleware/          # 中间件
│   │   │   ├── authMiddleware.js   # JWT 认证中间件
│   │   │   ├── contentImageUpload.js # 内容图片上传
│   │   │   ├── musicUpload.js      # 音乐文件上传
│   │   │   └── postCoverUpload.js  # 文章封面上传
│   │   │
│   │   ├── 📁 routes/              # 路由层
│   │   │   ├── authRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── likeRoutes.js
│   │   │   ├── musicRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── tagRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   └── userRoutes.js
│   │   │
│   │   ├── 📁 utils/               # 工具函数
│   │   │   ├── geoip.js            # IP 定位
│   │   │   ├── jwt.js              # JWT 工具
│   │   │   ├── password.js         # 密码加密
│   │   │   └── response.js         # 响应格式化
│   │   │
│   │   └── app.js                  # Express 应用配置
│   │
│   ├── 📁 scripts/                 # 脚本文件
│   │   └── init-db-correct.sql     # 数据库初始化
│   │
│   ├── 📁 uploads/                 # 上传文件存储
│   │   ├── avatars/                # 用户头像
│   │   ├── content/                # 文章内容图片
│   │   ├── music/                  # 音乐文件
│   │   │   ├── covers/             # 音乐封面
│   │   │   └── *.mp3               # 音乐文件
│   │   └── posts/                  # 文章相关
│   │       └── covers/             # 文章封面
│   │
│   ├── index.js                    # 服务器入口
│   ├── ARCHITECTURE.md             # 架构文档
│   ├── DATABASE_GUIDE.md           # 数据库指南
│   └── README.md                   # 后端说明
│
├── 📁 docs/                        # 文档
│   └── DEPLOYMENT_BAOTA.md         # 宝塔部署指南
│
├── .env.example                    # 环境变量模板
├── .gitignore                      # Git 忽略配置
├── package.json                    # 项目依赖
├── tailwind.config.js              # TailwindCSS 配置
└── README.md                       # 项目说明（本文件）
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm >= 9.0.0

### 1️⃣ 克隆项目

```bash
git clone <your-repo-url>
cd my-react-app
```

### 2️⃣ 安装依赖

```bash
# 安装前后端依赖
npm install
```

### 3️⃣ 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的配置
vim .env
```

**环境变量说明**：

```env
# 🔵 前端配置
PORT=3000                           # 前端端口
REACT_APP_API_BASE_URL=             # 后端 API 地址（留空则使用默认）

# 🟢 后端配置
NODE_ENV=development                # 运行环境：development / production

# 💾 数据库配置
DB_HOST=127.0.0.1                   # 数据库地址
DB_USER=my_node-app                 # 数据库用户名
DB_PASSWORD=your_password           # 数据库密码
DB_NAME=my_node-app                 # 数据库名称

# 🔐 JWT 配置
JWT_SECRET=your_jwt_secret          # JWT 访问令牌密钥（至少 32 位）
JWT_REFRESH_SECRET=your_refresh_secret  # JWT 刷新令牌密钥

# 🌐 服务器配置
API_BASE_URL=http://localhost:5001  # 后端服务地址（用于生成文件 URL）

# 🤖 AI 配置（可选，不配置则摘要功能不可用）
DEEPSEEK_API_KEY=your_deepseek_api_key  # DeepSeek API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com  # API 地址
DEEPSEEK_MODEL=deepseek-chat           # 模型名称
```

### 4️⃣ 初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 导入数据库结构
mysql -u root -p < server/scripts/init-db-correct.sql

# 或者手动执行 SQL
mysql -u root -p
> source server/scripts/init-db-correct.sql;
```

### 5️⃣ 启动项目

**方式一：同时启动前后端（推荐开发环境）**

```bash
npm run dev
```

- 前端：http://localhost:3000
- 后端：http://localhost:5001

**方式二：分别启动**

```bash
# 终端 1：启动前端
npm start

# 终端 2：启动后端
npm run server
```

### 6️⃣ 访问应用

打开浏览器访问：http://localhost:3000

**默认管理员账号**（需先通过注册页面注册，然后手动修改数据库 role 为 admin）：

```
用户名: admin
密码: 通过注册页面设置
```

---

## ⚙️ 环境配置

### 开发环境

```bash
# 前端开发服务器
npm start                # 启动前端 (http://localhost:3000)

# 后端开发服务器
npm run server           # 启动后端 (http://localhost:5001)

# 同时启动前后端
npm run dev              # 推荐：同时启动前后端

# 数据库连接测试
npm run db:test          # 测试数据库连接
```

### 生产环境

```bash
# 构建前端
npm run build            # 生成 build/ 目录

# 启动后端（生产模式）
npm run server:prod      # NODE_ENV=production

# 使用 PM2 启动（推荐）
pm2 start server/index.js --name blog-backend
pm2 save
pm2 startup
```

### 环境变量生成

```bash
# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 输出示例：
# bce01bcd466b3a6118636023061fc9bdd10f64b6a63a0bca588b180cb055db83
```

---

## 🎯 功能模块

### 1. 用户系统

#### 功能特性
- ✅ 用户注册/登录
- ✅ JWT 双 Token 认证（Access Token + Refresh Token）
- ✅ 角色权限管理（visitor / user / editor / admin）
- ✅ 用户资料编辑
- ✅ 头像上传与优化
- ✅ 密码 bcrypt 加密

#### 权限说明

| 角色 | 权限 |
|------|------|
| **visitor** | 浏览文章、查看评论 |
| **user** | visitor 权限 + 发表评论、点赞文章 |
| **editor** | user 权限 + 发表文章、编辑文章、音乐管理 |
| **admin** | editor 权限 + 标签管理、用户管理、删除评论 |

### 2. 博客系统

#### 功能特性
- ✅ 富文本编辑器（TipTap）
- ✅ Markdown 支持
- ✅ 文章封面上传
- ✅ 多标签分类
- ✅ 文章分类（技术博客/说说/学习笔记）
- ✅ 阅读量统计
- ✅ 相关文章推荐
- ✅ 目录生成
- ✅ 阅读进度条

#### 文章类型

| 类型 | 说明 | 特点 |
|------|------|------|
| **技术博客** | 技术分享、教程 | 支持代码高亮、目录 |
| **说说** | 短内容、生活分享 | 轻量级、快速发布 |
| **学习笔记** | 学习记录、总结 | 系列化、有序组织 |

### 3. 音乐播放器

#### 功能特性
- ✅ 音乐文件上传（MP3）
- ✅ 封面图片上传
- ✅ 歌词同步显示（LRC 格式）
- ✅ 播放控制（播放/暂停/上一曲/下一曲）
- ✅ 进度条拖动
- ✅ 音量调节
- ✅ 播放次数统计
- ✅ 文章关联音乐

#### 歌词格式支持

```lrc
[00:00.00]歌曲名 - 歌手
[00:15.50]第一句歌词
[00:20.30]第二句歌词
```

### 4. 评论系统

#### 功能特性
- ✅ 嵌套回复（支持多层级）
- ✅ 实时评论
- ✅ 用户信息显示
- ✅ 设备信息自动识别（浏览器、操作系统）
- ✅ IP 地理定位（显示城市）
- ✅ 评论管理（删除、审核）

#### 评论信息

每条评论自动记录：
- 👤 用户信息（头像、昵称）
- 🖥️ 设备信息（操作系统、浏览器）
- 📍 地理位置（基于 IP）
- 🕒 发表时间

### 5. 标签管理

#### 功能特性
- ✅ 标签创建/编辑/删除
- ✅ 标签颜色自定义
- ✅ 文章数量统计
- ✅ 标签云展示
- ✅ 标签关联文章

#### 标签颜色

支持自定义标签颜色，默认提供：
- 🔵 蓝色 `#3B82F6`
- 🟢 绿色 `#10B981`
- 🟡 黄色 `#F59E0B`
- 🔴 红色 `#EF4444`
- 🟣 紫色 `#8B5CF6`

### 6. 文件上传

#### 支持的文件类型

| 类型 | 格式 | 大小限制 | 处理方式 |
|------|------|---------|---------|
| **头像** | JPG, PNG, WebP | 5MB | 压缩、裁剪为 200x200 |
| **文章封面** | JPG, PNG, WebP | 10MB | 压缩、转 WebP |
| **文章图片** | JPG, PNG, WebP | 5MB | 压缩优化 |
| **音乐文件** | MP3 | 50MB | 原样保存 |
| **音乐封面** | JPG, PNG | 5MB | 压缩优化 |

#### 图片优化

- 自动压缩为 WebP 格式
- Sharp 图片处理
- 质量设置：80%
- 尺寸优化：根据用途调整

---

## 📡 API 接口

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
| POST | `/` | 创建文章 | editor+ |
| PUT | `/:id` | 更新文章 | editor+ |
| DELETE | `/:id` | 删除文章 | editor+ |
| GET | `/slug/:slug` | 通过 slug 获取文章 | 公开 |

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

### AI 接口 `/api/posts`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/:id/generate-summary` | 生成文章 AI 摘要 | editor+ |

### 健康检查 `/api`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/health` | 服务健康检查 | 公开 |
| GET | `/status` | 服务状态 | 公开 |

---

## 🗄️ 数据库设计

### 表结构

项目使用 7 个数据表：

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| `users` | 用户表 | id, username, email, password, role, avatar_url |
| `posts` | 文章表 | id, title, slug, content, category, cover_image, music_id |
| `comments` | 评论表 | id, post_id, user_id, parent_id, content |
| `likes` | 点赞表 | id, post_id, user_id |
| `music` | 音乐表 | id, title, artist, file_path, cover_path, lyrics |
| `tags` | 标签表 | id, name, slug, color, posts_count |
| `post_tags` | 文章标签关联表 | id, post_id, tag_id |

### ER 图关系

```
users (1) ──────< (N) posts
users (1) ──────< (N) comments
users (1) ──────< (N) likes

posts (1) ──────< (N) comments
posts (1) ──────< (N) likes
posts (N) ──────< (N) tags  (通过 post_tags)
posts (N) ──────< (1) music
```

### 初始化数据库

```bash
# 方式 1：命令行导入
mysql -u root -p < server/scripts/init-db-correct.sql

# 方式 2：MySQL 客户端
mysql -u root -p
mysql> source /path/to/server/scripts/init-db-correct.sql;

# 方式 3：宝塔面板
# 进入数据库管理 -> 导入 -> 选择 init-db-correct.sql
```

---

## 🚢 部署指南

### 宝塔 Linux 面板部署（推荐）

详细部署步骤请参考：[DEPLOYMENT_BAOTA.md](./DEPLOYMENT_BAOTA.md)

**快速步骤**：

1. **购买服务器**（2核2G 起步）
2. **安装宝塔面板**
3. **安装环境**：Nginx, MySQL 8.0, Node.js 18+, PM2
4. **上传代码**到 `/www/wwwroot/`
5. **配置环境变量**（`.env` 文件）
6. **初始化数据库**（导入 SQL）
7. **构建前端**：`npm run build`
8. **启动后端**：`pm2 start server/index.js`
9. **配置 Nginx**：
   - 前端：静态文件服务
   - 后端：反向代理 `/api` 和 `/uploads`
10. **配置 HTTPS**（可选，推荐）

### Docker 部署（待完善）

```bash
# 构建镜像
docker build -t my-blog .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -p 5001:5001 \
  --env-file .env \
  my-blog
```

---

## 🔧 常用命令

```bash
# 📦 依赖管理
npm install              # 安装依赖
npm update              # 更新依赖
npm audit fix           # 修复安全漏洞

# 🚀 开发
npm start               # 启动前端开发服务器
npm run server          # 启动后端开发服务器
npm run dev             # 同时启动前后端

# 🏗️ 构建
npm run build           # 构建前端生产版本

# 🧪 测试
npm test                # 运行测试
npm run db:test         # 测试数据库连接

# 📊 生产环境
npm run server:prod     # 启动生产环境后端
pm2 start server/index.js --name blog  # PM2 启动
pm2 logs blog           # 查看日志
pm2 restart blog        # 重启服务
pm2 stop blog           # 停止服务
```

---

## ❓ 常见问题

### Q1: 数据库连接失败？

**A**: 检查以下几点：

1. MySQL 服务是否启动：
   ```bash
   # macOS
   brew services list
   
   # Linux
   systemctl status mysql
   ```

2. `.env` 配置是否正确：
   ```env
   DB_HOST=127.0.0.1
   DB_USER=my_node-app
   DB_PASSWORD=your_password
   DB_NAME=my_node-app
   ```

3. 数据库用户权限是否足够：
   ```sql
   GRANT ALL PRIVILEGES ON `my_node-app`.* TO 'my_node-app'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Q2: 图片上传失败？

**A**: 检查：

1. `server/uploads/` 目录是否存在且有写权限
2. Nginx `client_max_body_size` 是否足够（建议 100M）
3. Express body-parser 限制是否合适

### Q3: 前端 API 请求跨域？

**A**: 

- **开发环境**：`package.json` 已配置 `"proxy": "http://localhost:5001"`
- **生产环境**：后端 `src/app.js` 配置 CORS 白名单

### Q4: JWT Token 过期怎么办?

**A**: 项目实现了双 Token 机制：

1. Access Token 过期时间：1 小时
2. Refresh Token 过期时间：7 天
3. 前端自动刷新 Token（`authApi.js`）

### Q5: 如何修改管理员账号？

**A**: 

1. 通过注册页面创建账号
2. 登录数据库修改 `role`：
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'your_username';
   ```

### Q6: 音乐歌词乱码？

**A**: 

LRC 文件需要 UTF-8 编码，如果是 GBK/GB2312：

```bash
# 转换编码
iconv -f GBK -t UTF-8 song.lrc > song_utf8.lrc
```

### Q7: PM2 进程频繁重启？

**A**: 

可能原因：
- 内存不足（检查 `free -h`）
- 数据库连接池配置不当
- 未捕获的异常

解决方案：
```bash
# 优化 PM2 配置
pm2 start server/index.js \
  --name blog \
  --max-memory-restart 350M \
  --min-uptime 10000 \
  --max-restarts 5
```

### Q8: Nginx 502 Bad Gateway？

**A**: 

1. 检查后端是否正常运行：
   ```bash
   pm2 status
   curl http://127.0.0.1:5001/api/health
   ```

2. 检查 Nginx 反向代理配置
3. 检查防火墙规则

---

## 📚 相关文档

- [后端架构说明](./server/ARCHITECTURE.md)
- [数据库配置指南](./server/DATABASE_GUIDE.md)
- [宝塔部署指南](./DEPLOYMENT_BAOTA.md)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 代码规范

- 遵循 ESLint 配置
- 组件使用函数式组件 + Hooks
- CSS 使用 TailwindCSS
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 开源协议

本项目采用 MIT 协议，详见 [LICENSE](./LICENSE) 文件。

---

## 🙏 致谢

感谢以下开源项目：

- [React](https://reactjs.org/) - 前端框架
- [Express](https://expressjs.com/) - 后端框架
- [TailwindCSS](https://tailwindcss.com/) - 样式框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件
- [TipTap](https://tiptap.dev/) - 富文本编辑器

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 网站：https://your-domain.com
- Email：your-email@example.com
- GitHub Issues：[提交问题](https://github.com/your-username/my-react-app/issues)

---

<div align="center">
  
**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**

Made with ❤️ by [Your Name]

</div>
