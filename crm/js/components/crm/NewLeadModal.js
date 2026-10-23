/**
 * NewLeadModal.js — Vanilla JS New Lead & Customer Registration Modal
 * Converted from src/components/crm/NewLeadModal.tsx
 */

import store from '../../store/store.js';

let isModalOpen = false;

const ICONS = {
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
};

// Form local state
let formData = {
  title: '',
  projectType: 'Web & Mobile App',
  customProjectType: '',
  estValue: 250000000,
  targetClosing: '2026-12-15',
  salesPic: 'Asisyah Sarah Azzahra',
  priority: 'High',
  source: 'Instagram',
  customSource: '',
  subSource: 'Direct Message',
  referrerName: '',
  tagsInput: 'Custom App, HRIS',

  customerMode: 'new', // 'new' | 'existing'
  selectedCustomerId: '',
  companyName: '',
  industry: 'Manufaktur & Fabrikasi',
  customIndustry: '',
  companySize: '100-250 Karyawan',
  address: 'Kawasan Industri Sentul',
  city: 'Bogor',
  province: 'Jawa Barat',
  picName: '',
  picJobTitle: 'Direktur Operasional',
  picEmail: '',
  picPhone: '',
};

export function openNewLeadModal() {
  const { customers } = store.getState();
  isModalOpen = true;

  // Reset or preset default values
  formData.selectedCustomerId = customers[0]?.id || '';
  renderNewLeadModal();

  const titleInput = document.getElementById('nl-title');
  if (titleInput) {
    titleInput.focus();
  }
}

export function closeNewLeadModal() {
  isModalOpen = false;
  const container = document.getElementById('new-lead-modal-container');
  if (container) {
    container.classList.add('hidden');
    container.innerHTML = '';
  }
}

