import { useEffect, useState } from 'react';
import {
  anchorDiagnosticExpectation,
  isNonFlatDisplayTransform,
  type EnvironmentDisplayAnchorId,
} from './experience-lab-environment-display-anchor';

type ResolvedDisplayDiagnostic = {
  anchor: EnvironmentDisplayAnchorId;
  rotateY: string;
  rotateX: string;
  translateZ: string;
  transformOrigin: string;
  transformMatrix: string;
  deviceProfile: string;
  surfaceSelector: string;
  transformOwner: string;
  nonFlat: boolean;
};

function readProfileLabel(): string {
  if (typeof window === 'undefined') return 'unknown';
  const shell = document.querySelector('[data-experience-lab-v2-shell]');
  if (!shell) return 'unknown';
  if (shell.classList.contains('elab-app-shell--mobile')) {
    return window.matchMedia('(orientation: landscape)').matches ? 'mobileLandscape' : 'mobilePortrait';
  }
  if (shell.classList.contains('elab-app-shell--tablet')) return 'tablet';
  if (shell.classList.contains('elab-app-shell--desktop')) return 'desktop';
  return 'unknown';
}

function resolveDisplayDiagnostic(anchor: EnvironmentDisplayAnchorId): ResolvedDisplayDiagnostic | null {
  const host = document.querySelector<HTMLElement>(`[data-env-display-anchor="${anchor}"]`);
  const owner = host?.querySelector<HTMLElement>('[data-env-display-transform-owner]');
  const surface = host?.querySelector<HTMLElement>('[data-env-display-visible-surface]');
  if (!host || !owner || !surface) return null;

  const styles = getComputedStyle(owner);
  const expectation = anchorDiagnosticExpectation(anchor);

  return {
    anchor,
    rotateY: styles.getPropertyValue('--display-rotate-y').trim() || 'unresolved',
    rotateX: styles.getPropertyValue('--display-rotate-x').trim() || 'unresolved',
    translateZ: styles.getPropertyValue('--display-translate-z').trim() || 'unresolved',
    transformOrigin: styles.transformOrigin || expectation.transformOrigin,
    transformMatrix: styles.transform || 'none',
    deviceProfile: readProfileLabel(),
    surfaceSelector: '[data-env-display-visible-surface]',
    transformOwner: '[data-env-display-transform-owner]',
    nonFlat: isNonFlatDisplayTransform(styles.transform),
  };
}

type Props = {
  enabled?: boolean;
};

/** Anchor diagnostic overlay — resolved transforms for blueprint and context displays. */
export function ExperienceLabEnvironmentDisplayAnchorDiagnosticOverlay({ enabled = true }: Props) {
  const [rows, setRows] = useState<ResolvedDisplayDiagnostic[]>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const refresh = () => {
      const next = (['LEFT_FRONT', 'RIGHT_FRONT'] as EnvironmentDisplayAnchorId[])
        .map(resolveDisplayDiagnostic)
        .filter((row): row is ResolvedDisplayDiagnostic => row !== null);
      setRows(next);
    };

    refresh();
    const id = window.setInterval(refresh, 1200);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || rows.length === 0) return null;

  return (
    <div className="elab-env-display-diag" data-elab-anchor-diagnostics aria-hidden>
      {rows.map((row) => (
        <div key={row.anchor} className="elab-env-display-diag__row">
          <strong>{row.anchor}</strong>
          <span>profile={row.deviceProfile}</span>
          <span>rotateY={row.rotateY}</span>
          <span>rotateX={row.rotateX}</span>
          <span>translateZ={row.translateZ}</span>
          <span>origin={row.transformOrigin}</span>
          <span>matrix={row.nonFlat ? 'nonflat' : 'FLAT'}</span>
          <span>owner={row.transformOwner}</span>
        </div>
      ))}
    </div>
  );
}
