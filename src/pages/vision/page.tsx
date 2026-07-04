import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVisionModeById, getVisionShareBySlug } from '../../studio-os-core/vision-engine/store';
import { bootstrapVisionShareFromPath } from '../../studio-os-core/vision-engine/shareBootstrap';
import LoadingScreen from '../../components/base/LoadingScreen';

/** Vision Share™ — secure interactive presentation link (not listed in public nav). */
export default function VisionSharePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      navigate('/home/shop', { replace: true });
      return;
    }

    const link = getVisionShareBySlug(slug);
    if (!link) {
      navigate('/home/shop', { replace: true });
      return;
    }

    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
      navigate('/home/shop', { replace: true });
      return;
    }

    const ok = bootstrapVisionShareFromPath(`/vision/${slug}`);
    if (!ok) {
      navigate('/home/shop', { replace: true });
      return;
    }

    const mode = getVisionModeById(link.modeId, link.workspaceId);
    const firstRoute = mode?.stops.find((s) => s.route)?.route ?? '/home/shop';
    navigate(firstRoute, { replace: true });
  }, [navigate, slug]);

  return <LoadingScreen />;
}
