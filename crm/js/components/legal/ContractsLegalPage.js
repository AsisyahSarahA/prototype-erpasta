/**
 * ContractsLegalPage.js — Vanilla JS ASTACODE Legal & Manajemen Kontrak (22 Pasal MoU)
 * Converted from src/components/legal/ContractsLegalPage.tsx
 */

import store from '../../store/store.js';
import { STANDARD_MOU_CLAUSES } from '../../data/seedData.js';
import { formatRupiah, terbilang } from '../../utils/topCalculator.js';
import { paginate } from '../../utils/pagination.js';
import { renderPaginationControls, bindPaginationEvents } from '../common/PaginationControls.js';

// Module-level UI State
let activeTab = 'contracts'; // 'contracts' | 'clauses' | 'mou_preview' | 'esign_audit'
let searchTerm = '';
let statusFilter = 'all';

// Clauses state initialized from ASTACODE 22 standard clauses
let clausesList = [...STANDARD_MOU_CLAUSES];
let selectedCategory = 'all';
let editingClauseId = null;
let isAddClauseOpen = false;
let newClauseTitle = '';
let newClauseCategory = 'Ruang Lingkup & Deliverable';
let newClauseBody = '';
let newClauseMandatory = true;

// Pagination
let contractPage = 1;
let contractPageSize = 4;
let clausePage = 1;
let clausePageSize = 6;

// Modals
let selectedContractForDetailId = null;
let selectedContractForSignId = null;
let selectedContractForAddendumId = null;
let addendumDesc = '';
let addendumValue = 35000000;

// New Contract Modal State with "Lainnya"
let isNewContractOpen = false;
let selectedCustomerId = '';
let contractTitle = '';
let contractValue = 244200000;
let mandaysScope = 152;
let topSchemeChoice = '30/40/30';
let customTopScheme = '';
let warrantyChoice = '90 Hari';
let customWarranty = '';
let slaChoice = '99.5% Uptime SLA';
let customSla = '';
let contractStartDate = new Date().toISOString().split('T')[0];
let contractEndDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

// 4-Part Document Preview state
let docPart = 'all'; // 'all' | 'surat' | 'rab' | 'klausul' | 'esign'
let selectedProjectForDocId = '';
let isExportClausesOpen = false;

const ICONS = {
  shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  fileCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  penTool: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  printer: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  rotateCcw: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
};

