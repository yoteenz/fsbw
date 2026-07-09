import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrbState } from '../../../../hooks/useOrbState';
import type { OrbRecommendationCard } from '../../../../studio-os-core/genesis';
import {
  orbBody,
  orbChipBtnStyle,
  orbLabel,
  orbOverlayBackdropStyle,
  orbPrimaryBtnStyle,
  orbProjectionInnerStyle,
  orbProjectionPanelStyle,
  orbSecondaryBtnStyle,
  ORB_VISUAL,
} from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

type WorkspaceTab =
  | 'briefing'
  | 'recommendations'
  | 'missions'
  | 'knowledge'
  | 'creative'
  | 'memory'
  | 'decisions';

const panelStyle: CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 72,
  zIndex: 100048,
  width: 'min(92vw, 420px)',
  maxHeight: 'min(82vh, 640px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  ...orbProjectionPanelStyle,
};

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'recommendations', label: 'Recommend' },
  { id: 'missions', label: 'Missions' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'creative', label: 'Creative' },
  { id: 'memory', label: 'Memory' },
  { id: 'decisions', label: 'Decisions' },
];

function RecommendationCard({
  rec,
  onAccept,
  onDismiss,
}: {
  rec: OrbRecommendationCard;
  onAccept: (rec: OrbRecommendationCard) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <article style={{ ...orbProjectionInnerStyle, padding: '10px 12px', marginBottom: 8 }}>
      <p style={{ ...orbLabel, fontSize: 7, margin: 0, color: ORB_VISUAL.champagne }}>
        {rec.posture.replace('-', ' ').toUpperCase()} · {Math.round(rec.confidence * 100)}% CONF
      </p>
      <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0', lineHeight: 1.35 }}>{rec.title}</p>
      <p style={{ ...orbBody, fontSize: 9, margin: '0 0 6px', textTransform: 'none', color: ORB_VISUAL.textMuted }}>
        {rec.reason}
      </p>
      <p style={{ fontSize: 7, opacity: 0.75, margin: 0 }}>
        EVIDENCE: {rec.evidence.join(' · ')}
      </p>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button type="button" style={{ ...orbPrimaryBtnStyle, flex: 1 }} onClick={() => onAccept(rec)}>
          CONTINUE
        </button>
        <button type="button" style={{ ...orbSecondaryBtnStyle, flex: 1 }} onClick={() => onDismiss(rec.recommendationId)}>
          OVERRIDE
        </button>
      </div>
    </article>
  );
}

