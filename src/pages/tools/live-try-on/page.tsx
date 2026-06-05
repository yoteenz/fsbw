import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LiveTryOnViewport from '../../../components/liveTryOn/LiveTryOnViewport';
import { getConsultQuote } from '../../../utils/api';
import { consultSelectionsToSpecialOfferOptions } from '../../../utils/consultOfferFromQuote';
import {
  prepareLiveTryOnAssetsFromBaw,
  prepareLiveTryOnAssetsFromConsult,
} from '../../../utils/liveTryOnPrepareAssets';
import { staticMannequinTripleForUnit } from '../../../utils/liveTryOnSelections';

export default function LiveTryOnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const quoteId = searchParams.get('quoteId') || '';

  const [prepHint, setPrepHint] = useState('LOADING YOUR SELECTIONS…');
  const [wigUrls, setWigUrls] = useState<[string, string, string] | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);

  const backTarget = useMemo(() => {
    if (returnTo.startsWith('/')) return returnTo;
    return '/build-a-wig';
  }, [returnTo]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (quoteId) {
          setPrepHint('LOADING CONSULT OFFER…');
          const res = await getConsultQuote(quoteId);
          if (cancelled) return;
          const quote = res?.quote as Record<string, unknown> | undefined;
          if (!quote) {
            setPrepError('OFFER NOT FOUND');
            setWigUrls(staticMannequinTripleForUnit('NOIR'));
            return;
          }
          const unitKey = String(quote.unit_key || 'NOIR');
          const selections = consultSelectionsToSpecialOfferOptions(quote.selections);
          const prepared = await prepareLiveTryOnAssetsFromConsult(unitKey, selections, (msg) => {
            if (!cancelled) setPrepHint(msg);
          });
          if (cancelled) return;
          setWigUrls(prepared.overlayUrls);
          if (prepared.usedFallback) {
            setPrepHint('SHOWING STUDIO PREVIEW — FULL TRY-ON LAYERS NEED A MOMENT ONLINE');
          } else {
            setPrepHint('');
          }
          return;
        }

        const prepared = await prepareLiveTryOnAssetsFromBaw(location.pathname, (msg) => {
          if (!cancelled) setPrepHint(msg);
        });
        if (cancelled) return;
        setWigUrls(prepared.overlayUrls);
        if (prepared.usedFallback) {
          setPrepHint('SHOWING STUDIO PREVIEW UNTIL YOUR COLOR LAYER IS READY');
        } else {
          setPrepHint('');
        }
      } catch (e) {
        if (cancelled) return;
        setPrepError(e instanceof Error ? e.message.toUpperCase() : 'PREP FAILED');
        setWigUrls(staticMannequinTripleForUnit('NOIR'));
        setPrepHint('');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quoteId, location.pathname]);

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
          POSITION YOUR FACE IN THE OVAL. TURN YOUR HEAD SLOWLY — THE WIG FOLLOWS YOUR ANGLE. MATCHES YOUR BUILD OR
          CONSULT SELECTIONS WHEN ONLINE.
        </p>
        {prepHint ? (
          <p
            className="text-center uppercase max-w-sm"
            style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24' }}
          >
            {prepHint}
          </p>
        ) : null}
        {prepError ? (
          <p className="text-center uppercase" style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080' }}>
            {prepError}
          </p>
        ) : null}
        <div className="w-full max-w-md">
          <LiveTryOnViewport wigUrls={wigUrls} />
        </div>
      </main>
    </div>
  );
}
