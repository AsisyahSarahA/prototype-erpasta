/**
 * CustomersList.js — Vanilla JS Master Data Customer (Accounts & Contacts 360°)
 * Converted from src/components/customers/CustomersList.tsx
 */

import store from '../../store/store.js';
import { paginate } from '../../utils/pagination.js';
import { renderPaginationControls, bindPaginationEvents } from '../common/PaginationControls.js';

// Module-level UI State
let searchTerm = '';
let industryFilter = 'ALL';
let statusFilter = 'ALL';
let sourceFilter = 'ALL';
let currentPage = 1;
let currentPageSize = 5;
let selectedCustDetailId = null;
let isAddModalOpen = false;

// Form state for New Customer
let newForm = {
  legalName: '',
  brandName: '',
  industry: 'Manufaktur & Fabrikasi',
  customIndustry: '',
  companySize: '50-100 Karyawan',
  customCompanySize: '',
  source: 'Website',
  customSource: '',
  website: '',
  npwp: '',
  city: '',
  province: '',
  address: '',
  picName: '',
  picJobTitle: '',
  picPhone: '',
  picEmail: '',
  picRole: 'decision_maker',
  customPicRole: '',
};

const ICONS = {
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
};

function resetNewCustomerForm() {
  newForm = {
    legalName: '',
    brandName: '',
    industry: 'Manufaktur & Fabrikasi',
    customIndustry: '',
    companySize: '50-100 Karyawan',
    customCompanySize: '',
    source: 'Website',
    customSource: '',
    website: '',
    npwp: '',
    city: '',
    province: '',
    address: '',
    picName: '',
    picJobTitle: '',
    picPhone: '',
    picEmail: '',
    picRole: 'decision_maker',
    customPicRole: '',
  };
}

