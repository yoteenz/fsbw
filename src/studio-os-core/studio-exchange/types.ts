import type {
  CEREMONY_STAGES,
  EXCHANGE_ASSET_CLASSES,
  LICENSE_STATUSES,
} from './constants';

export type ExchangeAssetClass = (typeof EXCHANGE_ASSET_CLASSES)[number];
export type ProfessionalLicenseStatus = (typeof LICENSE_STATUSES)[number];
export type CeremonyStageId = (typeof CEREMONY_STAGES)[number];

export type StudioExchangeOwnerRef = {
  organizationId: string;
  citizenId: string;
  displayName?: string;
};
