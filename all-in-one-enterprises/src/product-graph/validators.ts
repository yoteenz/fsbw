import { getRouteMetaRegistry, getRuntimeProductGraph } from './runtimeGraph';
import type { RoleProjection } from './types';

const VALID_FAMILIES = new Set(
  getRuntimeProductGraph()
    .families.map((f) => f.id),
);
const VALID_ROLE_PROJECTIONS = new Set<RoleProjection>(['SHIPPER', 'DRIVER', 'FLEETCARE_PROVIDER', 'AIO_OFFICE', null]);
const VALID_CONTAINERS = new Set([
  'MY_OFFICE',
  'MY_BUSINESS',
  'OPERATIONS',
  'FINANCES',
  'VAULT',
  'INBOX',
  'SERVICES',
  'ACCOUNT',
  'AIO_OFFICE',
]);

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
  node_id?: string;
}

export function validateProductGraph(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const graph = getRuntimeProductGraph();
  const seenNodeIds = new Set<string>();
  const seenPaths = new Set<string>();

  for (const node of graph.nodes) {
    if (seenNodeIds.has(node.node_id)) {
      issues.push({ code: 'DUPLICATE_NODE_ID', message: 'Duplicate node_id', node_id: node.node_id });
    }
    seenNodeIds.add(node.node_id);

    const pathKey = `${node.guard}:${node.route}:${node.node_id}`;
    if (seenPaths.has(pathKey)) {
      issues.push({ code: 'DUPLICATE_CANONICAL_PATH', message: 'Duplicate route path', path: node.route });
    }
    seenPaths.add(pathKey);

    if (!VALID_FAMILIES.has(node.family_id)) {
      issues.push({ code: 'INVALID_FAMILY', message: 'Unknown family_id', node_id: node.node_id, path: node.route });
    }
    if (!VALID_ROLE_PROJECTIONS.has(node.role_projection)) {
      issues.push({ code: 'INVALID_ROLE_PROJECTION', message: 'Unknown role projection', node_id: node.node_id });
    }
    if (node.container && !VALID_CONTAINERS.has(node.container)) {
      issues.push({ code: 'INVALID_CONTAINER', message: 'Unknown container', path: node.route });
    }
    if (node.requires_auth && node.guard === 'NONE' && node.audience !== 'public') {
      issues.push({ code: 'MISSING_GUARD_META', message: 'Auth route without guard kind', path: node.route });
    }
    if (node.is_public && node.requires_auth) {
      issues.push({ code: 'PUBLIC_PRIVATE_CONFLICT', message: 'Public route marked requires_auth', path: node.route });
    }
  }

  return issues;
}

export function validateRouteMetaRegistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const registry = getRouteMetaRegistry();
  const paths = new Set<string>();
  const nodeIds = new Set<string>();

  for (const entry of registry.entries) {
    const pathKey = `${entry.node_id}:${entry.path}`;
    if (paths.has(pathKey)) {
      issues.push({ code: 'DUPLICATE_PATH', message: 'Duplicate meta path', path: entry.path });
    }
    paths.add(pathKey);
    if (nodeIds.has(entry.node_id)) {
      issues.push({ code: 'DUPLICATE_NODE_ID', message: 'Duplicate meta node_id', node_id: entry.node_id });
    }
    nodeIds.add(entry.node_id);
    if (!VALID_FAMILIES.has(entry.family_id)) {
      issues.push({ code: 'MISSING_FAMILY', message: 'Invalid family on meta entry', path: entry.path });
    }
    if (entry.requires_auth && !entry.is_public && entry.guard === 'NONE') {
      issues.push({ code: 'PRIVATE_WITHOUT_GUARD', message: 'Private route without guard expectation', path: entry.path });
    }
  }

  return issues;
}

export function validateRoleProjections(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const entry of getRouteMetaRegistry().entries) {
    if (entry.path.startsWith('/shipper/') && entry.role_projection !== 'SHIPPER') {
      issues.push({ code: 'SHIPPER_PROJECTION', message: 'Shipper route missing SHIPPER projection', path: entry.path });
    }
    if (entry.path.startsWith('/driver/driverlink') && entry.role_projection !== 'DRIVER') {
      issues.push({ code: 'DRIVER_PROJECTION', message: 'Driver route missing DRIVER projection', path: entry.path });
    }
    if (entry.path.startsWith('/provider/fleetcare') && entry.role_projection !== 'FLEETCARE_PROVIDER') {
      issues.push({ code: 'PROVIDER_PROJECTION', message: 'Provider route missing FLEETCARE_PROVIDER projection', path: entry.path });
    }
    if (entry.path.startsWith('/office') && entry.role_projection !== 'AIO_OFFICE') {
      issues.push({ code: 'OFFICE_PROJECTION', message: 'Office route missing AIO_OFFICE projection', path: entry.path });
    }
  }
  return issues;
}

export function validateInboxContainer(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const paths = new Set(getRouteMetaRegistry().entries.map((e) => e.path));
  if (!paths.has('/portal/inbox')) {
    issues.push({ code: 'INBOX_ROOT', message: 'Missing /portal/inbox route meta' });
  }
  for (const suffix of ['/portal/inbox/messages', '/portal/inbox/notifications', '/portal/inbox/appointments']) {
    if (!paths.has(suffix)) {
      issues.push({ code: 'INBOX_CHILD', message: `Missing inbox child meta: ${suffix}` });
    }
  }
  return issues;
}

export function assertStructuralGraphValid(): void {
  const all = [
    ...validateProductGraph(),
    ...validateRouteMetaRegistry(),
    ...validateRoleProjections(),
    ...validateInboxContainer(),
  ];
  if (all.length) {
    throw new Error(`Product graph validation failed:\n${all.map((i) => `- ${i.code}: ${i.message} ${i.path ?? ''}`).join('\n')}`);
  }
}
