/**
 * ProjectsList.js — Vanilla JS ASTACODE Proyek & Delivery Command Center
 * Converted from src/components/projects/ProjectsList.tsx
 */

import store from '../../store/store.js';
import { formatRupiah } from '../../utils/topCalculator.js';
import { paginate } from '../../utils/pagination.js';
import { renderPaginationControls, bindPaginationEvents } from '../common/PaginationControls.js';

// Module-level UI State
let activeTab = 'dashboard'; // 'dashboard' | 'projects' | 'mandays' | 'timeline'
let searchTerm = '';
let statusFilter = 'ALL';
let currentPage = 1;
let currentPageSize = 4;

// Modal States
let isNewProjectModalOpen = false;
let selectedCustomerForNew = '';
let newTitle = '';
let newBudgetMandays = 120;
let newContractValue = 210000000;
let newWarranty = '90 Hari Pasca BAST';
let newSla = '99.5% Uptime SLA';

let inspectingProjectId = null;
let isAddMilestoneOpen = false;
let newMilestoneName = '';
let newMilestoneTargetDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
let newMilestoneMandays = 30;

const ICONS = {
  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  activity: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  printer: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

export function renderProjectsList() {
  const { projects, invoices, customers, leads, waConversations } = store.getState();

  // Aggregated delivery statistics
  const totalContractValue = projects.reduce((acc, p) => acc + p.contract_value, 0);
  const totalBudgetMandays = projects.reduce((acc, p) => acc + p.budget_mandays, 0);
  const totalActualMandays = projects.reduce((acc, p) => acc + p.actual_mandays, 0);
  const mandaysBurnPct = totalBudgetMandays > 0 ? Math.round((totalActualMandays / totalBudgetMandays) * 100) : 0;
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progress_pct, 0) / projects.length)
    : 0;

  const totalPaidInvoices = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + i.grand_total, 0);
  const totalDraftInvoices = invoices
    .filter((i) => i.status === 'Draft' || i.status === 'Sent')
    .reduce((acc, i) => acc + i.grand_total, 0);

  const unreadWaCount = waConversations.reduce((acc, c) => acc + c.unread_count, 0);

  // Filter projects for list view
  const q = searchTerm.toLowerCase().trim();
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      q === '' ||
      p.title.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.customer_name.toLowerCase().includes(q) ||
      p.pm_name.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { data: pagedProjects, pagination } = paginate(filteredProjects, currentPage, currentPageSize);

  // Flatten and sort upcoming milestones
  const allMilestones = projects
    .flatMap((p) =>
      p.milestones.map((m) => ({
        ...m,
        projectTitle: p.title,
        projectCode: p.code,
        customerName: p.customer_name,
      }))
    )
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());

  const inspectingProject = projects.find((p) => p.id === inspectingProjectId) || null;

  return `
    <div style="flex:1;display:flex;flex-direction:column;height:100%;overflow-y:auto;background:var(--bg-canvas);padding:24px;gap:24px;">
      
      <!-- Header & Global Tab Switcher -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:var(--bg-card);padding:20px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--indigo-600), var(--indigo-500));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-xs);">
            ${ICONS.layers}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h1 style="font-size:16px;font-weight:800;color:var(--text-primary);letter-spacing:-0.01em;margin:0;">
                ASTACODE Proyek & Delivery Command Center
              </h1>
              <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
                Portal Operasional
              </span>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
              Pusat kendali eksekusi sistem software house, pelacakan alokasi mandays, jadwal rilis sprint, dan pintu gerbang utama ke modul ERP.
            </p>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;">
          <!-- Tab Mode Buttons -->
          <div style="display:flex;align-items:center;gap:4px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-xl);font-size:12px;font-weight:600;">
            <button
              class="prj-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}"
              data-tab="dashboard"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'dashboard'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Portal & Dashboard
            </button>
            <button
              class="prj-tab-btn ${activeTab === 'projects' ? 'active' : ''}"
              data-tab="projects"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'projects'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Daftar Proyek (${projects.length})
            </button>
            <button
              class="prj-tab-btn ${activeTab === 'mandays' ? 'active' : ''}"
              data-tab="mandays"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'mandays'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Resource & Mandays
            </button>
            <button
              class="prj-tab-btn ${activeTab === 'timeline' ? 'active' : ''}"
              data-tab="timeline"
              style="padding:6px 12px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
                activeTab === 'timeline'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Roadmap Sprint
            </button>
          </div>

          <button
            id="prj-open-new-modal-btn"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--indigo-600), var(--indigo-700));color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.25);transition:all var(--transition);"
          >
            ${ICONS.plus}
            <span>+ Inisiasi Proyek Baru</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: PORTAL DASHBOARD UTAMA -->
      ${
        activeTab === 'dashboard'
          ? `
        <div style="display:flex;flex-direction:column;gap:24px;">
          <!-- Welcome & Status Banner -->
          <div style="position:relative;overflow:hidden;border-radius:var(--radius-2xl);background:linear-gradient(135deg, #1e1b4b, #0f172a);color:#fff;padding:24px;border:1px solid rgba(99,102,241,.3);box-shadow:var(--shadow-lg);">
            <div style="position:relative;z-index:2;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
              <div style="max-width:580px;display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="padding:2px 10px;border-radius:var(--radius-full);font-size:10px;font-weight:800;background:rgba(99,102,241,.2);color:#a5b4fc;border:1px solid rgba(99,102,241,.3);">
                    ASTACODE COMMAND CENTER
                  </span>
                  <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#34d399;font-weight:700;">
                    <span style="width:8px;height:8px;border-radius:var(--radius-full);background:#34d399;"></span>
                    Sistem Operasional Normal
                  </span>
                </div>
                <h2 style="font-size:20px;font-weight:800;letter-spacing:-0.01em;margin:4px 0 0 0;">
                  Selamat Datang, Asisyah Sarah Azzahra
                </h2>
                <p style="font-size:12px;color:rgba(199,210,254,.8);line-height:1.5;margin:0;">
                  Seluruh jalur proyek <em>delivery</em>, alokasi <em>mandays</em>, dan jadwal pengujian UAT berada dalam status terpantau. Gunakan portal ini sebagai gerbang pusat untuk beralih cepat ke modul operasional lainnya.
                </p>
              </div>

              <!-- Quick Health Meter Box -->
              <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.05);backdrop-filter:blur(8px);padding:16px;border-radius:var(--radius-xl);border:1px solid rgba(255,255,255,.1);font-size:12px;font-family:var(--font-mono);">
                <div style="text-align:center;">
                  <span style="font-size:10px;color:#a5b4fc;text-transform:uppercase;display:block;">Portofolio Proyek</span>
                  <span style="font-size:18px;font-weight:900;color:#fff;">${projects.length} Proyek</span>
                </div>
                <div style="width:1px;height:32px;background:rgba(255,255,255,.1);"></div>
                <div style="text-align:center;">
                  <span style="font-size:10px;color:#a5b4fc;text-transform:uppercase;display:block;">SLA Kepatuhan</span>
                  <span style="font-size:18px;font-weight:900;color:#34d399;">99.8%</span>
                </div>
                <div style="width:1px;height:32px;background:rgba(255,255,255,.1);"></div>
                <div style="text-align:center;">
                  <span style="font-size:10px;color:#a5b4fc;text-transform:uppercase;display:block;">Critical Bug</span>
                  <span style="font-size:18px;font-weight:900;color:#c7d2fe;">0 (Nol)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PORTAL GATEWAY KE MENU LAIN -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;margin:0;">
                  <span style="color:var(--amber-500);display:flex;">${ICONS.zap}</span>
                  <span>Portal Gateway Eksekutif (Akses Cepat Antar Menu ERP)</span>
                </h3>
                <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
                  Pusat navigasi terpadu untuk membuka langsung data spesifik pada modul terkait dalam satu klik.
                </p>
              </div>
              <span style="font-size:11px;font-weight:700;color:var(--indigo-600);">
                6 Portal Terintegrasi
              </span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;">
              <!-- 1. Pipeline Presales CRM -->
              <div
                class="prj-gateway-card"
                data-route="pipeline"
                style="cursor:pointer;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:16px;box-shadow:var(--shadow-xs);transition:all var(--transition);display:flex;flex-direction:column;justify-content:space-between;"
              >
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="width:34px;height:34px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;">
                      ${ICONS.target}
                    </div>
                    <span style="font-family:var(--font-mono);font-size:12px;font-weight:900;color:var(--indigo-600);background:rgba(99,102,241,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                      ${leads.length} Leads
                    </span>
                  </div>
                  <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:10px 0 4px 0;">
                    Pipeline Presales & CRM
                  </h4>
                  <p style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:0;">
                    Kelola kanban leads baru, requirement AI, kalkulator RAB presales, hingga status deal penawaran.
                  </p>
                </div>
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:var(--indigo-600);">
                  <span>Buka Pipeline Kanban</span>
                  ${ICONS.chevronRight}
                </div>
              </div>

              <!-- 2. Master Customer -->
              <div
                class="prj-gateway-card"
                data-route="customers"
                style="cursor:pointer;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:16px;box-shadow:var(--shadow-xs);transition:all var(--transition);display:flex;flex-direction:column;justify-content:space-between;"
              >
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="width:34px;height:34px;border-radius:var(--radius-xl);background:rgba(16,185,129,.1);color:var(--emerald-600);display:flex;align-items:center;justify-content:center;">
                      ${ICONS.users}
                    </div>
                    <span style="font-family:var(--font-mono);font-size:12px;font-weight:900;color:var(--emerald-600);background:rgba(16,185,129,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                      ${customers.length} Klien
                    </span>
                  </div>
                  <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:10px 0 4px 0;">
                    Master Customer & PIC
                  </h4>
                  <p style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:0;">
                    Direktori lengkap korporasi klien, PIC pengambil keputusan, skor kesehatan relasi, dan riwayat deal.
                  </p>
                </div>
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:var(--emerald-600);">
                  <span>Buka Tabel Customer</span>
                  ${ICONS.chevronRight}
                </div>
              </div>

              <!-- 3. Setting TOP & Invoice -->
              <div
                class="prj-gateway-card"
                data-route="finance_top"
                style="cursor:pointer;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:16px;box-shadow:var(--shadow-xs);transition:all var(--transition);display:flex;flex-direction:column;justify-content:space-between;"
              >
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="width:34px;height:34px;border-radius:var(--radius-xl);background:rgba(245,158,11,.1);color:var(--amber-600);display:flex;align-items:center;justify-content:center;">
                      ${ICONS.dollarSign}
                    </div>
                    <span style="font-family:var(--font-mono);font-size:11px;font-weight:900;color:var(--amber-600);background:rgba(245,158,11,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                      ${formatRupiah(totalDraftInvoices)}
                    </span>
                  </div>
                  <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:10px 0 4px 0;">
                    Finansial TOP & Invoice
                  </h4>
                  <p style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:0;">
                    Otomasi faktur penagihan termin DP, UAT, dan BAST pasca verifikasi pencapaian milestone delivery.
                  </p>
                </div>
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:var(--amber-600);">
                  <span>Buka Billing & Invoice</span>
                  ${ICONS.chevronRight}
                </div>
              </div>

              <!-- 4. Kontrak & Legalitas 22 MoU -->
              <div
                class="prj-gateway-card"
                data-route="contracts_legal"
                style="cursor:pointer;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:16px;box-shadow:var(--shadow-xs);transition:all var(--transition);display:flex;flex-direction:column;justify-content:space-between;"
              >
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="width:34px;height:34px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;">
                      ${ICONS.shieldCheck}
                    </div>
                    <span style="font-family:var(--font-mono);font-size:12px;font-weight:900;color:var(--indigo-600);background:rgba(99,102,241,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                      22 Pasal Baku
                    </span>
                  </div>
                  <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:10px 0 4px 0;">
                    Manajemen Kontrak & Legalitas
                  </h4>
                  <p style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:0;">
                    Dokumen 4-Part resmi, repositori 22 klausul software house, addendum SPK, serta sertifikasi E-Sign UU ITE.
                  </p>
                </div>
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:var(--indigo-600);">
                  <span>Buka Kontrak & MoU</span>
                  ${ICONS.chevronRight}
                </div>
              </div>

              <!-- 5. WhatsApp Client Care -->
              <div
                class="prj-gateway-card"
                data-route="client_care"
                style="cursor:pointer;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:16px;box-shadow:var(--shadow-xs);transition:all var(--transition);display:flex;flex-direction:column;justify-content:space-between;"
              >
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="width:34px;height:34px;border-radius:var(--radius-xl);background:rgba(16,185,129,.1);color:var(--emerald-600);display:flex;align-items:center;justify-content:center;">
                      ${ICONS.messageSquare}
                    </div>
                    <span style="font-family:var(--font-mono);font-size:11px;font-weight:900;color:var(--emerald-600);background:rgba(16,185,129,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                      ${unreadWaCount > 0 ? `${unreadWaCount} Chat Masuk` : 'Aktif'}
                    </span>
                  </div>
                  <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:10px 0 4px 0;">
                    WhatsApp Client Care & Helpdesk
                  </h4>
                  <p style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:0;">
                    Saluran komunikasi instan PIC klien terintegrasi AI auto-suggest dan pelaporan kendala teknis.
                  </p>
                </div>
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:var(--emerald-600);">
                  <span>Buka WhatsApp Inbox</span>
                  ${ICONS.chevronRight}
                </div>
              </div>

              <!-- 6. Laporan Eksekutif -->
              <div
                class="prj-gateway-card"
                data-route="reports"
                style="cursor:pointer;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:16px;box-shadow:var(--shadow-xs);transition:all var(--transition);display:flex;flex-direction:column;justify-content:space-between;"
              >
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="width:34px;height:34px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;">
                      ${ICONS.barChart}
                    </div>
                    <span style="font-family:var(--font-mono);font-size:12px;font-weight:900;color:var(--indigo-600);background:rgba(99,102,241,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                      Analitik C-Level
                    </span>
                  </div>
                  <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:10px 0 4px 0;">
                    Laporan & Analisis Kinerja
                  </h4>
                  <p style="font-size:11px;color:var(--text-muted);line-height:1.4;margin:0;">
                    Evaluasi rasio profitabilitas proyek, efisiensi resource developer, dan proyeksi kas software house.
                  </p>
                </div>
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:var(--indigo-600);">
                  <span>Buka Laporan Eksekutif</span>
                  ${ICONS.chevronRight}
                </div>
              </div>
            </div>
          </div>

          <!-- TOP STAT METRIC CARDS -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;">
            <!-- Nilai Portofolio Delivery -->
            <div style="padding:20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
                <span>Nilai Portofolio Delivery</span>
                <span style="color:var(--emerald-500);display:flex;">${ICONS.dollarSign}</span>
              </div>
              <p style="font-size:20px;font-weight:900;font-family:var(--font-mono);color:var(--text-primary);margin:0;">
                ${formatRupiah(totalContractValue)}
              </p>
              <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--emerald-600);font-weight:600;">
                ${ICONS.trendingUp}
                <span>Terikat SPK & Kontrak Sah</span>
              </div>
            </div>

            <!-- Mandays Burn Rate -->
            <div style="padding:20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
                <span>Mandays Terpakai / Budget</span>
                <span style="color:var(--amber-500);display:flex;">${ICONS.flame}</span>
              </div>
              <p style="font-size:20px;font-weight:900;font-family:var(--font-mono);color:var(--text-primary);margin:0;">
                ${totalActualMandays} / ${totalBudgetMandays} MD
              </p>
              <div style="width:100%;background:var(--bg-surface);height:6px;border-radius:var(--radius-full);overflow:hidden;">
                <div style="background:var(--amber-500);height:100%;border-radius:var(--radius-full);width:${Math.min(mandaysBurnPct, 100)}%;"></div>
              </div>
              <p style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);margin:0;">
                Burn Rate: <strong>${mandaysBurnPct}%</strong> • Efisiensi Terkendali
              </p>
            </div>

            <!-- Rata-rata Progres Fisik -->
            <div style="padding:20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
                <span>Rata-Rata Progres Fisik</span>
                <span style="color:var(--indigo-500);display:flex;">${ICONS.activity}</span>
              </div>
              <p style="font-size:20px;font-weight:900;font-family:var(--font-mono);color:var(--indigo-600);margin:0;">
                ${avgProgress}%
              </p>
              <div style="width:100%;background:var(--bg-surface);height:6px;border-radius:var(--radius-full);overflow:hidden;">
                <div style="background:var(--indigo-600);height:100%;border-radius:var(--radius-full);width:${avgProgress}%;"></div>
              </div>
              <p style="font-size:10px;color:var(--text-muted);margin:0;">
                ${projects.filter((p) => p.status === 'Active').length} Proyek Sedang Dalam Sprint Aktif
              </p>
            </div>

            <!-- Status Penagihan Termin -->
            <div style="padding:20px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;color:var(--text-muted);font-size:12px;">
                <span>Realisasi Kas Termin (TOP)</span>
                <span style="color:var(--emerald-500);display:flex;">${ICONS.checkCircle}</span>
              </div>
              <p style="font-size:20px;font-weight:900;font-family:var(--font-mono);color:var(--emerald-600);margin:0;">
                ${formatRupiah(totalPaidInvoices)}
              </p>
              <p style="font-size:11px;color:var(--text-muted);margin:0;">
                Termin Terbayar: <strong>${invoices.filter((i) => i.status === 'Paid').length} Faktur</strong>
              </p>
            </div>
          </div>

          <!-- DETAIL BREAKDOWN PROYEK & KUALITAS DELIVERY -->
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
            <!-- Left: Monitoring Proyek Berjalan & Mandays -->
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
                  <div>
                    <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                      Status Eksekusi Proyek & Pemanfaatan Mandays
                    </h3>
                    <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
                      Perbandingan kapasitas tim teknis terhadap tenggat waktu penyelesaian deliverable.
                    </p>
                  </div>
                  <button
                    class="prj-switch-tab-btn"
                    data-tab="projects"
                    style="font-size:12px;font-weight:700;color:var(--indigo-600);background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;"
                  >
                    <span>Lihat Rincian</span>
                    ${ICONS.chevronRight}
                  </button>
                </div>

                <div style="display:flex;flex-direction:column;gap:16px;">
                  ${projects
                    .map((proj) => {
                      const burn = proj.budget_mandays > 0 ? Math.round((proj.actual_mandays / proj.budget_mandays) * 100) : 0;
                      return `
                      <div style="padding:16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:12px;">
                        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
                          <div>
                            <div style="display:flex;align-items:center;gap:8px;">
                              <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--indigo-600);background:rgba(99,102,241,.1);padding:2px 8px;border-radius:var(--radius-sm);">
                                ${proj.code}
                              </span>
                              <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:0;">
                                ${proj.title}
                              </h4>
                            </div>
                            <p style="font-size:11px;color:var(--text-muted);margin:4px 0 0 0;">
                              Klien: <strong style="color:var(--text-secondary);">${proj.customer_name}</strong> • PM: ${proj.pm_name}
                            </p>
                          </div>

                          <div style="text-align:right;">
                            <span style="font-family:var(--font-mono);font-size:12px;font-weight:900;color:var(--emerald-600);">
                              ${formatRupiah(proj.contract_value)}
                            </span>
                            <span style="display:block;font-size:10px;color:var(--text-muted);">
                              Target BAST: ${proj.end_date || '-'}
                            </span>
                          </div>
                        </div>

                        <!-- Visual Progress & Mandays Bar -->
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;padding-top:4px;">
                          <div style="display:flex;flex-direction:column;gap:4px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;">
                              <span style="color:var(--text-muted);font-weight:500;">Progress Fisik:</span>
                              <span style="font-weight:700;color:var(--text-primary);">${proj.progress_pct}%</span>
                            </div>
                            <div style="width:100%;background:var(--border-light);height:8px;border-radius:var(--radius-full);overflow:hidden;">
                              <div style="background:linear-gradient(90deg, var(--indigo-500), var(--emerald-500));height:100%;border-radius:var(--radius-full);width:${proj.progress_pct}%;"></div>
                            </div>
                          </div>

                          <div style="display:flex;flex-direction:column;gap:4px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;">
                              <span style="color:var(--text-muted);font-weight:500;">Burn Mandays:</span>
                              <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-primary);">
                                ${proj.actual_mandays} / ${proj.budget_mandays} MD (${burn}%)
                              </span>
                            </div>
                            <div style="width:100%;background:var(--border-light);height:8px;border-radius:var(--radius-full);overflow:hidden;">
                              <div style="height:100%;border-radius:var(--radius-full);width:${Math.min(burn, 100)}%;background:${
                                burn > 90 ? 'var(--rose-500)' : burn > 70 ? 'var(--amber-500)' : 'var(--indigo-500)'
                              };"></div>
                            </div>
                          </div>
                        </div>

                        <!-- Milestones status pills -->
                        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding-top:4px;">
                          <span style="font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Sprint:</span>
                          ${(proj.milestones || [])
                            .map(
                              (ms) => `
                            <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:var(--radius-md);${
                              ms.status === 'Completed'
                                ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);'
                                : ms.status === 'In Progress'
                                ? 'background:rgba(99,102,241,.1);color:var(--indigo-600);'
                                : 'background:var(--bg-canvas);color:var(--text-muted);'
                            }">
                              ${ms.name.split(':')[0]} (${ms.status})
                            </span>
                          `
                            )
                            .join('')}
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              </div>
            </div>

            <!-- Right: Upcoming Milestones & SLA Checklist -->
            <div style="display:flex;flex-direction:column;gap:16px;">
              <!-- Upcoming Milestones Feed -->
              <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
                  <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;margin:0;">
                    <span style="color:var(--indigo-500);display:flex;">${ICONS.calendar}</span>
                    <span>Jadwal Milestone Terdekat</span>
                  </h3>
                  <span style="font-size:10px;font-weight:700;color:var(--text-muted);">Timeline</span>
                </div>

                <div style="display:flex;flex-direction:column;gap:12px;">
                  ${allMilestones
                    .slice(0, 4)
                    .map(
                      (ms) => `
                    <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:4px;font-size:12px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">
                          ${ms.name}
                        </span>
                        <span style="padding:2px 6px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;${
                          ms.status === 'Completed'
                            ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);'
                            : ms.status === 'In Progress'
                            ? 'background:rgba(99,102,241,.1);color:var(--indigo-600);'
                            : 'background:var(--bg-card);color:var(--text-muted);'
                        }">
                          ${ms.status}
                        </span>
                      </div>
                      <p style="font-size:11px;color:var(--text-muted);margin:0;">
                        ${ms.projectCode} • ${ms.customerName}
                      </p>
                      <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:var(--text-muted);padding-top:4px;border-top:1px solid var(--border-light);">
                        <span>Target: ${ms.target_date}</span>
                        <span style="font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);">${ms.mandays_budget} Mandays</span>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- Delivery Assurance & SLA Checklist -->
              <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:12px;">
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:8px;margin:0;">
                  <span style="color:var(--emerald-500);display:flex;">${ICONS.shieldCheck}</span>
                  <span>Kepatuhan Kualitas & SLA</span>
                </h3>

                <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:var(--radius-lg);background:rgba(16,185,129,.08);color:var(--emerald-700);">
                    <span style="display:flex;align-items:center;gap:6px;font-weight:500;">
                      <span style="color:var(--emerald-600);display:flex;">${ICONS.checkCircle}</span>
                      <span>Zero Critical Vulnerabilities (OWASP)</span>
                    </span>
                    <span style="font-weight:800;font-size:10px;">PASS</span>
                  </div>

                  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:var(--radius-lg);background:rgba(16,185,129,.08);color:var(--emerald-700);">
                    <span style="display:flex;align-items:center;gap:6px;font-weight:500;">
                      <span style="color:var(--emerald-600);display:flex;">${ICONS.checkCircle}</span>
                      <span>CI/CD Automated Test</span>
                    </span>
                    <span style="font-weight:800;font-size:10px;">PASS</span>
                  </div>

                  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:var(--radius-lg);background:rgba(16,185,129,.08);color:var(--emerald-700);">
                    <span style="display:flex;align-items:center;gap:6px;font-weight:500;">
                      <span style="color:var(--emerald-600);display:flex;">${ICONS.checkCircle}</span>
                      <span>UAT Document & BAST Sign-Off</span>
                    </span>
                    <span style="font-weight:800;font-size:10px;">READY</span>
                  </div>

                  <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);color:var(--indigo-700);">
                    <span style="display:flex;align-items:center;gap:6px;font-weight:500;">
                      <span style="color:var(--indigo-600);display:flex;">${ICONS.clock}</span>
                      <span>Helpdesk SLA Uptime Target</span>
                    </span>
                    <span style="font-weight:800;font-size:10px;">99.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- TAB 2: DAFTAR PROYEK & DETAIL EKSEKUSI -->
      ${
        activeTab === 'projects'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Filter and Search Bar -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:16px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
            <div style="position:relative;flex:1;max-width:440px;">
              <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
                ${ICONS.search}
              </span>
              <input
                id="prj-search-input"
                type="text"
                placeholder="Cari judul proyek, PM, nama klien, kode PRJ..."
                value="${searchTerm}"
                style="width:100%;padding:8px 12px 8px 36px;border-radius:var(--radius-xl);font-size:12px;background:var(--bg-surface);border:1px solid transparent;color:var(--text-primary);outline:none;"
              />
            </div>

            <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
              <span style="color:var(--text-muted);font-weight:500;">Filter Status:</span>
              <select
                id="prj-status-filter"
                style="padding:6px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);color:var(--text-secondary);outline:none;font-weight:500;font-size:12px;cursor:pointer;"
              >
                <option value="ALL" ${statusFilter === 'ALL' ? 'selected' : ''}>Semua Status Proyek</option>
                <option value="Active" ${statusFilter === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Completed" ${statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="UAT" ${statusFilter === 'UAT' ? 'selected' : ''}>UAT</option>
                <option value="Planning" ${statusFilter === 'Planning' ? 'selected' : ''}>Planning</option>
              </select>
            </div>
          </div>

          <!-- Projects Cards List -->
          <div style="display:flex;flex-direction:column;gap:16px;">
            ${
              pagedProjects.length === 0
                ? `
              <div style="background:var(--bg-card);padding:48px;text-align:center;color:var(--text-muted);border-radius:var(--radius-2xl);border:1px solid var(--border-light);">
                Tidak ada proyek yang sesuai dengan kriteria pencarian.
              </div>
            `
                : pagedProjects
                    .map(
                      (project) => `
                  <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:24px;display:flex;flex-direction:column;gap:16px;box-shadow:var(--shadow-xs);">
                    <div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:16px;">
                      <div>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;padding:2px 8px;border-radius:var(--radius-sm);background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
                            ${project.code}
                          </span>
                          <h3 style="font-weight:800;font-size:16px;color:var(--text-primary);margin:0;">
                            ${project.title}
                          </h3>
                          <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:800;${
                            project.status === 'Active'
                              ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                              : 'background:var(--bg-surface);color:var(--text-secondary);border:1px solid var(--border-light);'
                          }">
                            ${project.status.toUpperCase()}
                          </span>
                        </div>
                        <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0 0;">
                          Klien: <strong style="color:var(--text-primary);">${project.customer_name}</strong> • Penanggung Jawab PM: <strong>${project.pm_name}</strong>
                        </p>
                      </div>

                      <div style="display:flex;align-items:center;gap:16px;font-size:12px;font-family:var(--font-mono);">
                        <div>
                          <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">Nilai Kontrak</span>
                          <p style="font-weight:700;color:var(--emerald-600);margin:2px 0 0 0;">
                            ${formatRupiah(project.contract_value)}
                          </p>
                        </div>
                        <div style="border-left:1px solid var(--border-light);padding-left:16px;">
                          <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">Mandays Burn</span>
                          <p style="font-weight:700;color:var(--indigo-600);margin:2px 0 0 0;">
                            ${project.actual_mandays} / ${project.budget_mandays} MD
                          </p>
                        </div>
                        <div style="border-left:1px solid var(--border-light);padding-left:16px;">
                          <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;display:block;">Progres</span>
                          <p style="font-weight:700;color:var(--text-primary);margin:2px 0 0 0;">${project.progress_pct}%</p>
                        </div>
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div style="width:100%;height:10px;border-radius:var(--radius-full);background:var(--bg-surface);overflow:hidden;">
                      <div style="height:100%;background:linear-gradient(90deg, var(--indigo-500), var(--emerald-500));border-radius:var(--radius-full);width:${project.progress_pct}%;"></div>
                    </div>

                    <!-- Milestones List -->
                    <div style="padding-top:4px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <h4 style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin:0;">
                          Milestones & Deliverable Sprints (${(project.milestones || []).length}):
                        </h4>
                        <button
                          class="prj-add-milestone-btn"
                          data-project-id="${project.id}"
                          style="font-size:11px;font-weight:700;color:var(--indigo-600);background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;"
                        >
                          ${ICONS.plus}
                          <span>Tambah Sprint Milestone</span>
                        </button>
                      </div>

                      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:12px;font-size:12px;">
                        ${(project.milestones || [])
                          .map(
                            (ms) => `
                          <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:6px;">
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                              <span style="font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                ${ms.name}
                              </span>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);">
                              <span>Target: ${ms.target_date}</span>
                              <span style="font-weight:600;${
                                ms.status === 'Completed'
                                  ? 'color:var(--emerald-600);'
                                  : ms.status === 'In Progress'
                                  ? 'color:var(--indigo-600);'
                                  : 'color:var(--text-muted);'
                              }">
                                ${ms.status}
                              </span>
                            </div>
                            <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">
                              Alokasi: ${ms.mandays_budget} Mandays
                            </div>
                          </div>
                        `
                          )
                          .join('')}
                      </div>
                    </div>

                    <!-- Actions footer -->
                    <div style="padding-top:12px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;font-size:12px;">
                      <div style="font-size:11px;color:var(--text-muted);">
                        Garansi: <strong>${project.warranty_period || '90 Hari'}</strong> • SLA: ${project.sla_level || '99.5%'}
                      </div>

                      <div style="display:flex;align-items:center;gap:8px;">
                        <button
                          class="prj-link-to-view"
                          data-route="finance_top"
                          style="padding:6px 12px;border-radius:var(--radius-lg);font-size:12px;font-weight:600;color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-light);cursor:pointer;display:flex;align-items:center;gap:4px;"
                        >
                          <span style="color:var(--amber-500);display:flex;">${ICONS.dollarSign}</span>
                          <span>Lihat Tagihan TOP</span>
                        </button>
                        <button
                          class="prj-link-to-view"
                          data-route="contracts_legal"
                          style="padding:6px 12px;border-radius:var(--radius-lg);font-size:12px;font-weight:600;color:var(--indigo-600);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);cursor:pointer;display:flex;align-items:center;gap:4px;"
                        >
                          ${ICONS.fileText}
                          <span>Buka SPK Kontrak</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `
                    )
                    .join('')
            }

            <!-- Pagination Controls -->
            <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);overflow:hidden;box-shadow:var(--shadow-xs);">
              ${renderPaginationControls(pagination, [2, 4, 8], 'projects-list-pagination')}
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- TAB 3: RESOURCE & MANDAYS VELOCITY -->
      ${
        activeTab === 'mandays'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:24px;display:flex;flex-direction:column;gap:20px;box-shadow:var(--shadow-xs);">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border-light);padding-bottom:16px;">
              <div>
                <h3 style="font-size:16px;font-weight:800;color:var(--text-primary);margin:0;">
                  Analisis Efisiensi Mandays & Kapasitas Engineering
                </h3>
                <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
                  Pemantauan konsumsi mandays aktual developer vs estimasi awal AI Requirement & RAB ASTACODE.
                </p>
              </div>

              <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;padding:6px 12px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);color:var(--indigo-600);">
                Total Alokasi: ${totalBudgetMandays} Mandays
              </div>
            </div>

            <!-- Mandays Table -->
            <div style="border-radius:var(--radius-xl);border:1px solid var(--border-light);overflow:hidden;font-size:12px;">
              <table style="width:100%;text-align:left;border-collapse:collapse;">
                <thead style="background:var(--bg-surface);font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">
                  <tr>
                    <th style="padding:12px 14px;">Kode & Proyek</th>
                    <th style="padding:12px 14px;">Klien</th>
                    <th style="padding:12px 14px;text-align:right;">Budget MD</th>
                    <th style="padding:12px 14px;text-align:right;">Actual MD</th>
                    <th style="padding:12px 14px;text-align:right;">Sisa Mandays</th>
                    <th style="padding:12px 14px;text-align:right;">Burn Rate</th>
                    <th style="padding:12px 14px;text-align:center;">Status Anggaran</th>
                  </tr>
                </thead>
                <tbody style="border-top:1px solid var(--border-light);">
                  ${projects
                    .map((proj) => {
                      const remaining = proj.budget_mandays - proj.actual_mandays;
                      const burn = proj.budget_mandays > 0 ? Math.round((proj.actual_mandays / proj.budget_mandays) * 100) : 0;
                      return `
                      <tr style="border-bottom:1px solid var(--border-light);transition:background var(--transition);">
                        <td style="padding:12px 14px;">
                          <span style="font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);">${proj.code}</span>
                          <span style="display:block;font-weight:600;color:var(--text-primary);margin-top:2px;">${proj.title}</span>
                        </td>
                        <td style="padding:12px 14px;color:var(--text-secondary);">${proj.customer_name}</td>
                        <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:700;">${proj.budget_mandays} MD</td>
                        <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);">${proj.actual_mandays} MD</td>
                        <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:700;color:var(--emerald-600);">${remaining} MD</td>
                        <td style="padding:12px 14px;text-align:right;font-family:var(--font-mono);font-weight:700;">${burn}%</td>
                        <td style="padding:12px 14px;text-align:center;">
                          <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;${
                            burn <= 80
                              ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                              : burn <= 100
                              ? 'background:rgba(245,158,11,.1);color:var(--amber-600);border:1px solid rgba(245,158,11,.2);'
                              : 'background:rgba(239,68,68,.1);color:var(--rose-600);border:1px solid rgba(239,68,68,.2);'
                          }">
                            ${burn <= 80 ? 'Optimal' : burn <= 100 ? 'On Track' : 'Overrun'}
                          </span>
                        </td>
                      </tr>
                    `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- TAB 4: ROADMAP SPRINT & JADWAL BAST -->
      ${
        activeTab === 'timeline'
          ? `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:24px;display:flex;flex-direction:column;gap:20px;box-shadow:var(--shadow-xs);">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border-light);padding-bottom:16px;">
              <div>
                <h3 style="font-size:16px;font-weight:800;color:var(--text-primary);margin:0;">
                  Roadmap Eksekusi Sprint & Rilis Deliverable ASTACODE
                </h3>
                <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
                  Urutan deliverable per tanggal target penyerahan kode, pengujian UAT, dan BAST.
                </p>
              </div>

              <button
                id="prj-print-roadmap-btn"
                style="padding:8px 14px;border-radius:var(--radius-xl);font-size:12px;font-weight:700;color:#fff;background:var(--indigo-600);border:none;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:var(--shadow-xs);"
              >
                ${ICONS.printer}
                <span>Cetak Roadmap</span>
              </button>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;">
              ${allMilestones
                .map(
                  (ms, idx) => `
                <div style="padding:16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-size:12px;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:28px;height:28px;border-radius:var(--radius-md);background:rgba(99,102,241,.1);color:var(--indigo-600);font-family:var(--font-mono);font-weight:700;display:flex;align-items:center;justify-content:center;font-size:12px;">
                      ${idx + 1}
                    </div>
                    <div>
                      <h4 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:0;">${ms.name}</h4>
                      <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">
                        ${ms.projectTitle} • Klien: ${ms.customerName}
                      </p>
                    </div>
                  </div>

                  <div style="display:flex;align-items:center;gap:16px;font-size:12px;font-family:var(--font-mono);">
                    <div>
                      <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;display:block;">Target Selesai</span>
                      <span style="font-weight:700;color:var(--text-primary);">${ms.target_date}</span>
                    </div>
                    <div>
                      <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;display:block;">Alokasi</span>
                      <span style="font-weight:700;color:var(--indigo-600);">${ms.mandays_budget} Mandays</span>
                    </div>
                    <span style="padding:4px 10px;border-radius:var(--radius-full);font-size:10px;font-weight:700;${
                      ms.status === 'Completed'
                        ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                        : ms.status === 'In Progress'
                        ? 'background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);'
                        : 'background:var(--bg-card);color:var(--text-muted);'
                    }">
                      ${ms.status}
                    </span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL: INISIASI PROYEK BARU -->
      ${
        isNewProjectModalOpen
          ? `
        <div id="new-prj-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);overflow-y:auto;">
          <div style="width:100%;max-width:520px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Inisiasi Proyek Baru (Proyek & Delivery)
                </h3>
                <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">ASTACODE Software House Project Management</p>
              </div>
              <button id="new-prj-modal-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <form id="new-prj-form" style="display:flex;flex-direction:column;gap:14px;font-size:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Pilih Klien:</label>
                <select
                  id="new-prj-cust-select"
                  style="width:100%;padding:10px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;font-weight:600;"
                >
                  ${customers
                    .map(
                      (c) => `
                    <option value="${c.id}" ${c.id === selectedCustomerForNew ? 'selected' : ''}>
                      ${c.legal_name} (${c.code})
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Judul Proyek Sistem:</label>
                <input
                  id="new-prj-title-input"
                  type="text"
                  required
                  placeholder="Contoh: Modern ERP & Supply Chain Automation"
                  value="${newTitle}"
                  style="width:100%;padding:10px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                />
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Nilai Kontrak (IDR):</label>
                  <input
                    id="new-prj-contract-input"
                    type="number"
                    min="0"
                    step="1000000"
                    required
                    value="${newContractValue}"
                    style="width:100%;padding:10px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                  />
                </div>

                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Budget Mandays:</label>
                  <input
                    id="new-prj-mandays-input"
                    type="number"
                    min="1"
                    required
                    value="${newBudgetMandays}"
                    style="width:100%;padding:10px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                  />
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Garansi Bug Pasca BAST:</label>
                  <input
                    id="new-prj-warranty-input"
                    type="text"
                    value="${newWarranty}"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  />
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Komitmen SLA:</label>
                  <input
                    id="new-prj-sla-input"
                    type="text"
                    value="${newSla}"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  />
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
                <button
                  type="button"
                  id="new-prj-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      `
          : ''
      }

      <!-- MODAL: TAMBAH MILESTONE SPRINT -->
      ${
        isAddMilestoneOpen && inspectingProject
          ? `
        <div id="add-ms-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);">
          <div style="width:100%;max-width:440px;background:var(--bg-card);border-radius:var(--radius-2xl);padding:24px;box-shadow:var(--shadow-xl);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Tambah Sprint Milestone ke ${inspectingProject.code}
                </h3>
                <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">${inspectingProject.title}</p>
              </div>
              <button id="add-ms-close-btn" style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;">
                ${ICONS.x}
              </button>
            </div>

            <form id="add-ms-form" style="display:flex;flex-direction:column;gap:12px;font-size:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-weight:700;color:var(--text-secondary);">Nama Milestone / Sprint:</label>
                <input
                  id="add-ms-name-input"
                  type="text"
                  required
                  placeholder="Contoh: Sprint 4: Payment Gateway & UAT Sign-off"
                  value="${newMilestoneName}"
                  style="width:100%;padding:10px 12px;border-radius:var(--radius-xl);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                />
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Target Tanggal:</label>
                  <input
                    id="add-ms-target-date-input"
                    type="date"
                    required
                    value="${newMilestoneTargetDate}"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  />
                </div>

                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:700;color:var(--text-secondary);">Budget Mandays:</label>
                  <input
                    id="add-ms-mandays-input"
                    type="number"
                    min="1"
                    required
                    value="${newMilestoneMandays}"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                  />
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px;border-top:1px solid var(--border-light);">
                <button
                  type="button"
                  id="add-ms-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
                >
                  Simpan Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;
}

export function bindProjectsListEvents(container) {
  // Tab Switcher Buttons
  container.querySelectorAll('.prj-tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      reRender(container);
    });
  });

  // Switch tab buttons inside sections
  container.querySelectorAll('.prj-switch-tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      reRender(container);
    });
  });

  // Gateway Cards Click Navigation
  container.querySelectorAll('.prj-gateway-card[data-route]').forEach((card) => {
    card.addEventListener('click', () => {
      const route = card.dataset.route;
      if (route) {
        if (route === 'pipeline') {
          store.setPipelineViewMode('kanban');
        }
        store.setActiveView(route);
      }
    });
  });

  // Link to views buttons inside project cards
  container.querySelectorAll('.prj-link-to-view[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      if (route) {
        store.setActiveView(route);
      }
    });
  });

  // Search input
  const searchInput = container.querySelector('#prj-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      currentPage = 1;
      reRender(container);
    });
  }

  // Status Filter
  const statusFilterEl = container.querySelector('#prj-status-filter');
  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      currentPage = 1;
      reRender(container);
    });
  }

  // Open New Project Modal
  const openNewModalBtn = container.querySelector('#prj-open-new-modal-btn');
  if (openNewModalBtn) {
    openNewModalBtn.addEventListener('click', () => {
      const { customers } = store.getState();
      if (!selectedCustomerForNew && customers.length > 0) {
        selectedCustomerForNew = customers[0].id;
      }
      isNewProjectModalOpen = true;
      reRender(container);
    });
  }

  // Close New Project Modal
  const closeNewModalBtn = container.querySelector('#new-prj-modal-close-btn');
  const cancelNewBtn = container.querySelector('#new-prj-cancel-btn');
  if (closeNewModalBtn) {
    closeNewModalBtn.addEventListener('click', () => {
      isNewProjectModalOpen = false;
      reRender(container);
    });
  }
  if (cancelNewBtn) {
    cancelNewBtn.addEventListener('click', () => {
      isNewProjectModalOpen = false;
      reRender(container);
    });
  }

  // Modal backdrop click
  const newPrjBackdrop = container.querySelector('#new-prj-modal-backdrop');
  if (newPrjBackdrop) {
    newPrjBackdrop.addEventListener('click', (e) => {
      if (e.target === newPrjBackdrop) {
        isNewProjectModalOpen = false;
        reRender(container);
      }
    });
  }

  // New Project Form input bindings
  const custSelect = container.querySelector('#new-prj-cust-select');
  if (custSelect) {
    custSelect.addEventListener('change', (e) => (selectedCustomerForNew = e.target.value));
  }
  const titleInput = container.querySelector('#new-prj-title-input');
  if (titleInput) {
    titleInput.addEventListener('input', (e) => (newTitle = e.target.value));
  }
  const contractInput = container.querySelector('#new-prj-contract-input');
  if (contractInput) {
    contractInput.addEventListener('input', (e) => (newContractValue = Number(e.target.value)));
  }
  const mandaysInput = container.querySelector('#new-prj-mandays-input');
  if (mandaysInput) {
    mandaysInput.addEventListener('input', (e) => (newBudgetMandays = Number(e.target.value)));
  }
  const warrantyInput = container.querySelector('#new-prj-warranty-input');
  if (warrantyInput) {
    warrantyInput.addEventListener('input', (e) => (newWarranty = e.target.value));
  }
  const slaInput = container.querySelector('#new-prj-sla-input');
  if (slaInput) {
    slaInput.addEventListener('input', (e) => (newSla = e.target.value));
  }

  // Submit New Project Form
  const newPrjForm = container.querySelector('#new-prj-form');
  if (newPrjForm) {
    newPrjForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { customers } = store.getState();
      const cust = customers.find((c) => c.id === selectedCustomerForNew) || customers[0];

      const created = store.addNewProject({
        title: newTitle || 'Proyek Solusi Baru',
        customer_id: cust.id,
        customer_name: cust.legal_name,
        contract_value: newContractValue || 100000000,
        budget_mandays: newBudgetMandays || 90,
        actual_mandays: 0,
        status: 'Active',
        pm_name: 'Asisyah Sarah Azzahra',
        warranty_period: newWarranty,
        sla_level: newSla,
        progress_pct: 0,
      });

      isNewProjectModalOpen = false;
      newTitle = '';

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Proyek baru "${created.code}: ${created.title}" berhasil diinisiasi ke sistem ASTACODE!`,
            type: 'success',
          },
        })
      );

      reRender(container);
    });
  }

  // Open Add Milestone Modal
  container.querySelectorAll('.prj-add-milestone-btn[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      inspectingProjectId = btn.dataset.projectId;
      isAddMilestoneOpen = true;
      reRender(container);
    });
  });

  // Close Add Milestone Modal
  const closeMsBtn = container.querySelector('#add-ms-close-btn');
  const cancelMsBtn = container.querySelector('#add-ms-cancel-btn');
  if (closeMsBtn) {
    closeMsBtn.addEventListener('click', () => {
      isAddMilestoneOpen = false;
      inspectingProjectId = null;
      reRender(container);
    });
  }
  if (cancelMsBtn) {
    cancelMsBtn.addEventListener('click', () => {
      isAddMilestoneOpen = false;
      inspectingProjectId = null;
      reRender(container);
    });
  }

  const addMsBackdrop = container.querySelector('#add-ms-modal-backdrop');
  if (addMsBackdrop) {
    addMsBackdrop.addEventListener('click', (e) => {
      if (e.target === addMsBackdrop) {
        isAddMilestoneOpen = false;
        inspectingProjectId = null;
        reRender(container);
      }
    });
  }

  // Milestone input bindings
  const msNameInput = container.querySelector('#add-ms-name-input');
  if (msNameInput) {
    msNameInput.addEventListener('input', (e) => (newMilestoneName = e.target.value));
  }
  const msDateInput = container.querySelector('#add-ms-target-date-input');
  if (msDateInput) {
    msDateInput.addEventListener('input', (e) => (newMilestoneTargetDate = e.target.value));
  }
  const msMandaysInput = container.querySelector('#add-ms-mandays-input');
  if (msMandaysInput) {
    msMandaysInput.addEventListener('input', (e) => (newMilestoneMandays = Number(e.target.value)));
  }

  // Submit Milestone Form
  const addMsForm = container.querySelector('#add-ms-form');
  if (addMsForm) {
    addMsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { projects } = store.getState();
      const proj = projects.find((p) => p.id === inspectingProjectId);
      if (!proj || !newMilestoneName.trim()) return;

      const newMs = {
        id: `ms-${Date.now()}`,
        name: newMilestoneName.trim(),
        target_date: newMilestoneTargetDate,
        status: 'Pending',
        mandays_budget: newMilestoneMandays,
        mandays_actual: 0,
      };

      if (!proj.milestones) proj.milestones = [];
      proj.milestones.push(newMs);

      isAddMilestoneOpen = false;
      newMilestoneName = '';
      inspectingProjectId = null;

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Milestone "${newMs.name}" berhasil ditambahkan ke ${proj.code}!`,
            type: 'success',
          },
        })
      );

      reRender(container);
    });
  }

  // Print Roadmap Button
  const printRoadmapBtn = container.querySelector('#prj-print-roadmap-btn');
  if (printRoadmapBtn) {
    printRoadmapBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Pagination binding
  bindPaginationEvents(
    container,
    (newPage) => {
      currentPage = newPage;
      reRender(container);
    },
    (newPageSize) => {
      currentPageSize = newPageSize;
      currentPage = 1;
      reRender(container);
    },
    'projects-list-pagination'
  );
}

function reRender(container) {
  container.innerHTML = renderProjectsList();
  bindProjectsListEvents(container);
}

export function mount(container) {
  reRender(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'projects') {
      reRender(container);
    }
  });

  return unsubscribe;
}
