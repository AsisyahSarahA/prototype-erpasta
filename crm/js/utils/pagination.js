/**
 * pagination.js — Vanilla JS conversion of pagination.ts
 * Business logic preserved exactly from original.
 */

/**
 * @param {Array} items
 * @param {number} page
 * @param {number} pageSize
 * @returns {{ data: Array, pagination: PaginationState }}
 */
export function paginate(items, page, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
    },
  };
}
