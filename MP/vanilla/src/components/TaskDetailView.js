/**
 * TaskDetailView.js — Detail View Papan Kanban Proporsional Berstandar ASTACODE CRM & Software House
 * 
 * Layout Proporsional UI/UX:
 * - Tab 1 (Overview): 70% Kolom Kiri (AI Dev Assistant, Deskripsi, Checklist Subtask, Diskusi Tim) & 30% Kolom Kanan (Sticky Detail Tiket)
 * - Tab 2 (Subtask & Spesifikasi, AI Asisten & Jejak Audit): Menggabungkan 3 fitur utama (1. Subtask & Sertifikasi, 2. AI Asisten & Fix Bug, 3. Jejak Audit Aktivitas) dalam satu halaman terpadu yang proporsional.
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
  messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  activity: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
};

// 6 Fase Siklus Standar Software House
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

    this.activeTab = 'overview'; // 'overview' | 'subtask_ai_audit'
    this.isSubtaskModalOpen = false;
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

    // Ensure valid activeTab
    if (this.activeTab !== 'overview' && this.activeTab !== 'subtask_ai_audit') {
      this.activeTab = 'overview';
    }

    // Refresh state data
    const currentTask = state.tasks.find(t => t.id === task.id) || task;
    const taskProject = (state.projects || []).find(p => p.id === currentTask.projectId) || store.getActiveProject() || { name: 'Proyek Aktif', code: 'PRJ' };
    const taskEpic = (state.epics || []).find(e => e.id === currentTask.epicId);
    const taskKeySlug = (currentTask.key || 'task-101').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const effectiveBranchName = currentTask.branchName || `${currentTask.type === 'Bug' ? 'fix' : 'feature'}/${taskKeySlug}-implementation`;
    const aiRecommendationText = currentTask.rootCauseAnalysis
      ? `Analisis Root Cause (${currentTask.key}): ${currentTask.rootCauseAnalysis} — AI Engine siap membuat PR perbaikan dan menjalankan CI tests pada proyek ${taskProject.name}.`
      : currentTask.type === 'Bug'
        ? `Laporan bug terdeteksi pada ${taskEpic ? `modul "${taskEpic.title}"` : `proyek ${taskProject.name}`} (${currentTask.key}). AI Engine siap mereproduksi trace exception, menyusun patch perbaikan untuk "${currentTask.title}", dan memvalidasi unit test otomatis.`
        : `Rekomendasi implementasi untuk tiket ${currentTask.key} (${taskProject.code}): Selesaikan "${currentTask.title}"${taskEpic ? ` pada epik "${taskEpic.title}"` : ''} di branch ${effectiveBranchName} lalu jalankan automated test suite sebelum diajukan ke Review PR.`;
    const reporter = state.teamMembers.find(m => m.id === currentTask.reporterId) || { name: 'Asisyah (Manual)', role: 'Project Manager' };
    
    const subtasks = currentTask.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const subtaskPct = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
    const loggedHours = currentTask.timeLoggedHours || 0;
    const estHours = Number(currentTask.estimateHours) || 20;

    // Priority badge class
    let priorityBadgeBg = 'rgba(59,130,246,0.1); color:#2563eb; border:1px solid rgba(59,130,246,0.25);';
    if (currentTask.priority === 'Tertinggi' || currentTask.priority === 'Hotfix') {
      priorityBadgeBg = 'rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25);';
    } else if (currentTask.priority === 'Tinggi') {
      priorityBadgeBg = 'rgba(245,158,11,0.1); color:#d97706; border:1px solid rgba(245,158,11,0.25);';
    } else if (currentTask.priority === 'Rendah') {
      priorityBadgeBg = 'rgba(100,116,139,0.1); color:#64748b; border:1px solid rgba(100,116,139,0.25);';
    }

    // Tabs List: Overview + Unified Tab (Subtask & Sertifikasi, AI Asisten & Fix Bug, Jejak Audit Aktivitas)
    const commentsList = (state.comments || []).filter(c => c.taskId === currentTask.id);
    const eventsList = (state.events || []).filter(e => e.taskId === currentTask.id);

    const TABS = [
      { id: 'overview', label: 'Ringkasan' },
      {
        id: 'subtask_ai_audit',
        label: 'Subtask & AI & LOG',
        badge: `${completedSubtasks}/${subtasks.length}`
      }
    ];

    const tabsHtml = TABS.map(t => {
      const isActive = this.activeTab === t.id;
      return `
        <button
          class="btn-detail-tab ${isActive ? 'active' : ''}"
          data-tab="${t.id}"
          style="display:inline-flex;align-items:center;gap:6px;padding:11px 16px;flex-shrink:0;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:${isActive ? '800' : '600'};color:${isActive ? 'var(--indigo-600)' : 'var(--text-secondary)'};border-bottom:2px solid ${isActive ? 'var(--indigo-600)' : 'transparent'};transition:all var(--transition);white-space:nowrap;"
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
            
            <!-- AI Dev Assistant: Next Best Action Banner -->
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
                      ? aiRecommendationText
                      : aiRecommendationText}
                  </p>
                  <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;">
                    <button id="btn-quick-ai-fix" class="btn btn-primary" style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;display:inline-flex;align-items:center;gap:6px;">
                      ${ICONS.bot}
                      <span>Jalankan Auto-Fix AI</span>
                    </button>
                    <button id="btn-quick-generate-tests" class="btn btn-secondary" style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;">
                      Buat Test Suite Otomatis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card: DESKRIPSI TIKET -->
            <div class="card" style="padding:20px 22px;display:flex;flex-direction:column;gap:12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
                  DESKRIPSI TIKET
                </h3>
                <span style="font-size:11px;color:var(--text-muted);">Format: Markdown & Plain Text</span>
              </div>
              <div style="font-size:13px;line-height:1.7;color:var(--text-primary);background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;">
                ${currentTask.description || `Penyelesaian deliverable teknis untuk tiket ${currentTask.key}: ${currentTask.title} pada proyek ${taskProject.name}.`}
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
                ` : subtasks.map((s) => {
                  const subAssignee = s.assigneeId ? (state.teamMembers || []).find(m => m.id === s.assigneeId) : null;
                  return `
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:var(--radius-md);background:${s.completed ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)'};border:1px solid ${s.completed ? 'rgba(16,185,129,0.2)' : 'var(--border)'};">
                    <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;flex:1;min-width:0;">
                      <input
                        type="checkbox"
                        class="chk-toggle-subtask"
                        data-subtask-id="${s.id}"
                        ${s.completed ? 'checked' : ''}
                        style="width:16px;height:16px;margin-top:2px;accent-color:var(--indigo-600);cursor:pointer;flex-shrink:0;"
                      />
                      <div style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;">
                        <span style="font-size:12.5px;font-weight:${s.completed ? '500' : '600'};color:${s.completed ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${s.completed ? 'line-through' : 'none'};line-height:1.4;">
                          ${s.title}
                        </span>
                        ${(s.category || subAssignee || s.estimateHours || s.notes) ? `
                          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:10.5px;color:var(--text-muted);">
                            ${s.category ? `<span style="padding:1px 6px;border-radius:4px;background:rgba(99,102,241,0.08);color:var(--indigo-600);font-weight:700;">${s.category}</span>` : ''}
                            ${subAssignee ? `<span>PIC: <strong style="color:var(--text-secondary);">${subAssignee.name}</strong></span>` : ''}
                            ${s.estimateHours ? `<span style="font-family:var(--font-mono);font-weight:600;">${s.estimateHours} Jam</span>` : ''}
                            ${s.notes ? `<span style="color:var(--text-muted);">· ${s.notes}</span>` : ''}
                          </div>
                        ` : ''}
                      </div>
                    </label>
                    <button
                      class="btn-delete-subtask"
                      data-subtask-id="${s.id}"
                      style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:2px;margin-left:8px;flex-shrink:0;"
                      title="Hapus subtask"
                    >
                      ${ICONS.trash}
                    </button>
                  </div>
                `;
                }).join('')}
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
                    <span id="comment-author-role-label" style="font-size:11px;color:var(--text-secondary);font-weight:600;">
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

                        <!-- Right: Timestamp, Reply & Delete Button -->
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span style="font-size:10.5px;font-family:var(--font-mono);color:var(--text-muted);">
                            ${formattedTime}
                          </span>
                          <button type="button" class="btn-reply-comment" data-author-name="${c.authorName || c.author || 'Tim'}" style="border:none;background:transparent;color:var(--indigo-600);cursor:pointer;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;" title="Balas komentar ini">
                            Balas
                          </button>
                          <button type="button" class="btn-delete-comment" data-comment-id="${c.id}" style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:3px;border-radius:4px;display:inline-flex;align-items:center;line-height:1;" title="Hapus komentar">
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

          <!-- Sisi Kanan (30%): Sticky Metadata Rail -->
          <div class="overview-sidebar">
            
            <div class="card" style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
              
              <div style="border-bottom:1px solid var(--border);padding-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
                <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
                  DETAIL TIKET
                </h3>
                <span style="font-size:10.5px;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);background:rgba(99,102,241,0.1);padding:2px 8px;border-radius:6px;">
                  ${currentTask.key}
                </span>
              </div>

              <!-- STATUS TIKET -->
              <div class="form-group" style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.04em;">
                  STATUS WORKFLOW
                </label>
                <select id="meta-task-status" class="form-select" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-weight:700;color:var(--text-primary);outline:none;">
                  <option value="Backlog" ${currentTask.status === 'Backlog' ? 'selected' : ''}>Backlog</option>
                  <option value="To Do" ${currentTask.status === 'To Do' ? 'selected' : ''}>To Do</option>
                  <option value="In Progress" ${currentTask.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="In Review" ${currentTask.status === 'In Review' ? 'selected' : ''}>In Review (PR)</option>
                  <option value="QA/Testing" ${currentTask.status === 'QA/Testing' ? 'selected' : ''}>QA / Staging</option>
                  <option value="Selesai" ${currentTask.status === 'Selesai' ? 'selected' : ''}>Selesai (Done)</option>
                </select>
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
                  <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800;flex-shrink:0;">
                    ${(reporter.name || 'A').charAt(0).toUpperCase()}
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
                      ${effectiveBranchName}
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
    } else if (this.activeTab === 'subtask_ai_audit') {
      // TAB TERPADU: 1. Subtask & Sertifikasi + 2. AI Asisten & Fix Bug + 3. Jejak Audit Aktivitas
      const assigneeMember = state.teamMembers.find(m => m.id === currentTask.assigneeId) || { name: 'Developer', role: 'Engineering' };
      const certStatusText = subtaskPct === 100 && subtasks.length > 0 ? 'Tersertifikasi QA (100%)' : 'Dalam Verifikasi QA';
      const certBadgeStyle = subtaskPct === 100 && subtasks.length > 0
        ? 'background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.3);'
        : 'background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);';

      tabContentHtml = `
        <div style="display:flex;flex-direction:column;gap:20px;">
          
          <!-- Baris Ringkasan 3 Pilar (Proporsional 3 Kolom) -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;">
            <!-- Metrik 1: Subtask & Sertifikasi -->
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:4px;min-width:0;">
                <span style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-muted);">
                  1. SUBTASK & SERTIFIKASI QA
                </span>
                <div style="display:flex;align-items:baseline;gap:8px;">
                  <strong style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--text-primary);">
                    ${completedSubtasks}/${subtasks.length}
                  </strong>
                  <span style="font-size:12px;font-weight:700;color:var(--indigo-600);">${subtaskPct}% Selesai</span>
                </div>
                <span style="font-size:11px;color:var(--text-secondary);font-weight:600;">${certStatusText}</span>
              </div>
              <div style="width:42px;height:42px;border-radius:12px;background:rgba(99,102,241,0.1);color:var(--indigo-600);display:grid;place-items:center;flex-shrink:0;">
                ${ICONS.checkSquare}
              </div>
            </div>

            <!-- Metrik 2: AI Asisten & Fix Bug -->
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:4px;min-width:0;">
                <span style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-muted);">
                  2. AI ASISTEN & FIX BUG
                </span>
                <div style="display:flex;align-items:baseline;gap:8px;">
                  <strong style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--indigo-600);">
                    98%
                  </strong>
                  <span style="font-size:12px;font-weight:700;color:#059669;">✓ 6/6 Tests Pass</span>
                </div>
                <span style="font-size:11px;color:var(--text-secondary);font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${effectiveBranchName}
                </span>
              </div>
              <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;display:grid;place-items:center;flex-shrink:0;box-shadow:0 4px 10px rgba(79,70,229,0.22);">
                ${ICONS.sparkles}
              </div>
            </div>

            <!-- Metrik 3: Jejak Audit Aktivitas -->
            <div class="card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:4px;min-width:0;">
                <span style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-muted);">
                  3. JEJAK AUDIT AKTIVITAS
                </span>
                <div style="display:flex;align-items:baseline;gap:8px;">
                  <strong style="font-size:20px;font-weight:800;font-family:var(--font-mono);color:var(--text-primary);">
                    ${eventsList.length} Log
                  </strong>
                  <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Status: ${currentTask.status}</span>
                </div>
                <span style="font-size:11px;color:var(--text-secondary);font-weight:500;">PIC Aktif: ${assigneeMember.name}</span>
              </div>
              <div style="width:42px;height:42px;border-radius:12px;background:rgba(16,185,129,0.1);color:#059669;display:grid;place-items:center;flex-shrink:0;">
                ${ICONS.activity}
              </div>
            </div>
          </div>

          <!-- Grid Utama 2 Kolom Proporsional (Kiri 62%: Subtask & AI Asisten | Kanan 38%: Jejak Audit Aktivitas) -->
          <div class="overview-grid">
            
            <!-- Kolom Kiri: 1. Subtask & Sertifikasi + 2. AI Asisten & Fix Bug -->
            <div class="overview-main">
              
              <!-- FITUR 1: SUBTASK & SERTIFIKASI SPESIFIKASI -->
              <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--border);padding-bottom:12px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,0.12);color:var(--indigo-600);display:grid;place-items:center;flex-shrink:0;">
                      ${ICONS.checkSquare}
                    </div>
                    <div>
                      <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                        1. Subtask & Sertifikasi Spesifikasi
                      </h3>
                      <p style="font-size:11.5px;color:var(--text-muted);margin:2px 0 0 0;">
                        Checklist kriteria kelulusan (Definition of Done) & verifikasi sertifikasi QA per item pekerjaan
                      </p>
                    </div>
                  </div>
                  <span style="font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;${certBadgeStyle}">
                    ${certStatusText}
                  </span>
                </div>

                <!-- Progress Bar -->
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;">
                    <span style="color:var(--text-secondary);font-weight:600;">Progress Sertifikasi Deliverable</span>
                    <strong style="font-family:var(--font-mono);color:var(--indigo-600);">${completedSubtasks} dari ${subtasks.length} Subtask (${subtaskPct}%)</strong>
                  </div>
                  <div style="width:100%;height:7px;border-radius:9999px;background:var(--bg-secondary);overflow:hidden;">
                    <div style="width:${subtaskPct}%;height:100%;background:linear-gradient(90deg, #4f46e5, #10b981);transition:width 0.3s ease;"></div>
                  </div>
                </div>

                <!-- Daftar Subtask & Status Sertifikasi -->
                <div style="display:flex;flex-direction:column;gap:10px;">
                  ${subtasks.length === 0 ? `
                    <div style="padding:20px;border-radius:10px;border:1px dashed var(--border);text-align:center;color:var(--text-muted);font-size:12px;">
                      Belum ada item subtask & sertifikasi pada tiket ini. Tambahkan item baru di bawah.
                    </div>
                  ` : subtasks.map((s, idx) => {
                    const subAssignee = s.assigneeId ? (state.teamMembers || []).find(m => m.id === s.assigneeId) : null;
                    return `
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:10px;background:${s.completed ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)'};border:1px solid ${s.completed ? 'rgba(16,185,129,0.25)' : 'var(--border)'};">
                      <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;flex:1;min-width:0;">
                        <input
                          type="checkbox"
                          class="chk-toggle-subtask"
                          data-subtask-id="${s.id}"
                          ${s.completed ? 'checked' : ''}
                          style="width:17px;height:17px;margin-top:2px;accent-color:var(--indigo-600);cursor:pointer;flex-shrink:0;"
                        />
                        <div style="display:flex;flex-direction:column;gap:4px;min-width:0;flex:1;">
                          <span style="font-size:13px;font-weight:${s.completed ? '500' : '600'};color:${s.completed ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${s.completed ? 'line-through' : 'none'};line-height:1.4;">
                            ${idx + 1}. ${s.title}
                          </span>
                          ${(s.category || subAssignee || s.estimateHours || s.notes) ? `
                            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:10.5px;color:var(--text-muted);">
                              ${s.category ? `<span style="padding:1px 6px;border-radius:4px;background:rgba(99,102,241,0.08);color:var(--indigo-600);font-weight:700;">${s.category}</span>` : ''}
                              ${subAssignee ? `<span>PIC: <strong style="color:var(--text-secondary);">${subAssignee.name}</strong></span>` : ''}
                              ${s.estimateHours ? `<span style="font-family:var(--font-mono);font-weight:600;">${s.estimateHours} Jam</span>` : ''}
                              ${s.notes ? `<span style="color:var(--text-muted);">· ${s.notes}</span>` : ''}
                            </div>
                          ` : ''}
                        </div>
                      </label>
                      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;${s.completed ? 'background:rgba(16,185,129,0.12);color:#059669;' : 'background:rgba(100,116,139,0.12);color:#64748b;'}">
                          ${s.completed ? '✓ Terverifikasi' : 'Menunggu QA'}
                        </span>
                        <button class="btn-delete-subtask" data-subtask-id="${s.id}" style="border:none;background:transparent;color:var(--text-muted);cursor:pointer;padding:4px;display:inline-flex;" title="Hapus subtask">
                          ${ICONS.trash}
                        </button>
                      </div>
                    </div>
                  `;
                  }).join('')}
                </div>

                <!-- Form Tambah Subtask Baru -->
                <form id="form-quick-subtask" style="display:flex;gap:8px;margin-top:2px;">
                  <input
                    type="text"
                    id="input-quick-subtask"
                    placeholder="Tambahkan item subtask / kriteria sertifikasi baru..."
                    class="form-input"
                    style="flex:1;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;"
                    required
                  />
                  <button type="submit" class="btn btn-secondary btn-sm" style="font-weight:700;padding:9px 16px;">
                    ${ICONS.plus} Tambah Subtask
                  </button>
                </form>
              </div>

              <!-- FITUR 2: AI ASISTEN & FIX BUG HUB -->
              <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--border);padding-bottom:12px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;display:grid;place-items:center;flex-shrink:0;">
                      ${ICONS.bot}
                    </div>
                    <div>
                      <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                        2. AI Dev Assistant & Automated Fix Bug
                      </h3>
                      <p style="font-size:11.5px;color:var(--text-muted);margin:2px 0 0 0;">
                        Analisis otomatis kode sumber, generasi patch perbaikan bug, dan pengujian regresi CI/CD
                      </p>
                    </div>
                  </div>
                  <span style="font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:999px;background:rgba(99,102,241,0.12);color:var(--indigo-600);">
                    AI Confidence 98%
                  </span>
                </div>

                <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;margin:0;">
                  Mesin AI menganalisis konteks tiket <strong>${currentTask.key}</strong> (${taskProject.name}) pada branch <code>${effectiveBranchName}</code>, menyusun patch kode sesuai arsitektur proyek, serta memvalidasi unit test sebelum diajukan ke Review PR.
                </p>

                <!-- Console Log AI -->
                <div style="padding:16px;border-radius:10px;background:#0f172a;color:#f8fafc;font-family:var(--font-mono);font-size:12px;line-height:1.7;border:1px solid #1e293b;">
                  <div><span style="color:#60a5fa;">$</span> git checkout -b ${effectiveBranchName}</div>
                  <div><span style="color:#34d399;">✓</span> Branch synced with origin/main (0 conflicts)</div>
                  <div><span style="color:#fbbf24;">●</span> AI Copilot analyzing ${currentTask.key}: "${currentTask.title}"...</div>
                  <div><span style="color:#34d399;">✓</span> Patch synthesized &middot; 6/6 automated assertions PASS (0.14s)</div>
                </div>

                <!-- Tombol Aksi AI -->
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-top:4px;">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <button id="btn-trigger-ai-full" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:12.5px;padding:8px 16px;border-radius:8px;">
                      ${ICONS.sparkles}
                      <span>${this.isAiProcessing ? 'Sedang Memproses Patch AI...' : 'Terapkan Patch AI ke Staging'}</span>
                    </button>
                    <button id="btn-quick-generate-tests" class="btn btn-secondary" style="font-size:12.5px;font-weight:700;padding:8px 14px;border-radius:8px;">
                      Buat Test Suite Otomatis
                    </button>
                  </div>
                  <span style="font-size:11px;font-family:var(--font-mono);color:#10b981;font-weight:700;">
                    ● CI Runner Ready
                  </span>
                </div>
              </div>

            </div>

            <!-- Kolom Kanan: 3. JEJAK AUDIT AKTIVITAS (Sticky Rail Proporsional) -->
            <div class="overview-sidebar" style="width:370px;">
              <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:28px;height:28px;border-radius:8px;background:rgba(16,185,129,0.12);color:#059669;display:grid;place-items:center;flex-shrink:0;">
                      ${ICONS.activity}
                    </div>
                    <div>
                      <h3 style="font-size:13.5px;font-weight:800;color:var(--text-primary);margin:0;">
                        3. Jejak Audit Aktivitas
                      </h3>
                      <span style="font-size:11px;color:var(--text-muted);">Riwayat perubahan status & tindakan tim</span>
                    </div>
                  </div>
                  <span style="font-size:10.5px;font-family:var(--font-mono);font-weight:700;padding:2px 8px;border-radius:999px;background:var(--bg-secondary);color:var(--text-secondary);border:1px solid var(--border);">
                    ${eventsList.length} Log
                  </span>
                </div>

                <!-- Timeline Jejak Audit -->
                <div style="display:flex;flex-direction:column;gap:12px;position:relative;">
                  ${eventsList.map((e, idx) => `
                    <div style="padding:12px 14px;border-radius:10px;background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:6px;position:relative;">
                      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                        <div style="display:flex;align-items:center;gap:7px;">
                          <span style="width:8px;height:8px;border-radius:50%;background:${idx === 0 ? 'var(--indigo-600)' : '#10b981'};flex-shrink:0;"></span>
                          <strong style="font-size:12.5px;color:var(--text-primary);line-height:1.35;">${e.action}</strong>
                        </div>
                        <span style="font-size:10.5px;font-family:var(--font-mono);color:var(--text-muted);white-space:nowrap;">
                          ${new Date(e.timestamp || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div style="display:flex;align-items:center;justify-content:space-between;padding-left:15px;font-size:11px;color:var(--text-muted);">
                        <span>Oleh: <strong style="color:var(--text-secondary);">${e.actorName || 'User'}</strong> (${e.actorRole || 'Tim'})</span>
                        <span style="font-family:var(--font-mono);font-size:10px;">#${eventsList.length - idx}</span>
                      </div>
                    </div>
                  `).join('')}

                  <!-- Baseline Audit Entry: Tiket Dibuat -->
                  <div style="padding:12px 14px;border-radius:10px;background:var(--bg-secondary);border:1px dashed var(--border);display:flex;flex-direction:column;gap:6px;opacity:0.85;">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                      <div style="display:flex;align-items:center;gap:7px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:#94a3b8;flex-shrink:0;"></span>
                        <strong style="font-size:12px;color:var(--text-secondary);">Tiket ${currentTask.key} diinisialisasi ke sistem</strong>
                      </div>
                      <span style="font-size:10.5px;font-family:var(--font-mono);color:var(--text-muted);white-space:nowrap;">
                        ${new Date(currentTask.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style="padding-left:15px;font-size:11px;color:var(--text-muted);">
                      Pelapor: <strong style="color:var(--text-secondary);">${reporter.name}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    // MAIN COMPONENT MARKUP (PROPORSIONAL, BERSIH, SATU BAR NAVIGASI & INFO TIKET)
    this.container.innerHTML = `
      <!-- 1. Unified Navigation Tabs & Ticket Info Bar (Proporsional & Sejajar) -->
      <div style="padding:0 24px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;min-height:48px;flex-shrink:0;">
        <!-- Kiri: Navigation Sub-Tabs -->
        <div style="display:flex;align-items:center;gap:4px;overflow-x:auto;overflow-y:hidden;">
          ${tabsHtml}
        </div>

        <!-- Kanan: Key + Status + Priority + Type + Buat Subtask -->
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 0;">
          <button
            id="btn-copy-key"
            style="display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-weight:800;font-size:11px;padding:4px 9px;border-radius:6px;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);cursor:pointer;outline:none;"
            title="Klik untuk salin kode tiket"
          >
            <span>${currentTask.key}</span>
            ${ICONS.copy}
          </button>

          <span style="font-size:10.5px;font-family:var(--font-mono);font-weight:800;padding:4px 9px;border-radius:6px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);">
            ${currentTask.status.toUpperCase()}
          </span>

          <span style="font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:9999px;${priorityBadgeBg}">
            ${currentTask.priority}
          </span>

          <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:rgba(99,102,241,0.08);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.2);">
            ✨ ${currentTask.type || 'Feature'}
          </span>

          <button id="btn-action-add-subtask" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:6px 12px;border-radius:8px;margin-left:4px;">
            ${ICONS.checkSquare}
            <span>Buat Subtask</span>
          </button>
        </div>
      </div>

      <!-- 2. Dynamic Tab Workspace Content (Grid Proporsional) -->
      <div style="padding:20px 24px 32px 24px;flex:1 0 auto;">
        ${tabContentHtml}
      </div>

      <!-- 3. Modal Buat Subtask Baru -->
      <div
        id="subtaskModalBackdrop"
        style="display:${this.isSubtaskModalOpen ? 'flex' : 'none'};position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px;"
      >
        <div
          class="card"
          style="width:100%;max-width:560px;background:var(--bg-card, #ffffff);border:1px solid var(--border, #e2e8f0);border-radius:16px;box-shadow:0 20px 45px rgba(15,23,42,0.22);overflow:hidden;display:flex;flex-direction:column;animation:modalSlideUp 0.18s ease;"
        >
          <!-- Modal Header -->
          <div style="padding:18px 22px;background:linear-gradient(135deg, rgba(79,70,229,0.06), rgba(59,130,246,0.04));border-bottom:1px solid var(--border, #e2e8f0);display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="display:flex;align-items:center;gap:12px;min-width:0;">
              <div style="width:38px;height:38px;border-radius:10px;background:var(--indigo-600, #4f46e5);color:#ffffff;display:grid;place-items:center;flex-shrink:0;box-shadow:0 4px 10px rgba(79,70,229,0.25);">
                ${ICONS.checkSquare}
              </div>
              <div style="min-width:0;">
                <h3 style="margin:0;font-size:15px;font-weight:800;color:var(--text-primary, #0f172a);">
                  Buat Subtask & Spesifikasi Baru
                </h3>
                <p style="margin:2px 0 0 0;font-size:11.5px;color:var(--text-muted, #64748b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Tiket Induk: <strong style="font-family:var(--font-mono);color:var(--indigo-600);">${currentTask.key}</strong> — ${currentTask.title}
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btnCloseSubtaskModal"
              style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border, #e2e8f0);background:var(--bg-card, #fff);color:var(--text-muted, #64748b);cursor:pointer;display:grid;place-items:center;font-size:15px;font-weight:700;flex-shrink:0;"
              title="Tutup Modal (Esc)"
            >
              ✕
            </button>
          </div>

          <!-- Modal Form Body -->
          <form id="form-modal-subtask" style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
            <!-- Judul Subtask -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                Judul Subtask / Deliverable <span style="color:#ef4444;">*</span>
              </label>
              <input
                type="text"
                id="modalSubtaskTitle"
                class="form-input"
                placeholder="Contoh: Implementasi validasi token JWT & unit test endpoint..."
                style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border, #cbd5e1);background:var(--bg-secondary, #f8fafc);font-size:13px;font-weight:600;color:var(--text-primary);"
                required
              />
              <!-- Quick Preset Chips -->
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px;">
                <span style="font-size:10.5px;color:var(--text-muted);font-weight:600;">Template Cepat:</span>
                <button type="button" class="subtask-preset-chip" data-preset-title="Pembuatan skema validasi API & middleware otorisasi" data-preset-cat="Backend / API" style="border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:700;cursor:pointer;">
                  + Validasi API
                </button>
                <button type="button" class="subtask-preset-chip" data-preset-title="Integrasi komponen UI & state management reaktif" data-preset-cat="Frontend / UI" style="border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:700;cursor:pointer;">
                  + Integrasi UI
                </button>
                <button type="button" class="subtask-preset-chip" data-preset-title="Penulisan unit test & uji regresi QA Staging" data-preset-cat="QA & Testing" style="border:1px solid rgba(99,102,241,0.25);background:rgba(99,102,241,0.06);color:var(--indigo-600);border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:700;cursor:pointer;">
                  + Unit Test & QA
                </button>
              </div>
            </div>

            <!-- Grid 2 Kolom: Kategori & PIC Pelaksana -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Kategori Spesifikasi
                </label>
                <select
                  id="modalSubtaskCategory"
                  class="form-select"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-weight:600;color:var(--text-primary);"
                >
                  <option value="Backend / API">Backend / API</option>
                  <option value="Frontend / UI">Frontend / UI</option>
                  <option value="Database / Schema">Database / Schema</option>
                  <option value="QA & Testing">QA & Testing</option>
                  <option value="DevOps & Security">DevOps & Security</option>
                </select>
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  PIC Pelaksana Subtask
                </label>
                <select
                  id="modalSubtaskAssignee"
                  class="form-select"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-weight:600;color:var(--text-primary);"
                >
                  ${state.teamMembers.map(m => `
                    <option value="${m.id}" ${currentTask.assigneeId === m.id ? 'selected' : ''}>
                      ${m.name} (${m.role})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Grid 2 Kolom: Estimasi Jam & Status Verifikasi -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Estimasi Waktu (Jam)
                </label>
                <input
                  type="number"
                  id="modalSubtaskHours"
                  min="0.5"
                  step="0.5"
                  value="2"
                  class="form-input"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);"
                />
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                  Status Verifikasi Awal
                </label>
                <select
                  id="modalSubtaskStatus"
                  class="form-select"
                  style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;font-weight:600;color:var(--text-primary);"
                >
                  <option value="pending" selected>Menunggu QA (Belum Selesai)</option>
                  <option value="completed">✓ Terverifikasi QA (Selesai)</option>
                </select>
              </div>
            </div>

            <!-- Catatan / Kriteria Kelulusan (DoD) -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary, #334155);">
                Kriteria Selesai / Catatan Teknis (Opsional)
              </label>
              <textarea
                id="modalSubtaskNotes"
                rows="2"
                class="form-textarea"
                placeholder="Tuliskan kriteria penerimaan (Acceptance Criteria) atau catatan pengujian..."
                style="width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12.5px;color:var(--text-primary);resize:vertical;"
              ></textarea>
            </div>

            <!-- Modal Footer Buttons -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:12px;border-top:1px solid var(--border);">
              <button
                type="button"
                id="btnCancelSubtaskModal"
                class="btn btn-secondary"
                style="padding:8px 16px;border-radius:8px;font-size:12.5px;font-weight:700;"
              >
                Batal
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                style="padding:8px 18px;border-radius:8px;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;gap:6px;"
              >
                ${ICONS.plus}
                <span>Simpan Subtask</span>
              </button>
            </div>
          </form>
        </div>
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
    const state = store.getState();

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

    // Tab switcher buttons
    this.container.querySelectorAll('.btn-detail-tab[data-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        this.activeTab = tabBtn.dataset.tab;
        this.render();
      });
    });

    // Quick Action Auto-Fix AI & Quick AI Fix
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

    const genTestsBtn = this.container.querySelector('#btn-quick-generate-tests');
    if (genTestsBtn) {
      genTestsBtn.addEventListener('click', () => {
        store.addToast('success', 'Test Suite Dibuat', `Unit & feature test otomatis untuk ${task.key} berhasil di-generate.`);
      });
    }

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
        const currentState = store.getState();
        const selectedMember = (currentState.teamMembers || []).find(m => m.id === this.selectedCommentAuthorId);
        const roleLabel = this.container.querySelector('#comment-author-role-label');
        if (roleLabel && selectedMember) {
          roleLabel.textContent = selectedMember.role;
        }
      });
    }

    // Add comment handler helper
    const handleCommentSubmit = (inputId, chkId, selectId) => {
      const input = this.container.querySelector(inputId);
      const chkInternal = this.container.querySelector(chkId);
      const selAuthor = this.container.querySelector(selectId);
      const currentState = store.getState();
      
      if (input && input.value.trim()) {
        const authorId = (selAuthor ? selAuthor.value : this.selectedCommentAuthorId) || 'user-pm';
        const member = (currentState.teamMembers || []).find(m => m.id === authorId) || (currentState.teamMembers || [])[0] || {
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

    const quickCommentInput = this.container.querySelector('#input-quick-comment');
    if (quickCommentInput) {
      quickCommentInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleCommentSubmit('#input-quick-comment', '#chk-comment-internal', '#select-comment-author');
        }
      });
    }

    // Reply comment buttons
    this.container.querySelectorAll('.btn-reply-comment[data-author-name]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const authorName = btn.dataset.authorName;
        const targetTextarea = this.container.querySelector('#input-quick-comment');
        if (targetTextarea && authorName) {
          const mention = `@${authorName} `;
          if (!targetTextarea.value.startsWith(mention)) {
            targetTextarea.value = mention + targetTextarea.value;
          }
          targetTextarea.focus();
          targetTextarea.setSelectionRange(targetTextarea.value.length, targetTextarea.value.length);
        }
      });
    });

    // Delete comment buttons (Interactive per comment)
    this.container.querySelectorAll('.btn-delete-comment[data-comment-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const commentId = btn.dataset.commentId;
        if (commentId) {
          store.deleteComment(commentId);
        }
      });
    });

    // Metadata inputs: Status Workflow
    const statusSelect = this.container.querySelector('#meta-task-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        store.updateTaskStatus(task.id, e.target.value, `Status diubah ke ${e.target.value}`);
      });
    }

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

    // Open Create Subtask Modal
    const btnSubtask = this.container.querySelector('#btn-action-add-subtask');
    const subtaskModalBackdrop = this.container.querySelector('#subtaskModalBackdrop');
    const closeSubtaskModal = () => {
      this.isSubtaskModalOpen = false;
      if (subtaskModalBackdrop) {
        subtaskModalBackdrop.style.display = 'none';
      }
    };

    if (btnSubtask) {
      btnSubtask.addEventListener('click', () => {
        this.isSubtaskModalOpen = true;
        if (subtaskModalBackdrop) {
          subtaskModalBackdrop.style.display = 'flex';
          const titleInput = this.container.querySelector('#modalSubtaskTitle');
          if (titleInput) {
            setTimeout(() => titleInput.focus(), 40);
          }
        } else {
          this.render();
        }
      });
    }

    const btnCloseModal = this.container.querySelector('#btnCloseSubtaskModal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', closeSubtaskModal);
    }

    const btnCancelModal = this.container.querySelector('#btnCancelSubtaskModal');
    if (btnCancelModal) {
      btnCancelModal.addEventListener('click', closeSubtaskModal);
    }

    if (subtaskModalBackdrop) {
      subtaskModalBackdrop.addEventListener('click', (e) => {
        if (e.target === subtaskModalBackdrop) {
          closeSubtaskModal();
        }
      });
    }

    // Preset chips inside Subtask Modal
    this.container.querySelectorAll('.subtask-preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const titleInput = this.container.querySelector('#modalSubtaskTitle');
        const catSelect = this.container.querySelector('#modalSubtaskCategory');
        if (titleInput && chip.dataset.presetTitle) {
          titleInput.value = chip.dataset.presetTitle;
          titleInput.focus();
        }
        if (catSelect && chip.dataset.presetCat) {
          catSelect.value = chip.dataset.presetCat;
        }
      });
    });

    // Submit Create Subtask Modal Form
    const modalSubtaskForm = this.container.querySelector('#form-modal-subtask');
    if (modalSubtaskForm) {
      modalSubtaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = this.container.querySelector('#modalSubtaskTitle');
        const catSelect = this.container.querySelector('#modalSubtaskCategory');
        const assigneeSelectModal = this.container.querySelector('#modalSubtaskAssignee');
        const hoursInput = this.container.querySelector('#modalSubtaskHours');
        const statusSelectModal = this.container.querySelector('#modalSubtaskStatus');
        const notesInput = this.container.querySelector('#modalSubtaskNotes');

        const titleVal = titleInput ? titleInput.value.trim() : '';
        if (!titleVal) return;

        const newSubtask = {
          id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: titleVal,
          category: catSelect ? catSelect.value : 'Backend / API',
          assigneeId: assigneeSelectModal ? assigneeSelectModal.value : task.assigneeId,
          estimateHours: hoursInput ? (Number(hoursInput.value) || 2) : 2,
          completed: statusSelectModal ? statusSelectModal.value === 'completed' : false,
          notes: notesInput ? notesInput.value.trim() : ''
        };

        this.isSubtaskModalOpen = false;
        const currentTaskLatest = store.getState().tasks.find((t) => t.id === task.id) || task;
        const updatedSubtasks = [...(currentTaskLatest.subtasks || []), newSubtask];
        store.updateTask(task.id, { subtasks: updatedSubtasks });
        store.addToast('success', 'Subtask Ditambahkan', `Subtask "${titleVal}" berhasil ditambahkan ke tiket ${task.key}.`);
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
