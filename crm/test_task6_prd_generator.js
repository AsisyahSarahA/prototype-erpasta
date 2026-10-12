// test_task6_prd_generator.js
// Automated verification suite for TASK 6: PRD Generator Separated from BRD (Pure Node.js)

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 6 VERIFICATION SUITE ===\n');

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
      tagName: id.includes('Text') || id.includes('Desc') || id.includes('Section') ? 'TEXTAREA' : id.includes('Select') || id.includes('Type') || id.includes('Status') ? 'SELECT' : 'DIV',
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
global.alert = () => {};
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

// -------------------------------------------------------------
// TEST 1: STATIC MARKUP & EXPORTED FUNCTIONS
// -------------------------------------------------------------
assert(htmlContent.includes('openNewPrdPromptModal()'), 'Tombol openNewPrdPromptModal() ada di markup DOM');
assert(htmlContent.includes('openPrdCompareModal()'), 'Tombol openPrdCompareModal() ada di markup DOM');
assert(htmlContent.includes('id="prdTableRows"'), 'Tabel id="prdTableRows" ada di markup DOM');
assert(typeof generatePrdDocument === 'function', 'generatePrdDocument fungsi global terdefinisi');
assert(typeof calculatePrdReadiness === 'function', 'calculatePrdReadiness fungsi global terdefinisi');
assert(typeof regeneratePrdSection === 'function', 'regeneratePrdSection fungsi global terdefinisi');
assert(typeof addPrdFunctionalRequirement === 'function', 'addPrdFunctionalRequirement fungsi global terdefinisi');
assert(typeof updatePrdFunctionalRequirement === 'function', 'updatePrdFunctionalRequirement fungsi global terdefinisi');
assert(typeof removePrdFunctionalRequirement === 'function', 'removePrdFunctionalRequirement fungsi global terdefinisi');
assert(typeof reorderPrdFunctionalRequirement === 'function', 'reorderPrdFunctionalRequirement fungsi global terdefinisi');
assert(typeof addPrdNonFunctionalRequirement === 'function', 'addPrdNonFunctionalRequirement fungsi global terdefinisi');
assert(typeof updatePrdNonFunctionalRequirement === 'function', 'updatePrdNonFunctionalRequirement fungsi global terdefinisi');
assert(typeof removePrdNonFunctionalRequirement === 'function', 'removePrdNonFunctionalRequirement fungsi global terdefinisi');
assert(typeof duplicatePrdVersion === 'function', 'duplicatePrdVersion fungsi global terdefinisi');
assert(typeof comparePrdVersions === 'function', 'comparePrdVersions fungsi global terdefinisi');
assert(typeof exportPrdDocument === 'function', 'exportPrdDocument fungsi global terdefinisi');
assert(typeof printPrdDocument === 'function', 'printPrdDocument fungsi global terdefinisi');
assert(typeof openPrdStudioModal === 'function', 'openPrdStudioModal fungsi global terdefinisi');
assert(typeof openPrdDetailModal === 'function', 'openPrdDetailModal fungsi global terdefinisi');

// -------------------------------------------------------------
// TEST 2: GENERATE PRD DARI DOKUMEN BRD
// -------------------------------------------------------------
console.log('\n--- TEST 2: Generate PRD dari Dokumen BRD Terpilih ---');
const brdDemo = (db.brds || []).find(b => b.id === 'brd-demo-1') || db.brds[0];
assert(Boolean(brdDemo), 'Ditemukan dokumen BRD referensi (brd-demo-1)');

const generatedPrd = generatePrdDocument({
  brd: brdDemo,
  productId: 'prod-pos'
});

assert(generatedPrd !== null && typeof generatedPrd === 'object', 'generatePrdDocument menghasilkan objek PRD yang valid');
assert(generatedPrd.id && generatedPrd.id.startsWith('prd_'), `PRD memiliki ID stabil (${generatedPrd.id})`);
assert(generatedPrd.code && generatedPrd.code.startsWith('PRD-'), `PRD memiliki kode terstandarisasi (${generatedPrd.code})`);
assert(generatedPrd.version === '1.0', `Versi awal PRD adalah 1.0 (${generatedPrd.version})`);
assert(generatedPrd.status === 'Draft', `Status awal PRD adalah Draft (${generatedPrd.status})`);
assert(generatedPrd.owner && generatedPrd.owner.includes('Solution Architect'), `PRD memiliki owner teknis (${generatedPrd.owner})`);
assert(generatedPrd.company === brdDemo.company, `PRD terhubung ke perusahaan klien (${generatedPrd.company})`);
assert(generatedPrd.linkedBrdId === brdDemo.id, `PRD terhubung ke linkedBrdId (${generatedPrd.linkedBrdId})`);
assert(generatedPrd.linkedBrdCode === brdDemo.code, `PRD terhubung ke linkedBrdCode (${generatedPrd.linkedBrdCode})`);

