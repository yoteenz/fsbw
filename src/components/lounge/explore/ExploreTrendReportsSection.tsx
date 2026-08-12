import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { explorePackImage } from './ExploreCardShell';
import { ExploreFranchiseEyebrow, ExploreFranchiseHeader, ExploreFranchiseMeta } from './ExploreFranchiseHeader';
import { ExploreFranchiseSection } from './ExploreFranchiseSection';
import { exploreTrendReportTiles } from './explorePresentation';
import type { ExploreSectionCommonProps, ExploreSectionId, ExploreTrendTopicTile } from './exploreTypes';

const SECTION_ID: ExploreSectionId = 'trend-reports';

const ISSUE_LABELS = ['COLOR', 'TEXTURE', 'SILHOUETTE', 'INSTALL'] as const;

type ExploreTrendReportsSectionProps = ExploreSectionCommonProps;

function tileKey(tile: ExploreTrendTopicTile, index: number): string {
  if (tile.kind === 'pack') return tile.pack.id;
  return tile.id ?? `trend-ph-${index}`;
}

function issueLabel(index: number): string {
  return ISSUE_LABELS[index] ?? 'REPORT';
}

export function ExploreTrendReportsSection({
  onSelect,
  onNavigateSection,
  onOpenSlayForecast,
}: ExploreTrendReportsSectionProps) {
  const tiles = exploreTrendReportTiles();
  const lead = tiles.find((t) => t.kind === 'pack' && t.variant === 'lead');
  const issues = tiles.filter((t) => t !== lead);

  return (
    <ExploreFranchiseSection franchise="trend-reports" ariaLabel="Trend reports">
      <ExploreFranchiseHeader
        title="TREND REPORTS"
        tagline="WHAT IS HAPPENING NOW."
        focusId="explore-nav-trend-reports"
        onNavigate={onNavigateSection ? () => onNavigateSection(SECTION_ID) : undefined}
        navigateAriaLabel="Open Trend Reports hub"
      />
      <div className="lounge-tv-explore-trends__editorial">
        {lead && lead.kind === 'pack' ? (
          <article className="lounge-tv-explore-trends__feature">
            <button
              type="button"
              className="lounge-tv-explore-trends__feature-hit"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`explore-trend-lead-${lead.pack.id}`}
              onClick={() => onSelect(lead.pack)}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-explore-trends__feature-cover">
                <img
                  src={explorePackImage(lead.pack, 'portrait')}
                  alt=""
                  className="lounge-tv-explore-trends__feature-image"
                  loading="lazy"
                  decoding="async"
                />
                <span className="lounge-tv-explore-trends__feature-veil" aria-hidden />
                <ExploreFranchiseEyebrow>CURRENT ISSUE</ExploreFranchiseEyebrow>
              </span>
              <span className="lounge-tv-explore-trends__feature-copy">
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_DEMI,
                    fontSize: LOUNGE_TV_TYPE.l1,
                    color: LOUNGE_TV_TEXT_WHITE,
                    letterSpacing: '0.05em',
                    display: 'block',
                    lineHeight: 1.08,
                  }}
                >
                  {lead.pack.title}
                </span>
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_BOOK,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_TEXT_GRAY,
                    letterSpacing: '0.04em',
                    display: 'block',
                    marginTop: '0.5em',
                    lineHeight: 1.45,
                  }}
                >
                  WHAT&apos;S MOVING NOW.
                  <br />
                  WHAT&apos;S NEXT.
                  <br />
                  WHAT&apos;S WORTH KEEPING.
                </span>
                <span className="lounge-tv-explore-trends__feature-actions">
                  <span
                    className="lounge-tv-explore-trends__feature-cta"
                    style={{
                      fontFamily: LOUNGE_TV_FONT_MEDIUM,
                      fontSize: LOUNGE_TV_TYPE.l3,
                      color: LOUNGE_TV_TEXT_WHITE,
                      letterSpacing: '0.06em',
                    }}
                  >
                    READ REPORT
                  </span>
                  {contentPackPrimaryRuntimeForCard(lead.pack) ? (
                    <ExploreFranchiseMeta>
                      {contentPackPrimaryRuntimeForCard(lead.pack) as string}
                    </ExploreFranchiseMeta>
                  ) : null}
                </span>
                {onOpenSlayForecast ? (
                  <button
                    type="button"
                    className="lounge-tv-explore-trends__forecast-link"
                    data-lounge-tv-focusable
                    data-lounge-tv-focus-id="explore-trend-lead-forecast"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSlayForecast();
                    }}
                    onFocusCapture={loungeTvFocusGlowIn}
                    onBlurCapture={loungeTvFocusGlowOut}
                    style={{
                      fontFamily: LOUNGE_TV_FONT_MEDIUM,
                      fontSize: LOUNGE_TV_TYPE.l4,
                      color: LOUNGE_TV_BRAND_RED,
                      letterSpacing: '0.06em',
                      marginTop: '0.65em',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'block',
                      textAlign: 'left',
                    }}
                  >
                    VIEW RELATED FORECAST →
                  </button>
                ) : null}
              </span>
            </button>
          </article>
        ) : null}

        <div className="lounge-tv-explore-trends__issues" aria-label="Trend report departments">
          {issues.map((tile, index) => {
            const label = issueLabel(index);
            const title = tile.kind === 'pack' ? tile.pack.title : tile.title;
            const imageSrc =
              tile.kind === 'pack' ? explorePackImage(tile.pack, 'portrait') : tile.imageSrc;
            const disabled = tile.kind === 'placeholder' && tile.comingSoon;
            const focusId =
              tile.kind === 'pack'
                ? `explore-trend-${tile.pack.id}`
                : `explore-trend-ph-${tile.id}`;

            return (
              <button
                key={tileKey(tile, index)}
                type="button"
                className={`lounge-tv-explore-trends__issue lounge-tv-explore-trends__issue--${index + 1}`}
                data-lounge-tv-focusable
                data-lounge-tv-focus-id={focusId}
                disabled={disabled}
                aria-label={title}
                onClick={() => {
                  if (tile.kind === 'pack') onSelect(tile.pack);
                }}
                onFocusCapture={loungeTvFocusGlowIn}
                onBlurCapture={loungeTvFocusGlowOut}
              >
                <span className="lounge-tv-explore-trends__issue-cover">
                  <img src={imageSrc} alt="" loading="lazy" decoding="async" />
                  <span className="lounge-tv-explore-trends__issue-veil" aria-hidden />
                  <span className="lounge-tv-explore-trends__issue-index" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
                <span className="lounge-tv-explore-trends__issue-copy">
                  <ExploreFranchiseMeta>{label}</ExploreFranchiseMeta>
                  <span
                    style={{
                      fontFamily: LOUNGE_TV_FONT_DEMI,
                      fontSize: LOUNGE_TV_TYPE.l3,
                      color: LOUNGE_TV_TEXT_WHITE,
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginTop: '0.25em',
                    }}
                  >
                    {title}
                  </span>
                  {disabled ? <ExploreFranchiseMeta>COMING SOON</ExploreFranchiseMeta> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </ExploreFranchiseSection>
  );
}
