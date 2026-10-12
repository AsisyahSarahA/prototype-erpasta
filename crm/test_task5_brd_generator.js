// test_task5_brd_generator.js
// Automated verification suite for TASK 5: BRD Generator Separated from PRD (Pure Node.js)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 5 VERIFICATION SUITE ===\n');

const crmHtmlPath = fs.existsSync(path.join(__dirname, 'crm.html'))
  ? path.join(__dirname, 'crm.html')
  : path.resolve(__dirname, '..', 'crm', 'crm.html');
const htmlContent = fs.readFileSync(crmHtmlPath, 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// SETUP MOCK BROWSER ENVIRONMENT
// -------------------------------------------------------------
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>\s*<script src="\.\.\/sidebar\.js">/);
if (!scriptMatch) {
  console.error('[FAIL] Could not extract CRM script block');
  process.exit(1);
}
const crmScript = scriptMatch[1];

const elements = {};
function getOrCreateElem(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      tagName: id.includes('Text') || id.includes('Desc') || id.includes('Summary') ? 'TEXTAREA' : id.includes('Select') || id.includes('Type') ? 'SELECT' : 'DIV',
      value: '',
      innerHTML: '',
      textContent: '',
      dataset: {},
      options: [],
      querySelectorAll: () => [],
      querySelector: () => null,
      setAttribute: () => {},
      getAttribute: () => null,
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); },
        toggle: function(c, force) {
          if (force !== undefined) {
            if (force) this._classes.add(c); else this._classes.delete(c);
          } else {
            if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
          }
        }
      },
      style: {},
      appendChild: function(child) {
        if (child.tagName === 'OPTION') this.options.push(child);
      },
      removeChild: () => {},
      addEventListener: () => {}
    };
  }
  return elements[id];
}

