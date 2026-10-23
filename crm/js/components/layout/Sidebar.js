/**
 * Sidebar.js — Adapter to the shared ASTACODE ERP sidebar
 *
 * The CRM no longer renders its own sidebar. It reuses the unified sidebar that
 * every module (Finance, Marketing, HR, Project) uses:
 *   - ../../../../sidebar.js   → renders the markup (window.renderDynamicSidebar)
 *   - ../../../../sidebar.css  → styles (linked from crm/index.html)
 *
 * The CRM sub-menu in the shared sidebar is the original, compact CRM menu:
 *   CRM & Penjualan   → pipeline, customers
 *   ERP & Delivery    → projects
 *   Kontrak & Keuangan→ finance_top, contracts_legal
 *   Client Care & AI  → client_care
 *   Eksekutif         → reports
 * Each sub-menu id is exactly the CRM store `activeView`, so a click simply
 * opens that CRM page. The CRM header is untouched.
 */

import store from '../../store/store.js';
import '../../../../sidebar.js';

// Tell the shared sidebar which module owns this document, so in-page
// navigation works regardless of the URL (e.g. Vite serving crm/ as root).
window.ERP_CURRENT_MODULE = 'crm';

/** Sub-menu ids shown in the sidebar (= CRM store activeView values). */
const CRM_VIEWS = [
  'pipeline',
  'customers',
  'projects',
  'finance_top',
  'contracts_legal',
  'client_care',
  'reports',
];

/**
 * Legacy deep links (e.g. crm/crm.html#leads from Marketing or the root
 * dashboard) are not in the menu anymore, but still resolve to a page.
 */
const LEGACY_ALIASES = {
  dashboard:    { sub: 'reports' },
  leads:        { sub: 'pipeline', viewMode: 'table' },
  activity:     { sub: 'pipeline', viewMode: 'workflow' },
  requirements: { sub: 'pipeline' },
  'brd-prd':    { sub: 'pipeline' },
  master:       { sub: 'customers' },
  'rate-card':  { sub: 'pipeline' },
  offerings:    { sub: 'finance_top' },
  quotation:    { sub: 'contracts_legal' },
  customer:     { sub: 'customers' },
  handover:     { sub: 'projects' },
  automation:   { sub: 'client_care' },
  guide:        { sub: 'pipeline' },
};

let currentSub = 'pipeline';

function isKnownSub(sub) {
  return CRM_VIEWS.includes(sub) || Object.prototype.hasOwnProperty.call(LEGACY_ALIASES, sub);
}

/** Sidebar item that represents the current store state. */
function resolveSubpage(state) {
  // A lead card belongs to the pipeline
  if (state.activeView === 'lead_detail') return 'pipeline';
  if (CRM_VIEWS.includes(state.activeView)) return state.activeView;
  return currentSub;
}

function renderShared(container) {
  if (typeof window.renderDynamicSidebar !== 'function') {
    console.error('[ASTACODE CRM] Shared sidebar (sidebar.js) is not loaded.');
    return;
  }

  // The shared sidebar scrolls itself; keep its position across re-renders.
  const previous = document.getElementById('sidebar');
  const scrollTop = previous ? previous.scrollTop : 0;

  window.renderDynamicSidebar({ activePage: 'crm', activeSubpage: currentSub });

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.scrollTop = scrollTop;

  // Mobile overlay (the shared stylesheet provides .sidebar-overlay)
  if (!document.getElementById('sidebarOverlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    overlay.addEventListener('click', () => {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
      overlay.classList.remove('open');
    });
    container.appendChild(overlay);
  }
}

/** Open the CRM page that belongs to a sidebar sub-menu item (or legacy hash). */
export function switchCrmPage(subpage, container = document.getElementById('sidebar-container')) {
  if (!isKnownSub(subpage)) return;

  const alias = LEGACY_ALIASES[subpage];
  const sub = alias ? alias.sub : subpage;

  currentSub = sub;
  const patch = { activeView: sub };
  if (alias && alias.viewMode) patch.viewMode = alias.viewMode;
  store.setState(patch);

  // Legacy hash → show the canonical one in the address bar
  if (window.location.hash.slice(1) !== sub) {
    history.replaceState(null, '', `#${sub}`);
  }

  if (container) renderShared(container);
}

export function mountSidebar(container) {
  container.id = 'sidebar-container';
  container.style.height = '100%';
  container.style.flexShrink = '0';

  window.switchCrmPage = (subpage) => switchCrmPage(subpage, container);

  // Deep link (crm/index.html#customers) wins; otherwise mirror the store.
  const hashSub = window.location.hash.slice(1);
  if (isKnownSub(hashSub)) {
    switchCrmPage(hashSub, container);
  } else {
    currentSub = resolveSubpage(store.getState());
    renderShared(container);
  }

  // Browser back/forward or manual hash edits
  const onHashChange = () => {
    const sub = window.location.hash.slice(1);
    if (isKnownSub(sub) && (LEGACY_ALIASES[sub] || sub !== currentSub)) {
      switchCrmPage(sub, container);
    }
  };
  window.addEventListener('hashchange', onHashChange);

  // Keep the active item in sync when the CRM navigates by itself
  // (e.g. opening a lead card, header view-mode toggle, "back to pipeline").
  const unsubscribe = store.subscribe((state) => {
    const next = resolveSubpage(state);
    if (next === currentSub) return;
    currentSub = next;
    history.replaceState(null, '', `#${next}`);
    renderShared(container);
  });

  return () => {
    unsubscribe();
    window.removeEventListener('hashchange', onHashChange);
  };
}
