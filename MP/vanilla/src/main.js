/**
 * Main Application Entry Point
 * Mounts and orchestrates modular Vanilla JS components with reactive state.
 * 100% Native Vanilla JS (ES Modules, HTML5, CSS3), Zero Bundlers.
 * Matches ASTACODE CRM Application Shell, Header, and Detail Architecture.
 */

import { store } from './state/store.js';
import { Sidebar } from './components/Sidebar.js';
import { TopBar } from './components/TopBar.js';
import { ToastContainer } from './components/common/ToastContainer.js';

// Views
import { KanbanBoard } from './components/KanbanBoard.js';
import { TaskDetailView } from './components/TaskDetailView.js';
import { BacklogView } from './components/backlog/BacklogView.js';
import { TimelineView } from './components/timeline/TimelineView.js';
import { TaskListView } from './components/list/TaskListView.js';
import { AiAutomationHub } from './components/ai/AiAutomationHub.js';
import { FinanceInvoicesView } from './components/finance/FinanceInvoicesView.js';
import { CrmDealsView } from './components/crm/CrmDealsView.js';
import { HrTeamView } from './components/hr/HrTeamView.js';
import { GithubSettingsView } from './components/settings/GithubSettingsView.js';
import { ClientPortalView } from './components/client/ClientPortalView.js';
import { ProjectModuleView } from './components/project/ProjectModuleView.js';

// Modals
import { TaskDetailModal } from './components/TaskDetailModal.js';
import { CreateTaskModal } from './components/CreateTaskModal.js';
import { IntakeSimulatorModal } from './components/intake/IntakeSimulatorModal.js';
import { SopGuideModal } from './components/common/SopGuideModal.js';

class App {
  constructor() {
    this.appRoot = document.getElementById('app');
    if (!this.appRoot) {
      throw new Error('Element #app not found in document');
    }

    this.components = {};
    this.viewportContent = null;
    this.currentViewTab = null;
    this.currentRole = null;
  }

