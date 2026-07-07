import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ProductionDepartmentDef, ProductionDepartmentId } from '../../../../studio-os-core/content-pipeline/departments';
import { nextProductionDepartment } from '../../../../studio-os-core/content-pipeline/departments';
import type { NdxbookPage } from '../../../../studio-os-core/ndxbook/types';
import type { InstagramConnectionStatus } from '../../../../studio-os-core/ndxbook/pagePipeline';
import { ndxbookSocialAccountsQuickLink } from '../ndxbook-mission-control/ndxbookMissionActionRoutes';
import { NR, nrLabel, nrPanel, nrSectionTitle } from '../ndxbook-newsroom/ndxbookNewsroomTheme';
import { adminStudioNdxbookNewsroomDepartmentPath } from '../../../../utils/adminStudioRoutes';
import { DepartmentArrivalPanel } from '../experience-dna/HeadquartersExperiencePanels';
import { getDepartmentDestination } from '../../../../studio-os-core/experience-dna';
import { FounderNotesReviewBrief } from './FounderNotesPanel';

type ReviewDim = {
  label: string;
  dim: { score: number; note: string; pass: boolean };
};

function ReviewDimension({ label, dim }: ReviewDim) {
  return (
    <div className="p-2 border" style={{ borderColor: dim.pass ? '#22C55E' : NR.gold }}>
      <p style={{ ...nrLabel, color: dim.pass ? '#22C55E' : NR.gold, fontFamily: '"Futura PT Medium"' }}>
        {label} · {dim.score}%
      </p>
      <p style={{ ...nrLabel, fontSize: '6px' }}>{dim.note}</p>
    </div>
  );
}

function InstructionBlock({
  department,
  creativeSnapshot,
}: {
  department: ProductionDepartmentDef;
  creativeSnapshot?: {
    branchName: string;
    northStar: string;
    tone: string[];
  } | null;
}) {
  return (
    <div>
      <DepartmentArrivalPanel departmentId={department.id} />
      <div className="p-3 mb-3 border" style={{ ...nrPanel, borderLeft: `4px solid ${NR.accent}` }}>
      <p style={nrSectionTitle}>{department.name}</p>
      {creativeSnapshot ? (
        <p style={{ ...nrLabel, fontSize: '6px', color: NR.indigo, marginBottom: 6 }}>
          CREATIVE DIRECTION · {creativeSnapshot.branchName.toUpperCase()} · {creativeSnapshot.northStar.slice(0, 100)}
          {creativeSnapshot.northStar.length > 100 ? '…' : ''}
        </p>
      ) : null}
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '8px' }}>
        {department.tagline}
      </p>
      <p style={{ ...nrLabel, marginTop: 8 }}>
        <strong style={{ color: NR.black }}>Purpose · </strong>
        {department.purpose}
      </p>
      <p style={{ ...nrLabel, marginTop: 4 }}>
        <strong style={{ color: NR.black }}>Do this next · </strong>
        {department.nextAction}
      </p>
      <p style={{ ...nrLabel, marginTop: 4 }}>
        <strong style={{ color: NR.black }}>Before you can leave · </strong>
        {department.prerequisites}
      </p>
      <p style={{ ...nrLabel, marginTop: 4, color: NR.indigo }}>
        Exit artifact · {department.exitArtifact} · Hand off to next building when ready
      </p>
      </div>
    </div>
  );
}

function ContinueBar({
  departmentId,
  canContinue,
  continueLabel,
  onContinue,
  busy,
  blockReason,
}: {
  departmentId: ProductionDepartmentId;
  canContinue: boolean;
  continueLabel: string;
  onContinue: () => void;
  busy?: boolean;
  blockReason?: string;
}) {
  const next = nextProductionDepartment(departmentId);
  const nextDest = next ? getDepartmentDestination(next) : null;
  const dispatchLabel =
    continueLabel.startsWith('CONTINUE') && nextDest
      ? `DISPATCH TO ${nextDest.buildingName.toUpperCase()} →`
      : continueLabel;
  return (
    <div className="mt-4 p-3 border flex flex-wrap items-center gap-2" style={{ borderColor: NR.panelBorder }}>
      {blockReason ? (
        <p style={{ ...nrLabel, color: NR.gold, flex: '1 1 100%' }}>{blockReason}</p>
      ) : null}
      <button
        type="button"
        disabled={!canContinue || busy}
        onClick={onContinue}
        className="px-3 py-2 text-[7px] font-futura border"
        style={{
          fontWeight: 515,
          borderColor: canContinue ? NR.black : NR.panelBorder,
          color: canContinue ? NR.black : NR.gray,
          background: canContinue ? 'rgba(15,23,42,0.06)' : 'transparent',
        }}
      >
        {busy ? '…' : dispatchLabel}
      </button>
      {nextDest ? (
        <p style={{ ...nrLabel, fontSize: '6px' }}>
          Next building · {nextDest.buildingName} · {next?.toUpperCase()} DEPARTMENT
        </p>
      ) : null}
    </div>
  );
}

