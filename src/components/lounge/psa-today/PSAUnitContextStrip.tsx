import type { ResolvedEducationUnitContext } from '../../../content/education/signature-units';
import { getActiveSignatureUnitEducationProfiles } from '../../../content/education/signature-units';
import type { WigUnitSlug } from '../../../content/education/care/productCatalog';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';

type PSAUnitContextStripProps = {
  context: ResolvedEducationUnitContext;
  supportsFollowThisUnit?: boolean;
  onSelectUnit?: (unitId: WigUnitSlug | null) => void;
  onGeneralMode?: () => void;
  demonstrationUnitReason?: string;
};

export function PSAUnitContextStrip({
  context,
  supportsFollowThisUnit,
  onSelectUnit,
  onGeneralMode,
  demonstrationUnitReason,
}: PSAUnitContextStripProps) {
  if (!supportsFollowThisUnit) return null;

  const profiles = getActiveSignatureUnitEducationProfiles();
  const resolvedLabel = context.generalMode
    ? 'GENERAL MODE'
    : context.learnerUnitId?.toUpperCase().replace(/-/g, ' ') ?? 'NOT SELECTED';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(0.5, 1.2, 2.4),
        padding: loungeTvGlassCqw(0.8, 2, 4),
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
        }}
      >
        FOLLOW THIS UNIT: {resolvedLabel}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        CONTEXT: {context.contextSource.replace(/-/g, ' ')}
        {context.multipleOwnedUnits ? ' · SELECT A UNIT TO FOLLOW' : ''}
      </p>
      {(demonstrationUnitReason ?? context.demonstrationUnitReason) ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
            textTransform: 'none',
          }}
        >
          {demonstrationUnitReason ?? context.demonstrationUnitReason}
        </p>
      ) : null}
      {onSelectUnit ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: loungeTvGlassCqw(0.4, 1, 2),
          }}
        >
          {profiles.map((p) => (
            <button
              key={p.unitId}
              type="button"
              data-lounge-tv-focusable
              onClick={() => onSelectUnit(p.unitId)}
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
                letterSpacing: '0.05em',
                padding: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} ${loungeTvGlassCqw(0.6, 1.4, 2.8)}`,
                background:
                  context.learnerUnitId === p.unitId ? 'rgba(235,28,36,0.2)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: LOUNGE_TV_TEXT_WHITE,
                cursor: 'pointer',
              }}
            >
              {p.displayName}
            </button>
          ))}
          {onGeneralMode ? (
            <button
              type="button"
              data-lounge-tv-focusable
              onClick={onGeneralMode}
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
                letterSpacing: '0.05em',
                padding: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} ${loungeTvGlassCqw(0.6, 1.4, 2.8)}`,
                background: context.generalMode ? 'rgba(235,28,36,0.2)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: LOUNGE_TV_TEXT_WHITE,
                cursor: 'pointer',
              }}
            >
              GENERAL
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
