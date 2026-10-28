/**
 * SettingTopInvoicePage.js — Vanilla JS Finance Setting TOP & Invoicing
 * Converted from src/components/finance/SettingTopInvoicePage.tsx
 */

import store from '../../store/store.js';
import { formatRupiah } from '../../utils/topCalculator.js';
import { paginate } from '../../utils/pagination.js';
import { renderPaginationControls, bindPaginationEvents } from '../common/PaginationControls.js';

let activeTab = 'top_setting'; // 'top_setting' | 'invoices'
let selectedProjectId = '';
let currentPage = 1;
let currentPageSize = 5;

const ICONS = {
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  fileCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>`,
};

export function renderSettingTopInvoicePage() {
  const { projects, invoices } = store.getState();

  if (!selectedProjectId && projects.length > 0) {
    selectedProjectId = projects[0].id;
  }

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  const { data: pagedInvoices, pagination } = paginate(invoices, currentPage, currentPageSize);

  return `
    <div style="flex:1;display:flex;flex-direction:column;height:100%;overflow-y:auto;background:var(--bg-canvas);padding:24px;gap:24px;">
      
      <!-- Header -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:20px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <h1 style="font-size:16px;font-weight:800;color:var(--text-primary);letter-spacing:-0.01em;margin:0;">
              Modul Kontrak, Invoicing & Setting TOP (Termin Pembayaran)
            </h1>
            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
              PRD Section 8.11.1
            </span>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0 0;">
            Setting TOP diwariskan langsung dari Quotation yang disetujui (Deal) dan mengendalikan jadwal penerbitan invoice per termin.
          </p>
        </div>

        <!-- View Switcher -->
        <div style="display:flex;align-items:center;gap:4px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-xl);font-size:12px;font-weight:600;">
          <button
            class="top-tab-btn ${activeTab === 'top_setting' ? 'active' : ''}"
            data-tab="top_setting"
            style="padding:6px 14px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
              activeTab === 'top_setting'
                ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                : 'background:none;color:var(--text-muted);'
            }"
          >
            Setting TOP per Kontrak
          </button>
          <button
            class="top-tab-btn ${activeTab === 'invoices' ? 'active' : ''}"
            data-tab="invoices"
            style="padding:6px 14px;border-radius:var(--radius-lg);border:none;cursor:pointer;transition:all var(--transition);${
              activeTab === 'invoices'
                ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                : 'background:none;color:var(--text-muted);'
            }"
          >
            Daftar Invoice Terbit (${invoices.length})
          </button>
        </div>
      </div>

      <!-- TAB 1: SETTING TOP PER KONTRAK -->
      ${
        activeTab === 'top_setting' && currentProject
          ? `
        <div style="display:flex;flex-direction:column;gap:24px;">
          <!-- Project Selector Card -->
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
              <div>
                <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;display:block;">
                  Pilih Kontrak / Proyek Aktif:
                </span>
                <select
                  id="top-project-select"
                  style="display:block;margin-top:6px;padding:8px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);font-size:12px;font-weight:700;color:var(--text-primary);outline:none;cursor:pointer;"
                >
                  ${projects
                    .map(
                      (p) => `
                    <option value="${p.id}" ${p.id === currentProject.id ? 'selected' : ''}>
                      ${p.contract_number} • ${p.title} (${p.customer_name})
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>

              <div style="display:flex;align-items:center;gap:24px;font-size:12px;">
                <div>
                  <span style="color:var(--text-muted);font-size:11px;display:block;">Nilai Kontrak Total:</span>
                  <p style="font-family:var(--font-mono);font-weight:800;font-size:15px;color:var(--indigo-600);margin:2px 0 0 0;">
                    ${formatRupiah(currentProject.contract_value)}
                  </p>
                </div>
                <div style="border-left:1px solid var(--border-light);padding-left:16px;">
                  <span style="color:var(--text-muted);font-size:11px;display:block;">Skema Termin TOP:</span>
                  <p style="font-weight:700;color:var(--text-primary);margin:2px 0 0 0;">
                    ${currentProject.top_scheme.preset_name} (${(currentProject.top_scheme.items || []).length} Termin)
                  </p>
                </div>
                <div style="border-left:1px solid var(--border-light);padding-left:16px;">
                  <span style="color:var(--text-muted);font-size:11px;display:block;">Status Kontrak:</span>
                  <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);display:inline-block;margin-top:2px;">
                    AKTIF BERJALAN
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Setting TOP Schedule Table -->
          <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Jadwal Termin Pembayaran Kontrak ${currentProject.contract_number}
                </h3>
                <p style="font-size:12px;color:var(--text-muted);margin:2px 0 0 0;">
                  🔒 Termin yang sudah diterbitkan invoice terkunci demi kepatuhan akuntansi (PRD BR-19).
                </p>
              </div>
            </div>

            <div style="overflow-x:auto;">
              <table style="width:100%;text-align:left;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-surface);border-bottom:1px solid var(--border-light);color:var(--text-muted);font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.05em;">
                    <th style="padding:12px 14px;width:48px;text-align:center;">No</th>
                    <th style="padding:12px 14px;">Nama Termin</th>
                    <th style="padding:12px 14px;width:90px;">Porsi (%)</th>
                    <th style="padding:12px 14px;width:150px;">Nominal (IDR)</th>
                    <th style="padding:12px 14px;">Pemicu Tagihan (Trigger)</th>
                    <th style="padding:12px 14px;width:120px;">Status Termin</th>
                    <th style="padding:12px 14px;text-align:right;">Aksi Finance</th>
                  </tr>
                </thead>
                <tbody style="border-top:1px solid var(--border-light);">
                  ${(currentProject.top_scheme.items || [])
                    .map((term, idx) => {
                      const isTermInvoiced = term.status === 'Invoiced' || term.is_locked || idx === 0;

                      return `
                      <tr style="border-bottom:1px solid var(--border-light);transition:background var(--transition);">
                        <td style="padding:12px 14px;text-align:center;font-family:var(--font-mono);font-weight:700;color:var(--text-muted);">
                          ${idx + 1}
                        </td>
                        <td style="padding:12px 14px;">
                          <div style="font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
                            <span>${term.name}</span>
                            ${
                              isTermInvoiced
                                ? `
                              <span title="Terkunci: Invoice sudah terbit" style="color:var(--text-muted);display:flex;">
                                ${ICONS.lock}
                              </span>
                            `
                                : ''
                            }
                          </div>
                          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${term.description || ''}</div>
                        </td>
                        <td style="padding:12px 14px;font-family:var(--font-mono);font-weight:700;">${term.value}%</td>
                        <td style="padding:12px 14px;font-family:var(--font-mono);font-weight:800;color:var(--emerald-600);">
                          ${formatRupiah(term.calculated_amount)}
                        </td>
                        <td style="padding:12px 14px;color:var(--text-secondary);">
                          <div>${term.trigger_label || '-'}</div>
                          <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">${term.due_days_label || '-'}</span>
                        </td>
                        <td style="padding:12px 14px;">
                          ${
                            idx === 0
                              ? `
                            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:800;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);">
                              ✔ LUNAS (PAID)
                            </span>
                          `
                              : isTermInvoiced
                              ? `
                            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:800;background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
                              🔒 INVOICED
                            </span>
                          `
                              : `
                            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(245,158,11,.1);color:var(--amber-600);border:1px solid rgba(245,158,11,.2);">
                              PLANNED
                            </span>
                          `
                          }
                        </td>
                        <td style="padding:12px 14px;text-align:right;">
                          ${
                            idx === 0
                              ? `
                            <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">INV/2026/10/0001</span>
                          `
                              : isTermInvoiced
                              ? `
                            <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">Invoice Terbit</span>
                          `
                              : `
                            <button
                              class="top-issue-invoice-btn"
                              data-contract-no="${currentProject.contract_number}"
                              data-term-no="${term.term_no}"
                              style="padding:6px 14px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--indigo-600), var(--indigo-700));color:#fff;font-weight:700;font-size:11px;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(99,102,241,.25);"
                            >
                              Terbitkan Invoice
                            </button>
                          `
                          }
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

      <!-- TAB 2: DAFTAR INVOICE TERBIT -->
      ${
        activeTab === 'invoices'
          ? `
        <div style="background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);padding:20px;box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:12px;">
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
              Daftar Rekapitulasi Invoice Termin Terbit
            </h3>
            <span style="font-size:12px;color:var(--text-muted);">Total ${invoices.length} Faktur Tagihan</span>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%;text-align:left;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:var(--bg-surface);border-bottom:1px solid var(--border-light);color:var(--text-muted);font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.05em;">
                  <th style="padding:12px 14px;">No. Invoice</th>
                  <th style="padding:12px 14px;">Kontrak & Proyek</th>
                  <th style="padding:12px 14px;">Customer</th>
                  <th style="padding:12px 14px;">Termin</th>
                  <th style="padding:12px 14px;">Grand Total (Rp)</th>
                  <th style="padding:12px 14px;">Jatuh Tempo</th>
                  <th style="padding:12px 14px;">Status</th>
                </tr>
              </thead>
              <tbody style="border-top:1px solid var(--border-light);">
                ${
                  pagedInvoices.length === 0
                    ? `
                  <tr>
                    <td colspan="7" style="padding:32px;text-align:center;color:var(--text-muted);">
                      Belum ada invoice yang diterbitkan.
                    </td>
                  </tr>
                `
                    : pagedInvoices
                        .map(
                          (inv) => `
                    <tr style="border-bottom:1px solid var(--border-light);transition:background var(--transition);">
                      <td style="padding:12px 14px;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);">
                        ${inv.invoice_number}
                      </td>
                      <td style="padding:12px 14px;">
                        <div style="font-weight:700;color:var(--text-primary);">${inv.project_title}</div>
                        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);margin-top:2px;">${inv.contract_number}</div>
                      </td>
                      <td style="padding:12px 14px;font-weight:500;color:var(--text-secondary);">
                        ${inv.customer_name}
                      </td>
                      <td style="padding:12px 14px;font-weight:600;color:var(--text-primary);">
                        ${inv.termin_name}
                      </td>
                      <td style="padding:12px 14px;font-family:var(--font-mono);font-weight:800;color:var(--emerald-600);">
                        ${formatRupiah(inv.grand_total)}
                      </td>
                      <td style="padding:12px 14px;font-family:var(--font-mono);color:var(--text-muted);">${inv.due_date}</td>
                      <td style="padding:12px 14px;">
                        <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:800;${
                          inv.status === 'Paid'
                            ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                            : 'background:rgba(245,158,11,.1);color:var(--amber-600);border:1px solid rgba(245,158,11,.2);'
                        }">
                          ${inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>

          <div style="border-top:1px solid var(--border-light);">
            ${renderPaginationControls(pagination, [5, 10, 20], 'top-invoices-pagination')}
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;
}

export function bindSettingTopInvoiceEvents(container) {
  // Tab buttons
  container.querySelectorAll('.top-tab-btn[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      reRender(container);
    });
  });

  // Project selector
  const prjSelect = container.querySelector('#top-project-select');
  if (prjSelect) {
    prjSelect.addEventListener('change', (e) => {
      selectedProjectId = e.target.value;
      reRender(container);
    });
  }

  // Issue invoice button
  container.querySelectorAll('.top-issue-invoice-btn[data-contract-no]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const contractNo = btn.dataset.contractNo;
      const termNo = Number(btn.dataset.termNo);

      store.issueInvoiceFromTerm(contractNo, termNo);

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Invoice untuk Termin ${termNo} Kontrak ${contractNo} berhasil diterbitkan!`,
            type: 'success',
          },
        })
      );

      reRender(container);
    });
  });

  // Pagination
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
    'top-invoices-pagination'
  );
}

function reRender(container) {
  container.innerHTML = renderSettingTopInvoicePage();
  bindSettingTopInvoiceEvents(container);
}

export function mount(container) {
  reRender(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'finance_top') {
      reRender(container);
    }
  });

  return unsubscribe;
}
