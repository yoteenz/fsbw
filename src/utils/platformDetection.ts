/** Detect platform from user agent for display when account is deleted. Call this at deletion time. */
export function getDeletedPlatformFromUserAgent(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isMobile = isIOS || isAndroid || /mobile/.test(ua);
  if (isIOS) {
    if (/crios/.test(ua)) return 'chrome-ios';
    if (/fxios/.test(ua)) return 'firefox-ios';
    return 'safari-ios'; // Safari is default on iOS when not Chrome/Firefox
  }
  if (isAndroid) {
    if (/firefox/.test(ua)) return 'firefox-android';
    if (/samsungbrowser|samsung/.test(ua)) return 'samsung-android';
    if (/chrome/.test(ua)) return 'chrome-android';
    return 'android';
  }
  if (/edg\//.test(ua)) return 'edge-desktop';
  if (/chrome/.test(ua) && !/edg/.test(ua)) return 'chrome-desktop';
  if (/firefox/.test(ua)) return 'firefox-desktop';
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'safari-desktop';
  return isMobile ? 'mobile' : 'desktop';
}
