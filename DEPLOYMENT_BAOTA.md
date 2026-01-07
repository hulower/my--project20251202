# 🚀 宝塔面板部署指南（超简单版）

## 📋 服务器信息

---

## 🎯 部署概览

使用宝塔面板，部署会变得非常简单！大部分操作通过网页界面点击完成。

**预计总时间：30-40 分钟**

---

## 第一步：推送代码到 GitHub（本地操作，5分钟）

在你的本地终端执行：

```bash
cd /path/to/my-react-app  # 进入你的项目目录
git push
```

如果是首次推送：
```bash
git remote add origin https://github.com/你的用户名/my-react-app.git
git push -u origin main
```

**✅ 验证**：访问 GitHub 仓库，确认代码已上传

---

## 第二步：登录宝塔面板（2分钟）

### 1. 获取宝塔面板地址

在腾讯云控制台点击「**登录**」按钮旁边的「**更多操作**」→「**应用管理**」，找到宝塔面板的访问地址。

通常是：`http://你的服务器IP:8888`（例如：`http://123.45.67.89:8888`）

### 2. 登录宝塔面板

- 输入用户名和密码
- 首次登录可能需要绑定宝塔账号（免费注册即可）

---

## 第三步：安装运行环境（宝塔面板操作，10分钟）

### 1. 安装软件

在宝塔面板左侧菜单点击「**软件商店**」，搜索并安装以下软件：

#### ✅ 必装软件

| 软件 | 版本 | 说明 |
|------|------|------|
| **Nginx** | 1.22+ | Web服务器 |
| **MySQL** | 8.0 | 数据库 |
| **PM2管理器** | 最新版 | Node.js进程管理 |

**安装方法**：
1. 在软件商店搜索软件名
2. 点击「安装」按钮
3. 选择「极速安装」
4. 等待安装完成（每个软件 2-3 分钟）

#### ✅ Node.js 安装

1. 点击「**软件商店**」→ 搜索「**PM2管理器**」
2. 安装 PM2 管理器（会自动安装 Node.js）
3. 安装完成后，点击「设置」，选择安装 **Node.js 18** 版本

---

## 第四步：配置 MySQL 数据库（宝塔面板操作，5分钟）

### 1. 创建数据库

1. 左侧菜单点击「**数据库**」
2. 点击「**添加数据库**」按钮
3. 填写信息：
   ```
   数据库名：my_node-app
   用户名：my_node-app
   密码：设置一个强密码（记住！）
   访问权限：本地服务器
   字符集：utf8mb4
   ```
   
   **注意**：数据库名和用户名要与项目匹配
4. 点击「提交」

**✅ 记录数据库密码，后面要用！**

### 2. 导入数据库表

1. 在数据库列表找到 `my_node_app`
2. 点击「**管理**」按钮（会打开 phpMyAdmin）
3. 等会我们用命令行导入，这里先不管

---

## 第五步：上传项目代码（两种方式）

### 方式一：通过 Git 克隆（推荐）

1. 宝塔面板左侧点击「**文件**」
2. 进入 `/www/wwwroot` 目录
3. 点击「**终端**」按钮（右上角）
4. 在终端中执行：

```bash
cd /www/wwwroot
git clone https://github.com/你的用户名/my-react-app.git
cd my-react-app
npm install --production
```

### 方式二：手动上传（如果不会用 Git）

1. 在本地电脑上打开终端，打包项目：
   ```bash
   cd /path/to/my-react-app  # 进入你的项目目录
   tar -czf my-react-app.tar.gz --exclude=node_modules --exclude=.git .
   ```

2. 在宝塔面板「**文件**」中，上传 `my-react-app.tar.gz` 到 `/www/wwwroot`

3. 解压文件，然后在终端安装依赖：
   ```bash
   cd /www/wwwroot/my-react-app
   npm install --production
   ```

---

## 第六步：配置环境变量（宝塔面板操作，3分钟）

### 1. 创建 .env 文件

1. 在宝塔「**文件**」中，进入 `/www/wwwroot/my-react-app`
2. 点击「**新建文件**」，文件名：`.env`
3. 编辑 `.env` 文件，添加以下内容：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_USER=my_node-app
DB_PASSWORD=你在第四步设置的数据库密码
DB_NAME=my_node-app

# JWT 密钥（后面生成）
JWT_SECRET=待填写
JWT_REFRESH_SECRET=待填写

# 服务器配置
NODE_ENV=production
PORT=5001
API_BASE_URL=http://你的服务器IP
```

### 2. 生成 JWT 密钥

在宝塔终端执行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串，执行两次，分别填入 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`

### 3. 保存 .env 文件

---

## 第七步：初始化数据库（宝塔终端操作，2分钟）

在宝塔终端执行：

