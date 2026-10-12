// test_task7_discovery_clarification_approval.js
// Automated verification suite for TASK 7: Discovery, Clarification Questions, Approval, Document Versioning

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 7 VERIFICATION SUITE ===\n');

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
      tagName: id.includes('Text') || id.includes('Desc') || id.includes('Section') || id.includes('Notes') || id.includes('ansInput') ? 'TEXTAREA' : id.includes('Select') || id.includes('Type') || id.includes('Status') || id.includes('Actor') ? 'SELECT' : 'DIV',
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
console.log('--- TEST 1: Static Markup & Global Exported Functions ---');
assert(htmlContent.includes('openClarificationStudioModal'), 'Tombol / fungsi openClarificationStudioModal ada di markup DOM');
assert(htmlContent.includes('openReviewChecklistModal'), 'Tombol / fungsi openReviewChecklistModal ada di markup DOM');
assert(htmlContent.includes('openApprovalSimulationModal'), 'Tombol / fungsi openApprovalSimulationModal ada di markup DOM');
assert(typeof generateClarificationQuestions === 'function', 'generateClarificationQuestions fungsi global terdefinisi');
assert(typeof answerClarificationQuestion === 'function', 'answerClarificationQuestion fungsi global terdefinisi');
assert(typeof updateClarificationQuestionStatus === 'function', 'updateClarificationQuestionStatus fungsi global terdefinisi');
assert(typeof initializeReviewChecklist === 'function', 'initializeReviewChecklist fungsi global terdefinisi');
assert(typeof updateReviewChecklistItem === 'function', 'updateReviewChecklistItem fungsi global terdefinisi');
assert(typeof calculateDocumentReviewStatus === 'function', 'calculateDocumentReviewStatus fungsi global terdefinisi');
assert(typeof createDocumentVersion === 'function', 'createDocumentVersion fungsi global terdefinisi');
assert(typeof detectRequirementChangeImpact === 'function', 'detectRequirementChangeImpact fungsi global terdefinisi');
assert(typeof submitDocumentApproval === 'function', 'submitDocumentApproval fungsi global terdefinisi');
assert(typeof linkBrdAndPrd === 'function', 'linkBrdAndPrd fungsi global terdefinisi');

// -------------------------------------------------------------
// TEST 2: AUTOMATED QUESTION GENERATION FROM EMPTY FIELDS, AMBIGUITIES & CONFLICTS
// -------------------------------------------------------------
console.log('\n--- TEST 2: Deteksi Gap Kebutuhan & Generate Pertanyaan Otomatis ---');
const rawPrdDraft = {
  id: 'prd-raw-1',
  code: 'PRD-RAW-001',
  company: 'PT Maju Terus',
  title: 'PRD Draft Sistem Operasional',
  productOverview: 'Sistem harus mudah digunakan dan siap diluncurkan secepatnya.',
  scopeIn: 'Fitur kasir multi-cabang dengan sinkronisasi real-time dan pembayaran QRIS dinamis dsb.',
  scopeOut: '', // Empty field
  userRoles: 'Admin', // Incomplete roles
  rolesPermissions: '', // Empty
  functionalRequirements: [
    { id: 'FR-001', title: 'Transaksi Kasir POS', description: 'Transaksi kasir otomatis tanpa jeda dan fleksibel.', priority: 'Must-Have', acceptanceCriteria: '' },
    { id: 'FR-002', title: 'Integrasi EDC Bank', description: 'Koneksi ke mesin EDC bank pihak ketiga.', priority: 'Should-Have', acceptanceCriteria: 'Lolos uji.' }
  ],
  nonFunctionalRequirements: [
    { id: 'NFR-001', category: 'Performance', description: 'Sistem harus berkinerja skala besar.', targetMetric: '' }
  ]
};

const autoQuestions = generateClarificationQuestions(rawPrdDraft);
assert(Array.isArray(autoQuestions) && autoQuestions.length >= 6, `Generate otomatis ${autoQuestions.length} pertanyaan dari teks rancangan`);

// Check categories
const emptyFieldQs = autoQuestions.filter(q => q.category === 'empty_field');
assert(emptyFieldQs.length >= 2, `Mendeteksi field kosong (FR-001 tanpa AC & Scope Out kosong, ditemukan ${emptyFieldQs.length})`);

