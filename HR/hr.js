/* ==========================================================================
   ASTA HR — Modul Manajemen SDM & Talenta
   Fokus: Karyawan Tetap, Freelance (Per Proyek), PKL, Rekrutmen, Absensi & Evaluasi
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
  Rejected: 'danger', Ditolak: 'danger', Full: 'danger', 'Kuota Penuh': 'danger', 'Tanpa Keterangan': 'danger', Closed: 'neutral', Anomali: 'danger',
  Disetujui: 'success', Diajukan: 'warning', Revisi: 'info', 'Belum Diajukan': 'neutral'
};
const lz = (t, c) => `<span class="lz lz-${c || LZ[t] || 'neutral'}">${esc(t)}</span>`;
const nowTime = () => { const n = new Date(); return `${pad(n.getHours())}:${pad(n.getMinutes())}`; };

/* ---------------- State & seed data ---------------- */
const S = {
  role: 'hr',
  settings: {
    nightThreshold: '22:00', wfhRadius: 200, quotaMax: 5, evalThreshold: 80, autoReject: true, claimMode: 'approval', compensation: 'carryover',
    incentiveRate: 75000, incentiveMax: 8, officeIp: '203.0.113.42', bssid: 'A4:5E:60:C1:9B:2F', ssid: 'Asta', pkgRule: 'global',
    officeLat: -6.2001, officeLng: 106.8167, signer: 'Rina Anggraini, HR Manager', letterNo: 23, certNo: 14
  },
  attendance: null, // today's record
  consent: false
};

// Pengguna demo per peran (simulasi hak akses)
const ACTOR = { hr: 'Rina Anggraini', manager: 'Bagas Prakoso', pembimbing: 'Bagas Prakoso', employee: 'Dewi Lestari', pkl: 'Fikri Pratama', finance: 'Finance' };
const USER_LABEL = { hr: ['Rina Anggraini', 'HR Admin'], manager: ['Bagas Prakoso', 'Manajer / Team Lead'], pembimbing: ['Bagas Prakoso', 'Pembimbing PKL'], employee: ['Dewi Lestari', 'Karyawan Tetap'], pkl: ['Fikri Pratama', 'Peserta PKL'], finance: ['Finance Team', 'Super Admin / Finance'] };
const ME_PKL_ID = 9, ME_PEMB = 'Bagas Prakoso';

const EMP = [
  { id: 1, nama: 'Rina Anggraini', email: 'rina@astacode.id', tipe: 'Tetap', tim: 'People Ops', jabatan: 'HR Manager', atasan: 'CEO', level: 'Head of People', statusKerja: 'PKWTT (Tetap)', cutiSisa: 10, workPolicy: 'Hybrid (Onsite & WFH)', status: 'Aktif', masuk: '2021-02-01' },
  { id: 2, nama: 'Bagas Prakoso', email: 'bagas@astacode.id', tipe: 'Tetap', tim: 'Engineering', jabatan: 'Tech Lead', atasan: 'CTO', level: 'Lead / Principal', statusKerja: 'PKWTT (Tetap)', cutiSisa: 8, workPolicy: 'Hybrid (Onsite & WFH)', status: 'Aktif', masuk: '2020-06-15' },
  { id: 3, nama: 'Dewi Lestari', email: 'dewi@astacode.id', tipe: 'Tetap', tim: 'Engineering', jabatan: 'Frontend Developer', atasan: 'Bagas Prakoso', level: 'Senior Specialist', statusKerja: 'PKWTT (Tetap)', cutiSisa: 12, workPolicy: 'Hybrid (Onsite & WFH)', status: 'Aktif', masuk: '2022-03-07' },
  { id: 4, nama: 'Fajar Nugroho', email: 'fajar@astacode.id', tipe: 'Tetap', tim: 'Engineering', jabatan: 'Backend Developer', atasan: 'Bagas Prakoso', level: 'Senior Specialist', statusKerja: 'PKWTT (Tetap)', cutiSisa: 9, workPolicy: 'Hybrid (Onsite & WFH)', status: 'Aktif', masuk: '2022-08-22' },
  { id: 5, nama: 'Citra Maharani', email: 'citra@astacode.id', tipe: 'Tetap', tim: 'Design', jabatan: 'UI/UX Designer', atasan: 'Bagas Prakoso', level: 'Mid-Level Specialist', statusKerja: 'PKWTT (Tetap)', cutiSisa: 11, workPolicy: 'Hybrid (Onsite & WFH)', status: 'Aktif', masuk: '2023-01-09' },
  { id: 6, nama: 'Galih Pratama', email: 'galih@astacode.id', tipe: 'Tetap', tim: 'QA', jabatan: 'QA Engineer', atasan: 'Bagas Prakoso', level: 'Mid-Level Specialist', statusKerja: 'PKWT (Kontrak)', cutiSisa: 6, workPolicy: 'Full Onsite', status: 'Aktif', masuk: '2023-05-02' },
  {
    id: 7, nama: 'Hana Putri', email: 'hana@gmail.com', tipe: 'Freelance', tim: 'Engineering', jabatan: 'Mobile Developer', atasan: 'Bagas Prakoso', status: 'Aktif', masuk: '2024-02-01',
    projects: [
      { id: 'PRJ-MOB-01', nama: 'ASTA Mobile Banking App (Flutter)', fee: 8500000, deadline: '2026-10-30', status: 'In Progress', progres: 75, deliverables: 'Slicing UI & Integrasi REST API Payment' },
      { id: 'PRJ-MOB-02', nama: 'Push Notification Service & Deep Link', fee: 3500000, deadline: '2026-10-18', status: 'Selesai', progres: 100, deliverables: 'FCM Worker & Foreground Notification' }
    ]
  },
  {
    id: 8, nama: 'Indra Wijaya', email: 'indra@gmail.com', tipe: 'Freelance', tim: 'Design', jabatan: 'Illustrator & 3D Artist', atasan: 'Citra Maharani', status: 'Aktif', masuk: '2024-07-15',
    projects: [
      { id: 'PRJ-DSG-01', nama: 'Design System 3D Iconography & Asset Pack', fee: 6500000, deadline: '2026-10-28', status: 'In Progress', progres: 60, deliverables: '30 Asset 3D Render High-Res Figma' }
    ]
  },
  { id: 9, nama: 'Nadin', email: 'kevin@smkn1.sch.id', tipe: 'PKL', tim: 'Engineering', jabatan: 'Peserta PKL', atasan: 'Fajar Nugroho', status: 'Aktif', masuk: dOff(-30) },
  { id: 10, nama: 'Laila Zahra', email: 'laila@ui.ac.id', tipe: 'PKL', tim: 'Design', jabatan: 'Peserta PKL', atasan: 'Citra Maharani', status: 'Aktif', masuk: dOff(-45) }
];

const NIGHT = [
  { id: 1, nama: 'Dewi Lestari', tgl: dOff(-1), waktu: '22:45', alasan: 'Hotfix bug login SSO klien', jam: 2, tipe: 'Insentif', status: 'Approved' },
  { id: 2, nama: 'Fajar Nugroho', tgl: dOff(-2), waktu: '23:15', alasan: 'Penyelesaian sinkronisasi data SDM', jam: 1.5, tipe: 'Carryover', status: 'Approved' }
];

