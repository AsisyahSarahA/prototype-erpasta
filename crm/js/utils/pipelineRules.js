/**
 * pipelineRules.js — Vanilla JS conversion of pipelineRules.ts
 * Business logic and constants preserved exactly from original.
 */

/** @type {Array<PipelineStageConfig>} */
export const PIPELINE_STAGES = [
  {
    id: 'new_lead',
    name: 'New Lead',
    order: 1,
    probability: 10,
    color: '#3B82F6', // Blue
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-900/60',
  },
  {
    id: 'follow_up',
    name: 'Follow Up',
    order: 2,
    probability: 20,
    color: '#8B5CF6', // Purple
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-900/60',
  },
  {
    id: 'requirement',
    name: 'Requirement',
    order: 3,
    probability: 35,
    color: '#06B6D4', // Cyan
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    borderLight: 'border-cyan-200',
    borderDark: 'dark:border-cyan-900/60',
  },
  {
    id: 'quotation',
    name: 'Quotation',
    order: 4,
    probability: 55,
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-900/60',
  },
  {
    id: 'negotiation',
    name: 'Negosiasi',
    order: 5,
    probability: 75,
    color: '#EC4899', // Pink
    bgLight: 'bg-pink-50',
    bgDark: 'dark:bg-pink-950/40',
    borderLight: 'border-pink-200',
    borderDark: 'dark:border-pink-900/60',
  },
  {
    id: 'deal',
    name: 'Deal (Won)',
    order: 6,
    probability: 100,
    color: '#10B981', // Emerald
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-900/60',
  },
  {
    id: 'reject',
    name: 'Reject (Lost)',
    order: 7,
    probability: 0,
    color: '#EF4444', // Red
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-900/60',
  },
];

/**
 * Validate stage transition as per PRD business rules (BR-04, BR-07, BR-08, BR-15)
 * @param {object} lead
 * @param {string} targetStageId
 * @param {string} [rejectReason]
 * @returns {{ allowed: boolean, message?: string }}
 */
export function validateStageTransition(lead, targetStageId, rejectReason) {
  if (lead.stage_id === targetStageId) {
    return { allowed: true };
  }

  // Reject stage requires reason
  if (targetStageId === 'reject') {
    if (!rejectReason || rejectReason.trim().length === 0) {
      return {
        allowed: false,
        message: 'Perpindahan ke status Reject wajib menyertakan alasan penolakan (PRD BR-08).',
      };
    }
    return { allowed: true };
  }

  // Quotation stage requires RAB with items
  if (targetStageId === 'quotation') {
    if (!lead.rab || lead.rab.items.length === 0) {
      return {
        allowed: false,
        message: 'Tahap Quotation memerlukan estimasi RAB yang sudah dibuat (PRD BR-04). Buat RAB di tab Requirement/RAB terlebih dahulu.',
      };
    }
  }

  // Deal stage requires reviewed RAB and balanced quotation/contract
  if (targetStageId === 'deal') {
    if (!lead.rab || lead.rab.items.length === 0) {
      return {
        allowed: false,
        message: 'Tidak dapat Deal tanpa RAB yang valid dan disepakati.',
      };
    }
    const activeQuo = lead.quotations.find((q) => q.id === lead.active_quotation_id) || lead.quotations[0];
    if (activeQuo && !activeQuo.top_scheme.is_balanced) {
      return {
        allowed: false,
        message: 'Termin pembayaran (Setting TOP) pada Quotation belum balance (100%). Selesaikan alokasi termin di tab Quotation.',
      };
    }
  }

  return { allowed: true };
}

/**
 * Calculate aggregate pipeline statistics
 * @param {Array} leads
 */
export function calculatePipelineMetrics(leads) {
  let totalValue = 0;
  let weightedValue = 0;
  let activeLeadsCount = 0;
  let staleCount = 0;

  const stageCounts = {
    new_lead:    { count: 0, total: 0, weighted: 0 },
    follow_up:   { count: 0, total: 0, weighted: 0 },
    requirement: { count: 0, total: 0, weighted: 0 },
    quotation:   { count: 0, total: 0, weighted: 0 },
    negotiation: { count: 0, total: 0, weighted: 0 },
    deal:        { count: 0, total: 0, weighted: 0 },
    reject:      { count: 0, total: 0, weighted: 0 },
  };

  const stageConfigMap = new Map(PIPELINE_STAGES.map((s) => [s.id, s]));

  for (const lead of leads) {
    const stage = stageConfigMap.get(lead.stage_id);
    const prob = stage ? stage.probability : 0;
    const weighted = Math.round((lead.est_value * prob) / 100);

    totalValue += lead.est_value;
    weightedValue += weighted;

    if (lead.stage_id !== 'deal' && lead.stage_id !== 'reject') {
      activeLeadsCount++;
    }

    if (lead.days_in_stage >= 5) {
      staleCount++;
    }

    if (stageCounts[lead.stage_id]) {
      stageCounts[lead.stage_id].count++;
      stageCounts[lead.stage_id].total += lead.est_value;
      stageCounts[lead.stage_id].weighted += weighted;
    }
  }

  return {
    totalValue,
    weightedValue,
    totalCount: leads.length,
    activeLeadsCount,
    staleCount,
    stageCounts,
  };
}
