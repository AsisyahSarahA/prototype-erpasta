// run_all_tests.js
// Master test runner for all CRM test suites in the crm/ directory
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('   ASTA ERP CRM - AUTOMATED TEST SUITE RUNNER       ');
console.log('====================================================\n');

const testDir = __dirname;
const testFiles = [
  'test_crm_syntax.js',
  'test_sidebar_crm_integration.js',
  'test_task2_data_layer.js',
  'test_task3_requirement_studio.js',
  'test_task4_requirement_mapping.js',
  'test_task5_brd_generator.js',
  'test_task6_prd_generator.js',
  'test_task7_discovery_clarification_approval.js',
  'test_task8_leads_pipeline_conversion.js',
  'test_task9_master_catalog_rate_card.js',
  'test_task10_wbs_estimation_builder.js'
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const testFile of testFiles) {
  const filePath = path.join(testDir, testFile);
  if (!fs.existsSync(filePath)) {
    console.error(`[SKIP] File not found: ${testFile}`);
    continue;
  }

  process.stdout.write(`Executing ${testFile.padEnd(45)} `);
  try {
    execSync(`node "${filePath}"`, {
      cwd: testDir,
      stdio: 'pipe',
      timeout: 30000
    });
    console.log('[PASS]');
    totalPassed++;
    results.push({ file: testFile, status: 'PASS' });
  } catch (error) {
    console.log('[FAIL]');
    totalFailed++;
    results.push({
      file: testFile,
      status: 'FAIL',
      error: error.stderr ? error.stderr.toString() : error.message
    });
  }
}

console.log('\n====================================================');
console.log(`SUMMARY: ${totalPassed}/${testFiles.length} Test Suites Passed (${totalFailed} Failed)`);
console.log('====================================================');

if (totalFailed > 0) {
  console.error('\nFailures detected in:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.error(`- ${r.file}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log('\nALL CRM SUITES EXECUTED AND PASSED SUCCESSFULLY!\n');
}
