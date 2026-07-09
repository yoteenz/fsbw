import type { XerInspectorView, XerRuntimeGraph } from '../experience-runtime/types';
import type { XerRuntimeBootReport } from '../experience-runtime/runtime-boot/runtime-boot-validator';
import type { XelabLabSwitchers, XelabPanelId, XelabScenarioId } from './constants';

export type XelabSelection = {
  scenarioId: XelabScenarioId;
  brandId: string;
  departmentId: string;
  sceneId: string;
  motionDnaId: string;
  switchers: XelabLabSwitchers;
  activePanel: XelabPanelId;
};

export type XelabStore = {
  version: string;
  selection: XelabSelection;
  switchCount: number;
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XelabReadyView = {
  selection: XelabSelection;
  scenarioLabel: string;
  scenarioHeroLabel: string;
  runtimeGraph: XerRuntimeGraph | null;
  inspector: XerInspectorView | null;
  bootReport: XerRuntimeBootReport;
  switchCount: number;
  orbNote: string;
  constitutionLocked: boolean;
};

export type XelabRuntimeInput = {
  selection?: Partial<XelabSelection>;
};
