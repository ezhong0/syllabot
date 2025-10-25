import { getTimelineColor } from '@/lib/slate-generated/timeline-utils';
import type { StudentProfile } from '@/types';

interface EngagementTimelineProps {
  student: StudentProfile;
}

export function EngagementTimeline({ student }: EngagementTimelineProps) {
  const timeline = student.aiInsight.engagementTimeline;

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const maxScore = 100;
  const minScore = 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Engagement Timeline</h4>
        <span className="text-xs text-gray-500">{timeline.length} weeks</span>
      </div>

      {/* Chart */}
      <div className="relative h-32 bg-gray-50 rounded-md border border-gray-200 p-3">
        <div className="h-full flex items-end justify-between gap-1">
          {timeline.map((point, idx) => {
            const height = ((point.score - minScore) / (maxScore - minScore)) * 100;
            const bgColor = getTimelineColor(point.status);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                {/* Bar */}
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className={`w-full ${bgColor} rounded-t transition-all hover:opacity-80`}
                    style={{ height: `${height}%` }}
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  <div className="font-medium">{point.date}</div>
                  <div>Score: {point.score}</div>
                  <div className="capitalize">{point.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{timeline[0].date}</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-600">Excellent</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-gray-600">Good</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-gray-600">Concerning</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="text-gray-600">Crisis</span>
          </span>
        </div>
        <span className="text-gray-500">{timeline[timeline.length - 1].date}</span>
      </div>

      {/* Trend Summary */}
      {timeline.length >= 2 && (
        <div className="text-xs">
          <div className="flex items-center gap-2">
            {timeline[0].score > timeline[timeline.length - 1].score ? (
              <>
                <span className="text-red-600">↓ Declining trend</span>
                <span className="text-gray-500">
                  ({timeline[0].score} → {timeline[timeline.length - 1].score})
                </span>
              </>
            ) : timeline[0].score < timeline[timeline.length - 1].score ? (
              <>
                <span className="text-green-600">↑ Improving trend</span>
                <span className="text-gray-500">
                  ({timeline[0].score} → {timeline[timeline.length - 1].score})
                </span>
              </>
            ) : (
              <span className="text-gray-500">→ Stable</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
