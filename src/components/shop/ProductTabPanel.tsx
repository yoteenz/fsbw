import type { CSSProperties, ReactNode } from 'react';
import { UNIT_PDP_TAB_ACTIVE_LAYER_STYLE, UNIT_PDP_TAB_PANEL_STYLE } from './unitPdpLayoutConstants';

type ProductTabPanelProps = {
  activeTab: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Single active tab body — remount on switch so inactive tab copy cannot bleed through. */
export function ProductTabPanel({ activeTab, children, className, style }: ProductTabPanelProps) {
  return (
    <div
      className={className ? `product-tab-panel ${className}` : 'product-tab-panel mt-4 space-y-4'}
      style={{ ...UNIT_PDP_TAB_PANEL_STYLE, ...style }}
    >
      <div key={activeTab} style={UNIT_PDP_TAB_ACTIVE_LAYER_STYLE}>
        {children}
      </div>
    </div>
  );
}
