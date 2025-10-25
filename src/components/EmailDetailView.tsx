'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Languages, RefreshCw } from 'lucide-react';
import type { DemoEmail, StudentProfile } from '@/types';
import { generateDemoResponse, type DemoResponse } from '@/data/demo-responses';

interface EmailDetailViewProps {
  email: DemoEmail;
  student: StudentProfile;
  onClose: () => void;
  onSendResponse?: (studentId: string, response: string) => void;
}

export function EmailDetailView({ email, student, onClose, onSendResponse }: EmailDetailViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState<DemoResponse | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isResponseSent, setIsResponseSent] = useState(false);

  // Find the corresponding interaction in student history
  const relatedInteraction = student?.interactions?.find(
    (i) => i.type === 'email' && i.details === email.body
  );

  // Handle sending the response
  const handleSendResponse = () => {
    if (generatedResponse && onSendResponse) {
      // For Miguel, send Spanish translation; for others, send English
      const responseToSend = student.id === 'miguel-rodriguez' && generatedResponse.spanishTranslation
        ? generatedResponse.spanishTranslation
        : generatedResponse.response;

      onSendResponse(student.id, responseToSend);
      setIsResponseSent(true);
    }
  };

  // Handle AI response generation
  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    setShowTranslation(false);

    try {
      // Call real API to generate response using Claude
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          student,
          analysis: {
            sentiment: email.sentiment,
            riskScore: student.aiInsight?.confidence || 5,
            recommendedApproach: student.aiInsight?.recommendation?.approach || 'Standard Reply',
            reasoning: student.aiInsight?.recommendation?.reasoning || '',
            communicationPattern: student.aiInsight?.pattern || 'Standard',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();

      // Transform API response to match DemoResponse format
      const demoResponse: DemoResponse = {
        emailId: email.id,
        studentId: student.id,
        response: data.response,
        spanishTranslation: data.spanishTranslation,
        toolContributions: data.toolContributions,
        generatedAt: new Date().toLocaleTimeString(),
      };

      setGeneratedResponse(demoResponse);
    } catch (error) {
      console.error('Failed to generate response:', error);

      // Fallback to demo response if API fails
      try {
        const demoResp = await generateDemoResponse(email.id);
        setGeneratedResponse(demoResp);
      } catch {
        alert('Failed to generate response. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2 text-gray-900 dark:text-gray-100">Email Details</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{student.name}</span>
                <span>•</span>
                <span>{email.from}</span>
                <span>•</span>
                <span>
                  {new Date(email.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto">
          {/* Subject */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{email.subject}</h3>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  email.sentiment === 'positive'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : email.sentiment === 'anxious'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    : email.sentiment === 'frustrated'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }
              >
                {email.sentiment}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">{email.wordCount} words</span>
            </div>
          </div>

          {/* Reanalyze Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all"
              onClick={() => {}}
            >
              <RefreshCw className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                Reanalyze Email with Latest AI Models
              </span>
            </Button>
          </div>

          {/* Email Body */}
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">{email.body}</p>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">AI Analysis</h4>

            {/* Word Count Analysis */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">📊</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Communication Pattern
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    This email is <span className="font-semibold">{email.wordCount} words</span>,
                    compared to {student.name}'s baseline of{' '}
                    <span className="font-semibold">
                      {student.baseline.avgWordCount} words
                    </span>
                    .
                  </p>
                  {email.wordCount < student.baseline.avgWordCount * 0.5 && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-2">
                      ⚠️ Significantly briefer than usual (-
                      {Math.round(
                        ((student.baseline.avgWordCount - email.wordCount) /
                          student.baseline.avgWordCount) *
                          100
                      )}
                      %)
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Context from History */}
            {relatedInteraction && (
              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">🔍</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Historical Context</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{relatedInteraction.summary}</p>
                    {relatedInteraction.sentiment !== 'neutral' && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">
                        Detected sentiment: {relatedInteraction.sentiment}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Red Flags Related to This Email */}
            {student.redFlags.some((flag) => flag.type === 'communication') && (
              <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">🚨</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Warning Signal</p>
                    {student.redFlags
                      .filter((flag) => flag.type === 'communication')
                      .map((flag, idx) => (
                        <div key={idx} className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                          <p className="font-medium">{flag.description}</p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{flag.context}</p>
                          <Badge className="mt-2 bg-red-600 dark:bg-red-700 text-white">
                            {flag.deviation} deviation
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            )}

            {/* AI Recommendation */}
            {student.aiInsight.recommendation && (
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Recommended Response
                    </p>
                    <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-2">
                      {student.aiInsight.recommendation.approach}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {student.aiInsight.recommendation.reasoning}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Draft Response Button */}
            {!generatedResponse && !isGenerating && (
              <div className="pt-4">
                <Button
                  onClick={handleGenerateResponse}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Draft AI Response
                </Button>
              </div>
            )}

            {/* Loading Animation - All 5 Tools Activating */}
            {isGenerating && (
              <div className="pt-4">
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                      Generating AI Response...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="h-2 w-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                        🧠 Claude analyzing communication pattern...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.2s' }}>
                      <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                        🎯 Slate adjusting tone for risk level...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.4s' }}>
                      <div className="h-2 w-2 bg-cyan-600 dark:bg-cyan-400 rounded-full"></div>
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700">
                        📊 s2.dev logging generation event...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.6s' }}>
                      <div className="h-2 w-2 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                        🌍 Lingo preparing translation...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.8s' }}>
                      <div className="h-2 w-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700">
                        ⚡ Cactus optimizing for mobile...
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Generated Response Display */}
            {generatedResponse && (
              <div className="pt-4 space-y-4">
                {/* Success Header */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                      AI Response Generated
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generated at {generatedResponse.generatedAt}
                    </p>
                  </div>
                </div>

                {/* The Generated Response */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Draft Email Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* For Miguel: Show Spanish version first with "Will be sent" badge */}
                    {generatedResponse.spanishTranslation && student.id === 'miguel-rodriguez' ? (
                      <>
                        {/* Spanish Version (Primary for Miguel) */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-emerald-500 dark:border-emerald-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                                Spanish (Culturally Adapted by Lingo)
                              </span>
                            </div>
                            <Badge className="bg-emerald-600 dark:bg-emerald-700 text-white text-xs">
                              ✓ Will be sent
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed mb-3">
                            {generatedResponse.spanishTranslation}
                          </p>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 italic">
                            ✓ Culturally adapted for formal teacher-parent communication (Mexican Spanish)
                          </div>
                        </div>

                        {/* English Version (Reference only for Miguel) */}
                        <Button
                          onClick={() => setShowTranslation(!showTranslation)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Languages className="h-4 w-4 mr-2" />
                          {showTranslation ? 'Hide' : 'Show'} English Reference
                        </Button>

                        {showTranslation && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-700 opacity-75">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">English (Reference Only)</span>
                              <Badge variant="outline" className="text-xs">Not sent</Badge>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                              {generatedResponse.response}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* English Response (For non-Miguel students) */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">English</span>
                            <Badge className="bg-purple-600 dark:bg-purple-700 text-white text-xs">Ready to send</Badge>
                          </div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                            {generatedResponse.response}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setGeneratedResponse(null)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isResponseSent}
                      >
                        Generate New Response
                      </Button>
                      <Button
                        onClick={handleSendResponse}
                        variant="default"
                        size="sm"
                        className={`flex-1 ${isResponseSent ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
                        disabled={isResponseSent}
                      >
                        {isResponseSent ? 'Response Sent ✓' : 'Send Response'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950">
          <Button onClick={onClose} variant={generatedResponse ? 'outline' : 'default'} className="w-full">
            {generatedResponse ? 'Close (Response Generated ✓)' : 'Close'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
