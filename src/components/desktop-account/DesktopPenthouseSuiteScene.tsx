import type { RefObject } from 'react';
import {
  DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL,
  PENTHOUSE_SUITE_IMAGE,
} from '../../constants/desktopPenthouseSuite';
import { PenthouseSuiteDashboard } from './PenthouseSuiteDashboard';
import './DesktopPenthouseSuiteScene.css';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
  user: Record<string, unknown> | null;
};

export function DesktopPenthouseSuiteScene({ measureRef, user }: Props) {
  return (
    <div className="desktop-penthouse-suite-scene" aria-label="The Penthouse Suite account dashboard">
      <img
        src={DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL}
        alt=""
        className="desktop-penthouse-suite-scene__bg"
        draggable={false}
        width={PENTHOUSE_SUITE_IMAGE.width}
        height={PENTHOUSE_SUITE_IMAGE.height}
      />
      <div className="desktop-penthouse-suite-scene__layer">
        <PenthouseSuiteDashboard measureRef={measureRef} user={user} />
      </div>
    </div>
  );
}
