import Anthropic from "@anthropic-ai/sdk";
import type { DemoEmail, StudentProfile, EmailAnalysis } from "@/types";
import { logMobileReadiness } from "./cactus";

// Lazy initialization to ensure environment variables are loaded
let anthropic: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

/**
 * Analyzes a student email using Claude AI to detect patterns and risk factors
 */
export async function analyzeEmail(
  email: DemoEmail,
  student: StudentProfile
): Promise<EmailAnalysis> {
  const startTime = Date.now();
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1000,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: `You are an expert teacher analyzing student communication patterns.

Current Email:
Subject: ${email.subject}
Body: "${email.body}"
Word count: ${email.wordCount}
Sentiment: ${email.sentiment}

Student Baseline (Normal behavior):
- Typical word count: ${student.baseline.avgWordCount} words
- Typical behavior: ${student.baseline.typicalBehavior}
- Attendance rate: ${(student.baseline.attendanceRate * 100).toFixed(0)}%
- Average grade: ${student.baseline.avgGrade}%
- Participation level: ${student.baseline.participationLevel}/10

Recent Activity:
${student.interactions.slice(0, 5).map(i =>
  `- ${i.date} (${i.type}): ${i.summary}`
).join('\n')}

Known Red Flags:
${student.redFlags.map(f =>
  `- ${f.type} (${f.severity}): ${f.description} (${f.deviation} from baseline)`
).join('\n')}

Analyze this email for hidden meaning. Is the student really asking about "${email.subject}", or are they signaling something else?

Return ONLY valid JSON with this exact structure:
{
  "riskScore": <number 0-10>,
  "pattern": "<pattern name>",
  "confidence": <number 0-100>,
  "hiddenMeaning": "<what they're really saying>",
  "evidence": ["<supporting point 1>", "<supporting point 2>", "<supporting point 3>"],
  "recommendation": "<what the teacher should do>"
}

Be specific and actionable. Consider the deviation from baseline behavior.`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extract JSON from response (Claude sometimes wraps it in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to parse Claude response:', text);
    throw new Error('Failed to parse Claude response as JSON');
  }

  const analysis = JSON.parse(jsonMatch[0]) as EmailAnalysis;

  // Validate the response has required fields
  if (typeof analysis.riskScore !== 'number' ||
      typeof analysis.pattern !== 'string' ||
      typeof analysis.confidence !== 'number') {
    throw new Error('Invalid analysis structure from Claude');
  }

  // Track performance for Cactus mobile optimization
  const latency = Date.now() - startTime;
  const promptTokens = 450; // Approximate based on prompt structure

  // Log mobile-readiness (non-blocking, fails silently)
  logMobileReadiness('email-analysis', latency < 100, {
    latency,
    tokens: promptTokens
  }).catch(() => {
    // Silent fail - telemetry is non-critical
  });

  return analysis;
}

/**
 * Loads pre-computed AI analysis from cache
 * Used during demo for instant loading
 */
export function getCachedAnalysis(emailId: string): EmailAnalysis | null {
  try {
    const cache = require('@/data/demo-cache.json');
    return cache[emailId]?.analysis || null;
  } catch (error) {
    console.error('Failed to load cache:', error);
    return null;
  }
}

/**
 * Detects behavior patterns across multiple student interactions
 */
export async function detectPatterns(
  email: DemoEmail,
  studentHistory: StudentProfile
): Promise<string[]> {
  // This could be expanded with more sophisticated pattern detection
  // For now, we rely on the main analyzeEmail function
  const patterns: string[] = [];

  // Check for attendance pattern
  const absences = studentHistory.interactions.filter(i => i.type === 'absence');
  if (absences.length >= 3) {
    patterns.push('Attendance Decline');
  }

  // Check for grade pattern
  const recentGrades = studentHistory.interactions
    .filter(i => i.type === 'grade')
    .slice(0, 3);

  if (recentGrades.some(g => g.summary.includes('60%') || g.summary.includes('70%'))) {
    patterns.push('Academic Struggle');
  }

  // Check for communication pattern
  if (email.wordCount < studentHistory.baseline.avgWordCount * 0.5) {
    patterns.push('Communication Withdrawal');
  }

  return patterns;
}

/**
 * Generates response strategies based on risk level and pattern
 */
export async function generateResponseStrategies(
  email: DemoEmail,
  analysis: EmailAnalysis,
  studentProfile: StudentProfile
): Promise<string[]> {
  const strategies: string[] = [];

  if (analysis.riskScore >= 7) {
    strategies.push('Immediate warm check-in - show you notice');
    strategies.push('Flag for counselor if no response in 24h');
  } else if (analysis.riskScore >= 4) {
    strategies.push('Warm response - answer question + gentle check-in');
  } else {
    strategies.push('Standard response - answer the question');
  }

  return strategies;
}
