/**
 * Fal prompts for lounge TV hardware (optional reference / hero assets).
 * The live overlay uses CSS bezel + React UI on the screen; these prompts help
 * if you generate a TV frame reference or a static lounge mock.
 */

export const LOUNGE_TV_FAL_NEGATIVE =
  'curtains, theater, stage, people, room interior, bright screen content, youtube UI, text on screen, logo, watermark, CRT tube, retro wood console, wall mount bracket, extreme perspective, fisheye';

/** Screen area should stay dark/empty — UI is drawn in the app. */
export const LOUNGE_TV_FAL_PROMPT_FLATSCREEN = `Front-facing modern flat-panel television, product-style photo. Charcoal-black plastic bezel: thin uniform frame on top and sides, slightly thicker bottom chin (typical TV). Matte black glass screen is OFF — uniform dark gray-black with subtle glass reflection at upper edge only, no picture content. Soft studio lighting, no stand or cropped minimal desk stand. Centered, symmetrical, realistic proportions (16:9 screen). Not a plain black rectangle floating in space — clearly a physical TV set.`;

/** Use when compositing over lounge photo: TV only, transparent or white bg. */
export const LOUNGE_TV_FAL_PROMPT_FOR_LOUNGE_COMPOSITE = `${LOUNGE_TV_FAL_PROMPT_FLATSCREEN} Isolated on transparent or solid neutral gray background for cutout. No curtains, no room.`;

export const LOUNGE_TV_FAL_SETTINGS = {
  model: 'fal-ai/nano-banana-pro/edit',
  aspectRatio: 'auto (match reference)',
  note: 'Download + Fal prompt: LOUNGE_SCENE_FAL_PROMPTS.tvDesign → sceneLoungeTvFal.ts. Asset: lounge-tv-design.png. Lounge slide + overlay use LoungeTvDesignFrame.',
} as const;