const localStorageStore = {};
global.window = {
  localStorage: {
    getItem: k => (k in localStorageStore ? localStorageStore[k] : null),
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: k => { delete localStorageStore[k]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
  },
  location: { hash: '#brd-prd' },
  addEventListener: () => {},
  removeEventListener: () => {},
  print: () => {}
};
global.localStorage = global.window.localStorage;
global.document = {
  readyState: 'complete',
  getElementById: id => getOrCreateElem(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: tag => ({
    tagName: tag.toUpperCase(),
    value: '',
    textContent: '',
    style: {},
    click: () => {}
  }),
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.confirm = () => true;
global.prompt = (msg, def) => def || 'Test Item';
global.Blob = class MockBlob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};
global.URL = {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: () => {}
};

try {
  vm.runInThisContext(crmScript);
  console.log('--- RUNTIME INITIALIZED SUCCESSFULLY ---\n');
} catch (err) {
  console.error('[FAIL] Runtime evaluation error:', err);
  process.exit(1);
}

const {
  db,
  repo,
  generateBrdDocument,
  calculateBrdCompleteness,
  openBrdEditorModal,
  saveBrdFromEditor,
  regenerateBrdSection,
  addBrdBusinessRequirement,
  updateBrdBusinessRequirement,
  removeBrdBusinessRequirement,
  reorderBrdBusinessRequirement,
  markBrdReadyForReview,
  openBrdSignOffModal,
  confirmBrdSignOff,
  duplicateBrdVersion,
  compareBrdVersions,
  exportBrdDocument,
  renderBrdPrdPage
} = window;

// -------------------------------------------------------------
// TEST 1: GENERATE BRD DARI REQUIREMENT SET & DISCOVERY
// -------------------------------------------------------------
console.log('--- TEST 1: Generate BRD dari Requirement Set & Discovery ---');

// Mock requirement set
const mockReqSet = {
  id: 'req-demo-test',
  code: 'REQ-2026-TEST',
  dealId: 'deal-demo-1',
  leadId: 'lead-demo-1',
  customerId: 'cust-demo-1',
  company: 'PT Nusantara Retailindo',
  pic: 'Budi Santoso',
  candidateProduct: 'Aplikasi POS & Multi-Cabang',
  productId: 'prod-pos',
  modules: ['POS Core & Kasir Transaksi', 'Inventory & Stock Realtime', 'Payment Gateway QRIS & EDC'],
  mandays: 25,
  estimatedPrice: 26000000,
  confidence: 'High',
  requirements: [
    {
      id: 'FR-01',
      title: 'Kasir Offline-First',
      feature: 'Kasir Offline-First',
      description: 'Kasir memproses transaksi dan cetak struk tanpa internet.',
      priority: 'Must-Have',
      status: 'Confirmed',
      acceptanceCriteria: 'Cetak struk < 2 detik dan data tersimpan lokal.',
      source: 'Poin 1 Dokumen Kebutuhan'
    },
    {
      id: 'FR-02',
      title: 'Sinkronisasi Multi-Outlet',
      feature: 'Sinkronisasi Multi-Outlet',
      description: 'Stok dan omzet cabang tersinkronisasi ke pusat.',
      priority: 'Should-Have',
      status: 'Confirmed',
      acceptanceCriteria: 'Sinkronisasi otomatis saat terhubung internet.',
      source: 'Poin 2 Dokumen Kebutuhan'
    }
  ],
  unknowns: ['Format data master eksisting belum dipastikan'],
  clarifications: ['Apakah target go-live sudah ditentukan?'],
  rawText: 'Kebutuhan modernisasi 12 cabang retail...'
};

const brd = generateBrdDocument({
  requirementSet: mockReqSet,
  owner: 'Sarah Andini (Presales Lead)'
});

assert(brd !== null && typeof brd === 'object', 'generateBrdDocument returns a valid object');
assert(brd.id && brd.id.startsWith('brd_') || brd.id.startsWith('brd-'), `BRD has stable ID (${brd.id})`);
assert(brd.code && brd.code.startsWith('BRD-'), `BRD has standardized code (${brd.code})`);
assert(brd.version === '1.0', `BRD initial version is 1.0 (${brd.version})`);
assert(brd.status === 'Draft', `BRD initial status is Draft (${brd.status})`);
assert(brd.owner === 'Sarah Andini (Presales Lead)', `BRD has owner (${brd.owner})`);
assert(brd.company === 'PT Nusantara Retailindo', `BRD linked to company (${brd.company})`);
assert(brd.dealId === 'deal-demo-1', `BRD linked to dealId (${brd.dealId})`);
assert(brd.requirementSetId === 'req-demo-test', `BRD linked to requirementSetId`);

// -------------------------------------------------------------
// TEST 2: 18 SECTION WAJIB STANDAR BISNIS BRD
// -------------------------------------------------------------
console.log('\n--- TEST 2: 18 Section Wajib Standar Bisnis BRD ---');

const requiredSections = [
  'executiveSummary',
  'businessBackground',
  'problemOpportunity',
  'businessObjectives',
  'successMetrics',
  'stakeholders',
  'asIsProcess',
  'toBeProcess',
  'businessRequirements',
  'businessRules',
  'scopeIn',
  'scopeOut',
  'constraints',
  'assumptions',
  'dependencies',
  'risksMitigations',
  'budgetTimelineConstraints',
  'signOffChecklist'
];

requiredSections.forEach(sec => {
  assert(sec in brd, `BRD contains section [${sec}]`);
});
assert('openQuestions' in brd, 'BRD contains openQuestions');

// -------------------------------------------------------------
// TEST 3: AUTO-NUMBERING & SCHEMA BUSINESS REQUIREMENTS (BR-001)
// -------------------------------------------------------------
console.log('\n--- TEST 3: Auto-Numbering & Schema Business Requirements ---');
assert(Array.isArray(brd.businessRequirements) && brd.businessRequirements.length >= 2, `Business requirements extracted (${brd.businessRequirements.length} items)`);

const br0 = brd.businessRequirements[0];
assert(br0.id === 'BR-001', `Auto-numbered as BR-001 (${br0.id})`);
assert(br0.title && br0.title.length > 3, `BR has title (${br0.title})`);
assert(br0.description && br0.description.length > 5, `BR has description`);
assert(br0.source && br0.source.length > 3, `BR has source citation (${br0.source})`);
assert(['Must-Have', 'Should-Have', 'Nice-to-Have'].includes(br0.priority), `BR has priority (${br0.priority})`);
assert(['Needs Clarification', 'Assumption', 'Confirmed', 'Excluded'].includes(br0.status), `BR has status (${br0.status})`);
assert(typeof br0.acceptanceCriteria === 'string' && br0.acceptanceCriteria.length > 5, `BR has acceptance criteria`);
assert('relatedStakeholder' in br0, `BR has relatedStakeholder (${br0.relatedStakeholder})`);

const br1 = brd.businessRequirements[1];
assert(br1.id === 'BR-002', `Auto-numbered sequentially as BR-002 (${br1.id})`);

// -------------------------------------------------------------
// TEST 4: UNKNOWNS JUJUR (BELUM DITENTUKAN, BUKAN MENGARANG)
// -------------------------------------------------------------
console.log('\n--- TEST 4: Unknowns Jujur (Belum Ditentukan) ---');

// Generate bare-minimum BRD without budget and timeline in text
const minimalBrd = generateBrdDocument({
  title: 'Inisiatif Baru Tanpa Data Lengkap',
  company: 'PT Prospek Awal',
  rawText: 'Klien butuh software akuntansi.'
});

assert(
  minimalBrd.budgetTimelineConstraints.toLowerCase().includes('belum ditentukan'),
  `Unknown budget/timeline honestly labeled "Belum ditentukan" (${minimalBrd.budgetTimelineConstraints})`
);
assert(
  minimalBrd.asIsProcess.toLowerCase().includes('belum ditentukan'),
  `Unknown As-Is Process honestly labeled "Belum ditentukan"`
);

// -------------------------------------------------------------
// TEST 5: COMPLETENESS SCORE SEBAGAI INDIKATOR CHECKLIST
// -------------------------------------------------------------
console.log('\n--- TEST 5: Completeness Score sebagai Indikator Checklist ---');
const completeness = calculateBrdCompleteness(brd);

assert(typeof completeness.score === 'number' && completeness.score >= 0 && completeness.score <= 100, `Completeness score calculated (${completeness.score}%)`);
assert(completeness.totalSections === 18, `Total evaluation basis is 18 sections`);
assert(completeness.filledSections > 0, `Filled sections count tracked (${completeness.filledSections}/${completeness.totalSections})`);
assert(typeof completeness.label === 'string', `Checklist label present (${completeness.label})`);

// -------------------------------------------------------------
// TEST 6: GRANULAR SECTION EDITING & RE-GENERATION DENGAN KONFIRMASI
// -------------------------------------------------------------
console.log('\n--- TEST 6: Granular Section Editing & Re-generation dengan Konfirmasi ---');

// Modify section manually
brd.executiveSummary = 'Ringkasan Eksekutif dikustomisasi secara manual oleh Business Analyst.';
brd.businessBackground = 'Latar belakang bisnis awal.';

// Regenerate single section without wiping other manual edits
regenerateBrdSection(brd, 'businessBackground', {
  rawText: 'Industri retail modern dengan pertumbuhan omzet 25% YoY.'
});

assert(brd.executiveSummary === 'Ringkasan Eksekutif dikustomisasi secara manual oleh Business Analyst.', 'Manual edit on executiveSummary was NOT overwritten');
assert(brd.businessBackground.includes('retail modern'), 'Target section businessBackground successfully regenerated');

// Add, Edit, Delete, Reorder BR items
const countBefore = brd.businessRequirements.length;
addBrdBusinessRequirement(brd, {
  title: 'Notifikasi Kuota Stok Minimum',
  description: 'Alert WhatsApp otomatis ke purchasing.',
  priority: 'Nice-to-Have',
  status: 'Assumption'
});
assert(brd.businessRequirements.length === countBefore + 1, 'Added new business requirement');
assert(brd.businessRequirements[brd.businessRequirements.length - 1].id === `BR-00${countBefore + 1}`, 'Auto-assigned sequential BR ID');

// Reorder BR item
reorderBrdBusinessRequirement(brd, 2, 0); // move item from index 2 to 0
assert(brd.businessRequirements[0].id === 'BR-001', 'Reordered items maintain sequential IDs');
assert(brd.businessRequirements[0].title === 'Notifikasi Kuota Stok Minimum', 'Item successfully moved to first position');

// -------------------------------------------------------------
// TEST 7: WORKFLOW ACTIONS: SAVE DRAFT & MARK READY FOR REVIEW
// -------------------------------------------------------------
console.log('\n--- TEST 7: Workflow Actions (Save Draft & Ready for Review) ---');

repo.create('brds', brd);
assert(db.brds.some(b => b.id === brd.id), 'BRD draft saved into repository');

markBrdReadyForReview(brd.id);
const updatedBrd = db.brds.find(b => b.id === brd.id);
assert(updatedBrd.status === 'Ready for Review', `BRD status updated to Ready for Review (${updatedBrd.status})`);

// -------------------------------------------------------------
// TEST 8: STRICT NON-AUTO SIGN-OFF DENGAN CHECKLIST VERIFIKASI
// -------------------------------------------------------------
console.log('\n--- TEST 8: Strict Non-Auto Sign-off dengan Checklist Verifikasi ---');

// Unverified signoff must be rejected
let rejected = false;
try {
  confirmBrdSignOff(brd.id, { checklistConfirmed: false });
} catch (e) {
  rejected = true;
}
assert(rejected || updatedBrd.status !== 'Signed Off', 'Sign-off without explicit checklist confirmation was refused');

// Explicit sign-off confirmation
const signOffPayload = {
  checklistConfirmed: true,
  signerName: 'Budi Santoso',
  signerRole: 'Direktur Operasional (PT Nusantara Retailindo)',
  signDate: '2026-10-11',
  notes: 'Disetujui untuk masuk tahap pembuatan PRD & WBS.'
};
confirmBrdSignOff(brd.id, signOffPayload);

const signedBrd = db.brds.find(b => b.id === brd.id);
assert(signedBrd.status === 'Signed Off', `BRD successfully Signed Off with explicit approval (${signedBrd.status})`);
assert(signedBrd.signOffDetails && signedBrd.signOffDetails.signerName === 'Budi Santoso', 'Sign-off details recorded');

// -------------------------------------------------------------
// TEST 9: VERSIONING: DUPLICATE VERSION (1.0 -> 1.1 / 2.0)
// -------------------------------------------------------------
console.log('\n--- TEST 9: Versioning: Duplicate Version ---');

const brdsCountBefore = db.brds.length;
const newVersionBrd = duplicateBrdVersion(brd.id, 'minor'); // 1.0 -> 1.1

assert(db.brds.length === brdsCountBefore + 1, 'Duplicated BRD created in repository');
assert(newVersionBrd.id !== brd.id, 'New version has unique ID');
assert(newVersionBrd.version === '1.1', `New version bumped to 1.1 (${newVersionBrd.version})`);
assert(newVersionBrd.status === 'Draft', `New version reset to Draft (${newVersionBrd.status})`);
assert(newVersionBrd.previousVersionId === brd.id, 'Linked to previousVersionId');
assert(newVersionBrd.businessRequirements.length === signedBrd.businessRequirements.length, 'Cloned all business requirements');

// -------------------------------------------------------------
// TEST 10: COMPARE VERSIONS (SIDE-BY-SIDE DIFF)
// -------------------------------------------------------------
console.log('\n--- TEST 10: Compare Versions ---');

const comparison = compareBrdVersions(brd.id, newVersionBrd.id);
assert(comparison !== null && typeof comparison === 'object', 'compareBrdVersions returns comparison object');
assert(comparison.version1 === '1.0' && comparison.version2 === '1.1', 'Compares correct version numbers');
assert(Array.isArray(comparison.sectionDiffs), 'Provides section diffs');

// -------------------------------------------------------------
// TEST 11: EXPORT MARKDOWN & TEXT
// -------------------------------------------------------------
console.log('\n--- TEST 11: Export Markdown & Text ---');

const mdExport = exportBrdDocument(brd.id, 'markdown');
assert(typeof mdExport === 'string' && mdExport.length > 200, 'Exported Markdown content');
assert(mdExport.includes('# Business Requirements Document (BRD)'), 'Markdown contains BRD title header');
assert(mdExport.includes('## 1. Executive Summary'), 'Markdown contains Executive Summary');
assert(mdExport.includes('BR-001'), 'Markdown contains BR-001 requirement table/item');

const txtExport = exportBrdDocument(brd.id, 'txt');
assert(typeof txtExport === 'string' && txtExport.includes('BUSINESS REQUIREMENTS DOCUMENT'), 'Exported plain text document');

// -------------------------------------------------------------
// TEST 12: CRM REPOSITORY TABLE RENDERING (BRD TAB)
// -------------------------------------------------------------
console.log('\n--- TEST 12: CRM Repository Table Rendering (BRD Tab) ---');

renderBrdPrdPage();
const brdTbody = getOrCreateElem('brdTableRows');
assert(brdTbody.innerHTML.includes(brd.code), 'BRD rendered in repository table');
assert(brdTbody.innerHTML.includes('Signed Off') || brdTbody.innerHTML.includes('Draft'), 'BRD status badge rendered in table');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('=======================================');

if (failed === 0) {
  console.log('>>> 100% TASK 5 ACCEPTANCE CRITERIA VERIFIED! <<<');
  process.exit(0);
} else {
  console.log('>>> SOME TESTS FAILED! IMPLEMENTATION NEEDED <<<');
  process.exit(1);
}
