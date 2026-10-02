/** Semantic interaction affordance types — v0 (no per-object bespoke logic). */

export const SW_INTERACTION_ANCHOR_TYPES = [
  'SO_DOOR',
  'SO_CAFE_SEAT',
  'SO_WORKSTATION',
  'SO_SOFA',
  'SO_ELEVATOR',
  'SO_BED',
  'SO_KITCHEN_COUNTER',
] as const;

export type SwInteractionAnchorType = (typeof SW_INTERACTION_ANCHOR_TYPES)[number];

export type SwInteractionAnchorV0 = {
  anchorType: SwInteractionAnchorType;
  locationId?: string;
  ueActorLabel?: string;
};
