import React from 'react';
import { cn } from '../ui/utils';

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  onClick?: () => void;
}

export function MetricTile({ icon, label, value, unit, trend, className, onClick }: MetricTileProps) {
  const isInteractive = !!onClick;
  
  return (
    <div
      className={cn(
        'bg-card rounded-tile p-4 shadow-tile border border-border',
        'flex flex-col items-start min-h-[88px] min-w-[44px]',
        isInteractive && 'cursor-pointer hover:shadow-md transition-all duration-200 active:scale-98',
        className
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="w-6 h-6 text-text-lo mb-2" aria-hidden="true">
        {icon}
      </div>
      
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-h3 font-semibold tabular-nums text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-caption text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      
      <span className="text-caption text-muted-foreground">
        {label}
      </span>
    </div>
  );
}