/**
 * Risk Score Badge Utilities
 * Generated with Random Labs Slate
 *
 * Provides color coding and labeling for risk scores (0-10)
 */

export interface RiskBadge {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: string;
}

/**
 * Get risk score badge properties for Tailwind CSS styling
 * @param riskScore - Risk score from 0-10
 * @returns Badge properties with Tailwind color classes
 */
export function getRiskScoreBadge(riskScore: number): RiskBadge {
  // Normalize score to 0-10 range
  const normalizedScore = Math.max(0, Math.min(10, riskScore));

  // High risk: 7-10 (Red)
  if (normalizedScore >= 7) {
    return {
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'High Risk',
      icon: '🚨'
    };
  }

  // Medium risk: 4-6 (Yellow/Amber)
  if (normalizedScore >= 4) {
    return {
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Medium Risk',
      icon: '⚠️'
    };
  }

  // Low risk: 0-3 (Green)
  return {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Low Risk',
    icon: '✅'
  };
}

/**
 * Get numerical risk color class (for text/backgrounds)
 * @param riskScore - Risk score from 0-10
 * @returns Tailwind text color class
 */
export function getRiskColor(riskScore: number): string {
  const normalizedScore = Math.max(0, Math.min(10, riskScore));

  if (normalizedScore >= 7) return 'text-red-600';
  if (normalizedScore >= 4) return 'text-amber-600';
  return 'text-green-600';
}

/**
 * Get risk level text
 * @param riskScore - Risk score from 0-10
 * @returns Human-readable risk level
 */
export function getRiskLevel(riskScore: number): 'High' | 'Medium' | 'Low' {
  const normalizedScore = Math.max(0, Math.min(10, riskScore));

  if (normalizedScore >= 7) return 'High';
  if (normalizedScore >= 4) return 'Medium';
  return 'Low';
}
