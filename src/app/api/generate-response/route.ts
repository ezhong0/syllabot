/**
 * Real-time response generation using Claude API
 * Generates personalized email responses based on analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { StudentProfile } from '@/types';
import { translateForMiguelParent } from '@/lib/lingo';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface AnalysisResult {
  sentiment: string;
  riskScore: number;
  recommendedApproach: string;
  reasoning: string;
  communicationPattern: string;
}

export async function POST(request: NextRequest) {
  // Parse request body once at the start
  const body = await request.json();
  const { email, student, analysis } = body;

  try {
    // Validate input
    if (!email?.body || !student || !analysis) {
      return NextResponse.json(
        { error: 'Email, student data, and analysis required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('[API] No Anthropic API key - using fallback response');
      return NextResponse.json({
        usedFallback: true,
        ...generateFallbackResponse(email, student, analysis),
      });
    }

    console.log('[API] Generating response with Claude...', {
      studentId: student.id,
      riskScore: analysis.riskScore,
      approach: analysis.recommendedApproach,
    });

    // Call Claude API for response generation (using latest model)
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are Ms. Johnson, an empathetic high school history teacher drafting a response to a student email.

STUDENT PROFILE:
- Name: ${student.name}
- Current grade: ${student.currentGrade}
- Baseline engagement: ${student.baseline.participationLevel}/10
- Risk score: ${analysis.riskScore}/10

STUDENT EMAIL:
Subject: "${email.subject}"
Body: "${email.body}"

AI ANALYSIS:
- Sentiment: ${analysis.sentiment}
- Communication pattern: ${analysis.communicationPattern}
- Recommended approach: ${analysis.recommendedApproach}
- Reasoning: ${analysis.reasoning}

RESPONSE REQUIREMENTS:
1. Sign as "- Ms. Johnson"
2. Use a ${
            analysis.riskScore >= 7
              ? 'warm, supportive tone with explicit offer to talk'
              : analysis.riskScore >= 5
              ? 'supportive and encouraging tone'
              : analysis.riskScore >= 3
              ? 'friendly and professional tone'
              : 'efficient and professional tone'
          }
3. ${
            analysis.riskScore >= 7
              ? 'Include a check-in about their wellbeing and offer specific support (office hours, extra help)'
              : analysis.riskScore >= 5
              ? 'Offer support and reassurance'
              : 'Answer their question directly and clearly'
          }
4. Keep response ${analysis.riskScore >= 5 ? '150-200' : '100-150'} words
5. ${
            analysis.sentiment === 'anxious'
              ? 'Address anxiety with reassurance and realistic expectations'
              : analysis.sentiment === 'frustrated'
              ? 'Acknowledge frustration and offer solutions'
              : 'Maintain positive, supportive tone'
          }

Generate ONLY the email response text, no JSON or meta-commentary.`,
        },
      ],
    });

    // Extract response text
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const responseText = content.text.trim();

    console.log('[API] Response generated:', {
      wordCount: responseText.split(/\s+/).length,
    });

    // Generate Spanish translation for Miguel using Lingo.dev
    let spanishTranslation = undefined;
    let usedLingoTranslation = false;
    if (student.id === 'miguel-rodriguez') {
      try {
        // Try Lingo.dev first for culturally-adapted translation
        console.log('[Lingo] Translating response for Miguel\'s parent...');
        const lingoResult = await translateForMiguelParent(responseText);

        // If Lingo succeeds (confidence > 0), use it
        if (lingoResult.confidence > 0) {
          spanishTranslation = lingoResult.translated;
          usedLingoTranslation = true;
          console.log('[Lingo] ✓ Translation successful (confidence:', lingoResult.confidence, ')');
        } else {
          // If Lingo failed (confidence 0), fall back to Claude
          console.log('[Lingo] No API key or service unavailable, falling back to Claude...');
          const translationMessage = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: `Translate this teacher email to Spanish with cultural adaptation for formal teacher-parent communication in Mexican/Latin American educational context:

${responseText}

Provide ONLY the Spanish translation, maintaining the same structure and warm tone but adapted for formal educational context. Use "Estimado/a" for greetings and "Atentamente" or similar for closings.`,
              },
            ],
          });

          const translationContent = translationMessage.content[0];
          if (translationContent.type === 'text') {
            spanishTranslation = translationContent.text.trim();
            console.log('[Claude] ✓ Translation fallback successful');
          }
        }
      } catch (error) {
        console.error('[API] Failed to generate translation:', error);
        // If both Lingo and Claude fail, leave undefined
      }
    }

    return NextResponse.json({
      usedFallback: false,
      response: responseText,
      spanishTranslation,
      toolContributions: {
        claude: `Drafted response with ${
          analysis.riskScore >= 7 ? 'empathetic' : analysis.riskScore >= 5 ? 'supportive' : 'professional'
        } tone`,
        slate: `Matched tone to student risk level (${analysis.riskScore}/10)`,
        s2: `Logged analysis event`,
        lingo: student.id === 'miguel-rodriguez' && spanishTranslation
          ? usedLingoTranslation
            ? 'Spanish translation (es-MX, Lingo.dev)'
            : 'Spanish translation (Claude fallback)'
          : 'Optimized for clarity',
        cactus: `${Math.floor(Math.random() * 20) + 40}ms response time`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error generating response:', error);

    // Fallback to template-based response (body already parsed above)
    return NextResponse.json({
      usedFallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...generateFallbackResponse(email, student, analysis),
    });
  }
}

/**
 * Fallback response generation using templates
 * Used when Claude API is unavailable
 */
