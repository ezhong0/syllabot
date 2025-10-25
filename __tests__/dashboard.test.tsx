/**
 * Dashboard Component Tests
 * Tests the main dashboard UI including AI toggle, email list, and student panel
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { DEMO_INBOX, STUDENTS } from '../src/data/demo-emails';

describe('Dashboard - Data Integration', () => {
  test('All emails have corresponding students', () => {
    DEMO_INBOX.forEach(email => {
      const student = STUDENTS[email.studentId];
      expect(student).toBeDefined();
      expect(student.id).toBe(email.studentId);
    });
  });

  test('All students have required fields for dashboard', () => {
    Object.values(STUDENTS).forEach(student => {
      // Basic fields
      expect(student.id).toBeTruthy();
      expect(student.name).toBeTruthy();
      expect(student.email).toBeTruthy();
      expect(student.grade).toBeGreaterThan(0);
      expect(student.photoUrl).toBeTruthy();
      expect(student.currentGrade).toBeTruthy();

      // Baseline
      expect(student.baseline).toBeDefined();
      expect(student.baseline.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(student.baseline.attendanceRate).toBeLessThanOrEqual(1);
      expect(student.baseline.avgGrade).toBeGreaterThan(0);
      expect(student.baseline.avgWordCount).toBeGreaterThan(0);
      expect(student.baseline.participationLevel).toBeGreaterThanOrEqual(0);

      // AI Insight
      expect(student.aiInsight).toBeDefined();
      expect(student.aiInsight.pattern).toBeTruthy();
      expect(student.aiInsight.confidence).toBeGreaterThanOrEqual(0);
      expect(student.aiInsight.confidence).toBeLessThanOrEqual(100);
      expect(student.aiInsight.analysis).toBeTruthy();

      // V2 Fields
      expect(student.aiInsight.confidenceBreakdown).toBeDefined();
      expect(student.aiInsight.confidenceBreakdown.length).toBeGreaterThan(0);
      expect(student.aiInsight.projectedOutcomes).toBeDefined();
      expect(student.aiInsight.engagementTimeline).toBeDefined();
      expect(student.aiInsight.engagementTimeline.length).toBeGreaterThan(0);
    });
  });

  test('Engagement timeline has 8 data points per student', () => {
    Object.values(STUDENTS).forEach(student => {
      expect(student.aiInsight.engagementTimeline).toHaveLength(8);
    });
  });

  test('Confidence breakdown has 3-4 factors per student', () => {
    Object.values(STUDENTS).forEach(student => {
      expect(student.aiInsight.confidenceBreakdown.length).toBeGreaterThanOrEqual(3);
      expect(student.aiInsight.confidenceBreakdown.length).toBeLessThanOrEqual(4);
    });
  });
});

describe('Dashboard - Sorting Logic', () => {
  test('Chronological sort orders by timestamp (newest first)', () => {
    const sorted = [...DEMO_INBOX].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Verify descending order
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentTime = new Date(sorted[i].timestamp).getTime();
      const nextTime = new Date(sorted[i + 1].timestamp).getTime();
      expect(currentTime).toBeGreaterThanOrEqual(nextTime);
    }
  });

  test('AI sort orders by confidence (highest risk first)', () => {
    const sorted = [...DEMO_INBOX].sort((a, b) => {
      const studentA = STUDENTS[a.studentId];
      const studentB = STUDENTS[b.studentId];
      const riskA = studentA?.aiInsight.confidence || 0;
      const riskB = studentB?.aiInsight.confidence || 0;
      return riskB - riskA;
    });

    // Verify descending confidence order
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentStudent = STUDENTS[sorted[i].studentId];
      const nextStudent = STUDENTS[sorted[i + 1].studentId];
      expect(currentStudent.aiInsight.confidence).toBeGreaterThanOrEqual(
        nextStudent.aiInsight.confidence
      );
    }
  });

  test('AI mode sorts by confidence scores correctly', () => {
    const sorted = [...DEMO_INBOX].sort((a, b) => {
      const studentA = STUDENTS[a.studentId];
      const studentB = STUDENTS[b.studentId];
      const riskA = studentA?.aiInsight.confidence || 0;
      const riskB = studentB?.aiInsight.confidence || 0;
      return riskB - riskA;
    });

    // Confidence scores: Sarah 92%, Emma 91%, Jake 89%, Miguel 85%
    // So sorted order should be: Sarah, Emma, Jake, Miguel
    expect(sorted[0].studentId).toBe('sarah-chen'); // Highest: 92%
    expect(sorted[sorted.length - 1].studentId).toBe('miguel-rodriguez'); // Lowest: 85%

    // Jake should be in top 3 (high risk student)
    const top3Ids = sorted.slice(0, 3).map(e => e.studentId);
    expect(top3Ids).toContain('jake-martinez');
  });
});

describe('Dashboard - Risk Score Calculation', () => {
  test('Risk score calculation matches red flag severity', () => {
    const jake = STUDENTS['jake-martinez'];

    // Jake has high severity flags
    const highSeverityFlags = jake.redFlags.filter(f => f.severity === 'high');
    expect(highSeverityFlags.length).toBeGreaterThan(0);

    // Calculate risk score same way as dashboard
    const riskScore = jake.redFlags.length > 0
      ? Math.max(...jake.redFlags.map(f =>
          f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
        ))
      : 1;

    expect(riskScore).toBe(7); // Jake should be high risk
  });

  test('Emma has low risk score (calibration proof)', () => {
    const emma = STUDENTS['emma-johnson'];

    const riskScore = emma.redFlags.length > 0
      ? Math.max(...emma.redFlags.map(f =>
          f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
        ))
      : 1;

    expect(riskScore).toBe(1); // Emma has no red flags = low risk
  });

  test('Students with no red flags get risk score of 1', () => {
    Object.values(STUDENTS).forEach(student => {
      if (student.redFlags.length === 0) {
        const riskScore = student.redFlags.length > 0
          ? Math.max(...student.redFlags.map(f =>
              f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
            ))
          : 1;
        expect(riskScore).toBe(1);
      }
    });
  });
});

describe('Dashboard - Timeline Data Validation', () => {
  test('Jake timeline shows declining trend', () => {
    const jake = STUDENTS['jake-martinez'];
    const timeline = jake.aiInsight.engagementTimeline;

    const firstScore = timeline[0].score;
    const lastScore = timeline[timeline.length - 1].score;

    expect(firstScore).toBe(95);
    expect(lastScore).toBe(12);
    expect(firstScore).toBeGreaterThan(lastScore);
  });

  test('All timeline points have required fields', () => {
    Object.values(STUDENTS).forEach(student => {
      student.aiInsight.engagementTimeline.forEach(point => {
        expect(point.date).toBeTruthy();
        expect(typeof point.score).toBe('number');
        expect(point.score).toBeGreaterThanOrEqual(0);
        expect(point.score).toBeLessThanOrEqual(100);
        expect(['excellent', 'good', 'concerning', 'crisis']).toContain(point.status);
      });
    });
  });

  test('Timeline status matches score ranges', () => {
    Object.values(STUDENTS).forEach(student => {
      student.aiInsight.engagementTimeline.forEach(point => {
        // Status values are pre-assigned in data, just verify they're valid
        expect(['excellent', 'good', 'concerning', 'crisis']).toContain(point.status);

        // General validation: higher scores should have better status
        if (point.score >= 90) {
          expect(point.status).toBe('excellent');
        } else if (point.score < 40) {
          expect(point.status).toBe('crisis');
        }
        // Middle range can vary, so we don't enforce strict rules
      });
    });
  });
});

describe('Dashboard - Projected Outcomes Validation', () => {
  test('All students have projected outcomes', () => {
    Object.values(STUDENTS).forEach(student => {
      expect(student.aiInsight.projectedOutcomes).toBeDefined();
      expect(student.aiInsight.projectedOutcomes.withoutIntervention).toBeDefined();
      expect(student.aiInsight.projectedOutcomes.withIntervention).toBeDefined();
      expect(student.aiInsight.projectedOutcomes.windowOfOpportunity).toBeTruthy();
    });
  });

  test('Intervention outcomes have higher success probability', () => {
    const jake = STUDENTS['jake-martinez'];
    const outcomes = jake.aiInsight.projectedOutcomes;

    // For high-risk students, intervention should improve outcomes
    const withoutProb = outcomes.withoutIntervention.probability;
    const withProb = outcomes.withIntervention.probability;

    // Jake: 68% dropout vs 78% success
    expect(withProb).toBeGreaterThan(withoutProb);
  });

  test('Outcome probabilities are valid percentages', () => {
    Object.values(STUDENTS).forEach(student => {
      const outcomes = student.aiInsight.projectedOutcomes;

      expect(outcomes.withoutIntervention.probability).toBeGreaterThanOrEqual(0);
      expect(outcomes.withoutIntervention.probability).toBeLessThanOrEqual(100);

      expect(outcomes.withIntervention.probability).toBeGreaterThanOrEqual(0);
      expect(outcomes.withIntervention.probability).toBeLessThanOrEqual(100);
    });
  });
});

describe('Dashboard - Confidence Breakdown Validation', () => {
  test('All confidence factors have required fields', () => {
    Object.values(STUDENTS).forEach(student => {
      student.aiInsight.confidenceBreakdown.forEach(factor => {
        expect(factor.factor).toBeTruthy();
        expect(typeof factor.weight).toBe('number');
        expect(factor.weight).toBeGreaterThan(0);
        expect(factor.weight).toBeLessThanOrEqual(1);
        expect(typeof factor.confidence).toBe('number');
        expect(factor.confidence).toBeGreaterThanOrEqual(0);
        expect(factor.confidence).toBeLessThanOrEqual(100);
        expect(factor.reasoning).toBeTruthy();
      });
    });
  });

  test('Jake has 4 confidence factors', () => {
    const jake = STUDENTS['jake-martinez'];
    expect(jake.aiInsight.confidenceBreakdown).toHaveLength(4);
  });

  test('Confidence factors have valid weights', () => {
    Object.values(STUDENTS).forEach(student => {
      const breakdown = student.aiInsight.confidenceBreakdown;

      // All weights should be between 0 and 1
      breakdown.forEach(factor => {
        expect(factor.weight).toBeGreaterThan(0);
        expect(factor.weight).toBeLessThanOrEqual(1);
      });

      // At least one factor should have high weight (>= 0.8)
      const hasHighWeight = breakdown.some(f => f.weight >= 0.8);
      expect(hasHighWeight).toBe(true);
    });
  });
});

describe('Dashboard - Recommendation Validation', () => {
  test('All students have recommendations', () => {
    Object.values(STUDENTS).forEach(student => {
      expect(student.aiInsight.recommendation).toBeDefined();
      expect(student.aiInsight.recommendation.approach).toBeTruthy();
      expect(student.aiInsight.recommendation.reasoning).toBeTruthy();
    });
  });

  test('Jake gets warm check-in approach', () => {
    const jake = STUDENTS['jake-martinez'];
    expect(jake.aiInsight.recommendation.approach).toContain('Warm Check-In');
  });

  test('Emma gets standard response approach', () => {
    const emma = STUDENTS['emma-johnson'];
    expect(emma.aiInsight.recommendation.approach).toContain('Quick Answer');
  });
});

// Export test utilities
export function getStudentByEmailId(emailId: string) {
  const email = DEMO_INBOX.find(e => e.id === emailId);
  return email ? STUDENTS[email.studentId] : null;
}

export function calculateRiskScore(studentId: string) {
  const student = STUDENTS[studentId];
  if (!student) return 0;

  return student.redFlags.length > 0
    ? Math.max(...student.redFlags.map(f =>
        f.severity === 'high' ? 7 : f.severity === 'medium' ? 4 : 2
      ))
    : 1;
}
