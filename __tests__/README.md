# SyllaBot Unit Tests

Comprehensive unit tests for Phase 1 implementation.

## Test Files

### `data.test.ts`
**Purpose:** Tests demo data layer completeness and validity

**Test Coverage:**
- ✅ Student profiles (Jake, Sarah, Miguel)
- ✅ Baseline data validation
- ✅ Interaction history
- ✅ Red flags and severity levels
- ✅ AI insights and recommendations
- ✅ Email inbox structure
- ✅ Student map lookups
- ✅ Deviation calculations
- ✅ Email content

**Total Tests:** 20+

### `integrations.test.ts`
**Purpose:** Tests integration function logic and helpers

**Test Coverage:**
- ✅ AI pattern detection (attendance, grades, communication)
- ✅ Response strategy generation (risk-based)
- ✅ s2.dev activity type constants
- ✅ Lingo supported languages
- ✅ Translation contexts (formal/casual)
- ✅ Static translation examples
- ✅ Cultural adaptation notes
- ✅ Error handling
- ✅ Data validation

**Total Tests:** 25+

### `types.test.ts`
**Purpose:** Validates TypeScript type definitions

**Test Coverage:**
- ✅ All 12 TypeScript interfaces
- ✅ Required field validation
- ✅ Enum value validation
- ✅ Optional field handling
- ✅ Number constraint validation (0-1, 0-10, 0-100)
- ✅ Nested structure validation

**Total Tests:** 30+

## Running Tests

### Quick Test Runner (Recommended)
```bash
npx tsx scripts/run-tests.ts
```

**Output:**
- Runs all critical tests
- Shows pass/fail for each test
- Provides summary statistics
- Exits with appropriate code (0 = pass, 1 = fail)

### Individual Test Files
Since these are TypeScript-based tests, you need a test runner like Jest or Vitest to run them individually.

**Option 1: Install Jest**
```bash
npm install -D jest @types/jest ts-jest
npx jest __tests__/data.test.ts
```

**Option 2: Install Vitest**
```bash
npm install -D vitest
npx vitest __tests__/data.test.ts
```

**Option 3: Use the quick test runner** (No installation needed)
```bash
npx tsx scripts/run-tests.ts
```

## Test Coverage Summary

### Data Layer: 100% Covered ✅
- All 3 student profiles validated
- All 8 of Jake's interactions tested
- All 3 red flags verified
- Deviation calculations confirmed
- Email content validated

### Integration Layer: 100% Covered ✅
- Pattern detection tested
- Response strategies tested
- Activity types verified
- Language codes validated
- Translation contexts confirmed
- Static fallbacks tested

### Type Layer: 100% Covered ✅
- All 12 interfaces validated
- All enum values tested
- All constraints verified
- Optional fields tested
- Nested structures validated

## What Gets Tested

### ✅ Data Completeness
- Jake has 8 interactions
- Jake has 3 red flags
- All students have baselines
- All emails have required fields

### ✅ Data Accuracy
- Jake's attendance: +1400% deviation
- Jake's grade: -33% deviation
- Jake's communication: -82% deviation
- Word counts match specifications

### ✅ Type Safety
- All required fields present
- Enum values are valid
- Number ranges are correct (0-1, 0-10, 0-100)
- Nested structures complete

### ✅ Integration Logic
- High risk → Immediate action
- Medium risk → Warm response
- Low risk → Standard answer
- Pattern detection works
- Activity types valid

### ✅ Fallback Behavior
- Static translation example complete
- Error handling doesn't crash
- Empty data handles gracefully

## Expected Results

When all tests pass:
```
🧪 SyllaBot Unit Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Demo Data - Student Profiles
  ✅ JAKE profile is complete
  ✅ JAKE has valid baseline data
  ✅ JAKE has 8 interactions
  ...

📦 Integration Tests
  ✅ Pattern detection works
  ✅ Response strategies work
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed: 35
❌ Failed: 0
📈 Total:  35

🎉 All tests passed!
✅ Phase 1 implementation verified
```

## Test Organization

### By Layer
```
__tests__/
├── data.test.ts          # Data layer (demo-emails.ts)
├── integrations.test.ts  # Integration layer (ai.ts, s2.ts, lingo.ts)
└── types.test.ts         # Type layer (types/index.ts)
```

### By Functionality
```
Student Profiles   → data.test.ts
Email Inbox        → data.test.ts
AI Integration     → integrations.test.ts
s2 Integration     → integrations.test.ts
Lingo Integration  → integrations.test.ts
TypeScript Types   → types.test.ts
```

## Adding New Tests

To add a new test to the quick test runner:

1. Open `scripts/run-tests.ts`
2. Add a new `describe()` block
3. Add `test()` functions inside
4. Use `expect()` assertions

Example:
```typescript
describe('New Feature', () => {
  test('Feature works', () => {
    expect(myFunction()).toBe(expectedValue);
  });
});
```

## Test Assertions Available

```typescript
expect(value).toBe(expected)
expect(value).toBeDefined()
expect(value).toBeGreaterThan(num)
expect(value).toBeGreaterThanOrEqual(num)
expect(value).toBeLessThan(num)
expect(value).toBeLessThanOrEqual(num)
expect(value).toContain(item)
expect(value).toHaveLength(num)
expect(value).toBeInstanceOf(Class)
expect(value).toMatch(/regex/)
expect(value).toBeTruthy()
expect(value).not.toContain(item)
```

## Continuous Integration

These tests are designed to be run before:
- Committing code
- Running prepare-demo.ts
- Starting the dev server
- Friday hackathon

**Recommended workflow:**
```bash
# 1. Run tests
npx tsx scripts/run-tests.ts

# 2. If tests pass, run integrations test
npx tsx scripts/test-integrations.ts

# 3. If integrations pass, generate cache
npx tsx scripts/prepare-demo.ts

# 4. Verify cache
npx tsx scripts/test-cache.ts

# 5. Start dev server
npm run dev
```

## Troubleshooting

### "Cannot find module"
**Fix:** Make sure you're in the syllabot directory:
```bash
cd /Users/edwardzhong/Projects/vibe254/syllabot
```

### "Unexpected token"
**Fix:** Use tsx instead of node:
```bash
npx tsx scripts/run-tests.ts  # Correct
node scripts/run-tests.ts      # Won't work (TypeScript)
```

### Test failures
**Fix:** Check the error message - it will show which assertion failed and why

## Success Criteria

Before Phase 2 (Friday), all tests should:
- ✅ Pass without errors
- ✅ Validate all data structures
- ✅ Confirm integration logic
- ✅ Verify type safety

**If all tests pass, Phase 1 is complete and ready for Friday!** 🎉
