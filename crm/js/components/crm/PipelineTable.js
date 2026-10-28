/**
 * PipelineTable.js — Vanilla JS Dense Pipeline Table Component
 * Converted from src/components/crm/PipelineTable.tsx
 */

import store from '../../store/store.js';
import { PIPELINE_STAGES } from '../../utils/pipelineRules.js';
import { formatRupiah } from '../../utils/topCalculator.js';
import { paginate } from '../../utils/pagination.js';
import { renderPaginationControls, bindPaginationEvents } from '../common/PaginationControls.js';

let searchTerm = '';
let selectedStage = 'ALL';
let currentPage = 1;
let currentPageSize = 5;

const ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
};

let lastFilteredLeads = [];

function exportPipelineCsv(leadsToExport) {
  const headers = ['Kode', 'Judul', 'Customer', 'Nilai (IDR)', 'Stage', 'Sumber', 'PIC', 'Target Closing'];
  const rows = (leadsToExport || []).map((l) => [
    l.code,
    `"${(l.title || '').replace(/"/g, '""')}"`,
    `"${(l.customer ? l.customer.legal_name : '').replace(/"/g, '""')}"`,
    l.est_value || 0,
    l.stage_id,
    l.source,
    l.sales_pic,
    l.target_closing || '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ASTACODE_Pipeline_Leads_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function renderPipelineTable() {
  const { leads } = store.getState();
  const q = searchTerm.toLowerCase().trim();

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      q === '' ||
      l.title.toLowerCase().includes(q) ||
      (l.customer && l.customer.legal_name.toLowerCase().includes(q)) ||
      (l.customer && l.customer.industry && l.customer.industry.toLowerCase().includes(q)) ||
      l.code.toLowerCase().includes(q) ||
      (l.sales_pic && l.sales_pic.toLowerCase().includes(q));

    const matchesStage = selectedStage === 'ALL' || l.stage_id === selectedStage;
    return matchesSearch && matchesStage;
  });

  lastFilteredLeads = filteredLeads;
  const { data: pagedLeads, pagination } = paginate(filteredLeads, currentPage, currentPageSize);

  const rowsHtml = pagedLeads.length === 0
    ? `
      <tr>
        <td colspan="9" style="text-align:center;padding:48px 16px;color:var(--text-muted);font-size:12px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <span>Tidak ada lead yang cocok dengan kriteria pencarian dan filter saat ini.</span>
            <button id="btn-reset-table-filter" class="btn btn-secondary btn-sm" style="font-weight:700;margin-top:4px;">
              ↺ Reset Filter & Pencarian
            </button>
          </div>
        </td>
      </tr>
    `
    : pagedLeads.map((lead) => {
        const stageConfig = PIPELINE_STAGES.find((s) => s.id === lead.stage_id) || PIPELINE_STAGES[0];
        const customerName = lead.customer ? lead.customer.legal_name : '-';
        const customerIndustry = lead.customer ? lead.customer.industry : '-';

        return `
          <tr
            class="pipeline-table-row"
            data-lead-id="${lead.id}"
            style="cursor:pointer;border-bottom:1px solid var(--border-light);"
          >
            <!-- 1. KODE -->
            <td style="padding:10px 14px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);font-size:12px;">
              ${lead.code}
            </td>

            <!-- 2. KEBUTUHAN / PROYEK -->
            <td style="padding:10px 14px;">
              <div style="font-weight:700;color:var(--text-primary);font-size:13px;line-height:1.3;">
                ${lead.title}
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                ${lead.project_type || 'Web & Mobile App'}
              </div>
            </td>

            <!-- 3. CUSTOMER & INDUSTRI -->
            <td style="padding:10px 14px;">
              <div style="font-weight:600;color:var(--text-primary);font-size:12px;">
                ${customerName}
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:1px;">
                ${customerIndustry}
              </div>
            </td>

            <!-- 4. NILAI ESTIMASI -->
            <td style="padding:10px 14px;font-family:var(--font-mono);font-weight:800;color:#16a34a;font-size:12px;font-variant-numeric:tabular-nums;">
              ${formatRupiah(lead.est_value || 0)}
            </td>

            <!-- 5. STAGE -->
            <td style="padding:10px 14px;">
              <span
                style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:var(--radius-full);font-size:11px;font-weight:700;background:${stageConfig.color}15;color:${stageConfig.color};border:1px solid ${stageConfig.color}35;"
              >
                <span style="width:6px;height:6px;border-radius:var(--radius-full);background-color:${stageConfig.color};"></span>
                <span>${stageConfig.name}</span>
              </span>
            </td>

            <!-- 6. SUMBER -->
            <td style="padding:10px 14px;">
              <span class="badge badge-slate" style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:var(--radius-sm);background:var(--bg-secondary);border:1px solid var(--border);">
                ${lead.source}
              </span>
            </td>

            <!-- 7. SALES PIC -->
            <td style="padding:10px 14px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <img
                  src="${lead.sales_pic_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'}"
                  alt="${lead.sales_pic}"
                  style="width:28px;height:28px;border-radius:var(--radius-full);object-fit:cover;border:1px solid var(--border);flex-shrink:0;"
                />
                <span style="font-size:12px;color:var(--text-secondary);font-weight:500;white-space:nowrap;">
                  ${lead.sales_pic}
                </span>
              </div>
            </td>

            <!-- 8. UMUR -->
            <td style="padding:10px 14px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);white-space:nowrap;">
              ${lead.days_in_stage || 0} hari
            </td>

            <!-- 9. AKSI -->
            <td style="padding:10px 14px;text-align:right;">
              <button
                class="btn btn-sm btn-action-open"
                data-lead-id="${lead.id}"
                style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:11px;font-weight:700;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);color:var(--indigo-600);border-radius:var(--radius-full);cursor:pointer;transition:all var(--transition);"
              >
                <span>Buka</span>
                ${ICONS.arrowRight}
              </button>
            </td>
          </tr>
        `;
      }).join('');

  const paginationHtml = renderPaginationControls(pagination, {
    pageSizeOptions: [5, 10, 20],
    paginationId: 'pipeline-table-pagination',
  });

  return `
    <div class="animate-fade-in" style="flex:1;display:flex;flex-direction:column;height:100%;overflow:hidden;padding:20px;gap:16px;background:var(--bg-primary);">
      <!-- Top Filter & Actions Header -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:14px 18px;border-radius:var(--radius-xl);border:1px solid var(--border);box-shadow:var(--shadow-sm);">
        <div style="display:flex;align-items:center;gap:10px;flex:1;max-width:480px;">
          <div style="position:relative;flex:1;">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
              ${ICONS.search}
            </span>
            <input
              id="table-search-input"
              type="text"
              class="form-input"
              placeholder="Cari lead, customer, kode, PIC..."
              value="${searchTerm}"
              style="padding-left:32px;font-size:12px;"
            />
          </div>

          <select id="table-stage-filter" class="form-select" style="width:auto;font-size:12px;font-weight:600;">
            <option value="ALL" ${selectedStage === 'ALL' ? 'selected' : ''}>Semua Stage</option>
            ${PIPELINE_STAGES.map((s) => `
              <option value="${s.id}" ${s.id === selectedStage ? 'selected' : ''}>
                ${s.name} (${s.probability}%)
              </option>
            `).join('')}
          </select>
        </div>

        <button id="table-export-csv-btn" class="btn btn-secondary btn-sm" style="display:flex;align-items:center;gap:6px;font-weight:600;">
          ${ICONS.download}
          <span>Export CSV</span>
        </button>
      </div>

      <!-- Dense Table Card Container -->
      <div style="flex:1;display:flex;flex-direction:column;background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border);box-shadow:var(--shadow-sm);overflow:hidden;">
        <div style="flex:1;overflow-x:auto;overflow-y:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:var(--bg-secondary);border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.05em;position:sticky;top:0;z-index:2;">
                <th style="padding:10px 14px;text-align:left;">Kode</th>
                <th style="padding:10px 14px;text-align:left;">Kebutuhan / Proyek</th>
                <th style="padding:10px 14px;text-align:left;">Customer & Industri</th>
                <th style="padding:10px 14px;text-align:left;">Nilai Estimasi</th>
                <th style="padding:10px 14px;text-align:left;">Stage</th>
                <th style="padding:10px 14px;text-align:left;">Sumber</th>
                <th style="padding:10px 14px;text-align:left;">Sales PIC</th>
                <th style="padding:10px 14px;text-align:left;">Umur</th>
                <th style="padding:10px 14px;text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        ${paginationHtml}
      </div>
    </div>
  `;
}

