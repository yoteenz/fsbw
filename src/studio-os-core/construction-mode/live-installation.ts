import type { WorldPreviewModel, ClayPlaceholderAsset } from './world-preview';

export const LIVE_INSTALLATION_VERSION = 'live-installation.v1';

export type InstalledAsset = {
  assetId: string;
  sourceUrl: string;
  installedAt: string;
  replacedPlaceholder: true;
};

export type LiveInstallationState = {
  stateVersion: typeof LIVE_INSTALLATION_VERSION;
  planId: string;
  placeholders: ClayPlaceholderAsset[];
  installed: InstalledAsset[];
};

export function initLiveInstallation(preview: WorldPreviewModel): LiveInstallationState {
  return {
    stateVersion: LIVE_INSTALLATION_VERSION,
    planId: preview.planId,
    placeholders: preview.placeholderAssets.map((p) => ({ ...p })),
    installed: [],
  };
}

/** Completed asset appears — placeholder disappears */
export function installAsset(input: {
  state: LiveInstallationState;
  assetId: string;
  sourceUrl: string;
}): LiveInstallationState {
  const installed: InstalledAsset = {
    assetId: input.assetId,
    sourceUrl: input.sourceUrl,
    installedAt: new Date().toISOString(),
    replacedPlaceholder: true,
  };

  const placeholders = input.state.placeholders.filter((p) => p.assetId !== input.assetId);

  return {
    ...input.state,
    placeholders,
    installed: [...input.state.installed, installed],
  };
}

export function installationProgress(state: LiveInstallationState, totalAssets: number): number {
  if (totalAssets === 0) return 100;
  return Math.round((state.installed.length / totalAssets) * 100);
}
