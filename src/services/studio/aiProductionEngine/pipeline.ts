import {
  AI_PRODUCTION_FLOW_STEPS,
  AI_PRODUCTION_QUALITY_THRESHOLD,
  computeQualityScore,
  departmentFlowIndex,
  type AiProductionDepartmentId,
  type AiProductionDepartmentStatus,
  type AiProductionRun,
} from '../../../utils/adminStudioAiProductionEngineDemo';

export function getRunProgress(run: AiProductionRun): number {
  const total = AI_PRODUCTION_FLOW_STEPS.reduce((sum, step) => sum + run.departments[step.id].progress, 0);
  return Math.round(total / AI_PRODUCTION_FLOW_STEPS.length);
}

function nextStatusForRegenerate(): AiProductionDepartmentStatus {
  return 'generating';
}

export function regenerateDepartment(run: AiProductionRun, departmentId: AiProductionDepartmentId): AiProductionRun {
  const departments = { ...run.departments };
  departments[departmentId] = {
    ...departments[departmentId],
    status: nextStatusForRegenerate(),
    progress: Math.min(departments[departmentId].progress, 40),
    lastUpdated: 'NOW',
  };
  const next: AiProductionRun = {
    ...run,
    departments,
    currentDepartment: departmentId,
    runStatus: 'running',
    lastUpdated: 'NOW',
  };
  next.qualityScore = computeQualityScore(next);
  return next;
}

export function approveDepartment(run: AiProductionRun, departmentId: AiProductionDepartmentId): AiProductionRun {
  const departments = { ...run.departments };
  departments[departmentId] = {
    ...departments[departmentId],
    status: 'approved',
    progress: 100,
    lastUpdated: 'NOW',
  };
  const idx = departmentFlowIndex(departmentId);
  const nextDept = AI_PRODUCTION_FLOW_STEPS[idx + 1]?.id ?? departmentId;
  if (AI_PRODUCTION_FLOW_STEPS[idx + 1]) {
    const nextState = departments[nextDept];
    if (nextState.status === 'waiting' || nextState.status === 'queued') {
      departments[nextDept] = { ...nextState, status: 'in-progress', progress: Math.max(nextState.progress, 10) };
    }
  }
  const allApproved = AI_PRODUCTION_FLOW_STEPS.every(
    (s) => departments[s.id].status === 'approved' || departments[s.id].status === 'complete'
  );
  const next: AiProductionRun = {
    ...run,
    departments,
    currentDepartment: nextDept,
    runStatus: allApproved ? 'draft-complete' : 'running',
    lastUpdated: 'NOW',
  };
  next.qualityScore = computeQualityScore(next);
  next.qualityRevisionNote =
    next.qualityScore < AI_PRODUCTION_QUALITY_THRESHOLD
      ? `BELOW THRESHOLD (${AI_PRODUCTION_QUALITY_THRESHOLD}%) — RECOMMEND REVISIONS BEFORE APPROVAL`
      : 'MEETS PRODUCTION QUALITY THRESHOLD';
  return next;
}

export function rejectDepartment(run: AiProductionRun, departmentId: AiProductionDepartmentId): AiProductionRun {
  const departments = { ...run.departments };
  departments[departmentId] = {
    ...departments[departmentId],
    status: 'rejected',
    progress: Math.max(0, departments[departmentId].progress - 20),
    lastUpdated: 'NOW',
  };
  const next: AiProductionRun = {
    ...run,
    departments,
    runStatus: 'rejected',
    qualityRevisionNote: `${departmentId.toUpperCase()} REJECTED — REGENERATE OR REVISE`,
    lastUpdated: 'NOW',
  };
  next.qualityScore = computeQualityScore(next);
  return next;
}

export function skipDepartment(run: AiProductionRun, departmentId: AiProductionDepartmentId): AiProductionRun {
  const departments = { ...run.departments };
  departments[departmentId] = {
    ...departments[departmentId],
    status: 'skipped',
    progress: 100,
    lastUpdated: 'NOW',
  };
  const idx = departmentFlowIndex(departmentId);
  const nextDept = AI_PRODUCTION_FLOW_STEPS[idx + 1]?.id ?? departmentId;
  const next: AiProductionRun = {
    ...run,
    departments,
    currentDepartment: nextDept,
    runStatus: 'running',
    lastUpdated: 'NOW',
  };
  next.qualityScore = computeQualityScore(next);
  return next;
}

export function pauseRun(run: AiProductionRun): AiProductionRun {
  const departments = { ...run.departments };
  Object.keys(departments).forEach((key) => {
    const id = key as AiProductionDepartmentId;
    const state = departments[id];
    if (state.status === 'in-progress' || state.status === 'generating') {
      departments[id] = { ...state, status: 'paused' };
    }
  });
  return { ...run, departments, runStatus: 'paused', lastUpdated: 'NOW' };
}

export function resumeRun(run: AiProductionRun): AiProductionRun {
  const departments = { ...run.departments };
  const current = departments[run.currentDepartment];
  if (current.status === 'paused' || current.status === 'waiting' || current.status === 'queued') {
    departments[run.currentDepartment] = {
      ...current,
      status: current.progress >= 80 ? 'complete' : 'in-progress',
      progress: Math.min(100, current.progress + 12),
      lastUpdated: 'NOW',
    };
  }
  const next: AiProductionRun = { ...run, departments, runStatus: 'running', lastUpdated: 'NOW' };
  next.qualityScore = computeQualityScore(next);
  return next;
}

export function duplicateRun(run: AiProductionRun): AiProductionRun {
  const id = `run-dup-${Date.now()}`;
  return {
    ...run,
    id,
    title: `${run.title} (COPY)`,
    contentPackRef: id,
    runStatus: 'draft',
    lastUpdated: 'NOW',
    qualityRevisionNote: '',
  };
}

export function advanceRunDemo(run: AiProductionRun): AiProductionRun {
  const dept = run.currentDepartment;
  const state = run.departments[dept];
  const progress = Math.min(100, state.progress + 18);
  let status: AiProductionDepartmentStatus = progress >= 100 ? 'complete' : state.status === 'queued' ? 'in-progress' : state.status;
  if (status !== 'complete' && (state.status === 'waiting' || state.status === 'queued')) {
    status = 'in-progress';
  }
  const departments = { ...run.departments };
  departments[dept] = { ...state, progress, status, lastUpdated: 'NOW' };
  let currentDepartment = dept;
  if (progress >= 100) {
    departments[dept] = { ...departments[dept], status: 'complete', progress: 100 };
    const idx = departmentFlowIndex(dept);
    currentDepartment = AI_PRODUCTION_FLOW_STEPS[idx + 1]?.id ?? dept;
    if (AI_PRODUCTION_FLOW_STEPS[idx + 1]) {
      const nextState = departments[currentDepartment];
      departments[currentDepartment] = {
        ...nextState,
        status: nextState.status === 'waiting' ? 'queued' : nextState.status,
        progress: Math.max(nextState.progress, 5),
      };
    }
  }
  const allDone = AI_PRODUCTION_FLOW_STEPS.every(
    (s) => departments[s.id].status === 'complete' || departments[s.id].status === 'approved'
  );
  const next: AiProductionRun = {
    ...run,
    departments,
    currentDepartment,
    runStatus: allDone ? 'draft-complete' : 'running',
    lastUpdated: 'NOW',
  };
  next.qualityScore = computeQualityScore(next);
  return next;
}
