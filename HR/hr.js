/* ==========================================================================
   ASTA HR — Prototype logic (mengikuti HR_PRD.md)
   Modul: Absensi & Workload, Rekrutmen, PKL, Payroll, Karyawan, Pengaturan
   ========================================================================== */
(() => {
'use strict';

/* ---------------- Helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
window.addEventListener('error', e => {
  const div = document.createElement('div');
  div.style = 'position:fixed; top:0; left:0; z-index:9999; background:red; color:white; padding:10px; font-size:14px; white-space:pre-wrap;';
  div.innerText = (e.error && e.error.stack) || e.message || 'Unknown error';
  document.body.appendChild(div);
});
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const sl = s => String(s).replace(/\W+/g, '_');
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
const dOff = n => iso(addDays(TODAY, n));
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const fmtD = s => { const d = parse(s); return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const COLORS = ['#2563EB', '#0891B2', '#7C3AED', '#DB2777', '#D97706', '#16A34A', '#0B1F4B', '#DC2626'];
const colorOf = n => COLORS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const av = (n, sm) => `<span class="av ${sm ? 'sm' : ''}" style="background:${colorOf(n)}">${initials(n)}</span>`;
const person = (n, sub) => `<div class="person">${av(n)}<div><div style="font-weight:500">${esc(n)}</div>${sub ? `<div class="caption">${esc(sub)}</div>` : ''}</div></div>`;
const LZ = {
  Hadir: 'success', 'Hadir Onsite': 'success', 'Hadir WFH': 'info', Approved: 'success', Available: 'success', Aktif: 'success', Paid: 'success', Hired: 'success', Published: 'success', Selesai: 'primary', Diterima: 'success',
  Pending: 'warning', Menunggu: 'warning', Review: 'warning', Draft: 'neutral', 'Belum Submit Progres': 'warning', Terbatas: 'warning', Tinjau: 'warning',
  Rejected: 'danger', Ditolak: 'danger', Full: 'danger', 'Kuota Penuh': 'danger', 'Tanpa Keterangan': 'danger', Closed: 'neutral', Anomali: 'danger'
};
const lz = (t, c) => `<span class="lz lz-${c || LZ[t] || 'neutral'}">${esc(t)}</span>`;
const nowTime = () => { const n = new Date(); return `${pad(n.getHours())}:${pad(n.getMinutes())}`; };

/* ---------------- State & seed data ---------------- */
const S = {
  role: 'hr',
  settings: {
    nightThreshold: '22:00', wfhRadius: 200, quotaMax: 5, autoReject: true, claimMode: 'approval', compensation: 'carryover',
    incentiveRate: 75000, incentiveMax: 8, officeIp: '203.0.113.42', bssid: 'A4:5E:60:C1:9B:2F', ssid: 'Asta', pkgRule: 'global',
    officeLat: -6.2001, officeLng: 106.8167, signer: 'Rina Anggraini, HR Manager', letterNo: 23, certNo: 14
  },
  attendance: null, // today's record
  consent: false
};

const EMP = [
  { id: 1, nama: 'Rina Anggraini', email: 'rina@astacode.id', tipe: 'Tetap', tim: 'People Ops', jabatan: 'HR Manager', atasan: 'CEO', gaji: 14000000, tunj: 2500000, rate: 0, status: 'Aktif', masuk: '2021-02-01' },
  { id: 2, nama: 'Bagas Prakoso', email: 'bagas@astacode.id', tipe: 'Tetap', tim: 'Engineering', jabatan: 'Tech Lead', atasan: 'CTO', gaji: 18000000, tunj: 3000000, rate: 0, status: 'Aktif', masuk: '2020-06-15' },
  { id: 3, nama: 'Dewi Lestari', email: 'dewi@astacode.id', tipe: 'Tetap', tim: 'Engineering', jabatan: 'Frontend Developer', atasan: 'Bagas Prakoso', gaji: 11000000, tunj: 1500000, rate: 0, status: 'Aktif', masuk: '2022-03-07' },
  { id: 4, nama: 'Fajar Nugroho', email: 'fajar@astacode.id', tipe: 'Tetap', tim: 'Engineering', jabatan: 'Backend Developer', atasan: 'Bagas Prakoso', gaji: 12000000, tunj: 1500000, rate: 0, status: 'Aktif', masuk: '2022-08-22' },
  { id: 5, nama: 'Citra Maharani', email: 'citra@astacode.id', tipe: 'Tetap', tim: 'Design', jabatan: 'UI/UX Designer', atasan: 'Bagas Prakoso', gaji: 10500000, tunj: 1200000, rate: 0, status: 'Aktif', masuk: '2023-01-09' },
  { id: 6, nama: 'Galih Pratama', email: 'galih@astacode.id', tipe: 'Tetap', tim: 'QA', jabatan: 'QA Engineer', atasan: 'Bagas Prakoso', gaji: 9500000, tunj: 1000000, rate: 0, status: 'Aktif', masuk: '2023-05-02' },
  { id: 7, nama: 'Hana Putri', email: 'hana@gmail.com', tipe: 'Freelance', tim: 'Engineering', jabatan: 'Mobile Developer', atasan: 'Bagas Prakoso', gaji: 0, tunj: 0, rate: 95000, status: 'Aktif', masuk: '2024-02-01' },
  { id: 8, nama: 'Indra Wijaya', email: 'indra@gmail.com', tipe: 'Freelance', tim: 'Design', jabatan: 'Illustrator', atasan: 'Citra Maharani', gaji: 0, tunj: 0, rate: 80000, status: 'Aktif', masuk: '2024-07-15' },
  { id: 9, nama: 'Kevin Santoso', email: 'kevin@smkn1.sch.id', tipe: 'PKL', tim: 'Engineering', jabatan: 'Peserta PKL', atasan: 'Fajar Nugroho', gaji: 0, tunj: 0, rate: 0, status: 'Aktif', masuk: dOff(-30) },
  { id: 10, nama: 'Laila Zahra', email: 'laila@ui.ac.id', tipe: 'PKL', tim: 'Design', jabatan: 'Peserta PKL', atasan: 'Citra Maharani', gaji: 0, tunj: 0, rate: 0, status: 'Aktif', masuk: dOff(-45) }
];
const hoursFL = { 7: 96, 8: 64 };
const absenceDays = { 3: 0, 4: 1, 5: 0, 6: 2 };

const LOGS = [
  { id: 1, tgl: dOff(-1), nama: 'Dewi Lestari', mode: 'Hadir WFH', ringkasan: 'Slicing halaman dashboard + integrasi chart', task: 'ASTA-212', commit: 'github.com/asta/web/pull/88', jam: 7.5 },
  { id: 2, tgl: dOff(-1), nama: 'Fajar Nugroho', mode: 'Hadir Onsite', ringkasan: 'Optimasi query laporan payroll', task: 'ASTA-219', commit: 'github.com/asta/api/commit/a91f3', jam: 8 },
  { id: 3, tgl: dOff(-2), nama: 'Citra Maharani', mode: 'Hadir Onsite', ringkasan: 'Revisi desain onboarding klien', task: 'ASTA-205', commit: '', jam: 6 },
  { id: 4, tgl: dOff(-1), nama: 'Galih Pratama', mode: 'Hadir WFH', ringkasan: 'Regression test rilis 2.4', task: 'ASTA-221', commit: '', jam: 8 }
];
const NIGHT = [
  { id: 1, nama: 'Fajar Nugroho', tgl: dOff(-2), waktu: '23:40', alasan: 'Hotfix bug pembayaran klien (ASTA-201)', tipe: 'Insentif', jam: 2, status: 'Pending' },
  { id: 2, nama: 'Dewi Lestari', tgl: dOff(-3), waktu: '22:30', alasan: 'Revisi mendadak dari klien (ASTA-198)', tipe: 'Carryover', jam: 1.5, status: 'Approved' },
  { id: 3, nama: 'Galih Pratama', tgl: dOff(-1), waktu: '22:15', alasan: 'Verifikasi rilis darurat', tipe: 'Carryover', jam: 1, status: 'Pending' }
];

let TEAM_TODAY = EMP.filter(e => e.tipe !== 'PKL').map((e, i) => ({
  nama: e.nama, tim: e.tim, tipe: e.tipe,
  status: ['Hadir Onsite', 'Hadir WFH', 'Hadir Onsite', 'Hadir WFH', 'Belum Submit Progres', 'Hadir WFH', 'Tanpa Keterangan', 'Hadir Onsite'][i % 8],
  load: [6, 8, 5, 9, 4, 7, 0, 6][i % 8], cap: 8,
  task: ['ASTA-230 Sprint planning', 'ASTA-212 Dashboard UI', 'ASTA-219 Query optimasi', 'ASTA-225 Auth SSO', 'ASTA-205 Revisi desain', 'ASTA-221 Regression', '—', 'ASTA-231 Mobile build'][i % 8]
}));

const JOBS = [
  { id: 1, judul: 'Senior Backend Engineer', tim: 'Engineering', level: 'Senior', lokasi: 'Hybrid — Jakarta', skill: 'Node.js, PostgreSQL, AWS', status: 'Published', deskripsi: 'Merancang dan memelihara API untuk produk klien enterprise.' },
  { id: 2, judul: 'UI/UX Designer', tim: 'Design', level: 'Mid', lokasi: 'WFH', skill: 'Figma, Design System', status: 'Published', deskripsi: 'Membangun pengalaman produk yang konsisten dan indah.' },
  { id: 3, judul: 'QA Automation Engineer', tim: 'QA', level: 'Mid', lokasi: 'Hybrid — Jakarta', skill: 'Cypress, Playwright', status: 'Draft', deskripsi: 'Mengotomasi pengujian regresi lintas produk.' },
  { id: 4, judul: 'Project Manager', tim: 'PMO', level: 'Senior', lokasi: 'Onsite', skill: 'Agile, Jira, Stakeholder', status: 'Closed', deskripsi: 'Memimpin delivery proyek software.' }
];
const STAGES = ['Applied', 'Screening', 'Interview', 'Technical Test', 'Offering', 'Hired', 'Rejected'];
const APP = [
  { id: 1, nama: 'Ahmad Fauzi', job: 1, stage: 'Applied', skor: 0, email: 'ahmad.f@mail.com', hp: '0812-1111-2201', edu: 'S1 Informatika — ITB', exp: '5 th Backend', skill: 'Node.js, Go, PostgreSQL' },
  { id: 2, nama: 'Bella Kusuma', job: 2, stage: 'Screening', skor: 3.5, email: 'bella.k@mail.com', hp: '0813-2222-3302', edu: 'S1 DKV — Binus', exp: '3 th UI/UX', skill: 'Figma, Prototyping' },
  { id: 3, nama: 'Chandra Wibowo', job: 1, stage: 'Interview', skor: 4.2, email: 'chandra.w@mail.com', hp: '0857-3333-4403', edu: 'S1 Ilkom — UGM', exp: '6 th Backend', skill: 'Java, Node.js, AWS' },
  { id: 4, nama: 'Dian Permata', job: 2, stage: 'Technical Test', skor: 4.5, email: 'dian.p@mail.com', hp: '0821-4444-5504', edu: 'S1 DKV — ITS', exp: '4 th UI/UX', skill: 'Figma, Design System' },
  { id: 5, nama: 'Eko Saputra', job: 1, stage: 'Offering', skor: 4.8, email: 'eko.s@mail.com', hp: '0878-5555-6605', edu: 'S1 TI — UI', exp: '7 th Backend', skill: 'Node.js, K8s, PostgreSQL' },
  { id: 6, nama: 'Farah Nabila', job: 2, stage: 'Applied', skor: 0, email: 'farah.n@mail.com', hp: '0812-6666-7706', edu: 'D4 Multimedia — PENS', exp: '2 th Designer', skill: 'Figma, Illustration' },
  { id: 7, nama: 'Gilang Ramadhan', job: 1, stage: 'Rejected', skor: 2.1, email: 'gilang.r@mail.com', hp: '0819-7777-8807', edu: 'S1 SI — Telkom', exp: '1 th Backend', skill: 'PHP, MySQL' }
];

const PKL = [
  { id: 1, nama: 'Kevin Santoso', instansi: 'SMKN 1 Jakarta', jurusan: 'RPL', mulai: dOff(-30), selesai: dOff(60), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '001/ASTA-HR/PKL/2026', kontak: 'kevin@smkn1.sch.id', mulaiLog: 24 },
  { id: 2, nama: 'Laila Zahra', instansi: 'Universitas Indonesia', jurusan: 'Desain Komunikasi Visual', mulai: dOff(-45), selesai: dOff(45), status: 'Aktif', divisi: 'Design', pembimbing: 'Citra Maharani', nomor: '002/ASTA-HR/PKL/2026', kontak: 'laila@ui.ac.id', mulaiLog: 31 },
  { id: 3, nama: 'Mario Gunawan', instansi: 'SMK Telkom Bandung', jurusan: 'TKJ', mulai: dOff(-10), selesai: dOff(80), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '003/ASTA-HR/PKL/2026', kontak: 'mario@smktelkom.sch.id', mulaiLog: 8 },
  { id: 4, nama: 'Nadia Rahma', instansi: 'Politeknik Negeri Jakarta', jurusan: 'Teknik Informatika', mulai: dOff(-5), selesai: dOff(85), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Dewi Lestari', nomor: '004/ASTA-HR/PKL/2026', kontak: 'nadia@pnj.ac.id', mulaiLog: 4 },
  { id: 5, nama: 'Omar Hakim', instansi: 'SMKN 4 Bandung', jurusan: 'RPL', mulai: dOff(-3), selesai: dOff(87), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '005/ASTA-HR/PKL/2026', kontak: 'omar@smkn4.sch.id', mulaiLog: 2 },
  { id: 6, nama: 'Putra Mahendra', instansi: 'Universitas Gunadarma', jurusan: 'Sistem Informasi', mulai: dOff(20), selesai: dOff(110), status: 'Menunggu', divisi: '', pembimbing: '', nomor: '', kontak: 'putra@gunadarma.ac.id' },
  { id: 7, nama: 'Qonita Aulia', instansi: 'SMK Negeri 2 Depok', jurusan: 'Multimedia', mulai: dOff(10), selesai: dOff(70), status: 'Menunggu', divisi: '', pembimbing: '', nomor: '', kontak: 'qonita@smkn2.sch.id' },
  { id: 8, nama: 'Raka Aditya', instansi: 'Universitas Brawijaya', jurusan: 'Teknik Informatika', mulai: dOff(-200), selesai: dOff(-110), status: 'Selesai', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '098/ASTA-HR/PKL/2025', kontak: 'raka@ub.ac.id', score: 86 }
];
const CRITERIA = [
  { k: 'Code Quality', w: 25 }, { k: 'Teamwork', w: 20 }, { k: 'Punctuality', w: 15 },
  { k: 'Communication', w: 20 }, { k: 'Problem Solving', w: 20 }
];
const EVALS = { 8: { 'Code Quality': 85, Teamwork: 90, Punctuality: 82, Communication: 85, 'Problem Solving': 88 } };
const CERTS = [{ no: 'CERT/ASTA/2025/013', placement: 8, nama: 'Raka Aditya', tampil: true, tgl: dOff(-100), token: 'a1b2c3' }];

const PAYRUN = [
  { id: 'PR-2026-09', periode: 'September 2026', status: 'Paid', total: 0 },
  { id: 'PR-2026-10', periode: 'Oktober 2026', status: 'Draft', total: 0 }
];
const AUDIT = [
  { t: dOff(-1) + ' 16:20', actor: 'Rina Anggraini', aksi: 'Approve', entitas: 'Klaim malam #2', detail: 'Carryover 1.5 jam — Dewi Lestari' },
  { t: dOff(-2) + ' 10:05', actor: 'Rina Anggraini', aksi: 'Terbitkan', entitas: 'Sertifikat PKL', detail: 'CERT/ASTA/2025/013 — Raka Aditya' },
  { t: dOff(-3) + ' 09:12', actor: 'Super Admin', aksi: 'Ubah', entitas: 'Pengaturan', detail: 'Radius WFH default 200 m' },
  { t: dOff(-5) + ' 14:41', actor: 'Finance', aksi: 'Finalisasi', entitas: 'PR-2026-09', detail: 'Payroll September dibayar' }
];
const TEMPLATES = {
  accept: { nama: 'Surat Balasan Penerimaan PKL', body: 'Nomor: {{nomor_surat}}\n\nKepada Yth.\nPimpinan {{sekolah}}\n\nDengan hormat,\nMenindaklanjuti surat permohonan PKL, kami dengan senang hati menerima:\n\nNama      : {{nama_siswa}}\nInstansi  : {{sekolah}}\nPeriode   : {{tanggal_mulai}} s.d. {{tanggal_selesai}}\n\nDemikian surat ini kami sampaikan. Atas perhatiannya kami ucapkan terima kasih.' },
  reject: { nama: 'Surat Penolakan PKL (Kuota Penuh)', body: 'Nomor: {{nomor_surat}}\n\nKepada Yth.\nPimpinan {{sekolah}}\n\nDengan hormat,\nMohon maaf, permohonan PKL atas nama {{nama_siswa}} untuk periode {{tanggal_mulai}} s.d. {{tanggal_selesai}} belum dapat kami terima karena kuota peserta pada periode tersebut telah penuh.\n\nKami mempersilakan mengajukan kembali pada periode lain.' },
  payslip: { nama: 'Slip Gaji', body: 'SLIP GAJI — {{periode}}\nNama: {{nama}}\nTipe: {{tipe}}' },
  cert: { nama: 'Sertifikat PKL', body: 'Diberikan kepada {{nama_siswa}} atas keberhasilan menyelesaikan PKL.' }
};

/* ---------------- Core domain logic ---------------- */
// Kuota PKL (PKL-03/04): hitung peserta aktif per hari
function occupancy(day, excludeId) {
  return PKL.filter(p => ['Aktif', 'Diterima'].includes(p.status) && p.id !== excludeId && p.mulai <= day && p.selesai >= day).length;
}
function checkQuota(start, end, excludeId) {
  const days = []; let max = 0, fullDay = null;
  for (let d = parse(start); iso(d) <= end; d = addDays(d, 1)) {
    const o = occupancy(iso(d), excludeId); max = Math.max(max, o);
    if (o >= S.settings.quotaMax && !fullDay) fullDay = iso(d);
    days.push(o);
  }
  return { available: max < S.settings.quotaMax, max, fullDay, days: days.length };
}
function haversine(a, b, c, d) {
  const R = 6371000, t = x => x * Math.PI / 180;
  const dLa = t(c - a), dLo = t(d - b);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function computePayslip(e) {
  if (e.tipe === 'Freelance') {
    const jam = hoursFL[e.id] || 0, gross = jam * e.rate;
    return { e, items: [{ n: `Jam terlog (${jam} jam × ${rp(e.rate)})`, v: gross }], gross, ded: 0, net: gross };
  }
  if (e.tipe === 'Tetap') {
    const night = NIGHT.filter(n => n.nama === e.nama && n.status === 'Approved' && n.tipe === 'Insentif').reduce((a, n) => a + n.jam, 0);
    const insentif = Math.min(night, S.settings.incentiveMax) * S.settings.incentiveRate;
    const potong = (absenceDays[e.id] || 0) * Math.round(e.gaji / 22);
    const items = [{ n: 'Gaji pokok', v: e.gaji }, { n: 'Tunjangan', v: e.tunj }];
    if (insentif) items.push({ n: `Insentif Workload Malam (${night} jam)`, v: insentif });
    const gross = e.gaji + e.tunj + insentif;
    return { e, items, gross, ded: potong, net: gross - potong, dedNote: potong ? `Potongan ${absenceDays[e.id]} hari tanpa keterangan` : '' };
  }
  return null;
}
const slips = () => EMP.filter(e => e.tipe !== 'PKL').map(computePayslip);

/* ---------------- UI primitives ---------------- */
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`; el.setAttribute('role', 'status');
  el.innerHTML = `<span>${{ success: '<i class=fi-rr-check-circle></i>', error: '<i class=fi-rr-cross-circle></i>', warn: '<i class=fi-rr-triangle-warning></i>', info: '<i class=fi-rr-info></i>' }[type]}</span><span>${msg}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = 0; el.style.transition = '.3s'; setTimeout(() => el.remove(), 300); }, 3600);
}
function audit(aksi, entitas, detail) {
  const u = { hr: 'Rina Anggraini', manager: 'Bagas Prakoso', employee: 'Dewi Lestari', finance: 'Finance' }[S.role];
  const n = new Date(); AUDIT.unshift({ t: `${iso(n)} ${nowTime()}`, actor: u, aksi, entitas, detail });
}
function openDrawer(title, body, foot = '') {
  $('#drawerTitle').textContent = title; $('#drawerBody').innerHTML = body; $('#drawerFoot').innerHTML = foot;
  $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false');
}
const closeDrawer = () => { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); };
function openModal(title, body, foot = '', wide) {
  $('#modalTitle').textContent = title; $('#modalBody').innerHTML = body; $('#modalFoot').innerHTML = foot;
  $('.modal').classList.toggle('wide', !!wide);
  $('#modalWrap').classList.add('open'); $('#modalWrap').setAttribute('aria-hidden', 'false');
}
const closeModal = () => { $('#modalWrap').classList.remove('open'); $('#modalWrap').setAttribute('aria-hidden', 'true'); };

