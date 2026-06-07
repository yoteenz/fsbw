/**
 * Concierge memory cards — tiny preference snippets in psa_member_context JSON.
 */
import { getSupabaseAdminServiceRole } from './supabase.js';
import type { PsaMemberContextSnapshot } from './psaMemberContext.js';
import type { PsaPurchaseContextNote } from './psaSlayJournal.js';
import { normalizePurchaseOccasion } from './psaSlayJournal.js';
import { LEGACY_HAIR_PROFILE_TO_ARCHETYPE, normalizeSlayArchetype } from './psaSlayArchetype.js';

export const PSA_HAIR_SLAYER_PROFILES = [
  'THE EFFORTLESS SLAYER',
  'THE CEO SLAYER',
  'THE SOFT GLAM SLAYER',
  'THE VACATION SLAYER',
  'THE BIRTHDAY BEHAVIOR SLAYER',
] as const;

export type PsaHairSlayerProfile = (typeof PSA_HAIR_SLAYER_PROFILES)[number];

export type PsaMemberMemory = {
  id: string;
  note: string;
  createdAt: string;
};

const MAX_MEMORIES = 12;

function memoryId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeMemoryNote(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 160);
}

export async function getStoredMemberContextRow(
  userId: string
): Promise<PsaMemberContextSnapshot | null> {
  try {
    const supabase = getSupabaseAdminServiceRole();
    const { data, error } = await supabase
      .from('psa_member_context')
      .select('context')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const ctx = (data as { context?: PsaMemberContextSnapshot }).context;
    return ctx && typeof ctx === 'object' ? ctx : null;
  } catch {
    return null;
  }
}

const MAX_PURCHASE_CONTEXTS = 8;

export async function persistMemberContextExtras(
  userId: string,
  patch: Partial<
    Pick<
      PsaMemberContextSnapshot,
      'memories' | 'hairProfile' | 'bawDraft' | 'purchaseContexts' | 'slayArchetype'
    >
  >
): Promise<void> {
  const supabase = getSupabaseAdminServiceRole();
  const existing = (await getStoredMemberContextRow(userId)) ?? {
    tierLabel: '',
    subscriptionTier: null,
    cart: { itemCount: 0, unitNames: [] },
    activeOrders: [],
    refreshedAt: new Date().toISOString(),
  };
  const merged: PsaMemberContextSnapshot = {
    ...existing,
    ...patch,
    memories: patch.memories ?? existing.memories ?? [],
    hairProfile: patch.hairProfile !== undefined ? patch.hairProfile : existing.hairProfile ?? null,
    bawDraft: patch.bawDraft !== undefined ? patch.bawDraft : existing.bawDraft ?? null,
    purchaseContexts:
      patch.purchaseContexts !== undefined ? patch.purchaseContexts : existing.purchaseContexts ?? [],
    slayArchetype:
      patch.slayArchetype !== undefined ? patch.slayArchetype : existing.slayArchetype ?? null,
  };
  await supabase.from('psa_member_context').upsert({
    user_id: userId,
    context: merged,
    updated_at: new Date().toISOString(),
  });
}

export async function addMemberMemory(userId: string, note: string): Promise<PsaMemberMemory[]> {
  const normalized = normalizeMemoryNote(note);
  if (!normalized) return (await getStoredMemberContextRow(userId))?.memories ?? [];

  const existing = (await getStoredMemberContextRow(userId))?.memories ?? [];
  const dup = existing.some((m) => m.note.toLowerCase() === normalized.toLowerCase());
  const next = dup
    ? existing
    : [{ id: memoryId(), note: normalized, createdAt: new Date().toISOString() }, ...existing].slice(
        0,
        MAX_MEMORIES
      );

  await persistMemberContextExtras(userId, { memories: next });
  return next;
}

/** @deprecated Legacy alias — maps Hair Slayer profile to canonical Slay Archetype. */
export async function setHairSlayerProfile(
  userId: string,
  profile: string
): Promise<PsaHairSlayerProfile | null> {
  const upper = profile.trim().toUpperCase();
  const match = PSA_HAIR_SLAYER_PROFILES.find((p) => p === upper);
  if (!match) return null;
  const archetype = LEGACY_HAIR_PROFILE_TO_ARCHETYPE[match];
  await persistMemberContextExtras(userId, {
    hairProfile: match,
    slayArchetype: archetype ?? null,
  });
  return match;
}

function purchaseContextId(): string {
  return `pc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function setSlayArchetype(
  userId: string,
  archetype: string
): Promise<string | null> {
  const match = normalizeSlayArchetype(archetype);
  if (!match) return null;
  await persistMemberContextExtras(userId, { slayArchetype: match });
  return match;
}

export async function addPurchaseContextNote(
  userId: string,
  input: {
    occasion: string;
    monthYear?: string;
    orderNumber?: string;
    unitName?: string;
    unitId?: string;
  }
): Promise<PsaPurchaseContextNote[]> {
  const occasion = normalizePurchaseOccasion(input.occasion);
  if (!occasion) return (await getStoredMemberContextRow(userId))?.purchaseContexts ?? [];

  const existing = (await getStoredMemberContextRow(userId))?.purchaseContexts ?? [];
  const row: PsaPurchaseContextNote = {
    id: purchaseContextId(),
    occasion,
    monthYear: input.monthYear?.trim() || undefined,
    orderNumber: input.orderNumber?.trim() || undefined,
    unitName: input.unitName?.trim().toUpperCase() || undefined,
    unitId: input.unitId?.trim().toLowerCase() || undefined,
    createdAt: new Date().toISOString(),
  };
  const next = [row, ...existing].slice(0, MAX_PURCHASE_CONTEXTS);
  await persistMemberContextExtras(userId, { purchaseContexts: next });
  return next;
}

export function formatPsaMemoriesBlock(ctx: PsaMemberContextSnapshot | null): string {
  if (!ctx) return '';
  const lines: string[] = [];
  const archetype = normalizeSlayArchetype(ctx.slayArchetype ?? ctx.hairProfile ?? '');
  if (archetype) {
    lines.push(`- Slay Archetype: **${archetype}** (contextual lens — do not repeat every reply).`);
  }
  const memories = ctx.memories ?? [];
  if (memories.length) {
    lines.push('- Concierge memory cards (confirm with member when unsure):');
    for (const m of memories.slice(0, 8)) {
      lines.push(`  - ${m.note}`);
    }
    lines.push(
      '- When a memory might be stale, ask: "Last time you leaned toward [X]. Still true?" Do not assume forever.'
    );
  }
  if (!lines.length) return '';
  return `\n## Member preferences (remembered)\n${lines.join('\n')}\n`;
}
