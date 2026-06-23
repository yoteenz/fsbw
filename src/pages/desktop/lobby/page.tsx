import { Navigate, useSearchParams } from 'react-router-dom';
import { DESKTOP_LOBBY_PATH, DESKTOP_FLOORS } from '../../../constants/desktopFloors';
import { buildDesktopElevatorHref } from '../../../constants/desktopNavQuickRoutes';
import {
  appendRoomTitleDebugToHref,
  persistRoomTitleDebugFromSearch,
} from '../../../utils/desktopRoomTitlePlacementDebug';
import DesktopFloorZonePage from '../_shared/DesktopFloorZonePage';

const FLOOR = DESKTOP_FLOORS.find((f) => f.path === DESKTOP_LOBBY_PATH)!;

export default function DesktopLobbyFloorPage() {
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
