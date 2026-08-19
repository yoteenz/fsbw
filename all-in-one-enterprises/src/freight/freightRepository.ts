import { isDemoMode, isSupabaseMode } from '../config/dataMode';
import { demoFreightRepository } from './demoFreightRepository';
import { createSupabaseFreightRepository } from './supabaseFreightRepository';
import type { FreightRepository } from './freightRepositoryTypes';

export function getFreightRepository(orgId: string, userId: string): FreightRepository {
  if (isSupabaseMode()) {
    return createSupabaseFreightRepository(orgId, userId);
  }
  return demoFreightRepository;
}

export function getFreightRepositoryMode(): 'demo' | 'supabase' {
  return isSupabaseMode() ? 'supabase' : 'demo';
}

export function isFreightDemoMode(): boolean {
  return isDemoMode();
}

export { demoFreightRepository };
