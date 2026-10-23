/**
 * VoiceNoteAndDocsManager.js — Vanilla JS Voice Note Recorder, AI Transcriber & Document Manager
 * Converted from src/components/crm/VoiceNoteAndDocsManager.tsx
 */

import store from '../../store/store.js';

let isRecording = false;
let recordingSeconds = 0;
let recordingTimer = null;
let isPlayingAudioId = null;
let isSummarizingId = null;
let activePreviewDoc = null;

let voiceNotes = [
  {
    id: 'vn-1',
    title: 'Voice Note: Notulen Meeting Teknis Modul Payroll & Geofence',
    durationSeconds: 42,
    recordedAt: '15 Okt 2026, 14:15',
    transcript:
      'Pak Budi menjelaskan bahwa pabrik di Bekasi punya 4 pintu masuk shift malam. Validasi GPS harus anti fake GPS dengan selfie liveness. Untuk payroll, harus ada pembulatan pajak PPh 21 dan kirim slip gaji password tanggal 25 tiap bulan.',
    aiSummaryDoc: {
      title: 'Ringkasan Eksekutif Kebutuhan Teknis (Hasil Analisis Voice Note)',
      executiveSummary:
        'Klien PT Maju Sejahtera Industri membutuhkan sistem absensi shift geofencing anti-fake GPS dan engine payroll otomatis dengan distribusi slip gaji terenkripsi setiap tanggal 25.',
      clientNeeds: [
        'Geofencing GPS radius 50 meter di 4 gerbang pabrik Bekasi',
        'Liveness detection selfie anti-mock location',
        'Batch processing payroll 500+ karyawan otomatis setiap tanggal 25',
        'Slip gaji PDF terenkripsi dengan password tanggal lahir karyawan',
      ],
      technicalScope: [
        'Modul Transaksi No. 4: Absensi GPS Geofencing (12 Mandays)',
        'Modul Transaksi No. 6: Payroll Engine Terenkripsi (20 Mandays)',
        'Modul Non-Functional: Enkripsi data UU PDP & ISO 27001 (8 Mandays)',
      ],
      actionItems: [
        { task: 'Verifikasi koordinat titik GPS 4 gerbang pabrik', pic: 'Asisyah Sarah Azzahra', due: '20 Okt 2026' },
        { task: 'Masukkan item enkripsi slip gaji ke draft RAB Rev. 2', pic: 'Presales Team', due: '18 Okt 2026' },
        { task: 'Kirim penawaran final dengan skema termin 30/40/30', pic: 'Asisyah Sarah Azzahra', due: '21 Okt 2026' },
      ],
    },
  },
];

let attachedFiles = [
  {
    id: 'f-1',
    name: 'Kerangka_Acuan_Kerja_HRIS_PT_Maju.pdf',
    size: '2.4 MB',
    type: 'document',
    uploadedAt: '12 Okt 2026',
  },
  {
    id: 'f-2',
    name: 'Rekaman_Diskusi_Zoom_Discovery_HRD.mp3',
    size: '8.7 MB',
    type: 'audio',
    uploadedAt: '14 Okt 2026',
  },
  {
    id: 'f-3',
    name: 'Form_Kompensasi_Benefit_Karyawan.xlsx',
    size: '1.1 MB',
    type: 'document',
    uploadedAt: '15 Okt 2026',
  },
];

