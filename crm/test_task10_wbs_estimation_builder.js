// test_task10_wbs_estimation_builder.js
// Automated verification suite for TASK 10: WBS & Presales Estimation Builder Connected to PRD

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 10: WBS & PRESALES ESTIMATION BUILDER VERIFICATION ===\n');

const crmHtmlPath = path.join(__dirname, 'crm.html');
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
      tagName: id.includes('Text') || id.includes('Desc') || id.includes('Section') || id.includes('Notes') ? 'TEXTAREA' : id.includes('Select') || id.includes('Type') || id.includes('Status') ? 'SELECT' : 'DIV',
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
assert(htmlContent.includes('btnBrdPrdTabWbs'), 'Tab button #btnBrdPrdTabWbs ada pada markup HTML');
assert(htmlContent.includes('viewContainerWbs'), 'Container panel #viewContainerWbs ada pada markup HTML');
assert(htmlContent.includes('wbsTableRows'), 'Table body #wbsTableRows ada pada markup HTML');
assert(htmlContent.includes('openWbsBuilderModal'), 'Fungsi openWbsBuilderModal ada di markup HTML');
assert(Array.isArray(WBS_PHASES), 'WBS_PHASES adalah array konstan terdefinisi');
assert(WBS_PHASES.length === 8, 'WBS_PHASES memiliki tepat 8 fase terstandarisasi');
assert(typeof generateWbsFromPrd === 'function', 'generateWbsFromPrd fungsi global terdefinisi');
assert(typeof recalculateWbs === 'function', 'recalculateWbs fungsi global terdefinisi');
assert(typeof checkWbsPrdSync === 'function', 'checkWbsPrdSync fungsi global terdefinisi');
assert(typeof checkAllWbsForPrdChanges === 'function', 'checkAllWbsForPrdChanges fungsi global terdefinisi');
assert(typeof syncWbsWithUpdatedPrd === 'function', 'syncWbsWithUpdatedPrd fungsi global terdefinisi');
assert(typeof addWbsTask === 'function', 'addWbsTask fungsi global terdefinisi');
assert(typeof updateWbsTask === 'function', 'updateWbsTask fungsi global terdefinisi');
assert(typeof removeWbsTask === 'function', 'removeWbsTask fungsi global terdefinisi');
assert(typeof reorderWbsTask === 'function', 'reorderWbsTask fungsi global terdefinisi');
assert(typeof createWbsSnapshot === 'function', 'createWbsSnapshot fungsi global terdefinisi');

// -------------------------------------------------------------
// TEST 2: STANDARDIZED 8 PHASES DEFINITION
// -------------------------------------------------------------
console.log('\n--- TEST 2: Pengelompokan 8 Fase WBS Terstandarisasi ---');
const expectedPhases = [
  'Discovery',
  'Analysis',
  'UX/UI',
  'Development',
  'QA',
  'Deployment',
  'Training/Handover',
  'Maintenance Setup'
];
expectedPhases.forEach(p => {
  assert(WBS_PHASES.includes(p), `Fase standar [${p}] terdaftar dalam WBS_PHASES`);
});

// -------------------------------------------------------------
// TEST 3: DRAFT WBS GENERATION FROM PRD
// -------------------------------------------------------------
console.log('\n--- TEST 3: Generate Draft WBS dari PRD & Modul Terkait ---');
const samplePrd = db.prds && db.prds[0] ? db.prds[0] : null;
assert(samplePrd !== null, 'Tersedia dokumen PRD sampel di database seed');

const generatedWbs = generateWbsFromPrd(samplePrd.id, { title: 'WBS Uji Otomatis Presales' });
assert(generatedWbs && generatedWbs.id, 'generateWbsFromPrd menghasilkan objek WBS valid dengan ID');
assert(generatedWbs.prdId === samplePrd.id, 'WBS tertaut dengan PRD ID yang benar');
assert(Array.isArray(generatedWbs.tasks) && generatedWbs.tasks.length > 0, 'WBS memiliki daftar task hasil generasi');

// Verifikasi pembagian task mencakup fase-fase penting
const generatedPhases = new Set(generatedWbs.tasks.map(t => t.phase));
assert(generatedPhases.has('Discovery'), 'Terdapat task pada fase Discovery');
assert(generatedPhases.has('Analysis'), 'Terdapat task pada fase Analysis');
assert(generatedPhases.has('UX/UI'), 'Terdapat task pada fase UX/UI');
assert(generatedPhases.has('Development'), 'Terdapat task pada fase Development');
assert(generatedPhases.has('QA'), 'Terdapat task pada fase QA');
assert(generatedPhases.has('Deployment'), 'Terdapat task pada fase Deployment');
assert(generatedPhases.has('Training/Handover'), 'Terdapat task pada fase Training/Handover');
assert(generatedPhases.has('Maintenance Setup'), 'Terdapat task pada fase Maintenance Setup');

