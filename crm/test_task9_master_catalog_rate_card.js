// test_task9_master_catalog_rate_card.js
// Automated verification suite for TASK 9: Master Software, Module, Rate Card

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== RUNNING TASK 9 VERIFICATION SUITE ===\n');

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
      checked: false,
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
  location: { hash: '#master' },
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
    checked: false,
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

const db = global.window.db || global.db;
if (!db) {
  console.error('[FAIL] Database db not found');
  process.exit(1);
}

// -------------------------------------------------------------
// TEST 1: DOM Elements & Global Exported Functions
// -------------------------------------------------------------
console.log('--- TEST 1: Static Markup & Global Exported Functions ---');
assert(htmlContent.includes('id="page-master"'), 'Halaman #page-master tersedia di markup DOM');
assert(htmlContent.includes('id="page-rate-card"'), 'Halaman #page-rate-card tersedia di markup DOM');
assert(htmlContent.includes('id="masterModuleRows"'), 'Tabel modul #masterModuleRows tersedia di markup DOM');
assert(htmlContent.includes('id="masterRateRows"'), 'Tabel rate card #masterRateRows tersedia di markup DOM');
assert(htmlContent.includes('id="rateCardPageRows"'), 'Tabel rate card #rateCardPageRows tersedia di markup DOM');

assert(typeof window.filterModulesByProduct === 'function', 'filterModulesByProduct terdefinisi global');
assert(typeof window.openProductModal === 'function', 'openProductModal terdefinisi global');
assert(typeof window.saveProduct === 'function', 'saveProduct terdefinisi global');
assert(typeof window.toggleProductStatus === 'function', 'toggleProductStatus terdefinisi global');
assert(typeof window.safeDeleteProduct === 'function', 'safeDeleteProduct terdefinisi global');
assert(typeof window.deleteProduct === 'function', 'deleteProduct terdefinisi global');

assert(typeof window.openModuleModal === 'function', 'openModuleModal terdefinisi global');
assert(typeof window.saveModule === 'function', 'saveModule terdefinisi global');
assert(typeof window.toggleModuleStatus === 'function', 'toggleModuleStatus terdefinisi global');
assert(typeof window.safeDeleteModule === 'function', 'safeDeleteModule terdefinisi global');
assert(typeof window.deleteModule === 'function', 'deleteModule terdefinisi global');

assert(typeof window.openRateCardModal === 'function', 'openRateCardModal terdefinisi global');
assert(typeof window.saveRateCard === 'function', 'saveRateCard terdefinisi global');
assert(typeof window.toggleRateCardStatus === 'function', 'toggleRateCardStatus terdefinisi global');
assert(typeof window.safeDeleteRateCard === 'function', 'safeDeleteRateCard terdefinisi global');
assert(typeof window.deleteRateCard === 'function', 'deleteRateCard terdefinisi global');

assert(typeof window.renderMaster === 'function', 'renderMaster terdefinisi global');
assert(typeof window.renderRateCardPage === 'function', 'renderRateCardPage terdefinisi global');
assert(typeof window.toggleOfferingModuleSelection === 'function', 'toggleOfferingModuleSelection terdefinisi global');

// -------------------------------------------------------------
// TEST 2: Seed Data Validation (Products & Modules)
// -------------------------------------------------------------
console.log('\n--- TEST 2: Seed Data Validation (Products & Modules) ---');
const posProduct = db.products.find(p => p.id === 'prod-pos' || p.code === 'PROD-POS');
assert(posProduct !== undefined, 'Produk POS tersedia dalam seed data');
assert(posProduct && posProduct.category === 'Point of Sale', 'Kategori produk POS adalah Point of Sale');
assert(posProduct && (posProduct.active === true || posProduct.status === 'Active'), 'Status produk POS adalah Aktif');

const erpProduct = db.products.find(p => p.id === 'prod-erp' || p.code === 'PROD-ERP');
assert(erpProduct !== undefined, 'Produk CRM/ERP Custom tersedia dalam seed data');
assert(erpProduct && erpProduct.category === 'Enterprise ERP', 'Kategori produk ERP adalah Enterprise ERP');
assert(erpProduct && (erpProduct.active === true || erpProduct.status === 'Active'), 'Status produk ERP adalah Aktif');

