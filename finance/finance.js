/**
 * ==========================================================================
 * ASTACODE ERP - FINANCE MODULE CONTROLLER (finance.js)
 * Master controller for Cash Flow, AR/AP, Payroll, OPEX, Bank Recon & COA
 * ==========================================================================
 */

(function() {
  'use strict';

  // Subpage Name Map for Breadcrumb & Title
  const VIEW_TITLES = {
    'dashboard': 'Cash Flow Overview',
    'invoices': 'Penagihan & Termin (Invoice AR)',
    'expenses': 'Klaim Struk (AI OCR)',
    'pengeluaran': 'Buku Pengeluaran Kas (Cash Outflow)',
    'opex': 'Biaya Operasional (OPEX Kantor)',
    'payroll': 'Penggajian Karyawan (Payroll)',
    'vendor': 'Tagihan Vendor (Operasional & HPP)',
    'freelancer': 'Pembayaran Freelancer (HPP Proyek)',
    'accounts': 'Daftar Rekening & Saldo Kas/Bank',
    'internal-transfer': 'Mutasi Internal (Pindah Dana)',
    'coa': 'Chart of Accounts (COA)',
    'journal': 'Jurnal Umum (General Journal)',
    'report-company': 'Laba Rugi Perusahaan (Consolidated P&L)',
    'report-project': 'Profitabilitas Proyek (P&L per Project)',
    'report-customer': 'Laporan Keuangan per Customer'
  };

  // Switch Subpage
  window.switchFinancePage = function(pageId) {
    if (!pageId) pageId = 'dashboard';
    const cleanId = pageId.replace('view-', '');
    const targetViewId = 'view-' + cleanId;

    // Show active view section
    const views = document.querySelectorAll('.view-section');
    let found = false;
    views.forEach(v => {
      if (v.id === targetViewId || v.id === cleanId) {
        v.style.display = 'block';
        v.classList.add('active');
        found = true;
      } else {
        v.style.display = 'none';
        v.classList.remove('active');
      }
    });

    if (!found && views.length > 0) {
      views[0].style.display = 'block';
      views[0].classList.add('active');
    }

    // Update Breadcrumb Title
    const bc = document.getElementById('current-view-title');
    if (bc) {
      bc.textContent = VIEW_TITLES[cleanId] || (cleanId.charAt(0).toUpperCase() + cleanId.slice(1));
    }

    // Update Subnav Tab Active State
    document.querySelectorAll('.finance-subnav-item').forEach(item => {
      const target = item.getAttribute('data-target') || '';
      item.classList.toggle('active', target === cleanId || target === targetViewId);
    });

    // Update Master Sidebar Active State
    const navGroup = document.getElementById('financeNavGroup');
    if (navGroup) {
      navGroup.querySelectorAll('.nav-sub-btn').forEach(btn => {
        const sub = btn.getAttribute('data-sub');
        btn.classList.toggle('active', sub === cleanId || sub === targetViewId);
      });
    }

    // Update URL Hash without reload
    if (window.location.hash !== '#' + cleanId) {
      window.location.hash = cleanId;
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast Notification System
  window.showFinanceToast = function(message, type = 'success') {
    let container = document.getElementById('financeToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'financeToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    let icon = 'fa-check-circle';
    let iconColor = '#10B981';
    if (type === 'danger') { icon = 'fa-exclamation-circle'; iconColor = '#EF4444'; }
    else if (type === 'warning') { icon = 'fa-triangle-exclamation'; iconColor = '#F59E0B'; }
    else if (type === 'info') { icon = 'fa-info-circle'; iconColor = '#38BDF8'; }

    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${iconColor}; font-size:16px;"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Modals Manager
  window.openFinanceModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
    }
  };

  window.closeFinanceModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
    }
  };

  // Initialize Chart.js
  function initCashflowChart() {
    const canvas = document.getElementById('financeCashflowChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt (Berjalan)'],
        datasets: [
          {
            label: 'Uang Masuk (AR)',
            data: [150000000, 180000000, 210000000, 240000000, 310000000, 450000000],
            backgroundColor: '#10B981',
            borderRadius: 6,
            barThickness: 16
          },
          {
            label: 'Uang Keluar (AP & OPEX)',
            data: [90000000, 110000000, 125000000, 140000000, 155000000, 174850000],
            backgroundColor: '#F87171',
            borderRadius: 6,
            barThickness: 16
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Inter', size: 11, weight: '600' }, boxWidth: 12, padding: 16 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': Rp ' + context.raw.toLocaleString('id-ID');
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { family: 'Inter', size: 10 },
              color: '#64748B',
              callback: function(val) {
                return 'Rp ' + (val / 1000000) + ' Jt';
              }
            }
          }
        }
      }
    });
  }

  // ==========================================================================
  // MULTI-TRANSACTION AI SMART OCR SCANNER (EXPENSES, INCOME, CONTRACTS)
  // ==========================================================================

  let currentOcrType = 'expense';

  // Switch OCR Document Type (Struk Pengeluaran / Bukti Pemasukan / Tagihan Kontrak)
  window.switchOcrDocType = function(docType) {
    currentOcrType = docType;

    ['expense', 'income', 'contract'].forEach(t => {
      const btn = document.getElementById('ocr-type-' + t);
      if (btn) {
        btn.classList.toggle('primary', t === docType);
      }
    });

    const dropTitle = document.getElementById('ocrDropTitle');
    const dropDesc = document.getElementById('ocrDropDesc');
    const formTitle = document.getElementById('exp-form-title');
    const typeSelect = document.getElementById('exp-type-select');

    if (docType === 'expense') {
      if (dropTitle) dropTitle.textContent = 'Tarik & Lepas Struk Pengeluaran di Sini';
      if (dropDesc) dropDesc.textContent = 'Mendukung: Nota bensin, bon makan dinas, tagihan hosting, struk ATK';
      if (formTitle) formTitle.textContent = 'Hasil Ekstraksi OCR: Pengeluaran Kas (OPEX/HPP)';
      if (typeSelect) typeSelect.value = 'expense';
      window.syncOcrFormFields('expense');
    } else if (docType === 'income') {
      if (dropTitle) dropTitle.textContent = 'Tarik & Lepas Bukti Transfer Pemasukan di Sini';
      if (dropDesc) dropDesc.textContent = 'Mendukung: Bukti transfer BCA/Mandiri klien, slip setoran, mutasi kredit AR';
      if (formTitle) formTitle.textContent = 'Hasil Ekstraksi OCR: Pemasukan Kas (AR Termin)';
      if (typeSelect) typeSelect.value = 'income';
      window.syncOcrFormFields('income');
    } else if (docType === 'contract') {
      if (dropTitle) dropTitle.textContent = 'Tarik & Lepas Dokumen Tagihan Kontrak di Sini';
      if (dropDesc) dropDesc.textContent = 'Mendukung: SPK Freelance, invoice vendor rekanan, MoU termin';
      if (formTitle) formTitle.textContent = 'Hasil Ekstraksi OCR: Tagihan Kontrak Vendor/Freelance';
      if (typeSelect) typeSelect.value = 'contract';
      window.syncOcrFormFields('contract');
    }
  };

  window.selectOcrScanType = function(docType) {
    window.switchOcrDocType(docType);
    const fileInput = document.getElementById('ocrFileInput');
    if (fileInput) fileInput.click();
  };

  // Sync Form Labels & Dropdowns based on OCR Document Type
  window.syncOcrFormFields = function(docType) {
    currentOcrType = docType;
    const vendorLabel = document.getElementById('lbl-exp-vendor');
    const descInput = document.getElementById('exp-desc');
    const amountInput = document.getElementById('exp-amount');
    const vendorInput = document.getElementById('exp-vendor');
    const dateInput = document.getElementById('exp-date');
    const allocSelect = document.getElementById('exp-allocation');

    if (docType === 'income') {
      if (vendorLabel) vendorLabel.textContent = 'Dari Pihak Klien (Pengirim Dana)';
      if (descInput) descInput.value = 'Pelunasan Termin 1 Proyek Aplikasi Kasir RS Medika';
      if (amountInput) amountInput.value = '9990000';
      if (vendorInput) vendorInput.value = 'RS Medika Utama (PT Medika Sejahtera)';
      if (dateInput) dateInput.value = '2026-10-10';
      if (allocSelect) allocSelect.value = 'income-ar';
    } else if (docType === 'contract') {
      if (vendorLabel) vendorLabel.textContent = 'Pihak Rekanan / Freelancer Kontrak';
      if (descInput) descInput.value = 'Pencairan Termin 2 Kontrak SPK-2026/FL-014 (Slicing UI)';
      if (amountInput) amountInput.value = '5000000';
      if (vendorInput) vendorInput.value = 'Rian Pratama (Flutter Developer)';
      if (dateInput) dateInput.value = '2026-10-08';
      if (allocSelect) allocSelect.value = 'hpp-rs';
    } else {
      if (vendorLabel) vendorLabel.textContent = 'Pihak Terkait (Merchant / Vendor)';
      if (descInput) descInput.value = 'Tagihan Cloud Server & Database Cluster AWS';
      if (amountInput) amountInput.value = '15350000';
      if (vendorInput) vendorInput.value = 'Amazon Web Services (AWS)';
      if (dateInput) dateInput.value = '2026-10-04';
      if (allocSelect) allocSelect.value = 'opex';
    }
  };

  // Simulation sample trigger button
  window.simulateOcrSample = function() {
    window.simulateOcrScan({ name: currentOcrType === 'income' ? 'bukti_transfer_bca_rs_medika.jpg' : (currentOcrType === 'contract' ? 'spk_freelance_rian_pratama.pdf' : 'struk_aws_oktober.jpg') });
  };

  // AI OCR Upload & Scanning Simulation (Universal for Multi-Transaction)
  window.simulateOcrScan = function(file) {
    const scanningOverlay = document.getElementById('scanningOverlay');
    const receiptPreview = document.getElementById('receiptPreview');
    const receiptFileName = document.getElementById('receiptFileName');
    const scanningText = document.getElementById('ocrScanningText');
    const receiptTypeLabel = document.getElementById('receiptTypeLabel');

    if (scanningText) {
      if (currentOcrType === 'income') {
        scanningText.textContent = 'AI MEMBACA BUKTI TRANSFER PEMASUKAN...';
      } else if (currentOcrType === 'contract') {
        scanningText.textContent = 'AI MEMBACA DOKUMEN SPK / TAGIHAN KONTRAK...';
      } else {
        scanningText.textContent = 'AI MEMBACA STRUK FISIK PENGELUARAN...';
      }
    }

    if (scanningOverlay) {
      scanningOverlay.classList.remove('pointer-events-none');
      scanningOverlay.style.opacity = '1';
    }

    setTimeout(() => {
      if (scanningOverlay) {
        scanningOverlay.classList.add('pointer-events-none');
        scanningOverlay.style.opacity = '0';
      }

      if (receiptPreview) {
        receiptPreview.style.display = 'flex';
      }
      if (receiptFileName) {
        receiptFileName.textContent = file ? file.name : (currentOcrType === 'income' ? 'bukti_transfer_rs_medika.png' : 'struk_transaksi.pdf');
      }
      if (receiptTypeLabel) {
        const typeNames = {
          'expense': 'Ekstraksi Struk Pengeluaran Berhasil (Akurasi 98%)',
          'income': 'Ekstraksi Bukti Transfer Pemasukan Berhasil (Akurasi 99%)',
          'contract': 'Ekstraksi SPK Kontrak Berhasil (Akurasi 97%)'
        };
        receiptTypeLabel.textContent = typeNames[currentOcrType] || 'Ekstraksi Berhasil';
      }

      // Populate Form inputs automatically with simulated OCR data according to document type
      window.syncOcrFormFields(currentOcrType);

      const msg = currentOcrType === 'income' 
        ? '✨ AI Smart OCR Berhasil mengekstrak data Bukti Transfer Pemasukan Bank!'
        : (currentOcrType === 'contract' 
            ? '✨ AI Smart OCR Berhasil mengekstrak data Tagihan Dokumen Kontrak!' 
            : '✨ AI Smart OCR Berhasil mengekstrak data Struk Pengeluaran!');

      window.showFinanceToast(msg, 'success');
    }, 1400);
  };

  // Submit OCR Form
  window.submitOcrTransaction = function() {
    const desc = document.getElementById('exp-desc')?.value;
    const amount = document.getElementById('exp-amount')?.value;
    const formatted = window.formatIDR ? window.formatIDR(parseFloat(amount) || 0) : 'Rp ' + amount;

    if (currentOcrType === 'income') {
      window.showFinanceToast(`✅ Pemasukan kas ${formatted} berhasil diposting ke Jurnal Kas Masuk (AR)!`, 'success');
    } else if (currentOcrType === 'contract') {
      window.showFinanceToast(`✅ Tagihan kontrak ${formatted} berhasil dicatat & dialokasikan ke HPP proyek!`, 'success');
    } else {
      window.showFinanceToast(`✅ Pengeluaran kas ${formatted} berhasil diajukan untuk verifikasi approval!`, 'success');
    }
  };

  // Expense Period Switcher (Daily, Monthly, Yearly)
  window.switchExpensePeriod = function(periodType, btn) {
    document.querySelectorAll('#btn-period-daily, #btn-period-monthly, #btn-period-yearly').forEach(b => {
      b.classList.remove('primary');
    });
    if (btn) btn.classList.add('primary');

    const labels = {
      'daily': 'Harian',
      'monthly': 'Bulanan',
      'yearly': 'Tahunan'
    };
    window.showFinanceToast(`Filter pengeluaran disesuaikan ke periode ${labels[periodType] || periodType}.`, 'info');
  };

  // Invoice Tab Switcher (Per Proyek, Per Klien, Jatuh Tempo)
  window.switchInvoiceTab = function(tabName) {
    ['project', 'client', 'month'].forEach(t => {
      const btn = document.getElementById('tab-btn-' + t);
      const view = document.getElementById('invoice-view-' + t);
      if (btn) {
        btn.classList.toggle('active', t === tabName);
      }
      if (view) {
        view.style.display = (t === tabName) ? 'block' : 'none';
      }
    });
  };

  // COA Category Filter
  window.filterCoaCategory = function(catCode, btn) {
    document.querySelectorAll('.coa-cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.coa-table-row').forEach(row => {
      const code = row.getAttribute('data-code');
      if (catCode === 'all' || code === catCode) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  // ==========================================================================
  // PPN & PPh 23 TAX ENGINE & PROJECT MANAGEMENT (PM) TRIGGER INTEGRATION
  // ==========================================================================

  // Format Helper: Rupiah Currency
  window.formatIDR = function(amount) {
    return 'Rp ' + Math.round(amount || 0).toLocaleString('id-ID');
  };

  // Live Calculation in Modal Tambah Termin
  window.calcModalTerminTax = function() {
    const dppInput = document.getElementById('mt-dpp');
    const ppnSelect = document.getElementById('mt-ppn-rate');
    const pphSelect = document.getElementById('mt-pph-rate');

    if (!dppInput) return;

    const dpp = parseFloat(dppInput.value) || 0;
    const ppnRate = ppnSelect ? parseFloat(ppnSelect.value) : 11;
    const pphRate = pphSelect ? parseFloat(pphSelect.value) : 2;

    const ppnAmount = dpp * (ppnRate / 100);
    const pphAmount = dpp * (pphRate / 100);
    const grossTotal = dpp + ppnAmount;
    const netReceived = grossTotal - pphAmount;

    const ppnEl = document.getElementById('mt-calc-ppn');
    const pphEl = document.getElementById('mt-calc-pph');
    const totalEl = document.getElementById('mt-calc-total');
    const netEl = document.getElementById('mt-calc-net');

    if (ppnEl) ppnEl.textContent = '+ ' + window.formatIDR(ppnAmount) + ` (${ppnRate}%)`;
    if (pphEl) pphEl.textContent = '- ' + window.formatIDR(pphAmount) + ` (${pphRate}%)`;
    if (totalEl) totalEl.textContent = window.formatIDR(grossTotal);
    if (netEl) netEl.textContent = window.formatIDR(netReceived);
  };

  // Modal: Detail Rincian Pajak Faktur
  window.showInvoiceTaxDetail = function(terminName, dpp, ppn, pph, status) {
    const titleEl = document.getElementById('mtd-title');
    const dppEl = document.getElementById('mtd-dpp');
    const ppnEl = document.getElementById('mtd-ppn');
    const pphEl = document.getElementById('mtd-pph');
    const totalEl = document.getElementById('mtd-total');
    const netEl = document.getElementById('mtd-net');
    const statusEl = document.getElementById('mtd-status');

    if (titleEl) titleEl.textContent = terminName;
    if (dppEl) dppEl.textContent = window.formatIDR(dpp);
    if (ppnEl) ppnEl.textContent = '+ ' + window.formatIDR(ppn);
    if (pphEl) pphEl.textContent = '- ' + window.formatIDR(pph);
    if (totalEl) totalEl.textContent = window.formatIDR(dpp + ppn);
    if (netEl) netEl.textContent = window.formatIDR((dpp + ppn) - pph);
    if (statusEl) {
      statusEl.textContent = status || 'Aktif';
      if (status === 'Lunas') {
        statusEl.className = 'badge success';
      } else if (status === 'Draft' || status?.includes('DRAFT')) {
        statusEl.className = 'badge amber-draft';
      } else {
        statusEl.className = 'badge warning';
      }
    }

    window.openFinanceModal('modalTaxDetail');
  };

  // ==========================================================================
  // CRM TERMIN MANAGEMENT: EDIT & DELETE TERMIN (SINKRON DARI CRM)
  // ==========================================================================

  // Live Tax Calculation in Edit Termin Modal
  window.calcEditModalTerminTax = function() {
    const dppInput = document.getElementById('edit-t-dpp');
    const ppnSelect = document.getElementById('edit-t-ppn');
    const pphSelect = document.getElementById('edit-t-pph');

    if (!dppInput) return;

    const dpp = parseFloat(dppInput.value) || 0;
    const ppnRate = ppnSelect ? parseFloat(ppnSelect.value) : 11;
    const pphRate = pphSelect ? parseFloat(pphSelect.value) : 2;

    const ppnAmount = dpp * (ppnRate / 100);
    const pphAmount = dpp * (pphRate / 100);
    const grossTotal = dpp + ppnAmount;
    const netReceived = grossTotal - pphAmount;

    const ppnEl = document.getElementById('edit-t-calc-ppn');
    const pphEl = document.getElementById('edit-t-calc-pph');
    const totalEl = document.getElementById('edit-t-calc-total');
    const netEl = document.getElementById('edit-t-calc-net');

    if (ppnEl) ppnEl.textContent = '+ ' + window.formatIDR(ppnAmount) + ` (${ppnRate}%)`;
    if (pphEl) pphEl.textContent = '- ' + window.formatIDR(pphAmount) + ` (${pphRate}%)`;
    if (totalEl) totalEl.textContent = window.formatIDR(grossTotal);
    if (netEl) netEl.textContent = window.formatIDR(netReceived);
  };

  // Open Edit Termin Modal
  window.openEditTerminModal = function(id, name, dpp, due, project, client) {
    const idEl = document.getElementById('edit-t-id');
    const projEl = document.getElementById('edit-t-proj');
    const clientEl = document.getElementById('edit-t-client');
    const nameEl = document.getElementById('edit-t-name');
    const dppEl = document.getElementById('edit-t-dpp');
    const dueEl = document.getElementById('edit-t-due');

    if (idEl) idEl.value = id;
    if (projEl) projEl.textContent = project || 'Aplikasi Kasir RS Medika';
    if (clientEl) clientEl.textContent = client || 'RS Medika Utama';
    if (nameEl) nameEl.value = name || '';
    if (dppEl) dppEl.value = dpp || 0;
    if (dueEl) dueEl.value = due || '2026-10-01';

    window.calcEditModalTerminTax();
    window.openFinanceModal('modalEditTermin');
  };

  // Submit Save Edited Termin
  window.submitSaveEditedTermin = function() {
    const id = document.getElementById('edit-t-id')?.value;
    const newName = document.getElementById('edit-t-name')?.value;
    const newDue = document.getElementById('edit-t-due')?.value;

    const nameTarget = document.getElementById('tname-' + id);
    const dueTarget = document.getElementById('tdue-' + id);

    if (nameTarget && newName) nameTarget.textContent = newName;
    if (dueTarget && newDue) dueTarget.textContent = newDue;

    window.closeFinanceModal('modalEditTermin');
    window.showFinanceToast(`✅ Termin #${id} berhasil diperbarui (Jatuh tempo: ${newDue})!`, 'success');
  };

  // Delete Termin Row with Confirmation
  window.deleteTerminRow = function(rowId, terminLabel) {
    const confirmed = confirm(`Apakah Anda yakin ingin menghapus jadwal penagihan '${terminLabel}'?\nCatatan: Kesepakatan MoU/Quotation di CRM akan diberi notifikasi pembatalan termin.`);
    if (!confirmed) return;

    const row = document.getElementById(rowId);
    if (row) {
      row.style.transition = 'all 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        window.showFinanceToast(`🗑️ Jadwal '${terminLabel}' berhasil dihapus dari daftar termin penagihan.`, 'info');
      }, 300);
    }
  };

  // ==========================================================================
  // INVOICE CARDS SORTING & FILTERING (PER PROYEK, PER KLIEN, JATUH TEMPO)
  // ==========================================================================

  // Sort Project Cards / Rows
  window.sortInvoiceCards = function(sortType) {
    const container = document.getElementById('invoice-view-project');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.invoice-project-card'));
    if (!cards.length) return;

    cards.sort((a, b) => {
      const projA = (a.getAttribute('data-project') || '').toLowerCase();
      const projB = (b.getAttribute('data-project') || '').toLowerCase();
      const clientA = (a.getAttribute('data-client') || '').toLowerCase();
      const clientB = (b.getAttribute('data-client') || '').toLowerCase();
      const dueA = a.getAttribute('data-due') || '';
      const dueB = b.getAttribute('data-due') || '';
      const amtA = parseFloat(a.getAttribute('data-amount') || 0);
      const amtB = parseFloat(b.getAttribute('data-amount') || 0);

      if (sortType === 'project-asc') return projA.localeCompare(projB);
      if (sortType === 'project-desc') return projB.localeCompare(projA);
      if (sortType === 'client-asc') return clientA.localeCompare(clientB);
      if (sortType === 'due-soon') return dueA.localeCompare(dueB);
      if (sortType === 'amount-high') return amtB - amtA;
      return 0;
    });

    cards.forEach(card => container.appendChild(card));
    window.showFinanceToast(`Urutan penagihan disortir berdasarkan: ${sortType.replace('-', ' ').toUpperCase()}`, 'info');
  };

  // Filter Invoice by Search Query
  window.filterInvoiceCards = function(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.invoice-project-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // ==========================================================================
  // PROJECT-SPECIFIC INVOICE APPROVAL FROM PM
  // (Persetujuan per-klien dan per-proyek, tidak borongan sekaligus)
  // ==========================================================================

  window.approveSpecificProjectInvoice = function(invoiceNum, projectName, clientName) {
    const badge = document.getElementById('badgeTermin2');
    const btnApprove = document.getElementById('btnApproveTermin2');
    const notice = document.getElementById('pmDraftNotice');
    const row = document.getElementById('rowTermin2');

    if (badge) {
      badge.className = 'badge warning';
      badge.innerHTML = '<i class="fa-solid fa-clock"></i> 🟡 MENUNGGU BAYAR';
    }

    if (row) {
      row.style.background = '';
    }

    if (btnApprove) {
      btnApprove.className = 'btn btn-xs primary';
      btnApprove.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim ke Klien';
      btnApprove.onclick = function() {
        window.showFinanceToast(`Invoice ${invoiceNum} untuk ${clientName} (${projectName}) terkirim via Email & WhatsApp!`, 'success');
        this.disabled = true;
        this.innerHTML = '<i class="fa-solid fa-check"></i> Terkirim';
      };
    }

    if (notice) {
      notice.style.background = '#ECFDF5';
      notice.style.borderColor = '#A7F3D0';
      const desc = document.getElementById('pmDraftNoticeDesc');
      if (desc) {
        desc.textContent = `Invoice ${invoiceNum} untuk proyek [${projectName}] klien [${clientName}] telah disetujui Finance. Status kini 'Menunggu Pembayaran'.`;
        desc.style.color = '#065F46';
      }
      const actions = notice.querySelector('div:last-child');
      if (actions) {
        actions.innerHTML = `<span class="badge success"><i class="fa-solid fa-check-double"></i> Disetujui (${projectName})</span>`;
      }
    }

    window.showFinanceToast(`✅ Invoice ${invoiceNum} untuk proyek [${projectName} - ${clientName}] berhasil diapprove!`, 'success');
  };

  // Backward compatibility wrapper
  window.approveDraftInvoice = function(invoiceNum) {
    window.approveSpecificProjectInvoice(invoiceNum, 'Aplikasi Kasir RS Medika', 'RS Medika Utama');
  };

  // Action: Trigger Khusus Termin 3 Selesai di PM dengan spesifikasi proyek
  window.simulatePmApprovalTermin3 = function(projectName = 'Aplikasi Kasir RS Medika', clientName = 'RS Medika Utama') {
    const notice = document.getElementById('pmDraftNotice');
    if (notice) {
      notice.style.display = 'flex';
      notice.style.background = '#FFFBEB';
      notice.style.borderColor = '#FDE68A';
      notice.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:50%; background:#FEF3C7; color:#D97706; display:grid; place-items:center; font-size:16px;">
            <i class="fa-solid fa-bell-concierge"></i>
          </div>
          <div>
            <strong style="font-size:12.5px; color:#92400E; display:block;">Invoice Baru Masuk: Proyek ${projectName} (INV-2612-003)</strong>
            <span style="font-size:11px; color:#B45309;" id="pmDraftNoticeDesc">PM telah menandai tuntas milestone "Pelunasan & BAST (Termin 3)". Menunggu persetujuan Finance khusus untuk klien [${clientName}]!</span>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-xs success" onclick="approveTermin3Draft('${projectName}', '${clientName}')"><i class="fa-solid fa-check"></i> Approve [${projectName}]</button>
        </div>
      `;
    }

    const badge3 = document.getElementById('badgeTermin3');
    if (badge3) {
      badge3.className = 'badge amber-draft';
      badge3.innerHTML = '🟡 DRAFT PM (Perlu Approval)';
    }

    const btnTrigger3 = document.getElementById('btnTriggerTermin3');
    if (btnTrigger3) {
      btnTrigger3.className = 'btn btn-xs success';
      btnTrigger3.innerHTML = `<i class="fa-solid fa-check"></i> Approve Termin 3`;
      btnTrigger3.onclick = function() {
        window.approveTermin3Draft(projectName, clientName);
      };
    }

    // Scroll smoothly to invoices view
    window.switchFinancePage('invoices');
    window.showFinanceToast(`🚀 Milestone proyek '${projectName}' ditandai selesai oleh PM! Draf invoice masuk ke antrean Finance.`, 'info');
  };

  // Action: Approve Termin 3 Draft khusus proyek
  window.approveTermin3Draft = function(projectName = 'Aplikasi Kasir RS Medika', clientName = 'RS Medika Utama') {
    const notice = document.getElementById('pmDraftNotice');
    if (notice) {
      notice.style.background = '#ECFDF5';
      notice.style.borderColor = '#A7F3D0';
      notice.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:50%; background:#D1FAE5; color:#059669; display:grid; place-items:center; font-size:16px;">
            <i class="fa-solid fa-check-circle"></i>
          </div>
          <div>
            <strong style="font-size:12.5px; color:#065F46; display:block;">Invoice INV-2612-003 [${projectName}] Resmi Disetujui</strong>
            <span style="font-size:11px; color:#047857;">Persetujuan Finance selesai untuk klien ${clientName}. Invoice diterbitkan.</span>
          </div>
        </div>
        <span class="badge success"><i class="fa-solid fa-check-double"></i> Terbit & Aktif</span>
      `;
    }

    const badge3 = document.getElementById('badgeTermin3');
    if (badge3) {
      badge3.className = 'badge warning';
      badge3.innerHTML = '🟡 MENUNGGU BAYAR';
    }

    const btnTrigger3 = document.getElementById('btnTriggerTermin3');
    if (btnTrigger3) {
      btnTrigger3.className = 'btn btn-xs primary';
      btnTrigger3.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Kirim ke Klien`;
      btnTrigger3.onclick = function() {
        window.showFinanceToast(`Invoice Termin 3 resmi terkirim ke klien ${clientName}!`, 'success');
        this.disabled = true;
      };
    }

    window.showFinanceToast(`✅ Invoice Termin 3 untuk proyek [${projectName}] berhasil diapprove per-klien!`, 'success');
  };

  // Action: Sinkronkan Termin dari Kontrak Quotation CRM
  window.syncTerminsFromCrm = function() {
    window.showFinanceToast('🔄 Menyinkronkan kesepakatan termin dari Quotation CRM...', 'info');
    setTimeout(() => {
      window.showFinanceToast('✨ 100% Termin kontrak MoU & Quotation CRM telah tersinkron dengan Finance!', 'success');
    }, 900);
  };

  // ==========================================================================
  // HR MODULE INTEGRATION (MASTER GAJI POKOK MENGIKUTI JABATAN HR)
  // ==========================================================================

  // Master Standar Gaji Pokok & Tunjangan Berdasarkan Jabatan di Astacode HR
  const HR_SALARY_STANDARDS = {
    'Tech Lead': { gaji: 18000000, tunj: 3000000, tim: 'Engineering' },
    'HR Manager': { gaji: 14000000, tunj: 2500000, tim: 'People Ops' },
    'Backend Developer': { gaji: 12000000, tunj: 1500000, tim: 'Engineering' },
    'Frontend Developer': { gaji: 11000000, tunj: 1500000, tim: 'Engineering' },
    'UI/UX Designer': { gaji: 10500000, tunj: 1200000, tim: 'Design' },
    'QA Engineer': { gaji: 9500000, tunj: 1000000, tim: 'QA' },
    'Junior Developer': { gaji: 7000000, tunj: 800000, tim: 'Engineering' }
  };

  // Event saat Karyawan dipilih di modal
  window.onHrEmployeeSelected = function(name) {
    const sel = document.getElementById('pay-emp-select');
    if (!sel || !sel.selectedOptions.length) return;
    const opt = sel.selectedOptions[0];
    const nameInput = document.getElementById('pay-name');
    const jabSelect = document.getElementById('pay-jabatan');
    const gajiInput = document.getElementById('pay-gaji');
    const tunjInput = document.getElementById('pay-tunj');

    if (name === 'custom') {
      if (nameInput) nameInput.value = '';
      return;
    }

    const jabatan = opt.getAttribute('data-jabatan');
    const gaji = opt.getAttribute('data-gaji');
    const tunj = opt.getAttribute('data-tunj');

    if (nameInput) nameInput.value = name;
    if (jabSelect && jabatan) jabSelect.value = jabatan;
    if (gajiInput && gaji) gajiInput.value = gaji;
    if (tunjInput && tunj) tunjInput.value = tunj;
  };

  // Event saat Jabatan diganti (mengunci gaji pokok sesuai standar HR)
  window.onHrJabatanChanged = function(jabatan) {
    const std = HR_SALARY_STANDARDS[jabatan];
    const gajiInput = document.getElementById('pay-gaji');
    const tunjInput = document.getElementById('pay-tunj');

    if (std) {
      if (gajiInput) gajiInput.value = std.gaji;
      if (tunjInput) tunjInput.value = std.tunj;
      window.showFinanceToast(`Gaji pokok & tunjangan disesuaikan otomatis dengan standar grade HR untuk '${jabatan}'.`, 'info');
    }
  };

  // Sinkronkan seluruh data payroll dengan modul HR
  window.syncPayrollFromHrModule = function() {
    window.showFinanceToast('🔄 Menyinkronkan data master pegawai & grade jabatan dari Modul HR Astacode...', 'info');
    setTimeout(() => {
      window.showFinanceToast('✅ 6 Karyawan Tetap & Struktur Gaji Pokok resmi tersinkronisasi 100% dengan HR!', 'success');
    }, 800);
  };

  // Submit Payroll Form
  window.submitPayrollHrForm = function() {
    const name = document.getElementById('pay-name')?.value;
    const jab = document.getElementById('pay-jabatan')?.value;
    const gaji = parseFloat(document.getElementById('pay-gaji')?.value) || 0;
    const tunj = parseFloat(document.getElementById('pay-tunj')?.value) || 0;
    const net = gaji + tunj;

    window.closeFinanceModal('modalCreatePayroll');
    window.showFinanceToast(`✅ Data payroll ${name} (${jab}) berhasil disimpan dengan standar gaji HR ${window.formatIDR(net)}!`, 'success');
  };

  // Modal Slip Gaji Karyawan
  window.showSlipGajiModal = function(name, role, gaji, tunj) {
    const empName = document.getElementById('slip-emp-name');
    const empRole = document.getElementById('slip-emp-role');
    const baseEl = document.getElementById('slip-base');
    const tunjEl = document.getElementById('slip-tunj');
    const netEl = document.getElementById('slip-net');

    if (empName) empName.textContent = name;
    if (empRole) empRole.textContent = `${role} • Master Modul HR`;
    if (baseEl) baseEl.textContent = window.formatIDR(gaji);
    if (tunjEl) tunjEl.textContent = '+ ' + window.formatIDR(tunj);
    if (netEl) netEl.textContent = window.formatIDR(gaji + tunj);

    window.openFinanceModal('modalSlipGaji');
  };

  // ==========================================================================
  // FREELANCE CONTRACT (SPK) SYSTEM
  // ==========================================================================

  // Submit Kontrak Freelance Baru
  window.submitFreelanceContract = function() {
    const spk = document.getElementById('fl-spk')?.value;
    const name = document.getElementById('fl-name')?.value;
    const amount = parseFloat(document.getElementById('fl-amount')?.value) || 0;

    window.closeFinanceModal('modalCreateFreelancer');
    window.showFinanceToast(`✅ Dokumen Kontrak Kerja SPK (${spk}) untuk ${name} senilai ${window.formatIDR(amount)} berhasil diterbitkan! Menunggu verifikasi deliverable PM.`, 'success');
  };

  // ==========================================================================
  // PENGELUARAN CONTROLLER (HARIAN, MINGGUAN, BULANAN, TAHUNAN DENGAN JAM/HARI)
  // ==========================================================================

  let currentPengeluaranPeriod = 'harian';

  window.setPengeluaranPeriod = function(period) {
    currentPengeluaranPeriod = period;

    // Update Tab Button Styles
    const periods = ['harian', 'mingguan', 'bulanan', 'tahunan'];
    periods.forEach(p => {
      const btn = document.getElementById('btn-period-tab-' + p);
      if (btn) {
        if (p === period) {
          btn.className = 'btn btn-sm primary';
          btn.style.boxShadow = '0 2px 4px rgba(48,91,163,0.3)';
        } else {
          btn.className = 'btn btn-sm';
          btn.style.boxShadow = 'none';
        }
      }
    });

    // Update Banner Text & Badge
    const descEl = document.getElementById('pengeluaranPeriodDesc');
    const badgeEl = document.getElementById('pengeluaranPeriodBadge');

    if (descEl && badgeEl) {
      if (period === 'harian') {
        descEl.innerHTML = '<i class="fa-solid fa-calendar-day" style="margin-right:6px;"></i> Menampilkan Transaksi Pengeluaran: <strong>Periode Harian (Hari Ini: Senin, 12 Oktober 2026)</strong>';
        badgeEl.textContent = 'Mode: Real-Time Harian';
        badgeEl.className = 'badge info';
      } else if (period === 'mingguan') {
        descEl.innerHTML = '<i class="fa-solid fa-calendar-week" style="margin-right:6px;"></i> Menampilkan Transaksi Pengeluaran: <strong>Periode Mingguan (Minggu Ini: 05 - 12 Oktober 2026)</strong>';
        badgeEl.textContent = 'Mode: Mingguan (W41)';
        badgeEl.className = 'badge primary';
      } else if (period === 'bulanan') {
        descEl.innerHTML = '<i class="fa-solid fa-calendar" style="margin-right:6px;"></i> Menampilkan Transaksi Pengeluaran: <strong>Periode Bulanan (Bulan Berjalan: Oktober 2026)</strong>';
        badgeEl.textContent = 'Mode: Bulanan (Okt 2026)';
        badgeEl.className = 'badge purple';
      } else if (period === 'tahunan') {
        descEl.innerHTML = '<i class="fa-solid fa-chart-line" style="margin-right:6px;"></i> Menampilkan Transaksi Pengeluaran: <strong>Periode Tahunan (Tahun Anggaran: FY 2026)</strong>';
        badgeEl.textContent = 'Mode: Tahunan (FY 2026)';
        badgeEl.className = 'badge warning';
      }
    }

    // Filter Rows
    window.filterPengeluaranTable();
  };

  window.filterPengeluaranTable = function() {
    const period = currentPengeluaranPeriod || 'harian';
    const katFilter = document.getElementById('filterPengeluaranKategori')?.value || 'all';
    const searchVal = (document.getElementById('searchPengeluaranInput')?.value || '').toLowerCase().trim();

    const tbody = document.getElementById('pengeluaranTableBody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    let visibleCount = 0;
    let totalNominal = 0;

    rows.forEach(row => {
      const rowPeriod = row.getAttribute('data-period') || '';
      const rowKat = row.getAttribute('data-kategori') || '';
      const rowAmt = parseFloat(row.getAttribute('data-amount') || 0);
      const rowText = row.textContent.toLowerCase();

      // Period match logic:
      // 'harian' -> only harian
      // 'mingguan' -> harian + mingguan
      // 'bulanan' -> harian + mingguan + bulanan
      // 'tahunan' -> all
      let periodMatch = false;
      if (period === 'harian') {
        periodMatch = (rowPeriod === 'harian');
      } else if (period === 'mingguan') {
        periodMatch = (rowPeriod === 'harian' || rowPeriod === 'mingguan');
      } else if (period === 'bulanan') {
        periodMatch = (rowPeriod === 'harian' || rowPeriod === 'mingguan' || rowPeriod === 'bulanan');
      } else if (period === 'tahunan') {
        periodMatch = true;
      }

      const katMatch = (katFilter === 'all' || rowKat === katFilter);
      const searchMatch = (!searchVal || rowText.includes(searchVal));

      if (periodMatch && katMatch && searchMatch) {
        row.style.display = '';
        visibleCount++;
        totalNominal += rowAmt;
      } else {
        row.style.display = 'none';
      }
    });

    // Update KPI & Badges
    const kpiVal = document.getElementById('pengeluaran-kpi-val');
    const kpiSub = document.getElementById('pengeluaran-kpi-sub');
    const countBadge = document.getElementById('pengeluaranRowCountBadge');

    if (kpiVal) kpiVal.textContent = window.formatIDR(totalNominal);
    if (kpiSub) kpiSub.textContent = `${visibleCount} Transaksi tercatat`;
    if (countBadge) countBadge.textContent = `${visibleCount} Data Transaksi`;
  };

  window.exportPengeluaranCsv = function() {
    window.showFinanceToast(`📥 Mengunduh Laporan Pengeluaran (${currentPengeluaranPeriod.toUpperCase()}) format CSV...`, 'info');
    setTimeout(() => {
      window.showFinanceToast(`✅ File 'Laporan_Pengeluaran_${currentPengeluaranPeriod.toUpperCase()}_2026.csv' berhasil diekspor!`, 'success');
    }, 800);
  };

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    const hash = (window.location.hash || '').replace('#', '');
    const initialPage = hash || 'dashboard';
    window.switchFinancePage(initialPage);
    initCashflowChart();

    // Setup drag and drop for OCR upload
    const dropArea = document.getElementById('ocrDropArea');
    const fileInput = document.getElementById('ocrFileInput');

    if (dropArea && fileInput) {
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#305BA3';
        dropArea.style.background = '#EFF6FF';
      });

      dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
      });

      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
        if (e.dataTransfer.files.length > 0) {
          window.simulateOcrScan(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          window.simulateOcrScan(fileInput.files[0]);
        }
      });
    }

    // Modal background click to close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });
  });

})();
