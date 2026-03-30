import type { NavigateFunction } from 'react-router-dom';

const TOOLS_MENU_LINKS = [
  { label: 'GIFT CARD', to: '/tools/gift-card' as const },
  { label: 'ORDER AUTHORIZATION FORM', to: '/tools/order-form' as const }
] as const;

export type ShopMobileMenuToolsTabProps = {
  navigate: NavigateFunction;
  /** Close mobile drawer after navigation (optional). */
  closeMenu?: () => void;
  labelTranslateX?: string;
};

export function ShopMobileMenuToolsTab({ navigate, closeMenu, labelTranslateX = '7px' }: ShopMobileMenuToolsTabProps) {
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
          <span
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '14px',
              color: 'black',
              fontWeight: '500',
              textTransform: 'uppercase',
              transform: `translateX(${labelTranslateX})`
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </>
  );
}
