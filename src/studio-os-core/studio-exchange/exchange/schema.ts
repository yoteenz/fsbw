import type { ExchangeAssetClass } from '../types';

export type ExchangeListing = {
  listingId: string;
  assetClass: ExchangeAssetClass;
  targetId: string;
  displayName: string;
  summary: string;
  careerWorldId?: string;
  profession?: string;
};

export type StudioExchangeCatalog = {
  version: string;
  listings: ExchangeListing[];
  assetClasses: ExchangeAssetClass[];
};
