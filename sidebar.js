/**
 * ==========================================================================
 * ASTACODE ERP - MASTER UNIFIED SIDEBAR CONTROLLER (sidebar.js)
 * High-performance navigation engine integrating:
 * - Root Index (Executive Dashboard, Kanban AI, Reporting, RBAC)
 * - CRM Module (crm/crm.html)
 * - Project Management & AFB (project/Forge PM.html)
 * - Finance V3 (finance/index.html)
 * - Marketing & AI Content Engine (marketing/marketing.html)
 * ==========================================================================
 */

(function() {
  'use strict';

  // SVG Icon definitions
  const SIDEBAR_ICONS = {
    brand: '<path d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.4 6.4 20.5 8.5 13 3 9.8h6.8L12 3z"/>',
    dashboard: '<path d="M4 13h6V4H4v9zm10 7h6v-9h-6v9zM4 20h6v-3H4v3zm10-10h6V4h-6v6z"/>',
    crm: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm12 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    project: '<path d="M4 7h16v13H4zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 12h16M10 12v2h4v-2"/>',
    finance: '<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 14h.01 M20 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/>',
    marketing: '<path d="M3 11v2a2 2 0 0 0 2 2h2l4 6h2l-2.5-6H19a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H10L5 6v5z"/>',
    bot: '<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM9 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
    chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    plug: '<path d="M8 12l4-4m-6 8 4-4m6-8v4m0 0h4m-4 0a5 5 0 0 1-5 5H9a5 5 0 0 0 0 10h4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    settings: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    chevron: '<polyline points="9 18 15 12 9 6"></polyline>'
  };

  function svg(name, className = '') {
    const p = SIDEBAR_ICONS[name] || '';
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  }

  // Detect current directory context
  function getPathPrefix() {
    const p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    if (p.includes('/crm/') || p.includes('/finance/') || p.includes('/marketing/') || p.includes('/project/')) {
      return '../';
    }
    return '';
  }

  // Determine current active module and subpage from URL/DOM
  function detectCurrentContext() {
    const p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    const hash = (window.location.hash || '').replace('#', '');

    let activeModule = 'dashboard';
    let activeSubpage = '';

    if (p.includes('crm.html') || p.includes('/crm/')) {
      activeModule = 'crm';
      activeSubpage = hash || 'pipeline';
    } else if (p.includes('forge pm.html') || p.includes('/project/')) {
      activeModule = 'project';
      activeSubpage = hash || 'dashboard';
    } else if (p.includes('/finance/') || p.includes('finance.html')) {
      activeModule = 'finance';
      activeSubpage = hash || 'dashboard';
    } else if (p.includes('marketing.html') || p.includes('/marketing/')) {
      activeModule = 'marketing';
      activeSubpage = hash || 'marketing-ops';
    } else {
      // In Root index.html
      activeModule = (hash && ['aikanban', 'analytics', 'integrations', 'rbac', 'settings'].includes(hash)) ? hash : 'dashboard';
      activeSubpage = hash || 'dashboard';
    }

    return { activeModule, activeSubpage };
  }

  // Master Render Function
  window.renderDynamicSidebar = function(config = {}) {
    const context = detectCurrentContext();
    const activeModule = config.activePage || context.activeModule;
    const activeSubpage = config.activeSubpage || context.activeSubpage;
    const prefix = getPathPrefix();

    const sidebarHtml = `
      <aside class="sidebar" id="sidebar">
        <!-- Brand Header -->
        <a href="${prefix}index.html#dashboard" class="brand" data-nav="dashboard" data-module="dashboard">
          <div class="brand-mark">
            ${svg('brand')}
          </div>
          <div class="brand-info">
            <h1>ASTACODE ERP</h1>
            <p>Enterprise Operations Platform</p>
          </div>
        </a>

        <!-- Section: Workspace -->
        <div class="nav-label">Workspace</div>
        <nav class="nav" id="sidebar-nav-workspace">
          <!-- 0. Executive Dashboard -->
          <a href="${prefix}index.html#dashboard" class="nav-btn ${activeModule === 'dashboard' ? 'active' : ''}" data-nav="dashboard" data-module="dashboard">
            ${svg('dashboard')}
            <span>Executive Dashboard</span>
          </a>

          <!-- 1. CRM Module (Accordion) -->
          <div class="nav-group ${activeModule === 'crm' ? 'open' : ''}" id="crmNavGroup" data-module-group="crm">
            <button type="button" class="nav-btn nav-parent-btn ${activeModule === 'crm' ? 'active' : ''}" id="crmParentToggle" onclick="window.toggleModuleAccordion('crmNavGroup', event)">
              <div class="nav-left">
                ${svg('crm')}
                <span>CRM Module</span>
              </div>
              ${svg('chevron', 'nav-chevron')}
            </button>
            <div class="nav-sub" id="crmSubNav">
              <a href="${prefix}crm/crm.html#pipeline" class="nav-sub-btn ${activeModule === 'crm' && (activeSubpage === 'pipeline' || !activeSubpage) ? 'active' : ''}" data-module="crm" data-sub="pipeline" onclick="window.navigateToModuleSubpage('crm', 'pipeline', '${prefix}crm/crm.html#pipeline', event)">
                <span class="nav-sub-dot"></span>
                <span>Lead & Pipeline</span>
              </a>
              <a href="${prefix}crm/crm.html#quotation" class="nav-sub-btn ${activeModule === 'crm' && activeSubpage === 'quotation' ? 'active' : ''}" data-module="crm" data-sub="quotation" onclick="window.navigateToModuleSubpage('crm', 'quotation', '${prefix}crm/crm.html#quotation', event)">
                <span class="nav-sub-dot"></span>
                <span>Quotation & MoU</span>
              </a>
              <a href="${prefix}crm/crm.html#customer" class="nav-sub-btn ${activeModule === 'crm' && activeSubpage === 'customer' ? 'active' : ''}" data-module="crm" data-sub="customer" onclick="window.navigateToModuleSubpage('crm', 'customer', '${prefix}crm/crm.html#customer', event)">
                <span class="nav-sub-dot"></span>
                <span>Master Customer (360°)</span>
              </a>
              <a href="${prefix}crm/crm.html#master" class="nav-sub-btn ${activeModule === 'crm' && activeSubpage === 'master' ? 'active' : ''}" data-module="crm" data-sub="master" onclick="window.navigateToModuleSubpage('crm', 'master', '${prefix}crm/crm.html#master', event)">
                <span class="nav-sub-dot"></span>
                <span>Master Data CRM</span>
              </a>
              <a href="${prefix}crm/crm.html#analytics" class="nav-sub-btn ${activeModule === 'crm' && activeSubpage === 'analytics' ? 'active' : ''}" data-module="crm" data-sub="analytics" onclick="window.navigateToModuleSubpage('crm', 'analytics', '${prefix}crm/crm.html#analytics', event)">
                <span class="nav-sub-dot"></span>
                <span>Revenue Forecast</span>
              </a>
            </div>
          </div>

          <!-- 2. Project Management (Forge PM) (Accordion) -->
          <div class="nav-group ${activeModule === 'project' ? 'open' : ''}" id="projectNavGroup" data-module-group="project">
            <button type="button" class="nav-btn nav-parent-btn ${activeModule === 'project' ? 'active' : ''}" id="projectParentToggle" onclick="window.toggleModuleAccordion('projectNavGroup', event)">
              <div class="nav-left">
                ${svg('project')}
                <span>Project Management</span>
              </div>
              ${svg('chevron', 'nav-chevron')}
            </button>
            <div class="nav-sub" id="projectSubNav">
              <a href="${prefix}project/Forge PM.html#dashboard" class="nav-sub-btn ${activeModule === 'project' && (activeSubpage === 'dashboard' || !activeSubpage) ? 'active' : ''}" data-module="project" data-sub="dashboard" onclick="window.navigateToModuleSubpage('project', 'dashboard', '${prefix}project/Forge PM.html#dashboard', event)">
                <span class="nav-sub-dot"></span>
                <span>PM Dashboard</span>
              </a>
              <a href="${prefix}project/Forge PM.html#project" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'project' ? 'active' : ''}" data-module="project" data-sub="project" onclick="window.navigateToModuleSubpage('project', 'project', '${prefix}project/Forge PM.html#project', event)">
                <span class="nav-sub-dot"></span>
                <span>Projects Portfolio</span>
              </a>
              <a href="${prefix}project/Forge PM.html#tickets" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'tickets' ? 'active' : ''}" data-module="project" data-sub="tickets" onclick="window.navigateToModuleSubpage('project', 'tickets', '${prefix}project/Forge PM.html#tickets', event)">
                <span class="nav-sub-dot"></span>
                <span>Tickets & Backlog</span>
              </a>
              <a href="${prefix}project/Forge PM.html#mytasks" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'mytasks' ? 'active' : ''}" data-module="project" data-sub="mytasks" onclick="window.navigateToModuleSubpage('project', 'mytasks', '${prefix}project/Forge PM.html#mytasks', event)">
                <span class="nav-sub-dot"></span>
                <span>My Tasks</span>
              </a>
              <a href="${prefix}project/Forge PM.html#automation" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'automation' ? 'active' : ''}" data-module="project" data-sub="automation" onclick="window.navigateToModuleSubpage('project', 'automation', '${prefix}project/Forge PM.html#automation', event)">
                <span class="nav-sub-dot"></span>
                <span>Automation Fix Bug</span>
                <span class="nav-badge-accent">AI</span>
              </a>
              <a href="${prefix}project/Forge PM.html#events" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'events' ? 'active' : ''}" data-module="project" data-sub="events" onclick="window.navigateToModuleSubpage('project', 'events', '${prefix}project/Forge PM.html#events', event)">
                <span class="nav-sub-dot"></span>
                <span>Events & Schedule</span>
              </a>
              <a href="${prefix}project/Forge PM.html#notes" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'notes' ? 'active' : ''}" data-module="project" data-sub="notes" onclick="window.navigateToModuleSubpage('project', 'notes', '${prefix}project/Forge PM.html#notes', event)">
                <span class="nav-sub-dot"></span>
                <span>Knowledge Notes</span>
              </a>
              <a href="${prefix}project/Forge PM.html#team" class="nav-sub-btn ${activeModule === 'project' && activeSubpage === 'team' ? 'active' : ''}" data-module="project" data-sub="team" onclick="window.navigateToModuleSubpage('project', 'team', '${prefix}project/Forge PM.html#team', event)">
                <span class="nav-sub-dot"></span>
                <span>Team Workload</span>
              </a>
            </div>
          </div>

          <!-- 3. Finance V3 Module (Accordion) -->
          <div class="nav-group ${activeModule === 'finance' ? 'open' : ''}" id="financeNavGroup" data-module-group="finance">
            <button type="button" class="nav-btn nav-parent-btn ${activeModule === 'finance' ? 'active' : ''}" id="financeParentToggle" onclick="window.toggleModuleAccordion('financeNavGroup', event)">
              <div class="nav-left">
                ${svg('finance')}
                <span>Finance & AR/AP</span>
              </div>
              ${svg('chevron', 'nav-chevron')}
            </button>
            <div class="nav-sub" id="financeSubNav">
              <a href="${prefix}finance/index.html#dashboard" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'dashboard' || activeSubpage === 'view-dashboard' || !activeSubpage) ? 'active' : ''}" data-module="finance" data-sub="dashboard" onclick="window.navigateToModuleSubpage('finance', 'dashboard', '${prefix}finance/index.html#dashboard', event)">
                <span class="nav-sub-dot"></span>
                <span>Cash Flow Overview</span>
              </a>
              <a href="${prefix}finance/index.html#invoices" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'invoices' || activeSubpage === 'view-invoices' || activeSubpage === 'penagihan' || activeSubpage === 'view-penagihan') ? 'active' : ''}" data-module="finance" data-sub="invoices" onclick="window.navigateToModuleSubpage('finance', 'invoices', '${prefix}finance/index.html#invoices', event)">
                <span class="nav-sub-dot"></span>
                <span>Pemasukan (AR & Termin)</span>
              </a>
              <a href="${prefix}finance/index.html#expenses" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'expenses' || activeSubpage === 'view-expenses' || activeSubpage === 'klaim' || activeSubpage === 'view-klaim') ? 'active' : ''}" data-module="finance" data-sub="expenses" onclick="window.navigateToModuleSubpage('finance', 'expenses', '${prefix}finance/index.html#expenses', event)">
                <span class="nav-sub-dot"></span>
                <span>Klaim & Struk (AI OCR)</span>
              </a>
              <a href="${prefix}finance/index.html#opex" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'opex' || activeSubpage === 'view-opex') ? 'active' : ''}" data-module="finance" data-sub="opex" onclick="window.navigateToModuleSubpage('finance', 'opex', '${prefix}finance/index.html#opex', event)">
                <span class="nav-sub-dot"></span>
                <span>Biaya Operasional (OPEX)</span>
              </a>
              <a href="${prefix}finance/index.html#payroll" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'payroll' || activeSubpage === 'view-payroll') ? 'active' : ''}" data-module="finance" data-sub="payroll" onclick="window.navigateToModuleSubpage('finance', 'payroll', '${prefix}finance/index.html#payroll', event)">
                <span class="nav-sub-dot"></span>
                <span>Penggajian (Payroll)</span>
              </a>
              <a href="${prefix}finance/index.html#vendor" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'vendor' || activeSubpage === 'view-vendor') ? 'active' : ''}" data-module="finance" data-sub="vendor" onclick="window.navigateToModuleSubpage('finance', 'vendor', '${prefix}finance/index.html#vendor', event)">
                <span class="nav-sub-dot"></span>
                <span>Tagihan Vendor</span>
              </a>
              <a href="${prefix}finance/index.html#freelancer" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'freelancer' || activeSubpage === 'view-freelancer') ? 'active' : ''}" data-module="finance" data-sub="freelancer" onclick="window.navigateToModuleSubpage('finance', 'freelancer', '${prefix}finance/index.html#freelancer', event)">
                <span class="nav-sub-dot"></span>
                <span>Pembayaran Freelancer</span>
              </a>
              <a href="${prefix}finance/index.html#accounts" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'accounts' || activeSubpage === 'view-accounts') ? 'active' : ''}" data-module="finance" data-sub="accounts" onclick="window.navigateToModuleSubpage('finance', 'accounts', '${prefix}finance/index.html#accounts', event)">
                <span class="nav-sub-dot"></span>
                <span>Daftar Rekening & Kas</span>
              </a>
              <a href="${prefix}finance/index.html#internal-transfer" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'internal-transfer' || activeSubpage === 'view-internal-transfer') ? 'active' : ''}" data-module="finance" data-sub="internal-transfer" onclick="window.navigateToModuleSubpage('finance', 'internal-transfer', '${prefix}finance/index.html#internal-transfer', event)">
                <span class="nav-sub-dot"></span>
                <span>Mutasi Internal</span>
              </a>
              <a href="${prefix}finance/index.html#reconciliation" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'reconciliation' || activeSubpage === 'view-reconciliation' || activeSubpage === 'recon' || activeSubpage === 'view-recon') ? 'active' : ''}" data-module="finance" data-sub="reconciliation" onclick="window.navigateToModuleSubpage('finance', 'reconciliation', '${prefix}finance/index.html#reconciliation', event)">
                <span class="nav-sub-dot"></span>
                <span>Rekonsiliasi Bank (CSV)</span>
              </a>
              <a href="${prefix}finance/index.html#coa" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'coa' || activeSubpage === 'view-coa' || activeSubpage === 'generic' || activeSubpage === 'view-generic') ? 'active' : ''}" data-module="finance" data-sub="coa" onclick="window.navigateToModuleSubpage('finance', 'coa', '${prefix}finance/index.html#coa', event)">
                <span class="nav-sub-dot"></span>
                <span>Chart of Accounts (COA)</span>
              </a>
              <a href="${prefix}finance/index.html#journal" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'journal' || activeSubpage === 'view-journal') ? 'active' : ''}" data-module="finance" data-sub="journal" onclick="window.navigateToModuleSubpage('finance', 'journal', '${prefix}finance/index.html#journal', event)">
                <span class="nav-sub-dot"></span>
                <span>Jurnal Umum</span>
              </a>
              <a href="${prefix}finance/index.html#report-company" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'report-company' || activeSubpage === 'view-report-company') ? 'active' : ''}" data-module="finance" data-sub="report-company" onclick="window.navigateToModuleSubpage('finance', 'report-company', '${prefix}finance/index.html#report-company', event)">
                <span class="nav-sub-dot"></span>
                <span>Laba Rugi Perusahaan</span>
              </a>
              <a href="${prefix}finance/index.html#report-project" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'report-project' || activeSubpage === 'view-report-project' || activeSubpage === 'profit' || activeSubpage === 'view-profit') ? 'active' : ''}" data-module="finance" data-sub="report-project" onclick="window.navigateToModuleSubpage('finance', 'report-project', '${prefix}finance/index.html#report-project', event)">
                <span class="nav-sub-dot"></span>
                <span>Profitabilitas Proyek</span>
              </a>
              <a href="${prefix}finance/index.html#report-customer" class="nav-sub-btn ${activeModule === 'finance' && (activeSubpage === 'report-customer' || activeSubpage === 'view-report-customer') ? 'active' : ''}" data-module="finance" data-sub="report-customer" onclick="window.navigateToModuleSubpage('finance', 'report-customer', '${prefix}finance/index.html#report-customer', event)">
                <span class="nav-sub-dot"></span>
                <span>Laporan per Customer</span>
              </a>
            </div>
          </div>

          <!-- 4. Marketing Module (Accordion) -->
          <div class="nav-group ${activeModule === 'marketing' ? 'open' : ''}" id="marketingNavGroup" data-module-group="marketing">
            <button type="button" class="nav-btn nav-parent-btn ${activeModule === 'marketing' ? 'active' : ''}" id="marketingParentToggle" onclick="window.toggleModuleAccordion('marketingNavGroup', event)">
              <div class="nav-left">
                ${svg('marketing')}
                <span>Marketing & AI</span>
              </div>
              ${svg('chevron', 'nav-chevron')}
            </button>
            <div class="nav-sub" id="marketingSubNav">
              <a href="${prefix}marketing/marketing.html#marketing-ops" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'marketing-ops' || activeSubpage === 'view-marketing-ops' || !activeSubpage) ? 'active' : ''}" data-module="marketing" data-sub="marketing-ops" onclick="window.navigateToModuleSubpage('marketing', 'marketing-ops', '${prefix}marketing/marketing.html#marketing-ops', event)">
                <span class="nav-sub-dot"></span>
                <span>Marketing Ops</span>
              </a>
              <a href="${prefix}marketing/marketing.html#ai-engine" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'ai-engine' || activeSubpage === 'view-ai-engine') ? 'active' : ''}" data-module="marketing" data-sub="ai-engine" onclick="window.navigateToModuleSubpage('marketing', 'ai-engine', '${prefix}marketing/marketing.html#ai-engine', event)">
                <span class="nav-sub-dot"></span>
                <span>AI Content Engine</span>
              </a>
              <a href="${prefix}marketing/marketing.html#approval-queue" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'approval-queue' || activeSubpage === 'view-approval-queue') ? 'active' : ''}" data-module="marketing" data-sub="approval-queue" onclick="window.navigateToModuleSubpage('marketing', 'approval-queue', '${prefix}marketing/marketing.html#approval-queue', event)">
                <span class="nav-sub-dot"></span>
                <span>Antrean Persetujuan</span>
              </a>
              <a href="${prefix}marketing/marketing.html#calendar" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'calendar' || activeSubpage === 'view-calendar') ? 'active' : ''}" data-module="marketing" data-sub="calendar" onclick="window.navigateToModuleSubpage('marketing', 'calendar', '${prefix}marketing/marketing.html#calendar', event)">
                <span class="nav-sub-dot"></span>
                <span>Content Calendar</span>
              </a>
              <a href="${prefix}marketing/marketing.html#distribution" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'distribution' || activeSubpage === 'view-distribution') ? 'active' : ''}" data-module="marketing" data-sub="distribution" onclick="window.navigateToModuleSubpage('marketing', 'distribution', '${prefix}marketing/marketing.html#distribution', event)">
                <span class="nav-sub-dot"></span>
                <span>Distribution Manager</span>
              </a>
              <a href="${prefix}marketing/marketing.html#asset-library" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'asset-library' || activeSubpage === 'view-asset-library') ? 'active' : ''}" data-module="marketing" data-sub="asset-library" onclick="window.navigateToModuleSubpage('marketing', 'asset-library', '${prefix}marketing/marketing.html#asset-library', event)">
                <span class="nav-sub-dot"></span>
                <span>Brand Asset Library</span>
              </a>
              <a href="${prefix}marketing/marketing.html#social-listening" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'social-listening' || activeSubpage === 'view-social-listening') ? 'active' : ''}" data-module="marketing" data-sub="social-listening" onclick="window.navigateToModuleSubpage('marketing', 'social-listening', '${prefix}marketing/marketing.html#social-listening', event)">
                <span class="nav-sub-dot"></span>
                <span>Social Listening</span>
              </a>
              <a href="${prefix}marketing/marketing.html#inbox" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'inbox' || activeSubpage === 'view-inbox') ? 'active' : ''}" data-module="marketing" data-sub="inbox" onclick="window.navigateToModuleSubpage('marketing', 'inbox', '${prefix}marketing/marketing.html#inbox', event)">
                <span class="nav-sub-dot"></span>
                <span>Omnichannel Inbox</span>
              </a>
              <a href="${prefix}marketing/marketing.html#content-history" class="nav-sub-btn ${activeModule === 'marketing' && (activeSubpage === 'content-history' || activeSubpage === 'view-content-history') ? 'active' : ''}" data-module="marketing" data-sub="content-history" onclick="window.navigateToModuleSubpage('marketing', 'content-history', '${prefix}marketing/marketing.html#content-history', event)">
                <span class="nav-sub-dot"></span>
                <span>Riwayat Konten</span>
              </a>
            </div>
          </div>

          <!-- 5. Kanban AI Global -->
          <a href="${prefix}index.html#aikanban" class="nav-btn ${activeModule === 'aikanban' ? 'active' : ''}" data-nav="aikanban" data-module="aikanban">
            ${svg('bot')}
            <span>Kanban AI (Global)</span>
          </a>
        </nav>

        <!-- Section: Control & Config -->
        <div class="nav-label">Control & Config</div>
        <nav class="nav" id="sidebar-nav-config">
          <a href="${prefix}index.html#analytics" class="nav-btn ${activeModule === 'analytics' ? 'active' : ''}" data-nav="analytics" data-module="analytics">
            ${svg('chart')}
            <span>Executive Reporting</span>
          </a>
          <a href="${prefix}index.html#integrations" class="nav-btn ${activeModule === 'integrations' ? 'active' : ''}" data-nav="integrations" data-module="integrations">
            ${svg('plug')}
            <span>Integrations Hub</span>
          </a>
          <a href="${prefix}index.html#rbac" class="nav-btn ${activeModule === 'rbac' ? 'active' : ''}" data-nav="rbac" data-module="rbac">
            ${svg('shield')}
            <span>Access & Audit (RBAC)</span>
          </a>
          <a href="${prefix}index.html#settings" class="nav-btn ${activeModule === 'settings' ? 'active' : ''}" data-nav="settings" data-module="settings">
            ${svg('settings')}
            <span>Settings</span>
          </a>
        </nav>

        <!-- Sidebar User Profile Footer -->
        <div class="sidebar-bottom">
          <div class="mini-user">
            <div class="avatar">AS</div>
            <div class="user-details">
              <strong>Asisyah Sarah A.</strong>
              <span>Project Manager</span>
            </div>
          </div>
        </div>
      </aside>
    `;

    // Target mount container
    let container = document.getElementById('sidebar-container');
    if (!container) {
      const existingSidebar = document.querySelector('aside.sidebar, aside');
      if (existingSidebar) {
        existingSidebar.outerHTML = sidebarHtml;
        setupMobileListeners();
        return;
      }
      const app = document.querySelector('.app, .app-container') || document.body;
      container = document.createElement('div');
      container.id = 'sidebar-container';
      app.insertBefore(container, app.firstChild);
    }
    container.innerHTML = sidebarHtml;
    setupMobileListeners();
  };

  // Toggle Accordion Submenu
  window.toggleModuleAccordion = function(groupId, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const group = document.getElementById(groupId);
    if (!group) return;
    const isCurrentlyOpen = group.classList.contains('open');
    
    // Optional: close other accordions for sleek accordion feel
    document.querySelectorAll('.nav-group').forEach(g => {
      if (g !== group) g.classList.remove('open');
    });

    if (!isCurrentlyOpen) {
      group.classList.add('open');
    } else {
      group.classList.remove('open');
    }
  };

  // Seamless Multi-Module Subpage Router
  window.navigateToModuleSubpage = function(targetModule, subpage, targetHref, e) {
    const p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    let isCurrentDocument = false;

    if (targetModule === 'crm' && (p.includes('crm.html') || p.includes('/crm/'))) isCurrentDocument = true;
    else if (targetModule === 'project' && (p.includes('forge pm.html') || p.includes('/project/'))) isCurrentDocument = true;
    else if (targetModule === 'finance' && (p.includes('/finance/') || p.includes('finance.html'))) isCurrentDocument = true;
    else if (targetModule === 'marketing' && (p.includes('marketing.html') || p.includes('/marketing/'))) isCurrentDocument = true;
    else if (targetModule === 'dashboard' && !p.includes('/crm/') && !p.includes('/finance/') && !p.includes('/marketing/') && !p.includes('/project/')) isCurrentDocument = true;

    if (isCurrentDocument) {
      if (e) e.preventDefault();

      // Trigger In-Page Dispatchers
      if (targetModule === 'crm' && typeof window.switchCrmPage === 'function') {
        window.switchCrmPage(subpage);
      } else if (targetModule === 'marketing' && typeof window.switchMarketingPage === 'function') {
        window.switchMarketingPage(subpage.replace('view-', ''));
      } else if (targetModule === 'finance') {
        if (typeof window.switchFinancePage === 'function') {
          window.switchFinancePage(subpage);
        } else {
          // Finance SPA switcher
          const rawSub = subpage.replace('view-', '');
          const targetViewId = 'view-' + rawSub;
          const viewEl = document.getElementById(targetViewId) || document.getElementById(subpage);
          if (viewEl) {
            document.querySelectorAll('.view-section').forEach(v => {
              v.style.display = 'none';
              v.classList.remove('active');
            });
            viewEl.style.display = 'block';
            viewEl.classList.add('active');
          }
        }
      } else if (targetModule === 'project') {
        // PM Forge subpage switcher
        const pageEl = document.getElementById('page-' + subpage);
        if (pageEl) {
          document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
          pageEl.classList.add('active');
          const bc = document.getElementById('bcCurrent');
          if (bc) bc.textContent = subpage.toUpperCase();
        }
      } else if (typeof window.showPage === 'function') {
        window.showPage(subpage);
      }

      // Update Active Classes in Sidebar
      const group = document.getElementById(targetModule + 'NavGroup');
      if (group) {
        group.querySelectorAll('.nav-sub-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.sub === subpage || btn.dataset.sub === subpage.replace('view-', ''));
        });
      }

      // Update URL Hash cleanly
      window.location.hash = subpage;

      // Close mobile drawer if opened
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    }
    // If not in the same document, normal browser navigation occurs to targetHref
  };

  // Mobile Menu & In-Page Listeners Setup
  function setupMobileListeners() {
    const mobileBtn = document.getElementById('mobileMenu') || document.querySelector('.mobile-toggle');
    if (mobileBtn) {
      mobileBtn.onclick = function(e) {
        if (e) e.preventDefault();
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.toggle('open');
      };
    }

    // In-page router click listener for root index.html
    const p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    const isRootIndex = !p.includes('/crm/') && !p.includes('/finance/') && !p.includes('/marketing/') && !p.includes('/project/');
    
    if (isRootIndex) {
      document.querySelectorAll('#sidebar [data-nav]').forEach(el => {
        el.addEventListener('click', function(e) {
          const navPage = this.getAttribute('data-nav');
          if (typeof window.showPage === 'function' && navPage) {
            e.preventDefault();
            window.showPage(navPage);
            window.location.hash = navPage;

            // Update top-level nav buttons
            document.querySelectorAll('#sidebar .nav-btn:not(.nav-parent-btn)').forEach(btn => {
              btn.classList.toggle('active', btn.getAttribute('data-nav') === navPage);
            });

            // Close mobile sidebar
            const sb = document.getElementById('sidebar');
            if (sb) sb.classList.remove('open');
          }
        });
      });
    }
  }

  // Auto initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('sidebar-container') || document.querySelector('aside.sidebar, aside');
      if (container) {
        const activePage = container.getAttribute('data-active-page');
        const activeSubpage = container.getAttribute('data-active-subpage');
        window.renderDynamicSidebar({ activePage, activeSubpage });
      }
    });
  } else {
    const container = document.getElementById('sidebar-container') || document.querySelector('aside.sidebar, aside');
    if (container) {
      const activePage = container.getAttribute('data-active-page');
      const activeSubpage = container.getAttribute('data-active-subpage');
      window.renderDynamicSidebar({ activePage, activeSubpage });
    }
  }

})();