function renderNewLeadModal() {
  let container = document.getElementById('new-lead-modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'new-lead-modal-container';
    document.body.appendChild(container);
  }

  if (!isModalOpen) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');

  const { customers } = store.getState();

  container.innerHTML = `
    <div class="modal-overlay" id="new-lead-modal-backdrop" style="background:rgba(15,23,42,.65);backdrop-filter:blur(4px);">
      <div class="modal modal-lg" onclick="event.stopPropagation();" style="max-height:88vh;display:flex;flex-direction:column;">
        <!-- Header -->
        <div class="modal-header" style="background:var(--bg-secondary);border-bottom:1px solid var(--border);padding:16px 24px;">
          <div>
            <h2 class="modal-title" style="font-size:16px;font-weight:800;color:var(--text-primary);">
              Tambah Lead & Registrasi Customer Baru
            </h2>
            <p style="font-size:12px;color:var(--text-muted);margin-top:2px;">
              Data customer otomatis terintegrasi ke Master Customer 360° (PRD Section 8.2).
            </p>
          </div>
          <button id="nl-close-btn" class="modal-close" title="Tutup Modal (Esc)">
            ${ICONS.close}
          </button>
        </div>

        <!-- Form Body -->
        <form id="new-lead-form" class="modal-body" style="padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:24px;">
          
          <!-- SECTION 1: Lead Info -->
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
              <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--indigo-500);">
                1. Informasi Lead & Kebutuhan Proyek
              </h3>
            </div>

            <div class="form-group">
              <label class="form-label" for="nl-title">Judul Lead / Kebutuhan Solusi*:</label>
              <input
                id="nl-title"
                name="title"
                type="text"
                required
                class="form-input"
                placeholder="Contoh: Aplikasi HRIS & Payroll 500 Karyawan"
                value="${formData.title}"
              />
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;">
              <div class="form-group">
                <label class="form-label" for="nl-project-type">Tipe Proyek:</label>
                <select id="nl-project-type" name="projectType" class="form-select">
                  <option value="Web & Mobile App" ${formData.projectType === 'Web & Mobile App' ? 'selected' : ''}>Web & Mobile App</option>
                  <option value="ERP Custom" ${formData.projectType === 'ERP Custom' ? 'selected' : ''}>ERP Custom</option>
                  <option value="Fintech Platform" ${formData.projectType === 'Fintech Platform' ? 'selected' : ''}>Fintech Platform</option>
                  <option value="Point of Sale (POS)" ${formData.projectType === 'Point of Sale (POS)' ? 'selected' : ''}>Point of Sale (POS)</option>
                  <option value="Web Portal / LMS" ${formData.projectType === 'Web Portal / LMS' ? 'selected' : ''}>Web Portal / LMS</option>
                  <option value="Integration & API" ${formData.projectType === 'Integration & API' ? 'selected' : ''}>Integration & API</option>
                  <option value="Consulting & UI/UX" ${formData.projectType === 'Consulting & UI/UX' ? 'selected' : ''}>Consulting & UI/UX</option>
                  <option value="Lainnya" ${formData.projectType === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                </select>

                <div id="nl-custom-project-type-wrap" style="display:${formData.projectType === 'Lainnya' ? 'block' : 'none'};margin-top:6px;">
                  <input
                    id="nl-custom-project-type"
                    name="customProjectType"
                    type="text"
                    class="form-input"
                    placeholder="Ketik tipe proyek kustom..."
                    value="${formData.customProjectType}"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="nl-est-value">Estimasi Nilai Proyek (IDR):</label>
                <input
                  id="nl-est-value"
                  name="estValue"
                  type="number"
                  min="0"
                  step="1000000"
                  required
                  class="form-input"
                  style="font-family:var(--font-mono);font-weight:600;"
                  value="${formData.estValue}"
                />
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;">
              <div class="form-group">
                <label class="form-label" for="nl-sales-pic">PIC Penanggung Jawab (PM):</label>
                <select id="nl-sales-pic" name="salesPic" class="form-select" style="font-weight:600;">
                  <option value="Asisyah Sarah Azzahra" ${formData.salesPic === 'Asisyah Sarah Azzahra' ? 'selected' : ''}>Asisyah Sarah Azzahra (Super Admin & PM)</option>
                  <option value="Sari Dewi" ${formData.salesPic === 'Sari Dewi' ? 'selected' : ''}>Sari Dewi (Presales Engineer)</option>
                  <option value="Budi Kurniawan" ${formData.salesPic === 'Budi Kurniawan' ? 'selected' : ''}>Budi Kurniawan (Technical Consultant)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="nl-priority">Prioritas:</label>
                <select id="nl-priority" name="priority" class="form-select">
                  <option value="Hot" ${formData.priority === 'Hot' ? 'selected' : ''}>🔥 Hot</option>
                  <option value="High" ${formData.priority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${formData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${formData.priority === 'Low' ? 'selected' : ''}>Low</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="nl-target-closing">Target Closing:</label>
                <input
                  id="nl-target-closing"
                  name="targetClosing"
                  type="date"
                  required
                  class="form-input"
                  value="${formData.targetClosing}"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="nl-tags">Tags (pisahkan koma):</label>
              <input
                id="nl-tags"
                name="tagsInput"
                type="text"
                class="form-input"
                placeholder="Contoh: Custom App, HRIS, Sentul"
                value="${formData.tagsInput}"
              />
            </div>
          </div>

          <!-- SECTION 2: Lead Source Channel -->
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
              <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--indigo-500);">
                2. Sumber Channel Akuisisi (Lead Source)
              </h3>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;">
              <div class="form-group">
                <label class="form-label" for="nl-source">Channel Utama*:</label>
                <select id="nl-source" name="source" class="form-select" style="font-weight:600;">
                  <option value="Instagram" ${formData.source === 'Instagram' ? 'selected' : ''}>Instagram</option>
                  <option value="Website" ${formData.source === 'Website' ? 'selected' : ''}>Website</option>
                  <option value="WhatsApp" ${formData.source === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                  <option value="Referral" ${formData.source === 'Referral' ? 'selected' : ''}>Referral</option>
                  <option value="LinkedIn" ${formData.source === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                  <option value="Meta Ads" ${formData.source === 'Meta Ads' ? 'selected' : ''}>Meta Ads</option>
                  <option value="Google Ads" ${formData.source === 'Google Ads' ? 'selected' : ''}>Google Ads</option>
                  <option value="Event/Webinar" ${formData.source === 'Event/Webinar' ? 'selected' : ''}>Event / Webinar</option>
                  <option value="Lainnya" ${formData.source === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                </select>

                <div id="nl-custom-source-wrap" style="display:${formData.source === 'Lainnya' ? 'block' : 'none'};margin-top:6px;">
                  <input
                    id="nl-custom-source"
                    name="customSource"
                    type="text"
                    class="form-input"
                    placeholder="Ketik nama channel sumber kustom..."
                    value="${formData.customSource}"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="nl-sub-source">Sub-Channel / Campaign:</label>
                <input
                  id="nl-sub-source"
                  name="subSource"
                  type="text"
                  class="form-input"
                  placeholder="Mis. DM Instagram, Ads Campaign Q4..."
                  value="${formData.subSource}"
                />
              </div>
            </div>

            <div id="nl-referrer-wrap" class="form-group" style="display:${formData.source === 'Referral' ? 'block' : 'none'};">
              <label class="form-label" for="nl-referrer">Nama Referrer (Pemberi Referensi):</label>
              <input
                id="nl-referrer"
                name="referrerName"
                type="text"
                class="form-input"
                placeholder="Nama klien atau partner yang mereferensikan"
                value="${formData.referrerName}"
              />
            </div>
          </div>

          <!-- SECTION 3: Customer Details -->
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px;">
              <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--indigo-500);">
                3. Detail Customer & PIC Utama
              </h3>

              <div style="display:flex;align-items:center;gap:6px;">
                <button
                  type="button"
                  id="nl-btn-mode-new"
                  class="btn btn-xs ${formData.customerMode === 'new' ? 'btn-primary' : 'btn-secondary'}"
                  style="font-weight:600;"
                >
                  Customer Baru
                </button>
                <button
                  type="button"
                  id="nl-btn-mode-existing"
                  class="btn btn-xs ${formData.customerMode === 'existing' ? 'btn-primary' : 'btn-secondary'}"
                  style="font-weight:600;"
                >
                  Pilih Existing
                </button>
              </div>
            </div>

            <!-- Existing Customer Mode -->
            <div id="nl-existing-customer-section" style="display:${formData.customerMode === 'existing' ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label" for="nl-selected-customer">Pilih Master Customer:</label>
                <select id="nl-selected-customer" name="selectedCustomerId" class="form-select">
                  ${customers.map((c) => `
                    <option value="${c.id}" ${c.id === formData.selectedCustomerId ? 'selected' : ''}>
                      ${c.legal_name} (${c.industry})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- New Customer Mode -->
            <div id="nl-new-customer-section" style="display:${formData.customerMode === 'new' ? 'flex' : 'none'};flex-direction:column;gap:12px;">
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;">
                <div class="form-group">
                  <label class="form-label" for="nl-company-name">Nama Perusahaan Customer*:</label>
                  <input
                    id="nl-company-name"
                    name="companyName"
                    type="text"
                    class="form-input"
                    placeholder="Contoh: PT Sinar Abadi Sentosa"
                    value="${formData.companyName}"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="nl-industry">Sektor Industri:</label>
                  <select id="nl-industry" name="industry" class="form-select">
                    <option value="Manufaktur & Fabrikasi" ${formData.industry === 'Manufaktur & Fabrikasi' ? 'selected' : ''}>Manufaktur & Fabrikasi</option>
                    <option value="Retail & Multi-Store" ${formData.industry === 'Retail & Multi-Store' ? 'selected' : ''}>Retail & Multi-Store</option>
                    <option value="Financial Technology" ${formData.industry === 'Financial Technology' ? 'selected' : ''}>Financial Technology</option>
                    <option value="Food & Beverage / Restoran" ${formData.industry === 'Food & Beverage / Restoran' ? 'selected' : ''}>Food & Beverage / Restoran</option>
                    <option value="Healthcare & Farmasi" ${formData.industry === 'Healthcare & Farmasi' ? 'selected' : ''}>Healthcare & Farmasi</option>
                    <option value="Logistics & Supply Chain" ${formData.industry === 'Logistics & Supply Chain' ? 'selected' : ''}>Logistics & Supply Chain</option>
                    <option value="Pendidikan / Edutech" ${formData.industry === 'Pendidikan / Edutech' ? 'selected' : ''}>Pendidikan / Edutech</option>
                    <option value="Lainnya" ${formData.industry === 'Lainnya' ? 'selected' : ''}>Lainnya (Kustom...)</option>
                  </select>

                  <div id="nl-custom-industry-wrap" style="display:${formData.industry === 'Lainnya' ? 'block' : 'none'};margin-top:6px;">
                    <input
                      id="nl-custom-industry"
                      name="customIndustry"
                      type="text"
                      class="form-input"
                      placeholder="Ketik sektor industri kustom..."
                      value="${formData.customIndustry}"
                    />
                  </div>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;">
                <div class="form-group">
                  <label class="form-label" for="nl-pic-name">Nama PIC Utama*:</label>
                  <input
                    id="nl-pic-name"
                    name="picName"
                    type="text"
                    class="form-input"
                    placeholder="Bapak / Ibu..."
                    value="${formData.picName}"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="nl-pic-job">Jabatan PIC:</label>
                  <input
                    id="nl-pic-job"
                    name="picJobTitle"
                    type="text"
                    class="form-input"
                    placeholder="CTO / HR Manager / Direktur..."
                    value="${formData.picJobTitle}"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="nl-pic-phone">No. WhatsApp / HP*:</label>
                  <input
                    id="nl-pic-phone"
                    name="picPhone"
                    type="tel"
                    class="form-input"
                    style="font-family:var(--font-mono);"
                    placeholder="+6281234567890"
                    value="${formData.picPhone}"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="modal-footer" style="padding:16px 0 0 0;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;gap:10px;">
            <button type="button" id="nl-cancel-btn" class="btn btn-secondary" style="font-weight:600;">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;">
              ${ICONS.plus}
              <span>Simpan Lead & Buka Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  bindModalEvents();
}

