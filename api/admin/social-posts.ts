import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { appendSocialPublishLog } from '../_lib/socialAccountsDb.js';
import { publishToSocialPlatform } from '../_lib/socialPublish.js';
import type { SocialPlatformId } from '../_lib/socialPlatforms.js';

const PLATFORMS = new Set(['instagram', 'facebook', 'tiktok', 'pinterest', 'x']);

function parsePlatform(raw: unknown): SocialPlatformId | null {
  const p = String(raw || '').toLowerCase();
  return PLATFORMS.has(p) ? (p as SocialPlatformId) : null;
}

type PostBody = {
  action?: string;
  id?: string;
  distributionPackId?: string;
  contentPackRef?: string;
  platform?: string;
  caption?: string;
  hashtags?: string;
  thumbnailUrl?: string;
  coverUrl?: string;
  scheduledAt?: string;
  packApproved?: boolean;
};

/**
 * GET  /api/admin/social-posts?distributionPackId=...
 * POST /api/admin/social-posts — save_draft | submit_approval | approve | reject | schedule | publish
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    const packId = typeof req.query.distributionPackId === 'string' ? req.query.distributionPackId : '';
    let q = supabase.from('studio_social_posts').select('*').order('updated_at', { ascending: false });
    if (packId) q = q.eq('distribution_pack_id', packId);
    const { data, error } = await q.limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ posts: data ?? [] });
  }

  if (req.method === 'POST') {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as PostBody;
    const action = String(body.action || 'save_draft');

    if (action === 'save_draft' || action === 'submit_approval') {
      const platform = parsePlatform(body.platform);
      const distributionPackId = String(body.distributionPackId || '').trim();
      if (!platform || !distributionPackId) return res.status(400).json({ error: 'platform and distributionPackId required' });

      const row = {
        distribution_pack_id: distributionPackId,
        content_pack_ref: body.contentPackRef ?? null,
        platform,
        caption: String(body.caption ?? ''),
        hashtags: String(body.hashtags ?? ''),
        thumbnail_url: body.thumbnailUrl ?? null,
        cover_url: body.coverUrl ?? null,
        approval_status: action === 'submit_approval' ? 'pending_approval' : 'draft',
        publish_status: 'draft',
        created_by_email: admin.email,
        updated_at: new Date().toISOString(),
      };

      let postId = body.id;
      if (postId) {
        const { error } = await supabase.from('studio_social_posts').update(row).eq('id', postId);
        if (error) return res.status(500).json({ error: error.message });
      } else {
        const { data, error } = await supabase.from('studio_social_posts').insert(row).select('id').single();
        if (error) return res.status(500).json({ error: error.message });
        postId = data?.id;
      }

      await appendSocialPublishLog({
        postId: postId ?? null,
        action: action === 'submit_approval' ? 'submit_approval' : 'save_draft',
        actorEmail: admin.email,
        platform,
        caption: row.caption,
        assetUsed: row.thumbnail_url || row.cover_url || undefined,
      });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'social.post.save',
        resourceType: 'studio_social_post',
        resourceId: postId ?? undefined,
        details: { platform, distributionPackId, approvalStatus: row.approval_status },
      });
      return res.status(200).json({ ok: true, id: postId });
    }

    const postId = String(body.id || '').trim();
    if (!postId) return res.status(400).json({ error: 'id required' });

    const { data: post, error: fetchErr } = await supabase.from('studio_social_posts').select('*').eq('id', postId).maybeSingle();
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (action === 'approve') {
      const { error } = await supabase
        .from('studio_social_posts')
        .update({
          approval_status: 'approved',
          approved_by_email: admin.email,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);
      if (error) return res.status(500).json({ error: error.message });
      await appendSocialPublishLog({
        postId,
        action: 'approve',
        actorEmail: admin.email,
        platform: post.platform,
        caption: post.caption,
        assetUsed: post.thumbnail_url || post.cover_url,
      });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'social.post.approve',
        resourceType: 'studio_social_post',
        resourceId: postId,
        details: { platform: post.platform, approvedBy: admin.email },
      });
      return res.status(200).json({ ok: true });
    }

    if (action === 'reject') {
      await supabase
        .from('studio_social_posts')
        .update({ approval_status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', postId);
      await appendSocialPublishLog({ postId, action: 'reject', actorEmail: admin.email, platform: post.platform });
      return res.status(200).json({ ok: true });
    }

    if (action === 'schedule' || action === 'publish') {
      if (post.approval_status !== 'approved') {
        return res.status(403).json({ error: 'Post must be admin-approved before publishing' });
      }
      if (body.packApproved === false) {
        return res.status(403).json({ error: 'Content pack must be approved before social publishing' });
      }

      if (action === 'schedule') {
        const scheduledAt = body.scheduledAt || post.scheduled_at;
        if (!scheduledAt) return res.status(400).json({ error: 'scheduledAt required' });
        await supabase
          .from('studio_social_posts')
          .update({
            scheduled_at: scheduledAt,
            publish_status: 'scheduled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', postId);
        await appendSocialPublishLog({
          postId,
          action: 'schedule',
          actorEmail: admin.email,
          platform: post.platform,
          caption: post.caption,
          assetUsed: post.thumbnail_url || post.cover_url,
          scheduledTime: scheduledAt,
        });
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: 'social.post.schedule',
          resourceType: 'studio_social_post',
          resourceId: postId,
          details: { platform: post.platform, scheduledAt },
        });
        return res.status(200).json({ ok: true, scheduled: true });
      }

      await supabase.from('studio_social_posts').update({ publish_status: 'publishing' }).eq('id', postId);

      const { data: acct } = await supabase
        .from('studio_social_accounts')
        .select('metadata')
        .eq('platform', post.platform)
        .maybeSingle();

      const result = await publishToSocialPlatform(post.platform as SocialPlatformId, {
        caption: post.caption,
        hashtags: post.hashtags,
        thumbnailUrl: post.thumbnail_url,
        coverUrl: post.cover_url,
        metadata: (acct?.metadata as Record<string, unknown>) ?? {},
      });

      if (!result.ok) {
        await supabase
          .from('studio_social_posts')
          .update({
            publish_status: 'failed',
            error_details: result.error,
            publish_result: result.details ?? {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', postId);
        await appendSocialPublishLog({
          postId,
          action: 'error',
          actorEmail: admin.email,
          platform: post.platform,
          caption: post.caption,
          assetUsed: post.thumbnail_url || post.cover_url,
          errorDetails: result.error,
          publishResult: result.details,
        });
        return res.status(502).json({ error: result.error, details: result.details });
      }

      await supabase
        .from('studio_social_posts')
        .update({
          publish_status: 'published',
          platform_post_id: result.platformPostId,
          publish_result: result.raw ?? {},
          error_details: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      await appendSocialPublishLog({
        postId,
        action: 'publish',
        actorEmail: admin.email,
        platform: post.platform,
        caption: post.caption,
        assetUsed: post.thumbnail_url || post.cover_url,
        publishResult: { platformPostId: result.platformPostId },
      });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'social.post.publish',
        resourceType: 'studio_social_post',
        resourceId: postId,
        details: {
          platform: post.platform,
          platformPostId: result.platformPostId,
          caption: post.caption,
          asset: post.thumbnail_url || post.cover_url,
        },
      });
      return res.status(200).json({ ok: true, platformPostId: result.platformPostId });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
