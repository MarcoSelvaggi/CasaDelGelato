console.log("JS CARICATO ✔️");
// ---------------- STATO ----------------
let coppaSelezionata = "";
let titoloGustiVisibile = true;
let scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };
let max = { gusti:0, granelle:0, topping:0, ingredienti:0, extra:0 };
let step = "size"; // iniziamo sulla scelta formato
// === SISTEMA QUANTITÀ GUSTI ===
let gustiQuantities = {};      // es: { VANIGLIA: 2, FRAGOLA: 1 }
let gustoInModifica = null;    // es: "VANIGLIA" (quello giallo attualmente in modifica)
let collapseTimer = null
// ---------------- LISTE ----------------
const gustiList = [
  "VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
  "MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
  "STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ",
  "TIRAMISÙ","CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES",
  "CREMA ANDALUSA","CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT",
  "VARIEGATO FICHI NOCI MIELE"
]

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
function showIsland(step, nomeSelezionato) {

  const island = byId("dynamic-island");
  const title = byId("island-title");
  const added = byId("island-added");
  const bar = byId("island-bar");

  // Titolo es: "Gusti (1/2)"
  if (title) {
    title.textContent = `${step.charAt(0).toUpperCase() + step.slice(1)} (${scelti[step].length}/${max[step]})`;
  }

  // Elemento aggiunto
  if (added) {
    added.textContent = nomeSelezionato;
  }

  // Barra avanzamento totale
  const extraUnlimited = (max.extra === Infinity);
  const totSlots = (
    max.gusti +
    max.granelle +
    max.topping +
    max.ingredienti +
    (extraUnlimited ? 0 : max.extra)
  );

  const done = (
    scelti.gusti.length +
    scelti.granelle.length +
    scelti.topping.length +
    scelti.ingredienti.length +
    (extraUnlimited ? 0 : scelti.extra.length)
  );

  const pct = totSlots ? Math.round(done / totSlots * 100) : 0;

  if (bar) bar.style.width = pct + "%";

  // Mostra
  island.classList.add("show");
  clearTimeout(island._hideTO);
  island._hideTO = setTimeout(() => island.classList.remove("show"), 1400);
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
  // Mostra il mini riepilogo solo dopo la selezione del formato
document.getElementById("riepilogo-mini").style.display = "block";
document.body.classList.remove("step-size");
  document.querySelector("header").style.display = "none";
  coppaSelezionata = size;
  titoloGustiVisibile = true;   // 🔁 ogni nuova coppa fa riapparire i titoli
  max = { gusti:g, granelle:gr, topping:t, ingredienti:ing, extra:Infinity };
  scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };

  // === 🔥 STEP 2: inizializza quantità gusti ===
  gustiQuantities = {};
gustiList.forEach(gusto => gustiQuantities[gusto] = 0);
  gustoInModifica = null;
  // ==============================================

  step = "gusti";
  byId("step-size").style.display = "none";
  byId("step-container").style.display = "block";

  renderStepGusti();
  updateRiepilogo();   // <-- crea dataset.full e dataset.mini

  // --- 🔥 SOLO DOPO updateRiepilogo() È SICURO ---
  const el = document.getElementById("riepilogo-mini");

  // Se il dataset è stato creato → inizializza il mini-riepilogo
  if (el && el.dataset && typeof el.dataset.mini !== "undefined") {
      el.classList.add("collapsed");
      el.innerHTML = el.dataset.mini;
  }
}

// === Quando clicco un gusto lo metto "in modifica" (giallo) ===
function selectGusto(nome) {
    if (!coppaSelezionata) return;

    const maxTot = max.gusti || 0;
    const qtyAttuale = gustiQuantities[nome] || 0;

    let totalePrima = Object.values(gustiQuantities).reduce((a,b)=>a+b,0);

    // ➤ Se gusto era 0 → diventa 1
    if (qtyAttuale === 0) {
hideStepTitle();
        // Limite raggiunto → errore
        if (totalePrima >= maxTot) {
            limitEffect("gusti", nome);
            return;
        }

        gustiQuantities[nome] = 1;
        rebuildSceltiGustiFromQuantities();

        // 🔥 NASCONDE IL TITOLO SOLO AL PRIMO GUSTO
        titoloGustiVisibile = false;
        hideStepTitle();

        showIsland("gusti", nome);

    } else {
        // gusto già esistente → solo feedback island
        showIsland("gusti", nome);
    }

    // Imposto gusto in modifica
    gustoInModifica = nome;

    // Ricalcolo totale dopo la modifica
    let totaleDopo = Object.values(gustiQuantities).reduce((a,b)=>a+b,0);

    // ✅ SE ORA HO RAGGIUNTO IL MASSIMO → APRO MINI RIEPILOGO
    if (totaleDopo === maxTot) {
        openMiniRiepilogoTemporaneo();
        gustoInModifica = null;
    }

    renderStepGusti();
    updateRiepilogo();
}


