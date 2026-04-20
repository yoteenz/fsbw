import type { CSSProperties } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { navigateShopMenuSubItem } from '../utils/shopMobileMenuSubNav';

const SHOP_TAB_ITEMS = [
  { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] as const },
  { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] as const },
  { label: 'HD LACE', hasArrow: true, isExpandable: true, subItems: ['CLOSURES', 'FRONTALS'] as const },
  { label: 'BUNDLES', hasArrow: false, isExpandable: false },
  { label: 'BUILD-A-WIG', hasArrow: false, isExpandable: false }
] as const;

type Item = (typeof SHOP_TAB_ITEMS)[number];

function staticNavPath(label: string, buildAWigPath: string): string | null {
  switch (label) {
    case 'BUNDLES':
      return '/shop/bundles';
    case 'BUILD-A-WIG':
      return buildAWigPath;
    default:
      return null;
  }
}

export type ShopMobileMenuShopTabProps = {
  navigate: NavigateFunction;
  mobileMenuExpandedItems: string[];
  handleMobileMenuItemToggle: (label: string) => void;
  /** Called after UNITS (when already expanded), BUNDLES, HD LACE / BOOKING subnav targets, etc. — e.g. BookingFlowLayout closes the drawer. */
  closeSubItemMenu: () => void;
  /** If set, also called after top-level static navigations (BCF, order form, build-a-wig, /shop/units). */
  closeAfterStaticNav?: () => void;
  /** Default `/build-a-wig`. Booking flow uses `/build-a-wig/noir`. */
  buildAWigPath?: string;
  /** When set and user is not signed in, BUILD-A-WIG does not navigate — caller shows sign-in modal. */
  onBuildAWigRequiresSignIn?: () => void;
  /** Required with `onBuildAWigRequiresSignIn` so the tab knows whether to gate. */
  isSignedInForBuildAWig?: boolean;
  labelTranslateX?: string;
  /** Matches pages that attach the same handlers to the outer row for BUILD-A-WIG / BCF static links. */
  duplicateRowClickForStaticLinks?: boolean;
  arrowImgAlt?: string;
};

export function ShopMobileMenuShopTab({
  navigate,
  mobileMenuExpandedItems,
  handleMobileMenuItemToggle,
  closeSubItemMenu,
  closeAfterStaticNav,
  buildAWigPath = '/build-a-wig',
  onBuildAWigRequiresSignIn,
  isSignedInForBuildAWig,
  labelTranslateX = '7px',
  duplicateRowClickForStaticLinks = false,
  arrowImgAlt = 'Arrow'
}: ShopMobileMenuShopTabProps) {
  const handleLabelActivate = (item: Item) => {
    if (item.isExpandable) {
      if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
        navigate('/shop/units');
        closeAfterStaticNav?.();
      } else {
        handleMobileMenuItemToggle(item.label);
      }
      return;
    }
    if (item.label === 'BUILD-A-WIG' && onBuildAWigRequiresSignIn && isSignedInForBuildAWig === false) {
      onBuildAWigRequiresSignIn();
      return;
    }
    const path = staticNavPath(item.label, buildAWigPath);
    if (path) {
      navigate(path);
      closeAfterStaticNav?.();
    }
  };

  const rowOuterClick = (item: Item) => {
    if (!duplicateRowClickForStaticLinks || item.isExpandable) return;
    handleLabelActivate(item);
  };

  const rowCursor = (item: Item): CSSProperties['cursor'] => {
    if (!duplicateRowClickForStaticLinks) return undefined;
    return item.isExpandable ? undefined : 'pointer';
  };

  return (
    <>
      {SHOP_TAB_ITEMS.map((item, index) => (
        <div key={index}>
          <div
            className="flex items-center justify-between"
            style={{ alignItems: 'center', cursor: rowCursor(item) }}
            onClick={() => rowOuterClick(item)}
          >
            <span
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '14px',
                color: 'black',
                fontWeight: '500',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transform: `translateX(${labelTranslateX})`
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleLabelActivate(item);
              }}
            >
              {item.label}
            </span>
            {item.hasArrow && (
              <img
                src="/assets/NOIR/closed-arrow.svg"
                alt={arrowImgAlt}
                style={{
                  width: '16px',
                  height: '16px',
                  transform: mobileMenuExpandedItems.includes(item.label)
                    ? 'translateX(-11px) translateY(-4px) rotate(90deg)'
                    : 'translateX(-11px) translateY(-4px) rotate(0deg)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.isExpandable) handleMobileMenuItemToggle(item.label);
                }}
              />
            )}
          </div>
          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
            <div className="ml-4 mt-2 space-y-2">
              {item.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    navigateShopMenuSubItem(navigate, item.label, subItem, { closeMenu: closeSubItemMenu });
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '14px',
                      color: '#EB1C24',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}
                  >
                    {subItem}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
