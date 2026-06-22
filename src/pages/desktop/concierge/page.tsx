import { Navigate, useSearchParams } from 'react-router-dom';
import { DESKTOP_CONCIERGE_PATH, DESKTOP_FLOORS } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import DesktopFloorZonePage from '../_shared/DesktopFloorZonePage';

const FLOOR = DESKTOP_FLOORS.find((f) => f.path === DESKTOP_CONCIERGE_PATH)!;

export default function DesktopConciergePage() {
  const [searchParams] = useSearchParams();

  if (!searchParams.get('zone')) {
    return <Navigate to={buildDesktopElevatorHref(FLOOR.path, FLOOR.defaultZoneId)} replace />;
  }

  return <DesktopFloorZonePage floor={FLOOR} />;
}
