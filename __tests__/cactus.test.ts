/**
 * Unit Tests for Cactus Compute Integration
 * Tests performance tracking and mobile-readiness calculations
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  trackPerformance,
  calculateMobileReadiness,
  logMobileReadiness,
  MOBILE_FEATURES_STATUS
} from '../src/lib/cactus';

describe('Cactus Compute - Performance Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test('trackPerformance logs locally even without API key', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    await trackPerformance({
      feature: 'test-feature',
      latency: 50,
      tokenCount: 500,
      mobileReady: true
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Cactus] Performance: test-feature - 50ms'),
      expect.stringContaining('Mobile-ready')
    );
  });

  test('trackPerformance handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Should not throw
    await expect(trackPerformance({
      feature: 'test',
      latency: 100,
      mobileReady: false
    })).resolves.not.toThrow();
  });

  test('trackPerformance shows warning for non-mobile-ready features', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    await trackPerformance({
      feature: 'slow-feature',
      latency: 500,
      tokenCount: 1000,
      mobileReady: false
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Cactus] Performance: slow-feature - 500ms'),
      expect.stringContaining('Needs optimization')
    );
  });
});

describe('Cactus Compute - Mobile Readiness Calculation', () => {
  test('calculateMobileReadiness returns high score for optimal conditions', () => {
    const result = calculateMobileReadiness(500, 40);

    expect(result.score).toBeGreaterThan(80);
    expect(result.feature).toBe('email-analysis');
    expect(result.factors.latencyTarget).toBe(50);
    expect(result.factors.offlineCapable).toBe(true);
  });

  test('calculateMobileReadiness penalizes high latency', () => {
    const result = calculateMobileReadiness(500, 200);

    expect(result.score).toBeLessThan(80);
    expect(result.factors.promptSize).toBe(500);
  });

  test('calculateMobileReadiness penalizes large prompts', () => {
    const result = calculateMobileReadiness(3000, 50);

    expect(result.score).toBeLessThan(80);
    expect(result.factors.offlineCapable).toBe(false);
  });

  test('calculateMobileReadiness handles edge cases', () => {
    // Perfect conditions
    const perfect = calculateMobileReadiness(500, 30);
    expect(perfect.score).toBe(100);

    // Worst conditions
    const worst = calculateMobileReadiness(5000, 500);
    expect(worst.score).toBeLessThan(50);
  });

  test('calculateMobileReadiness marks features as offline-capable under 2K tokens', () => {
    const small = calculateMobileReadiness(1500, 100);
    expect(small.factors.offlineCapable).toBe(true);

    const large = calculateMobileReadiness(2500, 100);
    expect(large.factors.offlineCapable).toBe(false);
  });
});

describe('Cactus Compute - Mobile Readiness Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('logMobileReadiness reports high-scoring features positively', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    await logMobileReadiness('fast-feature', true, {
      latency: 40,
      tokens: 500
    });

    // Verify it was called with mobile-ready message
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.flat().join(' ');
    expect(calls).toContain('fast-feature');
    expect(calls).toContain('mobile-ready');
  });

  test('logMobileReadiness warns about low-scoring features', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    await logMobileReadiness('slow-feature', false, {
      latency: 300,
      tokens: 3000
    });

    // Verify it was called with optimization message
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls.flat().join(' ');
    expect(calls).toContain('slow-feature');
    expect(calls).toContain('optimization');
  });
});

describe('Cactus Compute - Mobile Features Status', () => {
  test('MOBILE_FEATURES_STATUS has correct structure', () => {
    expect(MOBILE_FEATURES_STATUS).toBeDefined();
    expect(Object.keys(MOBILE_FEATURES_STATUS)).toHaveLength(4);

    // Check each feature has required properties
    Object.values(MOBILE_FEATURES_STATUS).forEach(feature => {
      expect(feature).toHaveProperty('ready');
      expect(feature).toHaveProperty('cactusMobileLatency');
      expect(typeof feature.ready).toBe('boolean');
      expect(typeof feature.cactusMobileLatency).toBe('string');
    });
  });

  test('Risk Scoring is marked as mobile-ready', () => {
    expect(MOBILE_FEATURES_STATUS['Risk Scoring'].ready).toBe(true);
    expect(MOBILE_FEATURES_STATUS['Risk Scoring'].cactusMobileLatency).toBe('<50ms');
  });

  test('Response Generation is marked as not mobile-ready', () => {
    expect(MOBILE_FEATURES_STATUS['Response Generation'].ready).toBe(false);
    expect(MOBILE_FEATURES_STATUS['Response Generation'].cactusMobileLatency).toContain('200ms+');
  });
});
