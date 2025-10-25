# Phase 2: Comprehensive Hackathon Build Roadmap
**Event:** VIBE25-4 - Friday Oct 24, 6-10 PM
**Strategy:** Phased delivery with working features at each checkpoint
**Philosophy:** Ship incrementally, test constantly, have fallback positions

---

## 📊 Current State Analysis (Complete Scan)

### ✅ **What's DONE (Backend - 100%)**

**Data Layer (Complete):**
- ✅ 608 lines of demo data (`src/data/demo-emails.ts`)
- ✅ 4 complete student profiles (Jake, Sarah, Miguel, Emma)
- ✅ All V2 fields populated:
  - `confidenceBreakdown` (4 factors each for Jake/Sarah/Miguel, 3 for Emma)
  - `projectedOutcomes` (all 4 students)
  - `engagementTimeline` (8 data points each)
- ✅ Full interaction histories
- ✅ Red flags with deviations
- ✅ AI insights with recommendations

**Integration Layer (Complete):**
- ✅ Stack Auth (`src/lib/auth.ts`)
- ✅ s2.dev (`src/lib/s2.ts`)
- ✅ Lingo.dev (`src/lib/lingo.ts`)
- ✅ Cactus Compute (`src/lib/cactus.ts`)
- ✅ Random Labs Slate (3 components generated)
- ✅ Claude AI (`src/lib/ai.ts`) with Cactus tracking
- ✅ **All integration tests passing (6/6)**

**Component Library (Complete):**
- ✅ shadcn/ui components installed (Card, Badge, Avatar, Progress, Tabs, etc.)
- ✅ Slate-generated utilities:
  - `risk-badge.ts` - Risk score styling
  - `timeline-utils.ts` - Timeline data generation
  - `ConfidenceIndicator.tsx` - Confidence visualization
- ✅ MobilePreview component (investor showcase)

**TypeScript Types (Complete):**
- ✅ All interfaces defined in `src/types/index.ts`
- ✅ Full type safety across codebase
- ✅ No TypeScript errors (aside from test files - non-blocking)

### ❌ **What's MISSING (Frontend - 0%)**

**UI Layer (Nothing Built):**
- ❌ No dashboard page (folder exists, empty)
- ❌ No email inbox view
- ❌ No email cards
- ❌ No AI toggle
- ❌ No student context panel
- ❌ No timeline visualization
- ❌ No risk scoring display
- ❌ Landing page still has default Next.js content

**Critical Path:** We have 100% of backend, 0% of frontend. Friday is 100% UI build.

---

## 🎯 Pre-Hackathon Tasks (TONIGHT - 30 min)

### Task 1: Commit Slate Components (5 min)
```bash
cd /Users/edwardzhong/Projects/vibe254/syllabot

git add src/lib/slate-generated/ src/components/slate-generated/
git commit -m "feat: Add Slate-generated utilities (Random Labs Slate)

Generated 3 components using Random Labs Slate CLI:
- risk-badge.ts: Risk score color coding utilities
- timeline-utils.ts: Timeline data generation with variance
- ConfidenceIndicator.tsx: Confidence visualization component

This completes our 5/5 sponsor tool integration."
```

- [ ] Slate components committed with attribution

### Task 2: Update README (15 min)

Update the integrations section in `README.md`:

```markdown
### Integrations (5 Official Tools - 25% Bonus)

1. **Stack Auth (YC F24)** - Teacher authentication
   - Secure login/signup flow
   - Session management with cookies
   - Files: `src/lib/auth.ts`, `src/stack/client.ts`

2. **s2.dev (YC F25)** - Activity event streaming
   - Real-time teacher behavior analytics
   - Activity feed logging
   - Files: `src/lib/s2.ts`

3. **Lingo.dev (YC F24)** - AI-powered translation
   - Culturally-adapted parent communication
   - Supports 10+ languages with tone adaptation
   - Files: `src/lib/lingo.ts`

4. **Cactus Compute (YC S25)** - Performance telemetry
   - Tracks AI latency for mobile-readiness
   - Mobile architecture planning (React Native + Cactus SDK)
   - Files: `src/lib/cactus.ts`, `src/components/MobilePreview.tsx`

5. **Random Labs Slate (YC S24)** - Code generation
   - Generated risk visualization utilities
   - Generated timeline components
   - Files: `src/lib/slate-generated/`, `src/components/slate-generated/`
   - See: `SLATE_CODEGEN.md` for generation log

**Plus:** Anthropic Claude 3.7 Sonnet for AI analysis

**Tool Bonus:** +25% (5/5 sponsor tools integrated)
```