// Generic data table with sort, search, paging, row-click, bulk select
const TBL = {};
function table(id, cfg) {
  TBL[id] = Object.assign({ page: 1, size: 8, sort: null, dir: 1, q: '', sel: new Set() }, cfg, TBL[id] && { page: TBL[id].page, sort: TBL[id].sort, dir: TBL[id].dir, q: TBL[id].q });
  return `<div id="tbl-${id}"></div>`;
}
function paintTable(id) {
  const t = TBL[id], host = $('#tbl-' + id); if (!host) return;
  let rows = t.rows();
  if (t.q) rows = rows.filter(r => JSON.stringify(Object.values(r)).toLowerCase().includes(t.q.toLowerCase()));
  if (t.sort) rows = [...rows].sort((a, b) => (a[t.sort] > b[t.sort] ? 1 : a[t.sort] < b[t.sort] ? -1 : 0) * t.dir);
  const pages = Math.max(1, Math.ceil(rows.length / t.size)); t.page = Math.min(t.page, pages);
  const slice = rows.slice((t.page - 1) * t.size, t.page * t.size);
  const filters = typeof t.toolbar === 'function' ? t.toolbar() : '';
  host.innerHTML = `
    <div class="toolbar">
      <input class="input" data-q="${id}" placeholder="Cari…" value="${esc(t.q)}" aria-label="Cari di tabel">
      ${filters}<span class="spacer"></span><span class="caption">${rows.length} data</span>
    </div>
    ${t.bulk ? `<div class="bulk ${t.sel.size ? 'show' : ''}"><b>${t.sel.size} dipilih</b>${t.bulk}</div>` : ''}
    <div class="tbl-wrap"><table class="tbl"><thead><tr>
      ${t.bulk ? '<th style="width:36px"><input type="checkbox" data-selall aria-label="Pilih semua"></th>' : ''}
      ${t.cols.map(c => `<th class="${c.sort !== false ? 'sortable' : ''} ${c.cls || ''}" data-sort="${c.k}">${c.label}${t.sort === c.k ? (t.dir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}
    </tr></thead><tbody>
      ${slice.length ? slice.map(r => `<tr class="${t.onRow ? 'click' : ''}" data-id="${r.id}">
        ${t.bulk ? `<td><input type="checkbox" data-sel="${r.id}" ${t.sel.has(r.id) ? 'checked' : ''} aria-label="Pilih baris"></td>` : ''}
        ${t.cols.map(c => `<td class="${c.cls || ''}">${c.fmt ? c.fmt(r) : esc(r[c.k])}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${t.cols.length + 1}"><div class="empty-state"><div class="ei"><i class=fi-rr-folder-open></i></div><b>Tidak ada data</b><div>Coba ubah kata kunci atau filter.</div></div></td></tr>`}
    </tbody></table></div>
    <div class="pager"><span>Halaman ${t.page} / ${pages}</span><span class="row">
      <button class="btn btn-sm" data-pg="-1" ${t.page <= 1 ? 'disabled' : ''}>‹ Sebelumnya</button>
      <button class="btn btn-sm" data-pg="1" ${t.page >= pages ? 'disabled' : ''}>Berikutnya ›</button></span></div>`;
  const q = $('[data-q]', host);
  q.oninput = e => { t.q = e.target.value; t.page = 1; const pos = e.target.selectionStart; paintTable(id); const n = $('[data-q]', $('#tbl-' + id)); n.focus(); n.setSelectionRange(pos, pos); };
  $$('[data-sort]', host).forEach(th => th.onclick = () => { if (th.dataset.sort === 'undefined') return; t.dir = t.sort === th.dataset.sort ? -t.dir : 1; t.sort = th.dataset.sort; paintTable(id); });
  $$('[data-pg]', host).forEach(b => b.onclick = () => { t.page += +b.dataset.pg; paintTable(id); });
  if (t.onRow) $$('tbody tr[data-id]', host).forEach(tr => tr.onclick = e => { if (e.target.closest('input,button,a,select')) return; t.onRow(+tr.dataset.id); });
  $$('[data-sel]', host).forEach(c => c.onchange = () => { c.checked ? t.sel.add(+c.dataset.sel) : t.sel.delete(+c.dataset.sel); paintTable(id); });
  const all = $('[data-selall]', host); if (all) all.onchange = () => { slice.forEach(r => all.checked ? t.sel.add(r.id) : t.sel.delete(r.id)); paintTable(id); };
  t.after && t.after(host);
}
const paintAll = () => Object.keys(TBL).forEach(paintTable);

/* ---------------- Navigation & roles ---------------- */
const ROLE_ACCESS = {
  hr: ['*'],
  manager: ['beranda', 'absensi', 'presensi', 'dailylog', 'workload', 'rekap', 'karyawan', 'rekrutmen', 'lowongan', 'pipeline', 'pkl', 'pengajuan', 'kalender', 'peserta', 'payslip', 'laporan', 'profil'],
  employee: ['beranda', 'absensi', 'presensi', 'dailylog', 'workload', 'payslip', 'profil'],
  finance: ['beranda', 'payroll', 'payslip', 'laporan', 'dokumen', 'profil']
};
const NAV = [
  { id: 'beranda', ico: '<i class=fi-rr-home></i>', label: 'Beranda' },
  { id: 'absensi', ico: '<i class=fi-rr-check-circle></i>', label: 'Absensi', kids: [['presensi', 'Presensi Saya'], ['dailylog', 'Daily Log'], ['workload', 'Workload Malam'], ['rekap', 'Rekap Tim']] },
  { id: 'karyawan', ico: '<i class=fi-rr-users></i>', label: 'Karyawan' },
  { id: 'rekrutmen', ico: '<i class=fi-rr-bullseye-arrow></i>', label: 'Rekrutmen', kids: [['lowongan', 'Lowongan'], ['pipeline', 'Pipeline Pelamar']] },
  { id: 'pkl', ico: '<i class=fi-rr-graduation-cap></i>', label: 'Manajemen PKL', kids: [['pengajuan', 'Pengajuan'], ['kalender', 'Kalender Kuota'], ['peserta', 'Peserta Aktif'], ['evaluasi', 'Evaluasi'], ['sertifikat', 'Sertifikat']] },
  { id: 'payroll', ico: '<i class=fi-rr-coins></i>', label: 'Payroll' },
  { id: 'dokumen', ico: '<i class=fi-rr-document></i>', label: 'Dokumen & Template' },
  { id: 'laporan', ico: '<i class=fi-rr-chart-histogram></i>', label: 'Laporan' },
  { sep: 1 },
  { id: 'pengaturan', ico: '<i class=fi-rr-settings></i>', label: 'Pengaturan' },
  { id: 'profil', ico: '<i class=fi-rr-user></i>', label: 'Profil Pengguna' }
];
const allowed = id => { const a = ROLE_ACCESS[S.role]; return a.includes('*') || a.includes(id); };
const badges = () => ({ pengajuan: PKL.filter(p => p.status === 'Menunggu').length, workload: NIGHT.filter(n => n.status === 'Pending').length });
function buildNav() {
  const b = badges(), cur = currentRoute();
  const sbNav = $('#sbNav');
  if (sbNav) {
    const html = NAV.map(n => {
      if (n.sep) return '<div class="nav-sep"></div>';
      if (n.kids) {
        const kids = n.kids.filter(k => allowed(k[0]) || allowed(n.id)).filter(k => allowed(k[0]) || ROLE_ACCESS[S.role].includes('*'));
        if (!kids.length) return '';
        const open = kids.some(k => k[0] === cur);
        const tb = kids.reduce((a, k) => a + (b[k[0]] || 0), 0);
        return `<div class="nav-group ${open ? 'open' : ''}">
          <button class="nav-item" data-tip="${n.label}" data-group aria-expanded="${open}"><span class="nav-ico">${n.ico}</span><span class="nav-label">${n.label}</span>${tb ? `<span class="nav-badge">${tb}</span>` : ''}<span class="nav-caret">▶</span></button>
          <div class="nav-sub">${kids.map(k => `<a class="nav-item ${k[0] === cur ? 'active' : ''}" href="#${k[0]}"><span class="nav-label">${k[1]}</span>${b[k[0]] ? `<span class="nav-badge">${b[k[0]]}</span>` : ''}</a>`).join('')}</div></div>`;
      }
      if (!allowed(n.id)) return '';
      return `<a class="nav-item ${n.id === cur ? 'active' : ''}" href="#${n.id}" data-tip="${n.label}"><span class="nav-ico">${n.ico}</span><span class="nav-label">${n.label}</span></a>`;
    }).join('');
    sbNav.innerHTML = html;
    $$('[data-group]').forEach(g => g.onclick = () => {
      if (document.body.classList.contains('collapsed')) { document.body.classList.remove('collapsed'); }
      const grp = g.parentElement; grp.classList.toggle('open'); g.setAttribute('aria-expanded', grp.classList.contains('open'));
    });
  }
  
  const nd = $('#notifDot'); 
  if (nd) {
    nd.textContent = b.pengajuan + b.workload; 
    nd.style.display = (b.pengajuan + b.workload) ? '' : 'none';
  }
}

/* ---------------- Views ---------------- */
const V = {};
const R = {}; // route registry
const reg = (id, title, crumb, render, actions) => R[id] = { title, crumb, render, actions };

/* ===== Beranda ===== */
reg('beranda', 'Beranda', ['Beranda'], () => {
  const b = badges();
  const hadir = TEAM_TODAY.filter(t => t.status.startsWith('Hadir')).length;
  return `
  <div class="grid g-main">
    <div class="stack">
      <div class="hero">
        <div class="caption" style="color:#BFD3FF">Presensi Hari Ini · ${TODAY.getDate()} ${BULAN[TODAY.getMonth()]} ${TODAY.getFullYear()}</div>
        <div class="clock" id="clock">--:--:--</div>
        <div id="homeStatus" style="margin:6px 0 16px">${S.attendance ? `<i class=fi-rr-check-circle></i> Tercatat <b>${esc(S.attendance.mode)}</b> pukul ${S.attendance.waktu}` : 'Belum presensi. Pilih mode kerja Anda hari ini.'}</div>
        <div class="row">
          <button class="btn btn-white btn-lg" data-go="presensi" data-mode="onsite"><i class=fi-rr-building></i> Hadir Onsite</button>
          <button class="btn btn-ghost btn-lg" data-go="presensi" data-mode="wfh"><i class=fi-rr-home></i> Hadir WFH</button>
        </div>
      </div>
      <div class="grid g4">
        <div class="card stat ok"><div class="k">Hadir hari ini</div><div class="v">${hadir}/${TEAM_TODAY.length}</div><div class="s up">▲ ${Math.round(hadir / TEAM_TODAY.length * 100)}% tim</div></div>
        <div class="card stat inf"><div class="k">Progres terkirim</div><div class="v">${TEAM_TODAY.filter(t => t.load > 0).length}</div><div class="s muted">Daily log hari ini</div></div>
        <div class="card stat warn"><div class="k">Menunggu approval</div><div class="v">${b.workload + b.pengajuan}</div><div class="s muted">Klaim malam + PKL</div></div>
        <div class="card stat"><div class="k">Kuota PKL terisi</div><div class="v">${occupancy(iso(TODAY))}/${S.settings.quotaMax}</div><div class="s muted">Hari ini</div></div>
      </div>
      <div class="card"><div class="card-h"><h3>Ringkasan Progres Tim</h3><a href="#rekap">Lihat rekap →</a></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Anggota</th><th>Status</th><th>Sedang dikerjakan</th><th class="r">Beban</th></tr></thead><tbody>
        ${TEAM_TODAY.slice(0, 5).map(t => `<tr><td>${person(t.nama, t.tim)}</td><td>${lz(t.status)}</td><td>${esc(t.task)}</td><td class="r num">${t.load}/${t.cap} SP</td></tr>`).join('')}
        </tbody></table></div></div>
    </div>
    <div class="stack">
      <div class="card"><div class="card-h"><h3>Tugas Menunggu Approval</h3></div><div class="card-b stack">
        ${NIGHT.filter(n => n.status === 'Pending').map(n => `<div class="row">${av(n.nama)}<div style="flex:1"><b>${esc(n.nama)}</b><div class="caption">Klaim Workload Malam · ${n.jam} jam · ${n.waktu}</div></div><a class="btn btn-sm" href="#workload">Tinjau</a></div>`).join('') || '<div class="empty-state">Tidak ada approval tertunda <i class=fi-rr-party-horn></i></div>'}
        ${PKL.filter(p => p.status === 'Menunggu').map(p => `<div class="row">${av(p.nama)}<div style="flex:1"><b>${esc(p.nama)}</b><div class="caption">Pengajuan PKL · ${esc(p.instansi)}</div></div><a class="btn btn-sm" href="#pengajuan">Tinjau</a></div>`).join('')}
      </div></div>
      <div class="card"><div class="card-h"><h3>Pengumuman</h3></div><div class="card-b stack">
        <div class="banner info" style="margin:0"><i class=fi-rr-megaphone></i> <span>Payroll Oktober ditutup tanggal 25. Pastikan Daily Log lengkap.</span></div>
        <div class="banner warn" style="margin:0"><i class=fi-rr-moon></i> <span>Klaim Workload Malam muncul otomatis setelah ${S.settings.nightThreshold}.</span></div>
        <div class="banner ok" style="margin:0"><i class=fi-rr-graduation-cap></i> <span>${PKL.filter(p => p.status === 'Aktif').length} peserta PKL aktif bulan ini.</span></div>
      </div></div>
    </div>
  </div>`;
}, () => { $$('[data-go]').forEach(b => b.onclick = () => { S.pendingMode = b.dataset.mode; location.hash = b.dataset.go; }); });

/* ===== Presensi Saya ===== */
reg('presensi', 'Presensi Saya', ['Absensi', 'Presensi Saya'], () => {
  const a = S.attendance, mode = S.pendingMode || 'onsite';
  return `
  <div class="checkin">
    <div class="stack">
      <div class="hero"><div class="caption" style="color:#BFD3FF">Waktu server</div><div class="clock" id="clock">--:--:--</div>
        <div style="margin-top:8px">${a ? `<i class=fi-rr-check-circle></i> <b>${esc(a.mode)}</b> · ${a.waktu} · ${esc(a.metode)}` : 'Satu klik untuk hadir. Fokus ke progres, bukan jam.'}</div></div>
      <div class="card"><div class="card-h"><h3>1 · Pilih mode kerja</h3></div><div class="card-b stack">
        <div class="seg" role="tablist" id="modeSeg"><button data-m="onsite" class="${mode === 'onsite' ? 'on' : ''}"><i class=fi-rr-building></i> Onsite</button><button data-m="wfh" class="${mode === 'wfh' ? 'on' : ''}"><i class=fi-rr-home></i> WFH</button></div>
        <div id="modePanel"></div>
        <button class="btn btn-primary btn-lg" id="btnHadir" ${a ? 'disabled' : ''}>${a ? 'Sudah hadir hari ini' : 'Hadir'}</button>
        <div id="hadirResult"></div>
      </div></div>
    </div>
    <div class="stack">
      <div class="card"><div class="card-h"><h3>Status validasi</h3>${a ? lz(a.mode) : lz('Belum presensi', 'neutral')}</div><div class="card-b">
        <ul class="check-list" id="checks"></ul></div></div>
      <div class="card"><div class="card-h"><h3>Progres hari ini</h3></div><div class="card-b">
        ${a ? (a.logged ? `${lz('Kehadiran penuh', 'success')}<p style="margin-top:8px">${esc(a.logged)}</p>` : `${lz('Belum Submit Progres')}<p class="muted" style="margin:8px 0">Isi Daily Log agar kehadiran penuh (ABS-05).</p><a class="btn btn-sm btn-primary" href="#dailylog">Isi Daily Log</a>`) : '<span class="muted">Presensi dulu, lalu isi progres.</span>'}
      </div></div>
      <div class="card"><div class="card-h"><h3>Riwayat 5 hari</h3></div><div class="card-b"><ul class="timeline">
        ${[1, 2, 3, 4, 5].map(i => `<li><b>${fmtD(dOff(-i))}</b> ${lz(i % 2 ? 'Hadir WFH' : 'Hadir Onsite')}<div class="caption">${i % 2 ? 'Geolocation 41 m dari titik rumah' : 'Public IP kantor cocok'}</div></li>`).join('')}
      </ul></div></div>
    </div>
  </div>`;
}, () => {
  let mode = S.pendingMode || 'onsite';
  const panel = () => {
    const p = $('#modePanel');
    if (mode === 'onsite') p.innerHTML = `
      <div class="banner info" style="margin:0"><i class=fi-rr-info></i> <span>Browser tidak bisa membaca BSSID. Validasi memakai <b>Public IP statis</b> kantor (${esc(S.settings.officeIp)}).</span></div>
      <div class="field" style="margin-top:12px"><label class="lbl" for="simNet">Jaringan perangkat (simulasi)</label>
      <select class="input" id="simNet"><option value="ok">Wifi “${esc(S.settings.ssid)}” — ${esc(S.settings.officeIp)}</option><option value="bad">Jaringan lain — 118.99.12.7</option></select></div>`;
    else p.innerHTML = `
      <div class="map" aria-label="Peta lokasi"><div class="ring"></div><div class="pin"><i class=fi-rr-marker></i></div><div class="me" id="meDot" style="left:52%;top:55%"></div></div>
      <div class="field" style="margin-top:12px"><label class="lbl" for="simGeo">Lokasi perangkat (simulasi)</label>
      <select class="input" id="simGeo"><option value="40">Dalam radius — 40 m dari lokasi WFH</option><option value="150">Dalam radius — 150 m</option><option value="850">Di luar radius — 850 m</option></select></div>
      <label class="row"><input type="checkbox" id="pdpConsent" ${S.consent ? 'checked' : ''}> <span class="caption">Saya menyetujui pemrosesan koordinat lokasi sesuai UU PDP No. 27/2022.</span></label>`;
    $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    updateChecks();
    $('#simNet') && ($('#simNet').onchange = updateChecks);
    $('#simGeo') && ($('#simGeo').onchange = updateChecks);
    $('#pdpConsent') && ($('#pdpConsent').onchange = e => { S.consent = e.target.checked; updateChecks(); });
  };
  const evalCheck = () => {
    if (mode === 'onsite') { const ok = $('#simNet').value === 'ok'; return { ok, metode: 'Public IP', list: [[ok, 'Public IP cocok dengan terdaftar'], [ok, 'Jaringan Wifi “Asta” terdeteksi (via IP)']] }; }
    const d = +$('#simGeo').value, rad = S.settings.wfhRadius, ok = d <= rad && S.consent;
    return { ok, metode: 'Geolocation', dist: d, list: [[S.consent, 'Persetujuan data lokasi (PDP)'], [d <= rad, `Jarak ${d} m ${d <= rad ? '≤' : '>'} radius ${rad} m`], [true, 'Akurasi GPS ±12 m disimpan · tidak ada mock-location']] };
  };
  function updateChecks() {
    const r = evalCheck();
    $('#checks').innerHTML = r.list.map(([ok, t]) => `<li>${ok ? '<i class=fi-rr-check-circle></i>' : '<i class=fi-rr-cross-circle></i>'} <span>${t}</span></li>`).join('');
    const dot = $('#meDot'); if (dot && r.dist) { const off = Math.min(r.dist / 900, 1) * 40; dot.style.left = (50 + off) + '%'; dot.style.top = (50 + off * .6) + '%'; }
  }
  $$('#modeSeg button').forEach(b => b.onclick = () => { mode = b.dataset.m; S.pendingMode = mode; panel(); });
  $('#btnHadir').onclick = () => {
    const r = evalCheck();
    if (!r.ok) {
      $('#hadirResult').innerHTML = `<div class="banner danger"><i class=fi-rr-cross-circle></i> <span>${mode === 'onsite' ? 'IP/jaringan tidak cocok dengan kantor. Silakan pilih <b>mode WFH</b>.' : (!S.consent ? 'Setujui pemrosesan data lokasi dulu.' : 'Posisi di luar radius toleransi WFH.')}</span></div>`;
      toast('Presensi ditolak — validasi gagal', 'error'); return;
    }
    S.attendance = { mode: mode === 'onsite' ? 'Hadir Onsite' : 'Hadir WFH', waktu: nowTime(), metode: r.metode };
    audit('Presensi', 'Attendance', `${S.attendance.mode} via ${r.metode}`);
    toast(`${S.attendance.mode} tercatat ${S.attendance.waktu}`, 'success'); delete S.pendingMode; render();
  };
  panel();
});

/* ===== Daily Log ===== */
reg('dailylog', 'Daily Log', ['Absensi', 'Daily Log'], () => `
  <div class="grid g-main">
    <div class="card"><div class="card-h"><h3>Progres kerja hari ini</h3>${S.attendance ? lz(S.attendance.mode) : lz('Belum presensi', 'warning')}</div>
      <form class="card-b" id="logForm" novalidate>
        ${!S.attendance ? '<div class="banner warn"><i class=fi-rr-triangle-warning></i> <span>Anda belum presensi. Log tetap bisa disimpan, tetapi lakukan presensi di <a href="#presensi">Presensi Saya</a>.</span></div>' : ''}
        <div class="field"><label class="lbl" for="logSum">Ringkasan kerja *</label><textarea class="input" id="logSum" placeholder="Apa yang Anda selesaikan hari ini?"></textarea><div class="err">Isi ringkasan, tautan task, atau commit.</div></div>
        <div class="form-grid">
          <div class="field"><label class="lbl" for="logTask">Tautan task (Jira/Trello/ClickUp)</label><input class="input" id="logTask" placeholder="ASTA-231 atau URL"></div>
          <div class="field"><label class="lbl" for="logCommit">Tautan commit / PR</label><input class="input" id="logCommit" placeholder="github.com/org/repo/pull/12"></div>
          <div class="field"><label class="lbl" for="logHours">Jam kerja</label><input class="input" type="number" id="logHours" min="0" max="16" step="0.5" value="8"></div>
          <div class="field"><label class="lbl" for="logTime">Waktu submit (simulasi)</label><input class="input" type="time" id="logTime" value="${nowTime()}"></div>
        </div>
        <div id="nightBox"></div>
        <div class="row"><button class="btn btn-primary" type="submit">Simpan Daily Log</button><span class="caption">Dapat diedit sampai 23:59 hari ini · draft otomatis tersimpan</span></div>
      </form></div>
    <div class="stack">
      <div class="card"><div class="card-h"><h3>Aturan kehadiran penuh</h3></div><div class="card-b caption stack">
        <div><i class=fi-rr-check></i> Isi Daily Log, <b>atau</b></div><div><i class=fi-rr-check></i> Tautkan task Jira/Trello/ClickUp, <b>atau</b></div><div><i class=fi-rr-check></i> Tautkan commit/PR Git.</div></div></div>
      <div class="card"><div class="card-h"><h3>Log terbaru</h3></div><div class="card-b"><ul class="timeline" id="logList"></ul></div></div>
    </div>
  </div>`, () => {
  const draft = JSON.parse(sessionStorage.getItem('hr_draft') || '{}');
  ['logSum', 'logTask', 'logCommit'].forEach(i => { if (draft[i]) $('#' + i).value = draft[i]; $('#' + i).addEventListener('input', () => { draft[i] = $('#' + i).value; sessionStorage.setItem('hr_draft', JSON.stringify(draft)); }); });
  const list = () => $('#logList').innerHTML = LOGS.slice(0, 5).map(l => `<li><b>${esc(l.nama)}</b> · ${fmtD(l.tgl)}<div>${esc(l.ringkasan)}</div><div class="caption">${l.task ? '<i class=fi-rr-link></i> ' + esc(l.task) : ''} ${l.commit ? '· <i class=fi-rr-shuffle></i> commit' : ''}</div></li>`).join('');
  const night = () => {
    const t = $('#logTime').value, th = S.settings.nightThreshold;
    $('#nightBox').innerHTML = t >= th ? `<div class="banner warn" style="align-items:center"><i class=fi-rr-moon></i> <div style="flex:1"><b>Submit setelah ${th}.</b><div class="caption">Aktifkan klaim agar jam malam dikompensasi (${S.settings.compensation === 'carryover' ? 'carryover H+1' : 'insentif payroll'}).</div></div>
      <label class="switch"><input type="checkbox" id="nightToggle" aria-label="Klaim Workload Malam"><span></span></label></div>` : '';
  };
  $('#logTime').oninput = night; night(); list();
  $('#logForm').onsubmit = e => {
    e.preventDefault();
    const sum = $('#logSum').value.trim(), task = $('#logTask').value.trim(), commit = $('#logCommit').value.trim();
    const ok = sum || task || commit; $('#logSum').closest('.field').classList.toggle('has-err', !ok); if (!ok) return;
    const me = 'Dewi Lestari';
    LOGS.unshift({ id: Date.now(), tgl: iso(TODAY), nama: me, mode: S.attendance?.mode || '-', ringkasan: sum || task || commit, task, commit, jam: +$('#logHours').value });
    if (S.attendance) S.attendance.logged = sum || task || commit;
    let msg = 'Daily Log tersimpan — kehadiran penuh <i class=fi-rr-check-circle></i>';
    if ($('#nightToggle')?.checked) {
      const auto = S.settings.claimMode === 'auto' && (task || commit);
      NIGHT.unshift({ id: Date.now(), nama: me, tgl: iso(TODAY), waktu: $('#logTime').value, alasan: sum || task, tipe: S.settings.compensation === 'carryover' ? 'Carryover' : 'Insentif', jam: Math.max(1, +$('#logHours').value - 8 || 1), status: auto ? 'Approved' : 'Pending' });
      msg += auto ? ' · Klaim malam otomatis disetujui' : ' · Klaim malam masuk antrian approval';
      audit('Ajukan', 'Klaim malam', `${me} ${$('#logTime').value}`);
    }
    sessionStorage.removeItem('hr_draft'); toast(msg, 'success'); buildNav(); render();
  };
});

/* ===== Workload Malam ===== */
reg('workload', 'Workload Malam', ['Absensi', 'Workload Malam'], () => `
  <div class="banner info"><i class=fi-rr-moon></i> <span>Revisi/bugfix setelah <b>${esc(S.settings.nightThreshold)}</b> dapat diklaim. Mode kompensasi: <b>${S.settings.compensation === 'carryover' ? 'Carryover (masuk lebih siang H+1)' : 'Insentif lembur di payroll'}</b>. Approval: <b>${S.settings.claimMode === 'auto' ? 'otomatis bila terhubung commit/task' : 'manual Manajer'}</b>.</span></div>
  <div class="card">${table('night', {
  rows: () => NIGHT.map(n => ({ ...n })), size: 6,
  cols: [
    { k: 'nama', label: 'Karyawan', fmt: r => person(r.nama) }, { k: 'tgl', label: 'Tanggal', fmt: r => fmtD(r.tgl) }, { k: 'waktu', label: 'Waktu submit', cls: 'tabular' },
    { k: 'alasan', label: 'Pekerjaan' }, { k: 'jam', label: 'Jam', cls: 'r num' },
    { k: 'tipe', label: 'Kompensasi', fmt: r => lz(r.tipe, r.tipe === 'Insentif' ? 'primary' : 'info') },
    { k: 'status', label: 'Status', fmt: r => lz(r.status) },
    { k: 'x', label: 'Aksi', sort: false, fmt: r => r.status === 'Pending' && ['hr', 'manager'].includes(S.role) ? `<button class="btn btn-sm btn-success" data-ap="${r.id}">Setujui</button> <button class="btn btn-sm btn-danger" data-rj="${r.id}">Tolak</button>` : '—' }
  ],
  after: h => {
    $$('[data-ap]', h).forEach(b => b.onclick = () => { const n = NIGHT.find(x => x.id == b.dataset.ap); n.status = 'Approved'; audit('Approve', 'Klaim malam #' + n.id, `${n.tipe} ${n.jam} jam — ${n.nama}`); toast(`Klaim ${n.nama} disetujui` + (n.tipe === 'Carryover' ? ' · carryover H+1 dihitung otomatis' : ' · masuk payroll'), 'success'); buildNav(); paintAll(); });
    $$('[data-rj]', h).forEach(b => b.onclick = () => { const n = NIGHT.find(x => x.id == b.dataset.rj); n.status = 'Rejected'; audit('Reject', 'Klaim malam #' + n.id, n.nama); toast('Klaim ditolak', 'warn'); buildNav(); paintAll(); });
  }
})}</div>`, () => paintAll());

/* ===== Rekap Tim ===== */
reg('rekap', 'Rekap Tim', ['Absensi', 'Rekap Tim'], () => `
  <div class="grid g4" style="margin-bottom:16px">
    ${['Hadir Onsite', 'Hadir WFH', 'Belum Submit Progres', 'Tanpa Keterangan'].map(s => `<div class="card stat ${s.includes('Onsite') ? 'ok' : s.includes('WFH') ? 'inf' : s.includes('Belum') ? 'warn' : 'bad'}"><div class="k">${s}</div><div class="v">${TEAM_TODAY.filter(t => t.status === s).length}</div></div>`).join('')}
  </div>
  <div class="tabs" id="rekTabs"><button class="on" data-t="tbl">Tabel</button><button data-t="load">Dashboard Workload</button></div>
  <div id="rekBody"></div>`, () => {
  const show = t => {
    $$('#rekTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'tbl') {
      $('#rekBody').innerHTML = `<div class="card">${table('rekap', {
        rows: () => TEAM_TODAY.map((t, i) => ({ id: i + 1, ...t })),
        toolbar: () => `<select class="input" id="fStatus"><option value="">Semua status</option>${['Hadir Onsite', 'Hadir WFH', 'Belum Submit Progres', 'Tanpa Keterangan'].map(s => `<option>${s}</option>`).join('')}</select>`,
        cols: [{ k: 'nama', label: 'Karyawan', fmt: r => person(r.nama, r.tim) }, { k: 'tipe', label: 'Tipe', fmt: r => lz(r.tipe, r.tipe === 'Tetap' ? 'primary' : 'info') }, { k: 'status', label: 'Status', fmt: r => lz(r.status) }, { k: 'task', label: 'Task' }, { k: 'load', label: 'Beban (SP)', cls: 'r num', fmt: r => `${r.load}/${r.cap}` }]
      })}</div>`;
      paintTable('rekap');
    } else {
      $('#rekBody').innerHTML = `<div class="card"><div class="card-h"><h3>Kapasitas & Beban Kerja (story point harian)</h3></div><div class="card-b stack">
        ${TEAM_TODAY.map(t => { const p = Math.round(t.load / t.cap * 100); return `<div><div class="row"><b>${esc(t.nama)}</b><span class="spacer"></span><span class="caption num">${t.load}/${t.cap} SP · ${p}%</span></div><div class="bar ${p > 100 ? 'bad' : p > 85 ? 'warn' : 'ok'}"><i style="width:${Math.min(p, 100)}%"></i></div>${p > 100 ? '<div class="caption down">Overload — pertimbangkan redistribusi</div>' : ''}</div>`; }).join('')}</div></div>`;
    }
  };
  $$('#rekTabs button').forEach(b => b.onclick = () => show(b.dataset.t)); show('tbl');
});

/* ===== Karyawan ===== */
function empForm(e = {}) {
  return `<form id="empForm" class="form-grid" novalidate>
    <div class="field"><label class="lbl" for="eNama">Nama *</label><input class="input" id="eNama" value="${esc(e.nama)}"><div class="err">Wajib diisi</div></div>
    <div class="field"><label class="lbl" for="eEmail">Email *</label><input class="input" id="eEmail" type="email" value="${esc(e.email)}"><div class="err">Email tidak valid</div></div>
    <div class="field"><label class="lbl" for="eTipe">Tipe pekerja</label><select class="input" id="eTipe">${['Tetap', 'Freelance', 'PKL'].map(t => `<option ${e.tipe === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl" for="eTim">Tim</label><input class="input" id="eTim" value="${esc(e.tim || 'Engineering')}"></div>
    <div class="field"><label class="lbl" for="eJab">Jabatan</label><input class="input" id="eJab" value="${esc(e.jabatan)}"></div>
    <div class="field"><label class="lbl" for="eAtasan">Atasan</label><input class="input" id="eAtasan" value="${esc(e.atasan)}"></div>
    <div class="field"><label class="lbl" for="eGaji">Gaji pokok (Tetap)</label><input class="input" id="eGaji" type="number" value="${e.gaji || 0}"></div>
    <div class="field"><label class="lbl" for="eRate">Hourly rate (Freelance)</label><input class="input" id="eRate" type="number" value="${e.rate || 0}"></div>
  </form>`;
}
function saveEmp(existing) {
  const nama = $('#eNama').value.trim(), email = $('#eEmail').value.trim();
  const okN = !!nama, okE = /^\S+@\S+\.\S+$/.test(email);
  $('#eNama').closest('.field').classList.toggle('has-err', !okN); $('#eEmail').closest('.field').classList.toggle('has-err', !okE);
  if (!okN || !okE) return false;
  const d = { nama, email, tipe: $('#eTipe').value, tim: $('#eTim').value, jabatan: $('#eJab').value, atasan: $('#eAtasan').value, gaji: +$('#eGaji').value, rate: +$('#eRate').value };
  if (existing) Object.assign(existing, d); else EMP.push({ id: Date.now(), tunj: 0, status: 'Aktif', masuk: iso(TODAY), ...d });
  audit(existing ? 'Ubah' : 'Tambah', 'Karyawan', nama); toast('Data karyawan disimpan', 'success'); return true;
}
reg('karyawan', 'Karyawan', ['Karyawan'], () => `
  <div class="card">${table('emp', {
  rows: () => EMP, size: 8,
  bulk: '<button class="btn btn-sm" id="bulkExport">Ekspor</button> <button class="btn btn-sm" id="bulkMsg">Kirim pengumuman</button>',
  toolbar: () => `<div class="row" id="empChips">${['Semua', 'Tetap', 'Freelance', 'PKL'].map(c => `<button class="chip ${(TBL.emp.f || 'Semua') === c ? 'on' : ''}" data-f="${c}">${c}</button>`).join('')}</div>`,
  cols: [
    { k: 'nama', label: 'Nama', fmt: r => person(r.nama, r.email) },
    { k: 'tipe', label: 'Tipe', fmt: r => lz(r.tipe, { Tetap: 'primary', Freelance: 'info', PKL: 'warning' }[r.tipe]) },
    { k: 'tim', label: 'Tim' }, { k: 'jabatan', label: 'Jabatan' }, { k: 'atasan', label: 'Atasan' }, { k: 'status', label: 'Status', fmt: r => lz(r.status) }
  ],
  onRow: id => { const e = EMP.find(x => x.id === id); empDrawer(e); },
  after: h => {
    $$('[data-f]', h).forEach(b => b.onclick = () => { TBL.emp.f = b.dataset.f; TBL.emp.page = 1; paintTable('emp'); });
    const bx = $('#bulkExport', h); if (bx) bx.onclick = () => toast(`${TBL.emp.sel.size} karyawan diekspor ke CSV`, 'success');
    const bm = $('#bulkMsg', h); if (bm) bm.onclick = () => toast('Pengumuman terkirim', 'success');
  }
})}</div>`, () => {
  const t = TBL.emp, base = t.rows; t.rows = () => base().filter(e => !t.f || t.f === 'Semua' || e.tipe === t.f); paintTable('emp');
}, () => `<button class="btn btn-primary" id="btnAddEmp">+ Tambah Karyawan</button>`);
function empDrawer(e) {
  const s = e.tipe === 'PKL' ? null : computePayslip(e);
  openDrawer(e.nama, `
    <div class="person" style="margin-bottom:16px">${av(e.nama)}<div><h3>${esc(e.nama)}</h3><div class="caption">${esc(e.jabatan)} · ${esc(e.tim)}</div></div></div>
    <dl class="kv"><dt>Email</dt><dd>${esc(e.email)}</dd><dt>Tipe</dt><dd>${lz(e.tipe, { Tetap: 'primary', Freelance: 'info', PKL: 'warning' }[e.tipe])}</dd><dt>Atasan</dt><dd>${esc(e.atasan)}</dd><dt>Bergabung</dt><dd>${fmtD(e.masuk)}</dd>
    <dt>${e.tipe === 'Freelance' ? 'Hourly rate' : 'Gaji pokok'}</dt><dd class="num">${S.role === 'hr' || S.role === 'finance' ? (e.tipe === 'Freelance' ? rp(e.rate) + '/jam' : e.tipe === 'Tetap' ? rp(e.gaji) : '—') : '••••••'}</dd></dl>
    <div class="sep"></div><h3 style="margin-bottom:8px">Dokumen</h3>
    ${['Kontrak kerja.pdf', 'KTP.jpg', 'NPWP.pdf'].map(d => `<div class="row" style="padding:4px 0"><i class=fi-rr-clip></i> ${d}<span class="spacer"></span>${S.role === 'hr' ? '<a href="#" data-dl>Unduh</a>' : lz('Terbatas')}</div>`).join('')}
    ${s ? `<div class="sep"></div><h3 style="margin-bottom:8px">Estimasi gaji bulan ini</h3><div class="num" style="font-size:22px;font-weight:600">${rp(s.net)}</div>` : ''}`,
    S.role === 'hr' ? '<button class="btn" id="dEdit">Ubah</button><button class="btn btn-danger" id="dOff">Nonaktifkan</button>' : '');
  $$('[data-dl]').forEach(a => a.onclick = ev => { ev.preventDefault(); toast('Mengunduh dokumen (dicatat di audit log)', 'info'); audit('Unduh', 'Dokumen', e.nama); });
  if ($('#dEdit')) $('#dEdit').onclick = () => { closeDrawer(); openModal('Ubah Karyawan', empForm(e), '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">Simpan</button>'); $('#mCancel').onclick = closeModal; $('#mSave').onclick = () => { if (saveEmp(e)) { closeModal(); paintAll(); } }; };
  if ($('#dOff')) $('#dOff').onclick = () => { e.status = e.status === 'Aktif' ? 'Nonaktif' : 'Aktif'; audit('Ubah status', 'Karyawan', `${e.nama} → ${e.status}`); toast('Status diperbarui', 'success'); closeDrawer(); paintAll(); };
}

/* ===== Lowongan ===== */
function jobForm(j = {}) {
  return `<form id="jobForm" class="form-grid" novalidate>
    <div class="field full"><label class="lbl" for="jJudul">Posisi *</label><input class="input" id="jJudul" value="${esc(j.judul)}"><div class="err">Wajib diisi</div></div>
    <div class="field"><label class="lbl" for="jTim">Tim</label><input class="input" id="jTim" value="${esc(j.tim)}"></div>
    <div class="field"><label class="lbl" for="jLevel">Level</label><select class="input" id="jLevel">${['Junior', 'Mid', 'Senior', 'Lead'].map(l => `<option ${j.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label class="lbl" for="jLok">Lokasi</label><input class="input" id="jLok" value="${esc(j.lokasi || 'Hybrid — Jakarta')}"></div>
    <div class="field"><label class="lbl" for="jStatus">Status</label><select class="input" id="jStatus">${['Draft', 'Published', 'Closed'].map(l => `<option ${j.status === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field full"><label class="lbl" for="jSkill">Skill</label><input class="input" id="jSkill" value="${esc(j.skill)}"></div>
    <div class="field full"><label class="lbl" for="jDesk">Deskripsi</label><textarea class="input" id="jDesk">${esc(j.deskripsi)}</textarea></div></form>`;
}
function openJob(j) {
  openModal(j ? 'Ubah Lowongan' : 'Lowongan Baru', jobForm(j), '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">Simpan</button>');
  $('#mCancel').onclick = closeModal;
  $('#mSave').onclick = () => {
    const ju = $('#jJudul').value.trim(); $('#jJudul').closest('.field').classList.toggle('has-err', !ju); if (!ju) return;
    const d = { judul: ju, tim: $('#jTim').value, level: $('#jLevel').value, lokasi: $('#jLok').value, status: $('#jStatus').value, skill: $('#jSkill').value, deskripsi: $('#jDesk').value };
    if (j) Object.assign(j, d); else JOBS.unshift({ id: Date.now(), ...d });
    audit(j ? 'Ubah' : 'Buat', 'Lowongan', ju); toast('Lowongan disimpan', 'success'); closeModal(); paintAll();
  };
}
reg('lowongan', 'Lowongan', ['Rekrutmen', 'Lowongan'], () => `
  <div class="banner info"><i class=fi-rr-info></i> <span>Integrasi LinkedIn bergantung pada akses partner resmi. Cadangan: tautan “Apply with LinkedIn” atau impor manual.</span></div>
  <div class="card">${table('jobs', {
  rows: () => JOBS.map(j => ({ ...j, pelamar: APP.filter(a => a.job === j.id).length })),
  cols: [{ k: 'judul', label: 'Posisi', fmt: r => `<b>${esc(r.judul)}</b><div class="caption">${esc(r.skill)}</div>` }, { k: 'tim', label: 'Tim' }, { k: 'level', label: 'Level' }, { k: 'lokasi', label: 'Lokasi' }, { k: 'pelamar', label: 'Pelamar', cls: 'r num' }, { k: 'status', label: 'Status', fmt: r => lz(r.status) },
    { k: 'x', label: '', sort: false, fmt: r => `<button class="btn btn-sm" data-ej="${r.id}">Ubah</button>` }],
  after: h => $$('[data-ej]', h).forEach(b => b.onclick = () => openJob(JOBS.find(j => j.id == b.dataset.ej)))
})}</div>`, () => paintAll(),
  () => `<button class="btn" id="btnCareer"><i class=fi-rr-globe></i> Pratinjau Career Page</button><button class="btn btn-primary" id="btnAddJob">+ Lowongan</button>`);

function careerPage() {
  openModal('Career Page Publik', `<div class="pub card-b" style="border-radius:12px"><h2>Bergabung dengan AstaCode</h2><p class="muted" style="margin-bottom:16px">Software house dengan kultur fleksibel & kekeluargaan.</p>
    ${JOBS.filter(j => j.status === 'Published').map(j => `<div class="card card-b" style="margin-bottom:10px"><div class="row"><div style="flex:1"><b>${esc(j.judul)}</b><div class="caption">${esc(j.tim)} · ${esc(j.level)} · ${esc(j.lokasi)}</div></div><button class="btn btn-primary btn-sm" data-apply="${j.id}">Lamar</button></div></div>`).join('')}</div>`, '', true);
  $$('[data-apply]').forEach(b => b.onclick = () => { toast('Form lamaran terkirim (demo). Pelamar masuk ke pipeline “Applied”.', 'success'); APP.push({ id: Date.now(), nama: 'Pelamar Baru ' + (APP.length + 1), job: +b.dataset.apply, stage: 'Applied', skor: 0, email: 'baru@mail.com', hp: '-', edu: '-', exp: '-', skill: '-' }); closeModal(); paintAll(); });
}

/* ===== Pipeline (Kanban) ===== */
reg('pipeline', 'Pipeline Pelamar', ['Rekrutmen', 'Pipeline Pelamar'], () => `
  <div class="toolbar card" style="border-radius:8px;margin-bottom:12px"><span class="muted">Posisi:</span><select class="input" id="pipeJob"><option value="0">Semua posisi</option>${JOBS.map(j => `<option value="${j.id}">${esc(j.judul)}</option>`).join('')}</select><span class="spacer"></span><span class="caption">Seret kartu antar kolom</span></div>
  <div class="board" id="board"></div>`, () => {
  const draw = () => {
    const jf = +$('#pipeJob').value;
    $('#board').innerHTML = STAGES.map(st => {
      const items = APP.filter(a => a.stage === st && (!jf || a.job === jf));
      return `<div class="col" data-stage="${st}"><div class="col-h"><span>${st}</span><span class="wip">${items.length}</span></div>
        ${items.map(a => `<div class="kcard" draggable="true" data-id="${a.id}" tabindex="0"><div class="t">${esc(a.nama)}</div><div class="caption">${esc(JOBS.find(j => j.id === a.job)?.judul || '')}</div>
        <div style="margin-top:6px">${a.skill.split(',').slice(0, 2).map(s => `<span class="tag">${esc(s.trim())}</span>`).join('')}</div>
        <div class="row" style="margin-top:6px">${av(a.nama, 1)}<span class="spacer"></span><span class="caption">${a.skor ? '<i class=fi-rr-star></i> ' + a.skor : 'Belum dinilai'}</span></div></div>`).join('')}</div>`;
    }).join('');
    $$('.kcard').forEach(c => {
      c.ondragstart = e => { e.dataTransfer.setData('text', c.dataset.id); c.classList.add('drag'); };
      c.ondragend = () => c.classList.remove('drag');
      c.onclick = () => applicantDrawer(APP.find(a => a.id == c.dataset.id), draw);
      c.onkeydown = e => e.key === 'Enter' && c.click();
    });
    $$('.col').forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add('over'); };
      col.ondragleave = () => col.classList.remove('over');
      col.ondrop = e => { e.preventDefault(); const a = APP.find(x => x.id == e.dataTransfer.getData('text')); if (!a || a.stage === col.dataset.stage) return draw(); a.stage = col.dataset.stage; audit('Pindah stage', 'Pelamar', `${a.nama} → ${a.stage}`); toast(`${a.nama} → ${a.stage}`, a.stage === 'Rejected' ? 'warn' : 'success'); draw(); };
    });
  };
  $('#pipeJob').onchange = draw; draw();
});
function applicantDrawer(a, redraw) {
  const job = JOBS.find(j => j.id === a.job);
  openDrawer(a.nama, `
    <div class="person" style="margin-bottom:12px">${av(a.nama)}<div><h3>${esc(a.nama)}</h3><div class="caption">${esc(job?.judul)}</div></div><span class="spacer"></span>${lz(a.stage, a.stage === 'Hired' ? 'success' : a.stage === 'Rejected' ? 'danger' : 'primary')}</div>
    <div class="banner ok"><i class=fi-rr-robot></i> <span>Auto-parsing resume (ATS) selesai</span></div>
    <dl class="kv"><dt>Email</dt><dd>${esc(a.email)}</dd><dt>Telepon</dt><dd>${esc(a.hp)}</dd><dt>Pendidikan</dt><dd>${esc(a.edu)}</dd><dt>Pengalaman</dt><dd>${esc(a.exp)}</dd><dt>Skill</dt><dd>${a.skill.split(',').map(s => `<span class="tag">${esc(s.trim())}</span>`).join('')}</dd></dl>
    <div class="sep"></div><h3 style="margin-bottom:8px">Scorecard interviewer</h3>
    ${['Teknis', 'Komunikasi', 'Kultur fit'].map(k => `<div class="field"><label class="lbl" for="sc-${sl(k)}">${k}: <b id="v-${sl(k)}">${a.skor || 3}</b>/5</label><input type="range" min="1" max="5" step="0.5" value="${a.skor || 3}" id="sc-${sl(k)}" style="width:100%"></div>`).join('')}
    <div class="field"><label class="lbl" for="aNote">Catatan kolaboratif</label><textarea class="input" id="aNote" placeholder="Tulis catatan…"></textarea></div>`,
    `<button class="btn btn-danger" id="aRej">Tolak</button><button class="btn" id="aSave">Simpan skor</button>${a.stage === 'Offering' || a.stage === 'Hired' ? '<button class="btn btn-success" id="aHire">Jadikan Karyawan</button>' : ''}`);
  const sc = ['Teknis', 'Komunikasi', 'Kultur fit'];
  sc.forEach(k => $('#sc-' + sl(k)).oninput = e => $('#v-' + sl(k)).textContent = e.target.value);
  $('#aSave').onclick = () => { a.skor = +(sc.reduce((s, k) => s + +$('#sc-' + sl(k)).value, 0) / 3).toFixed(1); toast('Skor rata-rata ' + a.skor, 'success'); redraw(); closeDrawer(); };
  $('#aRej').onclick = () => { a.stage = 'Rejected'; audit('Reject', 'Pelamar', a.nama); toast('Pelamar ditolak', 'warn'); redraw(); closeDrawer(); };
  if ($('#aHire')) $('#aHire').onclick = () => {
    a.stage = 'Hired'; EMP.push({ id: Date.now(), nama: a.nama, email: a.email, tipe: 'Tetap', tim: job?.tim || '-', jabatan: job?.judul || '-', atasan: '-', gaji: 0, tunj: 0, rate: 0, status: 'Aktif', masuk: iso(TODAY) });
    audit('Konversi', 'Pelamar → Karyawan', a.nama); toast(`${a.nama} kini tercatat sebagai karyawan (tanpa input ulang)`, 'success'); redraw(); closeDrawer();
  };
}

/* ===== PKL: Pengajuan ===== */
function letterText(tplKey, p, nomor) {
  return TEMPLATES[tplKey].body.replace(/{{nama_siswa}}/g, p.nama).replace(/{{sekolah}}/g, p.instansi).replace(/{{tanggal_mulai}}/g, fmtD(p.mulai)).replace(/{{tanggal_selesai}}/g, fmtD(p.selesai)).replace(/{{nomor_surat}}/g, nomor || '—');
}
const nextNo = (k) => `${String(S.settings.letterNo++).padStart(3, '0')}/ASTA-HR/${k}/${TODAY.getFullYear()}`;
function letterPaper(txt, signed) {
  return `<div class="paper letter"><div class="brandline">ASTACODE · SOFTWARE HOUSE</div><div class="caption" style="margin-bottom:12px">Jl. Teknologi No. 1, Jakarta · hr@astacode.id</div><hr><pre style="font:inherit;white-space:pre-wrap;margin-top:12px">${esc(txt)}</pre>
  <div style="position:absolute;right:32px;bottom:28px;text-align:center">${signed ? '<div class="sig">Rina A.</div>' : '<div style="height:36px"></div>'}<div style="border-top:1px solid #333;padding-top:2px">${esc(S.settings.signer)}</div>${signed ? '<div class="row" style="justify-content:center;margin-top:4px"><div class="qr" style="width:36px;height:36px"></div><span class="caption">TTD digital</span></div>' : ''}</div></div>`;
}
function reviewPkl(id) {
  const p = PKL.find(x => x.id === id), q = checkQuota(p.mulai, p.selesai, p.id);
  const days = [];
  for (let d = parse(p.mulai), i = 0; iso(d) <= p.selesai && i < 120; d = addDays(d, 1), i++) days.push(occupancy(iso(d), p.id));
  const mx = S.settings.quotaMax;
  openDrawer(p.nama, `
    <div class="row" style="margin-bottom:12px"><h3 style="flex:1">${esc(p.instansi)}</h3>${lz(p.status)}</div>
    <dl class="kv"><dt>Jurusan</dt><dd>${esc(p.jurusan)}</dd><dt>Kontak</dt><dd>${esc(p.kontak)}</dd><dt>Periode</dt><dd>${fmtD(p.mulai)} – ${fmtD(p.selesai)}</dd><dt>Surat</dt><dd><i class=fi-rr-document></i> surat-permohonan.pdf <a href="#" data-dl>Lihat</a></dd><dt>No. surat</dt><dd>${esc(p.nomor || '—')}</dd></dl>
    <div class="sep"></div><h3 style="margin-bottom:8px">Hasil cek kuota (auto-overlap)</h3>
    <div class="banner ${q.available ? 'ok' : 'danger'}">${q.available ? '<i class=fi-rr-check-circle></i>' : '<i class=fi-rr-cross-circle></i>'} <span>${q.available ? `<b>Available</b> — okupansi tertinggi ${q.max}/${mx} dalam ${q.days} hari.` : `<b>Kuota Penuh</b> mulai ${fmtD(q.fullDay)} (${q.max}/${mx}).`}</span></div>
    <div class="caption" style="margin-bottom:4px">Okupansi harian dalam rentang</div>
    <div class="chart" style="height:80px;gap:1px">${days.map(d => `<div class="c" style="gap:0"><i style="height:${d / mx * 100}%;max-width:none;background:${d >= mx ? '#DC2626' : d >= mx - 1 ? '#D97706' : '#16A34A'}"></i></div>`).join('')}</div>
    ${p.status === 'Menunggu' ? `<div class="sep"></div><div class="field"><label class="lbl" for="pDiv">Divisi</label><select class="input" id="pDiv">${['Engineering', 'Design', 'QA'].map(d => `<option>${d}</option>`).join('')}</select></div><div class="field"><label class="lbl" for="pPemb">Pembimbing</label><select class="input" id="pPemb">${EMP.filter(e => e.tipe === 'Tetap').map(e => `<option>${esc(e.nama)}</option>`).join('')}</select></div>` : ''}`,
    ['hr'].includes(S.role) && p.status === 'Menunggu' ? `<button class="btn btn-danger" id="pRej">Tolak (surat otomatis)</button><button class="btn btn-success" id="pAcc" ${q.available ? '' : 'disabled'}>Terima & Terbitkan Surat</button>` : (p.nomor ? '<button class="btn" id="pLet">Lihat Surat</button>' : ''));
  $$('[data-dl]').forEach(a => a.onclick = e => { e.preventDefault(); toast('Membuka PDF surat permohonan', 'info'); });
  const finish = (accept) => {
    const re = checkQuota(p.mulai, p.selesai, p.id);
    if (accept && !re.available) { toast('Kuota berubah saat approval — pengecekan ulang gagal', 'error'); return; }
    p.nomor = nextNo(accept ? 'PKL' : 'PKL-TLK'); p.status = accept ? 'Aktif' : 'Ditolak';
    if (accept) { p.divisi = $('#pDiv').value; p.pembimbing = $('#pPemb').value; }
    audit(accept ? 'Terima' : 'Tolak', 'Pengajuan PKL', `${p.nama} · ${p.nomor}`);
    toast(`Surat ${accept ? 'balasan' : 'penolakan'} dibuat & dikirim ke ${esc(p.kontak)}`, accept ? 'success' : 'warn');
    closeDrawer(); buildNav(); paintAll();
    openModal('Surat ' + (accept ? 'Penerimaan' : 'Penolakan') + ' PKL', letterPaper(letterText(accept ? 'accept' : 'reject', p, p.nomor), true), '<button class="btn btn-primary" id="mDone">Tutup</button>'); $('#mDone').onclick = closeModal;
  };
  if ($('#pAcc')) $('#pAcc').onclick = () => finish(true);
  if ($('#pRej')) $('#pRej').onclick = () => finish(false);
  if ($('#pLet')) $('#pLet').onclick = () => openModal('Surat PKL', letterPaper(letterText(p.status === 'Ditolak' ? 'reject' : 'accept', p, p.nomor), true), '<button class="btn" onclick="window.print()">Cetak</button>');
}
reg('pengajuan', 'Pengajuan PKL', ['Manajemen PKL', 'Pengajuan'], () => `
  <div class="banner info"><i class=fi-rr-shield-check></i> <span>Mode kuota penuh: <b>${S.settings.autoReject ? 'Auto-reject dengan surat penolakan' : 'Tinjau manual oleh HR'}</b> (dapat diubah di Pengaturan).</span></div>
  <div class="card">${table('pkl', {
  rows: () => PKL.map(p => ({ ...p, q: p.status === 'Menunggu' ? (checkQuota(p.mulai, p.selesai, p.id).available ? 'Available' : 'Kuota Penuh') : '—' })),
  toolbar: () => `<select class="input" id="fPkl"><option value="">Semua status</option>${['Menunggu', 'Aktif', 'Ditolak', 'Selesai'].map(s => `<option ${TBL.pkl.f === s ? 'selected' : ''}>${s}</option>`).join('')}</select>`,
  cols: [{ k: 'nama', label: 'Pemohon', fmt: r => person(r.nama, r.jurusan) }, { k: 'instansi', label: 'Instansi' }, { k: 'mulai', label: 'Periode', fmt: r => `${fmtD(r.mulai)} – ${fmtD(r.selesai)}` }, { k: 'q', label: 'Cek kuota', fmt: r => r.q === '—' ? '—' : lz(r.q) }, { k: 'status', label: 'Status', fmt: r => lz(r.status) }],
  onRow: reviewPkl,
  after: h => { const f = $('#fPkl', h); if (f) f.onchange = () => { TBL.pkl.f = f.value; TBL.pkl.page = 1; paintTable('pkl'); }; }
})}</div>`, () => { const t = TBL.pkl, b = t.rows; t.rows = () => b().filter(p => !t.f || p.status === t.f); paintTable('pkl'); },
  () => `<button class="btn" id="btnPublicForm"><i class=fi-rr-globe></i> Buka Form Publik</button>`);

function publicPklForm() {
  openModal('Form Pengajuan PKL (Portal Publik)', `
  <form id="pubForm" class="form-grid" novalidate>
    <div class="field"><label class="lbl" for="fNama">Nama siswa/mahasiswa *</label><input class="input" id="fNama"><div class="err">Wajib diisi</div></div>
    <div class="field"><label class="lbl" for="fInst">Sekolah / Kampus *</label><input class="input" id="fInst"><div class="err">Wajib diisi</div></div>
    <div class="field"><label class="lbl" for="fJur">Jurusan</label><input class="input" id="fJur"></div>
    <div class="field"><label class="lbl" for="fKon">Email kontak *</label><input class="input" id="fKon" type="email"><div class="err">Email tidak valid</div></div>
    <div class="field"><label class="lbl" for="fMulai">Tanggal mulai *</label><input class="input" id="fMulai" type="date" value="${dOff(14)}"></div>
    <div class="field"><label class="lbl" for="fSelesai">Tanggal selesai *</label><input class="input" id="fSelesai" type="date" value="${dOff(104)}"><div class="err">Tanggal selesai harus setelah mulai</div></div>
    <div class="field full"><label class="lbl">Surat permohonan (PDF, maks 5 MB) *</label><label class="drop" id="drop"><input type="file" id="fFile" accept="application/pdf" hidden><span id="dropTxt"><i class=fi-rr-document></i> Klik untuk unggah PDF</span></label><div class="err" id="fileErr" style="color:var(--danger);font-size:12px;display:none"></div></div>
    <div class="field full"><label class="row"><input type="checkbox" id="fCap"> <span>Saya bukan robot (captcha)</span></label><div class="err">Verifikasi captcha dulu</div></div>
    <div class="full" id="quotaLive"></div></form>`, '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">Kirim Pengajuan</button>');
  let file = null;
  const live = () => {
    const s = $('#fMulai').value, e = $('#fSelesai').value; if (!s || !e || e < s) { $('#quotaLive').innerHTML = ''; return; }
    const q = checkQuota(s, e); $('#quotaLive').innerHTML = `<div class="banner ${q.available ? 'ok' : 'danger'}">${q.available ? '<i class=fi-rr-check-circle></i> Kuota tersedia pada periode ini' : `<i class=fi-rr-cross-circle></i> Kuota penuh mulai ${fmtD(q.fullDay)}`}</div>`;
  };
  $('#fMulai').onchange = $('#fSelesai').onchange = live; live();
  $('#fFile').onchange = e => {
    const f = e.target.files[0], er = $('#fileErr'); er.style.display = 'none'; file = null; $('#drop').classList.remove('ok');
    if (!f) return;
    if (f.type !== 'application/pdf') { er.textContent = 'File harus PDF'; er.style.display = 'block'; return; }
    if (f.size > 5 * 1024 * 1024) { er.textContent = 'Ukuran maksimal 5 MB'; er.style.display = 'block'; return; }
    file = f; $('#dropTxt').textContent = '<i class=fi-rr-check-circle></i> ' + f.name; $('#drop').classList.add('ok');
  };
  $('#mCancel').onclick = closeModal;
  $('#mSave').onclick = () => {
    const chk = (id, ok) => { $('#' + id).closest('.field').classList.toggle('has-err', !ok); return ok; };
    const v = [chk('fNama', !!$('#fNama').value.trim()), chk('fInst', !!$('#fInst').value.trim()), chk('fKon', /^\S+@\S+\.\S+$/.test($('#fKon').value)), chk('fSelesai', $('#fSelesai').value > $('#fMulai').value), chk('fCap', $('#fCap').checked)];
    if (!file) { const er = $('#fileErr'); er.textContent = 'Surat permohonan wajib diunggah'; er.style.display = 'block'; v.push(false); }
    if (v.includes(false)) return;
    const p = { id: Date.now(), nama: $('#fNama').value, instansi: $('#fInst').value, jurusan: $('#fJur').value, kontak: $('#fKon').value, mulai: $('#fMulai').value, selesai: $('#fSelesai').value, status: 'Menunggu', divisi: '', pembimbing: '', nomor: '' };
    PKL.unshift(p);
    const q = checkQuota(p.mulai, p.selesai, p.id);
    if (!q.available && S.settings.autoReject) { p.status = 'Ditolak'; p.nomor = nextNo('PKL-TLK'); toast('Kuota penuh — surat penolakan otomatis dikirim', 'warn'); }
    else toast('Pengajuan diterima. Link status dikirim ke email.', 'success');
    audit('Ajukan', 'PKL (publik)', p.nama); closeModal(); buildNav(); if (currentRoute() === 'pengajuan') render();
  };
}

/* ===== Kalender Kuota ===== */
const calState = { y: TODAY.getFullYear(), m: TODAY.getMonth(), sel: null };
reg('kalender', 'Kalender Kuota', ['Manajemen PKL', 'Kalender Kuota'], () => {
  const first = new Date(calState.y, calState.m, 1), dim = new Date(calState.y, calState.m + 1, 0).getDate(), mx = S.settings.quotaMax;
  const cells = []; for (let i = 0; i < first.getDay(); i++) cells.push('<div class="day empty"></div>');
  for (let d = 1; d <= dim; d++) {
    const ds = `${calState.y}-${pad(calState.m + 1)}-${pad(d)}`, o = occupancy(ds), cl = o >= mx ? 'r' : o >= mx - 1 ? 'y' : 'g';
    cells.push(`<div class="day ${cl} ${calState.sel === ds ? 'sel' : ''}" data-d="${ds}" title="${o}/${mx} terisi"><b>${d}</b><small>${o}/${mx}</small></div>`);
  }
  return `<div class="grid g-main"><div class="card"><div class="card-h"><div class="row">
    <button class="btn btn-sm" id="cPrev">‹</button><h3 style="min-width:150px;text-align:center">${BULAN[calState.m]} ${calState.y}</h3><button class="btn btn-sm" id="cNext">›</button></div>
    <div class="row"><select class="input" id="cMonth" style="width:130px" aria-label="Bulan">${BULAN.map((b, i) => `<option value="${i}" ${i === calState.m ? 'selected' : ''}>${b}</option>`).join('')}</select>
    <select class="input" id="cYear" style="width:90px" aria-label="Tahun">${[-1, 0, 1, 2].map(o => `<option ${TODAY.getFullYear() + o === calState.y ? 'selected' : ''}>${TODAY.getFullYear() + o}</option>`).join('')}</select></div></div>
    <div class="card-b"><div class="cal">${['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => `<div class="dh">${d}</div>`).join('')}${cells.join('')}</div>
    <div class="legend" style="margin-top:14px"><span><i style="background:#16A34A"></i>Tersedia</span><span><i style="background:#D97706"></i>Hampir penuh</span><span><i style="background:#DC2626"></i>Penuh</span></div></div></div>
    <div class="card"><div class="card-h"><h3>${calState.sel ? fmtD(calState.sel) : 'Pilih tanggal'}</h3></div><div class="card-b" id="calDetail">
    ${calState.sel ? (() => { const l = PKL.filter(p => ['Aktif', 'Diterima'].includes(p.status) && p.mulai <= calState.sel && p.selesai >= calState.sel); return `<div class="num" style="font-size:24px;font-weight:600">${l.length}/${mx}</div><div class="bar ${l.length >= mx ? 'bad' : 'ok'}" style="margin:8px 0 12px"><i style="width:${l.length / mx * 100}%"></i></div>${l.map(p => `<div class="row" style="padding:4px 0">${av(p.nama, 1)}${esc(p.nama)}<span class="spacer"></span><span class="caption">${esc(p.divisi)}</span></div>`).join('') || '<span class="muted">Tidak ada peserta</span>'}`; })() : '<span class="muted">Klik hari pada kalender untuk melihat peserta.</span>'}
    </div></div></div>`;
}, () => {
  const mv = n => { calState.m += n; if (calState.m < 0) { calState.m = 11; calState.y--; } if (calState.m > 11) { calState.m = 0; calState.y++; } render(); };
  $('#cPrev').onclick = () => mv(-1); $('#cNext').onclick = () => mv(1);
  $('#cMonth').onchange = e => { calState.m = +e.target.value; render(); }; $('#cYear').onchange = e => { calState.y = +e.target.value; render(); };
  $$('[data-d]').forEach(d => d.onclick = () => { calState.sel = d.dataset.d; render(); });
});

/* ===== Peserta Aktif ===== */
reg('peserta', 'Peserta Aktif', ['Manajemen PKL', 'Peserta Aktif'], () => `<div class="card">${table('act', {
  rows: () => PKL.filter(p => p.status === 'Aktif'),
  cols: [{ k: 'nama', label: 'Peserta', fmt: r => person(r.nama, r.instansi) }, { k: 'divisi', label: 'Divisi' }, { k: 'pembimbing', label: 'Pembimbing' }, { k: 'selesai', label: 'Periode', fmt: r => `${fmtD(r.mulai)} – ${fmtD(r.selesai)}` },
    { k: 'prog', label: 'Progres', sort: false, fmt: r => { const t = (parse(r.selesai) - parse(r.mulai)), p = Math.min(100, Math.max(0, Math.round((TODAY - parse(r.mulai)) / t * 100))); return `<div style="min-width:110px"><div class="bar"><i style="width:${p}%"></i></div><div class="caption">${p}%</div></div>`; } },
    { k: 'x', label: '', sort: false, fmt: r => `<button class="btn btn-sm" data-as="${r.id}">Atur pembimbing</button>` }],
  after: h => $$('[data-as]', h).forEach(b => b.onclick = () => {
    const p = PKL.find(x => x.id == b.dataset.as);
    openModal('Atur Pembimbing — ' + p.nama, `<div class="field"><label class="lbl" for="aDiv">Divisi</label><select class="input" id="aDiv">${['Engineering', 'Design', 'QA'].map(d => `<option ${p.divisi === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div><div class="field"><label class="lbl" for="aPb">Pembimbing</label><select class="input" id="aPb">${EMP.filter(e => e.tipe === 'Tetap').map(e => `<option ${p.pembimbing === e.nama ? 'selected' : ''}>${esc(e.nama)}</option>`).join('')}</select></div>`, '<button class="btn btn-primary" id="mSave">Simpan</button>');
    $('#mSave').onclick = () => { p.divisi = $('#aDiv').value; p.pembimbing = $('#aPb').value; audit('Ubah', 'Pembimbing PKL', p.nama); toast('Pembimbing diperbarui', 'success'); closeModal(); paintAll(); };
  })
})}</div>`, () => paintAll());

/* ===== Evaluasi ===== */
reg('evaluasi', 'Evaluasi PKL', ['Manajemen PKL', 'Evaluasi'], () => `
  <div class="grid g-main"><div class="card"><div class="card-h"><h3>Form evaluasi pembimbing</h3></div><div class="card-b">
    <div class="field"><label class="lbl" for="evPeserta">Peserta</label><select class="input" id="evPeserta">${PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status)).map(p => `<option value="${p.id}">${esc(p.nama)} — ${esc(p.instansi)}</option>`).join('')}</select></div>
    <div id="evCrit"></div>
    <div class="field"><label class="lbl" for="evNote">Catatan pembimbing</label><textarea class="input" id="evNote"></textarea></div>
    <button class="btn btn-primary" id="evSave">Simpan Evaluasi</button></div></div>
  <div class="card"><div class="card-h"><h3>Nilai akhir</h3></div><div class="card-b" style="text-align:center"><div class="num" id="evTotal" style="font-size:52px;font-weight:600;color:var(--primary)">0</div><div id="evGrade" style="margin-bottom:12px"></div>
    <div class="caption">Bobot: ${CRITERIA.map(c => `${c.k} ${c.w}%`).join(' · ')}</div><div class="caption" style="margin-top:6px">Skala & bobot dapat diatur di Pengaturan.</div></div></div></div>`, () => {
  const draw = () => {
    const ev = EVALS[$('#evPeserta').value] || {};
    $('#evCrit').innerHTML = CRITERIA.map(c => `<div class="field"><label class="lbl" for="ev-${sl(c.k)}">${c.k} (${c.w}%): <b id="ev-v-${sl(c.k)}">${ev[c.k] ?? 75}</b></label><input type="range" id="ev-${sl(c.k)}" min="0" max="100" value="${ev[c.k] ?? 75}" style="width:100%"></div>`).join('');
    CRITERIA.forEach(c => $('#ev-' + sl(c.k)).oninput = e => { $('#ev-v-' + sl(c.k)).textContent = e.target.value; calc(); }); calc();
  };
  const calc = () => { const t = CRITERIA.reduce((s, c) => s + +$('#ev-' + sl(c.k)).value * c.w / 100, 0); $('#evTotal').textContent = Math.round(t); $('#evGrade').innerHTML = lz(t >= 85 ? 'Sangat Baik' : t >= 75 ? 'Baik' : t >= 60 ? 'Cukup' : 'Kurang', t >= 75 ? 'success' : t >= 60 ? 'warning' : 'danger'); return t; };
  $('#evPeserta').onchange = draw; draw();
  $('#evSave').onclick = () => { const id = $('#evPeserta').value; EVALS[id] = Object.fromEntries(CRITERIA.map(c => [c.k, +$('#ev-' + sl(c.k)).value])); PKL.find(p => p.id == id).score = Math.round(calc()); audit('Simpan', 'Evaluasi PKL', PKL.find(p => p.id == id).nama); toast('Evaluasi tersimpan. Sertifikat siap diterbitkan.', 'success'); };
});

/* ===== Sertifikat ===== */
function certHTML(p, showGrades, no) {
  const ev = EVALS[p.id] || {};
  return `<div class="paper cert"><div class="brandline">ASTACODE · SOFTWARE HOUSE</div><h2 class="ct">SERTIFIKAT</h2><div class="caption">No. ${esc(no)}</div>
  <p style="margin-top:12px" class="muted">Diberikan kepada</p><div class="nm">${esc(p.nama)}</div>
  <p style="max-width:70%;margin:6px auto">${esc(p.instansi)} — telah menyelesaikan Praktik Kerja Lapangan pada divisi <b>${esc(p.divisi)}</b><br>${fmtD(p.mulai)} s.d. ${fmtD(p.selesai)}${showGrades ? `, dengan nilai akhir <b>${p.score ?? '-'}</b>` : ''}.</p>
  <div class="row" style="justify-content:space-between;position:absolute;left:36px;right:36px;bottom:24px"><div class="qr" title="QR verifikasi"></div><div style="text-align:center"><div class="sig">Rina A.</div><div style="border-top:1px solid #333;font-size:11px">${esc(S.settings.signer)}</div></div></div></div>
  ${showGrades ? `<div class="paper cert" style="margin-top:12px;aspect-ratio:auto;padding-bottom:32px"><div class="brandline">TRANSKRIP NILAI KOMPETENSI</div><table class="transcript"><tr><th>Kompetensi</th><th>Bobot</th><th>Nilai</th></tr>${CRITERIA.map(c => `<tr><td>${c.k}</td><td>${c.w}%</td><td>${ev[c.k] ?? '-'}</td></tr>`).join('')}<tr><th colspan="2">Nilai Akhir</th><th>${p.score ?? '-'}</th></tr></table></div>` : ''}`;
}
reg('sertifikat', 'Sertifikat PKL', ['Manajemen PKL', 'Sertifikat'], () => `
  <div class="grid g-main"><div class="card"><div class="card-h"><h3>Generator sertifikat</h3></div><div class="card-b">
    <div class="field"><label class="lbl" for="cPes">Peserta</label><select class="input" id="cPes">${PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status)).map(p => `<option value="${p.id}">${esc(p.nama)}</option>`).join('')}</select></div>
    <div class="row field" style="justify-content:space-between;padding:10px;border:1px solid var(--border);border-radius:8px"><div><b>Transkrip Nilai</b><div class="caption" id="tgDesc"></div></div><label class="switch"><input type="checkbox" id="tgGrades" checked aria-label="Toggle transkrip nilai"><span></span></label></div>
    <div id="certPrev"></div></div>
    <div class="drawer-foot" style="justify-content:flex-end"><button class="btn btn-primary" id="certIssue">Terbitkan Sertifikat</button></div></div>
  <div class="card"><div class="card-h"><h3>Riwayat dokumen terbit</h3></div><div class="card-b stack" id="certHist"></div></div></div>`, () => {
  const draw = () => {
    const p = PKL.find(x => x.id == $('#cPes').value), g = $('#tgGrades').checked;
    $('#tgDesc').textContent = g ? 'ON — sertifikat depan-belakang (nilai kompetensi)' : 'OFF — hanya keterangan menyelesaikan PKL';
    $('#certPrev').innerHTML = (!EVALS[p.id] && g ? '<div class="banner warn"><i class=fi-rr-triangle-warning></i> <span>Evaluasi belum diisi — nilai belum tersedia.</span></div>' : '') + certHTML(p, g, 'PRATINJAU');
  };
  const hist = () => $('#certHist').innerHTML = CERTS.map(c => `<div class="row"><span style="font-size:22px"><i class=fi-rr-medal></i></span><div style="flex:1"><b>${esc(c.nama)}</b><div class="caption">${c.no} · ${fmtD(c.tgl)} · ${c.tampil ? 'dengan nilai' : 'tanpa nilai'}</div></div><button class="btn btn-sm" data-v="${c.no}">Verifikasi QR</button></div>`).join('') || '<span class="muted">Belum ada.</span>';
  $('#cPes').onchange = draw; $('#tgGrades').onchange = draw; draw(); hist();
  $('#certIssue').onclick = () => {
    const p = PKL.find(x => x.id == $('#cPes').value), g = $('#tgGrades').checked;
    const no = `CERT/ASTA/${TODAY.getFullYear()}/${String(S.settings.certNo++).padStart(3, '0')}`;
    CERTS.unshift({ no, placement: p.id, nama: p.nama, tampil: g, tgl: iso(TODAY), token: Math.random().toString(36).slice(2, 8) });
    audit('Terbitkan', 'Sertifikat PKL', `${no} — ${p.nama}`); toast('Sertifikat ' + no + ' diterbitkan', 'success'); hist();
  };
  $('#certHist').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const c = CERTS.find(x => x.no === b.dataset.v); openModal('Verifikasi Sertifikat', `<div class="banner ok"><i class=fi-rr-check-circle></i> <span><b>Sertifikat asli.</b> ${esc(c.no)} diterbitkan untuk <b>${esc(c.nama)}</b> pada ${fmtD(c.tgl)}.</span></div>`); };
});

/* ===== Payroll ===== */
let payTab = 'PR-2026-10';
reg('payroll', 'Payroll Engine', ['Payroll'], () => {
  const run = PAYRUN.find(r => r.id === payTab), sl = slips(), tot = sl.reduce((a, s) => a + s.net, 0);
  const flow = ['Draft', 'Review', 'Approved', 'Paid'], idx = flow.indexOf(run.status);
  const next = flow[idx + 1];
  const can = next === 'Review' ? ['hr'].includes(S.role) : ['Approved', 'Paid'].includes(next) ? S.role === 'finance' || S.role === 'hr' && false : false;
  return `
  <div class="tabs" id="payTabs">${PAYRUN.map(r => `<button class="${r.id === payTab ? 'on' : ''}" data-r="${r.id}">${r.periode} ${lz(r.status)}</button>`).join('')}</div>
  <div class="card card-b" style="margin-bottom:16px"><div class="row">${flow.map((f, i) => `<div class="row" style="flex:1;min-width:110px"><span class="av sm" style="background:${i <= idx ? '#16A34A' : '#B8C0CE'}">${i <= idx ? '<i class=fi-rr-check></i>' : i + 1}</span><b style="color:${i <= idx ? 'inherit' : 'var(--text-secondary)'}">${f}</b></div>`).join('')}</div></div>
  <div class="grid g4" style="margin-bottom:16px"><div class="card stat"><div class="k">Total bersih</div><div class="v">${rp(tot)}</div></div><div class="card stat inf"><div class="k">Karyawan tetap</div><div class="v">${sl.filter(s => s.e.tipe === 'Tetap').length}</div></div><div class="card stat warn"><div class="k">Freelance</div><div class="v">${sl.filter(s => s.e.tipe === 'Freelance').length}</div></div><div class="card stat bad"><div class="k">Total potongan</div><div class="v">${rp(sl.reduce((a, s) => a + s.ded, 0))}</div></div></div>
  <div class="card"><div class="card-h"><h3>Rincian per karyawan</h3><div class="row">
    ${next ? `<button class="btn btn-primary" id="payNext" ${can ? '' : 'disabled'} title="${can ? '' : 'Hanya ' + (next === 'Review' ? 'HR Admin' : 'Finance') + ' dapat melanjutkan'}">${{ Review: 'Kirim ke Review', Approved: 'Approve (Finance)', Paid: 'Tandai Dibayar' }[next]}</button>` : lz('Selesai dibayar', 'success')}
    <button class="btn" id="payCsv"><i class=fi-rr-download></i> CSV Bank</button></div></div>
  ${table('pay', {
    rows: () => sl.map(s => ({ id: s.e.id, nama: s.e.nama, tipe: s.e.tipe, gross: s.gross, ded: s.ded, net: s.net })),
    cols: [{ k: 'nama', label: 'Karyawan', fmt: r => person(r.nama) }, { k: 'tipe', label: 'Tipe', fmt: r => lz(r.tipe, r.tipe === 'Tetap' ? 'primary' : 'info') }, { k: 'gross', label: 'Pendapatan', cls: 'r num', fmt: r => rp(r.gross) }, { k: 'ded', label: 'Potongan', cls: 'r num', fmt: r => r.ded ? `<span class="down">-${rp(r.ded)}</span>` : '—' }, { k: 'net', label: 'Bersih', cls: 'r num', fmt: r => `<b>${rp(r.net)}</b>` }, { k: 'x', label: '', sort: false, fmt: r => `<button class="btn btn-sm" data-slip="${r.id}">Slip</button>` }],
    after: h => $$('[data-slip]', h).forEach(b => b.onclick = () => slipModal(+b.dataset.slip))
  })}</div>`;
}, () => {
  $$('#payTabs button').forEach(b => b.onclick = () => { payTab = b.dataset.r; render(); });
  paintTable('pay');
  const run = PAYRUN.find(r => r.id === payTab), flow = ['Draft', 'Review', 'Approved', 'Paid'];
  if ($('#payNext')) $('#payNext').onclick = () => { run.status = flow[flow.indexOf(run.status) + 1]; audit('Payroll', run.id, '→ ' + run.status); toast(`Payroll ${run.periode}: ${run.status}`, 'success'); render(); };
  $('#payCsv').onclick = () => { const csv = 'nama,rekening,jumlah\n' + slips().map(s => `${s.e.nama},0000000000,${Math.round(s.net)}`).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'payroll-bank.csv'; a.click(); toast('CSV transfer massal diunduh', 'success'); };
});
function slipModal(id) {
  const s = computePayslip(EMP.find(e => e.id === id));
  openModal('Slip Gaji — ' + s.e.nama, `<div class="paper letter" style="aspect-ratio:auto;min-height:420px"><div class="brandline">ASTACODE · SLIP GAJI</div><div class="caption">Periode ${PAYRUN.find(r => r.id === payTab)?.periode || 'Oktober 2026'}</div><hr style="margin:10px 0">
    <dl class="kv"><dt>Nama</dt><dd>${esc(s.e.nama)}</dd><dt>Tipe</dt><dd>${esc(s.e.tipe)}</dd><dt>Jabatan</dt><dd>${esc(s.e.jabatan)}</dd></dl><div class="sep"></div>
    <table class="transcript">${s.items.map(i => `<tr><td>${esc(i.n)}</td><td style="text-align:right">${rp(i.v)}</td></tr>`).join('')}${s.ded ? `<tr><td class="down">${esc(s.dedNote)}</td><td style="text-align:right" class="down">-${rp(s.ded)}</td></tr>` : ''}<tr><th>Take-home pay</th><th style="text-align:right">${rp(s.net)}</th></tr></table></div>`,
    '<button class="btn" onclick="window.print()">Cetak PDF</button><button class="btn btn-primary" id="slipSend">Kirim via Email</button>');
  $('#slipSend').onclick = () => { toast('Slip dikirim ke ' + s.e.email, 'success'); closeModal(); };
}
reg('payslip', 'Slip Gaji Saya', ['Payroll', 'Slip Gaji Saya'], () => {
  const me = EMP.find(e => e.nama === 'Dewi Lestari'), s = computePayslip(me);
  return `<div class="card card-b" style="max-width:560px"><h3>Oktober 2026</h3><div class="num" style="font-size:32px;font-weight:600;margin:8px 0">${rp(s.net)}</div>
  ${s.items.map(i => `<div class="row" style="padding:4px 0"><span>${esc(i.n)}</span><span class="spacer"></span><span class="num">${rp(i.v)}</span></div>`).join('')}<button class="btn btn-primary" style="margin-top:12px" id="mySlip">Lihat slip lengkap</button></div>`;
}, () => { $('#mySlip').onclick = () => slipModal(3); });

/* ===== Dokumen & Template ===== */
reg('dokumen', 'Dokumen & Template', ['Dokumen & Template'], () => `
  <div class="grid g-main"><div class="card"><div class="card-h"><h3>Editor template (rich-text)</h3><select class="input" id="tplSel" style="width:auto">${Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${t.nama}</option>`).join('')}</select></div><div class="card-b">
    <div class="row" style="margin-bottom:8px">${['{{nama_siswa}}', '{{sekolah}}', '{{tanggal_mulai}}', '{{tanggal_selesai}}', '{{nomor_surat}}'].map(v => `<button class="chip" data-var="${v}">${v}</button>`).join('')}</div>
    <textarea class="input" id="tplBody" style="min-height:300px;font-family:ui-monospace,monospace"></textarea>
    <div class="row" style="margin-top:12px"><button class="btn btn-primary" id="tplSave">Simpan template</button><button class="btn" id="tplReset">Pratinjau ulang</button></div></div></div>
  <div class="card"><div class="card-h"><h3>Pratinjau</h3></div><div class="card-b" id="tplPrev"></div></div></div>`, () => {
  const sample = { nama: 'Contoh Siswa', instansi: 'SMKN 1 Jakarta', mulai: dOff(14), selesai: dOff(104) };
  const load = () => { $('#tplBody').value = TEMPLATES[$('#tplSel').value].body; prev(); };
  const prev = () => { const k = $('#tplSel').value; TEMPLATES[k]._d = $('#tplBody').value; const tmp = TEMPLATES[k].body; TEMPLATES[k].body = $('#tplBody').value; $('#tplPrev').innerHTML = letterPaper(letterText(k, sample, '001/ASTA-HR/PKL/2026'), true); TEMPLATES[k].body = tmp; };
  $('#tplSel').onchange = load; $('#tplBody').oninput = prev; $('#tplReset').onclick = prev;
  $$('[data-var]').forEach(b => b.onclick = () => { const t = $('#tplBody'), s = t.selectionStart; t.value = t.value.slice(0, s) + b.dataset.var + t.value.slice(t.selectionEnd); t.focus(); prev(); });
  $('#tplSave').onclick = () => { TEMPLATES[$('#tplSel').value].body = $('#tplBody').value; audit('Ubah', 'Template', TEMPLATES[$('#tplSel').value].nama); toast('Template disimpan', 'success'); };
  load();
});

