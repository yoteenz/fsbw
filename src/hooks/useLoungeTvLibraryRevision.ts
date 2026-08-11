import { useEffect, useState } from 'react';
import { LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../utils/loungeTvLibrary';

/** Re-render when saved packs, watch progress, or completion state changes. */
export function useLoungeTvLibraryRevision(): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  return revision;
}
