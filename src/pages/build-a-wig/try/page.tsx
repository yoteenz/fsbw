import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BawNoirWigPreviewHeroThumbs } from '../../../components/buildWig/BawNoirWigPreviewFrames';
import { BawTutorialGuidePanel } from '../../../components/buildWig/BawTutorialGuidePanel';
import {
  BAW_TUTORIAL_DEFAULT_SELECTIONS,
  BAW_TUTORIAL_OPTIONS,
  BAW_TUTORIAL_STEPS,
  BAW_TUTORIAL_ROUTE,
  isBawTryUnitSlug,
  resolveBawTutorialUnitLabelFromPathname,
  type BawTutorialSelections,
  type BawTutorialStepId,
} from '../../../constants/bawTutorialConfig';
import { NOIR_NATURAL_MANNEQUIN_TRIPLE } from '../../../utils/bawStaticMannequinReferencePaths';
import { applyBawTutorialDraftToBuilderStorage, saveBawTutorialGuestDraft } from '../../../utils/bawTutorialStorage';
import { renderBawSlayCardPng, shareOrDownloadBawSlayCard } from '../../../utils/bawSlayCard';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { BawViewSubscriptionsFooter } from '../../../components/buildWig/BawViewSubscriptionsFooter';
import { trackActivity } from '../../../utils/activity';

function stepIndex(step: BawTutorialStepId): number {
  return BAW_TUTORIAL_STEPS.indexOf(step);
}

function OptionChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 text-[10px] uppercase border border-black bg-white"
      style={{
        borderWidth: '1.3px',
        fontFamily: '"Futura PT Medium"',
        color: active ? '#EB1C24' : '#1A1A1A',
        backgroundColor: active ? 'rgba(235, 28, 36, 0.06)' : '#FFFFFF',
      }}
    >
      {label}
    </button>
  );
}