/* ===== Laporan ===== */
reg('laporan', 'Laporan', ['Laporan'], () => {
  const bars = [92, 88, 95, 90, 86, 93];
  return `<div class="grid g4" style="margin-bottom:16px"><div class="card stat ok"><div class="k">Adopsi harian</div><div class="v">92%</div><div class="s up">Target ≥ 90%</div></div><div class="card stat"><div class="k">Waktu presensi</div><div class="v">7 dtk</div><div class="s up">Target ≤ 10 dtk</div></div><div class="card stat inf"><div class="k">Proses PKL</div><div class="v">4 mnt</div><div class="s up">Target &lt; 5 menit</div></div><div class="card stat warn"><div class="k">Koreksi payroll</div><div class="v">1,4%</div><div class="s up">Target &lt; 2%</div></div></div>
  <div class="grid g2"><div class="card"><div class="card-h"><h3>Kehadiran 6 bulan terakhir (%)</h3></div><div class="card-b"><div class="chart">${bars.map((b, i) => `<div class="c"><span class="num">${b}</span><i style="height:${b}%"></i><span>${BULAN[(TODAY.getMonth() - 5 + i + 12) % 12].slice(0, 3)}</span></div>`).join('')}</div></div></div>
  <div class="card"><div class="card-h"><h3>Komposisi pekerja</h3></div><div class="card-b stack">${['Tetap', 'Freelance', 'PKL'].map(t => { const n = EMP.filter(e => e.tipe === t).length, p = Math.round(n / EMP.length * 100); return `<div><div class="row"><b>${t}</b><span class="spacer"></span><span class="num caption">${n} orang · ${p}%</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`; }).join('')}
  <button class="btn" id="repExp"><i class=fi-rr-download></i> Ekspor laporan</button></div></div></div>`;
}, () => { $('#repExp') && ($('#repExp').onclick = () => toast('Laporan diekspor', 'success')); });

