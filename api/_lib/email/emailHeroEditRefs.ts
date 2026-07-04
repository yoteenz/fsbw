import editRefs from './emailHeroEditRefs.json' with { type: 'json' };
import { noirFalGrayBrickMannequinPublicUrlForAngle } from '../bawNoirFalMannequinUrls.js';
import type { EmailTemplateType } from './types.js';

type EditRefEntry = {
  noirMannequinAngle?: 'front' | 'left' | 'right';
  imageUrl?: string;
  promptAddon?: string;
};

const ENTRIES = editRefs as Partial<Record<EmailTemplateType, EditRefEntry>>;

export function emailHeroEditRefPromptAddon(templateType: EmailTemplateType): string | null {
  const addon = ENTRIES[templateType]?.promptAddon?.trim();
  return addon || null;
}

/** Extra Fal edit refs after marble (e.g. NOIR gray-brick mannequin for welcome). */
export function emailHeroEditRefImageUrls(templateType: EmailTemplateType): string[] {
  const entry = ENTRIES[templateType];
  if (!entry) return [];

  if (entry.imageUrl?.trim()) {
    return [entry.imageUrl.trim()];
  }

  const angle = entry.noirMannequinAngle;
  if (angle) {
    return [noirFalGrayBrickMannequinPublicUrlForAngle(angle)];
  }

  return [];
}
