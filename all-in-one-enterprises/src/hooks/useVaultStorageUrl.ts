import { useEffect, useState } from 'react';
import { resolveDemoBlobObjectUrl } from '../storage/demoBlobStore';

/** Resolves demo-blob refs (and passthrough data/http URLs) for previews. */
export function useVaultStorageUrl(storageReference: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storageReference) {
      setUrl(null);
      return undefined;
    }
    let cancelled = false;
    void resolveDemoBlobObjectUrl(storageReference).then((resolved) => {
      if (!cancelled) setUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [storageReference]);

  return url;
}
