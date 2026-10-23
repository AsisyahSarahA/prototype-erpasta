/**
 * LeadDetailPage.js — Complete Vanilla JS Lead Workspace & Detail Page
 * Converted from src/components/crm/LeadDetailPage.tsx
 * 100% Identical Visual, CSS, and Component Structure to React Source
 */

import store from '../../store/store.js';
import { PIPELINE_STAGES } from '../../utils/pipelineRules.js';
import {
  formatRupiah,
  formatRupiahWords,
  calculateTopScheme,
  createTopFromPreset,
  TOP_PRESETS,
} from '../../utils/topCalculator.js';
import { STANDARD_MOU_CLAUSES } from '../../data/seedData.js';
import { renderVoiceNoteAndDocs, bindVoiceNoteAndDocsEvents } from './VoiceNoteAndDocsManager.js';

// Local UI state
let activeDetailTab = 'overview'; // 'overview' | 'activity' | 'files' | 'requirement' | 'rab' | 'quotation' | 'contacts' | 'notes' | 'history'

// Requirement Generator state
let promptText = 'Client ingin aplikasi HRD untuk 500 karyawan di pabrik Bekasi, ada absensi GPS geofencing & anti-fake GPS selfie, cuti/izin/lembur berjenjang, payroll engine batch 500 staf, mobile app ESS Android/iOS, integrasi biometric fingerprint dan bank transfer.';
let platformParam = 'Web & Mobile';
let complexityParam = 'Enterprise';
let contingencyPct = 10;
let includeUat = true;
let includeTraining = true;
let isGeneratingRab = false;
let rabProgress = 0;
let uploadedFiles = [
  { name: 'Kerangka_Acuan_Kerja_HRIS_PT_Maju.pdf', size: '2.4 MB' },
];

// RAB Spreadsheet View Mode
let internalView = true;

// Setting TOP state
let selectedPresetKey = '30/40/30';
let topCalcBasis = 'grand_total';
let terminItemsState = null;
let introLetterText = '';
let docPreviewTab = 'pendahuluan'; // 'pendahuluan' | 'rab' | 'mou' | 'ttd'

// Modal states
let isMeetModalOpen = false;
let meetTitle = '';
let meetDate = '2026-10-20T14:00';
let meetDuration = 60;
let meetAttendees = '';
let activityType = 'google_meet';

let isAddModuleModalOpen = false;
let newModuleName = '';
let newModuleCategory = 'Transaksi';
let newModuleQty = 4;
let newModulePrice = 1500000;
let newModuleRole = 'Fullstack Dev';

let rejectModalOpen = false;
let rejectReasonCategory = 'Budget Klien Over / Tidak Masuk';
let customRejectReason = '';

let notesList = [
  'Klien sangat concern dengan integrasi mesin fingerprint lama merk ZKTeco.',
  'Pak Budi meminta garansi SLA bugs minimal 90 hari setelah BAST.',
  'PIC Finance menginginkan termin pembayaran dibagi menjadi DP 30%, Progress 40%, dan Pelunasan BAST 30%.',
];

const LEAD_STAGE_FILES = [
  { id: 'lsf-1', stage: 'New Lead', category: 'Brief KAK / Kerangka Acuan Kerja', name: 'Kerangka_Acuan_Kerja_HRIS_PT_Maju.pdf', size: '2.4 MB', date: '12 Okt 2026', uploader: 'Budi Santoso (Klien)', verified: true, type: 'pdf' },
  { id: 'lsf-2', stage: 'Follow Up', category: 'Notulen & Voice Note Audio', name: 'Voice_Note_Notulen_Meeting_Teknis.mp3', size: '4.2 MB', date: '14 Okt 2026', uploader: 'Asisyah Sarah Azzahra (PM)', verified: true, type: 'audio' },
  { id: 'lsf-3', stage: 'Requirement', category: 'FSD & AI Mandays RAB Specification', name: 'FSD_HRIS_500_Employee_System_Spec_v1.pdf', size: '3.1 MB', date: '15 Okt 2026', uploader: 'System AI Presales', verified: true, type: 'pdf' },
  { id: 'lsf-4', stage: 'Quotation', category: 'Penawaran Resmi + 22 Klausul MoU', name: 'Quotation_MoU_QT-2026-10-0012_Rev2.pdf', size: '1.8 MB', date: '15 Okt 2026', uploader: 'Asisyah Sarah Azzahra (PM)', verified: true, type: 'pdf' },
  { id: 'lsf-5', stage: 'Deal', category: 'Draft Kontrak SPK E-Sign & BAST', name: 'SPK_ASTACODE_PT_Maju_Sejahtera_Signed.pdf', size: '2.7 MB', date: '16 Okt 2026', uploader: 'Legal Counsel ASTACODE', verified: true, type: 'pdf' },
];

const GATE_RULES_DESC = {
  new_lead: 'Verifikasi kelengkapan KAK/Brief dan PIC',
  follow_up: 'Jadwalkan Discovery Google Meet & Notulen Audio',
  requirement: 'Generate & Review Estimasi Mandays RAB Presales',
  quotation: 'Pastikan Setting TOP Balance 100% & 22 Klausul MoU',
  negotiation: 'Finalisasi diskon dan approval termin pembayaran',
  deal: 'Penandatanganan SPK Digital & Auto-generate Proyek ERP',
  reject: 'Catatan evaluasi penolakan tersimpan di CRM',
};

