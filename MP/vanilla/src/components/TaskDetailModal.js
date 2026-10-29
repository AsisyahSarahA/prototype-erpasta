/**
 * TaskDetailModal Component (100% Native Vanilla JS ES Module)
 * Setara Atlassian Jira Software Cloud Issue View:
 * - Jira Breadcrumbs (Project / Issue Key) & Jira Status Lozenge Transition Dropdown
 * - Jira Action Bar: + Lampirkan, + Tambah Subtask, + Tautkan Masalah
 * - Standard 70/30 Two-Column Layout (Main Work Area & Sticky Jira Metadata Sidebar)
 * - 6-Phase Software House Lifecycle Stepper (Interactive & Dynamic Auto-Advancement)
 * - Standard Bug Tracking Suite (Triage SLA, Dual-Track Dev/AI, PR Diff, QA Sign-Off, Rollback, RCA)
 * - Jira Subtasks Table with Progress Gauge (2 of 3 completed)
 * - Jira Activity Tabs: Komentar & Diskusi (with Internal vs Client privacy toggle) & Jejak Audit (task_events)
 * - Sticky Metadata Sidebar (Assignee with "Assign to me", Reporter, Priority, Severity, Environment, SLA, Epic, Sprint, Labels, Components)
 * - Jira Time Tracking Progress Bar (Logged vs Remaining Hours)
 * - Git Development Panel (Branch, PR status, CI/CD test results)
 * - All Sub-modals (Triage, QA, RCA, Manual PR, Revision, Reject, Double Confirm)
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';

export class TaskDetailModal {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'modal-backdrop';

    this.activeTab = 'comments'; // 'comments' | 'history'
    this.fixingTrack = 'team_dev'; // 'team_dev' | 'ai_agent'
    this.isDiffExpanded = true;
    this.copiedKey = false;
    this.copiedCmd = false;
    this.isSimulatingAgent = false;

    // Sub-modal visibility states
    this.activeSubModal = null; // 'triage' | 'qa' | 'rca' | 'manual_pr' | 'revision' | 'reject' | 'double_confirm'

    // Form inputs for sub-modals
    this.subModalData = {
      triageSeverity: 'S2 - Major',
      triageEnv: 'Production',
      triageWarranty: 'Garansi Proyek (Gratis)',
      triageAssignee: '',
      qaIsPass: true,
      qaNotes: '',
      qaCasesCount: 6,
      qaPassedCount: 6,
      qaReopenReason: '',
      rcaInput: '',
      preventiveInput: '',
      manualPrTitle: '',
      manualPrDiff: '',
      revisionNotes: '',
      rejectReason: '',
      commentText: '',
      isInternalComment: false,
      newSubtaskTitle: ''
    };

    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.update();
    });

    // Close when clicking outside dialog
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container && !this.activeSubModal) {
        store.closeTaskDetail();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.activeSubModal) {
          this.activeSubModal = null;
          this.render();
        } else if (store.getState().selectedTask) {
          store.closeTaskDetail();
        }
      }
    });
  }

  update() {
    const state = store.getState();
    const task = state.selectedTask;
    // When activeTab is 'task_detail', the modern CRM-style TaskDetailView handles rendering full page.
    if (task && state.activeTab !== 'task_detail' && this.activeSubModal) {
      this.container.classList.add('modal-backdrop--open');
      this.render();
    } else {
      this.container.classList.remove('modal-backdrop--open');
      if (state.activeTab === 'task_detail') {
        this.activeSubModal = null;
      }
    }
  }

  getStatusStyle(status) {
    switch (status) {
      case 'Selesai':
        return 'background-color: #e3fcef; color: #006644; border-color: #abf5d1;';
      case 'In Progress':
      case 'Diperbaiki Agen':
        return 'background-color: #deebff; color: #0747a6; border-color: #b3d4ff;';
      case 'In Review':
      case 'Menunggu Persetujuan':
        return 'background-color: #fff0b3; color: #172b4d; border-color: #ffe380;';
      case 'QA/Testing':
      case 'Deploy Staging':
      case 'Disetujui':
        return 'background-color: #eae6ff; color: #403294; border-color: #c0b6f2;';
      case 'Perlu Manual':
      case 'Ditolak':
        return 'background-color: #ffebe6; color: #bf2600; border-color: #ffbdad;';
      case 'Dipantau':
      case 'Deploy Production':
        return 'background-color: #eae6ff; color: #5243aa; border-color: #d3adf7;';
      default:
        return 'background-color: #dfe1e6; color: #42526e; border-color: #c1c7d0;';
    }
  }

  render() {
    const state = store.getState();
    const task = state.selectedTask;
    if (!task) {
      this.container.innerHTML = '';
      return;
    }

    const currentTask = state.tasks.find((t) => t.id === task.id) || task;
    const activeProject = state.projects.find(p => p.id === currentTask.projectId) || store.getActiveProject();
    const assignee = state.teamMembers.find((m) => m.id === currentTask.assigneeId);
    const reporter = state.teamMembers.find((m) => m.id === currentTask.reporterId);
    const epic = state.epics.find((e) => e.id === currentTask.epicId);
    const sprint = state.sprints.find((s) => s.id === currentTask.sprintId);
    const taskComments = (state.comments || []).filter((c) => c.taskId === currentTask.id);
    const taskEvents = (state.events || []).filter((e) => e.taskId === currentTask.id);

    const completedSubtasksCount = (currentTask.subtasks || []).filter((s) => s.completed).length;
    const totalSubtasksCount = (currentTask.subtasks || []).length;
    const progressPercent = totalSubtasksCount > 0
      ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100)
      : 0;

    // Time tracking calculation
    const estimate = currentTask.estimateHours || 1;
    const logged = currentTask.timeLoggedHours || 0;
    const loggedPercent = Math.min(Math.round((logged / estimate) * 100), 100);

    // 6-Phase Lifecycle Definition
    const lifecyclePhases = [
      {
        step: 1,
        targetStatus: 'Baru',
        label: currentTask.type === 'Bug' ? '1. Laporan Masuk' : '1. Backlog & Spec',
        subtitle: 'Inbound / Backlog',
        active: ['Baru', 'Backlog'].includes(currentTask.status),
        done: !['Baru', 'Backlog'].includes(currentTask.status)
      },
      {
        step: 2,
        targetStatus: 'Dianalisis',
        label: currentTask.type === 'Bug' ? '2. Triage & SLA' : '2. Scope & Arsitektur',
        subtitle: 'Analisis Teknis',
        active: ['Dianalisis', 'To Do'].includes(currentTask.status),
        done: !['Baru', 'Backlog', 'Dianalisis', 'To Do'].includes(currentTask.status)
      },
      {
        step: 3,
        targetStatus: 'In Progress',
        label: currentTask.type === 'Bug' ? '3. Pengerjaan Fix' : '3. Coding Sprint',
        subtitle: 'Development',
        active: ['In Progress', 'Perlu Manual', 'Diperbaiki Agen'].includes(currentTask.status),
        done: ['Menunggu Persetujuan', 'Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status)
      },
      {
        step: 4,
        targetStatus: 'Menunggu Persetujuan',
        label: '4. Code Review PR',
        subtitle: 'Review & CI/CD',
        active: ['Menunggu Persetujuan', 'In Review'].includes(currentTask.status),
        done: ['Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status)
      },
      {
        step: 5,
        targetStatus: 'QA/Testing',
        label: currentTask.type === 'Bug' ? '5. QA Staging Test' : '5. QA & Staging UAT',
        subtitle: 'Verifikasi Staging',
        active: ['QA/Testing', 'Deploy Staging', 'Disetujui'].includes(currentTask.status),
        done: ['Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status)
      },
      {
        step: 6,
        targetStatus: 'Selesai',
        label: currentTask.type === 'Bug' ? '6. Rilis & Garansi' : '6. Production Live',
        subtitle: 'Live Production',
        active: ['Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status),
        done: currentTask.status === 'Selesai'
      }
    ];

    const currentPhaseIndex = lifecyclePhases.findIndex((p) => p.active);
    const nextPhase = currentPhaseIndex >= 0 && currentPhaseIndex < lifecyclePhases.length - 1
      ? lifecyclePhases[currentPhaseIndex + 1]
      : null;
    const prevPhase = currentPhaseIndex > 0
      ? lifecyclePhases[currentPhaseIndex - 1]
      : null;

    this.container.innerHTML = `
      <div class="modal-dialog modal-dialog--detail">
        
        <!-- 1. Top Jira Header Bar -->
        <div class="modal-header">
          <div class="modal-header__title-group">
            <span style="font-size: 12px; color: #5e6c84; display: flex; align-items: center; gap: 6px;">
              <span style="width: 16px; height: 16px; border-radius: 3px; background: #0052cc; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800;">
                ${(activeProject?.code || 'LIB').slice(0, 3)}
              </span>
              <span>${activeProject?.name || 'Perpustakaan Digital'}</span>
              <span>/</span>
            </span>

            <button id="copyTaskKeyBtn" class="modal-header__badge" title="Klik untuk menyalin kode tiket">
              <span>${currentTask.key}</span>
              ${this.copiedKey ? `<span style="color: #006644;">${Icons.check('', 12)}</span>` : `<span style="color: #6b778c;">${Icons.copy('', 12)}</span>`}
            </button>

            <span style="color: #dfe1e6;">·</span>

            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;">
              ${currentTask.type === 'Bug'
                ? `<span style="color: #bf2600; display: inline-flex; align-items: center; gap: 4px;">${Icons.bug('', 14)} <span>Bug</span></span>`
                : currentTask.type === 'Feature'
                ? `<span style="color: #0052cc; display: inline-flex; align-items: center; gap: 4px;">${Icons.sparkles('', 14)} <span>Feature</span></span>`
                : `<span style="color: #42526e; display: inline-flex; align-items: center; gap: 4px;">${Icons.checkSquare('', 14)} <span>${currentTask.type}</span></span>`
              }
            </div>

            ${epic ? `
              <span style="color: #dfe1e6;">·</span>
              <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background-color: ${epic.color}20; color: ${epic.color}; border: 1px solid ${epic.color}50;">
                ${epic.title}
              </span>
            ` : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <!-- Atlassian Jira Status Dropdown Lozenge -->
            <select id="detailStatusSelect" style="padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; border: 1px solid; cursor: pointer; outline: none; text-transform: uppercase; letter-spacing: 0.02em; ${this.getStatusStyle(currentTask.status)}">
              <option value="Backlog" ${currentTask.status === 'Backlog' ? 'selected' : ''}>Backlog</option>
              <option value="To Do" ${currentTask.status === 'To Do' ? 'selected' : ''}>To Do</option>
              <option value="In Progress" ${currentTask.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Baru" ${currentTask.status === 'Baru' ? 'selected' : ''}>Baru (Laporan Masuk)</option>
              <option value="Dianalisis" ${currentTask.status === 'Dianalisis' ? 'selected' : ''}>Dianalisis (AI Triage)</option>
              <option value="Menunggu Persetujuan" ${currentTask.status === 'Menunggu Persetujuan' ? 'selected' : ''}>Menunggu Persetujuan PR</option>
              <option value="Disetujui" ${currentTask.status === 'Disetujui' ? 'selected' : ''}>Disetujui</option>
              <option value="Perlu Manual" ${currentTask.status === 'Perlu Manual' ? 'selected' : ''}>Perlu Manual</option>
              <option value="Deploy Staging" ${currentTask.status === 'Deploy Staging' ? 'selected' : ''}>Deploy Staging</option>
              <option value="Deploy Production" ${currentTask.status === 'Deploy Production' ? 'selected' : ''}>Deploy Production</option>
              <option value="Dipantau" ${currentTask.status === 'Dipantau' ? 'selected' : ''}>Dipantau (Post-Deploy)</option>
              <option value="Selesai" ${currentTask.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
              <option value="Ditolak" ${currentTask.status === 'Ditolak' ? 'selected' : ''}>Ditolak</option>
            </select>

            <!-- Close Dialog Button -->
            <button id="detailModalCloseBtn" class="modal-header__close-btn" title="Tutup (Esc)">
              ${Icons.x('', 16)}
            </button>
          </div>
        </div>

        <!-- 2. Main 70/30 Two-Column Layout -->
        <div class="modal-detail-layout">
          
          <!-- Left Column: Primary Work Area (70%) -->
          <div class="modal-detail-left">
            
            <!-- Issue Title & Meta Bar -->
            <div>
              <h1 style="font-size: 20px; font-weight: 700; color: #172b4d; margin: 0; line-height: 1.35; letter-spacing: -0.01em;">
                ${this.escapeHtml(currentTask.title)}
              </h1>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #5e6c84; margin-top: 8px; flex-wrap: wrap;">
                <span>Dibuat ${new Date(currentTask.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>Diperbarui ${new Date(currentTask.lastStatusUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                ${currentTask.visibility === 'client_public'
                  ? `<span style="color: #006644; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">${Icons.eye('', 12)} Publik (Klien)</span>`
                  : `<span style="color: #b45309; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">${Icons.lock('', 12)} Internal Saja</span>`
                }
              </div>
            </div>

            <!-- Jira Action Bar (Attach, Subtask, Link Issue) -->
            <div class="jira-action-bar">
              <button class="jira-action-btn" id="attachFileBtn" title="Lampirkan Dokumen atau Gambar">
                ${Icons.fileText('', 14)}
                <span>Lampirkan</span>
              </button>

              <button class="jira-action-btn" id="focusAddSubtaskBtn" title="Tambah Subtask">
                ${Icons.checkSquare('', 14)}
                <span>Buat Subtask</span>
              </button>

              <button class="jira-action-btn" id="linkIssueBtn" title="Tautkan Masalah">
                ${Icons.share2('', 14)}
                <span>Tautkan Masalah</span>
              </button>

              ${currentTask.type === 'Bug' ? `
                <button class="jira-action-btn" id="openTriageBarBtn" style="color: #0052cc; border-color: #b3d4ff; background-color: #deebff;">
                  ${Icons.sliders('', 14)}
                  <span>Konfigurasi Triage SLA</span>
                </button>
              ` : ''}
            </div>

            <!-- 6-Phase Software House Lifecycle Stepper (Interactive & Dynamic) -->
            <div class="lifecycle-card">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 26px; height: 26px; border-radius: 4px; background: #0052cc; color: white; display: flex; align-items: center; justify-content: center;">
                    ${Icons.listTodo('', 14)}
                  </div>
                  <div>
                    <h4 style="font-size: 12px; font-weight: 700; color: #172b4d; margin: 0;">
                      Alur Siklus 6 Fase Standar Software House
                    </h4>
                    <p style="font-size: 11px; color: #5e6c84; margin: 2px 0 0 0;">
                      Klik tahapan di bawah untuk memindahkan tiket, atau centang subtask untuk auto-advance.
                    </p>
                  </div>
                </div>

                <div style="display: flex; gap: 6px;">
                  ${prevPhase ? `
                    <button class="phase-move-btn jira-btn jira-btn--default" data-status="${prevPhase.targetStatus}" data-label="${prevPhase.label}" style="font-size: 11px; padding: 4px 10px; gap: 4px;">
                      ${Icons.rotateCcw('', 12)}
                      <span>Mundur</span>
                    </button>
                  ` : ''}

                  ${nextPhase ? `
                    <button class="phase-move-btn jira-btn jira-btn--primary" data-status="${nextPhase.targetStatus}" data-label="${nextPhase.label}" style="font-size: 11px; padding: 4px 12px; gap: 4px;">
                      <span>Lanjut Fase</span>
                      ${Icons.arrowRight('', 12)}
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- 6 Clickable Phase Cards Grid -->
              <div class="lifecycle-grid">
                ${lifecyclePhases.map((phase) => `
                  <button type="button" class="phase-card-btn ${phase.active ? 'active' : phase.done ? 'done' : ''}" data-status="${phase.targetStatus}" data-label="${phase.label}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 9px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase;">
                        Fase ${phase.step}
                      </span>
                      ${phase.done ? `<span style="color: #006644;">${Icons.checkCircle('', 12)}</span>` : phase.active ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: white; box-shadow: 0 0 0 2px rgba(255,255,255,0.4);"></span>` : `<span style="width: 6px; height: 6px; border-radius: 50%; background: #c1c7d0;"></span>`}
                    </div>
                    <div>
                      <div style="font-size: 11px; font-weight: 700; line-height: 1.25;">
                        ${phase.label}
                      </div>
                      <div style="font-size: 9px; margin-top: 2px; opacity: 0.85;">
                        ${phase.active ? 'Sedang Aktif' : phase.done ? '<i class="fi fi-rr-check"></i> Tuntas' : 'Klik untuk pindah'}
                      </div>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Software House Standard Bug Tracking & Fixing Suite -->
            ${currentTask.type === 'Bug' ? `
              <div style="border-radius: 8px; border: 1px solid var(--jira-border, #dfe1e6); background: white; padding: 18px; display: flex; flex-direction: column; gap: 16px;">
                
                <!-- Bug Overview Strip -->
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding-bottom: 12px; border-bottom: 1px solid #ebecf0;">
                  <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                    <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid; display: inline-flex; align-items: center; gap: 4px; ${
                      (currentTask.severity || '').startsWith('S1')
                        ? 'background-color: #ffebe6; color: #bf2600; border-color: #ffbdad;'
                        : (currentTask.severity || '').startsWith('S2')
                        ? 'background-color: #fff0b3; color: #172b4d; border-color: #ffe380;'
                        : 'background-color: #deebff; color: #0747a6; border-color: #b3d4ff;'
                    }">
                      ${(currentTask.severity || '').startsWith('S1') ? Icons.flame('', 14) : Icons.alertTriangle('', 14)}
                      <span>${currentTask.severity || 'S2 - Major'}</span>
                    </span>

                    <span style="font-size: 11px; font-family: var(--font-mono); font-weight: 600; padding: 3px 8px; border-radius: 4px; background: #f4f5f7; color: #172b4d; border: 1px solid #dfe1e6; display: inline-flex; align-items: center; gap: 4px;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #36b37e;"></span>
                      <span>${currentTask.environment || 'Production'}</span>
                    </span>

                    <span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: #e3fcef; color: #006644; border: 1px solid #abf5d1; display: inline-flex; align-items: center; gap: 4px;">
                      ${Icons.shieldCheck('', 14)}
                      <span>${currentTask.warrantyStatus || 'Garansi Proyek (Rp 0)'}</span>
                    </span>

                    <span style="font-size: 11px; color: #5e6c84; background: #fafbfc; border: 1px solid #dfe1e6; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                      ${Icons.clock('', 12)}
                      <span>${(currentTask.severity || '').startsWith('S1') ? 'SLA: < 4 Jam (Hotfix)' : (currentTask.severity || '').startsWith('S2') ? 'SLA: 24 Jam' : 'SLA: 3 Hari'}</span>
                    </span>
                  </div>

                  <button id="openTriageModalBtn" class="jira-btn jira-btn--default" style="font-size: 11px; padding: 4px 10px; gap: 6px;">
                    ${Icons.sliders('', 12)}
                    <span>Triage &amp; Atur SLA</span>
                  </button>
                </div>

                <!-- Reproduction Steps & Comparison -->
                ${(currentTask.reproductionSteps || currentTask.expectedBehavior || currentTask.actualBehavior) ? `
                  <div style="padding: 14px; border-radius: 6px; background-color: #fff0b315; border: 1px solid #ffe380; display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                      <span style="font-weight: 700; color: #bf2600; display: flex; align-items: center; gap: 6px;">
                        ${Icons.bug('', 14)}
                        <span>Spesifikasi Reproduksi Bug &amp; Ekspektasi QA</span>
                      </span>
                      <span style="font-family: var(--font-mono); color: #5e6c84;">Reporter: ${reporter?.name || currentTask.source}</span>
                    </div>

                    ${currentTask.reproductionSteps && currentTask.reproductionSteps.length > 0 ? `
                      <div style="background: white; padding: 10px 12px; border-radius: 4px; border: 1px solid #dfe1e6; font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-weight: 700; color: #172b4d;">Langkah Reproduksi:</span>
                        ${currentTask.reproductionSteps.map((st, i) => `
                          <div style="display: flex; gap: 6px; color: #42526e;">
                            <span style="font-family: var(--font-mono); font-weight: 700; color: #8993a4;">${i + 1}.</span>
                            <span>${st.replace(/^[0-9]+\.\s*/, '')}</span>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                      ${currentTask.expectedBehavior ? `
                        <div style="padding: 10px; border-radius: 4px; background: #e3fcef; border: 1px solid #abf5d1; color: #006644;">
                          <div style="font-weight: 700; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                            ${Icons.checkCircle('', 12)}
                            <span>Hasil Diharapkan (Expected):</span>
                          </div>
                          <p style="margin: 0; line-height: 1.4;">${currentTask.expectedBehavior}</p>
                        </div>
                      ` : ''}

                      ${currentTask.actualBehavior ? `
                        <div style="padding: 10px; border-radius: 4px; background: #ffebe6; border: 1px solid #ffbdad; color: #bf2600;">
                          <div style="font-weight: 700; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                            ${Icons.alertCircle('', 12)}
                            <span>Hasil Aktual (Actual Error):</span>
                          </div>
                          <p style="margin: 0; line-height: 1.4;">${currentTask.actualBehavior}</p>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                ` : ''}

                <!-- Dual-Track Fixing Console (Tim Dev vs Otomasi AI) -->
                <div style="border: 1px solid var(--jira-border, #dfe1e6); border-radius: 6px; overflow: hidden; background: white;">
                  <div style="display: flex; border-bottom: 1px solid #dfe1e6; background: #fafbfc; font-size: 12px; font-weight: 600;">
                    <button id="trackDevBtn" style="flex: 1; padding: 10px 14px; display: flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; border-bottom: 2px solid ${this.fixingTrack === 'team_dev' ? '#0052cc' : 'transparent'}; background: ${this.fixingTrack === 'team_dev' ? 'white' : 'transparent'}; color: ${this.fixingTrack === 'team_dev' ? '#0052cc' : '#5e6c84'}; font-weight: ${this.fixingTrack === 'team_dev' ? '700' : '500'};">
                      ${Icons.user('', 14)}
                      <span>Jalur Tim Developer (SOP Software House)</span>
                    </button>
                    <button id="trackAiBtn" style="flex: 1; padding: 10px 14px; display: flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; border-bottom: 2px solid ${this.fixingTrack === 'ai_agent' ? '#0052cc' : 'transparent'}; background: ${this.fixingTrack === 'ai_agent' ? 'white' : 'transparent'}; color: ${this.fixingTrack === 'ai_agent' ? '#0052cc' : '#5e6c84'}; font-weight: ${this.fixingTrack === 'ai_agent' ? '700' : '500'};">
                      ${Icons.bot('', 14)}
                      <span>Otomasi Agen AI (Claude Code Headless)</span>
                    </button>
                  </div>

                  <div style="padding: 16px;">
                    ${this.fixingTrack === 'team_dev' ? `
                      <div style="display: flex; flex-direction: column; gap: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #fafbfc; padding: 12px; border-radius: 6px; border: 1px solid #dfe1e6;">
                          <div style="display: flex; align-items: center; gap: 10px;">
                            ${assignee ? `<img src="${assignee.avatar}" alt="${assignee.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />` : ''}
                            <div>
                              <div style="font-size: 12px; font-weight: 700; color: #172b4d;">${assignee ? assignee.name : 'Belum Ditugaskan'}</div>
                              <div style="font-size: 11px; color: #5e6c84;">${assignee ? `${assignee.role} · Lead Bugfixer` : 'Pilih developer untuk menangani tiket'}</div>
                            </div>
                          </div>

                          <div style="display: flex; gap: 8px;">
                            ${['Baru', 'Dianalisis'].includes(currentTask.status) ? `
                              <button id="startDevWorkBtn" class="jira-btn jira-btn--primary" style="font-size: 12px; gap: 6px;">
                                ${Icons.play('', 14)}
                                <span>Mulai Pengerjaan (Set In Progress)</span>
                              </button>
                            ` : `
                              <button id="openManualPrModalBtn" class="jira-btn jira-btn--primary" style="font-size: 12px; gap: 6px;">
                                ${Icons.gitPullRequest('', 14)}
                                <span>Buka Pull Request Manual</span>
                              </button>
                            `}
                          </div>
                        </div>

                        <!-- Diagnostic Package Quick Copy for Developer -->
                        <div style="padding: 12px; border-radius: 6px; background: #fafbfc; border: 1px solid #dfe1e6; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 700; color: #172b4d; display: flex; align-items: center; gap: 4px;">
                              ${Icons.terminal('', 12)}
                              <span>Branch Kerja Git Siap Pakai:</span>
                            </span>
                            <button id="copyGitCmdBtn" class="jira-btn jira-btn--subtle" style="font-size: 10px; padding: 2px 6px;">
                              ${this.copiedCmd ? 'Tersalin!' : 'Salin Perintah Git'}
                            </button>
                          </div>
                          <code style="background: #ffffff; padding: 6px 10px; border-radius: 4px; border: 1px solid #ebecf0; font-family: var(--font-mono); color: #0052cc; overflow-x: auto;">
                            git checkout -b ${currentTask.branchName || `fix/${currentTask.key.toLowerCase()}-hotfix`} origin/staging
                          </code>
                        </div>
                      </div>
                    ` : `
                      <!-- AI Agent Console -->
                      <div style="display: flex; flex-direction: column; gap: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #fafbfc; padding: 12px; border-radius: 6px; border: 1px solid #dfe1e6;">
                          <div>
                            <div style="font-size: 12px; font-weight: 700; color: #172b4d;">Agen AI: Claude Code (MCP Runner)</div>
                            <div style="font-size: 11px; color: #5e6c84;">Klasifikasi Kesulitan: <strong>${currentTask.difficulty || 'Medium'}</strong> · Keyakinan: <strong>88%</strong></div>
                          </div>

                          <button id="triggerAiFixBtn" class="jira-btn jira-btn--primary" ${this.isSimulatingAgent ? 'disabled' : ''} style="font-size: 12px; gap: 6px;">
                            ${this.isSimulatingAgent ? `<span class="animate-spin">${Icons.refresh('', 14)}</span> <span>Menganalisis &amp; Memperbaiki...</span>` : `${Icons.bot('', 14)} <span>Jalankan AI Fixer Otomatis</span>`}
                          </button>
                        </div>
                      </div>
                    `}
                  </div>
                </div>

                <!-- Pull Request & Code Review Stage (Tech Lead Review) -->
                ${currentTask.status === 'Menunggu Persetujuan' && currentTask.prDiff ? `
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; background: #deebff; padding: 12px 14px; border-radius: 6px; border: 1px solid #b3d4ff;">
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #0747a6;">
                        ${Icons.gitPullRequest('', 16)}
                        <span>${currentTask.prNumber || 'Pull Request'}</span>
                        <span style="color: #5e6c84; font-weight: normal;">pada branch</span>
                        <code style="background: white; padding: 2px 8px; border-radius: 4px; border: 1px solid #b3d4ff; font-size: 11px; color: #0052cc;">
                          ${currentTask.branchName || 'fix/branch'}
                        </code>
                      </div>
                      <div style="font-size: 11px; font-weight: 600; color: #006644; background: #e3fcef; padding: 2px 10px; border-radius: 9999px; border: 1px solid #abf5d1; display: inline-flex; align-items: center; gap: 4px;">
                        ${Icons.checkCircle('', 12)}
                        <span>CI Unit Tests: Lolos (${currentTask.testResult ? `${currentTask.testResult.passedCount}/${currentTask.testResult.total} Pass` : 'Pass'})</span>
                      </div>
                    </div>

                    <!-- Diff Viewer -->
                    <div class="diff-card">
                      <div class="diff-header">
                        <div style="display: flex; align-items: center; gap: 6px; font-family: var(--font-mono);">
                          ${Icons.fileText('', 14)}
                          <span>Perubahan Kode (Patch Diff)</span>
                        </div>
                        <button id="toggleDiffBtn" style="background: none; border: none; color: #c1c7d0; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px;">
                          <span>${this.isDiffExpanded ? 'Kecilkan' : 'Perluas'}</span>
                          ${this.isDiffExpanded ? Icons.chevronUp('', 12) : Icons.chevronDown('', 12)}
                        </button>
                      </div>

                      ${this.isDiffExpanded ? `
                        <div class="diff-content">
                          <pre style="margin: 0;">
${currentTask.prDiff.split('\n').map(line => {
  if (line.startsWith('+')) return `<span class="diff-line-add">${line}</span>`;
  if (line.startsWith('-')) return `<span class="diff-line-del">${line}</span>`;
  if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) return `<span class="diff-line-header">${line}</span>`;
  return `<span class="diff-line-normal">${line}</span>`;
}).join('\n')}
                          </pre>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Reviewer Action Buttons -->
                    <div style="padding: 14px; border-radius: 6px; background: white; border: 1px solid var(--jira-border, #dfe1e6); display: flex; flex-direction: column; gap: 10px;">
                      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #172b4d;">
                        <span>Keputusan Review Tech Lead / Peer Reviewer:</span>
                        <span style="font-weight: normal; color: #5e6c84;">Persetujuan meloloskan kode ke Staging QA</span>
                      </div>
                      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <button id="approvePrBtn" class="jira-btn jira-btn--primary" style="background-color: #36b37e; border-color: #006644; font-size: 12px; gap: 6px;">
                          ${Icons.checkCircle('', 14)}
                          <span>Setujui PR &amp; Merge ke Staging</span>
                        </button>
                        <button id="requestRevisionBtn" class="jira-btn jira-btn--default" style="font-size: 12px; gap: 6px;">
                          ${Icons.refresh('', 14)}
                          <span>Minta Revisi Kode</span>
                        </button>
                        <button id="switchManualDevBtn" class="jira-btn jira-btn--default" style="font-size: 12px; gap: 6px;">
                          ${Icons.fileText('', 14)}
                          <span>Jalur Manual Programmer</span>
                        </button>
                        <button id="rejectPrBtn" class="jira-btn jira-btn--default" style="color: #bf2600; border-color: #ffbdad; background-color: #ffebe6; font-size: 12px; gap: 6px; margin-left: auto;">
                          ${Icons.x('', 14)}
                          <span>Tolak (Reject)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ` : ''}

                <!-- QA Staging Verification & Sign-Off Section -->
                ${['Disetujui', 'QA/Testing', 'Deploy Staging'].includes(currentTask.status) ? `
                  <div style="padding: 16px; border-radius: 6px; background-color: #eae6ff; border: 1px solid #c0b6f2; display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 26px; height: 26px; border-radius: 4px; background: #6554c0; color: white; display: flex; align-items: center; justify-content: center;">
                          ${Icons.shieldCheck('', 14)}
                        </div>
                        <div>
                          <div style="font-size: 12px; font-weight: 700; color: #403294;">Verifikasi Staging oleh QA Engineer</div>
                          <div style="font-size: 11px; color: #5243aa;">Tester Bertugas: <strong>Parhan (QA Engineer)</strong> · Lingkungan: <strong>Staging Server</strong></div>
                        </div>
                      </div>

                      ${currentTask.qaSignOff?.status === 'Passed' ? `
                        <span style="font-size: 11px; font-weight: 700; color: #006644; background: #e3fcef; padding: 2px 10px; border-radius: 9999px; border: 1px solid #abf5d1; display: inline-flex; align-items: center; gap: 4px;">
                          ${Icons.checkCircle('', 12)}
                          <span>QA Sign-Off: LULUS (${currentTask.qaSignOff.passedCasesCount}/${currentTask.qaSignOff.testCasesCount})</span>
                        </span>
                      ` : ''}
                    </div>

                    <div style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #dfe1e6; font-size: 11px; color: #42526e; display: flex; flex-direction: column; gap: 6px;">
                      <div style="font-weight: 700; color: #172b4d;">Checklist Pengujian Staging:</div>
                      <div style="display: flex; align-items: center; gap: 6px;">${Icons.checkCircle('', 12)} <span>Verifikasi skenario reproduksi bug: Galat tidak terjadi lagi pada branch staging</span></div>
                      <div style="display: flex; align-items: center; gap: 6px;">${Icons.checkCircle('', 12)} <span>Smoke test modul terkait &amp; edge-case skenario batas</span></div>
                      <div style="display: flex; align-items: center; gap: 6px;">${Icons.checkCircle('', 12)} <span>Regression test: modul transaksi, login, dan pelaporan berfungsi normal</span></div>
                      ${currentTask.qaSignOff?.notes ? `<div style="margin-top: 4px; padding: 8px; background: #fafbfc; border-radius: 4px; font-style: italic;">&ldquo;${currentTask.qaSignOff.notes}&rdquo;</div>` : ''}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                      <div style="display: flex; gap: 8px;">
                        <button id="qaSignOffPassBtn" class="jira-btn jira-btn--primary" style="background-color: #36b37e; border-color: #006644; font-size: 12px; gap: 6px;">
                          ${Icons.checkCircle('', 14)}
                          <span>Beri Sign-Off QA (Lolos Staging)</span>
                        </button>
                        <button id="qaSignOffFailBtn" class="jira-btn jira-btn--default" style="color: #bf2600; border-color: #ffbdad; font-size: 12px; gap: 6px;">
                          ${Icons.x('', 14)}
                          <span>Gagal / Reopen Bug (Ada Regresi)</span>
                        </button>
                      </div>

                      <button id="deployToProdBtn" class="jira-btn jira-btn--primary" style="background-color: #6554c0; border-color: #403294; font-size: 12px; gap: 6px; margin-left: auto;">
                        ${Icons.shieldCheck('', 14)}
                        <span>Lanjut Rilis ke Production</span>
                      </button>
                    </div>
                  </div>
                ` : ''}

                <!-- Post-Deploy Monitoring & Rollback Window -->
                ${currentTask.status === 'Dipantau' ? `
                  <div style="padding: 14px; background: #fff0b3; border-radius: 6px; border: 1px solid #ffe380; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #172b4d;">
                        ${Icons.clock('', 14)}
                        <span>Jendela Pemantauan Aktif (30 Menit Pasca-Deploy Production)</span>
                      </div>
                      <span style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; color: #006644; background: #e3fcef; padding: 2px 8px; border-radius: 9999px;">
                        Error Rate: 0.06% (Normal)
                      </span>
                    </div>
                    <p style="font-size: 11px; color: #42526e; margin: 0; line-height: 1.4;">
                      Sistem sedang memantau telemetri Sentry secara real-time. Jika lonjakan error melebihi 2%, rollback otomatis akan dieksekusi secara instan.
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 4px;">
                      <button id="testRollbackBtn" class="jira-btn jira-btn--default" style="color: #bf2600; border-color: #ffbdad; font-size: 11px; gap: 4px;">
                        ${Icons.rotateCcw('', 12)}
                        <span>Uji Simulasi Error Spike &amp; Auto-Rollback</span>
                      </button>
                      <button id="markStableDoneBtn" class="jira-btn jira-btn--primary" style="background-color: #36b37e; border-color: #006644; font-size: 11px; gap: 4px;">
                        ${Icons.checkCircle('', 12)}
                        <span>Tandai Selesai &amp; Stabil</span>
                      </button>
                    </div>
                  </div>
                ` : ''}

                <!-- Root Cause Analysis (RCA) Box -->
                <div style="padding: 12px 14px; border-radius: 6px; border: 1px solid #dfe1e6; background: #fafbfc; display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="font-weight: 700; color: #172b4d; display: flex; align-items: center; gap: 6px;">
                      ${Icons.fileText('', 14)}
                      <span>Root Cause Analysis (RCA) &amp; Catatan Garansi</span>
                    </span>
                    <button id="openRcaModalBtn" style="background: none; border: none; font-size: 11px; font-weight: 600; color: #0052cc; cursor: pointer; text-decoration: underline;">
                      ${currentTask.rootCauseAnalysis ? 'Edit RCA' : '+ Tulis RCA'}
                    </button>
                  </div>
                  ${currentTask.rootCauseAnalysis ? `
                    <div style="font-size: 11px; color: #42526e; display: flex; flex-direction: column; gap: 4px;">
                      <div style="background: white; padding: 8px 10px; border-radius: 4px; border: 1px solid #dfe1e6;">
                        <strong>Akar Masalah:</strong> ${currentTask.rootCauseAnalysis}
                      </div>
                      ${currentTask.preventiveMeasures ? `
                        <div style="background: white; padding: 8px 10px; border-radius: 4px; border: 1px solid #dfe1e6;">
                          <strong>Langkah Pencegahan:</strong> ${currentTask.preventiveMeasures}
                        </div>
                      ` : ''}
                    </div>
                  ` : `
                    <p style="font-size: 11px; color: #6b778c; font-style: italic; margin: 0;">Belum ada dokumentasi RCA untuk tiket ini. Klik "+ Tulis RCA" untuk mencatat audit teknis.</p>
                  `}
                </div>
              </div>
            ` : ''}

            <!-- Jira Description Section -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <h3 style="font-size: 12px; font-weight: 700; color: #172b4d; text-transform: uppercase; letter-spacing: 0.04em; margin: 0;">
                Deskripsi
              </h3>
              <div style="font-size: 13px; color: #172b4d; line-height: 1.5; background: #fafbfc; padding: 14px; border-radius: 6px; border: 1px solid #dfe1e6; white-space: pre-line;">
                ${currentTask.description || '<span style="color: #6b778c; font-style: italic;">Belum ada deskripsi yang ditambahkan.</span>'}
              </div>
            </div>

            <!-- Jira Subtasks Section with Interactive Progress & Auto-Advancement -->
            <div class="jira-subtasks-card">
              <div class="jira-subtasks-header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: #0052cc;">${Icons.checkSquare('', 15)}</span>
                    <span style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">
                      Subtask &amp; Checklist
                    </span>
                    <span style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; padding: 1px 7px; border-radius: 9999px; background: #e0e7ff; color: #3730a3;">
                      ${completedSubtasksCount}/${totalSubtasksCount}
                    </span>
                  </div>

                  <div class="jira-subtasks-progress">
                    <div class="jira-subtasks-progress-bar">
                      <div class="jira-subtasks-progress-fill ${progressPercent === 100 ? 'jira-subtasks-progress-fill--complete' : ''}" style="width: ${progressPercent}%;"></div>
                    </div>
                    <span style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; color: ${progressPercent === 100 ? '#059669' : '#64748b'};">
                      ${progressPercent}%
                    </span>
                  </div>
                </div>

                ${nextPhase ? `
                  <button class="phase-move-btn jira-btn ${progressPercent === 100 ? 'jira-btn--primary' : 'jira-btn--default'}" data-status="${nextPhase.targetStatus}" data-label="${nextPhase.label}" style="font-size: 11px; padding: 4px 10px; gap: 4px; height: 26px;">
                    <span>Lanjut ke ${nextPhase.label}</span>
                    ${Icons.arrowRight('', 12)}
                  </button>
                ` : ''}
              </div>

              ${progressPercent === 100 && totalSubtasksCount > 0 ? `
                <div class="subtask-celebration-banner">
                  <i class="fi fi-rr-check" style="color: #059669; font-weight: bold;"></i>
                  <span><strong>Checklist 100% Tuntas:</strong> Seluruh kriteria subtask telah selesai diverifikasi.</span>
                </div>
              ` : ''}

              <!-- Subtasks List -->
              <div class="subtasks-list">
                ${totalSubtasksCount === 0 ? `
                  <div class="subtasks-empty-state">
                    Belum ada subtask. Tambahkan checklist pengerjaan pada formulir di bawah ini.
                  </div>
                ` : (currentTask.subtasks || []).map((st, idx) => `
                  <div class="subtask-row ${st.completed ? 'subtask-row--done' : ''}" data-subtask-id="${st.id}">
                    <button type="button" class="subtask-checkbox-btn ${st.completed ? 'checked' : ''}" title="${st.completed ? 'Tandai belum selesai' : 'Tandai selesai'}">
                      ${st.completed ? Icons.check('', 12) : ''}
                    </button>
                    
                    <span class="subtask-index">#${idx + 1}</span>

                    <span class="subtask-title ${st.completed ? 'subtask-title--done' : ''}">
                      ${this.escapeHtml(st.title)}
                    </span>

                    <span class="subtask-status-pill ${st.completed ? 'subtask-status-pill--done' : 'subtask-status-pill--todo'}">
                      ${st.completed ? 'SELESAI' : 'TO DO'}
                    </span>

                    <button type="button" class="subtask-delete-btn" data-subtask-id="${st.id}" title="Hapus subtask ini">
                      ${Icons.x('', 12)}
                    </button>
                  </div>
                `).join('')}
              </div>

              <!-- Add Subtask Form -->
              <form id="addSubtaskForm" class="subtask-add-form">
                <span class="subtask-add-icon">${Icons.plus('', 14)}</span>
                <input
                  id="newSubtaskInput"
                  type="text"
                  placeholder="Tambah subtask baru atau kriteria acceptance... (Tekan Enter)"
                  value="${this.escapeHtml(this.subModalData.newSubtaskTitle || '')}"
                  class="subtask-add-input"
                />
                <button type="submit" class="jira-btn jira-btn--primary" style="font-size: 11.5px; padding: 4px 12px; height: 28px;">
                  + Tambah
                </button>
              </form>
            </div>

            <!-- Jira Activity Section (Comments & History Tabs) -->
            <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 8px;">
              <div style="display: flex; border-bottom: 1px solid #dfe1e6; font-size: 12px; font-weight: 600;">
                <button id="tabCommentsBtn" style="padding: 8px 16px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'comments' ? '#0052cc' : 'transparent'}; color: ${this.activeTab === 'comments' ? '#0052cc' : '#5e6c84'}; display: flex; align-items: center; gap: 6px; font-weight: 700;">
                  ${Icons.messageSquare('', 14)}
                  <span>Komentar &amp; Diskusi (${taskComments.length})</span>
                </button>
                <button id="tabHistoryBtn" style="padding: 8px 16px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.activeTab === 'history' ? '#0052cc' : 'transparent'}; color: ${this.activeTab === 'history' ? '#0052cc' : '#5e6c84'}; display: flex; align-items: center; gap: 6px; font-weight: 700;">
                  ${Icons.clock('', 14)}
                  <span>Jejak Audit Aktivitas (${taskEvents.length})</span>
                </button>
              </div>

              ${this.activeTab === 'comments' ? `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${taskComments.length === 0 ? `
                      <div style="padding: 16px 0; color: #6b778c; font-size: 12px; font-style: italic;">Belum ada diskusi atau komentar pada tiket ini.</div>
                    ` : taskComments.map(c => `
                      <div style="padding: 10px 14px; border-radius: 6px; background: ${c.isInternal ? '#fff0b330' : '#fafbfc'}; border: 1px solid ${c.isInternal ? '#ffe380' : '#dfe1e6'}; font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <strong style="color: #172b4d;">${c.author}</strong>
                            <span style="font-size: 10px; color: #5e6c84; font-family: var(--font-mono);">(${c.authorRole})</span>
                            ${c.isInternal ? `
                              <span style="font-size: 10px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 1px 6px; border-radius: 3px; display: inline-flex; align-items: center; gap: 2px;">
                                ${Icons.lock('', 10)} Internal
                              </span>
                            ` : ''}
                          </div>
                          <span style="font-size: 10px; font-family: var(--font-mono); color: #6b778c;">
                            ${new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style="color: #172b4d; margin: 0; line-height: 1.45; white-space: pre-line;">${this.escapeHtml(c.body)}</p>
                      </div>
                    `).join('')}
                  </div>

                  <!-- Comment Composer -->
                  <form id="addCommentForm" style="display: flex; flex-direction: column; gap: 8px;">
                    <textarea id="commentTextInput" rows="2" placeholder="Tulis komentar atau koordinasi teknis..." style="width: 100%; padding: 8px 12px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6; outline: none; background: white;"></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                      <label style="display: flex; align-items: center; gap: 6px; color: #5e6c84; cursor: pointer;">
                        <input id="internalCommentCheck" type="checkbox" style="accent-color: #0052cc;" />
                        <span>Komentar Internal (Hanya terlihat oleh tim pengembang)</span>
                      </label>
                      <button type="submit" class="jira-btn jira-btn--primary" style="font-size: 12px; padding: 6px 14px; gap: 6px;">
                        ${Icons.send('', 12)}
                        <span>Kirim Komentar</span>
                      </button>
                    </div>
                  </form>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto;">
                  ${taskEvents.map(ev => `
                    <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #ebecf0;">
                      <div style="width: 6px; height: 6px; border-radius: 50%; background: #0052cc; margin-top: 6px;"></div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between;">
                          <strong style="color: #172b4d;">${ev.actor}</strong>
                          <span style="font-size: 10px; font-family: var(--font-mono); color: #6b778c;">
                            ${new Date(ev.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style="color: #42526e; font-size: 11px; margin-top: 2px;">
                          ${ev.eventType === 'status_change'
                            ? `Mengubah status: <strong style="color: #172b4d;">${ev.fromValue}</strong> → <strong style="color: #0052cc;">${ev.toValue}</strong>`
                            : ev.payload || ''
                          }
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          <!-- Right Column: Sticky Jira Metadata Sidebar (30%) -->
          <div class="modal-detail-right">
            
            <!-- Details Accordion Header -->
            <div style="font-size: 12px; font-weight: 700; color: #172b4d; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #dfe1e6; padding-bottom: 8px;">
              Detail Tiket
            </div>

            <!-- Priority -->
            <div class="jira-meta-row">
              <span class="jira-meta-label">Prioritas</span>
              <select id="detailPrioritySelect" style="padding: 6px 8px; font-size: 12px; font-weight: 600; border-radius: 4px; border: 1px solid #dfe1e6; background: white; color: #172b4d;">
                <option value="Hotfix" ${currentTask.priority === 'Hotfix' ? 'selected' : ''}>Hotfix (Mendesak)</option>
                <option value="Tinggi" ${currentTask.priority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
                <option value="Sedang" ${currentTask.priority === 'Sedang' ? 'selected' : ''}>Sedang</option>
                <option value="Rendah" ${currentTask.priority === 'Rendah' ? 'selected' : ''}>Rendah</option>
              </select>
            </div>

            <!-- Assignee -->
            <div class="jira-meta-row">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="jira-meta-label">Assignee</span>
                <button id="assignToMeBtn" style="background: none; border: none; font-size: 11px; color: #0052cc; cursor: pointer; padding: 0;">
                  Tugaskan ke Saya
                </button>
              </div>
              <select id="detailAssigneeSelect" style="padding: 6px 8px; font-size: 12px; font-weight: 600; border-radius: 4px; border: 1px solid #dfe1e6; background: white; color: #172b4d;">
                ${state.teamMembers.map(m => `
                  <option value="${m.id}" ${currentTask.assigneeId === m.id ? 'selected' : ''}>
                    ${m.name} (${m.role})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Reporter -->
            <div class="jira-meta-row">
              <span class="jira-meta-label">Pelapor (Reporter)</span>
              <div style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; background: white; border-radius: 4px; border: 1px solid #dfe1e6; font-size: 12px;">
                ${reporter ? `<img src="${reporter.avatar}" alt="${reporter.name}" style="width: 20px; height: 20px; border-radius: 50%;" />` : ''}
                <strong style="color: #172b4d;">${reporter?.name || 'Sentry Telemetry'}</strong>
                <span style="font-size: 10px; color: #5e6c84;">(${currentTask.source})</span>
              </div>
            </div>

            <!-- Sprint & Dates -->
            <div style="padding-top: 8px; border-top: 1px solid #dfe1e6; display: flex; flex-direction: column; gap: 12px;">
              ${sprint ? `
                <div class="jira-meta-row">
                  <span class="jira-meta-label">Sprint</span>
                  <div style="font-size: 12px; font-weight: 600; color: #172b4d; background: white; padding: 6px 8px; border-radius: 4px; border: 1px solid #dfe1e6;">
                    ${sprint.name}
                  </div>
                </div>
              ` : ''}

              <div class="jira-meta-row">
                <span class="jira-meta-label">Jatuh Tempo (Due Date)</span>
                <input id="detailDueDateInput" type="date" value="${currentTask.dueDate}" style="padding: 6px 8px; font-size: 12px; font-family: var(--font-mono); font-weight: 600; border-radius: 4px; border: 1px solid #dfe1e6; background: white;" />
              </div>
            </div>

            <!-- Jira Time Tracking Progress Bar -->
            <div style="padding-top: 8px; border-top: 1px solid #dfe1e6; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="jira-meta-label">Time Tracking</span>
                <span style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; color: #172b4d;">
                  ${logged}h / ${estimate}h
                </span>
              </div>

              <div class="jira-timetrack-bar">
                <div class="jira-timetrack-logged" style="width: ${loggedPercent}%;"></div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
                <div>
                  <span style="font-size: 10px; color: #5e6c84; display: block; margin-bottom: 2px;">Estimasi (Jam)</span>
                  <input id="detailEstimateInput" type="number" value="${currentTask.estimateHours}" style="width: 100%; padding: 4px 6px; font-size: 12px; font-family: var(--font-mono); border-radius: 4px; border: 1px solid #dfe1e6; background: white;" />
                </div>
                <div>
                  <span style="font-size: 10px; color: #5e6c84; display: block; margin-bottom: 2px;">Log Jam</span>
                  <input id="detailTimeLoggedInput" type="number" step="0.5" value="${currentTask.timeLoggedHours}" style="width: 100%; padding: 4px 6px; font-size: 12px; font-family: var(--font-mono); border-radius: 4px; border: 1px solid #dfe1e6; background: white;" />
                </div>
              </div>
            </div>

            <!-- Git Development Panel (Jira Development Integration) -->
            <div style="padding-top: 8px; border-top: 1px solid #dfe1e6; display: flex; flex-direction: column; gap: 6px;">
              <span class="jira-meta-label">Pengembangan Git</span>
              <div style="background: white; border-radius: 4px; border: 1px solid #dfe1e6; padding: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="color: #5e6c84;">Branch:</span>
                  <code style="color: #0052cc; font-weight: 600;">${currentTask.branchName || `fix/${currentTask.key.toLowerCase()}`}</code>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="color: #5e6c84;">Pull Request:</span>
                  <span style="font-weight: 700; color: ${currentTask.prNumber ? '#006644' : '#6b778c'};">
                    ${currentTask.prNumber || 'Belum Dibuka'}
                  </span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="color: #5e6c84;">CI Status:</span>
                  <span style="font-weight: 600; color: #006644;"><i class="fi fi-rr-check"></i> 6/6 Tests Passing</span>
                </div>
              </div>
            </div>

            <!-- Billing Status -->
            <div style="padding-top: 8px; border-top: 1px solid #dfe1e6; display: flex; flex-direction: column; gap: 6px;">
              <span class="jira-meta-label">Status Tagihan Finance</span>
              ${currentTask.billedInvoiceId ? `
                <div style="font-size: 11px; font-weight: 700; color: #006644; background: #e3fcef; padding: 8px 10px; border-radius: 4px; border: 1px solid #abf5d1; display: flex; align-items: center; gap: 6px;">
                  ${Icons.checkCircle('', 14)}
                  <span>Ditagih (${currentTask.billedInvoiceId})</span>
                </div>
              ` : `
                <div style="font-size: 11px; color: #5e6c84; background: white; padding: 8px 10px; border-radius: 4px; border: 1px solid #dfe1e6; display: flex; justify-content: space-between; align-items: center;">
                  <span>Belum Ditagih</span>
                  <span style="font-size: 10px; font-weight: 700; color: #0052cc;">Siap masuk invoice</span>
                </div>
              `}
            </div>

            <!-- Delete Button (Admin / Owner) -->
            ${state.role === 'owner' ? `
              <div style="padding-top: 10px; border-top: 1px solid #dfe1e6;">
                <button id="deleteTaskBtn" style="width: 100%; padding: 6px; font-size: 11px; font-weight: 600; color: #bf2600; background: #ffebe6; border: 1px solid #ffbdad; border-radius: 4px; cursor: pointer;">
                  Hapus Tiket Pekerjaan
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- 3. Sub-Modals (Triage, QA, RCA, PR, Reject, Revision) -->
      ${this.renderActiveSubModal(currentTask, state.teamMembers)}
    `;

    this.attachEvents(currentTask);
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  renderActiveSubModal(task, teamMembers) {
    if (!this.activeSubModal) return '';

    if (this.activeSubModal === 'triage') {
      return `
        <div class="submodal-overlay" id="subModalOverlay">
          <div class="submodal-box" style="max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dfe1e6; padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #172b4d; font-size: 14px;">
                ${Icons.sliders('', 16)}
                <span>Triage &amp; Konfigurasi SLA Bug</span>
              </div>
              <button id="closeSubModalBtn" style="background: none; border: none; cursor: pointer; color: #6b778c;">${Icons.x('', 16)}</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
              <div>
                <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Tingkat Keparahan (Bug Severity) *</label>
                <select id="subTriageSeverity" style="width: 100%; padding: 8px 10px; font-size: 12px; font-weight: 700; border-radius: 4px; border: 1px solid #dfe1e6; background: #fafbfc;">
                  <option value="S1 - Critical (Blocker)" ${this.subModalData.triageSeverity === 'S1 - Critical (Blocker)' ? 'selected' : ''}>S1 - Critical / Blocker (System Down / Data Loss, SLA &lt; 4 Jam)</option>
                  <option value="S2 - Major" ${this.subModalData.triageSeverity === 'S2 - Major' ? 'selected' : ''}>S2 - Major (Fitur Inti Rusak, SLA 24 Jam)</option>
                  <option value="S3 - Minor" ${this.subModalData.triageSeverity === 'S3 - Minor' ? 'selected' : ''}>S3 - Minor (Fungsi Terganggu, Workaround Ada, SLA 3 Hari)</option>
                  <option value="S4 - Trivial" ${this.subModalData.triageSeverity === 'S4 - Trivial' ? 'selected' : ''}>S4 - Trivial (Typo / Kosmetik UI, SLA Rilis Reguler)</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Lingkungan Terdampak</label>
                  <select id="subTriageEnv" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6; background: #fafbfc;">
                    <option value="Production" ${this.subModalData.triageEnv === 'Production' ? 'selected' : ''}>Production (Live)</option>
                    <option value="Staging" ${this.subModalData.triageEnv === 'Staging' ? 'selected' : ''}>Staging (Pre-Release)</option>
                    <option value="QA / Testing" ${this.subModalData.triageEnv === 'QA / Testing' ? 'selected' : ''}>QA / Testing</option>
                  </select>
                </div>
                <div>
                  <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Status Garansi</label>
                  <select id="subTriageWarranty" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6; background: #fafbfc;">
                    <option value="Garansi Proyek (Gratis)">Garansi Proyek (Rp 0 - Bebas Biaya)</option>
                    <option value="Kuota Maintenance">Potong Kuota Retainer</option>
                    <option value="Non-Garansi (Billable)">Non-Garansi (Ditagihkan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Assignee Lead Engineer</label>
                <select id="subTriageAssignee" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6; background: #fafbfc;">
                  ${teamMembers.map(m => `
                    <option value="${m.id}" ${task.assigneeId === m.id ? 'selected' : ''}>${m.name} (${m.role})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #dfe1e6;">
              <button id="cancelSubModalBtn" class="jira-btn jira-btn--default">Batal</button>
              <button id="confirmTriageBtn" class="jira-btn jira-btn--primary">Simpan &amp; Konfirmasi Triage</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeSubModal === 'qa') {
      const isPass = this.subModalData.qaIsPass;
      return `
        <div class="submodal-overlay" id="subModalOverlay">
          <div class="submodal-box">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="padding: 8px; border-radius: 6px; background: ${isPass ? '#e3fcef' : '#ffebe6'}; color: ${isPass ? '#006644' : '#bf2600'};">
                ${isPass ? Icons.checkCircle('', 20) : Icons.x('', 20)}
              </div>
              <div>
                <h3 style="font-size: 14px; font-weight: 700; color: #172b4d; margin: 0;">
                  ${isPass ? 'QA Sign-Off: Lolos Verifikasi Staging' : 'QA Sign-Off: Gagal (Reopen Bug)'}
                </h3>
                <p style="font-size: 11px; color: #5e6c84; margin: 2px 0 0 0;">
                  Tester: <strong>Parhan (QA Engineer)</strong> · Staging Pre-Release
                </p>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
              <label style="font-weight: 700; color: ${isPass ? '#172b4d' : '#bf2600'};">
                ${isPass ? 'Catatan Pengujian & Validasi QA *' : 'Alasan Reopen / Temuan Regresi *'}
              </label>
              <textarea id="qaNotesInput" rows="3" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid ${isPass ? '#dfe1e6' : '#ffbdad'};">${this.subModalData.qaNotes}</textarea>

              <div style="padding: 10px; border-radius: 4px; background: ${isPass ? '#e3fcef' : '#ffebe6'}; color: ${isPass ? '#006644' : '#bf2600'}; font-size: 11px;">
                ${isPass
                  ? 'Hasil Test Case: 6 / 6 Berhasil (100% Pass) · Siap Rilis Production'
                  : 'Tiket akan otomatis dikembalikan ke status In Progress / Perlu Manual agar developer segera memperbaiki temuan.'
                }
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #dfe1e6;">
              <button id="cancelSubModalBtn" class="jira-btn jira-btn--default">Batal</button>
              <button id="confirmQaSignOffBtn" class="jira-btn jira-btn--primary" style="${isPass ? 'background-color: #36b37e;' : 'background-color: #bf2600;'}">
                ${isPass ? 'Terbitkan Sign-Off Lolos' : 'Re-open Bug ke Developer'}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeSubModal === 'rca') {
      return `
        <div class="submodal-overlay" id="subModalOverlay">
          <div class="submodal-box" style="max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dfe1e6; padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #172b4d; font-size: 14px;">
                ${Icons.fileText('', 16)}
                <span>Dokumentasi Root Cause Analysis (RCA)</span>
              </div>
              <button id="closeSubModalBtn" style="background: none; border: none; cursor: pointer; color: #6b778c;">${Icons.x('', 16)}</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
              <div>
                <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Akar Masalah Teknis (Root Cause) *</label>
                <textarea id="rcaTextInput" rows="3" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6;" placeholder="Mengapa bug ini bisa terjadi?">${this.subModalData.rcaInput}</textarea>
              </div>

              <div>
                <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Langkah Pencegahan (Preventive Measures) *</label>
                <textarea id="preventiveTextInput" rows="2" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6;" placeholder="Apa yang dilakukan agar tidak terulang?">${this.subModalData.preventiveInput}</textarea>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #dfe1e6;">
              <button id="cancelSubModalBtn" class="jira-btn jira-btn--default">Batal</button>
              <button id="confirmRcaBtn" class="jira-btn jira-btn--primary">Simpan Dokumentasi RCA</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeSubModal === 'manual_pr') {
      return `
        <div class="submodal-overlay" id="subModalOverlay">
          <div class="submodal-box" style="max-width: 520px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dfe1e6; padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #172b4d; font-size: 14px;">
                ${Icons.gitPullRequest('', 16)}
                <span>Buka Pull Request Manual (Kirim ke Review)</span>
              </div>
              <button id="closeSubModalBtn" style="background: none; border: none; cursor: pointer; color: #6b778c;">${Icons.x('', 16)}</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
              <div>
                <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Judul Pull Request *</label>
                <input id="manualPrTitleInput" type="text" value="${this.subModalData.manualPrTitle}" style="width: 100%; padding: 8px 10px; font-size: 12px; font-weight: 700; border-radius: 4px; border: 1px solid #dfe1e6;" />
              </div>

              <div>
                <label style="font-weight: 700; color: #172b4d; display: block; margin-bottom: 4px;">Ringkasan Patch / Git Diff *</label>
                <textarea id="manualPrDiffInput" rows="4" style="width: 100%; padding: 8px 10px; font-family: var(--font-mono); font-size: 11px; background: #091e42; color: #c1c7d0; border-radius: 4px; border: 1px solid #253858;">${this.subModalData.manualPrDiff}</textarea>
              </div>

              <div style="padding: 10px; border-radius: 4px; background: #fafbfc; border: 1px solid #dfe1e6; font-size: 11px; color: #5e6c84; display: flex; justify-content: space-between;">
                <span>Target Branch: <strong style="color: #0052cc;">staging</strong></span>
                <span>Branch: <code>${task.branchName || `fix/${task.key.toLowerCase()}`}</code></span>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #dfe1e6;">
              <button id="cancelSubModalBtn" class="jira-btn jira-btn--default">Batal</button>
              <button id="confirmManualPrBtn" class="jira-btn jira-btn--primary">Buka PR &amp; Kirim Review</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeSubModal === 'revision') {
      return `
        <div class="submodal-overlay" id="subModalOverlay">
          <div class="submodal-box">
            <h3 style="font-size: 14px; font-weight: 700; color: #172b4d; margin: 0;">Minta Revisi ke Agen AI</h3>
            <p style="font-size: 12px; color: #5e6c84; margin: 0; line-height: 1.4;">Ketik arahan atau koreksi kode yang perlu diperbaiki ulang oleh Claude Code:</p>
            <textarea id="revisionNotesInput" rows="3" placeholder="Contoh: Tolong gunakan pembulatan ke bawah Math.floor..." style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6;">${this.subModalData.revisionNotes}</textarea>
            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #dfe1e6;">
              <button id="cancelSubModalBtn" class="jira-btn jira-btn--default">Batal</button>
              <button id="confirmRevisionBtn" class="jira-btn jira-btn--primary">Kirim Revisi</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeSubModal === 'reject') {
      return `
        <div class="submodal-overlay" id="subModalOverlay">
          <div class="submodal-box">
            <h3 style="font-size: 14px; font-weight: 700; color: #172b4d; margin: 0;">Tolak PR Otomatis</h3>
            <p style="font-size: 12px; color: #5e6c84; margin: 0; line-height: 1.4;">Sebutkan alasan penolakan agar tercatat di jejak audit:</p>
            <textarea id="rejectReasonInput" rows="3" placeholder="Contoh: Diff tidak menangani edge-case promo 100%..." style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #dfe1e6;">${this.subModalData.rejectReason}</textarea>
            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #dfe1e6;">
              <button id="cancelSubModalBtn" class="jira-btn jira-btn--default">Batal</button>
              <button id="confirmRejectBtn" class="jira-btn jira-btn--primary" style="background-color: #bf2600;">Konfirmasi Tolak PR</button>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  attachEvents(currentTask) {
    // Copy Task Key
    const copyKeyBtn = this.container.querySelector('#copyTaskKeyBtn');
    if (copyKeyBtn) {
      copyKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentTask.key);
        this.copiedKey = true;
        store.addToast('info', 'Tersalin!', `Kode ${currentTask.key} disalin ke clipboard.`);
        this.render();
        setTimeout(() => {
          this.copiedKey = false;
          this.render();
        }, 1500);
      });
    }

    // Close Dialog
    const closeBtn = this.container.querySelector('#detailModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        store.closeTaskDetail();
      });
    }

    // Status select change
    const statusSelect = this.container.querySelector('#detailStatusSelect');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        store.updateTaskStatus(currentTask.id, e.target.value);
      });
    }

    // Click on 6-Phase Stepper Cards or Advance/Revert Buttons
    this.container.querySelectorAll('.phase-card-btn, .phase-move-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStatus = btn.dataset.status;
        const phaseLabel = btn.dataset.label;
        if (targetStatus && targetStatus !== currentTask.status) {
          store.updateTaskStatus(currentTask.id, targetStatus, `Dipindahkan ke tahapan: ${phaseLabel}`);
          store.addToast('success', 'Fase Berpindah!', `Tugas berhasil dipindahkan ke: ${phaseLabel}`);
        }
      });
    });

    // Subtask toggle with auto-advance logic
    this.container.querySelectorAll('.subtask-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // If clicked on delete button, do not toggle
        if (e.target.closest('.subtask-delete-btn')) return;

        const subtaskId = row.dataset.subtaskId;
        const targetSubtask = (currentTask.subtasks || []).find(s => s.id === subtaskId);
        if (!targetSubtask) return;

        const willBeCompleted = !targetSubtask.completed;
        const updatedSubtasks = currentTask.subtasks.map(s => s.id === subtaskId ? { ...s, completed: willBeCompleted } : s);
        const newCompletedCount = updatedSubtasks.filter(s => s.completed).length;
        const totalCount = updatedSubtasks.length;
        const isNowAllDone = totalCount > 0 && newCompletedCount === totalCount;

        store.toggleSubtask(currentTask.id, subtaskId);

        // Auto-advance logic
        if (willBeCompleted && ['Baru', 'Backlog', 'To Do'].includes(currentTask.status)) {
          store.updateTaskStatus(currentTask.id, 'In Progress', `Subtask "${targetSubtask.title}" mulai dicentang. Pengerjaan dimulai.`);
          store.addToast('info', 'Fase Berpindah: In Progress', 'Tugas otomatis masuk ke kolom "In Progress" karena subtask mulai dikerjakan.');
          return;
        }

        if (isNowAllDone) {
          if (['In Progress', 'Perlu Manual', 'Diperbaiki Agen', 'Dianalisis'].includes(currentTask.status)) {
            store.updateTaskStatus(currentTask.id, 'Menunggu Persetujuan', 'Seluruh checklist subtask tuntas 100%. Diajukan untuk Code Review PR.');
            store.addToast('success', 'Checklist 100% Tuntas!', 'Semua subtask selesai! Tugas otomatis berpindah ke tahap "Review PR / Persetujuan".');
          } else if (currentTask.status === 'Menunggu Persetujuan') {
            store.updateTaskStatus(currentTask.id, 'QA/Testing', 'PR telah lolos verifikasi subtask, masuk ke QA Staging.');
            store.addToast('success', 'Masuk Pengujian QA', 'Tugas otomatis beralih ke tahap QA/Testing.');
          } else if (['QA/Testing', 'Deploy Staging', 'Disetujui'].includes(currentTask.status)) {
            store.updateTaskStatus(currentTask.id, 'Selesai', 'Seluruh pengujian subtask QA selesai.');
            store.addToast('success', 'Tugas Selesai & Terverifikasi!', 'Tugas otomatis berpindah ke kolom Selesai.');
          }
          return;
        }

        if (!willBeCompleted && currentTask.status === 'Selesai') {
          store.updateTaskStatus(currentTask.id, 'In Progress', `Subtask "${targetSubtask.title}" batal dicentang. Tugas dibuka kembali.`);
          store.addToast('warning', 'Tugas Dibuka Kembali', 'Subtask belum tuntas, tugas kembali ke In Progress.');
          return;
        }

        if (willBeCompleted) {
          store.addToast('info', 'Subtask Dicentang', `${newCompletedCount}/${totalCount} subtask tuntas.`);
        }
      });
    });

    // Subtask delete handler
    this.container.querySelectorAll('.subtask-delete-btn').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const subtaskId = delBtn.dataset.subtaskId;
        if (subtaskId) {
          store.deleteSubtask(currentTask.id, subtaskId);
        }
      });
    });

    // Add Subtask Form
    const addSubtaskForm = this.container.querySelector('#addSubtaskForm');
    if (addSubtaskForm) {
      addSubtaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.container.querySelector('#newSubtaskInput');
        const val = input ? input.value.trim() : '';
        if (val) {
          store.addSubtask(currentTask.id, val);
          this.subModalData.newSubtaskTitle = '';
        }
      });
    }

    // Focus Add Subtask button from action bar
    const focusSubtaskBtn = this.container.querySelector('#focusAddSubtaskBtn');
    if (focusSubtaskBtn) {
      focusSubtaskBtn.addEventListener('click', () => {
        const input = this.container.querySelector('#newSubtaskInput');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // Attach File Button
    const attachBtn = this.container.querySelector('#attachFileBtn');
    if (attachBtn) {
      attachBtn.addEventListener('click', () => {
        alert('Fitur Lampiran Jira: Anda dapat melampirkan screenshot bug, log Sentry, atau file spesifikasi PRD.');
      });
    }

    // Link Issue Button
    const linkBtn = this.container.querySelector('#linkIssueBtn');
    if (linkBtn) {
      linkBtn.addEventListener('click', () => {
        const key = prompt('Masukkan Kode Tiket yang ingin ditautkan (contoh: LIB-102):');
        if (key && key.trim()) {
          store.addToast('success', 'Masalah Ditautkan', `Tiket ${currentTask.key} berhasil ditautkan dengan ${key.toUpperCase()}.`);
        }
      });
    }

    // Assign to me button
    const assignToMeBtn = this.container.querySelector('#assignToMeBtn');
    if (assignToMeBtn) {
      assignToMeBtn.addEventListener('click', () => {
        store.updateTask(currentTask.id, { assigneeId: 'usr-2' }); // Aldyana
        store.addToast('info', 'Assignee Diperbarui', 'Tiket berhasil ditugaskan kepada Anda.');
      });
    }

    // Dual-track tabs
    const devTrackBtn = this.container.querySelector('#trackDevBtn');
    if (devTrackBtn) {
      devTrackBtn.addEventListener('click', () => {
        this.fixingTrack = 'team_dev';
        this.render();
      });
    }

    const aiTrackBtn = this.container.querySelector('#trackAiBtn');
    if (aiTrackBtn) {
      aiTrackBtn.addEventListener('click', () => {
        this.fixingTrack = 'ai_agent';
        this.render();
      });
    }

    // Git command copy
    const copyGitCmdBtn = this.container.querySelector('#copyGitCmdBtn');
    if (copyGitCmdBtn) {
      copyGitCmdBtn.addEventListener('click', () => {
        const cmd = `git checkout -b ${currentTask.branchName || `fix/${currentTask.key.toLowerCase()}-hotfix`} origin/staging`;
        navigator.clipboard.writeText(cmd);
        this.copiedCmd = true;
        store.addToast('info', 'Perintah Tersalin!', cmd);
        this.render();
        setTimeout(() => {
          this.copiedCmd = false;
          this.render();
        }, 1500);
      });
    }

    // Start Dev Work Button
    const startDevBtn = this.container.querySelector('#startDevWorkBtn');
    if (startDevBtn) {
      startDevBtn.addEventListener('click', () => {
        store.updateTaskStatus(currentTask.id, 'In Progress', 'Developer memulai investigasi & pengerjaan fix');
      });
    }

    // AI Fix trigger
    const aiFixBtn = this.container.querySelector('#triggerAiFixBtn');
    if (aiFixBtn) {
      aiFixBtn.addEventListener('click', async () => {
        this.isSimulatingAgent = true;
        this.render();
        await store.runAiFixer(currentTask.id);
        this.isSimulatingAgent = false;
        this.render();
      });
    }

    // Diff expand / collapse
    const toggleDiffBtn = this.container.querySelector('#toggleDiffBtn');
    if (toggleDiffBtn) {
      toggleDiffBtn.addEventListener('click', () => {
        this.isDiffExpanded = !this.isDiffExpanded;
        this.render();
      });
    }

    // Review Decision buttons
    const approvePrBtn = this.container.querySelector('#approvePrBtn');
    if (approvePrBtn) {
      approvePrBtn.addEventListener('click', () => {
        store.approveAiPr(currentTask.id);
      });
    }

    const requestRevBtn = this.container.querySelector('#requestRevisionBtn');
    if (requestRevBtn) {
      requestRevBtn.addEventListener('click', () => {
        this.subModalData.revisionNotes = '';
        this.activeSubModal = 'revision';
        this.render();
      });
    }

    const rejectPrBtn = this.container.querySelector('#rejectPrBtn');
    if (rejectPrBtn) {
      rejectPrBtn.addEventListener('click', () => {
        this.subModalData.rejectReason = '';
        this.activeSubModal = 'reject';
        this.render();
      });
    }

    const switchManualBtn = this.container.querySelector('#switchManualDevBtn');
    if (switchManualBtn) {
      switchManualBtn.addEventListener('click', () => {
        store.updateTaskStatus(currentTask.id, 'Perlu Manual', 'Dialihkan ke programmer manual.');
      });
    }

    // QA action buttons
    const qaPassBtn = this.container.querySelector('#qaSignOffPassBtn');
    if (qaPassBtn) {
      qaPassBtn.addEventListener('click', () => {
        this.subModalData.qaIsPass = true;
        this.subModalData.qaNotes = 'Verifikasi Staging berhasil. Seluruh alur reproduksi bug telah tervalidasi dan regression test lolos.';
        this.activeSubModal = 'qa';
        this.render();
      });
    }

    const qaFailBtn = this.container.querySelector('#qaSignOffFailBtn');
    if (qaFailBtn) {
      qaFailBtn.addEventListener('click', () => {
        this.subModalData.qaIsPass = false;
        this.subModalData.qaNotes = 'Ditemukan regresi saat uji coba: response belum konsisten pada skenario edge-case.';
        this.subModalData.qaReopenReason = 'Regresi terdeteksi pada skenario uji reproduksi.';
        this.activeSubModal = 'qa';
        this.render();
      });
    }

    const deployProdBtn = this.container.querySelector('#deployToProdBtn');
    if (deployProdBtn) {
      deployProdBtn.addEventListener('click', () => {
        store.deployToProduction(currentTask.id, true);
      });
    }

    // Monitoring test buttons
    const testRollbackBtn = this.container.querySelector('#testRollbackBtn');
    if (testRollbackBtn) {
      testRollbackBtn.addEventListener('click', () => {
        store.triggerRollback(currentTask.id, 'Error spike Sentry terdeteksi 3.8% pasca deploy');
      });
    }

    const markStableBtn = this.container.querySelector('#markStableDoneBtn');
    if (markStableBtn) {
      markStableBtn.addEventListener('click', () => {
        store.updateTaskStatus(currentTask.id, 'Selesai', 'Periode pemantauan tuntas tanpa error.');
      });
    }

    // Triage Open Button
    const openTriageBtn = this.container.querySelector('#openTriageModalBtn') || this.container.querySelector('#openTriageBarBtn');
    if (openTriageBtn) {
      openTriageBtn.addEventListener('click', () => {
        this.subModalData.triageSeverity = currentTask.severity || 'S2 - Major';
        this.subModalData.triageEnv = currentTask.environment || 'Production';
        this.subModalData.triageWarranty = currentTask.warrantyStatus || 'Garansi Proyek (Gratis)';
        this.subModalData.triageAssignee = currentTask.assigneeId || '';
        this.activeSubModal = 'triage';
        this.render();
      });
    }

    // Manual PR Open Button
    const openManualPrBtn = this.container.querySelector('#openManualPrModalBtn');
    if (openManualPrBtn) {
      openManualPrBtn.addEventListener('click', () => {
        this.subModalData.manualPrTitle = `fix(${currentTask.key.toLowerCase()}): perbaikan oleh developer`;
        this.subModalData.manualPrDiff = currentTask.prDiff || `--- a/src/modules/coreService.ts\n+++ b/src/modules/coreService.ts\n@@ -10,6 +10,10 @@\n+  // Manual bugfix patch applied\n+  if (param === null || param === undefined) {\n+    throw new ValidationError("Parameter wajib diisi");\n+  }\n`;
        this.activeSubModal = 'manual_pr';
        this.render();
      });
    }

    // RCA Open Button
    const openRcaBtn = this.container.querySelector('#openRcaModalBtn');
    if (openRcaBtn) {
      openRcaBtn.addEventListener('click', () => {
        this.subModalData.rcaInput = currentTask.rootCauseAnalysis || '';
        this.subModalData.preventiveInput = currentTask.preventiveMeasures || '';
        this.activeSubModal = 'rca';
        this.render();
      });
    }

    // Comments & History Tabs
    const tabCommentsBtn = this.container.querySelector('#tabCommentsBtn');
    if (tabCommentsBtn) {
      tabCommentsBtn.addEventListener('click', () => {
        this.activeTab = 'comments';
        this.render();
      });
    }

    const tabHistoryBtn = this.container.querySelector('#tabHistoryBtn');
    if (tabHistoryBtn) {
      tabHistoryBtn.addEventListener('click', () => {
        this.activeTab = 'history';
        this.render();
      });
    }

    // Add Comment Form
    const addCommentForm = this.container.querySelector('#addCommentForm');
    if (addCommentForm) {
      addCommentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = this.container.querySelector('#commentTextInput');
        const internalCheck = this.container.querySelector('#internalCommentCheck');
        const text = textInput ? textInput.value.trim() : '';
        const isInternal = internalCheck ? internalCheck.checked : false;
        if (text) {
          store.addComment(currentTask.id, text, isInternal);
          textInput.value = '';
        }
      });
    }

    // Right Column Inputs (Priority, Assignee, DueDate, Estimates)
    const prioritySelect = this.container.querySelector('#detailPrioritySelect');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        store.updateTask(currentTask.id, { priority: e.target.value });
      });
    }

    const assigneeSelect = this.container.querySelector('#detailAssigneeSelect');
    if (assigneeSelect) {
      assigneeSelect.addEventListener('change', (e) => {
        store.updateTask(currentTask.id, { assigneeId: e.target.value });
      });
    }

    const dueDateInput = this.container.querySelector('#detailDueDateInput');
    if (dueDateInput) {
      dueDateInput.addEventListener('change', (e) => {
        store.updateTask(currentTask.id, { dueDate: e.target.value });
      });
    }

    const estimateInput = this.container.querySelector('#detailEstimateInput');
    if (estimateInput) {
      estimateInput.addEventListener('change', (e) => {
        store.updateTask(currentTask.id, { estimateHours: Number(e.target.value) });
      });
    }

    const timeLoggedInput = this.container.querySelector('#detailTimeLoggedInput');
    if (timeLoggedInput) {
      timeLoggedInput.addEventListener('change', (e) => {
        store.updateTask(currentTask.id, { timeLoggedHours: Number(e.target.value) });
      });
    }

    // Delete task button
    const deleteBtn = this.container.querySelector('#deleteTaskBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Yakin ingin menghapus task ${currentTask.key}?`)) {
          store.deleteTask(currentTask.id);
          store.closeTaskDetail();
        }
      });
    }

    // Sub-modal action events
    const closeSubBtn = this.container.querySelector('#closeSubModalBtn') || this.container.querySelector('#cancelSubModalBtn');
    if (closeSubBtn) {
      closeSubBtn.addEventListener('click', () => {
        this.activeSubModal = null;
        this.render();
      });
    }

    const confirmTriageBtn = this.container.querySelector('#confirmTriageBtn');
    if (confirmTriageBtn) {
      confirmTriageBtn.addEventListener('click', () => {
        const sev = this.container.querySelector('#subTriageSeverity')?.value || 'S2 - Major';
        const env = this.container.querySelector('#subTriageEnv')?.value || 'Production';
        const war = this.container.querySelector('#subTriageWarranty')?.value || 'Garansi Proyek (Gratis)';
        const ass = this.container.querySelector('#subTriageAssignee')?.value || currentTask.assigneeId;

        store.triageBug(currentTask.id, {
          severity: sev,
          environment: env,
          warrantyStatus: war,
          assigneeId: ass,
          slaDeadline: sev.startsWith('S1')
            ? new Date(Date.now() + 4 * 3600000).toISOString()
            : sev.startsWith('S2')
            ? new Date(Date.now() + 24 * 3600000).toISOString()
            : new Date(Date.now() + 72 * 3600000).toISOString()
        });
        this.activeSubModal = null;
        this.render();
      });
    }

    const confirmQaBtn = this.container.querySelector('#confirmQaSignOffBtn');
    if (confirmQaBtn) {
      confirmQaBtn.addEventListener('click', () => {
        const notes = this.container.querySelector('#qaNotesInput')?.value || '';
        store.qaSignOff(currentTask.id, {
          passed: this.subModalData.qaIsPass,
          notes: notes.trim(),
          testCasesCount: 6,
          passedCasesCount: this.subModalData.qaIsPass ? 6 : 4,
          reopenReason: this.subModalData.qaIsPass ? undefined : notes.trim()
        });
        this.activeSubModal = null;
        this.render();
      });
    }

    const confirmRcaBtn = this.container.querySelector('#confirmRcaBtn');
    if (confirmRcaBtn) {
      confirmRcaBtn.addEventListener('click', () => {
        const rca = this.container.querySelector('#rcaTextInput')?.value || '';
        const prev = this.container.querySelector('#preventiveTextInput')?.value || '';
        store.recordBugRca(currentTask.id, rca.trim(), prev.trim());
        this.activeSubModal = null;
        this.render();
      });
    }

    const confirmManualPrBtn = this.container.querySelector('#confirmManualPrBtn');
    if (confirmManualPrBtn) {
      confirmManualPrBtn.addEventListener('click', () => {
        const title = this.container.querySelector('#manualPrTitleInput')?.value || '';
        const diff = this.container.querySelector('#manualPrDiffInput')?.value || '';
        const prNum = `PR #${Math.floor(Math.random() * 80) + 20}`;
        const branch = currentTask.branchName || `fix/${currentTask.key.toLowerCase()}-hotfix`;

        store.updateTask(currentTask.id, {
          status: 'Menunggu Persetujuan',
          prNumber: prNum,
          branchName: branch,
          prDiff: diff.trim(),
          testResult: {
            passed: true,
            total: 6,
            passedCount: 6,
            failedCount: 0,
            durationMs: 480,
            logs: [
              'PASS test/unit/manualPatch.test.ts',
              'reproduces original bug failure and asserts fixed state (38ms)',
              'smoke test on adjacent modules passes without side-effect (65ms)',
              'lint and typecheck clean (0 errors)'
            ]
          }
        });
        store.addToast('success', 'Pull Request Manual Dibuat', `${prNum} siap direview Tech Lead.`);
        this.activeSubModal = null;
        this.render();
      });
    }

    const confirmRevBtn = this.container.querySelector('#confirmRevisionBtn');
    if (confirmRevBtn) {
      confirmRevBtn.addEventListener('click', () => {
        const notes = this.container.querySelector('#revisionNotesInput')?.value || '';
        store.requestAiRevision(currentTask.id, notes.trim());
        this.activeSubModal = null;
        this.render();
      });
    }

    const confirmRejBtn = this.container.querySelector('#confirmRejectBtn');
    if (confirmRejBtn) {
      confirmRejBtn.addEventListener('click', () => {
        const reason = this.container.querySelector('#rejectReasonInput')?.value || '';
        store.rejectAiPr(currentTask.id, reason.trim());
        this.activeSubModal = null;
        this.render();
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