const ICONS = {
  mic: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  square: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  fileAudio: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3"/><polyline points="14 2 14 8 20 8"/><path d="M10 20v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0Z"/><path d="M6 20v-1a2 2 0 1 0-4 0v1a2 2 0 1 0 4 0Z"/><path d="M2 19v-3a6 6 0 0 1 12 0v3"/></svg>`,
  upload: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function renderVoiceNoteAndDocs(leadId, leadTitle, customerName) {
  const voiceNotesHtml = voiceNotes.map((vn) => {
    const isPlaying = isPlayingAudioId === vn.id;
    const isSummarizing = isSummarizingId === vn.id;

    return `
      <div style="padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-xl);display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <button
              class="btn-audio-play"
              data-vn-id="${vn.id}"
              style="width:32px;height:32px;border-radius:var(--radius-full);background:var(--indigo-500);color:#ffffff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-sm);"
              title="${isPlaying ? 'Pause' : 'Play'}"
            >
              ${isPlaying ? ICONS.pause : ICONS.play}
            </button>
            <div>
              <h4 style="font-size:12px;font-weight:700;color:var(--text-primary);">${vn.title}</h4>
              <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px;">
                <span>⏱ ${vn.durationSeconds} detik</span>
                <span>•</span>
                <span>${vn.recordedAt}</span>
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:6px;">
            <button
              class="btn-vn-summarize btn btn-sm btn-primary"
              data-vn-id="${vn.id}"
              ${isSummarizing ? 'disabled' : ''}
              style="font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;"
            >
              ${ICONS.sparkles}
              <span>${isSummarizing ? 'AI Meringkas Audio...' : 'Transkrip & Ringkas via AI'}</span>
            </button>

            ${vn.aiSummaryDoc ? `
              <button
                class="btn-preview-summary btn btn-sm btn-secondary"
                data-vn-id="${vn.id}"
                style="font-size:11px;font-weight:700;color:var(--indigo-500);border-color:var(--indigo-500);display:inline-flex;align-items:center;gap:4px;"
              >
                ${ICONS.eye}
                <span>Lihat Rangkuman</span>
              </button>
            ` : ''}
          </div>
        </div>

        ${vn.transcript ? `
          <div style="padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);font-size:12px;color:var(--text-secondary);line-height:1.5;">
            <strong style="color:var(--indigo-500);font-size:11px;display:block;margin-bottom:2px;">Transkrip Suara:</strong>
            "${vn.transcript}"
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const attachedFilesHtml = attachedFiles.map((file) => {
    const isAudio = file.type === 'audio' || file.name.endsWith('.mp3');
    const iconColor = isAudio ? '#8b5cf6' : '#ef4444';
    const iconSvg = isAudio
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3"/><polyline points="14 2 14 8 20 8"/><path d="M10 20v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0Z"/><path d="M6 20v-1a2 2 0 1 0-4 0v1a2 2 0 1 0 4 0Z"/><path d="M2 19v-3a6 6 0 0 1 12 0v3"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;

    return `
      <div style="padding:14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
          <span style="display:flex;align-items:center;flex-shrink:0;padding:6px;background:${isAudio ? 'rgba(139,92,246,0.1)' : 'rgba(239,68,68,0.1)'};border-radius:var(--radius-md);">
            ${iconSvg}
          </span>
          <div style="min-width:0;">
            <p style="font-size:12px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${file.name}">
              ${file.name}
            </p>
            <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);">
              ${file.size} • ${file.uploadedAt}
            </span>
          </div>
        </div>

        <button
          class="btn-file-download btn btn-ghost btn-xs"
          data-file-name="${file.name}"
          title="Download Berkas"
          style="color:var(--indigo-500);padding:6px;border-radius:var(--radius-md);"
        >
          ${ICONS.download}
        </button>
      </div>
    `;
  }).join('');

  // AI Summary Modal Preview HTML
  let previewModalHtml = '';
  if (activePreviewDoc) {
    previewModalHtml = `
      <div class="modal-overlay" id="summary-doc-modal-backdrop" style="background:rgba(15,23,42,.65);backdrop-filter:blur(4px);z-index:100;">
        <div class="modal modal-lg" onclick="event.stopPropagation();" style="max-height:85vh;padding:24px;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:var(--indigo-500);">${ICONS.sparkles}</span>
              <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);">
                ${activePreviewDoc.title}
              </h3>
            </div>
            <button id="btn-close-summary-modal" class="modal-close" title="Tutup">
              ${ICONS.close}
            </button>
          </div>

          <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:16px;font-size:12px;">
            <div style="padding:14px;border-radius:var(--radius-lg);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);">
              <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--indigo-500);display:block;margin-bottom:4px;">
                1. Ringkasan Eksekutif Hasil Voice Note:
              </span>
              <p style="color:var(--text-primary);line-height:1.6;">
                ${activePreviewDoc.executiveSummary}
              </p>
            </div>

            <div>
              <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text-secondary);display:block;margin-bottom:6px;">
                2. Poin-Poin Kebutuhan Klien:
              </span>
              <ul style="list-style-type:disc;padding-left:18px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                ${activePreviewDoc.clientNeeds.map((need) => `<li>${need}</li>`).join('')}
              </ul>
            </div>

            <div>
              <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text-secondary);display:block;margin-bottom:6px;">
                3. Dampak Terhadap Scope & Kontrak:
              </span>
              <ul style="list-style-type:disc;padding-left:18px;color:var(--text-secondary);display:flex;flex-direction:column;gap:4px;">
                ${activePreviewDoc.technicalScope.map((scope) => `<li>${scope}</li>`).join('')}
              </ul>
            </div>

            <div>
              <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text-secondary);display:block;margin-bottom:6px;">
                4. Action Items & PIC Tindak Lanjut:
              </span>
              <div style="border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;">
                ${activePreviewDoc.actionItems.map((act) => `
                  <div style="padding:10px 14px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);border-bottom:1px solid var(--border-light);">
                    <div>
                      <strong style="color:var(--text-primary);display:block;">${act.task}</strong>
                      <span style="font-size:10px;color:var(--text-muted);">PIC: ${act.pic}</span>
                    </div>
                    <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--indigo-500);">
                      Target: ${act.due}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:12px;border-top:1px solid var(--border);">
            <button id="btn-dismiss-summary" class="btn btn-secondary btn-sm" style="font-weight:600;">
              Tutup
            </button>
            <button id="btn-save-summary-note" class="btn btn-primary btn-sm" style="font-weight:700;">
              Simpan ke Catatan Internal Lead
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="display:flex;flex-direction:column;gap:20px;">
      <!-- 1. Voice Note Recorder Section -->
      <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:var(--radius-lg);background:linear-gradient(135deg, var(--red-500), var(--indigo-600));color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(239,68,68,.3);">
              ${ICONS.mic}
            </div>
            <div>
              <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);">
                Fitur Voice Note & AI Audio-to-Document
              </h3>
              <p style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                Rekam suara langsung atau unggah berkas audio → AI otomatis meringkas notulen menjadi poin-poin dokumen terstruktur.
              </p>
            </div>
          </div>

          <!-- Record Trigger Button -->
          <div>
            ${!isRecording ? `
              <button id="btn-start-vn-record" class="btn btn-danger" style="font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:6px;">
                <span>🎙 Mulai Rekam Voice Note</span>
              </button>
            ` : `
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--radius-md);background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:var(--red-500);font-family:var(--font-mono);font-size:12px;font-weight:700;">
                  <span style="width:8px;height:8px;border-radius:var(--radius-full);background-color:var(--red-500);animation:pulse 1s infinite;"></span>
                  <span id="recording-timer-badge">Merekam: ${formatTimer(recordingSeconds)}</span>
                </div>
                <button id="btn-stop-vn-record" class="btn btn-secondary" style="font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:6px;background:var(--slate-800);color:#ffffff;border-color:var(--slate-700);">
                  <span>⏹ Berhenti & Simpan</span>
                </button>
              </div>
            `}
          </div>
        </div>

        <!-- Voice Notes Stream -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${voiceNotesHtml}
        </div>
      </div>

      <!-- 2. Attached Files & Repositories -->
      <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:var(--indigo-500);">${ICONS.fileText}</span>
            <h3 style="font-size:14px;font-weight:800;color:var(--text-primary);">
              Lampiran Berkas Dokumen & Audio Terkait Proyek
            </h3>
          </div>

          <label class="btn btn-secondary btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-weight:700;">
            ${ICONS.upload}
            <span>+ Unggah Berkas Baru</span>
            <input type="file" id="file-upload-input" style="display:none;" />
          </label>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;">
          ${attachedFilesHtml}
        </div>
      </div>

      <!-- 3. AI Summary Modal Preview -->
      ${previewModalHtml}
    </div>
  `;
}

export function bindVoiceNoteAndDocsEvents(container, onAddNote) {
  // Start recording
  const startBtn = container.querySelector('#btn-start-vn-record');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      isRecording = true;
      recordingSeconds = 0;
      recordingTimer = setInterval(() => {
        recordingSeconds++;
        const timerBadge = container.querySelector('#recording-timer-badge');
        if (timerBadge) {
          timerBadge.textContent = `Merekam: ${formatTimer(recordingSeconds)}`;
        }
      }, 1000);
      container.innerHTML = renderVoiceNoteAndDocs();
      bindVoiceNoteAndDocsEvents(container, onAddNote);
    });
  }

  // Stop recording
  const stopBtn = container.querySelector('#btn-stop-vn-record');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      isRecording = false;
      if (recordingTimer) clearInterval(recordingTimer);
      const dur = recordingSeconds > 0 ? recordingSeconds : 15;
      const newVn = {
        id: `vn-${Date.now()}`,
        title: `Voice Note: Rekaman Suara Sales Baru (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        durationSeconds: dur,
        recordedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        transcript:
          'Klien mengonfirmasi persetujuan termin pembayaran 30% Down Payment dan 40% UAT. Meminta klausul garansi SLA diperpanjang dari 60 hari menjadi 90 hari.',
      };
      voiceNotes = [newVn, ...voiceNotes];
      container.innerHTML = renderVoiceNoteAndDocs();
      bindVoiceNoteAndDocsEvents(container, onAddNote);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Voice Note berhasil direkam & disimpan!', type: 'success' },
      }));
    });
  }

  // Play/Pause audio simulation
  container.querySelectorAll('.btn-audio-play[data-vn-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vnId = btn.dataset.vnId;
      isPlayingAudioId = isPlayingAudioId === vnId ? null : vnId;
      container.innerHTML = renderVoiceNoteAndDocs();
      bindVoiceNoteAndDocsEvents(container, onAddNote);
    });
  });

  // Summarize via AI
  container.querySelectorAll('.btn-vn-summarize[data-vn-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vnId = btn.dataset.vnId;
      const vn = voiceNotes.find((v) => v.id === vnId);
      if (!vn) return;

      isSummarizingId = vnId;
      container.innerHTML = renderVoiceNoteAndDocs();
      bindVoiceNoteAndDocsEvents(container, onAddNote);

      setTimeout(() => {
        const summaryDoc = {
          title: `Dokumen Hasil Transkrip & Rangkuman AI - ${vn.title}`,
          executiveSummary: `Berdasarkan rekaman suara berdurasi ${vn.durationSeconds} detik, klien menyetujui seluruh parameter scope inti dan meminta penyesuaian klausul garansi serta penjadwalan meeting lanjutan.`,
          clientNeeds: [
            'Penyetujuan skema termin pembayaran 30/40/30 sesuai penawaran',
            'Penyesuaian Pasal 11 MoU: Masa garansi pemeliharaan 90 hari kalender',
            'Penyediaan PIC pendampingan onsite saat hari pertama UAT',
          ],
          technicalScope: [
            'Klausul MoU Pasal 11: Warranty SLA 90 hari',
            'Setting TOP Termin 1 DP 30% dan Termin 2 UAT 40%',
          ],
          actionItems: [
            { task: 'Perbarui Pasal 11 MoU pada dokumen Quotation', pic: 'Legal Officer', due: 'Besok' },
            { task: 'Kirim draft kontrak final bertanda tangan', pic: 'Asisyah Sarah Azzahra', due: '22 Okt 2026' },
          ],
        };

        vn.aiSummaryDoc = summaryDoc;
        isSummarizingId = null;
        activePreviewDoc = summaryDoc;
        container.innerHTML = renderVoiceNoteAndDocs();
        bindVoiceNoteAndDocsEvents(container, onAddNote);
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Transkrip & Ringkasan Dokumen AI berhasil digenerate!', type: 'success' },
        }));
      }, 1000);
    });
  });

  // Preview summary
  container.querySelectorAll('.btn-preview-summary[data-vn-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vnId = btn.dataset.vnId;
      const vn = voiceNotes.find((v) => v.id === vnId);
      if (vn && vn.aiSummaryDoc) {
        activePreviewDoc = vn.aiSummaryDoc;
        container.innerHTML = renderVoiceNoteAndDocs();
        bindVoiceNoteAndDocsEvents(container, onAddNote);
      }
    });
  });

  // Modal dismiss buttons
  const closeSummaryBtn = container.querySelector('#btn-close-summary-modal');
  const dismissSummaryBtn = container.querySelector('#btn-dismiss-summary');
  const modalBackdrop = container.querySelector('#summary-doc-modal-backdrop');

  [closeSummaryBtn, dismissSummaryBtn, modalBackdrop].forEach((el) => {
    if (el) {
      el.addEventListener('click', () => {
        activePreviewDoc = null;
        container.innerHTML = renderVoiceNoteAndDocs();
        bindVoiceNoteAndDocsEvents(container, onAddNote);
      });
    }
  });

  // Save to internal notes
  const saveNoteBtn = container.querySelector('#btn-save-summary-note');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      if (activePreviewDoc && typeof onAddNote === 'function') {
        onAddNote(`[Hasil AI Audio Summary] ${activePreviewDoc.executiveSummary}`);
      }
      activePreviewDoc = null;
      container.innerHTML = renderVoiceNoteAndDocs();
      bindVoiceNoteAndDocsEvents(container, onAddNote);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Rangkuman dokumen berhasil disimpan ke Catatan Internal Lead!', type: 'success' },
      }));
    });
  }

  // File Upload input
  const fileInput = container.querySelector('#file-upload-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const f = files[0];
      const isAudio = f.type.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.wav');
      const newFile = {
        id: `f-${Date.now()}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: isAudio ? 'audio' : 'document',
        uploadedAt: 'Hari ini',
      };
      attachedFiles = [newFile, ...attachedFiles];
      container.innerHTML = renderVoiceNoteAndDocs();
      bindVoiceNoteAndDocsEvents(container, onAddNote);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Berkas "${f.name}" berhasil diunggah!`, type: 'success' },
      }));
    });
  }

  // File Download
  container.querySelectorAll('.btn-file-download[data-file-name]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fName = btn.dataset.fileName;
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Mengunduh berkas ${fName}...`, type: 'info' },
      }));
    });
  });
}
