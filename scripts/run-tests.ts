#!/usr/bin/env tsx

/**
 * Simple Test Runner
 * Runs all unit tests without requiring Jest/Vitest installation
 *
 * Run: npx tsx scripts/run-tests.ts
 */

import { DEMO_INBOX, STUDENTS, JAKE, SARAH, MIGUEL, EMMA } from '../src/data/demo-emails';
import { detectPatterns, generateResponseStrategies, getCachedAnalysis } from '../src/lib/ai';
import { ActivityTypes } from '../src/lib/s2';
import { SupportedLanguages, TranslationContexts, getStaticTranslationExample } from '../src/lib/lingo';

// Test framework
let testsPassed = 0;
let testsFailed = 0;
let currentSuite = '';

function describe(suiteName: string, tests: () => void | Promise<void>) {
  currentSuite = suiteName;
  console.log(`\n📦 ${suiteName}`);
  return tests();
}

function test(testName: string, testFn: () => void | Promise<void>) {
  try {
    const result = testFn();
    if (result instanceof Promise) {
      return result.then(() => {
        console.log(`  ✅ ${testName}`);
        testsPassed++;
      }).catch((error) => {
        console.log(`  ❌ ${testName}`);
        console.log(`     Error: ${error.message}`);
        testsFailed++;
      });
    } else {
      console.log(`  ✅ ${testName}`);
      testsPassed++;
    }
  } catch (error) {
    console.log(`  ❌ ${testName}`);
    console.log(`     Error: ${error instanceof Error ? error.message : String(error)}`);
    testsFailed++;
  }
}

