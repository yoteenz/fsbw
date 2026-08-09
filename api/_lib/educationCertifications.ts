import type { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { getEducationSeasonById, getEducationMasteryById } from '../../src/content/education/hierarchy/catalog.js';
import {
  computeCertificationProgress,
  isSeasonCertificationEnabled,
  resolveRequiredEpisodeIdsForSeason,
  resolveSeasonCertificationTitle,
} from '../../src/content/education/hierarchy/certificationResolver.js';
import { getAutoAssignCertificationSlots } from '../../src/content/education/collectibles/displaySlots.js';
import { getCollectibleDefinitionById } from '../../src/content/education/collectibles/definitions.js';

export type EducationCertificationRow = {
  id: string;
  user_id: string;
  mastery_id: string;
  season_id: string;
  certification_code: string;
  title: string;
  issued_at: string;
  status: string;
  season_version: string;
  completed_episode_ids: string[];
  collectible_id: string | null;
  certification_reveal_seen_at: string | null;
  metadata: Record<string, unknown> | null;
};

export type UserCollectibleRow = {
  id: string;
  user_id: string;
  collectible_id: string;
  source_type: string;
  source_id: string | null;
  earned_at: string;
  status: string;
  display_slot_id: string | null;
  metadata: Record<string, unknown> | null;
};

function rowToCertification(row: EducationCertificationRow) {
  return {
    id: row.id,
    userId: row.user_id,
    masteryId: row.mastery_id,
    seasonId: row.season_id,
    certificationCode: row.certification_code,
    title: row.title,
    issuedAt: row.issued_at,
    status: row.status as 'active' | 'revoked',
    seasonVersion: row.season_version,
    completedEpisodeIds: row.completed_episode_ids ?? [],
    collectibleId: row.collectible_id ?? undefined,
    certificationRevealSeenAt: row.certification_reveal_seen_at,
    metadata: (row.metadata ?? undefined) as EducationCertificationRow['metadata'] | undefined,
  };
}

function rowToUserCollectible(row: UserCollectibleRow) {
  return {
    id: row.id,
    userId: row.user_id,
    collectibleId: row.collectible_id,
    sourceType: row.source_type as UserCollectibleRow['source_type'],
    sourceId: row.source_id ?? undefined,
    earnedAt: row.earned_at,
    status: row.status as 'earned' | 'revoked',
    displaySlotId: row.display_slot_id ?? undefined,
    metadata: (row.metadata ?? undefined) as UserCollectibleRow['metadata'] | undefined,
  };
}

function generateCertificationCode(masteryId: string, seasonSlug: string): string {
  const masteryPart = masteryId.replace(/^mastery-/, '').toUpperCase().slice(0, 4);
  const seasonPart = seasonSlug
    .split('-')
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3) || 'SZN';
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `FS-${masteryPart}-${seasonPart}-${suffix}`;
}

export async function fetchEpisodeCompletionsForUser(
  supabase: SupabaseClient,
  userId: string,
  seasonId?: string,
): Promise<string[]> {
  let q = supabase
    .from('education_episode_completions')
    .select('episode_ref_id')
    .eq('user_id', userId);
  if (seasonId) q = q.eq('season_id', seasonId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as { episode_ref_id: string }[]) ?? []).map((r) => r.episode_ref_id);
}

export async function upsertEpisodeCompletion(
  supabase: SupabaseClient,
  userId: string,
  params: {
    episodeRefId: string;
    episodeType: 'psa-today' | 'care-lesson';
    seasonId?: string;
    completedAt?: string;
  },
): Promise<void> {
  const { error } = await supabase.from('education_episode_completions').upsert(
    {
      user_id: userId,
      episode_ref_id: params.episodeRefId,
      episode_type: params.episodeType,
      season_id: params.seasonId ?? null,
      completed_at: params.completedAt ?? new Date().toISOString(),
    },
    { onConflict: 'user_id,episode_ref_id' },
  );
  if (error) throw new Error(error.message);
}

async function resolveNextDisplaySlotId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const slots = getAutoAssignCertificationSlots();
  if (slots.length === 0) return null;

  const { data, error } = await supabase
    .from('user_collectibles')
    .select('display_slot_id')
    .eq('user_id', userId)
    .eq('source_type', 'education')
    .eq('status', 'earned');
  if (error) throw new Error(error.message);

  const used = new Set(
    ((data as { display_slot_id: string | null }[]) ?? [])
      .map((r) => r.display_slot_id)
      .filter(Boolean),
  );
  const next = slots.find((s) => !used.has(s.id));
  return next?.id ?? null;
}

export async function fetchCertificationsForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('education_certifications')
    .select('*')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as EducationCertificationRow[]) ?? []).map(rowToCertification);
}

