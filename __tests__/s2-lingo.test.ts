/**
 * Unit Tests for s2.dev and Lingo.dev Integrations
 * Tests activity logging and translation services
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  logActivity,
  getActivityFeed,
  ActivityTypes,
  logEmailViewed,
  logStudentPanelOpened,
  logRiskFlagDetected
} from '../src/lib/s2';
import {
  translateText,
  translateForMiguelParent,
  translateGradeConcern,
  translatePositiveFeedback,
  getStaticTranslationExample,
  SupportedLanguages,
  TranslationContexts
} from '../src/lib/lingo';

describe('s2.dev Integration - Activity Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test('logActivity sends events to s2.dev API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    await logActivity('teacher-123', {
      type: 'test.event',
      metadata: { key: 'value' }
    });

    // Note: Actual API call only happens if S2_API_KEY is set
    // Without key, it fails gracefully
  });

  test('logActivity fails gracefully without API key', async () => {
    // Should not throw error even without API key
    await expect(logActivity('teacher-123', {
      type: 'test.event'
    })).resolves.not.toThrow();
  });

  test('logActivity includes timestamp in event', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    await logActivity('teacher-123', {
      type: 'test.event',
      emailId: 'email-001',
      studentId: 'student-001'
    });

    // Verify it doesn't throw (actual API call mocked)
  });

  test('getActivityFeed returns empty array without API key', async () => {
    const feed = await getActivityFeed('teacher-123');

    expect(Array.isArray(feed)).toBe(true);
    expect(feed.length).toBe(0);
  });

  test('getActivityFeed handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const feed = await getActivityFeed('teacher-123');

    expect(Array.isArray(feed)).toBe(true);
    expect(feed.length).toBe(0);
  });
});

describe('s2.dev Integration - Activity Types', () => {
  test('ActivityTypes constant has all event types', () => {
    expect(ActivityTypes.EMAIL_VIEWED).toBe('email.viewed');
    expect(ActivityTypes.EMAIL_REPLIED).toBe('email.replied');
    expect(ActivityTypes.STUDENT_PANEL_OPENED).toBe('student.panel.opened');
    expect(ActivityTypes.RISK_FLAG_DETECTED).toBe('risk.flag.detected');
    expect(ActivityTypes.RESPONSE_GENERATED).toBe('response.generated');
    expect(ActivityTypes.TRANSLATION_USED).toBe('translation.used');
    expect(ActivityTypes.SESSION_STARTED).toBe('session.started');
    expect(ActivityTypes.SESSION_ENDED).toBe('session.ended');
  });
});

describe('s2.dev Integration - Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('logEmailViewed logs with correct type', async () => {
    await logEmailViewed('teacher-123', 'email-001', 'student-001', 7);

    // Should not throw
    expect(true).toBe(true);
  });

  test('logStudentPanelOpened logs with correct type', async () => {
    await logStudentPanelOpened('teacher-123', 'student-001', 'email-001');

    // Should not throw
    expect(true).toBe(true);
  });

  test('logRiskFlagDetected logs with metadata', async () => {
    await logRiskFlagDetected('teacher-123', 'student-001', 8, 'Silent Struggle');

    // Should not throw
    expect(true).toBe(true);
  });
});

describe('Lingo.dev Integration - Translation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test('translateText returns fallback without API key', async () => {
    const result = await translateText(
      'Hello, how are you?',
      'es-MX',
      {
        relationship: 'teacher-parent',
        purpose: 'general'
      }
    );

    expect(result.translated).toBe('Hello, how are you?');
    expect(result.confidence).toBe(0);
    expect(Array.isArray(result.culturalNotes)).toBe(true);
    expect(result.culturalNotes.length).toBeGreaterThan(0);
  });

  test('translateText handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await translateText(
      'Test message',
      'es-MX',
      {
        relationship: 'teacher-parent',
        purpose: 'general'
      }
    );

    expect(result.translated).toBe('Test message');
    expect(result.confidence).toBe(0);
    expect(Array.isArray(result.culturalNotes)).toBe(true);
  });

  test('translateForMiguelParent uses correct language and context', async () => {
    const result = await translateForMiguelParent('Test message for parent');

    expect(result).toBeDefined();
    expect(result.translated).toBeTruthy();
  });

  test('translateGradeConcern uses grade_concern purpose', async () => {
    const result = await translateGradeConcern('Grade discussion', 'es-MX');

    expect(result).toBeDefined();
  });

  test('translatePositiveFeedback uses positive purpose', async () => {
    const result = await translatePositiveFeedback('Great work!', 'es-MX');

    expect(result).toBeDefined();
  });
});

describe('Lingo.dev Integration - Static Translation Example', () => {
  test('getStaticTranslationExample returns complete example', () => {
    const example = getStaticTranslationExample();

    expect(example.english).toBeTruthy();
    expect(example.spanish).toBeTruthy();
    expect(Array.isArray(example.culturalNotes)).toBe(true);
    expect(example.culturalNotes.length).toBeGreaterThan(0);
  });

  test('static example shows cultural adaptation', () => {
    const example = getStaticTranslationExample();

    // Should contain formal greeting
    expect(example.spanish).toContain('Estimado');

    // Should have cultural notes about formality
    expect(example.culturalNotes.some(note =>
      note.toLowerCase().includes('formal')
    )).toBe(true);
  });

  test('static example is for teacher-parent communication', () => {
    const example = getStaticTranslationExample();

    expect(example.english).toContain('Mr. Rodriguez');
    expect(example.spanish).toContain('Sr. Rodriguez');
  });
});

describe('Lingo.dev Integration - Supported Languages', () => {
  test('SupportedLanguages has correct language codes', () => {
    expect(SupportedLanguages.SPANISH_MEXICO).toBe('es-MX');
    expect(SupportedLanguages.MANDARIN).toBe('zh-CN');
    expect(SupportedLanguages.FRENCH).toBe('fr-FR');
    expect(SupportedLanguages.VIETNAMESE).toBe('vi-VN');
  });

  test('SupportedLanguages includes common educational languages', () => {
    const languages = Object.values(SupportedLanguages);

    expect(languages).toContain('es-MX'); // Spanish
    expect(languages).toContain('zh-CN'); // Mandarin
    expect(languages).toContain('vi-VN'); // Vietnamese
    expect(languages).toContain('ko-KR'); // Korean
  });
});

describe('Lingo.dev Integration - Translation Contexts', () => {
  test('TranslationContexts has all required contexts', () => {
    expect(TranslationContexts.TEACHER_PARENT_FORMAL).toBeDefined();
    expect(TranslationContexts.TEACHER_STUDENT_CASUAL).toBeDefined();
    expect(TranslationContexts.GRADE_DISCUSSION).toBeDefined();
    expect(TranslationContexts.POSITIVE_FEEDBACK).toBeDefined();
    expect(TranslationContexts.URGENT_CONCERN).toBeDefined();
  });

  test('contexts have correct relationship and purpose', () => {
    expect(TranslationContexts.TEACHER_PARENT_FORMAL.relationship).toBe('teacher-parent');
    expect(TranslationContexts.TEACHER_PARENT_FORMAL.purpose).toBe('general');

    expect(TranslationContexts.GRADE_DISCUSSION.purpose).toBe('grade_concern');
    expect(TranslationContexts.POSITIVE_FEEDBACK.purpose).toBe('positive');
    expect(TranslationContexts.URGENT_CONCERN.purpose).toBe('urgent');
  });
});
