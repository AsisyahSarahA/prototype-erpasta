// test_task8_leads_pipeline_conversion.js
// Automated verification suite for TASK 8: Lead, Prospect, Opportunity dan Conversion

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 8 VERIFICATION SUITE ===\n');

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
      tagName: id.includes('Text') || id.includes('Desc') || id.includes('Notes') || id.includes('Need') ? 'TEXTAREA' : id.includes('Select') || id.includes('Filter') || id.includes('Type') || id.includes('Status') || id.includes('Owner') || id.includes('Industry') || id.includes('Source') || id.includes('Software') || id.includes('Priority') ? 'SELECT' : 'DIV',
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
  location: { hash: '#leads' },
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
  console.error('[FAIL] Runtime execution error in crm.html:', err);
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 1: DOM Elements & Global Exported Functions
// -------------------------------------------------------------
console.log('--- TEST 1: Static Markup & Global Exported Functions ---');
assert(htmlContent.includes('id="page-leads"'), 'Halaman #page-leads tersedia di markup DOM');
assert(htmlContent.includes('id="page-pipeline"'), 'Halaman #page-pipeline tersedia di markup DOM');
assert(htmlContent.includes('id="leadDuplicateWarning"'), 'Container #leadDuplicateWarning tersedia');
assert(typeof window.openLeadModal === 'function', 'openLeadModal fungsi global terdefinisi');
assert(typeof window.openLead === 'function', 'openLead fungsi global terdefinisi');
assert(typeof window.saveLead === 'function', 'saveLead fungsi global terdefinisi');
assert(typeof window.deleteLead === 'function', 'deleteLead fungsi global terdefinisi');
assert(typeof window.setLeadStatus === 'function', 'setLeadStatus fungsi global terdefinisi');
assert(typeof window.openLeadDisqualifyModal === 'function', 'openLeadDisqualifyModal fungsi global terdefinisi');
assert(typeof window.saveLeadDisqualified === 'function', 'saveLeadDisqualified fungsi global terdefinisi');
assert(typeof window.openLeadDetail === 'function', 'openLeadDetail fungsi global terdefinisi');
assert(typeof window.openLeadDetailModal === 'function', 'openLeadDetailModal fungsi global terdefinisi');
assert(typeof window.setLeadDetailTab === 'function', 'setLeadDetailTab fungsi global terdefinisi');
assert(typeof window.checkLeadDuplicates === 'function', 'checkLeadDuplicates fungsi global terdefinisi');
assert(typeof window.checkLeadDuplicatesLive === 'function', 'checkLeadDuplicatesLive fungsi global terdefinisi');
assert(typeof window.confirmConvertLead === 'function', 'confirmConvertLead fungsi global terdefinisi');
assert(typeof window.executeConvertLead === 'function', 'executeConvertLead fungsi global terdefinisi');
assert(typeof window.convertLeadToOpportunity === 'function', 'convertLeadToOpportunity fungsi global terdefinisi');
assert(typeof window.validateStageTransition === 'function', 'validateStageTransition fungsi global terdefinisi');
assert(typeof window.executeStageTransition === 'function', 'executeStageTransition fungsi global terdefinisi');
assert(typeof window.openWonBlockedModal === 'function', 'openWonBlockedModal fungsi global terdefinisi');
assert(typeof window.openLostModal === 'function', 'openLostModal fungsi global terdefinisi');
assert(typeof window.exportLeadsCSV === 'function', 'exportLeadsCSV fungsi global terdefinisi');
assert(typeof window.renderLeadsPage === 'function', 'renderLeadsPage fungsi global terdefinisi');
assert(typeof window.filterLeadsPage === 'function', 'filterLeadsPage fungsi global terdefinisi');
assert(typeof window.renderPipeline === 'function', 'renderPipeline fungsi global terdefinisi');

// -------------------------------------------------------------
// TEST 2: Lead CRUD & Form Specifications
// -------------------------------------------------------------
console.log('\n--- TEST 2: Lead CRUD & Form Specifications ---');
const initialLeadCount = (db.leads || []).length;

