import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { isBawOptionSubPage, resolveBawModeBackPath, resolveBawModeChromeContext } from '../../utils/bawModeChrome';
import { setBawTryBrowseActive } from '../../utils/bawClientTestMode';
import { useBawSubscriptionView } from './BawSubscriptionViewContext';

/** Sticky mode header + progress + BUILD GUIDE panel for try / customize / edit / hub. */
export function BawModeChrome() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ctx = useMemo(() => resolveBawModeChromeContext(pathname), [pathname]);
  const premium = useBawSubscriptionView();
  const isSubPage = isBawOptionSubPage(pathname);

  if (!ctx) return null;

  const handleLeftNav = () => {
    if (isSubPage) {
      navigate(resolveBawModeBackPath(pathname));
      return;
    }
    setBawTryBrowseActive(false);
    navigate('/home/shop');
  };

  return (
    <div className="mb-4 flex flex-col gap-3" data-attribute="baw-mode-chrome">
      <header
        className="sticky top-0 z-40 flex items-center justify-between py-3 rounded-sm border border-black bg-white/70 backdrop-blur-sm px-4"
        style={{ borderWidth: '1.3px' }}
      >
        <button
          type="button"
          onClick={handleLeftNav}
          className="text-[10px] uppercase"
          style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
        >
          {isSubPage ? 'BACK' : 'SHOP'}
        </button>
        <div className="text-center">
          <p
            className="text-[9px] tracking-[0.2em] uppercase"
            style={{ fontFamily: '"Futura PT Book"', color: '#808080' }}
          >
            {ctx.modeLabel}
          </p>
          <p
            className="text-[11px] tracking-[0.08em] uppercase"
            style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
          >
            {ctx.unitLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setBawTryBrowseActive(false);
            navigate('/home/shop');
          }}
          className="text-[10px] uppercase"
          style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
        >
          EXIT
        </button>
      </header>

      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#EB1C24] transition-all duration-300"
          style={{ width: `${ctx.progressPct}%` }}
        />
      </div>

      {!premium.showPremiumChart && (
        <div
          className="rounded-sm border border-black bg-white/70 backdrop-blur-sm p-3"
          style={{ borderWidth: '1.3px' }}
          data-attribute="baw-build-guide"
        >
          <p
            className="text-[9px] tracking-[0.18em] uppercase mb-1"
            style={{ fontFamily: '"Futura PT Medium"', color: '#808080' }}
          >
            BUILD GUIDE
          </p>
          <p
            className="text-[11px] tracking-[0.06em] uppercase mb-1"
            style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
          >
            {ctx.guideTitle}
          </p>
          <p
            className="text-[10px] leading-snug uppercase"
            style={{ fontFamily: '"Futura PT Book"', color: '#1A1A1A' }}
          >
            {ctx.guideBody}
          </p>
        </div>
      )}
    </div>
  );
}
