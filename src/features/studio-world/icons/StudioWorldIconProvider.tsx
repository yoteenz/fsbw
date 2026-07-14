import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import {
  analyzeStudioWorldIconDiagnostics,
  buildStudioWorldIconManifest,
  type StudioWorldIconDiagnosticReport,
  type StudioWorldIconManifest,
} from '../../../studio-os-core/studio-world-icon-system';
import {
  ensureStudioWorldIconSystemBridge,
} from './studio-world-icon-system-bridge';
import {
  resolveProductionExperienceLabIconAsset,
} from './experience-lab-icon-asset-resolver';
import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import {
  setStudioWorldIconLoaderBackend,
  getIcon,
  type StudioWorldIconDefinition,
} from '../../../studio-os-core/studio-world-icon-system';

type StudioWorldIconProviderValue = {
  ready: boolean;
  manifest: StudioWorldIconManifest | null;
  diagnostics: StudioWorldIconDiagnosticReport | null;
  getIcon: (id: string) => StudioWorldIconDefinition | null;
};

const StudioWorldIconContext = createContext<StudioWorldIconProviderValue | null>(null);

/** Future-proof icon provider — swappable loader backends; does not alter Experience Lab runtime. */
export function StudioWorldIconProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    ensureStudioWorldIconSystemBridge();

    setStudioWorldIconLoaderBackend((request) => {
      const legacy = request.icon.legacyExperienceLabIconName;
      if (legacy) {
        const resolved = resolveProductionExperienceLabIconAsset(legacy as ExperienceLabIconName);
        return { src: resolved.src, provider: 'experience-lab-v6', cached: false };
      }
      return { src: request.assetPath, provider: request.provider, cached: false };
    });

    return {
      ready: true,
      manifest: buildStudioWorldIconManifest(),
      diagnostics: analyzeStudioWorldIconDiagnostics(),
      getIcon,
    };
  }, []);

  useEffect(() => {
    ensureStudioWorldIconSystemBridge();
  }, []);

  return (
    <StudioWorldIconContext.Provider value={value}>{children}</StudioWorldIconContext.Provider>
  );
}

export function useStudioWorldIconSystem(): StudioWorldIconProviderValue {
  const ctx = useContext(StudioWorldIconContext);
  if (!ctx) {
    ensureStudioWorldIconSystemBridge();
    return {
      ready: true,
      manifest: buildStudioWorldIconManifest(),
      diagnostics: analyzeStudioWorldIconDiagnostics(),
      getIcon,
    };
  }
  return ctx;
}