- [ ] README updated

### Task 3: Final Pre-Flight Check (10 min)

```bash
# Verify everything compiles
npm run build

# Run integration tests
npx tsx scripts/test-integrations.ts

# Check git status
git status

# Create checkpoint commit
git add .
git commit -m "chore: Pre-hackathon checkpoint - All 5 tools integrated

Backend complete:
- 4 student profiles with full V2 data
- All 5 sponsor tools integrated and tested
- Slate components generated
- README updated

Ready for Friday UI build (6-10 PM)."
```

- [ ] Build succeeds
- [ ] Integration tests pass
- [ ] Clean git status
- [ ] Checkpoint commit created

**⏱️ Total Time: 30 minutes**

---

## 🚀 Friday Hackathon: 4-Hour Phased Build (6-10 PM)

**Philosophy:**
1. **Build in phases** - Each phase delivers working features
2. **Test at checkpoints** - Verify features work before moving on
3. **Have fallback positions** - Know what to cut if time runs short
4. **Ship incrementally** - Commit working code at each phase

---

## 🎯 Phase 1: Foundation + Toggle (6:00-7:00 PM)

**Goal:** Get basic dashboard with THE killer feature - the AI toggle transformation

**Priority:** 🔴 CRITICAL - This is the demo

### Step 1.1: Create Dashboard Layout (15 min)

**File:** `src/app/dashboard/page.tsx`

```typescript
import { stackServerApp } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { DEMO_INBOX, STUDENTS } from "@/data/demo-emails";

export default async function DashboardPage() {
  // Server-side auth check
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-in");
  }

  // Prepare email data with student profiles and risk scores
  const emails = DEMO_INBOX.map(email => {
    const student = STUDENTS[email.studentId];
    const riskScore = student.redFlags.length * 2.5; // Simple calculation
    return {
      ...email,
      student,
      riskScore
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardClient emails={emails} user={user} />
    </div>
  );
}
```