// Setup input fields in mock DOM
getOrCreateElem('lType').value = 'Company';
getOrCreateElem('lCompany').value = 'PT Solusi Logistik Mandiri';
getOrCreateElem('lTitle').value = 'Digitalisasi Pergudangan & Armada';
getOrCreateElem('lPic').value = 'Hendra Gunawan';
getOrCreateElem('lJobTitle').value = 'VP of Operations';
getOrCreateElem('lEmail').value = 'hendra@solusilogistik.co.id';
getOrCreateElem('lPhone').value = '0812-9988-7766';
getOrCreateElem('lIndustry').value = 'Logistics & Supply Chain';
getOrCreateElem('lSource').value = 'Website';
getOrCreateElem('lSoftware').value = 'prod-pos';
getOrCreateElem('lBudget').value = '45000000';
getOrCreateElem('lTargetDate').value = '2026-11-15';
getOrCreateElem('lOwner').value = 'Sarah Andini';
getOrCreateElem('lPriority').value = 'High';
getOrCreateElem('lStatus').value = 'New';
getOrCreateElem('lNeed').value = 'Kebutuhan tracking stok real-time antar 5 gudang.';
getOrCreateElem('lNotes').value = 'Klien meminta demo prototype sebelum akhir bulan.';

const createdLead = saveLead(null);
assert(createdLead && createdLead.id, 'Berhasil mencatat lead baru');
assert((db.leads || []).length === initialLeadCount + 1, 'Total lead di database bertambah');
assert(createdLead.company === 'PT Solusi Logistik Mandiri', 'Field company tersimpan dengan benar');
assert(createdLead.pic === 'Hendra Gunawan', 'Field PIC tersimpan dengan benar');
assert(createdLead.email === 'hendra@solusilogistik.co.id', 'Field email tersimpan dengan benar');
assert(createdLead.phone === '0812-9988-7766', 'Field phone tersimpan dengan benar');
assert(createdLead.budget === 45000000, 'Field budget tersimpan dengan benar');
assert(createdLead.status === 'New', 'Status awal lead adalah New');
assert(createdLead.isConverted === false, 'Flag isConverted awal adalah false');

// Update lead
getOrCreateElem('lCompany').value = 'PT Solusi Logistik Mandiri Tbk';
getOrCreateElem('lBudget').value = '50000000';
getOrCreateElem('lStatus').value = 'Contacted';
const updatedLead = saveLead(createdLead.id);
assert(updatedLead.company === 'PT Solusi Logistik Mandiri Tbk', 'Update company berhasil disimpan');
assert(updatedLead.budget === 50000000, 'Update budget berhasil disimpan');
assert(updatedLead.status === 'Contacted', 'Update status lead berhasil disimpan');
assert(Array.isArray(updatedLead.history) && updatedLead.history.length >= 2, 'Riwayat perubahan status tercatat di lead history');

// -------------------------------------------------------------
// TEST 3: Generate Lead Code Unik
// -------------------------------------------------------------
console.log('\n--- TEST 3: Unique Lead Code Generation ---');
assert(typeof createdLead.code === 'string' && createdLead.code.startsWith('LEAD-'), `Format kode lead valid (${createdLead.code})`);
const allCodes = (db.leads || []).map(l => l.code);
const uniqueCodes = new Set(allCodes);
assert(allCodes.length === uniqueCodes.size, `Seluruh (${allCodes.length}) kode lead di database bersifat unik 100%`);

// -------------------------------------------------------------
// TEST 4: Validasi Format Email & Telepon & Field Wajib
// -------------------------------------------------------------
console.log('\n--- TEST 4: Validation Engine (Mandatory, Email, Phone) ---');
// Empty company
getOrCreateElem('lCompany').value = '';
getOrCreateElem('lPic').value = 'Test PIC';
const emptyCompRes = saveLead(null);
assert(emptyCompRes === false, 'Save lead menolak input nama perusahaan kosong');

// Empty PIC
getOrCreateElem('lCompany').value = 'PT Uji Coba';
getOrCreateElem('lPic').value = '';
const emptyPicRes = saveLead(null);
assert(emptyPicRes === false, 'Save lead menolak input nama PIC kosong');

// Invalid Email
getOrCreateElem('lCompany').value = 'PT Uji Coba';
getOrCreateElem('lPic').value = 'Budi';
getOrCreateElem('lEmail').value = 'bukan-email-valid';
getOrCreateElem('lPhone').value = '08123456789';
const invalidEmailRes = saveLead(null);
assert(invalidEmailRes === false, 'Save lead menolak format email yang salah');

