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
    'report-customer': 'Laporan Keuangan per Customer',
    'messages': 'Pusat Pesan',
  };

  const HR_PAYROLL_PAYLOAD = {
    payroll_run_id: 'PR-2026-10',
    source_module: 'HR',
    status: 'DRAFT',
    currency: 'IDR',
    journal_entry_id: 'JE-PR-2026-10',
    allocations: { fixed_salary: 'OPEX', freelancer: 'HPP_PROJECT' }
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

    // Re-render charts if navigating to dashboard
    if (cleanId === 'dashboard' || cleanId === 'overview') {
      setTimeout(() => {
        initCashflowChart();
        initExpenseDonutChart();
      }, 50);
    }

    if (cleanId === 'payroll' && typeof window.renderPayrollTable === 'function') {
      window.renderPayrollTable();
    }

    // Refresh pagination on newly active view
    setTimeout(() => {
      const activeSec = document.getElementById(targetViewId) || document.getElementById(cleanId);
      if (activeSec) {
        const tables = activeSec.querySelectorAll('.data-table');
        tables.forEach(tbl => {
          if (typeof tbl._updatePagination === 'function') {
            tbl._updatePagination();
          } else {
            if (!tbl.id) tbl.id = `auto_tbl_${Math.random().toString(36).substr(2, 6)}`;
            window.setupTablePagination(tbl.id, 5);
          }
        });
      }
    }, 60);

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

  // Close modal when clicking backdrop or pressing Escape
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') && e.target.classList.contains('show')) {
      e.target.classList.remove('show');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
    }
  });

  // Initialize Chart.js
  let cashflowChartInstance = null;
  let expenseDonutChartInstance = null;

  const cashflowDataPeriods = {
    '3m': {
      labels: ['Agu 2026', 'Sep 2026', 'Okt 2026 (Berjalan)'],
      inflow: [240000000, 310000000, 450000000],
      outflow: [140000000, 155000000, 174850000]
    },
    '6m': {
      labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt (Berjalan)'],
      inflow: [150000000, 180000000, 210000000, 240000000, 310000000, 450000000],
      outflow: [90000000, 110000000, 125000000, 140000000, 155000000, 174850000]
    },
    '1y': {
      labels: ['Nov 25', 'Des 25', 'Jan 26', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
      inflow: [110000000, 130000000, 140000000, 120000000, 160000000, 175000000, 150000000, 180000000, 210000000, 240000000, 310000000, 450000000],
      outflow: [75000000, 85000000, 95000000, 80000000, 100000000, 115000000, 90000000, 110000000, 125000000, 140000000, 155000000, 174850000]
    }
  };

  function initCashflowChart(period = '6m') {
    const canvas = document.getElementById('financeCashflowChart');
    if (!canvas) return;

    const dataConfig = cashflowDataPeriods[period] || cashflowDataPeriods['6m'];

    if (cashflowChartInstance) {
      cashflowChartInstance.data.labels = dataConfig.labels;
      cashflowChartInstance.data.datasets[0].data = dataConfig.inflow;
      cashflowChartInstance.data.datasets[1].data = dataConfig.outflow;
      cashflowChartInstance.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    cashflowChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dataConfig.labels,
        datasets: [
          {
            label: 'Uang Masuk (AR)',
            data: dataConfig.inflow,
            backgroundColor: '#10B981',
            borderRadius: 6,
            barThickness: period === '1y' ? 10 : 16
          },
          {
            label: 'Uang Keluar (AP & OPEX)',
            data: dataConfig.outflow,
            backgroundColor: '#F87171',
            borderRadius: 6,
            barThickness: period === '1y' ? 10 : 16
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Inter', size: 11, weight: '600' }, boxWidth: 12, padding: 14 }
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

  window.updateCashflowPeriod = function(periodKey, btn) {
    const parent = document.getElementById('dashboardPeriodToggles');
    if (parent) {
      parent.querySelectorAll('button').forEach(b => b.classList.remove('primary'));
    }
    if (btn) btn.classList.add('primary');
    initCashflowChart(periodKey);
    const pNames = { '3m': '3 Bulan Terakhir', '6m': '6 Bulan Terakhir', '1y': '1 Tahun Penuh' };
    window.showFinanceToast(`Rentang Arus Kas disetel ke: ${pNames[periodKey] || periodKey}`, 'info');
  };

  function initExpenseDonutChart() {
    const canvas = document.getElementById('financeExpenseDonutChart');
    if (!canvas) return;

    if (expenseDonutChartInstance) {
      expenseDonutChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    expenseDonutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Gaji Karyawan (Payroll)',
          'Upah Freelancer (SPK)',
          'Cloud Server AWS & Infra',
          'Sewa Kantor & Internet',
          'Utilitas & Lembur'
        ],
        datasets: [{
          data: [85000000, 42000000, 23000000, 15000000, 9850000],
          backgroundColor: [
            '#3B82F6',
            '#F59E0B',
            '#8B5CF6',
            '#EF4444',
            '#10B981'
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { family: 'Inter', size: 10.5, weight: '600' },
              boxWidth: 10,
              padding: 8
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: Rp ${context.raw.toLocaleString('id-ID')} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
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
    const desc = document.getElementById('exp-desc')?.value || 'Pengeluaran Struk OCR';
    const amount = parseFloat(document.getElementById('exp-amount')?.value) || 0;
    const vendor = document.getElementById('exp-vendor')?.value || 'Merchant Toko';
    const date = document.getElementById('exp-date')?.value || new Date().toISOString().split('T')[0];
    const alloc = document.getElementById('exp-allocation')?.value || 'opex';
    const formatted = window.formatIDR ? window.formatIDR(amount) : 'Rp ' + amount;

    if (currentOcrType === 'income') {
      // Pemasukan kas
      window.addJournalEntry({
        date,
        ref: `JRN-OCR-IN-${Math.floor(100 + Math.random() * 900)}`,
        title: `Pemasukan Kas: ${desc} (${vendor})`,
        source: 'ar',
        debitAccount: '1102 - Bank BCA Operasional',
        creditAccount: '1103 - Piutang Usaha (AR Invoice)',
        amount
      });
      if (BANK_ACCOUNTS_MASTER['BCA']) {
        BANK_ACCOUNTS_MASTER['BCA'].balance += amount;
        window.syncBankBalancesUI();
      }
      window.showFinanceToast(`✅ Pemasukan kas ${formatted} dari [${vendor}] berhasil dicatat & diposting ke Jurnal Kas Masuk (AR)!`, 'success');
    } else if (currentOcrType === 'contract') {
      // Tagihan kontrak
      window.addJournalEntry({
        date,
        ref: `JRN-OCR-CT-${Math.floor(100 + Math.random() * 900)}`,
        title: `Pencatatan Tagihan Kontrak: ${desc} (${vendor})`,
        source: 'ap',
        debitAccount: '5101 - Beban Tenaga Lepas (Freelance HPP)',
        creditAccount: '2101 - Hutang Usaha / Vendor',
        amount
      });
      window.showFinanceToast(`✅ Tagihan kontrak ${formatted} (${vendor}) berhasil dicatat di AP & dialokasikan ke HPP proyek!`, 'success');
    } else {
      // Pengeluaran Kas Kecil / Struk -> Masuk otomatis ke opexList!
      const newId = `OPX-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(opexList.length + 1).padStart(2, '0')}`;
      const newOpex = {
        id: newId,
        date,
        time: '14:20:00',
        day: 'Hari Ini',
        name: desc,
        category: alloc === 'opex' ? 'Peralatan & ATK' : 'HPP Proyek',
        nominal: amount,
        bankId: 'KAS_KECIL',
        recipient: vendor,
        targetAccount: `Kas Kecil Kantor / Struk (${vendor})`,
        status: 'Terbayar',
        notes: `Klaim struk hasil ekstraksi AI OCR (${vendor})`
      };

      opexList.unshift(newOpex);

      // Deduct Kas Kecil
      if (BANK_ACCOUNTS_MASTER['KAS_KECIL'] && BANK_ACCOUNTS_MASTER['KAS_KECIL'].balance >= amount) {
        BANK_ACCOUNTS_MASTER['KAS_KECIL'].balance -= amount;
        window.syncBankBalancesUI();
      }

      // Add to General Journal
      window.addJournalEntry({
        date,
        ref: `JRN-OCR-${newId}`,
        title: `Klaim Struk AI OCR: ${desc} (${vendor})`,
        source: 'opex',
        debitAccount: '6102 - Beban Operasional Kantor',
        creditAccount: '1101 - Kas Kecil (Petty Cash)',
        amount
      });

      window.renderOpexTable();
      window.showFinanceToast(`✅ Struk [${vendor}] senilai ${formatted} otomatis tersinkronisasi ke Tabel OPEX & Jurnal Umum!`, 'success');
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
    document.querySelectorAll('.coa-cat-btn').forEach(b => b.classList.remove('primary'));
    if (btn) btn.classList.add('primary');

    document.querySelectorAll('.coa-table-row').forEach(row => {
      const code = row.getAttribute('data-code');
      if (catCode === 'all' || code === catCode) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  function updateCoaTotalBadge() {
    const rows = document.querySelectorAll('.coa-table-row');
    const allBtn = document.querySelector('.coa-cat-btn');
    if (allBtn) {
      allBtn.textContent = `Semua (${rows.length})`;
    }
  }

  // Submit Create New COA Account
  window.submitCreateCoaForm = function() {
    const code = document.getElementById('new-coa-code')?.value?.trim() || '1199';
    const name = document.getElementById('new-coa-name')?.value?.trim() || 'Akun Baru';
    const cat = document.getElementById('new-coa-cat')?.value || '1000';
    const pos = document.getElementById('new-coa-pos')?.value || 'DEBIT';

    const catLabels = {
      '1000': { label: '1000 - Aset Lancar', badge: 'info' },
      '2000': { label: '2000 - Kewajiban', badge: 'warning' },
      '3000': { label: '3000 - Ekuitas', badge: 'neutral' },
      '4000': { label: '4000 - Pendapatan', badge: 'purple' },
      '5000': { label: '5000 - HPP Proyek', badge: 'warning' },
      '6000': { label: '6000 - Beban OPEX', badge: 'danger' }
    };
    const catInfo = catLabels[cat] || { label: cat, badge: 'info' };

    const tbody = document.getElementById('coaTableBody');
    if (tbody) {
      const tr = document.createElement('tr');
      tr.className = 'coa-table-row';
      tr.setAttribute('data-code', cat);
      tr.style.backgroundColor = '#ECFDF5';
      tr.innerHTML = `
        <td><span style="font-family:var(--font-mono); font-weight:700; color:var(--primary);">${code}</span></td>
        <td><strong>${name}</strong></td>
        <td><span class="badge ${catInfo.badge}">${catInfo.label}</span></td>
        <td><strong style="color:${pos === 'DEBIT' ? '#10B981' : '#8B5CF6'};">${pos}</strong></td>
        <td style="text-align:right; font-weight:800;">Rp 0</td>
        <td style="text-align:center;">
          <button class="btn btn-xs outline" onclick="editCoaRow(this)" title="Edit Akun"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-xs outline text-danger" onclick="deleteCoaRow(this)" title="Hapus Akun" style="color:#EF4444; margin-left:4px;"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.prepend(tr);
      setTimeout(() => tr.style.backgroundColor = '', 1500);
    }

    updateCoaTotalBadge();
    window.closeFinanceModal('modalCreateCoa');
    window.showFinanceToast(`✅ Akun COA [${code}] ${name} berhasil ditambahkan ke Buku Besar!`, 'success');
  };

  // Currently active row being edited
  let activeEditingCoaRow = null;

  // Edit COA Row Modal Trigger
  window.editCoaRow = function(btn) {
    const row = btn.closest('tr');
    if (!row) return;
    activeEditingCoaRow = row;

    const code = row.querySelector('td:nth-child(1)')?.textContent?.trim() || '';
    const name = row.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
    const pos = row.querySelector('td:nth-child(4)')?.textContent?.trim() || 'DEBIT';
    const catCode = row.getAttribute('data-code') || '1000';

    const codeInp = document.getElementById('edit-coa-code');
    const nameInp = document.getElementById('edit-coa-name');
    const catSel = document.getElementById('edit-coa-cat');
    const posSel = document.getElementById('edit-coa-pos');

    if (codeInp) codeInp.value = code;
    if (nameInp) nameInp.value = name;
    if (catSel) catSel.value = catCode;
    if (posSel) posSel.value = pos;

    window.openFinanceModal('modalEditCoa');
  };

  // Submit Edit COA Form
  window.submitEditCoaForm = function() {
    if (!activeEditingCoaRow) return;

    const code = document.getElementById('edit-coa-code')?.value?.trim() || '';
    const name = document.getElementById('edit-coa-name')?.value?.trim() || '';
    const cat = document.getElementById('edit-coa-cat')?.value || '1000';
    const pos = document.getElementById('edit-coa-pos')?.value || 'DEBIT';

    const catLabels = {
      '1000': { label: '1000 - Aset Lancar', badge: 'info' },
      '2000': { label: '2000 - Kewajiban', badge: 'warning' },
      '3000': { label: '3000 - Ekuitas', badge: 'neutral' },
      '4000': { label: '4000 - Pendapatan', badge: 'purple' },
      '5000': { label: '5000 - HPP Proyek', badge: 'warning' },
      '6000': { label: '6000 - Beban OPEX', badge: 'danger' }
    };
    const catInfo = catLabels[cat] || { label: cat, badge: 'info' };

    activeEditingCoaRow.setAttribute('data-code', cat);
    activeEditingCoaRow.querySelector('td:nth-child(1)').innerHTML = `<span style="font-family:var(--font-mono); font-weight:700; color:var(--primary);">${code}</span>`;
    activeEditingCoaRow.querySelector('td:nth-child(2)').innerHTML = `<strong>${name}</strong>`;
    activeEditingCoaRow.querySelector('td:nth-child(3)').innerHTML = `<span class="badge ${catInfo.badge}">${catInfo.label}</span>`;
    activeEditingCoaRow.querySelector('td:nth-child(4)').innerHTML = `<strong style="color:${pos === 'DEBIT' ? '#10B981' : '#8B5CF6'};">${pos}</strong>`;

    const targetRow = activeEditingCoaRow;
    targetRow.style.backgroundColor = '#FEF3C7';
    setTimeout(() => {
      targetRow.style.backgroundColor = '';
    }, 1200);

    activeEditingCoaRow = null;
    window.closeFinanceModal('modalEditCoa');
    window.showFinanceToast(`✅ Data Akun COA [${code}] ${name} berhasil diperbarui!`, 'success');
  };

  // Delete COA Row with confirmation
  window.deleteCoaRow = function(btn) {
    const row = btn.closest('tr');
    if (!row) return;
    const code = row.querySelector('td:nth-child(1)')?.textContent?.trim() || '';
    const name = row.querySelector('td:nth-child(2)')?.textContent?.trim() || '';

    if (confirm(`Apakah Anda yakin ingin menghapus akun [${code}] ${name} dari daftar COA?`)) {
      row.style.transition = 'all 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        updateCoaTotalBadge();
        window.showFinanceToast(`🗑️ Akun COA [${code}] ${name} berhasil dihapus.`, 'info');
      }, 300);
    }
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
  // 1. SIMULASI & DETAIL PENGIRIMAN TERMIN DARI MODUL CRM
  // ==========================================================================

  const CRM_DEALS_PAYLOAD = {
    'samudera': {
      key: 'samudera',
      cardId: 'card-proj-samudera',
      dealId: 'CRM-DEAL-2026-108',
      mouNumber: 'MoU/ASTA-CRM/X/2026/108',
      quotationNumber: 'QUO-2026-0988',
      projectName: 'Samudera Logistik Tracking System',
      clientName: 'Samudera Logistik Nusantara',
      sector: 'Maritime Logistics & Freight B2B',
      salesAe: 'Nadia Putri (Account Executive CRM)',
      sentAt: '12 Okt 2026, 09:42 WIB',
      picName: 'Hendra Wijaya (VP Finance)',
      picPhone: '+62 815-8899-0011',
      picEmail: 'finance@samuderalogistik.co.id',
      npwp: '01.889.234.5-091.000',
      dppTotal: 140000000,
      ppnTotal: 15400000,
      pphTotal: 2800000,
      grossTotal: 155400000,
      netTotal: 152600000,
      imported: false,
      notes: 'Klien menyepakati skema 3 termin pembayaran (DP 50% saat Kickoff, Termin 2 UAT 25%, dan Pelunasan BAST 25%). Faktur pajak PPN 11% diterbitkan di setiap termin.',
      termins: [
        { id: 'samudera-1', ref: 'INV-2610-008', name: 'Termin 1: DP Kickoff Proyek (50%)', pct: '50%', dpp: 70000000, ppn: 7700000, pph: 1400000, gross: 77700000, net: 76300000, due: '2026-10-18', dueLabel: '18 Okt 2026', status: 'MENUNGGU BAYAR', badgeClass: 'warning' },
        { id: 'samudera-2', ref: 'INV-2611-009', name: 'Termin 2: UAT Tracking Portal (25%)', pct: '25%', dpp: 35000000, ppn: 3850000, pph: 700000, gross: 38850000, net: 38150000, due: '2026-11-20', dueLabel: '20 Nov 2026', status: 'MENUNGGU MP', badgeClass: 'neutral' },
        { id: 'samudera-3', ref: 'INV-2612-010', name: 'Termin 3: Pelunasan & BAST Final (25%)', pct: '25%', dpp: 35000000, ppn: 3850000, pph: 700000, gross: 38850000, net: 38150000, due: '2026-12-22', dueLabel: '22 Des 2026', status: 'MENUNGGU MP', badgeClass: 'neutral' }
      ]
    },
    'mitra': {
      key: 'mitra',
      cardId: 'card-proj-mitra',
      dealId: 'CRM-DEAL-2026-094',
      mouNumber: 'MoU/ASTA-CRM/X/2026/094',
      quotationNumber: 'QUO-2026-0912',
      projectName: 'Sistem HRIS Terintegrasi',
      clientName: 'PT Mitra Perkasa',
      sector: 'Enterprise Services & Logistics',
      salesAe: 'Reza Pratama (Senior Sales Manager CRM)',
      sentAt: '10 Okt 2026, 14:20 WIB',
      picName: 'Budi Santoso (VP HR & Finance)',
      picPhone: '+62 812-9876-5432',
      picEmail: 'ap@mitraperkasa.co.id',
      npwp: '02.411.890.1-044.000',
      dppTotal: 250000000,
      ppnTotal: 27500000,
      pphTotal: 5000000,
      grossTotal: 277500000,
      netTotal: 272500000,
      imported: false,
      notes: 'Kontrak Enterprise HRIS Cloud dengan 3 tahapan milestone (DP 30%, Delivery Modul Core 30%, Go-Live & BAST 40%). Klien memotong PPh 23 Jasa 2%.',
      termins: [
        { id: 'mitra-1', ref: 'INV-2609-005', name: 'Termin 1: DP Kontrak Awal (30%)', pct: '30%', dpp: 75000000, ppn: 8250000, pph: 1500000, gross: 83250000, net: 81750000, due: '2026-09-25', dueLabel: '25 Sep 2026', status: 'LUNAS', badgeClass: 'success' },
        { id: 'mitra-2', ref: 'INV-2610-006', name: 'Termin 2: Delivery Modul Payroll & Absensi (30%)', pct: '30%', dpp: 75000000, ppn: 8250000, pph: 1500000, gross: 83250000, net: 81750000, due: '2026-10-25', dueLabel: '25 Okt 2026', status: 'MENUNGGU BAYAR', badgeClass: 'warning' },
        { id: 'mitra-3', ref: 'INV-2612-007', name: 'Termin 3: Go-Live & BAST (40%)', pct: '40%', dpp: 100000000, ppn: 11000000, pph: 2000000, gross: 111000000, net: 109000000, due: '2026-12-15', dueLabel: '15 Des 2026', status: 'MENUNGGU MP', badgeClass: 'neutral' }
      ]
    },
    'medika': {
      key: 'medika',
      cardId: 'card-proj-medika',
      dealId: 'CRM-DEAL-2026-071',
      mouNumber: 'MoU/ASTA-CRM/VII/2026/071',
      quotationNumber: 'QUO-2026-0704',
      projectName: 'Aplikasi Kasir RS Medika',
      clientName: 'RS Medika Utama',
      sector: 'Healthcare & Hospital Sector',
      salesAe: 'Nadia Putri (Account Executive CRM)',
      sentAt: '28 Jul 2026, 16:05 WIB',
      picName: 'Heru Prasetyo (Finance Manager)',
      picPhone: '+62 817-6543-2100',
      picEmail: 'finance@rsmedika.co.id',
      npwp: '01.345.678.9-012.000',
      dppTotal: 30000000,
      ppnTotal: 3300000,
      pphTotal: 600000,
      grossTotal: 33300000,
      netTotal: 32700000,
      imported: true,
      notes: 'Jadwal termin telah aktif di modul Finance. Termin 1 telah lunas, Termin 2 baru saja dikirim oleh PM (UAT Selesai), dan Termin 3 menunggu BAST akhir.',
      termins: [
        { id: '1', ref: 'INV-2608-001', name: 'Termin 1: DP Awal (30%)', pct: '30%', dpp: 9000000, ppn: 990000, pph: 180000, gross: 9990000, net: 9810000, due: '2026-08-01', dueLabel: '01 Agu 2026', status: 'LUNAS', badgeClass: 'success' },
        { id: '2', ref: 'INV-2610-002', name: 'Termin 2: UAT Selesai (40%)', pct: '40%', dpp: 12000000, ppn: 1320000, pph: 240000, gross: 13320000, net: 13080000, due: '2026-10-01', dueLabel: '01 Okt 2026', status: 'DRAFT MP', badgeClass: 'amber-draft' },
        { id: '3', ref: 'INV-2612-003', name: 'Termin 3: Pelunasan & BAST (30%)', pct: '30%', dpp: 9000000, ppn: 990000, pph: 180000, gross: 9990000, net: 9810000, due: '2026-12-01', dueLabel: '01 Des 2026', status: 'MENUNGGU MP', badgeClass: 'neutral' }
      ]
    },
    'alpha': {
      key: 'alpha',
      cardId: 'card-proj-alpha',
      dealId: 'CRM-DEAL-2026-082',
      mouNumber: 'MoU/ASTA-CRM/IX/2026/082',
      quotationNumber: 'QUO-2026-0819',
      projectName: 'Web Company Profile X',
      clientName: 'PT Alpha Global',
      sector: 'Corporate & Management Consulting',
      salesAe: 'Dimas Anggara (Account Executive CRM)',
      sentAt: '01 Okt 2026, 11:10 WIB',
      picName: 'Sari Wijaya (Chief Commercial Officer)',
      picPhone: '+62 811-2233-4455',
      picEmail: 'sari.wijaya@alphaglobal.id',
      npwp: '03.112.556.7-021.000',
      dppTotal: 15000000,
      ppnTotal: 1650000,
      pphTotal: 300000,
      grossTotal: 16650000,
      netTotal: 16350000,
      imported: true,
      notes: 'Skema 2 termin (50% DP Awal dan 50% Pelunasan Go-Live). Jadwal termin sudah tersinkronisasi di tabel AR.',
      termins: [
        { id: 'alpha-1', ref: 'INV-2610-003', name: 'Termin 1: DP Awal (50%)', pct: '50%', dpp: 7500000, ppn: 825000, pph: 150000, gross: 8325000, net: 8175000, due: '2026-10-10', dueLabel: '10 Okt 2026', status: 'MENUNGGU BAYAR', badgeClass: 'warning' },
        { id: 'alpha-2', ref: 'INV-2611-004', name: 'Termin 2: Pelunasan & Go-Live (50%)', pct: '50%', dpp: 7500000, ppn: 825000, pph: 150000, gross: 8325000, net: 8175000, due: '2026-11-15', dueLabel: '15 Nov 2026', status: 'MENUNGGU MP', badgeClass: 'neutral' }
      ]
    }
  };

  let activeCrmDealKey = 'samudera';

  window.openCrmSimulationModal = function(dealKey = 'samudera') {
    window.selectCrmDealScenario(dealKey);
    window.openFinanceModal('modalCrmSyncDetail');
  };

  window.selectCrmDealScenario = function(dealKey) {
    activeCrmDealKey = dealKey;
    const deal = CRM_DEALS_PAYLOAD[dealKey] || CRM_DEALS_PAYLOAD['samudera'];

    ['samudera', 'mitra', 'medika', 'alpha'].forEach(k => {
      const btn = document.getElementById('crm-deal-btn-' + k);
      if (btn) btn.classList.toggle('primary', k === dealKey);
    });

    const box = document.getElementById('crm-delivery-detail-box');
    const importBtn = document.getElementById('btnConfirmImportCrm');

    if (importBtn) {
      if (deal.imported) {
        importBtn.className = 'btn success';
        importBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sudah Tersinkron di Daftar Proyek AR';
      } else {
        importBtn.className = 'btn primary';
        importBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Terima & Impor ${deal.termins.length} Termin [${deal.clientName}]`;
      }
    }

    if (!box) return;

    const terminRowsHtml = deal.termins.map(t => `
      <tr>
        <td>
          <strong style="color:var(--text-primary);">${t.name}</strong>
          <div style="font-size:10px; color:var(--text-muted);">Ref: ${t.ref} • Jatuh Tempo: ${t.dueLabel}</div>
        </td>
        <td style="text-align:right;">${window.formatIDR(t.dpp)}</td>
        <td style="text-align:right; color:#1D4ED8; font-weight:600;">+ ${window.formatIDR(t.ppn)}</td>
        <td style="text-align:right; color:#B45309; font-weight:600;">- ${window.formatIDR(t.pph)}</td>
        <td style="text-align:right; font-weight:800; color:var(--text-primary);">${window.formatIDR(t.gross)}</td>
        <td><span class="badge ${t.badgeClass}">${t.status}</span></td>
      </tr>
    `).join('');

    box.innerHTML = `
      <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:14px 16px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:10px; border-bottom:1px dashed #93C5FD; padding-bottom:10px;">
          <div>
            <span style="font-size:10.5px; font-weight:700; text-transform:uppercase; color:#1D4ED8; letter-spacing:0.04em;">
              <i class="fa-solid fa-satellite-dish"></i> Payload Pengiriman Deal Won dari Modul CRM
            </span>
            <h4 style="font-size:15px; font-weight:800; color:#3730A3; margin-top:2px;">${deal.projectName} — ${deal.clientName}</h4>
          </div>
          <span class="badge ${deal.imported ? 'success' : 'info'}" style="font-size:11px;">
            ${deal.imported ? '✅ Tersinkron di Finance' : '📥 Siap Diterima Finance'}
          </span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; font-size:12px;">
          <div>
            <div style="color:var(--text-muted); font-size:11px;">Pengirim (Modul CRM):</div>
            <strong style="color:var(--text-primary);"><i class="fa-solid fa-user-tie" style="color:var(--primary); margin-right:4px;"></i> ${deal.salesAe}</strong>
          </div>
          <div>
            <div style="color:var(--text-muted); font-size:11px;">Waktu Transmisi CRM:</div>
            <strong style="color:var(--text-primary);"><i class="fa-regular fa-clock" style="color:var(--primary); margin-right:4px;"></i> ${deal.sentAt}</strong>
          </div>
          <div>
            <div style="color:var(--text-muted); font-size:11px;">Dokumen MoU & Quotation:</div>
            <strong style="color:var(--primary); font-family:var(--font-mono); font-size:11.5px;">${deal.mouNumber} (${deal.quotationNumber})</strong>
          </div>
          <div>
            <div style="color:var(--text-muted); font-size:11px;">PIC Keuangan Klien & Kontak WA:</div>
            <strong style="color:var(--text-primary);">${deal.picName} • <span style="color:#059669;">${deal.picPhone}</span></strong>
          </div>
        </div>

        <div style="margin-top:10px; padding:8px 12px; background:#fff; border:1px solid #DBEAFE; border-radius:8px; font-size:11.5px; color:#1E40AF;">
          <strong><i class="fa-solid fa-note-sticky"></i> Catatan Handover CRM:</strong> "${deal.notes}"
        </div>
      </div>

      <!-- Ringkasan Nilai Kontrak -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-bottom:14px;">
        <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:10px;">
          <span style="font-size:10.5px; color:var(--text-muted); display:block;">DPP Kontrak</span>
          <strong style="font-size:13.5px; color:var(--text-primary);">${window.formatIDR(deal.dppTotal)}</strong>
        </div>
        <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:10px;">
          <span style="font-size:10.5px; color:#1D4ED8; display:block;">PPN Keluaran (11%)</span>
          <strong style="font-size:13.5px; color:#1D4ED8;">+ ${window.formatIDR(deal.ppnTotal)}</strong>
        </div>
        <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:10px;">
          <span style="font-size:10.5px; color:#B45309; display:block;">Potongan PPh 23 (2%)</span>
          <strong style="font-size:13.5px; color:#B45309;">- ${window.formatIDR(deal.pphTotal)}</strong>
        </div>
        <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:10px;">
          <span style="font-size:10.5px; color:#047857; display:block;">Total Tagihan Gross</span>
          <strong style="font-size:13.5px; color:#047857;">${window.formatIDR(deal.grossTotal)}</strong>
        </div>
      </div>

      <!-- Tabel Rincian Pemecahan Termin dari CRM -->
      <div style="border:1px solid var(--border); border-radius:10px; overflow:hidden;">
        <div style="background:#F8FAFC; padding:10px 14px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:12px; color:var(--text-primary);"><i class="fa-solid fa-list-check" style="color:var(--primary); margin-right:6px;"></i> Rincian Jadwal Termin (TOP) yang Dikirim dari CRM</strong>
          <span class="badge neutral">${deal.termins.length} Termin Pembayaran</span>
        </div>
        <div class="table-wrap">
          <table class="data-table" style="margin:0;">
            <thead>
              <tr>
                <th>Termin & Referensi</th>
                <th style="text-align:right;">DPP</th>
                <th style="text-align:right;">PPN 11%</th>
                <th style="text-align:right;">PPh 23 (2%)</th>
                <th style="text-align:right;">Total Faktur</th>
                <th>Status Awal</th>
              </tr>
            </thead>
            <tbody>
              ${terminRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  window.confirmImportSelectedCrmDeal = function() {
    window.acceptIncomingCrmDeal(activeCrmDealKey);
  };

  window.acceptIncomingCrmDeal = function(dealKey = 'samudera') {
    const deal = CRM_DEALS_PAYLOAD[dealKey];
    if (!deal) return;

    if (deal.imported && document.getElementById(deal.cardId)) {
      window.closeFinanceModal('modalCrmSyncDetail');
      window.switchFinancePage('invoices');
      const existingCard = document.getElementById(deal.cardId);
      if (existingCard) {
        existingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        existingCard.style.boxShadow = '0 0 0 3px #3B82F6';
        setTimeout(() => existingCard.style.boxShadow = '', 1800);
      }
      window.showFinanceToast(`ℹ️ Jadwal termin proyek [${deal.projectName}] sudah aktif di daftar Penagihan AR.`, 'info');
      return;
    }

    deal.imported = true;
    const container = document.getElementById('invoice-view-project');
    if (container && !document.getElementById(deal.cardId)) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-panel invoice-project-card';
      cardEl.id = deal.cardId;
      cardEl.setAttribute('data-project', deal.projectName);
      cardEl.setAttribute('data-client', deal.clientName);
      cardEl.setAttribute('data-due', deal.termins[0]?.due || '2026-10-18');
      cardEl.setAttribute('data-amount', String(deal.grossTotal));
      cardEl.style.border = '2px solid #3B82F6';
      cardEl.style.transition = 'all 0.4s ease';

      const rowsHtml = deal.termins.map(t => {
        const isWaitingMp = t.status === 'MENUNGGU MP';
        const isPaid = t.status === 'LUNAS';
        const statusBadge = isPaid
          ? `<span class="badge success" id="badge-${t.id}">✅ LUNAS</span>`
          : (isWaitingMp
              ? `<span class="badge neutral" id="badge-${t.id}">🗓️ MENUNGGU MP</span>`
              : `<span class="badge warning" id="badge-${t.id}">🟡 MENUNGGU BAYAR</span>`);

        const actionsHtml = isWaitingMp
          ? `<button class="btn btn-xs" id="btnTrigger-${t.id}" onclick="simulateDynamicMpMilestone('${deal.key}', '${t.id}')"><i class="fa-solid fa-wand-magic-sparkles"></i> Simulasi Kirim dari MP</button>
             <button class="btn btn-xs" onclick="openEditTerminModal('${t.id}', '${t.name}', ${t.dpp}, '${t.due}', '${deal.projectName}', '${deal.clientName}')" title="Edit Termin"><i class="fa-solid fa-pen-to-square"></i></button>`
          : `<button class="btn btn-xs ${isPaid ? 'success' : 'primary'}" onclick="window.openPreviewInvoice('${deal.projectName}', '${deal.clientName}', '${t.name}', ${t.gross}, '${t.ref}', ${t.dpp}, ${t.ppn}, ${t.pph}, '${isPaid ? 'Lunas' : 'Menunggu Bayar'}')"><i class="fa-brands fa-whatsapp"></i> ${isPaid ? 'Chat Klien' : 'Kirim WA'}</button>
             <button class="btn btn-xs" onclick="showInvoiceTaxDetail('${t.name} - ${deal.clientName}', ${t.dpp}, ${t.ppn}, ${t.pph}, '${isPaid ? 'Lunas' : 'Menunggu Bayar'}')" title="Rincian Pajak"><i class="fa-solid fa-receipt"></i></button>`;

        return `
          <tr id="termin-row-${t.id}" data-project="${deal.projectName}" data-client="${deal.clientName}" data-due="${t.due}" data-amount="${t.gross}">
            <td>
              <strong style="color:var(--text-primary);"><i class="fa-solid fa-file-invoice text-muted" style="margin-right:6px;"></i><span id="tname-${t.id}">${t.name}</span></strong>
              <div style="font-size:10.5px; color:var(--text-muted);">Jatuh Tempo: <span id="tdue-${t.id}">${t.dueLabel}</span> • Ref: ${t.ref} (${deal.mouNumber})</div>
            </td>
            <td>${window.formatIDR(t.dpp)}</td>
            <td style="color:#1D4ED8; font-weight:600;">+ ${window.formatIDR(t.ppn)}</td>
            <td style="color:#B45309; font-weight:600;">- ${window.formatIDR(t.pph)}</td>
            <td style="font-weight:800; color:var(--text-primary); text-align:right;">
              ${window.formatIDR(t.gross)}
              <div style="font-size:10px; color:#10B981; font-weight:600;">Net: ${window.formatIDR(t.net)}</div>
            </td>
            <td>${statusBadge}</td>
            <td style="text-align:right;">
              <div style="display:flex; justify-content:flex-end; align-items:center; gap:6px;">
                ${actionsHtml}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      cardEl.innerHTML = `
        <div class="card-header" style="background:#EFF6FF; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; border-radius:8px; background:#0284C7; color:#fff; display:grid; place-items:center;">
              <i class="fa-solid fa-file-signature"></i>
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h4 style="font-size:14px; font-weight:800; color:var(--text-primary);">PROYEK: ${deal.projectName.toUpperCase()}</h4>
                <span class="badge success" style="font-size:10px;"><i class="fa-solid fa-bolt"></i> Baru Diimpor dari CRM</span>
              </div>
              <span style="font-size:11.5px; color:var(--text-muted);">
                Total Kontrak: <strong style="color:var(--text-primary);">${window.formatIDR(deal.grossTotal)}</strong> (DPP: ${window.formatIDR(deal.dppTotal)} + PPN 11%: ${window.formatIDR(deal.ppnTotal)} | PPh 23: ${window.formatIDR(deal.pphTotal)}) • Klien: <strong style="color:var(--text-primary);">${deal.clientName}</strong> (PIC: ${deal.picName.split(' (')[0]})
              </span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="tax-tag ppn"><i class="fa-solid fa-percent"></i> PPN 11% Aktif</span>
            <span class="tax-tag pph"><i class="fa-solid fa-shield-halved"></i> PPh 23 (2%)</span>
            <button class="btn btn-xs" onclick="openCrmSimulationModal('${deal.key}')"><i class="fa-solid fa-link" style="color:var(--primary);"></i> Detail Kiriman CRM</button>
          </div>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:27%;">Termin / Kesepakatan CRM & MP</th>
                <th>DPP (Dasar Pajak)</th>
                <th>PPN (11%)</th>
                <th>PPh 23 (2%)</th>
                <th style="text-align:right;">Total Tagihan</th>
                <th>Status & Approval</th>
                <th style="text-align:right;">Aksi, Detail & Chat Klien</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

      container.insertBefore(cardEl, container.firstChild);
      setTimeout(() => {
        cardEl.style.border = '1px solid var(--border)';
      }, 2500);
    }

    // Update CRM Banner on AR Page
    const crmNotice = document.getElementById('crmIncomingNotice');
    if (crmNotice) {
      crmNotice.style.background = '#ECFDF5';
      crmNotice.style.borderColor = '#A7F3D0';
      const badge = document.getElementById('crmIncomingBadge');
      if (badge) {
        badge.className = 'badge success';
        badge.innerHTML = '<i class="fa-solid fa-check-double"></i> Tersinkron ke AR';
      }
      const desc = document.getElementById('crmIncomingDesc');
      if (desc) {
        desc.innerHTML = `Jadwal <strong>${deal.termins.length} Termin</strong> untuk proyek <strong>${deal.projectName}</strong> (${deal.clientName}) senilai <strong>${window.formatIDR(deal.grossTotal)}</strong> telah berhasil diimpor dari CRM ke daftar Penagihan Finance.`;
        desc.style.color = '#065F46';
      }
      const btnQuick = document.getElementById('btnQuickAcceptCrm');
      if (btnQuick) {
        if (dealKey === 'samudera' && !CRM_DEALS_PAYLOAD['mitra'].imported) {
          btnQuick.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Impor Deal Berikutnya (PT Mitra Perkasa)';
          btnQuick.onclick = function() { window.openCrmSimulationModal('mitra'); };
        } else {
          btnQuick.className = 'btn btn-xs success';
          btnQuick.innerHTML = '<i class="fa-solid fa-check"></i> Semua Deal CRM Tersinkron';
        }
      }
    }

    window.closeFinanceModal('modalCrmSyncDetail');
    window.switchFinancePage('invoices');
    window.showFinanceToast(`✅ Deal CRM [${deal.projectName} - ${deal.clientName}] beserta ${deal.termins.length} jadwal termin berhasil diterima Finance!`, 'success');
  };

  // Backward compatibility wrapper for CRM sync
  window.syncTerminsFromCrm = function() {
    window.openCrmSimulationModal('samudera');
  };

  // ==========================================================================
  // 2. SIMULASI & DETAIL PENGIRIMAN INVOICE DARI MANAJEMEN PROYEK (MP)
  // ==========================================================================

  const MP_DELIVERY_SCENARIOS = {
    'INV-2610-002': {
      invoiceNum: 'INV-2610-002',
      mpWebhookId: 'MP-TRIG-2026-102',
      projectName: 'Aplikasi Kasir RS Medika',
      clientName: 'RS Medika Utama',
      terminName: 'Termin 2: UAT Selesai (40%)',
      pmName: 'Andi Setiawan (Senior Project Manager - Forge PM)',
      sentAt: '12 Okt 2026, 10:15 WIB',
      sprintProgress: 'Sprint 4 Completed — 24 / 24 Tasks Done (100%)',
      deliverables: [
        'Modul Kasir Rawat Jalan & Rawat Inap (Selesai 100%)',
        'Integrasi Bridging Klaim BPJS Kesehatan VClaim (Passed UAT)',
        'Cetak Kwitansi & E-Resep Terintegrasi Farmasi (Passed QA)'
      ],
      attachments: [
        { name: 'BAST_UAT_RSMedika_Signed.pdf', size: '1.8 MB', type: 'Dokumen BAST UAT' },
        { name: 'QA_Test_Report_Sprint4_Medika.pdf', size: '940 KB', type: 'Laporan QA Lulus 100%' }
      ],
      pmNotes: 'Seluruh skenario User Acceptance Test (UAT) telah disetujui dan ditandatangani oleh dr. Hendra & Pak Heru (RS Medika Utama). Milestone Termin 2 (40%) dinyatakan tuntas, silakan Finance terbitkan dan kirim invoice ke klien.',
      dpp: 12000000,
      ppn: 1320000,
      pph: 240000,
      gross: 13320000,
      net: 13080000,
      rowId: 'rowTermin2',
      badgeId: 'badgeTermin2',
      approved: false
    },
    'INV-2612-003': {
      invoiceNum: 'INV-2612-003',
      mpWebhookId: 'MP-TRIG-2026-119',
      projectName: 'Aplikasi Kasir RS Medika',
      clientName: 'RS Medika Utama',
      terminName: 'Termin 3: Pelunasan & BAST (30%)',
      pmName: 'Andi Setiawan (Senior Project Manager - Forge PM)',
      sentAt: '12 Okt 2026, 11:05 WIB (Simulasi Real-Time)',
      sprintProgress: 'Sprint 6 Final Go-Live — 18 / 18 Tasks Done (100%)',
      deliverables: [
        'Deployment Production On-Premise Server RS Medika',
        'Pelatihan Operasional 15 Staf Kasir & Admin Keuangan RS',
        'Serah Terima Source Code, Dokumentasi API & BAST Final'
      ],
      attachments: [
        { name: 'BAST_Final_GoLive_RSMedika.pdf', size: '2.4 MB', type: 'BAST Serah Terima Akhir' },
        { name: 'Checklist_Deployment_Production.pdf', size: '780 KB', type: 'Log DevOps & Handover' }
      ],
      pmNotes: 'Proyek Aplikasi Kasir RS Medika telah resmi Go-Live 100% dan berita acara serah terima akhir (BAST) sudah ditandatangani kedua belah pihak. Mohon Finance memproses invoice Pelunasan (Termin 3 - 30%).',
      dpp: 9000000,
      ppn: 990000,
      pph: 180000,
      gross: 9990000,
      net: 9810000,
      rowId: 'rowTermin3',
      badgeId: 'badgeTermin3',
      approved: false
    },
    'INV-2611-004': {
      invoiceNum: 'INV-2611-004',
      mpWebhookId: 'MP-TRIG-2026-125',
      projectName: 'Web Company Profile X',
      clientName: 'PT Alpha Global',
      terminName: 'Termin 2: Pelunasan & Go-Live (50%)',
      pmName: 'Bagas Prakoso (Tech Lead / PM - Forge PM)',
      sentAt: '12 Okt 2026, 11:10 WIB (Simulasi Real-Time)',
      sprintProgress: 'Sprint 2 Final Release — 15 / 15 Tasks Done (100%)',
      deliverables: [
        'Halaman Landing, Investor Relations & Multi-Language (ID/EN)',
        'Optimasi Core Web Vitals & Lighthouse Score 99/100',
        'Pointing Domain Resmi alphaglobal.id & SSL Enterprise'
      ],
      attachments: [
        { name: 'BAST_GoLive_AlphaGlobal.pdf', size: '1.5 MB', type: 'BAST Go-Live Website' },
        { name: 'Audit_SEO_Lighthouse_99.pdf', size: '620 KB', type: 'Bukti Performa Teknis' }
      ],
      pmNotes: 'Portal korporat PT Alpha Global sudah live sepenuhnya dan diterima oleh Ibu Sari Wijaya (CCO). Silakan Finance menerbitkan invoice Termin 2 (Pelunasan 50%).',
      dpp: 7500000,
      ppn: 825000,
      pph: 150000,
      gross: 8325000,
      net: 8175000,
      rowId: 'termin-row-alpha-2',
      badgeId: 'badgeAlpha2',
      approved: false
    }
  };

  let activeMpScenarioKey = 'INV-2610-002';

  // Triggered by Hero Button "Simulasi Kiriman Invoice MP"
  window.simulatePmTaskDoneTrigger = function() {
    window.openMpDeliveryDetailModal(activeMpScenarioKey || 'INV-2610-002');
  };

  window.openMpDeliveryDetailModal = function(invoiceKey = 'INV-2610-002') {
    window.selectMpDeliveryScenario(invoiceKey);
    window.openFinanceModal('modalMpInvoiceDetail');
  };

  window.selectMpDeliveryScenario = function(invoiceKey) {
    activeMpScenarioKey = invoiceKey;
    const scen = MP_DELIVERY_SCENARIOS[invoiceKey] || MP_DELIVERY_SCENARIOS['INV-2610-002'];

    ['INV-2610-002', 'INV-2612-003', 'INV-2611-004'].forEach(k => {
      const btn = document.getElementById('mp-scen-btn-' + k);
      if (btn) btn.classList.toggle('primary', k === invoiceKey);
    });

    const box = document.getElementById('mp-delivery-detail-box');
    const btnApp = document.getElementById('btnMpModalApprove');
    if (btnApp) {
      btnApp.innerHTML = scen.approved
        ? `<i class="fa-solid fa-check-double"></i> Sudah Diapprove (${scen.invoiceNum})`
        : `<i class="fa-solid fa-check"></i> Approve & Terbitkan (${scen.invoiceNum})`;
    }

    if (!box) return;

    const delivHtml = scen.deliverables.map(d => `
      <li style="display:flex; align-items:center; gap:8px; margin-bottom:5px; font-size:12px; color:var(--text-primary);">
        <i class="fa-solid fa-circle-check" style="color:#10B981;"></i> <span>${d}</span>
      </li>
    `).join('');

    const attachHtml = scen.attachments.map(a => `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:8px 12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:6px; background:#FEE2E2; color:#DC2626; display:grid; place-items:center;">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <div>
            <strong style="font-size:12px; color:var(--text-primary); display:block;">${a.name}</strong>
            <span style="font-size:10.5px; color:var(--text-muted);">${a.type} • ${a.size}</span>
          </div>
        </div>
        <button type="button" class="btn btn-xs" onclick="showFinanceToast('Membuka dokumen bukti MP: ${a.name}', 'info')"><i class="fa-solid fa-download"></i> Unduh</button>
      </div>
    `).join('');

    box.innerHTML = `
      <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:10px; padding:14px 16px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:10px; border-bottom:1px dashed #FCD34D; padding-bottom:10px;">
          <div>
            <span style="font-size:10.5px; font-weight:700; text-transform:uppercase; color:#B45309; letter-spacing:0.04em;">
              <i class="fa-solid fa-code-branch"></i> Transmisi Penyelesaian Milestone dari Forge PM (${scen.mpWebhookId})
            </span>
            <h4 style="font-size:15px; font-weight:800; color:#78350F; margin-top:2px;">${scen.projectName} — ${scen.terminName}</h4>
          </div>
          <span class="badge ${scen.approved ? 'success' : 'amber-draft'}">
            ${scen.approved ? '✅ Disetujui Finance' : '🟡 Draft Menunggu Approval Finance'}
          </span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; font-size:12px;">
          <div>
            <div style="color:#92400E; font-size:11px;">Dikirim Oleh (Project Manager):</div>
            <strong style="color:var(--text-primary);"><i class="fa-solid fa-user-check" style="color:#D97706; margin-right:4px;"></i> ${scen.pmName}</strong>
          </div>
          <div>
            <div style="color:#92400E; font-size:11px;">Waktu Pengiriman MP:</div>
            <strong style="color:var(--text-primary);"><i class="fa-regular fa-clock" style="color:#D97706; margin-right:4px;"></i> ${scen.sentAt}</strong>
          </div>
          <div>
            <div style="color:#92400E; font-size:11px;">Status Sprint & Task MP:</div>
            <strong style="color:#059669;"><i class="fa-solid fa-bars-progress" style="margin-right:4px;"></i> ${scen.sprintProgress}</strong>
          </div>
          <div>
            <div style="color:#92400E; font-size:11px;">Nomor Draft Invoice Otomatis:</div>
            <strong style="color:var(--primary); font-family:var(--font-mono);">${scen.invoiceNum} (Klien: ${scen.clientName})</strong>
          </div>
        </div>

        <div style="margin-top:10px; padding:8px 12px; background:#fff; border:1px solid #FDE68A; border-radius:8px; font-size:11.5px; color:#78350F;">
          <strong><i class="fa-solid fa-comment-dots"></i> Catatan Pengantar PM ke Finance:</strong> "${scen.pmNotes}"
        </div>
      </div>

      <!-- Checklist Deliverables & Bukti Lampiran BAST -->
      <div style="display:grid; grid-template-columns: 1.1fr 1fr; gap:14px; margin-bottom:14px;">
        <div style="border:1px solid var(--border); border-radius:10px; padding:12px 14px; background:#fff;">
          <strong style="font-size:12px; color:var(--text-primary); display:block; margin-bottom:8px;">
            <i class="fa-solid fa-list-check" style="color:#10B981; margin-right:5px;"></i> Checklist Deliverable Selesai di MP:
          </strong>
          <ul style="list-style:none; padding:0; margin:0;">
            ${delivHtml}
          </ul>
        </div>
        <div style="border:1px solid var(--border); border-radius:10px; padding:12px 14px; background:#fff;">
          <strong style="font-size:12px; color:var(--text-primary); display:block; margin-bottom:8px;">
            <i class="fa-solid fa-paperclip" style="color:var(--primary); margin-right:5px;"></i> Dokumen Bukti BAST & UAT dari MP:
          </strong>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${attachHtml}
          </div>
        </div>
      </div>

      <!-- Rincian Tagihan Invoice yang Akan Diterbitkan -->
      <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:10px; padding:12px 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:12px; color:var(--text-primary);"><i class="fa-solid fa-calculator" style="color:var(--primary); margin-right:6px;"></i> Kalkulasi Tagihan Faktur (${scen.invoiceNum})</strong>
          <span class="badge info">Sesuai Jadwal MoU CRM</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; font-size:12px;">
          <div>
            <span style="color:var(--text-muted); font-size:11px; display:block;">DPP Termin:</span>
            <strong>${window.formatIDR(scen.dpp)}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px; display:block;">PPN 11%:</span>
            <strong style="color:#1D4ED8;">+ ${window.formatIDR(scen.ppn)}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px; display:block;">Potongan PPh 23 (2%):</span>
            <strong style="color:#B45309;">- ${window.formatIDR(scen.pph)}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px; display:block;">Total Tagihan (Net: ${window.formatIDR(scen.net)}):</span>
            <strong style="color:#059669; font-size:13.5px;">${window.formatIDR(scen.gross)}</strong>
          </div>
        </div>
      </div>
    `;
  };

  window.executeMpScenarioApproval = function(openWaAfter = false) {
    const scen = MP_DELIVERY_SCENARIOS[activeMpScenarioKey];
    if (!scen) return;

    scen.approved = true;

    if (activeMpScenarioKey === 'INV-2610-002') {
      window.approveSpecificProjectInvoice(scen.invoiceNum, scen.projectName, scen.clientName);
    } else if (activeMpScenarioKey === 'INV-2612-003') {
      window.approveTermin3Draft(scen.projectName, scen.clientName);
    } else {
      // Generic scenario approval (e.g. INV-2611-004 Alpha Global Termin 2)
      const row = document.getElementById(scen.rowId);
      const badge = document.getElementById(scen.badgeId);
      const btn = document.getElementById('btnTriggerAlpha2');
      if (row) row.style.opacity = '1';
      if (badge) {
        badge.className = 'badge warning';
        badge.innerHTML = '🟡 MENUNGGU BAYAR';
      }
      if (btn) {
        btn.className = 'btn btn-xs primary';
        btn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Kirim WA';
        btn.onclick = function() {
          window.openPreviewInvoice(scen.projectName, scen.clientName, scen.terminName, scen.gross, scen.invoiceNum, scen.dpp, scen.ppn, scen.pph, 'Menunggu Bayar');
        };
      }
      window.showFinanceToast(`✅ Draft Invoice ${scen.invoiceNum} dari MP untuk [${scen.projectName}] resmi disetujui & diterbitkan!`, 'success');
    }

    window.closeFinanceModal('modalMpInvoiceDetail');

    if (openWaAfter) {
      setTimeout(() => {
        window.openPreviewInvoice(scen.projectName, scen.clientName, scen.terminName, scen.gross, scen.invoiceNum, scen.dpp, scen.ppn, scen.pph, 'Menunggu Bayar');
      }, 250);
    }
  };

  // Simulate MP Milestone Done for dynamically imported CRM deals
  window.simulateDynamicMpMilestone = function(dealKey, terminId) {
    const deal = CRM_DEALS_PAYLOAD[dealKey];
    if (!deal) return;
    const t = deal.termins.find(item => item.id === terminId);
    if (!t) return;

    const badge = document.getElementById('badge-' + terminId);
    const btn = document.getElementById('btnTrigger-' + terminId);
    const row = document.getElementById('termin-row-' + terminId);

    if (row) row.style.background = '#FFFBEB';
    if (badge) {
      badge.className = 'badge amber-draft';
      badge.innerHTML = '🟡 DRAFT MP (Verifikasi)';
    }
    if (btn) {
      btn.className = 'btn btn-xs success';
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Approve Invoice MP';
      btn.onclick = function() {
        if (row) row.style.background = '';
        if (badge) {
          badge.className = 'badge warning';
          badge.innerHTML = '🟡 MENUNGGU BAYAR';
        }
        btn.className = 'btn btn-xs primary';
        btn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Kirim WA';
        btn.onclick = function() {
          window.openPreviewInvoice(deal.projectName, deal.clientName, t.name, t.gross, t.ref, t.dpp, t.ppn, t.pph, 'Menunggu Bayar');
        };
        window.showFinanceToast(`✅ Invoice ${t.ref} (${deal.projectName}) telah diapprove Finance & siap dikirim via WhatsApp!`, 'success');
      };
    }

    window.showFinanceToast(`🚀 MP mengirim penyelesaian milestone '${t.name}' (${deal.projectName}). Silakan klik Approve!`, 'info');
  };

  window.approveSpecificProjectInvoice = function(invoiceNum, projectName, clientName) {
    const badge = document.getElementById('badgeTermin2');
    const btnApprove = document.getElementById('btnApproveTermin2');
    const notice = document.getElementById('pmDraftNotice');
    const row = document.getElementById('rowTermin2');

    if (MP_DELIVERY_SCENARIOS['INV-2610-002']) {
      MP_DELIVERY_SCENARIOS['INV-2610-002'].approved = true;
    }

    if (badge) {
      badge.className = 'badge warning';
      badge.innerHTML = '<i class="fa-solid fa-clock"></i> 🟡 MENUNGGU BAYAR';
    }

    if (row) {
      row.style.background = '';
    }

    if (btnApprove) {
      btnApprove.className = 'btn btn-xs primary';
      btnApprove.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Kirim WA';
      btnApprove.onclick = function() {
        window.openPreviewInvoice(projectName, clientName, 'Termin 2: UAT Selesai (40%)', 13320000, invoiceNum, 12000000, 1320000, 240000, 'Menunggu Bayar');
      };
    }

    if (notice) {
      notice.style.background = '#ECFDF5';
      notice.style.borderColor = '#A7F3D0';
      const titleEl = document.getElementById('pmDraftNoticeTitle');
      const badgeEl = document.getElementById('pmDraftNoticeBadge');
      const desc = document.getElementById('pmDraftNoticeDesc');
      const actions = document.getElementById('pmDraftNoticeActions');

      if (titleEl) {
        titleEl.textContent = `Invoice ${invoiceNum} Resmi Disetujui & Terbit`;
        titleEl.style.color = '#065F46';
      }
      if (badgeEl) {
        badgeEl.className = 'badge success';
        badgeEl.textContent = 'Terbit & Aktif';
      }
      if (desc) {
        desc.innerHTML = `Invoice <strong>${invoiceNum}</strong> untuk proyek <strong>${projectName}</strong> (${clientName}) telah diapprove Finance. Siap dikirim ke WhatsApp klien.`;
        desc.style.color = '#047857';
      }
      if (actions) {
        actions.innerHTML = `
          <button class="btn btn-xs" onclick="openMpDeliveryDetailModal('INV-2610-002')"><i class="fa-solid fa-eye"></i> Detail MP</button>
          <button class="btn btn-xs success" onclick="window.openPreviewInvoice('${projectName}', '${clientName}', 'Termin 2: UAT Selesai (40%)', 13320000, '${invoiceNum}', 12000000, 1320000, 240000, 'Menunggu Bayar')"><i class="fa-brands fa-whatsapp"></i> Kirim Chat WA ke Klien</button>
        `;
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
      notice.style.background = '#FFFBEB';
      notice.style.borderColor = '#FDE68A';
      const titleEl = document.getElementById('pmDraftNoticeTitle');
      const badgeEl = document.getElementById('pmDraftNoticeBadge');
      const desc = document.getElementById('pmDraftNoticeDesc');
      const actions = document.getElementById('pmDraftNoticeActions');

      if (titleEl) {
        titleEl.textContent = `Kiriman Invoice Baru dari MP: ${projectName} (INV-2612-003)`;
        titleEl.style.color = '#92400E';
      }
      if (badgeEl) {
        badgeEl.className = 'badge amber-draft';
        badgeEl.textContent = 'Draft MP Masuk';
      }
      if (desc) {
        desc.innerHTML = `PM Andi Setiawan telah mengirim bukti penyelesaian milestone <strong>"Termin 3: Pelunasan & BAST (30%)"</strong> beserta lampiran <strong>BAST_Final_GoLive_RSMedika.pdf</strong>.`;
        desc.style.color = '#B45309';
      }
      if (actions) {
        actions.innerHTML = `
          <button class="btn btn-xs" style="border-color:#FCD34D; color:#92400E;" onclick="openMpDeliveryDetailModal('INV-2612-003')"><i class="fa-solid fa-magnifying-glass-chart"></i> Detail Pengiriman MP</button>
          <button class="btn btn-xs success" onclick="approveTermin3Draft('${projectName}', '${clientName}')"><i class="fa-solid fa-check"></i> Approve Termin 3</button>
        `;
      }
    }

    const row3 = document.getElementById('rowTermin3');
    if (row3) {
      row3.style.opacity = '1';
      row3.style.background = '#FFFBEB';
    }

    const badge3 = document.getElementById('badgeTermin3');
    if (badge3) {
      badge3.className = 'badge amber-draft';
      badge3.innerHTML = '🟡 DRAFT MP (Perlu Approval)';
    }

    const btnTrigger3 = document.getElementById('btnTriggerTermin3');
    if (btnTrigger3) {
      btnTrigger3.className = 'btn btn-xs success';
      btnTrigger3.innerHTML = `<i class="fa-solid fa-check"></i> Approve Termin 3`;
      btnTrigger3.onclick = function() {
        window.approveTermin3Draft(projectName, clientName);
      };
    }

    window.openMpDeliveryDetailModal('INV-2612-003');
    window.showFinanceToast(`🚀 Milestone proyek '${projectName}' (Termin 3) dikirim oleh MP! Silakan tinjau detail pengirimannya.`, 'info');
  };

  // Action: Approve Termin 3 Draft khusus proyek
  window.approveTermin3Draft = function(projectName = 'Aplikasi Kasir RS Medika', clientName = 'RS Medika Utama') {
    if (MP_DELIVERY_SCENARIOS['INV-2612-003']) {
      MP_DELIVERY_SCENARIOS['INV-2612-003'].approved = true;
    }

    const row3 = document.getElementById('rowTermin3');
    if (row3) {
      row3.style.opacity = '1';
      row3.style.background = '';
    }

    const notice = document.getElementById('pmDraftNotice');
    if (notice) {
      notice.style.background = '#ECFDF5';
      notice.style.borderColor = '#A7F3D0';
      const titleEl = document.getElementById('pmDraftNoticeTitle');
      const badgeEl = document.getElementById('pmDraftNoticeBadge');
      const desc = document.getElementById('pmDraftNoticeDesc');
      const actions = document.getElementById('pmDraftNoticeActions');

      if (titleEl) {
        titleEl.textContent = `Invoice INV-2612-003 [${projectName}] Resmi Disetujui`;
        titleEl.style.color = '#065F46';
      }
      if (badgeEl) {
        badgeEl.className = 'badge success';
        badgeEl.textContent = 'Terbit & Aktif';
      }
      if (desc) {
        desc.innerHTML = `Persetujuan Finance selesai untuk klien <strong>${clientName}</strong>. Invoice Pelunasan (Termin 3) siap dikirim via WhatsApp.`;
        desc.style.color = '#047857';
      }
      if (actions) {
        actions.innerHTML = `
          <button class="btn btn-xs" onclick="openMpDeliveryDetailModal('INV-2612-003')"><i class="fa-solid fa-eye"></i> Detail MP</button>
          <button class="btn btn-xs success" onclick="window.openPreviewInvoice('${projectName}', '${clientName}', 'Termin 3: Pelunasan & BAST (30%)', 9990000, 'INV-2612-003', 9000000, 990000, 180000, 'Menunggu Bayar')"><i class="fa-brands fa-whatsapp"></i> Kirim Chat WA ke Klien</button>
        `;
      }
    }

    const badge3 = document.getElementById('badgeTermin3');
    if (badge3) {
      badge3.className = 'badge warning';
      badge3.innerHTML = '🟡 MENUNGGU BAYAR';
    }

    const btnTrigger3 = document.getElementById('btnTriggerTermin3');
    if (btnTrigger3) {
      btnTrigger3.className = 'btn btn-xs primary';
      btnTrigger3.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Kirim WA`;
      btnTrigger3.onclick = function() {
        window.openPreviewInvoice(projectName, clientName, 'Termin 3: Pelunasan & BAST (30%)', 9990000, 'INV-2612-003', 9000000, 990000, 180000, 'Menunggu Bayar');
      };
    }

    window.showFinanceToast(`✅ Invoice Termin 3 untuk proyek [${projectName}] berhasil diapprove per-klien!`, 'success');
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
    window.financePayrollSync = { ...HR_PAYROLL_PAYLOAD, last_synced_at: new Date().toISOString(), sync_status: 'success' };
    window.showFinanceToast('🔄 Menyinkronkan data master pegawai & grade jabatan dari Modul HR Astacode...', 'info');
    setTimeout(() => {
      window.showFinanceToast('✅ 6 Karyawan Tetap & Struktur Gaji Pokok resmi tersinkronisasi 100% dengan HR!', 'success');
    }, 800);
  };
  function setHrPayrollStatus(status) {
    const payload = { ...HR_PAYROLL_PAYLOAD, status, last_synced_at: new Date().toISOString(), sync_status: 'success' };
    localStorage.setItem('asta.hr.payroll.sync', JSON.stringify(payload));
    window.financePayrollSync = payload;
    window.showFinanceToast(`Payroll HR ${status}. Status akan terbaca kembali oleh HR saat modul dibuka ulang.`, 'success');
  }
  window.reviewHrPayroll = () => setHrPayrollStatus('REVIEW');
  window.approveHrPayroll = () => setHrPayrollStatus('APPROVED');
  window.payHrPayroll = () => setHrPayrollStatus('PAID');

  // Submit Payroll Form
  window.submitPayrollHrForm = function() {
    window.closeFinanceModal('modalCreatePayroll');
    window.showFinanceToast('Master payroll dikelola HR. Finance hanya melakukan review, approval, pembayaran, dan jurnal.', 'warning');
    return;
  };

  // ========================================================================
  // 6. PAYROLL (PENGGAJIAN KARYAWAN) STATE-DRIVEN SYSTEM & CRUD
  // ========================================================================
    // ==========================================================================
  // 6. PAYROLL (PENGGAJIAN KARYAWAN) STATE-DRIVEN SYSTEM & CRUD
  // ==========================================================================

  let activeSlipPayrollId = null;

  const payrollList = [
    {
      id: 'EMP-2026-001',
      name: 'Bagas Prakoso',
      role: 'Tech Lead',
      grade: 'Grade Tech Lead (L4)',
      department: 'Engineering',
      avatarBg: '#EEF2FF',
      avatarColor: '#4F46E5',
      baseSalary: 18000000,
      allowance: 3000000,
      bpjsAmount: 350000,
      pph21Amount: 450000,
      attendanceRate: '100% Hadir',
      bankTarget: 'MANDIRI',
      accountNumber: '132-00-5541-892',
      accountHolder: 'Bagas Prakoso',
      hrStatus: 'APPROVED HR',
      hrApprover: 'Rina Anggraini (HR Manager)',
      paymentStatus: 'Siap Transfer',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Gaji Pokok & Tunjangan Tech Lead - Periode Okt 2026'
    },
    {
      id: 'EMP-2026-002',
      name: 'Rina Anggraini',
      role: 'HR Manager',
      grade: 'Grade Manager (L4)',
      department: 'People Ops',
      avatarBg: '#FDF2F8',
      avatarColor: '#DB2777',
      baseSalary: 14000000,
      allowance: 2500000,
      bpjsAmount: 300000,
      pph21Amount: 350000,
      attendanceRate: '100% Hadir',
      bankTarget: 'MANDIRI',
      accountNumber: '132-00-8812-304',
      accountHolder: 'Rina Anggraini',
      hrStatus: 'APPROVED HR',
      hrApprover: 'Direktur Utama',
      paymentStatus: 'Siap Transfer',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Gaji Pokok & Tunjangan HR Manager - Periode Okt 2026'
    },
    {
      id: 'EMP-2026-003',
      name: 'Fajar Nugroho',
      role: 'Backend Developer',
      grade: 'Senior Engineer (L3)',
      department: 'Engineering',
      avatarBg: '#EFF6FF',
      avatarColor: '#1D4ED8',
      baseSalary: 12000000,
      allowance: 1500000,
      bpjsAmount: 250000,
      pph21Amount: 280000,
      attendanceRate: '98% Hadir',
      bankTarget: 'BCA',
      accountNumber: '5410-992-114',
      accountHolder: 'Fajar Nugroho',
      hrStatus: 'APPROVED HR',
      hrApprover: 'Rina Anggraini (HR Manager)',
      paymentStatus: 'Siap Transfer',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Gaji Pokok & Tunjangan Backend Dev - Periode Okt 2026'
    },
    {
      id: 'EMP-2026-004',
      name: 'Dewi Lestari',
      role: 'Frontend Developer',
      grade: 'Senior Engineer (L3)',
      department: 'Engineering',
      avatarBg: '#ECFDF5',
      avatarColor: '#059669',
      baseSalary: 11000000,
      allowance: 1500000,
      bpjsAmount: 230000,
      pph21Amount: 250000,
      attendanceRate: '100% Hadir',
      bankTarget: 'MANDIRI',
      accountNumber: '132-00-7719-021',
      accountHolder: 'Dewi Lestari',
      hrStatus: 'APPROVED HR',
      hrApprover: 'Rina Anggraini (HR Manager)',
      paymentStatus: 'Siap Transfer',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Gaji Pokok & Tunjangan Frontend Dev - Periode Okt 2026'
    },
    {
      id: 'EMP-2026-005',
      name: 'Citra Maharani',
      role: 'UI/UX Designer',
      grade: 'Mid Specialist (L2)',
      department: 'Design',
      avatarBg: '#F5F3FF',
      avatarColor: '#8B5CF6',
      baseSalary: 10500000,
      allowance: 1200000,
      bpjsAmount: 220000,
      pph21Amount: 230000,
      attendanceRate: '96% Hadir',
      bankTarget: 'BNI',
      accountNumber: '0812-4491-03',
      accountHolder: 'Citra Maharani',
      hrStatus: 'MENUNGGU HR',
      hrApprover: 'Menunggu Review HR',
      paymentStatus: 'Menunggu HR',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Verifikasi presensi & cuti tahunan Oktober'
    },
    {
      id: 'EMP-2026-006',
      name: 'Galih Pratama',
      role: 'QA Engineer',
      grade: 'Mid Specialist (L2)',
      department: 'QA',
      avatarBg: '#FEF3C7',
      avatarColor: '#D97706',
      baseSalary: 9500000,
      allowance: 1000000,
      bpjsAmount: 200000,
      pph21Amount: 200000,
      attendanceRate: '95% Hadir',
      bankTarget: 'MANDIRI',
      accountNumber: '132-00-3341-998',
      accountHolder: 'Galih Pratama',
      hrStatus: 'MENUNGGU HR',
      hrApprover: 'Menunggu Review HR',
      paymentStatus: 'Menunggu HR',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Verifikasi jam lembur sprint deployment'
    }
  ];

  window.renderPayrollTable = function() {
    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) return;

    let html = '';
    let totalThp = 0;
    let pendingHrNominal = 0;
    let readyTransferNominal = 0;
    let paidNominal = 0;

    payrollList.forEach((item, idx) => {
      const gross = item.baseSalary + item.allowance;
      const totalPot = item.bpjsAmount + item.pph21Amount;
      const net = gross - totalPot;
      const isPaid = item.paymentStatus === 'LUNAS' || item.paidAt !== null;
      const isApproved = item.hrStatus === 'APPROVED HR';

      totalThp += net;
      if (isPaid) {
        paidNominal += net;
      } else if (isApproved) {
        readyTransferNominal += net;
      } else {
        pendingHrNominal += net;
      }

      const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('');
      const avatarBg = item.avatarBg || '#EEF2FF';
      const avatarColor = item.avatarColor || '#4F46E5';

      let deptBadge = 'info';
      if (item.department === 'People Ops') deptBadge = 'purple';
      else if (item.department === 'Design') deptBadge = 'purple';
      else if (item.department === 'QA') deptBadge = 'warning';
      else if (item.department === 'Finance & Ops') deptBadge = 'success';

      html += `
        <tr data-id="${item.id}" data-hr-status="${item.hrStatus}">
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:34px; height:34px; border-radius:50%; background:${avatarBg}; color:${avatarColor}; font-weight:800; font-size:12px; display:grid; place-items:center; flex-shrink:0;">
                ${initials}
              </div>
              <div>
                <strong style="color:var(--text-primary); display:block; font-size:13px;">${item.name}</strong>
                <span class="tax-tag ppn" style="font-size:10px; font-weight:600;"><i class="fa-solid fa-id-badge"></i> ${item.id} • ${item.role}</span>
              </div>
            </div>
          </td>
          <td><span class="badge ${deptBadge}">${item.department}</span></td>
          <td style="text-align:right;">
            <div style="font-weight:700; color:var(--text-primary); font-size:12.5px;">${window.formatIDR(item.baseSalary)}</div>
            <div style="font-size:10.5px; color:#4F46E5;">+ ${window.formatIDR(item.allowance)} (Tunj)</div>
          </td>
          <td style="text-align:right;">
            <div style="font-weight:600; color:#EF4444; font-size:12px;">- ${window.formatIDR(totalPot)}</div>
            <div style="font-size:10px; color:var(--text-muted);">BPJS & PPh 21</div>
          </td>
          <td style="text-align:right;">
            <div style="font-weight:800; color:#10B981; font-size:13.5px;">${window.formatIDR(net)}</div>
            <div style="font-size:10px; color:var(--text-muted);">${item.attendanceRate || '100% Hadir'}</div>
          </td>
          <td style="text-align:center;">
            ${isPaid ? `
              <span class="badge success"><i class="fa-solid fa-circle-check"></i> LUNAS</span>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${item.paidFromBank || 'Bank Mandiri'}</div>
            ` : isApproved ? `
              <span class="badge info"><i class="fa-solid fa-check-double"></i> Disetujui HR</span>
              <div style="font-size:10px; color:#10B981; font-weight:700; margin-top:2px;">Siap Transfer</div>
            ` : `
              <span class="badge warning"><i class="fa-solid fa-hourglass-half"></i> Menunggu HR</span>
              <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Review Absensi</div>
            `}
          </td>
          <td>
            <div style="font-size:12px; font-weight:700; color:var(--text-primary);">
              <i class="fa-solid fa-building-columns" style="color:#4F46E5; margin-right:4px;"></i> ${item.bankTarget}
            </div>
            <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);">${item.accountNumber}</div>
            <div style="font-size:10.5px; color:var(--text-muted);">a/n ${item.accountHolder}</div>
          </td>
          <td style="text-align:right;">
            <div style="display:flex; gap:4px; justify-content:flex-end; align-items:center;">
              ${isPaid ? `
                <button class="btn btn-xs success" title="Bukti Transfer Bank" onclick="window.showPayrollPaidReceipt('${item.id}')">
                  <i class="fa-solid fa-receipt"></i> Bukti
                </button>
                <button class="btn btn-xs" title="Lihat Slip Gaji" onclick="window.showSlipGajiModal('${item.id}')">
                  <i class="fa-solid fa-file-invoice-dollar"></i> Slip
                </button>
              ` : isApproved ? `
                <button class="btn btn-xs primary" title="Transfer Gaji via Bank Mandiri" onclick="window.cairkanGajiKaryawan('${item.id}')">
                  <i class="fa-solid fa-money-bill-transfer"></i> Transfer
                </button>
                <button class="btn btn-xs" title="Lihat Slip Gaji" onclick="window.showSlipGajiModal('${item.id}')">
                  <i class="fa-solid fa-file-invoice-dollar"></i> Slip
                </button>
                <button class="btn btn-xs" title="Edit Data" onclick="window.openEditPayrollModal('${item.id}')">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-xs danger" title="Hapus Data" onclick="window.deletePayroll('${item.id}')">
                  <i class="fa-solid fa-trash"></i>
                </button>
              ` : `
                <button class="btn btn-xs warning" title="Simulasi Approve HR" onclick="window.simulateHrApprovePayroll('${item.id}')">
                  <i class="fa-solid fa-check"></i> Approve HR
                </button>
                <button class="btn btn-xs" title="Lihat Slip Gaji" onclick="window.showSlipGajiModal('${item.id}')">
                  <i class="fa-solid fa-file-invoice-dollar"></i> Slip
                </button>
                <button class="btn btn-xs" title="Edit Data" onclick="window.openEditPayrollModal('${item.id}')">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-xs danger" title="Hapus Data" onclick="window.deletePayroll('${item.id}')">
                  <i class="fa-solid fa-trash"></i>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Update KPI Cards
    const kpiTotal = document.getElementById('payroll-kpi-total');
    const kpiCount = document.getElementById('payroll-kpi-count');
    const kpiPending = document.getElementById('payroll-kpi-pending-hr');
    const kpiReady = document.getElementById('payroll-kpi-ready-transfer');
    const kpiPaid = document.getElementById('payroll-kpi-paid');

    if (kpiTotal) kpiTotal.textContent = window.formatIDR(totalThp);
    if (kpiCount) kpiCount.textContent = `Oktober 2026 • ${payrollList.length} Karyawan Tetap`;
    if (kpiPending) kpiPending.textContent = window.formatIDR(pendingHrNominal);
    if (kpiReady) kpiReady.textContent = window.formatIDR(readyTransferNominal);
    if (kpiPaid) kpiPaid.textContent = window.formatIDR(paidNominal);

    // Setup table pagination
    window.setupTablePagination('tablePayroll', 5);
  };

  window.filterPayrollTable = function() {
    const statusVal = document.getElementById('filterPayrollStatus')?.value || 'all';
    const query = (document.getElementById('searchPayrollInput')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#payrollTableBody tr');

    rows.forEach(row => {
      const rowStatus = row.getAttribute('data-hr-status') || '';
      const text = row.textContent.toLowerCase();
      const isLunas = text.includes('lunas');

      let matchesStatus = true;
      if (statusVal === 'APPROVED HR') {
        matchesStatus = rowStatus === 'APPROVED HR' && !isLunas;
      } else if (statusVal === 'MENUNGGU HR') {
        matchesStatus = rowStatus === 'MENUNGGU HR';
      } else if (statusVal === 'LUNAS') {
        matchesStatus = isLunas;
      }

      const matchesQuery = !query || text.includes(query);
      if (matchesStatus && matchesQuery) {
        row.style.display = '';
        row.removeAttribute('data-filtered-out');
      } else {
        row.style.display = 'none';
        row.setAttribute('data-filtered-out', 'true');
      }
    });

    window.setupTablePagination('tablePayroll', 5);
  };

  window.syncPayrollFromHrModule = function() {
    window.showFinanceToast('🔄 Menyinkronkan data master pegawai & grade jabatan dari Modul HR Astacode...', 'info');
    setTimeout(() => {
      window.renderPayrollTable();
      window.showFinanceToast(`✅ ${payrollList.length} Karyawan Tetap & Struktur Gaji Pokok resmi tersinkronisasi 100% dengan Modul HR!`, 'success');
    }, 600);
  };

  window.submitPayrollHrForm = function(e) {
    if (e) e.preventDefault();
    window.closeFinanceModal('modalCreatePayroll');
    window.showFinanceToast('Master payroll dikelola HR. Finance hanya melakukan review, approval, pembayaran, dan jurnal.', 'warning');
    return;
    const nip = document.getElementById('pay-nip')?.value || `EMP-2026-${String(payrollList.length + 1).padStart(3, '0')}`;
    const name = document.getElementById('pay-name')?.value;
    const role = document.getElementById('pay-jabatan')?.value;
    const dept = document.getElementById('pay-divisi')?.value || 'Engineering';
    const baseSalary = parseFloat(document.getElementById('pay-gaji')?.value) || 0;
    const allowance = parseFloat(document.getElementById('pay-tunj')?.value) || 0;
    const bpjsAmount = parseFloat(document.getElementById('pay-bpjs')?.value) || 0;
    const pph21Amount = parseFloat(document.getElementById('pay-pph')?.value) || 0;
    const bankTarget = document.getElementById('pay-bank')?.value || 'MANDIRI';
    const accountNumber = document.getElementById('pay-acc-num')?.value || '-';
    const accountHolder = document.getElementById('pay-acc-holder')?.value || name;
    const hrStatus = document.getElementById('pay-hr-status')?.value || 'APPROVED HR';
    const notes = document.getElementById('pay-notes')?.value || 'Data payroll baru';

    const newPayroll = {
      id: nip,
      name,
      role,
      grade: `Grade ${role}`,
      department: dept,
      avatarBg: '#EEF2FF',
      avatarColor: '#4F46E5',
      baseSalary,
      allowance,
      bpjsAmount,
      pph21Amount,
      attendanceRate: '100% Hadir',
      bankTarget,
      accountNumber,
      accountHolder,
      hrStatus,
      hrApprover: hrStatus === 'APPROVED HR' ? 'Rina Anggraini (HR Manager)' : 'Menunggu Review HR',
      paymentStatus: hrStatus === 'APPROVED HR' ? 'Siap Transfer' : 'Menunggu HR',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes
    };

    payrollList.unshift(newPayroll);
    window.closeFinanceModal('modalCreatePayroll');
    window.renderPayrollTable();
    window.showFinanceToast(`✅ Data payroll ${name} (${nip}) senilai THP ${window.formatIDR(baseSalary + allowance - bpjsAmount - pph21Amount)} berhasil ditambahkan!`, 'success');
  };

  window.openEditPayrollModal = function(id) {
    const item = payrollList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('pay-edit-id').value = item.id;
    document.getElementById('pay-edit-nip').value = item.id;
    document.getElementById('pay-edit-name').value = item.name;
    document.getElementById('pay-edit-role').value = item.role;
    document.getElementById('pay-edit-dept').value = item.department;
    document.getElementById('pay-edit-base').value = item.baseSalary;
    document.getElementById('pay-edit-allowance').value = item.allowance;
    document.getElementById('pay-edit-bpjs').value = item.bpjsAmount;
    document.getElementById('pay-edit-pph').value = item.pph21Amount;
    document.getElementById('pay-edit-bank').value = item.bankTarget;
    document.getElementById('pay-edit-acc-num').value = item.accountNumber;
    document.getElementById('pay-edit-acc-holder').value = item.accountHolder;
    document.getElementById('pay-edit-hr-status').value = item.hrStatus;
    document.getElementById('pay-edit-notes').value = item.notes || '';

    window.openFinanceModal('modalEditPayroll');
  };

  window.submitEditPayrollForm = function(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('pay-edit-id')?.value;
    const item = payrollList.find(x => x.id === id);
    if (!item) return;

    item.name = document.getElementById('pay-edit-name')?.value || item.name;
    item.role = document.getElementById('pay-edit-role')?.value || item.role;
    item.department = document.getElementById('pay-edit-dept')?.value || item.department;
    item.baseSalary = parseFloat(document.getElementById('pay-edit-base')?.value) || item.baseSalary;
    item.allowance = parseFloat(document.getElementById('pay-edit-allowance')?.value) || item.allowance;
    item.bpjsAmount = parseFloat(document.getElementById('pay-edit-bpjs')?.value) || item.bpjsAmount;
    item.pph21Amount = parseFloat(document.getElementById('pay-edit-pph')?.value) || item.pph21Amount;
    item.bankTarget = document.getElementById('pay-edit-bank')?.value || item.bankTarget;
    item.accountNumber = document.getElementById('pay-edit-acc-num')?.value || item.accountNumber;
    item.accountHolder = document.getElementById('pay-edit-acc-holder')?.value || item.accountHolder;
    item.hrStatus = document.getElementById('pay-edit-hr-status')?.value || item.hrStatus;
    item.notes = document.getElementById('pay-edit-notes')?.value || item.notes;

    if (item.hrStatus === 'APPROVED HR' && !item.paidAt) {
      item.paymentStatus = 'Siap Transfer';
    } else if (item.hrStatus === 'MENUNGGU HR' && !item.paidAt) {
      item.paymentStatus = 'Menunggu HR';
    }

    window.closeFinanceModal('modalEditPayroll');
    window.renderPayrollTable();
    window.showFinanceToast(`✅ Data payroll ${item.name} (${item.id}) berhasil diperbarui!`, 'success');
  };

  window.deletePayroll = function(id) {
    const idx = payrollList.findIndex(x => x.id === id);
    if (idx === -1) return;
    const item = payrollList[idx];
    if (confirm(`Hapus data payroll [${item.id} - ${item.name}]?`)) {
      payrollList.splice(idx, 1);
      window.renderPayrollTable();
      window.showFinanceToast(`🗑️ Data payroll ${item.name} (${id}) dihapus.`, 'info');
    }
  };

  window.simulateHrApprovePayroll = function(id) {
    const item = payrollList.find(x => x.id === id);
    if (!item) return;

    item.hrStatus = 'APPROVED HR';
    item.paymentStatus = 'Siap Transfer';
    item.hrApprover = 'Rina Anggraini (HR Manager)';
    window.renderPayrollTable();
    window.showFinanceToast(`🎉 Data payroll ${item.name} (${item.id}) resmi disetujui HR! Status berubah menjadi Siap Transfer.`, 'success');
  };

  window.cairkanGajiKaryawan = function(id) {
    const item = payrollList.find(x => x.id === id);
    if (!item) return;

    const gross = item.baseSalary + item.allowance;
    const totalTaxAndDeductions = item.bpjsAmount + item.pph21Amount;
    const net = gross - totalTaxAndDeductions;

    window.openUniversalTransferModal({
      type: 'payroll',
      id: item.id,
      title: `Gaji Karyawan: ${item.name} (${item.role})`,
      category: `Beban Operasional SDM / Payroll (${item.department})`,
      amount: net,
      recipientName: item.name,
      recipientBank: item.bankTarget,
      recipientAccount: `${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}`,
      defaultBankId: 'MANDIRI',
      allowTaxDeduction: false,
      notes: `Pencairan gaji bersih (THP) periode Oktober 2026 - ${item.name} (${item.id})`,
      onComplete: function(txData) {
        item.paymentStatus = 'LUNAS';
        item.paidAt = txData.timestamp;
        item.paidFromBank = txData.sourceBank.name;
        item.paidTxRef = txData.txRef;
        window.renderPayrollTable();
      }
    });
  };

  window.transferMassalPayroll = function() {
    const readyList = payrollList.filter(x => x.hrStatus === 'APPROVED HR' && x.paymentStatus !== 'LUNAS' && !x.paidAt);
    if (readyList.length === 0) {
      window.showFinanceToast('ℹ️ Tidak ada data gaji berstatus Disetujui HR yang belum ditransfer.', 'info');
      return;
    }

    const totalAmount = readyList.reduce((acc, curr) => {
      const net = curr.baseSalary + curr.allowance - curr.bpjsAmount - curr.pph21Amount;
      return acc + net;
    }, 0);

    const bank = BANK_ACCOUNTS_MASTER['MANDIRI'];
    if (bank.balance < totalAmount) {
      window.showFinanceToast(`⚠️ Saldo Bank Mandiri Payroll (${window.formatIDR(bank.balance)}) tidak mencukupi untuk transfer massal ${window.formatIDR(totalAmount)}!`, 'error');
      return;
    }

    const confirmed = confirm(
      `Konfirmasi Eksekusi Payroll Run Massal:

` +
      `Jumlah Karyawan: ${readyList.length} orang
` +
      `Total Gaji Bersih (THP): ${window.formatIDR(totalAmount)}
` +
      `Rekening Sumber: ${bank.name} (${bank.number})

` +
      `Lanjutkan proses transfer otomatis dan pencatatan jurnal umum?`
    );

    if (!confirmed) return;

    // Deduct bank
    bank.balance -= totalAmount;

    const now = new Date();
    const timestampStr = `${now.getDate()} Oktober 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const batchRef = `TRX-ASTA-PAYROLL-RUN-${Math.floor(1000 + Math.random() * 9000)}`;

    readyList.forEach((item, i) => {
      item.paymentStatus = 'LUNAS';
      item.paidAt = timestampStr;
      item.paidFromBank = bank.name;
      item.paidTxRef = `${batchRef}-${i + 1}`;
    });

    // Add General Journal entry
    window.addJournalEntry({
      date: '2026-10-12',
      ref: `JRN-PAYROLL-RUN`,
      title: `Pembayaran Payroll Gaji Massal (${readyList.length} Karyawan Astacode)`,
      source: 'opex',
      debitAccount: '6101 - Beban Gaji & Upah Karyawan',
      creditAccount: `${bank.code} - ${bank.name}`,
      amount: totalAmount
    });

    window.syncBankBalancesUI();
    window.renderJournalTable();
    window.renderPayrollTable();
    window.showFinanceToast(`🎉 Berhasil! Gaji massal ${readyList.length} karyawan (${window.formatIDR(totalAmount)}) telah berhasil ditransfer serentak dari ${bank.name}.`, 'success');
  };

  window.showPayrollPaidReceipt = function(id) {
    const item = payrollList.find(x => x.id === id);
    if (!item) return;
    const bank = BANK_ACCOUNTS_MASTER['MANDIRI'] || BANK_ACCOUNTS_MASTER['BCA'];
    const gross = item.baseSalary + item.allowance;
    const totalTaxAndDeductions = item.bpjsAmount + item.pph21Amount;
    const net = gross - totalTaxAndDeductions;

    window.showBankTransferReceipt({
      txRef: item.paidTxRef || `TRX-ASTA-PAYROLL-${item.id}`,
      title: `Gaji Karyawan: ${item.name} (${item.role})`,
      category: 'Beban Operasional SDM / Payroll',
      grossAmount: gross,
      taxDeduction: totalTaxAndDeductions,
      taxLabel: `BPJS (${window.formatIDR(item.bpjsAmount)}) & PPh 21 (${window.formatIDR(item.pph21Amount)})`,
      netAmount: net,
      sourceBank: bank,
      targetName: item.name,
      targetAccount: `${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}`,
      notes: item.notes || `Payroll Periode Oktober 2026 - ${item.name}`,
      timestamp: item.paidAt || '12 Oktober 2026, 10:00 WIB',
      remainingBalance: bank.balance
    });
  };

  window.showSlipGajiModal = function(idOrName) {
    let item = payrollList.find(x => x.id === idOrName || x.name === idOrName);
    if (!item && payrollList.length > 0) item = payrollList[0];
    if (!item) return;

    activeSlipPayrollId = item.id;
    const gross = item.baseSalary + item.allowance;
    const totalPot = item.bpjsAmount + item.pph21Amount;
    const net = gross - totalPot;
    const isPaid = item.paymentStatus === 'LUNAS' || item.paidAt !== null;

    const empName = document.getElementById('slip-emp-name');
    const empNip = document.getElementById('slip-emp-nip');
    const empRole = document.getElementById('slip-emp-role');
    const empDept = document.getElementById('slip-emp-dept');
    const baseEl = document.getElementById('slip-base');
    const tunjEl = document.getElementById('slip-tunj');
    const grossEl = document.getElementById('slip-gross');
    const bpjsEl = document.getElementById('slip-bpjs');
    const pphEl = document.getElementById('slip-pph');
    const potEl = document.getElementById('slip-total-pot');
    const netEl = document.getElementById('slip-net');
    const badgeEl = document.getElementById('slip-status-badge');
    const bankInfoEl = document.getElementById('slip-bank-info');
    const signEmp = document.getElementById('slip-sign-emp');

    if (empName) empName.textContent = item.name;
    if (empNip) empNip.textContent = item.id;
    if (empRole) empRole.textContent = item.role;
    if (empDept) empDept.textContent = `${item.department} • ${item.grade || 'Full Time'}`;
    if (baseEl) baseEl.textContent = window.formatIDR(item.baseSalary);
    if (tunjEl) tunjEl.textContent = window.formatIDR(item.allowance);
    if (grossEl) grossEl.textContent = window.formatIDR(gross);
    if (bpjsEl) bpjsEl.textContent = `- ${window.formatIDR(item.bpjsAmount)}`;
    if (pphEl) pphEl.textContent = `- ${window.formatIDR(item.pph21Amount)}`;
    if (potEl) potEl.textContent = `- ${window.formatIDR(totalPot)}`;
    if (netEl) netEl.textContent = window.formatIDR(net);
    if (signEmp) signEmp.textContent = item.name;
    if (bankInfoEl) bankInfoEl.textContent = `${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}`;

    if (badgeEl) {
      if (isPaid) {
        badgeEl.innerHTML = `<span class="badge success"><i class="fa-solid fa-circle-check"></i> LUNAS (Disbursed via ${item.paidFromBank || 'Mandiri'})</span>`;
      } else if (item.hrStatus === 'APPROVED HR') {
        badgeEl.innerHTML = `<span class="badge info"><i class="fa-solid fa-check-double"></i> Disetujui HR (Siap Transfer)</span>`;
      } else {
        badgeEl.innerHTML = `<span class="badge warning"><i class="fa-solid fa-hourglass-half"></i> Menunggu Verifikasi HR</span>`;
      }
    }

    window.openFinanceModal('modalSlipGaji');
  };

  window.sendSlipGajiWa = function() {
    const item = payrollList.find(x => x.id === activeSlipPayrollId);
    if (!item) return;

    const gross = item.baseSalary + item.allowance;
    const totalPot = item.bpjsAmount + item.pph21Amount;
    const net = gross - totalPot;
    const isPaid = item.paymentStatus === 'LUNAS' || item.paidAt !== null;

    const msg = `Halo *${item.name}*,

Berikut terlampir rincian Slip Gaji resmi Anda untuk periode *Oktober 2026* dari *PT ASTACODE SOLUSINDO MANDIRI*:

` +
      `📋 *NIP*: ${item.id}
` +
      `💼 *Jabatan*: ${item.role} (${item.department})

` +
      `*Penerimaan*:
` +
      `• Gaji Pokok: ${window.formatIDR(item.baseSalary)}
` +
      `• Tunjangan Jabatan: ${window.formatIDR(item.allowance)}
` +
      `• Total Bruto: ${window.formatIDR(gross)}

` +
      `*Potongan*:
` +
      `• BPJS Ketenagakerjaan: -${window.formatIDR(item.bpjsAmount)}
` +
      `• PPh 21 Karyawan: -${window.formatIDR(item.pph21Amount)}
` +
      `• Total Potongan: -${window.formatIDR(totalPot)}

` +
      `💰 *Take Home Pay (Diterima)*: *${window.formatIDR(net)}*
` +
      `🏦 *Rekening Transfer*: ${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}
` +
      `📌 *Status*: ${isPaid ? '✅ Lunas Ditransfer via Bank Mandiri Payroll' : '⏳ Terverifikasi HR, siap transfer'}

` +
      `Apabila terdapat pertanyaan mengenai rincian ini, silakan hubungi tim Finance & People Ops Astacode. Terima kasih atas dedikasi dan kontribusi Anda! 🙏`;

    const waNumberInput = document.getElementById('wa-client-number');
    const waNameInput = document.getElementById('wa-client-name');
    const waTextInput = document.getElementById('wa-message-text');
    const waScenarioSelect = document.getElementById('wa-scenario-select');

    if (waNameInput) waNameInput.value = item.name;
    if (waNumberInput) waNumberInput.value = '0812-9876-5432';
    if (waTextInput) waTextInput.value = msg;
    if (waScenarioSelect) waScenarioSelect.value = 'custom';

    window.closeFinanceModal('modalSlipGaji');
    window.openFinanceModal('modalWhatsAppSim');
    window.showFinanceToast(`💬 Template slip gaji resmi untuk ${item.name} siap dikirim via WhatsApp!`, 'info');
  };

  window.printSlipGaji = function() {
    window.print();
  };

  window.sendMassalSlipEmail = function() {
    window.showFinanceToast(`📧 Slip gaji digital untuk seluruh ${payrollList.length} karyawan tetap berhasil digenerate & dikirimkan ke email resmi masing-masing!`, 'success');
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

  // ==========================================================================
  // GENERAL JOURNAL (JURNAL UMUM) CONTROLLER
  // ==========================================================================

  window.filterJournalEntries = function(sourceFilter) {
    const entries = document.querySelectorAll('.journal-entry-card');
    let visibleCount = 0;

    entries.forEach(entry => {
      const src = entry.getAttribute('data-source');
      if (sourceFilter === 'all' || src === sourceFilter) {
        entry.style.display = 'block';
        visibleCount++;
      } else {
        entry.style.display = 'none';
      }
    });

    const filterNames = {
      'all': 'Semua Modul',
      'ar': 'Piutang & AR (Invoice)',
      'ap': 'Hutang & Tagihan (AP / Freelancer)',
      'hr': 'Payroll & Gaji (HR)',
      'opex': 'Beban Operasional (OPEX)',
      'trf': 'Mutasi Internal Kas'
    };
    window.showFinanceToast(`Filter jurnal: ${filterNames[sourceFilter] || sourceFilter} (${visibleCount} entri ditampilkan).`, 'info');
  };



  // Initialize on DOM Ready

  // ==========================================================================
  // 3. PRATINJAU INVOICE & SIMULASI CHAT WHATSAPP KE KONSUMEN / CUSTOMERS
  // ==========================================================================

  const DEFAULT_CHAT_SEED = {
    'RS Medika Utama - Aplikasi Kasir RS Medika': [
      {
        sender: 'admin',
        text: 'Selamat pagi Pak Heru, salam sehat selalu. Semoga aktivitas hari ini lancar ya Pak.\n\nKami dari tim Finance Astacode izin menyampaikan tagihan Termin 1: DP Awal (30%) untuk proyek Aplikasi Kasir RS Medika senilai Rp 9.990.000 (sudah termasuk PPN 11% dan estimasi potong PPh 23 2%). Dokumen resmi PDF invoice dan faktur pajaknya sudah kami lampirkan.\n\nNantinya pembayaran dapat ditransfer ke rekening operasional kami di Bank BCA 088-294-1189 a/n PT Astacode Digital Nusantara ya Pak. Terima kasih banyak atas kerja samanya 🙏',
        attachment: 'Invoice_INV-2608-001_RSMedika.pdf (1.1 MB)',
        time: '05 Agu, 09:30'
      },
      {
        sender: 'client',
        text: 'Selamat pagi rekan-rekan Finance Astacode. Baik, dokumen invoice dan faktur pajaknya sudah kami terima lengkap. Sudah kami jadwalkan transfer BCA siang ini setelah dipotong PPh 23 (2%) senilai Rp 180.000 (Net transfer Rp 9.810.000). Bukti potong e-Bupot-nya nanti kami kirimkan menyusul ya.',
        time: '05 Agu, 10:12'
      },
      {
        sender: 'admin',
        text: 'Alhamdulillah, terima kasih banyak atas konfirmasinya Pak Heru! Dana sebesar Rp 9.810.000 sudah kami terima dengan baik di rekening BCA siang ini. Status Termin 1 resmi kami tandai LUNAS ya Pak. Sukses selalu untuk tim RS Medika! 🙏✨',
        time: '05 Agu, 14:05'
      }
    ],
    'PT Alpha Global - Web Company Profile X': [
      {
        sender: 'admin',
        text: 'Selamat siang Bu Sari, salam hangat dari kami tim Finance Astacode. Semoga kabar baik selalu ya Bu.\n\nIzin menyampaikan invoice resmi Termin 1: DP Awal (50%) untuk proyek Web Company Profile X sebesar Rp 8.325.000 (Ref: INV-2610-003). Berkas PDF invoice dan kelengkapannya sudah kami lampirkan.\n\nApabila ada berkas pendukung yang dibutuhkan bagian kasir PT Alpha Global, boleh kabari kami ya Bu. Terima kasih banyak sebelumnya 🙏',
        attachment: 'Invoice_INV-2610-003_AlphaGlobal.pdf (980 KB)',
        time: '08 Okt, 11:20'
      },
      {
        sender: 'client',
        text: 'Halo siang tim Finance Astacode, terima kasih infonya. Dokumen invoice sudah kami cek dan saat ini sedang dalam proses otorisasi pengeluaran dana oleh finance internal kami untuk pencairan minggu ini ya.',
        time: '08 Okt, 13:45'
      }
    ]
  };

  let globalChatHistory = {};
  try {
    const saved = JSON.parse(localStorage.getItem('erp_chat_history') || 'null');
    if (saved && Object.keys(saved).length > 0) {
      globalChatHistory = saved;
    } else {
      globalChatHistory = JSON.parse(JSON.stringify(DEFAULT_CHAT_SEED));
      localStorage.setItem('erp_chat_history', JSON.stringify(globalChatHistory));
    }
  } catch (e) {
    globalChatHistory = JSON.parse(JSON.stringify(DEFAULT_CHAT_SEED));
  }

  let currentChatKey = null;
  let currentWaContext = {
    projectName: 'Aplikasi Kasir RS Medika',
    clientName: 'RS Medika Utama',
    terminName: 'Termin 2: UAT Selesai (40%)',
    amount: 13320000,
    invoiceRef: 'INV-2610-002',
    dpp: 12000000,
    ppn: 1320000,
    pph: 240000,
    status: 'Menunggu Bayar'
  };

  const CRM_CLIENT_DIRECTORY = {
    'RS Medika Utama': {
      pic: 'Heru Prasetyo (Finance Manager)',
      phone: '+62 817-6543-2100',
      email: 'finance@rsmedika.co.id',
      npwp: '01.345.678.9-012.000',
      mouRef: 'MoU/ASTA-CRM/VII/2026/071',
      mpPm: 'Andi Setiawan (Senior PM)'
    },
    'PT Alpha Global': {
      pic: 'Sari Wijaya (Chief Commercial Officer)',
      phone: '+62 811-2233-4455',
      email: 'sari.wijaya@alphaglobal.id',
      npwp: '03.112.556.7-021.000',
      mouRef: 'MoU/ASTA-CRM/IX/2026/082',
      mpPm: 'Bagas Prakoso (Tech Lead)'
    },
    'Samudera Logistik Nusantara': {
      pic: 'Hendra Wijaya (VP Finance)',
      phone: '+62 815-8899-0011',
      email: 'finance@samuderalogistik.co.id',
      npwp: '01.889.234.5-091.000',
      mouRef: 'MoU/ASTA-CRM/X/2026/108',
      mpPm: 'Andi Setiawan (Senior PM)'
    },
    'PT Mitra Perkasa': {
      pic: 'Budi Santoso (VP HR & Finance)',
      phone: '+62 812-9876-5432',
      email: 'ap@mitraperkasa.co.id',
      npwp: '02.411.890.1-044.000',
      mouRef: 'MoU/ASTA-CRM/X/2026/094',
      mpPm: 'Bagas Prakoso (Tech Lead)'
    }
  };

  function getNowTimeStr() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  window.saveChatMessage = function(key, sender, text, attachment = null) {
    if (!key) return;
    if (!globalChatHistory[key]) {
      globalChatHistory[key] = [];
    }
    globalChatHistory[key].push({
      sender,
      text,
      attachment,
      time: getNowTimeStr()
    });
    localStorage.setItem('erp_chat_history', JSON.stringify(globalChatHistory));
    window.renderMessageCenter();
  };

  window.resetChatHistorySimulation = function() {
    globalChatHistory = JSON.parse(JSON.stringify(DEFAULT_CHAT_SEED));
    localStorage.setItem('erp_chat_history', JSON.stringify(globalChatHistory));
    window.renderMessageCenter();
    window.showFinanceToast('🔄 Riwayat simulasi percakapan konsumen berhasil di-reset ke data awal!', 'info');
  };

  window.renderMessageCenter = function() {
    const container = document.getElementById('message-list-content');
    const navBadge = document.getElementById('nav-badge-messages');
    const kpiRooms = document.getElementById('msg-kpi-rooms');
    const kpiTotal = document.getElementById('msg-kpi-total');

    const keys = Object.keys(globalChatHistory);
    let totalMsgCount = 0;
    keys.forEach(k => { totalMsgCount += (globalChatHistory[k] || []).length; });

    if (navBadge) navBadge.textContent = String(keys.length);
    if (kpiRooms) kpiRooms.textContent = `${keys.length} Klien`;
    if (kpiTotal) kpiTotal.textContent = `${totalMsgCount} Pesan`;

    if (!container) return;

    if (keys.length === 0) {
      container.innerHTML = `<p style="padding: 20px; color: var(--text-muted);">Belum ada riwayat percakapan. Mulai simulasi WA dari modul Penagihan (AR).</p>`;
      return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 18px;">';
    for (const [key, messages] of Object.entries(globalChatHistory)) {
      const parts = key.split(' - ');
      const cName = parts[0] || 'Klien';
      const pName = parts[1] || 'Proyek';
      const contact = CRM_CLIENT_DIRECTORY[cName] || { pic: 'PIC Klien', phone: '+62 812-xxxx-xxxx', email: 'finance@client.com' };

      html += `
        <div style="background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-xs);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap:wrap; gap:10px; margin-bottom: 12px; border-bottom: 1px solid var(--border-light); padding-bottom: 10px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); display:flex; align-items:center; gap:8px;">
                <i class="fa-brands fa-whatsapp" style="color:#25D366; font-size:18px;"></i> ${cName}
                <span class="badge info" style="font-size:10.5px;">Proyek: ${pName}</span>
              </h4>
              <span style="font-size:11.5px; color:var(--text-muted);">
                PIC: <strong>${contact.pic}</strong> • WA: <strong style="color:#059669;">${contact.phone}</strong> • Email: ${contact.email}
              </span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge neutral">${messages.length} Pesan Tercatat</span>
              <button class="btn btn-xs success" onclick="window.openWhatsAppSimulation('${pName}', '${cName}', 'Tindak Lanjut Penagihan', 13320000, 'INV-FOLLOWUP', false)">
                <i class="fa-brands fa-whatsapp"></i> Buka Ruang Chat WA
              </button>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 230px; overflow-y: auto; background: #EFEAE2; padding: 12px; border-radius: var(--radius-sm);">
      `;
      messages.forEach(m => {
        const isAdmin = m.sender === 'admin';
        const bg = isAdmin ? '#dcf8c6' : '#ffffff';
        const align = isAdmin ? 'align-self: flex-end;' : 'align-self: flex-start;';
        const borderRadius = isAdmin ? '8px 0 8px 8px' : '0 8px 8px 8px';
        const attachBadge = m.attachment
          ? `<div style="margin-top:6px; padding:6px 8px; background:rgba(0,0,0,0.05); border-radius:5px; font-size:11px; display:flex; align-items:center; gap:6px;">
               <i class="fa-solid fa-file-pdf" style="color:#DC2626;"></i> <strong>${m.attachment}</strong>
             </div>`
          : '';
        html += `
          <div style="${align} background: ${bg}; padding: 8px 12px; border-radius: ${borderRadius}; font-size: 12px; max-width: 78%; box-shadow: 0 1px 1.5px rgba(0,0,0,0.08);">
            <div style="font-size:10.5px; font-weight:700; color:${isAdmin ? '#075E54' : '#1D4ED8'}; margin-bottom:2px;">
              ${isAdmin ? 'Finance Astacode (Anda)' : contact.pic}
            </div>
            <div style="white-space:pre-wrap; color:#1E293B;">${m.text}</div>
            ${attachBadge}
            <div style="font-size: 9.5px; color: #667781; text-align: right; margin-top: 3px;">
              ${m.time} ${isAdmin ? '<i class="fa-solid fa-check-double" style="color:#53bdeb; margin-left:2px;"></i>' : ''}
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
    }
    html += '</div>';
    container.innerHTML = html;
  };

  /**
   * Preview Invoice & Detail Pengiriman sebelum dikirim ke WhatsApp Konsumen
   */
  window.openPreviewInvoice = function(projectName, clientName, terminName, amount, invoiceRef = 'INV-2610-002', dpp = null, ppn = null, pph = null, status = 'Menunggu Bayar') {
    const previewContainer = document.getElementById('invoice-preview-content');
    const confirmBtn = document.getElementById('btnConfirmSendWa');

    const calcDpp = dpp !== null ? dpp : Math.round(amount / 1.11);
    const calcPpn = ppn !== null ? ppn : (amount - calcDpp);
    const calcPph = pph !== null ? pph : Math.round(calcDpp * 0.02);
    const calcGross = calcDpp + calcPpn;
    const calcNet = calcGross - calcPph;

    const contact = CRM_CLIENT_DIRECTORY[clientName] || {
      pic: 'PIC Keuangan Klien',
      phone: '+62 812-xxxx-xxxx',
      email: 'finance@client.co.id',
      npwp: '01.234.567.8-099.000',
      mouRef: 'MoU/ASTA-CRM/2026/001',
      mpPm: 'Andi Setiawan (PM)'
    };

    currentWaContext = {
      projectName,
      clientName,
      terminName,
      amount: calcGross,
      invoiceRef,
      dpp: calcDpp,
      ppn: calcPpn,
      pph: calcPph,
      net: calcNet,
      status
    };

    const defaultGreeting = `Halo Bapak/Ibu *${contact.pic.split(' (')[0]}*, kami dari tim Finance *ASTACODE ERP* ingin mengirimkan tagihan resmi *${terminName}* (${invoiceRef}) untuk proyek *${projectName}*.\n\n• Nilai DPP: ${window.formatIDR(calcDpp)}\n• PPN 11%: ${window.formatIDR(calcPpn)}\n• Total Faktur: *${window.formatIDR(calcGross)}*\n• Estimasi Net (setelah Bukti Potong PPh 23 2%): *${window.formatIDR(calcNet)}*\n\nPembayaran dapat ditransfer ke *BCA Operasional 088-294-1189 a/n PT Astacode Digital Nusantara*. Dokumen PDF Invoice & Faktur Pajak terlampir di bawah ini. Terima kasih!`;

    if (previewContainer) {
      previewContainer.innerHTML = `
        <div style="border:1px solid var(--border); border-radius:12px; background:#fff; overflow:hidden; margin-bottom:14px;">
          <!-- Kop Surat Invoice -->
          <div style="background:linear-gradient(135deg, #0F172A, #3730A3); color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:#93C5FD; font-weight:700;">PT ASTACODE DIGITAL NUSANTARA</div>
              <h4 style="font-size:17px; font-weight:800; color:#fff; margin-top:2px;">COMMERCIAL TAX INVOICE</h4>
            </div>
            <div style="text-align:right;">
              <span class="badge ${status === 'Lunas' ? 'success' : 'warning'}" style="font-size:11px;">${status.toUpperCase()}</span>
              <div style="font-family:var(--font-mono); font-size:12.5px; font-weight:700; color:#38BDF8; margin-top:4px;">#${invoiceRef}</div>
            </div>
          </div>

          <!-- Metadata Asal Pengiriman CRM & MP + Tujuan Klien -->
          <div style="padding:14px 20px; background:#F8FAFC; border-bottom:1px solid var(--border); display:grid; grid-template-columns: 1fr 1fr; gap:14px; font-size:12px;">
            <div>
              <span style="font-size:10.5px; color:var(--text-muted); text-transform:uppercase; font-weight:700; display:block;">Ditagihkan Kepada (Data CRM):</span>
              <strong style="font-size:13px; color:var(--text-primary); display:block; margin-top:2px;">${clientName}</strong>
              <div style="color:var(--text-secondary);">UP: <strong>${contact.pic}</strong></div>
              <div style="color:var(--text-muted); font-size:11px;">WA: ${contact.phone} • Email: ${contact.email}</div>
              <div style="color:var(--text-muted); font-size:11px;">NPWP: ${contact.npwp}</div>
            </div>
            <div style="background:#fff; border:1px solid var(--border-light); border-radius:8px; padding:10px 12px;">
              <span style="font-size:10.5px; color:var(--primary); text-transform:uppercase; font-weight:700; display:block;">
                <i class="fa-solid fa-code-merge"></i> Jejak Integrasi CRM & MP:
              </span>
              <div style="font-size:11.5px; margin-top:4px; color:var(--text-secondary);">
                <div>• <strong>Kontrak CRM:</strong> ${contact.mouRef}</div>
                <div>• <strong>Proyek MP:</strong> ${projectName}</div>
                <div>• <strong>Verifikasi PM:</strong> ${contact.mpPm}</div>
              </div>
            </div>
          </div>

          <!-- Tabel Rincian Tagihan & Pajak -->
          <div style="padding:14px 20px;">
            <table class="data-table" style="border:1px solid var(--border-light); border-radius:8px; overflow:hidden; margin-bottom:12px;">
              <thead>
                <tr>
                  <th>Deskripsi Termin & Milestone</th>
                  <th style="text-align:right;">DPP</th>
                  <th style="text-align:right;">PPN 11%</th>
                  <th style="text-align:right;">PPh 23 (2%)</th>
                  <th style="text-align:right;">Total Faktur</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style="color:var(--text-primary);">${terminName}</strong>
                    <div style="font-size:10.5px; color:var(--text-muted);">Proyek: ${projectName}</div>
                  </td>
                  <td style="text-align:right;">${window.formatIDR(calcDpp)}</td>
                  <td style="text-align:right; color:#1D4ED8; font-weight:600;">+ ${window.formatIDR(calcPpn)}</td>
                  <td style="text-align:right; color:#B45309; font-weight:600;">- ${window.formatIDR(calcPph)}</td>
                  <td style="text-align:right; font-weight:800; color:var(--text-primary);">${window.formatIDR(calcGross)}</td>
                </tr>
              </tbody>
            </table>

            <div style="display:flex; justify-content:space-between; align-items:center; background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:10px 14px; font-size:12px; color:#065F46;">
              <div>
                <strong><i class="fa-solid fa-building-columns"></i> Rekening Tujuan Cash Pool:</strong> BCA Operasional Utama (088-294-1189)
              </div>
              <div>
                Estimasi Kas Bersih (Net): <strong style="font-size:14px;">${window.formatIDR(calcNet)}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Kustomisasi Pesan Pengantar Chat Konsumen -->
        <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:10px; padding:12px 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
            <label class="form-label" style="margin:0;"><i class="fa-brands fa-whatsapp" style="color:#25D366; font-size:14px;"></i> Draft Pesan Pengantar ke Konsumen (${contact.pic.split(' (')[0]}):</label>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-xs" onclick="setInvoiceWaTemplate('standard')">Template Tagihan</button>
              <button type="button" class="btn btn-xs" onclick="setInvoiceWaTemplate('reminder')">Template Reminder</button>
              <button type="button" class="btn btn-xs" onclick="setInvoiceWaTemplate('thankyou')">Template Lunas</button>
            </div>
          </div>
          <textarea id="preview-wa-custom-msg" class="form-textarea" style="height:95px; font-size:12px; line-height:1.45;">${defaultGreeting}</textarea>
        </div>
      `;
    }

    if (confirmBtn) {
      confirmBtn.onclick = function() {
        const customMsg = document.getElementById('preview-wa-custom-msg')?.value;
        window.closeFinanceModal('modalInvoicePreview');
        window.openWhatsAppSimulation(projectName, clientName, terminName, calcGross, invoiceRef, true, customMsg);
      };
    }

    window.openFinanceModal('modalInvoicePreview');
  };

  window.setInvoiceWaTemplate = function(tplType) {
    const textarea = document.getElementById('preview-wa-custom-msg');
    if (!textarea) return;
    const ctx = currentWaContext;
    const contact = CRM_CLIENT_DIRECTORY[ctx.clientName] || { pic: 'Bapak/Ibu PIC' };
    const picShort = contact.pic.split(' (')[0];

    if (tplType === 'reminder') {
      textarea.value = `Selamat siang Bapak/Ibu *${picShort}*, salam sehat selalu. Semoga lancar kegiatannya hari ini ya.\n\nIzin follow-up santai ya Pak/Bu terkait tagihan *${ctx.terminName}* (${ctx.invoiceRef}) untuk proyek *${ctx.projectName}* senilai *${window.formatIDR(ctx.amount)}* yang jatuh temponya dalam waktu dekat.\n\nKira-kira proses pembayarannya sudah dijadwalkan tanggal berapa ya Pak/Bu? Apabila bagian keuangan membutuhkan dokumen administrasi pendukung tambahan, boleh kabari kami agar bisa segera kami siapkan. Terima kasih banyak sebelumnya atas bantuannya 🙏`;
    } else if (tplType === 'thankyou') {
      textarea.value = `Alhamdulillah, selamat siang Bapak/Ibu *${picShort}*!\n\nKami ingin mengabarkan bahwa pembayaran untuk *${ctx.terminName}* (${ctx.invoiceRef}) pada proyek *${ctx.projectName}* sebesar *${window.formatIDR(ctx.net || ctx.amount)}* telah kami terima dengan baik di rekening BCA Operasional kami hari ini.\n\nKuitansi tanda lunas resminya sudah kami lampirkan ya Pak/Bu. Terima kasih banyak atas kerja sama yang luar biasa. Semoga proyek ini terus berjalan lancar dan sukses! 🙏✨`;
    } else {
      textarea.value = `Selamat siang Bapak/Ibu *${picShort}*, salam sehat dari tim Finance Astacode. Semoga aktivitasnya lancar hari ini ya.\n\nIzin menyampaikan invoice resmi untuk tagihan *${ctx.terminName}* (${ctx.invoiceRef}) pada proyek *${ctx.projectName}*.\nTotal tagihan: *${window.formatIDR(ctx.amount)}* (rincian DPP, PPN 11%, dan potongan PPh 23 2% sudah tercantum di dalam berkas).\n\nDokumen invoice dan lampiran BAST pendukungnya sudah kami sertakan dalam file PDF terlampir ya Pak/Bu.\nPembayaran dapat ditransfer ke rekening resmi kami:\n• Bank: *BCA Operasional Utama*\n• No. Rekening: *088-294-1189*\n• Atas Nama: *PT Astacode Digital Nusantara*\n\nJika ada hal yang perlu dicek kembali atau dikoordinasikan, silakan kabari kami ya. Terima kasih banyak atas kerja samanya 🙏`;
    }
  };

  /**
   * Opens the WhatsApp simulation modal with pre-filled billing data & interactive customer chat.
   */
  window.openWhatsAppSimulation = function(projectName, clientName, terminName, amount, invoiceRef = 'INV-2610-002', sendInitialInvoice = true, customMessage = null) {
    currentChatKey = `${clientName} - ${projectName}`;
    currentWaContext = {
      ...currentWaContext,
      projectName,
      clientName,
      terminName,
      amount,
      invoiceRef
    };

    const picNameEl = document.getElementById('waSimPicName');
    const phoneEl = document.getElementById('waSimPhone');
    const emailEl = document.getElementById('waSimEmail');
    const projectBadge = document.getElementById('waSimProjectBadge');
    const invRefEl = document.getElementById('waSimInvoiceRef');
    const chatMsgs = document.getElementById('wa-chat-messages');

    const contact = CRM_CLIENT_DIRECTORY[clientName] || {
      pic: 'PIC Keuangan Klien',
      phone: '+62 812-8899-7766',
      email: 'finance@client.co.id'
    };

    if (picNameEl) picNameEl.textContent = `${contact.pic} — ${clientName}`;
    if (phoneEl) phoneEl.textContent = contact.phone;
    if (emailEl) emailEl.textContent = contact.email;
    if (projectBadge) projectBadge.textContent = `Proyek: ${projectName}`;
    if (invRefEl) invRefEl.textContent = `Ref: ${invoiceRef} • ${window.formatIDR(amount)}`;

    const formattedAmount = window.formatIDR(amount);
    const msgText = customMessage || `Halo Bapak/Ibu *${contact.pic.split(' ')[0]}*, kami dari bagian Finance ASTACODE ingin menyampaikan tagihan *${terminName}* (${invoiceRef}) untuk proyek *${projectName}* sebesar *${formattedAmount}* sudah diterbitkan. Kami juga lampirkan PDF Invoice & Faktur Pajak resminya. Terima kasih!`;
    const pdfFileName = `Invoice_${invoiceRef}_${clientName.replace(/\s+/g, '_')}.pdf`;

    if (sendInitialInvoice) {
      window.saveChatMessage(currentChatKey, 'admin', msgText, pdfFileName);
    }

    renderActiveWaConversation(chatMsgs, contact);
    window.openFinanceModal('modalWhatsAppSim');

    if (sendInitialInvoice) {
      // Simulate Customer typing & automatic reply after 1.3s
      showWaTypingIndicator(chatMsgs, contact.pic.split(' (')[0]);
      setTimeout(() => {
        removeWaTypingIndicator();
        const clientReply = `Halo tim Finance Astacode, terima kasih. Dokumen *${pdfFileName}* untuk tagihan *${terminName}* sudah kami terima dengan baik dan sedang kami teruskan ke bagian otorisasi pembayaran.`;
        window.saveChatMessage(currentChatKey, 'client', clientReply);
        renderActiveWaConversation(chatMsgs, contact);
        window.showFinanceToast(`💬 Balasan WhatsApp baru diterima dari ${contact.pic.split(' (')[0]} (${clientName})!`, 'info');
      }, 1400);
    }
  };

  function renderActiveWaConversation(chatMsgs, contact) {
    if (!chatMsgs) return;
    const history = globalChatHistory[currentChatKey] || [];
    const picShort = (contact?.pic || 'Klien').split(' (')[0];

    let html = `
      <div style="align-self: center; background: #E1F3FB; padding: 4px 12px; border-radius: 8px; font-size: 10.5px; color: #475569; margin-bottom: 6px; box-shadow: 0 1px 1px rgba(0,0,0,0.08);">
        <i class="fa-solid fa-shield-halved"></i> Percakapan Resmi WhatsApp Business Astacode ERP
      </div>
    `;

    history.forEach(item => {
      const isAdmin = item.sender === 'admin';
      if (isAdmin) {
        html += `
          <div style="align-self: flex-end; background: #dcf8c6; padding: 8px 12px; border-radius: 10px 0 10px 10px; max-width: 82%; font-size: 12.5px; box-shadow: 0 1px 1.5px rgba(0,0,0,0.12); position: relative;">
            <div style="font-size:10px; font-weight:700; color:#075E54; margin-bottom:2px;">Finance Astacode (Anda)</div>
            <div style="white-space: pre-wrap; color:#0F172A; line-height:1.45;">${item.text}</div>
            ${item.attachment ? `
              <div style="display: flex; align-items: center; background: rgba(255,255,255,0.75); border:1px solid rgba(0,0,0,0.08); border-radius: 6px; padding: 8px; gap: 10px; margin-top: 6px;">
                <div style="width: 34px; height: 34px; background: #EF4444; border-radius: 6px; display: grid; place-items: center; color: #fff; flex-shrink:0;">
                  <i class="fa-solid fa-file-pdf"></i>
                </div>
                <div style="flex: 1; overflow: hidden;">
                  <div style="font-weight: 700; font-size: 11.5px; color:#0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.attachment}</div>
                  <div style="font-size: 10px; color: #64748B;">Dokumen Resmi Terverifikasi • PDF</div>
                </div>
              </div>
            ` : ''}
            <div style="font-size: 10px; color: #667781; text-align: right; margin-top: 4px;">
              ${item.time} <i class="fa-solid fa-check-double" style="color: #53bdeb; margin-left: 3px;"></i>
            </div>
          </div>
        `;
      } else {
        html += `
          <div style="align-self: flex-start; background: #ffffff; padding: 8px 12px; border-radius: 0 10px 10px 10px; max-width: 82%; font-size: 12.5px; box-shadow: 0 1px 1.5px rgba(0,0,0,0.12); position: relative;">
            <div style="font-size:10px; font-weight:700; color:#1D4ED8; margin-bottom:2px;">${picShort} (${currentWaContext.clientName})</div>
            <div style="white-space: pre-wrap; color:#0F172A; line-height:1.45;">${item.text}</div>
            ${item.attachment ? `
              <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 8px 10px; margin-top: 6px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="width:32px; height:32px; border-radius:6px; background:#10B981; color:#fff; display:grid; place-items:center;">
                    <i class="fa-solid fa-receipt"></i>
                  </div>
                  <div style="flex:1;">
                    <strong style="font-size:11.5px; color:#065F46; display:block;">${item.attachment}</strong>
                    <span style="font-size:10px; color:#047857;">Bukti Transfer Bank Klien • Siap Diverifikasi</span>
                  </div>
                </div>
                <div style="margin-top:8px; display:flex; justify-content:flex-end;">
                  <button type="button" class="btn btn-xs success" onclick="verifyClientPaymentFromChat()">
                    <i class="fa-solid fa-circle-check"></i> Verifikasi & Tandai Invoice LUNAS
                  </button>
                </div>
              </div>
            ` : ''}
            <div style="font-size: 10px; color: #667781; text-align: right; margin-top: 4px;">
              ${item.time}
            </div>
          </div>
        `;
      }
    });

    chatMsgs.innerHTML = html;
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function showWaTypingIndicator(chatMsgs, senderName) {
    if (!chatMsgs) return;
    removeWaTypingIndicator();
    const el = document.createElement('div');
    el.id = 'wa-typing-bubble';
    el.style.cssText = 'align-self: flex-start; background: #fff; padding: 6px 12px; border-radius: 0 10px 10px 10px; font-size: 11.5px; color: #059669; font-style: italic; box-shadow: 0 1px 1px rgba(0,0,0,0.1);';
    el.innerHTML = `<i class="fa-solid fa-ellipsis fa-fade" style="margin-right:5px;"></i> ${senderName} sedang mengetik balasan...`;
    chatMsgs.appendChild(el);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function removeWaTypingIndicator() {
    const el = document.getElementById('wa-typing-bubble');
    if (el) el.remove();
  }

  /**
   * Skenario Simulasi Cepat Interaksi Chat dengan Konsumen
   */
  window.triggerWaQuickScenario = function(scenarioType) {
    const chatMsgs = document.getElementById('wa-chat-messages');
    const ctx = currentWaContext;
    const contact = CRM_CLIENT_DIRECTORY[ctx.clientName] || { pic: 'PIC Klien', npwp: '01.345.678.9-012.000' };
    const picShort = contact.pic.split(' (')[0];

    if (scenarioType === 'rekening') {
      const adminMsg = `Selamat siang Pak/Bu *${picShort}*, berikut informasi detail rekening resmi operasional kami untuk proses transfer tagihan *${ctx.invoiceRef}* ya:\n\n• Bank: *BCA Operasional Utama*\n• Nomor Rekening: *088-294-1189*\n• Atas Nama: *PT Astacode Digital Nusantara*\n• NPWP Perusahaan: *01.998.221.4-055.000*\n\nMohon bantuannya untuk mengabari kami apabila pembayarannya sudah dijadwalkan. Terima kasih banyak 🙏`;
      window.saveChatMessage(currentChatKey, 'admin', adminMsg);
      renderActiveWaConversation(chatMsgs, contact);

      showWaTypingIndicator(chatMsgs, picShort);
      setTimeout(() => {
        removeWaTypingIndicator();
        window.saveChatMessage(currentChatKey, 'client', `Baik, terima kasih banyak infonya tim Finance Astacode. Nomor rekening BCA dan NPWP PT Astacode sudah kami input ke daftar transfer vendor di sistem perbankan kami ya.`);
        renderActiveWaConversation(chatMsgs, contact);
      }, 1100);

    } else if (scenarioType === 'reminder') {
      const adminMsg = `Selamat siang Bapak/Ibu *${picShort}*, semoga selalu dalam keadaan sehat.\n\nIzin follow-up santai ya Pak/Bu perihal tagihan *${ctx.terminName}* (${ctx.invoiceRef}) sebesar *${window.formatIDR(ctx.amount)}*. Mohon infonya apakah pembayarannya sudah diproses atau ada berkas tambahan yang diperlukan bagian kasir? Terima kasih banyak sebelumnya 🙏`;
      window.saveChatMessage(currentChatKey, 'admin', adminMsg);
      renderActiveWaConversation(chatMsgs, contact);

      showWaTypingIndicator(chatMsgs, picShort);
      setTimeout(() => {
        removeWaTypingIndicator();
        window.saveChatMessage(currentChatKey, 'client', `Halo tim Finance Astacode, terima kasih sudah diingatkan. Dokumennya sudah lengkap dan invoice ini sudah masuk antrean transfer hari ini ya. Nanti bukti bayarnya segera kami kirimkan ke sini.`);
        renderActiveWaConversation(chatMsgs, contact);
      }, 1200);

    } else if (scenarioType === 'tanya_pajak') {
      showWaTypingIndicator(chatMsgs, picShort);
      setTimeout(() => {
        removeWaTypingIndicator();
        const clientQ = `Selamat siang rekan Finance Astacode, mau memastikan kembali untuk invoice *${ctx.invoiceRef}* ini kami potong PPh Pasal 23 Jasa sebesar 2% dari DPP ya? Jadi nominal yang kami transfer adalah nilai Net dan bukti potong e-Bupot-nya nanti kami kirimkan setelah proses potong terbit?`;
        window.saveChatMessage(currentChatKey, 'client', clientQ);
        renderActiveWaConversation(chatMsgs, contact);

        setTimeout(() => {
          const calcDpp = ctx.dpp || Math.round(ctx.amount / 1.11);
          const calcPph = ctx.pph || Math.round(calcDpp * 0.02);
          const calcNet = ctx.amount - calcPph;
          const adminAns = `Selamat siang Pak/Bu *${picShort}*, betul sekali. Dengan potongan PPh 23 (2%) sebesar *${window.formatIDR(calcPph)}*, maka nilai bersih (Net) yang ditransfer ke rekening BCA kami adalah *${window.formatIDR(calcNet)}*. Nanti bukti potong e-Bupot-nya bisa dikirimkan ke sini jika sudah terbit ya Pak/Bu. Terima kasih atas konfirmasinya 🙏`;
          window.saveChatMessage(currentChatKey, 'admin', adminAns);
          renderActiveWaConversation(chatMsgs, contact);
        }, 1100);
      }, 800);

    } else if (scenarioType === 'lampiran_faktur') {
      const adminMsg = `Selamat siang Pak/Bu *${picShort}*, berikut kami lampirkan salinan Faktur Pajak e-Faktur dan Berita Acara Serah Terima (BAST) pendukung untuk invoice *${ctx.invoiceRef}* ya.`;
      window.saveChatMessage(currentChatKey, 'admin', adminMsg, `eFaktur_PPN_${ctx.invoiceRef}.pdf`);
      renderActiveWaConversation(chatMsgs, contact);

    } else if (scenarioType === 'klien_bayar') {
      showWaTypingIndicator(chatMsgs, picShort);
      setTimeout(() => {
        removeWaTypingIndicator();
        const calcDpp = ctx.dpp || Math.round(ctx.amount / 1.11);
        const calcPph = ctx.pph || Math.round(calcDpp * 0.02);
        const calcNet = ctx.amount - calcPph;
        const payMsg = `Selamat siang rekan-rekan Finance Astacode. Pembayaran untuk tagihan *${ctx.terminName}* (${ctx.invoiceRef}) proyek *${ctx.projectName}* sebesar *${window.formatIDR(calcNet)}* (nilai Net setelah dipotong PPh 23) baru saja selesai kami transfer ke rekening BCA PT Astacode ya. Berikut kami lampirkan bukti transfernya. Mohon bantuannya untuk dicek. Terima kasih banyak! 🙏`;
        window.saveChatMessage(currentChatKey, 'client', payMsg, `Bukti_Transfer_BCA_${ctx.invoiceRef}.jpg`);
        renderActiveWaConversation(chatMsgs, contact);
        window.showFinanceToast(`💸 Klien [${ctx.clientName}] mengirim Bukti Transfer di WhatsApp! Klik 'Verifikasi & Tandai LUNAS'.`, 'success');
      }, 900);
    }
  };

  /**
   * Verifikasi Bukti Transfer langsung dari Ruang Chat WA & ubah status termin menjadi LUNAS
   */
  window.verifyClientPaymentFromChat = function() {
    const ctx = currentWaContext;
    const chatMsgs = document.getElementById('wa-chat-messages');
    const contact = CRM_CLIENT_DIRECTORY[ctx.clientName] || { pic: 'PIC Klien' };
    const picShort = contact.pic.split(' (')[0];

    // Update badge di tabel AR sesuai invoiceRef / proyek
    if (ctx.invoiceRef === 'INV-2610-002') {
      const b2 = document.getElementById('badgeTermin2');
      if (b2) { b2.className = 'badge success'; b2.innerHTML = '✅ LUNAS'; }
      const r2 = document.getElementById('rowTermin2');
      if (r2) r2.style.background = '';
    } else if (ctx.invoiceRef === 'INV-2612-003') {
      const b3 = document.getElementById('badgeTermin3');
      if (b3) { b3.className = 'badge success'; b3.innerHTML = '✅ LUNAS'; }
    } else if (ctx.invoiceRef === 'INV-2610-003') {
      const ba1 = document.getElementById('badgeAlpha1');
      if (ba1) { ba1.className = 'badge success'; ba1.innerHTML = '✅ LUNAS'; }
    } else if (ctx.invoiceRef === 'INV-2611-004') {
      const ba2 = document.getElementById('badgeAlpha2');
      if (ba2) { ba2.className = 'badge success'; ba2.innerHTML = '✅ LUNAS'; }
    }

    const confirmMsg = `Terima kasih banyak Bapak/Ibu *${picShort}*! Dana pembayaran untuk *${ctx.terminName}* (${ctx.invoiceRef}) telah terverifikasi masuk ke Cash Pool BCA Operasional Astacode. Status tagihan kini resmi *LUNAS* dan sudah tercatat otomatis di Jurnal Umum (AR). Berikut kuitansi lunas resminya.`;
    window.saveChatMessage(currentChatKey, 'admin', confirmMsg, `Kuitansi_LUNAS_${ctx.invoiceRef}.pdf`);
    renderActiveWaConversation(chatMsgs, contact);

    window.showFinanceToast(`✅ Pembayaran ${ctx.invoiceRef} (${ctx.clientName}) diverifikasi! Status berubah menjadi LUNAS & masuk ke Kas Pool.`, 'success');
  };

  /**
   * Sends a manual message in the simulation and triggers a contextual customer response.
   */
  window.sendWaSimMessage = function() {
    const input = document.getElementById('wa-message-input');
    const chatMsgs = document.getElementById('wa-chat-messages');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    const contact = CRM_CLIENT_DIRECTORY[currentWaContext.clientName] || { pic: 'PIC Klien' };
    const picShort = contact.pic.split(' (')[0];

    window.saveChatMessage(currentChatKey, 'admin', text);
    renderActiveWaConversation(chatMsgs, contact);

    showWaTypingIndicator(chatMsgs, picShort);
    setTimeout(() => {
      removeWaTypingIndicator();
      const lower = text.toLowerCase();
      let responseText = `Baik Bapak/Ibu Finance Astacode, pesan Anda sudah kami terima. Segera kami proses untuk tahapan persetujuan internal kami dan kami kabari kembali.`;
      if (lower.includes('pajak') || lower.includes('pph') || lower.includes('faktur')) {
        responseText = `Terima kasih informasinya terkait pajak & e-Faktur. Tim pajak kami akan segera menyiapkan Bukti Potong PPh 23-nya.`;
      } else if (lower.includes('terima kasih') || lower.includes('lunas')) {
        responseText = `Sama-sama tim Astacode, senang bekerja sama dengan Anda. Ditunggu progres milestone proyek selanjutnya!`;
      }
      window.saveChatMessage(currentChatKey, 'client', responseText);
      renderActiveWaConversation(chatMsgs, contact);
      window.showFinanceToast(`💬 Balasan WhatsApp diterima dari ${picShort}!`, 'info');
    }, 1200);
  };


  // ==========================================================================
  // 4. MASTER DATA BANK & SALDO REAL-TIME (DATA BANK PERUSAHAAN)
  // ==========================================================================

  const BANK_ACCOUNTS_MASTER = {
    'BCA': {
      id: 'BCA',
      code: '1102',
      name: 'BCA Utama Operasional',
      number: '8830-192-8391',
      holder: 'PT Astacode Digital Nusantara',
      balance: 350000000,
      currency: 'IDR',
      type: 'Bank'
    },
    'MANDIRI': {
      id: 'MANDIRI',
      code: '1104',
      name: 'Bank Mandiri Payroll',
      number: '132-00-19283-91',
      holder: 'PT Astacode Digital Nusantara',
      balance: 130250000,
      currency: 'IDR',
      type: 'Bank'
    },
    'KAS_KECIL': {
      id: 'KAS_KECIL',
      code: '1101',
      name: 'Kas Kecil / Petty Cash',
      number: 'Brankas Kantor Utama',
      holder: 'Bendahara Kantor',
      balance: 5000000,
      currency: 'IDR',
      type: 'Kas Tunai'
    },
    'WISE': {
      id: 'WISE',
      code: '1105',
      name: 'Wise Multi-Currency',
      number: 'ASTA-USD-8891',
      holder: 'PT Astacode Digital Nusantara',
      balance: 192975000, // Equiv IDR (rate: 15,500)
      balanceUsd: 12450,
      currency: 'USD',
      type: 'Valas'
    }
  };

  window.syncBankBalancesUI = function() {
    // Total Likuiditas IDR (BCA + Mandiri + Kas Kecil)
    const totalIdr = BANK_ACCOUNTS_MASTER['BCA'].balance + 
                     BANK_ACCOUNTS_MASTER['MANDIRI'].balance + 
                     BANK_ACCOUNTS_MASTER['KAS_KECIL'].balance;

    // Update main dashboard KPI if exists
    const dashboardKpi = document.querySelector('#view-dashboard .kpi-val');
    if (dashboardKpi) {
      dashboardKpi.textContent = window.formatIDR(totalIdr);
    }

    // Update Accounts View cards
    const accCards = document.querySelectorAll('#view-accounts .card-panel');
    if (accCards.length >= 4) {
      const bcaVal = accCards[0].querySelector('.card-body div');
      if (bcaVal) bcaVal.textContent = window.formatIDR(BANK_ACCOUNTS_MASTER['BCA'].balance);

      const mdrVal = accCards[1].querySelector('.card-body div');
      if (mdrVal) mdrVal.textContent = window.formatIDR(BANK_ACCOUNTS_MASTER['MANDIRI'].balance);

      const kasVal = accCards[2].querySelector('.card-body div');
      if (kasVal) kasVal.textContent = window.formatIDR(BANK_ACCOUNTS_MASTER['KAS_KECIL'].balance);

      const wiseVal = accCards[3].querySelector('.card-body div');
      if (wiseVal) wiseVal.innerHTML = `$ ${BANK_ACCOUNTS_MASTER['WISE'].balanceUsd.toLocaleString('en-US')} <span style="font-size:12px; font-weight:500; color:var(--text-muted);">USD</span>`;
    }

    // Update Accounts KPI Top
    const totalLiqEl = document.querySelector('#view-accounts .kpi-grid .kpi-card:nth-child(1) .kpi-val');
    if (totalLiqEl) totalLiqEl.textContent = window.formatIDR(totalIdr);
  };

  // ==========================================================================
  // 5. UNIVERSAL TABLE PAGINATION ENGINE (APPLIED TO ALL TABLES IN ALL MENUS)
  // ==========================================================================

  window.setupTablePagination = function(tableId, rowsPerPage = 5) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const parentWrap = table.closest('.table-wrap') || table.parentElement;
    let pagWrapper = parentWrap.parentElement.querySelector(`.pagination-for-${tableId}`);
    if (!pagWrapper) {
      pagWrapper = document.createElement('div');
      pagWrapper.className = `table-pagination-footer pagination-for-${tableId}`;
      parentWrap.parentElement.appendChild(pagWrapper);
    }

    function refresh() {
      const allRows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.classList.contains('no-paginate'));
      // Only count rows that are not hidden by search/filter logic
      const visibleRows = allRows.filter(r => r.getAttribute('data-filtered-out') !== 'true');
      const totalRows = visibleRows.length;

      if (totalRows === 0) {
        pagWrapper.innerHTML = `
          <div class="table-pagination-info">Tidak ada data yang cocok dengan filter</div>
          <div class="table-pagination-controls"></div>
        `;
        return;
      }

      const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
      let currentPage = parseInt(table.getAttribute('data-current-page') || '1', 10);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      table.setAttribute('data-current-page', currentPage);

      const startIdx = (currentPage - 1) * rowsPerPage;
      const endIdx = Math.min(startIdx + rowsPerPage, totalRows);

      allRows.forEach(r => {
        if (r.getAttribute('data-filtered-out') === 'true') {
          r.style.display = 'none';
        }
      });

      visibleRows.forEach((r, idx) => {
        if (idx >= startIdx && idx < endIdx) {
          r.style.display = '';
        } else {
          r.style.display = 'none';
        }
      });

      let buttonsHtml = `
        <button type="button" class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeTablePage('${tableId}', ${currentPage - 1})" title="Halaman Sebelumnya">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button type="button" class="page-btn ${p === currentPage ? 'active' : ''}" onclick="window.changeTablePage('${tableId}', ${p})">${p}</button>
        `;
      }

      buttonsHtml += `
        <button type="button" class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeTablePage('${tableId}', ${currentPage + 1})" title="Halaman Selanjutnya">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;

      pagWrapper.innerHTML = `
        <div class="table-pagination-info">Menampilkan <strong>${startIdx + 1} - ${endIdx}</strong> dari <strong>${totalRows}</strong> data</div>
        <div class="table-pagination-controls">${buttonsHtml}</div>
      `;
    }

    table._updatePagination = refresh;
    refresh();
  };

  window.changeTablePage = function(tableId, page) {
    const table = document.getElementById(tableId);
    if (!table) return;
    table.setAttribute('data-current-page', page);
    if (typeof table._updatePagination === 'function') {
      table._updatePagination();
    }
  };

  // ==========================================================================
  // 6. OPERASIONAL (OPEX) CONTROLLER: CRUD & BAYAR TRANSFER BANK
  // ==========================================================================

  let opexList = [
    {
      id: 'OPX-2610-01',
      date: '2026-10-12',
      time: '13:45:00',
      day: 'Senin',
      name: 'Langganan Internet Biznet Dedicated 100Mbps',
      category: 'Utilitas (Internet)',
      nominal: 1750000,
      bankId: 'BCA',
      recipient: 'PT Biznet Networks',
      targetAccount: 'BCA 001-9982-11 a/n PT Biznet Networks',
      status: 'Terbayar',
      notes: 'Koneksi internet kantor utama periode Oktober 2026'
    },
    {
      id: 'OPX-2610-02',
      date: '2026-10-12',
      time: '10:15:30',
      day: 'Senin',
      name: 'Konsumsi Meeting & Snack Karyawan',
      category: 'Pantry & Konsumsi',
      nominal: 350000,
      bankId: 'KAS_KECIL',
      recipient: 'Kantin Berkah',
      targetAccount: 'Tunai Kasir Kantor',
      status: 'Terbayar',
      notes: 'Konsumsi sprint review mingguan tim dev'
    },
    {
      id: 'OPX-2610-03',
      date: '2026-10-11',
      time: '14:20:00',
      day: 'Minggu',
      name: 'Token Listrik PLN Gedung Kantor',
      category: 'Utilitas (Listrik)',
      nominal: 1500000,
      bankId: 'BCA',
      recipient: 'PLN Persero',
      targetAccount: 'PLN Prepaid 5410-0091-88',
      status: 'Terbayar',
      notes: 'Isi ulang token daya 11000VA'
    },
    {
      id: 'OPX-2610-04',
      date: '2026-10-08',
      time: '11:00:00',
      day: 'Kamis',
      name: 'Pembelian Kertas A4 & Toner Printer',
      category: 'Peralatan & ATK',
      nominal: 850000,
      bankId: 'KAS_KECIL',
      recipient: 'Gramedia Stationery',
      targetAccount: 'BCA 221-0091-22',
      status: 'Terbayar',
      notes: 'Stok ATK administrasi kuartal 4'
    },
    {
      id: 'OPX-2610-05',
      date: '2026-10-14',
      time: '09:00:00',
      day: 'Rabu',
      name: 'Sewa Ruang Meeting Co-Working Space',
      category: 'Sewa Gedung & Kantor',
      nominal: 1200000,
      bankId: 'BCA',
      recipient: 'GoWork Coworking',
      targetAccount: 'Mandiri 122-00-8819-01 a/n PT GoWork',
      status: 'Menunggu Bayar',
      notes: 'Townhall & workshop klien RS Medika'
    },
    {
      id: 'OPX-2610-06',
      date: '2026-10-15',
      time: '16:00:00',
      day: 'Kamis',
      name: 'Jasa Maintenance AC & Sanitasi Kantor',
      category: 'Utilitas (Gedung)',
      nominal: 650000,
      bankId: 'BCA',
      recipient: 'CoolCare Service AC',
      targetAccount: 'BCA 604-1192-33 a/n Budi CoolCare',
      status: 'Menunggu Bayar',
      notes: 'Service berkala 4 unit split AC kantor'
    }
  ];

  window.renderOpexTable = function() {
    const tbody = document.getElementById('opexTableBody');
    if (!tbody) return;

    let html = '';
    opexList.forEach((item, idx) => {
      const isPaid = item.status === 'Terbayar';
      const bankInfo = BANK_ACCOUNTS_MASTER[item.bankId] || { name: item.bankId };

      html += `
        <tr data-id="${item.id}" data-category="${item.category}">
          <td>
            <span class="badge neutral" style="font-family:var(--font-mono); font-weight:700;">${item.id}</span>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${item.date}</div>
          </td>
          <td>
            <strong style="color:var(--text-primary);">${item.name}</strong>
            <div style="font-size:11px; color:var(--text-muted);">Penerima: <span style="color:#0F172A; font-weight:600;">${item.recipient}</span></div>
          </td>
          <td><span class="badge info">${item.category}</span></td>
          <td>
            <span style="font-size:11.5px; font-weight:600; color:var(--text-secondary);">
              <i class="fa-solid fa-building-columns" style="color:var(--primary); margin-right:4px;"></i>${bankInfo.name}
            </span>
          </td>
          <td style="text-align:right; font-weight:800; color:${isPaid ? 'var(--text-primary)' : '#EF4444'};">
            ${window.formatIDR(item.nominal)}
          </td>
          <td>
            <span class="badge ${isPaid ? 'success' : 'warning'}">
              ${isPaid ? '✅ Lunas' : '🟡 Menunggu Bayar'}
            </span>
          </td>
          <td style="text-align:center;">
            <div style="display:inline-flex; align-items:center; gap:4px;">
              ${!isPaid ? `
                <button type="button" class="btn btn-xs success" onclick="window.payOpexViaTransfer('${item.id}')" title="Bayar Transfer Langsung">
                  <i class="fa-solid fa-money-bill-transfer"></i> Bayar
                </button>
              ` : `
                <button type="button" class="btn btn-xs" onclick="window.showOpexPaidReceipt('${item.id}')" title="Lihat Bukti Transfer">
                  <i class="fa-solid fa-receipt"></i> Bukti
                </button>
              `}
              <button type="button" class="btn btn-xs outline" onclick="window.openEditOpexModal('${item.id}')" title="Edit Data">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn btn-xs outline text-danger" onclick="window.deleteOpex('${item.id}')" title="Hapus Data" style="color:#EF4444;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    window.setupTablePagination('tableOpex', 5);
  };

  window.filterOpexTable = function() {
    const cat = document.getElementById('filterOpexCategory')?.value || 'all';
    const search = (document.getElementById('searchOpexInput')?.value || '').toLowerCase().trim();
    const tbody = document.getElementById('opexTableBody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(r => {
      const rowCat = (r.getAttribute('data-category') || '').toLowerCase();
      const text = r.textContent.toLowerCase();
      const catMatch = (cat === 'all' || rowCat.includes(cat.toLowerCase()));
      const searchMatch = (!search || text.includes(search));

      if (catMatch && searchMatch) {
        r.removeAttribute('data-filtered-out');
      } else {
        r.setAttribute('data-filtered-out', 'true');
      }
    });

    window.setupTablePagination('tableOpex', 5);
  };

  window.submitOpexForm = function(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('opex-add-name')?.value;
    const recipient = document.getElementById('opex-add-recipient')?.value;
    const category = document.getElementById('opex-add-category')?.value;
    const amount = parseFloat(document.getElementById('opex-add-amount')?.value) || 0;
    const bankId = document.getElementById('opex-add-bank')?.value || 'BCA';
    const date = document.getElementById('opex-add-date')?.value || new Date().toISOString().split('T')[0];
    const status = document.getElementById('opex-add-status')?.value || 'Terbayar';

    const newId = `OPX-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(opexList.length + 1).padStart(2, '0')}`;

    const newOpex = {
      id: newId,
      date,
      time: '12:00:00',
      day: 'Hari Ini',
      name,
      category,
      nominal: amount,
      bankId,
      recipient,
      targetAccount: `${bankId} a/n ${recipient}`,
      status,
      notes: `Pengeluaran operasional ${name}`
    };

    opexList.unshift(newOpex);

    // If status is Terbayar, deduct bank balance
    if (status === 'Terbayar' && BANK_ACCOUNTS_MASTER[bankId]) {
      BANK_ACCOUNTS_MASTER[bankId].balance -= amount;
      window.syncBankBalancesUI();
      window.addJournalEntry({
        date,
        ref: `JRN-OPX-${newId}`,
        title: `Pembayaran Beban OPEX: ${name} (${recipient})`,
        source: 'opex',
        debitAccount: '6102 - Beban Operasional Kantor',
        creditAccount: `${BANK_ACCOUNTS_MASTER[bankId].code} - ${BANK_ACCOUNTS_MASTER[bankId].name}`,
        amount
      });
    }

    window.closeFinanceModal('modalCreateOpex');
    window.renderOpexTable();
    window.showFinanceToast(`✅ Biaya Operasional ${newId} (${name}) senilai ${window.formatIDR(amount)} berhasil disimpan!`, 'success');
  };

  window.openEditOpexModal = function(id) {
    const item = opexList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('opex-edit-id').value = item.id;
    document.getElementById('opex-edit-name').value = item.name;
    document.getElementById('opex-edit-recipient').value = item.recipient;
    document.getElementById('opex-edit-category').value = item.category;
    document.getElementById('opex-edit-amount').value = item.nominal;
    document.getElementById('opex-edit-bank').value = item.bankId;

    window.openFinanceModal('modalEditOpex');
  };

  window.submitEditOpexForm = function(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('opex-edit-id')?.value;
    const item = opexList.find(x => x.id === id);
    if (!item) return;

    item.name = document.getElementById('opex-edit-name')?.value;
    item.recipient = document.getElementById('opex-edit-recipient')?.value;
    item.category = document.getElementById('opex-edit-category')?.value;
    item.nominal = parseFloat(document.getElementById('opex-edit-amount')?.value) || item.nominal;
    item.bankId = document.getElementById('opex-edit-bank')?.value || item.bankId;

    window.closeFinanceModal('modalEditOpex');
    window.renderOpexTable();
    window.showFinanceToast(`✅ Data OPEX ${id} berhasil diperbarui!`, 'success');
  };

  window.deleteOpex = function(id) {
    const idx = opexList.findIndex(x => x.id === id);
    if (idx === -1) return;
    const item = opexList[idx];
    if (confirm(`Yakin ingin menghapus transaksi OPEX [${item.id} - ${item.name}]?`)) {
      opexList.splice(idx, 1);
      window.renderOpexTable();
      window.showFinanceToast(`🗑️ Transaksi OPEX ${id} berhasil dihapus.`, 'info');
    }
  };

  window.payOpexViaTransfer = function(id) {
    const item = opexList.find(x => x.id === id);
    if (!item) return;

    window.openUniversalTransferModal({
      type: 'opex',
      id: item.id,
      title: `Pembayaran OPEX: ${item.name}`,
      category: item.category,
      amount: item.nominal,
      recipientName: item.recipient,
      recipientBank: item.bankId,
      recipientAccount: item.targetAccount,
      defaultBankId: item.bankId,
      allowTaxDeduction: false,
      notes: `Pembayaran ${item.name} via transfer perbankan`,
      onComplete: function(txData) {
        item.status = 'Terbayar';
        item.paidFromBank = txData.sourceBank.name;
        item.paidTxRef = txData.txRef;
        window.renderOpexTable();
      }
    });
  };

  window.showOpexPaidReceipt = function(id) {
    const item = opexList.find(x => x.id === id);
    if (!item) return;
    const bank = BANK_ACCOUNTS_MASTER[item.bankId] || BANK_ACCOUNTS_MASTER['BCA'];

    window.showBankTransferReceipt({
      txRef: item.paidTxRef || `TRX-ASTA-OPX-${item.id}`,
      title: item.name,
      category: item.category,
      grossAmount: item.nominal,
      taxDeduction: 0,
      taxLabel: 'Tanpa Potongan Pajak',
      netAmount: item.nominal,
      sourceBank: bank,
      targetName: item.recipient,
      targetAccount: item.targetAccount,
      notes: item.notes || `Pembayaran biaya operasional ${item.name}`,
      timestamp: `${item.date}, ${item.time || '12:00'} WIB`,
      remainingBalance: bank.balance
    });
  };

  // ==========================================================================
  // 7. VENDOR (ACCOUNTS PAYABLE) CONTROLLER: CRUD & TRANSFER BANK
  // ==========================================================================

  let vendorList = [
    {
      id: 'VND-01',
      vendor: 'Amazon Web Services Inc.',
      invoiceNo: 'INV-AWS-2026-09',
      category: 'Infrastruktur Cloud & Server',
      project: 'Aplikasi Kasir RS Medika',
      dueDate: '2026-10-15',
      nominal: 23250000,
      nominalUsd: 1500,
      currency: 'USD',
      bankId: 'WISE',
      targetAccount: 'JPMorgan Chase (AWS US) Routing 021000021 Acc 488102941',
      status: 'Menunggu Pembayaran',
      notes: 'Tagihan server cloud production AWS & PostgreSQL RDS'
    },
    {
      id: 'VND-02',
      vendor: 'Figma Enterprise Subscription',
      invoiceNo: 'FIG-88190-26',
      category: 'Lisensi Software Design',
      project: 'Overhead IT Dev',
      dueDate: '2026-10-18',
      nominal: 12400000,
      nominalUsd: 800,
      currency: 'USD',
      bankId: 'WISE',
      targetAccount: 'Silicon Valley Bank a/n Figma Inc. Acc 88910214',
      status: 'Menunggu Pembayaran',
      notes: 'Perpanjangan 8 lisensi UI/UX designer tim produk'
    },
    {
      id: 'VND-03',
      vendor: 'PT Telkom Indonesia (IndiHome B2B)',
      invoiceNo: 'TLK-2026-10-881',
      category: 'Internet Dedicated & Network',
      project: 'Operasional Kantor',
      dueDate: '2026-10-20',
      nominal: 3500000,
      currency: 'IDR',
      bankId: 'BCA',
      targetAccount: 'Virtual Account BCA 01928-88192031 Telkom B2B',
      status: 'Menunggu Pembayaran',
      notes: 'Backup fiber optic dedicated 50Mbps'
    },
    {
      id: 'VND-04',
      vendor: 'Google Cloud Platform (GCP)',
      invoiceNo: 'GCP-INV-202609-01',
      category: 'Cloud Server & Infrastruktur',
      project: 'Web Company Profile X',
      dueDate: '2026-10-05',
      nominal: 4650000,
      nominalUsd: 300,
      currency: 'USD',
      bankId: 'WISE',
      targetAccount: 'Citibank N.A. a/n Google LLC',
      status: 'LUNAS',
      paidAt: '2026-10-05 10:30 WIB',
      notes: 'Hosting Firebase & Cloud Functions'
    },
    {
      id: 'VND-05',
      vendor: 'GitHub Enterprise Teams',
      invoiceNo: 'GH-2026-09-411',
      category: 'Software Tools & License API',
      project: 'DevOps & CI/CD',
      dueDate: '2026-10-02',
      nominal: 3100000,
      nominalUsd: 200,
      currency: 'USD',
      bankId: 'WISE',
      targetAccount: 'Wells Fargo a/n GitHub Inc.',
      status: 'LUNAS',
      paidAt: '2026-10-02 15:40 WIB',
      notes: 'Akses 25 seat developer CI/CD actions'
    }
  ];

  window.renderVendorTable = function() {
    const tbody = document.getElementById('vendorTableBody');
    if (!tbody) return;

    let html = '';
    vendorList.forEach((item, idx) => {
      const isPaid = item.status === 'LUNAS';
      const bankInfo = BANK_ACCOUNTS_MASTER[item.bankId] || { name: item.bankId };

      html += `
        <tr data-id="${item.id}" data-status="${item.status.toLowerCase()}">
          <td>
            <strong style="color:var(--text-primary); font-size:13px;">${item.vendor}</strong>
            <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${item.invoiceNo}</div>
          </td>
          <td>
            <span class="badge info">${item.project}</span>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${item.category}</div>
          </td>
          <td style="font-weight:600; color:${!isPaid ? '#EF4444' : 'var(--text-secondary)'};">
            ${item.dueDate}
          </td>
          <td style="text-align:right; font-weight:800; font-size:13px; color:var(--text-primary);">
            ${item.currency === 'USD' ? `$ ${item.nominalUsd.toLocaleString()} USD (~${window.formatIDR(item.nominal)})` : window.formatIDR(item.nominal)}
          </td>
          <td>
            <span class="badge ${isPaid ? 'success' : 'warning'}">
              ${isPaid ? '✅ Lunas' : '🟡 Menunggu Pembayaran'}
            </span>
          </td>
          <td>
            <span style="font-size:11.5px; font-weight:600; color:var(--text-secondary);">
              <i class="fa-solid fa-building-columns" style="color:var(--primary); margin-right:4px;"></i>${bankInfo.name}
            </span>
          </td>
          <td style="text-align:center;">
            <div style="display:inline-flex; align-items:center; gap:4px;">
              ${!isPaid ? `
                <button type="button" class="btn btn-xs success" onclick="window.payVendorViaTransfer('${item.id}')" title="Bayar Tagihan Vendor">
                  <i class="fa-solid fa-money-bill-transfer"></i> Bayar
                </button>
              ` : `
                <button type="button" class="btn btn-xs" onclick="window.showVendorPaidReceipt('${item.id}')" title="Lihat Bukti Transfer">
                  <i class="fa-solid fa-receipt"></i> Bukti
                </button>
              `}
              <button type="button" class="btn btn-xs outline" onclick="window.openEditVendorModal('${item.id}')" title="Edit Tagihan">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn btn-xs outline text-danger" onclick="window.deleteVendor('${item.id}')" title="Hapus Tagihan" style="color:#EF4444;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    window.setupTablePagination('tableVendor', 5);
  };

  window.filterVendorTable = function() {
    const status = document.getElementById('filterVendorStatus')?.value || 'all';
    const search = (document.getElementById('searchVendorInput')?.value || '').toLowerCase().trim();
    const tbody = document.getElementById('vendorTableBody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(r => {
      const rowStatus = r.getAttribute('data-status') || '';
      const text = r.textContent.toLowerCase();
      const statusMatch = (status === 'all' || (status === 'menunggu' && rowStatus.includes('menunggu')) || (status === 'lunas' && rowStatus.includes('lunas')));
      const searchMatch = (!search || text.includes(search));

      if (statusMatch && searchMatch) {
        r.removeAttribute('data-filtered-out');
      } else {
        r.setAttribute('data-filtered-out', 'true');
      }
    });

    window.setupTablePagination('tableVendor', 5);
  };

  window.submitVendorForm = function(e) {
    if (e) e.preventDefault();
    const vendor = document.getElementById('vnd-add-name')?.value;
    const invoiceNo = document.getElementById('vnd-add-inv')?.value;
    const project = document.getElementById('vnd-add-project')?.value;
    const category = document.getElementById('vnd-add-category')?.value;
    const amount = parseFloat(document.getElementById('vnd-add-amount')?.value) || 0;
    const dueDate = document.getElementById('vnd-add-due')?.value;
    const bankId = document.getElementById('vnd-add-bank')?.value || 'BCA';
    const targetAccount = document.getElementById('vnd-add-target')?.value || `${bankId} a/n ${vendor}`;

    const newId = `VND-${String(vendorList.length + 1).padStart(2, '0')}`;
    const newVendor = {
      id: newId,
      vendor,
      invoiceNo,
      category,
      project,
      dueDate,
      nominal: amount,
      currency: 'IDR',
      bankId,
      targetAccount,
      status: 'Menunggu Pembayaran',
      notes: `Tagihan vendor ${vendor} untuk proyek ${project}`
    };

    vendorList.unshift(newVendor);
    window.closeFinanceModal('modalCreateVendor');
    window.renderVendorTable();
    window.showFinanceToast(`✅ Tagihan vendor ${vendor} (${invoiceNo}) senilai ${window.formatIDR(amount)} berhasil dicatat di Hutang Usaha (AP)!`, 'success');
  };

  window.openEditVendorModal = function(id) {
    const item = vendorList.find(x => x.id === id);
    if (!item) return;

    document.getElementById('vnd-edit-id').value = item.id;
    document.getElementById('vnd-edit-name').value = item.vendor;
    document.getElementById('vnd-edit-inv').value = item.invoiceNo;
    document.getElementById('vnd-edit-category').value = item.category;
    document.getElementById('vnd-edit-amount').value = item.nominal;

    window.openFinanceModal('modalEditVendor');
  };

  window.submitEditVendorForm = function(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('vnd-edit-id')?.value;
    const item = vendorList.find(x => x.id === id);
    if (!item) return;

    item.vendor = document.getElementById('vnd-edit-name')?.value;
    item.invoiceNo = document.getElementById('vnd-edit-inv')?.value;
    item.category = document.getElementById('vnd-edit-category')?.value;
    item.nominal = parseFloat(document.getElementById('vnd-edit-amount')?.value) || item.nominal;

    window.closeFinanceModal('modalEditVendor');
    window.renderVendorTable();
    window.showFinanceToast(`✅ Tagihan vendor ${id} berhasil diperbarui!`, 'success');
  };

  window.deleteVendor = function(id) {
    const idx = vendorList.findIndex(x => x.id === id);
    if (idx === -1) return;
    const item = vendorList[idx];
    if (confirm(`Hapus data tagihan vendor [${item.vendor} - ${item.invoiceNo}]?`)) {
      vendorList.splice(idx, 1);
      window.renderVendorTable();
      window.showFinanceToast(`🗑️ Tagihan vendor ${id} dihapus.`, 'info');
    }
  };

  window.payVendorViaTransfer = function(id) {
    const item = vendorList.find(x => x.id === id);
    if (!item) return;

    window.openUniversalTransferModal({
      type: 'vendor',
      id: item.id,
      title: `Pembayaran Vendor: ${item.vendor} (${item.invoiceNo})`,
      category: item.category,
      amount: item.nominal,
      recipientName: item.vendor,
      recipientBank: item.bankId,
      recipientAccount: item.targetAccount,
      defaultBankId: item.bankId,
      allowTaxDeduction: true,
      defaultTaxType: 'pph23',
      notes: `Pelunasan tagihan invoice ${item.invoiceNo} (${item.vendor})`,
      onComplete: function(txData) {
        item.status = 'LUNAS';
        item.paidFromBank = txData.sourceBank.name;
        item.paidTxRef = txData.txRef;
        window.renderVendorTable();
      }
    });
  };

  window.showVendorPaidReceipt = function(id) {
    const item = vendorList.find(x => x.id === id);
    if (!item) return;
    const bank = BANK_ACCOUNTS_MASTER[item.bankId] || BANK_ACCOUNTS_MASTER['BCA'];

    window.showBankTransferReceipt({
      txRef: item.paidTxRef || `TRX-ASTA-VND-${item.id}`,
      title: item.vendor,
      category: item.category,
      grossAmount: item.nominal,
      taxDeduction: 0,
      taxLabel: 'Pajak Standar Terpotong',
      netAmount: item.nominal,
      sourceBank: bank,
      targetName: item.vendor,
      targetAccount: item.targetAccount,
      notes: item.notes || `Pembayaran invoice ${item.invoiceNo}`,
      timestamp: item.paidAt || '12 Oktober 2026, 11:30 WIB',
      remainingBalance: bank.balance
    });
  };

  // ==========================================================================
  // 8. KONTRAK & SPK FREELANCER CONTROLLER: CRUD & CAIRKAN FEE TRANSFER
  // ==========================================================================

  let freelancerContracts = [
    {
      id: 'SPK-2026/FL-014',
      name: 'Rian Pratama',
      role: 'Mobile Developer Flutter',
      project: 'Aplikasi Kasir RS Medika',
      duration: '2 Bulan (Agt - Okt 2026)',
      totalContract: 15000000,
      terminNumber: 2,
      terminTotal: 3,
      terminName: 'Termin 2 dari 3 (Slicing POS & Integrasi API)',
      amount: 5000000,
      pph21Rate: 0.025,
      pph21Amount: 125000,
      netAmount: 4875000,
      milestone: 'Slicing UI POS & Integrasi API Modul Kasir RS',
      pmStatus: 'APPROVED PM',
      pmApprover: 'Andi Setiawan (Senior PM)',
      bankTarget: 'BCA',
      accountNumber: '5410-889-221',
      accountHolder: 'Rian Pratama',
      paymentStatus: 'Siap Cair',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Deliverable sprint 4 tuntas dan disetujui PM Andi Setiawan'
    },
    {
      id: 'SPK-2026/FL-015',
      name: 'Siti Rahma',
      role: 'QA Automation Tester',
      project: 'Aplikasi Kasir RS Medika',
      duration: '1 Bulan (Okt 2026)',
      totalContract: 7000000,
      terminNumber: 1,
      terminTotal: 2,
      terminName: 'Termin 1 dari 2 (DP Awal Kontrak 50%)',
      amount: 3500000,
      pph21Rate: 0.025,
      pph21Amount: 87500,
      netAmount: 3412500,
      milestone: 'Pembuatan Script Test Automation Regression Sprint 2',
      pmStatus: 'MENUNGGU PM',
      pmApprover: 'Andi Setiawan (Senior PM)',
      bankTarget: 'Bank Mandiri',
      accountNumber: '137-00-8891-231',
      accountHolder: 'Siti Rahma',
      paymentStatus: 'Menunggu Review PM',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Sedang dalam review pengujian stress test oleh PM'
    },
    {
      id: 'SPK-2026/FL-011',
      name: 'Hana Putri',
      role: 'Frontend UI/UX Designer',
      project: 'Web Company Profile X',
      duration: '1.5 Bulan (Agt - Sep 2026)',
      totalContract: 9500000,
      terminNumber: 3,
      terminTotal: 3,
      terminName: 'Termin 3 (Pelunasan & Final Assets)',
      amount: 4750000,
      pph21Rate: 0.025,
      pph21Amount: 118750,
      netAmount: 4631250,
      milestone: 'Penyelesaian Final Mockup, Katalog & Checkout Flow',
      pmStatus: 'APPROVED PM',
      pmApprover: 'Bagas Prakoso (Tech Lead)',
      bankTarget: 'BCA',
      accountNumber: '088-771-9920',
      accountHolder: 'Hana Putri',
      paymentStatus: 'LUNAS',
      paidAt: '2026-09-30 11:20 WIB',
      paidFromBank: 'BCA Utama Operasional',
      paidTxRef: 'TRX-ASTA-20260930-0192',
      notes: 'Lunas ditransfer setelah final sign-off assets desain'
    },
    {
      id: 'SPK-2026/FL-016',
      name: 'Deni Kurniawan',
      role: 'Backend Golang Specialist',
      project: 'Samudera Logistik Tracking System',
      duration: '3 Bulan (Okt - Des 2026)',
      totalContract: 24000000,
      terminNumber: 1,
      terminTotal: 4,
      terminName: 'Termin 1 dari 4 (DP Kontrak 25%)',
      amount: 6000000,
      pph21Rate: 0.025,
      pph21Amount: 150000,
      netAmount: 5850000,
      milestone: 'Arsitektur Database Tracking GPS & Microservice Setup',
      pmStatus: 'APPROVED PM',
      pmApprover: 'Andi Setiawan (Senior PM)',
      bankTarget: 'Bank BNI',
      accountNumber: '041-882-9901',
      accountHolder: 'Deni Kurniawan',
      paymentStatus: 'Siap Cair',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Kick-off arsitektur backend selesai divalidasi PM'
    },
    {
      id: 'SPK-2026/FL-017',
      name: 'Ahmad Faisal',
      role: 'DevOps & Cloud Engineer',
      project: 'PT Mitra Perkasa HRIS',
      duration: '2 Bulan (Okt - Nov 2026)',
      totalContract: 12000000,
      terminNumber: 1,
      terminTotal: 2,
      terminName: 'Termin 1 dari 2 (DP Setup Server 50%)',
      amount: 6000000,
      pph21Rate: 0.025,
      pph21Amount: 150000,
      netAmount: 5850000,
      milestone: 'Setup CI/CD Pipeline & Kubernetes Cluster',
      pmStatus: 'MENUNGGU PM',
      pmApprover: 'Bagas Prakoso (Tech Lead)',
      bankTarget: 'BCA',
      accountNumber: '882-019-4451',
      accountHolder: 'Ahmad Faisal',
      paymentStatus: 'Menunggu Review PM',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: 'Konfigurasi cluster staging sedang ditinjau PM'
    }
  ];

  window.renderFreelancerTable = function() {
    const tbody = document.getElementById('freelancerTableBody');
    if (!tbody) return;

    let html = '';
    freelancerContracts.forEach((item, idx) => {
      const isPaid = item.paymentStatus === 'LUNAS' || item.paidAt !== null;
      const isApproved = item.pmStatus === 'APPROVED PM';

      html += `
        <tr data-id="${item.id}" data-pm-status="${item.pmStatus}">
          <td>
            <div>
              <strong style="color:var(--text-primary);">${item.name}</strong>
              <span class="tax-tag ppn" style="margin-left:6px; font-size:10px;"><i class="fa-solid fa-file-signature"></i> ${item.id}</span>
            </div>
            <div style="font-size:10.5px; color:var(--text-muted);">${item.role} • ${item.duration}</div>
          </td>
          <td><span class="badge info">${item.project}</span></td>
          <td>
            <div style="font-size:12px; font-weight:600; color:var(--text-primary);">${item.milestone}</div>
            <div style="font-size:10.5px; color:var(--text-muted);">Reviewer: ${item.pmApprover}</div>
          </td>
          <td style="text-align:center;">
            <span class="badge ${isApproved ? 'success' : 'neutral'}" style="font-weight:700;">${item.terminName.split(' (')[0]}</span>
          </td>
          <td style="text-align:right;">
            <strong style="font-size:13px; color:var(--text-primary);">${window.formatIDR(item.amount)}</strong>
            <div style="font-size:10.5px; color:#059669;">Net: ${window.formatIDR(item.netAmount || item.amount * 0.975)}</div>
          </td>
          <td>
            ${isPaid ? `
              <span class="badge success"><i class="fa-solid fa-check-circle"></i> ✅ LUNAS (Ditransfer)</span>
            ` : isApproved ? `
              <span class="badge success"><i class="fa-solid fa-circle-check"></i> ✅ APPROVED PM (Siap Cair)</span>
            ` : `
              <span class="badge warning"><i class="fa-solid fa-hourglass-half"></i> 🟡 MENUNGGU PM</span>
            `}
          </td>
          <td>
            <div style="font-size:11.5px; font-weight:700; color:var(--text-primary);">${item.bankTarget} - ${item.accountNumber}</div>
            <div style="font-size:10.5px; color:var(--text-muted);">a/n ${item.accountHolder}</div>
          </td>
          <td style="text-align:center;">
            <div style="display:inline-flex; align-items:center; gap:4px; flex-wrap:wrap; justify-content:center;">
              ${!isPaid && isApproved ? `
                <button type="button" class="btn btn-xs success" onclick="window.cairkanFeeFreelance('${item.id}')" title="Cairkan Fee Freelance via Transfer Bank">
                  <i class="fa-solid fa-money-bill-transfer"></i> Cairkan Fee
                </button>
              ` : isPaid ? `
                <button type="button" class="btn btn-xs" onclick="window.showFreelancerPaidReceipt('${item.id}')" title="Lihat Bukti Transfer">
                  <i class="fa-solid fa-receipt"></i> Bukti
                </button>
              ` : `
                <button type="button" class="btn btn-xs outline" onclick="window.simulatePmApproveFreelancer('${item.id}')" title="Simulasikan Approval PM">
                  <i class="fa-solid fa-user-check"></i> Approve PM
                </button>
              `}
              <button type="button" class="btn btn-xs outline" onclick="window.viewFreelancerContractDetail('${item.id}')" title="Lihat Dokumen SPK">
                <i class="fa-solid fa-eye"></i> SPK
              </button>
              <button type="button" class="btn btn-xs outline" onclick="window.openEditFreelancerModal('${item.id}')" title="Edit Kontrak">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn btn-xs outline text-danger" onclick="window.deleteFreelancerContract('${item.id}')" title="Hapus Kontrak" style="color:#EF4444;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    window.setupTablePagination('tableFreelancer', 5);
  };

  window.filterFreelancerTable = function() {
    const status = document.getElementById('filterFreelancerPmStatus')?.value || 'all';
    const search = (document.getElementById('searchFreelancerInput')?.value || '').toLowerCase().trim();
    const tbody = document.getElementById('freelancerTableBody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(r => {
      const rowStatus = r.getAttribute('data-pm-status') || '';
      const text = r.textContent.toLowerCase();
      const statusMatch = (status === 'all' || 
                           (status === 'APPROVED PM' && rowStatus === 'APPROVED PM' && !text.includes('lunas')) ||
                           (status === 'MENUNGGU PM' && rowStatus === 'MENUNGGU PM') ||
                           (status === 'LUNAS' && text.includes('lunas')));
      const searchMatch = (!search || text.includes(search));

      if (statusMatch && searchMatch) {
        r.removeAttribute('data-filtered-out');
      } else {
        r.setAttribute('data-filtered-out', 'true');
      }
    });

    window.setupTablePagination('tableFreelancer', 5);
  };

  window.submitFreelanceContract = function(e) {
    if (e) e.preventDefault();
    const spk = document.getElementById('fl-spk')?.value;
    const project = document.getElementById('fl-project')?.value;
    const name = document.getElementById('fl-name')?.value;
    const role = document.getElementById('fl-role')?.value;
    const duration = document.getElementById('fl-duration')?.value || '2 Bulan';
    const totalContract = parseFloat(document.getElementById('fl-total-contract')?.value) || 12000000;
    const amount = parseFloat(document.getElementById('fl-amount')?.value) || 0;
    const termin = document.getElementById('fl-termin')?.value;
    const pmStatus = document.getElementById('fl-pm-status')?.value || 'APPROVED PM';
    const bankTarget = document.getElementById('fl-bank')?.value || 'BCA';
    const accountNumber = document.getElementById('fl-acc-number')?.value || '5410-092-881';
    const accountHolder = document.getElementById('fl-acc-holder')?.value || name;
    const milestone = document.getElementById('fl-milestone')?.value;

    const pph21Amount = Math.round(amount * 0.025);
    const netAmount = amount - pph21Amount;

    const newContract = {
      id: spk,
      name,
      role,
      project,
      duration,
      totalContract,
      terminNumber: 1,
      terminTotal: 2,
      terminName: termin,
      amount,
      pph21Rate: 0.025,
      pph21Amount,
      netAmount,
      milestone,
      pmStatus,
      pmApprover: project.includes('RS Medika') ? 'Andi Setiawan (Senior PM)' : 'Bagas Prakoso (Tech Lead)',
      bankTarget,
      accountNumber,
      accountHolder,
      paymentStatus: pmStatus === 'APPROVED PM' ? 'Siap Cair' : 'Menunggu Review PM',
      paidAt: null,
      paidFromBank: null,
      paidTxRef: null,
      notes: `Kontrak SPK baru untuk ${name} (${role})`
    };

    freelancerContracts.unshift(newContract);
    window.closeFinanceModal('modalCreateFreelancer');
    window.renderFreelancerTable();
    window.showFinanceToast(`✅ Dokumen Kontrak SPK (${spk}) untuk ${name} senilai ${window.formatIDR(amount)} berhasil diterbitkan!`, 'success');
  };

  window.openEditFreelancerModal = function(id) {
    const item = freelancerContracts.find(x => x.id === id);
    if (!item) return;

    document.getElementById('fl-edit-id').value = item.id;
    document.getElementById('fl-edit-name').value = item.name;
    document.getElementById('fl-edit-role').value = item.role;
    document.getElementById('fl-edit-amount').value = item.amount;
    document.getElementById('fl-edit-pm-status').value = item.pmStatus;
    document.getElementById('fl-edit-milestone').value = item.milestone;
    document.getElementById('fl-edit-bank').value = item.bankTarget;
    document.getElementById('fl-edit-acc').value = `${item.accountNumber} a/n ${item.accountHolder}`;

    window.openFinanceModal('modalEditFreelancer');
  };

  window.submitEditFreelanceContract = function(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('fl-edit-id')?.value;
    const item = freelancerContracts.find(x => x.id === id);
    if (!item) return;

    item.name = document.getElementById('fl-edit-name')?.value;
    item.role = document.getElementById('fl-edit-role')?.value;
    item.amount = parseFloat(document.getElementById('fl-edit-amount')?.value) || item.amount;
    item.pmStatus = document.getElementById('fl-edit-pm-status')?.value;
    item.milestone = document.getElementById('fl-edit-milestone')?.value;
    item.bankTarget = document.getElementById('fl-edit-bank')?.value;
    item.pph21Amount = Math.round(item.amount * 0.025);
    item.netAmount = item.amount - item.pph21Amount;

    if (item.pmStatus === 'APPROVED PM' && !item.paidAt) {
      item.paymentStatus = 'Siap Cair';
    }

    window.closeFinanceModal('modalEditFreelancer');
    window.renderFreelancerTable();
    window.showFinanceToast(`✅ Dokumen Kontrak ${id} berhasil diperbarui!`, 'success');
  };

  window.deleteFreelancerContract = function(id) {
    const idx = freelancerContracts.findIndex(x => x.id === id);
    if (idx === -1) return;
    const item = freelancerContracts[idx];
    if (confirm(`Hapus kontrak SPK [${item.id} - ${item.name}]?`)) {
      freelancerContracts.splice(idx, 1);
      window.renderFreelancerTable();
      window.showFinanceToast(`🗑️ Kontrak SPK ${id} dihapus.`, 'info');
    }
  };

  window.simulatePmApproveFreelancer = function(id) {
    const item = freelancerContracts.find(x => x.id === id);
    if (!item) return;
    item.pmStatus = 'APPROVED PM';
    item.paymentStatus = 'Siap Cair';
    window.renderFreelancerTable();
    window.showFinanceToast(`🎉 Deliverable SPK ${id} (${item.name}) resmi di-approve oleh PM! Status berubah menjadi Siap Cair.`, 'success');
  };

  window.viewFreelancerContractDetail = function(id) {
    const item = freelancerContracts.find(x => x.id === id);
    if (!item) return;

    const body = document.getElementById('freelancerDetailBody');
    if (!body) return;

    body.innerHTML = `
      <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:10px; padding:16px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--border-light); padding-bottom:12px; margin-bottom:12px;">
          <div>
            <span class="badge info" style="font-family:var(--font-mono); font-weight:700;">${item.id}</span>
            <h4 style="font-size:16px; font-weight:800; color:var(--text-primary); margin-top:4px;">${item.name} — ${item.role}</h4>
            <span style="font-size:12px; color:var(--text-muted);">${item.project} • Durasi: <strong>${item.duration}</strong></span>
          </div>
          <span class="badge ${item.pmStatus === 'APPROVED PM' ? 'success' : 'warning'}">
            ${item.pmStatus}
          </span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; font-size:12.5px;">
          <div>
            <span style="color:var(--text-muted); font-size:11px;">Total Nilai Kontrak SPK:</span>
            <strong style="display:block; font-size:14px; color:var(--text-primary);">${window.formatIDR(item.totalContract)}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px;">Termin Saat Ini:</span>
            <strong style="display:block; font-size:14px; color:var(--primary);">${item.terminName}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px;">Nominal Fee Termin (Gross):</span>
            <strong style="display:block; color:#EF4444;">${window.formatIDR(item.amount)}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:11px;">Estimasi Net (Potong PPh 21 2.5%):</span>
            <strong style="display:block; color:#059669; font-size:14px;">${window.formatIDR(item.netAmount || item.amount * 0.975)}</strong>
          </div>
        </div>
      </div>

      <div style="border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:14px; background:#fff;">
        <strong style="font-size:12px; color:var(--text-primary); display:block; margin-bottom:6px;">
          <i class="fa-solid fa-list-check" style="color:#10B981; margin-right:5px;"></i> Deliverable / Milestone Acuan Modul PM:
        </strong>
        <p style="font-size:12.5px; color:var(--text-secondary); margin:0;">${item.milestone}</p>
        <div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
          Divalidasi oleh: <strong>${item.pmApprover}</strong>
        </div>
      </div>

      <div style="border:1px solid var(--border); border-radius:10px; padding:14px; background:#F8FAFC;">
        <strong style="font-size:12px; color:var(--text-primary); display:block; margin-bottom:6px;">
          <i class="fa-solid fa-building-columns" style="color:var(--primary); margin-right:5px;"></i> Rekening Tujuan Transfer Freelancer:
        </strong>
        <div style="font-size:13px; font-weight:700; color:var(--text-primary);">
          ${item.bankTarget} • <span style="font-family:var(--font-mono); color:#059669;">${item.accountNumber}</span>
        </div>
        <div style="font-size:11.5px; color:var(--text-muted);">Atas Nama: <strong>${item.accountHolder}</strong></div>
      </div>
    `;

    window.openFinanceModal('modalDetailFreelancer');
  };

  window.cairkanFeeFreelance = function(id) {
    const item = freelancerContracts.find(x => x.id === id);
    if (!item) return;

    window.openUniversalTransferModal({
      type: 'freelancer',
      id: item.id,
      title: `Pencairan Fee Freelance: ${item.name} (${item.id})`,
      category: `HPP Proyek (${item.project})`,
      amount: item.amount,
      recipientName: item.name,
      recipientBank: item.bankTarget,
      recipientAccount: `${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}`,
      defaultBankId: 'BCA',
      allowTaxDeduction: true,
      defaultTaxType: 'pph21',
      notes: `Pencairan fee ${item.terminName} - ${item.milestone}`,
      onComplete: function(txData) {
        item.paymentStatus = 'LUNAS';
        item.paidAt = txData.timestamp;
        item.paidFromBank = txData.sourceBank.name;
        item.paidTxRef = txData.txRef;
        window.renderFreelancerTable();
      }
    });
  };

  window.showFreelancerPaidReceipt = function(id) {
    const item = freelancerContracts.find(x => x.id === id);
    if (!item) return;
    const bank = BANK_ACCOUNTS_MASTER['BCA'];

    window.showBankTransferReceipt({
      txRef: item.paidTxRef || `TRX-ASTA-FL-${item.id}`,
      title: `Fee Freelance: ${item.name}`,
      category: `HPP Proyek (${item.project})`,
      grossAmount: item.amount,
      taxDeduction: item.pph21Amount || Math.round(item.amount * 0.025),
      taxLabel: 'PPh 21 (2.5%) Tenaga Ahli',
      netAmount: item.netAmount || (item.amount - Math.round(item.amount * 0.025)),
      sourceBank: bank,
      targetName: item.name,
      targetAccount: `${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}`,
      notes: item.notes || `Pembayaran termin ${item.terminName}`,
      timestamp: item.paidAt || '12 Oktober 2026, 14:15 WIB',
      remainingBalance: bank.balance
    });
  };

  // ==========================================================================
  // 9. UNIVERSAL BANK DISBURSEMENT ENGINE & DIGITAL TRANSFER RECEIPT
  // ==========================================================================

  let currentTransferConfig = null;

  window.openUniversalTransferModal = function(config) {
    currentTransferConfig = config;

    const titleEl = document.getElementById('trf-title');
    const recipEl = document.getElementById('trf-recipient');
    const targetAccEl = document.getElementById('trf-target-account');
    const grossEl = document.getElementById('trf-gross-display');
    const selectBank = document.getElementById('trf-source-bank-select');
    const taxSelect = document.getElementById('trf-tax-option');
    const notesEl = document.getElementById('trf-notes-input');

    if (titleEl) titleEl.textContent = config.title;
    if (recipEl) recipEl.textContent = config.recipientName;
    if (targetAccEl) targetAccEl.textContent = config.recipientAccount;
    if (grossEl) grossEl.value = window.formatIDR(config.amount);
    if (notesEl) notesEl.value = config.notes || '';

    // Populate Source Bank Dropdown with real-time balance
    if (selectBank) {
      let optionsHtml = '';
      for (const [key, bank] of Object.entries(BANK_ACCOUNTS_MASTER)) {
        const isSelected = key === (config.defaultBankId || 'BCA');
        const formattedBal = bank.currency === 'USD' ? 
          `$ ${bank.balanceUsd.toLocaleString()} USD (~${window.formatIDR(bank.balance)})` : 
          window.formatIDR(bank.balance);
        optionsHtml += `<option value="${key}" ${isSelected ? 'selected' : ''}>${bank.name} (${bank.number}) — Saldo: ${formattedBal}</option>`;
      }
      selectBank.innerHTML = optionsHtml;
    }

    if (taxSelect) {
      taxSelect.value = config.defaultTaxType || 'none';
    }

    window.onTransferSourceBankChange(selectBank ? selectBank.value : 'BCA');
    window.recalculateTransferNet();
    window.openFinanceModal('modalTransferKasBank');
  };

  window.onTransferSourceBankChange = function(bankId) {
    const bank = BANK_ACCOUNTS_MASTER[bankId] || BANK_ACCOUNTS_MASTER['BCA'];
    const curBalEl = document.getElementById('trf-current-balance');
    if (curBalEl) {
      curBalEl.textContent = bank.currency === 'USD' ? 
        `$ ${bank.balanceUsd.toLocaleString()} USD (~${window.formatIDR(bank.balance)})` : 
        window.formatIDR(bank.balance);
    }
  };

  window.recalculateTransferNet = function() {
    if (!currentTransferConfig) return;
    const gross = currentTransferConfig.amount;
    const taxType = document.getElementById('trf-tax-option')?.value || 'none';

    let taxAmount = 0;
    let taxLabel = 'Tanpa Potongan Pajak (0%)';

    if (taxType === 'pph21') {
      taxAmount = Math.round(gross * 0.025); // 2.5% PPh 21 Tenaga Ahli
      taxLabel = `- ${window.formatIDR(taxAmount)} (PPh 21 2.5%)`;
    } else if (taxType === 'pph23') {
      taxAmount = Math.round(gross * 0.02); // 2% PPh 23 Jasa
      taxLabel = `- ${window.formatIDR(taxAmount)} (PPh 23 2.0%)`;
    }

    const netAmount = gross - taxAmount;

    const taxDisplay = document.getElementById('trf-tax-deduction-display');
    const netDisplay = document.getElementById('trf-net-transfer-display');

    if (taxDisplay) taxDisplay.textContent = taxLabel;
    if (netDisplay) netDisplay.textContent = window.formatIDR(netAmount);

    currentTransferConfig.calculatedTax = taxAmount;
    currentTransferConfig.calculatedTaxLabel = taxLabel;
    currentTransferConfig.calculatedNet = netAmount;
  };

  window.confirmAndExecuteBankTransfer = function(e) {
    if (e) e.preventDefault();
    if (!currentTransferConfig) return;

    const sourceBankId = document.getElementById('trf-source-bank-select')?.value || 'BCA';
    const sourceBank = BANK_ACCOUNTS_MASTER[sourceBankId];
    const notes = document.getElementById('trf-notes-input')?.value || currentTransferConfig.notes;
    const netAmount = currentTransferConfig.calculatedNet || currentTransferConfig.amount;
    const taxAmount = currentTransferConfig.calculatedTax || 0;

    if (!sourceBank) return;

    if (sourceBank.balance < netAmount) {
      window.showFinanceToast(`⚠️ Saldo di rekening ${sourceBank.name} tidak mencukupi untuk transfer ${window.formatIDR(netAmount)}!`, 'error');
      return;
    }

    // Deduct Balance
    sourceBank.balance -= netAmount;
    if (sourceBank.currency === 'USD') {
      sourceBank.balanceUsd = Math.round(sourceBank.balance / 15500);
    }

    const now = new Date();
    const timestampStr = `${now.getDate()} Oktober 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const txRef = `TRX-ASTA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Create journal entry automatically
    window.addJournalEntry({
      date: '2026-10-12',
      ref: `JRN-${txRef.slice(-8)}`,
      title: `${currentTransferConfig.title} - ${currentTransferConfig.recipientName}`,
      source: currentTransferConfig.type === 'freelancer' ? 'ap' : currentTransferConfig.type === 'vendor' ? 'ap' : 'opex',
      debitAccount: currentTransferConfig.type === 'freelancer' ? '5101 - Beban Tenaga Lepas (Freelance HPP)' : currentTransferConfig.type === 'vendor' ? '2101 - Hutang Usaha / Vendor' : currentTransferConfig.type === 'payroll' ? '6101 - Beban Gaji & Upah Karyawan' : '6102 - Beban Operasional Kantor',
      creditAccount: `${sourceBank.code} - ${sourceBank.name}`,
      amount: netAmount
    });

    // Execute callback
    const txData = {
      txRef,
      timestamp: timestampStr,
      sourceBank,
      targetName: currentTransferConfig.recipientName,
      targetAccount: currentTransferConfig.recipientAccount,
      grossAmount: currentTransferConfig.amount,
      taxDeduction: taxAmount,
      taxLabel: currentTransferConfig.calculatedTaxLabel,
      netAmount,
      notes,
      category: currentTransferConfig.category || 'Pengeluaran Kas/Bank'
    };

    if (typeof currentTransferConfig.onComplete === 'function') {
      currentTransferConfig.onComplete(txData);
    }

    // Sync UI
    window.syncBankBalancesUI();
    window.closeFinanceModal('modalTransferKasBank');

    // Pop open official digital receipt
    setTimeout(() => {
      window.showBankTransferReceipt(txData);
      window.showFinanceToast(`✅ Transfer sebesar ${window.formatIDR(netAmount)} ke [${currentTransferConfig.recipientName}] berhasil dieksekusi via ${sourceBank.name}!`, 'success');
    }, 250);
  };

  window.showBankTransferReceipt = function(txData) {
    activeLastTransferData = txData;
    const refFooter = document.getElementById('receipt-ref-footer');
    if (refFooter) refFooter.textContent = txData.txRef;
    const nomEl = document.getElementById('receipt-nominal');
    const timeEl = document.getElementById('receipt-timestamp');
    const refEl = document.getElementById('receipt-ref');
    const catEl = document.getElementById('receipt-category');
    const grossEl = document.getElementById('receipt-gross');
    const taxEl = document.getElementById('receipt-tax');
    const srcAccEl = document.getElementById('receipt-source-acc');
    const srcNumEl = document.getElementById('receipt-source-num');
    const tgtNameEl = document.getElementById('receipt-target-name');
    const tgtAccEl = document.getElementById('receipt-target-acc');
    const notesEl = document.getElementById('receipt-notes');
    const remBalEl = document.getElementById('receipt-remaining-balance');

    if (nomEl) nomEl.textContent = window.formatIDR(txData.netAmount);
    if (timeEl) timeEl.textContent = txData.timestamp;
    if (refEl) refEl.textContent = txData.txRef;
    if (catEl) catEl.textContent = txData.category;
    if (grossEl) grossEl.textContent = window.formatIDR(txData.grossAmount);
    if (taxEl) taxEl.textContent = txData.taxDeduction > 0 ? `- ${window.formatIDR(txData.taxDeduction)} (${txData.taxLabel})` : 'Tanpa Potongan Pajak (0%)';
    if (srcAccEl) srcAccEl.textContent = txData.sourceBank.name;
    if (srcNumEl) srcNumEl.textContent = txData.sourceBank.number;
    if (tgtNameEl) tgtNameEl.textContent = txData.targetName;
    if (tgtAccEl) tgtAccEl.textContent = txData.targetAccount;
    if (notesEl) notesEl.textContent = txData.notes;
    if (remBalEl) remBalEl.textContent = window.formatIDR(txData.sourceBank.balance);

    window.openFinanceModal('modalDetailTransaksiBank');
  };

  window.printTransferReceipt = function() {
    window.print();
  };

  // ==========================================================================
  // 10. SIMPLIFIED GENERAL JOURNAL (JURNAL UMUM SEDERHANA & TERPADU)
  // ==========================================================================

  let journalEntries = [
    {
      id: 'JRN-2026-001',
      date: '04 Okt 2026',
      title: 'Pelunasan Termin 1 RS Medika (Aplikasi Kasir RS)',
      source: 'ar',
      debitCode: '1102',
      debitAccount: 'Bank BCA Operasional',
      creditCode: '1103',
      creditAccount: 'Piutang Usaha (AR Invoice)',
      amount: 30000000,
      badge: 'Auto-Generated (AR)'
    },
    {
      id: 'JRN-2026-002',
      date: '03 Okt 2026',
      title: 'Pembayaran Tagihan Vendor AWS Cloud Hosting',
      source: 'ap',
      debitCode: '5102',
      debitAccount: 'HPP - Sewa Server & Cloud Hosting',
      creditCode: '1102',
      creditAccount: 'Bank BCA Operasional',
      amount: 23250000,
      badge: 'Auto-Generated (AP)'
    },
    {
      id: 'JRN-2026-003',
      date: '02 Okt 2026',
      title: 'Pembayaran Freelance Subkon (Rian Pratama - UI Design RS Medika)',
      source: 'ap',
      debitCode: '5101',
      debitAccount: 'Beban Tenaga Lepas (Freelancer HPP)',
      creditCode: '1102',
      creditAccount: 'Bank BCA Operasional',
      amount: 15000000,
      badge: 'Auto-Generated (SPK Freelance)'
    },
    {
      id: 'JRN-2026-004',
      date: '01 Okt 2026',
      title: 'Distribusi Payroll Gaji 6 Karyawan Tetap (Modul HR)',
      source: 'hr',
      debitCode: '6101',
      debitAccount: 'Beban Gaji & Tunjangan Karyawan (OPEX)',
      creditCode: '1104',
      creditAccount: 'Bank Mandiri Payroll',
      amount: 89850000,
      badge: 'Auto-Generated (HR/Payroll)'
    },
    {
      id: 'JRN-2026-005',
      date: '01 Okt 2026',
      title: 'Penyetoran Modal Disetor Awal Pendiri Perusahaan',
      source: 'trf',
      debitCode: '1102',
      debitAccount: 'Bank BCA Operasional',
      creditCode: '3101',
      creditAccount: 'Modal Disetor Pendiri',
      amount: 500000000,
      badge: 'Auto-Generated (Modal)'
    },
    {
      id: 'JRN-2026-006',
      date: '02 Okt 2026',
      title: 'Pembayaran Beban Internet Biznet Dedicated Kantor',
      source: 'opex',
      debitCode: '6102',
      debitAccount: 'Beban Utilitas, Internet & Listrik',
      creditCode: '1102',
      creditAccount: 'Bank BCA Operasional',
      amount: 2750000,
      badge: 'Auto-Generated (OPEX)'
    },
    {
      id: 'JRN-2026-007',
      date: '05 Okt 2026',
      title: 'Pengisian Kas Kecil Kantor (Petty Cash Replenishment)',
      source: 'trf',
      debitCode: '1101',
      debitAccount: 'Kas Kecil (Petty Cash)',
      creditCode: '1102',
      creditAccount: 'Bank BCA Operasional',
      amount: 5000000,
      badge: 'Auto-Generated (Mutasi Bank)'
    },
    {
      id: 'JRN-2026-008',
      date: '12 Okt 2026',
      title: 'Pelunasan Invoice INV-2610-003 (PT Alpha Global - Web Profile)',
      source: 'ar',
      debitCode: '1102',
      debitAccount: 'Bank BCA Operasional',
      creditCode: '1103',
      creditAccount: 'Piutang Usaha (AR Invoice)',
      amount: 35000000,
      badge: 'Auto-Generated (AR)'
    }
  ];

  window.addJournalEntry = function(entry) {
    const newId = `JRN-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;
    const newEntry = {
      id: newId,
      date: entry.date || '12 Okt 2026',
      title: entry.title,
      source: entry.source || 'opex',
      debitCode: entry.debitAccount.split(' - ')[0],
      debitAccount: entry.debitAccount.split(' - ')[1] || entry.debitAccount,
      creditCode: entry.creditAccount.split(' - ')[0],
      creditAccount: entry.creditAccount.split(' - ')[1] || entry.creditAccount,
      amount: entry.amount,
      badge: `Auto-Generated (${(entry.source || 'sys').toUpperCase()})`
    };
    journalEntries.unshift(newEntry);
    window.renderJournalTable();
  };

  window.renderJournalTable = function() {
    const tbody = document.getElementById('generalJournalTableBody');
    if (!tbody) return;

    let html = '';
    journalEntries.forEach((item, idx) => {
      const sourceBadgeColor = item.source === 'ar' ? 'success' : item.source === 'ap' ? 'warning' : item.source === 'hr' ? 'purple' : 'info';

      html += `
        <tr data-id="${item.id}" data-source="${item.source}">
          <td>
            <span class="badge info" style="font-family:var(--font-mono); font-weight:700;">${item.id}</span>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${item.date}</div>
          </td>
          <td>
            <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">
              ${item.title}
            </div>
            <!-- Debit Row -->
            <div style="display:flex; align-items:center; gap:8px; font-size:12px; margin-bottom:2px;">
              <span style="font-family:var(--font-mono); font-weight:700; color:var(--primary);">${item.debitCode}</span>
              <strong style="color:var(--text-primary);">${item.debitAccount}</strong>
            </div>
            <!-- Credit Row with Indentation -->
            <div style="display:flex; align-items:center; gap:8px; font-size:12px; padding-left:18px; color:var(--text-secondary);">
              <span style="font-family:var(--font-mono); font-weight:700; color:var(--primary);">${item.creditCode}</span>
              <span>└ ${item.creditAccount}</span>
            </div>
          </td>
          <td style="text-align:center;">
            <span class="badge ${sourceBadgeColor}" style="font-size:10px; text-transform:uppercase;">${item.source.toUpperCase()}</span>
          </td>
          <td style="text-align:right;">
            <div style="font-weight:800; color:#10B981; font-size:13px;">${window.formatIDR(item.amount)}</div>
            <div style="font-size:11px; color:var(--text-muted);">-</div>
          </td>
          <td style="text-align:right;">
            <div style="font-size:11px; color:var(--text-muted);">-</div>
            <div style="font-weight:800; color:#8B5CF6; font-size:13px;">${window.formatIDR(item.amount)}</div>
          </td>
          <td style="text-align:center;">
            <span class="badge success" style="font-size:10.5px;"><i class="fa-solid fa-circle-check"></i> Balanced</span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    window.setupTablePagination('tableGeneralJournal', 5);
  };

  window.parseJournalEntryDate = function(dateStr) {
    if (!dateStr) return new Date();
    // Handles formats like '04 Okt 2026', '12 Okt 2026', or '2026-10-04'
    if (dateStr.includes('-')) return new Date(dateStr);
    const months = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'jun': '06',
      'jul': '07', 'agu': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12'
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length >= 3) {
      const d = parts[0].padStart(2, '0');
      const m = months[parts[1].toLowerCase().slice(0, 3)] || '10';
      const y = parts[2];
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date();
  };

  window.resetJournalFilters = function() {
    const sDate = document.getElementById('journalStartDate');
    const eDate = document.getElementById('journalEndDate');
    const fType = document.getElementById('journalFilterType');
    const sInput = document.getElementById('journalSearchInput');

    if (sDate) sDate.value = '2026-10-01';
    if (eDate) eDate.value = '2026-10-31';
    if (fType) fType.value = 'all';
    if (sInput) sInput.value = '';

    window.filterJournalEntries();
    window.showFinanceToast('🔄 Filter tanggal dan modul Jurnal Umum di-reset ke default.', 'info');
  };

  window.filterJournalEntries = function(filterVal) {
    const filter = filterVal !== undefined ? filterVal : (document.getElementById('journalFilterType')?.value || 'all');
    const search = (document.getElementById('journalSearchInput')?.value || '').toLowerCase().trim();
    const startDateVal = document.getElementById('journalStartDate')?.value;
    const endDateVal = document.getElementById('journalEndDate')?.value;

    const startDate = startDateVal ? new Date(startDateVal + 'T00:00:00') : null;
    const endDate = endDateVal ? new Date(endDateVal + 'T23:59:59') : null;

    const tbody = document.getElementById('generalJournalTableBody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    let activeDebitTotal = 0;
    let activeCreditTotal = 0;
    let visibleEntriesCount = 0;

    rows.forEach(r => {
      const id = r.getAttribute('data-id');
      const rowSource = r.getAttribute('data-source') || '';
      const text = r.textContent.toLowerCase();
      const entry = journalEntries.find(x => x.id === id);

      const sourceMatch = (filter === 'all' || rowSource === filter);
      const searchMatch = (!search || text.includes(search));

      let dateMatch = true;
      if (entry && (startDate || endDate)) {
        const itemDate = window.parseJournalEntryDate(entry.date);
        if (startDate && itemDate < startDate) dateMatch = false;
        if (endDate && itemDate > endDate) dateMatch = false;
      }

      if (sourceMatch && searchMatch && dateMatch) {
        r.removeAttribute('data-filtered-out');
        if (entry) {
          activeDebitTotal += entry.amount;
          activeCreditTotal += entry.amount;
          visibleEntriesCount++;
        }
      } else {
        r.setAttribute('data-filtered-out', 'true');
      }
    });

    // Update KPI Cards above Jurnal Umum
    const debitKpi = document.getElementById('journal-total-debit');
    const kreditKpi = document.getElementById('journal-total-kredit');
    const varianceKpi = document.getElementById('journal-variance');

    if (debitKpi) debitKpi.textContent = window.formatIDR(activeDebitTotal);
    if (kreditKpi) kreditKpi.textContent = window.formatIDR(activeCreditTotal);
    if (varianceKpi) {
      const variance = Math.abs(activeDebitTotal - activeCreditTotal);
      varianceKpi.textContent = `${window.formatIDR(variance)} (0%)`;
      varianceKpi.style.color = variance === 0 ? '#10B981' : '#EF4444';
    }

    window.setupTablePagination('tableGeneralJournal', 5);
  };


  // Active receipt context for sharing & downloading
  let activeLastTransferData = null;

  window.shareTransferReceiptViaWhatsApp = function() {
    if (!activeLastTransferData) {
      window.showFinanceToast('Tidak ada data resi transfer aktif.', 'warning');
      return;
    }
    const tx = activeLastTransferData;
    const msg = `Halo Bapak/Ibu *${tx.targetName}*, salam sehat dari tim Finance *PT Astacode Digital Nusantara*.\n\nKami ingin menginformasikan bahwa pembayaran *${tx.title}* sebesar *${window.formatIDR(tx.netAmount)}* telah berhasil kami transfer ke rekening Anda (${tx.targetAccount}) melalui ${tx.sourceBank.name}.\n\n• No. Referensi Transfer: *${tx.txRef}*\n• Waktu Transaksi: ${tx.timestamp}\n• Berita: ${tx.notes}\n\nBukti transfer resmi ini diterbitkan secara otomatis oleh Sistem ERP Astacode. Terima kasih banyak atas kerja samanya 🙏✨`;

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(() => {
        window.showFinanceToast(`📋 Format pesan WhatsApp resmi berhasil disalin ke clipboard! Siap dikirimkan ke ${tx.targetName}.`, 'success');
      }).catch(() => {
        window.showFinanceToast(`📲 Notifikasi transfer disiapkan untuk ${tx.targetName}!`, 'info');
      });
    } else {
      window.showFinanceToast(`📲 Notifikasi bukti transfer disiapkan untuk ${tx.targetName}!`, 'info');
    }

    // Also offer to open WhatsApp Simulation if client/project matches
    setTimeout(() => {
      const confirmOpen = confirm(`Pesan bukti transfer resmi sudah disiapkan! Apakah ingin membuka simulasi percakapan WhatsApp dengan ${tx.targetName}?`);
      if (confirmOpen) {
        window.closeFinanceModal('modalDetailTransaksiBank');
        window.openWhatsAppSimulation(tx.title, tx.targetName, 'Bukti Transfer Lunas', tx.netAmount, tx.txRef, false);
        window.saveChatMessage(`${tx.targetName} - ${tx.title}`, 'admin', msg, `Bukti_Transfer_${tx.txRef}.pdf`);
      }
    }, 400);
  };

  window.downloadTransferReceiptPdf = function() {
    if (!activeLastTransferData) {
      window.print();
      return;
    }
    window.showFinanceToast(`📄 Menyiapkan cetak dokumen PDF Bukti Transfer (${activeLastTransferData.txRef})...`, 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.syncBankBalancesUI();
    window.renderOpexTable();
    window.renderVendorTable();
    window.renderFreelancerTable();
    window.renderPayrollTable();
    window.renderJournalTable();

    // Setup pagination on all static tables
    setTimeout(() => {
      const allTables = document.querySelectorAll('.data-table');
      allTables.forEach((tbl, i) => {
        if (!tbl.id) tbl.id = `auto_data_table_${i + 1}`;
        window.setupTablePagination(tbl.id, 5);
      });
    }, 200);

    const hash = (window.location.hash || '').replace('#', '');
    const initialPage = hash || 'dashboard';
    window.switchFinancePage(initialPage);
    initCashflowChart();
    initExpenseDonutChart();
    window.renderMessageCenter();

    // Setup drag and drop for OCR upload
    const dropArea = document.getElementById('ocrDropArea');
    const fileInput = document.getElementById('ocrFileInput');

    if (dropArea && fileInput) {
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#4F46E5';
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
