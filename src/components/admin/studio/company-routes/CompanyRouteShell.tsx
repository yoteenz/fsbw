import type { ReactNode } from 'react';
import { CompanyRouteProvider } from '../../../../studio-os-core/company-routes';

type Props = {
  children: ReactNode;
};

/** Wraps company-scoped pages with Multi-Company Route Architecture™ context. */
export function CompanyRouteShell({ children }: Props) {
  return <CompanyRouteProvider>{children}</CompanyRouteProvider>;
}
