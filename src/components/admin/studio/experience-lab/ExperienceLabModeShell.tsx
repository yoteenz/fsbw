import { useState } from 'react';
import { ExperienceLabRuntimeLabPanel } from './ExperienceLabRuntimeLabPanel';
import { CreativeIntelligencePanel } from './CreativeIntelligencePanel';

export type ExperienceLabMode = 'runtime-validation' | 'creative-intelligence';

const tabStyle = (active: boolean) => ({
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: active ? 800 : 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  border: 'none',
  borderBottom: active ? '2px solid #eb1c24' : '2px solid transparent',
  background: active ? '#fff' : '#f3f4f6',
  cursor: 'pointer',
  color: active ? '#111' : '#666',
});

/** Experience Lab™ — dual independent validation modes. */
export function ExperienceLabModeShell() {
  const [mode, setMode] = useState<ExperienceLabMode>('creative-intelligence');

  return (
    <div data-experience-lab-shell>
      <nav
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #e5e7eb',
          background: '#f3f4f6',
        }}
        aria-label="Experience Lab validation modes"
      >
        <button
          type="button"
          style={tabStyle(mode === 'runtime-validation')}
          onClick={() => setMode('runtime-validation')}
        >
          Mode 1 — Runtime Validation
        </button>
        <button
          type="button"
          style={tabStyle(mode === 'creative-intelligence')}
          onClick={() => setMode('creative-intelligence')}
        >
          Mode 2 — Creative Intelligence Validation
        </button>
      </nav>

      {mode === 'runtime-validation' ? <ExperienceLabRuntimeLabPanel /> : <CreativeIntelligencePanel />}
    </div>
  );
}
