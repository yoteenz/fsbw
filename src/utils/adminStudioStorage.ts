/** Centralized Studio localStorage keys — single source for Phase 2 scaling. */

export const ADMIN_STUDIO_STORAGE_KEYS = {
  shows: 'adminStudioShowsEditable_v1',
  contentPacks: 'adminStudioContentPacksEditable_v1',
  publishingQueue: 'adminStudioPublishingQueue_v1',
  aiForm: 'adminStudioAiForm_v1',
  promptLibrary: 'adminStudioPromptLibrary_v1',
  promptFavorites: 'adminStudioPromptFavorites_v1',
  contentBrainBrand: 'adminStudioContentBrainBrand_v1',
  contentBrainPsa: 'adminStudioContentBrainPsa_v1',
  contentBrainShowBible: 'adminStudioContentBrainShowBible_v1',
  contentBrainEditorial: 'adminStudioContentBrainEditorial_v1',
  contentBrainPromptFrameworks: 'adminStudioContentBrainPromptFrameworks_v1',
  contentBrainPromptFavorites: 'adminStudioContentBrainPromptFavorites_v1',
  contentBrainCampaigns: 'adminStudioContentBrainCampaigns_v1',
  contentBrainProducts: 'adminStudioContentBrainProducts_v1',
  contentBrainCtas: 'adminStudioContentBrainCtas_v1',
  contentBrainEngine: 'adminStudioContentBrainEngine_v1',
  contentBrainCalendar: 'adminStudioContentBrainCalendar_v1',
  contentBrainApproval: 'adminStudioContentBrainApproval_v1',
  creativeDirector: 'adminStudioCreativeDirector_v1',
  intelligenceEngine: 'adminStudioIntelligenceEngine_v1',
  orchestrator: 'adminStudioOrchestrator_v1',
  showBible: 'adminStudioShowBible_v1',
  showBibleCustom: 'adminStudioShowBibleCustom_v1',
  showBibleChecklist: 'adminStudioShowBibleChecklist_v1',
  studioLot: 'adminStudioStudioLot_v1',
  studioLotCustom: 'adminStudioStudioLotCustom_v1',
  talentAgency: 'adminStudioTalentAgency_v1',
  talentAgencyCustom: 'adminStudioTalentAgencyCustom_v1',
} as const;

export type AdminStudioStorageKey = (typeof ADMIN_STUDIO_STORAGE_KEYS)[keyof typeof ADMIN_STUDIO_STORAGE_KEYS];

export function readStudioJson<T>(key: AdminStudioStorageKey): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStudioJson(key: AdminStudioStorageKey, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function patchStudioRecord<T extends Record<string, unknown>>(
  key: AdminStudioStorageKey,
  recordId: string,
  patch: Partial<T>
): void {
  const store = readStudioJson<Record<string, Partial<T>>>(key) ?? {};
  store[recordId] = { ...(store[recordId] ?? {}), ...patch };
  writeStudioJson(key, store);
}
