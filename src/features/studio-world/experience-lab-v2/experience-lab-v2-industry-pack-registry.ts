/**
 * Industry Pack registry — generation selectors for BUILD INDUSTRY PACKS program.
 */

import {
  INDUSTRY_PACK_REGISTRY,
  listOfficialIndustryPacks,
} from '../../../studio-os-core/industry-packs/industry-pack-registry';

export type IndustryPackSelectorEntry = {
  id: string;
  label: string;
  description: string;
  official: boolean;
};

/** Sprint-listed packs — registry-driven; extends official packs with future placeholders. */
const FUTURE_INDUSTRY_PACK_STUBS: IndustryPackSelectorEntry[] = [
  { id: 'blank-custom-pack', label: 'BLANK CUSTOM PACK', description: 'Founder-defined headquarters pack', official: false },
];

function toSelectorEntry(pack: { packId: string; name: string; description: string; official: boolean }): IndustryPackSelectorEntry {
  return {
    id: pack.packId,
    label: pack.name.replace(/\bpack\b/gi, '').trim().toUpperCase() || pack.packId.toUpperCase(),
    description: pack.description,
    official: pack.official,
  };
}

export function listIndustryPackSelectorEntries(): IndustryPackSelectorEntry[] {
  const official = listOfficialIndustryPacks().map(toSelectorEntry);
  const extension = INDUSTRY_PACK_REGISTRY.packs
    .filter((p) => !p.official)
    .map(toSelectorEntry);
  const seen = new Set<string>();
  const merged: IndustryPackSelectorEntry[] = [];
  for (const entry of [...official, ...extension, ...FUTURE_INDUSTRY_PACK_STUBS]) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    merged.push(entry);
  }
  return merged;
}

export function resolveIndustryPackSelectorEntry(
  id: string | null | undefined
): IndustryPackSelectorEntry | undefined {
  if (!id) return undefined;
  return listIndustryPackSelectorEntries().find((p) => p.id === id);
}

export function defaultIndustryPackId(): string {
  return listIndustryPackSelectorEntries()[0]?.id ?? 'official-hair-brand';
}
