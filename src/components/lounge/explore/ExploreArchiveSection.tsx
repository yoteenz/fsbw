import { getArchiveCampaigns, type ArchiveCampaign } from '../../../content/archive';
import { getContentPackById } from '../loungeTvContentPack';
import { ExploreFranchiseHeader } from './ExploreFranchiseHeader';
import { ExploreFranchiseSection } from './ExploreFranchiseSection';
import { ArchiveVault } from './archive/ArchiveVault';
import type { ExploreSectionCommonProps, ExploreSectionId } from './exploreTypes';

const SECTION_ID: ExploreSectionId = 'the-archive';

type ExploreArchiveSectionProps = Pick<
  ExploreSectionCommonProps,
  'onNavigateSection' | 'onSelect'
>;

export function ExploreArchiveSection({ onNavigateSection, onSelect }: ExploreArchiveSectionProps) {
  const campaigns = getArchiveCampaigns();
  const openArchiveHub = onNavigateSection ? () => onNavigateSection(SECTION_ID) : undefined;

  const handleCampaignOpen = (campaign: ArchiveCampaign) => {
    if (campaign.status !== 'restored' || !campaign.contentPackId) return;
    const pack = getContentPackById(campaign.contentPackId);
    if (pack) onSelect(pack);
  };

  return (
    <ExploreFranchiseSection franchise="the-archive" ariaLabel="The Archive">
      <ExploreFranchiseHeader
        title="THE ARCHIVE"
        tagline="THE ARCHIVE OPENS AS HISTORICAL CAMPAIGNS ARE RESTORED."
        focusId="explore-nav-the-archive"
        onNavigate={openArchiveHub}
        navigateAriaLabel="Enter The Archive"
      />
      <ArchiveVault
        campaigns={campaigns}
        onCampaignOpen={handleCampaignOpen}
        onEnterArchive={openArchiveHub}
      />
    </ExploreFranchiseSection>
  );
}