// -------------------------------------------------------------
// TEST 4: WBS TASK SCHEMA VALIDATION
// -------------------------------------------------------------
console.log('\n--- TEST 4: Validasi Kelengkapan Field Schema Task WBS ---');
const sampleTask = generatedWbs.tasks[0];
assert(sampleTask.id !== undefined, 'Task memiliki field `id`');
assert(sampleTask.phase !== undefined, 'Task memiliki field `phase`');
assert(sampleTask.title !== undefined, 'Task memiliki field `title`');
assert(sampleTask.description !== undefined, 'Task memiliki field `description`');
assert(sampleTask.linkedRequirementId !== undefined, 'Task memiliki field `linkedRequirementId`');
assert(sampleTask.linkedModuleId !== undefined, 'Task memiliki field `linkedModuleId`');
assert(sampleTask.role !== undefined, 'Task memiliki field `role`');
assert(sampleTask.mandays !== undefined && sampleTask.estimatedMandays !== undefined, 'Task memiliki field `mandays` / `estimatedMandays`');
assert(sampleTask.dependency !== undefined, 'Task memiliki field `dependency`');
assert(sampleTask.milestone !== undefined, 'Task memiliki field `milestone`');
assert(sampleTask.status !== undefined, 'Task memiliki field `status`');
assert(sampleTask.confidence !== undefined, 'Task memiliki field `confidence`');
assert(sampleTask.assumption !== undefined, 'Task memiliki field `assumption`');

// -------------------------------------------------------------
// TEST 5: INTERACTIVE CRUD & REORDERING
// -------------------------------------------------------------
console.log('\n--- TEST 5: Operasi CRUD Task, Reordering & Recalculation ---');
const initialTaskCount = generatedWbs.tasks.length;
const initialMandays = generatedWbs.totalMandays;

// 1. Add Task
const addedTask = addWbsTask(generatedWbs.id, {
  phase: 'Development',
  title: 'Pembangunan Modul Khusus Custom Export Excel',
  description: 'Penyusunan format file xlsx kustom dengan formula per divisi.',
  linkedRequirementId: 'FR-01',
  role: 'Senior Backend Developer',
  mandays: 3.5,
  rate: 1250000,
  confidence: 'High'
});
assert(generatedWbs.tasks.length === initialTaskCount + 1, 'Task baru berhasil ditambahkan');
assert(generatedWbs.totalMandays === Math.round((initialMandays + 3.5) * 10) / 10, 'Total mandays terhitung ulang secara otomatis setelah add');

// 2. Update Task
updateWbsTask(generatedWbs.id, addedTask.id, {
  mandays: 5,
  title: 'Pembangunan Modul Khusus Custom Export Excel & PDF'
});
const updated = generatedWbs.tasks.find(t => t.id === addedTask.id);
assert(updated.mandays === 5, 'Mandays task berhasil diperbarui menjadi 5');
assert(updated.title.includes('PDF'), 'Judul task berhasil diperbarui');
assert(generatedWbs.totalMandays === Math.round((initialMandays + 5) * 10) / 10, 'Total mandays terhitung ulang secara otomatis setelah update');

// 3. Reorder Task
const lastIdx = generatedWbs.tasks.length - 1;
const movedTaskId = generatedWbs.tasks[lastIdx].id;
const previousTaskId = generatedWbs.tasks[lastIdx - 1].id;
reorderWbsTask(generatedWbs.id, movedTaskId, 'up');
assert(generatedWbs.tasks[lastIdx - 1].id === movedTaskId, 'Task berhasil dipindahkan naik (reorder up)');
reorderWbsTask(generatedWbs.id, movedTaskId, 'down');
assert(generatedWbs.tasks[lastIdx].id === movedTaskId, 'Task berhasil dipindahkan turun (reorder down)');

// 4. Remove Task
removeWbsTask(generatedWbs.id, addedTask.id);
assert(generatedWbs.tasks.length === initialTaskCount, 'Task berhasil dihapus dari WBS');
assert(generatedWbs.totalMandays === initialMandays, 'Total mandays kembali ke nilai awal setelah remove');