/* ===== Pengaturan ===== */
let setTab = 'lokasi';
reg('pengaturan', 'Pengaturan', ['Pengaturan'], () => `
  <div class="tabs" id="setTabs">${[['lokasi', 'Lokasi & Jaringan'], ['kebijakan', 'Kebijakan Lembur'], ['pkl', 'PKL'], ['role', 'Role & Permission'], ['integrasi', 'Integrasi'], ['audit', 'Audit Log']].map(([k, l]) => `<button class="${k === setTab ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}</div>
  <div id="setBody"></div>`, () => {
  const s = S.settings, body = $('#setBody');
  const save = (fn) => { fn(); audit('Ubah', 'Pengaturan', setTab); toast('Pengaturan disimpan', 'success'); };
  const P = {
    lokasi: () => `<div class="card card-b"><div class="form-grid"><div class="field"><label class="lbl" for="sSsid">SSID kantor</label><input class="input" id="sSsid" value="${esc(s.ssid)}"></div><div class="field"><label class="lbl" for="sBssid">BSSID (untuk app native)</label><input class="input" id="sBssid" value="${esc(s.bssid)}"></div><div class="field"><label class="lbl" for="sIp">Public IP statis kantor</label><input class="input" id="sIp" value="${esc(s.officeIp)}"></div><div class="field"><label class="lbl" for="sRad">Radius WFH default (m)</label><input class="input" id="sRad" type="number" value="${s.wfhRadius}"></div></div><button class="btn btn-primary" id="sSave">Simpan</button></div>`,
    kebijakan: () => `<div class="card card-b"><div class="form-grid"><div class="field"><label class="lbl" for="sTh">Ambang jam malam</label><input class="input" id="sTh" type="time" value="${s.nightThreshold}"></div><div class="field"><label class="lbl" for="sComp">Kompensasi default</label><select class="input" id="sComp"><option value="carryover" ${s.compensation === 'carryover' ? 'selected' : ''}>Carryover (masuk lebih siang)</option><option value="insentif" ${s.compensation === 'insentif' ? 'selected' : ''}>Insentif lembur</option></select></div><div class="field"><label class="lbl" for="sApp">Approval klaim</label><select class="input" id="sApp"><option value="approval" ${s.claimMode === 'approval' ? 'selected' : ''}>Manual Manajer</option><option value="auto" ${s.claimMode === 'auto' ? 'selected' : ''}>Auto-approve jika ada commit/task</option></select></div><div class="field"><label class="lbl" for="sRate">Rate insentif / jam (Rp)</label><input class="input" id="sRate" type="number" value="${s.incentiveRate}"></div><div class="field"><label class="lbl" for="sMax">Batas jam insentif / bulan</label><input class="input" id="sMax" type="number" value="${s.incentiveMax}"></div></div><button class="btn btn-primary" id="sSave">Simpan</button></div>`,
    pkl: () => `<div class="card card-b"><div class="form-grid"><div class="field"><label class="lbl" for="sQ">Kuota maksimal simultan</label><input class="input" id="sQ" type="number" min="1" value="${s.quotaMax}"></div><div class="field"><label class="lbl" for="sScope">Cakupan kuota</label><select class="input" id="sScope"><option value="global" ${s.pkgRule === 'global' ? 'selected' : ''}>Global</option><option value="divisi" ${s.pkgRule === 'divisi' ? 'selected' : ''}>Per divisi</option></select></div><div class="field full"><label class="row"><span class="switch"><input type="checkbox" id="sAuto" ${s.autoReject ? 'checked' : ''}><span></span></span> Auto-reject surat penolakan bila kuota penuh</label></div><div class="field full"><label class="lbl" for="sSign">Penandatangan digital</label><input class="input" id="sSign" value="${esc(s.signer)}"></div></div><button class="btn btn-primary" id="sSave">Simpan</button></div>`,
    role: () => { const rows = [['Presensi & log progres', 1, 1, 1, 1, 1, 1, 0], ['Approve lembur/Workload Malam', 0, 0, 0, 0, 1, 1, 0], ['Lihat slip gaji sendiri', 1, 1, 0, 1, 1, 1, 1], ['Kelola rekrutmen', 0, 0, 0, 0, 2, 1, 0], ['Kelola PKL', 0, 0, 0, 3, 2, 1, 0], ['Jalankan payroll', 0, 0, 0, 0, 0, 4, 1], ['Konfigurasi sistem', 0, 0, 0, 0, 0, 1, 0]]; const sym = { 0: '<i class=fi-rr-cross-circle></i>', 1: '<i class=fi-rr-check-circle></i>', 2: '<i class=fi-rr-eye></i>', 3: '<i class=fi-rr-check-circle></i> (evaluasi)', 4: '<i class=fi-rr-check-circle></i> (draft)' }; return `<div class="card"><div class="tbl-wrap"><table class="tbl perm"><thead><tr><th>Fitur</th>${['Karyawan', 'Freelancer', 'PKL', 'Pembimbing', 'Manajer', 'HR Admin', 'Finance'].map(r => `<th>${r}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td>${r.slice(1).map(v => `<td>${sym[v] || '<i class=fi-rr-check-circle></i> (final)'}</td>`).join('')}</tr>`).join('').replace('<i class=fi-rr-check-circle></i> (draft)</td><td><i class=fi-rr-check-circle></i></td>', '<i class=fi-rr-check-circle></i> (draft)</td><td><i class=fi-rr-check-circle></i> (final)</td>')}</tbody></table></div><div class="pager"><span><i class=fi-rr-eye></i> = hanya lihat · Gunakan pemilih peran di top bar untuk melihat menu dinamis.</span></div></div>`; },
    integrasi: () => { const L = [['Jira / Trello / ClickUp', 'Tarik ID task untuk Daily Log', 'P1', 1], ['GitHub / GitLab', 'Validasi commit/PR', 'P1', 1], ['Email (SMTP/API)', 'Notifikasi, surat, slip', 'P0', 1], ['Slack / WhatsApp', 'Pengingat presensi', 'P2', 0], ['Google/Microsoft SSO', 'Login', 'P1', 0], ['Google Calendar', 'Jadwal interview', 'P2', 0], ['LinkedIn', 'Butuh akses partner resmi', 'P2', 0]]; return `<div class="grid g2">${L.map(([n, d, p, on], i) => `<div class="card card-b row"><div style="flex:1"><b>${n}</b> ${lz(p, 'neutral')}<div class="caption">${d}</div></div><label class="switch"><input type="checkbox" data-int="${n}" ${on ? 'checked' : ''} aria-label="${n}"><span></span></label></div>`).join('')}</div>`; },
    audit: () => `<div class="card">${table('audit', { rows: () => AUDIT.map((a, i) => ({ id: i + 1, ...a })), size: 10, cols: [{ k: 't', label: 'Waktu', cls: 'tabular' }, { k: 'actor', label: 'Aktor', fmt: r => person(r.actor) }, { k: 'aksi', label: 'Aksi', fmt: r => lz(r.aksi, 'primary') }, { k: 'entitas', label: 'Entitas' }, { k: 'detail', label: 'Detail' }] })}</div>`
  };
  const draw = () => {
    body.innerHTML = P[setTab](); $$('#setTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === setTab));
    paintAll();
    const sv = $('#sSave'); if (!sv) { $$('[data-int]').forEach(c => c.onchange = () => { audit('Ubah', 'Integrasi', c.dataset.int); toast(c.dataset.int + (c.checked ? ' diaktifkan' : ' dinonaktifkan'), 'success'); }); return; }
    sv.onclick = () => save(() => {
      if (setTab === 'lokasi') { s.ssid = $('#sSsid').value; s.bssid = $('#sBssid').value; s.officeIp = $('#sIp').value; s.wfhRadius = +$('#sRad').value; }
      if (setTab === 'kebijakan') { s.nightThreshold = $('#sTh').value; s.compensation = $('#sComp').value; s.claimMode = $('#sApp').value; s.incentiveRate = +$('#sRate').value; s.incentiveMax = +$('#sMax').value; }
      if (setTab === 'pkl') { s.quotaMax = Math.max(1, +$('#sQ').value); s.pkgRule = $('#sScope').value; s.autoReject = $('#sAuto').checked; s.signer = $('#sSign').value; }
    });
  };
  $$('#setTabs button').forEach(b => b.onclick = () => { setTab = b.dataset.t; draw(); }); draw();
});

/* ===== Profil ===== */
reg('profil', 'Profil Pengguna', ['Profil Pengguna'], () => {
  const u = { hr: ['Rina Anggraini', 'HR Admin'], manager: ['Bagas Prakoso', 'Manajer / Team Lead'], employee: ['Dewi Lestari', 'Karyawan Tetap'], finance: ['Finance Team', 'Super Admin / Finance'] }[S.role];
  return `<div class="grid g2"><div class="card card-b"><div class="person" style="margin-bottom:16px"><span class="av" style="width:56px;height:56px;font-size:18px;background:${colorOf(u[0])}">${initials(u[0])}</span><div><h2>${u[0]}</h2><div class="muted">${u[1]}</div></div></div>
  <dl class="kv"><dt>Email</dt><dd>${u[0].split(' ')[0].toLowerCase()}@astacode.id</dd><dt>Bahasa</dt><dd>Bahasa Indonesia</dd><dt>2FA</dt><dd>${lz('Opsional', 'neutral')}</dd></dl></div>
  <div class="card card-b stack"><h3>Privasi & Persetujuan (UU PDP)</h3><label class="row"><span class="switch"><input type="checkbox" id="pConsent" ${S.consent ? 'checked' : ''}><span></span></span> Izinkan pemrosesan koordinat lokasi untuk presensi WFH</label><div class="caption">Anda berhak mengakses, memperbaiki, dan menghapus data pribadi.</div>
  <div class="sep"></div><h3>Lokasi WFH terdaftar</h3><div class="row"><span><i class=fi-rr-home></i> Rumah — radius ${S.settings.wfhRadius} m</span><span class="spacer"></span>${lz('Approved')}</div></div></div>`;
}, () => { $('#pConsent').onchange = e => { S.consent = e.target.checked; toast(S.consent ? 'Persetujuan lokasi diberikan' : 'Persetujuan dicabut', 'info'); }; });

/* ---------------- Router ---------------- */
const currentRoute = () => (location.hash || '#beranda').slice(1).split('?')[0];
const GROUP_OF = { presensi: 'absensi', dailylog: 'absensi', workload: 'absensi', rekap: 'absensi', lowongan: 'rekrutmen', pipeline: 'rekrutmen', pengajuan: 'pkl', kalender: 'pkl', peserta: 'pkl', evaluasi: 'pkl', sertifikat: 'pkl' };
let clockT;
function render() {
  let id = currentRoute();
  if (!R[id]) id = 'beranda';
  if (!allowed(id) && !(GROUP_OF[id] && allowed(GROUP_OF[id]) && false)) {
    $('#view').innerHTML = `<div class="empty-state"><div class="ei"><i class=fi-rr-lock></i></div><h3>Akses dibatasi</h3><p>Peran saat ini tidak memiliki izin untuk halaman ini.</p><a class="btn btn-primary" href="#beranda" style="margin-top:12px">Kembali ke Beranda</a></div>`;
    $('#pageTitle').textContent = 'Akses dibatasi'; $('#breadcrumb').innerHTML = ''; $('#pageActions').innerHTML = ''; buildNav(); return;
  }
  const r = R[id];
  document.title = `${r.title} — Asta HR`;
  $('#pageTitle').textContent = r.title;
  $('#breadcrumb').innerHTML = `<a href="#beranda">Asta HR</a> › ` + r.crumb.map((c, i) => i === r.crumb.length - 1 ? `<b>${c}</b>` : c).join(' › ');
  $('#pageActions').innerHTML = r.actions ? r.actions() : '';
  Object.keys(TBL).forEach(k => { if (!['night', 'rekap', 'emp', 'jobs', 'pkl', 'act', 'pay', 'audit'].includes(k)) delete TBL[k]; });
  $('#view').innerHTML = r.render(id);
  buildNav();
  r.after && r.after();
  bindActions(id);
  clearInterval(clockT);
  const ck = () => { const c = $('#clock'); if (c) { const n = new Date(); c.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`; } };
  ck(); clockT = setInterval(ck, 1000);
}
function bindActions(id) {
  const on = (sel, fn) => { const e = $(sel); if (e) e.onclick = fn; };
  on('#btnAddEmp', () => { openModal('Tambah Karyawan', empForm(), '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">Simpan</button>'); $('#mCancel').onclick = closeModal; $('#mSave').onclick = () => { if (saveEmp()) { closeModal(); paintAll(); } }; });
  on('#btnAddJob', () => openJob()); on('#btnCareer', careerPage); on('#btnPublicForm', publicPklForm);
}
// Wire rendering to be done after view is injected (r.after is the 4th arg registered as render's callback)
// reg() stores arguments as (render, actions). The "after" hook is attached below for clarity.
function reg2() {}
// Re-map: reg(id,title,crumb,render,afterOrActions,actions) — normalise
Object.keys(R).forEach(k => { const r = R[k]; if (typeof r.actions === 'function') { /* second fn arg is "after" in our usage */ r.after = r.actions; r.actions = null; } });
// Pages that pass a 3rd function (actions) are re-registered below
const ACTIONS = {
  karyawan: () => `<button class="btn btn-primary" id="btnAddEmp">+ Tambah Karyawan</button>`,
  lowongan: () => `<button class="btn" id="btnCareer"><i class=fi-rr-globe></i> Pratinjau Career Page</button><button class="btn btn-primary" id="btnAddJob">+ Lowongan</button>`,
  pengajuan: () => `<button class="btn" id="btnPublicForm"><i class=fi-rr-globe></i> Buka Form Publik</button>`
};
Object.entries(ACTIONS).forEach(([k, f]) => R[k].actions = f);

