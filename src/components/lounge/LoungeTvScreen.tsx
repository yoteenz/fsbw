import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  LOUNGE_TV_SIDEBAR,
  contentPackToTile,
  resolveContentPack,
  type LoungeTvMainTab,
} from './loungeTvContent';
import type { LoungeContentPack } from './loungeTvContentPack';
import { resolveContentPackFormat } from './loungeTvContentPack';
import { LoungeTvInnerLayoutEditor } from './LoungeTvInnerLayoutEditor';
import {
  LOUNGE_TV_CONFIG_UPDATED_EVENT,
  resolveLoungeTvTiles,
} from '../../utils/loungeTvAdminConfig';
import {
  LOUNGE_TV_VIEWED_UPDATED_EVENT,
  markLoungeTvTileViewed,
} from '../../utils/loungeTvViewedTiles';
import {
  LOUNGE_TV_GLASS_PADDING_X,
  LOUNGE_TV_GLASS_PADDING_Y,
  loungeTvGlassCqw,
} from './loungeTvResponsive';
import ConfirmationModal from '../ConfirmationModal';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
  resolveLoungeTvUnlockCost,
  loungeTvTileActionLabel,
} from './loungeTvTicketAccess';
import { useSlayTickets } from '../../hooks/useSlayTickets';
import { unlockLoungeTvContent } from '../../utils/api';
import { redeemPsaEpisode } from './psa-today/psaTodayEntitlementApi';
import { resolvePsaWatchPolicy } from './psa-today/psaWatchPolicy';
import { psaEpisodeContentIdForUnlock, resolvePsaEpisodeTicketCost } from './psa-today/psaTodayAccess';
import { getCurrentUserEmailFromStorage } from '../../utils/perUserStorage';
import { slayTicketPackPdpPath } from '../../utils/slayTicketPacks';
import { useSceneHitRegionConfig } from '../lobby/SceneHitLayoutEditorContext';
import { LoungeTvFeaturedHome, LoungeTvLessonHub } from './LoungeTvFeaturedHome';
import { LoungeTvLearnPanel } from './LoungeTvLearnPanel';
import { LoungeTvExplorePanel } from './LoungeTvExplorePanel';
import { LoungeTvLivePanel } from './LoungeTvLivePanel';
import { LoungeTvContentDetail } from './LoungeTvContentDetail';
import { LoungeTvTopNav } from './LoungeTvTopNav';
import { LoungeTvDebugOverlay } from './LoungeTvDebugOverlay';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import { LoungeTvArticleView } from './LoungeTvArticleView';
import { LoungeTvVideoDetailView } from './LoungeTvVideoDetailView';
import { LoungeTvLibrarySections } from './LoungeTvLibrarySections';
import { LOUNGE_TV_LIBRARY_UPDATED_EVENT, togglePackSaved } from '../../utils/loungeTvLibrary';
import { useLoungeTvFocusNav } from '../../hooks/useLoungeTvFocusNav';
import { saveLoungeTvFocusMemory } from './loungeTvFocusMemory';
import {
  getPsaTodayEpisodeForContentPack,
  getPsaTodayEpisodeById,
  PSATodayEpisodeView,
} from './psa-today';
import { SlayTipViewer } from './slay-tips';
import { CareLessonViewer, CareDebugInspector } from './care';
import { CurriculumDebugInspector } from './curriculum';
import {
  EducationMasteryView,
  EducationSeasonView,
  EducationHierarchyDebugInspector,
} from './education';
import {
  getEducationMasteryById,
  getEducationSeasonById,
  getSlayTipById,
} from '../../content/education';
import { useSeasonPassAccess } from '../../hooks/useSeasonPassAccess';
import { redeemSeasonPass } from './education/seasonPassApi';
import { useCareAccess } from '../../hooks/useCareAccess';
import {
  getCareLessonById,
} from '../../content/education';
import type { SlayTip, CareLesson } from '../../content/education/types';
import type { PSATodayEpisode } from './psa-today/types';
import { trackCareEvent } from './care/careAnalytics';

const LOUNGE_TV_BODY_SIDEBAR_GAP = loungeTvGlassCqw(2.5, 6, 10);
const LOUNGE_TV_STACKED_SECTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: loungeTvGlassCqw(1.5, 4, 8),
};

