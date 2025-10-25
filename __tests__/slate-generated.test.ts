/**
 * Unit Tests for Slate-Generated Components
 * Tests utilities generated with Random Labs Slate
 */

import { describe, test, expect } from 'vitest';
import {
  getRiskScoreBadge,
  getRiskColor,
  getRiskLevel
} from '../src/lib/slate-generated/risk-badge';
import {
  generateTimeline,
  getTimelineColor,
  calculateTrend
} from '../src/lib/slate-generated/timeline-utils';

describe('Slate Generated - Risk Badge Utilities', () => {
  test('getRiskScoreBadge returns red badge for high risk (7-10)', () => {
    const badge = getRiskScoreBadge(8);

    expect(badge.label).toBe('High Risk');
    expect(badge.icon).toBe('🚨');
    expect(badge.color).toContain('red');
    expect(badge.bgColor).toContain('red');
    expect(badge.borderColor).toContain('red');
  });

  test('getRiskScoreBadge returns amber badge for medium risk (4-6)', () => {
    const badge = getRiskScoreBadge(5);

    expect(badge.label).toBe('Medium Risk');
    expect(badge.icon).toBe('⚠️');
    expect(badge.color).toContain('amber');
    expect(badge.bgColor).toContain('amber');
  });

  test('getRiskScoreBadge returns green badge for low risk (0-3)', () => {
    const badge = getRiskScoreBadge(2);

    expect(badge.label).toBe('Low Risk');
    expect(badge.icon).toBe('✅');
    expect(badge.color).toContain('green');
    expect(badge.bgColor).toContain('green');
  });

  test('getRiskScoreBadge handles edge cases', () => {
    const zero = getRiskScoreBadge(0);
    expect(zero.label).toBe('Low Risk');

    const ten = getRiskScoreBadge(10);
    expect(ten.label).toBe('High Risk');

    const boundary = getRiskScoreBadge(7);
    expect(boundary.label).toBe('High Risk');
  });

  test('getRiskScoreBadge normalizes scores outside 0-10 range', () => {
    const negative = getRiskScoreBadge(-5);
    expect(negative.label).toBe('Low Risk');

    const tooHigh = getRiskScoreBadge(15);
    expect(tooHigh.label).toBe('High Risk');
  });

  test('getRiskColor returns correct Tailwind classes', () => {
    expect(getRiskColor(8)).toBe('text-red-600');
    expect(getRiskColor(5)).toBe('text-amber-600');
    expect(getRiskColor(2)).toBe('text-green-600');
  });

  test('getRiskLevel returns correct level strings', () => {
    expect(getRiskLevel(8)).toBe('High');
    expect(getRiskLevel(5)).toBe('Medium');
    expect(getRiskLevel(2)).toBe('Low');
  });
});

describe('Slate Generated - Timeline Utilities', () => {
  test('generateTimeline creates correct number of points', () => {
    const timeline = generateTimeline(95, 12, 6);

    expect(timeline).toHaveLength(7); // 6 weeks + start point
  });

  test('generateTimeline shows declining trend', () => {
    const timeline = generateTimeline(95, 12, 6);

    const firstScore = timeline[0].score;
    const lastScore = timeline[timeline.length - 1].score;

    expect(firstScore).toBeGreaterThan(lastScore);
    expect(lastScore).toBeLessThan(20);
  });

  test('generateTimeline includes all required fields', () => {
    const timeline = generateTimeline(95, 12, 6);

    timeline.forEach(point => {
      expect(point).toHaveProperty('date');
      expect(point).toHaveProperty('score');
      expect(point).toHaveProperty('status');
      expect(typeof point.date).toBe('string');
      expect(typeof point.score).toBe('number');
      expect(['excellent', 'good', 'concerning', 'crisis']).toContain(point.status);
    });
  });

  test('generateTimeline sets correct status based on score', () => {
    const timeline = generateTimeline(95, 12, 6);

    const firstPoint = timeline[0];
    const lastPoint = timeline[timeline.length - 1];

    // First point (high score) should be excellent
    expect(firstPoint.status).toBe('excellent');

    // Last point (low score) should be crisis
    expect(lastPoint.status).toBe('crisis');
  });

  test('generateTimeline handles small ranges', () => {
    const timeline = generateTimeline(50, 45, 2);

    expect(timeline).toHaveLength(3);
    expect(timeline[0].score).toBeGreaterThan(timeline[2].score);
  });

  test('generateTimeline clamps scores to 0-100', () => {
    const timeline = generateTimeline(100, 0, 10);

    timeline.forEach(point => {
      expect(point.score).toBeGreaterThanOrEqual(0);
      expect(point.score).toBeLessThanOrEqual(100);
    });
  });

  test('getTimelineColor returns correct Tailwind classes', () => {
    expect(getTimelineColor('excellent')).toBe('bg-green-500');
    expect(getTimelineColor('good')).toBe('bg-blue-500');
    expect(getTimelineColor('concerning')).toBe('bg-yellow-500');
    expect(getTimelineColor('crisis')).toBe('bg-red-600');
  });

  test('calculateTrend identifies downward trend', () => {
    const timeline = generateTimeline(95, 12, 6);
    const trend = calculateTrend(timeline);

    expect(trend.direction).toBe('down');
    expect(trend.changePercent).toBeLessThan(0);
    expect(trend.label).toContain('Down');
  });

  test('calculateTrend identifies upward trend', () => {
    // Create manual upward timeline since generateTimeline adds variance
    const timeline = [
      { date: 'Oct 1', score: 20, status: 'crisis' as const },
      { date: 'Oct 8', score: 90, status: 'excellent' as const }
    ];
    const trend = calculateTrend(timeline);

    expect(trend.direction).toBe('up');
    expect(trend.changePercent).toBeGreaterThan(0);
    expect(trend.label).toContain('Up');
  });

  test('calculateTrend identifies stable pattern', () => {
    const stableTimeline = [
      { date: 'Oct 1', score: 50, status: 'good' as const },
      { date: 'Oct 8', score: 52, status: 'good' as const }
    ];

    const trend = calculateTrend(stableTimeline);

    expect(trend.direction).toBe('stable');
    expect(Math.abs(trend.changePercent)).toBeLessThan(5);
  });

  test('calculateTrend handles empty timeline', () => {
    const trend = calculateTrend([]);

    expect(trend.direction).toBe('stable');
    expect(trend.changePercent).toBe(0);
    expect(trend.label).toBe('No data');
  });
});

describe('Slate Generated - Integration with Demo Data', () => {
  test('Risk badges match student risk profiles', () => {
    // Jake: high risk
    const jakeBadge = getRiskScoreBadge(7);
    expect(jakeBadge.label).toBe('High Risk');

    // Sarah: high risk
    const sarahBadge = getRiskScoreBadge(7);
    expect(sarahBadge.label).toBe('High Risk');

    // Miguel: medium risk
    const miguelBadge = getRiskScoreBadge(3);
    expect(miguelBadge.label).toBe('Low Risk');

    // Emma: low risk
    const emmaBadge = getRiskScoreBadge(1);
    expect(emmaBadge.label).toBe('Low Risk');
  });

  test('Timeline generation matches Jake\'s decline pattern', () => {
    // Jake: 95 → 12 over 6 weeks
    const timeline = generateTimeline(95, 12, 6);

    expect(timeline[0].score).toBeGreaterThan(90);
    expect(timeline[timeline.length - 1].score).toBeLessThan(15);
  });
});
