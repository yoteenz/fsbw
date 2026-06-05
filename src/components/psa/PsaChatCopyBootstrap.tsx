import { useEffect } from 'react';
import { fetchAndMergePsaChatCopyFromCloud } from '../../utils/psaChatCopySync';

/** Merge PSA chat copy from Supabase on app load (public read). */
export function PsaChatCopyBootstrap() {
  useEffect(() => {
    void fetchAndMergePsaChatCopyFromCloud();
  }, []);
  return null;
}
