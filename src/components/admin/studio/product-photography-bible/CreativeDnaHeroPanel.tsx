import { CREATIVE_DNA_HERO, CREATIVE_DNA_QUICK_CARDS, type CreativeDnaQuickCard } from './photographyBibleOverviewConfig';
import { PP_VISUAL, ppActionBtn, ppCaption, ppPanelStyle, ppSectionTitle } from './photographyBibleTheme';
import type { PhotographyBibleTabId } from '../../../../utils/adminStudioProductPhotographyBibleDemo';

type CreativeDnaHeroPanelProps = {
  onNavigateTab: (tabId: PhotographyBibleTabId) => void;
};

function QuickCard({ card, onView }: { card: CreativeDnaQuickCard; onView: () => void }) {
  return (
    <article
      className="p-2 flex flex-col gap-1"
      style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${PP_VISUAL.panelBorder}` }}
    >
      <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
        {card.label}
      </p>
      <p style={{ ...ppCaption, fontSize: '7px' }}>
        {card.status.toUpperCase()} · {card.version.toUpperCase()}
      </p>
      <p style={{ ...ppCaption, fontSize: '6px' }}>APPROVED {card.lastApproved}</p>
      <button type="button" style={{ ...ppActionBtn, marginTop: 4, fontSize: '6px', padding: '6px 8px' }} onClick={onView}>
        VIEW DETAILS
      </button>
    </article>
  );
}

export function CreativeDnaHeroPanel({ onNavigateTab }: CreativeDnaHeroPanelProps) {
  return (
    <section
      style={{
        ...ppPanelStyle,
        padding: '14px 12px',
        marginBottom: '12px',
        borderTop: `2px solid ${PP_VISUAL.red}`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)',
      }}
    >
      <p
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
          fontSize: '14px',
          color: PP_VISUAL.red,
          marginBottom: 4,
          lineHeight: 1.2,
        }}
      >
        brand genome · locked
      </p>
      <p style={{ ...ppSectionTitle, fontSize: '11px', color: PP_VISUAL.red, marginBottom: 4 }}>
        {CREATIVE_DNA_HERO.title}
      </p>
      <p style={{ ...ppCaption, color: PP_VISUAL.red, fontSize: '7px', marginBottom: 8 }}>
        STATUS · {CREATIVE_DNA_HERO.status.toUpperCase()}
      </p>
      <p style={{ ...ppCaption, color: PP_VISUAL.black, letterSpacing: '0.02em', lineHeight: 1.55, maxWidth: 720 }}>
        {CREATIVE_DNA_HERO.description}
      </p>
      <p style={{ ...ppCaption, marginTop: 8, fontSize: '7px' }}>{CREATIVE_DNA_HERO.subtitle.toUpperCase()}</p>

      <p style={{ ...ppSectionTitle, marginTop: 14, marginBottom: 8 }}>DNA COMPONENTS</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CREATIVE_DNA_QUICK_CARDS.map((card) => (
          <QuickCard key={card.id} card={card} onView={() => onNavigateTab(card.tabId)} />
        ))}
      </div>
    </section>
  );
}
