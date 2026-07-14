import { describe, expect, it, beforeEach } from 'vitest';
import {
  registerIcon,
  resetStudioWorldIconRegistry,
  getIcon,
  searchIcons,
  listByCategory,
  resolveRuntimeIcon,
  resolveWorkbenchIcon,
  resolveCommandDockIcon,
  analyzeStudioWorldIconDiagnostics,
  buildStudioWorldIconManifest,
  STUDIO_WORLD_ICON_CATEGORIES,
  STUDIO_WORLD_ICON_STATES,
  STUDIO_WORLD_ICON_THEMES,
  STUDIO_WORLD_ICON_DESIGN_TOKENS,
  type StudioWorldIconDefinition,
} from './index';

function sampleIcon(id: string): StudioWorldIconDefinition {
  const now = new Date().toISOString();
  return {
    id,
    category: 'workspace',
    displayName: id,
    aliases: [id],
    keywords: ['test'],
    description: 'test icon',
    version: 'v1',
    certification: 'draft',
    status: 'draft',
    strokeWidth: 1,
    cornerRadius: 2,
    opticalWeight: 1,
    designFamily: 'test',
    renderStyle: 'vector',
    themeCompatibility: { 'studio-dark': true },
    provider: 'local-svg',
    defaultAsset: '/test.svg',
    hoverAsset: null,
    activeAsset: null,
    disabledAsset: null,
    futureAnimatedAsset: null,
    futureVariableAsset: null,
    future3DAsset: null,
    svgPath: '/test.svg',
    pngPath: null,
    thumbnail: null,
    preview: null,
    stateAssets: {},
    future: {
      supportsAnimation: true,
      supportsMorph: false,
      supportsVariable: false,
      supports3D: false,
      supportsParticles: false,
      supportsGlow: false,
      supportsPhysics: false,
    },
    metadata: {
      author: 'test',
      createdAt: now,
      updatedAt: now,
      tags: ['test'],
      departmentUsage: ['experience-lab'],
      usageCount: 0,
      favorite: false,
      deprecated: false,
      replacement: null,
    },
  };
}

describe('Studio World Icon System Foundation', () => {
  beforeEach(() => {
    resetStudioWorldIconRegistry();
  });

  it('defines canonical categories', () => {
    expect(STUDIO_WORLD_ICON_CATEGORIES.length).toBe(18);
    expect(STUDIO_WORLD_ICON_CATEGORIES.map((c) => c.id)).toContain('studio-world-exclusive');
  });

  it('defines state and theme architecture', () => {
    expect(STUDIO_WORLD_ICON_STATES).toContain('generating');
    expect(STUDIO_WORLD_ICON_THEMES).toContain('luxury-gold');
    expect(STUDIO_WORLD_ICON_DESIGN_TOKENS.minimumSize).toBe(10);
  });

  it('registerIcon and getIcon work', () => {
    const result = registerIcon(sampleIcon('blueprint'));
    expect(result.ok).toBe(true);
    expect(getIcon('blueprint')?.displayName).toBe('blueprint');
  });

  it('rejects duplicate icon ids', () => {
    registerIcon(sampleIcon('dup'));
    const second = registerIcon(sampleIcon('dup'));
    expect(second.ok).toBe(false);
  });

  it('searchIcons finds by keyword and category', () => {
    registerIcon(sampleIcon('materials'));
    const results = searchIcons({ query: 'materials', category: 'workspace' });
    expect(results.some((r) => r.id === 'materials')).toBe(true);
  });

  it('listByCategory filters icons', () => {
    registerIcon(sampleIcon('nav-home'));
    expect(listByCategory('workspace').length).toBe(1);
  });

  it('resolveRuntimeIcon returns asset path', () => {
    registerIcon(sampleIcon('camera'));
    const resolved = resolveRuntimeIcon({ iconId: 'camera', sizePx: 24 });
    expect(resolved?.assetPath).toBe('/test.svg');
    expect(resolved?.sizePx).toBe(24);
  });

  it('resolveWorkbenchIcon uses workbench namespace', () => {
    registerIcon({ ...sampleIcon('construction'), id: 'workbench.architectural-tools' });
    const resolved = resolveWorkbenchIcon({ toolId: 'architectural-tools' });
    expect(resolved?.iconId).toBe('workbench.architectural-tools');
  });

  it('resolveCommandDockIcon uses command-dock namespace', () => {
    registerIcon({ ...sampleIcon('orbit'), id: 'command-dock.program' });
    const resolved = resolveCommandDockIcon({ slotId: 'program' });
    expect(resolved?.iconId).toBe('command-dock.program');
  });

  it('buildStudioWorldIconManifest includes checksum', () => {
    registerIcon(sampleIcon('manifest-test'));
    const manifest = buildStudioWorldIconManifest();
    expect(manifest.iconCount).toBe(1);
    expect(manifest.checksum).toBeTruthy();
  });

  it('analyzeStudioWorldIconDiagnostics reports health', () => {
    registerIcon(sampleIcon('healthy'));
    const report = analyzeStudioWorldIconDiagnostics();
    expect(report.totalIcons).toBe(1);
    expect(report.categoryCount).toBe(18);
  });
});
