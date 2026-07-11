/**
 * Studio Institute — Owner Invite Manager (private, not in public nav)
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ALL_IN_ONE_PERMITTING_PROFILE,
  TAX_PREPARATION_PROFILE,
  DEFAULT_EXPERT_CAPTURE_PROFILE,
} from '../../../studio-os-core/expert-capture/profiles';
import {
  buildInviteUrl,
  createInviteOnServer,
  createInviteRecord,
  deleteInviteOnServer,
  fetchAllInvites,
  inviteStatusLabel,
  patchInviteOnServer,
  saveLocalInvite,
  type CreateExpertInviteInput,
  type ExpertInvite,
} from '../../../studio-os-core/expert-capture/invite-system';
import { siStyles, SiBtn } from '../studio-institute-styles';

const OWNER_KEY_STORAGE = 'studioInstituteOwnerKey_v1';

const PROFILE_OPTIONS = [
  { id: TAX_PREPARATION_PROFILE.id, label: 'Tax Preparation', companyId: TAX_PREPARATION_PROFILE.companyId },
  { id: ALL_IN_ONE_PERMITTING_PROFILE.id, label: 'All In One Permitting', companyId: ALL_IN_ONE_PERMITTING_PROFILE.companyId },
  { id: DEFAULT_EXPERT_CAPTURE_PROFILE.id, label: 'Generic Expert', companyId: DEFAULT_EXPERT_CAPTURE_PROFILE.companyId },
];

export default function StudioInstituteInviteManagerPage() {
  const [ownerKey, setOwnerKey] = useState(() => sessionStorage.getItem(OWNER_KEY_STORAGE) ?? '');
  const [unlocked, setUnlocked] = useState(false);
  const [invites, setInvites] = useState<ExpertInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateExpertInviteInput>({
    inviteeName: '',
    businessName: '',
    role: '',
    workerBeingCreated: '',
    profileId: TAX_PREPARATION_PROFILE.id,
    companyId: TAX_PREPARATION_PROFILE.companyId,
  });

  const load = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllInvites(key);
      setInvites(list);
      setUnlocked(true);
      sessionStorage.setItem(OWNER_KEY_STORAGE, key);
    } catch {
      setError('Could not load invites. Using local cache if available.');
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(OWNER_KEY_STORAGE);
    if (saved) void load(saved);
  }, [load]);

  const createInvite = async () => {
    if (!form.inviteeName.trim() || !form.businessName.trim()) return;
    setLoading(true);
    try {
      let invite: ExpertInvite;
      try {
        invite = await createInviteOnServer(ownerKey, form);
      } catch {
        invite = saveLocalInvite(createInviteRecord(form));
      }
      setInvites((prev) => [invite, ...prev.filter((i) => i.id !== invite.id)]);
      setForm((f) => ({ ...f, inviteeName: '', role: '', workerBeingCreated: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Private</p>
          <h1 style={siStyles.h1}>Invite Manager</h1>
          <p style={siStyles.sub}>Owner access only. Enter your Studio Institute owner key to manage expert invites.</p>
          <div style={siStyles.card}>
            <label style={siStyles.label}>Owner key</label>
            <input
              style={siStyles.input}
              type="password"
              value={ownerKey}
              onChange={(e) => setOwnerKey(e.target.value)}
              placeholder="Set STUDIO_INSTITUTE_OWNER_KEY in Vercel"
            />
            <SiBtn primary onClick={() => void load(ownerKey)} disabled={!ownerKey.trim()}>
              Unlock dashboard
            </SiBtn>
            {error ? <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={siStyles.page}>
      <div style={siStyles.container}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Invite Manager</p>
        <h1 style={siStyles.h1}>Expert Invites</h1>
        <p style={siStyles.sub}>Private knowledge acquisition — invite-only access for trusted experts.</p>

        <div style={siStyles.card}>
          <h3 style={{ margin: '0 0 16px' }}>Create invite</h3>
          <label style={siStyles.label}>Invitee name</label>
          <input style={siStyles.input} value={form.inviteeName} onChange={(e) => setForm({ ...form, inviteeName: e.target.value })} />
          <label style={siStyles.label}>Business name</label>
          <input style={siStyles.input} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <label style={siStyles.label}>Role</label>
          <input style={siStyles.input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <label style={siStyles.label}>Worker being created</label>
          <input
            style={siStyles.input}
            value={form.workerBeingCreated}
            onChange={(e) => setForm({ ...form, workerBeingCreated: e.target.value })}
            placeholder="e.g. Acme Tax Preparation Professional"
          />
          <label style={siStyles.label}>Interview profile</label>
          <select
            style={siStyles.input}
            value={form.profileId}
            onChange={(e) => {
              const opt = PROFILE_OPTIONS.find((p) => p.id === e.target.value)!;
              setForm({ ...form, profileId: opt.id, companyId: opt.companyId });
            }}
          >
            {PROFILE_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <SiBtn primary onClick={() => void createInvite()} disabled={loading}>
            Generate invite link
          </SiBtn>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600 }}>All invites ({invites.length})</h2>
        {invites.map((inv) => (
          <div key={inv.id} style={siStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <strong>{inv.inviteeName}</strong> · {inv.businessName}
                <p style={{ margin: '4px 0', fontSize: 13, color: '#64748b' }}>
                  {inviteStatusLabel(inv.status)} · {inv.progressPercent}% · Worker: {inv.workerBeingCreated}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                  {inv.currentQuestionLabel ? `Current: ${inv.currentQuestionLabel}` : 'Not started'}
                  {inv.lastActiveAt ? ` · Last active ${new Date(inv.lastActiveAt).toLocaleString()}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <SiBtn
                  onClick={() => {
                    void navigator.clipboard.writeText(buildInviteUrl(inv.token));
                  }}
                >
                  Copy link
                </SiBtn>
                <SiBtn
                  onClick={() => {
                    void patchInviteOnServer(ownerKey, inv.id, { status: 'archived', archivedAt: new Date().toISOString() }).then(
                      (u) => setInvites((prev) => prev.map((i) => (i.id === u.id ? u : i)))
                    );
                  }}
                >
                  Archive
                </SiBtn>
                <SiBtn
                  onClick={() => {
                    const dup = createInviteRecord({
                      inviteeName: inv.inviteeName,
                      businessName: inv.businessName,
                      role: inv.role,
                      workerBeingCreated: inv.workerBeingCreated,
                      profileId: inv.profileId,
                      companyId: inv.companyId,
                    });
                    saveLocalInvite(dup);
                    setInvites((prev) => [dup, ...prev]);
                  }}
                >
                  Duplicate
                </SiBtn>
                <SiBtn
                  onClick={() => {
                    void deleteInviteOnServer(ownerKey, inv.id).then(() =>
                      setInvites((prev) => prev.filter((i) => i.id !== inv.id))
                    );
                  }}
                >
                  Delete
                </SiBtn>
              </div>
            </div>
            <code style={{ fontSize: 12, color: '#475569' }}>{buildInviteUrl(inv.token)}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
