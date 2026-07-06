/** Registration gate — workflows scoped per organization runtime. */

export function isWorkflowEngineInitialized(organizationId: string): boolean {
  return organizationId.length > 0;
}

export function assertWorkflowBoundary(organizationId: string, contextOrgId: string): boolean {
  return organizationId === contextOrgId;
}

export function canWorkflowExecute(_workflowId: string, organizationId: string): boolean {
  return isWorkflowEngineInitialized(organizationId);
}
