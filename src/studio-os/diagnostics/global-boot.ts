/**
 * Earliest possible global flight recorder boot — imported synchronously from main.tsx
 * before any route dispatch, legacy bootstrap, or Experience Lab modules load.
 */
import { initStudioOsFlightRecorder } from './init';

initStudioOsFlightRecorder({ envLabel: 'global-boot' });
