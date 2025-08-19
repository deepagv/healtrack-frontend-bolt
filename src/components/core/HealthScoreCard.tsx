import React from 'react';
import { TrendingUp } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
  trend?: number;
  physicalScore?: number;
  mentalScore?: number;
  labsScore?: number;
  onViewTrends?: () => void;
  className?: string;
}

export function HealthScoreCard({ 
  score = 75, 
  trend = 5,
  physicalScore = 85,
  mentalScore = 78,
  labsScore = 72,
  onViewTrends,
  className 
}: HealthScoreCardProps) {
  const circumference = 2 * Math.PI * 30; // radius = 30 for 72×72 gauge
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Sparkline data - simplified for demo
  const sparklineData = [72, 74, 71, 75, 78, 76, score];
  const maxValue = Math.max(...sparklineData);
  const minValue = Math.min(...sparklineData);
  
  return (
    <div className={`bg-card rounded-card p-6 shadow-card border border-border ${className || ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-h3 font-semibold text-foreground">Health Score</h3>
          <p className="text-caption text-muted-foreground">Based on recent data</p>
        </div>
        
        {/* Sparkline + Trend */}
        <div className="flex items-center gap-3">
          <svg width="60" height="20" viewBox="0 0 60 20" className="text-primary-600">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklineData.map((value, index) => {
                const x = (index / (sparklineData.length - 1)) * 56 + 2;
                const y = 18 - ((value - minValue) / (maxValue - minValue)) * 16;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
          
          {trend && (
            <div className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-md text-[11px] font-medium">
              {/* Warm accent arrow */}
              <TrendingUp 
                className="w-3 h-3"
                style={{ color: 'var(--color-accent-warm-600)' }}
              />
              +{trend} this week
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Gauge - 72×72 */}
        <div className="relative">
          <svg width="72" height="72" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="text-primary-600 transition-all duration-700 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[20px] leading-[24px] font-semibold text-foreground tabular-nums">
                {score}
              </div>
              <div className="text-caption text-muted-foreground">/ 100</div>
            </div>
          </div>
        </div>
        
        {/* Score breakdown */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-caption text-muted-foreground">Physical</span>
            <span className="text-caption font-medium text-foreground tabular-nums">{physicalScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-caption text-muted-foreground">Mental</span>
            <span className="text-caption font-medium text-foreground tabular-nums">{mentalScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-caption text-muted-foreground">Labs</span>
            <span className="text-caption font-medium text-foreground tabular-nums">{labsScore}</span>
          </div>
        </div>
      </div>
      
      {/* View trends link with warm hover underline */}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={onViewTrends}
          className="text-caption text-primary-600 hover:text-primary-700 transition-colors focus-ring rounded px-1 py-1 min-h-[44px] min-w-[44px] flex items-center hover-warm-underline"
        >
          View trends
        </button>
      </div>
    </div>
  );
}