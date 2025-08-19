import React from 'react';
import { AlertTriangle, Wifi, RefreshCw, Upload, Brain } from 'lucide-react';
import { Button } from './core/Button';

interface ErrorStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'error' | 'warning' | 'offline';
  className?: string;
}

function ErrorState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  variant = 'error',
  className 
}: ErrorStateProps) {
  const bgColor = {
    error: 'bg-danger/10',
    warning: 'bg-warning/10',
    offline: 'bg-muted/20'
  }[variant];

  const iconColor = {
    error: 'text-danger',
    warning: 'text-warning',
    offline: 'text-muted-foreground'
  }[variant];

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-4`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <h3 className="text-h3 font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-body text-muted-foreground mb-6 max-w-sm">{description}</p>
      <Button onClick={onAction} variant={variant === 'error' ? 'secondary' : 'primary'}>
        <RefreshCw className="w-4 h-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}

export function OfflineState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ErrorState
        icon={<Wifi className="w-8 h-8" />}
        title="You're offline"
        description="Check your internet connection and try again. Some features may not be available offline."
        actionLabel="Try Again"
        onAction={onRetry}
        variant="offline"
      />
    </div>
  );
}

export function UploadFailedState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ErrorState
        icon={<Upload className="w-8 h-8" />}
        title="Upload Failed"
        description="There was an error uploading your file. Please check your connection and try again."
        actionLabel="Retry Upload"
        onAction={onRetry}
        variant="error"
      />
    </div>
  );
}

export function AnalysisUnavailableState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ErrorState
        icon={<Brain className="w-8 h-8" />}
        title="Analysis Unavailable"
        description="AI analysis is temporarily unavailable. Your file has been saved and you can try analysis again later."
        actionLabel="Try Analysis Again"
        onAction={onRetry}
        variant="warning"
      />
    </div>
  );
}

export function GenericErrorState({ 
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ErrorState
        icon={<AlertTriangle className="w-8 h-8" />}
        title={title}
        description={description}
        actionLabel="Try Again"
        onAction={onRetry}
        variant="error"
      />
    </div>
  );
}

// Network status hook for detecting online/offline state
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <GenericErrorState
            title="Application Error"
            description="The application encountered an unexpected error. Please refresh the page to continue."
            onRetry={() => window.location.reload()}
          />
        )
      );
    }

    return this.props.children;
  }
}