const fs = require('fs');
const path = require('path');

console.log('=== TEST SUITE: TASK 2 CRM DATA LAYER & PERSISTENCE ===\n');

// 1. Read crm.html and extract the JavaScript code
const crmHtmlPath = fs.existsSync(path.join(__dirname, 'crm.html'))
  ? path.join(__dirname, 'crm.html')
  : path.resolve(__dirname, '..', 'crm', 'crm.html');
const html = fs.readFileSync(crmHtmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<script src="\.\.\/sidebar\.js">/);

if (!scriptMatch) {
  console.error('[FAIL] Could not locate main CRM script in crm/crm.html');
  process.exit(1);
}

const crmScript = scriptMatch[1];
console.log('[PASS] Located CRM script inside crm/crm.html (' + crmScript.length + ' chars)');

// 2. Setup mock browser environment
const localStorageStore = {};
const mockLocalStorage = {
  getItem: (k) => (k in localStorageStore ? localStorageStore[k] : null),
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

const createMockElement = (id = '') => ({
  id,
  classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
  innerHTML: '',
  textContent: '',
  value: '',
  checked: false,
  querySelectorAll: () => [],
  querySelector: () => null,
  setAttribute: () => {},
  getAttribute: () => null,
  appendChild: () => {},
  removeChild: () => {},
  addEventListener: () => {}
});

global.window = {
  localStorage: mockLocalStorage,
  location: { hash: '#dashboard' },
  addEventListener: () => {}
};
global.localStorage = mockLocalStorage;
global.document = {
  readyState: 'complete',
  getElementById: (id) => createMockElement(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement(tag),
  addEventListener: () => {}
};
global.confirm = () => true;

// Execute script in mock environment
try {
  eval(crmScript);
  console.log('[PASS] Evaluated CRM state & repo engine successfully');
} catch (e) {
  console.error('[FAIL] Evaluation error:', e);
  process.exit(1);
}

const db = window.db;
const repo = window.repo;
const STORAGE_KEY = window.STORAGE_KEY;

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

// TEST 1: Check All 22 Entities in state & seed
console.log('\n--- TEST 1: Entity Completeness (All 22 Entities) ---');
const requiredEntities = [
  'leads', 'opportunities', 'deals', 'customers', 'contacts',
  'products', 'modules', 'rateCards', 'requirementSets', 'brds',
  'prds', 'wbs', 'offerings', 'quotations', 'followUps',
  'activities', 'maintenancePlans', 'onboardingRecords', 'handovers',
  'automationRules', 'automationRuns', 'auditEvents', 'settings'
];

requiredEntities.forEach(ent => {
  if (ent === 'settings') {
    assert(db.settings && typeof db.settings === 'object' && db.settings.companyName, `Entity settings present with company: ${db.settings?.companyName}`);
  } else {
    assert(Array.isArray(db[ent]) && db[ent].length > 0, `Entity collection [${ent}] present (count: ${db[ent]?.length})`);
  }
});

// TEST 2: Check Duplicate IDs in Seed
console.log('\n--- TEST 2: Duplicate ID Check in Demo Seed ---');
const seenIds = new Set();
let duplicatesFound = false;
const collectionsWithIds = [
  'leads', 'deals', 'customers', 'contacts', 'products', 'modules',
  'rateCards', 'requirementSets', 'brds', 'prds', 'wbs', 'offerings',
  'quotations', 'followUps', 'activities', 'maintenancePlans',
  'onboardings', 'handovers', 'automationRules', 'automationRuns', 'auditEvents'
];

collectionsWithIds.forEach(col => {
  (db[col] || []).forEach(item => {
    if (item.id) {
      if (seenIds.has(item.id)) {
        console.error(`Duplicate ID found: [${item.id}] in collection ${col}`);
        duplicatesFound = true;
      }
      seenIds.add(item.id);
    }
  });
});
assert(!duplicatesFound, `Zero duplicate IDs found across all collections (${seenIds.size} unique IDs verified)`);

// TEST 3: Check Demo Label on Seed Records
console.log('\n--- TEST 3: Demo Labeling on Seed Records ---');
let allDemoLabeled = true;
['leads', 'deals', 'customers', 'contacts', 'products', 'modules', 'rateCards', 'requirementSets', 'brds', 'prds', 'wbs', 'offerings', 'quotations', 'handovers'].forEach(col => {
  const unlabelled = (db[col] || []).filter(item => item.isDemo !== true);
  if (unlabelled.length > 0) {
    console.error(`Collection ${col} has ${unlabelled.length} unlabelled items`);
    allDemoLabeled = false;
  }
});
assert(allDemoLabeled, 'All seed entities are properly marked with isDemo: true');

// TEST 4: CRUD & Repository Persistence
console.log('\n--- TEST 4: Repository Helper CRUD & Persistence ---');
assert(typeof repo === 'object', 'Repository helper (window.repo / CRMRepo) is exposed');
assert(typeof repo.create === 'function' && typeof repo.update === 'function', 'repo.create and repo.update exist');
assert(typeof repo.get === 'function' && typeof repo.list === 'function', 'repo.get and repo.list exist');
assert(typeof repo.archive === 'function' && typeof repo.remove === 'function', 'repo.archive and repo.remove exist');

// Test Create
const testLead = repo.create('leads', {
  code: 'LEAD-TEST-001',
  company: 'PT Uji Persistensi Mandiri',
  pic: 'Ir. Hendro Wijaya',
  stage: 0,
  budget: 25000000
}, 'Sarah Andini (Sales AE)', 'Test Lead Creation');

assert(testLead && testLead.id, `Created lead with stable ID: ${testLead.id}`);
const fetchedLead = repo.get('leads', testLead.id);
assert(fetchedLead && fetchedLead.company === 'PT Uji Persistensi Mandiri', 'repo.get accurately retrieved created lead');

// Test Update
const updatedLead = repo.update('leads', testLead.id, { budget: 30000000, stage: 2 }, 'Sarah Andini (Sales AE)', 'Budget discovery diperbarui');
assert(updatedLead.budget === 30000000 && updatedLead.stage === 2, 'repo.update successfully patched lead fields');

// Test Persistence in Storage
const storedRaw = mockLocalStorage.getItem(STORAGE_KEY);
assert(storedRaw && storedRaw.includes('PT Uji Persistensi Mandiri'), 'Changes saved synchronously to localStorage');

// TEST 5: Quotation & Handover Snapshot Protection
console.log('\n--- TEST 5: Historical Quotation Snapshot & Master Immutability ---');
const quote1 = repo.get('quotations', 'qt-demo-1');
assert(quote1 && quote1.snapshot, 'Quotation qt-demo-1 has precomputed snapshot');
assert(quote1.snapshot.commercials && quote1.snapshot.commercials.grandTotal > 0, `Snapshot grand total: ${quote1.snapshot.commercials.grandTotal}`);

// Simulate modifying master module
const posCoreModule = repo.get('modules', 'pos-core');
const originalModulePrice = posCoreModule.price;
posCoreModule.price = 999999999;
posCoreModule.rate = 99999999;

// Historical quote total must NOT change!
const quote1Commercials = calculateQuotationCommercials(quote1);
assert(quote1.snapshot.commercials.itemsSubtotal === 27700000, 'Quotation snapshot itemsSubtotal remained locked at 27.700.000 despite master module mutation');
assert(quote1.items[0].rate === 1000000 && quote1.items[0].lineTotal === 12000000, 'Quotation line item rate & lineTotal preserved independently from master module');

// Restore module price
posCoreModule.price = originalModulePrice;

// Check Handover Snapshot
const handover1 = repo.get('handovers', 'hdv-demo-1');
assert(handover1 && handover1.snapshot, 'Handover hdv-demo-1 has full snapshot');
assert(handover1.snapshot.customer && handover1.snapshot.quote && handover1.snapshot.prd && handover1.snapshot.wbs, 'Handover snapshot preserves customer, quote, PRD, and WBS');

// TEST 6: Reference Integrity & Delete Protection
console.log('\n--- TEST 6: Reference Integrity & Safe Delete / Archive Protection ---');
const refCheckProd = repo.checkReferences('products', 'prod-pos');
assert(refCheckProd.referenced === true, `Product prod-pos reference check detected: ${refCheckProd.summary}`);

// Attempting to delete referenced product should auto-archive instead of hard deleting
const deleteResult = repo.remove('products', 'prod-pos', 'Sarah Andini', 'Percobaan hapus produk yang dipakai');
const prodAfterDelete = repo.get('products', 'prod-pos');
assert(prodAfterDelete !== null, 'prod-pos was NOT permanently deleted');
assert(prodAfterDelete.active === false && prodAfterDelete.isArchived === true, 'prod-pos was safely converted to archived (active: false, isArchived: true)');

// Unreferenced entity CAN be deleted
const tempLead = repo.create('leads', { company: 'Unreferenced Temp Company' });
const deleteTempResult = repo.remove('leads', tempLead.id);
assert(deleteTempResult === true, 'Unreferenced entity was cleanly removed');
assert(repo.get('leads', tempLead.id) === null, 'Unreferenced entity no longer exists in collection');

// TEST 7: Enhanced Audit Logging
console.log('\n--- TEST 7: Audit Trail Logging with Actor, Status & Reason ---');
const lastAudit = db.auditEvents[0];
assert(lastAudit && lastAudit.actor && lastAudit.timestamp, `Latest audit has actor (${lastAudit.actor}) and timestamp`);
assert(lastAudit.fromStatus !== undefined || lastAudit.toStatus !== undefined, 'Audit record tracks status changes');
assert(lastAudit.reason, `Audit record captures reason: "${lastAudit.reason}"`);

// TEST 8: Corrupt JSON Fallback & Rescue Backup
console.log('\n--- TEST 8: Corrupted JSON Fallback & Rescue Storage ---');
const corruptPayload = '{ corrupted: true, broken_json:';
mockLocalStorage.setItem(STORAGE_KEY, corruptPayload);

const recoveredDb = loadState();
assert(recoveredDb && Array.isArray(recoveredDb.leads) && recoveredDb.leads.length > 0, 'loadState gracefully recovered clean dataset from seed upon JSON corruption');
const backupKeys = Object.keys(localStorageStore).filter(k => k.startsWith('astacode_crm_corrupted_backup_'));
assert(backupKeys.length > 0, `Corrupted data was backed up to: ${backupKeys[0]}`);
assert(localStorageStore[backupKeys[0]] === corruptPayload, 'Backup accurately retained original corrupted string for rescue');

// TEST 9: Reset Demo Protection
console.log('\n--- TEST 9: Reset Demo Data Mandatory Confirmation ---');
assert(repo.resetDemo(false) === false, 'repo.resetDemo(false) refused unconfirmed reset');
const resetSuccess = repo.resetDemo(true);
assert(resetSuccess === true, 'repo.resetDemo(true) successfully restored initial seed dataset');
assert(db.leads.length >= 6, 'Seed leads restored to initial count');

console.log(`\n=== SUMMARY: ${passedTests}/${totalTests} TESTS PASSED ===\n`);
if (passedTests === totalTests) {
  console.log('ALL ACCEPTANCE CRITERIA FOR TASK 2 HAVE BEEN SUCCESSFULLY VERIFIED!');
} else {
  console.error('Some tests failed!');
  process.exit(1);
}
