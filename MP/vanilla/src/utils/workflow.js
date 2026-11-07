/**
 * workflow.js — Standar Aturan & Transisi Status Kanban ASTACODE PM
 * 
 * 6 Status Kanban:
 * 1. Backlog (Titik Awal)
 * 2. To Do (Siap Dikerjakan)
 * 3. In Development (Sedang Dikoding)
 * 4. Review & Testing (Pemeriksaan & Pengujian)
 * 5. Done (Selesai — Terminal State Positif)
 * 6. Rejected (Ditolak / Batal — Terminal State Negatif)
 */

export const KANBAN_STAGES = [
  {
    id: 'backlog',
    name: 'Backlog',
    color: '#64748b',
    primaryStatus: 'Backlog',
    matchStatuses: ['Backlog', 'Baru'],
    description: 'Titik Awal: Semua task baru masuk ke sini untuk dianalisis oleh PM/Lead Dev.'
  },
  {
    id: 'todo',
    name: 'To Do',
    color: '#3b82f6',
    primaryStatus: 'To Do',
    matchStatuses: ['To Do', 'Dianalisis'],
    description: 'Siap Dikerjakan: Spesifikasi jelas dan siap diambil developer.'
  },
  {
    id: 'in_development',
    name: 'In Development',
    color: '#6366f1',
    primaryStatus: 'In Development',
    matchStatuses: ['In Development', 'In Progress', 'Diperbaiki Agen', 'Perlu Manual'],
    description: 'Sedang Dikoding: Developer sedang mengimplementasikan kode & fitur.'
  },
  {
    id: 'review_testing',
    name: 'Review & Testing',
    color: '#f59e0b',
    primaryStatus: 'Review & Testing',
    matchStatuses: ['Review & Testing', 'In Review', 'QA/Testing', 'Menunggu Persetujuan', 'Deploy Staging', 'Disetujui'],
    description: 'Pemeriksaan & Pengujian: Lead Dev mereview PR dan QA menguji di Staging.'
  },
  {
    id: 'done',
    name: 'Done',
    color: '#10b981',
    primaryStatus: 'Done',
    matchStatuses: ['Done', 'Selesai', 'Deploy Production', 'Dipantau'],
    description: 'Selesai: Fitur sudah ter-deploy ke production atau disetujui penuh oleh klien.'
  },
  {
    id: 'rejected',
    name: 'Rejected',
    color: '#ef4444',
    primaryStatus: 'Rejected',
    matchStatuses: ['Rejected', 'Ditolak', 'Batal'],
    description: 'Ditolak / Batal: Fitur dibatalkan klien, out-of-scope, atau task duplikat.'
  }
];

export const WORKFLOW_TRANSITION_RULES = {
  'Backlog': {
    name: 'Backlog',
    allowed: ['To Do', 'Rejected'],
    errorMsg: 'Task dari Backlog TIDAK BISA langsung ke In Development, Review & Testing, atau Done. Task harus dianalisis oleh PM/Lead Dev lalu disetujui ke "To Do" atau dibatalkan ke "Rejected".'
  },
  'To Do': {
    name: 'To Do',
    allowed: ['In Development', 'Backlog', 'Rejected'],
    errorMsg: 'Task dari To Do TIDAK BISA langsung ke Review & Testing atau Done. Task harus diambil developer dan dipindahkan ke "In Development" saat mulai mengoding, dikembalikan ke "Backlog" jika ditunda, atau "Rejected".'
  },
  'In Development': {
    name: 'In Development',
    allowed: ['Review & Testing', 'To Do', 'Rejected'],
    errorMsg: 'Task dari In Development TIDAK BISA melompati Review & Testing langsung ke Done! Kode wajib dibuatkan Pull Request (PR) dan diuji di "Review & Testing", dikembalikan ke "To Do" jika dialihkan, atau "Rejected".'
  },
  'Review & Testing': {
    name: 'Review & Testing',
    allowed: ['Done', 'In Development', 'Rejected'],
    errorMsg: 'Task dari Review & Testing TIDAK BISA kembali ke Backlog atau To Do secara langsung. Jika lolos pengujian pindahkan ke "Done", jika ada bug/perbaikan kembalikan ke "In Development" disertai catatan revisi, atau "Rejected".'
  },
  'Done': {
    name: 'Done',
    allowed: ['In Development', 'Review & Testing'],
    errorMsg: 'Status Done merupakan status akhir (Terminal State positif). Hanya bisa dibuka kembali (Reopen) ke "In Development" atau "Review & Testing" jika ada pengajuan Reopen resmi akibat isu kritis mendadak.'
  },
  'Rejected': {
    name: 'Rejected',
    allowed: ['Backlog'],
    errorMsg: 'Status Rejected merupakan status akhir (Terminal State negatif). Hanya bisa dipulihkan (Restore) kembali ke "Backlog" jika pembatalan dicabut oleh klien/PM.'
  }
};

/**
 * Normalisasi status task dari database / legacy ke salah satu dari 6 Canonical Status
 */
export function getCanonicalStatus(status) {
  if (!status) return 'Backlog';
  for (const stage of KANBAN_STAGES) {
    if (stage.primaryStatus === status || stage.matchStatuses.includes(status)) {
      return stage.primaryStatus;
    }
  }
  return status;
}

/**
 * Validasi apakah perpindahan status diizinkan berdasarkan SOP Kanban
 */
export function validateStatusTransition(fromStatus, toStatus) {
  const canonicalFrom = getCanonicalStatus(fromStatus);
  const canonicalTo = getCanonicalStatus(toStatus);

  if (canonicalFrom === canonicalTo) {
    return { allowed: true, canonicalFrom, canonicalTo };
  }

  const rule = WORKFLOW_TRANSITION_RULES[canonicalFrom];
  if (!rule) {
    return { allowed: true, canonicalFrom, canonicalTo };
  }

  const isAllowed = rule.allowed.includes(canonicalTo);
  if (!isAllowed) {
    return {
      allowed: false,
      reason: rule.errorMsg,
      canonicalFrom,
      canonicalTo,
      allowedTargets: rule.allowed
    };
  }

  return { allowed: true, canonicalFrom, canonicalTo };
}