export async function fetchUserCollectiblesForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('user_collectibles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'earned')
    .order('earned_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as UserCollectibleRow[]) ?? []).map(rowToUserCollectible);
}

export type IssueSeasonCertificationResult =
  | {
      ok: true;
      issued: boolean;
      certification: ReturnType<typeof rowToCertification>;
      userCollectible?: ReturnType<typeof rowToUserCollectible>;
      needsReveal: boolean;
    }
  | { ok: false; error: string; progress?: { completed: number; total: number } };

export async function issueSeasonCertification(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
  options?: { completedEpisodeIds?: string[] },
): Promise<IssueSeasonCertificationResult> {
  const season = getEducationSeasonById(seasonId);
  if (!season) return { ok: false, error: 'Season not found' };
  if (!isSeasonCertificationEnabled(season)) {
    return { ok: false, error: 'Certification not enabled for this season' };
  }

  const seasonVersion = season.certification?.seasonVersion ?? '1';

  const { data: existingRows, error: existingErr } = await supabase
    .from('education_certifications')
    .select('*')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .eq('season_version', seasonVersion)
    .maybeSingle();
  if (existingErr) throw new Error(existingErr.message);

  if (existingRows) {
    const cert = rowToCertification(existingRows as EducationCertificationRow);
    return {
      ok: true,
      issued: false,
      certification: cert,
      needsReveal: !cert.certificationRevealSeenAt,
    };
  }

  const required = resolveRequiredEpisodeIdsForSeason(season);
  let completedIds = options?.completedEpisodeIds;
  if (!completedIds?.length) {
    completedIds = await fetchEpisodeCompletionsForUser(supabase, userId, seasonId);
  }

  const progress = computeCertificationProgress(season, completedIds);
  if (!progress.isComplete) {
    return { ok: false, error: 'Season certification requirements not met', progress };
  }

  const mastery = getEducationMasteryById(season.masteryId);
  const title = resolveSeasonCertificationTitle(season, mastery?.title);
  const collectibleAssetId =
    season.certification?.collectibleAssetId ??
    getCollectibleDefinitionById(`collectible-season-cert-${season.slug}`)?.id;

  if (collectibleAssetId) {
    await supabase.from('collectible_definitions').upsert(
      {
        id: collectibleAssetId,
        type: 'season-certification',
        mastery_id: season.masteryId,
        season_id: season.id,
        title: season.title,
        display_style: 'crystal-plaque',
        rarity: 'season-certification',
      },
      { onConflict: 'id' },
    );
  }

  let certificationCode = generateCertificationCode(season.masteryId, season.slug);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: inserted, error: insertErr } = await supabase
      .from('education_certifications')
      .insert({
        user_id: userId,
        mastery_id: season.masteryId,
        season_id: seasonId,
        certification_code: certificationCode,
        title,
        season_version: seasonVersion,
        completed_episode_ids: required.filter((id) => completedIds!.includes(id)),
        collectible_id: collectibleAssetId ?? null,
        metadata: {
          masteryTitle: mastery?.title,
          seasonTitle: season.title,
          seasonNumber: season.seasonNumber,
        },
      })
      .select('*')
      .maybeSingle();

    if (!insertErr && inserted) {
      const cert = rowToCertification(inserted as EducationCertificationRow);
      let userCollectible: ReturnType<typeof rowToUserCollectible> | undefined;

      if (collectibleAssetId) {
        const displaySlotId = await resolveNextDisplaySlotId(supabase, userId);
        const { data: ucRow, error: ucErr } = await supabase
          .from('user_collectibles')
          .upsert(
            {
              user_id: userId,
              collectible_id: collectibleAssetId,
              source_type: 'education',
              source_id: cert.id,
              display_slot_id: displaySlotId,
              metadata: {
                certificationId: cert.id,
                certificationCode: cert.certificationCode,
                seasonId: season.id,
                masteryId: season.masteryId,
              },
            },
            { onConflict: 'user_id,collectible_id,source_id' },
          )
          .select('*')
          .maybeSingle();
        if (ucErr) throw new Error(ucErr.message);
        if (ucRow) userCollectible = rowToUserCollectible(ucRow as UserCollectibleRow);
      }

      return {
        ok: true,
        issued: true,
        certification: cert,
        userCollectible,
        needsReveal: true,
      };
    }

    if (insertErr?.code === '23505') {
      const { data: raceRow } = await supabase
        .from('education_certifications')
        .select('*')
        .eq('user_id', userId)
        .eq('season_id', seasonId)
        .eq('season_version', seasonVersion)
        .maybeSingle();
      if (raceRow) {
        const cert = rowToCertification(raceRow as EducationCertificationRow);
        return {
          ok: true,
          issued: false,
          certification: cert,
          needsReveal: !cert.certificationRevealSeenAt,
        };
      }
    }

    if (insertErr?.message?.includes('certification_code')) {
      certificationCode = generateCertificationCode(season.masteryId, season.slug);
      continue;
    }

    throw new Error(insertErr?.message ?? 'Failed to issue certification');
  }

  return { ok: false, error: 'Failed to generate unique certification code' };
}

export async function markCertificationRevealSeen(
  supabase: SupabaseClient,
  userId: string,
  certificationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('education_certifications')
    .update({ certification_reveal_seen_at: new Date().toISOString() })
    .eq('id', certificationId)
    .eq('user_id', userId)
    .is('certification_reveal_seen_at', null)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function syncSeasonCertificationForUser(
  supabase: SupabaseClient,
  userId: string,
  params: { seasonId: string; completedEpisodeIds?: string[] },
) {
  if (params.completedEpisodeIds?.length) {
    const season = getEducationSeasonById(params.seasonId);
    for (const episodeRefId of params.completedEpisodeIds) {
      const slot = season?.episodeSlots.find(
        (s) => s.psaEpisodeId === episodeRefId || s.careLessonId === episodeRefId,
      );
      const episodeType = slot?.careLessonId === episodeRefId ? 'care-lesson' : 'psa-today';
      await upsertEpisodeCompletion(supabase, userId, {
        episodeRefId,
        episodeType,
        seasonId: params.seasonId,
      });
    }
  }
  return issueSeasonCertification(supabase, userId, params.seasonId, {
    completedEpisodeIds: params.completedEpisodeIds,
  });
}

export { rowToCertification, rowToUserCollectible };
