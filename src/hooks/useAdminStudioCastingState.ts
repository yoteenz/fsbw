import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_CASTING_PRODUCTIONS,
  ADMIN_STUDIO_CASTING_TALENT,
  createBlankCastingProduction,
  type CastingProductionEntry,
  type CastingProductionFieldKey,
  type CastingProductionStatus,
  type CastingTalentFieldKey,
  type CastingTalentProfile,
  type CastingTalentStatus,
  type CastingWorkflowStepId,
} from '../utils/adminStudioCastingDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type ProductionPatch = Partial<CastingProductionEntry>;
type TalentPatch = Partial<CastingTalentProfile>;
type ProductionPatchStore = Record<string, ProductionPatch>;
type TalentPatchStore = Record<string, TalentPatch>;
type WorkflowStore = Record<string, Record<CastingWorkflowStepId, boolean>>;

const DEFAULT_PRODUCTION_IDS = new Set(ADMIN_STUDIO_CASTING_PRODUCTIONS.map((p) => p.id));

function readProductionPatches(): ProductionPatchStore {
  return readStudioJson<ProductionPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.castingProductions) ?? {};
}

function readTalentPatches(): TalentPatchStore {
  return readStudioJson<TalentPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.castingTalent) ?? {};
}

function readCustomProductions(): CastingProductionEntry[] {
  return readStudioJson<CastingProductionEntry[]>(ADMIN_STUDIO_STORAGE_KEYS.castingProductionsCustom) ?? [];
}

function readWorkflowStore(): WorkflowStore {
  return readStudioJson<WorkflowStore>(ADMIN_STUDIO_STORAGE_KEYS.castingWorkflow) ?? {};
}

function writeProductionPatches(store: ProductionPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.castingProductions, store);
}

function writeTalentPatches(store: TalentPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.castingTalent, store);
}

function writeCustomProductions(productions: CastingProductionEntry[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.castingProductionsCustom, productions);
}

function writeWorkflowStore(store: WorkflowStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.castingWorkflow, store);
}

function mergeProductions(patches: ProductionPatchStore, workflows: WorkflowStore): CastingProductionEntry[] {
  return ADMIN_STUDIO_CASTING_PRODUCTIONS.map((d) => ({
    ...d,
    ...(patches[d.id] ?? {}),
    workflowState: { ...d.workflowState, ...(workflows[d.id] ?? patches[d.id]?.workflowState ?? {}) },
  }));
}

function mergeTalent(patches: TalentPatchStore): CastingTalentProfile[] {
  return ADMIN_STUDIO_CASTING_TALENT.map((d) => ({ ...d, ...(patches[d.id] ?? {}) }));
}

export function listCastingProductions(): CastingProductionEntry[] {
  const patches = readProductionPatches();
  const workflows = readWorkflowStore();
  const custom = readCustomProductions();
  const merged = mergeProductions(patches, workflows);
  const customOnly = custom.filter((c) => !DEFAULT_PRODUCTION_IDS.has(c.id));
  return [...merged, ...customOnly.map((c) => ({ ...c, workflowState: workflows[c.id] ?? c.workflowState }))];
}

export function listCastingTalent(): CastingTalentProfile[] {
  const patches = readTalentPatches();
  return mergeTalent(patches);
}

export function getCastingProductionById(id: string): CastingProductionEntry | undefined {
  return listCastingProductions().find((p) => p.id === id);
}

export function getCastingTalentProfileById(id: string): CastingTalentProfile | undefined {
  return listCastingTalent().find((t) => t.id === id);
}

export function exportCastingSnapshot() {
  return {
    productions: listCastingProductions(),
    talent: listCastingTalent(),
    source: 'casting-local' as const,
  };
}

function patchProduction(productionId: string, patch: ProductionPatch): void {
  if (DEFAULT_PRODUCTION_IDS.has(productionId)) {
    const store = readProductionPatches();
    store[productionId] = { ...(store[productionId] ?? {}), ...patch };
    writeProductionPatches(store);
    return;
  }
  const custom = readCustomProductions();
  const idx = custom.findIndex((p) => p.id === productionId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomProductions(custom);
  }
}

function patchTalentProfile(talentId: string, patch: TalentPatch): void {
  const store = readTalentPatches();
  store[talentId] = { ...(store[talentId] ?? {}), ...patch };
  writeTalentPatches(store);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function useAdminStudioCasting(productionId?: string, talentId?: string) {
  const [productions, setProductions] = useState(listCastingProductions);
  const [talentProfiles, setTalentProfiles] = useState(listCastingTalent);

  const selectedProduction = useMemo(
    () => (productionId ? productions.find((p) => p.id === productionId) ?? null : null),
    [productions, productionId]
  );

  const selectedTalent = useMemo(
    () => (talentId ? talentProfiles.find((t) => t.id === talentId) ?? null : null),
    [talentProfiles, talentId]
  );

  const updateProductionField = useCallback((id: string, key: CastingProductionFieldKey, value: string) => {
    setProductions((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        patchProduction(id, { [key]: value });
        return { ...p, [key]: value };
      });
      return next;
    });
  }, []);

  const setProductionStatus = useCallback((id: string, status: CastingProductionStatus) => {
    setProductions((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, productionStatus: status } : p));
      patchProduction(id, { productionStatus: status });
      return next;
    });
  }, []);

  const toggleWorkflowStep = useCallback((id: string, stepId: CastingWorkflowStepId) => {
    setProductions((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const workflowState = { ...p.workflowState, [stepId]: !p.workflowState[stepId] };
        const store = readWorkflowStore();
        store[id] = workflowState;
        writeWorkflowStore(store);
        return { ...p, workflowState };
      });
      return next;
    });
  }, []);

  const addProduction = useCallback((showName: string) => {
    const base = slugify(showName) || `production-${Date.now()}`;
    let id = base;
    let n = 1;
    const existing = new Set(listCastingProductions().map((p) => p.id));
    while (existing.has(id)) id = `${base}-${n++}`;
    const entry = createBlankCastingProduction(id, showName);
    const custom = readCustomProductions();
    custom.push(entry);
    writeCustomProductions(custom);
    setProductions(listCastingProductions());
    return id;
  }, []);

  const updateTalentField = useCallback((id: string, key: CastingTalentFieldKey, value: string) => {
    setTalentProfiles((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        patchTalentProfile(id, { [key]: value });
        return { ...t, [key]: value };
      });
      return next;
    });
  }, []);

  const setTalentStatus = useCallback((id: string, status: CastingTalentStatus) => {
    setTalentProfiles((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, castingStatus: status } : t));
      patchTalentProfile(id, { castingStatus: status });
      return next;
    });
  }, []);

  const isCastApproved = useCallback((production: CastingProductionEntry) => {
    return (
      production.workflowState['approve-cast'] &&
      production.workflowState['lock-cast']
    );
  }, []);

  const activeTalent = useMemo(() => talentProfiles.filter((t) => t.castingStatus !== 'inactive' && t.castingStatus !== 'retired'), [talentProfiles]);
  const availableTalent = useMemo(() => talentProfiles.filter((t) => t.castingStatus === 'available'), [talentProfiles]);
  const guestTalent = useMemo(() => talentProfiles.filter((t) => t.castingStatus === 'guest-appearance'), [talentProfiles]);

  return {
    productions,
    talentProfiles,
    selectedProduction,
    selectedTalent,
    activeTalent,
    availableTalent,
    guestTalent,
    updateProductionField,
    setProductionStatus,
    toggleWorkflowStep,
    addProduction,
    updateTalentField,
    setTalentStatus,
    isCastApproved,
  };
}
