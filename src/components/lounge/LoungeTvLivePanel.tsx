import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_SIDEBAR } from './loungeTvContent';
import { LoungeTvLiveProgramming } from './LoungeTvLiveProgramming';
import { LoungeTvLivePlaceholder } from './LoungeTvLivePlaceholder';
import { LoungeTvSectionDivider } from './LoungeTvSectionDivider';

export function LoungeTvLivePanel() {
  const sections = LOUNGE_TV_SIDEBAR.live;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div data-lounge-tv-rail="live-up-next">
        <LoungeTvLiveProgramming />
      </div>

      {sections.length > 0 ? (
        <LoungeTvSectionDivider
          marginTop={loungeTvGlassCqw(2, 5, 10)}
          marginBottom={loungeTvGlassCqw(3, 7, 14)}
        />
      ) : null}

      {sections.map((section, index) => (
        <div key={section.id}>
          <div data-lounge-tv-rail={`live-${section.id}`}>
            <LoungeTvLivePlaceholder section={section} />
          </div>
          {index < sections.length - 1 ? <LoungeTvSectionDivider /> : null}
        </div>
      ))}
    </div>
  );
}
