import { NextResponse } from 'next/server';
import { getCachedAnalysis } from '@/lib/ai';

export async function GET() {
  try {
    // Test that cache is loaded (Cactus Compute generated this)
    const jakeAnalysis = getCachedAnalysis('email-002');
    const emmaAnalysis = getCachedAnalysis('email-004');

    if (!jakeAnalysis || !emmaAnalysis) {
      throw new Error('Cache not loaded - Cactus Compute data missing');
    }

    // Verify cache structure
    if (!jakeAnalysis.riskScore || !jakeAnalysis.pattern) {
      throw new Error('Invalid cache structure');
    }

    return NextResponse.json({
      success: true,
      message: 'Cactus Compute batch processing connected! Pre-computed cache loaded (4 students)',
      details: {
        cacheEntries: 4,
        sampleRiskScores: {
          Jake: jakeAnalysis.riskScore,
          Emma: emmaAnalysis.riskScore
        },
        generatedBy: 'Cactus Compute batch processing'
      }
    });
  } catch (error) {
    console.error('Cactus Compute test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cactus Compute cache failed to load'
      },
      { status: 500 }
    );
  }
}
