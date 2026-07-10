/**
 * Expert Capture — cross-profile resume entry
 * Route: /expert-capture/resume?token=...
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getExpertCaptureProfile } from '../../../studio-os-core/expert-capture/profiles';
import { loadExpertCaptureDocument } from '../../../studio-os-core/expert-capture/persistence';

export default function ExpertCaptureResumePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    const sessionId = params.get('sessionId');
    if (!token && !sessionId) {
      setError('Missing resume token');
      return;
    }
    void (async () => {
      const loaded = await loadExpertCaptureDocument({
        resumeToken: token ?? undefined,
        sessionId: sessionId ?? undefined,
      });
      if (!loaded?.document?.session?.meta?.profileId) {
        setError('Session not found or expired');
        return;
      }
      const profile = getExpertCaptureProfile(loaded.document.session.meta.profileId);
      const qs = token ? `?token=${encodeURIComponent(token)}` : `?sessionId=${encodeURIComponent(loaded.document.session.meta.id)}`;
      navigate(`${profile.route}${qs}`, { replace: true });
    })();
  }, [params, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#737373' }}>{error ?? 'Loading your saved interview…'}</p>
    </div>
  );
}
