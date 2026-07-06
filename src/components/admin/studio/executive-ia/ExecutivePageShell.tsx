import type { ReactNode } from 'react';
import { eiaPageRoot } from './executiveIaTheme';

type ExecutivePageShellProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical rhythm wrapper — hero → nav → focus → secondary → collapsible. */
export function ExecutivePageShell({ children, className = '' }: ExecutivePageShellProps) {
  return (
    <div className={`executive-ia-root ${className}`.trim()} style={eiaPageRoot}>
      {children}
    </div>
  );
}