export function renderContractsLegalPage() {
  const { projects, customers } = store.getState();

  if (!selectedProjectForDocId && projects.length > 0) {
    selectedProjectForDocId = projects[0].id;
  }
  if (!selectedCustomerId && customers.length > 0) {
    selectedCustomerId = customers[0].id;
  }

  const selectedProjectForDoc = projects.find((p) => p.id === selectedProjectForDocId) || projects[0] || {};
  const selectedContractForDetail = projects.find((p) => p.id === selectedContractForDetailId) || null;
  const selectedContractForSign = projects.find((p) => p.id === selectedContractForSignId) || null;
  const selectedContractForAddendum = projects.find((p) => p.id === selectedContractForAddendumId) || null;
  const editingClause = clausesList.find((c) => c.id === editingClauseId) || null;

  // Metrics
  const totalContractValue = projects.reduce((acc, p) => acc + p.contract_value, 0);
  const activeContractsCount = projects.filter((p) => p.status === 'Active').length;
  const completedContractsCount = projects.filter((p) => p.status === 'Completed').length;

  // Filter contracts
  const q = searchTerm.toLowerCase().trim();
  const filteredContracts = projects.filter((p) => {
    const matchesSearch =
      q === '' ||
      p.title.toLowerCase().includes(q) ||
      p.contract_number.toLowerCase().includes(q) ||
      p.customer_name.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { data: pagedContracts, pagination: contractPagination } = paginate(
    filteredContracts,
    contractPage,
    contractPageSize
  );

  // Filter clauses
  const categories = ['all', ...Array.from(new Set(clausesList.map((c) => c.category || 'Umum')))];
  const filteredClauses = clausesList.filter((cl) => {
    const matchesSearch =
      q === '' ||
      cl.title.toLowerCase().includes(q) ||
      cl.body.toLowerCase().includes(q) ||
      (cl.category || '').toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'all' || cl.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const { data: pagedClauses, pagination: clausePagination } = paginate(
    filteredClauses,
    clausePage,
    clausePageSize
  );

  return `
    <div style="flex:1;display:flex;flex-direction:column;height:100%;overflow-y:auto;background:var(--bg-canvas);padding:24px;gap:24px;">
      
      <!-- Header & Tab Switcher -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:var(--bg-card);padding:20px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--indigo-600), var(--indigo-500));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-xs);">
            ${ICONS.shieldCheck}
          </div>
          <div>
            <h1 style="font-size:16px;font-weight:800;color:var(--text-primary);letter-spacing:-0.01em;margin:0;">
              ASTACODE Legal & Manajemen Kontrak (22 Pasal MoU)
            </h1>
            <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
              Pengelolaan kontrak proyek software house, repositori klausul baku 22 pasal, generator berkas 4-bagian, dan pengesahan e-Signature UU ITE.
            </p>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;">
          <!-- Tabs Navigation -->
          <div style="display:flex;align-items:center;gap:4px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-xl);font-size:12px;font-weight:600;">
            <button
              class="legal-tab-btn ${activeTab === 'contracts' ? 'active' : ''}"
              data-tab="contracts"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'contracts'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Kontrak Aktif (${projects.length})
            </button>
            <button
              class="legal-tab-btn ${activeTab === 'clauses' ? 'active' : ''}"
              data-tab="clauses"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'clauses'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Library 22 Pasal MoU
            </button>
            <button
              class="legal-tab-btn ${activeTab === 'mou_preview' ? 'active' : ''}"
              data-tab="mou_preview"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'mou_preview'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Dokumen 4-Part MoU/SPK
            </button>
            <button
              class="legal-tab-btn ${activeTab === 'esign_audit' ? 'active' : ''}"
              data-tab="esign_audit"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'esign_audit'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Audit E-Sign UU ITE
            </button>
          </div>

          <button
            id="legal-open-new-contract-btn"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--indigo-600), var(--indigo-700));color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.25);transition:all var(--transition);"
          >
            ${ICONS.plus}
            <span>+ Buat SPK / Kontrak</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
        <div style="padding:16px 20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
            <span>Total Nilai Kontrak</span>
            <span style="color:var(--indigo-500);display:flex;">${ICONS.dollarSign}</span>
          </div>
          <p style="font-size:18px;font-weight:900;font-family:var(--font-mono);color:var(--text-primary);margin:0;">
            ${formatRupiah(totalContractValue)}
          </p>
          <p style="font-size:10px;color:var(--text-muted);margin:0;">Total portofolio perjanjian aktif</p>
        </div>

        <div style="padding:16px 20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
            <span>Kontrak Berjalan</span>
            <span style="color:var(--amber-500);display:flex;">${ICONS.clock}</span>
          </div>
          <p style="font-size:18px;font-weight:900;font-family:var(--font-mono);color:var(--amber-600);margin:0;">
            ${activeContractsCount} Proyek
          </p>
          <p style="font-size:10px;color:var(--text-muted);margin:0;">Termin & deliverable sedang berjalan</p>
        </div>

        <div style="padding:16px 20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
            <span>Kontrak Selesai / BAST</span>
            <span style="color:var(--emerald-500);display:flex;">${ICONS.fileCheck}</span>
          </div>
          <p style="font-size:18px;font-weight:900;font-family:var(--font-mono);color:var(--emerald-600);margin:0;">
            ${completedContractsCount} Selesai
          </p>
          <p style="font-size:10px;color:var(--text-muted);margin:0;">BAST disetujui 100%</p>
        </div>

        <div style="padding:16px 20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
            <span>Standar Klausul MoU</span>
            <span style="color:var(--indigo-500);display:flex;">${ICONS.shieldCheck}</span>
          </div>
          <p style="font-size:18px;font-weight:900;font-family:var(--font-mono);color:var(--indigo-600);margin:0;">
            ${clausesList.length} Pasal Terdaftar
          </p>
          <p style="font-size:10px;color:var(--emerald-600);font-weight:600;margin:0;">100% Terverifikasi UU ITE & PDP</p>
        </div>
      </div>

      <!-- TAB 1: DAFTAR KONTRAK & SPK AKTIF -->
      ${
        activeTab === 'contracts'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Filter Bar -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:16px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="position:relative;width:280px;">
                <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
                  ${ICONS.search}
                </span>
                <input
                  id="legal-search-contract-input"
                  type="text"
                  placeholder="Cari nomor SPK, judul kontrak, atau klien..."
                  value="${searchTerm}"
                  style="width:100%;padding:8px 12px 8px 36px;border-radius:var(--radius-xl);font-size:12px;background:var(--bg-surface);border:1px solid transparent;color:var(--text-primary);outline:none;"
                />
              </div>

              <!-- Status Filter Buttons -->
              <div style="display:flex;align-items:center;gap:4px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-xl);font-size:11px;">
                ${['all', 'Active', 'Completed', 'UAT']
                  .map(
                    (st) => `
                  <button
                    class="legal-status-filter-btn ${statusFilter === st ? 'active' : ''}"
                    data-status="${st}"
                    style="padding:4px 10px;border-radius:var(--radius-lg);border:none;cursor:pointer;${
                      statusFilter === st
                        ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                        : 'background:none;color:var(--text-muted);'
                    }"
                  >
                    ${st === 'all' ? 'Semua Status' : st}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;font-weight:500;">
              <span style="color:var(--indigo-600);display:flex;">${ICONS.shieldCheck}</span>
              <span>Penanggung Jawab Legal: <strong>Asisyah Sarah Azzahra (PM ASTACODE)</strong></span>
            </div>
          </div>

          <!-- Contracts Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(400px, 1fr));gap:16px;">
            ${pagedContracts
              .map(
                (proj) => `
              <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;box-shadow:var(--shadow-xs);">
                <div>
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                    <div>
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--indigo-600);padding:2px 8px;border-radius:var(--radius-sm);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);">
                          ${proj.contract_number}
                        </span>
                        <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:800;${
                          proj.status === 'Active'
                            ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                            : 'background:var(--bg-surface);color:var(--text-secondary);border:1px solid var(--border-light);'
                        }">
                          ${proj.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 style="font-weight:800;font-size:14px;color:var(--text-primary);margin:8px 0 2px 0;">
                        ${proj.title}
                      </h3>
                      <p style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:4px;margin:0;">
                        <span style="display:flex;">${ICONS.building}</span>
                        <span>${proj.customer_name}</span>
                      </p>
                    </div>

                    <div style="text-align:right;">
                      <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Nilai Kontrak</span>
                      <p style="font-family:var(--font-mono);font-weight:900;font-size:14px;color:var(--emerald-600);margin:2px 0 0 0;">
                        ${formatRupiah(proj.contract_value)}
                      </p>
                    </div>
                  </div>

                  <!-- Contract Matrix -->
                  <div style="margin-top:14px;padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">
                    <div>
                      <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">Garansi Bug:</span>
                      <span style="font-weight:600;color:var(--text-primary);">${proj.warranty_period || '90 Hari Pasca BAST'}</span>
                    </div>
                    <div>
                      <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">SLA Komitmen:</span>
                      <span style="font-weight:600;color:var(--text-primary);">${proj.sla_level || '99.5% Uptime SLA'}</span>
                    </div>
                    <div>
                      <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">Masa Berlaku:</span>
                      <span style="font-family:var(--font-mono);color:var(--text-secondary);">${proj.start_date} s/d ${proj.end_date}</span>
                    </div>
                    <div>
                      <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">Keabsahan:</span>
                      <span style="color:var(--emerald-600);font-weight:700;display:flex;align-items:center;gap:4px;">
                        ${ICONS.shieldCheck}
                        <span>${proj.esign_status || 'Terverifikasi Sah UU ITE'}</span>
                      </span>
                    </div>
                  </div>

                  <!-- Termin TOP Bar -->
                  <div style="display:flex;flex-direction:column;gap:6px;padding-top:12px;font-size:11px;">
                    <div style="display:flex;justify-content:space-between;color:var(--text-muted);">
                      <span>Skema Termin TOP: <strong>${proj.top_scheme.preset_name}</strong></span>
                      <span>Progress Fisik: ${proj.progress_pct}%</span>
                    </div>
                    <div style="display:flex;gap:6px;">
                      ${(proj.top_scheme.items || [])
                        .map(
                          (term, i) => `
                        <div style="flex:1;padding:6px;border-radius:var(--radius-md);text-align:center;font-family:var(--font-mono);font-size:10px;font-weight:700;${
                          term.status === 'Paid'
                            ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.3);'
                            : term.status === 'Invoiced'
                            ? 'background:rgba(245,158,11,.1);color:var(--amber-600);border:1px solid rgba(245,158,11,.3);'
                            : 'background:var(--bg-surface);color:var(--text-muted);border:1px solid var(--border-light);'
                        }">
                          <div>T${i + 1}: ${term.value}%</div>
                          <div style="font-weight:500;font-size:9px;">${term.status}</div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>

                <!-- Footer Buttons -->
                <div style="padding-top:12px;border-top:1px solid var(--border-light);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
                  <div style="font-size:11px;color:var(--text-muted);">
                    PM: <strong>${proj.pm_name}</strong>
                  </div>

                  <div style="display:flex;align-items:center;gap:6px;">
                    <button
                      class="legal-detail-btn"
                      data-project-id="${proj.id}"
                      style="padding:6px 10px;border-radius:var(--radius-lg);font-size:11px;font-weight:700;color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-light);cursor:pointer;display:flex;align-items:center;gap:4px;"
                    >
                      ${ICONS.eye}
                      <span>Detail</span>
                    </button>
                    <button
                      class="legal-open-doc-btn"
                      data-project-id="${proj.id}"
                      style="padding:6px 10px;border-radius:var(--radius-lg);font-size:11px;font-weight:700;color:var(--indigo-600);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);cursor:pointer;display:flex;align-items:center;gap:4px;"
                    >
                      ${ICONS.fileText}
                      <span>4-Part</span>
                    </button>
                    <button
                      class="legal-esign-btn"
                      data-project-id="${proj.id}"
                      style="padding:6px 10px;border-radius:var(--radius-lg);font-size:11px;font-weight:700;color:var(--emerald-600);background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);cursor:pointer;display:flex;align-items:center;gap:4px;"
                    >
                      ${ICONS.penTool}
                      <span>E-Sign</span>
                    </button>
                    <button
                      class="legal-addendum-btn"
                      data-project-id="${proj.id}"
                      style="padding:6px 8px;border-radius:var(--radius-lg);font-size:11px;font-weight:600;color:var(--text-muted);background:none;border:none;cursor:pointer;"
                    >
                      + Addendum
                    </button>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Pagination -->
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);overflow:hidden;box-shadow:var(--shadow-xs);">
            ${renderPaginationControls(contractPagination, [2, 4, 8], 'legal-contracts-pagination')}
          </div>
        </div>
      `
          : ''
      }

      <!-- TAB 2: LIBRARY 22 PASAL MOU SOFTWARE HOUSE -->
      ${
        activeTab === 'clauses'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Controls Bar -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:16px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="position:relative;width:280px;">
                <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
                  ${ICONS.search}
                </span>
                <input
                  id="legal-search-clause-input"
                  type="text"
                  placeholder="Cari pasal, kata kunci HAKI, SLA, garansi..."
                  value="${searchTerm}"
                  style="width:100%;padding:8px 12px 8px 36px;border-radius:var(--radius-xl);font-size:12px;background:var(--bg-surface);border:1px solid transparent;color:var(--text-primary);outline:none;"
                />
              </div>

              <span style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono);">
                Total: <strong>${clausesList.length} Pasal</strong>
              </span>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <button
                id="legal-reset-clauses-btn"
                style="padding:6px 12px;border-radius:var(--radius-xl);font-size:12px;font-weight:600;color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-light);cursor:pointer;display:flex;align-items:center;gap:6px;"
              >
                ${ICONS.rotateCcw}
                <span>Reset Baku</span>
              </button>
              <button
                id="legal-export-clauses-btn"
                style="padding:6px 12px;border-radius:var(--radius-xl);font-size:12px;font-weight:700;color:var(--indigo-600);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);cursor:pointer;display:flex;align-items:center;gap:6px;"
              >
                ${ICONS.printer}
                <span>Export 22 Pasal</span>
              </button>
              <button
                id="legal-add-clause-btn"
                style="padding:6px 14px;border-radius:var(--radius-xl);font-size:12px;font-weight:700;color:#fff;background:var(--indigo-600);border:none;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(99,102,241,.25);"
              >
                ${ICONS.plus}
                <span>+ Tambah Pasal</span>
              </button>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div style="display:flex;align-items:center;gap:6px;overflow-x:auto;padding-bottom:4px;font-size:11px;">
            ${categories
              .map(
                (cat) => `
              <button
                class="legal-cat-btn ${selectedCategory === cat ? 'active' : ''}"
                data-cat="${cat}"
                style="padding:6px 12px;border-radius:var(--radius-xl);white-space:nowrap;border:none;cursor:pointer;transition:all var(--transition);${
                  selectedCategory === cat
                    ? 'background:var(--indigo-600);color:#fff;font-weight:700;'
                    : 'background:var(--bg-card);color:var(--text-secondary);border:1px solid var(--border-light);'
                }"
              >
                ${cat === 'all' ? `Semua Pasal (${clausesList.length})` : cat}
              </button>
            `
              )
              .join('')}
          </div>

          <!-- Clauses Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(400px, 1fr));gap:16px;">
            ${pagedClauses
              .map(
                (clause) => `
              <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;box-shadow:var(--shadow-xs);">
                <div>
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;border-bottom:1px solid var(--border-light);padding-bottom:10px;">
                    <div>
                      <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
                        ${clause.category || 'Umum'}
                      </span>
                      <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:6px 0 0 0;">
                        ${clause.title}
                      </h4>
                    </div>

                    <div style="display:flex;align-items:center;gap:4px;">
                      <button
                        class="clause-copy-btn"
                        data-clause-id="${clause.id}"
                        style="padding:6px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;"
                        title="Salin isi pasal ke clipboard"
                      >
                        ${ICONS.copy}
                      </button>
                      <button
                        class="clause-edit-btn"
                        data-clause-id="${clause.id}"
                        style="padding:6px;border-radius:var(--radius-md);color:var(--indigo-600);background:none;border:none;cursor:pointer;"
                        title="Edit redaksional pasal"
                      >
                        ${ICONS.edit}
                      </button>
                    </div>
                  </div>

                  <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin:12px 0 0 0;text-align:justify;">
                    ${clause.body}
                  </p>
                </div>

                <div style="padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;">
                  <button
                    class="clause-toggle-mandatory-btn"
                    data-clause-id="${clause.id}"
                    style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;border:none;cursor:pointer;${
                      clause.is_mandatory !== false
                        ? 'background:rgba(239,68,68,.1);color:var(--rose-600);border:1px solid rgba(239,68,68,.2);'
                        : 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                    }"
                  >
                    ${clause.is_mandatory !== false ? '● Klausul Wajib' : '○ Dapat Dinegosiasikan'}
                  </button>

                  <span style="color:var(--emerald-600);font-weight:600;display:flex;align-items:center;gap:4px;">
                    ${ICONS.checkCircle}
                    <span>Terverifikasi Legal ASTACODE</span>
                  </span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Pagination -->
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);overflow:hidden;box-shadow:var(--shadow-xs);">
            ${renderPaginationControls(clausePagination, [4, 6, 12, 22], 'legal-clauses-pagination')}
          </div>
        </div>
      `
          : ''
      }

      <!-- TAB 3: GENERATOR DOKUMEN 4-PART MOU & SPK -->
      ${
        activeTab === 'mou_preview'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Controls Bar -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:16px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Pilih Kontrak / Proyek:</span>
              <select
                id="doc-project-select"
                style="padding:8px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);font-size:12px;font-weight:600;color:var(--text-primary);outline:none;cursor:pointer;"
              >
                ${projects
                  .map(
                    (pr) => `
                  <option value="${pr.id}" ${pr.id === selectedProjectForDoc.id ? 'selected' : ''}>
                    ${pr.contract_number} - ${pr.customer_name} (${pr.title.slice(0, 35)}...)
                  </option>
                `
                  )
                  .join('')}
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <!-- Part filter buttons -->
              <div style="display:flex;align-items:center;gap:4px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-xl);font-size:11px;font-weight:600;">
                <button class="doc-part-btn ${docPart === 'all' ? 'active' : ''}" data-part="all" style="padding:4px 10px;border-radius:var(--radius-lg);border:none;cursor:pointer;${docPart === 'all' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);' : 'background:none;color:var(--text-muted);'}">Semua 4 Bagian</button>
                <button class="doc-part-btn ${docPart === 'surat' ? 'active' : ''}" data-part="surat" style="padding:4px 10px;border-radius:var(--radius-lg);border:none;cursor:pointer;${docPart === 'surat' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);' : 'background:none;color:var(--text-muted);'}">1. Surat</button>
                <button class="doc-part-btn ${docPart === 'rab' ? 'active' : ''}" data-part="rab" style="padding:4px 10px;border-radius:var(--radius-lg);border:none;cursor:pointer;${docPart === 'rab' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);' : 'background:none;color:var(--text-muted);'}">2. Scope & RAB</button>
                <button class="doc-part-btn ${docPart === 'klausul' ? 'active' : ''}" data-part="klausul" style="padding:4px 10px;border-radius:var(--radius-lg);border:none;cursor:pointer;${docPart === 'klausul' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);' : 'background:none;color:var(--text-muted);'}">3. 22 Pasal MoU</button>
                <button class="doc-part-btn ${docPart === 'esign' ? 'active' : ''}" data-part="esign" style="padding:4px 10px;border-radius:var(--radius-lg);border:none;cursor:pointer;${docPart === 'esign' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);' : 'background:none;color:var(--text-muted);'}">4. E-Sign Sah</button>
              </div>

              <button
                id="doc-print-btn"
                style="padding:8px 14px;border-radius:var(--radius-xl);font-size:12px;font-weight:700;color:#fff;background:var(--indigo-600);border:none;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(99,102,241,.25);"
              >
                ${ICONS.printer}
                <span>Cetak Dokumen Resmi</span>
              </button>
            </div>
          </div>

          <!-- Official Paper Layout Viewport -->
          <div style="background:var(--bg-card);border-radius:var(--radius-3xl);border:1px solid var(--border-light);padding:40px;box-shadow:var(--shadow-md);display:flex;flex-direction:column;gap:36px;max-width:880px;margin:0 auto;position:relative;">
            
            <!-- PART 1: SURAT PENGANTAR RESMI -->
            ${
              docPart === 'all' || docPart === 'surat'
                ? `
              <div style="display:flex;flex-direction:column;gap:20px;border-bottom:1px solid var(--border-light);padding-bottom:32px;">
                <!-- Letterhead -->
                <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--indigo-600);padding-bottom:16px;">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div style="width:32px;height:32px;border-radius:var(--radius-md);background:var(--indigo-600);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px;">
                        A
                      </div>
                      <h2 style="font-size:16px;font-weight:900;letter-spacing:-0.01em;color:var(--text-primary);margin:0;">
                        PT ASTACODE SOLUSINDO TEKNOLOGI
                      </h2>
                    </div>
                    <p style="font-size:11px;color:var(--text-muted);margin:0;">
                      Enterprise Software Engineering • Cloud Architecture • Cyber Security Integration
                    </p>
                    <p style="font-size:10px;color:var(--text-muted);margin:0;">
                      Grand Slipi Tower Lt. 28, Jl. Letjen S. Parman, Jakarta Barat 11480 • www.astacode.com
                    </p>
                  </div>

                  <div style="text-align:right;font-size:12px;font-family:var(--font-mono);">
                    <p style="font-weight:700;color:var(--text-primary);margin:0;">
                      Nomor: ${selectedProjectForDoc.contract_number || 'SPK/2026/10/0042'}
                    </p>
                    <p style="color:var(--text-muted);font-size:11px;margin:2px 0 0 0;">
                      Tanggal: ${selectedProjectForDoc.start_date || '15 Oktober 2026'}
                    </p>
                    <span style="display:inline-block;padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);margin-top:4px;">
                      Sah & Tersertifikasi Digital
                    </span>
                  </div>
                </div>

                <!-- Recipient Info -->
                <div style="font-size:12px;display:flex;flex-direction:column;gap:2px;">
                  <p style="font-weight:700;color:var(--text-secondary);margin:0;">Kepada Yth,</p>
                  <p style="font-weight:800;font-size:14px;color:var(--text-primary);margin:0;">
                    Direksi / Manajemen ${selectedProjectForDoc.customer_name}
                  </p>
                  <p style="color:var(--text-muted);margin:4px 0 0 0;">
                    Perihal: <strong>Perjanjian Kerja Sama Pengembangan Sistem (${selectedProjectForDoc.title})</strong>
                  </p>
                </div>

                <div style="font-size:12px;line-height:1.7;color:var(--text-secondary);display:flex;flex-direction:column;gap:12px;text-align:justify;">
                  <p style="margin:0;">Dengan hormat,</p>
                  <p style="margin:0;">
                    Menindaklanjuti kesepakatan ruang lingkup analisis kebutuhan bisnis dan spesifikasi teknis arsitektur perangkat lunak, bersama surat ini kami dari <strong>PT ASTACODE SOLUSINDO TEKNOLOGI</strong> menyampaikan dokumen kesepakatan kerja sama (Memorandum of Understanding & Surat Perjanjian Kerja) untuk pelaksanaan proyek <strong>${selectedProjectForDoc.title}</strong>.
                  </p>
                  <p style="margin:0;">
                    Pengembangan ini dirancang secara komprehensif mencakup deliverable modul transaksional, integrasi REST API, modul pengamanan siber, garansi pemeliharaan cacat program selama <strong>${selectedProjectForDoc.warranty_period || '90 Hari'}</strong> pasca BAST, serta komitmen <strong>${selectedProjectForDoc.sla_level || '99.5% Uptime SLA'}</strong> dengan kepatuhan penuh terhadap UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
                  </p>
                </div>
              </div>
            `
                : ''
            }

            <!-- PART 2: RINCIAN SCOPE RAB & TERMIN TOP -->
            ${
              docPart === 'all' || docPart === 'rab'
                ? `
              <div style="display:flex;flex-direction:column;gap:16px;border-bottom:1px solid var(--border-light);padding-bottom:32px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div>
                    <span style="font-size:10px;text-transform:uppercase;font-weight:800;color:var(--indigo-600);display:block;">BAGIAN II</span>
                    <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:2px 0 0 0;">
                      Rencana Anggaran Biaya (RAB), Deliverables & Termin Pembayaran
                    </h3>
                  </div>
                  <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--text-muted);">
                    Alokasi: ${selectedProjectForDoc.budget_mandays} Mandays
                  </span>
                </div>

                <!-- Summary Table -->
                <div style="border-radius:var(--radius-xl);border:1px solid var(--border-light);overflow:hidden;font-size:12px;">
                  <table style="width:100%;text-align:left;border-collapse:collapse;">
                    <thead style="background:var(--bg-surface);font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">
                      <tr>
                        <th style="padding:12px 14px;">Komponen Kesepakatan</th>
                        <th style="padding:12px 14px;">Rincian / Scope</th>
                        <th style="padding:12px 14px;text-align:right;">Nilai / Alokasi</th>
                      </tr>
                    </thead>
                    <tbody style="border-top:1px solid var(--border-light);color:var(--text-secondary);">
                      <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:12px 14px;font-weight:600;">Paket Solusi Sistem</td>
                        <td style="padding:12px 14px;">${selectedProjectForDoc.title}</td>
                        <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:700;">${selectedProjectForDoc.budget_mandays} Mandays</td>
                      </tr>
                      <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:12px 14px;font-weight:600;">Skema Termin (TOP)</td>
                        <td style="padding:12px 14px;">${selectedProjectForDoc.top_scheme.preset_name} (${(selectedProjectForDoc.top_scheme.items || []).length} Tahap)</td>
                        <td style="padding:12px 14px;text-align:right;color:var(--indigo-600);font-weight:700;">Bertahap per Milestone</td>
                      </tr>
                      <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:12px 14px;font-weight:600;">Garansi & SLA Pasca BAST</td>
                        <td style="padding:12px 14px;">${selectedProjectForDoc.warranty_period || '90 Hari Pasca BAST'} • ${selectedProjectForDoc.sla_level || '99.5% Uptime'}</td>
                        <td style="padding:12px 14px;text-align:right;color:var(--emerald-600);font-weight:700;">Termasuk dalam Kontrak</td>
                      </tr>
                      <tr style="background:rgba(99,102,241,.08);font-weight:700;">
                        <td style="padding:12px 14px;color:var(--indigo-700);">Total Investasi Proyek (Termasuk PPN 11%)</td>
                        <td style="padding:12px 14px;color:var(--text-muted);font-weight:400;font-style:italic;">
                          "${terbilang(selectedProjectForDoc.contract_value)} Rupiah"
                        </td>
                        <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-size:14px;color:var(--emerald-600);">
                          ${formatRupiah(selectedProjectForDoc.contract_value)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Termin breakdown pills -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;font-size:12px;">
                  ${(selectedProjectForDoc.top_scheme.items || [])
                    .map(
                      (term, i) => `
                    <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:4px;">
                      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:11px;">
                        <span>Termin ${i + 1} (${term.value}%)</span>
                        <span style="color:var(--emerald-600);">${term.status}</span>
                      </div>
                      <p style="font-size:10px;color:var(--text-muted);margin:0;">${term.name}</p>
                      <p style="font-family:var(--font-mono);font-weight:700;color:var(--text-primary);margin:2px 0 0 0;">
                        ${formatRupiah((selectedProjectForDoc.contract_value * term.value) / 100)}
                      </p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- PART 3: KUMPULAN 22 PASAL STANDAR MOU -->
            ${
              docPart === 'all' || docPart === 'klausul'
                ? `
              <div style="display:flex;flex-direction:column;gap:16px;border-bottom:1px solid var(--border-light);padding-bottom:32px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div>
                    <span style="font-size:10px;text-transform:uppercase;font-weight:800;color:var(--indigo-600);display:block;">BAGIAN III</span>
                    <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:2px 0 0 0;">
                      Kumpulan 22 Pasal Standar Syarat & Ketentuan MoU Software House
                    </h3>
                  </div>
                  <span style="font-size:12px;font-family:var(--font-mono);color:var(--text-muted);">22 Klausul Hukum Baku</span>
                </div>

                <div style="display:flex;flex-direction:column;gap:12px;font-size:12px;">
                  ${clausesList
                    .map(
                      (clause) => `
                    <div style="padding:14px 16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:4px;">
                      <h4 style="font-weight:800;color:var(--text-primary);margin:0;">
                        ${clause.title}
                      </h4>
                      <p style="color:var(--text-secondary);line-height:1.6;text-align:justify;font-size:11px;margin:2px 0 0 0;">
                        ${clause.body}
                      </p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- PART 4: LEMBAR PENGESAHAN DUA BELAH PIHAK & E-SIGN -->
            ${
              docPart === 'all' || docPart === 'esign'
                ? `
              <div style="display:flex;flex-direction:column;gap:20px;padding-top:8px;">
                <div style="text-align:center;">
                  <span style="font-size:10px;text-transform:uppercase;font-weight:800;color:var(--indigo-600);display:block;">BAGIAN IV</span>
                  <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:2px 0 0 0;">
                    Lembar Pengesahan Para Pihak (Certified Digital Signature UU ITE & UU PDP)
                  </h3>
                  <p style="font-size:11px;color:var(--text-muted);margin:4px 0 0 0;">
                    Dokumen ini ditandatangani secara elektronik dan berkekuatan hukum tetap mengikat kedua belah pihak.
                  </p>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:12px;">
                  <!-- Pihak Pertama (Klien) -->
                  <div style="padding:20px;border-radius:var(--radius-2xl);background:var(--bg-surface);border:1px solid var(--border-light);text-align:center;display:flex;flex-direction:column;gap:12px;">
                    <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text-muted);letter-spacing:0.05em;display:block;">
                      PIHAK PERTAMA (KLIEN)
                    </span>
                    <p style="font-weight:800;font-size:12px;color:var(--text-primary);margin:0;">
                      ${selectedProjectForDoc.customer_name}
                    </p>

                    <!-- Signature Box -->
                    <div style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed rgba(16,185,129,.4);background:rgba(16,185,129,.05);border-radius:var(--radius-xl);gap:4px;padding:8px;">
                      <div style="display:flex;align-items:center;gap:6px;color:var(--emerald-600);font-weight:700;font-size:11px;">
                        ${ICONS.checkCircle}
                        <span>Certified Digital Signature</span>
                      </div>
                      <span style="font-size:9px;font-family:var(--font-mono);color:var(--text-muted);">
                        E-Meterai Peruri Rp10.000 Terbubuhi • UU ITE Pasal 11
                      </span>
                    </div>

                    <div>
                      <p style="font-weight:800;font-size:12px;color:var(--text-primary);margin:0;">
                        ${selectedProjectForDoc.signed_by_client || 'Ir. Budi Santoso'}
                      </p>
                      <p style="font-size:10px;color:var(--text-muted);margin:2px 0 0 0;">Direktur Utama / Perwakilan Berwenang</p>
                    </div>
                  </div>

                  <!-- Pihak Kedua (ASTACODE) -->
                  <div style="padding:20px;border-radius:var(--radius-2xl);background:var(--bg-surface);border:1px solid var(--border-light);text-align:center;display:flex;flex-direction:column;gap:12px;">
                    <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--text-muted);letter-spacing:0.05em;display:block;">
                      PIHAK KEDUA (ASTACODE)
                    </span>
                    <p style="font-weight:800;font-size:12px;color:var(--text-primary);margin:0;">
                      PT ASTACODE SOLUSINDO TEKNOLOGI
                    </p>

                    <!-- Signature Box -->
                    <div style="height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed rgba(99,102,241,.4);background:rgba(99,102,241,.05);border-radius:var(--radius-xl);gap:4px;padding:8px;">
                      <div style="display:flex;align-items:center;gap:6px;color:var(--indigo-600);font-weight:700;font-size:11px;">
                        ${ICONS.shieldCheck}
                        <span>Certified E-Sign ASTACODE</span>
                      </div>
                      <span style="font-size:9px;font-family:var(--font-mono);color:var(--text-muted);">
                        Digital ID: ASTA-ESIGN-${selectedProjectForDoc.id} • SHA-256 Valid
                      </span>
                    </div>

                    <div>
                      <p style="font-weight:800;font-size:12px;color:var(--text-primary);margin:0;">
                        Asisyah Sarah Azzahra
                      </p>
                      <p style="font-size:10px;color:var(--text-muted);margin:2px 0 0 0;">Super Admin & Project Manager</p>
                    </div>
                  </div>
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `
          : ''
      }

      <!-- TAB 4: AUDIT TRAIL E-SIGNATURE -->
      ${
        activeTab === 'esign_audit'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:24px;display:flex;flex-direction:column;gap:20px;box-shadow:var(--shadow-xs);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:16px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;margin:0;">
                  <span style="color:var(--emerald-500);display:flex;">${ICONS.shieldCheck}</span>
                  <span>Kepatuhan Keabsahan Hukum Elektronik (UU ITE & UU PDP)</span>
                </h3>
                <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0 0;">
                  Seluruh dokumen kontrak, penawaran harga (RAB), dan klausul MoU di ASTACODE dirancang dengan standar sertifikasi elektronik tertinggi.
                </p>
              </div>

              <span style="padding:4px 12px;border-radius:var(--radius-full);font-size:11px;font-weight:700;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);">
                100% Compliance Verified
              </span>
            </div>

            <!-- Compliance 3 Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;font-size:12px;">
              <div style="padding:16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;color:var(--indigo-600);font-weight:700;">
                  ${ICONS.lock}
                  <span>UU ITE Pasal 11</span>
                </div>
                <h4 style="font-weight:700;color:var(--text-primary);margin:0;">Kekuatan Pembuktian Hukum</h4>
                <p style="color:var(--text-muted);font-size:11px;line-height:1.5;margin:0;">
                  Tanda tangan elektronik memiliki akibat hukum dan kekuatan hukum yang sah setara dengan tanda tangan basah di atas kertas bermeterai.
                </p>
              </div>

              <div style="padding:16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;color:var(--indigo-600);font-weight:700;">
                  ${ICONS.award}
                  <span>UU PDP No. 27/2022</span>
                </div>
                <h4 style="font-weight:700;color:var(--text-primary);margin:0;">Kerahasiaan Data Pribadi</h4>
                <p style="color:var(--text-muted);font-size:11px;line-height:1.5;margin:0;">
                  Semua identitas PIC klien, tanda tangan, nomor telepon, dan data finansial dienkripsi berstandar perbankan (AES-256).
                </p>
              </div>

              <div style="padding:16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;color:var(--indigo-600);font-weight:700;">
                  ${ICONS.fileCheck}
                  <span>E-Meterai Resmi Peruri</span>
                </div>
                <h4 style="font-weight:700;color:var(--text-primary);margin:0;">Bea Meterai Digital Rp10.000</h4>
                <p style="color:var(--text-muted);font-size:11px;line-height:1.5;margin:0;">
                  Integrasi e-Meterai resmi Peruri otomatis dibubuhkan pada kontrak di atas Rp5.000.000 sesuai UU Bea Meterai No. 10/2020.
                </p>
              </div>
            </div>

            <!-- Audit Trail Log Table -->
            <div style="display:flex;flex-direction:column;gap:12px;padding-top:12px;">
              <h4 style="font-weight:700;font-size:12px;color:var(--text-primary);margin:0;">
                Log Audit Trail Penandatanganan Terkini:
              </h4>

              <div style="border-radius:var(--radius-xl);border:1px solid var(--border-light);overflow:hidden;font-size:12px;">
                <table style="width:100%;text-align:left;border-collapse:collapse;">
                  <thead style="background:var(--bg-surface);font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">
                    <tr>
                      <th style="padding:12px 14px;">Waktu (WIB)</th>
                      <th style="padding:12px 14px;">Nomor Kontrak</th>
                      <th style="padding:12px 14px;">Penandatangan</th>
                      <th style="padding:12px 14px;">Integritas Dokumen</th>
                      <th style="padding:12px 14px;text-align:right;">Status Sertifikat</th>
                    </tr>
                  </thead>
                  <tbody style="border-top:1px solid var(--border-light);color:var(--text-secondary);">
                    ${projects
                      .map(
                        (p, idx) => `
                      <tr style="border-bottom:1px solid var(--border-light);">
                        <td style="padding:12px 14px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">
                          ${p.signed_at ? new Date(p.signed_at).toLocaleString('id-ID') : '15/10/2026, 14:30:00'}
                        </td>
                        <td style="padding:12px 14px;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);">
                          ${p.contract_number}
                        </td>
                        <td style="padding:12px 14px;">
                          <span style="font-weight:700;color:var(--text-primary);">${p.signed_by_company || 'Asisyah Sarah Azzahra'}</span>
                          <span style="display:block;font-size:10px;color:var(--text-muted);">& ${p.signed_by_client || p.customer_name}</span>
                        </td>
                        <td style="padding:12px 14px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">
                          SHA256: 9f8e7d6c5b4a...${idx}8e7d
                        </td>
                        <td style="padding:12px 14px;text-align:right;">
                          <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);">
                            Valid & Terverifikasi
                          </span>
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 1: BUAT SPK / KONTRAK BARU -->
      ${
        isNewContractOpen
          ? `
        <div id="new-contract-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);overflow-y:auto;">
          <div style="width:100%;max-width:520px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Buat Surat Perjanjian Kerja (SPK) Baru
                </h3>
                <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">
                  PT ASTACODE Solusindo Teknologi • Penanggung Jawab: Asisyah Sarah Azzahra
                </p>
              </div>
              <button id="new-contract-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <form id="new-contract-form" style="display:flex;flex-direction:column;gap:14px;font-size:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Pilih Klien / Customer:</label>
                <select
                  id="new-contract-cust-select"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;font-weight:600;"
                >
                  ${customers
                    .map(
                      (c) => `
                    <option value="${c.id}" ${c.id === selectedCustomerId ? 'selected' : ''}>
                      ${c.legal_name} (${c.code}) - ${c.industry}
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Judul Kontrak / Perjanjian:</label>
                <input
                  id="new-contract-title-input"
                  type="text"
                  required
                  placeholder="Contoh: Perjanjian Pembuatan Sistem ERP & Mobile ESS"
                  value="${contractTitle}"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                />
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Nilai Kontrak (IDR):</label>
                  <input
                    id="new-contract-val-input"
                    type="number"
                    min="0"
                    step="1000000"
                    required
                    value="${contractValue}"
                    style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                  />
                </div>

                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Alokasi Mandays Scope:</label>
                  <input
                    id="new-contract-mandays-input"
                    type="number"
                    min="1"
                    required
                    value="${mandaysScope}"
                    style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                  />
                </div>
              </div>

              <!-- Skema TOP with Lainnya -->
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Skema Termin Pembayaran (TOP):</label>
                <select
                  id="new-contract-top-select"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;font-weight:600;"
                >
                  <option value="30/40/30" ${topSchemeChoice === '30/40/30' ? 'selected' : ''}>30% DP / 40% UAT / 30% BAST (Standard ASTACODE)</option>
                  <option value="50/50" ${topSchemeChoice === '50/50' ? 'selected' : ''}>50% DP / 50% Pelunasan</option>
                  <option value="40/30/30" ${topSchemeChoice === '40/30/30' ? 'selected' : ''}>40% DP / 30% Progress / 30% BAST</option>
                  <option value="30/30/30/10" ${topSchemeChoice === '30/30/30/10' ? 'selected' : ''}>30% DP / 30% Dev / 30% UAT / 10% Retensi Garansi</option>
                  <option value="Lainnya" ${topSchemeChoice === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                </select>

                ${
                  topSchemeChoice === 'Lainnya'
                    ? `
                  <div style="margin-top:6px;padding:10px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);">
                    <label style="display:block;font-size:11px;font-weight:700;color:var(--indigo-600);margin-bottom:4px;">Ketik Skema TOP Kustom:</label>
                    <input
                      id="new-contract-custom-top-input"
                      type="text"
                      required
                      placeholder="Misal: 25% DP / 25% Sprint 2 / 25% UAT / 25% BAST..."
                      value="${customTopScheme}"
                      style="width:100%;padding:6px 10px;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--indigo-400);color:var(--text-primary);outline:none;"
                    />
                  </div>
                `
                    : ''
                }
              </div>

              <!-- Garansi & SLA -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Garansi Bug Pasca BAST:</label>
                  <select
                    id="new-contract-warranty-select"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  >
                    <option value="30 Hari" ${warrantyChoice === '30 Hari' ? 'selected' : ''}>30 Hari Pasca BAST</option>
                    <option value="60 Hari" ${warrantyChoice === '60 Hari' ? 'selected' : ''}>60 Hari Pasca BAST</option>
                    <option value="90 Hari" ${warrantyChoice === '90 Hari' ? 'selected' : ''}>90 Hari Pasca BAST (Rekomendasi ASTACODE)</option>
                    <option value="180 Hari" ${warrantyChoice === '180 Hari' ? 'selected' : ''}>180 Hari Pasca BAST</option>
                    <option value="Lainnya" ${warrantyChoice === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                  </select>

                  ${
                    warrantyChoice === 'Lainnya'
                      ? `
                    <input
                      id="new-contract-custom-warranty-input"
                      type="text"
                      required
                      placeholder="Durasi garansi kustom..."
                      value="${customWarranty}"
                      style="width:100%;margin-top:4px;padding:6px 8px;border-radius:var(--radius-md);background:var(--bg-surface);border:1px solid var(--indigo-300);color:var(--text-primary);font-size:11px;outline:none;"
                    />
                  `
                      : ''
                  }
                </div>

                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Komitmen SLA Dukungan:</label>
                  <select
                    id="new-contract-sla-select"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  >
                    <option value="99.5% Uptime SLA" ${slaChoice === '99.5% Uptime SLA' ? 'selected' : ''}>99.5% Uptime SLA</option>
                    <option value="99.9% High Availability SLA" ${slaChoice === '99.9% High Availability SLA' ? 'selected' : ''}>99.9% High Availability SLA</option>
                    <option value="Response Time < 1 Jam" ${slaChoice === 'Response Time < 1 Jam' ? 'selected' : ''}>Response Time &lt; 1 Jam</option>
                    <option value="Lainnya" ${slaChoice === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                  </select>

                  ${
                    slaChoice === 'Lainnya'
                      ? `
                    <input
                      id="new-contract-custom-sla-input"
                      type="text"
                      required
                      placeholder="Komitmen SLA kustom..."
                      value="${customSla}"
                      style="width:100%;margin-top:4px;padding:6px 8px;border-radius:var(--radius-md);background:var(--bg-surface);border:1px solid var(--indigo-300);color:var(--text-primary);font-size:11px;outline:none;"
                    />
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- Masa Berlaku Dates -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Tanggal Mulai Efektif:</label>
                  <input
                    id="new-contract-start-input"
                    type="date"
                    value="${contractStartDate}"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  />
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Target Serah Terima (BAST):</label>
                  <input
                    id="new-contract-end-input"
                    type="date"
                    value="${contractEndDate}"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  />
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
                <button
                  type="button"
                  id="new-contract-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
                >
                  Terbitkan Kontrak SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 2: DETAIL SPK KONTRAK -->
      ${
        selectedContractForDetail
          ? `
        <div id="detail-contract-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);overflow-y:auto;">
          <div style="width:100%;max-width:640px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;max-height:90vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--indigo-600);">
                  ${selectedContractForDetail.contract_number}
                </span>
                <h3 style="font-size:16px;font-weight:800;color:var(--text-primary);margin:2px 0 0 0;">
                  ${selectedContractForDetail.title}
                </h3>
              </div>
              <button id="detail-contract-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <div style="display:flex;flex-direction:column;gap:16px;font-size:12px;">
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:12px;padding:14px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);">
                <div>
                  <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Klien:</span>
                  <span style="font-weight:700;color:var(--text-primary);">${selectedContractForDetail.customer_name}</span>
                </div>
                <div>
                  <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Nilai Kontrak:</span>
                  <span style="font-family:var(--font-mono);font-weight:700;color:var(--emerald-600);">${formatRupiah(selectedContractForDetail.contract_value)}</span>
                </div>
                <div>
                  <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Garansi:</span>
                  <span style="font-weight:600;color:var(--text-primary);">${selectedContractForDetail.warranty_period || '90 Hari'}</span>
                </div>
                <div>
                  <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">E-Sign Status:</span>
                  <span style="font-weight:700;color:var(--emerald-600);">${selectedContractForDetail.esign_status || 'Sah UU ITE'}</span>
                </div>
              </div>

              <div>
                <h4 style="font-weight:700;color:var(--text-primary);margin:0 0 8px 0;">Jadwal & Milestone Sprint:</h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${(selectedContractForDetail.milestones || [])
                    .map(
                      (ms) => `
                    <div style="padding:10px 12px;border-radius:var(--radius-lg);border:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;">
                      <div>
                        <span style="font-weight:700;color:var(--text-primary);">${ms.name}</span>
                        <span style="display:block;font-size:10px;color:var(--text-muted);">Target: ${ms.target_date} • ${ms.mandays_budget} Mandays</span>
                      </div>
                      <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;${
                        ms.status === 'Completed'
                          ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);'
                          : 'background:var(--bg-surface);color:var(--text-secondary);'
                      }">
                        ${ms.status}
                      </span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
              <button
                id="detail-contract-cancel-btn"
                style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-light);font-semibold;font-size:12px;cursor:pointer;"
              >
                Tutup
              </button>
              <button
                id="detail-contract-open-doc-btn"
                style="padding:8px 16px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;"
              >
                Buka di Dokumen 4-Part
              </button>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 3: E-SIGNATURE INTERAKTIF -->
      ${
        selectedContractForSign
          ? `
        <div id="sign-contract-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);">
          <div style="width:100%;max-width:440px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--emerald-500);display:flex;">${ICONS.penTool}</span>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Pengesahan Tanda Tangan Digital (E-Sign)
                </h3>
              </div>
              <button id="sign-contract-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;font-size:12px;">
              <p style="color:var(--text-secondary);margin:0;">
                Anda akan menandatangani dokumen kontrak <strong>${selectedContractForSign.contract_number}</strong> secara elektronik atas nama:
              </p>

              <div style="padding:12px;border-radius:var(--radius-xl);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);display:flex;flex-direction:column;gap:2px;">
                <span style="font-size:10px;color:var(--indigo-600);text-transform:uppercase;font-weight:700;">Penandatangan Resmi ASTACODE:</span>
                <p style="font-weight:800;color:var(--text-primary);margin:0;">Asisyah Sarah Azzahra</p>
                <p style="font-size:11px;color:var(--text-muted);margin:0;">Super Admin & Project Manager • PT ASTACODE SOLUSINDO TEKNOLOGI</p>
              </div>

              <!-- Signature Canvas Mock -->
              <div style="height:100px;border-radius:var(--radius-xl);border:2px dashed var(--border-light);background:var(--bg-surface);display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-muted);font-family:var(--font-mono);font-size:11px;gap:4px;">
                <span style="font-style:italic;font-family:serif;font-size:20px;color:var(--indigo-600);">Asisyah Sarah Azzahra</span>
                <span style="font-size:9px;color:var(--emerald-600);font-weight:700;">✔ Hash Sertifikat X.509 Terintegrasi</span>
              </div>

              <div style="font-size:10px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
                <span style="color:var(--emerald-500);display:flex;">${ICONS.shieldCheck}</span>
                <span>Memenuhi Pasal 11 UU ITE No. 11/2008 & UU PDP No. 27/2022. Memiliki keabsahan hukum penuh.</span>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
              <button
                id="sign-contract-cancel-btn"
                style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;font-size:12px;"
              >
                Batal
              </button>
              <button
                id="sign-contract-confirm-btn"
                style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--emerald-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,.3);display:flex;align-items:center;gap:6px;"
              >
                ${ICONS.check}
                <span>Bubuhkan Tanda Tangan Digital</span>
              </button>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 4: BUAT ADDENDUM KONTRAK -->
      ${
        selectedContractForAddendum
          ? `
        <div id="addendum-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);">
          <div style="width:100%;max-width:440px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Buat Addendum Kontrak ${selectedContractForAddendum.contract_number}
                </h3>
                <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">${selectedContractForAddendum.customer_name}</p>
              </div>
              <button id="addendum-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <form id="addendum-form" style="display:flex;flex-direction:column;gap:12px;font-size:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Deskripsi Perubahan Scope / Addendum:</label>
                <textarea
                  id="addendum-desc-input"
                  rows="3"
                  required
                  placeholder="Contoh: Penambahan integrasi Payment Gateway QRIS & Biometric Face Recognition pada modul kasir..."
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;font-sans;"
                >${addendumDesc}</textarea>
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Penyesuaian Nilai Tambah (IDR):</label>
                <input
                  id="addendum-val-input"
                  type="number"
                  min="0"
                  step="1000000"
                  value="${addendumValue}"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                />
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
                <button
                  type="button"
                  id="addendum-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;font-size:12px;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
                >
                  Simpan & Terbitkan Addendum
                </button>
              </div>
            </form>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 5: EDIT CLAUSE -->
      ${
        editingClause
          ? `
        <div id="edit-clause-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);">
          <div style="width:100%;max-width:520px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
              Edit ${editingClause.title}
            </h3>

            <div style="display:flex;flex-direction:column;gap:12px;font-size:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Judul Pasal:</label>
                <input
                  id="edit-clause-title-input"
                  type="text"
                  value="${editingClause.title}"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;font-weight:700;"
                />
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Isi Redaksional Pasal MoU:</label>
                <textarea
                  id="edit-clause-body-input"
                  rows="6"
                  style="width:100%;padding:10px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;line-height:1.6;font-sans;"
                >${editingClause.body}</textarea>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
              <button
                id="edit-clause-cancel-btn"
                style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;font-size:12px;"
              >
                Batal
              </button>
              <button
                id="edit-clause-save-btn"
                style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
              >
                Simpan Klausul Legal
              </button>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 6: ADD NEW CLAUSE -->
      ${
        isAddClauseOpen
          ? `
        <div id="add-clause-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);">
          <div style="width:100%;max-width:520px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                + Tambah Pasal Baru ke Library Legal MoU
              </h3>
              <button id="add-clause-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <form id="add-clause-form" style="display:flex;flex-direction:column;gap:12px;font-size:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Kategori Pasal:</label>
                <select
                  id="add-clause-cat-select"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                >
                  <option value="Ruang Lingkup & Deliverable">Ruang Lingkup & Deliverable</option>
                  <option value="Keuangan & Pajak">Keuangan & Pajak</option>
                  <option value="HAKI & Lisensi">HAKI & Lisensi</option>
                  <option value="Kerahasiaan & Keamanan">Kerahasiaan & Keamanan</option>
                  <option value="Garansi & SLA">Garansi & SLA</option>
                  <option value="Hukum & Sengketa">Hukum & Sengketa</option>
                  <option value="Operasional & Infrastruktur">Operasional & Infrastruktur</option>
                  <option value="Kebijakan AI & LLM Data">Kebijakan AI & LLM Data</option>
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Judul Pasal:</label>
                <input
                  id="add-clause-title-input"
                  type="text"
                  required
                  placeholder="Contoh: Kebijakan Penggunaan Model AI & LLM"
                  value="${newClauseTitle}"
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                />
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Isi Naskah Klausul:</label>
                <textarea
                  id="add-clause-body-input"
                  rows="5"
                  required
                  placeholder="Tuliskan isi redaksional klausul hukum yang mengikat para pihak..."
                  style="width:100%;padding:8px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;font-sans;"
                >${newClauseBody}</textarea>
              </div>

              <div style="display:flex;align-items:center;gap:8px;padding-top:4px;">
                <input
                  type="checkbox"
                  id="add-clause-mandatory-chk"
                  ${newClauseMandatory ? 'checked' : ''}
                  style="width:16px;height:16px;cursor:pointer;"
                />
                <label for="add-clause-mandatory-chk" style="color:var(--text-primary);cursor:pointer;">
                  Tandai sebagai <strong>Klausul Wajib (Mandatory)</strong> dalam perjanjian
                </label>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
                <button
                  type="button"
                  id="add-clause-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;font-size:12px;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
                >
                  Simpan Pasal Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL 7: EXPORT KOMPILASI 22 PASAL -->
      ${
        isExportClausesOpen
          ? `
        <div id="export-clauses-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);overflow-y:auto;">
          <div style="width:100%;max-width:760px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;max-height:90vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <h3 style="font-size:16px;font-weight:800;color:var(--text-primary);margin:0;">
                  Naskah Resmi Kompilasi 22 Pasal Standar MoU ASTACODE
                </h3>
                <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
                  Format teks resmi untuk lampiran perjanjian hukum software house.
                </p>
              </div>
              <button id="export-clauses-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <div style="padding:16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:14px;font-size:12px;max-height:55vh;overflow-y:auto;color:var(--text-primary);">
              <div style="text-align:center;font-weight:800;border-bottom:1px solid var(--border-light);padding-bottom:8px;">
                LAMPIRAN SYARAT & KETENTUAN HUKUM (MoU)<br />
                PT ASTACODE SOLUSINDO TEKNOLOGI
              </div>
              ${clausesList
                .map(
                  (cl) => `
                <div style="display:flex;flex-direction:column;gap:2px;">
                  <p style="font-weight:700;color:var(--indigo-600);margin:0;">${cl.title}</p>
                  <p style="color:var(--text-secondary);line-height:1.6;text-align:justify;margin:0;">${cl.body}</p>
                </div>
              `
                )
                .join('')}
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border-light);">
              <button
                id="export-clauses-copy-all-btn"
                style="padding:8px 16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);color:var(--text-primary);font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;"
              >
                ${ICONS.copy}
                <span>Salin Semua Teks</span>
              </button>

              <div style="display:flex;align-items:center;gap:8px;">
                <button
                  id="export-clauses-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;font-size:12px;"
                >
                  Tutup
                </button>
                <button
                  id="export-clauses-print-btn"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;"
                >
                  ${ICONS.printer}
                  <span>Cetak / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;
}

export function bindContractsLegalEvents(container) {
  // Tabs
  container.querySelectorAll('.legal-tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      reRender(container);
    });
  });

  // Search in contracts tab
  const searchContractInput = container.querySelector('#legal-search-contract-input');
  if (searchContractInput) {
    searchContractInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      contractPage = 1;
      reRender(container);
    });
  }

  // Status filter buttons
  container.querySelectorAll('.legal-status-filter-btn[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      statusFilter = btn.dataset.status;
      contractPage = 1;
      reRender(container);
    });
  });

  // Open New Contract Modal
  const openNewContractBtn = container.querySelector('#legal-open-new-contract-btn');
  if (openNewContractBtn) {
    openNewContractBtn.addEventListener('click', () => {
      isNewContractOpen = true;
      reRender(container);
    });
  }

  // Close New Contract Modal
  const closeNewContractBtn = container.querySelector('#new-contract-close-btn');
  const cancelNewContractBtn = container.querySelector('#new-contract-cancel-btn');
  if (closeNewContractBtn) closeNewContractBtn.addEventListener('click', () => { isNewContractOpen = false; reRender(container); });
  if (cancelNewContractBtn) cancelNewContractBtn.addEventListener('click', () => { isNewContractOpen = false; reRender(container); });

  // New Contract Selects & Inputs
  const custSelect = container.querySelector('#new-contract-cust-select');
  if (custSelect) custSelect.addEventListener('change', (e) => (selectedCustomerId = e.target.value));
  const titleInput = container.querySelector('#new-contract-title-input');
  if (titleInput) titleInput.addEventListener('input', (e) => (contractTitle = e.target.value));
  const valInput = container.querySelector('#new-contract-val-input');
  if (valInput) valInput.addEventListener('input', (e) => (contractValue = Number(e.target.value)));
  const mandaysInput = container.querySelector('#new-contract-mandays-input');
  if (mandaysInput) mandaysInput.addEventListener('input', (e) => (mandaysScope = Number(e.target.value)));

  const topSelect = container.querySelector('#new-contract-top-select');
  if (topSelect) {
    topSelect.addEventListener('change', (e) => {
      topSchemeChoice = e.target.value;
      reRender(container);
    });
  }
  const customTopInput = container.querySelector('#new-contract-custom-top-input');
  if (customTopInput) customTopInput.addEventListener('input', (e) => (customTopScheme = e.target.value));

  const warrantySelect = container.querySelector('#new-contract-warranty-select');
  if (warrantySelect) {
    warrantySelect.addEventListener('change', (e) => {
      warrantyChoice = e.target.value;
      reRender(container);
    });
  }
  const customWarrantyInput = container.querySelector('#new-contract-custom-warranty-input');
  if (customWarrantyInput) customWarrantyInput.addEventListener('input', (e) => (customWarranty = e.target.value));

  const slaSelect = container.querySelector('#new-contract-sla-select');
  if (slaSelect) {
    slaSelect.addEventListener('change', (e) => {
      slaChoice = e.target.value;
      reRender(container);
    });
  }
  const customSlaInput = container.querySelector('#new-contract-custom-sla-input');
  if (customSlaInput) customSlaInput.addEventListener('input', (e) => (customSla = e.target.value));

  const startInput = container.querySelector('#new-contract-start-input');
  if (startInput) startInput.addEventListener('input', (e) => (contractStartDate = e.target.value));
  const endInput = container.querySelector('#new-contract-end-input');
  if (endInput) endInput.addEventListener('input', (e) => (contractEndDate = e.target.value));

  // Submit New Contract Form
  const newContractForm = container.querySelector('#new-contract-form');
  if (newContractForm) {
    newContractForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { customers } = store.getState();
      const finalTop = topSchemeChoice === 'Lainnya' ? (customTopScheme.trim() || 'Skema TOP Kustom') : topSchemeChoice;
      const finalWarranty = warrantyChoice === 'Lainnya' ? (customWarranty.trim() || 'Garansi Kustom') : warrantyChoice;
      const finalSla = slaChoice === 'Lainnya' ? (customSla.trim() || 'SLA Kustom') : slaChoice;

      const selectedCust = customers.find((c) => c.id === selectedCustomerId) || customers[0];

      const created = store.addNewProject({
        title: contractTitle || 'Perjanjian Proyek Baru',
        customer_id: selectedCust.id,
        customer_name: selectedCust.legal_name,
        contract_value: contractValue || 100000000,
        budget_mandays: mandaysScope || 80,
        start_date: contractStartDate,
        end_date: contractEndDate,
        warranty_period: finalWarranty,
        sla_level: finalSla,
        status: 'Active',
        pm_name: 'Asisyah Sarah Azzahra',
        esign_status: 'Terverifikasi Sah UU ITE',
        signed_by_client: (selectedCust.contacts && selectedCust.contacts[0]?.name) || 'Direktur Klien',
        signed_by_company: 'Asisyah Sarah Azzahra (Super Admin & PM ASTACODE)',
        signed_at: new Date().toISOString(),
      });

      isNewContractOpen = false;
      selectedProjectForDocId = created.id;

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Kontrak SPK "${created.contract_number}" untuk ${selectedCust.legal_name} berhasil diterbitkan!`,
            type: 'success',
          },
        })
      );

      reRender(container);
    });
  }

  // Contract Card Actions
  container.querySelectorAll('.legal-detail-btn[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedContractForDetailId = btn.dataset.projectId;
      reRender(container);
    });
  });

  const closeDetailBtn = container.querySelector('#detail-contract-close-btn');
  const cancelDetailBtn = container.querySelector('#detail-contract-cancel-btn');
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => { selectedContractForDetailId = null; reRender(container); });
  if (cancelDetailBtn) cancelDetailBtn.addEventListener('click', () => { selectedContractForDetailId = null; reRender(container); });

  const openDocFromDetailBtn = container.querySelector('#detail-contract-open-doc-btn');
  if (openDocFromDetailBtn) {
    openDocFromDetailBtn.addEventListener('click', () => {
      selectedProjectForDocId = selectedContractForDetailId;
      selectedContractForDetailId = null;
      activeTab = 'mou_preview';
      reRender(container);
    });
  }

  container.querySelectorAll('.legal-open-doc-btn[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedProjectForDocId = btn.dataset.projectId;
      activeTab = 'mou_preview';
      reRender(container);
    });
  });

  // E-Sign Modal
  container.querySelectorAll('.legal-esign-btn[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedContractForSignId = btn.dataset.projectId;
      reRender(container);
    });
  });

  const closeSignBtn = container.querySelector('#sign-contract-close-btn');
  const cancelSignBtn = container.querySelector('#sign-contract-cancel-btn');
  if (closeSignBtn) closeSignBtn.addEventListener('click', () => { selectedContractForSignId = null; reRender(container); });
  if (cancelSignBtn) cancelSignBtn.addEventListener('click', () => { selectedContractForSignId = null; reRender(container); });

  const confirmSignBtn = container.querySelector('#sign-contract-confirm-btn');
  if (confirmSignBtn) {
    confirmSignBtn.addEventListener('click', () => {
      const { projects } = store.getState();
      const proj = projects.find((p) => p.id === selectedContractForSignId);
      if (proj) {
        proj.esign_status = 'Terverifikasi Sah UU ITE';
        proj.signed_at = new Date().toISOString();
        proj.signed_by_company = 'Asisyah Sarah Azzahra (Super Admin & PM ASTACODE)';
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: {
              message: `Dokumen kontrak ${proj.contract_number} berhasil ditandatangani secara digital & bersertifikat UU ITE!`,
              type: 'success',
            },
          })
        );
      }
      selectedContractForSignId = null;
      reRender(container);
    });
  }

  // Addendum Modal
  container.querySelectorAll('.legal-addendum-btn[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedContractForAddendumId = btn.dataset.projectId;
      reRender(container);
    });
  });

  const closeAddendumBtn = container.querySelector('#addendum-close-btn');
  const cancelAddendumBtn = container.querySelector('#addendum-cancel-btn');
  if (closeAddendumBtn) closeAddendumBtn.addEventListener('click', () => { selectedContractForAddendumId = null; reRender(container); });
  if (cancelAddendumBtn) cancelAddendumBtn.addEventListener('click', () => { selectedContractForAddendumId = null; reRender(container); });

  const addendumForm = container.querySelector('#addendum-form');
  if (addendumForm) {
    addendumForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { projects } = store.getState();
      const proj = projects.find((p) => p.id === selectedContractForAddendumId);
      if (proj) {
        const addendumNo = `ADD/${proj.contract_number.replace('CT/', '')}-01`;
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: {
              message: `Addendum ${addendumNo} senilai ${formatRupiah(addendumValue)} berhasil dibuat dan dilampirkan ke kontrak utama!`,
              type: 'success',
            },
          })
        );
      }
      selectedContractForAddendumId = null;
      addendumDesc = '';
      reRender(container);
    });
  }
  const addendumDescInput = container.querySelector('#addendum-desc-input');
  if (addendumDescInput) addendumDescInput.addEventListener('input', (e) => (addendumDesc = e.target.value));
  const addendumValInput = container.querySelector('#addendum-val-input');
  if (addendumValInput) addendumValInput.addEventListener('input', (e) => (addendumValue = Number(e.target.value)));

  // Clauses Tab Events
  const searchClauseInput = container.querySelector('#legal-search-clause-input');
  if (searchClauseInput) {
    searchClauseInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      clausePage = 1;
      reRender(container);
    });
  }

  // Reset Clauses
  const resetClausesBtn = container.querySelector('#legal-reset-clauses-btn');
  if (resetClausesBtn) {
    resetClausesBtn.addEventListener('click', () => {
      if (confirm('Kembalikan seluruh 22 pasal ke redaksional standar baku ASTACODE?')) {
        clausesList = [...STANDARD_MOU_CLAUSES];
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: { message: 'Klausul berhasil direset ke standar baku 22 Pasal ASTACODE.', type: 'info' },
          })
        );
        reRender(container);
      }
    });
  }

  // Export Clauses Modal
  const exportClausesBtn = container.querySelector('#legal-export-clauses-btn');
  if (exportClausesBtn) {
    exportClausesBtn.addEventListener('click', () => {
      isExportClausesOpen = true;
      reRender(container);
    });
  }
  const closeExportBtn = container.querySelector('#export-clauses-close-btn');
  const cancelExportBtn = container.querySelector('#export-clauses-cancel-btn');
  if (closeExportBtn) closeExportBtn.addEventListener('click', () => { isExportClausesOpen = false; reRender(container); });
  if (cancelExportBtn) cancelExportBtn.addEventListener('click', () => { isExportClausesOpen = false; reRender(container); });

  const copyAllClausesBtn = container.querySelector('#export-clauses-copy-all-btn');
  if (copyAllClausesBtn) {
    copyAllClausesBtn.addEventListener('click', () => {
      const fullText = clausesList.map((c) => `${c.title}\n${c.body}`).join('\n\n');
      navigator.clipboard.writeText(fullText);
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { message: 'Seluruh naskah 22 pasal berhasil disalin ke clipboard!', type: 'success' },
        })
      );
    });
  }
  const printExportBtn = container.querySelector('#export-clauses-print-btn');
  if (printExportBtn) printExportBtn.addEventListener('click', () => window.print());

  // Category Filter Pills
  container.querySelectorAll('.legal-cat-btn[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat;
      clausePage = 1;
      reRender(container);
    });
  });

  // Copy Single Clause
  container.querySelectorAll('.clause-copy-btn[data-clause-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cl = clausesList.find((c) => c.id === btn.dataset.clauseId);
      if (cl) {
        const text = `${cl.title}\n\n${cl.body}\n\n[Diterbitkan oleh Legal ASTACODE - PT ASTACODE Solusindo Teknologi]`;
        navigator.clipboard.writeText(text);
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: { message: `✔ Teks ${cl.title} berhasil disalin ke clipboard!`, type: 'success' },
          })
        );
      }
    });
  });

  // Edit Single Clause Modal
  container.querySelectorAll('.clause-edit-btn[data-clause-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      editingClauseId = btn.dataset.clauseId;
      reRender(container);
    });
  });

  const cancelEditClauseBtn = container.querySelector('#edit-clause-cancel-btn');
  if (cancelEditClauseBtn) {
    cancelEditClauseBtn.addEventListener('click', () => {
      editingClauseId = null;
      reRender(container);
    });
  }

  const saveEditClauseBtn = container.querySelector('#edit-clause-save-btn');
  if (saveEditClauseBtn) {
    saveEditClauseBtn.addEventListener('click', () => {
      const titleIn = container.querySelector('#edit-clause-title-input');
      const bodyIn = container.querySelector('#edit-clause-body-input');
      if (titleIn && bodyIn && editingClauseId) {
        clausesList = clausesList.map((c) =>
          c.id === editingClauseId ? { ...c, title: titleIn.value, body: bodyIn.value } : c
        );
        editingClauseId = null;
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: { message: 'Klausul hukum berhasil disimpan ke legal repository ASTACODE.', type: 'success' },
          })
        );
        reRender(container);
      }
    });
  }

  // Toggle Clause Mandatory
  container.querySelectorAll('.clause-toggle-mandatory-btn[data-clause-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      clausesList = clausesList.map((c) =>
        c.id === btn.dataset.clauseId ? { ...c, is_mandatory: !c.is_mandatory } : c
      );
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { message: 'Status wajib/fleksibel klausul berhasil diperbarui.', type: 'info' },
        })
      );
      reRender(container);
    });
  });

  // Add Clause Modal
  const openAddClauseBtn = container.querySelector('#legal-add-clause-btn');
  if (openAddClauseBtn) {
    openAddClauseBtn.addEventListener('click', () => {
      isAddClauseOpen = true;
      reRender(container);
    });
  }
  const closeAddClauseBtn = container.querySelector('#add-clause-close-btn');
  const cancelAddClauseBtn = container.querySelector('#add-clause-cancel-btn');
  if (closeAddClauseBtn) closeAddClauseBtn.addEventListener('click', () => { isAddClauseOpen = false; reRender(container); });
  if (cancelAddClauseBtn) cancelAddClauseBtn.addEventListener('click', () => { isAddClauseOpen = false; reRender(container); });

  const addClauseForm = container.querySelector('#add-clause-form');
  if (addClauseForm) {
    addClauseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleIn = container.querySelector('#add-clause-title-input');
      const bodyIn = container.querySelector('#add-clause-body-input');
      const catSelect = container.querySelector('#add-clause-cat-select');
      const mandChk = container.querySelector('#add-clause-mandatory-chk');

      if (!titleIn || !bodyIn || !titleIn.value.trim() || !bodyIn.value.trim()) return;

      const nextNum = clausesList.length + 1;
      const newCl = {
        id: `cl-${Date.now()}`,
        number: nextNum,
        title: titleIn.value.startsWith('Pasal') ? titleIn.value : `Pasal ${nextNum}: ${titleIn.value}`,
        body: bodyIn.value,
        is_active: true,
        category: catSelect ? catSelect.value : 'Ruang Lingkup & Deliverable',
        is_mandatory: mandChk ? mandChk.checked : true,
      };

      clausesList.push(newCl);
      isAddClauseOpen = false;
      newClauseTitle = '';
      newClauseBody = '';

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { message: `Pasal baru "${newCl.title}" berhasil ditambahkan ke library.`, type: 'success' },
        })
      );

      reRender(container);
    });
  }

  // Document 4-Part Tab Events
  const docPrjSelect = container.querySelector('#doc-project-select');
  if (docPrjSelect) {
    docPrjSelect.addEventListener('change', (e) => {
      selectedProjectForDocId = e.target.value;
      reRender(container);
    });
  }

  container.querySelectorAll('.doc-part-btn[data-part]').forEach((btn) => {
    btn.addEventListener('click', () => {
      docPart = btn.dataset.part;
      reRender(container);
    });
  });

  const printDocBtn = container.querySelector('#doc-print-btn');
  if (printDocBtn) printDocBtn.addEventListener('click', () => window.print());

  // Pagination bindings
  bindPaginationEvents(
    container,
    (newPage) => {
      contractPage = newPage;
      reRender(container);
    },
    (newPageSize) => {
      contractPageSize = newPageSize;
      contractPage = 1;
      reRender(container);
    },
    'legal-contracts-pagination'
  );

  bindPaginationEvents(
    container,
    (newPage) => {
      clausePage = newPage;
      reRender(container);
    },
    (newPageSize) => {
      clausePageSize = newPageSize;
      clausePage = 1;
      reRender(container);
    },
    'legal-clauses-pagination'
  );
}

function reRender(container) {
  container.innerHTML = renderContractsLegalPage();
  bindContractsLegalEvents(container);
}

export function mount(container) {
  reRender(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'contracts_legal') {
      reRender(container);
    }
  });

  return unsubscribe;
}
