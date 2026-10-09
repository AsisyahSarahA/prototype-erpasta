/**
 * Astacode ERP - Marketing & AI Content Engine Module Script
 * Features:
 * - 7-Day Sprint Planner Matrix & Smart On-Demand Token Execution
 * - Dynamic Multi-Modal Preview Studio (Carousel, Video TikTok/Reels, Blog SEO, Single Post)
 * - Approval Queue Workflow & Interactive Modals
 * - Omnichannel Inbox Interactive AI Chat Tester
 * - Brand Asset Library Dynamic Detail Inspector
 * - Social Listening & Competitor AI Action Triggers
 * - Performance Analytics Charts & Realtime UI Toasts
 */

/// Global Toast System (Max 3 toasts to prevent UI flooding)
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Limit active toasts to 2 max
    while (container.children.length >= 2) {
        container.removeChild(container.firstChild);
    }

    const toast = document.createElement('div');
    toast.className = `erp-toast toast-${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    else if (type === 'warning') icon = 'fa-triangle-exclamation';
    else if (type === 'danger') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
};

// Data Store for 7-Day Sprint & Generated Content Mockups
const sprintData = {
    1: {
        day: "Senin, 28 Okt 2026",
        dateKey: "2026-10-28",
        topic: "Kenapa Next.js 14 adalah Standar Baru Frontend Engineer",
        format: "carousel",
        time: "10:00",
        platform: "Instagram",
        status: "ready",
        slides: [
            { num: "Slide 1/5", title: "Kenapa Next.js 14 Jadi Standar Baru Frontend di 2026? 🚀", subtitle: "Geser ke kanan 👉", bg: "linear-gradient(135deg, #1e3a8a, #3b82f6)", isCover: true },
            { num: "Slide 2/5", title: "1. Server Components (RSC)", desc: "Zero bundle size untuk data fetching. Loading 3x lebih cepat tanpa waterfall!", icon: "fa-code" },
            { num: "Slide 3/5", title: "2. Server Actions Bawaan", desc: "Mutasi data langsung dari komponen tanpa ribet bikin REST endpoint terpisah.", icon: "fa-bolt" },
            { num: "Slide 4/5", title: "3. Built-in SEO & OpenGraph", desc: "Generate dynamic metadata & social share image secara otomatis per rute.", icon: "fa-magnifying-glass" },
            { num: "Slide 5/5", title: "Sudahkah Tim Kamu Migrasi?", desc: "Tulis opini dan pengalaman kalian di kolom komentar ya! 👇", bg: "linear-gradient(135deg, #0f172a, #1e293b)", isCta: true }
        ],
        caption: `Masih pakai React SPA biasa dan pusing mikirin konfigurasi routing + SEO? 🤔\n\nSaatnya kenalan sama Next.js 14 dengan App Router & Server Actions! Ini dia 3 alasan kenapa stack ini bikin website perusahaan kamu makin ngebut, aman, dan siap scale!\n\nGeser ke kanan untuk rincian lengkapnya ya 👉\n\nAda yang tim Next.js atau masih setia dengan Vite? Yuk diskusi di kolom komentar! 👇\n\n#NextJS #WebDevelopment #ReactJS #Fullstack #FrontendDev #AstacodeTech`
    },
    2: {
        day: "Selasa, 29 Okt 2026",
        dateKey: "2026-10-29",
        topic: "3 Fitur Rahasia Laravel 11 yang Bikin Developer Bengong 😱",
        format: "video",
        time: "19:00",
        platform: "TikTok & Reels",
        status: "ready",
        videoHook: "Zaman sekarang bikin API Laravel masih ngetik puluhan baris boilerplate? Stop! 🛑",
        videoDuration: "45 Detik",
        videoScript: `[0-3s Hook]: Jangan deploy Laravel 11 sebelum kamu tau 3 fitur gila ini!\n[4-15s Point 1]: Pertama, Slim Skeleton! Struktur folder makin ramping, routing & middleware sekarang terpusat di bootstrap/app.php!\n[16-30s Point 2]: Kedua, Model Casts Method. Bye bye array casts lama, sekarang autocomplete IDE jauh lebih sakti.\n[31-40s Point 3]: Ketiga, Per-second Rate Limiting bawaan tanpa Redis ribet.\n[41-45s CTA]: Save video ini biar kodingan backend kamu makin sat-set! Follow @astacode untuk tips tech harian!`,
        caption: `Laravel 11 beneran game changer banget buat developer PHP modern! 🔥\n\nStrukturnya makin minimalis tapi performanya makin buas. Simak 3 fitur rahasianya di video ini!\n\nKalian udah cobain migrate ke Laravel 11 belum nih?\n\n#Laravel11 #PHPDeveloper #WebDevelopment #BackendTips #Astacode`
    },
    3: {
        day: "Rabu, 30 Okt 2026",
        dateKey: "2026-10-30",
        topic: "Arsitektur Microservices vs Monolith di 2026: Kapan Harus Pindah?",
        format: "carousel",
        time: "18:00",
        platform: "Instagram",
        status: "planned",
        slides: [
            { num: "Slide 1/4", title: "Microservices vs Modular Monolith: Mana yang Cocok Buat Proyekmu?", subtitle: "Swipe untuk panduan arsitektur 👉", bg: "linear-gradient(135deg, #0f766e, #14b8a6)", isCover: true },
            { num: "Slide 2/4", title: "Mitos Microservices", desc: "Bukan berarti selalu lebih cepat. Biaya network latency & maintenance server justru bisa bengkak jika tim masih kecil.", icon: "fa-triangle-exclamation" },
            { num: "Slide 3/4", title: "Kapan Waktu Tepat Pindah?", desc: "Pindah saat tim engineer sudah di atas 20+ orang dan domain bisnis mulai terpisah tegas.", icon: "fa-users" },
            { num: "Slide 4/4", title: "Kesimpulan Arsitektur", desc: "Mulai dari Modular Monolith yang rapi terlebih dahulu sebelum memecah service.", bg: "linear-gradient(135deg, #1e293b, #334155)", isCta: true }
        ],
        caption: `Jangan terburu-buru adopsi Microservices kalau tim kamu masih 3 orang! 😅\n\nBanyak perusahaan tech boncos server karena premature optimization. Pelajari matriks perbandingan arsitektur di slide ini.\n\n#SoftwareArchitecture #Microservices #SystemDesign #DevOps #Astacode`
    },
    4: {
        day: "Kamis, 31 Okt 2026",
        dateKey: "2026-10-31",
        topic: "Beda Koding Pakai AI Agent vs Prompting ChatGPT Biasa",
        format: "video",
        time: "12:30",
        platform: "TikTok & Reels",
        status: "planned",
        videoHook: "Kalau kamu masih copas codingan dari ChatGPT bolak-balik ke VS Code, kamu udah ketinggalan!",
        videoDuration: "50 Detik",
        videoScript: `[0-3s Hook]: Ini beda programmer 2023 vs programmer 2026 yang pakai AI Agents!\n[4-20s Penjelasan]: ChatGPT biasa cuma tau teks yang kamu kasih. Sedangkan AI Agent terhubung langsung ke repo, bisa linter test, compile error, dan auto-fix bugs secara mandiri.\n[21-40s Contoh Nyata]: Di Astacode ERP, AI Agent kami memperbaiki tiket bug dan bikin PR otomatis dalam 30 detik.\n[41-50s CTA]: Mau tau cara pasang AI Agent di tim kamu? Cek link di bio!`,
        caption: `Era baru AI Assisted Software Engineering telah tiba! 🤖✨\n\nAI Agent bukan cuma pelengkap prompt, tapi partner pair-programming otonom.\n\n#AIAgents #ArtificialIntelligence #CodingLife #SoftwareEngineer #TechIndo`
    },
    5: {
        day: "Jumat, 01 Nov 2026",
        dateKey: "2026-11-01",
        topic: "Panduan Lengkap Optimasi Database Query Postgres untuk ERP Skala Besar",
        format: "blog",
        time: "09:00",
        platform: "Blog CMS & SEO",
        status: "planned",
        seoScore: "94/100",
        metaTitle: "Optimasi Query PostgreSQL untuk ERP & Enterprise: Panduan 2026",
        metaDesc: "Pelajari teknik indexing B-Tree vs BRIN, connection pooling pgBouncer, dan EXPLAIN ANALYZE untuk mempercepat database ERP hingga 10x lipat.",
        caption: `[Artikel Blog Siap Terbit]\n\nJudul: Panduan Lengkap Optimasi Database PostgreSQL Skala Besar\nTarget Keyword: Optimasi PostgreSQL, Database ERP, EXPLAIN ANALYZE\nEstimasi Waktu Baca: 6 Menit\nStatus: Siap Sync ke Headless Blog CMS.`
    },
    6: {
        day: "Sabtu, 02 Nov 2026",
        dateKey: "2026-11-02",
        topic: "Meme: Perasaan Saat Deployment Hari Jumat Jam 5 Sore 💀",
        format: "single",
        time: "20:00",
        platform: "Instagram & X",
        status: "planned",
        caption: `Aturan nomor satu programmer: JANGAN SEKALI-KALI DEPLOY HARI JUMAT JAM 5 SORE KALAU MAU WEEKEND TENANG! 😂🔥\n\nTag teman kamu yang hobi ngetest nyali di server production 👇\n\n#ProgrammerHumor #DevLife #Ngoding #WeekendDeveloper #Astacode`
    },
    7: {
        day: "Minggu, 03 Nov 2026",
        dateKey: "2026-11-03",
        topic: "Weekly Tech Digest: Rangkuman Kabar AI & Framework Minggu Ini",
        format: "carousel",
        time: "19:30",
        platform: "Instagram",
        status: "planned",
        slides: [
            { num: "Slide 1/4", title: "Tech Weekly Digest #42: Rangkuman Berita Teknologi Minggu Ini", subtitle: "Baca cepat dalam 1 menit 👉", bg: "linear-gradient(135deg, #4338ca, #6366f1)", isCover: true },
            { num: "Slide 2/4", title: "1. OpenAI Rilis Model Penalaran Baru", desc: "Kemampuan debugging kode melonjak 40% pada benchmark HumanEval.", icon: "fa-microchip" },
            { num: "Slide 3/4", title: "2. Tailwind CSS v4 Resmi Dirilis", desc: "Engine berbasis Rust yang 10x lebih cepat tanpa perlu file tailwind.config.js.", icon: "fa-palette" },
            { num: "Slide 4/4", title: "Bagikan ke Teman Programmer", desc: "Simpan postingan ini untuk update tech mingguan terpercaya!", bg: "linear-gradient(135deg, #0f172a, #1e293b)", isCta: true }
        ],
        caption: `Selamat hari Minggu rekan tech! ☕\n\nSebelum mulai sprint hari Senin, yuk simak rangkuman update teknologi penting sepekan terakhir!\n\nBerita mana yang paling menarik perhatianmu?\n\n#TechNews #TailwindCSS #OpenAI #WeeklyDigest #Astacode`
    }
};

// Additional custom scheduled events by Date Key (YYYY-MM-DD)
const customCalendarEvents = {};

let currentPreviewDay = 1;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Logic (SPA)
    initNavigation();

    // 2. 7-Day Sprint Planner Matrix Logic
    initSprintPlanner();

    // 3. Dynamic Preview Studio Handlers
    initPreviewStudio();

    // 4. Omnichannel Inbox Chat & AI Auto-Reply
    initInboxChatTester();

    // 5. Brand Asset Library & DAM Studio Hub
    if (typeof initAssetLibraryHub === 'function') initAssetLibraryHub();

    // 6. Approval Queue Row Actions
    initApprovalQueue();

    // 7. Social Listening Quick AI Trigger
    if (typeof initSocialListeningActions === 'function') initSocialListeningActions();

    // 8. Performance Analytics Chart
    initAnalyticsChart();

    // 9. Initial Preview Render
    renderPreviewForDay(1);

    // 10. Additional Interactive Handlers for Calendar & Distribution
    initCalendarAndDistribution();

    // 11. Comprehensive Multi-Channel Distribution Hub
    if (typeof initDistributionHub === 'function') initDistributionHub();
});

// Calendar Global State
let currentCalMonthIndex = 9; // 0-indexed (9 = Oct)
let currentCalYear = 2026;
let currentCalView = "month"; // "month" or "week"
let currentCalFilter = "all"; // "all", "instagram", "tiktok", "blog"
let selectedCalDayIdx = 1;

const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function initCalendarAndDistribution() {
    // 1. Initial Render
    renderCalendarGrid();

    // 2. Month Navigation Buttons
    const btnPrevMonth = document.getElementById('btnPrevMonth');
    const btnNextMonth = document.getElementById('btnNextMonth');
    const btnTodayMonth = document.getElementById('btnTodayMonth');

    if (btnPrevMonth) {
        btnPrevMonth.addEventListener('click', () => {
            currentCalMonthIndex--;
            if (currentCalMonthIndex < 0) {
                currentCalMonthIndex = 11;
                currentCalYear--;
            }
            updateMonthHeader();
            if (currentCalView === 'month') {
                renderCalendarGrid();
            } else {
                renderWeekGrid();
            }
        });
    }

    if (btnNextMonth) {
        btnNextMonth.addEventListener('click', () => {
            currentCalMonthIndex++;
            if (currentCalMonthIndex > 11) {
                currentCalMonthIndex = 0;
                currentCalYear++;
            }
            updateMonthHeader();
            if (currentCalView === 'month') {
                renderCalendarGrid();
            } else {
                renderWeekGrid();
            }
        });
    }

    if (btnTodayMonth) {
        btnTodayMonth.addEventListener('click', () => {
            currentCalMonthIndex = 9; // Oct
            currentCalYear = 2026;
            updateMonthHeader();
            if (currentCalView === 'month') {
                renderCalendarGrid();
            } else {
                renderWeekGrid();
            }
            window.showToast('📅 Kembali ke bulan berjalan (Oktober 2026)', 'info');
        });
    }

    // 3. View Mode Switcher (Month vs Week)
    const btnViewMonth = document.getElementById('btnViewMonth');
    const btnViewWeek = document.getElementById('btnViewWeek');
    const monthViewContainer = document.getElementById('calendarMonthView');
    const weekViewContainer = document.getElementById('calendarWeekView');

    if (btnViewMonth && btnViewWeek) {
        btnViewMonth.addEventListener('click', () => {
            currentCalView = 'month';
            btnViewMonth.classList.add('active');
            btnViewWeek.classList.remove('active');
            if (monthViewContainer) monthViewContainer.style.display = 'block';
            if (weekViewContainer) weekViewContainer.style.display = 'none';
            renderCalendarGrid();
        });

        btnViewWeek.addEventListener('click', () => {
            currentCalView = 'week';
            btnViewWeek.classList.add('active');
            btnViewMonth.classList.remove('active');
            if (monthViewContainer) monthViewContainer.style.display = 'none';
            if (weekViewContainer) weekViewContainer.style.display = 'block';
            renderWeekGrid();
        });
    }

    // 4. Platform Filter Pills
    document.querySelectorAll('.cal-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cal-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCalFilter = btn.getAttribute('data-filter');
            if (currentCalView === 'month') {
                renderCalendarGrid();
            } else {
                renderWeekGrid();
            }
            window.showToast(`🔍 Filter kalender: ${btn.textContent.trim()}`, 'info');
        });
    });

    // 5. Sync from AI Engine & Add Schedule buttons
    const btnSyncFromEngine = document.getElementById('btnSyncFromEngine');
    if (btnSyncFromEngine) {
        btnSyncFromEngine.addEventListener('click', () => {
            renderCalendarGrid();
            window.showToast('✨ Kalender berhasil disinkronkan dengan data AI Engine terbaru!', 'success');
        });
    }

    const btnAddNewSchedule = document.getElementById('btnAddNewSchedule');
    if (btnAddNewSchedule) {
        btnAddNewSchedule.addEventListener('click', () => {
            openCreateScheduleModal();
        });
    }

    // 6. Create Schedule Modal Form Submit
    const formCreateSchedule = document.getElementById('formCreateSchedule');
    if (formCreateSchedule) {
        formCreateSchedule.addEventListener('submit', (e) => {
            e.preventDefault();
            const topic = document.getElementById('schedInputTopic').value.trim();
            const platform = document.getElementById('schedInputPlatform').value;
            const format = document.getElementById('schedInputFormat').value;
            const date = document.getElementById('schedInputDate').value;
            const time = document.getElementById('schedInputTime').value;
            const caption = document.getElementById('schedInputCaption').value.trim();

            if (!customCalendarEvents[date]) {
                customCalendarEvents[date] = [];
            }

            customCalendarEvents[date].push({
                topic: topic,
                platform: platform,
                format: format,
                date: date,
                time: time,
                caption: caption || `Draf postingan untuk ${topic}.\n#${platform} #Astacode`,
                status: 'ready'
            });

            closeCreateScheduleModal();
            
            // If the date is in a different month, switch to that month
            const [y, m] = date.split('-').map(Number);
            currentCalYear = y;
            currentCalMonthIndex = m - 1;
            updateMonthHeader();
            renderCalendarGrid();

            window.showToast(`✅ Jadwal "${topic.substring(0, 25)}..." berhasil dipasang pada ${date}!`, 'success');
        });
    }

    // 7. Queue Draft Cards Placement
    document.querySelectorAll('.queue-item-card').forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.getAttribute('data-topic');
            const format = card.getAttribute('data-format');
            const time = card.getAttribute('data-time');

            sprintData[3].topic = topic;
            sprintData[3].format = format;
            sprintData[3].time = time;
            sprintData[3].status = 'ready';

            renderCalendarGrid();
            window.showToast(`📌 "${topic.substring(0, 25)}..." berhasil dijadwalkan ke hari Rabu, 30 Okt!`, 'success');
        });
    });

    // 8. Distribution Webhook & Platform Buttons
    document.querySelectorAll('#view-distribution .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.textContent.includes('Hubungkan Webhook')) {
                btn.className = 'status-badge badge-done';
                btn.textContent = 'TERHUBUNG';
                window.showToast('🔗 Webhook Blog WordPress CMS berhasil terhubung!', 'success');
            } else if (btn.textContent.includes('Ulangi')) {
                e.preventDefault();
                window.showToast('🔄 Mengulang proses upload API TikTok...', 'warning');
                setTimeout(() => window.showToast('✅ Upload TikTok berhasil diulang!', 'success'), 1200);
            } else if (btn.textContent.includes('Buat Tes Baru')) {
                window.showToast('🧪 A/B Testing baru untuk Campaign Q4 berhasil dibuat!', 'success');
            } else if (btn.textContent.includes('Segarkan')) {
                window.showToast('🔄 Log publikasi berhasil disegarkan!', 'info');
            }
        });
    });
}