const webProduct = db.products.find(p => p.id === 'prod-web' || p.code === 'PROD-WEB');
assert(webProduct !== undefined, 'Produk Website Company Profile tersedia dalam seed data');
assert(webProduct && webProduct.category === 'Web Solution', 'Kategori produk Web adalah Web Solution');
assert(webProduct && (webProduct.active === true || webProduct.status === 'Active'), 'Status produk Web adalah Aktif');

const customProduct = db.products.find(p => p.id === 'prod-custom' || p.code === 'PROD-CUSTOM');
assert(customProduct !== undefined, 'Produk Custom Bespoke Software tersedia dalam seed data');

// Check modules per product
const posMods = db.modules.filter(m => m.productId === posProduct.id);
assert(posMods.length >= 5, `Modul POS lengkap (ditemukan ${posMods.length} modul: core, stock, report, branch, pay)`);
assert(posMods.some(m => m.id === 'pos-core'), 'Modul pos-core tersedia');
assert(posMods.some(m => m.id === 'pos-stock'), 'Modul pos-stock tersedia');
assert(posMods.some(m => m.id === 'pos-report'), 'Modul pos-report tersedia');
assert(posMods.some(m => m.id === 'pos-branch'), 'Modul pos-branch tersedia');
assert(posMods.some(m => m.id === 'pos-pay'), 'Modul pos-pay tersedia');

const erpMods = db.modules.filter(m => m.productId === erpProduct.id);
assert(erpMods.length >= 5, `Modul ERP lengkap (ditemukan ${erpMods.length} modul: fin, hr, crm, procure, api)`);
assert(erpMods.some(m => m.id === 'erp-fin'), 'Modul erp-fin tersedia');
assert(erpMods.some(m => m.id === 'erp-hr'), 'Modul erp-hr tersedia');
assert(erpMods.some(m => m.id === 'erp-crm'), 'Modul erp-crm tersedia');

const webMods = db.modules.filter(m => m.productId === webProduct.id);
assert(webMods.length >= 4, `Modul Web lengkap (ditemukan ${webMods.length} modul: cms, seo, portal, chat)`);
assert(webMods.some(m => m.id === 'web-cms'), 'Modul web-cms tersedia');
assert(webMods.some(m => m.id === 'web-seo'), 'Modul web-seo tersedia');

// Verify module schema
const sampleMod = posMods[0];
assert(sampleMod.code && sampleMod.name && sampleMod.unit, 'Modul memiliki code, name, dan unit');
assert(['mandays', 'fixed'].includes(sampleMod.pricingMode), 'Modul memiliki pricingMode valid (mandays/fixed)');
assert(typeof sampleMod.mandays === 'number' && typeof sampleMod.rate === 'number' && typeof sampleMod.price === 'number', 'Modul memiliki mandays, rate, dan price numerik');
assert(sampleMod.active === true || sampleMod.status === 'Active', 'Status modul seed berstatus Aktif');

// -------------------------------------------------------------
// TEST 3: CRUD Software/Product Engine
// -------------------------------------------------------------
console.log('\n--- TEST 3: CRUD Software/Product Engine ---');
const initialProdCount = db.products.length;

// Test Validation: Empty name
window.openProductModal();
const pNameInput = document.getElementById('pName');
const pCodeInput = document.getElementById('pCode');
const pCatSelect = document.getElementById('pCategory');
const pDescInput = document.getElementById('pDesc');
const pActiveCheck = document.getElementById('pActive');

pNameInput.value = '';
const emptySaveRes = window.saveProduct();
assert(emptySaveRes && emptySaveRes.success === false, 'Validasi menolak simpan produk dengan nama kosong');
assert(db.products.length === initialProdCount, 'Jumlah produk tidak bertambah saat validasi gagal');

// Test Create Product
pNameInput.value = 'Sistem Hospital SIMRS Cloud';
pCodeInput.value = 'PROD-SIMRS';
pCatSelect.value = 'Enterprise ERP';
pDescInput.value = 'Solusi manajemen rumah sakit dan integrasi BPJS SatuSehat.';
pActiveCheck.checked = true;
const createProdRes = window.saveProduct();

