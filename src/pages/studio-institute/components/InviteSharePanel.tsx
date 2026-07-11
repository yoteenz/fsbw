import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExpertInvite } from '../../../studio-os-core/expert-capture/invite-system';
import {
  buildDefaultInviteMessage,
  buildInvitePreviewUrl,
  buildInviteUrl,
  buildShareTitle,
  canNativeShare,
  copyTextToClipboard,
  recordInviteAudit,
  shareInviteContent,
} from '../../../studio-os-core/expert-capture/invite-system';
import { getInviteProfileLabel } from '../../../studio-os-core/expert-capture/invite-system/invite-profiles';
import { siStyles, SiBtn } from '../studio-institute-styles';

type Toast = { text: string; tone: 'ok' | 'err' } | null;

export function InviteSharePanel({
  invite,
  onRegenerated,
  compact,
}: {
  invite: ExpertInvite;
  onRegenerated?: (next: ExpertInvite) => void;
  compact?: boolean;
}) {
  const inviteUrl = useMemo(() => buildInviteUrl(invite.token), [invite.token]);
  const defaultMessage = useMemo(() => buildDefaultInviteMessage(invite, inviteUrl), [invite, inviteUrl]);
  const [message, setMessage] = useState(defaultMessage);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const showToast = (text: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 2800);
  };

  const resetMessage = () => {
    setMessage(defaultMessage);
    showToast('Message reset to default.');
  };

  const copyLink = useCallback(async () => {
    const result = await copyTextToClipboard(inviteUrl);
    if (result.ok) {
      recordInviteAudit(invite.id, 'link_copied');
      showToast('Invite link copied.');
    } else {
      showToast(result.error, 'err');
    }
  }, [invite.id, inviteUrl]);

  const copyMessage = useCallback(async () => {
    const result = await copyTextToClipboard(message);
    if (result.ok) {
      recordInviteAudit(invite.id, 'message_copied');
      showToast('Invitation message copied.');
    } else {
      showToast(result.error, 'err');
    }
  }, [invite.id, message]);

  const shareInvite = useCallback(async () => {
    recordInviteAudit(invite.id, 'share_initiated');
    const result = await shareInviteContent({
      title: buildShareTitle(invite),
      text: message,
      url: inviteUrl,
    });
    if (result === 'shared') showToast('Share sheet opened.');
    else if (result === 'cancelled') return;
    else {
      await copyMessage();
      showToast('Sharing unavailable — message copied instead.');
    }
  }, [copyMessage, invite, inviteUrl, message]);

  const openPreview = () => {
    recordInviteAudit(invite.id, 'invite_previewed');
    window.open(buildInvitePreviewUrl(invite.token), '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={compact ? undefined : siStyles.card}>
      {toast ? (
        <p
          style={{
            margin: '0 0 12px',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 14,
            background: toast.tone === 'ok' ? '#ecfdf5' : '#fef2f2',
            color: toast.tone === 'ok' ? '#047857' : '#b91c1c',
          }}
        >
          {toast.text}
        </p>
      ) : null}

      <label style={siStyles.label}>Secure invite link</label>
      <input style={siStyles.urlInput} readOnly value={inviteUrl} onFocus={(e) => e.target.select()} />

      <div style={siStyles.btnRow}>
        <SiBtn primary onClick={() => void copyLink()}>
          Copy invite link
        </SiBtn>
        {canNativeShare() ? (
          <SiBtn onClick={() => void shareInvite()}>Share invite</SiBtn>
        ) : null}
        <SiBtn onClick={openPreview}>Open invite</SiBtn>
      </div>

      {!compact ? (
        <>
          <label style={{ ...siStyles.label, marginTop: 16 }}>Ready-to-send invitation message</label>
          <textarea
            style={siStyles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={14}
          />
          <div style={siStyles.btnRow}>
            <SiBtn primary onClick={() => void copyMessage()}>
              Copy message
            </SiBtn>
            <SiBtn onClick={resetMessage}>Reset to default</SiBtn>
            <SiBtn onClick={() => void shareInvite()}>Share message</SiBtn>
          </div>
        </>
      ) : null}

      {onRegenerated ? null : (
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8' }}>
          {getInviteProfileLabel(invite.profileId)} · {invite.workerBeingCreated || 'Worker TBD'}
        </p>
      )}
    </div>
  );
}

export function InviteSuccessScreen({
  invite,
  onCreateAnother,
  onDashboard,
}: {
  invite: ExpertInvite;
  onCreateAnother: () => void;
  onDashboard: () => void;
}) {
  return (
    <div style={siStyles.card}>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600 }}>Invite created</h2>
      <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 15 }}>
        Copy the link or ready-to-send message below and send it to your expert.
      </p>

      <div style={{ display: 'grid', gap: 8, fontSize: 14, marginBottom: 16 }}>
        <p style={{ margin: 0 }}>
          <strong>Invitee:</strong> {invite.inviteeName}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Business:</strong> {invite.businessName}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Interview type:</strong> {getInviteProfileLabel(invite.profileId)}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Worker being trained:</strong> {invite.workerBeingCreated || '—'}
        </p>
        <p style={{ margin: 0 }}>
          <strong>Status:</strong> Active
        </p>
        <p style={{ margin: 0 }}>
          <strong>Expiration:</strong>{' '}
          {invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : 'None'}
        </p>
      </div>

      <InviteSharePanel invite={invite} />

      <div style={{ ...siStyles.btnRow, marginTop: 16 }}>
        <SiBtn primary onClick={onCreateAnother}>
          Create another invite
        </SiBtn>
        <SiBtn onClick={onDashboard}>Return to dashboard</SiBtn>
      </div>
    </div>
  );
}
