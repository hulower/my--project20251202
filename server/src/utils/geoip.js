/**
 * ============================================
 * 文件名：server/src/utils/geoip.js
 * 作用：通过 IP 地址获取地理位置信息
 * 使用 ip2region 库（对中国IP定位精度更高）
 * ============================================
 */

const IP2Region = require('ip2region').default;
const path = require('path');

// 初始化 IP2Region 查询器
let searcher = null;

try {
  // ip2region 数据库文件路径（自动使用内置数据库）
  searcher = new IP2Region();
  console.log('✅ IP2Region 初始化成功');
} catch (error) {
  console.error('❌ IP2Region 初始化失败:', error.message);
  console.error('将使用降级方案（仅返回"中国"）');
}

/**
 * 清理地理位置字符串
 * ip2region 返回格式："中国|0|广东省|深圳市|电信"
 * @param {string} str - 原始字符串
 * @returns {string} 清理后的字符串
 */
function cleanLocationString(str) {
  if (!str) return '';
  
  // 移除 "0"、空字符串
  return str
    .replace(/\|0\|/g, '|')
    .replace(/\|\|/g, '|')
    .replace(/^0\|/, '')
    .replace(/\|0$/, '')
    .trim();
}

/**
 * 通过 IP 地址获取地理位置
 * @param {string} ip - IP 地址
 * @returns {Object|null} 地理位置信息
 */
function getLocationByIP(ip) {
  try {
    // ============================================
    // 1. 处理本地 IP 和私有网段
    // ============================================
    if (!ip || 
        ip === '::1' || 
        ip === '127.0.0.1' || 
        ip === 'localhost' ||
        ip.startsWith('192.168.') || 
        ip.startsWith('10.') ||
        ip.startsWith('172.16.') ||
        ip.startsWith('172.17.') ||
        ip.startsWith('172.18.') ||
        ip.startsWith('172.19.') ||
        ip.startsWith('172.20.') ||
        ip.startsWith('172.21.') ||
        ip.startsWith('172.22.') ||
        ip.startsWith('172.23.') ||
        ip.startsWith('172.24.') ||
        ip.startsWith('172.25.') ||
        ip.startsWith('172.26.') ||
        ip.startsWith('172.27.') ||
        ip.startsWith('172.28.') ||
        ip.startsWith('172.29.') ||
        ip.startsWith('172.30.') ||
        ip.startsWith('172.31.') ||
        ip.startsWith('169.254.')) {
      return {
        country: '中国',
        countryCode: 'CN',
        province: '本地',
        city: '',
        isp: '',
        display: '本地',
      };
    }

    // ============================================
    // 2. 处理 IPv6 转 IPv4
    // ============================================
    let processedIP = ip;
    if (ip.includes('::ffff:')) {
      processedIP = ip.replace('::ffff:', '');
    }
    
    // ============================================
    // 3. 处理纯 IPv6 地址
    // ============================================
    if (ip.includes(':') && !ip.includes('::ffff:')) {
      console.log(`⚠️  纯 IPv6 地址，ip2region 支持有限: ${ip}`);
      // ip2region 对 IPv6 支持有限，返回基本信息
      return {
        country: '未知',
        countryCode: '',
        province: '',
        city: '',
        isp: '',
        display: '未知',
      };
    }

    // ============================================
    // 4. 使用 IP2Region 查询
    // ============================================
    if (!searcher) {
      console.error('❌ IP2Region 未初始化');
      return null;
    }

    const result = searcher.search(processedIP);
    
    if (!result) {
      console.log(`⚠️  无法查询 IP: ${processedIP} (原始: ${ip})`);
      return null;
    }

    // ============================================
    // 5. 解析 IP2Region 返回结果
    // ============================================
    // result 格式："中国|0|广东省|深圳市|电信"
    // 或者是对象格式：{ country, region, province, city, isp }
    
    let country = '';
    let province = '';
    let city = '';
    let isp = '';
    
    if (typeof result === 'string') {
      // 字符串格式
      const parts = result.split('|').map(part => part.trim());
      country = parts[0] || '';
      province = parts[2] || '';
      city = parts[3] || '';
      isp = parts[4] || '';
    } else if (typeof result === 'object') {
      // 对象格式
      country = result.country || '';
      province = result.province || '';
      city = result.city || '';
      isp = result.isp || '';
    }

    // ============================================
    // 6. 清理数据
    // ============================================
    // 移除 "省"、"市" 后缀（可选，保持简洁）
    province = province.replace(/省$/, '').replace(/自治区$/, '').replace(/特别行政区$/, '');
    city = city.replace(/市$/, '');
    
    // 处理直辖市（北京、上海、天津、重庆）
    if (['北京', '上海', '天津', '重庆'].includes(province)) {
      city = ''; // 直辖市不显示城市
    }
    
    // 处理特殊情况
    if (province === '0' || province === '') {
      province = '';
    }
    if (city === '0' || city === '') {
      city = '';
    }

    // ============================================
    // 7. 生成显示文本
    // ============================================
    let display = '';
    
    if (country === '中国') {
      // 中国IP：显示省份·城市
      if (province && city) {
        display = `${province}·${city}`;
      } else if (province) {
        display = province;
      } else if (city) {
        display = city;
      } else {
        display = '中国';
      }
    } else {
      // 海外IP：只显示国家
      display = country || '未知';
    }

    console.log(`✅ IP定位成功 [ip2region]: ${processedIP} -> ${display}${isp ? ` (${isp})` : ''}`);

    return {
      country,
      countryCode: country === '中国' ? 'CN' : '',
      province,
      city,
      isp,
      display,
    };
  } catch (error) {
    console.error('❌ IP定位失败:', error.message);
    return null;
  }
}

/**
 * 从请求对象中提取客户端 IP
 * @param {Object} req - Express 请求对象
 * @returns {string} IP 地址
 */
function getClientIP(req) {
  // 优先级：x-forwarded-for > x-real-ip > cf-connecting-ip > socket
  
  // 1. 检查 X-Forwarded-For（Nginx/反向代理常用）
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for 可能包含多个 IP，格式：client, proxy1, proxy2
    // 取第一个（客户端真实 IP）
    const clientIP = forwarded.split(',')[0].trim();
    console.log(`📍 从 X-Forwarded-For 获取 IP: ${clientIP}`);
    return clientIP;
  }
  
  // 2. 检查 X-Real-IP（Nginx 常用）
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    console.log(`📍 从 X-Real-IP 获取 IP: ${realIp}`);
    return realIp;
  }
  
  // 3. 检查 CF-Connecting-IP（Cloudflare）
  const cfIP = req.headers['cf-connecting-ip'];
  if (cfIP) {
    console.log(`📍 从 CF-Connecting-IP 获取 IP: ${cfIP}`);
    return cfIP;
  }
  
  // 4. 从 socket 获取（直连情况）
  // 使用 req.socket（Node.js 13+ 推荐），req.connection 已废弃
  const socketIP = req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  console.log(`📍 从 Socket 获取 IP: ${socketIP}`);
  return socketIP;
}

module.exports = {
  getLocationByIP,
  getClientIP,
};
