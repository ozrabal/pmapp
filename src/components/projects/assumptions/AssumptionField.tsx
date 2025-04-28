import React from 'react';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { FeedbackItem } from './FeedbackItem';
import type { AssumptionFieldProps } from './types';

/**
 * Component for editing individual assumption fields
 */
export function AssumptionField({
  id,
  label,
  value,
  onChange,
  suggestions,
  feedback,
  fieldRef,
  maxLength = 500,
  isLoading = false,
  className
}: AssumptionFieldProps) {
  const characterCount = value?.length || 0;
  const isAlmostFull = characterCount > maxLength * 0.8;
  const isFull = characterCount >= maxLength;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <Label 
          htmlFor={String(id)}
          className="text-sm font-medium"
        >
          {label}
        </Label>
        <span 
          className={`text-xs ${
            isFull ? 'text-destructive' : 
            isAlmostFull ? 'text-amber-500 dark:text-amber-400' : 
            'text-muted-foreground'
          }`}
        >
          {characterCount}/{maxLength}
        </span>
      </div>
      
      <Textarea
        id={String(id)}
        ref={fieldRef}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}...`}
        disabled={isLoading}
        maxLength={maxLength}
        className="min-h-24 resize-y"
        aria-describedby={`${id}-description`}
      />
      
      {/* Display validation feedback specific to this field */}
      {feedback && feedback.length > 0 && (
        <div className="mt-1 space-y-1">
          {feedback.map((item, index) => (
            <FeedbackItem 
              key={`${id}-feedback-${index}`}
              feedback={item}
              className="py-1"
            />
          ))}
        </div>
      )}
      
      {suggestions && suggestions.length > 0 && (
        <div className="mt-1 text-sm text-muted-foreground" id={`${id}-description`}>
          <span className="font-medium text-xs">AI suggested improvements available</span>
        </div>
      )}
    </div>
  );
}