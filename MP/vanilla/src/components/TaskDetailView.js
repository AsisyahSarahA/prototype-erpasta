/**
 * TaskDetailView.js — Detail View Papan Kanban Proporsional Berstandar ASTACODE CRM & Software House
 * 
 * Layout Proporsional UI/UX:
 * - 70% Kolom Kiri: AI Dev Assistant Banner, Deskripsi & Spesifikasi, Checklist Subtask, Diskusi Tim
 * - 30% Kolom Kanan: Sticky Metadata Rail (Prioritas, Assignee, Pelapor, Due Date, Time Tracking, Git Branch)
 * - Header Workspace Bar: Navigasi Breadcrumbs, Copyable Code, Sub-bar info lengkap, Action Buttons
 * - 6-Phase Lifecycle Track Record: Lingkaran persentase milestone interaktif, gate standar mutu, tombol navigasi fase
 * - Responsive: Otomatis adaptif di layar laptop, desktop, maupun tablet.
 */

import { store } from '../state/store.js';

const ICONS = {
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  bot: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
  paperclip: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
  checkSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  link: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  gitBranch: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
};

// 6 Fase Siklus Standar Software House (Sama Persis Gambar 1)
const SOFTWARE_HOUSE_STAGES = [
  { id: 'Backlog', label: '1. Backlog & Spec', shortName: 'Backlog', pct: 16, gateRule: 'Verifikasi kelengkapan KAK, user stories, dan kriteria penerimaan (DoD).' },
  { id: 'To Do', label: '2. Scope & Arsitektur', shortName: 'Arsitektur', pct: 33, gateRule: 'Penyusunan arsitektur DB/API, pembagian subtasks, dan estimasi jam selesai.' },
  { id: 'In Progress', label: '3. Coding Sprint', shortName: 'Coding', pct: 50, gateRule: 'Pengerjaan fitur di branch git, implementasi middleware, dan commit berkala.' },
  { id: 'In Review', label: '4. Code Review PR', shortName: 'Review PR', pct: 67, gateRule: 'PR diajukan ke GitHub, CI/CD automated test lulus, dan peer review disetujui.' },
  { id: 'QA/Testing', label: '5. QA & Staging UAT', shortName: 'QA Staging', pct: 83, gateRule: 'Deployment otomatis ke server Staging, pengujian regresi, dan sign-off QA.' },
  { id: 'Selesai', label: '6. Production Live', shortName: 'Production', pct: 100, gateRule: 'Merge ke branch main, deploy ke Production, dan monitoring real-time aktif.' }
];

function getRoleBadgeStyle(role) {
  const r = (role || '').toLowerCase();
  if (r.includes('pm') || r.includes('manajer') || r.includes('manager')) {
    return { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: 'rgba(245, 158, 11, 0.3)' };
  }
  if (r.includes('backend')) {
    return { bg: 'rgba(99, 102, 241, 0.12)', color: 'var(--indigo-600, #4f46e5)', border: 'rgba(99, 102, 241, 0.3)' };
  }
  if (r.includes('full') || r.includes('stack')) {
    return { bg: 'rgba(14, 165, 233, 0.12)', color: '#0284c7', border: 'rgba(14, 165, 233, 0.3)' };
  }
  if (r.includes('frontend')) {
    return { bg: 'rgba(168, 85, 247, 0.12)', color: '#9333ea', border: 'rgba(168, 85, 247, 0.3)' };
  }
  if (r.includes('qa') || r.includes('test')) {
    return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: 'rgba(16, 185, 129, 0.3)' };
  }
  if (r.includes('ai') || r.includes('bot') || r.includes('agent')) {
    return { bg: 'rgba(236, 72, 153, 0.12)', color: '#db2777', border: 'rgba(236, 72, 153, 0.3)' };
  }
  return { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: 'rgba(100, 116, 139, 0.3)' };
}

function formatCommentTime(isoString) {
  if (!isoString) return 'Baru saja';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    if (isToday) {
      return `Hari ini, ${timeStr}`;
    }
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  } catch (e) {
    return isoString;
  }
}

