import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exportBlueprintManagerSnapshot } from './useAdminStudioBlueprintManagerState';
import type { BlueprintDefinition } from '../utils/adminStudioBlueprintManagerDemo';
import type { AssetFactoryViewMode, FactoryJobStatus } from '../utils/adminStudioAssetFactoryDemo';
import { FACTORY_ACTIVITY_SEED, FACTORY_DEPARTMENTS } from '../utils/adminStudioAssetFactoryDemo';
import {
  advanceJobDepartment,
  buildGenerationPlan,
  createFactoryJob,
  getApprovedBlueprintsForFactory,
  type FactoryJob,
  type GenerationPlan,
} from '../utils/adminStudioAssetFactoryPipeline';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type AssetFactoryStore = {
  jobs?: FactoryJob[];
  viewMode?: AssetFactoryViewMode;
  selectedJobId?: string;
  activity?: Array<{ id: string; text: string; time: string; category: string }>;
};

function readStore(): AssetFactoryStore {
  return readStudioJson<AssetFactoryStore>(ADMIN_STUDIO_STORAGE_KEYS.assetFactory) ?? {};
}

function writeStore(store: AssetFactoryStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.assetFactory, store);
}

export function exportAssetFactorySnapshot() {
  const store = readStore();
  return {
    jobs: store.jobs ?? [],
    viewMode: store.viewMode ?? 'executive',
    source: 'asset-factory-local' as const,
  };
}

const TICK_MS = 2200;

export function useAdminStudioAssetFactory() {
  const [version, setVersion] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const blueprintSnap = useMemo(() => exportBlueprintManagerSnapshot(), [version]);
  const approvedBlueprints = useMemo(
    () => getApprovedBlueprintsForFactory(blueprintSnap.blueprints),
    [blueprintSnap]
  );

  const jobs = store.jobs ?? [];
  const viewMode = store.viewMode ?? 'executive';
  const selectedJobId = store.selectedJobId;
  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? jobs.find((j) => j.status === 'running') ?? null;
  const activity = store.activity ?? FACTORY_ACTIVITY_SEED;

  const setViewMode = useCallback(
    (mode: AssetFactoryViewMode) => {
      writeStore({ ...readStore(), viewMode: mode });
      bump();
    },
    [bump]
  );

  const selectJob = useCallback(
    (id: string | undefined) => {
      writeStore({ ...readStore(), selectedJobId: id });
      bump();
    },
    [bump]
  );

  const pushActivity = useCallback(
    (text: string, category: string) => {
      const s = readStore();
      const entry = { id: `act-${Date.now()}`, text, time: 'JUST NOW', category };
      writeStore({ ...s, activity: [entry, ...(s.activity ?? FACTORY_ACTIVITY_SEED)].slice(0, 20) });
    },
    []
  );

  const updateJob = useCallback(
    (jobId: string, updater: (job: FactoryJob) => FactoryJob) => {
      const s = readStore();
      const jobs = (s.jobs ?? []).map((j) => (j.id === jobId ? updater(j) : j));
      writeStore({ ...s, jobs });
      bump();
    },
    [bump]
  );

  const startManufacturing = useCallback(
    (bp: BlueprintDefinition, variations: string[] = [], startTour = true) => {
      const job = createFactoryJob(bp, variations);
      job.status = 'running';
      const advanced = advanceJobDepartment({ ...job, departmentIndex: -1 });
      const s = readStore();
      writeStore({
        ...s,
        jobs: [advanced, ...(s.jobs ?? [])],
        selectedJobId: advanced.id,
        viewMode: startTour ? 'tour' : 'floor',
      });
      pushActivity(`MANUFACTURING STARTED · ${bp.identity.name}`, 'FACTORY');
      bump();
    },
    [bump, pushActivity]
  );

  const setJobStatus = useCallback(
    (jobId: string, status: FactoryJobStatus) => {
      updateJob(jobId, (j) => ({ ...j, status }));
    },
    [updateJob]
  );

  const pauseJob = useCallback((jobId: string) => setJobStatus(jobId, 'paused'), [setJobStatus]);
  const resumeJob = useCallback(
    (jobId: string) => setJobStatus(jobId, 'running'),
    [setJobStatus]
  );
  const cancelJob = useCallback(
    (jobId: string) => {
      updateJob(jobId, (j) => ({ ...j, status: 'failed', errors: [...j.errors, 'CANCELLED BY OPERATOR'] }));
    },
    [updateJob]
  );
  const retryJob = useCallback(
    (jobId: string) => {
      const s = readStore();
      const job = s.jobs?.find((j) => j.id === jobId);
      const bp = blueprintSnap.blueprints.find((b) => b.id === job?.blueprintId);
      if (!bp) return;
      startManufacturing(bp, job?.variations ?? [], false);
    },
    [blueprintSnap.blueprints, startManufacturing]
  );

  const reprioritizeJob = useCallback(
    (jobId: string, delta: number) => {
      updateJob(jobId, (j) => ({ ...j, priority: Math.max(1, j.priority + delta) }));
    },
    [updateJob]
  );

  const getPlan = useCallback((bp: BlueprintDefinition): GenerationPlan => buildGenerationPlan(bp), []);

  useEffect(() => {
    const running = jobs.find((j) => j.status === 'running');
    if (!running) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    if (tickRef.current) return;

    tickRef.current = setInterval(() => {
      const s = readStore();
      const current = s.jobs?.find((j) => j.id === running.id);
      if (!current || current.status !== 'running') {
        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = null;
        return;
      }

      if (current.departmentIndex >= FACTORY_DEPARTMENTS.length - 1 && current.progressPct >= 100) {
        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = null;
        return;
      }

      const next = advanceJobDepartment(current);
      const jobs = (s.jobs ?? []).map((j) => (j.id === current.id ? next : j));
      writeStore({ ...s, jobs });
      if (next.currentDepartmentId) {
        const dept = FACTORY_DEPARTMENTS.find((d) => d.id === next.currentDepartmentId);
        if (dept) {
          const act = readStore();
          const entry = { id: `act-${Date.now()}`, text: dept.tourMessage.replace('…', ''), time: 'JUST NOW', category: dept.label };
          writeStore({ ...act, activity: [entry, ...(act.activity ?? [])].slice(0, 20) });
        }
      }
      setVersion((v) => v + 1);
    }, TICK_MS);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [jobs, version]);

  return {
    viewMode,
    setViewMode,
    jobs,
    selectedJob,
    selectJob,
    approvedBlueprints,
    activity,
    startManufacturing,
    pauseJob,
    resumeJob,
    cancelJob,
    retryJob,
    reprioritizeJob,
    getPlan,
  };
}
