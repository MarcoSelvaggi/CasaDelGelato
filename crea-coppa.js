// 📌 STATO
let max = { gusti:0, granelle:0, topping:0, extra:0 };
let scelti = { gusti:[], granelle:[], topping:[], extra:[] };
let step = "gusti";

// LISTE
const gustiList = [
"VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
"MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
"STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ",
"TIRAMISÙ","CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES",
"CREMA ANDALUSA","CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT",
"VARIEGATO FICHI NOCI MIELE"
];

const granelleList = ["GRANELLA NOCCIOLA","SMARTIES","BISCOTTO","BISCOTTO OREO","MANDORLA"];
const toppingList = ["CIOCCOLATO CALDO","CARAMELLO","FRAGOLA","PISTACCHIO"];
const extraList = ["PANNA","CONO","CIALDA","WAFER"];

// 🎛 Dynamic Island
function showIsland(text){
  const island = document.getElementById("dynamic-island");
  document.getElementById("island-text").innerText = text;

  let tot = max.gusti + max.granelle + max.topping + max.extra;
  let done = scelti.gusti.length + scelti.granelle.length + scelti.topping.length + scelti.extra.length;
  document.getElementById("island-bar").style.width = (done / tot * 100) + "%";

  island.classList.add("show");
  setTimeout(()=>island.classList.remove("show"),1400);
}

// ✅ Selezione formato → Gusti
function selectSize(size, g, gr, t, e){
  max = { gusti:g, granelle:gr, topping:t, extra:e };
  scelti = { gusti:[], granelle:[], topping:[], extra:[] };
  step = "gusti";
  render();
  document.getElementById("step-size").style.display = "none";
  document.getElementById("step-container").style.display = "block";
  updateRiepilogo();
}

// 🔄 Render
function render(){
  const area = document.getElementById("step-container");
  let titolo = step.toUpperCase();
  let lista = step === "gusti" ? gustiList :
              step === "granelle" ? granelleList :
              step === "topping" ? toppingList : extraList;

  area.innerHTML = `
<h2>${titolo}</h2>

<div class="ingredienti-lista">
${lista.map(item => `
  <div class="item ${scelti[step].includes(item) ? "selected" : ""}" onclick="toggle('${step}','${item}')">
    ${item}
  </div>`).join("")}
</div>

<div class="nav-buttons">
<button class="back-btn" onclick="prevStep()">⬅ Indietro</button>  <button class="next-btn" onclick="nextStep()">
    ${step === "extra" ? "Conferma ✅" : "Avanti ➜"}
  </button>
</div>
`;
}

// 🎯 Seleziona / Deseleziona ingredienti
function toggle(tipo, nome){
  let arr = scelti[tipo];
  let maxStep = max[tipo];

  // ✅ SE GIÀ SELEZIONATO → RIMUOVO
  if(arr.includes(nome)){
    scelti[tipo] = arr.filter(i => i !== nome);
    showIsland("Rimosso: " + nome);

    const el = [...document.querySelectorAll(".item")].find(x => x.textContent.trim() === nome);
    if(el){
      el.classList.add("remove-anim");
      setTimeout(()=> el.classList.remove("remove-anim"), 350);
    }

    render();
    updateRiepilogo();
    return;
  }

  // ❌ LIMITE RAGGIUNTO → ANIMAZIONE ROSSA
  if(arr.length >= maxStep){
    const el = [...document.querySelectorAll(".item")].find(x => x.textContent.trim() === nome);
    if(el){
      el.classList.add("limit-error");
      setTimeout(()=> el.classList.remove("limit-error"), 450);
    }
    showIsland(`❌ Limite massimo (${maxStep})`);
    return;
  }

  // ✅ SELEZIONE NORMALE
  arr.push(nome);
  showIsland("Aggiunto: " + nome);

  const el = [...document.querySelectorAll(".item")].find(x => x.textContent.trim() === nome);
  if(el){
    el.classList.add("add-ok");
    setTimeout(()=> el.classList.remove("add-ok"), 350);
  }

  render();
  updateRiepilogo();
}

function nextStep(){
  if(step === "gusti") step = "granelle";
  else if(step === "granelle") step = "topping";
  else if(step === "topping") step = "extra";
  else conferma();

  render();
}

function prevStep(){
  if(step === "gusti"){
    document.getElementById("step-container").style.display = "none";
    document.getElementById("step-size").style.display = "block";
    return;
  }

  if(step === "granelle") step = "gusti";
  else if(step === "topping") step = "granelle";
  else if(step === "extra") step = "topping";

  render();
}

// ✅ Fine → Riepilogo condivisibile
function conferma(){
  document.getElementById("step-container").innerHTML = `
  <h2>✅ Coppa Creata!</h2>
  <p><b>Gusti:</b> ${scelti.gusti.join(", ")}</p>
  <p><b>Granelle:</b> ${scelti.granelle.join(", ")}</p>
  <p><b>Topping:</b> ${scelti.topping.join(", ")}</p>
  <p><b>Extra:</b> ${scelti.extra.join(", ")}</p>
  
  <button onclick="navigator.share({ text: 'La mia coppa: ${scelti.gusti.join(', ')} + ${scelti.granelle.join(', ')} + ${scelti.topping.join(', ')} + ${scelti.extra.join(', ')}' })">
    Condividi 📤
  </button>`;
}

// 🔝 Mini-riepilogo
function updateRiepilogo(){
  document.getElementById("riepilogo-mini").innerHTML = `
  <b>G:</b> ${scelti.gusti.join(", ")}<br>
  <b>Gr:</b> ${scelti.granelle.join(", ")}<br>
  <b>T:</b> ${scelti.topping.join(", ")}<br>
  <b>E:</b> ${scelti.extra.join(", ")}
  `;
}