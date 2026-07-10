/**
 * Isolated diagnostic entry — never imports main-legacy, App.tsx, or Studio Bootstrap.
 */
import {
  appendBootTrace,
  readPreMainProbe,
  recordDiagnosticBootEvent,
} from './boot-events';
import { initDiagnosticFlightRecorder } from './init-diagnostic-recorder';
import { injectDiagnosticPlainDom, showDiagnosticPlainDomFailed } from './plain-dom';
import { isDiagnosticRoute, type DiagnosticRoutePath } from './paths';
import { quarantineIncompatiblePersistedState } from './persisted-state-audit';

async function bootDiagnosticEntry(): Promise<void> {
  if (typeof window === 'undefined') return;

  const pathname = window.location.pathname;
  if (!isDiagnosticRoute(pathname)) return;

  recordDiagnosticBootEvent('DIAGNOSTIC_ENTRY_SELECTED', { route: pathname });
  appendBootTrace('DIAGNOSTIC_ENTRY_SELECTED', { route: pathname });

  const probe = readPreMainProbe();
  if (probe?.buildMismatch) {
    recordDiagnosticBootEvent('SERVICE_WORKER_VERSION_MISMATCH', {
      previousBuildId: probe.previousBuildId,
      buildId: probe.buildId,
    });
  }

  injectDiagnosticPlainDom('loading', pathname);

  const quarantine = quarantineIncompatiblePersistedState();
  if (quarantine.quarantined.length > 0) {
    recordDiagnosticBootEvent('PERSISTED_STATE_QUARANTINED', {
      keys: quarantine.quarantined.map((q) => q.key),
    });
  }
  if (quarantine.valid.length > 0) {
    recordDiagnosticBootEvent('PERSISTED_STATE_VALID', { count: quarantine.valid.length });
  }
  if (quarantine.invalid.length > 0) {
    recordDiagnosticBootEvent('PERSISTED_STATE_INVALID', {
      keys: quarantine.invalid.map((i) => i.key),
    });
  }
  if (probe?.studioOsLocalKeys?.length || probe?.studioOsSessionKeys?.length) {
    recordDiagnosticBootEvent('PERSISTED_STATE_FOUND', {
      local: probe.studioOsLocalKeys?.length ?? 0,
      session: probe.studioOsSessionKeys?.length ?? 0,
    });
  }

  initDiagnosticFlightRecorder();

  const { inspectServiceWorkerAndCaches } = await import('./service-worker-audit');
  const swAudit = await inspectServiceWorkerAndCaches();
  if (swAudit.registrations > 0) {
    recordDiagnosticBootEvent('SERVICE_WORKER_FOUND', {
      registrations: swAudit.registrations,
      controllers: swAudit.controllerUrls,
    });
  }
  recordDiagnosticBootEvent('CACHE_MANIFEST_INSPECTED', {
    cacheNames: swAudit.cacheNames,
    staleAssetHints: swAudit.staleAssetHints,
  });

  appendBootTrace('MAIN_BOOT_BYPASSED', { route: pathname });

  if (pathname === '/__studio-os-recovery') {
    const { mountRecoveryPage } = await import('./mount-recovery');
    mountRecoveryPage(pathname);
    return;
  }

  const { mountIsolatedBlackBox } = await import('./mount-isolated-black-box');
  mountIsolatedBlackBox(pathname as DiagnosticRoutePath);
}

void bootDiagnosticEntry().catch((err: unknown) => {
  const pathname = window.location.pathname;
  showDiagnosticPlainDomFailed(pathname, err);
  recordDiagnosticBootEvent('ERROR', {
    message: err instanceof Error ? err.message : String(err),
  });
});
