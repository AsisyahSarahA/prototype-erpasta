/**
 * workflow.js — Standar Aturan & Transisi Status Kanban Maju Satu Arah (Strict Forward-Only) ASTACODE PM
 *
 * 6 Status Kanban:
 * 1. Backlog (Titik Awal) -> hanya bisa ke To Do atau Rejected
 * 2. To Do (Siap Dikerjakan) -> sudah dianalisis, TIDAK BISA balik ke Backlog; hanya bisa ke In Development atau Rejected
 * 3. In Development (Sedang Dikoding) -> sedang dikerjakan, TIDAK BISA balik ke To Do / Backlog; hanya bisa ke Review & Testing atau Rejected
 * 4. Review & Testing (Pemeriksaan & Pengujian) -> TIDAK BISA balik ke status sebelumnya; hanya bisa ke Done atau Rejected
 * 5. Done (Selesai — Terminal State Positif) -> Terkunci permanen, TIDAK BISA balik ke status mana pun
 * 6. Rejected (Ditolak / Batal — Terminal State Negatif) -> Terkunci permanen, TIDAK BISA balik ke status mana pun
 */

export const KANBAN_STAGES = [
  {
    id: 'backlog',
    name: 'Backlog',
    order: 0,
    color: '#64748b',
    primaryStatus: 'Backlog',
    matchStatuses: ['Backlog', 'Baru'],
    description: 'Titik Awal: Semua task baru masuk ke sini untuk dianalisis oleh PM/Lead Dev. Hanya bisa maju ke To Do atau dibatalkan ke Rejected.'
  },
  {
    id: 'todo',
    name: 'To Do',
    order: 1,
    color: '#3b82f6',
    primaryStatus: 'To Do',
    matchStatuses: ['To Do', 'Dianalisis'],
    description: 'Siap Dikerjakan: Sudah selesai dianalisis (tidak bisa kembali ke Backlog). Hanya bisa maju ke In Development atau Rejected.'
  },
  {
    id: 'in_development',
    name: 'In Development',
    order: 2,
    color: '#6366f1',
    primaryStatus: 'In Development',
    matchStatuses: ['In Development', 'In Progress', 'Diperbaiki Agen', 'Perlu Manual'],
    description: 'Sedang Dikoding: Developer aktif mengimplementasikan kode (tidak bisa mundur ke To Do/Backlog). Hanya bisa maju ke Review & Testing atau Rejected.'
  },
  {
    id: 'review_testing',
    name: 'Review & Testing',
    order: 3,
    color: '#f59e0b',
    primaryStatus: 'Review & Testing',
    matchStatuses: ['Review & Testing', 'In Review', 'QA/Testing', 'Menunggu Persetujuan', 'Deploy Staging', 'Disetujui'],
    description: 'Pemeriksaan & Pengujian: Pemeriksaan PR & pengujian QA (tidak bisa mundur ke status sebelumnya). Hanya bisa maju ke Done atau Rejected.'
  },
  {
    id: 'done',
    name: 'Done',
    order: 4,
    color: '#10b981',
    primaryStatus: 'Done',
    matchStatuses: ['Done', 'Selesai', 'Deploy Production', 'Dipantau'],
    description: 'Selesai (Status Akhir Terkunci): Fitur sudah tuntas & terverifikasi penuh. Tidak dapat dikembalikan ke status sebelumnya.'
  },
  {
    id: 'rejected',
    name: 'Rejected',
    order: 5,
    color: '#ef4444',
    primaryStatus: 'Rejected',
    matchStatuses: ['Rejected', 'Ditolak', 'Batal'],
    description: 'Ditolak / Batal (Status Akhir Terkunci): Tiket dibatalkan permanen. Tidak dapat dikembalikan ke status sebelumnya.'
  }
];

export const WORKFLOW_TRANSITION_RULES = {
  'Backlog': {
    name: 'Backlog',
    order: 0,
    allowed: ['To Do', 'Rejected'],
    nextPrimary: 'To Do',
    getReason(target) {
      return `Task dari <b>Backlog</b> tidak dapat melompat langsung ke <b>${target}</b>. Task wajib dianalisis oleh PM/Lead Dev terlebih dahulu lalu dipindahkan ke <b>To Do</b> (atau <b>Rejected</b> jika dibatalkan).`;
    }
  },
  'To Do': {
    name: 'To Do',
    order: 1,
    allowed: ['In Development', 'Rejected'],
    nextPrimary: 'In Development',
    getReason(target) {
      if (target === 'Backlog') {
        return `Task pada status <b>To Do</b> tidak dapat dikembalikan lagi ke <b>Backlog</b> karena sudah selesai dianalisis dan disetujui masuk antrean pengerjaan.`;
      }
      return `Task dari <b>To Do</b> tidak dapat melompat langsung ke <b>${target}</b>. Developer wajib memindahkan task ke <b>In Development</b> terlebih dahulu saat mulai pengerjaan.`;
    }
  },
  'In Development': {
    name: 'In Development',
    order: 2,
    allowed: ['Review & Testing', 'Rejected'],
    nextPrimary: 'Review & Testing',
    getReason(target) {
      if (target === 'Backlog' || target === 'To Do') {
        return `Task pada status <b>In Development</b> tidak dapat dikembalikan lagi ke <b>${target}</b> karena sudah melewati tahap analisis & persiapan serta sedang dalam proses pengerjaan koding.`;
      }
      return `Task dari <b>In Development</b> dilarang melompati tahap pemeriksaan langsung ke <b>${target}</b>. Kode wajib melewati <b>Review & Testing</b> terlebih dahulu.`;
    }
  },
  'Review & Testing': {
    name: 'Review & Testing',
    order: 3,
    allowed: ['Done', 'Rejected'],
    nextPrimary: 'Done',
    getReason(target) {
      return `Task pada status <b>Review & Testing</b> tidak dapat dikembalikan lagi ke <b>${target}</b> karena sudah melewati tahapan pengerjaan sebelumnya (alur progres bersifat maju satu arah menuju <b>Done</b> atau <b>Rejected</b>).`;
    }
  },
  'Done': {
    name: 'Done',
    order: 4,
    allowed: [],
    nextPrimary: null,
    getReason(target) {
      return `Status <b>Done</b> merupakan status akhir penyelesaian (Terminal State). Task sudah tuntas & terverifikasi sehingga terkunci permanen dan tidak dapat dikembalikan ke <b>${target}</b>.`;
    }
  },
  'Rejected': {
    name: 'Rejected',
    order: 5,
    allowed: [],
    nextPrimary: null,
    getReason(target) {
      return `Status <b>Rejected</b> merupakan status akhir pembatalan (Terminal State). Task yang sudah ditolak/dibatalkan terkunci permanen dan tidak dapat dikembalikan lagi ke <b>${target}</b>.`;
    }
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
 * Validasi apakah perpindahan status diizinkan berdasarkan aturan Forward-Only Kanban
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
    const reason = typeof rule.getReason === 'function'
      ? rule.getReason(canonicalTo)
      : `Transisi dari ${canonicalFrom} ke ${canonicalTo} tidak diizinkan.`;
    return {
      allowed: false,
      reason,
      canonicalFrom,
      canonicalTo,
      allowedTargets: rule.allowed
    };
  }

  return { allowed: true, canonicalFrom, canonicalTo };
}
