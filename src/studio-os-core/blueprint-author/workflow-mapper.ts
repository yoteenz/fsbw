import type { FounderCompileRequest } from './contract';

export type BlueprintWorkflowSource = 'experience-lab' | 'creative-director';

export type BlueprintWorkflowContext = {
  source: BlueprintWorkflowSource;
  organizationId: string;
  founderIntent: string;
  roomType?: string;
  stationId?: string;
  departmentId?: string;
  projectId?: string;
  styleProfileId?: string;
};

/** Map studio UI context → Blueprint Author FounderCompileRequest (no generation). */
export function mapWorkflowContextToCompileRequest(ctx: BlueprintWorkflowContext): FounderCompileRequest {
  const slug = ctx.organizationId.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'studio-os';
  const requestId = `req-${ctx.source}-${Date.now()}`;

  return {
    requestId,
    organizationId: ctx.organizationId,
    buildingId: `building-${slug}-hq`,
    floorId: 'floor-executive-01',
    roomId: `room-${ctx.roomType ?? 'creative-studio'}`,
    stationId: ctx.stationId ?? 'creative-studio-station',
    departmentId: ctx.departmentId ?? 'executive',
    projectId: ctx.projectId ?? 'studio-world-hq',
    founderIntent: ctx.founderIntent.trim() || 'Studio World creative build',
    roomType: ctx.roomType ?? (ctx.source === 'creative-director' ? 'campaign-studio' : 'reception'),
    styleProfileId: ctx.styleProfileId ?? 'executive-reception',
  };
}
