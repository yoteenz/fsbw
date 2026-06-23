import { useEffect, useRef, useState } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { DesktopPenthouseSuiteScene } from '../../../components/desktop-account/DesktopPenthouseSuiteScene';
import DigitalCashHistoryPopup from '../../../components/account/DigitalCashHistoryPopup';
import SlayTicketHistoryPopup from '../../../components/account/SlayTicketHistoryPopup';
import VoucherHistoryPopup from '../../../components/account/VoucherHistoryPopup';
import { getCurrentUser, isMockProfileChromeActive } from '../../../utils/adminAuth';
import { useSlayTickets } from '../../../hooks/useSlayTickets';
import { preloadDesktopRoomBackground } from '../../../utils/desktopRoomBackgroundCache';
import { DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL } from '../../../constants/desktopPenthouseSuite';
import type { PenthouseSuitePopupId } from '../../../constants/desktopPenthouseSuite';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import '../../../components/desktop-account/DesktopPenthouseSuiteScene.css';

const MOCK_DIGITAL_CASH_HISTORY = [
  { date: '2-14-2025', transaction: 'DEPOSIT', amount: 110 },
  { date: '2-10-2025', transaction: 'TIER POINTS', amount: 80 },
  { date: '1-28-2025', transaction: 'TIER POINTS', amount: 40 },
  { date: '1-15-2025', transaction: 'TIER POINTS', amount: 10 },
  { date: '2-8-2025', transaction: 'SUBSCRIPTION', amount: 40 },
  { date: '2-5-2025', transaction: 'CHECKOUT', amount: -25 },
  { date: '1-20-2025', transaction: 'REFERRAL', amount: 20 },
];

export default function DesktopAccountPage() {
  const viewportRef = useRef<HTMLElement>(null);
  const artboard = isDesktopArtboardLayoutActive();
  const [userData, setUserData] = useState(() => getCurrentUser());
  const [activePopup, setActivePopup] = useState<PenthouseSuitePopupId | null>(null);
  const { history: slayTicketHistory } = useSlayTickets(userData);
  const profileUsesMockChrome = Boolean(userData && isMockProfileChromeActive(userData));

  useEffect(() => {
    void preloadDesktopRoomBackground(DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL);
  }, []);

  useEffect(() => {
    const syncUser = () => setUserData(getCurrentUser());
    syncUser();
    window.addEventListener('signInStateChanged', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('signInStateChanged', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  return (
    <div
      className={`desktop-penthouse-suite-page${artboard ? ' desktop-penthouse-suite-page--artboard' : ''}`}
    >
      <NavBar />
      <section ref={viewportRef} className="desktop-penthouse-suite-page__viewport">
        <DesktopPenthouseSuiteScene
          measureRef={viewportRef}
          onOpenPopup={setActivePopup}
        />
      </section>

      <DigitalCashHistoryPopup
        isOpen={activePopup === 'digitalCash'}
        onClose={() => setActivePopup(null)}
        userData={userData}
        fallbackHistory={profileUsesMockChrome ? MOCK_DIGITAL_CASH_HISTORY : []}
      />

      <SlayTicketHistoryPopup
        isOpen={activePopup === 'slayTickets'}
        onClose={() => setActivePopup(null)}
        history={slayTicketHistory}
      />

      <VoucherHistoryPopup
        isOpen={activePopup === 'vouchers'}
        onClose={() => setActivePopup(null)}
        userData={userData}
      />
    </div>
  );
}
