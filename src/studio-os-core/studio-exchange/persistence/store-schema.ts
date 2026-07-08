import { STUDIO_EXCHANGE_ENGINE_VERSION } from '../constants';
import type { ProfessionalLicense } from '../licenses/schema';
import type { CeremonyRunState } from '../ceremonies/schema';
import type { MentorApprenticeAssignment, MentorPointsLedgerEntry } from '../mentor-economy/schema';
import type { LegacyBusiness } from '../businesses/schema';
import type { ExchangeCreditBalance } from '../rewards/schema';

export type StudioExchangeStore = {
  version: string;
  licenses: ProfessionalLicense[];
  ceremonies: CeremonyRunState[];
  mentorAssignments: MentorApprenticeAssignment[];
  mentorPointsLedger: MentorPointsLedgerEntry[];
  businesses: LegacyBusiness[];
  exchangeCredits: ExchangeCreditBalance[];
};

export function emptyStudioExchangeStore(): StudioExchangeStore {
  return {
    version: STUDIO_EXCHANGE_ENGINE_VERSION,
    licenses: [],
    ceremonies: [],
    mentorAssignments: [],
    mentorPointsLedger: [],
    businesses: [],
    exchangeCredits: [],
  };
}
