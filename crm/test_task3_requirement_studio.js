// test_task3_requirement_studio.js
// Automated verification suite for TASK 3: AI Automation / Requirement Studio (Pure Node.js)

const fs = require('fs');
const path = require('path');

console.log('=== RUNNING TASK 3 VERIFICATION SUITE ===\n');

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
// 1. STATIC HTML MARKUP CHECKS
// -------------------------------------------------------------
console.log('--- 1. STATIC HTML MARKUP CHECKS ---');

// AC 1.1: Mandatory Prototype Banner
assert(
  htmlContent.includes('Prototype: analisis lokal berbasis aturan, bukan AI cloud. Dokumen tetap di browser.'),
  'Exact banner text present in crm.html'
);
assert(
  htmlContent.includes('Pemrosesan file (TXT, MD, HTML) dan instruksi teks berjalan 100% di memori browser lokal'),
  'Banner explains local offline processing and no transmission to cloud LLM'
);

// AC 1.2: Two Main Inputs
assert(
  htmlContent.includes('id="reqFreeTextInput"'),
  'Textarea input id="reqFreeTextInput" exists in markup'
);
assert(
  htmlContent.includes('id="reqFileInput"') && htmlContent.includes('type="file"'),
  'File picker input id="reqFileInput" exists in markup'
);

// AC 1.3: Supported Format Badges
assert(
  htmlContent.includes('✓ .txt (Didukung Lokal)') &&
  htmlContent.includes('✓ .md (Didukung Lokal)') &&
  htmlContent.includes('✓ .html (Didukung Lokal)'),
  'Supported format badges (.txt, .md, .html) displayed honestly'
);
assert(
  htmlContent.includes('⚠️ .pdf / .docx (Gunakan Paste)'),
  'Honest guidance for .pdf / .docx requiring paste displayed in dropzone'
);

// AC 1.4: Entity Linkage Selector
assert(
  htmlContent.includes('id="reqLinkType"') &&
  htmlContent.includes('value="unlinked"') &&
  htmlContent.includes('value="deal"') &&
  htmlContent.includes('value="lead"') &&
  htmlContent.includes('value="customer"'),
  'Entity linkage selector with unlinked, deal, lead, customer exists'
);

// AC 1.5: Action Buttons and Indicators
assert(
  htmlContent.includes('executeHeuristicExtraction()'),
  'Action trigger executeHeuristicExtraction() exists'
);
assert(
  htmlContent.includes('id="reqExtractionConfidence"'),
  'Confidence badge container id="reqExtractionConfidence" exists'
);
assert(
  htmlContent.includes('id="reqExtractionResultArea"'),
  'Result and Studio Editor container id="reqExtractionResultArea" exists'
);
assert(
  htmlContent.includes('id="reqSetTableRows"'),
  'Saved requirement sets table tbody id="reqSetTableRows" exists'
);

// -------------------------------------------------------------
// 2. JAVASCRIPT LOGIC & REPOSITORY EXECUTION
// -------------------------------------------------------------
console.log('\n--- 2. EXECUTION IN MOCK RUNTIME ---');

// Extract script
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>\s*<script src="\.\.\/sidebar\.js">/);
if (!scriptMatch) {
  console.error('[FAIL] Could not extract CRM script block');
  process.exit(1);
}
const crmScript = scriptMatch[1];

// Setup Mock DOM and Storage
const elements = {};
function getOrCreateElem(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      tagName: id.includes('Text') ? 'TEXTAREA' : id.includes('Select') || id.includes('Type') ? 'SELECT' : 'DIV',
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
  location: { hash: '#requirements' },
  addEventListener: () => {}
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
    style: {}
  }),
  addEventListener: () => {}
};
global.confirm = () => true;
global.prompt = (msg, def) => def || 'Test Item';

// Mock DOMParser
global.DOMParser = class MockDOMParser {
  parseFromString(str, mime) {
    return {
      body: {
        textContent: str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      },
      querySelectorAll: selector => {
        if (selector.includes('script') || selector.includes('style')) {
          return [{ remove: () => {} }];
        }
        return [];
      }
    };
  }
};

