/**
 * Parses raw User-Agent request header strings to determine the client's browser,
 * operating system, and device type using simple, high-performance regex.
 * @param {string} userAgentString - The User-Agent header from the request
 * @returns {object} { browser, os, device }
 */
export const parseUserAgent = (userAgentString) => {
  if (!userAgentString) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Desktop'
    };
  }

  const ua = userAgentString.toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // 1. Detect Browser
  if (ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('edge') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('edge') || ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browser = 'Internet Explorer';
  }

  // 2. Detect OS
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // 3. Detect Device Type
  if (ua.includes('ipad') || (ua.includes('macintosh') && 'maxTouchPoints' in globalThis && globalThis.maxTouchPoints > 1)) {
    device = 'Tablet';
  } else if (ua.includes('mobi') || ua.includes('phone') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else {
    device = 'Desktop';
  }

  return { browser, os, device };
};
