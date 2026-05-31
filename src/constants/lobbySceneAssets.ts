/** Lobby scene art paths (see `src/pages/lobby/page.tsx`). */

export const LOBBY_NEON_LOGO_SRC = '/assets/neon-logo.png';
export const LOBBY_ROSE_BACKGROUND_SRC = '/assets/landing-background.png';
export const LOBBY_SHELF_HD_SRC = '/assets/hd-group.png';
export const LOBBY_SHELF_TRANSPARENT_SRC = '/assets/transparent-group.png';
export const LOBBY_SHELF_CUSTOM_SRC = '/assets/custom-group.png';
export const LOBBY_CASE_SRC = '/assets/CASE.png';
export const LOBBY_CASE_REGISTER_SRC = '/assets/REGISTER.png';
export const LOBBY_CASE_PHONE_DOWNLOAD_SRC = '/assets/lobby-phone.png';

/** Show small DOWNLOAD links on lobby art (dev, or `/?lobbyAssets=1`). */
export function isLobbyAssetDownloadsVisible(search: string): boolean {
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(search).get('lobbyAssets') === '1';
}

/** Fal / image-model prompts for replacing lobby PNGs (transparent PNG where noted). */
export const LOBBY_SCENE_FAL_PROMPTS = {
  neonLogo: `Photorealistic neon sign for a luxury wig boutique brand "Frontal Slayer". Hot pink and red neon glass tubing, soft bloom and wall reflection, shot straight-on on a dark charcoal wall. Premium salon aesthetic, crisp letterforms, no extra text. Export as a high-resolution PNG with a fully transparent background (alpha), no border, no floor, no mockup frame.`,

  roseBackground: `Photorealistic empty luxury hair boutique interior wall for a mobile app hero background. Soft dusty rose plaster walls, subtle wainscoting, warm salon lighting, faint marble or brass accents at the edges only. Center area kept calm and uncluttered for UI overlay. Straight-on composition, 9:16 vertical feel, no people, no products, no text, no logos. High detail, natural shadows, seamless edges.`,

  shelfHdLace: `Photorealistic wall-mounted retail shelf graphic for "HD LACE" luxury wigs. Slim floating shelf with 3–4 premium wig boxes in neutral packaging, subtle HD LACE label area. Front-facing or slight 3/4 view, soft studio light, boutique styling. PNG with fully transparent background, no wall, no text outside product labels on boxes.`,

  shelfTransparentLace: `Photorealistic wall-mounted retail shelf graphic for "TRANSPARENT LACE" luxury wigs. Same visual language as a high-end salon product bay: slim shelf, 3–4 elegant wig boxes, airy transparent-lace branding feel. Front-facing, soft shadows, PNG with fully transparent background, no wall.`,

  shelfCustomUnits: `Photorealistic wall-mounted retail shelf graphic for "CUSTOM UNITS" made-to-order wigs. Slim shelf with 3–4 luxury boxes, bespoke / atelier packaging cues. Front-facing, premium salon lighting, PNG with fully transparent background, no wall.`,

  displayCase: `Photorealistic clear acrylic boutique display case for a wig salon counter. Front view, rounded corners, subtle reflections and thickness on edges, empty interior ready for small props on top. Soft studio lighting, PNG with fully transparent background, no products inside unless minimal glare only.`,

  caseRegister: `Small photorealistic vintage-modern cash register prop for a luxury retail display case, 3/4 front angle. Metallic and matte materials, boutique styling, no brand text. PNG with fully transparent background, isolated product shot.`,

  casePhone: `Small photorealistic salon desk telephone prop for a luxury wig boutique display, 3/4 front angle. Elegant classic handset on base, neutral black or charcoal, no readable brand. PNG with fully transparent background, isolated product shot.`,
} as const;
