import { describe, expect, it } from 'vitest';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../canonical-studio-world/canonical-department-registry';
import { buildCanonicalDepartmentConstructionPlan } from '../canonical-studio-world/canonical-department-construction-plan';
import { resolveBrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import { compileFounderRenderPrompt } from '../architectural-dna/compiler/founder-render-prompt-compiler';
import { resolveCompanyDna } from '../architectural-dna/registry/company-dna-registry';
import {
  STUDIO_WORLD_STYLE_BIBLE,
  resolveStyleBible,
  buildStyleBiblePromptSection,
} from './style-bible/registry';
import { UNIVERSAL_COMMAND_DOCK, buildCommandDockPromptSection } from './command-dock/command-dock-system';
import { UNIVERSAL_WORKBENCH, buildWorkbenchPromptSection } from './workbench/workbench-system';
import { exportDesignTokens, STUDIO_WORLD_DESIGN_TOKENS } from './design-tokens/export';
import { validateWorldCohesion, validateStyleBibleIntegrity } from './validators/world-cohesion-validator';
import { injectStyleBibleForCanonicalDepartment, assertExperienceLabGuardsStyleBible } from './integrations/experience-lab-style-guardian';
import {
  guardCdsStyleMutation,
  assertCdsCannotMutateStyleBible,
  CDS_IMMUTABLE_STYLE_SURFACES,
} from './integrations/cds-style-mutation-guard';

function brandPackage() {
  const pkg = resolveBrandMaterialPackage({
    organizationId: 'frontal-slayer',
    organizationName: 'studio-os',
    materialRequests: [
      { slot: 'floor', requestedMaterial: 'white polished marble', brandRole: 'primary-marble-texture', required: true },
    ],
  });
  if ('code' in pkg) throw new Error(pkg.message);
  return pkg;
}

describe('Studio World Style Bible™ — Registry', () => {
  it('Style Bible is highest visual authority', () => {
    const bible = resolveStyleBible();
    expect(bible.authority.authority).toBe('highest-visual-authority');
    expect(bible.authority.bibleVersion).toBe('studio-world-style-bible.v1');
    expect(bible.authority.hierarchy[0]).toBe('Studio World Style Bible');
    expect(bible.authority.hierarchy[1]).toBe('Department Bible');
    expect(bible.authority.hierarchy[2]).toBe('Department DNA');
  });

  it('world language defines universal inherited rules', () => {
    const wl = STUDIO_WORLD_STYLE_BIBLE.worldLanguage;
    expect(wl.extensionRule).toBe('departments may extend; never contradict');
    expect(wl.dockPlacement).toContain('Command Dock');
    expect(wl.workbenchPlacement).toContain('Workbench');
    expect(wl.typography).toContain('React-injected');
  });

  it('typography placeholders enforce AI never renders text', () => {
    const tp = STUDIO_WORLD_STYLE_BIBLE.typographyPlaceholders;
    expect(tp.aiNeverRendersText).toBe(true);
    expect(tp.placeholderSurfaces.length).toBeGreaterThan(5);
    expect(tp.reactInjects).toContain('fonts');
    expect(tp.reactInjects).toContain('icons');
    expect(tp.reactInjects).toContain('labels');
  });

  it('panel system has identical geometry spec', () => {
    const panel = STUDIO_WORLD_STYLE_BIBLE.panelSystem;
    expect(panel.cornerRadius).toBe('12px');
    expect(panel.contentRule).toContain('geometry identical');
    expect(STUDIO_WORLD_DESIGN_TOKENS.radius['radius-panel']).toBe(panel.cornerRadius);
  });

  it('lighting philosophy forbids corporate lighting', () => {
    expect(STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.forbidden).toContain('flat corporate lighting');
    expect(STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.primary).toContain('architectural');
  });

  it('material philosophy defines universal defaults', () => {
    const mp = STUDIO_WORLD_STYLE_BIBLE.materialPhilosophy;
    expect(mp.universalDefaults).toContain('glass');
    expect(mp.universalDefaults).toContain('acrylic');
    expect(mp.universalDefaults).toContain('founder-marble slots');
    expect(mp.brandInjectionRule).toContain('Company DNA');
  });

  it('motion language defines operating system feel', () => {
    expect(STUDIO_WORLD_STYLE_BIBLE.motionLanguage.operatingSystemFeel).toContain('operating system');
    expect(STUDIO_WORLD_STYLE_BIBLE.motionLanguage.panelReveals).toContain('240ms');
  });

  it('navigation language defines shared components', () => {
    const nav = STUDIO_WORLD_STYLE_BIBLE.navigationLanguage;
    expect(nav.components).toContain('Top Navigation Rail™');
    expect(nav.components).toContain('Bottom Command Dock™');
    expect(nav.components).toContain('Workbench™');
  });
});

describe('Universal Command Dock™ & Workbench™', () => {
  it('Command Dock is permanent Studio World object with same proportions', () => {
    expect(UNIVERSAL_COMMAND_DOCK.objectId).toBe('StudioWorldCommandDock');
    expect(UNIVERSAL_COMMAND_DOCK.rules).toContain('no baked AI text');
    expect(UNIVERSAL_COMMAND_DOCK.proportions.desktop.width).toBe('72%');
    expect(UNIVERSAL_COMMAND_DOCK.proportions.mobile.width).toBe('92%');
    expect(buildCommandDockPromptSection()).toContain('UNIVERSAL COMMAND DOCK');
  });

  it('Workbench is permanent modular furniture', () => {
    expect(UNIVERSAL_WORKBENCH.objectId).toBe('StudioWorldWorkbench');
    expect(UNIVERSAL_WORKBENCH.rules).toContain('no generated words');
    expect(UNIVERSAL_WORKBENCH.toolProfiles['architectural-tools']).toContain('Experience Lab');
    expect(UNIVERSAL_WORKBENCH.toolProfiles['asset-tools']).toContain('Creative Director Studio');
    expect(buildWorkbenchPromptSection('commercial-tools')).toContain('Marketplace');
  });
});

describe('Design Token Export', () => {
  it('exports reusable tokens for React and Prompt Compiler', () => {
    const tokens = exportDesignTokens();
    expect(tokens.tokenVersion).toBe('studio-world-design-tokens.v1');
    expect(tokens.spacing['space-4']).toBe('16px');
    expect(tokens.radius['radius-panel']).toBe('12px');
    expect(tokens.blur['blur-panel']).toBe('24px');
    expect(tokens.animation['duration-fast']).toBe('240ms');
    expect(tokens.materials['material-glass']).toBe('architectural glass');
  });
});

describe('World Cohesion Validator™', () => {
  it('validates Style Bible integrity', () => {
    const result = validateStyleBibleIntegrity();
    expect(result.ok).toBe(true);
  });

  it('every canonical department inherits Command Dock and Workbench', () => {
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const built = buildCanonicalDepartmentConstructionPlan(record.departmentId, 'landscape');
      expect(built.ok).toBe(true);
      if (!built.ok) continue;
      const result = validateWorldCohesion({ plan: built.plan });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.bibleVersion).toBe('studio-world-style-bible.v1');
      }
    }
  });

  it('rejects WORLD_STYLE_VIOLATION when command dock missing', () => {
    const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    if (!built.ok) return;
    const plan = { ...built.plan, heroAssets: built.plan.heroAssets.filter((a) => a.assetClass !== 'command-dock-shell') };
    const result = validateWorldCohesion({ plan });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('WORLD_STYLE_VIOLATION');
      expect(result.violations.some((v) => v.field === 'commandDock')).toBe(true);
    }
  });

  it('rejects AI-rendered typography in prompt', () => {
    const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    if (!built.ok) return;
    const result = validateWorldCohesion({
      plan: built.plan,
      effectivePrompt: 'render readable text and menu labels on command dock',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.violations.some((v) => v.field === 'typography')).toBe(true);
    }
  });
});

