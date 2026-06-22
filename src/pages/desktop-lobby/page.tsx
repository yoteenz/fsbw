import { Navigate } from 'react-router-dom';
import { DESKTOP_PENTHOUSE_PATH } from '../../constants/desktopFloors';
import { DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID } from '../../constants/desktopLobbyPanorama';
import { buildDesktopElevatorHref } from '../../constants/desktopNavQuickRoutes';

/** Legacy path — penthouse experience at `/desktop/penthouse`. */
export default function DesktopLobbyPage() {
  return (
    <Navigate
      to={buildDesktopElevatorHref(DESKTOP_PENTHOUSE_PATH, DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID)}
      replace
    />
  );
}
