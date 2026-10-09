const HW_KEY = 'astacode_hw_v2';
const STAGES = [
  { id: 0, name: 'WON (Dari CRM)', color: '#3B82F6' },
  { id: 1, name: 'Persiapan', color: '#64748B' },
  { id: 2, name: 'Dokumentasi', color: '#2F5FE0' },
  { id: 3, name: 'Pelatihan & UAT', color: '#E8A33D' },
  { id: 4, name: 'Serah Terima', color: '#6B5FCE' },
  { id: 5, name: 'Garansi', color: '#1C9A6C' }
];

const DOC_KEYS = [
  { key: 'repo', name: 'Akses Repositori', desc: 'Link repo + aturan permission' },
  { key: 'hosting', name: 'Kredensial Hosting', desc: 'Server/domain, panel, password' },
  { key: 'api', name: 'Dokumentasi API', desc: 'Endpoint, auth, skema' },
  { key: 'panduan', name: 'Panduan Pengguna', desc: 'SOP operasional admin & user' },
  { key: 'video', name: 'Video Pelatihan', desc: 'Rekam layar per modul inti' },
  { key: 'uat', name: 'Laporan UAT', desc: 'Skenario, hasil, sign-off klien' },
  { key: 'faktur', name: 'Faktur Akhir', desc: 'Invoice termin terakhir' }
];

let hwProjects = [];
let hwCurrentDetailId = null;

function hwInit() {
  const data = localStorage.getItem(HW_KEY);
  if (data) {
    hwProjects = JSON.parse(data);
  } else {
    // Seed data
    hwProjects = [
      {
        id: 'PRJ-101', client: 'PT Budi Jaya', name: 'E-Commerce Budi', pic: 'Azi S.', picType: 'Karyawan',
        targetDate: '2026-10-15', stage: 2, signoffRequested: false, signoffDate: null,
        docs: { repo: true, hosting: true, api: false, panduan: false, video: false, uat: false, faktur: false },
        tasks: [{ id: 1, title: 'Setup DB', assignee: 'Faiz', status: 'Selesai' }, { id: 2, title: 'Deploy Staging', assignee: 'Faiz', status: 'Belum Dimulai' }],
        comms: [{ actor: 'Azi', chan: 'WhatsApp', note: 'Klien setuju jadwal UAT tgl 12', at: '2026-10-04 10:00' }]
      },
      {
        id: 'PRJ-102', client: 'Klinik Sehat', name: 'Sistem Antrean', pic: 'Dimas P.', picType: 'Freelancer',
        targetDate: '2026-10-01', stage: 4, signoffRequested: true, signoffDate: null,
        docs: { repo: true, hosting: true, api: true, panduan: true, video: true, uat: true, faktur: true },
        tasks: [],
        comms: []
      },
      {
        id: 'PRJ-103', client: 'Toko Baru', name: 'App Kasir', pic: 'Sari', picType: 'Karyawan',
        targetDate: '2026-11-20', stage: 0, signoffRequested: false, signoffDate: null,
        docs: { repo: false, hosting: false, api: false, panduan: false, video: false, uat: false, faktur: false },
        tasks: [],
        comms: [{ actor: 'System', chan: 'Sistem', note: 'Dispatch otomatis dari CRM, deal WON', at: '2026-10-05 14:00' }]
      }
    ];
    hwSave();
  }
  hwRenderBoard();
}

function hwSave() {
  localStorage.setItem(HW_KEY, JSON.stringify(hwProjects));
}

function hwCalcReadiness(prj) {
  let docCount = 0;
  for (let k in prj.docs) { if (prj.docs[k]) docCount++; }
  let docReady = docCount / 7;
  
  let taskReady = 0;
  if (prj.tasks && prj.tasks.length > 0) {
    let taskDone = prj.tasks.filter(t => t.status === 'Selesai').length;
    taskReady = taskDone / prj.tasks.length;
  } else {
    taskReady = 1; // If no tasks, consider tasks 100% ready to not block
  }
  
  return Math.round((docReady * 50) + (taskReady * 50));
}

function isLate(prj) {
  if (prj.stage >= 5) return false;
  return new Date(prj.targetDate) < new Date();
}

