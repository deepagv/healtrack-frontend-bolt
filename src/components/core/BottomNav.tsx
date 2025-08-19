import React from 'react';
import { Home, Activity, BookOpen, Calendar, User } from 'lucide-react';

export type TabType = 'home' | 'track' | 'log' | 'appointments' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isScrolled?: boolean;
  className?: string;
}

const tabs = [
  { 
    id: 'home' as TabType, 
    label: 'Home', 
    icon: Home,
    filledIcon: Home,
    ariaLabel: 'Home dashboard'
  },
  { 
    id: 'track' as TabType, 
    label: 'Track', 
    icon: Activity,
    filledIcon: Activity,
    ariaLabel: 'Track health metrics'
  },
  { 
    id: 'log' as TabType, 
    label: 'Log', 
    icon: BookOpen,
    filledIcon: BookOpen,
    ariaLabel: 'Log health data'
  },
  { 
    id: 'appointments' as TabType, 
    label: 'Appts', 
    icon: Calendar,
    filledIcon: Calendar,
    ariaLabel: 'Appointments'
  },
  { 
    id: 'profile' as TabType, 
    label: 'Profile', 
    icon: User,
    filledIcon: User,
    ariaLabel: 'User profile'
  },
];

export function BottomNav({ activeTab, onTabChange, isScrolled = false, className }: BottomNavProps) {
  return (
    <nav 
      className={`
        bg-card border-t border-border p-2 safe-area-bottom relative
        ${isScrolled ? 'backdrop-blur-md bg-card/95' : ''}
        ${className || ''}
      `}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-lg
                min-w-[44px] min-h-[44px] transition-all duration-200
                focus-ring active:scale-95
                ${isActive 
                  ? 'text-primary-600' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.ariaLabel}
              aria-controls={`panel-${tab.id}`}
            >
              {/* Active state accent bar */}
              {isActive && (
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-600 rounded-full"
                  aria-hidden="true"
                />
              )}
              
              <Icon 
                className="w-6 h-6 mb-1" 
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 0 : 2}
              />
              <span className="text-caption font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}