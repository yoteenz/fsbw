import { describe, expect, it } from 'vitest';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../canonical-studio-world/canonical-department-registry';
import {
  DEPARTMENT_BIBLE_REGISTRY,
  DEPARTMENT_BIBLE_REGISTRY_VERSION,
  resolveDepartmentBible,
  listDepartmentBibles,
  DEPARTMENT_RELATIONSHIP_GRAPH,
  CANONICAL_PIPELINE,
  MARKETPLACE_PIPELINE,
  formatRelationshipChain,
  buildWorldKnowledgeGraph,
  queryKnowledgeNode,
  queryUpstream,
  queryDownstream,
  AI_WORKFORCE_DIRECTORY,
  resolveAiWorkersForDepartment,
  resolveDepartmentPermissionModel,
  canRolePerform,
  resolveDepartmentLifecycleModel,
  validateLifecycleTransition,
  compileDepartment,
  compileAllDepartments,
  validateDepartmentBible,
  validateAllDepartmentBibles,
  assertOneBiblePerDepartment,
  countBibleRegistryCompleteness,
  buildStudioWorldEncyclopedia,
  searchEncyclopedia,
  getEncyclopediaEntry,
  regenerateDepartmentDocumentation,
  DEPARTMENT_COMPILER_VERSION,
} from './index';

describe('Department Bible Registry™', () => {
  it('every canonical department owns exactly one Department Bible', () => {
    expect(assertOneBiblePerDepartment()).toBe(true);
    expect(listDepartmentBibles().length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const bible = DEPARTMENT_BIBLE_REGISTRY[record.departmentId];
      expect(bible).toBeDefined();
      expect(bible.departmentId).toBe(record.departmentId);
      expect(bible.officialName).toBe(record.name);
      expect(bible.mission.length).toBeGreaterThan(5);
      expect(bible.purpose.length).toBeGreaterThan(5);
      expect(bible.responsibilities.length).toBeGreaterThan(0);
      expect(bible.requiredAiWorkers.length).toBeGreaterThan(0);
      expect(bible.lifecycleStates.length).toBeGreaterThan(5);
    }
  });

  it('registry version is stable', () => {
    expect(DEPARTMENT_BIBLE_REGISTRY_VERSION).toBe('department-bible-registry.v1');
  });
});

describe('Experience Lab, CDS, Command Center, City Council, Marketplace Bibles', () => {
  it('Experience Lab Bible governs canonical department authoring', () => {
    const bible = resolveDepartmentBible('experience-lab');
    expect(bible.mission).toContain('Design Studio World');
    expect(bible.responsibilities).toContain('canonical departments');
    expect(bible.nonResponsibilities).toContain('bypass approvals');
    expect(bible.requiredAiWorkers).toContain('Blueprint Architect');
    expect(bible.handsWorkTo).toContain('creative-director-studio');
  });

  it('Creative Director Studio Bible manufactures approved architecture', () => {
    const bible = resolveDepartmentBible('creative-director-studio');
    expect(bible.mission).toContain('Manufacture');
    expect(bible.responsibilities).toContain('asset production');
    expect(bible.nonResponsibilities).toContain('invent canonical departments');
    expect(bible.requiredAiWorkers).toContain('Asset Artist');
    expect(bible.handsWorkTo).toContain('construction-mode');
  });

  it('Command Center Bible operates infrastructure only', () => {
    const bible = resolveDepartmentBible('command-center');
    expect(bible.mission).toContain('Operate Studio World');
    expect(bible.responsibilities).toContain('Monitoring');
    expect(bible.nonResponsibilities).toContain('Generate architecture');
    expect(bible.requiredAiWorkers).toContain('Operations AI');
  });

  it('City Council Bible protects Studio World governance', () => {
    const bible = resolveDepartmentBible('city-council');
    expect(bible.mission).toContain('Protect Studio World');
    expect(bible.responsibilities).toContain('Permits');
    expect(bible.nonResponsibilities).toContain('Generate rooms');
    expect(bible.marketplaceParticipation).toBe(true);
  });

  it('Marketplace Bible distributes creator content without rewriting lineage', () => {
    const bible = resolveDepartmentBible('marketplace');
    expect(bible.mission).toContain('Distribute creator content');
    expect(bible.responsibilities).toContain('Licensing');
    expect(bible.nonResponsibilities).toContain('Modify creator ownership');
    expect(bible.handsWorkTo).toContain('city-council');
  });
});

