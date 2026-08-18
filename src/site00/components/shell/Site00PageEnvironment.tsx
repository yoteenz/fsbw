import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import {
  SITE00_PAGE_DESKTOP_BG_FILE,
  SITE00_PAGE_MOBILE_BG_FILE,
} from '../../config/site00-page-assets';

const desktopBgUrl = resolveSite00PublicAsset(SITE00_PAGE_DESKTOP_BG_FILE);
const mobileBgUrl = resolveSite00PublicAsset(SITE00_PAGE_MOBILE_BG_FILE);

type Site00PageEnvironmentProps = {
  className?: string;
};

/** Approved shared architectural backgrounds — desktop + dedicated mobile asset. */
export function Site00PageEnvironment({ className = '' }: Site00PageEnvironmentProps) {
  return (
    <div
      className={`site00-page-env ${className}`.trim()}
      aria-hidden="true"
      style={{
        ['--site00-page-desktop-bg' as string]: desktopBgUrl ? `url("${desktopBgUrl}")` : undefined,
        ['--site00-page-mobile-bg' as string]: mobileBgUrl ? `url("${mobileBgUrl}")` : undefined,
      }}
    />
  );
}
