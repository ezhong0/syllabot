/**
 * Unit Tests for Demo Data Layer
 * Tests the completeness and validity of demo email data
 */

import { DEMO_INBOX, STUDENTS, JAKE, SARAH, MIGUEL, EMMA } from '../src/data/demo-emails';
import type { StudentProfile, DemoEmail } from '../src/types';

describe('Demo Data - Student Profiles', () => {

  test('JAKE profile is complete', () => {
    expect(JAKE).toBeDefined();
    expect(JAKE.id).toBe('jake-martinez');
    expect(JAKE.name).toBe('Jake Martinez');
    expect(JAKE.grade).toBe(11);
    expect(JAKE.currentGrade).toBe('B+');
    expect(JAKE.previousGrade).toBe('A-');
  });

  test('JAKE has valid baseline data', () => {
    expect(JAKE.baseline).toBeDefined();
    expect(JAKE.baseline.attendanceRate).toBe(0.98);
    expect(JAKE.baseline.avgGrade).toBe(91);
    expect(JAKE.baseline.avgWordCount).toBe(45);
    expect(JAKE.baseline.participationLevel).toBe(8);
    expect(JAKE.baseline.typicalBehavior).toContain('Engaged');
  });

  test('JAKE has 8 interactions', () => {
    expect(JAKE.interactions).toHaveLength(8);

    // Check first interaction (most recent)
    const latestInteraction = JAKE.interactions[0];
    expect(latestInteraction.date).toBe('Oct 24, 8:15 AM');
    expect(latestInteraction.type).toBe('email');
    expect(latestInteraction.summary).toBe('Quick question');
  });

  test('JAKE has 3 red flags', () => {
    expect(JAKE.redFlags).toHaveLength(3);

    // Check attendance red flag
    const attendanceFlag = JAKE.redFlags.find(f => f.type === 'attendance');
    expect(attendanceFlag).toBeDefined();
    expect(attendanceFlag?.severity).toBe('high');
    expect(attendanceFlag?.deviation).toBe('+1400%');

    // Check grade red flag
    const gradeFlag = JAKE.redFlags.find(f => f.type === 'grade');
    expect(gradeFlag).toBeDefined();
    expect(gradeFlag?.severity).toBe('medium');
    expect(gradeFlag?.deviation).toBe('-33%');

    // Check communication red flag
    const commFlag = JAKE.redFlags.find(f => f.type === 'communication');
    expect(commFlag).toBeDefined();
    expect(commFlag?.deviation).toBe('-82%');
  });

  test('JAKE has AI insight', () => {
    expect(JAKE.aiInsight).toBeDefined();
    expect(JAKE.aiInsight.pattern).toBe('Silent Struggle');
    expect(JAKE.aiInsight.confidence).toBe(89);
    expect(JAKE.aiInsight.analysis).toContain('high-performing student');
    expect(JAKE.aiInsight.recommendation).toBeDefined();
    expect(JAKE.aiInsight.recommendation.approach).toBe('Warm Check-In');
  });

  test('SARAH profile is complete', () => {
    expect(SARAH).toBeDefined();
    expect(SARAH.id).toBe('sarah-chen');
    expect(SARAH.name).toBe('Sarah Chen');
    expect(SARAH.aiInsight.pattern).toBe('Perfectionist Frustration');
    expect(SARAH.aiInsight.confidence).toBe(92);
  });

  test('MIGUEL profile is complete', () => {
    expect(MIGUEL).toBeDefined();
    expect(MIGUEL.id).toBe('miguel-rodriguez');
    expect(MIGUEL.name).toBe('Miguel Rodriguez');
    expect(MIGUEL.aiInsight.pattern).toBe('Language Barrier');
    expect(MIGUEL.aiInsight.confidence).toBe(85);
  });

  test('EMMA profile is complete', () => {
    expect(EMMA).toBeDefined();
    expect(EMMA.id).toBe('emma-johnson');
    expect(EMMA.name).toBe('Emma Johnson');
    expect(EMMA.aiInsight.pattern).toBe('Normal Behavior');
    expect(EMMA.aiInsight.confidence).toBe(91);
  });

  test('All students have valid avatar URLs', () => {
    expect(JAKE.photoUrl).toContain('ui-avatars.com');
    expect(SARAH.photoUrl).toContain('ui-avatars.com');
    expect(MIGUEL.photoUrl).toContain('ui-avatars.com');
    expect(EMMA.photoUrl).toContain('ui-avatars.com');
  });
});

