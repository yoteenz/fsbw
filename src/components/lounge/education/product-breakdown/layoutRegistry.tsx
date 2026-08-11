import type { ComponentType } from 'react';
import type { WigUnitSlug } from '../../../../content/education/care/productCatalog';
import type { ProductBreakdownEditorialContent } from '../../../../content/education/product-breakdown/types';
import { NoirBreakdownLayout } from './layouts/NoirBreakdownLayout';
import { ScaffoldBreakdownLayout } from './layouts/ScaffoldBreakdownLayout';

export type ProductBreakdownLayoutProps = {
  content: ProductBreakdownEditorialContent;
};

const LAYOUT_BY_UNIT: Partial<Record<WigUnitSlug, ComponentType<ProductBreakdownLayoutProps>>> = {
  noir: NoirBreakdownLayout,
};

const DEFAULT_LAYOUT = ScaffoldBreakdownLayout;

export function resolveProductBreakdownLayout(
  unitId: WigUnitSlug,
): ComponentType<ProductBreakdownLayoutProps> {
  return LAYOUT_BY_UNIT[unitId] ?? DEFAULT_LAYOUT;
}

export function ProductBreakdownLayoutRenderer({
  content,
}: ProductBreakdownLayoutProps) {
  const Layout = resolveProductBreakdownLayout(content.unitId);
  return <Layout content={content} />;
}
