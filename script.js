const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const appRoot = document.getElementById('appRoot');

const dangerNumberEl = document.querySelector('.danger-number');
const vigilanceNumberEl = document.querySelector('.vigilance-number');
const courantNumberEl = document.querySelector('.courant-number');
const totalContractsEl = document.querySelector('.total-contrat');

const dangerContainer = document.querySelector('section.danger > div');
const vigilanceContainer = document.querySelector('section.vigilance > div');
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
  // relire le localStorage
  contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  contracts.forEach(c => c.preavis = Number(c.preavis || 0));

  // tri par date d'échéance
  contracts.sort((a, b) => {
    const [ay, am, ad] = a.date.split('-').map(Number);
    const [by, bm, bd] = b.date.split('-').map(Number);
    return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
  });

  // date du jour
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const danger = [];
  const vigilance = [];
  const courant = [];

  contracts.forEach(c => {
    const due = c.date; 
    const preavisDate = dateMinusDays(due, c.preavis || 0);
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

  // rendu listes
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
          <div>
            <strong>${escapeHtml(c.type)}</strong>
            &nbsp;|&nbsp; ${escapeHtml(c.prestataire || '')}
          </div>
          <div>
            Échéance: ${formatDateFr(c.date)}
            &nbsp;|&nbsp; Délai: ${c.preavis} j
            <span class="preavis-note"> (En vigilance le : ${formatDateFr(c.preavisDate)})</span>
          </div>
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

  // filtrage uniquement sur la zone verte
  const filterValue = document.getElementById('prestataireFilter')?.value || '';
  const courantFiltered = filterValue
    ? courant.filter(c => c.prestataire === filterValue)
    : courant;
  renderList(courantFiltered, courantContainer);

  // maj de la liste déroulante prestataires uniquement à partir de la zone verte
  updatePrestataireFilterOptions(courant);

  // suppression
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      deleteContract(id);
    };
  });
}

function deleteContract(id) {
  const confirmDelete = confirm("Voulez-vous vraiment supprimer ce contrat ?");
  if (!confirmDelete) return;
  contracts = contracts.filter(c => c.id !== id);
  saveStorage();
  render();
}

// --- Modal controls ---
function openModal() {
  modal.classList.remove('hidden');
  appRoot.setAttribute('inert', '');
  document.getElementById('prestataireInput').focus();
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
  const prestataire = document.getElementById('prestataireInput').value.trim();
  const type = document.getElementById('typeInput').value.trim();
  const date = document.getElementById('dateInput').value;
  const preavisRaw = document.getElementById('preavisInput').value.trim();
  const preavis = Number(preavisRaw);

  if (!prestataire || !type || !date || preavisRaw === '') {
    alert('Tous les champs sont obligatoires.');
    return;
  }
  if (isNaN(preavis) || preavis < 0) {
    alert('Le préavis doit être un nombre entier positif (ou 0).');
    return;
  }

  const newContract = {
    id: Date.now(),
    prestataire,
    type,
    date,
    preavis: Math.floor(preavis)
  };

  contracts.push(newContract);
  saveStorage();
  render();

  // reset form
  document.getElementById('prestataireInput').value = '';
  document.getElementById('typeInput').value = '';
  document.getElementById('dateInput').value = '';
  document.getElementById('preavisInput').value = '';
  closeModal();
};


// --- Mise à jour de la liste déroulante (zone verte uniquement) ---
function updatePrestataireFilterOptions(courant) {
  const select = document.getElementById('prestataireFilter');
  if (!select) return;

  const currentValue = select.value;

  const prestataires = [...new Set(courant.map(c => c.prestataire).filter(Boolean))];

  select.innerHTML = '<option value="">-- Tous les prestataires --</option>';
  prestataires.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  if (prestataires.includes(currentValue) || currentValue === "") {
    select.value = currentValue;
  } else {
    select.value = "";
  }
}

// écouteur sur le select
document.getElementById('prestataireFilter')?.addEventListener('change', render);

// Init
render();
