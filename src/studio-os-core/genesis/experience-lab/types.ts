import type { XerInspectorView, XerRuntimeGraph } from '../experience-runtime/types';
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
  runtimeGraph: XerRuntimeGraph;
  inspector: XerInspectorView;
  switchCount: number;
  orbNote: string;
  constitutionLocked: boolean;
};

export type XelabRuntimeInput = {
  selection?: Partial<XelabSelection>;
};