function updateMonthHeader() {
    const title = document.getElementById('calHeaderTitle');
    if (title) title.textContent = `${monthNames[currentCalMonthIndex]} ${currentCalYear}`;
}

// True Universal Calendar Calculation for ANY Month & Year
function renderCalendarGrid() {
    const calendarGrid = document.getElementById('contentCalendarGrid') || document.querySelector('#calendarMonthView .calendar-grid');
    if (!calendarGrid) return;

    let html = `
        <div class="cal-head">SEN</div>
        <div class="cal-head">SEL</div>
        <div class="cal-head">RAB</div>
        <div class="cal-head">KAM</div>
        <div class="cal-head">JUM</div>
        <div class="cal-head">SAB</div>
        <div class="cal-head">MIN</div>
    `;

    // Days in current month
    const totalDaysInMonth = new Date(currentCalYear, currentCalMonthIndex + 1, 0).getDate();
    // Monday-first offset: 0 for Monday, 6 for Sunday
    const firstDayIndex = (new Date(currentCalYear, currentCalMonthIndex, 1).getDay() + 6) % 7;
    // Days in previous month
    const prevMonthDays = new Date(currentCalYear, currentCalMonthIndex, 0).getDate();

    // 1. Render Previous Month Padding Cells
    for (let i = firstDayIndex; i > 0; i--) {
        const prevNum = prevMonthDays - i + 1;
        html += `
            <div class="cal-col" style="background:#fafafa; opacity:0.4;">
                <div class="cal-day-num"><span style="font-size:12px; color:#94a3b8;">${prevNum}</span></div>
                <div class="cal-events"></div>
            </div>
        `;
    }

    // 2. Render Current Month Active Cells
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const monthStr = String(currentCalMonthIndex + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateKey = `${currentCalYear}-${monthStr}-${dayStr}`;

        // Check if today (30 Okt 2026)
        const isToday = (currentCalYear === 2026 && currentCalMonthIndex === 9 && day === 30);

        // Find sprint items for this date
        let events = [];
        for (let idx in sprintData) {
            if (sprintData[idx].dateKey === dateKey && sprintData[idx].topic && !sprintData[idx].topic.includes("Slot Kosong")) {
                events.push({ ...sprintData[idx], dayIdx: idx });
            }
        }

        // Find custom created events for this date
        if (customCalendarEvents[dateKey]) {
            events = events.concat(customCalendarEvents[dateKey]);
        }

        // Apply Platform Filter
        if (currentCalFilter !== 'all') {
            events = events.filter(ev => (ev.platform || '').toLowerCase().includes(currentCalFilter));
        }

        let eventsHtml = '';
        events.forEach(ev => {
            let pillColor = 'pill-purple';
            let icon = 'fa-instagram';

            const pLower = (ev.platform || '').toLowerCase();
            if (ev.format === 'video' || pLower.includes('tiktok')) {
                pillColor = 'pill-dark';
                icon = 'fa-tiktok';
            } else if (ev.format === 'blog' || pLower.includes('blog')) {
                pillColor = 'pill-green';
                icon = 'fa-blog';
            } else if (pLower.includes('facebook') || pLower.includes('meta')) {
                pillColor = 'pill-blue';
                icon = 'fa-facebook';
            } else {
                pillColor = 'pill-orange';
                icon = 'fa-instagram';
            }

            const isExecuted = ev.status === 'ready';

            eventsHtml += `
                <div class="pill-event ${pillColor}" style="${!isExecuted ? 'opacity:0.75; border-style:dashed;' : ''}" title="${ev.topic}" onclick="event.stopPropagation(); ${ev.dayIdx ? `openCalendarDetail(${ev.dayIdx})` : `openCustomEventDetail('${dateKey}', '${ev.topic.replace(/'/g, "\\'")}')`}">
                    <i class="fa-brands ${icon}" style="font-size:11px;"></i> 
                    <span style="font-weight:700; opacity:0.85; font-size:10px; margin-right:2px;">${ev.time || '10:00'}</span> 
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${ev.topic}</span>
                </div>
            `;
        });

        html += `
            <div class="cal-col ${isToday ? 'today' : ''}" style="cursor:pointer;" onclick="openAddEventForDate('${dateKey}')" title="Klik untuk tambah jadwal tanggal ini">
                <div class="cal-day-num">
                    <span style="font-size:12px; font-weight:700;">${day}</span>
                    ${isToday ? '<span style="font-size:9.5px; color:var(--brand-primary); font-weight:700; background:#dbeafe; padding:1px 6px; border-radius:10px;">Hari Ini</span>' : '<span style="font-size:10px; opacity:0; transition:opacity 0.2s;" class="cal-add-hint"><i class="fa-solid fa-plus"></i></span>'}
                </div>
                <div class="cal-events">
                    ${eventsHtml}
                </div>
            </div>
        `;
    }

    // 3. Render Next Month Trailing Padding Cells (To reach full grid rows)
    const totalCellsSoFar = firstDayIndex + totalDaysInMonth;
    const nextPadding = (totalCellsSoFar % 7 === 0) ? 0 : 7 - (totalCellsSoFar % 7);
    for (let nextDay = 1; nextDay <= nextPadding; nextDay++) {
        html += `
            <div class="cal-col" style="background:#fafafa; opacity:0.4;">
                <div class="cal-day-num"><span style="font-size:12px; color:#94a3b8;">${nextDay}</span></div>
                <div class="cal-events"></div>
            </div>
        `;
    }

    calendarGrid.innerHTML = html;
}

// Modal Form & Detail Triggers
window.openCreateScheduleModal = function(defaultDate = "2026-10-30") {
    const modal = document.getElementById('createScheduleModal');
    if (modal) {
        document.getElementById('schedInputDate').value = defaultDate;
        modal.style.display = 'flex';
    }
};

window.closeCreateScheduleModal = function() {
    const modal = document.getElementById('createScheduleModal');
    if (modal) modal.style.display = 'none';
};

window.openAddEventForDate = function(dateKey) {
    openCreateScheduleModal(dateKey);
};

window.openCustomEventDetail = function(dateKey, topic) {
    const events = customCalendarEvents[dateKey] || [];
    const item = events.find(e => e.topic === topic) || events[0];
    if (!item) return;

    const modal = document.getElementById('calendarDetailModal');
    if (!modal) return;

    document.getElementById('calModalTitle').textContent = `Detail Jadwal: ${item.date}`;
    document.getElementById('calModalMeta').textContent = `${item.date} • ${item.time} WIB • ${item.platform}`;
    document.getElementById('calModalTopicText').textContent = item.topic;
    document.getElementById('calModalCaptionText').textContent = item.caption;
    
    const formatSpan = document.getElementById('calModalFormat');
    if (formatSpan) formatSpan.textContent = `Format: ${item.format.toUpperCase()}`;

    const statusBadge = document.getElementById('calModalStatus');
    if (statusBadge) {
        statusBadge.className = 'status-badge badge-done';
        statusBadge.textContent = 'SIAP DIPUBLIKASIKAN';
    }

    modal.style.display = 'flex';
};

// Dynamic Week Days Calculation for Any Month/Year
function getWeekDaysForMonth(year, monthIndex) {
    const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    
    // If October 2026 (demo sprint month), anchor around Oct 30
    let anchorDay = 1;
    if (year === 2026 && monthIndex === 9) anchorDay = 30;

    const anchorDate = new Date(year, monthIndex, anchorDay);
    const dayOfWeek = (anchorDate.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const monday = new Date(anchorDate);
    monday.setDate(anchorDate.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const cur = new Date(monday);
        cur.setDate(monday.getDate() + i);
        
        const y = cur.getFullYear();
        const m = cur.getMonth();
        const d = cur.getDate();
        const fullDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = (y === 2026 && m === 9 && d === 30);
        
        weekDays.push({
            name: dayNames[i],
            date: `${String(d).padStart(2, '0')} ${monthShortNames[m]}`,
            fullDate: fullDate,
            isToday: isToday,
            dayIdx: (year === 2026 && monthIndex === 9) ? (i + 1) : null
        });
    }
    return weekDays;
}

// Render Professional Week View Detailed Columns
function renderWeekGrid() {
    const weekContainer = document.getElementById('weekViewColumns');
    if (!weekContainer) return;

    const days = getWeekDaysForMonth(currentCalYear, currentCalMonthIndex);

    weekContainer.innerHTML = days.map(d => {
        // Collect all posts for this day (from sprintData + customCalendarEvents)
        let dayEvents = [];
        
        if (d.dayIdx && sprintData[d.dayIdx] && sprintData[d.dayIdx].topic && !sprintData[d.dayIdx].topic.includes("Slot Kosong")) {
            dayEvents.push({ ...sprintData[d.dayIdx], dayIdx: d.dayIdx });
        } else {
            // Check sprintData by dateKey
            for (let idx in sprintData) {
                if (sprintData[idx].dateKey === d.fullDate && sprintData[idx].topic && !sprintData[idx].topic.includes("Slot Kosong")) {
                    dayEvents.push({ ...sprintData[idx], dayIdx: idx });
                }
            }
        }

        if (customCalendarEvents[d.fullDate]) {
            dayEvents = dayEvents.concat(customCalendarEvents[d.fullDate]);
        }

        // Apply Platform Filter
        if (currentCalFilter !== 'all') {
            dayEvents = dayEvents.filter(ev => (ev.platform || '').toLowerCase().includes(currentCalFilter));
        }

        // Generate Event Cards HTML
        let cardsHtml = '';
        if (dayEvents.length > 0) {
            cardsHtml = dayEvents.map(item => {
                let platformClass = 'platform-ig';
                let icon = 'fa-instagram';
                let platformLabel = 'Instagram';

                const pLower = (item.platform || '').toLowerCase();
                if (pLower.includes('tiktok') || item.format === 'video') {
                    platformClass = 'platform-tiktok';
                    icon = 'fa-tiktok';
                    platformLabel = 'TikTok';
                } else if (pLower.includes('blog') || item.format === 'blog') {
                    platformClass = 'platform-blog';
                    icon = 'fa-blog';
                    platformLabel = 'Blog SEO';
                } else if (pLower.includes('facebook') || pLower.includes('meta')) {
                    platformClass = 'platform-fb';
                    icon = 'fa-facebook';
                    platformLabel = 'Facebook';
                }

                let formatLabel = 'Carousel';
                if (item.format === 'video') formatLabel = 'Video';
                else if (item.format === 'blog') formatLabel = 'Blog SEO';
                else if (item.format === 'single') formatLabel = 'Single Post';

                const isReady = item.status === 'ready';
                const clickAction = item.dayIdx ? `openCalendarDetail(${item.dayIdx})` : `openCustomEventDetail('${d.fullDate}', '${item.topic.replace(/'/g, "\\'")}')`;

                return `
                    <div class="week-card-item" onclick="${clickAction}">
                        <div class="week-card-top">
                            <span class="platform-chip ${platformClass}">
                                <i class="fa-brands ${icon}"></i> ${platformLabel}
                            </span>
                            <span class="time-badge">
                                <i class="fa-regular fa-clock"></i> ${item.time || '10:00'}
                            </span>
                        </div>
                        <div class="week-card-topic" title="${item.topic}">
                            ${item.topic}
                        </div>
                        <div class="week-card-bottom">
                            <span class="status-badge ${isReady ? 'badge-done' : 'badge-draft'}" style="font-size:9px; padding:2px 5px; border-radius:4px; white-space:nowrap; flex-shrink:0;">
                                <i class="fa-solid ${isReady ? 'fa-check' : 'fa-clock'}"></i> ${isReady ? 'SIAP' : 'DRAF'}
                            </span>
                            <span style="font-size:9.5px; color:#64748b; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:right;">
                                ${formatLabel}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="week-day-col ${d.isToday ? 'is-today-col' : ''}">
                <div class="week-day-header">
                    <div>
                        <div class="week-day-title">
                            <span>${d.name}</span>
                            ${d.isToday ? '<span style="font-size:9.5px; background:#dbeafe; color:#1d4ed8; padding:1px 6px; border-radius:4px; font-weight:700;">HARI INI</span>' : ''}
                        </div>
                        <div class="week-day-date">${d.date}</div>
                    </div>
                    <span class="week-day-badge">${dayEvents.length} Post</span>
                </div>
                
                <div class="week-cards-list">
                    ${cardsHtml || '<div style="font-size:11px; color:#94a3b8; text-align:center; padding:18px 6px; border:1px dashed #e2e8f0; border-radius:6px; background:#fafafa;">Belum ada konten</div>'}
                </div>

                <button class="week-add-slot-btn" onclick="openAddEventForDate('${d.fullDate}')" style="white-space:nowrap;">
                    <i class="fa-solid fa-plus"></i> Tambah Jadwal
                </button>
            </div>
        `;
    }).join('');
}


// Modal Inspection Handlers
window.openCalendarDetail = function(dayIdx) {
    selectedCalDayIdx = dayIdx;
    const item = sprintData[dayIdx];
    if (!item) return;

    const modal = document.getElementById('calendarDetailModal');
    if (!modal) return;

    document.getElementById('calModalTitle').textContent = `Detail Jadwal: ${item.day}`;
    document.getElementById('calModalMeta').textContent = `${item.day} • ${item.time} WIB • ${item.platform}`;
    document.getElementById('calModalTopicText').textContent = item.topic;
    document.getElementById('calModalCaptionText').textContent = item.caption || 'Naskah belum dibuat. Klik Eksekusi AI di tab AI Engine untuk membuat naskah otomatis.';
    
    const formatSpan = document.getElementById('calModalFormat');
    if (formatSpan) formatSpan.textContent = `Format: ${item.format.toUpperCase()} (${item.format === 'carousel' ? '5 Slide' : (item.format === 'video' ? 'Skrip 45s' : 'Artikel Blog')})`;

    const statusBadge = document.getElementById('calModalStatus');
    if (statusBadge) {
        if (item.status === 'ready') {
            statusBadge.className = 'status-badge badge-done';
            statusBadge.textContent = 'SIAP DIPUBLIKASIKAN';
        } else {
            statusBadge.className = 'status-badge badge-draft';
            statusBadge.textContent = 'TERENCANA (0 TOKEN)';
        }
    }

    modal.style.display = 'flex';
};

window.closeCalendarDetailModal = function() {
    const modal = document.getElementById('calendarDetailModal');
    if (modal) modal.style.display = 'none';
};

window.deleteCalendarItem = function() {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal konten ini dari kalender?")) {
        sprintData[selectedCalDayIdx].topic = "Slot Kosong (Bisa dijadwalkan ulang)";
        sprintData[selectedCalDayIdx].status = "planned";
        renderCalendarGrid();
        if (currentCalView === 'week') renderWeekGrid();
        closeCalendarDetailModal();
        window.showToast("🗑️ Jadwal konten berhasil dihapus!", "danger");
    }
};

window.publishNowItem = function() {
    const item = sprintData[selectedCalDayIdx];
    window.showToast(`🚀 Konten "${item.topic.substring(0, 25)}..." berhasil dikirim ke antrean publikasi instan!`, "success");
    closeCalendarDetailModal();
};




// --- NAVIGATION SYSTEM ---
function initNavigation() {
    const navTriggers = document.querySelectorAll('[data-target]');
    const views = document.querySelectorAll('.view-section');
    const breadcrumbTitle = document.getElementById('current-view-title');

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (trigger.tagName === 'A') e.preventDefault();
            
            const targetId = trigger.getAttribute('data-target');
            if (!targetId) return;

            // Switch view
            views.forEach(view => view.classList.remove('active'));
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');

            // Update sidebar nav state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            const correspondingNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
            if (correspondingNav) {
                correspondingNav.classList.add('active');
                if (breadcrumbTitle) {
                    const span = correspondingNav.querySelector('span');
                    if (span) breadcrumbTitle.textContent = span.textContent;
                }
            }

            // Sync with subpage title
            window.location.hash = targetId.replace('view-', '');
        });
    });

    // Check URL hash on initial load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash) window.switchMarketingPage(hash);
    }
}

// Global Switcher for sidebar.js
window.switchMarketingPage = function(subpage) {
    const rawSub = subpage.replace('view-', '');
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => view.classList.remove('active'));
    
    const targetId = 'view-' + rawSub;
    const targetView = document.getElementById(targetId) || document.getElementById(subpage);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    const breadcrumbTitle = document.getElementById('current-view-title');
    if (breadcrumbTitle) {
        const titles = {
            'marketing-ops': 'Marketing Ops',
            'ai-engine': 'AI Content Engine & 7-Day Planner',
            'approval-queue': 'Antrean Persetujuan',
            'calendar': 'Content Calendar',
            'distribution': 'Distribution Manager',
            'asset-library': 'Brand Asset Library',
            'social-listening': 'Social Listening & Competitors',
            'inbox': 'Omnichannel Inbox',
            'content-history': 'Riwayat Konten & Arsip',
            'kanban': 'Kanban AI Workflow',
            'analytics': 'Reporting & Analytics',
            'settings': 'Settings & Rules'
        };
        if (titles[rawSub]) breadcrumbTitle.textContent = titles[rawSub];
    }
};

