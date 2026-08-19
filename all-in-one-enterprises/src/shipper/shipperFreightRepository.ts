import { isDemoMode, isSupabaseMode } from '../config/dataMode';
import { demoShipperFreightRepository } from './demoShipperFreightRepository';
import { createSupabaseShipperFreightRepository } from './supabaseShipperFreightRepository';
import type { ShipperFreightRepository } from './shipperFreightRepositoryTypes';

export function getShipperFreightRepository(orgId: string, userId: string): ShipperFreightRepository {
  if (isSupabaseMode()) {
    return createSupabaseShipperFreightRepository(orgId, userId);
  }
  return demoShipperFreightRepository;
}

export function getShipperFreightRepositoryMode(): 'demo' | 'supabase' {
  return isSupabaseMode() ? 'supabase' : 'demo';
}

export function isShipperFreightDemoMode(): boolean {
  return isDemoMode();
}

export { demoShipperFreightRepository };
