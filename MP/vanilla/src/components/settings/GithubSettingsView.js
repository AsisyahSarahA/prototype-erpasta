/**
 * GithubSettingsView Component (100% Native Vanilla JS ES Module)
 * Enterprise-Grade GitHub & Git Branches Hub for ASTACODE ERP
 * 
 * Fitur Alur Kerja End-to-End:
 * 1. Breadcrumb & Executive Header Bar (Project switcher terintegrasi, latency status, copy clone, buat cabang)
 * 2. Visual 5-Stage End-to-End Workflow Pipeline Stepper (Branching -> Commit -> CI/CD -> Review PR -> Rilis)
 * 3. Studio Alur Kerja Git & Workbench Interaktif (Split-Screen: Konteks Cabang & Guardrails vs Pipeline CI/CD, Diff Review & Webhook Bot)
 * 4. 4 Executive Scorecards (Repository, Total Cabang, PR Aktif, CI/CD Health)
 * 5. 5 Sub-Tabs Operasional:
 *    - Tab 1: Manajemen Cabang (Git Branches) & Pull Requests (Grid/Table view, filter, search)
 *    - Tab 2: Autentikasi & Konfigurasi API GitHub (PAT, Scopes, Latency test, Naming prefixes, Proteksi)
 *    - Tab 3: Collaborators & Hak Akses Repositori (Role developer, permission level, 2FA enforcement)
 *    - Tab 4: Webhook Real-time & Telegram Bot (@ProjectManjerBot PRD v3.0)
 *    - Tab 5: Riwayat Commit & Audit Log (Stream conventional commits, hash, author, CI tags)
 * 6. Modals Interaktif:
 *    - Modal Buat Cabang Baru (Prefix helper, base branch, link tiket/epics, live CLI snippet preview)
 *    - Modal Tambah Developer Collaborator (Role, permission, sync)
 *    - Modal Review & Konfirmasi Merge PR
 *    - Modal Panduan CLI Git Developer
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class GithubSettingsView {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'settings-view';

    // State Alur Kerja & Navigation
    this.activeWorkflowStep = 4; // 1: Branching, 2: Commit, 3: CI/CD, 4: Review PR, 5: Release
    this.activeSubTab = 'branches'; // 'branches' | 'config' | 'collaborators' | 'webhooks' | 'commits'
    this.activeStudioTab = 'cicd'; // 'cicd' | 'diff' | 'bot'
    this.selectedStudioBranch = 'feature/sanctum-rbac-auth';

    // Filter & View Cabang
    this.branchSearchQuery = '';
    this.branchTypeFilter = 'all'; // 'all' | 'protected' | 'feature' | 'epic' | 'hotfix'
    this.branchViewMode = 'grid'; // 'grid' | 'table'

    // Form & Status State
    this.showApiKey = false;
    this.showWebhookSecret = false;
    this.isTestingConn = false;
    this.isTestingPipeline = false;
    this.prMergedStatus = false; // State if PR #14 merged
    this.activeDiffFile = 'authMiddleware'; // 'authMiddleware' | 'routesApi'

    this.connectionStatus = {
      tested: true,
      success: true,
      latencyMs: 142,
      rateLimitRemaining: 4988,
      scopes: ['repo', 'workflow', 'admin:org', 'write:packages', 'read:user']
    };

    // Modals State
    this.showAddBranchModal = false;
    this.showAddUserModal = false;
    this.showMergePrModal = false;
    this.showCliGuideModal = false;

    // Form Data Cabang Baru
    this.newBranchData = {
      name: '',
      prefix: 'feat/',
      sourceBranch: 'staging',
      moduleName: '',
      assigneeId: 'user-dev-1'
    };

    // Form Data Collaborator Baru
    this.newUserData = {
      name: '',
      github: '',
      email: '',
      role: 'Backend Dev',
      permission: 'write',
      capacity: 40
    };

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

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject() || (state.projects && state.projects[0]) || {};
    const branches = activeProject.branches || [];
    const settings = state.githubSettings || {};
    const teamMembers = state.teamMembers || [];
    const tasks = state.tasks || [];
    const epics = state.epics || [];

    // Filter branches
    const filteredBranches = branches.filter((b) => {
      const matchSearch = (b.name || '').toLowerCase().includes(this.branchSearchQuery.toLowerCase()) ||
                          (b.moduleName || '').toLowerCase().includes(this.branchSearchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (this.branchTypeFilter === 'protected') {
        return b.name === 'main' || b.name === 'staging' || b.isDefault;
      }
      if (this.branchTypeFilter === 'feature') {
        return (b.name || '').startsWith('feat') || (b.name || '').startsWith('feature');
      }
      if (this.branchTypeFilter === 'epic') {
        return (b.name || '').startsWith('epic');
      }
      if (this.branchTypeFilter === 'hotfix') {
        return (b.name || '').startsWith('fix') || (b.name || '').startsWith('hotfix');
      }
      return true;
    });

    const repoUrl = activeProject.repoUrl || 'github.com/softwarehouse/perpustakaan-digital-microservices';
    const protectedCount = branches.filter((b) => b.name === 'main' || b.name === 'staging' || b.isDefault).length;
    const featureCount = branches.length - protectedCount;

    this.element.innerHTML = `
      <div class="git-master-container">
        
        <!-- Breadcrumb & Top Executive Bar -->
        <div class="git-breadcrumb-bar">
          <div class="git-breadcrumb-path">
            <a href="#" id="gitNavHome">ASTACODE PM</a>
            <span class="git-breadcrumb-separator">/</span>
            <span style="font-weight: 700; color: #4338ca;">${activeProject.name || 'Proyek ASTACODE'}</span>
            <span class="git-breadcrumb-separator">/</span>
            <span>Pengembangan &amp; AI</span>
            <span class="git-breadcrumb-separator">/</span>
            <span class="git-breadcrumb-current">GitHub &amp; Cabang</span>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; margin-left: 6px;">● Live</span>
          </div>

          <div class="git-header-meta-actions">
            <!-- Project Switcher -->
            <select id="gitProjectSelect" class="git-input" style="width: auto; padding: 5px 12px; font-weight: 600; background: white; border-color: #cbd5e1; cursor: pointer;">
              ${(state.projects || []).map((p) => `
                <option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>
                  ${p.code} - ${p.name.length > 30 ? p.name.substring(0, 30) + '...' : p.name}
                </option>
              `).join('')}
            </select>

            <span class="git-status-badge" title="API Status: Terkoneksi dengan GitHub Enterprise">
              <span class="git-status-dot"></span>
              <span>GitHub API v3 (${this.connectionStatus.latencyMs}ms)</span>
            </span>

            <button type="button" id="openAddBranchBtn" class="finance-btn-primary" style="font-size: 11px; padding: 7px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.plus('', 13)}
              <span>+ Buat Cabang Baru</span>
            </button>

            <button type="button" id="openCliGuideBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 7px 12px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.terminal('', 13)}
              <span>Panduan CLI</span>
            </button>
          </div>
        </div>

        <!-- Master Header Card -->
        <div class="git-header-card">
          <div class="git-header-identity">
            <div class="git-header-icon-box">
              ${Icons.folderGit('', 24)}
            </div>
            <div class="git-header-titles">
              <div class="git-header-title-row">
                <h1>Repositori &amp; Alur Kerja Cabang Git</h1>
                <a href="https://${repoUrl}" target="_blank" rel="noopener noreferrer" class="git-repo-pill" title="Buka Repositori di Tab Baru">
                  ${Icons.link('', 12)}
                  <span>${repoUrl}</span>
                  ${Icons.externalLink('', 11)}
                </a>
              </div>
              <p class="git-header-desc">
                Siklus pengembangan terstruktur: Checkout cabang fitur/hotfix, tracking commit konvensional, validasi otomatis CI/CD 6/6 checks, review Pull Request hingga merge staging &amp; rilis produksi.
              </p>
            </div>
          </div>

          <div class="git-header-buttons">
            <button type="button" id="copyRepoUrlBtn" data-url="https://${repoUrl}" class="git-filter-pill" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.copy('', 12)}
              <span>Salin Git Clone</span>
            </button>
            <button type="button" id="testConnHeaderBtn" class="git-filter-pill" style="display: inline-flex; align-items: center; gap: 6px;">
              ${this.isTestingConn ? Icons.refresh('animate-spin', 12) : Icons.refresh('', 12)}
              <span>${this.isTestingConn ? 'Menguji...' : 'Uji Koneksi & Sync'}</span>
            </button>
          </div>
        </div>

        <!-- 5-Stage End-to-End Workflow Pipeline Stepper -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 2px;">
            <span style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
              ${Icons.gitPullRequest('', 14)} Alur Kerja Siklus Hidup Git (End-to-End Lifecycle)
            </span>
            <span style="font-size: 11px; color: #64748b;">Klik tahapan untuk melihat rincian &amp; eksekusi workbench</span>
          </div>

          <div class="git-workflow-stepper">
            
            <!-- Tahap 1: Branching -->
            <div class="git-step-card ${this.activeWorkflowStep === 1 ? 'active' : ''}" data-step="1">
              <div class="git-step-card-top">
                <span class="git-step-num-badge">1</span>
                <span class="git-step-status-pill primary">${branches.length} Cabang</span>
              </div>
              <div class="git-step-title">1. Pembuatan Cabang</div>
              <p class="git-step-desc">Checkout dari staging/main, isolasi modul tiket, dan prefix standar feat/fix.</p>
            </div>

            <!-- Tahap 2: Commit & Upstream -->
            <div class="git-step-card ${this.activeWorkflowStep === 2 ? 'active' : ''}" data-step="2">
              <div class="git-step-card-top">
                <span class="git-step-num-badge">2</span>
                <span class="git-step-status-pill">12 Commits</span>
              </div>
              <div class="git-step-title">2. Commit &amp; Push Upstream</div>
              <p class="git-step-desc">Standar Conventional Commits, tracking hash commit, dan push remote.</p>
            </div>

            <!-- Tahap 3: CI/CD Pipeline -->
            <div class="git-step-card ${this.activeWorkflowStep === 3 ? 'active' : ''}" data-step="3">
              <div class="git-step-card-top">
                <span class="git-step-num-badge">3</span>
                <span class="git-step-status-pill success">6/6 Checks Lolos</span>
              </div>
              <div class="git-step-title">3. Validasi CI/CD &amp; Tes</div>
              <p class="git-step-desc">Linter, automated unit test regression, Docker build &amp; security scan Trivy.</p>
            </div>

            <!-- Tahap 4: Review PR & Merge -->
            <div class="git-step-card ${this.activeWorkflowStep === 4 ? 'active' : ''}" data-step="4">
              <div class="git-step-card-top">
                <span class="git-step-num-badge">4</span>
                <span class="git-step-status-pill ${this.prMergedStatus ? 'success' : 'warning'}">
                  ${this.prMergedStatus ? 'Merged ke Staging' : '1 Menunggu Review'}
                </span>
              </div>
              <div class="git-step-title">4. Review PR &amp; Merge</div>
              <p class="git-step-desc">Persetujuan Tech Lead / QA, inspeksi diff perubahan, squash &amp; merge staging.</p>
            </div>

            <!-- Tahap 5: Rilis & Audit -->
            <div class="git-step-card ${this.activeWorkflowStep === 5 ? 'active' : ''}" data-step="5">
              <div class="git-step-card-top">
                <span class="git-step-num-badge">5</span>
                <span class="git-step-status-pill success">v1.0.4 Deployed</span>
              </div>
              <div class="git-step-title">5. Rilis &amp; Audit Webhook</div>
              <p class="git-step-desc">Fast-forward ke main, deployment production, broadcast Telegram Bot &amp; Sentry.</p>
            </div>

          </div>
        </div>

        <!-- Studio Alur Kerja Git & Workbench Interaktif (Split-Screen) -->
        ${this.renderGitStudio(activeProject, branches, teamMembers, tasks)}

        <!-- 4 Executive KPI Scorecards -->
        <div class="git-kpi-grid">
          
          <!-- KPI 1: Active Repo -->
          <div class="git-kpi-card">
            <div class="git-kpi-top">
              <span class="git-kpi-label">Repository Utama</span>
              <div class="git-kpi-icon-wrap git-kpi-icon-indigo">
                ${Icons.folderGit('', 16)}
              </div>
            </div>
            <div class="git-kpi-value" style="font-size: 14px; font-family: var(--font-mono, monospace);" title="${repoUrl}">
              ${repoUrl.split('/').pop() || 'perpustakaan-microservice'}
            </div>
            <div class="git-kpi-subtext">
              <span style="color: #059669; font-weight: 700;">● Default: main</span> · ${branches.length} branches aktif
            </div>
          </div>

          <!-- KPI 2: Total Cabang -->
          <div class="git-kpi-card">
            <div class="git-kpi-top">
              <span class="git-kpi-label">Total Cabang (Branches)</span>
              <div class="git-kpi-icon-wrap git-kpi-icon-emerald">
                ${Icons.gitBranch('', 16)}
              </div>
            </div>
            <div class="git-kpi-value">
              ${branches.length} <span style="font-size: 13px; font-weight: 600; color: #64748b;">Cabang</span>
            </div>
            <div class="git-kpi-subtext">
              <span style="color: #4338ca; font-weight: 700;">${protectedCount} Terproteksi</span> · ${featureCount} Fitur &amp; Epics
            </div>
          </div>

          <!-- KPI 3: Pull Request Aktif -->
          <div class="git-kpi-card">
            <div class="git-kpi-top">
              <span class="git-kpi-label">Pull Request (PR) Aktif</span>
              <div class="git-kpi-icon-wrap git-kpi-icon-amber">
                ${Icons.gitPullRequest('', 16)}
              </div>
            </div>
            <div class="git-kpi-value">
              ${this.prMergedStatus ? '0' : '1'} <span style="font-size: 13px; font-weight: 600; color: #64748b;">${this.prMergedStatus ? 'Semua PR Merged' : 'Menunggu Review'}</span>
            </div>
            <div class="git-kpi-subtext">
              <span style="color: ${this.prMergedStatus ? '#059669' : '#b45309'}; font-weight: 700;">${this.prMergedStatus ? 'PR #14 Selesai' : 'PR #14'}</span> ➔ staging (LIB-116)
            </div>
          </div>

          <!-- KPI 4: CI/CD Pipeline -->
          <div class="git-kpi-card">
            <div class="git-kpi-top">
              <span class="git-kpi-label">Status CI/CD &amp; Testing</span>
              <div class="git-kpi-icon-wrap git-kpi-icon-blue">
                ${Icons.shieldCheck('', 16)}
              </div>
            </div>
            <div class="git-kpi-value" style="color: #059669;">
              100% <span style="font-size: 13px; font-weight: 600; color: #64748b;">Passing</span>
            </div>
            <div class="git-kpi-subtext">
              ✓ 6/6 Automated Pipeline Checks
            </div>
          </div>

        </div>

        <!-- 5 Sub-Tabs Navigation Bar -->
        <div class="git-tabs-nav">
          <button type="button" class="git-tab-btn ${this.activeSubTab === 'branches' ? 'active' : ''}" data-tab="branches">
            ${Icons.gitBranch('', 15)}
            <span>Manajemen Cabang &amp; PRs</span>
            <span class="git-tab-badge">${branches.length}</span>
          </button>

          <button type="button" class="git-tab-btn ${this.activeSubTab === 'config' ? 'active' : ''}" data-tab="config">
            ${Icons.settings('', 15)}
            <span>Autentikasi &amp; Konfigurasi API</span>
            <span class="git-tab-badge">PAT Aktif</span>
          </button>

          <button type="button" class="git-tab-btn ${this.activeSubTab === 'collaborators' ? 'active' : ''}" data-tab="collaborators">
            ${Icons.users('', 15)}
            <span>Collaborators &amp; Hak Akses</span>
            <span class="git-tab-badge">${teamMembers.length} Personel</span>
          </button>

          <button type="button" class="git-tab-btn ${this.activeSubTab === 'webhooks' ? 'active' : ''}" data-tab="webhooks">
            ${Icons.zap('', 15)}
            <span>Webhook &amp; Telegram Bot</span>
            <span class="git-tab-badge">2 Aktif</span>
          </button>

          <button type="button" class="git-tab-btn ${this.activeSubTab === 'commits' ? 'active' : ''}" data-tab="commits">
            ${Icons.gitCommit('', 15)}
            <span>Riwayat Commit &amp; Audit Log</span>
            <span class="git-tab-badge">12 Commits</span>
          </button>
        </div>

        <!-- Tab Content Viewport -->
        <div class="git-tab-viewport">
          ${this.renderActiveTabContent(activeProject, filteredBranches, settings, teamMembers, tasks, epics)}
        </div>

      </div>

      <!-- Modals -->
      ${this.showAddBranchModal ? this.renderAddBranchModal(activeProject, branches, teamMembers, tasks, epics) : ''}
      ${this.showAddUserModal ? this.renderAddUserModal() : ''}
      ${this.showMergePrModal ? this.renderMergePrModal() : ''}
      ${this.showCliGuideModal ? this.renderCliGuideModal() : ''}
    `;
  }

  // =========================================================================
  // Studio Alur Kerja Git & Workbench Interaktif
  // =========================================================================
  renderGitStudio(activeProject, branches, teamMembers, tasks) {
    const activeBranchName = this.selectedStudioBranch || (branches[0] && branches[0].name) || 'feature/sanctum-rbac-auth';
    const currentBranch = branches.find((b) => b.name === activeBranchName) || {
      name: activeBranchName,
      sourceBranch: 'staging',
      moduleName: 'Modul Autentikasi JWT & Sanctum API',
      commitHash: '4d19fa2',
      assigneeId: 'user-dev-1',
      lastUpdated: new Date().toISOString()
    };

    const isMerged = this.prMergedStatus;

    return `
      <div class="git-studio-card">
        
        <!-- Header Studio -->
        <div class="git-studio-header">
          <div class="git-studio-header-left">
            <div class="git-studio-title-box">
              <span style="color: #4338ca;">${Icons.terminal('', 18)}</span>
              <h2>Studio Cabang &amp; Eksekusi Pipeline Git</h2>
            </div>

            <!-- Selector Cabang Aktif untuk Workbench -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b;">Cabang Aktif:</span>
              <select id="studioBranchSelect" class="git-input git-input-mono" style="padding: 4px 10px; width: auto; font-size: 11px; font-weight: 700; background: white; border-color: #cbd5e1;">
                <option value="feature/sanctum-rbac-auth" ${activeBranchName === 'feature/sanctum-rbac-auth' ? 'selected' : ''}>
                  feature/sanctum-rbac-auth (PR #14 aktif)
                </option>
                ${branches.filter(b => b.name !== 'feature/sanctum-rbac-auth').map(b => `
                  <option value="${b.name}" ${b.name === activeBranchName ? 'selected' : ''}>
                    ${b.name} (${b.moduleName ? b.moduleName.substring(0, 24) : 'Fitur'})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="git-studio-actions">
            <button type="button" id="rerunPipelineBtn" class="git-filter-pill" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px;">
              ${this.isTestingPipeline ? Icons.refresh('animate-spin', 12) : Icons.refresh('', 12)}
              <span>${this.isTestingPipeline ? 'Menjalankan Checks...' : 'Uji Ulang CI/CD'}</span>
            </button>

            <button type="button" id="studioViewDiffBtn" class="git-filter-pill ${this.activeStudioTab === 'diff' ? 'active' : ''}" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px;">
              ${Icons.eye('', 12)}
              <span>Review Diff Kode</span>
            </button>

            ${!isMerged ? `
              <button type="button" id="openMergePrModalBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; background: #059669; border-color: #059669;">
                ${Icons.checkSquare('', 13)}
                <span>Setujui &amp; Merge Staging</span>
              </button>
            ` : `
              <span style="font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check('', 13)}
                <span>PR #14 Telah Di-merge ke Staging</span>
              </span>
            `}
          </div>
        </div>

        <!-- Split-Screen Body -->
        <div class="git-studio-split">
          
          <!-- Kolom Kiri: Konteks Cabang, Tracking Tiket & Perintah Terminal CLI -->
          <div class="git-studio-left">
            
            <!-- Ringkasan Info Cabang -->
            <div style="background: white; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Cabang Fitur Pilihan</span>
                  <div style="font-family: var(--font-mono, monospace); font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                    ${currentBranch.name}
                  </div>
                </div>
                <span class="git-branch-tag-feature" style="font-size: 10px;">
                  ➔ Base: ${currentBranch.sourceBranch || 'staging'}
                </span>
              </div>

              <!-- Tiket Masalah Terkait -->
              <div style="padding: 10px 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; font-weight: 700; color: #4338ca;">Tautan Tiket Backlog:</span>
                  <span style="font-size: 10px; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px;">LIB-116</span>
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #0f172a;">
                  [Backend] Centralized JWT Sanctum Authentication &amp; RBAC Mahasiswa vs Pustakawan
                </div>
                <div style="font-size: 10px; color: #64748b; display: flex; gap: 8px;">
                  <span>Prioritas: <strong>Tinggi</strong></span> · <span>Estimasi: <strong>16 Jam</strong></span> · <span>SLA: <strong>Aman</strong></span>
                </div>
              </div>

              <!-- Author / PIC Pengembang -->
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569; padding-top: 2px;">
                <span>Penanggung Jawab (PIC):</span>
                <span style="font-weight: 700; color: #0f172a; display: inline-flex; align-items: center; gap: 6px;">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" style="width: 18px; height: 18px; border-radius: 50%;" />
                  Jaka (Backend Dev)
                </span>
              </div>
            </div>

            <!-- Terminal Snippet Box (Perintah Siap Salin) -->
            <div class="git-terminal-box">
              <div class="git-terminal-header">
                <div class="git-terminal-dots">
                  <span class="git-terminal-dot red"></span>
                  <span class="git-terminal-dot yellow"></span>
                  <span class="git-terminal-dot green"></span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: #94a3b8; font-size: 10px;">bash / zsh terminal</span>
                  <button type="button" id="copyCliSnippetBtn" class="git-branch-copy-btn" title="Salin Perintah Git" style="color: #38bdf8;">
                    ${Icons.copy('', 12)}
                  </button>
                </div>
              </div>

              <div class="git-terminal-code">
                <span class="git-terminal-comment"># 1. Fetch &amp; checkout ke branch pengerjaan</span>
                <div class="git-terminal-line">
                  <span class="git-terminal-prompt">$</span>
                  <span class="git-terminal-cmd">git fetch origin &amp;&amp; git checkout ${currentBranch.name}</span>
                </div>
                <span class="git-terminal-comment"># 2. Tambahkan perubahan &amp; commit konvensional</span>
                <div class="git-terminal-line">
                  <span class="git-terminal-prompt">$</span>
                  <span class="git-terminal-cmd">git commit -m "feat(auth): implement sanctum rbac guard"</span>
                </div>
                <span class="git-terminal-comment"># 3. Push upstream untuk memicu status CI/CD</span>
                <div class="git-terminal-line">
                  <span class="git-terminal-prompt">$</span>
                  <span class="git-terminal-cmd">git push origin ${currentBranch.name}</span>
                </div>
              </div>
            </div>

            <!-- Guardrails & Kebijakan Proteksi -->
            <div class="git-guardrail-box">
              <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
                Guardrails &amp; Standar Proteksi Repositori:
              </div>
              <div class="git-guardrail-item">
                <i class="fi fi-rr-check"></i>
                <span>Wajib lolos 100% automated CI/CD checks (6/6 passing).</span>
              </div>
              <div class="git-guardrail-item">
                <i class="fi fi-rr-check"></i>
                <span>Minimal 1 approval dari Tech Lead / QA sebelum merge.</span>
              </div>
              <div class="git-guardrail-item">
                <i class="fi fi-rr-check"></i>
                <span>Blokir force-push pada branch staging dan main.</span>
              </div>
            </div>

          </div>

          <!-- Kolom Kanan: Workbench Eksekusi Pipeline CI/CD, Diff Review & Bot Payload -->
          <div class="git-studio-right">
            
            <!-- Studio Sub-Navigation Tabs -->
            <div class="git-studio-tabs">
              <button type="button" class="git-studio-tab-btn ${this.activeStudioTab === 'cicd' ? 'active' : ''}" data-studiotab="cicd">
                ${Icons.shieldCheck('', 13)}
                <span>1. Status Pipeline CI/CD (6/6 Lolos)</span>
              </button>
              <button type="button" class="git-studio-tab-btn ${this.activeStudioTab === 'diff' ? 'active' : ''}" data-studiotab="diff">
                ${Icons.code('', 13)}
                <span>2. Review Diff Kode (+348 / -42)</span>
              </button>
              <button type="button" class="git-studio-tab-btn ${this.activeStudioTab === 'bot' ? 'active' : ''}" data-studiotab="bot">
                ${Icons.zap('', 13)}
                <span>3. Notifikasi Bot &amp; Webhook</span>
              </button>
            </div>

            <!-- Sub-Tab 1: Pipeline CI/CD -->
            ${this.activeStudioTab === 'cicd' ? this.renderStudioCicdTab() : ''}

            <!-- Sub-Tab 2: Diff Kode -->
            ${this.activeStudioTab === 'diff' ? this.renderStudioDiffTab() : ''}

            <!-- Sub-Tab 3: Bot & Webhook Payload -->
            ${this.activeStudioTab === 'bot' ? this.renderStudioBotTab() : ''}

          </div>

        </div>

      </div>
    `;
  }

  renderStudioCicdTab() {
    const isRunning = this.isTestingPipeline;

    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">
            GitHub Actions Runner #842 (Linux Ubuntu 22.04 LTS x64)
          </span>
          <span style="font-size: 11px; font-weight: 700; color: ${isRunning ? '#0284c7' : '#059669'}; display: inline-flex; align-items: center; gap: 5px;">
            ${isRunning ? Icons.refresh('animate-spin', 12) : Icons.check('', 12)}
            <span>${isRunning ? 'Sedang Mengeksekusi Runner...' : 'Total Waktu: 1m 45s (Semua Lolos)'}</span>
          </span>
        </div>

        <div class="git-pipeline-list">
          
          <!-- Step 1 -->
          <div class="git-pipeline-item">
            <div class="git-pipeline-item-left">
              <div class="git-pipeline-icon ${isRunning ? 'running' : 'passed'}">
                ${isRunning ? Icons.refresh('animate-spin', 11) : Icons.check('', 11)}
              </div>
              <div>
                <div class="git-pipeline-title">1. Linting &amp; Code Formatting (PHPCS &amp; ESLint)</div>
                <div class="git-pipeline-meta">0 error, 0 warning · Standar PSR-12 &amp; Airbnb JS lolos</div>
              </div>
            </div>
            <span class="git-pipeline-badge">12s ✓</span>
          </div>

          <!-- Step 2 -->
          <div class="git-pipeline-item">
            <div class="git-pipeline-item-left">
              <div class="git-pipeline-icon ${isRunning ? 'running' : 'passed'}">
                ${isRunning ? Icons.refresh('animate-spin', 11) : Icons.check('', 11)}
              </div>
              <div>
                <div class="git-pipeline-title">2. Automated Unit &amp; Regression Test Suite (PHPUnit &amp; Jest)</div>
                <div class="git-pipeline-meta">48 tes unit autentikasi &amp; peran RBAC berhasil tanpa regresi</div>
              </div>
            </div>
            <span class="git-pipeline-badge">38s ✓</span>
          </div>

          <!-- Step 3 -->
          <div class="git-pipeline-item">
            <div class="git-pipeline-item-left">
              <div class="git-pipeline-icon ${isRunning ? 'running' : 'passed'}">
                ${isRunning ? Icons.refresh('animate-spin', 11) : Icons.check('', 11)}
              </div>
              <div>
                <div class="git-pipeline-title">3. Security Audit &amp; Dependency Scanning (Trivy &amp; CodeQL)</div>
                <div class="git-pipeline-meta">0 CVE terdeteksi · Tidak ada hardcoded credentials atau token bocor</div>
              </div>
            </div>
            <span class="git-pipeline-badge">24s ✓</span>
          </div>

          <!-- Step 4 -->
          <div class="git-pipeline-item">
            <div class="git-pipeline-item-left">
              <div class="git-pipeline-icon ${isRunning ? 'running' : 'passed'}">
                ${isRunning ? Icons.refresh('animate-spin', 11) : Icons.check('', 11)}
              </div>
              <div>
                <div class="git-pipeline-title">4. Database Migration Dry-Run (PostgreSQL 16 Test DB)</div>
                <div class="git-pipeline-meta">Verifikasi migrasi tabel user_tokens &amp; rollback tanpa schema drift</div>
              </div>
            </div>
            <span class="git-pipeline-badge">16s ✓</span>
          </div>

          <!-- Step 5 -->
          <div class="git-pipeline-item">
            <div class="git-pipeline-item-left">
              <div class="git-pipeline-icon ${isRunning ? 'running' : 'passed'}">
                ${isRunning ? Icons.refresh('animate-spin', 11) : Icons.check('', 11)}
              </div>
              <div>
                <div class="git-pipeline-title">5. Multi-stage Docker Container Image Build</div>
                <div class="git-pipeline-meta">Image <code>ghcr.io/perpustakaan/api:sha-4d19fa2</code> berhasil dikompilasi</div>
              </div>
            </div>
            <span class="git-pipeline-badge">42s ✓</span>
          </div>

          <!-- Step 6 -->
          <div class="git-pipeline-item">
            <div class="git-pipeline-item-left">
              <div class="git-pipeline-icon ${isRunning ? 'running' : 'passed'}">
                ${isRunning ? Icons.refresh('animate-spin', 11) : Icons.check('', 11)}
              </div>
              <div>
                <div class="git-pipeline-title">6. Staging Preview Environment Deployment</div>
                <div class="git-pipeline-meta">Preview aktif: <code>https://pr-14.preview.softwarehouse.dev</code></div>
              </div>
            </div>
            <span class="git-pipeline-badge">15s ✓</span>
          </div>

        </div>
      </div>
    `;
  }

  renderStudioDiffTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        
        <!-- File Switcher & Diff Stats -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 6px;">
            <button type="button" class="git-filter-pill ${this.activeDiffFile === 'authMiddleware' ? 'active' : ''}" id="switchDiffAuthBtn" style="font-size: 11px;">
              AuthenticateWithSanctum.php
            </button>
            <button type="button" class="git-filter-pill ${this.activeDiffFile === 'routesApi' ? 'active' : ''}" id="switchDiffRoutesBtn" style="font-size: 11px;">
              routes/api.php
            </button>
          </div>

          <div style="font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span style="color: #059669;">+348 baris ditambah</span>
            <span style="color: #ef4444;">-42 baris dihapus</span>
          </div>
        </div>

        <!-- Syntax-highlighted Diff Box -->
        <div class="git-diff-container">
          <div class="git-diff-header">
            <span>Berkas: <code>${this.activeDiffFile === 'authMiddleware' ? 'app/Http/Middleware/AuthenticateWithSanctum.php' : 'routes/api.php'}</code></span>
            <span>Target: <code>staging</code></span>
          </div>

          <div class="git-diff-lines">
            ${this.activeDiffFile === 'authMiddleware' ? `
              <div class="git-diff-line hunk">@@ -18,12 +18,24 @@ class AuthenticateWithSanctum</div>
              <div class="git-diff-line">   public function handle(Request $request, Closure $next, ...$guards)</div>
              <div class="git-diff-line">   {</div>
              <div class="git-diff-line del">-      // Legacy session bearer token validation</div>
              <div class="git-diff-line del">-      if (!auth()->check()) { return response()->json(['error' => 'Unauthorized'], 401); }</div>
              <div class="git-diff-line add">+      // Verifikasi token Sanctum terpusat dengan multi-guard RBAC</div>
              <div class="git-diff-line add">+      $user = auth('sanctum')->user();</div>
              <div class="git-diff-line add">+      if (!$user || !$user->tokenCan('access:library')) {</div>
              <div class="git-diff-line add">+          return response()->json([</div>
              <div class="git-diff-line add">+              'status'  => 'error',</div>
              <div class="git-diff-line add">+              'message' => 'Akses ditolak: Token tidak valid atau hak akses tidak memadai'</div>
              <div class="git-diff-line add">+          ], 403);</div>
              <div class="git-diff-line add">+      }</div>
              <div class="git-diff-line add">+      // Enforce rate limiting & audit context</div>
              <div class="git-diff-line add">+      $request->attributes->set('auth_role', $user->role);</div>
              <div class="git-diff-line">       return $next($request);</div>
              <div class="git-diff-line">   }</div>
            ` : `
              <div class="git-diff-line hunk">@@ -44,8 +44,14 @@ Route::prefix('v1')->group(function () {</div>
              <div class="git-diff-line del">- Route::get('/peminjaman', [LoanController::class, 'index']);</div>
              <div class="git-diff-line add">+ Route::middleware(['auth:sanctum', 'role:pustakawan'])->group(function () {</div>
              <div class="git-diff-line add">+     Route::get('/peminjaman', [LoanController::class, 'index']);</div>
              <div class="git-diff-line add">+     Route::post('/peminjaman/setujui', [LoanController::class, 'approve']);</div>
              <div class="git-diff-line add">+ });</div>
            `}
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" id="requestChangesBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px;">
            Minta Revisi Kode
          </button>
          <button type="button" id="approveDiffBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; background: #059669; border-color: #059669;">
            ✓ Berikan Approval (Review Passed)
          </button>
        </div>

      </div>
    `;
  }

  renderStudioBotTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; border-radius: 6px; background: #24a1de; color: white; display: flex; align-items: center; justify-content: center;">
              ${Icons.telegram('', 14)}
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">@ProjectManjerBot &amp; Sentry Telemetry</div>
              <div style="font-size: 11px; color: #64748b;">Notifikasi real-time terdistribusi ke grup engineering</div>
            </div>
          </div>
          <span class="git-status-badge">
            <span class="git-status-dot"></span>
            <span>Live 98ms</span>
          </span>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-weight: 700; color: #24a1de;">[Telegram]</span>
            <div style="color: #334155;">
              <strong>🔔 Pull Request Baru #14</strong> dibuka oleh <strong>Jaka (Backend Dev)</strong>: <code>[Backend] Centralized JWT Sanctum Authentication</code>. 6/6 Checks CI lolos. Menunggu review lead.
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 8px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <span style="font-weight: 700; color: #7e22ce;">[Sentry]</span>
            <div style="color: #334155;">
              Release tracking tag <code>v1.0.4-staging</code> dikaitkan dengan commit <code>4d19fa2</code>. Zero crash terdeteksi selama 24 jam terakhir.
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 8px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <span style="font-weight: 700; color: #059669;">[Webhook]</span>
            <div style="color: #334155;">
              Endpoint <code>https://api.softwarehouse.dev/api/webhooks/github</code> merespon <strong>HTTP 200 OK</strong> (latensi 42ms).
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" id="pingWebhookStudioBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px;">
            Kirim Uji Ping Webhook
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Tab 1: Manajemen Cabang & Pull Requests
  // =========================================================================
  renderBranchesTab(activeProject, branches, teamMembers) {
    return `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Branch Controls Bar (Search, Filter, View Toggle, Create) -->
        <div class="git-branch-toolbar">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1;">
            <div class="git-branch-search-box">
              <span class="git-branch-search-icon">${Icons.search('', 14)}</span>
              <input type="text" id="branchSearchInput" placeholder="Cari nama cabang, modul atau pengembang..." value="${this.branchSearchQuery}" />
            </div>

            <div class="git-branch-filter-group">
              <button type="button" class="git-filter-pill ${this.branchTypeFilter === 'all' ? 'active' : ''}" data-filter="all">Semua Cabang (${activeProject.branches?.length || 0})</button>
              <button type="button" class="git-filter-pill ${this.branchTypeFilter === 'protected' ? 'active' : ''}" data-filter="protected">Protected / Main</button>
              <button type="button" class="git-filter-pill ${this.branchTypeFilter === 'feature' ? 'active' : ''}" data-filter="feature">Fitur (Task)</button>
              <button type="button" class="git-filter-pill ${this.branchTypeFilter === 'epic' ? 'active' : ''}" data-filter="epic">Epics Modul</button>
              <button type="button" class="git-filter-pill ${this.branchTypeFilter === 'hotfix' ? 'active' : ''}" data-filter="hotfix">Hotfix Bug</button>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="git-view-switcher">
              <button type="button" class="git-view-btn ${this.branchViewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Tampilan Card Grid">
                ${Icons.grid('', 13)}
                <span>Grid</span>
              </button>
              <button type="button" class="git-view-btn ${this.branchViewMode === 'table' ? 'active' : ''}" data-view="table" title="Tampilan Tabel">
                ${Icons.listTodo('', 13)}
                <span>Tabel</span>
              </button>
            </div>

            <button type="button" id="openAddBranchBtn2" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.plus('', 13)}
              <span>+ Buat Cabang Baru</span>
            </button>
          </div>
        </div>

        <!-- Render Branches: Grid vs Table -->
        ${this.branchViewMode === 'grid' ? this.renderBranchGrid(branches, teamMembers) : this.renderBranchTable(branches, teamMembers)}

      </div>
    `;
  }

  renderBranchGrid(branches, teamMembers) {
    if (!branches || branches.length === 0) {
      return `
        <div style="background: white; border-radius: 12px; padding: 40px; text-align: center; border: 1px dashed #cbd5e1;">
          <div style="font-size: 32px; color: #94a3b8; margin-bottom: 10px;">🌿</div>
          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Tidak Ada Cabang Git Ditemukan</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Coba sesuaikan kata kunci pencarian atau buat cabang baru untuk mulai pengerjaan kode.</p>
          <button type="button" id="openAddBranchEmptyBtn" class="finance-btn-primary" style="font-size: 12px; padding: 8px 18px;">
            + Buat Cabang Git Pertama
          </button>
        </div>
      `;
    }

    return `
      <div class="git-branches-grid">
        ${branches.map((b) => {
          const isProtected = b.name === 'main' || b.name === 'staging' || b.isDefault;
          const isDefault = b.isDefault === true || b.name === 'main';
          const isHotfix = (b.name || '').startsWith('fix') || (b.name || '').startsWith('hotfix');
          const assignee = teamMembers.find((m) => m.id === b.assigneeId) || {
            name: isDefault ? 'Sistem DevOps' : 'Tim Pengembang',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
          };

          return `
            <div class="git-branch-card ${isProtected ? 'is-protected' : ''} ${isDefault ? 'is-default' : ''}">
              
              <div class="git-branch-card-header">
                <div class="git-branch-name-wrap">
                  <span style="color: ${isDefault ? '#10b981' : isProtected ? '#4338ca' : isHotfix ? '#ef4444' : '#64748b'};">
                    ${Icons.gitBranch('', 16)}
                  </span>
                  <span class="git-branch-name">${b.name}</span>
                  <button type="button" class="git-branch-copy-btn copy-branch-cmd-btn" data-branch="${b.name}" title="Salin Perintah Git Checkout">
                    ${Icons.copy('', 12)}
                  </button>
                </div>

                <div>
                  ${isDefault ? `
                    <span class="git-branch-tag-default">
                      ${Icons.star('', 10)} Default Branch
                    </span>
                  ` : isProtected ? `
                    <span class="git-branch-tag-protected">
                      ${Icons.lock('', 10)} Protected
                    </span>
                  ` : isHotfix ? `
                    <span class="git-branch-tag-feature" style="background: #fef2f2; color: #dc2626; border-color: #fecaca;">
                      Hotfix
                    </span>
                  ` : `
                    <span class="git-branch-tag-feature">
                      Feature Branch
                    </span>
                  `}
                </div>
              </div>

              <div class="git-branch-module-name">
                ${b.moduleName || 'Modul Pengembangan Terkait'}
              </div>

              <div class="git-branch-meta-row">
                <div class="git-commit-badge" title="Commit Hash Terakhir">
                  ${Icons.gitCommit('', 11)}
                  <span>${b.commitHash || '9a10bf3'}</span>
                </div>

                <div class="git-branch-updated">
                  ${Icons.clock('', 11)}
                  <span>Diperbarui ${this.formatTimeAgo(b.lastUpdated)}</span>
                </div>
              </div>

              <div class="git-branch-card-footer">
                <div class="git-branch-assignee">
                  <img src="${assignee.avatar}" alt="${assignee.name}" class="git-branch-avatar" />
                  <span style="font-weight: 600;">${assignee.name}</span>
                </div>

                <div class="git-branch-actions">
                  <span class="git-branch-ci-status">
                    <i class="fi fi-rr-check" style="font-size: 10px;"></i>
                    <span>Passing</span>
                  </span>

                  ${!isDefault && !isProtected ? `
                    <button type="button" class="delete-branch-btn" data-branch="${b.name}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Hapus Cabang">
                      ${Icons.trash('', 13)}
                    </button>
                  ` : ''}

                  <button type="button" class="create-pr-for-branch-btn finance-btn-secondary" data-branch="${b.name}" style="font-size: 10px; padding: 4px 8px;">
                    ${Icons.gitPullRequest('', 11)}
                    <span>Buka PR</span>
                  </button>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderBranchTable(branches, teamMembers) {
    return `
      <div class="git-table-wrapper">
        <table class="git-branch-table">
          <thead>
            <tr>
              <th>Nama Cabang Git</th>
              <th>Status Proteksi</th>
              <th>Commit Hash</th>
              <th>Modul Terkait</th>
              <th>Assignee (PIC)</th>
              <th>CI/CD Pipeline</th>
              <th>Terakhir Diperbarui</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${branches.map((b) => {
              const isProtected = b.name === 'main' || b.name === 'staging' || b.isDefault;
              const isDefault = b.isDefault === true || b.name === 'main';
              const assignee = teamMembers.find((m) => m.id === b.assigneeId) || {
                name: isDefault ? 'Sistem DevOps' : 'Tim Pengembang',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
              };

              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="color: ${isDefault ? '#10b981' : isProtected ? '#4338ca' : '#64748b'};">
                        ${Icons.gitBranch('', 14)}
                      </span>
                      <strong style="font-family: var(--font-mono, monospace); font-size: 12px; color: #0f172a;">${b.name}</strong>
                      <button type="button" class="git-branch-copy-btn copy-branch-cmd-btn" data-branch="${b.name}" title="Salin Perintah Git Checkout">
                        ${Icons.copy('', 11)}
                      </button>
                    </div>
                  </td>
                  <td>
                    ${isDefault ? `
                      <span class="git-branch-tag-default">${Icons.star('', 9)} Default</span>
                    ` : isProtected ? `
                      <span class="git-branch-tag-protected">${Icons.lock('', 9)} Protected</span>
                    ` : `
                      <span class="git-branch-tag-feature">Feature</span>
                    `}
                  </td>
                  <td>
                    <span class="git-commit-badge">${Icons.gitCommit('', 11)} ${b.commitHash || '9a10bf3'}</span>
                  </td>
                  <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${b.moduleName || '-'}
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <img src="${assignee.avatar}" alt="${assignee.name}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;" />
                      <span style="font-size: 11px; font-weight: 600;">${assignee.name}</span>
                    </div>
                  </td>
                  <td>
                    <span class="git-branch-ci-status"><i class="fi fi-rr-check"></i> Passed</span>
                  </td>
                  <td style="font-size: 11px; color: #64748b;">
                    ${this.formatTimeAgo(b.lastUpdated)}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                      <button type="button" class="copy-branch-cmd-btn finance-btn-secondary" data-branch="${b.name}" style="font-size: 10px; padding: 4px 8px;">
                        Git CLI
                      </button>
                      <button type="button" class="create-pr-for-branch-btn finance-btn-primary" data-branch="${b.name}" style="font-size: 10px; padding: 4px 8px;">
                        Buka PR
                      </button>
                      ${!isDefault && !isProtected ? `
                        <button type="button" class="delete-branch-btn" data-branch="${b.name}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Hapus Cabang">
                          ${Icons.trash('', 12)}
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // =========================================================================
  // Tab 2: Autentikasi & Konfigurasi API
  // =========================================================================
  renderConfigTab(settings) {
    return `
      <div class="git-config-grid">
        
        <!-- Kolom Kiri: Autentikasi & Token API -->
        <div class="git-config-card">
          <div class="git-config-card-header">
            <div>
              <h2>1. Autentikasi &amp; Token API GitHub</h2>
              <p>Gunakan Personal Access Token (PAT Classic) atau GitHub App OAuth.</p>
            </div>
            <button type="button" id="testConnectionBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
              ${this.isTestingConn ? Icons.refresh('animate-spin', 12) : Icons.link('', 12)}
              <span>${this.isTestingConn ? 'Menguji API...' : 'Uji Koneksi API'}</span>
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="git-form-group">
              <label>Metode Autentikasi</label>
              <select id="authTypeSelect" class="git-input">
                <option value="pat" ${settings.authType === 'pat' ? 'selected' : ''}>Personal Access Token (PAT Classic)</option>
                <option value="github_app" ${settings.authType === 'github_app' ? 'selected' : ''}>GitHub App (Fine-grained OAuth)</option>
              </select>
            </div>

            <div class="git-form-group">
              <label>API Token / Secret Key</label>
              <div style="display: flex; gap: 8px;">
                <input id="apiKeyInput" type="${this.showApiKey ? 'text' : 'password'}" value="${settings.apiKey || 'ghp_9k2L8vM14pQxW3zT5aY7eR6uI0oP8sD39aF'}" class="git-input git-input-mono" style="flex: 1;" />
                <button type="button" id="toggleShowKeyBtn" class="finance-btn-secondary" style="padding: 8px 12px;">
                  ${this.showApiKey ? Icons.eye('', 14) : Icons.lock('', 14)}
                </button>
              </div>
            </div>

            <!-- Indicator Test Latency & Scopes -->
            <div style="padding: 12px 14px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #166534;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700;">
                  <i class="fi fi-rr-check" style="margin-right: 4px;"></i> Token Terverifikasi
                </span>
                <span style="font-family: var(--font-mono, monospace);">Latency: ${this.connectionStatus.latencyMs}ms</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; color: #15803d;">
                <span>Rate-Limit GitHub API:</span>
                <strong>${this.connectionStatus.rateLimitRemaining} / 5,000 requests</strong>
              </div>
              <div style="font-size: 10px; color: #166534; font-family: var(--font-mono, monospace); margin-top: 2px;">
                Scopes: ${this.connectionStatus.scopes.join(', ')}
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Otomasi Naming & Prefixes -->
        <div class="git-config-card">
          <div class="git-config-card-header">
            <div>
              <h2>2. Otomasi Penamaan &amp; Provisioning Cabang</h2>
              <p>Pengaturan prefix branch otomatis saat sprint dimulai atau tiket dibuat.</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="git-form-group">
                <label>Organisasi GitHub</label>
                <input id="orgNameInput" type="text" class="git-input" value="${settings.organization || 'agensi-software-house'}" />
              </div>
              <div class="git-form-group">
                <label>Bot Automation Actor</label>
                <input id="botAccountInput" type="text" class="git-input" value="${settings.accountName || 'agensi-tech-bot'}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding-top: 4px;">
              <div class="git-form-group">
                <label>Prefix Epic Modul</label>
                <input id="prefixEpicInput" type="text" class="git-input git-input-mono" value="${settings.branchPrefixEpic || 'epic/'}" />
              </div>
              <div class="git-form-group">
                <label>Prefix Fitur (Task)</label>
                <input id="prefixFeatureInput" type="text" class="git-input git-input-mono" value="${settings.branchPrefixFeature || 'feat/'}" />
              </div>
              <div class="git-form-group">
                <label>Prefix Hotfix Bug</label>
                <input id="prefixFixInput" type="text" class="git-input git-input-mono" value="${settings.branchPrefixFix || 'fix/'}" />
              </div>
            </div>

            <div style="background: #f8fafc; border-radius: 8px; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 11px; color: #475569;">
              <strong style="color: #0f172a;">Contoh Pola Cabang yang Digenerate:</strong><br />
              <code style="color: #4338ca; font-weight: 700;">epic/lib-101-katalog-buku</code><br />
              <code style="color: #059669; font-weight: 700;">feat/lib-116-jwt-sanctum-auth</code><br />
              <code style="color: #dc2626; font-weight: 700;">fix/lib-204-double-booking-atomic-lock</code>
            </div>
          </div>
        </div>

        <!-- Kolom Bawah Lebar Penuh: Aturan Proteksi Branch -->
        <div class="git-config-card" style="grid-column: 1 / -1;">
          <div class="git-config-card-header">
            <div>
              <h2>3. Aturan Proteksi Branch (Branch Protection Rules)</h2>
              <p>Mencegah direct push ke branch staging dan production tanpa persetujuan tim.</p>
            </div>
            <button type="button" id="saveAllSettingsBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px;">
              Simpan Konfigurasi
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
            <label class="git-checkbox-label">
              <input id="enforceProtCheck" type="checkbox" ${settings.enforceBranchProtection !== false ? 'checked' : ''} />
              <div>
                <strong style="color: #0f172a; display: block;">Enforce Branch Protection</strong>
                <span style="font-size: 11px; color: #64748b;">Kunci branch <code style="color: #4338ca; font-weight: bold;">main</code> &amp; <code style="color: #4338ca; font-weight: bold;">staging</code> dari push paksa (force push).</span>
              </div>
            </label>

            <label class="git-checkbox-label">
              <input id="requireReviewCheck" type="checkbox" ${settings.requireReviews !== false ? 'checked' : ''} />
              <div>
                <strong style="color: #0f172a; display: block;">Require Pull Request Reviews</strong>
                <span style="font-size: 11px; color: #64748b;">Wajib minimal 1 approval Tech Lead / QA sebelum diizinkan merge.</span>
              </div>
            </label>

            <label class="git-checkbox-label">
              <input id="requireChecksCheck" type="checkbox" ${settings.requireStatusChecks !== false ? 'checked' : ''} />
              <div>
                <strong style="color: #0f172a; display: block;">Require Status Checks (CI/CD)</strong>
                <span style="font-size: 11px; color: #64748b;">Semua unit test regression dan docker build wajib lolos 100%.</span>
              </div>
            </label>

            <label class="git-checkbox-label">
              <input type="checkbox" checked />
              <div>
                <strong style="color: #0f172a; display: block;">Dismiss Stale Approvals</strong>
                <span style="font-size: 11px; color: #64748b;">Otomatis reset persetujuan PR saat ada commit baru yang di-push.</span>
              </div>
            </label>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // Tab 3: Collaborators & Hak Akses
  // =========================================================================
  renderCollaboratorsTab(teamMembers) {
    return `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        
        <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">Collaborators &amp; Hak Akses Repositori</h2>
            <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
              Manajemen permission level (Admin, Write, Read) untuk setiap personil engineering yang terdaftar.
            </p>
          </div>

          <button type="button" id="openAddUserBtn" class="finance-btn-primary" style="font-size: 12px; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.userPlus('', 14)}
            <span>+ Tambah Developer Baru</span>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${teamMembers.map((m) => {
            const githubHandle = m.githubUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-dev';
            const role = m.role || 'Developer';
            const isLead = role.includes('Manajer') || role.includes('Lead');
            const permission = isLead ? 'Admin / Maintainer' : 'Write (Developer)';

            return `
              <div class="git-collaborator-card">
                <div class="git-collab-user-info">
                  <img src="${m.avatar}" alt="${m.name}" class="git-collab-avatar" />
                  <div>
                    <div class="git-collab-name">${m.name}</div>
                    <div class="git-collab-meta">
                      <span class="git-collab-badge">@${githubHandle}</span>
                      <span>·</span>
                      <span style="font-weight: 600; color: #4338ca;">${role}</span>
                      <span>·</span>
                      <span>Kapasitas: ${m.capacity || 40}h/minggu</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span style="font-size: 11px; font-family: var(--font-mono, monospace); font-weight: 700; padding: 4px 10px; border-radius: 6px; background: white; border: 1px solid #cbd5e1; color: #334155;">
                    ${permission}
                  </span>

                  <span style="font-size: 11px; color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                    <i class="fi fi-rr-check"></i>
                    <span>2FA Enforced</span>
                  </span>

                  <span style="font-size: 11px; color: #059669; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                    <span class="git-status-dot" style="background: #10b981;"></span>
                    <span>Synced</span>
                  </span>

                  <button type="button" class="remove-collab-btn" data-id="${m.id}" data-name="${m.name}" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;" title="Cabut Izin Akses">
                    ${Icons.trash('', 14)}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  // =========================================================================
  // Tab 4: Webhook Real-time & Telegram Bot
  // =========================================================================
  renderWebhooksTab(settings) {
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        <!-- Sentry & CI/CD Webhook Card -->
        <div class="git-config-card">
          <div class="git-config-card-header">
            <div>
              <h2>1. Webhook CI/CD &amp; Sentry Ingestion</h2>
              <p>Endpoint penerima webhook untuk auto-triage AI dan runner status.</p>
            </div>
            <button type="button" id="pingWebhookBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px;">
              Ping Webhook
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="git-form-group">
              <label>Webhook Payload URL</label>
              <input id="webhookUrlInput" type="text" class="git-input git-input-mono" value="${settings.webhookUrl || 'https://api.softwarehouse.dev/api/webhooks/github'}" />
            </div>

            <div class="git-form-group">
              <label>Webhook Secret Key</label>
              <input id="webhookSecretInput" type="text" class="git-input git-input-mono" value="${settings.webhookSecret || 'whsec_98fbc1a284e9411d332cba91b'}" />
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding-top: 4px;">
              <strong>Trigger Event Aktif:</strong>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span class="git-collab-badge">push</span>
                <span class="git-collab-badge">pull_request</span>
                <span class="git-collab-badge">workflow_run</span>
                <span class="git-collab-badge">issues</span>
                <span class="git-collab-badge">release</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Telegram Bot Official Card (@ProjectManjerBot) -->
        <div class="git-config-card">
          <div class="git-config-card-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #24a1de; color: white; display: flex; align-items: center; justify-content: center;">
                ${Icons.telegram('', 18)}
              </div>
              <div>
                <h2>2. Telegram Bot API Resmi (@ProjectManjerBot)</h2>
                <p>Notifikasi commit, approval PR &amp; laporan intake (PRD v3.0).</p>
              </div>
            </div>
            <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: #ebf5fb; color: #24a1de; border: 1px solid #bce2f7;">
              Active 98ms
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="git-form-group">
              <label>Bot Username Resmi</label>
              <input type="text" readonly class="git-input" value="@ProjectManjerBot" style="font-weight: 700; color: #0284c7; background: #f8fafc;" />
            </div>

            <div class="git-form-group">
              <label>Telegram Webhook Callback</label>
              <input type="text" readonly class="git-input git-input-mono" value="https://api.projectmanjer.id/api/v1/telegram/webhook" style="background: #f8fafc;" />
            </div>

            <div style="padding: 12px 14px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #166534;">
              <div>
                <strong style="display: block;">Perintah Terdaftar:</strong>
                <code>/help</code>, <code>/status</code>, <code>/human</code>, <code>/unlink</code>
              </div>
              <button type="button" id="openTelegramSimBtn" class="finance-btn-secondary" style="font-size: 10px; padding: 6px 12px; background: white;">
                Buka Simulator Bot
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // Tab 5: Riwayat Commit & Audit Log
  // =========================================================================
  renderCommitsTab(activeProject) {
    const commits = [
      {
        hash: '9a10bf3',
        message: 'release(prod): tag v1.0.4-rc library microservice stable release',
        author: 'Asisyah',
        role: 'Project Manajer',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        branch: 'main',
        time: '32 menit lalu'
      },
      {
        hash: '8b22cf1',
        message: 'merge: PR #13 merge feature/katalog-microservice into staging',
        author: 'Azi',
        role: 'Full stack Lead',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        branch: 'staging',
        time: '1 jam lalu'
      },
      {
        hash: '4d19fa2',
        message: 'feat(auth): implement centralized sanctum jwt guard & rbac middleware',
        author: 'Jaka',
        role: 'Backend Dev',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        branch: 'feature/sanctum-rbac-auth',
        time: '2 jam lalu'
      },
      {
        hash: '3c88ad1',
        message: 'feat(frontend): responsive book card grid & dark mode styling',
        author: 'Aldyana',
        role: 'Frontend Dev',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
        branch: 'feature/react-portal-opac',
        time: '3 jam lalu'
      },
      {
        hash: '6f77ab4',
        message: 'chore(devops): docker-compose microservices mesh configuration',
        author: 'Parhan',
        role: 'QA Engineer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        branch: 'feature/api-gateway-docker',
        time: '5 jam lalu'
      }
    ];

    return `
      <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
          <div>
            <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">Audit Log &amp; Riwayat Commit Terakhir</h2>
            <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
              Stream aktivitas commit real-time dari seluruh cabang di repositori <code>${activeProject.repoUrl || 'repo'}</code>.
            </p>
          </div>
          <button type="button" id="refreshCommitsBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.refresh('', 12)}
            <span>Refresh Feed</span>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${commits.map((c) => `
            <div class="git-commit-item">
              <img src="${c.avatar}" alt="${c.author}" class="git-commit-avatar" />
              <div class="git-commit-content">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                  <span class="git-commit-msg">${c.message}</span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="git-commit-badge">${Icons.gitCommit('', 11)} ${c.hash}</span>
                    <button type="button" class="git-branch-copy-btn copy-hash-btn" data-hash="${c.hash}" title="Salin Commit Hash">
                      ${Icons.copy('', 11)}
                    </button>
                  </div>
                </div>
                <div class="git-commit-meta">
                  <span style="font-weight: 600; color: #0f172a;">${c.author}</span>
                  <span>(${c.role})</span>
                  <span>·</span>
                  <span class="git-collab-badge">${c.branch}</span>
                  <span>·</span>
                  <span style="color: #059669; font-weight: 600;"><i class="fi fi-rr-check"></i> Passed CI</span>
                  <span>·</span>
                  <span>${c.time}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderActiveTabContent(activeProject, branches, settings, teamMembers, tasks, epics) {
    switch (this.activeSubTab) {
      case 'branches':
        return this.renderBranchesTab(activeProject, branches, teamMembers);
      case 'config':
        return this.renderConfigTab(settings);
      case 'collaborators':
        return this.renderCollaboratorsTab(teamMembers);
      case 'webhooks':
        return this.renderWebhooksTab(settings);
      case 'commits':
        return this.renderCommitsTab(activeProject);
      default:
        return this.renderBranchesTab(activeProject, branches, teamMembers);
    }
  }

  // =========================================================================
  // Modal 1: Buat Cabang Baru (Interactive Git Branch Creation)
  // =========================================================================
  renderAddBranchModal(activeProject, branches, teamMembers, tasks, epics) {
    return `
      <div class="git-modal-overlay" id="addBranchModalOverlay">
        <div class="git-modal-box">
          
          <div class="git-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #4338ca;">${Icons.gitBranch('', 18)}</span>
              <h3>Buat Cabang Git Baru (New Branch)</h3>
            </div>
            <button type="button" id="closeAddBranchModalBtn" style="background: none; border: none; cursor: pointer; color: #94a3b8;">
              ${Icons.x('', 16)}
            </button>
          </div>

          <form id="createBranchForm">
            <div class="git-modal-body">
              
              <!-- Source Branch -->
              <div class="git-form-group">
                <label>Bercabang Dari (Source Base Branch) *</label>
                <select id="modalSourceBranchSelect" class="git-input">
                  <option value="staging" selected>staging (Lingkungan QA &amp; Integrasi)</option>
                  <option value="main">main (Production Stable Branch)</option>
                  ${branches.filter(b => b.name !== 'main' && b.name !== 'staging').map((b) => `
                    <option value="${b.name}">${b.name} (${b.commitHash || 'HEAD'})</option>
                  `).join('')}
                </select>
              </div>

              <!-- Branch Prefix Selector -->
              <div class="git-form-group">
                <label>Prefix Standar Konvensi Cabang</label>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button type="button" class="branch-prefix-chip git-filter-pill active" data-prefix="feat/">feat/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="fix/">fix/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="epic/">epic/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="hotfix/">hotfix/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="chore/">chore/</button>
                </div>
              </div>

              <!-- Branch Name -->
              <div class="git-form-group">
                <label>Nama Cabang Git *</label>
                <div style="display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: white;">
                  <span id="modalPrefixDisplay" style="padding: 8px 12px; background: #f8fafc; font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 700; color: #4338ca; border-right: 1px solid #cbd5e1;">
                    feat/
                  </span>
                  <input id="modalBranchNameInput" type="text" required placeholder="lib-120-optimasi-query-elastic" style="flex: 1; border: none; padding: 8px 12px; font-size: 12px; font-family: var(--font-mono, monospace); outline: none;" />
                </div>
                <span style="font-size: 11px; color: #64748b;">Hanya gunakan huruf kecil, angka, dan tanda hubung (-).</span>
              </div>

              <!-- Module / Task Association -->
              <div class="git-form-group">
                <label>Kaitkan dengan Modul / Tiket Epics</label>
                <select id="modalModuleSelect" class="git-input">
                  <option value="">-- Pilih Tiket atau Modul Terkait --</option>
                  ${epics.map((e) => `
                    <option value="Epic: ${e.name}">Epics: ${e.name}</option>
                  `).join('')}
                  ${tasks.map((t) => `
                    <option value="${t.key}: ${t.title}">Tiket: [${t.key}] ${t.title.length > 40 ? t.title.substring(0, 40) + '...' : t.title}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Assignee -->
              <div class="git-form-group">
                <label>Pengembang Utama (Assignee PIC)</label>
                <select id="modalAssigneeSelect" class="git-input">
                  ${teamMembers.map((m) => `
                    <option value="${m.id}">${m.name} (${m.role})</option>
                  `).join('')}
                </select>
              </div>

              <!-- CLI Snippet Live Preview -->
              <div style="background: #0f172a; border-radius: 6px; padding: 10px 12px; font-family: var(--font-mono, monospace); font-size: 11px; color: #38bdf8;">
                <span style="color: #64748b;"># Perintah otomatis git checkout:</span><br />
                <span id="modalCliPreview">git checkout -b feat/lib-120-optimasi-query-elastic origin/staging</span>
              </div>

            </div>

            <div class="git-modal-footer">
              <button type="button" id="cancelAddBranchBtn" class="finance-btn-secondary" style="font-size: 12px; padding: 6px 14px;">Batal</button>
              <button type="submit" class="finance-btn-primary" style="font-size: 12px; padding: 6px 18px;">
                Buat &amp; Publikasikan Cabang
              </button>
            </div>
          </form>

        </div>
      </div>
    `;
  }

  // =========================================================================
  // Modal 2: Tambah Collaborator
  // =========================================================================
  renderAddUserModal() {
    return `
      <div class="git-modal-overlay" id="addUserModalOverlay">
        <div class="git-modal-box">
          <div class="git-modal-header">
            <h3>Tambah GitHub Collaborator Baru</h3>
            <button type="button" id="closeAddUserModalBtn" style="background: none; border: none; cursor: pointer; color: #94a3b8;">
              ${Icons.x('', 16)}
            </button>
          </div>

          <form id="addUserForm">
            <div class="git-modal-body">
              <div class="git-form-group">
                <label>Nama Lengkap *</label>
                <input id="newUserNameInput" type="text" required placeholder="Contoh: Budi Santoso" class="git-input" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="git-form-group">
                  <label>GitHub Username *</label>
                  <input id="newUserGithubInput" type="text" required placeholder="budisantoso-dev" class="git-input" />
                </div>

                <div class="git-form-group">
                  <label>Role Spesialisasi</label>
                  <select id="newUserRoleSelect" class="git-input">
                    <option value="Backend Dev">Backend Dev</option>
                    <option value="Frontend Dev">Frontend Dev</option>
                    <option value="Full stack">Full stack</option>
                    <option value="QA Tester">QA Tester</option>
                    <option value="Project Manajer">Project Manajer</option>
                  </select>
                </div>
              </div>

              <div class="git-form-group">
                <label>Tingkat Izin Akses (Permission Level)</label>
                <select id="newUserPermSelect" class="git-input">
                  <option value="write">Write Access (Dapat push ke branch fitur)</option>
                  <option value="admin">Admin / Maintainer (Dapat merge ke main &amp; staging)</option>
                  <option value="read">Read Only (Hanya review dan triage)</option>
                </select>
              </div>
            </div>

            <div class="git-modal-footer">
              <button type="button" id="cancelAddUserBtn" class="finance-btn-secondary" style="font-size: 12px; padding: 6px 14px;">Batal</button>
              <button type="submit" class="finance-btn-primary" style="font-size: 12px; padding: 6px 18px;">
                Kirim Undangan GitHub
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Modal 3: Konfirmasi Merge PR ke Staging
  // =========================================================================
  renderMergePrModal() {
    return `
      <div class="git-modal-overlay" id="mergePrModalOverlay">
        <div class="git-modal-box">
          <div class="git-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #059669;">${Icons.checkSquare('', 18)}</span>
              <h3>Konfirmasi Penggabungan (Squash &amp; Merge)</h3>
            </div>
            <button type="button" id="closeMergePrModalBtn" style="background: none; border: none; cursor: pointer; color: #94a3b8;">
              ${Icons.x('', 16)}
            </button>
          </div>

          <div class="git-modal-body">
            <div style="padding: 12px 14px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; font-size: 12px; color: #065f46;">
              <strong>✓ Semua Syarat Proteksi Terpenuhi:</strong>
              <ul style="margin: 6px 0 0 18px; padding: 0;">
                <li>6/6 Automated status checks CI/CD lolos 100%</li>
                <li>Diff perubahan +348 / -42 baris siap digabungkan</li>
                <li>Tidak ada konflik merge dengan staging</li>
              </ul>
            </div>

            <div class="git-form-group">
              <label>Cabang Asal ➔ Cabang Tujuan</label>
              <div style="font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 700; color: #0f172a; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #cbd5e1;">
                feature/sanctum-rbac-auth ➔ staging
              </div>
            </div>

            <div class="git-form-group">
              <label>Pesan Commit Gabungan (Squash Commit Title)</label>
              <input id="mergeCommitTitle" type="text" class="git-input git-input-mono" value="merge(auth): PR #14 Centralized JWT Sanctum Authentication & RBAC (#116)" />
            </div>

            <div class="git-form-group">
              <label class="git-checkbox-label">
                <input type="checkbox" id="deleteBranchAfterMergeCheck" checked />
                <div>
                  <strong style="color: #0f172a;">Hapus cabang fitur setelah berhasil di-merge</strong>
                  <span style="font-size: 11px; color: #64748b; display: block;">Mencegah penumpukan cabang lama (stale branches) di repositori.</span>
                </div>
              </label>
            </div>
          </div>

          <div class="git-modal-footer">
            <button type="button" id="cancelMergePrBtn" class="finance-btn-secondary" style="font-size: 12px; padding: 6px 14px;">Batal</button>
            <button type="button" id="confirmExecuteMergeBtn" class="finance-btn-primary" style="font-size: 12px; padding: 6px 18px; background: #059669; border-color: #059669;">
              Konfirmasi Squash &amp; Merge
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Modal 4: Panduan CLI Git Developer
  // =========================================================================
  renderCliGuideModal() {
    return `
      <div class="git-modal-overlay" id="cliGuideModalOverlay">
        <div class="git-modal-box" style="max-width: 620px;">
          <div class="git-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #4338ca;">${Icons.terminal('', 18)}</span>
              <h3>Panduan Lengkap CLI Git ASTACODE</h3>
            </div>
            <button type="button" id="closeCliGuideModalBtn" style="background: none; border: none; cursor: pointer; color: #94a3b8;">
              ${Icons.x('', 16)}
            </button>
          </div>

          <div class="git-modal-body" style="font-size: 12px; color: #334155; max-height: 440px; overflow-y: auto;">
            <p style="margin: 0 0 10px 0;">Standar alur kerja Git yang berlaku untuk seluruh pengembang di agensi:</p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="background: #0f172a; border-radius: 8px; padding: 10px 14px; font-family: var(--font-mono, monospace); font-size: 11px; color: #f8fafc;">
                <span style="color: #38bdf8;"># 1. Mulai Fitur Baru dari Staging</span><br />
                git fetch origin<br />
                git checkout staging<br />
                git pull origin staging<br />
                git checkout -b feat/nama-tiket-fitur
              </div>

              <div style="background: #0f172a; border-radius: 8px; padding: 10px 14px; font-family: var(--font-mono, monospace); font-size: 11px; color: #f8fafc;">
                <span style="color: #38bdf8;"># 2. Format Commit Pesan Konvensional</span><br />
                git add .<br />
                git commit -m "feat(modul): deskripsi perubahan jelas"<br />
                git commit -m "fix(modul): perbaikan bug crash"
              </div>

              <div style="background: #0f172a; border-radius: 8px; padding: 10px 14px; font-family: var(--font-mono, monospace); font-size: 11px; color: #f8fafc;">
                <span style="color: #38bdf8;"># 3. Sinkronisasi Rebase sebelum PR</span><br />
                git fetch origin<br />
                git rebase origin/staging<br />
                git push -u origin feat/nama-tiket-fitur --force-with-lease
              </div>
            </div>
          </div>

          <div class="git-modal-footer">
            <button type="button" id="closeCliGuideFooterBtn" class="finance-btn-primary" style="font-size: 12px; padding: 6px 18px;">
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Event Attachments
  // =========================================================================
  attachEvents() {
    // Click Delegations
    this.element.addEventListener('click', (e) => {
      
      // 1. Workflow Stepper Steps
      const stepCard = e.target.closest('.git-step-card');
      if (stepCard) {
        const stepNum = parseInt(stepCard.dataset.step, 10);
        if (stepNum) {
          this.activeWorkflowStep = stepNum;
          if (stepNum === 1) this.activeSubTab = 'branches';
          if (stepNum === 2) this.activeSubTab = 'commits';
          if (stepNum === 3) this.activeStudioTab = 'cicd';
          if (stepNum === 4) this.activeStudioTab = 'diff';
          if (stepNum === 5) this.activeSubTab = 'webhooks';
          this.render();
        }
        return;
      }

      // 2. Studio Sub-Tab Switcher
      const studioTabBtn = e.target.closest('.git-studio-tab-btn');
      if (studioTabBtn) {
        const tab = studioTabBtn.dataset.studiotab;
        if (tab && tab !== this.activeStudioTab) {
          this.activeStudioTab = tab;
          this.render();
        }
        return;
      }

      // 3. Switch Diff File (Auth vs Routes)
      if (e.target.closest('#switchDiffAuthBtn')) {
        this.activeDiffFile = 'authMiddleware';
        this.render();
        return;
      }
      if (e.target.closest('#switchDiffRoutesBtn')) {
        this.activeDiffFile = 'routesApi';
        this.render();
        return;
      }

      // 4. View Diff from Studio Toolbar
      if (e.target.closest('#studioViewDiffBtn')) {
        this.activeStudioTab = 'diff';
        this.render();
        return;
      }

      // 5. Rerun CI/CD Pipeline
      if (e.target.closest('#rerunPipelineBtn')) {
        this.isTestingPipeline = true;
        this.activeStudioTab = 'cicd';
        this.render();
        setTimeout(() => {
          this.isTestingPipeline = false;
          this.render();
          store.addToast('success', 'Pipeline CI/CD Lolos 100%!', '6 dari 6 status checks pada branch ' + this.selectedStudioBranch + ' berhasil lulus verifikasi.');
        }, 900);
        return;
      }

      // 6. Open / Close Merge PR Modal
      if (e.target.closest('#openMergePrModalBtn') || e.target.closest('#mergePrBtn')) {
        this.showMergePrModal = true;
        this.render();
        return;
      }
      if (e.target.closest('#closeMergePrModalBtn') || e.target.closest('#cancelMergePrBtn') || e.target.id === 'mergePrModalOverlay') {
        this.showMergePrModal = false;
        this.render();
        return;
      }

      // 7. Confirm Execute Merge PR
      if (e.target.closest('#confirmExecuteMergeBtn')) {
        this.showMergePrModal = false;
        this.prMergedStatus = true;
        this.render();
        store.addToast('success', 'Pull Request #14 Berhasil Di-merge!', 'Cabang feature/sanctum-rbac-auth telah digabungkan ke staging dengan squash commit.');
        return;
      }

      // 8. Open / Close CLI Guide Modal
      if (e.target.closest('#openCliGuideBtn')) {
        this.showCliGuideModal = true;
        this.render();
        return;
      }
      if (e.target.closest('#closeCliGuideModalBtn') || e.target.closest('#closeCliGuideFooterBtn') || e.target.id === 'cliGuideModalOverlay') {
        this.showCliGuideModal = false;
        this.render();
        return;
      }

      // 9. Approve Diff / Request Changes
      if (e.target.closest('#approveDiffBtn')) {
        store.addToast('success', 'Approval Review Disimpan', 'Persetujuan review dari akun Anda telah diverifikasi pada PR #14.');
        return;
      }
      if (e.target.closest('#requestChangesBtn')) {
        store.addToast('info', 'Permintaan Revisi Terkirim', 'Komentar catatan revisi kode telah dikirimkan ke pengembang PIC (Jaka).');
        return;
      }

      // 10. Copy CLI Snippet
      if (e.target.closest('#copyCliSnippetBtn')) {
        const text = `git fetch origin && git checkout ${this.selectedStudioBranch} && git commit -m "feat: updates" && git push origin ${this.selectedStudioBranch}`;
        navigator.clipboard?.writeText(text);
        store.addToast('info', 'Perintah Git CLI Disalin', 'Snippet perintah git telah siap dipaste di terminal Anda.');
        return;
      }

      // 11. Sub-Tab Switcher
      const tabBtn = e.target.closest('.git-tab-btn');
      if (tabBtn) {
        const tab = tabBtn.dataset.tab;
        if (tab && tab !== this.activeSubTab) {
          this.activeSubTab = tab;
          this.render();
        }
        return;
      }

      // 12. Branch Type Filter
      const filterPill = e.target.closest('.git-filter-pill[data-filter]');
      if (filterPill) {
        this.branchTypeFilter = filterPill.dataset.filter;
        this.render();
        return;
      }

      // 13. View Switcher (Grid vs Table)
      const viewBtn = e.target.closest('.git-view-btn');
      if (viewBtn) {
        this.branchViewMode = viewBtn.dataset.view;
        this.render();
        return;
      }

      // 14. Open Add Branch Modal
      if (e.target.closest('#openAddBranchBtn') || e.target.closest('#openAddBranchBtn2') || e.target.closest('#openAddBranchEmptyBtn')) {
        this.showAddBranchModal = true;
        this.render();
        return;
      }

      // 15. Close Add Branch Modal
      if (e.target.closest('#closeAddBranchModalBtn') || e.target.closest('#cancelAddBranchBtn') || e.target.id === 'addBranchModalOverlay') {
        this.showAddBranchModal = false;
        this.render();
        return;
      }

      // 16. Branch Prefix Chip click in modal
      const prefixChip = e.target.closest('.branch-prefix-chip');
      if (prefixChip) {
        this.element.querySelectorAll('.branch-prefix-chip').forEach(c => c.classList.remove('active'));
        prefixChip.classList.add('active');
        const prefix = prefixChip.dataset.prefix;
        const prefixDisplay = this.element.querySelector('#modalPrefixDisplay');
        if (prefixDisplay) prefixDisplay.textContent = prefix;
        this.updateModalCliPreview();
        return;
      }

      // 17. Open Add User Modal
      if (e.target.closest('#openAddUserBtn')) {
        this.showAddUserModal = true;
        this.render();
        return;
      }

      // 18. Close Add User Modal
      if (e.target.closest('#closeAddUserModalBtn') || e.target.closest('#cancelAddUserBtn') || e.target.id === 'addUserModalOverlay') {
        this.showAddUserModal = false;
        this.render();
        return;
      }

      // 19. Copy Git Clone / Repo URL
      const copyRepoBtn = e.target.closest('#copyRepoUrlBtn');
      if (copyRepoBtn) {
        const url = copyRepoBtn.dataset.url;
        navigator.clipboard?.writeText(`git clone ${url}.git`);
        store.addToast('info', 'Git Clone Disalin', `git clone ${url}.git telah disalin ke clipboard.`);
        return;
      }

      // 20. Copy Branch CLI command
      const copyBranchBtn = e.target.closest('.copy-branch-cmd-btn');
      if (copyBranchBtn) {
        const bName = copyBranchBtn.dataset.branch;
        const cmd = `git checkout -b ${bName} origin/${bName}`;
        navigator.clipboard?.writeText(cmd);
        store.addToast('info', 'Git Checkout Disalin', `${cmd} siap dipaste di terminal.`);
        return;
      }

      // 21. Copy Commit Hash
      const copyHashBtn = e.target.closest('.copy-hash-btn');
      if (copyHashBtn) {
        const hash = copyHashBtn.dataset.hash;
        navigator.clipboard?.writeText(hash);
        store.addToast('info', 'Commit Hash Disalin', `Hash ${hash} disalin ke clipboard.`);
        return;
      }

      // 22. Delete Branch
      const delBranchBtn = e.target.closest('.delete-branch-btn');
      if (delBranchBtn) {
        const bName = delBranchBtn.dataset.branch;
        if (confirm(`Yakin ingin menghapus branch "${bName}"? Tindakan ini tidak dapat dibatalkan.`)) {
          store.deleteBranch(bName);
        }
        return;
      }

      // 23. Create PR for Branch
      const createPrBtn = e.target.closest('.create-pr-for-branch-btn');
      if (createPrBtn) {
        const bName = createPrBtn.dataset.branch;
        this.selectedStudioBranch = bName;
        this.activeWorkflowStep = 4;
        this.activeStudioTab = 'diff';
        this.render();
        store.addToast('info', 'Membuka Form PR', `Membuat Pull Request dari cabang ${bName} menuju staging...`);
        return;
      }

      // 24. Toggle Show Token Key
      if (e.target.closest('#toggleShowKeyBtn')) {
        this.showApiKey = !this.showApiKey;
        this.render();
        return;
      }

      // 25. Test Connection Button
      if (e.target.closest('#testConnectionBtn') || e.target.closest('#testConnHeaderBtn')) {
        this.isTestingConn = true;
        this.render();
        setTimeout(() => {
          this.isTestingConn = false;
          this.connectionStatus = {
            tested: true,
            success: true,
            latencyMs: Math.floor(Math.random() * 40 + 115),
            rateLimitRemaining: 4972,
            scopes: ['repo', 'workflow', 'admin:org', 'write:packages', 'read:user']
          };
          this.render();
          store.addToast('success', 'Koneksi GitHub API Berhasil!', `Response time: ${this.connectionStatus.latencyMs}ms · Rate-limit: ${this.connectionStatus.rateLimitRemaining}/5000`);
        }, 550);
        return;
      }

      // 26. Ping Webhook
      if (e.target.closest('#pingWebhookBtn') || e.target.closest('#pingWebhookStudioBtn')) {
        store.addToast('success', 'Ping Webhook Terkirim', 'Status 200 OK diterima dari endpoint server.');
        return;
      }

      // 27. Open Telegram Bot Simulator
      if (e.target.closest('#openTelegramSimBtn')) {
        store.openIntakeModal();
        return;
      }

      // 28. Remove Collaborator
      const removeCollabBtn = e.target.closest('.remove-collab-btn');
      if (removeCollabBtn) {
        const id = removeCollabBtn.dataset.id;
        const name = removeCollabBtn.dataset.name;
        if (confirm(`Cabut hak akses repositori untuk ${name}?`)) {
          store.deleteTeamMember(id);
        }
        return;
      }

      // 29. Save All Settings
      if (e.target.closest('#saveAllSettingsBtn')) {
        const apiKey = this.element.querySelector('#apiKeyInput')?.value || '';
        const orgName = this.element.querySelector('#orgNameInput')?.value || '';
        const botAccount = this.element.querySelector('#botAccountInput')?.value || '';
        const pEpic = this.element.querySelector('#prefixEpicInput')?.value || 'epic/';
        const pFeat = this.element.querySelector('#prefixFeatureInput')?.value || 'feat/';
        const pFix = this.element.querySelector('#prefixFixInput')?.value || 'fix/';
        const whUrl = this.element.querySelector('#webhookUrlInput')?.value || '';
        const whSec = this.element.querySelector('#webhookSecretInput')?.value || '';

        store.updateGithubSettings({
          apiKey: apiKey.trim(),
          organization: orgName.trim(),
          accountName: botAccount.trim(),
          branchPrefixEpic: pEpic.trim(),
          branchPrefixFeature: pFeat.trim(),
          branchPrefixFix: pFix.trim(),
          webhookUrl: whUrl.trim(),
          webhookSecret: whSec.trim()
        });
        return;
      }

      // 30. Breadcrumb home click
      if (e.target.closest('#gitNavHome')) {
        e.preventDefault();
        store.setActiveTab('project');
        return;
      }
    });

    // Input Search for Branches
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'branchSearchInput') {
        this.branchSearchQuery = e.target.value;
        const state = store.getState();
        const activeProject = store.getActiveProject() || (state.projects && state.projects[0]) || {};
        const branches = activeProject.branches || [];
        const teamMembers = state.teamMembers || [];

        const filtered = branches.filter((b) => {
          const matchSearch = (b.name || '').toLowerCase().includes(this.branchSearchQuery.toLowerCase()) ||
                              (b.moduleName || '').toLowerCase().includes(this.branchSearchQuery.toLowerCase());
          if (!matchSearch) return false;
          if (this.branchTypeFilter === 'protected') return b.name === 'main' || b.name === 'staging' || b.isDefault;
          if (this.branchTypeFilter === 'feature') return (b.name || '').startsWith('feat') || (b.name || '').startsWith('feature');
          if (this.branchTypeFilter === 'epic') return (b.name || '').startsWith('epic');
          if (this.branchTypeFilter === 'hotfix') return (b.name || '').startsWith('fix') || (b.name || '').startsWith('hotfix');
          return true;
        });

        const container = this.element.querySelector('.git-tab-viewport');
        if (container && this.activeSubTab === 'branches') {
          container.innerHTML = this.renderBranchesTab(activeProject, filtered, teamMembers);
        }
      }

      if (e.target.id === 'modalBranchNameInput') {
        this.updateModalCliPreview();
      }
    });

    // Change Dropdowns
    this.element.addEventListener('change', (e) => {
      // Switch Active Project
      if (e.target.id === 'gitProjectSelect') {
        const projectId = e.target.value;
        store.setSelectedProjectId(projectId);
        return;
      }

      // Switch Studio Branch
      if (e.target.id === 'studioBranchSelect') {
        this.selectedStudioBranch = e.target.value;
        this.render();
        return;
      }

      // Modal source branch change
      if (e.target.id === 'modalSourceBranchSelect') {
        this.updateModalCliPreview();
        return;
      }
    });

    // Form Submissions
    this.element.addEventListener('submit', (e) => {
      // Create Branch Form
      if (e.target.id === 'createBranchForm') {
        e.preventDefault();
        const prefixDisplay = this.element.querySelector('#modalPrefixDisplay')?.textContent?.trim() || 'feat/';
        const rawName = this.element.querySelector('#modalBranchNameInput')?.value?.trim() || '';
        const sourceBranch = this.element.querySelector('#modalSourceBranchSelect')?.value || 'staging';
        const moduleName = this.element.querySelector('#modalModuleSelect')?.value || 'Fitur Modul Baru';
        const assigneeId = this.element.querySelector('#modalAssigneeSelect')?.value || 'user-dev-1';

        const cleanName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const fullBranchName = `${prefixDisplay}${cleanName}`;

        if (cleanName) {
          store.addBranch({
            name: fullBranchName,
            sourceBranch,
            moduleName,
            assigneeId,
            isDefault: false
          });

          this.selectedStudioBranch = fullBranchName;
          this.showAddBranchModal = false;
          this.render();
        }
        return;
      }

      // Add Collaborator Form
      if (e.target.id === 'addUserForm') {
        e.preventDefault();
        const name = this.element.querySelector('#newUserNameInput')?.value || '';
        const github = this.element.querySelector('#newUserGithubInput')?.value || '';
        const role = this.element.querySelector('#newUserRoleSelect')?.value || 'Backend Dev';

        if (name.trim()) {
          store.addTeamMember({
            name: name.trim(),
            githubUsername: github.trim(),
            role,
            avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 800000000)}?w=150`,
            capacity: 40,
            activeEpics: []
          });

          this.showAddUserModal = false;
          this.render();
        }
        return;
      }
    });
  }

  updateModalCliPreview() {
    const prefix = this.element.querySelector('#modalPrefixDisplay')?.textContent?.trim() || 'feat/';
    const rawName = this.element.querySelector('#modalBranchNameInput')?.value?.trim() || 'lib-120-optimasi-query-elastic';
    const source = this.element.querySelector('#modalSourceBranchSelect')?.value || 'staging';
    const cleanName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const previewEl = this.element.querySelector('#modalCliPreview');
    if (previewEl) {
      previewEl.textContent = `git checkout -b ${prefix}${cleanName || 'fitur-baru'} origin/${source}`;
    }
  }

  formatTimeAgo(isoString) {
    if (!isoString) return 'Baru saja';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${Math.max(1, diffMins)} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      return `${diffDays} hari lalu`;
    } catch {
      return 'Baru saja';
    }
  }
}
