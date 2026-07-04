import type { ReactNode } from 'react';
import { PhotographySystemProvider, createPhotographySystemValue } from './PhotographySystemContext';

/**
 * studio os Photography Bible provider — wraps admin UI and future product creation flows.
 * Every new studio os product inherits specs from this provider's value.
 */
export function PhotographyBibleProvider({ children }: { children: ReactNode }) {
  return <PhotographySystemProvider value={createPhotographySystemValue()}>{children}</PhotographySystemProvider>;
}

export { PhotographySystemProvider, usePhotographySystem, createPhotographySystemValue } from './PhotographySystemContext';