// -------------------------------------------------------------
// TEST 6: ASUMSI, UNKNOWNS, RISIKO & UNESTIMATED TASKS
// -------------------------------------------------------------
console.log('\n--- TEST 6: Asumsi, Unknowns, Risiko & Peringatan Task Belum Diestimasi ---');
assert(Array.isArray(generatedWbs.assumptions), 'WBS memiliki daftar assumptions');
assert(Array.isArray(generatedWbs.unknowns), 'WBS memiliki daftar unknowns');
assert(Array.isArray(generatedWbs.risks), 'WBS memiliki daftar risks');

addWbsAssumption(generatedWbs.id, 'Akses API sandbox tersedia pada sprint ke-1.');
assert(generatedWbs.assumptions.some(a => a.includes('Akses API sandbox')), 'addWbsAssumption berhasil menambahkan asumsi');

addWbsUnknown(generatedWbs.id, 'Beban traffic puncak pengguna pada akhir bulan.');
assert(generatedWbs.unknowns.some(u => u.includes('Beban traffic')), 'addWbsUnknown berhasil menambahkan unknown');

addWbsRisk(generatedWbs.id, 'Keterlambatan verifikasi pihak ketiga vendor payment.');
assert(generatedWbs.risks.some(r => r.includes('Keterlambatan verifikasi')), 'addWbsRisk berhasil menambahkan risiko');

// Unestimated task warning (mandays = 0)
const unestimatedTask = addWbsTask(generatedWbs.id, {
  phase: 'Analysis',
  title: 'Eksplorasi Format Data Baru (Belum Pasti)',
  role: 'Solutions Architect',
  mandays: 0
});
assert(generatedWbs.unestimatedCount > 0, `Peringatan unestimatedCount terdeteksi (${generatedWbs.unestimatedCount} task berbobot 0 MD)`);
removeWbsTask(generatedWbs.id, unestimatedTask.id);
assert(generatedWbs.unestimatedCount === 0, 'unestimatedCount kembali 0 setelah task dibersihkan');

// -------------------------------------------------------------
// TEST 7: MAPPING ROLE KE RATE CARD & BIAYA INTERNAL HPP
// -------------------------------------------------------------
console.log('\n--- TEST 7: Mapping Role ke Rate Card untuk Kalkulasi Internal HPP ---');
assert(generatedWbs.internalCostEstimate > 0, 'Estimasi biaya internal HPP terhitung dari rate card');
assert(typeof generatedWbs.includeInternalCost === 'boolean', 'includeInternalCost toggle tersedia pada WBS');

toggleWbsInternalCost(generatedWbs.id, false);
assert(generatedWbs.includeInternalCost === false, 'toggleWbsInternalCost berhasil mematikan kalkulasi HPP');
toggleWbsInternalCost(generatedWbs.id, true);
assert(generatedWbs.includeInternalCost === true, 'toggleWbsInternalCost berhasil mengaktifkan kembali kalkulasi HPP');

// Validasi nominal biaya internal sesuai rate card SDM
const baTask = generatedWbs.tasks.find(t => t.role === 'Business Analyst');
if (baTask) {
  const rc = (db.rateCards || []).find(r => r.role === 'Business Analyst');
  if (rc) {
    assert(baTask.rate === rc.rate, `Rate role [Business Analyst] terpetakan sesuai rate card (${baTask.rate} IDR/MD)`);
  }
}

// -------------------------------------------------------------
// TEST 8: SCENARIO ESTIMATION LOW / EXPECTED / HIGH
// -------------------------------------------------------------
console.log('\n--- TEST 8: Skenario Estimasi Low / Expected / High & Formula Transparan ---');
const totalMd = generatedWbs.totalMandays;
const expectedLow = Math.round((totalMd * 0.85) * 10) / 10;
const expectedHigh = Math.round((totalMd * 1.30) * 10) / 10;

assert(generatedWbs.scenarios.expected === totalMd, `Skenario Expected (${generatedWbs.scenarios.expected} MD) sama dengan totalMandays (${totalMd} MD)`);
assert(generatedWbs.scenarios.low === expectedLow, `Skenario Low (${generatedWbs.scenarios.low} MD) sesuai formula 85% (${expectedLow} MD)`);
assert(generatedWbs.scenarios.high === expectedHigh, `Skenario High (${generatedWbs.scenarios.high} MD) sesuai formula 130% (${expectedHigh} MD)`);
assert(typeof generatedWbs.scenarios.formula === 'string' && generatedWbs.scenarios.formula.includes('0.85') && generatedWbs.scenarios.formula.includes('1.30'), 'Formula skenario terdokumentasi transparan');

