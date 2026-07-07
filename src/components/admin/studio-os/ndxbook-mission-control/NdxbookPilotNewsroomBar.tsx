import { MissionQuickLink } from './MissionQuickLink';
import { ndxbookNewsroomQuickLink } from './ndxbookMissionActionRoutes';
import { MC, mcLabel, mcPanel, mcSectionTitle } from './ndxbookMissionControlTheme';

/** Always visible on NDXBOOK Headquarters overview — Project 001 production lives in the Production Wing. */
export function NdxbookPilotNewsroomBar() {
  const newsroomPath = ndxbookNewsroomQuickLink();

  return (
    <section className="p-3 mb-4" style={{ ...mcPanel, borderTop: `3px solid ${MC.accent}` }}>
      <p style={mcSectionTitle}>PROJECT 001 · DIRECT PRODUCTION</p>
      <p style={{ ...mcLabel, marginBottom: 10, lineHeight: 1.45 }}>
        Set creative direction · run Studio Intelligence · approve production · schedule Instagram — all through the Production Wing.
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
        OPEN PRODUCTION · DIRECT PROJECT 001 →
      </MissionQuickLink>
    </section>
  );
}
