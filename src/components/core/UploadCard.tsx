import React, { useState } from 'react';
import { Upload, Zap, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface UploadCardProps {
  onUpload?: () => void;
  onInfoClick?: () => void;
  isAnalyzing?: boolean;
  progress?: number;
  className?: string;
}

export function UploadCard({ 
  onUpload, 
  onInfoClick,
  isAnalyzing = false, 
  progress = 0,
  className 
}: UploadCardProps) {
  const [showProgress, setShowProgress] = useState(false);
  
  const handleUpload = () => {
    setShowProgress(true);
    onUpload?.();
  };

  return (
    <div className={`bg-card rounded-card p-6 shadow-card border border-border relative ${className || ''}`}>
      {/* Top-right info icon with warm accent */}
      <button
        onClick={onInfoClick}
        className="absolute top-4 right-4 w-5 h-5 transition-colors focus-ring rounded"
        style={{
          color: 'var(--color-accent-warm-600)',
          opacity: '0.8'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-accent-warm-500)';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-accent-warm-600)';
          e.currentTarget.style.opacity = '0.8';
        }}
        aria-label="Privacy information"
      >
        <Info className="w-4 h-4" />
      </button>
      
      <div className="pr-6">
        <div className="mb-4">
          <h3 className="text-h3 font-semibold text-foreground">Medical Reports</h3>
          <p className="text-caption text-muted-foreground">Upload for AI analysis</p>
        </div>
        
        {/* Full-width button with warm AI badge */}
        <div className="relative">
          <Button
            onClick={handleUpload}
            disabled={isAnalyzing}
            className="w-full justify-start bg-primary-600 hover:bg-primary-700 text-white relative pr-16"
            style={{ minHeight: '48px' }}
            aria-label="Upload a medical report for AI analysis"
          >
            <Upload className="w-5 h-5 mr-3" />
            {isAnalyzing ? 'Analyzing...' : 'Upload a report'}
            
            {/* AI badge with warm accent background */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-white transition-colors"
                style={{
                  backgroundColor: 'var(--color-accent-warm-600)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-warm-500)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-warm-600)';
                }}
              >
                <Zap className="w-3 h-3" />
                AI
              </div>
            </div>
          </Button>
        </div>
        
        <p className="text-caption text-muted-foreground mt-3">
          PDF/JPG/PNG — secure & private
        </p>
        
        {/* Progress bar placeholder - hidden by default */}
        {(showProgress || isAnalyzing) && (
          <div className="mt-4">
            <Progress 
              value={isAnalyzing ? progress : 0} 
              className="h-1 bg-muted"
            />
          </div>
        )}
      </div>
    </div>
  );
}