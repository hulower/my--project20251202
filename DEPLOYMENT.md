# 部署指南

本项目包含 React 前端和 Node.js 后端，推荐分离部署。

---

## 🚀 方案一：分离部署（推荐，免费）

### 后端部署到 Render

1. **注册 Render 账号**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **连接 GitHub 仓库**
   - 点击 "New +" → "Web Service"
   - 选择你的 GitHub 仓库

3. **配置服务**
   ```
   Name: my-blog-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm run server
   ```

4. **添加环境变量**
   ```
   NODE_ENV=production
   PORT=5001
   ```

5. **部署**
   - 点击 "Create Web Service"
   - 等待构建完成，获得后端 URL：`https://你的应用名.onrender.com`

### 前端部署到 Vercel

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **修改前端 API 地址**
   - 打开 `src/api/httpClient.js`
   - 将 `'https://你的后端域名.onrender.com'` 替换为实际的 Render 后端 URL

4. **构建前端**
   ```bash
   npm run build
   ```

5. **部署**
   ```bash
   vercel --prod
   ```

6. **设置环境变量（可选）**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加：`REACT_APP_API_BASE_URL` = `https://你的后端域名.onrender.com`

7. **更新后端 CORS**
   - 打开 `server/src/app.js`
   - 将 `'https://你的前端域名.vercel.app'` 替换为实际的 Vercel 前端 URL

---

## 🖥️ 方案二：云服务器部署（自建）

### 准备工作

1. **购买服务器**
   - 阿里云/腾讯云/AWS（推荐 Ubuntu 20.04）
   - 最低配置：1核2G

2. **安装环境**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y

   # 安装 Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # 安装 Nginx
   sudo apt install -y nginx

   # 安装 PM2（Node.js 进程管理器）
   sudo npm install -g pm2
   ```

### 部署后端

1. **上传代码**
   ```bash
   # 在服务器上克隆项目
   cd /var/www
   git clone https://github.com/你的用户名/my-react-app.git
   cd my-react-app
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动后端（使用 PM2）**
   ```bash
   pm2 start server/index.js --name my-blog-backend
   pm2 save
   pm2 startup  # 开机自启
   ```

4. **验证**
   ```bash
   curl http://localhost:5001/api/hello
   ```

### 部署前端

1. **构建前端**
   ```bash
   # 在本地构建
   npm run build
   
   # 上传 build 文件夹到服务器
   scp -r build/* root@你的服务器IP:/var/www/html/
   ```

2. **配置 Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/my-blog
   ```

   添加以下配置：
   ```nginx
   server {
       listen 80;
       server_name 你的域名.com;  # 或服务器 IP

       # 前端静态文件
       location / {
           root /var/www/html;
           try_files $uri /index.html;
       }

       # 后端 API 代理
       location /api {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **启用配置**
   ```bash
   sudo ln -s /etc/nginx/sites-available/my-blog /etc/nginx/sites-enabled/
   sudo nginx -t  # 测试配置
   sudo systemctl restart nginx
   ```

4. **配置防火墙**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```

5. **（可选）配置 HTTPS**
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx -y

   # 获取 SSL 证书
   sudo certbot --nginx -d 你的域名.com
   ```

---

## 🐳 方案三：Docker 部署

### 创建 Dockerfile（前端）

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 创建 Dockerfile（后端）

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server ./server
EXPOSE 5001
CMD ["node", "server/index.js"]
```

### 创建 docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
    restart: always

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

### 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

## 📝 部署检查清单

### 部署前
- [ ] 更新 `server/src/app.js` 中的 CORS 允许域名
- [ ] 更新 `src/api/httpClient.js` 中的生产环境 API 地址
- [ ] 测试本地构建：`npm run build`
- [ ] 检查 `.gitignore` 是否包含 `.env`、`node_modules`

### 部署后
- [ ] 测试后端 API：`curl https://后端域名/api/hello`
- [ ] 测试前端访问：浏览器打开前端 URL
- [ ] 测试博客 CRUD 功能
- [ ] 测试粒子系统（确保摄像头权限在 HTTPS 下正常）
- [ ] 检查浏览器控制台是否有 CORS 错误
- [ ] 配置域名 DNS（如果使用自定义域名）

---

## ⚠️ 注意事项

### MediaPipe 摄像头权限
- 粒子页面使用了摄像头和 MediaPipe Hands
- **必须使用 HTTPS**，否则浏览器会阻止摄像头访问
- 本地开发 `localhost` 例外（HTTP 也可访问摄像头）

### 数据持久化
- 当前后端使用**内存存储**（`server/src/models/postStore.js`）
- 服务器重启后数据会丢失
- 生产环境建议：
  - 使用 MongoDB/PostgreSQL 数据库
  - 或使用云服务（Firebase、Supabase）

### 性能优化
- 前端构建后启用 gzip 压缩（Nginx 配置）
- 使用 CDN 加速静态资源（Vercel 自带）
- 后端 API 添加缓存策略

---

## 🔧 常见问题

### 1. 前端无法访问后端 API（CORS 错误）
- 检查后端 `server/src/app.js` 的 CORS 配置
- 确保前端域名在 `origin` 白名单中

### 2. 粒子页面摄像头不工作
- 确保使用 HTTPS（或 localhost）
- 检查浏览器摄像头权限

### 3. 部署后页面刷新 404
- Nginx 配置添加 `try_files $uri /index.html;`
- Vercel 自动处理（无需配置）

### 4. 后端内存不足
- PM2 配置内存限制：`pm2 start app.js --max-memory-restart 300M`
- 升级服务器配置

---

## 📚 推荐资源

- [Vercel 文档](https://vercel.com/docs)
- [Render 文档](https://render.com/docs)
- [Nginx 配置生成器](https://www.digitalocean.com/community/tools/nginx)
- [PM2 文档](https://pm2.keymetrics.io/)

