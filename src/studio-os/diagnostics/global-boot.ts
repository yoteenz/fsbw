/**
 * Earliest possible global flight recorder boot — imported synchronously from main.tsx
 * before any route dispatch, legacy bootstrap, or Experience Lab modules load.
 */
import { initStudioOsFlightRecorder } from './init';
import { initWorldCompilerInvestigationRecorder } from './world-compiler-investigation/investigation-recorder-boot';

initStudioOsFlightRecorder({ envLabel: 'global-boot' });
initWorldCompilerInvestigationRecorder();
