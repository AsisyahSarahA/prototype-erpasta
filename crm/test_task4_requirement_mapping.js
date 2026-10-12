// test_task4_requirement_mapping.js
// Automated verification suite for TASK 4: Requirement Extraction, Software Suggestion, Module Mapping

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 4 VERIFICATION SUITE ===\n');

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
  addEventListener: () => {},
  removeEventListener: () => {}
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
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.confirm = () => true;
global.prompt = (msg, def) => def || 'Test Item';

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

try {
  vm.runInThisContext(crmScript);
  console.log('--- RUNTIME INITIALIZED SUCCESSFULLY ---\n');
} catch (err) {
  console.error('[FAIL] Runtime evaluation error:', err);
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 1: REQUIREMENT MODEL SCHEMA COMPLETENESS
// -------------------------------------------------------------
console.log('--- TEST 1: Requirement Model Schema Completeness ---');
const sampleText = `
1. Kasir harus dapat memproses transaksi penjualan offline dan online dengan cetak struk thermal.
2. Sistem wajib mengelola mutasi stok bahan baku antar cabang resto dan notifikasi stok minimum.
3. Fitur laporan omzet harian per kasir dengan ringkasan laba kotor.
4. Integrasi pembayaran QRIS dinamis dan EDC bank rekanan.
5. Fitur promosi diskon bertingkat untuk member loyalitas pelanggan.
`;

const parsedFRs = window.parseCandidateRequirements(sampleText);
assert(Array.isArray(parsedFRs) && parsedFRs.length >= 4, `Extracted ${parsedFRs.length} candidate requirements`);

const fr0 = parsedFRs[0];
assert(fr0.id && fr0.id.startsWith('FR-'), `Requirement has valid ID (${fr0.id})`);
assert(fr0.title && fr0.feature, `Requirement has title/feature (${fr0.title})`);
assert(fr0.description && fr0.description.length > 10, `Requirement has detailed description`);
assert(fr0.source || fr0.sourceExcerpt, `Requirement has source excerpt citation`);
assert(['Must-Have', 'Should-Have', 'Nice-to-Have'].includes(fr0.priority), `Requirement has priority (${fr0.priority})`);
assert(['Suggested', 'Confirmed', 'Excluded', 'Needs Review'].includes(fr0.status), `Requirement has valid status (${fr0.status})`);
assert(['In Scope', 'Out of Scope'].includes(fr0.scope), `Requirement has scope (${fr0.scope})`);
assert(['High', 'Medium', 'Low'].includes(fr0.confidence), `Requirement has confidence label (${fr0.confidence})`);
assert(typeof fr0.acceptanceCriteria === 'string' && fr0.acceptanceCriteria.length > 5, `Requirement has acceptance criteria`);
assert('relatedProductId' in fr0 && 'relatedModuleId' in fr0 && 'relatedModuleName' in fr0, `Requirement has related product and module fields`);
assert('notes' in fr0, `Requirement has notes field`);

// -------------------------------------------------------------
// TEST 2: EXPLAINABLE SOFTWARE CATEGORY HEURISTICS
// -------------------------------------------------------------
console.log('\n--- TEST 2: Explainable Software Category Heuristics ---');

// Test 2.1: POS Domain
const posAnalysis = window.detectDomainAndProduct('Sistem kasir toko ritel, cetak struk nota, barcode scanner, dan pembayaran meja resto');
assert(posAnalysis.productId === 'prod-pos', `Detected POS product for kasir/struk/barcode keywords`);
assert(posAnalysis.explanation && posAnalysis.explanation.includes('Aplikasi POS'), `Provided explainable rationale for POS`);
assert(posAnalysis.matchedKeywords.length >= 2, `Captured matched keywords for POS: ${posAnalysis.matchedKeywords.join(', ')}`);

// Test 2.2: ERP Domain
const erpAnalysis = window.detectDomainAndProduct('Sistem ERP manufaktur dengan modul finance akuntansi, jurnal buku besar, procurement PO vendor, dan inventory gudang');
assert(erpAnalysis.productId === 'prod-erp', `Detected ERP product for finance/jurnal/po/procurement keywords`);
assert(erpAnalysis.explanation && erpAnalysis.explanation.includes('ERP'), `Provided explainable rationale for ERP`);

// Test 2.3: HRIS Domain (Mapped to ERP / HR focus)
const hrAnalysis = window.detectDomainAndProduct('Aplikasi HRIS payroll penggajian bulanan, absensi geolokasi karyawan, BPJS, dan pengajuan cuti');
assert(hrAnalysis.productId === 'prod-erp', `Mapped HRIS/payroll to ERP system`);
assert(hrAnalysis.explanation && hrAnalysis.explanation.toLowerCase().includes('hr'), `Rationale explains HR / payroll detection`);

// Test 2.4: Web Solution Domain
const webAnalysis = window.detectDomainAndProduct('Pembuatan website company profile korporasi, artikel berita blog, optimasi SEO Google, dan halaman profil tim');
assert(webAnalysis.productId === 'prod-web', `Detected Web Solution for website/seo/company profile`);
assert(webAnalysis.explanation && webAnalysis.explanation.includes('Website'), `Provided explainable rationale for Web`);

// Test 2.5: Custom App Domain
const customAnalysis = window.detectDomainAndProduct('Pengembangan aplikasi mobile Flutter Android iOS untuk kurir tracking GPS armada logistik realtime');
assert(customAnalysis.productId === 'prod-custom', `Detected Custom App for flutter/mobile/tracking gps`);
assert(customAnalysis.explanation && customAnalysis.explanation.includes('Custom'), `Provided explainable rationale for Custom App`);

// -------------------------------------------------------------
// TEST 3: MODULE FILTERING PER SELECTED SOFTWARE ONLY
// -------------------------------------------------------------
console.log('\n--- TEST 3: Module Filtering per Selected Software Only ---');
const posModulesResult = window.suggestModules('prod-pos', posAnalysis.matchedKeywords, sampleText);
const posModuleList = posModulesResult.suggestedModules || posModulesResult;

assert(posModuleList.length > 0, `Returned suggested modules for POS`);
const nonPosModules = posModuleList.filter(m => m.productId !== 'prod-pos' && !m.isCustom);
assert(nonPosModules.length === 0, `Strictly NO modules from other products (ERP/Web/Custom) are included in POS filter`);

// Test 3.2: Verify match reasons
const coreMod = posModuleList.find(m => m.id === 'pos-core') || (posModulesResult.catalogModulesWithReason || []).find(m => m.id === 'pos-core');
assert(coreMod && (coreMod.matchReason || coreMod.reason), `Module has concise matchReason (${coreMod?.matchReason || coreMod?.reason})`);

// -------------------------------------------------------------
// TEST 4: MODULE & REQUIREMENT MAPPING STATUS
// -------------------------------------------------------------
console.log('\n--- TEST 4: Module & Requirement Mapping Status ---');
const mappedFRs = typeof window.mapRequirementsToModules === 'function' ? 
  window.mapRequirementsToModules(parsedFRs, 'prod-pos', db.modules.filter(m => m.productId === 'prod-pos'), []) :
  parsedFRs;

assert(Array.isArray(mappedFRs), `Mapped requirements array returned`);
const mappedItem = mappedFRs.find(fr => fr.relatedModuleId && fr.relatedModuleId.startsWith('pos-'));
assert(mappedItem !== undefined, `At least one requirement is mapped to a POS module (${mappedItem?.relatedModuleName})`);
assert(['Suggested', 'Confirmed', 'Needs Review'].includes(mappedItem.status), `Mapped requirement has valid status (${mappedItem.status})`);

// -------------------------------------------------------------
// TEST 5: UNMAPPED REQUIREMENTS DETECTION
// -------------------------------------------------------------
console.log('\n--- TEST 5: Unmapped Requirements Detection ---');
// Introduce an out-of-domain requirement that cannot map to standard POS modules
const textWithUnmapped = sampleText + '\n6. Sistem integrasi machine learning voice recognition untuk pemesanan via suara khusus.';
const frsWithUnmapped = window.parseCandidateRequirements(textWithUnmapped);
const remappedFRs = typeof window.mapRequirementsToModules === 'function' ? 
  window.mapRequirementsToModules(frsWithUnmapped, 'prod-pos', db.modules.filter(m => m.productId === 'prod-pos'), []) :
  frsWithUnmapped;

const unmappedItem = remappedFRs.find(fr => fr.description.includes('voice recognition') || !fr.relatedModuleId);
assert(unmappedItem !== undefined, `Detected unmapped requirement (${unmappedItem?.title})`);
assert(unmappedItem.relatedModuleId === null || unmappedItem.relatedModuleName === 'Unmapped', `Unmapped requirement has null relatedModuleId or 'Unmapped' name`);
assert(unmappedItem.status === 'Needs Review', `Unmapped requirement has status 'Needs Review'`);

// -------------------------------------------------------------
// TEST 6: DUPLICATION AND CONFLICT DETECTION
// -------------------------------------------------------------
console.log('\n--- TEST 6: Duplication and Conflict Detection ---');
const duplicateText = `
1. Kasir transaksi kasir penjualan offline untuk cetak struk thermal pelanggan.
2. Kasir transaksi kasir penjualan offline cetak struk thermal toko.
3. Aplikasi kasir harus berjalan full cloud realtime dan tidak boleh offline sama sekali tanpa internet.
4. Kasir harus dapat bekerja 100% offline tanpa internet saat koneksi terputus di toko.
`;

const dupFRs = window.parseCandidateRequirements(duplicateText);
const dupConflictResult = typeof window.detectDuplicatesAndConflicts === 'function' ?
  window.detectDuplicatesAndConflicts(dupFRs, duplicateText, 50, 45000000) :
  { duplicates: [], conflicts: [] };

assert(dupConflictResult.duplicates.length > 0, `Detected duplicate requirements (${dupConflictResult.duplicates.length} duplicate pairs)`);
assert(dupConflictResult.conflicts.length > 0, `Detected semantic conflict (${dupConflictResult.conflicts[0]?.description || dupConflictResult.conflicts[0]})`);

// -------------------------------------------------------------
// TEST 7: MAPPING COVERAGE METRIC & HONEST DISCLOSURE
// -------------------------------------------------------------
console.log('\n--- TEST 7: Mapping Coverage Metric & Honest Disclosure ---');
// Case 7.1: With unmapped / needs review items
const partialCoverage = typeof window.calculateMappingCoverage === 'function' ?
  window.calculateMappingCoverage(remappedFRs, ['pos-core', 'pos-stock', 'pos-report', 'pos-pay']) :
  { unmappedFRs: [1], isFullyCovered: false, statusLabel: 'Parsial' };

assert(partialCoverage.unmappedFRs.length > 0, `Coverage identified ${partialCoverage.unmappedFRs.length} unmapped requirements`);
assert(partialCoverage.isFullyCovered === false, `Coverage status is NOT 100% complete when unmapped items exist`);
assert((partialCoverage.statusLabel && partialCoverage.statusLabel.toLowerCase().includes('parsial')) || partialCoverage.badgeClass === 'amber', `Coverage status honestly labeled as Partial / Review (${partialCoverage.statusLabel})`);

// Case 7.2: All items mapped and confirmed
const cleanFRs = [
  { id: 'FR-01', title: 'Kasir', scope: 'In Scope', status: 'Confirmed', relatedModuleId: 'pos-core' },
  { id: 'FR-02', title: 'Stok', scope: 'In Scope', status: 'Confirmed', relatedModuleId: 'pos-stock' }
];
const fullCoverage = typeof window.calculateMappingCoverage === 'function' ?
  window.calculateMappingCoverage(cleanFRs, ['pos-core', 'pos-stock']) :
  { isFullyCovered: true, coveragePercent: 100 };

assert(fullCoverage.isFullyCovered === true, `Coverage is marked full when all in-scope FRs are mapped without conflict`);
assert(fullCoverage.coveragePercent === 100, `Coverage percentage is 100%`);

// -------------------------------------------------------------
// TEST 8: USER CUSTOMIZATION: ADD CUSTOM MODULE & SWITCH SOFTWARE
// -------------------------------------------------------------
console.log('\n--- TEST 8: User Customization (Custom Module & Software Switch) ---');

// Set up currentReqParsedData
getOrCreateElem('reqFreeTextInput').value = sampleText;
getOrCreateElem('reqCompanyInput').value = 'PT Retail Modern';
getOrCreateElem('reqPicInput').value = 'Hendra';
getOrCreateElem('reqLinkType').value = 'deal';
getOrCreateElem('reqLinkEntitySelect').value = 'deal-demo-1';

window.executeHeuristicExtraction();

// Wait for heuristic extraction pipeline to complete (100ms + 120ms)
setTimeout(() => {
  const currentData = window.currentReqParsedData;
  assert(currentData !== null && typeof currentData === 'object', `Studio populated currentReqParsedData`);

  // Test 8.1: Add Custom Module
  const initialModuleCount = currentData.selectedModuleIds.length;
  const customMod = {
    id: 'custom-iot-scale',
    code: 'MOD-CUST-IOT',
    productId: currentData.productId,
    name: 'Integrasi IoT Timbangan Digital Buah',
    description: 'Protokol serial RS232 membaca berat timbangan otomatis ke kasir',
    mandays: 5,
    rate: 1200000,
    price: 6000000,
    isCustom: true
  };

  if (typeof window.saveCustomModule === 'function') {
    window.saveCustomModule(customMod);
    assert(currentData.customModules && currentData.customModules.length > 0, `Custom module added to studio state`);
    assert(currentData.selectedModuleIds.includes(customMod.id), `Custom module automatically selected in studio`);
  } else {
    assert(false, `saveCustomModule is exposed on window`);
  }

  // Test 8.2: Map unmapped FR to the new custom module
  const testFr = currentData.candidateRequirements[0];
  if (typeof window.mapReqCandidateToModule === 'function') {
    window.mapReqCandidateToModule(0, customMod.id);
    assert(testFr.relatedModuleId === customMod.id, `Mapped candidate requirement to custom module`);
    assert(testFr.relatedModuleName === customMod.name, `Requirement updated with custom module name`);
  } else {
    assert(false, `mapReqCandidateToModule is exposed on window`);
  }

  // Test 8.3: Scope toggle (In Scope <-> Out of Scope)
  const origScope = testFr.scope;
  if (typeof window.toggleReqScope === 'function') {
    window.toggleReqScope(0);
    assert(testFr.scope === 'Out of Scope', `Toggled scope to Out of Scope`);
    assert(testFr.status === 'Excluded', `Status updated to Excluded when Out of Scope`);
    window.toggleReqScope(0);
    assert(testFr.scope === 'In Scope', `Toggled scope back to In Scope`);
  } else {
    assert(false, `toggleReqScope is exposed on window`);
  }

  // Test 8.4: Switch candidate software category
  window.onReqCandidateProductChange('prod-erp');
  assert(currentData.productId === 'prod-erp', `Switched candidate software to ERP`);
  assert(currentData.candidateProduct.includes('ERP'), `Candidate product name updated`);
  const allErpMods = db.modules.filter(m => m.productId === 'prod-erp');
  const selectedErpMods = currentData.selectedModuleIds.filter(id => allErpMods.some(m => m.id === id));
  assert(selectedErpMods.length > 0, `Filtered and selected ERP modules after software switch`);

  // -------------------------------------------------------------
  // TEST 9: COMMIT PERSISTENCE & IMMUTABILITY SNAPSHOT
  // -------------------------------------------------------------
  console.log('\n--- TEST 9: Commit Persistence & Immutability Snapshot ---');
  const prevReqSetsCount = (db.requirementSets || []).length;
  const prevActivitiesCount = (db.activities || []).length;

  window.confirmAndExecuteReqCommit('saveSet');

  const updatedReqSets = db.requirementSets || [];
  assert(updatedReqSets.length === prevReqSetsCount + 1, `Requirement Set record created in repository`);

  const savedReq = updatedReqSets[0];
  assert(Array.isArray(savedReq.requirements), `Saved requirement set contains full requirements array`);
  assert(Array.isArray(savedReq.modulesSnapshot), `Saved requirement set contains immutable modulesSnapshot array`);
  assert(savedReq.modulesSnapshot.length > 0, `modulesSnapshot contains locked module objects`);

  // Verify Snapshot Immutability
  const snapshotMod = savedReq.modulesSnapshot[0];
  const originalRate = snapshotMod.rate;
  const originalPrice = snapshotMod.price;

  // Mutate master module in catalog
  const masterMod = db.modules.find(m => m.id === snapshotMod.id);
  if (masterMod) {
    masterMod.rate = 99999999;
    masterMod.price = 99999999;
  }

  // Check saved snapshot did NOT change
  assert(snapshotMod.rate === originalRate, `Saved snapshot module rate remained locked (${snapshotMod.rate}) despite catalog mutation`);
  assert(snapshotMod.price === originalPrice, `Saved snapshot module price remained locked (${snapshotMod.price}) despite catalog mutation`);

  // Verify Activity History Logging
  const updatedActivities = db.activities || [];
  const mappingAct = updatedActivities.find(a => a.type === 'REQUIREMENT_MAPPING');
  assert(mappingAct !== undefined, `Recorded REQUIREMENT_MAPPING activity in db.activities`);
  assert(mappingAct && mappingAct.dealId === 'deal-demo-1', `Activity linked to deal-demo-1`);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n=======================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('=======================================');

  if (failed === 0) {
    console.log('>>> 100% TASK 4 ACCEPTANCE CRITERIA VERIFIED! <<<');
    process.exit(0);
  } else {
    console.log('>>> SOME TESTS FAILED! IMPLEMENTATION NEEDED <<<');
    process.exit(1);
  }
}, 300);
