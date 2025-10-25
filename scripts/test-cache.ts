#!/usr/bin/env tsx

/**
 * Test Cache Loading
 *
 * Verifies that the demo cache was generated correctly
 * and can be loaded successfully.
 *
 * Run: npx tsx scripts/test-cache.ts
 */

import { getCachedAnalysis } from '../src/lib/ai';
import { DEMO_INBOX, STUDENTS } from '../src/data/demo-emails';

console.log('🧪 Testing Demo Cache Loading');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

let successCount = 0;
let failCount = 0;

for (const email of DEMO_INBOX) {
  const student = STUDENTS[email.studentId];

  console.log(`Testing: ${student.name} - "${email.subject}"`);

  try {
    const analysis = getCachedAnalysis(email.id);

    if (analysis) {
      console.log(`  ✅ Cache loaded successfully`);
      console.log(`     Risk Score: ${analysis.riskScore}/10`);
      console.log(`     Pattern: ${analysis.pattern}`);
      console.log(`     Confidence: ${analysis.confidence}%`);
      successCount++;
    } else {
      console.log(`  ❌ No cache entry found for ${email.id}`);
      failCount++;
    }
  } catch (error) {
    console.log(`  ❌ Failed to load cache:`);
    console.log(`     ${error instanceof Error ? error.message : String(error)}`);
    failCount++;
  }

  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Summary:');
console.log(`  Success: ${successCount}/${DEMO_INBOX.length}`);
console.log(`  Failed: ${failCount}/${DEMO_INBOX.length}`);
console.log('');

if (failCount === 0) {
  console.log('✅ All cache entries loaded successfully!');
  console.log('🚀 Ready for demo!');
  process.exit(0);
} else {
  console.log('❌ Some cache entries failed to load');
  console.log('💡 Run: npx tsx scripts/prepare-demo.ts');
  process.exit(1);
}
