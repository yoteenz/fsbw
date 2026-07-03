import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from './types';

export type ScheduleSlotInput = {
  packId: string;
  dayId: string;
  timeSlot: string;
};

export type ScheduleSlotOutput = {
  scheduledId: string;
  status: 'scheduled';
};

export const schedulingStudioService: StudioServiceStub & {
  schedulePack(_input: ScheduleSlotInput): Promise<StudioServiceResult<ScheduleSlotOutput>>;
  reschedulePack(_packId: string, _input: ScheduleSlotInput): Promise<StudioServiceResult<ScheduleSlotOutput>>;
} = {
  id: 'scheduling',
  label: 'SCHEDULING',
  phase: 2,
  enabled: false,
  description: 'WEEKLY CALENDAR · PREMIERE SLOTS · QUEUE SYNC',
  async schedulePack() {
    return studioServiceNotConnected('Scheduling is not connected. Wire scheduling service in Phase 2.');
  },
  async reschedulePack() {
    return studioServiceNotConnected('Reschedule is not connected. Wire scheduling service in Phase 2.');
  },
};