function hwRenderBoard() {
  document.getElementById('hwDetail').style.display = 'none';
  document.getElementById('hwBoard').style.display = 'grid';
  document.getElementById('hwBoard').className = 'hw-board';
  document.getElementById('hwBoard').innerHTML = '';
  
  let stats = { total: hwProjects.length, late: 0, waitSignoff: 0, totalReady: 0 };
  
  STAGES.forEach((st, idx) => {
    let col = document.createElement('div');
    col.className = 'hw-col';
    let pInStage = hwProjects.filter(p => p.stage === idx);
    col.innerHTML = `<div class="hw-col-head"><span>${st.name}</span><span class="hw-col-count">${pInStage.length}</span></div>
                     <div class="hw-col-bar" style="background:${st.color}"></div>`;
    
    let cardsHtml = '';
    pInStage.forEach(p => {
      let late = isLate(p);
      let ready = hwCalcReadiness(p);
      stats.totalReady += ready;
      if (late) stats.late++;
      if (p.stage === 4 && p.signoffRequested) stats.waitSignoff++;
      
      let picInitial = p.pic.substring(0, 2).toUpperCase();
      let lateBadge = late ? `<div class="hw-late">Terlambat</div>` : '';
      let wtype = p.picType === 'Freelancer' ? `<span class="hw-wtype fr">Freelancer</span>` : `<span class="hw-wtype">Karyawan</span>`;
      
      cardsHtml += `
        <div class="hw-card" draggable="true" ondragstart="hwDragStart(event, '${p.id}')" onclick="hwOpenDetail('${p.id}')">
          ${lateBadge}
          <div class="hw-name">${p.name}</div>
          <div class="hw-client">🏢 ${p.client}</div>
          <div class="hw-readline">
             <div class="bar"><span style="width:${ready}%"></span></div>
             <b>${ready}%</b>
          </div>
          <div class="hw-foot">
            <div class="hw-pictext">
              <div class="mini-avatar" style="width:20px;height:20px;font-size:9px">${picInitial}</div>
              ${p.pic} ${wtype}
            </div>
            <div class="hw-due">${p.targetDate}</div>
          </div>
        </div>
      `;
    });
    col.innerHTML += `<div class="cards" style="flex:1" ondragover="hwDragOver(event)" ondrop="hwDrop(event, ${idx})">${cardsHtml}</div>`;
    document.getElementById('hwBoard').appendChild(col);
  });
  
  let avgReady = stats.total > 0 ? Math.round(stats.totalReady / stats.total) : 0;
  document.getElementById('hwKpi').innerHTML = `
    <div class="stat-card"><div class="num">${stats.total}</div><div class="lbl">Total Proyek</div></div>
    <div class="stat-card"><div class="num" style="color:var(--red)">${stats.late}</div><div class="lbl">Terlambat</div></div>
    <div class="stat-card"><div class="num">${avgReady}%</div><div class="lbl">Rata-rata Kesiapan</div></div>
    <div class="stat-card"><div class="num" style="color:var(--amber)">${stats.waitSignoff}</div><div class="lbl">Menunggu Sign-off</div></div>
  `;
}

function hwOpenDetail(id) {
  hwCurrentDetailId = id;
  const p = hwProjects.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('hwBoard').style.display = 'none';
  const detailEl = document.getElementById('hwDetail');
  detailEl.style.display = 'block';
  
  hwRenderDetail();
}

