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
  { id: 9, nama: 'Nadin', email: 'kevin@smkn1.sch.id', tipe: 'PKL', tim: 'Engineering', jabatan: 'Peserta PKL', atasan: 'Fajar Nugroho', gaji: 0, tunj: 0, rate: 0, status: 'Aktif', masuk: dOff(-30) },
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

let TEAM_TODAY = EMP.filter(e => e.tipe !== 'PKL').map((e, i) => ({
  nama: e.nama, tim: e.tim, tipe: e.tipe,
  status: ['Hadir Onsite', 'Hadir WFH', 'Hadir Onsite', 'Hadir WFH', 'Belum Submit Progres', 'Hadir WFH', 'Tanpa Keterangan', 'Hadir Onsite'][i % 8],
  load: [6, 8, 5, 9, 4, 7, 0, 6][i % 8], cap: 8,
  task: ['ASTA-230 Sprint planning', 'ASTA-212 Dashboard UI', 'ASTA-219 Query optimasi', 'ASTA-225 Auth SSO', 'ASTA-205 Revisi desain', 'ASTA-221 Regression', '—', 'ASTA-231 Mobile build'][i % 8]
}));

const JOBS = [
  {
    id: 1, judul: 'Senior Backend Engineer', tim: 'Engineering', level: 'Senior', lokasi: 'Hybrid — Jakarta',
    skills: [
      { name: 'Node.js', level: 'Senior' },
      { name: 'PostgreSQL', level: 'Senior' },
      { name: 'AWS Cloud', level: 'Mid' },
      { name: 'Docker / K8s', level: 'Mid' }
    ],
    skill: 'Node.js (Senior), PostgreSQL (Senior), AWS Cloud (Mid), Docker / K8s (Mid)',
    status: 'Published', deskripsi: 'Merancang dan memelihara API untuk produk klien enterprise dengan skalabilitas tinggi.'
  },
  {
    id: 2, judul: 'UI/UX Designer', tim: 'Design', level: 'Mid', lokasi: 'WFH',
    skills: [
      { name: 'Figma', level: 'Senior' },
      { name: 'Design System', level: 'Mid' },
      { name: 'User Research', level: 'Mid' },
      { name: 'Prototyping', level: 'Junior' }
    ],
    skill: 'Figma (Senior), Design System (Mid), User Research (Mid), Prototyping (Junior)',
    status: 'Published', deskripsi: 'Membangun antarmuka dan pengalaman produk yang konsisten, modern, dan intuitif.'
  },
  {
    id: 3, judul: 'QA Automation Engineer', tim: 'QA', level: 'Mid', lokasi: 'Hybrid — Jakarta',
    skills: [
      { name: 'Cypress', level: 'Mid' },
      { name: 'Playwright', level: 'Mid' },
      { name: 'API Testing (Postman)', level: 'Senior' }
    ],
    skill: 'Cypress (Mid), Playwright (Mid), API Testing (Senior)',
    status: 'Draft', deskripsi: 'Mengotomasi pengujian regresi end-to-end dan integrasi API lintas platform.'
  },
  {
    id: 4, judul: 'Project Manager', tim: 'PMO', level: 'Senior', lokasi: 'Onsite',
    skills: [
      { name: 'Agile & Scrum', level: 'Senior' },
      { name: 'Jira Software', level: 'Senior' },
      { name: 'Stakeholder Management', level: 'Senior' }
    ],
    skill: 'Agile & Scrum (Senior), Jira Software (Senior), Stakeholder Management (Senior)',
    status: 'Closed', deskripsi: 'Memimpin delivery sprint software dan mengkoordinasikan komunikasi klien enterprise.'
  }
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
  { id: 1, nama: 'Nadin', instansi: 'SMKN 1 Jakarta', jurusan: 'RPL', mulai: dOff(-30), selesai: dOff(60), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '001/ASTA-HR/PKL/2026', kontak: 'kevin@smkn1.sch.id', mulaiLog: 24, score: 86 },
  { id: 2, nama: 'Laila Zahra', instansi: 'Universitas Indonesia', jurusan: 'Desain Komunikasi Visual', mulai: dOff(-45), selesai: dOff(45), status: 'Aktif', divisi: 'Design', pembimbing: 'Citra Maharani', nomor: '002/ASTA-HR/PKL/2026', kontak: 'laila@ui.ac.id', mulaiLog: 31 },
  { id: 3, nama: 'Mario Gunawan', instansi: 'SMK Telkom Bandung', jurusan: 'TKJ', mulai: dOff(-10), selesai: dOff(80), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '003/ASTA-HR/PKL/2026', kontak: 'mario@smktelkom.sch.id', mulaiLog: 8 },
  { id: 4, nama: 'Nadia Rahma', instansi: 'Politeknik Negeri Jakarta', jurusan: 'Teknik Informatika', mulai: dOff(-5), selesai: dOff(85), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Dewi Lestari', nomor: '004/ASTA-HR/PKL/2026', kontak: 'nadia@pnj.ac.id', mulaiLog: 4 },
  { id: 5, nama: 'Omar Hakim', instansi: 'SMKN 4 Bandung', jurusan: 'RPL', mulai: dOff(-3), selesai: dOff(87), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '005/ASTA-HR/PKL/2026', kontak: 'omar@smkn4.sch.id', mulaiLog: 2 },
  { id: 6, nama: 'Putra Mahendra', instansi: 'Universitas Gunadarma', jurusan: 'Sistem Informasi', mulai: dOff(20), selesai: dOff(110), status: 'Menunggu', divisi: '', pembimbing: '', nomor: '', kontak: 'putra@gunadarma.ac.id' },
  { id: 7, nama: 'Qonita Aulia', instansi: 'SMK Negeri 2 Depok', jurusan: 'Multimedia', mulai: dOff(10), selesai: dOff(70), status: 'Menunggu', divisi: '', pembimbing: '', nomor: '', kontak: 'qonita@smkn2.sch.id' },
  { id: 8, nama: 'Raka Aditya', instansi: 'Universitas Brawijaya', jurusan: 'Teknik Informatika', mulai: dOff(-200), selesai: dOff(-110), status: 'Selesai', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '098/ASTA-HR/PKL/2025', kontak: 'raka@ub.ac.id', score: 86 },
  { id: 9, nama: 'Fikri Pratama', instansi: 'SMKN 1 Jakarta', jurusan: 'RPL', mulai: dOff(-20), selesai: dOff(70), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '006/ASTA-HR/PKL/2026', kontak: 'fikri@smkn1.sch.id', mulaiLog: 15 },
  { id: 10, nama: 'Rizky Ramadhan', instansi: 'SMK Telkom Bandung', jurusan: 'TKJ', mulai: dOff(-15), selesai: dOff(75), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '007/ASTA-HR/PKL/2026', kontak: 'rizky@smktelkom.sch.id', mulaiLog: 12 }
];
const CRITERIA = [
  { k: 'Code Quality', w: 25 }, { k: 'Teamwork', w: 20 }, { k: 'Punctuality', w: 15 },
  { k: 'Communication', w: 20 }, { k: 'Problem Solving', w: 20 }
];
const EVALS = {
  1: { 'Code Quality': 88, Teamwork: 85, Punctuality: 90, Communication: 80, 'Problem Solving': 85, _note: 'Sangat proaktif dan cepat beradaptasi dengan stack Vue/Node.js.' },
  8: { 'Code Quality': 85, Teamwork: 90, Punctuality: 82, Communication: 85, 'Problem Solving': 88, _note: 'Menyelesaikan seluruh modul tepat waktu dengan standar kode yang sangat rapi.' }
};
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
  manager: ['beranda', 'absensi', 'presensi', 'dailylog', 'rekap', 'karyawan', 'rekrutmen', 'lowongan', 'pipeline', 'pkl', 'pengajuan', 'kalender', 'peserta', 'payslip', 'laporan', 'profil'],
  employee: ['beranda', 'absensi', 'presensi', 'dailylog', 'payslip', 'profil'],
  finance: ['beranda', 'payroll', 'payslip', 'laporan', 'dokumen', 'profil']
};
const NAV = [
  { id: 'beranda', ico: '<i class=fi-rr-home></i>', label: 'Dashboard' },
  { id: 'absensi', ico: '<i class=fi-rr-check-circle></i>', label: 'Absensi', kids: [['presensi', 'Presensi Saya'], ['dailylog', 'Daily Log'], ['Workload Malam'], ['rekap', 'Rekap Tim']] },
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
const badges = () => ({ pengajuan: PKL.filter(p => p.status === 'Menunggu').length });
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
    nd.textContent = b.pengajuan ; 
    nd.style.display = (b.pengajuan ) ? '' : 'none';
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
        
        ${PKL.filter(p => p.status === 'Menunggu').map(p => `<div class="row">${av(p.nama)}<div style="flex:1"><b>${esc(p.nama)}</b><div class="caption">Pengajuan PKL · ${esc(p.instansi)}</div></div><a class="btn btn-sm" href="#pengajuan">Tinjau</a></div>`).join('')}
      </div></div>
      <div class="card"><div class="card-h"><h3>Pengumuman</h3></div><div class="card-b stack">
        <div class="banner info" style="margin:0"><i class=fi-rr-megaphone></i> <span>Payroll Oktober ditutup tanggal 25. Pastikan Daily Log lengkap.</span></div>
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
        ${[1, 2, 3, 4, 5].map(i => `<li><b>${fmtD(dOff(-i))}</b> ${lz(i % 2 ? 'Hadir WFH' : 'Hadir Onsite')}<div class="caption">${i % 2 ? 'Geolocation terdeteksi di Jakarta' : 'Public IP kantor cocok'}</div></li>`).join('')}
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
      <div class="field" style="margin-top:12px"><label class="lbl" for="simGeo">Lokasi tempat bekerja</label>
      <select class="input" id="simGeo"><option value="Jakarta">Jakarta</option><option value="Bandung">Bandung</option><option value="Surabaya">Surabaya</option><option value="Yogyakarta">Yogyakarta</option><option value="Bali">Bali</option></select></div>
      <label class="row"><input type="checkbox" id="pdpConsent" ${S.consent ? 'checked' : ''}> <span class="caption">Saya menyetujui pemrosesan koordinat lokasi sesuai UU PDP No. 27/2022.</span></label>`;
    $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    updateChecks();
    $('#simNet') && ($('#simNet').onchange = updateChecks);
    $('#simGeo') && ($('#simGeo').onchange = updateChecks);
    $('#pdpConsent') && ($('#pdpConsent').onchange = e => { S.consent = e.target.checked; updateChecks(); });
  };
  const evalCheck = () => {
    if (mode === 'onsite') { const ok = $('#simNet').value === 'ok'; return { ok, metode: 'Public IP', list: [[ok, 'Public IP cocok dengan terdaftar'], [ok, 'Jaringan Wifi “Asta” terdeteksi (via IP)']] }; }
    const loc = $('#simGeo').value, ok = S.consent;
    return { ok, metode: `Geolocation (${loc})`, loc, list: [[S.consent, 'Persetujuan data lokasi (PDP)'], [true, `Lokasi terdeteksi: ${loc}`], [true, 'Akurasi GPS ±12 m disimpan · tidak ada mock-location']] };
  };
  function updateChecks() {
    const r = evalCheck();
    $('#checks').innerHTML = r.list.map(([ok, t]) => `<li>${ok ? '<i class=fi-rr-check-circle></i>' : '<i class=fi-rr-cross-circle></i>'} <span>${t}</span></li>`).join('');
    const dot = $('#meDot'); if (dot) { dot.style.left = '52%'; dot.style.top = '55%'; }
  }
  $$('#modeSeg button').forEach(b => b.onclick = () => { mode = b.dataset.m; S.pendingMode = mode; panel(); });
  $('#btnHadir').onclick = () => {
    const r = evalCheck();
    if (!r.ok) {
      $('#hadirResult').innerHTML = `<div class="banner danger"><i class=fi-rr-cross-circle></i> <span>${mode === 'onsite' ? 'IP/jaringan tidak cocok dengan kantor. Silakan pilih <b>mode WFH</b>.' : 'Setujui pemrosesan data lokasi terlebih dahulu.'}</span></div>`;
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
          <div class="field"><label class="lbl" for="logTask">Tautan task </label><input class="input" id="logTask" placeholder="ASTA-231 atau URL"></div>
          <div class="field"><label class="lbl" for="logCommit">Tautan commit / PR</label><input class="input" id="logCommit" placeholder="github.com/org/repo/pull/12"></div>
          <div class="field"><label class="lbl" for="logHours">Jam kerja</label><input class="input" type="number" id="logHours" min="0" max="16" step="0.5" value="8"></div>
          <div class="field"><label class="lbl" for="logTime">Waktu submit (simulasi)</label><input class="input" type="time" id="logTime" value="${nowTime()}"></div>
        </div>
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
  list();
  $('#logForm').onsubmit = e => {
    e.preventDefault();
    const sum = $('#logSum').value.trim(), task = $('#logTask').value.trim(), commit = $('#logCommit').value.trim();
    const ok = sum || task || commit; $('#logSum').closest('.field').classList.toggle('has-err', !ok); if (!ok) return;
    const me = 'Dewi Lestari';
    LOGS.unshift({ id: Date.now(), tgl: iso(TODAY), nama: me, mode: S.attendance?.mode || '-', ringkasan: sum || task || commit, task, commit, jam: +$('#logHours').value });
    if (S.attendance) S.attendance.logged = sum || task || commit;
    let msg = 'Daily Log tersimpan — kehadiran penuh <i class=fi-rr-check-circle></i>';
    sessionStorage.removeItem('hr_draft'); toast(msg, 'success'); buildNav(); render();
  };
});

/* ===== Workload Malam ===== */
reg('Workload Malam', ['Absensi', 'Workload Malam'], () => `
  <div class="banner info"><i class=fi-rr-moon></i> <span>Revisi/bugfix setelah <b>${esc(S.settings.nightThreshold)}</b> dapat diklaim. Mode kompensasi: <b>${S.settings.compensation === 'carryover' ? 'Carryover (masuk lebih siang H+1)' : 'Insentif lembur di payroll'}</b>. Approval: <b>${S.settings.claimMode === 'auto' ? 'otomatis bila terhubung commit/task' : 'manual Manajer'}</b>.</span></div>
  <div class="card">${table({
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
let rekapFilterStatus = '';

function showTeamDetail(t) {
  if (!t) return;
  const emp = EMP.find(e => e.nama === t.nama) || {};
  const logs = LOGS.filter(l => l.nama === t.nama);
  const p = Math.round(t.load / t.cap * 100);
  const isOk = t.status.includes('Onsite');
  const isInf = t.status.includes('WFH');
  const isWarn = t.status.includes('Belum');
  const statusCls = isOk ? 'success' : isInf ? 'info' : isWarn ? 'warning' : 'danger';
  const iconStatus = isOk ? 'fi-rr-building' : isInf ? 'fi-rr-home' : isWarn ? 'fi-rr-clock' : 'fi-rr-cross-circle';

  const body = `
    <div class="stack" style="gap:16px">
      <!-- Header Profile Card -->
      <div class="row" style="gap:14px;align-items:center;padding:12px 14px;background:#F8FAFC;border:1px solid var(--border);border-radius:var(--r-md)">
        ${av(t.nama, 2)}
        <div style="flex:1">
          <div class="row" style="gap:8px;align-items:center">
            <h3 style="margin:0;font-size:16px;font-weight:700">${esc(t.nama)}</h3>
            ${lz(t.tipe, t.tipe === 'Tetap' ? 'primary' : 'info')}
          </div>
          <div class="caption" style="margin-top:2px;color:#475569">
            <b>${esc(emp.jabatan || 'Staff')}</b> · Tim <b>${esc(t.tim)}</b>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid g2" style="gap:10px">
        <div class="card card-b" style="padding:12px;border:1px solid var(--border)">
          <div class="caption" style="color:var(--text-secondary)">Status Absensi Hari Ini</div>
          <div class="row" style="gap:6px;margin-top:4px;align-items:center">
            <i class="${iconStatus}" style="font-size:16px;color:var(--${statusCls})"></i>
            <b style="font-size:13px">${esc(t.status)}</b>
          </div>
          <div class="caption" style="margin-top:4px;color:#64748B">
            ${isOk ? 'Wifi Kantor "Asta" (IP: 182.253.11.45)' : isInf ? 'Lokasi WFH: Jakarta Selatan (GPS Terverifikasi)' : 'Belum tercatat absensi hari ini'}
          </div>
        </div>
        <div class="card card-b" style="padding:12px;border:1px solid var(--border)">
          <div class="caption" style="color:var(--text-secondary)">Beban Kerja Harian</div>
          <div class="row" style="justify-content:space-between;margin-top:4px;align-items:center">
            <b style="font-size:14px">${t.load} / ${t.cap} SP</b>
            <span class="caption num" style="font-weight:600">${p}%</span>
          </div>
          <div class="bar ${p > 100 ? 'bad' : p > 85 ? 'warn' : 'ok'}" style="margin-top:6px"><i style="width:${Math.min(p, 100)}%"></i></div>
          <div class="caption" style="margin-top:4px;color:${p > 100 ? 'var(--danger)' : '#64748B'}">
            ${p > 100 ? 'Overload — perlu pembagian tugas' : p >= 85 ? 'Kapasitas Penuh' : 'Kapasitas Normal'}
          </div>
        </div>
      </div>

      <!-- Task & Progres Hari Ini -->
      <div class="card card-b" style="border:1px solid var(--border)">
        <div class="row" style="gap:6px;align-items:center;margin-bottom:8px">
          <i class="fi-rr-clipboard-list" style="color:var(--primary)"></i>
          <b style="font-size:13px">Task & Aktivitas Aktif</b>
        </div>
        <div style="background:#F1F5F9;padding:10px 12px;border-radius:6px;margin-bottom:8px">
          <div style="font-size:11px;font-weight:700;color:var(--primary)">TASK HARI INI:</div>
          <div style="font-size:13px;font-weight:600;color:#0F172A;margin-top:2px">${esc(t.task)}</div>
        </div>
        ${logs.length ? `
          <div class="caption" style="margin-bottom:4px">Ringkasan Daily Log Terakhir:</div>
          <div style="margin:0;font-size:13px;color:#334155;background:#fff;border:1px solid var(--border);border-radius:6px;padding:8px 10px;line-height:1.5">
            ${esc(logs[0].ringkasan)}
          </div>
          ${logs[0].commit ? `<div class="caption" style="margin-top:6px"><i class="fi-rr-code-commit"></i> Commit: <a href="https://${esc(logs[0].commit)}" target="_blank" style="color:var(--primary);text-decoration:underline">${esc(logs[0].commit)}</a></div>` : ''}
        ` : `<div class="caption muted" style="font-style:italic">Belum ada submission daily log untuk hari ini.</div>`}
      </div>

      <!-- Informasi Kontak & Karyawan -->
      <div class="card card-b" style="border:1px solid var(--border)">
        <div class="row" style="gap:6px;align-items:center;margin-bottom:8px">
          <i class="fi-rr-user" style="color:var(--primary)"></i>
          <b style="font-size:13px">Informasi Karyawan</b>
        </div>
        <dl class="kv" style="grid-template-columns:100px 1fr;gap:6px 10px;font-size:12px">
          <dt>Email</dt><dd>${esc(emp.email || '-')}</dd>
          <dt>Tim</dt><dd>${esc(t.tim)}</dd>
          <dt>Atasan</dt><dd>${esc(emp.atasan || '-')}</dd>
          <dt>Tipe Pekerja</dt><dd>${esc(t.tipe)}</dd>
        </dl>
      </div>

      <!-- Riwayat Log Singkat -->
      ${logs.length > 1 ? `
        <div class="card card-b" style="border:1px solid var(--border)">
          <b style="font-size:12px;margin-bottom:8px;display:block">Riwayat Log Sebelumnya</b>
          <div class="stack" style="gap:8px">
            ${logs.slice(1).map(l => `
              <div style="font-size:12px;border-bottom:1px solid var(--border);padding-bottom:6px">
                <div class="row" style="justify-content:space-between">
                  <b>${fmtD(l.tgl)}</b>
                  <span class="caption">${l.jam} jam · ${l.mode}</span>
                </div>
                <div class="muted">${esc(l.ringkasan)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const foot = `
    <button class="btn" onclick="closeDrawer()">Tutup</button>
    <button class="btn btn-primary" id="btnNudgeEmployee"><i class="fi-rr-paper-plane"></i> Kirim Pesan / Notif</button>
  `;

  openDrawer('Detail Anggota Tim — ' + t.nama, body, foot);
  if ($('#btnNudgeEmployee')) {
    $('#btnNudgeEmployee').onclick = () => {
      toast(`Notifikasi terkirim ke ${t.nama}`, 'success');
      audit('Kirim Pesan', 'Rekap Tim', `Pesan ke ${t.nama}`);
      closeDrawer();
    };
  }
}

reg('rekap', 'Rekap Tim', ['Absensi', 'Rekap Tim'], () => `
  <div class="grid g4" style="margin-bottom:16px" id="rekapStatCards">
    ${['Hadir Onsite', 'Hadir WFH', 'Belum Submit Progres', 'Tanpa Keterangan'].map(s => {
      const count = TEAM_TODAY.filter(t => t.status === s).length;
      const isOk = s.includes('Onsite'), isInf = s.includes('WFH'), isWarn = s.includes('Belum');
      const cls = isOk ? 'ok' : isInf ? 'inf' : isWarn ? 'warn' : 'bad';
      const isActive = rekapFilterStatus === s;
      return `
        <div class="card stat interactive ${cls} ${isActive ? 'active-stat' : ''}" data-stat="${s}" title="Klik untuk memfilter dan melihat detail anggota">
          <div class="k">${s}</div>
          <div class="v">${count}</div>
          <div class="stat-click-hint"><i class="fi-rr-eye"></i> Klik untuk filter & detail</div>
        </div>`;
    }).join('')}
  </div>
  <div class="tabs" id="rekTabs">
    <button class="on" data-t="tbl"><i class="fi-rr-table"></i> Tabel Anggota</button>
    <button data-t="load"><i class="fi-rr-chart-histogram"></i> Dashboard Workload</button>
  </div>
  <div id="rekBody"></div>`, () => {
  const show = t => {
    $$('#rekTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'tbl') {
      $('#rekBody').innerHTML = `<div class="card">${table('rekap', {
        rows: () => {
          let rows = TEAM_TODAY.map((item, i) => ({ id: i + 1, ...item }));
          if (rekapFilterStatus) {
            rows = rows.filter(r => r.status === rekapFilterStatus);
          }
          return rows;
        },
        toolbar: () => `
          <select class="input" id="fStatus" style="font-weight:500">
            <option value="" ${rekapFilterStatus === '' ? 'selected' : ''}>— Semua Status (${TEAM_TODAY.length}) —</option>
            ${['Hadir Onsite', 'Hadir WFH', 'Belum Submit Progres', 'Tanpa Keterangan'].map(s => `
              <option value="${s}" ${rekapFilterStatus === s ? 'selected' : ''}>${s} (${TEAM_TODAY.filter(x => x.status === s).length})</option>
            `).join('')}
          </select>
          ${rekapFilterStatus ? `<button class="btn btn-sm btn-outline" id="btnResetRekapFilter"><i class="fi-rr-cross-small"></i> Reset Filter</button>` : ''}
        `,
        cols: [
          { k: 'nama', label: 'Karyawan', fmt: r => person(r.nama, r.tim) },
          { k: 'tipe', label: 'Tipe', fmt: r => lz(r.tipe, r.tipe === 'Tetap' ? 'primary' : 'info') },
          { k: 'status', label: 'Status Absensi', fmt: r => lz(r.status) },
          { k: 'task', label: 'Task Harian', fmt: r => `<div style="font-weight:500">${esc(r.task)}</div>` },
          { k: 'load', label: 'Beban (SP)', cls: 'r num', fmt: r => {
            const p = Math.round(r.load / r.cap * 100);
            return `<div style="display:inline-block;text-align:right"><div><b>${r.load}/${r.cap}</b></div><div class="caption ${p > 100 ? 'down' : ''}">${p}%</div></div>`;
          } },
          { k: 'aksi', label: 'Aksi', sort: false, cls: 'r', fmt: r => `<button class="btn btn-sm btn-outline" data-team-detail="${r.nama}" style="padding:4px 10px"><i class="fi-rr-eye"></i> Detail</button>` }
        ],
        onRow: id => {
          const item = TEAM_TODAY[id - 1];
          if (item) showTeamDetail(item);
        },
        after: h => {
          const fs = $('#fStatus', h);
          if (fs) {
            fs.onchange = () => {
              rekapFilterStatus = fs.value;
              updateStatCardsHighlight();
              paintTable('rekap');
            };
          }
          const rst = $('#btnResetRekapFilter', h);
          if (rst) {
            rst.onclick = () => {
              rekapFilterStatus = '';
              updateStatCardsHighlight();
              paintTable('rekap');
            };
          }
          $$('[data-team-detail]', h).forEach(btn => {
            btn.onclick = e => {
              e.stopPropagation();
              const item = TEAM_TODAY.find(x => x.nama === btn.dataset.teamDetail);
              if (item) showTeamDetail(item);
            };
          });
        }
      })}</div>`;
      paintTable('rekap');
    } else {
      $('#rekBody').innerHTML = `<div class="card"><div class="card-h" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h3 style="margin:0">Kapasitas & Beban Kerja (Story Point Harian)</h3>
          <span class="caption">Klik kartu untuk melihat rincian progres & data karyawan</span>
        </div>
        <span class="badge" style="background:#eef2ff;color:#3730a3">Kapasitas standar: 8 SP</span>
      </div>
      <div class="card-b stack" style="gap:10px">
        ${TEAM_TODAY.map(t => {
          const p = Math.round(t.load / t.cap * 100);
          return `
            <div class="workload-card-item" data-team-workload="${t.nama}">
              <div class="row" style="justify-content:space-between;align-items:center">
                <div class="row" style="gap:10px;align-items:center">
                  ${av(t.nama, 1)}
                  <div>
                    <div class="row" style="gap:6px;align-items:center">
                      <b style="color:#0f172a">${esc(t.nama)}</b>
                      <span class="caption muted">(${esc(t.tim)})</span>
                      ${lz(t.status)}
                    </div>
                    <div class="caption" style="margin-top:2px;color:#64748b">Task: ${esc(t.task)}</div>
                  </div>
                </div>
                <div style="text-align:right">
                  <div class="num" style="font-weight:700;font-size:14px">${t.load}/${t.cap} SP <span style="font-size:12px;font-weight:normal;color:#64748b">(${p}%)</span></div>
                  <button class="btn btn-sm btn-outline" style="padding:2px 8px;font-size:11px;margin-top:4px"><i class="fi-rr-eye"></i> Detail</button>
                </div>
              </div>
              <div class="bar ${p > 100 ? 'bad' : p > 85 ? 'warn' : 'ok'}" style="margin-top:8px"><i style="width:${Math.min(p, 100)}%"></i></div>
              ${p > 100 ? '<div class="caption down" style="margin-top:4px;font-weight:600"><i class="fi-rr-triangle-warning"></i> Overload kapasitas — pertimbangkan redistribusi task</div>' : ''}
            </div>`;
        }).join('')}</div></div>`;

      $$('[data-team-workload]').forEach(card => {
        card.onclick = () => {
          const item = TEAM_TODAY.find(x => x.nama === card.dataset.teamWorkload);
          if (item) showTeamDetail(item);
        };
      });
    }
  };

  const updateStatCardsHighlight = () => {
    $$('#rekapStatCards [data-stat]').forEach(card => {
      card.classList.toggle('active-stat', card.dataset.stat === rekapFilterStatus);
    });
  };

  // Wire up stat cards click
  $$('#rekapStatCards [data-stat]').forEach(card => {
    card.onclick = () => {
      const s = card.dataset.stat;
      if (rekapFilterStatus === s) {
        rekapFilterStatus = '';
        toast('Filter status dibatalkan', 'info');
      } else {
        rekapFilterStatus = s;
        const matching = TEAM_TODAY.filter(t => t.status === s);
        toast(`Memfilter status: ${s} (${matching.length} orang)`, 'info');
      }
      updateStatCardsHighlight();
      show('tbl');
    };
  });

  $$('#rekTabs button').forEach(b => b.onclick = () => show(b.dataset.t));
  show('tbl');
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
  return `<form id="jobForm" class="stack" style="gap:16px" novalidate>
    <div class="form-grid">
      <div class="field full">
        <label class="lbl" for="jJudul">Posisi / Judul Lowongan *</label>
        <input class="input" id="jJudul" value="${esc(j.judul || '')}" placeholder="Contoh: Senior Backend Engineer">
        <div class="err">Wajib diisi</div>
      </div>
      <div class="field">
        <label class="lbl" for="jTim">Tim / Divisi</label>
        <input class="input" id="jTim" value="${esc(j.tim || 'Engineering')}" placeholder="Engineering, Design, QA, PMO...">
      </div>
      <div class="field">
        <label class="lbl" for="jLevel">Level Jabatan</label>
        <select class="input" id="jLevel">
          ${['Junior', 'Mid', 'Senior', 'Lead'].map(l => `<option ${j.level === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label class="lbl" for="jLok">Lokasi Kerja</label>
        <input class="input" id="jLok" value="${esc(j.lokasi || 'Hybrid — Jakarta')}" placeholder="Hybrid, WFH, Onsite...">
      </div>
      <div class="field">
        <label class="lbl" for="jStatus">Status Publikasi</label>
        <select class="input" id="jStatus">
          ${['Draft', 'Published', 'Closed'].map(l => `<option ${j.status === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Multi-Skill dengan Level Input -->
    <div class="field">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:6px">
        <label class="lbl" style="margin:0;font-weight:600;display:flex;align-items:center;gap:6px">
          <i class="fi-rr-star" style="color:var(--primary)"></i> Keahlian / Skill yang Dibutuhkan (Multi-Skill & Level) *
        </label>
        <span class="caption" id="skillCountText" style="color:#64748b">0 Skill terdaftar</span>
      </div>

      <div class="skill-box-container">
        <!-- Input Row -->
        <div class="row" style="gap:8px;align-items:flex-end;margin-bottom:10px">
          <div style="flex:2;min-width:200px">
            <label class="lbl" for="newSkillName" style="font-size:11px;color:#64748b;margin-bottom:4px">Nama Keahlian / Teknologi</label>
            <input class="input" id="newSkillName" placeholder="Ketik nama skill (misal: React, Node.js, PostgreSQL...)" style="height:38px">
          </div>
          <div style="flex:1;min-width:140px">
            <label class="lbl" for="newSkillLevel" style="font-size:11px;color:#64748b;margin-bottom:4px">Tingkat Kemahiran (Level)</label>
            <select class="input" id="newSkillLevel" style="height:38px">
              <option value="Junior">Pemula (Junior)</option>
              <option value="Mid" selected>Menengah (Mid)</option>
              <option value="Senior">Mahir (Senior)</option>
              <option value="Lead">Ahli (Lead / Expert)</option>
            </select>
          </div>
          <button type="button" class="btn btn-primary" id="btnAddSkillBtn" style="height:38px;padding:0 16px;white-space:nowrap">
            <i class="fi-rr-plus"></i> Tambah Skill
          </button>
        </div>

        <!-- Quick Recommendations -->
        <div class="row" style="gap:6px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
          <span class="caption" style="font-size:11px;color:#64748b">Rekomendasi Cepat:</span>
          ${['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Figma', 'Docker', 'Python', 'Go', 'Cypress', 'Git', 'AWS'].map(tag => `
            <button type="button" class="chip" data-quick-skill="${tag}" style="font-size:11px;height:24px;padding:0 8px">+ ${tag}</button>
          `).join('')}
        </div>

        <!-- Container Daftar Skill yang Sudah Ditambahkan -->
        <div style="border-top:1px dashed var(--border);padding-top:10px">
          <div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:6px">DAFTAR SKILL DIPERLUKAN:</div>
          <div id="skillsChipsContainer" class="skill-chips-wrap"></div>
        </div>
      </div>
      <div class="err" id="skillErr" style="color:var(--danger);font-size:12px;display:none;margin-top:4px">Tambahkan minimal 1 skill untuk posisi ini</div>
    </div>

    <div class="field">
      <label class="lbl" for="jDesk">Deskripsi & Tanggung Jawab Pekerjaan</label>
      <textarea class="input" id="jDesk" rows="3" placeholder="Tuliskan gambaran pekerjaan, kualifikasi umum, dan ekspektasi peran...">${esc(j.deskripsi || '')}</textarea>
    </div>
  </form>`;
}

function openJob(j) {
  let jobSkills = [];
  if (j && Array.isArray(j.skills) && j.skills.length) {
    jobSkills = j.skills.map(s => ({ ...s }));
  } else if (j && j.skill) {
    jobSkills = j.skill.split(',').map(s => {
      const m = s.match(/(.+?)\s*\((.+?)\)$/);
      if (m) return { name: m[1].trim(), level: m[2].trim() };
      return { name: s.trim(), level: j.level || 'Mid' };
    }).filter(s => s.name);
  } else {
    jobSkills = [
      { name: 'JavaScript / TypeScript', level: 'Mid' },
      { name: 'Git & Version Control', level: 'Mid' }
    ];
  }

  openModal(j ? 'Ubah Lowongan Pekerjaan' : 'Buat Lowongan Baru', jobForm(j), '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave"><i class="fi-rr-disk"></i> Simpan Lowongan</button>', true);

  const renderSkills = () => {
    const container = $('#skillsChipsContainer');
    const countEl = $('#skillCountText');
    const errEl = $('#skillErr');
    if (!container) return;

    if (countEl) countEl.textContent = `${jobSkills.length} Skill terdaftar`;
    if (errEl) errEl.style.display = jobSkills.length === 0 ? 'block' : 'none';

    if (jobSkills.length === 0) {
      container.innerHTML = '<span class="caption muted" style="font-style:italic;padding:4px 0">Belum ada skill yang ditambahkan. Gunakan form di atas atau klik rekomendasi cepat.</span>';
      return;
    }

    container.innerHTML = jobSkills.map((s, idx) => {
      const lvl = (s.level || 'Mid');
      const lvlCls = 'level-' + lvl.toLowerCase();
      return `
        <div class="skill-chip-item">
          <i class="fi-rr-check" style="font-size:10px;color:var(--primary)"></i>
          <b>${esc(s.name)}</b>
          <span class="skill-level-badge ${lvlCls}">${esc(lvl)}</span>
          <button type="button" class="skill-remove-btn" data-rem-skill="${idx}" title="Hapus skill ${esc(s.name)}">
            <i class="fi-rr-cross-small"></i>
          </button>
        </div>`;
    }).join('');

    $$('[data-rem-skill]', container).forEach(b => {
      b.onclick = () => {
        const idx = +b.dataset.remSkill;
        jobSkills.splice(idx, 1);
        renderSkills();
      };
    });
  };

  const addSkill = (name, level) => {
    const n = name.trim();
    if (!n) return;
    const exists = jobSkills.find(s => s.name.toLowerCase() === n.toLowerCase());
    if (exists) {
      exists.level = level;
      toast(`Level skill ${n} diperbarui menjadi ${level}`, 'info');
    } else {
      jobSkills.push({ name: n, level });
    }
    const inp = $('#newSkillName');
    if (inp) { inp.value = ''; inp.focus(); }
    renderSkills();
  };

  $('#btnAddSkillBtn').onclick = () => {
    const n = $('#newSkillName').value;
    const l = $('#newSkillLevel').value;
    if (!n.trim()) {
      toast('Ketikkan nama skill terlebih dahulu', 'warning');
      $('#newSkillName').focus();
      return;
    }
    addSkill(n, l);
  };

  $('#newSkillName').onkeydown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('#btnAddSkillBtn').click();
    }
  };

  $$('[data-quick-skill]').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.quickSkill;
      const level = $('#newSkillLevel').value || 'Mid';
      addSkill(name, level);
    };
  });

  renderSkills();

  $('#mCancel').onclick = closeModal;
  $('#mSave').onclick = () => {
    const ju = $('#jJudul').value.trim();
    $('#jJudul').closest('.field').classList.toggle('has-err', !ju);
    if (!ju) {
      $('#jJudul').focus();
      return;
    }
    if (jobSkills.length === 0) {
      toast('Tambahkan minimal 1 skill/keahlian untuk lowongan ini', 'warning');
      $('#skillErr').style.display = 'block';
      $('#newSkillName').focus();
      return;
    }

    const d = {
      judul: ju,
      tim: $('#jTim').value || 'Engineering',
      level: $('#jLevel').value,
      lokasi: $('#jLok').value || 'Hybrid — Jakarta',
      status: $('#jStatus').value,
      skills: jobSkills,
      skill: jobSkills.map(s => `${s.name} (${s.level})`).join(', '),
      deskripsi: $('#jDesk').value
    };

    if (j) Object.assign(j, d);
    else JOBS.unshift({ id: Date.now(), ...d });

    audit(j ? 'Ubah' : 'Buat', 'Lowongan', `${ju} — ${jobSkills.length} skills`);
    toast('Data lowongan berhasil disimpan', 'success');
    closeModal();
    paintAll();
  };
}

reg('lowongan', 'Lowongan', ['Rekrutmen', 'Lowongan'], () => `
  <div class="banner info"><i class="fi-rr-info"></i> <span>Kebutuhan skill pada setiap lowongan kini mendukung multi-skill terstruktur lengkap dengan level kemahiran (Junior, Mid, Senior, Lead).</span></div>
  <div class="card">${table('jobs', {
  rows: () => JOBS.map(j => ({ ...j, pelamar: APP.filter(a => a.job === j.id).length })),
  cols: [
    {
      k: 'judul',
      label: 'Posisi & Kebutuhan Keahlian (Multi-Skill)',
      fmt: r => {
        const skillList = Array.isArray(r.skills) && r.skills.length
          ? r.skills
          : (r.skill ? r.skill.split(',').map(s => {
              const m = s.match(/(.+?)\s*\((.+?)\)$/);
              return m ? { name: m[1].trim(), level: m[2].trim() } : { name: s.trim(), level: r.level || 'Mid' };
            }) : []);
        const skillsHtml = skillList.map(s => {
          const lvlCls = 'level-' + (s.level || 'mid').toLowerCase();
          return `<span class="skill-pill-badge">${esc(s.name)} <b class="${lvlCls}">${esc(s.level)}</b></span>`;
        }).join('');
        return `<div><b style="font-size:14px;color:#0F172A">${esc(r.judul)}</b></div><div style="margin-top:4px">${skillsHtml || '<span class="muted">-</span>'}</div>`;
      }
    },
    { k: 'tim', label: 'Tim' },
    { k: 'level', label: 'Level' },
    { k: 'lokasi', label: 'Lokasi' },
    { k: 'pelamar', label: 'Pelamar', cls: 'r num' },
    { k: 'status', label: 'Status', fmt: r => lz(r.status) },
    { k: 'x', label: '', sort: false, fmt: r => `<button class="btn btn-sm" data-ej="${r.id}"><i class="fi-rr-edit"></i> Ubah</button>` }
  ],
  after: h => $$('[data-ej]', h).forEach(b => b.onclick = () => openJob(JOBS.find(j => j.id == b.dataset.ej)))
})}</div>`, () => paintAll(),
  () => `<button class="btn" id="btnCareer"><i class="fi-rr-globe"></i> Pratinjau Career Page</button><button class="btn btn-primary" id="btnAddJob"><i class="fi-rr-plus"></i> Tambah Lowongan</button>`);

function careerPage() {
  openModal('Career Page Publik', `
    <div class="pub card-b" style="border-radius:12px;padding:20px">
      <h2>Bergabung dengan AstaCode</h2>
      <p class="muted" style="margin-bottom:16px">Software house dengan kultur fleksibel & kekeluargaan. Bangun karir terbaik Anda bersama tim engineering & desain kami.</p>
      ${JOBS.filter(j => j.status === 'Published').map(j => {
        const skillList = Array.isArray(j.skills) && j.skills.length
          ? j.skills
          : (j.skill ? j.skill.split(',').map(s => {
              const m = s.match(/(.+?)\s*\((.+?)\)$/);
              return m ? { name: m[1].trim(), level: m[2].trim() } : { name: s.trim(), level: j.level || 'Mid' };
            }) : []);
        return `
          <div class="card card-b" style="margin-bottom:12px;border:1px solid var(--border)">
            <div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
              <div style="flex:1;min-width:280px">
                <div class="row" style="gap:8px;align-items:center">
                  <b style="font-size:15px;color:#0F172A">${esc(j.judul)}</b>
                  <span class="lz lz-primary">${esc(j.level)}</span>
                </div>
                <div class="caption" style="margin:4px 0 8px;color:#475569">
                  ${esc(j.tim)} · Lokasi: <b>${esc(j.lokasi)}</b>
                </div>
                <div style="margin-top:6px">
                  <div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px">Kebutuhan Skill:</div>
                  ${skillList.map(s => `<span class="skill-pill-badge">${esc(s.name)} <b class="level-${(s.level||'mid').toLowerCase()}">${esc(s.level)}</b></span>`).join('')}
                </div>
                <p class="caption" style="margin-top:8px;color:#334155">${esc(j.deskripsi || '')}</p>
              </div>
              <button class="btn btn-primary" data-apply="${j.id}" style="padding:8px 18px">
                <i class="fi-rr-paper-plane"></i> Lamar Posisi Ini
              </button>
            </div>
          </div>`;
      }).join('')}
    </div>`, '', true);

  $$('[data-apply]').forEach(b => b.onclick = () => {
    toast('Form lamaran terkirim (demo). Pelamar masuk ke pipeline “Applied”.', 'success');
    APP.push({
      id: Date.now(),
      nama: 'Pelamar Baru ' + (APP.length + 1),
      job: +b.dataset.apply,
      stage: 'Applied',
      skor: 0,
      email: 'baru@mail.com',
      hp: '0812-9999-8888',
      edu: 'S1 Teknik Informatika',
      exp: '2 th Pengalaman',
      skill: 'Sesuai Kualifikasi Lowongan'
    });
    closeModal();
    paintAll();
  });
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
  const p = PKL.find(x => x.id === id);
  if (!p) return;
  const q = checkQuota(p.mulai, p.selesai, p.id);
  const days = [];
  for (let d = parse(p.mulai), i = 0; iso(d) <= p.selesai && i < 120; d = addDays(d, 1), i++) days.push(occupancy(iso(d), p.id));
  const mx = S.settings.quotaMax;
  openDrawer(p.nama, `
    <div class="row" style="margin-bottom:12px;align-items:center"><h3 style="flex:1;margin:0">${esc(p.instansi)}</h3>${lz(p.status)}</div>
    <dl class="kv">
      <dt>Jurusan</dt><dd>${esc(p.jurusan || '-')}</dd>
      <dt>Email Kontak</dt><dd>${esc(p.kontak || '-')}</dd>
      ${p.hp ? `<dt>WhatsApp / HP</dt><dd>${esc(p.hp)}</dd>` : ''}
      <dt>Minat Divisi</dt><dd><b>${esc(p.minatDivisi || p.divisi || 'Engineering')}</b></dd>
      <dt>Periode</dt><dd>${fmtD(p.mulai)} – ${fmtD(p.selesai)}</dd>
      <dt>Surat</dt><dd><i class=fi-rr-document></i> ${esc(p.fileName || 'surat-permohonan.pdf')} <a href="#" data-dl style="color:var(--primary);margin-left:6px;text-decoration:underline">Lihat PDF</a></dd>
      ${p.porto ? `<dt>Portofolio</dt><dd><a href="${esc(p.porto)}" target="_blank" style="color:var(--primary);text-decoration:underline">${esc(p.porto)}</a></dd>` : ''}
      <dt>No. surat</dt><dd>${esc(p.nomor || '—')}</dd>
    </dl>
    <div class="sep"></div>
    <h3 style="margin-bottom:8px">Hasil Analisis Kuota (Realtime Overlap)</h3>
    <div class="banner ${q.available ? 'ok' : 'danger'}">
      ${q.available ? '<i class=fi-rr-check-circle></i>' : '<i class=fi-rr-cross-circle></i>'}
      <span>${q.available ? `<b>Available</b> — okupansi tertinggi ${q.max}/${mx} dalam ${q.days} hari.` : `<b>Kuota Penuh</b> mulai ${fmtD(q.fullDay)} (${q.max}/${mx}).`}</span>
    </div>
    <div class="caption" style="margin-bottom:4px">Okupansi harian dalam rentang periode magang</div>
    <div class="chart" style="height:80px;gap:1px">${days.map(d => `<div class="c" style="gap:0"><i style="height:${d / mx * 100}%;max-width:none;background:${d >= mx ? '#DC2626' : d >= mx - 1 ? '#D97706' : '#16A34A'}"></i></div>`).join('')}</div>
    ${p.status === 'Menunggu' ? `
      <div class="sep"></div>
      <div class="field">
        <label class="lbl" for="pDiv">Divisi Penempatan</label>
        <select class="input" id="pDiv">${['Engineering', 'Design', 'QA'].map(d => `<option ${(p.minatDivisi === d || p.divisi === d) ? 'selected' : ''}>${d}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label class="lbl" for="pPemb">Pembimbing Lapangan</label>
        <select class="input" id="pPemb">${EMP.filter(e => e.tipe === 'Tetap').map(e => `<option>${esc(e.nama)}</option>`).join('')}</select>
      </div>` : ''}`,
    ['hr'].includes(S.role) && p.status === 'Menunggu' ? `<button class="btn btn-danger" id="pRej">Tolak (surat otomatis)</button><button class="btn btn-success" id="pAcc" ${q.available ? '' : 'disabled'}>Terima & Terbitkan Surat</button>` : (p.nomor ? '<button class="btn" id="pLet">Lihat Surat</button>' : ''));
  $$('[data-dl]').forEach(a => a.onclick = e => { e.preventDefault(); toast('Membuka PDF surat permohonan resmi', 'info'); });
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
  <!-- Ringkasan Statistik Pengajuan PKL -->
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat ok">
      <div class="k">Total Pengajuan</div>
      <div class="v">${PKL.length}</div>
      <div class="caption" style="color:#64748b;margin-top:2px">Semua permohonan masuk</div>
    </div>
    <div class="card stat warn">
      <div class="k">Menunggu Review</div>
      <div class="v">${PKL.filter(p => p.status === 'Menunggu').length}</div>
      <div class="caption" style="color:#64748b;margin-top:2px">Perlu keputusan HR</div>
    </div>
    <div class="card stat inf">
      <div class="k">Peserta Aktif</div>
      <div class="v">${PKL.filter(p => p.status === 'Aktif').length}</div>
      <div class="caption" style="color:#64748b;margin-top:2px">Sedang menjalani magang</div>
    </div>
    <div class="card stat bad">
      <div class="k">Selesai / Ditolak</div>
      <div class="v">${PKL.filter(p => ['Selesai', 'Ditolak'].includes(p.status)).length}</div>
      <div class="caption" style="color:#64748b;margin-top:2px">Arsip permohonan</div>
    </div>
  </div>

  <div class="banner info">
    <i class="fi-rr-shield-check"></i>
    <span>Mode kuota penuh: <b>${S.settings.autoReject ? 'Auto-reject dengan surat penolakan otomatis' : 'Tinjau manual oleh HR'}</b> (konfigurasi dapat diatur di menu Pengaturan).</span>
  </div>

  <div class="card">${table('pkl', {
  rows: () => PKL.map(p => ({
    ...p,
    q: p.status === 'Menunggu' ? (checkQuota(p.mulai, p.selesai, p.id).available ? 'Available' : 'Kuota Penuh') : '—'
  })),
  toolbar: () => `
    <select class="input" id="fPkl" style="font-weight:500">
      <option value="">— Semua Status (${PKL.length}) —</option>
      ${['Menunggu', 'Aktif', 'Ditolak', 'Selesai'].map(s => `
        <option value="${s}" ${TBL.pkl.f === s ? 'selected' : ''}>${s} (${PKL.filter(p => p.status === s).length})</option>
      `).join('')}
    </select>
  `,
  cols: [
    { k: 'nama', label: 'Nama Pemohon & Jurusan', fmt: r => person(r.nama, `${r.jurusan || '-'} · ${r.kontak || ''}`) },
    { k: 'instansi', label: 'Asal Sekolah / Kampus', fmt: r => `<span class="badge" style="background:#eef2ff;color:#3730a3"><i class="fi-rr-school" style="margin-right:4px"></i>${esc(r.instansi)}</span>` },
    { k: 'divisi', label: 'Divisi', fmt: r => r.divisi ? `<b>${esc(r.divisi)}</b>` : `<span class="muted">${esc(r.minatDivisi || 'Belum diatur')}</span>` },
    { k: 'mulai', label: 'Periode Magang', fmt: r => `${fmtD(r.mulai)} – ${fmtD(r.selesai)}` },
    { k: 'q', label: 'Validasi Kuota', fmt: r => r.q === '—' ? '—' : lz(r.q, r.q === 'Available' ? 'success' : 'danger') },
    { k: 'status', label: 'Status', fmt: r => lz(r.status) },
    { k: 'aksi', label: 'Aksi', sort: false, cls: 'r', fmt: r => `<button class="btn btn-sm btn-outline" data-rev="${r.id}" style="padding:4px 10px"><i class="fi-rr-search-alt"></i> Tinjau</button>` }
  ],
  onRow: reviewPkl,
  after: h => {
    const f = $('#fPkl', h);
    if (f) {
      f.onchange = () => {
        TBL.pkl.f = f.value;
        TBL.pkl.page = 1;
        paintTable('pkl');
      };
    }
    $$('[data-rev]', h).forEach(b => {
      b.onclick = e => {
        e.stopPropagation();
        reviewPkl(+b.dataset.rev);
      };
    });
  }
})}</div>`, () => {
  const t = TBL.pkl, b = t.rows;
  t.rows = () => b().filter(p => !t.f || p.status === t.f);
  paintTable('pkl');
},
  () => `
    <button class="btn btn-primary" id="btnNewPkl"><i class="fi-rr-plus"></i> Form Pengajuan PKL</button>
    <button class="btn btn-outline" id="btnPublicForm"><i class="fi-rr-globe"></i> Portal Publik</button>
  `);

function publicPklForm() {
  const defaultStart = dOff(14);
  const defaultEnd = dOff(104);

  const formHTML = `
  <div class="stack" style="gap:16px">
    <div class="banner info" style="margin-bottom:0">
      <i class="fi-rr-graduation-cap" style="font-size:18px"></i>
      <span><b>Portal Publik Pendaftaran PKL / Magang Industri — AstaCode Software House.</b> Sistem melakukan validasi kuota aktif otomatis untuk mencegah bentrok jadwal.</span>
    </div>

    <form id="pubForm" novalidate style="display:flex;flex-direction:column;gap:14px">
      <!-- 1. Identitas Pemohon & Instansi -->
      <div class="form-section-card">
        <div class="form-section-header">
          <h4><i class="fi-rr-user-graduate" style="color:var(--primary)"></i> 1. Identitas Pemohon & Instansi Pendidikan</h4>
          <span class="caption" style="color:#64748b">* Wajib diisi</span>
        </div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label class="lbl" for="fNama">Nama Lengkap Siswa / Mahasiswa *</label>
              <input class="input" id="fNama" placeholder="Contoh: Muhammad Kevin Alamsyah">
              <div class="err">Nama pemohon wajib diisi</div>
            </div>
            <div class="field">
              <label class="lbl" for="fInst">Asal Sekolah / Kampus / Politeknik *</label>
              <input class="input" id="fInst" list="instList" placeholder="Contoh: SMKN 1 Jakarta">
              <datalist id="instList">
                <option value="SMKN 1 Jakarta">
                <option value="SMK Telkom Bandung">
                <option value="SMKN 4 Bandung">
                <option value="Universitas Indonesia">
                <option value="Politeknik Negeri Jakarta">
                <option value="Universitas Gunadarma">
                <option value="SMK Negeri 2 Depok">
                <option value="Universitas Brawijaya">
              </datalist>
              <div class="err">Nama instansi wajib diisi</div>
            </div>
            <div class="field">
              <label class="lbl" for="fJur">Jurusan / Program Studi *</label>
              <input class="input" id="fJur" placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)">
              <div class="err">Jurusan wajib diisi</div>
            </div>
            <div class="field">
              <label class="lbl" for="fDivMinat">Pilihan Divisi Peminatan Magang</label>
              <select class="input" id="fDivMinat">
                <option value="Engineering" selected>Engineering (Software / Web / Backend / Frontend)</option>
                <option value="Design">UI/UX Design & Product Research</option>
                <option value="QA">Quality Assurance & Software Testing</option>
              </select>
            </div>
            <div class="field">
              <label class="lbl" for="fKon">Email Kontak Aktif (Instansi / Siswa) *</label>
              <input class="input" id="fKon" type="email" placeholder="Contoh: kevin@smkn1.sch.id">
              <div class="err">Format email tidak valid</div>
            </div>
            <div class="field">
              <label class="lbl" for="fHp">Nomor WhatsApp / Handphone *</label>
              <input class="input" id="fHp" type="tel" placeholder="Contoh: 0812-3456-7890" value="0812-">
              <div class="err">Nomor kontak wajib diisi</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Rencana Periode Magang & Live Quota Check -->
      <div class="form-section-card">
        <div class="form-section-header">
          <h4><i class="fi-rr-calendar" style="color:var(--primary)"></i> 2. Rencana Periode PKL & Cek Kuota Otomatis</h4>
          <span class="badge" id="pklDurationBadge" style="background:#eef2ff;color:#3730a3;font-weight:600">Durasi: 90 Hari (~3 Bulan)</span>
        </div>
        <div class="form-section-body">
          <div class="form-grid">
            <div class="field">
              <label class="lbl" for="fMulai">Tanggal Mulai PKL *</label>
              <input class="input" id="fMulai" type="date" value="${defaultStart}">
              <div class="caption" style="margin-top:3px;color:#64748b">Jadwal hari pertama magang</div>
            </div>
            <div class="field">
              <label class="lbl" for="fSelesai">Tanggal Selesai PKL *</label>
              <input class="input" id="fSelesai" type="date" value="${defaultEnd}">
              <div class="err">Tanggal selesai harus setelah tanggal mulai</div>
            </div>
          </div>

          <!-- Live Quota Widget -->
          <div id="quotaLive" style="margin-top:12px"></div>
        </div>
      </div>

      <!-- 3. Berkas Permohonan & Verifikasi -->
      <div class="form-section-card">
        <div class="form-section-header">
          <h4><i class="fi-rr-document" style="color:var(--primary)"></i> 3. Berkas Dokumen Persyaratan & Verifikasi</h4>
          <span class="caption" style="color:#64748b">Format PDF Resmi (Maks 5 MB)</span>
        </div>
        <div class="form-section-body">
          <!-- Drop Area -->
          <div class="field">
            <label class="lbl">Surat Permohonan Resmi dari Sekolah / Kampus *</label>
            <div class="drop-zone-enhanced" id="dropZone">
              <input type="file" id="fFile" accept="application/pdf" hidden>
              <div id="dropContent">
                <i class="fi-rr-cloud-upload" style="font-size:36px;color:var(--primary)"></i>
                <div style="font-weight:600;margin-top:8px;font-size:14px;color:#0F172A">Unggah File Surat Permohonan PKL (PDF)</div>
                <div class="caption" style="color:#64748B;margin-top:3px">
                  Tarik & letakkan file di sini, atau <span style="color:var(--primary);text-decoration:underline;font-weight:600">klik untuk menelusuri file</span>
                </div>
                <div class="caption" style="font-size:11px;color:#94A3B8;margin-top:5px">
                  Wajib bertandatangan kepala sekolah/pimpinan & stempel resmi. Ukuran maks. 5 MB.
                </div>
              </div>
            </div>
            <div class="err" id="fileErr" style="color:var(--danger);font-size:12px;display:none;margin-top:6px">Surat permohonan resmi dalam format PDF wajib diunggah</div>
          </div>

          <!-- Portofolio / CV Link -->
          <div class="field" style="margin-top:12px">
            <label class="lbl" for="fPorto"><i class="fi-rr-link" style="color:var(--primary)"></i> Link Portofolio / GitHub / Resume (Opsional)</label>
            <input class="input" id="fPorto" placeholder="https://github.com/username atau link Google Drive portofolio karya">
            <div class="caption" style="margin-top:2px;color:#64748b">Memberikan nilai tambah saat seleksi divisi peminatan</div>
          </div>

          <!-- Anti-Spam Captcha & Consent Box -->
          <div style="margin-top:14px;padding:12px 16px;background:#F8FAFC;border:1px solid var(--border);border-radius:var(--r-md)">
            <label class="row" style="cursor:pointer;gap:12px;align-items:flex-start;user-select:none">
              <input type="checkbox" id="fCap" style="width:18px;height:18px;margin-top:2px;accent-color:var(--primary)">
              <div style="flex:1">
                <div style="font-weight:600;font-size:13px;color:#0F172A;display:flex;align-items:center;gap:6px">
                  <i class="fi-rr-shield-check" style="color:var(--primary)"></i> Konfirmasi Kebenaran Data & Bebas Spam
                </div>
                <div class="caption" style="color:#64748B;margin-top:3px;line-height:1.4">
                  Saya menyatakan dengan sesungguhnya bahwa seluruh data yang diisikan adalah benar, dan surat permohonan PKL resmi yang dilampirkan adalah sah dikeluarkan oleh instansi pendidikan yang bersangkutan.
                </div>
              </div>
            </label>
            <div class="err" id="capErr" style="color:var(--danger);font-size:12px;display:none;margin-top:6px">Silakan centang persetujuan konfirmasi di atas</div>
          </div>
        </div>
      </div>
    </form>
  </div>`;

  const footHTML = `
    <button class="btn" id="mCancel">Batal</button>
    <button class="btn btn-primary" id="mSave" style="padding:10px 22px;font-weight:600">
      <i class="fi-rr-paper-plane"></i> Kirim Formulir Pengajuan
    </button>
  `;

  openModal('Formulir Pengajuan PKL / Magang Industri', formHTML, footHTML, true);

  let uploadedFile = null;

  const live = () => {
    const s = $('#fMulai').value;
    const e = $('#fSelesai').value;
    const durBadge = $('#pklDurationBadge');

    if (!s || !e || e <= s) {
      $('#quotaLive').innerHTML = '<div class="banner warn"><i class="fi-rr-triangle-warning"></i> <span>Tanggal selesai harus setelah tanggal mulai.</span></div>';
      if (durBadge) durBadge.textContent = 'Durasi tidak valid';
      return;
    }

    const diffDays = Math.round((parse(e) - parse(s)) / (1000 * 60 * 60 * 24));
    const diffMonths = (diffDays / 30).toFixed(1);
    if (durBadge) durBadge.textContent = `Durasi: ${diffDays} Hari (~${diffMonths} Bulan)`;

    const q = checkQuota(s, e);
    const mx = S.settings.quotaMax;
    const pct = Math.min(100, Math.round(q.max / mx * 100));

    if (q.available) {
      $('#quotaLive').innerHTML = `
        <div class="quota-box-widget ok">
          <div class="row" style="justify-content:space-between;align-items:center">
            <div class="row" style="gap:8px;align-items:center">
              <span class="lz lz-success"><i class="fi-rr-check-circle"></i> Kuota Tersedia</span>
              <b style="font-size:13px;color:#166534">Kapasitas Mencukupi (${q.max}/${mx} Terisi)</b>
            </div>
            <span class="caption" style="color:#166534;font-weight:700">${pct}% Terpakai</span>
          </div>
          <div class="bar ok" style="margin:8px 0 6px"><i style="width:${pct}%"></i></div>
          <div class="caption" style="color:#14532D">
            Tersedia kuota magang yang mencukupi untuk seluruh <b>${q.days} hari</b> pada rentang tanggal yang dipilih. Pengajuan dapat langsung diproses oleh HR.
          </div>
        </div>`;
    } else {
      $('#quotaLive').innerHTML = `
        <div class="quota-box-widget full">
          <div class="row" style="justify-content:space-between;align-items:center">
            <div class="row" style="gap:8px;align-items:center">
              <span class="lz lz-danger"><i class="fi-rr-cross-circle"></i> Kuota Penuh</span>
              <b style="font-size:13px;color:#991B1B">Maksimal Kuota Terlampaui (${q.max}/${mx})</b>
            </div>
            <span class="caption" style="color:#991B1B;font-weight:700">100% Penuh</span>
          </div>
          <div class="bar bad" style="margin:8px 0 6px"><i style="width:100%"></i></div>
          <div class="caption" style="color:#7F1D1D">
            Kuota magang telah terisi penuh (${mx} peserta) mulai tanggal <b>${fmtD(q.fullDay)}</b>. Mohon sesuaikan tanggal mulai atau selesai untuk memilih jadwal dengan kuota yang masih tersedia.
          </div>
        </div>`;
    }
  };

  $('#fMulai').onchange = live;
  $('#fSelesai').onchange = live;
  live();

  const handleFile = (f) => {
    const er = $('#fileErr');
    const dropZone = $('#dropZone');
    const dropContent = $('#dropContent');
    er.style.display = 'none';
    uploadedFile = null;

    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      er.textContent = 'Berkas surat harus dalam format PDF resmi (.pdf)';
      er.style.display = 'block';
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      er.textContent = 'Ukuran file melebihi batas maksimal (5 MB)';
      er.style.display = 'block';
      return;
    }

    uploadedFile = f;
    dropZone.classList.add('has-file');
    const sizeKB = Math.round(f.size / 1024);
    dropContent.innerHTML = `
      <div class="row" style="justify-content:center;gap:12px;align-items:center">
        <i class="fi-rr-document-signed" style="font-size:32px;color:#10B981"></i>
        <div style="text-align:left">
          <b style="color:#0F172A;font-size:14px">${esc(f.name)}</b>
          <div class="caption" style="color:#10B981;font-weight:600"><i class="fi-rr-check-circle"></i> Berkas PDF Valid (${sizeKB} KB)</div>
        </div>
        <button type="button" class="btn btn-sm btn-outline" id="btnReplaceFile" style="margin-left:14px;padding:4px 10px">
          Ganti File
        </button>
      </div>`;

    $('#btnReplaceFile').onclick = (ev) => {
      ev.stopPropagation();
      $('#fFile').click();
    };
  };

  const dropZone = $('#dropZone');
  const fileInput = $('#fFile');
  dropZone.onclick = () => fileInput.click();
  dropZone.ondragover = e => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary)'; dropZone.style.background = '#F0F7FF'; };
  dropZone.ondragleave = () => { dropZone.style.borderColor = ''; dropZone.style.background = ''; };
  dropZone.ondrop = e => {
    e.preventDefault();
    dropZone.style.borderColor = ''; dropZone.style.background = '';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  fileInput.onchange = e => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  $('#mCancel').onclick = closeModal;

  $('#mSave').onclick = () => {
    const chk = (id, ok) => {
      const el = $('#' + id);
      if (!el) return ok;
      const field = el.closest('.field');
      if (field) field.classList.toggle('has-err', !ok);
      return ok;
    };

    const namaOk = !!$('#fNama').value.trim();
    const instOk = !!$('#fInst').value.trim();
    const jurOk = !!$('#fJur').value.trim();
    const konOk = /^\S+@\S+\.\S+$/.test($('#fKon').value.trim());
    const hpOk = $('#fHp').value.trim().length >= 8;
    const dateOk = $('#fSelesai').value > $('#fMulai').value;
    const capOk = $('#fCap').checked;

    chk('fNama', namaOk);
    chk('fInst', instOk);
    chk('fJur', jurOk);
    chk('fKon', konOk);
    chk('fHp', hpOk);
    chk('fSelesai', dateOk);

    $('#capErr').style.display = capOk ? 'none' : 'block';

    if (!uploadedFile) {
      $('#fileErr').textContent = 'Surat permohonan resmi dalam format PDF wajib diunggah';
      $('#fileErr').style.display = 'block';
    } else {
      $('#fileErr').style.display = 'none';
    }

    if (!namaOk || !instOk || !jurOk || !konOk || !hpOk || !dateOk || !capOk || !uploadedFile) {
      toast('Lengkapi seluruh field wajib bertanda bintang (*)', 'warning');
      return;
    }

    const p = {
      id: Date.now(),
      nama: $('#fNama').value.trim(),
      instansi: $('#fInst').value.trim(),
      jurusan: $('#fJur').value.trim(),
      kontak: $('#fKon').value.trim(),
      hp: $('#fHp').value.trim(),
      minatDivisi: $('#fDivMinat').value,
      mulai: $('#fMulai').value,
      selesai: $('#fSelesai').value,
      porto: $('#fPorto').value.trim(),
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      status: 'Menunggu',
      divisi: '',
      pembimbing: '',
      nomor: ''
    };

    PKL.unshift(p);

    const q = checkQuota(p.mulai, p.selesai, p.id);
    if (!q.available && S.settings.autoReject) {
      p.status = 'Ditolak';
      p.nomor = nextNo('PKL-TLK');
      toast('Kuota penuh — surat penolakan otomatis dikirimkan ke email pemohon', 'warn');
    } else {
      toast(`Pengajuan PKL berhasil dikirim! Tanda terima dan tautan status dikirim ke ${p.kontak}.`, 'success');
    }

    audit('Ajukan', 'PKL (portal publik)', `${p.nama} (${p.instansi})`);
    closeModal();
    buildNav();
    if (currentRoute() === 'pengajuan') render();
    else paintAll();
  };
}

/* ===== Kalender Kuota ===== */
const calState = { y: TODAY.getFullYear(), m: TODAY.getMonth(), sel: null, view: 'month' };
reg('kalender', 'Kalender Kuota', ['Manajemen PKL', 'Kalender Kuota'], () => {
  const first = new Date(calState.y, calState.m, 1), dim = new Date(calState.y, calState.m + 1, 0).getDate(), mx = S.settings.quotaMax;
  
  // Tabs for view switcher
  const viewSwitcher = `<div class="tabs" style="margin-bottom:16px">
    <button class="${calState.view === 'month' ? 'on' : ''}" data-v="month"><i class=fi-rr-calendar></i> Per Bulan</button>
    <button class="${calState.view === 'day' ? 'on' : ''}" data-v="day"><i class=fi-rr-list></i> Per Tanggal</button>
  </div>`;

  if (calState.view === 'month') {
    const cells = []; for (let i = 0; i < first.getDay(); i++) cells.push('<div class="day empty"></div>');
    for (let d = 1; d <= dim; d++) {
      const ds = `${calState.y}-${pad(calState.m + 1)}-${pad(d)}`, o = occupancy(ds), cl = o >= mx ? 'r' : o >= mx - 1 ? 'y' : 'g';
      cells.push(`<div class="day ${cl} ${calState.sel === ds ? 'sel' : ''}" data-d="${ds}" title="${o}/${mx} terisi"><b>${d}</b><small>${o}/${mx}</small></div>`);
    }
    return `<div class="grid g-main">
      <div class="card">
        <div class="card-h">
          ${viewSwitcher}
          <div class="row" style="margin-top:-8px">
            <button class="btn btn-sm" id="cPrev"><i class=fi-rr-angle-left></i></button>
            <h3 style="min-width:150px;text-align:center">${BULAN[calState.m]} ${calState.y}</h3>
            <button class="btn btn-sm" id="cNext"><i class=fi-rr-angle-right></i></button>
          </div>
          <div class="row" style="margin-top:-8px">
            <select class="input" id="cMonth" style="width:130px" aria-label="Bulan">${BULAN.map((b, i) => `<option value="${i}" ${i === calState.m ? 'selected' : ''}>${b}</option>`).join('')}</select>
            <select class="input" id="cYear" style="width:90px" aria-label="Tahun">${[-1, 0, 1, 2].map(o => `<option ${TODAY.getFullYear() + o === calState.y ? 'selected' : ''}>${TODAY.getFullYear() + o}</option>`).join('')}</select>
          </div>
        </div>
        <div class="card-b">
          <div class="cal">${['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => `<div class="dh">${d}</div>`).join('')}${cells.join('')}</div>
          <div class="legend" style="margin-top:14px"><span><i style="background:#16A34A"></i>Tersedia</span><span><i style="background:#D97706"></i>Hampir penuh</span><span><i style="background:#DC2626"></i>Penuh</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${calState.sel ? fmtD(calState.sel) : 'Pilih tanggal'}</h3></div>
        <div class="card-b" id="calDetail">
          ${calState.sel ? (() => { const l = PKL.filter(p => ['Aktif', 'Diterima'].includes(p.status) && p.mulai <= calState.sel && p.selesai >= calState.sel); return `<div class="num" style="font-size:24px;font-weight:600">${l.length}/${mx}</div><div class="bar ${l.length >= mx ? 'bad' : 'ok'}" style="margin:8px 0 12px"><i style="width:${l.length / mx * 100}%"></i></div>${l.map(p => `<div class="row" style="padding:4px 0">${av(p.nama, 1)}${esc(p.nama)}<span class="spacer"></span><span class="caption">${esc(p.divisi)}</span></div>`).join('') || '<span class="muted">Tidak ada peserta</span>'}`; })() : '<span class="muted">Klik hari pada kalender untuk melihat peserta.</span>'}
        </div>
      </div>
    </div>`;
  } else {
    // Day view (Per Tanggal)
    if (!calState.sel) calState.sel = `${calState.y}-${pad(calState.m + 1)}-${pad(TODAY.getDate())}`;
    
    // Generate horizontal date picker
    const dates = [];
    const selD = new Date(calState.sel);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selD);
      d.setDate(d.getDate() + i);
      const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const isSel = ds === calState.sel;
      const o = occupancy(ds);
      const cl = o >= mx ? 'danger' : o >= mx - 1 ? 'warning' : 'neutral';
      dates.push(`<button class="btn ${isSel ? 'btn-primary' : ''}" data-d="${ds}" style="flex-direction:column;padding:8px 16px">
        <span style="font-size:11px;opacity:0.8">${['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()]}</span>
        <strong style="font-size:18px">${d.getDate()}</strong>
        <span class="badge ${cl}" style="margin-top:4px">${o}/${mx}</span>
      </button>`);
    }

    const l = PKL.filter(p => ['Aktif', 'Diterima'].includes(p.status) && p.mulai <= calState.sel && p.selesai >= calState.sel);
    return `<div class="card">
      <div class="card-h" style="flex-direction:column;align-items:flex-start">
        ${viewSwitcher}
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;width:100%;align-items:center">
          <button class="btn btn-sm" id="cPrevDay"><i class=fi-rr-angle-left></i></button>
          ${dates.join('')}
          <button class="btn btn-sm" id="cNextDay"><i class=fi-rr-angle-right></i></button>
          <input type="date" class="input" id="cDateJump" value="${calState.sel}" style="margin-left:auto">
        </div>
      </div>
      <div class="card-b stack">
        <h3>Peserta PKL pada ${fmtD(calState.sel)}</h3>
        <div class="bar ${l.length >= mx ? 'bad' : 'ok'}"><i style="width:${Math.min(100, l.length / mx * 100)}%"></i></div>
        <p class="caption">${l.length} dari ${mx} kuota terisi</p>
        <div class="stack" style="margin-top:16px">
          ${l.length === 0 ? '<div class="empty-state">Kosong</div>' : l.map(p => `<div class="card card-b row" style="align-items:center">
            ${av(p.nama, 1)}
            <div style="flex:1"><b>${esc(p.nama)}</b><div class="caption">${esc(p.instansi)}</div></div>
            <div style="text-align:right"><b>${esc(p.divisi)}</b><div class="caption">Pembimbing: ${esc(p.pembimbing || '-')}</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }
}, () => {
  const mv = n => { calState.m += n; if (calState.m < 0) { calState.m = 11; calState.y--; } if (calState.m > 11) { calState.m = 0; calState.y++; } render(); };
  
  if ($('#cPrev')) $('#cPrev').onclick = () => mv(-1); 
  if ($('#cNext')) $('#cNext').onclick = () => mv(1);
  if ($('#cMonth')) $('#cMonth').onchange = e => { calState.m = +e.target.value; render(); }; 
  if ($('#cYear')) $('#cYear').onchange = e => { calState.y = +e.target.value; render(); };
  
  if ($('#cPrevDay')) $('#cPrevDay').onclick = () => { const d = new Date(calState.sel); d.setDate(d.getDate() - 1); calState.sel = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; render(); };
  if ($('#cNextDay')) $('#cNextDay').onclick = () => { const d = new Date(calState.sel); d.setDate(d.getDate() + 1); calState.sel = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; render(); };
  if ($('#cDateJump')) $('#cDateJump').onchange = e => { calState.sel = e.target.value; render(); };

  $$('[data-d]').forEach(d => d.onclick = () => { calState.sel = d.dataset.d; render(); });
  $$('[data-v]').forEach(b => b.onclick = () => { calState.view = b.dataset.v; render(); });
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
let evState = { school: '', studentId: null };

reg('evaluasi', 'Evaluasi PKL', ['Manajemen PKL', 'Evaluasi'], () => {
  const eligible = PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status));
  const schools = [...new Set(eligible.map(p => p.instansi))].sort();
  if (!evState.school || (!schools.includes(evState.school) && evState.school !== 'ALL')) {
    evState.school = schools[0] || 'ALL';
  }
  const filteredStudents = evState.school === 'ALL'
    ? eligible
    : eligible.filter(p => p.instansi === evState.school);
  if (!evState.studentId || !filteredStudents.some(p => p.id == evState.studentId)) {
    evState.studentId = filteredStudents[0]?.id || eligible[0]?.id || null;
  }

  return `
  <div class="stack" style="gap:16px">
    <!-- Card 1: Seleksi Berjenjang Sekolah & Peserta -->
    <div class="card" style="border:1px solid var(--border);box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <div class="card-h" style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#fafbfc">
        <div class="row" style="gap:8px;align-items:center">
          <i class="fi-rr-graduation-cap" style="color:var(--primary);font-size:18px"></i>
          <h3 style="margin:0;font-size:15px;font-weight:600">Pilih Sekolah & Peserta PKL</h3>
        </div>
        <span class="caption" style="color:#64748b">Filter peserta berdasarkan instansi pendidikan</span>
      </div>
      <div class="card-b" style="padding:18px 20px">
        <div class="row" style="gap:20px;align-items:flex-start;flex-wrap:wrap">
          <!-- 1. Dropdown Sekolah -->
          <div class="field" style="flex:1;min-width:280px;margin-bottom:0">
            <label class="lbl" for="evSchool" style="font-weight:600;display:flex;align-items:center;gap:6px;color:#1e293b;margin-bottom:6px">
              <i class="fi-rr-school" style="color:var(--primary)"></i> 1. Asal Sekolah / Instansi
            </label>
            <select class="input" id="evSchool" style="height:42px;font-weight:500">
              ${schools.map(s => {
                const count = eligible.filter(p => p.instansi === s).length;
                return `<option value="${esc(s)}" ${evState.school === s ? 'selected' : ''}>${esc(s)} (${count} Peserta)</option>`;
              }).join('')}
              <option value="ALL" ${evState.school === 'ALL' ? 'selected' : ''}>— Tampilkan Semua Sekolah (${eligible.length} Peserta) —</option>
            </select>
            <div class="caption" style="margin-top:4px;color:#64748b">Pilih sekolah untuk menyaring peserta PKL terkait</div>
          </div>

          <!-- 2. Dropdown Peserta -->
          <div class="field" style="flex:1;min-width:280px;margin-bottom:0">
            <label class="lbl" for="evPeserta" style="font-weight:600;display:flex;align-items:center;gap:6px;color:#1e293b;margin-bottom:6px">
              <i class="fi-rr-user" style="color:var(--primary)"></i> 2. Nama Peserta (Siswa / Mahasiswa)
            </label>
            <select class="input" id="evPeserta" style="height:42px;font-weight:500">
              ${filteredStudents.map(p => {
                const hasScore = Boolean(p.score || EVALS[p.id]);
                return `<option value="${p.id}" ${evState.studentId == p.id ? 'selected' : ''}>${esc(p.nama)} (${esc(p.jurusan || 'Siswa')}) ${hasScore ? '✓' : '•'}</option>`;
              }).join('')}
            </select>
            <div class="caption" style="margin-top:4px;color:#64748b" id="evCountCaption">
              Tersedia ${filteredStudents.length} peserta dari ${evState.school === 'ALL' ? 'seluruh instansi' : esc(evState.school)}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 2: Profil Singkat Siswa Terpilih -->
    <div id="evStudentProfile"></div>

    <!-- Grid 2 Kolom: Form Penilaian & Nilai Akhir -->
    <div class="grid g-main">
      <!-- Kolom Kiri: Form Kriteria Evaluasi -->
      <div class="card">
        <div class="card-h" style="display:flex;justify-content:space-between;align-items:center">
          <div class="row" style="gap:8px;align-items:center">
            <i class="fi-rr-edit" style="color:var(--primary);font-size:16px"></i>
            <h3 style="margin:0">Form Penilaian Pembimbing</h3>
          </div>
          <span class="caption" style="color:#64748b">Skala: 0 - 100</span>
        </div>
        <div class="card-b">
          <div id="evCrit" class="stack" style="gap:14px"></div>

          <div class="field" style="margin-top:16px">
            <label class="lbl" for="evNote" style="font-weight:600;display:flex;align-items:center;gap:6px">
              <i class="fi-rr-comment-alt"></i> Catatan & Rekomendasi Pembimbing
            </label>
            <textarea class="input" id="evNote" rows="3" placeholder="Tuliskan evaluasi kualitatif mengenai kinerja, kedisiplinan, dan potensi peserta..."></textarea>
          </div>

          <div class="row" style="gap:10px;margin-top:20px;justify-content:space-between;align-items:center">
            <button class="btn btn-primary" id="evSave" style="padding:10px 22px;font-weight:600">
              <i class="fi-rr-disk"></i> Simpan Hasil Evaluasi
            </button>
            <button class="btn" id="evReset" type="button" title="Kembalikan nilai ke default">
              <i class="fi-rr-refresh"></i> Reset Nilai
            </button>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Nilai Akhir & Predikat -->
      <div class="card">
        <div class="card-h">
          <div class="row" style="gap:8px;align-items:center">
            <i class="fi-rr-trophy" style="color:#f59e0b;font-size:16px"></i>
            <h3 style="margin:0">Nilai Akhir & Predikat</h3>
          </div>
        </div>
        <div class="card-b" style="text-align:center">
          <div class="num" id="evTotal" style="font-size:56px;font-weight:700;color:var(--primary);line-height:1;margin-top:8px">0</div>
          <div id="evGrade" style="margin:12px 0"></div>

          <!-- Breakdown rincian bobot -->
          <div style="text-align:left;border:1px solid var(--border);border-radius:8px;padding:12px;background:#f8fafc;margin-top:16px">
            <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Rincian Bobot Kompetensi:</div>
            <div id="evBreakdown" class="stack" style="gap:6px"></div>
          </div>

          <div class="caption" style="margin-top:12px;line-height:1.5">
            Bobot: ${CRITERIA.map(c => `${c.k} ${c.w}%`).join(' · ')}<br>
            Disinkronkan otomatis ke transkrip nilai sertifikat.
          </div>

          <button class="btn btn-outline" id="evToCert" style="width:100%;margin-top:16px;justify-content:center">
            <i class="fi-rr-diploma"></i> Lihat di Generator Sertifikat
          </button>
        </div>
      </div>
    </div>

    <!-- Card 3: Rekapitulasi Tabel Evaluasi Peserta -->
    <div class="card" style="margin-top:8px">
      <div class="card-h" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div class="row" style="gap:8px;align-items:center">
          <i class="fi-rr-list-check" style="color:var(--primary);font-size:16px"></i>
          <h3 style="margin:0">Rekap Nilai Peserta PKL Berdasarkan Sekolah</h3>
        </div>
        <span class="caption" id="evTableSummary"></span>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th>Nama Peserta</th>
              <th>Asal Sekolah / Instansi</th>
              <th>Divisi & Pembimbing</th>
              <th>Status PKL</th>
              <th style="text-align:center">Nilai Akhir</th>
              <th style="text-align:center">Predikat</th>
              <th style="text-align:right">Aksi</th>
            </tr>
          </thead>
          <tbody id="evTableBody"></tbody>
        </table>
      </div>
    </div>
  </div>`;
}, () => {
  const eligible = () => PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status));

  const renderProfile = (p) => {
    if (!p) {
      $('#evStudentProfile').innerHTML = '<div class="banner warn"><i class="fi-rr-triangle-warning"></i> <span>Silakan pilih sekolah dan peserta PKL untuk melakukan evaluasi.</span></div>';
      return;
    }
    const hasScore = Boolean(p.score || EVALS[p.id]);
    const scoreVal = p.score || (EVALS[p.id] ? Math.round(CRITERIA.reduce((s, c) => s + (EVALS[p.id][c.k] ?? 75) * c.w / 100, 0)) : null);
    const pred = scoreVal ? (scoreVal >= 85 ? 'Sangat Baik' : scoreVal >= 75 ? 'Baik' : scoreVal >= 60 ? 'Cukup' : 'Kurang') : '';

    $('#evStudentProfile').innerHTML = `
      <div class="card" style="border-left:4px solid var(--primary);background:#fff">
        <div class="card-b" style="padding:14px 20px">
          <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
            <div class="row" style="align-items:center;gap:14px">
              <div class="user-avatar" style="width:44px;height:44px;font-size:16px;background:linear-gradient(135deg, #10b981, #059669)">
                ${esc(p.nama.charAt(0))}
              </div>
              <div>
                <div class="row" style="align-items:center;gap:8px">
                  <h4 style="margin:0;font-size:15px;font-weight:700;color:#0f172a">${esc(p.nama)}</h4>
                  <span class="lz lz-${p.status === 'Aktif' ? 'success' : 'neutral'}">${esc(p.status)}</span>
                  ${hasScore ? `<span class="lz lz-success"><i class="fi-rr-check-circle"></i> Sudah Dievaluasi (${scoreVal} - ${pred})</span>` : `<span class="lz lz-warning"><i class="fi-rr-clock"></i> Belum Dievaluasi</span>`}
                </div>
                <div class="caption" style="margin-top:3px;color:#475569">
                  <b>${esc(p.instansi)}</b> · ${esc(p.jurusan || 'Siswa')} · Divisi: <b>${esc(p.divisi || 'Belum diatur')}</b> · Pembimbing: <b>${esc(p.pembimbing || '-')}</b>
                </div>
              </div>
            </div>
            <div style="text-align:right">
              <div class="caption" style="font-size:11px;color:#64748b">Periode PKL</div>
              <div style="font-weight:600;font-size:13px;color:#1e293b">${fmtD(p.mulai)} s.d. ${fmtD(p.selesai)}</div>
            </div>
          </div>
        </div>
      </div>`;
  };

  const calc = () => {
    const total = CRITERIA.reduce((s, c) => s + +($('#ev-' + sl(c.k))?.value || 75) * c.w / 100, 0);
    const rounded = Math.round(total);
    $('#evTotal').textContent = rounded;
    const pred = rounded >= 85 ? 'Sangat Baik (A)' : rounded >= 75 ? 'Baik (B)' : rounded >= 60 ? 'Cukup (C)' : 'Kurang (D)';
    const badgeCls = rounded >= 75 ? 'success' : rounded >= 60 ? 'warning' : 'danger';
    $('#evGrade').innerHTML = lz(pred, badgeCls);

    $('#evBreakdown').innerHTML = CRITERIA.map(c => {
      const v = +($('#ev-' + sl(c.k))?.value || 75);
      const pts = (v * c.w / 100).toFixed(1);
      return `<div class="row" style="justify-content:space-between;font-size:12px;color:#334155">
        <span>${esc(c.k)} <span style="color:#64748b">(${c.w}% × ${v})</span></span>
        <b>+${pts} pt</b>
      </div>`;
    }).join('');
    return total;
  };

  const loadStudent = () => {
    const id = $('#evPeserta')?.value;
    evState.studentId = id;
    const p = PKL.find(x => x.id == id);
    renderProfile(p);
    if (!p) return;

    const ev = EVALS[id] || {};
    $('#evNote').value = ev._note || p.evalNote || '';
    $('#evCrit').innerHTML = CRITERIA.map(c => {
      const val = ev[c.k] ?? 75;
      return `<div class="field" style="margin-bottom:10px">
        <div class="row" style="justify-content:space-between;margin-bottom:4px;align-items:center">
          <label class="lbl" for="ev-${sl(c.k)}" style="margin-bottom:0;font-weight:600">
            ${esc(c.k)} <span class="caption" style="color:#64748b">(Bobot: ${c.w}%)</span>
          </label>
          <span class="badge" style="background:#f1f5f9;font-weight:700;font-size:13px;color:var(--primary);min-width:44px;text-align:center">
            <span id="ev-v-${sl(c.k)}">${val}</span> / 100
          </span>
        </div>
        <input type="range" class="range-slider" id="ev-${sl(c.k)}" min="0" max="100" value="${val}" style="width:100%;accent-color:var(--primary)">
      </div>`;
    }).join('');

    CRITERIA.forEach(c => {
      const el = $('#ev-' + sl(c.k));
      if (el) el.oninput = e => {
        $('#ev-v-' + sl(c.k)).textContent = e.target.value;
        calc();
      };
    });
    calc();
  };

  const populateStudents = () => {
    const school = $('#evSchool').value;
    evState.school = school;
    const list = school === 'ALL' ? eligible() : eligible().filter(p => p.instansi === school);

    $('#evCountCaption').textContent = `Tersedia ${list.length} peserta dari ${school === 'ALL' ? 'seluruh instansi' : school}`;

    if (list.length === 0) {
      $('#evPeserta').innerHTML = '<option value="">Tidak ada peserta</option>';
      renderProfile(null);
      return;
    }

    $('#evPeserta').innerHTML = list.map(p => {
      const hasScore = Boolean(p.score || EVALS[p.id]);
      return `<option value="${p.id}" ${evState.studentId == p.id ? 'selected' : ''}>${esc(p.nama)} (${esc(p.jurusan || 'Siswa')}) ${hasScore ? '✓' : '•'}</option>`;
    }).join('');

    if (!list.some(p => p.id == evState.studentId)) {
      evState.studentId = list[0].id;
      $('#evPeserta').value = list[0].id;
    }
    loadStudent();
  };

  const renderTable = () => {
    const list = eligible();
    const evaluatedCount = list.filter(p => p.score || EVALS[p.id]).length;
    const avgScore = evaluatedCount ? Math.round(list.filter(p => p.score).reduce((a, b) => a + (b.score || 0), 0) / evaluatedCount) : 0;

    $('#evTableSummary').textContent = `${evaluatedCount} dari ${list.length} peserta telah dievaluasi · Rata-rata nilai: ${avgScore || '-'}`;

    $('#evTableBody').innerHTML = list.map((p, idx) => {
      const sc = p.score || (EVALS[p.id] ? Math.round(CRITERIA.reduce((s, c) => s + (EVALS[p.id][c.k] ?? 75) * c.w / 100, 0)) : null);
      const pred = sc ? (sc >= 85 ? 'Sangat Baik (A)' : sc >= 75 ? 'Baik (B)' : sc >= 60 ? 'Cukup (C)' : 'Kurang (D)') : '-';
      const badgeCls = sc ? (sc >= 75 ? 'success' : sc >= 60 ? 'warning' : 'danger') : 'neutral';

      return `<tr>
        <td style="color:#64748b">${idx + 1}</td>
        <td>
          <div style="font-weight:600;color:#0f172a">${esc(p.nama)}</div>
          <div class="caption">${esc(p.jurusan || '-')}</div>
        </td>
        <td>
          <span class="badge" style="background:#eef2ff;color:#3730a3;font-size:11px">
            <i class="fi-rr-school" style="margin-right:3px"></i> ${esc(p.instansi)}
          </span>
        </td>
        <td>
          <div>${esc(p.divisi || 'Umum')}</div>
          <div class="caption">${esc(p.pembimbing || 'Belum ditugaskan')}</div>
        </td>
        <td><span class="lz lz-${p.status === 'Aktif' ? 'success' : 'neutral'}">${esc(p.status)}</span></td>
        <td style="text-align:center;font-weight:700;font-size:14px;color:var(--primary)">${sc ?? '<span style="color:#94a3b8">-</span>'}</td>
        <td style="text-align:center">${sc ? lz(pred, badgeCls) : '<span class="lz lz-neutral">Belum Dinilai</span>'}</td>
        <td style="text-align:right">
          <button class="btn btn-sm btn-outline" data-load-ev="${p.id}" style="padding:4px 10px">
            <i class="fi-rr-edit"></i> Nilai / Edit
          </button>
        </td>
      </tr>`;
    }).join('');

    $$('[data-load-ev]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.loadEv;
        const p = PKL.find(x => x.id == id);
        if (!p) return;
        evState.school = p.instansi;
        $('#evSchool').value = p.instansi;
        populateStudents();
        $('#evPeserta').value = p.id;
        loadStudent();
        $('#evSchool').scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
    });
  };

  $('#evSchool').onchange = populateStudents;
  $('#evPeserta').onchange = () => { evState.studentId = $('#evPeserta').value; loadStudent(); };

  $('#evSave').onclick = () => {
    const id = $('#evPeserta').value;
    if (!id) return toast('Pilih peserta terlebih dahulu', 'warning');
    const p = PKL.find(x => x.id == id);
    if (!p) return;

    const scores = Object.fromEntries(CRITERIA.map(c => [c.k, +$('#ev-' + sl(c.k)).value]));
    scores._note = $('#evNote').value;
    EVALS[id] = scores;

    const finalScore = Math.round(calc());
    p.score = finalScore;
    p.evalNote = $('#evNote').value;

    audit('Simpan', 'Evaluasi PKL', `${p.nama} (${p.instansi}) — Skor: ${finalScore}`);
    toast(`Evaluasi untuk ${p.nama} tersimpan. Nilai: ${finalScore}.`, 'success');
    renderProfile(p);
    renderTable();
  };

  $('#evReset').onclick = () => {
    CRITERIA.forEach(c => {
      const el = $('#ev-' + sl(c.k));
      if (el) {
        el.value = 75;
        $('#ev-v-' + sl(c.k)).textContent = 75;
      }
    });
    calc();
    toast('Nilai dikembalikan ke default (75)', 'info');
  };

  $('#evToCert').onclick = () => {
    location.hash = '#sertifikat';
  };

  populateStudents();
  renderTable();
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
    <div class="field"><label class="lbl" for="cPes">Peserta</label><select class="input" id="cPes">${PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status)).map(p => `<option value="${p.id}">${esc(p.nama)} — ${esc(p.instansi)}</option>`).join('')}</select></div>
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
const GROUP_OF = { presensi: 'absensi', dailylog: 'absensi', rekap: 'absensi', lowongan: 'rekrutmen', pipeline: 'rekrutmen', pengajuan: 'pkl', kalender: 'pkl', peserta: 'pkl', evaluasi: 'pkl', sertifikat: 'pkl' };
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
  Object.keys(TBL).forEach(k => { if (!['rekap', 'emp', 'jobs', 'pkl', 'act', 'pay', 'audit'].includes(k)) delete TBL[k]; });
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
  on('#btnAddJob', () => openJob());
  on('#btnCareer', careerPage);
  on('#btnNewPkl', publicPklForm);
  on('#btnPublicForm', publicPklForm);
}
// Wire rendering to be done after view is injected (r.after is the 4th arg registered as render's callback)
// reg() stores arguments as (render, actions). The "after" hook is attached below for clarity.
function reg2() {}
// Re-map: reg(id,title,crumb,render,afterOrActions,actions) — normalise
Object.keys(R).forEach(k => { const r = R[k]; if (typeof r.actions === 'function') { /* second fn arg is "after" in our usage */ r.after = r.actions; r.actions = null; } });
// Pages that pass a 3rd function (actions) are re-registered below
const ACTIONS = {
  karyawan: () => `<button class="btn btn-primary" id="btnAddEmp"><i class="fi-rr-plus"></i> Tambah Karyawan</button>`,
  lowongan: () => `<button class="btn btn-outline" id="btnCareer"><i class="fi-rr-globe"></i> Pratinjau Career Page</button><button class="btn btn-primary" id="btnAddJob"><i class="fi-rr-plus"></i> Tambah Lowongan</button>`,
  pengajuan: () => `<button class="btn btn-primary" id="btnNewPkl"><i class="fi-rr-plus"></i> Form Pengajuan PKL</button><button class="btn btn-outline" id="btnPublicForm"><i class="fi-rr-globe"></i> Portal Publik</button>`
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
_on('#btnNotif', 'onclick', () => { const b = badges(); openDrawer('Notifikasi', `<div class="stack">${b.pengajuan ? `<div class="banner info"><i class=fi-rr-graduation-cap></i> ${b.pengajuan} pengajuan PKL baru</div>` : ''}<div class="banner ok"><i class=fi-rr-check-circle></i> Payroll September telah dibayar</div></div>`); });
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
