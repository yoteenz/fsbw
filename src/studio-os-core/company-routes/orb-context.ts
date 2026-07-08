import type { CompanyRouteContextValue } from './types';

export type OrbCompanyContext = {
  companyName: string;
  companySlug: string;
  department: string | null;
  room: string | null;
  scene: string | null;
  genomeId: string;
  narrativeLine: string;
};

export function buildOrbCompanyContext(ctx: CompanyRouteContextValue): OrbCompanyContext {
  const dept = ctx.activeDepartment
    ? ctx.activeDepartment.replace(/-/g, ' ')
    : ctx.activeRoom?.replace(/-/g, ' ') ?? null;

  const parts = [
    `Company: ${ctx.companyName}`,
    dept ? `Department: ${dept.replace(/\b\w/g, (c) => c.toUpperCase())}` : null,
    ctx.activeRoom ? `Room: ${ctx.activeRoom.replace(/-/g, ' ')}` : null,
    `Company Genome: ${ctx.companyGenome.genomeId.replace(/-/g, ' ')}`,
  ].filter(Boolean);

  return {
    companyName: ctx.companyName,
    companySlug: ctx.companySlug,
    department: ctx.activeDepartment,
    room: ctx.activeRoom,
    scene: ctx.activeScene,
    genomeId: ctx.companyGenome.genomeId,
    narrativeLine: parts.join(' · '),
  };
}