export type DepartmentWorkspaceProps = {
  department: ProductionDepartmentDef;
  page: NdxbookPage | null;
  creativeSnapshot?: {
    branchName: string;
    northStar: string;
    tone: string[];
  } | null;
  instagramStatus: InstagramConnectionStatus;
  accountsLoading: boolean;
  canContinue: boolean;
  continueBlockReason?: string;
  onContinue: () => void;
  onCreateMasterAsset: () => void;
  onRunReview: () => void;
  onApproveProduction: () => void;
  onSchedule: (publishNow: boolean) => void;
  scheduledAt: string;
  onScheduledAtChange: (iso: string) => void;
  busy: string | null;
  message: string | null;
  error: string | null;
};

export function NdxbookDepartmentWorkspace(props: DepartmentWorkspaceProps) {
  const { department, creativeSnapshot } = props;

  return (
    <div>
      <InstructionBlock department={department} creativeSnapshot={creativeSnapshot} />
      {renderDepartmentBody(props)}
    </div>
  );
}

function renderDepartmentBody(p: DepartmentWorkspaceProps) {
  switch (p.department.id) {
    case 'discover':
      return <DiscoverBody {...p} />;
    case 'development':
      return <DevelopmentBody {...p} />;
    case 'assembly':
      return <AssemblyBody {...p} />;
    case 'production':
      return <ProductionBody {...p} />;
    case 'review':
      return <ReviewBody {...p} />;
    case 'expansion':
      return <ExpansionBody {...p} />;
    case 'approval':
      return <ApprovalBody {...p} />;
    case 'publishing':
      return <PublishingBody {...p} />;
    case 'intelligence':
      return <IntelligenceBody {...p} />;
    case 'learning':
      return <LearningBody {...p} />;
    default:
      return null;
  }
}

function DiscoverBody(p: DepartmentWorkspaceProps) {
  return (
    <>
      <PlaceholderPanel title="OPPORTUNITY · TRUTH TUESDAY PILOT">
        <p style={nrLabel}>
          Campaign · NDXBook Money / Credit education · Instagram-first Project 001.
        </p>
        <ul style={{ ...nrLabel, marginTop: 8, paddingLeft: 12 }}>
          <li>Audience · adults rebuilding credit after debt payoff</li>
          <li>Objective · explain score dips after paying debt</li>
          <li>Success metric · save rate + profile visits on Instagram</li>
        </ul>
      </PlaceholderPanel>
      <PlaceholderPanel title="CREATIVE BRIEF · APPROVED (PILOT SEED)">
        <p style={nrLabel}>
          Hook · Why paying off debt can still affect your credit score.
        </p>
        <p style={{ ...nrLabel, marginTop: 4 }}>
          Tone · calm · factual · no panic · ndxbook index voice.
        </p>
      </PlaceholderPanel>
      <ContinueBar
        departmentId="discover"
        canContinue
        continueLabel="CONTINUE → DEVELOPMENT DEPARTMENT"
        onContinue={p.onContinue}
      />
    </>
  );
}

function DevelopmentBody(p: DepartmentWorkspaceProps) {
  return (
    <>
      <PlaceholderPanel title="STORYBOARD · PROJECT 001">
        <p style={nrLabel}>1. Hook — score dipped after payoff</p>
        <p style={nrLabel}>2. Explain utilization lag</p>
        <p style={nrLabel}>3. Closed account / average age</p>
        <p style={nrLabel}>4. CTA — plan the timing, do not panic</p>
      </PlaceholderPanel>
      <PlaceholderPanel title="SCRIPT EXCERPT">
        <p style={nrLabel}>
          You paid off a card. Your score dipped. Here is why: credit utilization updates slowly…
        </p>
      </PlaceholderPanel>
      <ContinueBar
        departmentId="development"
        canContinue
        continueLabel="CONTINUE → ASSEMBLY DEPARTMENT"
        onContinue={p.onContinue}
      />
    </>
  );
}

