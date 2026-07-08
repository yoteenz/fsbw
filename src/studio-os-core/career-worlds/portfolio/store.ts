import type { CareerPortfolioItem } from '../core/schemas';

export function createPortfolioItem(input: {
  title: string;
  description: string;
  completedDay: number;
  client?: string;
  tags?: string[];
  featured?: boolean;
}): CareerPortfolioItem {
  return {
    id: `portfolio-${input.completedDay}-${Date.now()}`,
    title: input.title,
    description: input.description,
    completedDay: input.completedDay,
    client: input.client,
    tags: input.tags ?? [],
    featured: input.featured ?? false,
  };
}

export function addPortfolioItem(
  items: CareerPortfolioItem[],
  item: CareerPortfolioItem
): CareerPortfolioItem[] {
  return [item, ...items].slice(0, 50);
}

export function featuredPortfolioItems(items: CareerPortfolioItem[]): CareerPortfolioItem[] {
  return items.filter((item) => item.featured).slice(0, 6);
}