// --- 7-DAY SPRINT PLANNER & SMART TOKEN LOGIC ---
function initSprintPlanner() {
    const btnBrainstorm = document.getElementById('btnBrainstorm7Days');
    const btnExecuteAll = document.getElementById('btnExecuteAll7Days');
    const btnSyncCalendar = document.getElementById('btnSyncToCalendar');
    const themeInput = document.getElementById('sprintThemeInput');
    const progressText = document.getElementById('sprintProgressText');

    // AI Brainstorm 7 Days Handler
    if (btnBrainstorm) {
        btnBrainstorm.addEventListener('click', () => {
            const theme = themeInput ? themeInput.value.trim() : 'Software Engineering Trends';
            btnBrainstorm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Brainstorming...';
            btnBrainstorm.disabled = true;

            setTimeout(() => {
                btnBrainstorm.innerHTML = '<i class="fa-solid fa-bolt"></i> AI Brainstorm 7 Hari';
                btnBrainstorm.disabled = false;

                // Update Row Inputs with fresh angles
                const freshIdeas = [
                    `[Senin] Cara Membangun Fullstack App Super Cepat dengan ${theme}`,
                    `[Selasa] 3 Kesalahan Arsitektur Fatal yang Sering Terjadi di ${theme} 😱`,
                    `[Rabu] Benchmarking Kinerja & Kecepatan: Sebelum vs Sesudah Optimasi`,
                    `[Kamis] Studi Kasus: Bagaimana Enterprise Memanfaatkan ${theme}`,
                    `[Jumat] Panduan Lengkap Best Practices & Checklist Deploy Production`,
                    `[Sabtu] Meme Programmer: Ekspektasi vs Realita Saat Implementasi 💀`,
                    `[Minggu] Weekly Recap & Rangkuman Kabar Tech Terhangat`
                ];

                const rows = document.querySelectorAll('#sprintRowsContainer .sprint-row');
                rows.forEach((row, idx) => {
                    const input = row.querySelector('.topic-input');
                    if (input && freshIdeas[idx]) {
                        input.value = freshIdeas[idx];
                        sprintData[idx + 1].topic = freshIdeas[idx];
                    }
                });

                window.showToast("✨ 7 Ide Topik Mingguan berhasil disusun otomatis oleh AI! (0 Token Visual Terpakai)", "success");
            }, 600);
        });
    }

    // Execute All 7 Days Handler
    if (btnExecuteAll) {
        btnExecuteAll.addEventListener('click', () => {
            btnExecuteAll.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengeksekusi Batch...';
            btnExecuteAll.disabled = true;

            let step = 1;
            const interval = setInterval(() => {
                if (step <= 7) {
                    const row = document.querySelector(`.sprint-row[data-day="${step}"]`);
                    if (row) {
                        const statusContainer = row.querySelector('.status-indicator');
                        if (statusContainer) {
                            statusContainer.className = 'status-indicator status-ready';
                            statusContainer.innerHTML = '<i class="fa-solid fa-check"></i> Siap Ditinjau';
                        }

                        // Update action buttons from 'Eksekusi AI' to 'Pratinjau' + 'Re-Gen'
                        const actionContainer = row.querySelector('div:last-child');
                        if (actionContainer) {
                            actionContainer.innerHTML = `
                                <button class="btn btn-outline btn-preview-day" data-day="${step}" style="font-size:11px; padding:4px 8px; height:auto;" title="Pratinjau Hasil"><i class="fa-solid fa-eye"></i> Pratinjau</button>
                                <button class="btn btn-primary btn-generate-day" data-day="${step}" style="font-size:11px; padding:4px 10px; height:auto;"><i class="fa-solid fa-rotate"></i> Re-Gen</button>
                            `;
                        }

                        sprintData[step].status = 'ready';
                    }
                    if (progressText) progressText.textContent = `Progress: ${step} dari 7 Konten Dieksekusi`;
                    step++;
                } else {
                    clearInterval(interval);
                    btnExecuteAll.innerHTML = '<i class="fa-solid fa-check-double"></i> 7 Hari Siap';
                    btnExecuteAll.disabled = false;
                    window.showToast("🚀 Seluruh 7 aset konten & visual mingguan berhasil dibuat oleh AI!", "success");
                    renderPreviewForDay(currentPreviewDay);

                    // Smoothly scroll to preview section
                    const previewSec = document.getElementById('previewSection');
                    if (previewSec) {
                        previewSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 250);
        });
    }

    // Sync to Calendar Handler
    if (btnSyncCalendar) {
        btnSyncCalendar.addEventListener('click', () => {
            renderCalendarGrid();
            if (currentCalView === 'week') renderWeekGrid();
            window.showToast("📅 7 Konten mingguan berhasil disinkronkan ke Content Calendar!", "success");
            // Smoothly switch to calendar view so user sees the real result
            setTimeout(() => {
                window.switchMarketingPage('calendar');
            }, 600);
        });
    }

    // Sprint Row Delegate Events
    const rowsContainer = document.getElementById('sprintRowsContainer');
    if (rowsContainer) {
        rowsContainer.addEventListener('click', (e) => {
            const row = e.target.closest('.sprint-row');
            if (!row) return;

            const day = parseInt(row.getAttribute('data-day'));

            // If clicked "Eksekusi AI / Re-Gen" button
            const genBtn = e.target.closest('.btn-generate-day');
            if (genBtn) {
                const topicInput = row.querySelector('.topic-input');
                if (topicInput && topicInput.value.trim()) {
                    sprintData[day].topic = topicInput.value.trim();
                }

                genBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                genBtn.disabled = true;
                const statusContainer = row.querySelector('.status-indicator');
                if (statusContainer) {
                    statusContainer.className = 'status-indicator status-generating';
                    statusContainer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Membuat Aset...';
                }

                setTimeout(() => {
                    // Update action container to show Pratinjau + Re-Gen
                    const actionContainer = row.querySelector('div:last-child');
                    if (actionContainer) {
                        actionContainer.innerHTML = `
                            <button class="btn btn-outline btn-preview-day" data-day="${day}" style="font-size:11px; padding:4px 8px; height:auto;" title="Pratinjau Hasil"><i class="fa-solid fa-eye"></i> Pratinjau</button>
                            <button class="btn btn-primary btn-generate-day" data-day="${day}" style="font-size:11px; padding:4px 10px; height:auto;"><i class="fa-solid fa-rotate"></i> Re-Gen</button>
                        `;
                    }
                    if (statusContainer) {
                        statusContainer.className = 'status-indicator status-ready';
                        statusContainer.innerHTML = '<i class="fa-solid fa-check"></i> Siap Ditinjau';
                    }
                    sprintData[day].status = 'ready';
                    setActiveRow(day);
                    renderPreviewForDay(day);

                    // Update progress text
                    let readyCount = 0;
                    for (let d = 1; d <= 7; d++) {
                        if (sprintData[d] && sprintData[d].status === 'ready') readyCount++;
                    }
                    if (progressText) progressText.textContent = `Progress: ${readyCount} dari 7 Konten Dieksekusi`;

                    window.showToast(`⚡ Aset visual & copywriting untuk Hari ke-${day} siap ditinjau!`, 'success');

                    const previewSec = document.getElementById('previewSection');
                    if (previewSec) previewSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
                return;
            }

            // If clicked "Pratinjau" button or row selection
            setActiveRow(day);
            renderPreviewForDay(day);

            const previewBtn = e.target.closest('.btn-preview-day');
            if (previewBtn) {
                const previewSec = document.getElementById('previewSection');
                if (previewSec) previewSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        // Topic input real-time sync
        rowsContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('topic-input')) {
                const row = e.target.closest('.sprint-row');
                const day = parseInt(row.getAttribute('data-day'));
                if (sprintData[day]) {
                    sprintData[day].topic = e.target.value;
                }
            }
        });

        // Format selector change
        rowsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('format-selector')) {
                const row = e.target.closest('.sprint-row');
                const day = parseInt(row.getAttribute('data-day'));
                sprintData[day].format = e.target.value;
                if (day === currentPreviewDay) {
                    renderPreviewForDay(day);
                }
                window.showToast(`Format Hari ke-${day} diubah ke ${e.target.options[e.target.selectedIndex].text}`, 'info');
            }
        });
    }

    // Scraped Topic "Gunakan Ide" with Day/Slot Selection Modal
    document.querySelectorAll('.btn-use-scraped-topic').forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.getAttribute('data-topic');
            window.openUseIdeaModal(topic);
        });
    });

    // Handle Idea Destination Pills (Sprint / Calendar Date / Queue)
    let currentIdeaDest = 'sprint';
    document.querySelectorAll('.idea-dest-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.idea-dest-btn').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = 'var(--text-secondary)';
                b.style.fontWeight = '500';
                b.style.boxShadow = 'none';
            });
            btn.style.background = '#fff';
            btn.style.color = 'var(--brand-primary)';
            btn.style.fontWeight = '700';
            btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

            currentIdeaDest = btn.getAttribute('data-dest');
            
            const sprintSec = document.getElementById('ideaDestSprintSection');
            const calSec = document.getElementById('ideaDestCalendarSection');
            const queueSec = document.getElementById('ideaDestQueueSection');

            if (sprintSec) sprintSec.style.display = (currentIdeaDest === 'sprint') ? 'block' : 'none';
            if (calSec) calSec.style.display = (currentIdeaDest === 'calendar') ? 'block' : 'none';
            if (queueSec) queueSec.style.display = (currentIdeaDest === 'queue') ? 'block' : 'none';
        });
    });

    // Handle Use Idea Form Submission
    const formUseIdea = document.getElementById('formUseIdea');
    if (formUseIdea) {
        formUseIdea.addEventListener('submit', (e) => {
            e.preventDefault();
            const topic = document.getElementById('useIdeaTopicInput').value.trim();
            const format = document.getElementById('useIdeaFormatSelect').value;

            if (currentIdeaDest === 'sprint') {
                // 1. Put into Sprint Matrix
                const day = parseInt(document.getElementById('useIdeaDaySelect').value);
                const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
                const chosenDayName = dayNames[day - 1] || `Hari ke-${day}`;

                if (sprintData[day]) {
                    sprintData[day].topic = topic;
                    sprintData[day].format = format;
                }

                const targetRow = document.querySelector(`.sprint-row[data-day="${day}"]`);
                if (targetRow) {
                    const input = targetRow.querySelector('.topic-input');
                    if (input) input.value = topic;

                    const formatSel = targetRow.querySelector('.format-selector');
                    if (formatSel) formatSel.value = format;

                    targetRow.style.transition = 'background 0.3s, box-shadow 0.3s';
                    targetRow.style.background = '#eff6ff';
                    setTimeout(() => { targetRow.style.background = ''; }, 1200);
                }

                window.closeUseIdeaModal();
                setActiveRow(day);
                renderPreviewForDay(day);

                window.showToast(`💡 Topik berhasil dipasang ke slot ${chosenDayName} (Hari ke-${day})!`, 'success');

                if (targetRow) {
                    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else if (currentIdeaDest === 'calendar') {
                // 2. Put directly into specific future calendar date
                const dateVal = document.getElementById('useIdeaCustomDate').value;
                const timeVal = document.getElementById('useIdeaCustomTime').value || '18:00';
                const platformVal = document.getElementById('useIdeaCustomPlatform').value;

                if (!customCalendarEvents[dateVal]) {
                    customCalendarEvents[dateVal] = [];
                }

                customCalendarEvents[dateVal].push({
                    topic: topic,
                    platform: platformVal,
                    format: format,
                    date: dateVal,
                    time: timeVal,
                    caption: `Postingan ide tren: "${topic}".\n#${platformVal} #AstacodeTech`,
                    status: 'ready'
                });

                // Update and render calendar
                renderCalendarGrid();
                if (currentCalView === 'week') renderWeekGrid();

                window.closeUseIdeaModal();
                window.showToast(`🗓️ Topik berhasil dijadwalkan ke Kalender pada ${dateVal} (${timeVal} WIB)!`, 'success');

                // Smoothly switch to calendar view
                setTimeout(() => {
                    window.switchMarketingPage('calendar');
                }, 600);
            } else {
                // 3. Put into Draft Queue (Backlog)
                window.closeUseIdeaModal();
                window.showToast(`📥 Topik "${topic.substring(0, 25)}..." berhasil disimpan ke Antrean Draf (Backlog)!`, 'success');
                
                // Smoothly switch to calendar to show queue
                setTimeout(() => {
                    window.switchMarketingPage('calendar');
                }, 600);
            }
        });
    }

    // Quick Gen Slot Selector Sync with Date Input
    const sprintSlotSelect = document.getElementById('quickGenSprintSlotSelect');
    const quickGenDateInput = document.getElementById('quickGenDate');
    if (sprintSlotSelect && quickGenDateInput) {
        sprintSlotSelect.addEventListener('change', () => {
            if (sprintSlotSelect.value !== 'custom') {
                quickGenDateInput.value = sprintSlotSelect.value;
            }
        });
        quickGenDateInput.addEventListener('change', () => {
            let matched = false;
            for (let opt of sprintSlotSelect.options) {
                if (opt.value === quickGenDateInput.value) {
                    sprintSlotSelect.value = opt.value;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                sprintSlotSelect.value = 'custom';
            }
        });
    }

    // Quick Gen Form (Ad-Hoc Generator with Date & Platform)
    const quickGenForm = document.getElementById('quickGenForm');
    if (quickGenForm) {
        quickGenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const topic = document.getElementById('quickGenTopic').value.trim() || 'Tips Arsitektur Software 2026';
            const type = document.getElementById('quickGenType').value;
            const platform = document.getElementById('quickGenPlatform').value;
            const dateVal = document.getElementById('quickGenDate').value;
            const timeVal = document.getElementById('quickGenTime').value || '19:00';

            // Find if this date matches any sprint day (1..7)
            let matchedDayIdx = null;
            for (let d = 1; d <= 7; d++) {
                if (sprintData[d] && sprintData[d].dateKey === dateVal) {
                    matchedDayIdx = d;
                    break;
                }
            }

            const dayLabel = matchedDayIdx ? sprintData[matchedDayIdx].day : `Jadwal Khusus (${dateVal})`;

            const adhocItem = {
                topic: topic,
                format: type,
                platform: platform,
                day: dayLabel,
                dateKey: dateVal,
                time: timeVal,
                status: 'ready',
                caption: `Panduan lengkap dan insight praktis seputar ${topic} 🚀\n\nPelajari langkah implementasi terbaiknya di postingan ini!\n\nBagaimana pengalaman dan pendapat kalian? Tulis di kolom komentar ya! 👇\n\n#${platform.replace(/\s+/g, '')} #AstacodeTech #DevLife #SoftwareEngineering`
            };

            // Save to custom calendar events on that specific date
            if (!customCalendarEvents[dateVal]) {
                customCalendarEvents[dateVal] = [];
            }
            customCalendarEvents[dateVal].push(adhocItem);

            // Update calendars
            renderCalendarGrid();
            if (currentCalView === 'week') renderWeekGrid();

            // If it matches a sprint day, update preview studio for that day with the new item active
            if (matchedDayIdx) {
                setActiveRow(matchedDayIdx);
                const allItems = getAllContentsForDay(matchedDayIdx);
                const newIdx = allItems.length - 1;
                renderPreviewForDay(matchedDayIdx, newIdx);
                window.showToast(`✨ Konten #${newIdx + 1} "${topic.substring(0, 25)}..." berhasil ditambahkan untuk ${dayLabel}!`, 'success');
            } else {
                renderPreviewObject(adhocItem, null, 0, 1);
                window.showToast(`✨ Konten Ad-Hoc "${topic.substring(0, 25)}..." berhasil dijadwalkan pada ${dateVal} (${timeVal} WIB)!`, 'success');
            }
            
            const previewSec = document.getElementById('previewSection');
            if (previewSec) previewSec.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

window.openUseIdeaModal = function(topic) {
    const modal = document.getElementById('useIdeaModal');
    if (modal) {
        const topicInput = document.getElementById('useIdeaTopicInput');
        if (topicInput) topicInput.value = topic || '';

        const daySelect = document.getElementById('useIdeaDaySelect');
        if (daySelect) daySelect.value = currentPreviewDay || '1';

        // Reset pills to Sprint mode by default
        const sprintBtn = document.querySelector('.idea-dest-btn[data-dest="sprint"]');
        if (sprintBtn) sprintBtn.click();

        modal.style.display = 'flex';
    }
};

window.closeUseIdeaModal = function() {
    const modal = document.getElementById('useIdeaModal');
    if (modal) modal.style.display = 'none';
};

function setActiveRow(day) {
    currentPreviewDay = day;
    document.querySelectorAll('#sprintRowsContainer .sprint-row').forEach(r => {
        r.classList.toggle('active-row', parseInt(r.getAttribute('data-day')) === day);
    });
}

// Helper to get ALL contents for a given sprint day (Primary Sprint Item + Any Ad-Hoc Items on that date)
function getAllContentsForDay(day) {
    const items = [];
    if (sprintData[day]) {
        items.push({
            ...sprintData[day],
            isPrimarySprint: true,
            slotName: `Konten #1 (${sprintData[day].platform || 'Instagram'})`
        });
    }
    const dateKey = sprintData[day] ? sprintData[day].dateKey : null;
    if (dateKey && customCalendarEvents[dateKey]) {
        customCalendarEvents[dateKey].forEach((ev, idx) => {
            items.push({
                ...ev,
                isPrimarySprint: false,
                slotName: `Konten #${idx + 2} (${ev.platform || 'Ad-Hoc'})`
            });
        });
    }
    return items;
}

// Smart Helper to generate dynamic slides customized to any topic
function generateDynamicSlides(topic) {
    const lower = (topic || '').toLowerCase();
    let slide1Sub = "Geser ke kanan 👉";
    let point1Title = "1. Analisis & Masalah";
    let point1Desc = `Mengapa ${topic.substring(0, 35)} krusial dipahami di era modern.`;
    let point2Title = "2. Arsitektur & Solusi";
    let point2Desc = "Langkah implementasi terbaik dan framework yang terbukti efektif di production.";
    let point3Title = "3. Best Practices & Kinerja";
    let point3Desc = "Tips optimasi efisiensi resource, stabilitas sistem, dan mitigasi bottleneck.";
    let ctaTitle = "Bagikan ke Tim Kamu!";
    let ctaDesc = "Simpan postingan ini untuk panduan & diskusikan di kolom komentar ya! 👇";
    let gradient = "linear-gradient(135deg, #1e3a8a, #3b82f6)";

    if (lower.includes('next.js') || lower.includes('react') || lower.includes('frontend')) {
        point1Title = "1. Server Components (RSC)";
        point1Desc = "Zero bundle size untuk data fetching. Loading 3x lebih cepat tanpa waterfall!";
        point2Title = "2. Server Actions Bawaan";
        point2Desc = "Mutasi data langsung dari komponen tanpa ribet bikin REST endpoint terpisah.";
        point3Title = "3. Built-in SEO & OpenGraph";
        point3Desc = "Generate dynamic metadata & social share image secara otomatis per rute.";
        ctaTitle = "Sudahkah Tim Kamu Migrasi?";
        ctaDesc = "Tulis opini dan pengalaman kalian di kolom komentar ya! 👇";
        gradient = "linear-gradient(135deg, #1e3a8a, #3b82f6)";
    } else if (lower.includes('arsitektur') || lower.includes('software') || lower.includes('backend') || lower.includes('microservice') || lower.includes('database')) {
        point1Title = "1. Modular Monolith vs Microservices";
        point1Desc = "Desain bounded context yang jelas sebelum memutuskan memecah service.";
        point2Title = "2. Event-Driven & Async Queues";
        point2Desc = "Gunakan message broker untuk decoupling proses berat & background worker.";
        point3Title = "3. Distributed Tracing & Caching";
        point3Desc = "Implementasi OpenTelemetry dan multi-layer caching Redis untuk query instan.";
        ctaTitle = "Bagaimana Stack Arsitektur Kamu?";
        ctaDesc = "Bagikan arsitektur sistem tim kamu di kolom komentar! 👇";
        gradient = "linear-gradient(135deg, #0f766e, #0284c7)";
    } else if (lower.includes('ai') || lower.includes('agent') || lower.includes('llm') || lower.includes('model')) {
        point1Title = "1. Multi-Agent Collaboration";
        point1Desc = "Pembagian peran specialized agents untuk menyelesaikan workflow kompleks mandiri.";
        point2Title = "2. RAG & Vector Embeddings";
        point2Desc = "Koneksikan LLM dengan basis data internal enterprise tanpa fine-tuning mahal.";
        point3Title = "3. Guardrails & Governance";
        point3Desc = "Evaluasi output otomatis untuk mencegah halusinasi dan kebocoran data sensitif.";
        ctaTitle = "Siap Adopsi Agen AI?";
        ctaDesc = "Yuk diskusikan implementasi AI di enterprise kalian! 👇";
        gradient = "linear-gradient(135deg, #4338ca, #6366f1)";
    } else if (lower.includes('laravel') || lower.includes('fiber') || lower.includes('go') || lower.includes('benchmark')) {
        point1Title = "1. Throughput & Latency Test";
        point1Desc = "Perbandingan requests per second di bawah beban 10.000 concurrent connections.";
        point2Title = "2. Developer Velocity vs Raw Speed";
        point2Desc = "Ekosistem kaya & scaffolding cepat vs performa ultra-efisien Go.";
        point3Title = "3. Memory Footprint";
        point3Desc = "Penggunaan RAM & CPU di container Docker cloud Kubernetes.";
        ctaTitle = "Mana Stack Andalan Kamu?";
        ctaDesc = "Tulis pilihan framework dan alasan kalian di komentar ya! 👇";
        gradient = "linear-gradient(135deg, #b91c1c, #ea580c)";
    }

    return [
        { num: "Slide 1/5", title: `${topic} 🚀`, subtitle: slide1Sub, bg: gradient, isCover: true },
        { num: "Slide 2/5", title: point1Title, desc: point1Desc, icon: "fa-code" },
        { num: "Slide 3/5", title: point2Title, desc: point2Desc, icon: "fa-bolt" },
        { num: "Slide 4/5", title: point3Title, desc: point3Desc, icon: "fa-shield-halved" },
        { num: "Slide 5/5", title: ctaTitle, desc: ctaDesc, bg: "linear-gradient(135deg, #0f172a, #1e293b)", isCta: true }
    ];
}

// Render Preview for a generic data object
function renderPreviewObject(data, dayIndex = null, contentIndex = 0, totalCount = 1) {
    const titleEl = document.getElementById('previewHeaderTitle');
    const platformTag = document.getElementById('previewPlatformTag');
    const visualContainer = document.getElementById('previewVisualContainer');
    const captionEl = document.getElementById('previewCaptionText');
    const statusBadge = document.getElementById('previewStatusBadge');

    const dayName = data.day || (dayIndex && sprintData[dayIndex] ? sprintData[dayIndex].day : 'Jadwal Konten');
    
    if (titleEl) {
        if (totalCount > 1) {
            titleEl.textContent = `Pratinjau Hasil: ${dayName} • Konten #${contentIndex + 1} (${data.topic.substring(0, 30)}...)`;
        } else {
            titleEl.textContent = `Pratinjau Hasil: ${dayName} (${data.topic.substring(0, 35)}...)`;
        }
    }
    
    if (statusBadge) {
        statusBadge.className = 'status-badge badge-done';
        statusBadge.textContent = 'SIAP DITINJAU';
    }

    if (platformTag) {
        if (data.format === 'video') {
            platformTag.innerHTML = `<i class="fa-brands fa-tiktok" style="color:#000; font-size:18px;"></i> TikTok & Reels Video Script: "${data.topic}"`;
        } else if (data.format === 'blog') {
            platformTag.innerHTML = `<i class="fa-solid fa-blog" style="color:#10b981; font-size:18px;"></i> Artikel Blog SEO: "${data.topic}"`;
        } else if (data.format === 'single') {
            platformTag.innerHTML = `<i class="fa-brands fa-instagram" style="color:#e11d48; font-size:18px;"></i> Single Post & Meme: "${data.topic}"`;
        } else {
            platformTag.innerHTML = `<i class="fa-brands fa-instagram" style="color:#e11d48; font-size:18px;"></i> Instagram Carousel (5 Slide): "${data.topic}"`;
        }
    }

    if (captionEl) {
        captionEl.textContent = data.caption || `Panduan lengkap seputar ${data.topic} 🚀\n\nSimak rincian implementasinya dan diskusikan di kolom komentar! 👇\n\n#AstacodeTech #SoftwareDevelopment #TechIndo`;
    }

    if (!visualContainer) return;

    if (data.format === 'video') {
        const hookText = data.videoHook || `Jangan lewatkan insight penting seputar ${data.topic}!`;
        const scriptText = data.videoScript || `[0-3s Hook]: Ini dia rahasia penting seputar ${data.topic}!\n[4-20s Poin Inti]: Mengapa hal ini krusial diterapkan di codebase enterprise modern.\n[21-40s Solusi]: 3 langkah implementasi cepat tanpa merusak arsitektur lama.\n[41-45s CTA]: Save video ini dan follow @astacode untuk tips tech harian!`;

        visualContainer.innerHTML = `
            <div style="display:flex; gap:20px; align-items:flex-start; width:100%;">
                <div style="width:200px; height:240px; background:#0f172a; border-radius:12px; border:4px solid #334155; display:flex; flex-direction:column; justify-content:space-between; padding:16px; color:#fff; position:relative; box-shadow:0 8px 16px rgba(0,0,0,0.2); flex-shrink:0;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.8;">
                        <span><i class="fa-solid fa-video"></i> 9:16</span>
                        <span>${data.videoDuration || '45s'}</span>
                    </div>
                    <div style="text-align:center;">
                        <i class="fa-brands fa-tiktok" style="font-size:32px; color:#fff; opacity:0.7; margin-bottom:8px;"></i>
                        <p style="font-size:11px; font-weight:600; line-height:1.3; color:#f8fafc;">${hookText}</p>
                    </div>
                    <div style="background:rgba(255,255,255,0.15); border-radius:6px; padding:6px; font-size:9.5px; text-align:center;">
                        <i class="fa-solid fa-volume-high"></i> Voice: Alistair (ID Natural)
                    </div>
                </div>

                <div style="flex:1; background:#f8fafc; border:1px solid var(--border-light); border-radius:8px; padding:16px;">
                    <strong style="font-size:12.5px; color:var(--text-primary); margin-bottom:10px; display:block;">
                        <i class="fa-solid fa-film" style="color:var(--brand-primary); margin-right:6px;"></i> Naskah & Timeline Teleprompter AI:
                    </strong>
                    <div style="font-size:12px; color:var(--text-secondary); line-height:1.7; white-space:pre-line; max-height:170px; overflow-y:auto;">
                        ${scriptText}
                    </div>
                </div>
            </div>
        `;
    } else if (data.format === 'blog') {
        visualContainer.innerHTML = `
            <div style="width:100%; background:#f8fafc; border:1px solid var(--border-light); border-radius:8px; padding:18px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-size:12px; font-weight:700; color:#10b981;"><i class="fa-solid fa-gauge-high"></i> SEO Score: ${data.seoScore || '94/100'}</span>
                    <span style="font-size:11px; background:#dcfce7; color:#166534; padding:3px 8px; border-radius:4px; font-weight:600;">SEO OPTIMIZED</span>
                </div>
                <strong style="font-size:14px; color:var(--text-primary); display:block; margin-bottom:6px;">${data.metaTitle || data.topic}</strong>
                <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">${data.metaDesc || `Panduan mendalam dan analisis teknis seputar ${data.topic} untuk performa optimal.`}</p>
                <div style="display:flex; gap:8px;">
                    <span style="font-size:11px; background:#e0e7ff; color:#3730a3; padding:3px 8px; border-radius:4px;">Keyword: ${data.topic.split(' ')[0]} ERP</span>
                    <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px;">Word Count: 1,350 Kata</span>
                </div>
            </div>
        `;
    } else if (data.format === 'single') {
        visualContainer.innerHTML = `
            <div style="display:flex; gap:20px; align-items:center;">
                <div style="width:220px; height:220px; background:linear-gradient(135deg, #f59e0b, #d97706); border-radius:10px; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#fff; text-align:center; padding:20px; box-shadow:0 4px 10px rgba(217,119,6,0.2);">
                    <i class="fa-solid fa-face-laugh-squint" style="font-size:42px; margin-bottom:12px;"></i>
                    <strong style="font-size:13.5px; line-height:1.3;">${data.topic}</strong>
                </div>
                <div style="flex:1;">
                    <strong style="font-size:13px; color:var(--text-primary); margin-bottom:6px; display:block;">Single Image / Meme Post</strong>
                    <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">Format ini dirancang untuk memaksimalkan share, save, dan interaksi santai audiens programmer.</p>
                </div>
            </div>
        `;
    } else {
        const slides = generateDynamicSlides(data.topic);
        visualContainer.innerHTML = slides.map(slide => `
            <div style="min-width:220px; height:220px; ${slide.bg ? 'background:' + slide.bg + ';' : 'background:#fff; border:1px solid var(--border-light);'} border-radius:10px; display:flex; flex-direction:column; justify-content:space-between; ${slide.bg ? 'color:#fff;' : 'color:var(--text-primary);'} padding:18px; box-shadow:0 4px 8px rgba(0,0,0,0.05); flex-shrink:0;">
                <div style="display:flex; justify-content:space-between; font-size:10px; opacity:0.8;">
                    <span>ASTACODE TECH</span>
                    <span>${slide.num}</span>
                </div>
                <div>
                    <strong style="font-size:13px; line-height:1.4; display:block; margin-bottom:6px; ${slide.bg ? 'color:#fff;' : 'color:var(--brand-primary);'}">${slide.title}</strong>
                    ${slide.desc ? `<p style="font-size:11.5px; ${slide.bg ? 'color:#e2e8f0;' : 'color:var(--text-secondary);'} line-height:1.4;">${slide.desc}</p>` : ''}
                </div>
                <div style="font-size:10px; opacity:0.85;">
                    ${slide.isCover ? slide.subtitle : (slide.isCta ? '<i class="fa-solid fa-bookmark"></i> Save Post' : `<i class="fa-solid ${slide.icon || 'fa-check'}"></i> Tips Astacode`)}
                </div>
            </div>
        `).join('');
    }
}

// --- DYNAMIC PREVIEW STUDIO RENDERER WITH MULTI-CONTENT TAB SWITCHER ---
function renderPreviewForDay(day, activeIndex = 0) {
    currentPreviewDay = day;
    const contents = getAllContentsForDay(day);
    if (!contents || contents.length === 0) return;

    if (activeIndex >= contents.length) activeIndex = 0;

    // Render Tab Selector Pills if 1 or more contents exist
    const tabsContainer = document.getElementById('previewContentTabs');
    if (tabsContainer) {
        let tabsHtml = '';
        contents.forEach((item, idx) => {
            let icon = 'fa-newspaper';
            if (item.format === 'carousel') icon = 'fa-images';
            else if (item.format === 'video') icon = 'fa-video';
            else if (item.format === 'blog') icon = 'fa-blog';
            else if (item.format === 'single') icon = 'fa-image';

            const isActive = idx === activeIndex;
            const shortTitle = item.topic.length > 20 ? item.topic.substring(0, 20) + '...' : item.topic;

            tabsHtml += `
                <button class="preview-tab-btn ${isActive ? 'active' : ''}" onclick="renderPreviewForDay(${day}, ${idx})">
                    <i class="fa-solid ${icon}"></i> 
                    <span>#${idx + 1} ${item.format.toUpperCase()} (${item.time || '10:00'})</span>
                    <span style="font-size:10.5px; opacity:0.85; font-weight:400; margin-left:4px;">- ${shortTitle}</span>
                </button>
            `;
        });

        // Button to add another content for this day
        const targetDate = sprintData[day] ? sprintData[day].dateKey : '2026-10-28';
        tabsHtml += `
            <button class="preview-tab-add" onclick="focusQuickGenForDay(${day}, '${targetDate}')" title="Buat konten tambahan untuk hari ini">
                <i class="fa-solid fa-plus"></i> Tambah Konten Hari Ini
            </button>
        `;

        tabsContainer.innerHTML = tabsHtml;
    }

    // Render the active content
    renderPreviewObject(contents[activeIndex], day, activeIndex, contents.length);
}

window.focusQuickGenForDay = function(day, dateVal) {
    const slotSelect = document.getElementById('quickGenSprintSlotSelect');
    if (slotSelect) {
        slotSelect.value = dateVal;
        slotSelect.dispatchEvent(new Event('change'));
    }
    const topicInput = document.getElementById('quickGenTopic');
    if (topicInput) {
        topicInput.focus();
        topicInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.showToast(`✨ Formulir diarahkan untuk membuat konten baru pada slot Hari ke-${day}!`, 'info');
};

function initPreviewStudio() {
    // Copy Caption Handler
    const btnCopy = document.getElementById('btnCopyCaption');
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const caption = document.getElementById('previewCaptionText');
            if (caption) {
                navigator.clipboard.writeText(caption.textContent.trim()).then(() => {
                    window.showToast("📋 Copywriting berhasil disalin ke clipboard!", "success");
                }).catch(() => {
                    window.showToast("Teks berhasil disalin!", "success");
                });
            }
        });
    }

    // Edit Preview Handler
    const btnEdit = document.getElementById('btnEditPreview');
    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            const caption = document.getElementById('previewCaptionText');
            if (caption) {
                const currentText = caption.textContent.trim();
                const newText = prompt("Edit Copywriting / Hashtag:", currentText);
                if (newText !== null && newText.trim() !== "") {
                    caption.textContent = newText;
                    if (sprintData[currentPreviewDay]) sprintData[currentPreviewDay].caption = newText;
                    window.showToast("✏️ Perubahan copywriting disimpan!", "success");
                }
            }
        });
    }
}

