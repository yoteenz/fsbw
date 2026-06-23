import { Navigate, useSearchParams } from 'react-router-dom';
import { DESKTOP_FLOORS, DESKTOP_GALLERY_PATH } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import {
  appendRoomTitleDebugToHref,
  persistRoomTitleDebugFromSearch,
} from '../../../utils/desktopRoomTitlePlacementDebug';
import DesktopFloorZonePage from '../_shared/DesktopFloorZonePage';

const FLOOR = DESKTOP_FLOORS.find((f) => f.path === DESKTOP_GALLERY_PATH)!;

export default function DesktopGalleryPage() {
  const [searchParams] = useSearchParams();
  persistRoomTitleDebugFromSearch(searchParams.toString());

  if (!searchParams.get('zone')) {
    return (
      <Navigate
        to={appendRoomTitleDebugToHref(
          buildDesktopElevatorHref(FLOOR.path, FLOOR.defaultZoneId),
          searchParams,
        )}
        replace
      />
    );
  }

  return <DesktopFloorZonePage floor={FLOOR} />;
}
