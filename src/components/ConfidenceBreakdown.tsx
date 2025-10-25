import { ConfidenceIndicator } from '@/components/slate-generated/ConfidenceIndicator';
import type { StudentProfile } from '@/types';

interface ConfidenceBreakdownProps {
  student: StudentProfile;
}

export function ConfidenceBreakdown({ student }: ConfidenceBreakdownProps) {
  const breakdown = student.aiInsight.confidenceBreakdown;

  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Confidence Breakdown</h4>

      <div className="space-y-3">
        {breakdown.map((factor, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{factor.factor}</span>
              <span className="text-xs text-gray-500">Weight: {(factor.weight * 100).toFixed(0)}%</span>
            </div>

            <ConfidenceIndicator
              confidence={factor.confidence}
              label={factor.reasoning}
            />

            <p className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
              {factor.reasoning}
            </p>
          </div>
        ))}
      </div>

      {/* Overall Confidence */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Overall Confidence</span>
          <span className="text-sm font-bold text-purple-600">{student.aiInsight.confidence}%</span>
        </div>
        <ConfidenceIndicator
          confidence={student.aiInsight.confidence}
          label="Weighted average across all factors"
        />
      </div>
    </div>
  );
}
