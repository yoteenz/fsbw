import type { ReactNode } from 'react';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';
import { V3ProductionWorkspace } from '../workspaces/V3ProductionWorkspace';
import { V3ReviewWorkspace } from '../workspaces/V3ReviewWorkspace';
import { V3AssetsWorkspace } from '../workspaces/V3AssetsWorkspace';
import { V3CommandWorkspace } from '../workspaces/V3CommandWorkspace';

type Props = {
  environmentPane: ReactNode;
};

/** Renders one viewport workspace pane inside the horizontal pager. */
export function V3WorkspacePaneRenderer({ workspaceId, environmentPane }: Props & { workspaceId: V3CoreWorkspaceId }) {
  if (workspaceId === 'environment') return <>{environmentPane}</>;
  if (workspaceId === 'production') return <V3ProductionWorkspace />;
  if (workspaceId === 'review') return <V3ReviewWorkspace />;
  if (workspaceId === 'assets') return <V3AssetsWorkspace />;
  return <V3CommandWorkspace />;
}