function hwRenderDetail() {
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  if (!p) return;
  const detailEl = document.getElementById('hwDetail');
  
  let ready = hwCalcReadiness(p);
  let docCount = Object.values(p.docs).filter(v => v).length;
  let docStat = docCount === 7 ? '<span class="hw-sentchip sent">Terkirim</span>' : '<span class="hw-sentchip draft">Draf</span>';
  
  let stepperHtml = '<div class="hw-stepper">';
  STAGES.forEach((st, idx) => {
    let cls = 'hw-step';
    if (idx < p.stage) cls += ' done';
    else if (idx === p.stage) cls += ' current';
    stepperHtml += `<div class="${cls}"><div class="hw-dot">${idx<p.stage?'✓':(idx+1)}</div>${st.name}</div>`;
  });
  stepperHtml += '</div>';
  
  let docHtml = '';
  DOC_KEYS.forEach(dk => {
    let checked = p.docs[dk.key] ? 'checked' : '';
    let clsd = checked ? 'checked' : '';
    docHtml += `
      <div class="hw-doc ${clsd}" onclick="hwToggleDoc('${dk.key}')">
        <input type="checkbox" ${checked} onclick="event.stopPropagation(); hwToggleDoc('${dk.key}')">
        <div class="hw-doc-body">
          <div class="hw-doc-name">${dk.name}</div>
          <div class="hw-doc-desc">${dk.desc}</div>
        </div>
      </div>
    `;
  });
  
  let taskHtml = '';
  if (p.tasks) {
    p.tasks.forEach(t => {
      let dCls = t.status === 'Selesai' ? 'done' : (t.status === 'Sedang Berjalan' ? 'run' : '');
      let tCls = t.status === 'Selesai' ? 'selesai' : '';
      taskHtml += `
        <div class="hw-task">
          <div class="hw-task-dot ${dCls}"></div>
          <div class="hw-task-title ${tCls}">${t.title}</div>
          <div style="font-size:11.5px;color:var(--ink-soft)">👤 ${t.assignee}</div>
          <select class="hw-select" onchange="hwChangeTaskStatus(${t.id}, this.value)">
            <option value="Belum Dimulai" ${t.status==='Belum Dimulai'?'selected':''}>Belum Dimulai</option>
            <option value="Sedang Berjalan" ${t.status==='Sedang Berjalan'?'selected':''}>Sedang Berjalan</option>
            <option value="Selesai" ${t.status==='Selesai'?'selected':''}>Selesai</option>
          </select>
        </div>
      `;
    });
  }
  
  let logHtml = '';
  if (p.comms) {
    let sortedComms = [...p.comms].reverse();
    sortedComms.forEach(c => {
      let icon = c.chan==='WhatsApp'?'💬':c.chan==='Email'?'✉️':c.chan==='Rapat'?'🤝':c.chan==='Sistem'?'⚙':'📞';
      logHtml += `
        <div class="hw-comm ${c.chan==='Sistem'?'system':''}">
          <div class="hw-comm-ico">${icon}</div>
          <div class="hw-comm-body">
            <div class="hw-comm-head"><span class="hw-chan">${c.chan}</span> · ${c.actor} · ${c.at}</div>
            <div class="hw-comm-note">${c.note}</div>
          </div>
        </div>
      `;
    });
  }

  let nextBtnDisabled = p.stage >= 5 ? 'disabled' : '';
  let nextBtnLbl = p.stage >= 5 ? 'Proyek dalam Periode Garansi' : 'Pindah ke Tahap Berikutnya →';
  let reqSignDisabled = ready >= 90 && !p.signoffRequested && p.stage < 5 ? '' : 'disabled';
  let reqSignLbl = p.signoffDate ? 'Ditandatangani ✅' : (p.signoffRequested ? 'Tanda Tangan Diminta ⏳' : '✍ Minta Tanda Tangan Klien');
  
  let invoiceBtn = '';
  if (p.stage >= 4) {
    let invSent = p.invoiceSent ? 'disabled' : '';
    let invLbl = p.invoiceSent ? 'Invoice Terkirim ke Finance ✅' : 'Kirim Invoice ke Finance 💰';
    invoiceBtn = `<button class="btn" style="background:#10B981;color:#fff;border-color:#10B981" onclick="hwSendInvoice()" ${invSent}>${invLbl}</button>`;
  }
  
  detailEl.innerHTML = `
    <span class="back-link" onclick="hwRenderBoard()">← Kembali ke Papan</span>
    <div class="hw-proj-head">
      <div>
        <h1 class="hw-proj-title">${p.name}</h1>
        <div class="hw-proj-sub">${p.client} · PIC: ${p.pic} (${p.picType}) · Target: ${p.targetDate}</div>
      </div>
    </div>
    
    ${stepperHtml}
    
    <div class="hw-actions">
      <button class="btn primary" onclick="hwNextStage()" ${nextBtnDisabled}>${nextBtnLbl}</button>
      <button class="btn" onclick="hwReqSignoff()" ${reqSignDisabled}>${reqSignLbl}</button>
      ${invoiceBtn}
    </div>
    
    <div class="hw-grid">
      <div>
        <div class="hw-panel" style="margin-bottom:16px">
          <div class="hw-panel-head">
            <b>Checklist Dokumen</b>
            <div class="hw-docstat">${docCount}/7 · Status: ${docStat}</div>
          </div>
          ${docHtml}
        </div>
        <div class="hw-signoff">
          <div class="hw-r-label">Kesiapan Proyek</div>
          <div class="hw-r-value">${ready}%</div>
          <div class="bar" style="height:8px"><span style="width:${ready}%;background:var(--teal)"></span></div>
          <div class="hw-so-hint">Bobot: Dokumen (50%), Task (50%). Minta tanda tangan klien saat ≥ 90%.</div>
        </div>
      </div>
      <div>
        <div class="hw-panel" style="margin-bottom:16px">
          <div class="hw-panel-head"><b>Tugas & Tim</b></div>
          <div id="hwTaskList">${taskHtml}</div>
          <div class="hw-task-add">
            <input type="text" id="hwNewTask" placeholder="Nama tugas baru...">
            <select id="hwNewAss" class="hw-select">
              <optgroup label="Karyawan"><option>Azi S.</option><option>Faiz A.</option></optgroup>
              <optgroup label="Freelancer"><option>Raka W.</option></optgroup>
            </select>
            <button class="btn" onclick="hwAddTask()">+ Tambah</button>
          </div>
        </div>
        <div class="hw-panel">
          <div class="hw-panel-head"><b>Log Komunikasi</b></div>
          <div class="hw-comm-form">
            <select id="hwCommChan"><option>WhatsApp</option><option>Email</option><option>Rapat</option><option>Telepon</option></select>
            <input type="text" id="hwCommNote" placeholder="Tulis log komunikasi...">
            <button class="btn" onclick="hwAddComm()">+ Log</button>
          </div>
          <div id="hwCommList">${logHtml}</div>
        </div>
      </div>
    </div>
  `;
}

