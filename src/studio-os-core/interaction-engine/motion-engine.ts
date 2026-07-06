import { MOTION_DEFAULTS, MOTION_STANDARD_TYPES } from './constants';
import type { MotionStandardEntry, MotionStandardType } from './types';

function motion(
  partial: Pick<MotionStandardEntry, 'motionId' | 'name' | 'type' | 'value' | 'description'> &
    Partial<MotionStandardEntry>
): MotionStandardEntry {
  return {
    usedBy: partial.usedBy ?? ['Executive IA', 'Registry Workspaces', 'Command Dock'],
    ...partial,
  };
}

/** Motion standards — cohesive timing, easing, and transitions across Studio OS. */
export function buildMotionStandards(): MotionStandardEntry[] {
  const d = MOTION_DEFAULTS;
  return [
    motion({ motionId: 'motion.timing-fast', name: 'Fast Timing', type: 'timing', value: `${d.fastMs}ms`, description: 'Hover, press, micro-feedback.' }),
    motion({ motionId: 'motion.timing-standard', name: 'Standard Timing', type: 'timing', value: `${d.standardMs}ms`, description: 'Tab switch, chip toggle, list reveal.' }),
    motion({ motionId: 'motion.timing-panel', name: 'Panel Timing', type: 'timing', value: `${d.panelMs}ms`, description: 'Accordion expand, modal fade.' }),
    motion({ motionId: 'motion.timing-drawer', name: 'Drawer Timing', type: 'timing', value: `${d.drawerMs}ms`, description: 'Slide-over panels, Command Dock expansion.' }),
    motion({ motionId: 'motion.timing-celebration', name: 'Celebration Timing', type: 'timing', value: `${d.celebrationMs}ms`, description: 'Milestone animations — capped duration.' }),

    motion({ motionId: 'motion.easing-standard', name: 'Standard Easing', type: 'easing', value: d.easingStandard, description: 'Material-style ease-in-out for most transitions.' }),
    motion({ motionId: 'motion.easing-spring', name: 'Spring Easing', type: 'easing', value: d.easingSpring, description: 'Overshoot spring for celebration and drawer snap.' }),

    motion({ motionId: 'motion.transition-default', name: 'Default Transition', type: 'transition', value: `all ${d.standardMs}ms ${d.easingStandard}`, description: 'Standard property transition bundle.' }),
    motion({ motionId: 'motion.transition-colors', name: 'Color Transition', type: 'transition', value: `color, background-color, border-color ${d.fastMs}ms`, description: 'Hover/focus color shifts only.' }),

    motion({ motionId: 'motion.spring-panel', name: 'Panel Spring', type: 'spring', value: 'stiffness 280 · damping 24', description: 'Collapsible section height animation.' }),
    motion({ motionId: 'motion.spring-drawer', name: 'Drawer Spring', type: 'spring', value: 'stiffness 320 · damping 28', description: 'Slide-over entrance/exit.' }),

    motion({ motionId: 'motion.panel-expand', name: 'Panel Expansion', type: 'panel', value: `height ${d.panelMs}ms ${d.easingStandard}`, description: 'ExecutiveCollapsibleSection expand/collapse.', usedBy: ['ExecutiveCollapsibleSection', 'Registry Workspaces'] }),
    motion({ motionId: 'motion.drawer-slide', name: 'Drawer Movement', type: 'drawer', value: `transform ${d.drawerMs}ms ${d.easingStandard}`, description: 'Learn This Page slide-over.', usedBy: ['StudioKnowledgeProvider', 'Command Dock'] }),

    motion({ motionId: 'motion.glass-reflection', name: 'Glass Reflection', type: 'glass', value: 'subtle gradient shift on hover 200ms', description: 'Perspective panel and acrylic surfaces.', usedBy: ['PerspectivePanel', 'ExecutiveSecondaryCard'] }),

    motion({ motionId: 'motion.micro-tab', name: 'Tab Micro-interaction', type: 'micro', value: `border-color ${d.fastMs}ms`, description: 'Registry workspace tab accent border.', usedBy: ['ComponentRegistryWorkspace', 'DesignTokenEngineWorkspace'] }),
    motion({ motionId: 'motion.micro-button', name: 'Button Micro-interaction', type: 'micro', value: `scale 0.98 ${d.fastMs}ms`, description: 'eiaActionBtn press feedback.', usedBy: ['eiaActionBtn', 'Mission Control panels'] }),

    motion({ motionId: 'motion.celebration', name: 'Celebration Animation', type: 'celebration', value: `pulse + confetti ${d.celebrationMs}ms max`, description: 'Milestone celebrations — disabled when prefers-reduced-motion.', usedBy: ['Living Headquarters', 'Organization Inauguration'] }),
    motion({ motionId: 'motion.notification', name: 'Notification Animation', type: 'notification', value: `slide-in 280ms · fade-out 200ms`, description: 'Toast and Command Dock proactive lines.', usedBy: ['Command Dock', 'Mission Control notifications'] }),

    motion({ motionId: 'motion.reduced-motion', name: 'Reduced Motion Fallback', type: 'timing', value: '0ms or opacity-only', description: 'When prefers-reduced-motion: reduce — skip transform animations.', usedBy: ['All interactive surfaces'] }),
  ];
}

export function listMotionByType(type: MotionStandardType): MotionStandardEntry[] {
  return buildMotionStandards().filter((m) => m.type === type);
}

export function getMotionStandard(motionId: string): MotionStandardEntry | undefined {
  return buildMotionStandards().find((m) => m.motionId === motionId);
}

void MOTION_STANDARD_TYPES;
