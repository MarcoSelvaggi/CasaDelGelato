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

// ✅ Selezione formato → vai ai gusti
function selectSize(size, g, gr, t, e){
  max = { gusti:g, granelle:gr, topping:t, extra:e };
  scelti = { gusti:[], granelle:[], topping:[], extra:[] };
  step = "gusti";
  render();
  document.getElementById("step-size").style.display = "none";
  document.getElementById("step-container").style.display = "block";
}

// 🔄 Render step
function render(){
  const area = document.getElementById("step-container");
  let titolo = step.toUpperCase();
  let lista = step === "gusti" ? gustiList :
              step === "granelle" ? granelleList :
              step === "topping" ? toppingList : extraList;

  let maxStep = max[step];
  let current = scelti[step].length;

  area.innerHTML = `
<h2 style="margin-bottom:10px;">${current}/${maxStep}</h2>    <div class="ingredienti-lista">
      ${lista.map(item => `
        <div class="item ${scelti[step].includes(item) ? "selected" : ""}"
          onclick="toggle('${step}','${item}')">${item}</div>
      `).join("")}
    </div>
<h2 style="margin-bottom:10px;">${current}/${maxStep}</h2>  `;
}

// 🎯 Selezione ingredienti
function toggle(tipo, nome){
  let arr = scelti[tipo];
  let maxStep = max[tipo];
  if(arr.length >= maxStep){
  showIsland("❌ Limite raggiunto ("+maxStep+")");

  // Effetto X rossa sull'item
  const items = document.querySelectorAll(".item");
  items.forEach(i => {
    if(i.innerText === nome){
      i.classList.add("limit");
      setTimeout(() => i.classList.remove("limit"), 400);
    }
  });
  return;
}

  if(arr.includes(nome)){
    arr.splice(arr.indexOf(nome),1);
    showIsland("Rimosso: " + nome);
  } else {
    if(arr.length >= maxStep){
      showIsland("❌ Limite raggiunto ("+maxStep+")");
      return;
    }
    arr.push(nome);
    showIsland("Aggiunto: " + nome);
  }
  render();
}

// ⏭ Step successivo
function nextStep(){
  if(step === "gusti") step = "granelle";
  else if(step === "granelle") step = "topping";
  else if(step === "topping") step = "extra";
  else conferma();
  render();
}

// ✅ Finale
function conferma(){
  document.getElementById("step-container").innerHTML = `
    <h2>✅ Coppa Creata!</h2>
    <p><b>Gusti:</b> ${scelti.gusti.join(", ")}</p>
    <p><b>Granelle:</b> ${scelti.granelle.join(", ")}</p>
    <p><b>Topping:</b> ${scelti.topping.join(", ")}</p>
    <p><b>Extra:</b> ${scelti.extra.join(", ")}</p>

    <button onclick="navigator.share({ text: 'La mia coppa: ${scelti.gusti.join(', ')} + ${scelti.granelle.join(', ')} + ${scelti.topping.join(', ')} + ${scelti.extra.join(', ')}' })">
      Condividi 📤
    </button>
  `;
}
function updateRiepilogo(){
  document.getElementById("riepilogo-mini").innerHTML = `
    <b>G:</b> ${scelti.gusti.join(", ")}<br>
    <b>Gr:</b> ${scelti.granelle.join(", ")}<br>
    <b>T:</b> ${scelti.topping.join(", ")}<br>
    <b>E:</b> ${scelti.extra.join(", ")}
  `;
}