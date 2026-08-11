import type {
  PSATodayEpisode,
  PSATodayPlayerPhase,
  PSAEpisodeEntitlement,
  PSAWatchSession,
} from './types';
import type { ResolvedEducationUnitContext } from '../../../content/education/signature-units';
import { resolvePsaTodayMediaSlot } from './psaTodayCatalog';
import { resolvePsaWatchPolicy, qualificationThresholdSeconds } from './psaWatchPolicy';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../loungeTvTheme';
import { isLoungeTvDebugUiEnabled } from '../loungeTvDebugUi';

type PSATodayDebugInspectorProps = {
  episode: PSATodayEpisode;
  phase: PSATodayPlayerPhase;
  entitlement: PSAEpisodeEntitlement | null;
  entitlementLoading?: boolean;
  ticketCost: number;
  activeChapterId?: string;
  contentId: string;
  resumeSec: number;
  session?: PSAWatchSession | null;
  thresholdSec?: number;
  paidLessonActive?: boolean;
  onRefreshEntitlement?: () => void;
  unitContext?: ResolvedEducationUnitContext;
  chapterMediaSource?: string;
};

const SLOTS = [
  'cameraAPreview',
  'cameraAPoster',
  'classKitImage',
  'cameraBVideo',
  'heroPoster',
] as const;

export function PSATodayDebugInspector(props: PSATodayDebugInspectorProps) {
  if (!isLoungeTvDebugUiEnabled()) return null;

  const policy = resolvePsaWatchPolicy(props.episode);
  const lessonDuration = props.episode.runtimeSeconds ?? 0;
  const threshold =
    props.thresholdSec ??
    qualificationThresholdSeconds(lessonDuration, policy.qualificationPercent);
  const qualificationPct =
    threshold > 0 && props.session
      ? Math.round((props.session.actualWatchedSeconds / threshold) * 100)
      : 0;

  const mastery = props.episode.masteryId
    ? getEducationMasteryById(props.episode.masteryId)
    : undefined;
  const activeChapter = props.episode.chapters?.find((c) => c.id === props.activeChapterId);

  return (
    <details
      style={{
        marginTop: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1, 2.5, 5),
        background: 'rgba(0,80,120,0.12)',
        border: '1px dashed rgba(0,151,167,0.6)',
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'none',
      }}
    >
      <summary style={{ cursor: 'pointer', letterSpacing: '0.04em' }}>PSA TODAY DEBUG</summary>
      {props.onRefreshEntitlement ? (
        <button type="button" onClick={props.onRefreshEntitlement} style={{ marginTop: 8 }}>
          Refresh entitlement
        </button>
      ) : null}
      <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(
          {
            mastery: mastery?.title ?? props.episode.masteryId ?? null,
            episode:
              props.episode.seasonEpisodeNumber != null
                ? `${String(props.episode.seasonEpisodeNumber).padStart(2, '0')} — ${props.episode.title}`
                : props.episode.title,
            unitContext: props.unitContext?.generalMode
              ? 'general'
              : props.unitContext?.learnerUnitId ?? null,
            unitContextSource: props.unitContext?.contextSource ?? null,
            continuityUnit: props.unitContext?.continuityUnitId ?? null,
            demonstrationUnit: props.unitContext?.demonstrationUnitId ?? null,
            chapter: activeChapter?.label ?? props.activeChapterId ?? null,
            mediaSource: props.chapterMediaSource ?? null,
            curriculumStatus: props.episode.unitEducation?.curriculumApprovalNote ?? null,
            episodeId: props.episode.id,
            slug: props.episode.slug,
            phase: props.phase,
            entitlementLoading: props.entitlementLoading,
            entitlementId: props.entitlement?.id ?? null,
            redeemedAt: props.entitlement?.redeemedAt ?? null,
            expiresAt: props.entitlement?.expiresAt ?? null,
            status: props.entitlement?.status ?? null,
            totalWatches: props.entitlement?.totalWatches ?? null,
            watchesUsed: props.entitlement?.watchesUsed ?? null,
            watchesRemaining: props.entitlement?.watchesRemaining ?? null,
            pendingWatchSeconds: props.entitlement?.pendingWatchSeconds ?? null,
            slayTicketCost: props.ticketCost,
            unlockContentId: props.contentId,
            activeChapterId: props.activeChapterId,
            resumeSec: props.resumeSec,
            watchPolicy: policy,
            activeSessionId: props.session?.sessionId ?? null,
            actualWatchedSeconds: props.session?.actualWatchedSeconds ?? null,
            qualificationThresholdSeconds: threshold,
            qualificationPercent: `${qualificationPct}%`,
            sessionQualified: props.session?.qualified ?? false,
            paidLessonActive: props.paidLessonActive ?? false,
            mediaSlots: Object.fromEntries(
              SLOTS.map((slot) => [slot, resolvePsaTodayMediaSlot(props.episode, slot) ?? null])
            ),
          },
          null,
          2
        )}
      </pre>
    </details>
  );
}
