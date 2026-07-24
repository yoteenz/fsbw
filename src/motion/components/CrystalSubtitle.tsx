import type { CrystalTextProps } from '../tokens/types';
import { CrystalTextBase } from './CrystalTextBase';

export function CrystalSubtitle(props: CrystalTextProps) {
  return (
    <CrystalTextBase
      {...props}
      as={props.as ?? 'p'}
      size={props.size ?? 'subtitle'}
      preset={props.preset ?? 'elegant-dissolve'}
    />
  );
}
