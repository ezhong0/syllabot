'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingDown, TrendingUp, AlertCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EngagementTimeline } from '@/components/EngagementTimeline';
import { StudentHistory } from '@/components/StudentHistory';
import { ConfidenceBreakdown } from '@/components/ConfidenceBreakdown';
import { cn } from '@/lib/utils';
import type { DemoEmail, StudentProfile } from '@/types';

interface LinearDetailPanelProps {
  email: DemoEmail | null;
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateResponse: () => void;
  isGenerating?: boolean;
}

export function LinearDetailPanel({
  email,
  student,
  isOpen,
  onClose,
  onGenerateResponse,
  isGenerating = false
}: LinearDetailPanelProps) {
  if (!email || !student) return null;

  // Calculate risk score (prioritize live analysis, then AI insights, then red flags)
  const getRiskScore = () => {
    // Check if email has live analysis
    const liveEmail = email as any;
    if (liveEmail.liveAnalysis?.riskScore) {
      return liveEmail.liveAnalysis.riskScore;
    }

    // Use student's AI insight confidence if available (from dynamic updates)
    if (student.aiInsight?.confidence) {
      return Math.round(student.aiInsight.confidence / 10);
    }

    // Fall back to red flags calculation
    if (!student.redFlags || student.redFlags.length === 0) return 1;

    return Math.max(...student.redFlags.map(f =>
      f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
    ));
  };

  const riskScore = getRiskScore();

  const getRiskLevel = () => {
    if (riskScore >= 7) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();

  const riskConfig = {
    high: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    low: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
  };

  const config = riskConfig[riskLevel];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-start justify-between bg-gray-50/50 dark:bg-gray-950/50">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="h-12 w-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {student.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Grade {student.grade} • {student.currentGrade}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Risk Score Card */}
              <div className={cn(
                "rounded-lg border p-4",
                config.bg,
                config.border
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={cn("h-5 w-5", config.color)} />
                    <span className={cn("text-sm font-semibold uppercase tracking-wider", config.color)}>
                      {riskLevel} Risk
                    </span>
                  </div>
                  <Badge className={cn("text-base font-bold px-3 py-1", config.bg, config.color, config.border, "border")}>
                    {riskScore}/10
                  </Badge>
                </div>
                <div className={cn("text-sm font-medium", config.color)}>
                  Pattern: {student.aiInsight.pattern}
                </div>
              </div>

              {/* Email Body */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Email</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {email.subject}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {email.body}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{email.wordCount} words</span>
                    <span>•</span>
                    <span className="capitalize">{email.sentiment}</span>
                    <span>•</span>
                    <span>{new Date(email.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Outcome Stakes (if available) */}
              {student.aiInsight.projectedOutcomes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Impact Projection
                  </h3>
                  <div className="space-y-2">
                    {/* Without intervention */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-red-900 uppercase tracking-wider">
                          Without Intervention
                        </span>
                        <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                          {student.aiInsight.projectedOutcomes.withoutIntervention.probability}%
                        </Badge>
                      </div>
                      <p className="text-sm text-red-800">
                        {student.aiInsight.projectedOutcomes.withoutIntervention.outcome}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Timeframe: {student.aiInsight.projectedOutcomes.withoutIntervention.timeframe}
                      </p>
                    </div>

                    {/* With intervention */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-green-900 uppercase tracking-wider">
                          With Intervention
                        </span>
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                          {student.aiInsight.projectedOutcomes.withIntervention.probability}%
                        </Badge>
                      </div>
                      <p className="text-sm text-green-800">
                        {student.aiInsight.projectedOutcomes.withIntervention.outcome}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Timeframe: {student.aiInsight.projectedOutcomes.withIntervention.timeframe}
                      </p>
                    </div>

                    {/* Window */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 text-purple-700" />
                        <span className="font-semibold text-purple-900">Window:</span>
                        <span className="text-purple-700">
                          {student.aiInsight.projectedOutcomes.windowOfOpportunity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline - Always Visible */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Engagement Timeline</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <EngagementTimeline student={student} />
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={onGenerateResponse}
                    disabled={isGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating Response...' : 'Generate AI Response'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {/* Handle contact parents */}}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Contact Parents
                  </Button>
                </div>
              </div>

              {/* Collapsible Sections */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-gray-100 list-none flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <span>Red Flags ({student.redFlags.length})</span>
                  <span className="text-gray-400 dark:text-gray-500 group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div className="mt-2 space-y-2">
                  {student.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border text-sm",
                        flag.severity === 'high'
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : flag.severity === 'medium'
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{flag.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {flag.deviation}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{flag.context}</p>
                    </div>
                  ))}
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-gray-100 list-none flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <span>Confidence Breakdown</span>
                  <span className="text-gray-400 dark:text-gray-500 group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div className="mt-2">
                  <ConfidenceBreakdown student={student} />
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-gray-100 list-none flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <span>Full History ({student.interactions.length} events)</span>
                  <span className="text-gray-400 dark:text-gray-500 group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div className="mt-2">
                  <StudentHistory student={student} />
                </div>
              </details>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
