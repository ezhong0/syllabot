# High-Impact Features for Linear-Inspired Dashboard

This document shows exactly how each sophisticated feature integrates into your new Linear-inspired design.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ LinearHeader (Search + Compose)                                    │
├──────────┬──────────────────────────┬───────────────────────────────┤
│          │                          │                               │
│ Linear   │  LinearEmailList         │  LinearDetailPanel            │
│ Sidebar  │  ├─ Header (AI Sort)     │  ├─ Student Info             │
│          │  ├─ Email Items          │  ├─ Risk Score Card          │
│ ├─ Inbox │  └─ Empty State          │  ├─ Email Body               │
│ ├─ High  │                          │  ├─ Impact Projection        │
│ ├─ Med   │                          │  ├─ Timeline (always)        │
│ ├─ Low   │                          │  ├─ Quick Actions            │
│ ├─ Star  │                          │  └─ Collapsible Sections     │
│ └─ Sent  │                          │     ├─ Red Flags             │
│          │                          │     ├─ Confidence            │
│          │                          │     └─ Full History          │
│          │                          │                               │
└──────────┴──────────────────────────┴───────────────────────────────┘
```

---

## 1. Cross-Student Pattern Detection 🔥🔥🔥

### Where it Fits
**Option A (Recommended): Banner in Email List**
- Shows above email items when patterns detected
- Collapsible/dismissable
- Matches Linear's notification patterns

**Option B: New Sidebar View**
- Add "Patterns" view to sidebar
- Shows detected patterns instead of emails
- Can navigate to affected students

### Implementation

#### Option A: Banner in LinearEmailList

**File:** `src/components/linear/PatternBanner.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Pattern {
  type: 'temporal_correlation' | 'shared_trigger' | 'cohort_decline';
  title: string;
  description: string;
  students: string[];
  severity: 'high' | 'medium' | 'low';
  confidence: number;
}

