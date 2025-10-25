import { NextResponse } from 'next/server';
import { sendEvent, ActivityTypes } from '@/lib/s2';

export async function GET() {
  try {
    const testEvent = {
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      metadata: {
        test: true,
        source: 'integration-test'
      }
    };

    await sendEvent(ActivityTypes.INTEGRATION_TEST, testEvent);

    return NextResponse.json({
      success: true,
      message: 's2.dev event streaming connected! Test event sent successfully',
      details: {
        eventType: ActivityTypes.INTEGRATION_TEST,
        timestamp: testEvent.timestamp
      }
    });
  } catch (error) {
    console.error('s2.dev test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 's2.dev connection failed'
      },
      { status: 500 }
    );
  }
}
