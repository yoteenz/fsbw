import type { CareGuide, CarePurchaseProfile, ResolvedPsaSeasonAccess } from '../../../content/education/types';
import type { ResolvedCareContentEntitlement, YourOwnedUnit } from '../../../content/education/care/ownedUnitModel';
import { getAllCareGuides } from '../../../content/education/care/guides/catalog';
import { getDepositedCareGuideIds } from '../../../utils/careGuideLibrary';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../loungeTvTheme';
import { isLoungeTvDebugUiEnabled } from '../loungeTvDebugUi';

type CareDebugInspectorProps = {
  purchaseProfiles: CarePurchaseProfile[];
  ownedUnits?: YourOwnedUnit[];
  careGuideEntitlements?: ResolvedCareContentEntitlement[];
  unlockedGuideIds: string[];
  guides?: CareGuide[];
  careMasterySeasonAccess?: ResolvedPsaSeasonAccess | null;
  loading?: boolean;
};

export function CareDebugInspector({
  purchaseProfiles,
  ownedUnits = [],
  careGuideEntitlements = [],
  unlockedGuideIds,
  guides = getAllCareGuides(),
  careMasterySeasonAccess,
  loading,
}: CareDebugInspectorProps) {
  if (!isLoungeTvDebugUiEnabled()) return null;

  const deposited = getDepositedCareGuideIds();
  const applicableGuideIds = careGuideEntitlements.map((e) => e.contentId);

  return (
    <details
      style={{
        marginTop: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1, 2.5, 5),
        background: 'rgba(80,40,0,0.12)',
        border: '1px dashed rgba(200,120,40,0.55)',
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'none',
      }}
    >
      <summary style={{ cursor: 'pointer' }}>CARE GUIDE vs CARE MASTERY DEBUG</summary>
      <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(
          {
            loading,
            ownedUnits: ownedUnits.map((u) => ({
              id: u.id,
              displayName: u.displayName,
              productType: u.constructionDna.productType,
              status: u.status,
            })),
            applicableCareGuides: {
              count: applicableGuideIds.length,
              ids: applicableGuideIds,
            },
            libraryDeposited: {
              count: deposited.length,
              ids: deposited,
            },
            unlockedGuideIds,
            lockedGuideIds: guides.filter((g) => !unlockedGuideIds.includes(g.id)).map((g) => g.id),
            careGuideSource: 'qualifying_product',
            careMastery: careMasterySeasonAccess
              ? {
                  hasAccess: careMasterySeasonAccess.hasAccess,
                  displayState: careMasterySeasonAccess.displayState,
                  seasonOwned: careMasterySeasonAccess.seasonOwned,
                  canPurchaseSeasonPass: careMasterySeasonAccess.canPurchaseSeasonPass,
                  canPurchaseEpisode: careMasterySeasonAccess.canPurchaseEpisode,
                }
              : 'not-loaded',
            separationVerified:
              unlockedGuideIds.length > 0 && careMasterySeasonAccess
                ? !careMasterySeasonAccess.hasAccess
                : 'n/a',
            qualifyingPurchaseCount: purchaseProfiles.filter((p) => p.status === 'active').length,
            purchaseProfiles: purchaseProfiles.map((p) => ({
              orderId: p.orderId,
              productName: p.productName,
              productType: p.productType,
              baseUnitId: p.baseUnitId,
              textureFamily: p.textureFamily,
              status: p.status,
            })),
          },
          null,
          2
        )}
      </pre>
    </details>
  );
}