export function PatternBanner({ students }: { students: Record<string, any> }) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Auto-detect patterns on mount
    detectPatterns();
  }, []);

  const detectPatterns = async () => {
    const response = await fetch('/api/detect-patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: Object.values(students) })
    });
    const data = await response.json();
    setPatterns(data.patterns || []);
  };

  if (patterns.length === 0 || isDismissed) return null;

  const highSeverityPatterns = patterns.filter(p => p.severity === 'high');
  const primaryPattern = highSeverityPatterns[0] || patterns[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
      >
        <div className="px-4 py-3">
          {/* Collapsed view */}
          {!isExpanded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-900">
                      {patterns.length} {patterns.length === 1 ? 'Pattern' : 'Patterns'} Detected
                    </span>
                    <Badge className="bg-amber-200 text-amber-800 text-xs">
                      {Math.round(primaryPattern.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-700 truncate">
                    {primaryPattern.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-amber-700 hover:bg-amber-100"
                >
                  View Details
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDismissed(true)}
                  className="h-6 w-6 p-0 hover:bg-amber-100"
                >
                  <X className="h-3.5 w-3.5 text-amber-600" />
                </Button>
              </div>
            </div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-amber-900">
                  Cross-Student Patterns
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-xs text-amber-700 hover:bg-amber-100"
                  >
                    Collapse
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDismissed(true)}
                    className="h-6 w-6 p-0 hover:bg-amber-100"
                  >
                    <X className="h-3.5 w-3.5 text-amber-600" />
                  </Button>
                </div>
              </div>

              {/* Pattern Cards */}
              <div className="space-y-2">
                {patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-amber-200 p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {pattern.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(pattern.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {pattern.description}
                        </p>
                      </div>
                    </div>

                    {/* Affected Students */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                      <Users className="h-3 w-3 text-gray-500" />
                      <div className="flex flex-wrap gap-1">
                        {pattern.students.map(studentId => {
                          const student = students[studentId];
                          return student ? (
                            <span
                              key={studentId}
                              className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full"
                            >
                              {student.name.split(' ')[0]}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Integration in LinearEmailList:**

```typescript
// src/components/linear/LinearEmailList.tsx
import { PatternBanner } from './PatternBanner';

export function LinearEmailList({ ... }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 ...">
        ...
      </div>

      {/* NEW: Pattern Detection Banner */}
      <PatternBanner students={students} />

      {/* Email count */}
      <div className="px-4 py-2 ...">
        ...
      </div>

      {/* Email list */}
      ...
    </div>
  );
}
```

---

## 2. Predictive Intervention Timing 🔥🔥🔥

### Where it Fits
**LinearDetailPanel** - Add as a card before "Quick Actions"

Shows:
- Countdown timer (live updating)
- Success probability decay chart
- Urgency indicator

### Implementation

**File:** `src/components/linear/InterventionTimer.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InterventionTimerProps {
  student: any;
  riskScore: number;
}

export function InterventionTimer({ student, riskScore }: InterventionTimerProps) {
  const [timing, setTiming] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Auto-calculate if high risk
    if (riskScore >= 7) {
      calculateTiming();
    }
  }, [riskScore]);

  useEffect(() => {
    if (!timing) return;

    const interval = setInterval(() => {
      const deadline = new Date(timing.windowDeadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Window closed');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timing]);

  const calculateTiming = async () => {
    const response = await fetch('/api/calculate-intervention-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, currentTime: new Date().toISOString() })
    });
    const data = await response.json();
    setTiming(data.timing);
  };

  if (!timing && riskScore < 7) return null;

  if (!timing) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <Button
          onClick={calculateTiming}
          variant="ghost"
          size="sm"
          className="w-full text-orange-700 hover:bg-orange-100"
        >
          <Clock className="h-4 w-4 mr-2" />
          Calculate Optimal Timing
        </Button>
      </div>
    );
  }

  const urgencyColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500'
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-700" />
          <span className="text-xs font-semibold text-orange-900 uppercase tracking-wider">
            Intervention Window
          </span>
        </div>
        <Badge className={cn("text-white text-xs", urgencyColors[timing.urgencyLevel])}>
          {timing.urgencyLevel.toUpperCase()}
        </Badge>
      </div>

      {/* Countdown */}
      <div className="bg-white rounded-lg p-3 border border-orange-200">
        <p className="text-xs text-gray-600 mb-1">Window closes in:</p>
        <div className="text-2xl font-bold text-orange-600">{timeLeft}</div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(timing.windowDeadline).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Success Probability Bars */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-700">Success Probability:</p>

        {[
          { label: 'Now', rate: timing.currentSuccessRate, color: 'bg-green-500' },
          { label: '24h', rate: timing.delayedSuccessRates['24h'], color: 'bg-amber-500' },
          { label: '48h', rate: timing.delayedSuccessRates['48h'], color: 'bg-orange-500' },
          { label: '72h', rate: timing.delayedSuccessRates['72h'], color: 'bg-red-500' }
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">{item.label}</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full", item.color)}
                style={{ width: `${item.rate * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-10 text-right">
              {Math.round(item.rate * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div className="bg-white/60 rounded-lg p-2 border border-orange-200">
        <div className="flex items-start gap-2">
          <TrendingDown className="h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-700">{timing.reasoning}</p>
        </div>
      </div>
    </div>
  );
}
```

**Integration in LinearDetailPanel:**

```typescript
// src/components/linear/LinearDetailPanel.tsx
import { InterventionTimer } from './InterventionTimer';

export function LinearDetailPanel({ ... }) {
  return (
    <motion.aside ...>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Risk Score Card */}
        ...

        {/* Email Body */}
        ...

        {/* NEW: Intervention Timing (for high-risk students) */}
        {riskScore >= 7 && (
          <InterventionTimer student={student} riskScore={riskScore} />
        )}

        {/* Outcome Stakes */}
        ...

        {/* Rest of sections */}
        ...
      </div>
    </motion.aside>
  );
}
```

---

## 3. Auto-Categorization & Root Cause Analysis 🔥🔥

### Where it Fits
1. **Email List Items** - Show category tags
2. **LinearDetailPanel** - Show root cause card
3. **LinearSidebar** - Filter by category (optional)

### Implementation

#### A. Category Tags on Email Items

**Update:** `src/components/linear/LinearEmailItem.tsx`

```typescript
// Add this after the student name
{email.categories && email.categories.length > 0 && (
  <div className="flex gap-1 mt-1">
    {email.categories.slice(0, 2).map(cat => (
      <span
        key={cat}
        className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200"
      >
        #{cat}
      </span>
    ))}
    {email.categories.length > 2 && (
      <span className="text-xs text-gray-500">+{email.categories.length - 2}</span>
    )}
  </div>
)}
```

#### B. Root Cause Card in Detail Panel

**File:** `src/components/linear/RootCauseCard.tsx`

```typescript
'use client';

import { AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RootCauseCardProps {
  rootCause: {
    primary: string;
    confidence: number;
    contributingFactors: string[];
    evidence: string;
  };
}

export function RootCauseCard({ rootCause }: RootCauseCardProps) {
  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-cyan-700" />
          <span className="text-xs font-semibold text-cyan-900 uppercase tracking-wider">
            Root Cause
          </span>
        </div>
        <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300 text-xs">
          {Math.round(rootCause.confidence * 100)}% confidence
        </Badge>
      </div>

      {/* Primary Issue */}
      <div className="bg-white rounded p-2 border border-cyan-200">
        <p className="text-sm font-medium text-gray-900">{rootCause.primary}</p>
      </div>

      {/* Contributing Factors */}
      {rootCause.contributingFactors.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-1">Contributing factors:</p>
          <div className="space-y-1">
            {rootCause.contributingFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                <ArrowRight className="h-3 w-3 text-cyan-600 mt-0.5 flex-shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      <div className="bg-white/60 rounded p-2 border border-cyan-200">
        <p className="text-xs text-gray-600 mb-1">Evidence:</p>
        <p className="text-xs text-gray-700 italic">{rootCause.evidence}</p>
      </div>
    </div>
  );
}
```

**Integration:**

```typescript
// In LinearDetailPanel
{email.rootCause && (
  <RootCauseCard rootCause={email.rootCause} />
)}
```

---

## 4. AI-Generated Multi-Step Action Plans 🔥🔥🔥

### Where it Fits
**Replace/enhance the "Generate AI Response" button in Quick Actions**

When clicked:
- Opens a modal OR
- Expands the detail panel to show full action plan

### Implementation

**File:** `src/components/linear/ActionPlanModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Step {
  step: number;
  title: string;
  timing: string;
  action: string;
  method: string;
  talkingPoints: string[];
  ifSuccessful: string;
  ifUnsuccessful: string;
}

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  analysis: any;
}

export function ActionPlanModal({ isOpen, onClose, student, analysis }: ActionPlanModalProps) {
  const [plan, setPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const generatePlan = async () => {
    setIsGenerating(true);
    const response = await fetch('/api/generate-action-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student, analysis })
    });
    const data = await response.json();
    setPlan(data.actionPlan);
    setIsGenerating(false);
  };

  const toggleStep = (step: number) => {
    setCompletedSteps(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Intervention Action Plan
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    For {student.name} • {analysis.riskScore}/10 Risk
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!plan && !isGenerating && (
                  <div className="text-center py-12">
                    <div className="mb-4 text-gray-400">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Generate Strategic Action Plan
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      AI will create a multi-step intervention strategy with contingency plans,
                      talking points, and success indicators.
                    </p>
                    <Button
                      onClick={generatePlan}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Generate Action Plan
                    </Button>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-3 py-8">
                    {['Analyzing student situation', 'Identifying intervention points', 'Building step-by-step strategy', 'Adding contingency plans'].map((text, idx) => (
                      <motion.div
                        key={text}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-700">{text}...</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {plan && (
                  <div className="space-y-4">
                    {/* Overview */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-sm text-purple-900 mb-2">
                        {plan.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-purple-700">
                        <span>Success Rate: {Math.round(plan.successRate * 100)}%</span>
                        <span>•</span>
                        <span>Duration: {plan.estimatedDuration}</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      {plan.steps.map((step: Step) => {
                        const isComplete = completedSteps.includes(step.step);

                        return (
                          <div
                            key={step.step}
                            className={cn(
                              "border-2 rounded-lg p-4 transition-all",
                              isComplete
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200 bg-white"
                            )}
                          >
                            <div className="flex gap-3">
                              {/* Step Number/Checkmark */}
                              <button
                                onClick={() => toggleStep(step.step)}
                                className={cn(
                                  "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                                  isComplete
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                              >
                                {isComplete ? '✓' : step.step}
                              </button>

                              {/* Content */}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm text-gray-900">
                                    {step.title}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {step.timing}
                                  </Badge>
                                </div>

                                <p className="text-xs text-gray-700">{step.action}</p>

                                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                  <span className="text-xs font-medium text-blue-900">
                                    Method: {step.method}
                                  </span>
                                </div>

                                {/* Talking Points */}
                                <details className="group">
                                  <summary className="cursor-pointer text-xs font-medium text-gray-700 list-none flex items-center gap-1">
                                    <span className="group-open:rotate-90 transition-transform">▸</span>
                                    Talking Points ({step.talkingPoints.length})
                                  </summary>
                                  <ul className="mt-2 space-y-1 pl-3">
                                    {step.talkingPoints.map((point, i) => (
                                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                        <span className="text-purple-500 mt-0.5">•</span>
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </details>

                                {/* Outcomes */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-green-50 border border-green-200 rounded p-2">
                                    <p className="font-medium text-green-900 mb-1">If Successful:</p>
                                    <p className="text-gray-700">{step.ifSuccessful}</p>
                                  </div>
                                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                    <p className="font-medium text-amber-900 mb-1">If Unsuccessful:</p>
                                    <p className="text-gray-700">{step.ifUnsuccessful}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Success Indicators */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Success Indicators
                      </h4>
                      <ul className="space-y-1">
                        {plan.successIndicators.map((indicator: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Escalation Triggers */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Escalation Triggers
                      </h4>
                      <ul className="space-y-1">
                        {plan.escalationTriggers.map((trigger: string, idx: number) => (
                          <li key={idx} className="text-xs text-red-800 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">⚠</span>
                            <span>{trigger}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {plan && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Follow-up: {plan.followUpSchedule}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPlan(null)}>
                      Generate New Plan
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Export Plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Integration:**

```typescript
// In LinearDetailPanel, replace "Generate AI Response" with:
const [actionPlanOpen, setActionPlanOpen] = useState(false);

<Button
  onClick={() => setActionPlanOpen(true)}
  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
>
  <Sparkles className="h-4 w-4 mr-2" />
  Generate Action Plan
</Button>

<ActionPlanModal
  isOpen={actionPlanOpen}
  onClose={() => setActionPlanOpen(false)}
  student={student}
  analysis={...}
/>
```

---

## 5. Email Conversation Threading 🔥🔥

### Where it Fits
**Email List** - Group related emails into threads

Shows:
- Thread indicator
- Impact metrics (if teacher responded)
- Engagement changes

### Implementation

**File:** `src/components/linear/ThreadedEmailItem.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ThreadedEmailItemProps {
  thread: {
    emails: any[];
    hasTeacherResponse: boolean;
    impactMetrics?: {
      wordCountChange: number;
      engagementIncrease: number;
    };
  };
  isSelected: boolean;
  onClick: () => void;
}

export function ThreadedEmailItem({ thread, isSelected, onClick }: ThreadedEmailItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const latestEmail = thread.emails[thread.emails.length - 1];

  return (
    <div
      className={cn(
        "border-b border-gray-100 hover:bg-gray-50 transition-colors",
        isSelected && "bg-purple-50 border-l-2 border-l-purple-600"
      )}
    >
      {/* Main email */}
      <div
        onClick={onClick}
        className="px-4 py-3 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 truncate">
                {latestEmail.from}
              </span>
              {thread.emails.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  {thread.emails.length} messages
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-700 line-clamp-2 mb-1">
              {latestEmail.body}
            </p>

            {/* Impact metrics */}
            {thread.hasTeacherResponse && thread.impactMetrics && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs">
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">Your response</span>
                </div>
                {thread.impactMetrics.wordCountChange > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">
                      +{thread.impactMetrics.wordCountChange}% engagement
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">
              {new Date(latestEmail.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Natural Language Command Bar 🔥

### Where it Fits
**Global** - Works from anywhere in the app

Press `Cmd+K` or `/` to open

### Implementation

Already provided in the guide! Just install `cmdk`:

```bash
npm install cmdk
```

Then add to the main dashboard:

```typescript
// In src/app/dashboard/page.tsx
import { CommandPalette } from '@/components/CommandPalette';

const handleCommand = (command: string) => {
  switch (command) {
    case 'show-high-risk':
      setActiveView('high-risk');
      break;
    case 'detect-patterns':
      // Trigger pattern detection
      break;
    // ... other commands
  }
};

return (
  <div className="h-screen flex flex-col bg-gray-50">
    <CommandPalette onCommand={handleCommand} />
    {/* rest of dashboard */}
  </div>
);
```

---

## Recommended Implementation Order

### Phase 1 (Quick Wins - 2 hours)
1. **Action Plan Modal** ⭐⭐⭐⭐⭐
   - Most impressive feature
   - Clean modal design
   - Easy to demo

2. **Command Palette** ⭐⭐⭐⭐
   - Minimal code (uses cmdk library)
   - Professional feel
   - Works everywhere

### Phase 2 (Medium Effort - 3 hours)
3. **Intervention Timer** ⭐⭐⭐⭐⭐
   - Unique feature
   - Fits perfectly in detail panel
   - Live countdown creates urgency

4. **Root Cause Card** ⭐⭐⭐⭐
   - Simple card component
   - Valuable insight
   - Easy integration

### Phase 3 (If Time - 4+ hours)
5. **Pattern Banner** ⭐⭐⭐⭐⭐
   - Shows sophisticated analysis
   - Collapsible/dismissable
   - Class-wide intelligence

6. **Email Threading** ⭐⭐⭐
   - Complex state management
   - Requires thread grouping logic
   - Good if you have time

---

## Visual Mockup

```
┌─────────────────────────────────────────────────────────────┐
│ LinearHeader                                     [Cmd+K ⌘]  │
├──────────┬──────────────────────────┬────────────────────────┤
│ Sidebar  │ Email List               │ Detail Panel           │
│          │┌────────────────────────┐│                        │
│ Inbox    ││ 🔥 Pattern Banner      ││ Student: Jake          │
│ High (3) ││ 3 patterns detected    ││ Risk: 8/10             │
│ Medium   ││ [View Details] [×]     ││                        │
│          │└────────────────────────┘│ ⏰ Intervention Timer  │
│          │                          ││ Window: 14h 23m        │
│ [NEW]    │ 📧 Jake Martinez         ││ Success: 73% → 28%    │
│ Patterns │ #anxiety #time-mgmt      ││                        │
│          │ Brief email...           ││ 🎯 Root Cause          │
│          │ ↳ Your response → +340% ││ Academic overwhelm     │
│          │                          ││ Confidence: 87%        │
│          │ 📧 Sarah Chen            ││                        │
│          │ Test anxiety...          ││ [Generate Action Plan] │
│          │                          ││                        │
│ 5 Tools  │                          ││ ▸ Red Flags (3)       │
│ Active   │                          ││ ▸ Full History (8)    │
└──────────┴──────────────────────────┴────────────────────────┘
```

---

## Key Design Principles for Linear Style

1. **Minimalist** - Clean, lots of whitespace
2. **Fast** - Smooth animations with Framer Motion
3. **Keyboard-first** - Cmd+K, shortcuts
4. **Progressive disclosure** - Collapsible sections (`<details>`)
5. **Subtle colors** - Gray-50 backgrounds, purple accents
6. **Clear hierarchy** - Section headers, badges, dividers

All features follow these principles and integrate seamlessly into your Linear-inspired design!
