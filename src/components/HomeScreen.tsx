import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Moon, 
  Heart, 
  Flame, 
  ChevronRight
} from 'lucide-react';
import { HeaderBar } from './core/HeaderBar';
import { MoodChips } from './core/MoodChips';
import { HealthScoreCard } from './core/HealthScoreCard';
import { KpiTile } from './core/KpiTile';
import { UploadCard } from './core/UploadCard';
import { UpcomingCard } from './core/UpcomingCard';
import { getDashboardData } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

interface HomeScreenProps {
  user: User;
  onNavigateToUpload: () => void;
}

export function HomeScreen({ user, onNavigateToUpload }: HomeScreenProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<'good' | 'okay' | 'unwell'>();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Setup scroll listener for bottom nav blur effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use fallback data
      setDashboardData({
        healthScore: 75,
        activities: {
          steps: 8547,
          sleep: 443, // minutes
          heartRate: 72,
          calories: 1847
        },
        nextMedication: {
          name: 'Metformin 500mg',
          instruction: '1 tablet after breakfast',
          time: '8:00 AM'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
  };

  const handleFilterClick = () => {
    console.log('Filter clicked');
  };

  const handleMoodChange = (mood: 'good' | 'okay' | 'unwell') => {
    setSelectedMood(mood);
    console.log('Mood selected:', mood);
  };

  const handleViewTrends = () => {
    console.log('View trends clicked');
  };

  const handleKpiClick = (metric: string) => {
    console.log(`${metric} clicked`);
  };

  const handleUploadClick = () => {
    console.log('Upload clicked');
    onNavigateToUpload();
  };

  const handleInfoClick = () => {
    console.log('Privacy info clicked');
  };

  const handleSeeAll = () => {
    console.log('See all upcoming clicked');
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted/20 rounded-card"></div>
          <div className="h-32 bg-muted/20 rounded-card"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-muted/20 rounded-tile"></div>
            <div className="h-24 bg-muted/20 rounded-tile"></div>
            <div className="h-24 bg-muted/20 rounded-tile"></div>
            <div className="h-24 bg-muted/20 rounded-tile"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <HeaderBar
        userName={user.user_metadata?.name?.split(' ')[0] || 'there'}
        notificationCount={2}
        onNotificationClick={handleNotificationClick}
        onFilterClick={handleFilterClick}
      />

      <div className="p-4 space-y-6">
        {/* Mood Chips */}
        <div 
          className="animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <MoodChips
            value={selectedMood}
            onChange={handleMoodChange}
          />
        </div>

        {/* Health Score Card */}
        <div 
          className="animate-fade-in"
          style={{ animationDelay: '40ms' }}
        >
          <HealthScoreCard
            score={dashboardData?.healthScore || 75}
            trend={5}
            physicalScore={85}
            mentalScore={78}
            labsScore={72}
            onViewTrends={handleViewTrends}
          />
        </div>

        {/* KPI Tiles - 2×2 Grid with proper layout */}
        <div 
          className="animate-fade-in"
          style={{ animationDelay: '80ms' }}
        >
          <div 
            className="grid grid-cols-2 auto-rows-fr"
            style={{ 
              gap: '16px',
              gridTemplateColumns: 'minmax(160px, 1fr) minmax(160px, 1fr)'
            }}
          >
            <KpiTile
              icon={<Activity className="w-6 h-6" />}
              label="Steps"
              value={dashboardData?.activities?.steps?.toLocaleString() || '8,547'}
              onClick={() => handleKpiClick('Steps')}
            />
            <KpiTile
              icon={<Moon className="w-6 h-6" />}
              label="Sleep"
              value={Math.floor((dashboardData?.activities?.sleep || 443) / 60).toString()}
              unit="h"
              onClick={() => handleKpiClick('Sleep')}
            />
            <KpiTile
              icon={<Heart className="w-6 h-6" />}
              label="Avg HR"
              value={(dashboardData?.activities?.heartRate || 72).toString()}
              unit="bpm"
              onClick={() => handleKpiClick('Heart Rate')}
            />
            <KpiTile
              icon={<Flame className="w-6 h-6" />}
              label="Calories"
              value={(dashboardData?.activities?.calories || 1847).toLocaleString()}
              onClick={() => handleKpiClick('Calories')}
            />
          </div>
        </div>

        {/* Medical Reports Upload Card */}
        <div 
          className="animate-fade-in"
          style={{ animationDelay: '120ms' }}
        >
          <UploadCard
            onUpload={handleUploadClick}
            onInfoClick={handleInfoClick}
          />
        </div>

        {/* Upcoming */}
        <div 
          className="animate-fade-in"
          style={{ animationDelay: '160ms' }}
        >
          <UpcomingCard
            items={dashboardData?.nextMedication ? [{
              id: '1',
              name: dashboardData.nextMedication.name,
              instruction: dashboardData.nextMedication.instruction,
              time: dashboardData.nextMedication.time
            }] : []}
            onSeeAll={handleSeeAll}
          />
        </div>

        {/* Medical Disclaimer */}
        <div className="text-center pt-4 pb-8">
          <button 
            onClick={() => console.log('Medical disclaimer clicked')}
            className="text-caption text-muted-foreground hover:text-foreground transition-colors underline min-h-[44px] px-2 focus-ring rounded"
          >
            Not medical advice
          </button>
        </div>
      </div>
    </div>
  );
}

// Animation styles - inject only once
if (typeof document !== 'undefined' && !document.querySelector('#healtrack-animations')) {
  const animationStyles = `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }
    
    @keyframes gauge-sweep {
      from {
        stroke-dashoffset: ${2 * Math.PI * 30};
      }
      to {
        stroke-dashoffset: var(--final-offset, 0);
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
    
    /* Reduced motion variants */
    @media (prefers-reduced-motion: reduce) {
      .animate-fade-in {
        animation: fade-in-reduced 200ms ease-out both;
      }
      
      @keyframes fade-in-reduced {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .gauge-sweep,
      .count-up {
        animation: none;
      }
    }
    
    /* Active state scale for tiles */
    .active-scale-98 {
      transform: scale(0.98);
      transition: transform 120ms ease-out;
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.id = 'healtrack-animations';
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}