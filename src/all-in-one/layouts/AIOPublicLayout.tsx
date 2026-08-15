import { Outlet } from 'react-router-dom';
import { AIONav } from '../components/AIONav';
import { AIOFooter } from '../components/AIOFooter';

export function AIOPublicLayout() {
  return (
    <div className="aio-app">
      <AIONav />
      <main id="aio-main-content">
        <Outlet />
      </main>
      <AIOFooter />
    </div>
  );
}