function updateStatusGusti() {
    const maxTot = max.gusti || 0;
    const totale = Object.values(gustiQuantities).reduce((a, b) => a + b, 0);

    // ✅ Se il totale dei gusti = massimo → tutto confermato (verde)
    if (totale >= maxTot) {
        gustoInModifica = null; // nessun gusto in giallo
        return;
    }

    // ❗ Se il gusto in modifica ha qty 0 → non deve più essere in modifica
    if (gustoInModifica && gustiQuantities[gustoInModifica] === 0) {
        gustoInModifica = null;
    }
}

// === RENDER GUSTI CON QUANTITÀ E BOTTONI + / − ===
function renderStepGusti() {
    const title = document.getElementById("step-title");

    // 🔥 Mostra il titolo solo se siamo all'inizio (nessun gusto selezionato)
    if (title) {
        if (titoloGustiVisibile) {
            title.textContent = "Gusti";
            title.style.display = "block";
        } else {
            title.style.display = "none";
        }
    }

    const cont = byId("step-container");
    if (!cont) return;

    const maxTot = max.gusti || 0;
    const totale = Object.values(gustiQuantities).reduce((a, b) => a + b, 0);

    updateStatusGusti();

    let html = `
        <div class="ingredienti-lista">
    `;

    gustiList.forEach(nome => {
        const qty = gustiQuantities[nome] || 0;
        const isEditing = (gustoInModifica === nome);
        const isConfirmed = qty > 0 && !isEditing;
        const showControls = isEditing || qty > 0;

        let cls = "item gusto-item";
        if (isEditing) cls += " gusto-pending";
        else if (isConfirmed) cls += " gusto-confirmed";

        html += `
            <div class="${cls}" onclick="selectGusto('${nome}')">
                <span class="gusto-name">${escapeHtml(nome)}</span>

                ${showControls ? `
                <div class="gusto-controls" onclick="event.stopPropagation()">
                    <button class="gusto-btn minus" onclick="changeGustoQty('${nome}', -1)">−</button>
                    <span class="gusto-qty">${qty}</span>
                    <button class="gusto-btn plus" onclick="changeGustoQty('${nome}', +1)">+</button>
                </div>
                ` : ""}
            </div>
        `;
    });

    html += `
        </div>

        <div class="nav-buttons">
            <button class="back-btn" onclick="prevStep()">⬅ Indietro</button>
            <button class="next-btn" onclick="nextStep()">Avanti ➜</button>
        </div>
    `;

    cont.innerHTML = html;

    setTimeout(() => {
        stabilizeMiniRiepilogo();
    }, 10);
}

function hideStepTitle() {
    const title = document.getElementById("step-title");
    if (title) {
        title.style.display = "none";
    }
}

function openMiniRiepilogoTemporaneo() {
    const el = document.getElementById("riepilogo-mini");
    if (!el) return;

    // Aspetta 1 frame prima di aprire → dataset.full sarà già aggiornato
    requestAnimationFrame(() => {

        el.innerHTML = el.dataset.full || "";
        el.classList.remove("collapsed");
        el.classList.add("open");

        // effetto shake
        el.classList.remove("shake");
        void el.offsetWidth;
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 300);

        // chiudi dopo 2 secondi
        if (collapseTimer) clearTimeout(collapseTimer);
        collapseTimer = setTimeout(() => {
            el.classList.add("collapsed");
            el.classList.remove("open");
            el.innerHTML = el.dataset.mini || "";
        }, 2000);
    });
}


