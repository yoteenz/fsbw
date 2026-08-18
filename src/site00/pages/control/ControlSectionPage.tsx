import { ctrlRoomNavLabel } from '../../config/ctrl-room-nav';
import { CtrlRoomShell } from '../../components/control/CtrlRoomShell';
import { useLocation } from 'react-router-dom';

export default function ControlSectionPage() {
  const { pathname } = useLocation();
  const section = ctrlRoomNavLabel(pathname);

  return (
    <CtrlRoomShell>
      <section className="site00-ctrl-section">
        <p className="site00-ctrl-section__lead">
          {section} MODULES WILL APPEAR HERE AS SITE 00 ACCOUNT SERVICES EXPAND.
        </p>
        <p className="site00-ctrl-section__hint">YOUR SESSION AND PROFILE REMAIN CONNECTED TO THE EXISTING ACCOUNT SYSTEM.</p>
      </section>
    </CtrlRoomShell>
  );
}