assert(createProdRes && createProdRes.success === true, 'Berhasil membuat master software baru');
assert(db.products.length === initialProdCount + 1, 'Total software di database bertambah 1');

const createdProd = db.products.find(p => p.code === 'PROD-SIMRS');
assert(createdProd !== undefined, 'Produk baru ditemukan di database');
assert(createdProd.name === 'Sistem Hospital SIMRS Cloud', 'Nama produk tersimpan akurat');
assert(createdProd.category === 'Enterprise ERP', 'Kategori produk tersimpan akurat');
assert(createdProd.active === true && createdProd.status === 'Active', 'Status default produk baru adalah Aktif');

// Test Update Product
window.openProductModal(createdProd.id);
const editNameInput = document.getElementById('pName');
const editDescInput = document.getElementById('pDesc');
editNameInput.value = 'SIMRS Hospital Enterprise Suite V2';
editDescInput.value = 'Versi enterprise diperbarui.';
const updateProdRes = window.saveProduct(createdProd.id);

assert(updateProdRes && updateProdRes.success === true, 'Berhasil memperbarui master software');
assert(createdProd.name === 'SIMRS Hospital Enterprise Suite V2', 'Nama produk terupdate di memory');
assert(createdProd.description === 'Versi enterprise diperbarui.', 'Deskripsi produk terupdate di memory');

// Test Toggle Product Status
window.toggleProductStatus(createdProd.id);
assert(createdProd.active === false && createdProd.status === 'Inactive', 'Toggle status produk mengubah ke Inactive/Nonaktif');
window.toggleProductStatus(createdProd.id);
assert(createdProd.active === true && createdProd.status === 'Active', 'Toggle status produk mengembalikan ke Active/Aktif');

// -------------------------------------------------------------
// TEST 4: CRUD Modules Engine & Pricing Modes
// -------------------------------------------------------------
console.log('\n--- TEST 4: CRUD Modules Engine & Pricing Modes ---');
const initialModCount = db.modules.length;

// Test Validation: Empty name & Empty parent
window.openModuleModal();
const mParentSelect = document.getElementById('mParentProduct');
const mNameInput = document.getElementById('mName');
const mCodeInput = document.getElementById('mCode');
const mPricingSelect = document.getElementById('mPricingMode');
const mMandaysInput = document.getElementById('mMandays');
const mRateInput = document.getElementById('mRate');
const mPriceInput = document.getElementById('mPrice');
const mActiveCheck = document.getElementById('mActive');

mParentSelect.value = '';
mNameInput.value = '';
const emptyModRes = window.saveModule();
assert(emptyModRes && emptyModRes.success === false, 'Validasi menolak modul dengan software parent kosong');

// Test Create Module with Mandays mode
mParentSelect.value = createdProd.id;
mNameInput.value = 'Modul Rawat Inap & Bed Management';
mCodeInput.value = 'MOD-SIMRS-01';
mPricingSelect.value = 'mandays';
mMandaysInput.value = '10';
mRateInput.value = '1200000';
mPriceInput.value = '12000000';
mActiveCheck.checked = true;
const createModRes = window.saveModule();

assert(createModRes && createModRes.success === true, 'Berhasil membuat modul baru mandays-based');
assert(db.modules.length === initialModCount + 1, 'Total modul di database bertambah');

const createdMod = db.modules.find(m => m.code === 'MOD-SIMRS-01');
assert(createdMod !== undefined, 'Modul baru ditemukan di database');
assert(createdMod.productId === createdProd.id, 'Parent productId modul terhubung dengan benar');
assert(createdMod.mandays === 10, 'Mandays tersimpan tepat');
assert(createdMod.rate === 1200000, 'Tarif rate tersimpan tepat');
assert(createdMod.price === 12000000, 'Harga kalkulasi referensi mandays × rate tepat (12.000.000)');
assert(createdMod.active === true && createdMod.status === 'Active', 'Status awal modul adalah Aktif');

