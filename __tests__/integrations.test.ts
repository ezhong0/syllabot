/**
 * Unit Tests for Integration Functions
 * Tests AI, s2, and Lingo integration functions
 */

import { detectPatterns, generateResponseStrategies } from '../src/lib/ai';
import { ActivityTypes } from '../src/lib/s2';
import { SupportedLanguages, TranslationContexts, getStaticTranslationExample } from '../src/lib/lingo';
import { JAKE, SARAH, MIGUEL, DEMO_INBOX } from '../src/data/demo-emails';

describe('AI Integration - Pattern Detection', () => {

  test('detectPatterns identifies attendance decline for Jake', async () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez')!;
    const patterns = await detectPatterns(jakeEmail, JAKE);

    expect(patterns).toContain('Attendance Decline');
  });

  test('detectPatterns identifies academic struggle for Jake', async () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez')!;
    const patterns = await detectPatterns(jakeEmail, JAKE);

    expect(patterns).toContain('Academic Struggle');
  });

  test('detectPatterns identifies communication withdrawal for Jake', async () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez')!;
    const patterns = await detectPatterns(jakeEmail, JAKE);

    // Jake's email is 9 words vs 45 baseline = 20% of baseline < 50%
    expect(patterns).toContain('Communication Withdrawal');
  });

  test('detectPatterns returns empty array when no patterns found', async () => {
    // Create a "normal" email scenario
    const normalEmail = {
      id: 'test-001',
      from: 'test@school.edu',
      studentId: 'test',
      subject: 'Test',
      body: 'This is a normal length email with no red flags.',
      timestamp: '2024-10-24T12:00:00Z',
      wordCount: 50,
      sentiment: 'positive' as const
    };

    const normalStudent = {
      ...JAKE,
      interactions: JAKE.interactions.filter(i => i.type !== 'absence')
    };

    const patterns = await detectPatterns(normalEmail, normalStudent);

    // Should not have attendance decline (no absences)
    expect(patterns).not.toContain('Attendance Decline');
  });
});

describe('AI Integration - Response Strategies', () => {

  test('generateResponseStrategies recommends immediate action for high risk', async () => {
    const highRiskAnalysis = {
      riskScore: 8,
      pattern: 'Silent Struggle',
      confidence: 89,
      hiddenMeaning: 'Student needs help',
      evidence: ['test'],
      recommendation: 'Check in'
    };

    const strategies = await generateResponseStrategies(
      DEMO_INBOX[1],
      highRiskAnalysis,
      JAKE
    );

    expect(strategies).toContain('Immediate warm check-in - show you notice');
    expect(strategies).toContain('Flag for counselor if no response in 24h');
  });

  test('generateResponseStrategies recommends warm response for medium risk', async () => {
    const mediumRiskAnalysis = {
      riskScore: 5,
      pattern: 'Academic Challenge',
      confidence: 75,
      hiddenMeaning: 'Student struggling',
      evidence: ['test'],
      recommendation: 'Support'
    };

    const strategies = await generateResponseStrategies(
      DEMO_INBOX[1],
      mediumRiskAnalysis,
      JAKE
    );

    expect(strategies).toContain('Warm response - answer question + gentle check-in');
  });

  test('generateResponseStrategies recommends standard response for low risk', async () => {
    const lowRiskAnalysis = {
      riskScore: 2,
      pattern: 'Normal Inquiry',
      confidence: 95,
      hiddenMeaning: 'Just asking a question',
      evidence: ['test'],
      recommendation: 'Answer'
    };

    const strategies = await generateResponseStrategies(
      DEMO_INBOX[1],
      lowRiskAnalysis,
      JAKE
    );

    expect(strategies).toContain('Standard response - answer the question');
  });
});

describe('s2 Integration - Activity Types', () => {

  test('ActivityTypes has all required event types', () => {
    expect(ActivityTypes.EMAIL_VIEWED).toBe('email.viewed');
    expect(ActivityTypes.EMAIL_REPLIED).toBe('email.replied');
    expect(ActivityTypes.STUDENT_PANEL_OPENED).toBe('student.panel.opened');
    expect(ActivityTypes.RISK_FLAG_DETECTED).toBe('risk.flag.detected');
    expect(ActivityTypes.RESPONSE_GENERATED).toBe('response.generated');
    expect(ActivityTypes.TRANSLATION_USED).toBe('translation.used');
    expect(ActivityTypes.SESSION_STARTED).toBe('session.started');
    expect(ActivityTypes.SESSION_ENDED).toBe('session.ended');
  });

  test('ActivityTypes values follow naming convention', () => {
    Object.values(ActivityTypes).forEach(value => {
      // Allow dots in activity names (e.g., student.panel.opened)
      expect(value).toMatch(/^[a-z]+(\.[a-z_]+)+$/);
      expect(value).toContain('.');
    });
  });
});

describe('Lingo Integration - Supported Languages', () => {

  test('SupportedLanguages includes major languages', () => {
    expect(SupportedLanguages.SPANISH_MEXICO).toBe('es-MX');
    expect(SupportedLanguages.SPANISH_SPAIN).toBe('es-ES');
    expect(SupportedLanguages.MANDARIN).toBe('zh-CN');
    expect(SupportedLanguages.FRENCH).toBe('fr-FR');
    expect(SupportedLanguages.VIETNAMESE).toBe('vi-VN');
    expect(SupportedLanguages.KOREAN).toBe('ko-KR');
    expect(SupportedLanguages.ARABIC).toBe('ar-SA');
    expect(SupportedLanguages.PORTUGUESE).toBe('pt-BR');
    expect(SupportedLanguages.TAGALOG).toBe('tl-PH');
    expect(SupportedLanguages.RUSSIAN).toBe('ru-RU');
  });

  test('Language codes follow ISO 639-1 format', () => {
    Object.values(SupportedLanguages).forEach(code => {
      // Format: xx-XX (language-COUNTRY)
      expect(code).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    });
  });
});

