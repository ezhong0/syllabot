# High-Impact Features Implementation Guide

This document outlines how to implement 6 sophisticated features that would elevate SyllaBot from a CRUD app to a cutting-edge AI teaching assistant.

---

## Table of Contents
1. [Cross-Student Pattern Detection](#1-cross-student-pattern-detection)
2. [Predictive Intervention Timing](#2-predictive-intervention-timing)
3. [Auto-Categorization & Root Cause Analysis](#3-auto-categorization--root-cause-analysis)
4. [AI-Generated Multi-Step Action Plans](#4-ai-generated-multi-step-action-plans)
5. [Email Conversation Threading with Impact Analysis](#5-email-conversation-threading-with-impact-analysis)
6. [Natural Language Command Bar](#6-natural-language-command-bar)

---

## 1. Cross-Student Pattern Detection

### Concept
Detect patterns ACROSS multiple students to identify systemic issues (e.g., "3 students declined after Monday's test", "5 students show anxiety markers this week").

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Dashboard                                      │
│  ├─ Pattern Detection Panel (new component)    │
│  │  └─ Shows cross-student insights            │
│  └─ Student cards now show "part of pattern"   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  API Route: /api/detect-patterns                │
│  ├─ Takes: All student data                    │
│  ├─ Claude analyzes: Temporal correlations     │
│  └─ Returns: Pattern objects                   │
└─────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1: Create Pattern Detection API Route

**File:** `src/app/api/detect-patterns/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { StudentProfile } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  const { students, timeWindow } = await request.json();

  try {
    // Build context for Claude about all students
    const studentSummaries = students.map((s: StudentProfile) => ({
      id: s.id,
      name: s.name,
      recentEmails: s.interactions.filter(i => i.type === 'email').slice(0, 3),
      riskScore: s.aiInsight.confidence,
      recentGrades: s.interactions.filter(i => i.type === 'grade').slice(0, 2),
      absences: s.interactions.filter(i => i.type === 'absence').length
    }));

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are an expert educational data analyst. Analyze these ${students.length} students for CROSS-STUDENT PATTERNS.

STUDENT DATA:
${JSON.stringify(studentSummaries, null, 2)}

TIME WINDOW: ${timeWindow || 'Past 7 days'}

DETECT:
1. Temporal patterns (multiple students changed behavior at same time)
2. Common triggers (test anxiety, assignment deadlines, etc.)
3. Cohort trends (groups declining together)
4. Systemic issues (class-wide problems)

Return JSON array of patterns:
[
  {
    "type": "temporal_correlation" | "shared_trigger" | "cohort_decline" | "systemic_issue",
    "title": "Brief title",
    "description": "What's happening",
    "students": ["student-id-1", "student-id-2"],
    "severity": "high" | "medium" | "low",
    "confidence": 0.85,
    "recommendation": "What teacher should do",
    "timeline": "When this started"
  }
]

Respond ONLY with valid JSON array.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const patterns = JSON.parse(content.text);

    return NextResponse.json({ patterns });
  } catch (error) {
    console.error('[Pattern Detection] Error:', error);
    return NextResponse.json({
      patterns: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

#### Step 2: Create Pattern Detection Component

**File:** `src/components/PatternDetectionPanel.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, AlertTriangle, Users } from 'lucide-react';
import type { StudentProfile } from '@/types';

interface Pattern {
  type: 'temporal_correlation' | 'shared_trigger' | 'cohort_decline' | 'systemic_issue';
  title: string;
  description: string;
  students: string[];
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  recommendation: string;
  timeline: string;
}

interface PatternDetectionPanelProps {
  students: StudentProfile[];
}

export function PatternDetectionPanel({ students }: PatternDetectionPanelProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectPatterns = async () => {
    setIsDetecting(true);
    try {
      const response = await fetch('/api/detect-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: Object.values(students),
          timeWindow: 'Past 7 days'
        })
      });

      const data = await response.json();
      setPatterns(data.patterns || []);
    } catch (error) {
      console.error('Failed to detect patterns:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'temporal_correlation': return <TrendingDown className="h-4 w-4" />;
      case 'cohort_decline': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">🔍</span>
            Cross-Student Pattern Detection
          </CardTitle>
          <Button
            onClick={detectPatterns}
            disabled={isDetecting}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isDetecting ? 'Detecting...' : 'Scan for Patterns'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {patterns.length === 0 && !isDetecting && (
          <p className="text-sm text-gray-600 italic">
            Click "Scan for Patterns" to analyze cross-student trends
          </p>
        )}

        {isDetecting && (
          <div className="space-y-2">
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-4 w-4 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-purple-700">Analyzing temporal correlations...</span>
            </div>
            <div className="animate-pulse flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
              <div className="h-4 w-4 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-purple-700">Detecting cohort trends...</span>
            </div>
            <div className="animate-pulse flex items-center gap-2" style={{ animationDelay: '0.4s' }}>
              <div className="h-4 w-4 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-purple-700">Identifying systemic issues...</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {patterns.map((pattern, idx) => (
            <Card key={idx} className={`border-2 ${getSeverityColor(pattern.severity)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getPatternIcon(pattern.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{pattern.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(pattern.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2">{pattern.description}</p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {pattern.students.map(studentId => (
                        <Badge key={studentId} className="text-xs bg-white">
                          {students.find(s => s.id === studentId)?.name.split(' ')[0]}
                        </Badge>
                      ))}
                    </div>

                    <div className="bg-white/50 rounded p-2 mt-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Recommendation:</p>
                      <p className="text-xs text-gray-600">{pattern.recommendation}</p>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Timeline: {pattern.timeline}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Step 3: Add to Dashboard

**File:** `src/app/dashboard/page.tsx`

```typescript
import { PatternDetectionPanel } from '@/components/PatternDetectionPanel';

// Inside the main grid, add a new section:
<div className="lg:col-span-3 mb-6">
  <PatternDetectionPanel students={Object.values(STUDENTS)} />
</div>
```

#### Step 4: Update Types (if needed)

**File:** `src/types/index.ts`

```typescript
export interface Pattern {
  type: 'temporal_correlation' | 'shared_trigger' | 'cohort_decline' | 'systemic_issue';
  title: string;
  description: string;
  students: string[];
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  recommendation: string;
  timeline: string;
}
```

---

## 2. Predictive Intervention Timing

### Concept
Calculate optimal intervention windows with countdown timers and success probability forecasting.

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Student Panel                                  │
│  ├─ Intervention Window Card (new)             │
│  │  ├─ Countdown timer                         │
│  │  ├─ Success probability chart               │
│  │  └─ "Act now" vs "Wait" analysis            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  API Route: /api/calculate-intervention-window  │
│  ├─ Takes: Student data, current timestamp     │
│  ├─ Claude calculates: Optimal timing          │
│  └─ Returns: Window object with probabilities  │
└─────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1: Create Intervention Timing API

**File:** `src/app/api/calculate-intervention-window/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  const { student, currentTime } = await request.json();

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an expert in educational psychology and intervention timing.

STUDENT DATA:
- Name: ${student.name}
- Risk Score: ${student.aiInsight.confidence}%
- Recent Pattern: ${student.aiInsight.pattern}
- Last Email: ${student.interactions[0]?.date}
- Communication Decline: ${student.interactions[0]?.details?.split(/\s+/).length || 0} words (baseline: ${student.baseline.avgWordCount})

CURRENT TIME: ${currentTime}

Calculate the optimal intervention window. Consider:
1. How urgently they need contact
2. Historical response patterns
3. Degradation rate of engagement
4. Recovery probability over time

Return JSON:
{
  "optimalWindowHours": 18,
  "windowDeadline": "2025-10-25T14:00:00Z",
  "currentSuccessRate": 0.73,
  "delayedSuccessRates": {
    "24h": 0.68,
    "48h": 0.51,
    "72h": 0.28
  },
  "urgencyLevel": "high" | "medium" | "low",
  "reasoning": "Why this timing is critical",
  "recommendedChannel": "email" | "in-person" | "phone"
}

Respond ONLY with valid JSON.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const timing = JSON.parse(content.text);

    return NextResponse.json({ timing });
  } catch (error) {
    console.error('[Intervention Timing] Error:', error);
    return NextResponse.json({
      timing: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

#### Step 2: Create Intervention Window Component

**File:** `src/components/InterventionWindow.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingDown, AlertCircle } from 'lucide-react';
import type { StudentProfile } from '@/types';

interface InterventionTiming {
  optimalWindowHours: number;
  windowDeadline: string;
  currentSuccessRate: number;
  delayedSuccessRates: {
    '24h': number;
    '48h': number;
    '72h': number;
  };
  urgencyLevel: 'high' | 'medium' | 'low';
  reasoning: string;
  recommendedChannel: string;
}

interface InterventionWindowProps {
  student: StudentProfile;
}

export function InterventionWindow({ student }: InterventionWindowProps) {
  const [timing, setTiming] = useState<InterventionTiming | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const calculateWindow = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/calculate-intervention-window', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          currentTime: new Date().toISOString()
        })
      });

      const data = await response.json();
      setTiming(data.timing);
    } catch (error) {
      console.error('Failed to calculate timing:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (timing) {
      const interval = setInterval(() => {
        const deadline = new Date(timing.windowDeadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining('Window closed');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timing]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Intervention Window
          </CardTitle>
          {!timing && (
            <Button
              onClick={calculateWindow}
              disabled={isCalculating}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Timing'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!timing && !isCalculating && (
          <p className="text-sm text-gray-600 italic">
            Calculate optimal intervention timing for maximum impact
          </p>
        )}

        {isCalculating && (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-orange-700">Analyzing temporal dynamics...</span>
          </div>
        )}

        {timing && (
          <div className="space-y-4">
            {/* Countdown */}
            <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Optimal Window Closes In:</span>
                <Badge className={`${getUrgencyColor(timing.urgencyLevel)} text-white`}>
                  {timing.urgencyLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-orange-600">{timeRemaining}</div>
              <p className="text-xs text-gray-500 mt-1">
                Deadline: {new Date(timing.windowDeadline).toLocaleString()}
              </p>
            </div>

            {/* Success Rates */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Success Probability Over Time:</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Now</span>
                      <span className="text-xs font-semibold text-green-700">
                        {Math.round(timing.currentSuccessRate * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${timing.currentSuccessRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">In 24h</span>
                      <span className="text-xs font-semibold text-amber-700">
                        {Math.round(timing.delayedSuccessRates['24h'] * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${timing.delayedSuccessRates['24h'] * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">In 48h</span>
                      <span className="text-xs font-semibold text-orange-700">
                        {Math.round(timing.delayedSuccessRates['48h'] * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${timing.delayedSuccessRates['48h'] * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">In 72h</span>
                      <span className="text-xs font-semibold text-red-700">
                        {Math.round(timing.delayedSuccessRates['72h'] * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${timing.delayedSuccessRates['72h'] * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-white/60 rounded p-3 border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Why This Timing:</p>
                  <p className="text-xs text-gray-600">{timing.reasoning}</p>
                </div>
              </div>
            </div>

            {/* Recommended Channel */}
            <div className="text-center">
              <Badge className="bg-orange-600 text-white">
                Recommended: {timing.recommendedChannel}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Step 3: Add to Student Panel

**File:** `src/app/dashboard/page.tsx`

```typescript
import { InterventionWindow } from '@/components/InterventionWindow';

// Inside the student panel, after the AI Insight section:
<TabsContent value="timing" className="space-y-4 mt-4">
  <InterventionWindow student={selectedStudent} />
</TabsContent>
```

---

## 3. Auto-Categorization & Root Cause Analysis

### Concept
Automatically tag emails with categories (`#anxiety`, `#time-management`) and identify root causes with confidence scores.

### Implementation Steps

#### Step 1: Update Analysis API to Include Categories

**File:** `src/app/api/analyze-email/route.ts`

Update the Claude prompt:

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: `...existing prompt...

ADDITIONAL ANALYSIS REQUIRED:

7. categories: array of tags from: ["anxiety", "time-management", "academic-struggle", "family-issues", "test-stress", "engagement-decline", "help-seeking", "overwhelmed"]
8. rootCause: {
     "primary": "main underlying issue",
     "confidence": 0.85,
     "contributingFactors": ["factor1", "factor2"],
     "evidence": "What in the email supports this"
   }

Return JSON with all fields.`
  }]
});
```

#### Step 2: Create Category Filter Component

**File:** `src/components/CategoryFilter.tsx`

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'anxiety': 'bg-amber-100 text-amber-800 border-amber-300',
  'time-management': 'bg-blue-100 text-blue-800 border-blue-300',
  'academic-struggle': 'bg-red-100 text-red-800 border-red-300',
  'family-issues': 'bg-purple-100 text-purple-800 border-purple-300',
  'test-stress': 'bg-orange-100 text-orange-800 border-orange-300',
  'engagement-decline': 'bg-gray-100 text-gray-800 border-gray-300',
  'help-seeking': 'bg-green-100 text-green-800 border-green-300',
  'overwhelmed': 'bg-pink-100 text-pink-800 border-pink-300',
};

export function CategoryFilter({ categories, selectedCategories, onToggleCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <Badge
          key={category}
          className={`cursor-pointer border-2 ${
            selectedCategories.includes(category)
              ? CATEGORY_COLORS[category] + ' opacity-100'
              : 'bg-gray-50 text-gray-400 border-gray-200 opacity-50'
          }`}
          onClick={() => onToggleCategory(category)}
        >
          #{category}
        </Badge>
      ))}
      {selectedCategories.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedCategories.forEach(onToggleCategory)}
          className="text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
```

#### Step 3: Add Root Cause Display

**File:** `src/components/RootCauseAnalysis.tsx`

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface RootCause {
  primary: string;
  confidence: number;
  contributingFactors: string[];
  evidence: string;
}

interface RootCauseAnalysisProps {
  rootCause: RootCause;
}

export function RootCauseAnalysis({ rootCause }: RootCauseAnalysisProps) {
  return (
    <Card className="border-2 border-cyan-200 bg-cyan-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Root Cause Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Primary Issue:</span>
            <Badge className="bg-cyan-600 text-white">
              {Math.round(rootCause.confidence * 100)}% confidence
            </Badge>
          </div>
          <p className="text-sm text-gray-800 font-medium">{rootCause.primary}</p>
        </div>

        {rootCause.contributingFactors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Contributing Factors:</p>
            <div className="flex flex-wrap gap-1">
              {rootCause.contributingFactors.map((factor, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/60 rounded p-3 border border-cyan-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">Evidence:</p>
          <p className="text-xs text-gray-600 italic">{rootCause.evidence}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 4. AI-Generated Multi-Step Action Plans

### Concept
Generate complete intervention strategies with sequential steps, contingency plans, and success metrics.

### Implementation Steps

#### Step 1: Create Action Plan API

**File:** `src/app/api/generate-action-plan/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  const { student, analysis } = await request.json();

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are an expert educational intervention strategist.

STUDENT: ${student.name}
RISK LEVEL: ${analysis.riskScore}/10
PATTERN: ${analysis.communicationPattern}
ISSUE: ${analysis.riskReasoning}

Create a MULTI-STEP ACTION PLAN for teacher intervention.

Return JSON:
{
  "title": "Intervention Plan for [Name]",
  "successRate": 0.87,
  "estimatedDuration": "5-7 days",
  "steps": [
    {
      "step": 1,
      "title": "Initial Contact",
      "timing": "Within 18 hours",
      "action": "What to do",
      "method": "email" | "in-person" | "phone",
      "talkingPoints": ["point1", "point2"],
      "expectedOutcome": "What you hope happens",
      "ifSuccessful": "Next step if it works",
      "ifUnsuccessful": "Fallback plan"
    }
  ],
  "successIndicators": ["sign1", "sign2"],
  "escalationTriggers": ["trigger1", "trigger2"],
  "followUpSchedule": "When to check back"
}

Respond ONLY with valid JSON.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const actionPlan = JSON.parse(content.text);

    return NextResponse.json({ actionPlan });
  } catch (error) {
    console.error('[Action Plan] Error:', error);
    return NextResponse.json({
      actionPlan: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

#### Step 2: Create Action Plan Component

**File:** `src/components/ActionPlanGenerator.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import type { StudentProfile } from '@/types';

interface ActionPlanStep {
  step: number;
  title: string;
  timing: string;
  action: string;
  method: string;
  talkingPoints: string[];
  expectedOutcome: string;
  ifSuccessful: string;
  ifUnsuccessful: string;
}

interface ActionPlan {
  title: string;
  successRate: number;
  estimatedDuration: string;
  steps: ActionPlanStep[];
  successIndicators: string[];
  escalationTriggers: string[];
  followUpSchedule: string;
}

interface ActionPlanGeneratorProps {
  student: StudentProfile;
  analysis: any;
}

export function ActionPlanGenerator({ student, analysis }: ActionPlanGeneratorProps) {
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student, analysis })
      });

      const data = await response.json();
      setActionPlan(data.actionPlan);
    } catch (error) {
      console.error('Failed to generate action plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum)
        ? prev.filter(s => s !== stepNum)
        : [...prev, stepNum]
    );
  };

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-xl">📋</span>
            AI Action Plan
          </CardTitle>
          {!actionPlan && (
            <Button
              onClick={generatePlan}
              disabled={isGenerating}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Plan'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!actionPlan && !isGenerating && (
          <p className="text-sm text-gray-600 italic">
            Generate a strategic intervention plan with step-by-step guidance
          </p>
        )}

        {isGenerating && (
          <div className="space-y-2">
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-4 w-4 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-700">Analyzing student situation...</span>
            </div>
            <div className="animate-pulse flex items-center gap-2" style={{ animationDelay: '0.3s' }}>
              <div className="h-4 w-4 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-700">Designing intervention strategy...</span>
            </div>
          </div>
        )}

        {actionPlan && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <h4 className="font-bold text-sm mb-2">{actionPlan.title}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{Math.round(actionPlan.successRate * 100)}% success rate</span>
                </div>
                <div>Duration: {actionPlan.estimatedDuration}</div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {actionPlan.steps.map((step, idx) => (
                <Card
                  key={step.step}
                  className={`border-2 ${
                    completedSteps.includes(step.step)
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Step Number */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          completedSteps.includes(step.step)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {completedSteps.includes(step.step) ? '✓' : step.step}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm">{step.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {step.timing}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-700 mb-3">{step.action}</p>

                        <div className="space-y-2">
                          <div className="bg-blue-50 rounded p-2 border border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-1">
                              Method: {step.method}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-1">Talking Points:</p>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                              {step.talkingPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 rounded p-2 border border-green-200">
                              <p className="text-xs font-semibold text-green-900 mb-1">
                                If Successful:
                              </p>
                              <p className="text-xs text-gray-600">{step.ifSuccessful}</p>
                            </div>
                            <div className="bg-amber-50 rounded p-2 border border-amber-200">
                              <p className="text-xs font-semibold text-amber-900 mb-1">
                                If No Response:
                              </p>
                              <p className="text-xs text-gray-600">{step.ifUnsuccessful}</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => toggleStepComplete(step.step)}
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                        >
                          {completedSteps.includes(step.step)
                            ? 'Mark Incomplete'
                            : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Success Indicators */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Success Indicators to Watch For:
              </p>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {actionPlan.successIndicators.map((indicator, idx) => (
                  <li key={idx}>{indicator}</li>
                ))}
              </ul>
            </div>

            {/* Escalation Triggers */}
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-900 mb-2">
                    Escalation Triggers (Contact counselor if you see):
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                    {actionPlan.escalationTriggers.map((trigger, idx) => (
                      <li key={idx}>{trigger}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Follow-up Schedule */}
            <div className="text-center text-xs text-gray-600">
              Follow-up: {actionPlan.followUpSchedule}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 5. Email Conversation Threading with Impact Analysis

### Concept
Track email → response → student reaction sequences and measure which teacher responses actually work.

### Implementation Steps

#### Step 1: Create Threading Logic

**File:** `src/lib/email-threading.ts`

```typescript
import type { DemoEmail, StudentProfile } from '@/types';

interface EmailThread {
  id: string;
  studentId: string;
  emails: DemoEmail[];
  teacherResponses: Array<{
    response: string;
    timestamp: string;
  }>;
  impactMetrics: {
    wordCountChange: number;
    sentimentChange: string;
    engagementIncrease: number;
    nextEmailTiming: string;
  };
}

export function buildEmailThreads(
  emails: DemoEmail[],
  teacherResponses: any[],
  student: StudentProfile
): EmailThread[] {
  // Group emails by student
  const studentEmails = emails
    .filter(e => e.studentId === student.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const threads: EmailThread[] = [];
  let currentThread: DemoEmail[] = [];

  studentEmails.forEach((email, idx) => {
    currentThread.push(email);

    // Check if there's a teacher response after this email
    const teacherResponse = teacherResponses.find(
      r => r.studentId === student.id &&
           new Date(r.timestamp) > new Date(email.timestamp)
    );

    if (teacherResponse) {
      // Calculate impact if there's a next email
      const nextEmail = studentEmails[idx + 1];
      let impactMetrics = null;

      if (nextEmail) {
        const wordCountChange = nextEmail.wordCount - email.wordCount;
        const wordCountChangePercent = (wordCountChange / email.wordCount) * 100;

        impactMetrics = {
          wordCountChange: Math.round(wordCountChangePercent),
          sentimentChange: `${email.sentiment} → ${nextEmail.sentiment}`,
          engagementIncrease: wordCountChangePercent,
          nextEmailTiming: calculateTimeDiff(email.timestamp, nextEmail.timestamp)
        };
      }

      threads.push({
        id: `thread-${threads.length}`,
        studentId: student.id,
        emails: [...currentThread],
        teacherResponses: [teacherResponse],
        impactMetrics: impactMetrics || {
          wordCountChange: 0,
          sentimentChange: 'unknown',
          engagementIncrease: 0,
          nextEmailTiming: 'awaiting response'
        }
      });

      currentThread = [];
    }
  });

  return threads;
}

function calculateTimeDiff(timestamp1: string, timestamp2: string): string {
  const diff = new Date(timestamp2).getTime() - new Date(timestamp1).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} days`;
  return `${hours} hours`;
}
```

#### Step 2: Create Thread Visualization Component

**File:** `src/components/EmailThreadView.tsx`

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { DemoEmail } from '@/types';

interface EmailThread {
  id: string;
  studentId: string;
  emails: DemoEmail[];
  teacherResponses: Array<{
    response: string;
    timestamp: string;
  }>;
  impactMetrics: {
    wordCountChange: number;
    sentimentChange: string;
    engagementIncrease: number;
    nextEmailTiming: string;
  };
}

interface EmailThreadViewProps {
  threads: EmailThread[];
}

export function EmailThreadView({ threads }: EmailThreadViewProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">
        Conversation Threads & Impact Analysis
      </h4>

      {threads.map(thread => (
        <Card key={thread.id} className="border-2 border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            {/* Email Sequence */}
            <div className="space-y-3">
              {thread.emails.map((email, idx) => (
                <div key={email.id}>
                  {/* Student Email */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Student Email
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {email.wordCount} words
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{email.body}</p>
                  </div>

                  {/* Teacher Response (if exists) */}
                  {thread.teacherResponses[idx] && (
                    <>
                      <div className="flex items-center justify-center py-2">
                        <ArrowRight className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <Badge className="bg-green-600 text-white text-xs mb-2">
                          Your Response
                        </Badge>
                        <p className="text-xs text-gray-700 line-clamp-2">
                          {thread.teacherResponses[idx].response}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Impact Metrics */}
              {thread.impactMetrics.wordCountChange !== 0 && (
                <div className="bg-white rounded-lg p-3 border-2 border-indigo-300 mt-3">
                  <p className="text-xs font-semibold text-indigo-900 mb-2">
                    Response Impact:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Word Count Change:</p>
                      <div className="flex items-center gap-1">
                        {thread.impactMetrics.wordCountChange > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              +{thread.impactMetrics.wordCountChange}%
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                              {thread.impactMetrics.wordCountChange}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Response Time:</p>
                      <span className="text-sm font-semibold text-gray-800">
                        {thread.impactMetrics.nextEmailTiming}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Sentiment:</p>
                    <span className="text-xs font-medium">
                      {thread.impactMetrics.sentimentChange}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 6. Natural Language Command Bar

### Concept
Press `/` or `Cmd+K` to execute natural language commands.

### Implementation Steps

#### Step 1: Install Dependencies

```bash
npm install cmdk
```

#### Step 2: Create Command Palette Component

**File:** `src/components/CommandPalette.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Mail, Filter, TrendingUp, Users } from 'lucide-react';

interface CommandPaletteProps {
  onCommand: (command: string, args?: any) => void;
}

export function CommandPalette({ onCommand }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === '/') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]">
      <Command className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border-2 border-purple-300">
        <div className="flex items-center gap-2 px-4 border-b border-gray-200">
          <Search className="h-4 w-4 text-gray-400" />
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full py-3 text-sm outline-none"
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Quick Actions">
            <Command.Item
              onSelect={() => {
                onCommand('show-high-risk');
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Show high-risk students</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onCommand('draft-all-responses');
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm">Draft responses for all high-risk students</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onCommand('detect-patterns');
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">Detect cross-student patterns</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onCommand('show-no-response');
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Who hasn't responded in 3+ days?</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Students">
            <Command.Item className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer">
              <span className="text-sm">Jump to Jake Martinez</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer">
              <span className="text-sm">Jump to Sarah Chen</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer">
              <span className="text-sm">Jump to Emma Johnson</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 px-3 py-2 rounded hover:bg-purple-50 cursor-pointer">
              <span className="text-sm">Jump to Miguel Rodriguez</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">ESC</kbd> to close</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">⌘K</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">/</kbd> to open</span>
        </div>
      </Command>

      {/* Backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
```

#### Step 3: Wire Up to Dashboard

**File:** `src/app/dashboard/page.tsx`

```typescript
import { CommandPalette } from '@/components/CommandPalette';

// Add state
const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

// Add command handler
const handleCommand = (command: string, args?: any) => {
  switch (command) {
    case 'show-high-risk':
      setAiToggle(true);
      // Filter to only high-risk students
      break;
    case 'draft-all-responses':
      // Trigger batch response generation
      break;
    case 'detect-patterns':
      // Trigger pattern detection
      break;
    case 'show-no-response':
      // Filter students who haven't responded in 3+ days
      break;
  }
};

// Add to JSX
return (
  <div>
    <CommandPalette onCommand={handleCommand} />
    {/* rest of dashboard */}
  </div>
);
```

---

## Summary: Implementation Priority

### Quick Wins (1-2 hours each):
1. ✅ **AI-Generated Action Plans** - Most impressive for demo
2. ✅ **Natural Language Command Bar** - Shows sophistication

### Medium Effort (2-4 hours each):
3. ✅ **Predictive Intervention Timing** - Unique feature
4. ✅ **Auto-Categorization & Root Cause** - Useful filtering

### Higher Effort (4-6 hours each):
5. ✅ **Cross-Student Pattern Detection** - Requires aggregation logic
6. ✅ **Email Threading & Impact** - Requires relationship tracking

---

## Next Steps

1. Choose 1-2 features to implement first
2. Start with Action Plans (easiest, biggest impact)
3. Add Command Palette for "wow factor"
4. Test each feature thoroughly
5. Update demo script to showcase new capabilities

All features use existing infrastructure (Claude API, current data structures) so they integrate cleanly without major refactoring.
