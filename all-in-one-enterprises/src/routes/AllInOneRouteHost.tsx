import { Suspense } from 'react';
import '../styles/aio.css';
import '../styles/aio-mgmt.css';
import { AllInOneRoutesLazy, AllInOneLoading } from './index';

/** Host shell — loads isolated styles before lazy route chunk. */
export default function AllInOneRouteHost() {
  return (
    <Suspense fallback={<AllInOneLoading />}>
      <AllInOneRoutesLazy />
    </Suspense>
  );
}