// Evaluate CRM script
const vm = require('vm');
try {
  vm.runInThisContext(crmScript);
  assert(true, 'crm.html script evaluated successfully without runtime error');
} catch (e) {
  assert(false, `crm.html script evaluation failed: ${e.message}`);
  console.error(e);
  process.exit(1);
}

const db = window.db;
const repo = window.repo;
const {
  handleReqFileUpload,
  clearReqFileInput,
  pasteFromClipboardToReq,
  loadSampleReqPrompt,
  executeHeuristicExtraction,
  resetReqStudioForm,
  updateReqTextCounter,
  onReqLinkTypeChange,
  onReqLinkEntityChange,
  renderReqStudioEditor,
  onReqCandidateProductChange,
  toggleReqModuleSelection,
  addReqAdditionalModule,
  updateReqCandidateFR,
  addReqCandidateFR,
  removeReqCandidateFR,
  addReqUnknownItem,
  removeReqUnknownItem,
  addReqClarificationQuestion,
  removeReqClarificationQuestion,
  openReqCommitPreviewModal,
  confirmAndExecuteReqCommit,
  openReqDetailModal,
  archiveReqSet,
  renderRequirementsPage,
  extractSafeTextFromHtml,
  parseCandidateRequirements,
  detectDomainAndProduct,
  suggestModules,
  analyzeUnknownsAndConflicts,
  logRequirementAutomationRun
} = window;

// -------------------------------------------------------------
// 3. SAFE HTML PARSING & FILE VALIDATION
// -------------------------------------------------------------
console.log('\n--- 3. SAFE HTML PARSING & VALIDATION ---');

const testHtml = '<h1>Kebutuhan Retail</h1><script>alert("hack");</script><p>Aplikasi kasir POS offline</p>';
const safeResult = extractSafeTextFromHtml(testHtml);
assert(!safeResult.includes('<script>'), 'extractSafeTextFromHtml strips HTML tags and script');
assert(safeResult.includes('Kebutuhan Retail') || safeResult.includes('kasir POS'), 'extractSafeTextFromHtml extracts content text');

// AC 3.1: Reject PDF/DOCX binary files
const runsBefore = (db.automationRuns || []).length;
const guidanceElem = getOrCreateElem('reqFileGuidanceStrip');
guidanceElem.classList.add('hidden');

handleReqFileUpload({
  target: {
    files: [{ name: 'spec-proyek.pdf', size: 1024 * 100 }]
  }
});
assert(!guidanceElem.classList.contains('hidden'), 'Guidance warning strip shown when .pdf is uploaded');
assert((db.automationRuns || []).length === runsBefore + 1, 'Automation run logged for .pdf attempt');
assert(db.automationRuns[0].status === 'FAILED', 'Automation run status is FAILED for unsupported binary');

// AC 3.2: Reject Oversized file (> 2MB)
const errorElem = getOrCreateElem('reqFileErrorStrip');
errorElem.classList.add('hidden');

handleReqFileUpload({
  target: {
    files: [{ name: 'dokumen-raksasa.txt', size: 3 * 1024 * 1024 }]
  }
});
assert(!errorElem.classList.contains('hidden'), 'Error strip shown when file > 2MB');
assert(db.automationRuns[0].status === 'FAILED', 'Automation run logged as FAILED for oversized file');

// -------------------------------------------------------------
// 4. PIPELINE CANDIDATE FR & DOMAIN HEURISTICS
// -------------------------------------------------------------
console.log('\n--- 4. CANDIDATE FR & DOMAIN HEURISTICS ---');

const samplePosText = `
Klien: PT Retail Sentosa Makmur
PIC: Ibu Ratna Dewi (VP Operational)
Kebutuhan Sistem:
1. Membutuhkan sistem Point of Sale (POS) cloud modern untuk 15 outlet retail pakaian.
2. Kasir harus mendukung transaksi offline-first saat koneksi internet toko terputus.
3. Sinkronisasi data stok barang dan mutasi antar cabang gudang pusat secara realtime.
4. Integrasi pembayaran QRIS dinamis dan mesin EDC bank BCA / Mandiri.
5. Dashboard analitik laba rugi, omzet harian, dan produk terlaris untuk jajaran direksi.
6. Target implementasi dalam 2 bulan ke depan dengan estimasi budget Rp 35.000.000 - Rp 45.000.000.
`;

