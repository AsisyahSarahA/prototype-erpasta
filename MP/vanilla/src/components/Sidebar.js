/**
 * Sidebar Component — Adapter to the shared ASTACODE ERP Master Sidebar
 *
 * Reuses the unified sidebar (../../sidebar.js & ../../sidebar.css) across
 * CRM, Management Proyek, Finance, Marketing, and HR.
 *
 * Sub-modules under Management Proyek:
 *   Perencanaan          -> project, kanban, backlog, timeline, list
 *   Pengembangan & AI    -> ai_hub, github
 *   Operasional & Bisnis -> client, team, finance, crm
 */

import { store } from '../state/store.js';

const MP_VIEWS = [
  'project',
  'kanban',
  'backlog',
  'timeline',
  'list',
  'ai_hub',
  'github',
  'client',
  'team',
  'finance',
  'crm'
];

const LEGACY_ALIASES = {
  dashboard: 'project',
  task: 'kanban',
  tickets: 'backlog',
  timesheet: 'team',
  automation: 'ai_hub',
  events: 'timeline',
  handover: 'client'
};

function resolveSub(raw) {
  if (!raw) return 'project';
  if (LEGACY_ALIASES[raw]) return LEGACY_ALIASES[raw];
  if (MP_VIEWS.includes(raw)) return raw;
  return 'project';
}

export class Sidebar {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'sidebar-container';
    this.container.setAttribute('data-active-page', 'project');
    this.container.style.height = '100%';
    this.container.style.flexShrink = '0';

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'sidebar-overlay';
    this.backdrop.id = 'sidebarOverlay';

    this.currentSub = 'project';
    this.unsubscribe = null;
    this.init();
  }

  init() {
    window.ERP_CURRENT_MODULE = 'project';
    window.__mpStore = store;

    // Resolve initial subpage from URL hash
    const hashSub = (window.location.hash || '').replace('#', '');
    const initialSub = hashSub ? resolveSub(hashSub) : resolveSub(store.getState().activeTab);
    this.currentSub = initialSub;
    store.setActiveTab(initialSub);

    if (window.location.hash.slice(1) !== initialSub) {
      history.replaceState(null, '', `#${initialSub}`);
    }

    // Expose global switcher for sidebar.js
    window.switchProjectPage = (subpage) => {
      this.switchPage(subpage);
    };

    // NOTE: Do NOT call this.render() here before this.container is appended to #app in main.js!
    // main.js calls sidebar.render() right after appending this.container to #app.

    // Sync sidebar when store activeTab changes internally
    this.unsubscribe = store.subscribe((state) => {
      const next = resolveSub(state.activeTab);
      if (next !== this.currentSub) {
        this.currentSub = next;
        if (window.location.hash.slice(1) !== next) {
          history.replaceState(null, '', `#${next}`);
        }
        this.syncSidebarDom(next);
      }
    });

    // Browser back/forward hash navigation
    window.addEventListener('hashchange', () => {
      const raw = (window.location.hash || '').replace('#', '');
      if (!raw) return;
      const target = resolveSub(raw);
      if (target !== store.getState().activeTab) {
        this.switchPage(target);
      }
    });

    // Backdrop click closes mobile drawer
    this.backdrop.addEventListener('click', () => {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
      this.backdrop.classList.remove('open');
      store.toggleMobileSidebar(false);
    });
  }

  switchPage(subpage) {
    const target = resolveSub(subpage);
    this.currentSub = target;
    store.setActiveTab(target);
    if (window.location.hash.slice(1) !== target) {
      history.replaceState(null, '', `#${target}`);
    }
    this.syncSidebarDom(target);
  }

  syncSidebarDom(activeSub) {
    const group = document.getElementById('projectNavGroup');
    if (!group) {
      this.render();
      return;
    }
    group.classList.add('open');
    group.querySelectorAll('.nav-sub-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sub === activeSub);
    });
  }

  render() {
    // Clean up any stray #sidebar-container that might have been created outside #app
    document.querySelectorAll('#sidebar-container').forEach((el) => {
      if (el !== this.container && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    this.container.setAttribute('data-active-subpage', this.currentSub);
    if (typeof window.renderDynamicSidebar === 'function') {
      const previous = document.getElementById('sidebar');
      const scrollTop = previous ? previous.scrollTop : 0;

      window.renderDynamicSidebar({
        activePage: 'project',
        activeSubpage: this.currentSub
      });

      const sb = document.getElementById('sidebar');
      if (sb) sb.scrollTop = scrollTop;
    }
  }

  getBackdrop() {
    return this.backdrop;
  }

  getElement() {
    return this.container;
  }
}
