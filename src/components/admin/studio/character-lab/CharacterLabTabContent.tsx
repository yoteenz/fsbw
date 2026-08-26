import type { ReactNode } from 'react';
import { CharacterLabPanel } from './CharacterLabPanel';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
  emptyState?: string;
  loading?: boolean;
  error?: string | null;
};

export function CharacterLabTabContent({
  title,
  description,
  children,
  emptyState,
  loading,
  error,
}: Props) {
  return (
    <CharacterLabPanel region={title.toLowerCase().replace(/\s+/g, '-')}>
      <h2
        className="text-[10px] font-futura uppercase mb-2"
        style={{ fontWeight: 600, color: ADMIN_STUDIO_THEME.textPrimary }}
      >
        {title}
      </h2>
      <p
        className="text-[8px] font-futura uppercase mb-3"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {description}
      </p>
      {loading ? (
        <p className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          LOADING…
        </p>
      ) : null}
      {error ? (
        <p className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
          ERROR · {error}
        </p>
      ) : null}
      {!loading && !error && !children && emptyState ? (
        <p className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {emptyState}
        </p>
      ) : null}
      {children}
    </CharacterLabPanel>
  );
}
