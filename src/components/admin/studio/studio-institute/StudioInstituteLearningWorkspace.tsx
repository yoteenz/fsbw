import { useState } from 'react';
import { useStudioInstituteOrgState } from '../../../../hooks/useStudioInstituteOrgState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  INSTITUTE_LEARNING_ARTIFACT_TYPES,
  INSTITUTE_LEARNING_AUDIENCES,
  SI_INSTITUTE_PHILOSOPHY,
  adaptArtifactForAudience,
} from '../../../../studio-os-core/studio-institute';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
} from '../executive-ia';

type InstituteTab =
  | 'dashboard'
  | 'courses'
  | 'roles'
  | 'scenarios'
  | 'certifications'
  | 'customers'
  | 'evolution'
  | 'audiences';

const TABS: { id: InstituteTab; label: string }[] = [
  { id: 'dashboard', label: 'INSTITUTE DASHBOARD' },
  { id: 'courses', label: 'COURSES & LESSONS' },
  { id: 'roles', label: 'ROLE PATHS' },
  { id: 'scenarios', label: 'SCENARIO LEARNING' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'customers', label: 'CUSTOMER EDUCATION' },
  { id: 'evolution', label: 'LIVING SYNC' },
  { id: 'audiences', label: 'AUDIENCES' },
];

export function StudioInstituteLearningWorkspace() {
  const [tab, setTab] = useState<InstituteTab>('dashboard');
  const [audiencePreview, setAudiencePreview] = useState<string>('employee');
  const { profile, audienceStats, refresh } = useStudioInstituteOrgState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        STUDIO INSTITUTE LOADING — GENERATING LEARNING FROM PROFESSION BRAIN™
      </p>
    );
  }

  const { dashboard } = profile;

  const renderDashboard = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 93 · STUDIO INSTITUTE™"
        title={profile.companyName.toUpperCase()}
        subtitle={dashboard.instituteActivitySummary}
        progressPct={dashboard.learningProgressPct}
        stats={[
          { label: 'CERTIFICATIONS', value: String(dashboard.completedCertifications) },
          { label: 'RECOMMENDED', value: String(dashboard.recommendedLessons) },
          { label: 'ARTIFACTS', value: String(dashboard.totalArtifacts) },
          { label: 'CUSTOMER', value: String(dashboard.customerCoursesAvailable) },
        ]}
      />
      <ExecutiveFocusPanel title="LEARNING CULTURE">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          Employee progress {dashboard.employeeProgressPct}% · {dashboard.customerCoursesAvailable} customer courses ·{' '}
          {dashboard.knowledgeUpdatesPending} knowledge updates pending sync.
        </p>
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Recently added: {dashboard.recentlyAddedTopics.join(' · ') || '—'}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
          style={{ borderColor: '#854D0E', color: '#854D0E' }}
        >
          SYNC FROM PROFESSION BRAIN
        </button>
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryGrid>
        {SI_INSTITUTE_PHILOSOPHY.slice(0, 3).map((line) => (
          <ExecutiveSecondaryCard key={line} title="PHILOSOPHY">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveSecondaryGrid>
    </ExecutivePageShell>
  );

  const renderCourses = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AUTO-GENERATED FROM PROFESSION BRAIN™">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          One source · unlimited educational experiences · {profile.artifacts.length} artifacts
        </p>
        {INSTITUTE_LEARNING_ARTIFACT_TYPES.map((type) => {
          const items = profile.artifacts.filter((a) => a.type === type);
          if (items.length === 0) return null;
          return (
            <div key={type} className="mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#854D0E' }}>
                {type.replace(/-/g, ' ')} ({items.length})
              </p>
              {items.slice(0, 2).map((a) => (
                <p key={a.id} className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {a.title} · {a.durationMinutes}m · {a.audiences.join(', ')}
                </p>
              ))}
            </div>
          );
        })}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderRoles = () => (
    <ExecutivePageShell>
      {profile.rolePaths.map((path) => (
        <ExecutiveSecondaryCard key={path.id} title={path.role}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {path.progressPct}% progress · Master: {path.masteryTopics.slice(0, 3).join(' · ')}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderScenarios = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DECISION-MAKING · NOT MEMORIZATION">
        {profile.scenarios.map((s) => (
          <div key={s.id} className="mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515 }}>{s.title}</p>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{s.teachFocus}</p>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCertifications = () => (
    <ExecutivePageShell>
      {profile.certifications.map((c) => (
        <ExecutiveSecondaryCard key={c.id} title={c.name}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {c.status.toUpperCase()} · {c.progressPct}% · {c.pendingEmployees} pending · {c.holdersCount} certified
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderCustomers = () => (
    <ExecutivePageShell>
      {profile.customerCourses.length === 0 ? (
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Enable public surfaces on Profession Brain to publish customer education.
        </p>
      ) : (
        profile.customerCourses.map((course) => (
          <ExecutiveSecondaryCard key={course.id} title={course.title}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {course.lessonCount} lessons · {course.capabilities.join(' · ')} · {course.published ? 'PUBLISHED' : 'DRAFT'}
            </p>
          </ExecutiveSecondaryCard>
        ))
      )}
    </ExecutivePageShell>
  );

  const renderEvolution = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="LIVING SYNC"
        title="ORGANIZATIONAL KNOWLEDGE"
        subtitle={profile.evolutionSummary}
      />
      {profile.knowledgeUpdates.map((u) => (
        <ExecutiveSecondaryCard key={u.id} title={u.title}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {u.description} · Affects: {u.affectedArtifacts.join(', ')}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderAudiences = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MULTI-AUDIENCE ADAPTATION">
        <div className="flex flex-wrap gap-1 mb-2">
          {INSTITUTE_LEARNING_AUDIENCES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAudiencePreview(a)}
              className="px-2 py-1 text-[6px] font-futura uppercase border"
              style={{
                borderColor: audiencePreview === a ? '#854D0E' : ADMIN_STUDIO_THEME.panelBorder,
                color: audiencePreview === a ? '#854D0E' : ADMIN_STUDIO_THEME.textSecondary,
              }}
            >
              {a}
            </button>
          ))}
        </div>
        {audienceStats.map(({ audience, artifactCount }) => (
          <p key={audience} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {audience}: {artifactCount} experiences
          </p>
        ))}
        {profile.artifacts[0] ? (
          <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Preview · {adaptArtifactForAudience(profile.artifacts[0], audiencePreview as typeof INSTITUTE_LEARNING_AUDIENCES[number]).presentation}
          </p>
        ) : null}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'courses':
        return renderCourses();
      case 'roles':
        return renderRoles();
      case 'scenarios':
        return renderScenarios();
      case 'certifications':
        return renderCertifications();
      case 'customers':
        return renderCustomers();
      case 'evolution':
        return renderEvolution();
      case 'audiences':
        return renderAudiences();
      default:
        return renderDashboard();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="studio-institute" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#854D0E' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#854D0E' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(133,77,14,0.06)' : 'white',
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
