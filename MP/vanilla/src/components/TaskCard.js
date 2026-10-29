/**
 * TaskCard Component (100% Native Vanilla JS ES Module)
 * Modeled after Atlassian Jira Software Issue Card:
 * - Jira Type Badge (Bug, Feature/Story, Task)
 * - Issue Key Link with hover underline (e.g. LIB-104)
 * - Issue Title with line clamp
 * - Epic Tag with color coding
 * - Tags: Severity (S1-S4), Env (PROD/STG), QA Passed, PR #
 * - Subtask Checklist Progress (e.g. 2/3)
 * - Estimate Hours / Story Points Badge (e.g. 24h)
 * - Jira Priority Icon
 * - Assignee Avatar Circle with Tooltip
 */

import { Icons } from '../utils/icons.js';

export function createTaskCard(task, members, epics, onClick) {
  const card = document.createElement('div');
  const assignee = members.find((m) => m.id === task.assigneeId);
  const epic = epics.find((e) => e.id === task.epicId);

  const isHotfix = task.priority === 'Hotfix' || (task.severity && task.severity.startsWith('S1'));
  const isPrReview = task.status === 'Menunggu Persetujuan';
  const isQaPhase = task.status === 'Deploy Staging' || task.status === 'QA/Testing';

  let borderModifier = '';
  if (isHotfix) borderModifier = 'task-card--hotfix';
  else if (isPrReview) borderModifier = 'task-card--review';
  else if (isQaPhase) borderModifier = 'task-card--qa';

  card.className = `task-card ${borderModifier}`;
  card.setAttribute('draggable', 'true');
  card.setAttribute('data-task-id', task.id);

  // Dragstart handler
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    card.style.opacity = '0.5';
  });

  card.addEventListener('dragend', () => {
    card.style.opacity = '1';
  });

  card.addEventListener('click', () => {
    if (typeof onClick === 'function') onClick(task);
  });

  // Priority icon renderer (Atlassian Jira Style)
  let priorityHtml = '';
  if (task.priority === 'Hotfix') {
    priorityHtml = `
      <span title="Prioritas: Blocker / Hotfix" style="color: #ff5630; display: flex; align-items: center;">
        ${Icons.flame('w-3.5 h-3.5', 14)}
      </span>
    `;
  } else if (task.priority === 'Tinggi') {
    priorityHtml = `
      <span title="Prioritas: Tinggi (High)" style="color: #ff5630; display: flex; align-items: center;">
        ${Icons.chevronsUp('w-3.5 h-3.5', 14)}
      </span>
    `;
  } else if (task.priority === 'Sedang') {
    priorityHtml = `
      <span title="Prioritas: Sedang (Medium)" style="color: #ffab00; display: flex; align-items: center;">
        ${Icons.minus('w-3.5 h-3.5', 14)}
      </span>
    `;
  } else {
    priorityHtml = `
      <span title="Prioritas: Rendah (Low)" style="color: #36b37e; display: flex; align-items: center;">
        ${Icons.arrowDown('w-3.5 h-3.5', 14)}
      </span>
    `;
  }

  // Type icon renderer (Jira Standard Squares & PRD 6.4 Issue Types)
  let typeIconHtml = '';
  if (task.type === 'Bug') {
    typeIconHtml = `
      <span class="task-card__type-badge task-card__type-badge--bug" title="Tipe: Bug (Defect)">
        ${Icons.bug('w-2.5 h-2.5', 11)}
      </span>
    `;
  } else if (task.type === 'Feature') {
    typeIconHtml = `
      <span class="task-card__type-badge task-card__type-badge--feature" title="Tipe: Feature (Story)">
        ${Icons.sparkles('w-2.5 h-2.5', 11)}
      </span>
    `;
  } else if (task.type === 'Revisi' || task.type === 'Change Request') {
    typeIconHtml = `
      <span class="task-card__type-badge task-card__type-badge--revisi" title="Tipe: Change Request / Revisi">
        ${Icons.refresh('w-2.5 h-2.5', 11)}
      </span>
    `;
  } else if (task.type === 'Maintenance') {
    typeIconHtml = `
      <span class="task-card__type-badge task-card__type-badge--maint" title="Tipe: Maintenance">
        ${Icons.wrench('w-2.5 h-2.5', 11)}
      </span>
    `;
  } else {
    typeIconHtml = `
      <span class="task-card__type-badge task-card__type-badge--task" title="Tipe: Task">
        ${Icons.checkSquare('w-2.5 h-2.5', 11)}
      </span>
    `;
  }

  // Subtasks ratio
  const completedSubtasks = task.subtasks ? task.subtasks.filter((st) => st.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

  // Epic badge HTML
  const epicHtml = epic ? `
    <div class="task-card__epic-row">
      <span class="task-card__epic-badge" style="background-color: ${epic.color}15; color: ${epic.color}; border: 1px solid ${epic.color}35;" title="Modul Epic: ${epic.title}">
        ${epic.key} · ${epic.title}
      </span>
      ${task.priority === 'Hotfix' ? '<span class="task-card__hotfix-pill"><i class="fi fi-rr-flame"></i> Blocker</span>' : ''}
    </div>
  ` : '';

  // Tags HTML
  let tagsHtml = '';
  const hasTags = task.severity || task.environment || task.qaSignOff || task.prNumber || task.warrantyStatus || task.source === 'Telegram Bot' || task.source === 'Sentry' || task.slaTargetMinutes;
  if (hasTags) {
    let sourceHtml = '';
    if (task.source === 'Telegram Bot') {
      sourceHtml = `<span class="task-card__tag task-card__tag--telegram" title="Laporan masuk via @ProjectManjerBot">${Icons.telegram('w-2.5 h-2.5', 10)} <span>Telegram</span></span>`;
    } else if (task.source === 'Sentry') {
      sourceHtml = `<span class="task-card__tag task-card__tag--sentry" title="Laporan exception Sentry">${Icons.terminal('w-2.5 h-2.5', 10)} <span>Sentry</span></span>`;
    }

    let slaHtml = '';
    if (task.slaTargetMinutes || (task.severity && task.severity.startsWith('S1'))) {
      const mins = task.slaTargetMinutes || (task.severity?.startsWith('S1') ? 30 : 120);
      slaHtml = `<span class="task-card__tag task-card__tag--sla" title="SLA Tanggap Target: ${mins} menit"><i class="fi fi-rr-clock" style="font-size: 9px;"></i> SLA ${mins}m</span>`;
    }

    let sevHtml = '';
    if (task.severity) {
      const isS1 = task.severity.startsWith('S1');
      const isS2 = task.severity.startsWith('S2');
      const sevClass = isS1 ? 'task-card__tag--s1' : isS2 ? 'task-card__tag--s2' : 'task-card__tag--s3';
      const sevLabel = task.severity.split(' ')[0] + (task.severity.includes('Blocker') ? ' Blocker' : ' Major');
      sevHtml = `<span class="task-card__tag ${sevClass}">${sevLabel}</span>`;
    }

    let envHtml = '';
    if (task.environment) {
      const envLabel = task.environment === 'Production' ? 'PROD' : task.environment === 'Staging' ? 'STG' : 'QA';
      envHtml = `<span class="task-card__tag task-card__tag--env">${envLabel}</span>`;
    }

    let qaHtml = '';
    if (task.qaSignOff && task.qaSignOff.status === 'Passed') {
      qaHtml = `<span class="task-card__tag task-card__tag--qa-pass">${Icons.checkCircle('w-2.5 h-2.5', 10)} <span>QA Passed</span></span>`;
    }

    let prHtml = '';
    if (task.prNumber) {
      prHtml = `<span class="task-card__tag task-card__tag--pr">${Icons.gitPullRequest('w-2.5 h-2.5', 10)} <span>${task.prNumber}</span></span>`;
    }

    let warrantyHtml = '';
    if (task.warrantyStatus && task.type === 'Bug') {
      warrantyHtml = `<span class="task-card__tag task-card__tag--warranty">${task.warrantyStatus.includes('Garansi') ? 'Garansi Rp0' : 'Retainer'}</span>`;
    }

    tagsHtml = `
      <div class="task-card__tags">
        ${sourceHtml}
        ${slaHtml}
        ${sevHtml}
        ${envHtml}
        ${qaHtml}
        ${prHtml}
        ${warrantyHtml}
      </div>
    `;
  }

  // Estimate Badge
  const estimateBadge = task.estimateHours ? `
    <span class="task-card__estimate-badge" title="Estimasi: ${task.estimateHours} Jam">${task.estimateHours}h</span>
  ` : '';

  // Assignee Avatar HTML
  const avatarHtml = assignee ? `
    <img src="${assignee.avatar}" alt="${assignee.name}" class="task-card__avatar" title="Assignee: ${assignee.name} (${assignee.role})" />
  ` : `
    <div class="task-card__avatar--placeholder" title="Belum ditugaskan">?</div>
  `;

  card.innerHTML = `
    ${epicHtml}
    <h4 class="task-card__title">${task.title}</h4>
    ${tagsHtml}
    <div class="task-card__footer">
      <div class="task-card__footer-left">
        ${typeIconHtml}
        <span class="task-card__key">${task.key}</span>
        ${totalSubtasks > 0 ? `<span class="task-card__subtask-count" title="Subtask selesai"><i class="fi fi-rr-check"></i> ${completedSubtasks}/${totalSubtasks}</span>` : ''}
      </div>
      <div class="task-card__footer-right">
        ${estimateBadge}
        <div class="task-card__priority">${priorityHtml}</div>
        ${avatarHtml}
      </div>
    </div>
  `;

  return card;
}
