/**
 * rabCalculator.js — Vanilla JS conversion of rabCalculator.ts
 * All business formulas preserved exactly from original.
 */

/**
 * Calculate RAB Summary from items.
 * @param {Array} items
 * @param {number} [contingencyPct=10]
 * @param {number} [discountAmount=0]
 * @param {number} [taxPct=11]
 * @param {number} [version=1]
 * @param {string} [status='draft']
 * @param {string} [reviewedBy]
 * @returns {RabSummary}
 */
export function calculateRabSummary(
  items,
  contingencyPct = 10,
  discountAmount = 0,
  taxPct = 11,
  version = 1,
  status = 'draft',
  reviewedBy
) {
  // Only include items that are not marked as optional add-ons in the main total
  const billableItems = items.filter((item) => !item.is_optional);

  let subtotal = 0;
  let totalMandays = 0;
  let internalCost = 0;

  for (const item of billableItems) {
    const itemSubtotal = item.qty * item.unit_price;
    subtotal += itemSubtotal;
    totalMandays += item.mandays || item.qty;

    // Use specific unit_cost if available, else standard internal cost estimate (approx 60% of rate)
    const cost = item.unit_cost !== undefined ? item.qty * item.unit_cost : itemSubtotal * 0.6;
    internalCost += cost;
  }

  const contingencyAmount = Math.round((subtotal * Math.max(0, contingencyPct)) / 100);
  const totalBeforeDiscount = subtotal + contingencyAmount;
  const validDiscount = Math.min(totalBeforeDiscount, Math.max(0, discountAmount));
  const totalBeforeTax = totalBeforeDiscount - validDiscount;

  const taxAmount = Math.round((totalBeforeTax * Math.max(0, taxPct)) / 100);
  const grandTotal = totalBeforeTax + taxAmount;

  // Margin = (totalBeforeTax - internalCost) / totalBeforeTax * 100
  const marginPct =
    totalBeforeTax > 0
      ? Math.round(((totalBeforeTax - internalCost) / totalBeforeTax) * 1000) / 10
      : 0;

  return {
    items,
    subtotal,
    contingency_pct: contingencyPct,
    contingency_amount: contingencyAmount,
    discount_amount: validDiscount,
    total_before_tax: totalBeforeTax,
    tax_pct: taxPct,
    tax_amount: taxAmount,
    grand_total: grandTotal,
    total_mandays: totalMandays,
    internal_cost: internalCost,
    margin_pct: marginPct,
    version,
    status,
    reviewed_by: reviewedBy,
    reviewed_at: reviewedBy ? new Date().toISOString() : undefined,
  };
}

/**
 * Standard baseline software house module templates (PRD Section 8.8, 9.2, 9.3)
 * @type {Array<Omit<RabItem, 'id' | 'subtotal'>>}
 */
