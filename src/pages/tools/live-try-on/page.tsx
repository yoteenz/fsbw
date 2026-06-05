import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LiveTryOnViewport from '../../../components/liveTryOn/LiveTryOnViewport';

export default function LiveTryOnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';

  const backTarget = useMemo(() => {
    if (returnTo.startsWith('/')) return returnTo;
    return '/build-a-wig';
  }, [returnTo]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{
        backgroundImage: "url('/assets/marble-half.png')",
        backgroundSize: 'cover',
      }}
    >
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-black/10"
        style={{ fontFamily: '"Futura PT Medium"', textTransform: 'uppercase' }}
      >
        <button
          type="button"
          onClick={() => navigate(backTarget)}
          className="text-[11px] border border-black px-3 py-1 bg-white/80"
          style={{ color: '#EB1C24' }}
        >
          BACK
        </button>
        <span className="text-[11px] text-black">LIVE TRY-ON</span>
        <span className="w-[52px]" aria-hidden />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-6 gap-3">
        <p
          className="text-center uppercase max-w-sm"
          style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
        >
          SPIKE PREVIEW: POSITION YOUR FACE IN THE OVAL. TURN YOUR HEAD SLOWLY — WIG ANGLE FOLLOWS YOU. SELECTION
          ASSETS COMING NEXT.
        </p>
        <div className="w-full max-w-md">
          <LiveTryOnViewport />
        </div>
      </main>
    </div>
  );
}
