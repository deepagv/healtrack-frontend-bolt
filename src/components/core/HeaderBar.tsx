import React from 'react';
import { Bell, Filter, Info } from 'lucide-react';
import { Badge } from '../ui/badge';

interface HeaderBarProps {
  userName: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onFilterClick?: () => void;
  className?: string;
}

export function HeaderBar({ 
  userName, 
  notificationCount = 0, 
  onNotificationClick, 
  onFilterClick,
  className 
}: HeaderBarProps) {
  const greetingTime = new Date().getHours() < 12 
    ? 'Good morning' 
    : new Date().getHours() < 18 
    ? 'Good afternoon' 
    : 'Good evening';

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className={`bg-card border-b border-border px-4 py-3 safe-area-top ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar - 32px circle */}
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" 
              alt={`${userName} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h1 className="text-h3 font-semibold text-foreground">
              {greetingTime}, {userName}
            </h1>
            <p className="text-caption text-lo">
              {currentDate}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Bell - 48×48 pill */}
          <button 
            onClick={onNotificationClick}
            className="relative w-12 h-12 bg-surface-subtle hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors focus-ring"
            aria-label={notificationCount > 0 ? `${notificationCount} new notifications` : 'Notifications'}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-danger text-white text-[10px] font-medium flex items-center justify-center min-w-[16px]"
                role="status"
                aria-label={`${notificationCount} new notifications`}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </button>
          
          {/* Filter Icon - 48×48 pill */}
          <button 
            onClick={onFilterClick}
            className="w-12 h-12 bg-surface-subtle hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors focus-ring"
            aria-label="Filter and date range"
          >
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}