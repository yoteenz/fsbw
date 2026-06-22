import { Navigate } from 'react-router-dom';
import { DESKTOP_GALLERY_PATH } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import { DESKTOP_FLOORS } from '../../../constants/desktopFloors';

const FLOOR = DESKTOP_FLOORS.find((f) => f.path === DESKTOP_GALLERY_PATH)!;

/** Legacy route — members lounge moved to gallery floor (L2). */
export default function DesktopLoungeRedirectPage() {
  return <Navigate to={buildDesktopElevatorHref(FLOOR.path, FLOOR.defaultZoneId)} replace />;
}
