/**
 * ToastContainer Component
 * Native ES Module for displaying animated floating toast notifications.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class ToastContainer {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  render() {
    const state = store.getState();
    const toasts = state.toasts || [];

    this.container.innerHTML = '';

    toasts.forEach((toast) => {
      const toastEl = document.createElement('div');
      toastEl.className = `toast toast--${toast.type}`;

      let iconHtml = Icons.info('w-4 h-4', 16);
      if (toast.type === 'success') iconHtml = Icons.checkCircle('w-4 h-4', 16);
      if (toast.type === 'error') iconHtml = Icons.alertCircle('w-4 h-4', 16);
      if (toast.type === 'warning') iconHtml = Icons.alertTriangle('w-4 h-4', 16);

      toastEl.innerHTML = `
        <span class="toast__icon">${iconHtml}</span>
        <div class="toast__content">
          <span class="toast__title">${toast.title}</span>
          ${toast.message ? `<span class="toast__message">${toast.message}</span>` : ''}
        </div>
        <button class="toast__close">${Icons.x('w-3.5 h-3.5', 14)}</button>
      `;

      const closeBtn = toastEl.querySelector('.toast__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          store.removeToast(toast.id);
        });
      }

      this.container.appendChild(toastEl);
    });
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