function hwToggleDoc(key) {
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  if (!p) return;
  p.docs[key] = !p.docs[key];
  hwSave();
  hwRenderDetail();
}

function hwChangeTaskStatus(id, stat) {
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  const t = p.tasks.find(x => x.id === id);
  if(t) {
    t.status = stat;
    hwSave();
    hwRenderDetail();
  }
}

function hwAddTask() {
  const title = document.getElementById('hwNewTask').value.trim();
  const ass = document.getElementById('hwNewAss').value;
  if (!title) return;
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  p.tasks.push({ id: Date.now(), title: title, assignee: ass, status: 'Belum Dimulai' });
  hwSave();
  hwRenderDetail();
}

function _dt() {
  let d = new Date();
  let p = s => s.toString().padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}

function hwAddComm(chan, note, actor) {
  let c = chan || document.getElementById('hwCommChan').value;
  let n = note || document.getElementById('hwCommNote').value.trim();
  let a = actor || 'Azi S.';
  if (!n) return;
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  p.comms.push({ actor: a, chan: c, note: n, at: _dt() });
  hwSave();
  hwRenderDetail();
}

function hwNextStage() {
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  if (p.stage >= 5) return;
  let old = STAGES[p.stage].name;
  p.stage++;
  let curr = STAGES[p.stage].name;
  hwAddComm('Sistem', `Tahap dipindahkan: ${old} → ${curr}`, 'System'); // Save happens inside
}

function hwReqSignoff() {
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  if (hwCalcReadiness(p) < 90) return;
  p.signoffRequested = true;
  hwAddComm('Sistem', `Minta tanda tangan klien dikirim`, 'System');
  // Simulate signoff received for prototype purposes if clicked again later, but button is disabled.
  // We'll just leave it as requested for now.
}

function hwSendInvoice() {
  const p = hwProjects.find(x => x.id === hwCurrentDetailId);
  if (p.stage < 4) return;
  p.invoiceSent = true;
  hwAddComm('Sistem', `Invoice tagihan akhir otomatis diteruskan ke modul Finance`, 'System');
  hwSave();
  hwRenderDetail();
}

function hwDragStart(ev, id) {
  ev.dataTransfer.setData("text/plain", id);
}

function hwDragOver(ev) {
  ev.preventDefault();
}

function hwDrop(ev, stageIdx) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text/plain");
  const p = hwProjects.find(x => x.id === id);
  if (p && p.stage !== stageIdx) {
    let old = STAGES[p.stage].name;
    let curr = STAGES[stageIdx].name;
    p.stage = stageIdx;
    p.comms.push({ actor: 'System', chan: 'Sistem', note: `Tahap dipindahkan (Drag): ${old} → ${curr}`, at: _dt() });
    hwSave();
    hwRenderBoard();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  hwInit();
});
