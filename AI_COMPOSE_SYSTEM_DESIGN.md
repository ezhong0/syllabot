# AI-Powered Email Composition System Design
**For SyllaBot - VIBE25-4 Hackathon Demo**

---

## Current State ✅

**What You Have:**
- ✅ ComposeEmailModal with template selector
- ✅ Real-time Claude API analysis endpoint (`/api/analyze-email`)
- ✅ Risk scoring (1-10)
- ✅ Sentiment analysis
- ✅ Recommended approach detection
- ✅ Pre-built email templates
- ✅ Live analysis overlay showing all 5 tools working

**What's Working:**
1. User selects template → Composes email → Clicks "Send & Analyze"
2. Claude analyzes the email in real-time
3. Returns: sentiment, risk score, communication pattern, red flags
4. Email appears in inbox as "Live" demo email

---

## Vision: Two-Way AI Composition System

### The Big Idea

**Instead of just analyzing INCOMING emails, also help teachers COMPOSE outgoing emails with AI assistance.**

**Flow:**
```
Teacher sees high-risk student (Jake)
→ Clicks "Compose Response"
→ AI generates 3 draft responses based on student context
→ Teacher picks one / edits it
→ AI re-analyzes and provides feedback WHILE editing
→ Teacher sends with confidence
```

---

## System Architecture

### Phase 1: Draft Response Generation (Core Feature)

**When:** Teacher clicks a student's recommended response

**What Happens:**
1. System reads student's full profile (baseline, red flags, AI insight)
2. Calls Claude API to generate 3 response options:
   - **Quick Answer** - Brief, answers question directly
   - **Warm Check-In** - Supportive, shows teacher noticed patterns
   - **Intervention** - Direct, offers specific help

3. Each draft includes:
   - Subject line
   - Email body
   - **Tone badge** (Professional, Empathetic, Direct)
   - **Predicted student response** (Will they engage? Risk of shutdown?)
   - **Why this works** (Evidence-based reasoning)

**UI Location:** New button in student panel: "Generate AI Response"

---

### Phase 2: Real-Time Composition Assistant

**When:** Teacher is typing in compose modal

**What Happens:**
1. **As-you-type analysis** (debounced, every 2 seconds):
   - Word count vs baseline indicator
   - Tone detector (empathetic, professional, cold, warm)
   - Risk prediction: "This might feel too formal for Jake"

2. **AI Suggestions Panel** (right side of compose modal):
   - ✅ Tone is warm and supportive
   - ⚠️ Consider mentioning his recent absences
   - 💡 Suggestion: Add "I've noticed..." to show awareness
   - 🔴 Warning: Email is very brief - Jake needs more support

3. **One-Click Improvements:**
   - "Make this warmer" button
   - "Add context about pattern" button
   - "Simplify language (for Miguel)" button
   - "Translate to Spanish (Lingo)" button

---

### Phase 3: Full AI-Assisted Workflow

**Complete Teacher Journey:**

```
[Inbox] Jake's brief email (8/10 risk)
   ↓
[Click Jake] See analysis: "Silent Struggle" pattern
   ↓
[Click "Draft Response"] AI generates 3 options
   ↓
[Select "Warm Check-In"] Pre-filled composition modal opens
   ↓
[Edit draft] Real-time AI feedback as you type
   ↓
[Review] AI shows predicted outcome:
   - 78% chance positive response
   - Window: 24-48 hours
   ↓
[Send] Email sent, logged to s2.dev, tracked
```

---

## Detailed Component Design

### Component 1: AI Response Generator

**Location:** Student detail panel, below "Recommended Response"

**UI:**
```tsx
<div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-md p-4">
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-sm font-semibold text-purple-900">
      AI-Generated Response Options
    </h4>
    <Badge className="bg-purple-600 text-white text-xs">Claude</Badge>
  </div>

  <Button
    onClick={() => generateResponses(student)}
    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
  >
    <Sparkles className="h-4 w-4 mr-2" />
    Generate AI Response Drafts
  </Button>

  {/* After generation */}
  {drafts.length > 0 && (
    <div className="mt-4 space-y-3">
      {drafts.map(draft => (
        <DraftResponseCard
          key={draft.id}
          draft={draft}
          onSelect={() => openComposer(draft)}
        />
      ))}
    </div>
  )}
</div>
```

