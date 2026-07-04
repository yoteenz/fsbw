import { apiFetch } from './api';
import type { VisionShareLink } from '../studio-os-core/vision-engine/types';

export type ResolveVisionShareResult =
  | { ok: true; link: VisionShareLink; requiresPassword: false }
  | { ok: false; requiresPassword: true; label?: string }
  | { ok: false; notFound: true; migrationRequired?: boolean }
  | { ok: false; expired: true }
  | { ok: false; error: string; migrationRequired?: boolean };

export async function resolveVisionShareFromApi(
  slug: string,
  password?: string
): Promise<ResolveVisionShareResult> {
  const q = new URLSearchParams({ slug });
  if (password) q.set('password', password);

  try {
    const res = await fetch(`/api/vision/share?${q.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as {
      link?: VisionShareLink;
      requiresPassword?: boolean;
      expired?: boolean;
      error?: string;
      migrationRequired?: boolean;
      label?: string;
    };

    if (res.status === 404) {
      return { ok: false, notFound: true, migrationRequired: json.migrationRequired };
    }
    if (res.status === 410 || json.expired) {
      return { ok: false, expired: true };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: json.error ?? 'Vision Share unavailable',
        migrationRequired: json.migrationRequired,
      };
    }
    if (json.requiresPassword) {
      return { ok: false, requiresPassword: true, label: json.label };
    }
    if (!json.link) {
      return { ok: false, error: 'Invalid Vision Share response' };
    }
    return { ok: true, link: json.link, requiresPassword: false };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function fetchAdminVisionShareLinks(workspaceId: string): Promise<{
  links: VisionShareLink[];
  migrationRequired?: boolean;
}> {
  const res = await apiFetch(`/api/admin/vision-share?workspaceId=${encodeURIComponent(workspaceId)}`);
  const json = (await res.json()) as { links?: VisionShareLink[]; migrationRequired?: boolean; error?: string };
  if (!res.ok) {
    if (json.migrationRequired) return { links: [], migrationRequired: true };
    throw new Error(json.error ?? 'Failed to load Vision Share links');
  }
  return { links: json.links ?? [], migrationRequired: json.migrationRequired };
}

export async function createAdminVisionShareLink(input: {
  slug: string;
  modeId: string;
  workspaceId: string;
  label: string;
  password?: string;
  expiresAt?: string;
  autoplay?: boolean;
  presenterMode?: boolean;
  selfGuided?: boolean;
}): Promise<VisionShareLink> {
  const res = await apiFetch('/api/admin/vision-share', {
    method: 'POST',
    body: input,
  });
  const json = (await res.json()) as { link?: VisionShareLink; error?: string; migrationRequired?: boolean };
  if (!res.ok) {
    throw new Error(json.error ?? (json.migrationRequired ? 'Run vision_share_links migration' : 'Create failed'));
  }
  if (!json.link) throw new Error('Invalid create response');
  return json.link;
}

export async function deleteAdminVisionShareLink(slug: string): Promise<void> {
  const res = await apiFetch(`/api/admin/vision-share?slug=${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: string };
    throw new Error(json.error ?? 'Delete failed');
  }
}
