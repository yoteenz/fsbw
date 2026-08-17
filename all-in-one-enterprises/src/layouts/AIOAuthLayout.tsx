import { Outlet } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';

export function AIOAuthLayout() {
  return (
    <div className="aio-app">
      <AuthShell>
        <Outlet />
      </AuthShell>
    </div>
  );
}
