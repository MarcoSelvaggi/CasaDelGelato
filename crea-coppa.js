// crea-coppa.js — versione corretta e pronta da incollare
// Sovrascrivi il tuo crea-coppa.js con questo file.

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

const extraList = ["COCCO (4pz)","MIX KINDER","PANNA EXTRA"];

// ---------------- PREZZI ----------------
const prezziBase = { PICCOLA: 7.50, MEDIA: 9.00, GRANDE: 12.00 };
const prezziExtra = { "COCCO (4pz)": 0.50, "MIX KINDER": 2.50, "PANNA EXTRA": 1.80 };

// ---------------- UTIL ----------------
function byId(id){ return document.getElementById(id); }
function safeJoin(arr){ return (arr && arr.length) ? arr.join(", ") : "-"; }

// helper per evitare apici che rompono l'onclick inline
function escForOnclick(s){ return String(s).replace(/'/g, "\\'"); }

// ---------------- DYNAMIC ISLAND ----------------
function showIsland(text){
  const island = byId("dynamic-island");
  const label = island ? island.querySelector("#island-text") : null;
  const bar = island ? island.querySelector("#island-bar") : null;
  if(label) label.textContent = text;

  // Non contare gli extra illimitati nella percentuale
  const extraIsUnlimited = (max.extra === Infinity);
  const totSlots = (max.gusti||0) + (max.granelle||0) + (max.topping||0) + (max.ingredienti||0) + (extraIsUnlimited ? 0 : (max.extra||0));
  const done = (scelti.gusti.length || 0) + (scelti.granelle.length || 0) + (scelti.topping.length || 0) + (scelti.ingredienti.length || 0) + (extraIsUnlimited ? 0 : (scelti.extra.length || 0));
  const pct = totSlots ? Math.round((done / totSlots) * 100) : 0;
  if(bar) bar.style.width = pct + "%";

  if(island){
    island.classList.add("show");
    clearTimeout(island._hideTO);
    island._hideTO = setTimeout(()=> island.classList.remove("show"), 1400);
  }
}

// ---------------- UI: mostra scelta formato ----------------
function showSizeScreen(){
  step = "size";
  const sizeArea = byId("step-size");
  const container = byId("step-container");
  if(sizeArea) sizeArea.style.display = "block";
  if(container) { container.style.display = "none"; container.innerHTML = ""; }
  updateRiepilogo();
}

// ---------------- SELEZIONE FORMATO ----------------
function selectSize(size, g, gr, t, ing){
  coppaSelezionata = size;

  // EXTRA = illimitati (Infinity) — non contati nella percentuale
  max = { 
    gusti: g, 
    granelle: gr, 
    topping: t, 
    ingredienti: ing, 
    extra: Infinity 
  };

  scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };

  step = "gusti";

  const sizeEl = byId("step-size");
  const cont = byId("step-container");
  if(sizeEl) sizeEl.style.display = "none";
  if(cont) { cont.style.display = "block"; }

  render();
  updateRiepilogo();
}

// ---------------- RENDER (unico) ----------------
function render(){
  const area = byId("step-container");
  if(!area) return;

  // lista in base allo step
  let lista = [];
  if(step === "gusti") lista = gustiList;
  else if(step === "granelle") lista = granelleList;
  else if(step === "topping") lista = toppingList;
  else if(step === "ingredienti") lista = ingredientiList;
  else if(step === "extra") lista = extraList;

  const titolo = (step === "size") ? "Scegli il Formato" : step.toUpperCase();
  const maxStep = (max[step] === Infinity) ? "∞" : (max[step] || 0);
  const current = scelti[step] ? scelti[step].length : 0;

  // Costruisco HTML: lista + nav (back sempre presente; in gusti torna alla scelta formato)
  area.innerHTML = `
    <h2>${titolo} ${ (step !== "size" ? `(${current}/${maxStep})` : "") }</h2>

    <div class="ingredienti-lista">
      ${lista.map(it => {
        const sel = scelti[step] && scelti[step].includes(it) ? "selected" : "";
        // escape the string only for the onclick call
        const safe = escForOnclick(it);
        return `<div class="item ${sel}" onclick="toggle('${step}', '${safe}')">${it}</div>`;
      }).join("")}
    </div>

    <div class="nav-buttons">
      <button class="back-btn" onclick="prevStep()">⬅ Indietro</button>
      <button class="next-btn" onclick="nextStep()">${step === "extra" ? "Conferma ✅" : "Avanti ➜"}</button>
    </div>
  `;
}

// ---------------- TOGGLE SELEZIONE ----------------
function toggle(tipo, nomeRaw){
  const nome = String(nomeRaw).trim();
  if(!nome) return;

  if(!scelti[tipo]) scelti[tipo] = [];

  // se già selezionato → rimuovi
  if(scelti[tipo].includes(nome)){
    scelti[tipo] = scelti[tipo].filter(x => x !== nome);
    showIsland("Rimosso: " + nome);
    render();
    updateRiepilogo();
    return;
  }

  // ✅ SALTA LIMITI SE EXTRA
  if(tipo !== "extra"){
    const maxStep = max[tipo] || 0;
    if(scelti[tipo].length >= maxStep){
      showIsland(`❌ Limite massimo (${maxStep})`);
      return;
    }
  }

  // aggiungi elemento
  scelti[tipo].push(nome);
  showIsland("Aggiunto: " + nome);
  render();
  updateRiepilogo();
}

// trova elemento renderizzato (testo trimmed)
function findRenderedItem(nome){
  const nodes = Array.from(document.querySelectorAll(".item"));
  return nodes.find(n => n.textContent && n.textContent.trim() === nome) || null;
}

// ---------------- NAV: avanti/indietro ----------------
function nextStep(){
  if(step === "gusti") step = "granelle";
  else if(step === "granelle") step = "topping";
  else if(step === "topping") step = "ingredienti";
  else if(step === "ingredienti") step = "extra";
  else if(step === "extra") return mostraRiepilogo();
  render();
}
function prevStep(){
  // se siamo alla prima scelta (gusti) --> torna alla scelta formato
  if(step === "gusti"){
    showSizeScreen();
    return;
  }
  if(step === "granelle") step = "gusti";
  else if(step === "topping") step = "granelle";
  else if(step === "ingredienti") step = "topping";
  else if(step === "extra") step = "ingredienti";
  render();
}

// ---------------- RIEPILOGO FINALE ----------------
function mostraRiepilogo(){
  // calcolo prezzo (base + extra selezionati)
  let prezzo = prezziBase[coppaSelezionata] || 0;
  (scelti.extra || []).forEach(e => { prezzo += (prezziExtra[e] || 0); });

  const area = byId("step-container");
  if(!area) return;

  function bullets(arr){
    if(!arr || arr.length === 0) return "-";
    return arr.map(x => `• ${x}`).join("<br>");
  }

  area.innerHTML = `
    <div class="scontrino" style="max-width:520px;margin:0 auto;padding:18px;background:white;border-radius:12px;border:1px solid #eee;">
      <h2>🍨 COPPA ${coppaSelezionata}</h2>
      <hr>
      <div><b>GUSTI</b><br>${bullets(scelti.gusti)}</div><br>
      <div><b>GRANELLE</b><br>${bullets(scelti.granelle)}</div><br>
      <div><b>TOPPING</b><br>${bullets(scelti.topping)}</div><br>
      <div><b>INGREDIENTI</b><br>${bullets(scelti.ingredienti)}</div><br>
      <div><b>EXTRA</b><br>${(scelti.extra.length ? scelti.extra.map(x => `• ${x} (+€${(prezziExtra[x]||0).toFixed(2)})`).join("<br>") : "-")}</div>
      <hr>
      <h3 style="text-align:right;margin:8px 0 0;">TOTALE: € ${prezzo.toFixed(2)}</h3>
      <p style="text-align:center;color: #666;margin-top:6px;font-size:14px;">📣 Ora comunica questa coppa al cameriere</p>
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button class="btn" onclick="shareRiepilogo()">Condividi / Invia</button>
        <button style="background:#ddd;color:#111;border-radius:10px;padding:10px;border:none;flex:1" onclick="location.reload()">Crea un'altra</button>
      </div>
    </div>
  `;
  updateRiepilogo();
}

// ---------------- SHARE / COPIA ----------------
function shareRiepilogo(){
  const testo = `
COPPA ${coppaSelezionata}
Gusti: ${safeJoin(scelti.gusti)}
Granelle: ${safeJoin(scelti.granelle)}
Topping: ${safeJoin(scelti.topping)}
Ingredienti: ${safeJoin(scelti.ingredienti)}
Extra: ${safeJoin(scelti.extra)}
Prezzo: €${(prezziBase[coppaSelezionata] + (scelti.extra.reduce((s,e)=> s + (prezziExtra[e]||0),0))).toFixed(2)}
  `.trim();

  if(navigator.share){
    navigator.share({ title: `Coppa ${coppaSelezionata}`, text: testo }).catch(()=>{ copyToClipboard(testo); alert("Testo copiato negli appunti"); });
  } else {
    copyToClipboard(testo);
    alert("Testo copiato negli appunti. Incolla dove vuoi condividere.");
  }
}
function copyToClipboard(txt){
  try {
    navigator.clipboard.writeText(txt);
  } catch(e){
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

// ---------------- MINI-RIEPILOGO ----------------
function updateRiepilogo(){
  const el = byId("riepilogo-mini");
  if(!el) return;
  el.innerHTML = `
    <div style="font-weight:700">${coppaSelezionata || ''}</div>
    <div style="font-size:12px;color:#444;">
      G: ${safeJoin(scelti.gusti)}<br>
      Gr: ${safeJoin(scelti.granelle)}<br>
      T: ${safeJoin(scelti.topping)}
    </div>
  `;
}

// ---------------- AVVIO ----------------
window.addEventListener("load", ()=> {
  const container = byId("step-container");
  const sizeArea = byId("step-size");
  if(container) container.style.display = "none";
  if(sizeArea) sizeArea.style.display = "block";
  updateRiepilogo();
});