/**
 * Experience Lab validation compile context — shared client/server contract.
 * Prevents validationMode leakage into unrelated governed generation requests.
 */

export type ValidationCompileContextFields = {
  validationMode?: boolean;
  compileRunId?: string | null;
  previewSessionId?: string | null;
  organizationId?: string | null;
  departmentId?: string | null;
  stationId?: string | null;
  projectId?: string | null;
};

export function hasCompleteValidationCompileContext(
  ctx: ValidationCompileContextFields | boolean | null | undefined
): boolean {
  if (ctx === true || ctx === false || ctx == null) return false;
  if (ctx.validationMode !== true) return false;
  return (
    String(ctx.compileRunId ?? '').trim().length > 0 &&
    String(ctx.previewSessionId ?? '').trim().length > 0 &&
    String(ctx.organizationId ?? '').trim().length > 0 &&
    String(ctx.departmentId ?? '').trim().length > 0 &&
    String(ctx.stationId ?? '').trim().length > 0 &&
    String(ctx.projectId ?? '').trim().length > 0
  );
}

/**
 * Resolve whether a governed generation request should use Experience Lab validation mode.
 * Requires explicit validationMode plus complete compile scope — never infer from global UI mode alone.
 */
export function resolveValidationCompileMode(
  explicitMode: boolean | undefined,
  ctx: Omit<ValidationCompileContextFields, 'validationMode'>
): boolean {
  if (explicitMode !== true) return false;
  return hasCompleteValidationCompileContext({ validationMode: true, ...ctx });
}
