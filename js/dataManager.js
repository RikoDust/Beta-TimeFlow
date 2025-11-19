// dataManager.js

let contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
const appRoot = document.getElementById('appRoot');

function saveStorage() {
  localStorage.setItem('contracts', JSON.stringify(contracts));
}

function pad(n) { 
  return String(n).padStart(2, '0'); 
}

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

function updateTypeFilterOptions(courantList) {
  const uniqueTypes = [...new Set(courantList.map(c => c.type))];
  const typeFilter = document.getElementById('typeFilter');

  const current = typeFilter.value;
  typeFilter.innerHTML = `<option value="">-- Tous les types --</option>`;

  uniqueTypes.forEach(t => {
    if (t) {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      typeFilter.appendChild(opt);
    }
  });

  if (current) typeFilter.value = current;
}

function render() {
  contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  contracts.forEach(c => c.preavis = Number(c.preavis || 0));

  contracts.sort((a, b) => new Date(a.date) - new Date(b.date));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const msParJour = 1000 * 60 * 60 * 24;

  const danger = [], vigilance = [], courant = [];

  contracts.forEach(c => {
    const due = c.date;
    const preavisDate = dateMinusDays(due, c.preavis || 0);
    if (due <= todayStr) danger.push({ ...c, preavisDate });
    else if (preavisDate <= todayStr) vigilance.push({ ...c, preavisDate });
    else courant.push({ ...c, preavisDate });
  });

  document.querySelector('.total-contrat').textContent = contracts.length;
  document.querySelector('.danger-number').textContent = danger.length;
  document.querySelector('.vigilance-number').textContent = vigilance.length;
  document.querySelector('.courant-number').textContent = courant.length;

  const dangerContainer = document.querySelector('section.danger > div');
  const vigilanceContainer = document.querySelector('section.vigilance > div');
  const courantContainer = document.getElementById('otherContracts');

  function renderList(list, container, listType) {
    container.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';

      if (listType === 'courant')
        empty.textContent = 'Veuillez saisir une nouvelle échéance avec le bouton d’ajout +';
      else if (listType === 'vigilance')
        empty.textContent = 'Vous êtes tranquille, aucune échéance en vigilance';
      else if (listType === 'danger')
        empty.textContent = 'Tout va bien, aucune échéance en alerte';
      else
        empty.textContent = 'Aucune échéance';
      
      container.appendChild(empty);
      return;
    }

    list.forEach(c => {
      const row = document.createElement('div');
      row.className = 'contract-row';

      // Titre
      const titleHtml = `
        <div class="primary">
          <strong>${escapeHtml(c.prestataire || '')}</strong> | ${escapeHtml(c.type || '')}
        </div>
      `;

      // Texte secondaire
      let specificText = '';

      if (listType === 'courant') {
        specificText =
          `Passe en vigilance le : ${formatDateFr(c.preavisDate)}\n` +
          `Échéance le : ${formatDateFr(c.date)}`;
      }

      else if (listType === 'vigilance') {
        const [y, m, d] = c.date.split('-').map(Number);
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const due = new Date(y, m - 1, d);
        let joursRestants = Math.ceil((due - now) / msParJour);
        if (joursRestants < 0) joursRestants = 0;
        const jTxt = joursRestants <= 1 ? 'jour' : 'jours';

        specificText =
          `Encore ${joursRestants} ${jTxt} de délai d’action\n` +
          `Échéance le : ${formatDateFr(c.date)}`;
      }

      else if (listType === 'danger') {
        specificText = `Arrivé à échéance le : ${formatDateFr(c.date)}`;
      }

      const specificHtml = `
        <div class="secondary">
          ${escapeHtml(specificText).replace(/\n/g, '<br/>')}
        </div>
      `;

      row.innerHTML = `
        <div class="contract-left">
          ${titleHtml}
          ${specificHtml}
        </div>

        <div class="contract-right">
          <button class="delete-btn" data-id="${c.id}" aria-label="Supprimer contrat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });
  }

  const filterValue = document.getElementById('typeFilter').value;
  const courantFiltered = filterValue ? courant.filter(c => c.type === filterValue) : courant;

  renderList(danger, dangerContainer, 'danger');
  renderList(vigilance, vigilanceContainer, 'vigilance');
  renderList(courantFiltered, courantContainer, 'courant');

  updateTypeFilterOptions(courant);

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => openDeleteModal(Number(btn.dataset.id));
  });
}