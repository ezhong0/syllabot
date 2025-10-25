'use client';

import { useState, useMemo, useEffect } from 'react';
import { demoEmails, studentProfiles } from '@/data/demo-emails';
import { DemoEmail } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { EmailDetailView } from '../EmailDetailView';

type SortOption = 'risk' | 'date' | 'student';
type FilterOption = 'all' | 'read' | 'unread' | 'high-risk' | 'medium-risk' | 'low-risk';

interface InboxTabProps {
  dynamicEmails?: DemoEmail[];
}

export default function InboxTab({ dynamicEmails = [] }: InboxTabProps) {
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('risk');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
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

  const filteredAndSortedEmails = useMemo(() => {
    let emailsList = [...emails];

    // Apply search filter
    if (searchQuery) {
      emailsList = emailsList.filter((email) => {
        const student = studentProfiles.find((s) => s.id === email.studentId);
        const searchLower = searchQuery.toLowerCase();
        return (
          email.subject.toLowerCase().includes(searchLower) ||
          email.body.toLowerCase().includes(searchLower) ||
          student?.name.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply filters
    if (filterBy !== 'all') {
      emailsList = emailsList.filter((email) => {
        const riskScore = getRiskScore(email.studentId);

        switch (filterBy) {
          case 'read':
            return email.read;
          case 'unread':
            return !email.read;
          case 'high-risk':
            return riskScore >= 7;
          case 'medium-risk':
            return riskScore >= 4 && riskScore < 7;
          case 'low-risk':
            return riskScore < 4;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    emailsList.sort((a, b) => {
      const studentA = studentProfiles.find((s) => s.id === a.studentId);
      const studentB = studentProfiles.find((s) => s.id === b.studentId);

      switch (sortBy) {
        case 'risk': {
          const riskA = getRiskScore(a.studentId);
          const riskB = getRiskScore(b.studentId);
          return riskB - riskA; // Highest risk first
        }
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'student':
          return (studentA?.name || '').localeCompare(studentB?.name || '');
        default:
          return 0;
      }
    });

    return emailsList;
  }, [searchQuery, sortBy, filterBy, emails]);

  const getRiskBadge = (studentId: string) => {
    const riskScore = getRiskScore(studentId);

    if (riskScore >= 7) {
      return <Badge variant="destructive">🔴 High {riskScore}/10</Badge>;
    } else if (riskScore >= 4) {
      return <Badge className="bg-yellow-500 text-white">🟡 Medium {riskScore}/10</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">🟢 Low {riskScore}/10</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">AI Risk Score</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="student">Student Name</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="medium-risk">Medium Risk</SelectItem>
                <SelectItem value="low-risk">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {filterBy === 'all' ? 'All Emails' : filterBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({filteredAndSortedEmails.length})
            </h2>
          </div>

          <div className="space-y-2">
            {filteredAndSortedEmails.map((email) => {
              const student = studentProfiles.find((s) => s.id === email.studentId);
              return (
                <Card
                  key={email.id}
                  className={`p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 ${
                    !email.read
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600 dark:border-l-purple-500'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={email.read}
                      onChange={(e) => e.stopPropagation()}
                      className="w-4 h-4"
                    />
                    <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/30 flex items-center justify-center text-sm font-medium text-purple-900 dark:text-purple-300 flex-shrink-0">
                      {student?.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${!email.read ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {student?.name}
                        </span>
                        {getRiskBadge(email.studentId)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm text-gray-900 dark:text-gray-100 ${!email.read ? 'font-semibold' : ''}`}>{email.subject}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">- {email.body.substring(0, 80)}...</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{email.timestamp}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
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
