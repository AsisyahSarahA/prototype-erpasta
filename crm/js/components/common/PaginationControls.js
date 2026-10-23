/**
 * PaginationControls.js — Vanilla JS Pagination Component
 * Converted from src/components/common/PaginationControls.tsx
 */

const ICONS = {
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
};

/**
 * Generates pagination HTML string
 * @param {Object} pagination - { currentPage, totalPages, totalItems, startIndex, endIndex, pageSize }
 * @param {Object} options - { pageSizeOptions: number[], paginationId: string }
 * @returns {string} HTML string
 */
export function renderPaginationControls(pagination, options = {}) {
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    startIndex = 0,
    endIndex = 0,
    pageSize = 10,
  } = pagination || {};

  if (!totalItems || totalItems === 0) return '';

  const pageSizeOptions = options.pageSizeOptions || [5, 10, 20];
  const paginationId = options.paginationId || 'default-pagination';

  const startDisplay = totalItems > 0 ? startIndex + 1 : 0;
  const endDisplay = endIndex;

  const pageSizeSelectHtml = `
    <div style="display:flex;align-items:center;gap:6px;margin-left:8px;border-left:1px solid var(--border);padding-left:12px;">
      <span style="color:var(--text-muted);font-size:12px;">Tampilkan:</span>
      <select class="form-select pagination-page-size" data-pagination-id="${paginationId}" style="width:auto;padding:2px 8px;font-size:12px;font-weight:600;border-radius:var(--radius-sm);">
        ${pageSizeOptions.map((opt) => `
          <option value="${opt}" ${opt === pageSize ? 'selected' : ''}>${opt} / hal</option>
        `).join('')}
      </select>
    </div>
  `;

  const pageButtonsHtml = Array.from({ length: totalPages }).map((_, i) => {
    const pageNum = i + 1;
    const isActive = pageNum === currentPage;
    return `
      <button
        class="pagination-btn pagination-page-btn ${isActive ? 'active' : ''}"
        data-pagination-id="${paginationId}"
        data-page="${pageNum}"
        style="${isActive ? 'background:#4f46e5;border-color:#4f46e5;color:#ffffff;font-weight:700;box-shadow:0 1px 3px rgba(79,70,229,0.3);' : ''}"
      >
        ${pageNum}
      </button>
    `;
  }).join('');

  return `
    <div class="pagination-controls-wrapper" data-pagination-container="${paginationId}" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:var(--bg-card);border-top:1px solid var(--border);font-size:12px;">
      <!-- Left: Entries Counter & PageSize -->
      <div style="display:flex;align-items:center;gap:8px;color:var(--text-muted);">
        <span>
          Menampilkan <strong style="color:var(--text-primary);">${startDisplay}</strong> - <strong style="color:var(--text-primary);">${endDisplay}</strong> dari <strong style="color:var(--text-primary);">${totalItems}</strong> entri
        </span>
        ${pageSizeSelectHtml}
      </div>

      <!-- Right: Pagination Buttons -->
      <div class="pagination" style="display:flex;align-items:center;gap:4px;">
        <button
          class="pagination-btn pagination-prev-btn"
          data-pagination-id="${paginationId}"
          data-page="${currentPage - 1}"
          ${currentPage <= 1 ? 'disabled' : ''}
          title="Halaman Sebelumnya"
        >
          ${ICONS.chevronLeft}
        </button>

        ${pageButtonsHtml}

        <button
          class="pagination-btn pagination-next-btn"
          data-pagination-id="${paginationId}"
          data-page="${currentPage + 1}"
          ${currentPage >= totalPages ? 'disabled' : ''}
          title="Halaman Berikutnya"
        >
          ${ICONS.chevronRight}
        </button>
      </div>
    </div>
  `;
}

/**
 * Binds click and change events for a rendered pagination component
 * @param {HTMLElement} container - DOM container containing the pagination
 * @param {Function} onPageChange - callback(pageNumber)
 * @param {Function} onPageSizeChange - callback(pageSize)
 * @param {string} [paginationId] - optional identifier if multiple on page
 */
export function bindPaginationEvents(container, onPageChange, onPageSizeChange, paginationId = 'default-pagination') {
  if (!container) return;

  // Page buttons (numbers, prev, next)
  container.querySelectorAll(`button[data-pagination-id="${paginationId}"][data-page]`).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      const targetPage = parseInt(btn.dataset.page, 10);
      if (!isNaN(targetPage) && typeof onPageChange === 'function') {
        onPageChange(targetPage);
      }
    });
  });

  // Page size select dropdown
  const select = container.querySelector(`select.pagination-page-size[data-pagination-id="${paginationId}"]`);
  if (select) {
    select.addEventListener('change', (e) => {
      const newPageSize = parseInt(e.target.value, 10);
      if (!isNaN(newPageSize) && typeof onPageSizeChange === 'function') {
        onPageSizeChange(newPageSize);
      }
    });
  }
}
