import type {
  RegistryAssetRow,
  RegistrySupabase,
  SimilarityQuery,
} from './types.js';

const ASSET_TABLE = 'studio_asset_registry_assets';
const SIMILARITY_TABLE = 'studio_asset_registry_similarity_hooks';

export type SimilarAssetResult = {
  asset: RegistryAssetRow;
  score: number;
  match_reasons: string[];
};

function normalizeList(values: string[] | undefined): string[] {
  return (values ?? []).map((v) => v.trim().toLowerCase()).filter(Boolean);
}

function overlapScore(a: string[], b: string[]): { score: number; matches: string[] } {
  if (!a.length || !b.length) return { score: 0, matches: [] };
  const setB = new Set(b);
  const matches = a.filter((v) => setB.has(v));
  const union = new Set([...a, ...b]).size;
  return { score: union > 0 ? matches.length / union : 0, matches };
}

function traitOverlap(
  source: Record<string, unknown>,
  target: Record<string, unknown>
): { score: number; matches: string[] } {
  const keys = Object.keys(source).filter((k) => source[k] != null && source[k] !== '');
  if (!keys.length) return { score: 0, matches: [] };

  let hits = 0;
  const matches: string[] = [];
  for (const key of keys) {
    const a = String(source[key]).toLowerCase();
    const b = target[key] != null ? String(target[key]).toLowerCase() : '';
    if (b && a === b) {
      hits += 1;
      matches.push(key);
    }
  }
  return { score: hits / keys.length, matches: matches.map((k) => `trait:${k}`) };
}

export function scoreAssetSimilarity(
  source: RegistryAssetRow,
  candidate: RegistryAssetRow,
  query?: Partial<SimilarityQuery>
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  if (source.category === candidate.category) {
    weightedScore += 0.2;
    totalWeight += 0.2;
    reasons.push('same_category');
  }

  if (source.reuse_category && source.reuse_category === candidate.reuse_category) {
    weightedScore += 0.15;
    totalWeight += 0.15;
    reasons.push('same_reuse_category');
  }

  const tagOverlap = overlapScore(
    normalizeList(query?.tags ?? source.tags),
    normalizeList(candidate.tags)
  );
  if (tagOverlap.score > 0) {
    weightedScore += tagOverlap.score * 0.25;
    totalWeight += 0.25;
    reasons.push(...tagOverlap.matches.map((t) => `tag:${t}`));
  }

  const materialOverlap = overlapScore(
    normalizeList(query?.materials ?? source.materials),
    normalizeList(candidate.materials)
  );
  if (materialOverlap.score > 0) {
    weightedScore += materialOverlap.score * 0.2;
    totalWeight += 0.2;
    reasons.push(...materialOverlap.matches.map((m) => `material:${m}`));
  }

  const lighting = (query?.lighting_profile ?? source.lighting_profile)?.toLowerCase();
  const candidateLighting = candidate.lighting_profile?.toLowerCase();
  if (lighting && lighting === candidateLighting) {
    weightedScore += 0.1;
    totalWeight += 0.1;
    reasons.push('lighting_profile');
  }

  const traitResult = traitOverlap(source.similarity_traits, candidate.similarity_traits);
  if (traitResult.score > 0) {
    weightedScore += traitResult.score * 0.1;
    totalWeight += 0.1;
    reasons.push(...traitResult.matches);
  }

  const score = totalWeight > 0 ? weightedScore / totalWeight : 0;
  return { score: Math.min(1, Math.round(score * 1000) / 1000), reasons };
}

export async function findSimilarAssets(
  supabase: RegistrySupabase,
  query: SimilarityQuery
): Promise<SimilarAssetResult[]> {
  const limit = Math.min(query.limit ?? 20, 100);
  let source: RegistryAssetRow | null = null;

  if (query.asset_id) {
    const { data, error } = await supabase
      .from(ASSET_TABLE)
      .select('*')
      .eq('id', query.asset_id)
      .eq('org_id', query.org_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    source = (data as RegistryAssetRow | null) ?? null;
    if (!source) return [];
  }

  let candidateQuery = supabase
    .from(ASSET_TABLE)
    .select('*')
    .eq('org_id', query.org_id)
    .eq('archived', false);

  if (query.category) candidateQuery = candidateQuery.eq('category', query.category);
  if (query.reuse_category) candidateQuery = candidateQuery.eq('reuse_category', query.reuse_category);
  if (query.asset_id) candidateQuery = candidateQuery.neq('id', query.asset_id);

  const { data: candidates, error: candidateError } = await candidateQuery.limit(200);
  if (candidateError) throw new Error(candidateError.message);

  const rows = (candidates ?? []) as RegistryAssetRow[];
  const scored: SimilarAssetResult[] = [];

  for (const candidate of rows) {
    const ref = source ?? ({
      category: query.category ?? '',
      reuse_category: query.reuse_category ?? null,
      tags: query.tags ?? [],
      materials: query.materials ?? [],
      lighting_profile: query.lighting_profile ?? null,
      similarity_traits: {},
    } as RegistryAssetRow);

    const { score, reasons } = scoreAssetSimilarity(ref, candidate, query);
    if (score > 0) {
      scored.push({ asset: candidate, score, match_reasons: reasons });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export async function getSimilarityHook(
  supabase: RegistrySupabase,
  assetId: string
): Promise<{ embedding_ref: string | null; traits: Record<string, unknown> } | null> {
  const { data, error } = await supabase
    .from(SIMILARITY_TABLE)
    .select('embedding_ref, traits')
    .eq('asset_id', assetId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    embedding_ref: data.embedding_ref as string | null,
    traits: (data.traits ?? {}) as Record<string, unknown>,
  };
}
