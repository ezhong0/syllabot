import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StudentProfile } from '@/types';

interface StudentHistoryProps {
  student: StudentProfile;
}

export function StudentHistory({ student }: StudentHistoryProps) {
  // Sort interactions by date (newest first)
  const sortedInteractions = [...student.interactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'grade':
        return '📝';
      case 'absence':
        return '🚫';
      default:
        return '📌';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'anxious':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'frustrated':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'grade':
        return 'bg-purple-100 text-purple-800';
      case 'absence':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Interaction History ({student.interactions.length} events)
        </h4>
        <span className="text-xs text-gray-500">Last 4 weeks</span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {sortedInteractions.map((interaction, idx) => (
          <Card
            key={idx}
            className={`p-4 border-2 ${getSentimentColor(interaction.sentiment)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getInteractionIcon(interaction.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTypeColor(interaction.type)} text-xs`}>
                      {interaction.type}
                    </Badge>
                    {interaction.sentiment !== 'neutral' && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {interaction.sentiment}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{interaction.date}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm font-medium text-gray-900 mb-2">
              {interaction.summary}
            </p>

            {/* Details */}
            {interaction.details && (
              <div className="mt-2 p-3 bg-white/60 rounded border border-gray-200">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {interaction.details}
                </p>
              </div>
            )}

            {/* Word count for emails */}
            {interaction.type === 'email' && interaction.details && (
              <div className="mt-2 text-xs text-gray-500">
                {interaction.details.split(/\s+/).length} words
                {student.baseline.avgWordCount && (
                  <>
                    {' • '}
                    <span
                      className={
                        interaction.details.split(/\s+/).length <
                        student.baseline.avgWordCount * 0.5
                          ? 'text-red-600 font-medium'
                          : 'text-gray-500'
                      }
                    >
                      Baseline: {student.baseline.avgWordCount} words
                    </span>
                  </>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pattern Summary */}
      <Card className="p-4 bg-purple-50 border-2 border-purple-200">
        <div className="text-xs">
          <p className="font-semibold text-purple-900 mb-2">Pattern Detected:</p>
          <p className="text-gray-700 leading-relaxed">
            AI analyzed these {student.interactions.length} interactions and identified:{' '}
            <span className="font-semibold">{student.aiInsight.pattern}</span> with{' '}
            {student.aiInsight.confidence}% confidence.
          </p>
        </div>
      </Card>
    </div>
  );
}
