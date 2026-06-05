import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LiveTryOnModelCompareBar from '../../../components/liveTryOn/LiveTryOnModelCompareBar';
import LiveTryOnViewport from '../../../components/liveTryOn/LiveTryOnViewport';
import type { LiveTryOnPhotoModel } from '../../../constants/liveTryOnSpikeAssets';
import { getConsultQuote } from '../../../utils/api';
import { consultSelectionsToSpecialOfferOptions } from '../../../utils/consultOfferFromQuote';
import {
  parseLiveTryOnPhotoModelParam,
  readLiveTryOnPhotoModelPreference,
  writeLiveTryOnPhotoModelPreference,
} from '../../../utils/liveTryOnPhotoModel';
import type { LiveTryOnCompareBundles } from '../../../utils/liveTryOnPrepareAssets';
import {
  prepareLiveTryOnAssetsFromBaw,
  prepareLiveTryOnAssetsFromConsult,
} from '../../../utils/liveTryOnPrepareAssets';

export default function LiveTryOnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const quoteId = searchParams.get('quoteId') || '';

  const initialPhotoModel = useMemo(() => {
    const fromQuery = parseLiveTryOnPhotoModelParam(searchParams.get('tryonModel'));
    return fromQuery ?? readLiveTryOnPhotoModelPreference();
  }, [searchParams]);

  const [photoModel, setPhotoModel] = useState<LiveTryOnPhotoModel>(initialPhotoModel);
  const [prepHint, setPrepHint] = useState('LOADING YOUR SELECTIONS…');
  const [wigUrls, setWigUrls] = useState<[string, string, string] | null>(null);
  const [compare, setCompare] = useState<LiveTryOnCompareBundles | undefined>();
  const [prepError, setPrepError] = useState<string | null>(null);

  const backTarget = useMemo(() => {
    if (returnTo.startsWith('/')) return returnTo;
    return '/build-a-wig';
  }, [returnTo]);

  const applyPhotoModel = useCallback(
    (model: LiveTryOnPhotoModel, bundles?: LiveTryOnCompareBundles) => {
      setPhotoModel(model);
      writeLiveTryOnPhotoModelPreference(model);
      const overlays = bundles?.overlays?.[model];
      if (overlays) setWigUrls(overlays);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setPrepError(null);
        if (quoteId) {
          setPrepHint('LOADING CONSULT OFFER…');
          const res = await getConsultQuote(quoteId);
          if (cancelled) return;
          const quote = res?.quote as Record<string, unknown> | undefined;
          if (!quote) {
            setPrepError('OFFER NOT FOUND');
            return;
          }
          const unitKey = String(quote.unit_key || 'NOIR');
          const selections = consultSelectionsToSpecialOfferOptions(quote.selections);
          const prepared = await prepareLiveTryOnAssetsFromConsult(
            unitKey,
            selections,
            photoModel,
            (msg) => {
              if (!cancelled) setPrepHint(msg);
            }
          );
          if (cancelled) return;
          setCompare(prepared.compare);
          applyPhotoModel(prepared.activePhotoModel, prepared.compare);
          setWigUrls(prepared.overlayUrls);
          setPrepHint('');
          return;
        }

        const prepared = await prepareLiveTryOnAssetsFromBaw(location.pathname, photoModel, (msg) => {
          if (!cancelled) setPrepHint(msg);
        });
        if (cancelled) return;
        setCompare(prepared.compare);
        applyPhotoModel(prepared.activePhotoModel, prepared.compare);
        setWigUrls(prepared.overlayUrls);
        setPrepHint('');
      } catch (e) {
        if (cancelled) return;
        setPrepError(e instanceof Error ? e.message.toUpperCase() : 'PREP FAILED');
        setWigUrls(null);
        setPrepHint('');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prep runs once per mount / quote; model switch uses cached compare
  }, [quoteId, location.pathname]);

  const handleSelectModel = (model: LiveTryOnPhotoModel) => {
    applyPhotoModel(model, compare);
  };

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
        <span className="text-[11px] text-black">LIVE TRY ON</span>
        <span className="w-[52px]" aria-hidden />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-6 gap-3">
        <p
          className="text-center uppercase max-w-sm"
          style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
        >
          POSITION YOUR FACE IN THE OVAL. TURN YOUR HEAD SLOWLY — THE WIG FOLLOWS YOUR ANGLE. HAIR IS BUILT FROM YOUR
          COLOR ON A PHOTOREAL MODEL (NOT THE GREY MANNEQUIN).
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
          <p
            className="text-center uppercase max-w-sm"
            style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
          >
            {prepError}
          </p>
        ) : null}
        {compare ? (
          <LiveTryOnModelCompareBar activeModel={photoModel} compare={compare} onSelectModel={handleSelectModel} />
        ) : null}
        <div className="w-full max-w-md">
          {wigUrls ? (
            <LiveTryOnViewport wigUrls={wigUrls} />
          ) : (
            <div
              className="aspect-[3/4] w-full border border-black/20 bg-black/5 flex items-center justify-center px-6"
              aria-hidden={!prepError}
            >
              <p
                className="text-center uppercase"
                style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
              >
                {prepError ? 'CAMERA PREVIEW WILL OPEN WHEN YOUR HAIR LAYERS ARE READY' : 'PREPARING…'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
