import { useCallback, useId, useMemo, useState } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import {
  PRODUCT_EDUCATION_SECTION_TAGLINE,
  getProductEducationHeroGuide,
  getProductEducationSupportGuides,
  listProductEducationGuides,
  listSignatureUnitGuideLinks,
  resolveProductEducationGuidePack,
  type ProductEducationGuideEntry,
} from './productEducationPresentation';
import type { WigUnitSlug } from '../../../content/education/care/productCatalog';
import { getProductBreakdownPresentationEntryByUnitId } from './productBreakdownPresentation';
import type { ProductBreakdownPresentationEntry } from './productBreakdownPresentation';
import { ProductEducationGuideCard } from './ProductEducationGuideCard';
import {
  LearnSectionHeaderRow,
  LearnSectionTagline,
  LearnSectionTitle,
  LearnSectionViewAllToggle,
} from './LearnBrowseChrome';

type ProductEducationLearnSectionProps = {
  onSelectPack: (pack: LoungeContentPack) => void;
  onOpenProductBreakdown?: (entry: ProductBreakdownPresentationEntry) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  onOpenCareLibrary?: () => void;
};

export function ProductEducationLearnSection({
  onSelectPack,
  onOpenProductBreakdown,
  onToggleSave,
  onOpenCareLibrary,
}: ProductEducationLearnSectionProps) {
  const stageId = useId();
  const [expanded, setExpanded] = useState(false);

  const heroGuide = useMemo(() => getProductEducationHeroGuide(), []);
  const supportGuides = useMemo(() => getProductEducationSupportGuides(), []);
  const signatureUnits = useMemo(() => listSignatureUnitGuideLinks(), []);
  const allGuides = useMemo(() => listProductEducationGuides(), []);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleExplore = useCallback(
    (guide: ProductEducationGuideEntry) => {
      if (guide.opensCareLibrary) {
        onOpenCareLibrary?.();
        return;
      }
      const pack = resolveProductEducationGuidePack(guide);
      if (pack) onSelectPack(pack);
    },
    [onOpenCareLibrary, onSelectPack],
  );

  if (!allGuides.length) return null;

  return (
    <section
      data-lounge-tv-rail="learn-product-education"
      className="lounge-tv-product-education-section"
      style={{ width: '100%', minWidth: 0 }}
    >
      <header>
        <LearnSectionTitle title="PRODUCT EDUCATION" />
        <LearnSectionTagline spacingVariant="education">{PRODUCT_EDUCATION_SECTION_TAGLINE}</LearnSectionTagline>
      </header>

      <LearnSectionHeaderRow
        meta={`${allGuides.length} GUIDE${allGuides.length === 1 ? '' : 'S'}`}
        toggle={
          <LearnSectionViewAllToggle
            expanded={expanded}
            onToggle={toggleExpanded}
            expandLabel="VIEW ALL GUIDES >"
            collapseLabel="COLLAPSE"
            focusId="product-education-view-all"
            controlsId={stageId}
          />
        }
      />

      <div
        id={stageId}
        className={
          expanded
            ? 'lounge-tv-product-education-stage lounge-tv-product-education-stage--expanded'
            : 'lounge-tv-product-education-stage lounge-tv-product-education-stage--preview'
        }
        data-lounge-tv-product-education-expanded={expanded ? 'true' : 'false'}
      >
        {!expanded ? (
          <div className="lounge-tv-product-education-preview">
            {heroGuide ? (
              <ProductEducationGuideCard
                guide={heroGuide}
                variant="hero"
                onExplore={handleExplore}
                onToggleSave={heroGuide.packId && onToggleSave ? onToggleSave : undefined}
                savePack={
                  heroGuide.packId ? resolveProductEducationGuidePack(heroGuide) : undefined
                }
              />
            ) : null}
            <div className="lounge-tv-product-education-support-grid">
              {supportGuides.map((guide) => (
                <ProductEducationGuideCard
                  key={guide.id}
                  guide={guide}
                  variant="support"
                  onExplore={handleExplore}
                  onToggleSave={guide.packId && onToggleSave && !guide.opensCareLibrary ? onToggleSave : undefined}
                  savePack={
                    guide.packId && !guide.opensCareLibrary
                      ? resolveProductEducationGuidePack(guide)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="lounge-tv-product-education-expanded">
            {allGuides.map((guide) => (
              <div key={guide.id} className="lounge-tv-product-education-expanded-category">
                <h3
                  style={{
                    margin: `0 0 ${loungeTvGlassCqw(0.65, 1.5, 3)}`,
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l2,
                    color: LOUNGE_TV_TEXT_WHITE,
                    letterSpacing: '0.06em',
                  }}
                >
                  {guide.title}
                </h3>
                <div className="lounge-tv-product-education-expanded-row">
                  {guide.id === 'signature-units' ? (
                    signatureUnits.map((unit) => {
                      const pack = resolveProductEducationGuidePack({ ...guide, packId: unit.packId });
                      if (!pack) return null;
                      const breakdownEntry = getProductBreakdownPresentationEntryByUnitId(
                        unit.unitId as WigUnitSlug,
                      );
                      return (
                        <ProductEducationGuideCard
                          key={unit.unitId}
                          guide={{
                            ...guide,
                            id: 'signature-units',
                            title: unit.displayName,
                            descriptor: unit.descriptor,
                            packId: unit.packId,
                          }}
                          variant="compact"
                          onExplore={() => {
                            if (breakdownEntry && onOpenProductBreakdown) {
                              onOpenProductBreakdown(breakdownEntry);
                              return;
                            }
                            if (pack) onSelectPack(pack);
                          }}
                          onToggleSave={onToggleSave}
                          savePack={pack}
                        />
                      );
                    })
                  ) : (
                    <ProductEducationGuideCard
                      guide={guide}
                      variant={guide.hero ? 'hero' : 'support'}
                      onExplore={handleExplore}
                      onToggleSave={
                        guide.packId && onToggleSave && !guide.opensCareLibrary ? onToggleSave : undefined
                      }
                      savePack={
                        guide.packId && !guide.opensCareLibrary
                          ? resolveProductEducationGuidePack(guide)
                          : undefined
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
