import DesktopFloorPlaceholder from '../_shared/DesktopFloorPlaceholder';
import { DESKTOP_FLOORS } from '../../../constants/desktopFloors';

const FLOOR = DESKTOP_FLOORS.find((f) => f.path === '/desktop/slay-cam')!;

export default function DesktopSlayCamPage() {
  return <DesktopFloorPlaceholder floor={FLOOR} />;
}
