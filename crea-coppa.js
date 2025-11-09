
// === PARAMETRI SELEZIONE COPPA ===
let maxGusti = 0, maxGranelle = 0, maxTopping = 0, maxExtra = 0;

let scelti = {
  gusti: [],
  granelle: [],
  topping: [],
  extra: []
};

// LISTE INGREDIENTI
const gusti = [
"VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
"MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
"STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ",
"TIRAMISÙ","CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES",
"CREMA ANDALUSA","CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT",
"VARIEGATO FICHI NOCI MIELE"
];

const granelle = ["GRANELLA NOCCIOLA","SMARTIES","BISCOTTO","BISCOTTO OREO","MANDORLA"];
const topping = ["CIOCCOLATO CALDO","CARAMELLO","FRAGOLA","PISTACCHIO"];
const extra = ["PANNA","CONO","CIALDA","WAFER"];

// DYNAMIC ISLAND
function showIsland(text, percent) {
  document.getElementById("island-text").innerText = text;
  document.getElementById("island-bar").style.width = percent + "%";
  document.getElementById("dynamic-island").classList.add("show");
  setTimeout(() => {
    document.getElementById("dynamic-island").classList.remove("show");
  }, 1500);
}

// Selezione formato
function selectSize(size, g, gr, t, e) {
  maxGusti = g; maxGranelle = gr; maxTopping = t; maxExtra = e;
  scelti = { gusti:[], granelle:[], topping:[], extra:[] };
  renderStep("gusti", gusti, maxGusti);
}

// Genera fase di selezione
function renderStep(tipo, lista, max) {
  const container = document.getElementById("step-container");
  container.style.display = "block";

  container.innerHTML = `
  <h2>Scegli ${tipo.toUpperCase()} (${scelti[tipo].length}/${max})</h2>
  <div class="ingredienti-lista">
    ${lista.map(item => `
      <div class="item ${scelti[tipo].includes(item) ? "selected" : ""}"
           onclick="toggle('${tipo}','${item}',${max})">${item}</div>
    `).join("")}
  </div>
  ${tipo !== "extra" ? `<button onclick="nextStep('${tipo}')">Avanti ➜</button>` : `<button onclick="conferma()">Conferma ✅</button>`}
  `;
}

// Toggle selezione
function toggle(tipo, nome, max) {
  const arr = scelti[tipo];
  if (arr.includes(nome)) {
    arr.splice(arr.indexOf(nome), 1);
  } else {
    if (arr.length >= max) return;
    arr.push(nome);
  }
  showIsland(nome, (arr.length / max) * 100);
  renderStep(tipo, tipo === "gusti" ? gusti : tipo === "granelle" ? granelle : tipo === "topping" ? topping : extra, max);
}

// Cambia fase
function nextStep(attuale) {
  if (attuale === "gusti") renderStep("granelle", granelle, maxGranelle);
  else if (attuale === "granelle") renderStep("topping", topping, maxTopping);
  else if (attuale === "topping") renderStep("extra", extra, maxExtra);
}

// Fine
function conferma() {
  alert("✅ Coppa Creata!\n\n" +
  "Gusti: " + scelti.gusti.join(", ") +
  "\nGranelle: " + scelti.granelle.join(", ") +
  "\nTopping: " + scelti.topping.join(", ") +
  "\nExtra: " + scelti.extra.join(", "));
}