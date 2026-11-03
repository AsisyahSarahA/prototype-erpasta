import re

with open('finance/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update view-payroll
new_payroll_view = '''        <section id="view-payroll" class="view-section">
          <div class="hero-banner">
            <div class="hero-left">
              <div class="hero-icon"><i class="fa-solid fa-users"></i></div>
              <div class="hero-title">
                <h2>Penggajian Karyawan Tetap (Payroll Terintegrasi Modul HR)</h2>
                <p>Master data karyawan, golongan grade jabatan, presensi, potongan pajak PPh 21, BPJS, & pencairan gaji via Rekening Perusahaan.</p>
              </div>
            </div>
            <div class="hero-actions">
              <button class="btn outline-white" onclick="syncPayrollFromHrModule()">
                <i class="fa-solid fa-arrows-rotate"></i> Sinkron Master HR
              </button>
              <button class="btn primary" onclick="openFinanceModal('modalCreatePayroll')">
                <i class="fa-solid fa-plus"></i> Tambah Data Gaji
              </button>
              <button class="btn success" onclick="transferMassalPayroll()">
                <i class="fa-solid fa-money-bill-transfer"></i> Transfer Gaji Massal
              </button>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-accent-bar" style="background:#4F46E5;"></div>
              <div class="kpi-top"><span class="kpi-label">Total Beban Gaji (THP)</span><i class="fa-solid fa-money-bill-wave" style="color:#4F46E5;"></i></div>
              <div class="kpi-val" id="payroll-kpi-total">Rp 0</div>
              <div class="kpi-sub" id="payroll-kpi-count">Oktober 2026 • 6 Karyawan Tetap</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-accent-bar" style="background:#F59E0B;"></div>
              <div class="kpi-top"><span class="kpi-label">Menunggu Review HR</span><i class="fa-solid fa-hourglass-half" style="color:#F59E0B;"></i></div>
              <div class="kpi-val" id="payroll-kpi-pending-hr" style="color:#D97706;">Rp 0</div>
              <div class="kpi-sub">Verifikasi cuti/presensi modul HR</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-accent-bar" style="background:#10B981;"></div>
              <div class="kpi-top"><span class="kpi-label">Disetujui HR • Siap Transfer</span><i class="fa-solid fa-circle-check" style="color:#10B981;"></i></div>
              <div class="kpi-val" id="payroll-kpi-ready-transfer" style="color:#10B981;">Rp 0</div>
              <div class="kpi-sub">Siap dicairkan via Bank Mandiri Payroll</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-accent-bar" style="background:#059669;"></div>
              <div class="kpi-top"><span class="kpi-label">Sudah Ditransfer (LUNAS)</span><i class="fa-solid fa-receipt" style="color:#059669;"></i></div>
              <div class="kpi-val" id="payroll-kpi-paid" style="color:#059669;">Rp 0</div>
              <div class="kpi-sub">Gaji terdistribusi ke rekening karyawan</div>
            </div>
          </div>

          <div class="card-panel">
            <div class="card-header" style="flex-wrap:wrap; gap:10px;">
              <div>
                <h4 class="card-title"><i class="fa-solid fa-file-invoice-dollar" style="color:var(--primary); margin-right:6px;"></i> Daftar Payroll Karyawan Astacode (Data Master HR)</h4>
                <p class="card-subtitle">Penggajian terverifikasi HR, sinkron potongan BPJS & PPh 21, transfer bank langsung, dan penerbitan slip digital</p>
              </div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <select class="form-select" id="filterPayrollStatus" onchange="window.filterPayrollTable()" style="font-size:12px; padding:6px 10px; width:auto;">
                  <option value="all">Semua Status Approval HR & Gaji</option>
                  <option value="APPROVED HR">Disetujui HR (Siap Transfer)</option>
                  <option value="MENUNGGU HR">Menunggu Review HR</option>
                  <option value="LUNAS">Sudah Ditransfer (LUNAS)</option>
                </select>
                <div class="filter-search" style="max-width:200px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="searchPayrollInput" placeholder="Cari nama / NIP / jabatan..." oninput="window.filterPayrollTable()">
                </div>
                <button class="btn btn-sm outline" onclick="window.sendMassalSlipEmail()"><i class="fa-solid fa-envelope"></i> Kirim Slip Gaji Massal</button>
              </div>
            </div>
            <div class="table-wrap">
              <table class="data-table" id="tablePayroll">
                <thead>
                  <tr>
                    <th>Karyawan & NIP/Grade (HR)</th>
                    <th>Divisi / Tim</th>
                    <th style="text-align:right;">Gaji Pokok & Tunjangan</th>
                    <th style="text-align:right;">Potongan BPJS & PPh</th>
                    <th style="text-align:right;">Take Home Pay (THP)</th>
                    <th style="text-align:center;">Status HR & Pembayaran</th>
                    <th>Rekening Transfer Karyawan</th>
                    <th style="text-align:right;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="payrollTableBody">
                  <!-- Dynamic rows generated by renderPayrollTable() -->
                </tbody>
              </table>
            </div>
          </div>
        </section>'''

# Replace view-payroll
pattern_view = r'<section id="view-payroll".*?</section>'
if not re.search(pattern_view, content, re.DOTALL):
    print("ERROR: could not find view-payroll")
    exit(1)

content = re.sub(pattern_view, new_payroll_view, content, flags=re.DOTALL)
print("Replaced view-payroll successfully")

# 2. Update modalCreatePayroll
new_create_modal = '''  <!-- Modal: Input Payroll Karyawan Baru -->
  <div class="modal-backdrop" id="modalCreatePayroll">
    <div class="modal-card" style="max-width:680px;">
      <div class="modal-header">
        <h3><i class="fa-solid fa-users" style="color:var(--primary); margin-right:8px;"></i> Tambah Data Payroll Karyawan (Sinkron HR)</h3>
        <button class="icon-btn" onclick="closeFinanceModal('modalCreatePayroll')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <form onsubmit="submitPayrollHrForm(event);">
          <div class="form-group">
            <label class="form-label">Pilih Pegawai dari Master HR atau Manual</label>
            <select class="form-select" id="pay-emp-select" onchange="onHrEmployeeSelected(this.value)">
              <option value="custom">-- Input Manual / Karyawan Baru --</option>
              <option value="Bagas Prakoso" data-nip="EMP-2026-001" data-jabatan="Tech Lead" data-grade="Grade Tech Lead (L4)" data-tim="Engineering" data-gaji="18000000" data-tunj="3000000" data-bank="MANDIRI" data-acc="132-00-5541-892">Bagas Prakoso — Tech Lead (Engineering)</option>
              <option value="Rina Anggraini" data-nip="EMP-2026-002" data-jabatan="HR Manager" data-grade="Grade Manager (L4)" data-tim="People Ops" data-gaji="14000000" data-tunj="2500000" data-bank="MANDIRI" data-acc="132-00-8812-304">Rina Anggraini — HR Manager (People Ops)</option>
              <option value="Fajar Nugroho" data-nip="EMP-2026-003" data-jabatan="Backend Developer" data-grade="Senior Engineer (L3)" data-tim="Engineering" data-gaji="12000000" data-tunj="1500000" data-bank="BCA" data-acc="5410-992-114">Fajar Nugroho — Backend Developer (Engineering)</option>
              <option value="Dewi Lestari" data-nip="EMP-2026-004" data-jabatan="Frontend Developer" data-grade="Senior Engineer (L3)" data-tim="Engineering" data-gaji="11000000" data-tunj="1500000" data-bank="MANDIRI" data-acc="132-00-7719-021">Dewi Lestari — Frontend Developer (Engineering)</option>
              <option value="Citra Maharani" data-nip="EMP-2026-005" data-jabatan="UI/UX Designer" data-grade="Mid Specialist (L2)" data-tim="Design" data-gaji="10500000" data-tunj="1200000" data-bank="BNI" data-acc="0812-4491-03">Citra Maharani — UI/UX Designer (Design)</option>
              <option value="Galih Pratama" data-nip="EMP-2026-006" data-jabatan="QA Engineer" data-grade="Mid Specialist (L2)" data-tim="QA" data-gaji="9500000" data-tunj="1000000" data-bank="MANDIRI" data-acc="132-00-3341-998">Galih Pratama — QA Engineer (QA)</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 2fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">NIP / ID Karyawan</label>
              <input type="text" id="pay-nip" class="form-input" placeholder="EMP-2026-XXX" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nama Lengkap Karyawan</label>
              <input type="text" id="pay-name" class="form-input" placeholder="Nama Karyawan" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Jabatan (HR)</label>
              <input type="text" id="pay-jabatan" class="form-input" placeholder="Contoh: Senior Backend Dev" required>
            </div>
            <div class="form-group">
              <label class="form-label">Divisi / Departemen</label>
              <select class="form-select" id="pay-divisi">
                <option value="Engineering">Engineering</option>
                <option value="People Ops">People Ops / HR</option>
                <option value="Design">Product & Design</option>
                <option value="QA">Quality Assurance</option>
                <option value="PMO">Project Management (PMO)</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Ops">Finance & Ops</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Gaji Pokok (Rp)</label>
              <input type="number" id="pay-gaji" class="form-input" placeholder="0" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tunjangan Jabatan & Kehadiran (Rp)</label>
              <input type="number" id="pay-tunj" class="form-input" placeholder="0" value="1500000">
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Potongan BPJS Ketenagakerjaan & Kesehatan (Rp)</label>
              <input type="number" id="pay-bpjs" class="form-input" placeholder="0" value="250000">
            </div>
            <div class="form-group">
              <label class="form-label">Potongan PPh 21 Karyawan (Rp)</label>
              <input type="number" id="pay-pph" class="form-input" placeholder="0" value="250000">
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Bank Penerima (Karyawan)</label>
              <select class="form-select" id="pay-bank">
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="BNI">Bank BNI</option>
                <option value="BRI">Bank BRI</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="Permata">Bank Permata</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Rekening</label>
              <input type="text" id="pay-acc-num" class="form-input" placeholder="132-00-xxxx" required>
            </div>
            <div class="form-group">
              <label class="form-label">Atas Nama Rekening</label>
              <input type="text" id="pay-acc-holder" class="form-input" placeholder="Nama di Buku Tabungan" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Status Verifikasi HR</label>
              <select class="form-select" id="pay-hr-status">
                <option value="APPROVED HR">Disetujui HR (Siap Transfer)</option>
                <option value="MENUNGGU HR">Menunggu Review HR</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Catatan Tambahan</label>
              <input type="text" id="pay-notes" class="form-input" placeholder="Payroll periode berjalan...">
            </div>
          </div>
          <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:10px 14px; font-size:11.5px; color:#166534; display:flex; gap:8px;">
            <i class="fa-solid fa-circle-check" style="margin-top:2px;"></i>
            <span>Data payroll terhubung dengan modul HR & Kas/Bank. Saat transfer disetujui, dana akan dipotong langsung dari Rekening Bank Mandiri Payroll ASTACODE beserta pencatatan jurnal otomatis.</span>
          </div>
          <div class="modal-footer" style="margin-top:14px;">
            <button type="button" class="btn" onclick="closeFinanceModal('modalCreatePayroll')">Batal</button>
            <button type="submit" class="btn primary"><i class="fa-solid fa-check"></i> Simpan Data Payroll</button>
          </div>
        </form>
      </div>
    </div>
  </div>'''

pattern_create = r'<div class="modal-backdrop" id="modalCreatePayroll">.*?</div>\s*</div>\s*</div>'
if not re.search(pattern_create, content, re.DOTALL):
    print("ERROR: could not find modalCreatePayroll")
    exit(1)

content = re.sub(pattern_create, new_create_modal, content, flags=re.DOTALL)
print("Replaced modalCreatePayroll successfully")

# 3. Update modalSlipGaji and add modalEditPayroll right after it
new_slip_and_edit_modal = '''  <!-- Modal: Slip Gaji Digital Resmi Karyawan -->
  <div class="modal-backdrop" id="modalSlipGaji">
    <div class="modal-card" style="max-width:650px;">
      <div class="modal-header">
        <h3><i class="fa-solid fa-file-invoice-dollar" style="color:var(--primary); margin-right:8px;"></i> Slip Gaji Karyawan Tetap Astacode</h3>
        <button class="icon-btn" onclick="closeFinanceModal('modalSlipGaji')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body" id="slipGajiPrintArea">
        <!-- Kop Surat -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--primary); padding-bottom:12px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:40px; height:40px; background:linear-gradient(135deg, #4F46E5, #3730A3); border-radius:8px; display:grid; place-items:center; color:#fff; font-weight:800; font-size:18px;">A</div>
            <div>
              <div style="font-weight:800; font-size:15px; color:var(--text-primary);">PT ASTACODE SOLUSINDO MANDIRI</div>
              <div style="font-size:10.5px; color:var(--text-muted);">Sovereign Plaza Lt. 12, Jl. TB Simatupang No. 36, Jakarta Selatan</div>
              <div style="font-size:10px; color:var(--text-muted);">NPWP: 01.345.678.9-012.000 • Email: finance@astacode.id</div>
            </div>
          </div>
          <div style="text-align:right;">
            <span class="badge info" style="font-size:11px; font-weight:700;">SLIP GAJI RESMI</span>
            <div id="slip-periode-badge" style="font-size:11px; font-weight:600; color:var(--text-primary); margin-top:4px;">Periode: Okt 2026</div>
          </div>
        </div>

        <!-- Detail Karyawan -->
        <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:16px;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:12px;">
            <div>
              <span style="color:var(--text-muted); display:block; font-size:10.5px;">NAMA KARYAWAN</span>
              <strong id="slip-emp-name" style="font-size:14px; color:var(--text-primary);">Bagas Prakoso</strong>
              <div id="slip-emp-nip" style="font-size:11px; color:var(--primary); font-family:var(--font-mono); font-weight:600;">EMP-2026-001</div>
            </div>
            <div>
              <span style="color:var(--text-muted); display:block; font-size:10.5px;">JABATAN & DIVISI</span>
              <strong id="slip-emp-role" style="font-size:13px; color:var(--text-primary);">Tech Lead</strong>
              <div id="slip-emp-dept" style="font-size:11px; color:var(--text-muted);">Engineering • Full Time</div>
            </div>
          </div>
        </div>

        <!-- Rincian Penghasilan & Potongan -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:14px;">
          <!-- Kolom Penerimaan -->
          <div style="background:#fff; border:1px solid var(--border); border-radius:8px; padding:12px;">
            <div style="font-weight:700; font-size:12px; color:#10B981; margin-bottom:8px; border-bottom:1px solid var(--border-light); padding-bottom:4px;">
              <i class="fa-solid fa-plus-circle"></i> PENGHASILAN (EARNINGS)
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Gaji Pokok</span>
              <span id="slip-base" style="font-weight:600;">Rp 18.000.000</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Tunjangan Jabatan</span>
              <span id="slip-tunj" style="font-weight:600;">Rp 3.000.000</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Tunjangan Transport</span>
              <span style="font-weight:600;">Termasuk</span>
            </div>
            <div style="border-top:1px dashed var(--border); padding-top:6px; display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
              <span>Total Bruto</span>
              <span id="slip-gross" style="color:#10B981;">Rp 21.000.000</span>
            </div>
          </div>

          <!-- Kolom Potongan -->
          <div style="background:#fff; border:1px solid var(--border); border-radius:8px; padding:12px;">
            <div style="font-weight:700; font-size:12px; color:#EF4444; margin-bottom:8px; border-bottom:1px solid var(--border-light); padding-bottom:4px;">
              <i class="fa-solid fa-minus-circle"></i> POTONGAN (DEDUCTIONS)
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
              <span style="color:var(--text-muted);">BPJS Ketenagakerjaan & Kes</span>
              <span id="slip-bpjs" style="font-weight:600; color:#EF4444;">- Rp 350.000</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
              <span style="color:var(--text-muted);">PPh 21 Karyawan</span>
              <span id="slip-pph" style="font-weight:600; color:#EF4444;">- Rp 450.000</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:6px;">
              <span style="color:var(--text-muted);">Presensi / Alpha</span>
              <span style="font-weight:600; color:#10B981;">Rp 0 (100%)</span>
            </div>
            <div style="border-top:1px dashed var(--border); padding-top:6px; display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
              <span>Total Potongan</span>
              <span id="slip-total-pot" style="color:#EF4444;">- Rp 800.000</span>
            </div>
          </div>
        </div>

        <!-- Net Take Home Pay Highlight -->
        <div style="background:linear-gradient(135deg, #EEF2FF, #E0E7FF); border:1px solid #C7D2FE; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <span style="font-size:11px; text-transform:uppercase; color:var(--primary); font-weight:700;">TOTAL TAKE HOME PAY (DITERIMA BERSIH)</span>
            <div id="slip-net" style="font-size:20px; font-weight:900; color:var(--primary-dark);">Rp 20.200.000</div>
          </div>
          <div style="text-align:right;">
            <div id="slip-status-badge"><span class="badge success"><i class="fa-solid fa-circle-check"></i> LUNAS (Disbursed)</span></div>
            <div id="slip-bank-info" style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted); margin-top:3px;">Mandiri 132-00-5541-892</div>
          </div>
        </div>

        <!-- Footer Tanda Tangan -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; text-align:center; font-size:11px; color:var(--text-muted); border-top:1px solid var(--border-light); padding-top:12px;">
          <div>
            <div>Penerima,</div>
            <div style="height:35px;"></div>
            <strong id="slip-sign-emp" style="color:var(--text-primary); text-decoration:underline;">Bagas Prakoso</strong>
          </div>
          <div>
            <div>Finance & HR Astacode,</div>
            <div style="height:35px;"></div>
            <strong style="color:var(--text-primary); text-decoration:underline;">Rina Anggraini, S.Psi</strong>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="justify-content:space-between;">
        <button type="button" class="btn" onclick="closeFinanceModal('modalSlipGaji')">Tutup</button>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn outline" onclick="window.printSlipGaji()"><i class="fa-solid fa-print"></i> Cetak Slip</button>
          <button type="button" class="btn success" id="slipBtnWa" onclick="window.sendSlipGajiWa()"><i class="fa-brands fa-whatsapp"></i> Kirim WhatsApp</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Edit Data Payroll Karyawan -->
  <div class="modal-backdrop" id="modalEditPayroll">
    <div class="modal-card" style="max-width:680px;">
      <div class="modal-header">
        <h3><i class="fa-solid fa-user-pen" style="color:var(--primary); margin-right:8px;"></i> Edit Data Payroll Pegawai</h3>
        <button class="icon-btn" onclick="closeFinanceModal('modalEditPayroll')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <form onsubmit="submitEditPayrollForm(event);">
          <input type="hidden" id="pay-edit-id">
          <div style="display:grid; grid-template-columns: 1fr 2fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">NIP / ID Karyawan</label>
              <input type="text" id="pay-edit-nip" class="form-input" readonly style="background:#F8FAFC;">
            </div>
            <div class="form-group">
              <label class="form-label">Nama Pegawai</label>
              <input type="text" id="pay-edit-name" class="form-input" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Jabatan (HR)</label>
              <input type="text" id="pay-edit-role" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Divisi / Tim</label>
              <select class="form-select" id="pay-edit-dept">
                <option value="Engineering">Engineering</option>
                <option value="People Ops">People Ops</option>
                <option value="Design">Design</option>
                <option value="QA">QA</option>
                <option value="PMO">PMO</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Ops">Finance & Ops</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Gaji Pokok (Rp)</label>
              <input type="number" id="pay-edit-base" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tunjangan Jabatan (Rp)</label>
              <input type="number" id="pay-edit-allowance" class="form-input" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Potongan BPJS (Rp)</label>
              <input type="number" id="pay-edit-bpjs" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Potongan PPh 21 (Rp)</label>
              <input type="number" id="pay-edit-pph" class="form-input" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Bank Penerima</label>
              <select class="form-select" id="pay-edit-bank">
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BCA">Bank BCA</option>
                <option value="BNI">Bank BNI</option>
                <option value="BRI">Bank BRI</option>
                <option value="BSI">Bank BSI</option>
                <option value="Permata">Bank Permata</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Rekening</label>
              <input type="text" id="pay-edit-acc-num" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Atas Nama Rekening</label>
              <input type="text" id="pay-edit-acc-holder" class="form-input" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">Status Verifikasi HR</label>
              <select class="form-select" id="pay-edit-hr-status">
                <option value="APPROVED HR">Disetujui HR (Siap Transfer)</option>
                <option value="MENUNGGU HR">Menunggu Review HR</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Catatan Tambahan</label>
              <input type="text" id="pay-edit-notes" class="form-input">
            </div>
          </div>
          <div class="modal-footer" style="margin-top:14px;">
            <button type="button" class="btn" onclick="closeFinanceModal('modalEditPayroll')">Batal</button>
            <button type="submit" class="btn primary"><i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  </div>'''

pattern_slip = r'<div class="modal-backdrop" id="modalSlipGaji">.*?</div>\s*</div>\s*</div>'
if not re.search(pattern_slip, content, re.DOTALL):
    print("ERROR: could not find modalSlipGaji")
    exit(1)

content = re.sub(pattern_slip, new_slip_and_edit_modal, content, flags=re.DOTALL)
print("Replaced modalSlipGaji and added modalEditPayroll successfully")

with open('finance/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated finance/index.html written successfully!")

