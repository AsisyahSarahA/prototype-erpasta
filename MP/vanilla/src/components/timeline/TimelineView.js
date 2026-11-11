/**
 * TimelineView.js — Vanilla ES Module
 * ASTACODE PM — GANTT & ROADMAP VISUAL REDESIGN
 * 
 * Spesifikasi & Kesesuaian Desain (Sesuai REDESAIN_ROADMAP&GANT.MD):
 * 1. Struktur Layout Utama:
 *    - Left Panel: Work Item List (320px desktop), Nama Epic (text truncation + tooltip), Kode Epic,
 *      Flat Lucide icons, Expand/Collapse, Actual Progress Indicator, Child Tasks berindentasi, Status Badge,
 *      dan Tombol '+ Create Epic' di bagian bawah.
 *    - Right Panel: Sticky Calendar Header (Bulan & Tahun), Baris Sprints, Baris Releases (milestones marker),
 *      Gantt Bars, Curved SVG Dependency Lines, Today Indicator, serta horizontal scroll mandiri dengan vertical scroll sinkron.
 * 2. Baris Sprint & Releases Terpisah:
 *    - Sprints: Menampilkan nama Sprint, tanggal mulai/selesai, status, dan indikator ACTIVE.
 *    - Releases: Menampilkan milestone Official Release, Beta Release, dan UAT sebagai marker pada tanggal tertentu. Klik marker membuka detail Release.
 * 3. Status Color System (WAJIB):
 *    - Backlog: #94A3B8 | To Do: #3B82F6 | In Progress: #F59E0B | In Review: #8B5CF6 | Testing / QA: #06B6D4
 *    - Blocked: #EF4444 | On Hold: #64748B | Reopened: #F97316 | Done: #22C55E | Cancelled: #6B7280
 *    - Nol gradient (flat enterprise), border radius 5-6px, warning indicator pada pekerjaan terlambat/Blocked.
 *    - Warna ungu #4F46E5 hanya untuk identitas brand dan navigasi aktif.
 * 4. Dependency Lines:
 *    - SVG curved cubic bezier connector (#94A3B8, stroke-width 1.8px). Highlight #4F46E5 saat hover/pilih item.
 * 5. Controls Toolbar:
 *    - Previous, Next, Today, Weeks, Months (default), Quarters, Zoom In, Zoom Out, Fullscreen, Info.
 * 6. Interaksi Lengkap & localStorage:
 *    - Create, Edit, Delete Epic dengan modal interaktif ASTACODE PM.
 *    - Sinkronisasi dan penyimpanan perubahan ke localStorage.
 * 7. Nol Emoji — 100% Menggunakan Lucide Flat SVG Icons.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

// =============================================================================
// SISTEM WARNA STATUS WAJIB (SESUAI DOKUMEN REDESAIN_ROADMAP&GANT.MD)
// =============================================================================
export const STATUS_CONFIG = {
  'Backlog': { label: 'Backlog', barColor: '#94A3B8', softBg: '#F1F5F9', textColor: '#334155', className: 'tl-status--backlog' },
  'To Do': { label: 'To Do', barColor: '#3B82F6', softBg: '#EFF6FF', textColor: '#1E40AF', className: 'tl-status--todo' },
  'In Development': { label: 'In Development', barColor: '#6366F1', softBg: '#EEF2FF', textColor: '#4338CA', className: 'tl-status--in-dev' },
  'In Progress': { label: 'In Development', barColor: '#6366F1', softBg: '#EEF2FF', textColor: '#4338CA', className: 'tl-status--in-dev' },
  'Review & Testing': { label: 'Review & Testing', barColor: '#F59E0B', softBg: '#FFFBEB', textColor: '#92400E', className: 'tl-status--review-testing' },
  'In Review': { label: 'Review & Testing', barColor: '#F59E0B', softBg: '#FFFBEB', textColor: '#92400E', className: 'tl-status--review-testing' },
  'Testing / QA': { label: 'Review & Testing', barColor: '#F59E0B', softBg: '#FFFBEB', textColor: '#92400E', className: 'tl-status--review-testing' },
  'Done': { label: 'Done', barColor: '#22C55E', softBg: '#F0FDF4', textColor: '#166534', className: 'tl-status--done' },
  'Rejected': { label: 'Rejected', barColor: '#EF4444', softBg: '#FEF2F2', textColor: '#991B1B', className: 'tl-status--rejected' },
  'Blocked': { label: 'Blocked', barColor: '#EF4444', softBg: '#FEF2F2', textColor: '#991B1B', className: 'tl-status--blocked' },
  'On Hold': { label: 'On Hold', barColor: '#64748B', softBg: '#F1F5F9', textColor: '#334155', className: 'tl-status--on-hold' },
  'Reopened': { label: 'Reopened', barColor: '#F97316', softBg: '#FFF7ED', textColor: '#9A3412', className: 'tl-status--reopened' },
  'Cancelled': { label: 'Cancelled', barColor: '#6B7280', softBg: '#F3F4F6', textColor: '#374151', className: 'tl-status--cancelled' }
};

export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'Backlog';
  const s = String(rawStatus).trim().toLowerCase();
  if (s === 'done' || s === 'selesai' || s === 'completed') return 'Done';
  if (s === 'review & testing' || s === 'review' || s === 'in review' || s === 'review pr' || s === 'qa' || s === 'testing' || s === 'testing / qa' || s === 'qa/testing' || s === 'menunggu persetujuan' || s === 'deploy staging' || s === 'disetujui') return 'Review & Testing';
  if (s === 'in development' || s === 'in progress' || s === 'sedang dikerjakan' || s === 'dianalisis' || s === 'diperbaiki agen' || s === 'perlu manual') return 'In Development';
  if (s === 'to do' || s === 'todo' || s === 'baru') return 'To Do';
  if (s === 'rejected' || s === 'ditolak' || s === 'batal' || s === 'cancelled' || s === 'dibatalkan') return 'Rejected';
  if (s === 'blocked' || s === 'kendala' || s === 'terkendala') return 'Blocked';
  if (s === 'on hold' || s === 'tertunda') return 'On Hold';
  if (s === 'reopened' || s === 'dibuka kembali') return 'Reopened';
  return 'Backlog';
}

export function getTaskProgress(task) {
  if (!task) return 0;
  const norm = normalizeStatus(task.status);
  if (norm === 'Done') return 100;
  if (norm === 'Rejected' || norm === 'Cancelled') return 0;
  if (norm === 'Backlog') return 0;
  if (norm === 'To Do') return 15;

  const subtasks = task.subtasks || [];
  if (subtasks.length > 0) {
    const doneSub = subtasks.filter(s => s.completed).length;
    const subPct = Math.round((doneSub / subtasks.length) * 100);
    if (norm === 'Review & Testing') return Math.max(80, subPct);
    if (norm === 'In Development') return Math.max(30, Math.min(85, subPct));
    return subPct;
  }

  if (norm === 'Review & Testing') return 85;
  if (norm === 'In Development') return 55;
  return 0;
}

export function getSprintShortLabel(sprintName, sprintIdx = 0) {
  if (!sprintName) return `Sprint ${sprintIdx + 1}`;
  const match = sprintName.match(/(?:Sprint|Siklus|Iterasi)\s*\d+/i);
  if (match) return match[0];
  const colonIdx = sprintName.indexOf(':');
  if (colonIdx > 0 && colonIdx < 16) return sprintName.substring(0, colonIdx).trim();
  return `Sprint ${sprintIdx + 1}`;
}

export function getSprintStatusInfo(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'active' || s === 'aktif') {
    return {
      label: 'Aktif',
      badgeClass: 'tl-sprint-status-tag--active',
      markerClass: 'tl-sprint-marker--active',
      isActive: true
    };
  }
  if (s === 'completed' || s === 'selesai' || s === 'done') {
    return {
      label: 'Selesai',
      badgeClass: 'tl-sprint-status-tag--completed',
      markerClass: 'tl-sprint-marker--completed',
      isCompleted: true
    };
  }
  return {
    label: 'Rencana',
    badgeClass: 'tl-sprint-status-tag--future',
    markerClass: 'tl-sprint-marker--future',
    isFuture: true
  };
}

const LOCAL_STORAGE_RELEASES_KEY = 'astacode_pm_timeline_releases';
const LOCAL_STORAGE_EPICS_KEY = 'astacode_pm_timeline_epics';

export class TimelineView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'timeline-view';

    this.searchQuery = '';
    this.statusFilter = 'all';
    this.selectedSprintFilter = null;

    // State expand/collapse per epik
    this.expandedEpics = {};

    // Zoom level ('weeks' | 'months' | 'quarters')
    this.zoomMode = 'months';
    this.zoomLevel = 1.0; // 0.8 to 1.5

    // Simulated smooth live progress ticker for active In-Progress items (tanpa gradient)
    this.liveProgress = 62;
    this.liveTimer = null;
    this.unsubscribe = null;

    // Active Modal State ('create_epic' | 'edit_epic' | 'release_detail' | 'delete_epic' | null)
    this.activeModal = null;
    this.modalData = null;

    // Load releases from localStorage or initialize defaults
    this.releases = this.loadReleases();

    // Hydrate epics from localStorage if available
    this.hydrateEpicsFromStorage();

    this.init();
  }

  loadReleases() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(LOCAL_STORAGE_RELEASES_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Gagal memuat releases dari localStorage:', e);
    }

    // Default releases untuk proyek awal
    return [
      {
        id: 'rel-lib-beta',
        projectId: 'proj-perpustakaan',
        name: 'Beta 03',
        type: 'beta',
        targetDate: '2026-10-28',
        status: 'Done',
        deliverables: ['Microservice Katalog Buku (LIB-DIG-EPIC-1)', 'Portal OPAC React (LIB-DIG-EPIC-2)'],
        description: 'Rilis versi Beta untuk internal testing staf perpustakaan dan validasi skema database katalog.'
      },
      {
        id: 'rel-lib-official',
        projectId: 'proj-perpustakaan',
        name: 'Official 01',
        type: 'official',
        targetDate: '2026-11-10',
        status: 'In Progress',
        deliverables: ['Sirkulasi Peminjaman (LIB-DIG-EPIC-3)', 'Meja Kasir & Barcode (LIB-DIG-EPIC-4)', 'Docker Traefik Gateway (LIB-DIG-EPIC-5)'],
        description: 'Rilis resmi modul transaksi sirkulasi dan meja layanan kasir perpustakaan digital.'
      },
      {
        id: 'rel-lib-uat',
        projectId: 'proj-perpustakaan',
        name: 'UAT Sign-Off',
        type: 'uat',
        targetDate: '2026-11-20',
        status: 'To Do',
        deliverables: ['Stress Test K6 2000 RPS (LIB-DIG-EPIC-6)', 'Berita Acara UAT Stakeholder (LIB-DIG-EPIC-7)'],
        description: 'Sign-off final pengujian UAT bersama Kepala Perpustakaan Universitas Nusantara Cendekia.'
      }
    ];
  }

  saveReleases() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_RELEASES_KEY, JSON.stringify(this.releases));
      }
    } catch (e) {
      console.warn('Gagal menyimpan releases ke localStorage:', e);
    }
  }

  hydrateEpicsFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(LOCAL_STORAGE_EPICS_KEY);
        if (saved) {
          const epics = JSON.parse(saved);
          if (Array.isArray(epics) && epics.length > 0) {
            store.setState({ epics });
          }
        }
      }
    } catch (e) {
      console.warn('Gagal memuat epics dari localStorage:', e);
    }
  }

  saveEpicsToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const { epics } = store.getState();
        localStorage.setItem(LOCAL_STORAGE_EPICS_KEY, JSON.stringify(epics));
      }
    } catch (e) {
      console.warn('Gagal menyimpan epics ke localStorage:', e);
    }
  }

  init() {
    // Default expand the 2nd epic or the first epic with in-progress tasks
    const activeProj = store.getActiveProject();
    const epics = store.getState().epics.filter(e => e.projectId === activeProj?.id);
    if (epics.length > 1) {
      this.expandedEpics[epics[1].id] = true;
    } else if (epics.length > 0) {
      this.expandedEpics[epics[0].id] = true;
    }

    this.render();

    this.unsubscribe = store.subscribe(() => {
      this.render();
    });

    this.startLiveTicker();
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (this.liveTimer) clearInterval(this.liveTimer);
    if (this.unsubscribe) this.unsubscribe();
  }

  /**
   * Menggerakkan progress bar secara real-time untuk task/epik yang berstatus 'In Progress'
   * Memberikan efek visual dinamis tanpa menggunakan gradient
   */
  startLiveTicker() {
    if (this.liveTimer) clearInterval(this.liveTimer);

    this.liveTimer = setInterval(() => {
      this.liveProgress += 0.4;
      if (this.liveProgress > 85) {
        this.liveProgress = 55;
      }

      // Update elemen progress bar yang aktif di DOM tanpa re-render berkedip
      const runningBars = this.container.querySelectorAll('.tl-gantt-progress-fill.progress-running');
      runningBars.forEach(bar => {
        bar.style.width = `${this.liveProgress}%`;
      });

      const runningBadges = this.container.querySelectorAll('.tl-bar-running-pct');
      runningBadges.forEach(badge => {
        badge.textContent = `${Math.round(this.liveProgress)}%`;
      });

      // Update segmen In Progress pada progress bar di work item list
      const runningSegs = this.container.querySelectorAll('.tl-epic-progress-fill.in-progress-running');
      runningSegs.forEach(seg => {
        seg.style.width = `${this.liveProgress}%`;
      });
    }, 1400);
  }

  /**
   * Menghitung posisi left (%) dan width (%) bar berdasarkan rentang tanggal
   */
  calculateBarPosition(startDateStr, dueDateStr, fallbackStart = 5, fallbackSpan = 14) {
    const timelineStart = this.timelineStart || new Date(2026, 9, 1);
    const totalDays = this.totalDays || 90;

    const parseToDayIdx = (dStr, fallback) => {
      if (!dStr) return fallback;
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return fallback;
      const diff = Math.round((d.getTime() - timelineStart.getTime()) / 86400000);
      return Math.max(0, Math.min(totalDays - 1, diff));
    };

    const startIdx = parseToDayIdx(startDateStr, fallbackStart);
    const endIdx = parseToDayIdx(dueDateStr, Math.min(totalDays - 1, startIdx + fallbackSpan));
    const spanDays = Math.max(3, endIdx - startIdx + 1);

    const leftPercent = (startIdx / totalDays) * 100;
    // Berikan lebar minimum 8.5% agar bar selalu proporsional dan teks dapat dibaca dengan jelas
    const widthPercent = Math.max(8.5, (spanDays / totalDays) * 100);

    return {
      left: `${Math.min(90, Math.max(0, leftPercent))}%`,
      width: `${Math.min(98 - leftPercent, widthPercent)}%`,
      spanDays,
      startIdx,
      endIdx
    };
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const currentProjectId = activeProject ? activeProject.id : state.selectedProjectId;

    const { tasks, epics, sprints } = state;
    const projectTasks = tasks.filter(t => t.projectId === currentProjectId);
    const currentEpics = epics.filter(e => e.projectId === currentProjectId);
    const projectSprints = (sprints || []).filter(s => s.projectId === currentProjectId);
    const projectReleases = this.releases.filter(r => r.projectId === currentProjectId);
    const projectCode = activeProject?.code || 'PRJ';

    // 0. Active Sprint Filter (sinkron dengan store atau komponen internal)
    const activeSprintFilter = (this.selectedSprintFilter && this.selectedSprintFilter !== 'all')
      ? this.selectedSprintFilter
      : (state.filterSprint && state.filterSprint !== 'all' ? state.filterSprint : null);

    // 1. Filter tasks berdasarkan pencarian, status, dan sprint terpilih
    const filteredTasks = projectTasks.filter(task => {
      if (activeSprintFilter && activeSprintFilter !== 'backlog_pool') {
        if (task.sprintId !== activeSprintFilter) return false;
      } else if (activeSprintFilter === 'backlog_pool') {
        if (task.sprintId) return false;
      }
      if (this.statusFilter !== 'all') {
        const norm = normalizeStatus(task.status);
        if ((this.statusFilter === 'in_dev' || this.statusFilter === 'in_progress') && norm !== 'In Development' && norm !== 'In Progress') return false;
        if ((this.statusFilter === 'review' || this.statusFilter === 'qa') && norm !== 'Review & Testing' && norm !== 'Testing / QA' && norm !== 'In Review') return false;
        if (this.statusFilter === 'done' && norm !== 'Done') return false;
        if (this.statusFilter === 'todo' && norm !== 'To Do') return false;
        if (this.statusFilter === 'backlog' && norm !== 'Backlog') return false;
        if (this.statusFilter === 'rejected' && norm !== 'Rejected') return false;
        if (this.statusFilter === 'blocked' && norm !== 'Blocked') return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchKey = (task.key || '').toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }
      return true;
    });

    // Visible Epics (Epik yang memiliki task pada sprint terpilih, atau seluruh epik jika tanpa filter sprint)
    const visibleEpics = activeSprintFilter
      ? currentEpics.filter(e => filteredTasks.some(t => t.epicId === e.id))
      : currentEpics;

    if (activeSprintFilter) {
      visibleEpics.forEach(e => {
        this.expandedEpics[e.id] = true;
      });
    }

    // 2. Perhitungan Statistik KPI (High-Signal Data untuk Kartu Metrik)
    const kpiTasks = activeSprintFilter ? filteredTasks : projectTasks;
    const totalTasksCount = kpiTasks.length;
    const completedTasksCount = kpiTasks.filter(t => normalizeStatus(t.status) === 'Done').length;
    const inDevOnlyCount = kpiTasks.filter(t => {
      const norm = normalizeStatus(t.status);
      return norm === 'In Development' || norm === 'In Progress';
    }).length;
    const reviewCount = kpiTasks.filter(t => {
      const norm = normalizeStatus(t.status);
      return norm === 'Review & Testing' || norm === 'In Review' || norm === 'Testing / QA';
    }).length;
    const inProgressCount = inDevOnlyCount + reviewCount;
    const todoCount = kpiTasks.filter(t => normalizeStatus(t.status) === 'To Do').length;
    const remainingTasksCount = Math.max(0, totalTasksCount - completedTasksCount);

    const totalEstimatedHours = kpiTasks.reduce((acc, t) => acc + (Number(t.estimateHours) || 0), 0);
    const totalLoggedHours = kpiTasks.reduce((acc, t) => acc + (Number(t.timeLoggedHours) || 0), 0);
    const remainingHours = Math.max(0, totalEstimatedHours - totalLoggedHours);
    const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Perhitungan deadline dan countdown sisa hari
    const rawDeadline = (activeProject?.targetDeadline && activeProject.targetDeadline < '2027-01-01')
      ? activeProject.targetDeadline
      : '2026-11-30';
    let formattedDeadline = rawDeadline;
    let daysRemaining = null;
    try {
      const parts = rawDeadline.split('-');
      if (parts.length === 3) {
        const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(dObj.getTime())) {
          const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          formattedDeadline = `${dObj.getDate()} ${monthShort[dObj.getMonth()]} ${dObj.getFullYear()}`;
          const todayMid = new Date();
          todayMid.setHours(0, 0, 0, 0);
          daysRemaining = Math.ceil((dObj.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
    } catch (e) {}

    // 3. Menghitung Rentang Tanggal Kalender Kanvas secara Dinamis dari Data Proyek Riil
    // Fokus pada jendela pengerjaan aktif (Active Work Window: 2-3 bulan) agar lebar bar proporsional dan enak dilihat
    const workTimestamps = [];

    // Kumpulkan tanggal dari tasks, epics, sprints, dan releases
    projectTasks.forEach(t => {
      if (t.startDate) workTimestamps.push(new Date(t.startDate).getTime());
      if (t.dueDate) workTimestamps.push(new Date(t.dueDate).getTime());
    });
    currentEpics.forEach(e => {
      if (e.startDate) workTimestamps.push(new Date(e.startDate).getTime());
      if (e.dueDate) workTimestamps.push(new Date(e.dueDate).getTime());
    });
    projectSprints.forEach(s => {
      if (s.startDate) workTimestamps.push(new Date(s.startDate).getTime());
      if (s.endDate) workTimestamps.push(new Date(s.endDate).getTime());
    });
    projectReleases.forEach(r => {
      if (r.targetDate) workTimestamps.push(new Date(r.targetDate).getTime());
    });

    const validWorkTs = workTimestamps.filter(ts => !isNaN(ts));
    const earliestWorkTs = validWorkTs.length > 0 ? Math.min(...validWorkTs) : new Date(2026, 9, 15).getTime();
    const latestWorkTs = validWorkTs.length > 0 ? Math.max(...validWorkTs) : new Date(2026, 11, 10).getTime();

    // Mulai kalender dari tanggal 1 di bulan dimulainya pekerjaan (misal 1 Oktober 2026)
    const dStart = new Date(earliestWorkTs);
    const timelineStart = new Date(dStart.getFullYear(), dStart.getMonth(), 1, 0, 0, 0);

    // Selesai kalender di akhir bulan setelah pekerjaan terakhir selesai (misal 31 Desember 2026)
    const dEnd = new Date(latestWorkTs);
    const timelineEnd = new Date(dEnd.getFullYear(), dEnd.getMonth() + 1, 0, 23, 59, 59);

    // Hitung total hari kalender yang proporsional (ideal 60-95 hari untuk 2-3 bulan)
    let baseDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / 86400000);
    baseDays = Math.max(60, Math.min(95, baseDays));

    // Sesuaikan totalDays berdasarkan zoomMode
    const totalDays = Math.round(baseDays / (this.zoomMode === 'weeks' ? 1.4 : this.zoomMode === 'quarters' ? 0.7 : 1.0));
    this.timelineStart = timelineStart;
    this.totalDays = totalDays;

    // Menghitung Posisi Garis Hari Ini (Today Indicator)
    const today = new Date();
    const todayDiff = Math.round((today.getTime() - timelineStart.getTime()) / 86400000);
    const todayValid = todayDiff >= 0 && todayDiff < totalDays;
    const todayLeftPercent = todayValid ? (todayDiff / totalDays) * 100 : 45;

    // Menghasilkan Kolom Header Bulan (OKT, NOV, DES, dll)
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const monthGroups = [];
    let currentMonthObj = null;

    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
      const d = new Date(timelineStart.getTime() + dayIdx * 86400000);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const mKey = `${mIdx}-${y}`;

      if (!currentMonthObj || currentMonthObj.key !== mKey) {
        currentMonthObj = {
          key: mKey,
          label: `${monthNames[mIdx]} ${y}`,
          daysCount: 1
        };
        monthGroups.push(currentMonthObj);
      } else {
        currentMonthObj.daysCount++;
      }
    }

    // 4. Data Sprints Asli Proyek
    const sprintMarkers = projectSprints.map((sp, sIdx) => {
      const sPos = this.calculateBarPosition(sp.startDate, sp.endDate, 5 + sIdx * 14, 14);
      return {
        id: sp.id,
        name: sp.name,
        startDate: sp.startDate,
        endDate: sp.endDate,
        status: sp.status,
        active: sp.status === 'active',
        left: sPos.left,
        width: sPos.width
      };
    });

    if (sprintMarkers.length === 0) {
      sprintMarkers.push({
        id: 'sp-default-1',
        name: 'Sprint 1: Fondasi Arsitektur & Fitur Utama',
        startDate: '2026-10-18',
        endDate: '2026-11-01',
        status: 'active',
        active: true,
        left: '12%',
        width: '28%'
      });
      sprintMarkers.push({
        id: 'sp-default-2',
        name: 'Sprint 2: Integrasi Sistem & UAT Client',
        startDate: '2026-11-02',
        endDate: '2026-11-16',
        status: 'future',
        active: false,
        left: '42%',
        width: '28%'
      });
    }

    // 5. Data Releases Asli Proyek (Milestone Markers)
    const releaseMarkers = projectReleases.map(rel => {
      const rPos = this.calculateBarPosition(rel.targetDate, rel.targetDate, 20, 2);
      const norm = normalizeStatus(rel.status);
      return {
        ...rel,
        normStatus: norm,
        left: rPos.left
      };
    });

    this.container.innerHTML = `
      <div class="timeline-container">
        
        <!-- 1. Header & Active Project Context -->
        <div class="timeline-header-block">
          <div>
            <div class="timeline-breadcrumb">
              <span>Proyek</span>
              <span>/</span>
              <span class="timeline-breadcrumb__item--active">${this.escapeHtml(activeProject?.name || 'Proyek')}</span>
              <span>/</span>
              <span class="timeline-breadcrumb__item--current">Roadmap &amp; Gantt</span>
            </div>
            <h1 class="timeline-title">
              Roadmap &amp; Timeline Gantt — ${this.escapeHtml(projectCode)}
            </h1>
          </div>

          <div class="timeline-project-pills" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="tl-proj-pill tl-proj-pill--active" style="cursor:default;display:inline-flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#4f46e5;display:inline-block;"></span>
              <span>${this.escapeHtml(projectCode)} · ${this.escapeHtml(activeProject?.clientName || 'Klien')}</span>
            </span>
            <span class="tl-proj-pill" style="cursor:default;background:#f8fafc;color:#334155;border:1px solid #e2e8f0;display:inline-flex;align-items:center;gap:6px;">
              ${Icons.layers('', 13)}
              <span>${currentEpics.length} Epik · ${projectTasks.length} Tiket</span>
            </span>
          </div>
        </div>

        <!-- 2. Controls & Filter Bar -->
        <div class="timeline-controls-card">
          <div class="timeline-controls-row--primary">
            <div class="timeline-filter-group">
              <div class="timeline-search-box">
                <span class="timeline-search-icon">${Icons.search('', 14)}</span>
                <input
                  type="text"
                  id="tlSearchInput"
                  class="timeline-search-input"
                  placeholder="Cari tiket atau kode (${projectCode}-xxx)..."
                  value="${this.escapeHtml(this.searchQuery)}"
                  autocomplete="off"
                />
              </div>

              <!-- Sprint Selector Dropdown -->
              <div class="timeline-status-select-wrap">
                <label for="tlSprintFilter" class="timeline-filter-label">Sprint:</label>
                <select id="tlSprintFilter" class="timeline-status-select">
                  <option value="all" ${!activeSprintFilter || activeSprintFilter === 'all' ? 'selected' : ''}>Semua Sprint (${projectSprints.length})</option>
                  ${projectSprints.map((s, sIdx) => {
                    const shortName = getSprintShortLabel(s.name, sIdx);
                    const tag = s.status === 'active' ? 'Aktif' : s.status === 'completed' ? 'Selesai' : 'Rencana';
                    return `<option value="${s.id}" ${activeSprintFilter === s.id ? 'selected' : ''}>${shortName} (${tag})</option>`;
                  }).join('')}
                </select>
              </div>

              <!-- Status Selector Dropdown -->
              <div class="timeline-status-select-wrap">
                <label for="tlStatusFilter" class="timeline-filter-label">Status:</label>
                <select id="tlStatusFilter" class="timeline-status-select">
                  <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>Semua Status (${kpiTasks.length})</option>
                  <option value="in_dev" ${this.statusFilter === 'in_dev' ? 'selected' : ''}>In Development</option>
                  <option value="review" ${this.statusFilter === 'review' ? 'selected' : ''}>Review &amp; Testing</option>
                  <option value="done" ${this.statusFilter === 'done' ? 'selected' : ''}>Done / Selesai</option>
                  <option value="todo" ${this.statusFilter === 'todo' ? 'selected' : ''}>To Do</option>
                  <option value="backlog" ${this.statusFilter === 'backlog' ? 'selected' : ''}>Backlog</option>
                  <option value="rejected" ${this.statusFilter === 'rejected' ? 'selected' : ''}>Rejected</option>
                  <option value="blocked" ${this.statusFilter === 'blocked' ? 'selected' : ''}>Blocked (Kendala)</option>
                </select>
              </div>

              ${activeSprintFilter ? `
                <div class="tl-active-sprint-chip" title="Klik tombol ✕ untuk menampilkan seluruh sprint">
                  <span>🎯 ${this.escapeHtml(getSprintShortLabel(projectSprints.find(s => s.id === activeSprintFilter)?.name, 0))}</span>
                  <button type="button" class="tl-chip-clear" id="tlClearSprintFilter" title="Reset filter sprint">✕</button>
                </div>
              ` : ''}
            </div>

            <!-- Legend Status Sesuai Sistem Warna Wajib -->
            <div class="timeline-legend">
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot" style="background:#22c55e;"></span>
                <span>Done</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot" style="background:#f59e0b;"></span>
                <span>Review &amp; Testing</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot" style="background:#6366f1;"></span>
                <span>In Development</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot" style="background:#3b82f6;"></span>
                <span>To Do</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot" style="background:#94a3b8;"></span>
                <span>Backlog</span>
              </div>
              <div class="timeline-legend-item">
                <span class="timeline-legend-dot" style="background:#ef4444;"></span>
                <span>Rejected</span>
              </div>
              <div class="timeline-legend-today">
                <span class="timeline-legend-today-indicator"></span>
                <span>Hari Ini</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Metric Summary Cards (4 KPI Minimalis, Informatif & Berbasis Flaticon) -->
        <div class="timeline-metrics-grid">
          
          <!-- Card 1: Progress Penyelesaian -->
          <div class="timeline-metric-card">
            <div class="timeline-metric-card__header">
              <span class="timeline-metric-card__label">Progress Penyelesaian</span>
              <span class="tl-metric-icon-box tl-metric-icon-box--emerald" title="Progress Penyelesaian Keseluruhan">
                <i class="fi fi-rr-check-circle"></i>
              </span>
            </div>
            <div class="timeline-metric-card__body">
              <div class="timeline-metric-card__value-row">
                <span class="timeline-metric-card__value" style="color: #059669;">${completionPercentage}%</span>
                <span class="tl-metric-chip tl-metric-chip--emerald">${completedTasksCount}/${totalTasksCount} Tiket</span>
              </div>
              <div class="timeline-metric-card__progress-track">
                <div class="timeline-metric-card__progress-bar" style="width: ${completionPercentage}%; background: linear-gradient(90deg, #10b981 0%, #059669 100%);"></div>
              </div>
            </div>
            <div class="tl-metric-info-row">
              <span class="tl-metric-info-item"><i class="fi fi-rr-check" style="color:#059669; font-size:11px;"></i> <strong>${completedTasksCount}</strong> Selesai</span>
              <span class="tl-metric-info-dot">·</span>
              <span class="tl-metric-info-item" style="color:#64748b;"><strong>${remainingTasksCount}</strong> Tersisa</span>
            </div>
          </div>

          <!-- Card 2: Aktif Dikerjakan -->
          <div class="timeline-metric-card">
            <div class="timeline-metric-card__header">
              <span class="timeline-metric-card__label">Aktif Dikerjakan</span>
              <span class="tl-metric-icon-box tl-metric-icon-box--amber" title="Tiket dalam Siklus Pengerjaan">
                <i class="fi fi-rr-chart-kanban"></i>
              </span>
            </div>
            <div class="timeline-metric-card__body">
              <div class="timeline-metric-card__value-row">
                <span class="timeline-metric-card__value" style="color: #d97706;">${inProgressCount}</span>
                <span class="tl-metric-unit">Tiket</span>
              </div>
            </div>
            <div class="tl-metric-info-row">
              <span class="tl-metric-info-item" title="Sedang dikerjakan oleh tim"><span class="tl-metric-status-dot" style="background:#f59e0b;"></span> <strong>${inDevOnlyCount}</strong> In Dev</span>
              <span class="tl-metric-info-dot">·</span>
              <span class="tl-metric-info-item" title="Tahap QA dan Code Review"><span class="tl-metric-status-dot" style="background:#8b5cf6;"></span> <strong>${reviewCount}</strong> Review</span>
              <span class="tl-metric-info-dot">·</span>
              <span class="tl-metric-info-item" title="Siap dikerjakan"><span class="tl-metric-status-dot" style="background:#3b82f6;"></span> <strong>${todoCount}</strong> To Do</span>
            </div>
          </div>

          <!-- Card 3: Alokasi Estimasi Waktu -->
          <div class="timeline-metric-card">
            <div class="timeline-metric-card__header">
              <span class="timeline-metric-card__label">Alokasi Estimasi Waktu</span>
              <span class="tl-metric-icon-box tl-metric-icon-box--indigo" title="Beban Estimasi Jam Kerja Arsitektur">
                <i class="fi fi-rr-clock"></i>
              </span>
            </div>
            <div class="timeline-metric-card__body">
              <div class="timeline-metric-card__value-row">
                <span class="timeline-metric-card__value" style="color: #4f46e5;">${totalEstimatedHours}</span>
                <span class="tl-metric-unit">Jam</span>
              </div>
            </div>
            <div class="tl-metric-info-row">
              <span class="tl-metric-info-item" title="Jam kerja yang telah dicatat"><i class="fi fi-rr-stopwatch" style="color:#4f46e5; font-size:11px;"></i> Log: <strong>${totalLoggedHours}j</strong></span>
              <span class="tl-metric-info-dot">·</span>
              <span class="tl-metric-info-item" title="Sisa estimasi pengerjaan"><i class="fi fi-rr-hourglass" style="color:#64748b; font-size:11px;"></i> Sisa: <strong>${remainingHours}j</strong></span>
              ${totalEstimatedHours > 0 ? `
                <span class="tl-metric-info-dot">·</span>
                <span class="tl-metric-chip tl-metric-chip--indigo" style="font-size:9.5px; padding:1px 5px;">${Math.round((totalLoggedHours / totalEstimatedHours) * 100)}%</span>
              ` : ''}
            </div>
          </div>

          <!-- Card 4: Target Delivery & UAT -->
          <div class="timeline-metric-card">
            <div class="timeline-metric-card__header">
              <span class="timeline-metric-card__label">Target Delivery &amp; UAT</span>
              <span class="tl-metric-icon-box tl-metric-icon-box--violet" title="Target Rilis Kesepakatan Klien">
                <i class="fi fi-rr-calendar-check"></i>
              </span>
            </div>
            <div class="timeline-metric-card__body">
              <div class="timeline-metric-card__value-row" style="align-items: center;">
                <span class="timeline-metric-card__value" style="color: #6d28d9; font-size: 20px;">${this.escapeHtml(formattedDeadline)}</span>
              </div>
            </div>
            <div class="tl-metric-info-row">
              ${daysRemaining !== null ? `
                <span class="tl-metric-chip ${daysRemaining < 0 ? 'tl-metric-chip--rose' : daysRemaining <= 7 ? 'tl-metric-chip--amber' : 'tl-metric-chip--violet'}">
                  ${daysRemaining < 0 ? `${Math.abs(daysRemaining)} hari lewat` : daysRemaining === 0 ? 'Hari ini' : `${daysRemaining} hari lagi`}
                </span>
              ` : ''}
              <span class="tl-metric-info-item" style="color:#64748b; font-weight:600;"><i class="fi fi-rr-flag" style="font-size:10px; color:#7c3aed;"></i> Target Rilis</span>
            </div>
          </div>

        </div>

        <!-- 4. GANTT ROADMAP CANVAS SESUAI STRUKTUR REFERENSI -->
        <div class="timeline-canvas" style="position: relative;">
          <div class="timeline-canvas__inner" id="ganttScrollContainer">
            
            <!-- Sticky Month / Calendar Header Row -->
            <div class="timeline-header-row" style="border-bottom: 1px solid #cbd5e1; position: sticky; top: 0; z-index: 25; background: #ffffff;">
              <div class="timeline-col-ticket" style="background:#fafbfc;border-right:1px solid #e2e8f0;padding:12px 16px;width:320px;min-width:320px;max-width:320px;position:sticky;left:0;z-index:30;">
                <span class="timeline-col-ticket__header-title" style="font-size:11.5px;font-weight:800;color:#0f172a;">
                  Work Item List (${this.escapeHtml(projectCode)})
                </span>
              </div>

              <div class="timeline-months-track">
                ${monthGroups.map(m => `
                  <div class="timeline-month-label" style="width: ${(m.daysCount / totalDays) * 100}%;">
                    ${m.label}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Track Row 1: SPRINTS -->
            <div class="tl-meta-track-row">
              <div class="timeline-col-ticket tl-track-label" style="width:320px;min-width:320px;max-width:320px;position:sticky;left:0;z-index:20;background:#fafbfc;">
                <span style="font-weight:700;">Sprints</span>
                <span style="font-size:10px; color:#64748b; margin-left:auto; font-weight:600;">${sprintMarkers.length} Sprint</span>
              </div>
              <div class="tl-meta-track-content">
                ${sprintMarkers.map((sp, spIdx) => {
                  const shortName = getSprintShortLabel(sp.name, spIdx);
                  const statusInfo = getSprintStatusInfo(sp.status);
                  const isSelected = activeSprintFilter === sp.id;
                  const isActive = sp.active || statusInfo.label === 'Aktif';

                  return `
                    <div
                      class="tl-sprint-marker ${statusInfo.markerClass} ${isActive ? 'tl-sprint-marker--active' : ''} ${isSelected ? 'tl-sprint-marker--selected' : ''}"
                      data-sprint-id="${sp.id}"
                      style="left: ${sp.left}; width: ${sp.width};"
                      title="${this.escapeHtml(sp.name)}&#10;Periode: ${sp.startDate || '-'} s/d ${sp.endDate || '-'}&#10;Status: ${statusInfo.label}&#10;Klik untuk ${isSelected ? 'membatalkan filter' : 'memilih & memfilter sprint ini'}"
                      role="button"
                      tabindex="0"
                    >
                      <span class="tl-sprint-title">${this.escapeHtml(shortName)}</span>
                      <span class="tl-sprint-status-tag ${statusInfo.badgeClass}">
                        ${statusInfo.label}
                      </span>
                      ${isSelected ? `<span class="tl-sprint-check" title="Sedang difilter">✓</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Track Row 2: RELEASES (Milestone Markers) -->
            <div class="tl-meta-track-row" style="background:#fafbfc;">
              <div class="timeline-col-ticket tl-track-label" style="width:320px;min-width:320px;max-width:320px;position:sticky;left:0;z-index:20;background:#f8fafc;">
                <span style="font-weight:700;">Releases</span>
                <span style="font-size:10px; color:#64748b; margin-left:auto; font-weight:600;">${releaseMarkers.length} Milestone</span>
              </div>
              <div class="tl-meta-track-content">
                ${releaseMarkers.map(rel => {
                  const isDone = rel.normStatus === 'Done';
                  const isInProg = rel.normStatus === 'In Progress';
                  const relClass = isDone ? 'tl-release-marker--done' : isInProg ? 'tl-release-marker--in-progress' : 'tl-release-marker--todo';
                  const iconSvg = isDone
                    ? Icons.checkCircle('', 12)
                    : rel.type === 'official'
                      ? Icons.flag('', 12)
                      : Icons.shieldCheck('', 12);

                  return `
                    <div
                      class="tl-release-marker ${relClass}"
                      data-release-id="${rel.id}"
                      style="left: ${rel.left};"
                      title="Milestone ${this.escapeHtml(rel.name)} (${rel.targetDate})&#10;Klik untuk membuka detail release"
                    >
                      <span class="tl-release-icon">${iconSvg}</span>
                      <span>${this.escapeHtml(rel.name)}</span>
                      <span style="font-size:9.5px; opacity:0.8; font-family:var(--font-mono);">${rel.targetDate.slice(5)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Gantt Body: Epics & Hierarchical Tasks with SVG Bezier Connectors -->
            <div style="position: relative; min-width: 1400px; width: 100%;" id="ganttRowsCanvas">
              
              <!-- SVG Bezier Curves Overlay Layer (Cascading S-Curve Connectors) -->
              <svg class="tl-dependency-svg" id="ganttDependencySvg">
                <!-- Paths will be drawn dynamically by drawDependencyLines() -->
              </svg>

              <!-- Today Indicator Line -->
              ${todayValid ? `
                <div class="tl-today-line" style="left: ${todayLeftPercent}%;" title="Hari Ini: ${today.toLocaleDateString('id-ID')}">
                  <span class="tl-today-pill">TODAY</span>
                </div>
              ` : ''}

              <!-- Epics Iteration (100% Mengacu pada Epik & Task Riil Proyek Ini) -->
              ${visibleEpics.length === 0 ? `
                <div style="padding: 48px 24px; text-align: center; color: #64748b; font-size: 13px; background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                  <p style="font-weight: 700; margin-bottom: 6px; color: #334155;">Tidak ada tiket pada sprint yang dipilih</p>
                  <p style="font-size: 12px; opacity: 0.85;">Silakan pilih sprint lain atau klik batalkan filter untuk menampilkan seluruh pekerjaan proyek.</p>
                </div>
              ` : visibleEpics.map((epic, epicIdx) => {
                const epicTasks = filteredTasks.filter(t => t.epicId === epic.id);
                const isExpanded = !!this.expandedEpics[epic.id];

                // Default staggered dates per epik agar alur pengerjaan berurutan alami
                const defaultStarts = ['2026-10-18', '2026-10-22', '2026-10-27', '2026-11-01', '2026-11-05', '2026-11-10', '2026-11-15'];
                const defaultDues = ['2026-11-02', '2026-11-06', '2026-11-12', '2026-11-17', '2026-11-22', '2026-11-27', '2026-12-04'];
                const fallbackStart = defaultStarts[epicIdx % defaultStarts.length];
                const fallbackDue = defaultDues[epicIdx % defaultDues.length];

                // Hitung rentang tanggal epik dari child task aslinya atau fallback staggered
                const taskStarts = epicTasks.map(t => t.startDate).filter(Boolean).sort();
                const taskDues = epicTasks.map(t => t.dueDate).filter(Boolean).sort();
                const epicStartDate = epic.startDate || (taskStarts.length > 0 ? taskStarts[0] : fallbackStart);
                const epicDueDate = epic.dueDate || (taskDues.length > 0 ? taskDues[taskDues.length - 1] : fallbackDue);

                const barPos = this.calculateBarPosition(epicStartDate, epicDueDate, 5 + epicIdx * 6, 15);

                const totalCount = epicTasks.length;
                const doneCount = epicTasks.filter(t => normalizeStatus(t.status) === 'Done').length;
                const inDevCount = epicTasks.filter(t => {
                  const norm = normalizeStatus(t.status);
                  return norm === 'In Development' || norm === 'In Progress';
                }).length;
                const reviewCount = epicTasks.filter(t => {
                  const norm = normalizeStatus(t.status);
                  return norm === 'Review & Testing' || norm === 'In Review' || norm === 'Testing / QA';
                }).length;
                const blockedCount = epicTasks.filter(t => normalizeStatus(t.status) === 'Blocked').length;

                // Tentukan status riil Epik berdasarkan kondisi child task
                let epicNormStatus = 'Backlog';
                if (totalCount > 0) {
                  if (doneCount === totalCount) {
                    epicNormStatus = 'Done';
                  } else if (blockedCount > 0) {
                    epicNormStatus = 'Blocked';
                  } else if (reviewCount > 0) {
                    epicNormStatus = 'Review & Testing';
                  } else if (inDevCount > 0) {
                    epicNormStatus = 'In Development';
                  } else if (epicTasks.some(t => normalizeStatus(t.status) === 'To Do')) {
                    epicNormStatus = 'To Do';
                  } else {
                    epicNormStatus = 'Backlog';
                  }
                } else if (epic.status) {
                  epicNormStatus = normalizeStatus(epic.status);
                }

                const statusCfg = STATUS_CONFIG[epicNormStatus] || STATUS_CONFIG['To Do'];
                const epicProgressPct = totalCount > 0
                  ? Math.round(epicTasks.reduce((sum, t) => sum + getTaskProgress(t), 0) / totalCount)
                  : (epicNormStatus === 'Done' ? 100 : 0);
                const hasRunning = epicNormStatus === 'In Development' || epicNormStatus === 'Review & Testing';
                const isOverdue = epicDueDate < '2026-11-06' && epicNormStatus !== 'Done';
                const showWarning = isOverdue || epicNormStatus === 'Blocked';

                return `
                  <!-- Epic Row -->
                  <div class="tl-gantt-row" data-row-epic-id="${epic.id}">
                    <!-- Left Column: Work Item List (320px width desktop) -->
                    <div class="timeline-col-ticket tl-epic-col" style="width:320px;min-width:320px;max-width:320px;position:sticky;left:0;z-index:20;">
                      <div class="tl-epic-row-main">
                        <button type="button" class="tl-chevron-toggle" data-toggle-epic="${epic.id}" title="${isExpanded ? 'Tutup daftar task' : 'Buka daftar task'}">
                          ${isExpanded ? Icons.chevronDown('', 12) : Icons.chevronRight('', 12)}
                        </button>
                        
                        <span class="tl-epic-purple-icon" style="background:#4f46e5;" title="Tipe: Epic Modul">
                          ${Icons.layers('', 11)}
                        </span>

                        <span class="tl-epic-key" style="color:#4f46e5;">${epic.key}</span>

                        <span class="tl-epic-title" title="${this.escapeHtml(epic.title)}">
                          ${this.escapeHtml(epic.title)}
                        </span>

                        <!-- Action Buttons: Edit / Delete Epic -->
                        <div class="tl-epic-actions">
                          <button type="button" class="tl-epic-action-btn" data-edit-epic="${epic.id}" title="Edit Epik">
                            ${Icons.edit('', 11)}
                          </button>
                          <button type="button" class="tl-epic-action-btn tl-epic-action-btn--delete" data-delete-epic="${epic.id}" title="Hapus Epik">
                            ${Icons.trash('', 11)}
                          </button>
                        </div>

                        <!-- Status Badge Sesuai Status Color System -->
                        <span class="tl-status-badge ${statusCfg.className}">
                          ${showWarning ? `<span style="color:#ef4444;">${Icons.alertTriangle('', 10)}</span>` : ''}
                          ${statusCfg.label}
                        </span>
                      </div>

                      <!-- Progress Indicator di bawah nama Epic menggambarkan progres aktual pekerjaan -->
                      <div class="tl-epic-segmented-bar" style="background:#e2e8f0;">
                        <div
                          class="tl-seg-fill ${hasRunning ? 'in-progress-running' : ''}"
                          style="width: ${epicProgressPct}%; background-color: ${statusCfg.barColor};"
                          title="Progres Aktual: ${epicProgressPct}% (${doneCount}/${totalCount} task selesai)"
                        ></div>
                      </div>
                    </div>

                    <!-- Right Track: Epic Gantt Bar -->
                    <div class="timeline-track tl-gantt-row-track">
                      <!-- Grid guidelines -->
                      <div class="timeline-grid-bg">
                        ${Array.from({ length: 26 }).map(() => `<div class="timeline-grid-cell"></div>`).join('')}
                      </div>

                      <!-- Bar Pill -->
                      <div
                        class="tl-gantt-bar ${statusCfg.className}"
                        id="bar-epic-${epic.id}"
                        data-bar-id="epic-${epic.id}"
                        style="left: ${barPos.left}; width: ${barPos.width}; background-color: ${statusCfg.barColor};"
                        title="${epic.key}: ${this.escapeHtml(epic.title)}&#10;Status: ${statusCfg.label}&#10;Rentang: ${epicStartDate} s/d ${epicDueDate}&#10;Progres: ${epicProgressPct}%"
                      >
                        <!-- Progress Fill using status color with different intensity (Zero Gradient) -->
                        <div
                          class="tl-gantt-progress-fill ${hasRunning ? 'progress-running' : ''}"
                          style="width: ${epicProgressPct}%;"
                        ></div>

                        <!-- Content overlay -->
                        <div class="tl-bar-content">
                          <span class="tl-bar-title">${epic.key} ${this.escapeHtml(epic.title)}</span>
                          
                          <div style="display:flex;align-items:center;gap:6px;">
                            ${hasRunning ? `
                              <span class="tl-bar-running-badge">
                                <span class="tl-pulse-dot"></span>
                                <span class="tl-bar-running-pct">${epicProgressPct}%</span>
                              </span>
                            ` : epicProgressPct === 100 ? `
                              <span class="tl-bar-running-badge">
                                100%
                              </span>
                            ` : `
                              <span class="tl-bar-running-badge" style="font-weight:600;">
                                ${epicProgressPct}%
                              </span>
                            `}

                            <div class="tl-bar-icons">
                              ${showWarning ? `<span class="tl-bar-warn-icon" title="Perhatian: Modul terkendala atau melewati estimasi">${Icons.alertTriangle('', 11)}</span>` : ''}
                              <span class="tl-bar-link-icon" title="Tautkan Dependensi">${Icons.link('', 11)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Expanded Child Tasks (Semua Task Asli di Bawah Epik Ini) -->
                  ${isExpanded ? epicTasks.map((ct, ctIdx) => {
                    const ctPos = this.calculateBarPosition(ct.startDate || epicStartDate, ct.dueDate || epicDueDate, barPos.startIdx + ctIdx * 2, 7);
                    const ctNormStatus = normalizeStatus(ct.status);
                    const ctStatusCfg = STATUS_CONFIG[ctNormStatus] || STATUS_CONFIG['To Do'];
                    const ctProgress = getTaskProgress(ct);
                    const isTaskRunning = ctNormStatus === 'In Development' || ctNormStatus === 'Review & Testing';
                    const isDone = ctNormStatus === 'Done';
                    const isTaskOverdue = (ct.dueDate || epicDueDate) < '2026-11-06' && !isDone;
                    const showTaskWarning = isTaskOverdue || ctNormStatus === 'Blocked';

                    return `
                      <div class="tl-gantt-row tl-child-gantt-row" data-row-task-id="${ct.id}">
                        <!-- Indented Left Column -->
                        <div class="timeline-col-ticket tl-child-task-col" style="width:320px;min-width:320px;max-width:320px;position:sticky;left:0;z-index:20;">
                          <span class="tl-task-checkbox-icon" style="color: ${ctStatusCfg.barColor};">
                            ${isDone ? Icons.checkSquare('', 12) : Icons.listTodo('', 12)}
                          </span>
                          
                          <span class="tl-epic-key" style="color:#0284c7;font-size:10.5px;">${ct.key}</span>
                          
                          <span class="tl-epic-title" title="${this.escapeHtml(ct.title)}" style="font-size:11px;font-weight:600;">
                            ${this.escapeHtml(ct.title)}
                          </span>

                          <span class="tl-status-badge ${ctStatusCfg.className}">
                            ${showTaskWarning ? `<span style="color:#ef4444;">${Icons.alertTriangle('', 9)}</span>` : ''}
                            ${ctStatusCfg.label}
                          </span>
                        </div>

                        <!-- Right Track: Child Task Bar -->
                        <div class="timeline-track tl-gantt-row-track">
                          <div class="timeline-grid-bg">
                            ${Array.from({ length: 26 }).map(() => `<div class="timeline-grid-cell"></div>`).join('')}
                          </div>

                          <div
                            class="tl-gantt-bar ${ctStatusCfg.className}"
                            id="bar-task-${ct.id}"
                            data-bar-id="task-${ct.id}"
                            style="left: ${ctPos.left}; width: ${ctPos.width}; height: 24px; top: 7px; font-size: 11px; background-color: ${ctStatusCfg.barColor};"
                            title="${ct.key}: ${this.escapeHtml(ct.title)} (${ctStatusCfg.label})&#10;Mulai: ${ct.startDate || epicStartDate} · Selesai: ${ct.dueDate || epicDueDate}&#10;Klik untuk membuka detail task"
                          >
                            <div
                              class="tl-gantt-progress-fill ${isTaskRunning ? 'progress-running' : ''}"
                              style="width: ${ctProgress}%;"
                            ></div>
                            <div class="tl-bar-content">
                              <span class="tl-bar-title">${ct.key} ${this.escapeHtml(ct.title)}</span>
                              
                              <div style="display:flex;align-items:center;gap:4px;">
                                ${ctProgress > 0 ? `<span style="font-size:10px;font-weight:700;color:#ffffff;opacity:0.95;">${ctProgress}%</span>` : ''}
                                ${showTaskWarning ? `<span class="tl-bar-warn-icon">${Icons.alertTriangle('', 10)}</span>` : ''}
                                <span class="tl-bar-link-icon">${Icons.link('', 10)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('') : ''}
                `;
              }).join('')}

              <!-- Bottom Row: + Create Epic Button -->
              <div class="tl-gantt-row" style="min-height: 40px; background: #ffffff;">
                <div class="timeline-col-ticket tl-create-epic-row" style="width:320px;min-width:320px;max-width:320px;position:sticky;left:0;z-index:20;">
                  <button type="button" class="tl-create-epic-btn" id="tlCreateEpicBtn">
                    <span>${Icons.plus('', 13)}</span>
                    <span>Create Epic</span>
                  </button>
                </div>
                <div class="timeline-track" style="background:#fafbfc;"></div>
              </div>

            </div>
          </div>

          <!-- 5. Floating Bottom-Right Controls Toolbar (1:1 Sesuai Referensi) -->
          <div class="gantt-floating-toolbar">
            <button type="button" class="gantt-tool-btn" id="ganttNavPrev" title="Previous Period">
              ${Icons.chevronLeft('', 14)}
            </button>
            <button type="button" class="gantt-tool-btn" id="ganttNavNext" title="Next Period">
              ${Icons.chevronRight('', 14)}
            </button>
            <button type="button" class="gantt-tool-btn" id="ganttTodayBtn" style="font-weight:700;">
              Today
            </button>
            
            <div class="gantt-zoom-group">
              <button type="button" class="gantt-zoom-btn ${this.zoomMode === 'weeks' ? 'active' : ''}" data-zoom="weeks">Weeks</button>
              <button type="button" class="gantt-zoom-btn ${this.zoomMode === 'months' ? 'active' : ''}" data-zoom="months">Months</button>
              <button type="button" class="gantt-zoom-btn ${this.zoomMode === 'quarters' ? 'active' : ''}" data-zoom="quarters">Quarters</button>
            </div>

            <button type="button" class="gantt-tool-btn" id="ganttZoomIn" title="Zoom In">
              ${Icons.zoomIn('', 14)}
            </button>
            <button type="button" class="gantt-tool-btn" id="ganttZoomOut" title="Zoom Out">
              ${Icons.zoomOut('', 14)}
            </button>
            <button type="button" class="gantt-tool-btn" id="ganttInfoBtn" title="Informasi Roadmap &amp; Gantt">
              ${Icons.info('', 14)}
            </button>
            <button type="button" class="gantt-tool-btn" id="ganttFullscreenBtn" title="Perbesar Layar">
              ${Icons.maximize('', 14)}
            </button>
          </div>

        </div>

        <!-- 6. Footer Information Card -->
        <div class="timeline-footer-card">
          <div class="timeline-footer-card__left">
            <span style="color: #4f46e5;">${Icons.info('', 15)}</span>
            <span>
              Curved dependency connector menghubungkan alur pengerjaan antar epik modul. Klik bar untuk melihat detail tugas, klik milestone rilis untuk melihat deliverable.
            </span>
          </div>
          <div class="timeline-footer-card__right">
            <span>Proyek: <strong>${this.escapeHtml(activeProject?.name || '')}</strong></span>
            <span>·</span>
            <span>Kode: <strong>${this.escapeHtml(projectCode)}</strong></span>
          </div>
        </div>

        <!-- 7. Active Modal Overlay Container (Rendered dynamically if activeModal is set) -->
        <div id="tlModalContainer"></div>

      </div>
    `;

    this.bindEvents();

    // Gambar kurva bezier penghubung setelah render DOM
    setTimeout(() => {
      this.drawDependencyLines(visibleEpics);
    }, 60);
  }

  /**
   * Menggambar garis lengkung dependensi S-curve (Bezier Connectors)
   * Menggunakan SVG dengan warna #94A3B8, stroke-width 1.8px, rounded line caps
   */
  drawDependencyLines(currentEpics) {
    const svgEl = this.container.querySelector('#ganttDependencySvg');
    const canvasEl = this.container.querySelector('#ganttRowsCanvas');
    if (!svgEl || !canvasEl) return;

    svgEl.innerHTML = '';
    const canvasRect = canvasEl.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) return;

    const connectionPairs = [];

    // 1. Sambungkan child task ke epik jika dibuka
    if (currentEpics.length > 1 && this.expandedEpics[currentEpics[1].id]) {
      const childTasks = store.getState().tasks.filter(t => t.epicId === currentEpics[1].id);
      if (childTasks.length > 0) {
        connectionPairs.push({
          from: `bar-task-${childTasks[0].id}`,
          to: `bar-epic-${currentEpics[1].id}`
        });
      }
    }

    // 2. Cascade alami antar Epik (Finish to Start)
    for (let i = 0; i < currentEpics.length - 1; i++) {
      connectionPairs.push({
        from: `bar-epic-${currentEpics[i].id}`,
        to: `bar-epic-${currentEpics[i + 1].id}`
      });
    }

    let pathsHtml = '';

    connectionPairs.forEach(pair => {
      const elFrom = this.container.querySelector(`#${pair.from}`);
      const elTo = this.container.querySelector(`#${pair.to}`);

      if (elFrom && elTo) {
        const rFrom = elFrom.getBoundingClientRect();
        const rTo = elTo.getBoundingClientRect();

        const x1 = rFrom.right - canvasRect.left;
        const y1 = rFrom.top + rFrom.height / 2 - canvasRect.top;

        const x2 = rTo.left - canvasRect.left;
        const y2 = rTo.top + rTo.height / 2 - canvasRect.top;

        // Hitung kurva S (Cubic Bezier Curve)
        const dx = Math.max(18, Math.abs(x2 - x1) * 0.5);
        const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        pathsHtml += `
          <g class="tl-dep-group" data-from="${pair.from}" data-to="${pair.to}">
            <path
              d="${pathD}"
              class="tl-dep-path"
              data-from="${pair.from}"
              data-to="${pair.to}"
            />
            <circle cx="${x1}" cy="${y1}" r="3" fill="#94a3b8" />
            <circle cx="${x2}" cy="${y2}" r="3.5" fill="#94a3b8" />
          </g>
        `;
      }
    });

    svgEl.innerHTML = pathsHtml;
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  bindEvents() {
    // Chevron Expand/Collapse Epics
    const toggleBtns = this.container.querySelectorAll('.tl-chevron-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const epicId = btn.dataset.toggleEpic;
        if (epicId) {
          this.expandedEpics[epicId] = !this.expandedEpics[epicId];
          this.render();
        }
      });
    });

    // Search Input
    const searchInput = this.container.querySelector('#tlSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        const input = this.container.querySelector('#tlSearchInput');
        if (input) {
          input.focus();
          input.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Sprint Selector Filter Dropdown
    const sprintSelect = this.container.querySelector('#tlSprintFilter');
    if (sprintSelect) {
      sprintSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        this.selectedSprintFilter = val === 'all' ? null : val;
        store.setState({ filterSprint: this.selectedSprintFilter, selectedSprintId: this.selectedSprintFilter });
        this.render();
      });
    }

    // Clear Sprint Filter Chip Button
    const clearSprintBtn = this.container.querySelector('#tlClearSprintFilter');
    if (clearSprintBtn) {
      clearSprintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedSprintFilter = null;
        store.setState({ filterSprint: null, selectedSprintId: null });
        this.render();
      });
    }

    // Sprint Marker Interactive Click Selection (From Gantt Sprints Row)
    const sprintMarkers = this.container.querySelectorAll('.tl-sprint-marker[data-sprint-id]');
    sprintMarkers.forEach(marker => {
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = marker.dataset.sprintId;
        if (!sId) return;

        // Toggle sprint filter: jika klik sprint yang sama, reset ke semua
        if (this.selectedSprintFilter === sId) {
          this.selectedSprintFilter = null;
          store.setState({ filterSprint: null, selectedSprintId: null });
        } else {
          this.selectedSprintFilter = sId;
          store.setState({ filterSprint: sId, selectedSprintId: sId });
        }
        this.render();
      });
    });

    // Status Filter
    const statusSelect = this.container.querySelector('#tlStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.render();
      });
    }

    // Klik task row atau task bar untuk membuka Task Detail Modal
    const taskRows = this.container.querySelectorAll('[data-row-task-id]');
    taskRows.forEach(row => {
      row.addEventListener('click', () => {
        const tId = row.dataset.rowTaskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    const taskBars = this.container.querySelectorAll('.tl-bar-task, [data-bar-id^="task-"]');
    taskBars.forEach(bar => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const barId = bar.dataset.barId || '';
        const tId = barId.replace('task-', '');
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          store.openTaskDetail(task);
        }
      });
    });

    // Hover pada Gantt Bar untuk menyorot dependency line terkait dan meredupkan garis lainnya
    const allBars = this.container.querySelectorAll('[data-bar-id]');
    allBars.forEach(bar => {
      bar.addEventListener('mouseenter', () => {
        const barId = bar.dataset.barId;
        const allPaths = this.container.querySelectorAll('.tl-dep-path');
        allPaths.forEach(p => {
          if (p.dataset.from === `bar-${barId}` || p.dataset.to === `bar-${barId}`) {
            p.classList.add('highlighted');
            p.classList.remove('dimmed');
          } else {
            p.classList.remove('highlighted');
            p.classList.add('dimmed');
          }
        });
      });

      bar.addEventListener('mouseleave', () => {
        const allPaths = this.container.querySelectorAll('.tl-dep-path');
        allPaths.forEach(p => {
          p.classList.remove('highlighted');
          p.classList.remove('dimmed');
        });
      });
    });

    // Klik pada Epic bar membuka info epik atau modal edit
    const epicBars = this.container.querySelectorAll('[data-bar-id^="epic-"]');
    epicBars.forEach(bar => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const barId = bar.dataset.barId || '';
        const eId = barId.replace('epic-', '');
        const epic = store.getState().epics.find(ep => ep.id === eId);
        if (epic) {
          this.openEditEpicModal(epic);
        }
      });
    });

    // Klik pada tombol Edit Epik
    const editBtns = this.container.querySelectorAll('[data-edit-epic]');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const epicId = btn.dataset.editEpic;
        const epic = store.getState().epics.find(ep => ep.id === epicId);
        if (epic) {
          this.openEditEpicModal(epic);
        }
      });
    });

    // Klik pada tombol Hapus Epik
    const deleteBtns = this.container.querySelectorAll('[data-delete-epic]');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const epicId = btn.dataset.deleteEpic;
        const epic = store.getState().epics.find(ep => ep.id === epicId);
        if (epic) {
          this.openDeleteEpicModal(epic);
        }
      });
    });

    // Klik pada Release milestone marker membuka detail release
    const releaseMarkers = this.container.querySelectorAll('[data-release-id]');
    releaseMarkers.forEach(m => {
      m.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = m.dataset.releaseId;
        const release = this.releases.find(r => r.id === rId);
        if (release) {
          this.openReleaseDetailModal(release);
        }
      });
    });

    // Create Epic Button (+ Create Epic)
    const createEpicBtn = this.container.querySelector('#tlCreateEpicBtn');
    if (createEpicBtn) {
      createEpicBtn.addEventListener('click', () => {
        this.openCreateEpicModal();
      });
    }

    // Floating Controls Toolbar: Zoom Mode Switch
    const zoomBtns = this.container.querySelectorAll('.gantt-zoom-btn');
    zoomBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.zoomMode = btn.dataset.zoom || 'months';
        this.render();
      });
    });

    // Floating Controls: Zoom In / Out
    const zoomInBtn = this.container.querySelector('#ganttZoomIn');
    const zoomOutBtn = this.container.querySelector('#ganttZoomOut');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        if (this.zoomMode === 'quarters') this.zoomMode = 'months';
        else if (this.zoomMode === 'months') this.zoomMode = 'weeks';
        this.render();
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        if (this.zoomMode === 'weeks') this.zoomMode = 'months';
        else if (this.zoomMode === 'months') this.zoomMode = 'quarters';
        this.render();
      });
    }

    // Floating Controls Toolbar: Scroll Prev / Next
    const scrollContainer = this.container.querySelector('#ganttScrollContainer');
    const prevBtn = this.container.querySelector('#ganttNavPrev');
    const nextBtn = this.container.querySelector('#ganttNavNext');
    if (scrollContainer) {
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          scrollContainer.scrollBy({ left: -280, behavior: 'smooth' });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          scrollContainer.scrollBy({ left: 280, behavior: 'smooth' });
        });
      }
    }

    // Floating Controls Toolbar: Today Button
    const todayBtn = this.container.querySelector('#ganttTodayBtn');
    if (todayBtn && scrollContainer) {
      todayBtn.addEventListener('click', () => {
        const todayLine = this.container.querySelector('.tl-today-line');
        if (todayLine) {
          const lineLeft = todayLine.offsetLeft;
          scrollContainer.scrollTo({
            left: Math.max(0, lineLeft - scrollContainer.clientWidth / 2 + 160),
            behavior: 'smooth'
          });
        }
      });
    }

    // Fullscreen Toggle
    const fsBtn = this.container.querySelector('#ganttFullscreenBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const canvas = this.container.querySelector('.timeline-canvas');
        if (canvas) {
          if (!document.fullscreenElement) {
            canvas.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      });
    }

    // Info Button
    const infoBtn = this.container.querySelector('#ganttInfoBtn');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        store.addToast('info', 'Roadmap & Gantt ASTACODE PM', 'Gantt Chart interaktif dengan 10 status terstandarisasi, baris sprint dan rilis, serta konektor dependensi dinamis.');
      });
    }
  }

  // ===========================================================================
  // INTERACTIVE MODALS (CREATE, EDIT, DELETE EPIC & RELEASE DETAIL)
  // ===========================================================================

  openCreateEpicModal() {
    const modalContainer = this.container.querySelector('#tlModalContainer');
    if (!modalContainer) return;

    const activeProj = store.getActiveProject();
    const prefix = activeProj?.code || 'PRJ';
    const projectEpics = store.getState().epics.filter(e => e.projectId === activeProj?.id);
    const nextNum = projectEpics.length + 1;
    const nextKey = `${prefix}-EPIC-${nextNum}`;

    modalContainer.innerHTML = `
      <div class="tl-modal-backdrop" id="tlBackdrop">
        <div class="tl-modal-box">
          <div class="tl-modal-header">
            <h3 class="tl-modal-title">Buat Epik / Modul Pekerjaan Baru</h3>
            <button type="button" class="tl-modal-close" id="tlCloseModal">${Icons.x('', 16)}</button>
          </div>
          
          <form id="tlCreateEpicForm">
            <div class="tl-modal-body">
              <div class="tl-form-group">
                <label class="tl-form-label">Kode Epik</label>
                <input type="text" id="epicKeyInput" class="tl-form-input" value="${nextKey}" required />
              </div>

              <div class="tl-form-group">
                <label class="tl-form-label">Nama Modul / Epik</label>
                <input type="text" id="epicTitleInput" class="tl-form-input" placeholder="Misal: Modul Integrasi Pembayaran Real-Time" required />
              </div>

              <div class="tl-form-group">
                <label class="tl-form-label">Status Awal</label>
                <select id="epicStatusInput" class="tl-form-select">
                  ${Object.keys(STATUS_CONFIG).map(stKey => `
                    <option value="${stKey}" ${stKey === 'To Do' ? 'selected' : ''}>${stKey}</option>
                  `).join('')}
                </select>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="tl-form-group">
                  <label class="tl-form-label">Tanggal Mulai</label>
                  <input type="date" id="epicStartDateInput" class="tl-form-input" value="2026-11-06" required />
                </div>
                <div class="tl-form-group">
                  <label class="tl-form-label">Target Selesai</label>
                  <input type="date" id="epicDueDateInput" class="tl-form-input" value="2026-11-20" required />
                </div>
              </div>

              <div class="tl-form-group">
                <label class="tl-form-label">Deskripsi Modul</label>
                <textarea id="epicDescInput" class="tl-form-textarea" rows="2" placeholder="Tujuan pengerjaan dan ruang lingkup modul..."></textarea>
              </div>
            </div>

            <div class="tl-modal-footer">
              <button type="button" class="tl-btn-secondary" id="tlCancelModal">Batal</button>
              <button type="submit" class="tl-btn-primary">Simpan &amp; Tambahkan ke Roadmap</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#tlCloseModal')?.addEventListener('click', close);
    modalContainer.querySelector('#tlCancelModal')?.addEventListener('click', close);

    const form = modalContainer.querySelector('#tlCreateEpicForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const key = modalContainer.querySelector('#epicKeyInput').value.trim();
      const title = modalContainer.querySelector('#epicTitleInput').value.trim();
      const status = modalContainer.querySelector('#epicStatusInput').value;
      const startDate = modalContainer.querySelector('#epicStartDateInput').value;
      const dueDate = modalContainer.querySelector('#epicDueDateInput').value;
      const desc = modalContainer.querySelector('#epicDescInput').value.trim();

      if (!title) return;

      const newEpic = {
        id: `epic-${Date.now()}`,
        projectId: activeProj.id,
        key: key || nextKey,
        title,
        status,
        startDate,
        dueDate,
        description: desc || 'Epik baru ditambahkan via Gantt Roadmap Canvas.'
      };

      const updatedEpics = [...store.getState().epics, newEpic];
      store.setState({ epics: updatedEpics });
      this.saveEpicsToStorage();

      store.addToast('success', 'Epik Berhasil Dibuat', `[${newEpic.key}] ${newEpic.title} kini aktif pada Roadmap & Gantt.`);
      close();
    });
  }

  openEditEpicModal(epic) {
    const modalContainer = this.container.querySelector('#tlModalContainer');
    if (!modalContainer || !epic) return;

    modalContainer.innerHTML = `
      <div class="tl-modal-backdrop" id="tlBackdrop">
        <div class="tl-modal-box">
          <div class="tl-modal-header">
            <h3 class="tl-modal-title">Edit Epik: ${this.escapeHtml(epic.key)}</h3>
            <button type="button" class="tl-modal-close" id="tlCloseModal">${Icons.x('', 16)}</button>
          </div>
          
          <form id="tlEditEpicForm">
            <div class="tl-modal-body">
              <div class="tl-form-group">
                <label class="tl-form-label">Kode Epik</label>
                <input type="text" id="editEpicKeyInput" class="tl-form-input" value="${this.escapeHtml(epic.key)}" required />
              </div>

              <div class="tl-form-group">
                <label class="tl-form-label">Nama Modul / Epik</label>
                <input type="text" id="editEpicTitleInput" class="tl-form-input" value="${this.escapeHtml(epic.title)}" required />
              </div>

              <div class="tl-form-group">
                <label class="tl-form-label">Status Epik</label>
                <select id="editEpicStatusInput" class="tl-form-select">
                  ${Object.keys(STATUS_CONFIG).map(stKey => `
                    <option value="${stKey}" ${normalizeStatus(epic.status) === stKey ? 'selected' : ''}>${stKey}</option>
                  `).join('')}
                </select>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="tl-form-group">
                  <label class="tl-form-label">Tanggal Mulai</label>
                  <input type="date" id="editEpicStartDateInput" class="tl-form-input" value="${epic.startDate || '2026-10-18'}" required />
                </div>
                <div class="tl-form-group">
                  <label class="tl-form-label">Target Selesai</label>
                  <input type="date" id="editEpicDueDateInput" class="tl-form-input" value="${epic.dueDate || '2026-11-20'}" required />
                </div>
              </div>

              <div class="tl-form-group">
                <label class="tl-form-label">Deskripsi</label>
                <textarea id="editEpicDescInput" class="tl-form-textarea" rows="2">${this.escapeHtml(epic.description || '')}</textarea>
              </div>
            </div>

            <div class="tl-modal-footer">
              <button type="button" class="tl-btn-secondary" id="tlCancelModal">Batal</button>
              <button type="submit" class="tl-btn-primary">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#tlCloseModal')?.addEventListener('click', close);
    modalContainer.querySelector('#tlCancelModal')?.addEventListener('click', close);

    const form = modalContainer.querySelector('#tlEditEpicForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedEpics = store.getState().epics.map(ep => {
        if (ep.id === epic.id) {
          return {
            ...ep,
            key: modalContainer.querySelector('#editEpicKeyInput').value.trim(),
            title: modalContainer.querySelector('#editEpicTitleInput').value.trim(),
            status: modalContainer.querySelector('#editEpicStatusInput').value,
            startDate: modalContainer.querySelector('#editEpicStartDateInput').value,
            dueDate: modalContainer.querySelector('#editEpicDueDateInput').value,
            description: modalContainer.querySelector('#editEpicDescInput').value.trim()
          };
        }
        return ep;
      });

      store.setState({ epics: updatedEpics });
      this.saveEpicsToStorage();

      store.addToast('success', 'Epik Diperbarui', `Perubahan pada epik [${epic.key}] berhasil disimpan.`);
      close();
    });
  }

  openDeleteEpicModal(epic) {
    const modalContainer = this.container.querySelector('#tlModalContainer');
    if (!modalContainer || !epic) return;

    modalContainer.innerHTML = `
      <div class="tl-modal-backdrop" id="tlBackdrop">
        <div class="tl-modal-box" style="max-width:440px;">
          <div class="tl-modal-header">
            <h3 class="tl-modal-title" style="color:#ef4444;display:flex;align-items:center;gap:6px;">
              ${Icons.alertTriangle('', 16)}
              <span>Hapus Epik Modul</span>
            </h3>
            <button type="button" class="tl-modal-close" id="tlCloseModal">${Icons.x('', 16)}</button>
          </div>
          
          <div class="tl-modal-body">
            <p style="font-size:13px; color:#334155; line-height:1.5;">
              Apakah Anda yakin ingin menghapus epik <strong>[${this.escapeHtml(epic.key)}] ${this.escapeHtml(epic.title)}</strong>?
            </p>
            <p style="font-size:12px; color:#64748b;">
              Tindakan ini akan menghapus bar epik dari kanvas Roadmap dan menyimpan perubahan ke localStorage.
            </p>
          </div>

          <div class="tl-modal-footer">
            <button type="button" class="tl-btn-secondary" id="tlCancelModal">Batal</button>
            <button type="button" class="tl-btn-danger" id="tlConfirmDeleteBtn">Ya, Hapus Epik</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#tlCloseModal')?.addEventListener('click', close);
    modalContainer.querySelector('#tlCancelModal')?.addEventListener('click', close);

    modalContainer.querySelector('#tlConfirmDeleteBtn')?.addEventListener('click', () => {
      const updatedEpics = store.getState().epics.filter(ep => ep.id !== epic.id);
      store.setState({ epics: updatedEpics });
      this.saveEpicsToStorage();

      store.addToast('info', 'Epik Dihapus', `Epik [${epic.key}] telah dihapus dari roadmap.`);
      close();
    });
  }

  openReleaseDetailModal(release) {
    const modalContainer = this.container.querySelector('#tlModalContainer');
    if (!modalContainer || !release) return;

    const norm = normalizeStatus(release.status);
    const cfg = STATUS_CONFIG[norm] || STATUS_CONFIG['Done'];

    modalContainer.innerHTML = `
      <div class="tl-modal-backdrop" id="tlBackdrop">
        <div class="tl-modal-box">
          <div class="tl-modal-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:#4f46e5;">${Icons.flag('', 16)}</span>
              <h3 class="tl-modal-title">Milestone Release: ${this.escapeHtml(release.name)}</h3>
            </div>
            <button type="button" class="tl-modal-close" id="tlCloseModal">${Icons.x('', 16)}</button>
          </div>
          
          <div class="tl-modal-body">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
              <div>
                <span style="font-size:11px;color:#64748b;display:block;">Target Tanggal Rilis</span>
                <span style="font-size:13px;font-weight:700;color:#0f172a;">${release.targetDate}</span>
              </div>
              <span class="tl-status-badge ${cfg.className}">
                ${cfg.label}
              </span>
            </div>

            <div class="tl-form-group">
              <label class="tl-form-label">Deskripsi Milestone</label>
              <p style="font-size:13px;color:#334155;margin:0;line-height:1.5;">
                ${this.escapeHtml(release.description || 'Tidak ada deskripsi rilis.')}
              </p>
            </div>

            <div class="tl-form-group">
              <label class="tl-form-label">Deliverable &amp; Ruang Lingkup Modul Terkait</label>
              <ul style="margin:0;padding-left:18px;font-size:12.5px;color:#334155;line-height:1.7;">
                ${(release.deliverables || []).map(deliv => `
                  <li>${this.escapeHtml(deliv)}</li>
                `).join('')}
              </ul>
            </div>
          </div>

          <div class="tl-modal-footer">
            <button type="button" class="tl-btn-primary" id="tlCloseModalBtn">Tutup</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('#tlCloseModal')?.addEventListener('click', close);
    modalContainer.querySelector('#tlCloseModalBtn')?.addEventListener('click', close);
  }
}
