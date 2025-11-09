// 📌 STATO
let coppaSelezionata = "";
let max = { gusti:0, granelle:0, topping:0, ingredienti:0, extra:0 };
let scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };
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

const granelleList = ["NOCCIOLA","CROCCANTE","PISTACCHIO","COCCO RAPE'","SCAGLIETTE AL CIOCCOLATO","SMARTIES","ZUCCHERINI COLORATI"];
const toppingList = ["ANANAS","ARANCIA","FRAGOLA","FRUTTI DI BOSCO","KIWI","MELONE","MENTA","CARAMELLO","MALAGA","CIOCCOLATO","NOCCIOLA","PISTACCHIO","LIQUORE AMARETTO","LIQUORE AL CAFFE'","LIQUORE AL COCCO","SCIROPPO AMARENA","JOGURT NATURALE","VOV","CAFFE' ESPRESSO","CAFFE' DECA","ORZO","GINSENG","CAFFE' FREDDO","CIOCCOLATO FREDDO","AMARETTO DISARONNO","BAYLES","COINTREAU","GRAND MARNIER","JACK DANIELS","LIMONCELLO","RUM","STRAVECCHIO","VECCHIA ROMAGNA","VODKA"];
const ingredientiList = ["AMARENE(4PZ)","MACEDONIA","ANGURIA","ANANAS","BANANA","FRAGOLE","KIWI","MELONE","MIX BOSCO","PESCA","UVA","FRUTTI DI BOSCO","AMARETTI","NOCCIOLINE","NOCI","UVETTA","MIKADO","AFTER EIGHT","BOUNTY","KITKAT","DUPLO","CIOCCOLATINI"];
const extraList = ["COCCO(3PZ)","MIX KINDER","PANNA EXTRA"];

const prezziBase = {
  "PICCOLA": 7.50,
  "MEDIA": 9.00,
  "GRANDE": 12.00
};

const prezziExtra = {
  "COCCO (4pz)": 0.50,
  "MIX KINDER": 2.50,
  "PANNA EXTRA": 1.80
};

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
  coppaSelezionata = size; // <-- QUESTA È L'IMPORTANTE
  
  max = { gusti:g, granelle:gr, topping:t, ingredienti:e, extra:0 };
  scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };

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
              step === "topping" ? toppingList :
              step === "ingredienti" ? ingredientiList :
              extraList;

  area.innerHTML = `
<h2>${titolo}</h2>

<div class="ingredienti-lista">
${lista.map(item => `
  <div class="item ${scelti[step].includes(item) ? "selected" : ""}" onclick="toggle('${step}','${item}')">
    ${item}
  </div>`).join("")}
</div>

<div class="nav-buttons">
  <button class="back-btn" onclick="prevStep()">⬅ Indietro</button>
  <button class="next-btn" onclick="nextStep()">
    ${step === "ingredienti" ? "Conferma ✅" : "Avanti ➜"}
  </button>
</div>
console.log("STEP ATTUALE:", step);
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
  else if(step === "topping") step = "ingredienti";
  else if(step === "ingredienti") step = "extra";
  else if(step === "extra") return mostraRiepilogo(); // ✅ QUI MOSTRIAMO IL RIEPILOGO

  render();
}

function prevStep(){
  if(step === "granelle") step = "gusti";
  else if(step === "topping") step = "granelle";
  else if(step === "ingredienti") step = "topping";

  render();
}

function conferma(){
  let base = prezziBase[coppaSelezionata];
  let extraCosto = scelti.ingredienti.reduce((sum, x)=> sum + prezziIngredienti[x], 0);
  let totale = base + extraCosto;

  document.getElementById("step-container").innerHTML = `
    <h2>🍨 Coppa ${coppaSelezionata}</h2>

    <p><b>Gusti:</b> ${scelti.gusti.join(", ")}</p>
    <p><b>Granelle:</b> ${scelti.granelle.join(", ")}</p>
    <p><b>Topping:</b> ${scelti.topping.join(", ")}</p>
    <p><b>Ingredienti Extra:</b> ${
      scelti.ingredienti.map(x => `${x} (+€${prezziIngredienti[x].toFixed(2)})`).join("<br>")
    }</p>

    <h3>Prezzo base: €${base.toFixed(2)}</h3>
    <h3>Extra: €${extraCosto.toFixed(2)}</h3>
    <h2>TOTALE: €${totale.toFixed(2)}</h2>

    <p style="margin-top:20px;">👋 Ora elenca questa coppa al cameriere</p>
  `;
}

function nextStep(){
  if(step === "gusti") step = "granelle";
  else if(step === "granelle") step = "topping";
  else if(step === "topping") step = "ingredienti";
  else if(step === "ingredienti") step = "extra";
  else if(step === "extra") return mostraRiepilogo(); // ✅ QUI MOSTRIAMO IL RIEPILOGO

  render();
}