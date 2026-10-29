/**
 * GithubSettingsView Component (100% Native Vanilla JS ES Module)
 * Enterprise-Grade GitHub & Git Branches Hub for ASTACODE ERP
 * 
 * Sub-Modules:
 * 1. Breadcrumb & Executive Header Bar (Project switch, repo link, sync status, actions)
 * 2. 5 Executive Scorecards (Active Repo, Branches, Open PRs, CI/CD Status, Collaborators)
 * 3. 5 Interactive Sub-Tabs:
 *    - Tab 1: Manajemen Cabang (Git Branches) & Pull Requests (Default)
 *    - Tab 2: Autentikasi & Konfigurasi API GitHub
 *    - Tab 3: Collaborators & Hak Akses Repositori
 *    - Tab 4: Webhook Sentry & Telegram Bot (@ProjectManjerBot)
 *    - Tab 5: Riwayat Commit & Audit Log
 * 4. Interactive Modals:
 *    - Buat Cabang Git Baru (with prefix helpers, source branch, task linking)
 *    - Tambah Collaborator Baru (with role and permission level)
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class GithubSettingsView {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'settings-view';

    // State Navigation & Filters
    this.activeSubTab = 'branches'; // 'branches' | 'config' | 'collaborators' | 'webhooks' | 'commits'
    this.branchSearchQuery = '';
    this.branchTypeFilter = 'all'; // 'all' | 'protected' | 'feature' | 'epic'
    this.branchViewMode = 'grid'; // 'grid' | 'table'

    // Form & Status State
    this.showApiKey = false;
    this.showWebhookSecret = false;
    this.isTestingConn = false;
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

    // New Branch Form
    this.newBranchData = {
      name: '',
      prefix: 'feat/',
      sourceBranch: 'main',
      moduleName: '',
      assigneeId: 'user-dev-1'
    };

    // New User Form
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
      return true;
    });

    const repoUrl = activeProject.repoUrl || 'github.com/softwarehouse/perpustakaan-digital-microservices';
    const protectedCount = branches.filter((b) => b.name === 'main' || b.name === 'staging' || b.isDefault).length;
    const featureCount = branches.length - protectedCount;

    this.element.innerHTML = `
      <div class="git-master-container">
        
        <!-- Breadcrumb & Top Bar -->
        <div class="git-breadcrumb-bar">
          <div class="git-breadcrumb-path">
            <a href="#" id="gitNavHome">Modul Proyek</a>
            <span class="git-breadcrumb-separator">/</span>
            <span style="font-weight: 600; color: #4338ca;">${activeProject.name || 'Proyek ASTACODE'}</span>
            <span class="git-breadcrumb-separator">/</span>
            <span>Pengembangan &amp; AI</span>
            <span class="git-breadcrumb-separator">/</span>
            <span class="git-breadcrumb-current">GitHub &amp; Cabang</span>
          </div>

          <div class="git-header-meta-actions">
            <!-- Project Switcher -->
            <select id="gitProjectSelect" class="git-input" style="width: auto; padding: 4px 10px; font-weight: 600; background: white;">
              ${(state.projects || []).map((p) => `
                <option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>
                  ${p.code} - ${p.name.length > 32 ? p.name.substring(0, 32) + '...' : p.name}
                </option>
              `).join('')}
            </select>

            <span class="git-status-badge">
              <span class="git-status-dot"></span>
              <span>GitHub API Terhubung (${this.connectionStatus.latencyMs}ms)</span>
            </span>

            <button type="button" id="openAddBranchBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.plus('', 13)}
              <span>+ Buat Cabang Baru</span>
            </button>

            <button type="button" id="saveAllSettingsBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.check('', 13)}
              <span>Simpan Konfigurasi</span>
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
                <h1>Repositori &amp; Manajemen Cabang Git</h1>
                <a href="https://${repoUrl}" target="_blank" rel="noopener noreferrer" class="git-repo-pill" title="Buka Repositori di Tab Baru">
                  ${Icons.link('', 12)}
                  <span>${repoUrl}</span>
                  ${Icons.externalLink('', 11)}
                </a>
              </div>
              <p class="git-header-desc">
                Otomatisasi pembuatan branch fitur per modul epics, isolasi patch hotfix bug, proteksi staging/main, integrasi Pull Request &amp; notifikasi bot.
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
              <span>${this.isTestingConn ? 'Menguji...' : 'Cek Status Latency'}</span>
            </button>
          </div>
        </div>

        <!-- 5 Executive KPI Scorecards -->
        <div class="git-kpi-grid">
          
          <!-- KPI 1: Active Repo -->
          <div class="git-kpi-card">
            <div class="git-kpi-top">
              <span class="git-kpi-label">Repository Utama</span>
              <div class="git-kpi-icon-wrap git-kpi-icon-indigo">
                ${Icons.folderGit('', 16)}
              </div>
            </div>
            <div class="git-kpi-value" style="font-size: 15px; font-family: var(--font-mono, monospace);" title="${repoUrl}">
              ${repoUrl.split('/').pop() || 'perpustakaan-microservice'}
            </div>
            <div class="git-kpi-subtext">
              <span style="color: #059669; font-weight: 700;">● Default: main</span> · ${branches.length} branches
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
              <span style="color: #4338ca; font-weight: 700;">${protectedCount} Terproteksi</span> · ${featureCount} Fitur
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
              1 <span style="font-size: 13px; font-weight: 600; color: #64748b;">Menunggu Review</span>
            </div>
            <div class="git-kpi-subtext">
              <span style="color: #b45309; font-weight: 700;">PR #14</span> ➔ staging (LIB-116)
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

          <!-- KPI 5: Collaborator & Hak Akses -->
          <div class="git-kpi-card">
            <div class="git-kpi-top">
              <span class="git-kpi-label">Collaborators Terhubung</span>
              <div class="git-kpi-icon-wrap git-kpi-icon-violet">
                ${Icons.users('', 16)}
              </div>
            </div>
            <div class="git-kpi-value">
              ${teamMembers.length} <span style="font-size: 13px; font-weight: 600; color: #64748b;">Personel</span>
            </div>
            <div class="git-kpi-subtext">
              Semua Akun Sinkron GitHub Dev
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
            <span class="git-tab-badge">${teamMembers.length}</span>
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
  // Tab 1: Manajemen Cabang & Pull Requests
  // =========================================================================
  renderBranchesTab(activeProject, branches, teamMembers) {
    return `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Active Pull Request Banner Highlight -->
        <div class="git-pr-banner">
          <div class="git-pr-banner-left">
            <div class="git-pr-icon-badge">
              ${Icons.gitPullRequest('', 20)}
            </div>
            <div>
              <div class="git-pr-info-title">
                <span class="git-pr-number">PR #14</span>
                <span class="git-pr-title-text">[Backend] Centralized JWT Sanctum Authentication &amp; RBAC Pustakawan vs Mahasiswa</span>
                <span style="font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px;">
                  ✓ 6/6 Checks Passed
                </span>
              </div>
              <div class="git-pr-branch-flow">
                <span class="git-pr-branch-tag">feature/sanctum-rbac-auth</span>
                <span>➔</span>
                <span class="git-pr-branch-tag" style="background: #e0e7ff; color: #4338ca; font-weight: 700;">staging</span>
                <span style="color: #94a3b8; margin: 0 4px;">·</span>
                <span style="color: #64748b;">Author: <strong>Jaka (Backend Dev)</strong> · 35 menit lalu</span>
              </div>
              <div class="git-pr-meta-status">
                <span>Reviewer: <strong>Azi (Full stack)</strong> &amp; <strong>Asisyah (PM)</strong></span>
                <span>·</span>
                <span style="color: #059669; font-weight: 600;">Diff: +348 / -42 baris kode</span>
                <span>·</span>
                <span style="color: #4338ca; font-weight: 600;">Tiket Terkait: LIB-116</span>
              </div>
            </div>
          </div>

          <div class="git-pr-banner-actions">
            <button type="button" id="reviewPrBtn" class="finance-btn-secondary" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.eye('', 13)}
              <span>Review Perubahan (Diff)</span>
            </button>
            <button type="button" id="mergePrBtn" class="finance-btn-primary" style="font-size: 11px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; background: #059669; border-color: #059669;">
              ${Icons.checkSquare('', 13)}
              <span>Setujui &amp; Merge ke Staging</span>
            </button>
          </div>
        </div>

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
          <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Coba sesuaikan kata kunci pencarian atau buat cabang baru untuk mulai coding.</p>
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
          const assignee = teamMembers.find((m) => m.id === b.assigneeId) || {
            name: isDefault ? 'Sistem DevOps' : 'Tim Pengembang',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
          };

          return `
            <div class="git-branch-card ${isProtected ? 'is-protected' : ''} ${isDefault ? 'is-default' : ''}">
              
              <div class="git-branch-card-header">
                <div class="git-branch-name-wrap">
                  <span style="color: ${isDefault ? '#10b981' : isProtected ? '#4338ca' : '#64748b'};">
                    ${Icons.gitBranch('', 16)}
                  </span>
                  <span class="git-branch-name">${b.name}</span>
                  <button type="button" class="git-branch-copy-btn copy-branch-cmd-btn" data-branch="${b.name}" title="Salin Git Checkout">
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
                      <button type="button" class="git-branch-copy-btn copy-branch-cmd-btn" data-branch="${b.name}" title="Salin Git Checkout">
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
              Manajemen permission level (admin, write, read) untuk setiap developer yang tergabung di proyek.
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
        message: 'feat(katalog): implement redis caching & atomic lock on ISBN search',
        author: 'Jaka',
        role: 'Backend Dev',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        branch: 'feature/katalog-microservice',
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

  // =========================================================================
  // Modal: Buat Cabang Baru (Interactive Git Branch Creation)
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
                <label>Bercabang Dari (Source Branch) *</label>
                <select id="modalSourceBranchSelect" class="git-input">
                  ${branches.map((b) => `
                    <option value="${b.name}" ${b.name === 'main' ? 'selected' : ''}>
                      ${b.name} (${b.isDefault ? 'Default' : b.commitHash || 'HEAD'})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Branch Prefix Selector -->
              <div class="git-form-group">
                <label>Prefix Tipe Cabang</label>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <button type="button" class="branch-prefix-chip git-filter-pill active" data-prefix="feat/">feat/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="fix/">fix/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="epic/">epic/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="hotfix/">hotfix/</button>
                  <button type="button" class="branch-prefix-chip git-filter-pill" data-prefix="release/">release/</button>
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
                <label>Kaitkan dengan Modul / Epics</label>
                <select id="modalModuleSelect" class="git-input">
                  <option value="">-- Tanpa Tautan Khusus --</option>
                  ${epics.map((e) => `
                    <option value="${e.name}">Epics: ${e.name}</option>
                  `).join('')}
                  ${tasks.map((t) => `
                    <option value="${t.key}: ${t.title}">Tiket: [${t.key}] ${t.title.substring(0, 40)}...</option>
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
  // Modal: Tambah Collaborator
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
  // Event Attachments
  // =========================================================================
  attachEvents() {
    // Click Delegations
    this.element.addEventListener('click', (e) => {
      // 1. Sub-Tab Switcher
      const tabBtn = e.target.closest('.git-tab-btn');
      if (tabBtn) {
        const tab = tabBtn.dataset.tab;
        if (tab && tab !== this.activeSubTab) {
          this.activeSubTab = tab;
          this.render();
        }
        return;
      }

      // 2. Branch Type Filter
      const filterPill = e.target.closest('.git-filter-pill[data-filter]');
      if (filterPill) {
        this.branchTypeFilter = filterPill.dataset.filter;
        this.render();
        return;
      }

      // 3. View Switcher (Grid vs Table)
      const viewBtn = e.target.closest('.git-view-btn');
      if (viewBtn) {
        this.branchViewMode = viewBtn.dataset.view;
        this.render();
        return;
      }

      // 4. Open Add Branch Modal
      if (e.target.closest('#openAddBranchBtn') || e.target.closest('#openAddBranchBtn2') || e.target.closest('#openAddBranchEmptyBtn')) {
        this.showAddBranchModal = true;
        this.render();
        return;
      }

      // 5. Close Add Branch Modal
      if (e.target.closest('#closeAddBranchModalBtn') || e.target.closest('#cancelAddBranchBtn') || e.target.id === 'addBranchModalOverlay') {
        this.showAddBranchModal = false;
        this.render();
        return;
      }

      // 6. Branch Prefix Chip click in modal
      const prefixChip = e.target.closest('.branch-prefix-chip');
      if (prefixChip) {
        this.element.querySelectorAll('.branch-prefix-chip').forEach(c => c.classList.remove('active'));
        prefixChip.classList.add('active');
        const prefix = prefixChip.dataset.prefix;
        const prefixDisplay = this.element.querySelector('#modalPrefixDisplay');
        if (prefixDisplay) prefixDisplay.textContent = prefix;
        return;
      }

      // 7. Open Add User Modal
      if (e.target.closest('#openAddUserBtn')) {
        this.showAddUserModal = true;
        this.render();
        return;
      }

      // 8. Close Add User Modal
      if (e.target.closest('#closeAddUserModalBtn') || e.target.closest('#cancelAddUserBtn') || e.target.id === 'addUserModalOverlay') {
        this.showAddUserModal = false;
        this.render();
        return;
      }

      // 9. Copy Git Clone / Repo URL
      const copyRepoBtn = e.target.closest('#copyRepoUrlBtn');
      if (copyRepoBtn) {
        const url = copyRepoBtn.dataset.url;
        navigator.clipboard?.writeText(`git clone ${url}.git`);
        store.addToast('info', 'Git Clone Disalin', `git clone ${url}.git telah disalin ke clipboard.`);
        return;
      }

      // 10. Copy Branch CLI command
      const copyBranchBtn = e.target.closest('.copy-branch-cmd-btn');
      if (copyBranchBtn) {
        const bName = copyBranchBtn.dataset.branch;
        const cmd = `git checkout -b ${bName} origin/${bName}`;
        navigator.clipboard?.writeText(cmd);
        store.addToast('info', 'Git Checkout Disalin', `${cmd} siap dipaste di terminal.`);
        return;
      }

      // 11. Copy Commit Hash
      const copyHashBtn = e.target.closest('.copy-hash-btn');
      if (copyHashBtn) {
        const hash = copyHashBtn.dataset.hash;
        navigator.clipboard?.writeText(hash);
        store.addToast('info', 'Commit Hash Disalin', `Hash ${hash} disalin ke clipboard.`);
        return;
      }

      // 12. Delete Branch
      const delBranchBtn = e.target.closest('.delete-branch-btn');
      if (delBranchBtn) {
        const bName = delBranchBtn.dataset.branch;
        if (confirm(`Yakin ingin menghapus branch "${bName}"? Tindakan ini tidak dapat dibatalkan.`)) {
          store.deleteBranch(bName);
        }
        return;
      }

      // 13. Create PR for Branch
      const createPrBtn = e.target.closest('.create-pr-for-branch-btn');
      if (createPrBtn) {
        const bName = createPrBtn.dataset.branch;
        store.addToast('info', 'Membuka Form PR', `Membuat Pull Request dari cabang ${bName} menuju staging...`);
        return;
      }

      // 14. Merge PR Highlight
      if (e.target.closest('#mergePrBtn')) {
        store.addToast('success', 'Pull Request #14 Berhasil Di-merge!', 'Cabang feature/sanctum-rbac-auth telah digabungkan ke staging.');
        return;
      }

      // 15. Review PR Diff
      if (e.target.closest('#reviewPrBtn')) {
        store.addToast('info', 'Membuka Review Diff', 'Menampilkan perbandingan kode 348 baris baru pada tiket LIB-116.');
        return;
      }

      // 16. Toggle Show Token Key
      if (e.target.closest('#toggleShowKeyBtn')) {
        this.showApiKey = !this.showApiKey;
        this.render();
        return;
      }

      // 17. Test Connection Button
      if (e.target.closest('#testConnectionBtn') || e.target.closest('#testConnHeaderBtn')) {
        this.isTestingConn = true;
        this.render();
        setTimeout(() => {
          this.isTestingConn = false;
          this.connectionStatus = {
            tested: true,
            success: true,
            latencyMs: Math.floor(Math.random() * 50 + 115),
            rateLimitRemaining: 4972,
            scopes: ['repo', 'workflow', 'admin:org', 'write:packages', 'read:user']
          };
          this.render();
          store.addToast('success', 'Koneksi GitHub API Berhasil!', `Response time: ${this.connectionStatus.latencyMs}ms · Rate-limit: ${this.connectionStatus.rateLimitRemaining}/5000`);
        }, 550);
        return;
      }

      // 18. Ping Webhook
      if (e.target.closest('#pingWebhookBtn')) {
        store.addToast('success', 'Ping Webhook Terkirim', 'Status 200 OK diterima dari endpoint server.');
        return;
      }

      // 19. Open Telegram Bot Simulator
      if (e.target.closest('#openTelegramSimBtn')) {
        store.openIntakeModal();
        return;
      }

      // 20. Remove Collaborator
      const removeCollabBtn = e.target.closest('.remove-collab-btn');
      if (removeCollabBtn) {
        const id = removeCollabBtn.dataset.id;
        const name = removeCollabBtn.dataset.name;
        if (confirm(`Cabut hak akses repositori untuk ${name}?`)) {
          store.deleteTeamMember(id);
        }
        return;
      }

      // 21. Save All Settings
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

      // 22. Breadcrumb home click
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
        const gridOrTable = this.element.querySelector('.git-branches-grid') || this.element.querySelector('.git-table-wrapper');
        // Re-render branches view smoothly
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
          return true;
        });

        const container = this.element.querySelector('.git-tab-viewport');
        if (container && this.activeSubTab === 'branches') {
          container.innerHTML = this.renderBranchesTab(activeProject, filtered, teamMembers);
        }
      }
    });

    // Change Project
    this.element.addEventListener('change', (e) => {
      if (e.target.id === 'gitProjectSelect') {
        const projectId = e.target.value;
        store.setSelectedProjectId(projectId);
      }
    });

    // Form Submissions
    this.element.addEventListener('submit', (e) => {
      // Create Branch Form
      if (e.target.id === 'createBranchForm') {
        e.preventDefault();
        const prefixDisplay = this.element.querySelector('#modalPrefixDisplay')?.textContent?.trim() || 'feat/';
        const rawName = this.element.querySelector('#modalBranchNameInput')?.value?.trim() || '';
        const sourceBranch = this.element.querySelector('#modalSourceBranchSelect')?.value || 'main';
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
