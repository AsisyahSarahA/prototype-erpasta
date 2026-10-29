/**
 * SopGuideModal.js
 * End-to-End SOP & Engineering Workflow Guide Modal in 100% Native Vanilla JS.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class SopGuideModal {
  constructor(options = {}) {
    this.isOpen = false;
    this.activeStep = 1;
    this.onNavigateTab = options.onNavigateTab || (() => {});

    this.element = document.createElement('div');
    this.element.className = 'sop-modal-overlay';
    this.element.style.display = 'none';

    this.bindEvents();

    store.subscribe((state) => {
      if (state.isSopGuideModalOpen && !this.isOpen) {
        this.open();
      } else if (!state.isSopGuideModalOpen && this.isOpen) {
        this.isOpen = false;
        this.element.style.display = 'none';
      }
    });
  }

  getElement() {
    return this.element;
  }

  open(step = 1) {
    this.activeStep = step;
    this.isOpen = true;
    this.element.style.display = 'flex';
    this.render();
  }

  close() {
    this.isOpen = false;
    this.element.style.display = 'none';
    store.closeSopGuideModal();
  }

  render() {
    if (!this.isOpen) return;

    const steps = [
      {
        step: 1,
        title: '1. Inbound Klien & CRM Deals',
        badge: 'CRM Intake',
        tab: 'crm',
        label: 'Buka Modul CRM Deals',
        desc: 'Proses penerimaan proyek baru dari calon klien hingga status Deal Won / Closing.',
        points: [
          'Klien mengajukan kebutuhan spesifikasi sistem (contoh: Perpustakaan Digital Kampus atau POS Multi-Outlet). Kebutuhan dicatat dalam CRM Deal.',
          'Project Manager bersama Tech Lead menyusun proposal teknis dan membagi arsitektur modul.',
          'Saat status deal menjadi "Closing/Won", klien menyetujui kontrak fixed price dan termin penagihan.'
        ]
      },
      {
        step: 2,
        title: '2. Otomatisasi Git & Branch Per Modul',
        badge: 'Git Provisioning',
        tab: 'github',
        label: 'Lihat Konfigurasi GitHub',
        desc: 'Sistem secara otomatis menginisialisasi repository GitHub dan membuat branch terisolasi per modul.',
        points: [
          'Tombol "Konversi ke Proyek" di CRM otomatis mengenerate repository GitHub dengan branch main, staging, dan feature/* terisolasi.',
          'Mencegah merge conflict antar developer spesialis backend vs frontend.',
          'Integrasi webhook GitHub CI/CD disinkronkan langsung ke papan Kanban.'
        ]
      },
      {
        step: 3,
        title: '3. Backlog, Sprint & Alokasi 5 Role Tim',
        badge: 'Sprint Planning',
        tab: 'backlog',
        label: 'Buka Backlog & Sprint',
        desc: 'Pemecahan Epics ke User Stories, estimasi jam kerja, dan pembagian tugas ke 5 spesialis.',
        points: [
          'Tugas didistribusikan secara proporsional kepada: PM, Backend Dev, Frontend Dev, DevOps Engineer, dan QA Engineer.',
          'Pekerjaan dibagi dalam sprint 2 mingguan (Sprint 1: Core Backend & Gateway, Sprint 2: Frontend & Integrasi).',
          'Pemantauan kapasitas workload mingguan (standar 40 jam) di modul HR.'
        ]
      },
      {
        step: 4,
        title: '4. Siklus Kanban & AI Auto-Fixer',
        badge: 'Engineering & AI',
        tab: 'ai_hub',
        label: 'Buka AI Automation Hub',
        desc: 'Pelaksanaan sprint harian dengan automasi investigasi bug dan PR generator Claude AI.',
        points: [
          'Developer memindahkan kartu task dari Backlog ke In Progress, Code Review, dan QA.',
          'Laporan bug otomatis diinvestigasi oleh Intelligent Orchestrator AI.',
          'AI Agent Claude menganalisis akar masalah, menghasilkan diff patch code, dan membuat Pull Request perbaikan otomatis.'
        ]
      },
      {
        step: 5,
        title: '5. Multi-Stage Deployment & QA Sign-Off',
        badge: 'CI/CD & Testing',
        tab: 'kanban',
        label: 'Buka Kanban Board',
        desc: 'Verifikasi kualitas ketat di Staging environment sebelum rilis ke Production.',
        points: [
          'Deploy ke Staging memicu automated regression test dan K6 stress testing.',
          'QA Lead melakukan sign-off UAT bersama stakeholder sebelum fitur diizinkan masuk ke Production.',
          'Sistem dilengkapi fasilitas 1-Click Rollback jika terdeteksi anomali di server live.'
        ]
      },
      {
        step: 6,
        title: '6. Penagihan Termin Progres > 10% & Garansi Klien',
        badge: 'Finance & Handover',
        tab: 'finance',
        label: 'Buka Modul Finance',
        desc: 'Penerbitan tagihan termin custom persen & nominal dengan notifikasi terpadu ke Finance dan CRM.',
        points: [
          'Invoice termin hanya dapat diterbitkan setelah progres proyek diverifikasi melebihi ambang batas 10%.',
          'Sistem otomatis mendispatch notifikasi real-time ganda ke divisi Finance dan divisi CRM.',
          'Portal transparansi klien menampilkan kuota maintenance dan jaminan garansi bug 12 bulan.'
        ]
      }
    ];

    const current = steps.find(s => s.step === this.activeStep) || steps[0];

    this.element.innerHTML = `
      <div class="sop-modal-box">
        <!-- Header -->
        <div style="padding: 18px 24px; border-bottom: 1px solid var(--color-zinc-100); display: flex; align-items: center; justify-content: space-between; background: white;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--color-zinc-900); color: white; display: flex; align-items: center; justify-content: center;">
              ${Icons.bookOpen('', 20)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 15px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">
                  Buku Panduan Standar Operasional Prosedur (SOP)
                </h2>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;">
                  End-to-End Software House PRD
                </span>
              </div>
              <p style="font-size: 12px; color: var(--color-zinc-500); margin: 2px 0 0 0;">
                Tata kelola lengkap alur rekayasa perangkat lunak dari penerimaan klien hingga deployment &amp; penagihan termin.
              </p>
            </div>
          </div>
          <button id="closeSopGuideBtn" style="background: none; border: none; cursor: pointer; color: var(--color-zinc-400); padding: 4px;">
            ${Icons.x('', 18)}
          </button>
        </div>

        <!-- Stepper Navigation Pills -->
        <div style="display: flex; overflow-x: auto; padding: 12px 24px; background: var(--color-zinc-50); border-bottom: 1px solid var(--color-zinc-200); gap: 8px;">
          ${steps.map(s => `
            <button class="sop-step-tab-btn" data-step="${s.step}" style="flex-shrink: 0; padding: 8px 14px; font-size: 12px; border-radius: 10px; border: 1px solid ${this.activeStep === s.step ? 'var(--color-zinc-900)' : 'rgba(228, 228, 231, 0.8)'}; background: ${this.activeStep === s.step ? 'var(--color-zinc-900)' : 'white'}; color: ${this.activeStep === s.step ? 'white' : 'var(--color-zinc-700)'}; font-weight: ${this.activeStep === s.step ? '700' : '500'}; cursor: pointer;">
              Tahap ${s.step}: ${s.badge}
            </button>
          `).join('')}
        </div>

        <!-- Detail Content -->
        <div style="padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
            <div>
              <span style="font-size: 11px; font-weight: 700; color: #4338ca; text-transform: uppercase;">
                Langkah ${current.step} dari 6
              </span>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--color-zinc-900); margin: 4px 0 6px 0;">
                ${current.title}
              </h3>
              <p style="font-size: 13px; color: var(--color-zinc-600); margin: 0; line-height: 1.5;">
                ${current.desc}
              </p>
            </div>

            <button id="sopNavigateModuleBtn" data-tab="${current.tab}" class="finance-btn-primary" style="flex-shrink: 0;">
              <span>${current.label}</span>
              ${Icons.arrowRight('', 14)}
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${current.points.map((p, idx) => `
              <div style="padding: 14px 16px; border-radius: 12px; background: var(--color-zinc-50); border: 1px solid rgba(228, 228, 231, 0.8); display: flex; gap: 12px; align-items: flex-start;">
                <div style="width: 22px; height: 22px; border-radius: 6px; background: var(--color-zinc-900); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">
                  ${idx + 1}
                </div>
                <p style="font-size: 12px; color: var(--color-zinc-700); margin: 0; line-height: 1.5;">
                  ${p}
                </p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 14px 24px; border-top: 1px solid var(--color-zinc-100); background: var(--color-zinc-50); display: flex; justify-content: space-between; align-items: center;">
          <button id="sopPrevStepBtn" ${this.activeStep === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} class="finance-btn-secondary">
            ${Icons.chevronLeft('', 14)}
            <span>Langkah Sebelumnya</span>
          </button>
          <button id="sopNextStepBtn" ${this.activeStep === 6 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} class="finance-btn-secondary">
            <span>Langkah Selanjutnya</span>
            ${Icons.chevronRight('', 14)}
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element || e.target.closest('#closeSopGuideBtn')) {
        this.close();
      }

      const stepTab = e.target.closest('.sop-step-tab-btn');
      if (stepTab) {
        this.activeStep = parseInt(stepTab.dataset.step, 10);
        this.render();
      }

      if (e.target.closest('#sopPrevStepBtn') && this.activeStep > 1) {
        this.activeStep--;
        this.render();
      }

      if (e.target.closest('#sopNextStepBtn') && this.activeStep < 6) {
        this.activeStep++;
        this.render();
      }

      const navBtn = e.target.closest('#sopNavigateModuleBtn');
      if (navBtn) {
        const tab = navBtn.dataset.tab;
        this.close();
        store.setActiveTab(tab);
      }
    });
  }
}
