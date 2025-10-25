'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Languages } from 'lucide-react';
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
  const relatedInteraction = student.interactions.find(
    (i) => i.type === 'email' && i.details === email.body
  );

  // Handle sending the response
  const handleSendResponse = () => {
    if (generatedResponse && onSendResponse) {
      onSendResponse(student.id, generatedResponse.response);
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">Email Details</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">{email.subject}</h3>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  email.sentiment === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : email.sentiment === 'anxious'
                    ? 'bg-amber-100 text-amber-800'
                    : email.sentiment === 'frustrated'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {email.sentiment}
              </Badge>
              <span className="text-sm text-gray-500">{email.wordCount} words</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">{email.body}</p>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">AI Analysis</h4>

            {/* Word Count Analysis */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">📊</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Communication Pattern
                  </p>
                  <p className="text-xs text-gray-700">
                    This email is <span className="font-semibold">{email.wordCount} words</span>,
                    compared to {student.name}'s baseline of{' '}
                    <span className="font-semibold">
                      {student.baseline.avgWordCount} words
                    </span>
                    .
                  </p>
                  {email.wordCount < student.baseline.avgWordCount * 0.5 && (
                    <p className="text-xs text-red-600 font-medium mt-2">
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
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">🔍</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Historical Context</p>
                    <p className="text-xs text-gray-700">{relatedInteraction.summary}</p>
                    {relatedInteraction.sentiment !== 'neutral' && (
                      <p className="text-xs text-gray-600 mt-1 capitalize">
                        Detected sentiment: {relatedInteraction.sentiment}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Red Flags Related to This Email */}
            {student.redFlags.some((flag) => flag.type === 'communication') && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">🚨</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Warning Signal</p>
                    {student.redFlags
                      .filter((flag) => flag.type === 'communication')
                      .map((flag, idx) => (
                        <div key={idx} className="text-xs text-gray-700 mb-2">
                          <p className="font-medium">{flag.description}</p>
                          <p className="text-gray-600 mt-1">{flag.context}</p>
                          <Badge className="mt-2 bg-red-600 text-white">
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
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Recommended Response
                    </p>
                    <p className="text-xs font-semibold text-green-900 mb-2">
                      {student.aiInsight.recommendation.approach}
                    </p>
                    <p className="text-xs text-gray-700">
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
                  Draft AI Response (All 5 Tools)
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  See Claude, Slate, s2, Lingo, and Cactus work together
                </p>
              </div>
            )}

            {/* Loading Animation - All 5 Tools Activating */}
            {isGenerating && (
              <div className="pt-4">
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                    <p className="text-sm font-semibold text-purple-900">
                      Generating AI Response...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        🧠 Claude analyzing communication pattern...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.2s' }}>
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        🎯 Slate adjusting tone for risk level...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.4s' }}>
                      <div className="h-2 w-2 bg-cyan-600 rounded-full"></div>
                      <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">
                        📊 s2.dev logging generation event...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.6s' }}>
                      <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                        🌍 Lingo preparing translation...
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.8s' }}>
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
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
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      AI Response Generated
                    </p>
                    <p className="text-xs text-gray-500">
                      Generated at {generatedResponse.generatedAt}
                    </p>
                  </div>
                </div>

                {/* The Generated Response */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Draft Email Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* English Response */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">English</span>
                        <Badge className="bg-purple-600 text-white text-xs">Ready to send</Badge>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                        {generatedResponse.response}
                      </p>
                    </div>

                    {/* Translation Toggle for Miguel */}
                    {generatedResponse.spanishTranslation && (
                      <>
                        <Button
                          onClick={() => setShowTranslation(!showTranslation)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Languages className="h-4 w-4 mr-2" />
                          {showTranslation ? 'Hide' : 'Show'} Spanish Translation (Lingo)
                        </Button>

                        {showTranslation && (
                          <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-emerald-900">
                                Spanish (Culturally Adapted)
                              </span>
                              <Badge className="bg-emerald-600 text-white text-xs">
                                95% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed mb-3">
                              {generatedResponse.spanishTranslation}
                            </p>
                            <div className="text-xs text-emerald-600 italic">
                              ✓ Culturally adapted for formal teacher-parent communication
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Tool Contributions */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Tool Contributions:</p>
                      <div className="grid gap-2">
                        <div className="bg-purple-50 border border-purple-200 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">🧠</span>
                            <span className="text-xs font-semibold text-purple-900">Claude</span>
                          </div>
                          <p className="text-xs text-gray-700">{generatedResponse.toolContributions.claude}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">🎯</span>
                            <span className="text-xs font-semibold text-blue-900">Slate</span>
                          </div>
                          <p className="text-xs text-gray-700">{generatedResponse.toolContributions.slate}</p>
                        </div>
                        <div className="bg-cyan-50 border border-cyan-200 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">📊</span>
                            <span className="text-xs font-semibold text-cyan-900">s2.dev</span>
                          </div>
                          <p className="text-xs text-gray-700">{generatedResponse.toolContributions.s2}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">🌍</span>
                            <span className="text-xs font-semibold text-emerald-900">Lingo</span>
                          </div>
                          <p className="text-xs text-gray-700">{generatedResponse.toolContributions.lingo}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">⚡</span>
                            <span className="text-xs font-semibold text-green-900">Cactus</span>
                          </div>
                          <p className="text-xs text-gray-700">{generatedResponse.toolContributions.cactus}</p>
                        </div>
                      </div>
                    </div>

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

        <div className="border-t p-4 bg-gray-50">
          <Button onClick={onClose} variant={generatedResponse ? 'outline' : 'default'} className="w-full">
            {generatedResponse ? 'Close (Response Generated ✓)' : 'Close'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
