/**
 * ============================================
 * 文件名：server/src/utils/jwt.js
 * 作用：JWT Token 生成和验证工具
 * ============================================
 * 
 * JWT (JSON Web Token) 是什么？
 * - 一种无状态的认证机制
 * - 服务器不需要存储 session
 * - Token 包含用户信息，可以直接解密
 * 
 * JWT 结构：
 * Header.Payload.Signature
 * 
 * 示例：
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiLlvKDkuIkifQ.AbCdEfGhIjKlMnOpQrStUvWxYz
 * 
 * ⚠️ 安全须知：
 * - JWT_SECRET 必须使用环境变量，不要硬编码
 * - 生产环境必须使用强密钥（至少 32 个随机字符）
 * - Token 不要存储敏感信息（如密码）
 */

const jwt = require('jsonwebtoken');

// ========================================
// 配置
// ========================================

/**
 * JWT 密钥
 * ⚠️ 生产环境必须使用环境变量！
 * 
 * 生成强密钥方法：
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-min-32-chars';

/**
 * Token 过期时间配置
 * 
 * Access Token（访问令牌）：
 * - 用于日常 API 请求
 * - 过期时间短（建议 15分钟 - 7天）
 * - 存储在前端内存或 localStorage
 * 
 * Refresh Token（刷新令牌）：
 * - 用于刷新 Access Token
 * - 过期时间长（建议 7天 - 30天）
 * - 存储在数据库，可以撤销
 */
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '7d';  // 7天
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';  // 30天

// ========================================
// Token 生成函数
// ========================================

/**
 * 生成 Access Token（访问令牌）
 * 
 * @param {Object} payload - 用户信息
 * @param {number} payload.id - 用户 ID
 * @param {string} payload.username - 用户名
 * @param {string} payload.email - 邮箱
 * @param {string} payload.role - 角色
 * @returns {string} JWT Token
 * 
 * @example
 * const token = generateAccessToken({
 *   id: 1,
 *   username: '张三',
 *   email: 'zhangsan@example.com',
 *   role: 'editor'
 * });
 */
function generateAccessToken(payload) {
  try {
    // 验证必需字段
    if (!payload.id) {
      throw new Error('payload 必须包含 id 字段');
    }
    
    // 生成 Token
    const token = jwt.sign(
      {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      },
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'my-blog-backend',  // 签发者
        audience: 'my-blog-frontend',  // 接收者
      }
    );
    
    console.log(`✅ Access Token 生成成功 (用户: ${payload.username})`);
    return token;
  } catch (err) {
    console.error('❌ Access Token 生成失败:', err.message);
    throw err;
  }
}

/**
 * 生成 Refresh Token（刷新令牌）
 * 
 * @param {Object} payload - 用户信息（只需要 id）
 * @param {number} payload.id - 用户 ID
 * @returns {string} JWT Refresh Token
 * 
 * @example
 * const refreshToken = generateRefreshToken({ id: 1 });
 * 
 * 为什么 Refresh Token 只包含 ID？
 * - 减少 Token 体积
 * - 安全性更高（泄露后信息更少）
 * - 需要时可以从数据库查询完整信息
 */
function generateRefreshToken(payload) {
  try {
    if (!payload.id) {
      throw new Error('payload 必须包含 id 字段');
    }
    
    const token = jwt.sign(
      { id: payload.id },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'my-blog-backend',
        audience: 'my-blog-frontend',
      }
    );
    
    console.log(`✅ Refresh Token 生成成功 (用户 ID: ${payload.id})`);
    return token;
  } catch (err) {
    console.error('❌ Refresh Token 生成失败:', err.message);
    throw err;
  }
}

// ========================================
// Token 验证函数
// ========================================

/**
 * 验证 Token
 * 
 * @param {string} token - JWT Token
 * @returns {Object} 解密后的 payload
 * @throws {Error} Token 无效或过期
 * 
 * @example
 * try {
 *   const payload = verifyToken(token);
 *   console.log('用户 ID:', payload.id);
 *   console.log('用户名:', payload.username);
 * } catch (err) {
 *   console.error('Token 验证失败:', err.message);
 * }
 * 
 * 可能的错误：
 * - TokenExpiredError: Token 已过期
 * - JsonWebTokenError: Token 格式错误
 * - NotBeforeError: Token 尚未生效
 */
function verifyToken(token) {
  try {
    if (!token) {
      const error = new Error('Token 不能为空');
      error.statusCode = 401;
      throw error;
    }
    
    // 验证 Token
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'my-blog-backend',
      audience: 'my-blog-frontend',
    });
    
    console.log(`✅ Token 验证成功 (用户 ID: ${payload.id})`);
    return payload;
  } catch (err) {
    console.error('❌ Token 验证失败:', err.message);
    
    // 根据错误类型设置状态码和消息
    let statusCode = 401;
    let message = 'Token 无效';
    
    if (err.name === 'TokenExpiredError') {
      message = 'Token 已过期，请重新登录';
      statusCode = 401;
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Token 格式错误';
      statusCode = 401;
    } else if (err.name === 'NotBeforeError') {
      message = 'Token 尚未生效';
      statusCode = 401;
    }
    
    const error = new Error(message);
    error.statusCode = statusCode;
    error.originalError = err;
    throw error;
  }
}

/**
 * 解码 Token（不验证签名）
 * 
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的 payload（不验证有效性）
 * 
 * @example
 * const payload = decodeToken(token);
 * console.log('Token 过期时间:', new Date(payload.exp * 1000));
 * 
 * ⚠️ 注意：此方法不验证 Token 签名，仅用于调试
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    console.error('❌ Token 解码失败:', err.message);
    return null;
  }
}

// ========================================
// 导出工具函数
// ========================================
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  JWT_SECRET,  // 仅用于测试，生产环境不要导出
};

// ========================================
// 使用示例（测试代码，实际项目中删除）
// ========================================
if (require.main === module) {
  console.log('========================================');
  console.log('JWT Token 工具测试');
  console.log('========================================\n');
  
  const testUser = {
    id: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    role: 'editor',
  };
  
  // 1. 生成 Access Token
  console.log('1. 生成 Access Token');
  const accessToken = generateAccessToken(testUser);
  console.log('   Token:', accessToken.substring(0, 50) + '...', '\n');
  
  // 2. 生成 Refresh Token
  console.log('2. 生成 Refresh Token');
  const refreshToken = generateRefreshToken({ id: testUser.id });
  console.log('   Token:', refreshToken.substring(0, 50) + '...', '\n');
  
  // 3. 验证 Token
  console.log('3. 验证 Access Token');
  try {
    const payload = verifyToken(accessToken);
    console.log('   验证成功！');
    console.log('   用户 ID:', payload.id);
    console.log('   用户名:', payload.username);
    console.log('   角色:', payload.role);
    console.log('   过期时间:', new Date(payload.exp * 1000).toLocaleString(), '\n');
  } catch (err) {
    console.log('   验证失败:', err.message, '\n');
  }
  
  // 4. 解码 Token（不验证）
  console.log('4. 解码 Token（不验证签名）');
  const decoded = decodeToken(accessToken);
  console.log('   Payload:', JSON.stringify(decoded, null, 2), '\n');
  
  // 5. 测试无效 Token
  console.log('5. 测试无效 Token');
  try {
    verifyToken('invalid.token.here');
  } catch (err) {
    console.log('   预期的错误:', err.message, '\n');
  }
  
  console.log('========================================');
  console.log('测试完成！');
  console.log('========================================');
}


