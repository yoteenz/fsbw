import { useCallback, useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { relatedContentPacks, resolveContentPackFormat } from './loungeTvContentPack';
import { contentPackToTile } from './loungeTvContent';
import { LoungeTvWatchLearnPlayer } from './LoungeTvWatchLearnPlayer';
import { LoungeTvBackButton, LoungeTvCtaButton, loungeTvGlassPanelStyle } from './LoungeTvUiPrimitives';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_GLASS_BORDER,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { markPackCompleted } from '../../utils/loungeTvLibrary';
import { useNavigate } from 'react-router-dom';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';

type LoungeTvVideoDetailViewProps = {
  pack: LoungeContentPack;
  onBack: () => void;
  onReadGuide: () => void;
  playBlocked?: boolean;
  onPlayBlocked?: () => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
};

export function LoungeTvVideoDetailView({
  pack,
  onBack,
  onReadGuide,
  playBlocked = false,
  onPlayBlocked,
  unlocks,
  isUnlocked,
}: LoungeTvVideoDetailViewProps) {
  const navigate = useNavigate();
  const tile = contentPackToTile(pack);
  const related = relatedContentPacks(pack);
  const format = resolveContentPackFormat(pack);
  const [mode, setMode] = useState<'watch' | 'read'>('watch');
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const handleComplete = useCallback(() => {
    markPackCompleted(pack.id);
  }, [pack.id]);

  const canRead = format === 'BOTH' || format === 'READ';

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      {mode === 'watch' && tile.videoSrc ? (
        <LoungeTvWatchLearnPlayer
          tile={tile}
          playBlocked={playBlocked}
          onPlayBlocked={onPlayBlocked}
        />
      ) : null}

      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.8, 4, 8),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.2,
          }}
        >
          {pack.title}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: loungeTvGlassCqw(0.8, 2, 4),
            marginTop: loungeTvGlassCqw(0.4, 1, 2),
            flexWrap: 'wrap',
          }}
        >
          {pack.runtime ? (
            <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(1.3, 3, 6), color: LOUNGE_TV_BRAND_RED }}>
              {pack.runtime}
            </span>
          ) : null}
          {pack.difficulty ? (
            <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(1.3, 3, 6), color: LOUNGE_TV_TEXT_GRAY }}>
              {pack.difficulty}
            </span>
          ) : null}
        </div>
      </div>

      {pack.subtitle ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.3, 3, 6),
            lineHeight: 1.4,
            color: LOUNGE_TV_TEXT_GRAY,
          }}
        >
          {pack.subtitle}
        </p>
      ) : null}

      {canRead ? (
        <div style={{ display: 'flex', gap: loungeTvGlassCqw(0.6, 1.5, 3) }}>
          <button
            type="button"
            onClick={() => setMode('watch')}
            style={{
              flex: 1,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              padding: `${loungeTvGlassCqw(0.7, 1.8, 3.5)} 0`,
              background: mode === 'watch' ? LOUNGE_TV_BRAND_RED : 'rgba(255,255,255,0.06)',
              color: LOUNGE_TV_TEXT_WHITE,
              border: mode === 'watch' ? 'none' : LOUNGE_TV_GLASS_BORDER,
              cursor: 'pointer',
            }}
          >
            WATCH
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('read');
              onReadGuide();
            }}
            style={{
              flex: 1,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              padding: `${loungeTvGlassCqw(0.7, 1.8, 3.5)} 0`,
              background: mode === 'read' ? LOUNGE_TV_BRAND_RED : 'rgba(255,255,255,0.06)',
              color: LOUNGE_TV_TEXT_WHITE,
              border: mode === 'read' ? 'none' : LOUNGE_TV_GLASS_BORDER,
              cursor: 'pointer',
            }}
          >
            READ
          </button>
        </div>
      ) : null}

      {pack.transcript ? (
        <section style={{ ...loungeTvGlassPanelStyle, padding: 0, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setTranscriptOpen((o) => !o)}
            style={{
              width: '100%',
              margin: 0,
              padding: loungeTvGlassCqw(1, 2.5, 5),
              border: 'none',
              background: 'transparent',
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              color: LOUNGE_TV_TEXT_WHITE,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            TRANSCRIPT
            <span style={{ color: LOUNGE_TV_BRAND_RED }}>{transcriptOpen ? '−' : '+'}</span>
          </button>
          {transcriptOpen ? (
            <p
              style={{
                margin: 0,
                padding: `0 ${loungeTvGlassCqw(1, 2.5, 5)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
                lineHeight: 1.4,
                color: LOUNGE_TV_TEXT_GRAY,
                borderTop: LOUNGE_TV_GLASS_BORDER,
              }}
            >
              {pack.transcript}
            </p>
          ) : null}
        </section>
      ) : null}

      {pack.productsUsed?.length ? (
        <section>
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.5, 1.2, 2.5)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            PRODUCTS USED
          </h2>
          {pack.productsUsed.map((p) => (
            <p
              key={p.name}
              style={{
                margin: `0 0 ${loungeTvGlassCqw(0.3, 0.8, 1.5)}`,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
                color: LOUNGE_TV_BRAND_RED,
              }}
            >
              {p.name}
            </p>
          ))}
        </section>
      ) : null}

      {pack.checklist?.length ? (
        <section style={{ ...loungeTvGlassPanelStyle, padding: loungeTvGlassCqw(1, 2.5, 5) }}>
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.5, 1.2, 2.5)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            CHECKLIST
          </h2>
          <ul style={{ margin: 0, paddingLeft: loungeTvGlassCqw(2, 4, 8) }}>
            {pack.checklist.map((item) => (
              <li
                key={item}
                style={{
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
                  color: LOUNGE_TV_TEXT_WHITE,
                  marginBottom: loungeTvGlassCqw(0.3, 0.8, 1.5),
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section>
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.5, 1.2, 2.5)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            RELATED GUIDES
          </h2>
          {related.map((rel) => (
            <p
              key={rel.id}
              style={{
                margin: `0 0 ${loungeTvGlassCqw(0.3, 0.8, 1.5)}`,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
                color: LOUNGE_TV_TEXT_WHITE,
              }}
            >
              {rel.title}
            </p>
          ))}
        </section>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.6, 1.5, 3) }}>
        {(format === 'BOTH' || format === 'READ') ? (
          <LoungeTvCtaButton label="READ GUIDE" onClick={onReadGuide} fullWidth />
        ) : null}
        <LoungeTvCtaButton label="TRY IN BUILD-A-WIG" onClick={() => navigate('/build-a-wig')} fullWidth />
        <LoungeTvCtaButton label="SHOP THIS LOOK" onClick={() => navigate('/home/shop')} variant="ghost" fullWidth />
        {loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked) ||
        resolveLoungeTvTicketCost(tile) === 0 ? (
          <LoungeTvCtaButton label="COMPLETE LESSON" onClick={handleComplete} variant="ghost" fullWidth />
        ) : null}
      </div>
    </div>
  );
}
