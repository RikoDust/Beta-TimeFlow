// dataManager.js


let contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
const appRoot = document.getElementById('appRoot');

function saveStorage() {
  localStorage.setItem('contracts', JSON.stringify(contracts));
}

function pad(n) { return String(n).padStart(2, '0'); }

function dateMinusDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${pad(d)}/${pad(m)}/${y}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

function render() {
  contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  contracts.forEach(c => c.preavis = Number(c.preavis || 0));

  contracts.sort((a, b) => new Date(a.date) - new Date(b.date));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const danger = [], vigilance = [], courant = [];

  contracts.forEach(c => {
    const due = c.date;
    const preavisDate = dateMinusDays(due, c.preavis || 0);
    if (due <= todayStr) danger.push({ ...c, preavisDate });
    else if (preavisDate <= todayStr) vigilance.push({ ...c, preavisDate });
    else courant.push({ ...c, preavisDate });
  });

  const dangerNumberEl = document.querySelector('.danger-number');
  const vigilanceNumberEl = document.querySelector('.vigilance-number');
  const courantNumberEl = document.querySelector('.courant-number');
  const totalContractsEl = document.querySelector('.total-contrat');

  const dangerContainer = document.querySelector('section.danger > div');
  const vigilanceContainer = document.querySelector('section.vigilance > div');
  const courantContainer = document.getElementById('otherContracts');

  totalContractsEl.textContent = contracts.length;
  dangerNumberEl.textContent = danger.length;
  vigilanceNumberEl.textContent = vigilance.length;
  courantNumberEl.textContent = courant.length;

  function renderList(list, container) {
    container.innerHTML = '';
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Aucune échéance';
      container.appendChild(empty);
      return;
    }
    list.forEach(c => {
      const row = document.createElement('div');
      row.className = 'contract-row';
      row.innerHTML = `
        <div class="contract-info">
          <strong>${escapeHtml(c.prestataire || '')}</strong> | ${escapeHtml(c.type)}
          <div>Échéance: ${formatDateFr(c.date)} | Délai d'action: ${c.preavis} j 
            <span class="preavis-note">- En vigilance le: ${formatDateFr(c.preavisDate)}</span>
          </div>
        </div>
        <div class="actions-row">
          <button class="delete-btn" data-id="${c.id}" aria-label="Supprimer contrat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>`;
      container.appendChild(row);
    });
  }

  const filterValue = document.getElementById('typeFilter').value;
  const courantFiltered = filterValue ? courant.filter(c => c.type === filterValue) : courant;
  renderList(danger, dangerContainer);
  renderList(vigilance, vigilanceContainer);
  renderList(courantFiltered, courantContainer);

  updateTypeFilterOptions(courant);

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => openDeleteModal(Number(btn.dataset.id));
  });
}