// -------------------------------------------------------------
// TEST 9: GUARDRAIL PRESALES — TIDAK MENJADIKAN WBS HARGA FINAL
// -------------------------------------------------------------
console.log('\n--- TEST 9: Guardrail Presales & Non-Commitment Contract ---');
assert(generatedWbs.isFinalCommitment === false, 'WBS tidak otomatis menjadi komitmen kontrak final (isFinalCommitment === false)');
assert(generatedWbs.pricingMode === 'Presales Internal Estimate', 'Pricing mode default adalah Presales Internal Estimate');
assert(htmlContent.includes('Pedoman Presales Estimasi') || htmlContent.includes('Pedoman WBS Prototype'), 'Disclaimer guardrail presales ditampilkan pada UI markup');

// -------------------------------------------------------------
// TEST 10: PRD CHANGE DETECTION, WARNING & RE-SYNC
// -------------------------------------------------------------
console.log('\n--- TEST 10: Deteksi Perubahan PRD, Warning Needs Review & Re-Sync ---');
// WBS saat ini dalam kondisi In Sync
const initialSync = checkWbsPrdSync(generatedWbs.id);
assert(initialSync.inSync === true, 'Kondisi awal WBS tersinkronisasi (In Sync)');

// Tambahkan requirement baru pada PRD sumber
const newlyAddedFr = addPrdFunctionalRequirement(samplePrd.id, {
  title: 'Integrasi AI Recommendation Engine',
  description: 'Rekomendasi otomatis berbasis AI untuk analitik keranjang belanja.',
  priority: 'Must-Have'
});

// Jalankan pemeriksaan sinkronisasi
const syncAfterChange = checkWbsPrdSync(generatedWbs.id);
assert(syncAfterChange.inSync === false, 'Perubahan PRD berhasil terdeteksi (inSync === false)');
assert(generatedWbs.syncStatus === 'Needs Review', 'Status sinkronisasi WBS berubah menjadi Needs Review');
assert(generatedWbs.status === 'Needs Review', 'Status dokumen WBS berubah menjadi Needs Review');
assert(Array.isArray(generatedWbs.impactedRequirements) && generatedWbs.impactedRequirements.length > 0, 'Daftar kebutuhan terdampak (impactedRequirements) terisi');
assert(generatedWbs.impactedRequirements.some(i => i.id === newlyAddedFr.id), 'Requirement baru tercatat dalam daftar kebutuhan terdampak');

// Eksekusi rekonsiliasi / sinkronisasi ulang
syncWbsWithUpdatedPrd(generatedWbs.id);
assert(generatedWbs.syncStatus === 'In Sync', 'Status sinkronisasi kembali In Sync setelah syncWbsWithUpdatedPrd');
assert(generatedWbs.tasks.some(t => t.linkedRequirementId === newlyAddedFr.id), 'Task baru untuk requirement PRD otomatis ditambahkan ke WBS');

// Bersihkan FR uji coba
removePrdFunctionalRequirement(samplePrd.id, newlyAddedFr.id);
syncWbsWithUpdatedPrd(generatedWbs.id);

// -------------------------------------------------------------
// TEST 11: WBS SNAPSHOT UNTUK OFFERING / QUOTATION
// -------------------------------------------------------------
console.log('\n--- TEST 11: Pembuatan Snapshot WBS Terkunci untuk Offering ---');
const snapshot = createWbsSnapshot(generatedWbs.id, 'Offering-2026-001', 'off-demo-123');
assert(snapshot && snapshot.snapshotId, 'createWbsSnapshot menghasilkan objek snapshot dengan snapshotId');
assert(snapshot.isLocked === true, 'Snapshot berstatus terkunci immutable (isLocked === true)');
assert(snapshot.totalMandays === generatedWbs.totalMandays, 'Snapshot merekam total mandays saat dibuat');
assert(snapshot.linkedEntityType === 'Offering-2026-001', 'Snapshot mencatat entitas komersial tujuan');
assert(Array.isArray(generatedWbs.snapshots) && generatedWbs.snapshots.length > 0, 'Snapshot tersimpan dalam riwayat snapshots WBS');

// -------------------------------------------------------------
// TEST 12: UI INTEGRATION & TAB VIEW RENDERING
// -------------------------------------------------------------
console.log('\n--- TEST 12: UI Integration & Tab View Rendering ---');
setBrdPrdView('wbs');
assert(getOrCreateElem('btnBrdPrdTabWbs').classList.contains('active'), 'Tab button #btnBrdPrdTabWbs aktif');
assert(!getOrCreateElem('viewContainerWbs').classList.contains('hidden'), 'Container #viewContainerWbs tampil (tidak hidden)');
renderWbsTable();
assert(getOrCreateElem('wbsTableRows').innerHTML.includes('WBS'), 'Tabel WBS ter-render dengan konten baris WBS');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n====================================================');
console.log(`TASK 10 VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