// --- OMNICHANNEL INBOX INTERACTION ---
function initInboxChatTester() {
    document.querySelectorAll('#view-inbox .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const customerName = row ? row.querySelector('strong').textContent : "Pelanggan";
            
            const replyMsg = prompt(`Kirim Balasan Manual ke ${customerName}:`, "Halo! Terima kasih atas pertanyaannya. Tim teknis kami akan segera menghubungi Anda.");
            if (replyMsg) {
                window.showToast(`💬 Pesan terkirim ke ${customerName}!`, "success");
            }
        });
    });
}

// ============================================================================
// --- BRAND ASSET LIBRARY & DAM STUDIO FULL INTERACTION ENGINE ---
// ============================================================================

const brandFoldersData = [
    { id: 'folder-bg', name: 'Backgrounds', parent: 'root', color: '#3b82f6', count: 12, size: '24.5 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-logo', name: 'Logo & Watermark', parent: 'root', color: '#3b82f6', count: 8, size: '14.2 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-fonts', name: 'Fonts & Typography', parent: 'root', color: '#3b82f6', count: 5, size: '8.1 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-icons', name: 'Icons & Illustrations', parent: 'root', color: '#3b82f6', count: 42, size: '18.3 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-mockups', name: 'Product Mockups', parent: 'root', color: '#3b82f6', count: 16, size: '32.0 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-templates', name: 'Social Media Templates', parent: 'root', color: '#3b82f6', count: 24, size: '45.8 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-office', name: 'Office Photos', parent: 'root', color: '#3b82f6', count: 19, size: '68.4 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-team', name: 'Team Portraits', parent: 'root', color: '#3b82f6', count: 14, size: '29.1 MB', modified: '28 Okt 2026, 10:44 am' },
    { id: 'folder-ui', name: 'UI Components', parent: 'root', color: '#3b82f6', count: 35, size: '12.6 MB', modified: '28 Okt 2026, 10:44 am' }
];

const brandFilesData = [
    {
        id: 'file-office-lobby',
        name: 'office_lobby_bg.png',
        folder: 'root',
        format: 'PNG',
        size: '4.1 MB',
        dim: '3840 × 2160 px',
        colorSpace: 'sRGB IEC61966-2.1',
        dpi: '300 DPI (High-Res)',
        uploader: 'Asisyah Sarah (PM)',
        created: '28 Okt 2026, 13:44',
        aiScore: '98% (Sesuai Brand Guide)',
        icon: 'fa-image',
        previewType: 'image',
        previewBg: 'linear-gradient(135deg, #1e293b, #334155)',
        previewMeta: '3840 × 2160 UHD',
        bookmarked: false
    },
    {
        id: 'file-brand-guide',
        name: 'astacode_brand_guidelines_v2.pdf',
        folder: 'root',
        format: 'PDF',
        size: '12.4 MB',
        dim: 'A4 Multi-page (28 hal)',
        colorSpace: 'CMYK FOGRA39',
        dpi: 'Vector / 300 DPI',
        uploader: 'Budi Santoso (Lead Brand)',
        created: '25 Okt 2026, 09:15',
        aiScore: '100% (Master Bible)',
        icon: 'fa-file-pdf',
        previewType: 'pdf',
        previewBg: 'linear-gradient(135deg, #ef4444, #b91c1c)',
        previewMeta: 'PDF Guide • 28 Hal',
        bookmarked: true
    },
    {
        id: 'file-vector-mascot',
        name: 'erp_vector_mascot_fullset.svg',
        folder: 'root',
        format: 'SVG',
        size: '850 KB',
        dim: 'Scalable Vector Graphic',
        colorSpace: 'RGB Universal',
        dpi: 'Lossless Vector',
        uploader: 'Siti Rahma (Illustrator)',
        created: '26 Okt 2026, 11:20',
        aiScore: '96% (AI Indexed)',
        icon: 'fa-vector-square',
        previewType: 'vector',
        previewBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        previewMeta: 'SVG • Layered Art',
        bookmarked: false
    },
    {
        id: 'file-logo-horiz',
        name: 'astacode_logo_horizontal_dark.svg',
        folder: 'folder-logo',
        format: 'SVG',
        size: '420 KB',
        dim: '1200 × 320 px',
        colorSpace: 'sRGB',
        dpi: 'Infinite Vector',
        uploader: 'Budi Santoso',
        created: '20 Okt 2026, 10:00',
        aiScore: '100%',
        icon: 'fa-vector-square',
        previewType: 'vector',
        previewBg: 'linear-gradient(135deg, #0f172a, #1e293b)',
        previewMeta: '1200 × 320 Vector',
        bookmarked: true
    },
    {
        id: 'file-logo-symbol',
        name: 'astacode_logo_symbol_color.png',
        folder: 'folder-logo',
        format: 'PNG',
        size: '1.2 MB',
        dim: '2048 × 2048 px',
        colorSpace: 'sRGB',
        dpi: '300 DPI',
        uploader: 'Budi Santoso',
        created: '20 Okt 2026, 10:15',
        aiScore: '100%',
        icon: 'fa-image',
        previewType: 'image',
        previewBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        previewMeta: '2048 × 2048 PNG',
        bookmarked: true
    },
    {
        id: 'file-linkedin-banner',
        name: 'banner_linkedin_software_house.png',
        folder: 'folder-templates',
        format: 'PNG',
        size: '3.4 MB',
        dim: '1584 × 396 px',
        colorSpace: 'sRGB',
        dpi: '150 DPI',
        uploader: 'Asisyah Sarah',
        created: '27 Okt 2026, 16:30',
        aiScore: '94%',
        icon: 'fa-image',
        previewType: 'image',
        previewBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
        previewMeta: '1584 × 396 Ratio',
        bookmarked: false
    },
    {
        id: 'file-server-room',
        name: 'cyberpunk_server_room_backdrop.png',
        folder: 'folder-bg',
        format: 'PNG',
        size: '5.8 MB',
        dim: '4096 × 2160 px',
        colorSpace: 'Display P3',
        dpi: '300 DPI',
        uploader: 'Siti Rahma',
        created: '24 Okt 2026, 14:00',
        aiScore: '97%',
        icon: 'fa-image',
        previewType: 'image',
        previewBg: 'linear-gradient(135deg, #4c1d95, #2e1065)',
        previewMeta: '4096 × 2160 4K UHD',
        bookmarked: false
    },
    {
        id: 'file-inter-font',
        name: 'inter_variable_font_package.ttf',
        folder: 'folder-fonts',
        format: 'TTF',
        size: '1.8 MB',
        dim: 'Variable Weight (100-900)',
        colorSpace: 'OpenType Font',
        dpi: 'N/A',
        uploader: 'Budi Santoso',
        created: '15 Okt 2026, 08:30',
        aiScore: '100%',
        icon: 'fa-font',
        previewType: 'font',
        previewBg: 'linear-gradient(135deg, #334155, #475569)',
        previewMeta: 'Inter Variable TTF',
        bookmarked: false
    },
    {
        id: 'file-macbook-mockup',
        name: 'macbook_m3_pro_mockup_angle.png',
        folder: 'folder-mockups',
        format: 'PNG',
        size: '6.2 MB',
        dim: '5000 × 3500 px',
        colorSpace: 'sRGB',
        dpi: '300 DPI',
        uploader: 'Asisyah Sarah',
        created: '26 Okt 2026, 13:10',
        aiScore: '99%',
        icon: 'fa-image',
        previewType: 'image',
        previewBg: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        previewMeta: '5000 × 3500 High-Res',
        bookmarked: true
    }
];

