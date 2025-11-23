// main.js

// Assure que render est exécuté au chargement si nécessaire
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.render === 'function') window.render();
  });
} else {
  if (typeof window.render === 'function') window.render();
}