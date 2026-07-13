import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { CanonicalMainDepartmentId } from '../../../../studio-os-core/canonical-studio-world';
import {
  resolveDepartmentBible,
  DEPARTMENT_RELATIONSHIP_GRAPH,
  formatRelationshipChain,
  CANONICAL_PIPELINE,
  MARKETPLACE_PIPELINE,
  buildWorldKnowledgeGraph,
  resolveAiWorkersForDepartment,
  resolveDepartmentPermissionModel,
  resolveDepartmentLifecycleModel,
  compileDepartment,
  getEncyclopediaEntry,
  regenerateDepartmentDocumentation,
} from '../../../../studio-os-core/department-bible';
import { resolveArchitecturalDna } from '../../../../studio-os-core/architectural-dna/registry/dna-registry';
import { resolveGoldenReferencePack } from '../../../../studio-os-core/architectural-dna/references/golden-reference-library';
import { resolveStyleBible } from '../../../../studio-os-core/studio-world-style/style-bible/registry';
import { FOUNDER_RENDER_PROMPT_COMPILER_VERSION } from '../../../../studio-os-core/architectural-dna/schemas/compiler-contract';

const sectionStyle: CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  color: '#111',
};

const labelStyle: CSSProperties = {
  margin: '0 0 4px',
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#eb1c24',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '10px 12px',
  marginBottom: 8,
};

type Props = {
  departmentId: CanonicalMainDepartmentId | null;
};

/** Experience Lab — Department Bible Knowledge Panel™ (canonical department control center). */
export function DepartmentBibleKnowledgePanel({ departmentId }: Props) {
  const [search, setSearch] = useState('');

  const bible = useMemo(
    () => (departmentId ? resolveDepartmentBible(departmentId) : null),
    [departmentId]
  );
  const dna = useMemo(
    () => (departmentId ? resolveArchitecturalDna(departmentId) : null),
    [departmentId]
  );
  const goldenPack = useMemo(
    () => (departmentId ? resolveGoldenReferencePack(departmentId) : null),
    [departmentId]
  );
  const styleBible = useMemo(() => resolveStyleBible(), []);
  const workers = useMemo(
    () => (departmentId ? resolveAiWorkersForDepartment(departmentId) : []),
    [departmentId]
  );
  const permissions = useMemo(
    () => (departmentId ? resolveDepartmentPermissionModel(departmentId) : null),
    [departmentId]
  );
  const lifecycle = useMemo(
    () => (departmentId ? resolveDepartmentLifecycleModel(departmentId) : null),
    [departmentId]
  );
  const compiled = useMemo(
    () => (departmentId ? compileDepartment(departmentId, 'landscape') : null),
    [departmentId]
  );
  const knowledgeNode = useMemo(() => {
    if (!departmentId) return null;
    return buildWorldKnowledgeGraph().nodes.find((n) => n.departmentId === departmentId) ?? null;
  }, [departmentId]);
  const docs = useMemo(() => regenerateDepartmentDocumentation(), []);

  if (!departmentId || !bible) {
    return (
      <section style={sectionStyle} data-department-bible-panel>
        <p style={labelStyle}>DEPARTMENT BIBLE KNOWLEDGE PANEL™</p>
        <p style={{ margin: 0, color: '#666' }}>Select a canonical department to inspect its operating manual.</p>
      </section>
    );
  }

  const encyclopedia = getEncyclopediaEntry(departmentId);
  const upstream = knowledgeNode?.dependsOn ?? [];
  const downstream = knowledgeNode?.dependedOnBy ?? [];

  return (
    <section style={sectionStyle} data-department-bible-panel data-department={departmentId}>
      <p style={labelStyle}>DEPARTMENT BIBLE KNOWLEDGE PANEL™</p>
      <p style={{ margin: '0 0 12px', color: '#555' }}>
        Canonical operating manual — {bible.officialName} ({bible.bibleVersion} r{bible.bibleRevision})
      </p>

      <input
        type="search"
        placeholder="Search encyclopedia…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 320, marginBottom: 12, padding: '6px 8px', fontSize: '11px', borderRadius: 6, border: '1px solid #ccc' }}
      />

      <div style={cardStyle}>
        <strong>Mission</strong>
        <p style={{ margin: '4px 0 0' }}>{bible.mission}</p>
        <p style={{ margin: '8px 0 0', color: '#555' }}>{bible.purpose}</p>
      </div>

      <div style={cardStyle}>
        <strong>Relationship Graph</strong>
        <p style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: '10px' }}>
          Canonical: {formatRelationshipChain(CANONICAL_PIPELINE)}
        </p>
        <p style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: '10px' }}>
          Marketplace: {formatRelationshipChain(MARKETPLACE_PIPELINE)}
        </p>
        <p style={{ margin: '8px 0 0' }}>
          Upstream: {upstream.length ? upstream.join(', ') : '—'} · Downstream: {downstream.length ? downstream.join(', ') : '—'}
        </p>
        <p style={{ margin: '4px 0 0', color: '#666' }}>
          Graph v{DEPARTMENT_RELATIONSHIP_GRAPH.graphVersion} · {DEPARTMENT_RELATIONSHIP_GRAPH.edges.length} edges
        </p>
      </div>

      <div style={cardStyle}>
        <strong>Architecture Stack</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          <li>Style Bible: {styleBible.authority.bibleVersion} r{styleBible.authority.bibleRevision}</li>
          <li>Department Bible: {bible.bibleVersion} r{bible.bibleRevision}</li>
          <li>Architectural DNA: {dna?.dnaVersion} r{dna?.profileRevision}</li>
          <li>Golden References: {goldenPack?.packId}</li>
          <li>Prompt Compiler: {FOUNDER_RENDER_PROMPT_COMPILER_VERSION}</li>
          {compiled?.ok ? (
            <>
              <li>Blueprint: r{compiled.compiled.blueprintRevision}</li>
              <li>Construction Plan: {compiled.compiled.constructionPlanId}</li>
              <li>Prompt Version: {compiled.compiled.promptVersion}</li>
            </>
          ) : (
            <li style={{ color: '#b91c1c' }}>Compilation pending</li>
          )}
        </ul>
      </div>

      <div style={cardStyle}>
        <strong>AI Workforce ({workers.length})</strong>
        <p style={{ margin: '4px 0 0' }}>{workers.map((w) => w.displayName).join(' · ')}</p>
      </div>

      <div style={cardStyle}>
        <strong>Dependencies & Lifecycle</strong>
        <p style={{ margin: '4px 0 0' }}>Dependencies: {bible.dependencies.join(', ')}</p>
        <p style={{ margin: '4px 0 0' }}>Lifecycle: {lifecycle?.states.join(' → ')}</p>
        <p style={{ margin: '4px 0 0' }}>Permissions: {permissions?.grants.map((g) => g.role).join(', ')}</p>
      </div>

      <div style={cardStyle}>
        <strong>Encyclopedia</strong>
        <p style={{ margin: '4px 0 0' }}>{encyclopedia.futurePlans}</p>
        <p style={{ margin: '4px 0 0', color: '#666' }}>
          Docs regenerated {docs.regeneratedAt.slice(0, 19)} · {docs.validationSummary.passed}/{docs.validationSummary.total} valid
        </p>
      </div>
    </section>
  );
}
