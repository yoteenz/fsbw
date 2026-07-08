import { GLOBAL_STUDIO_ROUTES, STUDIO_COMPANIES_BASE } from './constants';
import type { CompanyDepartmentId } from './types';

export function studioCompanyPath(companySlug: string, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/');
  return tail ? `${STUDIO_COMPANIES_BASE}/${companySlug}/${tail}` : `${STUDIO_COMPANIES_BASE}/${companySlug}`;
}

export function studioCompanyGrandAtriumPath(companySlug: string): string {
  return studioCompanyPath(companySlug, 'grand-atrium');
}

export function studioCompanyCreativeDirectionPath(companySlug: string): string {
  return studioCompanyPath(companySlug, 'creative-direction');
}

export function studioCompanyStoryTablePath(companySlug: string): string {
  return studioCompanyPath(companySlug, 'creative-direction', 'story-table');
}

export function studioCompanyDepartmentPath(companySlug: string, departmentId: CompanyDepartmentId): string {
  return studioCompanyPath(companySlug, 'departments', departmentId);
}

export function studioCompanyDepartmentsPath(companySlug: string): string {
  return studioCompanyPath(companySlug, 'departments');
}

export { GLOBAL_STUDIO_ROUTES, STUDIO_COMPANIES_BASE };
