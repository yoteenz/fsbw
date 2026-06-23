/** Percentage rect on the source hero image (0–100). */
export type PanelDebugPercentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PanelDebugMap = Record<string, PanelDebugPercentRect>;

export type PanelDebugColorGroup = 'red' | 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'cyan';

export type PanelDebugPanelDef = {
  id: string;
  label: string;
  colorGroup: PanelDebugColorGroup;
};

export type PanelDebugSceneId = 'penthouse' | 'reception';
