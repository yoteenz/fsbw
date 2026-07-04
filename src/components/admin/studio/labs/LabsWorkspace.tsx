import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioLabsState } from '../../../../hooks/useAdminStudioLabsState';
import {
  LABS_DASHBOARD_SURPRISES,
  LABS_TABS,
  type LabsTabId,
} from '../../../../utils/adminStudioLabsDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  EXPERIMENT_STATUS_LABELS,
  PILLAR_LABELS,
  PLATFORM_LABELS,
  PROMOTION_TARGET_LABELS,
} from '../../../../studio-os-core/labs/constants';
import { formatBenchmarkValue } from '../../../../studio-os-core/labs/benchmarkEngine';
import { getLabsExecutivesForWorkspace } from '../../../../studio-os-core/labs/labsExecutives';
import { adminStudioKnowledgeHubPath, adminStudioMemoryBiblePath } from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function LabsWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as LabsTabId | null) ?? 'overview';
  const [tab, setTab] = useState<LabsTabId>(LABS_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview');
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');

  const {
    workspaceId,
    experiments,
    activeExperiments,
    completedExperiments,
    learnings,
    hooks,
    captions,
    series,
    pillars,
    benchmarks,
    promotions,
    recommendations,
    institutionalMemory,
    topHooks,
    topRevenue,
    topRetention,
    compare,
  } = useAdminStudioLabsState();

  const executives = useMemo(() => getLabsExecutivesForWorkspace(), []);
  const comparison = useMemo(() => {
    if (!compareA || !compareB || compareA === compareB) return null;
    return compare(compareA, compareB);
  }, [compareA, compareB, compare]);

  const selectTab = (id: LabsTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  const renderExperimentCard = (exp: (typeof experiments)[0]) => (
    <div key={exp.id} className="p-2 border mb-2" style={panelStyle}>
      <div className="flex justify-between items-start">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {exp.variables.topic}
        </p>
        <span className="text-[5px] px-1 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {EXPERIMENT_STATUS_LABELS[exp.status]}
        </span>
      </div>
      <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {exp.id} · {PILLAR_LABELS[exp.variables.pillar]} · {PLATFORM_LABELS[exp.variables.publishingPlatform]}
      </p>
      <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
        HOOK · {exp.variables.hook}
      </p>
      <div className="grid grid-cols-3 gap-1 mt-2">
        <p className="text-[5px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          VIEWS · {exp.metrics.views.toLocaleString()}
        </p>
        <p className="text-[5px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          RET · {Math.round(exp.metrics.completionRate * 100)}%
        </p>
        <p className="text-[5px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          REV · ${exp.metrics.revenue.toFixed(0)}
        </p>
      </div>
    </div>
  );

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="ACTIVE EXPERIMENTS" value={`${activeExperiments.length}`} accent />
              <MetricCard label="COMPLETED" value={`${completedExperiments.length}`} />
              <MetricCard label="LEARNINGS" value={`${learnings.length}`} />
              <MetricCard label="RECOMMENDATIONS" value={`${recommendations.length}`} />
            </div>
            <SectionLabel>TOP PERFORMING HOOKS</SectionLabel>
            {topHooks.slice(0, 3).map((h) => (
              <div key={h.id} className="p-2 border" style={panelStyle}>
                <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {h.template}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  SCORE {h.successScore} · USED {h.timesUsed}× · RET {Math.round(h.averageRetention * 100)}%
                </p>
              </div>
            ))}
            <SectionLabel>BEST PLATFORMS · BY REVENUE</SectionLabel>
            {topRevenue.map((e) => (
              <p key={e.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {PLATFORM_LABELS[e.variables.publishingPlatform]} · ${e.metrics.revenue.toFixed(0)} · {e.variables.topic.slice(0, 40)}
              </p>
            ))}
            <SectionLabel>HIGHEST RETENTION</SectionLabel>
            {topRetention.map((e) => (
              <p key={e.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {Math.round(e.metrics.completionRate * 100)}% · {e.variables.series || e.variables.topic.slice(0, 35)}
              </p>
            ))}
            <SectionLabel>BIGGEST SURPRISES</SectionLabel>
            {LABS_DASHBOARD_SURPRISES.map((s) => (
              <p key={s} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: '#6366F1', lineHeight: 1.4 }}>
                {s}
              </p>
            ))}
            <SectionLabel>CURRENT RECOMMENDATIONS</SectionLabel>
            {recommendations.slice(0, 3).map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[5px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {r.category.replace(/-/g, ' ')}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {r.recommendation}
                </p>
              </div>
            ))}
            <SectionLabel>INSTITUTIONAL LEARNINGS</SectionLabel>
            {institutionalMemory.slice(0, 4).map((m) => (
              <p key={m} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {m}
              </p>
            ))}
          </div>
        );

      case 'experiments':
        return (
          <div>
            <SectionLabel>ALL EXPERIMENTS · WORKSPACE {workspaceId.toUpperCase()} · EVERY PUBLISH = EXPERIMENT</SectionLabel>
            {experiments.map(renderExperimentCard)}
          </div>
        );

      case 'learnings':
        return (
          <div className="space-y-2">
            <SectionLabel>LEARNING ENGINE · INSIGHTS NOT METRICS</SectionLabel>
            {learnings.length === 0 ? (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                COLLECTING DATA — NEED MORE COMPLETED EXPERIMENTS
              </p>
            ) : (
              learnings.map((l) => (
                <div key={l.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[5px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                    {l.category} · CONFIDENCE {Math.round(l.confidence * 100)}%
                    {l.deltaPercent ? ` · Δ ${l.deltaPercent > 0 ? '+' : ''}${l.deltaPercent}%` : ''}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {l.insight}
                  </p>
                  <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    BASED ON {l.experimentIds.length} EXPERIMENT(S)
                    {l.promotedToMemory ? ' · IN MEMORY BIBLE' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        );

      case 'hooks':
        return (
          <div className="space-y-2">
            <SectionLabel>HOOK LIBRARY · AUTO-RECOMMENDED FOR FUTURE CONTENT</SectionLabel>
            {[...hooks].sort((a, b) => b.successScore - a.successScore).map((h) => (
              <div key={h.id} className="p-2 border" style={panelStyle}>
                <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {h.template}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  USED {h.timesUsed}× · RET {Math.round(h.averageRetention * 100)}% · WATCH {Math.round(h.averageWatchTimeSec)}s · REV ${h.averageRevenue.toFixed(0)}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  BEST · {PILLAR_LABELS[h.bestNiche]} · {PLATFORM_LABELS[h.bestPlatform]} · SCORE {h.successScore}
                </p>
              </div>
            ))}
          </div>
        );

      case 'thumbnails':
        return (
          <div className="space-y-2">
            <SectionLabel>THUMBNAIL INTELLIGENCE</SectionLabel>
            {experiments.filter((e) => e.thumbnailIntel).map((e) => (
              <div key={e.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {e.variables.thumbnail}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  CTR {(e.thumbnailIntel!.ctr * 100).toFixed(1)}% · {e.thumbnailIntel!.composition} · {e.thumbnailIntel!.emotion.toUpperCase()}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  COLORS · {e.thumbnailIntel!.colors.join(' · ')} · TEXT · {e.thumbnailIntel!.textPlacement} · CONTRAST · {e.thumbnailIntel!.contrast}
                </p>
              </div>
            ))}
          </div>
        );

      case 'captions':
        return (
          <div className="space-y-2">
            <SectionLabel>CAPTION INTELLIGENCE · PATTERNS THAT DRIVE ENGAGEMENT</SectionLabel>
            {captions.map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[5px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  LEN {c.captionLength} · EMOJI {c.emojiUsage ? 'YES' : 'NO'} · QUESTION {c.questionUsage ? 'YES' : 'NO'} · SPACING {c.lineSpacing.toUpperCase()}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  ENGAGEMENT {(c.engagementRate * 100).toFixed(1)}% · CTA · {c.ctaPlacement.toUpperCase()} · TAGS · {c.hashtags.length}
                </p>
              </div>
            ))}
          </div>
        );

      case 'series':
        return (
          <div className="space-y-2">
            <SectionLabel>SERIES INTELLIGENCE · RECURRING CONTENT TRACKING</SectionLabel>
            {series.map((s) => (
              <div key={s.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {s.seriesName}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {s.experimentCount} EXPERIMENTS · GROWTH +{s.growthTrend}% · LOYALTY {s.audienceLoyalty.toLocaleString()} · REV ${s.revenue.toFixed(0)}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: '#6366F1' }}>
                  SCHEDULE · {s.bestPostingSchedule} · FREQ · {s.recommendedFrequency}
                </p>
              </div>
            ))}
          </div>
        );

      case 'pillars':
        return (
          <div className="space-y-2">
            <SectionLabel>PILLAR INTELLIGENCE · EXPAND OR REDUCE INVESTMENT</SectionLabel>
            {[...pillars].sort((a, b) => b.totalRevenue - a.totalRevenue).map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {PILLAR_LABELS[p.pillar]}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  REV ${p.totalRevenue.toFixed(0)} · ENG {(p.engagement * 100).toFixed(1)}% · GROWTH +{p.growth}% · LTV ${p.lifetimeValue.toFixed(0)}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: p.roi > 0 ? '#6366F1' : ADMIN_STUDIO_THEME.textSecondary }}>
                  COST ${p.productionCost} · ROI {p.roi.toFixed(0)}% · {p.experimentCount} EXPERIMENTS
                  {p.roi > 100 ? ' · RECOMMEND EXPAND' : p.roi < 50 ? ' · REVIEW INVESTMENT' : ''}
                </p>
              </div>
            ))}
          </div>
        );

      case 'compare':
        return (
          <div className="space-y-2">
            <SectionLabel>SIDE-BY-SIDE EXPERIMENT COMPARISON</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="text-[6px] font-futura uppercase p-2 border bg-white/60"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
              >
                <option value="">EXPERIMENT A</option>
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.variables.topic.slice(0, 30)}
                  </option>
                ))}
              </select>
              <select
                className="text-[6px] font-futura uppercase p-2 border bg-white/60"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
              >
                <option value="">EXPERIMENT B</option>
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.variables.topic.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
            {comparison ? (
              comparison.differences.map((d) => (
                <div key={d.field} className="p-2 border" style={panelStyle}>
                  <p className="text-[6px] font-futura uppercase" style={{ color: d.statisticallyMeaningful ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                    {d.field}
                    {d.statisticallyMeaningful ? ' · STATISTICALLY MEANINGFUL' : ''}
                  </p>
                  <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    A · {String(d.valueA)} · B · {String(d.valueB)}
                    {d.metricDelta !== undefined ? ` · Δ ${d.metricDelta > 0 ? '+' : ''}${d.metricDelta}%` : ''}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                SELECT TWO EXPERIMENTS TO COMPARE
              </p>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-2">
            <SectionLabel>RECOMMENDATION ENGINE · BACKED BY EXPERIMENT HISTORY</SectionLabel>
            {recommendations.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[5px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {r.category.replace(/-/g, ' ')} · CONFIDENCE {Math.round(r.confidence * 100)}%
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {r.recommendation}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  REFS · {r.basedOnExperimentIds.slice(0, 3).join(', ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'benchmarks':
        return (
          <div className="space-y-2">
            <SectionLabel>BENCHMARK RECORDS · FUTURE CONTENT SHOULD EXCEED THESE</SectionLabel>
            {benchmarks.map((b) => (
              <div key={b.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {b.label}
                </p>
                <p className="text-[12px] mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {formatBenchmarkValue(b)}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  SET BY · {b.experimentId} · {b.setAt.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        );

      case 'promotion':
        return (
          <div className="space-y-2">
            <SectionLabel>PROMOTION SYSTEM · NOTHING PERMANENT UNTIL PROMOTED</SectionLabel>
            <p className="text-[6px] font-futura mb-2 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Winning experiments can be promoted to Creative DNA, Writing Bible, Company DNA, templates, hook library, automation rules, and future campaigns.
            </p>
            {promotions.length === 0 ? (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                NO PENDING PROMOTIONS — GENERATE LEARNINGS FROM MORE EXPERIMENTS
              </p>
            ) : (
              promotions.map((p) => (
                <div key={p.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[5px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                    → {PROMOTION_TARGET_LABELS[p.target]} · {p.status.toUpperCase()}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {p.note}
                  </p>
                </div>
              ))
            )}
          </div>
        );

      case 'executives':
        return (
          <div className="space-y-2">
            <SectionLabel>EXECUTIVE AI · REVIEW EXPERIMENTS & COLLABORATE</SectionLabel>
            {executives.map((exec) => (
              <div key={exec.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {exec.title}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {exec.department.toUpperCase()} · {exec.status.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {exec.mandate}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: '#6366F1' }}>
                  COLLABORATES · {exec.collaboratesWith.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-2">
            <SectionLabel>KNOWLEDGE GAINED · INSTITUTIONAL MEMORY</SectionLabel>
            {institutionalMemory.map((m) => (
              <div key={m} className="p-2 border" style={panelStyle}>
                <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {m}
                </p>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="flex-1 py-2 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                onClick={() => navigate(adminStudioMemoryBiblePath())}
              >
                MEMORY BIBLE →
              </button>
              <button
                type="button"
                className="flex-1 py-2 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                onClick={() => navigate(adminStudioKnowledgeHubPath())}
              >
                KNOWLEDGE GRAPH →
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {LABS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[5px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
