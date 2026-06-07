/**
 * SLAY DNA™ — hidden member identity fingerprint (model-only, never show raw JSON to members).
 */
import type { PsaMemberContextSnapshot } from './psaMemberContext.js';
import {
  ARCHETYPE_DNA_HINTS,
  normalizeSlayArchetype,
  type PsaSlayArchetype,
} from './psaSlayArchetype.js';

export type PsaSlayDnaMatchLevel = 'strong' | 'partial' | 'mismatch';

export type PsaSlayDna = {
  version: 1;
  computedAt: string;
  archetype: PsaSlayArchetype | null;
  textureAffinity: 'straight' | 'wavy' | 'curly' | 'mixed' | null;
  maintenanceTolerance: 'low' | 'medium' | 'high' | null;
  densityComfort: 'natural' | 'full' | 'extra' | null;
  primaryUnits: string[];
  behaviorTags: string[];
  consultEngaged: boolean;
  /** Model-facing narrative — never paste verbatim as a data dump to the member. */
  dnaNarrative: string;
};

const UNIT_TEXTURE: Record<string, 'straight' | 'wavy' | 'curly'> = {
  noir: 'straight',
  blanco: 'straight',
  'soft-wave': 'wavy',
  'beach-wave': 'wavy',
  'soft-curl': 'curly',
  'ocean-curl': 'curly',
};

const UNIT_NAMES: Record<string, string> = {
  noir: 'NOIR',
  blanco: 'BLANCO',
  'soft-wave': 'SOFT WAVE',
  'beach-wave': 'BEACH WAVE',
  'soft-curl': 'SOFT CURL',
  'ocean-curl': 'OCEAN CURL',
};

function inferMaintenanceFromMemories(memories: { note: string }[]): 'low' | 'medium' | 'high' | null {
  const blob = memories.map((m) => m.note.toLowerCase()).join(' ');
  if (/low maintenance|hate daily|minimal styling|everyday easy/.test(blob)) return 'low';
  if (/high maintenance|glam daily|love styling|rotation/.test(blob)) return 'high';
  if (memories.length) return 'medium';
  return null;
}

function inferDensityFromMemories(memories: { note: string }[]): 'natural' | 'full' | 'extra' | null {
  const blob = memories.map((m) => m.note.toLowerCase()).join(' ');
  if (/250|extra density|maximum fullness/.test(blob)) return 'extra';
  if (/200|full density|density/.test(blob)) return 'full';
  if (/natural|lighter density|not helmet/.test(blob)) return 'natural';
  return null;
}

function unitsFromOrders(snapshot: PsaMemberContextSnapshot): string[] {
  const names = snapshot.activeOrders
    .map((o) => (o.productName ?? '').trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(names)];
}

