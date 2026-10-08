export type FabricationValidationReport = {
  reportId: string;
  manifestId: string;
  stageId: string;
  generatedAt: string;
  geometryChecks: Array<{ id: string; pass: boolean; detail?: string }>;
  materialChecks: Array<{ id: string; pass: boolean; detail?: string }>;
  spatialContinuityChecks: Array<{ id: string; pass: boolean; detail?: string }>;
  runtimePerformance?: {
    triangleCount?: number;
    glbSizeBytes?: number;
    drawCalls?: number;
    notes?: string;
  };
  overall: 'PASS' | 'FAIL' | 'PENDING';
};

export function ingestValidationReport(report: FabricationValidationReport): { accepted: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!report.manifestId) errors.push('report missing manifestId');
  if (report.overall === 'PASS') {
    const failed = [
      ...report.geometryChecks,
      ...report.materialChecks,
      ...report.spatialContinuityChecks,
    ].filter((c) => !c.pass);
    if (failed.length) errors.push('overall PASS inconsistent with failing checks');
  }
  return { accepted: errors.length === 0, errors };
}
