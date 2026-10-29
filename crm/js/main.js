/**
 * main.js — Vanilla JS Application Entry Point & SPA Router Shell
 * ASTACODE CRM (PT ASTACODE Solusindo Teknologi)
 */

import { mountHeader } from "./components/layout/Header.js";
import { initCommandPalette } from "./components/common/CommandPalette.js";
import { initNewLeadModal } from "./components/crm/NewLeadModal.js";
import { mountSidebar } from "./components/layout/Sidebar.js";
import store from "./store/store.js";

// Direct Static View Modules for Robust Bundling & Local Server Execution
import * as PipelineKanban from "./components/crm/PipelineKanban.js";
import * as PipelineTable from "./components/crm/PipelineTable.js";
import * as PipelineWorkflowTracker from "./components/crm/PipelineWorkflowTracker.js";
import * as LeadDetailPage from "./components/crm/LeadDetailPage.js";
import * as CustomersList from "./components/customers/CustomersList.js";
import * as ProjectsList from "./components/projects/ProjectsList.js";
import * as SettingTopInvoicePage from "./components/finance/SettingTopInvoicePage.js";
import * as ContractsLegalPage from "./components/legal/ContractsLegalPage.js";
import * as WhatsAppInbox from "./components/clientcare/WhatsAppInbox.js";
import * as ReportsDashboard from "./components/reports/ReportsDashboard.js";

const VIEW_MODULES = {
  pipeline_kanban: PipelineKanban,
  pipeline_table: PipelineTable,
  pipeline_workflow: PipelineWorkflowTracker,
  lead_detail: LeadDetailPage,
  customers: CustomersList,
  projects: ProjectsList,
  finance_top: SettingTopInvoicePage,
  contracts_legal: ContractsLegalPage,
  client_care: WhatsAppInbox,
  reports: ReportsDashboard,
};

