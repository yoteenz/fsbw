import type { CSSProperties } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useTutorialOs } from '../tutorial-os';
import { TutorialSearchLauncher } from '../tutorial-os/components/TutorialSearchModal';
import { MANSION_TOUR_ID } from '../tutorial-os/constants';

const TOOLS_MENU_LINKS = [
  { label: 'GIFT CARD', to: '/tools/gift-card' as const },
  { label: 'SLAY TICKETS', to: '/tools/slay-tickets' as const },
  { label: 'ORDER AUTHORIZATION FORM', to: '/tools/order-form' as const },
] as const;

export type ShopMobileMenuToolsTabProps = {
  navigate: NavigateFunction;
  /** Close mobile drawer after navigation (optional). */
  closeMenu?: () => void;
  labelTranslateX?: string;
};

const rowLabelStyle = (labelTranslateX: string): CSSProperties => ({
  fontFamily: '"Futura PT Book"',
  fontSize: '14px',
  color: 'black',
  fontWeight: '500',
  textTransform: 'uppercase',
  transform: `translateX(${labelTranslateX})`,
});

export function ShopMobileMenuToolsTab({ navigate, closeMenu, labelTranslateX = '7px' }: ShopMobileMenuToolsTabProps) {
  const { startTour, openSearchModal } = useTutorialOs();

  return (
    <>
      {TOOLS_MENU_LINKS.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between cursor-pointer"
          onClick={() => {
            navigate(item.to);
            closeMenu?.();
          }}
        >
          <span style={rowLabelStyle(labelTranslateX)}>{item.label}</span>
        </div>
      ))}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => {
          startTour(MANSION_TOUR_ID);
          closeMenu?.();
        }}
      >
        <span style={rowLabelStyle(labelTranslateX)}>ONBOARDING TUTORIAL</span>
      </div>
      <TutorialSearchLauncher
        labelTranslateX={labelTranslateX}
        onOpen={() => {
          openSearchModal();
          closeMenu?.();
        }}
      />
    </>
  );
}
