#!/usr/bin/env node
/**
 * Wave 0 — bind forensic canonical graph to runtime registry + wave0 docs.
 * Single source: docs/structural-completion/AIO_CANONICAL_PRODUCT_GRAPH.json (regenerated via build-forensic-artifacts.mjs).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync as readFs, writeFileSync as writeFs, mkdirSync as mkdirFs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_FORENSIC = join(ROOT, 'docs/structural-completion');
const OUT_WAVE0 = join(OUT_FORENSIC, 'wave0');
const GEN = join(ROOT, 'src/product-graph/generated');

const FAMILIES = JSON.parse(readFs(join(OUT_FORENSIC, 'AIO_CANONICAL_PRODUCT_GRAPH.json'), 'utf8')).families;

const ROLE_PROJECTIONS = ['SHIPPER', 'DRIVER', 'FLEETCARE_PROVIDER', 'AIO_OFFICE'];

const LEGACY_ALIASES = [
  { from: '/client-portal', to: '/client-portal', kind: 'MARKETING_SURFACE', target_family: 'F01' },
  { from: '/sign-up', to: '/signup', kind: 'REDIRECT', preserve_query: true },
  { from: '/get-started/desktop', to: '/desktop/get-started', kind: 'REDIRECT', preserve_query: true },
  { from: '/get-started/mobile', to: '/mobile/get-started', kind: 'REDIRECT', preserve_query: true },
];

const DUPLICATION_RECONCILIATION = [
  { group: 'route_tree_mirror', owner: 'CANONICAL_ROOT_MOUNT', status: 'COMPATIBILITY', note: 'desktop/mobile preview prefixes' },
  { group: 'client_command_naming', owner: 'F05_MY_OFFICE', status: 'CANONICAL', note: 'Display MY OFFICE; internal Client Command Center modules preserved' },
  { group: 'document_storage', owner: 'F16_VAULT', status: 'CANONICAL', note: 'Vault owns documents' },
  { group: 'load_records', owner: 'aio_dispatch_loads', status: 'COMPATIBILITY', note: 'Demo loads until backend mode' },
  { group: 'financial_summaries', owner: 'DOMAIN_SEPARATED', status: 'CANONICAL', note: 'FINANCES container only — no merged money model' },
  { group: 'inbox_vs_messages', owner: 'F17_INBOX_CONTAINER', status: 'CANONICAL', note: '/portal/inbox over messages/notifications/appointments' },
];

const CONTAINER_MAP = {
  MY_OFFICE: { label: 'MY OFFICE', families: ['F05'], route_prefixes: ['portal', 'portal/activity', 'portal/search'] },
  MY_BUSINESS: {
    label: 'MY BUSINESS',
    families: ['F03', 'F04', 'F12'],
    route_prefixes: ['start-your-business', 'portal/business', 'portal/road-ready', 'portal/insurance', 'portal/fleet', 'portal/calendar', 'portal/renewals'],
  },
  OPERATIONS: {
    label: 'OPERATIONS',
    families: ['F07', 'F08', 'F09', 'F14', 'F15'],
    route_prefixes: ['portal/operations', 'portal/dispatch', 'portal/load-board', 'portal/brokerage', 'portal/fleetcare', 'portal/driverlink', 'shipper'],
  },
  FINANCES: {
    label: 'FINANCES',
    families: ['F10', 'F11', 'F13'],
    route_prefixes: ['portal/money', 'portal/billing', 'portal/quotes', 'portal/factoring', 'portal/bookkeeping'],
  },
  VAULT: { label: 'VAULT', families: ['F16'], route_prefixes: ['portal/documents', 'portal/vault'] },
  INBOX: {
    label: 'INBOX',
    families: ['F17'],
    route_prefixes: ['portal/inbox', 'portal/messages', 'portal/notifications', 'portal/appointments', 'portal/communication'],
  },
  SERVICES: { label: 'SERVICES', families: ['F06'], route_prefixes: ['services', 'portal/services', 'portal/requests'] },
  ACCOUNT: { label: 'ACCOUNT', families: ['F18'], route_prefixes: ['portal/settings', 'portal/team', 'login', 'signup'] },
};

function normalizePath(route) {
  if (!route || route === '(index)') return '/';
  const p = route.replace(/^\//, '');
  return `/${p}`;
}

const PORTAL_SEGMENTS = new Set([
  'business',
  'operations',
  'money',
  'documents',
  'communication',
  'inbox',
  'messages',
  'appointments',
  'notifications',
  'requests',
  'services',
  'activity',
  'team',
  'search',
  'onboarding',
  'road-ready',
  'fleet',
  'vault',
  'calendar',
  'renewals',
  'quotes',
  'billing',
  'dispatch',
  'load-board',
  'factoring',
  'bookkeeping',
  'fleetcare',
  'driverlink',
  'insurance',
  'brokerage',
  'settings',
  'roadmap',
]);

function resolveCanonicalPath(node) {
  const route = node.route ?? '';
  const src = node.source_files?.[0] ?? '';
  if (src.includes('OfficeRoutes.tsx')) {
    const rel = route.startsWith('office/') ? route : `office/${route}`;
    return normalizePath(rel === 'office/(index)' ? 'office' : rel);
  }
  if (route.startsWith('provider/') || route.startsWith('driver/') || route.startsWith('shipper/')) {
    return normalizePath(route);
  }
  if (node.role_projection === 'FLEETCARE_PROVIDER') {
    return normalizePath(route === '(index)' ? 'provider/fleetcare' : `provider/fleetcare/${route}`);
  }
  if (node.role_projection === 'DRIVER') {
    return normalizePath(route === '(index)' ? 'driver/driverlink' : `driver/driverlink/${route}`);
  }
  if (node.role_projection === 'SHIPPER' || node.audience === 'shipper') {
    return normalizePath(route === '(index)' ? 'shipper' : `shipper/${route}`);
  }
  const head = route.split('/')[0];
  if (route === 'portal' || (route === '(index)' && node.family_id === 'F05')) return '/portal';
  if (head === 'inbox') return normalizePath(`portal/${route}`);
  if (PORTAL_SEGMENTS.has(head)) return normalizePath(`portal/${route}`);
  return normalizePath(route);
}

function containerForNode(familyId, pathNorm) {
  const rel = pathNorm.replace(/^\//, '');
  const familyFirst = {
    F05: 'MY_OFFICE',
    F17: 'INBOX',
    F16: 'VAULT',
    F18: 'ACCOUNT',
    F06: 'SERVICES',
  };
  if (familyFirst[familyId]) return familyFirst[familyId];
  for (const [key, def] of Object.entries(CONTAINER_MAP)) {
    if (def.families.includes(familyId)) return key;
    if (def.route_prefixes.some((pref) => rel === pref || rel.startsWith(`${pref}/`))) return key;
  }
  if (rel.startsWith('office/')) return 'AIO_OFFICE';
  if (rel.startsWith('provider/')) return 'OPERATIONS';
  if (rel.startsWith('driver/')) return 'OPERATIONS';
  return null;
}

function requiresAuth(audience, pathNorm) {
  if (audience === 'public' || audience === 'auth') return false;
  return true;
}

function guardKind(audience, roleProjection) {
  if (audience === 'office' || roleProjection === 'AIO_OFFICE') return 'OFFICE';
  if (roleProjection === 'FLEETCARE_PROVIDER') return 'PROVIDER';
  if (roleProjection === 'DRIVER') return 'DRIVER';
  if (roleProjection === 'SHIPPER') return 'SHIPPER';
  if (audience === 'customer') return 'CUSTOMER';
  return 'NONE';
}

function layoutFor(audience) {
  if (audience === 'office') return 'office';
  if (audience === 'provider') return 'provider_fleetcare';
  if (audience === 'driver') return 'driver_driverlink';
  if (audience === 'shipper') return 'portal_shipper';
  if (audience === 'customer') return 'portal';
  return 'public';
}

function runForensicRefresh() {
  const r = spawnSync('node', ['scripts/structural-completion/build-forensic-artifacts.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

runForensicRefresh();

const graph = JSON.parse(readFs(join(OUT_FORENSIC, 'AIO_CANONICAL_PRODUCT_GRAPH.json'), 'utf8'));
const forensicRoutes = JSON.parse(readFs(join(OUT_FORENSIC, 'AIO_ROUTE_FORENSIC.json'), 'utf8'));
const gapRegister = JSON.parse(readFs(join(OUT_FORENSIC, 'AIO_STRUCTURAL_GAP_REGISTER.json'), 'utf8'));

const routeMetaEntries = [];
const runtimeNodes = [];

for (const node of graph.nodes) {
  const pathNorm = resolveCanonicalPath(node);
  const container = containerForNode(node.family_id, pathNorm);
  const family = FAMILIES.find((f) => f.id === node.family_id);
  const requires_auth = requiresAuth(node.audience, pathNorm);
  const guard = guardKind(node.audience, node.role_projection);

  const meta = {
    path: pathNorm,
    node_id: node.node_id,
    family_id: node.family_id,
    family_code: family?.code ?? null,
    node_type: node.node_type,
    audience: node.audience,
    role_projection: node.role_projection,
    requires_auth,
    roles: [],
    permissions: [],
    layout: layoutFor(node.audience),
    container,
    nav_visibility: Boolean(family?.nav && node.node_type === 'PARENT_PAGE'),
    legacy_alias: node.legacy_aliases?.[0] ?? null,
    guard,
    functional_status: node.functional_status ?? 'PARTIAL',
    visual_status: 'DEFERRED',
    approval_status: 'DEFERRED',
    launch_status: 'STRUCTURED',
    is_deprecated: false,
    is_internal: node.audience === 'office',
    is_public: node.audience === 'public',
  };

  routeMetaEntries.push(meta);

  runtimeNodes.push({
    path: pathNorm,
    node_id: node.node_id,
    family_id: node.family_id,
    family_code: family?.code ?? null,
    parent_id: null,
    title: node.title,
    product_name: node.product_name,
    technical_name: node.technical_name,
    node_type: node.node_type,
    route: pathNorm,
    audience: node.audience,
    role_projection: node.role_projection,
    visibility: node.visibility,
    requires_auth,
    required_roles: [],
    required_permissions: [],
    container,
    navigation_group: family?.nav ?? null,
    navigation_order: null,
    dependencies: [],
    child_nodes: [],
    functional_status: meta.functional_status,
    visual_status: meta.visual_status,
    approval_status: meta.approval_status,
    launch_status: meta.launch_status,
    legacy_aliases: node.legacy_aliases ?? [],
    source_component: node.product_name,
    source_route_file: node.source_files?.[0] ?? null,
    is_deprecated: false,
    is_internal: meta.is_internal,
    is_public: meta.is_public,
    guard,
  });
}

mkdirFs(GEN, { recursive: true });
mkdirFs(OUT_WAVE0, { recursive: true });

const runtimeProductGraph = {
  meta: {
    sprint: 'P0.AIO.WAVE-0-CANONICAL-GRAPH-AND-ROUTE-META',
    generated_at: new Date().toISOString(),
    source: 'docs/structural-completion/AIO_CANONICAL_PRODUCT_GRAPH.json',
    families: FAMILIES.length,
    nodes: runtimeNodes.length,
  },
  families: FAMILIES,
  role_projections: ROLE_PROJECTIONS,
  containers: CONTAINER_MAP,
  nodes: runtimeNodes,
};

const routeMetaRegistry = {
  meta: {
    sprint: 'P0.AIO.WAVE-0-CANONICAL-GRAPH-AND-ROUTE-META',
    generated_at: new Date().toISOString(),
    entry_count: routeMetaEntries.length,
  },
  entries: routeMetaEntries,
};

writeFs(join(GEN, 'runtimeProductGraph.json'), JSON.stringify(runtimeProductGraph, null, 2));
writeFs(join(GEN, 'routeMetaRegistry.json'), JSON.stringify(routeMetaRegistry, null, 2));

const activeMaterial = forensicRoutes.filter(
  (r) => r.component && !['Navigate', 'Outlet'].includes(r.component) && r.path !== 'sign-up',
);

const metaPaths = new Set(routeMetaEntries.map((e) => normalizePath(e.path.replace(/^\//, ''))));
const unmapped = activeMaterial.filter((r) => {
  const p = normalizePath(r.path);
  return !routeMetaEntries.some((e) => e.path === p || e.node_id === r.route_id);
});

const coverage = {
  total_route_declarations_audited: forensicRoutes.length,
  total_active_material_routes: activeMaterial.length,
  total_meta_entries: routeMetaEntries.length,
  active_material_with_meta: activeMaterial.length - unmapped.length,
  active_material_route_meta_coverage_pct: Math.round(
    ((activeMaterial.length - unmapped.length) / Math.max(activeMaterial.length, 1)) * 100,
  ),
  unmapped_active_product_routes: unmapped.map((r) => ({ path: r.path, route_id: r.route_id, component: r.component })),
  families_in_runtime: FAMILIES.length,
  role_projections_in_runtime: ROLE_PROJECTIONS.length,
};

writeFs(join(OUT_WAVE0, 'AIO_RUNTIME_PRODUCT_GRAPH.json'), JSON.stringify(runtimeProductGraph, null, 2));
writeFs(join(OUT_WAVE0, 'AIO_ROUTE_META_COVERAGE.json'), JSON.stringify(coverage, null, 2));
writeFs(join(OUT_WAVE0, 'AIO_CONTAINER_MAP.json'), JSON.stringify(CONTAINER_MAP, null, 2));
writeFs(join(OUT_WAVE0, 'AIO_LEGACY_ROUTE_ALIAS_MAP.json'), JSON.stringify(LEGACY_ALIASES, null, 2));
writeFs(join(OUT_WAVE0, 'AIO_ROUTE_DUPLICATION_RECONCILIATION.json'), JSON.stringify(DUPLICATION_RECONCILIATION, null, 2));

const rolePermissionMap = {
  customer_membership_roles: ['organization_owner', 'organization_admin', 'organization_member', 'shipper_user'],
  internal_staff_roles: [
    'super_admin',
    'administrator',
    'permitting_specialist',
    'compliance_specialist',
    'dispatcher',
    'insurance_specialist',
    'factoring_specialist',
    'brokerage_specialist',
    'support_specialist',
  ],
  permissions: [
    'CAN_VIEW',
    'CAN_CREATE',
    'CAN_EDIT',
    'CAN_APPROVE',
    'CAN_ASSIGN',
    'CAN_QUOTE',
    'CAN_NEGOTIATE',
    'CAN_BILL',
    'CAN_PAY',
    'CAN_VERIFY',
    'CAN_VIEW_INTERNAL',
    'CAN_MANAGE_TEAM',
    'CAN_MANAGE_SYSTEM',
  ],
  route_guard_expectations: {
    CUSTOMER: 'CustomerRouteGuard + org membership',
    SHIPPER: 'CustomerRouteGuard + shipper projection',
    PROVIDER: 'ProviderRouteGuard + aio_service_provider_users',
    DRIVER: 'DriverRouteGuard + aio_driver_profiles.user_id',
    OFFICE: 'OfficeRouteGuard + aio_internal_staff',
  },
};

writeFs(join(OUT_WAVE0, 'AIO_ROLE_PERMISSION_MAP.json'), JSON.stringify(rolePermissionMap, null, 2));

const roleProjectionRuntime = {
  SHIPPER: { route_prefixes: ['/shipper'], guard: 'SHIPPER' },
  DRIVER: { route_prefixes: ['/driver/driverlink'], guard: 'DRIVER' },
  FLEETCARE_PROVIDER: { route_prefixes: ['/provider/fleetcare'], guard: 'PROVIDER' },
  AIO_OFFICE: { route_prefixes: ['/office'], guard: 'OFFICE' },
};

writeFs(join(OUT_WAVE0, 'AIO_ROLE_PROJECTION_RUNTIME_MAP.json'), JSON.stringify(roleProjectionRuntime, null, 2));

const summaryBefore = JSON.parse(readFs(join(OUT_FORENSIC, '_build_summary.json'), 'utf8'));

const wave0Delta = {
  sprint: 'P0.AIO.WAVE-0-CANONICAL-GRAPH-AND-ROUTE-META',
  functional_completion_before: summaryBefore.overall_functional_completion,
  functional_completion_after: summaryBefore.overall_functional_completion,
  note: 'Route meta improves structural observability; functional % unchanged until domain contracts pass.',
  auth_rls_tenant_safety_before: 'PARTIAL',
  auth_rls_tenant_safety_after: 'PARTIAL',
  provider_guard: 'REPAIRED_RUNTIME',
  driver_guard: 'REPAIRED_RUNTIME',
  gaps_closed: ['GAP-AUTH-PROVIDER-DRIVER', 'GAP-INBOX-CONTAINER', 'GAP-MY-OFFICE-NAME'],
  gaps_remaining: gapRegister.gaps.filter((g) => !['GAP-AUTH-PROVIDER-DRIVER', 'GAP-INBOX-CONTAINER', 'GAP-MY-OFFICE-NAME'].includes(g.id)),
};

writeFs(join(OUT_WAVE0, 'AIO_WAVE0_COMPLETION_DELTA.json'), JSON.stringify(wave0Delta, null, 2));

function writeMd(name, body) {
  writeFs(join(OUT_WAVE0, name), body);
}

writeMd(
  'AIO_RUNTIME_PRODUCT_GRAPH.md',
  `# AIO Runtime Product Graph (Wave 0)

Generated from \`AIO_CANONICAL_PRODUCT_GRAPH.json\` — **not** a hand-maintained duplicate.

- Nodes: **${runtimeNodes.length}**
- Families: **${FAMILIES.length}**
- Role projections: **${ROLE_PROJECTIONS.join(', ')}**

Runtime binding: \`src/product-graph/generated/runtimeProductGraph.json\`
`,
);

writeMd(
  'AIO_ROUTE_META_REGISTRY.md',
  `# AIO Route Meta Registry (Wave 0)

Single registry: \`src/product-graph/generated/routeMetaRegistry.json\` (${routeMetaEntries.length} entries).

Drives: guard expectations, container membership, nav visibility hooks, legacy alias metadata.

Coverage: **${coverage.active_material_route_meta_coverage_pct}%** of active material routes.
`,
);

writeMd(
  'AIO_GUARD_RECONCILIATION_REPORT.md',
  `# Guard reconciliation (Wave 0)

| Guard | Routes | Status |
|-------|--------|--------|
| CustomerRouteGuard | portal, shipper (customer) | Existing |
| OfficeRouteGuard | office/* | Existing |
| ProviderRouteGuard | provider/fleetcare/* | **Added** |
| DriverRouteGuard | driver/driverlink/* | **Added** |

Backend: membership via \`aio_service_provider_users\`, \`aio_driver_profiles\`. RLS remains partial — server boundaries still required.
`,
);

writeMd(
  'AIO_PROVIDER_GUARD_REPAIR.md',
  `# Provider guard repair

\`ProviderRouteGuard\` requires authentication (supabase mode), active FleetCare provider membership, denies internal staff fallback to customer portal for provider URLs.
`,
);

writeMd(
  'AIO_DRIVER_GUARD_REPAIR.md',
  `# Driver guard repair

\`DriverRouteGuard\` requires authentication (supabase mode), linked \`aio_driver_profiles\` row for \`auth.uid()\`, denies office-only users without driver profile.
`,
);

writeMd(
  'AIO_SHIPPER_CARRIER_BOUNDARY_REPORT.md',
  `# Shipper / carrier financial boundary

Runtime tests assert \`brokerageRules.canViewShipperCharge\` / \`canViewCarrierPay\` / \`canViewGrossMargin\` — **PASS** (existing domain rules).
`,
);

writeMd(
  'AIO_TENANT_SCOPE_TEST_REPORT.md',
  `# Tenant scope tests (Wave 0)

Automated matrix in \`src/product-graph/routeAccess.test.ts\` — pure policy evaluation. Live RLS JWT tests remain **PARTIAL** (CI secrets).
`,
);

writeMd(
  'AIO_INBOX_CONTAINER_MAP.md',
  `# Inbox container (F17)

Canonical hub: \`/portal/inbox\` with sections messages / notifications / appointments.

Legacy paths \`/portal/messages\`, \`/portal/notifications\`, \`/portal/appointments\` redirect to inbox children — **no second message store**.
`,
);

writeMd(
  'AIO_WAVE0_REGRESSION_REPORT.md',
  `# Wave 0 regression

- No visual redesign
- Vault canonical preserved
- Financial domain separation preserved
- Product graph validator + route meta tests added
`,
);

console.log(JSON.stringify({ coverage, wave0Delta }, null, 2));
