/**
 * WhatsAppInbox.js — Vanilla JS WhatsApp Client Care & Helpdesk
 * Converted from src/components/clientcare/WhatsAppInbox.tsx
 */

import store from '../../store/store.js';

let filterMode = 'all'; // 'all' | 'ai' | 'human'
let inputText = '';

const ICONS = {
  messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  bot: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
};

export function renderWhatsAppInbox() {
  const { waConversations, activeWaId } = store.getState();

  const currentChat = waConversations.find((c) => c.id === activeWaId) || waConversations[0] || null;

  const filteredChats = waConversations.filter((c) => {
    if (filterMode === 'ai') return c.ai_mode === 'auto';
    if (filterMode === 'human') return c.needs_human || c.ai_mode === 'off';
    return true;
  });

  return `
    <div style="flex:1;display:flex;height:100%;overflow:hidden;background:var(--bg-canvas);">
      
      <!-- Left Chat List Column -->
      <div style="width:340px;display:flex;flex-direction:column;border-right:1px solid var(--border-light);background:var(--bg-card);flex-shrink:0;">
        <!-- Header -->
        <div style="padding:16px;border-bottom:1px solid var(--border-light);display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:32px;height:32px;border-radius:var(--radius-xl);background:var(--emerald-500);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,.2);">
                ${ICONS.messageSquare}
              </div>
              <h2 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                WhatsApp Client Care
              </h2>
            </div>
            <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:700;background:rgba(16,185,129,.1);color:var(--emerald-600);border:1px solid rgba(16,185,129,.2);">
              Meta Cloud API
            </span>
          </div>

          <!-- Quick Filters -->
          <div style="display:flex;align-items:center;gap:4px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-xl);font-size:11px;font-weight:600;">
            <button
              class="wa-filter-btn ${filterMode === 'all' ? 'active' : ''}"
              data-mode="all"
              style="flex:1;padding:6px;border-radius:var(--radius-lg);text-align:center;border:none;cursor:pointer;transition:all var(--transition);${
                filterMode === 'all'
                  ? 'background:var(--bg-card);color:var(--text-primary);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              Semua (${waConversations.length})
            </button>
            <button
              class="wa-filter-btn ${filterMode === 'ai' ? 'active' : ''}"
              data-mode="ai"
              style="flex:1;padding:6px;border-radius:var(--radius-lg);text-align:center;border:none;cursor:pointer;transition:all var(--transition);${
                filterMode === 'ai'
                  ? 'background:var(--bg-card);color:var(--indigo-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              🤖 AI Mode
            </button>
            <button
              class="wa-filter-btn ${filterMode === 'human' ? 'active' : ''}"
              data-mode="human"
              style="flex:1;padding:6px;border-radius:var(--radius-lg);text-align:center;border:none;cursor:pointer;transition:all var(--transition);${
                filterMode === 'human'
                  ? 'background:var(--bg-card);color:var(--rose-600);font-weight:700;box-shadow:var(--shadow-xs);'
                  : 'background:none;color:var(--text-muted);'
              }"
            >
              ⚠ Butuh Human
            </button>
          </div>
        </div>

        <!-- Conversation List -->
        <div style="flex:1;overflow-y:auto;">
          ${filteredChats
            .map((chat) => {
              const isSelected = currentChat && chat.id === currentChat.id;

              return `
              <div
                class="wa-chat-item ${isSelected ? 'selected' : ''}"
                data-chat-id="${chat.id}"
                style="padding:14px 16px;display:flex;align-items:flex-start;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-light);transition:background var(--transition);position:relative;${
                  isSelected
                    ? 'background:rgba(99,102,241,.08);border-left:4px solid var(--indigo-600);'
                    : 'background:transparent;'
                }"
              >
                <!-- Avatar -->
                <div
                  style="width:40px;height:40px;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0;background:${
                    chat.avatar_bg ? chat.avatar_bg.replace('bg-', '') : 'var(--indigo-600)'
                  };"
                  class="${chat.avatar_bg || 'bg-indigo-600'}"
                >
                  ${(chat.contact_name || 'WA').slice(0, 2).toUpperCase()}
                </div>

                <!-- Chat Details -->
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-weight:700;font-size:12px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${chat.contact_name}
                    </span>
                    <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">
                      ${chat.last_message_time || ''}
                    </span>
                  </div>

                  <p style="font-size:11px;font-weight:600;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:2px 0 0 0;">
                    ${chat.company_name}
                  </p>

                  <p style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:4px 0 0 0;">
                    ${chat.last_message || ''}
                  </p>

                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
                    <span style="padding:2px 6px;border-radius:var(--radius-sm);font-size:9px;font-weight:700;${
                      chat.ai_mode === 'auto'
                        ? 'background:rgba(99,102,241,.1);color:var(--indigo-600);'
                        : chat.ai_mode === 'suggest'
                        ? 'background:rgba(245,158,11,.1);color:var(--amber-600);'
                        : 'background:var(--bg-surface);color:var(--text-muted);'
                    }">
                      AI: ${(chat.ai_mode || 'OFF').toUpperCase()}
                    </span>

                    ${
                      chat.needs_human
                        ? `
                      <span style="padding:2px 6px;border-radius:var(--radius-sm);font-size:9px;font-weight:800;background:rgba(239,68,68,.1);color:var(--rose-600);border:1px solid rgba(239,68,68,.2);display:flex;align-items:center;gap:3px;">
                        ${ICONS.alertTriangle}
                        <span>Handoff</span>
                      </span>
                    `
                        : ''
                    }
                  </div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Center Chat Area -->
      ${
        currentChat
          ? `
        <div style="flex:1;display:flex;flex-direction:column;height:100%;background:var(--bg-canvas);">
          <!-- Active Chat Header -->
          <div style="height:64px;padding:0 24px;background:var(--bg-card);border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-xs);flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div
                style="width:36px;height:36px;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;background:${
                  currentChat.avatar_bg ? currentChat.avatar_bg.replace('bg-', '') : 'var(--indigo-600)'
                };"
                class="${currentChat.avatar_bg || 'bg-indigo-600'}"
              >
                ${(currentChat.contact_name || 'WA').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <h3 style="font-weight:800;font-size:13px;color:var(--text-primary);margin:0;">
                    ${currentChat.contact_name}
                  </h3>
                  <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">
                    ${currentChat.contact_phone || ''}
                  </span>
                </div>
                <p style="font-size:11px;color:var(--text-muted);font-weight:500;margin:2px 0 0 0;">
                  ${currentChat.company_name}
                </p>
              </div>
            </div>

            <!-- AI Mode Selector & Lead Button -->
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
                <span style="color:var(--text-muted);font-weight:500;">Mode Respon AI:</span>
                <select
                  id="wa-ai-mode-select"
                  style="padding:6px 12px;border-radius:var(--radius-xl);background:var(--bg-surface);font-size:12px;font-weight:700;color:var(--text-primary);border:1px solid var(--border-light);outline:none;cursor:pointer;"
                >
                  <option value="auto" ${currentChat.ai_mode === 'auto' ? 'selected' : ''}>🤖 Auto (AI Kirim Otomatis)</option>
                  <option value="suggest" ${currentChat.ai_mode === 'suggest' ? 'selected' : ''}>✨ Suggest (AI Beri Draft)</option>
                  <option value="off" ${currentChat.ai_mode === 'off' ? 'selected' : ''}>Off (Manual Human Saja)</option>
                </select>
              </div>

              ${
                currentChat.lead_id
                  ? `
                <button
                  id="wa-open-lead-btn"
                  data-lead-id="${currentChat.lead_id}"
                  style="padding:6px 14px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);color:var(--indigo-600);font-size:12px;font-weight:700;border:1px solid rgba(99,102,241,.2);cursor:pointer;"
                >
                  Buka Lead
                </button>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Sensitive Guardrail Banner if Handoff -->
          ${
            currentChat.needs_human
              ? `
            <div style="padding:10px 24px;background:rgba(239,68,68,.08);border-bottom:1px solid rgba(239,68,68,.2);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--rose-600);flex-shrink:0;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="display:flex;">${ICONS.shieldAlert}</span>
                <span style="font-weight:700;">
                  Human Handoff Aktif: Percakapan menyangkut negosiasi harga / diskon di luar kewenangan AI.
                </span>
              </div>
              <span id="wa-assign-sales-btn" style="font-weight:600;font-size:11px;text-decoration:underline;cursor:pointer;">
                Tugaskan Agen Sales
              </span>
            </div>
          `
              : ''
          }

          <!-- Messages Stream -->
          <div id="wa-messages-container" style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;">
            ${(currentChat.messages || [])
              .map((msg) => {
                const isClient = msg.sender === 'client';
                const isAi = msg.sender === 'ai';

                return `
                <div style="display:flex;justify-content:${isClient ? 'flex-start' : 'flex-end'};">
                  <div style="max-width:540px;border-radius:var(--radius-2xl);padding:14px 16px;display:flex;flex-direction:column;gap:6px;box-shadow:var(--shadow-xs);${
                    isClient
                      ? 'background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);border-top-left-radius:var(--radius-xs);'
                      : isAi
                      ? 'background:linear-gradient(135deg, var(--indigo-600), #7c3aed);color:#fff;border-top-right-radius:var(--radius-xs);'
                      : 'background:var(--emerald-600);color:#fff;border-top-right-radius:var(--radius-xs);'
                  }">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;opacity:0.85;padding-bottom:4px;border-bottom:${
                      isClient ? '1px solid var(--border-light)' : '1px solid rgba(255,255,255,.2)'
                    };">
                      <span style="font-weight:700;text-transform:uppercase;letter-spacing:0.05em;display:flex;align-items:center;gap:4px;">
                        ${
                          isClient
                            ? `${ICONS.user}<span>${currentChat.contact_name}</span>`
                            : isAi
                            ? `${ICONS.bot}<span>ASTACODE AI Assistant</span>`
                            : `${ICONS.user}<span>Sales Executive</span>`
                        }
                      </span>
                      <span style="font-family:var(--font-mono);">${msg.timestamp || ''}</span>
                    </div>

                    <p style="font-size:12px;line-height:1.5;margin:0;">
                      ${msg.text}
                    </p>

                    ${
                      isAi && msg.kb_source
                        ? `
                      <div style="padding-top:6px;font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.15);">
                        <span>Sumber: ${msg.kb_source}</span>
                        <span style="font-family:var(--font-mono);">Confidence: 94%</span>
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>

          <!-- AI Suggestion Bar if mode == suggest -->
          ${
            currentChat.ai_mode === 'suggest'
              ? `
            <div style="padding:12px 16px;margin:0 24px 8px 24px;border-radius:var(--radius-xl);background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);font-size:12px;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow-xs);flex-shrink:0;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--amber-500);display:flex;">${ICONS.sparkles}</span>
                <span style="font-weight:700;color:var(--indigo-600);">
                  Rekomendasi Balasan AI:
                </span>
                <span style="color:var(--text-secondary);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:380px;">
                  "Halo Pak, untuk negosiasi diskon penawaran kami diskusikan dengan Head of Sales ya..."
                </span>
              </div>
              <button
                id="wa-apply-suggestion-btn"
                style="padding:5px 12px;border-radius:var(--radius-lg);background:var(--indigo-600);color:#fff;font-weight:700;font-size:11px;border:none;cursor:pointer;"
              >
                Gunakan Draft AI
              </button>
            </div>
          `
              : ''
          }

          <!-- Chat Input Bar -->
          <form
            id="wa-send-form"
            style="padding:16px 24px;background:var(--bg-card);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:12px;flex-shrink:0;"
          >
            <input
              id="wa-chat-input"
              type="text"
              placeholder="Ketik balasan WhatsApp resmi ke klien..."
              value="${inputText}"
              style="flex:1;padding:10px 16px;border-radius:var(--radius-xl);background:var(--bg-surface);border:1px solid var(--border-light);font-size:12px;color:var(--text-primary);outline:none;transition:border-color var(--transition);"
            />
            <button
              type="submit"
              style="padding:10px 20px;border-radius:var(--radius-xl);background:var(--emerald-600);color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,.3);display:flex;align-items:center;gap:6px;transition:all var(--transition);"
            >
              ${ICONS.send}
              <span>Kirim</span>
            </button>
          </form>
        </div>
      `
          : `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:13px;">
          Pilih percakapan WhatsApp dari daftar di sebelah kiri.
        </div>
      `
      }
    </div>
  `;
}

export function bindWhatsAppInboxEvents(container) {
  // Filter tabs
  container.querySelectorAll('.wa-filter-btn[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterMode = btn.dataset.mode;
      reRender(container);
    });
  });

  // Select Chat item
  container.querySelectorAll('.wa-chat-item[data-chat-id]').forEach((item) => {
    item.addEventListener('click', () => {
      const chatId = item.dataset.chatId;
      store.setActiveWaId(chatId);
      reRender(container);
      scrollChatToBottom(container);
    });
  });

  // AI Mode select
  const aiModeSelect = container.querySelector('#wa-ai-mode-select');
  if (aiModeSelect) {
    aiModeSelect.addEventListener('change', (e) => {
      const { activeWaId } = store.getState();
      if (activeWaId) {
        store.setWaAiMode(activeWaId, e.target.value);
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: {
              message: `Mode AI WhatsApp diperbarui menjadi: ${e.target.value.toUpperCase()}`,
              type: 'info',
            },
          })
        );
        reRender(container);
      }
    });
  }

  // Open Lead Button
  const openLeadBtn = container.querySelector('#wa-open-lead-btn');
  if (openLeadBtn) {
    openLeadBtn.addEventListener('click', () => {
      const leadId = openLeadBtn.dataset.leadId;
      if (leadId) {
        store.navigateToLeadDetail(leadId);
      }
    });
  }

  // Assign Sales button in sensitive handoff banner
  const assignSalesBtn = container.querySelector('#wa-assign-sales-btn');
  if (assignSalesBtn) {
    assignSalesBtn.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: 'Lead Sales Executive telah ditugaskan untuk mengambil alih percakapan ini.',
            type: 'success',
          },
        })
      );
    });
  }

  // Apply AI Suggestion Draft
  const applySugBtn = container.querySelector('#wa-apply-suggestion-btn');
  if (applySugBtn) {
    applySugBtn.addEventListener('click', () => {
      inputText =
        'Halo Pak Kevin, mengenai permintaan penyesuaian budget 25%, kami perlu mengajukan approval khusus ke Sales Director. Apakah berkenan kita jadwalkan Google Meet besok jam 14:00?';
      const inputEl = container.querySelector('#wa-chat-input');
      if (inputEl) {
        inputEl.value = inputText;
        inputEl.focus();
      }
    });
  }

  // Input text change
  const inputEl = container.querySelector('#wa-chat-input');
  if (inputEl) {
    inputEl.addEventListener('input', (e) => {
      inputText = e.target.value;
    });
  }

  // Send message form
  const sendForm = container.querySelector('#wa-send-form');
  if (sendForm) {
    sendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const { activeWaId } = store.getState();
      if (!inputText.trim() || !activeWaId) return;

      store.sendWaMessage(activeWaId, inputText.trim());
      inputText = '';
      reRender(container);
      scrollChatToBottom(container);
    });
  }
}

function scrollChatToBottom(container) {
  setTimeout(() => {
    const messagesEl = container.querySelector('#wa-messages-container');
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }, 50);
}

function reRender(container) {
  container.innerHTML = renderWhatsAppInbox();
  bindWhatsAppInboxEvents(container);
}

export function mount(container) {
  reRender(container);
  scrollChatToBottom(container);

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.activeView === 'client_care') {
      reRender(container);
    }
  });

  return unsubscribe;
}
