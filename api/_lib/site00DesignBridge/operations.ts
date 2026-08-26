/** Structured operation validation — no arbitrary code from Supabase */

import { SITE00_OPERATION_TYPES } from './types.js';
import type { BridgeValidationResult, Site00ProjectKey, Site00StructuredOperation } from './types.js';
import {
  ALLOWED_COMPONENT_VARIANTS,
  ALLOWED_DESIGN_TOKEN_KEYS,
  ALLOWED_SECTION_KEYS,
  FORBIDDEN_OPERATION_KEYS,
  GLOBAL_PATH_DENYLIST,
  P0_PAF_PROTECTED_PATTERNS,
  PROJECT_PATH_ALLOWLISTS,
  STUDIO_WORLD_NATIVE_DENYLIST,
} from './constants.js';

function hasForbiddenPayload(op: Record<string, unknown>): string | null {
  for (const key of FORBIDDEN_OPERATION_KEYS) {
    if (key in op && op[key] != null) return `Forbidden operation field: ${key}`;
  }
  if (typeof op.value === 'string' && /^\s*(eval|Function|import\s*\(|require\s*\()/i.test(op.value)) {
    return 'Forbidden executable string in operation value';
  }
  return null;
}

export function isKnownOperationType(type: unknown): type is (typeof SITE00_OPERATION_TYPES)[number] {
  return typeof type === 'string' && (SITE00_OPERATION_TYPES as readonly string[]).includes(type);
}

export function normalizeTargetPath(raw: string): string {
  return raw.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

export function isPathAllowedForProject(projectId: Site00ProjectKey, targetPath: string): boolean {
  const path = normalizeTargetPath(targetPath);
  if (GLOBAL_PATH_DENYLIST.some((re) => re.test(path))) return false;
  if (projectId === 'STUDIO_WORLD_WEBSITE' && STUDIO_WORLD_NATIVE_DENYLIST.some((re) => re.test(path))) {
    return false;
  }
  return PROJECT_PATH_ALLOWLISTS[projectId].some((re) => re.test(path));
}

export function isP0PafProtectedPath(targetPath: string): boolean {
  const path = normalizeTargetPath(targetPath);
  return P0_PAF_PROTECTED_PATTERNS.some((re) => re.test(path));
}

export function validateOperations(
  projectId: Site00ProjectKey,
  operations: Site00StructuredOperation[],
): BridgeValidationResult {
  if (!Array.isArray(operations) || operations.length === 0) {
    return { ok: false, status: 'BLOCKED', reason: 'No structured operations provided' };
  }

  for (const op of operations) {
    const raw = op as unknown as Record<string, unknown>;
    const forbidden = hasForbiddenPayload(raw);
    if (forbidden) return { ok: false, status: 'BLOCKED', reason: forbidden };

    if (!isKnownOperationType(op.type)) {
      return { ok: false, status: 'UNSUPPORTED_OPERATION', reason: `Unknown operation type: ${String(op.type)}` };
    }

    if (op.targetPath) {
      const path = normalizeTargetPath(op.targetPath);
      if (!isPathAllowedForProject(projectId, path)) {
        return {
          ok: false,
          status: 'BLOCKED',
          reason: `Path not allowed for ${projectId}: ${path}`,
          affectedTargets: [path],
        };
      }
      if (op.type === 'CHANGE_ASSET_BINDING' && isP0PafProtectedPath(path)) {
        return {
          ok: false,
          status: 'BLOCKED',
          reason: 'P0.PAF product asset authority preserved — generic asset binding blocked',
          affectedTargets: [path],
        };
      }
    }

    if (op.type === 'UPDATE_DESIGN_TOKEN' && op.tokenKey && !ALLOWED_DESIGN_TOKEN_KEYS.has(op.tokenKey)) {
      return { ok: false, status: 'BLOCKED', reason: `Design token not in allowlist: ${op.tokenKey}` };
    }

    if (op.type === 'UPDATE_ALLOWED_COMPONENT_VARIANT') {
      const componentId = op.componentId ?? '';
      const variant = String(op.value ?? '');
      const allowed = ALLOWED_COMPONENT_VARIANTS[componentId];
      if (!allowed || !allowed.has(variant)) {
        return {
          ok: false,
          status: 'BLOCKED',
          reason: `Component variant not registered: ${componentId}/${variant}`,
        };
      }
    }

    if (op.type === 'REORDER_SECTION' && Array.isArray(op.order)) {
      for (const key of op.order) {
        if (!ALLOWED_SECTION_KEYS.has(key)) {
          return { ok: false, status: 'BLOCKED', reason: `Section key not allowed: ${key}` };
        }
      }
    }
  }

  return { ok: true, status: 'VALID' };
}

export function extractExpectedTargets(operations: Site00StructuredOperation[]): {
  files: string[];
  components: string[];
  routes: string[];
} {
  const files = new Set<string>();
  const components = new Set<string>();
  const routes = new Set<string>();

  for (const op of operations) {
    if (op.targetPath) files.add(normalizeTargetPath(op.targetPath));
    if (op.componentId) components.add(op.componentId);
    if (op.route) routes.add(op.route);
    if (op.type === 'REGISTER_ROUTE' && typeof op.value === 'string') routes.add(op.value);
  }

  return {
    files: [...files],
    components: [...components],
    routes: [...routes],
  };
}
