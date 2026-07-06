import type { ReactNode } from 'react';
import { EXECUTIVE_IA_STYLES } from './executiveIaStyles';
import { eiaPageRoot } from './executiveIaTheme';

type ExecutivePageShellProps = {
  children: ReactNode;
  className?: string;
};

/** M83 vertical rhythm — Header → Hero → Departments → Focus → Secondary → Details → History. */
export function ExecutivePageShell({ children, className = '' }: ExecutivePageShellProps) {
  return (
    <div className={`executive-ia-root ${className}`.trim()} style={eiaPageRoot}>
      <style>{EXECUTIVE_IA_STYLES}</style>
      {children}
    </div>
  );
}
