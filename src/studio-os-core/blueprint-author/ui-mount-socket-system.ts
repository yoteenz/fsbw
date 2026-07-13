/**
 * Blueprint Author UI Mount Socket System™
 * Architecture Law #001 — Blueprint Author is source of truth for React runtime mounts.
 */

export {
  UI_SOCKET_REGISTRY_VERSION,
  DEPARTMENT_UI_SOCKET_IDS,
  defineDefaultDepartmentUiSockets,
  getUiMountSocket,
  assertRequiredUiSocketsPresent,
  type DepartmentUiSocketId,
  type UiMountSocket,
  type DepartmentUiSocketBlueprint,
} from '../architecture-law-001/ui-socket-registry';

export {
  attachUiSocketBlueprintToConstructionPlan,
  validateDepartmentBlueprintForLaw001,
} from '../architecture-law-001/integration';
