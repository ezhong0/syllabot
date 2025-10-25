import { NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/ai';

export async function GET() {
  try {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Respond with exactly: "SyllaBot integration test successful"'
      }]
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return NextResponse.json({
      success: true,
      message: `Claude 3.7 Sonnet connected! Response: "${text.trim()}"`,
      details: {
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    console.error('Claude test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Claude API connection failed'
      },
      { status: 500 }
    );
  }
}
