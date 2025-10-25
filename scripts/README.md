# SyllaBot Scripts

This directory contains utility scripts for setting up and testing the SyllaBot demo.

## Scripts Overview

### `test-integrations.ts`
**Purpose:** Test all API integrations to verify they're configured correctly

**What it tests:**
- ✅ Stack Auth environment variables
- ✅ Anthropic Claude API (makes real API call)
- ✅ s2.dev activity logging
- ✅ Lingo.dev translation

**Run:**
```bash
npx tsx scripts/test-integrations.ts
```

**When to run:**
- After setting up `.env.local`
- Before running `prepare-demo.ts`
- To diagnose integration issues

**Expected output:**
```
✅ All integrations working!
🚀 Ready to proceed with prepare-demo.ts
```

---

### `prepare-demo.ts`
**Purpose:** Pre-analyze all demo emails with Claude and cache the results

**What it does:**
1. Loads all 3 demo emails (Jake, Sarah, Miguel)
2. Calls Claude API to analyze each email
3. Saves analysis to `src/data/demo-cache.json`
4. Estimates cost and duration

**Run:**
```bash
npx tsx scripts/prepare-demo.ts
```

**When to run:**
- **Thursday night** before the Friday hackathon
- After creating demo data
- After confirming Claude API works

**Expected output:**
```
🧠 SyllaBot - Pre-Demo Analysis
📧 Analyzing 3 emails with Claude API...

✅ Pre-Analysis Complete!
Success: 3/3 emails
Duration: 5.2s
Estimated cost: ~$0.03
```

**Important:**
- This costs ~$0.03 in Claude API credits
- Takes ~5 seconds total (1.5s between calls)
- Only run once - cache lasts for entire hackathon

---

### `test-cache.ts`
**Purpose:** Verify the demo cache was generated correctly

**What it tests:**
- Cache file exists
- All 3 emails have cached analysis
- Analysis structure is valid
- Risk scores are present

**Run:**
```bash
npx tsx scripts/test-cache.ts
```

**When to run:**
- After running `prepare-demo.ts`
- Before starting the dev server
- To verify cache loads correctly

**Expected output:**
```
🧪 Testing Demo Cache Loading
✅ All cache entries loaded successfully!
🚀 Ready for demo!
```

---

## Setup Workflow

Follow this workflow before the Friday hackathon:

### Step 1: Verify Integrations
```bash
npx tsx scripts/test-integrations.ts
```

✅ **Expected:** All integrations passing (or critical ones at minimum)

### Step 2: Pre-Compute Analysis
```bash
npx tsx scripts/prepare-demo.ts
```

✅ **Expected:** Creates `src/data/demo-cache.json` with 3 entries

### Step 3: Verify Cache
```bash
npx tsx scripts/test-cache.ts
```

✅ **Expected:** All 3 cache entries load successfully

### Step 4: Start Dev Server
```bash
npm run dev
```

✅ **Expected:** Server starts without errors

---

## Troubleshooting

### "Anthropic API key not configured"
**Fix:** Add real API key to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### "Failed to parse Claude response"
**Cause:** Claude returned unexpected format
**Fix:** Run `prepare-demo.ts` again (rare intermittent issue)

### "Cache file not found"
**Cause:** Haven't run `prepare-demo.ts` yet
**Fix:** Run `npx tsx scripts/prepare-demo.ts`

### "s2 API error"
**Impact:** Optional - won't break demo
**Fix:** Can ignore (s2 fails gracefully) or check S2_API_KEY

### "Lingo API error"
**Impact:** Optional - will use static example
**Fix:** Can ignore (falls back to static) or check LINGO_API_KEY

---

## Files Created by Scripts

### `src/data/demo-cache.json`
**Created by:** `prepare-demo.ts`
**Contains:** Pre-computed AI analysis for all demo emails

**Structure:**
```json
{
  "email-002": {
    "emailId": "email-002",
    "studentId": "jake-martinez",
    "studentName": "Jake Martinez",
    "analysis": {
      "riskScore": 7,
      "pattern": "Silent Struggle",
      "confidence": 89,
      "hiddenMeaning": "...",
      "evidence": [...],
      "recommendation": "..."
    },
    "generatedAt": "2024-10-24T..."
  }
}
```

---

## Cost Estimates

| Script | API Calls | Estimated Cost |
|--------|-----------|----------------|
| test-integrations.ts | 1 Claude call | ~$0.01 |
| prepare-demo.ts | 3 Claude calls | ~$0.03 |
| test-cache.ts | 0 API calls | $0.00 |

**Total:** ~$0.04 to fully test and prepare demo

---

## Pre-Hackathon Checklist

Run through this checklist on **Thursday night**:

```
[ ] All API keys in .env.local
[ ] test-integrations.ts passes
[ ] prepare-demo.ts runs successfully
[ ] demo-cache.json created with 3 entries
[ ] test-cache.ts passes
[ ] npm run dev starts without errors
[ ] Can load http://localhost:3000
```

**If all checked:** ✅ Ready for Friday hackathon!

---

## Emergency Commands

If something breaks during hackathon:

**Re-generate cache:**
```bash
npx tsx scripts/prepare-demo.ts
```

**Verify cache:**
```bash
npx tsx scripts/test-cache.ts
```

**Test single integration:**
```bash
npx tsx scripts/test-integrations.ts
```

**Clear and rebuild:**
```bash
rm src/data/demo-cache.json
npx tsx scripts/prepare-demo.ts
npx tsx scripts/test-cache.ts
```

---

## TypeScript Execution

All scripts use `tsx` for TypeScript execution without compilation.

**Why tsx?**
- No build step needed
- Runs TypeScript directly
- Fast and simple
- Perfect for scripts

**Alternative (if tsx fails):**
```bash
npm install -g ts-node
ts-node scripts/test-integrations.ts
```

---

## Notes

- All scripts are safe to run multiple times
- Scripts fail gracefully with helpful error messages
- Optional integrations won't block the workflow
- Cache file is gitignored (contains pre-computed data)

---

**Ready to build the hackathon winner!** 🚀