describe('Department Relationship Graph™', () => {
  it('canonical pipeline is queryable', () => {
    expect(CANONICAL_PIPELINE[0]).toBe('experience-lab');
    expect(CANONICAL_PIPELINE[CANONICAL_PIPELINE.length - 1]).toBe('studio-world-registry');
    expect(formatRelationshipChain(CANONICAL_PIPELINE)).toContain('experience-lab');
  });

  it('marketplace pipeline connects to city council', () => {
    expect(MARKETPLACE_PIPELINE[0]).toBe('marketplace');
    expect(MARKETPLACE_PIPELINE).toContain('city-council');
  });

  it('relationship graph has edges for every department', () => {
    expect(DEPARTMENT_RELATIONSHIP_GRAPH.nodes.length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    expect(DEPARTMENT_RELATIONSHIP_GRAPH.edges.length).toBeGreaterThan(CANONICAL_PIPELINE.length);
  });

  it('upstream and downstream queries resolve', () => {
    const upstream = queryUpstream('creative-director-studio');
    const downstream = queryDownstream('experience-lab');
    expect(upstream.length).toBeGreaterThan(0);
    expect(downstream.length).toBeGreaterThan(0);
  });
});

describe('World Knowledge Graph™', () => {
  it('builds persistent knowledge graph for all departments', () => {
    const graph = buildWorldKnowledgeGraph();
    expect(graph.nodes.length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    for (const node of graph.nodes) {
      expect(node.mission.length).toBeGreaterThan(0);
      expect(node.aiWorkers.length).toBeGreaterThan(0);
      expect(node.lifecycleStates.length).toBeGreaterThan(5);
      expect(node.permissions.length).toBeGreaterThan(0);
    }
  });

  it('queryKnowledgeNode returns department context', () => {
    const node = queryKnowledgeNode('experience-lab');
    expect(node).toBeDefined();
    expect(node!.officialName).toContain('Experience Lab');
    expect(node!.ownedWorkflows.length).toBeGreaterThan(0);
  });
});

describe('AI Workforce Directory™', () => {
  it('every department declares required AI workers', () => {
    expect(AI_WORKFORCE_DIRECTORY.workers.length).toBeGreaterThan(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const workers = resolveAiWorkersForDepartment(record.departmentId);
      expect(workers.length).toBeGreaterThan(0);
    }
  });

  it('Experience Lab and CDS have specialized workers', () => {
    const elWorkers = resolveAiWorkersForDepartment('experience-lab').map((w) => w.displayName);
    const cdsWorkers = resolveAiWorkersForDepartment('creative-director-studio').map((w) => w.displayName);
    expect(elWorkers).toContain('Blueprint Architect');
    expect(cdsWorkers).toContain('Asset Artist');
  });
});

describe('Permission Model™', () => {
  it('role-driven capabilities resolve per department', () => {
    const model = resolveDepartmentPermissionModel('experience-lab');
    expect(model.defaultDeny).toBe(true);
    expect(model.grants.some((g) => g.role === 'admin')).toBe(true);
    expect(canRolePerform('experience-lab', 'admin', 'generate')).toBe(true);
    expect(canRolePerform('experience-lab', 'guest', 'generate')).toBe(false);
  });

  it('city council grants municipal inspector capabilities', () => {
    const model = resolveDepartmentPermissionModel('city-council');
    expect(model.grants.some((g) => g.role === 'municipal-inspector')).toBe(true);
  });
});

describe('Lifecycle Model™', () => {
  it('every department owns canonical lifecycle states', () => {
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const model = resolveDepartmentLifecycleModel(record.departmentId);
      expect(model.states).toContain('DRAFT');
      expect(model.states).toContain('PUBLISHED');
      expect(model.terminalStates).toContain('ARCHIVED');
    }
  });

  it('lifecycle transitions validate', () => {
    expect(validateLifecycleTransition('experience-lab', 'DRAFT', 'BLUEPRINT_READY')).toBe(true);
    expect(validateLifecycleTransition('experience-lab', 'PUBLISHED', 'DRAFT')).toBe(false);
  });
});

describe('Department Compiler™', () => {
  it('every department compiles through governed hierarchy', () => {
    const results = compileAllDepartments('landscape');
    expect(results.length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    for (const { result } of results) {
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.compiled.compilerVersion).toBe(DEPARTMENT_COMPILER_VERSION);
        expect(result.compiled.bible.bibleVersion).toBe('department-bible.v1');
        expect(result.compiled.architecturalDna.dnaVersion).toBe('architectural-dna.v1');
        expect(result.compiled.goldenReferencePack.packId).toContain('golden-ref');
        expect(result.compiled.constructionPlan.planId).toBeTruthy();
        expect(result.compiled.styleInjectionOk).toBe(true);
      }
    }
  });

  it('Experience Lab compiles with blueprint and construction plan', () => {
    const result = compileDepartment('experience-lab', 'landscape');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.compiled.constructionPlanId).toContain('experience-lab');
      expect(result.compiled.promptVersion).toBeTruthy();
    }
  });
});

describe('Validation™', () => {
  it('all canonical departments pass bible validation', () => {
    const results = validateAllDepartmentBibles();
    const failed = results.filter((r) => !r.ok);
    expect(failed).toEqual([]);
    expect(countBibleRegistryCompleteness().complete).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
  });

  it('individual department validation checks required fields', () => {
    const el = validateDepartmentBible('experience-lab');
    expect(el.ok).toBe(true);
    expect(el.violations).toEqual([]);
  });
});

describe('Studio World Encyclopedia™', () => {
  it('encyclopedia indexes every department', () => {
    const encyclopedia = buildStudioWorldEncyclopedia();
    expect(encyclopedia.entries.length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    for (const entry of encyclopedia.entries) {
      expect(entry.purpose.length).toBeGreaterThan(0);
      expect(entry.aiWorkers.length).toBeGreaterThan(0);
      expect(entry.architecture.dnaVersion).toBe('architectural-dna.v1');
    }
  });

  it('search finds departments by mission or worker', () => {
    const results = searchEncyclopedia('Blueprint Architect');
    expect(results.some((e) => e.departmentId === 'experience-lab')).toBe(true);
  });

  it('getEncyclopediaEntry returns full entry', () => {
    const entry = getEncyclopediaEntry('command-center');
    expect(entry.mission).toContain('Operate');
    expect(entry.aiWorkers).toContain('Operations AI');
  });
});

describe('Documentation Regenerator™', () => {
  it('regenerates documentation for all departments', () => {
    const docs = regenerateDepartmentDocumentation();
    expect(docs.departmentSummaries.length).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    expect(docs.validationSummary.passed).toBe(CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length);
    expect(docs.validationSummary.failed).toEqual([]);
    expect(docs.workforceCount).toBeGreaterThan(0);
  });
});
