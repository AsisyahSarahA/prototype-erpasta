/**
 * Central State Management Store (ES Module Pub/Sub Pattern)
 * 100% Mirrors AppContext.tsx with full initial dataset and all application actions.
 */

import {
  INITIAL_PROJECTS,
  INITIAL_MEMBERS,
  INITIAL_EPICS,
  INITIAL_SPRINTS,
  INITIAL_TASKS,
  INITIAL_CRM_DEALS,
  INITIAL_INVOICES,
  INITIAL_EVENTS,
  INITIAL_COMMENTS,
  INITIAL_RULES
} from '../data/mockData.js';

class Store {
  constructor() {
    this.state = {
      projects: JSON.parse(JSON.stringify(INITIAL_PROJECTS)),
      selectedProjectId: 'proj-perpustakaan',
      activeTab: 'kanban',
      role: 'owner',
      tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
      epics: JSON.parse(JSON.stringify(INITIAL_EPICS)),
      sprints: JSON.parse(JSON.stringify(INITIAL_SPRINTS)),
      teamMembers: JSON.parse(JSON.stringify(INITIAL_MEMBERS)),
      crmDeals: JSON.parse(JSON.stringify(INITIAL_CRM_DEALS)),
      invoices: JSON.parse(JSON.stringify(INITIAL_INVOICES)),
      events: JSON.parse(JSON.stringify(INITIAL_EVENTS)),
      comments: JSON.parse(JSON.stringify(INITIAL_COMMENTS)),
      automationRules: JSON.parse(JSON.stringify(INITIAL_RULES)),
      toasts: [],
      isMobileSidebarOpen: false,
      searchQuery: '',
      filterType: 'all',
      filterPriority: 'all',
      filterSeverity: 'all',
      filterAssignee: 'all',
      filterEpic: 'all',
      selectedTask: null,
      isCreateTaskModalOpen: false,
      isSopGuideModalOpen: false,
      isIntakeModalOpen: false,
      activeFlow: 'flowB',
      isStepperExpanded: false,
      githubSettings: {
        isConnected: true,
        accountName: 'agensi-tech-bot',
        organization: 'agensi-software-house',
        authType: 'pat',
        apiKey: 'ghp_9k2L8vM14pQxW3zT5aY7eR6uI0oP8sD39aF',
        tokenMasked: 'ghp_9k2L...39aF',
        tokenScopes: ['repo', 'workflow', 'admin:org'],
        defaultBranch: 'main',
        repoVisibility: 'private',
        autoCreateRepo: true,
        autoCreateEpicBranches: true,
        autoInviteCollaborators: true,
        branchPrefixEpic: 'epic/',
        branchPrefixFeature: 'feat/',
        branchPrefixFix: 'fix/',
        enforceBranchProtection: true,
        requireReviews: true,
        minApprovals: 1,
        requireStatusChecks: true,
        requireLinearHistory: false,
        webhookSecret: 'whsec_98fbc1a284e9411d332cba91b',
        webhookUrl: 'https://api.softwarehouse.dev/api/webhooks/github'
      },
      notifications: [
        {
          id: 'notif-init-1',
          title: '[Finance] Invoice DP Kick-Off Disetujui',
          message: 'Invoice INV/2026/10/LIB-001 (Termin DP 30%) untuk Perpustakaan Digital telah diverifikasi dan lunas.',
          type: 'finance',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          isRead: false,
          projectId: 'proj-perpustakaan',
          amount: 55500000,
          percentage: 30
        },
        {
          id: 'notif-init-2',
          title: '[CRM] Closing Proyek Perpustakaan Digital',
          message: 'Deal DEAL-PERPUS-01 dikonversi ke Proyek Engineering. Pipeline termin 1, 2, 3 tercatat.',
          type: 'crm',
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          isRead: true,
          projectId: 'proj-perpustakaan'
        }
      ]
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Store subscriber error:', err);
      }
    }
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  // --- Toasts ---
  addToast(type, title, message = '') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { id, type, title, message };
    this.setState({ toasts: [...this.state.toasts, newToast] });

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id) {
    this.setState({ toasts: this.state.toasts.filter((t) => t.id !== id) });
  }

  // --- Navigation & Core Filters ---
  setSelectedProjectId(projectId) {
    this.setState({ selectedProjectId: projectId, filterEpic: 'all', filterAssignee: 'all' });
  }

  setActiveTab(tab) {
    this.setState({ activeTab: tab, isMobileSidebarOpen: false });
  }

  setRole(role) {
    this.setState({ role });
  }

  setSearchQuery(q) {
    this.setState({ searchQuery: q });
  }

  setFilterType(type) {
    this.setState({ filterType: type });
  }

  setFilterPriority(priority) {
    this.setState({ filterPriority: priority });
  }

  setFilterSeverity(severity) {
    this.setState({ filterSeverity: severity });
  }

  setFilterAssignee(assigneeId) {
    this.setState({ filterAssignee: assigneeId });
  }

  setFilterEpic(epicId) {
    this.setState({ filterEpic: epicId });
  }

  resetFilters() {
    this.setState({
      searchQuery: '',
      filterType: 'all',
      filterPriority: 'all',
      filterSeverity: 'all',
      filterAssignee: 'all',
      filterEpic: 'all'
    });
  }

  // --- Modals & Detail Navigation ---
  openTaskDetail(task) {
    this.setState({
      selectedTask: task,
      previousTab: this.state.activeTab !== 'task_detail' ? this.state.activeTab : (this.state.previousTab || 'kanban'),
      activeTab: 'task_detail'
    });
  }

  closeTaskDetail() {
    const returnTab = this.state.previousTab || 'kanban';
    this.setState({
      selectedTask: null,
      activeTab: returnTab
    });
  }

  openCreateTaskModal() {
    this.setState({ isCreateTaskModalOpen: true });
  }

  closeCreateTaskModal() {
    this.setState({ isCreateTaskModalOpen: false });
  }

  openSopGuideModal() {
    this.setState({ isSopGuideModalOpen: true });
  }

  closeSopGuideModal() {
    this.setState({ isSopGuideModalOpen: false });
  }

  openIntakeModal() {
    this.setState({ isIntakeModalOpen: true });
  }

  closeIntakeModal() {
    this.setState({ isIntakeModalOpen: false });
  }

  toggleMobileSidebar(force) {
    const next = typeof force === 'boolean' ? force : !this.state.isMobileSidebarOpen;
    this.setState({ isMobileSidebarOpen: next });
  }

  setActiveFlow(flow) {
    this.setState({ activeFlow: flow });
  }

  toggleStepperExpanded() {
    this.setState({ isStepperExpanded: !this.state.isStepperExpanded });
  }

  toggleKillSwitch(projectId) {
    const updatedProjects = this.state.projects.map((p) => {
      if (p.id === projectId) {
        return { ...p, killSwitchActive: !p.killSwitchActive };
      }
      return p;
    });
    this.setState({ projects: updatedProjects });
    this.addToast('info', 'Status Kill Switch Berubah', 'Status kill switch proyek telah diperbarui.');
  }

  // --- Task Operations ---
  updateTaskStatus(taskId, targetStatus, reason = '') {
    const currentTask = this.state.tasks.find((t) => t.id === taskId);
    const oldStatus = currentTask ? currentTask.status : 'Unknown';

    const updatedTasks = this.state.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: targetStatus,
          lastStatusUpdated: new Date().toISOString()
        };
      }
      return task;
    });

    let selectedTask = this.state.selectedTask;
    if (selectedTask && selectedTask.id === taskId) {
      selectedTask = { ...selectedTask, status: targetStatus };
    }

    // Append-only audit trail event (PRD Section 6.20)
    const actor = (this.state.teamMembers || []).find(m => m.id === (this.state.role === 'pm' ? 'user-pm' : this.state.role === 'qa' ? 'user-qa' : 'user-dev-1')) || { name: 'Sistem Manjer', role: 'System' };
    const auditEvent = {
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      taskId,
      actorName: actor.name,
      actorRole: actor.role,
      action: `Mengubah status dari "${oldStatus}" ke "${targetStatus}"`,
      reason: reason || undefined,
      timestamp: new Date().toISOString()
    };

    const newEvents = [auditEvent, ...(this.state.events || [])];

    this.setState({ tasks: updatedTasks, selectedTask, events: newEvents });
    this.addToast('success', 'Status Tiket Diperbarui', `Tiket dipindahkan ke: ${targetStatus}`);
  }

  updateTask(taskId, updates) {
    const updatedTasks = this.state.tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates, lastStatusUpdated: new Date().toISOString() };
      }
      return task;
    });

    let selectedTask = this.state.selectedTask;
    if (selectedTask && selectedTask.id === taskId) {
      selectedTask = { ...selectedTask, ...updates };
    }

    this.setState({ tasks: updatedTasks, selectedTask });
  }

  deleteTask(taskId) {
    this.setState({
      tasks: this.state.tasks.filter((t) => t.id !== taskId),
      selectedTask: null
    });
    this.addToast('info', 'Tiket Dihapus', 'Tiket berhasil dihapus dari backlog.');
  }

  createTask(taskData) {
    return this.addTask(taskData);
  }

  addTask(taskData) {
    const targetProjectId = taskData.projectId || this.state.selectedProjectId;
    const targetProject = this.state.projects.find((p) => p.id === targetProjectId) || this.getActiveProject() || this.state.projects[0];
    const projectTasks = this.state.tasks.filter((t) => t.projectId === targetProject.id);
    const nextIndex = 100 + projectTasks.length + 1;
    const projectCode = targetProject ? targetProject.code.split('-')[0] : 'TASK';
    const key = `${projectCode}-${nextIndex}`;

    const newTask = {
      id: `task_${Date.now()}`,
      key,
      projectId: targetProject.id,
      epicId: taskData.epicId || '',
      type: taskData.type || 'Task',
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || (taskData.type === 'Bug' ? 'Baru' : 'Backlog'),
      priority: taskData.priority || 'Sedang',
      difficulty: taskData.difficulty,
      severity: taskData.severity || (taskData.type === 'Bug' ? 'S2 - Major' : undefined),
      environment: taskData.environment || (taskData.type === 'Bug' ? 'Production' : undefined),
      warrantyStatus: taskData.warrantyStatus || (taskData.type === 'Bug' ? 'Garansi Proyek (Gratis)' : undefined),
      slaTargetMinutes: taskData.slaTargetMinutes || (taskData.severity?.startsWith('S1') ? 30 : taskData.severity?.startsWith('S2') ? 120 : undefined),
      reproductionSteps: taskData.reproductionSteps,
      expectedBehavior: taskData.expectedBehavior,
      actualBehavior: taskData.actualBehavior,
      source: taskData.source || 'Manual',
      assigneeId: taskData.assigneeId || 'user-dev-1',
      reporterId: taskData.reporterId || 'user-pm',
      estimateHours: Number(taskData.estimateHours) || 4,
      timeLoggedHours: 0,
      startDate: taskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      visibility: taskData.visibility || 'client_public',
      subtasks: taskData.subtasks || [
        { id: `sub_${Date.now()}_1`, title: 'Implementasi komponen / kode utama', completed: false },
        { id: `sub_${Date.now()}_2`, title: 'Verifikasi pengujian & review PR', completed: false }
      ],
      relations: taskData.relations || [],
      createdAt: new Date().toISOString(),
      lastStatusUpdated: new Date().toISOString()
    };

    this.setState({
      tasks: [newTask, ...this.state.tasks],
      isCreateTaskModalOpen: false
    });
    this.addToast('success', 'Task Berhasil Dibuat', `${key}: ${newTask.title}`);
    return newTask;
  }

  submitBugIntake(report) {
    return this.ingestBugReport(report);
  }

  ingestBugReport(report) {
    const project = this.state.projects.find((p) => p.id === report.projectId) || this.getActiveProject();
    const projectCode = project ? project.code.split('-')[0] : 'BUG';
    const nextKey = `${projectCode}-B${Math.floor(100 + Math.random() * 900)}`;

    const newBug = {
      id: `bug-${Date.now()}`,
      key: nextKey,
      projectId: report.projectId,
      epicId: report.epicId || '',
      type: 'Bug',
      title: report.title,
      description: report.description || '',
      status: 'Baru',
      priority: report.priority || 'Tinggi',
      severity: report.severity || 'S2 - Major',
      environment: report.environment || 'Production',
      warrantyStatus: report.warrantyStatus || 'Garansi Proyek (Gratis)',
      source: report.source || 'Telegram Bot',
      telegramChatId: report.telegramChatId || 'tg-client-88219',
      telegramCorrelationId: `tg-corr-${Date.now()}`,
      slaTargetMinutes: (report.severity || '').startsWith('S1') ? 30 : 120,
      slaDueAt: new Date(Date.now() + ((report.severity || '').startsWith('S1') ? 30 : 120) * 60000).toISOString(),
      assigneeId: 'user-dev-3',
      reporterId: 'user-pm',
      estimateHours: 12,
      timeLoggedHours: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      visibility: 'client_public',
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Verifikasi reproduksi bug & log exception', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Tulis patch fix & unit regression test', completed: false }
      ],
      createdAt: new Date().toISOString(),
      lastStatusUpdated: new Date().toISOString()
    };

    this.setState({
      tasks: [newBug, ...this.state.tasks],
      isIntakeModalOpen: false
    });

    this.addToast('success', 'Laporan Masuk Berhasil Di-triage', `Tiket ${nextKey} tercatat di sistem.`);
    return newBug;
  }

  toggleSubtask(taskId, subtaskId) {
    const updatedTasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubs = t.subtasks.map((st) => {
          if (st.id === subtaskId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        return { ...t, subtasks: updatedSubs };
      }
      return t;
    });

    let selectedTask = this.state.selectedTask;
    if (selectedTask && selectedTask.id === taskId) {
      const updatedSubs = selectedTask.subtasks.map((st) => {
        if (st.id === subtaskId) {
          return { ...st, completed: !st.completed };
        }
        return st;
      });
      selectedTask = { ...selectedTask, subtasks: updatedSubs };
    }

    this.setState({ tasks: updatedTasks, selectedTask });
  }

  addSubtask(taskId, title) {
    if (!title || !title.trim()) return;
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSub = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      completed: false
    };

    const updatedTasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...(t.subtasks || []), newSub]
        };
      }
      return t;
    });

    let selectedTask = this.state.selectedTask;
    if (selectedTask && selectedTask.id === taskId) {
      selectedTask = {
        ...selectedTask,
        subtasks: [...(selectedTask.subtasks || []), newSub]
      };
    }

    this.setState({ tasks: updatedTasks, selectedTask });
    this.addToast('success', 'Subtask Ditambahkan', `"${newSub.title}" siap dikerjakan.`);
  }

  deleteSubtask(taskId, subtaskId) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedTasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId)
        };
      }
      return t;
    });

    let selectedTask = this.state.selectedTask;
    if (selectedTask && selectedTask.id === taskId) {
      selectedTask = {
        ...selectedTask,
        subtasks: (selectedTask.subtasks || []).filter((s) => s.id !== subtaskId)
      };
    }

    this.setState({ tasks: updatedTasks, selectedTask });
    this.addToast('info', 'Subtask Dihapus', 'Subtask telah dihapus dari tiket.');
  }

  // --- CRM Deal Execution & Module Breakdown (varian dengan invoice termin & notifikasi) ---
  // CATATAN: sebelumnya method ini bernama sama dengan convertCrmDealToProject di bagian
  // "CRM & Engineering Handover" sehingga tertimpa (dead code). Diganti nama agar tidak bentrok.
  convertCrmDealToProjectWithInvoices(dealId, options = {}) {
    const deal = (this.state.crmDeals || []).find((d) => d.id === dealId);
    if (!deal) {
      this.addToast('error', 'Deal Tidak Ditemukan', 'Gagal mengeksekusi deal.');
      return null;
    }

    const projectCode = (options.projectCode || deal.projectCode || 'PROJ').toUpperCase().trim();
    const projectId = `proj-${projectCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const projectName = deal.title || deal.name || 'Proyek Software House';
    const clientName = deal.clientName || deal.company || 'Klien Korporat';
    const totalContractValue = Number(deal.contractValue || deal.dealValue || 120000000);
    const repoName = options.repoName || projectCode.toLowerCase() + '-repo';
    const modules = options.modules && options.modules.length > 0 ? options.modules : [
      { keySuffix: 'EPIC-1', title: 'Fondasi Sistem & Autentikasi Pengguna', description: 'Arsitektur database, sistem role permission & backend API', defaultAssigneeId: 'user-dev-1', estimateHours: 24 },
      { keySuffix: 'EPIC-2', title: 'Fitur Inti & Alur Bisnis Transaksi', description: 'Core business logic & antarmuka operasional pengguna', defaultAssigneeId: 'user-dev-2', estimateHours: 32 },
      { keySuffix: 'EPIC-3', title: 'Integrasi Eksternal & Payment Gateway', description: 'Koneksi API pihak ketiga, webhook & pelaporan', defaultAssigneeId: 'user-dev-3', estimateHours: 20 },
      { keySuffix: 'EPIC-4', title: 'QA Staging, Security Test & Rilis Produksi', description: 'Pengujian integrasi sistem, stress test & deployment', defaultAssigneeId: 'user-qa', estimateHours: 16 }
    ];

    // 1. Create Project
    const newProject = {
      id: projectId,
      code: projectCode,
      name: projectName,
      clientName: clientName,
      contractValue: totalContractValue,
      status: 'In Progress',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      techStack: ['Laravel 11', 'React 19', 'PostgreSQL', 'Redis', 'Docker'],
      description: `Proyek hasil eksekusi Deal CRM [${deal.dealCode || deal.id}]. Pembagian ${modules.length} modul mandiri.`,
      repoName: repoName
    };

    // 2. Generate Epics (Modules) and Child Tasks with Subtasks
    const epicColors = ['#6554c0', '#0052cc', '#00875a', '#ff8b00', '#00a3bf', '#e5493a', '#403294'];
    const newEpics = [];
    const newTasks = [];

    modules.forEach((mod, idx) => {
      const epicKey = mod.epicKey || `${projectCode}-${mod.keySuffix || ('EPIC-' + (idx + 1))}`;
      const epicId = `epic-${projectId}-${idx + 1}`;
      const color = epicColors[idx % epicColors.length];

      newEpics.push({
        id: epicId,
        projectId: projectId,
        key: epicKey,
        title: mod.title,
        description: mod.description || `Spesifikasi teknis modul ${mod.title}`,
        color: color
      });

      // Core / Backend Task for Module
      newTasks.push({
        id: `task-${projectId}-${idx + 1}-1`,
        key: `${projectCode}-${101 + idx * 2}`,
        projectId: projectId,
        epicId: epicId,
        title: `[Core/Backend] ${mod.title}`,
        description: `Implementasi backend, skema basis data, dan endpoint API untuk modul: ${mod.title}.\n\nSpesifikasi:\n${mod.description || 'Pengerjaan REST API dan business logic.'}`,
        status: idx === 0 ? 'In Progress' : 'To Do',
        priority: idx === 0 ? 'Tinggi' : 'Sedang',
        type: 'Story',
        assigneeId: mod.assigneeId || mod.defaultAssigneeId || (idx % 2 === 0 ? 'user-dev-1' : 'user-dev-3'),
        estimateHours: Math.round((Number(mod.estimateHours) || 20) * 0.6),
        timeLoggedHours: idx === 0 ? 4 : 0,
        subtasks: [
          { id: `st-${Date.now()}-${idx}-1`, title: 'Rancangan skema database & migrasi SQL', completed: idx === 0 },
          { id: `st-${Date.now()}-${idx}-2`, title: 'Implementasi API controller & service repository', completed: false },
          { id: `st-${Date.now()}-${idx}-3`, title: 'Validasi input request & unit test assertion', completed: false }
        ],
        createdAt: new Date().toISOString()
      });

      // UI / Integration Task for Module
      newTasks.push({
        id: `task-${projectId}-${idx + 1}-2`,
        key: `${projectCode}-${102 + idx * 2}`,
        projectId: projectId,
        epicId: epicId,
        title: `[UI/Frontend] Antarmuka & Slicing ${mod.title}`,
        description: `Slicing tampilan antarmuka dan integrasi state klien untuk modul: ${mod.title}.`,
        status: 'Backlog',
        priority: 'Sedang',
        type: 'Story',
        assigneeId: 'user-dev-2',
        estimateHours: Math.round((Number(mod.estimateHours) || 20) * 0.4),
        timeLoggedHours: 0,
        subtasks: [
          { id: `st-${Date.now()}-${idx}-4`, title: 'Slicing komponen visual responsif', completed: false },
          { id: `st-${Date.now()}-${idx}-5`, title: 'Integrasi state store & API hook', completed: false }
        ],
        createdAt: new Date().toISOString()
      });
    });

    // 3. Generate Invoicing Schedule (SOP Termin Penagihan)
    const newInvoices = [
      {
        id: `inv-${Date.now()}-1`,
        invoiceNumber: `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${projectCode}-001`,
        projectId: projectId,
        clientId: 'client-1',
        clientName: clientName,
        clientEmail: `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
        type: 'Termin DP 30% (Kick-Off Proyek)',
        percentage: 30,
        status: 'Terkirim ke Finance',
        subtotal: totalContractValue * 0.3,
        taxPpn: totalContractValue * 0.3 * 0.11,
        totalAmount: totalContractValue * 0.3 * 1.11,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: `Pembayaran Down Payment (DP) 30% untuk inisialisasi pengerjaan proyek ${projectName} (${modules.length} modul).`,
        items: [
          {
            id: `item-${Date.now()}-1`,
            description: `Termin 1 (DP 30%) - Kick-off Proyek & Pembagian ${modules.length} Modul Arsitektur`,
            hours: 40,
            rate: Math.round((totalContractValue * 0.3) / 40),
            amount: totalContractValue * 0.3
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: `inv-${Date.now()}-2`,
        invoiceNumber: `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${projectCode}-002`,
        projectId: projectId,
        clientId: 'client-1',
        clientName: clientName,
        clientEmail: `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
        type: 'Termin Milestone 40% (QA Sign-Off)',
        percentage: 40,
        status: 'Draft',
        subtotal: totalContractValue * 0.4,
        taxPpn: totalContractValue * 0.4 * 0.11,
        totalAmount: totalContractValue * 0.4 * 1.11,
        dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        notes: `Termin 2 (Milestone 40%) - Validasi Staging QA & UAT Klien setelah progres melampaui ambang batas 10%.`,
        items: [
          {
            id: `item-${Date.now()}-2`,
            description: `Termin 2 (Milestone 40%) - Pengerjaan & Verifikasi Pengujian Modul`,
            hours: 60,
            rate: Math.round((totalContractValue * 0.4) / 60),
            amount: totalContractValue * 0.4
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: `inv-${Date.now()}-3`,
        invoiceNumber: `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${projectCode}-003`,
        projectId: projectId,
        clientId: 'client-1',
        clientName: clientName,
        clientEmail: `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
        type: 'Termin Pelunasan 30% (Go-Live & Handover)',
        percentage: 30,
        status: 'Draft',
        subtotal: totalContractValue * 0.3,
        taxPpn: totalContractValue * 0.3 * 0.11,
        totalAmount: totalContractValue * 0.3 * 1.11,
        dueDate: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0],
        notes: `Termin 3 (Pelunasan 30%) - Serah terima source code, deployment production, dan garansi maintenance bug 12 bulan.`,
        items: [
          {
            id: `item-${Date.now()}-3`,
            description: `Termin 3 (Pelunasan 30%) - Go-Live Production & Dokumen Serah Terima`,
            hours: 40,
            rate: Math.round((totalContractValue * 0.3) / 40),
            amount: totalContractValue * 0.3
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    // 4. Update Deal Status to Won/Deal
    const updatedDeals = (this.state.crmDeals || []).map((d) => {
      if (d.id === dealId) {
        return {
          ...d,
          stage: 'Deal',
          status: 'Deal',
          isConverted: true,
          projectCode: projectCode,
          convertedProjectId: newProject.id
        };
      }
      return d;
    });

    // 5. Dual-Broadcast Notification
    const newNotifications = [
      {
        id: `notif-${Date.now()}-finance`,
        title: `[Finance] Tagihan Termin DP 30% Diterbitkan`,
        message: `Invoice DP ${projectCode}-001 senilai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalContractValue * 0.3 * 1.11)} untuk proyek "${projectName}" siap ditagihkan ke klien.`,
        type: 'finance',
        timestamp: new Date().toISOString(),
        isRead: false,
        projectId: newProject.id,
        amount: totalContractValue * 0.3 * 1.11,
        percentage: 30
      },
      {
        id: `notif-${Date.now()}-crm`,
        title: `[CRM] Deal Won Berhasil Dieksekusi!`,
        message: `Deal "${deal.title}" resmi dieksekusi menjadi Proyek "${projectName}" (${projectCode}) dan dibagi menjadi ${modules.length} modul engineering.`,
        type: 'crm',
        timestamp: new Date().toISOString(),
        isRead: false,
        projectId: newProject.id
      }
    ];

    // 6. Commit to State
    this.setState({
      projects: [...this.state.projects, newProject],
      epics: [...this.state.epics, ...newEpics],
      tasks: [...this.state.tasks, ...newTasks],
      invoices: [...newInvoices, ...this.state.invoices],
      crmDeals: updatedDeals,
      notifications: [...newNotifications, ...this.state.notifications],
      selectedProjectId: newProject.id
    });

    this.addToast(
      'success',
      'Proyek & Modul Berhasil Diinisialisasi!',
      `Proyek "${projectName}" dibuat dengan ${modules.length} modul dan jadwal termin.`
    );

    return newProject;
  }

  // --- Finance & Invoices ---
  createInvoiceFromCompletedTasks(projectId, taskIds, invoiceType) {
    const project = this.state.projects.find((p) => p.id === projectId);
    const selectedTasks = this.state.tasks.filter((t) => taskIds.includes(t.id));
    const invNumber = `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${project?.code || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;

    const items = selectedTasks.map((t) => ({
      id: `item-${t.id}`,
      description: `[${t.key}] ${t.title}`,
      hours: t.timeLoggedHours || t.estimateHours || 8,
      rate: 350000,
      amount: (t.timeLoggedHours || t.estimateHours || 8) * 350000
    }));

    const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
    const tax = subtotal * 0.11;
    const total = subtotal + tax;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      projectId,
      clientId: 'client-1',
      clientName: project?.clientName || 'Klien',
      clientEmail: project?.clientEmail || 'client@mail.com',
      type: invoiceType,
      status: 'Terkirim ke Finance',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items,
      subtotal,
      tax,
      total,
      notes: 'Penagihan pengerjaan modul task selesai sesuai SOP Software House.',
      bankAccount: 'BCA 8830-1928-11 a.n PT Agensi Solusi Teknologi'
    };

    // Mark tasks as billed
    const updatedTasks = this.state.tasks.map((t) => {
      if (taskIds.includes(t.id)) {
        return { ...t, billedInvoiceId: newInvoice.id };
      }
      return t;
    });

    this.setState({
      invoices: [newInvoice, ...this.state.invoices],
      tasks: updatedTasks
    });

    this.addToast('success', 'Invoice Berhasil Diterbitkan', `${invNumber} terkirim ke bagian Finance.`);
    return newInvoice;
  }

  createCustomProgressInvoice(params) {
    const project = this.state.projects.find((p) => p.id === params.projectId) || this.getActiveProject();
    const currentProgress = this.getProjectProgress(project.id);

    if (currentProgress < 10) {
      const errMsg = `Invoice belum dapat diterbitkan karena progres proyek "${project.name}" saat ini baru ${currentProgress}%. Sesuai SOP & PRD, progres pengerjaan minimal harus mencapai ≥ 10%.`;
      this.addToast('error', 'Syarat Progres Belum Terpenuhi', errMsg);
      return { success: false, error: errMsg };
    }

    const subtotal = params.customAmount;
    const taxPpn = Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxPpn;

    const newInvoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: `INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${project.code}-${Math.floor(Math.random() * 800 + 100)}`,
      projectId: project.id,
      clientName: project.clientName,
      type: 'Milestone Termin',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: params.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'item_' + Date.now(),
          taskId: undefined,
          description: params.title || `Termin ${params.percentage}% Proyek ${project.name}`,
          hoursOrUnits: 1,
          ratePerUnit: subtotal,
          amount: subtotal
        }
      ],
      subtotal,
      discount: 0,
      taxPpn,
      totalAmount,
      status: 'Terkirim ke Finance',
      percentage: params.percentage,
      projectProgressAtIssue: currentProgress,
      notes: params.notes || 'Invoice diterbitkan otomatis berdasarkan capaian progres proyek ≥ 10% dan diteruskan ke Finance.',
      bankAccount: {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '883-091-2391',
        accountHolder: 'PT Digital Manjer Solusindo'
      }
    };

    this.setState({ invoices: [newInvoice, ...this.state.invoices] });

    const formatRupiah = (val) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    // 1. Notification for Finance
    this.addNotification({
      title: `[Finance] Invoice Baru Diterima: ${newInvoice.invoiceNumber}`,
      message: `Invoice termin ${params.percentage}% senilai ${formatRupiah(totalAmount)} untuk proyek "${project.name}" (Progres ${currentProgress}%) telah diterbitkan dan masuk ke antrean verifikasi Finance.`,
      type: 'finance',
      projectId: project.id,
      invoiceId: newInvoice.id,
      amount: totalAmount,
      percentage: params.percentage
    });

    // 2. Notification for CRM
    this.addNotification({
      title: `[CRM] Update Finansial Deal: ${project.name}`,
      message: `Pipeline termin proyek "${project.name}" terupdate: Invoice ${newInvoice.invoiceNumber} (${params.percentage}%, ${formatRupiah(totalAmount)}) telah berhasil diajukan ke tim Finance.`,
      type: 'crm',
      projectId: project.id,
      invoiceId: newInvoice.id,
      amount: totalAmount,
      percentage: params.percentage
    });

    this.addToast('success', 'Invoice Termin Diterbitkan & Terkirim ke Finance!', `${newInvoice.invoiceNumber} (${params.percentage}%)`);
    return { success: true, invoice: newInvoice };
  }

  createMilestoneInvoice(projectId, milestoneName, percentage) {
    const project = this.state.projects.find((p) => p.id === projectId);
    const contractVal = project?.contractValue || 100000000;
    const subtotal = (contractVal * percentage) / 100;
    const tax = subtotal * 0.11;
    const total = subtotal + tax;
    const invNumber = `INV/${new Date().getFullYear()}/TRM-${percentage}%-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      projectId,
      clientId: 'client-1',
      clientName: project?.clientName || 'Klien',
      clientEmail: project?.clientEmail || 'client@mail.com',
      type: `Termin Milestone ${percentage}%`,
      status: 'Terkirim ke Finance',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: `item-${Date.now()}`,
          description: `Pembayaran Termin ${percentage}%: ${milestoneName}`,
          hours: 1,
          rate: subtotal,
          amount: subtotal
        }
      ],
      subtotal,
      tax,
      total,
      notes: `Invoice penagihan progres validasi software house mencapai ${percentage}%.`,
      bankAccount: 'BCA 8830-1928-11 a.n PT Agensi Solusi Teknologi'
    };

    this.setState({ invoices: [newInvoice, ...this.state.invoices] });
    this.addToast('success', 'Invoice Termin Diterbitkan', `${invNumber} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}`);
    return newInvoice;
  }

  updateInvoiceStatus(invoiceId, newStatus) {
    this.setState({
      invoices: this.state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      )
    });
    this.addToast('info', 'Status Invoice Diperbarui', `Status: ${newStatus}`);
  }

  // --- Notifications ---
  addNotification(notif) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notif
    };
    this.setState({ notifications: [newNotif, ...this.state.notifications] });
  }

  markNotificationAsRead(id) {
    this.setState({
      notifications: this.state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    });
  }

  clearAllNotifications() {
    this.setState({ notifications: [] });
  }

  // --- Intelligent Orchestrator & AI Hub Engine ---
  runIntelligentOrchestrator(reportText, context = {}) {
    const textLower = reportText.toLowerCase();

    const isExpert = /deadlock|40p01|database|skema|migrasi|concurrency|race.?condition|vulnerability|security|keamanan|auth|bypass|memory.?leak|leak|double.?refund|double.?booking|double.?charge/i.test(textLower);
    const isLow = !isExpert && /typo|label|nullpointer|null.?pointer|null.?guard|cannot read propert|undefined|validasi.?form|nomor telepon|phone|margin|padding|css|html|format.?rupiah|titik.?ribuan|display|saltik/i.test(textLower);

    const complexity_level = isExpert ? 'EXPERT' : isLow ? 'LOW' : 'MEDIUM';
    const assigned_to = complexity_level === 'EXPERT' ? 'Human Developer' : 'AI Agent';

    let bug_analysis = '';
    const target_branch = 'production';
    let feature_branch_name = '';
    let recommended_commit_message = '';
    let next_action_step = '';

    const slug = context.taskKey ? context.taskKey.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'live-bug';

    if (complexity_level === 'EXPERT') {
      if (/deadlock|40p01|race.?condition|booking/i.test(textLower)) {
        bug_analysis = 'Terjadi konflik konkurensi data kritis (deadlock 40P01 / race-condition) pada transaksi simultan yang memperebutkan row lock database.';
        feature_branch_name = `fix/${slug}-concurrency-deadlock-investigation`;
        recommended_commit_message = 'fix(database): apply deterministic row lock ordering and redlock distributed mutex';
      } else if (/auth|security|vulnerability|token/i.test(textLower)) {
        bug_analysis = 'Ditemukan celah keamanan (security vulnerability) pada otorisasi token RBAC yang berpotensi menyebabkan authorization bypass.';
        feature_branch_name = `fix/${slug}-auth-security-patch`;
        recommended_commit_message = 'fix(security): enforce strict rbac token validation and rate limiting';
      } else if (/memory.?leak|leak/i.test(textLower)) {
        bug_analysis = 'Terdeteksi degradasi performa akibat memory leak dan socket connection exhaustion pada background queue worker.';
        feature_branch_name = `fix/${slug}-memory-leak-performance`;
        recommended_commit_message = 'fix(perf): resolve socket connection leak in background queue worker';
      } else {
        bug_analysis = 'Terjadi anomali logika arsitektur database atau transaksi multi-sistem yang berisiko merusak integritas data produksi.';
        feature_branch_name = `fix/${slug}-critical-architecture-investigation`;
        recommended_commit_message = 'fix(core): overhaul transaction rollback handling and distributed lock';
      }
      next_action_step = 'Picu Safety Guardrail untuk memblokir auto-deploy AI. Susun Paket Diagnostik lengkap (RCA, affected files, opsi mitigasi) dan eskalasikan ke Lead Developer untuk penanganan manual.';
    } else if (complexity_level === 'LOW') {
      if (/nullpointer|null.?pointer|null/i.test(textLower) && /phone|telepon/i.test(textLower)) {
        bug_analysis = 'Terjadi error internal server akibat kurangnya validasi null pada input nomor telepon di UserController.';
        feature_branch_name = 'fix/null-phone-validation-user';
        recommended_commit_message = 'fix(user): add null pointer check for phone number field';
      } else if (/typo|label|eja|saltik/i.test(textLower)) {
        bug_analysis = 'Terjadi kesalahan penulisan teks (typo) pada label form antarmuka yang membingungkan pengguna.';
        feature_branch_name = `fix/${slug}-label-typo`;
        recommended_commit_message = 'fix(ui): correct label spelling and update localization dictionary';
      } else if (/css|margin|padding|layout/i.test(textLower)) {
        bug_analysis = 'Ditemukan ketidaksesuaian styling CSS/HTML minor yang menyebabkan layout overflow pada tampilan smartphone.';
        feature_branch_name = `fix/${slug}-css-layout-alignment`;
        recommended_commit_message = 'fix(style): resolve margin overflow and responsive flex alignment';
      } else {
        bug_analysis = 'Terdeteksi unhandled null/undefined value pada format tampilan komponen yang memicu runtime warning.';
        feature_branch_name = `fix/${slug}-null-guard`;
        recommended_commit_message = 'fix(view): add safe optional chaining and fallback empty state';
      }
      next_action_step = `Picu AI Coding Agent untuk melakukan checkout ke branch ${feature_branch_name} dan mulai proses perbaikan kode.`;
    } else {
      if (/diskon|voucher|rounding|pembulatan/i.test(textLower)) {
        bug_analysis = 'Terjadi selisih pembulatan desimal floating-point saat mengkalkulasi diskon promosi bertingkat.';
        feature_branch_name = `fix/${slug}-discount-rounding-guard`;
        recommended_commit_message = 'fix(billing): enforce 2-decimal ceiling rounding and prevent negative subtotal';
      } else if (/libur|weekend|denda/i.test(textLower)) {
        bug_analysis = 'Kalkulasi denda keterlambatan belum mengecualikan hari libur nasional dan akhir pekan pada cron scheduler.';
        feature_branch_name = `fix/${slug}-holiday-fine-calculation`;
        recommended_commit_message = 'fix(scheduler): exclude national holidays and weekends from overdue calculation';
      } else {
        bug_analysis = 'Ditemukan kegagalan penanganan boundary edge-case atau webhook timeout yang membutuhkan exponential backoff retry.';
        feature_branch_name = `fix/${slug}-boundary-logic-retry`;
        recommended_commit_message = 'fix(service): implement safe boundary fallback and retry backoff';
      }
      next_action_step = `Picu AI Coding Agent untuk checkout branch ${feature_branch_name}, buat patch boundary logic, dan jalankan 5/5 regression unit tests.`;
    }

    return {
      bug_analysis,
      complexity_level,
      assigned_to,
      github_workflow: {
        target_branch,
        feature_branch_name,
        recommended_commit_message
      },
      next_action_step
    };
  }

  async runAiFixer(taskId, categoryOverride) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const project = this.state.projects.find((p) => p.id === task.projectId);
    if (project?.killSwitchActive) {
      this.addToast('error', 'Kill Switch Aktif', 'Agen AI dinonaktifkan untuk proyek ini.');
      return;
    }

    this.updateTaskStatus(taskId, 'Dianalisis', 'Intelligent Orchestrator memulai triage otomatis, evaluasi masa garansi 1 bulan, dan klasifikasi kompleksitas.');
    await new Promise((res) => setTimeout(res, 800));

    const orchestratorResult = this.runIntelligentOrchestrator(
      `${task.title}\n${task.description}`,
      { taskKey: task.key, projectId: task.projectId }
    );

    let category = 'menengah';
    if (categoryOverride) {
      category = categoryOverride;
    } else if (orchestratorResult.complexity_level === 'EXPERT') {
      category = 'besar';
    } else if (orchestratorResult.complexity_level === 'LOW') {
      category = 'kecil';
    } else {
      category = 'menengah';
    }

    if (category === 'besar') {
      const diag = task.diagnosticPackage || {
        summary: `DETEKSI RISIKO KRITIS: Bug tergolong EXPERT / BESAR (${orchestratorResult.bug_analysis}). Sesuai standar ERP Intelligent Orchestrator, AI DILARANG melakukan auto-commit ke Production. Tiket dieskalasikan ke Lead Developer dengan paket diagnostik lengkap.`,
        reproductionSteps: [
          '1. Jalankan concurrent stress test (50 RPS dengan K6) pada endpoint transaksi',
          '2. Dua request mencoba mengakses row resource yang sama secara simultan',
          '3. Amati log database Postgres/Redis: Deadlock error code 40P01 / Lock acquisition timeout'
        ],
        affectedFiles: [
          { path: 'src/db/queries/transactionLock.ts', lineRange: 'L42-L88' },
          { path: 'src/services/concurrencyEngine.ts', lineRange: 'L105-L148' }
        ],
        sentryBreadcrumbs: [
          'db.query: BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE',
          'db.lock: Waiting for exclusive row lock on primary resource',
          'sentry.event: 40P01 deadlock detected - transaction aborted'
        ],
        suggestedFixes: [
          { option: 'Terapkan deterministik lock ordering (sort resource IDs sebelum query)', tradeOff: 'Mencegah deadlock sirkular, namun memerlukan penyusunan array urut di backend' },
          { option: 'Gunakan Redis Distributed Mutex (Redlock) dengan TTL 5 detik', tradeOff: 'Eksekusi sangat cepat, namun menambah dependensi state cluster Redis' },
          { option: 'Optimistic Concurrency Control dengan version column retry 3x', tradeOff: 'Tidak ada lock database, namun request client bisa mengalami retry delay' }
        ],
        branchName: orchestratorResult.github_workflow.feature_branch_name || `fix/${task.key.toLowerCase()}-investigation`,
        commandSnippet: `git checkout -b ${orchestratorResult.github_workflow.feature_branch_name || `fix/${task.key.toLowerCase()}`} origin/main`
      };

      this.updateTask(taskId, {
        status: 'Perlu Manual',
        difficulty: 'Hard',
        severity: task.severity || 'S1 - Critical (Blocker)',
        priority: 'Hotfix',
        warrantyStatus: 'Garansi Proyek (Gratis)',
        confidenceScore: 46,
        confidenceReason: `Intelligent Orchestrator: Complexity EXPERT. ${orchestratorResult.next_action_step}`,
        diagnosticPackage: diag,
        orchestratorResult,
        branchName: orchestratorResult.github_workflow.feature_branch_name,
        requiresDoubleConfirmation: true
      });

      this.addToast('warning', 'Safety Guardrail: Eskalasi ke Manusia', 'Bug kategori BESAR wajib ditangani programmer manusia demi keselamatan produksi.');
    } else if (category === 'menengah') {
      const prNum = `PR #${Math.floor(Math.random() * 80) + 20}`;
      const branch = orchestratorResult.github_workflow.feature_branch_name || `ai/fix-${task.key.toLowerCase()}-logic`;
      const diffSnippet = `--- a/src/services/businessLogic.ts\n+++ b/src/services/businessLogic.ts\n@@ -15,8 +15,14 @@ export function processCalculation(input: any) {\n+  // Automated boundary logic & rounding guard inserted by Intelligent Orchestrator AI\n+  if (typeof input.amount !== 'number' || isNaN(input.amount)) {\n+    return { status: 400, result: 0, error: 'Invalid numeric input' };\n+  }\n+  const safeSubtotal = Math.max(0, input.amount - (input.discount || 0));\n+  const finalRounded = Math.round(safeSubtotal * 100) / 100;\n   return executeOperation(finalRounded);\n }`;

      this.updateTask(taskId, {
        status: 'Menunggu Persetujuan',
        difficulty: 'Medium',
        severity: task.severity || 'S2 - Major',
        warrantyStatus: 'Garansi Proyek (Gratis)',
        confidenceScore: 84,
        confidenceReason: `Intelligent Orchestrator: Complexity MEDIUM. ${orchestratorResult.next_action_step}`,
        branchName: branch,
        prNumber: prNum,
        prDiff: diffSnippet,
        orchestratorResult,
        testResult: {
          passed: true,
          total: 5,
          passedCount: 5,
          failedCount: 0,
          durationMs: 420,
          logs: [
            'PASS test/unit/businessLogic.test.ts',
            'should process valid input correctly (28ms)',
            'should prevent NaN floating point rounding error (15ms)',
            'should safely fallback when discount exceeds total (12ms)',
            'regression check: upstream billing unaffected (42ms)',
            'stress check: 500 payload iterations PASS (60ms)'
          ]
        }
      });

      this.addToast('success', 'Bug Menengah Diperbaiki AI!', `Agen membuka ${prNum}. Semua regression test lolos (5/5).`);
    } else {
      const prNum = `PR #${Math.floor(Math.random() * 80) + 10}`;
      const branch = orchestratorResult.github_workflow.feature_branch_name || `ai/fix-${task.key.toLowerCase()}-auto`;
      const diffSnippet = `--- a/src/components/DisplayView.tsx\n+++ b/src/components/DisplayView.tsx\n@@ -12,4 +12,7 @@ export const DisplayView = ({ item }: Props) => {\n+  // Guard null/undefined & format display safely by Intelligent Orchestrator AI\n+  const safeLabel = (item?.title || 'N/A').trim();\n   return <div className="text-sm font-medium">{safeLabel}</div>;\n };`;

      this.updateTask(taskId, {
        status: 'Menunggu Persetujuan',
        difficulty: 'Low',
        severity: task.severity || 'S3 - Minor',
        warrantyStatus: 'Garansi Proyek (Gratis)',
        confidenceScore: 96,
        confidenceReason: `Intelligent Orchestrator: Complexity LOW. ${orchestratorResult.next_action_step}`,
        branchName: branch,
        prNumber: prNum,
        prDiff: diffSnippet,
        orchestratorResult,
        testResult: {
          passed: true,
          total: 4,
          passedCount: 4,
          failedCount: 0,
          durationMs: 280,
          logs: [
            'PASS test/components/DisplayView.test.tsx',
            'should render safe label when item is null (18ms)',
            'should trim whitespace from title (14ms)',
            'snapshot matches baseline (32ms)',
            'zero visual regression detected (40ms)'
          ]
        }
      });

      this.addToast('success', 'Bug Kecil Diperbaiki Otomatis!', `Agen AI langsung membuat patch ${prNum} untuk bug kecil.`);
    }
  }

  createSimulatedBug(projectId, category) {
    const project = this.state.projects.find((p) => p.id === projectId) || this.getActiveProject();
    const bugNum = Math.floor(Math.random() * 800 + 100);
    const key = `${project.code}-${bugNum}`;

    let title = '';
    let description = '';
    let priority = 'Sedang';
    let severity = 'S3 - Minor';
    let difficulty = 'Low';

    if (category === 'kecil') {
      title = `[Live Prod] Typo Label & Missing Null Guard pada Form ${project.name}`;
      description = `Laporan dari pengguna di lingkungan live production: label input tidak konsisten dan melempar warning null saat form di-submit tanpa data opsional.`;
      priority = 'Rendah';
      severity = 'S3 - Minor';
      difficulty = 'Low';
    } else if (category === 'menengah') {
      title = `[Live Prod] Rounding Selisih Desimal & Webhook Retry Handling pada ${project.name}`;
      description = `Laporan telemetri Sentry: Terjadi selisih pembulatan desimal saat transaksi promo bertingkat serta webhook payment gateway perlu exponential backoff retry.`;
      priority = 'Sedang';
      severity = 'S2 - Major';
      difficulty = 'Medium';
    } else {
      title = `[Live Prod] Database Transaction Deadlock 40P01 & Race Condition Transaksi ${project.name}`;
      description = `Critical Incident Sentry: Dua request simultan memperebutkan row-level lock yang sama pada PostgreSQL/Redis, menyebabkan transaksi deadlock dibatalkan (40P01). Berisiko merusak integritas transaksi jika tidak ditangani developer manusia!`;
      priority = 'Hotfix';
      severity = 'S1 - Critical (Blocker)';
      difficulty = 'Hard';
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      key,
      projectId: project.id,
      type: 'Bug',
      title,
      description,
      status: 'Baru',
      priority,
      difficulty,
      severity,
      environment: 'Production',
      warrantyStatus: 'Garansi Proyek (Gratis)',
      slaDeadline: new Date(Date.now() + (category === 'besar' ? 4 : category === 'menengah' ? 24 : 48) * 3600000).toISOString(),
      source: 'Sentry',
      assigneeId: category === 'besar' ? 'user-dev-3' : 'user-dev-1',
      reporterId: 'user-qa',
      estimateHours: category === 'besar' ? 8 : category === 'menengah' ? 3 : 1,
      timeLoggedHours: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      visibility: 'internal',
      branchName: `fix/${key.toLowerCase()}`,
      subtasks: [
        { id: `st_${Date.now()}_1`, title: 'Verifikasi stack trace Sentry live production', completed: false },
        { id: `st_${Date.now()}_2`, title: category === 'besar' ? 'Investigasi manual & rancang lock deterministik' : 'AI code analysis & patch test', completed: false }
      ],
      relations: [],
      lastStatusUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.setState({ tasks: [newTask, ...this.state.tasks] });
    this.addToast('info', `Bug ${category.toUpperCase()} Dibuat!`, `${newTask.key}: ${newTask.title}`);
    return newTask;
  }

  approveAiPr(taskId, notes) {
    this.updateTaskStatus(taskId, 'Disetujui', notes || 'PR AI telah diverifikasi dan disetujui oleh manusia.');
    this.addToast('success', 'PR Disetujui', 'Pekerjaan siap dideploy ke Staging.');
  }

  rejectAiPr(taskId, reason) {
    this.updateTaskStatus(taskId, 'Ditolak', reason);
    this.addToast('info', 'PR Ditolak', 'Umpan balik dicatat ke riwayat audit.');
  }

  requestAiRevision(taskId, revisionNotes) {
    this.updateTask(taskId, {
      status: 'Dianalisis',
      confidenceReason: `Revisi diminta: "${revisionNotes}". Agen sedang menyusun patch baru.`
    });
    this.addToast('info', 'Revisi Diminta ke Agen', 'Agen AI menyusun ulang patch sesuai catatan review.');

    setTimeout(() => {
      this.updateTask(taskId, {
        status: 'Menunggu Persetujuan',
        confidenceScore: 91,
        confidenceReason: 'Patch diperbarui sesuai instruksi revisi manusia.'
      });
      this.addToast('success', 'Patch Revisi Agen Siap Direview!');
    }, 1200);
  }

  submitHumanFix(taskId, data) {
    const commitHash = data.patchCommitHash || Math.random().toString(16).substring(2, 9);
    const targetStatus = data.advanceToQa ? 'Deploy Staging' : 'Menunggu Persetujuan';

    this.updateTask(taskId, {
      status: targetStatus,
      timeLoggedHours: (this.state.tasks.find((t) => t.id === taskId)?.timeLoggedHours || 0) + (data.timeSpentHours || 2),
      preventiveMeasures: data.mitigationOption,
      prNumber: `PR #${Math.floor(Math.random() * 50) + 150} (Senior Engineer)`,
      prDiff: `--- a/src/core/criticalService.ts\n+++ b/src/core/criticalService.ts\n@@ -50,6 +50,15 @@\n+// [HUMAN ENGINEER INTERVENTION - Commit: ${commitHash}]\n+// Solusi Arsitektur Terpilih: ${data.mitigationOption}\n+// Catatan Lead Developer: ${data.devNotes}\n+const safeLock = await acquireDistributedMutex(resourceKey, { timeoutMs: 2000 });\n+try {\n+  return await executeAtomicTransaction(payload);\n+} finally {\n+  await safeLock.release();\n+}`
    });

    this.addToast('success', 'Perbaikan Bug Besar Berhasil!', `Ditangani engineer manusia dengan mitigasi "${data.mitigationOption}".`);
  }

  deployToStaging(taskId) {
    this.updateTaskStatus(taskId, 'Deploy Staging', 'Trigger GitHub Actions: Deploy ke environment Staging');
    this.addToast('success', 'Staging Deployed', 'Aplikasi telah aktif di URL Staging untuk verifikasi QA.');
  }

  deployToProduction(taskId, doubleConfirmed = false) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    if (task.difficulty === 'Hard' && !doubleConfirmed) {
      this.addToast('error', 'Konfirmasi Ganda Diperlukan', 'Bug kategori Hard memerlukan konfirmasi ganda sebelum deploy ke production!');
      return false;
    }

    this.updateTaskStatus(taskId, 'Deploy Production', 'Deploy ke Production via GitHub Actions.');
    setTimeout(() => {
      this.updateTask(taskId, { status: 'Dipantau' });
      this.addToast('info', 'Jendela Pemantauan Aktif', 'Sistem memantau error rate selama 30 menit pasca-deploy.');
    }, 800);

    return true;
  }

  triggerRollback(taskId, reason) {
    this.updateTask(taskId, {
      status: 'Perlu Manual',
      priority: 'Hotfix'
    });
    this.addToast('error', 'Rollback Otomatis Dijalankan!', `Sistem mendeteksi lonjakan error: "${reason}". Codebase dikembalikan.`);
  }

  qaSignOff(taskId, result) {
    const newSignOff = {
      testerId: 'user-qa',
      testerName: 'Parhan (QA Lead)',
      testedAt: new Date().toISOString(),
      environment: 'Staging',
      status: result.passed ? 'Passed' : 'Failed (Reopen)',
      notes: result.notes,
      testCasesCount: result.testCasesCount || 6,
      passedCasesCount: result.passed ? (result.testCasesCount || 6) : (result.passedCasesCount || 3),
      testedVersion: 'v-staging-latest'
    };

    if (result.passed) {
      this.updateTask(taskId, {
        status: 'Disetujui',
        qaSignOff: newSignOff
      });
      this.addToast('success', 'Verifikasi QA Lolos!', 'Bug telah teruji di Staging dan siap dideploy ke Production.');
    } else {
      this.updateTask(taskId, {
        status: 'Perlu Manual',
        qaSignOff: newSignOff
      });
      this.addToast('error', 'Bug Re-opened oleh QA', `Temuan regresi dicatat: ${result.notes}`);
    }
  }

  // --- CRM & Engineering Handover ---
  convertCrmDealToProject(dealId, newProjCode, customRepo, moduleAssignments = []) {
    const deal = this.state.crmDeals.find((d) => d.id === dealId);
    if (!deal) return null;

    let targetCode = newProjCode;
    let targetRepo = customRepo;
    let targetModules = moduleAssignments;

    if (typeof newProjCode === 'object' && newProjCode !== null) {
      targetCode = newProjCode.projectCode || newProjCode.customCode;
      targetRepo = newProjCode.repoName || newProjCode.customRepoName;
      targetModules = newProjCode.modules || newProjCode.moduleAssignments || [];
    }

    const code = targetCode || deal.dealCode.replace('DEAL-', '').slice(0, 8);
    const repoSlug = targetRepo || `${code.toLowerCase()}-core`;
    const fullRepoUrl = `github.com/${this.state.githubSettings.organization}/${repoSlug}`;
    const newProjectId = 'proj_' + Date.now();

    // Default modules if not customized
    const defaultModules = [
      {
        epicKey: `${code}-EPIC-1`,
        title: 'Fondasi Sistem, Autentikasi & Database Schema',
        assigneeId: 'user-dev-1',
        estimateHours: 24,
        description: 'Inisialisasi arsitektur, auth, dan database schema.'
      },
      {
        epicKey: `${code}-EPIC-2`,
        title: 'Fitur Inti & Operasional Bisnis',
        assigneeId: 'user-dev-2',
        estimateHours: 36,
        description: 'Fitur operasional utama dan transaksi bisnis.'
      },
      {
        epicKey: `${code}-EPIC-3`,
        title: 'UAT, Pelaporan & Integrasi Billing',
        assigneeId: 'user-dev-3',
        estimateHours: 20,
        description: 'Pelaporan analitik, UAT, dan penagihan billing.'
      }
    ];

    const activeModules = targetModules && targetModules.length > 0 ? targetModules : defaultModules;

    // Generate Epics
    const epicColors = ['#2563eb', '#059669', '#d97706', '#7c3aed'];
    const newEpics = activeModules.map((m, idx) => ({
      id: 'epic_' + Date.now() + '_' + idx,
      projectId: newProjectId,
      key: m.epicKey,
      title: m.title,
      description: `Modul pengerjaan ${m.title} dengan branch terisolasi`,
      color: epicColors[idx % epicColors.length]
    }));

    // Generate Branches automatically per module/epic
    const generatedBranches = [
      {
        name: this.state.githubSettings.defaultBranch || 'main',
        commitHash: '0f8c21a',
        moduleName: 'Main Production Branch',
        isDefault: true,
        lastUpdated: new Date().toISOString()
      },
      ...newEpics.map((ep, idx) => {
        const assignedMemberId = activeModules[idx]?.assigneeId || 'user-dev-1';
        const slug = ep.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
        return {
          name: `${this.state.githubSettings.branchPrefixEpic || 'epic/'}${ep.key.toLowerCase()}-${slug}`,
          commitHash: Math.random().toString(16).substring(2, 9),
          moduleName: ep.title,
          epicId: ep.id,
          assigneeId: assignedMemberId,
          isDefault: false,
          lastUpdated: new Date().toISOString()
        };
      })
    ];

    const newProject = {
      id: newProjectId,
      code,
      name: deal.title,
      clientName: deal.clientName,
      clientEmail: deal.clientEmail,
      repoUrl: fullRepoUrl,
      sentryDsn: `https://o4508.ingest.sentry.io/api/${Math.floor(Math.random() * 900000 + 100000)}/envelope/`,
      status: 'Active',
      contractValue: deal.contractValue,
      contractType: 'Fixed Price',
      warrantyUntil: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      maintenanceQuotaHours: 15,
      maintenanceUsedHours: 0,
      killSwitchActive: false,
      workflowType: 'ai_automation',
      branches: generatedBranches,
      createdAt: new Date().toISOString()
    };

    // Create Sprint 1 for this project
    const newSprintId = 'sprint_' + Date.now();
    const newSprint = {
      id: newSprintId,
      projectId: newProjectId,
      name: `Sprint 1: Inisialisasi Microservices, OPAC React & API Gateway`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      goal: `Selesaikan fondasi microservices Laravel, katalog buku OPAC React 19, Traefik API Gateway, dan test matrix QA`,
      status: 'active'
    };

    const isPerpus = deal.templateType === 'perpustakaan_microservices' || /perpustakaan|microservice/i.test(deal.title);
    let initialTasks = [];

    if (isPerpus) {
      const getEpicId = (idx) => newEpics[idx % newEpics.length]?.id || newEpics[0]?.id;
      initialTasks = [
        // 1. Asisyah (Project Manajer)
        {
          id: `task_${Date.now()}_pm_1`,
          key: `${code}-101`,
          projectId: newProjectId,
          epicId: getEpicId(6),
          type: 'Task',
          title: '[PM] Kick-off Proyek & Finalisasi Dokumen Scope of Work (SOW)',
          description: `Rapat koordinasi kickoff dengan PIC ${deal.clientPic || 'Klien'}, finalisasi termin ${deal.paymentTerms || 'DP 30%'}, dan penetapan matriks RACI tim.`,
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-pm',
          reporterId: 'user-pm',
          estimateHours: 8,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'client_public',
          branchName: 'main',
          subtasks: [
            { id: `st_pm_1`, title: 'Undang rapat virtual PIC Rektorat & Perpustakaan', completed: false },
            { id: `st_pm_2`, title: 'Tanda tangan jadwal milestone & Berita Acara Kick-off', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_pm_2`,
          key: `${code}-102`,
          projectId: newProjectId,
          epicId: getEpicId(6),
          type: 'Task',
          title: '[PM] Sprint 1 Backlog Grooming & Definisi User Story Acceptance Criteria',
          description: 'Memimpin sesi backlog grooming bersama Jaka (Backend), Aldyana (Frontend), Azi (Fullstack), dan Parhan (QA).',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-pm',
          reporterId: 'user-pm',
          estimateHours: 12,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: 'main',
          subtasks: [
            { id: `st_pm_3`, title: 'Breakdown 18 user story arsitektur microservices', completed: false },
            { id: `st_pm_4`, title: 'Penguncian Definition of Done (DoD) bersama QA', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_pm_3`,
          key: `${code}-103`,
          projectId: newProjectId,
          epicId: getEpicId(6),
          type: 'Task',
          title: '[PM] Koordinasi Jadwal Demo UAT & Verifikasi Berita Acara Termin 1',
          description: 'Mengawasi burn-down velocity sprint dan memverifikasi kelengkapan dokumen Termin 1 (DP 30%).',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-pm',
          reporterId: 'user-pm',
          estimateHours: 10,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: 'main',
          subtasks: [
            { id: `st_pm_5`, title: 'Presentasi progres mingguan ke kepala perpustakaan', completed: false },
            { id: `st_pm_6`, title: 'Koordinasi penagihan invoice termin 1 ke Finance', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 2. Jaka (Backend Dev)
        {
          id: `task_${Date.now()}_jaka_1`,
          key: `${code}-104`,
          projectId: newProjectId,
          epicId: getEpicId(0),
          type: 'Feature',
          title: '[Backend] Setup Microservice Katalog Buku Laravel 11 & Skema PostgreSQL',
          description: 'REST API master data ISBN, judul, pengarang, nomor DDC, dan lokasi rak fisik dengan Laravel 11 & PostgreSQL.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-3',
          reporterId: 'user-pm',
          estimateHours: 24,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[1]?.name || 'feature/katalog-microservice',
          subtasks: [
            { id: `st_j1`, title: 'Migrasi database tabel books, authors, categories', completed: false },
            { id: `st_j2`, title: 'Resource Controller & FormRequest ISBN-13 validation', completed: false },
            { id: `st_j3`, title: 'Redis caching katalog buku populer dengan TTL 1 jam', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_jaka_2`,
          key: `${code}-105`,
          projectId: newProjectId,
          epicId: getEpicId(2),
          type: 'Feature',
          title: '[Backend] Engine Sirkulasi Peminjaman & Pengembalian dengan Redis Atomic Lock',
          description: 'Pencegahan race-condition saat 2 mahasiswa meminjam 1 eksemplar buku tersisa menggunakan Redis mutex lock, durasi pinjam 7 hari.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-3',
          reporterId: 'user-pm',
          estimateHours: 28,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[3]?.name || 'feature/sirkulasi-engine',
          subtasks: [
            { id: `st_j4`, title: 'Endpoint POST /api/v1/circulation/borrow dengan atomic lock', completed: false },
            { id: `st_j5`, title: 'Validasi batas kuota maksimal 3 buku per mahasiswa', completed: false },
            { id: `st_j6`, title: 'Endpoint POST /api/v1/circulation/return untuk check-in', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_jaka_3`,
          key: `${code}-106`,
          projectId: newProjectId,
          epicId: getEpicId(2),
          type: 'Task',
          title: '[Backend] Service Perhitungan Denda Keterlambatan Rp 2.000/Hari via Laravel Scheduler',
          description: 'Cron scheduler harian jam 00:01 WIB: kalkulasi otomatis hari keterlambatan pengembalian buku dan auto-suspend kartu peminjam jika denda > Rp 20.000.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-3',
          reporterId: 'user-pm',
          estimateHours: 16,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[3]?.name || 'feature/denda-scheduler',
          subtasks: [
            { id: `st_j7`, title: 'Artisan command CalculateOverdueFinesCommand', completed: false },
            { id: `st_j8`, title: 'Pengecualian hari libur nasional & akhir pekan', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_jaka_4`,
          key: `${code}-107`,
          projectId: newProjectId,
          epicId: getEpicId(0),
          type: 'Feature',
          title: '[Backend] Centralized JWT Sanctum Authentication & RBAC Pustakawan vs Mahasiswa',
          description: 'Otorisasi token bearer JWT terpusat di seluruh endpoint microservices Laravel untuk verifikasi status anggota aktif.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-3',
          reporterId: 'user-pm',
          estimateHours: 20,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[1]?.name || 'feature/sanctum-rbac',
          subtasks: [
            { id: `st_j9`, title: 'Setup token refresh middleware Laravel Sanctum', completed: false },
            { id: `st_j10`, title: 'Rate limiting 120 req/menit per client token', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 3. Aldyana (Frontend Dev)
        {
          id: `task_${Date.now()}_ald_1`,
          key: `${code}-108`,
          projectId: newProjectId,
          epicId: getEpicId(1),
          type: 'Feature',
          title: '[Frontend] Slicing & State Management Katalog OPAC React 19 + Tailwind CSS',
          description: 'Portal pencarian buku publik mahasiswa (OPAC): live search instan, filter multi-kategori, dan visualisasi ketersediaan rak.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-2',
          reporterId: 'user-pm',
          estimateHours: 26,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'client_public',
          branchName: generatedBranches[2]?.name || 'feature/react-portal-opac',
          subtasks: [
            { id: `st_a1`, title: 'BookSearchFilter dengan input debounce 300ms', completed: false },
            { id: `st_a2`, title: 'Grid kartu buku dengan badge status ketersediaan rak', completed: false },
            { id: `st_a3`, title: 'Modal detail buku dengan nomor panggil DDC & sinopsis', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_ald_2`,
          key: `${code}-109`,
          projectId: newProjectId,
          epicId: getEpicId(3),
          type: 'Feature',
          title: '[Frontend] Meja Sirkulasi Petugas: Scan Barcode ISBN & Quick Checkout Buku',
          description: 'Antarmuka kasir meja petugas perpustakaan: input otomatis scanner barcode USB/Bluetooth, checkout dalam detik, dan cetak slip thermal 58mm.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-2',
          reporterId: 'user-pm',
          estimateHours: 22,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[4]?.name || 'feature/meja-sirkulasi',
          subtasks: [
            { id: `st_a4`, title: 'Event listener global scanner barcode keyboard-wedge', completed: false },
            { id: `st_a5`, title: 'Keranjang sirkulasi peminjaman multi-buku', completed: false },
            { id: `st_a6`, title: 'Integrasi cetak slip tanda terima thermal ESC/POS 58mm', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_ald_3`,
          key: `${code}-110`,
          projectId: newProjectId,
          epicId: getEpicId(3),
          type: 'Feature',
          title: '[Frontend] Dashboard Mahasiswa: Barcode Kartu Anggota Digital & Riwayat Pinjaman',
          description: 'Halaman dashboard personal anggota: render Barcode Code-128 NIM mahasiswa, daftar buku yang sedang dipinjam, dan countdown timer due date.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-2',
          reporterId: 'user-pm',
          estimateHours: 20,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
          visibility: 'client_public',
          branchName: generatedBranches[4]?.name || 'feature/mahasiswa-dashboard',
          subtasks: [
            { id: `st_a7`, title: 'Komponen Barcode Code-128 digital kartu anggota', completed: false },
            { id: `st_a8`, title: 'Tabel riwayat pinjaman & tombol perpanjang mandiri 1x', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 4. Parhan (QA)
        {
          id: `task_${Date.now()}_par_1`,
          key: `${code}-111`,
          projectId: newProjectId,
          epicId: getEpicId(5),
          type: 'Task',
          title: '[QA] Susun Matrix Test Case Sirkulasi Peminjaman, Denda & Edge-Case Buku Rusak',
          description: 'Menyusun skenario pengujian komprehensif: 35 skenario transaksi peminjaman, pencegahan double-borrow, dan denda saat libur nasional.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-qa',
          reporterId: 'user-pm',
          estimateHours: 18,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[6]?.name || 'qa/test-matrix-sirkulasi',
          subtasks: [
            { id: `st_p1`, title: 'Test matrix modul katalog pencarian & filter DDC', completed: false },
            { id: `st_p2`, title: 'Test matrix transaksi sirkulasi peminjaman & pengembalian', completed: false },
            { id: `st_p3`, title: 'Verifikasi penolakan peminjaman jika denda > Rp 20.000', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_par_2`,
          key: `${code}-112`,
          projectId: newProjectId,
          epicId: getEpicId(5),
          type: 'Task',
          title: '[QA] Uji Beban (Load Test) Microservices API Katalog via K6 Target 2.000 RPS',
          description: 'Simulasi lonjakan traffic mahasiswa saat awal semester baru (target 2.000 RPS): memastikan latency API < 150ms dan CPU usage < 65%.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-qa',
          reporterId: 'user-pm',
          estimateHours: 16,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[6]?.name || 'qa/k6-load-testing',
          subtasks: [
            { id: `st_p4`, title: 'Script skenario K6 concurrent search buku', completed: false },
            { id: `st_p5`, title: 'Analisis connection pool PostgreSQL & Redis under stress', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_par_3`,
          key: `${code}-113`,
          projectId: newProjectId,
          epicId: getEpicId(5),
          type: 'Task',
          title: '[QA] Automation E2E Testing Skenario Peminjaman Buku via Playwright TypeScript',
          description: 'Automasi end-to-end browser test: flow login mahasiswa -> search katalog -> verifikasi checkout petugas -> assert stok rak berkurang.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-qa',
          reporterId: 'user-pm',
          estimateHours: 24,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[6]?.name || 'qa/playwright-e2e',
          subtasks: [
            { id: `st_p6`, title: 'Setup framework Playwright TypeScript pada CI staging', completed: false },
            { id: `st_p7`, title: 'Script E2E sirkulasi peminjaman & verifikasi struk digital', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 5. Azi (Full stack)
        {
          id: `task_${Date.now()}_azi_1`,
          key: `${code}-114`,
          projectId: newProjectId,
          epicId: getEpicId(4),
          type: 'Feature',
          title: '[Fullstack] Setup API Gateway Traefik, Docker Compose Microservices & CORS',
          description: 'Arsitektur komunikasi antar-layanan: reverse proxy Traefik, routing /api/v1/catalog, /api/v1/circulation, dan portal frontend React 19.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-1',
          reporterId: 'user-pm',
          estimateHours: 28,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[5]?.name || 'feature/api-gateway-docker',
          subtasks: [
            { id: `st_az1`, title: 'File docker-compose.yml multi-container (PHP-FPM, Vite, Postgres, Redis)', completed: false },
            { id: `st_az2`, title: 'Routing API Gateway Traefik dengan SSL Let\'s Encrypt otomatis', completed: false },
            { id: `st_az3`, title: 'Health check endpoint /healthz kelayakan container', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_azi_2`,
          key: `${code}-115`,
          projectId: newProjectId,
          epicId: getEpicId(4),
          type: 'Feature',
          title: '[Fullstack] Integrasi Webhook WhatsApp Gateway untuk Notifikasi H-1 Pengembalian Buku',
          description: 'Otomatis mengirim pesan resmi WhatsApp ke mahasiswa pada H-1 tanggal jatuh tempo untuk mencegah timbulnya denda.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-1',
          reporterId: 'user-pm',
          estimateHours: 20,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
          visibility: 'client_public',
          branchName: generatedBranches[5]?.name || 'feature/whatsapp-gateway',
          subtasks: [
            { id: `st_az4`, title: 'Webhook handler status delivery WhatsApp (SENT, READ)', completed: false },
            { id: `st_az5`, title: 'Antrian pengiriman via Laravel Queue Redis dengan auto-retry 3x', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_azi_3`,
          key: `${code}-116`,
          projectId: newProjectId,
          epicId: getEpicId(4),
          type: 'Feature',
          title: '[Fullstack] Layanan Export Rekap Statistik Sirkulasi Bulanan Perpustakaan ke PDF & Excel',
          description: 'Endpoint backend penghasil data agregat peminjaman per fakultas dan UI React untuk unduh laporan PDF/Excel resmi.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-1',
          reporterId: 'user-pm',
          estimateHours: 18,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[5]?.name || 'feature/reporting-pdf-excel',
          subtasks: [
            { id: `st_az6`, title: 'Service export data menggunakan Laravel Excel (Maatwebsite)', completed: false },
            { id: `st_az7`, title: 'Template PDF resmi berlogo universitas via DomPDF', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
    } else {
      // Default fallback conversion
      initialTasks = [
        {
          id: 'task_' + Date.now() + '_0',
          key: `${code}-101`,
          projectId: newProjectId,
          epicId: newEpics[0].id,
          type: 'Task',
          title: 'Kick-off Proyek & Finalisasi Dokumen Scope of Work',
          description: `Bahas termin ${deal.paymentTerms || 'termin'} dan rincian modul bersama PIC ${deal.clientPic || 'Klien'}`,
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-pm',
          reporterId: 'user-pm',
          estimateHours: 6,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'client_public',
          subtasks: [
            { id: 'st_c1', title: 'Undang meeting virtual PIC Klien', completed: false },
            { id: 'st_c2', title: 'Tanda tangan jadwal milestone & SOW', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        ...newEpics.map((ep, idx) => {
          const assignedMemberId = activeModules[idx]?.assigneeId || 'user-dev-1';
          const assignedBranch = generatedBranches[idx + 1]?.name;
          const assignedHours = activeModules[idx]?.estimateHours || 24;
          const customDesc = activeModules[idx]?.description || `Pengerjaan arsitektur dan fungsionalitas modul pada branch \`${assignedBranch}\`. Dikerjakan oleh lead engineer terpilih.`;
          return {
            id: `task_${Date.now()}_${idx + 1}`,
            key: `${code}-${102 + idx}`,
            projectId: newProjectId,
            epicId: ep.id,
            type: 'Task',
            title: `Implementasi Modul: ${ep.title}`,
            description: customDesc,
            status: 'Backlog',
            priority: 'Tinggi',
            source: 'Manual',
            assigneeId: assignedMemberId,
            reporterId: 'user-pm',
            estimateHours: assignedHours,
            timeLoggedHours: 0,
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + (7 + idx * 4) * 86400000).toISOString().split('T')[0],
            sprintId: idx < 3 ? newSprintId : undefined,
            visibility: 'internal',
            branchName: assignedBranch,
            subtasks: [
              { id: `st_mod_${idx}_1`, title: 'Inisialisasi kode modul & schema', completed: false },
              { id: `st_mod_${idx}_2`, title: 'Buat unit test coverage dasar', completed: false }
            ],
            relations: [],
            lastStatusUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        })
      ];
    }

    const updatedDeals = this.state.crmDeals.map((d) =>
      d.id === dealId ? { ...d, status: 'Converted', convertedProjectId: newProjectId } : d
    );

    this.setState({
      projects: [newProject, ...this.state.projects],
      epics: [...this.state.epics, ...newEpics],
      sprints: [newSprint, ...this.state.sprints],
      tasks: [...initialTasks, ...this.state.tasks],
      crmDeals: updatedDeals,
      selectedProjectId: newProjectId,
      activeTab: 'kanban'
    });

    // Check multi-module developers
    const devModuleCount = {};
    activeModules.forEach((m) => {
      devModuleCount[m.assigneeId] = (devModuleCount[m.assigneeId] || 0) + 1;
    });
    const multiModuleDevsCount = Object.values(devModuleCount).filter((c) => c > 1).length;

    this.addToast(
      'success',
      'Otomasi GitHub & Proyek Selesai!',
      multiModuleDevsCount > 0
        ? `Repo ${fullRepoUrl} & ${generatedBranches.length} branch dibuat. Modul siap di Backlog (${multiModuleDevsCount} developer memegang lebih dari 1 modul).`
        : `Repo ${fullRepoUrl} dan ${generatedBranches.length} branch modul dibuat. Tugas telah dibagikan ke tim di kolom Backlog.`
    );
    return newProject;
  }

  // --- HR Operations ---
  addTeamMember(member) {
    const newMember = {
      id: `user-${Date.now()}`,
      name: member.name,
      role: member.role,
      email: member.email,
      avatar: member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      skills: member.skills || ['Fullstack Dev'],
      capacityHoursPerWeek: 40,
      assignedHours: 0,
      onLeave: false,
      githubUsername: member.githubUsername || ''
    };
    this.setState({ teamMembers: [...this.state.teamMembers, newMember] });
    this.addToast('success', 'Anggota Tim Ditambahkan', `${newMember.name} (${newMember.role})`);
  }

  updateTeamMember(memberId, updates) {
    this.setState({
      teamMembers: this.state.teamMembers.map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      )
    });
  }

  deleteTeamMember(memberId) {
    this.setState({
      teamMembers: this.state.teamMembers.filter((m) => m.id !== memberId)
    });
    this.addToast('info', 'Anggota Tim Dihapus', 'Data anggota tim telah dihapus.');
  }

  // --- GitHub Settings ---
  updateGithubSettings(settings) {
    this.setState({ githubSettings: { ...this.state.githubSettings, ...settings } });
    this.addToast('success', 'Pengaturan GitHub Disimpan', 'Konfigurasi integrasi repository diperbarui.');
  }

  // --- GitHub Branches Management ---
  addBranch(branchData, projectId) {
    const targetId = projectId || this.state.selectedProjectId;
    const updatedProjects = this.state.projects.map((p) => {
      if (p.id === targetId) {
        const branches = p.branches || [];
        return {
          ...p,
          branches: [...branches, {
            ...branchData,
            commitHash: branchData.commitHash || Math.random().toString(16).substring(2, 9),
            lastUpdated: new Date().toISOString()
          }]
        };
      }
      return p;
    });
    this.setState({ projects: updatedProjects });
    this.addToast('success', 'Cabang Git Dibuat', `Branch "${branchData.name}" berhasil dibuat.`);
  }

  deleteBranch(branchName, projectId) {
    const targetId = projectId || this.state.selectedProjectId;
    const updatedProjects = this.state.projects.map((p) => {
      if (p.id === targetId) {
        const branches = (p.branches || []).filter((b) => b.name !== branchName);
        return { ...p, branches };
      }
      return p;
    });
    this.setState({ projects: updatedProjects });
    this.addToast('info', 'Cabang Dihapus', `Branch "${branchName}" berhasil dihapus.`);
  }

  // --- Reset All Data ---
  resetDataToDefault() {
    this.setState({
      projects: JSON.parse(JSON.stringify(INITIAL_PROJECTS)),
      tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
      epics: JSON.parse(JSON.stringify(INITIAL_EPICS)),
      sprints: JSON.parse(JSON.stringify(INITIAL_SPRINTS)),
      teamMembers: JSON.parse(JSON.stringify(INITIAL_MEMBERS)),
      crmDeals: JSON.parse(JSON.stringify(INITIAL_CRM_DEALS)),
      invoices: JSON.parse(JSON.stringify(INITIAL_INVOICES)),
      events: JSON.parse(JSON.stringify(INITIAL_EVENTS)),
      comments: JSON.parse(JSON.stringify(INITIAL_COMMENTS)),
      automationRules: JSON.parse(JSON.stringify(INITIAL_RULES)),
      selectedProjectId: 'proj-perpustakaan',
      searchQuery: '',
      filterType: 'all',
      filterPriority: 'all',
      filterSeverity: 'all',
      filterAssignee: 'all',
      filterEpic: 'all',
      selectedTask: null,
      isCreateTaskModalOpen: false,
      isIntakeModalOpen: false
    });
    this.addToast('info', 'Data Demo Direset', 'Semua data telah dikembalikan ke kondisi awal.');
  }

  // --- Computed Getters ---
  getActiveProject() {
    return this.state.projects.find((p) => p.id === this.state.selectedProjectId) || this.state.projects[0];
  }

  getProjectTasks() {
    return this.state.tasks.filter((t) => t.projectId === this.state.selectedProjectId);
  }

  getProjectEpics() {
    return this.state.epics.filter((e) => e.projectId === this.state.selectedProjectId);
  }

  getFilteredTasks() {
    const projectTasks = this.getProjectTasks();
    const { searchQuery, filterType, filterPriority, filterSeverity, filterAssignee, filterEpic, role } = this.state;

    return projectTasks.filter((task) => {
      if (role === 'client' && task.visibility !== 'client_public') {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchKey = task.key ? task.key.toLowerCase().includes(q) : false;
        const matchTitle = task.title ? task.title.toLowerCase().includes(q) : false;
        const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
        if (!matchKey && !matchTitle && !matchDesc) return false;
      }

      if (filterType !== 'all' && task.type !== filterType) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterSeverity !== 'all' && task.severity !== filterSeverity) return false;
      if (filterAssignee !== 'all' && task.assigneeId !== filterAssignee) return false;
      if (filterEpic !== 'all' && task.epicId !== filterEpic) return false;

      return true;
    });
  }

  getProjectProgress(projectId) {
    const tasks = this.state.tasks.filter((t) => t.projectId === projectId);
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((t) => t.status === 'Selesai');
    return Math.round((completedTasks.length / tasks.length) * 100);
  }
}

export const store = new Store();