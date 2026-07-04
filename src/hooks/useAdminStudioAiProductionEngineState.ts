import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_AI_PRODUCTION_RUN_DEFAULTS,
  computeQualityScore,
  createBlankAiProductionRun,
  type AiProductionDepartmentId,
  type AiProductionFieldKey,
  type AiProductionRun,
} from '../utils/adminStudioAiProductionEngineDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import {
  advanceRunDemo,
  approveDepartment,
  duplicateRun,
  pauseRun,
  regenerateDepartment,
  rejectDepartment,
  resumeRun,
  skipDepartment,
} from '../services/studio/aiProductionEngine/pipeline';

type RunPatch = Partial<AiProductionRun>;
type RunPatchStore = Record<string, RunPatch>;

const DEFAULT_IDS = new Set(ADMIN_STUDIO_AI_PRODUCTION_RUN_DEFAULTS.map((r) => r.id));

function readPatches(): RunPatchStore {
  return readStudioJson<RunPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.aiProductionEngine) ?? {};
}

function readCustomRuns(): AiProductionRun[] {
  return readStudioJson<AiProductionRun[]>(ADMIN_STUDIO_STORAGE_KEYS.aiProductionEngineCustom) ?? [];
}

function writePatches(store: RunPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.aiProductionEngine, store);
}

function writeCustomRuns(runs: AiProductionRun[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.aiProductionEngineCustom, runs);
}

function mergeDefaults(patches: RunPatchStore): AiProductionRun[] {
  return ADMIN_STUDIO_AI_PRODUCTION_RUN_DEFAULTS.map((d) => {
    const patch = patches[d.id] ?? {};
    return {
      ...d,
      ...patch,
      departments: patch.departments ?? d.departments,
      promptTraces: patch.promptTraces ?? d.promptTraces,
      qualityScore: patch.qualityScore ?? computeQualityScore({ ...d, ...patch, departments: patch.departments ?? d.departments }),
    };
  });
}

export function listAiProductionRuns(): AiProductionRun[] {
  const patches = readPatches();
  const custom = readCustomRuns();
  const merged = mergeDefaults(patches);
  const customOnly = custom.filter((c) => !DEFAULT_IDS.has(c.id));
  return [...merged, ...customOnly];
}

export function getAiProductionRunById(runId: string): AiProductionRun | undefined {
  return listAiProductionRuns().find((r) => r.id === runId);
}

export function exportAiProductionSnapshot() {
  return { runs: listAiProductionRuns(), source: 'ai-production-engine-local' as const };
}

function patchRun(runId: string, patch: RunPatch): void {
  if (DEFAULT_IDS.has(runId)) {
    const store = readPatches();
    store[runId] = { ...(store[runId] ?? {}), ...patch };
    writePatches(store);
    return;
  }
  const custom = readCustomRuns();
  const idx = custom.findIndex((r) => r.id === runId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomRuns(custom);
  }
}

function replaceRun(run: AiProductionRun): void {
  if (DEFAULT_IDS.has(run.id)) {
    patchRun(run.id, run);
    return;
  }
  const custom = readCustomRuns();
  const idx = custom.findIndex((r) => r.id === run.id);
  if (idx >= 0) {
    custom[idx] = run;
    writeCustomRuns(custom);
  } else {
    writeCustomRuns([...custom, run]);
  }
}

export function useAdminStudioAiProductionEngine(runId?: string) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const runs = useMemo(() => {
    void version;
    return listAiProductionRuns();
  }, [version]);

  const activeRun = useMemo(() => runs.find((r) => r.runStatus === 'running') ?? runs[0], [runs]);

  const selectedRun = useMemo(() => {
    if (!runId) return undefined;
    return runs.find((r) => r.id === runId);
  }, [runs, runId]);

  const updateField = useCallback(
    (id: string, key: AiProductionFieldKey, value: string) => {
      patchRun(id, { [key]: value, lastUpdated: 'NOW' });
      bump();
    },
    [bump]
  );

  const applyRun = useCallback(
    (run: AiProductionRun) => {
      replaceRun(run);
      bump();
    },
    [bump]
  );

  const addRun = useCallback(
    (title: string) => {
      const run = createBlankAiProductionRun(title);
      writeCustomRuns([...readCustomRuns(), run]);
      bump();
      return run.id;
    },
    [bump]
  );

  const pauseProduction = useCallback(
    (id: string) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(pauseRun(run));
    },
    [applyRun]
  );

  const resumeProduction = useCallback(
    (id: string) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(resumeRun(run));
    },
    [applyRun]
  );

  const regenerateDept = useCallback(
    (id: string, departmentId: AiProductionDepartmentId) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(regenerateDepartment(run, departmentId));
    },
    [applyRun]
  );

  const approveDept = useCallback(
    (id: string, departmentId: AiProductionDepartmentId) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(approveDepartment(run, departmentId));
    },
    [applyRun]
  );

  const rejectDept = useCallback(
    (id: string, departmentId: AiProductionDepartmentId) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(rejectDepartment(run, departmentId));
    },
    [applyRun]
  );

  const skipDept = useCallback(
    (id: string, departmentId: AiProductionDepartmentId) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(skipDepartment(run, departmentId));
    },
    [applyRun]
  );

  const duplicateProduction = useCallback(
    (id: string) => {
      const run = getAiProductionRunById(id);
      if (!run) return null;
      const dup = duplicateRun(run);
      writeCustomRuns([...readCustomRuns(), dup]);
      bump();
      return dup.id;
    },
    [bump]
  );

  const advanceDemo = useCallback(
    (id: string) => {
      const run = getAiProductionRunById(id);
      if (!run) return;
      applyRun(advanceRunDemo(run));
    },
    [applyRun]
  );

  return {
    runs,
    activeRun,
    selectedRun,
    updateField,
    addRun,
    pauseProduction,
    resumeProduction,
    regenerateDept,
    approveDept,
    rejectDept,
    skipDept,
    duplicateProduction,
    advanceDemo,
  };
}
