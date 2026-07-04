/**
 * Locked Product Photography System specifications — Photography System V1.0.
 * Immutable baseline; changes require new version via PhotographyVersionManager.
 */

export const PHOTOGRAPHY_SYSTEM_VERSION = '1.0' as const;

export type PhotographyLockedSpecId =
  | 'aspectRatio'
  | 'masterResolution'
  | 'background'
  | 'camera'
  | 'lens'
  | 'crop'
  | 'lighting'
  | 'displayBust'
  | 'logoPlacement'
  | 'colorProfile';

export type PhotographyLockedSpec = {
  id: PhotographyLockedSpecId;
  label: string;
  value: string;
  locked: true;
};

/** Canonical locked fields displayed in StudioOS Photography Bible admin. */
export const PHOTOGRAPHY_LOCKED_SPECIFICATIONS: readonly PhotographyLockedSpec[] = [
  { id: 'aspectRatio', label: 'Aspect Ratio', value: '1:1', locked: true },
  { id: 'masterResolution', label: 'Resolution', value: '4096×4096', locked: true },
  { id: 'background', label: 'Background', value: 'Pure White Studio', locked: true },
  { id: 'camera', label: 'Camera', value: 'Eye Level / Front Facing', locked: true },
  { id: 'lens', label: 'Lens', value: 'Studio Standard', locked: true },
  { id: 'crop', label: 'Crop', value: 'Editorial Bottom Crop', locked: true },
  { id: 'lighting', label: 'Lighting', value: 'Soft Diffused Editorial', locked: true },
  { id: 'displayBust', label: 'Display Bust', value: 'Official FS Bust v1.0', locked: true },
  { id: 'logoPlacement', label: 'Logo', value: 'Centered Chest Placement', locked: true },
  { id: 'colorProfile', label: 'Color', value: 'Neutral Editorial Grade', locked: true },
] as const;

export type PhotographySystemSpecDetail = {
  displayMannequin: string;
  cameraSystem: string;
  composition: string;
  lighting: string;
  background: string;
  colorScience: string;
  exports: string;
};

/** Extended copy for dashboard tabs — sourced from bible docs. */
export const PHOTOGRAPHY_SYSTEM_V1_DETAIL: PhotographySystemSpecDetail = {
  displayMannequin:
    'Editorial display bust — bust only, stand hidden in approved exports. Eye-level, centered presentation.',
  cameraSystem:
    'Eye-level locked camera. Fixed lens. 1:1 aspect. 4096×4096 master. Center-weighted crop locked in V1.0.',
  composition:
    'Product 55–65% frame height. Hero, three-quarter, and detail portrait variants defined in media kit templates.',
  lighting:
    'Soft key 45° front-left, controlled fill, subtle rim. Even pure white background. No gels on masters.',
  background: 'Pure White Studio — RGB 255,255,255 target on master exports.',
  colorScience: 'Locked color profile and grade chain. Texture truth over saturation. sRGB web deliverables.',
  exports:
    '4096×4096 PNG master plus website, email, mobile, desktop, transparent, and StudioOS preview derivatives.',
};

/** Future StudioOS products inherit these fields automatically. */
export const PHOTOGRAPHY_INHERITANCE_FIELDS = [
  'camera',
  'composition',
  'lighting',
  'background',
  'displayBust',
  'logoPlacement',
  'exports',
  'mediaKitStructure',
] as const;

export type PhotographyInheritanceField = (typeof PHOTOGRAPHY_INHERITANCE_FIELDS)[number];

export function getPhotographyLockedSpec(id: PhotographyLockedSpecId): PhotographyLockedSpec | undefined {
  return PHOTOGRAPHY_LOCKED_SPECIFICATIONS.find((s) => s.id === id);
}
