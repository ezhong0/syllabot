'use client';

import { useMemo } from 'react';
import { demoEmails, studentProfiles } from '@/data/demo-emails';
import { DemoEmail } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, AlertCircle, CheckCircle, Clock, TrendingUp, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DashboardTabProps {
  dynamicEmails?: DemoEmail[];
}

export default function DashboardTab({ dynamicEmails = [] }: DashboardTabProps) {
  const stats = useMemo(() => {
    const allEmails = [...dynamicEmails, ...demoEmails];
    const totalEmails = allEmails.length;
    const unreadEmails = allEmails.filter((e) => !e.read).length;
    const readEmails = totalEmails - unreadEmails;

    // Helper function to calculate risk score based on red flags
    const getRiskScore = (student: typeof studentProfiles[0]) => {
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

    const highRiskStudents = studentProfiles.filter((s) => getRiskScore(s) >= 7).length;
    const mediumRiskStudents = studentProfiles.filter((s) => {
      const risk = getRiskScore(s);
      return risk >= 4 && risk < 7;
    }).length;
    const lowRiskStudents = studentProfiles.filter((s) => getRiskScore(s) < 4).length;

    // Calculate response rate (emails marked as read)
    const responseRate = totalEmails > 0 ? Math.round((readEmails / totalEmails) * 100) : 0;

    // Calculate average response time (mock data)
    const avgResponseTime = 3.2; // hours

    // Get high risk students needing response
    const highRiskUnread = allEmails.filter((email) => {
      const student = studentProfiles.find((s) => s.id === email.studentId);
      const riskScore = student ? getRiskScore(student) : 0;
      return !email.read && riskScore >= 7;
    }).length;

    return {
      totalEmails,
      unreadEmails,
      readEmails,
      responseRate,
      avgResponseTime,
      highRiskStudents,
      mediumRiskStudents,
      lowRiskStudents,
      highRiskUnread,
    };
  }, [dynamicEmails]);

  const actionItems = useMemo(() => {
    const items: { text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    if (stats.highRiskUnread > 0) {
      items.push({
        text: `${stats.highRiskUnread} high-risk students need response today`,
        priority: 'high',
      });
    }

    // Check for students with multiple unanswered emails
    const studentEmailCounts: Record<string, number> = {};
    demoEmails.filter((e) => !e.read).forEach((email) => {
      studentEmailCounts[email.studentId] = (studentEmailCounts[email.studentId] || 0) + 1;
    });

    Object.entries(studentEmailCounts).forEach(([studentId, count]) => {
      if (count >= 2) {
        const student = studentProfiles.find((s) => s.id === studentId);
        items.push({
          text: `${student?.name}: ${count} unanswered emails`,
          priority: 'high',
        });
      }
    });

    if (stats.responseRate < 85) {
      items.push({
        text: 'Response rate below target (85%)',
        priority: 'medium',
      });
    }

    return items;
  }, [stats]);

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Week of Oct 20-27</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Emails</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalEmails}</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">+8 vs last week</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Risk Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.highRiskStudents}</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">+3 vs last week</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.responseRate}%</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">-2% vs last week</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Risk Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  High Risk
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{stats.highRiskStudents} students</span>
              </div>
              <Progress value={(stats.highRiskStudents / studentProfiles.length) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Medium Risk
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{stats.mediumRiskStudents} students</span>
              </div>
              <Progress value={(stats.mediumRiskStudents / studentProfiles.length) * 100} className="h-2 [&>div]:bg-yellow-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Low Risk
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{stats.lowRiskStudents} students</span>
              </div>
              <Progress value={(stats.lowRiskStudents / studentProfiles.length) * 100} className="h-2 [&>div]:bg-green-500" />
            </div>
          </div>
        </Card>

        {/* Response Time Analysis */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Clock className="w-5 h-5" />
            Response Time Analysis
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">Avg Response Time</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.avgResponseTime} hours</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">High Risk</span>
              <span className="font-semibold text-green-600 dark:text-green-500">1.8 hours ✅</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(Target: &lt;4h)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">Medium Risk</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-500">5.4 hours ⚠️</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Low Risk</span>
              <span className="font-semibold text-green-600 dark:text-green-500">12.1 hours ✅</span>
            </div>
          </div>
        </Card>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <Card className="p-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <Target className="w-5 h-5" />
              Action Items
            </h2>
            <div className="space-y-2">
              {actionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded border border-orange-200 dark:border-orange-700"
                >
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                  <span className="text-sm flex-1 text-gray-900 dark:text-gray-100">{item.text}</span>
                  <Badge
                    variant={
                      item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Communication Patterns */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Communication Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Email Times</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">6-9 PM (42% of emails)</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Busiest Day</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Tuesday (23% of emails)</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Common Topics</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Grades (28%), Deadlines (19%)</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Email Length</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">127 words</p>
            </div>
          </div>
        </Card>

        {/* Impact Metrics */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <TrendingUp className="w-5 h-5" />
            Impact Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated intervention success</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">82%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Students moved from high→medium</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average risk reduction</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">-2.3 pts</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