  bootstrap() {
    // 1. Instantiate layout components
    const sidebar = new Sidebar();
    const topBar = new TopBar();
    const toastContainer = new ToastContainer();

    // 2. Instantiate all view components
    const kanbanBoard = new KanbanBoard();
    const taskDetailView = new TaskDetailView();
    const backlogView = new BacklogView();
    const timelineView = new TimelineView();
    const taskListView = new TaskListView();
    const aiAutomationHub = new AiAutomationHub();
    const financeInvoicesView = new FinanceInvoicesView();
    const crmDealsView = new CrmDealsView({
      onNavigateToProject: (pId) => {
        store.setSelectedProjectId(pId);
        store.setActiveTab('kanban');
      },
      onNavigateToSettings: () => {
        store.setActiveTab('github');
      }
    });
    const hrTeamView = new HrTeamView();
    const githubSettingsView = new GithubSettingsView();
    const clientPortalView = new ClientPortalView({
      onSelectTask: (task) => store.openTaskDetail(task),
      onOpenIntakeModal: () => store.openIntakeModal(),
      onSelectInvoice: () => store.setActiveTab('finance')
    });
    const projectModuleView = new ProjectModuleView({
      onSelectTask: (task) => store.openTaskDetail(task),
      onOpenCreateTask: () => store.openCreateTaskModal()
    });

    // 3. Instantiate modals
    const taskDetailModal = new TaskDetailModal();
    const createTaskModal = new CreateTaskModal();
    const intakeSimulatorModal = new IntakeSimulatorModal({
      onTaskCreated: (taskId) => {
        const task = store.getState().tasks.find((t) => t.id === taskId);
        if (task) store.openTaskDetail(task);
      }
    });
    const sopGuideModal = new SopGuideModal({
      onNavigateTab: (tab) => store.setActiveTab(tab)
    });

    this.components = {
      sidebar,
      topBar,
      toastContainer,
      kanbanBoard,
      taskDetailView,
      backlogView,
      timelineView,
      taskListView,
      aiAutomationHub,
      financeInvoicesView,
      crmDealsView,
      hrTeamView,
      githubSettingsView,
      clientPortalView,
      projectModuleView,
      taskDetailModal,
      createTaskModal,
      intakeSimulatorModal,
      sopGuideModal
    };

    // 4. Clear root container
    this.appRoot.innerHTML = '';

    // 5. Mount Mobile Backdrop
    document.body.appendChild(sidebar.getBackdrop());

    // 6. Mount Shell Layout (Identical structure to ASTACODE CRM app-shell)
    const appShell = document.createElement('div');
    appShell.className = 'app-shell';

    // 6a. Left Sidebar Container
    appShell.appendChild(sidebar.getElement());

    // 6b. Right Main Content Area
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    // Top Sticky Header
    mainContent.appendChild(topBar.getElement());

    // Dynamic Main View Area
    this.viewportContent = document.createElement('main');
    this.viewportContent.id = 'view-container';
    this.viewportContent.className = 'page-area';
    mainContent.appendChild(this.viewportContent);

    appShell.appendChild(mainContent);
    this.appRoot.appendChild(appShell);

    // 7. Render dynamic sidebar
    sidebar.render();

    // 8. Mount Modals & Floating Toasts to Document Body
    document.body.appendChild(taskDetailModal.getElement());
    document.body.appendChild(createTaskModal.getElement());
    document.body.appendChild(intakeSimulatorModal.getElement());
    document.body.appendChild(sopGuideModal.getElement());
    document.body.appendChild(toastContainer.getElement());

    // 9. Initial View Render & Reactive Subscription
    this.handleRoute(store.getState());
    store.subscribe((state) => {
      this.handleRoute(state);
    });

    // 10. Global Keyboard Shortcuts ('c' for create, '/' for quick search)
    window.addEventListener('keydown', (e) => {
      const targetTag = (e.target.tagName || '').toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        store.openCreateTaskModal();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('header-quick-search-input') || document.querySelector('.topbar__search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    console.info('[Project Manjer] ASTACODE CRM & Kanban Board Edition successfully initialized.');
  }

  handleRoute(state) {
    if (!this.viewportContent) return;

    const { activeTab, role } = state;

    // Avoid unnecessary DOM rebuilds if route hasn't changed
    if (this.currentViewTab === activeTab && this.currentRole === role) {
      return;
    }

    this.currentViewTab = activeTab;
    this.currentRole = role;
    this.viewportContent.innerHTML = '';

    // Client role override on kanban tab
    if (role === 'client' && activeTab === 'kanban') {
      this.viewportContent.appendChild(this.components.clientPortalView.getElement());
      return;
    }

    switch (activeTab) {
      case 'project':
        this.viewportContent.appendChild(this.components.projectModuleView.getElement());
        break;
      case 'kanban':
        this.viewportContent.appendChild(this.components.kanbanBoard.getElement());
        break;
      case 'task_detail':
        this.viewportContent.appendChild(this.components.taskDetailView.getElement());
        break;
      case 'backlog':
        this.viewportContent.appendChild(this.components.backlogView.getElement());
        break;
      case 'timeline':
        this.viewportContent.appendChild(this.components.timelineView.getElement());
        break;
      case 'list':
        this.viewportContent.appendChild(this.components.taskListView.getElement());
        break;
      case 'ai_hub':
        this.viewportContent.appendChild(this.components.aiAutomationHub.getElement());
        break;
      case 'finance':
        this.viewportContent.appendChild(this.components.financeInvoicesView.getElement());
        break;
      case 'crm':
        this.viewportContent.appendChild(this.components.crmDealsView.getElement());
        break;
      case 'team':
        this.viewportContent.appendChild(this.components.hrTeamView.getElement());
        break;
      case 'github':
        this.viewportContent.appendChild(this.components.githubSettingsView.getElement());
        break;
      case 'client':
        this.viewportContent.appendChild(this.components.clientPortalView.getElement());
        break;
      default:
        this.viewportContent.appendChild(this.components.kanbanBoard.getElement());
        break;
    }
  }
}

// Bootstrap once DOM content is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.bootstrap();
  });
} else {
  const app = new App();
  app.bootstrap();
}
