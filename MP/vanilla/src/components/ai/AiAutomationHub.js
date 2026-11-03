/**
 * AiAutomationHub Component (100% Native Vanilla JS ES Module)
 * 
 * Standar Arsitektur Otomasi DevOps & AI Ops Enterprise:
 * 1. Top ERP Breadcrumb & Control Bar (Engine Status, Kill-Switch, Project Switcher, Shortcut Service Desk)
 * 2. 4 Executive Automation Scorecards (Status Engine, Auto-Fix Passing Rate, Antrean Triage, Efisiensi Jam Kerja)
 * 3. 5-Stage Interactive Workflow Stepper (Deteksi & Ingest -> Triage AST -> Patch & Unit Test -> Review Staging -> Rilis Prod)
 * 4. Live AI Fix Studio / Workbench (Split-Screen 40% / 60% Proportional Layout):
 *    - Kiri (40%): Konteks Insiden, Stacktrace, Analisis Akar Masalah (Root Cause), dan Safety Guardrails.
 *    - Kanan (60%): Solusi AI (Diff Viewer, Unit Tests 5/5 Passing, Git Branch & PR, Telemetri Sentry),
 *      serta Action Cluster Bar kontekstual 1-klik yang sangat efisien.
 * 5. Toolbar Filter & Dual-View Switcher:
 *    - Pipeline Kanban (6 Tahap Otomasi) & Tabel Detail dengan filter klasifikasi (Rendah, Sedang, Susah, Review PR).
 * 6. Modals Terpadu:
 *    - Inspector Deep-Dive Modal (4 Tab Analisis)
 *    - Buat Laporan Bug Baru Modal
 *    - Resolusi Manual Lead Developer Modal (Kasus Kritis/Deadlock)
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
    this.workflowStepFilter = null; // null | 1 | 2 | 3 | 4 | 5
    this.searchQuery = '';

    // Active task in Live AI Studio Workbench
    this.selectedTaskId = null;
    this.activeStudioTab = 'diff'; // 'diff' | 'tests' | 'git' | 'telemetry'
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
    if (!task) return { key: 'rendah', label: 'Rendah', desc: 'Auto-Fix AI Penuh' };
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
    if (bugTasks.length > 0) {
      this.selectedTaskId = bugTasks[0].id;
      return bugTasks[0];
    }
    return null;
  }

  render() {
    const state = store.getState();
    const activeProj = store.getActiveProject() || state.projects[0] || {};
    const allProjTasks = store.getProjectTasks();
    const bugTasks = allProjTasks.filter(t => (t.type || '').toLowerCase() === 'bug');

    // Klasifikasi Tingkat Kesulitan: Rendah, Sedang, Susah
    const rendahBugs = bugTasks.filter(t => this.getTaskClassification(t).key === 'rendah');
    const sedangBugs = bugTasks.filter(t => this.getTaskClassification(t).key === 'sedang');
    const susahBugs = bugTasks.filter(t => this.getTaskClassification(t).key === 'susah');

    const prReviewBugs = bugTasks.filter(t => t.status === 'Menunggu Persetujuan' || t.status === 'In Review');
    const manualBugs = bugTasks.filter(t => t.status === 'Perlu Manual');
    const monitoredBugs = bugTasks.filter(t => t.status === 'Deploy Production' || t.status === 'Dipantau' || t.status === 'Selesai');

    // 5 Tahap Alur Kerja Otomasi
    const stage1Count = bugTasks.filter(t => ['Baru', 'Backlog'].includes(t.status)).length;
    const stage2Count = bugTasks.filter(t => ['Dianalisis', 'To Do'].includes(t.status)).length;
    const stage3Count = bugTasks.filter(t => ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'].includes(t.status)).length;
    const stage4Count = bugTasks.filter(t => ['Menunggu Persetujuan', 'In Review', 'Disetujui', 'QA/Testing', 'Deploy Staging'].includes(t.status)).length;
    const stage5Count = bugTasks.filter(t => ['Deploy Production', 'Dipantau', 'Selesai'].includes(t.status)).length;

    // Filter display tasks
    let displayTasks = bugTasks;

    if (this.workflowStepFilter === 1) {
      displayTasks = displayTasks.filter(t => ['Baru', 'Backlog'].includes(t.status));
    } else if (this.workflowStepFilter === 2) {
      displayTasks = displayTasks.filter(t => ['Dianalisis', 'To Do'].includes(t.status));
    } else if (this.workflowStepFilter === 3) {
      displayTasks = displayTasks.filter(t => ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'].includes(t.status));
    } else if (this.workflowStepFilter === 4) {
      displayTasks = displayTasks.filter(t => ['Menunggu Persetujuan', 'In Review', 'Disetujui', 'QA/Testing', 'Deploy Staging'].includes(t.status));
    } else if (this.workflowStepFilter === 5) {
      displayTasks = displayTasks.filter(t => ['Deploy Production', 'Dipantau', 'Selesai'].includes(t.status));
    }

    // Filter by Category
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
      displayTasks = displayTasks.filter(t => ['Deploy Production', 'Dipantau', 'Selesai'].includes(t.status));
    }

    // Filter by Search Query
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

    const activeBug = this.getSelectedTask(bugTasks);

    this.element.innerHTML = `
      <!-- ========================================================
           1. TOP BREADCRUMB STRIP
           ======================================================== -->
      <div class="ai-header-breadcrumb">
        <div class="ai-breadcrumb-left">
          <span class="ai-breadcrumb-item">ASTACODE ERP</span>
          <span class="ai-breadcrumb-sep">/</span>
          <span class="ai-breadcrumb-item">${activeProj.name || 'Proyek'}</span>
          <span class="ai-breadcrumb-sep">/</span>
          <span class="ai-breadcrumb-item">Pengembangan &amp; AI</span>
          <span class="ai-breadcrumb-sep">/</span>
          <span class="ai-breadcrumb-current">Otomasi Fix Bug AI</span>
        </div>
        <div class="ai-breadcrumb-right">
          <span class="ai-header-engine-tag" title="Engine AI Aktif">
            ${Icons.sparkles ? Icons.sparkles('', 13) : Icons.cpu('', 13)}
            <span>Gemini 2.5 Pro &amp; Claude 3.5 Sonnet Hybrid Orchestrator</span>
          </span>
        </div>
      </div>

      <!-- ========================================================
           2. MAIN HEADER & CONTROL BAR
           ======================================================== -->
      <div class="ai-header-bar">
        <div class="ai-header-left">
          <div class="ai-icon-box" title="Otomasi Fix Bug AI Hub">
            ${Icons.cpu('', 20)}
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
          <!-- Button 1: Simulasi Kasus Bug -->
          <button id="quickSimulateBugBtn" class="ai-btn ai-btn--secondary" title="Suntikkan contoh insiden bug untuk simulasi alur kerja">
            ${Icons.zap('', 13)}
            <span>Simulasi Kasus Bug</span>
          </button>

          <!-- Button 2: Buat Laporan Bug -->
          <button id="openNewBugModalBtn" class="ai-btn ai-btn--primary" title="Catat laporan bug baru ke antrean otomasi">
            ${Icons.plus('', 13)}
            <span>Buat Laporan Bug</span>
          </button>

          <!-- Button 3: Ke Service Desk Klien -->
          <button id="goToServiceDeskBtn" class="ai-btn ai-btn--secondary" style="background: #f0fdf4; border-color: #bbf7d0; color: #166534;" title="Buka Modul Service Desk / Klien">
            ${Icons.telegram('', 13)}
            <span>Ke Service Desk</span>
          </button>

          <!-- Button 4: Kill-Switch Darurat -->
          <button id="toggleKillSwitchBtn" class="ai-btn ${activeProj.killSwitchActive ? 'ai-btn--killswitch-off' : 'ai-btn--killswitch-on'}" title="Hentikan sementara atau aktifkan kembali otomasi AI untuk proyek ini">
            ${Icons.power('', 13)}
            <span>${activeProj.killSwitchActive ? 'Resume AI' : 'Kill-Switch'}</span>
          </button>
        </div>
      </div>

      <!-- ========================================================
           3. MAIN CONTENT BODY (CLEAN PROPORTIONAL LAYOUT)
           ======================================================== -->
      <div class="ai-hub-body" style="padding: 18px 24px; display: flex; flex-direction: column; gap: 16px;">

        <!-- ========================================================
             A. 4 EXECUTIVE AUTOMATION KPI SCORECARDS
             ======================================================== -->
        <div class="ai-kpi-grid">
          
          <!-- KPI 1: Status Engine AI -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Status Engine AI</span>
              <div class="ai-kpi-icon-badge ai-kpi-icon-badge--indigo">
                ${Icons.cpu('', 14)}
              </div>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value" style="color: ${activeProj.killSwitchActive ? '#e11d48' : '#4f46e5'};">
                ${activeProj.killSwitchActive ? 'Ditahan' : 'Siaga'}
              </span>
              <span class="ai-kpi-subtext">Gemini &amp; Claude 3.5</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ${activeProj.killSwitchActive ? 'ai-kpi-status-tag--danger' : 'ai-kpi-status-tag--success'}">
                ${activeProj.killSwitchActive ? '● Kill-Switch Aktif' : '● Uptime 99.9% Siaga'}
              </span>
              <span style="color: #64748b;">Webhook Live</span>
            </div>
          </div>

          <!-- KPI 2: Patch Success Rate -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Patch Success Rate</span>
              <div class="ai-kpi-icon-badge ai-kpi-icon-badge--emerald">
                ${Icons.shieldCheck('', 14)}
              </div>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value" style="color: #059669;">94.6%</span>
              <span class="ai-kpi-subtext">Test Suite Lolos</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ai-kpi-status-tag--success">
                Rata-rata 2m 14s / Patch
              </span>
              <span style="color: #64748b;">5/5 Unit Test</span>
            </div>
          </div>

          <!-- KPI 3: Antrean Bug Proyek -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Antrean Bug Aktif</span>
              <div class="ai-kpi-icon-badge ai-kpi-icon-badge--amber">
                ${Icons.listTodo('', 14)}
              </div>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value">${bugTasks.length} Tiket</span>
              <span class="ai-kpi-subtext">${prReviewBugs.length} Siap Review PR</span>
            </div>
            <div class="ai-kpi-footer">
              <span style="color: #64748b;">
                <strong style="color: #10b981;">${rendahBugs.length}</strong> Low · <strong style="color: #f59e0b;">${sedangBugs.length}</strong> Med · <strong style="color: #ef4444;">${susahBugs.length}</strong> Hard
              </span>
            </div>
          </div>

          <!-- KPI 4: Efisiensi Jam Developer -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Efisiensi Developer</span>
              <div class="ai-kpi-icon-badge ai-kpi-icon-badge--blue">
                ${Icons.clock('', 14)}
              </div>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value" style="color: #0284c7;">~42 Jam</span>
              <span class="ai-kpi-subtext">Dihemat Bulan Ini</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ai-kpi-status-tag--success">
                Garansi Bebas Bug Rp0
              </span>
              <span style="color: #64748b;">Zero Downtime</span>
            </div>
          </div>

        </div>

        <!-- ========================================================
             B. END-TO-END WORKFLOW STEPPER (5 TAHAP OTOMASI PROPORSI)
             ======================================================== -->
        <div class="ai-workflow-stepper">
          <!-- Step 1: Deteksi & Ingest -->
          <div class="ai-wf-card ${this.workflowStepFilter === 1 ? 'ai-wf-card--active' : ''}" data-step="1" title="Klik untuk memfilter Tahap 1: Laporan Masuk">
            <div class="ai-wf-card__step-num">1</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">1. Deteksi &amp; Ingest</span>
                <span class="ai-wf-card__badge">${stage1Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Sentry &amp; Telegram Bot</span>
            </div>
          </div>

          <!-- Step 2: Diagnostik AST & Triage AI -->
          <div class="ai-wf-card ${this.workflowStepFilter === 2 ? 'ai-wf-card--active' : ''}" data-step="2" title="Klik untuk memfilter Tahap 2: Triage & AST">
            <div class="ai-wf-card__step-num">2</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">2. Diagnostik &amp; Triage AI</span>
                <span class="ai-wf-card__badge">${stage2Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">AST Parser &amp; Klasifikasi</span>
            </div>
          </div>

          <!-- Step 3: Sintesis Patch & Unit Test -->
          <div class="ai-wf-card ${this.workflowStepFilter === 3 ? 'ai-wf-card--active' : ''}" data-step="3" title="Klik untuk memfilter Tahap 3: Patch & Test">
            <div class="ai-wf-card__step-num">3</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">3. Patch &amp; Unit Test</span>
                <span class="ai-wf-card__badge">${stage3Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Git Branch &amp; 5/5 Passing</span>
            </div>
          </div>

          <!-- Step 4: Review Manusia & Rilis Staging -->
          <div class="ai-wf-card ${this.workflowStepFilter === 4 ? 'ai-wf-card--active' : ''}" data-step="4" title="Klik untuk memfilter Tahap 4: Review & Staging">
            <div class="ai-wf-card__step-num">4</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">4. Review &amp; Staging Gate</span>
                <span class="ai-wf-card__badge">${stage4Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Persetujuan PR &amp; UAT Docker</span>
            </div>
          </div>

          <!-- Step 5: Rilis & Monitoring Produksi -->
          <div class="ai-wf-card ${this.workflowStepFilter === 5 ? 'ai-wf-card--active' : ''}" data-step="5" title="Klik untuk memfilter Tahap 5: Rilis & Canary">
            <div class="ai-wf-card__step-num">5</div>
            <div class="ai-wf-card__content">
              <div class="ai-wf-card__title-row">
                <span class="ai-wf-card__title">5. Rilis &amp; Monitoring</span>
                <span class="ai-wf-card__badge">${stage5Count} Tiket</span>
              </div>
              <span class="ai-wf-card__subtitle">Canary Sentry 30m Gate</span>
            </div>
          </div>
        </div>

        <!-- ========================================================
             C. LIVE AI FIX WORKBENCH / STUDIO (40% / 60%)
             ======================================================== -->
        ${this.renderStudioWorkbench(activeBug, bugTasks)}

        <!-- ========================================================
             D. TOOLBAR: SEARCH, KLASIFIKASI & VIEW SWITCHER
             ======================================================== -->
        <div class="ai-toolbar">
          <div class="ai-toolbar-left">
            <!-- Search Box -->
            <div class="ai-search-box">
              <span class="ai-search-icon">${Icons.search('', 13)}</span>
              <input type="text" id="aiBugSearchInput" class="ai-search-input" placeholder="Cari kode tiket, judul, error, klasifikasi..." value="${this.searchQuery}" />
            </div>

            <!-- Category & Classification Filter Pills -->
            <div class="ai-filter-pills">
              <button class="ai-filter-pill ${this.categoryFilter === 'all' && !this.workflowStepFilter ? 'ai-filter-pill--active' : ''}" data-cat="all">
                Semua (${bugTasks.length})
              </button>

              <button class="ai-filter-pill ${this.categoryFilter === 'rendah' ? 'ai-filter-pill--active' : ''}" data-cat="rendah" title="Bug minor/tampilan: Auto-Fix AI Penuh">
                <span class="ai-pill-dot" style="background: #10b981;"></span>
                <span>Rendah (${rendahBugs.length})</span>
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'sedang' ? 'ai-filter-pill--active' : ''}" data-cat="sedang" title="Bug alur bisnis & validasi: Auto-Fix + Review PR">
                <span class="ai-pill-dot" style="background: #f59e0b;"></span>
                <span>Sedang (${sedangBugs.length})</span>
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'susah' ? 'ai-filter-pill--active' : ''}" data-cat="susah" title="Bug kritis/deadlock: Guardrail Eskalasi Lead Dev">
                <span class="ai-pill-dot" style="background: #ef4444;"></span>
                <span>Susah (${susahBugs.length})</span>
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'pr_review' ? 'ai-filter-pill--active' : ''}" data-cat="pr_review">
                Menunggu Review PR (${prReviewBugs.length})
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'manual' ? 'ai-filter-pill--active' : ''}" data-cat="manual">
                Perlu Manual Dev (${manualBugs.length})
              </button>
              <button class="ai-filter-pill ${this.categoryFilter === 'monitoring' ? 'ai-filter-pill--active' : ''}" data-cat="monitoring">
                Staging &amp; Monitoring (${monitoredBugs.length})
              </button>
            </div>
          </div>

          <!-- View Mode Toggle -->
          <div class="ai-view-switcher">
            <button id="viewPipelineBtn" class="ai-view-btn ${this.viewMode === 'pipeline' ? 'ai-view-btn--active' : ''}">
              ${Icons.kanban('', 13)}
              <span>Pipeline Kanban (6 Tahap)</span>
            </button>
            <button id="viewListBtn" class="ai-view-btn ${this.viewMode === 'list' ? 'ai-view-btn--active' : ''}">
              ${Icons.listTodo('', 13)}
              <span>Tabel Detail</span>
            </button>
          </div>
        </div>

        <!-- ========================================================
             E. PIPELINE KANBAN (6 TAHAPAN) VS TABEL DETAIL
             ======================================================== -->
        ${this.viewMode === 'pipeline' ? this.renderPipelineView(displayTasks) : this.renderListView(displayTasks)}

      </div>

      <!-- Modals -->
      ${this.inspectedTask ? this.renderInspectorModal(this.inspectedTask) : ''}
      ${this.showNewBugModal ? this.renderNewBugModal() : ''}
      ${this.showHumanFixModal && activeBug ? this.renderHumanFixModal(activeBug) : ''}
    `;

    this.attachDynamicListeners();
  }

  renderStudioWorkbench(task, allBugs) {
    if (!task) {
      return `
        <div class="ai-studio-card">
          <div style="padding: 40px 20px; text-align: center; color: #64748b;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #94a3b8;">
              ${Icons.inbox ? Icons.inbox('', 24) : Icons.listTodo('', 24)}
            </div>
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 15px;">Belum Ada Tiket Bug pada Proyek Ini</h3>
            <p style="margin: 0 0 14px 0; font-size: 12.5px;">Klik tombol di bawah untuk menyuntikkan contoh insiden simulasi atau membuat laporan bug baru.</p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button id="studioSimulateBtn" class="ai-btn ai-btn--secondary">
                ${Icons.zap('', 13)} Simulasi Kasus Bug
              </button>
              <button id="studioCreateBtn" class="ai-btn ai-btn--primary">
                ${Icons.plus('', 13)} Buat Laporan Bug
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
    let codeTargetFile = 'src/services/appService.ts:45';
    let codeSnippet = 'TypeError: Cannot read properties of undefined at processTransaction (appService.ts:45:12)';
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
              <span style="color: #4f46e5;">${Icons.cpu('', 18)}</span>
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
              <span style="font-size: 11px; color: #64748b; font-weight: 600;">Contoh Skenario:</span>
              <button class="ai-preset-btn ${task.key === 'POS-104' ? 'ai-preset-btn--active' : ''}" data-preset-key="POS-104" title="Kasus Klasifikasi Rendah: Auto-Fix Penuh AI">
                ⚡ Kasus Rendah (Auto-Fix AI)
              </button>
              <button class="ai-preset-btn ${task.key === 'POS-108' ? 'ai-preset-btn--active' : ''}" data-preset-key="POS-108" title="Kasus Klasifikasi Susah: Guardrail Manual Dev">
                🛡️ Kasus Susah (Manual Dev)
              </button>
            </div>

            <!-- Full Detail Link -->
            <button id="studioOpenTaskDetailBtn" class="ai-btn ai-btn--secondary ai-btn--sm" data-task-id="${task.id}" title="Buka drawer detail tiket lengkap">
              ${Icons.arrowUpRight ? Icons.arrowUpRight('', 12) : Icons.externalLink('', 12)}
              <span>Detail Tiket</span>
            </button>
          </div>
        </div>

        <!-- Studio Split Canvas (40% Konteks vs 60% Solusi & Aksi) -->
        <div class="ai-studio-split">

          <!-- ==============================================
               KOLOM KIRI (40%): KONTEKS INSIDEN & DIAGNOSTIK
               ============================================== -->
          <div class="ai-studio-left">
            <!-- Context Header Box -->
            <div class="ai-ctx-card">
              <div class="ai-ctx-header">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <span class="ai-bc-key">${task.key}</span>
                  <span class="ai-bc-classification ai-bc-classification--${taskCls.key}">
                    ● ${taskCls.label} (${taskCls.desc})
                  </span>
                  <span class="ai-engine-status-pill ai-engine-status-pill--active" style="font-size: 10px;">
                    ${task.status}
                  </span>
                </div>
                <span style="font-size: 11px; color: #64748b; font-weight: 600;">
                  SLA: <strong style="color: ${isSusah ? '#be123c' : '#334155'};">${task.slaDeadline ? '< 4 Jam (Hotfix)' : '< 24 Jam'}</strong>
                </span>
              </div>

              <h4 class="ai-ctx-title">${task.title}</h4>
              <p class="ai-ctx-desc">${task.description || 'Tidak ada deskripsi rinci.'}</p>

              <div style="display: flex; gap: 10px; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 6px; flex-wrap: wrap;">
                <span>Sumber: <strong style="color: #334155;">${task.source || 'Sentry Alert'}</strong></span>
                <span>·</span>
                <span>Lingkungan: <strong style="color: #334155;">${task.environment || 'Production'}</strong></span>
                <span>·</span>
                <span>Garansi: <strong style="color: #059669;">${task.warrantyStatus || 'Garansi Rp0'}</strong></span>
              </div>
            </div>

            <!-- Target Source File & Stacktrace -->
            <div class="ai-ctx-card">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="ai-ctx-label">Berkas Target &amp; Stacktrace</span>
                <span style="font-family: var(--font-mono); font-size: 10.5px; color: #4f46e5; font-weight: 700;">
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
                <span style="color: #d97706; font-size: 16px; flex-shrink: 0;">${Icons.shieldAlert ? Icons.shieldAlert('', 16) : Icons.alertTriangle('', 16)}</span>
                <div>
                  <strong style="display: block; margin-bottom: 2px;">Safety Guardrail Aktif (Klasifikasi Susah):</strong>
                  <span>Perubahan menyentuh integritas transaksi database atau race condition. AI Dilarang auto-deploy ke Production. Tiket dialihkan ke Lead Developer untuk penanganan manual.</span>
                </div>
              </div>
            ` : `
              <div class="ai-guardrail-callout ai-guardrail-callout--safe">
                <span style="color: #059669; font-size: 16px; flex-shrink: 0;">${Icons.shieldCheck('', 16)}</span>
                <div>
                  <strong style="display: block; margin-bottom: 2px;">Verifikasi Keselamatan Otomasi (Klasifikasi ${taskCls.label}):</strong>
                  <span>Bug bersifat fungsional tanpa resiko skema database. Aman untuk diproses otomatis oleh agen AI dengan proteksi test suite CI/CD.</span>
                </div>
              </div>
            `}
          </div>

          <!-- ==============================================
               KOLOM KANAN (60%): SOLUSI AI & EKSEKUSI ALUR
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
                  · PIC: <strong>${isSusah ? 'Jaka (Backend Lead)' : 'Claude 3.5 Coding Agent'}</strong>
                </span>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; color: #64748b;">Keyakinan AI:</span>
                <strong style="font-family: var(--font-mono); font-size: 14px; color: ${confidenceColor};">${confidence}%</strong>
              </div>
            </div>

            <!-- Solution Sub-Tabs (Diff / Unit Tests / Git PR / Telemetri) -->
            <div class="ai-studio-tabs">
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'diff' ? 'ai-studio-tab-btn--active' : ''}" data-tab="diff">
                <span>${Icons.code ? Icons.code('', 13) : Icons.gitPullRequest('', 13)}</span>
                <span>1. Patch Diff (Sebelum vs Sesudah)</span>
              </button>
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'tests' ? 'ai-studio-tab-btn--active' : ''}" data-tab="tests">
                <span>${Icons.checkSquare('', 13)}</span>
                <span>2. Unit Tests (${task.testResult?.passedCount || 5}/${task.testResult?.total || 5})</span>
              </button>
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'git' ? 'ai-studio-tab-btn--active' : ''}" data-tab="git">
                <span>${Icons.gitPullRequest('', 13)}</span>
                <span>3. Git Branch &amp; PR</span>
              </button>
              <button class="ai-studio-tab-btn ${this.activeStudioTab === 'telemetry' ? 'ai-studio-tab-btn--active' : ''}" data-tab="telemetry">
                <span>${Icons.trendingUp('', 13)}</span>
                <span>4. Telemetri Sentry</span>
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
-  const taxableBase = subtotal - discountTotal;
   const taxAmount = Math.round(taxableBase * 0.1);
   return { taxableBase, taxAmount, ratePercentage: 10 };
 }`;

      return `
        <div class="ai-diff-container">
          <div class="ai-diff-header">
            <span style="font-family: var(--font-mono); font-size: 11px; color: #334155;">
              Cabang: <code>${task.branchName || `fix/${task.key.toLowerCase()}`}</code>
            </span>
            <span class="ai-diff-stats">
              <strong style="color: #059669;">+5 lines</strong> · <strong style="color: #e11d48;">-1 line</strong>
            </span>
          </div>
          <div class="ai-diff-code-area">
            <pre>${diffText}</pre>
          </div>
        </div>
      `;
    }

    if (this.activeStudioTab === 'tests') {
      const tests = task.testResult?.logs || [
        'PASS test/unit/taxEngine.test.ts',
        '✓ calculateTaxPB1 calculates standard 10% tax (12ms)',
        '✓ calculateTaxPB1 handles 100% discount promo safely (9ms)',
        '✓ calculateTaxPB1 prevents division by zero / NaN floating point (14ms)',
        '✓ regression check: upstream receipt formatting unchanged (32ms)',
        '✓ stress test: 500 payload iterations PASS with zero crash (45ms)'
      ];

      return `
        <div class="ai-tests-container">
          <div class="ai-tests-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="ai-engine-status-pill ai-engine-status-pill--active">
                ${Icons.checkCircle('', 12)}
                <span>Unit Regression Suite: 100% Passing (5/5)</span>
              </span>
              <span style="font-size: 11px; color: #64748b;">Durasi: 112ms</span>
            </div>
            <span style="font-size: 11px; color: #059669; font-weight: 700;">CI/CD Gate: PASSED</span>
          </div>
          <div class="ai-tests-terminal">
            <pre>${tests.join('\n')}</pre>
          </div>
        </div>
      `;
    }

    if (this.activeStudioTab === 'git') {
      const prNumber = task.prNumber || 'PR #42';
      const branch = task.branchName || `ai/fix-${task.key.toLowerCase()}`;

      return `
        <div class="ai-git-container" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #4f46e5; font-size: 16px;">${Icons.gitPullRequest('', 16)}</span>
              <strong style="font-size: 13px; color: #0f172a;">${prNumber}: fix(${task.key}): null guard &amp; boundary safety patch</strong>
            </div>
            <span style="font-size: 10.5px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
              Open &amp; Ready for Review
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11.5px; background: #f8fafc; padding: 10px 12px; border-radius: 6px;">
            <div>
              <span style="color: #64748b;">Target Branch:</span>
              <code style="margin-left: 4px; font-weight: 700; color: #0f172a;">staging</code>
            </div>
            <div>
              <span style="color: #64748b;">Source Branch:</span>
              <code style="margin-left: 4px; font-weight: 700; color: #4f46e5;">${branch}</code>
            </div>
            <div>
              <span style="color: #64748b;">Author:</span>
              <strong style="margin-left: 4px; color: #0f172a;">agensi-tech-bot (Claude Agent)</strong>
            </div>
            <div>
              <span style="color: #64748b;">Reviewer:</span>
              <strong style="margin-left: 4px; color: #0f172a;">Jaka (Backend Lead)</strong>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeStudioTab === 'telemetry') {
      return `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #d97706; font-size: 16px;">${Icons.trendingUp('', 16)}</span>
              <strong style="font-size: 13px; color: #0f172a;">Pemantauan Telemetri Sentry Canary (30 Menit)</strong>
            </div>
            <span style="font-size: 10.5px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
              Error Rate 0.02% (Normal)
            </span>
          </div>

          <p style="margin: 0; font-size: 11.5px; color: #475569; line-height: 1.45;">
            Sistem secara otomatis mengawasi error spike pada cluster Staging/Production pasca rilis patch. Jika error rate melebihi 2.0%, rollback darurat otomatis dipicu.
          </p>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11px;">
            <div style="padding: 8px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">Total Request Dipantau</span>
              <strong style="font-size: 13px; color: #0f172a; font-family: var(--font-mono);">14,280 Req</strong>
            </div>
            <div style="padding: 8px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">Failed Request (5xx)</span>
              <strong style="font-size: 13px; color: #059669; font-family: var(--font-mono);">3 Req (0.02%)</strong>
            </div>
            <div style="padding: 8px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="color: #64748b; display: block;">Rollback Trigger Threshold</span>
              <strong style="font-size: 13px; color: #d97706; font-family: var(--font-mono);">&gt; 2.0% (Aman)</strong>
            </div>
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
        <button class="ai-btn ai-btn--primary" disabled style="opacity: 0.85;">
          <span class="ai-spinner"></span>
          <span>Agen AI Sedang Menganalisis &amp; Membuat Patch...</span>
        </button>
      `;
    }

    // Stage 1: Baru / Backlog / Dianalisis
    if (st === 'Baru' || st === 'Backlog' || st === 'Dianalisis' || st === 'To Do') {
      return `
        <button id="studioRunAiFixBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}" title="Picu Agen AI untuk menganalisis AST & membuat patch otomatis">
          ${Icons.zap('', 13)}
          <span>⚡ Jalankan Auto-Fix AI</span>
        </button>

        <button id="studioEscalateManualBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Alihkan tiket ke antrean penanganan manual developer">
          ${Icons.user('', 13)}
          <span>Alihkan ke Manual Dev</span>
        </button>
      `;
    }

    // Stage 2: Menunggu Persetujuan / In Review
    if (st === 'Menunggu Persetujuan' || st === 'In Review') {
      return `
        <button id="studioApprovePrBtn" class="ai-btn ai-btn--success" data-task-id="${task.id}" title="Setujui Pull Request dan deploy otomatis ke cluster Staging">
          ${Icons.check('', 13)}
          <span>✅ Setujui PR &amp; Merge ke Staging</span>
        </button>

        <button id="studioRequestRevisionBtn" class="ai-btn ai-btn--warning" data-task-id="${task.id}" title="Minta agen AI merevisi logika patch">
          ${Icons.rotateCcw('', 13)}
          <span>Minta Revisi ke AI</span>
        </button>

        <button id="studioEscalateManualBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Alihkan perbaikan ke programmer manusia">
          ${Icons.user('', 13)}
          <span>Alihkan ke Manual Dev</span>
        </button>
      `;
    }

    // Stage 3: Disetujui / QA/Testing / Deploy Staging
    if (st === 'Disetujui' || st === 'QA/Testing' || st === 'Deploy Staging') {
      return `
        <button id="studioDeployProdBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}" title="Rilis perbaikan ke Production dengan perlindungan pemantauan Sentry">
          ${Icons.send('', 13)}
          <span>🚀 Deploy ke Production (Pantau Sentry)</span>
        </button>

        <button id="studioQaSignOffBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Verifikasi sign-off pengujian staging">
          ${Icons.checkSquare('', 13)}
          <span>Beri Sign-Off QA (Lolos)</span>
        </button>
      `;
    }

    // Stage 4: Deploy Production / Dipantau / Selesai
    if (st === 'Deploy Production' || st === 'Dipantau' || st === 'Selesai') {
      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="ai-engine-status-pill ai-engine-status-pill--active" style="padding: 5px 10px;">
            ${Icons.shieldCheck('', 13)}
            <span>Monitoring Sentry Aktif: Error Rate 0.02% (Stabil)</span>
          </span>

          <button id="studioTestRollbackBtn" class="ai-btn ai-btn--ghost-danger" data-task-id="${task.id}" title="Simulasi lonjakan error Sentry untuk menguji auto-rollback">
            ${Icons.rotateCcw('', 13)}
            <span>Uji Rollback Darurat</span>
          </button>
        </div>
      `;
    }

    // Stage 5: Perlu Penanganan Manual (Susah / S1)
    if (st === 'Perlu Manual') {
      return `
        <button id="studioOpenHumanFixModalBtn" class="ai-btn ai-btn--warning" data-task-id="${task.id}" title="Buka form mitigasi arsitektur untuk lead developer">
          ${Icons.wrench('', 13)}
          <span>🛠️ Selesaikan Manual oleh Lead Developer</span>
        </button>

        <button id="studioForceAiFixBtn" class="ai-btn ai-btn--secondary" data-task-id="${task.id}" title="Paksa pengerjaan dengan agen AI Claude">
          ${Icons.zap('', 13)}
          <span>Coba Auto-Fix AI</span>
        </button>
      `;
    }

    return '';
  }

  renderPipelineView(tasks) {
    const columns = [
      { id: 'inbound', label: '1. Laporan Masuk', statuses: ['Baru', 'Backlog'], color: '#64748b', tip: 'Sentry / Telegram Bot' },
      { id: 'analyzing', label: '2. Dianalisis AI', statuses: ['Dianalisis', 'To Do'], color: '#0284c7', tip: 'Evaluasi AST & Risiko' },
      { id: 'fixing', label: '3. Pengerjaan Fix', statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'], color: '#4f46e5', tip: 'Branch Git & Agen AI' },
      { id: 'review', label: '4. Review PR', statuses: ['Menunggu Persetujuan', 'In Review'], color: '#d97706', tip: 'Persetujuan Manusia' },
      { id: 'qa', label: '5. QA Staging', statuses: ['Disetujui', 'QA/Testing', 'Deploy Staging'], color: '#8b5cf6', tip: 'Verifikasi UAT & Docker' },
      { id: 'prod', label: '6. Rilis & Monitor', statuses: ['Deploy Production', 'Dipantau', 'Selesai'], color: '#059669', tip: 'Canary Sentry 30m' }
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
                    <span style="font-size: 18px; display: block; margin-bottom: 4px; opacity: 0.5;">
                      ${Icons.inbox ? Icons.inbox('', 18) : Icons.listTodo('', 18)}
                    </span>
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
            <span>Keyakinan AI</span>
            <span style="font-family: var(--font-mono); font-weight: 700; color: ${meterColor};">${confidence}%</span>
          </div>
          <div class="ai-bc-meter-bar">
            <div class="ai-bc-meter-fill" style="width: ${confidence}%; background-color: ${meterColor};"></div>
          </div>
        </div>

        <div class="ai-bc-footer">
          <span class="ai-bc-env">
            <span>${Icons.server ? Icons.server('', 11) : Icons.globe('', 11)}</span>
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

  renderInspectorModal(task) {
    const taskCls = this.getTaskClassification(task);

    return `
      <div class="ai-modal-overlay" id="inspectorModalOverlay">
        <div class="ai-modal-box">
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
              ${Icons.x('', 14)}
            </button>
          </div>

          <!-- Inspector Tabs -->
          <div class="ai-insp-tabs">
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'overview' ? 'ai-insp-tab-btn--active' : ''}" data-tab="overview">
              1. Overview &amp; Spec
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'solution' ? 'ai-insp-tab-btn--active' : ''}" data-tab="solution">
              2. Solution Diff
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'qa_signoff' ? 'ai-insp-tab-btn--active' : ''}" data-tab="qa_signoff">
              3. QA Sign-Off
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'telemetry' ? 'ai-insp-tab-btn--active' : ''}" data-tab="telemetry">
              4. Telemetri &amp; Guard
            </button>
          </div>

          <div class="ai-modal-body">
            ${this.renderInspectorTabContent(task)}
          </div>

          <div class="ai-modal-footer">
            <button id="closeInspectorFooterBtn" class="ai-btn ai-btn--secondary">Tutup</button>
            <button id="selectToStudioFromModalBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}">
              ${Icons.cpu('', 13)}
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
              <p style="margin: 4px 0 0 0; line-height: 1.4;">Sistem memproses request normal tanpa exception atau deadlock.</p>
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
        <div class="ai-decision-diff-viewer">
          <pre>${task.prDiff || '--- a/src/index.ts\n+++ b/src/index.ts\n@@ -10,3 +10,5 @@\n+ // Automated fix by Claude Agent\n+ if (!input) return null;'}</pre>
        </div>
      `;
    }

    if (this.inspectorTab === 'qa_signoff') {
      const isPassed = task.qaSignOff?.status === 'Passed' || task.status === 'Disetujui' || task.status === 'Selesai';
      return `
        <div style="padding: 14px 16px; border-radius: 8px; background: #faf5ff; border: 1px solid #e9d5ff; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #581c87; display: block;">Status Verifikasi Staging QA:</strong>
            <span style="font-size: 11px; color: #7e22ce;">Uji regresi automated &amp; manual UAT</span>
          </div>
          <span style="font-weight: 700; color: ${isPassed ? '#059669' : '#d97706'}; font-size: 13px;">
            ${isPassed ? '✓ Lulus QA Sign-Off' : 'Menunggu Pengujian'}
          </span>
        </div>
      `;
    }

    if (this.inspectorTab === 'telemetry') {
      return `
        <div style="padding: 14px 16px; border-radius: 8px; background: #fffbeb; border: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #92400e; display: block;">Telemetri Sentry Canary (30 Menit):</strong>
            <span style="font-size: 11px; color: #b45309;">Pemantauan error spike real-time pasca deploy</span>
          </div>
          <span style="font-family: var(--font-mono); font-weight: 700; color: #047857; font-size: 14px;">0.02% Error Rate (Stabil)</span>
        </div>
      `;
    }

    return '';
  }

  renderNewBugModal() {
    const state = store.getState();
    const activeProj = store.getActiveProject() || state.projects[0];

    return `
      <div class="ai-modal-overlay" id="newBugModalOverlay">
        <div class="ai-modal-box" style="max-width: 600px;">
          <div class="ai-modal-header">
            <h2 style="font-size: 15.5px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #4f46e5;">${Icons.plus('', 16)}</span>
              <span>Buat Laporan Bug Baru</span>
            </h2>
            <button id="closeNewBugModalBtn" class="ai-btn ai-btn--secondary ai-btn--sm" style="padding: 6px; border-radius: 9999px;">
              ${Icons.x('', 14)}
            </button>
          </div>

          <form id="newBugForm">
            <div class="ai-modal-body">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Proyek Target:</label>
                <input type="text" value="${activeProj.name} (${activeProj.code})" disabled style="padding: 8px 10px; font-size: 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; color: #475569;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Tingkat Keparahan:</label>
                  <select id="modalBugSeverity" style="padding: 8px 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                    <option value="S1 - Critical (Blocker)">S1 - Kritis / Blocker (SLA 30 Menit)</option>
                    <option value="S2 - Major" selected>S2 - Major (SLA 2 Jam)</option>
                    <option value="S3 - Minor">S3 - Minor (SLA 8 Jam)</option>
                  </select>
                </div>

                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Lingkungan:</label>
                  <select id="modalBugEnvironment" style="padding: 8px 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                    <option value="Production" selected>Production (Live)</option>
                    <option value="Staging">Staging UAT</option>
                    <option value="Development">Development Sandbox</option>
                  </select>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Judul Masalah Bug:</label>
                <input type="text" id="modalBugTitle" placeholder="Contoh: TypeError calculateTaxPB1 is undefined saat diskon promo..." required style="padding: 8px 10px; font-size: 12.5px; border: 1px solid #cbd5e1; border-radius: 6px;" />
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Deskripsi &amp; Stacktrace:</label>
                <textarea id="modalBugDescription" rows="4" placeholder="Tempel stacktrace error atau langkah reproduksi kendala..." style="padding: 8px 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: var(--font-mono); resize: vertical;"></textarea>
              </div>
            </div>

            <div class="ai-modal-footer">
              <button type="button" id="cancelNewBugBtn" class="ai-btn ai-btn--secondary">Batal</button>
              <button type="submit" class="ai-btn ai-btn--primary">
                ${Icons.plus('', 13)}
                <span>Simpan &amp; Triage Otomatis</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderHumanFixModal(task) {
    return `
      <div class="ai-modal-overlay" id="humanFixModalOverlay">
        <div class="ai-modal-box" style="max-width: 650px;">
          <div class="ai-modal-header">
            <h2 style="font-size: 15.5px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #d97706;">${Icons.wrench('', 16)}</span>
              <span>Resolusi Manual Lead Developer [${task.key}]</span>
            </h2>
            <button id="closeHumanFixModalBtn" class="ai-btn ai-btn--secondary ai-btn--sm" style="padding: 6px; border-radius: 9999px;">
              ${Icons.x('', 14)}
            </button>
          </div>

          <form id="humanFixForm">
            <div class="ai-modal-body">
              <div style="padding: 10px 12px; border-radius: 6px; background: #fffbeb; border: 1px solid #fde68a; font-size: 12px; color: #92400e;">
                <strong>Instruksi Safety Guardrail:</strong>
                <p style="margin: 4px 0 0 0;">Bug ini menyentuh lapisan database / concurrency. Pilih mitigasi arsitektur yang aman dan konfirmasi rilis manual.</p>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Pilih Solusi Mitigasi:</label>
                <select id="humanFixOptionSelect" style="padding: 8px 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                  <option value="deterministic_lock">Terapkan deterministik lock ordering (sort resource IDs sebelum query)</option>
                  <option value="redlock">Gunakan Redis Distributed Mutex (Redlock) dengan TTL 5 detik</option>
                  <option value="optimistic_concurrency">Optimistic Concurrency Control dengan version column retry 3x</option>
                </select>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 12px; font-weight: 700; color: #1e293b;">Catatan Review &amp; Mitigasi:</label>
                <textarea id="humanFixNotes" rows="3" style="padding: 8px 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit;">Telah diverifikasi tidak ada cyclic deadlock pada stress testing 50 RPS. Aman untuk rilis ke Staging.</textarea>
              </div>
            </div>

            <div class="ai-modal-footer">
              <button type="button" id="cancelHumanFixBtn" class="ai-btn ai-btn--secondary">Batal</button>
              <button type="submit" class="ai-btn ai-btn--success">
                ${Icons.check('', 13)}
                <span>Terapkan Solusi &amp; Rilis ke Staging</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
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

      // Navigate to Service Desk / Klien
      if (e.target.closest('#goToServiceDeskBtn')) {
        store.setActiveTab('client');
        return;
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

      // Studio Tabs (Diff / Tests / Git / Telemetry)
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
          store.qaSignOff(taskId, 'Passed', 'Regression test suite 100% verified passing di Staging cluster.');
          this.render();
        }
      }

      // Action 8: Uji Rollback Darurat
      if (e.target.closest('#studioTestRollbackBtn')) {
        const taskId = e.target.closest('#studioTestRollbackBtn').dataset.taskId;
        if (taskId) {
          store.triggerRollback(taskId, 'Simulasi spike 5xx error rate melebihi threshold 2.0% pada Sentry');
          this.render();
        }
      }
    });

    // Project Switcher Change
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'aiProjectSwitcher') {
        store.setSelectedProjectId(e.target.value);
        this.selectedTaskId = null;
        this.render();
      }
      if (e.target.id === 'studioTaskSelector') {
        this.selectedTaskId = e.target.value;
        this.render();
      }
    });

    // Search Input Real-Time
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'aiBugSearchInput') {
        this.searchQuery = e.target.value;
        this.render();
      }
    });

    // Form Submissions
    this.element.addEventListener('submit', (e) => {
      // New Bug Form Submit
      if (e.target.id === 'newBugForm') {
        e.preventDefault();
        const activeProj = store.getActiveProject();
        const titleEl = this.element.querySelector('#modalBugTitle');
        const descEl = this.element.querySelector('#modalBugDescription');
        const sevEl = this.element.querySelector('#modalBugSeverity');
        const envEl = this.element.querySelector('#modalBugEnvironment');

        if (!titleEl || !titleEl.value.trim()) return;

        const newTask = store.ingestBugReport({
          projectId: activeProj.id,
          title: titleEl.value.trim(),
          description: descEl ? descEl.value.trim() : '',
          severity: sevEl ? sevEl.value : 'S2 - Major',
          environment: envEl ? envEl.value : 'Production',
          source: 'Manual Form'
        });

        this.showNewBugModal = false;
        if (newTask) {
          this.selectedTaskId = newTask.id;
        }
        this.render();
      }

      // Human Fix Form Submit
      if (e.target.id === 'humanFixForm') {
        e.preventDefault();
        const notesEl = this.element.querySelector('#humanFixNotes');
        const optEl = this.element.querySelector('#humanFixOptionSelect');
        const notes = notesEl ? notesEl.value : 'Mitigasi diterapkan oleh Lead Developer.';
        const opt = optEl ? optEl.value : 'deterministic_lock';

        if (this.selectedTaskId) {
          store.resolveHumanFix(this.selectedTaskId, {
            notes,
            mitigationStrategy: opt,
            resolvedBy: 'Jaka Kurnia (Backend Lead)'
          });
          store.deployToStaging(this.selectedTaskId);
        }

        this.showHumanFixModal = false;
        this.render();
      }
    });
  }

  attachDynamicListeners() {
    // Focus search input preservation if active
    const input = this.element.querySelector('#aiBugSearchInput');
    if (input && this.searchQuery) {
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  }
}