function bindModalEvents() {
  const backdrop = document.getElementById('new-lead-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => closeNewLeadModal());
  }

  const closeBtn = document.getElementById('nl-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeNewLeadModal());
  }

  const cancelBtn = document.getElementById('nl-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => closeNewLeadModal());
  }

  // Project Type change
  const projectTypeSelect = document.getElementById('nl-project-type');
  const customProjectTypeWrap = document.getElementById('nl-custom-project-type-wrap');
  if (projectTypeSelect && customProjectTypeWrap) {
    projectTypeSelect.addEventListener('change', (e) => {
      formData.projectType = e.target.value;
      customProjectTypeWrap.style.display = e.target.value === 'Lainnya' ? 'block' : 'none';
    });
  }

  // Source change
  const sourceSelect = document.getElementById('nl-source');
  const customSourceWrap = document.getElementById('nl-custom-source-wrap');
  const referrerWrap = document.getElementById('nl-referrer-wrap');
  if (sourceSelect) {
    sourceSelect.addEventListener('change', (e) => {
      formData.source = e.target.value;
      if (customSourceWrap) {
        customSourceWrap.style.display = e.target.value === 'Lainnya' ? 'block' : 'none';
      }
      if (referrerWrap) {
        referrerWrap.style.display = e.target.value === 'Referral' ? 'block' : 'none';
      }
    });
  }

  // Industry change
  const industrySelect = document.getElementById('nl-industry');
  const customIndustryWrap = document.getElementById('nl-custom-industry-wrap');
  if (industrySelect && customIndustryWrap) {
    industrySelect.addEventListener('change', (e) => {
      formData.industry = e.target.value;
      customIndustryWrap.style.display = e.target.value === 'Lainnya' ? 'block' : 'none';
    });
  }

  // Customer Mode Buttons
  const btnModeNew = document.getElementById('nl-btn-mode-new');
  const btnModeExisting = document.getElementById('nl-btn-mode-existing');
  const secNew = document.getElementById('nl-new-customer-section');
  const secExisting = document.getElementById('nl-existing-customer-section');

  if (btnModeNew && btnModeExisting && secNew && secExisting) {
    btnModeNew.addEventListener('click', () => {
      formData.customerMode = 'new';
      btnModeNew.className = 'btn btn-xs btn-primary';
      btnModeExisting.className = 'btn btn-xs btn-secondary';
      secNew.style.display = 'flex';
      secExisting.style.display = 'none';
    });

    btnModeExisting.addEventListener('click', () => {
      formData.customerMode = 'existing';
      btnModeExisting.className = 'btn btn-xs btn-primary';
      btnModeNew.className = 'btn btn-xs btn-secondary';
      secNew.style.display = 'none';
      secExisting.style.display = 'block';
    });
  }

  // Form Submit
  const form = document.getElementById('new-lead-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather input values
      const title = document.getElementById('nl-title')?.value.trim();
      if (!title) {
        alert('Judul lead / kebutuhan wajib diisi.');
        return;
      }

      const pType = document.getElementById('nl-project-type')?.value;
      const customPType = document.getElementById('nl-custom-project-type')?.value.trim();
      const finalProjectType = pType === 'Lainnya' ? (customPType || 'Custom Project') : pType;

      const estValue = Number(document.getElementById('nl-est-value')?.value || 0);
      const salesPic = document.getElementById('nl-sales-pic')?.value;
      const priority = document.getElementById('nl-priority')?.value;
      const targetClosing = document.getElementById('nl-target-closing')?.value;
      const tagsInput = document.getElementById('nl-tags')?.value || '';

      const src = document.getElementById('nl-source')?.value;
      const customSrc = document.getElementById('nl-custom-source')?.value.trim();
      const finalSource = src === 'Lainnya' ? (customSrc || 'Lainnya') : src;
      const subSource = document.getElementById('nl-sub-source')?.value.trim();
      const referrerName = document.getElementById('nl-referrer')?.value.trim();

      let customerData = {};

      if (formData.customerMode === 'new') {
        const companyName = document.getElementById('nl-company-name')?.value.trim();
        const picName = document.getElementById('nl-pic-name')?.value.trim();
        const picPhone = document.getElementById('nl-pic-phone')?.value.trim();
        const picJob = document.getElementById('nl-pic-job')?.value.trim();

        if (!companyName) {
          alert('Nama perusahaan customer wajib diisi.');
          return;
        }
        if (!picName) {
          alert('Nama PIC customer wajib diisi.');
          return;
        }

        const ind = document.getElementById('nl-industry')?.value;
        const customInd = document.getElementById('nl-custom-industry')?.value.trim();
        const finalIndustry = ind === 'Lainnya' ? (customInd || 'General Industry') : ind;

        customerData = {
          legal_name: companyName,
          industry: finalIndustry,
          company_size: formData.companySize,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          contacts: [
            {
              id: `cnt-${Date.now()}`,
              name: picName,
              job_title: picJob || 'PIC Proyek',
              email: `${picName.toLowerCase().replace(/\s+/g, '.')}@perusahaan.com`,
              whatsapp_number: picPhone || '+6281234567890',
              role_type: 'decision_maker',
              is_primary: true,
            },
          ],
        };
      } else {
        const selectedId = document.getElementById('nl-selected-customer')?.value;
        const { customers } = store.getState();
        const existing = customers.find((c) => c.id === selectedId);
        if (existing) {
          customerData = existing;
        }
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const createdLead = store.addNewLead(
        {
          title,
          project_type: finalProjectType,
          est_value: estValue,
          target_closing: targetClosing,
          sales_pic: salesPic,
          priority,
          source: finalSource,
          sub_source: subSource,
          referrer_name: referrerName,
          tags,
        },
        customerData
      );

      closeNewLeadModal();
      store.navigateToLeadDetail(createdLead.id);

      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `Lead ${createdLead.code} berhasil dibuat! Membuka halaman lead...`,
            type: 'success',
          },
        })
      );
    });
  }
}

export function initNewLeadModal() {
  window.addEventListener('open-new-lead-modal', () => {
    openNewLeadModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeNewLeadModal();
    }
  });
}
