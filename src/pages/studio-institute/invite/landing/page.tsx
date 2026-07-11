/**
 * Studio Institute — Invite landing (invite link = access)
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getExpertCaptureProfile } from '../../../../studio-os-core/expert-capture/profiles';
import {
  STUDIO_INSTITUTE_ROUTES,
  estimateInterviewMinutes,
  fetchInviteByToken,
  isInviteExpired,
  storeActiveInviteToken,
  type ExpertInvite,
} from '../../../../studio-os-core/expert-capture/invite-system';
import { PROTECTION_CARDS } from '../../../../studio-os-core/expert-capture/trust-vault';
import { siStyles, SiBtn } from '../../studio-institute-styles';

export default function StudioInstituteInviteLandingPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<ExpertInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }
    void fetchInviteByToken(token).then((inv) => {
      if (!inv) setError('Invite not found');
      else if (isInviteExpired(inv)) setError('This invite has expired');
      else if (inv.status === 'archived') setError('This invite has been archived');
      else setInvite(inv);
      setLoading(false);
    });
  }, [token]);

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
          <h1 style={siStyles.h1}>Invite unavailable</h1>
          <p style={siStyles.sub}>{error ?? 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const profile = getExpertCaptureProfile(invite.profileId);
  const estMinutes = estimateInterviewMinutes(profile.questions.length, profile.minutesPerQuestion);

  const continueInterview = () => {
    storeActiveInviteToken(invite.token);
    navigate(STUDIO_INSTITUTE_ROUTES.interview);
  };

  return (
    <div style={siStyles.page}>
      <div style={siStyles.container}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio Institute · Private invite</p>
        <h1 style={siStyles.h1}>Welcome, {invite.inviteeName}</h1>
        <p style={siStyles.sub}>
          You&apos;ve been invited to document institutional knowledge for <strong>{invite.businessName}</strong>.
        </p>

        <div style={siStyles.card}>
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
            </p>
          )}
        </div>

        <div style={siStyles.card}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Knowledge protection</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
            {PROTECTION_CARDS.slice(0, 4).map((c) => (
              <li key={c.id}>{c.title}: {c.summary}</li>
            ))}
          </ul>
        </div>

        <SiBtn primary onClick={continueInterview}>
          {invite.progressPercent > 0 ? 'Resume interview' : 'Continue'}
        </SiBtn>
      </div>
    </div>
  );
}
