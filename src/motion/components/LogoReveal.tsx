import type { CrystalTextProps } from '../tokens/types';
import { CrystalLogo } from './CrystalLogo';
import { RevealMask } from './RevealMask';

export type LogoRevealProps = CrystalTextProps & {
  maskDurationMs?: number;
};

export function LogoReveal({
  maskDurationMs,
  preset = 'luxury-reveal',
  ...rest
}: LogoRevealProps) {
  return (
    <RevealMask active durationMs={maskDurationMs}>
      <CrystalLogo {...rest} preset={preset} />
    </RevealMask>
  );
}