window.addEventListener('hashchange', () => { closeDrawer(); render(); });

/* ---------------- Global UI wiring ---------------- */
const _on = (sel, ev, fn) => { const el = $(sel); if (el) el[ev] = fn; };
const _evt = (sel, ev, fn) => { const el = $(sel); if (el) el.addEventListener(ev, fn); };

_on('#btnCollapse', 'onclick', () => document.body.classList.toggle('collapsed'));
_on('#btnHamburger', 'onclick', () => document.body.classList.toggle('mobile-open'));
_on('#scrim', 'onclick', () => document.body.classList.remove('mobile-open'));
_evt('#sbNav', 'click', e => { if (e.target.closest('a')) document.body.classList.remove('mobile-open'); });
_on('#drawerClose', 'onclick', closeDrawer); _on('#modalClose', 'onclick', closeModal);
_evt('#modalWrap', 'click', e => { if (e.target.id === 'modalWrap') closeModal(); });
_evt('#cmdWrap', 'click', e => { if (e.target.id === 'cmdWrap') closeCmd(); });
_on('#roleSelect', 'onchange', e => { S.role = e.target.value; const n = { hr: 'RA', manager: 'BP', employee: 'DL', finance: 'FN' }[S.role]; const ba = $('#btnAvatar'); if(ba) ba.textContent = n; toast('Peran: ' + e.target.selectedOptions[0].text, 'info'); if (!allowed(currentRoute())) location.hash = 'beranda'; else render(); });
_on('#btnAvatar', 'onclick', () => location.hash = 'profil');
_on('#btnNotif', 'onclick', () => { const b = badges(); openDrawer('Notifikasi', `<div class="stack">${b.workload ? `<div class="banner warn"><i class=fi-rr-moon></i> ${b.workload} klaim Workload Malam menunggu approval</div>` : ''}${b.pengajuan ? `<div class="banner info"><i class=fi-rr-graduation-cap></i> ${b.pengajuan} pengajuan PKL baru</div>` : ''}<div class="banner ok"><i class=fi-rr-check-circle></i> Payroll September telah dibayar</div></div>`); });
_on('#btnHelp', 'onclick', () => openModal('Bantuan', '<p>Gunakan <kbd>Ctrl</kbd>+<kbd>K</kbd> untuk pencarian cepat. Ganti peran di top bar untuk melihat hak akses berbeda.</p><div class="banner warn" style="margin-top:12px"><i class=fi-rr-triangle-warning></i> Browser tidak bisa membaca SSID/BSSID — validasi onsite memakai Public IP statis.</div>'));
_on('#btnCreate', 'onclick', () => {
  openModal('Buat baru', `<div class="stack">${[['Daily Log', 'dailylog'], ['Karyawan', 'karyawan'], ['Lowongan', 'lowongan'], ['Pengajuan PKL (form publik)', 'pengajuan']].map(([l, h]) => `<button class="btn" data-c="${h}" style="justify-content:flex-start">+ ${l}</button>`).join('')}</div>`);
  $$('[data-c]').forEach(b => b.onclick = () => { closeModal(); location.hash = b.dataset.c; setTimeout(() => { if (b.dataset.c === 'karyawan') $('#btnAddEmp')?.click(); if (b.dataset.c === 'lowongan') $('#btnAddJob')?.click(); if (b.dataset.c === 'pengajuan') publicPklForm(); }, 50); });
});

