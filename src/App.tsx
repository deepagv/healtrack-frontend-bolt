import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useNetworkStatus, OfflineState } from './components/ErrorStates';
import { DashboardEmptyState, MedicationsEmptyState, AppointmentsEmptyState } from './components/EmptyStates';
import { BottomNav, TabType } from './components/core/BottomNav';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { TrackingScreen } from './components/TrackingScreen';
import { LogScreen } from './components/LogScreen';
import { AppointmentsScreen } from './components/AppointmentsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { UploadFlow } from './components/UploadFlow';
import { NotificationSettingsScreen } from './components/NotificationSettingsScreen';
import { ExportModal, ExportSuccessModal } from './components/ExportModal';
import { getCurrentUser } from './utils/supabase/client';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
  };
}

type AppScreen = TabType | 'upload' | 'notifications' | 'export';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json'>('pdf');
  const [hasData, setHasData] = useState(false);
  
  const isOnline = useNetworkStatus();

  useEffect(() => {
    checkAuth();
    initializeSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Check if user has any data (simulate with localStorage for demo)
      const userData = localStorage.getItem(`healtrack_data_${currentUser?.id}`);
      setHasData(!!userData);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = () => {
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('healtrack_dark_mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('healtrack_dark_mode', JSON.stringify(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveScreen('home');
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveScreen('home');
    setHasData(false);
  };

  const navigateToScreen = (screen: AppScreen) => {
    setActiveScreen(screen);
  };

  const handleDataAdded = () => {
    setHasData(true);
    if (user) {
      localStorage.setItem(`healtrack_data_${user.id}`, 'true');
    }
  };

  const handleExportSuccess = () => {
    setShowExportModal(false);
    setShowExportSuccess(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body text-muted-foreground">Loading HealTrack...</p>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex flex-col h-screen bg-background max-w-md mx-auto">
        <OfflineState onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        if (!hasData) {
          return (
            <DashboardEmptyState 
              onUpload={() => {
                navigateToScreen('upload');
                handleDataAdded();
              }} 
            />
          );
        }
        return (
          <HomeScreen 
            user={user} 
            onNavigateToUpload={() => navigateToScreen('upload')}
          />
        );
        
      case 'track':
        return <TrackingScreen user={user} />;
        
      case 'log':
        return <LogScreen user={user} />;
        
      case 'appointments':
        if (!hasData) {
          return (
            <AppointmentsEmptyState 
              onSchedule={() => {
                console.log('Schedule appointment');
                handleDataAdded();
              }} 
            />
          );
        }
        return <AppointmentsScreen user={user} />;
        
      case 'profile':
        return (
          <ProfileScreen 
            user={user} 
            onSignOut={handleSignOut}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            onShowNotifications={() => navigateToScreen('notifications')}
            onShowExport={() => setShowExportModal(true)}
          />
        );
        
      case 'upload':
        return (
          <UploadFlow 
            onBack={() => navigateToScreen('home')}
          />
        );
        
      case 'notifications':
        return (
          <NotificationSettingsScreen
            onBack={() => navigateToScreen('profile')}
          />
        );
        
      default:
        return (
          <HomeScreen 
            user={user} 
            onNavigateToUpload={() => navigateToScreen('upload')}
          />
        );
    }
  };

  // Hide bottom nav for certain screens
  const hideBottomNav = ['upload', 'notifications'].includes(activeScreen);
  const activeTab = ['home', 'track', 'log', 'appointments', 'profile'].includes(activeScreen) 
    ? activeScreen as TabType 
    : 'home';

  return (
    <ErrorBoundary>
      <div 
        className={`flex flex-col h-screen bg-background max-w-md mx-auto relative ${
          reducedMotion ? 'motion-reduced' : ''
        }`}
      >
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        {!hideBottomNav && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => navigateToScreen(tab)}
          />
        )}

        {/* Modals */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onSuccess={handleExportSuccess}
        />

        <ExportSuccessModal
          isOpen={showExportSuccess}
          onClose={() => setShowExportSuccess(false)}
          format={exportFormat}
        />
      </div>
    </ErrorBoundary>
  );
}