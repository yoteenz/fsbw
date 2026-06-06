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
import type { LiveTryOnCompareBundles, LiveTryOnPreparedAssets } from '../../../utils/liveTryOnPrepareAssets';
import {
  prepareLiveTryOnAssetsFromBaw,
  prepareLiveTryOnAssetsFromConsult,
  prepareLiveTryOnCompareModel,
} from '../../../utils/liveTryOnPrepareAssets';
import {
  buildLiveTryOnPayloadFromBaw,
  buildLiveTryOnPayloadFromConsult,
  type LiveTryOnSourcePayload,
} from '../../../utils/liveTryOnSelections';

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
  const [prepAttempt, setPrepAttempt] = useState(0);
  const [compareLoading, setCompareLoading] = useState(false);
  const [payloadRef, setPayloadRef] = useState<LiveTryOnSourcePayload | null>(null);

  const backTarget = useMemo(() => {
    if (returnTo.startsWith('/')) return returnTo;
    return '/build-a-wig';
  }, [returnTo]);

  const applyPrepared = useCallback((prepared: LiveTryOnPreparedAssets) => {
    setPhotoModel(prepared.activePhotoModel);
    writeLiveTryOnPhotoModelPreference(prepared.activePhotoModel);
    setCompare(prepared.compare);
    setWigUrls(prepared.overlayUrls);
    if (!prepared.partial) setPrepHint('');
  }, []);

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
        setPrepHint('LOADING YOUR SELECTIONS…');

        const progress = (partial: LiveTryOnPreparedAssets) => {
          if (cancelled) return;
          applyPrepared(partial);
        };

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
          const payload = buildLiveTryOnPayloadFromConsult(unitKey, selections);
          setPayloadRef(payload);
          const prepared = await prepareLiveTryOnAssetsFromConsult(
            unitKey,
            selections,
            photoModel,
            (msg) => {
              if (!cancelled) setPrepHint(msg);
            },
            { onProgress: progress }
          );
          if (cancelled) return;
          applyPrepared(prepared);
          return;
        }

        const payload = buildLiveTryOnPayloadFromBaw(location.pathname);
        setPayloadRef(payload);
        const prepared = await prepareLiveTryOnAssetsFromBaw(
          location.pathname,
          photoModel,
          (msg) => {
            if (!cancelled) setPrepHint(msg);
          },
          { onProgress: progress }
        );
        if (cancelled) return;
        applyPrepared(prepared);
      } catch (e) {
        if (cancelled) return;
        const raw = e instanceof Error ? e.message : 'PREP FAILED';
        const friendly =
          raw === 'LIVE_TRYON_TIMEOUT'
            ? 'ONE STEP TIMED OUT ON THE SERVER. PARTIAL LAYERS MAY BE SAVED — TAP TRY AGAIN TO RESUME.'
            : raw.toUpperCase();
        setPrepError(friendly);
        setPrepHint('');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quoteId, location.pathname, prepAttempt, applyPrepared, photoModel]);

  const handleSelectModel = (model: LiveTryOnPhotoModel) => {
    applyPhotoModel(model, compare);
  };

  const handleLoadCompare = async () => {
    if (!payloadRef || compareLoading) return;
    setCompareLoading(true);
    setPrepError(null);
    try {
      const prepared = await prepareLiveTryOnCompareModel(payloadRef, photoModel, setPrepHint);
      applyPrepared(prepared);
    } catch (e) {
      setPrepError(e instanceof Error ? e.message.toUpperCase() : 'COMPARE PREP FAILED');
    } finally {
      setCompareLoading(false);
      setPrepHint('');
    }
  };

  const showCompareBar = Boolean(compare?.portraits?.nbp || compare?.portraits?.gpt2);
  const gpt2Missing = !compare?.portraits?.gpt2 && !compare?.overlays?.gpt2;

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
          POSITION YOUR FACE IN THE OVAL. TURN YOUR HEAD SLOWLY — THE WIG FOLLOWS YOUR ANGLE. NBP RUNS FIRST (FASTEST);
          GPT IMAGE 2 COMPARE IS OPTIONAL.
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
          <div className="flex flex-col items-center gap-2 max-w-sm">
            <p
              className="text-center uppercase"
              style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}
            >
              {prepError}
            </p>
            <button
              type="button"
              onClick={() => setPrepAttempt((n) => n + 1)}
              className="text-[10px] border border-black px-3 py-1 bg-white/80 uppercase"
              style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
            >
              TRY AGAIN
            </button>
          </div>
        ) : null}
        {gpt2Missing && wigUrls && !compareLoading ? (
          <button
            type="button"
            onClick={handleLoadCompare}
            className="text-[10px] border border-black px-3 py-1 bg-white/80 uppercase"
            style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
          >
            GENERATE GPT IMAGE 2 COMPARE
          </button>
        ) : null}
        {compareLoading ? (
          <p
            className="text-center uppercase max-w-sm"
            style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24' }}
          >
            BUILDING GPT IMAGE 2 COMPARE…
          </p>
        ) : null}
        {showCompareBar ? (
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
                {prepError ? 'CAMERA OPENS WHEN THE FIRST HAIR LAYER IS READY — OR TAP TRY AGAIN' : 'PREPARING…'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
