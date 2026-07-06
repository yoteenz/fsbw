import { useLocation } from 'react-router-dom';
import { resolvePlatformNavFromPath } from '../../../../studio-os-core/platform/navigation';
import StudioPlatformModulePage from './page';

export default function StudioPlatformModuleHost() {
  const { pathname } = useLocation();
  const nav = resolvePlatformNavFromPath(pathname);
  if (!nav) {
    return <StudioPlatformModulePage moduleId="studio-settings" />;
  }
  return <StudioPlatformModulePage moduleId={nav.id} />;
}