```bash
cd /www/wwwroot/my-react-app

# 导入数据库表
mysql -u my_node-app -p my_node-app < server/scripts/init-db-correct.sql
# 输入数据库密码

# 验证表是否创建
mysql -u my_node-app -p my_node-app -e "SHOW TABLES;"
```

**应该看到 7 个表**：users, posts, comments, likes, music, tags, post_tags

---

## 第八步：修改前端 API 地址（宝塔文件管理，2分钟）

1. 在宝塔「**文件**」中，打开文件：
   ```
   /www/wwwroot/my-react-app/src/api/httpClient.js
   ```

2. 找到第 6 行，修改为：
   ```javascript
   const API_BASE = process.env.REACT_APP_API_BASE_URL || 
     (process.env.NODE_ENV === 'production' 
       ? 'http://你的服务器IP'  // 例如：'http://123.45.67.89'
       : 'http://localhost:5001');
   ```

3. 保存文件

---

## 第九步：构建前端（宝塔终端操作，5分钟）

在宝塔终端执行：

```bash
cd /www/wwwroot/my-react-app

# 构建前端
npm run build

# 这个过程需要 5-10 分钟，请耐心等待
```

---

## 第十步：配置网站（宝塔面板操作，5分钟）

### 1. 添加网站

1. 宝塔面板左侧点击「**网站**」
2. 点击「**添加站点**」
3. 填写信息：
   ```
   域名：你的服务器IP  （例如：123.45.67.89，如果有域名就填域名）
   根目录：/www/wwwroot/my-react-app/build
   FTP：不创建
   数据库：不创建（已经创建过了）
   PHP版本：纯静态
   ```
4. 点击「提交」

### 2. 配置反向代理（重要！）

1. 在网站列表找到刚创建的网站
2. 点击「**设置**」
3. 左侧选择「**反向代理**」
4. 点击「**添加反向代理**」
5. 填写信息：
   ```
   代理名称：blog-api
   目标URL：http://127.0.0.1:5001
   发送域名：$host
   代理目录：/api
   ```
6. 点击「提交」

### 3. 配置上传文件访问

再次添加反向代理：
```
代理名称：uploads
目标URL：http://127.0.0.1:5001
发送域名：$host
代理目录：/uploads
```

### 4. 开启 Gzip 压缩

1. 在网站设置中，左侧选择「**配置文件**」
2. 找到 `gzip` 相关配置，确保开启：
   ```nginx
   gzip on;
   gzip_min_length 1k;
   gzip_types text/plain text/css application/json application/javascript;
   ```

---

## 第十一步：启动后端服务（PM2管理器，3分钟）

### 1. 使用 PM2 管理器

1. 宝塔面板左侧点击「**软件商店**」
2. 找到「**PM2管理器**」，点击「**设置**」
3. 点击「**添加项目**」
4. 填写信息：
   ```
   项目名称：blog-backend
   启动文件：/www/wwwroot/my-react-app/server/index.js
   项目路径：/www/wwwroot/my-react-app
   ```
5. 点击「提交」

### 2. 验证运行状态

在 PM2 管理器中，应该看到项目状态为「**online**」（绿色）

---

## 第十二步：配置防火墙（宝塔面板，1分钟）

1. 宝塔面板左侧点击「**安全**」
2. 确保以下端口已开放：
   ```
   80    # HTTP
   443   # HTTPS
   8888  # 宝塔面板
   ```

3. **在腾讯云控制台也要开放端口**：
   - 回到腾讯云控制台
   - 点击「**防火墙**」标签
   - 添加规则：
     ```
     协议：TCP
     端口：80
     来源：0.0.0.0/0
     ```
   - 再添加 443 端口

---

## 第十三步：访问测试（1分钟）

### 1. 浏览器访问

打开浏览器，访问：
```
http://你的服务器IP
```

例如：`http://123.45.67.89`

**应该看到你的博客首页！**

### 2. 测试功能

- ✅ 用户注册
- ✅ 用户登录
- ✅ 创建文章
- ✅ 上传图片
- ✅ 评论功能

---

## 第十四步：配置域名和 HTTPS（可选，10分钟）

### 如果你有域名

#### 1. 配置 DNS

在域名服务商（如腾讯云、阿里云）添加 A 记录：
```
主机记录：@
记录类型：A
记录值：你的服务器IP（例如：123.45.67.89）
TTL：600
```

等待 5-10 分钟 DNS 生效

#### 2. 在宝塔添加域名

1. 进入「**网站**」→ 找到你的网站 → 点击「**设置**」
2. 在「**域名管理**」中添加你的域名
3. 点击「保存」

#### 3. 申请 SSL 证书（超简单！）

