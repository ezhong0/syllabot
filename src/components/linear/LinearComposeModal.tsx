'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EMAIL_TEMPLATES } from '@/data/email-templates';
import type { DemoEmail, StudentProfile } from '@/types';

interface LinearComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: DemoEmail, analysis?: any) => void;
  onAnalysisComplete?: (email: DemoEmail) => void;
  students: Record<string, StudentProfile>;
}

export function LinearComposeModal({
  isOpen,
  onClose,
  onSend,
  onAnalysisComplete,
  students
}: LinearComposeModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('jake-martinez');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSend = async () => {
    const student = students[selectedStudent];
    if (!student) return;

    const newEmail: DemoEmail = {
      id: `email-${Date.now()}`,
      from: student.email,
      studentId: selectedStudent,
      subject: subject || 'Test Email',
      body: body || 'Test email body',
      timestamp: new Date().toISOString(),
      wordCount: body.split(/\s+/).filter(w => w.length > 0).length,
      sentiment: body.length < 20 ? 'anxious' : 'neutral'
    };

    // Start analysis
    setIsAnalyzing(true);

    try {
      // Call analyze API first
      const response = await fetch('/api/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          student: student
        })
      });

      const data = await response.json();

      // Add email to inbox with analysis results
      if (response.ok) {
        onSend(newEmail, data);

        // Notify parent that analysis is complete
        if (onAnalysisComplete) {
          onAnalysisComplete(newEmail);
        }
      } else {
        // If analysis failed, still add email but without analysis
        onSend(newEmail);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      // On error, still add email but without analysis
      onSend(newEmail);
    } finally {
      setIsAnalyzing(false);
      onClose();

      // Reset
      setSelectedTemplate(null);
      setSubject('');
      setBody('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compose Test Email</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  For demo: Select a template to test AI analysis
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Student selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {Object.values(students).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Template (Demo)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EMAIL_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {template.name}
                        </span>
                        <Badge className={`text-xs ${
                          template.expectedRisk.startsWith('8') || template.expectedRisk.startsWith('7')
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : template.expectedRisk.startsWith('5') || template.expectedRisk.startsWith('4')
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {template.expectedRisk.split(' ')[0]}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.subject}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Email content..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {body.split(/\s+/).filter(w => w.length > 0).length} words
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-950/50">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI will analyze this email when sent
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!subject || !body || isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
