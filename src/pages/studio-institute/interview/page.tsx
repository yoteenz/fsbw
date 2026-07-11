/**
 * Studio Institute — Interview (invite-gated)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpertCaptureProfile } from '../../../studio-os-core/expert-capture/profiles';
import {
  fetchInviteByToken,
  readActiveInviteToken,
  STUDIO_INSTITUTE_ROUTES,
  trackInviteEngagement,
  type ExpertInvite,
} from '../../../studio-os-core/expert-capture/invite-system';
import { ExpertCaptureInterviewView } from '../../expert-capture/ExpertCaptureInterviewView';
import { siStyles, SiBtn } from '../studio-institute-styles';

export default function StudioInstituteInterviewPage() {
  const navigate = useNavigate();
  const [invite, setInvite] = useState<ExpertInvite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readActiveInviteToken();
    if (!token) {
      setLoading(false);
      return;
    }
    void fetchInviteByToken(token).then((inv) => {
      setInvite(inv);
      if (inv) void trackInviteEngagement(token, 'interview_started');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>Loading interview…</div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <h1 style={siStyles.h1}>Invite required</h1>
          <p style={siStyles.sub}>Open your private invite link to access this interview.</p>
          <SiBtn onClick={() => navigate(STUDIO_INSTITUTE_ROUTES.inviteManager)}>Owner dashboard</SiBtn>
        </div>
      </div>
    );
  }

  const profile = getExpertCaptureProfile(invite.profileId);

  return (
    <ExpertCaptureInterviewView
      profile={profile}
      inviteContext={{
        invite,
        organizationLabel: invite.businessName,
      }}
    />
  );
}
