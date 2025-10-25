'use client';

import { useState, useMemo } from 'react';
import { studentProfiles, demoEmails } from '@/data/demo-emails';
import { StudentProfile, DemoEmail } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Minus, Mail, Search } from 'lucide-react';
import StudentDetailView from '../StudentDetailView';

interface StudentsTabProps {
  dynamicEmails?: DemoEmail[];
}

export default function StudentsTab({ dynamicEmails = [] }: StudentsTabProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Combine all emails (dynamic + demo)
  const allEmails = useMemo(() => [...dynamicEmails, ...demoEmails], [dynamicEmails]);

  // Helper function to calculate risk score based on red flags
  const getRiskScore = (student: StudentProfile) => {
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

  const enrichedStudents = useMemo(() => {
    return studentProfiles.map((student) => {
      const studentEmails = allEmails.filter((e) => e.studentId === student.id);
      const unreadCount = studentEmails.filter((e) => !e.read).length;
      const lastEmail = studentEmails[0]; // Already sorted by most recent

      return {
        ...student,
        unreadCount,
        lastContact: lastEmail?.timestamp || 'No emails',
        emailCount: studentEmails.length,
      };
    });
  }, [allEmails]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return enrichedStudents;

    const query = searchQuery.toLowerCase();
    return enrichedStudents.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.currentGrade.toLowerCase().includes(query)
    );
  }, [enrichedStudents, searchQuery]);

  const studentsByRisk = useMemo(() => {
    const groups = {
      high: filteredStudents.filter((s) => getRiskScore(s) >= 7),
      medium: filteredStudents.filter((s) => {
        const risk = getRiskScore(s);
        return risk >= 4 && risk < 7;
      }),
      low: filteredStudents.filter((s) => getRiskScore(s) < 4),
    };
    return groups;
  }, [filteredStudents]);

  const getRiskTrend = (student: StudentProfile) => {
    // Mock trend calculation - in real app, would compare historical data
    const riskScore = getRiskScore(student);
    if (riskScore >= 7) {
      return { icon: TrendingUp, label: 'Increasing', color: 'text-red-600 dark:text-red-500' };
    } else if (riskScore >= 4) {
      return { icon: Minus, label: 'Stable', color: 'text-yellow-600 dark:text-yellow-500' };
    } else {
      return { icon: TrendingDown, label: 'Decreasing', color: 'text-green-600 dark:text-green-500' };
    }
  };

  const renderStudentCard = (student: StudentProfile & { unreadCount: number; lastContact: string; emailCount: number }) => {
    const riskScore = getRiskScore(student);
    const trend = getRiskTrend(student);
    const TrendIcon = trend.icon;

    const riskColor = riskScore >= 7
      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
      : riskScore >= 4
      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
      : 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700';

    return (
      <Card
        key={student.id}
        className={`p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${riskColor}`}
        onClick={() => setSelectedStudent(student)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{student.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Grade: {student.currentGrade}</p>
            </div>
          </div>
          <Badge variant={riskScore >= 7 ? 'destructive' : riskScore >= 4 ? 'default' : 'secondary'} className="text-sm">
            Risk: {riskScore}/10
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {student.unreadCount} unread
            </span>
            <span className="text-gray-600 dark:text-gray-400">Total: {student.emailCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <TrendIcon className={`w-4 h-4 ${trend.color}`} />
              <span className={trend.color}>{trend.label}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">Last: {student.lastContact}</span>
          </div>
        </div>

        {student.aiInsight && (
          <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
              <span className="font-semibold">Pattern:</span> {student.aiInsight.pattern}
            </p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Students ({filteredStudents.length})</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage student communications</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Student cards */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* High Risk Section */}
          {studentsByRisk.high.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                🔴 High Risk ({studentsByRisk.high.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentsByRisk.high.map(renderStudentCard)}
              </div>
            </div>
          )}

          {/* Medium Risk Section */}
          {studentsByRisk.medium.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                🟡 Medium Risk ({studentsByRisk.medium.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentsByRisk.medium.map(renderStudentCard)}
              </div>
            </div>
          )}

          {/* Low Risk Section */}
          {studentsByRisk.low.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                🟢 Low Risk ({studentsByRisk.low.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentsByRisk.low.map(renderStudentCard)}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailView
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          allEmails={allEmails}
        />
      )}
    </div>
  );
}