// === AGGIUNTA / RIMOZIONE QUANTITÀ GUSTO ===
function changeGustoQty(nome, delta) {
    const maxTot = max.gusti || 0;
    const corrente = gustiQuantities[nome] || 0;

    let nuovo = corrente + delta;
    if (nuovo < 0) nuovo = 0;

    // Totale attuale
    const totaleCorrente = Object.values(gustiQuantities).reduce((a,b)=>a+b,0);
    const totaleDopo = totaleCorrente - corrente + nuovo;

    // ❌ Supera limite → effetto rosso + blink del +
    if (totaleDopo > maxTot) {
        limitEffect("gusti", nome);

        const btn = document.querySelector(`button.plus[onclick*="${nome}"]`);
        if (btn) {
            btn.classList.add("limit-blink");
            setTimeout(()=> btn.classList.remove("limit-blink"), 650);
        }
        return;
    }

    // Aggiorno quantità
    gustiQuantities[nome] = nuovo;

    // Ricostruisco array gusti
    rebuildSceltiGustiFromQuantities();

    // Aggiorno colori (giallo/verde)
    updateStatusGusti();

    // 🔥 MOSTRARLO SEMPRE IN DYNAMIC ISLAND
    // - Se aggiungo → mostra nome
    // - Se diminuisco → mostra nome
    // - Se arrivo a 0 → mostra nome del gusto coinvolto
    showIsland("gusti", nome);

    // Aggiorna mini riepilogo
    updateRiepilogo();

    // 👉 Se raggiungo il massimo → apri mini riepilogo
    if (totaleDopo === maxTot) {
        openMiniRiepilogoTemporaneo();
        gustoInModifica = null;
    }

    renderStepGusti();
}

function rebuildSceltiGustiFromQuantities() {
    scelti.gusti = [];

    Object.entries(gustiQuantities).forEach(([nome, qty]) => {
        for (let i = 0; i < qty; i++) {
            scelti.gusti.push(nome);
        }
    });
}

// ---------------- RENDER ----------------
function render(){
  const area = byId("step-container");

  // 🔥 GUSTI hanno un renderer speciale
  if (step === "gusti") {
    renderStepGusti();
    return;
  }

  // ---------------- LISTA PER GLI ALTRI STEP ----------------
  let lista = [];
  if (step === "granelle")      lista = granelleList;
  else if (step === "topping")  lista = toppingList;
  else if (step === "ingredienti") lista = ingredientiList;
  else if (step === "extra") {
    lista = extraList.map(e => 
      e + (prezziExtra[e] ? ` (+€${prezziExtra[e].toFixed(2)})` : "")
    );
  }

  // ---------------- TITOLO STEP (GRAZIE A titoloGustiVisibile) ----------------
  const title = document.getElementById("step-title");
  if (title) {
    if (step === "granelle")      title.textContent = "Granelle";
    else if (step === "topping")  title.textContent = "Topping";
    else if (step === "ingredienti") title.textContent = "Ingredienti";
    else if (step === "extra")    title.textContent = "Extra";

    // 👇 se abbiamo già iniziato a scegliere qualcosa → il titolo sparisce
    title.style.display = titoloGustiVisibile ? "block" : "none";
  }

  // ---------------- CONTENUTO LISTA + BOTTONI ----------------
  area.innerHTML = `
    <h2 style="display:none"></h2>
    <div class="ingredienti-lista">
      ${
        lista.map(it=>{
          const nome = it.split(" (+€")[0].trim();
          const sel = scelti[step].includes(nome) ? "selected" : "";
          return `<div class="item ${sel}" onclick="toggle('${step}', '${escForOnclick(nome)}', this)">${it}</div>`;
        }).join("")
      }
    </div>
    <div class="nav-buttons">
      <button class="back-btn" onclick="prevStep()">⬅ Indietro</button>
      <button class="next-btn" onclick="nextStep()">
        ${step==="extra" ? "Conferma ✅" : "Avanti ➜"}
      </button>
    </div>
  `;
}

// ---------------- TOGGLE ----------------
function limitEffect(step, nome){
  document.querySelectorAll(".item").forEach(el=>{
    if(el.textContent.trim().startsWith(nome)){
      el.classList.add("limit-reached");
      setTimeout(()=>el.classList.remove("limit-reached"),1500);
    }
  });

  // Dynamic island: messaggio di errore sullo step giusto
  showIsland(step, "Limite raggiunto ❗");
}

