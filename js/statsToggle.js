// statsToggle.js


(function () {
  // classes valides correspondant aux cartes
  const VALID_KEYS = ['danger', 'vigilance', 'courant', 'total'];

  const cards = Array.from(document.querySelectorAll('.stat-card'));
  const sections = {
    danger: document.querySelector('section.danger'),
    vigilance: document.querySelector('section.vigilance'),
    courant: document.querySelector('section.courant-list'),
    // total -> on affichera toutes les sections
  };

  if (!cards.length) return;

  // helper : convertit "rgb(r,g,b)" ou "#rrggbb" en "rgba(r,g,b,a)"
  function toRGBA(colorStr, alpha = 0.28) {
    if (!colorStr) return `rgba(0,0,0,${alpha})`;
    colorStr = colorStr.trim();
    // rgb(...) ou rgba(...)
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      const r = +rgbMatch[1], g = +rgbMatch[2], b = +rgbMatch[3];
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // #rrggbb
    const hexMatch = colorStr.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // fallback
    return `rgba(0,0,0,${alpha})`;
  }

  // activeKey: 'danger' | 'vigilance' | 'courant' | 'total'
  function setActiveStat(activeKey) {
    if (!VALID_KEYS.includes(activeKey)) activeKey = 'total';

    // toggle visual sur les cartes
    cards.forEach(card => {
      // repère si la card contient la classe correspondant
      const isThis = card.classList.contains(activeKey);
      if (isThis) {
        card.classList.add('active');
        // on applique un shadow dynamique basé sur la couleur de fond
        const bg = getComputedStyle(card).backgroundColor;
        card.style.boxShadow = `0 12px 8px ${toRGBA(bg, 0.40)}`;
      } else {
        card.classList.remove('active');
        card.style.boxShadow = '';
      }
    });

    // affichage des sections : si 'total' -> montrer toutes, sinon ne montrer que la section correspondante
    if (activeKey === 'total') {
      Object.values(sections).forEach(sec => sec && sec.classList.remove('hidden'));
    } else {
      Object.keys(sections).forEach(k => {
        const sec = sections[k];
        if (!sec) return;
        if (k === activeKey) sec.classList.remove('hidden');
        else sec.classList.add('hidden');
      });
    }
  }

  // click handlers
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // trouve la première classe qui match VALID_KEYS
      const cls = Array.from(card.classList).find(c => VALID_KEYS.includes(c));
      setActiveStat(cls || 'total');
    });
  });

  // Default au chargement : total
  // On attend le DOM complet (si le script est chargé avant que le DOM soit prêt).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setActiveStat('total'));
  } else {
    setActiveStat('total');
  }

  // expose une fonction (facultatif) si tu veux manipuler depuis la console
  window.setActiveStat = setActiveStat;
})();
