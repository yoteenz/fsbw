import type { CrystalTextProps } from '../tokens/types';
import { CrystalTextBase } from './CrystalTextBase';

export function CrystalTitle(props: CrystalTextProps) {
  return <CrystalTextBase {...props} as={props.as ?? 'h1'} size={props.size ?? 'display'} />;
}
