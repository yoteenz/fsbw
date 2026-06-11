import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LiveTryOnModelCompareBar from '../../../components/liveTryOn/LiveTryOnModelCompareBar';
import LiveTryOnStudioCapture from '../../../components/liveTryOn/LiveTryOnStudioCapture';
import LiveTryOnViewport from '../../../components/liveTryOn/LiveTryOnViewport';
import {
  LIVE_TRY_ON_PHOTO_MODEL_LABELS,
  type LiveTryOnPhotoModel,
} from '../../../constants/liveTryOnSpikeAssets';
import { getConsultQuote } from '../../../utils/api';
import type { ConsultQuoteSelections } from '../../../utils/consultOfferFromQuote';
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
import {
  bawPathnameFromReturnTo,
  buildLiveTryOnPayloadFromBaw,
  buildLiveTryOnPayloadFromConsult,
  type LiveTryOnSourcePayload,
} from '../../../utils/liveTryOnSelections';

type TryOnMode = 'studio' | 'preview';

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

  const [mode, setMode] = useState<TryOnMode>('studio');
  const [photoModel, setPhotoModel] = useState<LiveTryOnPhotoModel>(initialPhotoModel);
  const [prepHint, setPrepHint] = useState('LOADING YOUR LOOK…');
  const [wigUrls, setWigUrls] = useState<[string, string, string] | null>(null);
  const [compare, setCompare] = useState<LiveTryOnCompareBundles | undefined>();
  const [sourcePayload, setSourcePayload] = useState<LiveTryOnSourcePayload | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [modelHint, setModelHint] = useState<string | null>(null);

  const bawPathname = useMemo(() => {
    if (returnTo.startsWith('/build-a-wig')) return bawPathnameFromReturnTo(returnTo);
    if (location.pathname.startsWith('/build-a-wig')) return location.pathname;
    return bawPathnameFromReturnTo(returnTo);
  }, [returnTo, location.pathname]);

  const backTarget = useMemo(() => {
    if (returnTo.startsWith('/')) return returnTo;
    return '/build-a-wig';
  }, [returnTo]);

  const applyPhotoModel = useCallback(
    (model: LiveTryOnPhotoModel, bundles?: LiveTryOnCompareBundles) => {
      setPhotoModel(model);
      writeLiveTryOnPhotoModelPreference(model);
      const overlays = bundles?.overlays?.[model];
      if (overlays) {
        setWigUrls(overlays);
        setModelHint(null);
        return;
      }
      if (bundles?.portraits?.[model]) {
        setModelHint(
          `${LIVE_TRY_ON_PHOTO_MODEL_LABELS[model]} PORTRAITS ARE READY — PICK WINNER IN ADMIN AND RUN IDEOGRAM CUT FOR ANGLE PREVIEW.`
        );
        return;
      }
      setModelHint(`${LIVE_TRY_ON_PHOTO_MODEL_LABELS[model]} NOT PREPPED YET — GENERATE IN ADMIN → LIVE TRY-ON.`);
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
          setSourcePayload(
            buildLiveTryOnPayloadFromConsult(unitKey, quote.selections as ConsultQuoteSelections)
          );
          const prepared = await prepareLiveTryOnAssetsFromConsult(
            unitKey,
            quote.selections as ConsultQuoteSelections,
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

        const payload = buildLiveTryOnPayloadFromBaw(bawPathname);
        setSourcePayload(payload);
        const prepared = await prepareLiveTryOnAssetsFromBaw(bawPathname, photoModel, (msg) => {
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
  }, [quoteId, bawPathname, applyPhotoModel, photoModel]);

  const handleSelectModel = (model: LiveTryOnPhotoModel) => {
    applyPhotoModel(model, compare);
  };

  const showCompareBar = Boolean(compare?.portraits?.nbp || compare?.portraits?.gpt2);
  const studioReady = Boolean(sourcePayload?.color);

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
        <span className="text-[11px] text-black">TRY ON</span>
        <span className="w-[52px]" aria-hidden />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-6 gap-3">
        <div
          className="flex w-full max-w-md border border-black overflow-hidden"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', textTransform: 'uppercase' }}
        >
          <button
            type="button"
            onClick={() => setMode('studio')}
            className="flex-1 py-2 px-2"
            style={{
              backgroundColor: mode === 'studio' ? '#EB1C24' : 'rgba(255,255,255,0.8)',
              color: mode === 'studio' ? '#FFFFFF' : '#000000',
            }}
          >
            STUDIO TRY-ON
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className="flex-1 py-2 px-2 border-l border-black"
            style={{
              backgroundColor: mode === 'preview' ? '#EB1C24' : 'rgba(255,255,255,0.8)',
              color: mode === 'preview' ? '#FFFFFF' : '#000000',
            }}
          >
            ANGLE PREVIEW
          </button>
        </div>

        <p
          className="text-center uppercase max-w-sm"
          style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
        >
          {mode === 'studio'
            ? 'CAPTURE YOUR FACE — OUR STUDIO APPLIES YOUR WIG FOR A PHOTOREAL RESULT. THIS IS THE RECOMMENDED EXPERIENCE.'
            : 'LIVE ANGLE PREVIEW — QUICK CHECK AS YOU TURN. FOR A REALISTIC LOOK, USE STUDIO TRY-ON.'}
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
        {showCompareBar ? (
          <LiveTryOnModelCompareBar activeModel={photoModel} compare={compare} onSelectModel={handleSelectModel} />
        ) : null}
        {modelHint ? (
          <p
            className="text-center uppercase max-w-sm"
            style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24', lineHeight: 1.5 }}
          >
            {modelHint}
          </p>
        ) : null}

        <div className="w-full max-w-md">
          {mode === 'studio' ? (
            studioReady && sourcePayload ? (
              <LiveTryOnStudioCapture sourcePayload={sourcePayload} />
            ) : (
              <div
                className="aspect-[3/4] w-full border border-black/20 bg-black/5 flex items-center justify-center px-6"
                aria-hidden={!prepError}
              >
                <p
                  className="text-center uppercase"
                  style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
                >
                  {prepError ? 'THIS COLOR MAY NOT BE STUDIO-READY YET' : 'LOADING…'}
                </p>
              </div>
            )
          ) : wigUrls ? (
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
                {prepError ? 'OVERLAYS NOT READY — USE STUDIO TRY-ON OR RUN BATCH IN ADMIN' : 'LOADING…'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