function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toBeDefined() {
      if (value === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (value < expected) {
        throw new Error(`Expected ${value} to be >= ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (value >= expected) {
        throw new Error(`Expected ${value} to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (value > expected) {
        throw new Error(`Expected ${value} to be <= ${expected}`);
      }
    },
    toContain(expected: any) {
      if (Array.isArray(value)) {
        if (!value.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      } else if (typeof value === 'string') {
        if (!value.includes(expected)) {
          throw new Error(`Expected string to contain ${expected}`);
        }
      } else {
        throw new Error(`Cannot check if ${typeof value} contains ${expected}`);
      }
    },
    toHaveLength(expected: number) {
      if (value.length !== expected) {
        throw new Error(`Expected length ${value.length} to be ${expected}`);
      }
    },
    toBeInstanceOf(expected: any) {
      if (!(value instanceof expected)) {
        throw new Error(`Expected ${value} to be instance of ${expected.name}`);
      }
    },
    toMatch(pattern: RegExp) {
      if (!pattern.test(value)) {
        throw new Error(`Expected ${value} to match ${pattern}`);
      }
    },
    toBeTruthy() {
      if (!value) {
        throw new Error(`Expected ${value} to be truthy`);
      }
    },
    not: {
      toContain(expected: any) {
        if (Array.isArray(value) && value.includes(expected)) {
          throw new Error(`Expected array not to contain ${expected}`);
        } else if (typeof value === 'string' && value.includes(expected)) {
          throw new Error(`Expected string not to contain ${expected}`);
        }
      },
      toBeUndefined() {
        if (value === undefined) {
          throw new Error(`Expected value not to be undefined`);
        }
      }
    }
  };
}

// ============================================================================
// Test Suites
// ============================================================================

async function runAllTests() {
  console.log('🧪 SyllaBot Unit Tests');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Data Tests
  describe('Demo Data - Student Profiles', () => {
    test('JAKE profile is complete', () => {
      expect(JAKE).toBeDefined();
      expect(JAKE.id).toBe('jake-martinez');
      expect(JAKE.name).toBe('Jake Martinez');
      expect(JAKE.grade).toBe(11);
    });

    test('JAKE has valid baseline data', () => {
      expect(JAKE.baseline.attendanceRate).toBe(0.98);
      expect(JAKE.baseline.avgGrade).toBe(91);
      expect(JAKE.baseline.avgWordCount).toBe(45);
    });

    test('JAKE has 8 interactions', () => {
      expect(JAKE.interactions).toHaveLength(8);
    });

    test('JAKE has 3 red flags', () => {
      expect(JAKE.redFlags).toHaveLength(3);
      const attendanceFlag = JAKE.redFlags.find(f => f.type === 'attendance');
      expect(attendanceFlag).toBeDefined();
      expect(attendanceFlag?.severity).toBe('high');
    });

    test('SARAH and MIGUEL profiles exist', () => {
      expect(SARAH).toBeDefined();
      expect(MIGUEL).toBeDefined();
      expect(SARAH.id).toBe('sarah-chen');
      expect(MIGUEL.id).toBe('miguel-rodriguez');
    });

    test('EMMA profile exists', () => {
      expect(EMMA).toBeDefined();
      expect(EMMA.id).toBe('emma-johnson');
      expect(EMMA.name).toBe('Emma Johnson');
      expect(EMMA.aiInsight.pattern).toBe('Normal Behavior');
    });
  });

  describe('Demo Data - Email Inbox', () => {
    test('DEMO_INBOX has 4 emails', () => {
      expect(DEMO_INBOX).toHaveLength(4);
    });

    test('All emails have required fields', () => {
      DEMO_INBOX.forEach(email => {
        expect(email.id).toBeDefined();
        expect(email.studentId).toBeDefined();
        expect(email.wordCount).toBeGreaterThan(0);
      });
    });

    test('Jake\'s email is brief', () => {
      const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez');
      expect(jakeEmail).toBeDefined();
      expect(jakeEmail?.wordCount).toBe(8);
    });
  });

  describe('Demo Data - Student Map', () => {
    test('STUDENTS map has all 4 students', () => {
      expect(Object.keys(STUDENTS)).toHaveLength(4);
      expect(STUDENTS['jake-martinez']).toBe(JAKE);
      expect(STUDENTS['emma-johnson']).toBe(EMMA);
    });
  });

  // Integration Tests
  describe('AI Integration - Pattern Detection', async () => {
    const jakeEmail = DEMO_INBOX.find(e => e.studentId === 'jake-martinez')!;

    await test('detectPatterns identifies attendance decline', async () => {
      const patterns = await detectPatterns(jakeEmail, JAKE);
      expect(patterns).toContain('Attendance Decline');
    });

    await test('detectPatterns identifies communication withdrawal', async () => {
      const patterns = await detectPatterns(jakeEmail, JAKE);
      expect(patterns).toContain('Communication Withdrawal');
    });
  });

  describe('AI Integration - Response Strategies', async () => {
    await test('High risk gets immediate action recommendation', async () => {
      const highRiskAnalysis = {
        riskScore: 8,
        pattern: 'Test',
        confidence: 89,
        hiddenMeaning: 'Test',
        evidence: [],
        recommendation: 'Test'
      };
      const strategies = await generateResponseStrategies(
        DEMO_INBOX[1],
        highRiskAnalysis,
        JAKE
      );
      expect(strategies).toContain('Immediate warm check-in - show you notice');
    });

    await test('Low risk gets standard response', async () => {
      const lowRiskAnalysis = {
        riskScore: 2,
        pattern: 'Test',
        confidence: 95,
        hiddenMeaning: 'Test',
        evidence: [],
        recommendation: 'Test'
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
      expect(ActivityTypes.STUDENT_PANEL_OPENED).toBe('student.panel.opened');
      expect(ActivityTypes.RISK_FLAG_DETECTED).toBe('risk.flag.detected');
    });
  });

  describe('Lingo Integration - Languages', () => {
    test('SupportedLanguages includes major languages', () => {
      expect(SupportedLanguages.SPANISH_MEXICO).toBe('es-MX');
      expect(SupportedLanguages.MANDARIN).toBe('zh-CN');
      expect(SupportedLanguages.FRENCH).toBe('fr-FR');
    });

    test('Language codes follow ISO format', () => {
      Object.values(SupportedLanguages).forEach(code => {
        expect(code).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      });
    });
  });

  describe('Lingo Integration - Static Example', () => {
    test('Static example is complete', () => {
      const example = getStaticTranslationExample();
      expect(example.english).toBeDefined();
      expect(example.spanish).toBeDefined();
      expect(example.culturalNotes.length).toBeGreaterThan(0);
    });

    test('Static example uses formal Spanish', () => {
      const example = getStaticTranslationExample();
      expect(example.spanish).toContain('Estimado');
      expect(example.spanish).toContain('Atentamente');
    });
  });

  describe('Data Validation', () => {
    test('All students have valid baselines', () => {
      [JAKE, SARAH, MIGUEL].forEach(student => {
        expect(student.baseline.attendanceRate).toBeGreaterThanOrEqual(0);
        expect(student.baseline.attendanceRate).toBeLessThanOrEqual(1);
        expect(student.baseline.avgGrade).toBeGreaterThanOrEqual(0);
        expect(student.baseline.avgGrade).toBeLessThanOrEqual(100);
      });
    });

    test('All red flags have valid severity', () => {
      [JAKE, SARAH, MIGUEL].forEach(student => {
        student.redFlags.forEach(flag => {
          expect(['high', 'medium', 'low']).toContain(flag.severity);
        });
      });
    });

    test('All AI insights have valid confidence', () => {
      [JAKE, SARAH, MIGUEL].forEach(student => {
        expect(student.aiInsight.confidence).toBeGreaterThanOrEqual(0);
        expect(student.aiInsight.confidence).toBeLessThanOrEqual(100);
      });
    });
  });

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total:  ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('✅ Phase 1 implementation verified');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${testsFailed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
