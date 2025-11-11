// ---------------- STATO ----------------
let coppaSelezionata = "";
let scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };
let max = { gusti:0, granelle:0, topping:0, ingredienti:0, extra:0 };
let step = "size"; // iniziamo sulla scelta formato

// ---------------- LISTE ----------------
const gustiList = [
  "VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
  "MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
  "STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ",
  "TIRAMISÙ","CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES",
  "CREMA ANDALUSA","CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT",
  "VARIEGATO FICHI NOCI MIELE"
];

const granelleList = [
  "NOCCIOLA","CROCCANTE","PISTACCHIO","COCCO RAPE'","SCAGLIETTE AL CIOCCOLATO","SMARTIES","ZUCCHERINI COLORATI"
];

const toppingList = [
  "ANANAS","ARANCIA","FRAGOLA","FRUTTI DI BOSCO","KIWI","MELONE","MENTA","CARAMELLO","MALAGA","CIOCCOLATO","NOCCIOLA","PISTACCHIO",
  "LIQUORE AMARETTO","LIQUORE AL CAFFE'","LIQUORE AL COCCO","SCIROPPO AMARENA","JOGURT NATURALE","VOV","CAFFÈ ESPRESSO","CAFFÈ DECA","ORZO"
];

const ingredientiList = [
  "AMARENE(4PZ)","MACEDONIA","ANGURIA","ANANAS","BANANA","FRAGOLE","KIWI","MELONE",
  "MIX BOSCO","PESCA","UVA","FRUTTI DI BOSCO","AMARETTI","NOCCIOLINE","NOCI","UVETTA",
  "MIKADO","AFTER EIGHT","BOUNTY","KITKAT","DUPLO","CIOCCOLATINI"
];

const extraList = ["COCCO (3pz)","MIX KINDER","PANNA EXTRA"];

// ---------------- PREZZI ----------------
const prezziBase = { PICCOLA: 7.50, MEDIA: 9.00, GRANDE: 12.00 };
const prezziExtra = { "COCCO (3pz)": 0.50, "MIX KINDER": 2.50, "PANNA EXTRA": 1.80 };

