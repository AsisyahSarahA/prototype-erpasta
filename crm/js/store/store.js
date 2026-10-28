/**
 * store.js — Centralized Reactive Store (Pub/Sub Pattern)
 * Replaces React Context (useState, useContext, useReducer) from AppContext.tsx
 * 
 * API:
 *   store.getState()          → current state snapshot
 *   store.setState(patch)     → merge patch and notify subscribers
 *   store.subscribe(fn)       → register listener, returns unsubscribe fn
 *   store.dispatch(action)    → perform a named business action
 */

import {
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_ACTIVITIES,
  INITIAL_PROJECTS,
  INITIAL_INVOICES,
  INITIAL_WA_CONVERSATIONS,
  STANDARD_MOU_CLAUSES,
} from '../data/seedData.js';
import { calculateRabSummary, STANDARD_MODULE_TEMPLATES } from '../utils/rabCalculator.js';
import { createTopFromPreset } from '../utils/topCalculator.js';
import { validateStageTransition } from '../utils/pipelineRules.js';

// ── LocalStorage Persistence Key ────────────────────────────────
const LS_THEME_KEY = 'devhouse_theme';

// ── Initial State ────────────────────────────────────────────────
function buildInitialState() {
  const savedTheme = localStorage.getItem(LS_THEME_KEY);
  const isDarkMode = savedTheme
    ? savedTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    // Theme
    isDarkMode,

    // Navigation
    activeView: 'pipeline',         // 'pipeline'|'lead_detail'|'customers'|'projects'|'finance_top'|'contracts_legal'|'client_care'|'reports'
    selectedLeadId: 'lead-1',
    viewMode: 'kanban',             // 'kanban'|'table'|'workflow'

    // Search & Filters
    searchQuery: '',
    selectedPicFilter: 'ALL',
    selectedSourceFilter: 'ALL',

    // Core Data
    leads: INITIAL_LEADS,
    customers: INITIAL_CUSTOMERS,
    activities: INITIAL_ACTIVITIES,
    projects: INITIAL_PROJECTS,
    invoices: INITIAL_INVOICES,
    waConversations: INITIAL_WA_CONVERSATIONS,
    activeWaId: 'wa-1',
  };
}

