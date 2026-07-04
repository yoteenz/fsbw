import { AdminHubTabBar } from '../../AdminHubTabBar';
import { useAdminStudioExecutiveAiDirector } from '../../../../hooks/useAdminStudioExecutiveAiDirectorState';
import {
  AB_STRATEGY_SEED,
  CONTENT_GAP_SEED,
  EXECUTIVE_AI_TABS,
  EXECUTIVE_RECOMMENDATIONS_SEED,
  PERFORMANCE_FORECAST_SEED,
  SOURCE_LABELS,
  TREND_SIGNAL_PLUGINS,
  type CreativeIntelItem,
  type BrandComplianceItem,
  type ExecutiveChatMessage,
  type ExecutiveTimelineEntry,
  type ProductionCoachingNote,
  type PromptReviewFinding,
  type ProductionTimelineEntry,
  type WorkspaceMemoryEntry,
} from '../../../../utils/adminStudioExecutiveAiDirectorDemo';
import { ExecutiveAiDirectorHubCards } from './ExecutiveAiDirectorHubCards';
import { EAD_VISUAL, eadActionBtn, eadCaption, eadPanelStyle, eadSectionTitle, eadSourceTag } from './executiveAiDirectorTheme';

export function ExecutiveAiDirectorWorkspace() {
  const {
    activeTab,
    setActiveTab,
    brief,
    scorecard,
    studioHealth,
    intelQuery,
    setIntelQuery,
    intelResults,
    productionNotes,
    promptReview,
    brandCompliance,
    workspaceMemory,
    executiveTimeline,
    productionTimeline,
    chatHistory,
    chatInput,
    setChatInput,
    chatLoading,
    sendChat,
  } = useAdminStudioExecutiveAiDirector();

  return (
    <div>
      <ExecutiveAiDirectorHubCards onSelectTab={setActiveTab} />

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {scorecard.slice(0, 4).map((d) => (
          <ScoreMini key={d.id} label={d.label} score={d.score} />
        ))}
        <div style={{ ...eadPanelStyle, padding: '8px', gridColumn: 'span 2' }}>
          <p style={eadCaption}>OVERALL STUDIO HEALTH</p>
          <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '22px', color: EAD_VISUAL.red }}>{studioHealth}%</p>
        </div>
      </div>

      <AdminHubTabBar tabs={EXECUTIVE_AI_TABS} activeTab={activeTab} onTabChange={setActiveTab} fontSize="10px" />

      <div className="mt-4">
        {activeTab === 'brief' && (
          <section style={{ ...eadPanelStyle, padding: '16px' }}>
            <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '18px', color: EAD_VISUAL.black }}>{brief.greeting}</p>
            <div className="mt-4 space-y-3">
              {brief.lines.map((line) => (
                <div key={line.id}>
                  <p style={{ ...eadCaption, color: EAD_VISUAL.black, fontSize: '10px' }}>{line.text}</p>
                  <p style={eadSourceTag(line.source)}>{SOURCE_LABELS[line.source]}</p>
                </div>
              ))}
            </div>
            <p style={{ ...eadCaption, marginTop: '16px', fontStyle: 'italic' }}>{brief.footer}</p>
          </section>
        )}
        {activeTab === 'insights' && <InsightsPanel query={intelQuery} onQuery={setIntelQuery} results={intelResults} />}
        {activeTab === 'production' && <ProductionPanel notes={productionNotes} />}
        {activeTab === 'brand' && <BrandPanel items={brandCompliance} />}
        {activeTab === 'prompt' && <PromptPanel score={promptReview.score} findings={promptReview.findings} />}
        {activeTab === 'forecast' && <ForecastPanel />}
        {activeTab === 'recommendations' && <RecommendationsPanel />}
        {activeTab === 'timeline' && <TimelinePanel executive={executiveTimeline} production={productionTimeline} memory={workspaceMemory} />}
        {activeTab === 'chat' && (
          <ChatPanel
            history={chatHistory}
            input={chatInput}
            onInput={setChatInput}
            loading={chatLoading}
            onSend={() => sendChat(chatInput)}
          />
        )}
      </div>
    </div>
  );
}

function ScoreMini({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ ...eadPanelStyle, padding: '8px' }}>
      <p style={eadCaption}>{label}</p>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: EAD_VISUAL.black }}>{score}%</p>
      <div style={{ height: '3px', background: '#eee', marginTop: '4px' }}>
        <div style={{ width: `${score}%`, height: '100%', background: EAD_VISUAL.red }} />
      </div>
    </div>
  );
}

