import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_SIDEBAR } from './loungeTvContent';
import { LoungeTvLiveProgramming } from './LoungeTvLiveProgramming';
import { LoungeTvLivePlaceholder } from './LoungeTvLivePlaceholder';

export function LoungeTvLivePanel() {
  const sections = LOUNGE_TV_SIDEBAR.live;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(2.5, 6, 12), width: '100%' }}>
      <div data-lounge-tv-rail="live-up-next">
        <LoungeTvLiveProgramming />
      </div>
      {sections.map((section) => (
        <div key={section.id} data-lounge-tv-rail={`live-${section.id}`}>
          <LoungeTvLivePlaceholder section={section} />
        </div>
      ))}
    </div>
  );
}
