/**
 * PipelineWorkflowTracker.js — Vanilla JS Workflow Gate Rules, Activity Timeline & File Repository
 * Converted from src/components/crm/PipelineWorkflowTracker.tsx
 */

import store from '../../store/store.js';
import { PIPELINE_STAGES } from '../../utils/pipelineRules.js';
import { formatRupiah } from '../../utils/topCalculator.js';
import { paginate } from '../../utils/pagination.js';
import { renderPaginationControls, bindPaginationEvents } from '../common/PaginationControls.js';

let activeTab = 'workflow'; // 'workflow' | 'timeline' | 'files'
let activityFilter = 'all'; // 'all' | 'meet' | 'call' | 'wa'
let activityPage = 1;
let activityPageSize = 5;

const ICONS = {
  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
};

const PIPELINE_FILES = [
  {
    id: 'pf-1',
    code: 'AST-2026-001',
    title: 'Aplikasi HRD 500 Karyawan',
    customer: 'PT Maju Sejahtera Industri',
    fileName: 'Kerangka_Acuan_Kerja_HRIS_PT_Maju.pdf',
    category: 'Brief / KAK Klien',
    size: '2.4 MB',
    date: '12 Okt 2026',
    uploader: 'Budi Santoso (Klien)',
    status: 'Terverifikasi Presales',
  },
  {
    id: 'pf-2',
    code: 'AST-2026-001',
    title: 'Aplikasi HRD 500 Karyawan',
    customer: 'PT Maju Sejahtera Industri',
    fileName: 'Quotation_MoU_QT-2026-10-0012_Rev2.pdf',
    category: 'Quotation + MoU (1 File)',
    size: '1.8 MB',
    date: '15 Okt 2026',
    uploader: 'Asisyah Sarah Azzahra (ASTACODE)',
    status: 'Negosiasi Termin TOP',
  },
  {
    id: 'pf-3',
    code: 'AST-2026-002',
    title: 'ERP Retail & Multi-Warehouse',
    customer: 'PT Retail Nusantara Prima',
    fileName: 'Spesifikasi_Kebutuhan_POS_18_Cabang.docx',
    category: 'Dokumen Kebutuhan',
    size: '3.1 MB',
    date: '14 Okt 2026',
    uploader: 'Sari Wijaya (Klien)',
    status: 'Review Presales',
  },
  {
    id: 'pf-4',
    code: 'AST-2026-003',
    title: 'Mobile Banking Core & e-Wallet',
    customer: 'PT Finan Prima Ventura',
    fileName: 'Non_Disclosure_Agreement_Signed.pdf',
    category: 'Legal NDA',
    size: '1.2 MB',
    date: '12 Okt 2026',
    uploader: 'Legal Team',
    status: 'Signed & Valid',
  },
  {
    id: 'pf-5',
    code: 'AST-2026-006',
    title: 'Custom Logistics & Fleet Tracking',
    customer: 'PT Logistik Express Sentosa',
    fileName: 'Kontrak_Kerja_Sama_CT-2026-10-0007.pdf',
    category: 'Kontrak Resmi',
    size: '4.5 MB',
    date: '02 Okt 2026',
    uploader: 'M. Reza Fahlevi',
    status: 'Deal Signed',
  },
];