/** Orb Executive Workspace™ — expandable intelligence layer, not a chatbot. */
export function StudioOrbExecutiveWorkspace() {
  const { activeSurface, closeSurface } = useStudioOrb();
  const { view, sendFounderMessage, dismissRecommendation } = useOrbState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorkspaceTab>('briefing');
  const [draft, setDraft] = useState('');

  const ambientLine = useMemo(
    () => view.briefing.recommendedAction,
    [view.briefing.recommendedAction]
  );

  if (activeSurface !== 'executive-workspace') return null;

  const handleAccept = (rec: OrbRecommendationCard) => {
    navigate(rec.targetPath);
    closeSurface();
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    sendFounderMessage(trimmed);
    setDraft('');
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close Orb executive workspace"
        className="fixed inset-0 z-[100047]"
        style={{ ...orbOverlayBackdropStyle, border: 'none', cursor: 'default' }}
        onClick={closeSurface}
      />
      <div className="studio-conversation-dock-panel" style={panelStyle} role="dialog" aria-label="Orb executive workspace">
        <header style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <p style={{ ...orbLabel, fontSize: 6, margin: 0, color: ORB_VISUAL.champagne }}>
            ORB™ · EXECUTIVE INTELLIGENCE LAYER
          </p>
          <p style={{ ...orbLabel, fontSize: 9, margin: '4px 0 0' }}>{view.context.companyDisplayName}</p>
          <p style={{ ...orbBody, fontSize: 8, margin: '6px 0 0', textTransform: 'none', color: ORB_VISUAL.textMuted }}>
            {view.context.roomLabel} · {view.attention.mode.toUpperCase()} · {view.session.presenceState.toUpperCase()}
          </p>
          <p style={{ ...orbBody, fontSize: 8, margin: '8px 0 0', textTransform: 'none' }}>{view.briefing.greeting}</p>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {view.quickActions.map((action) => (
            <button
              key={action.actionId}
              type="button"
              style={{ ...orbChipBtnStyle, fontSize: 6 }}
              onClick={() => {
                navigate(action.targetPath);
                closeSurface();
              }}
              title={action.detail}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '8px 10px', overflowX: 'auto' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              style={{
                ...orbChipBtnStyle,
                fontSize: 6,
                opacity: tab === t.id ? 1 : 0.55,
                borderColor: tab === t.id ? ORB_VISUAL.champagne : orbChipBtnStyle.border as string,
              }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {tab === 'briefing' ? (
            <div>
              <p style={{ ...orbBody, fontSize: 9, textTransform: 'none', lineHeight: 1.55 }}>{view.briefing.paragraph}</p>
              <dl style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                <BriefField label="Changed" value={view.briefing.whatChanged} />
                <BriefField label="Attention" value={view.briefing.requiresAttention} />
                <BriefField label="Can wait" value={view.briefing.canWait} />
                <BriefField label="Next move" value={ambientLine} />
              </dl>
            </div>
          ) : null}

          {tab === 'recommendations'
            ? view.recommendations.map((rec) => (
                <RecommendationCard key={rec.recommendationId} rec={rec} onAccept={handleAccept} onDismiss={dismissRecommendation} />
              ))
            : null}

          {tab === 'missions'
            ? view.missionAdvice.map((m) => (
                <article key={m.adviceId} style={{ ...orbProjectionInnerStyle, padding: 10, marginBottom: 8 }}>
                  <p style={{ ...orbLabel, fontSize: 7, margin: 0 }}>{m.status.toUpperCase()} · {m.departmentLabel}</p>
                  <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0' }}>{m.missionTitle}</p>
                  <p style={{ ...orbBody, fontSize: 8, textTransform: 'none' }}>{m.advisorNote}</p>
                  {m.blockerNote ? <p style={{ fontSize: 7, color: ORB_VISUAL.gold, marginTop: 4 }}>{m.blockerNote}</p> : null}
                </article>
              ))
            : null}

          {tab === 'knowledge'
            ? view.knowledgeResults.map((k) => (
                <article key={k.resultId} style={{ ...orbProjectionInnerStyle, padding: 10, marginBottom: 8 }}>
                  <p style={{ ...orbLabel, fontSize: 7, margin: 0 }}>{k.stale ? 'STALE' : 'SOURCE-BACKED'}</p>
                  <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0' }}>{k.query}</p>
                  <p style={{ ...orbBody, fontSize: 8, textTransform: 'none' }}>{k.answer}</p>
                </article>
              ))
            : null}

          {tab === 'creative'
            ? view.creativeInsights.map((c) => (
                <article key={c.insightId} style={{ ...orbProjectionInnerStyle, padding: 10, marginBottom: 8 }}>
                  <p style={{ ...orbLabel, fontSize: 7, margin: 0 }}>{c.alignment.toUpperCase()}</p>
                  <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0' }}>{c.title}</p>
                  <p style={{ ...orbBody, fontSize: 8, textTransform: 'none' }}>{c.detail}</p>
                </article>
              ))
            : null}

          {tab === 'memory'
            ? view.memoryTimeline.map((m) => (
                <article key={m.memoryId} style={{ ...orbProjectionInnerStyle, padding: 10, marginBottom: 8 }}>
                  <p style={{ ...orbLabel, fontSize: 7, margin: 0 }}>{m.tier.toUpperCase()}{m.canonical ? ' · CANONICAL' : ''}</p>
                  <p style={{ ...orbLabel, fontSize: 8, margin: '4px 0' }}>{m.title}</p>
                  <p style={{ ...orbBody, fontSize: 8, textTransform: 'none' }}>{m.detail}</p>
                </article>
              ))
            : null}

          {tab === 'decisions'
            ? view.decisionDrafts.map((d) => (
                <article key={d.decisionId} style={{ ...orbProjectionInnerStyle, padding: 10, marginBottom: 8 }}>
                  <p style={{ ...orbLabel, fontSize: 8, margin: 0 }}>{d.frame}</p>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 14 }}>
                    {d.options.map((o) => (
                      <li key={o.label} style={{ ...orbBody, fontSize: 8, textTransform: 'none', marginBottom: 4 }}>
                        {o.label} — {o.tradeoff}
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 7, marginTop: 8 }}>RECOMMENDED: {d.recommendedOption}</p>
                </article>
              ))
            : null}
        </div>

        <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px' }}>
          <p style={{ ...orbLabel, fontSize: 6, margin: '0 0 6px' }}>CONVERSATION TIMELINE</p>
          <div style={{ maxHeight: 88, overflowY: 'auto', marginBottom: 8 }}>
            {view.conversationTimeline.slice(0, 4).map((entry) => (
              <p key={entry.entryId} style={{ ...orbBody, fontSize: 7, textTransform: 'none', margin: '0 0 4px' }}>
                {entry.speaker === 'orb' ? 'ORB' : 'FOUNDER'}: {entry.content}
              </p>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Speak with Orb…"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 6,
                padding: '8px 10px',
                fontSize: 9,
                color: ORB_VISUAL.text,
              }}
            />
            <button type="button" style={orbPrimaryBtnStyle} onClick={handleSend}>
              SEND
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

function BriefField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ ...orbLabel, fontSize: 6, margin: 0 }}>{label.toUpperCase()}</dt>
      <dd style={{ ...orbBody, fontSize: 8, textTransform: 'none', margin: '2px 0 0' }}>{value}</dd>
    </div>
  );
}
