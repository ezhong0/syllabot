'use client';

import { useState, useMemo, useEffect } from 'react';
import { demoEmails, studentProfiles } from '@/data/demo-emails';
import { DemoEmail } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { EmailDetailView } from '../EmailDetailView';

type RiskLevel = 'high' | 'medium' | 'low';

interface UnreadTabProps {
  dynamicEmails?: DemoEmail[];
}

export default function UnreadTab({ dynamicEmails = [] }: UnreadTabProps) {
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<RiskLevel, boolean>>({
    high: true,
    medium: true,
    low: true,
  });
  // State management for emails (combines demo + dynamic + responses)
  const [emails, setEmails] = useState<DemoEmail[]>([...dynamicEmails, ...demoEmails]);

  // Update emails when dynamicEmails changes (new email composed)
  useEffect(() => {
    setEmails((prev) => {
      // Keep locally-added responses
      const localResponses = prev.filter(e => e.id.startsWith('response-'));
      // Merge: dynamic emails first, then responses, then demo emails
      return [...dynamicEmails, ...localResponses, ...demoEmails];
    });
  }, [dynamicEmails]);

  // Helper function to calculate risk score based on red flags
  const getRiskScore = (studentId: string) => {
    const student = studentProfiles.find((s) => s.id === studentId);
    if (!student || !student.redFlags) return 0;

    const highFlags = student.redFlags.filter(f => f.severity === 'high').length;
    const mediumFlags = student.redFlags.filter(f => f.severity === 'medium').length;
    const lowFlags = student.redFlags.filter(f => f.severity === 'low').length;

    if (highFlags >= 2) return Math.min(8 + mediumFlags, 10);
    if (highFlags >= 1) return 6 + mediumFlags;
    if (mediumFlags >= 2) return 5 + Math.min(lowFlags, 1);
    if (mediumFlags >= 1) return 4 + lowFlags;
    if (lowFlags >= 2) return 3;
    if (lowFlags >= 1) return 2;
    return 1;
  };

  // Handle sending response (creates teacher's reply email)
  const handleSendResponse = (studentId: string, responseText: string) => {
    const student = studentProfiles.find((s) => s.id === studentId);
    if (!student) return;

    // Create a new email representing the teacher's response
    const responseEmail: DemoEmail = {
      id: `response-${Date.now()}`,
      from: 'Ms. Johnson <johnson@school.edu>',
      studentId: studentId,
      subject: `Re: ${selectedEmail?.subject || 'Your email'}`,
      body: responseText,
      timestamp: new Date().toISOString(),
      read: true, // Teacher's sent emails are marked as read
      wordCount: responseText.split(/\s+/).filter(w => w.length > 0).length,
      sentiment: 'positive',
    };

    // Add the response to the email list
    setEmails((prev) => [responseEmail, ...prev]);

    // Mark the original email as read (optional but good UX)
    if (selectedEmail) {
      setEmails((prev) =>
        prev.map((e) => (e.id === selectedEmail.id ? { ...e, read: true } : e))
      );
    }

    // Close the detail view
    setSelectedEmail(null);
  };

  // Filter only unread emails
  const unreadEmails = useMemo(() => {
    return emails.filter((email) => !email.read);
  }, [emails]);

  // Group by risk level
  const emailsByRisk = useMemo(() => {
    const groups: Record<RiskLevel, DemoEmail[]> = {
      high: [],
      medium: [],
      low: [],
    };

    unreadEmails.forEach((email) => {
      const riskScore = getRiskScore(email.studentId);

      if (riskScore >= 7) {
        groups.high.push(email);
      } else if (riskScore >= 4) {
        groups.medium.push(email);
      } else {
        groups.low.push(email);
      }
    });

    return groups;
  }, [unreadEmails]);

  const toggleSection = (level: RiskLevel) => {
    setExpandedSections((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return 'High Risk (7-10)';
      case 'medium':
        return 'Medium Risk (4-6)';
      case 'low':
        return 'Low Risk (1-3)';
    }
  };

  const renderEmailItem = (email: DemoEmail) => {
    const student = studentProfiles.find((s) => s.id === email.studentId);
    const riskScore = getRiskScore(email.studentId);
    const analysis = student?.aiInsight;

    return (
      <Card
        key={email.id}
        className="p-4 mb-2 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500 dark:border-l-purple-600 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        onClick={() => setSelectedEmail(email)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/30 flex items-center justify-center text-sm font-medium text-purple-900 dark:text-purple-300">
                {student?.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{student?.name}</span>
              <Badge variant="destructive" className="ml-2">
                {getRiskIcon('high')} {riskScore}/10
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">{email.timestamp}</span>
            </div>
            <h3 className="font-medium mb-1 text-gray-900 dark:text-gray-100">{email.subject}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{email.body}</p>
            {analysis && analysis.projectedOutcomes && analysis.projectedOutcomes.withoutIntervention && analysis.projectedOutcomes.withIntervention && (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  ⚠️ Without intervention: <span className="font-semibold text-red-600 dark:text-red-500">{analysis.projectedOutcomes.withoutIntervention.probability}%</span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  With intervention: <span className="font-semibold text-green-600 dark:text-green-500">{analysis.projectedOutcomes.withIntervention.probability}%</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderSection = (level: RiskLevel) => {
    const emails = emailsByRisk[level];
    const isExpanded = expandedSections[level];

    return (
      <div key={level} className="mb-6">
        <button
          onClick={() => toggleSection(level)}
          className={`w-full flex items-center justify-between p-3 rounded-lg border ${getRiskColor(level)} font-medium mb-2`}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>
              {getRiskIcon(level)} {getRiskLabel(level)}
            </span>
          </div>
          <Badge variant="secondary">{emails.length}</Badge>
        </button>

        {isExpanded && (
          <div className="pl-4">
            {emails.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-4">No {level} risk emails</p>
            ) : (
              emails.map(renderEmailItem)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Unread ({unreadEmails.length})</h1>
          <p className="text-gray-600 dark:text-gray-400">Sorted by AI risk score</p>
        </div>

        {renderSection('high')}
        {renderSection('medium')}
        {renderSection('low')}
      </div>

      {selectedEmail && studentProfiles.find((s) => s.id === selectedEmail.studentId) && (
        <EmailDetailView
          email={selectedEmail}
          student={studentProfiles.find((s) => s.id === selectedEmail.studentId)!}
          onClose={() => setSelectedEmail(null)}
          onSendResponse={handleSendResponse}
        />
      )}
    </div>
  );
}
