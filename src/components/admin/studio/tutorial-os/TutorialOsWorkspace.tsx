import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { useAdminStudioTutorialOsState } from '../../../../hooks/useAdminStudioTutorialOsState';
import {
  adminPreviewTourUrl,
  TUTORIAL_OS_SECTIONS,
  type TutorialOsSection,
} from '../../../../utils/adminStudioTutorialOsDemo';
import { MANSION_TOUR_ID } from '../../../../tutorial-os/constants';

const panelStyle: CSSProperties = {
  border: '1.3px solid #0a0a0a',
  borderRadius: '6px',
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(8px)',
  padding: '12px',
  marginBottom: '12px',
};

const caption: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#808080',
};

const titleStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '11px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#EB1C24',
  marginBottom: '8px',
};

export function TutorialOsWorkspace() {
  const { section, setSection, tours, analytics, missingTargets, achievements, toggleTourEnabled } =
    useAdminStudioTutorialOsState();
  const [selectedTourId, setSelectedTourId] = useState(MANSION_TOUR_ID);

  const selectedTour = useMemo(() => tours.find((t) => t.id === selectedTourId), [tours, selectedTourId]);

  return (
    <div className="pb-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {TUTORIAL_OS_SECTIONS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSection(tab as TutorialOsSection)}
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '8px 10px',
              border: '1.3px solid #0a0a0a',
              borderRadius: '4px',
              background: section === tab ? '#EB1C24' : 'rgba(255,255,255,0.7)',
              color: section === tab ? '#fff' : '#1A1A1A',
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {section === 'Tours' ? (
        <section style={panelStyle}>
          <p style={titleStyle}>TOURS</p>
          {tours.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <div>
                <p style={{ ...caption, color: '#EB1C24' }}>{t.customerName}</p>
                <p style={caption}>
                  {t.steps.length} STEPS · {t.estimatedMinutes} MIN · {t.status.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTourId(t.id)}
                  style={{ ...caption, border: '1px solid #000', padding: '6px 8px', cursor: 'pointer' }}
                >
                  VIEW STEPS
                </button>
                <button
                  type="button"
                  onClick={() => toggleTourEnabled(t.id, t.status === 'disabled')}
                  style={{ ...caption, border: '1px solid #000', padding: '6px 8px', cursor: 'pointer' }}
                >
                  {t.status === 'disabled' ? 'ENABLE' : 'DISABLE'}
                </button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {section === 'Steps' ? (
        <section style={panelStyle}>
          <p style={titleStyle}>STEPS · {selectedTour?.customerName ?? '—'}</p>
          <select
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="w-full border border-black mb-3 px-2 py-2"
            style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.customerName}
              </option>
            ))}
          </select>
          {(selectedTour?.steps ?? []).map((s) => (
            <div key={s.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <p style={{ ...caption, color: '#EB1C24' }}>
                {s.order}. {s.title}
              </p>
              <p style={caption}>{s.body}</p>
              <p style={caption}>BENEFIT: {s.benefit}</p>
              {s.route ? <p style={caption}>ROUTE: {s.route}</p> : null}
              {s.targetSelector ? <p style={caption}>TARGET: {s.targetSelector}</p> : null}
            </div>
          ))}
          {!selectedTour?.steps.length ? <p style={caption}>NO STEPS SEEDED YET — ARCHITECTURE READY</p> : null}
        </section>
      ) : null}

      {section === 'Hotspots' ? (
        <section style={panelStyle}>
          <p style={titleStyle}>HOTSPOTS</p>
          {(selectedTour?.steps ?? [])
            .filter((s) => s.targetSelector)
            .map((s) => (
              <p key={s.id} style={caption}>
                {s.title} → {s.targetSelector} ({s.animationType})
              </p>
            ))}
        </section>
      ) : null}

      {section === 'Completion Analytics' ? (
        <section style={panelStyle}>
          <p style={titleStyle}>COMPLETION ANALYTICS (LOCAL DEMO)</p>
          {analytics.map((row) => (
            <p key={row.tourId} style={caption}>
              {row.tourName}: {row.avgCompletionPct}% · COMPLETED {row.completed} · SKIPPED {row.skipped}
            </p>
          ))}
          <p style={{ ...caption, marginTop: '12px' }}>ACHIEVEMENT PLACEHOLDERS</p>
          {achievements.map((a) => (
            <p key={a.id} style={caption}>
              {a.label} — {a.earned ? 'EARNED (LOCAL)' : 'NOT EARNED'}
            </p>
          ))}
        </section>
      ) : null}

      {section === 'Missing Targets' ? (
        <section style={panelStyle}>
          <p style={titleStyle}>MISSING TARGETS (DEV SESSION)</p>
          {missingTargets.length === 0 ? (
            <p style={caption}>NONE LOGGED THIS SESSION</p>
          ) : (
            missingTargets.map((m, i) => (
              <p key={`${m.stepId}-${i}`} style={caption}>
                {m.tourId}/{m.stepId}: {m.selector} @ {m.route}
              </p>
            ))
          )}
        </section>
      ) : null}

      {section === 'Preview Tour' ? (
        <section style={panelStyle}>
          <p style={titleStyle}>PREVIEW TOUR</p>
          <p style={caption}>Opens customer storefront with concierge overlay (admin preview query).</p>
          <select
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="w-full border border-black mb-3 px-2 py-2"
            style={{ fontFamily: '"Futura PT Book"', fontSize: '11px' }}
          >
            {tours.filter((t) => t.steps.length > 0).map((t) => (
              <option key={t.id} value={t.id}>
                {t.customerName}
              </option>
            ))}
          </select>
          <a
            href={adminPreviewTourUrl(selectedTourId)}
            target="_blank"
            rel="noreferrer"
            style={{
              ...caption,
              color: '#EB1C24',
              display: 'inline-block',
              border: '1.3px solid #EB1C24',
              padding: '10px 14px',
            }}
          >
            PREVIEW IN NEW TAB
          </a>
        </section>
      ) : null}
    </div>
  );
}
