import { Outlet, useLocation } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';

export function AIOAuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.endsWith('/login');

  return (
    <div className="aio-app aio-app--auth">
      <AuthShell variant={isLogin ? 'login' : 'default'}>
        <Outlet />
      </AuthShell>
    </div>
  );
}
