export type RoleProjection = 'SHIPPER' | 'DRIVER' | 'FLEETCARE_PROVIDER' | 'AIO_OFFICE' | null;

export type RouteGuardKind = 'NONE' | 'CUSTOMER' | 'SHIPPER' | 'PROVIDER' | 'DRIVER' | 'OFFICE';

export type CustomerContainerKey =
  | 'MY_OFFICE'
  | 'MY_OFFICE'
  | 'OPERATIONS'
  | 'FINANCES'
  | 'VAULT'
  | 'INBOX'
  | 'SERVICES'
  | 'ACCOUNT'
  | 'AIO_OFFICE';

export interface RouteMetaEntry {
  path: string;
  node_id: string;
  family_id: string;
  family_code: string | null;
  node_type: string;
  audience: string;
  role_projection: RoleProjection;
  requires_auth: boolean;
  roles: string[];
  permissions: string[];
  layout: string;
  container: CustomerContainerKey | null;
  nav_visibility: boolean;
  legacy_alias: string | null;
  guard: RouteGuardKind;
  functional_status: string;
  visual_status: string;
  approval_status: string;
  launch_status: string;
  is_deprecated: boolean;
  is_internal: boolean;
  is_public: boolean;
}

export interface RuntimeProductNode {
  path: string;
  node_id: string;
  family_id: string;
  family_code: string | null;
  node_type: string;
  route: string;
  audience: string;
  role_projection: RoleProjection;
  visibility: string;
  requires_auth: boolean;
  required_roles: string[];
  required_permissions: string[];
  container: CustomerContainerKey | null;
  navigation_group: string | null;
  navigation_order: number | null;
  guard: RouteGuardKind;
  functional_status: string;
  visual_status: string;
  approval_status: string;
  launch_status: string;
  legacy_aliases: string[];
  source_component: string;
  source_route_file: string | null;
  is_deprecated: boolean;
  is_internal: boolean;
  is_public: boolean;
  parent_id: string | null;
  title: string;
  product_name: string;
  technical_name: string;
  dependencies: string[];
  child_nodes: string[];
}

export interface RuntimeProductGraphFile {
  meta: Record<string, unknown>;
  families: Array<{ id: string; code: string; name: string; nav: string | null }>;
  role_projections: RoleProjection[];
  containers: Record<string, unknown>;
  nodes: RuntimeProductNode[];
}

export interface RouteMetaRegistryFile {
  meta: Record<string, unknown>;
  entries: RouteMetaEntry[];
}
