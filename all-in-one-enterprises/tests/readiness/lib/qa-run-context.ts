/**
 * Central QA run context — traceable synthetic records per workflow run.
 */
export interface QaRunContext {
  runId: string;
  startedAt: string;
  marker: string;
}

const QA_NAME_PREFIX = 'AIO QA';

export function createQaRunContext(runId?: string): QaRunContext {
  const id = runId ?? process.env.QA_RUN_ID ?? `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    runId: id,
    startedAt: new Date().toISOString(),
    marker: `QA_RUN:${id}`,
  };
}

export function qaCompanyName(kind: string, ctx: QaRunContext): string {
  return `${QA_NAME_PREFIX} ${kind} ${ctx.runId.slice(-8)}`;
}

export function qaReference(ctx: QaRunContext, entity: string): string {
  return `${ctx.marker}:${entity}`;
}

export function isQaMarked(value: string | undefined | null, ctx: QaRunContext): boolean {
  if (!value) return false;
  return value.includes(ctx.marker) || value.includes(QA_NAME_PREFIX);
}
