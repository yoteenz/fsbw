import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import {
  isSignedIn,
  isAdminUser,
  getPreviewAdminAllowedIp,
  isPreviewEnvironment,
} from '../utils/adminAuth';

async function getClientIp(): Promise<string | null> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { method: 'GET' });
    const data = await res.json();
    return data?.ip ?? null;
  } catch {
    return null;
  }
}

/**
 * Protects admin routes. On preview (localhost/dev) with allowed IP set, grant admin even when signed out (for testing).
 * On production Vercel deploy, only listed admin emails get access and sign-in is required.
 */
export default function AdminGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [checked, setChecked] = useState(false);
  const [previewIpAllowed, setPreviewIpAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const onPreview = isPreviewEnvironment();
    const allowedIp = getPreviewAdminAllowedIp();
    const signedIn = isSignedIn();

    if (onPreview && allowedIp) {
      getClientIp().then((clientIp) => {
        const allowed = clientIp !== null && clientIp.trim() === allowedIp.trim();
        setPreviewIpAllowed(allowed);
        setChecked(true);
      });
      return;
    }

    if (onPreview && !allowedIp) {
      setPreviewIpAllowed(true);
      setChecked(true);
      return;
    }

    if (!signedIn) {
      const returnTo = encodeURIComponent(location.pathname);
      navigate(`/sign-in?returnTo=${returnTo}`, { replace: true });
      return;
    }

    const admin = isAdminUser();
    if (!admin) {
      setShowDeniedModal(true);
    }
    setPreviewIpAllowed(null);
    setChecked(true);
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!checked) return;
    const onPreview = isPreviewEnvironment();
    const allowedIp = getPreviewAdminAllowedIp();
    if (onPreview && allowedIp && previewIpAllowed === false && !isSignedIn()) {
      const returnTo = encodeURIComponent(location.pathname);
      navigate(`/sign-in?returnTo=${returnTo}`, { replace: true });
    }
  }, [checked, previewIpAllowed, location.pathname, navigate]);

  const handleDeniedConfirm = () => {
    setShowDeniedModal(false);
    navigate('/account', { replace: true });
  };

  if (!checked) {
    return null;
  }

  const admin = isAdminUser();
  const onPreview = isPreviewEnvironment();
  const allowedIp = getPreviewAdminAllowedIp();
  const waitingForIp = onPreview && !!allowedIp && previewIpAllowed === null;
  const previewAccessByIp = onPreview && !!allowedIp && previewIpAllowed === true;
  const previewAccessNoIpCheck = onPreview && !allowedIp;
  const deniedByIp = onPreview && !!allowedIp && previewIpAllowed === false;

  const hasAccess =
    (admin || previewAccessByIp || previewAccessNoIpCheck) && !waitingForIp && !deniedByIp;
  const showModal = showDeniedModal || deniedByIp;

  if (waitingForIp) {
    return null;
  }

  if (!hasAccess) {
    return (
      <>
        {null}
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleDeniedConfirm}
          onConfirm={handleDeniedConfirm}
          title="ACCESS RESTRICTED"
          message="This page is for administrators only."
          confirmText="OK"
          cancelText=""
          messageTextTransform="uppercase"
        />
      </>
    );
  }

  return <Outlet />;
}
