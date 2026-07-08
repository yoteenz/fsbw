/** Architectural Navigation Rail™ — rail display modes */

export type ArchitecturalNavRailMode = 'expanded' | 'compact' | 'hidden';

export type ArchitecturalLocationStack = {
  headquarters: string;
  wing?: string;
  room?: string;
  scene?: string;
  layer?: string;
};

export type ArchitecturalFrameStatus = {
  headquarters: string;
  department?: string;
  room?: string;
  scene?: string;
  layer?: string;
  generationStatus?: string;
  worldGraphStatus?: string;
  connectedOrb?: string;
  blueprint?: string;
  workspace?: string;
  /** Living Architecture™ — campus growth language instead of abstract stats */
  growthSummary?: string;
  /** Living District Ecology™ — ecosystem balance summary */
  ecosystemSummary?: string;
};

export type ArchitecturalDestination = {
  id: string;
  label: string;
  icon: string;
  path: string;
  kind: 'atlas' | 'flagship' | 'wing' | 'room';
};

export type ArchitecturalContextualRoom = {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: string;
  locked?: boolean;
};

export type ArchitecturalContextualWing = {
  id: string;
  label: string;
  rooms: ArchitecturalContextualRoom[];
};

export type ArchitecturalNavRailConfig = {
  location: ArchitecturalLocationStack;
  frameStatus: ArchitecturalFrameStatus;
  contextualWings?: ArchitecturalContextualWing[];
  activeRoomId?: string;
  onSelectRoom?: (roomId: string) => void;
  destinationId?: string;
};