// Extract candidate requirements
const candidateFRs = parseCandidateRequirements(samplePosText);
assert(candidateFRs.length >= 4, `Extracted ${candidateFRs.length} candidate requirements`);
assert(candidateFRs[0].id.startsWith('FR-'), 'Candidate FR has FR-xx ID');
assert(candidateFRs[0].sourceExcerpt.includes('Baris'), 'Candidate FR includes line citation excerpt');
assert(['High', 'Medium', 'Low'].includes(candidateFRs[0].confidence), 'Candidate FR uses honest confidence label (High/Medium/Low)');
assert(candidateFRs[0].status === 'Suggested', 'Candidate FR initial status is Suggested');

// Domain detection
const domainPos = detectDomainAndProduct(samplePosText);
assert(domainPos.productId === 'prod-pos', 'Identified POS product for POS text');
assert(domainPos.confidence === 'High', 'Confidence is High for clear domain match');

const erpText = 'Klien membutuhkan sistem ERP manufaktur dengan jurnal otomatis, akuntansi, HRIS payroll karyawan, dan procurement PO.';
const domainErp = detectDomainAndProduct(erpText);
assert(domainErp.productId === 'prod-erp', 'Identified ERP product for ERP text');

const customText = 'Klien membutuhkan aplikasi mobile Flutter untuk tracking logistik kurir dengan live GPS dan portal klien.';
const domainCustom = detectDomainAndProduct(customText);
assert(domainCustom.productId === 'prod-custom', 'Identified Custom app for mobile/tracking text');

// Module suggestion
const mods = suggestModules('prod-pos', ['pos', 'kasir', 'offline', 'qris'], samplePosText);
assert(mods.length >= 3, `Suggested ${mods.length} modules from catalog`);
assert(mods.some(m => m.productId === 'prod-pos'), 'Suggested modules belong to candidate product');

// Unknowns & Clarifications
const gaps = analyzeUnknownsAndConflicts(samplePosText, 'prod-pos', 30, 35000000);
assert(gaps.clarifications.length >= 3, `Generated ${gaps.clarifications.length} clarification questions`);

// -------------------------------------------------------------
// 5. STUDIO WORKFLOW: EXTRACTION, EDITING, PREVIEW & COMMIT
// -------------------------------------------------------------
console.log('\n--- 5. STUDIO WORKFLOW: EXTRACTION, EDITING, PREVIEW & COMMIT ---');

getOrCreateElem('reqFreeTextInput').value = samplePosText;
getOrCreateElem('reqCompanyInput').value = 'PT Retail Sentosa Makmur';
getOrCreateElem('reqPicInput').value = 'Ratna Dewi';
getOrCreateElem('reqLinkType').value = 'unlinked';

// Run extraction
executeHeuristicExtraction();

