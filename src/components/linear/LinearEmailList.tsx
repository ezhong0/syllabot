'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LinearEmailItem } from './LinearEmailItem';
import { Button } from '@/components/ui/button';
import { SortAsc, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoEmail, StudentProfile } from '@/types';

interface LinearEmailListProps {
  emails: DemoEmail[];
  students: Record<string, StudentProfile>;
  selectedEmailId: string | null;
  aiSortEnabled: boolean;
  onEmailSelect: (id: string) => void;
  onToggleAISort: () => void;
}

export function LinearEmailList({
  emails,
  students,
  selectedEmailId,
  aiSortEnabled,
  onEmailSelect,
  onToggleAISort
}: LinearEmailListProps) {
  // Sort emails
  const sortedEmails = aiSortEnabled
    ? [...emails].sort((a, b) => {
        const studentA = students[a.studentId];
        const studentB = students[b.studentId];

        // Calculate risk scores
        const getRiskScore = (student: StudentProfile) => {
          if (!student.redFlags.length) return 0;
          return Math.max(...student.redFlags.map(f =>
            f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
          ));
        };

        const riskA = getRiskScore(studentA);
        const riskB = getRiskScore(studentB);

        return riskB - riskA; // Higher risk first
      })
    : [...emails].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Inbox
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {aiSortEnabled ? 'Sorted by AI risk score' : 'Sorted chronologically'}
          </p>
        </div>

        {/* AI Sort Toggle */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleAISort}
            variant={aiSortEnabled ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "text-xs font-medium transition-all",
              aiSortEnabled
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                : "border-gray-300 hover:bg-gray-100"
            )}
          >
            {aiSortEnabled ? (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                AI Risk Sort ON
              </>
            ) : (
              <>
                <SortAsc className="h-3.5 w-3.5 mr-1.5" />
                Chronological
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Email count */}
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/30">
        {emails.length} {emails.length === 1 ? 'email' : 'emails'}
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {sortedEmails.map((email) => {
            const student = students[email.studentId];
            if (!student) return null;

            return (
              <LinearEmailItem
                key={email.id}
                email={email}
                student={student}
                isSelected={selectedEmailId === email.id}
                aiSortEnabled={aiSortEnabled}
                onClick={() => onEmailSelect(email.id)}
              />
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {emails.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No emails</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your inbox is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
