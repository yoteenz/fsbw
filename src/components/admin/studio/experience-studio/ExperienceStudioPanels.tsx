import type { CSSProperties } from 'react';
import {
  DESIGN_DNA_PERSONALITIES,
  EXPERIENCE_ENTRY_CARDS,
  INTERVIEW_AUDIENCE_CHOICES,
  INTERVIEW_FEELING_CHOICES,
  INTERVIEW_STYLE_CHOICES,
  REMIX_OPTIONS,
} from '../../../../studio-os-core/experience-studio';
import type { CreativeDirectorCritique, DesignHealthCategory, ResolvedCanvasTokens } from '../../../../studio-os-core/experience-studio';
import { experienceTypeLabel, orbWelcomeLine } from '../../../../studio-os-core/experience-studio';
import type { ExperienceStudioSession } from '../../../../studio-os-core/experience-studio';
import { ES, esChoiceChip, esGlass, esHeadline, esMeta, esSubhead, healthColor } from './experienceStudioTheme';

type EntryProps = {
  companyName: string;
  session: ExperienceStudioSession;
  onSelect: (id: (typeof EXPERIENCE_ENTRY_CARDS)[number]['id']) => void;
};

export function ExperienceStudioEntry({ companyName, session, onSelect }: EntryProps) {
  const welcome = orbWelcomeLine(session).split('\n\n');

  return (
    <div className="es-enter">
      <div className="flex items-start gap-4 mb-8">
        <span className="es-orb-mark shrink-0" aria-hidden />
        <div>
          <p style={esMeta}>STUDIO INTELLIGENCE · CREATIVE DIRECTOR</p>
          <h2 style={{ ...esHeadline, fontSize: '20px', marginTop: 8 }}>{welcome[0]}</h2>
          {welcome[1] ? (
            <p style={{ ...esSubhead, marginTop: 10, maxWidth: 280 }}>{welcome[1]}</p>
          ) : null}
          <p style={{ ...esMeta, marginTop: 12, color: ES.red }}>{companyName.toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EXPERIENCE_ENTRY_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className="text-left p-4 es-enter"
            style={{
              ...esGlass,
              minHeight: 88,
              cursor: 'pointer',
            }}
          >
            <p style={{ ...esMeta, color: ES.red, marginBottom: 6 }}>{card.label.toUpperCase()}</p>
            <p style={{ ...esSubhead, fontSize: '7px', lineHeight: 1.45 }}>{card.hint}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

type InterviewProps = {
  session: ExperienceStudioSession;
  onAnswer: (step: 'style' | 'audience' | 'feeling', choice: string) => void;
  onBack: () => void;
};

export function ExperienceStudioInterview({ session, onAnswer, onBack }: InterviewProps) {
  const step = session.interviewStep;
  const prompt = orbWelcomeLine(session);
  const choices =
    step === 'style'
      ? INTERVIEW_STYLE_CHOICES
      : step === 'audience'
        ? INTERVIEW_AUDIENCE_CHOICES
        : INTERVIEW_FEELING_CHOICES;

  return (
    <div className="es-enter">
      <button type="button" onClick={onBack} style={{ ...esMeta, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
        ← BACK
      </button>
      <div className="flex items-start gap-4 mb-6">
        <span className="es-orb-mark shrink-0" aria-hidden />
        <div>
          <p style={esMeta}>CONVERSATIONAL DESIGN SESSION</p>
          <h2 style={{ ...esHeadline, fontSize: '18px', marginTop: 8 }}>{prompt}</h2>
          <p style={{ ...esSubhead, marginTop: 8 }}>
            {experienceTypeLabel(session.experienceType)} · Studio Intelligence™ shapes layout, type, and motion from your answers.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onAnswer(step, choice)}
            style={esChoiceChip}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

type CanvasProps = {
  session: ExperienceStudioSession;
  tokens: ResolvedCanvasTokens;
  companyName: string;
};

export function ExperienceStudioCanvas({ session, tokens, companyName }: CanvasProps) {
  const heroStyle: CSSProperties = {
    padding: tokens.heroPadding,
    borderRadius: tokens.borderRadius,
    background: tokens.backgroundTone,
    backdropFilter: `blur(${12 + tokens.glassOpacity * 16}px)`,
    border: '1px solid rgba(255,255,255,0.85)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
    minHeight: 320,
    transition: 'padding 0.5s ease, border-radius 0.5s ease, background 0.5s ease',
  };

  return (
    <div className={`es-canvas-enter ${tokens.motionClass}`} style={heroStyle}>
      <p style={{ ...esMeta, color: tokens.accentHex }}>
        {experienceTypeLabel(session.experienceType)} · LIVE PREVIEW
      </p>
      <h1
        style={{
          fontFamily: tokens.headlineFont,
          fontSize: tokens.headlineSize,
          letterSpacing: tokens.letterSpacing,
          color: ES.black,
          margin: '16px 0 12px',
          lineHeight: 1.12,
          transition: 'font-size 0.5s ease',
        }}
      >
        {companyName}
      </h1>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: tokens.bodySize, color: ES.gray, lineHeight: 1.55, maxWidth: '92%' }}>
        {session.audienceChoice
          ? `Crafted for ${session.audienceChoice} — visitors should feel ${session.feelingChoice ?? 'understood'}.`
          : 'Your experience narrative appears here as Studio Intelligence composes the world.'}
      </p>
      <div
        className="mt-6 inline-block px-4 py-2"
        style={{
          borderRadius: Math.max(4, tokens.borderRadius - 4),
          background: tokens.accentHex,
          color: '#fff',
          fontFamily: '"Futura PT Medium"',
          fontSize: '7px',
          letterSpacing: '0.12em',
        }}
      >
        PRIMARY ACTION
      </div>
      <div className="grid grid-cols-3 gap-2 mt-8 opacity-80">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 48 + (100 - session.experienceDna.density) * 0.2,
              borderRadius: tokens.borderRadius * 0.6,
              background: `rgba(255,255,255,${tokens.glassOpacity})`,
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

type DesignDnaPanelProps = {
  designDna: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
};

export function ExperienceStudioDesignDnaPanel({ designDna, onChange }: DesignDnaPanelProps) {
  const setWeight = (id: string, value: number) => {
    const next = { ...designDna, [id]: value };
    onChange(next);
  };

  return (
    <div className="es-slide-panel p-4" style={esGlass}>
      <p style={esMeta}>DESIGN DNA™</p>
      <p style={{ ...esSubhead, marginTop: 6, marginBottom: 12 }}>Blend personalities — Studio Intelligence generates layout, type, spacing, and motion.</p>
      {DESIGN_DNA_PERSONALITIES.map((p) => (
        <div key={p.id} className="mb-3">
          <div className="flex justify-between mb-1">
            <span style={{ ...esMeta, color: p.accent }}>{p.label}</span>
            <span style={esMeta}>{Math.round(designDna[p.id] ?? 0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={designDna[p.id] ?? 0}
            onChange={(e) => setWeight(p.id, Number(e.target.value))}
            className="w-full accent-red-600"
            aria-label={`${p.label} blend`}
          />
        </div>
      ))}
    </div>
  );
}

type ExperienceDnaPanelProps = {
  experienceDna: ExperienceStudioSession['experienceDna'];
  onSlider: (key: keyof ExperienceStudioSession['experienceDna'], value: number) => void;
};

const EXPERIENCE_DNA_LABELS: { key: keyof ExperienceStudioSession['experienceDna']; label: string }[] = [
  { key: 'motion', label: 'Motion' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'depth', label: 'Depth' },
  { key: 'glass', label: 'Glass' },
  { key: 'storytelling', label: 'Environmental storytelling' },
  { key: 'navigation', label: 'Navigation behavior' },
  { key: 'interaction', label: 'Interaction language' },
  { key: 'animation', label: 'Animation intensity' },
  { key: 'transitions', label: 'Page transitions' },
  { key: 'density', label: 'Visual density' },
];

export function ExperienceStudioExperienceDnaPanel({ experienceDna, onSlider }: ExperienceDnaPanelProps) {
  return (
    <div className="es-slide-panel p-4" style={esGlass}>
      <p style={esMeta}>EXPERIENCE DNA™</p>
      <p style={{ ...esSubhead, marginTop: 6, marginBottom: 12 }}>Refine feel — updates apply to the live preview in real time.</p>
      {EXPERIENCE_DNA_LABELS.map(({ key, label }) => (
        <div key={key} className="mb-3">
          <div className="flex justify-between mb-1">
            <span style={esMeta}>{label.toUpperCase()}</span>
            <span style={esMeta}>{experienceDna[key]}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={experienceDna[key]}
            onChange={(e) => onSlider(key, Number(e.target.value))}
            className="w-full"
            aria-label={label}
          />
        </div>
      ))}
    </div>
  );
}

type DirectorPanelProps = { critiques: CreativeDirectorCritique[] };

export function ExperienceStudioDirectorPanel({ critiques }: DirectorPanelProps) {
  return (
    <div className="es-slide-panel p-4" style={esGlass}>
      <p style={esMeta}>AI CREATIVE DIRECTOR™</p>
      <p style={{ ...esSubhead, marginTop: 6, marginBottom: 12 }}>
        Studio Intelligence critiques with context — never silent changes.
      </p>
      {critiques.map((c) => (
        <div key={c.id} className="mb-3 pb-3" style={{ borderBottom: ES.borderSubtle }}>
          <p style={{ ...esMeta, color: c.severity === 'critical' ? ES.red : ES.gray }}>{c.severity.toUpperCase()}</p>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', marginTop: 4, lineHeight: 1.45 }}>{c.message}</p>
          <p style={{ ...esSubhead, fontSize: '7px', marginTop: 4 }}>{c.why}</p>
        </div>
      ))}
    </div>
  );
}

type RemixPanelProps = { onRemix: (label: string) => void; lastRemix: string | null };

export function ExperienceStudioRemixPanel({ onRemix, lastRemix }: RemixPanelProps) {
  return (
    <div className="es-slide-panel p-4" style={esGlass}>
      <p style={esMeta}>REMIX™</p>
      <p style={{ ...esSubhead, marginTop: 6, marginBottom: 12 }}>
        Regenerate design language only — content, navigation, and business logic stay intact.
      </p>
      {lastRemix ? <p style={{ ...esMeta, color: ES.red, marginBottom: 8 }}>LAST · {lastRemix.toUpperCase()}</p> : null}
      <div className="flex flex-wrap gap-2">
        {REMIX_OPTIONS.map((opt) => (
          <button key={opt} type="button" onClick={() => onRemix(opt)} style={esChoiceChip}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

type HealthProps = {
  score: number;
  categories: DesignHealthCategory[];
  expanded: boolean;
  onToggle: () => void;
};

export function ExperienceStudioDesignHealth({ score, categories, expanded, onToggle }: HealthProps) {
  return (
    <div style={{ ...esGlass, padding: expanded ? 12 : '8px 12px' }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={esMeta}>DESIGN HEALTH™</span>
        <span style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '16px', color: healthColor(score) }}>
          {score}
        </span>
      </button>
      {expanded ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <div key={c.id}>
              <div className="flex justify-between">
                <span style={{ ...esMeta, fontSize: '5px' }}>{c.label.toUpperCase()}</span>
                <span style={{ ...esMeta, color: healthColor(c.score) }}>{c.score}</span>
              </div>
              <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div className="h-full" style={{ width: `${c.score}%`, background: healthColor(c.score), transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type OrbBarProps = {
  onDesignDna: () => void;
  onExperienceDna: () => void;
  onDirector: () => void;
  onRemix: () => void;
  onRestart: () => void;
};

export function ExperienceStudioOrbBar({ onDesignDna, onExperienceDna, onDirector, onRemix, onRestart }: OrbBarProps) {
  const orbBtn: CSSProperties = {
    ...esMeta,
    background: 'rgba(255,255,255,0.65)',
    border: ES.borderSubtle,
    padding: '8px 10px',
    cursor: 'pointer',
    borderRadius: 999,
  };

  return (
    <div className="flex flex-wrap items-center gap-2 justify-center mt-4">
      <span className="es-orb-mark" style={{ width: 28, height: 28 }} aria-hidden />
      <button type="button" onClick={onDesignDna} style={orbBtn}>DESIGN DNA</button>
      <button type="button" onClick={onExperienceDna} style={orbBtn}>EXPERIENCE DNA</button>
      <button type="button" onClick={onDirector} style={orbBtn}>DIRECTOR</button>
      <button type="button" onClick={onRemix} style={orbBtn}>REMIX</button>
      <button type="button" onClick={onRestart} style={{ ...orbBtn, color: ES.gray }}>NEW SESSION</button>
    </div>
  );
}