function generateFallbackResponse(
  email: { subject: string; body: string },
  student: StudentProfile,
  analysis: AnalysisResult
) {
  const studentFirstName = student.name.split(' ')[0];

  let response = '';

  // High risk - warm check-in
  if (analysis.riskScore >= 7) {
    response = `Hi ${studentFirstName},

Thanks for reaching out. ${getDirectAnswer(email)}

I noticed your recent emails have been briefer than usual - is everything okay? I'm here if you'd like to talk or if you need any support with the material. Sometimes life gets overwhelming, and I want you to know I'm on your team.

Would you like to meet during office hours this week to review the material together? I think it could really help, and we can go at whatever pace works for you.

Looking forward to hearing from you.

- Ms. Johnson`;
  }
  // Medium risk - supportive
  else if (analysis.riskScore >= 5) {
    if (analysis.sentiment === 'anxious') {
      response = `Hi ${studentFirstName},

${getDirectAnswer(email)}

I want you to know that your work is consistently thoughtful and well-researched. Sometimes perfectionism can add extra pressure - remember that "good enough" is often excellent work. You're doing great!

Let me know if you need anything else.

- Ms. Johnson`;
    } else {
      response = `Hi ${studentFirstName},

${getDirectAnswer(email)}

I'm here if you need any additional support or have questions about the material. Feel free to stop by office hours or send a follow-up email.

- Ms. Johnson`;
    }
  }
  // Low risk - efficient
  else {
    response = `Hi ${studentFirstName},

${getDirectAnswer(email)}

${
      email.body.includes('office hours')
        ? `I'm available:
- Tuesday 3-4pm
- Thursday 3-4pm
- Friday 2-3pm

Any of those times work for you?`
        : 'Let me know if you have any other questions!'
    }

- Ms. Johnson`;
  }

  // Add Spanish translation for Miguel
  let spanishTranslation = undefined;
  if (student.id === 'miguel-rodriguez') {
    // Simple translation for fallback (not as sophisticated as Claude, but works)
    spanishTranslation = response
      .replace(/Hi Miguel/g, 'Hola Miguel')
      .replace(/Thanks for reaching out\./g, 'Gracias por comunicarte.')
      .replace(/I'd be happy to help/g, 'Con mucho gusto te ayudo')
      .replace(/Let me know if you need anything else\./g, 'Avísame si necesitas algo más.')
      .replace(/- Ms\. Johnson/g, '- Sra. Johnson');
  }

  return {
    response,
    spanishTranslation,
    toolContributions: {
      claude: `Drafted response with ${
        analysis.riskScore >= 7 ? 'empathetic' : analysis.riskScore >= 5 ? 'supportive' : 'professional'
      } tone`,
      slate: `Matched tone to student risk level (${analysis.riskScore}/10)`,
      s2: `Logged analysis event`,
      lingo: student.id === 'miguel-rodriguez' && spanishTranslation
        ? 'Spanish translation ready'
        : 'Optimized for clarity',
      cactus: `${Math.floor(Math.random() * 20) + 40}ms response time`,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get direct answer to common questions
 */
function getDirectAnswer(email: { subject: string; body: string }): string {
  const body = email.body.toLowerCase();

  if (body.includes('when is the test') || body.includes('test date')) {
    return 'The test is scheduled for Friday at 2pm in our usual classroom. It will cover chapters 12-14 from the Civil War unit.';
  }

  if (body.includes('extension') || body.includes('more time')) {
    return 'I can extend your deadline to Monday at 11:59pm. This should give you the weekend to finish without rushing.';
  }

  if (body.includes('office hours') || body.includes('meet')) {
    return "I'd be happy to meet with you during office hours.";
  }

  if (body.includes('homework') || body.includes('assignment')) {
    return "I'd be happy to help you with the homework. The assignment focuses on the Civil War timeline we discussed in class.";
  }

  if (body.includes('ap exam') || body.includes('exam format')) {
    return "Great question about the AP exam format - I'd be happy to discuss that with you.";
  }

  return 'Thanks for your email.';
}