const ICONS = {
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>`,
  messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  fileCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  paperclip: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
  sliders: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  printer: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
};

export function renderLeadDetailPage() {
  const state = store.getState();
  const { leads, selectedLeadId, activities } = state;
  const lead = leads.find((l) => l.id === selectedLeadId);

  if (!lead) {
    return `
      <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:32px;color:var(--text-muted);">
        <p>Lead tidak ditemukan atau belum dipilih.</p>
        <button id="btn-back-not-found" class="btn btn-primary btn-sm">
          Kembali ke Pipeline
        </button>
      </div>
    `;
  }

  const rab = lead.rab;
  const grandTotalBase = rab ? rab.grand_total : lead.est_value;

  // Initialize termin items if not set
  if (!terminItemsState) {
    const activeQuo = lead.quotations && lead.quotations[0];
    terminItemsState = activeQuo ? activeQuo.top_scheme.items : createTopFromPreset('30/40/30', grandTotalBase).items;
  }

  // Calculate live TOP scheme
  const currentTopScheme = calculateTopScheme(
    terminItemsState,
    grandTotalBase,
    topCalcBasis,
    selectedPresetKey,
    true
  );

  const stageConfig = PIPELINE_STAGES.find((s) => s.id === lead.stage_id) || PIPELINE_STAGES[0];
  const leadActivities = activities.filter((a) => a.lead_id === lead.id);

  // Calculate rail active percentage
  const currentStageIdx = PIPELINE_STAGES.findIndex((s) => s.id === lead.stage_id);
  const activeRailPercent = lead.stage_id === 'reject' ? 0 : Math.min(100, Math.max(5, (currentStageIdx / (PIPELINE_STAGES.length - 2)) * 100));

  // Stepper Nodes
  const railNodesHtml = PIPELINE_STAGES.map((st, idx) => {
    const isPast = idx < currentStageIdx && lead.stage_id !== 'reject';
    const isCurrent = st.id === lead.stage_id;
    const isReject = st.id === 'reject';

    let circleClass = '';
    let circleInlineStyle = '';

    if (isCurrent) {
      if (isReject) {
        circleInlineStyle = 'background:#dc2626;color:#ffffff;box-shadow:0 0 0 4px rgba(220,38,38,0.25);border:none;';
      } else {
        circleInlineStyle = 'background:#4f46e5;color:#ffffff;box-shadow:0 0 0 4px rgba(99,102,241,0.25);border:none;';
      }
    } else if (isPast) {
      circleInlineStyle = 'background:#10b981;color:#ffffff;box-shadow:0 0 0 2px rgba(16,185,129,0.3);border:none;';
    } else if (isReject) {
      circleInlineStyle = 'background:var(--bg-secondary);color:#ef4444;border:1px solid rgba(239,68,68,0.3);';
    } else {
      // Target stage with dashed border requested
      circleInlineStyle = 'background:var(--bg-card);color:var(--text-muted);border:2px dashed #cbd5e1;';
    }

    return `
      <button
        class="btn-stage-node"
        data-stage-id="${st.id}"
        style="display:flex;flex-direction:column;align-items:center;border:none;background:transparent;cursor:pointer;gap:6px;transition:all var(--transition);position:relative;z-index:2;min-width:60px;"
        title="Validasi & pindah ke: ${st.name} (${st.probability}%)"
      >
        <div style="width:42px;height:42px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;font-weight:800;transition:all var(--transition);${circleInlineStyle}">
          <span>${st.probability}%</span>
          ${isPast ? `<span style="font-size:9px;line-height:1;">✓</span>` : ''}
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px;font-weight:${isCurrent ? '800' : '600'};color:${isCurrent ? 'var(--indigo-600)' : 'var(--text-primary)'};white-space:nowrap;">
            ${st.name}
          </div>
          <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">
            ${isCurrent ? '<span style="color:var(--indigo-600);font-weight:700;">Aktif</span>' : isPast ? 'Selesai' : 'Target'}
          </span>
        </div>
      </button>
    `;
  }).join('');

  // 8 Specific Detail Tabs
  const DETAIL_TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Timeline & Meet', badge: leadActivities.length },
    { id: 'files', label: 'Tahap File & Dokumen', badge: LEAD_STAGE_FILES.length },
    { id: 'requirement', label: '✨ Requirement (AI)' },
    { id: 'rab', label: 'RAB / Mandays', badge: rab?.items ? rab.items.length : 0 },
    { id: 'quotation', label: 'Quotation & Setting TOP', badge: 'MoU' },
    { id: 'contacts', label: 'Kontak & Stakeholder' },
    { id: 'notes', label: 'Voice Notes & Dokumen AI', badge: notesList.length },
    { id: 'history', label: 'Audit Timeline' },
  ];

  // Tab Content selection
  let tabBodyHtml = '';

  if (activeDetailTab === 'overview') {
    tabBodyHtml = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(360px, 1fr));gap:24px;">
        <!-- Left 2 Cols: Summary & Next Action -->
        <div style="display:flex;flex-direction:column;gap:20px;grid-column:span 2;">
          <!-- AI Presales Assistant: Next Best Action Card -->
          <div style="padding:18px 20px;border-radius:var(--radius-2xl);background:linear-gradient(135deg, rgba(99,102,241,.08), rgba(139,92,246,.08));border:1px solid rgba(99,102,241,.25);box-shadow:var(--shadow-xs);">
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div style="width:38px;height:38px;border-radius:var(--radius-xl);background:var(--indigo-600);color:#ffffff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 10px rgba(99,102,241,0.3);">
                ${ICONS.sparkles}
              </div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                  <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--indigo-600);letter-spacing:.05em;margin:0;">
                    AI PRESALES ASSISTANT: NEXT BEST ACTION
                  </h4>
                  <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;background:rgba(99,102,241,0.15);color:var(--indigo-600);">
                    Confidence 94%
                  </span>
                </div>
                <p style="font-size:12px;font-weight:600;color:var(--text-primary);margin-top:6px;line-height:1.5;">
                  ${lead.next_action || 'Jadwalkan Google Meet teknis untuk konfirmasi detail modul dan skema termin pembayaran.'}
                </p>
                <div style="display:flex;align-items:center;gap:10px;margin-top:12px;">
                  <button id="btn-quick-schedule-meet" class="btn btn-primary" style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;">
                    Buka Jadwal Google Meet
                  </button>
                  <button id="btn-quick-goto-quotation" class="btn btn-secondary" style="font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;">
                    Review Dokumen Quotation
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Ringkasan Kebutuhan & Peluang -->
          <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:14px;">
            <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
              Ringkasan Kebutuhan & Peluang
            </h3>
            <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;background:var(--bg-secondary);padding:14px;border-radius:var(--radius-lg);border:1px solid var(--border);margin:0;">
              ${lead.ai_summary || lead.title}
            </p>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:12px;padding-top:4px;">
              <div style="padding:12px 14px;background:var(--bg-secondary);border-radius:var(--radius-lg);border:1px solid var(--border);">
                <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Nilai Estimasi</div>
                <div style="font-size:13px;font-family:var(--font-mono);font-weight:800;color:#16a34a;margin-top:2px;">
                  ${formatRupiah(lead.est_value || 0)}
                </div>
              </div>
              <div style="padding:12px 14px;background:var(--bg-secondary);border-radius:var(--radius-lg);border:1px solid var(--border);">
                <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Total Mandays</div>
                <div style="font-size:13px;font-family:var(--font-mono);font-weight:800;color:var(--indigo-600);margin-top:2px;">
                  ${rab ? `${rab.total_mandays} Mandays` : '152 Mandays'}
                </div>
              </div>
              <div style="padding:12px 14px;background:var(--bg-secondary);border-radius:var(--radius-lg);border:1px solid var(--border);">
                <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Sumber Pertama</div>
                <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-top:2px;">
                  ${lead.source}
                </div>
              </div>
              <div style="padding:12px 14px;background:var(--bg-secondary);border-radius:var(--radius-lg);border:1px solid var(--border);">
                <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Target Closing</div>
                <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-top:2px;">
                  ${lead.target_closing || '-'}
                </div>
              </div>
            </div>
          </div>

          <!-- Mini Timeline of Recent Activities -->
          <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
                Aktivitas & Riwayat Terakhir
              </h3>
              <button id="btn-see-all-activities" style="border:none;background:none;font-size:11px;font-weight:700;color:var(--indigo-600);cursor:pointer;">
                Lihat Semua (${leadActivities.length})
              </button>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;">
              ${leadActivities.map((act) => `
                <div style="padding:12px 14px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;align-items:flex-start;gap:12px;">
                  <div style="width:32px;height:32px;border-radius:var(--radius-md);background:rgba(99,102,241,0.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${act.type === 'google_meet' ? ICONS.video : ICONS.phone}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <h5 style="font-size:12px;font-weight:700;color:var(--text-primary);margin:0;">${act.title}</h5>
                      <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">${new Date(act.scheduled_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <p style="font-size:11px;color:var(--text-secondary);margin:3px 0 0 0;">${act.notes || '-'}</p>
                    ${act.meet_link ? `<a href="${act.meet_link}" target="_blank" rel="noreferrer" style="font-size:11px;color:#10b981;font-weight:700;text-decoration:underline;margin-top:4px;display:inline-block;">Buka Google Meet (${act.meet_link})</a>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right 1 Col: Master Customer 360° Profile -->
        <div style="display:flex;flex-direction:column;gap:20px;">
          <!-- MASTER CUSTOMER 360° Card -->
          <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:14px;box-shadow:var(--shadow-xs);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:10px;">
              <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
                MASTER CUSTOMER 360°
              </h3>
              <span style="padding:2px 8px;border-radius:var(--radius-sm);font-size:10px;font-weight:800;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);">
                ${lead.customer ? (lead.customer.lifecycle_status || 'Prospect') : 'Prospect'}
              </span>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;">
              <div>
                <span style="color:var(--text-muted);font-size:11px;display:block;">Nama Legal:</span>
                <p style="font-weight:800;color:var(--text-primary);margin:2px 0 0 0;">
                  ${lead.customer ? lead.customer.legal_name : 'PT Retail Nusantara Prima'}
                </p>
              </div>

              <div>
                <span style="color:var(--text-muted);font-size:11px;display:block;">Industri & Ukuran:</span>
                <p style="font-weight:600;color:var(--text-secondary);margin:2px 0 0 0;">
                  ${lead.customer ? `${lead.customer.industry} • ${lead.customer.company_size}` : 'Retail • Enterprise'}
                </p>
              </div>

              <div>
                <span style="color:var(--text-muted);font-size:11px;display:block;">Alamat & Kota:</span>
                <p style="color:var(--text-secondary);margin:2px 0 0 0;line-height:1.4;">
                  ${lead.customer ? `${lead.customer.address}, ${lead.customer.city}, ${lead.customer.province}` : '-'}
                </p>
              </div>

              <div>
                <span style="color:var(--text-muted);font-size:11px;display:block;">NPWP:</span>
                <p style="font-family:var(--font-mono);font-weight:700;color:var(--text-secondary);margin:2px 0 0 0;">
                  ${lead.customer?.npwp || '01.234.567.8-429.000'}
                </p>
              </div>

              <div>
                <span style="color:var(--text-muted);font-size:11px;display:block;">First-Touch Source Channel:</span>
                <p style="font-weight:800;color:var(--indigo-600);margin:2px 0 0 0;">
                  ${lead.customer?.first_touch_source || lead.source} (Permanent Attribution)
                </p>
              </div>
            </div>

            <!-- PIC Utama Box -->
            <div style="border-top:1px solid var(--border);padding-top:12px;">
              <span style="font-size:10px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;display:block;margin-bottom:6px;">
                PIC Utama
              </span>
              <div style="padding:12px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:3px;font-size:12px;">
                <strong style="color:var(--text-primary);">${lead.primary_contact ? lead.primary_contact.name : '-'}</strong>
                <span style="color:var(--text-muted);font-size:11px;">${lead.primary_contact ? lead.primary_contact.job_title : '-'}</span>
                <span style="font-family:var(--font-mono);font-weight:700;color:#10b981;margin-top:4px;">
                  ${lead.primary_contact ? lead.primary_contact.whatsapp_number : '-'}
                </span>
              </div>
            </div>
          </div>

          <!-- Tags & Metadata Peluang -->
          <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:12px;">
            <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
              Tags & Metadata Peluang
            </h3>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${(lead.tags || ['ERP', 'HRIS', 'Custom']).map((tag) => `
                <span style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;background:var(--bg-secondary);color:var(--text-secondary);border:1px solid var(--border);">
                  #${tag}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (activeDetailTab === 'files') {
    tabBodyHtml = `
      <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div>
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">Tahap File & Dokumen Proyek</h3>
            <p style="font-size:11px;color:var(--text-muted);margin:4px 0 0 0;">Dokumen teknis dan legalitas wajib pada setiap milestone pipeline (PRD Section 10).</p>
          </div>
          <button class="btn btn-secondary btn-sm" style="font-weight:700;">+ Unggah Dokumen</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          ${LEAD_STAGE_FILES.map((f) => `
            <div style="padding:14px 16px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:14px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(99,102,241,0.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;">
                  ${ICONS.fileText}
                </div>
                <div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <strong style="font-size:12px;color:var(--text-primary);">${f.name}</strong>
                    <span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(16,185,129,0.1);color:#10b981;">Terverifikasi</span>
                  </div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                    ${f.stage} • ${f.category} • ${f.size} • Diunggah oleh ${f.uploader}
                  </div>
                </div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-secondary btn-xs" style="font-weight:700;">Preview</button>
                <button class="btn btn-primary btn-xs" style="font-weight:700;">Unduh</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (activeDetailTab === 'requirement') {
    tabBodyHtml = `
      <div class="animate-fade-in" style="max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:20px;">
        <div class="card" style="padding:24px;border-radius:16px;background:var(--bg-card);border:1px solid var(--border);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:18px;">
          <!-- Header Card -->
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:14px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg, #4f46e5, #7c3aed);color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(99,102,241,0.25);flex-shrink:0;">
                ${ICONS.sparkles}
              </div>
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;letter-spacing:-0.01em;">
                  AI Requirement-to-RAB Generator
                </h3>
                <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">
                  Input prompt dan/atau upload dokumen RFP/Brief — Hasil modul terstruktur & mandays editable.
                </p>
              </div>
            </div>
            <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);">
              PRD Section 9
            </span>
          </div>

          <!-- Prompt Text Box -->
          <div style="display:flex;flex-direction:column;gap:6px;">
            <label for="req-prompt-input" style="font-size:12px;font-weight:700;color:var(--text-primary);">
              Prompt / Deskripsi Kebutuhan Solusi* :
            </label>
            <textarea
              id="req-prompt-input"
              rows="4"
              class="form-textarea focus-ring-indigo"
              style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px;line-height:1.6;font-family:inherit;resize:vertical;"
              placeholder="Ketik kebutuhan aplikasi, modul, pengguna, atau alur bisnis secara bebas..."
            >${promptText}</textarea>
          </div>

          <!-- Upload Document Dropzone Box -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label style="font-size:12px;font-weight:700;color:var(--text-primary);">
              Upload Dokumen Kebutuhan / RFP / KAK (Opsional / Bersama Prompt):
            </label>
            <input type="file" id="req-file-input" style="display:none;" accept=".pdf,.docx,.xlsx,.doc" multiple />
            <div
              id="req-dropzone-box"
              class="dropzone-box"
              style="padding:18px;border-radius:12px;border:2px dashed #cbd5e1;background:#f8fafc;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;"
            >
              <span style="color:var(--text-muted);display:flex;align-items:center;">
                ${ICONS.paperclip}
              </span>
              <p style="font-size:12px;color:var(--text-secondary);margin:0;">
                Drag & drop PDF, DOCX, XLSX brief RFP (maksimal 25MB)
              </p>
              <div id="req-uploaded-files-list" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:4px;">
                ${uploadedFiles.map((f, i) => `
                  <span
                    class="badge-file-pill"
                    style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:8px;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);font-size:11px;font-family:var(--font-mono);font-weight:600;"
                  >
                    <span>${f.name}</span>
                    <span style="color:var(--text-muted);font-size:10px;">(${f.size})</span>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Sub-Card: Parameter Estimasi AI -->
          <div style="padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--text-primary);">
              <span style="color:var(--indigo-600);display:flex;align-items:center;">${ICONS.sliders}</span>
              <span>🎚 Parameter Estimasi AI</span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;">
              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Platform Target:</label>
                <select id="req-platform-select" class="form-select focus-ring-indigo" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);font-size:12px;font-weight:600;">
                  <option value="Web & Mobile" ${platformParam === 'Web & Mobile' ? 'selected' : ''}>Web & Mobile ESS</option>
                  <option value="Web" ${platformParam === 'Web' ? 'selected' : ''}>Web Portal Saja</option>
                  <option value="Mobile" ${platformParam === 'Mobile' ? 'selected' : ''}>Mobile Apps Saja</option>
                </select>
              </div>

              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Kompleksitas Solusi:</label>
                <select id="req-complexity-select" class="form-select focus-ring-indigo" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);font-size:12px;font-weight:600;">
                  <option value="Enterprise" ${complexityParam === 'Enterprise' ? 'selected' : ''}>Enterprise (500+ Staff)</option>
                  <option value="Standard" ${complexityParam === 'Standard' ? 'selected' : ''}>Standard</option>
                  <option value="Basic" ${complexityParam === 'Basic' ? 'selected' : ''}>Basic MVP</option>
                </select>
              </div>

              <div>
                <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Contingency Biaya (%):</label>
                <input
                  type="number"
                  id="req-contingency-input"
                  class="form-input focus-ring-indigo"
                  value="${contingencyPct}"
                  min="0"
                  max="50"
                  style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);font-size:12px;font-family:var(--font-mono);font-weight:700;"
                />
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:24px;padding-top:4px;">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-primary);cursor:pointer;font-weight:500;">
                <input type="checkbox" id="req-chk-uat" ${includeUat ? 'checked' : ''} style="accent-color:var(--indigo-600);cursor:pointer;" />
                <span>Termasuk Fase QA & UAT</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-primary);cursor:pointer;font-weight:500;">
                <input type="checkbox" id="req-chk-training" ${includeTraining ? 'checked' : ''} style="accent-color:var(--indigo-600);cursor:pointer;" />
                <span>Termasuk Training & Manual Book</span>
              </label>
            </div>
          </div>

          <!-- Progress Bar when Generating -->
          ${isGeneratingRab ? `
            <div class="animate-fade-in" style="padding:16px;border-radius:12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;font-weight:700;color:var(--indigo-600);">
                <span style="display:flex;align-items:center;gap:8px;">
                  <span class="animate-spin" style="color:var(--amber-500);display:inline-flex;">${ICONS.sparkles}</span>
                  <span>Memproses Requirement AI: Ekstraksi Scope, Breakdown Modul & Mandays...</span>
                </span>
                <span style="font-family:var(--font-mono);">${rabProgress}%</span>
              </div>
              <div style="width:100%;height:8px;border-radius:9999px;background:rgba(99,102,241,0.2);overflow:hidden;">
                <div
                  style="height:100%;width:${rabProgress}%;background:linear-gradient(90deg, #4f46e5, #7c3aed);transition:width 0.3s ease;border-radius:9999px;"
                ></div>
              </div>
            </div>
          ` : ''}

          <!-- Footer Card & Action -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:8px;">
            <span style="font-size:12px;color:var(--text-muted);">
              Rate Card Software House: Rp 1.500.000 - Rp 1.900.000 / Mandays
            </span>

            <button
              id="btn-trigger-ai-rab"
              type="button"
              ${isGeneratingRab ? 'disabled' : ''}
              class="btn btn-hover-lift"
              style="padding:10px 20px;border-radius:12px;background:linear-gradient(135deg, #4f46e5, #6366f1, #7c3aed);color:#ffffff;font-size:12px;font-weight:800;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(79,70,229,0.35);transition:all var(--transition);${isGeneratingRab ? 'opacity:0.6;cursor:not-allowed;' : ''}"
            >
              <span class="${isGeneratingRab ? 'animate-spin' : ''}" style="color:${isGeneratingRab ? 'var(--amber-400)' : '#fde047'};display:inline-flex;">
                ${ICONS.sparkles}
              </span>
              <span>${isGeneratingRab ? 'Sedang Menganalisis...' : '✨ Generate RAB/Mandays Otomatis'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (activeDetailTab === 'rab') {
    const items = rab ? rab.items : [];
    const itemsRowsHtml = items.map((item, idx) => `
      <tr class="animate-slide-up" style="border-bottom:1px solid var(--border-light);">
        <td style="padding:10px 14px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);width:36px;text-align:center;">${idx + 1}</td>
        <td style="padding:10px 14px;width:130px;">
          <select
            class="rab-item-category-select form-select"
            data-item-id="${item.id}"
            style="width:100%;padding:4px 6px;font-size:11px;font-weight:600;border-radius:6px;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);outline:none;"
          >
            <option value="Master Data" ${item.category === 'Master Data' ? 'selected' : ''}>Master Data</option>
            <option value="Core Module" ${item.category === 'Core Module' || item.category === 'Transaksi' ? 'selected' : ''}>Core Module</option>
            <option value="Transaksi" ${item.category === 'Transaksi' ? 'selected' : ''}>Transaksi</option>
            <option value="Laporan" ${item.category === 'Laporan' ? 'selected' : ''}>Laporan</option>
            <option value="Dashboard & KPI" ${item.category === 'Dashboard & KPI' ? 'selected' : ''}>Dashboard & KPI</option>
            <option value="Mobile" ${item.category === 'Mobile' ? 'selected' : ''}>Mobile</option>
            <option value="Integrasi" ${item.category === 'Integrasi' ? 'selected' : ''}>Integrasi</option>
            <option value="UI/UX & QA" ${item.category === 'UI/UX & QA' || item.category === 'PM & QA' ? 'selected' : ''}>UI/UX & QA</option>
            <option value="PM & QA" ${item.category === 'PM & QA' ? 'selected' : ''}>PM & QA</option>
            <option value="Non-Functional" ${item.category === 'Non-Functional' ? 'selected' : ''}>Non-Functional</option>
            <option value="Infrastruktur" ${item.category === 'Infrastruktur' ? 'selected' : ''}>Infrastruktur</option>
            <option value="Training" ${item.category === 'Training' ? 'selected' : ''}>Training</option>
          </select>
        </td>
        <td style="padding:10px 14px;">
          <input
            type="text"
            class="rab-item-name-input"
            data-item-id="${item.id}"
            value="${(item.name || '').replace(/"/g, '&quot;')}"
            style="width:100%;font-weight:700;color:var(--text-primary);font-size:12px;background:transparent;border:none;border-bottom:1px solid transparent;padding:2px 0;outline:none;"
          />
          <input
            type="text"
            class="rab-item-desc-input"
            data-item-id="${item.id}"
            value="${(item.description || '').replace(/"/g, '&quot;')}"
            placeholder="Deskripsi ruang lingkup modul..."
            style="width:100%;font-size:11px;color:var(--text-muted);background:transparent;border:none;border-bottom:1px solid transparent;padding:2px 0;margin-top:2px;outline:none;"
          />
        </td>
        <td style="padding:10px 14px;text-align:center;width:80px;">
          <input
            type="number"
            min="1"
            class="rab-item-qty-input form-input"
            data-item-id="${item.id}"
            value="${item.qty}"
            style="width:65px;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);padding:4px 6px;text-align:center;font-size:12px;border-radius:6px;border:1.5px solid var(--indigo-500);background:var(--bg-card);outline:none;"
          />
        </td>
        <td style="padding:10px 14px;width:95px;">
          <select
            class="rab-item-unit-select form-select"
            data-item-id="${item.id}"
            style="width:100%;padding:4px 6px;font-size:11px;font-weight:600;border-radius:6px;"
          >
            <option value="Mandays" ${item.unit === 'Mandays' ? 'selected' : ''}>Mandays</option>
            <option value="Paket" ${item.unit === 'Paket' ? 'selected' : ''}>Paket</option>
            <option value="Modul" ${item.unit === 'Modul' ? 'selected' : ''}>Modul</option>
            <option value="Bulan" ${item.unit === 'Bulan' ? 'selected' : ''}>Bulan</option>
            <option value="Lot" ${item.unit === 'Lot' ? 'selected' : ''}>Lot</option>
            <option value="Jam" ${item.unit === 'Jam' ? 'selected' : ''}>Jam</option>
          </select>
        </td>
        ${internalView ? `
          <td style="padding:10px 14px;width:130px;">
            <input
              type="number"
              step="50000"
              class="rab-item-price-input form-input"
              data-item-id="${item.id}"
              value="${item.unit_price}"
              style="width:100%;font-family:var(--font-mono);font-weight:600;text-align:right;padding:4px 8px;font-size:11px;border-radius:6px;border:1px solid var(--border);background:var(--bg-card);outline:none;"
            />
          </td>
          <td style="padding:10px 14px;text-align:right;font-family:var(--font-mono);font-weight:800;color:var(--text-primary);font-size:12px;width:140px;">
            ${formatRupiah(item.subtotal)}
          </td>
          <td style="padding:10px 14px;text-align:center;width:95px;">
            <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;${item.complexity === 'High' ? 'background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);' : item.complexity === 'Medium' ? 'background:rgba(245,158,11,0.12);color:#d97706;border:1px solid rgba(245,158,11,0.25);' : 'background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);'}">
              ${item.complexity || 'Medium'}
            </span>
          </td>
        ` : `
          <td style="padding:10px 14px;text-align:center;width:140px;">
            <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:10px;font-weight:700;background:rgba(16,185,129,0.1);color:#059669;border:1px solid rgba(16,185,129,0.25);">
              ${ICONS.checkCircle}
              <span>Termasuk Paket</span>
            </span>
          </td>
        `}
        <td style="padding:10px 14px;text-align:center;width:40px;">
          <button class="btn-delete-rab-item btn btn-ghost btn-xs" data-item-id="${item.id}" style="color:#ef4444;padding:4px;cursor:pointer;" title="Hapus modul">
            ${ICONS.trash}
          </button>
        </td>
      </tr>
    `).join('');

    tabBodyHtml = `
      <div class="animate-fade-in" style="display:flex;flex-direction:column;gap:16px;">
        <!-- Top Toolbar -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-card);padding:14px 18px;border-radius:var(--radius-xl);border:1px solid var(--border);box-shadow:var(--shadow-xs);">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:var(--radius-lg);background:rgba(99,102,241,.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;">
              RAB
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Tabel Rencana Anggaran Biaya (RAB) & Mandays
                </h3>
                <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;${rab?.status === 'reviewed' ? 'background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);' : 'background:rgba(245,158,11,0.12);color:#d97706;border:1px solid rgba(245,158,11,0.25);'}">
                  ${rab?.status === 'reviewed' ? '✔ Reviewed by Presales' : 'Draft RAB'}
                </span>
                <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);">
                  Rev. ${rab?.version || 1}
                </span>
              </div>
              <p style="font-size:11px;color:var(--text-muted);margin:2px 0 0 0;">
                ${rab ? `${rab.total_mandays} Total Mandays • ${rab.items.length} Modul Terstruktur` : 'Belum digenerate'}
              </p>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <!-- Internal View vs Client View toggle -->
            <button
              id="btn-toggle-internal-view"
              type="button"
              class="btn btn-sm"
              style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;transition:all var(--transition);${internalView ? 'background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.3);' : 'background:rgba(16,185,129,0.1);color:#059669;border:1px solid rgba(16,185,129,0.3);'}"
            >
              ${internalView ? `${ICONS.eye}<span>👁 Tampilan Internal (Lengkap + Harga Satuan)</span>` : `${ICONS.lock}<span>🔒 Tampilan Client (Harga Satuan Disembunyikan)</span>`}
            </button>

            <button id="btn-open-add-module" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:4px;font-weight:700;border:1px solid var(--border);">
              ${ICONS.plus}
              <span>+ Tambah Item</span>
            </button>

            <button
              id="btn-toggle-rab-reviewed"
              type="button"
              class="btn btn-sm"
              style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:6px 14px;border-radius:10px;cursor:pointer;transition:all var(--transition);${rab?.status === 'reviewed' ? 'background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.3);' : 'background:#10b981;color:#ffffff;border:none;box-shadow:0 2px 8px rgba(16,185,129,0.3);'}"
            >
              ${ICONS.checkCircle}
              <span>${rab?.status === 'reviewed' ? '✔ Sudah Di-Review Presales' : '✓ Tandai Reviewed'}</span>
            </button>
          </div>
        </div>

        <!-- Client Mode Banner -->
        ${!internalView ? `
          <div style="padding:12px 16px;border-radius:12px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#047857;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:#10b981;display:flex;align-items:center;">${ICONS.shieldCheck}</span>
              <span>
                <strong>Mode Tampilan Client Aktif:</strong> Harga satuan & subtotal per item disembunyikan dari tabel. Ringkasan subtotal & total investasi penawaran disajikan utuh di bagian bawah.
              </span>
            </div>
            <span style="font-family:var(--font-mono);font-size:10px;font-weight:800;padding:2px 8px;border-radius:9999px;background:var(--bg-card);border:1px solid rgba(16,185,129,0.3);color:#059669;">
              Client-Safe Mode
            </span>
          </div>
        ` : ''}

        <!-- Editable Spreadsheet Table -->
        <div class="card" style="border-radius:16px;border:1px solid var(--border);overflow:hidden;box-shadow:var(--shadow-xs);">
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:var(--bg-secondary);border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.05em;">
                  <th style="padding:10px 14px;width:36px;text-align:center;">No</th>
                  <th style="padding:10px 14px;text-align:left;width:130px;">Kategori</th>
                  <th style="padding:10px 14px;text-align:left;">Item / Modul & Ruang Lingkup</th>
                  <th style="padding:10px 14px;text-align:center;width:80px;">Qty</th>
                  <th style="padding:10px 14px;text-align:left;width:95px;">Satuan</th>
                  ${internalView ? `
                    <th style="padding:10px 14px;text-align:right;width:130px;">Harga Satuan (Rp)</th>
                    <th style="padding:10px 14px;text-align:right;width:140px;">Subtotal (Rp)</th>
                    <th style="padding:10px 14px;text-align:center;width:95px;">Kompleksitas</th>
                  ` : `
                    <th style="padding:10px 14px;text-align:center;width:140px;">Status Deliverable</th>
                  `}
                  <th style="padding:10px 14px;text-align:center;width:40px;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml || `<tr><td colspan="${internalView ? 9 : 7}" style="text-align:center;padding:28px;color:var(--text-muted);">Belum ada modul RAB. Generate otomatis lewat tab Requirement AI.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Total and Calculations Box (Shown at the bottom) -->
        ${rab ? `
          <div class="card" style="padding:20px;border-radius:16px;border:1px solid var(--border);background:var(--bg-card);box-shadow:var(--shadow-xs);">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:24px;">
              <!-- Left Column: Scope Info or Internal Financial Analysis -->
              <div style="display:flex;flex-direction:column;gap:12px;">
                <h4 style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin:0;">
                  ${internalView ? 'Informasi Analisis Finansial Internal' : 'Ringkasan Spesifikasi Penawaran Klien'}
                </h4>

                ${internalView ? `
                  <div style="padding:14px;border-radius:12px;background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:8px;font-size:12px;">
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-muted);">Total Estimasi Mandays:</span>
                      <span style="font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);">${rab.total_mandays} Mandays</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-muted);">Estimasi Cost Internal Dev:</span>
                      <span style="font-family:var(--font-mono);color:var(--text-primary);">${formatRupiah(rab.internal_cost || Math.round(rab.subtotal * 0.6))}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-muted);">Gross Margin Proyek:</span>
                      <span style="font-family:var(--font-mono);font-weight:800;color:#10b981;">${rab.margin_pct || 40}%</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);padding-top:4px;border-top:1px solid var(--border);">
                      *Seluruh harga satuan mengacu pada rate card software house ASTACODE standar tahun 2026.
                    </div>
                  </div>
                ` : `
                  <div style="padding:14px;border-radius:12px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);display:flex;flex-direction:column;gap:8px;font-size:12px;">
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-secondary);">Total Modul Ruang Lingkup:</span>
                      <span style="font-weight:700;color:var(--indigo-600);">${rab.items.length} Modul Terintegrasi</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-secondary);">Layanan Penyertaan:</span>
                      <span style="font-weight:600;color:var(--text-primary);">QA Testing, UAT & Pelatihan Admin</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:var(--text-secondary);">Garansi Bug & Pemeliharaan:</span>
                      <span style="font-weight:700;color:#10b981;">90 Hari SLA Pasca-BAST</span>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted);padding-top:4px;border-top:1px solid rgba(99,102,241,0.15);">
                      Format resmi penawaran harga terpadu (All-in Solution) oleh PT ASTACODE SOLUSINDO TEKNOLOGI.
                    </div>
                  </div>
                `}
              </div>

              <!-- Right Column: Cost Summary & Bottom Subtotal -->
              <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
                <div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border);">
                  <span style="color:var(--text-muted);font-weight:600;">Subtotal Modul & Solusi:</span>
                  <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-primary);">${formatRupiah(rab.subtotal)}</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border);">
                  <span style="color:var(--text-muted);">Contingency Buffer (${rab.contingency_pct}%):</span>
                  <span style="font-family:var(--font-mono);">${formatRupiah(rab.contingency_amount)}</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border);">
                  <span style="color:var(--text-muted);">Diskon Khusus:</span>
                  <span style="font-family:var(--font-mono);color:#ef4444;">${rab.discount_amount > 0 ? `-${formatRupiah(rab.discount_amount)}` : 'Rp 0'}</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border);">
                  <span style="color:var(--text-muted);font-weight:600;">Total Sebelum Pajak:</span>
                  <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-primary);">${formatRupiah(rab.total_before_tax)}</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border);">
                  <span style="color:var(--text-muted);">PPN 11%:</span>
                  <span style="font-family:var(--font-mono);">${formatRupiah(rab.tax_amount)}</span>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);margin-top:4px;">
                  <span style="font-size:13px;font-weight:800;color:var(--indigo-600);">GRAND TOTAL PENAWARAN:</span>
                  <span style="font-size:15px;font-family:var(--font-mono);font-weight:800;color:var(--indigo-600);">${formatRupiah(rab.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else if (activeDetailTab === 'quotation') {
    const activeQuo = lead.quotations ? lead.quotations[0] : null;
    const targetContractValue = topCalcBasis === 'grand_total'
      ? (rab ? rab.grand_total : grandTotalBase)
      : (rab ? rab.total_before_tax : grandTotalBase);

    const currentTop = calculateTopScheme(
      terminItemsState || [],
      targetContractValue,
      topCalcBasis,
      selectedPresetKey,
      true
    );

    const terminTableRowsHtml = (terminItemsState || []).map((term, idx) => `
      <tr class="animate-slide-up" style="border-bottom:1px solid var(--border-light);">
        <td style="padding:10px 12px;font-family:var(--font-mono);font-weight:700;color:var(--text-muted);text-align:center;">
          ${idx + 1}
        </td>

        <td style="padding:10px 12px;">
          <input
            type="text"
            class="top-term-name-input"
            data-idx="${idx}"
            value="${(term.name || '').replace(/"/g, '&quot;')}"
            style="width:100%;font-weight:700;color:var(--text-primary);font-size:12px;background:transparent;border:none;border-bottom:1px solid transparent;padding:2px 0;outline:none;"
          />
          <input
            type="text"
            class="top-term-desc-input"
            data-idx="${idx}"
            placeholder="Keterangan deliverable..."
            value="${(term.description || '').replace(/"/g, '&quot;')}"
            style="width:100%;font-size:11px;color:var(--text-muted);background:transparent;border:none;border-bottom:1px solid transparent;padding:2px 0;margin-top:2px;outline:none;"
          />
        </td>

        <td style="padding:10px 12px;width:120px;">
          <select
            class="top-term-type-select form-select"
            data-idx="${idx}"
            style="width:100%;padding:4px 6px;font-size:11px;font-weight:600;border-radius:6px;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary);outline:none;"
          >
            <option value="percent" ${term.value_type === 'percent' ? 'selected' : ''}>Persen (%)</option>
            <option value="amount" ${term.value_type === 'amount' ? 'selected' : ''}>Nominal (Rp)</option>
            <option value="balance" ${term.value_type === 'balance' ? 'selected' : ''}>Sisa Otomatis</option>
          </select>
        </td>

        <td style="padding:10px 12px;text-align:center;width:110px;">
          ${term.value_type === 'balance' ? `
            <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);font-style:italic;">
              Auto Sisa (${currentTop.items[idx]?.value || 0}%)
            </span>
          ` : `
            <input
              type="number"
              min="0"
              class="top-term-val-input form-input"
              data-idx="${idx}"
              value="${term.value}"
              style="width:80px;font-family:var(--font-mono);font-weight:700;color:var(--indigo-600);padding:4px 6px;text-align:center;font-size:12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);outline:none;"
            />
          `}
        </td>

        <td style="padding:10px 12px;text-align:right;font-family:var(--font-mono);font-weight:800;color:#10b981;font-size:12px;width:140px;">
          ${formatRupiah(currentTop.items[idx]?.calculated_amount || 0)}
        </td>

        <td style="padding:10px 12px;">
          <input
            type="text"
            class="top-term-trigger-input"
            data-idx="${idx}"
            placeholder="Mis. Saat tanda tangan, UAT selesai, BAST..."
            value="${(term.trigger_label || '').replace(/"/g, '&quot;')}"
            style="width:100%;font-size:11px;color:var(--text-secondary);background:transparent;border:none;border-bottom:1px solid transparent;padding:2px 0;outline:none;"
          />
        </td>

        <td style="padding:10px 12px;width:100px;">
          <input
            type="text"
            class="top-term-due-input"
            data-idx="${idx}"
            placeholder="Net 14"
            value="${(term.due_days_label || '').replace(/"/g, '&quot;')}"
            style="width:100%;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);background:transparent;border:none;border-bottom:1px solid transparent;padding:2px 0;outline:none;"
          />
        </td>

        <td style="padding:10px 12px;text-align:center;width:50px;">
          <button
            type="button"
            class="btn-delete-top-term btn btn-ghost btn-xs"
            data-idx="${idx}"
            style="color:#ef4444;padding:4px;cursor:pointer;"
            title="Hapus termin"
          >
            ${ICONS.trash}
          </button>
        </td>
      </tr>
    `).join('');

    tabBodyHtml = `
      <div class="animate-fade-in" style="display:flex;flex-direction:column;gap:20px;">
        
        <!-- 1. Card Setting TOP (Terms of Payment / Termin Pembayaran) -->
        <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:2px solid rgba(99,102,241,0.35);background:var(--bg-card);box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:18px;">
          
          <!-- Header Setting TOP & Dropdown Preset -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:38px;height:38px;border-radius:var(--radius-xl);background:linear-gradient(135deg, #4f46e5, #7c3aed);color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(79,70,229,0.3);font-size:18px;font-weight:900;flex-shrink:0;">
                $
              </div>
              <div>
                <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">
                  Setting TOP (Terms of Payment / Termin Pembayaran) Quotation
                </h3>
                <p style="font-size:11px;color:var(--text-muted);margin:3px 0 0 0;">
                  Diatur langsung pada penawaran: persen/nominal dinamis, validasi balance 100%, otomatis masuk ke dokumen & invoice (PRD Section 8.11.1 & 10.6).
                </p>
              </div>
            </div>

            <!-- Skema Preset Dropdown -->
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;font-weight:700;color:var(--text-secondary);white-space:nowrap;">Pilih Skema Preset:</span>
              <select
                id="top-preset-select"
                class="form-select"
                style="padding:6px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg-secondary);font-size:12px;font-weight:700;color:var(--text-primary);outline:none;"
              >
                <option value="30/40/30" ${selectedPresetKey === '30/40/30' ? 'selected' : ''}>30% DP / 40% UAT / 30% BAST (Standar)</option>
                <option value="50/50" ${selectedPresetKey === '50/50' ? 'selected' : ''}>50% DP / 50% BAST</option>
                <option value="40/30/30" ${selectedPresetKey === '40/30/30' ? 'selected' : ''}>40% DP / 30% Sit/UAT / 30% Go-Live</option>
                <option value="30/30/30/10" ${selectedPresetKey === '30/30/30/10' ? 'selected' : ''}>30% DP / 30% Dev / 30% UAT / 10% Retensi</option>
                <option value="100% Upfront" ${selectedPresetKey === '100% Upfront' ? 'selected' : ''}>100% Pelunasan Di Muka</option>
                <option value="Custom" ${selectedPresetKey === 'Custom' ? 'selected' : ''}>Custom (Skema Kustom...)</option>
              </select>
            </div>
          </div>

          <!-- Summary Bar & Balance Validation -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;border-radius:12px;background:var(--bg-secondary);border:1px solid var(--border);font-size:12px;">
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
              <div>
                <span style="font-size:11px;color:var(--text-muted);display:block;">Nilai Kontrak Acuan:</span>
                <strong style="font-family:var(--font-mono);font-size:14px;font-weight:800;color:var(--text-primary);">
                  ${formatRupiah(targetContractValue)}
                </strong>
              </div>

              <div style="border-left:1px solid var(--border);padding-left:16px;">
                <span style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:2px;">Basis Perhitungan:</span>
                <div style="display:flex;align-items:center;gap:14px;">
                  <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:var(--text-primary);">
                    <input type="radio" name="top_calc_basis" value="grand_total" ${topCalcBasis === 'grand_total' ? 'checked' : ''} style="accent-color:var(--indigo-600);cursor:pointer;" />
                    <span>Grand Total (Termasuk PPN)</span>
                  </label>
                  <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;color:var(--text-primary);">
                    <input type="radio" name="top_calc_basis" value="before_tax" ${topCalcBasis === 'before_tax' ? 'checked' : ''} style="accent-color:var(--indigo-600);cursor:pointer;" />
                    <span>Sebelum Pajak</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Balance Status Badge -->
            <div>
              ${currentTop.is_balanced ? `
                <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.3);font-weight:800;font-size:12px;font-family:var(--font-mono);">
                  ${ICONS.checkCircle}
                  <span>✓ BALANCE 100% (${formatRupiah(currentTop.total_amount)})</span>
                </div>
              ` : `
                <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.3);font-weight:800;font-size:12px;font-family:var(--font-mono);">
                  ${ICONS.alertTriangle}
                  <span>⚠ BELUM BALANCE! Sisa: ${formatRupiah(currentTop.remaining_amount)} (${currentTop.remaining_percent}%)</span>
                </div>
              `}
            </div>
          </div>

          <!-- 8-Column Terms Table -->
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:var(--bg-secondary);border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.05em;">
                  <th style="padding:10px 12px;width:50px;text-align:center;">Term</th>
                  <th style="padding:10px 12px;text-align:left;">Nama Termin & Deskripsi</th>
                  <th style="padding:10px 12px;text-align:left;width:120px;">Tipe Nilai</th>
                  <th style="padding:10px 12px;text-align:center;width:110px;">Input Nilai</th>
                  <th style="padding:10px 12px;text-align:right;width:140px;">Hasil Nominal (Rp)</th>
                  <th style="padding:10px 12px;text-align:left;">Pemicu Tagihan (Trigger)</th>
                  <th style="padding:10px 12px;text-align:left;width:100px;">Jatuh Tempo</th>
                  <th style="padding:10px 12px;text-align:center;width:50px;">Hapus</th>
                </tr>
              </thead>
              <tbody>
                ${terminTableRowsHtml || `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted);">Belum ada termin pembayaran. Tambahkan termin baru.</td></tr>`}
              </tbody>
            </table>
          </div>

          <!-- Bottom Row: Add Term & Note -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:4px;">
            <button id="btn-add-top-term" type="button" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;">
              ${ICONS.plus}
              <span>+ Tambah Termin Baru</span>
            </button>

            <div style="font-size:11px;color:var(--text-muted);font-style:italic;">
              *Perubahan termin otomatis diwariskan ke Halaman RAB dan Pasal 5 MoU.
            </div>
          </div>
        </div>

        <!-- 2. Quotation Status Updater -->
        <div class="card" style="padding:18px 20px;border-radius:var(--radius-xl);border:1px solid var(--border);background:var(--bg-card);box-shadow:var(--shadow-xs);">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
            <div>
              <h3 style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin:0;">
                Status Dokumen Quotation & MoU
              </h3>
              <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                <span style="font-size:12px;font-family:var(--font-mono);font-weight:700;color:var(--text-primary);">
                  ${activeQuo?.number || 'QT/2026/10/0012'} (${activeQuo?.version_label || 'Rev. 2'})
                </span>
                <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:9999px;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);">
                  Status: ${activeQuo?.status || 'Negosiasi'}
                </span>
              </div>
            </div>

            <!-- Status Switcher Buttons -->
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-size:12px;font-weight:600;color:var(--text-muted);margin-right:4px;">Ubah Status:</span>
              ${['Lead', 'Follow Up', 'Negosiasi', 'Deal', 'Reject'].map((st) => `
                <button
                  type="button"
                  class="btn-quo-status-action btn btn-sm"
                  data-status="${st}"
                  style="font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;${activeQuo?.status === st ? 'background:var(--indigo-600);color:#ffffff;' : st === 'Deal' ? 'background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.3);' : st === 'Reject' ? 'background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.3);' : 'background:var(--bg-secondary);color:var(--text-secondary);border:1px solid var(--border);'}"
                >
                  ${st === 'Deal' ? '🏆 DEAL' : st}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 3. Document Package Preview (1 File Terpadu: 4 Bagian) -->
        <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);background:var(--bg-card);box-shadow:var(--shadow-xs);display:flex;flex-direction:column;gap:16px;">
          
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border);padding-bottom:14px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:var(--indigo-600);display:flex;align-items:center;">${ICONS.fileText}</span>
              <span style="font-size:13px;font-weight:800;color:var(--text-primary);">
                Preview Dokumen Paket Penawaran (1 File Terpadu: 4 Bagian)
              </span>
            </div>

            <!-- Part Switcher Tabs -->
            <div style="display:flex;align-items:center;gap:4px;background:var(--bg-secondary);padding:3px;border-radius:10px;border:1px solid var(--border);">
              <button
                type="button"
                class="btn-doc-preview-tab"
                data-preview-tab="pendahuluan"
                style="padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:11px;font-weight:700;transition:all var(--transition);${docPreviewTab === 'pendahuluan' ? 'background:var(--bg-card);color:var(--indigo-600);box-shadow:var(--shadow-xs);' : 'background:transparent;color:var(--text-muted);'}"
              >
                1. Cover & Pendahuluan
              </button>
              <button
                type="button"
                class="btn-doc-preview-tab"
                data-preview-tab="rab"
                style="padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:11px;font-weight:700;transition:all var(--transition);${docPreviewTab === 'rab' ? 'background:var(--bg-card);color:var(--indigo-600);box-shadow:var(--shadow-xs);' : 'background:transparent;color:var(--text-muted);'}"
              >
                2. RAB & Termin TOP
              </button>
              <button
                type="button"
                class="btn-doc-preview-tab"
                data-preview-tab="mou"
                style="padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:11px;font-weight:700;transition:all var(--transition);${docPreviewTab === 'mou' ? 'background:var(--bg-card);color:var(--indigo-600);box-shadow:var(--shadow-xs);' : 'background:transparent;color:var(--text-muted);'}"
              >
                3. Kumpulan 22 Pasal MoU
              </button>
              <button
                type="button"
                class="btn-doc-preview-tab"
                data-preview-tab="ttd"
                style="padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:11px;font-weight:700;transition:all var(--transition);${docPreviewTab === 'ttd' ? 'background:var(--bg-card);color:var(--indigo-600);box-shadow:var(--shadow-xs);' : 'background:transparent;color:var(--text-muted);'}"
              >
                4. Halaman Tanda Tangan
              </button>
            </div>

            <!-- Action buttons: Print & Generate -->
            <div style="display:flex;align-items:center;gap:8px;">
              <button
                id="btn-print-quotation-doc"
                type="button"
                class="btn btn-secondary btn-sm"
                style="padding:6px 10px;"
                title="Cetak Dokumen"
              >
                ${ICONS.printer}
              </button>
              <button
                id="btn-generate-quotation-doc"
                type="button"
                class="btn btn-primary btn-sm"
                style="display:inline-flex;align-items:center;gap:6px;font-weight:700;"
              >
                ${ICONS.download}
                <span>Generate & Simpan Versi</span>
              </button>
            </div>
          </div>

          <!-- A4 Document Simulation Container -->
          <div style="background:#f1f5f9;padding:24px;border-radius:var(--radius-xl);display:flex;justify-content:center;">
            <div style="width:100%;max-width:760px;background:#ffffff;color:#1e293b;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);border-radius:12px;padding:32px;display:flex;flex-direction:column;gap:20px;font-size:12px;border:1px solid #e2e8f0;">
              
              <!-- Kop Surat ASTACODE -->
              <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #4f46e5;padding-bottom:16px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg, #4f46e5, #7c3aed);color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;letter-spacing:-0.05em;">
                    AST
                  </div>
                  <div>
                    <h2 style="font-size:15px;font-weight:800;color:#0f172a;margin:0;letter-spacing:-0.02em;">
                      PT ASTACODE SOLUSINDO TEKNOLOGI
                    </h2>
                    <p style="font-size:10px;color:#64748b;margin:2px 0 0 0;">
                      Enterprise Software House • Mobile & Web Cloud ERP Architecture
                    </p>
                  </div>
                </div>

                <div style="text-align:right;font-family:var(--font-mono);font-size:11px;">
                  <p style="font-weight:700;color:#0f172a;margin:0;">
                    ${activeQuo?.number || 'QT/2026/10/0012'}
                  </p>
                  <p style="color:#64748b;margin:2px 0 0 0;">
                    Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                  <p style="color:#64748b;margin:2px 0 0 0;">Masa Berlaku: 30 Hari</p>
                </div>
              </div>

              <!-- Part 1: Cover & Pendahuluan -->
              ${docPreviewTab === 'pendahuluan' ? `
                <div style="display:flex;flex-direction:column;gap:16px;line-height:1.6;">
                  <div>
                    <p style="font-weight:700;margin:0;">Kepada Yth:</p>
                    <p style="font-weight:700;color:#0f172a;margin:2px 0 0 0;">
                      ${lead.primary_contact ? lead.primary_contact.name : 'Bpk/Ibu PIC'} (${lead.primary_contact ? lead.primary_contact.job_title : 'Stakeholder'})
                    </p>
                    <p style="color:#334155;margin:2px 0 0 0;">${lead.customer ? lead.customer.legal_name : 'Customer'}</p>
                    <p style="color:#64748b;font-size:11px;margin:2px 0 0 0;">
                      ${lead.customer ? lead.customer.address || '' : ''}${lead.customer && lead.customer.city ? `, ${lead.customer.city}` : ''}
                    </p>
                  </div>

                  <div>
                    <p style="font-weight:800;color:#0f172a;margin:0;">
                      Perihal: Penawaran Rancang Bangun & Implementasi ${lead.title}
                    </p>
                  </div>

                  <div>
                    <textarea
                      id="intro-letter-textarea"
                      rows="4"
                      style="width:100%;padding:10px;border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;font-size:12px;color:#334155;font-family:inherit;line-height:1.6;outline:none;"
                    >${introLetterText || activeQuo?.intro_letter || `Sehubungan dengan pembicaraan mengenai pengembangan sistem informasi, bersama ini kami dari ASTACODE menyampaikan penawaran resmi untuk proyek ${lead.title} pada ${lead.customer ? lead.customer.legal_name : 'Klien'}. Penawaran ini mencakup modul terpadu, metodologi agile, estimasi mandays presisi, serta SLA pemeliharaan profesional.`}</textarea>
                  </div>

                  <div style="padding:14px;border-radius:12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);display:flex;flex-direction:column;gap:4px;">
                    <span style="font-weight:700;color:#3730a3;">Ringkasan Nilai Investasi Penawaran:</span>
                    <span style="font-size:16px;font-family:var(--font-mono);font-weight:800;color:#4338ca;">
                      ${formatRupiah(rab ? rab.grand_total : grandTotalBase)}
                    </span>
                    <span style="font-size:11px;color:#475569;font-style:italic;">
                      Terbilang: ${formatRupiahWords(rab ? rab.grand_total : grandTotalBase)}
                    </span>
                  </div>

                  <div style="padding-top:20px;display:flex;justify-content:space-between;align-items:flex-end;">
                    <div>
                      <p style="margin:0;font-weight:600;">Hormat kami,</p>
                      <p style="font-weight:800;color:#0f172a;margin:40px 0 0 0;">Asisyah Sarah Azzahra</p>
                      <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Super Admin & Lead Presales PM • ASTACODE</p>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Part 2: RAB & Termin TOP -->
              ${docPreviewTab === 'rab' ? `
                <div style="display:flex;flex-direction:column;gap:18px;">
                  <div style="border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
                    <h3 style="font-weight:800;font-size:13px;color:#0f172a;margin:0;">
                      BAGIAN II: RENCANA ANGGARAN BIAYA & RUANG LINGKUP MODUL
                    </h3>
                    <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">
                      Detail spesifikasi teknis dan alokasi mandays per kategori pekerjaan.
                    </p>
                  </div>

                  <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:11px;">
                    <thead>
                      <tr style="background:#f1f5f9;font-weight:700;color:#334155;">
                        <th style="border:1px solid #cbd5e1;padding:6px;width:32px;text-align:center;">No</th>
                        <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Kategori & Modul Fitur</th>
                        <th style="border:1px solid #cbd5e1;padding:6px;width:70px;text-align:center;">Qty</th>
                        <th style="border:1px solid #cbd5e1;padding:6px;width:110px;text-align:right;">Harga Satuan</th>
                        <th style="border:1px solid #cbd5e1;padding:6px;width:120px;text-align:right;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(rab ? rab.items : []).map((it, i) => `
                        <tr>
                          <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-family:var(--font-mono);">${i + 1}</td>
                          <td style="border:1px solid #cbd5e1;padding:6px;">
                            <strong style="color:#0f172a;">${it.name}</strong>
                            <div style="font-size:10px;color:#64748b;">${it.description || ''}</div>
                          </td>
                          <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-family:var(--font-mono);">
                            ${it.qty} ${it.unit}
                          </td>
                          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-family:var(--font-mono);">
                            ${formatRupiah(it.unit_price)}
                          </td>
                          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-family:var(--font-mono);font-weight:700;">
                            ${formatRupiah(it.subtotal)}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                    <tfoot>
                      <tr style="background:#f8fafc;font-weight:800;">
                        <td colspan="4" style="border:1px solid #cbd5e1;padding:8px;text-align:right;">
                          Grand Total (Termasuk PPN 11%):
                        </td>
                        <td style="border:1px solid #cbd5e1;padding:8px;text-align:right;font-family:var(--font-mono);color:#4338ca;">
                          ${formatRupiah(rab ? rab.grand_total : grandTotalBase)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <!-- Termin TOP Table inside document -->
                  <div style="display:flex;flex-direction:column;gap:8px;padding-top:8px;">
                    <h4 style="font-weight:800;font-size:12px;color:#0f172a;text-transform:uppercase;margin:0;">
                      Tabel Skema Termin Pembayaran (Terms of Payment):
                    </h4>
                    <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:11px;">
                      <thead>
                        <tr style="background:rgba(99,102,241,0.08);color:#312e81;font-weight:700;">
                          <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;width:45px;">Termin</th>
                          <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Nama & Tahapan Deliverable</th>
                          <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;width:75px;">Porsi (%)</th>
                          <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;width:130px;">Nominal (IDR)</th>
                          <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Pemicu Invoice & Jatuh Tempo</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${currentTop.items.map((t, idx) => `
                          <tr>
                            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:700;">
                              ${idx + 1}
                            </td>
                            <td style="border:1px solid #cbd5e1;padding:6px;">
                              <strong style="color:#0f172a;">${t.name}</strong>
                              <div style="font-size:10px;color:#64748b;">${t.description || ''}</div>
                            </td>
                            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-family:var(--font-mono);">
                              ${t.value}%
                            </td>
                            <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-family:var(--font-mono);font-weight:700;color:#047857;">
                              ${formatRupiah(t.calculated_amount)}
                            </td>
                            <td style="border:1px solid #cbd5e1;padding:6px;">
                              <div>${t.trigger_label}</div>
                              <span style="font-size:10px;font-family:var(--font-mono);color:#64748b;">
                                Tempo: ${t.due_days_label}
                              </span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              ` : ''}

              <!-- Part 3: Kumpulan 22 Pasal MoU -->
              ${docPreviewTab === 'mou' ? `
                <div style="display:flex;flex-direction:column;gap:14px;">
                  <div style="text-align:center;border-bottom:1px solid #e2e8f0;padding-bottom:10px;">
                    <h3 style="font-weight:900;font-size:14px;color:#0f172a;margin:0;">
                      MEMORANDUM OF UNDERSTANDING (MoU)
                    </h3>
                    <p style="font-family:var(--font-mono);font-size:11px;color:#64748b;margin:4px 0 0 0;">
                      Nomor: ${activeQuo?.mou_number || 'MOU/2026/10/0012'}
                    </p>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:12px;max-height:420px;overflow-y:auto;padding-right:6px;">
                    ${(STANDARD_MOU_CLAUSES || []).map((clause) => `
                      <div style="padding-top:8px;border-top:1px solid #f1f5f9;">
                        <h4 style="font-weight:700;font-size:12px;color:#0f172a;margin:0;">${clause.title}</h4>
                        <div style="font-size:11px;color:#334155;text-align:justify;margin-top:4px;line-height:1.6;">
                          ${clause.number === 5 ? `
                            Nilai total pekerjaan disepakati sebesar <strong style="font-family:var(--font-mono);">${formatRupiah(rab ? rab.grand_total : grandTotalBase)}</strong> (${formatRupiahWords(rab ? rab.grand_total : grandTotalBase)}).
                            Pembayaran wajib diselesaikan melalui Termin Pembayaran:
                            ${currentTop.items.map((t, idx) => `
                              <div style="padding-left:14px;color:#0f172a;font-weight:600;">
                                • Termin ${idx + 1} (${t.name}): ${t.value}% (${formatRupiah(t.calculated_amount)}) - ${t.trigger_label} (${t.due_days_label}).
                              </div>
                            `).join('')}
                          ` : clause.body}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Part 4: Halaman Tanda Tangan -->
              ${docPreviewTab === 'ttd' ? `
                <div style="display:flex;flex-direction:column;gap:20px;padding-top:10px;">
                  <div style="border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
                    <h3 style="font-weight:800;font-size:13px;color:#0f172a;margin:0;">
                      BAGIAN IV: PENGESAHAN & PENANDATANGANAN KONTRAK
                    </h3>
                    <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">
                      Dokumen sah berkekuatan hukum sesuai dengan UU ITE dan UU PDP Republik Indonesia.
                    </p>
                  </div>

                  <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:24px;padding-top:10px;">
                    <!-- Pihak Pertama (Klien) -->
                    <div style="padding:16px;border-radius:12px;border:1px solid #cbd5e1;text-align:center;display:flex;flex-direction:column;gap:10px;">
                      <span style="font-weight:800;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:.05em;">
                        PIHAK PERTAMA (KLIEN)
                      </span>
                      <strong style="color:#0f172a;">${lead.customer ? lead.customer.legal_name : 'Customer'}</strong>
                      <div style="height:90px;display:flex;align-items:center;justify-content:center;border:2px dashed #cbd5e1;border-radius:8px;color:#94a3b8;font-family:var(--font-mono);font-size:10px;">
                        [Area Tanda Tangan & E-Meterai Rp 10.000]
                      </div>
                      <div>
                        <strong style="color:#0f172a;display:block;">${lead.primary_contact ? lead.primary_contact.name : 'PIC'}</strong>
                        <span style="font-size:11px;color:#64748b;">${lead.primary_contact ? lead.primary_contact.job_title : 'Stakeholder'}</span>
                      </div>
                    </div>

                    <!-- Pihak Kedua (ASTACODE) -->
                    <div style="padding:16px;border-radius:12px;border:1px solid #cbd5e1;text-align:center;display:flex;flex-direction:column;gap:10px;">
                      <span style="font-weight:800;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:.05em;">
                        PIHAK KEDUA (ASTACODE)
                      </span>
                      <strong style="color:#0f172a;">PT ASTACODE SOLUSINDO TEKNOLOGI</strong>
                      <div style="height:90px;display:flex;align-items:center;justify-content:center;border:2px dashed #818cf8;background:rgba(99,102,241,0.06);border-radius:8px;color:var(--indigo-600);font-family:var(--font-mono);font-size:10px;font-weight:800;">
                        ✔ Certified E-Signature & QR Code Verifikasi
                      </div>
                      <div>
                        <strong style="color:#0f172a;display:block;">Asisyah Sarah Azzahra</strong>
                        <span style="font-size:11px;color:#64748b;">Super Admin & Lead Presales PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              ` : ''}

            </div>
          </div>

        </div>

      </div>
    `;
  } else if (activeDetailTab === 'activity') {
    const actListHtml = leadActivities.map((act) => `
      <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-card);border:1px solid var(--border);display:flex;align-items:flex-start;gap:12px;font-size:12px;">
        <div style="width:36px;height:36px;border-radius:var(--radius-md);background:rgba(99,102,241,.1);color:var(--indigo-600);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${act.type === 'google_meet' ? ICONS.video : ICONS.messageSquare}
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <strong style="color:var(--text-primary);font-size:13px;">${act.title}</strong>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">${new Date(act.scheduled_at).toLocaleDateString('id-ID')}</span>
          </div>
          <p style="color:var(--text-secondary);margin:4px 0 0 0;">${act.notes || '-'}</p>
          ${act.meet_link ? `<a href="${act.meet_link}" target="_blank" rel="noreferrer" style="font-size:11px;color:var(--indigo-600);font-weight:700;text-decoration:underline;margin-top:4px;display:inline-block;">Buka Google Meet</a>` : ''}
        </div>
      </div>
    `).join('');

    tabBodyHtml = `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">Timeline Aktivitas & Notulen Follow-Up</h3>
          <button id="btn-open-meet-modal" class="btn btn-primary btn-sm" style="font-weight:700;">
            + Jadwalkan Aktivitas / Meet
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${actListHtml || '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px;">Belum ada aktivitas tercatat untuk lead ini.</div>'}
        </div>
      </div>
    `;
  } else if (activeDetailTab === 'contacts') {
    tabBodyHtml = `
      <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:16px;">
        <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">Kontak & Stakeholder Proyek</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px;">
          <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:6px;">
            <strong style="color:var(--text-primary);">${lead.primary_contact?.name || 'PIC'}</strong>
            <span style="font-size:11px;color:var(--text-muted);">${lead.primary_contact?.job_title || 'Stakeholder'}</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:#10b981;">${lead.primary_contact?.whatsapp_number || '-'}</span>
            <span style="font-size:11px;color:var(--indigo-600);">${lead.primary_contact?.email || '-'}</span>
          </div>
          <div style="padding:14px;border-radius:var(--radius-lg);background:var(--bg-secondary);border:1px solid var(--border);display:flex;flex-direction:column;gap:6px;">
            <strong style="color:var(--text-primary);">Asisyah Sarah Azzahra</strong>
            <span style="font-size:11px;color:var(--text-muted);">Lead Presales & Project Manager (Internal ASTACODE)</span>
            <span style="font-family:var(--font-mono);font-size:11px;color:#10b981;">0812-9988-7766</span>
            <span style="font-size:11px;color:var(--indigo-600);">asisyahsarahazz@gmail.com</span>
          </div>
        </div>
      </div>
    `;
  } else if (activeDetailTab === 'notes') {
    tabBodyHtml = `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Embedded Voice Note & Audio-to-Document Manager -->
        <div id="voicenote-manager-mount">
          ${renderVoiceNoteAndDocs(lead.id, lead.title, lead.customer ? lead.customer.legal_name : 'Customer')}
        </div>

        <!-- Internal Notes List -->
        <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:12px;">
          <h4 style="font-size:12px;font-weight:800;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;margin:0;">
            Catatan Internal Tim Sales & PM
          </h4>

          <div style="display:flex;gap:8px;">
            <input
              id="new-note-text-input"
              type="text"
              class="form-input"
              placeholder="Tambahkan catatan internal penting mengenai lead ini..."
              style="font-size:12px;flex:1;"
            />
            <button id="btn-add-internal-note" class="btn btn-primary btn-sm" style="font-weight:700;">
              Simpan
            </button>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;padding-top:6px;">
            ${notesList.map((note) => `
              <div style="padding:10px 14px;border-radius:var(--radius-md);background:var(--bg-secondary);border:1px solid var(--border);font-size:12px;color:var(--text-secondary);border-left:3px solid var(--indigo-600);">
                ${note}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (activeDetailTab === 'history') {
    tabBodyHtml = `
      <div class="card" style="padding:22px;border-radius:var(--radius-xl);border:1px solid var(--border);display:flex;flex-direction:column;gap:14px;">
        <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">Audit Trail & Riwayat Perubahan Status</h3>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;">
          <div style="padding:12px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;font-weight:700;">
              <span>Tahap diubah ke: ${stageConfig.name}</span>
              <span style="font-family:var(--font-mono);color:var(--text-muted);">2026-10-22 10:15 WIB</span>
            </div>
            <p style="color:var(--text-muted);margin:4px 0 0 0;font-size:11px;">Oleh Asisyah Sarah Azzahra (PM)</p>
          </div>
          <div style="padding:12px;border-radius:8px;background:var(--bg-secondary);border:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;font-weight:700;">
              <span>RAB AI Presales Berhasil Di-generate</span>
              <span style="font-family:var(--font-mono);color:var(--text-muted);">2026-10-21 14:30 WIB</span>
            </div>
            <p style="color:var(--text-muted);margin:4px 0 0 0;font-size:11px;">Total 152 Mandays dikalkulasi dengan PPN 11%</p>
          </div>
        </div>
      </div>
    `;
  }

  // Modals HTML
  let meetModalHtml = '';
  if (isMeetModalOpen) {
    meetModalHtml = `
      <div class="modal-overlay" id="meet-modal-backdrop" style="position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;">
        <div class="modal modal-md" onclick="event.stopPropagation();" style="width:100%;max-width:520px;padding:22px;border-radius:var(--radius-2xl);background:var(--bg-card);border:1px solid var(--border);box-shadow:var(--shadow-xl);display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:10px;">
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">Jadwalkan Meeting / Aktivitas Baru</h3>
            <button id="btn-close-meet-modal" class="modal-close" style="border:none;background:transparent;cursor:pointer;color:var(--text-muted);">${ICONS.close}</button>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight:700;font-size:12px;">Judul Aktivitas*:</label>
            <input id="meet-modal-title" type="text" class="form-input" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px;" value="${meetTitle || `Diskusi Scope & Termin ${lead.title}`}" />
          </div>

          <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;font-size:12px;">Waktu Pertemuan*:</label>
              <input id="meet-modal-date" type="datetime-local" class="form-input" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px;" value="${meetDate}" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight:700;font-size:12px;">Durasi (Menit):</label>
              <input id="meet-modal-duration" type="number" class="form-input" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px;" value="${meetDuration}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight:700;font-size:12px;">Peserta Email (pisahkan koma):</label>
            <input id="meet-modal-attendees" type="text" class="form-input" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:12px;" value="${lead.primary_contact ? lead.primary_contact.email : 'client@email.com'}" />
          </div>

          <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding-top:10px;border-top:1px solid var(--border);">
            <button id="btn-cancel-meet" class="btn btn-secondary btn-sm">Batal</button>
            <button id="btn-submit-meet" class="btn btn-primary btn-sm" style="font-weight:700;">Simpan & Buat Link Meet</button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="flex:1;display:flex;flex-direction:column;height:100%;overflow-y:auto;background:var(--bg-primary);">
      
      <!-- 1. Header Workspace Bar (Point 3) -->
      <div style="padding:20px 24px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:18px;box-shadow:var(--shadow-xs);">
        
        <!-- Navigation & Title Row with Company Metadata -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <!-- Back to Pipeline Button with exact label requested -->
            <button id="btn-lead-back-pipeline" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:8px 12px;border-radius:10px;">
              ${ICONS.arrowLeft}
              <span>← Kembali ke Pipeline</span>
            </button>

            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-family:var(--font-mono);font-weight:800;font-size:11px;padding:2px 8px;border-radius:6px;background:rgba(99,102,241,0.1);color:var(--indigo-600);border:1px solid rgba(99,102,241,0.25);">
                  ${lead.code}
                </span>
                <h1 style="font-size:18px;font-weight:800;color:var(--text-primary);letter-spacing:-0.02em;margin:0;">
                  ${lead.title}
                </h1>
                <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:9999px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.25);">
                  ${lead.priority}
                </span>
              </div>

              <!-- Metadata Line with Building Icon, PIC, and Bold Green Value (Point 3) -->
              <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text-muted);margin-top:6px;flex-wrap:wrap;">
                <span style="font-weight:700;color:var(--text-primary);display:inline-flex;align-items:center;gap:6px;">
                  <span style="color:var(--indigo-600);">${ICONS.building}</span>
                  <span>${lead.customer ? lead.customer.legal_name : 'Customer'}</span>
                </span>
                <span>•</span>
                <span>PIC: ${lead.primary_contact ? lead.primary_contact.name : '-'} (${lead.primary_contact ? lead.primary_contact.job_title : '-'})</span>
                <span>•</span>
                <span style="font-family:var(--font-mono);font-weight:800;color:#16a34a;">
                  ${formatRupiah(lead.est_value || 0)}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Bar -->
          <div style="display:flex;align-items:center;gap:8px;">
            <button id="btn-header-meet" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 12px;border-radius:10px;">
              ${ICONS.video}
              <span>Jadwalkan Meet</span>
            </button>
            <button id="btn-header-wa" class="btn btn-secondary btn-sm" style="color:var(--emerald-600);display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 12px;border-radius:10px;">
              ${ICONS.messageSquare}
              <span>WhatsApp Chat</span>
            </button>
            <button id="btn-header-quotation" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:7px 14px;border-radius:10px;">
              ${ICONS.fileCheck}
              <span>Quotation & TOP</span>
            </button>
          </div>
        </div>

        <!-- 2. Track Record Pipeline Section (Point 4) -->
        <div style="display:flex;flex-direction:column;gap:10px;">
          
          <!-- Outer Header Row: Track Record Title & Badges OUTSIDE/ABOVE card -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;font-size:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-weight:800;font-size:11px;text-transform:uppercase;color:var(--text-muted);letter-spacing:0.05em;">
                TRACK RECORD PIPELINE:
              </span>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:9999px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);color:var(--indigo-600);font-weight:700;font-family:var(--font-mono);font-size:11px;">
                <span style="width:6px;height:6px;border-radius:50%;background:var(--indigo-600);display:inline-block;"></span>
                <span>
                  ${lead.stage_id === 'reject' ? '0% • REJECT' : `${PIPELINE_STAGES.find((s) => s.id === lead.stage_id)?.probability || 10}% WORKFLOW CAPAIAN`}
                </span>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;font-weight:600;color:var(--text-secondary);">
                Tahap Saat Ini: <strong style="color:var(--text-primary);">${stageConfig.name}</strong>
              </span>
              <span style="font-size:10px;font-family:var(--font-mono);font-weight:700;padding:2px 8px;border-radius:4px;background:rgba(245,158,11,0.1);color:#d97706;border:1px solid rgba(245,158,11,0.25);">
                SLA: ${lead.days_in_stage || 3} Hari
              </span>
            </div>
          </div>

          <!-- Stepper White Card Container -->
          <div class="card" style="padding:20px;border-radius:var(--radius-xl);border:1px solid var(--border);position:relative;overflow:hidden;background:var(--bg-card);box-shadow:var(--shadow-xs);">
            
            <!-- Horizontal Continuous Progress Track Background Line -->
            <div style="position:absolute;top:38px;left:45px;right:45px;height:3px;background:var(--border);z-index:1;"></div>
            
            <!-- Active Colored Progress Line -->
            ${lead.stage_id !== 'reject' ? `
              <div style="position:absolute;top:38px;left:45px;height:3px;background:linear-gradient(90deg, #3b82f6, #6366f1, #10b981);z-index:1;width:${activeRailPercent}%;transition:width 0.4s ease;"></div>
            ` : ''}

            <!-- Circular Milestone Nodes -->
            <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:8px;position:relative;z-index:2;overflow-x:auto;">
              ${railNodesHtml}
            </div>

            <!-- Bottom Gate Aturan Bisnis & Action Buttons Row (Point 4) -->
            <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-size:12px;">
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:11px;font-weight:700;color:var(--text-muted);">
                  Gate Aturan Bisnis:
                </span>
                <span style="font-size:11px;font-weight:700;color:var(--text-primary);">
                  ${GATE_RULES_DESC[lead.stage_id] || 'Aturan bisnis tahapan terverifikasi.'}
                </span>
              </div>

              <div style="display:flex;align-items:center;gap:8px;">
                <button id="btn-gate-next-step" class="btn btn-primary btn-sm" style="font-weight:700;padding:6px 14px;border-radius:8px;display:inline-flex;align-items:center;gap:6px;">
                  <span>Lanjut Step Berikutnya</span>
                  ${ICONS.arrowRight}
                </button>
                <button id="btn-gate-reject" class="btn btn-outline" style="font-weight:700;padding:6px 12px;border-radius:8px;color:#ef4444;border-color:rgba(239,68,68,0.3);background:transparent;">
                  Tandai Reject
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- 3. Navigation Tabs Row (Point 5 - 8 Specific Tabs) -->
        <div style="display:flex;align-items:center;gap:4px;overflow-x:auto;padding-top:4px;border-top:1px solid var(--border-light);font-size:12px;font-weight:700;">
          ${DETAIL_TABS.map((tab) => `
            <button
              class="btn-detail-tab"
              data-tab="${tab.id}"
              style="padding:10px 16px;border:none;background:transparent;cursor:pointer;border-bottom:2px solid ${activeDetailTab === tab.id ? 'var(--indigo-600)' : 'transparent'};color:${activeDetailTab === tab.id ? 'var(--indigo-600)' : 'var(--text-muted)'};white-space:nowrap;display:inline-flex;align-items:center;gap:6px;transition:all var(--transition);"
            >
              <span>${tab.label}</span>
              ${tab.badge !== undefined ? `<span class="badge" style="font-size:9px;padding:1px 6px;border-radius:9999px;background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary);">${tab.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Tab Content Area -->
      <div style="padding:24px;flex:1;">
        ${tabBodyHtml}
      </div>

      <!-- Modals -->
      ${meetModalHtml}
    </div>
  `;
}

export function bindLeadDetailPageEvents(container) {
  // Back to pipeline button
  const backBtn = container.querySelector('#btn-lead-back-pipeline');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      store.navigateBackToPipeline();
    });
  }

  const backNotFound = container.querySelector('#btn-back-not-found');
  if (backNotFound) {
    backNotFound.addEventListener('click', () => {
      store.navigateBackToPipeline();
    });
  }

  // Stage nodes click
  container.querySelectorAll('.btn-stage-node').forEach((btn) => {
    btn.addEventListener('click', () => {
      const stageId = btn.dataset.stageId;
      const state = store.getState();
      const res = store.updateLeadStage(state.selectedLeadId, stageId);
      if (!res.success) {
        alert(res.message);
      }
    });
  });

  // Gate Rules action buttons
  const btnNextStep = container.querySelector('#btn-gate-next-step');
  if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead) return;
      const stages = ['new_lead', 'follow_up', 'requirement', 'quotation', 'negotiation', 'deal'];
      const currentIdx = stages.indexOf(lead.stage_id);
      if (currentIdx !== -1 && currentIdx < stages.length - 1) {
        const nextStageId = stages[currentIdx + 1];
        const res = store.updateLeadStage(lead.id, nextStageId);
        if (!res.success) {
          alert(res.message);
        }
      }
    });
  }

  const btnGateReject = container.querySelector('#btn-gate-reject');
  if (btnGateReject) {
    btnGateReject.addEventListener('click', () => {
      const reason = prompt('Masukkan alasan penolakan lead / status reject:', 'Budget Klien Over / Tidak Masuk');
      if (reason) {
        const state = store.getState();
        store.updateLeadStage(state.selectedLeadId, 'reject');
      }
    });
  }

  // Detail Tabs Switcher
  container.querySelectorAll('.btn-detail-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeDetailTab = btn.dataset.tab;
      renderLeadDetailPage(container);
      mount(container);
    });
  });

  // Action buttons
  const btnMeet = container.querySelector('#btn-header-meet');
  if (btnMeet) {
    btnMeet.addEventListener('click', () => {
      isMeetModalOpen = true;
      mount(container);
    });
  }

  const btnQuickMeet = container.querySelector('#btn-quick-schedule-meet');
  if (quickMeetBtnAvailable(btnQuickMeet)) {
    btnQuickMeet.addEventListener('click', () => {
      isMeetModalOpen = true;
      mount(container);
    });
  }

  const btnOpenMeetModal = container.querySelector('#btn-open-meet-modal');
  if (btnOpenMeetModal) {
    btnOpenMeetModal.addEventListener('click', () => {
      isMeetModalOpen = true;
      mount(container);
    });
  }

  const btnCloseMeet = container.querySelector('#btn-close-meet-modal');
  if (btnCloseMeet) {
    btnCloseMeet.addEventListener('click', () => {
      isMeetModalOpen = false;
      mount(container);
    });
  }

  const btnCancelMeet = container.querySelector('#btn-cancel-meet');
  if (btnCancelMeet) {
    btnCancelMeet.addEventListener('click', () => {
      isMeetModalOpen = false;
      mount(container);
    });
  }

  const btnSubmitMeet = container.querySelector('#btn-submit-meet');
  if (btnSubmitMeet) {
    btnSubmitMeet.addEventListener('click', () => {
      const titleInput = container.querySelector('#meet-modal-title');
      const dateInput = container.querySelector('#meet-modal-date');
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (lead) {
        store.addActivity({
          lead_id: lead.id,
          type: 'google_meet',
          title: titleInput ? titleInput.value : `Diskusi Scope ${lead.title}`,
          scheduled_at: dateInput ? new Date(dateInput.value).toISOString() : new Date().toISOString(),
          duration_minutes: 60,
          status: 'planned',
          meet_link: `https://meet.google.com/ast-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
          assigned_to: lead.sales_pic,
          attendees: [lead.primary_contact ? lead.primary_contact.email : 'client@email.com'],
          notes: 'Google Calendar Event & Meet link dibuat otomatis via CRM.',
        });
      }
      isMeetModalOpen = false;
      activeDetailTab = 'activity';
      mount(container);
    });
  }

  const btnWa = container.querySelector('#btn-header-wa');
  if (btnWa) {
    btnWa.addEventListener('click', () => {
      store.setState({ activeView: 'client_care' });
    });
  }

  const btnQuotation = container.querySelector('#btn-header-quotation');
  if (btnQuotation) {
    btnQuotation.addEventListener('click', () => {
      activeDetailTab = 'quotation';
      mount(container);
    });
  }

  const btnQuickQuotation = container.querySelector('#btn-quick-goto-quotation');
  if (btnQuickQuotation) {
    btnQuickQuotation.addEventListener('click', () => {
      activeDetailTab = 'quotation';
      mount(container);
    });
  }

  const btnSeeAllActivities = container.querySelector('#btn-see-all-activities');
  if (btnSeeAllActivities) {
    btnSeeAllActivities.addEventListener('click', () => {
      activeDetailTab = 'activity';
      mount(container);
    });
  }

  // Trigger AI RAB Simulation
  const btnAiRab = container.querySelector('#btn-trigger-ai-rab');
  if (btnAiRab) {
    btnAiRab.addEventListener('click', async () => {
      const promptEl = container.querySelector('#req-prompt-input');
      const pText = promptEl ? promptEl.value.trim() : promptText.trim();
      if (!pText && uploadedFiles.length === 0) {
        alert('Wajib mengisi prompt kebutuhan atau mengunggah dokumen (PRD Section 9.1).');
        return;
      }

      isGeneratingRab = true;
      rabProgress = 15;
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);

      setTimeout(() => {
        rabProgress = 45;
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);
      }, 350);

      setTimeout(() => {
        rabProgress = 80;
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);
      }, 750);

      setTimeout(async () => {
        rabProgress = 100;
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);

        const state = store.getState();
        const newRab = await store.generateAiRab(state.selectedLeadId, pText || promptText, {
          platform: platformParam,
          complexity: complexityParam,
          include_uat: includeUat,
          include_training: includeTraining,
          contingency_pct: contingencyPct,
        });

        // Also reset TOP for new grand total
        const updatedTop = createTopFromPreset('30/40/30', newRab.grand_total, 'grand_total');
        terminItemsState = updatedTop.items;

        isGeneratingRab = false;
        activeDetailTab = 'rab';
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);

        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: {
              message: '✨ Estimasi RAB & Mandays AI berhasil digenerate! Modul terstruktur kini editable.',
              type: 'success',
            },
          })
        );
      }, 1200);
    });
  }

  // Requirement Prompt & Dropzone events
  const promptInput = container.querySelector('#req-prompt-input');
  if (promptInput) {
    promptInput.addEventListener('input', (e) => {
      promptText = e.target.value;
    });
  }

  const dropzoneBox = container.querySelector('#req-dropzone-box');
  const fileInput = container.querySelector('#req-file-input');
  if (dropzoneBox && fileInput) {
    dropzoneBox.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        Array.from(e.target.files).forEach((file) => {
          uploadedFiles.push({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          });
        });
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);
      }
    });

    dropzoneBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneBox.classList.add('drag-over');
    });

    dropzoneBox.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzoneBox.classList.remove('drag-over');
    });

    dropzoneBox.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneBox.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        Array.from(e.dataTransfer.files).forEach((file) => {
          uploadedFiles.push({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          });
        });
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);
      }
    });
  }

  // Parameter controls
  const platformSel = container.querySelector('#req-platform-select');
  if (platformSel) {
    platformSel.addEventListener('change', (e) => {
      platformParam = e.target.value;
    });
  }

  const complexitySel = container.querySelector('#req-complexity-select');
  if (complexitySel) {
    complexitySel.addEventListener('change', (e) => {
      complexityParam = e.target.value;
    });
  }

  const contingencyInp = container.querySelector('#req-contingency-input');
  if (contingencyInp) {
    contingencyInp.addEventListener('input', (e) => {
      contingencyPct = Number(e.target.value) || 0;
    });
  }

  const chkUat = container.querySelector('#req-chk-uat');
  if (chkUat) {
    chkUat.addEventListener('change', (e) => {
      includeUat = e.target.checked;
    });
  }

  const chkTraining = container.querySelector('#req-chk-training');
  if (chkTraining) {
    chkTraining.addEventListener('change', (e) => {
      includeTraining = e.target.checked;
    });
  }

  // Toggle internal view in RAB tab
  const btnToggleInternal = container.querySelector('#btn-toggle-internal-view');
  if (btnToggleInternal) {
    btnToggleInternal.addEventListener('click', () => {
      internalView = !internalView;
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  }

  // Add RAB item
  const btnAddModule = container.querySelector('#btn-open-add-module');
  if (btnAddModule) {
    btnAddModule.addEventListener('click', () => {
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead) return;
      const currentItems = lead.rab?.items ? [...lead.rab.items] : [];
      const newItem = {
        id: `rab-item-${Date.now()}`,
        category: 'Transaksi',
        name: 'Modul Kustom Baru',
        description: 'Deskripsi modul kustom yang ditambahkan manual oleh presales',
        qty: 4,
        unit: 'Mandays',
        role: 'Fullstack Dev',
        unit_price: 1500000,
        unit_cost: 900000,
        subtotal: 4 * 1500000,
        mandays: 4,
        complexity: 'Medium',
        source: 'Manual',
      };
      currentItems.push(newItem);
      store.updateLeadRabItems(lead.id, currentItems, contingencyPct, 0);
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  }

  // Delete RAB item
  container.querySelectorAll('.btn-delete-rab-item[data-item-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.dataset.itemId;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      if (lead.rab.items.length <= 1) {
        alert('Minimal harus tersisa 1 modul dalam RAB.');
        return;
      }
      const updated = lead.rab.items.filter((item) => item.id !== itemId);
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  });

  // Edit item inputs
  container.querySelectorAll('.rab-item-name-input').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const itemId = inp.dataset.itemId;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      const updated = lead.rab.items.map((it) => it.id === itemId ? { ...it, name: e.target.value } : it);
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
    });
  });

  container.querySelectorAll('.rab-item-desc-input').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const itemId = inp.dataset.itemId;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      const updated = lead.rab.items.map((it) => it.id === itemId ? { ...it, description: e.target.value } : it);
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
    });
  });

  container.querySelectorAll('.rab-item-qty-input').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const itemId = inp.dataset.itemId;
      const newQty = Math.max(1, Number(e.target.value) || 1);
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      const updated = lead.rab.items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          qty: newQty,
          subtotal: newQty * it.unit_price,
          mandays: it.unit === 'Mandays' ? newQty : it.mandays,
        };
      });
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  });

  container.querySelectorAll('.rab-item-unit-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const itemId = sel.dataset.itemId;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      const updated = lead.rab.items.map((it) => it.id === itemId ? { ...it, unit: e.target.value } : it);
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
    });
  });

  // Edit RAB category select
  container.querySelectorAll('.rab-item-category-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const itemId = sel.dataset.itemId;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      const updated = lead.rab.items.map((it) => it.id === itemId ? { ...it, category: e.target.value } : it);
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
    });
  });

  container.querySelectorAll('.rab-item-price-input').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const itemId = inp.dataset.itemId;
      const newPrice = Math.max(0, Number(e.target.value) || 0);
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead || !lead.rab?.items) return;
      const updated = lead.rab.items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          unit_price: newPrice,
          subtotal: it.qty * newPrice,
        };
      });
      store.updateLeadRabItems(lead.id, updated, contingencyPct, 0);
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  });

  // Review RAB toggle with green toast
  const btnReviewRab = container.querySelector('#btn-toggle-rab-reviewed');
  if (btnReviewRab) {
    btnReviewRab.addEventListener('click', () => {
      const state = store.getState();
      store.markRabReviewed(state.selectedLeadId, 'Asisyah Sarah Azzahra (Super Admin & PM)');
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: '✓ Status RAB ditandai Reviewed by Presales! Gate aturan bisnis Requirement terpenuhi.',
            type: 'success',
          },
        })
      );
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  }

  // --- Setting TOP Events ---
  // Preset change
  const topPresetSelect = container.querySelector('#top-preset-select');
  if (topPresetSelect) {
    topPresetSelect.addEventListener('change', (e) => {
      selectedPresetKey = e.target.value;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      const targetBase = topCalcBasis === 'grand_total'
        ? (lead?.rab ? lead.rab.grand_total : lead?.est_value || 0)
        : (lead?.rab ? lead.rab.total_before_tax : lead?.est_value || 0);
      const newScheme = createTopFromPreset(selectedPresetKey, targetBase, topCalcBasis);
      terminItemsState = newScheme.items;
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  }

  // Calculation basis radio change
  container.querySelectorAll('input[name="top_calc_basis"]').forEach((rad) => {
    rad.addEventListener('change', (e) => {
      topCalcBasis = e.target.value;
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  });

  // Add new termin button
  const btnAddTopTerm = container.querySelector('#btn-add-top-term');
  if (btnAddTopTerm) {
    btnAddTopTerm.addEventListener('click', () => {
      if (!terminItemsState) terminItemsState = [];
      const newTerm = {
        id: `term-${Date.now()}`,
        term_no: terminItemsState.length + 1,
        name: `Termin ${terminItemsState.length + 1}`,
        description: 'Penyelesaian milestone tahapan proyek',
        value_type: 'percent',
        value: 10,
        calculated_amount: 0,
        trigger_type: 'milestone',
        trigger_label: 'Penyelesaian milestone',
        due_days_label: 'Net 14',
        status: 'Planned',
      };
      terminItemsState.push(newTerm);
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  }

  // Delete termin button
  container.querySelectorAll('.btn-delete-top-term').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      if (!terminItemsState || terminItemsState.length <= 1) {
        alert('Minimal harus memiliki 1 termin pembayaran.');
        return;
      }
      terminItemsState.splice(idx, 1);
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  });

  // Termin input edits
  container.querySelectorAll('.top-term-name-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const idx = Number(inp.dataset.idx);
      if (terminItemsState && terminItemsState[idx]) {
        terminItemsState[idx].name = inp.value;
      }
    });
  });

  container.querySelectorAll('.top-term-desc-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const idx = Number(inp.dataset.idx);
      if (terminItemsState && terminItemsState[idx]) {
        terminItemsState[idx].description = inp.value;
      }
    });
  });

  container.querySelectorAll('.top-term-type-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const idx = Number(sel.dataset.idx);
      if (terminItemsState && terminItemsState[idx]) {
        terminItemsState[idx].value_type = sel.value;
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);
      }
    });
  });

  container.querySelectorAll('.top-term-val-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const idx = Number(inp.dataset.idx);
      if (terminItemsState && terminItemsState[idx]) {
        terminItemsState[idx].value = Number(inp.value) || 0;
        container.innerHTML = renderLeadDetailPage();
        bindLeadDetailPageEvents(container);
      }
    });
  });

  container.querySelectorAll('.top-term-trigger-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const idx = Number(inp.dataset.idx);
      if (terminItemsState && terminItemsState[idx]) {
        terminItemsState[idx].trigger_label = inp.value;
      }
    });
  });

  container.querySelectorAll('.top-term-due-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      const idx = Number(inp.dataset.idx);
      if (terminItemsState && terminItemsState[idx]) {
        terminItemsState[idx].due_days_label = inp.value;
      }
    });
  });

  // Quotation status buttons
  container.querySelectorAll('.btn-quo-status-action').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      const quo = lead && lead.quotations && lead.quotations[0];
      const quoId = quo ? quo.id : 'quo-1';

      if (status === 'Reject') {
        const reason = prompt('Masukkan alasan penolakan lead:', 'Budget Klien Over / Tidak Masuk');
        if (reason) {
          store.updateQuotationStatus(state.selectedLeadId, quoId, 'Reject', reason);
          container.innerHTML = renderLeadDetailPage();
          bindLeadDetailPageEvents(container);
        }
      } else {
        const res = store.updateQuotationStatus(state.selectedLeadId, quoId, status);
        if (!res.success) {
          alert(res.message);
        } else {
          if (status === 'Deal') {
            alert('Selamat! Status DEAL berhasil dikonfirmasi.\n- Master Customer diubah ke status ACTIVE\n- Proyek ERP Delivery otomatis dibuat\n- Jadwal Invoice termin pembayaran otomatis diterbitkan ke Finance.');
          }
          container.innerHTML = renderLeadDetailPage();
          bindLeadDetailPageEvents(container);
        }
      }
    });
  });

  // Document preview part switcher tabs
  container.querySelectorAll('.btn-doc-preview-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      docPreviewTab = btn.dataset.previewTab;
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  });

  // Print document
  const btnPrintDoc = container.querySelector('#btn-print-quotation-doc');
  if (btnPrintDoc) {
    btnPrintDoc.addEventListener('click', () => {
      window.print();
    });
  }

  // Generate and save quotation with TOP
  const btnGenQuo = container.querySelector('#btn-generate-quotation-doc');
  if (btnGenQuo) {
    btnGenQuo.addEventListener('click', () => {
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      if (!lead) return;
      const targetBase = topCalcBasis === 'grand_total'
        ? (lead.rab ? lead.rab.grand_total : lead.est_value)
        : (lead.rab ? lead.rab.total_before_tax : lead.est_value);
      const currentTop = calculateTopScheme(terminItemsState || [], targetBase, topCalcBasis, selectedPresetKey, true);
      if (!currentTop.is_balanced) {
        alert('Setting TOP harus balance (Total 100%) sebelum quotation dapat digenerate (PRD Section 8.11.1 BR-15).');
        return;
      }

      const introEl = container.querySelector('#intro-letter-textarea');
      if (introEl) introLetterText = introEl.value;

      const quo = store.saveQuotationWithTop(lead.id, currentTop, introLetterText, 'Rev. 2');
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `✨ Quotation paket ${quo.number} berhasil digenerate lengkap dengan Setting TOP dan 22 Pasal MoU!`,
            type: 'success',
          },
        })
      );
      container.innerHTML = renderLeadDetailPage();
      bindLeadDetailPageEvents(container);
    });
  }

  // Intro letter textarea
  const introTextarea = container.querySelector('#intro-letter-textarea');
  if (introTextarea) {
    introTextarea.addEventListener('input', (e) => {
      introLetterText = e.target.value;
    });
  }

  // Add internal note
  const btnAddNote = container.querySelector('#btn-add-internal-note');
  if (btnAddNote) {
    btnAddNote.addEventListener('click', () => {
      const input = container.querySelector('#new-note-text-input');
      if (input && input.value.trim()) {
        notesList.unshift(input.value.trim());
        input.value = '';
        mount(container);
      }
    });
  }

  // Deal confirmation
  const btnDeal = container.querySelector('#btn-action-deal');
  if (btnDeal) {
    btnDeal.addEventListener('click', () => {
      const state = store.getState();
      const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
      const quo = lead && lead.quotations && lead.quotations[0];
      const res = store.updateQuotationStatus(state.selectedLeadId, quo ? quo.id : 'quo-1', 'Deal');
      if (!res.success) {
        alert(res.message);
      } else {
        alert('Selamat! Status DEAL berhasil dikonfirmasi.\n- Master Customer diubah ke status ACTIVE\n- Proyek ERP Delivery otomatis dibuat\n- Jadwal Invoice termin pembayaran otomatis diterbitkan ke Finance.');
      }
    });
  }

  // Reject confirmation
  const btnReject = container.querySelector('#btn-action-reject');
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      const reason = prompt('Masukkan alasan penolakan lead:', 'Budget Klien Over / Tidak Masuk');
      if (reason) {
        const state = store.getState();
        const lead = (state.leads || []).find((l) => l.id === state.selectedLeadId);
        const quo = lead && lead.quotations && lead.quotations[0];
        store.updateQuotationStatus(state.selectedLeadId, quo ? quo.id : 'quo-1', 'Reject', reason);
      }
    });
  }

  // Bind embedded voicenote manager if present
  const voicenoteMount = container.querySelector('#voicenote-manager-mount');
  bindVoiceNoteAndDocsEvents(voicenoteMount || container);
}

function quickMeetBtnAvailable(el) {
  return el !== null && el !== undefined;
}

export function mount(container) {
  container.innerHTML = renderLeadDetailPage();
  bindLeadDetailPageEvents(container);

  const unsubscribe = store.subscribe(() => {
    container.innerHTML = renderLeadDetailPage();
    bindLeadDetailPageEvents(container);
  });

  return unsubscribe;
}
