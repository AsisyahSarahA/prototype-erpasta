/**
 * AiAutomationHub Component (100% Native Vanilla JS ES Module)
 * Implements Proportional, SaaS-grade UI for the AI Bug Automation & Triage Engine:
 * 1. Top ERP Breadcrumb & Main Header (Engine Status Pill, Project Switcher, Kill-Switch, Add Bug)
 * 2. PRD v3.0 Safety Guardrails & Human-in-the-Loop Principle Banner
 * 3. Executive KPI Metric Scorecards (Total Bugs, Confidence %, Sentry Hotfixes, Dev Hours Saved, CI/CD Status)
 * 4. Intelligent Orchestrator & AST Code Analyzer Console (Live Presets, Triage Decision, Confidence Gauge, Code Diff)
 * 5. Interactive Toolbar (Search Box, Category Filter Pills, Pipeline Kanban vs List View Switcher)
 * 6. 100% Proportional Main View Area:
 *    - 6-Stage Workflow Kanban Pipeline (Laporan Masuk, Triage SLA, Pengerjaan Fix, Review PR, QA Staging, Monitoring)
 *    - Structured Table Detail List
 * 7. Full Inspector Drawer Modal with 5 Deep-Dive Tabs (Overview, AST, Solution Diff, QA Sign-Off, Telemetry)
 * 8. Create Simulated Bug Modal with validation & live store reactivity.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class AiAutomationHub {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'ai-hub-container';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenIntakeModal = options.onOpenIntakeModal || (() => store.openIntakeModal());

    this.viewMode = 'pipeline'; // 'pipeline' | 'list'
    this.categoryFilter = 'all'; // 'all' | 'kecil' | 'menengah' | 'besar' | 'pr_review' | 'manual' | 'monitoring'
    this.searchQuery = '';
    this.showAstConsole = true;

    this.inspectedTask = null;
    this.inspectorTab = 'overview'; // 'overview' | 'orchestrator' | 'solution' | 'qa_signoff' | 'telemetry'

    // Intelligent Orchestrator Input & Result
    this.orchestratorInput = 'User mendapati error 500 saat mencoba klik tombol simpan profil jika kolom nomor telepon dikosongkan. Stacktrace: NullPointerException at UserController.java:45';
    this.orchestratorResult = null;

    // Sub-modal state
    this.showNewBugModal = false;

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

  setPresetInput(type) {
    if (type === 'deadlock') {
      this.orchestratorInput = 'PostgreSQL Transaction Deadlock 40P01 pada transaksi simultan peminjaman eksemplar buku ID 4891. Stacktrace: PDOException: SQLSTATE[40P01]: Deadlock detected at CirculationRepository.php:112';
    } else if (type === 'nullpointer') {
      this.orchestratorInput = 'User mendapati error 500 saat mencoba klik tombol simpan profil jika kolom nomor telepon dikosongkan. Stacktrace: NullPointerException at UserController.java:45';
    } else if (type === 'typo') {
      this.orchestratorInput = 'Typo label "Tenggat Waktu" tertulis "Tengat Waktu" dan missing optional chaining pada tooltip status kartu peminjam di OPAC UI.';
    }
    this.runOrchestrator();
    this.render();
  }

  runOrchestrator() {
    const input = (this.orchestratorInput || '').toLowerCase();
    const isCritical = input.includes('deadlock') || input.includes('transaksi') || input.includes('pembayaran') || input.includes('saldo') || input.includes('db');
    const isMedium = input.includes('denda') || input.includes('sirkulasi') || input.includes('nullpointer') || input.includes('exception');

    this.orchestratorResult = {
      decision: isCritical ? 'Jalur Tim Developer (Human Fix)' : 'Otomasi Penuh AI Claude Code',
      difficulty: isCritical ? 'Besar' : isMedium ? 'Menengah' : 'Kecil',
      severity: isCritical ? 'S1 - Critical (Blocker)' : isMedium ? 'S2 - Major' : 'S3 - Minor',
      confidenceScore: isCritical ? 42 : isMedium ? 88 : 96,
      slaTarget: isCritical ? '< 4 Jam (Hotfix)' : isMedium ? '24 Jam' : '3 Hari',
      recommendedAssignee: isCritical ? 'Jaka (Backend Lead)' : 'Claude 3.7 Agentic Headless',
      strategy: isCritical
        ? 'Dilarang auto-fix: perubahan menyentuh race condition/locking database transaksi. Buat isolated branch git dan delegasikan ke Lead Backend Developer dengan isolasi DB snapshot.'
        : 'Parsing stacktrace AST, pasang null guard & optional chaining pada target source file, buat unit test mock regresi, dan ajukan PR otomatis ke staging cluster.',
      astDiffSnippet: isCritical
        ? `--- a/src/repositories/CirculationRepository.php
+++ b/src/repositories/CirculationRepository.php
@@ -110,6 +110,9 @@
-  $book = Book::lockForUpdate()->find($bookId);
+  // Mitigasi Deadlock: Urutkan ID lock secara deterministik
+  $book = Book::where('id', $bookId)->lock('FOR UPDATE NOWAIT')->firstOrFail();`
        : `--- a/src/controllers/UserController.java
+++ b/src/controllers/UserController.java
@@ -45,3 +45,7 @@
+  if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
+    throw new ValidationException("Nomor telepon tidak boleh kosong");
+  }`
    };
  }

  render() {
    const state = store.getState();
    const activeProj = store.getActiveProject() || state.projects[0];
    const allProjTasks = store.getProjectTasks();
    const bugTasks = allProjTasks.filter(t => (t.type || '').toLowerCase() === 'bug');

    // Categorization
    const smallBugs = bugTasks.filter(t => t.difficulty === 'Low' || (t.severity || '').includes('Minor') || (t.severity || '').includes('Trivial') || (t.priority === 'Rendah'));
    const mediumBugs = bugTasks.filter(t => t.difficulty === 'Medium' || (t.severity || '').includes('Major') || (t.priority === 'Sedang'));
    const bigBugs = bugTasks.filter(t => t.difficulty === 'Hard' || (t.severity || '').includes('Critical') || (t.severity || '').includes('Blocker') || (t.priority === 'Hotfix' || t.priority === 'Tinggi'));
    const prReviewBugs = bugTasks.filter(t => t.status === 'Menunggu Persetujuan' || t.status === 'In Review');
    const manualBugs = bugTasks.filter(t => t.status === 'Perlu Manual');
    const monitoredBugs = bugTasks.filter(t => t.status === 'Dipantau' || t.status === 'Deploy Staging' || t.status === 'Selesai');

    // Filter by Category
    let displayTasks = bugTasks;
    if (this.categoryFilter === 'kecil') displayTasks = smallBugs;
    else if (this.categoryFilter === 'menengah') displayTasks = mediumBugs;
    else if (this.categoryFilter === 'besar') displayTasks = bigBugs;
    else if (this.categoryFilter === 'pr_review') displayTasks = prReviewBugs;
    else if (this.categoryFilter === 'manual') displayTasks = manualBugs;
    else if (this.categoryFilter === 'monitoring') displayTasks = monitoredBugs;

    // Filter by Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      displayTasks = displayTasks.filter(t =>
        (t.key || '').toLowerCase().includes(q) ||
        (t.title || '').toLowerCase().includes(q) ||
        (t.severity || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }

    if (!this.orchestratorResult) {
      this.runOrchestrator();
    }

    this.element.innerHTML = `
      <!-- ========================================================
           1. TOP ERP BREADCRUMB & CONTEXT STRIP
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
            <span>DeepSeek &amp; Claude 3.7 Intelligent Triage</span>
          </span>
        </div>
      </div>

      <!-- ========================================================
           2. MAIN HEADER & ACTION BAR
           ======================================================== -->
      <div class="ai-header-bar">
        <div class="ai-header-left">
          <div class="ai-icon-box" title="Otomasi Fix Bug AI Hub">
            <i class="fi fi-rr-magic-wand"></i>
          </div>

          <div class="ai-header-title-wrap">
            <div class="ai-header-title-row">
              <h1 class="ai-header-title">Otomasi Fix Bug AI &amp; Intelligent Triage Hub</h1>
              <span class="ai-engine-status-pill ${state.killSwitchActive ? 'ai-engine-status-pill--hold' : 'ai-engine-status-pill--active'}">
                ${state.killSwitchActive ? '● KILL-SWITCH AKTIF (Emergency Hold)' : '● OTOMASI OPERASIONAL (Claude 3.7 + DeepSeek)'}
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
              <span>Mesin triage otomatis: Bug kecil langsung di-patch agen AI, bug arsitektur besar dialihkan ke developer manusia dengan branch git.</span>
            </div>
          </div>
        </div>

        <div class="ai-header-right">
          <!-- Toggle Kill-Switch Button -->
          <button id="toggleKillSwitchBtn" class="ai-btn ${state.killSwitchActive ? 'ai-btn--killswitch-off' : 'ai-btn--killswitch-on'}" title="Hentikan sementara atau lanjutkan otomasi AI">
            <i class="fi fi-rr-power"></i>
            <span>${state.killSwitchActive ? 'Buka Kunci (Resume AI)' : 'Kill-Switch Darurat'}</span>
          </button>

          <!-- Toggle AST Console Button -->
          <button id="toggleAstConsoleBtn" class="ai-btn ai-btn--secondary" title="Tampilkan / Sembunyikan Konsol AST">
            <i class="fi fi-rr-cpu"></i>
            <span>${this.showAstConsole ? 'Sembunyikan AST' : 'Buka Konsol AST'}</span>
          </button>

          <!-- Create New Bug Button -->
          <button id="openNewBugModalBtn" class="ai-btn ai-btn--primary" title="Tambah laporan bug baru">
            <i class="fi fi-rr-plus"></i>
            <span>Buat Laporan Bug</span>
          </button>
        </div>
      </div>

      <!-- ========================================================
           3. MAIN CONTENT BODY (100% PROPORTIONAL WIDTH)
           ======================================================== -->
      <div class="ai-hub-body">

        <!-- Safety Guardrail PRD v3.0 Banner -->
        <div class="ai-guardrail-banner">
          <div class="ai-gr-left">
            <i class="fi fi-rr-shield-check ai-gr-icon"></i>
            <div class="ai-gr-text">
              <strong>Prinsip Keselamatan PRD v3.0 (Human-in-the-Loop):</strong>
              <span>AI bertindak sebagai asisten diagnostik. AI DILARANG melakukan auto-merge ke branch utama atau auto-deploy ke Production tanpa verifikasi review manusia.</span>
            </div>
          </div>
          <div class="ai-gr-badges">
            <span class="ai-gr-badge">No Auto-Merge to Main</span>
            <span class="ai-gr-badge">30m Sentry Telemetry Gate</span>
            <span class="ai-gr-badge">CI Tests Required</span>
          </div>
        </div>

        <!-- Row 1: Executive KPI Scorecards (5 Cards) -->
        <div class="ai-kpi-grid">
          <!-- Card 1: Total Bug Terlapor -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Total Bug Terdeteksi</span>
              <span class="ai-kpi-icon-badge ai-kpi-icon-badge--indigo"><i class="fi fi-rr-bug"></i></span>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value">${bugTasks.length}</span>
              <span class="ai-kpi-subtext">Bug Aktif</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag">${smallBugs.length} Kecil · ${mediumBugs.length} Menengah · ${bigBugs.length} Kritis</span>
              <span style="color: #64748b;">Sentry Sync</span>
            </div>
          </div>

          <!-- Card 2: AI Confidence Rate -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Akurasi &amp; Confidence</span>
              <span class="ai-kpi-icon-badge ai-kpi-icon-badge--emerald"><i class="fi fi-rr-magic-wand"></i></span>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value">94%</span>
              <span class="ai-kpi-subtext">Skor AI Rata-Rata</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ai-kpi-status-tag--success">🟢 Sangat Tinggi (Deep-AST)</span>
              <span style="color: #059669; font-weight: 600;">Presisi Tinggi</span>
            </div>
          </div>

          <!-- Card 3: Hotfix & S1 Critical Queue -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Antrean Hotfix Sentry</span>
              <span class="ai-kpi-icon-badge ai-kpi-icon-badge--rose"><i class="fi fi-rr-flame"></i></span>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value">${bigBugs.length}</span>
              <span class="ai-kpi-subtext">Tiket Kritis</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ai-kpi-status-tag--danger">🔴 SLA &lt; 4 Jam</span>
              <span style="color: #be123c; font-weight: 600;">Prioritas Utama</span>
            </div>
          </div>

          <!-- Card 4: Dev Hours Saved -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">Efisiensi Waktu Dev</span>
              <span class="ai-kpi-icon-badge ai-kpi-icon-badge--amber"><i class="fi fi-rr-time-fast"></i></span>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value">~28h</span>
              <span class="ai-kpi-subtext">Jam Kerja Dihemat</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ai-kpi-status-tag--success">Rata-rata 4.2s / patch</span>
              <span style="color: #64748b;">Auto-Patch</span>
            </div>
          </div>

          <!-- Card 5: CI/CD Pipeline Health -->
          <div class="ai-kpi-card">
            <div class="ai-kpi-card__top">
              <span class="ai-kpi-label">CI/CD Staging Cluster</span>
              <span class="ai-kpi-icon-badge ai-kpi-icon-badge--blue"><i class="fi fi-brands-github"></i></span>
            </div>
            <div class="ai-kpi-main">
              <span class="ai-kpi-value">✓ 6/6</span>
              <span class="ai-kpi-subtext">Passing Tests</span>
            </div>
            <div class="ai-kpi-footer">
              <span class="ai-kpi-status-tag ai-kpi-status-tag--success">Docker Up &amp; Healthy</span>
              <span style="color: #2563eb; font-weight: 600;">Staging Live</span>
            </div>
          </div>
        </div>

        <!-- Intelligent Orchestrator & AST Code Analyzer (Collapsible) -->
        ${this.showAstConsole ? `
          <div class="ai-orchestrator-card">
            <div class="ai-orch-header">
              <div class="ai-orch-title-group">
                <i class="fi fi-rr-cpu" style="color: #4f46e5; font-size: 16px;"></i>
                <h3 class="ai-orch-title">Simulasi Intelligent Orchestrator &amp; AST Stacktrace Analyzer</h3>
                <span class="ai-engine-status-pill ai-engine-status-pill--active" style="font-size: 10px;">AST Engine Aktif</span>
              </div>

              <!-- Live Presets Buttons -->
              <div class="ai-orch-presets">
                <span style="font-size: 11px; color: #64748b; font-weight: 600;">Preset Error:</span>
                <button class="ai-preset-btn" data-preset="deadlock">1. Deadlock PostgreSQL (S1)</button>
                <button class="ai-preset-btn" data-preset="nullpointer">2. NullPointerException (S2)</button>
                <button class="ai-preset-btn" data-preset="typo">3. Typo Label OPAC (S3)</button>
              </div>
            </div>

            <!-- Input area and action button -->
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <div class="ai-orch-input-wrap">
                <textarea id="orchestratorInputArea" class="ai-orch-textarea" rows="2" placeholder="Tempel stacktrace exception atau deskripsi laporan bug di sini...">${this.orchestratorInput}</textarea>
              </div>
              <button id="runOrchestratorBtn" class="ai-btn ai-btn--primary" style="height: 54px; white-space: nowrap; flex-shrink: 0;">
                <i class="fi fi-rr-play"></i>
                <span>Jalankan Analisis Triage AST</span>
              </button>
            </div>

            <!-- Orchestrator Decision Strip -->
            ${this.orchestratorResult ? `
              <div class="ai-decision-box">
                <div class="ai-decision-top">
                  <div class="ai-decision-badges">
                    <span style="font-size: 11.5px; font-weight: 700; color: #0f172a;">Jalur Keputusan:</span>
                    <span class="ai-decision-pill ai-decision-pill--primary">${this.orchestratorResult.decision}</span>
                    <span class="ai-decision-pill ai-decision-pill--diff">Kategori: ${this.orchestratorResult.difficulty}</span>
                    <span class="ai-engine-status-pill ai-engine-status-pill--active">${this.orchestratorResult.severity}</span>
                  </div>

                  <div class="ai-decision-meta">
                    <span>Confidence: <strong style="font-family: var(--font-mono); color: #4f46e5;">${this.orchestratorResult.confidenceScore}%</strong></span>
                    <span>·</span>
                    <span>SLA: <strong style="color: #be123c;">${this.orchestratorResult.slaTarget}</strong></span>
                    <span>·</span>
                    <span>Assignee: <strong>${this.orchestratorResult.recommendedAssignee}</strong></span>
                  </div>
                </div>

                <div class="ai-decision-strategy">
                  <strong>Strategi Resolusi Otomasi:</strong> ${this.orchestratorResult.strategy}
                </div>

                <div class="ai-decision-diff-viewer">
                  <pre>${this.orchestratorResult.astDiffSnippet}</pre>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Interactive Toolbar: Filter Pills, Search Box, & View Toggle -->
        <div class="ai-toolbar">
          <div class="ai-toolbar-left">
            <!-- Search Box -->
            <div class="ai-search-box">
              <i class="fi fi-rr-search ai-search-icon"></i>
              <input type="text" id="aiBugSearchInput" class="ai-search-input" placeholder="Cari kode tiket (LIB-xxx), judul, error..." value="${this.searchQuery}" />
            </div>

            <!-- Category Filter Pills -->
            <div class="ai-filter-pills">
              <button class="ai-filter-pill ${this.categoryFilter === 'all' ? 'ai-filter-pill--active' : ''}" data-cat="all">Semua (${bugTasks.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'kecil' ? 'ai-filter-pill--active' : ''}" data-cat="kecil">Kecil (${smallBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'menengah' ? 'ai-filter-pill--active' : ''}" data-cat="menengah">Menengah (${mediumBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'besar' ? 'ai-filter-pill--active' : ''}" data-cat="besar"><i class="fi fi-rr-flame" style="color:#e11d48;"></i> Kritis / Hotfix (${bigBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'pr_review' ? 'ai-filter-pill--active' : ''}" data-cat="pr_review">Menunggu PR (${prReviewBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'manual' ? 'ai-filter-pill--active' : ''}" data-cat="manual">Perlu Manual (${manualBugs.length})</button>
              <button class="ai-filter-pill ${this.categoryFilter === 'monitoring' ? 'ai-filter-pill--active' : ''}" data-cat="monitoring">Dipantau (${monitoredBugs.length})</button>
            </div>
          </div>

          <!-- View Mode Toggle -->
          <div class="ai-view-switcher">
            <button id="viewPipelineBtn" class="ai-view-btn ${this.viewMode === 'pipeline' ? 'ai-view-btn--active' : ''}">
              <i class="fi fi-rr-apps"></i>
              <span>Pipeline Kanban</span>
            </button>
            <button id="viewListBtn" class="ai-view-btn ${this.viewMode === 'list' ? 'ai-view-btn--active' : ''}">
              <i class="fi fi-rr-list"></i>
              <span>Tabel Detail</span>
            </button>
          </div>
        </div>

        <!-- Main View Area (Pipeline vs List) -->
        ${this.viewMode === 'pipeline' ? this.renderPipelineView(displayTasks) : this.renderListView(displayTasks)}

      </div>

      <!-- Inspector Drawer / Modal -->
      ${this.inspectedTask ? this.renderInspectorModal(this.inspectedTask) : ''}

      <!-- Create New Bug Report Modal -->
      ${this.showNewBugModal ? this.renderNewBugModal() : ''}
    `;

    this.attachDynamicListeners();
  }

  renderPipelineView(tasks) {
    const columns = [
      { id: 'inbound', label: '1. Laporan Masuk', statuses: ['Baru', 'Backlog'], color: '#64748b', tip: 'Sentry / Telegram' },
      { id: 'analyzing', label: '2. Triage &amp; SLA', statuses: ['Dianalisis', 'To Do'], color: '#0284c7', tip: 'Evaluasi AST' },
      { id: 'fixing', label: '3. Pengerjaan Fix', statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'], color: '#4f46e5', tip: 'Branch Git Aktif' },
      { id: 'review', label: '4. Code Review PR', statuses: ['Menunggu Persetujuan', 'In Review'], color: '#d97706', tip: 'Peer / Lead Review' },
      { id: 'qa', label: '5. QA Staging Test', statuses: ['Disetujui', 'QA/Testing', 'Deploy Staging'], color: '#8b5cf6', tip: 'Sign-Off UAT' },
      { id: 'prod', label: '6. Rilis &amp; Monitoring', statuses: ['Deploy Production', 'Dipantau', 'Selesai'], color: '#059669', tip: '30m Sentry Guard' }
    ];

    return `
      <div class="ai-pipeline-grid">
        ${columns.map((col, idx) => {
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
    const isS1 = (task.severity || '').startsWith('S1') || task.priority === 'Hotfix';
    const isS2 = (task.severity || '').startsWith('S2') || task.priority === 'Tinggi';
    const isS3 = (task.severity || '').startsWith('S3') || task.priority === 'Sedang';

    const severityClass = isS1 ? 'ai-bc-severity--s1' : isS2 ? 'ai-bc-severity--s2' : isS3 ? 'ai-bc-severity--s3' : 'ai-bc-severity--s4';
    const confidence = task.confidenceScore || (isS1 ? 42 : isS2 ? 88 : 96);
    const meterColor = confidence >= 85 ? '#10b981' : confidence >= 60 ? '#f59e0b' : '#ef4444';

    return `
      <div class="ai-bug-card ${isS1 ? 'ai-bug-card--critical' : ''}" data-task-id="${task.id}" title="Klik untuk membuka inspector bug ${task.key}">
        <div class="ai-bc-top">
          <span class="ai-bc-key">${task.key}</span>
          <span class="ai-bc-severity ${severityClass}">
            ${task.severity || (isS1 ? 'S1 - Critical' : 'S3 - Minor')}
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
          <span class="ai-bc-action-link">Buka Inspector →</span>
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
              <th style="width: 130px;">SEVERITY</th>
              <th style="width: 130px;">STATUS</th>
              <th style="width: 110px;">LINGKUNGAN</th>
              <th style="width: 130px;">GARANSI</th>
              <th style="width: 110px;">CONFIDENCE</th>
              <th style="width: 110px; text-align: right;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.length === 0 ? `
              <tr>
                <td colspan="8" style="padding: 30px; text-align: center; color: #94a3b8; font-style: italic;">
                  Tidak ada data tiket bug yang cocok dengan filter atau kata kunci pencarian.
                </td>
              </tr>
            ` : tasks.map(t => {
              const isS1 = (t.severity || '').startsWith('S1') || t.priority === 'Hotfix';
              const conf = t.confidenceScore || (isS1 ? 42 : 94);
              return `
                <tr>
                  <td style="font-family: var(--font-mono); font-weight: 700; color: #4f46e5;">${t.key}</td>
                  <td style="font-weight: 600; color: #1e293b;">${t.title}</td>
                  <td>
                    <span class="ai-bc-severity ${isS1 ? 'ai-bc-severity--s1' : 'ai-bc-severity--s3'}">
                      ${t.severity || 'S3 - Minor'}
                    </span>
                  </td>
                  <td>
                    <span class="ai-engine-status-pill ai-engine-status-pill--active" style="font-size: 10.5px;">
                      ${t.status}
                    </span>
                  </td>
                  <td>${t.environment || 'Production'}</td>
                  <td style="color: #059669; font-weight: 600;">${t.warrantyStatus || 'Garansi Rp0'}</td>
                  <td style="font-family: var(--font-mono); font-weight: 700; color: ${conf >= 85 ? '#059669' : '#e11d48'};">${conf}%</td>
                  <td style="text-align: right;">
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
    const isS1 = (task.severity || '').startsWith('S1') || task.priority === 'Hotfix';

    return `
      <div class="ai-modal-overlay" id="inspectorModalOverlay">
        <div class="ai-modal-box">
          <!-- Modal Header -->
          <div class="ai-modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                <span class="ai-bc-key" style="font-size: 11.5px; padding: 2px 7px;">${task.key}</span>
                <span class="ai-bc-severity ${isS1 ? 'ai-bc-severity--s1' : 'ai-bc-severity--s3'}" style="font-size: 11px;">
                  ${task.severity || 'S2 - Major'}
                </span>
                <span style="font-size: 11.5px; color: #64748b;">· ${task.environment || 'Production'} · ${task.warrantyStatus || 'Garansi Proyek Bebas Bug'}</span>
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
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'orchestrator' ? 'ai-insp-tab-btn--active' : ''}" data-tab="orchestrator">
              <i class="fi fi-rr-cpu"></i> 2. AST &amp; Orkestrasi
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'solution' ? 'ai-insp-tab-btn--active' : ''}" data-tab="solution">
              <i class="fi fi-rr-code-compare"></i> 3. Solution &amp; PR Diff
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'qa_signoff' ? 'ai-insp-tab-btn--active' : ''}" data-tab="qa_signoff">
              <i class="fi fi-rr-badge-check"></i> 4. QA Sign-Off
            </button>
            <button class="ai-insp-tab-btn ${this.inspectorTab === 'telemetry' ? 'ai-insp-tab-btn--active' : ''}" data-tab="telemetry">
              <i class="fi fi-rr-dashboard"></i> 5. Telemetri &amp; Guard
            </button>
          </div>

          <!-- Modal Body -->
          <div class="ai-modal-body">
            ${this.renderInspectorTabContent(task)}
          </div>

          <!-- Modal Footer -->
          <div class="ai-modal-footer">
            <button id="closeInspectorFooterBtn" class="ai-btn ai-btn--secondary">Tutup</button>
            <button id="openFullTaskDetailBtn" class="ai-btn ai-btn--primary" data-task-id="${task.id}">
              <i class="fi fi-rr-arrow-up-right-from-square"></i>
              <span>Detail Tiket Penuh</span>
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

          ${task.reproductionSteps && task.reproductionSteps.length > 0 ? `
            <div style="background: white; border-radius: 8px; padding: 12px 14px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px;">
              <strong style="color: #0f172a;">Langkah Reproduksi:</strong>
              ${task.reproductionSteps.map((st, i) => `
                <div style="display: flex; gap: 6px; color: #475569;">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: #94a3b8;">${i + 1}.</span>
                  <span>${st.replace(/^[0-9]+\.\s*/, '')}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="padding: 10px 12px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;">
              <strong>Hasil Diharapkan:</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">${task.expectedBehavior || 'Sistem berjalan normal tanpa exception atau locking deadlock.'}</p>
            </div>
            <div style="padding: 10px 12px; border-radius: 8px; background: #fff1f2; border: 1px solid #fecdd3; color: #be123c;">
              <strong>Hasil Aktual (Error):</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">${task.actualBehavior || 'Terjadi galat exception 500 / deadlock contention.'}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'orchestrator') {
      const conf = task.confidenceScore || 85;
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12.5px;">
          <div style="padding: 12px 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 700; color: #0f172a; display: block;">Skor Keyakinan Agen AI:</span>
              <span style="font-size: 11px; color: #64748b;">Dihitung dari kompleksitas AST tree dan ketiadaan side-effect database</span>
            </div>
            <span style="font-family: var(--font-mono); font-size: 20px; font-weight: 800; color: #4f46e5;">
              ${conf}%
            </span>
          </div>

          <div style="padding: 12px 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px;">
            <strong style="color: #0f172a;">Catatan Analisis Agen:</strong>
            <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.5;">
              &ldquo;${task.confidenceReason || 'AST parser mendeteksi null dereference pada method invocation. Patch minimal dan mock test case sudah diverifikasi.'}&rdquo;
            </p>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'solution') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${task.prDiff ? `
            <div class="ai-decision-diff-viewer">
              <pre>${task.prDiff}</pre>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button id="inspectorApprovePrBtn" class="ai-btn ai-btn--primary" style="background: #059669; border-color: #059669;">
                <i class="fi fi-rr-check"></i>
                <span>Setujui PR &amp; Merge ke Staging</span>
              </button>
            </div>
          ` : `
            <div style="padding: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
              Belum ada Pull Request aktif yang diajukan untuk tiket ini.
            </div>
          `}
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
              <span style="font-size: 11px; color: #7e22ce;">Uji beban regresi &amp; unit test staging cluster</span>
            </div>
            <span style="font-weight: 700; color: ${isPassed ? '#059669' : '#d97706'}; font-size: 13px;">
              ${isPassed ? '✓ Lulus QA Sign-Off' : 'Menunggu Pengujian'}
            </span>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px;">
            <button id="inspectorSignOffPassBtn" class="ai-btn ai-btn--primary" style="background: #059669; border-color: #059669;">
              <i class="fi fi-rr-badge-check"></i>
              <span>Beri Sign-Off QA (Lolos)</span>
            </button>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'telemetry') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12.5px;">
          <div style="padding: 14px 16px; border-radius: 8px; background: #fffbeb; border: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #92400e; display: block;">Telemetri Sentry Post-Deploy (30 Menit):</strong>
              <span style="font-size: 11px; color: #b45309;">Monitoring real-time traffic pasca deploy staging</span>
            </div>
            <span style="font-family: var(--font-mono); font-weight: 700; color: #047857; font-size: 14px;">0.04% Error Rate (Aman)</span>
          </div>
          <div style="text-align: right;">
            <button id="inspectorTestRollbackBtn" class="ai-btn ai-btn--secondary" style="color: #be123c; border-color: #fecdd3;">
              <i class="fi fi-rr-undo"></i>
              <span>Simulasi Error Spike &amp; Rollback</span>
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }

  renderNewBugModal() {
    return `
      <div class="ai-modal-overlay" id="newBugModalOverlay">
        <div class="ai-modal-box" style="max-width: 520px;">
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
                <input id="bugTitleInput" type="text" placeholder="Contoh: Error 500 saat validasi form" required class="ai-search-input" style="padding-left: 10px;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Severity Kategori</label>
                  <select id="bugSeveritySelect" class="ai-proj-select" style="width: 100%; height: 32px;">
                    <option value="S1 - Critical (Blocker)">S1 - Critical (Blocker)</option>
                    <option value="S2 - Major">S2 - Major</option>
                    <option value="S3 - Minor" selected>S3 - Minor</option>
                    <option value="S4 - Trivial">S4 - Trivial</option>
                  </select>
                </div>

                <div>
                  <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Sumber Masalah</label>
                  <select id="bugSourceSelect" class="ai-proj-select" style="width: 100%; height: 32px;">
                    <option value="Sentry Exception">Sentry Exception Alert</option>
                    <option value="Telegram Bot">Telegram Bot API</option>
                    <option value="Web Portal">Portal Web Klien</option>
                    <option value="Manual / QA">Manual / Pengujian QA</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Deskripsi / Stacktrace Exception</label>
                <textarea id="bugDescInput" rows="3" placeholder="Tempel stacktrace atau rincian langkah error di sini..." class="ai-orch-textarea"></textarea>
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

  attachEvents() {
    this.element.addEventListener('click', (e) => {
      // Toggle Kill-Switch
      if (e.target.closest('#toggleKillSwitchBtn')) {
        store.toggleKillSwitch();
      }

      // Toggle AST Console
      if (e.target.closest('#toggleAstConsoleBtn')) {
        this.showAstConsole = !this.showAstConsole;
        this.render();
      }

      // Open New Bug modal
      if (e.target.closest('#openNewBugModalBtn')) {
        this.showNewBugModal = true;
        this.render();
      }

      // Presets
      const presetBtn = e.target.closest('.ai-preset-btn');
      if (presetBtn && presetBtn.dataset.preset) {
        this.setPresetInput(presetBtn.dataset.preset);
      }

      // Run Orchestrator button
      if (e.target.closest('#runOrchestratorBtn')) {
        const area = this.element.querySelector('#orchestratorInputArea');
        if (area) {
          this.orchestratorInput = area.value;
        }
        this.runOrchestrator();
        this.render();
        store.addToast('info', 'Analisis AST Selesai', 'Strategi triage telah diperbarui oleh agen AI.');
      }

      // Filter pills
      const catBtn = e.target.closest('.ai-filter-pill');
      if (catBtn && catBtn.dataset.cat) {
        this.categoryFilter = catBtn.dataset.cat;
        this.render();
      }

      // View toggle
      if (e.target.closest('#viewPipelineBtn')) {
        this.viewMode = 'pipeline';
        this.render();
      }

      if (e.target.closest('#viewListBtn')) {
        this.viewMode = 'list';
        this.render();
      }

      // Card click -> Inspector
      const card = e.target.closest('.ai-bug-card') || e.target.closest('.inspect-task-btn');
      if (card) {
        const tId = card.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          this.inspectedTask = task;
          this.inspectorTab = 'overview';
          this.render();
        }
      }

      // Open Full Task Detail (from Inspector Modal)
      if (e.target.closest('#openFullTaskDetailBtn')) {
        const tId = e.target.closest('#openFullTaskDetailBtn').dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          this.inspectedTask = null;
          store.openTaskDetail(task);
        }
      }

      // Close inspector
      if (e.target.closest('#closeInspectorBtn') || e.target.closest('#closeInspectorFooterBtn') || e.target.id === 'inspectorModalOverlay') {
        this.inspectedTask = null;
        this.render();
      }

      // Close new bug modal
      if (e.target.closest('#closeNewBugModalBtn') || e.target.closest('#cancelNewBugBtn') || e.target.id === 'newBugModalOverlay') {
        this.showNewBugModal = false;
        this.render();
      }

      // Inspector Tabs
      const inspTab = e.target.closest('.ai-insp-tab-btn');
      if (inspTab && inspTab.dataset.tab) {
        this.inspectorTab = inspTab.dataset.tab;
        this.render();
      }

      // Inspector Actions
      if (e.target.closest('#inspectorApprovePrBtn') && this.inspectedTask) {
        store.approveAiPr(this.inspectedTask.id);
        this.inspectedTask = null;
        this.render();
      }

      if (e.target.closest('#inspectorSignOffPassBtn') && this.inspectedTask) {
        store.qaSignOff(this.inspectedTask.id, {
          passed: true,
          notes: 'QA Sign-Off disetujui via AI Hub',
          testCasesCount: 6,
          passedCasesCount: 6
        });
        this.inspectedTask = null;
        this.render();
      }

      if (e.target.closest('#inspectorTestRollbackBtn') && this.inspectedTask) {
        store.triggerRollback(this.inspectedTask.id, 'Simulasi spike error via AI Hub');
        this.inspectedTask = null;
        this.render();
      }
    });

    // Search Input Listener
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'aiBugSearchInput') {
        this.searchQuery = e.target.value;
        this.render();
      }
    });

    // Project Switcher
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'aiProjectSwitcher') {
        store.setSelectedProjectId(e.target.value);
      }
    });

    // New bug submit
    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'newBugForm') {
        e.preventDefault();
        const title = this.element.querySelector('#bugTitleInput')?.value || '';
        const severity = this.element.querySelector('#bugSeveritySelect')?.value || 'S3 - Minor';
        const source = this.element.querySelector('#bugSourceSelect')?.value || 'Sentry Exception';
        const desc = this.element.querySelector('#bugDescInput')?.value || '';

        if (title.trim()) {
          store.createTask({
            title: title.trim(),
            description: desc.trim(),
            type: 'Bug',
            priority: severity.startsWith('S1') ? 'Hotfix' : 'Sedang',
            severity,
            source,
            status: 'Baru',
            environment: 'Production',
            warrantyStatus: 'Garansi Proyek (Gratis)'
          });
          this.showNewBugModal = false;
          this.render();
          store.addToast('success', 'Laporan Bug Dibuat', `Tiket baru ${title} berhasil dicatat ke sistem.`);
        }
      }
    });
  }

  attachDynamicListeners() {}
}
