/**
 * Confidence Indicator Component
 * Generated with Random Labs Slate
 *
 * Displays confidence percentage with visual progress bar
 */

'use client';

import React from 'react';

export interface ConfidenceIndicatorProps {
  confidence: number;
  label?: string;
}

/**
 * Visual confidence indicator with color-coded progress bar
 * Green: >80%, Yellow: 60-80%, Red: <60%
 */
export function ConfidenceIndicator({
  confidence,
  label
}: ConfidenceIndicatorProps) {
  // Normalize confidence to 0-100 range
  const normalizedConfidence = Math.max(0, Math.min(100, confidence));

  // Determine color based on confidence level
  const getColor = () => {
    if (normalizedConfidence >= 80) {
      return {
        bg: 'bg-green-500',
        text: 'text-green-700',
        bgLight: 'bg-green-50',
        border: 'border-green-200'
      };
    }
    if (normalizedConfidence >= 60) {
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-700',
        bgLight: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
    }
    return {
      bg: 'bg-red-500',
      text: 'text-red-700',
      bgLight: 'bg-red-50',
      border: 'border-red-200'
    };
  };

  const colors = getColor();

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bgLight} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {label || 'Confidence'}
        </span>
        <span className={`text-lg font-bold ${colors.text}`}>
          {normalizedConfidence}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colors.bg} h-3 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${normalizedConfidence}%` }}
        />
      </div>

      {/* Optional confidence level label */}
      <div className="mt-2 text-xs text-gray-600">
        {normalizedConfidence >= 80 && 'High confidence'}
        {normalizedConfidence >= 60 && normalizedConfidence < 80 && 'Moderate confidence'}
        {normalizedConfidence < 60 && 'Low confidence'}
      </div>
    </div>
  );
}

/**
 * Compact version of confidence indicator (just the bar)
 */
export function CompactConfidenceIndicator({ confidence }: { confidence: number }) {
  const normalizedConfidence = Math.max(0, Math.min(100, confidence));

  const getColor = () => {
    if (normalizedConfidence >= 80) return 'bg-green-500';
    if (normalizedConfidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`${getColor()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${normalizedConfidence}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-10 text-right">
        {normalizedConfidence}%
      </span>
    </div>
  );
}