function toggle(step, nome, el) {
hideStepTitle();
    const container = document.getElementById("riepilogo-mini");

    // ---------------- EXTRA ----------------
    if (step === "extra") {
        if (scelti.extra.includes(nome)) {
            scelti.extra = scelti.extra.filter(x => x !== nome);
        } else {
            scelti.extra.push(nome);
        }

        showIsland(step, nome);
        render();
        updateRiepilogo();
        stabilizeMiniRiepilogo();

        // shake mini riepilogo (MA NON APRIRLO MAI negli extra)
        container.classList.remove("shake");
        void container.offsetWidth;
        container.classList.add("shake");
        setTimeout(() => container.classList.remove("shake"), 350);

        return;
    }

    // ---------------- TOGGLE NORMALI ----------------
    if (scelti[step].includes(nome)) {
        scelti[step] = scelti[step].filter(x => x !== nome);
    } else {
        if (scelti[step].length >= max[step]) {
            // limite raggiunto
            limitEffect(step, nome);
            return;
        }
        scelti[step].push(nome);
    }
    // 🔥 Nascondi il titolo quando l’utente seleziona la prima volta
titoloGustiVisibile = false;
hideStepTitle();

    showIsland(step, nome);
    render();
    updateRiepilogo();
    stabilizeMiniRiepilogo();

    const currentCount = scelti[step].length;
    const maxCount = max[step];

    // 🎯 RAGGIUNTO IL MASSIMO → APRI MINI-RIEPILOGO PER 2 SECONDI
    if (maxCount && currentCount === maxCount) {

        // funzione universale
        openMiniRiepilogoTemporaneo();

        return;
    }

    // 🎯 NON ancora al massimo → resta chiuso ma fai shake
    container.classList.remove("open");
    container.classList.add("collapsed");
    container.innerHTML = container.dataset.mini || "";

    container.classList.remove("shake");
    void container.offsetWidth;
    container.classList.add("shake");
    setTimeout(() => container.classList.remove("shake"), 350);
}
// ---------------- NAV ----------------
function nextStep() {

  // ➤ Quando premi "Conferma" nello step EXTRA:
  if (step === "extra") {

    step = "riepilogo-mini-open";

    const el = document.getElementById("riepilogo-mini");
    el.classList.remove("collapsed");
    el.innerHTML = el.dataset.full || "";

    if (collapseTimer) clearTimeout(collapseTimer);
    collapseTimer = null;

    return;
  }

  // ➤ Passaggi normali
  if(step==="gusti") step="granelle";
  else if(step==="granelle") step="topping";
  else if(step==="topping") step="ingredienti";
  else if(step==="ingredienti") step="extra";
  else return mostraRiepilogo();

  // 🔥 FIX: ad ogni nuovo step, il titolo deve tornare visibile
  titoloGustiVisibile = true;

  render();
  updateRiepilogo();
}

function prevStep(){
  if(step === "gusti"){ 
    showSizeScreen(); 
    return; 
  }

  if(step === "granelle") step = "gusti";
  else if(step === "topping") step = "granelle";
  else if(step === "ingredienti") step = "topping";
  else if(step === "extra") step = "ingredienti";

  // 🔥 FIX: tornando indietro il titolo deve essere di nuovo visibile
  titoloGustiVisibile = true;

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
  if (!el) return;

  if (step === "size") {
      el.classList.add("hidden");
      el.innerHTML = "";
      el.dataset.full = "";
      el.dataset.mini = "";
      return;
  }

  // 🔥 RAGGRUPPA GUSTI COME "Vaniglia x2"
  function compressGusti(arr) {
      const counts = {};
      arr.forEach(g => counts[g] = (counts[g] || 0) + 1);

      return Object.entries(counts)
        .map(([name,qty]) => qty>1 ? `${name} x${qty}` : name);
  }

  const gustiCompatti = compressGusti(scelti.gusti);

  const riga = (label, arr) => {
    if (!arr || arr.length===0) return "";
    return `
      <div class="riepilogo-line">
        <b>${label}</b>
        ${arr.map(v=>`<div class="line-value">- ${v}</div>`).join("")}
      </div>`;
  };

  let ready = false;
  if(step==="gusti") ready = scelti.gusti.length === max.gusti;
  if(step==="granelle") ready = scelti.granelle.length === max.granelle;
  if(step==="topping") ready = scelti.topping.length === max.topping;
  if(step==="ingredienti") ready = scelti.ingredienti.length === max.ingredienti;
  if(step==="extra") ready = true;

  const btnHtml = ready ? `<button class="quick-next-inside" onclick="nextStep()">Avanti ➜</button>` : "";

  const fullHtml = `
    <div class="riepilogo-titolo">🍨 ${coppaSelezionata}</div>
    ${riga("Gusti", gustiCompatti)}
    ${riga("Granelle", scelti.granelle)}
    ${riga("Topping", scelti.topping)}
    ${riga("Ingredienti", scelti.ingredienti)}
    ${riga("Extra", scelti.extra)}
    ${btnHtml}
  `;

  const miniHtml = `🍨 ${coppaSelezionata}`;

  el.dataset.full = fullHtml;
  el.dataset.mini = miniHtml;

  // Se NON devo aprirlo → pill chiusa
  if (!el.classList.contains("open")) {
      el.innerHTML = miniHtml;
      el.classList.add("collapsed");
  }
}

