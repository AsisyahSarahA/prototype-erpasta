/**
 * PipelineKanban.js — Vanilla JS Pipeline Kanban Board
 * Converted from src/components/crm/PipelineKanban.tsx
 */

import store from '../../store/store.js';
import { PIPELINE_STAGES, calculatePipelineMetrics } from '../../utils/pipelineRules.js';
import { formatRupiah } from '../../utils/topCalculator.js';

// Local UI state
let searchTerm = '';
let priorityFilter = 'ALL';
let rejectModalLead = null;
let rejectReasonInput = '';

const ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  referral: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  grip: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
};

function getSourceIcon(source) {
  switch (source) {
    case 'Instagram': return ICONS.instagram;
    case 'Website': return ICONS.globe;
    case 'WhatsApp': return ICONS.whatsapp;
    case 'Referral': return ICONS.referral;
    case 'LinkedIn': return ICONS.linkedin;
    case 'Meta Ads':
    case 'Google Ads': return ICONS.target;
    default: return ICONS.globe;
  }
}

export function renderPipelineKanban() {
  const state = store.getState();
  const { leads, selectedPicFilter, selectedSourceFilter } = state;

  // Extract distinct PICs and Sources
  const pics = Array.from(new Set(leads.map((l) => l.sales_pic)));
  const sources = ['Instagram', 'Website', 'WhatsApp', 'Referral', 'LinkedIn', 'Meta Ads', 'Google Ads', 'Event/Webinar', 'Lainnya'];

  // Filter leads
  const q = searchTerm.toLowerCase().trim();
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      q === '' ||
      l.title.toLowerCase().includes(q) ||
      (l.customer && l.customer.legal_name.toLowerCase().includes(q)) ||
      (l.customer && l.customer.industry && l.customer.industry.toLowerCase().includes(q)) ||
      l.code.toLowerCase().includes(q) ||
      (l.sales_pic && l.sales_pic.toLowerCase().includes(q));

    const matchesPic = selectedPicFilter === 'ALL' || l.sales_pic === selectedPicFilter;
    const matchesSource = selectedSourceFilter === 'ALL' || l.source === selectedSourceFilter;
    const matchesPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;

    return matchesSearch && matchesPic && matchesSource && matchesPriority;
  });

  const metrics = calculatePipelineMetrics(filteredLeads);

  // Kanban Columns HTML
  const columnsHtml = PIPELINE_STAGES.map((stage, stageIdx) => {
    const stageLeads = filteredLeads.filter((l) => l.stage_id === stage.id);
    const stageTotal = stageLeads.reduce((acc, curr) => acc + (curr.est_value || 0), 0);

    const cardsHtml = stageLeads.length === 0
      ? `
        <div style="height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed var(--border);border-radius:var(--radius-lg);text-align:center;padding:12px;color:var(--text-muted);font-size:11px;">
          Belum ada lead
        </div>
      `
      : stageLeads.map((lead) => {
          const isStale = (lead.days_in_stage || 0) >= 5;
          const customerName = lead.customer ? lead.customer.legal_name : 'Customer';
          const picFirstName = lead.sales_pic ? lead.sales_pic.split(' ')[0] : 'PIC';

          let priorityBadgeHtml = '';
          if (lead.priority === 'Hot') {
            priorityBadgeHtml = `<span class="badge badge-hot" style="font-size:10px;font-weight:800;">🔥 HOT</span>`;
          } else if (lead.priority === 'High') {
            priorityBadgeHtml = `<span class="badge badge-high" style="font-size:10px;font-weight:700;">HIGH</span>`;
          }

          const staleBadgeHtml = isStale
            ? `<span class="badge badge-amber" title="${lead.days_in_stage} hari di stage ini" style="font-size:10px;display:inline-flex;align-items:center;gap:3px;">
                ${ICONS.clock}
                <span>${lead.days_in_stage}d</span>
              </span>`
            : '';

          return `
            <div
              class="kanban-card"
              draggable="true"
              data-lead-id="${lead.id}"
              data-current-stage="${stage.id}"
              title="Drag & drop ke kolom stage lain atau klik untuk buka detail lead"
              style="padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);cursor:grab;transition:all var(--transition);position:relative;margin-bottom:10px;user-select:none;"
            >
              <!-- Priority & Lead Code Row -->
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:5px;">
                  <span class="drag-handle" title="Tahan dan drag kartu ini" style="display:inline-flex;align-items:center;color:var(--text-muted);opacity:0.5;cursor:grab;">
                    ${ICONS.grip}
                  </span>
                  <span class="badge badge-slate" style="font-family:var(--font-mono);font-size:10px;font-weight:700;">
                    ${lead.code}
                  </span>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                  ${priorityBadgeHtml}
                  ${staleBadgeHtml}
                </div>
              </div>

              <!-- Title & Company -->
              <h4 style="font-size:12px;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                ${lead.title}
              </h4>
              <p style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px;">
                ${customerName}
              </p>

              <!-- Est Value & Project Type -->
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <span style="font-family:var(--font-mono);font-weight:800;font-size:12px;color:var(--emerald-500);">
                  ${formatRupiah(lead.est_value || 0)}
                </span>
                <span style="font-size:10px;color:var(--text-muted);max-width:90px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${lead.project_type || 'Custom App'}
                </span>
              </div>

              <!-- Lead Source & Sales PIC -->
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid var(--border-light);margin-bottom:8px;">
                <div style="display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:var(--radius-full);background:var(--bg-secondary);font-size:10px;color:var(--text-secondary);">
                  ${getSourceIcon(lead.source)}
                  <span>${lead.source}</span>
                </div>

                <div style="display:flex;align-items:center;gap:5px;">
                  <span style="font-size:11px;color:var(--text-secondary);font-weight:500;">
                    ${picFirstName}
                  </span>
                  <img
                    src="${lead.sales_pic_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'}"
                    alt="${lead.sales_pic}"
                    style="width:20px;height:20px;border-radius:var(--radius-full);object-fit:cover;border:1px solid var(--border);"
                  />
                </div>
              </div>

              <!-- Stage Shift Quick Action Buttons -->
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid var(--border-light);">
                <button
                  class="btn-shift-prev"
                  data-lead-id="${lead.id}"
                  data-current-stage="${stage.id}"
                  data-stage-idx="${stageIdx}"
                  ${stageIdx === 0 ? 'disabled style="opacity:0.2;cursor:not-allowed;"' : ''}
                  title="Kembali ke stage sebelumnya"
                  style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:2px;"
                >
                  ${ICONS.chevronLeft}
                </button>

                <span style="font-size:10px;font-weight:700;color:var(--indigo-500);display:flex;align-items:center;gap:2px;">
                  <span>Detail</span>
                  ${ICONS.arrowRight}
                </span>

                <button
                  class="btn-shift-next"
                  data-lead-id="${lead.id}"
                  data-current-stage="${stage.id}"
                  data-stage-idx="${stageIdx}"
                  ${stageIdx === PIPELINE_STAGES.length - 1 ? 'disabled style="opacity:0.2;cursor:not-allowed;"' : ''}
                  title="Maju ke stage berikutnya"
                  style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:2px;"
                >
                  ${ICONS.chevronRight}
                </button>
              </div>
            </div>
          `;
        }).join('');

    return `
      <div
        class="kanban-column"
        data-stage-id="${stage.id}"
        style="width:280px;min-width:280px;background:var(--bg-secondary);border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;height:100%;overflow:hidden;transition:all 0.2s ease;"
      >
        <!-- Column Header -->
        <div style="padding:12px;background:var(--bg-card);border-bottom:1px solid var(--border);border-top-left-radius:var(--radius-xl);border-top-right-radius:var(--radius-xl);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:10px;height:10px;border-radius:var(--radius-full);background-color:${stage.color};display:inline-block;"></span>
              <span style="font-size:12px;font-weight:800;color:var(--text-primary);letter-spacing:-.01em;">
                ${stage.name}
              </span>
            </div>
            <span class="badge badge-slate" style="font-size:10px;font-weight:700;">
              ${stageLeads.length}
            </span>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">
            <span>${formatRupiah(stageTotal)}</span>
            <span style="font-size:10px;font-weight:700;color:var(--indigo-500);">${stage.probability}% win</span>
          </div>
        </div>

        <!-- Cards Body -->
        <div class="kanban-cards-scroll" data-stage-id="${stage.id}" style="flex:1;overflow-y:auto;padding:10px;min-height:160px;transition:background 0.2s ease;">
          ${cardsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Reject Modal Dialog HTML (if active)
  let rejectModalHtml = '';
  if (rejectModalLead) {
    rejectModalHtml = `
      <div class="modal-overlay" id="reject-modal-backdrop" style="background:rgba(15,23,42,.65);backdrop-filter:blur(4px);z-index:100;">
        <div class="modal modal-md" onclick="event.stopPropagation();" style="max-width:440px;padding:20px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;gap:12px;color:var(--red-500);">
            <div style="width:40px;height:40px;border-radius:var(--radius-lg);background:rgba(239,68,68,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${ICONS.xCircle}
            </div>
            <div>
              <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);">
                Tandai Lead Sebagai Reject (Lost)
              </h3>
              <p style="font-size:11px;color:var(--text-muted);">${rejectModalLead.title}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reject-reason-input">Alasan Penolakan (Wajib Diisi)*:</label>
            <textarea
              id="reject-reason-input"
              rows="3"
              class="form-textarea"
              placeholder="Contoh: Klien memilih vendor lain, budget di luar rate card, atau proyek ditunda internal..."
            >${rejectReasonInput}</textarea>
          </div>

          <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding-top:8px;">
            <button id="btn-cancel-reject" class="btn btn-secondary btn-sm" style="font-weight:600;">
              Batal
            </button>
            <button id="btn-confirm-reject" class="btn btn-danger btn-sm" style="font-weight:700;">
              Konfirmasi Reject
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="kanban-page-wrapper" style="flex:1;display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg-primary);">
      <!-- Top KPI Summary & Filter Bar -->
      <div style="padding:12px 20px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:10px;">
        <!-- KPI Metrics -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-size:12px;">
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:var(--text-muted);font-weight:500;">Total Pipeline:</span>
              <strong style="font-size:14px;font-family:var(--font-mono);color:var(--text-primary);">${formatRupiah(metrics.totalValue)}</strong>
            </div>
            <div style="display:flex;align-items:center;gap:6px;border-left:1px solid var(--border);padding-left:16px;">
              <span style="color:var(--text-muted);font-weight:500;">Weighted Value:</span>
              <strong style="font-size:14px;font-family:var(--font-mono);color:var(--indigo-500);">${formatRupiah(metrics.weightedValue)}</strong>
            </div>
            <div style="display:flex;align-items:center;gap:6px;border-left:1px solid var(--border);padding-left:16px;">
              <span style="color:var(--text-muted);font-weight:500;">Total Peluang:</span>
              <strong style="color:var(--text-primary);">${metrics.totalCount} Leads (${metrics.activeLeadsCount} Aktif)</strong>
            </div>
          </div>

          ${metrics.staleCount > 0 ? `
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--radius-md);background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);color:var(--amber-500);font-size:11px;font-weight:700;">
              ${ICONS.alertTriangle}
              <span>${metrics.staleCount} Lead Stale (≥5 hari tanpa aktivitas)</span>
            </div>
          ` : ''}
        </div>

        <!-- Filter Controls Row -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding-top:6px;border-top:1px solid var(--border-light);">
          <!-- Search input -->
          <div style="position:relative;flex:1;max-width:360px;">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
              ${ICONS.search}
            </span>
            <input
              id="kanban-search-input"
              type="text"
              class="form-input"
              style="padding-left:32px;font-size:12px;padding-top:6px;padding-bottom:6px;"
              placeholder="Filter cepat judul, perusahaan, kode lead..."
              value="${searchTerm}"
            />
          </div>

          <!-- Select dropdowns -->
          <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">PIC:</span>
              <select id="kanban-filter-pic" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="ALL" ${selectedPicFilter === 'ALL' ? 'selected' : ''}>Semua PIC</option>
                ${pics.map((p) => `<option value="${p}" ${p === selectedPicFilter ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">Sumber:</span>
              <select id="kanban-filter-source" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="ALL" ${selectedSourceFilter === 'ALL' ? 'selected' : ''}>Semua Sumber</option>
                ${sources.map((s) => `<option value="${s}" ${s === selectedSourceFilter ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-size:11px;">Prioritas:</span>
              <select id="kanban-filter-priority" class="form-select" style="font-size:11px;padding:4px 8px;width:auto;">
                <option value="ALL" ${priorityFilter === 'ALL' ? 'selected' : ''}>Semua Prioritas</option>
                <option value="Hot" ${priorityFilter === 'Hot' ? 'selected' : ''}>🔥 Hot</option>
                <option value="High" ${priorityFilter === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>

            ${(searchTerm || selectedPicFilter !== 'ALL' || selectedSourceFilter !== 'ALL' || priorityFilter !== 'ALL') ? `
              <button id="kanban-reset-filters" class="btn btn-ghost btn-xs" style="color:var(--indigo-500);font-weight:700;">
                Reset Filter
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Horizontal Kanban Columns Container -->
      <div style="flex:1;overflow-x:auto;overflow-y:hidden;padding:16px;">
        <div style="display:flex;align-items:flex-start;gap:12px;height:100%;min-width:max-content;padding-bottom:8px;">
          ${columnsHtml}
        </div>
      </div>

      <!-- Reject Modal Container -->
      ${rejectModalHtml}
    </div>
  `;
}

export function bindPipelineKanbanEvents(container) {
  // Search input
  const searchInput = container.querySelector('#kanban-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      container.innerHTML = renderPipelineKanban();
      bindPipelineKanbanEvents(container);
      const nextInput = container.querySelector('#kanban-search-input');
      if (nextInput) {
        nextInput.focus();
        nextInput.selectionStart = nextInput.selectionEnd = nextInput.value.length;
      }
    });
  }

  // Filter PIC
  const picSelect = container.querySelector('#kanban-filter-pic');
  if (picSelect) {
    picSelect.addEventListener('change', (e) => {
      store.setSelectedPicFilter(e.target.value);
    });
  }

  // Filter Source
  const sourceSelect = container.querySelector('#kanban-filter-source');
  if (sourceSelect) {
    sourceSelect.addEventListener('change', (e) => {
      store.setSelectedSourceFilter(e.target.value);
    });
  }

  // Filter Priority
  const prioritySelect = container.querySelector('#kanban-filter-priority');
  if (prioritySelect) {
    prioritySelect.addEventListener('change', (e) => {
      priorityFilter = e.target.value;
      container.innerHTML = renderPipelineKanban();
      bindPipelineKanbanEvents(container);
    });
  }

  // Reset filters
  const resetBtn = container.querySelector('#kanban-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchTerm = '';
      priorityFilter = 'ALL';
      store.setSelectedPicFilter('ALL');
      store.setSelectedSourceFilter('ALL');
    });
  }

  // ── Drag & Drop Event Listeners ──
  let draggedLeadId = null;
  let draggedSourceStageId = null;
  let hasDragged = false;

  container.querySelectorAll('.kanban-card[data-lead-id]').forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedLeadId = card.dataset.leadId;
      draggedSourceStageId = card.dataset.currentStage;
      hasDragged = true;
      card.classList.add('is-dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.leadId);
      }
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      container.querySelectorAll('.kanban-column').forEach((col) => {
        col.classList.remove('drag-target-active');
      });
      setTimeout(() => {
        hasDragged = false;
        draggedLeadId = null;
        draggedSourceStageId = null;
      }, 120);
    });
  });

  container.querySelectorAll('.kanban-column[data-stage-id]').forEach((col) => {
    const stageId = col.dataset.stageId;

    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      if (!col.classList.contains('drag-target-active')) {
        col.classList.add('drag-target-active');
      }
    });

    col.addEventListener('dragleave', (e) => {
      if (!col.contains(e.relatedTarget)) {
        col.classList.remove('drag-target-active');
      }
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-target-active');

      const leadId = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || draggedLeadId;
      const targetStageId = stageId;

      if (!leadId || !targetStageId) return;
      if (targetStageId === draggedSourceStageId) return;

      const targetStageObj = PIPELINE_STAGES.find((s) => s.id === targetStageId);
      const stageName = targetStageObj ? targetStageObj.name : targetStageId;

      // Handle drop to reject stage: prompt modal
      if (targetStageId === 'reject') {
        const { leads } = store.getState();
        rejectModalLead = leads.find((l) => l.id === leadId);
        rejectReasonInput = '';
        container.innerHTML = renderPipelineKanban();
        bindPipelineKanbanEvents(container);
        return;
      }

      // Execute updateLeadStage
      const res = store.updateLeadStage(leadId, targetStageId);
      if (!res.success) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: res.message || 'Tidak dapat memindahkan stage.', type: 'warning' },
        }));
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Lead berhasil dipindahkan ke tahap "${stageName}"!`, type: 'success' },
        }));
      }
    });
  });

  // Card click navigates to lead detail
  container.querySelectorAll('.kanban-card[data-lead-id]').forEach((card) => {
    card.addEventListener('click', (e) => {
      // Do not navigate if user was dragging or clicked shift/grip buttons
      if (hasDragged) {
        return;
      }
      if (e.target.closest('.btn-shift-prev') || e.target.closest('.btn-shift-next') || e.target.closest('.drag-handle')) {
        return;
      }
      const leadId = card.dataset.leadId;
      if (leadId) {
        store.navigateToLeadDetail(leadId);
      }
    });
  });

  // Shift Prev button
  container.querySelectorAll('.btn-shift-prev').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const leadId = btn.dataset.leadId;
      const stageIdx = parseInt(btn.dataset.stageIdx, 10);
      if (stageIdx > 0) {
        const targetStage = PIPELINE_STAGES[stageIdx - 1];
        const res = store.updateLeadStage(leadId, targetStage.id);
        if (!res.success) {
          alert(res.message);
        }
      }
    });
  });

  // Shift Next button
  container.querySelectorAll('.btn-shift-next').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const leadId = btn.dataset.leadId;
      const stageIdx = parseInt(btn.dataset.stageIdx, 10);
      if (stageIdx < PIPELINE_STAGES.length - 1) {
        const targetStage = PIPELINE_STAGES[stageIdx + 1];

        // If target is reject stage, prompt reject modal
        if (targetStage.id === 'reject') {
          const { leads } = store.getState();
          rejectModalLead = leads.find((l) => l.id === leadId);
          rejectReasonInput = '';
          container.innerHTML = renderPipelineKanban();
          bindPipelineKanbanEvents(container);
          return;
        }

        const res = store.updateLeadStage(leadId, targetStage.id);
        if (!res.success) {
          alert(res.message);
        }
      }
    });
  });

  // Reject Modal actions
  const cancelRejectBtn = container.querySelector('#btn-cancel-reject');
  if (cancelRejectBtn) {
    cancelRejectBtn.addEventListener('click', () => {
      rejectModalLead = null;
      container.innerHTML = renderPipelineKanban();
      bindPipelineKanbanEvents(container);
    });
  }

  const confirmRejectBtn = container.querySelector('#btn-confirm-reject');
  if (confirmRejectBtn) {
    confirmRejectBtn.addEventListener('click', () => {
      const reasonVal = container.querySelector('#reject-reason-input')?.value.trim();
      if (!reasonVal) {
        alert('Alasan penolakan wajib diisi (PRD BR-08).');
        return;
      }
      if (rejectModalLead) {
        const res = store.updateLeadStage(rejectModalLead.id, 'reject', reasonVal);
        if (!res.success) {
          alert(res.message);
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Lead ${rejectModalLead.code} ditandai Reject (Lost).`, type: 'warning' },
          }));
          rejectModalLead = null;
        }
      }
    });
  }
}

export function mount(container) {
  container.innerHTML = renderPipelineKanban();
  bindPipelineKanbanEvents(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'pipeline' && state.viewMode === 'kanban') {
      container.innerHTML = renderPipelineKanban();
      bindPipelineKanbanEvents(container);
    }
  });

  return unsubscribe;
}
