import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPERIENCE_LAB_V2_ROUTE,
  EXPERIENCE_LAB_V2_ALIAS_ROUTE,
  STUDIO_VIEWPORT_MODES,
} from './experience-lab-v2.types';
import {
  experienceLabV2ViewModelAdapter,
  parseViewportModeFromQuery,
  viewportModeToQuery,
} from './experience-lab-v2-view-model-adapter';
import { evaluateExperienceLabV2Approval } from './experience-lab-v2-approval';
import { buildFounderRenderJobView } from '../../../studio-os-core/founder-render';
import { buildCanonicalDepartmentConstructionPlan } from '../../../studio-os-core/canonical-studio-world/canonical-department-construction-plan';
import {
  canPerformProductionWrite,
  readExperienceLabV2TestMode,
  requiresLiveConfirmation,
  writeExperienceLabV2TestMode,
} from './experience-lab-v2-test-modes';
import { resolveExperienceLabV2FeatureFlags } from './experience-lab-v2-feature-flags';
import { isStudioWorldAdminOnlyPath } from '../../../studio-os-core/canonical-studio-world/permission-model';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const V2_DIR = dirname(fileURLToPath(import.meta.url));

function readV2Source(filename: string): string {
  return readFileSync(resolve(V2_DIR, filename), 'utf8');
}

describe('Experience Lab V2 — Immersive composition', () => {
  it('shell wires purpose-built immersive components (not legacy dashboard)', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('ExperienceLabCommandDock');
    expect(shell).toContain('ExperienceLabViewportStage');
    expect(shell).toContain('ExperienceLabFounderWorkbench');
    expect(shell).toContain('ExperienceLabApprovalBridge');
    expect(shell).toContain('ExperienceLabWorkbenchDock');
    expect(shell).toContain('ExperienceLabEnvironmentLayer');
    expect(shell).not.toContain('ExperienceLabDepartmentDock');
    expect(shell).not.toMatch(/from '\.\/ExperienceLabV2Header'/);
    expect(shell).not.toMatch(/from '\.\/ExperienceLabLeftInspector'/);
    expect(shell).not.toMatch(/from '\.\/ExperienceLabRightInspector'/);
    expect(shell).not.toMatch(/from '\.\/ExperienceLabWorkbench'/);
    expect(shell).not.toMatch(/from '\.\/ExperienceLabApprovalBar'/);
    expect(shell).not.toMatch(/from '\.\/ExperienceLabToolDock'/);
  });

  it('composition markers exist on immersive regions', () => {
    expect(readV2Source('ExperienceLabCommandDock.tsx')).toContain('ELAB_V2_COMPOSITION.commandDock');
    expect(readV2Source('ExperienceLabViewportStage.tsx')).toContain('ELAB_V2_COMPOSITION.viewportStage');
    expect(readV2Source('StudioViewport.tsx')).toContain('data-studio-viewport');
    expect(readV2Source('ExperienceLabFloatingInspector.tsx')).toContain('ELAB_V2_COMPOSITION.floatingInspector');
    expect(readV2Source('ExperienceLabFounderWorkbench.tsx')).toContain('ELAB_V2_COMPOSITION.founderWorkbench');
    expect(readV2Source('ExperienceLabApprovalBridge.tsx')).toContain('ELAB_V2_COMPOSITION.approvalBridge');
    expect(readV2Source('ExperienceLabWorkbenchDock.tsx')).toContain('ELAB_V2_COMPOSITION.workbenchDock');
    expect(readV2Source('ExperienceLabDepartmentDock.tsx')).toContain('ELAB_V2_COMPOSITION.departmentDock');
    expect(readV2Source('ExperienceLabRegistrySidebar.tsx')).toContain('ELAB_V2_COMPOSITION.registrySidebar');
    expect(readV2Source('ExperienceLabGovernanceSidebar.tsx')).toContain('ELAB_V2_COMPOSITION.governanceSidebar');
    expect(Object.values(ELAB_V2_COMPOSITION).every((marker) => marker.startsWith('data-'))).toBe(true);
  });

  it('environment layer is decorative only (no interactive UI)', () => {
    const env = readV2Source('ExperienceLabEnvironmentLayer.tsx');
    expect(env).toContain('data-experience-lab-environment');
    expect(env).toContain('aria-hidden');
    expect(env).not.toContain('<button');
    expect(env).not.toContain('CommandDock');
  });

  it('CSS uses workstation layout (not legacy stacked dashboard cards)', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('.elab-workstation');
    expect(css).toContain('.elab-cmd');
    expect(css).toContain('.elab-cmd--tiered');
    expect(css).toContain('border-radius: 0 0 14px 14px');
    expect(css).toContain('33.3333%');
    expect(css).toContain('.elab-cmd__status-center');
    expect(css).toContain('.elab-float');
    expect(css).toContain('.elab-approval-bridge');
    expect(css).toContain('.elab-founder-wb');
    expect(css).toContain('.elab-founder-wb--tiered');
    expect(css).toContain('scroll-snap-type: x mandatory');
    expect(css).not.toContain('.elab-v2__panel');
  });

  it('production experience-lab page remains separate from V2', () => {
    const prodPage = readFileSync(
      resolve(V2_DIR, '../../../pages/admin/studio/experience-lab/page.tsx'),
      'utf8'
    );
    expect(prodPage).not.toContain('ExperienceLabV2Shell');
    expect(prodPage).not.toContain('experience-lab-v2');
  });
});

