/**
 * CommandPalette.js — Vanilla JS Command Palette (Ctrl+K)
 * Converted from src/components/common/CommandPalette.tsx
 */

import store from '../../store/store.js';
import { formatRupiah } from '../../utils/topCalculator.js';

let isOpen = false;
let currentQuery = '';

const ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
};

export function openCommandPalette() {
  isOpen = true;
  currentQuery = '';
  renderPalette();
  const input = document.getElementById('command-palette-input');
  if (input) {
    input.focus();
  }
}

export function closeCommandPalette() {
  isOpen = false;
  currentQuery = '';
  const overlay = document.getElementById('command-palette-modal');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }
}

function renderPalette() {
  let modalContainer = document.getElementById('command-palette-modal');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'command-palette-modal';
    document.body.appendChild(modalContainer);
  }

  if (!isOpen) {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
    return;
  }

  modalContainer.classList.remove('hidden');

  const { leads, customers } = store.getState();
  const q = currentQuery.toLowerCase().trim();

  const filteredLeads = leads.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      (l.customer && l.customer.legal_name.toLowerCase().includes(q)) ||
      (l.customer && l.customer.industry && l.customer.industry.toLowerCase().includes(q)) ||
      l.sales_pic.toLowerCase().includes(q)
  );

  const filteredCustomers = (customers || []).filter(
    (c) =>
      c.legal_name.toLowerCase().includes(q) ||
      (c.brand_name && c.brand_name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q))
  );

  let resultsHtml = '';

  if (filteredLeads.length === 0 && filteredCustomers.length === 0) {
    resultsHtml = `
      <div style="padding:32px 16px;text-align:center;font-size:12px;color:var(--text-muted);">
        Tidak ada data yang cocok dengan "${currentQuery}".
      </div>
    `;
  } else {
    const leadsHtml = filteredLeads.map((lead) => {
      const estValueFormatted = formatRupiah(lead.est_value || 0);
      const codeSuffix = lead.code.slice(-3);
      const customerName = lead.customer ? lead.customer.legal_name : 'Customer';

      return `
        <div
          class="command-item"
          data-lead-id="${lead.id}"
          style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:var(--radius-lg);cursor:pointer;transition:all var(--transition);border-bottom:1px solid var(--border-light);"
        >
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;color:var(--indigo-500);font-weight:700;font-size:12px;flex-shrink:0;">
              ${codeSuffix}
            </div>
            <div style="min-width:0;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:13px;font-weight:700;color:var(--text-primary);">${lead.title}</span>
                <span class="badge badge-slate" style="font-family:var(--font-mono);font-size:10px;">${lead.code}</span>
              </div>
              <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;margin-top:2px;">
                <span>${customerName}</span>
                <span>•</span>
                <span style="font-weight:700;color:var(--emerald-500);">${estValueFormatted}</span>
                <span>•</span>
                <span>PIC: ${lead.sales_pic}</span>
              </div>
            </div>
          </div>

          <div class="command-item-action" style="display:flex;align-items:center;gap:4px;color:var(--indigo-500);font-size:12px;font-weight:600;flex-shrink:0;margin-left:12px;">
            <span>Buka Lead</span>
            ${ICONS.arrowRight}
          </div>
        </div>
      `;
    }).join('');

    const customersHtml = filteredCustomers.map((cust) => `
      <div
        class="command-cust-item"
        data-cust-id="${cust.id}"
        style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:var(--radius-lg);cursor:pointer;transition:all var(--transition);border-bottom:1px solid var(--border-light);"
      >
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div style="width:36px;height:36px;border-radius:var(--radius-md);background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);display:flex;align-items:center;justify-content:center;color:#059669;font-weight:700;font-size:12px;flex-shrink:0;">
            🏢
          </div>
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:13px;font-weight:700;color:var(--text-primary);">${cust.legal_name}</span>
              <span class="badge badge-emerald" style="font-family:var(--font-mono);font-size:10px;">${cust.code}</span>
            </div>
            <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;margin-top:2px;">
              <span>${cust.industry}</span>
              <span>•</span>
              <span>${cust.city}</span>
              <span>•</span>
              <span style="font-weight:600;color:#059669;">Skor Relasi: ${cust.health_score || 85}</span>
            </div>
          </div>
        </div>

        <div class="command-item-action" style="display:flex;align-items:center;gap:4px;color:#059669;font-size:12px;font-weight:600;flex-shrink:0;margin-left:12px;">
          <span>Buka Customer</span>
          ${ICONS.arrowRight}
        </div>
      </div>
    `).join('');

    resultsHtml = leadsHtml + customersHtml;
  }

  modalContainer.innerHTML = `
    <div class="command-palette-overlay" id="command-palette-backdrop">
      <div class="command-palette" style="max-width:640px;" onclick="event.stopPropagation();">
        <!-- Search Input Bar -->
        <div class="command-input-wrapper" style="padding:12px 18px;">
          <span style="color:var(--indigo-500);display:flex;align-items:center;">${ICONS.search}</span>
          <input
            id="command-palette-input"
            class="command-input"
            type="text"
            placeholder="Ketik untuk mencari Lead, Customer, Quotation, PIC... (Tekan Esc untuk tutup)"
            value="${currentQuery}"
            autocomplete="off"
            style="font-size:14px;"
          />
          <button id="command-palette-close-btn" class="modal-close" title="Tutup (Esc)">
            ${ICONS.close}
          </button>
        </div>

        <!-- Quick Actions Bar -->
        <div style="padding:8px 16px;background:var(--bg-secondary);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;overflow-x:auto;">
          <span style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;">Aksi Cepat:</span>
          <button id="cmd-action-new-lead" class="btn btn-sm" style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);color:var(--indigo-500);font-weight:600;padding:3px 10px;">
            + Buat Lead Baru
          </button>
          <button id="cmd-action-setting-top" class="btn btn-sm btn-secondary" style="font-weight:500;padding:3px 10px;">
            Setting TOP Invoice
          </button>
          <button id="cmd-action-client-care" class="btn btn-sm btn-secondary" style="font-weight:500;padding:3px 10px;">
            WhatsApp Client Care
          </button>
        </div>

        <!-- Search Results List -->
        <div class="command-results" id="command-results-list" style="max-height:360px;">
          ${resultsHtml}
        </div>
      </div>
    </div>
  `;

  bindPaletteEvents();
}

