import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminStudioDirectorModePath, adminStudioProductionBuilderPath } from '../../../../utils/adminStudioRoutes';
import { useAdminStudioDirectorMode } from '../../../../hooks/useAdminStudioDirectorModeState';
import { DirectorModeEntrance } from './DirectorModeEntrance';
import { DirectorModeTimeline } from './DirectorModeTimeline';
import { DirectorModeCinemaPreview } from './DirectorModeCinemaPreview';
import { DirectorModeControls } from './DirectorModeControls';
import { DirectorModeConsole } from './DirectorModeConsole';
import { DirectorModeStoryboard, DirectorModeScriptPanel, DirectorModeShotList } from './DirectorModeStoryboard';
import { DirectorModeRehearsalOverlay, DirectorModeClientPreview } from './DirectorModeRehearsal';
import { dmActionBtnStyle } from './directorModeTheme';

export function DirectorModeWorkspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const draftId = searchParams.get('draftId') ?? undefined;

  const {
    draft,
    session,
    activeScene,
    activeMeta,
    setActiveSceneId,
    entranceComplete,
    checklist,
    readiness,
    consoleMetrics,
    rehearsalSteps,
    rehearsalStep,
    canGenerate,
    swapAsset,
    setCameraOverride,
    setLightingOverride,
    setMusic,
    toggleGraphics,
    updateVoice,
    updateSceneMeta,
    reorderTimeline,
    saveSnapshot,
    toggleClientPreview,
    startRehearsal,
    stopRehearsal,
    advanceRehearsal,
    generateProduction,
  } = useAdminStudioDirectorMode(draftId);

  if (!draftId || !draft || !session) {
    return (
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', textAlign: 'center', padding: '24px' }}>
        NO PRODUCTION LOADED — OPEN FROM PRODUCTION BUILDER
      </p>
    );
  }

  return (
    <DirectorModeEntrance active={entranceComplete}>
      <div className="mb-2 flex justify-between items-center gap-2">
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24' }}>{draft.productionName}</p>
        <button
          type="button"
          onClick={() => navigate(adminStudioProductionBuilderPath(draft.contentPackId))}
          style={dmActionBtnStyle}
        >
          ← BACK TO BUILDER
        </button>
      </div>

      <div
        className="grid gap-3 mb-3"
        style={{
          gridTemplateColumns: 'minmax(130px, 20%) minmax(0, 1fr) minmax(150px, 24%)',
          minHeight: 'min(50vh, 480px)',
        }}
      >
        <DirectorModeTimeline
          draft={draft}
          session={session}
          activeSceneId={activeScene?.id}
          onSelectScene={setActiveSceneId}
          onReorder={reorderTimeline}
        />
        <DirectorModeCinemaPreview
          scene={activeScene}
          session={session}
          cta={draft.cta}
          graphics={session.graphics}
        />
        <DirectorModeControls
          scene={activeScene}
          meta={activeMeta}
          session={session}
          voice={session.voice}
          graphics={session.graphics}
          onSwapAsset={swapAsset}
          onCamera={setCameraOverride}
          onLighting={setLightingOverride}
          onMusic={setMusic}
          onToggleGraphics={toggleGraphics}
          onVoiceChange={updateVoice}
          onDirectorNotes={(notes) => updateSceneMeta({ directorNotes: notes })}
        />
      </div>

      <DirectorModeStoryboard
        scenes={draft.scenes}
        sceneMeta={session.sceneMeta}
        activeSceneId={activeScene?.id}
        cta={draft.cta}
        onSelectScene={setActiveSceneId}
      />

      <DirectorModeScriptPanel sceneName={activeScene?.name ?? ''} meta={activeMeta} onUpdate={updateSceneMeta} />
      <DirectorModeShotList meta={activeMeta} />

      {session.snapshots.length > 0 ? (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {session.snapshots.map((snap) => (
            <div key={snap.id} style={{ border: '1.3px solid rgba(0,0,0,0.12)', padding: '6px', fontSize: '7px', fontFamily: '"Futura PT Book"' }}>
              {snap.label} · {snap.savedAt}
            </div>
          ))}
        </div>
      ) : null}

      <DirectorModeConsole
        metrics={consoleMetrics}
        readiness={readiness}
        checklist={checklist}
        canGenerate={canGenerate}
        onRehearsal={session.rehearsalActive ? stopRehearsal : startRehearsal}
        onGenerate={generateProduction}
        onSaveSnapshot={saveSnapshot}
        onClientPreview={toggleClientPreview}
        rehearsalActive={session.rehearsalActive}
      />

      <DirectorModeRehearsalOverlay
        active={session.rehearsalActive}
        steps={rehearsalSteps}
        currentStep={rehearsalStep}
        onAdvance={advanceRehearsal}
        onStop={stopRehearsal}
      />

      <DirectorModeClientPreview
        active={session.clientPreviewMode}
        draft={draft}
        session={session}
        onClose={toggleClientPreview}
      />
    </DirectorModeEntrance>
  );
}

/** Full-screen transition overlay before navigating to Director Mode. */
export function DirectorModeEnterOverlay({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'blur' | 'fade'>('idle');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }
    setPhase('blur');
    const t1 = setTimeout(() => setPhase('fade'), 400);
    const t2 = setTimeout(() => {
      onComplete();
      setPhase('idle');
    }, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, onComplete]);

  if (!active && phase === 'idle') return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      style={{
        background: phase === 'fade' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.4)',
        backdropFilter: phase === 'blur' ? 'blur(12px)' : 'blur(0px)',
        transition: 'all 0.5s ease',
        opacity: active || phase !== 'idle' ? 1 : 0,
      }}
    >
      <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '28px', color: '#EB1C24', textTransform: 'uppercase' }}>
        🎬 Director Mode
      </p>
    </div>
  );
}

export function navigateToDirectorMode(navigate: ReturnType<typeof useNavigate>, draftId: string, packId?: string) {
  navigate(adminStudioDirectorModePath(draftId, packId));
}