// -------------------------------------------------------------
// TEST 3: 21 SECTION WAJIB STANDAR PRD
// -------------------------------------------------------------
console.log('\n--- TEST 3: 21 Section Wajib Standar PRD ---');
const prdSections = [
  'productOverview', 'goals', 'problemStatement', 'personas', 'userJourneys',
  'functionalRequirements', 'nonFunctionalRequirements', 'featureModuleBreakdown',
  'dataEntities', 'integrations', 'rolesPermissions', 'businessRules',
  'acceptanceCriteria', 'scopeIn', 'scopeOut', 'assumptions', 'constraints',
  'risks', 'dependencies', 'analyticsReporting', 'openQuestions'
];

prdSections.forEach(sec => {
  assert(generatedPrd[sec] !== undefined && generatedPrd[sec] !== null, `PRD memuat bagian wajib [${sec}]`);
});

// -------------------------------------------------------------
// TEST 4: SCHEMA FR & TRACEABILITY BRD -> PRD
// -------------------------------------------------------------
console.log('\n--- TEST 4: Schema FR & Traceability BRD -> PRD ---');
assert(Array.isArray(generatedPrd.functionalRequirements) && generatedPrd.functionalRequirements.length >= 2, `FR diekstrak dari BRD (${generatedPrd.functionalRequirements.length} item)`);
const frItem1 = generatedPrd.functionalRequirements[0];
assert(frItem1.id === 'FR-001', `Auto-numbered sebagai FR-001 (${frItem1.id})`);
assert(Boolean(frItem1.title), `FR memiliki title/feature (${frItem1.title})`);
assert(Boolean(frItem1.description), 'FR memiliki deskripsi fungsional');
assert(['Must-Have', 'Should-Have', 'Could-Have', "Won't-Have"].includes(frItem1.priority), `FR memiliki prioritas MoSCoW valid (${frItem1.priority})`);
assert(Boolean(frItem1.acceptanceCriteria), `FR memiliki acceptance criteria (${frItem1.acceptanceCriteria})`);
assert(Boolean(frItem1.moduleMapping), `FR memiliki pemetaan modul katalog (${frItem1.moduleMapping})`);
assert(Boolean(frItem1.linkedBrId), `FR memiliki traceability linkedBrId (${frItem1.linkedBrId})`);
assert(Boolean(frItem1.linkedBrTitle), `FR memiliki traceability linkedBrTitle (${frItem1.linkedBrTitle})`);

// -------------------------------------------------------------
// TEST 5: SCHEMA NFR DENGAN METRIK TERUKUR
// -------------------------------------------------------------
console.log('\n--- TEST 5: Schema NFR Terukur ---');
assert(Array.isArray(generatedPrd.nonFunctionalRequirements) && generatedPrd.nonFunctionalRequirements.length >= 3, `NFR terdefinisi (${generatedPrd.nonFunctionalRequirements.length} item)`);
const nfrItem1 = generatedPrd.nonFunctionalRequirements[0];
assert(nfrItem1.id === 'NFR-001', `NFR auto-numbered sebagai NFR-001 (${nfrItem1.id})`);
assert(['Performance', 'Security', 'Reliability & Availability', 'Scalability', 'Compatibility', 'Backup & Recovery'].includes(nfrItem1.category), `NFR memiliki kategori valid (${nfrItem1.category})`);
assert(Boolean(nfrItem1.targetMetric), `NFR memiliki target metric terukur (${nfrItem1.targetMetric})`);
assert(Boolean(nfrItem1.acceptanceCriteria), 'NFR memiliki kriteria verifikasi');

// -------------------------------------------------------------
// TEST 6: DETEKSI GAP & READINESS ASSESSMENT JUJUR
// -------------------------------------------------------------
console.log('\n--- TEST 6: Deteksi Gap & Readiness Assessment Jujur ---');
// When PRD has openQuestions, it MUST NOT claim readiness
const readinessWithGaps = calculatePrdReadiness(generatedPrd);
assert(readinessWithGaps.gapSummary.openQuestionsCount > 0, `Terdeteksi ${readinessWithGaps.gapSummary.openQuestionsCount} open questions`);
assert(!readinessWithGaps.isReadyForEstimation, `Jujur: isReadyForEstimation adalah false saat ada open questions (ready: ${readinessWithGaps.isReadyForEstimation})`);
assert(readinessWithGaps.label.includes('Open Question') || readinessWithGaps.label.includes('Gap'), `Label mendiskusikan gap kebutuhan (${readinessWithGaps.label})`);

