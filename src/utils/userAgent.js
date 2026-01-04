/**
 * ============================================
 * 文件名：src/utils/userAgent.js
 * 作用：解析 User Agent，获取操作系统和浏览器信息
 * ============================================
 */

/**
 * 解析 User Agent 获取操作系统信息
 * @returns {string} 操作系统名称
 */
export function getOS() {
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows NT 10.0')) return 'Windows 10';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows NT 6.0')) return 'Windows Vista';
  if (ua.includes('Windows NT 5.1')) return 'Windows XP';
  if (ua.includes('Windows')) return 'Windows';
  
  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      return `macOS ${version}`;
    }
    return 'macOS';
  }
  
  if (ua.includes('Android')) {
    const match = ua.match(/Android ([\d.]+)/);
    if (match) {
      return `Android ${match[1]}`;
    }
    return 'Android';
  }
  
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS ([\d_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      return `iOS ${version}`;
    }
    return 'iOS';
  }
  
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('CrOS')) return 'Chrome OS';
  
  return 'Unknown';
}

/**
 * 解析 User Agent 获取浏览器信息
 * @returns {string} 浏览器名称和版本
 */
export function getBrowser() {
  const ua = navigator.userAgent;
  
  // Edge (Chromium-based)
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    return match ? `Edge ${match[1]}` : 'Edge';
  }
  
  // Chrome
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) {
      // 检查是否是移动版
      if (ua.includes('Mobile')) {
        return `Chrome Mobile ${match[1].split('.')[0]}`;
      }
      return `Chrome ${match[1].split('.')[0]}`;
    }
    return 'Chrome';
  }
  
  // Safari
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/([\d.]+)/);
    return match ? `Safari ${match[1]}` : 'Safari';
  }
  
  // Firefox
  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    return match ? `Firefox ${match[1]}` : 'Firefox';
  }
  
  // Opera
  if (ua.includes('OPR/')) {
    const match = ua.match(/OPR\/([\d.]+)/);
    return match ? `Opera ${match[1]}` : 'Opera';
  }
  
  // Internet Explorer
  if (ua.includes('MSIE') || ua.includes('Trident/')) {
    const match = ua.match(/(?:MSIE |rv:)([\d.]+)/);
    return match ? `IE ${match[1]}` : 'IE';
  }
  
  // UC Browser
  if (ua.includes('UCBrowser/')) {
    const match = ua.match(/UCBrowser\/([\d.]+)/);
    return match ? `UC ${match[1]}` : 'UC Browser';
  }
  
  // QQ Browser
  if (ua.includes('QQBrowser/')) {
    const match = ua.match(/QQBrowser\/([\d.]+)/);
    return match ? `QQ ${match[1]}` : 'QQ Browser';
  }
  
  // WeChat
  if (ua.includes('MicroMessenger/')) {
    const match = ua.match(/MicroMessenger\/([\d.]+)/);
    return match ? `WeChat ${match[1]}` : 'WeChat';
  }
  
  return 'Unknown';
}

/**
 * 获取完整的设备信息
 * @returns {Object} { os, browser }
 */
export function getDeviceInfo() {
  return {
    os: getOS(),
    browser: getBrowser(),
  };
}

/**
 * 获取操作系统图标名称（用于显示图标）
 * @returns {string} 图标名称
 */
export function getOSIcon() {
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows')) return 'windows';
  if (ua.includes('Mac OS X')) return 'apple';
  if (ua.includes('Android')) return 'android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'apple';
  if (ua.includes('Linux')) return 'linux';
  
  return 'desktop';
}

/**
 * 获取浏览器图标名称
 * @returns {string} 图标名称
 */
export function getBrowserIcon() {
  const ua = navigator.userAgent;
  
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Chrome/')) return 'chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'safari';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('OPR/')) return 'opera';
  
  return 'browser';
}

