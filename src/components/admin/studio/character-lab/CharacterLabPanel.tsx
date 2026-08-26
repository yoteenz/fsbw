import type { ReactNode } from 'react';
import { CHARACTER_LAB_SHELL_GEOMETRY } from './characterLabConfig';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type Props = {
  children: ReactNode;
  region?: string;
};

/** Shared workspace panel — preserves Character Lab family geometry. */
export function CharacterLabPanel({ children, region = 'workspace' }: Props) {
  return (
    <section
      className="character-lab__panel border p-3"
      data-region={region}
      data-character-lab-panel="true"
      style={{
        padding: CHARACTER_LAB_SHELL_GEOMETRY.panelPadding,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        background: ADMIN_STUDIO_THEME.panelBg,
        borderRadius: CHARACTER_LAB_SHELL_GEOMETRY.borderRadius,
      }}
    >
      {children}
    </section>
  );
}
