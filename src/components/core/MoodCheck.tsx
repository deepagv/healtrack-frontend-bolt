import React, { useState } from 'react';
import { cn } from '../ui/utils';

interface MoodOption {
  emoji: string;
  label: string;
  value: 'good' | 'okay' | 'not-great';
}

const moodOptions: MoodOption[] = [
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😣', label: 'Not great', value: 'not-great' }
];

interface MoodCheckProps {
  value?: string;
  onChange?: (mood: string) => void;
  className?: string;
}

export function MoodCheck({ value, onChange, className }: MoodCheckProps) {
  const [selectedMood, setSelectedMood] = useState<string | undefined>(value);
  
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    onChange?.(mood);
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-caption text-muted-foreground mr-2">How are you feeling?</span>
      
      {moodOptions.map((mood) => (
        <button
          key={mood.value}
          onClick={() => handleMoodSelect(mood.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption transition-all duration-200',
            'min-h-[44px] min-w-[44px] focus-ring',
            selectedMood === mood.value
              ? 'bg-primary-600/10 text-primary-600 border border-primary-600/20'
              : 'bg-surface-subtle text-muted-foreground hover:bg-muted/80'
          )}
          aria-label={`Feeling ${mood.label}`}
          aria-pressed={selectedMood === mood.value}
        >
          <span className="text-base">{mood.emoji}</span>
          <span className="font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}