export function renderCustomersList() {
  const { customers, leads } = store.getState();

  // Distinct industries & sources
  const industries = Array.from(new Set(customers.map((c) => c.industry))).filter(Boolean);
  const sources = Array.from(new Set(customers.map((c) => c.first_touch_source))).filter(Boolean);

  const q = searchTerm.toLowerCase().trim();
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      q === '' ||
      c.legal_name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.brand_name && c.brand_name.toLowerCase().includes(q)) ||
      (c.contacts && c.contacts.some((cnt) => cnt.name.toLowerCase().includes(q)));

    const matchesIndustry = industryFilter === 'ALL' || c.industry === industryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.lifecycle_status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || c.first_touch_source === sourceFilter;

    return matchesSearch && matchesIndustry && matchesStatus && matchesSource;
  });

  const { data: pagedCustomers, pagination } = paginate(filteredCustomers, currentPage, currentPageSize);
  const selectedCustDetail = customers.find((c) => c.id === selectedCustDetailId) || null;

  return `
    <div style="flex:1;display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg-canvas);padding:24px;gap:16px;">
      
      <!-- Top Header Card -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:20px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <h1 style="font-size:16px;font-weight:800;color:var(--text-primary);letter-spacing:-0.01em;margin:0;">
              Master Data Customer (Accounts & Contacts 360°)
            </h1>
            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
              PRD Section 8.3
            </span>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0 0;">
            Tabel terpadu master customer industri software house dengan atribusi kanal pertama (First-Touch Attribution).
          </p>
        </div>

        <div style="display:flex;align-items:center;gap:12px;">
          <div style="padding:6px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);font-weight:700;color:var(--text-secondary);font-size:12px;">
            Total ${customers.length} Akun Customer
          </div>
          <button
            id="cust-open-add-modal-btn"
            style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--radius-xl);background:linear-gradient(135deg, var(--indigo-600), var(--indigo-700));color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.25);transition:all var(--transition);"
          >
            ${ICONS.plus}
            <span>+ Tambah Customer</span>
          </button>
        </div>
      </div>

      <!-- Filter and Search Bar -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:16px;border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);">
        <div style="display:flex;align-items:center;gap:12px;flex:1;max-width:440px;">
          <div style="position:relative;width:100%;">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
              ${ICONS.search}
            </span>
            <input
              id="cust-search-input"
              type="text"
              placeholder="Cari customer, PIC, kode akun, brand..."
              value="${searchTerm}"
              style="width:100%;padding:8px 12px 8px 36px;border-radius:var(--radius-xl);font-size:12px;background:var(--bg-surface);border:1px solid transparent;color:var(--text-primary);outline:none;transition:border-color var(--transition);"
            />
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;overflow-x:auto;font-size:12px;">
          <!-- Status Filter -->
          <select
            id="cust-status-filter"
            style="padding:6px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);color:var(--text-secondary);outline:none;font-weight:500;font-size:12px;cursor:pointer;"
          >
            <option value="ALL" ${statusFilter === 'ALL' ? 'selected' : ''}>Semua Status</option>
            <option value="Prospect" ${statusFilter === 'Prospect' ? 'selected' : ''}>Prospect</option>
            <option value="Active" ${statusFilter === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Dormant" ${statusFilter === 'Dormant' ? 'selected' : ''}>Dormant</option>
          </select>

          <!-- Industry Filter -->
          <select
            id="cust-industry-filter"
            style="padding:6px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);color:var(--text-secondary);outline:none;font-weight:500;font-size:12px;cursor:pointer;"
          >
            <option value="ALL" ${industryFilter === 'ALL' ? 'selected' : ''}>Semua Industri</option>
            ${industries
              .map(
                (ind) => `
                <option value="${ind}" ${industryFilter === ind ? 'selected' : ''}>
                  ${ind}
                </option>
              `
              )
              .join('')}
          </select>

          <!-- Source Filter -->
          <select
            id="cust-source-filter"
            style="padding:6px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);color:var(--text-secondary);outline:none;font-weight:500;font-size:12px;cursor:pointer;"
          >
            <option value="ALL" ${sourceFilter === 'ALL' ? 'selected' : ''}>Semua Sumber Pertama</option>
            ${sources
              .map(
                (src) => `
                <option value="${src}" ${sourceFilter === src ? 'selected' : ''}>
                  ${src}
                </option>
              `
              )
              .join('')}
          </select>
        </div>
      </div>

      <!-- Customer Table Container -->
      <div style="flex:1;display:flex;flex-direction:column;background:var(--bg-card);border-radius:var(--radius-2xl);border:1px solid var(--border-light);box-shadow:var(--shadow-xs);overflow:hidden;">
        <div style="flex:1;overflow:auto;">
          <table style="width:100%;text-align:left;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:var(--bg-surface);border-bottom:1px solid var(--border-light);color:var(--text-muted);font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:0.05em;position:sticky;top:0;z-index:10;backdrop-filter:blur(4px);">
                <th style="padding:12px 16px;width:110px;">Kode Akun</th>
                <th style="padding:12px 16px;">Nama Perusahaan & Brand</th>
                <th style="padding:12px 16px;">Sektor Industri & Skala</th>
                <th style="padding:12px 16px;">PIC Utama & Kontak</th>
                <th style="padding:12px 16px;">Lokasi / Kota</th>
                <th style="padding:12px 16px;">First-Touch Source</th>
                <th style="padding:12px 16px;">Status & Health</th>
                <th style="padding:12px 16px;text-align:center;">Peluang</th>
                <th style="padding:12px 16px;text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody style="border-top:1px solid var(--border-light);">
              ${
                pagedCustomers.length === 0
                  ? `
                <tr>
                  <td colspan="9" style="padding:48px 16px;text-align:center;color:var(--text-muted);">
                    Tidak ada data customer yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              `
                  : pagedCustomers
                      .map((c) => {
                        const customerLeads = leads.filter((l) => l.customer_id === c.id);
                        const primaryPic = (c.contacts && c.contacts.find((cnt) => cnt.is_primary)) || (c.contacts && c.contacts[0]);

                        const isStatusActive = c.lifecycle_status === 'Active';

                        return `
                        <tr
                          class="cust-table-row"
                          data-cust-id="${c.id}"
                          style="border-bottom:1px solid var(--border-light);transition:background var(--transition);"
                        >
                          <!-- Code -->
                          <td style="padding:12px 16px;font-family:var(--font-mono);font-weight:700;color:var(--text-secondary);">
                            <span style="padding:2px 8px;border-radius:var(--radius-sm);background:var(--bg-surface);color:var(--indigo-600);">
                              ${c.code}
                            </span>
                          </td>

                          <!-- Company Name & Brand -->
                          <td style="padding:12px 16px;">
                            <div style="font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
                              <span style="color:var(--indigo-500);display:flex;flex-shrink:0;">${ICONS.building}</span>
                              <span>${c.legal_name}</span>
                            </div>
                            ${
                              c.brand_name && c.brand_name !== c.legal_name
                                ? `
                              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                                Brand: <span style="font-weight:500;color:var(--text-secondary);">${c.brand_name}</span>
                              </div>
                            `
                                : ''
                            }
                          </td>

                          <!-- Industry & Scale -->
                          <td style="padding:12px 16px;">
                            <div style="font-weight:600;color:var(--text-primary);">
                              ${c.industry || '-'}
                            </div>
                            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                              ${c.company_size || '-'}
                            </div>
                          </td>

                          <!-- Primary Contact -->
                          <td style="padding:12px 16px;">
                            <div style="font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:4px;">
                              <span style="color:var(--emerald-500);display:flex;">${ICONS.users}</span>
                              <span>${primaryPic?.name || '-'}</span>
                              <span style="font-size:10px;color:var(--text-muted);">(${primaryPic?.job_title || 'PIC'})</span>
                            </div>
                            <div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px;">
                              📱 ${primaryPic?.whatsapp_number || '-'}
                            </div>
                          </td>

                          <!-- Location -->
                          <td style="padding:12px 16px;color:var(--text-secondary);">
                            <div style="display:flex;align-items:center;gap:4px;">
                              <span style="color:var(--text-muted);display:flex;">${ICONS.mapPin}</span>
                              <span>${c.city || 'Jakarta'}</span>
                            </div>
                            <div style="font-size:10px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">
                              ${c.province || 'DKI Jakarta'}
                            </div>
                          </td>

                          <!-- First-Touch Source -->
                          <td style="padding:12px 16px;">
                            <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);">
                              ${c.first_touch_source || 'Website'}
                            </span>
                          </td>

                          <!-- Status & Health -->
                          <td style="padding:12px 16px;">
                            <div>
                              <span style="padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;${
                                isStatusActive
                                  ? 'background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);'
                                  : 'background:rgba(99,102,241,.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,.2);'
                              }">
                                ${c.lifecycle_status}
                              </span>
                            </div>
                            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">
                              <span>Health:</span>
                              <span style="font-weight:700;color:var(--emerald-600);">${c.health_score ?? 85}%</span>
                            </div>
                          </td>

                          <!-- Related Leads -->
                          <td style="padding:12px 16px;text-align:center;">
                            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-family:var(--font-mono);font-weight:700;font-size:12px;background:var(--bg-surface);color:var(--text-secondary);">
                              ${customerLeads.length} Lead
                            </span>
                          </td>

                          <!-- Actions -->
                          <td style="padding:12px 16px;text-align:right;">
                            <button
                              class="cust-view-profile-btn"
                              data-cust-id="${c.id}"
                              style="padding:5px 10px;border-radius:var(--radius-md);background:rgba(99,102,241,.1);color:var(--indigo-600);font-weight:700;font-size:11px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:background var(--transition);"
                            >
                              ${ICONS.eye}
                              <span>Profil 360°</span>
                            </button>
                          </td>
                        </tr>
                      `;
                      })
                      .join('')
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div style="border-top:1px solid var(--border-light);">
          ${renderPaginationControls(pagination, [5, 10, 20], 'customers-list-pagination')}
        </div>
      </div>

      <!-- ADD CUSTOMER MODAL WITH "LAINNYA" CUSTOM INPUTS -->
      ${
        isAddModalOpen
          ? `
        <div id="add-cust-modal-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);overflow-y:auto;">
          <div style="width:100%;max-width:640px;background:var(--bg-card);border-radius:var(--radius-2xl);box-shadow:var(--shadow-xl);border:1px solid var(--border-light);margin:32px 0;overflow:hidden;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-light);background:var(--bg-surface);">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--indigo-600);display:flex;">${ICONS.building}</span>
                <h3 style="font-weight:700;font-size:14px;color:var(--text-primary);margin:0;">
                  Tambah Customer Baru (Master Data)
                </h3>
              </div>
              <button
                id="add-cust-modal-close-btn"
                style="padding:4px;border-radius:var(--radius-md);color:var(--text-muted);background:none;border:none;cursor:pointer;"
              >
                ${ICONS.x}
              </button>
            </div>

            <form id="add-cust-form" style="padding:24px;display:flex;flex-direction:column;gap:16px;max-height:80vh;overflow-y:auto;font-size:12px;">
              <!-- 1. Informasi Perusahaan -->
              <div style="display:flex;flex-direction:column;gap:12px;">
                <h4 style="font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--indigo-600);border-bottom:1px solid var(--border-light);padding-bottom:4px;margin:0;">
                  1. Informasi Perusahaan
                </h4>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Nama Legal Perusahaan*:</label>
                    <input
                      id="form-cust-legal-name"
                      type="text"
                      required
                      placeholder="Contoh: PT Sinar Abadi Nusantara"
                      value="${newForm.legalName}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Nama Brand / Merek Dagang:</label>
                    <input
                      id="form-cust-brand-name"
                      type="text"
                      placeholder="Contoh: SinarAbadi.id (Opsional)"
                      value="${newForm.brandName}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <!-- Sektor Industri with Lainnya -->
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Sektor Industri:</label>
                    <select
                      id="form-cust-industry"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    >
                      <option value="Manufaktur & Fabrikasi" ${newForm.industry === 'Manufaktur & Fabrikasi' ? 'selected' : ''}>Manufaktur & Fabrikasi</option>
                      <option value="Retail & Multi-Store" ${newForm.industry === 'Retail & Multi-Store' ? 'selected' : ''}>Retail & Multi-Store</option>
                      <option value="Financial Technology" ${newForm.industry === 'Financial Technology' ? 'selected' : ''}>Financial Technology</option>
                      <option value="Healthcare & Farmasi" ${newForm.industry === 'Healthcare & Farmasi' ? 'selected' : ''}>Healthcare & Farmasi</option>
                      <option value="Logistics & Supply Chain" ${newForm.industry === 'Logistics & Supply Chain' ? 'selected' : ''}>Logistics & Supply Chain</option>
                      <option value="Food & Beverage / Restoran" ${newForm.industry === 'Food & Beverage / Restoran' ? 'selected' : ''}>Food & Beverage / Restoran</option>
                      <option value="Pendidikan / Edutech" ${newForm.industry === 'Pendidikan / Edutech' ? 'selected' : ''}>Pendidikan / Edutech</option>
                      <option value="Lainnya" ${newForm.industry === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                    </select>

                    ${
                      newForm.industry === 'Lainnya'
                        ? `
                      <div style="margin-top:6px;padding:10px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--indigo-600);margin-bottom:4px;">Ketik Sektor Industri Kustom:</label>
                        <input
                          id="form-cust-custom-industry"
                          type="text"
                          required
                          placeholder="Misal: Energi Terbarukan & Smart Grid..."
                          value="${newForm.customIndustry}"
                          style="width:100%;padding:6px 10px;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--indigo-400);color:var(--text-primary);outline:none;"
                        />
                      </div>
                    `
                        : ''
                    }
                  </div>

                  <!-- Skala Perusahaan with Lainnya -->
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Skala Karyawan / Ukuran:</label>
                    <select
                      id="form-cust-company-size"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    >
                      <option value="1-20 Karyawan" ${newForm.companySize === '1-20 Karyawan' ? 'selected' : ''}>1-20 Karyawan (Small)</option>
                      <option value="20-50 Karyawan" ${newForm.companySize === '20-50 Karyawan' ? 'selected' : ''}>20-50 Karyawan (Medium)</option>
                      <option value="50-100 Karyawan" ${newForm.companySize === '50-100 Karyawan' ? 'selected' : ''}>50-100 Karyawan (Growing)</option>
                      <option value="100-500 Karyawan" ${newForm.companySize === '100-500 Karyawan' ? 'selected' : ''}>100-500 Karyawan (Mid-Market)</option>
                      <option value="500+ Karyawan" ${newForm.companySize === '500+ Karyawan' ? 'selected' : ''}>500+ Karyawan (Enterprise)</option>
                      <option value="Lainnya" ${newForm.companySize === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                    </select>

                    ${
                      newForm.companySize === 'Lainnya'
                        ? `
                      <div style="margin-top:6px;padding:10px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--indigo-600);margin-bottom:4px;">Ketik Skala Karyawan Kustom:</label>
                        <input
                          id="form-cust-custom-company-size"
                          type="text"
                          required
                          placeholder="Misal: 1000+ Multi-cabang Nasional..."
                          value="${newForm.customCompanySize}"
                          style="width:100%;padding:6px 10px;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--indigo-400);color:var(--text-primary);outline:none;"
                        />
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <!-- First Touch Source with Lainnya -->
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Sumber Kanal Pertama (First-Touch Source):</label>
                    <select
                      id="form-cust-source"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    >
                      <option value="Website" ${newForm.source === 'Website' ? 'selected' : ''}>Website</option>
                      <option value="Instagram" ${newForm.source === 'Instagram' ? 'selected' : ''}>Instagram</option>
                      <option value="WhatsApp" ${newForm.source === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                      <option value="Referral" ${newForm.source === 'Referral' ? 'selected' : ''}>Referral</option>
                      <option value="LinkedIn" ${newForm.source === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                      <option value="Meta Ads" ${newForm.source === 'Meta Ads' ? 'selected' : ''}>Meta Ads</option>
                      <option value="Google Ads" ${newForm.source === 'Google Ads' ? 'selected' : ''}>Google Ads</option>
                      <option value="Event/Webinar" ${newForm.source === 'Event/Webinar' ? 'selected' : ''}>Event / Webinar</option>
                      <option value="Lainnya" ${newForm.source === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                    </select>

                    ${
                      newForm.source === 'Lainnya'
                        ? `
                      <div style="margin-top:6px;padding:10px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--indigo-600);margin-bottom:4px;">Ketik Sumber Kanal Kustom:</label>
                        <input
                          id="form-cust-custom-source"
                          type="text"
                          required
                          placeholder="Misal: Pameran Industri Hannover Messe..."
                          value="${newForm.customSource}"
                          style="width:100%;padding:6px 10px;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--indigo-400);color:var(--text-primary);outline:none;"
                        />
                      </div>
                    `
                        : ''
                    }
                  </div>

                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Website URL:</label>
                    <input
                      id="form-cust-website"
                      type="text"
                      placeholder="https://perusahaan.co.id"
                      value="${newForm.website}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Kota:</label>
                    <input
                      id="form-cust-city"
                      type="text"
                      placeholder="Contoh: Surabaya"
                      value="${newForm.city}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>

                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Provinsi:</label>
                    <input
                      id="form-cust-province"
                      type="text"
                      placeholder="Contoh: Jawa Timur"
                      value="${newForm.province}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>
                </div>
              </div>

              <!-- 2. Kontak PIC Utama -->
              <div style="display:flex;flex-direction:column;gap:12px;padding-top:8px;">
                <h4 style="font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--indigo-600);border-bottom:1px solid var(--border-light);padding-bottom:4px;margin:0;">
                  2. Kontak PIC Utama
                </h4>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Nama PIC Utama*:</label>
                    <input
                      id="form-cust-pic-name"
                      type="text"
                      required
                      placeholder="Contoh: Ir. Hendra Gunawan"
                      value="${newForm.picName}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>

                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Jabatan / Job Title:</label>
                    <input
                      id="form-cust-pic-job"
                      type="text"
                      placeholder="Contoh: VP Information Technology"
                      value="${newForm.picJobTitle}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Nomor WhatsApp*:</label>
                    <input
                      id="form-cust-pic-phone"
                      type="text"
                      required
                      placeholder="+628123456789"
                      value="${newForm.picPhone}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);font-family:var(--font-mono);color:var(--text-primary);outline:none;"
                    />
                  </div>

                  <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-weight:600;color:var(--text-secondary);">Email PIC:</label>
                    <input
                      id="form-cust-pic-email"
                      type="email"
                      placeholder="hendra@perusahaan.co.id"
                      value="${newForm.picEmail}"
                      style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                    />
                  </div>
                </div>

                <!-- Peran PIC with Lainnya -->
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <label style="font-weight:600;color:var(--text-secondary);">Peran dalam Komite Keputusan:</label>
                  <select
                    id="form-cust-pic-role"
                    style="width:100%;padding:8px 10px;border-radius:var(--radius-lg);border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-primary);outline:none;"
                  >
                    <option value="decision_maker" ${newForm.picRole === 'decision_maker' ? 'selected' : ''}>Decision Maker (Direktur / VP)</option>
                    <option value="influencer" ${newForm.picRole === 'influencer' ? 'selected' : ''}>Influencer / Champion</option>
                    <option value="technical" ${newForm.picRole === 'technical' ? 'selected' : ''}>Technical Evaluator / Lead Architect</option>
                    <option value="finance" ${newForm.picRole === 'finance' ? 'selected' : ''}>Finance / Procurement Lead</option>
                    <option value="Lainnya" ${newForm.picRole === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                  </select>

                  ${
                    newForm.picRole === 'Lainnya'
                      ? `
                    <div style="margin-top:6px;padding:10px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);">
                      <label style="display:block;font-size:11px;font-weight:700;color:var(--indigo-600);margin-bottom:4px;">Ketik Peran PIC Kustom:</label>
                      <input
                        id="form-cust-custom-pic-role"
                        type="text"
                        required
                        placeholder="Misal: Konsultan Eksternal / Auditor..."
                        value="${newForm.customPicRole}"
                        style="width:100%;padding:6px 10px;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--indigo-400);color:var(--text-primary);outline:none;"
                      />
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- Submit Buttons -->
              <div style="padding-top:16px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border-light);">
                <button
                  type="button"
                  id="add-cust-cancel-btn"
                  style="padding:8px 16px;border-radius:var(--radius-xl);color:var(--text-muted);background:none;border:none;cursor:pointer;font-weight:600;"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style="padding:8px 20px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      `
          : ''
      }

      <!-- 360-DEGREE CUSTOMER DETAIL DRAWER -->
      ${
        selectedCustDetail
          ? `
        <div id="cust-drawer-backdrop" style="position:fixed;inset:0;z-index:999;display:flex;justify-content:flex-end;background:rgba(15,23,42,.4);backdrop-filter:blur(2px);">
          <div style="width:100%;max-width:560px;height:100%;background:var(--bg-card);box-shadow:var(--shadow-xl);border-left:1px solid var(--border-light);display:flex;flex-direction:column;overflow:hidden;animation:slideInRight 0.25s ease;">
            <!-- Drawer Header -->
            <div style="padding:20px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface);">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">
                  ${selectedCustDetail.legal_name.charAt(3) || 'C'}
                </div>
                <div>
                  <h3 style="font-weight:800;font-size:14px;color:var(--text-primary);margin:0;">
                    ${selectedCustDetail.legal_name}
                  </h3>
                  <p style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin:2px 0 0 0;">
                    ${selectedCustDetail.code} • ${selectedCustDetail.industry || 'Umum'}
                  </p>
                </div>
              </div>
              <button
                id="cust-drawer-close-btn"
                style="padding:8px;border-radius:var(--radius-lg);color:var(--text-muted);background:none;border:none;cursor:pointer;"
              >
                ${ICONS.x}
              </button>
            </div>

            <!-- Drawer Body -->
            <div style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:20px;font-size:12px;">
              <!-- Account Overview Cards -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);">
                  <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;">Status Lifecycle</span>
                  <p style="font-weight:700;color:var(--text-primary);margin:4px 0 0 0;">
                    ${selectedCustDetail.lifecycle_status}
                  </p>
                </div>
                <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);">
                  <span style="color:var(--text-muted);font-size:10px;text-transform:uppercase;font-weight:700;">Attribution Source</span>
                  <p style="font-weight:700;color:var(--indigo-600);margin:4px 0 0 0;">
                    ${selectedCustDetail.first_touch_source}
                  </p>
                </div>
              </div>

              <!-- Address & Legal -->
              <div style="display:flex;flex-direction:column;gap:8px;">
                <h4 style="font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);font-size:10px;margin:0;">
                  Alamat & Legalitas
                </h4>
                <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;flex-direction:column;gap:6px;">
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:var(--text-muted);">Kota & Provinsi:</span>
                    <span style="font-weight:600;color:var(--text-primary);">${selectedCustDetail.city || '-'}, ${selectedCustDetail.province || '-'}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:var(--text-muted);">Alamat Kantor:</span>
                    <span style="color:var(--text-secondary);max-width:240px;text-align:right;">${selectedCustDetail.address || '-'}</span>
                  </div>
                  ${
                    selectedCustDetail.npwp
                      ? `
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-muted);">NPWP:</span>
                      <span style="font-family:var(--font-mono);color:var(--text-secondary);">${selectedCustDetail.npwp}</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    selectedCustDetail.website
                      ? `
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-muted);">Website:</span>
                      <a href="${selectedCustDetail.website}" target="_blank" rel="noreferrer" style="color:var(--indigo-600);text-decoration:none;display:flex;align-items:gap;gap:4px;">
                        <span>${selectedCustDetail.website}</span>
                        ${ICONS.externalLink}
                      </a>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- Contacts List -->
              <div style="display:flex;flex-direction:column;gap:12px;">
                <h4 style="font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);font-size:10px;margin:0;">
                  Daftar Stakeholder & Kontak (${selectedCustDetail.contacts ? selectedCustDetail.contacts.length : 0})
                </h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${(selectedCustDetail.contacts || [])
                    .map(
                      (contact) => `
                    <div style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;">
                      <div>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span style="font-weight:700;color:var(--text-primary);">
                            ${contact.name}
                          </span>
                          ${
                            contact.is_primary
                              ? `
                            <span style="padding:2px 6px;border-radius:var(--radius-sm);font-size:9px;font-weight:700;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);">
                              PIC Utama
                            </span>
                          `
                              : ''
                          }
                        </div>
                        <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">${contact.job_title} • ${contact.role_type}</p>
                        <div style="margin-top:4px;display:flex;align-items:center;gap:12px;font-size:11px;font-family:var(--font-mono);color:var(--text-secondary);">
                          <span>📱 ${contact.whatsapp_number}</span>
                          <span>✉ ${contact.email}</span>
                        </div>
                      </div>
                      <a
                        href="https://wa.me/${contact.whatsapp_number.replace(/\\D/g, '')}"
                        target="_blank"
                        rel="noreferrer"
                        style="padding:6px 12px;border-radius:var(--radius-lg);background:var(--emerald-500);color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;gap:4px;text-decoration:none;"
                      >
                        ${ICONS.phone}
                        <span>Chat WA</span>
                      </a>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- Associated Leads -->
              <div style="display:flex;flex-direction:column;gap:12px;">
                <h4 style="font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);font-size:10px;margin:0;">
                  Peluang Proyek Terkait (${leads.filter((l) => l.customer_id === selectedCustDetail.id).length})
                </h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${leads
                    .filter((l) => l.customer_id === selectedCustDetail.id)
                    .map(
                      (lead) => `
                    <div
                      class="cust-drawer-lead-item"
                      data-lead-id="${lead.id}"
                      style="padding:12px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);cursor:pointer;transition:all var(--transition);display:flex;align-items:center;justify-content:space-between;"
                    >
                      <div>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--indigo-600);">
                            ${lead.code}
                          </span>
                          <span style="font-weight:700;color:var(--text-primary);">
                            ${lead.title}
                          </span>
                        </div>
                        <p style="font-size:11px;color:var(--text-muted);margin:4px 0 0 0;">
                          Stage: <strong style="color:var(--text-primary);">${lead.stage_id.toUpperCase()}</strong> • Target: ${lead.target_closing || '-'}
                        </p>
                      </div>
                      <span style="color:var(--text-muted);display:flex;">
                        ${ICONS.arrowRight}
                      </span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
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

export function bindCustomersListEvents(container) {
  // Search input
  const searchInput = container.querySelector('#cust-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      currentPage = 1;
      reRender(container);
    });
  }

  // Filters
  const statusFilterEl = container.querySelector('#cust-status-filter');
  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      currentPage = 1;
      reRender(container);
    });
  }

  const industryFilterEl = container.querySelector('#cust-industry-filter');
  if (industryFilterEl) {
    industryFilterEl.addEventListener('change', (e) => {
      industryFilter = e.target.value;
      currentPage = 1;
      reRender(container);
    });
  }

  const sourceFilterEl = container.querySelector('#cust-source-filter');
  if (sourceFilterEl) {
    sourceFilterEl.addEventListener('change', (e) => {
      sourceFilter = e.target.value;
      currentPage = 1;
      reRender(container);
    });
  }

  // Open Add Modal
  const openAddBtn = container.querySelector('#cust-open-add-modal-btn');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', () => {
      isAddModalOpen = true;
      reRender(container);
    });
  }

  // Close Add Modal
  const closeAddBtn = container.querySelector('#add-cust-modal-close-btn');
  const cancelAddBtn = container.querySelector('#add-cust-cancel-btn');
  if (closeAddBtn) {
    closeAddBtn.addEventListener('click', () => {
      isAddModalOpen = false;
      reRender(container);
    });
  }
  if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', () => {
      isAddModalOpen = false;
      reRender(container);
    });
  }

  // Backdrop click close modal
  const addModalBackdrop = container.querySelector('#add-cust-modal-backdrop');
  if (addModalBackdrop) {
    addModalBackdrop.addEventListener('click', (e) => {
      if (e.target === addModalBackdrop) {
        isAddModalOpen = false;
        reRender(container);
      }
    });
  }

  // Dynamic "Lainnya" Select Handlers
  const industrySelect = container.querySelector('#form-cust-industry');
  if (industrySelect) {
    industrySelect.addEventListener('change', (e) => {
      newForm.industry = e.target.value;
      reRender(container);
    });
  }
  const customIndustryInput = container.querySelector('#form-cust-custom-industry');
  if (customIndustryInput) {
    customIndustryInput.addEventListener('input', (e) => {
      newForm.customIndustry = e.target.value;
    });
  }

  const companySizeSelect = container.querySelector('#form-cust-company-size');
  if (companySizeSelect) {
    companySizeSelect.addEventListener('change', (e) => {
      newForm.companySize = e.target.value;
      reRender(container);
    });
  }
  const customCompanySizeInput = container.querySelector('#form-cust-custom-company-size');
  if (customCompanySizeInput) {
    customCompanySizeInput.addEventListener('input', (e) => {
      newForm.customCompanySize = e.target.value;
    });
  }

  const sourceSelect = container.querySelector('#form-cust-source');
  if (sourceSelect) {
    sourceSelect.addEventListener('change', (e) => {
      newForm.source = e.target.value;
      reRender(container);
    });
  }
  const customSourceInput = container.querySelector('#form-cust-custom-source');
  if (customSourceInput) {
    customSourceInput.addEventListener('input', (e) => {
      newForm.customSource = e.target.value;
    });
  }

  const picRoleSelect = container.querySelector('#form-cust-pic-role');
  if (picRoleSelect) {
    picRoleSelect.addEventListener('change', (e) => {
      newForm.picRole = e.target.value;
      reRender(container);
    });
  }
  const customPicRoleInput = container.querySelector('#form-cust-custom-pic-role');
  if (customPicRoleInput) {
    customPicRoleInput.addEventListener('input', (e) => {
      newForm.customPicRole = e.target.value;
    });
  }

  // Input bindings
  bindInput(container, '#form-cust-legal-name', (val) => (newForm.legalName = val));
  bindInput(container, '#form-cust-brand-name', (val) => (newForm.brandName = val));
  bindInput(container, '#form-cust-website', (val) => (newForm.website = val));
  bindInput(container, '#form-cust-city', (val) => (newForm.city = val));
  bindInput(container, '#form-cust-province', (val) => (newForm.province = val));
  bindInput(container, '#form-cust-pic-name', (val) => (newForm.picName = val));
  bindInput(container, '#form-cust-pic-job', (val) => (newForm.picJobTitle = val));
  bindInput(container, '#form-cust-pic-phone', (val) => (newForm.picPhone = val));
  bindInput(container, '#form-cust-pic-email', (val) => (newForm.picEmail = val));

  // Handle Form Submission
  const formEl = container.querySelector('#add-cust-form');
  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!newForm.legalName.trim() || !newForm.picName.trim()) {
        alert('Nama perusahaan dan nama PIC wajib diisi.');
        return;
      }

      const finalIndustry = newForm.industry === 'Lainnya' ? newForm.customIndustry.trim() || 'Industri Kustom' : newForm.industry;
      const finalCompanySize = newForm.companySize === 'Lainnya' ? newForm.customCompanySize.trim() || 'Custom Size' : newForm.companySize;
      const finalSource = newForm.source === 'Lainnya' ? newForm.customSource.trim() || 'Lainnya' : newForm.source;
      const finalPicRole = newForm.picRole === 'Lainnya' ? newForm.customPicRole.trim() || 'custom_role' : newForm.picRole;

      store.addNewCustomer({
        legal_name: newForm.legalName.trim(),
        brand_name: newForm.brandName.trim() || newForm.legalName.trim(),
        industry: finalIndustry,
        company_size: finalCompanySize,
        first_touch_source: finalSource,
        website: newForm.website.trim() || undefined,
        npwp: newForm.npwp.trim() || undefined,
        city: newForm.city.trim() || 'Jakarta',
        province: newForm.province.trim() || 'DKI Jakarta',
        address: newForm.address.trim() || 'Alamat Perusahaan',
        lifecycle_status: 'Prospect',
        health_score: 90,
        contacts: [
          {
            id: `cnt-${Date.now()}`,
            name: newForm.picName.trim(),
            job_title: newForm.picJobTitle.trim() || 'Manager',
            whatsapp_number: newForm.picPhone.trim() || '+6281234567890',
            email: newForm.picEmail.trim() || 'pic@perusahaan.com',
            role_type: finalPicRole,
            is_primary: true,
          },
        ],
      });

      resetNewCustomerForm();
      isAddModalOpen = false;

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: 'Customer baru berhasil ditambahkan ke Master Data!',
            type: 'success',
          },
        })
      );

      reRender(container);
    });
  }

  // Profil 360° View Button
  container.querySelectorAll('.cust-view-profile-btn[data-cust-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedCustDetailId = btn.dataset.custId;
      reRender(container);
    });
  });

  // Drawer Close Button
  const closeDrawerBtn = container.querySelector('#cust-drawer-close-btn');
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => {
      selectedCustDetailId = null;
      reRender(container);
    });
  }

  // Backdrop click close drawer
  const drawerBackdrop = container.querySelector('#cust-drawer-backdrop');
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) {
        selectedCustDetailId = null;
        reRender(container);
      }
    });
  }

  // Lead navigation in drawer
  container.querySelectorAll('.cust-drawer-lead-item[data-lead-id]').forEach((item) => {
    item.addEventListener('click', () => {
      const leadId = item.dataset.leadId;
      selectedCustDetailId = null;
      store.navigateToLeadDetail(leadId);
    });
  });

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
    'customers-list-pagination'
  );
}

function bindInput(container, selector, setter) {
  const el = container.querySelector(selector);
  if (el) {
    el.addEventListener('input', (e) => setter(e.target.value));
  }
}

function reRender(container) {
  container.innerHTML = renderCustomersList();
  bindCustomersListEvents(container);
}

export function mount(container) {
  reRender(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'customers') {
      reRender(container);
    }
  });

  return unsubscribe;
}
