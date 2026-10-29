/**
 * NotificationPopover.js
 * Unified Real-time Notifications Center in 100% Native Vanilla JS.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class NotificationPopover {
  constructor(options = {}) {
    this.isOpen = false;
    this.activeFilter = 'all';
    this.onNavigateTab = options.onNavigateTab || (() => {});

    this.element = document.createElement('div');
    this.element.className = 'notif-popover';
    this.element.style.display = 'none';

    this.bindEvents();
    store.subscribe(() => {
      if (this.isOpen) this.render();
    });
  }

  getElement() {
    return this.element;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.element.style.display = this.isOpen ? 'block' : 'none';
    if (this.isOpen) this.render();
  }

  close() {
    this.isOpen = false;
    this.element.style.display = 'none';
  }

  render() {
    const state = store.getState();
    const notifications = state.notifications;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filtered = notifications.filter(n => {
      if (this.activeFilter === 'all') return true;
      return n.type === this.activeFilter;
    });

    this.element.innerHTML = `
      <!-- Header -->
      <div style="padding: 14px 16px; border-bottom: 1px solid var(--color-zinc-100); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 24px; height: 24px; border-radius: 6px; background: var(--color-zinc-900); color: white; display: flex; align-items: center; justify-content: center;">
            ${Icons.bell('', 14)}
          </div>
          <h3 style="font-size: 13px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">
            Pusat Notifikasi Terpadu
          </h3>
          ${unreadCount > 0 ? `
            <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: #f43f5e; color: white;">
              ${unreadCount} baru
            </span>
          ` : ''}
        </div>

        <div style="display: flex; align-items: center; gap: 4px;">
          ${notifications.length > 0 ? `
            <button id="clearAllNotifsBtn" style="background: none; border: none; cursor: pointer; color: var(--color-zinc-400); padding: 4px; border-radius: 4px;" title="Bersihkan semua">
              ${Icons.trash('', 14)}
            </button>
          ` : ''}
          <button id="closeNotifPopoverBtn" style="background: none; border: none; cursor: pointer; color: var(--color-zinc-400); padding: 4px; border-radius: 4px;">
            ${Icons.x('', 14)}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div style="display: flex; padding: 4px 8px; background: var(--color-zinc-50); border-bottom: 1px solid var(--color-zinc-100); gap: 4px; font-size: 11px;">
        ${[
          { id: 'all', label: `Semua (${notifications.length})` },
          { id: 'finance', label: `Finance (${notifications.filter(n => n.type === 'finance').length})`, icon: Icons.dollarSign('', 12) },
          { id: 'crm', label: `CRM (${notifications.filter(n => n.type === 'crm').length})`, icon: Icons.briefcase('', 12) }
        ].map(t => `
          <button class="notif-filter-btn" data-filter="${t.id}" style="flex: 1; padding: 4px 6px; border-radius: 6px; border: none; cursor: pointer; font-weight: ${this.activeFilter === t.id ? '700' : '500'}; background: ${this.activeFilter === t.id ? 'white' : 'transparent'}; color: ${this.activeFilter === t.id ? 'var(--color-zinc-900)' : 'var(--color-zinc-500)'}; box-shadow: ${this.activeFilter === t.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'}; display: flex; align-items: center; justify-content: center; gap: 4px;">
            ${t.icon || ''}
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>

      <!-- List -->
      <div style="max-height: 320px; overflow-y: auto;">
        ${filtered.length === 0 ? `
          <div style="padding: 32px 16px; text-align: center; color: var(--color-zinc-400); font-size: 12px;">
            ${Icons.bell('', 20)}
            <p style="margin: 4px 0 0 0;">Tidak ada notifikasi saat ini.</p>
          </div>
        ` : filtered.map(notif => {
          const isFinance = notif.type === 'finance';
          const isCrm = notif.type === 'crm';

          return `
            <div class="notif-item" data-notif-id="${notif.id}" data-type="${notif.type}" style="padding: 12px 16px; border-bottom: 1px solid var(--color-zinc-100); cursor: pointer; transition: background-color 0.15s ease; background: ${!notif.isRead ? 'rgba(238, 242, 255, 0.4)' : 'white'};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; ${
                  isFinance ? 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;' : isCrm ? 'background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;' : 'background: var(--color-zinc-100); color: var(--color-zinc-700);'
                }">
                  ${isFinance ? 'Finance' : isCrm ? 'CRM Pipeline' : 'Sistem'}
                </span>
                <span style="font-size: 10px; font-family: var(--font-mono); color: var(--color-zinc-400);">
                  ${new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style="font-size: 12px; font-weight: ${!notif.isRead ? '700' : '600'}; color: var(--color-zinc-900); line-height: 1.3;">
                ${notif.title}
              </div>
              <p style="font-size: 11px; color: var(--color-zinc-600); margin: 2px 0 0 0; line-height: 1.4;">
                ${notif.message}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 10px; color: #4f46e5;">
                <span style="display: inline-flex; align-items: center; gap: 2px;">
                  <span>Buka di modul ${isFinance ? 'Finance' : 'CRM'}</span>
                  ${Icons.externalLink('', 10)}
                </span>
                ${!notif.isRead ? '<span style="width: 6px; height: 6px; border-radius: 9999px; background: #4f46e5;"></span>' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="padding: 8px 12px; background: var(--color-zinc-50); border-top: 1px solid var(--color-zinc-100); font-size: 10px; color: var(--color-zinc-400); text-align: center;">
        Setiap pembuatan invoice termin otomatis mengirim notifikasi ke Finance dan CRM.
      </div>
    `;
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('#closeNotifPopoverBtn')) {
        this.close();
      }

      if (e.target.closest('#clearAllNotifsBtn')) {
        store.clearAllNotifications();
        this.render();
      }

      const filterBtn = e.target.closest('.notif-filter-btn');
      if (filterBtn) {
        this.activeFilter = filterBtn.dataset.filter;
        this.render();
      }

      const notifItem = e.target.closest('.notif-item');
      if (notifItem) {
        const id = notifItem.dataset.notifId;
        const type = notifItem.dataset.type;
        store.markNotificationAsRead(id);
        this.close();
        if (type === 'finance') {
          store.setActiveTab('finance');
        } else if (type === 'crm') {
          store.setActiveTab('crm');
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.element.contains(e.target) && !e.target.closest('#notificationBellBtn') && !e.target.closest('#header-notif-btn')) {
        this.close();
      }
    });
  }
}
