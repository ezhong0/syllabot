'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoEmail, StudentProfile } from '@/types';

interface LinearEmailItemProps {
  email: DemoEmail;
  student: StudentProfile;
  isSelected: boolean;
  aiSortEnabled: boolean;
  onClick: () => void;
}

export function LinearEmailItem({
  email,
  student,
  isSelected,
  aiSortEnabled,
  onClick
}: LinearEmailItemProps) {
  // Calculate risk score
  const riskScore = student.redFlags.length > 0
    ? Math.max(...student.redFlags.map(f =>
        f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
      ))
    : 1;

  // Get risk level
  const getRiskLevel = () => {
    if (riskScore >= 7) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();

  // Risk badge configuration
  const riskConfig = {
    high: {
      icon: AlertCircle,
      label: `High (${riskScore}/10)`,
      color: 'bg-red-50 text-red-700 border-red-200',
      bgColor: 'bg-red-50/50',
      borderColor: 'border-l-red-500'
    },
    medium: {
      icon: AlertTriangle,
      label: `Medium (${riskScore}/10)`,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-l-amber-500'
    },
    low: {
      icon: CheckCircle,
      label: `Low (${riskScore}/10)`,
      color: 'bg-green-50 text-green-700 border-green-200',
      bgColor: 'bg-green-50/50',
      borderColor: 'border-l-green-500'
    }
  };

  const config = riskConfig[riskLevel];
  const RiskIcon = config.icon;

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get outcome stakes
  const outcomes = student.aiInsight.projectedOutcomes;

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ scale: 1.002 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-gray-200 transition-colors relative group",
        isSelected
          ? `bg-purple-50/50 border-l-4 ${config.borderColor} pl-3`
          : aiSortEnabled && riskLevel !== 'low'
          ? `${config.bgColor} border-l-2 ${config.borderColor} pl-3.5 hover:bg-opacity-70`
          : "hover:bg-gray-50",
        !isSelected && "border-l-4 border-transparent"
      )}
    >
      {/* Main content */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        {/* Left: Student name + badge */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Student avatar */}
          <img
            src={student.photoUrl}
            alt={student.name}
            className="h-8 w-8 rounded-full flex-shrink-0"
          />

          {/* Name */}
          <span className={cn(
            "font-semibold text-sm truncate",
            isSelected ? "text-purple-900" : "text-gray-900"
          )}>
            {student.name}
          </span>

          {/* Risk badge (AI mode only) */}
          {aiSortEnabled && (
            <Badge className={cn("text-xs px-2 py-0.5 border flex items-center gap-1", config.color)}>
              <RiskIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          )}

          {/* Translation badge for Miguel */}
          {student.id === 'miguel-rodriguez' && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              ES
            </Badge>
          )}
        </div>

        {/* Right: Timestamp */}
        <span className="text-xs text-gray-500 flex-shrink-0">
          {formatTime(email.timestamp)}
        </span>
      </div>

      {/* Subject */}
      <div className={cn(
        "text-sm mb-1 truncate",
        isSelected ? "text-purple-800 font-medium" : "text-gray-700 font-medium"
      )}>
        {email.subject}
      </div>

      {/* Preview */}
      <div className="text-sm text-gray-600 line-clamp-2 mb-2">
        {email.body}
      </div>

      {/* Outcome stakes (AI mode only) */}
      {aiSortEnabled && outcomes && riskLevel !== 'low' && (
        <div className="flex items-center gap-4 text-xs mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Without intervention:</span>
            <span className="font-semibold text-red-600">
              {outcomes.withoutIntervention.probability}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">With intervention:</span>
            <span className="font-semibold text-green-600">
              {outcomes.withIntervention.probability}%
            </span>
          </div>
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute right-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Can add action buttons here later */}
      </div>
    </motion.button>
  );
}
