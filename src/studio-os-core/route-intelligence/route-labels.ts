/** Pure route label helpers — safe for browser bundles */
export function displayNameFromRoute(route: string): string {
  const parts = route.split('/').filter(Boolean);
  const slug = parts[parts.length - 1]?.replace(/:[^/]+/g, 'param') ?? 'root';
  if (slug === 'root' || route === '/') return 'Home';
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
