/**
 * AiAutomationHub Component (100% Native Vanilla JS ES Module)
 * Implements End-to-End, Proportional, SaaS-Grade Workflow for AI Bug Automation & Triage:
 * 
 * 1. Top ERP Breadcrumb & Header Bar (Engine Status, Project Selector, Kill-Switch, Intake)
 * 2. End-to-End 4-Stage Interactive Workflow Progress Stepper (Ingest -> AST Triage -> Patch & Test -> Review & Deploy)
 * 3. Bug Classification Engine:
 *    - Rendah (Minor/Display/Null Guard -> Auto-Fix AI Claude)
 *    - Sedang (Business Logic/Form Validation -> Auto-Fix / Review PR)
 *    - Susah (Critical/Database Concurrency/Deadlock -> Escalation Manual Lead Dev)
 * 4. Live AI Fix Studio / Workbench (Split-Screen 42% / 58% Proportional Layout)
 * 5. Pipeline Kanban Board (6 Stages) & Comprehensive Table View with Classification Filters
 * 6. Modals: Create Bug Report, Human Lead Fix Resolution, Deep-Dive Inspector
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class AiAutomationHub {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'ai-hub-container';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenIntakeModal = options.onOpenIntakeModal || (() => store.openIntakeModal());

    // Main view & filter states
    this.viewMode = 'pipeline'; // 'pipeline' | 'list'
    this.categoryFilter = 'all'; // 'all' | 'rendah' | 'sedang' | 'susah' | 'pr_review' | 'manual' | 'monitoring'
    this.workflowStepFilter = null; // null | 1 | 2 | 3 | 4
    this.searchQuery = '';

    // Active task in Live AI Studio Workbench
    this.selectedTaskId = null;
    this.activeStudioTab = 'diff'; // 'diff' | 'tests' | 'git'
    this.isProcessingAiFix = false;
    this.simulationIndex = 0;

    // Deep inspector modal state
    this.inspectedTask = null;
    this.inspectorTab = 'overview'; // 'overview' | 'orchestrator' | 'solution' | 'qa_signoff' | 'telemetry'

    // Sub-modal states
    this.showNewBugModal = false;
    this.showHumanFixModal = false;

    this.init();
  }

  init() {
    this.render();
    this.attachEvents();

    store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.element;
  }

  getTaskClassification(task) {
    if (!task) return { key: 'rendah', label: 'Rendah', desc: 'Auto-Fix AI' };
    const diff = (task.difficulty || '').toLowerCase();
    const sev = (task.severity || '').toLowerCase();
    const prio = (task.priority || '').toLowerCase();

    if (diff === 'hard' || diff === 'susah' || sev.includes('critical') || sev.includes('blocker') || sev.includes('s1') || prio === 'hotfix') {
      return { key: 'susah', label: 'Susah', desc: 'Kritis / Manual Dev' };
    }
    if (diff === 'medium' || diff === 'sedang' || sev.includes('major') || sev.includes('s2') || prio === 'tinggi') {
      return { key: 'sedang', label: 'Sedang', desc: 'Logika & Review PR' };
    }
    return { key: 'rendah', label: 'Rendah', desc: 'Minor / Auto-Fix AI' };
  }

  getSelectedTask(bugTasks) {
    if (this.selectedTaskId) {
      const found = bugTasks.find(t => t.id === this.selectedTaskId);
      if (found) return found;
    }
    // Default to first bug task if available
    if (bugTasks.length > 0) {
      this.selectedTaskId = bugTasks[0].id;
      return bugTasks[0];
    }
    return null;
  }

  render() {
    const state = store.getState();
    const activeProj = store.getActiveProject() || state.projects[0];
    const allProjTasks = store.getProjectTasks();
    const bugTasks = allProjTasks.filter(t => (t.type || '').toLowerCase() === 'bug');

    // Klasifikasi Tingkat Kesulitan: Rendah, Sedang, Susah
    const rendahBugs = bugTasks.filter(t => this.getTaskClassification(t).key === 'rendah');
    const sedangBugs = bugTasks.filter(t => this.getTaskClassification(t).key === 'sedang');
    const susahBugs = bugTasks.filter(t => this.getTaskClassification(t).key === 'susah');

    const prReviewBugs = bugTasks.filter(t => t.status === 'Menunggu Persetujuan' || t.status === 'In Review');
    const manualBugs = bugTasks.filter(t => t.status === 'Perlu Manual');
    const monitoredBugs = bugTasks.filter(t => t.status === 'Dipantau' || t.status === 'Deploy Staging' || t.status === 'Deploy Production' || t.status === 'Selesai');

    // 4 Workflow stage counts
    const stage1Count = bugTasks.filter(t => ['Baru', 'Backlog'].includes(t.status)).length;
    const stage2Count = bugTasks.filter(t => ['Dianalisis', 'To Do'].includes(t.status)).length;
    const stage3Count = bugTasks.filter(t => ['In Progress', 'Diperbaiki Agen', 'Menunggu Persetujuan', 'In Review'].includes(t.status)).length;
    const stage4Count = bugTasks.filter(t => ['Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(t.status)).length;

    // Filter display tasks
    let displayTasks = bugTasks;

    if (this.workflowStepFilter === 1) {
      displayTasks = displayTasks.filter(t => ['Baru', 'Backlog'].includes(t.status));
    } else if (this.workflowStepFilter === 2) {
      displayTasks = displayTasks.filter(t => ['Dianalisis', 'To Do'].includes(t.status));
    } else if (this.workflowStepFilter === 3) {
      displayTasks = displayTasks.filter(t => ['In Progress', 'Diperbaiki Agen', 'Menunggu Persetujuan', 'In Review'].includes(t.status));
    } else if (this.workflowStepFilter === 4) {
      displayTasks = displayTasks.filter(t => ['Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(t.status));
    }

    // Category Filter (Rendah, Sedang, Susah, etc.)
    if (this.categoryFilter === 'rendah') {
      displayTasks = displayTasks.filter(t => this.getTaskClassification(t).key === 'rendah');
    } else if (this.categoryFilter === 'sedang') {
      displayTasks = displayTasks.filter(t => this.getTaskClassification(t).key === 'sedang');
    } else if (this.categoryFilter === 'susah') {
      displayTasks = displayTasks.filter(t => this.getTaskClassification(t).key === 'susah');
    } else if (this.categoryFilter === 'pr_review') {
      displayTasks = displayTasks.filter(t => t.status === 'Menunggu Persetujuan' || t.status === 'In Review');
    } else if (this.categoryFilter === 'manual') {
      displayTasks = displayTasks.filter(t => t.status === 'Perlu Manual');
    } else if (this.categoryFilter === 'monitoring') {
      displayTasks = displayTasks.filter(t => ['Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(t.status));
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      displayTasks = displayTasks.filter(t =>
        (t.key || '').toLowerCase().includes(q) ||
        (t.title || '').toLowerCase().includes(q) ||
        (t.severity || '').toLowerCase().includes(q) ||
        (this.getTaskClassification(t).label || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }

    // Active Task for Studio Workbench
    const activeBug = this.getSelectedTask(bugTasks);

    this.element.innerHTML = `
      <!-- ========================================================
           1. TOP BREADCRUMB STRIP
           ======================================================== -->
      <div class="ai-header-breadcrumb">
        <div class="ai-breadcrumb-left">
          <span class="ai-breadcrumb-item">ASTACODE ERP</span>
          <span class="ai-breadcrumb-sep">/</span>
          <span class="ai-breadcrumb-item">Management Proyek</span>
          <span class="ai-breadcrumb-sep">/</span>
          <span class="ai-breadcrumb-item">Pengembangan &amp; AI</span>
          <span class="ai-breadcrumb-sep">/</span>
          <span class="ai-breadcrumb-current">Otomasi Fix Bug AI</span>
        </div>
        <div class="ai-breadcrumb-right">
          <span class="ai-header-engine-tag" title="AI Engine Running">
            <i class="fi fi-rr-magic-wand" style="color: #4f46e5;"></i>
            <span>Claude 3.7 + DeepSeek AST Hybrid Orchestrator</span>
          </span>
        </div>
      </div>

      <!-- ========================================================
           2. MAIN HEADER & CONTROL BAR
           ======================================================== -->
      <div class="ai-header-bar">
        <div class="ai-header-left">
          <div class="ai-icon-box" title="Otomasi Fix Bug AI Hub">
            <i class="fi fi-rr-magic-wand"></i>
          </div>

          <div class="ai-header-title-wrap">
            <div class="ai-header-title-row">
              <h1 class="ai-header-title">Otomasi Fix Bug AI &amp; Intelligent Triage Hub</h1>
              <span class="ai-engine-status-pill ${activeProj.killSwitchActive ? 'ai-engine-status-pill--hold' : 'ai-engine-status-pill--active'}">
                ${activeProj.killSwitchActive ? '● KILL-SWITCH AKTIF (Otomasi Ditahan)' : '● OTOMASI OPERASIONAL (Auto-Triage & Patching)'}
              </span>
            </div>

            <div class="ai-header-meta-row">
              <div class="ai-proj-select-wrap">
                <select id="aiProjectSwitcher" class="ai-proj-select" title="Ganti Proyek Aktif">
                  ${state.projects.map((p) => `
                    <option value="${p.id}" ${p.id === activeProj.id ? 'selected' : ''}>
                      ${p.code} · ${p.name}
                    </option>
                  `).join('')}
                </select>
              </div>
              <span class="ai-header-desc">Alur triage otomatis: Ingest telemetri bug, evaluasi AST, patch diff &amp; deploy staging.</span>
            </div>
          </div>
        </div>

        <div class="ai-header-right">
          <!-- Quick Simulate Bug Dropdown/Button -->
          <button id="quickSimulateBugBtn" class="ai-btn ai-btn--secondary" title="Suntikkan contoh insiden bug ke proyek aktif untuk simulasi alur">
            <i class="fi fi-rr-flask"></i>
            <span>Simulasi Kasus Bug</span>
          </button>

          <!-- Toggle Kill-Switch Button -->
          <button id="toggleKillSwitchBtn" class="ai-btn ${activeProj.killSwitchActive ? 'ai-btn--killswitch-off' : 'ai-btn--killswitch-on'}" title="Hentikan sementara atau aktifkan kembali otomasi AI untuk proyek ini">
            <i class="fi fi-rr-power"></i>
            <span>${activeProj.killSwitchActive ? 'Buka Kunci (Resume AI)' : 'Kill-Switch Darurat'}</span>
          </button>

          <!-- Create New Bug Report Button -->
          <button id="openNewBugModalBtn" class="ai-btn ai-btn--primary" title="Catat laporan bug baru ke antrean otomasi">
            <i class="fi fi-rr-plus"></i>
            <span>Buat Laporan Bug</span>
          </button>
        </div>
      </div>

      <!-- ========================================================
           3. MAIN CONTENT BODY (CLEAN PROPORTIONAL LAYOUT)
           ======================================================== -->
      <div class="ai-hub-body">

        <!-- ========================================================
             A. END-TO-END WORKFLOW STEPPER MAP (4 CORE STAGES)
             ======================================================== -->
        <div class="ai-workflow-stepper">
          <!-- Step 1: Ingest & Laporan Masuk -->
          <div class="ai-wf-card ${this.workflowStepFilter === 1 ? 'ai-wf-card--active' : ''}" data-step="1" title="Klik untuk memfilter tiket di Tahap 1: Laporan Masuk">
            <div class="ai-wf-card__step-num">1</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">1. Deteksi &amp; Ingest</span>
                <span class="ai-wf-card__badge">${stage1Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Sentry Webhook &amp; Log Insiden</span>
            </div>
          </div>

          <!-- Step 2: Diagnostik AST & Triage AI -->
          <div class="ai-wf-card ${this.workflowStepFilter === 2 ? 'ai-wf-card--active' : ''}" data-step="2" title="Klik untuk memfilter tiket di Tahap 2: Triage & AST">
            <div class="ai-wf-card__step-num">2</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">2. Diagnostik &amp; Triage AI</span>
                <span class="ai-wf-card__badge">${stage2Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">AST Parser &amp; Guardrail Risiko</span>
            </div>
          </div>

          <!-- Step 3: Sintesis Patch & Unit Test -->
          <div class="ai-wf-card ${this.workflowStepFilter === 3 ? 'ai-wf-card--active' : ''}" data-step="3" title="Klik untuk memfilter tiket di Tahap 3: Patch & Test">
            <div class="ai-wf-card__step-num">3</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">3. Patch &amp; Unit Test</span>
                <span class="ai-wf-card__badge">${stage3Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Git Branch &amp; Test Suite Lolos</span>
            </div>
          </div>

          <!-- Step 4: Review Manusia & Rilis Aman -->
          <div class="ai-wf-card ${this.workflowStepFilter === 4 ? 'ai-wf-card--active' : ''}" data-step="4" title="Klik untuk memfilter tiket di Tahap 4: Review & Deploy">
            <div class="ai-wf-card__step-num">4</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">4. Review &amp; Rilis Aman</span>
                <span class="ai-wf-card__badge">${stage4Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Persetujuan PR &amp; Pantau Sentry 30m</span>
            </div>
          </div>
        </div>

        <!-- ========================================================
             B. LIVE AI FIX WORKBENCH / STUDIO (PROPORTIONAL 42% / 58%)
             ======================================================== -->
        ${this.renderStudioWorkbench(activeBug, bugTasks)}

        <!-- ========================================================
             C. TOOLBAR: SEARCH, KLASIFIKASI & VIEW SWITCHER
             ======================================================== -->
        <div class="ai-toolbar">
          <div class="ai-toolbar-left">
            <!-- Search Box -->
            <div class="ai-search-box">
              <i class="fi fi-rr-search ai-search-icon"></i>
              <input type="text" id="aiBugSearchInput" class="ai-search-input" placeholder="Cari kode tiket, judul, error, klasifikasi..." value="${this.searchQuery}" />
            </div>

            <!-- Category & Classification Filter Pills -->
            <div class="ai-filter-pills">
              <button class="ai-filter-pill ${this.categoryFilter === 'all' && !this.workflowStepFilter ? 'ai-filter-pill--active' : ''}" data-cat="all">Semua (${bugTasks.length})</button>

              <!-- Klasifikasi Rendah, Sedang, Susah -->
              <button class="ai-filter-pill ${this.categoryFilter === 'rendah' ? 'ai-filter-pill--active' : ''}" data-cat="rendah" title="Bug tingkat kesulitan rendah (minor/tampilan) yang dapat langsung di-patch agen AI">
                <span class="ai-pill-dot" style="background: #10b981;"></span>
                <span>Rendah (${rendahBugs.length})</span>
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'sedang' ? 'ai-filter-pill--active' : ''}" data-cat="sedang" title="Bug tingkat kesulitan sedang pada alur bisnis & validasi formulir">
                <span class="ai-pill-dot" style="background: #f59e0b;"></span>
                <span>Sedang (${sedangBugs.length})</span>
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'susah' ? 'ai-filter-pill--active' : ''}" data-cat="susah" title="Bug tingkat kesulitan susah (kritis/deadlock) yang memerlukan penanganan developer manusia">
                <span class="ai-pill-dot" style="background: #ef4444;"></span>
                <span>Susah (${susahBugs.length})</span>
              </button>

              <button class="ai-filter-pill ${this.categoryFilter === 'pr_review' ? 'ai-filter-pill--active' : ''}" data-cat="pr_review">Menunggu Review PR (${prReviewBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'manual' ? 'ai-filter-pill--active' : ''}" data-cat="manual">Perlu Manual Dev (${manualBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'monitoring' ? 'ai-filter-pill--active' : ''}" data-cat="monitoring">Staging &amp; Monitoring (${monitoredBugs.length})</button>
            </div>
          </div>

          <!-- View Mode Toggle -->
          <div class="ai-view-switcher">
            <button id="viewPipelineBtn" class="ai-view-btn ${this.viewMode === 'pipeline' ? 'ai-view-btn--active' : ''}">
              <i class="fi fi-rr-apps"></i>
              <span>Pipeline Kanban (6 Tahap)</span>
            </button>
            <button id="viewListBtn" class="ai-view-btn ${this.viewMode === 'list' ? 'ai-view-btn--active' : ''}">
              <i class="fi fi-rr-list"></i>
              <span>Tabel Detail</span>
            </button>
          </div>
        </div>

        <!-- ========================================================
             D. PIPELINE KANBAN (6 TAHAPAN) VS TABEL DETAIL
             ======================================================== -->
        ${this.viewMode === 'pipeline' ? this.renderPipelineView(displayTasks) : this.renderListView(displayTasks)}

      </div>

      <!-- Deep Inspector Modal -->
      ${this.inspectedTask ? this.renderInspectorModal(this.inspectedTask) : ''}

      <!-- Create New Bug Report Modal -->
      ${this.showNewBugModal ? this.renderNewBugModal() : ''}

      <!-- Human Developer Resolution Modal (For Susah / S1 Bugs) -->
      ${this.showHumanFixModal && activeBug ? this.renderHumanFixModal(activeBug) : ''}
    `;

    this.attachDynamicListeners();
  }

  renderStudioWorkbench(task, allBugs) {
    if (!task) {
      return `
        <div class="ai-studio-card">
          <div style="padding: 40px 20px; text-align: center; color: #64748b;">
            <i class="fi fi-rr-inbox-in" style="font-size: 32px; color: #94a3b8; display: block; margin-bottom: 8px;"></i>
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 15px;">Belum Ada Tiket Bug pada Proyek Ini</h3>
            <p style="margin: 0 0 14px 0; font-size: 12.5px;">Klik tombol di bawah untuk membuat laporan bug atau menyuntikkan contoh insiden simulasi.</p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button id="studioSimulateBtn" class="ai-btn ai-btn--secondary">
                <i class="fi fi-rr-flask"></i> Simulasi Kasus Bug
              </button>
              <button id="studioCreateBtn" class="ai-btn ai-btn--primary">
                <i class="fi fi-rr-plus"></i> Buat Laporan Bug
              </button>
            </div>
          </div>
        </div>
      `;
    }

    const taskCls = this.getTaskClassification(task);
    const isSusah = taskCls.key === 'susah';
    const confidence = task.confidenceScore || (isSusah ? 46 : taskCls.key === 'sedang' ? 84 : 96);
    const confidenceColor = confidence >= 85 ? '#059669' : confidence >= 60 ? '#d97706' : '#e11d48';

    // Target code file & stacktrace extraction
    let codeTargetFile = 'src/services/appService.ts';
    let codeSnippet = 'TypeError: Cannot read properties of undefined at line 45';
    let rootCauseExplanation = 'Variabel null dereference pada method invocation saat payload bernilai kosong.';

    if (task.diagnosticPackage?.affectedFiles && task.diagnosticPackage.affectedFiles.length > 0) {
      codeTargetFile = task.diagnosticPackage.affectedFiles[0].path;
      codeSnippet = (task.diagnosticPackage.sentryBreadcrumbs || []).join('\n') || task.description;
      rootCauseExplanation = task.diagnosticPackage.summary || task.description;
    } else if (task.key === 'POS-104') {
      codeTargetFile = 'src/services/taxEngine.ts:18';
      codeSnippet = `TypeError: calculateTaxPB1 is undefined saat diskon promo 100%
  at calculateTaxPB1 (src/services/taxEngine.ts:18:24)
  at processCheckout (src/controllers/CheckoutController.ts:64:12)
  at handlePaymentConfirm (src/components/PaymentModal.tsx:112:5)`;
      rootCauseExplanation = 'Saat voucher promo 100% diaplikasikan, subtotal menjadi 0. Formula pembagian pajak PB1 mengalami division-by-zero / undefined reference karena ketiadaan null guard batas bawah 0.';
    } else if (task.key === 'POS-108') {
      codeTargetFile = 'src/db/queries/transactionLock.ts:42';
      codeSnippet = `PostgreSQL Deadlock Detected (SQLSTATE[40P01]):
  Process 14210 waits for ExclusiveLock on transaction 8912;
  Process 14212 waits for ShareLock on transaction 8910;
  at TransactionManager.execute (src/db/transactionManager.ts:88:9)`;
      rootCauseExplanation = 'Dua transaksi kasir cabang simultan mengunci baris inventaris secara silang tanpa urutan ID deterministik. Terjadi cyclic lock dependency pada PostgreSQL database.';
    } else {
      codeSnippet = task.description || 'Tidak ada stacktrace yang dicatat.';
      rootCauseExplanation = task.confidenceReason || 'AST parser menganalisis node sintaksis dan merekomendasikan patch penjaga nilai kosong.';
    }

    // Mini lifecycle progression calculation
    const st = task.status;
    const isStep1Done = ['Dianalisis', 'To Do', 'In Progress', 'Diperbaiki Agen', 'Menunggu Persetujuan', 'In Review', 'Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(st);
    const isStep2Done = ['In Progress', 'Diperbaiki Agen', 'Menunggu Persetujuan', 'In Review', 'Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(st);
    const isStep3Done = ['Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(st);
    const isStep4Done = ['Dipantau', 'Selesai'].includes(st);

    const isStep1Active = ['Baru', 'Backlog'].includes(st);
    const isStep2Active = ['Dianalisis', 'To Do'].includes(st);
    const isStep3Active = ['In Progress', 'Diperbaiki Agen', 'Menunggu Persetujuan', 'In Review', 'Perlu Manual'].includes(st);
    const isStep4Active = ['Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production'].includes(st);

    return `
      <div class="ai-studio-card" id="aiStudioWorkbench">
        <!-- Studio Header -->
        <div class="ai-studio-header">
          <div class="ai-studio-header-left">
            <h3 class="ai-studio-title">
              <i class="fi fi-rr-cpu" style="color: #4f46e5;"></i>
              <span>Studio Diagnostik &amp; Eksekusi Patch AI</span>
            </h3>

            <!-- Task Selector Dropdown with Classification -->
            <div class="ai-studio-select-wrap">
              <select id="studioTaskSelector" class="ai-studio-task-select" title="Pilih tiket masalah yang ingin diinspeksi & diperbaiki">
                ${allBugs.map((t) => {
                  const c = this.getTaskClassification(t);
                  return `
                    <option value="${t.id}" ${t.id === task.id ? 'selected' : ''}>
                      [${t.key}] ${t.title.substring(0, 32)}... (${c.label})
                    </option>
                  `;
                }).join('')}
              </select>
            </div>
          </div>

          <div class="ai-studio-header-right">
            <!-- Quick Preset Chips -->
            <div class="ai-studio-presets-row">
              <span style="font-size: 11px; color: #64748b; font-weight: 600;">Contoh Kasus:</span>
              <button class="ai-preset-btn ${task.key === 'POS-104' ? 'ai-preset-btn--active' : ''}" data-preset-key="POS-104" title="Kasus Klasifikasi Rendah: Auto-Fix Penuh AI">
                ⚡ Kasus Rendah (Auto-Fix AI)
              </button>
              <button class="ai-preset-btn ${task.key === 'POS-108' ? 'ai-preset-btn--active' : ''}" data-preset-key="POS-108" title="Kasus Klasifikasi Susah: Guardrail Manual Dev">
                🛡️ Kasus Susah (Manual Dev)
              </button>
            </div>

            <!-- Full Detail Link -->
            <button id="studioOpenTaskDetailBtn" class="ai-btn ai-btn--secondary ai-btn--sm" data-task-id="${task.id}" title="Buka drawer detail tiket lengkap">
              <i class="fi fi-rr-arrow-up-right-from-square"></i>
              <span>Detail Lengkap</span>
            </button>
          </div>
        </div>

        <!-- Studio Split Canvas (42% Konteks vs 58% Solusi & Aksi) -->
        <div class="ai-studio-split">

          <!-- ==============================================
               KOLOM KIRI (42%): KONTEKS INSIDEN & DIAGNOSTIK
               ============================================== -->
          <div class="ai-studio-left">
            <!-- Context Header Box -->
            <div class="ai-ctx-card">
              <div class="ai-ctx-header">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span class="ai-bc-key">${task.key}</span>
                  <span class="ai-bc-classification ai-bc-classification--${taskCls.key}">
                    ● Klasifikasi: ${taskCls.label}
                  </span>
                  <span class="ai-engine-status-pill ai-engine-status-pill--active" style="font-size: 10px;">
                    ${task.status}
                  </span>
                </div>
                <span style="font-size: 11px; color: #64748b; font-weight: 600;">
                  SLA: <strong style="color: ${isSusah ? '#be123c' : '#334155'};">${task.slaDeadline ? '< 4 Jam (Hotfix)' : '24 Jam'}</strong>
                </span>
              </div>

              <h4 class="ai-ctx-title">${task.title}</h4>
              <p class="ai-ctx-desc">${task.description || 'Tidak ada deskripsi rinci.'}</p>

              <div style="display: flex; gap: 12px; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 6px;">
                <span>Sumber: <strong style="color: #334155;">${task.source || 'Sentry Exception Alert'}</strong></span>
                <span>·</span>
                <span>Lingkungan: <strong style="color: #334155;">${task.environment || 'Production'}</strong></span>
                <span>·</span>
                <span>Garansi: <strong style="color: #059669;">${task.warrantyStatus || 'Garansi Bebas Bug Rp0'}</strong></span>
              </div>
            </div>

            <!-- Target Source File & Stacktrace -->
            <div class="ai-ctx-card">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="ai-ctx-label">Berkas Target &amp; Stacktrace</span>
                <span style="font-family: var(--font-mono); font-size: 10.5px; color: #4f46e5; font-weight: 600;">
                  ${codeTargetFile}
                </span>
              </div>
              <div class="ai-code-box">
                <pre>${codeSnippet}</pre>
              </div>
            </div>

            <!-- Root Cause Analysis -->
            <div class="ai-ctx-card">
              <span class="ai-ctx-label">Analisis Akar Masalah (Root Cause AST)</span>
              <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #334155;">
                ${rootCauseExplanation}
              </p>
            </div>

            <!-- Safety Guardrail Callout Box -->
            ${isSusah || task.status === 'Perlu Manual' ? `
              <div class="ai-guardrail-callout ai-guardrail-callout--warning">
                <i class="fi fi-rr-shield-exclamation" style="font-size: 16px; flex-shrink: 0; margin-top: 2px;"></i>
                <div>
                  <strong style="display: block; margin-bottom: 2px;">Safety Guardrail Aktif (Klasifikasi Susah):</strong>
                  <span>Perubahan menyentuh integritas transaksi database atau race condition. AI Dilarang auto-deploy ke Production. Tiket dialihkan ke Lead Developer.</span>
                </div>
              </div>
            ` : `
              <div class="ai-guardrail-callout ai-guardrail-callout--safe">
                <i class="fi fi-rr-shield-check" style="font-size: 16px; flex-shrink: 0; margin-top: 2px;"></i>
                <div>
                  <strong style="display: block; margin-bottom: 2px;">Verifikasi Keselamatan Otomasi (Klasifikasi ${taskCls.label}):</strong>
                  <span>Bug bersifat fungsional tanpa resiko skema database. Aman untuk diproses otomatis oleh agen AI dengan proteksi test suite CI/CD.</span>
                </div>
              </div>
            `}
          </div>

          <!-- ==============================================
               KOLOM KANAN (58%): SOLUSI AI & EKSEKUSI ALUR
               ============================================== -->
          <div class="ai-studio-right">

            <!-- Mini Progress Stepper (Bug Lifecycle) -->
            <div class="ai-mini-stepper">
              <div class="ai-mini-step ${isStep1Done ? 'ai-mini-step--done' : isStep1Active ? 'ai-mini-step--current' : ''}">
                <div class="ai-mini-step__dot">${isStep1Done ? '✓' : '1'}</div>
                <span>Deteksi</span>
              </div>
              <div class="ai-mini-sep ${isStep1Done ? 'ai-mini-sep--done' : ''}"></div>

              <div class="ai-mini-step ${isStep2Done ? 'ai-mini-step--done' : isStep2Active ? 'ai-mini-step--current' : ''}">
                <div class="ai-mini-step__dot">${isStep2Done ? '✓' : '2'}</div>
                <span>Triage AI</span>
              </div>
              <div class="ai-mini-sep ${isStep2Done ? 'ai-mini-sep--done' : ''}"></div>

              <div class="ai-mini-step ${isStep3Done ? 'ai-mini-step--done' : isStep3Active ? 'ai-mini-step--current' : ''}">
                <div class="ai-mini-step__dot">${isStep3Done ? '✓' : '3'}</div>
                <span>Patch &amp; Test</span>
              </div>
              <div class="ai-mini-sep ${isStep3Done ? 'ai-mini-sep--done' : ''}"></div>

              <div class="ai-mini-step ${isStep4Done ? 'ai-mini-step--done' : isStep4Active ? 'ai-mini-step--current' : ''}">
                <div class="ai-mini-step__dot">${isStep4Done ? '✓' : '4'}</div>
                <span>Review &amp; Rilis</span>
              </div>
            </div>

            <!-- AI Decision & Confidence Meter Bar with Classification -->
            <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 11px; font-weight: 700; color: #475569;">Klasifikasi:</span>
                <span class="ai-bc-classification ai-bc-classification--${taskCls.key}">
                  ● ${taskCls.label} (${taskCls.desc})
                </span>
                <span style="font-size: 11px; color: #64748b;">
                  · PIC: <strong>${isSusah ? 'Jaka (Backend Lead)' : 'Claude 3.7 Coding Agent'}</strong>
                </span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; color: #64748b;">Keyakinan AI:</span>
                <strong style="font-family: var(--font-mono); font-size: 14px; color: ${confidenceColor};">${confidence}%</strong>
              </div>
            </div>

            <!-- Solution Sub-Tabs (Diff / Unit Tests / Git PR) -->
            <div class="ai-studio-tabs">
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'diff' ? 'ai-studio-tab-btn--active' : ''}" data-tab="diff">
                <i class="fi fi-rr-code-compare"></i>
                <span>1. Patch Diff (Sebelum vs Sesudah)</span>
              </button>
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'tests' ? 'ai-studio-tab-btn--active' : ''}" data-tab="tests">
                <i class="fi fi-rr-check"></i>
                <span>2. Unit Tests &amp; Regresi (${task.testResult?.passedCount || 5}/${task.testResult?.total || 5})</span>
              </button>
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'git' ? 'ai-studio-tab-btn--active' : ''}" data-tab="git">
                <i class="fi fi-brands-github"></i>
                <span>3. Git Branch &amp; PR</span>
              </button>
            </div>

            <!-- Tab Content Area -->
            <div style="flex: 1; display: flex; flex-direction: column;">
              ${this.renderStudioTabContent(task)}
            </div>

            <!-- ==============================================
                 DYNAMIC ACTION CONTROLS (END-TO-END WORKFLOW)
                 ============================================== -->
            <div class="ai-action-cluster">
              <div class="ai-action-cluster-left">
                ${this.renderContextualActionButtons(task)}
              </div>

              <div class="ai-action-cluster-right">
                <span style="font-size: 11px; color: #94a3b8;">
                  Status Tiket: <strong style="color: #475569;">${task.status}</strong>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  renderStudioTabContent(task) {
    if (this.activeStudioTab === 'diff') {
      const diffText = task.prDiff || `--- a/src/services/taxEngine.ts
+++ b/src/services/taxEngine.ts
@@ -18,7 +18,10 @@ export function calculateTaxPB1(subtotal: number, discountTotal: number): TaxBreakdown {
+  // Guard edge-case discount 100% (subtotal after promo <= 0)
+  const taxableBase = Math.max(0, subtotal - discountTotal);
+  if (taxableBase === 0) {
+    return { taxableBase: 0, taxAmount: 0, ratePercentage: 10 };
+  }
-  const taxableBase = subtotal - discountTotal;`;

      const lines = diffText.split('\n');

      return `
        <div class="ai-diff-viewer">
          <div class="ai-diff-viewer__header">
            <span>Branch: <code>${task.branchName || 'ai/patch-' + task.key.toLowerCase()}</code></span>
            <span>${lines.length} Baris Diff</span>
          </div>
          <div class="ai-diff-viewer__body">
            ${lines.map(line => {
              if (line.startsWith('+')) {
                return `<span class="ai-diff-line ai-diff-line--add">${this.escapeHtml(line)}</span>`;
              } else if (line.startsWith('-')) {
                return `<span class="ai-diff-line ai-diff-line--del">${this.escapeHtml(line)}</span>`;
              } else if (line.startsWith('@@')) {
                return `<span class="ai-diff-line ai-diff-line--info">${this.escapeHtml(line)}</span>`;
              }
              return `<span class="ai-diff-line">${this.escapeHtml(line)}</span>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeStudioTab === 'tests') {
      const logs = task.testResult?.logs || [
        'PASS test/unit/taxEngine.test.ts',
        'should calculate tax correctly on normal cart (18ms)',
        'should prevent division by zero / negative tax on 100% voucher (14ms)',
        'should fallback cleanly on missing discount payload (12ms)',
        'regression check: upstream billing & invoice unaffected (42ms)',
        'stress check: 500 concurrent calculation iterations PASS (58ms)'
      ];

      return `
        <div class="ai-test-suite">
          <div class="ai-test-suite-header">
            <div>
              <strong style="color: #065f46;">✓ Semua Pengujian Unit &amp; Regresi Lolos (100%)</strong>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 1px;">Eksekusi otomatis oleh CI Runner staging</div>
            </div>
            <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #059669;">
              ${task.testResult?.passedCount || 5}/${task.testResult?.total || 5} Passing (${task.testResult?.durationMs || 380}ms)
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px; max-height: 180px; overflow-y: auto;">
            ${logs.map(log => `
              <div class="ai-test-row ai-test-row--pass">
                <span>✓ ${this.escapeHtml(log.replace(/^PASS\s*/, ''))}</span>
                <span style="font-family: var(--font-mono); font-size: 10px; color: #059669; font-weight: 600;">PASS</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeStudioTab === 'git') {
      const branch = task.branchName || `ai/fix-${task.key.toLowerCase()}`;
      const prNum = task.prNumber || `PR #${Math.floor(Math.random() * 50) + 10}`;

      return `
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
          <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 600;">Pull Request GitHub:</span>
              <span style="font-family: var(--font-mono); font-weight: 700; color: #4f46e5;">${prNum}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 600;">Feature Branch:</span>
              <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${branch}</code>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 600;">Target Base Branch:</span>
              <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px;">origin/staging</code>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-weight: 600;">CI/CD GitHub Actions:</span>
              <span style="color: #059669; font-weight: 700;">● Passing (6/6 Checks)</span>
            </div>
          </div>

          <div style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px 14px;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Pesan Commit Rekomendasi AI:</strong>
            <pre style="margin: 0; font-family: var(--font-mono); font-size: 11px; color: #334155; line-height: 1.4;">fix(core): ${task.title.toLowerCase()}

- Pasang null &amp; division-by-zero boundary guard pada hitungan kalkulasi
- Cegah exception runtime saat kondisi transaksi edge case
- Tambahkan comprehensive unit regression test assertions</pre>
          </div>
        </div>
      `;
    }

    return '';
  }

  renderContextualActionButtons(task) {
    const st = task.status;

    // Loading State
    if (this.isProcessingAiFix) {
      return `
        <button class="ai-btn ai-btn--primary" disabled>
          <span class="ai-spinner"></span>
          <span>Agen AI Sedang Menganalisis &amp; Membuat Patch...</span>
        </button>
      `;
    }

    // Stage 1: Baru / Backlog / Dianalisis
    if (st === 'Baru' || st === 'Backlog' || st === 'Dianalisis' || st === 'To Do') {
      return `
        <button id="studioRunAiFixBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}" title="Picu Claude AI untuk membuat patch diff & unit tests secara otomatis">
          <i class="fi fi-rr-magic-wand"></i>
          <span>Jalankan Auto-Fix AI</span>
        </button>

        <button id="studioEscalateManualBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Alihkan tiket ke antrean developer manusia">
          <i class="fi fi-rr-user"></i>
          <span>Alihkan ke Manual Dev</span>
        </button>
      `;
    }

    // Stage 2: Menunggu Persetujuan / In Review
    if (st === 'Menunggu Persetujuan' || st === 'In Review') {
      return `
        <button id="studioApprovePrBtn" class="ai-btn ai-btn--success" data-task-id="${task.id}" title="Setujui Pull Request dan merge otomatis ke cluster Staging">
          <i class="fi fi-rr-check"></i>
          <span>Setujui PR &amp; Merge ke Staging</span>
        </button>

        <button id="studioRequestRevisionBtn" class="ai-btn ai-btn--warning" data-task-id="${task.id}" title="Minta agen AI merevisi logika patch">
          <i class="fi fi-rr-refresh"></i>
          <span>Minta Revisi ke AI</span>
        </button>

        <button id="studioEscalateManualBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Alihkan perbaikan ke programmer manusia">
          <i class="fi fi-rr-user"></i>
          <span>Alihkan ke Manual Dev</span>
        </button>
      `;
    }

    // Stage 3: Disetujui / QA/Testing / Deploy Staging
    if (st === 'Disetujui' || st === 'QA/Testing' || st === 'Deploy Staging') {
      return `
        <button id="studioDeployProdBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}" title="Rilis perbaikan ke Production dengan perlindungan pemantauan Sentry">
          <i class="fi fi-rr-rocket"></i>
          <span>Deploy ke Production (Pantau Sentry)</span>
        </button>

        <button id="studioQaSignOffBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Verifikasi sign-off pengujian staging">
          <i class="fi fi-rr-badge-check"></i>
          <span>Beri Sign-Off QA (Lolos)</span>
        </button>
      `;
    }

    // Stage 4: Deploy Production / Dipantau / Selesai
    if (st === 'Deploy Production' || st === 'Dipantau' || st === 'Selesai') {
      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="ai-engine-status-pill ai-engine-status-pill--active" style="padding: 5px 10px;">
            <i class="fi fi-rr-shield-check"></i>
            <span>Monitoring Sentry Aktif: Error Rate 0.02% (Stabil)</span>
          </span>

          <button id="studioTestRollbackBtn" class="ai-btn ai-btn--ghost-danger" data-task-id="${task.id}" title="Simulasi lonjakan error Sentry untuk menguji auto-rollback">
            <i class="fi fi-rr-undo"></i>
            <span>Uji Rollback Darurat</span>
          </button>
        </div>
      `;
    }

    // Stage 5: Perlu Penanganan Manual (Susah / S1)
    if (st === 'Perlu Manual') {
      return `
        <button id="studioOpenHumanFixModalBtn" class="ai-btn ai-btn--warning" data-task-id="${task.id}" title="Buka form mitigasi arsitektur untuk lead developer">
          <i class="fi fi-rr-wrench"></i>
          <span>Selesaikan Manual oleh Lead Developer</span>
        </button>

        <button id="studioForceAiFixBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Paksa pengerjaan dengan agen AI Claude">
          <i class="fi fi-rr-magic-wand"></i>
          <span>Coba Auto-Fix AI</span>
        </button>
      `;
    }

    return '';
  }

  renderPipelineView(tasks) {
    const columns = [
      { id: 'inbound', label: '1. Laporan Masuk', statuses: ['Baru', 'Backlog'], color: '#64748b', tip: 'Sentry Webhook / Log' },
      { id: 'analyzing', label: '2. Dianalisis AI', statuses: ['Dianalisis', 'To Do'], color: '#0284c7', tip: 'Evaluasi AST & Risiko' },
      { id: 'fixing', label: '3. Pengerjaan Fix', statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'], color: '#4f46e5', tip: 'Branch Git & Agen AI' },
      { id: 'review', label: '4. Review PR', statuses: ['Menunggu Persetujuan', 'In Review'], color: '#d97706', tip: 'Persetujuan Manusia' },
      { id: 'qa', label: '5. QA Staging', statuses: ['Disetujui', 'QA/Testing', 'Deploy Staging'], color: '#8b5cf6', tip: 'Verifikasi UAT & Docker' },
      { id: 'prod', label: '6. Rilis & Monitor', statuses: ['Deploy Production', 'Dipantau', 'Selesai'], color: '#059669', tip: 'Sentry 30m Canary Gate' }
    ];

    return `
      <div class="ai-pipeline-grid">
        ${columns.map((col) => {
          const colTasks = tasks.filter(t => col.statuses.includes(t.status));
          return `
            <div class="ai-pipeline-col">
              <div class="ai-pipeline-col-header" style="border-top-color: ${col.color};">
                <div>
                  <span class="ai-pch-title">${col.label}</span>
                  <div style="font-size: 10px; color: #94a3b8; margin-top: 1px;">${col.tip}</div>
                </div>
                <span class="ai-pch-count">${colTasks.length}</span>
              </div>

              <div class="ai-pipeline-cards">
                ${colTasks.length === 0 ? `
                  <div class="ai-pipeline-empty">
                    <i class="fi fi-rr-box-open" style="font-size: 20px; display: block; margin-bottom: 4px; opacity: 0.5;"></i>
                    Tidak ada tiket di tahap ini
                  </div>
                ` : colTasks.map(t => this.renderBugCard(t)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderBugCard(task) {
    const taskCls = this.getTaskClassification(task);
    const isSusah = taskCls.key === 'susah';
    const confidence = task.confidenceScore || (isSusah ? 46 : taskCls.key === 'sedang' ? 84 : 96);
    const meterColor = confidence >= 85 ? '#10b981' : confidence >= 60 ? '#f59e0b' : '#ef4444';
    const isSelected = this.selectedTaskId === task.id;

    return `
      <div class="ai-bug-card ${isSusah ? 'ai-bug-card--critical' : ''}" style="${isSelected ? 'border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);' : ''}" data-task-id="${task.id}" title="Klik untuk memuat ke Studio Triage AI">
        <div class="ai-bc-top">
          <span class="ai-bc-key">${task.key}</span>
          <span class="ai-bc-classification ai-bc-classification--${taskCls.key}">
            ● ${taskCls.label}
          </span>
        </div>

        <h4 class="ai-bc-title">${task.title}</h4>

        <!-- Confidence meter -->
        <div class="ai-bc-meter-wrap">
          <div class="ai-bc-meter-header">
            <span>AI Confidence</span>
            <span style="font-family: var(--font-mono); font-weight: 700; color: ${meterColor};">${confidence}%</span>
          </div>
          <div class="ai-bc-meter-bar">
            <div class="ai-bc-meter-fill" style="width: ${confidence}%; background-color: ${meterColor};"></div>
          </div>
        </div>

        <div class="ai-bc-footer">
          <span class="ai-bc-env">
            <i class="fi fi-rr-cloud" style="font-size: 11px;"></i>
            <span>${task.environment || 'Production'}</span>
          </span>
          <span class="ai-bc-action-link select-studio-btn" data-task-id="${task.id}">Pilih ke Studio ↑</span>
        </div>
      </div>
    `;
  }

  renderListView(tasks) {
    return `
      <div class="ai-table-card">
        <table class="ai-table">
          <thead>
            <tr>
              <th style="width: 100px;">KODE</th>
              <th>JUDUL MASALAH BUG</th>
              <th style="width: 140px;">KLASIFIKASI</th>
              <th style="width: 140px;">STATUS ALUR</th>
              <th style="width: 110px;">LINGKUNGAN</th>
              <th style="width: 120px;">KEYAKINAN AI</th>
              <th style="width: 140px; text-align: right;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.length === 0 ? `
              <tr>
                <td colspan="7" style="padding: 30px; text-align: center; color: #94a3b8; font-style: italic;">
                  Tidak ada data tiket bug yang cocok dengan filter atau kata kunci pencarian.
                </td>
              </tr>
            ` : tasks.map(t => {
              const taskCls = this.getTaskClassification(t);
              const conf = t.confidenceScore || (taskCls.key === 'susah' ? 46 : 94);
              const isSelected = this.selectedTaskId === t.id;
              return `
                <tr style="${isSelected ? 'background-color: #f5f3ff;' : ''}">
                  <td style="font-family: var(--font-mono); font-weight: 700; color: #4f46e5;">${t.key}</td>
                  <td style="font-weight: 600; color: #1e293b;">${t.title}</td>
                  <td>
                    <span class="ai-bc-classification ai-bc-classification--${taskCls.key}">
                      ● ${taskCls.label}
                    </span>
                  </td>
                  <td>
                    <span class="ai-engine-status-pill ai-engine-status-pill--active" style="font-size: 10.5px;">
                      ${t.status}
                    </span>
                  </td>
                  <td>${t.environment || 'Production'}</td>
                  <td style="font-family: var(--font-mono); font-weight: 700; color: ${conf >= 85 ? '#059669' : '#e11d48'};">${conf}%</td>
                  <td style="text-align: right;">
                    <button class="ai-btn ai-btn--secondary ai-btn--sm select-studio-btn" data-task-id="${t.id}" style="margin-right: 4px;">
                      Studio ↑
                    </button>
                    <button class="ai-btn ai-btn--secondary ai-btn--sm inspect-task-btn" data-task-id="${t.id}">
                      Inspector
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderNewBugModal() {
    return `
      <div class="ai-modal-overlay" id="newBugModalOverlay">
        <div class="ai-modal-box" style="max-width: 540px;">
          <div class="ai-modal-header">
            <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">Buat Laporan Bug Baru</h3>
            <button id="closeNewBugModalBtn" class="ai-btn ai-btn--secondary ai-btn--sm" style="padding: 4px 8px;">
              <i class="fi fi-rr-cross"></i>
            </button>
          </div>

          <form id="newBugForm">
            <div class="ai-modal-body" style="gap: 12px; font-size: 12.5px;">
              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Judul Masalah Bug *</label>
                <input id="bugTitleInput" type="text" placeholder="Contoh: TypeError calculateTaxPB1 is undefined" required class="ai-search-input" style="padding-left: 10px;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Klasifikasi Bug *</label>
                  <select id="bugClassificationSelect" class="ai-proj-select" style="width: 100%; height: 32px;">
                    <option value="rendah" selected>🟢 Rendah (Minor / Auto-Fix AI)</option>
                    <option value="sedang">🟡 Sedang (Logika Bisnis / Review PR)</option>
                    <option value="susah">🔴 Susah (Kritis / Deadlock / Manual Dev)</option>
                  </select>
                </div>

                <div>
                  <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Sumber Masalah</label>
                  <select id="bugSourceSelect" class="ai-proj-select" style="width: 100%; height: 32px;">
                    <option value="Sentry Exception">Sentry Exception Alert</option>
                    <option value="Webhook API">Webhook Payment Gateway</option>
                    <option value="Web Portal">Portal Pengguna Live</option>
                    <option value="Manual / QA">Pengujian QA Staging</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Deskripsi Singkat Bug</label>
                <input id="bugDescInput" type="text" placeholder="Jelaskan dampak masalah atau alur yang memicu error..." class="ai-search-input" style="padding-left: 10px;" />
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Stacktrace / Exception Payload (Opsional)</label>
                <textarea id="bugTraceInput" rows="3" placeholder="Tempel stacktrace error atau log exception di sini..." class="ai-orch-textarea"></textarea>
              </div>
            </div>

            <div class="ai-modal-footer">
              <button type="button" id="cancelNewBugBtn" class="ai-btn ai-btn--secondary">Batal</button>
              <button type="submit" class="ai-btn ai-btn--primary">Simpan &amp; Triage AI</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderHumanFixModal(task) {
    const diag = task.diagnosticPackage || {
      suggestedFixes: [
        { option: 'Terapkan deterministik lock ordering (sort resource IDs sebelum query)', tradeOff: 'Mencegah deadlock sirkular secara matematis' },
        { option: 'Gunakan Redis Distributed Mutex (Redlock) dengan TTL 5 detik', tradeOff: 'Performa sangat tinggi namun butuh dependensi Redis' },
        { option: 'Optimistic Concurrency Control dengan version column retry 3x', tradeOff: 'Tidak ada DB lock namun perlu client retry' }
      ]
    };

    return `
      <div class="ai-modal-overlay" id="humanFixModalOverlay">
        <div class="ai-modal-box" style="max-width: 600px;">
          <div class="ai-modal-header">
            <div>
              <span class="ai-bc-key">${task.key}</span>
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">
                Penanganan Manual oleh Lead Developer (Klasifikasi Susah)
              </h3>
            </div>
            <button id="closeHumanFixModalBtn" class="ai-btn ai-btn--secondary ai-btn--sm" style="padding: 4px 8px;">
              <i class="fi fi-rr-cross"></i>
            </button>
          </div>

          <form id="humanFixForm">
            <div class="ai-modal-body" style="gap: 12px; font-size: 12px;">
              <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 14px; color: #9f1239;">
                <strong>Safety Guardrail Terpenuhi:</strong>
                <p style="margin: 2px 0 0 0; line-height: 1.4;">Bug ini tergolong klasifikasi Susah karena menyentuh transaksi database tingkat lanjut. Pilih strategi mitigasi arsitektur di bawah untuk diterapkan ke branch staging.</p>
              </div>

              <div>
                <label style="font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">Pilih Opsi Mitigasi Arsitektur:</label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${diag.suggestedFixes.map((f, i) => `
                    <label style="display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; background: #ffffff;">
                      <input type="radio" name="mitigationOption" value="${this.escapeHtml(f.option)}" ${i === 0 ? 'checked' : ''} style="margin-top: 3px;" />
                      <div>
                        <strong style="color: #0f172a; display: block;">${f.option}</strong>
                        <span style="color: #64748b; font-size: 11px;">Trade-off: ${f.tradeOff}</span>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Catatan Lead Developer &amp; Hash Commit</label>
                <textarea id="humanFixNotes" rows="2" class="ai-orch-textarea" placeholder="Tuliskan catatan teknis review dan pengujian..."></textarea>
              </div>
            </div>

            <div class="ai-modal-footer">
              <button type="button" id="cancelHumanFixBtn" class="ai-btn ai-btn--secondary">Batal</button>
              <button type="submit" class="ai-btn ai-btn--success">
                <i class="fi fi-rr-check"></i>
                <span>Terapkan Solusi &amp; Rilis ke Staging</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderInspectorModal(task) {
    const taskCls = this.getTaskClassification(task);

    return `
      <div class="ai-modal-overlay" id="inspectorModalOverlay">
        <div class="ai-modal-box">
          <!-- Modal Header -->
          <div class="ai-modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                <span class="ai-bc-key" style="font-size: 11.5px; padding: 2px 7px;">${task.key}</span>
                <span class="ai-bc-classification ai-bc-classification--${taskCls.key}">
                  ● Klasifikasi: ${taskCls.label}
                </span>
                <span style="font-size: 11.5px; color: #64748b;">· ${task.environment || 'Production'} · ${task.warrantyStatus || 'Garansi Bebas Bug'}</span>
              </div>
              <h2 style="font-size: 15.5px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.3;">
                ${task.title}
              </h2>
            </div>

            <button id="closeInspectorBtn" class="ai-btn ai-btn--secondary ai-btn--sm" style="padding: 6px; border-radius: 9999px;">
              <i class="fi fi-rr-cross" style="font-size: 12px;"></i>
            </button>
          </div>

          <!-- Inspector Tabs -->
          <div class="ai-insp-tabs">
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'overview' ? 'ai-insp-tab-btn--active' : ''}" data-tab="overview">
              <i class="fi fi-rr-document"></i> 1. Overview &amp; Spec
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'solution' ? 'ai-insp-tab-btn--active' : ''}" data-tab="solution">
              <i class="fi fi-rr-code-compare"></i> 2. Solution Diff
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'qa_signoff' ? 'ai-insp-tab-btn--active' : ''}" data-tab="qa_signoff">
              <i class="fi fi-rr-badge-check"></i> 3. QA Sign-Off
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'telemetry' ? 'ai-insp-tab-btn--active' : ''}" data-tab="telemetry">
              <i class="fi fi-rr-dashboard"></i> 4. Telemetri &amp; Guard
            </button>
          </div>

          <!-- Modal Body -->
          <div class="ai-modal-body">
            ${this.renderInspectorTabContent(task)}
          </div>

          <!-- Modal Footer -->
          <div class="ai-modal-footer">
            <button id="closeInspectorFooterBtn" class="ai-btn ai-btn--secondary">Tutup</button>
            <button id="selectToStudioFromModalBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}">
              <i class="fi fi-rr-cpu"></i>
              <span>Buka di Studio AI</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderInspectorTabContent(task) {
    if (this.inspectorTab === 'overview') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12.5px;">
          <div style="background: #f8fafc; border-radius: 8px; padding: 12px 14px; border: 1px solid #e2e8f0; line-height: 1.5; color: #334155;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Deskripsi Bug:</strong>
            ${task.description || 'Tidak ada deskripsi rinci.'}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="padding: 10px 12px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;">
              <strong>Hasil Diharapkan:</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">Sistem memproses request normal tanpa error atau deadlock.</p>
            </div>
            <div style="padding: 10px 12px; border-radius: 8px; background: #fff1f2; border: 1px solid #fecdd3; color: #be123c;">
              <strong>Hasil Aktual (Error):</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">Terjadi exception runtime yang mengganggu alur pengguna.</p>
            </div>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'solution') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="ai-decision-diff-viewer">
            <pre>${task.prDiff || '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -10,3 +10,5 @@\n+ // Automated fix by Claude Agent\n+ if (!input) return null;'}</pre>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'qa_signoff') {
      const isPassed = task.qaSignOff?.status === 'Passed' || task.status === 'Disetujui' || task.status === 'Selesai';
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12.5px;">
          <div style="padding: 14px 16px; border-radius: 8px; background: #faf5ff; border: 1px solid #e9d5ff; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #581c87; display: block;">Status Verifikasi Staging QA:</strong>
              <span style="font-size: 11px; color: #7e22ce;">Uji regresi automated &amp; manual UAT</span>
            </div>
            <span style="font-weight: 700; color: ${isPassed ? '#059669' : '#d97706'}; font-size: 13px;">
              ${isPassed ? '✓ Lulus QA Sign-Off' : 'Menunggu Pengujian'}
            </span>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'telemetry') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12.5px;">
          <div style="padding: 14px 16px; border-radius: 8px; background: #fffbeb; border: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #92400e; display: block;">Telemetri Sentry Canary (30 Menit):</strong>
              <span style="font-size: 11px; color: #b45309;">Pemantauan error spike real-time pasca deploy</span>
            </div>
            <span style="font-family: var(--font-mono); font-weight: 700; color: #047857; font-size: 14px;">0.02% Error Rate (Stabil)</span>
          </div>
        </div>
      `;
    }

    return '';
  }

  attachEvents() {
    this.element.addEventListener('click', async (e) => {
      // Toggle Kill-Switch
      if (e.target.closest('#toggleKillSwitchBtn')) {
        const activeProj = store.getActiveProject();
        if (activeProj) {
          store.toggleKillSwitch(activeProj.id);
        }
      }

      // Quick Simulate Bug (cycles between Rendah, Sedang, Susah)
      if (e.target.closest('#quickSimulateBugBtn') || e.target.closest('#studioSimulateBtn')) {
        const activeProj = store.getActiveProject();
        if (activeProj) {
          const simTypes = ['kecil', 'menengah', 'besar'];
          const simNames = ['Rendah', 'Sedang', 'Susah'];
          const idx = (this.simulationIndex || 0) % 3;
          this.simulationIndex = idx + 1;

          const newTask = store.createSimulatedBug(activeProj.id, simTypes[idx]);
          if (newTask) {
            this.selectedTaskId = newTask.id;
            this.render();
            store.addToast('info', `Simulasi Kasus ${simNames[idx]}`, `Kasus tingkat kesulitan ${simNames[idx]} berhasil disuntikkan.`);
          }
        }
      }

      // Open New Bug modal
      if (e.target.closest('#openNewBugModalBtn') || e.target.closest('#studioCreateBtn')) {
        this.showNewBugModal = true;
        this.render();
      }

      // Close new bug modal
      if (e.target.closest('#closeNewBugModalBtn') || e.target.closest('#cancelNewBugBtn') || e.target.id === 'newBugModalOverlay') {
        this.showNewBugModal = false;
        this.render();
      }

      // Close human fix modal
      if (e.target.closest('#closeHumanFixModalBtn') || e.target.closest('#cancelHumanFixBtn') || e.target.id === 'humanFixModalOverlay') {
        this.showHumanFixModal = false;
        this.render();
      }

      // Top Workflow Stepper Cards (Filter by Stage)
      const wfCard = e.target.closest('.ai-wf-card');
      if (wfCard && wfCard.dataset.step) {
        const stepNum = parseInt(wfCard.dataset.step, 10);
        this.workflowStepFilter = this.workflowStepFilter === stepNum ? null : stepNum;
        this.categoryFilter = 'all';
        this.render();
      }

      // Category / Classification Filter Pills
      const catBtn = e.target.closest('.ai-filter-pill');
      if (catBtn && catBtn.dataset.cat) {
        this.categoryFilter = catBtn.dataset.cat;
        this.workflowStepFilter = null;
        this.render();
      }

      // View Mode Toggle (Pipeline vs List)
      if (e.target.closest('#viewPipelineBtn')) {
        this.viewMode = 'pipeline';
        this.render();
      }
      if (e.target.closest('#viewListBtn')) {
        this.viewMode = 'list';
        this.render();
      }

      // Studio Tabs (Diff / Tests / Git)
      const sTab = e.target.closest('.ai-studio-tab-btn');
      if (sTab && sTab.dataset.tab) {
        this.activeStudioTab = sTab.dataset.tab;
        this.render();
      }

      // Quick Preset Keys (POS-104 vs POS-108)
      const pKeyBtn = e.target.closest('.ai-preset-btn');
      if (pKeyBtn && pKeyBtn.dataset.presetKey) {
        const key = pKeyBtn.dataset.presetKey;
        const task = store.getState().tasks.find(t => t.key === key);
        if (task) {
          this.selectedTaskId = task.id;
          this.render();
        }
      }

      // Select bug into Studio from card or list
      const selectBtn = e.target.closest('.select-studio-btn') || e.target.closest('.ai-bug-card');
      if (selectBtn && selectBtn.dataset.taskId) {
        this.selectedTaskId = selectBtn.dataset.taskId;
        this.render();
        const studioEl = this.element.querySelector('#aiStudioWorkbench');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      // Open Task Detail from Studio
      if (e.target.closest('#studioOpenTaskDetailBtn')) {
        const tId = e.target.closest('#studioOpenTaskDetailBtn').dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          store.openTaskDetail(task);
        }
      }

      // Open Inspector Modal
      const inspectBtn = e.target.closest('.inspect-task-btn');
      if (inspectBtn && inspectBtn.dataset.taskId) {
        const task = store.getState().tasks.find(t => t.id === inspectBtn.dataset.taskId);
        if (task) {
          this.inspectedTask = task;
          this.inspectorTab = 'overview';
          this.render();
        }
      }

      // Select to Studio from Modal
      if (e.target.closest('#selectToStudioFromModalBtn')) {
        const tId = e.target.closest('#selectToStudioFromModalBtn').dataset.taskId;
        this.selectedTaskId = tId;
        this.inspectedTask = null;
        this.render();
      }

      // Close Inspector Modal
      if (e.target.closest('#closeInspectorBtn') || e.target.closest('#closeInspectorFooterBtn') || e.target.id === 'inspectorModalOverlay') {
        this.inspectedTask = null;
        this.render();
      }

      // Inspector Tabs
      const inspTab = e.target.closest('.ai-insp-tab-btn');
      if (inspTab && inspTab.dataset.tab) {
        this.inspectorTab = inspTab.dataset.tab;
        this.render();
      }

      // -----------------------------------------------------------------
      // END-TO-END WORKFLOW ACTION CONTROLS
      // -----------------------------------------------------------------

      // Action 1: Jalankan Auto-Fix AI
      if (e.target.closest('#studioRunAiFixBtn') || e.target.closest('#studioForceAiFixBtn')) {
        const btn = e.target.closest('#studioRunAiFixBtn') || e.target.closest('#studioForceAiFixBtn');
        const taskId = btn.dataset.taskId;
        if (taskId) {
          this.isProcessingAiFix = true;
          this.render();
          try {
            await store.runAiFixer(taskId);
          } finally {
            this.isProcessingAiFix = false;
            this.activeStudioTab = 'diff';
            this.render();
          }
        }
      }

      // Action 2: Setujui PR & Merge ke Staging
      if (e.target.closest('#studioApprovePrBtn')) {
        const taskId = e.target.closest('#studioApprovePrBtn').dataset.taskId;
        if (taskId) {
          store.approveAiPr(taskId);
          store.deployToStaging(taskId);
          this.render();
        }
      }

      // Action 3: Minta Revisi ke Agen AI
      if (e.target.closest('#studioRequestRevisionBtn')) {
        const taskId = e.target.closest('#studioRequestRevisionBtn').dataset.taskId;
        if (taskId) {
          store.requestAiRevision(taskId, 'Optimasi validasi tipe dan null-safety handling');
          this.render();
        }
      }

      // Action 4: Alihkan ke Manual Dev
      if (e.target.closest('#studioEscalateManualBtn')) {
        const taskId = e.target.closest('#studioEscalateManualBtn').dataset.taskId;
        if (taskId) {
          store.updateTask(taskId, {
            status: 'Perlu Manual',
            priority: 'Hotfix'
          });
          store.addToast('info', 'Dialihkan ke Manual Dev', 'Tiket diserahkan ke antrean penanganan developer manusia.');
          this.render();
        }
      }

      // Action 5: Buka Modal Solusi Manual
      if (e.target.closest('#studioOpenHumanFixModalBtn')) {
        this.showHumanFixModal = true;
        this.render();
      }

      // Action 6: Deploy ke Production
      if (e.target.closest('#studioDeployProdBtn')) {
        const taskId = e.target.closest('#studioDeployProdBtn').dataset.taskId;
        if (taskId) {
          store.deployToProduction(taskId, true);
          this.render();
        }
      }

      // Action 7: Beri QA Sign-Off
      if (e.target.closest('#studioQaSignOffBtn')) {
        const taskId = e.target.closest('#studioQaSignOffBtn').dataset.taskId;
        if (taskId) {
          store.qaSignOff(taskId, {
            passed: true,
            notes: 'Verifikasi staging cluster lolos smoke & regression test.',
            testCasesCount: 6,
            passedCasesCount: 6
          });
          this.render();
        }
      }

      // Action 8: Uji Rollback Darurat
      if (e.target.closest('#studioTestRollbackBtn')) {
        const taskId = e.target.closest('#studioTestRollbackBtn').dataset.taskId;
        if (taskId) {
          store.triggerRollback(taskId, 'Lonjakan Error 500 Sentry Telemetry (> 2%)');
          this.render();
        }
      }
    });

    // Task Selector Dropdown inside Studio
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'studioTaskSelector') {
        this.selectedTaskId = e.target.value;
        this.render();
      }

      if (e.target.id === 'aiProjectSwitcher') {
        store.setSelectedProjectId(e.target.value);
        this.selectedTaskId = null; // reset to first bug of new project
      }
    });

    // Real-time Search Input Listener
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'aiBugSearchInput') {
        this.searchQuery = e.target.value;
        this.render();
        const searchInput = this.element.querySelector('#aiBugSearchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      }
    });

    // Submit New Bug Form
    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'newBugForm') {
        e.preventDefault();
        const activeProj = store.getActiveProject();
        const title = this.element.querySelector('#bugTitleInput')?.value || '';
        const classification = this.element.querySelector('#bugClassificationSelect')?.value || 'rendah';
        const source = this.element.querySelector('#bugSourceSelect')?.value || 'Sentry Exception';
        const desc = this.element.querySelector('#bugDescInput')?.value || '';
        const trace = this.element.querySelector('#bugTraceInput')?.value || '';

        const difficulty = classification === 'susah' ? 'Hard' : classification === 'sedang' ? 'Medium' : 'Low';
        const severity = classification === 'susah' ? 'S1 - Critical (Blocker)' : classification === 'sedang' ? 'S2 - Major' : 'S3 - Minor';
        const priority = classification === 'susah' ? 'Hotfix' : classification === 'sedang' ? 'Tinggi' : 'Sedang';
        const confidenceScore = classification === 'susah' ? 46 : classification === 'sedang' ? 84 : 96;

        if (title.trim()) {
          const newTask = store.createTask({
            title: title.trim(),
            description: desc.trim() || title.trim(),
            type: 'Bug',
            priority,
            difficulty,
            severity,
            source,
            status: 'Baru',
            environment: 'Production',
            warrantyStatus: 'Garansi Proyek Bebas Bug Rp0',
            confidenceScore,
            diagnosticPackage: trace.trim() ? {
              summary: desc.trim() || title.trim(),
              sentryBreadcrumbs: [trace.trim()],
              affectedFiles: [{ path: 'src/services/appService.ts', lineRange: 'L10-L40' }]
            } : null
          });

          this.showNewBugModal = false;
          if (newTask) {
            this.selectedTaskId = newTask.id;
          }
          this.render();
          store.addToast('success', 'Laporan Bug Dibuat', `Tiket baru ${title} (${classification.toUpperCase()}) berhasil dicatat.`);
        }
      }

      // Submit Human Fix Form
      if (e.target.id === 'humanFixForm') {
        e.preventDefault();
        const mitigation = this.element.querySelector('input[name="mitigationOption"]:checked')?.value || 'Deterministik Lock Ordering';
        const notes = this.element.querySelector('#humanFixNotes')?.value || 'Solusi arsitektur diterapkan manual oleh Lead Developer';

        if (this.selectedTaskId) {
          store.submitHumanFix(this.selectedTaskId, {
            mitigationOption: mitigation,
            devNotes: notes,
            timeSpentHours: 4,
            advanceToQa: true
          });
          this.showHumanFixModal = false;
          this.render();
        }
      }
    });
  }

  attachDynamicListeners() {}

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