function AssemblyBody(p: DepartmentWorkspaceProps) {
  return (
    <>
      <PlaceholderPanel title="PRODUCTION CHECKLIST">
        {[
          ['Talent', 'Founder voice · on-camera optional'],
          ['Products', 'None — educational only'],
          ['Props', 'NDXBook brand template'],
          ['Instagram', p.accountsLoading ? 'Checking…' : p.instagramStatus.message],
          ['Schedule', 'Founder Pilot · flexible'],
        ].map(([k, v]) => (
          <p key={k} style={nrLabel}>
            {k} · {v}
          </p>
        ))}
        <Link to={ndxbookSocialAccountsQuickLink()} style={{ ...nrLabel, color: NR.indigo, fontSize: '6px' }}>
          SOCIAL ACCOUNTS →
        </Link>
      </PlaceholderPanel>
      <ContinueBar
        departmentId="assembly"
        canContinue
        continueLabel="CONTINUE → PRODUCTION DEPARTMENT"
        onContinue={p.onContinue}
      />
    </>
  );
}

function ProductionBody(p: DepartmentWorkspaceProps) {
  return (
    <>
      {!p.page ? (
        <>
          <PlaceholderPanel title="PRODUCTION STUDIO · MASTER ASSET WORKSPACE">
            <p style={nrLabel}>
              Infinite canvas · editor · asset library · prompt builder · live preview (placeholder layout).
            </p>
            <p style={{ ...nrLabel, marginTop: 8, color: NR.accent }}>
              Start production to register primary assets in the project passport.
            </p>
          </PlaceholderPanel>
          <button
            type="button"
            disabled={p.busy !== null}
            onClick={p.onCreateMasterAsset}
            className="w-full py-3 text-[7px] font-futura border"
            style={{ fontWeight: 515, borderColor: NR.accent, color: NR.accent, background: 'rgba(220,38,38,0.06)' }}
          >
            {p.busy === 'create' ? 'CREATING…' : '＋ START PRODUCTION · PROJECT 001'}
          </button>
        </>
      ) : (
        <MasterAssetStudio page={p.page} />
      )}
      <ContinueBar
        departmentId="production"
        canContinue={p.canContinue}
        continueLabel="SEND TO REVIEW DEPARTMENT →"
        onContinue={p.onContinue}
        busy={p.busy !== null}
        blockReason={p.continueBlockReason}
      />
      {p.message ? <p style={{ ...nrLabel, color: '#22C55E', marginTop: 6 }}>{p.message}</p> : null}
      {p.error ? <p style={{ ...nrLabel, color: NR.accent, marginTop: 6 }}>{p.error}</p> : null}
    </>
  );
}

function MasterAssetStudio({ page }: { page: NdxbookPage }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="lg:col-span-2 p-3 border space-y-2" style={{ ...nrPanel, minHeight: 280 }}>
        <p style={nrSectionTitle}>EDITOR · MASTER CONTENT ASSET</p>
        <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.accent }}>
          {page.pageLabel.toUpperCase()} · {page.title.toUpperCase()}
        </p>
        <p style={nrLabel}>{page.hook}</p>
        <div className="p-2 border max-h-32 overflow-y-auto" style={{ borderColor: NR.panelBorder }}>
          <p style={{ ...nrLabel, fontSize: '6px', whiteSpace: 'pre-wrap' }}>{page.script}</p>
        </div>
        <p style={nrSectionTitle}>CAPTION</p>
        <p style={{ ...nrLabel, fontSize: '6px', whiteSpace: 'pre-wrap' }}>{page.caption}</p>
        <p style={nrLabel}>VERSION · v1 · {new Date(page.updatedAt).toLocaleString()}</p>
      </div>
      <div className="space-y-2">
        <div className="p-2 border" style={{ ...nrPanel }}>
          <p style={{ ...nrSectionTitle, fontSize: '7px' }}>LIVE PREVIEW</p>
          <img
            src={page.thumbnail}
            alt={`${page.pageLabel} cover`}
            className="w-full border"
            style={{ borderColor: NR.panelBorder }}
          />
        </div>
        <div className="p-2 border" style={{ borderColor: NR.panelBorder }}>
          <p style={{ ...nrSectionTitle, fontSize: '7px' }}>DIRECTOR NOTES</p>
          <p style={nrLabel}>Instagram square · educational carousel-ready · NDXBook indigo frame.</p>
        </div>
        <div className="p-2 border" style={{ borderColor: NR.panelBorder }}>
          <p style={{ ...nrSectionTitle, fontSize: '7px' }}>REFERENCE · PROMPT HISTORY</p>
          <p style={nrLabel}>Seed content · Money/Credit chapter · pilot v1</p>
        </div>
      </div>
    </div>
  );
}

