import editRefs from './emailHeroEditRefs.json' with { type: 'json' };
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { noirFalGrayBrickMannequinPublicUrlForAngle } from '../bawNoirFalMannequinUrls.js';
import type { EmailTemplateType } from './types.js';

type EditRefEntry = {
  sceneMasterImage?: string;
  noirMannequinAngle?: 'front' | 'left' | 'right';
  imageUrl?: string;
  surgicalScene?: string;
  promptAddon?: string;
};

const ENTRIES = editRefs as Partial<Record<EmailTemplateType, EditRefEntry>>;

function repoRoot(): string {
  return process.cwd();
}

export function emailHeroEditRefPromptAddon(templateType: EmailTemplateType): string | null {
  const addon = ENTRIES[templateType]?.promptAddon?.trim();
  return addon || null;
}

export function emailHeroSurgicalScene(templateType: EmailTemplateType): string | null {
  const entry = ENTRIES[templateType];
  if (!entry?.surgicalScene?.trim() || !entry.sceneMasterImage?.trim()) return null;
  const abs = join(repoRoot(), entry.sceneMasterImage.replace(/^\//, ''));
  if (!existsSync(abs)) return null;
  return entry.surgicalScene.trim();
}

export function emailHeroSceneMasterImagePath(templateType: EmailTemplateType): string | null {
  const rel = ENTRIES[templateType]?.sceneMasterImage?.trim();
  if (!rel) return null;
  const abs = join(repoRoot(), rel.replace(/^\//, ''));
  return existsSync(abs) ? abs : null;
}

export function emailHeroUsesSceneMaster(templateType: EmailTemplateType): boolean {
  return emailHeroSceneMasterImagePath(templateType) !== null;
}

/** Extra Fal edit refs after the primary canvas (scene master or marble). */
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
