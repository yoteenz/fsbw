import { ASSTS_IMMERSIVE_LOADER_CONFIG } from './site00LoaderConfig';
import { Site00ImmersiveLoader } from './Site00ImmersiveLoader';
import { shouldShowAsstsImmersiveLoader } from './site00LoaderSession';
import { Site00Loader } from './Site00Loader';

/** SITE 00 route suspense only — never use for Frontal Slayer / mansion routes. */
export function Site00RouteLoadingFallback() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/assts')) {
    if (shouldShowAsstsImmersiveLoader()) {
      const config = ASSTS_IMMERSIVE_LOADER_CONFIG;
      return (
        <Site00ImmersiveLoader
          config={config}
          progress={config.stages[0]?.progress ?? 8}
          statusLabel={config.stages[0]?.label ?? 'INITIALIZING SITE 00'}
          loaderState="BOOTSTRAP"
        />
      );
    }
    return null;
  }

  return <Site00Loader context="site00" fullScreen showDelayMs={0} />;
}