// Test Create Module with Fixed Price mode
window.openModuleModal(null, createdProd.id);
const mParentSelect2 = document.getElementById('mParentProduct');
const mNameInput2 = document.getElementById('mName');
const mCodeInput2 = document.getElementById('mCode');
const mPricingSelect2 = document.getElementById('mPricingMode');
const mPriceInput2 = document.getElementById('mPrice');
const mActiveCheck2 = document.getElementById('mActive');

mParentSelect2.value = createdProd.id;
mNameInput2.value = 'Modul Integrasi BPJS Bridging P-Care';
mCodeInput2.value = 'MOD-SIMRS-02';
mPricingSelect2.value = 'fixed';
mPriceInput2.value = '15000000';
mActiveCheck2.checked = true;
const createFixedModRes = window.saveModule();

assert(createFixedModRes && createFixedModRes.success === true, 'Berhasil membuat modul fixed price');
const fixedMod = db.modules.find(m => m.code === 'MOD-SIMRS-02');
assert(fixedMod && fixedMod.pricingMode === 'fixed', 'Pricing mode fixed tersimpan rapi');
assert(fixedMod && fixedMod.price === 15000000, 'Harga paket tetap fixed price tersimpan rapi');

// Test Update Module
window.openModuleModal(createdMod.id);
const editModName = document.getElementById('mName');
editModName.value = 'Modul Rawat Inap & ICU Bed Management';
const updateModRes = window.saveModule(createdMod.id);
assert(updateModRes && updateModRes.success === true, 'Berhasil update data modul');
assert(createdMod.name === 'Modul Rawat Inap & ICU Bed Management', 'Nama modul terupdate');

// Test Toggle Module Status
window.toggleModuleStatus(createdMod.id);
assert(createdMod.active === false && createdMod.status === 'Inactive', 'Toggle status modul mengubah ke Inactive/Nonaktif');
window.toggleModuleStatus(createdMod.id);
assert(createdMod.active === true && createdMod.status === 'Active', 'Toggle status modul mengembalikan ke Active/Aktif');

// -------------------------------------------------------------
// TEST 5: Filter Modules by productId (Point 5)
// -------------------------------------------------------------
console.log('\n--- TEST 5: Filter Modules by productId (Point 5) ---');
const posFiltered = window.filterModulesByProduct('prod-pos');
assert(posFiltered.length === posMods.length, `Filter modul prod-pos menghasilkan tepat ${posMods.length} modul`);
assert(posFiltered.every(m => m.productId === 'prod-pos'), 'Semua modul hasil filter memiliki productId prod-pos');

const erpFiltered = window.filterModulesByProduct('prod-erp');
assert(erpFiltered.length === erpMods.length, `Filter modul prod-erp menghasilkan tepat ${erpMods.length} modul`);
assert(erpFiltered.every(m => m.productId === 'prod-erp'), 'Semua modul hasil filter memiliki productId prod-erp');

// Test onlyActive filter
window.toggleModuleStatus(createdMod.id); // set createdMod to Inactive
const simrsAll = window.filterModulesByProduct(createdProd.id, false);
const simrsActiveOnly = window.filterModulesByProduct(createdProd.id, true);
assert(simrsAll.length === 2, 'Filter semua modul SIMRS menghasilkan 2 modul');
assert(simrsActiveOnly.length === 1, 'Filter hanya modul aktif SIMRS menghasilkan 1 modul aktif');
assert(simrsActiveOnly[0].id === fixedMod.id, 'Modul aktif yang lolos filter adalah MOD-SIMRS-02');
window.toggleModuleStatus(createdMod.id); // restore to Active

// -------------------------------------------------------------
// TEST 6: Inactive Module Selection Guardrail in Offerings (Point 6)
// -------------------------------------------------------------
console.log('\n--- TEST 6: Inactive Module Selection Guardrail in Offerings (Point 6) ---');
const testInactiveMod = {
  id: 'mod-inactive-test',
  productId: 'prod-pos',
  code: 'MOD-POS-INACT',
  name: 'Modul Discontinued Offline POS',
  pricingMode: 'mandays',
  mandays: 4,
  rate: 1000000,
  price: 4000000,
  active: false,
  status: 'Inactive'
};
db.modules.push(testInactiveMod);