let currentAssetFolder = 'root';
let currentAssetViewMode = 'grid'; // 'grid' | 'list'
let selectedAssetId = 'file-office-lobby';
let selectedAssetType = 'file'; // 'file' | 'folder'

window.navigateToAssetFolder = function(folderId) {
    currentAssetFolder = folderId;
    window.renderAssetView();
    
    // Update breadcrumb UI
    const bcContainer = document.getElementById('assetBreadcrumbs');
    const headingEl = document.getElementById('assetCategoryHeading');
    
    if (folderId === 'root') {
        if (bcContainer) {
            bcContainer.innerHTML = `
                <i class="fa-solid fa-cloud" style="color:var(--brand-primary); font-size:16px;"></i>
                <span style="color:var(--text-tertiary);"><i class="fa-solid fa-angle-right" style="font-size:10px;"></i></span>
                <span style="color:#64748b; cursor:pointer;" onclick="window.navigateToAssetFolder('root')">Semua File</span>
                <span style="color:var(--text-tertiary);"><i class="fa-solid fa-angle-right" style="font-size:10px;"></i></span>
                <span style="color:var(--text-primary); font-weight:700;" id="currentFolderBreadcrumb">Aset Software House</span>
            `;
        }
        if (headingEl) {
            const fCount = brandFoldersData.filter(f => f.parent === 'root').length;
            const fileCount = brandFilesData.filter(f => f.folder === 'root').length;
            headingEl.textContent = `📁 Direktori: Aset Software House (${fCount} Folder • ${fileCount} Berkas)`;
        }
    } else {
        const folder = brandFoldersData.find(f => f.id === folderId);
        const folderName = folder ? folder.name : folderId;
        if (bcContainer) {
            bcContainer.innerHTML = `
                <i class="fa-solid fa-cloud" style="color:var(--brand-primary); font-size:16px;"></i>
                <span style="color:var(--text-tertiary);"><i class="fa-solid fa-angle-right" style="font-size:10px;"></i></span>
                <span style="color:var(--brand-primary); cursor:pointer; font-weight:600;" onclick="window.navigateToAssetFolder('root')">Semua File</span>
                <span style="color:var(--text-tertiary);"><i class="fa-solid fa-angle-right" style="font-size:10px;"></i></span>
                <span style="color:var(--text-primary); font-weight:700;" id="currentFolderBreadcrumb">${folderName}</span>
            `;
        }
        if (headingEl) {
            const fileCount = brandFilesData.filter(f => f.folder === folderId).length;
            headingEl.textContent = `📁 Direktori: ${folderName} (${fileCount} Berkas)`;
        }
    }
};

window.renderAssetView = function() {
    const gridContainer = document.getElementById('assetGridContainer');
    const listTbody = document.getElementById('assetListTbody');
    const searchQuery = (document.getElementById('inputSearchAssets')?.value || '').toLowerCase().trim();
    const sortVal = document.getElementById('selectSortAssets')?.value || 'name';

    // Filter items based on current directory & search
    let matchingFolders = brandFoldersData.filter(f => {
        if (searchQuery) {
            return f.name.toLowerCase().includes(searchQuery);
        }
        return f.parent === currentAssetFolder;
    });

    let matchingFiles = brandFilesData.filter(f => {
        if (searchQuery) {
            return f.name.toLowerCase().includes(searchQuery) || f.format.toLowerCase().includes(searchQuery);
        }
        return f.folder === currentAssetFolder;
    });

    // Sorting
    if (sortVal === 'name') {
        matchingFolders.sort((a, b) => a.name.localeCompare(b.name));
        matchingFiles.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'size') {
        matchingFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
    } else if (sortVal === 'type') {
        matchingFiles.sort((a, b) => a.format.localeCompare(b.format));
    }

    // 1. Render Grid View
    if (gridContainer) {
        let html = '';

        // If in subfolder, show a "Kembali / Up Directory" card
        if (currentAssetFolder !== 'root' && !searchQuery) {
            html += `
                <div class="asset-item-card" onclick="window.navigateToAssetFolder('root')" style="border-style:dashed; background:#f8fafc;">
                    <div class="asset-thumb-wrapper" style="background:#f1f5f9; color:#64748b;">
                        <i class="fa-solid fa-arrow-turn-up" style="font-size:32px;"></i>
                    </div>
                    <div style="font-size:12.5px; font-weight:700; color:#475569; margin-bottom:2px;">.. [Kembali]</div>
                    <div style="font-size:11px; color:#94a3b8;">Ke Direktori Induk</div>
                </div>
            `;
        }

        // Render Folder Cards
        matchingFolders.forEach(folder => {
            const isSelected = selectedAssetId === folder.id;
            html += `
                <div class="asset-item-card ${isSelected ? 'asset-selected' : ''}" 
                     data-asset-id="${folder.id}" 
                     data-asset-type="folder"
                     onclick="window.selectAsset('${folder.id}', 'folder')"
                     ondblclick="window.navigateToAssetFolder('${folder.id}')">
                    <div class="asset-thumb-wrapper" style="background:#eff6ff;">
                        <i class="fa-solid fa-folder asset-folder-icon" style="color:${folder.color};"></i>
                    </div>
                    <div style="font-size:12.5px; font-weight:700; color:var(--text-primary); margin-bottom:3px; word-break:break-word; line-height:1.3;">
                        ${folder.name}
                    </div>
                    <div style="font-size:11px; color:#94a3b8;">
                        ${folder.modified.split(',')[0]} • ${folder.count} Item
                    </div>
                </div>
            `;
        });

        // Render File Cards
        matchingFiles.forEach(file => {
            const isSelected = selectedAssetId === file.id;
            html += `
                <div class="asset-item-card ${isSelected ? 'asset-selected' : ''}" 
                     data-asset-id="${file.id}" 
                     data-asset-type="file"
                     onclick="window.selectAsset('${file.id}', 'file')">
                    <div class="asset-thumb-wrapper" style="background:${file.previewBg}; color:#fff;">
                        <i class="fa-solid ${file.icon}" style="font-size:36px; opacity:0.9;"></i>
                        <span class="asset-type-badge">${file.format}</span>
                    </div>
                    <div style="font-size:12px; font-weight:700; color:var(--text-primary); margin-bottom:3px; word-break:break-all; line-height:1.3;">
                        ${file.name}
                    </div>
                    <div style="font-size:11px; color:#94a3b8;">
                        ${file.created.split(',')[0]} • ${file.size}
                    </div>
                </div>
            `;
        });

        if (matchingFolders.length === 0 && matchingFiles.length === 0) {
            html = `
                <div style="grid-column:1 / -1; padding:48px; text-align:center; color:#94a3b8;">
                    <i class="fa-solid fa-folder-open" style="font-size:44px; margin-bottom:12px; opacity:0.5;"></i>
                    <h4 style="font-size:14px; font-weight:600; color:#64748b;">Tidak ada aset atau folder yang cocok</h4>
                    <p style="font-size:12px; margin-top:4px;">Coba gunakan kata kunci lain atau unggah aset baru.</p>
                </div>
            `;
        }

        gridContainer.innerHTML = html;
    }

    // 2. Render List View Table
    if (listTbody) {
        let tableHtml = '';

        matchingFolders.forEach(folder => {
            const isSelected = selectedAssetId === folder.id;
            tableHtml += `
                <tr style="cursor:pointer; transition:background 0.15s; ${isSelected ? 'background:#eff6ff;' : ''}" 
                    onclick="window.selectAsset('${folder.id}', 'folder')"
                    ondblclick="window.navigateToAssetFolder('${folder.id}')">
                    <td style="padding:12px 14px; display:flex; align-items:center; gap:10px; font-weight:600; color:#0f172a;">
                        <i class="fa-solid fa-folder" style="color:${folder.color}; font-size:18px;"></i>
                        <span>${folder.name}</span>
                    </td>
                    <td style="padding:12px 14px; color:#64748b;"><span class="status-badge badge-draft" style="font-size:10px;">FOLDER</span></td>
                    <td style="padding:12px 14px; color:#64748b;">${folder.size} (${folder.count} item)</td>
                    <td style="padding:12px 14px;"><span class="status-badge badge-done" style="font-size:10px;"><i class="fa-solid fa-check"></i> SYNCED</span></td>
                    <td style="padding:12px 14px; color:#64748b; font-size:11.5px;">${folder.modified}</td>
                    <td style="padding:12px 14px; text-align:right;">
                        <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="event.stopPropagation(); window.navigateToAssetFolder('${folder.id}')"><i class="fa-solid fa-folder-open"></i> Buka</button>
                    </td>
                </tr>
            `;
        });

        matchingFiles.forEach(file => {
            const isSelected = selectedAssetId === file.id;
            tableHtml += `
                <tr style="cursor:pointer; transition:background 0.15s; ${isSelected ? 'background:#eff6ff;' : ''}" 
                    onclick="window.selectAsset('${file.id}', 'file')">
                    <td style="padding:12px 14px; display:flex; align-items:center; gap:10px; font-weight:600; color:#0f172a;">
                        <i class="fa-solid ${file.icon}" style="color:var(--brand-primary); font-size:16px;"></i>
                        <span>${file.name}</span>
                    </td>
                    <td style="padding:12px 14px;"><span class="status-badge badge-active" style="font-size:10px;">${file.format}</span></td>
                    <td style="padding:12px 14px; color:#475569; font-weight:500;">${file.size}</td>
                    <td style="padding:12px 14px;"><span class="status-badge badge-done" style="font-size:10px;"><i class="fa-solid fa-circle-check"></i> AI READY</span></td>
                    <td style="padding:12px 14px; color:#64748b; font-size:11.5px;">${file.created}</td>
                    <td style="padding:12px 14px; text-align:right;">
                        <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="event.stopPropagation(); window.selectAsset('${file.id}', 'file')"><i class="fa-solid fa-eye"></i> Detail</button>
                    </td>
                </tr>
            `;
        });

        listTbody.innerHTML = tableHtml;
    }
};

window.selectAsset = function(id, type = 'file') {
    selectedAssetId = id;
    selectedAssetType = type;

    // Update active highlight classes
    document.querySelectorAll('.asset-item-card').forEach(c => {
        c.classList.toggle('asset-selected', c.getAttribute('data-asset-id') === id);
    });

    // Update Inspector Sidebar Data
    const titleEl = document.getElementById('assetInspectorTitle');
    const subEl = document.getElementById('assetInspectorSub');
    const previewEl = document.getElementById('assetInspectorPreview');
    const iconBookmark = document.getElementById('iconAssetBookmark');
    const dimEl = document.getElementById('infoAssetDimensions');
    const colorEl = document.getElementById('infoAssetColorSpace');
    const dpiEl = document.getElementById('infoAssetDpi');
    const uploaderEl = document.getElementById('infoAssetUploader');
    const createdEl = document.getElementById('infoAssetCreated');
    const scoreEl = document.getElementById('infoAssetAiScore');
    const badgeEl = document.getElementById('assetInspectorBadge');

    if (type === 'file') {
        const file = brandFilesData.find(f => f.id === id) || brandFilesData[0];
        if (!file) return;

        if (titleEl) titleEl.textContent = file.name;
        if (subEl) subEl.textContent = `Berkas Format ${file.format} • ${file.size}`;
        
        if (previewEl) {
            previewEl.style.background = file.previewBg;
            previewEl.innerHTML = `
                <i class="fa-solid ${file.icon}" style="font-size:44px; opacity:0.9; margin-bottom:8px;"></i>
                <span style="font-size:11px; font-weight:600; opacity:0.9;">${file.previewMeta}</span>
            `;
        }

        if (iconBookmark) {
            iconBookmark.className = file.bookmarked ? 'fa-solid fa-star' : 'fa-regular fa-star';
            iconBookmark.style.color = file.bookmarked ? '#f59e0b' : 'inherit';
        }

        if (dimEl) dimEl.textContent = file.dim;
        if (colorEl) colorEl.textContent = file.colorSpace;
        if (dpiEl) dpiEl.textContent = file.dpi;
        if (uploaderEl) uploaderEl.textContent = file.uploader;
        if (createdEl) createdEl.textContent = file.created;
        if (scoreEl) scoreEl.textContent = file.aiScore;
        if (badgeEl) {
            badgeEl.className = 'status-badge badge-done';
            badgeEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> AI READY';
        }
    } else {
        const folder = brandFoldersData.find(f => f.id === id);
        if (!folder) return;

        if (titleEl) titleEl.textContent = folder.name;
        if (subEl) subEl.textContent = `Folder Direktori • ${folder.count} Berkas Terkandung`;
        
        if (previewEl) {
            previewEl.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
            previewEl.innerHTML = `
                <i class="fa-solid fa-folder-open" style="font-size:48px; opacity:0.9; margin-bottom:8px;"></i>
                <span style="font-size:11px; font-weight:600; opacity:0.9;">${folder.count} Item • ${folder.size}</span>
            `;
        }

        if (dimEl) dimEl.textContent = 'Folder Container';
        if (colorEl) colorEl.textContent = 'N/A';
        if (dpiEl) dpiEl.textContent = 'N/A';
        if (uploaderEl) uploaderEl.textContent = 'Astacode Team';
        if (createdEl) createdEl.textContent = folder.modified;
        if (scoreEl) scoreEl.textContent = '100% (Struktur Terindeks)';
        if (badgeEl) {
            badgeEl.className = 'status-badge badge-draft';
            badgeEl.innerHTML = '<i class="fa-solid fa-folder"></i> DIREKTORI';
        }
    }
};

window.toggleAssetBookmark = function() {
    if (selectedAssetType === 'file') {
        const file = brandFilesData.find(f => f.id === selectedAssetId);
        if (file) {
            file.bookmarked = !file.bookmarked;
            const icon = document.getElementById('iconAssetBookmark');
            if (icon) {
                icon.className = file.bookmarked ? 'fa-solid fa-star' : 'fa-regular fa-star';
                icon.style.color = file.bookmarked ? '#f59e0b' : 'inherit';
            }
            window.showToast(file.bookmarked ? `⭐ Aset "${file.name}" ditambahkan ke Favorit!` : `Aset "${file.name}" dihapus dari Favorit`, 'info');
        }
    } else {
        window.showToast('Fitur bookmark hanya untuk berkas aset visual.', 'info');
    }
};

window.openCreateFolderModal = function() {
    const modal = document.getElementById('createFolderModal');
    if (modal) {
        document.getElementById('inputNewFolderName').value = '';
        const parentSelect = document.getElementById('selectNewFolderParent');
        if (parentSelect) parentSelect.value = currentAssetFolder;
        modal.style.display = 'flex';
    }
};

window.closeCreateFolderModal = function() {
    const modal = document.getElementById('createFolderModal');
    if (modal) modal.style.display = 'none';
};

window.handleCreateFolderSubmit = function(e) {
    e.preventDefault();
    const name = (document.getElementById('inputNewFolderName')?.value || '').trim();
    const parent = document.getElementById('selectNewFolderParent')?.value || 'root';
    const color = document.querySelector('input[name="folderColorRadio"]:checked')?.value || '#3b82f6';

    if (!name) return;

    const newFolderId = 'folder-' + Date.now();
    brandFoldersData.push({
        id: newFolderId,
        name: name,
        parent: parent,
        color: color,
        count: 0,
        size: '0 KB',
        modified: 'Hari ini, Baru saja'
    });

    window.closeCreateFolderModal();
    window.renderAssetView();
    window.selectAsset(newFolderId, 'folder');
    window.showToast(`📁 Folder "${name}" berhasil dibuat!`, 'success');
};

window.openUploadAssetModal = function() {
    const modal = document.getElementById('uploadAssetModal');
    if (modal) {
        const dropContent = document.getElementById('dropzoneContent');
        const dropSelected = document.getElementById('dropzoneSelectedFile');
        if (dropContent) dropContent.style.display = 'block';
        if (dropSelected) dropSelected.style.display = 'none';
        
        document.getElementById('inputUploadAssetName').value = '';
        const targetSelect = document.getElementById('selectUploadTargetFolder');
        if (targetSelect) targetSelect.value = currentAssetFolder;

        modal.style.display = 'flex';
    }
};

