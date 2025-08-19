import React from 'react';
import { TrendingUp } from 'lucide-react';
import { StatusChip } from './StatusChip';

interface HealthScoreGaugeProps {
  score: number;
  trend?: number;
  className?: string;
}

export function HealthScoreGauge({ score, trend, className }: HealthScoreGaugeProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Simple sparkline data (would come from props in real app)
  const sparklineData = [72, 74, 71, 75, 78, 76, score];
  const maxValue = Math.max(...sparklineData);
  const minValue = Math.min(...sparklineData);
  
  return (
    <div className={`bg-card rounded-card p-6 shadow-card border border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-h3 font-semibold text-foreground">Health Score</h3>
          <p className="text-caption text-muted-foreground">Based on recent data</p>
        </div>
        
        {/* Sparkline */}
        <div className="flex items-center gap-3">
          <svg width="80" height="24" viewBox="0 0 80 24" className="text-primary-600">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklineData.map((value, index) => {
                const x = (index / (sparklineData.length - 1)) * 76 + 2;
                const y = 22 - ((value - minValue) / (maxValue - minValue)) * 20;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
          
          {trend && (
            <StatusChip variant={trend > 0 ? 'success' : 'warning'} className="text-[11px] px-1.5 py-0.5">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend > 0 ? '+' : ''}{trend} this week
            </StatusChip>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width="100" height="100" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="text-primary-600 transition-all duration-700 ease-out"
              style={{
                animation: 'gauge-sweep 700ms ease-out'
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div 
                className="text-h1 font-bold text-foreground tabular-nums"
                style={{
                  animation: 'count-up 600ms ease-out'
                }}
              >
                {score}
              </div>
              <div className="text-caption text-muted-foreground">/ 100</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-caption text-muted-foreground">Physical</span>
              <span className="text-caption font-medium tabular-nums">85</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-caption text-muted-foreground">Mental</span>
              <span className="text-caption font-medium tabular-nums">78</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-caption text-muted-foreground">Labs</span>
              <span className="text-caption font-medium tabular-nums">72</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add CSS keyframes for animations
const styles = `
@keyframes gauge-sweep {
  from {
    stroke-dashoffset: ${2 * Math.PI * 45};
  }
  to {
    stroke-dashoffset: var(--final-offset);
  }
}

@keyframes count-up {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}