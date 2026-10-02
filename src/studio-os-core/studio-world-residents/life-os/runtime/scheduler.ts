import { runWorldTick } from './simulation-tick';
import { runResidentReflection } from './reflection-pass';
import { buildReturnBrief } from './return-brief-service';
import type { ResidentId } from '../../types';

/** Generic job contract — cron wiring remains disabled until authorized. */
export const residentLifeScheduler = {
  runWorldTick,
  runResidentReflection,
  generateReturnBriefMaterialization(fromIso: string, toIso: string) {
    return buildReturnBrief(fromIso, toIso, { isFounderPrivileged: true });
  },
};

export type SchedulerJobName = keyof typeof residentLifeScheduler;

export async function dispatchSchedulerJob(
  name: 'runWorldTick',
  args?: Parameters<typeof runWorldTick>[0],
): Promise<Awaited<ReturnType<typeof runWorldTick>>>;
export async function dispatchSchedulerJob(
  name: 'runResidentReflection',
  args: ResidentId,
): Promise<Awaited<ReturnType<typeof runResidentReflection>>>;
export async function dispatchSchedulerJob(
  name: 'generateReturnBriefMaterialization',
  args: { fromIso: string; toIso: string },
): Promise<ReturnType<typeof buildReturnBrief>>;
export async function dispatchSchedulerJob(name: SchedulerJobName, args?: unknown): Promise<unknown> {
  switch (name) {
    case 'runWorldTick':
      return runWorldTick(args as Parameters<typeof runWorldTick>[0]);
    case 'runResidentReflection':
      return runResidentReflection(args as ResidentId);
    case 'generateReturnBriefMaterialization': {
      const { fromIso, toIso } = args as { fromIso: string; toIso: string };
      return buildReturnBrief(fromIso, toIso, { isFounderPrivileged: true });
    }
    default:
      throw new Error(`Unknown scheduler job ${name}`);
  }
}
