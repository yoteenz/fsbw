export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function fdsClass(base: string, className?: string): string {
  return className ? `${base} ${className}` : base;
}
