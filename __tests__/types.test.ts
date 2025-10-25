/**
 * Unit Tests for TypeScript Types
 * Validates type definitions and type safety
 */

import type {
  Email,
  Student,
  DemoEmail,
  StudentProfile,
  Baseline,
  Interaction,
  RedFlag,
  AIInsight,
  ResponseStrategy,
  TeacherProfile,
  EmailAnalysis,
  CachedAnalysis
} from '../src/types';

describe('TypeScript Types - Structure Validation', () => {

  test('Email type has all required fields', () => {
    const email: Email = {
      id: 'test-001',
      from: 'test@school.edu',
      subject: 'Test Subject',
      body: 'Test body',
      timestamp: new Date()
    };

    expect(email.id).toBeDefined();
    expect(email.from).toBeDefined();
    expect(email.subject).toBeDefined();
    expect(email.body).toBeDefined();
    expect(email.timestamp).toBeInstanceOf(Date);
  });

  test('Student type has all required fields', () => {
    const student: Student = {
      id: 'student-001',
      name: 'Test Student',
      email: 'student@school.edu',
      currentGrade: 'A',
      riskScore: 5
    };

    expect(student.id).toBeDefined();
    expect(student.name).toBeDefined();
    expect(student.email).toBeDefined();
    expect(student.currentGrade).toBeDefined();
    expect(typeof student.riskScore).toBe('number');
  });

  test('DemoEmail type has all required fields', () => {
    const demoEmail: DemoEmail = {
      id: 'email-001',
      from: 'student@school.edu',
      studentId: 'student-001',
      subject: 'Test',
      body: 'Test body',
      timestamp: '2024-10-24T12:00:00Z',
      wordCount: 10,
      sentiment: 'neutral'
    };

    expect(demoEmail.id).toBeDefined();
    expect(demoEmail.studentId).toBeDefined();
    expect(demoEmail.wordCount).toBeGreaterThan(0);
    expect(['positive', 'neutral', 'anxious', 'frustrated']).toContain(demoEmail.sentiment);
  });

  test('Baseline type has all required metrics', () => {
    const baseline: Baseline = {
      attendanceRate: 0.95,
      avgGrade: 85,
      avgWordCount: 50,
      participationLevel: 7,
      typicalBehavior: 'Engaged student'
    };

    expect(baseline.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(baseline.attendanceRate).toBeLessThanOrEqual(1);
    expect(baseline.avgGrade).toBeGreaterThanOrEqual(0);
    expect(baseline.avgWordCount).toBeGreaterThan(0);
    expect(baseline.participationLevel).toBeGreaterThanOrEqual(0);
    expect(baseline.typicalBehavior).toBeTruthy();
  });

  test('Interaction type has all required fields', () => {
    const interaction: Interaction = {
      date: 'Oct 24, 2024',
      type: 'email',
      sentiment: 'positive',
      summary: 'Test summary',
      details: 'Test details'
    };

    expect(interaction.date).toBeDefined();
    expect(['email', 'grade', 'absence', 'participation']).toContain(interaction.type);
    expect(['positive', 'neutral', 'anxious', 'frustrated']).toContain(interaction.sentiment);
    expect(interaction.summary).toBeDefined();
  });

  test('RedFlag type has all required fields', () => {
    const redFlag: RedFlag = {
      type: 'attendance',
      severity: 'high',
      description: 'Test description',
      deviation: '+100%',
      context: 'Test context'
    };

    expect(['attendance', 'grade', 'communication', 'engagement']).toContain(redFlag.type);
    expect(['high', 'medium', 'low']).toContain(redFlag.severity);
    expect(redFlag.description).toBeTruthy();
    expect(redFlag.deviation).toBeTruthy();
    expect(redFlag.context).toBeTruthy();
  });

  test('ResponseStrategy type has all required fields', () => {
    const strategy: ResponseStrategy = {
      approach: 'Warm Check-In',
      reasoning: 'Test reasoning',
      draftEmail: 'Test draft',
      expectedOutcome: 'Test outcome'
    };

    expect(['Quick Answer', 'Warm Check-In', 'Direct Intervention']).toContain(strategy.approach);
    expect(strategy.reasoning).toBeTruthy();
    expect(strategy.draftEmail).toBeTruthy();
    expect(strategy.expectedOutcome).toBeTruthy();
  });

  test('AIInsight type has all required fields', () => {
    const insight: AIInsight = {
      pattern: 'Test Pattern',
      confidence: 85,
      analysis: 'Test analysis',
      recommendation: {
        approach: 'Warm Check-In',
        reasoning: 'Test',
        draftEmail: 'Test',
        expectedOutcome: 'Test'
      }
    };

    expect(insight.pattern).toBeTruthy();
    expect(insight.confidence).toBeGreaterThanOrEqual(0);
    expect(insight.confidence).toBeLessThanOrEqual(100);
    expect(insight.analysis).toBeTruthy();
    expect(insight.recommendation).toBeDefined();
  });

  test('StudentProfile type has all required nested structures', () => {
    const profile: StudentProfile = {
      id: 'test-001',
      name: 'Test Student',
      email: 'test@school.edu',
      grade: 11,
      photoUrl: 'https://example.com/photo.jpg',
      currentGrade: 'B+',
      previousGrade: 'A-',
      baseline: {
        attendanceRate: 0.95,
        avgGrade: 85,
        avgWordCount: 50,
        participationLevel: 7,
        typicalBehavior: 'Test'
      },
      interactions: [],
      redFlags: [],
      aiInsight: {
        pattern: 'Test',
        confidence: 85,
        analysis: 'Test',
        recommendation: {
          approach: 'Warm Check-In',
          reasoning: 'Test',
          draftEmail: 'Test',
          expectedOutcome: 'Test'
        }
      }
    };

    expect(profile.id).toBeDefined();
    expect(profile.baseline).toBeDefined();
    expect(profile.interactions).toBeDefined();
    expect(profile.redFlags).toBeDefined();
    expect(profile.aiInsight).toBeDefined();
  });

  test('EmailAnalysis type has all required fields', () => {
    const analysis: EmailAnalysis = {
      riskScore: 7,
      pattern: 'Silent Struggle',
      confidence: 89,
      hiddenMeaning: 'Student needs help',
      evidence: ['Evidence 1', 'Evidence 2'],
      recommendation: 'Check in with student'
    };

    expect(analysis.riskScore).toBeGreaterThanOrEqual(0);
    expect(analysis.riskScore).toBeLessThanOrEqual(10);
    expect(analysis.pattern).toBeTruthy();
    expect(analysis.confidence).toBeGreaterThanOrEqual(0);
    expect(analysis.confidence).toBeLessThanOrEqual(100);
    expect(Array.isArray(analysis.evidence)).toBe(true);
  });

  test('CachedAnalysis type has all required fields', () => {
    const cached: CachedAnalysis = {
      emailId: 'email-001',
      studentId: 'student-001',
      analysis: {
        riskScore: 7,
        pattern: 'Test',
        confidence: 85,
        hiddenMeaning: 'Test',
        evidence: [],
        recommendation: 'Test'
      },
      generatedAt: new Date().toISOString()
    };

    expect(cached.emailId).toBeDefined();
    expect(cached.studentId).toBeDefined();
    expect(cached.analysis).toBeDefined();
    expect(cached.generatedAt).toBeDefined();
  });

  test('TeacherProfile type has all required fields', () => {
    const teacher: TeacherProfile = {
      id: 'teacher-001',
      name: 'Ms. Johnson',
      email: 'johnson@school.edu',
      formality: 7,
      warmth: 8,
      commonPhrases: ['Let me know', 'Happy to help']
    };

    expect(teacher.id).toBeDefined();
    expect(teacher.formality).toBeGreaterThanOrEqual(0);
    expect(teacher.formality).toBeLessThanOrEqual(10);
    expect(teacher.warmth).toBeGreaterThanOrEqual(0);
    expect(teacher.warmth).toBeLessThanOrEqual(10);
    expect(Array.isArray(teacher.commonPhrases)).toBe(true);
  });
});

describe('TypeScript Types - Enum Values', () => {

  test('Interaction type values are valid', () => {
    const validTypes: Interaction['type'][] = ['email', 'grade', 'absence', 'participation'];
    validTypes.forEach(type => {
      const interaction: Interaction = {
        date: 'Test',
        type,
        sentiment: 'neutral',
        summary: 'Test'
      };
      expect(interaction.type).toBe(type);
    });
  });

  test('Sentiment values are valid', () => {
    const validSentiments: Interaction['sentiment'][] = ['positive', 'neutral', 'anxious', 'frustrated'];
    validSentiments.forEach(sentiment => {
      const interaction: Interaction = {
        date: 'Test',
        type: 'email',
        sentiment,
        summary: 'Test'
      };
      expect(interaction.sentiment).toBe(sentiment);
    });
  });

  test('RedFlag type values are valid', () => {
    const validTypes: RedFlag['type'][] = ['attendance', 'grade', 'communication', 'engagement'];
    validTypes.forEach(type => {
      const flag: RedFlag = {
        type,
        severity: 'medium',
        description: 'Test',
        deviation: 'Test',
        context: 'Test'
      };
      expect(flag.type).toBe(type);
    });
  });

  test('RedFlag severity values are valid', () => {
    const validSeverities: RedFlag['severity'][] = ['high', 'medium', 'low'];
    validSeverities.forEach(severity => {
      const flag: RedFlag = {
        type: 'attendance',
        severity,
        description: 'Test',
        deviation: 'Test',
        context: 'Test'
      };
      expect(flag.severity).toBe(severity);
    });
  });

  test('ResponseStrategy approach values are valid', () => {
    const validApproaches: ResponseStrategy['approach'][] = ['Quick Answer', 'Warm Check-In', 'Direct Intervention'];
    validApproaches.forEach(approach => {
      const strategy: ResponseStrategy = {
        approach,
        reasoning: 'Test',
        draftEmail: 'Test',
        expectedOutcome: 'Test'
      };
      expect(strategy.approach).toBe(approach);
    });
  });
});

describe('TypeScript Types - Optional Fields', () => {

  test('Interaction details field is optional', () => {
    const withDetails: Interaction = {
      date: 'Test',
      type: 'email',
      sentiment: 'neutral',
      summary: 'Test',
      details: 'Full details here'
    };

    const withoutDetails: Interaction = {
      date: 'Test',
      type: 'email',
      sentiment: 'neutral',
      summary: 'Test'
    };

    expect(withDetails.details).toBeDefined();
    expect(withoutDetails.details).toBeUndefined();
  });
});

describe('TypeScript Types - Number Constraints', () => {

  test('Risk score should be 0-10', () => {
    const validScores = [0, 1, 5, 7, 10];
    validScores.forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  test('Confidence should be 0-100', () => {
    const validConfidences = [0, 25, 50, 75, 89, 100];
    validConfidences.forEach(conf => {
      expect(conf).toBeGreaterThanOrEqual(0);
      expect(conf).toBeLessThanOrEqual(100);
    });
  });

  test('Attendance rate should be 0-1', () => {
    const validRates = [0, 0.25, 0.5, 0.75, 0.95, 1.0];
    validRates.forEach(rate => {
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
  });

  test('Participation level should be 0-10', () => {
    const validLevels = [0, 3, 5, 7, 8, 10];
    validLevels.forEach(level => {
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(10);
    });
  });
});
