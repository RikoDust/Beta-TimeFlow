// dataManager.js

// stockage global des contrats (utilisé par les autres scripts)
let contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
const appRoot = document.getElementById('appRoot');

// modes de tri indépendants par liste
const sortModes = {
  danger: 'date',
  vigilance: 'date',
  courant: 'date'
};

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
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

// met à jour les options du filtre type et du datalist
function updateTypeFilterOptions(courantList) {
  const types = [...new Set(courantList.map(c => c.type).filter(Boolean))];
  const select = document.getElementById('typeFilter');
  if (select) {
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Tous les types --</option>';
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      select.appendChild(opt);
    });
    select.value = types.includes(currentValue) ? currentValue : '';
  }

  const datalist = document.getElementById('typesList');
  if (datalist) {
    datalist.innerHTML = '';
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      datalist.appendChild(opt);
    });
  }
}

// helper : retourne une copie triée selon sortModes
function sortForMode(list, key) {
  if (!Array.isArray(list)) return [];
  // si tri priorité demandé pour cette key
  if (sortModes[key] === 'priority') {
    // priorité 1 doit apparaître en premier (donc tri numérique asc)
    return [...list].sort((a, b) => {
      const pa = Number(a.priority || 999);
      const pb = Number(b.priority || 999);
      // si même priorité -> fallback sur date ascendante
      if (pa === pb) return new Date(a.date) - new Date(b.date);
      return pa - pb;
    });
  }
  // sinon on garde l'ordre actuel (qui provient du tri par date précédent)
  return [...list];
}

function render() {
  // reload depuis localStorage (garantit cohérence entre onglets)
  contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  contracts.forEach(c => c.preavis = Number(c.preavis || 0));

  // tri initial par date (croissant)
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

  // mise à jour compteurs
  const dangerNumberEl = document.querySelector('.danger-number');
  const vigilanceNumberEl = document.querySelector('.vigilance-number');
  const courantNumberEl = document.querySelector('.courant-number');
  const totalContractsEl = document.querySelector('.total-contrat');

  if (dangerNumberEl) dangerNumberEl.textContent = danger.length;
  if (vigilanceNumberEl) vigilanceNumberEl.textContent = vigilance.length;
  if (courantNumberEl) courantNumberEl.textContent = courant.length;
  if (totalContractsEl) totalContractsEl.textContent = contracts.length;

  const dangerContainer = document.getElementById('dangerContracts');
  const vigilanceContainer = document.getElementById('vigilanceContracts');
  const courantContainer = document.getElementById('otherContracts');

  // filtrage par type pour courant (Zone verte)
  const filterValue = document.getElementById('typeFilter') ? document.getElementById('typeFilter').value : '';
  const courantFiltered = filterValue ? courant.filter(c => c.type === filterValue) : courant;

  // appliquons le tri demandé (par liste)
  const dangerToRender = sortForMode(danger, 'danger');
  const vigilanceToRender = sortForMode(vigilance, 'vigilance');
  const courantToRender = sortForMode(courantFiltered, 'courant');

  // renderList (affiche les éléments dans le container)
  function renderList(list, container, listType) {
    container.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      if (listType === 'courant') empty.textContent = 'Veuillez saisir une nouvelle échéance avec le bouton dajout +';
      else if (listType === 'vigilance') empty.textContent = 'Vous êtes tranquille, aucune échéance en vigilance';
      else if (listType === 'danger') empty.textContent = 'Tout va bien, aucune échéance en alerte';
      else empty.textContent = 'Aucune échéance';
      container.appendChild(empty);
      return;
    }

    list.forEach(c => {
      const row = document.createElement('div');
      row.className = 'contract-row';

      // contenu gauche (titre + texte secondaire)
      const titleHtml = `
        <div class="primary">
          <strong>${escapeHtml(c.prestataire)}</strong> | ${escapeHtml(c.type)}
        </div>
      `;

      // texte secondaire selon la liste
      let specificText = '';
      if (listType === 'courant') {
        specificText = `Passe en vigilance le : ${formatDateFr(c.preavisDate)}\nÉchéance le : ${formatDateFr(c.date)}`;
      } else if (listType === 'vigilance') {
        const [y, m, d] = (c.date || '').split('-').map(Number);
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const due = new Date(y, (m || 1) - 1, d || 1);
        let joursRestants = Math.ceil((due - now) / msParJour);
        if (joursRestants < 0) joursRestants = 0;
        const jTxt = joursRestants <= 1 ? 'jour' : 'jours';
        specificText = `Encore ${joursRestants} ${jTxt} de délai d'action\nÉchéance le : ${formatDateFr(c.date)}`;
      } else if (listType === 'danger') {
        specificText = `Arrivé à échéance le : ${formatDateFr(c.date)}`;
      } else {
        specificText = `Échéance le : ${formatDateFr(c.date)}`;
      }

      const specificHtml = `<div class="secondary small-muted">${escapeHtml(specificText).replace(/\n/g, '<br/>')}</div>`;

      // priorité (affichée à droite, avant le bouton)
      const priorityHtml = `<div class="priority-tag" aria-hidden="true">P${escapeHtml(String(c.priority || '—'))}</div>`;

      row.innerHTML = `
        <div class="contract-left">
          ${titleHtml}
          ${specificHtml}
        </div>
        <div class="contract-right">
          ${priorityHtml}
          <button class="delete-btn" data-id="${c.id}" aria-label="Supprimer contrat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;

      container.appendChild(row);
    });

    // rattacher les delete-btn (après insertion)
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => openDeleteModal(Number(btn.dataset.id));
    });
  }

  renderList(dangerToRender, dangerContainer, 'danger');
  renderList(vigilanceToRender, vigilanceContainer, 'vigilance');
  renderList(courantToRender, courantContainer, 'courant');

  // met à jour les options types pour le select et datalist
  updateTypeFilterOptions(courant);
}

// initial binding des boutons de tri (switch)
function initSortButtons() {
  document.querySelectorAll('.switch').forEach(btn => {
    // Fonction pour mettre à jour l'état visuel du switch
    function updateSwitchState(target) {
      const isChecked = sortModes[target] === 'priority';
      btn.setAttribute('aria-checked', String(isChecked));
    }

    // Toggle au clic
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (!target) return;
      
      // Toggle mode pour LA liste ciblée
      sortModes[target] = sortModes[target] === 'date' ? 'priority' : 'date';
      
      // Mise à jour visuelle du switch
      updateSwitchState(target);
      
      // Re-render pour appliquer le tri
      render();
    });

    // Support clavier (espace et entrée)
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const target = btn.dataset.target;
        if (!target) return;
        
        sortModes[target] = sortModes[target] === 'date' ? 'priority' : 'date';
        updateSwitchState(target);
        render();
      }
    });

    // Initialiser l'état visuel
    const target = btn.dataset.target;
    if (target) {
      updateSwitchState(target);
    }
  });
}

// init (à appeler au chargement)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSortButtons();
    // on attend que d'autres scripts (ex : addContract) soient chargés et utilisent la variable contracts
    render();
  });
} else {
  initSortButtons();
  render();
}

// expose render si besoin
window.render = render;