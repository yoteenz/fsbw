import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  getProductionDepartment,
  parseProductionDepartmentId,
  type ProductionDepartmentId,
} from '../../../../studio-os-core/content-pipeline/departments';
import {
  acknowledgeProductionDepartment,
  canContinueFromDepartment,
  isDepartmentAccessible,
  resolveDepartmentStatuses,
  resolveRecommendedDepartment,
} from '../../../../studio-os-core/ndxbook/productionDepartmentProgress';
import { createProductionPageFromRegistry } from '../../../../studio-os-core/ndxbook/newsroom/pageSync';
import { useNdxbookPagePipeline } from '../../../../hooks/useNdxbookPagePipeline';
import { useFounderNotes } from '../../../../hooks/useFounderNotes';
import {
  adminStudioNdxbookNewsroomDepartmentPath,
  adminStudioNdxbookNewsroomPath,
} from '../../../../utils/adminStudioRoutes';
import { NewsroomHeader } from '../ndxbook-newsroom/NdxbookNewsroomPanels';
import { NR, nrLabel, NDXBOOK_NEWSROOM_STYLES } from '../ndxbook-newsroom/ndxbookNewsroomTheme';
import { nextProductionDepartment } from '../../../../studio-os-core/content-pipeline/departments';
import { MasterAssetPassport } from './MasterAssetPassport';
import { NdxbookDepartmentWorkspace } from './NdxbookDepartmentWorkspace';
import { ProductionDepartmentStrip } from './ProductionDepartmentStrip';
import { FounderNotesPanel } from './FounderNotesPanel';
import { CreativeDirectionStrip } from '../creative-direction-studio/CreativeDirectionStudioWorkspace';
import { useCreativeDirectionStudio } from '../../../../hooks/useCreativeDirectionStudio';
import { syncFounderNotesToCreativeDirection } from '../../../../studio-os-core/creative-direction-studio';
import { StudioDirectorBanner } from '../experience-dna/HeadquartersExperiencePanels';

function defaultScheduleLaterToday(): string {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return d.toISOString();
}

type Props = {
  workspaceId: string;
};