// ---------------- UTIL ----------------
function byId(id){ return document.getElementById(id); }
function safeJoin(arr){ return (arr && arr.length) ? arr.join(", ") : "-"; }
function escForOnclick(s){ return String(s).replace(/'/g, "\\'"); }

// ---------------- DYNAMIC ISLAND ----------------
function showIsland(text){
  const island = byId("dynamic-island");
  const label = island?.querySelector("#island-text");
  const bar = island?.querySelector("#island-bar");
  if(label) label.textContent = text;

  const extraUnlimited = (max.extra === Infinity);
  const totSlots = (max.gusti+max.granelle+max.topping+max.ingredienti + (extraUnlimited?0:max.extra));
  const done = (scelti.gusti.length+scelti.granelle.length+scelti.topping.length+scelti.ingredienti.length + (extraUnlimited?0:scelti.extra.length));
  const pct = totSlots ? Math.round(done/totSlots*100) : 0;
  if(bar) bar.style.width = pct+"%";

  island?.classList.add("show");
  clearTimeout(island?._hideTO);
  island._hideTO = setTimeout(()=> island.classList.remove("show"), 1400);
}

// ---------------- FORMATO ----------------
function showSizeScreen(){
  document.querySelector("header").style.display = "block";
  step = "size";
  byId("step-size").style.display = "block";
  byId("step-container").style.display = "none";
  updateRiepilogo();
}

function selectSize(size, g, gr, t, ing){
  document.querySelector("header").style.display = "none";
  coppaSelezionata = size;
  max = { gusti:g, granelle:gr, topping:t, ingredienti:ing, extra:Infinity };
  scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };
  step = "gusti";
  byId("step-size").style.display = "none";
  byId("step-container").style.display = "block";
  render();
  updateRiepilogo();
}

// ---------------- RENDER ----------------
function render(){
  const area = byId("step-container");

  let lista = [];
  if(step==="gusti") lista = gustiList;
  else if(step==="granelle") lista = granelleList;
  else if(step==="topping") lista = toppingList;
  else if(step==="ingredienti") lista = ingredientiList;
  else if(step==="extra") lista = extraList.map(e => e + (prezziExtra[e] ? ` (+€${prezziExtra[e].toFixed(2)})`:""));

  const maxStep = max[step] || 0;
  const current = scelti[step].length;
  const counter = (step==="extra") ? "" : ` (${current}/${maxStep})`;

  area.innerHTML = `
    <h2>${step.toUpperCase()}${counter}</h2>
    <div class="ingredienti-lista">
      ${lista.map(it=>{
        const nome = it.split(" (+€")[0].trim();
        const sel = scelti[step].includes(nome) ? "selected" : "";
        return `<div class="item ${sel}" onclick="toggle('${step}', '${escForOnclick(nome)}', this)">${it}</div>`;
      }).join("")}
    </div>
    <div class="nav-buttons">
      <button class="back-btn" onclick="prevStep()">⬅ Indietro</button>
      <button class="next-btn" onclick="nextStep()">${step==="extra"?"Conferma ✅":"Avanti ➜"}</button>
    </div>
  `;

  // --- Quick Next Logic ---
  const quick = byId("quick-next");
  if(quick){
    if(maxStep && scelti[step].length >= maxStep){
      quick.style.display = "block";
    } else {
      quick.style.display = "none";
    }
  }
}

// ---------------- TOGGLE ----------------
function limitEffect(nome){
  document.querySelectorAll(".item").forEach(el=>{
    if(el.textContent.trim().startsWith(nome)){
      el.classList.add("limit-reached");
      setTimeout(()=>el.classList.remove("limit-reached"),1500);
    }
  });
  showIsland("Limite raggiunto ❗");
}

function toggle(step, nome){
  if(step==="extra"){
    if(scelti.extra.includes(nome)) scelti.extra = scelti.extra.filter(x=>x!==nome);
    else scelti.extra.push(nome);
    showIsland(nome);
    render(); updateRiepilogo(); return;
  }

  if(scelti[step].includes(nome)){
    scelti[step] = scelti[step].filter(x=>x!==nome);
  } else {
    if(scelti[step].length >= max[step]) return limitEffect(nome);
    scelti[step].push(nome);
  }

  showIsland(nome);
  render();
  updateRiepilogo();
  updateQuickNext();
}

// ---------------- NAV ----------------
function nextStep(){
  if(step==="gusti") step="granelle";
  else if(step==="granelle") step="topping";
  else if(step==="topping") step="ingredienti";
  else if(step==="ingredienti") step="extra";
  else return mostraRiepilogo(); // ✅ qui il riepilogo finale

  render();
  updateRiepilogo(); // ✅ questa riga mancava!
}
function prevStep(){
  if(step==="gusti"){ showSizeScreen(); return; }
  if(step==="granelle") step="gusti";
  else if(step==="topping") step="granelle";
  else if(step==="ingredienti") step="topping";
  else if(step==="extra") step="ingredienti";
  render();
}

// ---------------- MINI-RIEPILOGO ----------------
// helper escape (copiala se non l'hai già)
function escapeHtml(s){
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// updateRiepilogo: versione verticale, step-by-step
function updateRiepilogo(){
  const el = byId("riepilogo-mini");
  if(!el) return;

  // se siamo nella schermata finale (scontrino) lo nascondiamo
  if(document.querySelector(".scontrino") || step === "riepilogo"){
    el.classList.add("hidden");
    return;
  }

  // titolo (mostra solo se selezionata una coppa)
  const titolo = coppaSelezionata ? `<div class="riepilogo-titolo">🍨 ${escapeHtml(coppaSelezionata)}</div>` : `<div class="riepilogo-titolo" style="opacity:.6">Scegli il formato</div>`;

  // prepariamo le righe: se vuote mostriamo "-" per chiarezza
  const riga = (label, arr) => {
    const val = (arr && arr.length) ? escapeHtml(safeJoin(arr)) : "-";
    return `<div class="riepilogo-line"><b>${escapeHtml(label)}</b>${val}</div>`;
  };

  el.innerHTML = `
    ${titolo}
    ${riga("G", scelti.gusti)}
    ${riga("Gr", scelti.granelle)}
    ${riga("T", scelti.topping)}
    ${riga("Ing", scelti.ingredienti)}
    ${riga("Extra", scelti.extra)}
  `;

  // Mostra il mini riepilogo se siamo in una fase di selezione (non size)
  if(step === "size"){
    el.classList.add("hidden");
  } else {
    el.classList.remove("hidden");
  }
}
// ---------------- SHARE ----------------
function shareRiepilogo(){
  const text = `COPPA ${coppaSelezionata}\n\n`+
    `Gusti: ${safeJoin(scelti.gusti)}\n`+
    `Granelle: ${safeJoin(scelti.granelle)}\n`+
    `Topping: ${safeJoin(scelti.topping)}\n`+
    `Ingredienti: ${safeJoin(scelti.ingredienti)}\n`+
    `Extra: ${safeJoin(scelti.extra)}`;

  navigator.share ? navigator.share({text}) : alert(text);
}
document.getElementById("quick-next").addEventListener("click", () => {
  document.querySelector(".next-btn")?.click();
});


function mostraRiepilogo(){
  step = "riepilogo";
  const area = byId("step-container");

  const prezzoBase = prezziBase[coppaSelezionata] || 0;
  const prezzoExtraDettaglio = scelti.extra.map(e => ({
    nome: e,
    prezzo: prezziExtra[e] || 0
  }));
  const sommaExtra = prezzoExtraDettaglio.reduce((t,x)=> t + x.prezzo, 0);
  const totale = prezzoBase + sommaExtra;

  area.innerHTML = `
    <h2>Riepilogo finale</h2>

    <div class="scontrino">
      <p><b>Formato:</b> ${coppaSelezionata} — €${prezzoBase.toFixed(2)}</p>
      <p><b>Gusti:</b> ${safeJoin(scelti.gusti)}</p>
      <p><b>Granelle:</b> ${safeJoin(scelti.granelle)}</p>
      <p><b>Topping:</b> ${safeJoin(scelti.topping)}</p>
      <p><b>Ingredienti:</b> ${safeJoin(scelti.ingredienti)}</p>

      <p><b>Extra:</b> 
        ${
          prezzoExtraDettaglio.length
          ? prezzoExtraDettaglio.map(x=> `${x.nome} (+€${x.prezzo.toFixed(2)})`).join(", ")
          : "-"
        }
      </p>

      <hr>
      <p><b>Totale:</b> €${totale.toFixed(2)}</p>
    </div>

    <p style="margin-top:12px; font-size:14px; text-align:center; opacity:0.75;">
     📣 Comunica al cameriere la tua coppa gelato 📣
    </p>

    <div class="nav-buttons" style="margin-top:18px; display:flex; flex-direction:column; gap:10px;">
      <button class="next-btn" onclick="shareWhatsApp()">📲 Condividi su WhatsApp</button>
      <button class="next-btn" onclick="shareInstagram()">📸 Condividi su Instagram</button>
      <button class="back-btn" onclick="showSizeScreen()">➕ Crea un'altra</button>
    </div>
  `;

  updateRiepilogo();
}
function shareWhatsApp(){
  const text = `COPPA ${coppaSelezionata}\nGusti: ${safeJoin(scelti.gusti)}\nGranelle: ${safeJoin(scelti.granelle)}\nTopping: ${safeJoin(scelti.topping)}\nIngredienti: ${safeJoin(scelti.ingredienti)}\nExtra: ${safeJoin(scelti.extra)}`;
  window.open("https://wa.me/?text=" + encodeURIComponent(text));
}

function shareInstagram(){
  salvaScontrinoComeImmagine();
}
function salvaScontrinoComeImmagine() {
  const scontrino = document.querySelector(".scontrino");
  if(!scontrino) return;

  html2canvas(scontrino, { scale: 3 }).then(canvas => {
    canvas.toBlob(blob => {
      const file = new File([blob], "coppa.png", { type: "image/png" });

      // WhatsApp / Instagram share (se supportato)
      if(navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: "La mia coppa gelato 🍨",
          text: "Guarda la mia coppa personalizzata!"
        });
      } else {
        // Download fallback (se share non supportato)
        const link = document.createElement("a");
        link.download = "coppa.png";
        link.href = canvas.toDataURL();
        link.click();
      }
    });
  });
}