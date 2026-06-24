import { useRef } from 'react';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { TransformationSuiteDebugProvider } from '../../../components/transformation-suite/TransformationSuiteDebugProvider';
import { TransformationSuiteDebugToolbar } from '../../../components/transformation-suite/TransformationSuiteDebugToolbar';
import { TransformationSuiteScene } from '../../../components/transformation-suite/TransformationSuiteScene';
import { isDesktopArtboardLayoutActive } from '../../../utils/desktopPreview';
import { useTransformationSuiteDebugRequired } from '../../../components/transformation-suite/TransformationSuiteDebugProvider';
import '../../../components/transformation-suite/TransformationSuite.css';

function TransformationSuiteDebugEntry() {
  const editor = useTransformationSuiteDebugRequired();
  if (editor.debugEnabled) return null;
  return (
    <button type="button" className="ts-debug-entry" onClick={editor.toggleDebug}>
      Suite Debug (Ctrl+Shift+D)
    </button>
  );
}

export default function DesktopBookingSuitePage() {
  const viewportRef = useRef<HTMLElement>(null);
  const artboard = isDesktopArtboardLayoutActive();

  return (
    <TransformationSuiteDebugProvider>
      <div className={`ts-page${artboard ? ' ts-page--artboard' : ''}`}>
        <NavBar />
        <section ref={viewportRef} className="ts-page__viewport">
          <TransformationSuiteScene measureRef={viewportRef} />
        </section>
        <TransformationSuiteDebugToolbar />
        <TransformationSuiteDebugEntry />
      </div>
    </TransformationSuiteDebugProvider>
  );
}
