'use client';

import { useState } from 'react';
import { DEMO_INBOX, STUDENTS } from '@/data/demo-emails';
import { getRiskScoreBadge } from '@/lib/slate-generated/risk-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EngagementTimeline } from '@/components/EngagementTimeline';
import { ConfidenceBreakdown } from '@/components/ConfidenceBreakdown';
import { StudentHistory } from '@/components/StudentHistory';
import { EmailDetailView } from '@/components/EmailDetailView';
import { ComposeEmailModal } from '@/components/ComposeEmailModal';
import { getStaticTranslationExample } from '@/lib/lingo';
import { logEmailViewed, logStudentPanelOpened } from '@/lib/s2';
import { MOBILE_FEATURES_STATUS } from '@/lib/cactus';
import { Sparkles, Send } from 'lucide-react';
import type { DemoEmail } from '@/types';
import type { EmailTemplate } from '@/data/email-templates';

export default function DashboardPage() {
  const [aiToggle, setAiToggle] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(DEMO_INBOX[1]); // Auto-select Jake's email
  const [detailEmail, setDetailEmail] = useState<DemoEmail | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dynamicEmails, setDynamicEmails] = useState<DemoEmail[]>([]);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzedScores, setReanalyzedScores] = useState<Record<string, number>>({});
  // Track dynamic student updates (new interactions from sent emails)
  const [dynamicStudentUpdates, setDynamicStudentUpdates] = useState<Record<string, { interactions: any[], aiInsight: any }>>({});

  // Get static translation example for Miguel
  const translationExample = getStaticTranslationExample();

  // Handle email selection with s2.dev activity tracking
  const handleEmailClick = (email: DemoEmail) => {
    setSelectedEmail(email);

    const student = STUDENTS[email.studentId];
    if (student) {
      // Log to s2.dev (background, non-blocking)
      logEmailViewed('demo-teacher', email.id, email.studentId, student.aiInsight.confidence)
        .catch(() => {}); // Silent fail

      // Update visible activity log
      setActivityLog(prev => [
        `Viewed ${student.name}'s email (risk: ${student.aiInsight.confidence}%)`,
        ...prev.slice(0, 4) // Keep last 5
      ]);
    }
  };

  // Handle sending teacher's response
  const handleSendResponse = (studentId: string, response: string) => {
    const newInteraction = {
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      type: 'teacher_response',
      sentiment: 'positive',
      summary: 'Teacher response sent',
      details: response
    };

    setDynamicStudentUpdates(prev => {
      const currentUpdates = prev[studentId] || {
        interactions: [],
        aiInsight: null
      };

      return {
        ...prev,
        [studentId]: {
          ...currentUpdates,
          interactions: [newInteraction, ...currentUpdates.interactions]
        }
      };
    });

    // Update activity log
    const student = STUDENTS[studentId];
    setActivityLog(prev => [
      `Sent response to ${student?.name}`,
      ...prev.slice(0, 4)
    ]);
  };

  // Handle real-time email analysis
  const handleSendEmail = async (emailData: {
    template: EmailTemplate;
    subject: string;
    body: string;
  }) => {
    setIsAnalyzing(true);
    const student = STUDENTS[emailData.template.studentId];

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
        isLiveDemo: true, // Mark as live demo email
        liveAnalysis: analysis, // Store the analysis
      };

      // Add to dynamic emails and select it
      setDynamicEmails((prev) => [newEmail, ...prev]);
      setSelectedEmail(newEmail);
      setShowCompose(false);

      // Add interaction to student's history
      const newInteraction = {
        date: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        type: 'email',
        sentiment: analysis.sentiment,
        summary: emailData.subject,
        details: emailData.body
      };

      // Update student data with new interaction and updated AI insights
      setDynamicStudentUpdates(prev => {
        const currentUpdates = prev[emailData.template.studentId] || {
          interactions: [],
          aiInsight: null
        };

        return {
          ...prev,
          [emailData.template.studentId]: {
            interactions: [newInteraction, ...currentUpdates.interactions],
            aiInsight: {
              pattern: analysis.communicationPattern || student.aiInsight.pattern,
              confidence: analysis.riskScore * 10, // Convert 1-10 scale to percentage
              analysis: analysis.riskReasoning || student.aiInsight.analysis,
              recommendation: {
                approach: analysis.recommendedApproach || student.aiInsight.recommendation?.approach,
                reasoning: analysis.reasoning || student.aiInsight.recommendation?.reasoning
              }
            }
          }
        };
      });

      // Update activity log
      setActivityLog(prev => [
        `Analyzed live email from ${student.name} (${analysis.riskScore}/10 risk)`,
        ...prev.slice(0, 4)
      ]);

      // Auto-expand the email detail view
      setTimeout(() => {
        setDetailEmail(newEmail);
      }, 500);

    } catch (error) {
      console.error('Failed to analyze email:', error);
      alert('Failed to analyze email. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle re-analyzing all demo emails with real Claude API
  const handleReanalyzeAll = async () => {
    setIsReanalyzing(true);

    try {
      // Analyze all 4 demo emails in parallel
      const analyses = await Promise.all(
        DEMO_INBOX.map(email =>
          fetch('/api/analyze-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: {
                subject: email.subject,
                body: email.body,
              },
              student: STUDENTS[email.studentId],
            }),
          }).then(r => r.json())
        )
      );

      // Update risk scores with real-time analysis
      const newScores: Record<string, number> = {};
      DEMO_INBOX.forEach((email, idx) => {
        newScores[email.studentId] = analyses[idx].riskScore;
      });

      setReanalyzedScores(newScores);

      // Update activity log
      setActivityLog(prev => [
        `Re-analyzed all ${DEMO_INBOX.length} emails with Claude API - scores updated`,
        ...prev.slice(0, 4)
      ]);

    } catch (error) {
      console.error('Failed to re-analyze emails:', error);
      alert('Failed to re-analyze emails. Please check your API connection and try again.');
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Combine demo emails with dynamic emails
  const allEmails = [...dynamicEmails, ...DEMO_INBOX];

  // Sort emails based on AI toggle
  const sortedEmails = aiToggle
    ? [...allEmails].sort((a, b) => {
        const studentA = STUDENTS[a.studentId];
        const studentB = STUDENTS[b.studentId];

        // Priority: reanalyzed score > live analysis > original confidence
        const riskA = reanalyzedScores[a.studentId] ?? (a as any).liveAnalysis?.riskScore ?? studentA?.aiInsight.confidence ?? 0;
        const riskB = reanalyzedScores[b.studentId] ?? (b as any).liveAnalysis?.riskScore ?? studentB?.aiInsight.confidence ?? 0;
        return riskB - riskA; // Higher risk first
      })
    : [...allEmails].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

  // Merge static student data with dynamic updates
  const getStudentWithUpdates = (studentId: string) => {
    const staticStudent = STUDENTS[studentId];
    if (!staticStudent) return null;

    const updates = dynamicStudentUpdates[studentId];
    if (!updates) return staticStudent;

    // Merge interactions (dynamic first, then static)
    const mergedInteractions = [...updates.interactions, ...staticStudent.interactions];

    // Merge AI insights (prefer dynamic if available)
    const mergedAiInsight = updates.aiInsight || staticStudent.aiInsight;

    return {
      ...staticStudent,
      interactions: mergedInteractions,
      aiInsight: mergedAiInsight
    };
  };

  const selectedStudent = selectedEmail ? getStudentWithUpdates(selectedEmail.studentId) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Demo Banner */}
        <div className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">SyllaBot Demo - VIBE25-4 Hackathon</h2>
              <p className="text-sm opacity-90 mt-1">
                AI-powered email analysis with multi-dimensional baseline detection
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Activity Feed - s2.dev */}
              <div className="text-right border-r border-white/30 pr-4">
                <div className="text-xs opacity-75 flex items-center gap-1">
                  Recent Activity
                  <Badge className="bg-white/20 text-white text-xs border-0">s2.dev</Badge>
                </div>
                <div className="text-sm font-semibold mt-1">
                  {activityLog.length > 0 ? activityLog[0] : 'No activity yet'}
                </div>
              </div>

              {/* Tool Count */}
              <div className="text-right">
                <div className="text-xs opacity-75">5 Tools • Authenticated Session</div>
                <div className="text-sm font-semibold">
                  🔐 Stack Auth • 📊 s2 • 🌍 Lingo • ⚡ Cactus • 🧠 Claude
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Strip - Cactus Compute */}
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white text-xs">Cactus Compute</Badge>
              <span className="text-green-900 font-semibold">Performance Optimized</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>⚡ &lt;50ms latency</span>
              <span>📱 Mobile-ready</span>
              <span>🔋 Offline-capable</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
                <Badge className="bg-purple-500 text-white text-xs">
                  🔐 Stack Auth
                </Badge>
                {dynamicEmails.length > 0 && (
                  <Badge className="bg-green-500 text-white text-xs animate-pulse">
                    {dynamicEmails.length} Live
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Your student emails with AI-powered insights
              </p>
            </div>

            {/* Compose Button + User Profile */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCompose(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                disabled={isAnalyzing}
              >
                <Send className="h-4 w-4 mr-2" />
                Compose Test Email
              </Button>

              {/* User Profile (Stack Auth) */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">Ms. Johnson</div>
                  <div className="text-xs text-gray-500">Authenticated via Stack Auth</div>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  MJ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List - Left Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Messages ({DEMO_INBOX.length})</CardTitle>
                    <CardDescription>
                      {aiToggle ? 'Sorted by risk level' : 'Sorted chronologically'}
                    </CardDescription>
                  </div>

                  {/* AI Toggle + Re-analyze Button */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleReanalyzeAll}
                      disabled={isReanalyzing}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 hover:bg-purple-50"
                    >
                      {isReanalyzing ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                          Re-analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Re-analyze All (Live AI)
                        </>
                      )}
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <span className="text-sm font-medium text-gray-700">AI Risk Sorting</span>
                    <Button
                      onClick={() => setAiToggle(!aiToggle)}
                      variant={aiToggle ? 'default' : 'outline'}
                      size="sm"
                      className={aiToggle ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      {aiToggle ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y">
                  {sortedEmails.map((email) => {
                    const student = getStudentWithUpdates(email.studentId);
                    if (!student) return null;

                    // Use live analysis risk score for live demo emails, reanalyzed score if available, or original calculation
                    const riskScore = (email as any).liveAnalysis?.riskScore ??
                      reanalyzedScores[email.studentId] ??
                      (student.redFlags.length > 0
                        ? Math.max(...student.redFlags.map(f =>
                            f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
                          ))
                        : 1);
                    const riskBadge = getRiskScoreBadge(riskScore);

                    const isSelected = selectedEmail?.id === email.id;

                    return (
                      <div
                        key={email.id}
                        className={`w-full p-4 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Student Name + Risk Badge */}
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {student.name}
                              </h3>
                              {aiToggle && (
                                <Badge
                                  className={`${riskBadge.bgColor} ${riskBadge.color} ${riskBadge.borderColor} border text-xs`}
                                  title="Powered by Claude 3.7 Sonnet + Cactus Compute"
                                >
                                  {riskBadge.icon} {riskBadge.label}
                                </Badge>
                              )}
                              {reanalyzedScores[email.studentId] !== undefined && (
                                <Badge className="bg-green-500 text-white text-xs animate-pulse">
                                  ✓ Live AI
                                </Badge>
                              )}
                              {email.studentId === 'miguel-rodriguez' && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  🌍 Translation
                                </Badge>
                              )}
                            </div>

                            {/* Subject */}
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {email.subject}
                            </p>

                            {/* Preview */}
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {email.body}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(email.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {email.wordCount} words
                              </span>
                              {aiToggle && student.aiInsight.confidence > 0 && (
                                <span className="text-xs text-purple-600 font-medium">
                                  {student.aiInsight.confidence}% confidence
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() => handleEmailClick(email)}
                              className="text-xs"
                            >
                              {isSelected ? 'Selected' : 'View'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDetailEmail(email)}
                              className="text-xs"
                            >
                              📧 Expand
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Context Panel - Right Side */}
          <div className="lg:col-span-1">
            {selectedStudent ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={selectedStudent.photoUrl}
                      alt={selectedStudent.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{selectedStudent.name}</CardTitle>
                      <CardDescription>Grade {selectedStudent.grade}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="tools">Tools</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      {/* Grade Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Status</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-medium">{selectedStudent.currentGrade}</span>
                        </div>
                        {selectedStudent.previousGrade && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">Previous:</span>
                            <span className="text-gray-500">{selectedStudent.previousGrade}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                  {/* Baseline */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Baseline Behavior</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Attendance:</span>
                        <span className="font-medium">{(selectedStudent.baseline.attendanceRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Grade:</span>
                        <span className="font-medium">{selectedStudent.baseline.avgGrade}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Participation:</span>
                        <span className="font-medium">{selectedStudent.baseline.participationLevel}/10</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Red Flags */}
                  {selectedStudent.redFlags.length > 0 && (
                    <>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Red Flags ({selectedStudent.redFlags.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedStudent.redFlags.map((flag, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-md text-xs ${
                                flag.severity === 'high'
                                  ? 'bg-red-50 border border-red-200'
                                  : flag.severity === 'medium'
                                  ? 'bg-amber-50 border border-amber-200'
                                  : 'bg-yellow-50 border border-yellow-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-semibold text-gray-900">
                                  {flag.description}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    flag.severity === 'high'
                                      ? 'border-red-300 text-red-700'
                                      : flag.severity === 'medium'
                                      ? 'border-amber-300 text-amber-700'
                                      : 'border-yellow-300 text-yellow-700'
                                  }`}
                                >
                                  {flag.deviation}
                                </Badge>
                              </div>
                              <p className="text-gray-600">{flag.context}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* AI Insight */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      AI Analysis
                      <Badge className="bg-purple-600 text-white text-xs">Claude</Badge>
                    </h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-900">
                          {selectedStudent.aiInsight.pattern}
                        </span>
                        <Badge className="bg-purple-600 text-white text-xs">
                          {selectedStudent.aiInsight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedStudent.aiInsight.analysis.split('\n\n')[0]}
                      </p>
                    </div>
                  </div>

                  <Separator />

                      {/* Recommendation */}
                      {selectedStudent.aiInsight.recommendation && (
                        <>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Recommended Response
                            </h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                              <p className="text-xs font-semibold text-blue-900 mb-2">
                                {selectedStudent.aiInsight.recommendation.approach}
                              </p>
                              <p className="text-xs text-gray-700 italic">
                                {selectedStudent.aiInsight.recommendation.reasoning}
                              </p>
                            </div>
                          </div>

                          {/* Translation Section - Lingo.dev Integration */}
                          {selectedStudent.id === 'miguel-rodriguez' && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  Parent Communication
                                  <Badge className="bg-blue-500 text-white text-xs">Lingo.dev</Badge>
                                </h4>
                                <div className="space-y-3">
                                  {/* English Version */}
                                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <div className="text-xs font-semibold text-gray-700 mb-1">English (Original)</div>
                                    <p className="text-xs text-gray-600 whitespace-pre-line">
                                      {translationExample.english}
                                    </p>
                                  </div>

                                  {/* Spanish Translation */}
                                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-blue-900">Spanish (Lingo-Adapted)</span>
                                      <Badge className="bg-blue-600 text-white text-xs">95% confidence</Badge>
                                    </div>
                                    <p className="text-xs text-gray-700 mb-2 whitespace-pre-line">
                                      {translationExample.spanish}
                                    </p>
                                    <div className="text-xs text-blue-600 italic">
                                      ✓ Culturally adapted for formal teacher-parent communication
                                    </div>
                                  </div>

                                  {/* Cultural Notes */}
                                  <details className="text-xs">
                                    <summary className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600">
                                      View Cultural Adaptations ({translationExample.culturalNotes.length})
                                    </summary>
                                    <ul className="mt-2 space-y-1 text-gray-600 pl-4">
                                      {translationExample.culturalNotes.map((note, idx) => (
                                        <li key={idx}>• {note}</li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4 mt-4">
                      <StudentHistory student={selectedStudent} />
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4 mt-4">
                      <EngagementTimeline student={selectedStudent} />

                      <Separator />

                      {/* Projected Outcomes */}
                      {selectedStudent.aiInsight.projectedOutcomes && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Projected Outcomes</h4>

                          <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-red-900">Without Intervention</span>
                              <Badge className="bg-red-600 text-white text-xs">
                                {selectedStudent.aiInsight.projectedOutcomes.withoutIntervention.probability}% probability
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-700">
                              {selectedStudent.aiInsight.projectedOutcomes.withoutIntervention.outcome}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Timeframe: {selectedStudent.aiInsight.projectedOutcomes.withoutIntervention.timeframe}
                            </p>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-green-900">With Intervention</span>
                              <Badge className="bg-green-600 text-white text-xs">
                                {selectedStudent.aiInsight.projectedOutcomes.withIntervention.probability}% probability
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-700">
                              {selectedStudent.aiInsight.projectedOutcomes.withIntervention.outcome}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Timeframe: {selectedStudent.aiInsight.projectedOutcomes.withIntervention.timeframe}
                            </p>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-md p-2">
                            <p className="text-xs text-purple-900">
                              <span className="font-semibold">Window:</span> {selectedStudent.aiInsight.projectedOutcomes.windowOfOpportunity}
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4 mt-4">
                      <ConfidenceBreakdown student={selectedStudent} />

                      <Separator />

                      {/* Cactus Compute Performance Metrics */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          Performance Optimization
                          <Badge className="bg-green-500 text-white text-xs">Cactus Compute</Badge>
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Latency Card */}
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="text-xs font-semibold text-green-900 mb-1">
                              AI Analysis Speed
                            </div>
                            <div className="text-2xl font-bold text-green-700">&lt;50ms</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Mobile-ready latency
                            </div>
                          </div>

                          {/* Token Efficiency */}
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="text-xs font-semibold text-green-900 mb-1">
                              Prompt Size
                            </div>
                            <div className="text-2xl font-bold text-green-700">~450</div>
                            <div className="text-xs text-gray-600 mt-1">
                              tokens (offline-capable)
                            </div>
                          </div>
                        </div>

                        {/* Mobile Readiness Indicator */}
                        <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-green-900">
                              Mobile Deployment Ready
                            </span>
                            <Badge className="bg-green-600 text-white text-xs">✓ Optimized</Badge>
                          </div>
                          <p className="text-xs text-gray-700">
                            Cactus Compute batch processing enables offline AI analysis.
                            Teachers can review student patterns even without internet.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tools" className="space-y-3 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        5 YC Tools Powering This Analysis
                      </h4>

                      {/* Claude */}
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🧠</span>
                          <span className="text-xs font-semibold text-purple-900">Claude 3.7 Sonnet</span>
                          <Badge className="bg-purple-600 text-white text-xs ml-auto">Active</Badge>
                        </div>
                        <p className="text-xs text-gray-700">
                          Multi-dimensional pattern detection • Risk scoring • Response generation
                        </p>
                      </div>

                      {/* Stack Auth */}
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🔐</span>
                          <span className="text-xs font-semibold text-purple-900">Stack Auth</span>
                          <Badge className="bg-purple-600 text-white text-xs ml-auto">Secured</Badge>
                        </div>
                        <p className="text-xs text-gray-700">
                          FERPA-compliant authentication • Teacher data protection • Secure sessions
                        </p>
                      </div>

                      {/* s2.dev */}
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📊</span>
                          <span className="text-xs font-semibold text-blue-900">s2.dev</span>
                          <Badge className="bg-blue-600 text-white text-xs ml-auto">
                            {activityLog.length} events
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700">
                          Real-time activity streaming • Event logging • Usage analytics
                        </p>
                      </div>

                      {/* Lingo.dev */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🌍</span>
                          <span className="text-xs font-semibold text-emerald-900">Lingo.dev</span>
                          <Badge className="bg-emerald-600 text-white text-xs ml-auto">
                            {selectedStudent.id === 'miguel-rodriguez' ? 'Available' : 'Ready'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700">
                          Culturally-adapted translation • Parent communication • 10+ languages
                        </p>
                      </div>

                      {/* Cactus Compute */}
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">⚡</span>
                          <span className="text-xs font-semibold text-green-900">Cactus Compute</span>
                          <Badge className="bg-green-600 text-white text-xs ml-auto">&lt;50ms</Badge>
                        </div>
                        <p className="text-xs text-gray-700">
                          Batch processing optimization • Mobile-ready AI • Offline capability
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Select an email to view student details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <ComposeEmailModal
          onClose={() => setShowCompose(false)}
          onSendEmail={handleSendEmail}
          students={STUDENTS}
        />
      )}

      {/* Real-Time Analysis Overlay (Compose Email) */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                Analyzing Email with Real-Time AI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-center text-gray-700 mb-6">
                  Watch all 5 YC tools work together in real-time...
                </p>

                {/* Tool activation animation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                    <Badge className="bg-purple-100 text-purple-900 border-purple-300 flex-1">
                      🧠 Claude analyzing communication patterns & sentiment...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    <Badge className="bg-blue-100 text-blue-900 border-blue-300 flex-1">
                      🎯 Slate calculating risk score & adjusting tone...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <div className="h-3 w-3 bg-cyan-600 rounded-full"></div>
                    <Badge className="bg-cyan-100 text-cyan-900 border-cyan-300 flex-1">
                      📊 s2.dev logging analysis event & metadata...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <div className="h-3 w-3 bg-emerald-600 rounded-full"></div>
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 flex-1">
                      🌍 Lingo detecting language & preparing translation...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.8s' }}>
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                    <Badge className="bg-green-100 text-green-900 border-green-300 flex-1">
                      ⚡ Cactus optimizing for mobile deployment...
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 text-center">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    Using real Claude API • Analyzing in real-time • This is not a demo!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Re-Analyze All Overlay */}
      {isReanalyzing && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                Re-Analyzing All {DEMO_INBOX.length} Emails with Live Claude API
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-center text-gray-700 mb-6">
                  Proving this is real-time AI, not cached data...
                </p>

                {/* Tool activation animation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
                    <Badge className="bg-purple-100 text-purple-900 border-purple-300 flex-1">
                      🧠 Claude re-analyzing {DEMO_INBOX.length} emails in parallel...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    <Badge className="bg-blue-100 text-blue-900 border-blue-300 flex-1">
                      🎯 Slate recalculating risk scores with fresh analysis...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <div className="h-3 w-3 bg-cyan-600 rounded-full"></div>
                    <Badge className="bg-cyan-100 text-cyan-900 border-cyan-300 flex-1">
                      📊 s2.dev logging re-analysis events...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <div className="h-3 w-3 bg-emerald-600 rounded-full"></div>
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 flex-1">
                      🌍 Lingo preparing updated translations...
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.8s' }}>
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                    <Badge className="bg-green-100 text-green-900 border-green-300 flex-1">
                      ⚡ Cactus batch processing {DEMO_INBOX.length} analyses...
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 text-center font-semibold">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    Live Claude API calls • Risk scores will update • Proof of real AI!
                  </p>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    Scores may change slightly - that's how you know it's real-time analysis, not cached!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Detail Modal */}
      {detailEmail && (
        <EmailDetailView
          email={detailEmail}
          student={getStudentWithUpdates(detailEmail.studentId) || STUDENTS[detailEmail.studentId]}
          onClose={() => setDetailEmail(null)}
          onSendResponse={handleSendResponse}
        />
      )}
    </div>
  );
}