function bindPaletteEvents() {
  const backdrop = document.getElementById('command-palette-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeCommandPalette();
    });
  }

  const closeBtn = document.getElementById('command-palette-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeCommandPalette();
    });
  }

  const input = document.getElementById('command-palette-input');
  if (input) {
    input.addEventListener('input', (e) => {
      currentQuery = e.target.value;
      renderPalette();
      const nextInput = document.getElementById('command-palette-input');
      if (nextInput) {
        nextInput.focus();
        nextInput.selectionStart = nextInput.selectionEnd = nextInput.value.length;
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCommandPalette();
      }
    });
  }

  // Quick Action Buttons
  const btnNewLead = document.getElementById('cmd-action-new-lead');
  if (btnNewLead) {
    btnNewLead.addEventListener('click', () => {
      closeCommandPalette();
      window.dispatchEvent(new CustomEvent('open-new-lead-modal'));
    });
  }

  const btnSettingTop = document.getElementById('cmd-action-setting-top');
  if (btnSettingTop) {
    btnSettingTop.addEventListener('click', () => {
      closeCommandPalette();
      store.setState({ activeView: 'finance_top' });
    });
  }

  const btnClientCare = document.getElementById('cmd-action-client-care');
  if (btnClientCare) {
    btnClientCare.addEventListener('click', () => {
      closeCommandPalette();
      store.setState({ activeView: 'client_care' });
    });
  }

  // Click on a Lead result
  document.querySelectorAll('.command-item[data-lead-id]').forEach((item) => {
    item.addEventListener('click', () => {
      const leadId = item.dataset.leadId;
      if (leadId) {
        store.navigateToLeadDetail(leadId);
        closeCommandPalette();
      }
    });
  });

  // Click on a Customer result
  document.querySelectorAll('.command-cust-item[data-cust-id]').forEach((item) => {
    item.addEventListener('click', () => {
      store.setActiveView('customers');
      closeCommandPalette();
    });
  });
}

// Global Keyboard Shortcut listener
export function initCommandPalette() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isOpen) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    } else if (e.key === 'Escape' && isOpen) {
      closeCommandPalette();
    }
  });

  window.addEventListener('open-command-palette', () => {
    openCommandPalette();
  });
}
