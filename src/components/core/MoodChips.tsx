import React, { useState } from 'react';

type MoodValue = 'good' | 'okay' | 'unwell';

interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string;
}

const moodOptions: MoodOption[] = [
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'unwell', emoji: '😕', label: 'Unwell' }
];

interface MoodChipsProps {
  value?: MoodValue;
  onChange?: (mood: MoodValue) => void;
  disabled?: boolean;
  className?: string;
}

export function MoodChips({ value, onChange, disabled = false, className }: MoodChipsProps) {
  const [selectedMood, setSelectedMood] = useState<MoodValue | undefined>(value);

  const handleMoodSelect = (mood: MoodValue) => {
    if (disabled) return;
    
    const newValue = selectedMood === mood ? undefined : mood;
    setSelectedMood(newValue);
    onChange?.(mood);
  };

  return (
    <div className={`${className || ''}`}>
      <div className="mb-2">
        <span className="text-caption text-lo">How are you feeling?</span>
      </div>
      
      <div 
        className="flex gap-2"
        role="radiogroup"
        aria-label="How are you feeling?"
      >
        {moodOptions.map((mood) => {
          const isSelected = selectedMood === mood.value;
          
          return (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              disabled={disabled}
              role="radio"
              aria-checked={isSelected}
              aria-label={mood.label}
              className={`
                flex-1 flex items-center justify-center gap-1.5 rounded-full 
                text-caption font-medium transition-all duration-200 
                focus-ring
                ${isSelected 
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/25' 
                  : disabled
                  ? 'border border-border text-muted-foreground cursor-not-allowed opacity-60'
                  : 'border border-primary-600 text-primary-600 hover:bg-primary-600/5 active:scale-95'
                }
              `}
              style={{
                height: '44px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              <span className="text-base leading-none flex-shrink-0">{mood.emoji}</span>
              <span className="truncate text-center">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}