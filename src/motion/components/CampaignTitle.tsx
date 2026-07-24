import type { CrystalTextProps } from '../tokens/types';
import { CrystalTextBase } from './CrystalTextBase';

export function CampaignTitle(props: CrystalTextProps) {
  return (
    <CrystalTextBase
      {...props}
      as={props.as ?? 'h1'}
      size={props.size ?? 'display'}
      preset={props.preset ?? 'campaign-intro'}
    />
  );
}