**DraftResponseCard:**
```tsx
<Card className="border-2 border-blue-200 hover:border-blue-400 cursor-pointer">
  <CardContent className="p-3">
    {/* Header with Approach + Tone */}
    <div className="flex items-center justify-between mb-2">
      <Badge className="bg-blue-600 text-white text-xs">
        {draft.approach} // "Warm Check-In"
      </Badge>
      <Badge variant="outline" className="text-xs">
        Tone: {draft.tone} // "Empathetic"
      </Badge>
    </div>

    {/* Draft preview */}
    <p className="text-xs text-gray-700 line-clamp-3 mb-2">
      {draft.body}
    </p>

    {/* Predicted outcome */}
    <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-700">Predicted Response:</span>
        <Badge className="bg-green-600 text-white text-xs">
          {draft.predictedEngagement}% engagement
        </Badge>
      </div>
      <p className="text-xs text-gray-600 mt-1">
        {draft.reasoning}
      </p>
    </div>

    {/* Action */}
    <Button
      size="sm"
      className="w-full mt-2"
      onClick={() => openComposer(draft)}
    >
      Use This Draft →
    </Button>
  </CardContent>
</Card>
```

---

### Component 2: Enhanced Compose Modal

**Add to existing ComposeEmailModal:**

**Right Sidebar: AI Assistant Panel**

```tsx
{/* New: AI Assistant Sidebar */}
<div className="lg:col-span-1 border-l pl-4">
  <div className="sticky top-4">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-purple-600" />
      AI Writing Assistant
    </h3>

    {/* Real-time analysis */}
    <Card className="mb-4">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Tone:</span>
          <Badge className={getToneBadgeColor(currentTone)}>
            {currentTone}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Length:</span>
          <Badge variant="outline">
            {wordCount} / {student.baseline.avgWordCount} baseline
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700">Predicted Risk:</span>
          <Badge className="bg-green-600 text-white">
            Will reduce to {predictedNewRisk}/10
          </Badge>
        </div>
      </CardContent>
    </Card>

    {/* AI Suggestions */}
    <div className="space-y-2 mb-4">
      <h4 className="text-xs font-semibold text-gray-600 uppercase">
        Suggestions
      </h4>

      {suggestions.map(suggestion => (
        <Card key={suggestion.id} className="bg-blue-50 border-blue-200">
          <CardContent className="p-2">
            <div className="flex items-start gap-2">
              <div className="text-lg">{suggestion.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 mb-1">
                  {suggestion.text}
                </p>
                {suggestion.action && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-6"
                    onClick={suggestion.action}
                  >
                    Apply →
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Quick Actions */}
    <div className="space-y-1">
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs"
        onClick={() => adjustTone('warmer')}
      >
        🔥 Make Warmer
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs"
        onClick={() => adjustTone('simpler')}
      >
        📝 Simplify Language
      </Button>
      {student.id === 'miguel-rodriguez' && (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs flex items-center gap-1"
          onClick={() => translateDraft()}
        >
          🌍 Translate (Lingo)
        </Button>
      )}
    </div>
  </div>
</div>
```

---

### Component 3: API Endpoint for Draft Generation

**New:** `/api/generate-response`

**Request:**
```json
{
  "student": StudentProfile,
  "incomingEmail": DemoEmail | null,
  "context": {
    "riskScore": 7,
    "pattern": "Silent Struggle",
    "redFlags": ["attendance", "grades", "communication"]
  }
}
```

**Response:**
```json
{
  "drafts": [
    {
      "id": "draft-1",
      "approach": "Warm Check-In",
      "tone": "Empathetic",
      "subject": "RE: Quick question",
      "body": "Hi Jake,\n\nFriday at 2pm in Room 204 (syllabus p.3).\n\nI noticed you've missed a few classes recently—everything okay? You're normally so on top of things. Stop by office hours if you want to catch up on anything before the test.\n\n- Ms. J",
      "reasoning": "Answers his question but uses it as opening to show you notice. Brief enough not to overwhelm, warm enough to invite conversation.",
      "predictedEngagement": 78,
      "evidenceBase": "Teacher check-ins reduce dropout risk by 40% (MacIver & Messel, 2013)",
      "estimatedRiskReduction": "7 → 3",
      "expectedResponse": "24-48 hours: Jake likely responds positively or comes to office hours"
    },
    {
      "id": "draft-2",
      "approach": "Quick Answer",
      "tone": "Professional",
      "subject": "RE: Quick question",
      "body": "Hi Jake,\n\nFriday at 2pm in Room 204.\n\n- Ms. J",
      "reasoning": "Answers the question directly. Efficient but misses opportunity for intervention.",
      "predictedEngagement": 45,
      "evidenceBase": "Brief responses maintain status quo but don't reduce risk",
      "estimatedRiskReduction": "7 → 7",
      "expectedResponse": "Jake likely continues declining pattern"
    },
    {
      "id": "draft-3",
      "approach": "Direct Intervention",
      "tone": "Concerned",
      "subject": "RE: Quick question + Let's talk",
      "body": "Hi Jake,\n\nFriday at 2pm in Room 204.\n\nI'm concerned about the pattern I'm seeing - 3 absences, quiz score drop, and now this very brief email. This isn't like you. Please come see me during office hours this week. I want to help.\n\n- Ms. J",
      "reasoning": "Direct and honest. Shows you've noticed the pattern. May feel confronting but clearly communicates concern.",
      "predictedEngagement": 65,
      "evidenceBase": "Direct intervention works for some students but can feel overwhelming for those in silent struggle",
      "estimatedRiskReduction": "7 → 4",
      "expectedResponse": "50% chance: defensive response / 50% chance: opens up"
    }
  ],
  "recommendation": "draft-1",
  "recommendationReason": "Warm Check-In balances answering question with showing awareness. Best fit for Silent Struggle pattern."
}
```

