/**
 * Timeline Data Generation Utilities
 * Generated with Random Labs Slate
 *
 * Creates realistic timeline data for engagement visualizations
 */

export interface TimelinePoint {
  date: string;
  score: number;
  status: 'excellent' | 'good' | 'concerning' | 'crisis';
}

/**
 * Generate timeline data points with realistic variance
 * @param startScore - Initial engagement score (0-100)
 * @param endScore - Final engagement score (0-100)
 * @param weeks - Number of weeks to span
 * @param startDate - Optional start date (defaults to 6 weeks ago)
 * @returns Array of timeline data points
 */
export function generateTimeline(
  startScore: number,
  endScore: number,
  weeks: number = 6,
  startDate?: Date
): TimelinePoint[] {
  const points: TimelinePoint[] = [];
  const baseDate = startDate || new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  // Calculate decline rate
  const totalDrop = startScore - endScore;
  const dropPerWeek = totalDrop / weeks;

  for (let week = 0; week <= weeks; week++) {
    // Calculate expected score with realistic variance
    const expectedScore = startScore - (dropPerWeek * week);

    // Add realistic variance (±3% of current score)
    const variance = (Math.random() - 0.5) * expectedScore * 0.06;
    let actualScore = Math.round(expectedScore + variance);

    // Ensure monotonic decline (with small exceptions for realism)
    if (week > 0 && actualScore > points[week - 1].score + 5) {
      actualScore = points[week - 1].score - Math.floor(Math.random() * 3);
    }

    // Clamp to valid range
    actualScore = Math.max(0, Math.min(100, actualScore));

    // Calculate date
    const pointDate = new Date(baseDate);
    pointDate.setDate(pointDate.getDate() + (week * 7));

    // Format date as "Oct 15"
    const dateStr = pointDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    // Determine status based on score
    const status = getStatusFromScore(actualScore);

    points.push({
      date: dateStr,
      score: actualScore,
      status
    });
  }

  return points;
}

/**
 * Determine engagement status from score
 * @param score - Engagement score (0-100)
 * @returns Status level
 */
function getStatusFromScore(score: number): 'excellent' | 'good' | 'concerning' | 'crisis' {
  if (score >= 85) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 40) return 'concerning';
  return 'crisis';
}

/**
 * Get color for timeline status
 * @param status - Timeline status
 * @returns Tailwind color class
 */
export function getTimelineColor(status: 'excellent' | 'good' | 'concerning' | 'crisis'): string {
  switch (status) {
    case 'excellent': return 'bg-green-500';
    case 'good': return 'bg-blue-500';
    case 'concerning': return 'bg-yellow-500';
    case 'crisis': return 'bg-red-600';
  }
}

/**
 * Calculate trend direction from timeline
 * @param timeline - Array of timeline points
 * @returns Trend direction and percentage change
 */
export function calculateTrend(timeline: TimelinePoint[]): {
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  label: string;
} {
  if (timeline.length < 2) {
    return { direction: 'stable', changePercent: 0, label: 'No data' };
  }

  const firstScore = timeline[0].score;
  const lastScore = timeline[timeline.length - 1].score;
  const change = lastScore - firstScore;
  const changePercent = Math.round((change / firstScore) * 100);

  if (Math.abs(changePercent) < 5) {
    return { direction: 'stable', changePercent, label: 'Stable' };
  }

  if (change > 0) {
    return { direction: 'up', changePercent, label: `Up ${changePercent}%` };
  }

  return { direction: 'down', changePercent, label: `Down ${Math.abs(changePercent)}%` };
}
