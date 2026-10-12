const fs = require('fs');
const path = require('path');

console.log('--- Testing crm.html syntax & completeness ---');

const crmHtmlPath = fs.existsSync(path.join(__dirname, 'crm.html'))
  ? path.join(__dirname, 'crm.html')
  : path.resolve(__dirname, '..', 'crm', 'crm.html');

const html = fs.readFileSync(crmHtmlPath, 'utf8');

// 1. Check all 14 page sections exist in HTML
const requiredPages = [
  'dashboard', 'leads', 'pipeline', 'requirements', 'brd-prd',
  'master', 'rate-card', 'offerings', 'quotation', 'activity',
  'customer', 'automation', 'handover', 'guide'
];

let missingSections = [];
for (const p of requiredPages) {
  if (!html.includes(`id="page-${p}"`)) {
    missingSections.push(p);
  }
}

if (missingSections.length > 0) {
  console.error('FAIL: Missing HTML page sections:', missingSections);
  process.exit(1);
} else {
  console.log('PASS: All 14 page sections present in HTML DOM.');
}

// 2. Extract and check JavaScript syntax
const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatches) {
  console.error('FAIL: Could not find main script block in crm.html');
  process.exit(1);
}

const jsCode = scriptMatches[1];

// Use node vm to test syntax validity
const vm = require('vm');
try {
  new vm.Script(jsCode, { filename: 'crm.html (inline script)' });
  console.log('PASS: JavaScript syntax in crm.html is 100% valid with NO syntax errors!');
} catch (err) {
  console.error('FAIL: JavaScript syntax error in crm.html:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// 3. Check dead buttons resolved
const deadButtons = ['openActivity', 'setQuoteStatus', 'handleTopSearch'];
for (const fn of deadButtons) {
  if (!jsCode.includes(`function ${fn}`)) {
    console.error(`FAIL: Missing function ${fn}`);
    process.exit(1);
  }
}
console.log('PASS: All dead button handlers (openActivity, setQuoteStatus, handleTopSearch) are defined.');

// 4. Run sidebar integration tests
console.log('\nRunning test_sidebar_crm_integration.js...');
require('./test_sidebar_crm_integration.js');