// ── Store Factory ────────────────────────────────────────────────
function createStore(initialState) {
  let state = { ...initialState };
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(patch) {
    state = { ...state, ...patch };
    subscribers.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  // ── Computed Selectors ─────────────────────────────────────────
  function getSelectedLead() {
    return state.leads.find((l) => l.id === state.selectedLeadId) || null;
  }

  // ── Business Actions ───────────────────────────────────────────

  /** Toggle dark/light mode */
  function toggleDarkMode() {
    const next = !state.isDarkMode;
    localStorage.setItem(LS_THEME_KEY, next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setState({ isDarkMode: next });
  }

  /** Navigate to lead detail view */
  function navigateToLeadDetail(leadId) {
    setState({ selectedLeadId: leadId, activeView: 'lead_detail' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Navigate back to pipeline */
  function navigateBackToPipeline() {
    setState({ activeView: 'pipeline' });
  }

  /** Set active application view */
  function setActiveView(view) {
    if (view === 'pipeline') {
      setState({ activeView: 'pipeline', viewMode: 'kanban' });
    } else {
      setState({ activeView: view });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Set pipeline view mode */
  function setViewMode(mode) {
    setState({ viewMode: mode, activeView: 'pipeline' });
  }

  /** Alias for setViewMode */
  function setPipelineViewMode(mode) {
    setState({ viewMode: mode, activeView: 'pipeline' });
  }

  /**
   * Update a lead's pipeline stage
   * @param {string} leadId
   * @param {string} targetStage
   * @param {string} [rejectReason]
   * @returns {{ success: boolean, message?: string }}
   */
  function updateLeadStage(leadId, targetStage, rejectReason) {
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan.' };

    const validation = validateStageTransition(lead, targetStage, rejectReason);
    if (!validation.allowed) return { success: false, message: validation.message };

    setState({
      leads: state.leads.map((l) =>
        l.id !== leadId ? l : {
          ...l,
          stage_id: targetStage,
          days_in_stage: 0,
          last_activity_at: new Date().toISOString(),
        }
      ),
    });
    return { success: true };
  }

  /**
   * Add a new customer
   * @param {object} customerData
   * @returns {Customer}
   */
  function addNewCustomer(customerData) {
    const newCustId = `cust-${Date.now()}`;
    const codeNum = String(state.customers.length + 1).padStart(2, '0');
    const newCustomer = {
      id: newCustId,
      code: `CUST-0${codeNum}`,
      legal_name: customerData.legal_name || 'PT Pelanggan Baru',
      brand_name: customerData.brand_name || customerData.legal_name,
      industry: customerData.industry || 'Manufaktur & Fabrikasi',
      company_size: customerData.company_size || '50-100 Karyawan',
      website: customerData.website,
      npwp: customerData.npwp,
      address: customerData.address || 'Jakarta',
      city: customerData.city || 'Jakarta',
      province: customerData.province || 'DKI Jakarta',
      lifecycle_status: customerData.lifecycle_status || 'Prospect',
      first_touch_source: customerData.first_touch_source || 'Website',
      health_score: customerData.health_score ?? 85,
      contacts: customerData.contacts && customerData.contacts.length > 0
        ? customerData.contacts
        : [{
            id: `cnt-${Date.now()}`,
            name: 'PIC Utama',
            job_title: 'Manager Operasional',
            email: 'pic@perusahaan.com',
            whatsapp_number: '+6281234567890',
            role_type: 'decision_maker',
            is_primary: true,
          }],
    };
    setState({ customers: [newCustomer, ...state.customers] });
    return newCustomer;
  }

  /**
   * Add a new lead (creates customer if not found)
   * @param {object} leadData
   * @param {object} customerData
   * @returns {Lead}
   */
  function addNewLead(leadData, customerData) {
    let linkedCustomer;
    const existingCust = state.customers.find(
      (c) => customerData.legal_name && c.legal_name.toLowerCase() === customerData.legal_name.toLowerCase()
    );

    if (existingCust) {
      linkedCustomer = existingCust;
    } else {
      const newCustId = `cust-${Date.now()}`;
      linkedCustomer = {
        id: newCustId,
        code: `CUST-0${state.customers.length + 1}`,
        legal_name: customerData.legal_name || 'PT Customer Baru',
        brand_name: customerData.brand_name || customerData.legal_name,
        industry: customerData.industry || 'Teknologi & Bisnis',
        company_size: customerData.company_size || '50-100 Karyawan',
        website: customerData.website,
        address: customerData.address || 'Jakarta',
        city: customerData.city || 'Jakarta',
        province: customerData.province || 'DKI Jakarta',
        lifecycle_status: 'Prospect',
        first_touch_source: leadData.source || 'Website',
        health_score: 80,
        contacts: customerData.contacts && customerData.contacts.length > 0
          ? customerData.contacts
          : [{
              id: `cnt-${Date.now()}`,
              name: 'PIC Utama',
              job_title: 'Manager',
              email: 'contact@perusahaan.com',
              whatsapp_number: '+6281234567890',
              role_type: 'decision_maker',
              is_primary: true,
            }],
      };
      setState({ customers: [linkedCustomer, ...state.customers] });
    }

    const newLeadId = `lead-${Date.now()}`;
    const newLead = {
      id: newLeadId,
      code: `LD-2026-00${state.leads.length + 1}`,
      title: leadData.title || 'Prospek Proyek Baru',
      project_type: leadData.project_type || 'Web Application',
      customer_id: linkedCustomer.id,
      customer: linkedCustomer,
      primary_contact: linkedCustomer.contacts[0],
      est_value: leadData.est_value || 150000000,
      target_closing: leadData.target_closing || '2026-12-31',
      sales_pic: leadData.sales_pic || 'Asisyah Sarah Azzahra',
      sales_pic_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      priority: leadData.priority || 'Medium',
      stage_id: 'new_lead',
      source: leadData.source || 'Website',
      sub_source: leadData.sub_source,
      campaign: leadData.campaign,
      referrer_name: leadData.referrer_name,
      tags: leadData.tags || ['Inbound'],
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      days_in_stage: 0,
      ai_summary: 'Lead baru masuk ke dalam pipeline penjualan. Siap untuk tahap kualifikasi awal.',
      next_action: 'Hubungi PIC via WhatsApp atau jadwalkan Google Meet.',
      notes_count: 0,
      documents_count: 0,
      quotations: [],
    };

    setState({ leads: [newLead, ...state.leads] });
    return newLead;
  }

  /**
   * Update arbitrary fields on a lead
   * @param {string} leadId
   * @param {object} updates
   */
  function updateLead(leadId, updates) {
    setState({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, ...updates, last_activity_at: new Date().toISOString() } : l
      ),
    });
  }

  /**
   * Add an activity to the timeline
   * @param {object} activityData
   */
  function addActivity(activityData) {
    const newActivity = {
      ...activityData,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setState({
      activities: [newActivity, ...state.activities],
      leads: state.leads.map((l) =>
        l.id === activityData.lead_id
          ? { ...l, last_activity_at: new Date().toISOString() }
          : l
      ),
    });
  }

  /**
   * Generate AI RAB for a lead
   * @param {string} leadId
   * @param {string} promptText
   * @param {object} params
   * @returns {Promise<RabSummary>}
   */
  async function generateAiRab(leadId, promptText, params) {
    const synthesizedItems = STANDARD_MODULE_TEMPLATES.map((tmpl, idx) => {
      let multiplier = 1;
      if (params.complexity === 'Enterprise') multiplier = 1.25;
      if (params.complexity === 'Basic') multiplier = 0.8;

      const qty = Math.max(2, Math.round(tmpl.qty * multiplier));
      return {
        ...tmpl,
        id: `rab-gen-${Date.now()}-${idx}`,
        qty,
        subtotal: qty * tmpl.unit_price,
        source: 'AI',
        description: `${tmpl.description} (Disesuaikan dengan kebutuhan: "${promptText.slice(0, 50)}...")`,
      };
    });

    const contingency = params.contingency_pct || 10;
    const rabSummary = calculateRabSummary(synthesizedItems, contingency, 0, 11, 1, 'draft');

    setState({
      leads: state.leads.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          rab: rabSummary,
          est_value: rabSummary.grand_total,
          stage_id: l.stage_id === 'new_lead' || l.stage_id === 'follow_up' ? 'requirement' : l.stage_id,
          ai_summary: `RAB AI berhasil digenerate berdasarkan prompt kebutuhan: "${promptText}". Menghasilkan 15 modul terstruktur senilai ${rabSummary.grand_total.toLocaleString('id-ID')} IDR.`,
          last_activity_at: new Date().toISOString(),
        };
      }),
    });

    return rabSummary;
  }

  /**
   * Update lead RAB items manually
   */
  function updateLeadRabItems(leadId, items, contingency = 10, discount = 0) {
    setState({
      leads: state.leads.map((l) => {
        if (l.id !== leadId) return l;
        const currentVersion = (l.rab?.version || 1) + 1;
        const newSummary = calculateRabSummary(items, contingency, discount, 11, currentVersion, 'draft');
        return { ...l, rab: newSummary, est_value: newSummary.grand_total };
      }),
    });
  }

  /**
   * Mark RAB as reviewed
   */
  function markRabReviewed(leadId, reviewerName) {
    setState({
      leads: state.leads.map((l) => {
        if (l.id !== leadId || !l.rab) return l;
        return {
          ...l,
          rab: {
            ...l.rab,
            status: 'reviewed',
            reviewed_by: reviewerName,
            reviewed_at: new Date().toISOString(),
          },
        };
      }),
    });
  }

  /**
   * Save quotation with TOP scheme
   */
  function saveQuotationWithTop(leadId, topScheme, introLetter, versionLabel = 'Rev. 1') {
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead || !lead.rab) throw new Error('Lead or RAB not found');

    const quotationNumber = `QT/2026/10/00${(lead.quotations?.length || 0) + 12}`;
    const mouNumber = `MOU/2026/10/00${(lead.quotations?.length || 0) + 12}`;

    const newQuotation = {
      id: `quo-${Date.now()}`,
      lead_id: leadId,
      number: quotationNumber,
      mou_number: mouNumber,
      version_label: versionLabel,
      status: 'Follow Up',
      valid_days: 30,
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      intro_letter: introLetter,
      rab_summary: lead.rab,
      top_scheme: topScheme,
      clauses: STANDARD_MOU_CLAUSES,
    };

    setState({
      leads: state.leads.map((l) => {
        if (l.id !== leadId) return l;
        const existingQuos = l.quotations || [];
        return {
          ...l,
          stage_id: 'quotation',
          quotations: [newQuotation, ...existingQuos],
          active_quotation_id: newQuotation.id,
          last_activity_at: new Date().toISOString(),
        };
      }),
    });

    return newQuotation;
  }

  /**
   * Update quotation status (Deal triggers project + invoice creation)
   */
  function updateQuotationStatus(leadId, quotationId, newStatus, rejectReason) {
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan' };

    if (newStatus === 'Reject' && (!rejectReason || rejectReason.trim().length === 0)) {
      return { success: false, message: 'Wajib mengisi alasan penolakan (Reject Reason).' };
    }

    const quo = lead.quotations.find((q) => q.id === quotationId);
    if (!quo) return { success: false, message: 'Quotation tidak ditemukan' };

    // Map quotation status → pipeline stage
    let newStage = lead.stage_id;
    if (newStatus === 'Deal') newStage = 'deal';
    else if (newStatus === 'Reject') newStage = 'reject';
    else if (newStatus === 'Negosiasi') newStage = 'negotiation';
    else if (newStatus === 'Follow Up') newStage = 'quotation';

    let updatedLeads = state.leads.map((l) => {
      if (l.id !== leadId) return l;
      const updatedQuos = l.quotations.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: newStatus,
              reject_reason: rejectReason,
              signed_at: newStatus === 'Deal' ? new Date().toISOString() : q.signed_at,
              signed_by_client: newStatus === 'Deal' ? l.primary_contact.name : q.signed_by_client,
              signed_by_company: newStatus === 'Deal' ? 'Super Admin ASTACODE' : q.signed_by_company,
            }
          : q
      );
      return { ...l, stage_id: newStage, quotations: updatedQuos, last_activity_at: new Date().toISOString() };
    });

    let updatedCustomers = state.customers;
    let updatedProjects = state.projects;
    let updatedInvoices = state.invoices;

    // If DEAL: auto-create project + invoice
    if (newStatus === 'Deal') {
      updatedCustomers = state.customers.map((c) =>
        c.id === lead.customer_id ? { ...c, lifecycle_status: 'Active' } : c
      );

      const contractNumber = `CT/2026/10/00${state.projects.length + 8}`;
      const newProject = {
        id: `prj-${Date.now()}`,
        code: `PRJ-2026-00${state.projects.length + 2}`,
        lead_id: lead.id,
        customer_id: lead.customer_id,
        title: lead.title,
        customer_name: lead.customer.legal_name,
        pm_name: 'Reza Fahlevi, PMP',
        contract_number: contractNumber,
        contract_value: quo.top_scheme.total_amount,
        budget_mandays: quo.rab_summary.total_mandays,
        actual_mandays: 0,
        status: 'Active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
        progress_pct: 0,
        milestones: quo.top_scheme.items.map((term, i) => ({
          id: `ms-${Date.now()}-${i}`,
          name: `Milestone: ${term.name}`,
          target_date: new Date(Date.now() + (i + 1) * 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: i === 0 ? 'In Progress' : 'Pending',
          mandays_budget: Math.round(quo.rab_summary.total_mandays / quo.top_scheme.items.length),
          mandays_actual: 0,
        })),
        top_scheme: quo.top_scheme,
      };
      updatedProjects = [newProject, ...state.projects];

      const initialTerm = quo.top_scheme.items[0];
      if (initialTerm) {
        const newInvoice = {
          id: `inv-${Date.now()}`,
          invoice_number: `INV/2026/10/00${state.invoices.length + 3}`,
          contract_number: contractNumber,
          project_title: lead.title,
          customer_name: lead.customer.legal_name,
          termin_no: 1,
          termin_name: initialTerm.name,
          amount: Math.round(initialTerm.calculated_amount / 1.11),
          tax_amount: Math.round((initialTerm.calculated_amount / 1.11) * 0.11),
          grand_total: initialTerm.calculated_amount,
          status: 'Draft',
          due_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
          issued_at: new Date().toISOString().split('T')[0],
          trigger_event: 'Penandatanganan Kontrak & Kesepakatan Deal',
        };
        updatedInvoices = [newInvoice, ...state.invoices];
      }
    }

    setState({
      leads: updatedLeads,
      customers: updatedCustomers,
      projects: updatedProjects,
      invoices: updatedInvoices,
    });

    return { success: true };
  }

  /**
   * Issue invoice from contract term
   */
  function issueInvoiceFromTerm(contractNumber, termNo) {
    const project = state.projects.find((p) => p.contract_number === contractNumber);
    if (!project) return;
    const term = project.top_scheme.items.find((t) => t.term_no === termNo);
    if (!term) return;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: `INV/2026/11/00${state.invoices.length + 1}`,
      contract_number: contractNumber,
      project_title: project.title,
      customer_name: project.customer_name,
      termin_no: termNo,
      termin_name: term.name,
      amount: Math.round(term.calculated_amount / 1.11),
      tax_amount: Math.round((term.calculated_amount / 1.11) * 0.11),
      grand_total: term.calculated_amount,
      status: 'Draft',
      due_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      issued_at: new Date().toISOString().split('T')[0],
      trigger_event: `Trigger Termin ${termNo}: ${term.trigger_label}`,
    };

    setState({
      invoices: [newInvoice, ...state.invoices],
      projects: state.projects.map((p) => {
        if (p.contract_number !== contractNumber) return p;
        return {
          ...p,
          top_scheme: {
            ...p.top_scheme,
            items: p.top_scheme.items.map((t) =>
              t.term_no === termNo ? { ...t, status: 'Invoiced', is_locked: true } : t
            ),
          },
        };
      }),
    });
  }

  /**
   * Update a specific contract term
   */
  function updateContractTopTerm(projectId, termId, updates) {
    setState({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          top_scheme: {
            ...p.top_scheme,
            items: p.top_scheme.items.map((t) => (t.id === termId ? { ...t, ...updates } : t)),
          },
        };
      }),
    });
  }

  /**
   * Add a new project
   */
  function addNewProject(projectData) {
    const newPrj = {
      id: `prj-${Date.now()}`,
      code: `PRJ-2026-${String(state.projects.length + 1).padStart(3, '0')}`,
      lead_id: projectData.lead_id || `lead-${Date.now()}`,
      customer_id: projectData.customer_id || 'cust-1',
      title: projectData.title || 'Proyek Solusi Software Kustom',
      customer_name: projectData.customer_name || 'Klien ASTACODE',
      pm_name: projectData.pm_name || 'Asisyah Sarah Azzahra',
      contract_number: projectData.contract_number || `CT/2026/10/${String(state.projects.length + 10).padStart(4, '0')}`,
      contract_value: projectData.contract_value || 150000000,
      budget_mandays: projectData.budget_mandays || 80,
      actual_mandays: projectData.actual_mandays || 0,
      status: projectData.status || 'Active',
      start_date: projectData.start_date || new Date().toISOString().split('T')[0],
      end_date: projectData.end_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      progress_pct: projectData.progress_pct || 0,
      milestones: projectData.milestones || [
        { id: `ms-${Date.now()}-1`, name: 'Sprint 1: System Blueprint & Core DB', target_date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], status: 'In Progress', mandays_budget: 30, mandays_actual: 5 },
        { id: `ms-${Date.now()}-2`, name: 'Sprint 2: Core Feature Implementation', target_date: new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0], status: 'Pending', mandays_budget: 35, mandays_actual: 0 },
        { id: `ms-${Date.now()}-3`, name: 'UAT & BAST Sign-Off', target_date: new Date(Date.now() + 80 * 86400000).toISOString().split('T')[0], status: 'Pending', mandays_budget: 15, mandays_actual: 0 },
      ],
      top_scheme: projectData.top_scheme || createTopFromPreset('30/40/30', projectData.contract_value || 150000000, 'grand_total'),
      warranty_period: projectData.warranty_period || '90 Hari Pasca BAST',
      sla_level: projectData.sla_level || '99.5% Uptime SLA',
      esign_status: projectData.esign_status || 'Terverifikasi Sah UU ITE',
      signed_by_client: projectData.signed_by_client || 'Direktur Klien',
      signed_by_company: 'Asisyah Sarah Azzahra (Super Admin & PM ASTACODE)',
      signed_at: new Date().toISOString(),
    };

    setState({ projects: [newPrj, ...state.projects] });
    return newPrj;
  }

  /**
   * Send a WhatsApp message
   */
  function sendWaMessage(conversationId, text) {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setState({
      waConversations: state.waConversations.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          last_message: text,
          last_message_time: newMsg.timestamp,
          messages: [...c.messages, newMsg],
        };
      }),
    });
  }

  /**
   * Set WA AI mode for a conversation
   */
  function setWaAiMode(conversationId, mode) {
    setState({
      waConversations: state.waConversations.map((c) =>
        c.id === conversationId ? { ...c, ai_mode: mode } : c
      ),
    });
  }

  return {
    getState,
    setState,
    subscribe,
    // Selectors
    getSelectedLead,
    // Actions
    toggleDarkMode,
    navigateToLeadDetail,
    navigateBackToPipeline,
    setActiveView,
    setViewMode,
    setPipelineViewMode,
    updateLeadStage,
    addNewCustomer,
    addNewLead,
    updateLead,
    addActivity,
    generateAiRab,
    updateLeadRabItems,
    markRabReviewed,
    saveQuotationWithTop,
    updateQuotationStatus,
    issueInvoiceFromTerm,
    updateContractTopTerm,
    addNewProject,
    sendWaMessage,
    setWaAiMode,
  };
}

// ── Singleton Store Export ───────────────────────────────────────
const store = createStore(buildInitialState());
export default store;
