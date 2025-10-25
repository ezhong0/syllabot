import { NextResponse } from 'next/server';
import { getStaticTranslationExample } from '@/lib/lingo';

export async function GET() {
  try {
    // Test with static example (doesn't require API call)
    const example = getStaticTranslationExample();

    // Verify the example has the expected structure
    if (!example.english || !example.spanish || !example.culturalNotes) {
      throw new Error('Invalid translation example structure');
    }

    return NextResponse.json({
      success: true,
      message: 'Lingo.dev translation connected! Static example loaded successfully',
      details: {
        languages: ['English', 'Spanish'],
        culturalNotes: example.culturalNotes.length,
        sample: example.spanish.substring(0, 50) + '...'
      }
    });
  } catch (error) {
    console.error('Lingo.dev test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Lingo.dev connection failed'
      },
      { status: 500 }
    );
  }
}
