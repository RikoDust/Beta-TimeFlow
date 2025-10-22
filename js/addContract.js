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
  const preavis = Number(preavisRaw);

  if (!prestataire || !type || !date || preavisRaw === '') return alert('Tous les champs sont obligatoires.');
  if (isNaN(preavis) || preavis < 0) return alert('Le préavis doit être un nombre positif.');

  contracts.push({ id: Date.now(), prestataire, type, date, preavis: Math.floor(preavis) });
  saveStorage();
  render();

  document.getElementById('prestataireInput').value = '';
  document.getElementById('typeInput').value = '';
  document.getElementById('dateInput').value = '';
  document.getElementById('preavisInput').value = '';
  closeModal();
};
