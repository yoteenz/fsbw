import { initMainThreadDiagnostics, markStartupCheckpoint } from './main-thread-diagnostics';

initMainThreadDiagnostics();
markStartupCheckpoint('pre', 'diagnostics-side-effect');
