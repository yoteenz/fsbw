import type {
  TransformationSuiteCircleRegionId,
  TransformationSuiteLayout,
  TransformationSuitePercentRect,
  TransformationSuiteRectRegionId,
} from '../types/transformationSuite';

/**
 * Default alignment for The Transformation Suite desktop booking page.
 * Tune with CTRL+SHIFT+D on `/desktop/booking-suite`, then export into this file.
 */
export const TRANSFORMATION_SUITE_LAYOUT_SEED: TransformationSuiteLayout = {
  rects: {
    DEBUG_CONSULT_1: { x: 3.8, y: 11.5, width: 14.2, height: 17.5 },
    DEBUG_CONSULT_2: { x: 3.8, y: 30.5, width: 14.2, height: 17.5 },
    DEBUG_CONSULT_3: { x: 3.8, y: 49.5, width: 14.2, height: 17.5 },
    DEBUG_CONSULT_4: { x: 3.8, y: 68.5, width: 14.2, height: 17.5 },
    DEBUG_FEATURED_EXPERIENCE: { x: 21.5, y: 7.5, width: 57, height: 11.5 },
    DEBUG_SERVICE_1: { x: 82, y: 11.5, width: 14.2, height: 17.5 },
    DEBUG_SERVICE_2: { x: 82, y: 30.5, width: 14.2, height: 17.5 },
    DEBUG_SERVICE_3: { x: 82, y: 49.5, width: 14.2, height: 17.5 },
    DEBUG_SERVICE_4: { x: 82, y: 68.5, width: 14.2, height: 17.5 },
    DEBUG_CIRCLE_HEADER: { x: 36.5, y: 36.5, width: 27, height: 5.5 },
    DEBUG_SERVICE_GRID: { x: 36.5, y: 42.5, width: 27, height: 9 },
    DEBUG_DATE_PICKER: { x: 36.5, y: 52, width: 27, height: 7 },
    DEBUG_TIME_PICKER: { x: 36.5, y: 59.5, width: 27, height: 7 },
    DEBUG_BOOK_BUTTON: { x: 41, y: 67.5, width: 18, height: 5.5 },
  },
  circles: {
    DEBUG_CIRCLE_BOUNDARY: { centerX: 50, centerY: 54, radius: 17.5 },
  },
};

export const TRANSFORMATION_SUITE_RECT_DEBUG_PANELS = [
  { id: 'DEBUG_CONSULT_1', label: 'CONSULT 1', colorGroup: 'blue' },
  { id: 'DEBUG_CONSULT_2', label: 'CONSULT 2', colorGroup: 'blue' },
  { id: 'DEBUG_CONSULT_3', label: 'CONSULT 3', colorGroup: 'blue' },
  { id: 'DEBUG_CONSULT_4', label: 'CONSULT 4', colorGroup: 'blue' },
  { id: 'DEBUG_FEATURED_EXPERIENCE', label: 'FEATURED', colorGroup: 'purple' },
  { id: 'DEBUG_CIRCLE_HEADER', label: 'CIRCLE HEADER', colorGroup: 'cyan' },
  { id: 'DEBUG_SERVICE_GRID', label: 'SERVICE GRID', colorGroup: 'cyan' },
  { id: 'DEBUG_DATE_PICKER', label: 'DATE PICKER', colorGroup: 'cyan' },
  { id: 'DEBUG_TIME_PICKER', label: 'TIME PICKER', colorGroup: 'cyan' },
  { id: 'DEBUG_BOOK_BUTTON', label: 'BOOK BTN', colorGroup: 'red' },
  { id: 'DEBUG_SERVICE_1', label: 'SERVICE 1', colorGroup: 'green' },
  { id: 'DEBUG_SERVICE_2', label: 'SERVICE 2', colorGroup: 'green' },
  { id: 'DEBUG_SERVICE_3', label: 'SERVICE 3', colorGroup: 'green' },
  { id: 'DEBUG_SERVICE_4', label: 'SERVICE 4', colorGroup: 'green' },
] as const;

export const TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS = [
  { id: 'DEBUG_CIRCLE_BOUNDARY', label: 'CIRCLE BOUNDARY', colorGroup: 'yellow' },
] as const;

export function cloneTransformationSuiteLayout(layout: TransformationSuiteLayout): TransformationSuiteLayout {
  return {
    rects: Object.fromEntries(
      Object.entries(layout.rects).map(([k, v]) => [k, { ...v }]),
    ) as TransformationSuiteLayout['rects'],
    circles: Object.fromEntries(
      Object.entries(layout.circles).map(([k, v]) => [k, { ...v }]),
    ) as TransformationSuiteLayout['circles'],
  };
}

export function getTransformationSuiteRect(
  layout: TransformationSuiteLayout,
  id: TransformationSuiteRectRegionId,
): TransformationSuitePercentRect {
  return layout.rects[id] ?? TRANSFORMATION_SUITE_LAYOUT_SEED.rects[id];
}

export function getTransformationSuiteCircle(
  layout: TransformationSuiteLayout,
  id: TransformationSuiteCircleRegionId,
) {
  return layout.circles[id] ?? TRANSFORMATION_SUITE_LAYOUT_SEED.circles[id];
}
