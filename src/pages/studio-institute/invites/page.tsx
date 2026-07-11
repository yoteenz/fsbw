/**
 * Studio Institute — Owner Invite Manager (/studio-institute/invites)
 */
import { useCallback, useEffect, useState } from 'react';
import {
  INVITE_PROFILE_OPTIONS,
  bootstrapOwnerPasswordOnServer,
  checkOwnerPasswordConfiguredOnServer,
  clearOwnerSession,
  createInviteLocal,
  createInviteOnServer,
  createInviteRecord,
  deleteInviteOnServer,
  displayInviteStatus,
  fetchAllInvites,
  getInviteProfileLabel,
  getOwnerAuthToken,
  getStoredOwnerPasswordHash,
  hasOwnerPasswordConfigured,
  MIN_OWNER_PASSWORD_LENGTH,
  patchInviteOnServer,
  recordInviteAudit,
  regenerateInviteOnServer,
  saveLocalInvite,
  saveOwnerPassword,
  unlockWithOwnerPassword,
  type CreateExpertInviteInput,
  type ExpertInvite,
} from '../../../studio-os-core/expert-capture/invite-system';
import { InviteSharePanel, InviteSuccessScreen } from '../components/InviteSharePanel';
import { siStyles, SiBtn } from '../studio-institute-styles';

type View = 'dashboard' | 'success';
type AuthMode = 'loading' | 'setup' | 'login';