// ---------------- COLLASSO AUTOMATICO MINI-RIEPILOGO ----------------
function autoCollapseRiepilogo(){
  const el = document.getElementById("riepilogo-mini");
  if(!el) return;

  // 🔥 se siamo dopo "Conferma" non collassa mai
  if (step === "riepilogo-mini-open") return;

  if(el.classList.contains("collapsed")) return;

  if(collapseTimer) clearTimeout(collapseTimer);

  collapseTimer = setTimeout(() => {
    el.classList.add("collapsed");
    el.innerHTML = el.dataset.mini || "";
  }, 2000);
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

function formatGustiQuantities() {
    const grouped = {};

    Object.entries(gustiQuantities).forEach(([nome, qty]) => {
        if (qty > 0) grouped[nome] = qty;
    });

    return Object.entries(grouped)
        .map(([nome, qty]) => `${nome} x${qty}`)
        .join(", ");
}

// ⬇️ SOSTITUISCI TUTTA LA TUA FUNZIONE CON QUESTA ⬇️
async function mostraRiepilogo(){
  step = "riepilogo";
  const area = byId("step-container");

  // ✅ 1) Calcolo il prezzo SUBITO
  const prezzoBase = prezziBase[coppaSelezionata] || 0;
  const prezzoExtraDettaglio = scelti.extra.map(e => ({
    nome: e,
    prezzo: prezziExtra[e] || 0
  }));
  const sommaExtra = prezzoExtraDettaglio.reduce((t,x)=> t + x.prezzo, 0);
  const totale = prezzoBase + sommaExtra;

  // ✅ 2) Oggetto coppa da salvare
  const email = localStorage.getItem("user_email") || null;
  const coppa = {
      email: email,
      data: new Date().toISOString(),   // combacia con column "data" (timestamp)
      formato: coppaSelezionata,
      gusti: scelti.gusti,
      granelle: scelti.granelle,
      topping: scelti.topping,
      ingredienti: scelti.ingredienti,
      extra: scelti.extra,
      prezzo: totale
  };

  // ✅ 3) Salva su Supabase
  try {
      const res = await salvaCoppaSupabase(coppa);

      if (!res.success) {
          console.error("Errore Supabase:", res.error);
          alert("⚠️ Coppa NON salvata su Supabase");
      } else {
          console.log("Coppa salvata correttamente su Supabase!");
      }
  } catch (err) {
      console.error("Errore inatteso Supabase:", err);
  }

  // ✅ 4) Continua a salvare in locale (cronologia)
  let arr = JSON.parse(localStorage.getItem("cronologiaCoppe") || "[]");
  arr.unshift(coppa);
  localStorage.setItem("cronologiaCoppe", JSON.stringify(arr));

  // ✅ 5) Riepilogo grafico (uguale a prima)
  area.innerHTML = `
    <h2>Riepilogo finale</h2>

    <div class="scontrino" id="scontrino-da-share">
      <p><b>Formato:</b> ${coppaSelezionata} — €${prezzoBase.toFixed(2)}</p>
      <!-- GUSTI RAGGRUPPATI -->
      <p><b>Gusti:</b><br>
      ${(() => {
          const grouped = {};
          Object.entries(gustiQuantities).forEach(([nome, qty]) => {
              if (qty > 0) grouped[nome] = qty;
          });

          if (Object.keys(grouped).length === 0) return "-";

          return Object.entries(grouped)
            .map(([nome, qty]) => {
              if (qty === 1) return `- ${nome}`;
              return `- ${nome} x${qty}`;
            })
            .join("<br>");
      })()}
      </p>
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
      <button class="next-btn" onclick="apriRegistrazione()">🧑‍💻 Registrati</button>
    </div>

    <p style="font-size:12px; text-align:center; opacity:0.7; margin-top:4px;">
      Dopo aver salvato l'immagine puoi pubblicarla nelle Storie su Instagram 📲
      @casadelgelato.it
    </p>
  `;

  // 🔒 Chiudi SEMPRE il mini-riepilogo nel riepilogo finale
  const mini = document.getElementById("riepilogo-mini");
  if (mini) {
    mini.classList.add("collapsed");
    mini.classList.remove("open");
    mini.innerHTML = mini.dataset.mini || "";
  }
  updateRiepilogo();
}


async function inviaRegistrazione() {
    const email = document.getElementById("reg-email").value.trim();
    if (!email) {
        alert("Inserisci una email valida.");
        return;
    }

    // 🔥 Recupero lingua attuale della web app
    const currentLang = localStorage.getItem("lang") || "it";

    try {
        await auth.sendSignInLinkToEmail(email, {
            url: `https://marcoselvaggi.github.io/casadel-gelato/?login=ok&lang=${currentLang}`,
            handleCodeInApp: true
        });

        // Salvo email in localStorage per completare il login
        window.localStorage.setItem("emailForSignIn", email);

        alert("📧 Controlla la tua casella email!\nTi abbiamo inviato un link per completare la registrazione.");
        
    } catch (err) {
        console.error(err);
        alert("Errore durante l'invio della mail: " + err.message);
    }
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
function stabilizeMiniRiepilogo() {
  const el = document.getElementById("riepilogo-mini");
  if (!el) return;

  el.style.display = "inline-block";
  el.style.boxSizing = "border-box";

  // di base: pill piccola ma leggibile
  el.style.minWidth = "130px";
  el.style.maxWidth = "240px";

  // 🔥 per lo step GUSTI, quando è aperto, non farlo collassare
  if (step === "gusti" && el.classList.contains("open")) {
      el.style.minWidth = "180px";
      el.style.maxWidth = "260px";
  }
}
// ⬇️ FINE FILE — METTILO QUI ⬇️

document.addEventListener("DOMContentLoaded", () => {
  const riepilogo = document.getElementById("riepilogo-mini");

  // se l'elemento NON esiste → NON fare nulla
  if (!riepilogo) return;

  riepilogo.addEventListener("click", function(e){
    if (e.target.classList.contains("quick-next-inside")) return;

    if (this.classList.contains("collapsed")) {
      this.classList.remove("collapsed");
      this.classList.add("open");
      this.innerHTML = this.dataset.full || "";
      if (collapseTimer) clearTimeout(collapseTimer);
      autoCollapseRiepilogo();
    } else {
      this.classList.add("collapsed");
      this.classList.remove("open");
      this.innerHTML = this.dataset.mini || "";
      if(collapseTimer) {
        clearTimeout(collapseTimer);
        collapseTimer = null;
      }
    }
  });
});

// ================== CARICA COPPA DA CRONOLOGIA ==================
document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem("coppaDaUsare");
    if (!stored) return;

    let c;
    try {
        c = JSON.parse(stored);
    } catch (e) {
        console.error("Errore parsing coppaDaUsare", e);
        localStorage.removeItem("coppaDaUsare");
        return;
    }

    // una volta letta, la elimino
    localStorage.removeItem("coppaDaUsare");

    // In base al formato, simulo la scelta formato
    if (c.formato === "PICCOLA") {
        selectSize("PICCOLA", 2, 1, 1, 1);
    } else if (c.formato === "MEDIA") {
        selectSize("MEDIA", 3, 2, 2, 1);
    } else if (c.formato === "GRANDE") {
        selectSize("GRANDE", 4, 2, 2, 2);
    } else {
        // formato sconosciuto → fallback PICCOLA
        selectSize(c.formato || "PICCOLA", 2,1,1,1);
    }

    // Ora riempiamo i dati salvati

    // GUSTI: ricostruisco gustiQuantities
    if (Array.isArray(c.gusti)) {
        // azzero
        gustiQuantities = {};
        gustiList.forEach(g => gustiQuantities[g] = 0);

        c.gusti.forEach(g => {
            if (g in gustiQuantities) {
                gustiQuantities[g] += 1;
            }
        });

        rebuildSceltiGustiFromQuantities();
    }

    // Altri step (array semplici)
    scelti.granelle     = Array.isArray(c.granelle)     ? [...c.granelle]     : [];
    scelti.topping      = Array.isArray(c.topping)      ? [...c.topping]      : [];
    scelti.ingredienti  = Array.isArray(c.ingredienti)  ? [...c.ingredienti]  : [];
    scelti.extra        = Array.isArray(c.extra)        ? [...c.extra]        : [];

    // Aggiorna stato gusti (giallo/verde)
    updateStatusGusti();

    // Mostra lo step gusti già compilato
    step = "gusti";
    renderStepGusti();
    updateRiepilogo();
});