const LOGS = [
  { id: 1, tgl: dOff(-1), nama: 'Dewi Lestari', mode: 'Hadir WFH', ringkasan: 'Slicing halaman dashboard + integrasi chart', task: 'ASTA-212', commit: 'github.com/asta/web/pull/88', jam: 7.5 },
  { id: 2, tgl: dOff(-1), nama: 'Fajar Nugroho', mode: 'Hadir Onsite', ringkasan: 'Optimasi query laporan analitik SDM', task: 'ASTA-219', commit: 'github.com/asta/api/commit/a91f3', jam: 8 },
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
  { id: 1, nama: 'Nadin', instansi: 'SMKN 1 Jakarta', jurusan: 'RPL', mulai: dOff(-85), selesai: dOff(5), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '001/ASTA-HR/PKL/2026', kontak: 'kevin@smkn1.sch.id', mulaiLog: 24, score: 86 },
  { id: 2, nama: 'Laila Zahra', instansi: 'Universitas Indonesia', jurusan: 'Desain Komunikasi Visual', mulai: dOff(-85), selesai: dOff(5), status: 'Aktif', divisi: 'Design', pembimbing: 'Citra Maharani', nomor: '002/ASTA-HR/PKL/2026', kontak: 'laila@ui.ac.id', mulaiLog: 31 },
  { id: 3, nama: 'Mario Gunawan', instansi: 'SMK Telkom Bandung', jurusan: 'TKJ', mulai: dOff(-80), selesai: dOff(10), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '003/ASTA-HR/PKL/2026', kontak: 'mario@smktelkom.sch.id', mulaiLog: 8 },
  { id: 4, nama: 'Nadia Rahma', instansi: 'Politeknik Negeri Jakarta', jurusan: 'Teknik Informatika', mulai: dOff(-5), selesai: dOff(85), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Dewi Lestari', nomor: '004/ASTA-HR/PKL/2026', kontak: 'nadia@pnj.ac.id', mulaiLog: 4 },
  { id: 5, nama: 'Omar Hakim', instansi: 'SMKN 4 Bandung', jurusan: 'RPL', mulai: dOff(-3), selesai: dOff(87), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '005/ASTA-HR/PKL/2026', kontak: 'omar@smkn4.sch.id', mulaiLog: 2 },
  { id: 6, nama: 'Putra Mahendra', instansi: 'Universitas Gunadarma', jurusan: 'Sistem Informasi', mulai: dOff(20), selesai: dOff(110), status: 'Menunggu', divisi: '', pembimbing: '', nomor: '', kontak: 'putra@gunadarma.ac.id' },
  { id: 7, nama: 'Qonita Aulia', instansi: 'SMK Negeri 2 Depok', jurusan: 'Multimedia', mulai: dOff(10), selesai: dOff(70), status: 'Menunggu', divisi: '', pembimbing: '', nomor: '', kontak: 'qonita@smkn2.sch.id' },
  { id: 8, nama: 'Raka Aditya', instansi: 'Universitas Brawijaya', jurusan: 'Teknik Informatika', mulai: dOff(-200), selesai: dOff(-110), status: 'Selesai', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '098/ASTA-HR/PKL/2025', kontak: 'raka@ub.ac.id', score: 86 },
  { id: 9, nama: 'Fikri Pratama', instansi: 'SMKN 1 Jakarta', jurusan: 'RPL', mulai: dOff(-80), selesai: dOff(10), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Fajar Nugroho', nomor: '006/ASTA-HR/PKL/2026', kontak: 'fikri@smkn1.sch.id', mulaiLog: 15 },
  { id: 10, nama: 'Rizky Ramadhan', instansi: 'SMK Telkom Bandung', jurusan: 'TKJ', mulai: dOff(-75), selesai: dOff(15), status: 'Aktif', divisi: 'Engineering', pembimbing: 'Bagas Prakoso', nomor: '007/ASTA-HR/PKL/2026', kontak: 'rizky@smktelkom.sch.id', mulaiLog: 12 }
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

// Evaluasi PKL berbasis pengajuan peserta (PKL-17 s/d PKL-22)
// status: Belum Diajukan (tidak ada entri) → Diajukan → Disetujui | Revisi
const sj = (a, b, c, d, e) => ({ 'Code Quality': a, Teamwork: b, Punctuality: c, Communication: d, 'Problem Solving': e });
const EVALREQ = {
  1: { status: 'Disetujui', diajukan: dOff(-9), disetujui: dOff(-7), oleh: 'Fajar Nugroho', revisi: 0, self: sj(90, 88, 90, 85, 88), refleksi: 'Saya belajar alur kerja Vue/Node.js dan mulai terbiasa dengan code review harian.', catatan: 'Sangat proaktif dan cepat beradaptasi dengan stack Vue/Node.js.' },
  8: { status: 'Disetujui', diajukan: dOff(-112), disetujui: dOff(-110), oleh: 'Bagas Prakoso', revisi: 0, self: sj(88, 90, 85, 85, 90), refleksi: 'Seluruh modul selesai tepat waktu; saya ingin memperdalam pengujian otomatis.', catatan: 'Menyelesaikan seluruh modul tepat waktu dengan standar kode yang sangat rapi.' },
  2: { status: 'Diajukan', diajukan: dOff(-1), revisi: 0, self: sj(82, 90, 85, 88, 80), refleksi: 'Saya merancang komponen design system dan terlibat langsung dalam riset pengguna bersama tim.' },
  3: { status: 'Diajukan', diajukan: dOff(0), revisi: 0, self: sj(80, 85, 90, 82, 78), refleksi: 'Saya mengerjakan setup jaringan dan monitoring server serta belajar menulis dokumentasi teknis.' },
  10: { status: 'Revisi', diajukan: dOff(-3), revisi: 1, self: sj(95, 95, 95, 95, 95), refleksi: 'Semua tugas saya selesai dengan baik.', catatan: 'Nilai diri terlalu seragam dan refleksi terlalu singkat. Mohon tulis contoh pekerjaan konkret lalu sesuaikan nilainya.' }
};
const evStatusOf = id => EVALREQ[id]?.status || 'Belum Diajukan';
const progressOf = p => { const t = parse(p.selesai) - parse(p.mulai); return t > 0 ? Math.min(100, Math.max(0, Math.round((TODAY - parse(p.mulai)) / t * 100))) : 100; };
const weighted = sc => Math.round(CRITERIA.reduce((a, c) => a + (sc[c.k] ?? 75) * c.w / 100, 0));
const predOf = n => n >= 85 ? 'Sangat Baik (A)' : n >= 75 ? 'Baik (B)' : n >= 60 ? 'Cukup (C)' : 'Kurang (D)';
const predCls = n => n >= 75 ? 'success' : n >= 60 ? 'warning' : 'danger';
const evCanSubmit = p => !!p && p.status === 'Aktif' && progressOf(p) >= S.settings.evalThreshold && ['Belum Diajukan', 'Revisi'].includes(evStatusOf(p.id));
const canDecideEval = p => S.role === 'hr' || (S.role === 'pembimbing' && p.pembimbing === ME_PEMB);
const evPending = () => PKL.filter(p => EVALREQ[p.id]?.status === 'Diajukan' && canDecideEval(p)).length;

const AUDIT = [
  { t: dOff(-1) + ' 16:20', actor: 'Rina Anggraini', aksi: 'Approve', entitas: 'Klaim malam #2', detail: 'Carryover 1.5 jam — Dewi Lestari' },
  { t: dOff(-2) + ' 10:05', actor: 'Rina Anggraini', aksi: 'Terbitkan', entitas: 'Sertifikat PKL', detail: 'CERT/ASTA/2025/013 — Raka Aditya' },
  { t: dOff(-3) + ' 09:12', actor: 'Super Admin', aksi: 'Ubah', entitas: 'Pengaturan', detail: 'Radius WFH default 200 m' },
  { t: dOff(-5) + ' 14:41', actor: 'Rina Anggraini', aksi: 'Sinkronisasi', entitas: 'Rekap SDM', detail: 'Sinkronisasi kehadiran & kinerja bulanan selesai' }
];
const TEMPLATES = {
  accept: { nama: 'Surat Balasan Penerimaan PKL', body: 'Nomor: {{nomor_surat}}\n\nKepada Yth.\nPimpinan {{sekolah}}\n\nDengan hormat,\nMenindaklanjuti surat permohonan PKL, kami dengan senang hati menerima:\n\nNama      : {{nama_siswa}}\nInstansi  : {{sekolah}}\nPeriode   : {{tanggal_mulai}} s.d. {{tanggal_selesai}}\n\nDemikian surat ini kami sampaikan. Atas perhatiannya kami ucapkan terima kasih.' },
  reject: { nama: 'Surat Penolakan PKL (Kuota Penuh)', body: 'Nomor: {{nomor_surat}}\n\nKepada Yth.\nPimpinan {{sekolah}}\n\nDengan hormat,\nMohon maaf, permohonan PKL atas nama {{nama_siswa}} untuk periode {{tanggal_mulai}} s.d. {{tanggal_selesai}} belum dapat kami terima karena kuota peserta pada periode tersebut telah penuh.\n\nKami mempersilakan mengajukan kembali pada periode lain.' },
  spk: { nama: 'Surat Perjanjian Kerja Sama Proyek Freelance (SPK)', body: 'SURAT PERJANJIAN KERJA SAMA (SPK) PENUGASAN PROYEK\nNomor: SPK/ASTA/HR/{{nomor_surat}}\n\nPada hari ini, telah disepakati penugasan proyek antara Astacode Digital dan:\n\nNama Freelancer : {{nama_karyawan}}\nPeran / Bidang  : {{jabatan}}\nNama Proyek     : {{nama_proyek}}\nTarget Output   : {{deliverables}}\nJangka Waktu    : s.d. {{deadline}}\nNilai Kontrak   : {{nilai_kontrak}}\n\nKedua belah pihak sepakat mematuhi standar kerahasiaan (NDA) dan milestone penyerahan hasil kerja.' },
  sk_tetap: { nama: 'Surat Keputusan Pengangkatan Karyawan Tetap (SK)', body: 'SURAT KEPUTUSAN DIREKSI & PEOPLE OPS\nNomor: SK/ASTA/HR/{{nomor_surat}}\n\nMenetapkan:\nNama     : {{nama_karyawan}}\nJabatan  : {{jabatan}}\nDivisi   : {{departemen}}\nStatus   : Karyawan Tetap (PKWTT)\nTerhitung: {{tanggal_mulai}}\n\nDengan hak dan kewajiban sebagaimana tertuang dalam Peraturan Perusahaan.' },
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
// Halaman yang hanya untuk peran tertentu (tidak ikut wildcard '*')
const ROLE_ONLY = { evaluasi_saya: ['pkl'] };
const NAV = [
  { id: 'beranda', ico: '<i class=fi-rr-home></i>', label: 'Dashboard' },
  { id: 'absensi', ico: '<i class=fi-rr-check-circle></i>', label: 'Absensi', kids: [['presensi', 'Presensi Saya'], ['dailylog', 'Daily Log'], ['rekap', 'Rekap Tim']] },
  { id: 'karyawan', ico: '<i class=fi-rr-users></i>', label: 'Karyawan' },
  { id: 'rekrutmen', ico: '<i class=fi-rr-bullseye-arrow></i>', label: 'Rekrutmen', kids: [['lowongan', 'Lowongan'], ['pipeline', 'Pipeline Pelamar']] },
  { id: 'pkl', ico: '<i class=fi-rr-graduation-cap></i>', label: 'Manajemen PKL', kids: [['pengajuan', 'Pengajuan'], ['kalender', 'Kalender Kuota'], ['peserta', 'Peserta Aktif'], ['evaluasi', 'Evaluasi'], ['sertifikat', 'Sertifikat']] },
  { id: 'payroll', ico: '<i class=fi-rr-coins></i>', label: 'Payroll' },
  { id: 'dokumen', ico: '<i class=fi-rr-document></i>', label: 'Dokumen & Template' },
  { id: 'laporan', ico: '<i class=fi-rr-chart-histogram></i>', label: 'Laporan SDM' },
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
    const nc = notifCount(b);
    nd.textContent = nc;
    nd.style.display = nc ? '' : 'none';
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
        ${evTasks()}
      </div></div>
      <div class="card"><div class="card-h"><h3>Pengumuman</h3></div><div class="card-b stack">
        <div class="banner info" style="margin:0"><i class=fi-rr-megaphone></i> <span>Rekap absensi &amp; evaluasi SDM bulanan ditutup tanggal 25. Pastikan Daily Log terisi.</span></div>
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
reg('workload', 'Workload Malam', ['Absensi', 'Workload Malam'], () => `
  <div class="banner info"><i class=fi-rr-moon></i> <span>Revisi/bugfix setelah <b>${esc(S.settings.nightThreshold)}</b> dapat diklaim. Mode kompensasi: <b>${S.settings.compensation === 'carryover' ? 'Carryover (masuk lebih siang H+1)' : 'Insentif jam kerja SDM'}</b>. Approval: <b>${S.settings.claimMode === 'auto' ? 'otomatis bila terhubung commit/task' : 'manual Manajer'}</b>.</span></div>
  <div class="card">${table('workload', {
  rows: () => (typeof NIGHT !== 'undefined' ? NIGHT : []).map(n => ({ ...n })), size: 6,
  cols: [
    { k: 'nama', label: 'Karyawan', fmt: r => person(r.nama) }, { k: 'tgl', label: 'Tanggal', fmt: r => fmtD(r.tgl) }, { k: 'waktu', label: 'Waktu submit', cls: 'tabular' },
    { k: 'alasan', label: 'Pekerjaan' }, { k: 'jam', label: 'Jam', cls: 'r num' },
    { k: 'tipe', label: 'Kompensasi', fmt: r => lz(r.tipe, r.tipe === 'Insentif' ? 'primary' : 'info') },
    { k: 'status', label: 'Status', fmt: r => lz(r.status) },
    { k: 'x', label: 'Aksi', sort: false, fmt: r => r.status === 'Pending' && ['hr', 'manager'].includes(S.role) ? `<button class="btn btn-sm btn-success" data-ap="${r.id}">Setujui</button> <button class="btn btn-sm btn-danger" data-rj="${r.id}">Tolak</button>` : '—' }
  ],
  after: h => {
    $$('[data-ap]', h).forEach(b => b.onclick = () => { const n = NIGHT.find(x => x.id == b.dataset.ap); if (!n) return; n.status = 'Approved'; audit('Approve', 'Klaim malam #' + n.id, `${n.tipe} ${n.jam} jam — ${n.nama}`); toast(`Klaim ${n.nama} disetujui` + (n.tipe === 'Carryover' ? ' · carryover H+1 dihitung otomatis' : ' · kompensasi SDM dicatat'), 'success'); buildNav(); paintAll(); });
    $$('[data-rj]', h).forEach(b => b.onclick = () => { const n = NIGHT.find(x => x.id == b.dataset.rj); if (!n) return; n.status = 'Rejected'; audit('Reject', 'Klaim malam #' + n.id, n.nama); toast('Klaim ditolak', 'warn'); buildNav(); paintAll(); });
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
            ${emp.tipe === 'Freelance' ? 'Remote Project-Based (Milestone)' : isOk ? 'Wifi Kantor "Asta" (IP: 182.253.11.45)' : isInf ? 'Lokasi WFH: Jakarta Selatan (GPS Terverifikasi)' : 'Belum tercatat absensi hari ini'}
          </div>
        </div>
        <div class="card card-b" style="padding:12px;border:1px solid var(--border)">
          <div class="caption" style="color:var(--text-secondary)">${emp.tipe === 'Freelance' ? 'Penugasan Proyek' : 'Beban Kerja Harian'}</div>
          <div class="row" style="justify-content:space-between;margin-top:4px;align-items:center">
            <b style="font-size:14px">${emp.tipe === 'Freelance' ? `${(emp.projects || []).length} Proyek Aktif` : `${t.load} / ${t.cap} SP`}</b>
            <span class="caption num" style="font-weight:600">${emp.tipe === 'Freelance' ? 'Per Project' : `${p}%`}</span>
          </div>
          <div class="bar ${emp.tipe === 'Freelance' ? 'ok' : p > 100 ? 'bad' : p > 85 ? 'warn' : 'ok'}" style="margin-top:6px"><i style="width:${emp.tipe === 'Freelance' ? '100%' : Math.min(p, 100) + '%'}"></i></div>
          <div class="caption" style="margin-top:4px;color:#64748B">
            ${emp.tipe === 'Freelance' ? 'Skema Pembayaran Berbasis Proyek' : p > 100 ? 'Overload — perlu pembagian tugas' : p >= 85 ? 'Kapasitas Penuh' : 'Kapasitas Normal'}
          </div>
        </div>
      </div>

      <!-- KHUSUS FREELANCE: Penugasan Proyek Per-Project -->
      ${emp.tipe === 'Freelance' ? `
        <div class="card card-b" style="border:1px solid #BBF7D0;background:#F0FDF4">
          <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
            <div class="row" style="gap:6px;align-items:center">
              <i class="fi-rr-briefcase" style="color:#16A34A"></i>
              <b style="font-size:13px;color:#166534">Daftar Proyek Freelance (Per Project)</b>
            </div>
            <span class="badge" style="background:#DCFCE7;color:#15803D;font-size:11px"><i class="fi-rr-check"></i> Fee Per Proyek</span>
          </div>
          <div class="stack" style="gap:6px">
            ${(emp.projects && emp.projects.length ? emp.projects : [{ id: 'PRJ', nama: 'Proyek Software Kontrak', fee: 6500000, deadline: dOff(20), status: 'In Progress', progres: 50, deliverables: 'Milestone proyek' }]).map(prj => `
              <div style="background:#fff;border:1px solid #BBF7D0;border-radius:6px;padding:8px 10px;font-size:12px">
                <div class="row" style="justify-content:space-between">
                  <b>${esc(prj.nama)}</b>
                  <span style="font-weight:700;color:#16A34A">${rp(prj.fee)}</span>
                </div>
                <div class="caption" style="margin-top:2px;color:#475569">Deliverables: ${esc(prj.deliverables || '-')}</div>
                <div class="row" style="justify-content:space-between;margin-top:4px;font-size:11px">
                  <span>Progres: <b>${prj.progres || 0}%</b> (${esc(prj.status)})</span>
                  <span>Target: ${fmtD(prj.deadline)}</span>
                </div>
                <div class="bar ok" style="margin-top:4px"><i style="width:${prj.progres || 0}%"></i></div>
              </div>
            `).join('')}
          </div>
          <div class="row" style="justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px dashed #BBF7D0;font-size:12px">
            <span style="color:#166534;font-weight:600">Total Kompensasi Proyek:</span>
            <b style="font-size:15px;color:#166534">${rp((emp.projects || []).reduce((sum, prj) => sum + prj.fee, 0))}</b>
          </div>
        </div>
      ` : ''}

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
    ${emp.id ? `<button class="btn btn-outline" id="btnDetailEmpFull"><i class="fi-rr-user"></i> Lihat Profil Lengkap</button>` : ''}
    <button class="btn btn-primary" id="btnNudgeEmployee"><i class="fi-rr-paper-plane"></i> Kirim Pesan / Notif</button>
  `;

  openDrawer('Detail Anggota Tim — ' + t.nama, body, foot);
  if ($('#btnDetailEmpFull')) {
    $('#btnDetailEmpFull').onclick = () => {
      closeDrawer();
      empDrawer(emp);
    };
  }
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
function renderPrjRow(p = {}, idx = 0) {
  return `
    <div class="prj-row" data-prj-idx="${idx}" style="background:#fff;border:1px solid #BBF7D0;border-radius:var(--r-md);padding:12px;margin-bottom:10px">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <b style="font-size:12px;color:#166534"><i class="fi-rr-folder"></i> Proyek Kontrak #${idx + 1}</b>
        ${idx > 0 ? `<button type="button" class="btn btn-sm btn-outline btn-del-prj-row" style="color:var(--danger);padding:2px 8px;font-size:11px"><i class="fi-rr-trash"></i> Hapus</button>` : ''}
      </div>
      <div class="form-grid">
        <div class="field full"><label class="lbl">Nama Proyek Kontrak *</label><input class="input prj-nama" value="${esc(p.nama || '')}" placeholder="Contoh: ASTA Mobile Banking App (Flutter)"><div class="err">Nama proyek wajib diisi</div></div>
        <div class="field"><label class="lbl">Fee Kontrak Proyek (Rp) *</label><input class="input prj-fee" type="number" value="${p.fee || 7500000}" placeholder="Contoh: 7500000"></div>
        <div class="field"><label class="lbl">Status Proyek</label>
          <select class="input prj-status">
            <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Review" ${p.status === 'Review' ? 'selected' : ''}>Review / QA</option>
            <option value="Selesai" ${p.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          </select>
        </div>
        <div class="field full"><label class="lbl">Deliverables / Output Pekerjaan</label><input class="input prj-deliverables" value="${esc(p.deliverables || '')}" placeholder="Contoh: Slicing UI 15 Screen & Integrasi Payment Gateway REST API"></div>
        <div class="field"><label class="lbl">Target Deadline</label><input class="input prj-deadline" type="date" value="${p.deadline || dOff(30)}"></div>
        <div class="field"><label class="lbl">Progres Pengerjaan (%)</label><input class="input prj-progres" type="number" min="0" max="100" value="${p.progres || 50}"></div>
      </div>
    </div>
  `;
}

function empForm(e = {}) {
  const isFreelance = e.tipe === 'Freelance';
  const prjs = (Array.isArray(e.projects) && e.projects.length) ? e.projects : [{
    nama: 'ASTA Mobile Banking App (Flutter)',
    fee: 8500000,
    status: 'In Progress',
    deliverables: 'Slicing UI & Integrasi REST API Payment',
    deadline: dOff(30),
    progres: 50
  }];
  return `<form id="empForm" class="stack" style="gap:14px" novalidate>
    <div class="form-grid">
      <div class="field"><label class="lbl" for="eNama">Nama Lengkap *</label><input class="input" id="eNama" value="${esc(e.nama || '')}" placeholder="Nama lengkap karyawan..."><div class="err">Wajib diisi</div></div>
      <div class="field"><label class="lbl" for="eEmail">Email Resmi *</label><input class="input" id="eEmail" type="email" value="${esc(e.email || '')}" placeholder="nama@astacode.id atau gmail.com"><div class="err">Email tidak valid</div></div>
      <div class="field"><label class="lbl" for="eTipe">Tipe Pekerja *</label>
        <select class="input" id="eTipe">
          ${['Tetap', 'Freelance', 'PKL'].map(t => `<option ${e.tipe === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label class="lbl" for="eTim">Tim / Divisi</label><input class="input" id="eTim" value="${esc(e.tim || 'Engineering')}" placeholder="Engineering, Design, QA..."></div>
      <div class="field"><label class="lbl" for="eJab">Jabatan / Posisi</label><input class="input" id="eJab" value="${esc(e.jabatan || '')}" placeholder="Mobile Developer, UI Designer..."></div>
      <div class="field"><label class="lbl" for="eAtasan">Atasan Langsung</label><input class="input" id="eAtasan" value="${esc(e.atasan || 'Bagas Prakoso')}" placeholder="Nama manager/lead..."></div>
    </div>

    <!-- Dynamic Section: Penempatan & Hubungan Kerja SDM (Tetap) -->
    <div id="compSecTetap" style="display:${isFreelance || e.tipe === 'PKL' ? 'none' : 'block'};background:#F8FAFC;border:1px solid var(--border);border-radius:var(--r-md);padding:14px">
      <div style="font-weight:700;font-size:13px;color:#0F172A;margin-bottom:8px;display:flex;align-items:center;gap:6px">
        <i class="fi-rr-user-gear" style="color:var(--primary)"></i> Penempatan & Hubungan Kerja SDM (Karyawan Tetap)
      </div>
      <div class="form-grid">
        <div class="field"><label class="lbl" for="eLevel">Jenjang / Level SDM</label>
          <select class="input" id="eLevel">
            ${['Junior Staff', 'Mid-Level Specialist', 'Senior Specialist', 'Lead / Principal', 'Head of People'].map(l => `<option value="${l}" ${(e.level || 'Senior Specialist') === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label class="lbl" for="eStatusKerja">Status Hubungan Kerja</label>
          <select class="input" id="eStatusKerja">
            ${['PKWTT (Tetap)', 'PKWT (Kontrak)', 'Probation (Masa Percobaan)'].map(s => `<option value="${s}" ${(e.statusKerja || 'PKWTT (Tetap)') === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label class="lbl" for="eWorkPolicy">Kebijakan Kerja</label>
          <select class="input" id="eWorkPolicy">
            ${['Hybrid (Onsite & WFH)', 'Full Onsite', 'Remote Approved'].map(p => `<option value="${p}" ${(e.workPolicy || 'Hybrid (Onsite & WFH)') === p ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label class="lbl" for="eCutiSisa">Hak Cuti Tahunan (Hari)</label><input class="input" id="eCutiSisa" type="number" min="0" max="24" value="${e.cutiSisa ?? 12}"></div>
      </div>
    </div>

    <div id="compSecFreelance" style="display:${isFreelance ? 'block' : 'none'};background:#F0FDF4;border:1px solid #BBF7D0;border-radius:var(--r-md);padding:14px">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:4px">
        <div style="font-weight:700;font-size:13px;color:#166534;display:flex;align-items:center;gap:6px">
          <i class="fi-rr-briefcase" style="color:#16A34A"></i> Skema Freelance: Pembayaran Berbasis Proyek (Per Project)
        </div>
        <span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:600;font-size:11px">Kontrak Per Proyek</span>
      </div>
      <div class="caption" style="color:#15803D;margin-bottom:12px">
        Freelancer dikelola berdasarkan penugasan proyek, ruang lingkup (deliverables), dan target deadline (bukan jam kerja presensi harian).
      </div>
      <div id="prjRowsContainer">
        ${prjs.map((p, i) => renderPrjRow(p, i)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-outline" id="btnAddPrjRow" style="color:#166534;border-color:#86EFAC">
        <i class="fi-rr-plus"></i> Tambah Proyek Lain
      </button>
    </div>
  </form>`;
}

function saveEmp(existing) {
  const nama = $('#eNama').value.trim(), email = $('#eEmail').value.trim(), tipe = $('#eTipe').value;
  const okN = !!nama, okE = /^\S+@\S+\.\S+$/.test(email);
  $('#eNama').closest('.field').classList.toggle('has-err', !okN); $('#eEmail').closest('.field').classList.toggle('has-err', !okE);
  if (!okN || !okE) return false;

  let projects = [];
  if (tipe === 'Freelance') {
    const rows = $$('#prjRowsContainer .prj-row');
    rows.forEach((row, i) => {
      const pNama = $('.prj-nama', row)?.value.trim() || `Proyek Kontrak #${i + 1}`;
      const pFee = +$('.prj-fee', row)?.value || 5000000;
      const pStatus = $('.prj-status', row)?.value || 'In Progress';
      const pDeliverables = $('.prj-deliverables', row)?.value.trim() || 'Penyelesaian milestone proyek';
      const pDeadline = $('.prj-deadline', row)?.value || dOff(30);
      const pProgres = +$('.prj-progres', row)?.value || 0;
      const oldId = existing?.projects?.[i]?.id || `PRJ-${Date.now().toString().slice(-4)}-${i + 1}`;
      projects.push({
        id: oldId,
        nama: pNama,
        fee: pFee,
        status: pStatus,
        deliverables: pDeliverables,
        deadline: pDeadline,
        progres: pProgres
      });
    });
    if (!projects.length) {
      projects.push({
        id: 'PRJ-' + Date.now().toString().slice(-4),
        nama: 'Proyek Software Kontrak',
        fee: 6500000,
        status: 'In Progress',
        deliverables: 'Penyelesaian milestone proyek',
        deadline: dOff(30),
        progres: 50
      });
    }
  }

  const d = {
    nama, email, tipe,
    tim: $('#eTim').value || 'Engineering',
    jabatan: $('#eJab').value || 'Staff',
    atasan: $('#eAtasan').value || 'Bagas Prakoso',
    level: tipe === 'Tetap' ? ($('#eLevel')?.value || 'Senior Specialist') : '',
    statusKerja: tipe === 'Tetap' ? ($('#eStatusKerja')?.value || 'PKWTT (Tetap)') : '',
    workPolicy: tipe === 'Tetap' ? ($('#eWorkPolicy')?.value || 'Hybrid (Onsite & WFH)') : 'Remote Project-Based',
    cutiSisa: tipe === 'Tetap' ? +($('#eCutiSisa')?.value || 12) : 0,
    rate: 0,
    projects: tipe === 'Freelance' ? projects : []
  };

  if (existing) Object.assign(existing, d);
  else EMP.push({ id: Date.now(), status: 'Aktif', masuk: iso(TODAY), ...d });

  audit(existing ? 'Ubah' : 'Tambah', 'Karyawan', `${nama} (${tipe})`);
  toast('Data karyawan disimpan', 'success');
  return true;
}

function openEmpModal(existing) {
  openModal(existing ? 'Ubah Data Karyawan' : 'Tambah Karyawan', empForm(existing),
    '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave"><i class="fi-rr-disk"></i> Simpan Data</button>', true);
  
  const selT = $('#eTipe');
  if (selT) {
    const updateTipe = () => {
      const isTetap = selT.value === 'Tetap';
      const isFL = selT.value === 'Freelance';
      if ($('#compSecTetap')) $('#compSecTetap').style.display = isTetap ? 'block' : 'none';
      if ($('#compSecFreelance')) $('#compSecFreelance').style.display = isFL ? 'block' : 'none';
    };
    selT.onchange = updateTipe;
    updateTipe();
  }

  const bindDelPrjButtons = () => {
    $$('.btn-del-prj-row').forEach(b => {
      b.onclick = () => {
        const row = b.closest('.prj-row');
        const container = $('#prjRowsContainer');
        if (row && container && container.querySelectorAll('.prj-row').length > 1) {
          row.remove();
        } else {
          toast('Minimal 1 penugasan proyek untuk skema freelance', 'warn');
        }
      };
    });
  };
  bindDelPrjButtons();

  const btnAddRow = $('#btnAddPrjRow');
  if (btnAddRow) {
    btnAddRow.onclick = () => {
      const container = $('#prjRowsContainer');
      if (!container) return;
      const count = container.querySelectorAll('.prj-row').length;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderPrjRow({ nama: '', fee: 5000000, status: 'In Progress', deliverables: '', deadline: dOff(30), progres: 0 }, count);
      container.appendChild(tempDiv.firstElementChild);
      bindDelPrjButtons();
    };
  }

  $('#mCancel').onclick = closeModal;
  $('#mSave').onclick = () => {
    if (saveEmp(existing)) {
      closeModal();
      paintTable('emp');
      if (existing) empDrawer(existing);
    }
  };
}

function openProjectModal(emp, prj = null) {
  const isEdit = !!prj;
  const p = prj || {
    id: 'PRJ-' + Date.now().toString().slice(-4),
    nama: '',
    fee: 5000000,
    status: 'In Progress',
    deliverables: '',
    deadline: dOff(30),
    progres: 0
  };

  const body = `
    <form id="prjSingleForm" class="stack" style="gap:12px" novalidate>
      <div class="field"><label class="lbl" for="pNama">Nama Proyek Kontrak *</label><input class="input" id="pNama" value="${esc(p.nama)}" placeholder="Contoh: Implementasi Payment Gateway API"><div class="err">Nama proyek wajib diisi</div></div>
      <div class="form-grid">
        <div class="field"><label class="lbl" for="pFee">Fee Proyek (Rp) *</label><input class="input" id="pFee" type="number" value="${p.fee}" placeholder="Contoh: 7500000"></div>
        <div class="field"><label class="lbl" for="pStatus">Status Proyek</label>
          <select class="input" id="pStatus">
            <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Review" ${p.status === 'Review' ? 'selected' : ''}>Review / QA</option>
            <option value="Selesai" ${p.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          </select>
        </div>
      </div>
      <div class="field"><label class="lbl" for="pDeliv">Deliverables / Milestone Output</label><input class="input" id="pDeliv" value="${esc(p.deliverables)}" placeholder="Contoh: Modul checkout, callback webhook, & unit testing"></div>
      <div class="form-grid">
        <div class="field"><label class="lbl" for="pDeadline">Target Deadline</label><input class="input" id="pDeadline" type="date" value="${p.deadline || dOff(30)}"></div>
        <div class="field"><label class="lbl" for="pProgres">Progres Milestone (%)</label><input class="input" id="pProgres" type="number" min="0" max="100" value="${p.progres || 0}"></div>
      </div>
    </form>
  `;

  openModal(isEdit ? 'Ubah Proyek — ' + emp.nama : 'Tambah Proyek Freelance — ' + emp.nama, body,
    '<button class="btn" id="mCancel">Batal</button><button class="btn btn-primary" id="mSavePrj"><i class="fi-rr-disk"></i> Simpan Proyek</button>');

  $('#mCancel').onclick = closeModal;
  $('#mSavePrj').onclick = () => {
    const nama = $('#pNama').value.trim();
    if (!nama) {
      $('#pNama').closest('.field').classList.add('has-err');
      return;
    }
    const fee = +$('#pFee').value || 0;
    const status = $('#pStatus').value;
    const deliverables = $('#pDeliv').value.trim();
    const deadline = $('#pDeadline').value;
    const progres = +$('#pProgres').value || 0;

    if (!Array.isArray(emp.projects)) emp.projects = [];

    if (isEdit) {
      Object.assign(prj, { nama, fee, status, deliverables, deadline, progres });
      audit('Ubah Proyek Freelance', 'Karyawan', `${emp.nama} — ${nama} (${rp(fee)})`);
      toast(`Proyek "${nama}" diperbarui`, 'success');
    } else {
      emp.projects.push({
        id: p.id,
        nama,
        fee,
        status,
        deliverables,
        deadline,
        progres
      });
      audit('Tambah Proyek Freelance', 'Karyawan', `${emp.nama} — ${nama} (${rp(fee)})`);
      toast(`Proyek "${nama}" berhasil ditambahkan ke ${emp.nama}`, 'success');
    }
    closeModal();
    paintTable('emp');
    empDrawer(emp);
  };
}

reg('karyawan', 'Data Karyawan', ['Data Karyawan'], () => `
  <!-- Stat Cards Interaktif Karyawan -->
  <div class="grid g4" style="margin-bottom:16px" id="empStatCards">
    ${[
      { label: 'Semua Karyawan', key: 'Semua', count: EMP.length, cls: 'ok' },
      { label: 'Karyawan Tetap', key: 'Tetap', count: EMP.filter(e => e.tipe === 'Tetap').length, cls: 'inf' },
      { label: 'Freelance (Per Proyek)', key: 'Freelance', count: EMP.filter(e => e.tipe === 'Freelance').length, cls: 'warn' },
      { label: 'Peserta PKL', key: 'PKL', count: EMP.filter(e => e.tipe === 'PKL').length, cls: 'bad' }
    ].map(s => {
      const isSel = (TBL.emp?.f || 'Semua') === s.key;
      return `
        <div class="card stat interactive ${s.cls} ${isSel ? 'active-stat' : ''}" data-emp-stat="${s.key}" title="Klik untuk memfilter & melihat data ${s.label}">
          <div class="k">${s.label}</div>
          <div class="v">${s.count}</div>
          <div class="stat-click-hint"><i class="fi-rr-eye"></i> Klik untuk filter & detail</div>
        </div>`;
    }).join('')}
  </div>

  <div class="card">${table('emp', {
  rows: () => EMP.filter(e => !TBL.emp?.f || TBL.emp.f === 'Semua' || e.tipe === TBL.emp.f),
  size: 8,
  bulk: '<button class="btn btn-sm" id="bulkExport">Ekspor</button> <button class="btn btn-sm" id="bulkMsg">Kirim pengumuman</button>',
  toolbar: () => `
    <div class="row" id="empChips">
      ${['Semua', 'Tetap', 'Freelance', 'PKL'].map(c => `
        <button class="chip ${(TBL.emp.f || 'Semua') === c ? 'on' : ''}" data-f="${c}">${c === 'Freelance' ? 'Freelance (Per Proyek)' : c}</button>
      `).join('')}
    </div>
  `,
  cols: [
    { k: 'nama', label: 'Nama & Kontak', fmt: r => person(r.nama, r.email) },
    { k: 'tipe', label: 'Tipe Pekerja', fmt: r => lz(r.tipe, { Tetap: 'primary', Freelance: 'info', PKL: 'warning' }[r.tipe]) },
    { k: 'tim', label: 'Tim / Divisi' },
    { k: 'jabatan', label: 'Jabatan / Peran' },
    {
      k: 'penugasan',
      label: 'Penugasan & Peran SDM',
      fmt: r => {
        if (r.tipe === 'Freelance') {
          const prjCount = (r.projects || []).length;
          const firstPrj = r.projects?.[0]?.nama || 'Penugasan SPK Proyek';
          return `<div><span class="badge" style="background:#DCFCE7;color:#15803D;font-size:11px"><i class="fi-rr-briefcase"></i> Per Proyek</span></div><div style="font-size:11px;color:#166534;margin-top:2px"><b>${prjCount} Proyek Aktif</b> · ${esc(firstPrj.length > 20 ? firstPrj.slice(0, 18) + '...' : firstPrj)}</div>`;
        }
        if (r.tipe === 'Tetap') {
          return `<div><span class="badge" style="background:#EFF6FF;color:#1D4ED8;font-size:11px"><i class="fi-rr-badge-check"></i> ${esc(r.level || 'Senior Specialist')}</span></div><div class="caption">${esc(r.statusKerja || 'PKWTT (Tetap)')}</div>`;
        }
        return `<div><span class="badge" style="background:#FEF3C7;color:#92400E;font-size:11px"><i class="fi-rr-graduation-cap"></i> Siswa PKL</span></div><div class="caption">Program Vokasi</div>`;
      }
    },
    { k: 'status', label: 'Status', fmt: r => lz(r.status) },
    { k: 'aksi', label: 'Aksi', sort: false, cls: 'r', fmt: r => `<button class="btn btn-sm btn-outline" data-emp-view="${r.id}" style="padding:4px 10px"><i class="fi-rr-eye"></i> Detail</button>` }
  ],
  onRow: id => { const e = EMP.find(x => x.id === id); if (e) empDrawer(e); },
  after: h => {
    $$('[data-f]', h).forEach(b => b.onclick = () => {
      TBL.emp.f = b.dataset.f;
      TBL.emp.page = 1;
      updateEmpStatHighlight();
      paintTable('emp');
    });
    $$('[data-emp-view]', h).forEach(b => b.onclick = (ev) => {
      ev.stopPropagation();
      const emp = EMP.find(x => x.id === +b.dataset.empView);
      if (emp) empDrawer(emp);
    });
    const bx = $('#bulkExport', h); if (bx) bx.onclick = () => toast(`${TBL.emp.sel.size} karyawan diekspor ke CSV`, 'success');
    const bm = $('#bulkMsg', h); if (bm) bm.onclick = () => toast('Pengumuman terkirim ke anggota terpilih', 'success');
  }
})}</div>`, () => {
  const updateEmpStatHighlight = () => {
    const curF = TBL.emp?.f || 'Semua';
    $$('#empStatCards [data-emp-stat]').forEach(card => {
      card.classList.toggle('active-stat', card.dataset.empStat === curF);
    });
    $$('#empChips .chip').forEach(ch => ch.classList.toggle('on', ch.dataset.f === curF));
  };

  $$('#empStatCards [data-emp-stat]').forEach(card => {
    card.onclick = () => {
      const k = card.dataset.empStat;
      TBL.emp.f = k;
      TBL.emp.page = 1;
      const count = k === 'Semua' ? EMP.length : EMP.filter(e => e.tipe === k).length;
      toast(`Menampilkan kategori: ${k} (${count} orang)`, 'info');
      updateEmpStatHighlight();
      paintTable('emp');
    };
  });

  paintTable('emp');
}, () => `<button class="btn btn-primary" id="btnAddEmp"><i class="fi-rr-plus"></i> Tambah Karyawan</button>`);

function empDrawer(e) {
  if (!e) return;
  const teamInfo = TEAM_TODAY.find(t => t.nama === e.nama);
  const logs = LOGS.filter(l => l.nama === e.nama);
  const tenure = getTenure(e.masuk);
  const empId = `ASTA-EMP-${pad(e.id, 4)}`;
  const phone = `0812-${pad(e.id, 4)}-${pad(e.id * 11, 4)}`;

  const isOk = teamInfo ? teamInfo.status.includes('Onsite') : false;
  const isWfh = teamInfo ? teamInfo.status.includes('WFH') : false;
  const attCls = isOk ? 'success' : isWfh ? 'info' : 'warning';
  const attIcon = isOk ? 'fi-rr-building' : isWfh ? 'fi-rr-home' : 'fi-rr-clock';
  const attStatus = teamInfo ? teamInfo.status : (e.tipe === 'Freelance' ? 'Bekerja Berbasis Proyek' : 'Belum Ada Data Presensi');

  const body = `
    <div class="stack" style="gap:16px">
      <!-- Header Profile Card -->
      <div class="row" style="gap:16px;align-items:center;padding:14px 16px;background:#F8FAFC;border:1px solid var(--border);border-radius:var(--r-md)">
        <span class="av" style="width:58px;height:58px;font-size:20px;background:${colorOf(e.nama)}">${initials(e.nama)}</span>
        <div style="flex:1">
          <div class="row" style="gap:8px;align-items:center;flex-wrap:wrap">
            <h3 style="margin:0;font-size:17px;font-weight:700;color:#0F172A">${esc(e.nama)}</h3>
            ${lz(e.tipe, { Tetap: 'primary', Freelance: 'info', PKL: 'warning' }[e.tipe])}
            ${lz(e.status, e.status === 'Aktif' ? 'success' : 'danger')}
          </div>
          <div class="caption" style="margin-top:3px;color:#475569;font-size:12px">
            <b>${esc(e.jabatan || 'Staff')}</b> · Tim <b>${esc(e.tim || 'Umum')}</b> · <span class="badge" style="background:#EEF2FF;color:#3730A3;font-size:11px">${empId}</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats Metrics Grid (3 Kolom) -->
      <div class="grid g3" style="gap:10px">
        <div class="card card-b" style="padding:10px 12px;border:1px solid var(--border)">
          <div class="caption" style="color:var(--text-secondary);font-size:11px">Masa Kerja / Kontrak</div>
          <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:3px">${tenure}</div>
          <div class="caption" style="color:#64748B;font-size:10px;margin-top:2px">Mulai ${fmtD(e.masuk)}</div>
        </div>
        <div class="card card-b" style="padding:10px 12px;border:1px solid var(--border)">
          <div class="caption" style="color:var(--text-secondary);font-size:11px">Status Kerja Hari Ini</div>
          <div class="row" style="gap:5px;align-items:center;margin-top:3px">
            <i class="${attIcon}" style="font-size:13px;color:var(--${attCls})"></i>
            <b style="font-size:12px;color:var(--${attCls})">${esc(attStatus)}</b>
          </div>
          <div class="caption" style="color:#64748B;font-size:10px;margin-top:2px">${e.tipe === 'Freelance' ? 'Remote Project-Based' : isOk ? 'Onsite Office' : isWfh ? 'Lokasi WFH' : 'Standby'}</div>
        </div>
        <div class="card card-b" style="padding:10px 12px;border:1px solid var(--border)">
          <div class="caption" style="color:var(--text-secondary);font-size:11px">${e.tipe === 'Freelance' ? 'Proyek Ditugaskan' : 'Beban Harian (SP)'}</div>
          <div style="font-weight:700;font-size:14px;color:#0F172A;margin-top:3px">${e.tipe === 'Freelance' ? `${(e.projects || []).length} Proyek Aktif` : teamInfo ? `${teamInfo.load} / ${teamInfo.cap} SP` : '0 SP'}</div>
          <div class="caption" style="color:#64748B;font-size:10px;margin-top:2px">${e.tipe === 'Freelance' ? 'Sistem Per Proyek' : teamInfo ? `${Math.round(teamInfo.load / teamInfo.cap * 100)}% Kapasitas` : '-'}</div>
        </div>
      </div>

      <!-- Informasi Lengkap & Kontak -->
      <div class="card card-b" style="border:1px solid var(--border)">
        <div class="row" style="gap:6px;align-items:center;margin-bottom:10px">
          <i class="fi-rr-id-badge" style="color:var(--primary);font-size:15px"></i>
          <b style="font-size:13px">Informasi Kepegawaian & Kontak</b>
        </div>
        <dl class="kv" style="grid-template-columns:130px 1fr;gap:8px 12px;font-size:12px">
          <dt>ID Karyawan</dt><dd><b>${empId}</b></dd>
          <dt>Email</dt><dd><a href="mailto:${esc(e.email)}" style="color:var(--primary);text-decoration:underline">${esc(e.email)}</a></dd>
          <dt>Nomor Telepon / WA</dt><dd>${phone} <button class="btn btn-sm btn-outline" id="btnCallEmp" style="padding:1px 6px;margin-left:6px;font-size:10px"><i class="fi-rr-phone-call"></i> Hubungi</button></dd>
          <dt>Tim / Departemen</dt><dd>${esc(e.tim)}</dd>
          <dt>Jabatan / Peran</dt><dd><b>${esc(e.jabatan)}</b></dd>
          <dt>Atasan Langsung</dt><dd>${person(e.atasan || 'Direksi')}</dd>
          <dt>Status Kepegawaian</dt><dd>${lz(e.status, e.status === 'Aktif' ? 'success' : 'danger')}</dd>
          <dt>Tanggal Bergabung</dt><dd>${fmtD(e.masuk)} (${tenure})</dd>
        </dl>
      </div>

      <!-- KHUSUS FREELANCE: Daftar Proyek & Skema Fee Per Project -->
      ${e.tipe === 'Freelance' ? `
        <div class="card card-b" style="border:1px solid #BBF7D0;background:#F0FDF4">
          <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px">
            <div class="row" style="gap:6px;align-items:center">
              <i class="fi-rr-briefcase" style="color:#16A34A;font-size:16px"></i>
              <b style="font-size:13px;color:#166534">Daftar Penugasan Proyek Freelance (Per Project)</b>
            </div>
            <div class="row" style="gap:6px">
              <button class="btn btn-sm btn-primary" id="btnAddPrjFreelance" style="font-size:11px;padding:3px 10px">
                <i class="fi-rr-plus"></i> Tambah Proyek
              </button>
              <span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:600;font-size:11px">
                <i class="fi-rr-check"></i> Fee Per Proyek
              </span>
            </div>
          </div>

          <div class="stack" style="gap:8px">
            ${(e.projects && e.projects.length ? e.projects : [{ id: 'PRJ-DEF', nama: 'Proyek Pengembangan Fitur Software', fee: 6500000, deadline: dOff(20), status: 'In Progress', progres: 50, deliverables: 'Penyelesaian modul & dokumentasi API' }]).map(p => `
              <div style="background:#fff;border:1px solid #BBF7D0;border-radius:8px;padding:12px">
                <div class="row" style="justify-content:space-between;align-items:flex-start">
                  <div>
                    <div class="row" style="gap:6px;align-items:center">
                      <b style="font-size:13px;color:#0F172A">${esc(p.nama)}</b>
                      <span class="badge" style="background:#E0F2FE;color:#0369A1;font-size:10px">${esc(p.id || 'PRJ')}</span>
                    </div>
                    <div class="caption" style="color:#475569;margin-top:3px">
                      <b>Target Deliverable:</b> ${esc(p.deliverables || '-')}
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-weight:700;font-size:15px;color:#16A34A">${rp(p.fee)}</div>
                    <span class="lz lz-${p.status === 'Selesai' ? 'success' : 'info'}" style="font-size:10px">${esc(p.status)}</span>
                  </div>
                </div>
                <div style="margin-top:8px">
                  <div class="row" style="justify-content:space-between;font-size:11px;color:#64748B;margin-bottom:3px">
                    <span>Progres Milestone</span>
                    <b>${p.progres || 0}% · Target: ${fmtD(p.deadline || dOff(30))}</b>
                  </div>
                  <div class="bar ok"><i style="width:${p.progres || 0}%"></i></div>
                </div>
                <div class="row" style="justify-content:flex-end;gap:6px;margin-top:8px;padding-top:6px;border-top:1px dashed #E2E8F0">
                  ${p.status !== 'Selesai' ? `<button class="btn btn-sm btn-outline" data-prj-done="${p.id}" style="padding:2px 8px;font-size:11px;color:#16A34A;border-color:#BBF7D0"><i class="fi-rr-check"></i> Selesai</button>` : ''}
                  <button class="btn btn-sm btn-outline" data-prj-edit="${p.id}" style="padding:2px 8px;font-size:11px"><i class="fi-rr-edit"></i> Ubah</button>
                  <button class="btn btn-sm btn-outline" data-prj-del="${p.id}" style="padding:2px 8px;font-size:11px;color:var(--danger)"><i class="fi-rr-trash"></i></button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="row" style="justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px dashed #BBF7D0">
            <span style="font-size:12px;font-weight:600;color:#166534">Total Nilai Kontrak Penugasan Proyek:</span>
            <b style="font-size:17px;color:#166534">${rp((e.projects || []).reduce((sum, p) => sum + p.fee, 0))}</b>
          </div>
        </div>
      ` : ''}

      <!-- Penempatan & Karir SDM (Karyawan Tetap) -->
      ${e.tipe === 'Tetap' ? `
        <div class="card card-b" style="border:1px solid var(--border)">
          <div class="row" style="gap:6px;align-items:center;margin-bottom:10px">
            <i class="fi-rr-user-gear" style="color:var(--primary);font-size:15px"></i>
            <b style="font-size:13px">Penempatan, Jenjang Karir & Kebijakan SDM</b>
          </div>
          <div style="background:#F8FAFC;border:1px solid var(--border);border-radius:8px;padding:12px 14px">
            <div class="grid g2" style="gap:12px;font-size:12px">
              <div>
                <div class="caption" style="color:#64748B">Jenjang / Level SDM</div>
                <div style="font-size:14px;font-weight:700;color:#0F172A;margin-top:2px">${esc(e.level || 'Senior Specialist')}</div>
              </div>
              <div>
                <div class="caption" style="color:#64748B">Status Hubungan Kerja</div>
                <div style="font-size:14px;font-weight:700;color:#0F172A;margin-top:2px">${esc(e.statusKerja || 'PKWTT (Tetap)')}</div>
              </div>
              <div>
                <div class="caption" style="color:#64748B">Kebijakan Kehadiran</div>
                <div style="font-size:13px;font-weight:600;color:var(--primary);margin-top:2px"><i class="fi-rr-building"></i> ${esc(e.workPolicy || 'Hybrid (Onsite & WFH)')}</div>
              </div>
              <div>
                <div class="caption" style="color:#64748B">Hak Cuti Tahunan</div>
                <div style="font-size:13px;font-weight:600;color:#16A34A;margin-top:2px"><i class="fi-rr-calendar"></i> ${e.cutiSisa ?? 12} Hari Kerja Tersedia</div>
              </div>
            </div>
            <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--border);font-size:11px;color:#64748B">
              <i class="fi-rr-info"></i> Seluruh data finansial dan pencairan kompensasi diproses terpusat pada Modul Finance (ERP Keuangan).
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Task & Daily Log Terkini -->
      ${teamInfo || logs.length ? `
        <div class="card card-b" style="border:1px solid var(--border)">
          <div class="row" style="gap:6px;align-items:center;margin-bottom:8px">
            <i class="fi-rr-clipboard-list" style="color:var(--primary);font-size:15px"></i>
            <b style="font-size:13px">Aktivitas & Task Terkini</b>
          </div>
          ${teamInfo && teamInfo.task && teamInfo.task !== '—' ? `
            <div style="background:#F1F5F9;padding:8px 12px;border-radius:6px;margin-bottom:8px">
              <div style="font-size:11px;font-weight:700;color:var(--primary)">TASK AKTIF HARI INI:</div>
              <div style="font-size:13px;font-weight:600;color:#0F172A;margin-top:2px">${esc(teamInfo.task)}</div>
            </div>
          ` : ''}
          ${logs.length ? `
            <div class="caption" style="margin-bottom:4px">Riwayat Daily Log Terakhir:</div>
            <div style="font-size:12px;color:#334155;background:#fff;border:1px solid var(--border);border-radius:6px;padding:8px 10px;line-height:1.5">
              ${esc(logs[0].ringkasan)}
            </div>
            ${logs[0].task ? `<div class="caption" style="margin-top:4px"><i class="fi-rr-link"></i> Task: <b>${esc(logs[0].task)}</b></div>` : ''}
            ${logs[0].commit ? `<div class="caption" style="margin-top:2px"><i class="fi-rr-code-commit"></i> Commit: <a href="https://${esc(logs[0].commit)}" target="_blank" style="color:var(--primary);text-decoration:underline">${esc(logs[0].commit)}</a></div>` : ''}
          ` : '<div class="caption muted" style="font-style:italic">Belum ada catatan daily log tersimpan.</div>'}
        </div>
      ` : ''}

      <!-- Berkas & Dokumen Digital SDM -->
      <div class="card card-b" style="border:1px solid var(--border)">
        <div class="row" style="gap:6px;align-items:center;margin-bottom:8px">
          <i class="fi-rr-document" style="color:var(--primary);font-size:15px"></i>
          <b style="font-size:13px">Dokumen & Berkas Digital SDM</b>
        </div>
        <div class="stack" style="gap:6px">
          ${(e.tipe === 'Freelance' ? [
            { n: 'Surat Perjanjian Kerja Sama Proyek (SPK).pdf', size: '1.2 MB' },
            { n: 'Pakta Integritas & NDA Perusahaan.pdf', size: '940 KB' },
            { n: 'Kartu Tanda Penduduk (KTP).jpg', size: '820 KB' },
            { n: 'Kartu NPWP Elektronik.pdf', size: '540 KB' }
          ] : e.tipe === 'Tetap' ? [
            { n: 'Surat Keputusan Pengangkatan Karyawan (SK).pdf', size: '1.4 MB' },
            { n: 'Perjanjian Kerja Waktu Tidak Tertentu (PKWTT).pdf', size: '1.1 MB' },
            { n: 'Pakta Integritas & NDA Perusahaan.pdf', size: '940 KB' },
            { n: 'Kartu BPJS Ketenagakerjaan & Kesehatan.pdf', size: '620 KB' }
          ] : [
            { n: 'Surat Penerimaan Siswa PKL.pdf', size: '890 KB' },
            { n: 'Form Evaluasi Pembimbing Industri.pdf', size: '750 KB' },
            { n: 'Sertifikat Kelulusan PKL.pdf', size: '1.5 MB' }
          ]).map(d => `
            <div class="row" style="justify-content:space-between;align-items:center;padding:6px 10px;background:#F8FAFC;border:1px solid var(--border);border-radius:6px;font-size:12px">
              <div class="row" style="gap:8px;align-items:center">
                <i class="fi-rr-file-pdf" style="font-size:15px;color:var(--primary)"></i>
                <div>
                  <div style="font-weight:600;color:#0F172A">${d.n}</div>
                  <div class="caption" style="font-size:10px;color:#64748B">${d.size} · Terverifikasi SDM</div>
                </div>
              </div>
              <button class="btn btn-sm btn-outline" data-dl="${d.n}" style="padding:2px 8px;font-size:11px">
                <i class="fi-rr-download"></i> Unduh
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const foot = `
    <button class="btn" onclick="closeDrawer()">Tutup</button>
    <button class="btn btn-outline" id="btnNudgeEmployee"><i class="fi-rr-paper-plane"></i> Kirim Pesan</button>
    ${S.role === 'hr' ? `
      <button class="btn btn-primary" id="dEdit"><i class="fi-rr-edit"></i> Ubah Data</button>
      <button class="btn ${e.status === 'Aktif' ? 'btn-danger' : 'btn-success'}" id="dOff">
        <i class="fi-rr-power"></i> ${e.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
      </button>
    ` : ''}
  `;

  openDrawer(`Detail Karyawan — ${e.nama}`, body, foot);

  if ($('#btnCallEmp')) {
    $('#btnCallEmp').onclick = () => {
      toast(`Menghubungi ${e.nama} (${phone}) via WhatsApp...`, 'info');
      audit('Hubungi Karyawan', 'Karyawan', `${e.nama} — ${phone}`);
    };
  }

  if ($('#btnNudgeEmployee')) {
    $('#btnNudgeEmployee').onclick = () => {
      toast(`Pesan notifikasi berhasil dikirimkan ke ${e.nama}`, 'success');
      audit('Kirim Pesan', 'Karyawan', e.nama);
    };
  }

  $$('[data-dl]').forEach(a => a.onclick = ev => {
    ev.preventDefault();
    const docName = a.dataset.dl;
    toast(`Mengunduh dokumen: ${docName}`, 'success');
    audit('Unduh Dokumen', 'Karyawan', `${e.nama} — ${docName}`);
  });

  if ($('#dEdit')) {
    $('#dEdit').onclick = () => {
      closeDrawer();
      openEmpModal(e);
    };
  }

  if ($('#btnAddPrjFreelance')) {
    $('#btnAddPrjFreelance').onclick = () => openProjectModal(e);
  }

  $$('[data-prj-done]').forEach(b => {
    b.onclick = () => {
      const pId = b.dataset.prjDone;
      const prj = (e.projects || []).find(x => x.id === pId);
      if (prj) {
        prj.status = 'Selesai';
        prj.progres = 100;
        audit('Selesaikan Proyek', 'Freelance', `${e.nama} — ${prj.nama}`);
        toast(`Proyek "${prj.nama}" ditandai Selesai (100%)`, 'success');
        paintTable('emp');
        empDrawer(e);
      }
    };
  });

  $$('[data-prj-edit]').forEach(b => {
    b.onclick = () => {
      const pId = b.dataset.prjEdit;
      const prj = (e.projects || []).find(x => x.id === pId);
      if (prj) openProjectModal(e, prj);
    };
  });

  $$('[data-prj-del]').forEach(b => {
    b.onclick = () => {
      const pId = b.dataset.prjDel;
      const prj = (e.projects || []).find(x => x.id === pId);
      if (prj && confirm(`Hapus penugasan proyek "${prj.nama}"?`)) {
        e.projects = e.projects.filter(x => x.id !== pId);
        audit('Hapus Proyek', 'Freelance', `${e.nama} — ${prj.nama}`);
        toast(`Proyek "${prj.nama}" dihapus`, 'info');
        paintTable('emp');
        empDrawer(e);
      }
    };
  });

  if ($('#dOff')) {
    $('#dOff').onclick = () => {
      e.status = e.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      audit('Ubah status', 'Karyawan', `${e.nama} → ${e.status}`);
      toast(`Status ${e.nama} diubah menjadi ${e.status}`, 'success');
      closeDrawer();
      paintTable('emp');
      empDrawer(e);
    };
  }
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
    a.stage = 'Hired'; EMP.push({ id: Date.now(), nama: a.nama, email: a.email, tipe: 'Tetap', tim: job?.tim || 'Engineering', jabatan: job?.judul || 'Staff', atasan: 'Bagas Prakoso', level: 'Mid-Level Specialist', statusKerja: 'Probation (Masa Percobaan)', workPolicy: 'Hybrid (Onsite & WFH)', cutiSisa: 12, rate: 0, status: 'Aktif', masuk: iso(TODAY) });
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
      <span>${q.available ? `<b>Available</b> — okupansi tertinggi ${q.max}/${mx} dalam ${q.days} hari.` : `<b>Kuota Penuh</b> pada ${fmtM(q.fullDay)} (${q.max}/${mx}).`}</span>
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
            Kuota magang telah terisi penuh (${mx} peserta) pada bulan <b>${fmtM(q.fullDay)}</b>. Mohon sesuaikan tanggal mulai atau selesai untuk memilih jadwal dengan kuota yang masih tersedia.
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

/* ===== Kalender Kuota — per bulan (PKL-05) ===== */
// Tampilan per bulan; perhitungan kuota pengajuan (checkQuota) tetap per hari.
const calState = { y: TODAY.getFullYear(), m: TODAY.getMonth() };
function monthStats(y, m) {
  const dim = new Date(y, m + 1, 0).getDate(), first = `${y}-${pad(m + 1)}-01`, last = `${y}-${pad(m + 1)}-${pad(dim)}`;
  let peak = 0;
  for (let d = 1; d <= dim; d++) peak = Math.max(peak, occupancy(`${y}-${pad(m + 1)}-${pad(d)}`));
  const list = PKL.filter(p => ['Aktif', 'Diterima'].includes(p.status) && p.mulai <= last && p.selesai >= first);
  return { peak, list, first, last, dim };
}
reg('kalender', 'Kalender Kuota', ['Manajemen PKL', 'Kalender Kuota'], () => {
  const mx = S.settings.quotaMax, y = calState.y;
  const cls = pk => pk >= mx ? 'r' : pk >= mx - 1 ? 'y' : 'g';
  const cells = BULAN.map((nm, m) => {
    const st = monthStats(y, m), cl = cls(st.peak), cur = y === TODAY.getFullYear() && m === TODAY.getMonth();
    return `<button type="button" class="mcell ${cl} ${calState.m === m ? 'sel' : ''}" data-m="${m}" title="Puncak ${st.peak}/${mx} terisi" aria-label="${nm} ${y}: puncak ${st.peak} dari ${mx} terisi, ${st.list.length} peserta aktif">
      <span class="mname">${nm}${cur ? '<em>Bulan ini</em>' : ''}</span>
      <span class="mval">${st.peak}<small>/${mx}</small></span>
      <span class="mcap">Puncak okupansi</span>
      <div class="bar ${cl === 'r' ? 'bad' : cl === 'y' ? 'warn' : 'ok'}"><i style="width:${Math.min(100, st.peak / mx * 100)}%"></i></div>
      <span class="mpeople">${st.list.length} peserta aktif</span></button>`;
  }).join('');
  let detail = '<span class="muted">Klik salah satu bulan untuk melihat peserta aktif.</span>';
  if (calState.m != null) {
    const st = monthStats(y, calState.m), cl = cls(st.peak);
    const idx = d => Math.round((parse(d) - parse(st.first)) / 86400000);
    detail = `<div class="num" style="font-size:24px;font-weight:600">${st.peak}/${mx} <span class="caption">puncak okupansi</span></div>
      <div class="bar ${cl === 'r' ? 'bad' : cl === 'y' ? 'warn' : 'ok'}" style="margin:8px 0 6px"><i style="width:${Math.min(100, st.peak / mx * 100)}%"></i></div>
      <p class="caption" style="margin-bottom:10px">Angka bulanan = hari tersibuk dalam bulan ini. Keputusan kuota pada pengajuan tetap dicek per hari.</p>
      ${st.list.length ? st.list.map(p => {
        const a = Math.max(0, idx(p.mulai)), z = Math.min(st.dim - 1, idx(p.selesai));
        return `<div class="mrow">${av(p.nama, 1)}<div class="mmain"><b>${esc(p.nama)}</b><div class="caption">${esc(p.instansi)} · ${esc(p.divisi || '-')}</div>
          <div class="mtrack" aria-hidden="true"><i style="left:${a / st.dim * 100}%;width:${(z - a + 1) / st.dim * 100}%"></i></div>
          <div class="caption">${fmtD(p.mulai)} – ${fmtD(p.selesai)}</div></div></div>`;
      }).join('') : '<span class="muted">Tidak ada peserta aktif pada bulan ini.</span>'}`;
  }
  return `<div class="grid g-main">
    <div class="card">
      <div class="card-h">
        <div class="row">
          <button class="btn btn-sm" id="cPrevY" aria-label="Tahun sebelumnya"><i class=fi-rr-angle-left></i></button>
          <h3 style="min-width:70px;text-align:center">${y}</h3>
          <button class="btn btn-sm" id="cNextY" aria-label="Tahun berikutnya"><i class=fi-rr-angle-right></i></button>
        </div>
        <select class="input" id="cYear" style="width:90px" aria-label="Tahun">${[-1, 0, 1, 2].map(o => `<option ${TODAY.getFullYear() + o === y ? 'selected' : ''}>${TODAY.getFullYear() + o}</option>`).join('')}</select>
      </div>
      <div class="card-b">
        <div class="mgrid">${cells}</div>
        <div class="legend" style="margin-top:14px"><span><i style="background:#16A34A"></i>Tersedia</span><span><i style="background:#D97706"></i>Hampir penuh</span><span><i style="background:#DC2626"></i>Penuh</span></div>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><h3>${calState.m != null ? BULAN[calState.m] + ' ' + y : 'Pilih bulan'}</h3></div>
      <div class="card-b">${detail}</div>
    </div>
  </div>`;
}, () => {
  const yr = n => { calState.y += n; render(); };
  $('#cPrevY').onclick = () => yr(-1); $('#cNextY').onclick = () => yr(1);
  $('#cYear').onchange = e => { calState.y = +e.target.value; render(); };
  $$('[data-m]').forEach(b => b.onclick = () => { calState.m = +b.dataset.m; render(); });
});

/* ===== Peserta Aktif ===== */
reg('peserta', 'Peserta Aktif', ['Manajemen PKL', 'Peserta Aktif'], () => `<div class="card">${table('act', {
  rows: () => PKL.filter(p => p.status === 'Aktif'),
  cols: [{ k: 'nama', label: 'Peserta', fmt: r => person(r.nama, r.instansi) }, { k: 'divisi', label: 'Divisi' }, { k: 'pembimbing', label: 'Pembimbing' }, { k: 'selesai', label: 'Periode', fmt: r => `${fmtD(r.mulai)} – ${fmtD(r.selesai)}` },
    { k: 'prog', label: 'Progres', sort: false, fmt: r => { const t = (parse(r.selesai) - parse(r.mulai)), p = Math.min(100, Math.max(0, Math.round((TODAY - parse(r.mulai)) / t * 100))); return `<div style="min-width:110px"><div class="bar"><i style="width:${p}%"></i></div><div class="caption">${p}%</div></div>`; } },
    { k: 'ev', label: 'Evaluasi', sort: false, fmt: r => lz(evStatusOf(r.id)) },
    { k: 'x', label: '', sort: false, fmt: r => `<button class="btn btn-sm" data-as="${r.id}">Atur pembimbing</button>` }],
  after: h => $$('[data-as]', h).forEach(b => b.onclick = () => {
    const p = PKL.find(x => x.id == b.dataset.as);
    openModal('Atur Pembimbing — ' + p.nama, `<div class="field"><label class="lbl" for="aDiv">Divisi</label><select class="input" id="aDiv">${['Engineering', 'Design', 'QA'].map(d => `<option ${p.divisi === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div><div class="field"><label class="lbl" for="aPb">Pembimbing</label><select class="input" id="aPb">${EMP.filter(e => e.tipe === 'Tetap').map(e => `<option ${p.pembimbing === e.nama ? 'selected' : ''}>${esc(e.nama)}</option>`).join('')}</select></div>`, '<button class="btn btn-primary" id="mSave">Simpan</button>');
    $('#mSave').onclick = () => { p.divisi = $('#aDiv').value; p.pembimbing = $('#aPb').value; audit('Ubah', 'Pembimbing PKL', p.nama); toast('Pembimbing diperbarui', 'success'); closeModal(); paintAll(); };
  })
})}</div>`, () => paintAll());

/* ===== Evaluasi PKL (PKL-12, PKL-17 s/d PKL-22) =====
   Alur: peserta mengajukan (penilaian diri + refleksi) → pembimbing/HR menyetujui, mengubah nilai, atau meminta revisi.
   Nilai final = nilai pembimbing. */
let evState = { tab: 'Diajukan', school: 'ALL' };
const evScope = () => PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status) && (S.role !== 'pembimbing' || p.pembimbing === ME_PEMB));
const deltaChip = d => `<span class="ev-delta ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d > 0 ? '+' + d : d < 0 ? '−' + Math.abs(d) : 'sama'}</span>`;
function evTasks() {
  const rows = PKL.filter(p => EVALREQ[p.id]?.status === 'Diajukan' && canDecideEval(p)).map(p => `<div class="row">${av(p.nama)}<div style="flex:1"><b>${esc(p.nama)}</b><div class="caption">Evaluasi PKL · ${esc(p.instansi)}</div></div><a class="btn btn-sm" href="#evaluasi">Tinjau</a></div>`);
  if (S.role === 'pkl' && evCanSubmit(PKL.find(p => p.id === ME_PKL_ID))) rows.push(`<div class="row"><div style="flex:1"><b>Evaluasi PKL siap diajukan</b><div class="caption">Isi penilaian diri dan refleksi</div></div><a class="btn btn-sm btn-primary" href="#evaluasi_saya">Ajukan</a></div>`);
  return rows.join('');
}
function evDrawer(id) {
  const p = PKL.find(x => x.id === id), rq = EVALREQ[id]; if (!p || !rq) return;
  const decide = canDecideEval(p) && rq.status === 'Diajukan';
  const fin = rq.status === 'Disetujui' ? EVALS[id] : null;
  const init = fin || rq.self, selfN = weighted(rq.self);
  const crit = CRITERIA.map(c => {
    const v = init[c.k] ?? 75;
    return `<div class="ev-crit">
      <div class="row" style="justify-content:space-between;align-items:center">
        <b>${esc(c.k)} <span class="caption">(${c.w}%)</span></b>
        <span class="row" style="gap:6px"><span class="caption">Peserta: <b>${rq.self[c.k]}</b></span>${decide ? `<span id="evd-${sl(c.k)}"></span>` : fin ? deltaChip(fin[c.k] - rq.self[c.k]) : ''}</span>
      </div>
      ${decide ? `<div class="row" style="gap:10px;margin-top:6px"><input type="range" id="ev-${sl(c.k)}" min="0" max="100" value="${v}" style="flex:1;accent-color:var(--primary)" aria-label="Nilai pembimbing ${esc(c.k)}"><b id="ev-v-${sl(c.k)}" style="min-width:28px;text-align:right">${v}</b></div>`
        : fin ? `<div class="caption" style="margin-top:4px">Nilai pembimbing: <b>${fin[c.k]}</b></div>` : ''}
    </div>`;
  }).join('');
  const body = `
    <div class="person" style="margin-bottom:12px">${av(p.nama)}<div><div style="font-weight:600">${esc(p.nama)} ${lz(rq.status)}</div><div class="caption">${esc(p.instansi)} · ${esc(p.jurusan || '-')}</div><div class="caption">Divisi ${esc(p.divisi || '-')} · Pembimbing ${esc(p.pembimbing || '-')}</div></div></div>
    <dl class="kv"><dt>Periode</dt><dd>${fmtD(p.mulai)} – ${fmtD(p.selesai)}</dd><dt>Diajukan</dt><dd>${fmtD(rq.diajukan)}${rq.revisi ? ` · pengajuan ke-${rq.revisi + 1}` : ''}</dd></dl>
    ${rq.revisi && rq.status !== 'Disetujui' && rq.catatan ? `<div class="banner warn" style="margin-top:10px"><i class=fi-rr-triangle-warning></i> <span><b>Catatan revisi sebelumnya:</b> ${esc(rq.catatan)}</span></div>` : ''}
    <h4 style="margin:14px 0 6px">Refleksi peserta</h4><div class="ev-quote">${esc(rq.refleksi)}</div>
    <h4 style="margin:14px 0 2px">Penilaian per kriteria</h4>${crit}
    <div class="card card-b ev-score" style="margin:14px 0">
      <div><div class="caption">Nilai peserta</div><div class="num">${selfN}</div><div>${lz(predOf(selfN), predCls(selfN))}</div></div>
      <div><div class="caption">Nilai pembimbing</div><div class="num" id="evFinal" style="color:var(--primary)">${fin ? p.score : decide ? selfN : '—'}</div><div id="evGrade">${fin ? lz(predOf(p.score), predCls(p.score)) : ''}</div></div>
    </div>
    ${decide ? `<div class="field"><label class="lbl" for="evNote">Catatan untuk peserta <span class="caption">(wajib jika meminta revisi)</span></label><textarea class="input" id="evNote" rows="3" placeholder="Tuliskan umpan balik, rekomendasi, atau alasan revisi…"></textarea></div>`
      : rq.status === 'Disetujui' && rq.catatan ? `<h4 style="margin:0 0 6px">Catatan pembimbing</h4><div class="ev-quote">${esc(rq.catatan)}</div><div class="caption" style="margin-top:6px">Disetujui oleh ${esc(rq.oleh)} · ${fmtD(rq.disetujui)}</div>` : ''}
    ${!decide && rq.status === 'Diajukan' ? '<div class="banner info"><i class=fi-rr-eye></i> <span>Hanya HR Admin atau pembimbing peserta ini yang dapat memutuskan.</span></div>' : ''}`;
  const foot = decide ? '<button class="btn" id="evRev">Minta Revisi</button><button class="btn btn-success" id="evOk"><i class=fi-rr-check></i> <span id="evOkTxt">Setujui</span></button>'
    : rq.status === 'Disetujui' && S.role === 'hr' ? '<button class="btn" id="evClose">Tutup</button><button class="btn btn-primary" id="evCert">Buka Generator Sertifikat</button>' : '<button class="btn" id="evClose">Tutup</button>';
  openDrawer('Evaluasi — ' + p.nama, body, foot);
  const calcF = () => {
    const sc = Object.fromEntries(CRITERIA.map(c => [c.k, +$('#ev-' + sl(c.k)).value]));
    CRITERIA.forEach(c => { $('#ev-v-' + sl(c.k)).textContent = sc[c.k]; $('#evd-' + sl(c.k)).innerHTML = deltaChip(sc[c.k] - rq.self[c.k]); });
    const n = weighted(sc); $('#evFinal').textContent = n; $('#evGrade').innerHTML = lz(predOf(n), predCls(n));
    $('#evOkTxt').textContent = CRITERIA.some(c => sc[c.k] !== rq.self[c.k]) ? 'Ubah nilai & setujui' : 'Setujui';
    return sc;
  };
  if (decide) {
    $$('#drawerBody input[type=range]').forEach(r => r.oninput = calcF); calcF();
    $('#evOk').onclick = () => {
      const sc = calcF(), note = $('#evNote').value.trim(), changed = CRITERIA.some(c => sc[c.k] !== rq.self[c.k]);
      EVALS[id] = { ...sc, _note: note }; p.score = weighted(sc); p.evalNote = note;
      Object.assign(rq, { status: 'Disetujui', disetujui: iso(TODAY), oleh: ACTOR[S.role], catatan: note });
      audit(changed ? 'Ubah & Setujui' : 'Setujui', 'Evaluasi PKL', `${p.nama} — nilai peserta ${weighted(rq.self)}, nilai final ${p.score}`);
      toast(`Evaluasi ${esc(p.nama)} disetujui — nilai final ${p.score}. Notifikasi dikirim ke peserta.`, 'success');
      closeDrawer(); buildNav(); render();
    };
    $('#evRev').onclick = () => {
      const note = $('#evNote').value.trim();
      if (!note) { toast('Tulis catatan revisi untuk peserta terlebih dahulu', 'warn'); $('#evNote').focus(); return; }
      Object.assign(rq, { status: 'Revisi', catatan: note, revisi: (rq.revisi || 0) + 1 });
      audit('Minta Revisi', 'Evaluasi PKL', `${p.nama} — revisi ke-${rq.revisi}`);
      toast(`Permintaan revisi dikirim ke ${esc(p.nama)}`, 'info');
      closeDrawer(); buildNav(); render();
    };
  }
  if ($('#evCert')) $('#evCert').onclick = () => { closeDrawer(); location.hash = '#sertifikat'; };
  if ($('#evClose')) $('#evClose').onclick = closeDrawer;
}
reg('evaluasi', 'Evaluasi PKL', ['Manajemen PKL', 'Evaluasi'], () => {
  const scope = evScope(), cnt = k => scope.filter(p => evStatusOf(p.id) === k).length;
  const belum = scope.filter(p => p.status === 'Aktif' && evStatusOf(p.id) === 'Belum Diajukan').length;
  const schools = [...new Set(scope.map(p => p.instansi))].sort();
  if (evState.school !== 'ALL' && !schools.includes(evState.school)) evState.school = 'ALL';
  const viewOnly = !['hr', 'pembimbing'].includes(S.role);
  return `
  ${viewOnly ? '<div class="banner info"><i class=fi-rr-eye></i> <span>Mode lihat saja — hanya HR Admin dan pembimbing yang dapat menyetujui atau mengubah nilai.</span></div>' : ''}
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat warn"><div class="k">Menunggu persetujuan</div><div class="v">${cnt('Diajukan')}</div><div class="s muted">Sudah diajukan peserta</div></div>
    <div class="card stat inf"><div class="k">Perlu revisi</div><div class="v">${cnt('Revisi')}</div><div class="s muted">Menunggu pengajuan ulang</div></div>
    <div class="card stat ok"><div class="k">Disetujui</div><div class="v">${cnt('Disetujui')}</div><div class="s muted">Siap untuk sertifikat</div></div>
    <div class="card stat"><div class="k">Belum mengajukan</div><div class="v">${belum}</div><div class="s muted">Belum dapat dinilai</div></div>
  </div>
  <div class="banner info"><i class=fi-rr-info></i> <span>Peserta baru muncul di antrean ini setelah <b>mengajukan evaluasi</b> (penilaian diri + refleksi). Nilai final adalah nilai pembimbing.</span></div>
  <div class="tabs" id="evTabs">${[['Diajukan', 'Menunggu'], ['Revisi', 'Revisi'], ['Disetujui', 'Disetujui']].map(([k, l]) => `<button class="${evState.tab === k ? 'on' : ''}" data-t="${k}">${l} <span class="caption">(${cnt(k)})</span></button>`).join('')}</div>
  <div class="card">${table('evq', {
    rows: () => evScope().filter(p => evStatusOf(p.id) === evState.tab && (evState.school === 'ALL' || p.instansi === evState.school)).map(p => {
      const rq = EVALREQ[p.id]; return { id: p.id, nama: p.nama, jurusan: p.jurusan || '', instansi: p.instansi, divisi: p.divisi || '', pembimbing: p.pembimbing || '', diajukan: rq ? rq.diajukan : '', status: evStatusOf(p.id), revisi: rq ? rq.revisi || 0 : 0, nilaiDiri: rq ? weighted(rq.self) : null, nilaiFinal: p.score ?? null };
    }),
    toolbar: () => `<select class="input" id="evSchool" style="width:auto" aria-label="Filter instansi"><option value="ALL">Semua instansi</option>${schools.map(sc => `<option value="${esc(sc)}" ${evState.school === sc ? 'selected' : ''}>${esc(sc)}</option>`).join('')}</select>`,
    onRow: id => evDrawer(id),
    cols: [
      { k: 'nama', label: 'Peserta', fmt: r => person(r.nama, r.jurusan) },
      { k: 'instansi', label: 'Instansi' },
      { k: 'divisi', label: 'Divisi / Pembimbing', fmt: r => `${esc(r.divisi || '-')}<div class="caption">${esc(r.pembimbing || '-')}</div>` },
      { k: 'diajukan', label: 'Diajukan', fmt: r => r.diajukan ? fmtD(r.diajukan) : '—' },
      { k: 'nilaiDiri', label: 'Nilai peserta', cls: 'r num', fmt: r => r.nilaiDiri ?? '—' },
      { k: 'nilaiFinal', label: 'Nilai final', cls: 'r num', fmt: r => r.nilaiFinal != null && r.status === 'Disetujui' ? `<b>${r.nilaiFinal}</b>` : '—' },
      { k: 'status', label: 'Status', fmt: r => lz(r.status) + (r.revisi && r.status !== 'Disetujui' ? `<div class="caption">revisi ke-${r.revisi}</div>` : '') },
      { k: 'x', label: '', sort: false, fmt: r => `<button class="btn btn-sm ${r.status === 'Diajukan' && canDecideEval(PKL.find(p => p.id === r.id)) ? 'btn-primary' : ''}" data-ev="${r.id}">${r.status === 'Diajukan' && canDecideEval(PKL.find(p => p.id === r.id)) ? 'Tinjau' : 'Lihat'}</button>` }
    ],
    after: h => {
      const sel = $('#evSchool', h); if (sel) sel.onchange = () => { evState.school = sel.value; paintTable('evq'); };
      $$('[data-ev]', h).forEach(bt => bt.onclick = () => evDrawer(+bt.dataset.ev));
    }
  })}</div>`;
}, () => {
  $$('#evTabs button').forEach(bt => bt.onclick = () => { evState.tab = bt.dataset.t; render(); });
  paintAll();
});

/* ===== Evaluasi Saya (khusus Peserta PKL — PKL-17, PKL-20) ===== */
reg('evaluasi_saya', 'Evaluasi Saya', ['Manajemen PKL', 'Evaluasi Saya'], () => {
  const p = PKL.find(x => x.id === ME_PKL_ID), rq = EVALREQ[p.id], st = evStatusOf(p.id), prog = progressOf(p), th = S.settings.evalThreshold;
  const open = st === 'Belum Diajukan' || st === 'Revisi', can = evCanSubmit(p), cert = CERTS.find(c => c.placement === p.id);
  const head = `<div class="card card-b" style="margin-bottom:16px"><div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div class="person">${av(p.nama)}<div><div style="font-weight:600">${esc(p.nama)} ${lz(st)}</div><div class="caption">${esc(p.instansi)} · ${esc(p.jurusan || '-')}</div><div class="caption">Divisi ${esc(p.divisi || '-')} · Pembimbing ${esc(p.pembimbing || '-')}</div></div></div>
    <div style="min-width:240px"><div class="caption">Periode PKL · ${fmtD(p.mulai)} – ${fmtD(p.selesai)}</div><div class="bar ${prog >= th ? 'ok' : ''}" style="margin:6px 0 4px"><i style="width:${prog}%"></i></div><div class="caption">Progres ${prog}% · pengajuan dibuka saat ≥ ${th}%</div></div></div></div>`;
  let note = '';
  if (st === 'Revisi') note = `<div class="banner danger"><i class=fi-rr-triangle-warning></i> <span><b>Pembimbing meminta revisi.</b> ${esc(rq.catatan || '')}</span></div>`;
  else if (st === 'Diajukan') note = `<div class="banner info"><i class=fi-rr-clock></i> <span>Evaluasi diajukan ${fmtD(rq.diajukan)} dan sedang ditinjau oleh <b>${esc(p.pembimbing)}</b>.</span></div>`;
  else if (st === 'Disetujui') note = `<div class="banner ok"><i class=fi-rr-check-circle></i> <span>Evaluasi disetujui oleh <b>${esc(rq.oleh)}</b> pada ${fmtD(rq.disetujui)}.</span></div>`;
  else if (!can) note = `<div class="banner warn"><i class=fi-rr-triangle-warning></i> <span>Pengajuan evaluasi dibuka saat progres periode PKL mencapai <b>${th}%</b>. Progres Anda saat ini <b>${prog}%</b>.</span></div>`;
  if (open) {
    const vals = rq?.self || {};
    const sliders = CRITERIA.map(c => { const v = vals[c.k] ?? 75; return `<div class="ev-crit"><div class="row" style="justify-content:space-between"><label class="lbl" for="es-${sl(c.k)}" style="margin:0"><b>${esc(c.k)}</b> <span class="caption">(${c.w}%)</span></label><b id="es-v-${sl(c.k)}">${v}</b></div><input type="range" id="es-${sl(c.k)}" min="0" max="100" value="${v}" ${can ? '' : 'disabled'} style="width:100%;accent-color:var(--primary)"></div>`; }).join('');
    return `${head}${note}<div class="grid g-main">
      <div class="card"><div class="card-h"><h3>Penilaian diri</h3><span class="caption">Skala 0 – 100</span></div><div class="card-b">${sliders}
        <div class="field" style="margin-top:14px"><label class="lbl" for="esRef">Refleksi <span class="caption">(minimal 20 karakter)</span></label><textarea class="input" id="esRef" rows="4" ${can ? '' : 'disabled'} placeholder="Ceritakan apa yang Anda kerjakan, pelajari, dan ingin tingkatkan selama PKL…">${esc(rq?.refleksi || '')}</textarea></div>
        <button class="btn btn-primary" id="esSubmit" style="margin-top:12px" ${can ? '' : 'disabled'}>${st === 'Revisi' ? 'Ajukan Ulang Evaluasi' : 'Ajukan Evaluasi'}</button></div></div>
      <div class="card"><div class="card-h"><h3>Perkiraan nilai diri</h3></div><div class="card-b" style="text-align:center"><div class="num" id="esTotal" style="font-size:48px;font-weight:700;color:var(--primary);line-height:1">0</div><div id="esGrade" style="margin:10px 0"></div>
        <div class="caption">Bobot: ${CRITERIA.map(c => `${c.k} ${c.w}%`).join(' · ')}<br>Nilai final ditentukan oleh pembimbing.</div></div></div></div>`;
  }
  if (st === 'Diajukan') {
    return `${head}${note}<div class="card"><div class="card-h"><h3>Pengajuan Anda</h3></div><div class="card-b"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kompetensi</th><th class="r">Bobot</th><th class="r">Nilai diri</th></tr></thead><tbody>${CRITERIA.map(c => `<tr><td>${esc(c.k)}</td><td class="r">${c.w}%</td><td class="r num">${rq.self[c.k]}</td></tr>`).join('')}<tr><th colspan="2">Nilai diri</th><th class="r num">${weighted(rq.self)}</th></tr></tbody></table></div>
      <h4 style="margin:14px 0 6px">Refleksi</h4><div class="ev-quote">${esc(rq.refleksi)}</div></div></div>`;
  }
  const fin = EVALS[p.id], n = p.score ?? weighted(fin || {});
  return `${head}${note}<div class="card"><div class="card-h"><h3>Hasil evaluasi</h3>${lz(predOf(n), predCls(n))}</div><div class="card-b"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kompetensi</th><th class="r">Bobot</th><th class="r">Nilai diri</th><th class="r">Nilai final</th></tr></thead><tbody>${CRITERIA.map(c => `<tr><td>${esc(c.k)}</td><td class="r">${c.w}%</td><td class="r num">${rq.self[c.k]}</td><td class="r num"><b>${fin?.[c.k] ?? '-'}</b></td></tr>`).join('')}<tr><th colspan="2">Nilai akhir</th><th class="r num">${weighted(rq.self)}</th><th class="r num">${n}</th></tr></tbody></table></div>
    ${rq.catatan ? `<h4 style="margin:14px 0 6px">Catatan pembimbing</h4><div class="ev-quote">${esc(rq.catatan)}</div>` : ''}
    <div class="banner ${cert ? 'ok' : 'info'}" style="margin:14px 0 0"><i class=fi-rr-medal></i> <span>${cert ? `Sertifikat telah terbit: <b>${esc(cert.no)}</b> (${cert.tampil ? 'dengan nilai' : 'tanpa nilai'}).` : 'Sertifikat akan diterbitkan oleh HR Admin.'}</span></div></div></div>`;
}, () => {
  if (!$('#esSubmit')) return;
  const p = PKL.find(x => x.id === ME_PKL_ID);
  const upd = () => {
    const sc = Object.fromEntries(CRITERIA.map(c => [c.k, +$('#es-' + sl(c.k)).value]));
    CRITERIA.forEach(c => { $('#es-v-' + sl(c.k)).textContent = sc[c.k]; });
    const n = weighted(sc); $('#esTotal').textContent = n; $('#esGrade').innerHTML = lz(predOf(n), predCls(n));
    return sc;
  };
  $$('input[type=range]').forEach(r => r.oninput = upd); upd();
  $('#esSubmit').onclick = () => {
    if (!evCanSubmit(p)) { toast('Pengajuan belum dibuka untuk Anda', 'warn'); return; }
    const refleksi = $('#esRef').value.trim();
    if (refleksi.length < 20) { toast('Tulis refleksi minimal 20 karakter', 'warn'); $('#esRef').focus(); return; }
    const self = upd(), prev = EVALREQ[p.id];
    EVALREQ[p.id] = { status: 'Diajukan', diajukan: iso(TODAY), self, refleksi, revisi: prev?.revisi || 0, catatan: prev?.catatan };
    audit('Ajukan', 'Evaluasi PKL', `${p.nama} — nilai diri ${weighted(self)}`);
    toast(`Evaluasi diajukan. Notifikasi dikirim ke pembimbing (${esc(p.pembimbing)}).`, 'success');
    buildNav(); render();
  };
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
    <div class="field"><label class="lbl" for="cPes">Peserta</label><select class="input" id="cPes">${PKL.filter(p => ['Aktif', 'Selesai'].includes(p.status)).map(p => `<option value="${p.id}">${esc(p.nama)} — ${esc(p.instansi)} · Evaluasi: ${evStatusOf(p.id)}</option>`).join('')}</select></div>
    <div class="row field" style="justify-content:space-between;padding:10px;border:1px solid var(--border);border-radius:8px"><div><b>Transkrip Nilai</b><div class="caption" id="tgDesc"></div></div><label class="switch"><input type="checkbox" id="tgGrades" checked aria-label="Toggle transkrip nilai"><span></span></label></div>
    <div id="certPrev"></div></div>
    <div class="drawer-foot" style="justify-content:flex-end"><button class="btn btn-primary" id="certIssue">Terbitkan Sertifikat</button></div></div>
  <div class="card"><div class="card-h"><h3>Riwayat dokumen terbit</h3></div><div class="card-b stack" id="certHist"></div></div></div>`, () => {
  const draw = () => {
    const p = PKL.find(x => x.id == $('#cPes').value), g = $('#tgGrades').checked;
    $('#tgDesc').textContent = g ? 'ON — sertifikat depan-belakang (nilai kompetensi)' : 'OFF — hanya keterangan menyelesaikan PKL';
    const blocked = g && evStatusOf(p.id) !== 'Disetujui';
    $('#certPrev').innerHTML = (blocked ? `<div class="banner danger"><i class=fi-rr-cross-circle></i> <span>Evaluasi berstatus <b>${evStatusOf(p.id)}</b>. Sertifikat dengan Transkrip Nilai hanya dapat diterbitkan setelah evaluasi <b>Disetujui</b>. Matikan toggle untuk menerbitkan tanpa nilai.</span></div>` : '') + certHTML(p, g, 'PRATINJAU');
    $('#certIssue').disabled = blocked;
  };
  const hist = () => $('#certHist').innerHTML = CERTS.map(c => `<div class="row"><span style="font-size:22px"><i class=fi-rr-medal></i></span><div style="flex:1"><b>${esc(c.nama)}</b><div class="caption">${c.no} · ${fmtD(c.tgl)} · ${c.tampil ? 'dengan nilai' : 'tanpa nilai'}</div></div><button class="btn btn-sm" data-v="${c.no}">Verifikasi QR</button></div>`).join('') || '<span class="muted">Belum ada.</span>';
  $('#cPes').onchange = draw; $('#tgGrades').onchange = draw; draw(); hist();
  $('#certIssue').onclick = () => {
    const p = PKL.find(x => x.id == $('#cPes').value), g = $('#tgGrades').checked;
    if (g && evStatusOf(p.id) !== 'Disetujui') { toast('Evaluasi belum disetujui — sertifikat dengan nilai tidak dapat diterbitkan', 'error'); return; }
    const no = `CERT/ASTA/${TODAY.getFullYear()}/${String(S.settings.certNo++).padStart(3, '0')}`;
    CERTS.unshift({ no, placement: p.id, nama: p.nama, tampil: g, tgl: iso(TODAY), token: Math.random().toString(36).slice(2, 8) });
    audit('Terbitkan', 'Sertifikat PKL', `${no} — ${p.nama}`); toast('Sertifikat ' + no + ' diterbitkan', 'success'); hist();
  };
  $('#certHist').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const c = CERTS.find(x => x.no === b.dataset.v); openModal('Verifikasi Sertifikat', `<div class="banner ok"><i class=fi-rr-check-circle></i> <span><b>Sertifikat asli.</b> ${esc(c.no)} diterbitkan untuk <b>${esc(c.nama)}</b> pada ${fmtD(c.tgl)}.</span></div>`); };
});
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
reg('laporan', 'Laporan SDM', ['Laporan'], () => {
  const bars = [92, 88, 95, 90, 86, 93];
  return `<div class="grid g4" style="margin-bottom:16px"><div class="card stat ok"><div class="k">Adopsi harian</div><div class="v">92%</div><div class="s up">Target ≥ 90%</div></div><div class="card stat"><div class="k">Waktu presensi</div><div class="v">7 dtk</div><div class="s up">Target ≤ 10 dtk</div></div><div class="card stat inf"><div class="k">Proses PKL</div><div class="v">4 mnt</div><div class="s up">Target &lt; 5 menit</div></div><div class="card stat warn"><div class="k">Retensi Talenta</div><div class="v">98,2%</div><div class="s up">Target ≥ 95%</div></div></div>
  <div class="grid g2"><div class="card"><div class="card-h"><h3>Kehadiran 6 bulan terakhir (%)</h3></div><div class="card-b"><div class="chart">${bars.map((b, i) => `<div class="c"><span class="num">${b}</span><i style="height:${b}%"></i><span>${BULAN[(TODAY.getMonth() - 5 + i + 12) % 12].slice(0, 3)}</span></div>`).join('')}</div></div></div>
  <div class="card"><div class="card-h"><h3>Komposisi pekerja</h3></div><div class="card-b stack">${['Tetap', 'Freelance', 'PKL'].map(t => { const n = EMP.filter(e => e.tipe === t).length, p = Math.round(n / EMP.length * 100); return `<div><div class="row"><b>${t}</b><span class="spacer"></span><span class="num caption">${n} orang · ${p}%</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`; }).join('')}
  <button class="btn" id="repExp"><i class=fi-rr-download></i> Ekspor laporan SDM</button></div></div></div>`;
}, () => { $('#repExp') && ($('#repExp').onclick = () => toast('Laporan SDM diekspor', 'success')); });

/* ===== Pengaturan ===== */
let setTab = 'lokasi';
reg('pengaturan', 'Pengaturan', ['Pengaturan'], () => `
  <div class="tabs" id="setTabs">${[['lokasi', 'Lokasi & Jaringan'], ['kebijakan', 'Kebijakan Lembur'], ['pkl', 'PKL'], ['role', 'Role & Permission SDM'], ['integrasi', 'Integrasi'], ['audit', 'Audit Log']].map(([k, l]) => `<button class="${k === setTab ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}</div>
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
      if (setTab === 'pkl') { s.quotaMax = Math.max(1, +$('#sQ').value); s.pkgRule = $('#sScope').value; s.autoReject = $('#sAuto').checked; s.signer = $('#sSign').value; s.evalThreshold = Math.min(100, Math.max(0, +$('#sEval').value)); }
    });
  };
  $$('#setTabs button').forEach(b => b.onclick = () => { setTab = b.dataset.t; draw(); }); draw();
});

/* ===== Profil ===== */
reg('profil', 'Profil Pengguna', ['Profil Pengguna'], () => {
  const u = { hr: ['Rina Anggraini', 'HR Admin'], manager: ['Bagas Prakoso', 'Manajer / Team Lead'], employee: ['Dewi Lestari', 'Karyawan Tetap'], finance: ['Finance Team', 'Super Admin / Finance'] }[S.role];
  return `<div class="grid g2"><div class="card card-b"><div class="person" style="margin-bottom:16px"><span class="av" style="width:56px;height:56px;font-size:18px;background:${colorOf(u[0])}">${initials(u[0])}</span><div><h2>${u[0]}</h2><div class="muted">${u[1]}</div></div></div>
  <dl class="kv"><dt>Email</dt><dd>${u[2]}</dd><dt>Bahasa</dt><dd>Bahasa Indonesia</dd><dt>Status Akun</dt><dd>${lz('Aktif', 'success')}</dd><dt>Skema SDM</dt><dd>${S.role === 'freelance' ? '<span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:600">Freelance (Fee Per Project)</span>' : 'Pegawai Standar'}</dd></dl>
  ${S.role === 'freelance' ? `
    <div style="margin-top:16px;padding-top:12px;border-top:1px dashed var(--border)">
      <div style="font-size:12px;font-weight:700;color:#166534;margin-bottom:6px">Penugasan Proyek Aktif:</div>
      ${(empFL?.projects || []).map(p => `
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:12px">
          <div class="row" style="justify-content:space-between"><b>${esc(p.nama)}</b><span style="font-weight:700;color:#16A34A">${rp(p.fee)}</span></div>
          <div class="caption" style="color:#64748B">${esc(p.deliverables)} · Progres: <b>${p.progres}%</b> (${esc(p.status)})</div>
        </div>
      `).join('')}
    </div>
  ` : ''}
  </div>
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
  Object.keys(TBL).forEach(k => { if (!['rekap', 'emp', 'jobs', 'pkl', 'act', 'audit', 'workload'].includes(k)) delete TBL[k]; });
  $('#view').innerHTML = r.render(id);
  buildNav();
  $$('#hrSubnav .crm-subnav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === id);
  });
  r.after && r.after();
  bindActions(id);
  clearInterval(clockT);
  const ck = () => { const c = $('#clock'); if (c) { const n = new Date(); c.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`; } };
  ck(); clockT = setInterval(ck, 1000);
}
function bindActions(id) {
  const on = (sel, fn) => { const e = $(sel); if (e) e.onclick = fn; };
  on('#btnAddEmp', () => openEmpModal());
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
  $$('[data-c]').forEach(b => b.onclick = () => { closeModal(); location.hash = b.dataset.c; setTimeout(() => { if (b.dataset.c === 'karyawan') openEmpModal(); if (b.dataset.c === 'lowongan') $('#btnAddJob')?.click(); if (b.dataset.c === 'pengajuan') publicPklForm(); }, 50); });
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
