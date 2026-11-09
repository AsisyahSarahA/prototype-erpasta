/**
 * TopBar.js — Unified Clean Header Component for Management Proyek (ASTACODE ERP)
 *
 * Clean & Minimalist Header Layout:
 * - Left side: Mobile Hamburger menu toggle + Breadcrumbs & Status ("ASTACODE PM / Page Title • Live")
 *              or Detail View ("Kembali / KEY / Status Badge")
 * - Right side: Notification Bell & Logged-in User Profile with interactive Popover (User Details + Logout)
 */

import { store } from "../state/store.js";
import { swalConfirm } from "../utils/swal.js";

const ICONS = {
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

const VIEW_TITLES = {
  project: "Modul Proyek",
  ringkasan: "Ringkasan Proyek",
  kanban: "Daftar Pekerjaan",
  backlog: "Backlog & Sprints",
  timeline: "Roadmap & Gantt",
  list: "Issue List",
  qa: "QA & Testing",
  docs: "Docs & Wiki",
  finance: "Finance",
  finance_budget: "Finance",
  ai_hub: "Otomasi Fix Bug AI",
  github: "GitHub & Cabang",
  client: "Service Desk / Klien",
  team: "Tim HR & Workload",
  crm: "CRM Deals Won",
  task_detail: "Detail Tiket Pekerjaan",
};

export class TopBar {
  constructor(options = {}) {
    this.container = document.createElement("div");
    this.container.id = "header-container";
    this.isProfileOpen = false;
    this.onToggleNotif = options.onToggleNotif || (() => {});
    this.unsubscribe = null;
    this.hasDocClickListener = false;
    this.init();
  }

  getSessionUser() {
    let sessionUser = {
      name: "Aldyana (Admin)",
      role: "Super Admin",
      email: "aldyana.admin@astacode.com",
      avatar: "AL",
    };

    if (typeof window !== "undefined" && window.AstaAuth && typeof window.AstaAuth.getUser === "function") {
      const u = window.AstaAuth.getUser();
      if (u) {
        sessionUser = {
          name: u.name || sessionUser.name,
          role: u.role || sessionUser.role,
          email: u.email || sessionUser.email,
          avatar: u.avatar || sessionUser.avatar,
        };
      }
    } else {
      try {
        const raw = localStorage.getItem("asta_auth_user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u) {
            sessionUser = {
              name: u.name || sessionUser.name,
              role: u.role || sessionUser.role,
              email: u.email || sessionUser.email,
              avatar: u.avatar || sessionUser.avatar,
            };
          }
        }
      } catch (e) {
        console.warn("Error reading auth session:", e);
      }
    }
    return sessionUser;
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });

    // Close profile dropdown on outside click or Escape
    if (!this.hasDocClickListener) {
      this.hasDocClickListener = true;
      document.addEventListener("click", (e) => {
        if (this.isProfileOpen && !e.target.closest("#headerUserProfileWrap")) {
          this.isProfileOpen = false;
          this.render();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isProfileOpen) {
          this.isProfileOpen = false;
          this.render();
        }
      });
    }
  }

  render() {
    const state = store.getState();
    const { activeTab, selectedTask } = state;
    const unreadNotifsCount = (state.notifications || []).filter((n) => !n.isRead).length;
    const sessionUser = this.getSessionUser();

    let leftContent = "";

    if (activeTab === "task_detail" && selectedTask) {
      leftContent = `
        <div class="header-breadcrumb">
          <button id="header-back-kanban" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;flex-shrink:0;">
            ${ICONS.arrowLeft}
            <span>Kembali</span>
          </button>
          <span class="header-crumb-sep">${ICONS.chevronRight}</span>
          <span class="badge badge-purple" style="font-family:var(--font-mono);font-weight:800;flex-shrink:0;">${selectedTask.key}</span>
          <span class="badge badge-${selectedTask.status === "Selesai" ? "emerald" : selectedTask.status === "In Progress" ? "blue" : "amber"}" style="font-size:10px;flex-shrink:0;">
            ${selectedTask.status}
          </span>
        </div>
      `;
    } else {
      const pageTitle = VIEW_TITLES[activeTab] || "Modul Proyek";
      leftContent = `
        <div class="header-breadcrumb">
          <span class="header-module-tag">ASTACODE PM</span>
          <span class="header-crumb-sep">/</span>
          <h1 class="header-breadcrumb-title">
            ${pageTitle}
          </h1>
          <span class="header-live-pill">
            <span class="live-dot"></span>
            <span>Live</span>
          </span>
        </div>
      `;
    }

    this.container.innerHTML = `
      <header class="header" id="app-header">
        <!-- Left side: Hamburger + Breadcrumbs / Title -->
        <div class="header-left-wrap">
          <button id="header-mobile-toggle" class="header-mobile-btn" title="Buka Navigasi Sidebar">
            ${ICONS.menu}
          </button>
          ${leftContent}
        </div>

        <!-- Right side: Notifications & User Profile (Clean Top Bar) -->
        <div class="header-actions">
          <!-- Notification Bell Button -->
          <button id="header-notif-btn" class="btn-icon header-action-icon-btn" title="Pusat Notifikasi Terpadu (${unreadNotifsCount} baru)">
            ${ICONS.bell}
            ${unreadNotifsCount > 0 ? `<span class="header-notif-dot"></span>` : ""}
          </button>

          <!-- User Profile Dropdown Component -->
          <div class="header-user-profile-wrap" id="headerUserProfileWrap">
            <button
              id="header-profile-btn"
              class="header-profile-btn ${this.isProfileOpen ? "active" : ""}"
              type="button"
              aria-expanded="${this.isProfileOpen ? "true" : "false"}"
              title="Profil Pengguna: ${sessionUser.name} (${sessionUser.role})"
            >
              <div class="header-profile-avatar">${sessionUser.avatar || "AL"}</div>
              <div class="header-profile-info">
                <span class="header-profile-name">${sessionUser.name}</span>
                <span class="header-profile-role">${sessionUser.role}</span>
              </div>
              <span class="header-profile-chevron">${ICONS.chevronDown}</span>
            </button>

            <!-- Profile Popover / Dropdown Menu -->
            <div class="header-profile-dropdown" id="headerProfileDropdown" style="display: ${this.isProfileOpen ? "block" : "none"};">
              <div class="profile-dropdown-header">
                <div class="profile-dropdown-avatar-lg">${sessionUser.avatar || "AL"}</div>
                <div class="profile-dropdown-user-details">
                  <div class="profile-dropdown-name">${sessionUser.name}</div>
                  <div class="profile-dropdown-email">${sessionUser.email || "aldyana.admin@astacode.com"}</div>
                  <div class="profile-dropdown-badge-row">
                    <span class="profile-dropdown-role-badge">${sessionUser.role}</span>
                    <span class="profile-dropdown-online-dot"><span class="live-dot"></span> Online</span>
                  </div>
                </div>
              </div>

              <div class="profile-dropdown-divider"></div>

              <div class="profile-dropdown-menu">
                <div class="profile-dropdown-item profile-dropdown-info-item">
                  <span class="profile-dropdown-icon-box" style="color:var(--indigo-600);">${ICONS.shield}</span>
                  <span>Akses: <strong>Full Admin Control</strong></span>
                </div>
                <div class="profile-dropdown-item profile-dropdown-info-item">
                  <span class="profile-dropdown-icon-box" style="color:#059669;">${ICONS.check}</span>
                  <span>Sesi: <strong>Aktif (Login)</strong></span>
                </div>
              </div>

              <div class="profile-dropdown-divider"></div>

              <div class="profile-dropdown-footer">
                <button type="button" id="header-logout-btn" class="profile-dropdown-logout-btn" title="Keluar dari akun">
                  ${ICONS.logout}
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;

    this.attachEvents(sessionUser);
  }

  attachEvents(sessionUser) {
    // Mobile menu toggle
    const mobileBtn = this.container.querySelector("#header-mobile-toggle");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", () => {
        const sb = document.getElementById("sidebar");
        const ov = document.getElementById("sidebarOverlay");
        if (sb) sb.classList.toggle("open");
        if (ov && sb) ov.classList.toggle("open", sb.classList.contains("open"));
      });
    }

    // Back to Kanban button
    const backBtn = this.container.querySelector("#header-back-kanban");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        store.closeTaskDetail();
      });
    }

    // Notification bell toggle
    const notifBtn = this.container.querySelector("#header-notif-btn");
    if (notifBtn) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.isProfileOpen) {
          this.isProfileOpen = false;
          this.render();
        }
        this.onToggleNotif();
      });
    }

    // Profile button toggle
    const profileBtn = this.container.querySelector("#header-profile-btn");
    if (profileBtn) {
      profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.isProfileOpen = !this.isProfileOpen;
        this.render();
      });
    }

    // Logout button click with confirmation
    const logoutBtn = this.container.querySelector("#header-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await swalConfirm({
          title: "Konfirmasi Logout",
          html: `Apakah Anda yakin ingin keluar dari sesi <strong>${sessionUser.name}</strong>?`,
          icon: "warning",
          confirmText: "Ya, Logout",
          cancelText: "Batal",
          confirmColor: "#dc2626",
          cancelColor: "#64748b",
        });

        if (confirmed) {
          if (typeof window !== "undefined" && window.AstaAuth && typeof window.AstaAuth.logout === "function") {
            window.AstaAuth.logout();
          } else {
            localStorage.removeItem("asta_auth_user");
            window.location.href = "../../login.html";
          }
        }
      });
    }
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (typeof this.unsubscribe === "function") {
      this.unsubscribe();
    }
  }
}
