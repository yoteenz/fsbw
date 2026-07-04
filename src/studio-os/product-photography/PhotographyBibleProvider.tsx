import type { ReactNode } from 'react';
import { PhotographySystemProvider, createPhotographySystemValue } from './PhotographySystemContext';

/**
 * StudioOS Photography Bible provider — wraps admin UI and future product creation flows.
 * Every new StudioOS product inherits specs from this provider's value.
 */
export function PhotographyBibleProvider({ children }: { children: ReactNode }) {
  return <PhotographySystemProvider value={createPhotographySystemValue()}>{children}</PhotographySystemProvider>;
}

export { PhotographySystemProvider, usePhotographySystem, createPhotographySystemValue } from './PhotographySystemContext';
