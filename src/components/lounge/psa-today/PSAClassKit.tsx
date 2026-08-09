import { useState } from 'react';
import type { PSAClassKit, PSAClassKitItem } from './types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { trackPsaTodayEvent } from './psaTodayAnalytics';
import {
  getAffiliateDisclosure,
  openShoppingRoute,
  resolveClassKitItemShopping,
  resolveFullKitShopping,
  type ShoppingResolution,
} from './psaTodayShopping';
import { PSAFullKitSelector } from './PSAFullKitSelector';

type PSAClassKitProps = {
  episodeId: string;
  kit: PSAClassKit;
  onContinue?: () => void;
};

export function PSAClassKit({ episodeId, kit, onContinue }: PSAClassKitProps) {
  const [activeTool, setActiveTool] = useState<PSAClassKitItem | null>(null);
  const [showFullKit, setShowFullKit] = useState(false);
  const disclosure = getAffiliateDisclosure();

  const handleOpenKit = () => {
    trackPsaTodayEvent('psa_class_kit_opened', { episodeId });
  };

  return (
    <section
      style={{ width: '100%', textTransform: 'uppercase' }}
      onPointerEnter={handleOpenKit}
    >
      <div style={{ marginBottom: loungeTvGlassCqw(0.8, 2, 4) }}>
        <h3
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            color: LOUNGE_TV_TEXT_WHITE,
          }}
        >
          {kit.title ?? 'CLASS KIT'}
        </h3>
        {kit.introText ? (
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            {kit.introText}
          </p>
        ) : null}
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          background: '#111',
          overflow: 'hidden',
          marginBottom: loungeTvGlassCqw(1, 2.5, 5),
        }}
      >
        {kit.flatLayImageUrl ? (
          <img
            src={kit.flatLayImageUrl}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <ClassKitPlaceholder />
        )}

        {kit.tools.map((tool) =>
          tool.hotspot ? (
            <button
              key={tool.id}
              type="button"
              data-lounge-tv-focusable
              aria-label={`Tool ${tool.order}: ${tool.name}`}
              onClick={() => setActiveTool(tool)}
              style={{
                position: 'absolute',
                left: `${tool.hotspot.x * 100}%`,
                top: `${tool.hotspot.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: loungeTvGlassCqw(2.8, 6.5, 13),
                height: loungeTvGlassCqw(2.8, 6.5, 13),
                borderRadius: '50%',
                border: `1px solid ${activeTool?.id === tool.id ? LOUNGE_TV_BRAND_RED : 'rgba(255,255,255,0.65)'}`,
                background:
                  activeTool?.id === tool.id ? 'rgba(235,28,36,0.35)' : 'rgba(0,0,0,0.45)',
                color: LOUNGE_TV_TEXT_WHITE,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
                cursor: 'pointer',
              }}
            >
              {tool.order}
            </button>
          ) : null
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: loungeTvGlassCqw(0.6, 1.5, 3),
          marginBottom: loungeTvGlassCqw(1, 2.5, 5),
        }}
      >
        <button type="button" data-lounge-tv-focusable style={ghostBtn} onClick={() => setActiveTool(null)}>
          VIEW ALL TOOLS
        </button>
        {kit.fullKit ? (
          <button
            type="button"
            data-lounge-tv-focusable
            style={ghostBtn}
            onClick={() => {
              trackPsaTodayEvent('psa_full_kit_clicked', { episodeId });
              setShowFullKit(true);
            }}
          >
            {kit.fullKit.label}
          </button>
        ) : null}
        {onContinue ? (
          <button type="button" data-lounge-tv-focusable style={accentBtn} onClick={onContinue}>
            CONTINUE
          </button>
        ) : null}
      </div>

      {activeTool ? (
        <ToolDetailCard
          tool={activeTool}
          episodeId={episodeId}
          onClose={() => setActiveTool(null)}
        />
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.5, 1.2, 2.4),
          }}
        >
          {kit.tools.map((tool) => (
            <li key={tool.id}>
              <button
                type="button"
                data-lounge-tv-focusable
                onClick={() => setActiveTool(tool)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: `${loungeTvGlassCqw(0.6, 1.5, 3)} 0`,
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: LOUNGE_TV_TEXT_WHITE,
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
                }}
              >
                {tool.order}. {tool.name}
                {tool.required ? '' : ' · OPTIONAL'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {disclosure ? (
        <p
          style={{
            margin: `${loungeTvGlassCqw(1, 2.5, 5)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
          }}
        >
          {disclosure}
        </p>
      ) : null}

      {showFullKit && kit.fullKit ? (
        <PSAFullKitSelector
          resolution={resolveFullKitShopping(kit.fullKit)}
          onClose={() => setShowFullKit(false)}
        />
      ) : null}
    </section>
  );
}

