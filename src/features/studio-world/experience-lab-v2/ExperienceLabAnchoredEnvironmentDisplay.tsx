import type { ReactNode } from 'react';
import type { EnvironmentDisplayAnchorId } from './experience-lab-environment-display-anchor';

type Props = {
  anchor: EnvironmentDisplayAnchorId;
  side: 'left' | 'right';
  hostClassName: string;
  compositionAttr?: string;
  enter?: boolean;
  ariaLabel: string;
  children: ReactNode;
};

/**
 * EnvironmentDisplayHost → anchor-slot → anchored-display-transform-wrapper → visible-glass-surface.
 * Position anchor lives on host; 3D transform on wrapper; glass + content on surface.
 */
export function ExperienceLabAnchoredEnvironmentDisplay({
  anchor,
  side,
  hostClassName,
  compositionAttr,
  enter = false,
  ariaLabel,
  children,
}: Props) {
  const hostAttrs = compositionAttr ? { [compositionAttr]: '' } : {};

  return (
    <div
      className={`elab-env-display-host ${hostClassName}`}
      data-env-display-host
      data-env-display-anchor={anchor}
      data-env-display-side={side}
      aria-label={ariaLabel}
      {...hostAttrs}
    >
      <div className="elab-env-display-anchor-slot">
        <div
          className={`elab-env-display-transform elab-env-display-transform--${side}${enter ? ' elab-env-display-transform--enter' : ''}`}
          data-env-display-transform-owner
        >
          <div className="elab-env-display-surface" data-env-display-visible-surface>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
