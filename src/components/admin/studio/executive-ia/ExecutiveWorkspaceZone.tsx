import type { ReactNode } from 'react';

type ExecutiveWorkspaceZoneProps = {
  departmentId: string;
  children: ReactNode;
};

/** Animated wing beneath department selection — transforms when department changes. */
export function ExecutiveWorkspaceZone({ departmentId, children }: ExecutiveWorkspaceZoneProps) {
  return (
    <div key={departmentId} className="executive-ia-wing-enter">
      {children}
    </div>
  );
}
