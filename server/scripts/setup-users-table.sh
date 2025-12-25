#!/bin/bash
# 用户表设置脚本

DB_USER="root"
DB_PASS="13698810685qwe"
DB_NAME="my_node_app"

echo "🔧 开始设置用户表..."

# 1. 检查数据库是否存在
echo "📊 检查数据库..."
mysql -u$DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 执行建表脚本
echo "📦 创建用户表..."
mysql -u$DB_USER -p$DB_PASS $DB_NAME < server/scripts/create-users-table.sql

# 3. 验证表结构
echo "✅ 验证表结构..."
mysql -u$DB_USER -p$DB_PASS $DB_NAME -e "DESCRIBE users;"

# 4. 查看数据
echo "👤 查看用户数据..."
mysql -u$DB_USER -p$DB_PASS $DB_NAME -e "SELECT * FROM users;"

echo "🎉 用户表设置完成！"

