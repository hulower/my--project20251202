/**
 * ============================================
 * 文件名：server/src/utils/geoip.js
 * 作用：通过 IP 地址获取地理位置信息
 * ============================================
 */

const geoip = require('geoip-lite');

/**
 * 省份代码映射表（将数字代码转换为中文省份名）
 */
const PROVINCE_MAP = {
  // 直辖市
  '11': '北京',
  '12': '天津',
  '31': '上海',
  '50': '重庆',
  
  // 省份
  '13': '河北',
  '14': '山西',
  '15': '内蒙古',
  '21': '辽宁',
  '22': '吉林',
  '23': '黑龙江',
  '32': '江苏',
  '33': '浙江',
  '34': '安徽',
  '35': '福建',
  '36': '江西',
  '37': '山东',
  '41': '河南',
  '42': '湖北',
  '43': '湖南',
  '44': '广东',
  '45': '广西',
  '46': '海南',
  '51': '四川',
  '52': '贵州',
  '53': '云南',
  '54': '西藏',
  '61': '陕西',
  '62': '甘肃',
  '63': '青海',
  '64': '宁夏',
  '65': '新疆',
  
  // 特别行政区
  '71': '台湾',
  '81': '香港',
  '82': '澳门',
};

/**
 * 城市名称映射表（英文转中文）
 */
const CITY_MAP = {
  // 直辖市
  'Beijing': '北京',
  'Tianjin': '天津',
  'Shanghai': '上海',
  'Chongqing': '重庆',
  
  // 广东省
  'Guangzhou': '广州',
  'Shenzhen': '深圳',
  'Dongguan': '东莞',
  'Foshan': '佛山',
  'Zhuhai': '珠海',
  'Zhongshan': '中山',
  'Huizhou': '惠州',
  'Jiangmen': '江门',
  'Zhaoqing': '肇庆',
  'Shantou': '汕头',
  
  // 浙江省
  'Hangzhou': '杭州',
  'Ningbo': '宁波',
  'Wenzhou': '温州',
  'Jiaxing': '嘉兴',
  'Shaoxing': '绍兴',
  'Taizhou': '台州',
  
  // 江苏省
  'Nanjing': '南京',
  'Suzhou': '苏州',
  'Wuxi': '无锡',
  'Changzhou': '常州',
  'Nantong': '南通',
  'Xuzhou': '徐州',
  
  // 山东省
  'Jinan': '济南',
  'Qingdao': '青岛',
  'Yantai': '烟台',
  'Weifang': '潍坊',
  'Zibo': '淄博',
  
  // 其他主要城市
  'Chengdu': '成都',
  'Xi\'an': '西安',
  'Wuhan': '武汉',
  'Changsha': '长沙',
  'Zhengzhou': '郑州',
  'Nanchang': '南昌',
  'Hefei': '合肥',
  'Fuzhou': '福州',
  'Xiamen': '厦门',
  'Kunming': '昆明',
  'Nanning': '南宁',
  'Guiyang': '贵阳',
  'Haikou': '海口',
  'Shenyang': '沈阳',
  'Dalian': '大连',
  'Harbin': '哈尔滨',
  'Changchun': '长春',
  'Shijiazhuang': '石家庄',
  'Taiyuan': '太原',
  'Hohhot': '呼和浩特',
  'Lanzhou': '兰州',
  'Yinchuan': '银川',
  'Xining': '西宁',
  'Urumqi': '乌鲁木齐',
  'Lhasa': '拉萨',
};

/**
 * 国家名称映射表
 */
const COUNTRY_MAP = {
  'CN': '中国',
  'US': '美国',
  'JP': '日本',
  'KR': '韩国',
  'UK': '英国',
  'FR': '法国',
  'DE': '德国',
  'CA': '加拿大',
  'AU': '澳大利亚',
  'SG': '新加坡',
  'HK': '香港',
  'TW': '台湾',
  'MO': '澳门',
};

/**
 * 通过 IP 地址获取地理位置
 * @param {string} ip - IP 地址
 * @returns {Object|null} 地理位置信息
 */
function getLocationByIP(ip) {
  try {
    // 处理本地 IP
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: '中国',
        countryCode: 'CN',
        province: '本地',
        city: '',
        display: '本地',
      };
    }

    // 处理 IPv6 转换的 IPv4（::ffff:192.168.1.1 格式）
    if (ip.includes('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    // 查询 IP 地理位置
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      console.log(`无法查询 IP: ${ip}`);
      return null;
    }

    // 解析国家
    const country = COUNTRY_MAP[geo.country] || geo.country;
    
    // 解析省份
    let province = '';
    if (geo.country === 'CN' && geo.region) {
      province = PROVINCE_MAP[geo.region] || geo.region;
    } else {
      province = geo.region || '';
    }

    // 解析城市
    let city = '';
    if (geo.city) {
      city = CITY_MAP[geo.city] || geo.city;
    }

    // 生成显示文本
    let display = '';
    if (geo.country === 'CN') {
      // 中国用户显示：省份·城市
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
      // 海外用户显示：国家
      display = country;
    }

    return {
      country,
      countryCode: geo.country,
      province,
      city,
      timezone: geo.timezone,
      display,
    };
  } catch (error) {
    console.error('IP定位失败:', error.message);
    return null;
  }
}

/**
 * 从请求对象中提取客户端 IP
 * @param {Object} req - Express 请求对象
 * @returns {string} IP 地址
 */
function getClientIP(req) {
  // 优先级：x-forwarded-for > x-real-ip > remoteAddress
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for 可能包含多个 IP，取第一个
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  return req.connection.remoteAddress || req.socket.remoteAddress || '';
}

module.exports = {
  getLocationByIP,
  getClientIP,
};