function ReviewBody(p: DepartmentWorkspaceProps) {
  const review = p.page?.pipeline?.studioReview;
  return (
    <>
      {!p.page ? (
        <p style={{ ...nrLabel, color: NR.gold }}>
          No master asset — return to{' '}
          <Link to={adminStudioNdxbookNewsroomDepartmentPath('production')} style={{ color: NR.indigo }}>
            Production Department
          </Link>
        </p>
      ) : (
        <>
          <FounderNotesReviewBrief page={p.page} departmentId="review" />
          <MasterAssetStudio page={p.page} />
          <div className="mt-3 flex flex-wrap gap-1">
            {!review ? (
              <button
                type="button"
                disabled={p.busy !== null}
                onClick={p.onRunReview}
                className="px-2 py-1 text-[6px] font-futura border"
                style={{ borderColor: NR.indigo, color: NR.indigo }}
              >
                {p.busy === 'review' ? '…' : 'RUN STUDIO INTELLIGENCE'}
              </button>
            ) : null}
            {review && !p.page.pipeline?.approvedAt ? (
              <button
                type="button"
                disabled={p.busy !== null || !review.overallPass}
                onClick={p.onApproveProduction}
                className="px-2 py-1 text-[6px] font-futura border"
                style={{ borderColor: '#22C55E', color: '#22C55E' }}
              >
                {p.busy === 'approve' ? '…' : 'APPROVE PRODUCTION'}
              </button>
            ) : null}
          </div>
          {review ? (
            <div className="mt-2">
              <p style={nrSectionTitle}>CONCIERGE REVIEW BOARD · {review.overallPass ? 'PASS' : 'NEEDS WORK'}</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                <ReviewDimension label="CLARITY" dim={review.clarity} />
                <ReviewDimension label="ACCURACY" dim={review.accuracy} />
                <ReviewDimension label="TONE" dim={review.tone} />
                <ReviewDimension label="BRAND" dim={review.brandAlignment} />
                <ReviewDimension label="AUTHENTICITY" dim={review.authenticity} />
              </div>
            </div>
          ) : null}
        </>
      )}
      <ContinueBar
        departmentId="review"
        canContinue={p.canContinue}
        continueLabel="CONTINUE → EXPANSION DEPARTMENT"
        onContinue={p.onContinue}
        blockReason={p.continueBlockReason}
      />
      {p.message ? <p style={{ ...nrLabel, color: '#22C55E', marginTop: 6 }}>{p.message}</p> : null}
      {p.error ? <p style={{ ...nrLabel, color: NR.accent, marginTop: 6 }}>{p.error}</p> : null}
    </>
  );
}

function ExpansionBody(p: DepartmentWorkspaceProps) {
  const derivatives = [
    ['Instagram Feed', 'Caption + carousel frames', 'ready'],
    ['Instagram Story', '3-frame story script', 'ready'],
    ['Newsletter', 'Long-form excerpt', 'placeholder'],
    ['Knowledge Graph', 'Credit score FAQ node', 'placeholder'],
  ];
  return (
    <>
      <PlaceholderPanel title="DERIVATIVE ASSET LIBRARY">
        {derivatives.map(([name, desc, status]) => (
          <div key={name} className="p-2 mb-1 border flex justify-between" style={{ borderColor: NR.panelBorder }}>
            <div>
              <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black }}>{name}</p>
              <p style={{ ...nrLabel, fontSize: '6px' }}>{desc}</p>
            </div>
            <p style={{ ...nrLabel, color: status === 'ready' ? '#22C55E' : NR.gray }}>{status.toUpperCase()}</p>
          </div>
        ))}
      </PlaceholderPanel>
      <ContinueBar
        departmentId="expansion"
        canContinue={p.canContinue}
        continueLabel="CONTINUE → APPROVAL DEPARTMENT"
        onContinue={p.onContinue}
        blockReason={p.continueBlockReason}
      />
    </>
  );
}

function ApprovalBody(p: DepartmentWorkspaceProps) {
  const igReady = p.instagramStatus.active && p.instagramStatus.postingEnabled;
  return (
    <>
      <PlaceholderPanel title="CAMPAIGN APPROVAL GRID">
        <p style={nrLabel}>Instagram output · Project 001 · {igReady ? 'READY' : 'CHECK CONNECTION'}</p>
        <Link to={ndxbookSocialAccountsQuickLink()} style={{ ...nrLabel, color: NR.indigo, fontSize: '6px' }}>
          SOCIAL ACCOUNTS →
        </Link>
      </PlaceholderPanel>
      <ContinueBar
        departmentId="approval"
        canContinue={p.canContinue}
        continueLabel="AUTHORIZE → PUBLISHING DEPARTMENT"
        onContinue={p.onContinue}
        blockReason={p.continueBlockReason}
      />
    </>
  );
}

