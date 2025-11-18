// date.js

const dateEl = document.getElementById("date-container");

const options = { 
  weekday: "long", 
  year: "numeric", 
  month: "long", 
  day: "numeric" 
};

const today = new Date().toLocaleDateString("fr-FR", options);

dateEl.textContent = today;
