/**
 * AIO office information architecture — vendored overlay of the SITE00 Experience Brain
 * (P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1).
 *
 * AIO OFFICE (founder / staff): HOME · INTAKE · WORK · REPORTS · MORE — FILING lives in WORK → FILING & FUEL TAXES.
 * CLIENT OFFICE: MY BUSINESS · OPERATIONS · FINANCES · VAULT · INBOX · SERVICES · ACCOUNT — never INTAKE.
 *
 * Source: SITE00 shared/studioos-experience-brain/projects/aio/office-ia.ts → docs/aio/office-ia/AIO_OFFICE_IA.json
 * (provenance + sha256 in docs/aio/office-ia/PROVENANCE.json). Data only: no page or nav reads it yet, and the
 * generated runtime product graph is not edited — officeInformationArchitecture.test.ts holds the two together.
 */
import overlay from './officeInformationArchitecture.json';

export type OfficeIaShellId = 'AIO_OFFICE' | 'CLIENT_OFFICE';
export type OfficeIaActor = 'FOUNDER' | 'STAFF' | 'CLIENT';

export interface OfficeIaRoute {
  path: string;
  status: 'EXISTING' | 'PROPOSED' | 'HELPER_UNROUTED' | 'NONE';
  evidence: string;
}

export interface OfficeIaNode {
  node_id: string;
  shell_id: OfficeIaShellId;
  parent: string | null;
  order: number;
  label: string;
  kind: string;
  role: string;
  semantics: string;
  visibility: Record<OfficeIaActor, 'FULL' | 'CLIENT_SAFE_PROJECTION' | 'VIA_AIO_OFFICE' | 'HIDDEN'>;
  staff_gate: string | null;
  client_projection: string | null;
  architecture: string;
  implementation: string;
  depth: string;
  evidence: string[];
  routes: OfficeIaRoute[];
  service_ids: string[];
  workspace_ids: string[];
  feature_refs: string[];
  authority_refs: string[];
  client_resolution: string | null;
  projects: string[];
  aggregates: string[];
  data_status: string | null;
  notes: string;
}

export interface OfficeIaService {
  service_id: string;
  name: string;
  staff_nodes: string[];
  client_nodes: string[];
  client_visibility: string;
  architecture: string;
  implementation: string;
  canonical_data_source: string;
}

export interface OfficeInformationArchitectureFile {
  id: string;
  sprint: string;
  lineage_id: string;
  audit: { repo: string; sha: string; mode: string };
  shells: { shell_id: OfficeIaShellId; name: string; environment_id: string; actors: OfficeIaActor[]; root_nav: string[]; route_root: string }[];
  nodes: OfficeIaNode[];
  services: OfficeIaService[];
  supersessions: { lineage_id: string; old_item: string; disposition: string; new_node_ids: string[] }[];
  legacy: { ref: string; classification: string; target_node_ids: string[] }[];
  firewall: { item: string; node_ids: string[] }[];
  migration_authority_set: { total: number; approved: number; founder_review_required: string[]; superseded: { authority_id: string; superseded_by: string }[] };
  product_graph_map: {
    containers: { container: string; ia_node: string }[];
    families: { family: string; graph_nav: string | null; client_node: string | null; staff_node: string | null }[];
    role_projections: { projection: string; ia_node: string | null }[];
    route_gaps: { prefix: string; reason: string; exact?: boolean }[];
  };
}

const IA = overlay as unknown as OfficeInformationArchitectureFile;

export function getOfficeInformationArchitecture(): OfficeInformationArchitectureFile {
  return IA;
}

export function officeIaNode(nodeId: string): OfficeIaNode | undefined {
  return IA.nodes.find((n) => n.node_id === nodeId);
}

export function officeIaChildren(nodeId: string): OfficeIaNode[] {
  return IA.nodes.filter((n) => n.parent === nodeId).sort((a, b) => a.order - b.order);
}

/** Root navigation labels of a shell, in order (read from the architecture, never a hard-coded array). */
export function officeRootNav(shellId: OfficeIaShellId): string[] {
  const shell = IA.shells.find((s) => s.shell_id === shellId);
  return (shell?.root_nav ?? []).map((id) => officeIaNode(id)?.label ?? id);
}

/** The architecture nodes that cite a route as EXISTING. */
export function officeIaNodesForRoute(routePath: string): OfficeIaNode[] {
  return IA.nodes.filter((n) => n.routes.some((r) => r.status === 'EXISTING' && r.path === routePath));
}
