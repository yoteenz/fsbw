import {
  getUnitPdpDetailsConfig,
  type WigUnitKey,
} from '../../../utils/unitPdpDetailsConfig';
import { getSignatureUnitEducationProfile } from '../signature-units/registry';

/** Canonical product facts for Signature Unit Product Breakdown — single source of truth. */
export type SignatureUnitCanonicalSpecs = {
  unitId: WigUnitKey;
  displayName: string;
  origin: string;
  pattern: 'STRAIGHT' | 'WAVY' | 'CURLY';
  density: string;
  colorPhrase: string;
  lace: string;
  hairline: string;
  cap: string;
  lengths: string;
  signatureFeatures: readonly string[];
};

const LACE_SPEC = '13×6 HD FILM LACE';
const HAIRLINE_SPEC = 'PRE-PLUCKED HAIRLINE';
const CAP_SPEC = 'BREATHABLE STRETCH CAP';

export function getSignatureUnitCanonicalSpecs(
  unitId: WigUnitKey,
): SignatureUnitCanonicalSpecs | null {
  const profile = getSignatureUnitEducationProfile(unitId);
  if (!profile) return null;

  const pdp = getUnitPdpDetailsConfig(unitId);
  const spec = {
    origin: pdp.bullets[0]?.match(/RAW (\w+)/)?.[1] ?? profile.hairOrigin ?? 'PREMIUM',
    pattern:
      profile.textureFamily === 'straight'
        ? ('STRAIGHT' as const)
        : profile.textureFamily === 'wavy'
          ? ('WAVY' as const)
          : ('CURLY' as const),
    density: profile.density ?? pdp.bullets.find((b) => b.includes('DENSITY'))?.match(/\d+%/)?.[0] ?? '200%',
  };

  return {
    unitId,
    displayName: profile.displayName,
    origin: spec.origin,
    pattern: spec.pattern,
    density: spec.density,
    colorPhrase: pdp.bullets.find((b) => b.includes('COLOR'))?.includes('BLONDE')
      ? 'PLATINUM BLONDE'
      : 'OFF BLACK',
    lace: LACE_SPEC,
    hairline: HAIRLINE_SPEC,
    cap: CAP_SPEC,
    lengths: '16" – 30"',
    signatureFeatures: pdp.signatureFeatures,
  };
}

export function signatureUnitCoreSpecLine(unitId: WigUnitKey): string {
  const specs = getSignatureUnitCanonicalSpecs(unitId);
  if (!specs) return '';
  const hairLabel = specs.pattern.charAt(0) + specs.pattern.slice(1).toLowerCase();
  return `${specs.lace} · RAW ${specs.origin} ${hairLabel.toUpperCase()} · ${specs.density}`;
}