// Invalid Phone (< 8 digit)
getOrCreateElem('lEmail').value = 'budi@valid.com';
getOrCreateElem('lPhone').value = '0812';
const invalidPhoneRes = saveLead(null);
assert(invalidPhoneRes === false, 'Save lead menolak nomor telepon kurang dari 8 digit');

// Valid inputs succeed
getOrCreateElem('lPhone').value = '0812-3456-7890';
getOrCreateElem('lStatus').value = 'New';
const validRes = saveLead(null);
assert(validRes && validRes.id, 'Save lead sukses saat format email dan telepon valid');

// -------------------------------------------------------------
// TEST 5: Duplicate Warning Berdasarkan Company, Email, Phone
// -------------------------------------------------------------
console.log('\n--- TEST 5: Duplicate Warning Detection ---');
// Match by exact company
const dupComp = checkLeadDuplicates('PT Solusi Logistik Mandiri Tbk', '', '');
assert(dupComp.length >= 1 && dupComp.some(m => m.id === createdLead.id), 'Mendeteksi duplikasi berdasarkan nama perusahaan');

// Match by email
const dupEmail = checkLeadDuplicates('', 'hendra@solusilogistik.co.id', '');
assert(dupEmail.length >= 1 && dupEmail.some(m => m.id === createdLead.id), 'Mendeteksi duplikasi berdasarkan email kontak');

// Match by phone (last 7 digits)
const dupPhone = checkLeadDuplicates('', '', '0812-9988-7766');
assert(dupPhone.length >= 1 && dupPhone.some(m => m.id === createdLead.id), 'Mendeteksi duplikasi berdasarkan nomor telepon/WA');

// Exclude current ID when editing
const dupExclude = checkLeadDuplicates('PT Solusi Logistik Mandiri Tbk', 'hendra@solusilogistik.co.id', '0812-9988-7766', createdLead.id);
assert(!dupExclude.some(m => m.id === createdLead.id), 'Pemeriksaan duplikasi mengecualikan data lead yang sedang diedit (excludeId)');

// -------------------------------------------------------------
// TEST 6: Status Lifecycle & Disqualified Mandat Alasan
// -------------------------------------------------------------
console.log('\n--- TEST 6: Status Lifecycle & Disqualified Reason Governance ---');
// Change to Qualified
setLeadStatus(createdLead.id, 'Qualified');
assert(createdLead.status === 'Qualified', 'Transisi status ke Qualified berhasil');

// Attempt Disqualified WITHOUT reason via saveLead
getOrCreateElem('lCompany').value = createdLead.company;
getOrCreateElem('lPic').value = createdLead.pic;
getOrCreateElem('lEmail').value = createdLead.email;
getOrCreateElem('lPhone').value = createdLead.phone;
getOrCreateElem('lStatus').value = 'Disqualified';
getOrCreateElem('lDisqualifiedReason').value = '';
const dqNoReason = saveLead(createdLead.id);
assert(dqNoReason === false, 'Save lead MENOLAK status Disqualified jika alasan kosong');

// Save Disqualified WITH reason
getOrCreateElem('lDisqualifiedReason').value = 'Budget Mismatch';
getOrCreateElem('lDisqualifiedNotes').value = 'Alokasi budget klien ditunda ke tahun depan';
const dqWithReason = saveLead(createdLead.id);
assert(dqWithReason && dqWithReason.status === 'Disqualified', 'Status berhasil diubah ke Disqualified dengan alasan');
assert(dqWithReason.disqualifiedReason === 'Budget Mismatch', 'Alasan diskualifikasi tersimpan rapi');
assert(dqWithReason.disqualifiedNotes.includes('ditunda'), 'Catatan diskualifikasi tersimpan');

// Restore to Qualified for subsequent conversion tests
setLeadStatus(createdLead.id, 'Qualified');
assert(createdLead.status === 'Qualified', 'Pemulihan status ke Qualified berhasil');

// -------------------------------------------------------------
// TEST 7: Detail Drawer/Modal 360° (Timeline, Req Set, BRD/PRD, Follow-ups)
// -------------------------------------------------------------
console.log('\n--- TEST 7: Lead Detail 360° Modal (Tabs & Sections) ---');
// Link mock activity, requirement set, brd, prd, and followup
if (!db.activities) db.activities = [];
db.activities.push({
  id: 'act-test-lead-1',
  leadId: createdLead.id,
  company: createdLead.company,
  type: 'Discovery Call',
  title: 'Panggilan Kualifikasi Teknis',
  date: today(),
  status: 'Completed',
  actor: 'Sarah Andini'
});

