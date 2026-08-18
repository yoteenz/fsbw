import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Site00MobileShell } from '../components/mobile/Site00MobileShell';
import { BldrEntryPage } from '../components/bldr/BldrEntryPage';
import { SITE00_ROUTES } from '../config/routes';

function useIsMobileViewport(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return mobile;
}

/** Screen 02 — BLDR ENTRY on mobile; desktop continues to build-state workflow. */
export default function BldrPage() {
  const isMobile = useIsMobileViewport();

  if (!isMobile) {
    return <Navigate to={SITE00_ROUTES.bldrState} replace />;
  }

  return (
    <div className="site00-bldr-entry-page">
      <Site00MobileShell activeNav="build" showEnvironmentBackground={false} shellClassName="site00-mobile-shell--bldr-entry">
        <BldrEntryPage />
      </Site00MobileShell>
    </div>
  );
}
