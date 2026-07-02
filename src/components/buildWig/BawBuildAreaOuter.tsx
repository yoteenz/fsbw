import type { CSSProperties, ReactNode } from 'react';
import { useBawSubscriptionView } from './BawSubscriptionViewContext';

type BawBuildAreaOuterProps = {
  showMobileMenu: boolean;
  children: ReactNode;
  style?: CSSProperties;
};

/** Main bordered build card; drops chrome when subscription chart replaces builder content. */
export function BawBuildAreaOuter({ showMobileMenu, children, style }: BawBuildAreaOuterProps) {
  const { showPremiumChart } = useBawSubscriptionView();
  const chartOpen = showPremiumChart && !showMobileMenu;

  if (chartOpen) {
    return (
      <div className="mb-2 w-full transition-all duration-300 ease-out" data-attribute="baw-build-area-chart">
        {children}
      </div>
    );
  }

  return (
    <div
      className={
        showMobileMenu
          ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'
          : 'border border-black flex flex-col pt-6 pb-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'
      }
      style={{ borderWidth: '1.3px', ...style }}
      data-attribute="baw-build-area"
    >
      {children}
    </div>
  );
}
