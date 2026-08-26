import type { Load } from '../../dispatch/dispatchTypes';
import type { DocumentCompletenessResult } from './documentCompleteness';
import type { FreightAutopilotState } from './freightAutopilotTypes';
import type { FreightException } from './freightExceptionTypes';

export interface FreightAutopilotPanelData {
  load: Load;
  state: FreightAutopilotState;
  exceptions: FreightException[];
  documentCompleteness: DocumentCompletenessResult;
}

export interface FreightAutopilotRepository {
  getPanelData(loadId: string): Promise<FreightAutopilotPanelData | undefined>;
}