if (!db.followUps) db.followUps = [];
db.followUps.push({
  id: 'fu-test-lead-1',
  entityId: createdLead.id,
  company: createdLead.company,
  dueDate: today(),
  type: 'Follow-up Penawaran',
  assignee: 'Sarah Andini',
  status: 'Scheduled'
});

openLeadDetailModal(createdLead.id, 'summary');
const bodySummary = elements['modalBody']?.innerHTML || '';
assert(bodySummary.includes(createdLead.company), 'Modal detail menampilkan nama perusahaan');
assert(bodySummary.includes(createdLead.pic), 'Modal detail menampilkan PIC');

setLeadDetailTab('timeline', createdLead.id);
const bodyTimeline = elements['modalBody']?.innerHTML || '';
assert(bodyTimeline.includes('Panggilan Kualifikasi Teknis'), 'Tab timeline memuat aktivitas interaksi sales');

setLeadDetailTab('requirements', createdLead.id);
const bodyReq = elements['modalBody']?.innerHTML || '';
assert(bodyReq.includes('Requirement Studio') || bodyReq.includes('Requirement Set'), 'Tab requirements tersedia');

setLeadDetailTab('documents', createdLead.id);
const bodyDocs = elements['modalBody']?.innerHTML || '';
assert(bodyDocs.includes('Business Requirements Document') && bodyDocs.includes('Product Requirements Document'), 'Tab documents memuat section BRD & PRD');

setLeadDetailTab('followups', createdLead.id);
const bodyFU = elements['modalBody']?.innerHTML || '';
assert(bodyFU.includes('Follow-up Penawaran'), 'Tab follow-ups memuat agenda yang dijadwalkan');

// -------------------------------------------------------------
// TEST 8: Requirement Studio -> Lead Connection & Creation
// -------------------------------------------------------------
console.log('\n--- TEST 8: Requirement Studio -> Lead Linking & Creation ---');
// 8a. Standalone requirement converted to lead
const reqStandalone = {
  id: 'req-test-standalone-1',
  code: 'REQ-2026-0999',
  company: 'PT Logistik Ekspor Nusantara',
  pic: 'Diana Sandra',
  candidateProduct: 'Enterprise ERP Suite',
  productId: 'prod-erp',
  estimatedPrice: 75000000,
  mandays: 40,
  leadId: null,
  dealId: null
};
if (!db.requirementSets) db.requirementSets = [];
db.requirementSets.push(reqStandalone);

const leadFromReq = promptCreateLeadFromReq('req-test-standalone-1');
assert(leadFromReq && leadFromReq.id, 'Berhasil membuat lead baru dari Requirement Set');
assert(leadFromReq.company === 'PT Logistik Ekspor Nusantara', 'Nama perusahaan lead sinkron dengan Requirement Set');
assert(leadFromReq.budget === 75000000, 'Estimasi budget lead sinkron dengan nilai Requirement Set');
assert(leadFromReq.requirementSetId === 'req-test-standalone-1', 'Lead terhubung ke ID Requirement Set');
assert(reqStandalone.leadId === leadFromReq.id, 'Requirement Set timbal balik terhubung ke Lead ID');

// -------------------------------------------------------------
// TEST 9: Single-Time Conversion to Opportunity/Deal
// -------------------------------------------------------------
console.log('\n--- TEST 9: Single-Time Conversion to Opportunity/Deal ---');
// Fresh lead for conversion
getOrCreateElem('lCompany').value = 'PT Citra Sejahtera Abadi';
getOrCreateElem('lPic').value = 'Doni Kusuma';
getOrCreateElem('lEmail').value = 'doni@citrasejahtera.com';
getOrCreateElem('lPhone').value = '0813-8877-6655';
getOrCreateElem('lBudget').value = '65000000';
getOrCreateElem('lStatus').value = 'Qualified';
const leadToConvert = saveLead(null);

assert(leadToConvert && !leadToConvert.isConverted, 'Lead siap untuk konversi resmi');