// Simulate offering items state
window.currentOfferingDraft = {
  id: 'off-test-draft',
  softwareId: 'prod-pos',
  dealId: 'deal-demo-1'
};
window.setOfferingItems([]);

// Attempt to add inactive module to offering
window.toggleOfferingModuleSelection(testInactiveMod.id);
assert(window.getOfferingItems().length === 0, 'Sistem MENOLAK penambahan modul nonaktif ke dalam penawaran baru (Guardrail Sukses)');

// Attempt to add active module to offering
window.toggleOfferingModuleSelection('pos-core');
const currentItems = window.getOfferingItems();
assert(currentItems.length === 1, 'Modul aktif (pos-core) berhasil ditambahkan ke penawaran baru');
assert(currentItems[0] && currentItems[0].sourceModuleId === 'pos-core', 'Offering item menyimpan sourceModuleId pos-core');

// Clean up
window.setOfferingItems([]);
db.modules = db.modules.filter(m => m.id !== 'mod-inactive-test');

// -------------------------------------------------------------
// TEST 7: CRUD Role Rate Card & Validation (Point 4 & 8)
// -------------------------------------------------------------
console.log('\n--- TEST 7: CRUD Role Rate Card & Validation (Point 4 & 8) ---');
const initialRateCardCount = db.rateCards.length;

// Verify seed rate cards have currency, validFrom, validTo, origin
const sampleRc = db.rateCards[0];
assert(sampleRc.role && sampleRc.rate > 0, 'Role rate card memiliki role dan tarif manday');
assert(sampleRc.currency === 'IDR', 'Role rate card memiliki currency IDR');
assert(sampleRc.validFrom && sampleRc.validTo, 'Role rate card memiliki rentang validFrom dan validTo');
assert(sampleRc.origin === 'Master Rate Card', 'Role rate card memiliki asal rate: Master Rate Card');
assert(sampleRc.active === true || sampleRc.status === 'Active', 'Role rate card aktif');

// Test Validation: Role required
window.openRateCardModal();
const rcRoleInput = document.getElementById('rcRole');
const rcRateInput = document.getElementById('rcRate');
const rcCurrSelect = document.getElementById('rcCurrency');
const rcValidFromInput = document.getElementById('rcValidFrom');
const rcValidToInput = document.getElementById('rcValidTo');
const rcNotesInput = document.getElementById('rcNotes');
const rcActiveCheck = document.getElementById('rcActive');

rcRoleInput.value = '';
const emptyRoleRes = window.saveRateCard();
assert(emptyRoleRes && emptyRoleRes.success === false, 'Validasi menolak rate card dengan nama role kosong');

// Test Validation: Negative rate
rcRoleInput.value = 'AI / LLM Specialist';
rcRateInput.value = '-500000';
const negRateRes = window.saveRateCard();
assert(negRateRes && negRateRes.success === false, 'Validasi menolak tarif rate bernilai negatif');

// Test Validation: validFrom > validTo
rcRateInput.value = '1750000';
rcValidFromInput.value = '2026-12-31';
rcValidToInput.value = '2026-01-01';
const invalidDateRes = window.saveRateCard();
assert(invalidDateRes && invalidDateRes.success === false, 'Validasi menolak rentang tanggal jika validFrom > validTo');

// Test Create Valid Rate Card
rcValidFromInput.value = '2026-01-01';
rcValidToInput.value = '2026-12-31';
rcCurrSelect.value = 'IDR';
rcNotesInput.value = 'Pengembangan integrasi model LLM, fine-tuning, dan prompt engineering.';
rcActiveCheck.checked = true;
const createRcRes = window.saveRateCard();

assert(createRcRes && createRcRes.success === true, 'Berhasil menambahkan role rate card baru');
assert(db.rateCards.length === initialRateCardCount + 1, 'Total rate card di database bertambah 1');

