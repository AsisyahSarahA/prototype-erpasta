import re

with open('finance/finance.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Replace the old payroll section (lines around syncPayrollFromHrModule and submitPayrollHrForm)
old_payroll_pattern = r'// Sinkronkan seluruh data payroll dengan modul HR\s*window\.syncPayrollFromHrModule = function\(\) \{.*?window\.showSlipGajiModal = function\(name, role, gaji, tunj\) \{.*?window\.openFinanceModal\(\'modalSlipGaji\'\);\s*\};'

new_payroll_code = '''  // ==========================================================================
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
      `Konfirmasi Eksekusi Payroll Run Massal:\\n\\n` +
      `Jumlah Karyawan: ${readyList.length} orang\\n` +
      `Total Gaji Bersih (THP): ${window.formatIDR(totalAmount)}\\n` +
      `Rekening Sumber: ${bank.name} (${bank.number})\\n\\n` +
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

    const msg = `Halo *${item.name}*,\\n\\nBerikut terlampir rincian Slip Gaji resmi Anda untuk periode *Oktober 2026* dari *PT ASTACODE SOLUSINDO MANDIRI*:\\n\\n` +
      `📋 *NIP*: ${item.id}\\n` +
      `💼 *Jabatan*: ${item.role} (${item.department})\\n\\n` +
      `*Penerimaan*:\\n` +
      `• Gaji Pokok: ${window.formatIDR(item.baseSalary)}\\n` +
      `• Tunjangan Jabatan: ${window.formatIDR(item.allowance)}\\n` +
      `• Total Bruto: ${window.formatIDR(gross)}\\n\\n` +
      `*Potongan*:\\n` +
      `• BPJS Ketenagakerjaan: -${window.formatIDR(item.bpjsAmount)}\\n` +
      `• PPh 21 Karyawan: -${window.formatIDR(item.pph21Amount)}\\n` +
      `• Total Potongan: -${window.formatIDR(totalPot)}\\n\\n` +
      `💰 *Take Home Pay (Diterima)*: *${window.formatIDR(net)}*\\n` +
      `🏦 *Rekening Transfer*: ${item.bankTarget} ${item.accountNumber} a/n ${item.accountHolder}\\n` +
      `📌 *Status*: ${isPaid ? '✅ Lunas Ditransfer via Bank Mandiri Payroll' : '⏳ Terverifikasi HR, siap transfer'}\\n\\n` +
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
  };'''

if not re.search(old_payroll_pattern, code, re.DOTALL):
    print("ERROR: could not find old_payroll_pattern")
    exit(1)

code = re.sub(old_payroll_pattern, new_payroll_code, code, flags=re.DOTALL)
print("Payroll section updated successfully")

# 2. Update confirmAndExecuteBankTransfer debitAccount logic
target_debit = "debitAccount: currentTransferConfig.type === 'freelancer' ? '5101 - Beban Tenaga Lepas (Freelance HPP)' : currentTransferConfig.type === 'vendor' ? '2101 - Hutang Usaha / Vendor' : '6102 - Beban Operasional Kantor',"
replacement_debit = "debitAccount: currentTransferConfig.type === 'freelancer' ? '5101 - Beban Tenaga Lepas (Freelance HPP)' : currentTransferConfig.type === 'vendor' ? '2101 - Hutang Usaha / Vendor' : currentTransferConfig.type === 'payroll' ? '6101 - Beban Gaji & Upah Karyawan' : '6102 - Beban Operasional Kantor',"

if target_debit in code:
    code = code.replace(target_debit, replacement_debit)
    print("Updated confirmAndExecuteBankTransfer debitAccount logic")
else:
    print("Warning: target_debit not found in code")

# 3. Add window.renderPayrollTable() to DOMContentLoaded
target_dom = "window.renderFreelancerTable();\n    window.renderJournalTable();"
replacement_dom = "window.renderFreelancerTable();\n    window.renderPayrollTable();\n    window.renderJournalTable();"

if target_dom in code:
    code = code.replace(target_dom, replacement_dom)
    print("Added renderPayrollTable to DOMContentLoaded")
else:
    print("Warning: target_dom not found in code")

with open('finance/finance.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated finance/finance.js written successfully!")

