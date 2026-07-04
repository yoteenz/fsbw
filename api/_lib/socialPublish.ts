/**
 * Official platform publish adapters — requires admin-approved posts only.
 */
import type { SocialPlatformId } from './socialPlatforms.js';
import { getDecryptedAccessToken } from './socialAccountsDb.js';

export type PublishInput = {
  caption: string;
  hashtags: string;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  metadata?: Record<string, unknown>;
};

export type PublishResult =
  | { ok: true; platformPostId: string; raw?: Record<string, unknown> }
  | { ok: false; error: string; details?: Record<string, unknown> };

function fullCaption(caption: string, hashtags: string): string {
  const tags = hashtags.trim();
  if (!tags) return caption.trim();
  return `${caption.trim()}\n\n${tags}`.trim();
}

export async function publishToSocialPlatform(platform: SocialPlatformId, input: PublishInput): Promise<PublishResult> {
  const accessToken = await getDecryptedAccessToken(platform);
  if (!accessToken) {
    return { ok: false, error: 'Platform not connected or posting disabled' };
  }

  const text = fullCaption(input.caption, input.hashtags);
  const meta = input.metadata ?? {};

  try {
    switch (platform) {
      case 'instagram': {
        const igUserId = meta.instagramBusinessAccountId as string | undefined;
        if (!igUserId) return { ok: false, error: 'Instagram Business account ID missing in connection metadata' };
        const imageUrl = input.coverUrl || input.thumbnailUrl;
        if (!imageUrl) return { ok: false, error: 'Instagram requires thumbnail/cover image URL' };
        const createRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: text,
            access_token: accessToken,
          }),
        });
        const createJson = (await createRes.json()) as { id?: string; error?: { message: string } };
        if (!createJson.id) return { ok: false, error: createJson.error?.message || 'Instagram media create failed' };
        const pubRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: createJson.id, access_token: accessToken }),
        });
        const pubJson = (await pubRes.json()) as { id?: string; error?: { message: string } };
        if (!pubJson.id) return { ok: false, error: pubJson.error?.message || 'Instagram publish failed' };
        return { ok: true, platformPostId: pubJson.id, raw: pubJson as Record<string, unknown> };
      }
      case 'facebook': {
        const pageId = meta.pageId as string | undefined;
        if (!pageId) return { ok: false, error: 'Facebook Page ID missing in connection metadata' };
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, access_token: accessToken }),
        });
        const json = (await res.json()) as { id?: string; error?: { message: string } };
        if (!json.id) return { ok: false, error: json.error?.message || 'Facebook publish failed' };
        return { ok: true, platformPostId: json.id, raw: json as Record<string, unknown> };
      }
      case 'tiktok': {
        return {
          ok: false,
          error: 'TikTok video upload requires hosted video asset — attach video URL in Distribution pack before publishing',
          details: { note: 'Use TikTok Content Posting API init upload with approved video URL' },
        };
      }
      case 'pinterest': {
        const boardId = (meta.defaultBoardId as string) || process.env.PINTEREST_DEFAULT_BOARD_ID;
        if (!boardId) return { ok: false, error: 'Pinterest default board not configured (PINTEREST_DEFAULT_BOARD_ID)' };
        const imageUrl = input.coverUrl || input.thumbnailUrl;
        if (!imageUrl) return { ok: false, error: 'Pinterest requires image URL' };
        const res = await fetch('https://api.pinterest.com/v5/pins', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            board_id: boardId,
            title: text.slice(0, 100),
            description: text,
            media_source: { source_type: 'image_url', url: imageUrl },
          }),
        });
        const json = (await res.json()) as { id?: string; message?: string };
        if (!json.id) return { ok: false, error: json.message || 'Pinterest pin create failed' };
        return { ok: true, platformPostId: json.id, raw: json as Record<string, unknown> };
      }
      case 'x': {
        const res = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: text.slice(0, 280) }),
        });
        const json = (await res.json()) as { data?: { id: string }; errors?: Array<{ message: string }> };
        const id = json.data?.id;
        if (!id) return { ok: false, error: json.errors?.[0]?.message || 'X post failed' };
        return { ok: true, platformPostId: id, raw: json as Record<string, unknown> };
      }
      default:
        return { ok: false, error: 'Unknown platform' };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Publish failed' };
  }
}