type TvViewState =
  | { kind: 'browse' }
  | { kind: 'detail'; packId: string }
  | { kind: 'lesson'; packId: string }
  | { kind: 'video'; packId: string }
  | { kind: 'article'; packId: string }
  | { kind: 'psa-episode'; episodeId: string }
  | { kind: 'slay-tip'; tipId: string }
  | { kind: 'care-lesson'; lessonId: string }
  | { kind: 'mastery'; masteryId: string }
  | { kind: 'season'; seasonId: string };

export function LoungeTvScreen({
  mainTab,
  sidebarId,
  onMainTabChange,
  onSidebarChange: _onSidebarChange,
}: {
  mainTab: LoungeTvMainTab;
  sidebarId: string;
  onMainTabChange: (tab: LoungeTvMainTab) => void;
  onSidebarChange: (id: string) => void;
}) {
  void _onSidebarChange;
  const navigate = useNavigate();
  const [userData, setUserData] = useState<Record<string, unknown> | null>(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  });
  const { balance, isUnlocked, unlocks, refresh } = useSlayTickets(userData);
  const {
    unlockedSet: careUnlockedSet,
    isUnlocked: isCareUnlocked,
    purchaseProfiles: carePurchaseProfiles,
    ownedUnits: careOwnedUnits,
    careGuideEntitlements,
    careMasterySeasonAccess,
    unlockedGuideIds: careUnlockedGuideIds,
    loading: careAccessLoading,
    refresh: refreshCareAccess,
  } = useCareAccess();
  const { refresh: refreshSeasonPass } = useSeasonPassAccess();
  const [unlockConfirmPack, setUnlockConfirmPack] = useState<LoungeContentPack | null>(null);
  const [unlockConfirmPsaEpisode, setUnlockConfirmPsaEpisode] = useState<PSATodayEpisode | null>(null);
  const [showNeedMoreTickets, setShowNeedMoreTickets] = useState(false);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [viewState, setViewState] = useState<TvViewState>({ kind: 'browse' });
  const [restoreFocusId, setRestoreFocusId] = useState<string | null>(null);
  const [tilesRevision, setTilesRevision] = useState(0);
  const [viewedRevision, setViewedRevision] = useState(0);
  const [libraryRevision, setLibraryRevision] = useState(0);
  const mediaPanelRef = useRef<HTMLDivElement>(null);
  const sidebar = LOUNGE_TV_SIDEBAR[mainTab];
  const mediaPanelRegion = useSceneHitRegionConfig('lounge-tv-media-panel');

  const tiles = useMemo(
    () => resolveLoungeTvTiles(mainTab, sidebarId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when admin saves TV content
    [mainTab, sidebarId, tilesRevision, viewedRevision]
  );

  const activePack = useMemo(() => {
    if (
      viewState.kind === 'browse' ||
      viewState.kind === 'psa-episode' ||
      viewState.kind === 'slay-tip' ||
      viewState.kind === 'care-lesson' ||
      viewState.kind === 'mastery' ||
      viewState.kind === 'season'
    ) {
      return null;
    }
    return resolveContentPack(viewState.packId) ?? null;
  }, [viewState]);

  const activePsaEpisode = useMemo((): PSATodayEpisode | null => {
    if (viewState.kind === 'psa-episode') {
      return getPsaTodayEpisodeById(viewState.episodeId) ?? null;
    }
    if (viewState.kind === 'video') {
      return getPsaTodayEpisodeForContentPack(viewState.packId) ?? null;
    }
    return null;
  }, [viewState]);

  useEffect(() => {
    const onConfigUpdated = () => setTilesRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_CONFIG_UPDATED_EVENT, onConfigUpdated);
    return () => window.removeEventListener(LOUNGE_TV_CONFIG_UPDATED_EVENT, onConfigUpdated);
  }, []);

  useEffect(() => {
    const syncUser = () => {
      try {
        const raw = localStorage.getItem('currentUser');
        setUserData(raw ? (JSON.parse(raw) as Record<string, unknown>) : null);
      } catch {
        setUserData(null);
      }
    };
    syncUser();
    window.addEventListener('signInStateChanged', syncUser);
    window.addEventListener('storage', syncUser);
    window.addEventListener('slayTicketsUpdated', syncUser);
    return () => {
      window.removeEventListener('signInStateChanged', syncUser);
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('slayTicketsUpdated', syncUser);
    };
  }, []);

  useEffect(() => {
    void refreshCareAccess();
  }, [userData, refreshCareAccess]);

  useEffect(() => {
    const onViewedUpdated = () => setViewedRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_VIEWED_UPDATED_EVENT, onViewedUpdated);
    return () => window.removeEventListener(LOUNGE_TV_VIEWED_UPDATED_EVENT, onViewedUpdated);
  }, []);

  useEffect(() => {
    const onLibraryUpdated = () => setLibraryRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const activeSlayTip = useMemo((): SlayTip | null => {
    if (viewState.kind === 'slay-tip') {
      return getSlayTipById(viewState.tipId) ?? null;
    }
    return null;
  }, [viewState]);

  const activeCareLesson = useMemo((): CareLesson | null => {
    if (viewState.kind === 'care-lesson') {
      return getCareLessonById(viewState.lessonId) ?? null;
    }
    return null;
  }, [viewState]);

  useEffect(() => {
    if (viewState.kind === 'browse') return;
    if (viewState.kind === 'psa-episode') {
      markLoungeTvTileViewed(viewState.episodeId);
      return;
    }
    if (viewState.kind === 'slay-tip') {
      markLoungeTvTileViewed(viewState.tipId);
      return;
    }
    if (viewState.kind === 'care-lesson') {
      markLoungeTvTileViewed(viewState.lessonId);
      return;
    }
    if (viewState.kind === 'mastery') {
      markLoungeTvTileViewed(viewState.masteryId);
      return;
    }
    if (viewState.kind === 'season') {
      markLoungeTvTileViewed(viewState.seasonId);
      return;
    }
    if (
      viewState.kind === 'lesson' ||
      viewState.kind === 'video' ||
      viewState.kind === 'article'
    ) {
      markLoungeTvTileViewed(viewState.packId);
    }
  }, [viewState]);

  useEffect(() => {
    if (mainTab === 'learn' && viewState.kind === 'browse') {
      trackCareEvent('care_guide_opened', { surface: 'learn_tab' });
    }
  }, [mainTab, viewState.kind]);

  useEffect(() => {
    setViewState({ kind: 'browse' });
    setRestoreFocusId(null);
  }, [mainTab, sidebarId]);

  useEffect(() => {
    if (viewState.kind !== 'browse' || !restoreFocusId) return;
    const t = window.setTimeout(() => setRestoreFocusId(null), 400);
    return () => window.clearTimeout(t);
  }, [viewState.kind, restoreFocusId]);

  const handleMainTabClick = useCallback(
    (tab: LoungeTvMainTab) => {
      if (tab === mainTab && viewState.kind !== 'browse') {
        setViewState({ kind: 'browse' });
        return;
      }
      setViewState({ kind: 'browse' });
      onMainTabChange(tab);
    },
    [mainTab, onMainTabChange, viewState.kind]
  );

  const requestContentAccess = useCallback(
    (pack: LoungeContentPack): boolean => {
      const tile = contentPackToTile(pack);
      if (loungeTvContentIsAccessible(tile, unlocks)) return true;
      const cost = resolveLoungeTvUnlockCost(tile, unlocks);
      if (resolveLoungeTvTicketCost(tile) === 0) return true;
      if (balance >= cost) {
        setUnlockConfirmPack(pack);
        setUnlockConfirmPsaEpisode(getPsaTodayEpisodeForContentPack(pack.id) ?? null);
        return false;
      }
      setShowNeedMoreTickets(true);
      return false;
    },
    [balance, unlocks]
  );

  const openPsaEpisode = useCallback((episode: PSATodayEpisode) => {
    setViewState({ kind: 'psa-episode', episodeId: episode.id });
  }, []);

  const openSlayTip = useCallback((tip: SlayTip) => {
    setViewState({ kind: 'slay-tip', tipId: tip.id });
  }, []);

  const openCareLesson = useCallback((lesson: CareLesson) => {
    setViewState({ kind: 'care-lesson', lessonId: lesson.id });
  }, []);

  const playPack = useCallback(
    (pack: LoungeContentPack) => {
      if (!requestContentAccess(pack)) return;
      const format = resolveContentPackFormat(pack);
      if (mainTab === 'learn') {
        setViewState({ kind: 'lesson', packId: pack.id });
        return;
      }
      if (format === 'READ') {
        setViewState({ kind: 'article', packId: pack.id });
        return;
      }
      setViewState({ kind: 'video', packId: pack.id });
    },
    [mainTab, requestContentAccess]
  );

  const openPack = useCallback(
    (pack: LoungeContentPack) => {
      const psaEpisode = getPsaTodayEpisodeForContentPack(pack.id);
      if (psaEpisode) {
        saveLoungeTvFocusMemory({ mainTab, focusId: pack.id });
        setRestoreFocusId(pack.id);
        openPsaEpisode(psaEpisode);
        return;
      }
      saveLoungeTvFocusMemory({ mainTab, focusId: pack.id });
      setRestoreFocusId(pack.id);
      setViewState({ kind: 'detail', packId: pack.id });
    },
    [mainTab, openPsaEpisode]
  );

  const goBackToBrowse = useCallback(() => {
    setViewState({ kind: 'browse' });
  }, []);

  const confirmUnlockAndOpen = useCallback(async () => {
    const pack = unlockConfirmPack;
    if (!pack) return;
    const tile = contentPackToTile(pack);
    const cost = resolveLoungeTvUnlockCost(tile, unlocks);
    setUnlockBusy(true);
    try {
      const email = getCurrentUserEmailFromStorage();
      if (!email) {
        setShowNeedMoreTickets(true);
        setUnlockConfirmPack(null);
        setUnlockConfirmPsaEpisode(null);
        return;
      }

      if (unlockConfirmPsaEpisode) {
        const ep = unlockConfirmPsaEpisode;
        const policy = resolvePsaWatchPolicy(ep);
        const result = await redeemPsaEpisode({
          episodeId: ep.id,
          contentId: psaEpisodeContentIdForUnlock(ep),
          ticketCost: resolvePsaEpisodeTicketCost(ep),
          contentTitle: ep.title,
          includedWatches: policy.includedWatches,
          accessDurationYears: policy.accessDurationYears,
        });
        if ('error' in result) {
          setUnlockConfirmPack(null);
          setUnlockConfirmPsaEpisode(null);
          setShowNeedMoreTickets(true);
          return;
        }
        await refresh();
        setUnlockConfirmPack(null);
        setUnlockConfirmPsaEpisode(null);
        openPsaEpisode(ep);
        return;
      }

      const result = await unlockLoungeTvContent({
        contentId: pack.id,
        ticketCost: pack.ticketCost ?? cost,
        accessType: 'rental',
        contentTitle: pack.title,
      });
      if ('error' in result) {
        setUnlockConfirmPack(null);
        setShowNeedMoreTickets(true);
        return;
      }
      await refresh();
      setUnlockConfirmPack(null);
      playPack(pack);
    } finally {
      setUnlockBusy(false);
    }
  }, [unlockConfirmPack, unlockConfirmPsaEpisode, unlocks, playPack, openPsaEpisode, refresh]);

  useLoungeTvFocusNav({
    enabled: true,
    containerRef: mediaPanelRef,
    restoreFocusId: viewState.kind === 'browse' ? restoreFocusId : null,
    onHome: () => {
      setViewState({ kind: 'browse' });
      onMainTabChange('featured');
    },
    onEscape: () => {
      if (viewState.kind === 'detail') {
        goBackToBrowse();
        return;
      }
      if (viewState.kind !== 'browse') {
        if (viewState.kind === 'video' && mainTab === 'learn') {
          setViewState({ kind: 'lesson', packId: viewState.packId });
        } else if (
          viewState.kind === 'psa-episode' ||
          viewState.kind === 'slay-tip' ||
          viewState.kind === 'care-lesson' ||
          viewState.kind === 'mastery' ||
          viewState.kind === 'season'
        ) {
          setViewState({ kind: 'browse' });
        } else if (viewState.kind === 'lesson' || viewState.kind === 'article') {
          const pack = resolveContentPack(viewState.packId);
          if (pack) setViewState({ kind: 'detail', packId: pack.id });
          else setViewState({ kind: 'browse' });
        } else {
          setViewState({ kind: 'browse' });
        }
      }
    },
  });

  const handleToggleSave = useCallback(() => {
    setLibraryRevision((n) => n + 1);
  }, []);

  const onToggleSavePack = useCallback(
    (pack: LoungeContentPack) => {
      togglePackSaved(pack.id);
      handleToggleSave();
    },
    [handleToggleSave]
  );

  const renderBrowseContent = () => {
    void libraryRevision;

    if (mainTab === 'featured') {
      return (
        <LoungeTvFeaturedHome
          onSelect={openPack}
          onToggleSave={onToggleSavePack}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
        />
      );
    }

    if (mainTab === 'live') {
      return <LoungeTvLivePanel />;
    }

    if (mainTab === 'library') {
      return (
        <div style={LOUNGE_TV_STACKED_SECTIONS_STYLE}>
          {sidebar.map((section) => (
            <LoungeTvLibrarySections
              key={section.id}
              sectionId={section.id}
              onSelect={openPack}
              onToggleSave={onToggleSavePack}
              onSelectSlayTip={openSlayTip}
              onSelectCareLesson={openCareLesson}
              isUnlocked={isUnlocked}
              unlocks={unlocks}
              careUnlockedSet={careUnlockedSet}
            />
          ))}
        </div>
      );
    }

    if (mainTab === 'learn') {
      return (
        <div style={LOUNGE_TV_STACKED_SECTIONS_STYLE}>
          <LoungeTvLearnPanel
            onSelectMastery={(masteryId) => setViewState({ kind: 'mastery', masteryId })}
            onSelectPack={openPack}
            onSelectPsaEpisode={openPsaEpisode}
            onSelectSlayTip={openSlayTip}
            onSelectCareLesson={openCareLesson}
            onToggleSave={onToggleSavePack}
            isUnlocked={isUnlocked}
            unlocks={unlocks}
            careUnlockedSet={careUnlockedSet}
            isCareUnlocked={isCareUnlocked}
          />
          <CareDebugInspector
            purchaseProfiles={carePurchaseProfiles}
            ownedUnits={careOwnedUnits}
            careGuideEntitlements={careGuideEntitlements}
            unlockedGuideIds={careUnlockedGuideIds}
            careMasterySeasonAccess={careMasterySeasonAccess}
            loading={careAccessLoading}
          />
          <CurriculumDebugInspector />
          <EducationHierarchyDebugInspector />
        </div>
      );
    }

    if (mainTab === 'explore') {
      return (
        <LoungeTvExplorePanel
          onSelect={openPack}
          onToggleSave={onToggleSavePack}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
        />
      );
    }

    if (tiles && tiles.length > 0) {
      const packs = tiles
        .map((t) => resolveContentPack(t.id))
        .filter((p): p is LoungeContentPack => Boolean(p));
      return (
        <LoungeTvContentRow
          railId="admin-tiles"
          title={sidebar.find((s) => s.id === sidebarId)?.label ?? 'PROGRAMMING'}
          packs={packs}
          onSelect={openPack}
          onToggleSave={onToggleSavePack}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
        />
      );
    }

    return null;
  };

  const renderDetailContent = () => {
    if (viewState.kind === 'mastery') {
      const mastery = getEducationMasteryById(viewState.masteryId);
      if (!mastery) return null;
      return (
        <EducationMasteryView
          mastery={mastery}
          onBack={() => setViewState({ kind: 'browse' })}
          onSelectSeason={(seasonId) => setViewState({ kind: 'season', seasonId })}
        />
      );
    }

    if (viewState.kind === 'season') {
      const season = getEducationSeasonById(viewState.seasonId);
      if (!season) return null;
      return (
        <EducationSeasonView
          season={season}
          onBack={() => {
            const mastery = getEducationMasteryById(season.masteryId);
            if (mastery) setViewState({ kind: 'mastery', masteryId: mastery.id });
            else setViewState({ kind: 'browse' });
          }}
          onSelectEpisode={(episodeId) => setViewState({ kind: 'psa-episode', episodeId })}
          onRedeemSeasonPass={async (seasonId, ticketCost) => {
            const result = await redeemSeasonPass({ seasonId, ticketCost });
            if ('error' in result) return;
            await refreshSeasonPass();
            await refresh();
          }}
          onGoToRewardsRoom={() => navigate('/desktop/gallery?zone=rewards-gallery')}
        />
      );
    }

    if (viewState.kind === 'care-lesson' && activeCareLesson) {
      return (
        <CareLessonViewer
          lesson={activeCareLesson}
          unlocked={isCareUnlocked(activeCareLesson.id)}
          onBack={() => setViewState({ kind: 'browse' })}
        />
      );
    }

    if (viewState.kind === 'slay-tip' && activeSlayTip) {
      return (
        <SlayTipViewer
          tip={activeSlayTip}
          onBack={() => setViewState({ kind: 'browse' })}
          onViewRelatedPsa={openPsaEpisode}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
          onTicketsRefresh={refresh}
        />
      );
    }

    if (viewState.kind === 'psa-episode' && activePsaEpisode) {
      return (
        <PSATodayEpisodeView
          episode={activePsaEpisode}
          onBack={() => setViewState({ kind: 'browse' })}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
          onTicketsRefresh={refresh}
          onOpenSlayTip={openSlayTip}
        />
      );
    }

    if (!activePack) return null;

    if (viewState.kind === 'detail') {
      const format = resolveContentPackFormat(activePack);
      return (
        <LoungeTvContentDetail
          pack={activePack}
          onBack={goBackToBrowse}
          onPlay={() => playPack(activePack)}
          onSelectRelated={openPack}
          onRead={
            format === 'BOTH' || format === 'READ'
              ? () => setViewState({ kind: 'article', packId: activePack.id })
              : undefined
          }
          unlocks={unlocks}
          isUnlocked={isUnlocked}
          onToggleSave={handleToggleSave}
        />
      );
    }

    if (viewState.kind === 'video' && activePsaEpisode) {
      return (
        <PSATodayEpisodeView
          episode={activePsaEpisode}
          onBack={() => setViewState({ kind: 'browse' })}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
          onTicketsRefresh={refresh}
          onOpenSlayTip={openSlayTip}
        />
      );
    }

    if (viewState.kind === 'lesson') {
      return (
        <LoungeTvLessonHub
          pack={activePack}
          onBack={() => setViewState({ kind: 'detail', packId: activePack.id })}
          onWatch={() => setViewState({ kind: 'video', packId: activePack.id })}
          onRead={() => setViewState({ kind: 'article', packId: activePack.id })}
        />
      );
    }

    if (viewState.kind === 'article') {
      return (
        <LoungeTvArticleView
          pack={activePack}
          onBack={() =>
            mainTab === 'learn'
              ? setViewState({ kind: 'lesson', packId: activePack.id })
              : setViewState({ kind: 'detail', packId: activePack.id })
          }
          onWatchEpisode={() => setViewState({ kind: 'video', packId: activePack.id })}
        />
      );
    }

    if (viewState.kind === 'video') {
      const tile = contentPackToTile(activePack);
      const playBlocked =
        resolveLoungeTvTicketCost(tile) > 0 && !loungeTvContentIsAccessible(tile, unlocks);
      return (
        <LoungeTvVideoDetailView
          pack={activePack}
          onBack={() => {
            if (mainTab === 'learn') setViewState({ kind: 'lesson', packId: activePack.id });
            else setViewState({ kind: 'detail', packId: activePack.id });
          }}
          onReadGuide={() => setViewState({ kind: 'article', packId: activePack.id })}
          playBlocked={playBlocked}
          onPlayBlocked={() => requestContentAccess(activePack)}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
        />
      );
    }

    return null;
  };

  const unlockTile = unlockConfirmPack ? contentPackToTile(unlockConfirmPack) : null;

  return (
    <>
      <div
        ref={mediaPanelRef}
        className="lounge-tv-screen-root"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: `${LOUNGE_TV_GLASS_PADDING_Y} ${LOUNGE_TV_GLASS_PADDING_X} ${loungeTvGlassCqw(3.8, 10, 14)} ${LOUNGE_TV_GLASS_PADDING_X}`,
          boxSizing: 'border-box',
          overflow: 'hidden',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ marginBottom: LOUNGE_TV_BODY_SIDEBAR_GAP, flexShrink: 0 }}>
          <LoungeTvTopNav activeTab={mainTab} onTabChange={handleMainTabClick} />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            minHeight: 0,
            flexDirection: 'column',
          }}
        >
          <LoungeTvDebugOverlay mainTab={mainTab} viewKind={viewState.kind} focusId={restoreFocusId ?? undefined} />
          <LoungeTvInnerLayoutEditor
            regionId="lounge-tv-media-panel"
            label="tv media panel"
            layout={mediaPanelRegion.layout}
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              paddingBottom: loungeTvGlassCqw(2.5, 6, 10),
              boxSizing: 'border-box',
            }}
            debugOutline={{
              backgroundColor: 'rgba(255, 235, 59, 0.18)',
              border: '2px dashed rgba(245, 127, 23, 0.95)',
            }}
          >
            {viewState.kind === 'browse' ? renderBrowseContent() : renderDetailContent()}
          </LoungeTvInnerLayoutEditor>
        </div>
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <>
              <ConfirmationModal
                isOpen={Boolean(unlockConfirmPack)}
                onClose={() => {
                  if (unlockBusy) return;
                  setUnlockConfirmPack(null);
                  setUnlockConfirmPsaEpisode(null);
                }}
                onConfirm={() => void confirmUnlockAndOpen()}
                title={
                  unlockConfirmPsaEpisode
                    ? `USE ${resolvePsaEpisodeTicketCost(unlockConfirmPsaEpisode)} SLAY TICKET(S)?`
                    : unlockTile
                      ? loungeTvTileActionLabel(unlockTile, unlocks) === 'REWATCH'
                        ? `REWATCH WITH ${resolveLoungeTvUnlockCost(unlockTile, unlocks)} SLAY TICKET?`
                        : `UNLOCK WITH ${resolveLoungeTvUnlockCost(unlockTile, unlocks)} SLAY TICKET(S)?`
                      : 'UNLOCK CONTENT'
                }
                message={
                  unlockConfirmPsaEpisode
                    ? `INCLUDES 3 WATCHES AND 1 YEAR OF ACCESS. A WATCH IS USED AFTER YOU VIEW AT LEAST ONE-THIRD OF THE LESSON.`
                    : unlockConfirmPack
                      ? loungeTvTileActionLabel(unlockTile!, unlocks) === 'REWATCH'
                        ? `YOUR LIBRARY ACCESS EXPIRED. SPEND 1 SLAY TICKET TO REWATCH "${unlockConfirmPack.title}" FOR ANOTHER YEAR.`
                        : `SPEND ${resolveLoungeTvUnlockCost(unlockTile!, unlocks)} SLAY TICKET(S) TO ADD "${unlockConfirmPack.title}" TO YOUR LIBRARY FOR 1 YEAR. REWATCHES AFTER EXPIRY COST 1 TICKET.`
                      : ''
                }
                confirmText={
                  unlockConfirmPsaEpisode
                    ? 'USE SLAY TICKETS'
                    : unlockTile && loungeTvTileActionLabel(unlockTile, unlocks) === 'REWATCH'
                      ? 'REWATCH'
                      : 'UNLOCK + WATCH'
                }
                cancelText="CANCEL"
                dataAttribute="lounge-tv-unlock-confirm"
              />

              <ConfirmationModal
                isOpen={showNeedMoreTickets}
                onClose={() => setShowNeedMoreTickets(false)}
                onConfirm={() => {
                  setShowNeedMoreTickets(false);
                  navigate(slayTicketPackPdpPath());
                }}
                title="YOU NEED MORE SLAY TICKETS TO WATCH THIS."
                message="PURCHASE A SLAY TICKET PACK TO UNLOCK LOUNGE TV CONTENT."
                confirmText="BUY SLAY TICKETS"
                cancelText="CANCEL"
                dataAttribute="lounge-tv-need-tickets"
              />
            </>,
            document.body
          )
        : null}
    </>
  );
}
