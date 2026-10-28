/**
 * Header.js — Vanilla JS Header Component
 * Converted from src/components/layout/Header.tsx
 */

import store from '../../store/store.js';

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
};

const VIEW_TITLES = {
  pipeline: 'Sales Pipeline',
  customers: 'Master Customer',
  projects: 'Proyek Delivery',
  finance_top: 'Setting TOP',
  contracts_legal: 'Kontrak & Legalitas',
  client_care: 'WhatsApp Care',
  reports: 'Laporan',
};

export function renderHeader() {
  const state = store.getState();
  const { activeView, selectedLeadId, leads, viewMode, isDarkMode } = state;
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Left Section: Mobile Hamburger + Breadcrumb or Title
  let leftContent = '';
  if (activeView === 'lead_detail' && selectedLead) {
    leftContent = `
      <div class="header-breadcrumb">
        <button id="header-back-pipeline" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;">
          ${ICONS.arrowLeft}
          <span>Pipeline</span>
        </button>
        <span style="color:var(--text-muted);display:flex;align-items:center;">${ICONS.chevronRight}</span>
        <span class="badge badge-purple" style="font-family:var(--font-mono);font-weight:700;">${selectedLead.code}</span>
        <span class="header-breadcrumb-title" style="max-width:260px;" title="${selectedLead.title}">${selectedLead.title}</span>
      </div>
    `;
  } else {
    const pageTitle = VIEW_TITLES[activeView] || 'ASTACODE CRM';
    leftContent = `
      <div class="header-breadcrumb" style="display:flex;align-items:center;gap:10px;flex-wrap:nowrap;">
        <h1 class="header-breadcrumb-title" style="font-size:15px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;margin:0;">
          ${pageTitle}
        </h1>
        <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:700;background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);">
          <span class="live-dot"></span>
          <span>Live</span>
        </span>
        <span class="header-org-pill" style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:var(--radius-full);font-size:11px;font-weight:600;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary);">
          <span style="color:var(--indigo-600);font-weight:800;">ASTACODE</span>
          <span style="color:var(--text-muted);opacity:0.6;">|</span>
          <span>Asisyah Sarah Azzahra (Super Admin & PM)</span>
        </span>
      </div>
    `;
  }

  // Pipeline View Mode Switcher
  let viewModeSwitcher = '';
  if (activeView === 'pipeline') {
    viewModeSwitcher = `
      <div class="view-mode-toggle" style="display:flex;align-items:center;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-xl);padding:3px;gap:2px;">
        <button
          class="btn-view-mode ${viewMode === 'kanban' ? 'active' : ''}"
          data-mode="kanban"
          style="display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:var(--radius-lg);border:none;font-size:12px;cursor:pointer;transition:all var(--transition);${viewMode === 'kanban' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-muted);font-weight:600;'}"
          title="Tampilan Kanban Board"
        >
          ${ICONS.kanban}
          <span>Kanban</span>
        </button>
        <button
          class="btn-view-mode ${viewMode === 'table' ? 'active' : ''}"
          data-mode="table"
          style="display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:var(--radius-lg);border:none;font-size:12px;cursor:pointer;transition:all var(--transition);${viewMode === 'table' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-muted);font-weight:600;'}"
          title="Tampilan Tabel Detail"
        >
          ${ICONS.table}
          <span>Table</span>
        </button>
        <button
          class="btn-view-mode ${viewMode === 'workflow' ? 'active' : ''}"
          data-mode="workflow"
          style="display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:var(--radius-lg);border:none;font-size:12px;cursor:pointer;transition:all var(--transition);${viewMode === 'workflow' ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-muted);font-weight:600;'}"
          title="Tracking Workflow & Tahap File Dokumen"
        >
          ${ICONS.layers}
          <span>Workflow & File</span>
        </button>
      </div>
    `;
  }

  return `
    <header class="header" id="app-header">
      <!-- Left side: Hamburger (mobile) + Breadcrumbs / Title -->
      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
        <button id="header-mobile-toggle" class="header-mobile-btn" title="Buka Menu Navigasi">
          ${ICONS.menu}
        </button>
        ${leftContent}
      </div>

      <!-- Right side: Search, View Mode, Theme Toggle, + Lead Baru -->
      <div class="header-actions">
        <!-- Quick Search Bar trigger -->
        <button id="header-search-trigger" class="header-search-btn" title="Cari cepat (Ctrl+K)" style="min-width:260px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 14px;border-radius:12px;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary);font-size:12px;cursor:pointer;transition:all var(--transition);">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:var(--indigo-500);display:flex;align-items:center;">${ICONS.search}</span>
            <span style="color:var(--text-muted);font-weight:500;">Cari cepat lead, customer...</span>
          </div>
          <kbd class="kbd" style="padding:2px 6px;border-radius:4px;background:var(--bg-card);border:1px solid var(--border);font-family:var(--font-mono);font-size:10px;color:var(--text-muted);box-shadow:var(--shadow-xs);">Ctrl+K</kbd>
        </button>

        <!-- View Mode Switcher -->
        ${viewModeSwitcher}

        <!-- Dark / Light Theme Toggle -->
        <button id="header-theme-toggle" class="btn-icon" title="${isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}">
          ${isDarkMode ? ICONS.sun : ICONS.moon}
        </button>

        <!-- + Lead Baru Button -->
        <button id="header-new-lead-btn" class="btn btn-primary" style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:12px;">
          ${ICONS.plus}
          <span>Lead Baru</span>
        </button>
      </div>
    </header>
  `;
}

export function bindHeaderEvents() {
  // Mobile Hamburger Toggle
  const mobileToggle = document.getElementById('header-mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      // Shared ERP sidebar drawer (sidebar.css uses .open + .sidebar-overlay)
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open', !!sidebar && sidebar.classList.contains('open'));
    });
  }

  // Back to Pipeline button
  const backPipelineBtn = document.getElementById('header-back-pipeline');
  if (backPipelineBtn) {
    backPipelineBtn.addEventListener('click', () => {
      store.navigateBackToPipeline();
    });
  }

  // Search trigger (Ctrl+K / click)
  const searchTrigger = document.getElementById('header-search-trigger');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    });
  }

  // View Mode Switcher buttons
  document.querySelectorAll('.btn-view-mode[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      store.setViewMode(mode);
    });
  });

  // Theme Toggle button
  const themeToggle = document.getElementById('header-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      store.toggleDarkMode();
    });
  }

  // + Lead Baru button
  const newLeadBtn = document.getElementById('header-new-lead-btn');
  if (newLeadBtn) {
    newLeadBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-new-lead-modal'));
    });
  }
}

export function mountHeader(container) {
  container.innerHTML = renderHeader();
  bindHeaderEvents();

  const unsubscribe = store.subscribe(() => {
    container.innerHTML = renderHeader();
    bindHeaderEvents();
  });

  return unsubscribe;
}
