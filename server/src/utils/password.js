/**
 * ============================================
 * 文件名：server/src/utils/password.js
 * 作用：密码加密和验证工具
 * ============================================
 * 
 * 使用 bcrypt 库进行密码加密：
 * - bcrypt 是目前最安全的密码加密算法之一
 * - 自动加盐（salt），防止彩虹表攻击
 * - 计算速度适中，防止暴力破解
 * 
 * ⚠️ 安全须知：
 * - 永远不要存储明文密码
 * - 不要使用 MD5/SHA1（已被破解）
 * - bcrypt 的盐值轮数（saltRounds）建议 10-12
 */

const bcrypt = require('bcrypt');

// 盐值轮数：数字越大越安全，但加密速度越慢
// 10 = 大约 100ms（推荐，平衡性能与安全）
// 12 = 大约 300ms（高安全）
const SALT_ROUNDS = 10;

/**
 * 加密密码
 * 
 * @param {string} plainPassword - 明文密码
 * @returns {Promise<string>} 加密后的密码（hash）
 * 
 * @example
 * const hashedPassword = await hashPassword('myPassword123');
 * // 返回: "$2b$10$xH7QxJ9..."
 * 
 * 工作原理：
 * 1. bcrypt 自动生成随机盐值（salt）
 * 2. 将密码和盐值混合
 * 3. 进行多轮哈希运算（SALT_ROUNDS 次）
 * 4. 返回包含盐值和哈希值的字符串
 */
async function hashPassword(plainPassword) {
  try {
    // 参数验证
    if (!plainPassword || typeof plainPassword !== 'string') {
      throw new Error('密码必须是非空字符串');
    }
    
    if (plainPassword.length < 6) {
      throw new Error('密码长度至少为 6 个字符');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    
    console.log('✅ 密码加密成功');
    return hashedPassword;
  } catch (err) {
    console.error('❌ 密码加密失败:', err.message);
    throw err;
  }
}

/**
 * 验证密码
 * 
 * @param {string} plainPassword - 用户输入的明文密码
 * @param {string} hashedPassword - 数据库中存储的加密密码
 * @returns {Promise<boolean>} 密码是否匹配
 * 
 * @example
 * const isValid = await verifyPassword('myPassword123', hashedPasswordFromDB);
 * if (isValid) {
 *   console.log('密码正确！');
 * } else {
 *   console.log('密码错误！');
 * }
 * 
 * 工作原理：
 * 1. 从 hashedPassword 中提取盐值
 * 2. 使用相同的盐值对 plainPassword 进行哈希
 * 3. 比较两个哈希值是否相同
 */
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    // 参数验证
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    
    // 比较密码
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    
    if (isMatch) {
      console.log('✅ 密码验证成功');
    } else {
      console.log('⚠️ 密码验证失败');
    }
    
    return isMatch;
  } catch (err) {
    console.error('❌ 密码验证出错:', err.message);
    return false;
  }
}

/**
 * 生成随机密码（可选功能）
 * 
 * @param {number} length - 密码长度，默认 12
 * @returns {string} 随机密码
 * 
 * @example
 * const randomPassword = generateRandomPassword();
 * // 返回: "aB3$dE7&iJ9@"
 */
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

// ========================================
// 导出工具函数
// ========================================
module.exports = {
  hashPassword,
  verifyPassword,
  generateRandomPassword,
};

// ========================================
// 使用示例（测试代码，实际项目中删除）
// ========================================
if (require.main === module) {
  (async () => {
    console.log('========================================');
    console.log('密码工具测试');
    console.log('========================================\n');
    
    const testPassword = '123456';
    
    // 1. 加密密码
    console.log('1. 加密密码:', testPassword);
    const hashed = await hashPassword(testPassword);
    console.log('   加密结果:', hashed, '\n');
    
    // 2. 验证正确密码
    console.log('2. 验证正确密码:', testPassword);
    const isValid = await verifyPassword(testPassword, hashed);
    console.log('   验证结果:', isValid ? '✅ 通过' : '❌ 失败', '\n');
    
    // 3. 验证错误密码
    console.log('3. 验证错误密码: wrongpassword');
    const isInvalid = await verifyPassword('wrongpassword', hashed);
    console.log('   验证结果:', isInvalid ? '✅ 通过' : '❌ 失败', '\n');
    
    // 4. 生成随机密码
    console.log('4. 生成随机密码:');
    const randomPassword = generateRandomPassword();
    console.log('   随机密码:', randomPassword);
    
    console.log('\n========================================');
    console.log('测试完成！');
    console.log('========================================');
  })();
}


