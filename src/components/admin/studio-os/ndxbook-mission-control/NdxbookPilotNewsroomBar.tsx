import { MissionQuickLink } from './MissionQuickLink';
import { ndxbookNewsroomQuickLink } from './ndxbookMissionActionRoutes';
import { MC, mcLabel, mcPanel, mcSectionTitle } from './ndxbookMissionControlTheme';

/** Always visible on NDXBOOK Headquarters overview — Page 001 review lives in Newsroom, not Production. */
export function NdxbookPilotNewsroomBar() {
  const newsroomPath = ndxbookNewsroomQuickLink();

  return (
    <section className="p-3 mb-4" style={{ ...mcPanel, borderTop: `3px solid ${MC.accent}` }}>
      <p style={mcSectionTitle}>PAGE 001 · REVIEW & APPROVE</p>
      <p style={{ ...mcLabel, marginBottom: 10, lineHeight: 1.45 }}>
        Create · run Studio Intelligence · approve production · schedule Instagram — all on the Newsroom Production Floor.
      </p>
      <MissionQuickLink
        to={newsroomPath}
        className="w-full py-2.5 text-[7px] font-futura uppercase border text-center"
        style={{
          fontWeight: 515,
          color: '#FFF',
          background: MC.accent,
          borderColor: MC.accent,
          textDecoration: 'none',
          display: 'block',
        }}
      >
        OPEN NEWSROOM · REVIEW & APPROVE PAGE 001 →
      </MissionQuickLink>
    </section>
  );
}
