import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../AdminStudioStageShell';
import { CharacterLabTabs } from './CharacterLabTabs';
import { CHARACTER_LAB_SHELL_GEOMETRY, type CharacterLabTabId } from './characterLabConfig';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type Props = {
  activeTabId: CharacterLabTabId;
  children: ReactNode;
  /** COMPOSER-derived targets show lineage banner without changing shell geometry. */
  composerDerived?: boolean;
  derivedFromRoute?: string;
};

export function CharacterLabShell({
  activeTabId,
  children,
  composerDerived,
  derivedFromRoute,
}: Props) {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CHARACTER LAB"
      subtitle="TALENT CHARACTER WORKSPACE · VISUAL · WARDROBE · VOICE"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      navGroupId="production"
      hideNavTabs
    >
      <div
        className="character-lab"
        data-shared-shell="character-lab-workspace"
        data-shell-geometry={JSON.stringify(CHARACTER_LAB_SHELL_GEOMETRY)}
      >
        {composerDerived ? (
          <div
            className="mb-2 px-2 py-1 border text-[7px] font-futura uppercase"
            style={{
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
              color: ADMIN_STUDIO_THEME.textSecondary,
              background: 'rgba(235,28,36,0.04)',
            }}
            data-composer-derived="true"
            data-derived-from={derivedFromRoute ?? ''}
          >
            COMPOSER DERIVED · PREVIEW ONLY · FAMILY · CHARACTER LAB
            {derivedFromRoute ? ` · SOURCE ${derivedFromRoute}` : ''}
          </div>
        ) : null}
        <CharacterLabTabs activeTabId={activeTabId} />
        <div className="character-lab__workspace" data-character-lab-workspace="true">
          {children}
        </div>
      </div>
    </AdminStudioStageShell>
  );
}