export function buildPsaSlayDna(snapshot: PsaMemberContextSnapshot): PsaSlayDna {
  const memories = snapshot.memories ?? [];
  const archetype = normalizeSlayArchetype(
    snapshot.slayArchetype ?? snapshot.hairProfile ?? ''
  );

  const archetypeHints = archetype ? ARCHETYPE_DNA_HINTS[archetype] : null;
  const orderUnits = unitsFromOrders(snapshot);
  const primaryUnits = orderUnits.length
    ? orderUnits
    : archetypeHints?.recommendedUnits ?? [];

  let textureAffinity: PsaSlayDna['textureAffinity'] = null;
  if (archetypeHints) {
    textureAffinity =
      archetypeHints.textureAffinity.length > 1 ? 'mixed' : archetypeHints.textureAffinity[0];
  } else if (primaryUnits.length) {
    const families = new Set(
      primaryUnits
        .map((n) => {
          const id = Object.entries(UNIT_NAMES).find(([, v]) => v === n)?.[0];
          return id ? UNIT_TEXTURE[id] : null;
        })
        .filter(Boolean)
    );
    if (families.size === 1) textureAffinity = [...families][0] as 'straight' | 'wavy' | 'curly';
    else if (families.size > 1) textureAffinity = 'mixed';
  }

  const maintenanceTolerance =
    inferMaintenanceFromMemories(memories) ?? archetypeHints?.maintenanceTolerance ?? null;
  const densityComfort = inferDensityFromMemories(memories);

  const behaviorTags: string[] = [];
  if (maintenanceTolerance === 'low') behaviorTags.push('low-maintenance');
  if (snapshot.bawDraft) behaviorTags.push('customizer');
  if ((snapshot.purchaseContexts ?? []).length) behaviorTags.push('occasion-driven');
  if (snapshot.cart.itemCount > 0) behaviorTags.push('active-shopper');
  if (archetype) behaviorTags.push(archetype.toLowerCase().replace(/\s+/g, '-'));

  const consultEngaged = (snapshot.purchaseContexts ?? []).some((p) =>
    /consult/i.test(p.occasion)
  );

  const narrativeParts = [
    archetype ? `Archetype lens: ${archetype}.` : 'Archetype not set yet.',
    textureAffinity ? `Texture DNA leans ${textureAffinity}.` : '',
    maintenanceTolerance ? `Maintenance tolerance: ${maintenanceTolerance}.` : '',
    primaryUnits.length ? `Rotation signal: ${primaryUnits.join(', ')}.` : '',
    densityComfort ? `Density comfort: ${densityComfort}.` : '',
    consultEngaged ? 'Consult-curious member.' : '',
  ].filter(Boolean);

  return {
    version: 1,
    computedAt: new Date().toISOString(),
    archetype,
    textureAffinity,
    maintenanceTolerance,
    densityComfort,
    primaryUnits,
    behaviorTags,
    consultEngaged,
    dnaNarrative: narrativeParts.join(' '),
  };
}

export function scoreUnitAgainstSlayDna(
  dna: PsaSlayDna,
  unitId: string
): { level: PsaSlayDnaMatchLevel; reason: string } {
  const id = unitId.trim().toLowerCase();
  const name = UNIT_NAMES[id] ?? unitId.toUpperCase();
  const texture = UNIT_TEXTURE[id];

  if (!texture) {
    return { level: 'partial', reason: 'Unknown unit for DNA scoring.' };
  }

  if (dna.archetype) {
    const hints = ARCHETYPE_DNA_HINTS[dna.archetype];
    if (hints.recommendedUnits.includes(name)) {
      return {
        level: 'strong',
        reason: `${name} aligns with ${dna.archetype} unit lean.`,
      };
    }
  }

  if (dna.textureAffinity && dna.textureAffinity !== 'mixed' && texture !== dna.textureAffinity) {
    return {
      level: 'mismatch',
      reason: `${name} is ${texture} but their Slay DNA leans ${dna.textureAffinity}.`,
    };
  }

  if (dna.maintenanceTolerance === 'low' && id === 'ocean-curl') {
    return {
      level: 'mismatch',
      reason: 'OCEAN CURL is high-maintenance for a low-maintenance DNA profile.',
    };
  }

  if (dna.primaryUnits.includes(name)) {
    return { level: 'strong', reason: `${name} is already in their purchase rotation.` };
  }

  return { level: 'partial', reason: `${name} could work with the right customization.` };
}

export function formatPsaSlayDnaBlock(dna: PsaSlayDna | null): string {
  if (!dna) return '';
  return `\n## SLAY DNA™ (hidden system — never show JSON or scores to the member)
Use this fingerprint to personalize. Speak in plain language only.

${dna.dnaNarrative}

**How to use DNA language (sparingly — when recommending or pushing back):**
- Strong fit: "THIS IS EXACTLY YOUR SLAY DNA" or "THIS MATCHES HOW YOU SLAY"
- Partial: explain tradeoff without the trademark phrase every time
- Mismatch: "THIS DOES NOT MATCH YOUR SLAY DNA" then say why and offer a better fit

Call \`get_slay_dna\` or \`score_unit_slay_dna\` before contradicting their pick or doubling down on a rec.
Never invent DNA traits not supported by memories, archetype, orders, or purchase context.\n`;
}
