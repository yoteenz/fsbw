import type { CrystalTextProps } from '../tokens/types';
import { CrystalTextBase } from './CrystalTextBase';

export function ChapterTitle(props: CrystalTextProps) {
  return (
    <CrystalTextBase
      {...props}
      as={props.as ?? 'h2'}
      size={props.size ?? 'title'}
      preset={props.preset ?? 'morning-reveal'}
    />
  );
}
