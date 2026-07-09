import { XER_PLATFORM_DNA_ID, XER_SCENE_NODE_IDS } from '../constants';
import type { XerPlatformDna, XerStateDna } from '../types';

export function buildPlatformDna(): XerPlatformDna {
  return {
    platformDnaId: XER_PLATFORM_DNA_ID,
    version: '1.0.0',
    routeAnatomy: [
      'route-shell',
      'scene-root',
      'executive-header',
      'navigation-rail',
      'hero-environment',
      'capability-grid',
      'orb-mount',
      'footer-ribbon',
    ],
    layoutPrimitives: [
      'fixed-scene-grid',
      'three-column-hq',
      'capability-panel-row',
      'persistent-orb-anchor',
      'glass-panel-stack',
    ],
    accessibilityFloor: [
      'keyboard-focus-visible',
      'semantic-landmarks',
      'contrast-minimum-4.5',
      'reduced-motion-branch',
      'screen-reader-labels',
    ],
    sceneGraphContract: 'Runtime nodes use stable IDs; Brand DNA may change expression only.',
    orbMountContract: 'Orb mount node persists across brand switches; personality rebinds at runtime.',
    dataSlotContract: 'Data loaders bind to platform slots; brand changes never refetch unless policy changes.',
    componentAnatomyIds: [
      'executive-header',
      'navigation-rail',
      'capability-card',
      'hero-stage',
      'orb-mount',
      'context-ribbon',
    ],
  };
}

export function buildStateDnaProfiles(): XerStateDna[] {
  const sceneIds = [
    'executive-headquarters',
    'institute-of-knowledge',
    'command-center',
    'content-engine',
    'orb-room',
  ] as const;

  return sceneIds.map((sceneId) => ({
    stateDnaId: `state-${sceneId}-v1`,
    version: 'v1',
    sceneId,
    slots: [
      {
        slotId: 'slot-header-note',
        nodeId: 'node-executive-header',
        label: 'Executive header note',
        persistenceScope: 'session' as const,
        defaultValue: '',
      },
      {
        slotId: 'slot-active-department',
        nodeId: 'node-navigation-rail',
        label: 'Active department rail selection',
        persistenceScope: 'session' as const,
        defaultValue: 'executive',
      },
      {
        slotId: 'slot-hero-caption',
        nodeId: 'node-primary-focal-object',
        label: 'Hero focal caption',
        persistenceScope: 'session' as const,
        defaultValue: '',
      },
      {
        slotId: 'slot-capability-focus',
        nodeId: 'node-capability-panels',
        label: 'Focused capability panel',
        persistenceScope: 'session' as const,
        defaultValue: '',
      },
      {
        slotId: 'slot-orb-context',
        nodeId: 'node-orb-mount',
        label: 'Orb conversation context',
        persistenceScope: 'session' as const,
        defaultValue: 'idle',
      },
    ],
    liveSwitchPolicy: {
      preserveSlots: [
        'slot-header-note',
        'slot-active-department',
        'slot-hero-caption',
        'slot-capability-focus',
        'slot-orb-context',
      ],
      resetSlots: [],
    },
  }));
}

export function listPlatformSceneNodeIds(): readonly string[] {
  return XER_SCENE_NODE_IDS;
}