---

### Component 4: Real-Time Tone Adjustment API

**New:** `/api/adjust-tone`

**Request:**
```json
{
  "originalText": "The test is Friday.",
  "currentTone": "cold",
  "desiredTone": "warm",
  "studentContext": {
    "name": "Jake",
    "pattern": "Silent Struggle",
    "riskScore": 7
  }
}
```

**Response:**
```json
{
  "adjustedText": "Hi Jake,\n\nFriday at 2pm in Room 204 (syllabus p.3).\n\nEverything okay? You're usually so on top of things.\n\n- Ms. J",
  "toneScore": {
    "warmth": 8,
    "professionalism": 9,
    "empathy": 7
  },
  "changes": [
    "Added greeting with student name (personalizes)",
    "Included room number + syllabus reference (helpful context)",
    "Added check-in question (shows awareness)",
    "Maintained professional closing"
  ]
}
```

---

## Integration: All 5 Tools Working Together

### How Each Tool Contributes to Composition:

#### 1. **Claude 3.7 Sonnet** 🧠
- Generates draft responses
- Analyzes tone and sentiment
- Predicts student engagement
- Suggests improvements
- **Visible:** "Powered by Claude" badge on all AI suggestions

#### 2. **Stack Auth** 🔐
- Authenticates teacher (Ms. Johnson)
- Ensures FERPA-compliant data handling
- Tracks who sent which emails
- **Visible:** User profile, "Secured by Stack Auth" in footer

#### 3. **s2.dev** 📊
- Logs every composition event:
  - `draft.generated`
  - `tone.adjusted`
  - `suggestion.applied`
  - `email.sent`
- **Visible:** "Activity logged to s2.dev" in real-time panel

#### 4. **Lingo.dev** 🌍
- Translates drafts for Miguel's parents
- Adapts tone for cultural context
- Shows "Translate" button when Miguel selected
- **Visible:** Translation badge + cultural notes

#### 5. **Cactus Compute** ⚡
- Pre-computes baseline analysis
- Optimizes prompt efficiency
- Enables fast draft generation (<2s)
- **Visible:** Performance metrics: "Draft generated in 1.2s (Cactus-optimized)"

---

## Demo Flow: Showcasing the System

### **Act 1: Discovery (30 seconds)**

*"Let me show you the inbox. See Jake's brief email? AI gives it 7/10 risk."*

→ Click Jake
→ Panel shows: Silent Struggle pattern, red flags, recommended approach

---

### **Act 2: AI Draft Generation (30 seconds)**

*"Instead of guessing how to respond, watch this..."*

→ Click "Generate AI Response Drafts"
→ **Overlay shows:** "Claude analyzing Jake's profile + communication history..."
→ 3 cards appear:
  - Warm Check-In (78% engagement) ✅ RECOMMENDED
  - Quick Answer (45% engagement)
  - Direct Intervention (65% engagement)

*"AI generated 3 options. The Warm Check-In is recommended because Jake is in Silent Struggle - he needs support, not confrontation."*

---

### **Act 3: Real-Time Composition (30 seconds)**

→ Click "Use This Draft" on Warm Check-In
→ Compose modal opens with pre-filled text

*"Now watch as I edit this..."*

