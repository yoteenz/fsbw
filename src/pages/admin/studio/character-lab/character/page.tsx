import { CharacterLabShell } from '../../../../../components/admin/studio/character-lab/CharacterLabShell';
import { CharacterLabTabContent } from '../../../../../components/admin/studio/character-lab/CharacterLabTabContent';

export default function AdminStudioCharacterLabCharacterPage() {
  return (
    <CharacterLabShell activeTabId="character">
      <CharacterLabTabContent
        title="CHARACTER"
        description="CORE IDENTITY · PERSONALITY TRAITS · CHARACTER BIBLE BINDINGS"
        emptyState="SELECT A TALENT PROFILE TO EDIT CHARACTER ATTRIBUTES"
      />
    </CharacterLabShell>
  );
}