// Wait for async extraction pipeline to complete
setTimeout(() => {
  const currentReqParsedData = window.currentReqParsedData;
  // Synchronously inspect currentReqParsedData
  assert(currentReqParsedData !== null, 'currentReqParsedData populated after extraction');
  assert(currentReqParsedData.company === 'PT Retail Sentosa Makmur', 'Parsed data company matches');
  assert(currentReqParsedData.status === 'Suggested', 'Requirement Set status is Suggested');
  assert(currentReqParsedData.confidence === 'High', 'Confidence label is High');

  // Test Editing Candidate FR
  const frCountBefore = currentReqParsedData.candidateRequirements.length;
  addReqCandidateFR();
  assert(currentReqParsedData.candidateRequirements.length === frCountBefore + 1, 'addReqCandidateFR adds candidate requirement');

  updateReqCandidateFR(0, 'feature', 'Kasir Offline-First Toko Retail');
  assert(currentReqParsedData.candidateRequirements[0].feature === 'Kasir Offline-First Toko Retail', 'updateReqCandidateFR updates feature inline');

  // Test Module Toggle
  const selModsBefore = currentReqParsedData.selectedModuleIds.length;
  const testModId = currentReqParsedData.selectedModuleIds[0];
  toggleReqModuleSelection(testModId);
  assert(currentReqParsedData.selectedModuleIds.length === selModsBefore - 1, 'toggleReqModuleSelection toggles module off');

  // Test Preview Modal Before Commit
  openReqCommitPreviewModal('saveSet');
  const modalElem = getOrCreateElem('modal');
  assert(modalElem.classList.contains('open'), 'Preview modal opened before commit (Strictly No Auto-Confirm)');
  const modalBody = getOrCreateElem('modalBody').innerHTML;
  assert(
    modalBody.includes('Tidak ada entitas Deal/Lead/Customer baru yang dibuat secara otomatis'),
    'Preview modal alerts user that no entities are automatically created'
  );

  // AC 5.1: Commit Save Requirement Set
  const reqSetsBefore = (db.requirementSets || []).length;
  confirmAndExecuteReqCommit('saveSet');
  const reqSetsAfter = (db.requirementSets || []).length;
  assert(reqSetsAfter === reqSetsBefore + 1, 'Requirement set saved via repository');
  const savedReq = db.requirementSets[0];
  assert(savedReq.status === 'Suggested', 'Saved requirement set has status Suggested');
  assert(savedReq.confidence === 'High', 'Saved requirement set has confidence High');

  // AC 5.2: Commit Generate BRD
  const brdsBefore = (db.brds || []).length;
  confirmAndExecuteReqCommit('generateBrd');
  const brdsAfter = (db.brds || []).length;
  assert(brdsAfter === brdsBefore + 1, 'BRD document generated via repo.create');
  const savedBrd = db.brds[0];
  assert(savedBrd.title.includes('BRD:'), 'Generated BRD title formatted correctly');
  assert(savedBrd.requirementSetId === currentReqParsedData.id, 'BRD linked to requirementSetId');

  // AC 5.3: Commit Generate PRD
  const prdsBefore = (db.prds || []).length;
  confirmAndExecuteReqCommit('generatePrd');
  const prdsAfter = (db.prds || []).length;
  assert(prdsAfter === prdsBefore + 1, 'PRD document generated via repo.create');
  const savedPrd = db.prds[0];
  assert(savedPrd.functionalRequirements && savedPrd.functionalRequirements.length > 0, 'Generated PRD contains functionalRequirements list');

  // AC 5.4: Commit Generate BRD + PRD atomically
  const brdsBeforeDual = db.brds.length;
  const prdsBeforeDual = db.prds.length;
  confirmAndExecuteReqCommit('generateBoth');
  assert(db.brds.length === brdsBeforeDual + 1, 'Dual action generated BRD');
  assert(db.prds.length === prdsBeforeDual + 1, 'Dual action generated PRD');

  // AC 5.5: Automation Runs Recorded
  const successRuns = (db.automationRuns || []).filter(r => r.status === 'SUCCESS');
  assert(successRuns.length >= 3, `Recorded ${successRuns.length} SUCCESS automation runs`);

  // AC 5.6: Table Rendering
  renderRequirementsPage();
  const tableElem = getOrCreateElem('reqSetTableRows');
  assert(tableElem.innerHTML.includes(savedReq.code), 'Saved requirement set code rendered in table');
  assert(tableElem.innerHTML.includes('Suggested'), 'Table displays Suggested status badge');
  assert(tableElem.innerHTML.includes('High'), 'Table displays High confidence label');

  console.log('\n=======================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('=======================================');

  if (failed === 0) {
    console.log('>>> 100% TASK 3 ACCEPTANCE CRITERIA VERIFIED! <<<');
    process.exit(0);
  } else {
    console.error('>>> SOME ACCEPTANCE CRITERIA FAILED! <<<');
    process.exit(1);
  }
}, 350);
