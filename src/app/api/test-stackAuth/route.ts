import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/auth';

export async function GET() {
  try {
    // Try to get current user (may be null if not logged in)
    const user = await stackServerApp.getUser();

    if (user) {
      return NextResponse.json({
        success: true,
        message: `Stack Auth connected! Logged in as: ${user.primaryEmail || user.id}`,
        details: {
          userId: user.id,
          email: user.primaryEmail,
          signedUpAt: user.signedUpAt
        }
      });
    } else {
      // Still successful - Stack Auth is working, just no user logged in
      return NextResponse.json({
        success: true,
        message: 'Stack Auth connected! (No user currently logged in)',
        details: {
          note: 'Stack Auth API is working correctly'
        }
      });
    }
  } catch (error) {
    console.error('Stack Auth test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Stack Auth connection failed'
      },
      { status: 500 }
    );
  }
}