export default function StudioInstituteInvitesPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('loading');
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invites, setInvites] = useState<ExpertInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [createdInvite, setCreatedInvite] = useState<ExpertInvite | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState<string | null>(null);

  const [form, setForm] = useState<CreateExpertInviteInput & { accessPin?: string }>({
    inviteeName: '',
    businessName: '',
    role: '',
    workerBeingCreated: '',
    profileId: INVITE_PROFILE_OPTIONS[0]!.id,
    companyId: INVITE_PROFILE_OPTIONS[0]!.companyId,
    welcomeNote: '',
    expiresAt: '',
    accessPin: '',
    accessStatus: 'active',
  });

  const ownerAuthToken = () => getOwnerAuthToken() ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllInvites();
      setInvites(list.filter((i) => i.accessStatus !== 'deleted'));
      setUnlocked(true);
    } catch {
      setError('Could not load invites. Using local cache if available.');
      setInvites([]);
      setUnlocked(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const sessionToken = getOwnerAuthToken();
      const storedHash = getStoredOwnerPasswordHash();
      if (sessionToken && storedHash && sessionToken === storedHash) {
        await load();
        return;
      }
      const serverConfigured = await checkOwnerPasswordConfiguredOnServer();
      setAuthMode(hasOwnerPasswordConfigured() || serverConfigured ? 'login' : 'setup');
    };
    void init();
  }, [load]);

  const handleAuth = async () => {
    setError(null);
    if (password.length < MIN_OWNER_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_OWNER_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'setup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const hash = await saveOwnerPassword(password);
        await bootstrapOwnerPasswordOnServer(hash);
        setPassword('');
        setConfirmPassword('');
        await load();
        return;
      }

      const result = await unlockWithOwnerPassword(password);
      if (result === 'wrong') {
        setError('Incorrect password.');
        return;
      }
      if (result === 'offline') {
        setError('Could not verify password. Check your connection and try again.');
        return;
      }
      setPassword('');
      await load();
    } finally {
      setLoading(false);
    }
  };

  const lockDashboard = () => {
    clearOwnerSession();
    setUnlocked(false);
    setPassword('');
    setConfirmPassword('');
    setAuthMode(hasOwnerPasswordConfigured() ? 'login' : 'setup');
  };

  const updateInvite = (next: ExpertInvite) => {
    setInvites((prev) => prev.map((i) => (i.id === next.id ? next : i)));
  };

  const createInvite = async () => {
    if (!form.inviteeName.trim() || !form.businessName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const input: CreateExpertInviteInput = {
        inviteeName: form.inviteeName,
        businessName: form.businessName,
        role: form.role,
        workerBeingCreated: form.workerBeingCreated,
        profileId: form.profileId,
        companyId: form.companyId,
        welcomeNote: form.welcomeNote || null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        accessPin: form.accessPin?.trim() || null,
        accessStatus: 'active',
      };
      let invite: ExpertInvite;
      try {
        invite = await createInviteOnServer(ownerAuthToken(), input);
      } catch {
        invite = await createInviteLocal(input);
      }
      recordInviteAudit(invite.id, 'invite_created');
      setInvites((prev) => [invite, ...prev.filter((i) => i.id !== invite.id)]);
      setCreatedInvite(invite);
      setView('success');
      setForm((f) => ({
        ...f,
        inviteeName: '',
        role: '',
        workerBeingCreated: '',
        welcomeNote: '',
        expiresAt: '',
        accessPin: '',
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const patchInvite = async (id: string, patch: Partial<ExpertInvite>, audit?: Parameters<typeof recordInviteAudit>[1]) => {
    try {
      const updated = await patchInviteOnServer(ownerAuthToken(), id, patch);
      updateInvite(updated);
      if (audit) recordInviteAudit(id, audit);
    } catch {
      const local = invites.find((i) => i.id === id);
      if (local) {
        const updated = saveLocalInvite({ ...local, ...patch });
        updateInvite(updated);
        if (audit) recordInviteAudit(id, audit);
      }
    }
  };

  const regenerateLink = async (id: string) => {
    setLoading(true);
    try {
      const updated = await regenerateInviteOnServer(ownerAuthToken(), id);
      updateInvite(updated);
      recordInviteAudit(id, 'link_regenerated');
      if (createdInvite?.id === id) setCreatedInvite(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regenerate failed');
    } finally {
      setConfirmRegenerate(null);
      setLoading(false);
    }
  };

  if (authMode === 'loading' && !unlocked) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Private</p>
          <h1 style={siStyles.h1}>Invite Manager</h1>
          <p style={siStyles.sub}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Private</p>
          <h1 style={siStyles.h1}>Invite Manager</h1>
          <p style={siStyles.sub}>
            {authMode === 'setup'
              ? 'Create your owner password once. You will use it to unlock this dashboard on any device.'
              : 'Enter your owner password to manage expert invites.'}
          </p>
          <div style={siStyles.card}>
            <label style={siStyles.label}>{authMode === 'setup' ? 'Create password' : 'Password'}</label>
            <input
              style={siStyles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`At least ${MIN_OWNER_PASSWORD_LENGTH} characters`}
              autoComplete={authMode === 'setup' ? 'new-password' : 'current-password'}
            />
            {authMode === 'setup' ? (
              <>
                <label style={siStyles.label}>Confirm password</label>
                <input
                  style={siStyles.input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </>
            ) : null}
            <SiBtn primary fullWidth onClick={() => void handleAuth()} disabled={loading || !password.trim()}>
              {authMode === 'setup' ? 'Save password & unlock' : 'Unlock dashboard'}
            </SiBtn>
            {error ? <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'success' && createdInvite) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <InviteSuccessScreen
            invite={createdInvite}
            onCreateAnother={() => {
              setView('dashboard');
              setCreatedInvite(null);
            }}
            onDashboard={() => {
              setView('dashboard');
              setCreatedInvite(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={siStyles.page}>
      <div style={siStyles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Invite Manager</p>
            <h1 style={siStyles.h1}>Expert Invites</h1>
            <p style={siStyles.sub}>Create, copy, and share private interview invitations — optimized for mobile.</p>
          </div>
          <SiBtn onClick={lockDashboard}>Lock</SiBtn>
        </div>

        <div style={siStyles.card}>
          <h3 style={{ margin: '0 0 16px' }}>Create invite</h3>
          <label style={siStyles.label}>Invitee name</label>
          <input
            style={siStyles.input}
            value={form.inviteeName}
            onChange={(e) => setForm({ ...form, inviteeName: e.target.value })}
            autoComplete="name"
          />
          <label style={siStyles.label}>Business name</label>
          <input
            style={siStyles.input}
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
          <label style={siStyles.label}>Professional role</label>
          <input style={siStyles.input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <label style={siStyles.label}>Interview type</label>
          <select
            style={siStyles.input}
            value={form.profileId}
            onChange={(e) => {
              const opt = INVITE_PROFILE_OPTIONS.find((p) => p.id === e.target.value)!;
              setForm({ ...form, profileId: opt.id, companyId: opt.companyId });
            }}
          >
            {INVITE_PROFILE_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <label style={siStyles.label}>Worker being trained</label>
          <input
            style={siStyles.input}
            value={form.workerBeingCreated}
            onChange={(e) => setForm({ ...form, workerBeingCreated: e.target.value })}
            placeholder="e.g. Acme Tax Preparation Professional"
          />
          <label style={siStyles.label}>Optional welcome note (prepended to invitation message)</label>
          <textarea
            style={{ ...siStyles.textarea, minHeight: 80 }}
            value={form.welcomeNote ?? ''}
            onChange={(e) => setForm({ ...form, welcomeNote: e.target.value })}
            rows={3}
          />
          <label style={siStyles.label}>Optional expiration date</label>
          <input
            style={siStyles.input}
            type="datetime-local"
            value={form.expiresAt ?? ''}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
          <label style={siStyles.label}>Optional PIN (expert enters PIN to open invite)</label>
          <input
            style={siStyles.input}
            type="password"
            value={form.accessPin ?? ''}
            onChange={(e) => setForm({ ...form, accessPin: e.target.value })}
            placeholder="Leave blank for link-only access"
            autoComplete="new-password"
          />
          <SiBtn primary fullWidth onClick={() => void createInvite()} disabled={loading}>
            Generate secure invite link
          </SiBtn>
          {error ? <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p> : null}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600 }}>All invites ({invites.length})</h2>
        {invites.map((inv) => (
          <div key={inv.id} style={siStyles.card}>
            <div style={{ marginBottom: 10 }}>
              <strong>{inv.inviteeName}</strong> · {inv.businessName}
              <p style={{ margin: '6px 0', fontSize: 13, color: '#64748b' }}>
                {getInviteProfileLabel(inv.profileId)} · {displayInviteStatus(inv)} · {inv.progressPercent}% progress
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                Worker: {inv.workerBeingCreated || '—'}
                {inv.lastActiveAt ? ` · Last active ${new Date(inv.lastActiveAt).toLocaleString()}` : ''}
                {inv.createdAt ? ` · Created ${new Date(inv.createdAt).toLocaleDateString()}` : ''}
                {inv.expiresAt ? ` · Expires ${new Date(inv.expiresAt).toLocaleString()}` : ''}
              </p>
              {inv.currentQuestionLabel ? (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Current: {inv.currentQuestionLabel}</p>
              ) : null}
            </div>

            <div style={siStyles.btnRow}>
              <SiBtn onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}>
                {expandedId === inv.id ? 'Hide actions' : 'Copy / Share'}
              </SiBtn>
              <SiBtn
                onClick={() =>
                  void patchInvite(
                    inv.id,
                    { accessStatus: inv.accessStatus === 'paused' ? 'active' : 'paused' },
                    inv.accessStatus === 'paused' ? 'access_resumed' : 'access_paused'
                  )
                }
              >
                {inv.accessStatus === 'paused' ? 'Resume access' : 'Pause access'}
              </SiBtn>
              <SiBtn
                onClick={() => {
                  if (confirmRegenerate === inv.id) void regenerateLink(inv.id);
                  else setConfirmRegenerate(inv.id);
                }}
              >
                {confirmRegenerate === inv.id ? 'Confirm regenerate' : 'Regenerate link'}
              </SiBtn>
              <SiBtn
                onClick={() =>
                  void patchInvite(inv.id, {
                    status: 'archived',
                    accessStatus: 'archived',
                    archivedAt: new Date().toISOString(),
                  }, 'invite_archived')
                }
              >
                Archive
              </SiBtn>
              <SiBtn
                onClick={() => {
                  const dup = saveLocalInvite(
                    createInviteRecord({
                      inviteeName: inv.inviteeName,
                      businessName: inv.businessName,
                      role: inv.role,
                      workerBeingCreated: inv.workerBeingCreated,
                      profileId: inv.profileId,
                      companyId: inv.companyId,
                    })
                  );
                  recordInviteAudit(dup.id, 'invite_created');
                  setInvites((prev) => [dup, ...prev]);
                }}
              >
                Duplicate
              </SiBtn>
              <SiBtn
                onClick={() => {
                  void deleteInviteOnServer(ownerAuthToken(), inv.id).then(() => {
                    recordInviteAudit(inv.id, 'invite_deleted');
                    setInvites((prev) => prev.filter((i) => i.id !== inv.id));
                  });
                }}
              >
                Delete
              </SiBtn>
            </div>

            {expandedId === inv.id ? <InviteSharePanel invite={inv} compact={false} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
