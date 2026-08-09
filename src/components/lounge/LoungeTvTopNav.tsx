import type { LoungeTvMainTab } from './loungeTvContent';
import { LOUNGE_TV_MAIN_TABS } from './loungeTvContent';
import { loungeTvGlassCqw } from './loungeTvResponsive';

type LoungeTvTopNavProps = {
  activeTab: LoungeTvMainTab;
  onTabChange: (tab: LoungeTvMainTab) => void;
  liveIndicator?: boolean;
};

export function LoungeTvTopNav({ activeTab, onTabChange, liveIndicator }: LoungeTvTopNavProps) {
  return (
    <nav
      data-lounge-tv-rail="top-nav"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        flexShrink: 0,
        gap: loungeTvGlassCqw(0.8, 2, 4),
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: loungeTvGlassCqw(0.6, 1.5, 3),
      }}
      aria-label="Lounge TV categories"
    >
      {LOUNGE_TV_MAIN_TABS.map((tab) => {
        const active = activeTab === tab.id;
        const isLiveTab = tab.id === 'live';
        return (
          <button
            key={tab.id}
            type="button"
            data-lounge-tv-tab={tab.id}
            data-lounge-tv-focusable
            data-lounge-tv-focus-id={`tab-${tab.id}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: 'relative',
              fontFamily: '"Futura PT Medium", Futura, sans-serif',
              fontSize: loungeTvGlassCqw(3.2, 8.5, 13),
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: active ? '#ffffff' : '#8a8a8a',
              background: 'none',
              border: 'none',
              padding: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0`,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              outline: 'none',
              transition: 'color 0.15s ease, transform 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.color = active ? '#ffffff' : '#cccccc';
            }}
            onBlur={(e) => {
              e.currentTarget.style.color = active ? '#ffffff' : '#8a8a8a';
            }}
          >
            {tab.label}
            {isLiveTab && liveIndicator ? (
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  marginLeft: loungeTvGlassCqw(0.35, 0.8, 1.6),
                  width: loungeTvGlassCqw(0.55, 1.3, 2.6),
                  height: loungeTvGlassCqw(0.55, 1.3, 2.6),
                  borderRadius: '50%',
                  background: '#EB1C24',
                  verticalAlign: 'middle',
                }}
              />
            ) : null}
            {active ? (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: loungeTvGlassCqw(0.25, 0.6, 1.2),
                  background: '#EB1C24',
                }}
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
