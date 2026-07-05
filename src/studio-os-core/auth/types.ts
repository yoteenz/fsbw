/** Platform auth contracts — app layer registers implementations at bootstrap. */

export type StudioOsAuthUser = {
  email?: string;
  id?: string;
};

export type StudioOsAuthProvider = {
  getCurrentUser: () => StudioOsAuthUser | null;
  isPortfolioOwnerEmail: (email: string) => boolean;
  isAdminEmail: (email: string) => boolean;
};

export type StudioOsOrgMembership = {
  workspaceId: string;
  isPortfolioOwner: boolean;
  source: 'supabase' | 'env-fallback' | 'default';
};