1. 在网站设置中，点击「**SSL**」
2. 选择「**Let's Encrypt**」（免费证书）
3. 填写邮箱，勾选域名
4. 点击「**申请**」
5. 等待几秒钟，证书自动安装
6. 开启「**强制HTTPS**」开关

#### 4. 更新前端 API 地址

编辑 `/www/wwwroot/my-react-app/src/api/httpClient.js`：

```javascript
? 'https://你的域名.com'  // 改为 HTTPS
```

重新构建：
```bash
cd /www/wwwroot/my-react-app
npm run build
```

---

## ✅ 部署完成检查清单

### 环境检查
- [ ] Nginx 已安装（宝塔软件商店）
- [ ] MySQL 8.0 已安装
- [ ] PM2 管理器已安装
- [ ] Node.js 18 已安装

### 数据库检查
- [ ] 数据库 `my_node-app` 已创建
- [ ] 数据库用户 `my_node-app` 已创建
- [ ] 数据库表已导入（7个表：users, posts, comments, likes, music, tags, post_tags）

### 应用检查
- [ ] 项目代码已上传到 `/www/wwwroot/my-react-app`
- [ ] .env 文件已配置
- [ ] 前端已构建（build 目录存在）
- [ ] 后端通过 PM2 运行（状态：online）

### 网站配置
- [ ] 网站已创建并指向 build 目录
- [ ] API 反向代理已配置（/api → 5001）
- [ ] uploads 反向代理已配置

### 防火墙
- [ ] 宝塔安全中开放 80、443 端口
- [ ] 腾讯云防火墙开放 80、443 端口

### 功能测试
- [ ] 能访问 http://你的服务器IP
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 创建文章功能正常
- [ ] 图片上传功能正常

---

## 🔧 常用管理操作（宝塔面板）

### 查看后端日志
1. 左侧「**软件商店**」→「**PM2管理器**」→「**设置**」
2. 找到 `blog-backend` 项目
3. 点击「**日志**」按钮

### 重启后端服务
1. PM2 管理器中找到项目
2. 点击「**重启**」按钮

### 查看系统资源
1. 宝塔面板首页就能看到 CPU、内存使用情况
2. 点击图表可以查看详细信息

### 管理数据库
1. 左侧「**数据库**」
2. 点击对应数据库的「**管理**」按钮
3. 进入 phpMyAdmin 可视化管理

### 文件管理
1. 左侧「**文件**」
2. 可以在线编辑、上传、下载文件

### 定时任务（备份）
1. 左侧「**计划任务**」
2. 可以设置定期备份数据库
3. 建议每天凌晨 3 点备份数据库

---

## 🆘 常见问题

### 问题 1：无法访问网站

**检查清单**：
1. 腾讯云防火墙是否开放 80 端口？
2. 宝塔安全中是否开放 80 端口？
3. Nginx 是否运行？（软件商店查看）
4. 网站是否创建成功？（网站列表查看）

### 问题 2：API 请求失败

**检查清单**：
1. 后端是否运行？（PM2 管理器查看状态）
2. 反向代理是否配置？（网站设置 → 反向代理）
3. 查看后端日志（PM2 管理器 → 日志）

### 问题 3：无法上传图片

**检查清单**：
1. `/www/wwwroot/my-react-app/server/uploads` 目录是否存在？
2. 目录权限是否正确？（在文件管理中设置为 755）
3. uploads 反向代理是否配置？

### 问题 4：数据库连接失败

**检查清单**：
1. MySQL 是否运行？（软件商店查看）
2. .env 中的数据库密码是否正确？
3. 数据库用户是否创建？（数据库列表查看）

---

## 📱 快速部署命令汇总

### 在宝塔终端依次执行

```bash
# 1. 克隆代码
cd /www/wwwroot
git clone https://github.com/你的用户名/my-react-app.git
cd my-react-app

# 2. 安装依赖
npm install --production

# 3. 创建 .env（手动编辑填入信息）
vim .env

# 4. 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 5. 导入数据库
mysql -u my_node-app -p my_node-app < server/scripts/init-db-correct.sql

# 6. 构建前端
npm run build
```

然后在宝塔面板：
- 添加网站（指向 build 目录）
- 配置反向代理（/api 和 /uploads）
- PM2 添加项目（启动后端）

---

## 🎉 恭喜部署成功！

你的博客现在可以通过以下地址访问：
```
http://你的服务器IP
```

例如：`http://123.45.67.89`

如果配置了域名和 HTTPS：
```
https://你的域名.com
```

---

## 📚 相关文档

- [宝塔官方文档](https://www.bt.cn/bbs/)
- [PM2 管理器使用教程](https://www.bt.cn/bbs/thread-22967-1-1.html)
- [宝塔SSL证书配置](https://www.bt.cn/bbs/thread-88931-1-1.html)

---

**祝你使用愉快！🚀**