function PublishingBody(p: DepartmentWorkspaceProps) {
  const toLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <>
      <PlaceholderPanel title="PUBLISHING QUEUE · MISSION CONTROL">
        <p style={nrLabel}>
          Channel · Instagram only (Founder Pilot) · Pack · dist-ndx-page-001
        </p>
        {p.page?.pipeline?.approvedAt ? (
          <div className="mt-2 flex flex-wrap gap-1 items-center">
            <input
              type="datetime-local"
              value={toLocal(p.scheduledAt)}
              onChange={(e) => p.onScheduledAtChange(new Date(e.target.value).toISOString())}
              className="text-[6px] border px-1 py-1"
              style={{ borderColor: NR.panelBorder }}
            />
            <button
              type="button"
              disabled={p.busy !== null}
              onClick={() => p.onSchedule(false)}
              className="px-2 py-1 text-[6px] font-futura border"
              style={{ borderColor: NR.gold, color: NR.gold }}
            >
              {p.busy === 'schedule' ? '…' : 'SCHEDULE INSTAGRAM'}
            </button>
            <button
              type="button"
              disabled={p.busy !== null}
              onClick={() => p.onSchedule(true)}
              className="px-2 py-1 text-[6px] font-futura border"
              style={{ borderColor: NR.accent, color: NR.accent }}
            >
              {p.busy === 'publish' ? '…' : 'PUBLISH NOW'}
            </button>
          </div>
        ) : (
          <p style={{ ...nrLabel, color: NR.gold, marginTop: 4 }}>Complete Review and approve production first.</p>
        )}
      </PlaceholderPanel>
      <ContinueBar
        departmentId="publishing"
        canContinue={p.canContinue}
        continueLabel="CONTINUE → INTELLIGENCE DEPARTMENT"
        onContinue={p.onContinue}
        blockReason={p.continueBlockReason}
      />
      {p.message ? <p style={{ ...nrLabel, color: '#22C55E', marginTop: 6 }}>{p.message}</p> : null}
      {p.error ? <p style={{ ...nrLabel, color: NR.accent, marginTop: 6 }}>{p.error}</p> : null}
    </>
  );
}

function IntelligenceBody(p: DepartmentWorkspaceProps) {
  const perf = p.page?.performance;
  return (
    <>
      <PlaceholderPanel title="LIVE ANALYTICS · PLACEHOLDER">
        {p.page?.status === 'published' || p.page?.status === 'scheduled' ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['REACH', perf ? String(perf.engagement) : '—'],
              ['SAVES', perf ? String(perf.saves) : '—'],
              ['SHARES', perf ? String(perf.shares) : '—'],
              ['CTR', perf ? `${perf.clicks}%` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="p-2 border text-center" style={{ borderColor: NR.panelBorder }}>
                <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.accent }}>{val}</p>
                <p style={{ ...nrLabel, fontSize: '5px' }}>{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={nrLabel}>Publish Project 001 outputs to unlock live metrics.</p>
        )}
      </PlaceholderPanel>
      <ContinueBar
        departmentId="intelligence"
        canContinue={p.canContinue}
        continueLabel="CONTINUE → LEARNING DEPARTMENT"
        onContinue={p.onContinue}
        blockReason={p.continueBlockReason}
      />
    </>
  );
}

function LearningBody(p: DepartmentWorkspaceProps) {
  return (
    <>
      <PlaceholderPanel title="STUDIO INTELLIGENCE · LEARNINGS">
        <ul style={{ ...nrLabel, paddingLeft: 12 }}>
          <li>Educational credit content outperforms generic debt posts (pilot hypothesis)</li>
          <li>Instagram-first cadence validated for Project 001</li>
          <li>Archive to Knowledge Library on publish</li>
        </ul>
        {p.page?.status === 'published' ? (
          <p style={{ ...nrLabel, color: '#22C55E', marginTop: 8 }}>Project 001 archived · institutional knowledge updated.</p>
        ) : null}
      </PlaceholderPanel>
      <ContinueBar
        departmentId="learning"
        canContinue={p.canContinue}
        continueLabel="RETURN → DISCOVER DEPARTMENT (PROJECT 002)"
        onContinue={p.onContinue}
        blockReason={p.continueBlockReason}
      />
    </>
  );
}

function PlaceholderPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="p-3 mb-3" style={{ ...nrPanel, borderLeft: `4px solid ${NR.indigo}` }}>
      <p style={nrSectionTitle}>{title}</p>
      {children}
    </section>
  );
}