export function renderPipelineWorkflowTracker() {
  const { leads, activities } = store.getState();

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'meet') return act.type === 'google_meet';
    if (activityFilter === 'call') return act.type === 'call';
    if (activityFilter === 'wa') return act.type === 'whatsapp';
    return true;
  });

  const { data: pagedActivities, pagination } = paginate(filteredActivities, activityPage, activityPageSize);

  // Tab 1: Workflow & Gate Rules HTML
  const stagesExceptReject = PIPELINE_STAGES.filter((s) => s.id !== 'reject');
  const stageRailNodesHtml = stagesExceptReject.map((st) => {
    const stageLeads = leads.filter((l) => l.stage_id === st.id);
    const stageValue = stageLeads.reduce((sum, l) => sum + (l.est_value || 0), 0);

    return `
      <div style="flex:1;min-width:120px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-xl);text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:space-between;box-shadow:var(--shadow-sm);">
        <div style="width:42px;height:42px;border-radius:var(--radius-full);background:linear-gradient(135deg, var(--indigo-500), var(--violet-600));color:#ffffff;font-family:var(--font-mono);font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(99,102,241,.3);">
          ${st.probability}%
        </div>
        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${st.name}
          </div>
          <div style="font-size:11px;font-weight:700;color:var(--indigo-500);margin-top:2px;">
            ${stageLeads.length} Lead Aktif
          </div>
          <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);margin-top:2px;">
            ${formatRupiah(stageValue)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  let tabContentHtml = '';

  if (activeTab === 'workflow') {
    tabContentHtml = `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Continuous Workflow Track Rail -->
        <div style="padding:16px 20px;background:var(--bg-secondary);border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary);">
                Track Record Workflow Pipeline ASTACODE
              </span>
              <p style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                Visualisasi jalur konversi penjualan software house berdasarkan persentase peluang closing.
              </p>
            </div>
            <span class="badge badge-purple" style="font-family:var(--font-mono);font-weight:700;">
              Total ${leads.length} Leads Terpantau
            </span>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:10px;padding-top:6px;">
            ${stageRailNodesHtml}
          </div>
        </div>

        <!-- 3 Enterprise Gate Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:8px;">
            <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--indigo-500);letter-spacing:.05em;">
              Gate: Ke Tahap Quotation
            </span>
            <h4 style="font-size:13px;font-weight:700;color:var(--text-primary);">
              Wajib Memiliki RAB yang Telah Direview
            </h4>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.6;">
              Sistem mengunci stage Quotation hingga minimal 1 modul RAB digenerate dan diverifikasi status "Reviewed" oleh Presales (PRD BR-04).
            </p>
            <div style="margin-top:auto;padding-top:8px;color:var(--emerald-500);font-weight:700;font-size:11px;display:flex;align-items:center;gap:6px;">
              ${ICONS.checkCircle}
              <span>Aturan Validasi Aktif</span>
            </div>
          </div>

          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:8px;">
            <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--amber-500);letter-spacing:.05em;">
              Gate: Setting TOP Quotation
            </span>
            <h4 style="font-size:13px;font-weight:700;color:var(--text-primary);">
              Termin Pembayaran Wajib Balance 100%
            </h4>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.6;">
              Penawaran tidak dapat digenerate final atau dikirim ke klien sebelum persentase atau nominal termin seimbang dengan nilai kontrak (PRD BR-15).
            </p>
            <div style="margin-top:auto;padding-top:8px;color:var(--emerald-500);font-weight:700;font-size:11px;display:flex;align-items:center;gap:6px;">
              ${ICONS.checkCircle}
              <span>Aturan Validasi Aktif</span>
            </div>
          </div>

          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:8px;">
            <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--emerald-500);letter-spacing:.05em;">
              Gate: Konversi DEAL (Won)
            </span>
            <h4 style="font-size:13px;font-weight:700;color:var(--text-primary);">
              Auto-Spawn Proyek ERP & Jadwal Invoice
            </h4>
            <p style="font-size:11px;color:var(--text-secondary);line-height:1.6;">
              Perubahan status ke Deal otomatis mengubah customer menjadi Active, membuat record proyek, dan menerbitkan invoice termin 1 ke modul Finance (PRD BR-07).
            </p>
            <div style="margin-top:auto;padding-top:8px;color:var(--emerald-500);font-weight:700;font-size:11px;display:flex;align-items:center;gap:6px;">
              ${ICONS.checkCircle}
              <span>Aturan Validasi Aktif</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (activeTab === 'timeline') {
    const activitiesListHtml = pagedActivities.map((act) => {
      const isMeet = act.type === 'google_meet';
      const icon = isMeet ? ICONS.video : ICONS.phone;
      const iconColor = isMeet ? 'var(--emerald-500)' : 'var(--indigo-500)';
      const iconBg = isMeet ? 'rgba(16,185,129,.1)' : 'rgba(99,102,241,.1)';

      return `
        <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-card);border:1px solid var(--border);display:flex;align-items:flex-start;gap:12px;font-size:12px;">
          <div style="width:36px;height:36px;border-radius:var(--radius-md);background:${iconBg};color:${iconColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
              <span style="font-weight:700;color:var(--text-primary);">${act.title}</span>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">${new Date(act.scheduled_at).toLocaleDateString('id-ID')}</span>
            </div>
            <p style="color:var(--text-secondary);margin-bottom:6px;line-height:1.4;">${act.notes || act.outcome || '-'}</p>
            <div style="display:flex;align-items:center;gap:12px;font-size:11px;color:var(--indigo-500);font-weight:600;">
              <span>PIC: ${act.assigned_to}</span>
              ${act.meet_link ? `<a href="${act.meet_link}" target="_blank" rel="noreferrer" style="text-decoration:underline;">Buka Link Meet</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const paginationHtml = renderPaginationControls(pagination, {
      pageSizeOptions: [3, 5, 10],
      paginationId: 'workflow-timeline-pagination',
    });

    tabContentHtml = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Filter Row -->
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
          <span style="color:var(--text-muted);font-weight:500;">Filter Tipe:</span>
          <button class="btn btn-xs btn-filter-act ${activityFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" data-act-type="all">Semua</button>
          <button class="btn btn-xs btn-filter-act ${activityFilter === 'meet' ? 'btn-primary' : 'btn-secondary'}" data-act-type="meet">📹 Google Meet</button>
          <button class="btn btn-xs btn-filter-act ${activityFilter === 'call' ? 'btn-primary' : 'btn-secondary'}" data-act-type="call">📞 Telepon</button>
          <button class="btn btn-xs btn-filter-act ${activityFilter === 'wa' ? 'btn-primary' : 'btn-secondary'}" data-act-type="wa">💬 WhatsApp</button>
        </div>

        <!-- Activities List -->
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${activitiesListHtml}
        </div>

        ${paginationHtml}
      </div>
    `;
  } else if (activeTab === 'files') {
    tabContentHtml = `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-sm);">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:var(--bg-secondary);border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.05em;">
                <th style="padding:10px 14px;text-align:left;">Nama Berkas Dokumen</th>
                <th style="padding:10px 14px;text-align:left;">Kategori</th>
                <th style="padding:10px 14px;text-align:left;">Lead / Klien</th>
                <th style="padding:10px 14px;text-align:left;">Ukuran</th>
                <th style="padding:10px 14px;text-align:left;">Tanggal Unggah</th>
                <th style="padding:10px 14px;text-align:left;">Status</th>
                <th style="padding:10px 14px;text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${PIPELINE_FILES.map((file) => `
                <tr style="border-bottom:1px solid var(--border-light);transition:background var(--transition);" class="hover-row">
                  <td style="padding:10px 14px;">
                    <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:var(--text-primary);">
                      <span style="color:var(--indigo-500);display:flex;align-items:center;">${ICONS.fileText}</span>
                      <span>${file.fileName}</span>
                    </div>
                  </td>
                  <td style="padding:10px 14px;color:var(--text-secondary);font-weight:500;">
                    ${file.category}
                  </td>
                  <td style="padding:10px 14px;">
                    <div style="font-weight:700;color:var(--text-primary);">${file.code}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${file.customer}</div>
                  </td>
                  <td style="padding:10px 14px;font-family:var(--font-mono);color:var(--text-muted);">
                    ${file.size}
                  </td>
                  <td style="padding:10px 14px;font-family:var(--font-mono);color:var(--text-muted);">
                    ${file.date}
                  </td>
                  <td style="padding:10px 14px;">
                    <span class="badge badge-purple" style="font-size:10px;font-weight:700;">
                      ${file.status}
                    </span>
                  </td>
                  <td style="padding:10px 14px;text-align:right;">
                    <button
                      class="btn-download-file btn btn-ghost btn-xs"
                      data-file-name="${file.fileName}"
                      style="color:var(--indigo-500);font-weight:700;display:inline-flex;align-items:center;gap:4px;"
                    >
                      ${ICONS.download}
                      <span>Unduh</span>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return `
    <div style="flex:1;overflow-y:auto;padding:20px;background:var(--bg-primary);display:flex;flex-direction:column;gap:16px;">
      <!-- Main Container Header -->
      <div style="background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border);padding:16px 20px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:var(--radius-lg);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:var(--indigo-500);display:flex;align-items:center;justify-content:center;">
              ${ICONS.layers}
            </div>
            <div>
              <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);letter-spacing:-.01em;">
                Tracking Workflow Sales Pipeline & Timeline Aktivitas
              </h3>
              <p style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                Pantau kepatuhan SLA tahapan, timeline follow-up terpadu, dan repositori berkas file dokumen lead.
              </p>
            </div>
          </div>

          <!-- Tab Switcher -->
          <div style="display:flex;align-items:center;gap:4px;background:var(--bg-secondary);padding:3px;border-radius:var(--radius-lg);border:1px solid var(--border);font-size:12px;font-weight:700;">
            <button class="btn-tab-workflow ${activeTab === 'workflow' ? 'active' : ''}" data-tab="workflow" style="padding:6px 12px;border:none;border-radius:var(--radius-md);cursor:pointer;${activeTab === 'workflow' ? 'background:var(--bg-card);color:var(--indigo-500);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-muted);'}">
              Workflow & Gate Rules
            </button>
            <button class="btn-tab-workflow ${activeTab === 'timeline' ? 'active' : ''}" data-tab="timeline" style="padding:6px 12px;border:none;border-radius:var(--radius-md);cursor:pointer;${activeTab === 'timeline' ? 'background:var(--bg-card);color:var(--indigo-500);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-muted);'}">
              Timeline Follow-Up (${activities.length})
            </button>
            <button class="btn-tab-workflow ${activeTab === 'files' ? 'active' : ''}" data-tab="files" style="padding:6px 12px;border:none;border-radius:var(--radius-md);cursor:pointer;${activeTab === 'files' ? 'background:var(--bg-card);color:var(--indigo-500);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-muted);'}">
              Tahap File & Dokumen (${PIPELINE_FILES.length})
            </button>
          </div>
        </div>

        <!-- Rendered Tab Content -->
        ${tabContentHtml}
      </div>
    </div>
  `;
}

export function bindPipelineWorkflowEvents(container) {
  // Tabs switcher
  container.querySelectorAll('.btn-tab-workflow[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      container.innerHTML = renderPipelineWorkflowTracker();
      bindPipelineWorkflowEvents(container);
    });
  });

  // Timeline activity filter
  container.querySelectorAll('.btn-filter-act[data-act-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activityFilter = btn.dataset.actType;
      activityPage = 1;
      container.innerHTML = renderPipelineWorkflowTracker();
      bindPipelineWorkflowEvents(container);
    });
  });

  // Download simulation
  container.querySelectorAll('.btn-download-file[data-file-name]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fileName = btn.dataset.fileName;
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Mengunduh berkas ${fileName}...`, type: 'info' },
      }));
    });
  });

  // Pagination for activities
  bindPaginationEvents(
    container,
    (newPage) => {
      activityPage = newPage;
      container.innerHTML = renderPipelineWorkflowTracker();
      bindPipelineWorkflowEvents(container);
    },
    (newPageSize) => {
      activityPageSize = newPageSize;
      activityPage = 1;
      container.innerHTML = renderPipelineWorkflowTracker();
      bindPipelineWorkflowEvents(container);
    },
    'workflow-timeline-pagination'
  );
}

export function mount(container) {
  container.innerHTML = renderPipelineWorkflowTracker();
  bindPipelineWorkflowEvents(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'pipeline' && state.viewMode === 'workflow') {
      container.innerHTML = renderPipelineWorkflowTracker();
      bindPipelineWorkflowEvents(container);
    }
  });

  return unsubscribe;
}
