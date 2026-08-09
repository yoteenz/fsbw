import { apiFetch } from '../../../utils/api';
import type { EducationCertification, EducationCollectibleDefinition, UserCollectible } from '../../../content/education/types';

export type CertificationSyncResult =
  | {
      ok: true;
      issued: boolean;
      certification: EducationCertification;
      userCollectible?: UserCollectible;
      needsReveal: boolean;
      collectibleDefinition?: EducationCollectibleDefinition;
    }
  | { ok: false; error: string; progress?: { completed: number; total: number } };

export type CertificationsStateResponse = {
  certifications: EducationCertification[];
  collectibles: UserCollectible[];
};

export async function fetchUserCertifications(): Promise<CertificationsStateResponse | null> {
  const res = await apiFetch('/api/education/certifications');
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return (await res.json()) as CertificationsStateResponse;
}

export async function syncSeasonCertification(params: {
  seasonId: string;
  completedEpisodeIds?: string[];
}): Promise<CertificationSyncResult | null> {
  const res = await apiFetch('/api/education/certifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as CertificationSyncResult;
  if (!res.ok && !('ok' in data)) {
    return { ok: false, error: 'Sync failed' };
  }
  return data;
}

export async function markCertificationRevealSeen(certificationId: string): Promise<boolean> {
  const res = await apiFetch('/api/education/certifications/reveal-seen', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ certificationId }),
  });
  return res.ok;
}

export async function syncEpisodeCompletion(params: {
  episodeRefId: string;
  episodeType: 'psa-today' | 'care-lesson';
  seasonId?: string;
}): Promise<boolean> {
  const res = await apiFetch('/api/education/episode-completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.ok;
}