const ambiguousQs = autoQuestions.filter(q => q.category === 'ambiguous_term');
assert(ambiguousQs.length >= 3, `Mendeteksi istilah ambigu ("secepatnya", "mudah digunakan", "real-time", "fleksibel", "dsb", ditemukan ${ambiguousQs.length})`);

const integrationQs = autoQuestions.filter(q => q.category === 'unexplained_integration');
assert(integrationQs.length >= 1, `Mendeteksi integrasi QRIS / EDC yang disebut tanpa spesifikasi teknis (${integrationQs.length})`);

const budgetTimelineQs = autoQuestions.filter(q => q.category === 'unknown_budget_timeline');
assert(budgetTimelineQs.length >= 1, `Mendeteksi budget atau timeline yang belum diketahui (${budgetTimelineQs.length})`);

// -------------------------------------------------------------
// TEST 3: KELOMPOK SEVERITY (CRITICAL, IMPORTANT, OPTIONAL)
// -------------------------------------------------------------
console.log('\n--- TEST 3: Pengelompokan Severity (Critical, Important, Optional) ---');
const critCount = autoQuestions.filter(q => q.severity === 'Critical').length;
const impCount = autoQuestions.filter(q => q.severity === 'Important').length;
const optCount = autoQuestions.filter(q => q.severity === 'Optional').length;

assert(critCount > 0, `Memuat pertanyaan Critical (${critCount} item)`);
assert(impCount > 0, `Memuat pertanyaan Important (${impCount} item)`);
assert(critCount + impCount + optCount === autoQuestions.length, 'Seluruh pertanyaan memiliki severity valid');

// -------------------------------------------------------------
// TEST 4: STATUS PERTANYAAN (OPEN, ANSWERED, DEFERRED, NOT APPLICABLE)
// -------------------------------------------------------------
console.log('\n--- TEST 4: Siklus Status Pertanyaan (Open, Answered, Deferred, Not Applicable) ---');
rawPrdDraft.clarificationQuestions = autoQuestions;
db.prds.unshift(rawPrdDraft);

const testQ = autoQuestions[0];
assert(testQ.status === 'Open', `Status awal pertanyaan adalah Open (${testQ.status})`);

updateClarificationQuestionStatus(testQ.id, 'Deferred', rawPrdDraft.id, 'prd');
assert(testQ.status === 'Deferred', 'Status berhasil diubah ke Deferred');

updateClarificationQuestionStatus(testQ.id, 'Not Applicable', rawPrdDraft.id, 'prd');
assert(testQ.status === 'Not Applicable', 'Status berhasil diubah ke Not Applicable');

updateClarificationQuestionStatus(testQ.id, 'Open', rawPrdDraft.id, 'prd');
assert(testQ.status === 'Open', 'Status berhasil dikembalikan ke Open');

// -------------------------------------------------------------
// TEST 5: JAWABAN MEMPERBARUI REQUIREMENT TANPA MENGHAPUS SOURCE TEXT
// -------------------------------------------------------------
console.log('\n--- TEST 5: Pembaruan Requirement & Preservasi Source Text ---');
const targetFr = rawPrdDraft.functionalRequirements[0];
const originalSourceText = targetFr.description;
const frQuestion = autoQuestions.find(q => q.targetId === targetFr.id) || autoQuestions.find(q => q.targetType === 'FR');
assert(Boolean(frQuestion), 'Ditemukan pertanyaan yang menargetkan Functional Requirement');

const answerInput = 'SLA response click kasir < 300ms, offline storage IndexedDB hingga 5.000 struk, dan sync otomatis saat online.';
const answerResult = answerClarificationQuestion(
  frQuestion.id,
  answerInput,
  'Budi Santoso (Lead Solution Architect)',
  'Disepakati pada workshop teknis bersama tim kasir.',
  rawPrdDraft.id,
  'prd'
);

assert(answerResult.success, 'Pemberian jawaban berhasil diproses');
assert(frQuestion.status === 'Answered', 'Status pertanyaan berubah menjadi Answered');
assert(frQuestion.answer === answerInput, 'Jawaban tersimpan pada objek pertanyaan');
assert(frQuestion.answeredBy.includes('Budi Santoso'), 'Aktor penjawab tercatat');
assert(Boolean(frQuestion.answeredAt), 'Timestamp penjawab tercatat');

