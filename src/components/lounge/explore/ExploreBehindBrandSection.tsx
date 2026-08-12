import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { explorePackImage } from './ExploreCardShell';
import { ExploreFranchiseHeader, ExploreFranchiseMeta } from './ExploreFranchiseHeader';
import { ExploreFranchiseSection } from './ExploreFranchiseSection';
import { exploreBackstageTiles } from './explorePresentation';
import type { ExploreBackstageTile, ExploreSectionCommonProps, ExploreSectionId } from './exploreTypes';

const SECTION_ID: ExploreSectionId = 'behind-brand';

const PRODUCTION_MARKS = ['FS // BTS', 'STUDIO DAY', 'CAM A', '03:42', 'PACKAGING'] as const;

type ExploreBehindBrandSectionProps = ExploreSectionCommonProps;

function tileKey(tile: ExploreBackstageTile, index: number): string {
  if (tile.kind === 'pack') return tile.pack.id;
  return tile.id ?? `bts-ph-${index}`;
}

function productionMark(index: number): string {
  return PRODUCTION_MARKS[index] ?? 'BTS';
}

export function ExploreBehindBrandSection({
  onSelect,
  onNavigateSection,
}: ExploreBehindBrandSectionProps) {
  const tiles = exploreBackstageTiles(5);

  return (
    <ExploreFranchiseSection franchise="behind-brand" ariaLabel="Behind Frontal Slayer">
      <ExploreFranchiseHeader
        title="BEHIND FRONTAL SLAYER"
        tagline="HOW THE WORLD IS MADE."
        focusId="explore-nav-behind-brand"
        onNavigate={onNavigateSection ? () => onNavigateSection(SECTION_ID) : undefined}
        navigateAriaLabel="Open Behind Frontal Slayer hub"
      />
      <div className="lounge-tv-explore-bts__sheet" aria-label="Production contact sheet">
        {tiles.map((tile, index) => {
          const disabled = tile.kind === 'placeholder' && tile.comingSoon;
          const title = tile.kind === 'pack' ? tile.tileTitle ?? tile.pack.title : tile.title;
          const imageSrc =
            tile.kind === 'pack' ? explorePackImage(tile.pack, 'card') : tile.imageSrc;
          const runtime =
            tile.kind === 'pack'
              ? contentPackPrimaryRuntimeForCard(tile.pack)
              : tile.runtimeLabel;

          return (
            <button
              key={tileKey(tile, index)}
              type="button"
              className={`lounge-tv-explore-bts__frame lounge-tv-explore-bts__frame--${index + 1}`}
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={
                tile.kind === 'pack' ? `explore-bts-${tile.pack.id}` : `explore-bts-ph-${tile.id}`
              }
              disabled={disabled}
              aria-label={title}
              onClick={() => {
                if (tile.kind === 'pack') onSelect(tile.pack);
              }}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
            >
              <span className="lounge-tv-explore-bts__media">
                <img src={imageSrc} alt="" loading="lazy" decoding="async" />
                <span className="lounge-tv-explore-bts__veil" aria-hidden />
                <span className="lounge-tv-explore-bts__mark" aria-hidden>
                  {productionMark(index)}
                </span>
              </span>
              <span className="lounge-tv-explore-bts__copy">
                <span
                  style={{
                    fontFamily: LOUNGE_TV_FONT_DEMI,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_TEXT_WHITE,
                    letterSpacing: '0.04em',
                    display: 'block',
                  }}
                >
                  {title}
                </span>
                <ExploreFranchiseMeta>
                  {disabled ? 'COMING SOON' : runtime ?? 'BEHIND THE BRAND'}
                </ExploreFranchiseMeta>
              </span>
            </button>
          );
        })}
      </div>
    </ExploreFranchiseSection>
  );
}
