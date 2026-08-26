import { CharacterLabShell } from '../../../../../components/admin/studio/character-lab/CharacterLabShell';
import { CharacterLabTabContent } from '../../../../../components/admin/studio/character-lab/CharacterLabTabContent';

export default function AdminStudioCharacterLabWardrobePage() {
  return (
    <CharacterLabShell activeTabId="wardrobe">
      <CharacterLabTabContent
        title="WARDROBE"
        description="OUTFIT SLOTS · COSTUME VARIANTS · WARDROBE BINDINGS"
        emptyState="NO WARDROBE VARIANTS · ADD OUTFIT SLOT"
      />
    </CharacterLabShell>
  );
}