export function NdxbookProductionEngine({ workspaceId }: Props) {
  const { departmentId: rawDept } = useParams<{ departmentId?: string }>();
  const navigate = useNavigate();
  const parsed = parseProductionDepartmentId(rawDept);

  const {
    page001,
    instagramStatus,
    accountsLoading,
    createPage001,
    submitReview,
    approveProduction,
    scheduleInstagram,
    refresh,
  } = useNdxbookPagePipeline();

  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleLaterToday);

  const recommended = useMemo(() => resolveRecommendedDepartment(page001), [page001]);

  const activeDept: ProductionDepartmentId =
    parsed && isDepartmentAccessible(page001, parsed) ? parsed : recommended;

  const department = useMemo(() => getProductionDepartment(activeDept), [activeDept]);

  const statuses = useMemo(
    () => resolveDepartmentStatuses(page001, activeDept),
    [page001, activeDept]
  );

  const continueCheck = useMemo(
    () => canContinueFromDepartment(page001, activeDept),
    [page001, activeDept]
  );

  const founderNotes = useFounderNotes(page001, activeDept);

  useEffect(() => {
    syncFounderNotesToCreativeDirection();
  }, [founderNotes.notes.length]);

  const creativeDirection = useCreativeDirectionStudio();

  const mergedContinueCheck = useMemo(() => {
    if (!continueCheck.ok) return continueCheck;
    if (!founderNotes.advanceGuard.ok) return founderNotes.advanceGuard;
    return { ok: true as const };
  }, [continueCheck, founderNotes.advanceGuard]);

  const handOff = useCallback(
    (target: ProductionDepartmentId) => {
      acknowledgeProductionDepartment(activeDept);
      navigate(adminStudioNdxbookNewsroomDepartmentPath(target));
      setMessage(null);
      setError(null);
    },
    [activeDept, navigate]
  );

  const onContinue = useCallback(() => {
    const deptCheck = canContinueFromDepartment(page001, activeDept);
    if (!deptCheck.ok) {
      setError(deptCheck.reason ?? 'Complete this department before continuing.');
      return;
    }
    if (!founderNotes.advanceGuard.ok) {
      setError(founderNotes.advanceGuard.reason ?? 'Resolve founder notes before advancing.');
      return;
    }
    acknowledgeProductionDepartment(activeDept);
    const next = nextProductionDepartment(activeDept);
    if (next) {
      navigate(adminStudioNdxbookNewsroomDepartmentPath(next));
    } else {
      navigate(adminStudioNdxbookNewsroomDepartmentPath('discover'));
    }
    setError(null);
    setMessage(`Handed off to ${next ?? 'Discover'} Department.`);
  }, [activeDept, founderNotes.advanceGuard, navigate, page001]);

  const onCreateMasterAsset = useCallback(() => {
    setBusy('create');
    setError(null);
    setMessage(null);
    try {
      const created = createPage001();
      createProductionPageFromRegistry(created);
      acknowledgeProductionDepartment('production');
      setMessage(`${created.pageLabel} created — Master Content Asset registered.`);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(null);
    }
  }, [createPage001, refresh]);

  const onRunReview = useCallback(() => {
    if (!page001) return;
    setBusy('review');
    setError(null);
    const result = submitReview(page001.id);
    if (!result.ok) setError(result.error ?? 'Review failed');
    else setMessage('Studio Intelligence review complete.');
    setBusy(null);
  }, [page001, submitReview]);

  const onApproveProduction = useCallback(() => {
    if (!page001) return;
    if (!founderNotes.advanceGuard.ok) {
      setError(founderNotes.advanceGuard.reason ?? 'Resolve founder notes before approving.');
      return;
    }
    setBusy('approve');
    setError(null);
    const result = approveProduction(page001.id);
    if (!result.ok) setError(result.error ?? 'Approval failed');
    else {
      acknowledgeProductionDepartment('review');
      setMessage(`${page001.pageLabel} approved — Quality Approved.`);
      navigate(adminStudioNdxbookNewsroomDepartmentPath('expansion'));
    }
    setBusy(null);
  }, [approveProduction, founderNotes.advanceGuard, navigate, page001]);

  const onSchedule = useCallback(
    async (publishNow: boolean) => {
      if (!page001) return;
      setBusy(publishNow ? 'publish' : 'schedule');
      setError(null);
      const result = await scheduleInstagram(
        page001.id,
        publishNow ? new Date().toISOString() : scheduledAt,
        publishNow
      );
      if (!result.ok && !result.page) setError(result.error ?? 'Action failed');
      else {
        acknowledgeProductionDepartment('publishing');
        setMessage(result.error ?? (publishNow ? 'Published.' : 'Scheduled.'));
        navigate(adminStudioNdxbookNewsroomDepartmentPath('intelligence'));
      }
      setBusy(null);
    },
    [page001, scheduleInstagram, scheduledAt, navigate]
  );

  useEffect(() => {
    setMessage(null);
    setError(null);
  }, [activeDept]);

  if (!rawDept) {
    return <Navigate to={adminStudioNdxbookNewsroomDepartmentPath(recommended)} replace />;
  }

  if (!parsed || !isDepartmentAccessible(page001, parsed)) {
    return <Navigate to={adminStudioNdxbookNewsroomDepartmentPath(recommended)} replace />;
  }

  return (
    <div className="ndxbook-production-engine-root">
      <style>{NDXBOOK_NEWSROOM_STYLES}</style>
      <NewsroomHeader workspaceId={workspaceId} />

      <nav className="mb-2 flex flex-wrap items-center gap-1 text-[6px] font-futura uppercase" style={{ color: NR.gray }}>
        <Link to={adminStudioNdxbookNewsroomPath()} style={{ color: NR.indigo }}>
          PRODUCTION WING
        </Link>
        <span>/</span>
        <span style={{ color: NR.black }}>PAGE 001</span>
        <span>/</span>
        <span style={{ color: NR.accent }}>{department.shortName}</span>
      </nav>

      <ProductionDepartmentStrip statuses={statuses} currentId={activeDept} />

      <StudioDirectorBanner projectLabel="PAGE 001" currentDepartment={activeDept} statuses={statuses} />

      <CreativeDirectionStrip currentDepartment={activeDept} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <MasterAssetPassport
            page={page001}
            department={department}
            openNotesCount={founderNotes.blockingCount}
          />
          <FounderNotesPanel
            page={page001}
            departmentId={activeDept}
            onNavigateDepartment={(dept) => navigate(adminStudioNdxbookNewsroomDepartmentPath(dept))}
            onPageRefresh={refresh}
          />
        </div>
        <div className="lg:col-span-3 order-1 lg:order-2">
          <NdxbookDepartmentWorkspace
            department={department}
            page={page001}
            creativeSnapshot={creativeDirection.snapshot}
            instagramStatus={instagramStatus}
            accountsLoading={accountsLoading}
            canContinue={mergedContinueCheck.ok}
            continueBlockReason={mergedContinueCheck.ok ? undefined : mergedContinueCheck.reason}
            onContinue={onContinue}
            onCreateMasterAsset={onCreateMasterAsset}
            onRunReview={onRunReview}
            onApproveProduction={onApproveProduction}
            onSchedule={onSchedule}
            scheduledAt={scheduledAt}
            onScheduledAtChange={setScheduledAt}
            busy={busy}
            message={message}
            error={error}
          />
        </div>
      </div>

      <p style={{ ...nrLabel, fontSize: '6px', marginTop: 12 }}>
        Completed rooms remain in{' '}
        <button
          type="button"
          className="underline"
          style={{ color: NR.indigo }}
          onClick={() => handOff(resolveRecommendedDepartment(page001))}
        >
          history
        </button>
        · Locked rooms unlock as the asset advances.
      </p>
    </div>
  );
}
