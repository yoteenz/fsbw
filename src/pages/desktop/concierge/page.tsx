import DesktopFloorPlaceholder from '../_shared/DesktopFloorPlaceholder';
import { DESKTOP_FLOORS } from '../../../constants/desktopFloors';

const FLOOR = DESKTOP_FLOORS.find((f) => f.path === '/desktop/concierge')!;

export default function DesktopConciergePage() {
  return <DesktopFloorPlaceholder floor={FLOOR} />;
}
