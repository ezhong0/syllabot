'use client';

import { StudentProfile, DemoEmail } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, TrendingUp, Clock, Book } from 'lucide-react';
import { useMemo } from 'react';

interface StudentDetailViewProps {
  student: StudentProfile;
  onClose: () => void;
  allEmails?: DemoEmail[];
}

export default function StudentDetailView({ student, onClose, allEmails = [] }: StudentDetailViewProps) {
  const studentEmails = useMemo(() => {
    return allEmails.filter((e) => e.studentId === student.id);
  }, [student.id, allEmails]);

  // Calculate risk score based on red flags
  const riskScore = useMemo(() => {
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
  }, [student]);

  const riskColor = riskScore >= 7 ? 'text-red-600 dark:text-red-400' : riskScore >= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100">{student.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">Grade: {student.currentGrade}</Badge>
                <Badge variant={riskScore >= 7 ? 'destructive' : 'secondary'} className={riskColor}>
                  Risk: {riskScore}/10
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="emails">Emails ({studentEmails.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="overview" className="m-0">
              <div className="space-y-4">
                {/* Current Status */}
                <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Current Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
                      <p className={`text-lg font-semibold ${riskColor}`}>
                        {riskScore >= 7 ? 'High Risk' : riskScore >= 4 ? 'Medium Risk' : 'Low Risk'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{riskScore}/10</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Grade</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.currentGrade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{(student.baseline.attendanceRate * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </Card>

                {/* AI Insights */}
                {student.aiInsight && (
                  <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">AI Insights</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pattern Detected</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{student.aiInsight.pattern}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Analysis</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{student.aiInsight.analysis}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{student.aiInsight.confidence}%</p>
                      </div>
                      {student.aiInsight.projectedOutcomes && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <p className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Intervention Impact</p>
                          <div className="flex gap-4 text-sm text-gray-900 dark:text-gray-100">
                            <span>
                              Without: <span className="font-semibold text-red-600 dark:text-red-400">{student.aiInsight.projectedOutcomes.withoutIntervention.probability}%</span>
                            </span>
                            <span>
                              With: <span className="font-semibold text-green-600 dark:text-green-400">{student.aiInsight.projectedOutcomes.withIntervention.probability}%</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Communication Patterns */}
                <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Communication Patterns</h3>
                  <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Total emails: {studentEmails.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Typical behavior: {student.baseline.typicalBehavior}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Participation level: {student.baseline.participationLevel}/10</span>
                    </div>
                  </div>
                </Card>

                {/* Red Flags */}
                {student.redFlags && student.redFlags.length > 0 && (
                  <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <h3 className="font-semibold mb-3 text-red-800 dark:text-red-400">Red Flags</h3>
                    <div className="space-y-2">
                      {student.redFlags.map((flag, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{flag.description}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{flag.context}</p>
                            </div>
                            <Badge variant="destructive" className="ml-2">
                              {flag.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="emails" className="m-0">
              <div className="space-y-2">
                {studentEmails.length === 0 ? (
                  <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center">
                    <Mail className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No emails from this student yet</p>
                  </Card>
                ) : (
                  studentEmails.map((email) => (
                    <Card
                      key={email.id}
                      className={`p-4 border-gray-200 dark:border-gray-700 ${
                        !email.read
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600 dark:border-l-purple-500'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${!email.read ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>
                            {email.subject}
                          </h4>
                          {!email.read && (
                            <Badge className="bg-purple-600 dark:bg-purple-700 text-white text-xs">New</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {new Date(email.timestamp).toLocaleDateString()} {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{email.body}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={
                            email.sentiment === 'positive'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700'
                              : email.sentiment === 'anxious'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              : email.sentiment === 'frustrated'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                          }
                        >
                          {email.sentiment}
                        </Badge>
                        <span className="text-gray-500 dark:text-gray-400">{email.wordCount} words</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="m-0">
              <div className="space-y-4">
                {student.interactions.map((interaction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        interaction.sentiment === 'positive' ? 'bg-green-500 dark:bg-green-600' :
                        interaction.sentiment === 'anxious' ? 'bg-yellow-500 dark:bg-yellow-600' :
                        interaction.sentiment === 'frustrated' ? 'bg-red-500 dark:bg-red-600' : 'bg-gray-500 dark:bg-gray-600'
                      }`} />
                      {index < student.interactions.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{interaction.type}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(interaction.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{interaction.details || interaction.summary}</p>
                      <Badge variant="outline" className="mt-2 text-xs">{interaction.sentiment}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="m-0">
              <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet. Add notes to track important information about this student.</p>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