export default function BawTutorialPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/$/, '') || '/';
  const unitSlug =
    normalizedPath === BAW_TUTORIAL_ROUTE
      ? undefined
      : normalizedPath.startsWith(`${BAW_TUTORIAL_ROUTE}/`)
        ? normalizedPath.slice(`${BAW_TUTORIAL_ROUTE}/`.length).split('/')[0]
        : undefined;
  const unitLabel = useMemo(
    () => resolveBawTutorialUnitLabelFromPathname(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (unitSlug && !isBawTryUnitSlug(unitSlug)) {
      navigate(BAW_TUTORIAL_ROUTE, { replace: true });
    }
  }, [navigate, unitSlug]);

  const [step, setStep] = useState<BawTutorialStepId>('intro');
  const [selectedView, setSelectedView] = useState(1);
  const [selections, setSelections] = useState<BawTutorialSelections>(() => ({
    ...BAW_TUTORIAL_DEFAULT_SELECTIONS,
    unit: unitLabel,
  }));
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [cardBusy, setCardBusy] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    setSelections((prev) => ({ ...prev, unit: unitLabel }));
  }, [unitLabel]);

  const wigViews = useMemo(() => [...NOIR_NATURAL_MANNEQUIN_TRIPLE] as [string, string, string], []);

  const patchSelection = useCallback((patch: Partial<BawTutorialSelections>) => {
    setSelections((prev) => {
      const next = { ...prev, ...patch };
      saveBawTutorialGuestDraft(next);
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    const idx = stepIndex(step);
    if (idx < 0 || idx >= BAW_TUTORIAL_STEPS.length - 1) return;
    const nextStep = BAW_TUTORIAL_STEPS[idx + 1];
    setStep(nextStep);
    if (nextStep === 'card') {
      void (async () => {
        setCardBusy(true);
        try {
          const blob = await renderBawSlayCardPng(selections);
          const url = URL.createObjectURL(blob);
          setCardPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          trackActivity('baw_tutorial_reached_card', { unit: selections.unit });
        } catch {
          setShareStatus('COULD NOT BUILD SLAY CARD — TRY AGAIN.');
        } finally {
          setCardBusy(false);
        }
      })();
    }
  }, [selections, step]);

  const goBack = useCallback(() => {
    const idx = stepIndex(step);
    if (idx <= 0) {
      navigate('/home/shop');
      return;
    }
    setStep(BAW_TUTORIAL_STEPS[idx - 1]);
  }, [navigate, step]);

  const handleShare = useCallback(async () => {
    setShareStatus(null);
    setCardBusy(true);
    try {
      const blob = await renderBawSlayCardPng(selections);
      const result = await shareOrDownloadBawSlayCard(blob);
      setShareStatus(result === 'shared' ? 'SHARED!' : 'DOWNLOADED!');
      trackActivity('baw_tutorial_share_card', { unit: selections.unit, method: result });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setShareStatus('SHARE FAILED — TRY DOWNLOAD AGAIN.');
    } finally {
      setCardBusy(false);
    }
  }, [selections]);

  const handleSignInForFullBuilder = useCallback(() => {
    applyBawTutorialDraftToBuilderStorage(selections);
    trackActivity('baw_tutorial_sign_in_for_builder', { unit: selections.unit });
    const unitPath =
      selections.unit === 'NOIR'
        ? 'noir'
        : selections.unit === 'BLANCO'
          ? 'blanco'
          : selections.unit === 'SOFT WAVE'
            ? 'soft-wave'
            : selections.unit === 'BEACH WAVE'
              ? 'beach-wave'
              : selections.unit === 'SOFT CURL'
                ? 'soft-curl'
                : selections.unit === 'OCEAN CURL'
                  ? 'ocean-curl'
                  : 'noir';
    navigate(
      signInHrefWithReturnTo({
        pathname: `/build-a-wig/${unitPath}/customize`,
        search: '',
      })
    );
  }, [navigate, selections]);

  const progressPct = ((stepIndex(step) + 1) / BAW_TUTORIAL_STEPS.length) * 100;

  return (
    <div
      className="min-h-dvh pb-8"
      style={{
        backgroundImage: "url('/assets/marble-half.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
      data-attribute="baw-tutorial-page"
    >
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-black/10 bg-white/85 backdrop-blur-sm"
        style={{ borderWidth: '0 0 1.3px 0' }}
      >
        <button
          type="button"
          onClick={goBack}
          className="text-[10px] uppercase"
          style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
        >
          {step === 'intro' ? 'SHOP' : 'BACK'}
        </button>
        <div className="text-center">
          <p
            className="text-[9px] tracking-[0.2em] uppercase"
            style={{ fontFamily: '"Futura PT Book"', color: '#808080' }}
          >
            BUILD-A-WIG TRY
          </p>
          <p
            className="text-[11px] tracking-[0.08em] uppercase"
            style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
          >
            {unitLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/home/shop')}
          className="text-[10px] uppercase"
          style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
        >
          EXIT
        </button>
      </header>

      <div className="h-1 bg-gray-200 mx-4 mt-3 rounded-full overflow-hidden">
        <div className="h-full bg-[#EB1C24] transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      <main className="px-4 pt-4 max-w-lg mx-auto flex flex-col gap-4">
        <BawTutorialGuidePanel step={step} />

        {step !== 'card' ? (
          <BawNoirWigPreviewHeroThumbs
            wigViews={wigViews}
            selectedView={selectedView}
            onSelectView={setSelectedView}
            thumbSpacingLikeSubLive
            heroChildren={
              <p
                className="text-center text-[11px] uppercase mt-2"
                style={{ fontFamily: '"Futura PT Book"', color: '#808080' }}
              >
                STATIC PREVIEW — FULL BUILDER UNLOCKS LIVE 3D
              </p>
            }
          />
        ) : (
          <div
            className="border border-black bg-white/60 backdrop-blur-sm p-3 flex flex-col items-center gap-3"
            style={{ borderWidth: '1.3px' }}
          >
            {cardBusy && !cardPreviewUrl ? (
              <p
                className="text-[10px] uppercase py-16"
                style={{ fontFamily: '"Futura PT Medium"', color: '#808080' }}
              >
                BUILDING YOUR SLAY CARD…
              </p>
            ) : cardPreviewUrl ? (
              <img
                src={cardPreviewUrl}
                alt="Your slay card"
                className="w-full max-w-[320px] h-auto border border-black/20"
              />
            ) : null}
            {shareStatus ? (
              <p
                className="text-[10px] uppercase text-center"
                style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
              >
                {shareStatus}
              </p>
            ) : null}
          </div>
        )}

        {step === 'intro' && (
          <p
            className="text-[10px] uppercase text-center leading-relaxed"
            style={{ fontFamily: '"Futura PT Book"', color: '#808080' }}
          >
            FREE TUTORIAL — NO SIGN-IN. PREMIUM OPTIONS STAY LOCKED IN THE FULL BUILDER.
          </p>
        )}

        {step === 'length' && (
          <div className="flex flex-wrap justify-center gap-2">
            {BAW_TUTORIAL_OPTIONS.length.map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                active={selections.length === opt}
                onClick={() => patchSelection({ length: opt })}
              />
            ))}
          </div>
        )}

        {step === 'density' && (
          <div className="flex flex-wrap justify-center gap-2">
            {BAW_TUTORIAL_OPTIONS.density.map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                active={selections.density === opt}
                onClick={() => patchSelection({ density: opt })}
              />
            ))}
          </div>
        )}

        {step === 'color' && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-2">
              {BAW_TUTORIAL_OPTIONS.color.map((opt) => (
                <OptionChip
                  key={opt}
                  label={opt}
                  active={selections.color === opt}
                  onClick={() => patchSelection({ color: opt })}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'styling' && (
          <div className="flex flex-wrap justify-center gap-2">
            {BAW_TUTORIAL_OPTIONS.styling.map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                active={selections.styling === opt}
                onClick={() => patchSelection({ styling: opt })}
              />
            ))}
          </div>
        )}

        {step === 'card' && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={cardBusy}
              onClick={() => void handleShare()}
              className="w-full py-3 text-[11px] uppercase border border-black bg-white"
              style={{
                borderWidth: '1.3px',
                fontFamily: '"Futura PT Medium"',
                color: '#EB1C24',
              }}
            >
              {cardBusy ? 'WORKING…' : 'SHARE SLAY CARD'}
            </button>
            <button
              type="button"
              onClick={handleSignInForFullBuilder}
              className="w-full py-3 text-[11px] uppercase text-white"
              style={{
                fontFamily: '"Futura PT Medium"',
                backgroundColor: '#EB1C24',
              }}
            >
              SIGN IN FOR FULL BUILD-A-WIG
            </button>
            <BawViewSubscriptionsFooter
              className="w-full py-2 text-[10px] uppercase"
              buttonWidth="100%"
              style={{ marginTop: 0 }}
            />
          </div>
        )}

        {step !== 'card' && (
          <button
            type="button"
            onClick={goNext}
            className="w-full py-3 text-[11px] uppercase text-white mt-2"
            style={{
              fontFamily: '"Futura PT Medium"',
              backgroundColor: '#EB1C24',
            }}
          >
            {step === 'intro' ? 'START' : step === 'styling' ? 'MAKE MY SLAY CARD' : 'NEXT'}
          </button>
        )}
      </main>
    </div>
  );
}