window.closeUploadAssetModal = function() {
    const modal = document.getElementById('uploadAssetModal');
    if (modal) modal.style.display = 'none';
};

window.handleAssetFileSelected = function(e) {
    const file = e.target.files[0];
    if (file) {
        const dropContent = document.getElementById('dropzoneContent');
        const dropSelected = document.getElementById('dropzoneSelectedFile');
        const nameInput = document.getElementById('inputUploadAssetName');
        const formatSelect = document.getElementById('selectUploadAssetFormat');

        if (dropContent) dropContent.style.display = 'none';
        if (dropSelected) dropSelected.style.display = 'flex';
        
        const lblName = document.getElementById('lblSelectedFileName');
        const lblSize = document.getElementById('lblSelectedFileSize');
        if (lblName) lblName.textContent = file.name;
        if (lblSize) lblSize.textContent = `(${(file.size / (1024*1024)).toFixed(1)} MB)`;
        
        if (nameInput) nameInput.value = file.name;
        
        const ext = file.name.split('.').pop().toUpperCase();
        if (formatSelect && ['PNG', 'SVG', 'JPG', 'PDF', 'MP4', 'TTF'].includes(ext)) {
            formatSelect.value = ext;
        }
    }
};

window.handleUploadAssetSubmit = function(e) {
    e.preventDefault();
    const name = (document.getElementById('inputUploadAssetName')?.value || 'asset.png').trim();
    const format = document.getElementById('selectUploadAssetFormat')?.value || 'PNG';
    const folder = document.getElementById('selectUploadTargetFolder')?.value || 'root';
    const btnSubmit = document.getElementById('btnSubmitUploadAsset');

    if (btnSubmit) {
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah & Indexing AI...';
        btnSubmit.disabled = true;
    }

    setTimeout(() => {
        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Unggah Sekarang';
            btnSubmit.disabled = false;
        }

        const newId = 'file-' + Date.now();
        let icon = 'fa-image';
        let bg = 'linear-gradient(135deg, #0284c7, #0369a1)';
        if (format === 'PDF') { icon = 'fa-file-pdf'; bg = 'linear-gradient(135deg, #ef4444, #b91c1c)'; }
        else if (format === 'SVG') { icon = 'fa-vector-square'; bg = 'linear-gradient(135deg, #8b5cf6, #6d28d9)'; }
        else if (format === 'TTF') { icon = 'fa-font'; bg = 'linear-gradient(135deg, #334155, #475569)'; }
        else if (format === 'MP4') { icon = 'fa-video'; bg = 'linear-gradient(135deg, #0f172a, #1e293b)'; }

        brandFilesData.unshift({
            id: newId,
            name: name,
            folder: folder,
            format: format,
            size: '3.8 MB',
            dim: '2560 × 1440 px',
            colorSpace: 'sRGB (AI Validated)',
            dpi: '300 DPI',
            uploader: 'Asisyah Sarah (PM)',
            created: 'Hari ini, Baru saja',
            aiScore: '99% (AI Indexed & Vector Clean)',
            icon: icon,
            previewType: 'image',
            previewBg: bg,
            previewMeta: `${format} • High-Res AI Ready`,
            bookmarked: false
        });

        window.closeUploadAssetModal();
        window.navigateToAssetFolder(folder);
        window.selectAsset(newId, 'file');
        window.showToast(`✨ Berkas "${name}" berhasil diunggah dan terindeks AI DAM Studio!`, 'success');
    }, 800);
};

window.openRenameAssetModal = function() {
    const modal = document.getElementById('renameAssetModal');
    if (!modal) return;

    const inputVal = document.getElementById('inputRenameAssetVal');
    const targetId = document.getElementById('renameAssetTargetId');

    if (selectedAssetType === 'file') {
        const item = brandFilesData.find(f => f.id === selectedAssetId);
        if (item && inputVal) {
            inputVal.value = item.name;
            targetId.value = item.id;
        }
    } else {
        const item = brandFoldersData.find(f => f.id === selectedAssetId);
        if (item && inputVal) {
            inputVal.value = item.name;
            targetId.value = item.id;
        }
    }

    modal.style.display = 'flex';
};

window.closeRenameAssetModal = function() {
    const modal = document.getElementById('renameAssetModal');
    if (modal) modal.style.display = 'none';
};

window.handleRenameAssetSubmit = function(e) {
    e.preventDefault();
    const newName = (document.getElementById('inputRenameAssetVal')?.value || '').trim();
    if (!newName) return;

    if (selectedAssetType === 'file') {
        const item = brandFilesData.find(f => f.id === selectedAssetId);
        if (item) {
            item.name = newName;
            window.selectAsset(item.id, 'file');
        }
    } else {
        const item = brandFoldersData.find(f => f.id === selectedAssetId);
        if (item) {
            item.name = newName;
            window.selectAsset(item.id, 'folder');
        }
    }

    window.closeRenameAssetModal();
    window.renderAssetView();
    window.showToast(`✏️ Nama aset berhasil diperbarui menjadi "${newName}"!`, 'success');
};

function initAssetLibraryHub() {
    // 1. Initial Render
    window.renderAssetView();
    window.selectAsset('file-office-lobby', 'file');

    // 2. View Mode Toggle (Grid vs List)
    const btnGrid = document.getElementById('btnAssetGridView');
    const btnList = document.getElementById('btnAssetListView');
    const gridContainer = document.getElementById('assetGridContainer');
    const listContainer = document.getElementById('assetListContainer');

    if (btnGrid && btnList) {
        btnGrid.addEventListener('click', () => {
            currentAssetViewMode = 'grid';
            btnGrid.classList.add('active');
            btnList.classList.remove('active');
            if (gridContainer) gridContainer.style.display = 'grid';
            if (listContainer) listContainer.style.display = 'none';
            window.renderAssetView();
        });

        btnList.addEventListener('click', () => {
            currentAssetViewMode = 'list';
            btnList.classList.add('active');
            btnGrid.classList.remove('active');
            if (gridContainer) gridContainer.style.display = 'none';
            if (listContainer) listContainer.style.display = 'block';
            window.renderAssetView();
        });
    }

    // 3. Search & Sort Handlers
    const inputSearch = document.getElementById('inputSearchAssets');
    const selectSort = document.getElementById('selectSortAssets');
    if (inputSearch) inputSearch.addEventListener('input', window.renderAssetView);
    if (selectSort) selectSort.addEventListener('change', window.renderAssetView);

    // 4. Action Buttons (Header Toolbar)
    const btnNewFolder = document.getElementById('btnOpenNewFolderModal');
    if (btnNewFolder) btnNewFolder.addEventListener('click', window.openCreateFolderModal);

    const btnUpload = document.getElementById('btnOpenUploadAssetModal');
    if (btnUpload) btnUpload.addEventListener('click', window.openUploadAssetModal);

    // 5. Inspector Sidebar Action Triggers
    const btnBookmark = document.getElementById('btnAssetBookmark');
    if (btnBookmark) btnBookmark.addEventListener('click', window.toggleAssetBookmark);

    const btnRename = document.getElementById('btnAssetRename');
    if (btnRename) btnRename.addEventListener('click', window.openRenameAssetModal);

    const btnShare = document.getElementById('btnAssetShare');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            const fileName = document.getElementById('assetInspectorTitle')?.textContent || 'asset.png';
            const cdnUrl = `https://cdn.astacode.com/dam/2026/${encodeURIComponent(fileName)}`;
            navigator.clipboard.writeText(cdnUrl).then(() => {
                window.showToast(`🔗 Tautan CDN untuk "${fileName}" berhasil disalin!`, 'success');
            }).catch(() => {
                window.showToast(`Tautan CDN: ${cdnUrl}`, 'info');
            });
        });
    }

    const btnDelete = document.getElementById('btnAssetDelete');
    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            const fileName = document.getElementById('assetInspectorTitle')?.textContent || 'Aset';
            if (confirm(`Apakah Anda yakin ingin menghapus "${fileName}" dari Brand Asset Library?`)) {
                if (selectedAssetType === 'file') {
                    const idx = brandFilesData.findIndex(f => f.id === selectedAssetId);
                    if (idx > -1) brandFilesData.splice(idx, 1);
                } else {
                    const idx = brandFoldersData.findIndex(f => f.id === selectedAssetId);
                    if (idx > -1) brandFoldersData.splice(idx, 1);
                }
                window.showToast(`🗑️ "${fileName}" telah dihapus.`, 'warning');
                window.renderAssetView();
                // Select first available file
                if (brandFilesData.length > 0) {
                    window.selectAsset(brandFilesData[0].id, 'file');
                }
            }
        });
    }

    // 6. Use in AI Engine Button
    const btnUseAi = document.getElementById('btnUseAssetInAIEngine');
    if (btnUseAi) {
        btnUseAi.addEventListener('click', () => {
            const fileName = document.getElementById('assetInspectorTitle')?.textContent || 'office_lobby_bg.png';
            window.switchMarketingPage('ai-engine');
            window.showToast(`🪄 Aset "${fileName}" berhasil dipasangkan ke AI Content Engine Studio!`, 'success');
        });
    }

    // 7. Download Button
    const btnDownload = document.getElementById('btnDownloadInspectorAsset');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const fileName = document.getElementById('assetInspectorTitle')?.textContent || 'asset_digital.png';
            window.showToast(`📥 Memulai pengunduhan berkas "${fileName}" (High-Res)...`, 'info');
            setTimeout(() => {
                window.showToast(`✅ "${fileName}" berhasil diunduh ke komputer Anda!`, 'success');
            }, 600);
        });
    }
}

// --- APPROVAL QUEUE ACTIONS ---
function initApprovalQueue() {
    document.querySelectorAll('#view-approval-queue table tbody tr').forEach(row => {
        const checkBtn = row.querySelector('.fa-check')?.closest('button');
        const xBtn = row.querySelector('.fa-xmark')?.closest('button');

        if (checkBtn) {
            checkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const title = row.querySelector('td:first-child').textContent.trim();
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge badge-done';
                    statusBadge.innerHTML = '<i class="fa-solid fa-check"></i> APPROVED';
                }
                row.style.background = '#f0fdf4';
                window.showToast(`✅ Konten "${title}" telah disetujui untuk dipublikasikan!`, 'success');
            });
        }

        if (xBtn) {
            xBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const title = row.querySelector('td:first-child').textContent.trim();
                const reason = prompt(`Berikan catatan revisi untuk "${title}":`, "Tolong ganti hook awal agar lebih menarik.");
                if (reason) {
                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge badge-draft';
                        statusBadge.innerHTML = '<i class="fa-solid fa-rotate"></i> REVISI AI';
                    }
                    window.showToast(`🔄 AI meregenerasi konten berdasarkan catatan: "${reason}"`, 'warning');
                }
            });
        }
    });
}

// ============================================================================
// --- SOCIAL LISTENING & COMPETITOR INTELLIGENCE ENGINE ---
// ============================================================================

let competitorsData = [
    {
        id: 'comp-1',
        handle: '@AgencyWebJkt',
        platform: 'Instagram',
        avatarBg: '#e11d48',
        avatarText: 'K',
        niche: 'Web Agency & Tech House',
        viralTopic: 'Berapa Modal Bikin Website E-Commerce di 2026?',
        reach: '1.2M',
        trendIcon: 'fa-arrow-trend-up',
        trendStatus: 'viral',
        recommendationBadge: '⚡ BUAT TANDINGAN',
        badgeClass: 'badge-warning',
        badgeStyle: 'background:#fef9c3; color:#a16207;',
        rowBg: '#fefce8',
        engRate: '8.4%',
        sentiment: 'Kritis (72%)',
        insight: 'Konten kompetitor menimbulkan banyak perdebatan karena estimasi biaya mereka terlalu mahal & usang. Ini celah emas bagi Astacode untuk membuat konten edukasi tandingan dengan kalkulator pricing riil!',
        recentPosts: [
            { title: 'Panduan Memilih Hosting Serverless vs VPS', views: '840K' },
            { title: '5 Alasan Kenapa Klien Batal Pesan Aplikasi', views: '610K' },
            { title: 'Gaji Software Engineer vs Product Manager 2026', views: '490K' }
        ]
    },
    {
        id: 'comp-2',
        handle: '@TechStartupIndo',
        platform: 'TikTok',
        avatarBg: '#0f172a',
        avatarText: 'T',
        niche: 'Software & ERP Solution',
        viralTopic: 'Kenapa Perusahaan Mulai Meninggalkan React?',
        reach: '450K',
        trendIcon: 'fa-minus',
        trendStatus: 'pantau',
        recommendationBadge: 'PANTAU DULU',
        badgeClass: 'status-badge',
        badgeStyle: 'background:#f1f5f9; color:#475569;',
        rowBg: '#ffffff',
        engRate: '5.1%',
        sentiment: 'Netral (55%)',
        insight: 'Topik berkutat pada perdebatan framework Vite vs Next.js. Belum perlu respons darurat, tapi cukup diamati jika ada lonjakan pertanyaan audiens.',
        recentPosts: [
            { title: 'Tips Lolos Interview Backend Laravel 11', views: '320K' },
            { title: 'Beda Developer Junior vs Senior di Mata HR', views: '280K' },
            { title: 'Review MacBook M3 buat Coding Docker', views: '210K' }
        ]
    },
    {
        id: 'comp-3',
        handle: '@CloudArchitectID',
        platform: 'LinkedIn',
        avatarBg: '#0284c7',
        avatarText: 'C',
        niche: 'AI Tools & Automation',
        viralTopic: 'Kenapa Serverless Lebih Hemat Biaya Dibanding Kubernetes?',
        reach: '890K',
        trendIcon: 'fa-arrow-trend-up',
        trendStatus: 'viral',
        recommendationBadge: '⚡ BUAT TANDINGAN',
        badgeClass: 'badge-warning',
        badgeStyle: 'background:#fef9c3; color:#a16207;',
        rowBg: '#fefce8',
        engRate: '9.2%',
        sentiment: 'Pro-Kontra (68%)',
        insight: 'Banyak CTO & Tech Lead mengeluhkan cold-start latency di serverless. Buat postingan perbandingan arsitektur hybrid Astacode Cloud ERP.',
        recentPosts: [
            { title: 'Benchmark PostgreSQL 16 vs MySQL 8.4', views: '540K' },
            { title: 'Arsitektur Multi-Tenant SaaS B2B', views: '430K' },
            { title: 'Migrasi Monolith ke Microservices Gagal Total', views: '380K' }
        ]
    },
    {
        id: 'comp-4',
        handle: '@DevOpsIndonesia',
        platform: 'YouTube',
        avatarBg: '#dc2626',
        avatarText: 'D',
        niche: 'EduTech & Coding Bootcamp',
        viralTopic: 'Setup CI/CD Pipeline Enterprise Tanpa Docker Ribet',
        reach: '320K',
        trendIcon: 'fa-arrow-trend-up',
        trendStatus: 'counter',
        recommendationBadge: 'COUNTER ARGUMENT',
        badgeClass: 'badge-active',
        badgeStyle: 'background:#e0f2fe; color:#0369a1;',
        rowBg: '#f0f9ff',
        engRate: '7.8%',
        sentiment: 'Edukasi (80%)',
        insight: 'Video tersebut mengabaikan aspek container isolation. Kita bisa buat Reels singkat mengenai risiko keamanan tanpa Docker container di server produksi.',
        recentPosts: [
            { title: 'Tutorial GitHub Actions Auto-Deploy VPS', views: '290K' },
            { title: 'Monitoring Server Pakai Prometheus & Grafana', views: '240K' },
            { title: 'Kunci Sukses Lolos Sertifikasi AWS Solutions Architect', views: '180K' }
        ]
    }
];

let activeSelectedCompDetail = null;

