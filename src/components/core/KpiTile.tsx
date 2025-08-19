import React from 'react';

interface KpiTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function KpiTile({ 
  icon, 
  label, 
  value, 
  unit, 
  onClick, 
  disabled = false,
  className 
}: KpiTileProps) {
  const isInteractive = !!onClick && !disabled;
  
  // Create accessible label
  const accessibleLabel = `${label}: ${value}${unit ? ` ${unit}` : ''} today`;
  
  return (
    <div
      className={`
        bg-card rounded-tile shadow-tile border border-border
        flex flex-col
        transition-all duration-200
        ${isInteractive 
          ? 'cursor-pointer hover:shadow-md active:scale-[0.98] focus-ring' 
          : ''
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className || ''}
      `}
      style={{
        minWidth: '160px',
        minHeight: '96px',
        padding: '14px 16px'
      }}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      aria-label={isInteractive ? accessibleLabel : undefined}
      aria-disabled={disabled}
    >
      {/* Icon - 24px, aligned left */}
      <div 
        className="text-muted-foreground flex-shrink-0" 
        style={{ 
          width: '24px', 
          height: '24px',
          marginBottom: '6px'
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      
      {/* Value and unit - 20/24 semibold, tabular numerals */}
      <div 
        className="flex items-baseline gap-1 flex-shrink-0"
        style={{ marginBottom: '6px' }}
      >
        <span 
          className="font-semibold text-foreground tabular-nums"
          style={{
            fontSize: '20px',
            lineHeight: '24px',
            fontFeatureSettings: '"tnum" 1'
          }}
        >
          {value}
        </span>
        {unit && (
          <span 
            className="text-muted-foreground"
            style={{
              fontSize: '13px',
              lineHeight: '18px'
            }}
          >
            {unit}
          </span>
        )}
      </div>
      
      {/* Label - 13/18 regular, text/lo color, single line with ellipsis */}
      <span 
        className="text-lo flex-shrink-0 truncate"
        style={{
          fontSize: '13px',
          lineHeight: '18px',
          fontWeight: '400'
        }}
        title={label}
      >
        {label}
      </span>
    </div>
  );
}