/* Command palette (Ctrl/⌘+K) */
let cmdSel = 0, cmdItems = [];
function closeCmd() { const cw = $('#cmdWrap'); if(cw) cw.classList.remove('open'); }
function cmdDraw() {
  const ci = $('#cmdInput'); if(!ci) return;
  const q = ci.value.toLowerCase();
  const pages = Object.entries(R).filter(([id]) => allowed(id)).map(([id, r]) => ({ l: r.title, t: 'Halaman', go: () => location.hash = id }));
  const data = [...EMP.map(e => ({ l: e.nama, t: 'Karyawan', go: () => { location.hash = 'karyawan'; setTimeout(() => empDrawer(e), 60); } })), ...APP.map(a => ({ l: a.nama, t: 'Pelamar', go: () => { location.hash = 'pipeline'; setTimeout(() => applicantDrawer(a, render), 60); } })), ...PKL.map(p => ({ l: p.nama, t: 'PKL', go: () => { location.hash = 'pengajuan'; setTimeout(() => reviewPkl(p.id), 60); } }))];
  cmdItems = [...pages, ...data].filter(i => i.l.toLowerCase().includes(q)).slice(0, 9); cmdSel = 0;
  const cl = $('#cmdList'); if(cl) cl.innerHTML = cmdItems.map((i, n) => `<li class="${n === 0 ? 'sel' : ''}" data-n="${n}"><span>${esc(i.l)}</span><span class="caption">${i.t}</span></li>`).join('') || '<li class="muted">Tidak ada hasil</li>';
  $$('#cmdList li[data-n]').forEach(li => li.onclick = () => { closeCmd(); cmdItems[li.dataset.n].go(); });
}
function openCmd() { const cw = $('#cmdWrap'); if(cw) cw.classList.add('open'); const ci = $('#cmdInput'); if(ci) { ci.value = ''; cmdDraw(); ci.focus(); } }
_on('#btnSearch', 'onclick', openCmd); _on('#cmdInput', 'oninput', cmdDraw);
_on('#cmdInput', 'onkeydown', e => {
  const lis = $$('#cmdList li[data-n]');
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cmdSel = (cmdSel + (e.key === 'ArrowDown' ? 1 : -1) + lis.length) % lis.length; lis.forEach((l, i) => l.classList.toggle('sel', i === cmdSel)); }
  if (e.key === 'Enter' && cmdItems[cmdSel]) { closeCmd(); cmdItems[cmdSel].go(); }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd(); }
  if (e.key === 'Escape') { closeCmd(); closeModal(); closeDrawer(); }
});

/* ---------------- Boot ---------------- */
// Skeleton first, then render (PRD: skeleton loading)
$('#view').innerHTML = '<div class="skel" style="height:120px"></div><div class="skel"></div><div class="skel" style="width:70%"></div>';
setTimeout(render, 250);
})();
