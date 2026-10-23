/**
 * topCalculator.js — Vanilla JS conversion of topCalculator.ts
 * All business formulas preserved exactly from original.
 */

/**
 * Convert number to Indonesian words (Terbilang)
 * @param {number} n
 * @returns {string}
 */
export function terbilang(n) {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  const val = Math.floor(Math.abs(n));

  let res = '';
  if (val < 12) {
    res = bilangan[val];
  } else if (val < 20) {
    res = terbilang(val - 10) + ' Belas';
  } else if (val < 100) {
    res = terbilang(Math.floor(val / 10)) + ' Puluh ' + terbilang(val % 10);
  } else if (val < 200) {
    res = 'Seratus ' + terbilang(val - 100);
  } else if (val < 1000) {
    res = terbilang(Math.floor(val / 100)) + ' Ratus ' + terbilang(val % 100);
  } else if (val < 2000) {
    res = 'Seribu ' + terbilang(val - 1000);
  } else if (val < 1000000) {
    res = terbilang(Math.floor(val / 1000)) + ' Ribu ' + terbilang(val % 1000);
  } else if (val < 1000000000) {
    res = terbilang(Math.floor(val / 1000000)) + ' Juta ' + terbilang(val % 1000000);
  } else if (val < 1000000000000) {
    res = terbilang(Math.floor(val / 1000000000)) + ' Miliar ' + terbilang(val % 1000000000);
  } else {
    res = terbilang(Math.floor(val / 1000000000000)) + ' Triliun ' + terbilang(val % 1000000000000);
  }

  return res.replace(/\s+/g, ' ').trim();
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiahWords(amount) {
  const words = terbilang(amount).trim();
  return words ? `${words} Rupiah` : 'Nol Rupiah';
}

/**
 * Standard preset schemes for software house contracts
 */
export const TOP_PRESETS = {
  '30/40/30': {
    label: '30% DP / 40% Progress UAT / 30% Pelunasan (Standar)',
    terms: [
      {
        term_no: 1,
        name: 'Down Payment (DP)',
        value_type: 'percent',
        value: 30,
        trigger_type: 'on_signing',
        trigger_label: 'Saat penandatanganan kontrak / MoU',
        due_days_label: 'Net 7',
        description: 'Pembayaran uang muka untuk kick-off proyek & resource allocation',
      },
      {
        term_no: 2,
        name: 'Progress / UAT Milestone',
        value_type: 'percent',
        value: 40,
        trigger_type: 'uat',
        trigger_label: 'Setelah penyelesaian UAT aplikasi',
        due_days_label: 'Net 14',
        description: 'Penyelesaian fitur utama dan pengujian UAT client',
      },
      {
        term_no: 3,
        name: 'Pelunasan Final',
        value_type: 'balance',
        value: 30,
        trigger_type: 'bast',
        trigger_label: 'Setelah penandatanganan BAST',
        due_days_label: 'Net 14',
        description: 'Serah terima sistem final dan dokumen BAST',
      },
    ],
  },
  '50/50': {
    label: '50% DP / 50% Pelunasan BAST',
    terms: [
      {
        term_no: 1,
        name: 'Down Payment (DP 50%)',
        value_type: 'percent',
        value: 50,
        trigger_type: 'on_signing',
        trigger_label: 'Saat penandatanganan kontrak',
        due_days_label: 'Net 7',
        description: 'Uang muka pengerjaan proyek',
      },
      {
        term_no: 2,
        name: 'Pelunasan (50%)',
        value_type: 'balance',
        value: 50,
        trigger_type: 'bast',
        trigger_label: 'Saat penandatanganan BAST',
        due_days_label: 'Net 14',
        description: 'Pelunasan akhir pengerjaan',
      },
    ],
  },
  '40/30/30': {
    label: '40% DP / 30% Alpha Release / 30% BAST',
    terms: [
      {
        term_no: 1,
        name: 'Down Payment (40%)',
        value_type: 'percent',
        value: 40,
        trigger_type: 'on_signing',
        trigger_label: 'Saat penandatanganan kontrak',
        due_days_label: 'Net 7',
        description: 'Uang muka kick-off proyek',
      },
      {
        term_no: 2,
        name: 'Milestone Alpha / Core Feature',
        value_type: 'percent',
        value: 30,
        trigger_type: 'milestone',
        trigger_label: 'Penyelesaian modul transaksi utama',
        due_days_label: 'Net 14',
        description: 'Penyelesaian modul inti transaksi & master data',
      },
      {
        term_no: 3,
        name: 'Pelunasan BAST',
        value_type: 'balance',
        value: 30,
        trigger_type: 'bast',
        trigger_label: 'Saat penandatanganan BAST',
        due_days_label: 'Net 14',
        description: 'Serah terima proyek',
      },
    ],
  },
  '30/30/30/10': {
    label: '30% DP / 30% Dev / 30% UAT / 10% Retensi Garansi',
    terms: [
      {
        term_no: 1,
        name: 'Down Payment (30%)',
        value_type: 'percent',
        value: 30,
        trigger_type: 'on_signing',
        trigger_label: 'Saat penandatanganan kontrak',
        due_days_label: 'Net 7',
        description: 'Uang muka kick-off proyek',
      },
      {
        term_no: 2,
        name: 'Sprint Core Release (30%)',
        value_type: 'percent',
        value: 30,
        trigger_type: 'milestone',
        trigger_label: 'Deployment staging / sprint selesai',
        due_days_label: 'Net 14',
        description: 'Penyelesaian core backend & frontend',
      },
      {
        term_no: 3,
        name: 'UAT & Go-Live (30%)',
        value_type: 'percent',
        value: 30,
        trigger_type: 'go_live',
        trigger_label: 'Go-Live sistem di server client',
        due_days_label: 'Net 14',
        description: 'Sistem live di production',
      },
      {
        term_no: 4,
        name: 'Retensi Pemeliharaan (10%)',
        value_type: 'balance',
        value: 10,
        trigger_type: 'days_after_event',
        trigger_label: '90 hari masa garansi & maintenance',
        due_days_label: 'Net 30',
        description: 'Retensi garansi SLA pemeliharaan',
      },
    ],
  },
  '100% Upfront': {
    label: '100% Pelunasan Di Muka (Paket Kecil / Konsultasi)',
    terms: [
      {
        term_no: 1,
        name: 'Pelunasan Penuh 100%',
        value_type: 'percent',
        value: 100,
        trigger_type: 'on_signing',
        trigger_label: 'Saat penandatanganan kontrak / SPK',
        due_days_label: 'Net 7',
        description: 'Pembayaran penuh di muka sebelum pekerjaan dimulai',
      },
    ],
  },
};

/**
 * Recalculate all terms in a scheme based on total base amount
 * @param {Array} rawItems
 * @param {number} baseAmount
 * @param {string} [calcBasis='grand_total']
 * @param {string} [presetName='Custom']
 * @param {boolean} [lastTermIsBalance=true]
 * @returns {TopScheme}
 */
export function calculateTopScheme(
  rawItems,
  baseAmount,
  calcBasis = 'grand_total',
  presetName = 'Custom',
  lastTermIsBalance = true
) {
  const items = rawItems.map((item, index) => ({
    ...item,
    term_no: index + 1,
  }));

  if (baseAmount <= 0) {
    return {
      calc_basis: calcBasis,
      preset_name: presetName,
      last_term_is_balance: lastTermIsBalance,
      items: items.map((i) => ({ ...i, calculated_amount: 0 })),
      total_percent: 0,
      total_amount: 0,
      is_balanced: true,
      remaining_amount: 0,
      remaining_percent: 0,
    };
  }

  // 1. Calculate non-balance items
  let allocatedAmount = 0;
  let allocatedPercent = 0;
  const balanceIndex = items.findIndex((i) => i.value_type === 'balance');

  // If lastTermIsBalance is true and no balance type exists, set the last item as balance
  if (lastTermIsBalance && balanceIndex === -1 && items.length > 1) {
    items[items.length - 1].value_type = 'balance';
  }

  const updatedItems = items.map((item) => {
    if (item.value_type === 'percent') {
      const pct = Math.max(0, item.value || 0);
      const calculated = Math.round((pct / 100) * baseAmount);
      allocatedAmount += calculated;
      allocatedPercent += pct;
      return { ...item, calculated_amount: calculated };
    } else if (item.value_type === 'amount') {
      const nominal = Math.max(0, item.value || 0);
      const pct = (nominal / baseAmount) * 100;
      allocatedAmount += nominal;
      allocatedPercent += pct;
      return { ...item, calculated_amount: nominal };
    } else {
      // Balance term will be evaluated in step 2
      return { ...item, calculated_amount: 0 };
    }
  });

  // 2. Compute balance term if present
  const activeBalanceIdx = updatedItems.findIndex((i) => i.value_type === 'balance');
  if (activeBalanceIdx !== -1) {
    const remainingAmt = Math.max(0, baseAmount - allocatedAmount);
    const remainingPct = Math.max(0, 100 - allocatedPercent);

    updatedItems[activeBalanceIdx].calculated_amount = remainingAmt;
    updatedItems[activeBalanceIdx].value = Math.round(remainingPct * 100) / 100;

    allocatedAmount += remainingAmt;
    allocatedPercent += remainingPct;
  }

  const remainingAmount = baseAmount - allocatedAmount;
  const remainingPercent = 100 - allocatedPercent;
  // Consider balanced if within 1 IDR / 0.01%
  const isBalanced = Math.abs(remainingAmount) <= 1 && Math.abs(remainingPercent) <= 0.05;

  return {
    calc_basis: calcBasis,
    preset_name: presetName,
    last_term_is_balance: lastTermIsBalance,
    items: updatedItems,
    total_percent: Math.round(allocatedPercent * 100) / 100,
    total_amount: allocatedAmount,
    is_balanced: isBalanced,
    remaining_amount: remainingAmount,
    remaining_percent: Math.round(remainingPercent * 100) / 100,
  };
}

/**
 * Generate scheme from a named preset
 * @param {string} presetKey
 * @param {number} baseAmount
 * @param {string} [calcBasis='grand_total']
 * @returns {TopScheme}
 */
export function createTopFromPreset(presetKey, baseAmount, calcBasis = 'grand_total') {
  const preset = TOP_PRESETS[presetKey] || TOP_PRESETS['30/40/30'];
  const items = preset.terms.map((t, idx) => ({
    ...t,
    id: `term-${Date.now()}-${idx}`,
    calculated_amount: 0,
    status: 'Planned',
  }));

  return calculateTopScheme(items, baseAmount, calcBasis, presetKey, true);
}