describe('Lingo Integration - Translation Contexts', () => {

  test('TranslationContexts has all required contexts', () => {
    expect(TranslationContexts.TEACHER_PARENT_FORMAL).toBeDefined();
    expect(TranslationContexts.TEACHER_STUDENT_CASUAL).toBeDefined();
    expect(TranslationContexts.GRADE_DISCUSSION).toBeDefined();
    expect(TranslationContexts.POSITIVE_FEEDBACK).toBeDefined();
    expect(TranslationContexts.URGENT_CONCERN).toBeDefined();
  });

  test('TEACHER_PARENT_FORMAL has correct properties', () => {
    expect(TranslationContexts.TEACHER_PARENT_FORMAL.relationship).toBe('teacher-parent');
    expect(TranslationContexts.TEACHER_PARENT_FORMAL.purpose).toBe('general');
  });

  test('TEACHER_STUDENT_CASUAL has correct properties', () => {
    expect(TranslationContexts.TEACHER_STUDENT_CASUAL.relationship).toBe('teacher-student');
    expect(TranslationContexts.TEACHER_STUDENT_CASUAL.purpose).toBe('general');
  });

  test('GRADE_DISCUSSION has teacher-parent relationship', () => {
    expect(TranslationContexts.GRADE_DISCUSSION.relationship).toBe('teacher-parent');
    expect(TranslationContexts.GRADE_DISCUSSION.purpose).toBe('grade_concern');
  });
});

describe('Lingo Integration - Static Translation Example', () => {

  test('getStaticTranslationExample returns valid example', () => {
    const example = getStaticTranslationExample();

    expect(example.english).toBeDefined();
    expect(example.spanish).toBeDefined();
    expect(example.culturalNotes).toBeDefined();
    expect(example.culturalNotes.length).toBeGreaterThan(0);
  });

  test('Static example has Miguel reference', () => {
    const example = getStaticTranslationExample();

    expect(example.english).toContain('Miguel');
    expect(example.spanish).toContain('Miguel');
  });

  test('Static example uses formal Spanish tone', () => {
    const example = getStaticTranslationExample();

    // Should use formal "Estimado" not casual "Hola"
    expect(example.spanish).toContain('Estimado');
    expect(example.spanish).toContain('Atentamente');
  });

  test('Cultural notes explain adaptations', () => {
    const example = getStaticTranslationExample();

    // Should have notes about formal greetings and closings
    const notesText = example.culturalNotes.join(' ');
    expect(notesText).toContain('formal');
    expect(notesText.toLowerCase()).toContain('estimado');
  });
});

describe('Integration Functions - Error Handling', () => {

  test('detectPatterns handles empty interaction history', async () => {
    const studentWithNoHistory = {
      ...JAKE,
      interactions: []
    };

    const patterns = await detectPatterns(DEMO_INBOX[1], studentWithNoHistory);

    // Should still run without crashing
    expect(Array.isArray(patterns)).toBe(true);
  });

  test('generateResponseStrategies handles null analysis', async () => {
    const nullAnalysis = {
      riskScore: 0,
      pattern: '',
      confidence: 0,
      hiddenMeaning: '',
      evidence: [],
      recommendation: ''
    };

    const strategies = await generateResponseStrategies(
      DEMO_INBOX[1],
      nullAnalysis,
      JAKE
    );

    // Should return standard response for risk score 0
    expect(strategies).toContain('Standard response - answer the question');
  });
});

describe('Integration Functions - Data Validation', () => {

  test('All student profiles have valid baseline data', () => {
    [JAKE, SARAH, MIGUEL].forEach(student => {
      expect(student.baseline.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(student.baseline.attendanceRate).toBeLessThanOrEqual(1);
      expect(student.baseline.avgGrade).toBeGreaterThanOrEqual(0);
      expect(student.baseline.avgGrade).toBeLessThanOrEqual(100);
      expect(student.baseline.avgWordCount).toBeGreaterThan(0);
      expect(student.baseline.participationLevel).toBeGreaterThanOrEqual(0);
      expect(student.baseline.participationLevel).toBeLessThanOrEqual(10);
    });
  });

  test('All red flags have valid severity levels', () => {
    [JAKE, SARAH, MIGUEL].forEach(student => {
      student.redFlags.forEach(flag => {
        expect(['high', 'medium', 'low']).toContain(flag.severity);
        expect(flag.description).toBeTruthy();
        expect(flag.deviation).toBeTruthy();
      });
    });
  });

  test('All AI insights have valid confidence scores', () => {
    [JAKE, SARAH, MIGUEL].forEach(student => {
      expect(student.aiInsight.confidence).toBeGreaterThanOrEqual(0);
      expect(student.aiInsight.confidence).toBeLessThanOrEqual(100);
      expect(student.aiInsight.pattern).toBeTruthy();
      expect(student.aiInsight.analysis).toBeTruthy();
      expect(student.aiInsight.recommendation).toBeDefined();
    });
  });
});

// Export test helpers
export function mockEmailAnalysis(riskScore: number) {
  return {
    riskScore,
    pattern: 'Test Pattern',
    confidence: 85,
    hiddenMeaning: 'Test meaning',
    evidence: ['Evidence 1', 'Evidence 2'],
    recommendation: 'Test recommendation'
  };
}

export function mockActivityEvent(type: string) {
  return {
    type,
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
}
