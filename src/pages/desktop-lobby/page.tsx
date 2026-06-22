import { Navigate } from 'react-router-dom';

/** Legacy path — penthouse experience moved to `/desktop/penthouse`. */
export default function DesktopLobbyPage() {
  return <Navigate to="/desktop/penthouse" replace />;
}
