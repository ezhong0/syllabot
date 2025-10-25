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
      model: 'claude-3-7-sonnet-20250219',
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
- Typical behavior: ${student.baseline.typicalBehavior}

STUDENT EMAIL:
Subject: "${email.subject}"
Body: "${email.body}"
Word count: ${email.body.split(/\s+/).length} words

ANALYSIS REQUIRED:
Analyze this email and provide a JSON response with:
1. sentiment: "positive" | "anxious" | "frustrated" | "neutral"
2. riskScore: number from 1-10 (10 = highest risk of disengagement)
3. riskReasoning: brief explanation of risk score
4. communicationPattern: description of communication style
5. redFlags: array of concerning patterns (if any)
6. recommendedApproach: "Warm Check-In" | "Quick Answer" | "Supportive Response" | "Standard Reply"
7. reasoning: why this approach is recommended

RISK SCORING GUIDELINES:
Calculate deviation: (current words - baseline words) / baseline words * 100

RISK LEVELS:
- 1-2 (LOW): Student functioning normally. Deviation < 25% OR positive engagement markers
  * Brief email that matches student's natural communication style
  * Simple, straightforward question appropriate to context
  * No anxiety, frustration, or disengagement markers

- 3-4 (LOW-MEDIUM): Minor deviation from baseline but no red flags
  * Deviation 25-40% from baseline
  * Slightly less detail than usual but still engaged

- 5-6 (MEDIUM): Notable deviation with some concern markers
  * Deviation 40-60% from baseline
  * Some anxiety/frustration markers OR reduced engagement

- 7-8 (HIGH): Significant deviation with red flags
  * Deviation > 60% from baseline
  * Multiple anxiety/frustration markers OR clear disengagement

- 9-10 (CRITICAL): Severe deviation with crisis markers
  * Deviation > 80% from baseline
  * Crisis language, withdrawal, or severe distress

IMPORTANT CONTEXT:
- Some students are NATURALLY BRIEF communicators - this is NORMAL for them
- A short email is only concerning if it's MUCH shorter than the student's baseline
- Focus on DEVIATION FROM BASELINE, not absolute word count
- Consider EMAIL PURPOSE: "When is the test?" doesn't need 50 words - brevity is appropriate
- High attendance (>95%) + stable grades = LOW RISK even if email is brief

RISK FACTORS TO EVALUATE:
1. Email length deviation (% change from baseline)
2. Tone and sentiment (anxious, frustrated, withdrawn?)
3. Content appropriateness (is brevity fitting for the question type?)
4. Engagement markers (detail, questions, effort appropriate to context)
5. Red flags (avoidance, anxiety, frustration, withdrawal)

Respond ONLY with valid JSON, no other text.`,
        },
      ],
    });

    // Parse Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Strip markdown code blocks if present (Claude sometimes wraps JSON in ```json blocks)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const analysis = JSON.parse(jsonText);

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
  const deviation = ((wordCount - baselineWordCount) / baselineWordCount) * 100;

  // Calculate risk based on word count deviation
  let riskScore = 5;
  let sentiment: 'positive' | 'anxious' | 'frustrated' | 'neutral' = 'neutral';
  let recommendedApproach =
    'Standard Reply' as 'Warm Check-In' | 'Quick Answer' | 'Supportive Response' | 'Standard Reply';

  // Very brief emails (< 50% of baseline = >50% reduction)
  if (deviation < -50) {
    riskScore = 8;
    sentiment = 'neutral';
    recommendedApproach = 'Warm Check-In';
  }
  // Moderately brief emails (50-75% of baseline = 25-50% reduction)
  else if (deviation < -25) {
    riskScore = 5;
    sentiment = 'neutral';
    recommendedApproach = 'Supportive Response';
  }
  // Normal range (within 25% of baseline) - LOW RISK
  else if (Math.abs(deviation) <= 25) {
    // Check for anxiety/frustration markers
    if (/sorry|worried|stressed|anxious|not sure|perfect|afraid/i.test(email.body)) {
      riskScore = 4;
      sentiment = 'anxious';
      recommendedApproach = 'Supportive Response';
    }
    // Positive markers
    else if (/thank|appreciate|excited|great|looking forward/i.test(email.body)) {
      riskScore = 1;
      sentiment = 'positive';
      recommendedApproach = 'Quick Answer';
    }
    // Normal, neutral emails - LOW RISK
    else {
      riskScore = 2;
      sentiment = 'neutral';
      recommendedApproach = 'Quick Answer';
    }
  }
  // Above baseline (longer emails) - typically good
  else if (deviation > 25) {
    // Check for frustration in long emails
    if (/frustrated|angry|don't understand|still don't|unfair/i.test(email.body)) {
      riskScore = 6;
      sentiment = 'frustrated';
      recommendedApproach = 'Supportive Response';
    } else {
      riskScore = 2;
      sentiment = 'positive';
      recommendedApproach = 'Quick Answer';
    }
  }

  const redFlags: string[] = [];
  if (deviation < -50) {
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
    riskReasoning: `Word count: ${wordCount} vs baseline ${baselineWordCount} (${deviation.toFixed(0)}% ${deviation >= 0 ? 'above' : 'below'}). ${
      redFlags.length > 0 ? redFlags.join('. ') : 'Communication pattern within normal range. No major concerns.'
    }`,
    communicationPattern:
      deviation < -50
        ? 'Declining engagement - significantly briefer than baseline'
        : deviation > 50
        ? 'High engagement - more detailed than baseline'
        : 'Normal communication pattern - matches student baseline',
    redFlags,
    recommendedApproach,
    reasoning:
      recommendedApproach === 'Warm Check-In'
        ? 'Brief communication suggests possible disengagement. Recommend supportive check-in.'
        : recommendedApproach === 'Supportive Response'
        ? 'Student shows signs of stress or reduced engagement. Offer support.'
        : recommendedApproach === 'Quick Answer'
        ? 'Student is engaged and functioning normally. Provide efficient response.'
        : 'Standard communication. Respond professionally.',
    timestamp: new Date().toISOString(),
  };
}