window.renderCompetitorsTable = function() {
    const tbody = document.getElementById('tbodySocialCompetitors');
    if (!tbody) return;

    const searchQuery = (document.getElementById('inputSearchCompetitors')?.value || '').toLowerCase().trim();
    const platformFilter = document.getElementById('selectFilterCompetitorPlatform')?.value || 'all';
    const trendFilter = document.getElementById('selectFilterCompetitorTrend')?.value || 'all';

    const filtered = competitorsData.filter(item => {
        const matchSearch = !searchQuery || 
            item.handle.toLowerCase().includes(searchQuery) || 
            item.viralTopic.toLowerCase().includes(searchQuery) ||
            item.niche.toLowerCase().includes(searchQuery);
        
        const matchPlatform = platformFilter === 'all' || item.platform.toLowerCase() === platformFilter.toLowerCase();
        const matchTrend = trendFilter === 'all' || item.trendStatus === trendFilter;

        return matchSearch && matchPlatform && matchTrend;
    });

    const countEl = document.getElementById('competitorTotalCount');
    if (countEl) countEl.textContent = `${filtered.length} Target Dipantau`;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="padding:36px; text-align:center; color:#94a3b8;">
                    <i class="fa-solid fa-radar" style="font-size:32px; margin-bottom:8px; opacity:0.5;"></i>
                    <div style="font-weight:600; color:#64748b;">Tidak ada data kompetitor yang cocok</div>
                    <div style="font-size:11.5px; margin-top:2px;">Ubah filter atau klik "+ Tambah Kompetitor" untuk memantau brand baru.</div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    filtered.forEach(item => {
        html += `
            <tr style="border-bottom:1px solid var(--border-light); background:${item.rowBg}; transition:all 0.15s ease;" data-comp-id="${item.id}">
                <td style="padding:12px 18px;"><input type="checkbox" class="chk-comp-item" value="${item.id}" style="cursor:pointer;"></td>
                <td style="padding:12px 16px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:34px; height:34px; background:${item.avatarBg}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0;">
                            ${item.avatarText}
                        </div>
                        <div>
                            <strong style="color:var(--text-primary); font-weight:700; font-size:13px; display:block;">${item.handle}</strong>
                            <span style="color:#64748b; font-size:11px;">${item.platform} • ${item.niche}</span>
                        </div>
                    </div>
                </td>
                <td style="padding:12px 16px; color:#1e293b; font-weight:600; font-size:12.5px;">
                    "${item.viralTopic}"
                </td>
                <td style="padding:12px 16px; font-weight:700; color:${item.trendStatus === 'viral' ? 'var(--status-danger)' : '#0f172a'};">
                    ${item.reach} <i class="fa-solid ${item.trendIcon}" style="font-size:10px; margin-left:2px;"></i>
                </td>
                <td style="padding:12px 16px;">
                    <span class="status-badge ${item.badgeClass}" style="${item.badgeStyle} font-size:10px; font-weight:700;">
                        ${item.recommendationBadge}
                    </span>
                </td>
                <td style="padding:12px 18px; text-align:right;">
                    <div style="display:inline-flex; gap:6px;">
                        <button class="btn btn-outline btn-view-competitor-data" 
                                onclick="window.openCompetitorDetailModal('${item.id}')"
                                style="font-size:11.5px; padding:5px 10px; height:auto; background:#fff;" 
                                title="Lihat Analisis Detail">
                            <i class="fa-solid fa-chart-pie"></i> Lihat Data
                        </button>
                        <button class="btn btn-primary btn-execute-ai-counter" 
                                onclick="window.executeAiCounterTopic('${item.viralTopic.replace(/'/g, "\\'")}', '${item.handle}')"
                                style="font-size:11.5px; padding:5px 12px; height:auto;" 
                                title="Kirim ke AI Engine untuk Buat Tandingan">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Eksekusi AI
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
};

window.openAddCompetitorModal = function() {
    const modal = document.getElementById('addCompetitorModal');
    if (modal) {
        document.getElementById('inputCompetitorHandle').value = '';
        document.getElementById('inputCompetitorUrl').value = '';
        modal.style.display = 'flex';
    }
};

window.closeAddCompetitorModal = function() {
    const modal = document.getElementById('addCompetitorModal');
    if (modal) modal.style.display = 'none';
};

window.handleAddCompetitorSubmit = function(e) {
    e.preventDefault();
    const handle = (document.getElementById('inputCompetitorHandle')?.value || '').trim();
    const platform = document.getElementById('selectCompetitorPlatform')?.value || 'Instagram';
    const niche = document.getElementById('selectCompetitorNiche')?.value || 'Software & ERP Solution';

    if (!handle) return;

    const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const initialChar = formattedHandle.replace('@', '').charAt(0).toUpperCase() || 'C';

    let avatarBg = '#2563eb';
    if (platform === 'Instagram') avatarBg = '#e11d48';
    else if (platform === 'TikTok') avatarBg = '#0f172a';
    else if (platform === 'YouTube') avatarBg = '#dc2626';
    else if (platform === 'LinkedIn') avatarBg = '#0284c7';

    const newId = 'comp-' + Date.now();
    competitorsData.unshift({
        id: newId,
        handle: formattedHandle,
        platform: platform,
        avatarBg: avatarBg,
        avatarText: initialChar,
        niche: niche,
        viralTopic: `Strategi ${niche} Terbaik di Era AI 2026`,
        reach: '150K',
        trendIcon: 'fa-arrow-trend-up',
        trendStatus: 'viral',
        recommendationBadge: '⚡ BUAT TANDINGAN',
        badgeClass: 'badge-warning',
        badgeStyle: 'background:#fef9c3; color:#a16207;',
        rowBg: '#fefce8',
        engRate: '6.5%',
        sentiment: 'Tinggi (65%)',
        insight: `Akun ${formattedHandle} baru terhubung ke Webhook Social Listening. AI mendeteksi lonjakan audiens seputar inovasi ${niche}. Siapkan konten tandingan edukatif sekarang!`,
        recentPosts: [
            { title: `Rahasia Scale-up Bisnis Menggunakan ${niche}`, views: '150K' },
            { title: 'Mengapa Solusi Manual Mulai Ditinggalkan?', views: '98K' },
            { title: 'Review Implementasi Cloud Software di 2026', views: '75K' }
        ]
    });

    window.closeAddCompetitorModal();
    window.renderCompetitorsTable();
    window.showToast(`🎯 Target ${formattedHandle} (${platform}) berhasil ditambahkan ke Social Listening Crawler!`, 'success');
};

window.openCompetitorDetailModal = function(compId) {
    const comp = competitorsData.find(c => c.id === compId) || competitorsData[0];
    if (!comp) return;

    activeSelectedCompDetail = comp;

    const titleEl = document.getElementById('modalCompetitorTitle');
    const subEl = document.getElementById('modalCompetitorSub');
    const viewsEl = document.getElementById('modalCompViews');
    const engageEl = document.getElementById('modalCompEngage');
    const sentimentEl = document.getElementById('modalCompSentiment');
    const topicEl = document.getElementById('modalCompTopic');
    const insightEl = document.getElementById('modalCompAiInsight');

    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-chart-pie" style="color:var(--brand-primary); margin-right:6px;"></i> Analisis Intelijen: ${comp.handle} (${comp.platform})`;
    if (subEl) subEl.textContent = `Niche: ${comp.niche} • AI Live Monitoring Aktif`;
    if (viewsEl) viewsEl.textContent = comp.reach;
    if (engageEl) engageEl.textContent = comp.engRate;
    if (sentimentEl) sentimentEl.textContent = comp.sentiment;
    if (topicEl) topicEl.textContent = `"${comp.viralTopic}"`;
    if (insightEl) insightEl.innerHTML = `<strong>AI Insight & Opportunity:</strong> ${comp.insight}`;

    const btnExec = document.getElementById('btnModalExecuteAiCounter');
    if (btnExec) {
        btnExec.onclick = () => {
            window.closeCompetitorDetailModal();
            window.executeAiCounterTopic(comp.viralTopic, comp.handle);
        };
    }

    const modal = document.getElementById('competitorDetailModal');
    if (modal) modal.style.display = 'flex';
};

window.closeCompetitorDetailModal = function() {
    const modal = document.getElementById('competitorDetailModal');
    if (modal) modal.style.display = 'none';
};

window.executeAiCounterTopic = function(topic, handle) {
    // Switch to AI Content Engine view
    window.switchMarketingPage('ai-engine');

    // Find active sprint row or first row
    const targetRow = document.querySelector('.sprint-row.active-row') || document.querySelector('.sprint-row');
    const counterTopicText = `Tandingan ${handle}: ${topic}`;

    if (targetRow) {
        const input = targetRow.querySelector('.topic-input');
        if (input) input.value = counterTopicText;
        const day = parseInt(targetRow.getAttribute('data-day')) || 1;
        if (sprintData[day]) {
            sprintData[day].topic = counterTopicText;
            renderPreviewForDay(day);
        }
    }

    const quickTopic = document.getElementById('quickGenTopic');
    if (quickTopic) {
        quickTopic.value = counterTopicText;
    }

    window.showToast(`🎯 Topik tandingan dari ${handle} berhasil dimuat ke AI Content Engine!`, 'success');
};

function initSocialListeningActions() {
    // 1. Initial Render
    window.renderCompetitorsTable();

    // 2. Open Modal Trigger
    const btnOpenAdd = document.getElementById('btnOpenAddCompetitorModal');
    if (btnOpenAdd) {
        btnOpenAdd.addEventListener('click', window.openAddCompetitorModal);
    }

    // 3. Search and Filters
    const inputSearch = document.getElementById('inputSearchCompetitors');
    const selectPlatform = document.getElementById('selectFilterCompetitorPlatform');
    const selectTrend = document.getElementById('selectFilterCompetitorTrend');

    if (inputSearch) inputSearch.addEventListener('input', window.renderCompetitorsTable);
    if (selectPlatform) selectPlatform.addEventListener('change', window.renderCompetitorsTable);
    if (selectTrend) selectTrend.addEventListener('change', window.renderCompetitorsTable);

    // 4. Refresh / Sync Crawler
    const btnRefresh = document.getElementById('btnRefreshCompetitorData');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            const icon = btnRefresh.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            btnRefresh.disabled = true;

            setTimeout(() => {
                if (icon) icon.classList.remove('fa-spin');
                btnRefresh.disabled = false;
                window.renderCompetitorsTable();
                window.showToast('🔄 AI Crawler berhasil memindai 4 platform! Metrik views kompetitor diperbarui.', 'success');
            }, 800);
        });
    }

    // 5. Select All & Bulk Delete
    const chkSelectAll = document.getElementById('chkSelectAllCompetitors');
    if (chkSelectAll) {
        chkSelectAll.addEventListener('change', () => {
            const isChecked = chkSelectAll.checked;
            document.querySelectorAll('.chk-comp-item').forEach(c => c.checked = isChecked);
        });
    }

    const btnBulkDelete = document.getElementById('btnBulkDeleteCompetitors');
    if (btnBulkDelete) {
        btnBulkDelete.addEventListener('click', () => {
            const checkedBoxes = document.querySelectorAll('.chk-comp-item:checked');
            if (checkedBoxes.length === 0) {
                window.showToast('Pilih setidaknya satu target kompetitor untuk dihapus.', 'warning');
                return;
            }

            if (confirm(`Hapus ${checkedBoxes.length} kompetitor terpilih dari radar Social Listening?`)) {
                const idsToDelete = Array.from(checkedBoxes).map(c => c.value);
                competitorsData = competitorsData.filter(c => !idsToDelete.includes(c.id));
                window.renderCompetitorsTable();
                window.showToast(`🗑️ ${checkedBoxes.length} kompetitor berhasil dihapus dari pantauan.`, 'info');
            }
        });
    }
}

// --- ANALYTICS CHART ---
function initAnalyticsChart() {
    const ctxPerf = document.getElementById('performanceChart');
    if (ctxPerf && !ctxPerf.chartInstance) {
        ctxPerf.chartInstance = new Chart(ctxPerf, {
            type: 'line',
            data: {
                labels: ['1 Oct', '5 Oct', '10 Oct', '15 Oct', '20 Oct', '25 Oct', '30 Oct'],
                datasets: [
                    {
                        label: 'Instagram Reach',
                        data: [12000, 15000, 14500, 22000, 21000, 25000, 28000],
                        borderColor: '#e11d48',
                        backgroundColor: 'rgba(225, 29, 72, 0.08)',
                        borderWidth: 2.5,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'TikTok Views',
                        data: [8000, 12000, 11000, 19000, 18500, 26000, 31000],
                        borderColor: '#0f172a',
                        backgroundColor: 'rgba(15, 23, 42, 0.05)',
                        borderWidth: 2.5,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Blog Visitors',
                        data: [3000, 3200, 3100, 3800, 3700, 4200, 4500],
                        borderColor: '#2563eb',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [4, 4], color: '#e5e7eb' },
                        ticks: { font: { family: 'Inter', size: 11 }, color: '#6b7280' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 11 }, color: '#6b7280' }
                    }
                }
            }
        });
    }
}

// ============================================================================
// --- DISTRIBUTION MANAGER & MULTI-CHANNEL DISTRIBUTION HUB LOGIC ---
// ============================================================================

// Mock JSON payload store for HTTP inspector
const mockPayloadLogs = {
    'LOG-89101': {
        method: 'POST',
        endpoint: 'https://graph.facebook.com/v19.0/17841400/media_publish',
        statusCode: '200 OK',
        statusColor: '#059669',
        request: {
            platform: 'instagram',
            account_id: '17841400_astacode',
            media_type: 'CAROUSEL',
            children_count: 5,
            caption: 'Tips Arsitektur Software 2026 🚀\n\nSimak rincian implementasinya! 👇\n\n#AstacodeTech #SoftwareDevelopment',
            published: true,
            utm_tags: {
                source: 'instagram',
                medium: 'social_carousel',
                campaign: 'sprint_batch_q4_2026'
            }
        },
        response: {
            id: '17928491028301994',
            status: 'published',
            timestamp: '2026-10-30T10:00:14+07:00',
            permalink: 'https://www.instagram.com/p/DB189201/',
            execution_node: 'edge-sg-singapore-01',
            response_time_ms: 840
        }
    },
    'LOG-89102': {
        method: 'POST',
        endpoint: 'https://open-api.tiktok.com/v2/post/publish/video/init/',
        statusCode: '429 Rate Limited',
        statusColor: '#e11d48',
        request: {
            platform: 'tiktok',
            account_handle: '@asta.marketing',
            post_mode: 'DIRECT_POST',
            video_url: 'https://cdn.astacode.com/rendered/vid_react_crash_course_2026.mp4',
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_stitch: false,
            title: 'React Crash Course 2026 - Fitur Wajib yang Perlu Kamu Tahu #ReactJS #WebDev'
        },
        response: {
            error: {
                code: 'rate_limit_exceeded',
                message: 'You have reached the maximum allowed direct publish calls for this hour. Please retry after backoff interval.',
                retry_after_seconds: 60,
                request_id: 'req_tiktok_8921a99f01'
            }
        }
    },
    'LOG-89103': {
        method: 'POST',
        endpoint: 'https://blog.astacode.com/wp-json/wp/v2/posts',
        statusCode: '201 Created',
        statusColor: '#059669',
        request: {
            platform: 'wordpress_headless_rest',
            title: 'Optimasi Database PostgreSQL ERP Enterprise 2026',
            status: 'publish',
            categories: [12, 45],
            tags: ['PostgreSQL', 'Database', 'ERP', 'Performance'],
            meta: {
                _yoast_wpseo_title: 'Optimasi Database PostgreSQL untuk ERP Skala Besar',
                _yoast_wpseo_metadesc: 'Panduan lengkap indexing B-Tree, connection pooling pgBouncer, dan EXPLAIN ANALYZE 2026.',
                _yoast_wpseo_focuskw: 'Optimasi PostgreSQL ERP'
            }
        },
        response: {
            id: 8842,
            date: '2026-10-29T09:00:05+07:00',
            slug: 'optimasi-database-postgresql-erp-enterprise-2026',
            link: 'https://blog.astacode.com/optimasi-database-postgresql-erp-enterprise-2026/',
            seo_score: '94/100',
            response_time_ms: 620
        }
    },
    'LOG-89104': {
        method: 'POST',
        endpoint: 'https://api.linkedin.com/v2/ugcPosts',
        statusCode: '200 OK',
        statusColor: '#059669',
        request: {
            author: 'urn:li:organization:89201948',
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: 'Next.js 14 Enterprise Architecture Benchmark. Simak analisis performa Server Actions pada high-traffic load!'
                    },
                    shareMediaCategory: 'ARTICLE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        },
        response: {
            id: 'urn:li:share:7198201928401928',
            activity: 'urn:li:activity:7198201928401929',
            status: 'success',
            response_time_ms: 910
        }
    },
    'LOG-89105': {
        method: 'POST',
        endpoint: 'https://graph.facebook.com/v19.0/act_892104/adcreatives',
        statusCode: '200 OK (In Review)',
        statusColor: '#059669',
        request: {
            account_id: 'act_892104',
            campaign_id: 'cmp_retargeting_q4',
            adset_id: 'adset_tech_leads_jakarta',
            creative: {
                name: 'Creative Q4 ERP Demo',
                object_story_spec: {
                    page_id: '442109',
                    link_data: {
                        link: 'https://astacode.com/erp-solution?utm_source=meta_ads',
                        message: 'Tingkatkan efisiensi tata kelola operasional bisnis Anda dengan Astacode ERP!'
                    }
                }
            }
        },
        response: {
            id: 'cr_99201849201',
            status: 'PENDING_REVIEW',
            review_eta: '10 mins',
            pixel_attached: '442109',
            response_time_ms: 1120
        }
    }
};

