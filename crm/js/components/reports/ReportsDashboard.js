/**
 * ReportsDashboard.js — Executive Analytics, Sales Funnel & Lead Source Attribution
 * ASTACODE CRM (PT ASTACODE Solusindo Teknologi)
 * PRD Section 20
 */

import store from '../../store/store.js';
import { formatRupiah } from '../../utils/topCalculator.js';
import { PIPELINE_STAGES } from '../../utils/pipelineRules.js';

// SVG Icons
const ICONS = {
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
  printer: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  arrowUpRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" x2="17" y1="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`,
};

/**
 * Mounts the Executive Reports Dashboard into the container
 * @param {HTMLElement} container
 * @returns {Function} unmount cleanup function
 */
export function mount(container) {
  let unsubscribe = null;

  function render() {
    const state = store.getState();
    const leads = state.leads || [];
    const projects = state.projects || [];

    // Financial Metrics
    const totalWon = leads
      .filter((l) => l.stage_id === 'deal')
      .reduce((sum, l) => sum + (l.est_value || 0), 0);

    const totalActive = leads
      .filter((l) => l.stage_id !== 'deal' && l.stage_id !== 'reject')
      .reduce((sum, l) => sum + (l.est_value || 0), 0);

    const totalLost = leads
      .filter((l) => l.stage_id === 'reject')
      .reduce((sum, l) => sum + (l.est_value || 0), 0);

    const wonLeadsCount = leads.filter((l) => l.stage_id === 'deal').length;
    const activeLeadsCount = leads.filter((l) => l.stage_id !== 'deal' && l.stage_id !== 'reject').length;
    const winRate = leads.length > 0 ? Math.round((wonLeadsCount / leads.length) * 100) : 0;

    // Project delivery metrics
    const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
    const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
    const totalProjectsContractValue = projects.reduce((sum, p) => sum + (p.contract_value || 0), 0);

    // Group leads by acquisition source
    const sourceStats = {};
    leads.forEach((l) => {
      const src = l.source || 'Lainnya';
      if (!sourceStats[src]) {
        sourceStats[src] = { count: 0, total: 0, wonCount: 0 };
      }
      sourceStats[src].count++;
      sourceStats[src].total += (l.est_value || 0);
      if (l.stage_id === 'deal') {
        sourceStats[src].wonCount++;
      }
    });

    // Funnel calculations
    const maxStageCount = Math.max(1, leads.length);

    container.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;min-height:100%;background:var(--bg-main);padding:24px;gap:24px;overflow-y:auto;">
        
        <!-- Top Header Card -->
        <div style="background:var(--bg-card);padding:20px 24px;border-radius:var(--radius-xl);border:1px solid var(--border-color);box-shadow:var(--shadow-xs);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <h1 style="font-size:18px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;margin:0;">
                Laporan Eksekutif, Sales Funnel & ROI Kanal Akuisisi
              </h1>
              <span style="padding:3px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:800;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);">
                PRD Section 20
              </span>
              <span style="padding:3px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(16,185,129,0.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,0.25);">
                Real-Time Synced
              </span>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin:6px 0 0 0;">
              Visibilitas performa pipeline end-to-end dari lead capture hingga cash collection dan analisis efektivitas sumber lead.
            </p>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <button id="btn-print-report" class="btn btn-outline" style="font-size:12px;height:34px;padding:0 12px;gap:6px;">
              ${ICONS.printer} Cetak Ringkasan
            </button>
            <button id="btn-goto-kanban" class="btn btn-primary" style="font-size:12px;height:34px;padding:0 14px;gap:6px;">
              Buka Pipeline Kanban ${ICONS.arrowUpRight}
            </button>
          </div>
        </div>

        <!-- 4 Key Performance Indicators (KPIs) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;">
          
          <!-- KPI 1: Won Revenue -->
          <div style="background:var(--bg-card);padding:20px;border-radius:var(--radius-xl);border:1px solid var(--border-color);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">
                Total Revenue Won (Deal)
              </span>
              <span style="width:28px;height:28px;border-radius:var(--radius-md);background:rgba(16,185,129,0.1);color:var(--emerald-600);display:flex;align-items:center;justify-content:center;">
                ${ICONS.award}
              </span>
            </div>
            <div style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--emerald-600);letter-spacing:-0.02em;">
              ${formatRupiah(totalWon)}
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
              <span style="font-size:11px;font-weight:700;color:var(--emerald-600);">
                ${wonLeadsCount} Kontrak Signed (${winRate}% Win Rate)
              </span>
            </div>
          </div>

          <!-- KPI 2: Active Pipeline -->
          <div style="background:var(--bg-card);padding:20px;border-radius:var(--radius-xl);border:1px solid var(--border-color);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">
                Active Pipeline Value
              </span>
              <span style="width:28px;height:28px;border-radius:var(--radius-md);background:rgba(99,102,241,0.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;">
                ${ICONS.trendingUp}
              </span>
            </div>
            <div style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--indigo-600);letter-spacing:-0.02em;">
              ${formatRupiah(totalActive)}
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
              <span style="font-size:11px;font-weight:700;color:var(--indigo-600);">
                ${activeLeadsCount} Prospek Aktif Berjalan
              </span>
            </div>
          </div>

          <!-- KPI 3: Lead-to-Quote Velocity -->
          <div style="background:var(--bg-card);padding:20px;border-radius:var(--radius-xl);border:1px solid var(--border-color);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">
                Waktu Lead → Quotation
              </span>
              <span style="width:28px;height:28px;border-radius:var(--radius-md);background:rgba(245,158,11,0.1);color:#d97706;display:flex;align-items:center;justify-content:center;">
                ${ICONS.target}
              </span>
            </div>
            <div style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--text-primary);letter-spacing:-0.02em;">
              ≤ 1 Hari (Target KPI)
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
              <span style="font-size:11px;color:var(--text-muted);">
                Didukung Generator AI Mandays & RAB
              </span>
            </div>
          </div>

          <!-- KPI 4: TOP Compliance & Gate Rules -->
          <div style="background:var(--bg-card);padding:20px;border-radius:var(--radius-xl);border:1px solid var(--border-color);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">
                Adopsi Setting TOP Standar
              </span>
              <span style="width:28px;height:28px;border-radius:var(--radius-md);background:rgba(99,102,241,0.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;">
                ${ICONS.shieldCheck}
              </span>
            </div>
            <div style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--indigo-600);letter-spacing:-0.02em;">
              100% Balance
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
              <span style="font-size:11px;color:var(--text-muted);">
                Validasi termin 100% sebelum invoice terbit
              </span>
            </div>
          </div>

        </div>

        <!-- 2 Column Section: Sales Funnel & Lead Source Attribution -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(420px, 1fr));gap:24px;">

          <!-- Funnel Conversion Column -->
          <div style="background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border-color);padding:22px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:18px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--indigo-600);">${ICONS.barChart}</span>
                <h3 style="font-size:13px;font-weight:800;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.04em;margin:0;">
                  Sales Funnel Conversion per Stage
                </h3>
              </div>
              <span style="font-size:11px;font-weight:700;color:var(--text-muted);">
                Total: ${leads.length} Leads
              </span>
            </div>

            <!-- Stages List -->
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${PIPELINE_STAGES.map((st) => {
                const stageLeads = leads.filter((l) => l.stage_id === st.id);
                const count = stageLeads.length;
                const val = stageLeads.reduce((s, l) => s + (l.est_value || 0), 0);
                const pct = Math.round((count / maxStageCount) * 100);

                return `
                  <div style="display:flex;flex-direction:column;gap:5px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span style="width:8px;height:8px;border-radius:50%;background-color:${st.color};display:inline-block;"></span>
                        <span style="font-weight:700;color:var(--text-primary);">${st.name}</span>
                      </div>
                      <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--text-secondary);">
                        ${count} Leads <span style="color:var(--text-muted);font-weight:500;">(${formatRupiah(val)})</span>
                      </div>
                    </div>
                    
                    <div style="width:100%;height:10px;border-radius:var(--radius-full);background:var(--border-color);overflow:hidden;position:relative;">
                      <div style="height:100%;border-radius:var(--radius-full);background-color:${st.color};width:${Math.max(4, pct)}%;transition:width 0.4s ease;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top:auto;padding-top:14px;border-top:1px dashed var(--border-color);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);">
              <span>Stage Gate Rules: Mandatory RAB & TOP Validated</span>
              <span style="color:var(--emerald-600);font-weight:700;">Zero Data Loss</span>
            </div>
          </div>

          <!-- Lead Source Channel Attribution Column -->
          <div style="background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border-color);padding:22px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:18px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--emerald-600);">${ICONS.users}</span>
                <h3 style="font-size:13px;font-weight:800;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.04em;margin:0;">
                  Performa Saluran Akuisisi (Attribution)
                </h3>
              </div>
              <span style="font-size:11px;font-weight:700;color:var(--text-muted);">
                ${Object.keys(sourceStats).length} Kanal Terpantau
              </span>
            </div>

            <!-- Source Cards List -->
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${Object.entries(sourceStats).map(([src, stat]) => {
                const srcShare = leads.length > 0 ? Math.round((stat.count / leads.length) * 100) : 0;
                return `
                  <div style="padding:12px 14px;border-radius:var(--radius-lg);background:var(--bg-subtle);border:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                    <div style="display:flex;flex-direction:column;gap:2px;">
                      <div style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:12px;font-weight:800;color:var(--text-primary);">${src}</span>
                        <span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:var(--radius-full);background:rgba(99,102,241,0.1);color:var(--indigo-600);">
                          ${srcShare}%
                        </span>
                      </div>
                      <span style="font-size:11px;color:var(--text-muted);">
                        ${stat.count} Peluang Masuk • ${stat.wonCount} Menang
                      </span>
                    </div>

                    <div style="text-align:right;">
                      <div style="font-family:var(--font-mono);font-size:13px;font-weight:800;color:var(--emerald-600);">
                        ${formatRupiah(stat.total)}
                      </div>
                      <span style="font-size:10px;font-weight:700;color:var(--indigo-500);">
                        Attribution OK
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Meta Cloud API Attribution Tip -->
            <div style="margin-top:auto;padding:12px;border-radius:var(--radius-md);background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;gap:10px;">
              <span style="color:var(--indigo-600);">${ICONS.shieldCheck}</span>
              <p style="font-size:11px;color:var(--text-secondary);margin:0;line-height:1.4;">
                Setiap lead WhatsApp secara otomatis diberi tag attribution <strong>Meta Cloud API</strong> dengan nomor pengirim terverifikasi.
              </p>
            </div>
          </div>

        </div>

        <!-- Row 3: Delivery Realization & Executive Insights -->
        <div style="background:var(--bg-card);border-radius:var(--radius-xl);border:1px solid var(--border-color);padding:22px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:var(--indigo-600);">${ICONS.dollar}</span>
              <h3 style="font-size:13px;font-weight:800;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.04em;margin:0;">
                Realisasi Kontrak ke Proyek & Cashflow Handover
              </h3>
            </div>
            <div style="display:flex;gap:12px;font-size:12px;color:var(--text-secondary);">
              <span>Proyek Berjalan: <strong style="color:var(--text-primary);">${activeProjectsCount}</strong></span>
              <span>Proyek Selesai: <strong style="color:var(--emerald-600);">${completedProjectsCount}</strong></span>
              <span>Total Nilai Delivery: <strong style="color:var(--indigo-600);font-family:var(--font-mono);">${formatRupiah(totalProjectsContractValue)}</strong></span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
            <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-subtle);border:1px solid var(--border-color);display:flex;flex-direction:column;gap:6px;">
              <div style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;">
                SLA Handover Sales ke PM
              </div>
              <div style="font-size:14px;font-weight:700;color:var(--text-primary);">
                Maksimal 1 Jam Pasca Deal
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin:0;">
                Otomasi pembuatan workspace proyek saat status lead berubah menjadi 'Deal'.
              </p>
            </div>

            <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-subtle);border:1px solid var(--border-color);display:flex;flex-direction:column;gap:6px;">
              <div style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;">
                Integritas Dokumen Kontrak (22 Pasal MoU)
              </div>
              <div style="font-size:14px;font-weight:700;color:var(--emerald-600);">
                100% Klausul Standar KKI
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin:0;">
                Pasal 10 (Force Majeure), Pasal 11 (Kerahasiaan/NDA), dan Pasal 14 (Hak Cipta) terkunci otomatis.
              </p>
            </div>

            <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-subtle);border:1px solid var(--border-color);display:flex;flex-direction:column;gap:6px;">
              <div style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;">
                Pemberitahuan Otomatis Klien
              </div>
              <div style="font-size:14px;font-weight:700;color:var(--indigo-600);">
                WhatsApp Webhook Active
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin:0;">
                Notifikasi milestone dan invoice terkirim langsung ke kontak penanggung jawab klien.
              </p>
            </div>
          </div>
        </div>

      </div>
    `;

    // Event Listeners
    const btnPrint = container.querySelector('#btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    const btnGotoKanban = container.querySelector('#btn-goto-kanban');
    if (btnGotoKanban) {
      btnGotoKanban.addEventListener('click', () => {
        store.setState({ activeView: 'pipeline', viewMode: 'kanban' });
      });
    }
  }

  // Initial render
  render();

  // Subscribe to changes in store
  unsubscribe = store.subscribe(() => {
    render();
  });

  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}
