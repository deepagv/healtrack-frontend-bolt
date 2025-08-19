import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled, 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-button text-button font-medium transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed active:scale-98';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    secondary: 'border border-border bg-background text-foreground hover:bg-surface-subtle',
    tertiary: 'text-primary-600 hover:bg-primary-600/10'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-caption min-w-[44px]',
    md: 'h-11 px-4 min-w-[44px]',
    lg: 'h-12 px-6 min-w-[44px]'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}