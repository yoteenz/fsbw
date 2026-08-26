export type PretripInspectionResult = 'PASS' | 'DEFECT_REPORTED' | 'OUT_OF_SERVICE' | 'REVIEW_REQUIRED';

export interface PretripInspection {
  id: string;
  organizationId: string;
  driverId: string;
  powerUnitId?: string;
  trailerId?: string;
  loadId?: string;
  result: PretripInspectionResult;
  defectSummary?: string;
  odometerMiles?: number;
  inspectedAt: string;
  escalatedToFleetCare: boolean;
  fleetCareTicketId?: string;
  createdAt: string;
}

export interface SubmitPretripInput {
  organizationId: string;
  driverId: string;
  powerUnitId?: string;
  trailerId?: string;
  loadId?: string;
  result: PretripInspectionResult;
  defectSummary?: string;
  odometerMiles?: number;
}

export function shouldEscalateToFleetCare(result: PretripInspectionResult): boolean {
  return result === 'DEFECT_REPORTED' || result === 'OUT_OF_SERVICE' || result === 'REVIEW_REQUIRED';
}
