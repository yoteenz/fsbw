/** Boot module lifecycle status. */
export type BootModuleStatus = 'idle' | 'loading' | 'ready' | 'failed' | 'fallback';

export type BootModuleSnapshot = {
  id: string;
  name: string;
  status: BootModuleStatus;
  dependencies: string[];
  required: boolean;
  errors: string[];
  warnings: string[];
  fallback?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type BootModuleContract = {
  id: string;
  name: string;
  dependencies: string[];
  required: boolean;
  initialize: () => Promise<void>;
  isReady: () => boolean;
  errors: string[];
  warnings: string[];
  fallback?: string;
  status: BootModuleStatus;
};

export type StudioBootReport = {
  ready: boolean;
  modules: BootModuleSnapshot[];
  errors: string[];
  warnings: string[];
  fallbacksUsed: string[];
  startedAt: number;
  finishedAt?: number;
};

export const STUDIO_BOOT_EVENT = 'studio-os-boot-updated';