describe('Experience Lab V2 — Fixed application shell', () => {
  it('uses fixed-viewport application shell grid (no document min-height)', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    const css = readV2Source('experience-lab-v2.css');
    expect(shell).toContain('elab-app-shell');
    expect(shell).toContain('ELAB_V2_COMPOSITION.applicationShell');
    expect(css).toContain('.elab-app-shell__grid');
    expect(css).toContain('overflow: hidden');
    expect(css).not.toMatch(/min-height:\s*100vh/);
  });

  it('V2 page enables fixedViewport on golden build shell', () => {
    const page = readFileSync(
      resolve(V2_DIR, '../../../pages/admin/studio/experience-lab-v2/page.tsx'),
      'utf8'
    );
    expect(page).toContain('fixedViewport');
    const prodPage = readFileSync(
      resolve(V2_DIR, '../../../pages/admin/studio/experience-lab/page.tsx'),
      'utf8'
    );
    expect(prodPage).not.toContain('fixedViewport');
  });

  it('uses larger logo matching avatar circle and shared avatar size token', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('--elab-cmd-avatar-size: 28px');
    expect(css).toMatch(/\.elab-cmd__logo-img\s*\{[\s\S]*?height:\s*var\(--elab-cmd-avatar-size\)/);
  });

  it('workbench center orb is 3x prior size', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('--elab-wb-nav-orb-size: calc(78px * var(--elab-wb-height-scale))');
    expect(css).toContain('--elab-wb-nav-orb-core-size: calc(66px * var(--elab-wb-height-scale))');
  });

  it('workbench panel height is 40% shorter via height scale token', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toMatch(/\.elab-founder-wb--tiered\s*\{[\s\S]*?--elab-wb-height-scale:\s*0\.48/);
    expect(css).toMatch(/\.elab-founder-wb--tiered\s*\{[\s\S]*?--elab-wb-pill-radius:\s*9999px/);
    expect(css).toMatch(/\.elab-founder-wb__pill--head\s*\{[\s\S]*?border-radius:\s*var\(--elab-wb-pill-radius\)/);
    expect(css).toMatch(/\.elab-founder-wb__tool\s*\{[\s\S]*?border-radius:\s*var\(--elab-wb-pill-radius\)/);
    expect(css).toMatch(/\.elab-founder-wb__tool--active\s*\{[\s\S]*?box-shadow:\s*var\(--elab-selection-glow\)/);
    expect(css).toContain('--elab-selection-glow-inset');
    expect(css).toContain('--elab-wb-tool-min-height: calc(50px * var(--elab-wb-height-scale))');
    expect(css).toContain('--elab-wb-nav-min-height: calc(52px * var(--elab-wb-height-scale))');
    expect(css).toContain('--elab-wb-tools-pad-x: var(--elab-hud-inset-side, 14px)');
    expect(css).toContain('--elab-wb-tools-visible: 6');
    expect(css).toMatch(/\.elab-founder-wb__tools-scroll\s*\{[\s\S]*?gap:\s*var\(--elab-wb-tools-gap/);
    expect(css).not.toMatch(/\.elab-founder-wb__tool\s*\{[\s\S]*?margin-right/);
  });

  it('forces uppercase typography on workstation root and boot overlays', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toMatch(/\.elab-workstation\s*\{[\s\S]*?text-transform:\s*uppercase/);
    const composition = readV2Source('experience-lab-v2-composition.ts');
    expect(composition).toContain("BLUEPRINT: 'BLUEPRINT'");
    expect(composition).toContain("label: 'EXPERIENCE LAB'");
    const suspense = readFileSync(
      resolve(V2_DIR, '../../../components/admin/studio/studio-boot/StudioRouteSuspenseFallback.tsx'),
      'utf8'
    );
    expect(suspense).toContain("textTransform: 'uppercase'");
    expect(suspense).toContain('LARGE STUDIO MODULES MAY TAKE A MOMENT ON MOBILE NETWORKS.');
    const awakening = readFileSync(
      resolve(V2_DIR, '../../../components/admin/studio/studio-orb/StudioOrbAwakeningOverlay.tsx'),
      'utf8'
    );
    expect(awakening).toContain('STUDIO INTELLIGENCE · AWAKENING');
    expect(awakening).toContain("textTransform: 'uppercase'");
  });

  it('workbench uses tiered layout with world nav and orb', () => {
    const wb = readV2Source('ExperienceLabFounderWorkbench.tsx');
    expect(wb).toContain('elab-founder-wb--tiered');
    expect(wb).toContain('elab-founder-wb__pill--head');
    expect(wb).toContain('EXPERIENCE LAB WORKBENCH');
    expect(wb).toContain('elab-founder-wb__tools-scroll');
    expect(wb).toContain('elab-founder-wb__world-nav');
    expect(wb).toContain('LivingStudioWorldOrb');
    expect(readV2Source('living-studio-world-orb/LivingStudioWorldOrb.tsx')).toContain('elab-founder-wb__nav-orb');
    expect(wb).toContain('splitWorkbenchToolLabel');
    expect(readV2Source('experience-lab-v2-workbench-config.ts')).toContain('material-lab');
    expect(readV2Source('ExperienceLabWorkbenchDock.tsx')).toContain('EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS');
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('--elab-wb-label-weight: 400');
    expect(css).toMatch(/\.elab-founder-wb__title\s*\{[\s\S]*?font-weight:\s*var\(--elab-wb-label-weight/);
    expect(css).toMatch(/\.elab-founder-wb__tool-label\s*\{[\s\S]*?font-weight:\s*var\(--elab-wb-label-weight/);
    expect(css).toMatch(/\.elab-founder-wb__nav-label\s*\{[\s\S]*?font-weight:\s*var\(--elab-wb-label-weight/);
  });

  it('workstation frame unifies viewport room and lower deck', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('ExperienceLabWorkstationFrame');
    expect(readV2Source('ExperienceLabWorkstationFrame.tsx')).toContain('elab-app-shell__lower-deck');
    expect(readV2Source('experience-lab-v2.css')).toContain('elab-app-shell__workstation');
    expect(readV2Source('experience-lab-v2.css')).toContain('--el-v2-viewport-room-ratio');
  });

  it('approval bridge is compact command strip with multiple actions', () => {
    const bridge = readV2Source('ExperienceLabApprovalBridge.tsx');
    expect(bridge).toContain('REQUEST CHANGES');
    expect(bridge).toContain('SAVE DRAFT');
    expect(bridge).toContain('EXPORT');
    expect(bridge).toContain('elab-approval-bridge--strip');
    expect(bridge).toContain('elab-approval-bridge--monument');
    expect(bridge).toContain('elab-approval-bridge__primary');
    expect(bridge).toContain('APPROVE AND SEND TO CREATIVE STUDIO');
    expect(bridge).toContain('elab-approval-bridge__copy');
    expect(bridge).toContain('LOCK BLUEPRINT • LOCK RENDER • LOCK CONSTRUCTION PLAN');
    expect(bridge).not.toMatch(/<\/button>\s*<p className="elab-approval-bridge__locks"/);
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toMatch(/\.elab-approval-bridge--monument \.elab-approval-bridge__primary[\s\S]*?font-weight:\s*500/);
    expect(css).toMatch(/\.elab-approval-bridge--monument \.elab-approval-bridge__primary[\s\S]*?border:\s*1px solid rgba\(197,\s*160,\s*89/);
    expect(css).toMatch(/\.elab-approval-bridge--monument \.elab-approval-bridge__primary[\s\S]*?border-radius:\s*8px/);
    expect(css).toContain('--elab-monument-cta-v-scale: 0.85');
    expect(css).toMatch(/\.elab-approval-bridge--monument \.elab-approval-bridge__locks[\s\S]*?color:\s*var\(--elab-gold\)/);
    expect(css).toMatch(/\.elab-founder-wb__title[\s\S]*?color:\s*var\(--elab-gold\)/);
    expect(css).toMatch(/\.elab-approval-bridge--monument \.elab-approval-bridge__blocker-chip[\s\S]*?display:\s*none/);
  });

  it('does not mount workbench dock when tiered workbench already includes tools', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain("review.show('bottom-tool-dock') && !review.show('workbench')");
  });

  it('full workstation mounts founder review console, approval bridge, then workbench', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    const lowerDeckBlock = shell.match(/const lowerDeck =[\s\S]*?\) : null;/)?.[0] ?? '';
    expect(lowerDeckBlock).toContain('ExperienceLabFounderReviewConsole');
    expect(lowerDeckBlock).toContain("review.show('approval-bridge')");
    expect(lowerDeckBlock).toContain('ExperienceLabApprovalBridge');
    expect(lowerDeckBlock.indexOf('ExperienceLabFounderReviewConsole')).toBeLessThan(
      lowerDeckBlock.indexOf('ExperienceLabApprovalBridge'),
    );
    expect(lowerDeckBlock.indexOf('ExperienceLabApprovalBridge')).toBeLessThan(
      lowerDeckBlock.indexOf('ExperienceLabFounderWorkbench'),
    );
    expect(shell).not.toContain('elab-app-shell__dept-dock');
    expect(shell).not.toContain('experienceLabV2EnvironmentAssetEnabled');
    expect(lowerDeckBlock).not.toContain('ExperienceLabDiagnostics');
    const shellPage = readFileSync(
      resolve(V2_DIR, '../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell.tsx'),
      'utf8',
    );
    expect(shellPage).toContain('!fixedViewport');
  });

  it('founder review console uses symmetric three-panel row above approval bridge', () => {
    const consoleSrc = readV2Source('ExperienceLabFounderReviewConsole.tsx');
    const css = readV2Source('experience-lab-v2.css');
    expect(consoleSrc).toContain('DESIGN BRIEF');
    expect(consoleSrc).toContain('FOUNDER REVIEW WALL');
    expect(consoleSrc).toContain('REVISION TIMELINE');
    expect(consoleSrc).toContain('ELAB_V2_COMPOSITION.founderReviewConsole');
    expect(css).toMatch(/\.elab-founder-review-console__grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    expect(css).toMatch(/\.elab-founder-review-console__panel\s*\{[\s\S]*?min-height:\s*var\(--elab-frc-panel-min-h\)/);
    expect(css).toContain('--elab-frc-panel-min-h: 56px');
    expect(css).toMatch(/\.elab-founder-review-console__title[\s\S]*?font-weight:\s*500/);
    expect(css).toMatch(/\.elab-founder-review-console__title[\s\S]*?white-space:\s*nowrap/);
    expect(css).toMatch(/\.elab-founder-review-console__panel--brief[\s\S]*?text-align:\s*center/);
    expect(css).toMatch(/\.elab-founder-review-console__panel--timeline[\s\S]*?text-align:\s*center/);
    expect(css).toMatch(/\.elab-founder-review-console__panel\s*\{[\s\S]*?border:\s*1px solid var\(--elab-hud-border-color\)/);
    expect(css).toMatch(/\.elab-founder-review-console\s*\{[\s\S]*?padding:\s*4px\s+0\s+var\(--elab-frc-bridge-gap\)/);
    expect(css).toMatch(/\.elab-app-shell__lower-deck\s*>\s*\.elab-founder-review-console\s*\+\s*\.elab-approval-bridge[\s\S]*?margin-top:\s*clamp\(8px,\s*1\.2vw,\s*12px\)/);
    expect(css).toMatch(/\.elab-founder-review-console__grid\s*\{[\s\S]*?gap:\s*clamp\(8px,\s*1\.2vw,\s*14px\)/);
    expect(css).toMatch(/\.elab-founder-review-console__panel\s*\{[\s\S]*?border-radius:\s*var\(--elab-hud-radius-panel\)/);
  });

  it('command dock uses tiered layout with program pipeline selectors', () => {
    const dock = readV2Source('ExperienceLabCommandDock.tsx');
    expect(dock).toContain('elab-cmd--pro');
    expect(dock).toContain('elab-cmd--tiered');
    expect(dock).toContain('elab-cmd__row--identity');
    expect(dock).toContain('elab-cmd__row--programs');
    expect(dock).toContain('elab-cmd__row--pipeline');
    expect(dock).toContain('elab-cmd__row--breadcrumb');
    expect(dock).toContain('elab-cmd__row--status');
    expect(dock).toContain('elab-cmd__status-center');
    expect(dock).toContain('ProgramSelector');
    expect(dock).toContain('ActiveContextBreadcrumb');
    expect(dock).toContain('resolveExperienceLabCommandDockLogoUrl');
    expect(dock).toContain('elab-cmd__overflow-dots');
    expect(dock).not.toContain('isCompact');
    expect(dock).not.toContain('EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS');
    expect(readV2Source('ExperienceLabWorkbenchDock.tsx')).toContain('elab-wb-dock--pro');
    expect(readV2Source('ExperienceLabWorkbenchDock.tsx')).not.toContain('isCompact');
  });

  it('view angles live in viewport chrome region (not absolute overlay)', () => {
    const stage = readV2Source('ExperienceLabViewportStage.tsx');
    expect(stage).toContain('ExperienceLabDesignVariantStrip');
    expect(stage).toContain('environmentUrl={designVariants.activeEnvironmentUrl}');
    expect(stage).not.toContain('VIEW ANGLES');
    expect(stage).not.toContain('elab-view-angles--attached');
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('.elab-viewport__angles-chrome');
    expect(css).not.toContain('.elab-view-angles--attached');
  });

  it('focus mode and escape handling exist', () => {
    const hook = readV2Source('useExperienceLabAppShell.ts');
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    const css = readV2Source('experience-lab-v2.css');
    expect(hook).toContain('Escape');
    expect(hook).toContain('focusMode');
    expect(readV2Source('experience-lab-v2-layout.ts')).toContain('ElabFocusMode');
    expect(shell).toContain('EXIT FOCUS');
    expect(shell).toContain('replaceAll');
    expect(css).toMatch(/\.elab-app-shell__focus-bar\s*\{[\s\S]*?text-transform:\s*uppercase/);
  });

  it('layout tokens and safe-area variables defined centrally', () => {
    const layout = readV2Source('experience-lab-v2-layout.ts');
    expect(layout).toContain('--el-v2-safe-top');
    expect(layout).toContain('resolveElabBreakpoint');
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('--el-v2-safe-bottom');
    expect(css).toContain('elab-v2-fixed-shell-active');
  });

  it('sheets provide internal scroll without page expansion', () => {
    expect(readV2Source('ExperienceLabSheet.tsx')).toContain('data-elab-sheet');
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('.elab-sheet__body');
    expect(css).toContain('overflow-y: auto');
  });
});

describe('Experience Lab V2 — Routes', () => {
  it('defines canonical V2 route and alias', () => {
    expect(EXPERIENCE_LAB_V2_ROUTE).toBe('/admin/studio/experience-lab-v2');
    expect(EXPERIENCE_LAB_V2_ALIAS_ROUTE).toBe('/admin/studio/experience-lab/test-v2');
  });

  it('legacy production route remains separate', () => {
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab-v2')).toBe(true);
    expect(isStudioWorldAdminOnlyPath('/admin/studio/experience-lab/safe')).toBe(true);
  });
});

describe('Experience Lab V2 — StudioViewport modes', () => {
  it('supports all required viewport modes', () => {
    expect(STUDIO_VIEWPORT_MODES).toContain('BLUEPRINT');
    expect(STUDIO_VIEWPORT_MODES).toContain('FOUNDER_RENDER');
    expect(STUDIO_VIEWPORT_MODES).toContain('CONSTRUCTION_PLAN');
    expect(STUDIO_VIEWPORT_MODES).toContain('SPLIT_VIEW');
    expect(STUDIO_VIEWPORT_MODES).toContain('LOADING');
    expect(STUDIO_VIEWPORT_MODES).toContain('ERROR');
  });

  it('parses and serializes view query state', () => {
    expect(parseViewportModeFromQuery('?view=blueprint')).toBe('BLUEPRINT');
    expect(parseViewportModeFromQuery('?view=founder-render')).toBe('FOUNDER_RENDER');
    expect(parseViewportModeFromQuery('?view=split')).toBe('SPLIT_VIEW');
    expect(viewportModeToQuery('BLUEPRINT')).toBe('blueprint');
    expect(viewportModeToQuery('SPLIT_VIEW')).toBe('split');
  });

  it('blueprint and founder render are distinct artifact keys', () => {
    const model = experienceLabV2ViewModelAdapter({
      program: 'studio-world',
      departmentId: 'experience-lab',
      viewportMode: 'SPLIT_VIEW',
      queue: null,
      useMock: true,
    });
    expect(model.artifacts.blueprint?.kind).toBe('blueprint');
    expect(model.artifacts.founderRender?.kind).toBe('founder-render');
    expect(model.artifacts.blueprint?.kind).not.toBe(model.artifacts.founderRender?.kind);
  });
});

describe('Experience Lab V2 — Approval & test modes', () => {
  const built = buildCanonicalDepartmentConstructionPlan('experience-lab', 'landscape');
  const plan = built.ok ? built.plan : null;

  it('approval disabled in read-only mode', () => {
    const job = plan
      ? buildFounderRenderJobView({ plan, job: { status: 'ready', previewArtifactUrl: 'https://example.com/render.png', blueprintRevision: plan.metadata.revision } })
      : null;
    const approval = evaluateExperienceLabV2Approval({
      founderRender: job,
      imageLoaded: true,
      blueprintRevision: plan?.metadata.revision ?? 1,
      testMode: 'READ_ONLY',
      approvalRecorded: false,
      hasAdminPermission: true,
    });
    expect(approval.canApprove).toBe(false);
    expect(approval.disabledReasons.some((r) => r.includes('READ_ONLY'))).toBe(true);
  });

  it('mock mode performs no writes', () => {
    expect(canPerformProductionWrite('MOCK')).toBe(false);
    expect(canPerformProductionWrite('READ_ONLY')).toBe(false);
    expect(canPerformProductionWrite('CONTROLLED_LIVE')).toBe(true);
  });

  it('controlled live requires confirmation', () => {
    expect(requiresLiveConfirmation('CONTROLLED_LIVE')).toBe(true);
    expect(requiresLiveConfirmation('MOCK')).toBe(false);
  });

  it('approval disabled when stale', () => {
    const job = plan
      ? buildFounderRenderJobView({
          plan,
          job: { status: 'stale', previewArtifactUrl: 'https://example.com/old.png', blueprintRevision: 0 },
        })
      : null;
    const approval = evaluateExperienceLabV2Approval({
      founderRender: job,
      imageLoaded: true,
      blueprintRevision: plan?.metadata.revision ?? 1,
      testMode: 'CONTROLLED_LIVE',
      approvalRecorded: false,
      hasAdminPermission: true,
    });
    expect(approval.canApprove).toBe(false);
  });
});

describe('Experience Lab V2 — View model adapter', () => {
  it('maps production contracts into V2 presentation model', () => {
    const model = experienceLabV2ViewModelAdapter({
      program: 'studio-world',
      departmentId: 'experience-lab',
      viewportMode: 'BLUEPRINT',
      queue: null,
    });
    expect(model.version).toBe('experience-lab-v2.v1');
    expect(model.departmentName.length).toBeGreaterThan(0);
    expect(model.charterSummary.length).toBeGreaterThan(0);
    expect(model.artifacts.blueprint).toBeDefined();
    expect(model.artifacts.construction).toBeDefined();
  });

  it('inspector module selection maps to viewport modes', () => {
    expect(parseViewportModeFromQuery('?view=construction')).toBe('CONSTRUCTION_PLAN');
    expect(parseViewportModeFromQuery('?view=materials')).toBe('MATERIALS');
    expect(parseViewportModeFromQuery('?view=lighting')).toBe('LIGHTING');
    expect(parseViewportModeFromQuery('?view=camera')).toBe('CAMERA');
  });
});

describe('Experience Lab V2 — Feature flags & persistence', () => {
  beforeEach(() => {
    writeExperienceLabV2TestMode('READ_ONLY');
  });

  it('defaults test mode to READ_ONLY', () => {
    expect(readExperienceLabV2TestMode()).toBe('READ_ONLY');
  });

  it('resolves feature flag structure', () => {
    const flags = resolveExperienceLabV2FeatureFlags();
    expect(flags).toHaveProperty('experienceLabV2Enabled');
    expect(flags).toHaveProperty('experienceLabV2LiveActionsEnabled');
    expect(flags).toHaveProperty('experienceLabV2EnvironmentAssetEnabled');
    expect(flags.experienceLabV2DiagnosticsEnabled).toBe(false);
  });
});

describe('Experience Lab V2 — Panel orchestration', () => {
  it('shell wires panel orchestrator hook', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('useExperienceLabPanelOrchestrator');
    expect(shell).toContain('viewportStageProps');
    expect(readV2Source('ExperienceLabDiagnostics.tsx')).toContain('RESET EXPERIENCE LAB LAYOUT');
  });

  it('viewport stage renders orchestrated panels (not unconditional float list)', () => {
    const stage = readV2Source('ExperienceLabViewportStage.tsx');
    const viewport = readV2Source('StudioViewport.tsx');
    expect(stage).toContain('orchestrator');
    expect(stage).not.toContain('floats.map');
    expect(stage).not.toContain('ExperienceLabFloatingInspector');
    expect(stage).toContain('ExperienceLabDynamicContextCard');
    expect(viewport).toContain('ExperienceLabBlueprintCard');
    expect(stage).toContain('workbenchToolId');
  });

  it('composition markers include two-panel HUD architecture', () => {
    expect(ELAB_V2_COMPOSITION.inspectorSwitcher).toBe('data-elab-inspector-switcher');
    expect(ELAB_V2_COMPOSITION.contextualHud).toBe('data-elab-viewport-contextual-hud');
    expect(ELAB_V2_COMPOSITION.blueprintCard).toBe('data-elab-blueprint-card');
    expect(ELAB_V2_COMPOSITION.dynamicContextCard).toBe('data-elab-dynamic-context-card');
    expect(ELAB_V2_COMPOSITION.archPerspective).toBe('data-elab-arch-perspective');
    expect(ELAB_V2_COMPOSITION.workstationFrame).toBe('data-elab-workstation-frame');
    expect(ELAB_V2_COMPOSITION.componentReviewChrome).toBe('data-elab-component-review-chrome');
    expect(readV2Source('experience-lab-v2-panel-orchestrator.ts')).toContain('PANEL_LAYOUT_STORAGE_KEY');
  });

  it('viewport HUD panels use environment display anchor transforms and parallax hook', () => {
    const viewport = readV2Source('StudioViewport.tsx');
    const blueprint = readV2Source('ExperienceLabBlueprintCard.tsx');
    const context = readV2Source('ExperienceLabDynamicContextCard.tsx');
    const parallax = readV2Source('useExperienceLabHudParallax.ts');
    const anchor = readV2Source('ExperienceLabAnchoredEnvironmentDisplay.tsx');
    const css = readV2Source('experience-lab-v2.css');
    expect(viewport).toContain('useExperienceLabHudParallax');
    expect(viewport).toContain('ELAB_V2_COMPOSITION.archPerspective');
    expect(viewport).toContain('ExperienceLabEnvironmentDisplayAnchorDiagnosticOverlay');
    expect(blueprint).toContain('ExperienceLabAnchoredEnvironmentDisplay');
    expect(blueprint).toContain('LEFT_FRONT');
    expect(context).toContain('ExperienceLabAnchoredEnvironmentDisplay');
    expect(context).toContain('RIGHT_FRONT');
    expect(anchor).toContain('data-env-display-transform-owner');
    expect(anchor).toContain('data-env-display-visible-surface');
    expect(parallax).toContain('--elab-parallax-x');
    expect(css).toContain('--env-display-perspective: 1600px');
    expect(css).toContain('--elab-hud-panel-size-scale: 0.4');
    expect(css).toMatch(/\.elab-viewport__blueprint-card\s*\{[\s\S]*?max-width:\s*min\(calc\(46vw \* var\(--elab-hud-panel-size-scale\)\)/);
    expect(css).toMatch(/\.elab-viewport__context-card\s*\{[\s\S]*?width:\s*min\(calc\(42vw \* var\(--elab-hud-panel-size-scale\)\)/);
    expect(css).toMatch(/perspective:\s*var\(--env-display-perspective\)/);
    expect(css).toContain('transform-style: preserve-3d');
    expect(css).toContain('.elab-env-display-transform--left');
    expect(css).toContain('--display-rotate-y: 11deg');
    expect(css).toContain('@keyframes elabEnvDisplayEnterRight');
    expect(css).toMatch(/\.elab-env-display-transform[\s\S]*?will-change:\s*transform/);
    expect(css).toContain('--display-translate-x');
  });
});

describe('Experience Lab V2 — Viewport environment', () => {
  it('mounts canonical environment inside Studio Viewport only', () => {
    const viewport = readV2Source('StudioViewport.tsx');
    expect(viewport).toContain('ExperienceLabEnvironmentLayer');
    expect(viewport).toContain('scope="viewport"');
    expect(viewport).toContain('elab-viewport__stage-content');
    expect(viewport).not.toMatch(/function BlueprintEmptyState[\s\S]*elab-empty__grid/);
    expect(viewport).toContain('function BlueprintEmptyState');
    expect(viewport).toContain('return null');
  });

  it('config wires bundled viewport environment asset', () => {
    const config = readV2Source('experience-lab-v2.config.ts');
    expect(config).toContain('experience-lab-v2-viewport-environment.png');
    expect(config).toContain('experience-lab-v2-viewport-environment-desktop.png');
    expect(config).toContain('mobileEnvironmentUrl: experienceLabV2ViewportEnvironmentUrl');
    expect(config).toContain('desktopEnvironmentUrl: experienceLabV2ViewportEnvironmentDesktopUrl');
    expect(config).toContain("environmentPosition: 'center center'");
  });

  it('selects mobile vs desktop environment by compact breakpoint', () => {
    const viewport = readV2Source('StudioViewport.tsx');
    const stage = readV2Source('ExperienceLabViewportStage.tsx');
    expect(viewport).toContain('isMobile={isCompact}');
    expect(stage).toContain('isCompact={isCompact}');
  });

  it('viewport uses HUD architecture — render fills stage, two-panel HUD floats above', () => {
    const viewport = readV2Source('StudioViewport.tsx');
    const css = readV2Source('experience-lab-v2.css');
    expect(viewport).toContain('data-elab-viewport-hud');
    expect(viewport).toContain('elab-viewport__hud');
    expect(viewport).toContain('ExperienceLabBlueprintCard');
    expect(viewport).toContain('dynamicContextCard');
    expect(viewport).toContain('elab-viewport__stage--focusable');
    expect(viewport).toContain('ENTER FOCUS MODE');
    expect(viewport).not.toContain('elab-viewport__focus-ctrl');
    expect(viewport).not.toContain('focusMode');
    expect(viewport).toContain('blueprintThumbnailUrl');
    expect(viewport).not.toContain('elab-viewport__inspector-chips');
    expect(viewport).not.toContain('elab-viewport__tool-palette');
    expect(viewport).not.toContain('elab-viewport__chrome');
    expect(css).toContain('.elab-viewport__hud');
    expect(css).toContain('.elab-blueprint-card__thumb');
    expect(css).toContain('.elab-viewport__context-card');
    expect(css).toContain('@keyframes elabContextSwap');
    expect(css).toContain('--elab-hud-safe-top');
    expect(css).toMatch(/\.elab-viewport__stage-content\s*\{[\s\S]*?padding:\s*0/);
    expect(css).toMatch(/\.elab-viewport__stage-content\s*\{[\s\S]*?position:\s*absolute/);
  });

  it('defines premium HUD polish tokens for glass, elevation, and motion', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('--elab-hud-glass-fill');
    expect(css).toContain('--elab-hud-shadow-stack');
    expect(css).toContain('--elab-hud-edge-top');
    expect(css).toContain('.elab-hud-glass');
    expect(css).toContain('--elab-hud-duration');
    expect(css).toContain('--elab-hud-inset-top');
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('scopes viewport environment with cover/center layering', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toContain('.elab-v2__env--viewport');
    expect(css).toContain('object-position: var(--elab-env-position, center center)');
    expect(css).toContain('.elab-viewport__stage-content');
    expect(css).toMatch(/\.elab-viewport\s*\{[\s\S]*?background:\s*transparent/);
    expect(css).toMatch(/\.elab-stage__viewport-wrap\s*\{[\s\S]*?background:\s*transparent/);
  });

  it('full workstation always mounts viewport stage (environment not gated off)', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('viewport={<ExperienceLabViewportStage {...viewportStageProps} />}');
    expect(shell).not.toContain('elab-stage--hidden-placeholder');
  });

  it('hides blueprint meta pane when no preview image (environment only)', () => {
    const viewport = readV2Source('StudioViewport.tsx');
    expect(viewport).toContain('if (!artifact.previewUrl)');
    expect(viewport).not.toContain('elab-viewport-pane__meta');
  });

  it('centers view angle thumbnail strip in viewport chrome', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toMatch(/\.elab-view-angles__strip\s*\{[\s\S]*?justify-content:\s*center/);
  });

  it('view angles strip spans full workbench width edge to edge', () => {
    const css = readV2Source('experience-lab-v2.css');
    expect(css).toMatch(/\.elab-viewport__angles-chrome\s*\{[\s\S]*?background:\s*transparent/);
    expect(css).toMatch(/\.elab-viewport__angles-chrome\s+\.elab-view-angles--chrome\s*\{[\s\S]*?width:\s*100%/);
    expect(css).toMatch(/\.elab-viewport__angles-chrome\s+\.elab-view-angles--chrome\s*\{[\s\S]*?border-radius:\s*calc\(var\(--elab-hud-radius-panel\) \+ 2px\)/);
    expect(css).toMatch(/\.elab-viewport__angles-chrome\s+\.elab-view-angles--chrome\s*\{[\s\S]*?border-bottom:\s*none/);
    expect(css).toMatch(/\.elab-app-shell__viewport-room\s*\{[\s\S]*?border-bottom:\s*none/);
  });

  it('wires render direction design variant system', () => {
    const stage = readV2Source('ExperienceLabViewportStage.tsx');
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(stage).toContain('ExperienceLabDesignVariantStrip');
    expect(stage).toContain('designVariants');
    expect(shell).toContain('useExperienceLabDesignVariants');
    expect(shell).toContain('ExperienceLabDesignVariantDrawerBody');
    expect(readV2Source('experience-lab-design-variants.ts')).toContain('DESIGN VARIANTS');
    expect(readV2Source('ExperienceLabEnvironmentLayer.tsx')).toContain('environmentUrl');
    expect(readV2Source('experience-lab-v2-composition.ts')).toContain('designVariants');
  });

  it('resolves environment URLs from Environment Asset Package bridge', () => {
    const hook = readV2Source('useExperienceLabDesignVariants.ts');
    const bridge = readV2Source('experience-lab-environment-package-bridge.ts');
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    const drawer = readV2Source('ExperienceLabDesignVariantDrawer.tsx');
    expect(hook).toContain('resolveDesignVariantEnvironmentFromPackage');
    expect(hook).toContain('environmentPackageId');
    expect(hook).toContain('drawerPackageModel');
    expect(hook).toContain('isCompact');
    expect(hook).toContain('ensureExperienceLabVariantPackages');
    expect(bridge).toContain('ensureExperienceLabVariantPackages');
    expect(readV2Source('experience-lab-design-variants.ts')).toContain('environmentPackageId');
    expect(drawer).toContain('Approve for Production');
    expect(drawer).toContain('Promote to Canonical');
    expect(shell).toContain('approveForProduction');
    expect(shell).toContain('packageModel={designVariants.drawerPackageModel}');
  });
});

describe('Experience Lab V2 — Component Review Mode integration', () => {
  it('shell wires component review mode with Phase 1 default', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('useExperienceLabComponentReview');
    expect(shell).toContain('ExperienceLabComponentReviewChrome');
    expect(shell).toContain('ExperienceLabComponentReviewSandbox');
    expect(shell).toContain('elab-app-shell--component-review');
    expect(readV2Source('experience-lab-v2-component-review.ts')).toContain("'command-dock'");
  });

  it('does not delete components — hides via review.show()', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    expect(shell).toContain('review.show(');
    expect(shell).toContain('ExperienceLabCommandDock');
    expect(shell).toContain('ExperienceLabFounderWorkbench');
    expect(shell).toContain('ExperienceLabApprovalBridge');
  });
});
