/** Shared navigation entry for SceneTray™ (zones, museum views, CDS scenes). */

export type SceneTrayEntry = {
  id: string;
  label: string;
  shortLabel: string;
  locked?: boolean;
};
