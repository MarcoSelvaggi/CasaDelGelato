let step = 0;

const gusti = [
"VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
"MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
"STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ","TIRAMISÙ",
"CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES","CREMA ANDALUSA",
"CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT","VARIEGATO FICHI NOCI MIELE"
];
const granelle = ["NOCCIOLA","CROCCANTE","PISTACCHIO","SCAGLIETTE AL CIOCCOLATO","ZUCCHERINI COLORATI","SMARTIES","COCCO RAPE’"];
const topping = ["FRAGOLA","FRUTTI DI BOSCO","MENTA","CARAMELLO","CIOCCOLATO","NOCCIOLA","PISTACCHIO","SCIROPPO AMARENA"];
const ingredienti = ["AMARENE","MACEDONIA","MIX BOSCO","KITKAT","BOUNTY","DUPLO","CIOCCOLATINI"];

let max = {};
let scelta = { formato:"", gusti:[], granelle:[], topping:[], ingredienti:[] };

function byId(id){ return document.getElementById(id); }

function showIsland(text){
  byId("island-text").textContent = text;
  const island = byId("dynamic-island");
  island.style.opacity = "1";
  setTimeout(()=> island.style.opacity = "0", 1600);
}

function selectSize(formato,g,gra,top,ing){
  scelta.formato = formato;
  max = { gusti:g, granelle:gra, topping:top, ingredienti:ing };
  step = 1;
  byId("step-size").style.display = "none";
  byId("step-container").style.display = "block";
  renderStep();
}

function renderStep(){
  const container = byId("step-container");
  container.innerHTML = "";

  const lists = [
    ["Scegli i Gusti", gusti, "gusti"],
    ["Scegli le Granelle", granelle, "granelle"],
    ["Scegli i Topping", topping, "topping"],
    ["Scegli Ingredienti Extra", ingredienti, "ingredienti"]
  ];

  if(step <= 4){
    const [titolo, elenco, tipo] = lists[step-1];
    container.innerHTML = `<h2>${titolo}</h2>`;

    elenco.forEach(item=>{
      const div = document.createElement("div");
      div.className = "menu-item";
      div.textContent = item;
      if(scelta[tipo].includes(item)) div.classList.add("selected");
      div.onclick = () => toggle(tipo,item,div);
      container.appendChild(div);
    });

    container.innerHTML += `<br><div class="menu-item" onclick="step++;renderStep()">Avanti →</div>`;
    return;
  }

  container.innerHTML = `
  <h2>Riepilogo</h2>
  <p><strong>Formato:</strong> ${scelta.formato}</p>
  <p><strong>Gusti:</strong> ${scelta.gusti.join(", ")}</p>
  <p><strong>Granelle:</strong> ${scelta.granelle.join(", ")}</p>
  <p><strong>Topping:</strong> ${scelta.topping.join(", ")}</p>
  <p><strong>Extra:</strong> ${scelta.ingredienti.join(", ")}</p>
  <div class="menu-item" onclick="window.print()">Stampa</div>
  <div class="menu-item" onclick="location.href='index.html'">Home</div>
  `;
}

function toggle(tipo,valore,el){
  if(scelta[tipo].includes(valore)){
    scelta[tipo] = scelta[tipo].filter(x=>x!==valore);
    el.classList.remove("selected");
    return;
  }
  if(scelta[tipo].length >= max[tipo]) return;
  scelta[tipo].push(valore);
  el.classList.add("selected");
  showIsland("Aggiunto!");
}