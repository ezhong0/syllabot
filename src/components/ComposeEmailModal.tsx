'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Send, Zap } from 'lucide-react';
import { EMAIL_TEMPLATES, type EmailTemplate } from '@/data/email-templates';
import type { StudentProfile } from '@/types';

interface ComposeEmailModalProps {
  onClose: () => void;
  onSendEmail: (email: {
    template: EmailTemplate;
    subject: string;
    body: string;
  }) => Promise<void>;
  students: Record<string, StudentProfile>;
}

export function ComposeEmailModal({ onClose, onSendEmail, students }: ComposeEmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES[0].body);
  const [isSending, setIsSending] = useState(false);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in both subject and body');
      return;
    }

    setIsSending(true);
    try {
      await onSendEmail({
        template: selectedTemplate,
        subject: subject.trim(),
        body: body.trim(),
      });
      // Modal will be closed by parent after analysis completes
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to analyze email. Please try again.');
      setIsSending(false);
    }
  };

  const wordCount = body.trim().split(/\s+/).length;
  const student = students[selectedTemplate.studentId];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                Compose Test Email
              </CardTitle>
              <CardDescription className="mt-2">
                Select a template or write your own. Watch SyllaBot analyze it in real-time!
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSending}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Template Selector */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Template</h3>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    disabled={isSending}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {template.name}
                      </span>
                      {template.id === 'custom' && (
                        <Badge className="bg-purple-500 text-white text-xs">Custom</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.studentName}
                      </Badge>
                      {template.expectedRisk !== 'TBD - Real-time analysis' && (
                        <Badge
                          className={`text-xs ${
                            template.expectedRisk.startsWith('8') || template.expectedRisk.startsWith('7')
                              ? 'bg-red-100 text-red-800'
                              : template.expectedRisk.startsWith('5') || template.expectedRisk.startsWith('4')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {template.expectedRisk.split(' ')[0]}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Info */}
              {selectedTemplate && (
                <Card className="mt-4 bg-purple-50 border-purple-200">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-purple-900 mb-1">Expected Analysis:</p>
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Risk:</span> {selectedTemplate.expectedRisk}
                    </p>
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Sentiment:</span> {selectedTemplate.expectedSentiment}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Email Composer */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Student Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  {student && (
                    <>
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-600">
                          Baseline: {student.baseline.avgWordCount} words avg
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSending}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Email Body</label>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{wordCount} words</span>
                      {student && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              wordCount < student.baseline.avgWordCount * 0.5
                                ? 'text-red-600 font-medium'
                                : wordCount < student.baseline.avgWordCount * 0.75
                                ? 'text-amber-600'
                                : 'text-green-600'
                            }
                          >
                            {wordCount < student.baseline.avgWordCount * 0.5
                              ? 'Much shorter than baseline'
                              : wordCount < student.baseline.avgWordCount * 0.75
                              ? 'Shorter than baseline'
                              : wordCount > student.baseline.avgWordCount * 1.5
                              ? 'Longer than baseline'
                              : 'Normal length'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={isSending}
                    placeholder="Email message..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  />
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-900">
                      <p className="font-semibold mb-1">Real-Time AI Analysis</p>
                      <p className="text-blue-700">
                        When you click "Send & Analyze", all 5 YC tools will activate:
                        <span className="block mt-1">
                          🧠 Claude • 🎯 Slate • 📊 s2.dev • 🌍 Lingo • ⚡ Cactus
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isSending ? (
              <>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Analyzing with Claude API...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-green-600" />
                <span>Ready to analyze in real-time</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !body.trim()}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {isSending ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send & Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
