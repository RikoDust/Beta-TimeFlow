// addContract.js

const modal = document.getElementById('modal');
const addBtn = document.getElementById('addBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

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
modal.onclick = e => { if (e.target === modal) closeModal(); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

saveBtn.onclick = () => {
  const prestataire = document.getElementById('prestataireInput').value.trim();
  const type = document.getElementById('typeInput').value.trim();
  const date = document.getElementById('dateInput').value;
  const preavisRaw = document.getElementById('preavisInput').value.trim();
  const priorityRaw = document.getElementById('priorityInput') ? document.getElementById('priorityInput').value : '';
  const preavis = Number(preavisRaw);
  const priority = priorityRaw === '' ? null : Number(priorityRaw);

  // validation
  if (!prestataire || !type || !date || preavisRaw === '' || priorityRaw === '') {
    return alert('Tous les champs sont obligatoires (y compris la priorité).');
  }
  if (isNaN(preavis) || preavis < 0) return alert('Le préavis doit être un nombre positif.');
  if (![1,2,3].includes(priority)) return alert('La priorité doit être 1, 2 ou 3.');

  // push et sauvegarde
  contracts.push({
    id: Date.now(),
    prestataire,
    type,
    date,
    preavis: Math.floor(preavis),
    priority
  });

  saveStorage();
  render();

  // reset inputs
  document.getElementById('prestataireInput').value = '';
  document.getElementById('typeInput').value = '';
  document.getElementById('dateInput').value = '';
  document.getElementById('preavisInput').value = '';
  if (document.getElementById('priorityInput')) document.getElementById('priorityInput').value = '';

  closeModal();
};