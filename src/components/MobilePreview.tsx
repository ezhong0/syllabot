/**
 * Mobile Preview Component
 *
 * Demonstrates SyllaBot Mobile architecture powered by Cactus Compute
 * Shows investors the offline, privacy-first mobile vision
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, WifiOff, Lock, Zap } from 'lucide-react';

export function MobilePreview() {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-purple-600" />
        <h3 className="font-bold text-lg">SyllaBot Mobile</h3>
        <Badge className="bg-purple-600 hover:bg-purple-700">Powered by Cactus Compute</Badge>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Future mobile app will use <strong>Cactus Compute</strong> for on-device AI inference:
      </p>

      <div className="space-y-3">
        <MobileFeature
          icon={<WifiOff className="w-4 h-4" />}
          title="Offline Analysis"
          desc="Analyze student emails without internet"
          cactus="On-device LLM inference"
        />
        <MobileFeature
          icon={<Lock className="w-4 h-4" />}
          title="FERPA Compliant"
          desc="Student data never leaves device"
          cactus="Zero cloud dependency"
        />
        <MobileFeature
          icon={<Zap className="w-4 h-4" />}
          title="<50ms Latency"
          desc="Instant risk scoring on teacher's phone"
          cactus="Optimized mobile kernels"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-purple-200 text-xs text-gray-600">
        <strong>Tech Stack:</strong> React Native + Cactus SDK + On-device Claude Haiku
      </div>
    </Card>
  );
}

function MobileFeature({
  icon,
  title,
  desc,
  cactus
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cactus: string;
}) {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-lg border border-purple-100">
      <div className="text-purple-600">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-gray-600">{desc}</p>
        <p className="text-xs text-purple-600 mt-1">→ {cactus}</p>
      </div>
    </div>
  );
}