// Preservasi teks sumber
assert(Boolean(targetFr.sourceText), 'Property sourceText terisi');
assert(targetFr.sourceText === originalSourceText, 'sourceText TIDAK TERHAPUS dan persis sama dengan teks sumber asli');
assert(targetFr.description.includes(originalSourceText), 'description tetap mempertahankan teks sumber asli');
assert(targetFr.description.includes(answerInput), 'description memuat teks hasil klarifikasi');
assert(Boolean(targetFr.clarifiedText) && targetFr.clarifiedText.includes(answerInput), 'clarifiedText menyimpan teks hasil klarifikasi secara terpisah');

// -------------------------------------------------------------
// TEST 6: REVIEW CHECKLIST 10 DIMENSI
// -------------------------------------------------------------
console.log('\n--- TEST 6: Review Checklist 10 Dimensi Wajib ---');
const checklist = initializeReviewChecklist(rawPrdDraft);
assert(Array.isArray(checklist) && checklist.length === 10, `Review checklist memuat tepat 10 dimensi standar (${checklist.length})`);

const expectedKeys = [
  'scope', 'user_roles', 'integrations', 'data_migration', 'security',
  'performance', 'acceptance_criteria', 'exclusions', 'budget', 'timeline'
];
expectedKeys.forEach(k => {
  const item = checklist.find(c => c.key === k);
  assert(Boolean(item), `Checklist memuat dimensi [${k}]`);
  assert(['Passed', 'Flagged', 'Pending'].includes(item.status), `Dimensi [${k}] memiliki status valid (${item.status})`);
});

// Update dimensi checklist
updateReviewChecklistItem(rawPrdDraft.id, 'prd', 'security', 'Passed', 'Enkripsi AES-256 dan SSL TLS 1.3 telah disepakati', 'Sarah Andini');
const updatedSec = rawPrdDraft.reviewChecklist.find(c => c.key === 'security');
assert(updatedSec.status === 'Passed' && updatedSec.checked, 'Dimensi security berhasil diupdate menjadi Passed');
assert(updatedSec.notes.includes('AES-256'), 'Catatan reviewer tersimpan');

// -------------------------------------------------------------
// TEST 7: STATUS DOKUMEN & STRICT NON-AUTO APPROVAL
// -------------------------------------------------------------
console.log('\n--- TEST 7: Siklus Status Dokumen & Larangan Auto-Approve ---');
// 1. Dokumen dengan pertanyaan Critical yang masih Open -> Needs Clarification
const openCritQ = rawPrdDraft.clarificationQuestions.find(q => q.severity === 'Critical');
openCritQ.status = 'Open';
const statusCheck1 = calculateDocumentReviewStatus(rawPrdDraft);
assert(statusCheck1.status === 'Needs Clarification', `Dokumen dengan open Critical question berstatus Needs Clarification (${statusCheck1.status})`);

// 2. Simulasikan seluruh pertanyaan Critical & Important terjawab
rawPrdDraft.clarificationQuestions.forEach(q => { q.status = 'Answered'; });
rawPrdDraft.reviewChecklist.forEach(c => { c.status = 'Pending'; c.checked = false; });
const statusCheck2 = calculateDocumentReviewStatus(rawPrdDraft);
assert(statusCheck2.status === 'Draft' || statusCheck2.status === 'Ready for Review', `Status transisi setelah pertanyaan selesai (${statusCheck2.status})`);

// 3. Simulasikan seluruh 10 checklist Passed (Completeness 100%)
rawPrdDraft.reviewChecklist.forEach(c => { c.status = 'Passed'; c.checked = true; });
const statusCheck3 = calculateDocumentReviewStatus(rawPrdDraft);
assert(statusCheck3.status === 'Reviewed', `Dokumen 100% Passed berstatus "Reviewed", BUKAN Approved (${statusCheck3.status})`);
assert(statusCheck3.status !== 'Approved/Confirmed' && statusCheck3.status !== 'Approved', 'Strict Governance: Dokumen TIDAK otomatis Approved hanya karena completeness score / checklist 100%!');

