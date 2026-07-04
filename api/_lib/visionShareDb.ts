export type VisionShareLinkDto = {
  id: string;
  slug: string;
  modeId: string;
  workspaceId: string;
  label: string;
  password?: string;
  expiresAt?: string;
  autoplay: boolean;
  presenterMode: boolean;
  selfGuided: boolean;
  createdAt: string;
  views: number;
};

export type VisionShareLinkRow = {
  id: string;
  slug: string;
  mode_id: string;
  workspace_id: string;
  label: string;
  password: string | null;
  expires_at: string | null;
  autoplay: boolean;
  presenter_mode: boolean;
  self_guided: boolean;
  views: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function rowToVisionShareLink(row: VisionShareLinkRow): VisionShareLinkDto {
  return {
    id: row.id,
    slug: row.slug,
    modeId: row.mode_id,
    workspaceId: row.workspace_id,
    label: row.label,
    password: row.password ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    autoplay: row.autoplay,
    presenterMode: row.presenter_mode,
    selfGuided: row.self_guided,
    createdAt: row.created_at,
    views: row.views,
  };
}

export function isLinkExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export function passwordMatches(stored: string | null | undefined, submitted: string | undefined): boolean {
  if (!stored) return true;
  if (!submitted) return false;
  return stored === submitted.trim();
}

export type PublicVisionShareResponse = {
  link: Omit<VisionShareLinkDto, 'password'>;
  requiresPassword: boolean;
  expired: boolean;
};
