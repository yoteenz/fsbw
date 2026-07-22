import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
  contentPackToTile,
  resolveContentPack,
  type LoungeTvMainTab,
} from './loungeTvContent';
import type { LoungeContentPack } from './loungeTvContentPack';
import { resolveContentPackFormat } from './loungeTvContentPack';
import { contentPacksForExploreSection, contentPacksForLearningPath } from './loungeTvContentPack';
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
  LOUNGE_TV_GLASS_NAV_FONT,
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
import { getCurrentUserEmailFromStorage } from '../../utils/perUserStorage';
import { isPremiumMemberForGatedFeatures } from '../../utils/premiumMemberAccess';
import { slayTicketPackPdpPath } from '../../utils/slayTicketPacks';
import { useSceneHitRegionConfig } from '../lobby/SceneHitLayoutEditorContext';
import { LoungeTvFeaturedHome, LoungeTvLessonHub } from './LoungeTvFeaturedHome';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { LoungeTvArticleView } from './LoungeTvArticleView';
import { LoungeTvVideoDetailView } from './LoungeTvVideoDetailView';
import { LoungeTvLivePlaceholder } from './LoungeTvLivePlaceholder';
import { LoungeTvLibrarySections } from './LoungeTvLibrarySections';
import { LOUNGE_TV_LIBRARY_UPDATED_EVENT, togglePackSaved } from '../../utils/loungeTvLibrary';

const LOUNGE_TV_BODY_SIDEBAR_GAP = loungeTvGlassCqw(2.5, 6, 10);
const LOUNGE_TV_STACKED_SECTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: loungeTvGlassCqw(1.5, 4, 8),
};

