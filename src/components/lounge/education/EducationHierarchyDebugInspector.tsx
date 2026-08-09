import { useMemo, useState } from 'react';
import {
  getAllEducationMasteries,
  getAllEducationSeasons,
  getEducationMasteryById,
  getEducationSeasonById,
  validateEducationProgram,
  resolveSlotPsaEpisode,
  resolveEpisodeReleaseState,
  resolveEpisodeTicketCost,
} from '../../../content/education/hierarchy/catalog';
import { getCurriculumBibleEntryById } from '../../../content/education/curriculum/registry';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { useSeasonPassAccess } from '../../../hooks/useSeasonPassAccess';
import { usePsaSeasonAccess } from '../../../hooks/usePsaSeasonAccess';

export function EducationHierarchyDebugInspector() {
  if (!import.meta.env.DEV) return null;

  const [masteryId, setMasteryId] = useState('mastery-lace');
  const [seasonId, setSeasonId] = useState('season-lace-02-customize-your-lace');
  const issues = useMemo(() => validateEducationProgram(), []);
  const { passes, hasSeasonPass } = useSeasonPassAccess();
  const { access: careMasteryAccess } = usePsaSeasonAccess('season-care-mastery');

  const mastery = getEducationMasteryById(masteryId);
  const season = getEducationSeasonById(seasonId);

  return (
    <details
      style={{
        marginTop: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1, 2.5, 5),
        background: 'rgba(20,60,40,0.14)',
        border: '1px dashed rgba(80,200,120,0.55)',
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'none',
      }}
    >
      <summary style={{ cursor: 'pointer', color: LOUNGE_TV_TEXT_WHITE }}>
        EDUCATION HIERARCHY DEBUG ({issues.length} issues)
      </summary>

      {issues.length > 0 ? (
        <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', color: '#ffb4a2' }}>
          {JSON.stringify(issues.slice(0, 20), null, 2)}
        </pre>
      ) : (
        <p style={{ margin: '10px 0 0', color: '#8fd4a0' }}>Validation: no issues.</p>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <label>
          Mastery
          <select value={masteryId} onChange={(e) => setMasteryId(e.target.value)}>
            {getAllEducationMasteries().map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Season
          <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
            {getAllEducationSeasons().map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(
          {
            mastery: mastery
              ? { id: mastery.id, title: mastery.title, seasonIds: mastery.seasonIds }
              : null,
            season: season
              ? {
                  id: season.id,
                  title: season.title,
                  learningObjective: season.learningObjective,
                  allowSeasonPass: season.allowSeasonPass,
                  allowEpisodePurchase: season.allowEpisodePurchase,
                  seasonTicketCost: season.seasonTicketCost ?? null,
                  hasSeasonPass: hasSeasonPass(season.id),
                  activePasses: passes.filter((p) => p.seasonId === season.id),
                  careMasteryAccess: season.id === 'season-care-mastery' ? careMasteryAccess : undefined,
                  episodes: season.episodeSlots.map((slot) => {
                    const ep = resolveSlotPsaEpisode(slot);
                    const bible = getCurriculumBibleEntryById(slot.curriculumBibleId);
                    return {
                      slotId: slot.slotId,
                      seasonEpisodeNumber: slot.seasonEpisodeNumber,
                      curriculumBibleId: slot.curriculumBibleId,
                      bibleTitle: bible?.title,
                      psaEpisodeId: slot.psaEpisodeId ?? null,
                      releaseState: ep ? resolveEpisodeReleaseState(ep) : 'planned',
                      releaseAt: ep?.releaseAt ?? null,
                      previewAvailableAt: ep?.previewAvailableAt ?? null,
                      episodeTicketCost: ep ? resolveEpisodeTicketCost(ep) : null,
                    };
                  }),
                }
              : null,
          },
          null,
          2
        )}
      </pre>
    </details>
  );
}
