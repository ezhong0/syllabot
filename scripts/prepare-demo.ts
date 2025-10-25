#!/usr/bin/env tsx

/**
 * Pre-Demo Analysis Script
 *
 * This script pre-analyzes all demo emails with Claude API
 * and caches the results for instant loading during the demo.
 *
 * Run this script Thursday night before the hackathon:
 * npx tsx scripts/prepare-demo.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { DEMO_INBOX, STUDENTS } from '../src/data/demo-emails';
import { analyzeEmail } from '../src/lib/ai';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface CacheEntry {
  emailId: string;
  studentId: string;
  studentName: string;
  analysis: any;
  generatedAt: string;
}

async function prepareDemoData() {
  console.log('🧠 SyllaBot - Pre-Demo Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Analyzing ${DEMO_INBOX.length} emails with Claude API...\n`);

  const results: Record<string, CacheEntry> = {};
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (const email of DEMO_INBOX) {
    const student = STUDENTS[email.studentId];

    console.log(`📨 Analyzing: ${student.name} - "${email.subject}"`);
    console.log(`   Email: ${email.body.substring(0, 50)}...`);

    try {
      // Call Claude API
      const analysis = await analyzeEmail(email, student);

      // Store in cache
      results[email.id] = {
        emailId: email.id,
        studentId: email.studentId,
        studentName: student.name,
        analysis,
        generatedAt: new Date().toISOString()
      };

      console.log(`   ✅ Risk Score: ${analysis.riskScore}/10`);
      console.log(`   ✅ Pattern: ${analysis.pattern} (${analysis.confidence}% confidence)`);
      console.log(`   ✅ Hidden Meaning: ${analysis.hiddenMeaning}`);
      console.log('');

      successCount++;

      // Rate limit: Wait 1.5 seconds between API calls to avoid rate limiting
      if (DEMO_INBOX.indexOf(email) < DEMO_INBOX.length - 1) {
        console.log('   ⏳ Waiting 1.5s before next analysis...\n');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`   ❌ Failed to analyze ${student.name}:`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      console.log('');
      failCount++;
    }
  }

  // Calculate statistics
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  const estimatedCost = DEMO_INBOX.length * 0.01; // Rough estimate

  // Save to cache file
  const cachePath = join(__dirname, '../src/data/demo-cache.json');
  const cacheData = JSON.stringify(results, null, 2);
  writeFileSync(cachePath, cacheData, 'utf-8');

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Pre-Analysis Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Success: ${successCount}/${DEMO_INBOX.length} emails`);
  if (failCount > 0) {
    console.log(`   Failed: ${failCount} emails`);
  }
  console.log(`   Duration: ${duration}s`);
  console.log(`   Estimated cost: ~$${estimatedCost.toFixed(2)}`);
  console.log('');
  console.log('📁 Cache file:');
  console.log(`   ${cachePath}`);
  console.log('');
  console.log('🎯 What\'s cached:');
  Object.values(results).forEach(entry => {
    console.log(`   • ${entry.studentName}: Risk ${entry.analysis.riskScore}/10 - ${entry.analysis.pattern}`);
  });
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Ready for demo!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Test loading cache: npx tsx scripts/test-cache.ts');
  console.log('  2. Run dev server: npm run dev');
  console.log('  3. Verify emails load instantly');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

// Run the script
prepareDemoData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
