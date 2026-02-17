import { useLocation, Navigate } from 'react-router-dom';
import { isSignedIn } from '../utils/adminAuth';

/**
 * Wraps account routes. Redirects to /sign-in when not signed in,
 * preserving the attempted path in location state so sign-in can redirect back.
 */
export default function AccountRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isSignedIn()) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
