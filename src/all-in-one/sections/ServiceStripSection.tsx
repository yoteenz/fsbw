import { serviceDivisions } from '../data/mockServices';
import { AIOServiceStrip } from '../components/AIOServiceStrip';

export function ServiceStripSection() {
  return <AIOServiceStrip services={serviceDivisions} />;
}
