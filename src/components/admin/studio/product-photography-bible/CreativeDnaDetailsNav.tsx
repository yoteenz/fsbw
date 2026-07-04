import { CREATIVE_DNA_DETAIL_ITEMS } from './photographyBibleOverviewConfig';
import { PP_VISUAL, ppCaption, ppPanelStyle, ppSectionTitle } from './photographyBibleTheme';
import type { PhotographyBibleTabId } from '../../../../utils/adminStudioProductPhotographyBibleDemo';

type CreativeDnaDetailsNavProps = {
  onNavigateTab: (tabId: PhotographyBibleTabId) => void;
};

export function CreativeDnaDetailsNav({ onNavigateTab }: CreativeDnaDetailsNavProps) {
  return (
    <section style={{ ...ppPanelStyle, padding: '12px', marginBottom: '12px' }}>
      <p style={ppSectionTitle}>CREATIVE DNA CONTENTS</p>
      <p style={{ ...ppCaption, marginBottom: 10 }}>
        Every product inherits this locked visual system · click to inspect
      </p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {CREATIVE_DNA_DETAIL_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="text-left p-2 transition-opacity hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.88)',
              border: `1px solid ${PP_VISUAL.panelBorder}`,
              cursor: 'pointer',
            }}
            onClick={() => onNavigateTab(item.tabId)}
          >
            <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
              {item.label}
            </p>
            <p style={{ ...ppCaption, fontSize: '7px' }}>{item.hint.toUpperCase()}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
