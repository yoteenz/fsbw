import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../utilities/cn';

export type FdsFieldProps = {
  className?: string;
  children?: ReactNode;
};

export function FdsField({ className, children }: FdsFieldProps) {
  return <div className={cn('fds-field', className)}>{children}</div>;
}

export type FdsLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function FdsLabel({ className, ...rest }: FdsLabelProps) {
  return <label className={cn('fds-label', className)} {...rest} />;
}

export type FdsInputProps = InputHTMLAttributes<HTMLInputElement>;

export function FdsInput({ className, ...rest }: FdsInputProps) {
  return <input className={cn('fds-input', className)} {...rest} />;
}

export type FdsTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FdsTextarea({ className, ...rest }: FdsTextareaProps) {
  return <textarea className={cn('fds-textarea', className)} {...rest} />;
}

export type FdsSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function FdsSelect({ className, children, ...rest }: FdsSelectProps) {
  return (
    <select className={cn('fds-select', className)} {...rest}>
      {children}
    </select>
  );
}
