/**
 * AI Media Company DNA generator.
 */

import { AI_MEDIA_WORKSPACE_ID, BRAND_VALUES, COMPANY_MISSION, PILOT_ROLE } from './constants';
import type { CompanyDna } from './types';

export function generateAiMediaCompanyDna(workspaceId = AI_MEDIA_WORKSPACE_ID): CompanyDna {
  return {
    workspaceId,
    mission: COMPANY_MISSION,
    brandValues: [...BRAND_VALUES],
    pilotRole: PILOT_ROLE,
    updatedAt: new Date().toISOString(),
  };
}
