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
import type { DemoEmail } from '@/types';

export default function DashboardPage() {
  const [aiToggle, setAiToggle] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(DEMO_INBOX[1]); // Auto-select Jake's email

  // Sort emails based on AI toggle
  const sortedEmails = aiToggle
    ? [...DEMO_INBOX].sort((a, b) => {
        const studentA = STUDENTS.get(a.studentId);
        const studentB = STUDENTS.get(b.studentId);
        const riskA = studentA?.aiInsight.confidence || 0;
        const riskB = studentB?.aiInsight.confidence || 0;
        return riskB - riskA; // Higher risk first
      })
    : [...DEMO_INBOX].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

  const selectedStudent = selectedEmail ? STUDENTS.get(selectedEmail.studentId) : null;

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
              <div className="text-right">
                <div className="text-xs opacity-75">5 Tools Integrated</div>
                <div className="text-sm font-semibold">Stack • s2 • Lingo • Cactus • Slate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600 mt-1">
            Your student emails with AI-powered insights
          </p>
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

                  {/* AI Toggle - THE CORE DEMO FEATURE */}
                  <div className="flex items-center gap-3">
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
                    const student = STUDENTS.get(email.studentId);
                    if (!student) return null;

                    const riskScore = student.redFlags.length > 0
                      ? Math.max(...student.redFlags.map(f =>
                          f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
                        ))
                      : 1;
                    const riskBadge = getRiskScoreBadge(riskScore);

                    const isSelected = selectedEmail?.id === email.id;

                    return (
                      <button
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
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
                                >
                                  {riskBadge.icon} {riskBadge.label}
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
                        </div>
                      </button>
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
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
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
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Analysis</h4>
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
                      )}
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
    </div>
  );
}
