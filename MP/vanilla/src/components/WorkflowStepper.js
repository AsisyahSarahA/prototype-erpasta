/**
 * WorkflowStepper Component (100% Native Vanilla JS ES Module)
 * Compact, proportional banner for Software House End-to-End SOP Workflow:
 * - Collapsed by default: single sleek 34px bar saving maximum vertical room for Kanban/Roadmap.
 * - Expanded on click: full interactive pipeline cards with 6 stages and principles footnote.
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';

export class WorkflowStepper {
  constructor() {
    this.container = document.createElement('section');
    this.container.className = 'workflow-stepper';
    this.container.setAttribute('aria-label', 'SOP Workflow Banner');
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  render() {
    const state = store.getState();
    const isExpanded = state.isStepperExpanded;
    const activeFlow = state.activeFlow;

    this.container.innerHTML = `
      <div class="workflow-stepper__card">
        <!-- 1. Sleek Single-Row Header -->
        <div class="workflow-stepper__header">
          <div class="workflow-stepper__left">
            <span class="workflow-stepper__tag">SOP</span>
            <!-- Segmented Flow Switcher -->
            <div class="workflow-stepper__segmented">
              <button
                class="workflow-stepper__segment-btn ${activeFlow === 'flowB' ? 'workflow-stepper__segment-btn--active' : ''}"
                data-flow="flowB"
                title="Alur Standar Penanganan Bug & QA Garansi"
              >
                <i class="fi fi-rr-shield-check"></i> SOP Bug &amp; QA
              </button>
              <button
                class="workflow-stepper__segment-btn ${activeFlow === 'flowA' ? 'workflow-stepper__segment-btn--active' : ''}"
                data-flow="flowA"
                title="Alur CRM Closing menuju Proyek & Penagihan Termin"
              >
                <i class="fi fi-rr-briefcase"></i> CRM &rarr; PM &rarr; Finance
              </button>
            </div>

            <!-- Compact 1-Line Preview in Header -->
            <div class="workflow-stepper__compact-preview">
              ${activeFlow === 'flowB' ? `
                <span class="workflow-step-pill">1. Intake</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">2. Triage SLA</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">3. Fix AI</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">4. Review PR</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">5. QA Staging</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill workflow-step-pill--guard">6. Prod Guard</span>
              ` : `
                <span class="workflow-step-pill">1. Deal Won</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">2. Repo Git</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">3. Alokasi Dev</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill">4. Sprint Board</span>
                <span class="workflow-stepper__sep">›</span>
                <span class="workflow-step-pill workflow-step-pill--guard">5. Termin (&gt;10%)</span>
              `}
            </div>
          </div>

          <div class="workflow-stepper__right">
            <button id="stepperSopGuideBtn" class="workflow-stepper__btn workflow-stepper__btn--guide" title="Buku Panduan Standar SOP Software House">
              ${Icons.bookOpen('', 13)}
              <span>Panduan SOP</span>
            </button>

            <button id="stepperSimulasiBtn" class="workflow-stepper__btn workflow-stepper__btn--sim" title="Simulasi Laporan Masuk">
              <span style="color: #f59e0b">${Icons.zap('', 13)}</span>
              <span>Simulasi</span>
            </button>

            <button id="stepperToggleExpandBtn" class="workflow-stepper__btn workflow-stepper__btn--toggle" title="${isExpanded ? 'Tutup Detail Peta Alur' : 'Buka Detail Peta Alur'}">
              <span>${isExpanded ? 'Tutup Peta' : 'Peta Alur'}</span>
              ${isExpanded ? Icons.chevronUp('', 12) : Icons.chevronDown('', 12)}
            </button>
          </div>
        </div>

        <!-- 2. Expanded Pipeline Details (When Toggled) -->
        ${isExpanded ? `
          <div class="workflow-stepper__expanded">
            ${activeFlow === 'flowB' ? `
              <div class="workflow-stepper__expanded-grid">
                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Fase 1</span>
                    <span class="workflow-card__badge">Intake</span>
                  </div>
                  <div class="workflow-card__title">1. Laporan Masuk (Sentry/WA)</div>
                  <p class="workflow-card__desc">Webhook otomatis menampung crash report dan pesan komplain klien.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Fase 2</span>
                    <span class="workflow-card__badge" style="background: #fef3c7; color: #b45309;">Triage SLA</span>
                  </div>
                  <div class="workflow-card__title">2. Klasifikasi S1–S4</div>
                  <p class="workflow-card__desc">PM / Tech Lead mengklasifikasi SLA garansi dan menetapkan PIC.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Fase 3</span>
                    <span class="workflow-card__badge" style="background: #ede9fe; color: #6d28d9;">Fixing</span>
                  </div>
                  <div class="workflow-card__title">3. Fix AI vs Engineer</div>
                  <p class="workflow-card__desc">Bug minor/menengah difix otomatis, bug arsitektur dikerjakan dev.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Fase 4</span>
                    <span class="workflow-card__badge" style="background: #fee2e2; color: #b91c1c;">Review</span>
                  </div>
                  <div class="workflow-card__title">4. Code Review &amp; CI</div>
                  <p class="workflow-card__desc">Pull Request via GitHub, linting otomatis, dan sonar quality gate.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Fase 5</span>
                    <span class="workflow-card__badge" style="background: #f3e8ff; color: #7e22ce;">QA</span>
                  </div>
                  <div class="workflow-card__title">5. QA Staging Sign-Off</div>
                  <p class="workflow-card__desc">Verifikasi manual dan smoke testing pada server Staging.</p>
                </div>

                <div class="workflow-card workflow-card--highlight">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Fase 6</span>
                    <span class="workflow-card__badge" style="background: #d1fae5; color: #047857;">Prod Guard</span>
                  </div>
                  <div class="workflow-card__title">6. Rilis Prod &amp; RCA</div>
                  <p class="workflow-card__desc">Deployment zero-downtime, guard canary, dan dokumen RCA.</p>
                </div>
              </div>

              <div class="workflow-stepper__footnote">
                <span>Prinsip Utama: <strong>Manusia berwenang penuh.</strong> Tidak ada rilis production tanpa QA sign-off dan Tech Lead approval.</span>
                <button class="workflow-stepper__footnote-link" id="stepperGoKanban">Buka Board Kanban →</button>
              </div>
            ` : `
              <div class="workflow-stepper__expanded-grid">
                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Tahap 1</span>
                    <span class="workflow-card__badge">CRM</span>
                  </div>
                  <div class="workflow-card__title">1. Deal Won Closing</div>
                  <p class="workflow-card__desc">Kesepakatan project deal disetujui klien dan kontrak ditandatangani.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Tahap 2</span>
                    <span class="workflow-card__badge" style="background: #dbeafe; color: #1d4ed8;">Git Init</span>
                  </div>
                  <div class="workflow-card__title">2. Konversi Repo &amp; Branch</div>
                  <p class="workflow-card__desc">Repository GitHub diinisialisasi beserta branch main dan staging.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Tahap 3</span>
                    <span class="workflow-card__badge" style="background: #ede9fe; color: #6d28d9;">Alokasi</span>
                  </div>
                  <div class="workflow-card__title">3. Alokasi Multi-Modul</div>
                  <p class="workflow-card__desc">Developer dialokasikan ke modul epik secara paralel sesuai keahlian.</p>
                </div>

                <div class="workflow-card">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Tahap 4</span>
                    <span class="workflow-card__badge" style="background: #fef3c7; color: #b45309;">Sprint</span>
                  </div>
                  <div class="workflow-card__title">4. Papan Sprint &amp; Task</div>
                  <p class="workflow-card__desc">Pengerjaan fitur mingguan dengan estimasi jam terukur.</p>
                </div>

                <div class="workflow-card workflow-card--highlight">
                  <div class="workflow-card__header">
                    <span class="workflow-card__step">Tahap 5</span>
                    <span class="workflow-card__badge" style="background: #d1fae5; color: #047857;">Finance</span>
                  </div>
                  <div class="workflow-card__title">5. Invoice Termin (>10%)</div>
                  <p class="workflow-card__desc">Invoice termin otomatis dibuat saat progres valid melampaui milestone.</p>
                </div>
              </div>

              <div class="workflow-stepper__footnote">
                <span>Konversi otomatis: Satu developer dapat memegang lebih dari satu modul secara paralel saat konversi CRM dilakukan.</span>
                <button class="workflow-stepper__footnote-link" id="stepperGoCrm">Buka CRM Deals →</button>
              </div>
            `}
          </div>
        ` : ''}
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Segment switcher
    this.container.querySelectorAll('.workflow-stepper__segment-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const flow = btn.getAttribute('data-flow');
        if (flow) store.setActiveFlow(flow);
      });
    });

    // Expand toggle
    const toggleBtn = this.container.querySelector('#stepperToggleExpandBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        store.toggleStepperExpanded();
      });
    }

    // SOP Guide modal
    const sopBtn = this.container.querySelector('#stepperSopGuideBtn');
    if (sopBtn) {
      sopBtn.addEventListener('click', () => {
        store.openSopGuideModal();
      });
    }

    // Simulasi Laporan
    const simBtn = this.container.querySelector('#stepperSimulasiBtn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        store.openIntakeModal();
      });
    }

    // Footnote navigation links
    const goKanban = this.container.querySelector('#stepperGoKanban');
    if (goKanban) {
      goKanban.addEventListener('click', () => store.setActiveTab('kanban'));
    }

    const goCrm = this.container.querySelector('#stepperGoCrm');
    if (goCrm) {
      goCrm.addEventListener('click', () => store.setActiveTab('crm'));
    }
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