const createdRc = db.rateCards.find(r => r.role === 'AI / LLM Specialist');
assert(createdRc !== undefined, 'Role rate card baru tersimpan di database');
assert(createdRc.rate === 1750000, 'Tarif per manday tersimpan tepat (1.750.000)');
assert(createdRc.currency === 'IDR', 'Currency IDR tersimpan tepat');
assert(createdRc.validFrom === '2026-01-01' && createdRc.validTo === '2026-12-31', 'Periode berlaku tanggal tersimpan rapi');
assert(createdRc.origin === 'Master Rate Card', 'Asal rate tercatat: Master Rate Card');
assert(createdRc.active === true && createdRc.status === 'Active', 'Status role rate card baru adalah Aktif');

// Test Update Rate Card
window.openRateCardModal(createdRc.id);
const editRcRate = document.getElementById('rcRate');
editRcRate.value = '1850000';
const updateRcRes = window.saveRateCard(createdRc.id);
assert(updateRcRes && updateRcRes.success === true, 'Berhasil memperbarui role rate card');
assert(createdRc.rate === 1850000, 'Tarif terupdate ke 1.850.000');

// Test Toggle Rate Card Status
window.toggleRateCardStatus(createdRc.id);
assert(createdRc.active === false && createdRc.status === 'Inactive', 'Toggle status rate card mengubah ke Inactive/Nonaktif');
window.toggleRateCardStatus(createdRc.id);
assert(createdRc.active === true && createdRc.status === 'Active', 'Toggle status rate card mengembalikan ke Active/Aktif');

// -------------------------------------------------------------
// TEST 8: Display of Rate Origin and Validity Dates (Point 8)
// -------------------------------------------------------------
console.log('\n--- TEST 8: Display of Rate Origin and Validity Dates (Point 8) ---');
window.renderMaster();
window.renderRateCardPage();

const masterRateTbody = document.getElementById('masterRateRows');
const pageRateTbody = document.getElementById('rateCardPageRows');

assert(masterRateTbody && masterRateTbody.innerHTML.includes('Master Rate Card'), 'Tabel Master menampilkan label "Master Rate Card"');
assert(masterRateTbody && masterRateTbody.innerHTML.includes('s/d'), 'Tabel Master menampilkan rentang tanggal berlaku ("s/d")');
assert(masterRateTbody && masterRateTbody.innerHTML.includes('IDR'), 'Tabel Master menampilkan currency mata uang IDR');

assert(pageRateTbody && pageRateTbody.innerHTML.includes('Master Rate Card'), 'Halaman #page-rate-card menampilkan asal rate "Master Rate Card"');
assert(pageRateTbody && pageRateTbody.innerHTML.includes('Berlaku:'), 'Halaman #page-rate-card menampilkan tanggal berlaku');

// -------------------------------------------------------------
// TEST 9: Referential Integrity - Prevent Deletion If Referenced (Point 7)
// -------------------------------------------------------------
console.log('\n--- TEST 9: Referential Integrity - Prevent Deletion If Referenced (Point 7) ---');

// 1. Prevent Product Deletion if referenced
const delPosRes = window.safeDeleteProduct('prod-pos', true);
assert(delPosRes && delPosRes.success === false && delPosRes.referenced === true, 'Sistem MENOLAK hapus permanen software prod-pos (sedang direferensikan)');
assert(db.products.some(p => p.id === 'prod-pos'), 'Produk prod-pos tetap aman di database');

// 2. Prevent Module Deletion if referenced in Quotation items
const delModRes = window.safeDeleteModule('pos-core', true);
assert(delModRes && delModRes.success === false && delModRes.referenced === true, 'Sistem MENOLAK hapus permanen modul pos-core (tercatat di Quotation)');
assert(db.modules.some(m => m.id === 'pos-core'), 'Modul pos-core tetap aman di database');

// 3. Prevent Rate Card Deletion if referenced in WBS / Quotation
const delRcRes = window.safeDeleteRateCard('rc-1', true);
assert(delRcRes && delRcRes.success === false && delRcRes.referenced === true, 'Sistem MENOLAK hapus permanen rate card rc-1 (sedang direferensikan)');
assert(db.rateCards.some(r => r.id === 'rc-1'), 'Rate card rc-1 tetap aman di database');

// 4. Safe delete unreferenced entities succeeds
const delUnrefModRes = window.safeDeleteModule(fixedMod.id, true);
assert(delUnrefModRes && delUnrefModRes.success === true, 'Modul tanpa referensi berhasil dihapus permanen');
assert(!db.modules.some(m => m.id === fixedMod.id), 'Modul terhapus dari array db.modules');