describe('Experience Lab Style Guardian', () => {
  it('injects Style Bible before department architecture', () => {
    const injection = injectStyleBibleForCanonicalDepartment('experience-lab');
    expect(injection.cohesionOk).toBe(true);
    expect(injection.commandDockInjected).toBe(true);
    expect(injection.workbenchInjected).toBe(true);
    expect(injection.typographyPlaceholdersInjected).toBe(true);
    expect(injection.promptSections[0]).toContain('STYLE BIBLE');
    expect(assertExperienceLabGuardsStyleBible()).toBe(true);
  });

  it('every canonical department receives style injection', () => {
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.slice(0, 5)) {
      const injection = injectStyleBibleForCanonicalDepartment(record.departmentId);
      expect(injection.styleBibleVersion).toBe('studio-world-style-bible.v1');
      expect(injection.promptSections.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('Creative Director Studio Mutation Guard', () => {
  it('blocks mutation of immutable Style Bible surfaces', () => {
    expect(CDS_IMMUTABLE_STYLE_SURFACES).toContain('Studio World Style Bible');
    expect(CDS_IMMUTABLE_STYLE_SURFACES).toContain('Command Dock geometry');
    expect(guardCdsStyleMutation({ surface: 'Panel system', mutation: 'change corner radius' }).ok).toBe(false);
    expect(guardCdsStyleMutation({ surface: 'assets', mutation: 'customize prop' }).ok).toBe(true);
    expect(assertCdsCannotMutateStyleBible()).toBe(true);
  });
});

describe('Prompt Compiler Style Bible Integration', () => {
  it('compiled prompt includes Style Bible before Department DNA', () => {
    const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
    if (!built.ok) return;
    const compiled = compileFounderRenderPrompt({
      departmentId: 'experience-lab',
      plan: built.plan,
      brandPackage: brandPackage(),
      companyDna: resolveCompanyDna('studio-os'),
      renderKind: 'landscape',
    });
    expect(compiled.prompt).toContain('STUDIO WORLD STYLE BIBLE');
    expect(compiled.prompt).toContain('UNIVERSAL COMMAND DOCK');
    expect(compiled.prompt).toContain('UNIVERSAL WORKBENCH');
    expect(compiled.prompt).toContain('DESIGN TOKENS');
    expect(compiled.prompt.indexOf('STYLE BIBLE')).toBeLessThan(compiled.prompt.indexOf('DEPARTMENT DNA'));
    expect(compiled.diagnostics.styleBibleVersion).toBe('studio-world-style-bible.v1');
  });

  it('buildStyleBiblePromptSection is non-empty governed output', () => {
    const section = buildStyleBiblePromptSection();
    expect(section).toContain('TYPOGRAPHY: AI NEVER renders text');
    expect(section).toContain('PANEL SYSTEM');
    expect(section).toContain('LIGHTING PHILOSOPHY');
  });
});