// First conversion: MUST SUCCEED
const convertedDeal = executeConvertLead(leadToConvert.id);
assert(convertedDeal && convertedDeal.id, 'Konversi pertama berhasil menghasilkan Deal baru');
assert(convertedDeal.leadId === leadToConvert.id, 'Deal terhubung ke leadId asal');
assert(convertedDeal.company === 'PT Citra Sejahtera Abadi', 'Deal menyimpan nama customer/company');
assert(convertedDeal.value === 65000000, 'Deal menyimpan amount / estimasi nilai');
assert(convertedDeal.owner === 'Sarah Andini', 'Deal menyimpan sales owner');
assert(convertedDeal.stage === 2, 'Tahap awal Deal adalah Stage 2 (Qualified / Discovery)');
assert(convertedDeal.probability === 0.35, 'Probabilitas awal Deal adalah 35%');

// State mutation on lead
assert(leadToConvert.isConverted === true, 'Flag isConverted pada lead menjadi true');
assert(leadToConvert.dealId === convertedDeal.id, 'dealId pada lead terisi ID Deal baru');
assert(leadToConvert.status === 'Qualified', 'Status lead berstatus Qualified');

// Second conversion: MUST BE REJECTED
const secondConversionAttempt = executeConvertLead(leadToConvert.id);
assert(secondConversionAttempt === null, 'Percobaan konversi kedua pada lead yang sama DITOLAK (Single-Time Conversion Guardrail)');

// Disqualified lead conversion: MUST BE REJECTED
const disqLead = {
  id: 'lead-disq-test',
  code: 'LEAD-2026-DISQ',
  company: 'PT Prospek Gugur',
  pic: 'Rudi',
  status: 'Disqualified',
  isConverted: false,
  dealId: null
};
db.leads.push(disqLead);
const disqConvertAttempt = executeConvertLead(disqLead.id);
assert(disqConvertAttempt === null, 'Percobaan konversi pada lead Disqualified DITOLAK');

// -------------------------------------------------------------
// TEST 10: Opportunity Schema Completeness
// -------------------------------------------------------------
console.log('\n--- TEST 10: Opportunity Schema Completeness ---');
assert('title' in convertedDeal, 'Opportunity menyimpan title');
assert('leadId' in convertedDeal, 'Opportunity menyimpan leadId');
assert('company' in convertedDeal || 'customer' in convertedDeal, 'Opportunity menyimpan customer/company');
assert('owner' in convertedDeal, 'Opportunity menyimpan owner');
assert('stage' in convertedDeal, 'Opportunity menyimpan stage');
assert('value' in convertedDeal || 'amount' in convertedDeal || 'budget' in convertedDeal, 'Opportunity menyimpan amount estimate');
assert('probability' in convertedDeal, 'Opportunity menyimpan probability');
assert('closeDate' in convertedDeal || 'targetDate' in convertedDeal, 'Opportunity menyimpan close date');
assert('softwareId' in convertedDeal, 'Opportunity menyimpan product/module mapping');
assert('requirementSetId' in convertedDeal, 'Opportunity menyimpan requirement set reference');
assert('brdId' in convertedDeal, 'Opportunity menyimpan BRD reference');
assert('prdId' in convertedDeal, 'Opportunity menyimpan PRD reference');
assert('discovery' in convertedDeal, 'Opportunity menyimpan discovery');
assert('priority' in convertedDeal, 'Opportunity menyimpan priority');
assert(Array.isArray(convertedDeal.stageHistory) && convertedDeal.stageHistory.length >= 1, 'Opportunity menginisialisasi stageHistory audit trail');

// -------------------------------------------------------------
// TEST 11: Pipeline Kanban & Table View & Filter/Search
// -------------------------------------------------------------
console.log('\n--- TEST 11: Pipeline Kanban & Table View & Multi-Filter Search ---');
setView('kanban');
assert(elements['tabBtnKanban']?.classList.contains('active'), 'Tab Kanban aktif');
assert(!elements['pipelineKanban']?.classList.contains('hidden'), 'Board Kanban ditampilkan');

setView('table');
assert(elements['tabBtnTable']?.classList.contains('active'), 'Tab Table aktif');
assert(!elements['pipelineTable']?.classList.contains('hidden'), 'Tabel master peluang ditampilkan');

// Multi-filter testing
updateLeadFilter('search', 'Citra Sejahtera');
renderPipeline();
assert(leadFilter.search === 'Citra Sejahtera', 'Filter pencarian pipeline terpasang');

