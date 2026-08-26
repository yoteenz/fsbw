import { CharacterLabShell } from '../../../../../components/admin/studio/character-lab/CharacterLabShell';
import { VoiceLabContent } from '../../../../../components/admin/studio/character-lab/VoiceLabContent';
import { CHARACTER_LAB_BASE_PATH } from '../../../../../components/admin/studio/character-lab/characterLabConfig';

/** P0.VR.3L.1-FSBW — Composer-derived Voice Lab tab · reuses Character Lab shell. */
export default function AdminStudioCharacterLabVoiceLabPage() {
  return (
    <CharacterLabShell
      activeTabId="voice-lab"
      composerDerived
      derivedFromRoute={`${CHARACTER_LAB_BASE_PATH}/visual`}
    >
      <VoiceLabContent />
    </CharacterLabShell>
  );
}
