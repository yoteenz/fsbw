import { Outlet } from 'react-router-dom';
import { AIODebugBanner } from '../components/AIODebugBanner';
import { AioLayoutPreviewBar } from '../components/layout-preview/AioLayoutPreviewBar';
import { LayoutPreviewProvider } from './LayoutPreviewContext';
import type { AioLayoutPreviewMode } from './layoutPreviewMode';

type Props = {
  mode: Extract<AioLayoutPreviewMode, 'desktop' | 'mobile'>;
};

/** Wraps mirrored routes under /desktop/* or /mobile/* — forces fixed layout for design review. */
export function LayoutPreviewRootLayout({ mode }: Props) {
  const rootClass =
    mode === 'desktop' ? 'aio-layout-preview aio-layout-preview--desktop' : 'aio-layout-preview aio-layout-preview--mobile';

  return (
    <LayoutPreviewProvider mode={mode}>
      <div className={rootClass}>
        <AIODebugBanner />
        <AioLayoutPreviewBar />
        <Outlet />
      </div>
    </LayoutPreviewProvider>
  );
}
