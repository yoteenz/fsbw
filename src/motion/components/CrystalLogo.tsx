import type { CrystalTextProps } from '../tokens/types';
import { CrystalTextBase } from './CrystalTextBase';

export function CrystalLogo(props: CrystalTextProps) {
  return (
    <CrystalTextBase
      {...props}
      as={props.as ?? 'div'}
      size={props.size ?? 'logo'}
      preset={props.preset ?? 'luxury-reveal'}
    />
  );
}