// SVG Icons for Toasts
const TOAST_ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`,
};

/**
 * Displays a non-intrusive toast notification
 * @param {string} message - Content of the message
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - Style type
 * @param {number} [duration=3500] - Duration in ms
 */
export function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="display:flex;align-items:center;flex-shrink:0;">
      ${TOAST_ICONS[type] || TOAST_ICONS.info}
    </span>
    <span style="flex:1;line-height:1.4;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 250);
  }, duration);
}

// Listen to custom 'show-toast' events anywhere in the app
window.addEventListener("show-toast", (e) => {
  if (e.detail) {
    showToast(e.detail.message, e.detail.type || "info", e.detail.duration || 3500);
  }
});

/**
 * Synchronizes HTML class with dark mode preference
 * @param {boolean} isDarkMode
 */
function syncDarkMode(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * View Registry & Dynamic Router
 */
const viewRegistry = {};

export function registerView(viewKey, renderFunction) {
  viewRegistry[viewKey] = renderFunction;
}

let currentRenderedView = null;
let currentRenderedViewMode = null;
let currentRenderedLeadId = null;

function routeCurrentView() {
  const viewContainer = document.getElementById("view-container");
  if (!viewContainer) return;

  const state = store.getState();
  const { activeView, viewMode, selectedLeadId } = state;

  // Avoid unnecessary re-render of unchanged view container if same
  const viewRouteKey = activeView === "pipeline" ? `pipeline_${viewMode}` : activeView;
  const isLeadDetailSame = activeView === "lead_detail" && selectedLeadId === currentRenderedLeadId;

  if (currentRenderedView === viewRouteKey && currentRenderedViewMode === viewMode && (activeView !== "lead_detail" || isLeadDetailSame)) {
    return;
  }

  currentRenderedView = viewRouteKey;
  currentRenderedViewMode = viewMode;
  currentRenderedLeadId = selectedLeadId;

  // Clear previous content
  viewContainer.innerHTML = "";

  // 1. Check if view handler is registered in custom registry
  if (typeof viewRegistry[viewRouteKey] === "function") {
    try {
      viewRegistry[viewRouteKey](viewContainer);
      return;
    } catch (err) {
      console.error(`[ASTACODE CRM] Error rendering registered view "${viewRouteKey}":`, err);
    }
  }

  // 2. Check mapped static view module
  const module = VIEW_MODULES[viewRouteKey];
  if (module && typeof module.mount === "function") {
    try {
      module.mount(viewContainer);
      return;
    } catch (err) {
      console.error(`[ASTACODE CRM] Error mounting view "${viewRouteKey}":`, err);
      viewContainer.innerHTML = `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:32px;text-align:center;">
          <div style="width:54px;height:54px;border-radius:14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;color:#ef4444;font-size:24px;">
            ⚠️
          </div>
          <div>
            <h2 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">
              Gagal Membuka Tampilan: ${viewRouteKey}
            </h2>
            <p style="font-size:13px;color:var(--text-muted);max-width:440px;">
              ${err.message || String(err)}
            </p>
          </div>
        </div>
      `;
      return;
    }
  }

  // 3. Fallback placeholder
  viewContainer.innerHTML = `
    <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:32px;text-align:center;">
      <div style="width:54px;height:54px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;color:var(--indigo-500);font-size:24px;">
        ✨
      </div>
      <div>
        <h2 style="font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:6px;">
          Workspace View: ${activeView.toUpperCase()} ${activeView === "pipeline" ? `(${viewMode.toUpperCase()})` : ""}
        </h2>
        <p style="font-size:13px;color:var(--text-muted);max-width:440px;">
          Modul siap dihubungkan. State store reactive, filter, dan data seed telah aktif.
        </p>
      </div>
    </div>
  `;
}

/**
 * Initializes the entire application
 */
function initApp() {
  const appContainer = document.getElementById("app");
  if (!appContainer) {
    console.error("Fatal: #app root element not found in DOM.");
    return;
  }

  // Initial Dark Mode sync
  syncDarkMode(store.getState().isDarkMode);

  // Construct SPA Shell Layout
  appContainer.innerHTML = `
    <div class="app-shell">
      <!-- Left Sidebar Container -->
      <div id="sidebar-container" style="height:100%;"></div>

      <!-- Right Main Area -->
      <div class="main-content">
        <!-- Top Sticky Header Container -->
        <div id="header-container"></div>

        <!-- Dynamic Main View Container -->
        <main id="view-container" class="page-area"></main>
      </div>
    </div>
  `;

  // Shared ERP sidebar (same one used by Finance, Marketing, HR & Project)
  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    mountSidebar(sidebarContainer);
  }

  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    mountHeader(headerContainer);
  }

  // Initialize Global Modals & Keyboard Listeners
  initCommandPalette();
  initNewLeadModal();

  // Initial Route View Render
  routeCurrentView();

  // Mark application as successfully loaded and clear timeout fallback
  window.__crmAppLoaded = true;
  if (window.__crmLoadTimeout) {
    clearTimeout(window.__crmLoadTimeout);
  }

  // Reactive subscription to state changes
  store.subscribe((state) => {
    syncDarkMode(state.isDarkMode);
    routeCurrentView();
  });

  // Re-trigger routing if lead changes
  window.addEventListener("route-change", () => {
    currentRenderedView = null; // force re-route
    routeCurrentView();
  });

  console.log("✅ ASTACODE CRM (Vanilla JS) initialized successfully.");
}

/**
 * Bootstrap runner with try-catch and diagnostic reporting
 */
function bootstrapApp() {
  try {
    initApp();
  } catch (err) {
    console.error("[ASTACODE CRM Fatal Init Error]", err);
    if (typeof window.__showCrmLoadError === "function") {
      window.__showCrmLoadError("init_error", err.message || String(err));
    }
  }
}

// Run bootstrap when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapApp);
} else {
  bootstrapApp();
}
