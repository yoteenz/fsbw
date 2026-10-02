/**
 * Semantic world location IDs — v0 contract for UE placement / future resident bridge.
 * Sprint: UE-COMPOSER-OPERATOR.MIGRATION-BOOTSTRAP1 (no full AI bridge yet).
 */

export const SW_LOCATION_IDS = [
  'SW_LOCATION_ETTA_HOME',
  'SW_LOCATION_RESIDENTIAL_EDGE',
  'SW_LOCATION_PUBLIC_REALM',
  'SW_LOCATION_GRAND_ATRIUM',
  'SW_LOCATION_CREATIVE_FLOOR',
  'SW_LOCATION_CAFE',
  'SW_LOCATION_UNDERSTUDIO_ACCESS',
] as const;

export type SwLocationId = (typeof SW_LOCATION_IDS)[number];

export type SwLocationContractEntry = {
  locationId: SwLocationId;
  /** Greybox actor label prefix in SW_VerticalSlice_01 */
  ueGreyboxLabel?: string;
  residentLifeLogicalId?: string;
};

export const SW_LOCATION_CONTRACT_V0: SwLocationContractEntry[] = [
  { locationId: 'SW_LOCATION_ETTA_HOME', ueGreyboxLabel: 'SW_EttaHome' },
  { locationId: 'SW_LOCATION_RESIDENTIAL_EDGE', ueGreyboxLabel: 'SW_ResidentialEdge' },
  { locationId: 'SW_LOCATION_PUBLIC_REALM', ueGreyboxLabel: 'SW_PublicPlaza' },
  { locationId: 'SW_LOCATION_GRAND_ATRIUM', ueGreyboxLabel: 'SW_GrandAtrium' },
  { locationId: 'SW_LOCATION_CREATIVE_FLOOR', ueGreyboxLabel: 'SW_CompanyProperty' },
  { locationId: 'SW_LOCATION_CAFE', ueGreyboxLabel: 'SW_Cafe' },
  { locationId: 'SW_LOCATION_UNDERSTUDIO_ACCESS', ueGreyboxLabel: 'SW_UnderstudioAccess' },
];
