/**
 * Real-time email analysis using Claude API
 * Analyzes sentiment, risk, patterns, and generates recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { StudentProfile } from '@/types';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  // Parse request body once at the start
  const body = await request.json();
  const { email, student } = body;

  try {
    // Validate input
    if (!email?.body || !student) {
      return NextResponse.json(
        { error: 'Email body and student data required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('[API] No Anthropic API key - using fallback analysis');
      return NextResponse.json({
        usedFallback: true,
        ...generateFallbackAnalysis(email, student),
      });
    }

    console.log('[API] Analyzing email with Claude...', {
      studentId: student.id,
      wordCount: email.body.split(/\s+/).length,
    });

    // Call Claude API for analysis (using latest model)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert educational psychologist analyzing student email communication patterns.

STUDENT PROFILE:
- Name: ${student.name}
- Baseline avg email length: ${student.baseline.avgWordCount} words
- Baseline attendance: ${(student.baseline.attendanceRate * 100).toFixed(0)}%
- Baseline participation: ${student.baseline.participationLevel}/10
- Current grade: ${student.currentGrade}

STUDENT EMAIL:
Subject: "${email.subject}"
Body: "${email.body}"

ANALYSIS REQUIRED:
Analyze this email and provide a JSON response with:
1. sentiment: "positive" | "anxious" | "frustrated" | "neutral"
2. riskScore: number from 1-10 (10 = highest risk of disengagement)
3. riskReasoning: brief explanation of risk score
4. communicationPattern: description of communication style
5. redFlags: array of concerning patterns (if any)
6. recommendedApproach: "Warm Check-In" | "Quick Answer" | "Supportive Response" | "Standard Reply"
7. reasoning: why this approach is recommended

RISK FACTORS TO CONSIDER:
- Email length vs baseline (current: ${email.body.split(/\s+/).length} words vs ${student.baseline.avgWordCount} avg)
- Tone and sentiment
- Urgency markers (last-minute, stressed, etc.)
- Engagement level (detail, questions, effort)
- Red flags (avoidance, anxiety, frustration)

Respond ONLY with valid JSON, no other text.`,
        },
      ],
    });

    // Parse Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const analysis = JSON.parse(content.text);

    console.log('[API] Analysis complete:', {
      sentiment: analysis.sentiment,
      riskScore: analysis.riskScore,
      approach: analysis.recommendedApproach,
    });

    return NextResponse.json({
      usedFallback: false,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error analyzing email:', error);

    // Fallback to rule-based analysis (body already parsed above)
    return NextResponse.json({
      usedFallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...generateFallbackAnalysis(email, student),
    });
  }
}

/**
 * Fallback analysis using rule-based logic
 * Used when Claude API is unavailable
 */
function generateFallbackAnalysis(
  email: { subject: string; body: string },
  student: StudentProfile
) {
  const wordCount = email.body.split(/\s+/).length;
  const baselineWordCount = student.baseline.avgWordCount;

  // Calculate risk based on word count deviation
  let riskScore = 5;
  let sentiment: 'positive' | 'anxious' | 'frustrated' | 'neutral' = 'neutral';
  let recommendedApproach =
    'Standard Reply' as 'Warm Check-In' | 'Quick Answer' | 'Supportive Response' | 'Standard Reply';

  // Very brief emails (< 50% of baseline)
  if (wordCount < baselineWordCount * 0.5) {
    riskScore = 8;
    sentiment = 'neutral';
    recommendedApproach = 'Warm Check-In';
  }
  // Brief emails (50-75% of baseline)
  else if (wordCount < baselineWordCount * 0.75) {
    riskScore = 6;
    sentiment = 'neutral';
    recommendedApproach = 'Supportive Response';
  }
  // Anxiety markers
  else if (
    /sorry|worried|stressed|anxious|not sure|perfect|afraid/i.test(email.body)
  ) {
    riskScore = 5;
    sentiment = 'anxious';
    recommendedApproach = 'Supportive Response';
  }
  // Positive markers
  else if (/thank|appreciate|excited|great|looking forward/i.test(email.body)) {
    riskScore = 2;
    sentiment = 'positive';
    recommendedApproach = 'Quick Answer';
  }
  // Well-structured emails (lists, questions)
  else if (/\d\.|1\)|•/.test(email.body) && wordCount > baselineWordCount) {
    riskScore = 1;
    sentiment = 'positive';
    recommendedApproach = 'Quick Answer';
  }

  const redFlags: string[] = [];
  if (wordCount < baselineWordCount * 0.5) {
    redFlags.push('Communication decline - significantly briefer than baseline');
  }
  if (/extension|late|behind|busy|can't/i.test(email.body)) {
    redFlags.push('Potential time management or workload issues');
  }
  if (/sorry|worried|stressed|anxious/i.test(email.body)) {
    redFlags.push('Anxiety or stress indicators');
  }

  return {
    sentiment,
    riskScore,
    riskReasoning: `Word count: ${wordCount} vs baseline ${baselineWordCount}. ${
      redFlags.length > 0 ? redFlags.join('. ') : 'No major concerns detected.'
    }`,
    communicationPattern:
      wordCount < baselineWordCount * 0.5
        ? 'Declining engagement - brief communication'
        : wordCount > baselineWordCount * 1.5
        ? 'High engagement - detailed communication'
        : 'Normal communication pattern',
    redFlags,
    recommendedApproach,
    reasoning:
      recommendedApproach === 'Warm Check-In'
        ? 'Brief communication suggests possible disengagement. Recommend supportive check-in.'
        : recommendedApproach === 'Supportive Response'
        ? 'Student shows signs of stress or reduced engagement. Offer support.'
        : recommendedApproach === 'Quick Answer'
        ? 'Student is engaged and proactive. Provide efficient response.'
        : 'Standard communication. Respond professionally.',
    timestamp: new Date().toISOString(),
  };
}
