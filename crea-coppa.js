// ---------------- STATO ----------------
let coppaSelezionata = "";
let scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };
let max = { gusti:0, granelle:0, topping:0, ingredienti:0, extra:0 };
let step = "size"; // iniziamo sulla scelta formato
let collapseTimer = null
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
  // EXTRA: comportamento libero
  if(step === "extra"){
    if(scelti.extra.includes(nome)) scelti.extra = scelti.extra.filter(x => x !== nome);
    else scelti.extra.push(nome);

    showIsland(nome);
    render();
    updateRiepilogo();

    // espandi in modo robusto
    expandMiniRiepilogo();
    return;
  }

  // toggle normale
  if(scelti[step].includes(nome)){
    scelti[step] = scelti[step].filter(x => x !== nome);
  } else {
    if(scelti[step].length >= max[step]) return limitEffect(nome);
    scelti[step].push(nome);
  }

  showIsland(nome);
  render();
  updateRiepilogo();
  if (typeof updateQuickNext === "function") updateQuickNext();

  // espandi in modo robusto
  expandMiniRiepilogo();
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

  // se siamo nella schermata finale lo nascondiamo
  if(document.querySelector(".scontrino") || step === "riepilogo"){
    el.classList.add("hidden");
    return;
  }

  // calcola se mostrare "Avanti"
  let ready = false;
  if(step === "gusti") ready = scelti.gusti.length === max.gusti;
  if(step === "granelle") ready = scelti.granelle.length === max.granelle;
  if(step === "topping") ready = scelti.topping.length === max.topping;
  if(step === "ingredienti") ready = scelti.ingredienti.length === max.ingredienti;
  if(step === "extra") ready = true;

  const titolo = coppaSelezionata
    ? `<div class="riepilogo-titolo">🍨 ${escapeHtml(coppaSelezionata)}</div>`
    : `<div class="riepilogo-titolo" style="opacity:.6">Scegli il formato</div>`;

  const riga = (label, arr) => {
    const val = (arr && arr.length) ? escapeHtml(safeJoin(arr)) : "-";
    return `<div class="riepilogo-line"><b>${escapeHtml(label)}</b>${val}</div>`;
  };

  const btnHtml = ready ? `<button class="quick-next-inside" onclick="nextStep()">Avanti ➜</button>` : "";

  // creiamo la versione FULL ma non la forziamo sempre nell'innerHTML (vedi dopo)
  const fullHtml = `
    ${titolo}
    ${riga("G", scelti.gusti)}
    ${riga("Gr", scelti.granelle)}
    ${riga("T", scelti.topping)}
    ${riga("Ing", scelti.ingredienti)}
    ${riga("Extra", scelti.extra)}
    ${btnHtml}
  `;

  // MINI (pill) — solo il formato
  const miniHtml = `🍨 ${escapeHtml(coppaSelezionata || "")}`;

  // SALVIAMO le versioni su data-*, così expand/collapse usano sempre lo stesso contenuto
  el.dataset.full = fullHtml;
  el.dataset.mini = miniHtml;

  // se attualmente è espanso, mostriamo il full, altrimenti mostriamo miniHtml
  if(el.classList.contains("collapsed")){
    el.innerHTML = el.dataset.mini;
  } else {
    el.innerHTML = el.dataset.full;
  }

  // visibilità generale
  if(step === "size"){
    el.classList.add("hidden");
  } else {
    el.classList.remove("hidden");
  }
}
// ---------------- COLLASSO AUTOMATICO MINI-RIEPILOGO ----------------
function autoCollapseRiepilogo(){
  const el = document.getElementById("riepilogo-mini");
  if(!el) return;

  // se è già collapsed non schedulare nulla
  if(el.classList.contains("collapsed")) return;

  if(collapseTimer) clearTimeout(collapseTimer);

  // dopo 2 secondi (2000ms) riduciamo
  collapseTimer = setTimeout(() => {
    el.classList.add("collapsed");
    // mostra la mini pill (da dataset.mini)
    el.innerHTML = el.dataset.mini || "";
  }, 3000);
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

<div class="scontrino" id="scontrino-da-share">      <p><b>Formato:</b> ${coppaSelezionata} — €${prezzoBase.toFixed(2)}</p>
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
      <button class="next-btn" onclick="salvaScontrinoComeImmagine()">📸 Salva immagine (Instagram)</button>
      <button class="back-btn" onclick="showSizeScreen()">➕ Crea un'altra</button>
    </div>

    <p style="font-size:12px; text-align:center; opacity:0.7; margin-top:4px;">
      Dopo aver salvato l'immagine puoi pubblicarla nelle Storie su Instagram 📲
      @casadelgelato.it
    </p>
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
  if(!scontrino){
    alert("Errore: scontrino non trovato.");
    return;
  }

  html2canvas(scontrino, { scale: 3 }).then(canvas => {

    // ✅ Sempre salvataggio file, niente share API
    const link = document.createElement("a");
    link.download = "coppa.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    // ✅ Info utente
    alert("📸 Immagine salvata!\nOra puoi condividerla su Instagram.")
  }).catch(err => {
    console.error(err);
    alert("Errore durante la creazione dell'immagine.");
  });
}
function expandMiniRiepilogo(){
  const el = document.getElementById("riepilogo-mini");
  if(!el) return;

  // Mostra SEMPRE la versione completa
  el.innerHTML = el.dataset.full || "";
  el.classList.remove("collapsed");

  // Riavvia auto-collapse
  if(collapseTimer) clearTimeout(collapseTimer);
  autoCollapseRiepilogo();
}
// ⬇️ FINE FILE — METTILO QUI ⬇️

document.getElementById("riepilogo-mini").addEventListener("click", function(e){
  const el = this;

  if(e.target && e.target.classList && e.target.classList.contains("quick-next-inside")) {
    return;
  }

  if(el.classList.contains("collapsed")){
    el.classList.remove("collapsed");
    el.innerHTML = el.dataset.full || "";
    if(collapseTimer) clearTimeout(collapseTimer);
    autoCollapseRiepilogo();
  } else {
    el.classList.add("collapsed");
    el.innerHTML = el.dataset.mini || "";
    if(collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null; }
  }
});