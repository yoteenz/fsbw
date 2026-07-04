import { createContext, useContext, type ReactNode } from 'react';
import { PHOTOGRAPHY_LOCKED_SPECIFICATIONS, PHOTOGRAPHY_SYSTEM_V1_DETAIL, PHOTOGRAPHY_SYSTEM_VERSION } from './PhotographySpecifications';
import { SIGNATURE_COLLECTION_UNITS } from './SignatureCollectionRegistry';
import { MEDIA_KIT_ASSET_SLOTS, buildMediaKitForUnit } from './MediaKitRegistry';
import { PHOTOGRAPHY_EXPORT_TEMPLATES } from './PhotographyTemplates';
import { PHOTOGRAPHY_VERSION_HISTORY, getCurrentPhotographyVersion } from './PhotographyVersionManager';

export type PhotographySystemContextValue = {
  systemVersion: string;
  lockedSpecifications: typeof PHOTOGRAPHY_LOCKED_SPECIFICATIONS;
  specDetail: typeof PHOTOGRAPHY_SYSTEM_V1_DETAIL;
  signatureUnits: typeof SIGNATURE_COLLECTION_UNITS;
  mediaKitSlots: typeof MEDIA_KIT_ASSET_SLOTS;
  exportTemplates: typeof PHOTOGRAPHY_EXPORT_TEMPLATES;
  versionHistory: typeof PHOTOGRAPHY_VERSION_HISTORY;
  currentVersion: ReturnType<typeof getCurrentPhotographyVersion>;
  buildMediaKitForUnit: typeof buildMediaKitForUnit;
};

const PhotographySystemContext = createContext<PhotographySystemContextValue | null>(null);

export function usePhotographySystem(): PhotographySystemContextValue {
  const ctx = useContext(PhotographySystemContext);
  if (!ctx) {
    throw new Error('usePhotographySystem must be used within PhotographyBibleProvider');
  }
  return ctx;
}

export function createPhotographySystemValue(): PhotographySystemContextValue {
  return {
    systemVersion: PHOTOGRAPHY_SYSTEM_VERSION,
    lockedSpecifications: PHOTOGRAPHY_LOCKED_SPECIFICATIONS,
    specDetail: PHOTOGRAPHY_SYSTEM_V1_DETAIL,
    signatureUnits: SIGNATURE_COLLECTION_UNITS,
    mediaKitSlots: MEDIA_KIT_ASSET_SLOTS,
    exportTemplates: PHOTOGRAPHY_EXPORT_TEMPLATES,
    versionHistory: PHOTOGRAPHY_VERSION_HISTORY,
    currentVersion: getCurrentPhotographyVersion(),
    buildMediaKitForUnit,
  };
}

export function PhotographySystemProvider({
  value,
  children,
}: {
  value?: PhotographySystemContextValue;
  children: ReactNode;
}) {
  return (
    <PhotographySystemContext.Provider value={value ?? createPhotographySystemValue()}>
      {children}
    </PhotographySystemContext.Provider>
  );
}

export { PhotographySystemContext };
