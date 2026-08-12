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
import { LearnSectionNavHeader } from './LearnSectionNavHeader';
import type { LearnSectionSurface } from './learnHubTypes';
import { LEARN_HUB_NAV_FOCUS_IDS } from './learnHubTypes';
import {
  LearnSectionHeaderRow,
  LearnSectionViewAllLink,
} from './LearnBrowseChrome';

type ProductEducationLearnSectionProps = {
  onSelectPack: (pack: LoungeContentPack) => void;
  onOpenProductBreakdown?: (entry: ProductBreakdownPresentationEntry) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  onOpenCareLibrary?: () => void;
  surface?: LearnSectionSurface;
  onOpenHub?: () => void;
};

export function ProductEducationLearnSection({
  onSelectPack,
  onOpenProductBreakdown,
  onToggleSave,
  onOpenCareLibrary,
  surface = 'compact',
  onOpenHub,
}: ProductEducationLearnSectionProps) {
  const stageId = useId();
  const hubMode = surface === 'hub';
  const [expanded, setExpanded] = useState(hubMode);

  const heroGuide = useMemo(() => getProductEducationHeroGuide(), []);
  const supportGuides = useMemo(() => getProductEducationSupportGuides(), []);
  const signatureUnits = useMemo(() => listSignatureUnitGuideLinks(), []);
  const allGuides = useMemo(() => listProductEducationGuides(), []);

  const handleExplore = useCallback(
    (guide: ProductEducationGuideEntry) => {
      if (guide.opensCareLibrary) {
        onOpenCareLibrary?.();
        return;
      }
      if (hubMode) {
        const pack = resolveProductEducationGuidePack(guide);
        if (pack) onSelectPack(pack);
        return;
      }
      setExpanded(true);
    },
    [hubMode, onOpenCareLibrary, onSelectPack],
  );

  const handleSignatureUnitExplore = useCallback(
    (unit: (typeof signatureUnits)[number]) => {
      if (hubMode) {
        const pack = resolveProductEducationGuidePack({
          id: 'signature-units',
          title: unit.displayName,
          descriptor: unit.descriptor,
          packId: unit.packId,
        } as ProductEducationGuideEntry);
        const breakdownEntry = getProductBreakdownPresentationEntryByUnitId(
          unit.unitId as WigUnitSlug,
        );
        if (breakdownEntry && onOpenProductBreakdown) {
          onOpenProductBreakdown(breakdownEntry);
          return;
        }
        if (pack) onSelectPack(pack);
        return;
      }
      setExpanded(true);
    },
    [hubMode, onOpenProductBreakdown, onSelectPack],
  );

  if (!allGuides.length) return null;

  return (
    <section
      data-lounge-tv-rail={hubMode ? 'learn-hub-product-education' : 'learn-product-education'}
      className="lounge-tv-product-education-section"
      style={{ width: '100%', minWidth: 0 }}
    >
      {!hubMode ? (
        <LearnSectionNavHeader
          title="PRODUCT EDUCATION"
          tagline={PRODUCT_EDUCATION_SECTION_TAGLINE}
          onNavigate={onOpenHub}
          focusId={LEARN_HUB_NAV_FOCUS_IDS['product-breakdown']}
          taglineSpacing="education"
        />
      ) : null}

      {!hubMode ? (
        <LearnSectionHeaderRow
          meta={`${allGuides.length} GUIDE${allGuides.length === 1 ? '' : 'S'}`}
          toggle={
            onOpenHub ? (
              <LearnSectionViewAllLink
                label="VIEW ALL GUIDES >"
                onNavigate={onOpenHub}
                focusId="product-education-view-all"
              />
            ) : null
          }
        />
      ) : (
        <LearnSectionHeaderRow meta={`${allGuides.length} GUIDE${allGuides.length === 1 ? '' : 'S'}`} />
      )}

      <div
        id={stageId}
        className={
          hubMode || expanded
            ? 'lounge-tv-product-education-stage lounge-tv-product-education-stage--expanded'
            : 'lounge-tv-product-education-stage lounge-tv-product-education-stage--preview'
        }
        data-lounge-tv-product-education-expanded={hubMode || expanded ? 'true' : 'false'}
      >
        {!hubMode && !expanded ? (
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
                          onExplore={() => handleSignatureUnitExplore(unit)}
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
