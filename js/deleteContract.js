// deleteContract.js

const deleteModal = document.getElementById('deleteModal');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');


let contractToDelete = null;

function openDeleteModal(id) {
  contractToDelete = id;
  deleteModal.classList.remove('hidden');
  appRoot.setAttribute('inert', '');
}

function closeDeleteModal() {
  contractToDelete = null;
  deleteModal.classList.add('hidden');
  appRoot.removeAttribute('inert');
}

deleteCancelBtn.onclick = closeDeleteModal;
deleteConfirmBtn.onclick = () => {
  if (contractToDelete !== null) {
    contracts = contracts.filter(c => c.id !== contractToDelete);
    saveStorage();
    render();
  }
  closeDeleteModal();
};

deleteModal.onclick = e => { if (e.target === deleteModal) closeDeleteModal(); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !deleteModal.classList.contains('hidden')) closeDeleteModal();
});
