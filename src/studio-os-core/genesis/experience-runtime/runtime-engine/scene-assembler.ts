import { XER_SCENE_NODE_IDS } from '../constants';
import type { XerRenderNode } from '../types';
import type { XerResolvedDnaLayers } from './dna-resolver';
import type { XerThemeBundle } from './theme-resolver';

export function assembleSceneGraph(layers: XerResolvedDnaLayers, theme: XerThemeBundle): XerRenderNode[] {
  const { brand, department, scene, components } = layers;
  const header = components.find((c) => c.componentId === 'executive-header');
  const nav = components.find((c) => c.componentId === 'navigation-rail');
  const card = components.find((c) => c.componentId === 'capability-card');
  const orb = components.find((c) => c.componentId === 'orb-mount');

  const nodes: XerRenderNode[] = [
    {
      nodeId: 'node-executive-header',
      role: 'executive-header',
      componentId: header?.componentId ?? 'executive-header',
      variant: header?.variant ?? 'default',
      cssBindings: {
        borderColor: `${brand.colorSystem.primary}22`,
        fontDisplay: theme.typography.display,
      },
      stateSlotIds: ['slot-header-note'],
    },
    {
      nodeId: 'node-navigation-rail',
      role: 'navigation-rail',
      componentId: nav?.componentId ?? 'navigation-rail',
      variant: nav?.variant ?? 'default',
      cssBindings: {
        borderColor: `${brand.colorSystem.primary}15`,
        accent: department.departmentColor,
      },
      stateSlotIds: ['slot-active-department'],
    },
    {
      nodeId: 'node-hero-environment',
      role: 'hero-environment',
      componentId: 'hero-stage',
      variant: 'platform-default',
      cssBindings: {
        background: `${brand.colorSystem.primary}08`,
        borderColor: `${brand.colorSystem.accent}55`,
      },
      stateSlotIds: [],
    },
    {
      nodeId: 'node-primary-focal-object',
      role: 'primary-focal-object',
      componentId: 'hero-stage',
      variant: 'focal',
      cssBindings: {
        metaphor: scene.heroObject,
      },
      stateSlotIds: ['slot-hero-caption'],
    },
    {
      nodeId: 'node-capability-panels',
      role: 'capability-panels',
      componentId: card?.componentId ?? 'capability-card',
      variant: card?.variant ?? 'default',
      cssBindings: {
        panelBackground: brand.glassStyle.panelStrong,
        border: brand.glassStyle.border,
      },
      stateSlotIds: ['slot-capability-focus'],
    },
    {
      nodeId: 'node-orb-mount',
      role: 'orb-mount',
      componentId: orb?.componentId ?? 'orb-mount',
      variant: orb?.variant ?? brand.orbOverrides.variant,
      cssBindings: {
        glow: brand.orbOverrides.glowColor,
        personality: brand.orbOverrides.personality,
      },
      stateSlotIds: ['slot-orb-context'],
    },
    {
      nodeId: 'node-footer-ribbon',
      role: 'footer-ribbon',
      componentId: 'context-ribbon',
      variant: 'default',
      cssBindings: {
        borderColor: `${brand.colorSystem.primary}15`,
        color: brand.colorSystem.textSecondary,
      },
      stateSlotIds: [],
    },
  ];

  return nodes.filter((n) => XER_SCENE_NODE_IDS.includes(n.nodeId));
}
