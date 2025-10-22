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

document.getElementById('typeFilter').addEventListener('change', render);
