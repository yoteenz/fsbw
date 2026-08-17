import { Site00Loader } from './Site00Loader';

/** SITE 00 route suspense only — never use for Frontal Slayer / mansion routes. */
export function Site00RouteLoadingFallback() {
  return <Site00Loader context="site00" fullScreen showDelayMs={200} />;
}