→ Type additional sentence
→ **AI Assistant panel updates in real-time:**
  - Tone: Empathetic ✅
  - Length: 42 words (Jake's baseline: 45) ✅
  - Predicted new risk: 3/10 ✓

*"AI is analyzing as I type. It confirms this will reduce Jake's risk from 7 to 3."*

---

### **Act 4: All Tools Working (15 seconds)**

→ Click "Send & Analyze"
→ **Overlay animation:**
  - 🧠 Claude re-analyzing final draft...
  - 📊 s2.dev logging composition event...
  - ⚡ Cactus optimizing for mobile...
  - 🌍 Lingo preparing translation (if Miguel)...

*"All 5 tools working together in real-time."*

---

### **Act 5: Outcome Prediction (15 seconds)**

→ Email appears in inbox as "Live"
→ Auto-expands detail view showing:
  - Analysis of teacher's response
  - Predicted student reaction
  - Expected timeline: "78% chance Jake responds within 24-48 hours"

*"And now we wait. But instead of guessing, we have data-driven predictions."*

---

## Implementation Priority

### Must-Have for Demo (Next 2 Hours)

1. **Draft Response Generator** - Core feature
   - API endpoint: `/api/generate-response`
   - UI: "Generate AI Response" button in student panel
   - Show 3 draft cards with predicted outcomes

2. **Use Draft in Composer** - Flow completion
   - Click draft → Opens compose modal pre-filled
   - Keep existing "Send & Analyze" flow

3. **Visual Integration** - Tool attribution
   - "Powered by Claude" badges on drafts
   - "s2.dev logged" indicator when sending
   - Cactus performance metrics

### Nice-to-Have (If Time)

4. **Real-Time Tone Analysis** - Polish
   - As-you-type feedback in sidebar
   - Tone adjustment buttons

5. **Translation Integration** - Lingo showcase
   - "Translate to Spanish" button for Miguel
   - Shows cultural adaptation notes

---

## Technical Implementation Guide

### Step 1: Create Draft Generation API

```typescript
// /api/generate-response/route.ts
export async function POST(request: NextRequest) {
  const { student, incomingEmail, context } = await request.json();

  const prompt = `Generate 3 response drafts for teacher responding to student...

  Student: ${student.name}
  Risk: ${context.riskScore}/10
  Pattern: ${context.pattern}
  Baseline: ${student.baseline.avgWordCount} words avg

  Incoming email: "${incomingEmail?.body || 'N/A'}"

  Generate JSON with 3 drafts varying in approach:
  1. Warm Check-In (empathetic, shows awareness)
  2. Quick Answer (efficient, professional)
  3. Direct Intervention (concerned, explicit)

  For each draft, include:
  - approach, tone, subject, body
  - predictedEngagement (0-100%)
  - reasoning
  - estimatedRiskReduction`;

  const response = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  return NextResponse.json(JSON.parse(response.content[0].text));
}
```

### Step 2: Add UI to Student Panel

```typescript
// In dashboard/page.tsx - student detail panel

const [draftResponses, setDraftResponses] = useState<Draft[]>([]);
const [isGenerating, setIsGenerating] = useState(false);

const generateDrafts = async () => {
  setIsGenerating(true);
  const res = await fetch('/api/generate-response', {
    method: 'POST',
    body: JSON.stringify({
      student: selectedStudent,
      incomingEmail: selectedEmail,
      context: {
        riskScore: selectedStudent.aiInsight.confidence,
        pattern: selectedStudent.aiInsight.pattern,
        redFlags: selectedStudent.redFlags
      }
    })
  });
  const data = await res.json();
  setDraftResponses(data.drafts);
  setIsGenerating(false);
};
```

### Step 3: Update Compose Modal

```typescript
// Add prop to ComposeEmailModal
interface ComposeEmailModalProps {
  // ... existing props
  preFillDraft?: {
    subject: string;
    body: string;
  };
}

// In component
useEffect(() => {
  if (preFillDraft) {
    setSubject(preFillDraft.subject);
    setBody(preFillDraft.body);
  }
}, [preFillDraft]);
```

---

## Success Metrics

### Judge Experience

**Before (Current):**
- Judge sees: "You can analyze incoming emails"
- Judge thinks: "Okay, sentiment analysis. Seen that before."

**After (With AI Composition):**
- Judge sees: "AI generates response drafts with predicted outcomes"
- Judge thinks: "Whoa, this is actually helping teachers RESPOND, not just analyze. That's useful!"

### Scoring Impact

| Category | Before | After | Gain |
|----------|--------|-------|------|
| **Applicability** | 4/5 | 5/5 | Teachers actually use composition help |
| **Creativity** | 4/5 | 5/5 | Two-way AI (in + out) is novel |
| **Technical** | 5/5 | 5/5 | Already excellent |

**Key Differentiator:** Most demos show AI analyzing data. Few show AI helping humans CREATE better responses.

---

## Why This Matters

### The Real Teacher Problem

Teachers don't just need to KNOW Jake is struggling.
They need to know HOW TO HELP.

**Current tools:** "Jake is at risk."
**Your tool:** "Here are 3 evidence-based responses. This one has 78% success rate."

That's the difference between a dashboard and a tool teachers will pay for.

---

## Next Steps

1. **Build draft generation API** (30 min)
2. **Add "Generate Response" button** (15 min)
3. **Create draft response cards** (20 min)
4. **Connect to compose modal** (10 min)
5. **Test full flow** (10 min)
6. **Rehearse demo** (15 min)

**Total:** 90 minutes to transform demo from "analysis tool" to "AI teaching assistant"

---

**Status: DESIGN READY**

This system showcases all 5 tools working together to help teachers not just understand risk, but ACT on it with confidence.

Build this and judges will see why SyllaBot is fundable. 🚀
