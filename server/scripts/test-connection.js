/**
 * 测试数据库连接
 * 运行方式：node server/scripts/test-connection.js
 */

const db = require('../src/config/db');

async function testConnection() {
  try {
    console.log('🔍 正在测试数据库连接...\n');
    
    // 测试 1: 基本连接测试
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ 测试 1: 基本连接成功');
    console.log('   结果:', rows[0].result);
    
    // 测试 2: 查看当前数据库
    const [dbInfo] = await db.query('SELECT DATABASE() as currentDB');
    console.log('\n✅ 测试 2: 当前数据库');
    console.log('   数据库名:', dbInfo[0].currentDB || '未选择数据库');
    
    // 测试 3: 查看 posts 表是否存在
    try {
      const [tables] = await db.query('SHOW TABLES LIKE "posts"');
      if (tables.length > 0) {
        console.log('\n✅ 测试 3: posts 表已存在');
        
        // 查看表结构
        const [columns] = await db.query('DESCRIBE posts');
        console.log('   表结构:');
        columns.forEach(col => {
          console.log(`   - ${col.Field}: ${col.Type}`);
        });
        
        // 查看数据量
        const [count] = await db.query('SELECT COUNT(*) as total FROM posts');
        console.log(`   数据量: ${count[0].total} 条`);
      } else {
        console.log('\n⚠️  测试 3: posts 表不存在');
        console.log('   请先运行 SQL 初始化脚本: server/scripts/init-db.sql');
      }
    } catch (err) {
      console.log('\n⚠️  测试 3: 无法访问 posts 表');
      console.log('   错误:', err.message);
      console.log('   请先运行 SQL 初始化脚本: server/scripts/init-db.sql');
    }
    
    console.log('\n✅ 数据库连接测试完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库连接失败！');
    console.error('错误信息:', error.message);
    console.error('\n请检查：');
    console.error('1. MySQL 服务是否已启动');
    console.error('2. server/src/config/db.js 中的配置是否正确');
    console.error('3. 数据库用户名和密码是否正确');
    console.error('4. 数据库是否已创建');
    process.exit(1);
  }
}

testConnection();