function InsightsPanel({
  query,
  onQuery,
  results,
}: {
  query: string;
  onQuery: (q: string) => void;
  results: CreativeIntelItem[];
}) {
  return (
    <section>
      <div style={{ ...eadPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={eadSectionTitle}>CREATIVE INTELLIGENCE · SEARCHABLE</p>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="SEARCH STUDIOS · TALENT · CAMERA · CTA · RUNTIME…"
          className="w-full border px-3 py-2"
          style={{ fontSize: '9px', fontFamily: '"Futura PT Book"', borderWidth: '1.3px' }}
        />
      </div>
      <div style={{ ...eadPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={eadSectionTitle}>TREND SIGNALS · PLUGIN ARCHITECTURE</p>
        {TREND_SIGNAL_PLUGINS.map((p) => (
          <div key={p.id} className="flex justify-between py-1" style={{ borderBottom: EAD_VISUAL.divider }}>
            <span style={eadCaption}>{p.name}</span>
            <span style={{ ...eadCaption, color: p.status === 'internal' ? EAD_VISUAL.pass : EAD_VISUAL.gray }}>{p.note}</span>
          </div>
        ))}
        <p style={{ ...eadCaption, marginTop: '8px' }}>NO EXTERNAL FEEDS CONNECTED — RECOMMENDATIONS USE WORKSPACE HISTORY ONLY.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {results.map((item) => (
          <div key={item.id} style={{ ...eadPanelStyle, padding: '10px' }}>
            <p style={{ ...eadCaption, fontSize: '7px' }}>{item.category}</p>
            <p style={{ ...eadCaption, color: EAD_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{item.label}</p>
            <p style={eadCaption}>{item.value}</p>
            <p style={eadSourceTag(item.source)}>{SOURCE_LABELS[item.source]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductionPanel({ notes }: { notes: ProductionCoachingNote[] }) {
  return (
    <section style={{ ...eadPanelStyle, padding: '12px' }}>
      <p style={eadSectionTitle}>PRODUCTION ANALYSIS · PRE-GENERATION COACHING</p>
      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n.id} style={{ borderLeft: `3px solid ${n.severity === 'critical' ? EAD_VISUAL.red : n.severity === 'warn' ? EAD_VISUAL.warn : EAD_VISUAL.gray}`, paddingLeft: '10px' }}>
            <p style={{ ...eadCaption, color: EAD_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{n.title}</p>
            <p style={eadCaption}>{n.detail}</p>
            <p style={eadSourceTag(n.source)}>{SOURCE_LABELS[n.source]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandPanel({ items }: { items: BrandComplianceItem[] }) {
  return (
    <section style={{ ...eadPanelStyle, padding: '12px' }}>
      <p style={eadSectionTitle}>BRAND COMPLIANCE</p>
      {items.map((item) => (
        <div key={item.id} className="flex justify-between py-2" style={{ borderBottom: EAD_VISUAL.divider }}>
          <span style={eadCaption}>{item.area}</span>
          <span style={{ ...eadCaption, color: item.status === 'pass' ? EAD_VISUAL.pass : item.status === 'fail' ? EAD_VISUAL.red : EAD_VISUAL.warn }}>
            {item.status.toUpperCase()} · {item.note}
          </span>
        </div>
      ))}
    </section>
  );
}

function PromptPanel({ score, findings }: { score: number; findings: PromptReviewFinding[] }) {
  return (
    <section style={{ ...eadPanelStyle, padding: '12px' }}>
      <p style={eadSectionTitle}>PROMPT REVIEW</p>
      <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '28px', color: EAD_VISUAL.red }}>{score}</p>
      <p style={eadCaption}>PROMPT SCORE · 0–100</p>
      <div className="mt-3 space-y-2">
        {findings.map((f) => (
          <p key={f.id} style={eadCaption}>
            <span style={{ color: EAD_VISUAL.red }}>{f.type.toUpperCase()}</span> — {f.text}
          </p>
        ))}
      </div>
    </section>
  );
}

function ForecastPanel() {
  return (
    <section className="grid gap-2 sm:grid-cols-2">
      {PERFORMANCE_FORECAST_SEED.map((f) => (
        <div key={f.id} style={{ ...eadPanelStyle, padding: '12px' }}>
          <p style={eadCaption}>{f.label}</p>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: EAD_VISUAL.black }}>{f.estimate}</p>
          <p style={eadCaption}>RANGE: {f.range} · {f.confidence.toUpperCase()} CONFIDENCE</p>
          <p style={{ ...eadSourceTag('estimate'), marginTop: '4px' }}>{f.disclaimer}</p>
        </div>
      ))}
    </section>
  );
}

function RecommendationsPanel() {
  return (
    <section className="space-y-4">
      <div style={{ ...eadPanelStyle, padding: '12px' }}>
        <p style={eadSectionTitle}>EXECUTIVE RECOMMENDATIONS</p>
        {EXECUTIVE_RECOMMENDATIONS_SEED.map((r) => (
          <div key={r.id} className="mb-3">
            <p style={{ ...eadCaption, color: EAD_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{r.title}</p>
            <p style={eadCaption}>{r.body}</p>
            <p style={eadSourceTag(r.source)}>{SOURCE_LABELS[r.source]} · {r.priority.toUpperCase()}</p>
          </div>
        ))}
      </div>
      <div style={{ ...eadPanelStyle, padding: '12px' }}>
        <p style={eadSectionTitle}>A/B STRATEGY</p>
        {AB_STRATEGY_SEED.map((ab) => (
          <div key={ab.id} className="mb-3 pb-2" style={{ borderBottom: EAD_VISUAL.divider }}>
            <p style={{ ...eadCaption, fontFamily: '"Futura PT Medium"', color: EAD_VISUAL.black }}>{ab.dimension}</p>
            <p style={eadCaption}>A: {ab.variantA}</p>
            <p style={eadCaption}>B: {ab.variantB}</p>
            <p style={eadCaption}>{ab.rationale}</p>
          </div>
        ))}
      </div>
      <div style={{ ...eadPanelStyle, padding: '12px' }}>
        <p style={eadSectionTitle}>CONTENT GAP ANALYSIS</p>
        {CONTENT_GAP_SEED.map((g) => (
          <p key={g.id} style={eadCaption}>
            <span style={{ color: EAD_VISUAL.black }}>{g.pillar}</span> — {g.gap}
          </p>
        ))}
      </div>
    </section>
  );
}

function TimelinePanel({
  executive,
  production,
  memory,
}: {
  executive: ExecutiveTimelineEntry[];
  production: ProductionTimelineEntry[];
  memory: WorkspaceMemoryEntry[];
}) {
  return (
    <section className="space-y-4">
      <div style={{ ...eadPanelStyle, padding: '12px' }}>
        <p style={eadSectionTitle}>EXECUTIVE TIMELINE</p>
        {executive.map((e) => (
          <div key={e.id} className="py-2" style={{ borderBottom: EAD_VISUAL.divider }}>
            <p style={{ ...eadCaption, color: EAD_VISUAL.black }}>{e.date} · {e.title}</p>
            <p style={eadCaption}>{e.category.toUpperCase()} — {e.note}</p>
          </div>
        ))}
      </div>
      <div style={{ ...eadPanelStyle, padding: '12px' }}>
        <p style={eadSectionTitle}>PRODUCTION TIMELINE · POST-PUBLISH MEMORY</p>
        {production.map((p) => (
          <div key={p.id} className="py-2" style={{ borderBottom: EAD_VISUAL.divider }}>
            <p style={{ ...eadCaption, color: EAD_VISUAL.black }}>{p.productionName}</p>
            <p style={eadCaption}>
              GEN {p.generatedAt}
              {p.publishedAt ? ` · PUB ${p.publishedAt}` : ''}
              {p.performance ? ` · ${p.performance}` : ''}
            </p>
            <p style={eadCaption}>{p.workspace} · {p.status.toUpperCase()}</p>
          </div>
        ))}
      </div>
      <div style={{ ...eadPanelStyle, padding: '12px' }}>
        <p style={eadSectionTitle}>WORKSPACE MEMORY · APPEND-ONLY</p>
        {memory.map((m) => (
          <p key={m.id} style={eadCaption}>
            {m.recordedAt} · {m.category}: {m.label} — {m.note}
          </p>
        ))}
      </div>
    </section>
  );
}

function ChatPanel({
  history,
  input,
  onInput,
  loading,
  onSend,
}: {
  history: ExecutiveChatMessage[];
  input: string;
  onInput: (v: string) => void;
  loading: boolean;
  onSend: () => void;
}) {
  return (
    <section style={{ ...eadPanelStyle, padding: '12px' }}>
      <p style={eadSectionTitle}>EXECUTIVE CONVERSATION</p>
      <p style={{ ...eadCaption, marginBottom: '12px' }}>ADVISOR — NOT A GENERIC CHATBOT. REFERENCES WORKSPACE DATA WHEN AVAILABLE.</p>
      <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
        {history.length === 0 ? (
          <p style={eadCaption}>ASK: WHAT SHOULD I FILM NEXT? · HOW CAN THIS CAMPAIGN IMPROVE? · REVIEW MY PRODUCTION</p>
        ) : (
          history.map((msg) => (
            <div key={msg.id} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <p style={{ ...eadCaption, color: msg.role === 'user' ? EAD_VISUAL.black : EAD_VISUAL.red, fontFamily: '"Futura PT Medium"', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </p>
              {msg.sourceNote ? <p style={eadSourceTag('history')}>{msg.sourceNote}</p> : null}
            </div>
          ))
        )}
        {loading ? <p style={eadCaption}>ANALYZING WORKSPACE…</p> : null}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="EXECUTIVE QUESTION…"
          className="flex-1 border px-2 py-2"
          style={{ fontSize: '9px', borderWidth: '1.3px' }}
        />
        <button type="button" onClick={onSend} style={eadActionBtn} disabled={loading}>
          ASK
        </button>
      </div>
    </section>
  );
}