// Simulasikan resolusi open questions
const resolvedPrd = JSON.parse(JSON.stringify(generatedPrd));
resolvedPrd.openQuestions = [];
const readinessResolved = calculatePrdReadiness(resolvedPrd);
assert(readinessResolved.isReadyForEstimation, `Kesiapan disetujui (true) setelah seluruh gap terselesaikan (ready: ${readinessResolved.isReadyForEstimation})`);
assert(readinessResolved.label === 'Lengkap & Siap Estimasi WBS', `Label kesiapan menyatakan Lengkap & Siap Estimasi (${readinessResolved.label})`);

// Simulasikan jika ada FR yang kehilangan Acceptance Criteria
resolvedPrd.functionalRequirements[0].acceptanceCriteria = '';
const readinessMissingAc = calculatePrdReadiness(resolvedPrd);
assert(!readinessMissingAc.isReadyForEstimation, 'Ditolak: isReadyForEstimation false ketika ada FR tanpa Acceptance Criteria');
assert(readinessMissingAc.gapSummary.missingAcCount === 1, 'Gap summary mencatat 1 missing AC');

// -------------------------------------------------------------
// TEST 7: GRANULAR SECTION REGENERATION (NO OVERWRITE OF USER EDITS)
// -------------------------------------------------------------
console.log('\n--- TEST 7: Granular Section Regeneration ---');
db.prds.unshift(generatedPrd);
generatedPrd.productOverview = 'EDISI MANUAL KHUSUS OLEH USER - JANGAN DITIMPA';
regeneratePrdSection(generatedPrd.id, 'goals');
assert(generatedPrd.productOverview === 'EDISI MANUAL KHUSUS OLEH USER - JANGAN DITIMPA', 'Edit manual pada productOverview TIDAK tertimpa saat section goals diregenerate');
assert(Boolean(generatedPrd.goals), 'Section goals berhasil di-regenerate');

// -------------------------------------------------------------
// TEST 8: FR & NFR CRUD DAN REORDERING
// -------------------------------------------------------------
console.log('\n--- TEST 8: FR & NFR CRUD dan Reordering ---');
const newFr = addPrdFunctionalRequirement(generatedPrd.id, {
  title: 'Integrasi Barcode Scanner USB',
  description: 'Membaca barcode EAN-13.',
  priority: 'Should-Have',
  acceptanceCriteria: 'Membaca barcode < 300ms.'
});
assert(newFr.id === `FR-${String(generatedPrd.functionalRequirements.length).padStart(3, '0')}`, `Auto-assigned sequential ID (${newFr.id})`);

updatePrdFunctionalRequirement(generatedPrd.id, newFr.id, { priority: 'Must-Have' });
const updatedFr = generatedPrd.functionalRequirements.find(f => f.id === newFr.id);
assert(updatedFr.priority === 'Must-Have', 'Berhasil update prioritas FR secara modular');

const lastIdx = generatedPrd.functionalRequirements.length - 1;
reorderPrdFunctionalRequirement(generatedPrd.id, lastIdx, 0);
assert(generatedPrd.functionalRequirements[0].title === 'Integrasi Barcode Scanner USB', 'Item berhasil dipindahkan ke posisi pertama');
assert(generatedPrd.functionalRequirements[0].id === 'FR-001', 'Item pertama mempertahankan nomor ID FR-001 berurutan');

removePrdFunctionalRequirement(generatedPrd.id, 'FR-001');
assert(generatedPrd.functionalRequirements[0].id === 'FR-001', 'Item setelah penghapusan tetap memiliki nomor urut konsisten');

const newNfr = addPrdNonFunctionalRequirement(generatedPrd.id, {
  category: 'Security',
  description: 'Otentikasi 2FA untuk akun Supervisor.',
  targetMetric: 'TOTP Google Authenticator',
  acceptanceCriteria: 'Kode 6 digit diverifikasi dalam < 1 detik.'
});
assert(Boolean(newNfr && newNfr.id.startsWith('NFR-')), `Berhasil tambah NFR (${newNfr.id})`);

