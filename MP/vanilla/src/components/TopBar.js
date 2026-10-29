/**
 * TopBar.js — Unified Header Component for Management Proyek
 * Modeled 100% after ASTACODE CRM Header (crm/js/components/layout/Header.js):
 * - Normal View: Hamburger, Breadcrumbs with Live Dot & Project Pill, Quick Search (Ctrl+K),
 *                View Mode Switcher (Kanban | Table | Workflow), Theme Toggle, + Tiket Baru
 * - Detail View: < Kembali ke Kanban, Key Badge, Task Title, Status Badge, Quick Status Action
 */

import { store } from '../state/store.js';

const ICONS = {
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  kanban: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  table: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`,
  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`
};

const VIEW_TITLES = {
  project: 'Modul Proyek',
  kanban: 'Papan Kanban',
  backlog: 'Backlog & Sprints',
  timeline: 'Timeline & Roadmap',
  list: 'Daftar Pekerjaan (JQL)',
  ai_hub: 'Otomasi Fix Bug AI',
  github: 'GitHub & Cabang',
  client: 'Service Desk / Klien',
  team: 'Tim HR & Workload',
  finance: 'Finance & Invoices',
  crm: 'CRM Deals Won',
  task_detail: 'Detail Tiket Pekerjaan'
};

export class TopBar {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'header-container';
    this.isDarkMode = false;
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  render() {
    const state = store.getState();
    const { activeTab, selectedTask, projects, selectedProjectId } = state;
    const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || { name: 'Proyek Software House', code: 'PROJ' };

    let leftContent = '';

    if (activeTab === 'task_detail' && selectedTask) {
      leftContent = `
        <div class="header-breadcrumb">
          <button id="header-back-kanban" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;">
            ${ICONS.arrowLeft}
            <span>Papan Kanban</span>
          </button>
          <span style="color:var(--text-muted);display:flex;align-items:center;">${ICONS.chevronRight}</span>
          <span class="badge badge-purple" style="font-family:var(--font-mono);font-weight:800;">${selectedTask.key}</span>
          <span class="header-breadcrumb-title" style="max-width:280px;" title="${selectedTask.title}">${selectedTask.title}</span>
          <span class="badge badge-${selectedTask.status === 'Selesai' ? 'emerald' : selectedTask.status === 'In Progress' ? 'blue' : 'amber'}" style="font-size:10px;">
            ${selectedTask.status}
          </span>
        </div>
      `;
    } else {
      const pageTitle = VIEW_TITLES[activeTab] || 'Papan Kanban';
      leftContent = `
        <div class="header-breadcrumb" style="display:flex;align-items:center;gap:10px;flex-wrap:nowrap;">
          <h1 class="header-breadcrumb-title">
            ${pageTitle}
          </h1>
          <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);">
            <span class="live-dot"></span>
            <span>Live</span>
          </span>
          <div class="header-org-pill" style="cursor:pointer;" title="Pilih Proyek Aktif">
            <span style="color:var(--indigo-600);font-weight:800;">ASTACODE</span>
            <span style="color:var(--text-muted);opacity:0.6;">|</span>
            <select id="headerProjectSelect" style="border:none;background:transparent;font-weight:700;color:var(--text-primary);cursor:pointer;font-size:11px;outline:none;">
              ${projects.map((p) => `
                <option value="${p.id}" ${selectedProjectId === p.id ? 'selected' : ''}>
                  ${p.name} (${p.code})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      `;
    }

    // View mode switcher (Kanban | Table | Workflow)
    const viewModeSwitcher = `
      <div class="view-mode-toggle">
        <button
          class="btn-view-mode ${activeTab === 'kanban' ? 'active' : ''}"
          data-tab="kanban"
          title="Tampilan Kanban Board"
        >
          ${ICONS.kanban}
          <span>Kanban</span>
        </button>
        <button
          class="btn-view-mode ${activeTab === 'list' ? 'active' : ''}"
          data-tab="list"
          title="Tampilan Tabel Detail JQL"
        >
          ${ICONS.table}
          <span>Table (JQL)</span>
        </button>
        <button
          class="btn-view-mode ${activeTab === 'timeline' ? 'active' : ''}"
          data-tab="timeline"
          title="Roadmap & Timeline Sprints"
        >
          ${ICONS.layers}
          <span>Roadmap</span>
        </button>
      </div>
    `;

    this.container.innerHTML = `
      <header class="header" id="app-header">
        <!-- Left side: Hamburger + Breadcrumbs / Title -->
        <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
          <button id="header-mobile-toggle" class="header-mobile-btn" title="Buka Navigasi Sidebar">
            ${ICONS.menu}
          </button>
          ${leftContent}
        </div>

        <!-- Right side: Quick Search, View Mode, Theme Toggle, + Tiket Baru -->
        <div class="header-actions">
          <!-- Search trigger -->
          <div id="header-search-box" class="header-search-btn" title="Cari cepat (Ctrl+K)">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:var(--indigo-500);display:flex;align-items:center;">${ICONS.search}</span>
              <input
                id="header-quick-search-input"
                type="text"
                placeholder="Cari cepat tiket, kode, PIC..."
                value="${state.searchQuery || ''}"
                style="border:none;background:transparent;outline:none;font-size:12px;color:var(--text-primary);width:140px;"
              />
            </div>
            <kbd style="padding:2px 6px;border-radius:4px;background:var(--bg-card);border:1px solid var(--border);font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">Ctrl+K</kbd>
          </div>

          <!-- View Mode Switcher -->
          ${viewModeSwitcher}

          <!-- Theme Toggle Button -->
          <button id="header-theme-toggle" class="btn-icon" title="${this.isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}">
            ${this.isDarkMode ? ICONS.sun : ICONS.moon}
          </button>

          <!-- + Tiket Baru Button -->
          <button id="header-new-task-btn" class="btn btn-primary" style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:12px;">
            ${ICONS.plus}
            <span>Tiket Baru</span>
          </button>
        </div>
      </header>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Mobile menu toggle
    const mobileBtn = this.container.querySelector('#header-mobile-toggle');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        const sb = document.getElementById('sidebar');
        const ov = document.getElementById('sidebarOverlay');
        if (sb) sb.classList.toggle('open');
        if (ov && sb) ov.classList.toggle('open', sb.classList.contains('open'));
      });
    }

    // Back to Kanban button
    const backBtn = this.container.querySelector('#header-back-kanban');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        store.closeTaskDetail();
      });
    }

    // Project selector
    const projectSelect = this.container.querySelector('#headerProjectSelect');
    if (projectSelect) {
      projectSelect.addEventListener('change', (e) => {
        store.setSelectedProjectId(e.target.value);
      });
    }

    // View mode switchers
    this.container.querySelectorAll('.btn-view-mode[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (targetTab) {
          store.setActiveTab(targetTab);
        }
      });
    });

    // Quick search input
    const searchInput = this.container.querySelector('#header-quick-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          store.setActiveTab('kanban');
        }
      });
    }

    // Global keyboard shortcut Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const input = document.getElementById('header-quick-search-input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    });

    // Theme toggle
    const themeToggle = this.container.querySelector('#header-theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark', this.isDarkMode);
        this.render();
      });
    }

    // + Tiket Baru button
    const newTaskBtn = this.container.querySelector('#header-new-task-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        store.openCreateTaskModal();
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