**File:** `src/app/dashboard/DashboardClient.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { DemoEmail, StudentProfile } from '@/types';
import { getRiskScoreBadge } from '@/lib/slate-generated/risk-badge';

interface EmailWithProfile extends DemoEmail {
  student: StudentProfile;
  riskScore: number;
}

interface Props {
  emails: EmailWithProfile[];
  user: any;
}

export function DashboardClient({ emails, user }: Props) {
  const [aiMode, setAiMode] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // KEY FEATURE: Toggle sorting
  const sortedEmails = aiMode
    ? [...emails].sort((a, b) => b.riskScore - a.riskScore)
    : emails; // Keep original order (chronological)

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">SyllaBot</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Welcome, {user.displayName || 'Teacher'}
          </p>
        </div>

        {/* THE TOGGLE - Core Demo Feature */}
        <div className="flex gap-2 p-1 bg-zinc-200 rounded-lg">
          <button
            onClick={() => setAiMode(false)}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              !aiMode
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            📧 Standard View
          </button>
          <button
            onClick={() => setAiMode(true)}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              aiMode
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            🧠 AI Mode
          </button>
        </div>
      </div>

      {/* Email Cards */}
      <div className="space-y-3">
        {sortedEmails.map((email, index) => {
          const riskBadge = getRiskScoreBadge(email.riskScore);

          return (
            <Card
              key={email.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedEmailId === email.id ? 'ring-2 ring-purple-600' : ''
              }`}
              onClick={() => setSelectedEmailId(email.id)}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={email.student.photoUrl} />
                  <AvatarFallback>{email.student.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {email.student.name}
                      </h3>
                      {/* Show position change in AI mode */}
                      {aiMode && index === 0 && email.riskScore >= 7 && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                          ↑ Moved to top
                        </span>
                      )}
                    </div>

                    {/* Risk badge - only show in AI mode */}
                    {aiMode && email.riskScore >= 4 && (
                      <Badge
                        className={`${riskBadge.bgColor} ${riskBadge.color} ${riskBadge.borderColor} border`}
                      >
                        {riskBadge.icon} {email.riskScore}/10 Risk
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-zinc-600 mb-2">{email.subject}</p>
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {email.body}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span>{new Date(email.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>Grade: {email.student.currentGrade}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

### ✅ Checkpoint 1A (6:45 PM): Working Toggle

**Test:**
```bash
npm run dev
# Visit http://localhost:3000/dashboard
```

**Should See:**
- [ ] 4 email cards displayed
- [ ] Toggle button between Standard/AI mode
- [ ] Clicking AI mode: Jake jumps to #1
- [ ] Risk badge shows for high-risk students in AI mode
- [ ] Clean, professional styling

**Fallback:** If authentication blocks, temporarily remove auth check

**⏱️ Time Check: 45 minutes elapsed** | **Must Have: Toggle working**

---

## 🎯 Phase 2: Student Context Panel (7:00-8:00 PM)

**Goal:** Click student → See deep context with timeline

**Priority:** 🔴 CRITICAL - This proves AI sophistication

### Step 2.1: Create Student Panel Component (45 min)

**File:** `src/app/dashboard/StudentPanel.tsx`

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { X, TrendingDown, AlertTriangle } from 'lucide-react';
import type { StudentProfile } from '@/types';
import { getRiskScoreBadge } from '@/lib/slate-generated/risk-badge';
import { getTimelineColor } from '@/lib/slate-generated/timeline-utils';
import { ConfidenceIndicator } from '@/components/slate-generated/ConfidenceIndicator';

interface Props {
  student: StudentProfile;
  riskScore: number;
  onClose: () => void;
}

export function StudentPanel({ student, riskScore, onClose }: Props) {
  const riskBadge = getRiskScoreBadge(riskScore);

  return (
    <div className="fixed right-0 top-0 h-screen w-[600px] bg-white shadow-2xl overflow-y-auto z-50 animate-slide-in">
      <div className="p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Student Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={student.photoUrl} />
            <AvatarFallback>{student.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
            <p className="text-zinc-600">Grade {student.grade}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">
                Current: <span className="font-semibold">{student.currentGrade}</span>
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-sm text-zinc-600">
                Was: {student.previousGrade}
              </span>
            </div>
          </div>

          {/* Risk Score - Large */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${riskBadge.color}`}>
              {riskScore}<span className="text-2xl">/10</span>
            </div>
            <Badge className={`${riskBadge.bgColor} ${riskBadge.color} ${riskBadge.borderColor} border mt-2`}>
              {riskBadge.label}
            </Badge>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Engagement Timeline */}
        {student.aiInsight.engagementTimeline && (
          <Card className="p-5 mb-6 border-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-lg">Engagement Over Time</h3>
            </div>

            <div className="space-y-2">
              {student.aiInsight.engagementTimeline.map((point, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-14 text-zinc-500">
                    {point.date}
                  </span>
                  <div className="flex-1 bg-zinc-100 rounded-full h-10 relative overflow-hidden">
                    <div
                      className={`h-10 rounded-full transition-all ${getTimelineColor(point.status)}`}
                      style={{ width: `${point.score}%` }}
                    />
                    <span className="absolute right-3 top-2 text-sm font-bold text-zinc-700">
                      {point.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {student.id === 'jake-martinez' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800">
                  ⚠️ Engagement declined from 95 → 12 over 6 weeks (-87%)
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Red Flags */}
        {student.redFlags.length > 0 && (
          <Card className="p-5 mb-6 bg-red-50 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-lg">Warning Signals</h3>
            </div>

            <div className="space-y-3">
              {student.redFlags.map((flag, i) => (
                <div key={i} className="pb-3 border-b border-red-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{flag.description}</span>
                    <Badge variant="destructive" className="ml-2">
                      {flag.deviation}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-600">{flag.context}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Analysis */}
        <Card className="p-5 mb-6 bg-purple-50 border-2 border-purple-200">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            🧠 <span>AI Pattern Analysis</span>
          </h3>

          <div className="mb-4">
            <p className="text-sm font-semibold text-purple-700 mb-2">
              Pattern: {student.aiInsight.pattern}
            </p>
            <ConfidenceIndicator
              confidence={student.aiInsight.confidence}
              label="Analysis Confidence"
            />
          </div>

          <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
            {student.aiInsight.analysis}
          </p>
        </Card>

        {/* Outcome Projections */}
        {student.aiInsight.projectedOutcomes && (
          <Card className="p-5 mb-6 bg-amber-50 border-2 border-amber-500">
            <h3 className="font-bold text-lg mb-4">⏰ Intervention Impact</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Without */}
              <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                <p className="text-xs text-red-600 font-bold mb-2">WITHOUT ACTION</p>
                <p className="text-4xl font-bold text-red-600 mb-2">
                  {student.aiInsight.projectedOutcomes.withoutIntervention.probability}%
                </p>
                <p className="text-xs text-zinc-700 leading-snug mb-2">
                  {student.aiInsight.projectedOutcomes.withoutIntervention.outcome}
                </p>
                <p className="text-xs text-zinc-500">
                  {student.aiInsight.projectedOutcomes.withoutIntervention.timeframe}
                </p>
              </div>

              {/* With */}
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <p className="text-xs text-green-600 font-bold mb-2">WITH ACTION</p>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {student.aiInsight.projectedOutcomes.withIntervention.probability}%
                </p>
                <p className="text-xs text-zinc-700 leading-snug mb-2">
                  {student.aiInsight.projectedOutcomes.withIntervention.outcome}
                </p>
                <p className="text-xs text-zinc-500">
                  {student.aiInsight.projectedOutcomes.withIntervention.timeframe}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-100 rounded-lg">
              <p className="text-sm font-bold text-amber-900">
                🎯 {student.aiInsight.projectedOutcomes.windowOfOpportunity}
              </p>
            </div>
          </Card>
        )}

        {/* Draft Response */}
        <Card className="p-5 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            ✏️ <span>Suggested Response</span>
          </h3>

          <div className="mb-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">
              Approach: {student.aiInsight.recommendation.approach}
            </p>
            <p className="text-xs text-zinc-600">
              {student.aiInsight.recommendation.reasoning}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {student.aiInsight.recommendation.draftEmail}
            </pre>
          </div>

          <p className="text-xs text-zinc-600 mt-3">
            <strong>Expected outcome:</strong> {student.aiInsight.recommendation.expectedOutcome}
          </p>
        </Card>
      </div>
    </div>
  );
}
```

### Step 2.2: Integrate Panel into Dashboard (10 min)

Update `DashboardClient.tsx`:

```typescript
// Add import
import { StudentPanel } from './StudentPanel';

// Add to component (after email cards):
{selectedEmailId && (
  <StudentPanel
    student={sortedEmails.find(e => e.id === selectedEmailId)!.student}
    riskScore={sortedEmails.find(e => e.id === selectedEmailId)!.riskScore}
    onClose={() => setSelectedEmailId(null)}
  />
)}
```

### Step 2.3: Add Animations (5 min)

**File:** `src/app/globals.css` (add at end)

```css
@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

### ✅ Checkpoint 2A (8:00 PM): Working Student Panel

**Test:**
- [ ] Click Jake → Panel slides in from right
- [ ] See timeline showing 95→12 decline
- [ ] See 3-4 red flags with deviations
- [ ] See confidence breakdown (89%)
- [ ] See outcome projections (68% vs 78%)
- [ ] See draft response
- [ ] Click X → Panel closes
- [ ] Click Emma → See low risk, flat timeline

**Fallback:** If timeline breaks, show as simple list

**⏱️ Time Check: 2 hours elapsed** | **Must Have: Panel with timeline working**

---

## 🎯 Phase 3: Polish + Extras (8:00-9:00 PM)

**Goal:** Add finishing touches that impress judges

**Priority:** 🟡 NICE TO HAVE - Only if time allows

### Option 3A: Confidence Breakdown Detail (20 min)

**File:** `StudentPanel.tsx` (add after AI Analysis)

```typescript
{/* Confidence Breakdown */}
{student.aiInsight.confidenceBreakdown && (
  <Card className="p-5 mb-6">
    <h3 className="font-bold text-lg mb-4">🎯 Evidence Factors</h3>
    <div className="space-y-4">
      {student.aiInsight.confidenceBreakdown.map((factor, i) => (
        <div key={i}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">{factor.factor}</span>
            <span className="text-sm font-bold text-purple-600">
              {factor.confidence}%
            </span>
          </div>
          <Progress value={factor.confidence} className="h-2 mb-1" />
          <p className="text-xs text-zinc-600">{factor.reasoning}</p>
        </div>
      ))}
    </div>
  </Card>
)}
```

### Option 3B: Landing Page Update (15 min)

**File:** `src/app/page.tsx`

```typescript
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
      <Card className="max-w-2xl p-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SyllaBot
        </h1>
        <p className="text-xl text-zinc-600 mb-8">
          AI-Powered Early Intervention for Educators
        </p>
        <p className="text-zinc-700 mb-8 leading-relaxed">
          Gives teachers superhuman pattern recognition across 150+ students,
          transforming hidden cries for help into timely interventions that change lives.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          View Demo Dashboard →
        </Link>
        <p className="text-sm text-zinc-500 mt-6">
          Built for VIBE25-4 Hackathon | Powered by 5 sponsor tools
        </p>
      </Card>
    </div>
  );
}
```

### Option 3C: Mobile Architecture Showcase (10 min)

Add to dashboard (bottom):

```typescript
import { MobilePreview } from '@/components/MobilePreview';

// Add at end of dashboard, before closing divs
<div className="mt-12">
  <h2 className="text-2xl font-bold mb-4">Mobile Roadmap</h2>
  <MobilePreview />
</div>
```

### ✅ Checkpoint 3A (8:45 PM): Polished Demo

**Test:**
- [ ] Landing page looks professional
- [ ] Confidence breakdown shows evidence
- [ ] Mobile preview displays (if added)
- [ ] All animations smooth
- [ ] No console errors

**⏱️ Time Check: 2h 45m elapsed** | **Should Have: Polished features**

---

## 🎯 Phase 4: Final Prep (9:00-10:00 PM)

**Goal:** Rehearse, record, ship

**Priority:** 🔴 CRITICAL - This determines your score

### Step 4.1: Testing Checklist (10 min)

```bash
# Build check
npm run build

# Dev server
npm run dev
```

**Manual Test Flow:**
1. [ ] Load landing page
2. [ ] Click "View Demo Dashboard"
3. [ ] See 4 emails in standard view
4. [ ] Toggle AI mode → Jake jumps to #1 with red badge
5. [ ] Click Jake → Panel opens
6. [ ] See timeline decline (95→12)
7. [ ] See red flags (3)
8. [ ] See outcome projections (68% vs 78%)
9. [ ] See draft response
10. [ ] Close panel
11. [ ] Click Emma → See 1/10 risk, flat timeline
12. [ ] Close panel
13. [ ] Toggle back to standard view

### Step 4.2: Demo Rehearsal (20 min)

**90-Second Script:**

```
[0:00-0:15] Opening + The Problem
"Teachers track 150 students but can't remember everyone's baseline behavior.
This is my inbox - 4 emails this morning. All look routine."

[0:15-0:25] The Toggle Transformation
"Watch what happens when I turn on SyllaBot's AI."
[Click toggle]
"Jake just jumped to #1 with a 7/10 risk score."

[0:25-0:55] Jake's Deep Dive
[Click Jake]
"Three weeks ago, Jake was my top performer - 95 engagement score.
Then this happened."
[Point to timeline]
"Engagement dropped to 12. Four independent warning signals:
Attendance up 1400%, grades down 33%, communication down 82%."
[Point to outcomes]
"Without intervention: 68% dropout risk in 4 weeks.
With intervention: 78% success rate in 24 hours."
[Point to draft]
"He's not asking about the test. He's asking for help.
SyllaBot drafts a response that addresses the real issue."

[0:55-1:15] Calibration Proof
[Close Jake, click Emma]
"Not every short email is a crisis. Emma also sent 8 words,
but she's rated 1/10 - brief is normal for her.
We only alert when patterns CHANGE from personalized baselines."

[1:15-1:30] Close
"SyllaBot integrates all 5 VIBE sponsor tools: Stack Auth,
s2.dev, Lingo.dev, Cactus Compute, and Random Labs Slate.
Not replacing teachers - giving them superhuman pattern recognition."
```

**Practice:** 5-10 times until smooth

- [ ] Can deliver under 90 seconds
- [ ] Smooth transitions
- [ ] Know where to click
- [ ] Confident delivery

### Step 4.3: Record Backup Video (15 min)

Use QuickTime or OBS to record:
- [ ] 90-second walkthrough
- [ ] 2-3 takes
- [ ] Save best version
- [ ] Upload to Google Drive/YouTube (private)

### Step 4.4: Repository Prep (10 min)

**README final check:**
- [ ] All 5 tools listed with descriptions
- [ ] Installation instructions clear
- [ ] Demo script included
- [ ] Screenshots (if time - optional)

**Git cleanup:**
```bash
# Check for uncommitted changes
git status

# Final commit
git add .
git commit -m "feat: Complete Phase 2 UI build

Delivered features:
- Dashboard with AI toggle (core demo)
- Email cards with risk scoring
- Student context panel with timeline
- Outcome projections and draft responses
- Mobile architecture preview
- Polished animations and styling

Ready for demo presentation at VIBE25-4."

# Push to remote (if you have one)
git push
```

### Step 4.5: Final Verification (5 min)

- [ ] `npm run build` succeeds
- [ ] `npm run dev` works
- [ ] Toggle works
- [ ] Panel works
- [ ] No console errors
- [ ] Video recorded
- [ ] README complete

**⏱️ Time Check: 4 hours complete**

---

## 🚨 Fallback Positions (If Behind Schedule)

### At 7:30 PM - Behind on Phase 1:
**Skip:** Advanced toggle animations
**Keep:** Basic toggle working with reordering
**Minimum:** 2 email cards, toggle that works

### At 8:30 PM - Behind on Phase 2:
**Skip:** Confidence breakdown, mobile preview
**Keep:** Timeline, red flags, outcome projections, draft response
**Minimum:** Panel with timeline showing

### At 9:30 PM - Need to ship NOW:
**Stop building, start finalizing:**
1. Commit everything (10 min)
2. Record demo (15 min)
3. Write README (10 min)
4. Practice delivery (15 min)

---

## 🎯 Success Metrics

**Minimum Viable Demo (Must Ship):**
- ✅ Toggle working (emails reorder)
- ✅ Jake shows high risk in AI mode
- ✅ Click Jake → See some context
- **Score:** ~105-110%

**Target Demo (Should Ship):**
- ✅ Toggle + Risk badges
- ✅ Student panel with timeline
- ✅ Red flags + AI analysis
- ✅ Draft response
- **Score:** ~115-120%

**Ideal Demo (Dream Scenario):**
- ✅ Everything above
- ✅ Outcome projections
- ✅ Confidence breakdown
- ✅ Emma calibration
- ✅ Mobile preview
- ✅ Polished animations
- **Score:** ~120-125%

---

## 💡 Best Practices

### Design Principles:
1. **Contrast is King** - High risk should JUMP out (red backgrounds, large fonts)
2. **Progressive Disclosure** - Start simple (toggle), reveal complexity (panel)
3. **Visual Hierarchy** - Most important info biggest (risk score, timeline, outcomes)
4. **Consistent Spacing** - Use mb-4, mb-6, p-5, p-6 consistently
5. **Color Psychology**:
   - Red: Urgent, high risk
   - Amber/Yellow: Medium risk, caution
   - Green: Good, low risk
   - Purple: AI/Smart features
   - Blue: Information, drafts

### Development Process:
1. **Build → Test → Commit** - Don't accumulate changes
2. **Work in small chunks** - 15-30 min features
3. **Test in browser constantly** - Live reload is your friend
4. **Console is your ally** - Check for errors often
5. **Git commits are checkpoints** - Commit working features
6. **Hard refresh when weird** - Cmd+Shift+R clears cache

### Demo Delivery:
1. **Practice the toggle** - It's your killer feature
2. **Pause after toggle** - Let judges see the transformation
3. **Point to timeline** - Visual proof of decline
4. **Emphasize outcomes** - 68% vs 78% = stakes
5. **Show Emma briefly** - Proves sophistication
6. **End with tool count** - "All 5 sponsor tools integrated"

---

## 📝 Final Checklist

**Before you start Friday (6 PM):**
- [ ] Ate food
- [ ] Hydrated
- [ ] Phone on silent
- [ ] Music ready (optional)
- [ ] `npm run dev` works
- [ ] Know the plan

**At each checkpoint:**
- [ ] Feature works in browser
- [ ] No console errors
- [ ] Git commit created
- [ ] Can explain what it does

**Before you present:**
- [ ] Rehearsed 5+ times
- [ ] Know exact clicks
- [ ] Backup video exists
- [ ] Confident in story

---

## 🏆 Why This Plan Wins

**You have:**
- ✅ 100% backend complete (data, integrations, types)
- ✅ Clear phased approach
- ✅ Working checkpoints at each phase
- ✅ Fallback positions if behind
- ✅ The killer feature (toggle transformation)

**You'll deliver:**
- 🎯 A demo that proves value (toggle moment)
- 🎯 Technical sophistication (timeline, outcomes, confidence)
- 🎯 Product thinking (mobile roadmap, calibration)
- 🎯 All 5 sponsor tools (+25% bonus)

**While others:**
- Debug integrations Friday night
- Build features that don't work
- Run out of time
- Ship partial demos

**You'll ship:**
- Working features incrementally
- Tested at each phase
- Polished and rehearsed
- Ready to win

---

**Build fast. Test constantly. Ship incrementally. Win the hackathon.** 🚀
