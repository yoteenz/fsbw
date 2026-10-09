import { isSupabaseMode } from '../../config/dataMode';
import type { MigrationReviewAction } from '../types';
import { supabaseUpdateExtractedFactReview } from '../repositories/supabaseMigrationRepository';

export async function persistMigrationFactReview(
  factId: string,
  action: MigrationReviewAction,
): Promise<{ error?: string }> {
  if (!isSupabaseMode()) return {};
  return supabaseUpdateExtractedFactReview(factId, action);
}