function ToolDetailCard({
  tool,
  episodeId,
  onClose,
}: {
  tool: PSAClassKitItem;
  episodeId: string;
  onClose: () => void;
}) {
  const shopping = resolveClassKitItemShopping(tool);

  return (
    <div
      style={{
        padding: loungeTvGlassCqw(1.2, 3, 6),
        background: 'rgba(0,0,0,0.65)',
        border: '1px solid rgba(255,255,255,0.12)',
        marginBottom: loungeTvGlassCqw(1, 2.5, 5),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: loungeTvGlassCqw(1, 2, 4) }}>
        <h4
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
            color: LOUNGE_TV_TEXT_WHITE,
          }}
        >
          {tool.name}
        </h4>
        <button type="button" data-lounge-tv-focusable onClick={onClose} style={ghostBtn}>
          CLOSE
        </button>
      </div>
      {tool.description ? (
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
            color: LOUNGE_TV_TEXT_GRAY,
          }}
        >
          {tool.description}
        </p>
      ) : null}
      <p
        style={{
          margin: `0 0 ${loungeTvGlassCqw(0.8, 2, 4)}`,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
          color: tool.required ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_GRAY,
        }}
      >
        {tool.required ? 'REQUIRED' : 'OPTIONAL'}
      </p>
      <ShoppingActions
        resolution={shopping}
        onRoute={(dest) => {
          trackPsaTodayEvent('psa_tool_clicked', { episodeId, toolId: tool.id, destination: dest });
        }}
      />
    </div>
  );
}

export function ShoppingActions({
  resolution,
  onRoute,
}: {
  resolution: ShoppingResolution;
  onRoute?: (dest: 'fs' | 'amazon') => void;
}) {
  if (resolution.kind === 'unavailable') {
    return (
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        SHOPPING LINK COMING SOON
      </span>
    );
  }
  if (resolution.kind === 'direct') {
    return (
      <button
        type="button"
        data-lounge-tv-focusable
        style={accentBtn}
        onClick={() => {
          onRoute?.(resolution.route.destination);
          openShoppingRoute(resolution.route);
        }}
      >
        {resolution.route.label}
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.6, 1.5, 3) }}>
      {resolution.routes.map((route) => (
        <button
          key={route.destination}
          type="button"
          data-lounge-tv-focusable
          style={route.destination === 'fs' ? accentBtn : ghostBtn}
          onClick={() => {
            onRoute?.(route.destination);
            openShoppingRoute(route);
          }}
        >
          {route.label}
        </button>
      ))}
    </div>
  );
}

function ClassKitPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 55%, #111 100%)',
      }}
    >
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {import.meta.env.DEV ? 'CLASS KIT SLOT READY' : 'CLASS KIT COMING SOON'}
      </span>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
  letterSpacing: '0.06em',
  padding: `${loungeTvGlassCqw(0.6, 1.5, 3)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.28)',
  color: LOUNGE_TV_TEXT_WHITE,
  cursor: 'pointer',
};

const accentBtn: React.CSSProperties = {
  ...ghostBtn,
  background: 'rgba(235, 28, 36, 0.18)',
  border: `1px solid ${LOUNGE_TV_BRAND_RED}`,
};
