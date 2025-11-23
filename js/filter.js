// filter.js

function updateTypeFilterOptions(courant) {
  const select = document.getElementById('typeFilter');
  if (select) {
    const currentValue = select.value;
    const types = [...new Set(courant.map(c => c.type).filter(Boolean))];

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
    const types = [...new Set(courant.map(c => c.type).filter(Boolean))];
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      datalist.appendChild(opt);
    });
  }
}

// trigger render lorsqu'on change le filter
const typeFilterEl = document.getElementById('typeFilter');
if (typeFilterEl) {
  typeFilterEl.addEventListener('change', () => {
    // appelle la fonction globale render définie dans dataManager.js
    if (typeof window.render === 'function') window.render();
  });
}