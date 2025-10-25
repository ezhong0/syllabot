'use client';

import { useState, useMemo } from 'react';
import { demoEmails, studentProfiles } from '@/data/demo-emails';
import MainTabs from '@/components/MainTabs';
import { LinearHeader } from '@/components/linear/LinearHeader';
import { LinearSidebar } from '@/components/linear/LinearSidebar';
import { Button } from '@/components/ui/button';
import { Menu, X, Send, Sparkles } from 'lucide-react';
import { ComposeEmailModal } from '@/components/ComposeEmailModal';
import type { EmailTemplate } from '@/data/email-templates';
import type { DemoEmail } from '@/types';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dynamicEmails, setDynamicEmails] = useState<DemoEmail[]>([]);

  // Calculate counts (dynamically updates when new emails arrive)
  const counts = useMemo(() => {
    // Combine dynamic and demo emails
    const allEmails = [...dynamicEmails, ...demoEmails];
    const unreadEmails = allEmails.filter((e) => !e.read);

    const getRiskScore = (studentId: string) => {
      const student = studentProfiles.find((s) => s.id === studentId);
      if (!student || !student.redFlags) return 0;

      const highFlags = student.redFlags.filter(f => f.severity === 'high').length;
      const mediumFlags = student.redFlags.filter(f => f.severity === 'medium').length;
      const lowFlags = student.redFlags.filter(f => f.severity === 'low').length;

      // Any high severity flags = high risk (7-10)
      if (highFlags >= 2) return Math.min(8 + mediumFlags, 10);
      if (highFlags >= 1) return 6 + mediumFlags;

      // Multiple medium flags or engagement issues = medium risk (4-6)
      if (mediumFlags >= 2) return 5 + Math.min(lowFlags, 1);
      if (mediumFlags >= 1) return 4 + lowFlags;

      // Only low severity = low risk (1-3)
      if (lowFlags >= 2) return 3;
      if (lowFlags >= 1) return 2;

      // No flags = very low risk
      return 1;
    };

    // Get unique students who have sent emails
    const studentsWithEmails = new Set(allEmails.map(e => e.studentId));

    return {
      inbox: allEmails.length,
      unread: unreadEmails.length,
      students: studentsWithEmails.size, // Count unique students with emails
      highRisk: unreadEmails.filter((e) => getRiskScore(e.studentId) >= 7).length,
      mediumRisk: unreadEmails.filter((e) => getRiskScore(e.studentId) >= 4 && getRiskScore(e.studentId) < 7).length,
      lowRisk: unreadEmails.filter((e) => getRiskScore(e.studentId) < 4).length,
      starred: 0,
    };
  }, [dynamicEmails]);

  // Handle sending test email as if from a student
  const handleSendEmail = async (emailData: {
    template: EmailTemplate;
    subject: string;
    body: string;
  }) => {
    setIsAnalyzing(true);
    const student = studentProfiles.find(s => s.id === emailData.template.studentId);

    if (!student) {
      alert('Student not found');
      setIsAnalyzing(false);
      return;
    }

    try {
      // Call analyze-email API
      const analysisRes = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: {
            subject: emailData.subject,
            body: emailData.body,
          },
          student,
        }),
      });

      if (!analysisRes.ok) {
        throw new Error('Analysis failed');
      }

      const analysis = await analysisRes.json();

      // Create new email object
      const newEmail: DemoEmail = {
        id: `live-${Date.now()}`,
        studentId: emailData.template.studentId,
        from: `${student.name} <${student.email}>`,
        subject: emailData.subject,
        body: emailData.body,
        timestamp: new Date().toISOString(),
        sentiment: analysis.sentiment as any,
        wordCount: emailData.body.split(/\s+/).length,
        read: false,
        starred: false,
        // Store the live analysis
        aiAnalysis: {
          riskScore: analysis.riskScore,
          sentiment: analysis.sentiment,
          pattern: analysis.communicationPattern,
          redFlags: analysis.redFlags || [],
        },
      };

      // Add to dynamic emails
      setDynamicEmails((prev) => [newEmail, ...prev]);
      setShowCompose(false);

    } catch (error) {
      console.error('Failed to analyze email:', error);
      alert('Failed to analyze email. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert student profiles to the format expected by ComposeEmailModal
  const studentsMap = studentProfiles.reduce((acc, student) => {
    acc[student.id] = {
      ...student,
      baseline: student.baseline || {
        attendanceRate: 0.95,
        avgGrade: 85,
        avgWordCount: 30,
        participationLevel: 7,
        typicalBehavior: 'Normal student'
      }
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SyllaBot</h1>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
              AI-Powered
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowCompose(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            disabled={isAnalyzing}
          >
            <Send className="h-4 w-4 mr-2" />
            Compose Test Email
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Ms. Johnson - Stack Auth
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
            MJ
          </div>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}>
          <LinearSidebar
            activeView="inbox"
            onViewChange={() => {}}
            counts={counts}
          />
        </div>

        {/* Main tabs content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MainTabs
            unreadCount={counts.unread}
            totalCount={counts.inbox}
            studentCount={counts.students}
            dynamicEmails={dynamicEmails}
          />
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <ComposeEmailModal
          onClose={() => setShowCompose(false)}
          onSendEmail={handleSendEmail}
          students={studentsMap}
        />
      )}

      {/* Real-Time Analysis Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Analyzing Email with Real-Time AI
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Analyzing...
              </p>

              {/* Tool activation animation */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    🧠 Claude analyzing patterns & sentiment...
                  </span>
                </div>
                <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.2s' }}>
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    🎯 Slate calculating risk score...
                  </span>
                </div>
                <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
                  <div className="h-2 w-2 bg-cyan-600 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    📊 s2.dev logging analysis event...
                  </span>
                </div>
                <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.6s' }}>
                  <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    🌍 Lingo detecting language...
                  </span>
                </div>
                <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.8s' }}>
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    ⚡ Cactus optimizing for mobile...
                  </span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-300 font-medium">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Using real Claude API
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
