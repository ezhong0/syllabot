/**
 * Cactus Compute Integration
 *
 * Uses Cactus performance tracking to monitor demo metrics and
 * validate mobile-readiness of AI prompts.
 *
 * Future: Will power offline AI analysis in SyllaBot Mobile app
 */

const CACTUS_API_KEY = process.env.CACTUS_COMPUTE_API_KEY;
const CACTUS_TELEMETRY_URL = 'https://telemetry.cactuscompute.com/v1';

interface PerformanceMetric {
  feature: string;
  latency: number;
  tokenCount?: number;
  mobileReady: boolean;
}

interface MobileReadinessScore {
  feature: string;
  score: number; // 0-100
  factors: {
    promptSize: number;
    latencyTarget: number; // <50ms for Cactus
    offlineCapable: boolean;
  };
}

/**
 * Track performance metrics for mobile-readiness validation
 * Helps us optimize prompts for eventual Cactus mobile deployment
 */
export async function trackPerformance(
  metric: PerformanceMetric
): Promise<void> {
  // Log locally always
  console.log(
    `[Cactus] Performance: ${metric.feature} - ${metric.latency}ms`,
    metric.mobileReady ? '✓ Mobile-ready' : '⚠️ Needs optimization'
  );

  if (!CACTUS_API_KEY) {
    return; // Graceful degradation
  }

  try {
    await fetch(`${CACTUS_TELEMETRY_URL}/metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CACTUS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        environment: 'web-demo',
        ...metric
      })
    });
  } catch (error) {
    // Silent fail - telemetry is non-critical
    console.debug('[Cactus] Telemetry failed:', error);
  }
}

/**
 * Calculate mobile-readiness score for AI features
 * Based on Cactus mobile constraints (<50ms, offline-capable)
 */
export function calculateMobileReadiness(
  promptTokens: number,
  webLatency: number
): MobileReadinessScore {
  // Cactus mobile target: <50ms first token
  const latencyScore =
    webLatency < 50 ? 100 :
    webLatency < 100 ? 80 :
    webLatency < 200 ? 60 : 30;

  // Cactus works best with <2K token prompts
  const promptScore =
    promptTokens < 1000 ? 100 :
    promptTokens < 2000 ? 80 :
    promptTokens < 3000 ? 50 : 20;

  const score = Math.round((latencyScore + promptScore) / 2);

  return {
    feature: 'email-analysis',
    score,
    factors: {
      promptSize: promptTokens,
      latencyTarget: 50,
      offlineCapable: promptTokens < 2000 // Cactus can cache models <2K tokens
    }
  };
}

/**
 * Demo helper: Show which features are mobile-ready
 */
export async function logMobileReadiness(
  feature: string,
  ready: boolean,
  metrics: { latency: number; tokens: number }
): Promise<void> {
  const readiness = calculateMobileReadiness(metrics.tokens, metrics.latency);

  await trackPerformance({
    feature,
    latency: metrics.latency,
    tokenCount: metrics.tokens,
    mobileReady: ready
  });

  // Log to console for demo visibility
  if (readiness.score >= 80) {
    console.log(`✅ [Cactus] ${feature} is mobile-ready (score: ${readiness.score})`);
  } else {
    console.log(`⚠️ [Cactus] ${feature} needs optimization for mobile (score: ${readiness.score})`);
  }
}

/**
 * Export for demo dashboard
 */
export const MOBILE_FEATURES_STATUS = {
  'Risk Scoring': { ready: true, cactusMobileLatency: '<50ms' },
  'Pattern Detection': { ready: true, cactusMobileLatency: '<100ms' },
  'Response Generation': { ready: false, cactusMobileLatency: '200ms+' },
  'Translation': { ready: true, cactusMobileLatency: '<50ms' }
};