const delUnrefProdRes = window.safeDeleteProduct(createdProd.id, true);
assert(delUnrefProdRes && delUnrefProdRes.success === true, 'Software tanpa referensi transaksi berhasil dihapus permanen');
assert(!db.products.some(p => p.id === createdProd.id), 'Software terhapus dari array db.products');

const delUnrefRcRes = window.safeDeleteRateCard(createdRc.id, true);
assert(delUnrefRcRes && delUnrefRcRes.success === true, 'Rate card tanpa referensi berhasil dihapus permanen');
assert(!db.rateCards.some(r => r.id === createdRc.id), 'Rate card terhapus dari array db.rateCards');

// -------------------------------------------------------------
// TEST 10: Strict Snapshot Immutability for Existing Quotations (Point 9)
// -------------------------------------------------------------
console.log('\n--- TEST 10: Strict Snapshot Immutability for Existing Quotations (Point 9) ---');

// Check existing quotation qt-demo-1
const targetQuote = db.quotations.find(q => q.id === 'qt-demo-1');
assert(targetQuote !== undefined, 'Quotation historis qt-demo-1 ditemukan');

const originalQuoteItem = targetQuote.items.find(it => it.sourceModuleId === 'pos-core');
assert(originalQuoteItem !== undefined, 'Item pos-core ditemukan dalam quotation qt-demo-1');

const originalRate = originalQuoteItem.rate;
const originalMandays = originalQuoteItem.mandays;
const originalLineTotal = originalQuoteItem.lineTotal;

assert(originalRate === 1000000, `Rate asli pada item penawaran adalah 1.000.000 (actual: ${originalRate})`);
assert(originalMandays === 12, `Mandays asli pada item penawaran adalah 12 (actual: ${originalMandays})`);
assert(originalLineTotal === 12000000, `Line total asli adalah 12.000.000 (actual: ${originalLineTotal})`);

// Now modify the master catalog module pos-core
const masterPosCore = db.modules.find(m => m.id === 'pos-core');
assert(masterPosCore !== undefined, 'Master modul pos-core ditemukan');

// Mutate master catalog price and rate
masterPosCore.rate = 2500000;
masterPosCore.mandays = 20;
masterPosCore.price = 50000000;
window.persist();

// Also mutate master rate card Business Analyst
const masterBaRc = db.rateCards.find(r => r.id === 'rc-1' || r.role === 'Business Analyst');
if (masterBaRc) {
  masterBaRc.rate = 3000000;
  window.persist();
}

// Re-verify quotation items & snapshot
assert(originalQuoteItem.rate === 1000000, 'SNAPSHOT IMMUTABILITY: Rate item quotation TETAP 1.000.000 meskipun master modul diubah ke 2.500.000');
assert(originalQuoteItem.mandays === 12, 'SNAPSHOT IMMUTABILITY: Mandays item quotation TETAP 12 meskipun master modul diubah');
assert(originalQuoteItem.lineTotal === 12000000, 'SNAPSHOT IMMUTABILITY: Total harga item quotation TETAP 12.000.000 tidak terpengaruh perubahan master');

if (targetQuote.snapshot && targetQuote.snapshot.items) {
  const snapPosItem = targetQuote.snapshot.items.find(it => it.sourceModuleId === 'pos-core');
  assert(snapPosItem && snapPosItem.rate === 1000000, 'SNAPSHOT IMMUTABILITY: Salinan q.snapshot.items tetap mempertahankan rate 1.000.000');
}

// Restore master pos-core for clean environment
masterPosCore.rate = 1000000;
masterPosCore.mandays = 12;
masterPosCore.price = 12000000;
if (masterBaRc) masterBaRc.rate = 950000;
window.persist();

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('=======================================');

if (failed === 0) {
  console.log('\n>>> 100% TASK 9 ACCEPTANCE CRITERIA VERIFIED! <<<');
  process.exit(0);
} else {
  console.error(`\n>>> FAILURE: ${failed} tests failed. <<<`);
  process.exit(1);
}