type TvViewState =
  | { kind: 'browse' }
  | { kind: 'lesson'; packId: string }
  | { kind: 'video'; packId: string }
  | { kind: 'article'; packId: string };

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
  const [unlockConfirmPack, setUnlockConfirmPack] = useState<LoungeContentPack | null>(null);
  const [showNeedMoreTickets, setShowNeedMoreTickets] = useState(false);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [viewState, setViewState] = useState<TvViewState>({ kind: 'browse' });
  const [tilesRevision, setTilesRevision] = useState(0);
  const [viewedRevision, setViewedRevision] = useState(0);
  const [libraryRevision, setLibraryRevision] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const sidebar = LOUNGE_TV_SIDEBAR[mainTab];
  const mediaPanelRegion = useSceneHitRegionConfig('lounge-tv-media-panel');

  const tiles = useMemo(
    () => resolveLoungeTvTiles(mainTab, sidebarId),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when admin saves TV content
    [mainTab, sidebarId, tilesRevision, viewedRevision]
  );

  const activePack = useMemo(() => {
    if (viewState.kind === 'browse') return null;
    return resolveContentPack(viewState.packId) ?? null;
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
    const onViewedUpdated = () => setViewedRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_VIEWED_UPDATED_EVENT, onViewedUpdated);
    return () => window.removeEventListener(LOUNGE_TV_VIEWED_UPDATED_EVENT, onViewedUpdated);
  }, []);

  useEffect(() => {
    const onLibraryUpdated = () => setLibraryRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  useEffect(() => {
    if (viewState.kind === 'browse') return;
    markLoungeTvTileViewed(viewState.packId);
  }, [viewState]);

  useEffect(() => {
    setViewState({ kind: 'browse' });
  }, [mainTab, sidebarId]);

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
      if (tile.isPremium && !isPremiumMemberForGatedFeatures()) {
        setShowNeedMoreTickets(false);
        navigate('/account/rewards');
        return false;
      }
      if (loungeTvContentIsAccessible(tile, unlocks)) return true;
      const cost = resolveLoungeTvUnlockCost(tile, unlocks);
      if (resolveLoungeTvTicketCost(tile) === 0) return true;
      if (balance >= cost) {
        setUnlockConfirmPack(pack);
        return false;
      }
      setShowNeedMoreTickets(true);
      return false;
    },
    [balance, unlocks, navigate]
  );

  const openPack = useCallback(
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
      openPack(pack);
    } finally {
      setUnlockBusy(false);
    }
  }, [unlockConfirmPack, unlocks, openPack, refresh]);

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

  const mainTabNavStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: '"Futura PT Medium", Futura, sans-serif',
    fontSize: LOUNGE_TV_GLASS_NAV_FONT,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: active ? '#ffffff' : '#9a9a9a',
    background: 'none',
    border: 'none',
    padding: `${loungeTvGlassCqw(0.65, 1, 3)} 0`,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

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
      return (
        <div style={LOUNGE_TV_STACKED_SECTIONS_STYLE}>
          {sidebar.map((section) => (
            <LoungeTvLivePlaceholder key={section.id} section={section} />
          ))}
        </div>
      );
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
              isUnlocked={isUnlocked}
              unlocks={unlocks}
            />
          ))}
        </div>
      );
    }

    if (mainTab === 'learn') {
      return (
        <div style={LOUNGE_TV_STACKED_SECTIONS_STYLE}>
          {sidebar.map((section) => (
            <LoungeTvContentRow
              key={section.id}
              title={section.label}
              packs={contentPacksForLearningPath(section.id)}
              onSelect={openPack}
              onToggleSave={onToggleSavePack}
              isUnlocked={isUnlocked}
              unlocks={unlocks}
              emptyLabel="LESSONS COMING SOON."
            />
          ))}
        </div>
      );
    }

    if (mainTab === 'explore') {
      return (
        <div style={LOUNGE_TV_STACKED_SECTIONS_STYLE}>
          {sidebar.map((section) => (
            <LoungeTvContentRow
              key={section.id}
              title={section.label}
              packs={contentPacksForExploreSection(section.id)}
              onSelect={openPack}
              onToggleSave={onToggleSavePack}
              isUnlocked={isUnlocked}
              unlocks={unlocks}
              emptyLabel="CONTENT COMING SOON."
            />
          ))}
        </div>
      );
    }

    if (tiles && tiles.length > 0) {
      const packs = tiles
        .map((t) => resolveContentPack(t.id))
        .filter((p): p is LoungeContentPack => Boolean(p));
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            columnGap: loungeTvGlassCqw(1.9, 4, 8),
            rowGap: loungeTvGlassCqw(1.9, 4, 8),
            width: '100%',
          }}
        >
          {packs.map((pack) => (
            <LoungeTvContentPackCard
              key={pack.id}
              pack={pack}
              onSelect={openPack}
              onToggleSave={onToggleSavePack}
              isUnlocked={isUnlocked}
              unlocks={unlocks}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const renderDetailContent = () => {
    if (!activePack) return null;

    if (viewState.kind === 'lesson') {
      return (
        <LoungeTvLessonHub
          pack={activePack}
          onBack={() => setViewState({ kind: 'browse' })}
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
              : setViewState({ kind: 'browse' })
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
            else setViewState({ kind: 'browse' });
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
        <nav
          ref={navRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: LOUNGE_TV_BODY_SIDEBAR_GAP,
            flexShrink: 0,
            gap: loungeTvGlassCqw(0.5, 1, 2),
          }}
          aria-label="Lounge TV categories"
        >
          {LOUNGE_TV_MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-lounge-tv-tab={tab.id}
              style={mainTabNavStyle(mainTab === tab.id)}
              onClick={() => handleMainTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            minHeight: 0,
            flexDirection: 'column',
          }}
        >
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
                onClose={() => !unlockBusy && setUnlockConfirmPack(null)}
                onConfirm={() => void confirmUnlockAndOpen()}
                title={
                  unlockTile
                    ? loungeTvTileActionLabel(unlockTile, unlocks) === 'REWATCH'
                      ? `REWATCH WITH ${resolveLoungeTvUnlockCost(unlockTile, unlocks)} SLAY TICKET?`
                      : `UNLOCK WITH ${resolveLoungeTvUnlockCost(unlockTile, unlocks)} SLAY TICKET(S)?`
                    : 'UNLOCK CONTENT'
                }
                message={
                  unlockConfirmPack
                    ? loungeTvTileActionLabel(unlockTile!, unlocks) === 'REWATCH'
                      ? `YOUR LIBRARY ACCESS EXPIRED. SPEND 1 SLAY TICKET TO REWATCH "${unlockConfirmPack.title}" FOR ANOTHER YEAR.`
                      : `SPEND ${resolveLoungeTvUnlockCost(unlockTile!, unlocks)} SLAY TICKET(S) TO ADD "${unlockConfirmPack.title}" TO YOUR LIBRARY FOR 1 YEAR. REWATCHES AFTER EXPIRY COST 1 TICKET.`
                    : ''
                }
                confirmText={
                  unlockTile && loungeTvTileActionLabel(unlockTile, unlocks) === 'REWATCH'
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
