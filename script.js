
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const appRoot = document.getElementById('appRoot');

const dangerNumberEl = document.querySelector('.danger-number');
const vigilanceNumberEl = document.querySelector('.vigilance-number');
const courantNumberEl = document.querySelector('.courant-number');
const totalContractsEl = document.querySelector('.total-contrat');

const dangerContainer = document.querySelector('.danger > div');
const vigilanceContainer = document.querySelector('.vigilance > div');
const courantContainer = document.getElementById('otherContracts');

let contracts = JSON.parse(localStorage.getItem('contracts') || '[]');

function saveStorage() {
  localStorage.setItem('contracts', JSON.stringify(contracts));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// soustrait 'days' jours à une date 'YYYY-MM-DD' et renvoie 'YYYY-MM-DD'
function dateMinusDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

// formatage pour affichage français "JJ/MM/AAAA"
function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${pad(d)}/${pad(m)}/${y}`;
}

// échappe texte pour éviter injection html
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function render() {
  // relire le localStorage (utile si modifié ailleurs)
  contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  contracts.forEach(c => c.preavis = Number(c.preavis || 0));

  // tri par date d'échéance (la plus proche d'abord)
  contracts.sort((a, b) => {
    const [ay, am, ad] = a.date.split('-').map(Number);
    const [by, bm, bd] = b.date.split('-').map(Number);
    return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
  });

  // date du jour au format YYYY-MM-DD (basée sur l'heure locale)
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const danger = [];
  const vigilance = [];
  const courant = [];

  contracts.forEach(c => {
    const due = c.date; // YYYY-MM-DD
    const preavisDate = dateMinusDays(due, c.preavis || 0); // date à laquelle démarre le préavis
    // classification - priorité Danger > Vigilance > Courant
    if (due <= today) {
      danger.push({ ...c, preavisDate });
    } else if (preavisDate <= today) {
      vigilance.push({ ...c, preavisDate });
    } else {
      courant.push({ ...c, preavisDate });
    }
  });

  // compteurs
  totalContractsEl.textContent = `${contracts.length}`;
  dangerNumberEl.textContent = `${danger.length}`;
  vigilanceNumberEl.textContent = `${vigilance.length}`;
  courantNumberEl.textContent = `${courant.length}`;

  // rendu des listes (chaque liste est déjà triée par échéance par le tri global)
  function renderList(list, container) {
    container.innerHTML = '';
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Aucun contrat';
      container.appendChild(empty);
      return;
    }
    list.forEach(c => {
      const row = document.createElement('div');
      row.className = 'contract-row';
      row.innerHTML = `
        <div class="contract-info">
          <strong>${escapeHtml(c.type)}</strong>
          &nbsp;|&nbsp; Échéance: ${formatDateFr(c.date)}
          &nbsp;|&nbsp; Préavis: ${c.preavis} j
          <span class="preavis-note"> (préavis à: ${formatDateFr(c.preavisDate)})</span>
        </div>
        <div class="actions-row">
          <button class="delete-btn" data-id="${c.id}" aria-label="Supprimer contrat"><i class="fa-solid fa-delete-left"></i></button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  renderList(danger, dangerContainer);
  renderList(vigilance, vigilanceContainer);
  renderList(courant, courantContainer);

  // attacher les actions de suppression
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      deleteContract(id);
    };
  });
}

function deleteContract(id) {
  const confirmDelete = confirm("Voulez-vous vraiment supprimer ce contrat ?");
  if (!confirmDelete) return; // si l'utilisateur annule, on sort

  contracts = contracts.filter(c => c.id !== id);
  saveStorage();
  render();
}

// --- Modal controls ---
function openModal() {
  modal.classList.remove('hidden');
  appRoot.setAttribute('inert', ''); // bloque l’arrière-plan
  document.getElementById('typeInput').focus();
}

function closeModal() {
  modal.classList.add('hidden');
  appRoot.removeAttribute('inert');
}

addBtn.onclick = openModal;
cancelBtn.onclick = closeModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

// --- Save contract ---
saveBtn.onclick = () => {
  const type = document.getElementById('typeInput').value.trim();
  const date = document.getElementById('dateInput').value; // YYYY-MM-DD from input[type=date]
  const preavisRaw = document.getElementById('preavisInput').value.trim();
  const preavis = Number(preavisRaw);

  if (!type || !date || preavisRaw === '') {
    alert('Tous les champs sont obligatoires.');
    return;
  }
  if (isNaN(preavis) || preavis < 0) {
    alert('Le préavis doit être un nombre entier positif (ou 0).');
    return;
  }

  const newContract = {
    id: Date.now(),
    type,
    date,
    preavis: Math.floor(preavis)
  };

  contracts.push(newContract);
  saveStorage();
  render();

  // reset + fermer modal
  document.getElementById('typeInput').value = '';
  document.getElementById('dateInput').value = '';
  document.getElementById('preavisInput').value = '';
  closeModal();
};

// Init
render();