export function bindPipelineTableEvents(container) {
  // Search input
  const searchInput = container.querySelector('#table-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      currentPage = 1;
      container.innerHTML = renderPipelineTable();
      bindPipelineTableEvents(container);
      const nextInput = container.querySelector('#table-search-input');
      if (nextInput) {
        nextInput.focus();
        nextInput.selectionStart = nextInput.selectionEnd = nextInput.value.length;
      }
    });
  }

  // Stage filter select
  const stageSelect = container.querySelector('#table-stage-filter');
  if (stageSelect) {
    stageSelect.addEventListener('change', (e) => {
      selectedStage = e.target.value;
      currentPage = 1;
      container.innerHTML = renderPipelineTable();
      bindPipelineTableEvents(container);
    });
  }

  // Reset filter button
  const resetFilterBtn = container.querySelector('#btn-reset-table-filter');
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      searchTerm = '';
      selectedStage = 'ALL';
      currentPage = 1;
      container.innerHTML = renderPipelineTable();
      bindPipelineTableEvents(container);
    });
  }

  // Export CSV (exports currently filtered leads)
  const exportBtn = container.querySelector('#table-export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportPipelineCsv(lastFilteredLeads);
    });
  }

  // Row clicks
  container.querySelectorAll('.pipeline-table-row[data-lead-id]').forEach((row) => {
    row.addEventListener('click', (e) => {
      // If user clicked directly on or inside action button, button handler will handle it
      if (e.target.closest('.btn-action-open')) return;
      const leadId = row.dataset.leadId;
      if (leadId) {
        store.navigateToLeadDetail(leadId);
      }
    });
  });

  // Action Buka button clicks
  container.querySelectorAll('.btn-action-open[data-lead-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const leadId = btn.dataset.leadId;
      if (leadId) {
        store.navigateToLeadDetail(leadId);
      }
    });
  });

  // Bind pagination controls
  bindPaginationEvents(
    container,
    (newPage) => {
      currentPage = newPage;
      container.innerHTML = renderPipelineTable();
      bindPipelineTableEvents(container);
    },
    (newPageSize) => {
      currentPageSize = newPageSize;
      currentPage = 1;
      container.innerHTML = renderPipelineTable();
      bindPipelineTableEvents(container);
    },
    'pipeline-table-pagination'
  );
}

export function mount(container) {
  container.innerHTML = renderPipelineTable();
  bindPipelineTableEvents(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'pipeline' && state.viewMode === 'table') {
      container.innerHTML = renderPipelineTable();
      bindPipelineTableEvents(container);
    }
  });

  return unsubscribe;
}
