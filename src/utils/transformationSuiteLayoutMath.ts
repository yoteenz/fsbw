import {
  clampPanelDebugPercentRect,
  roundPanelDebugPercent,
} from './desktopPanelDebugMode';
import type { TransformationSuiteCircle, TransformationSuitePercentRect } from '../types/transformationSuite';

export function clampTransformationSuiteRect(rect: TransformationSuitePercentRect): TransformationSuitePercentRect {
  return clampPanelDebugPercentRect(rect);
}

export function clampTransformationSuiteCircle(circle: TransformationSuiteCircle): TransformationSuiteCircle {
  const radius = Math.max(2, Math.min(45, circle.radius));
  const centerX = Math.max(radius, Math.min(100 - radius, circle.centerX));
  const centerY = Math.max(radius, Math.min(100 - radius, circle.centerY));
  return {
    centerX: roundPanelDebugPercent(centerX),
    centerY: roundPanelDebugPercent(centerY),
    radius: roundPanelDebugPercent(radius),
  };
}

export function transformationSuiteRectToImageRect(rect: TransformationSuitePercentRect) {
  return {
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  };
}