export class TaskDetailView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'detail-page-wrapper';
    this.container.style.cssText = 'flex:1;display:flex;flex-direction:column;height:100%;overflow-y:auto;background:var(--bg-primary);';

    this.activeTab = 'overview'; // 'overview' | 'subtasks' | 'ai' | 'git' | 'comments' | 'history'
    this.copiedKey = false;
    this.isAiProcessing = false;
    this.selectedCommentAuthorId = 'user-pm';
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  getStageIndex(status) {
    const idx = SOFTWARE_HOUSE_STAGES.findIndex(s => s.id === status);
    if (idx !== -1) return idx;
    if (status === 'Diperbaiki Agen' || status === 'Perlu Manual') return 2;
    if (status === 'Deploy Staging' || status === 'Disetujui') return 4;
    if (status === 'Deploy Production' || status === 'Dipantau') return 5;
    return 0;
  }

  render() {
    const state = store.getState();
    const task = state.selectedTask;

    if (!task) {
      this.container.innerHTML = `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:48px;color:var(--text-muted);text-align:center;">
          <div style="width:54px;height:54px;border-radius:var(--radius-xl);background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;color:var(--indigo-600);font-size:24px;">
            <i class="fi fi-rr-document"></i>
          </div>
          <div>
            <h3 style="font-size:16px;font-weight:800;color:var(--text-primary);margin:0 0 6px 0;">Tidak Ada Tiket Terpilih</h3>
            <p style="font-size:13px;color:var(--text-muted);margin:0;">Silakan kembali ke Papan Kanban untuk memilih tiket pekerjaan.</p>
          </div>
          <button id="btn-back-kanban-fallback" class="btn btn-primary btn-sm" style="font-weight:700;">
            ${ICONS.arrowLeft} Kembali ke Papan Kanban
          </button>
        </div>
      `;
      this.attachFallbackEvents();
      return;
    }

    // Refresh state data
    const currentTask = state.tasks.find(t => t.id === task.id) || task;
    const project = state.projects.find(p => p.id === currentTask.projectId) || { name: 'Sistem Perpustakaan Digital Kampus (Laravel Microservices & React SPA)', code: 'LIB' };
    const epic = state.epics.find(e => e.id === currentTask.epicId) || { title: 'Microservice Katalog Buku, Pengarang & ISBN (Laravel Backend)' };
    const assignee = state.teamMembers.find(m => m.id === currentTask.assigneeId) || { name: 'Jaka (Backend Dev)', role: 'Backend Engineer' };
    const reporter = state.teamMembers.find(m => m.id === currentTask.reporterId) || { name: 'Asisyah (Manual)', role: 'Project Manager' };
    
    const subtasks = currentTask.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const subtaskPct = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
    const loggedHours = currentTask.timeLoggedHours || 0;
    const estHours = Number(currentTask.estimateHours) || 20;

    // Stage calculation
    const currentStageIdx = this.getStageIndex(currentTask.status);
    const activeStage = SOFTWARE_HOUSE_STAGES[currentStageIdx] || SOFTWARE_HOUSE_STAGES[0];
    const activePercent = activeStage.pct;
    // Calculate progress line percentage between node 1 (8%) and node 6 (92%)
    const activeProgressWidth = (currentStageIdx / (SOFTWARE_HOUSE_STAGES.length - 1)) * 84 + 8;

    // Priority badge class
    let priorityBadgeBg = 'rgba(59,130,246,0.1); color:#2563eb; border:1px solid rgba(59,130,246,0.25);';
    if (currentTask.priority === 'Tertinggi' || currentTask.priority === 'Hotfix') {
      priorityBadgeBg = 'rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25);';
    } else if (currentTask.priority === 'Tinggi') {
      priorityBadgeBg = 'rgba(245,158,11,0.1); color:#d97706; border:1px solid rgba(245,158,11,0.25);';
    } else if (currentTask.priority === 'Rendah') {
      priorityBadgeBg = 'rgba(100,116,139,0.1); color:#64748b; border:1px solid rgba(100,116,139,0.25);';
    }

    // Circular Milestone Nodes HTML (Persis Gaya CRM Gambar 2)
    const milestoneNodesHtml = SOFTWARE_HOUSE_STAGES.map((st, idx) => {
      const isPast = idx < currentStageIdx;
      const isCurrent = idx === currentStageIdx;

      let circleInlineStyle = '';
      if (isCurrent) {
        circleInlineStyle = 'background:#4f46e5;color:#ffffff;box-shadow:0 0 0 4px rgba(99,102,241,0.25);border:none;';
      } else if (isPast) {
        circleInlineStyle = 'background:#10b981;color:#ffffff;box-shadow:0 0 0 2px rgba(16,185,129,0.3);border:none;';
      } else {
        circleInlineStyle = 'background:var(--bg-card);color:var(--text-muted);border:2px dashed #cbd5e1;';
      }

      return `
        <button
          class="btn-stage-node"
          data-stage-id="${st.id}"
          style="display:flex;flex-direction:column;align-items:center;border:none;background:transparent;cursor:pointer;gap:6px;transition:all var(--transition);position:relative;z-index:2;min-width:64px;"
          title="Pindahkan tiket ke: ${st.label}"
        >
          <div style="width:40px;height:40px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;font-weight:800;transition:all var(--transition);${circleInlineStyle}">
            <span>${st.pct}%</span>
            ${isPast ? `<span style="font-size:9px;line-height:1;">✓</span>` : ''}
          </div>
          <div style="text-align:center;">
            <div style="font-size:11px;font-weight:${isCurrent ? '800' : '600'};color:${isCurrent ? 'var(--indigo-600)' : 'var(--text-primary)'};white-space:nowrap;">
              ${st.label}
            </div>
            <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">
              ${isCurrent ? '<span style="color:var(--indigo-600);font-weight:700;">Sedang Aktif</span>' : isPast ? 'Selesai' : 'Klik untuk pindah'}
            </span>
          </div>
        </button>
      `;
    }).join('');

    // Tabs List
    const commentsList = (state.comments || []).filter(c => c.taskId === currentTask.id);
    const eventsList = (state.events || []).filter(e => e.taskId === currentTask.id);

    const TABS = [
      { id: 'overview', label: 'Overview' },
      { id: 'subtasks', label: `Subtasks & Spesifikasi`, badge: `${completedSubtasks}/${subtasks.length}` },
      { id: 'ai', label: '✨ AI Dev Assistant & Fix Bug', isSpark: true },
      { id: 'git', label: 'Pengembangan Git & CI/CD' },
      { id: 'comments', label: 'Komentar & Diskusi', badge: commentsList.length },
      { id: 'history', label: 'Jejak Audit Aktivitas', badge: eventsList.length }
    ];

    const tabsHtml = TABS.map(t => {
      const isActive = this.activeTab === t.id;
      return `
        <button
          class="btn-detail-tab ${isActive ? 'active' : ''}"
          data-tab="${t.id}"
          style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:${isActive ? '800' : '600'};color:${isActive ? 'var(--indigo-600)' : 'var(--text-secondary)'};border-bottom:2px solid ${isActive ? 'var(--indigo-600)' : 'transparent'};transition:all var(--transition);white-space:nowrap;"
        >
          <span>${t.label}</span>
          ${t.badge !== undefined ? `
            <span style="padding:1px 7px;border-radius:9999px;font-size:10px;font-family:var(--font-mono);font-weight:700;background:${isActive ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)'};color:${isActive ? 'var(--indigo-600)' : 'var(--text-muted)'};">
              ${t.badge}
            </span>
          ` : ''}
        </button>
      `;
    }).join('');

    // Render Tab Body Content
    let tabContentHtml = '';

    if (this.activeTab === 'overview') {
      tabContentHtml = `
        <div class="overview-grid">
          
          <!-- Sisi Kiri (70%): Area Pekerjaan Utama -->
          <div class="overview-main">
            
            <!-- AI Dev Assistant: Next Best Action Banner (Persis Gambar 2) -->
            <div style="padding:18px 20px;border-radius:var(--radius-xl);background:linear-gradient(135deg, rgba(99,102,241,.07), rgba(139,92,246,.07));border:1px solid rgba(99,102,241,.2);box-shadow:var(--shadow-xs);">
              <div style="display:flex;align-items:flex-start;gap:14px;">
                <div style="width:38px;height:38px;border-radius:var(--radius-lg);background:var(--indigo-600);color:#ffffff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 10px rgba(99,102,241,0.25);">
                  ${ICONS.sparkles}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                    <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--indigo-600);letter-spacing:.05em;margin:0;">
                      AI DEV ASSISTANT: NEXT BEST ACTION
                    </h4>
                    <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;background:rgba(99,102,241,0.12);color:var(--indigo-600);">
                      Confidence 98%
                    </span>
                  </div>
                  <p style="font-size:12.5px;font-weight:600;color:var(--text-primary);margin:6px 0 0 0;line-height:1.5;">
                    ${currentTask.type === 'Bug' 
                      ? 'Laporan bug terdeteksi di modul perpustakaan. AI Engine siap mereproduksi trace exception, membuat PR perbaikan fix bug, dan menjalankan CI tests.'
                      : 'Implementasi middleware otorisasi terdistribusi di seluruh microservices Laravel. Mengamankan endpoint peminjaman dan reservasi hanya untuk kartu aktif terverifikasi.'}
                  </p>
                  <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;">
                    <button id="btn-quick-ai-fix" class="btn btn-primary" style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;display:inline-flex;align-items:center;gap:6px;">
                      ${ICONS.bot}
                      <span>Jalankan Auto-Fix AI</span>
                    </button>
                    <button id="btn-quick-generate-tests" class="btn btn-secondary" style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;">
                      Generate Test Suite Otomatis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card: DESKRIPSI TIKET (Persis Teks Gambar 1) -->
            <div class="card" style="padding:20px 22px;display:flex;flex-direction:column;gap:12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
                  DESKRIPSI TIKET
                </h3>
                <span style="font-size:11px;color:var(--text-muted);">Format: Markdown & Plain Text</span>
              </div>
              <div style="font-size:13px;line-height:1.7;color:var(--text-primary);background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;">
                ${currentTask.description || 'Implementasi middleware otorisasi terdistribusi di seluruh microservices Laravel. Mengamankan endpoint peminjaman dan reservasi hanya untuk kartu aktif terverifikasi.'}
              </div>
            </div>

            <!-- Card: SUBTASKS CHECKLIST INTERAKTIF -->
            <div class="card" style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;">
              <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:var(--indigo-600);">${ICONS.checkSquare}</span>
                  <h3 style="font-size:13px;font-weight:800;color:var(--text-primary);margin:0;">
                    Checklist Subtask (${completedSubtasks}/${subtasks.length} Selesai)
                  </h3>
                </div>
                <span style="font-size:12px;font-weight:700;font-family:var(--font-mono);color:var(--indigo-600);">
                  ${subtaskPct}% Selesai
                </span>
              </div>

              <!-- Progress Bar 6px -->
              <div style="width:100%;height:6px;border-radius:9999px;background:var(--bg-secondary);overflow:hidden;">
                <div style="width:${subtaskPct}%;height:100%;background:linear-gradient(90deg, #3b82f6, #10b981);transition:width 0.3s ease;"></div>
              </div>

              <!-- List of Subtasks -->
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${subtasks.length === 0 ? `
                  <p style="font-size:12px;color:var(--text-muted);font-style:italic;margin:0;">Belum ada subtask pada tiket ini. Tambahkan subtask baru di bawah.</p>
                ` : subtasks.map((s) => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:var(--radius-md);background:${s.completed ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)'};border:1px solid ${s.completed ? 'rgba(16,185,129,0.2)' : 'var(--border)'};">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;min-width:0;">
                      <input
                        type="checkbox"
                        class="chk-toggle-subtask"
                        data-subtask-id="${s.id}"
                        ${s.completed ? 'checked' : ''}
                        style="width:16px;height:16px;accent-color:var(--indigo-600);cursor:pointer;"
                      />
                      <span style="font-size:12.5px;color:${s.completed ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${s.completed ? 'line-through' : 'none'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${s.title}
                      </span>
                    </label>
                    <button
                      class="btn-delete-subtask"
                      data-subtask-id="${s.id}"
                      style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:2px;margin-left:8px;"
                      title="Hapus subtask"
                    >
                      ${ICONS.trash}
                    </button>
                  </div>
                `).join('')}
              </div>

              <!-- Inline Add Subtask Form -->
              <form id="form-quick-subtask" style="display:flex;gap:8px;margin-top:4px;">
                <input
                  type="text"
                  id="input-quick-subtask"
                  placeholder="Tambahkan subtask baru lalu tekan Enter..."
                  class="form-input"
                  style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12px;"
                  required
                />
                <button type="submit" class="btn btn-secondary btn-sm" style="font-weight:700;padding:8px 14px;">
                  ${ICONS.plus} Tambah Subtask
                </button>
              </form>
            </div>

            <!-- Card: DISKUSI & KOMENTAR TIM (ROLE MODEL ASTACODE) -->
            <div class="card" style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;">
              <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:var(--indigo-600);display:inline-flex;">${ICONS.messageSquare}</span>
                  <h3 style="font-size:13px;font-weight:800;color:var(--text-primary);margin:0;">
                    Komentar & Diskusi Tim (${commentsList.length})
                  </h3>
                </div>
                <span style="font-size:11px;color:var(--text-muted);font-weight:600;">
                  Role Model ASTACODE ERP
                </span>
              </div>

              <!-- New Comment Form with Role Model Selector -->
              <form id="form-quick-comment" style="display:flex;flex-direction:column;gap:10px;">
                <!-- Role Model Selector Bar -->
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:8px 12px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                      Komentari Sebagai:
                    </span>
                    <select id="select-comment-author" class="form-select" style="padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-card);font-size:12px;font-weight:700;color:var(--text-primary);outline:none;cursor:pointer;">
                      ${state.teamMembers.map(m => `
                        <option value="${m.id}" ${(this.selectedCommentAuthorId || 'user-pm') === m.id ? 'selected' : ''}>
                          ${m.name} (${m.role})
                        </option>
                      `).join('')}
                    </select>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;"></span>
                    <span style="font-size:11px;color:var(--text-secondary);font-weight:600;">
                      ${state.teamMembers.find(m => m.id === (this.selectedCommentAuthorId || 'user-pm'))?.role || 'Team Member'}
                    </span>
                  </div>
                </div>

                <!-- Textarea -->
                <textarea
                  id="input-quick-comment"
                  rows="3"
                  class="form-textarea"
                  placeholder="Tulis tanggapan atau instruksi teknis untuk tiket ini..."
                  style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;color:var(--text-primary);resize:vertical;"
                  required
                ></textarea>

                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                  <label style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-muted);cursor:pointer;">
                    <input type="checkbox" id="chk-comment-internal" checked style="accent-color:var(--indigo-600);" />
                    <span>${ICONS.lock} Hanya Terlihat Tim Internal</span>
                  </label>
                  <button type="submit" class="btn btn-primary btn-sm" style="font-weight:700;padding:8px 16px;">
                    Kirim Komentar
                  </button>
                </div>
              </form>

              <!-- Feed of Recent Comments -->
              <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
                ${commentsList.length === 0 ? `
                  <p style="font-size:12px;color:var(--text-muted);font-style:italic;margin:0;">Belum ada diskusi pada tiket ini.</p>
                ` : commentsList.map(c => {
                  const rStyle = getRoleBadgeStyle(c.authorRole);
                  const formattedTime = formatCommentTime(c.createdAt);
                  const memberMatch = (state.teamMembers || []).find(m => m.id === c.authorId || m.name === c.authorName || m.name === c.author);
                  const avatarUrl = c.authorAvatar || memberMatch?.avatar || '';
                  const initials = (c.authorName || c.author || 'TM').substring(0, 2).toUpperCase();

                  return `
                    <div style="padding:12px 14px;border-radius:var(--radius-md);background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">
                      <!-- Top row: Avatar, Author, Role Badge, Visibility, Timestamp, Delete -->
                      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                          <!-- Avatar -->
                          <div style="width:26px;height:26px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--indigo-600);display:grid;place-items:center;">
                            ${avatarUrl ? `
                              <img src="${avatarUrl}" alt="${c.authorName || c.author}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\\'font-size:10px;font-weight:800;color:#fff;\\'>${initials}</span>';" />
                            ` : `
                              <span style="font-size:10px;font-weight:800;color:#fff;">${initials}</span>
                            `}
                          </div>
                          
                          <!-- Author Name -->
                          <strong style="font-size:12.5px;color:var(--text-primary);font-weight:700;">
                            ${c.authorName || c.author || 'Dev Team'}
                          </strong>

                          <!-- Role Badge -->
                          <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;background:${rStyle.bg};color:${rStyle.color};border:1px solid ${rStyle.border};">
                            ${c.authorRole || memberMatch?.role || 'Team'}
                          </span>

                          <!-- Visibility Tag -->
                          ${c.isInternal ? `
                            <span style="font-size:9.5px;color:var(--text-muted);display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border-radius:4px;background:rgba(100,116,139,0.08);">
                              ${ICONS.lock} Internal
                            </span>
                          ` : `
                            <span style="font-size:9.5px;color:#059669;display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border-radius:4px;background:rgba(16,185,129,0.1);">
                              <i class="fi fi-rr-globe"></i> Publik
                            </span>
                          `}
                        </div>

                        <!-- Right: Timestamp & Delete Button -->
                        <div style="display:flex;align-items:center;gap:6px;">
                          <span style="font-size:10.5px;font-family:var(--font-mono);color:var(--text-muted);">
                            ${formattedTime}
                          </span>
                          <button class="btn-delete-comment" data-comment-id="${c.id}" style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:3px;border-radius:4px;display:inline-flex;align-items:center;line-height:1;" title="Hapus komentar">
                            ${ICONS.trash}
                          </button>
                        </div>
                      </div>

                      <!-- Comment Body -->
                      <p style="font-size:12.5px;color:var(--text-secondary);margin:0;line-height:1.55;padding-left:34px;word-break:break-word;">
                        ${c.text || c.body || ''}
                      </p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- Sisi Kanan (30%): Sticky Metadata Rail (Persis Semua Fitur Gambar 1) -->
          <div class="overview-sidebar">
            
            <div class="card" style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
              
              <div style="border-bottom:1px solid var(--border);padding-bottom:10px;">
                <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
                  DETAIL TIKET
                </h3>
              </div>

              <!-- PRIORITAS -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                  PRIORITAS
                </label>
                <select id="meta-task-priority" class="form-select" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-weight:700;color:var(--text-primary);outline:none;">
                  <option value="Hotfix" ${currentTask.priority === 'Hotfix' ? 'selected' : ''}>Hotfix</option>
                  <option value="Tertinggi" ${currentTask.priority === 'Tertinggi' ? 'selected' : ''}>Tertinggi</option>
                  <option value="Tinggi" ${currentTask.priority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
                  <option value="Sedang" ${currentTask.priority === 'Sedang' ? 'selected' : ''}>Sedang</option>
                  <option value="Rendah" ${currentTask.priority === 'Rendah' ? 'selected' : ''}>Rendah</option>
                </select>
              </div>

              <!-- ASSIGNEE (PIC) DENGAN LINK TUGASKAN KE SAYA -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                    ASSIGNEE
                  </label>
                  <button id="btn-assign-to-me" style="border:none;background:transparent;color:var(--indigo-600);font-size:11px;font-weight:700;cursor:pointer;padding:0;" title="Tugaskan tiket ini ke profil saya">
                    Tugaskan ke Saya
                  </button>
                </div>
                <select id="meta-task-assignee" class="form-select" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-weight:600;color:var(--text-primary);outline:none;">
                  ${state.teamMembers.map(m => `
                    <option value="${m.id}" ${currentTask.assigneeId === m.id ? 'selected' : ''}>
                      ${m.name} (${m.role})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- PELAPOR (REPORTER) -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                  PELAPOR (REPORTER)
                </label>
                <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
                  <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800;">
                    A
                  </div>
                  <span style="font-size:12.5px;font-weight:600;color:var(--text-primary);">
                    ${reporter.name}
                  </span>
                </div>
              </div>

              <!-- JATUH TEMPO (DUE DATE) -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                  JATUH TEMPO (DUE DATE)
                </label>
                <input
                  type="date"
                  id="meta-task-duedate"
                  class="form-input"
                  value="${currentTask.dueDate || '2026-11-02'}"
                  style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);"
                />
              </div>

              <!-- TIME TRACKING (ESTIMASI & LOG JAM) -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                    TIME TRACKING
                  </label>
                  <span style="font-family:var(--font-mono);font-size:12px;font-weight:800;color:var(--text-primary);">
                    ${loggedHours}h / ${estHours}h
                  </span>
                </div>

                <div style="width:100%;height:6px;border-radius:9999px;background:var(--bg-secondary);overflow:hidden;">
                  <div style="width:${Math.min(100, Math.round((loggedHours / (estHours || 1)) * 100))}%;height:100%;background:var(--indigo-600);"></div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:2px;">
                  <div>
                    <span style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Estimasi (Jam)</span>
                    <input
                      type="number"
                      id="meta-task-esthours"
                      class="form-input"
                      value="${estHours}"
                      style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12px;font-family:var(--font-mono);font-weight:700;"
                    />
                  </div>
                  <div>
                    <span style="font-size:10px;color:var(--text-muted);display:block;margin-bottom:3px;">Log Jam</span>
                    <input
                      type="number"
                      id="meta-task-loghours"
                      class="form-input"
                      value="${loggedHours}"
                      style="width:100%;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12px;font-family:var(--font-mono);font-weight:700;"
                    />
                  </div>
                </div>
              </div>

              <!-- PENGEMBANGAN GIT -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                  PENGEMBANGAN GIT
                </label>
                <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;font-size:12px;">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
                    <span style="color:var(--text-muted);">Branch:</span>
                    <span style="font-family:var(--font-mono);color:var(--indigo-600);font-weight:700;word-break:break-all;">
                      ${currentTask.branchName || 'feature/sanctum-rbac-auth'}
                    </span>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="color:var(--text-muted);">Pull Request:</span>
                    <span style="font-size:11.5px;color:var(--text-secondary);font-weight:600;">Belum Dibuka</span>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid var(--border);">
                    <span style="color:var(--text-muted);">CI Status:</span>
                    <span style="color:#10b981;font-weight:800;font-size:11px;display:inline-flex;align-items:center;gap:4px;">
                      ✓ 6/6 Tests Passing
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      `;
    } else if (this.activeTab === 'subtasks') {
      tabContentHtml = `
        <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
            Daftar Lengkap Subtask & Kriteria Spesifikasi
          </h3>
          <p style="font-size:12.5px;color:var(--text-muted);margin:0;">
            Subtasks memecah deliverable tiket ini menjadi item pekerjaan mikro yang dapat diverifikasi mandiri.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${subtasks.map((s, idx) => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:var(--radius-md);background:var(--bg-secondary);border:1px solid var(--border);">
                <label style="display:flex;align-items:center;gap:12px;cursor:pointer;flex:1;">
                  <input type="checkbox" class="chk-toggle-subtask" data-subtask-id="${s.id}" ${s.completed ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--indigo-600);" />
                  <span style="font-size:13px;font-weight:${s.completed ? '400' : '600'};color:${s.completed ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${s.completed ? 'line-through' : 'none'};">
                    ${idx + 1}. ${s.title}
                  </span>
                </label>
                <button class="btn-delete-subtask" data-subtask-id="${s.id}" style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;" title="Hapus subtask">
                  ${ICONS.trash}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (this.activeTab === 'ai') {
      tabContentHtml = `
        <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);padding-bottom:12px;">
            <span style="color:var(--indigo-600);">${ICONS.bot}</span>
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
              AI Dev Assistant & Automated Bug Fixing Hub
            </h3>
          </div>
          <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;margin:0;">
            Mesin AI menganalisis stack Laravel Sanctum, route middleware, dan policy otorisasi untuk menghasilkan patch kode siap review.
          </p>
          <div style="padding:16px;border-radius:var(--radius-lg);background:#0f172a;color:#f8fafc;font-family:var(--font-mono);font-size:12px;line-height:1.6;">
            <div><span style="color:#60a5fa;">$</span> git checkout -b ${currentTask.branchName || 'feature/sanctum-rbac-auth'}</div>
            <div><span style="color:#34d399;">✓</span> Branch verified on GitHub Remote</div>
            <div><span style="color:#fbbf24;">●</span> Generating middleware AuthJwtSanctumMiddleware.php...</div>
            <div><span style="color:#34d399;">✓</span> Unit test AuthTokenTest::test_valid_sanctum_token PASS (0.12s)</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <button id="btn-trigger-ai-full" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;">
              ${ICONS.sparkles}
              <span>${this.isAiProcessing ? 'Sedang Memproses Patch AI...' : 'Terapkan Patch AI ke Staging'}</span>
            </button>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'git') {
      tabContentHtml = `
        <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);padding-bottom:12px;">
            <span style="color:var(--indigo-600);">${ICONS.gitBranch}</span>
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
              Integrasi Repositori Git & CI/CD Pipeline
            </h3>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:14px;">
            <div style="padding:14px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
              <span style="font-size:11px;color:var(--text-muted);display:block;">Cabang Git Aktif:</span>
              <strong style="font-family:var(--font-mono);color:var(--indigo-600);font-size:13px;">${currentTask.branchName || 'feature/sanctum-rbac-auth'}</strong>
            </div>
            <div style="padding:14px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
              <span style="font-size:11px;color:var(--text-muted);display:block;">Status Build CI/CD:</span>
              <strong style="color:#10b981;font-size:13px;">✓ 6/6 Tests Passing</strong>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeTab === 'comments') {
      tabContentHtml = `
        <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                Seluruh Riwayat Diskusi Tim (${commentsList.length})
              </h3>
              <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0 0;">
                Kolaborasi lintas role developer, QA, dan Project Manajer sesuai SOP
              </p>
            </div>
            <span style="font-size:11px;color:var(--text-muted);font-weight:600;">
              Role Model ASTACODE ERP
            </span>
          </div>

          <!-- Comment Form inside Tab -->
          <form id="form-tab-comment" style="display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                  Komentari Sebagai:
                </span>
                <select id="select-tab-comment-author" class="form-select" style="padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-card);font-size:12px;font-weight:700;color:var(--text-primary);outline:none;cursor:pointer;">
                  ${state.teamMembers.map(m => `
                    <option value="${m.id}" ${(this.selectedCommentAuthorId || 'user-pm') === m.id ? 'selected' : ''}>
                      ${m.name} (${m.role})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
            <textarea
              id="input-tab-comment"
              rows="3"
              class="form-textarea"
              placeholder="Tulis tanggapan atau instruksi teknis untuk tiket ini..."
              style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card);font-size:12.5px;color:var(--text-primary);resize:vertical;"
              required
            ></textarea>
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
              <label style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-muted);cursor:pointer;">
                <input type="checkbox" id="chk-tab-comment-internal" checked style="accent-color:var(--indigo-600);" />
                <span>${ICONS.lock} Hanya Terlihat Tim Internal</span>
              </label>
              <button type="submit" class="btn btn-primary btn-sm" style="font-weight:700;padding:8px 16px;">
                Kirim Komentar
              </button>
            </div>
          </form>

          <!-- Feed of Comments -->
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${commentsList.length === 0 ? '<p style="color:var(--text-muted);font-size:12px;font-style:italic;">Belum ada komentar.</p>' : commentsList.map(c => {
              const rStyle = getRoleBadgeStyle(c.authorRole);
              const formattedTime = formatCommentTime(c.createdAt);
              const memberMatch = (state.teamMembers || []).find(m => m.id === c.authorId || m.name === c.authorName || m.name === c.author);
              const avatarUrl = c.authorAvatar || memberMatch?.avatar || '';
              const initials = (c.authorName || c.author || 'TM').substring(0, 2).toUpperCase();

              return `
                <div style="padding:14px 16px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <div style="width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--indigo-600);display:grid;place-items:center;">
                        ${avatarUrl ? `
                          <img src="${avatarUrl}" alt="${c.authorName || c.author}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\\'font-size:10px;font-weight:800;color:#fff;\\'>${initials}</span>';" />
                        ` : `
                          <span style="font-size:10px;font-weight:800;color:#fff;">${initials}</span>
                        `}
                      </div>
                      <strong style="font-size:13px;color:var(--text-primary);">${c.authorName || c.author || 'Dev Team'}</strong>
                      <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;background:${rStyle.bg};color:${rStyle.color};border:1px solid ${rStyle.border};">
                        ${c.authorRole || memberMatch?.role || 'Team'}
                      </span>
                      ${c.isInternal ? `
                        <span style="font-size:9.5px;color:var(--text-muted);display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border-radius:4px;background:rgba(100,116,139,0.08);">
                          ${ICONS.lock} Internal
                        </span>
                      ` : `
                        <span style="font-size:9.5px;color:#059669;display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border-radius:4px;background:rgba(16,185,129,0.1);">
                          <i class="fi fi-rr-globe"></i> Publik
                        </span>
                      `}
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">${formattedTime}</span>
                      <button class="btn-delete-comment" data-comment-id="${c.id}" style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:3px;border-radius:4px;" title="Hapus komentar">
                        ${ICONS.trash}
                      </button>
                    </div>
                  </div>
                  <p style="font-size:13px;color:var(--text-secondary);margin:0;line-height:1.6;padding-left:36px;word-break:break-word;">
                    ${c.text || c.body || ''}
                  </p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (this.activeTab === 'history') {
      tabContentHtml = `
        <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
          <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">Jejak Audit Aktivitas & Perubahan Status</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${eventsList.length === 0 ? '<p style="color:var(--text-muted);font-size:12px;">Belum ada jejak audit tercatat.</p>' : eventsList.map(e => `
              <div style="padding:12px 14px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <strong style="font-size:12.5px;color:var(--text-primary);">${e.action}</strong>
                  <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">Oleh: ${e.actorName || 'User'} (${e.actorRole || 'Tim'})</p>
                </div>
                <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);">${new Date(e.timestamp || Date.now()).toLocaleDateString('id-ID')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // MAIN COMPONENT MARKUP (100% PERSIS GAYA SALES PIPELINE CRM GAMBAR 2)
    this.container.innerHTML = `
      <!-- 1. Header Workspace Bar (Proporsional & Bersih) -->
      <div style="padding:18px 24px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow-xs);">
        
        <!-- Baris 1: Tombol Icon Panah Saja + Badges di Kiri, Tombol Aksi di Kanan -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <!-- Kiri: Panah Kiri Saja + Key + Status + Priority + Type -->
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <!-- Back to Kanban Icon Only Button -->
            <button
              id="btn-back-kanban"
              class="btn btn-secondary btn-icon"
              style="width:36px;height:36px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);cursor:pointer;transition:all var(--transition);"
              title="Kembali ke Papan Kanban"
            >
              ${ICONS.arrowLeft}
            </button>

            <!-- Key Badge (Copyable) -->
            <button
              id="btn-copy-key"
              style="display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-weight:800;font-size:11.5px;padding:4px 10px;border-radius:6px;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);cursor:pointer;outline:none;"
              title="Klik untuk salin kode tiket"
            >
              <span>${currentTask.key}</span>
              ${ICONS.copy}
            </button>

            <!-- Status Lozenge -->
            <span style="font-size:10.5px;font-family:var(--font-mono);font-weight:800;padding:3px 8px;border-radius:6px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);">
              ${currentTask.status.toUpperCase()}
            </span>

            <!-- Priority Badge -->
            <span style="font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:9999px;${priorityBadgeBg}">
              ${currentTask.priority}
            </span>

            <!-- Type Pill -->
            <span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(99,102,241,0.08);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.2);">
              ✨ ${currentTask.type || 'Feature'}
            </span>
          </div>

          <!-- Kanan: Quick Action Buttons -->
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button id="btn-action-attach" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 12px;border-radius:8px;">
              ${ICONS.paperclip}
              <span>Lampirkan</span>
            </button>
            <button id="btn-action-add-subtask" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 12px;border-radius:8px;">
              ${ICONS.checkSquare}
              <span>Buat Subtask</span>
            </button>
            <button id="btn-action-link-issue" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 12px;border-radius:8px;">
              ${ICONS.link}
              <span>Tautkan Masalah</span>
            </button>
            <button id="btn-action-auto-fix" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 14px;border-radius:8px;background:linear-gradient(135deg, #4f46e5, #7c3aed);border:none;">
              ${ICONS.sparkles}
              <span>Auto-Fix AI</span>
            </button>
            <button id="btn-action-delete" class="btn btn-danger btn-sm" style="padding:7px 10px;border-radius:8px;" title="Hapus tiket">
              ${ICONS.trash}
            </button>
          </div>
        </div>

        <!-- Baris 2: Judul Tiket (Lebar Penuh & Lega) -->
        <div style="padding-top:2px;">
          <h1 style="font-size:19px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;margin:0;line-height:1.35;">
            ${currentTask.title}
          </h1>
        </div>

        <!-- Baris 3: Metadata Info Horisontal Satu Baris Rapi -->
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted);flex-wrap:wrap;">
          <span style="font-weight:700;color:var(--text-primary);display:inline-flex;align-items:center;gap:5px;">
            <i class="fi fi-rr-book-alt" style="font-size:13px;color:var(--indigo-600);"></i>
            <span>${project.name}</span>
          </span>
          <span>•</span>
          <span style="color:var(--indigo-600);font-weight:600;display:inline-flex;align-items:center;gap:4px;">
            <i class="fi fi-rr-layers" style="font-size:13px;"></i>
            <span>${epic.title}</span>
          </span>
          <span>•</span>
          <span>Dibuat 18 Okt 2026 · Diperbarui 19.00</span>
          <span>•</span>
          <span style="display:inline-flex;align-items:center;gap:4px;color:var(--text-muted);">
            ${ICONS.lock}
            <span>Internal Saja</span>
          </span>
        </div>
      </div>

        <!-- 2. Track Record Pipeline / Lifecycle Stepper (Persis Gambar 2) -->
        <div style="display:flex;flex-direction:column;gap:8px;">
          
          <!-- Outer Header Row: Track Record Title & Badges OUTSIDE/ABOVE card -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;font-size:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-weight:800;font-size:11px;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.05em;">
                TRACK RECORD TIKET:
              </span>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:9999px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);color:var(--indigo-600);font-weight:700;font-family:var(--font-mono);font-size:11px;">
                <span style="width:6px;height:6px;border-radius:50%;background:var(--indigo-600);display:inline-block;"></span>
                <span>${activePercent}% SIKLUS CAPAIAN</span>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11.5px;font-weight:600;color:var(--text-secondary);">
                Tahap Saat Ini: <strong style="color:var(--text-primary);">${activeStage.label}</strong>
              </span>
              <span style="font-size:10px;font-family:var(--font-mono);font-weight:700;padding:2px 8px;border-radius:4px;background:rgba(245,158,11,0.1);color:#d97706;border:1px solid rgba(245,158,11,0.25);">
                SLA: 2 Hari
              </span>
            </div>
          </div>

          <!-- Stepper White Card Container -->
          <div class="card" style="padding:18px 22px;border-radius:var(--radius-xl);border:1px solid var(--border);position:relative;overflow:hidden;background:var(--bg-card);box-shadow:var(--shadow-xs);">
            
            <!-- Horizontal Continuous Progress Track Background Line -->
            <div style="position:absolute;top:38px;left:8%;right:8%;height:3px;background:var(--border);z-index:1;"></div>
            
            <!-- Active Colored Progress Line -->
            <div style="position:absolute;top:38px;left:8%;height:3px;background:linear-gradient(90deg, #3b82f6, #6366f1, #10b981);z-index:1;width:${activeProgressWidth}%;transition:width 0.4s ease;"></div>

            <!-- Circular Milestone Nodes (6 Fase Software House Gambar 1) -->
            <div class="stepper-rail-container">
              ${milestoneNodesHtml}
            </div>

            <!-- Bottom Gate Standar Mutu & Action Buttons Row (Persis Gambar 2) -->
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-size:12px;">
              <div style="display:flex;align-items:center;gap:6px;color:var(--text-muted);font-size:11.5px;">
                <span style="font-weight:700;color:var(--text-secondary);">Gate Standar Mutu:</span>
                <span>${activeStage.gateRule}</span>
              </div>

              <div style="display:flex;align-items:center;gap:8px;">
                <button id="btn-advance-phase" class="btn btn-primary btn-sm" style="font-weight:700;padding:7px 14px;border-radius:8px;background:var(--indigo-600);color:#ffffff;display:inline-flex;align-items:center;gap:6px;">
                  <span>Lanjut Fase Berikutnya</span>
                  ${ICONS.arrowRight}
                </button>
                <button id="btn-mark-blocked" class="btn btn-danger btn-sm" style="font-weight:700;padding:7px 12px;border-radius:8px;background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.3);">
                  Tandai Blocked
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- 3. Navigation Tabs Bar (Persis Gambar 2) -->
      <div style="padding:0 24px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;gap:4px;overflow-x:auto;">
        ${tabsHtml}
      </div>

      <!-- 4. Dynamic Tab Workspace Content (Grid 70/30 Proporsional) -->
      <div style="padding:24px;flex:1;">
        ${tabContentHtml}
      </div>
    `;

    this.attachEvents(currentTask);
  }

  attachFallbackEvents() {
    const btn = this.container.querySelector('#btn-back-kanban-fallback');
    if (btn) {
      btn.addEventListener('click', () => {
        store.closeTaskDetail();
      });
    }
  }

  attachEvents(task) {
    // Back to Kanban button
    const backBtn = this.container.querySelector('#btn-back-kanban');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        store.closeTaskDetail();
      });
    }

    // Copy Task Key Button
    const copyBtn = this.container.querySelector('#btn-copy-key');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(task.key).then(() => {
          store.addToast('info', 'Kode Tersalin', `Kode tiket ${task.key} berhasil disalin ke clipboard.`);
        });
      });
    }

    // Stage Milestone Buttons Click (Interactive Stage Change)
    this.container.querySelectorAll('.btn-stage-node[data-stage-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStage = btn.dataset.stageId;
        if (targetStage && targetStage !== task.status) {
          store.updateTaskStatus(task.id, targetStage, `Dipindahkan via Lifecycle Stepper`);
        }
      });
    });

    // Advance to Next Phase Button
    const advanceBtn = this.container.querySelector('#btn-advance-phase');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => {
        const curIdx = this.getStageIndex(task.status);
        if (curIdx < SOFTWARE_HOUSE_STAGES.length - 1) {
          const nextStage = SOFTWARE_HOUSE_STAGES[curIdx + 1];
          store.updateTaskStatus(task.id, nextStage.id, `Lanjut ke fase ${nextStage.label}`);
        } else {
          store.addToast('success', 'Fase Selesai', 'Tiket sudah berada di fase akhir (Production Live).');
        }
      });
    }

    // Mark Blocked Button
    const blockedBtn = this.container.querySelector('#btn-mark-blocked');
    if (blockedBtn) {
      blockedBtn.addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin menandai tiket ${task.key} sebagai Blocked?`)) {
          store.updateTaskStatus(task.id, 'Perlu Manual', 'Ditandai Blocked / Perlu Tinjauan Manual');
        }
      });
    }

    // Tab switcher buttons
    this.container.querySelectorAll('.btn-detail-tab[data-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        this.activeTab = tabBtn.dataset.tab;
        this.render();
      });
    });

    // Quick Action Auto-Fix AI & Quick AI Fix inside overview
    const triggerAi = () => {
      this.isAiProcessing = true;
      store.addToast('info', 'AI Dev Assistant', `Memulai analisis dan auto-fix patch untuk ${task.key}...`);
      setTimeout(() => {
        this.isAiProcessing = false;
        store.updateTaskStatus(task.id, 'In Review', 'Auto-Fix patch AI berhasil dipublish ke PR Staging');
        store.addToast('success', 'Auto-Fix AI Berhasil', `Patch fix untuk ${task.key} telah diajukan ke Review PR.`);
      }, 1500);
    };

    const actionAutoFix = this.container.querySelector('#btn-action-auto-fix');
    if (actionAutoFix) actionAutoFix.addEventListener('click', triggerAi);

    const quickAiFix = this.container.querySelector('#btn-quick-ai-fix');
    if (quickAiFix) quickAiFix.addEventListener('click', triggerAi);

    const fullAiTrigger = this.container.querySelector('#btn-trigger-ai-full');
    if (fullAiTrigger) fullAiTrigger.addEventListener('click', triggerAi);

    // Delete task button
    const deleteBtn = this.container.querySelector('#btn-action-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin menghapus tiket ${task.key}?`)) {
          store.deleteTask(task.id);
          store.closeTaskDetail();
        }
      });
    }

    // Subtask toggle checkboxes
    this.container.querySelectorAll('.chk-toggle-subtask[data-subtask-id]').forEach(chk => {
      chk.addEventListener('change', () => {
        const subId = chk.dataset.subtaskId;
        if (subId) {
          store.toggleSubtask(task.id, subId);
        }
      });
    });

    // Delete subtask buttons
    this.container.querySelectorAll('.btn-delete-subtask[data-subtask-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const subId = btn.dataset.subtaskId;
        if (subId && confirm('Hapus subtask ini?')) {
          const updatedSubtasks = (task.subtasks || []).filter(s => s.id !== subId);
          store.updateTask(task.id, { subtasks: updatedSubtasks });
          store.addToast('info', 'Subtask Dihapus', 'Subtask berhasil dihapus.');
        }
      });
    });

    // Add subtask form
    const subtaskForm = this.container.querySelector('#form-quick-subtask');
    if (subtaskForm) {
      subtaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.container.querySelector('#input-quick-subtask');
        if (input && input.value.trim()) {
          store.addSubtask(task.id, input.value.trim());
          input.value = '';
        }
      });
    }

    // Comment Author Selectors (Role Model Synchronization)
    const authorSelect = this.container.querySelector('#select-comment-author');
    if (authorSelect) {
      authorSelect.addEventListener('change', (e) => {
        this.selectedCommentAuthorId = e.target.value;
      });
    }

    const tabAuthorSelect = this.container.querySelector('#select-tab-comment-author');
    if (tabAuthorSelect) {
      tabAuthorSelect.addEventListener('change', (e) => {
        this.selectedCommentAuthorId = e.target.value;
      });
    }

    // Add comment handler helper
    const handleCommentSubmit = (inputId, chkId, selectId) => {
      const input = this.container.querySelector(inputId);
      const chkInternal = this.container.querySelector(chkId);
      const selAuthor = this.container.querySelector(selectId);
      
      if (input && input.value.trim()) {
        const authorId = (selAuthor ? selAuthor.value : this.selectedCommentAuthorId) || 'user-pm';
        const member = (state.teamMembers || []).find(m => m.id === authorId) || (state.teamMembers || [])[0] || {
          id: 'user-pm',
          name: 'Asisyah',
          role: 'Project Manajer',
          avatar: ''
        };

        const newComment = {
          id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          taskId: task.id,
          authorId: member.id,
          author: member.name,
          authorName: member.name,
          authorRole: member.role,
          authorAvatar: member.avatar || '',
          text: input.value.trim(),
          body: input.value.trim(),
          createdAt: new Date().toISOString(),
          isInternal: chkInternal ? chkInternal.checked : true
        };

        store.addComment(newComment);
        input.value = '';
      }
    };

    // Quick Comment Form in Overview
    const commentForm = this.container.querySelector('#form-quick-comment');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCommentSubmit('#input-quick-comment', '#chk-comment-internal', '#select-comment-author');
      });
    }

    // Tab Comment Form in Comments Tab
    const tabCommentForm = this.container.querySelector('#form-tab-comment');
    if (tabCommentForm) {
      tabCommentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCommentSubmit('#input-tab-comment', '#chk-tab-comment-internal', '#select-tab-comment-author');
      });
    }

    // Delete comment buttons (Interactive per comment)
    this.container.querySelectorAll('.btn-delete-comment[data-comment-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const commentId = btn.dataset.commentId;
        if (commentId && confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
          store.deleteComment(commentId);
        }
      });
    });

    // Metadata inputs: Priority
    const prioritySelect = this.container.querySelector('#meta-task-priority');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        store.updateTask(task.id, { priority: e.target.value });
        store.addToast('info', 'Prioritas Diubah', `Prioritas diubah ke ${e.target.value}`);
      });
    }

    // Metadata inputs: Assignee
    const assigneeSelect = this.container.querySelector('#meta-task-assignee');
    if (assigneeSelect) {
      assigneeSelect.addEventListener('change', (e) => {
        store.updateTask(task.id, { assigneeId: e.target.value });
        store.addToast('info', 'Assignee Diperbarui', 'Pekerjaan ditugaskan ke anggota tim terpilih.');
      });
    }

    // Assign to me button
    const assignToMeBtn = this.container.querySelector('#btn-assign-to-me');
    if (assignToMeBtn) {
      assignToMeBtn.addEventListener('click', () => {
        store.updateTask(task.id, { assigneeId: 'user-pm' });
        store.addToast('success', 'Ditugaskan', 'Tiket berhasil ditugaskan ke profil Anda.');
      });
    }

    // Due date input
    const dueDateInput = this.container.querySelector('#meta-task-duedate');
    if (dueDateInput) {
      dueDateInput.addEventListener('change', (e) => {
        store.updateTask(task.id, { dueDate: e.target.value });
        store.addToast('info', 'Tenggat Diubah', `Target jatuh tempo diset ke ${e.target.value}`);
      });
    }

    // Estimasi & Log jam
    const estInput = this.container.querySelector('#meta-task-esthours');
    if (estInput) {
      estInput.addEventListener('change', (e) => {
        const val = Number(e.target.value) || 0;
        store.updateTask(task.id, { estimateHours: val });
      });
    }

    const logInput = this.container.querySelector('#meta-task-loghours');
    if (logInput) {
      logInput.addEventListener('change', (e) => {
        const val = Number(e.target.value) || 0;
        store.updateTask(task.id, { timeLoggedHours: val });
        store.addToast('info', 'Jam Kerja Dicatat', `${val} jam kerja telah tercatat.`);
      });
    }

    // Action bar buttons: Lampirkan, Buat Subtask, Tautkan Masalah
    const btnAttach = this.container.querySelector('#btn-action-attach');
    if (btnAttach) {
      btnAttach.addEventListener('click', () => {
        store.addToast('info', 'Lampirkan Berkas', 'Pilih file PDF, gambar, atau log untuk dilampirkan.');
      });
    }

    const btnSubtask = this.container.querySelector('#btn-action-add-subtask');
    if (btnSubtask) {
      btnSubtask.addEventListener('click', () => {
        const title = prompt('Masukkan judul subtask baru:');
        if (title && title.trim()) {
          store.addSubtask(task.id, title.trim());
        }
      });
    }

    const btnLink = this.container.querySelector('#btn-action-link-issue');
    if (btnLink) {
      btnLink.addEventListener('click', () => {
        store.addToast('info', 'Tautkan Masalah', 'Fitur relasi issue Jira (blocks/is blocked by/relates to) aktif.');
      });
    }
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
