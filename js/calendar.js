// calendar.js

function renderCalendar() {
  const calGrid = document.getElementById('calGrid');
  if (!calGrid) return;

  const stored = JSON.parse(localStorage.getItem('contracts') || '[]');
  stored.forEach(c => c.preavis = Number(c.preavis || 0));

  function pad(n) { return String(n).padStart(2, '0'); }
  function toStr(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function dateMinusDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - days);
    return toStr(dt);
  }

  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();

  calGrid.innerHTML = '';

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dStr = toStr(d);

    const dangerHere = stored.filter(c => c.date === dStr);
    const vigilanceHere = stored.filter(c => {
      if (c.date === dStr) return false;
      return dateMinusDays(c.date, c.preavis) === dStr;
    });

    const cell = document.createElement('div');
    cell.className = 'cal-day' + (i === 0 ? ' today' : '');

    const jsDay = d.getDay();
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

    let badgesHtml = '';
    if (dangerHere.length || vigilanceHere.length) {
      const db = dangerHere.map(() =>
        `<span class="cal-badge danger" title="Alerte échéance"></span>`
      ).join('');
      const vb = vigilanceHere.map(() =>
        `<span class="cal-badge vigilance" title="Entrée en vigilance"></span>`
      ).join('');
      badgesHtml = `<div class="cal-badges">${db}${vb}</div>`;
    }

    cell.innerHTML = `
      <span class="day-num">${pad(d.getDate())}</span>
      <span class="day-label">${JOURS[dayIdx]}</span>
      ${badgesHtml}
    `;

    calGrid.appendChild(cell);
  }
}

// Toggle ouverture / fermeture
function initCalendarToggle() {
  const btn = document.getElementById('calendarToggle');
  const body = document.getElementById('calendarBody');
  if (!btn || !body) return;

  btn.addEventListener('click', () => {
    const isOpen = body.classList.contains('open');

    if (isOpen) {
      body.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      renderCalendar();
      body.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

window.renderCalendar = renderCalendar;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalendarToggle);
} else {
  initCalendarToggle();
}
