import { useState } from 'react';
import { useKnowledgeCommerceState } from '../../../../hooks/useKnowledgeCommerceState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  CUSTOMER_JOURNEY_STAGES,
  KNOWLEDGE_COMMERCE_PHILOSOPHY,
  KNOWLEDGE_PRODUCT_TYPES,
  LICENSE_MODELS,
  VISIBILITY_LEVELS,
} from '../../../../studio-os-core/knowledge-commerce';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type CommerceTab =
  | 'dashboard'
  | 'products'
  | 'licensing'
  | 'ai-experts'
  | 'journey'
  | 'intelligence'
  | 'assets'
  | 'opportunities';

const TABS: { id: CommerceTab; label: string }[] = [
  { id: 'dashboard', label: 'COMMERCE DASHBOARD' },
  { id: 'products', label: 'PRODUCT BUILDER' },
  { id: 'licensing', label: 'LICENSING' },
  { id: 'ai-experts', label: 'AI EXPERTS' },
  { id: 'journey', label: 'CUSTOMER JOURNEY' },
  { id: 'intelligence', label: 'REVENUE INTEL' },
  { id: 'assets', label: 'KNOWLEDGE ASSETS' },
  { id: 'opportunities', label: 'OPPORTUNITIES' },
];

export function KnowledgeCommerceWorkspace() {
  const [tab, setTab] = useState<CommerceTab>('dashboard');
  const { profile, refresh } = useKnowledgeCommerceState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        KNOWLEDGE COMMERCE LOADING — BUILDING EXPERTISE ECONOMY FROM PROFESSION BRAIN™
      </p>
    );
  }

  const published = profile.products.filter((p) => p.published);

  const renderDashboard = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 92.5 · KNOWLEDGE COMMERCE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Our greatest product isn't what we sell — it's what we know."
        stats={[
          { label: 'MRR', value: `$${profile.totalMrrUsd.toLocaleString()}` },
          { label: 'LIFETIME', value: `$${profile.totalLifetimeRevenueUsd.toLocaleString()}` },
          { label: 'PRODUCTS', value: String(published.length) },
          { label: 'AI EXPERTS', value: String(profile.aiExpertExperiences.filter((e) => e.published).length) },
        ]}
      />
      {profile.brainDashboards.map((d) => (
        <ExecutiveSecondaryCard key={d.brainId} title={d.brainLabel}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {d.productsPublished} published · MRR ${d.monthlyRecurringRevenueUsd} · Lifetime ${d.lifetimeRevenueUsd} ·{' '}
            {d.knowledgeUtilizationPct}% utilization · Topics: {d.mostPopularTopics.slice(0, 2).join(' · ')}
          </p>
        </ExecutiveSecondaryCard>
      ))}
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: '#92704A', color: '#92704A' }}
      >
        SYNC FROM PROFESSION BRAIN
      </button>
    </ExecutivePageShell>
  );

  const renderProducts = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="KNOWLEDGE PRODUCT BUILDER · ONE BRAIN · MULTIPLE REVENUE STREAMS">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Offerings: {KNOWLEDGE_PRODUCT_TYPES.slice(0, 8).join(' · ')}…
        </p>
        {profile.products.map((p) => (
          <div key={p.id} className="mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
              {p.type.replace(/-/g, ' ')} · {p.visibility} · {p.licenseModel.replace(/-/g, ' ')}
            </p>
            <p className="text-[7px] font-futura uppercase">{p.title}</p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              ${p.priceUsd} · {p.status} · {p.published ? 'PUBLISHED' : 'DRAFT'} · ${p.revenueUsd} revenue
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLicensing = () => (
    <ExecutiveFocusPanel title="KNOWLEDGE LICENSING MODELS">
      {LICENSE_MODELS.map((model) => {
        const count = profile.products.filter((p) => p.licenseModel === model).length;
        return (
          <p key={model} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {model.replace(/-/g, ' ').toUpperCase()} · {count} product{count === 1 ? '' : 's'}
          </p>
        );
      })}
      <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        Visibility: {VISIBILITY_LEVELS.join(' · ')}
      </p>
    </ExecutiveFocusPanel>
  );

  const renderAiExperts = () => (
    <ExecutivePageShell>
      {profile.aiExpertExperiences.map((exp) => (
        <ExecutiveSecondaryCard key={exp.id} title={exp.expertName}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {exp.trainedByNote} · ${exp.monthlyRevenueUsd}/mo · {exp.published ? 'LIVE' : 'DRAFT'}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderJourney = () => (
    <ExecutiveFocusPanel title="CUSTOMER EXPERTISE JOURNEY">
      {profile.customerJourney.map((step, i) => (
        <div key={step.stage} className="mb-2 flex items-start gap-2">
          <span className="text-[6px] font-futura" style={{ color: '#92704A' }}>{i + 1}</span>
          <div>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515 }}>{step.label}</p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{step.description}</p>
          </div>
          {i < profile.customerJourney.length - 1 ? <span className="text-[6px] ml-auto">↓</span> : null}
        </div>
      ))}
      <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
        Stages: {CUSTOMER_JOURNEY_STAGES.join(' → ')}
      </p>
    </ExecutiveFocusPanel>
  );

  const renderIntelligence = () => (
    <ExecutivePageShell>
      {profile.revenueInsights.map((insight) => (
        <ExecutiveSecondaryCard key={insight.id} title={insight.title}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {insight.detail} · {insight.confidence}% confidence
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderAssets = () => (
    <ExecutiveFocusPanel title="KNOWLEDGE ASSETS · MANAGED LIKE INVENTORY">
      {published.slice(0, 12).map((p) => (
        <div key={p.id} className="mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515 }}>{p.title}</p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            v{p.version} · {p.owner} · ★ {p.rating.toFixed(1)} ({p.reviewCount}) · {p.usageCount} uses · ${p.revenueUsd}
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderOpportunities = () => (
    <ExecutivePageShell>
      {KNOWLEDGE_COMMERCE_PHILOSOPHY.slice(1, 3).map((line) => (
        <ExecutiveSecondaryCard key={line} title="PHILOSOPHY">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{line}</p>
        </ExecutiveSecondaryCard>
      ))}
      {profile.opportunities.map((opp) => (
        <ExecutiveSecondaryCard key={opp.id} title={opp.title}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {opp.prompt}
          </p>
          <p className="text-[6px] font-futura mt-1" style={{ color: '#92704A' }}>
            Suggested: {opp.suggestedProductType.replace(/-/g, ' ')}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'products':
        return renderProducts();
      case 'licensing':
        return renderLicensing();
      case 'ai-experts':
        return renderAiExperts();
      case 'journey':
        return renderJourney();
      case 'intelligence':
        return renderIntelligence();
      case 'assets':
        return renderAssets();
      case 'opportunities':
        return renderOpportunities();
      default:
        return renderDashboard();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="knowledge-commerce" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,112,74,0.06)' : 'white',
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
