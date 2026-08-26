import { CharacterLabShell } from '../../../../../components/admin/studio/character-lab/CharacterLabShell';
import { CharacterLabTabContent } from '../../../../../components/admin/studio/character-lab/CharacterLabTabContent';

export default function AdminStudioCharacterLabVisualPage() {
  return (
    <CharacterLabShell activeTabId="visual">
      <CharacterLabTabContent
        title="VISUAL"
        description="APPEARANCE · REFERENCE IMAGERY · VISUAL DNA · LOOK DEV"
        emptyState="NO VISUAL REFERENCES ATTACHED · ADD REFERENCE BOARD"
      />
    </CharacterLabShell>
  );
}