// Sub-Tab Switcher
window.switchDistTab = function(tabKey) {
    document.querySelectorAll('.dist-nav-tab').forEach(tab => {
        if (tab.getAttribute('data-dist-tab') === tabKey) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    document.querySelectorAll('.dist-tab-content').forEach(content => {
        content.style.display = 'none';
    });

    const target = document.getElementById(`distTab-${tabKey}`);
    if (target) {
        target.style.display = 'block';
    }
};

// Global Modals Controllers
window.openPlatformConfigModal = function(platform = "Instagram", account = "@asta.marketing", type = "image_api") {
    const modal = document.getElementById('platformConfigModal');
    if (!modal) return;

    const titleEl = document.getElementById('modalPlatformTitle');
    const inputName = document.getElementById('platformConfigName');
    const inputAcc = document.getElementById('platformConfigAccount');
    const inputUrl = document.getElementById('platformConfigWebhookUrl');
    const inputToken = document.getElementById('platformConfigToken');

    if (titleEl) titleEl.textContent = `Konfigurasi Integrasi: ${platform}`;
    if (inputName) inputName.value = `${platform} Official Integration`;
    if (inputAcc) inputAcc.value = account || '@asta.enterprise';

    if (type === 'video_api') {
        if (inputUrl) inputUrl.value = 'https://open-api.tiktok.com/v2/post/publish/video/';
        if (inputToken) inputToken.value = 'tk_live_oauth_pkce_998124018249012';
    } else if (type === 'meta_ads') {
        if (inputUrl) inputUrl.value = 'https://graph.facebook.com/v19.0/act_892104/';
        if (inputToken) inputToken.value = 'EAABwzL1...[Meta_Graph_Token_Valid]';
    } else if (type === 'linkedin_api') {
        if (inputUrl) inputUrl.value = 'https://api.linkedin.com/v2/ugcPosts';
        if (inputToken) inputToken.value = 'AQV...[LinkedIn_Enterprise_OAuth2]';
    } else if (type === 'webhook_relay') {
        if (inputUrl) inputUrl.value = 'https://hooks.zapier.com/hooks/catch/982104/astacode/';
        if (inputToken) inputToken.value = 'hmac_sha256_secret_key_prod_2026';
    } else {
        if (inputUrl) inputUrl.value = 'https://graph.facebook.com/v19.0/17841400/media_publish';
        if (inputToken) inputToken.value = 'EAAG...[IG_Long_Lived_User_Token]';
    }

    modal.style.display = 'flex';
};

window.closePlatformConfigModal = function() {
    const modal = document.getElementById('platformConfigModal');
    if (modal) modal.style.display = 'none';
};

window.openPayloadInspectorModal = function(logId = 'LOG-89101') {
    const modal = document.getElementById('payloadInspectorModal');
    if (!modal) return;

    const data = mockPayloadLogs[logId] || mockPayloadLogs['LOG-89101'];

    const idEl = document.getElementById('modalPayloadLogId');
    const methodUrlEl = document.getElementById('inspReqMethodUrl');
    const statusBadgeEl = document.getElementById('inspResStatusCode');
    const reqJsonEl = document.getElementById('inspJsonRequest');
    const resJsonEl = document.getElementById('inspJsonResponse');

    if (idEl) idEl.textContent = logId;
    if (methodUrlEl) methodUrlEl.textContent = `${data.method} ${data.endpoint}`;
    
    if (statusBadgeEl) {
        statusBadgeEl.textContent = data.statusCode;
        if (data.statusCode.includes('200') || data.statusCode.includes('201')) {
            statusBadgeEl.className = 'status-badge badge-done';
            statusBadgeEl.style.background = '#dcfce7';
            statusBadgeEl.style.color = '#166534';
        } else {
            statusBadgeEl.className = 'status-badge badge-review';
            statusBadgeEl.style.background = '#fee2e2';
            statusBadgeEl.style.color = '#991b1b';
        }
    }

    if (reqJsonEl) reqJsonEl.textContent = JSON.stringify(data.request, null, 2);
    if (resJsonEl) resJsonEl.textContent = JSON.stringify(data.response, null, 2);

    modal.style.display = 'flex';
};

window.closePayloadInspectorModal = function() {
    const modal = document.getElementById('payloadInspectorModal');
    if (modal) modal.style.display = 'none';
};

window.openCreateABTestModal = function() {
    const modal = document.getElementById('createABTestModal');
    if (modal) modal.style.display = 'flex';
};

window.closeCreateABTestModal = function() {
    const modal = document.getElementById('createABTestModal');
    if (modal) modal.style.display = 'none';
};

window.openUtmBuilderModal = function() {
    const modal = document.getElementById('utmBuilderModal');
    if (modal) {
        window.recalculateUtmResult();
        modal.style.display = 'flex';
    }
};

window.closeUtmBuilderModal = function() {
    const modal = document.getElementById('utmBuilderModal');
    if (modal) modal.style.display = 'none';
};

// Dynamic UTM Link Builder Calculator
window.recalculateUtmResult = function() {
    const baseUrl = (document.getElementById('utmInputBaseUrl')?.value || 'https://astacode.com/erp-solution').trim();
    const source = (document.getElementById('utmInputSource')?.value || 'instagram').trim();
    const medium = (document.getElementById('utmInputMedium')?.value || 'social_carousel').trim();
    const campaign = (document.getElementById('utmInputCampaign')?.value || 'sprint_batch_q4_2026').trim();

    const separator = baseUrl.includes('?') ? '&' : '?';
    const resultUrl = `${baseUrl}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;

    const outEl = document.getElementById('utmGeneratedResult');
    if (outEl) outEl.value = resultUrl;
};

// Routing Rule Switch Notification
window.toggleRoutingRule = function(ruleName, isChecked) {
    if (isChecked) {
        window.showToast(`✅ Aturan Distribusi "${ruleName}" AKTIF`, 'success');
    } else {
        window.showToast(`⏸️ Aturan Distribusi "${ruleName}" DINONAKTIFKAN`, 'warning');
    }
};

function initDistributionHub() {
    // 1. Sub-Tab Switcher Listeners
    document.querySelectorAll('.dist-nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabKey = btn.getAttribute('data-dist-tab');
            window.switchDistTab(tabKey);
        });
    });

    // 2. Test Ping Buttons on Platform Cards
    document.querySelectorAll('.btn-test-platform-ping').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-platform') || 'Platform API';
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ping...';
            btn.disabled = true;

            setTimeout(() => {
                const latency = Math.floor(Math.random() * 450) + 420;
                btn.innerHTML = origHtml;
                btn.disabled = false;
                window.showToast(`📡 Ping ke ${platform} Sukses! Latensi: ${latency}ms (Status: Healthy)`, 'success');
            }, 600);
        });
    });

    // 3. Platform Configuration Buttons
    document.querySelectorAll('.btn-config-platform').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-platform') || 'Platform';
            const account = btn.getAttribute('data-account') || '';
            const type = btn.getAttribute('data-type') || 'image_api';
            window.openPlatformConfigModal(platform, account, type);
        });
    });

    // Add Platform / Webhook Modal Button
    const btnOpenAddPlatformModal = document.getElementById('btnOpenAddPlatformModal');
    if (btnOpenAddPlatformModal) {
        btnOpenAddPlatformModal.addEventListener('click', () => {
            window.openPlatformConfigModal('Webhook / Saluran Baru', '@channel.baru', 'webhook_relay');
        });
    }

    // Modal Ping Test Button
    const btnTestPlatformModalPing = document.getElementById('btnTestPlatformModalPing');
    if (btnTestPlatformModalPing) {
        btnTestPlatformModalPing.addEventListener('click', () => {
            const origHtml = btnTestPlatformModalPing.innerHTML;
            btnTestPlatformModalPing.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memverifikasi...';
            btnTestPlatformModalPing.disabled = true;

            setTimeout(() => {
                btnTestPlatformModalPing.innerHTML = origHtml;
                btnTestPlatformModalPing.disabled = false;
                window.showToast('✨ Handshake OAuth & Webhook valid! Status: HTTP 200 OK', 'success');
            }, 700);
        });
    }

    // Platform Configuration Form Submit
    const formPlatformConfig = document.getElementById('formPlatformConfig');
    if (formPlatformConfig) {
        formPlatformConfig.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('platformConfigName')?.value || 'Integrasi';
            window.closePlatformConfigModal();
            window.showToast(`💾 Konfigurasi integrasi "${name}" berhasil disimpan & disinkronkan!`, 'success');
        });
    }

    // 4. Connect Blog Webhook Action
    const btnConnectBlog = document.getElementById('btnConnectBlogWebhook');
    if (btnConnectBlog) {
        btnConnectBlog.addEventListener('click', () => {
            const origHtml = btnConnectBlog.innerHTML;
            btnConnectBlog.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan...';
            btnConnectBlog.disabled = true;

            setTimeout(() => {
                const card = document.getElementById('cardPlatformBlog');
                const badge = document.getElementById('badgeBlogStatus');
                const state = document.getElementById('lblBlogState');
                const kpiChannels = document.getElementById('kpiConnectedChannels');

                if (card) {
                    card.style.border = '1px solid var(--border-light)';
                    card.style.background = '#ffffff';
                }
                if (badge) {
                    badge.className = 'status-badge badge-done';
                    badge.style.fontSize = '10px';
                    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> TERHUBUNG';
                }
                if (state) {
                    state.style.color = '#059669';
                    state.textContent = 'Terautentikasi (JWT)';
                }
                if (kpiChannels) {
                    kpiChannels.textContent = '5/5 Channel';
                }

                btnConnectBlog.className = 'btn btn-primary w-100 btn-config-platform';
                btnConnectBlog.innerHTML = '<i class="fa-solid fa-gear"></i> Konfigurasi Webhook';
                btnConnectBlog.disabled = false;
                btnConnectBlog.onclick = () => window.openPlatformConfigModal('Blog CMS', 'WordPress / Strapi', 'webhook_relay');

                window.showToast('🔗 Webhook WordPress / Strapi Blog berhasil terhubung ke Astacode ERP!', 'success');
            }, 800);
        });
    }

    // 5. Batch Dispatch Trigger
    const btnTriggerBatchDispatch = document.getElementById('btnTriggerBatchDispatch');
    if (btnTriggerBatchDispatch) {
        btnTriggerBatchDispatch.addEventListener('click', () => {
            window.showToast('🚀 Memulai eksekusi batch posting ke 4 platform sekaligus...', 'info');
            setTimeout(() => {
                window.showToast('✅ 4/4 Konten berhasil terdistribusi serentak ke Instagram, TikTok, Blog, dan LinkedIn!', 'success');
            }, 1200);
        });
    }

    // 6. Log Filter and Search Handlers
    const inputSearch = document.getElementById('inputSearchDistLogs');
    const selectPlatform = document.getElementById('selectFilterDistPlatform');
    const selectStatus = document.getElementById('selectFilterDistStatus');

    function filterLogRows() {
        const query = (inputSearch?.value || '').toLowerCase().trim();
        const selPlat = selectPlatform?.value || 'all';
        const selStat = selectStatus?.value || 'all';

        const rows = document.querySelectorAll('#tbodyDistLogs tr');
        rows.forEach(row => {
            const plat = row.getAttribute('data-platform') || '';
            const stat = row.getAttribute('data-status') || '';
            const text = row.textContent.toLowerCase();

            const matchQuery = !query || text.includes(query);
            const matchPlat = selPlat === 'all' || plat.toLowerCase() === selPlat.toLowerCase();
            const matchStat = selStat === 'all' || stat.toLowerCase() === selStat.toLowerCase();

            if (matchQuery && matchPlat && matchStat) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    if (inputSearch) inputSearch.addEventListener('input', filterLogRows);
    if (selectPlatform) selectPlatform.addEventListener('change', filterLogRows);
    if (selectStatus) selectStatus.addEventListener('change', filterLogRows);

    // Refresh Logs Action
    const btnRefreshDistLogs = document.getElementById('btnRefreshDistLogs');
    if (btnRefreshDistLogs) {
        btnRefreshDistLogs.addEventListener('click', () => {
            const icon = btnRefreshDistLogs.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            setTimeout(() => {
                if (icon) icon.classList.remove('fa-spin');
                window.showToast('🔄 Riwayat log dan metrik latensi HTTP diperbarui!', 'info');
            }, 500);
        });
    }

    // Export CSV Action
    const btnExportDistLogs = document.getElementById('btnExportDistLogs');
    if (btnExportDistLogs) {
        btnExportDistLogs.addEventListener('click', () => {
            const csvContent = "data:text/csv;charset=utf-8,ID,Content,Platform,Timestamp,Latency,HTTP_Status\n"
                + "LOG-89101,Tips Arsitektur Software 2026,Instagram,2026-10-30 10:00:14,840ms,200 OK\n"
                + "LOG-89102,React Crash Course 2026,TikTok,2026-10-29 15:30:22,2140ms,429 Rate Limited\n"
                + "LOG-89103,Optimasi Database PostgreSQL ERP Enterprise,Blog CMS,2026-10-29 09:00:05,620ms,201 Created\n"
                + "LOG-89104,Next.js 14 Enterprise Architecture Benchmark,LinkedIn,2026-10-28 09:00:18,910ms,200 OK\n"
                + "LOG-89105,Retargeting Lead Ads: ERP Software Q4,Meta Ads,2026-10-27 14:15:30,1120ms,200 OK\n";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "astacode_distribution_logs.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.showToast('📥 Log distribusi berhasil diekspor sebagai CSV!', 'success');
        });
    }

    // Inspect Payload Trigger
    document.querySelectorAll('.btn-inspect-payload').forEach(btn => {
        btn.addEventListener('click', () => {
            const logId = btn.getAttribute('data-log-id') || 'LOG-89101';
            window.openPayloadInspectorModal(logId);
        });
    });

    // Copy JSON inside inspector
    document.querySelectorAll('.btn-copy-json').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
                    window.showToast('📋 JSON payload berhasil disalin ke clipboard!', 'success');
                }).catch(() => {
                    window.showToast('JSON payload berhasil disalin!', 'success');
                });
            }
        });
    });

    // Retry TikTok Dispatch Action
    const btnRetryTiktok = document.getElementById('btnRetryTiktokDispatch');
    if (btnRetryTiktok) {
        btnRetryTiktok.addEventListener('click', () => {
            btnRetryTiktok.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengulang...';
            btnRetryTiktok.disabled = true;

            setTimeout(() => {
                const row = document.getElementById('rowLogTiktokError');
                const badge = document.getElementById('badgeTiktokLogRow');
                const kpiSuccess = document.getElementById('kpiSuccessRate');

                if (row) row.setAttribute('data-status', 'success');
                if (badge) {
                    badge.className = 'status-badge badge-done';
                    badge.style.background = '#dcfce7';
                    badge.style.color = '#166534';
                    badge.style.border = 'none';
                    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> 200 OK (Published)';
                }
                if (kpiSuccess) {
                    kpiSuccess.textContent = '100%';
                }
                btnRetryTiktok.remove();
                window.showToast('✅ Pengiriman ulang ke TikTok API berhasil (200 OK Published)!', 'success');
            }, 800);
        });
    }

    // 7. A/B Testing Handlers
    document.querySelectorAll('.btn-promote-winner').forEach(btn => {
        btn.addEventListener('click', () => {
            const winner = btn.getAttribute('data-winner') || 'Variant A';
            const card = btn.closest('.card');
            if (card) {
                const badge = card.querySelector('.badge-review');
                if (badge) {
                    badge.className = 'status-badge badge-done';
                    badge.innerHTML = '<i class="fa-solid fa-trophy"></i> PEMENANG DITETAPKAN';
                }
            }
            btn.className = 'btn btn-outline w-100';
            btn.innerHTML = `<i class="fa-solid fa-check"></i> ${winner} Terpilih Sebagai Pemenang`;
            btn.disabled = true;
            window.showToast(`🏆 ${winner} telah ditetapkan sebagai template default untuk postingan berikutnya!`, 'success');
        });
    });

    const btnOpenCreateABModal = document.getElementById('btnOpenCreateABModal');
    if (btnOpenCreateABModal) {
        btnOpenCreateABModal.addEventListener('click', window.openCreateABTestModal);
    }

    // Traffic Split Range Slider
    const splitSlider = document.getElementById('abTrafficSplitSlider');
    const lblSplit = document.getElementById('lblTrafficSplitVal');
    if (splitSlider && lblSplit) {
        splitSlider.addEventListener('input', () => {
            const val = parseInt(splitSlider.value);
            lblSplit.textContent = `${val}% / ${100 - val}%`;
        });
    }

    // Create A/B Test Form Submit
    const formABTest = document.getElementById('formCreateABTest');
    if (formABTest) {
        formABTest.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('abTestNameInput')?.value || 'Eksperimen Baru';
            const platform = document.getElementById('abTestPlatformSelect')?.value || 'Instagram Carousel';
            const metric = document.getElementById('abTestMetricSelect')?.value || 'CTR';
            const varA = document.getElementById('abVariantAText')?.value || 'Variasi Hook A';
            const varB = document.getElementById('abVariantBText')?.value || 'Variasi Hook B';
            const splitVal = document.getElementById('abTrafficSplitSlider')?.value || '50';

            const container = document.getElementById('abExperimentListContainer');
            if (container) {
                const newCard = document.createElement('div');
                newCard.className = 'card';
                newCard.style.cssText = 'margin-bottom:0; border:1px solid #bfdbfe; box-shadow:0 4px 14px rgba(37,99,235,0.06); animation:modalFadeIn 0.3s ease;';
                newCard.innerHTML = `
                    <div class="card-header" style="padding:14px 18px; background:#eff6ff;">
                        <div>
                            <strong style="font-size:14px; color:#1e40af;">${name}</strong>
                            <div style="font-size:11px; color:#60a5fa; margin-top:2px;">Target: ${platform} • Goal: ${metric}</div>
                        </div>
                        <span class="status-badge badge-review" style="font-size:10px;"><i class="fa-solid fa-spinner fa-spin"></i> BERJALAN</span>
                    </div>
                    <div class="card-body" style="padding:18px;">
                        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
                            <strong>Fokus Pengujian:</strong> Pengujian varian teks baru terhadap retensi audiens.
                        </p>
                        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px; margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#0369a1; margin-bottom:4px;">
                                <span>Variant A (Challenger 1)</span>
                                <span style="font-size:13px; color:#0284c7;">50% Alokasi (Testing)</span>
                            </div>
                            <div style="font-size:11.5px; color:#334155; line-height:1.4;">"${varA}"</div>
                        </div>
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px;">
                                <span>Variant B (Challenger 2)</span>
                                <span style="font-size:13px; color:#64748b;">${100 - parseInt(splitVal)}% Alokasi (Testing)</span>
                            </div>
                            <div style="font-size:11.5px; color:#475569; line-height:1.4;">"${varB}"</div>
                        </div>
                        <div style="margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:#475569; margin-bottom:6px;">
                                <span>Alokasi Distribusi Lalu Lintas:</span>
                                <span>Variant A (${splitVal}%) • Variant B (${100 - parseInt(splitVal)}%)</span>
                            </div>
                            <div style="width:100%; background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden; display:flex;">
                                <div style="width:${splitVal}%; background:var(--brand-primary);"></div>
                                <div style="width:${100 - parseInt(splitVal)}%; background:#94a3b8;"></div>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-primary w-100 btn-promote-winner" data-winner="Variant A (${name})" style="font-size:11.5px; padding:7px;">
                                <i class="fa-solid fa-trophy"></i> Tetapkan Variant A Sebagai Pemenang
                            </button>
                        </div>
                    </div>
                `;

                // Wire up newly created card winner button
                const newBtn = newCard.querySelector('.btn-promote-winner');
                if (newBtn) {
                    newBtn.addEventListener('click', () => {
                        const badge = newCard.querySelector('.badge-review');
                        if (badge) {
                            badge.className = 'status-badge badge-done';
                            badge.innerHTML = '<i class="fa-solid fa-trophy"></i> PEMENANG DITETAPKAN';
                        }
                        newBtn.className = 'btn btn-outline w-100';
                        newBtn.innerHTML = '<i class="fa-solid fa-check"></i> Variant A Terpilih Sebagai Pemenang';
                        newBtn.disabled = true;
                        window.showToast('🏆 Variant A telah ditetapkan sebagai pemenang!', 'success');
                    });
                }

                container.prepend(newCard);

                // Update KPI card
                const kpiAB = document.getElementById('kpiActiveABCount') || document.getElementById('kpiActiveAB');
                if (kpiAB) {
                    const currentVal = parseInt(kpiAB.textContent) || 2;
                    kpiAB.textContent = `${currentVal + 1} Eksperimen`;
                }
            }

            window.closeCreateABTestModal();
            window.showToast(`🧪 Eksperimen A/B "${name}" berhasil diluncurkan ke sistem routing!`, 'success');
        });
    }

    // 8. UTM Generator Handlers
    const btnOpenUtm = document.getElementById('btnOpenUtmBuilder');
    if (btnOpenUtm) {
        btnOpenUtm.addEventListener('click', window.openUtmBuilderModal);
    }

    ['utmInputBaseUrl', 'utmInputSource', 'utmInputMedium', 'utmInputCampaign'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', window.recalculateUtmResult);
            el.addEventListener('change', window.recalculateUtmResult);
        }
    });

    const btnCopyUtm = document.getElementById('btnCopyGeneratedUtm');
    if (btnCopyUtm) {
        btnCopyUtm.addEventListener('click', () => {
            const outEl = document.getElementById('utmGeneratedResult');
            if (outEl) {
                navigator.clipboard.writeText(outEl.value).then(() => {
                    window.showToast('🔗 URL UTM Tracking berhasil disalin ke clipboard!', 'success');
                }).catch(() => {
                    window.showToast('Link UTM berhasil disalin!', 'success');
                });
            }
        });
    }
}

// Master Global Initialization for Marketing App
function initAllMarketingModules() {
    if (typeof initDistributionHub === 'function') initDistributionHub();
    if (typeof initAssetLibraryHub === 'function') initAssetLibraryHub();
    if (typeof initPreviewStudio === 'function') initPreviewStudio();
    if (typeof initInboxChatTester === 'function') initInboxChatTester();
    if (typeof initApprovalQueue === 'function') initApprovalQueue();
    if (typeof initSocialListeningActions === 'function') initSocialListeningActions();
    if (typeof initAnalyticsChart === 'function') initAnalyticsChart();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAllMarketingModules();
} else {
    document.addEventListener('DOMContentLoaded', initAllMarketingModules);
}


