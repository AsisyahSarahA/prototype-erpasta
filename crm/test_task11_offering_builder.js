/**
 * Automated Test Suite for TASK 11:
 * Offering Builder, Package Pricing, Maintenance/SLA, Payment Terms
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('====================================================');
console.log('   TASK 11: OFFERING BUILDER & PRICING ENGINE TEST   ');
console.log('====================================================\n');

const crmHtmlPath = path.join(__dirname, 'crm.html');
const htmlContent = fs.readFileSync(crmHtmlPath, 'utf8');

// Extract inline script
const scriptMatches = htmlContent.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
assert(scriptMatches && scriptMatches.length > 0, 'crm.html script tag not found');
const crmScript = scriptMatches[0].replace(/<\/?script[^>]*>/gi, '');

// Setup DOM mock
const elements = {};
function getOrCreateElem(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: '',
      innerHTML: '',
      textContent: '',
      checked: false,
      style: {},
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
  location: { hash: '#quotation' },
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

let confirmResponse = true;
global.confirm = msg => confirmResponse;
global.prompt = (msg, def) => def || 'Test Item';
global.alert = () => {};

try {
  vm.runInThisContext(crmScript);
  console.log('--- RUNTIME INITIALIZED SUCCESSFULLY ---\n');
} catch (err) {
  console.error('[FAIL] Runtime evaluation error:', err);
  process.exit(1);
}

const db = global.window.db || global.db;
if (!db) {
  console.error('[FAIL] Database db not found');
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 1: Global Exported Functions & DOM Elements
// -------------------------------------------------------------
console.log('--- TEST 1: Global Exported Functions & DOM Elements ---');
assert(htmlContent.includes('id="page-quotation"'), 'Halaman #page-quotation tersedia di DOM');
assert(htmlContent.includes('id="qStudioTabBtnOfferings"'), 'Tombol tab Offerings tersedia di DOM');
assert(htmlContent.includes('id="qStudioViewOfferings"'), 'Container view Offerings tersedia di DOM');

assert(typeof window.calculateOfferingTotals === 'function', 'calculateOfferingTotals terdefinisi global');
assert(typeof window.validateOfferingTerms === 'function', 'validateOfferingTerms terdefinisi global');
assert(typeof window.getOfferingScopeMapping === 'function', 'getOfferingScopeMapping terdefinisi global');
assert(typeof window.checkOfferingPrdSync === 'function', 'checkOfferingPrdSync terdefinisi global');
assert(typeof window.openOfferingWizard === 'function', 'openOfferingWizard terdefinisi global');
assert(typeof window.setOfferingWizardStep === 'function', 'setOfferingWizardStep terdefinisi global');
assert(typeof window.toggleOfferingModuleSelection === 'function', 'toggleOfferingModuleSelection terdefinisi global');
assert(typeof window.addOfferingItem === 'function', 'addOfferingItem terdefinisi global');
assert(typeof window.addOfferingCustomItem === 'function', 'addOfferingCustomItem terdefinisi global');
assert(typeof window.addOfferingCustomItemFromFr === 'function', 'addOfferingCustomItemFromFr terdefinisi global');
assert(typeof window.removeOfferingItem === 'function', 'removeOfferingItem terdefinisi global');
assert(typeof window.addOfferingTermRow === 'function', 'addOfferingTermRow terdefinisi global');
assert(typeof window.removeOfferingTermRow === 'function', 'removeOfferingTermRow terdefinisi global');
assert(typeof window.saveOfferingDraft === 'function', 'saveOfferingDraft terdefinisi global');
assert(typeof window.submitOfferingReview === 'function', 'submitOfferingReview terdefinisi global');
assert(typeof window.approveOffering === 'function', 'approveOffering terdefinisi global');
assert(typeof window.rejectOffering === 'function', 'rejectOffering terdefinisi global');
assert(typeof window.duplicateOfferingRevision === 'function', 'duplicateOfferingRevision terdefinisi global');
assert(typeof window.createOfferingSnapshot === 'function', 'createOfferingSnapshot terdefinisi global');
assert(typeof window.convertOfferingToQuotation === 'function', 'convertOfferingToQuotation terdefinisi global');

console.log('[PASS] Test 1: Seluruh interface & exported functions Task 11 terdefinisi.');

// -------------------------------------------------------------
// TEST 2: Multi-step Wizard Navigation & Lifecycle Initialization
// -------------------------------------------------------------
console.log('\n--- TEST 2: Multi-step Wizard Navigation & Lifecycle Initialization ---');
const testDeal = (db.deals || [])[0];
assert(testDeal, 'Deal demo tersedia untuk wizard');

window.openOfferingWizard(testDeal.id, null, 1);
assert(window.currentOfferingDraft, 'currentOfferingDraft berhasil diinisialisasi');
assert.strictEqual(window.currentOfferingDraft.dealId, testDeal.id, 'Deal ID sesuai pada draft');
assert.strictEqual(window.currentOfferingWizardStep, 1, 'Step awal adalah step 1 (Pilih Deal/Customer)');

// Step 1 to 7 navigation
for (let s = 1; s <= 7; s++) {
  window.setOfferingWizardStep(s);
  assert.strictEqual(window.currentOfferingWizardStep, s, `Navigasi step ${s} sukses`);
}
// Boundary check
window.setOfferingWizardStep(10);
assert.strictEqual(window.currentOfferingWizardStep, 7, 'Step dibatasi maksimum 7');
window.setOfferingWizardStep(-5);
assert.strictEqual(window.currentOfferingWizardStep, 1, 'Step dibatasi minimum 1');

console.log('[PASS] Test 2: Wizard navigasi 7 langkah berfungsi dengan pembatasan bounds.');

// -------------------------------------------------------------
// TEST 3: PRD Requirement Mapping & Unmapped Scope Tracking
// -------------------------------------------------------------
console.log('\n--- TEST 3: PRD Requirement Mapping & Unmapped Scope Tracking ---');
const mapping = window.getOfferingScopeMapping(window.currentOfferingDraft);
assert(mapping, 'getOfferingScopeMapping mengembalikan mapping object');
assert(Array.isArray(mapping.mappedRequirements), 'mappedRequirements berupa array');
assert(Array.isArray(mapping.unmappedRequirements), 'unmappedRequirements berupa array');
assert(typeof mapping.totalRequirements === 'number', 'totalRequirements berupa angka');

const initialUnmappedCount = mapping.unmappedRequirements.length;
console.log(`- Total PRD requirements: ${mapping.totalRequirements}, mapped: ${mapping.mappedCount}, unmapped: ${initialUnmappedCount}`);

if (initialUnmappedCount > 0) {
  const targetFr = mapping.unmappedRequirements[0];
  const itemsBefore = (window.getOfferingItems ? window.getOfferingItems() : window.offeringItems).length;
  window.addOfferingCustomItemFromFr(targetFr.id);
  const itemsAfter = (window.getOfferingItems ? window.getOfferingItems() : window.offeringItems).length;
  assert.strictEqual(itemsAfter, itemsBefore + 1, 'Custom item berhasil ditambahkan dari unmapped PRD requirement');
  
  const addedItem = (window.getOfferingItems ? window.getOfferingItems() : window.offeringItems)[itemsAfter - 1];
  assert(addedItem.isCustom === true, 'Item ditandai sebagai isCustom: true');
  assert(addedItem.customReason.includes(targetFr.id), 'customReason memuat referensi ID requirement PRD');
}

console.log('[PASS] Test 3: PRD mapping dan pelacakan unmapped scope berhasil.');

// -------------------------------------------------------------
// TEST 4: Itemized Line Pricing (Mandays vs Fixed & Line Discounts)
// -------------------------------------------------------------
console.log('\n--- TEST 4: Itemized Line Pricing (Mandays vs Fixed & Line Discounts) ---');
const sampleItems = [
  {
    id: 'it-1',
    name: 'Modul Presensi Mandays',
    qty: 2,
    useMandays: true,
    mandays: 10,
    rate: 1000000,
    unitPrice: 0,
    discountType: 'percentage',
    discountValue: 10 // 10%
  },
  {
    id: 'it-2',
    name: 'Modul Lisensi Fixed Price',
    qty: 3,
    useMandays: false,
    mandays: 0,
    rate: 0,
    unitPrice: 5000000,
    discountType: 'fixed',
    discountValue: 1000000 // Diskon Rp 1,000,000
  }
];

const itemizedOffering = {
  pricingMode: 'itemized',
  items: sampleItems,
  applyTax: false,
  maintenance: false
};

const totalsItemized = window.calculateOfferingTotals(itemizedOffering, sampleItems);

// Calculation check:
// Item 1: mandays * rate * qty = 10 * 1,000,000 * 2 = 20,000,000. Disc 10% = 2,000,000. LineTotal = 18,000,000.
// Item 2: unitPrice * qty = 5,000,000 * 3 = 15,000,000. Disc fixed = 1,000,000. LineTotal = 14,000,000.
// Subtotal = 18,000,000 + 14,000,000 = 32,000,000.
assert.strictEqual(sampleItems[0].lineRaw, 20000000, 'Item 1 lineRaw = 20,000,000');
assert.strictEqual(sampleItems[0].discount, 2000000, 'Item 1 discount = 2,000,000');
assert.strictEqual(sampleItems[0].lineTotal, 18000000, 'Item 1 lineTotal = 18,000,000');

assert.strictEqual(sampleItems[1].lineRaw, 15000000, 'Item 2 lineRaw = 15,000,000');
assert.strictEqual(sampleItems[1].discount, 1000000, 'Item 2 discount = 1,000,000');
assert.strictEqual(sampleItems[1].lineTotal, 14000000, 'Item 2 lineTotal = 14,000,000');

assert.strictEqual(totalsItemized.itemsSubtotal, 32000000, 'Total subtotal itemized = 32,000,000');
assert.strictEqual(totalsItemized.totalItemDiscount, 3000000, 'Total item discount = 3,000,000');
assert.strictEqual(totalsItemized.grandTotal, 32000000, 'Grand total tanpa pajak = 32,000,000');

console.log('[PASS] Test 4: Formula mandays (mandays x rate x qty) & fixed price (price x qty) akurat.');

// -------------------------------------------------------------
// TEST 5: Package Pricing Mode & Protection of Package Price
// -------------------------------------------------------------
console.log('\n--- TEST 5: Package Pricing Mode & Protection of Package Price ---');
const packageOffering = {
  pricingMode: 'package',
  packagePrice: 50000000,
  packageDiscount: 5000000,
  items: sampleItems, // Internal scope mandays total is 32M
  applyTax: false,
  maintenance: false
};

const totalsPackage = window.calculateOfferingTotals(packageOffering, sampleItems);

// Crucial: Package mode MUST NOT overwrite final package price with internal mandays/rate
// Grand total = packagePrice (50,000,000) - packageDiscount (5,000,000) = 45,000,000
assert.strictEqual(totalsPackage.grandTotal, 45000000, 'Grand total package mode menghormati harga paket final');
assert.strictEqual(totalsPackage.finalPackagePrice, 45000000, 'finalPackagePrice = 45,000,000');
assert(totalsPackage.internalEstimate !== undefined, 'internalEstimate tersedia terpisah');
assert(totalsPackage.internalEstimate.totalHppCost > 0, 'Internal cost dihitung terpisah untuk presales');

console.log(`- Final package price: Rp ${totalsPackage.finalPackagePrice.toLocaleString('id-ID')}`);
console.log(`- Internal HPP cost: Rp ${totalsPackage.internalEstimate.totalHppCost.toLocaleString('id-ID')}`);
console.log(`- Margin estimate: ${totalsPackage.marginPct}% (Rp ${totalsPackage.marginAmount.toLocaleString('id-ID')})`);
console.log('[PASS] Test 5: Package mode melindungi harga paket final dari overwrite mandays.');

// -------------------------------------------------------------
// TEST 6: Custom Item Scope & Custom Reason Support
// -------------------------------------------------------------
console.log('\n--- TEST 6: Custom Item Scope & Custom Reason Support ---');
const customItem = window.addOfferingCustomItem({
  name: 'Integrasi IoT Weighbridge',
  description: 'Custom bridge serial port RS232 ke ERP',
  customReason: 'Spesifikasi timbangan analog milik pabrik customer',
  qty: 1,
  useMandays: true,
  mandays: 5,
  rate: 1200000,
  unitPrice: 6000000
});

assert(customItem, 'Custom item berhasil dibuat');
assert.strictEqual(customItem.isCustom, true, 'isCustom bernilai true');
assert(customItem.customReason.length > 5, 'customReason tersimpan dengan jelas');
assert.strictEqual(customItem.mandays, 5, 'Mandays custom item tersimpan');
assert.strictEqual(customItem.rate, 1200000, 'Rate custom item tersimpan');

console.log('[PASS] Test 6: Custom item dan alasan custom scope didukung penuh.');

// -------------------------------------------------------------
// TEST 7: Maintenance & SLA Detailed Configuration
// -------------------------------------------------------------
console.log('\n--- TEST 7: Maintenance & SLA Detailed Configuration ---');
const maintOffering = {
  pricingMode: 'package',
  packagePrice: 60000000,
  packageDiscount: 0,
  maintenance: true,
  maintenanceDetails: {
    plan: 'Enterprise 24/7 SLA',
    billingCycle: 'yearly',
    period: '12 Bulan',
    fee: 12000000,
    responseTargets: 'P1 < 1 Jam, P2 < 4 Jam, P3 < 12 Jam',
    supportHours: '24 Jam x 7 Hari Standby',
    serviceWindow: 'Minggu 02:00 - 05:00 WIB',
    includedScope: 'Pemeliharaan server, patch security bulanan, backup harian',
    excludedScope: 'Pengembangan modul baru di luar SPK',
    escalationNotes: 'L1 NOC -> L2 DevOps -> L3 VP of Engineering'
  },
  applyTax: false
};

const totalsMaint = window.calculateOfferingTotals(maintOffering, []);
assert.strictEqual(totalsMaint.maintenanceFee, 12000000, 'Maintenance fee 12,000,000 terhitung');
assert.strictEqual(totalsMaint.grandTotal, 72000000, 'Grand total = 60,000,000 + 12,000,000 = 72,000,000');

console.log('[PASS] Test 7: Maintenance plan, scope, SLA, dan fee terintegrasi.');

// -------------------------------------------------------------
// TEST 8: Strict Payment Terms Validation (100% Pct & Amount Reconcile)
// -------------------------------------------------------------
console.log('\n--- TEST 8: Strict Payment Terms Validation ---');
const grandTotalForTerms = 100000000; // Rp 100,000,000

// Case 8A: Percentage mode invalid (90%)
const invalidTermsPct = [
  { name: 'DP', pct: 30, amount: 0 },
  { name: 'UAT', pct: 40, amount: 0 },
  { name: 'Pelunasan', pct: 20, amount: 0 }
];
const checkPctInvalid = window.validateOfferingTerms(invalidTermsPct, 'percentage', grandTotalForTerms);
assert.strictEqual(checkPctInvalid.isValid, false, 'Persentase total 90% harus invalid');
assert(checkPctInvalid.blockingWarning.includes('90%'), 'Warning memuat informasi total persentase');

// Case 8B: Percentage mode valid (100%)
const validTermsPct = [
  { name: 'DP', pct: 30, amount: 0 },
  { name: 'UAT', pct: 40, amount: 0 },
  { name: 'Pelunasan', pct: 30, amount: 0 }
];
const checkPctValid = window.validateOfferingTerms(validTermsPct, 'percentage', grandTotalForTerms);
assert.strictEqual(checkPctValid.isValid, true, 'Persentase total 100% adalah valid');
assert.strictEqual(checkPctValid.blockingWarning, null, 'Tidak ada blocking warning');

// Case 8C: Amount mode invalid (selisih Rp 10M)
const invalidTermsAmt = [
  { name: 'Termin 1', amount: 50000000 },
  { name: 'Termin 2', amount: 40000000 }
];
const checkAmtInvalid = window.validateOfferingTerms(invalidTermsAmt, 'amount', grandTotalForTerms);
assert.strictEqual(checkAmtInvalid.isValid, false, 'Total amount Rp 90,000,000 != Rp 100,000,000 harus invalid');
assert(checkAmtInvalid.blockingWarning.includes('Rp 10.000.000'), 'Blocking warning menyebutkan selisih amount');

// Case 8D: Amount mode valid (reconciled Rp 100M)
const validTermsAmt = [
  { name: 'Termin 1', amount: 50000000 },
  { name: 'Termin 2', amount: 50000000 }
];
const checkAmtValid = window.validateOfferingTerms(validTermsAmt, 'amount', grandTotalForTerms);
assert.strictEqual(checkAmtValid.isValid, true, 'Total amount sesuai Grand Total adalah valid');

console.log('[PASS] Test 8: Validasi termin 100% dan rekonsiliasi nilai nominal bekerja ketat.');

// -------------------------------------------------------------
// TEST 9: Explicit Optional Tax (PPN 11%) - No Silent Tax
// -------------------------------------------------------------
console.log('\n--- TEST 9: Explicit Optional Tax (PPN 11%) ---');
const noTaxOffering = {
  pricingMode: 'package',
  packagePrice: 100000000,
  packageDiscount: 0,
  applyTax: false
};
const totalsNoTax = window.calculateOfferingTotals(noTaxOffering);
assert.strictEqual(totalsNoTax.tax, 0, 'applyTax: false menghasilkan pajak Rp 0 (no silent tax)');
assert.strictEqual(totalsNoTax.grandTotal, 100000000, 'Grand total tanpa pajak tepat 100,000,000');

const taxOffering = {
  pricingMode: 'package',
  packagePrice: 100000000,
  packageDiscount: 0,
  applyTax: true
};
const totalsWithTax = window.calculateOfferingTotals(taxOffering);
assert.strictEqual(totalsWithTax.tax, 11000000, 'applyTax: true menghasilkan PPN 11% = 11,000,000');
assert.strictEqual(totalsWithTax.grandTotal, 111000000, 'Grand total = 100,000,000 + 11,000,000 = 111,000,000');

console.log('[PASS] Test 9: Pajak eksplisit dan opsional (PPN 11%) tanpa asumsi diam-diam.');

// -------------------------------------------------------------
// TEST 10: Input Sanitization & Non-negative Finite Values
// -------------------------------------------------------------
console.log('\n--- TEST 10: Input Sanitization & Non-negative Finite Values ---');
const dirtyOffering = {
  pricingMode: 'package',
  packagePrice: -50000000,
  packageDiscount: 'invalid_string',
  items: [
    { name: 'Modul A', qty: -5, useMandays: true, mandays: NaN, rate: -1000000 },
    { name: 'Modul B', qty: 0, useMandays: false, unitPrice: -4000000 }
  ],
  applyTax: false
};
const totalsClean = window.calculateOfferingTotals(dirtyOffering);
assert(Number.isFinite(totalsClean.grandTotal), 'Grand total selalu angka finite');
assert(totalsClean.grandTotal >= 0, 'Grand total tidak boleh bernilai negatif');
assert(Number.isFinite(totalsClean.itemsSubtotal), 'Items subtotal selalu finite');

console.log('[PASS] Test 10: Sanitasi angka non-negatif & finite values berhasil.');

// -------------------------------------------------------------
// TEST 11: Workflow Lifecycle: Draft -> Review -> Approve/Reject & Revision
// -------------------------------------------------------------
console.log('\n--- TEST 11: Workflow Lifecycle & Duplicate Revision ---');
const freshOffering = {
  id: 'off-test-workflow',
  offeringNo: 'OFF-ASTA-2026-TEST',
  version: '1.0',
  title: 'Penawaran Uji Coba Lifecycle',
  status: 'Draft',
  dealId: testDeal.id,
  pricingMode: 'package',
  packagePrice: 80000000,
  packageDiscount: 0,
  termsMode: 'percentage',
  terms: [
    { name: 'DP', pct: 50, amount: 40000000 },
    { name: 'Pelunasan', pct: 40, amount: 32000000 } // Total 90% (invalid)
  ]
};

if (!Array.isArray(db.offerings)) db.offerings = [];
db.offerings.push(freshOffering);

// 11A. Submit for review
const submitRes = window.submitOfferingReview(freshOffering.id);
assert.strictEqual(freshOffering.status, 'Under Review', 'Offering beralih ke status "Under Review"');

// 11B. Approve attempt while terms invalid MUST BE BLOCKED
const approveBlocked = window.approveOffering(freshOffering.id);
assert.strictEqual(approveBlocked, false, 'Persetujuan DITOLAK karena termin pembayaran belum 100%');
assert.strictEqual(freshOffering.status, 'Under Review', 'Status tetap Under Review');

// 11C. Fix terms to 100% and approve
freshOffering.terms[1].pct = 50;
const approveSuccess = window.approveOffering(freshOffering.id);
assert.strictEqual(approveSuccess, true, 'Persetujuan BERHASIL setelah termin valid');
assert.strictEqual(freshOffering.status, 'Approved', 'Status menjadi "Approved"');
assert(freshOffering.approvedAt, 'Timestamp approvedAt tercatat');

// 11D. Reject with reason
freshOffering.status = 'Under Review';
const rejectRes = window.rejectOffering(freshOffering.id, 'Budget klien tidak mencukupi, minta diskon');
assert.strictEqual(freshOffering.status, 'Rejected', 'Status menjadi "Rejected"');
assert(freshOffering.rejectionReason.includes('Budget'), 'rejectionReason tercatat');

// 11E. Duplicate revision
const duplicated = window.duplicateOfferingRevision(freshOffering.id);
assert(duplicated, 'Revisi penawaran berhasil diduplikasi');
assert(duplicated.id !== freshOffering.id, 'Duplikasi menghasilkan ID baru');
assert.strictEqual(duplicated.status, 'Draft', 'Revisi baru berstatus "Draft"');
assert(duplicated.version === '1.1' || duplicated.version.includes('.'), 'Versi direvisi (v1.1)');
assert.strictEqual(duplicated.terms.length, freshOffering.terms.length, 'Termin tersalin ke revisi baru');

console.log('[PASS] Test 11: Siklus status penawaran, proteksi persetujuan, dan duplikasi revisi lulus.');

// -------------------------------------------------------------
// TEST 12: Immutable Snapshot Creation
// -------------------------------------------------------------
console.log('\n--- TEST 12: Immutable Snapshot Creation ---');
const snap = window.createOfferingSnapshot(freshOffering);
assert(snap, 'createOfferingSnapshot menghasilkan snapshot');
assert(snap.snapshotId, 'snapshotId tersedia');
assert(snap.capturedAt, 'capturedAt tersedia');
assert(snap.totals, 'totals tercatat di snapshot');
assert.strictEqual(snap.version, freshOffering.version, 'Versi konsisten');

console.log('[PASS] Test 12: Pembuatan snapshot immutable penawaran berhasil.');

// -------------------------------------------------------------
// TEST 13: PRD Sync Impact Warning
// -------------------------------------------------------------
console.log('\n--- TEST 13: PRD Sync Impact Warning ---');
const syncCheck = window.checkOfferingPrdSync(freshOffering);
assert(typeof syncCheck === 'object', 'checkOfferingPrdSync mengembalikan status sync');
assert(typeof syncCheck.hasPrd === 'boolean', 'hasPrd terdeteksi');
console.log(`- PRD Sync Status: hasPrd=${syncCheck.hasPrd}, isOutOfSync=${syncCheck.isOutOfSync}`);

console.log('[PASS] Test 13: Pemeriksaan sinkronisasi PRD & impact warning beroperasi.');

// -------------------------------------------------------------
// TEST 14: Guardrail: Quotation Creation Requires User Confirmation
// -------------------------------------------------------------
// Set status to Approved first
freshOffering.status = 'Approved';
const quotesBefore = (db.quotes || []).length;

// User rejects confirmation
confirmResponse = false;
const canceledConversion = window.convertOfferingToQuotation(freshOffering.id);
assert.strictEqual(canceledConversion, null, 'Konversi dibatalkan jika konfirmasi tidak disetujui');
assert.strictEqual((db.quotes || []).length, quotesBefore, 'Tidak ada quotation yang dibuat otomatis tanpa konfirmasi');

// User accepts confirmation
confirmResponse = true;
const approvedConversion = window.convertOfferingToQuotation(freshOffering.id);
assert(approvedConversion, 'Quotation berhasil dibuat setelah konfirmasi eksplisit disetujui');
assert.strictEqual((db.quotes || []).length, quotesBefore + 1, 'Quotation baru tercatat di database');
assert.strictEqual(approvedConversion.offeringId, freshOffering.id, 'Quotation mereferensikan offeringId asal');

console.log('[PASS] Test 14: Guardrail konfirmasi sebelum pembuatan quotation aktif.');

// -------------------------------------------------------------
// TEST 15: Seed Data Completeness
// -------------------------------------------------------------
console.log('\n--- TEST 15: Seed Data Completeness ---');
assert(Array.isArray(db.offerings) && db.offerings.length >= 3, 'Minimal 3 demo offerings tersedia');
const seedDemo1 = db.offerings.find(o => o.id === 'off-demo-1');
assert(seedDemo1, 'Seed off-demo-1 ditemukan');
assert(seedDemo1.maintenanceDetails, 'off-demo-1 memiliki maintenanceDetails');
assert(Array.isArray(seedDemo1.terms), 'off-demo-1 memiliki payment terms');
assert(Array.isArray(seedDemo1.snapshots), 'off-demo-1 memiliki snapshots');

console.log('[PASS] Test 15: Seed data offerings lengkap dengan seluruh atribut Task 11.');

console.log('\n====================================================');
console.log('   ALL 15 TASK 11 ACCEPTANCE CRITERIA PASSED!       ');
console.log('====================================================');
