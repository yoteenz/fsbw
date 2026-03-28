/**
 * Normalize social handles stored as host/path (e.g. instagram.com/handle) without scheme.
 * Prevents double prefixes when users paste full URLs or host/path into Settings.
 */

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin';

const PLATFORM_STRIP: Record<SocialPlatform, RegExp[]> = {
  facebook: [
    /^https?:\/\/(www\.)?facebook\.com\/?/i,
    /^www\.facebook\.com\/?/i,
    /^facebook\.com\/?/i,
  ],
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\/?/i,
    /^https?:\/\/(www\.)?instagr\.am\/?/i,
    /^www\.instagram\.com\/?/i,
    /^instagram\.com\/?/i,
  ],
  twitter: [
    /^https?:\/\/(www\.)?(?:twitter|x)\.com\/?/i,
    /^www\.(?:twitter|x)\.com\/?/i,
    /^(?:twitter|x)\.com\/?/i,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\/@?/i,
    /^www\.tiktok\.com\/@?/i,
    /^tiktok\.com\/@?/i,
  ],
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\/?/i,
    /^https?:\/\/youtu\.be\/?/i,
    /^www\.youtube\.com\/?/i,
    /^youtube\.com\/?/i,
  ],
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com\/in\/?/i,
    /^https?:\/\/(www\.)?linkedin\.com\/?/i,
    /^www\.linkedin\.com\/in\/?/i,
    /^linkedin\.com\/in\/?/i,
    /^www\.linkedin\.com\/?/i,
    /^linkedin\.com\/?/i,
  ],
};

/** Strip leading @, https, www, and repeated platform host segments from user input or stored value. */
export function stripSocialPlatformPrefixes(platform: SocialPlatform, raw: string): string {
  let s = String(raw || '').trim().replace(/^@/, '');
  if (!s) return '';
  const patterns = PLATFORM_STRIP[platform] || [];
  let progress = true;
  while (progress) {
    progress = false;
    for (const re of patterns) {
      const next = s.replace(re, '').trim().replace(/^\/+/, '');
      if (next !== s) {
        s = next;
        progress = true;
      }
    }
  }
  return s.replace(/^\/+/, '').trim();
}

/**
 * Value persisted on profile / PATCH (no scheme), matching existing Settings convention.
 */
export function profileSocialStorageValue(platform: SocialPlatform, userInput: string): string {
  const handle = stripSocialPlatformPrefixes(platform, userInput);
  if (!handle) return '';
  const fmt: Record<SocialPlatform, string> = {
    facebook: `facebook.com/${handle}`,
    instagram: `instagram.com/${handle}`,
    youtube: `youtube.com/${handle}`,
    tiktok: `tiktok.com/${handle}`,
    twitter: `x.com/${handle}`,
    linkedin: `linkedin.com/in/${handle}`,
  };
  return fmt[platform] || handle;
}

/** Build https URL from stored host/path or bare handle (admin client details, external links). */
export function socialStorageToHttpsUrl(platform: SocialPlatform, stored: string): string {
  const v = String(stored || '').trim();
  if (!v) return '#';
  if (/^https?:\/\//i.test(v)) return v;
  const handle = stripSocialPlatformPrefixes(platform, v);
  if (!handle) return '#';
  const base: Record<SocialPlatform, string> = {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    twitter: 'https://x.com/',
    tiktok: 'https://tiktok.com/@',
    youtube: 'https://youtube.com/',
    linkedin: 'https://linkedin.com/in/',
  };
  const baseUrl = base[platform] || '#';
  if (platform === 'tiktok') {
    return baseUrl + (handle.startsWith('@') ? handle.slice(1) : handle);
  }
  if (platform === 'youtube') {
    return baseUrl + (handle.startsWith('@') || handle.startsWith('channel/') ? handle : `@${handle}`);
  }
  return baseUrl + handle;
}
