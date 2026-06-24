import type { RefObject } from 'react';
import { TRANSFORMATION_SUITE_BACKGROUND_URL, TRANSFORMATION_SUITE_IMAGE } from '../../constants/transformationSuite';
import {
  TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS,
  TRANSFORMATION_SUITE_RECT_DEBUG_PANELS,
} from '../../constants/transformationSuiteLayout';
import { preloadDesktopRoomBackground } from '../../utils/desktopRoomBackgroundCache';
import { useEffect } from 'react';
import { TransformationSuiteDebugCircle } from './TransformationSuiteDebugCircle';
import { TransformationSuiteDebugRect } from './TransformationSuiteDebugRect';
import { TransformationSuiteProductionLayer } from './TransformationSuiteProductionLayer';
import { useTransformationSuiteDebug } from './TransformationSuiteDebugProvider';
import './TransformationSuite.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

export function TransformationSuiteScene({ measureRef }: Props) {
  const debug = useTransformationSuiteDebug();
  const showProduction = !debug?.debugEnabled;

  useEffect(() => {
    void preloadDesktopRoomBackground(TRANSFORMATION_SUITE_BACKGROUND_URL);
  }, []);

  return (
    <div className="ts-scene" aria-label="The Transformation Suite">
      <img
        src={TRANSFORMATION_SUITE_BACKGROUND_URL}
        alt=""
        className="ts-scene__bg"
        draggable={false}
        width={TRANSFORMATION_SUITE_IMAGE.width}
        height={TRANSFORMATION_SUITE_IMAGE.height}
      />
      <div className="ts-scene__layer">
        {showProduction ? <TransformationSuiteProductionLayer measureRef={measureRef} /> : null}

        {debug?.debugEnabled && debug.overlaysVisible ? (
          <>
            {TRANSFORMATION_SUITE_RECT_DEBUG_PANELS.map((panel) => (
              <TransformationSuiteDebugRect key={panel.id} measureRef={measureRef} panel={panel} />
            ))}
            {TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS.map((panel) => (
              <TransformationSuiteDebugCircle key={panel.id} measureRef={measureRef} panel={panel} />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
