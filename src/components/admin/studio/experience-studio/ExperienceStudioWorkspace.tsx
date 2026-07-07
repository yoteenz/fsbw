import { useState } from 'react';
import { useExperienceStudioState } from '../../../../hooks/useExperienceStudioState';
import { EXPERIENCE_STUDIO_STYLES } from './experienceStudioTheme';
import {
  ExperienceStudioCanvas,
  ExperienceStudioDesignDnaPanel,
  ExperienceStudioDesignHealth,
  ExperienceStudioDirectorPanel,
  ExperienceStudioEntry,
  ExperienceStudioExperienceDnaPanel,
  ExperienceStudioInterview,
  ExperienceStudioOrbBar,
  ExperienceStudioRemixPanel,
} from './ExperienceStudioPanels';

/** Experience Studio™ — Studio OS experience builder · not a page builder · a creative agency. */
export function ExperienceStudioWorkspace() {
  const {
    companyName,
    session,
    canvasTokens,
    critiques,
    designHealth,
    designHealthScore,
    pickExperienceType,
    answerInterview,
    openPanel,
    closePanel,
    setDesignDna,
    setExperienceDnaSlider,
    remix,
    restart,
    backInterview,
  } = useExperienceStudioState();

  const [healthExpanded, setHealthExpanded] = useState(false);

  const handleBackFromInterview = () => {
    backInterview();
  };

  return (
    <>
      <style>{EXPERIENCE_STUDIO_STYLES}</style>
      <div
        className="es-root"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 12,
          padding: session.phase === 'builder' ? 12 : 20,
        }}
      >
        {session.phase === 'entry' ? (
          <ExperienceStudioEntry companyName={companyName} session={session} onSelect={pickExperienceType} />
        ) : null}

        {session.phase === 'interview' ? (
          <ExperienceStudioInterview session={session} onAnswer={answerInterview} onBack={handleBackFromInterview} />
        ) : null}

        {session.phase === 'builder' ? (
          <div>
            <div className="flex justify-end mb-2">
              <ExperienceStudioDesignHealth
                score={designHealthScore}
                categories={designHealth}
                expanded={healthExpanded}
                onToggle={() => setHealthExpanded((e) => !e)}
              />
            </div>

            <ExperienceStudioCanvas session={session} tokens={canvasTokens} companyName={companyName} />

            <ExperienceStudioOrbBar
              onDesignDna={() => openPanel(session.panelOpen === 'design-dna' ? 'none' : 'design-dna')}
              onExperienceDna={() => openPanel(session.panelOpen === 'experience-dna' ? 'none' : 'experience-dna')}
              onDirector={() => openPanel(session.panelOpen === 'director' ? 'none' : 'director')}
              onRemix={() => openPanel(session.panelOpen === 'remix' ? 'none' : 'remix')}
              onRestart={restart}
            />

            {session.panelOpen !== 'none' ? (
              <div className="fixed inset-0 z-[100050] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(10,10,12,0.35)', backdropFilter: 'blur(6px)' }}>
                <div className="w-full max-w-md max-h-[78vh] overflow-y-auto relative">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="absolute top-2 right-2 z-10 px-2 py-1"
                    style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer' }}
                  >
                    CLOSE
                  </button>
                  {session.panelOpen === 'design-dna' ? (
                    <ExperienceStudioDesignDnaPanel designDna={session.designDna} onChange={setDesignDna} />
                  ) : null}
                  {session.panelOpen === 'experience-dna' ? (
                    <ExperienceStudioExperienceDnaPanel experienceDna={session.experienceDna} onSlider={setExperienceDnaSlider} />
                  ) : null}
                  {session.panelOpen === 'director' ? (
                    <ExperienceStudioDirectorPanel critiques={critiques} />
                  ) : null}
                  {session.panelOpen === 'remix' ? (
                    <ExperienceStudioRemixPanel onRemix={remix} lastRemix={session.lastRemix} />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
