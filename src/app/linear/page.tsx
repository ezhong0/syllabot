'use client';

import { useState } from 'react';
import { LinearHeader } from '@/components/linear/LinearHeader';
import { LinearSidebar } from '@/components/linear/LinearSidebar';
import { LinearEmailList } from '@/components/linear/LinearEmailList';
import { LinearDetailPanel } from '@/components/linear/LinearDetailPanel';
import { LinearComposeModal } from '@/components/linear/LinearComposeModal';
import { EmailDetailView } from '@/components/EmailDetailView';
import { DEMO_INBOX, STUDENTS } from '@/data/demo-emails';
import type { DemoEmail } from '@/types';

type View = 'inbox' | 'high-risk' | 'medium-risk' | 'low-risk' | 'starred' | 'sent' | 'drafts' | 'settings';

export default function LinearDashboard() {
  const [activeView, setActiveView] = useState<View>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(DEMO_INBOX[1]?.id || null);
  const [aiSortEnabled, setAiSortEnabled] = useState(true); // AI sort ON by default
  const [searchQuery, setSearchQuery] = useState('');
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [detailModalEmail, setDetailModalEmail] = useState<DemoEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allEmails, setAllEmails] = useState<DemoEmail[]>(DEMO_INBOX);

  // Handle sending new email (from compose)
  const handleSendEmail = (newEmail: DemoEmail) => {
    setAllEmails([newEmail, ...allEmails]);
    setSelectedEmailId(newEmail.id);
    setComposeModalOpen(false);
  };

  // Calculate risk scores for filtering
  const getRiskScore = (emailId: string) => {
    const email = allEmails.find(e => e.id === emailId);
    if (!email) return 0;

    const student = STUDENTS[email.studentId];
    if (!student || !student.redFlags.length) return 0;

    return Math.max(...student.redFlags.map(f =>
      f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
    ));
  };

  // Filter emails based on active view
  const getFilteredEmails = () => {
    let filtered = [...allEmails];

    switch (activeView) {
      case 'high-risk':
        filtered = filtered.filter(email => getRiskScore(email.id) >= 7);
        break;
      case 'medium-risk':
        filtered = filtered.filter(email => getRiskScore(email.id) >= 4 && getRiskScore(email.id) < 7);
        break;
      case 'low-risk':
        filtered = filtered.filter(email => getRiskScore(email.id) < 4);
        break;
      case 'starred':
        filtered = []; // Placeholder - implement starred functionality
        break;
      case 'sent':
        filtered = []; // Placeholder - implement sent functionality
        break;
      case 'drafts':
        filtered = []; // Placeholder - implement drafts functionality
        break;
      default:
        // inbox - show all
        break;
    }

    // Apply search filter if query exists
    if (searchQuery) {
      filtered = filtered.filter(email => {
        const student = STUDENTS[email.studentId];
        return (
          email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return filtered;
  };

  const filteredEmails = getFilteredEmails();

  // Calculate counts for sidebar
  const counts = {
    inbox: allEmails.length,
    highRisk: allEmails.filter(e => getRiskScore(e.id) >= 7).length,
    mediumRisk: allEmails.filter(e => getRiskScore(e.id) >= 4 && getRiskScore(e.id) < 7).length,
    lowRisk: allEmails.filter(e => getRiskScore(e.id) < 4).length,
    starred: 0, // Placeholder
  };

  // Get selected email and student
  const selectedEmail = selectedEmailId ? (allEmails.find(e => e.id === selectedEmailId) || null) : null;
  const selectedStudent = selectedEmail ? STUDENTS[selectedEmail.studentId] : null;

  // Handle email selection
  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  // Handle AI sort toggle
  const handleToggleAISort = () => {
    setAiSortEnabled(!aiSortEnabled);
  };

  // Handle generate response
  const handleGenerateResponse = () => {
    if (!selectedEmail) return;
    setIsGenerating(true);
    setDetailModalEmail(selectedEmail);
    // The EmailDetailView modal will handle the actual generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  // Handle compose
  const handleCompose = () => {
    setComposeModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <LinearHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onComposeClick={handleCompose}
      />

      {/* Main content - 3 column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <LinearSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          counts={counts}
        />

        {/* Email list */}
        <div className="flex-1 border-r border-gray-200 overflow-hidden">
          <LinearEmailList
            emails={filteredEmails}
            students={STUDENTS}
            selectedEmailId={selectedEmailId}
            aiSortEnabled={aiSortEnabled}
            onEmailSelect={handleEmailSelect}
            onToggleAISort={handleToggleAISort}
          />
        </div>

        {/* Detail panel */}
        <LinearDetailPanel
          email={selectedEmail}
          student={selectedStudent}
          isOpen={selectedEmailId !== null}
          onClose={() => setSelectedEmailId(null)}
          onGenerateResponse={handleGenerateResponse}
          isGenerating={isGenerating}
        />
      </div>

      {/* Email detail modal (for expanded view with generate response) */}
      {detailModalEmail && (
        <EmailDetailView
          email={detailModalEmail}
          student={STUDENTS[detailModalEmail.studentId]}
          onClose={() => setDetailModalEmail(null)}
        />
      )}

      {/* Compose modal */}
      <LinearComposeModal
        isOpen={composeModalOpen}
        onClose={() => setComposeModalOpen(false)}
        onSend={handleSendEmail}
        students={STUDENTS}
      />
    </div>
  );
}
