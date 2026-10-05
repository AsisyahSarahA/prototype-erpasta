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
    'expenses': 'Klaim Struk & Pengeluaran (AI OCR)',
    'opex': 'Biaya Operasional (OPEX Kantor)',
    'payroll': 'Penggajian Karyawan (Payroll)',
    'vendor': 'Tagihan Vendor (Operasional & HPP)',
    'freelancer': 'Pembayaran Freelancer (HPP Proyek)',
    'accounts': 'Daftar Rekening & Saldo Kas/Bank',
    'internal-transfer': 'Mutasi Internal (Pindah Dana)',
    'reconciliation': 'Rekonsiliasi Bank (CSV & Matching)',
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

  // AI OCR Upload & Scanning Simulation
  window.simulateOcrScan = function(file) {
    const scanningOverlay = document.getElementById('scanningOverlay');
    const receiptPreview = document.getElementById('receiptPreview');
    const receiptFileName = document.getElementById('receiptFileName');

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
        receiptFileName.textContent = file ? file.name : 'struk_hosting_aws_oktober.pdf';
      }

      // Populate Form inputs automatically with simulated OCR data
      const descInput = document.getElementById('exp-desc');
      const amountInput = document.getElementById('exp-amount');
      const vendorInput = document.getElementById('exp-vendor');
      const dateInput = document.getElementById('exp-date');

      if (descInput) descInput.value = 'Tagihan Cloud Server & Database Cluster AWS';
      if (amountInput) amountInput.value = '15350000';
      if (vendorInput) vendorInput.value = 'Amazon Web Services (AWS)';
      if (dateInput) dateInput.value = '2026-10-04';

      window.showFinanceToast('✨ AI Smart OCR Berhasil mengekstrak data struk secara otomatis!', 'success');
    }, 1600);
  };

  // Tinder-style Reconciliation Matching
  window.handleReconMatch = function(btn) {
    const card = btn.closest('.recon-tinder-card');
    if (!card) return;

    card.classList.add('matched-swipe');
    window.showFinanceToast('✅ Transaksi berhasil direkonsiliasi & dicatat ke Jurnal Umum!', 'success');

    setTimeout(() => {
      card.remove();
      checkReconEmpty();
    }, 400);
  };

  window.handleReconSkip = function(btn) {
    const card = btn.closest('.recon-tinder-card');
    if (!card) return;

    card.classList.add('skipped-swipe');
    window.showFinanceToast('Transakasi dilewati untuk pencarian manual.', 'info');

    setTimeout(() => {
      card.remove();
      checkReconEmpty();
    }, 400);
  };

  function checkReconEmpty() {
    const cards = document.querySelectorAll('.recon-tinder-card');
    if (cards.length === 0) {
      const container = document.getElementById('reconCardsContainer');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center; padding: 40px 20px; background:#F8FAFC; border: 1px dashed var(--border); border-radius:12px;">
            <div style="width:50px; height:50px; border-radius:50%; background:#ECFDF5; color:#10B981; display:grid; place-items:center; margin:0 auto 12px; font-size:22px;">
              <i class="fa-solid fa-check"></i>
            </div>
            <h4 style="font-size:15px; font-weight:800; color:var(--text-primary);">Semua Mutasi Telah Direkonsiliasi 🎉</h4>
            <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Seluruh transaksi dari rekening koran bank cocok 100% dengan buku kas.</p>
          </div>
        `;
      }
    }
  }

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
