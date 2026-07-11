/**
 * Studio Institute — Invite landing (invite link = access)
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getExpertCaptureProfile } from '../../../../studio-os-core/expert-capture/profiles';
import {
  STUDIO_INSTITUTE_ROUTES,
  estimateInterviewMinutes,
  fetchInviteByToken,
  recordInviteAudit,
  resolveInviteAccess,
  INVITE_UNAVAILABLE_MESSAGE,
  verifyInvitePin,
  storeActiveInviteToken,
  type ExpertInvite,
} from '../../../../studio-os-core/expert-capture/invite-system';
import { getInviteProfileLabel } from '../../../../studio-os-core/expert-capture/invite-system/invite-profiles';
import { PROTECTION_CARDS } from '../../../../studio-os-core/expert-capture/trust-vault';
import { siStyles, SiBtn } from '../../studio-institute-styles';

export default function StudioInstituteInviteLandingPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const isOwnerPreview = searchParams.get('preview') === 'owner';
  const navigate = useNavigate();
  const [invite, setInvite] = useState<ExpertInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [pinOk, setPinOk] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(INVITE_UNAVAILABLE_MESSAGE);
      setLoading(false);
      return;
    }
    void fetchInviteByToken(token).then((inv) => {
      const access = resolveInviteAccess(inv, token);
      if (!access.ok) setError(access.message);
      else {
        setInvite(inv);
        if (isOwnerPreview && inv) recordInviteAudit(inv.id, 'invite_previewed');
        if (!inv?.hasPin && !inv?.pinHash) setPinOk(true);
      }
      setLoading(false);
    });
  }, [token, isOwnerPreview]);

  const verifyPin = async () => {
    if (!invite) return;
    const ok = await verifyInvitePin(pin, invite.pinHash);
    if (ok) {
      setPinOk(true);
      setPinError(null);
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>Loading your invite…</div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <h1 style={siStyles.h1}>Invitation unavailable</h1>
          <p style={{ ...siStyles.sub, whiteSpace: 'pre-line' }}>{error ?? INVITE_UNAVAILABLE_MESSAGE}</p>
        </div>
      </div>
    );
  }

  if (invite.hasPin && !pinOk) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <h1 style={siStyles.h1}>Enter your PIN</h1>
          <p style={siStyles.sub}>This private interview is protected with a PIN from the person who invited you.</p>
          <div style={siStyles.card}>
            <input
              style={siStyles.input}
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              autoComplete="off"
            />
            <SiBtn primary onClick={() => void verifyPin()} disabled={!pin.trim()}>
              Continue
            </SiBtn>
            {pinError ? <p style={{ color: '#dc2626', fontSize: 14 }}>{pinError}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  const profile = getExpertCaptureProfile(invite.profileId);
  const estMinutes = estimateInterviewMinutes(profile.questions.length, profile.minutesPerQuestion);

  const continueInterview = () => {
    if (isOwnerPreview) return;
    storeActiveInviteToken(invite.token);
    navigate(STUDIO_INSTITUTE_ROUTES.interview);
  };

  return (
    <div style={siStyles.page}>
      <div style={siStyles.container}>
        {isOwnerPreview ? (
          <p
            style={{
              margin: '0 0 16px',
              padding: '10px 12px',
              borderRadius: 8,
              background: '#fffbeb',
              color: '#92400e',
              fontSize: 14,
            }}
          >
            Owner preview — this is what your expert will see. Continue is disabled so you will not start their interview.
          </p>
        ) : null}
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Private invite</p>
        <h1 style={siStyles.h1}>Welcome, {invite.inviteeName}</h1>
        <p style={siStyles.sub}>
          You&apos;ve been invited to document institutional knowledge for <strong>{invite.businessName}</strong>.
        </p>

        <div style={siStyles.card}>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Interview type:</strong> {getInviteProfileLabel(invite.profileId)}
          </p>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Worker being created:</strong> {invite.workerBeingCreated}
          </p>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Your role:</strong> {invite.role}
          </p>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Estimated time:</strong> ~{estMinutes} minutes (pause anytime)
          </p>
          {invite.progressPercent > 0 ? (
            <p style={{ margin: '0 0 8px', color: '#059669' }}>
              <strong>Resume:</strong> {invite.progressPercent}% complete
              {invite.currentQuestionLabel ? ` — ${invite.currentQuestionLabel}` : ''}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Progress saves automatically. Close the browser anytime — reopen this link to continue exactly where you left off.
              Only knowledge you approve becomes eligible for training.
            </p>
          )}
        </div>

        <div style={siStyles.card}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Knowledge protection</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
            {PROTECTION_CARDS.slice(0, 4).map((c) => (
              <li key={c.id}>
                {c.title}: {c.summary}
              </li>
            ))}
          </ul>
        </div>

        <SiBtn primary onClick={continueInterview} disabled={isOwnerPreview}>
          {invite.progressPercent > 0 ? 'Resume interview' : 'Continue'}
        </SiBtn>
      </div>
    </div>
  );
}
