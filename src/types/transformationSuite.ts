/** Percentage rect on the source hero image (0–100). */
export type TransformationSuitePercentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Circular region — center + radius as % of hero image width. */
export type TransformationSuiteCircle = {
  centerX: number;
  centerY: number;
  radius: number;
};

export type TransformationSuiteRectRegionId =
  | 'DEBUG_CONSULT_1'
  | 'DEBUG_CONSULT_2'
  | 'DEBUG_CONSULT_3'
  | 'DEBUG_CONSULT_4'
  | 'DEBUG_FEATURED_EXPERIENCE'
  | 'DEBUG_SERVICE_1'
  | 'DEBUG_SERVICE_2'
  | 'DEBUG_SERVICE_3'
  | 'DEBUG_SERVICE_4'
  | 'DEBUG_CIRCLE_HEADER'
  | 'DEBUG_SERVICE_GRID'
  | 'DEBUG_DATE_PICKER'
  | 'DEBUG_TIME_PICKER'
  | 'DEBUG_BOOK_BUTTON';

export type TransformationSuiteCircleRegionId = 'DEBUG_CIRCLE_BOUNDARY';

export type TransformationSuiteLayout = {
  rects: Record<TransformationSuiteRectRegionId, TransformationSuitePercentRect>;
  circles: Record<TransformationSuiteCircleRegionId, TransformationSuiteCircle>;
};

export type TransformationSuiteDebugColorGroup =
  | 'red'
  | 'blue'
  | 'green'
  | 'purple'
  | 'yellow'
  | 'orange'
  | 'cyan';

export type TransformationSuiteDebugPanelDef = {
  id: TransformationSuiteRectRegionId;
  label: string;
  colorGroup: TransformationSuiteDebugColorGroup;
};

export type TransformationSuiteCircleDebugDef = {
  id: TransformationSuiteCircleRegionId;
  label: string;
  colorGroup: TransformationSuiteDebugColorGroup;
};
