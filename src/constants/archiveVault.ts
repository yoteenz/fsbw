import { loungeTvLivePreviewPublicUrl } from '../components/lounge/loungeTvAssets';

/** Static acrylic Archive shell — poster, reduced-motion, and video failure fallback. */
export const ARCHIVE_VAULT_SHELL_POSTER_SRC = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/53196A72-274C-4B59-A1EB-6953B96348AA.png',
);

/** Ambient acrylic material loop — muted, inline, no controls. */
export const ARCHIVE_VAULT_SHELL_VIDEO_SRC = loungeTvLivePreviewPublicUrl(
  '3D%20Stock/Lounge/openart-output_1786481157883_3f928731.mp4',
);

/** @deprecated Use ARCHIVE_VAULT_SHELL_POSTER_SRC */
export const ARCHIVE_VAULT_SHELL_SRC = ARCHIVE_VAULT_SHELL_POSTER_SRC;

/** Interior safe-area registration — percentages relative to shell asset (1254×1254). */
export const ARCHIVE_VAULT_INNER_INSET = {
  left: '11%',
  right: '11%',
  top: '37%',
  bottom: '27%',
} as const;
