import { useEffect, useState } from 'react';
import { resolveVaultStorageReference } from './vaultStorage';

/** Resolves demo IndexedDB blob refs for img/pdf preview without bloating localStorage. */
export function useVaultStorageUrl(storageReference?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() =>
    storageReference && !storageReference.startsWith('demo-idb:') ? storageReference : undefined,
  );
  useEffect(() => {
    let alive = true;
    void resolveVaultStorageReference(storageReference).then((resolved) => {
      if (alive) setUrl(resolved);
    });
    return () => {
      alive = false;
    };
  }, [storageReference]);
  return url;
}
