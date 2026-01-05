# 🔒 安全配置指南

## ⚠️ 推送到 GitHub 前必读

本文档说明如何保护敏感信息，避免泄露到公开仓库。

---

## 已配置的安全措施

### 1. `.gitignore` 文件保护

以下文件/目录已被排除，**不会**推送到 GitHub：

```
✅ .env                    # 环境变量（包含密码、密钥）
✅ .env.local              # 本地环境变量
✅ .env.*.local            # 其他环境变量
✅ /node_modules           # 依赖包
✅ /build                  # 构建产物
✅ server/uploads/**/*     # 用户上传的文件
```

### 2. 环境变量配置

所有敏感信息已移至 `.env` 文件：

- ✅ 数据库密码
- ✅ JWT 密钥
- ✅ 其他配置

### 3. 代码中的配置

所有配置文件已修改为从环境变量读取：

- ✅ `server/src/config/db.js` - 数据库配置
- ✅ `server/src/utils/jwt.js` - JWT 密钥
- ✅ `server/index.js` - 服务器端口

---

## 部署前检查清单

### 推送到 GitHub 前

- [ ] 确认 `.env` 文件在 `.gitignore` 中
- [ ] 确认 `.env` 文件**未被** git 追踪
- [ ] 确认代码中没有硬编码的密码
- [ ] 确认代码中没有硬编码的 API 密钥
- [ ] 运行 `git status` 检查待提交文件

### 部署到生产环境前

- [ ] 在服务器上创建 `.env` 文件
- [ ] 生成强 JWT 密钥（至少 32 位随机字符）
- [ ] 配置生产数据库连接信息
- [ ] 设置 `NODE_ENV=production`
- [ ] 修改前端 API 地址为生产域名
- [ ] 修改后端 CORS 允许域名为生产域名

---

## 如何生成强密钥

### JWT 密钥生成

```bash
# 方法 1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2：使用 OpenSSL（Linux/Mac）
openssl rand -hex 32

# 方法 3：在线生成
# 访问：https://www.random.org/strings/
```

示例输出：
```
a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678
```

---

## 生产环境配置示例

### 服务器 `.env` 文件

```env
# 数据库配置（使用生产数据库）
DB_HOST=your-production-db-host.com
DB_USER=your_db_user
DB_PASSWORD=你的强密码（至少16位）
DB_NAME=my_node_app

# JWT 配置（使用强密钥）
JWT_SECRET=a3f8d9e2c1b4567890abcdef1234567890abcdef1234567890abcdef12345678
JWT_REFRESH_SECRET=b4e9c3f2d1a5678901bcdefg2345678901bcdefg2345678901bcdefg23456789

# 服务器配置
NODE_ENV=production
PORT=5001
```

---

## 检查是否泄露敏感信息

### 推送前检查

```bash
# 1. 查看待提交的文件
git status

# 2. 查看具体改动
git diff

# 3. 确认 .env 未被追踪
git ls-files | grep .env
# 应该只显示 .env.example，不应该有 .env

# 4. 检查是否有密码字符串
git grep -i "password.*=" | grep -v "process.env" | grep -v "example"
```

### 如果不小心提交了敏感信息

```bash
# ⚠️ 如果已经 commit 但未 push
git reset HEAD~1  # 撤销最后一次 commit

# ⚠️ 如果已经 push 到 GitHub
# 1. 立即修改所有泄露的密码
# 2. 重新生成所有密钥
# 3. 从 Git 历史中删除敏感信息（复杂，建议重建仓库）
```

---

## 常见安全问题

### ❌ 错误做法

```javascript
// 硬编码密码
const password = '13698810685qwe';

// 硬编码 API 密钥
const apiKey = 'sk_live_1234567890abcdef';

// 提交 .env 文件到 Git
```

### ✅ 正确做法

```javascript
// 从环境变量读取
const password = process.env.DB_PASSWORD;

// 从环境变量读取
const apiKey = process.env.API_KEY;

// .env 文件在 .gitignore 中
```

---

## 紧急联系

如果发现敏感信息泄露：

1. **立即修改所有密码**
2. **重新生成所有密钥**
3. **检查是否有异常访问**
4. **考虑重建 Git 仓库**

---

## 相关文档

- [.env.example](./.env.example) - 环境变量模板
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [GitHub 安全最佳实践](https://docs.github.com/en/code-security)

