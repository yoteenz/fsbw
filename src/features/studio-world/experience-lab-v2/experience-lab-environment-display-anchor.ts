/** Environment Display Anchor System — transform profiles and diagnostics (Experience Lab V2). */

export type EnvironmentDisplayAnchorId = 'LEFT_FRONT' | 'RIGHT_FRONT';

export type EnvironmentDisplayDeviceProfile =
  | 'desktop'
  | 'tablet'
  | 'mobilePortrait'
  | 'mobileLandscape';

export type EnvironmentDisplayTransformProfile = {
  perspective: string;
  translateZ: string;
  rotateX: string;
  rotateY: string;
  transformOrigin: string;
};

export const ENV_DISPLAY_TRANSFORM_VARS = [
  '--display-translate-x',
  '--display-translate-y',
  '--display-translate-z',
  '--display-rotate-x',
  '--display-rotate-y',
  '--display-rotate-z',
  '--display-scale',
] as const;

export const ENV_DISPLAY_ANCHOR_PROFILES: Record<
  EnvironmentDisplayDeviceProfile,
  { perspective: string; left: EnvironmentDisplayTransformProfile; right: EnvironmentDisplayTransformProfile }
> = {
  desktop: {
    perspective: '1600px',
    left: {
      perspective: '1600px',
      translateZ: '95px',
      rotateX: '-1deg',
      rotateY: '10deg',
      transformOrigin: 'left center',
    },
    right: {
      perspective: '1600px',
      translateZ: '95px',
      rotateX: '-1deg',
      rotateY: '-10deg',
      transformOrigin: 'right center',
    },
  },
  tablet: {
    perspective: '1400px',
    left: {
      perspective: '1400px',
      translateZ: '78px',
      rotateX: '-1deg',
      rotateY: '9deg',
      transformOrigin: 'left center',
    },
    right: {
      perspective: '1400px',
      translateZ: '78px',
      rotateX: '-1deg',
      rotateY: '-9deg',
      transformOrigin: 'right center',
    },
  },
  mobilePortrait: {
    perspective: '1100px',
    left: {
      perspective: '1100px',
      translateZ: '70px',
      rotateX: '-1deg',
      rotateY: '11deg',
      transformOrigin: 'left center',
    },
    right: {
      perspective: '1100px',
      translateZ: '70px',
      rotateX: '-1deg',
      rotateY: '-11deg',
      transformOrigin: 'right center',
    },
  },
  mobileLandscape: {
    perspective: '1300px',
    left: {
      perspective: '1300px',
      translateZ: '80px',
      rotateX: '-1deg',
      rotateY: '10deg',
      transformOrigin: 'left center',
    },
    right: {
      perspective: '1300px',
      translateZ: '80px',
      rotateX: '-1deg',
      rotateY: '-10deg',
      transformOrigin: 'right center',
    },
  },
};

/** Returns true when a computed CSS transform is not identity-flat (rotateY present). */
export function isNonFlatDisplayTransform(transform: string): boolean {
  const normalized = transform.trim();
  if (!normalized || normalized === 'none') return false;
  const hasRotateY = /rotateY\((?!0deg)[^)]+\)/.test(normalized);
  const matrix3d = normalized.match(/matrix3d\(([^)]+)\)/);
  if (matrix3d) {
    const parts = matrix3d[1].split(',').map((v) => Number.parseFloat(v.trim()));
    if (parts.length === 16) {
      const [, , , , m11, , m13] = parts;
      return Math.abs(m13) > 0.001 || Math.abs(m11 - 1) > 0.001 || hasRotateY;
    }
  }
  return hasRotateY;
}

export function anchorDiagnosticExpectation(anchor: EnvironmentDisplayAnchorId): {
  anchor: EnvironmentDisplayAnchorId;
  rotateYRange: string;
  transformOrigin: string;
} {
  if (anchor === 'LEFT_FRONT') {
    return { anchor, rotateYRange: '10deg–13deg', transformOrigin: 'left center' };
  }
  return { anchor, rotateYRange: '-10deg to -13deg', transformOrigin: 'right center' };
}