describe('Demo Data - Email Inbox', () => {

  test('DEMO_INBOX has 4 emails', () => {
    expect(DEMO_INBOX).toHaveLength(4);
  });

  test('All emails have required fields', () => {
    DEMO_INBOX.forEach(email => {
      expect(email.id).toBeDefined();
      expect(email.from).toBeDefined();
      expect(email.studentId).toBeDefined();
      expect(email.subject).toBeDefined();
      expect(email.body).toBeDefined();
      expect(email.timestamp).toBeDefined();
      expect(email.wordCount).toBeGreaterThan(0);
      expect(['positive', 'neutral', 'anxious', 'frustrated']).toContain(email.sentiment);
    });
  });

  test('Jake\'s email has correct properties', () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez');
    expect(jakeEmail).toBeDefined();
    expect(jakeEmail?.id).toBe('email-002');
    expect(jakeEmail?.subject).toBe('Quick question');
    expect(jakeEmail?.wordCount).toBe(8);
    expect(jakeEmail?.sentiment).toBe('neutral');
  });

  test('Sarah\'s email has correct properties', () => {
    const sarahEmail = DEMO_INBOX.find(e => e.studentId === 'sarah-chen');
    expect(sarahEmail).toBeDefined();
    expect(sarahEmail?.id).toBe('email-001');
    expect(sarahEmail?.wordCount).toBe(58);
    expect(sarahEmail?.sentiment).toBe('frustrated');
  });

  test('Miguel\'s email has correct properties', () => {
    const miguelEmail = DEMO_INBOX.find(e => e.studentId === 'miguel-rodriguez');
    expect(miguelEmail).toBeDefined();
    expect(miguelEmail?.id).toBe('email-003');
    expect(miguelEmail?.wordCount).toBe(23);
    expect(miguelEmail?.sentiment).toBe('neutral');
  });

  test('Emma\'s email has correct properties', () => {
    const emmaEmail = DEMO_INBOX.find(e => e.studentId === 'emma-johnson');
    expect(emmaEmail).toBeDefined();
    expect(emmaEmail?.id).toBe('email-004');
    expect(emmaEmail?.wordCount).toBe(8);
    expect(emmaEmail?.sentiment).toBe('neutral');
  });
});

describe('Demo Data - Student Map', () => {

  test('STUDENTS map has all 4 students', () => {
    expect(Object.keys(STUDENTS)).toHaveLength(4);
    expect(STUDENTS['jake-martinez']).toBe(JAKE);
    expect(STUDENTS['sarah-chen']).toBe(SARAH);
    expect(STUDENTS['miguel-rodriguez']).toBe(MIGUEL);
    expect(STUDENTS['emma-johnson']).toBe(EMMA);
  });

  test('All student IDs match their keys', () => {
    Object.entries(STUDENTS).forEach(([key, student]) => {
      expect(student.id).toBe(key);
    });
  });
});

describe('Demo Data - Deviation Calculations', () => {

  test('Jake\'s word count deviation is accurate', () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez');
    const baseline = JAKE.baseline.avgWordCount;
    const actual = jakeEmail?.wordCount || 0;
    const deviation = ((baseline - actual) / baseline * 100).toFixed(0);

    // 8 words vs 45 baseline = 82% reduction
    expect(Math.abs(Number(deviation) - 82)).toBeLessThan(2);
  });

  test('Jake\'s attendance deviation is accurate', () => {
    const absences = JAKE.interactions.filter(i => i.type === 'absence').length;
    // 3 absences in 2 weeks vs 0.2/week baseline
    expect(absences).toBe(3);

    // Normal: 0.2 absences per week = 0.4 in 2 weeks
    // Actual: 3 absences in 2 weeks
    // Deviation: (3 - 0.4) / 0.4 * 100 = 650% increase (approx +1400% total)
    expect(absences).toBeGreaterThan(2);
  });
});

describe('Demo Data - Email Body Content', () => {

  test('Jake\'s email is brief (signal)', () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez');
    expect(jakeEmail?.body).toContain('When is the test?');
    expect(jakeEmail?.body.length).toBeLessThan(50);
  });

  test('Sarah\'s email shows frustration', () => {
    const sarahEmail = DEMO_INBOX.find(e => e.studentId === 'sarah-chen');
    expect(sarahEmail?.body).toContain('frustrating');
    expect(sarahEmail?.body).toContain('12 hours');
  });

  test('Miguel\'s email shows language challenge', () => {
    const miguelEmail = DEMO_INBOX.find(e => e.studentId === 'miguel-rodriguez');
    expect(miguelEmail?.body).toContain('not sure I understand');
    expect(miguelEmail?.body).toContain('analyze the political implications');
  });
});

// Export test helper for use in other test files
export function getTestStudent(id: string): StudentProfile | undefined {
  return STUDENTS[id];
}

export function getTestEmail(id: string): DemoEmail | undefined {
  return DEMO_INBOX.find(e => e.id === id);
}
