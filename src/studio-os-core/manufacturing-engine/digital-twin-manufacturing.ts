import type { AssetDnaRecord } from './asset-dna';
import type { ManufacturingHistoryEntry } from './world-manufacturing-history';

export const DIGITAL_TWIN_MANUFACTURING_VERSION = 'digital-twin-manufacturing.v1';

export type TwinSubsystemHealth = 'healthy' | 'repairing' | 'warning' | 'critical' | 'offline';

export type DigitalTwinAssetNode = {
  assetId: string;
  assetFamily: string;
  health: TwinSubsystemHealth;
  dnaRevision: string;
  lastManufacturedAt: string | null;
  inspectionScore: number | null;
};

export type DigitalTwinRoomState = {
  twinVersion: typeof DIGITAL_TWIN_MANUFACTURING_VERSION;
  roomId: string;
  roomDisplayName: string;
  overallHealth: TwinSubsystemHealth;
  assets: DigitalTwinAssetNode[];
  /** Like monitoring servers */
  monitoredAt: string;
};

export function buildDigitalTwinState(input: {
  roomId: string;
  roomDisplayName: string;
  dnaRecords: AssetDnaRecord[];
  history: ManufacturingHistoryEntry[];
  repairingAssetIds?: string[];
}): DigitalTwinRoomState {
  const repairing = new Set(input.repairingAssetIds ?? []);
  const historyByAsset = new Map(input.history.map((h) => [h.assetId, h]));

  const assets: DigitalTwinAssetNode[] = input.dnaRecords.map((dna) => {
    const hist = historyByAsset.get(dna.assetId);
    let health: TwinSubsystemHealth = 'healthy';
    if (repairing.has(dna.assetId)) health = 'repairing';
    else if (hist && hist.currentHealth === 'warning') health = 'warning';
    else if (hist && hist.currentHealth === 'critical') health = 'critical';

    return {
      assetId: dna.assetId,
      assetFamily: dna.assetFamily,
      health,
      dnaRevision: dna.assetRevision,
      lastManufacturedAt: hist?.manufacturedAt ?? null,
      inspectionScore: hist?.inspectionScore ?? null,
    };
  });

  const overallHealth: TwinSubsystemHealth = assets.some((a) => a.health === 'critical')
    ? 'critical'
    : assets.some((a) => a.health === 'repairing')
      ? 'repairing'
      : assets.some((a) => a.health === 'warning')
        ? 'warning'
        : 'healthy';

  return {
    twinVersion: DIGITAL_TWIN_MANUFACTURING_VERSION,
    roomId: input.roomId,
    roomDisplayName: input.roomDisplayName,
    overallHealth,
    assets,
    monitoredAt: new Date().toISOString(),
  };
}