// -------------------------------------------------------------
// TEST 8: VERSION HISTORY & RINGKASAN PERUBAHAN
// -------------------------------------------------------------
console.log('\n--- TEST 8: Version History & Ringkasan Perubahan ---');
assert(Array.isArray(rawPrdDraft.versionHistory) && rawPrdDraft.versionHistory.length > 0, `Version history tersimpan (${rawPrdDraft.versionHistory.length} entri)`);
const latestHistory = rawPrdDraft.versionHistory[0];
assert(Boolean(latestHistory.version), `History memuat nomor versi (${latestHistory.version})`);
assert(Boolean(latestHistory.actor), `History memuat aktor (${latestHistory.actor})`);
assert(Boolean(latestHistory.timestamp), `History memuat timestamp (${latestHistory.timestamp})`);
assert(Boolean(latestHistory.changeSummary), `History memuat ringkasan perubahan (${latestHistory.changeSummary})`);

// Peningkatan versi baru
const newVerRes = createDocumentVersion(rawPrdDraft.id, 'prd', '1.1', 'Pembaruan spesifikasi pasca workshop discovery', 'Sarah Andini');
assert(newVerRes.success, 'Berhasil membuat versi baru dokumen');
assert(rawPrdDraft.version === '1.1', `Nomor versi naik ke 1.1 (${rawPrdDraft.version})`);
assert(rawPrdDraft.status === 'Draft', 'Versi baru direset ke Draft untuk review');

// -------------------------------------------------------------
// TEST 9: IMPACT WARNING & QUOTATION SNAPSHOT PROTECTION
// -------------------------------------------------------------
console.log('\n--- TEST 9: Impact Warning & Quotation Snapshot Immutability ---');
// Buat dummy quotation terkait deal
const dummyQuote = {
  id: 'qt-task7-test',
  number: 'QUO/2026/10/9999',
  dealId: rawPrdDraft.dealId || 'deal-task7-test',
  prdId: rawPrdDraft.id,
  createdAt: '2026-10-02',
  grandTotal: 45000000,
  itemsSubtotal: 35000000,
  items: [{ id: 'qi-1', name: 'Modul Inti', lineTotal: 35000000 }]
};
rawPrdDraft.dealId = dummyQuote.dealId;
db.quotations.push(dummyQuote);

// Simulasikan perubahan requirement setelah quotation terbit
rawPrdDraft.updatedAt = '2026-10-12'; // Lebih baru dari createdAt quotation (2026-10-02)
const impactRes = detectRequirementChangeImpact(rawPrdDraft.id, 'prd');

assert(impactRes.hasImpact, 'Mendeteksi adanya dampak komersial perubahan requirement');
assert(rawPrdDraft.hasRequirementChangeImpact, 'PRD ditandai hasRequirementChangeImpact = true');
assert(Boolean(rawPrdDraft.impactWarning) && rawPrdDraft.impactWarning.includes('PERINGATAN DAMPAK'), 'PRD memuat pesan impact warning');
assert(dummyQuote.hasRequirementChangeImpact, 'Quotation ditandai hasRequirementChangeImpact = true');
assert(dummyQuote.estimationReviewRequired, 'Quotation ditandai estimationReviewRequired = true');

// CRITICAL IMMUTABILITY CHECK
assert(dummyQuote.grandTotal === 45000000, `Snapshot grand total tetap terkunci (45.000.000 vs ${dummyQuote.grandTotal})`);
assert(dummyQuote.itemsSubtotal === 35000000, `Snapshot itemsSubtotal tetap terkunci (35.000.000 vs ${dummyQuote.itemsSubtotal})`);
assert(dummyQuote.items[0].lineTotal === 35000000, 'Snapshot item lineTotal tetap utuh tanpa modifikasi');

// -------------------------------------------------------------
// TEST 10: SIMULASI APPROVAL DENGAN AKTOR & TIMESTAMP
// -------------------------------------------------------------
console.log('\n--- TEST 10: Simulasi Approval Manual ---');
const approvalTimestamp = '2026-10-12T14:45:00.000Z';
const approvalActor = 'Hendra Wijaya (VP Commercial / Presales Director)';
const approvalNotes = 'Seluruh butir FR & batasan Scope Out telah dikonfirmasi dan disetujui untuk rilis komersial.';

