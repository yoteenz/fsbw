import type { ElementType, ReactNode } from 'react';
import { fdsTypographyClass } from '../typography/presets';
import type { FdsTypographyPreset } from '../tokens/types';
import { cn } from '../utilities/cn';

export type FdsTextProps = {
  as?: ElementType;
  preset?: FdsTypographyPreset;
  className?: string;
  children?: ReactNode;
};

export function FdsText({ as: Tag = 'p', preset = 'body', className, children }: FdsTextProps) {
  return <Tag className={cn(fdsTypographyClass(preset), className)}>{children}</Tag>;
}
