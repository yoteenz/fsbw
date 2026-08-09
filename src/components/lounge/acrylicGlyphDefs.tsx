/** Shared SVG gradient defs for sculptural acrylic controls. */

import type { ReactNode } from 'react';

export function acrylicGradientDefs(uid: string): { id: (suffix: string) => string; defs: ReactNode } {
  const id = (suffix: string) => `acrylic-${uid}-${suffix}`;

  return {
    id,
    defs: (
      <>
        <linearGradient id={id('face')} x1="0%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#e8eef5" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="35%" stopColor="#8899aa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1a2530" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={id('side-vertical')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#2a3540" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={id('bevel-top')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={id('edge-bright')} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
      </>
    ),
  };
}

/** Crisp edge stroke — reads at small sizes (bookmark rails). */
export const ACRYLIC_EDGE_STROKE = {
  bright: { stroke: '#ffffff', strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const },
};