updateLeadFilter('stage', '2');
renderPipeline();
assert(leadFilter.stage === '2', 'Filter stage terpasang');

updateLeadFilter('source', 'Website');
renderPipeline();
assert(leadFilter.source === 'Website', 'Filter source terpasang');

resetLeadFilters();
assert(leadFilter.search === '' && leadFilter.stage === 'all', 'Reset filter pipeline membersihkan parameter pencarian');

// -------------------------------------------------------------
// TEST 12: Stage Transitions & Audit Trail Logging
// -------------------------------------------------------------
console.log('\n--- TEST 12: Validated Stage Transitions & Audit Trail ---');
const prevDealStage = convertedDeal.stage;
const transitionSuccess = executeStageTransition(convertedDeal.id, 3, 'Penyusunan PRD & Scoping Disetujui', 'Diskusi scoping teknis selesai.');
assert(transitionSuccess === true, 'Transisi dari Stage 2 ke Stage 3 berhasil');
assert(convertedDeal.stage === 3, 'Stage Deal terupdate ke Stage 3 (Scoping & PRD)');
assert(convertedDeal.probability === 0.50, 'Probabilitas Deal naik ke 50%');

const latestHistory = convertedDeal.stageHistory[convertedDeal.stageHistory.length - 1];
assert(latestHistory.fromStageId === prevDealStage, 'Stage history mencatat fromStageId dengan benar');
assert(latestHistory.toStageId === 3, 'Stage history mencatat toStageId dengan benar');
assert(latestHistory.reason.includes('Penyusunan PRD'), 'Stage history mencatat alasan transisi');

// -------------------------------------------------------------
// TEST 13: Stage Lost & Won Strict Guardrails
// -------------------------------------------------------------
console.log('\n--- TEST 13: Stage Lost & Won Strict Governance ---');
// Rule 1: Stage Lost REQUIRES a reason
const lostWithoutReason = executeStageTransition(convertedDeal.id, 9, '');
assert(lostWithoutReason === false, 'Transisi ke Stage 9 (Lost) TANPA alasan DITOLAK secara tegas');

const lostWithReason = executeStageTransition(convertedDeal.id, 9, 'Competitor Price War', 'Klien memilih vendor murah.');
assert(lostWithReason === true, 'Transisi ke Stage 9 (Lost) DENGAN alasan disetujui');
assert(convertedDeal.isLost === true, 'Deal ditandai isLost = true');
assert(convertedDeal.lostReason === 'Competitor Price War', 'Alasan Lost tersimpan di objek Deal');

// Rule 2: Stage Won ALLOWED ONLY IF ACTIVE QUOTATION IS ACCEPTED
// Create a new fresh deal for Won test
const wonTestDeal = {
  id: 'deal-won-test-1',
  code: 'DEAL-WON-TEST',
  company: 'PT Prospek Menang',
  stage: 7, // Negotiation
  probability: 0.85,
  isWon: false,
  isLost: false,
  quotes: [],
  stageHistory: []
};
db.deals.push(wonTestDeal);

// Attempt WON without accepted quote -> MUST BE REJECTED
const wonWithoutQuote = executeStageTransition(wonTestDeal.id, 8);
assert(wonWithoutQuote === false, 'Transisi ke Stage 8 (Won) TANPA Quotation status Accepted DITOLAK secara tegas');

// Now add an Accepted Quotation
if (!db.quotations) db.quotations = [];
db.quotations.push({
  id: 'quo-accepted-test-1',
  dealId: wonTestDeal.id,
  code: 'QUO-2026-TEST',
  status: 'Accepted',
  total: 50000000
});

const wonWithAcceptedQuote = executeStageTransition(wonTestDeal.id, 8);
assert(wonWithAcceptedQuote === true, 'Transisi ke Stage 8 (Won) DISETUJUI saat ada Quotation status Accepted');
assert(wonTestDeal.isWon === true, 'Deal ditandai isWon = true');
assert(wonTestDeal.stage === 8, 'Deal berada pada Stage 8 (Won / Closing)');

// =============================================================
// SUMMARY
// =============================================================
console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('=======================================');

if (failed > 0) {
  console.error(`\n>>> VERIFICATION FAILED WITH ${failed} FAILURES <<<`);
  process.exit(1);
} else {
  console.log('\n>>> 100% TASK 8 ACCEPTANCE CRITERIA VERIFIED! <<<');
}
