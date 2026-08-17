import type { ReactNode } from 'react';
import { useState } from 'react';
import { AioContextRail } from './AioContextRail';
import type { ContextRailConfig, ContextRailItem } from './types';
import { useContextRailScrollSpy } from './useContextRailScrollSpy';

type Props = {
  config?: ContextRailConfig | null;
  children: ReactNode;
  /** Enable scroll-spy highlighting for items with scrollTarget */
  scrollSpy?: boolean;
};

export function AioDesktopContextShell({ config, children, scrollSpy = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeScrollId = useContextRailScrollSpy(config?.items, scrollSpy);

  if (!config) {
    return <>{children}</>;
  }

  const itemsWithSpy =
    scrollSpy && activeScrollId
      ? config.items?.map((item) =>
          item.scrollTarget
            ? { ...item, state: item.id === activeScrollId ? ('current' as const) : item.state }
            : item,
        )
      : config.items;

  const railConfig: ContextRailConfig = { ...config, items: itemsWithSpy };

  const onItemClick = (_item: ContextRailItem) => {
    setDrawerOpen(false);
  };

  return (
    <div className="acr-shell">
      <div className="acr-shell__frame">
        <AioContextRail config={railConfig} onItemClick={onItemClick} />

        {drawerOpen && (
          <button
            type="button"
            className="acr-drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close context panel"
          />
        )}
        <div className={`acr-drawer ${drawerOpen ? 'acr-drawer--open' : ''}`} aria-hidden={!drawerOpen}>
          <AioContextRail config={railConfig} onItemClick={onItemClick} />
        </div>

        <div className="acr-workspace">
          <div className="acr-workspace__mobile-bar">
            <button type="button" className="acr-workspace__menu" onClick={() => setDrawerOpen(true)} aria-label="Open page context">
              <MenuIcon />
            </button>
            <span className="acr-workspace__mobile-title">{config.eyebrow ?? config.title}</span>
          </div>
          <div className="acr-workspace__content">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
