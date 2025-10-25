/**
 * s2.dev integration for real-time activity streaming and event logging
 * Provides durable storage and event sourcing capabilities
 */

const S2_API_KEY = process.env.S2_API_KEY;
const S2_BASIN = process.env.S2_BASIN || 'syllabot';
const S2_API_URL = 'https://api.s2.dev/v1';

interface ActivityEvent {
  type: string;
  emailId?: string;
  studentId?: string;
  metadata?: Record<string, any>;
}

interface S2Event {
  timestamp: number;
  type: string;
  emailId?: string;
  studentId?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an activity event to s2.dev stream
 * Fails gracefully - won't break app if s2 is down
 */
export async function logActivity(
  teacherId: string,
  event: ActivityEvent
): Promise<void> {
  // Skip if no API key configured (won't break demo)
  if (!S2_API_KEY) {
    console.log('[s2] No API key configured, skipping:', event.type);
    return;
  }

  const streamName = `teacher-${teacherId}`;

  try {
    const response = await fetch(
      `${S2_API_URL}/basins/${S2_BASIN}/streams/${streamName}/append`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${S2_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: [{
            timestamp: Date.now(),
            ...event
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`s2 API error (${response.status}): ${errorText}`);
    }

    console.log('[s2] ✓ Logged:', event.type);
  } catch (error) {
    // Fail silently - don't break demo if s2 is unavailable
    console.error('[s2] Failed to log activity:', error instanceof Error ? error.message : error);
  }
}

/**
 * Retrieves activity feed for a teacher
 * Returns empty array if s2 is unavailable
 */
export async function getActivityFeed(
  teacherId: string,
  limit = 50
): Promise<S2Event[]> {
  if (!S2_API_KEY) {
    console.log('[s2] No API key configured, returning empty feed');
    return [];
  }

  const streamName = `teacher-${teacherId}`;

  try {
    const response = await fetch(
      `${S2_API_URL}/basins/${S2_BASIN}/streams/${streamName}/read?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${S2_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`s2 API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.events || []) as S2Event[];
  } catch (error) {
    console.error('[s2] Failed to fetch activity feed:', error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Common activity types for logging
 */
export const ActivityTypes = {
  EMAIL_VIEWED: 'email.viewed',
  EMAIL_REPLIED: 'email.replied',
  STUDENT_PANEL_OPENED: 'student.panel.opened',
  RISK_FLAG_DETECTED: 'risk.flag.detected',
  RESPONSE_GENERATED: 'response.generated',
  TRANSLATION_USED: 'translation.used',
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended',
  INTEGRATION_TEST: 'integration.test',
} as const;

/**
 * Generic function to send any event
 * Used for testing and custom events
 */
export async function sendEvent(
  eventType: string,
  data: Record<string, any>
): Promise<void> {
  return logActivity('demo-teacher', {
    type: eventType,
    metadata: data
  });
}

/**
 * Helper function to log email viewed event
 */
export async function logEmailViewed(
  teacherId: string,
  emailId: string,
  studentId: string,
  riskScore?: number
): Promise<void> {
  return logActivity(teacherId, {
    type: ActivityTypes.EMAIL_VIEWED,
    emailId,
    studentId,
    metadata: riskScore !== undefined ? { riskScore } : undefined
  });
}

/**
 * Helper function to log student panel opened
 */
export async function logStudentPanelOpened(
  teacherId: string,
  studentId: string,
  emailId?: string
): Promise<void> {
  return logActivity(teacherId, {
    type: ActivityTypes.STUDENT_PANEL_OPENED,
    studentId,
    emailId,
    metadata: {
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Helper function to log risk flag detection
 */
export async function logRiskFlagDetected(
  teacherId: string,
  studentId: string,
  riskScore: number,
  pattern: string
): Promise<void> {
  return logActivity(teacherId, {
    type: ActivityTypes.RISK_FLAG_DETECTED,
    studentId,
    metadata: {
      riskScore,
      pattern,
      timestamp: new Date().toISOString()
    }
  });
}
