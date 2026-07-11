import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExpertCaptureProfile } from '../../../studio-os-core/expert-capture/profiles';
import { fetchInviteByToken, readActiveInviteToken, STUDIO_INSTITUTE_ROUTES } from '../../../studio-os-core/expert-capture/invite-system';
import KnowledgeVaultPage from '../../expert-capture/trust-vault/KnowledgeVaultPage';
import { siStyles, SiBtn } from '../studio-institute-styles';

export default function StudioInstituteVaultPage() {
  const navigate = useNavigate();
  const [profileSlug, setProfileSlug] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readActiveInviteToken();
    if (!token) {
      setLoading(false);
      return;
    }
    void fetchInviteByToken(token).then((inv) => {
      if (inv) {
        const profile = getExpertCaptureProfile(inv.profileId);
        if (profile.id.includes('tax')) setProfileSlug('tax-preparation');
        else if (profile.id.includes('permitting')) setProfileSlug('all-in-one-permitting');
        else setProfileSlug(undefined);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={siStyles.page}><div style={siStyles.container}>Loading vault…</div></div>;

  if (!readActiveInviteToken()) {
    return (
      <div style={siStyles.page}>
        <div style={siStyles.container}>
          <h1 style={siStyles.h1}>Invite required</h1>
          <SiBtn onClick={() => navigate(STUDIO_INSTITUTE_ROUTES.inviteManager)}>Back</SiBtn>
        </div>
      </div>
    );
  }

  return <KnowledgeVaultPage profileSlug={profileSlug} />;
}
