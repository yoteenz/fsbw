import { getAioSupabase } from '../data/supabase/client';
import { isSupabaseMode } from '../config/dataMode';

const BUCKET = 'aio-migration-intake';

export async function storeMigrationRawFile(input: {
  organizationId: string;
  batchId: string;
  file: File;
}): Promise<{ storagePath?: string; error?: string }> {
  if (!isSupabaseMode()) {
    return { error: 'Migration raw storage requires Supabase mode.' };
  }

  const supabase = getAioSupabase();
  if (!supabase) return { error: 'Backend is not configured.' };

  const ext = input.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const objectPath = `${input.organizationId}/${input.batchId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, input.file, {
    upsert: false,
    contentType: input.file.type || 'application/octet-stream',
  });

  if (error) return { error: error.message };
  return { storagePath: `${BUCKET}/${objectPath}` };
}
