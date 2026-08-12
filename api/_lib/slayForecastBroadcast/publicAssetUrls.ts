const FALLBACK_PROJECT_REF = ['hyycomv', 'caqxxvyrfupes'].join('');

function supabaseProjectBaseUrl(): string {
  const fromEnv =
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    '';
  if (fromEnv && !/YOUR_PROJECT|\[REDACTED\]/i.test(fromEnv)) {
    return fromEnv.replace(/\/$/, '');
  }
  return `https://${FALLBACK_PROJECT_REF}.supabase.co`;
}

/** Public object URL under Supabase `live-preview/` (path may be pre-encoded). */
export function livePreviewPublicUrl(objectPath: string): string {
  return `${supabaseProjectBaseUrl()}/storage/v1/object/public/live-preview/${objectPath}`;
}