export const STANDARD_MODULE_TEMPLATES = [
  {
    category: 'Master Data',
    name: 'Master Karyawan & Struktur Organisasi',
    description: 'CRUD data karyawan, hierarki departemen, divisi, jabatan, riwayat karir & export/import Excel',
    qty: 6,
    unit: 'Mandays',
    role: 'Fullstack Dev',
    unit_price: 1500000,
    unit_cost: 900000,
    mandays: 6,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Master Data',
    name: 'Master Shift, Lokasi Kerja & Hari Libur',
    description: 'Manajemen multi-cabang geofence GPS, shift dinamis dan kalender hari libur nasional',
    qty: 4,
    unit: 'Mandays',
    role: 'Fullstack Dev',
    unit_price: 1500000,
    unit_cost: 900000,
    mandays: 4,
    complexity: 'Low',
    source: 'Template',
  },
  {
    category: 'Master Data',
    name: 'Master Tipe Cuti & Komponen Gaji',
    description: 'Kebijakan kuota cuti bertahap, formula tunjangan, potongan BPJS & PPh 21',
    qty: 5,
    unit: 'Mandays',
    role: 'Backend Dev',
    unit_price: 1500000,
    unit_cost: 900000,
    mandays: 5,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Transaksi',
    name: 'Absensi (GPS Geofencing & Liveness Selfie) + Approval',
    description: 'Check-in/out mobile GPS validasi radius cabang, deteksi anti-fake GPS dan approval berjenjang',
    qty: 12,
    unit: 'Mandays',
    role: 'Mobile & BE',
    unit_price: 1600000,
    unit_cost: 950000,
    mandays: 12,
    complexity: 'High',
    source: 'Template',
  },
  {
    category: 'Transaksi',
    name: 'Pengajuan Cuti, Izin, Lembur + Workflow Matrix',
    description: 'Pengajuan multi-approval, notifikasi real-time WhatsApp & kalkulasi otomatis saldo cuti',
    qty: 10,
    unit: 'Mandays',
    role: 'Fullstack Dev',
    unit_price: 1600000,
    unit_cost: 950000,
    mandays: 10,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Transaksi',
    name: 'Payroll Engine & E-Slip Gaji Terenkripsi',
    description: 'Proses kalkulasi payroll batch 500+ staff, slip gaji PDF password protected & integrasi bank',
    qty: 20,
    unit: 'Mandays',
    role: 'Senior BE',
    unit_price: 1800000,
    unit_cost: 1100000,
    mandays: 20,
    complexity: 'High',
    source: 'Template',
  },
  {
    category: 'Transaksi',
    name: 'Recruitment & Onboarding Portal',
    description: 'Penerimaan CV, jadwal interview, evaluasi kandidat, dan checklist onboarding karyawan baru',
    qty: 14,
    unit: 'Mandays',
    role: 'Fullstack Dev',
    unit_price: 1600000,
    unit_cost: 950000,
    mandays: 14,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Laporan',
    name: 'Paket Laporan Komprehensif (Absensi, Cuti, Payroll, Headcount)',
    description: '12 template laporan tabular & drilldown, filter periode, export XLSX/PDF resmi',
    qty: 8,
    unit: 'Mandays',
    role: 'Backend Dev',
    unit_price: 1500000,
    unit_cost: 900000,
    mandays: 8,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Dashboard & KPI',
    name: 'Dashboard Eksekutif HR & Employee Self-Service (ESS)',
    description: 'Visualisasi turnover rate, kehadiran harian, statistik demografi & kalender tim',
    qty: 7,
    unit: 'Mandays',
    role: 'Frontend Dev',
    unit_price: 1700000,
    unit_cost: 1000000,
    mandays: 7,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Mobile',
    name: 'Aplikasi Mobile Karyawan (Android & iOS)',
    description: 'React Native / Flutter app: absensi selfie, profil, notifikasi push, slip gaji & izin',
    qty: 25,
    unit: 'Mandays',
    role: 'Mobile Dev',
    unit_price: 1800000,
    unit_cost: 1100000,
    mandays: 25,
    complexity: 'High',
    source: 'Template',
  },
  {
    category: 'Integrasi',
    name: 'Integrasi Mesin Fingerprint & API Bank Transfer',
    description: 'Sync log absensi dari mesin biometric Solution/ZKTeco dan export payroll file ke bank',
    qty: 6,
    unit: 'Mandays',
    role: 'Integration Eng',
    unit_price: 1800000,
    unit_cost: 1100000,
    mandays: 6,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Non-Functional',
    name: 'Security, Multi-Role RBAC, Audit Log & Notifikasi',
    description: 'Enkripsi data pribadi UU PDP, otentikasi 2FA, session control & audit trail per perubahan',
    qty: 8,
    unit: 'Mandays',
    role: 'Security & BE',
    unit_price: 1600000,
    unit_cost: 950000,
    mandays: 8,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'PM & QA',
    name: 'Project Management, Quality Assurance & UAT Assistance',
    description: 'Supervisi sprint, test automation, load testing, pendampingan UAT dan perbaikan bug',
    qty: 18,
    unit: 'Mandays',
    role: 'PM & QA Lead',
    unit_price: 1700000,
    unit_cost: 1050000,
    mandays: 18,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Infrastruktur',
    name: 'Cloud Server Setup, Containerization Docker & CI/CD Pipeline',
    description: 'Deployment production environment, SSL TLS 1.3, backup otomatis dan monitoring',
    qty: 4,
    unit: 'Mandays',
    role: 'DevOps Eng',
    unit_price: 1900000,
    unit_cost: 1150000,
    mandays: 4,
    complexity: 'Medium',
    source: 'Template',
  },
  {
    category: 'Training',
    name: 'User Manual Book, Video Tutorial & Onsite Training Admin',
    description: 'Pelatihan langsung untuk super admin dan user HRD, buku panduan PDF & video panduan',
    qty: 5,
    unit: 'Mandays',
    role: 'Technical Writer',
    unit_price: 1400000,
    unit_cost: 800000,
    mandays: 5,
    complexity: 'Low',
    source: 'Template',
  },
];
