import type { ReactNode } from 'react';
import type { MissingPageCompletionMode } from '../studio-os-core/route-intelligence/types';

type Props = {
  projectId: string;
  route: string;
  displayName: string;
  completionMode: MissingPageCompletionMode;
  familyUsed?: string;
  creativeDirectionRequired?: boolean;
  functionalReviewRequired?: boolean;
  children: ReactNode;
};

/** Preview-only composer draft shell — never production navigation chrome. */
export function ComposerDraftPageShell({
  projectId,
  route,
  displayName,
  completionMode,
  familyUsed,
  creativeDirectionRequired,
  functionalReviewRequired,
  children,
}: Props) {
  return (
    <div
      className="composer-draft"
      data-project-id={projectId}
      data-route={route}
      data-completion-mode={completionMode}
      data-preview-only="true"
    >
      <header className="composer-draft__banner">
        <span>COMPOSER DRAFT · PREVIEW ONLY</span>
        <span>{displayName.toUpperCase()}</span>
        <span>{route}</span>
        {familyUsed ? <span>FAMILY · {familyUsed}</span> : null}
        {creativeDirectionRequired ? <span>NEEDS CREATIVE DIRECTION</span> : null}
        {functionalReviewRequired ? <span>NEEDS FUNCTIONAL REVIEW</span> : null}
      </header>
      <main className="composer-draft__main">{children}</main>
    </div>
  );
}
