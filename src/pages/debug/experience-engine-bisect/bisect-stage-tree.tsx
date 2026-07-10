/**
 * React subtree mounted per bisect stage — dynamic imports only when stage requires them.
 */
import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { BisectInstrument } from '../../../platform-stabilization/experience-engine-freeze-bisect/render-instrumentation';
import { recordFreezeCheckpoint } from '../../../platform-stabilization/experience-engine-freeze-bisect/freeze-trace-ledger';

type Props = {
  maxStage: number;
};

const LazyErrorBoundary = lazy(async () => {
  const { PlatformErrorBoundary } = await import('../../../platform-stabilization/PlatformErrorBoundary');
  return {
    default: PlatformErrorBoundary,
  };
});

const LazyWorkspaceProvider = lazy(async () => {
  const { WorkspaceProvider } = await import('../../../studio-os-core/context/WorkspaceProvider');
  return { default: WorkspaceProvider };
});

const LazyOrbProvider = lazy(async () => {
  const { StudioOrbProvider } = await import('../../../components/admin/studio/studio-orb/StudioOrbProvider');
  return { default: StudioOrbProvider };
});

const LazyGoldenShell = lazy(async () => {
  const { DepartmentGoldenBuildShell } = await import(
    '../../../components/admin/studio-os/department-vertical-slice/DepartmentGoldenBuildShell'
  );
  return { default: DepartmentGoldenBuildShell };
});

const LazyEeWorkspace = lazy(async () => {
  const { ExperienceEngineDnaWorkspace } = await import(
    '../../../components/admin/studio/experience-engine-dna/ExperienceEngineDnaWorkspace'
  );
  return { default: ExperienceEngineDnaWorkspace };
});

function StageFallback({ label }: { label: string }) {
  return <p style={{ color: '#94a3b8', margin: 0 }}>Loading {label}…</p>;
}

function AuthReadPanel() {
  const [signedIn, setSignedIn] = useState<string>('…');
  const [userLen, setUserLen] = useState<number | null>(null);

  useEffect(() => {
    recordFreezeCheckpoint({
      route: '/__experience-engine-bisect',
      stage: 3,
      component: 'AuthReadPanel',
      function: 'useEffect',
      phase: 'enter',
      detail: 'localStorage-read',
    });
    try {
      setSignedIn(localStorage.getItem('isSignedIn') ?? 'null');
      const user = localStorage.getItem('currentUser');
      setUserLen(user?.length ?? null);
    } catch {
      setSignedIn('error');
    }
    recordFreezeCheckpoint({
      route: '/__experience-engine-bisect',
      stage: 3,
      component: 'AuthReadPanel',
      function: 'useEffect',
      phase: 'exit',
    });
  }, []);

  return (
    <pre style={{ background: '#111827', padding: 8, borderRadius: 4, fontSize: 11 }}>
      {JSON.stringify({ isSignedIn: signedIn, currentUserBytes: userLen }, null, 2)}
    </pre>
  );
}

function OrbProbe() {
  const [detail, setDetail] = useState<string>('pending');

  useEffect(() => {
    let cancelled = false;
    recordFreezeCheckpoint({
      route: '/__experience-engine-bisect',
      stage: 11,
      component: 'OrbProbe',
      function: 'useEffect',
      phase: 'enter',
    });
    import('../../../studio-os-core/genesis/orb/engine')
      .then(({ buildOrbReadyViewSnapshot }) => {
        if (cancelled) return;
        const snap = buildOrbReadyViewSnapshot({ pathname: '/admin/studio/experience-engine' });
        const line = `memories=${snap.memoryTimeline.length}`;
        setDetail(line);
        recordFreezeCheckpoint({
          route: '/__experience-engine-bisect',
          stage: 11,
          component: 'OrbProbe',
          function: 'buildOrbReadyViewSnapshot',
          phase: 'exit',
          detail: line,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setDetail(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <p style={{ margin: 0, fontSize: 12 }}>Orb probe: {detail}</p>;
}

function wrapStage(stage: number, name: string, node: ReactNode): ReactNode {
  if (stage <= 0) return null;
  return (
    <BisectInstrument name={name} stage={stage}>
      {node}
    </BisectInstrument>
  );
}

export function BisectStageTree({ maxStage }: Props) {
  if (maxStage < 1) return null;

  let inner: ReactNode = (
    <p style={{ margin: 0 }}>
      Experience Engine bisect shell — stage {maxStage}. No production UI loaded yet.
    </p>
  );

  if (maxStage >= 3) {
    inner = (
      <>
        {inner}
        <AuthReadPanel />
      </>
    );
  }

  if (maxStage >= 4) {
    inner = (
      <Suspense fallback={<StageFallback label="WorkspaceProvider" />}>
        <LazyWorkspaceProvider>
          <div data-bisect-workspace="mounted">{inner}</div>
        </LazyWorkspaceProvider>
      </Suspense>
    );
  }

  if (maxStage >= 11) {
    inner = (
      <Suspense fallback={<StageFallback label="StudioOrbProvider" />}>
        <LazyOrbProvider>
          <OrbProbe />
          {inner}
        </LazyOrbProvider>
      </Suspense>
    );
  }

  if (maxStage >= 12) {
    inner = (
      <Suspense fallback={<StageFallback label="DepartmentGoldenBuildShell" />}>
        <LazyGoldenShell>
          <Suspense fallback={<StageFallback label="ExperienceEngineDnaWorkspace" />}>
            <LazyEeWorkspace />
          </Suspense>
        </LazyGoldenShell>
      </Suspense>
    );
  }

  if (maxStage >= 2) {
    inner = (
      <Suspense fallback={<StageFallback label="PlatformErrorBoundary" />}>
        <LazyErrorBoundary boundary="experience-engine-bisect">{inner}</LazyErrorBoundary>
      </Suspense>
    );
  }

  return wrapStage(Math.min(maxStage, 1), 'BisectStageTree', inner);
}