const approvalResult = submitDocumentApproval(
  rawPrdDraft.id,
  'prd',
  approvalActor,
  approvalTimestamp,
  approvalNotes
);

assert(approvalResult.success, 'Approval simulation berhasil dieksekusi');
assert(rawPrdDraft.status === 'Approved/Confirmed', `Status dokumen berubah ke Approved/Confirmed (${rawPrdDraft.status})`);
assert(rawPrdDraft.approvalDetails.actor === approvalActor, 'Aktor approval tercatat valid');
assert(rawPrdDraft.approvalDetails.timestamp === approvalTimestamp, 'Timestamp approval tercatat valid');
assert(rawPrdDraft.approvalDetails.notes.includes(approvalNotes), 'Catatan approval tersimpan');
assert(rawPrdDraft.versionHistory[0].changeSummary.includes('Approved/Confirmed'), 'Approval tercatat di timeline version history');

// -------------------------------------------------------------
// TEST 11: TAUTAN TIMBAL BALIK (BIDIRECTIONAL LINKAGE) BRD & PRD
// -------------------------------------------------------------
console.log('\n--- TEST 11: Tautan Timbal Balik (Bidirectional Linkage) BRD & PRD ---');
const brdDemo = (db.brds || []).find(b => b.id === 'brd-demo-1') || db.brds[0];
const prdDemo = (db.prds || []).find(p => p.id === 'prd-demo-1') || db.prds[0];
assert(Boolean(brdDemo) && Boolean(prdDemo), 'Ditemukan dokumen BRD dan PRD referensi');

const linkSuccess = linkBrdAndPrd(brdDemo.id, prdDemo.id);
assert(linkSuccess, 'linkBrdAndPrd berhasil menghubungkan kedua dokumen');
assert(prdDemo.linkedBrdId === brdDemo.id, `PRD terhubung ke linkedBrdId (${prdDemo.linkedBrdId})`);
assert(prdDemo.linkedBrdCode === brdDemo.code, `PRD terhubung ke linkedBrdCode (${prdDemo.linkedBrdCode})`);
assert(brdDemo.linkedPrdId === prdDemo.id, `BRD terhubung ke linkedPrdId (${brdDemo.linkedPrdId})`);
assert(brdDemo.linkedPrdCode === prdDemo.code, `BRD terhubung ke linkedPrdCode (${brdDemo.linkedPrdCode})`);
assert(Array.isArray(brdDemo.linkedPrdIds) && brdDemo.linkedPrdIds.includes(prdDemo.id), 'BRD linkedPrdIds array memuat ID PRD');

// -------------------------------------------------------------
// TEST 12: CRM REPOSITORY TABLE RENDERING (STATUS, BADGE & AKSI)
// -------------------------------------------------------------
console.log('\n--- TEST 12: CRM Repository Table Rendering ---');
renderBrdPrdPage();
const prdTbody = getOrCreateElem('prdTableRows');
assert(prdTbody.innerHTML.includes('PRD-'), 'PRD code ter-render di tabel repositori');
assert(prdTbody.innerHTML.includes('openClarificationStudioModal'), 'Tombol openClarificationStudioModal ter-render di tabel');
assert(prdTbody.innerHTML.includes('openReviewChecklistModal'), 'Tombol openReviewChecklistModal ter-render di tabel');
assert(prdTbody.innerHTML.includes('openApprovalSimulationModal'), 'Tombol openApprovalSimulationModal ter-render di tabel');

const brdTbody = getOrCreateElem('brdTableRows');
assert(brdTbody.innerHTML.includes('BRD-'), 'BRD code ter-render di tabel repositori');
assert(brdTbody.innerHTML.includes('openClarificationStudioModal'), 'Tombol openClarificationStudioModal ter-render di tabel BRD');
assert(brdTbody.innerHTML.includes('openReviewChecklistModal'), 'Tombol openReviewChecklistModal ter-render di tabel BRD');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('=======================================');

if (failed === 0) {
  console.log('>>> 100% TASK 7 ACCEPTANCE CRITERIA VERIFIED! <<<\n');
  process.exit(0);
} else {
  console.error(`>>> TASK 7 VERIFICATION FAILED WITH ${failed} ERRORS <<<\n`);
  process.exit(1);
}
