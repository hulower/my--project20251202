# 头像上传功能设置指南

## 📋 已实现的功能

✅ 用户头像上传  
✅ 图片自动压缩和优化（300x300，质量85%）  
✅ 文件类型验证（jpg, png, gif, webp）  
✅ 文件大小限制（5MB）  
✅ 数据库存储头像路径  
✅ 静态文件服务  

---

## 🗄️ 数据库设置

### 1. 创建用户表

在 MySQL 中运行以下命令：

```bash
# 方式1：使用 MySQL 命令行
mysql -u root -p my_node_app < server/scripts/create-users-table.sql

# 方式2：登录 MySQL 后手动执行
mysql -u root -p
USE my_node_app;
SOURCE /path/to/server/scripts/create-users-table.sql;
```

### 2. 验证表创建成功

```sql
USE my_node_app;
SHOW TABLES;  -- 应该看到 users 表
DESCRIBE users;  -- 查看表结构
SELECT * FROM users;  -- 查看默认用户数据
```

---

## 🚀 启动后端服务

```bash
# 确保在项目根目录
npm run server

# 应该看到：
# ✅ 服务器正在运行，端口：5001
# ✅ MySQL 连接成功！
```

---

## 🧪 测试 API

### 1. 获取用户信息

```bash
curl http://localhost:5001/api/users/1
```

**预期响应：**
```json
{
  "id": 1,
  "username": "博主",
  "email": "admin@myblog.com",
  "avatarUrl": null,
  "bio": "趁年轻，做自己想做的！",
  "createdAt": "2024-12-25T..."
}
```

### 2. 上传头像（使用 Postman 或 curl）

**使用 curl：**
```bash
curl -X POST http://localhost:5001/api/upload/avatar \
  -F "avatar=@/path/to/your/image.jpg"
```

**使用 Postman：**
1. Method: `POST`
2. URL: `http://localhost:5001/api/upload/avatar`
3. Body: 选择 `form-data`
4. Key: `avatar` (type: File)
5. Value: 选择一张图片文件
6. 点击 Send

**预期响应：**
```json
{
  "success": true,
  "url": "/uploads/avatars/optimized-1703500000000-123456789.jpg",
  "user": {
    "id": 1,
    "username": "博主",
    "email": "admin@myblog.com",
    "avatarUrl": "/uploads/avatars/optimized-1703500000000-123456789.jpg",
    "bio": "趁年轻，做自己想做的！"
  },
  "message": "头像上传成功"
}
```

### 3. 访问上传的头像

在浏览器中打开：
```
http://localhost:5001/uploads/avatars/optimized-1703500000000-123456789.jpg
```

应该能看到上传的头像图片。

---

## 📁 新增的后端文件结构

```
server/
├── uploads/                          👈 新增：上传文件存储目录
│   ├── .gitignore                    👈 Git 忽略配置
│   └── avatars/                      👈 头像专用目录
│       └── .gitkeep
├── scripts/
│   └── create-users-table.sql        👈 新增：用户表创建脚本
└── src/
    ├── routes/
    │   ├── userRoutes.js             👈 新增：用户路由
    │   └── uploadRoutes.js           👈 新增：上传路由
    ├── controllers/
    │   ├── userController.js         👈 新增：用户控制器
    │   └── uploadController.js       👈 新增：上传控制器
    ├── services/
    │   ├── userService.js            👈 新增：用户业务逻辑
    │   └── uploadService.js          👈 新增：上传业务逻辑
    ├── models/
    │   └── userRepository.js         👈 新增：用户数据访问层
    └── app.js                        👈 已修改：添加新路由
```

---

## 🔧 配置说明

### 文件上传限制（可在 uploadController.js 修改）

```javascript
limits: {
  fileSize: 5 * 1024 * 1024, // 5MB
}
```

### 图片压缩设置（可在 uploadController.js 修改）

```javascript
await sharp(originalPath)
  .resize(300, 300, {      // 调整大小
    fit: 'cover',
    position: 'center'
  })
  .jpeg({ quality: 85 })   // 压缩质量
  .toFile(optimizedPath);
```

### 允许的文件类型（可在 uploadController.js 修改）

```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
```

---

## 🎯 API 端点总结

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/users/:id` | 获取用户信息 |
| PUT | `/api/users/:id` | 更新用户信息 |
| POST | `/api/upload/avatar` | 上传头像 |
| GET | `/uploads/avatars/:filename` | 访问上传的头像 |

---

## ⚠️ 注意事项

1. **用户认证**：当前版本使用固定的用户 ID (1)，生产环境需要实现真实的用户认证系统（JWT/Session）。

2. **文件清理**：上传新头像时，旧头像文件不会自动删除。如需清理，可以添加定时任务或在更新时删除旧文件。

3. **安全性**：
   - 已实现文件类型验证
   - 已实现文件大小限制
   - 建议添加病毒扫描（生产环境）
   - 建议添加请求频率限制

4. **存储优化**：
   - 考虑使用 CDN 加速图片访问
   - 考虑使用对象存储（OSS/S3）替代本地存储

---

## 🐛 常见问题

### Q: 上传失败，提示 "ENOENT: no such file or directory"
A: 确保 `server/uploads/avatars/` 目录存在：
```bash
mkdir -p server/uploads/avatars
```

### Q: 无法访问上传的图片
A: 确认后端已启动，并且 app.js 中已配置静态文件服务：
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### Q: 数据库表不存在
A: 运行 SQL 脚本创建表：
```bash
mysql -u root -p my_node_app < server/scripts/create-users-table.sql
```

---

## 📚 下一步

前端集成请参考前端部分的文档（即将提供）。

前端需要修改 `Sidebar.js` 中的头像上传逻辑，从本地存储改为调用后端 API。

