import React from 'react';
import { cn } from '../ui/utils';

interface StatusChipProps {
  variant: 'due' | 'ai' | 'new' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export function StatusChip({ variant, children, className }: StatusChipProps) {
  const variantClasses = {
    due: 'bg-[#FDF3C7] text-[#92400E] border-[#F3CC84]',
    ai: 'bg-accent-600/10 text-accent-600 border-accent-600/20',
    new: 'bg-primary-600/10 text-primary-600 border-primary-600/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20'
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-caption font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}