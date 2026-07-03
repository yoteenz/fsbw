import { getBawTryFlowBasePath, isBawTutorialPath } from '../constants/bawTutorialConfig';

/** Hub path after CONFIRM on a try option sub-page (preserves unit slug). */
export function resolveBawTrySubpageConfirmReturnPath(pathname: string): string | null {
  if (!isBawTutorialPath(pathname)) return null;
  return getBawTryFlowBasePath(pathname);
}
