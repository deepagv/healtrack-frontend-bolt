import React from 'react';
import { Clock } from 'lucide-react';

interface UpcomingItem {
  id: string;
  name: string;
  instruction: string;
  time: string;
}

interface UpcomingCardProps {
  items?: UpcomingItem[];
  onSeeAll?: () => void;
  className?: string;
}

export function UpcomingCard({ 
  items = [{
    id: '1',
    name: 'Metformin 500mg',
    instruction: '1 tablet after breakfast',
    time: '8:00 AM'
  }], 
  onSeeAll,
  className 
}: UpcomingCardProps) {
  const nextItem = items[0];

  return (
    <div className={`bg-card rounded-card p-4 shadow-card border border-border ${className || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-body-medium font-semibold text-foreground">Upcoming</h3>
        </div>
        
        <button 
          onClick={onSeeAll}
          className="text-caption text-primary-600 hover:text-primary-700 transition-colors focus-ring rounded px-2 py-2 min-h-[44px] min-w-[44px] flex items-center"
          aria-label="See all upcoming items"
        >
          See all
        </button>
      </div>
      
      {nextItem && (
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-body font-medium text-foreground truncate">
              Take {nextItem.name}
            </p>
            <p className="text-caption text-muted-foreground">
              {nextItem.instruction}
            </p>
          </div>
          
          <div className="ml-3 flex-shrink-0">
            {/* High-contrast Due chip */}
            <div 
              className="inline-flex items-center px-2 py-1 rounded-md text-caption font-medium"
              style={{
                backgroundColor: '#FDF3C7',
                color: '#92400E',
                border: '1px solid #F3CC84'
              }}
            >
              Due {nextItem.time}
            </div>
          </div>
        </div>
      )}
      
      {items.length === 0 && (
        <div className="text-center py-4">
          <p className="text-caption text-muted-foreground">No upcoming items</p>
        </div>
      )}
    </div>
  );
}