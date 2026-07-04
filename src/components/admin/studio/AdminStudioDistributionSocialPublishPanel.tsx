import { useEffect, useMemo, useState } from 'react';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import { AdminStudioEditableField } from './AdminStudioEditableField';
import { useAdminStudioSocialPosts } from '../../../hooks/useAdminStudioSocialPosts';
import { SOCIAL_PUBLISH_CHANNEL_IDS } from '../../../utils/adminStudioSocialPublishing';
import type { DistributionPack, DistributionChannelId } from '../../../utils/adminStudioDistributionNetworkDemo';
import type { SocialPlatformId } from '../../../utils/adminStudioSocialPublishing';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioDistributionSocialPublishPanelProps = {
  pack: DistributionPack;
  packApproved: boolean;
  onOpenSocialAccounts: () => void;
};

export function AdminStudioDistributionSocialPublishPanel({
  pack,
  packApproved,
  onOpenSocialAccounts,
}: AdminStudioDistributionSocialPublishPanelProps) {
  const socialChannels = pack.routingChannels.filter((c): c is SocialPlatformId =>
    SOCIAL_PUBLISH_CHANNEL_IDS.includes(c as SocialPlatformId)
  );
  const [platform, setPlatform] = useState<SocialPlatformId>(socialChannels[0] ?? 'instagram');
  const { posts, log, loading, error, busy, saveDraft, runAction } = useAdminStudioSocialPosts(pack.id);

  const channelVer = pack.channelVersions[platform as DistributionChannelId];
  const existing = useMemo(() => posts.find((p) => p.platform === platform), [posts, platform]);

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [cover, setCover] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    setCaption(existing?.caption ?? channelVer?.caption ?? '');
    setHashtags(existing?.hashtags ?? '');
    setThumbnail(existing?.thumbnail_url ?? channelVer?.thumbnail ?? '');
    setCover(existing?.cover_url ?? channelVer?.thumbnail ?? '');
    setScheduledAt(existing?.scheduled_at ?? `${pack.scheduledDate}T${pack.scheduledTime || '19:00'}`);
  }, [existing, channelVer, pack.scheduledDate, pack.scheduledTime, platform]);

  const canPublish = packApproved && existing?.approval_status === 'approved';

  if (socialChannels.length === 0) {
    return (
      <p className="text-[7px] font-futura uppercase mt-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ADD INSTAGRAM, FACEBOOK, TIKTOK, PINTEREST, OR X TO ROUTING TO PUBLISH SOCIALLY
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          OFFICIAL OAUTH ONLY · ADMIN APPROVAL REQUIRED · NO AUTO-PUBLISH
        </p>
        {!packApproved ? (
          <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            APPROVE CONTENT PACK BEFORE SCHEDULING OR PUBLISHING
          </p>
        ) : null}
        <button type="button" onClick={onOpenSocialAccounts} className="mt-2 text-[6px] font-futura uppercase underline" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          SOCIAL ACCOUNTS SETTINGS →
        </button>
      </div>

      <AdminStudioSectionHeading>PLATFORM</AdminStudioSectionHeading>
      <div className="flex flex-wrap gap-1">
        {socialChannels.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setPlatform(ch)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: platform === ch ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary,
              background: platform === ch ? pack.accentHex : 'rgba(255,255,255,0.8)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {ch.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <AdminStudioSectionHeading>CHANNEL PREVIEW</AdminStudioSectionHeading>
      <div className="p-3 border" style={{ background: 'rgba(255,255,255,0.85)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{caption || 'CAPTION…'}</p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#2563EB' }}>{hashtags || '#HASHTAGS'}</p>
        <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          THUMB: {thumbnail || '—'} · COVER: {cover || '—'}
        </p>
        <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          STATUS: {existing?.approval_status?.replace('_', ' ').toUpperCase() ?? 'DRAFT'} · {existing?.publish_status?.toUpperCase() ?? 'DRAFT'}
        </p>
      </div>

      <AdminStudioEditableField label="CAPTION" value={caption} onChange={setCaption} multiline accentHex={pack.accentHex} />
      <AdminStudioEditableField label="HASHTAGS" value={hashtags} onChange={setHashtags} multiline accentHex={pack.accentHex} />
      <AdminStudioEditableField label="THUMBNAIL" value={thumbnail} onChange={setThumbnail} accentHex={pack.accentHex} />
      <AdminStudioEditableField label="COVER" value={cover} onChange={setCover} accentHex={pack.accentHex} />
      <AdminStudioEditableField label="SCHEDULED TIME (ISO)" value={scheduledAt} onChange={setScheduledAt} accentHex={pack.accentHex} />

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void saveDraft({ id: existing?.id, platform, caption, hashtags, thumbnailUrl: thumbnail, coverUrl: cover, contentPackRef: pack.contentPackRef })}
          className="px-2 py-1.5 text-[6px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          SAVE DRAFT
        </button>
        <button
          type="button"
          disabled={busy || loading}
          onClick={() => void saveDraft({ id: existing?.id, platform, caption, hashtags, thumbnailUrl: thumbnail, coverUrl: cover, contentPackRef: pack.contentPackRef, submitApproval: true })}
          className="px-2 py-1.5 text-[6px] font-futura uppercase border"
          style={{ fontWeight: 515, color: '#FFF', background: pack.accentHex, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          SUBMIT FOR APPROVAL
        </button>
        {existing?.approval_status === 'pending_approval' ? (
          <button type="button" disabled={busy} onClick={() => void runAction(existing.id, 'approve')} className="px-2 py-1.5 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            APPROVE POST
          </button>
        ) : null}
        <button
          type="button"
          disabled={!canPublish || busy}
          onClick={() => existing && void runAction(existing.id, 'schedule', { scheduledAt, packApproved })}
          className="px-2 py-1.5 text-[6px] font-futura uppercase border"
          style={{ fontWeight: 515, color: canPublish ? ADMIN_STUDIO_THEME.textSecondary : '#9CA3AF', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          SCHEDULE POST
        </button>
        <button
          type="button"
          disabled={!canPublish || busy}
          onClick={() => existing && void runAction(existing.id, 'publish', { packApproved })}
          className="px-2 py-1.5 text-[6px] font-futura uppercase border"
          style={{ fontWeight: 515, color: canPublish ? '#FFF' : '#9CA3AF', background: canPublish ? ADMIN_STUDIO_THEME.accent : 'transparent', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          PUBLISH NOW
        </button>
      </div>

      {error ? (
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{error}</p>
      ) : null}

      <AdminStudioSectionHeading>PUBLISH LOG</AdminStudioSectionHeading>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {log.slice(0, 8).map((entry) => (
          <div key={entry.id} className="px-2 py-1 border text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            {entry.action} · {entry.platform} · {entry.actor_email ?? '—'} · {new Date(entry.created_at).toLocaleString()}
            {entry.error_details ? ` · ${entry.error_details}` : ''}
          </div>
        ))}
        {log.length === 0 ? <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>NO ACTIONS LOGGED YET</p> : null}
      </div>
    </div>
  );
}