// -------------------------------------------------------------
// TEST 9: VERSIONING (DUPLICATE VERSION)
// -------------------------------------------------------------
console.log('\n--- TEST 9: Versioning (Duplicate Version) ---');
const duplicatedPrd = duplicatePrdVersion(generatedPrd.id, 'minor');
assert(duplicatedPrd.id !== generatedPrd.id, `Versi baru memiliki ID unik (${duplicatedPrd.id})`);
assert(duplicatedPrd.version === '1.1', `Nomor versi dinaikkan ke 1.1 (${duplicatedPrd.version})`);
assert(duplicatedPrd.status === 'Draft', `Status versi baru direset ke Draft (${duplicatedPrd.status})`);
assert(duplicatedPrd.previousVersionId === generatedPrd.id, `Terhubung ke previousVersionId (${duplicatedPrd.previousVersionId})`);
assert(duplicatedPrd.functionalRequirements.length === generatedPrd.functionalRequirements.length, 'Seluruh kebutuhan fungsional berhasil dikloning');

// -------------------------------------------------------------
// TEST 10: PERBANDINGAN VERSI (COMPARE VERSIONS)
// -------------------------------------------------------------
console.log('\n--- TEST 10: Perbandingan Versi (Compare Versions) ---');
const targetPrdInDb = (db.prds || []).find(p => p.id === duplicatedPrd.id);
if (targetPrdInDb) targetPrdInDb.productOverview = 'Overview yang diubah pada v1.1';
duplicatedPrd.productOverview = 'Overview yang diubah pada v1.1';
const compResult = comparePrdVersions(generatedPrd.id, duplicatedPrd.id);
assert(compResult !== null && typeof compResult === 'object', 'comparePrdVersions mengembalikan objek perbandingan diff');
assert(compResult.prd1.version === '1.0' && compResult.prd2.version === '1.1', 'Membandingkan versi yang benar');
const overviewDiff = compResult.sectionDiffs.find(s => s.key === 'productOverview');
assert(overviewDiff && overviewDiff.changed, 'Mendeteksi perbedaan perubahan narasi productOverview');

// -------------------------------------------------------------
// TEST 11: EKSPOR MARKDOWN & TXT
// -------------------------------------------------------------
console.log('\n--- TEST 11: Ekspor Markdown & TXT ---');
const mdDoc = exportPrdDocument(generatedPrd.id, 'markdown');
assert(mdDoc.includes('# PRD:'), 'Ekspor Markdown memuat judul dokumen # PRD');
assert(mdDoc.includes('| ID FR | Fitur Fungsional |'), 'Ekspor Markdown memuat tabel Traceability Matrix FR');
assert(mdDoc.includes('| ID NFR | Kategori |'), 'Ekspor Markdown memuat tabel NFR');

const txtDoc = exportPrdDocument(generatedPrd.id, 'text');
assert(txtDoc.includes('PRODUCT REQUIREMENTS DOCUMENT (PRD)'), 'Ekspor Plain Text memuat header standar');
assert(txtDoc.includes('4. FUNCTIONAL REQUIREMENTS (TRACEABILITY MATRIX)'), 'Ekspor Plain Text memuat Traceability Matrix');

// -------------------------------------------------------------
// TEST 12: CRM REPOSITORY TABLE RENDERING (PRD TAB)
// -------------------------------------------------------------
console.log('\n--- TEST 12: CRM Repository Table Rendering (PRD Tab) ---');
renderBrdPrdPage();
const prdTable = document.getElementById('prdTableRows');
assert(Boolean(prdTable && prdTable.innerHTML.includes(esc(generatedPrd.title))), 'Dokumen PRD ter-render di tabel repositori');
assert(prdTable.innerHTML.includes('Must-Have'), 'Tabel menampilkan statistik MoSCoW FR');
assert(prdTable.innerHTML.includes('v1.0'), 'Tabel menampilkan badge versi');

// -------------------------------------------------------------
// TEST 13: STRICT NON-AUTOMATION GUARDRAILS
// -------------------------------------------------------------
console.log('\n--- TEST 13: Strict Non-Automation Guardrails ---');
const prevWbsCount = (db.wbs || []).length;
const prevQuoteCount = (db.quotations || []).length;
// Generating a PRD must NEVER auto-generate WBS tasks or Quotations
generatePrdDocument({ title: 'PRD Mandiri Uji Non-Automation', company: 'PT Test Corp' });
assert((db.wbs || []).length === prevWbsCount, 'PRD generator TIDAK membuat data WBS otomatis tanpa user review');
assert((db.quotations || []).length === prevQuoteCount, 'PRD generator TIDAK membuat quotation otomatis tanpa user review');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('=======================================');

if (failed === 0) {
  console.log('>>> 100% TASK 6 ACCEPTANCE CRITERIA VERIFIED! <<<');
  process.exit(0);
} else {
  console.error(`>>> ${failed} TEST(S) FAILED IN TASK 6! <<<`);
  process.exit(1);
}
