/* crea-coppa.js - versione robusta */
let step = 0;

// ======================= LISTE =======================
const gusti = [ /* usa la tua lista completa */ 
"VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
"MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
"STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ","TIRAMISÙ",
"CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES","CREMA ANDALUSA",
"CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT","VARIEGATO FICHI NOCI MIELE"
];

const granelle = ["NOCCIOLA","CROCCANTE","PISTACCHIO","SCAGLIETTE AL CIOCCOLATO","ZUCCHERINI COLORATI","SMARTIES","COCCO RAPE’"];

const topping = ["ANANAS","ARANCIA","FRAGOLA","FRUTTI DI BOSCO","KIWI","MELONE","MENTA","CARAMELLO","MALAGA","CIOCCOLATO","NOCCIOLA","PISTACCHIO","LIQUORE AMARETTO","LIQUORE CAFFÈ","LIQUORE AL COCCO","SCIROPPO AMARENA","JOGURT NATURALE","VOV","CAFFÈ ESPRESSO","CAFFÈ DECA","ORZO","GINSENG","CAFFÈ FREDDO","CIOCCOLATO FREDDO","DISARONNO","BAYLES","COINTREAU","GRAND MARNIER","JACK DANIEL’S","LIMONCELLO","RUM","STRAVECCHIO","VECCHIA","VODKA"];

const ingredienti = ["AMARENE (4pz)","MACEDONIA","ANGURIA","ANANAS","BANANA","FRAGOLE","KIWI","MELONE","MIX BOSCO","PESCA","UVA","FRUTTI DI BOSCO","AMARETTI","MANDORLE","NOCCIOLINE","NOCI","UVETTA","MIKADO","AFTER EIGHT","BOUNTY","KITKAT","DUPLO","CIOCCOLATINI"];

const prezzi = { PICCOLA: 3.50, MEDIA: 4.50, GRANDE: 5.50, ingredientiExtra: 0.50 };

// ======================= STATO =======================
let max = {};
let scelta = { formato:"", gusti:[], granelle:[], topping:[], ingredienti:[] };

// ======================= UTILI =======================
function byId(id){ return document.getElementById(id); }

// BARRA AVANZAMENTO TOP (se esiste)
function updateProgress() {
    const steps = document.querySelectorAll("#step-progress span");
    if(!steps) return;
    steps.forEach(s => {
        const n = parseInt(s.dataset.step);
        s.classList.remove("active","done");
        if (n < step) s.classList.add("done");
        if (n === step) s.classList.add("active");
    });
}

// DYNAMIC ISLAND (semplice)
function showIsland(text){
    const label = byId("island-text");
    const bar = byId("island-bar");
    const island = byId("dynamic-island");
    if(!label || !island) return;

    let percent = 0;
    try {
      let done = (
        (max.gusti ? scelta.gusti.length / max.gusti : 0) +
        (max.granelle ? scelta.granelle.length / max.granelle : 0) +
        (max.topping ? scelta.topping.length / max.topping : 0) +
        (max.ingredienti ? scelta.ingredienti.length / max.ingredienti : 0)
      ) / 4;
      percent = Math.round(done * 100);
      if(isNaN(percent)) percent = 0;
    } catch(e){ percent = 0; }

    label.textContent = `${text} • ${percent}%`;
    if(bar) bar.style.width = percent + "%";

    island.classList.add("show");
    island.classList.remove("compact");
    setTimeout(()=> island.classList.add("compact"), 1200);
    setTimeout(()=> island.classList.remove("show","compact"), 2500);
}
function showIslandError(text){
    const label = byId("island-text");
    const island = byId("dynamic-island");
    if(!label || !island) return;
    label.textContent = text;
    label.classList.add("error");
    island.classList.add("show");
    setTimeout(()=> {
        label.classList.remove("error");
        island.classList.remove("show");
    }, 2000);
}

// ======================= SELEZIONE FORMATO =======================
function selectSize(nome, g, gra, top, ing) {
    scelta.formato = nome;
    max = { gusti: g, granelle: gra, topping: top, ingredienti: ing };
    step = 1;
    // mostra/nascondi contenitori
    const sizeEl = byId("step-size");
    const cont = byId("step-container");
    if(sizeEl) sizeEl.style.display = "none";
    if(cont) { cont.style.display = "block"; cont.scrollIntoView({behavior:"smooth"}); }
    showStep();
}

// ======================= TOGGLE (ORIGINALE MA ROBUSTO) =======================
function toggleSelection(tipo, valore, elemento) {
    // tipo: "gusti" ecc, valore = string, elemento = dom node
    const arr = scelta[tipo];

    // rimozione
    if (arr.includes(valore)) {
        scelta[tipo] = arr.filter(x => x !== valore);
        elemento.classList.remove("selected","error");
        showIsland(`Rimosso: ${valore}`);
        return;
    }

    // controllo limite
    if (arr.length >= (max[tipo] || 0)) {
        elemento.classList.add("error");
        showIslandError(`Limite ${tipo} raggiunto`);
        setTimeout(()=> elemento.classList.remove("error"), 900);
        return;
    }

    // aggiungi
    arr.push(valore);
    elemento.classList.add("selected");
    elemento.classList.remove("error");
    showIsland(`Aggiunto: ${valore}`);
}

// ======================= NAV E STEPS =======================
function nextStep(){ if(step < 5) step++; showStep(); }

function prevStep(){
    // se siamo in primo step e vogliamo tornare --> mostra prima schermata
    if(step === 1){
        step = 0;
        const sizeEl = byId("step-size");
        const cont = byId("step-container");
        if(sizeEl) sizeEl.style.display = "block";
        if(cont) cont.style.display = "none";
        // per sicurezza pulisco container
        if(cont) cont.innerHTML = "";
        return;
    }
    if(step > 1) step--;
    showStep();
}

// ======================= RENDER STEPS =======================
function showStep(){
    updateProgress();
    const container = byId("step-container");
    if(!container) return;
    container.style.display = "block";
    container.innerHTML = "";

    const lists = [
        ["Scegli i Gusti", gusti, "gusti"],
        ["Scegli le Granelle", granelle, "granelle"],
        ["Scegli i Topping", topping, "topping"],
        ["Scegli Ingredienti Extra", ingredienti, "ingredienti"]
    ];

    if(step <= 4){
        const [titolo, elenco, tipo] = lists[step-1];
        const h = document.createElement("h2"); h.textContent = titolo; container.appendChild(h);
        const alertDiv = document.createElement("div"); alertDiv.id = "alert"; container.appendChild(alertDiv);

        // container per lista (utile per delegation)
        const listWrap = document.createElement("div");
        listWrap.id = "list-wrap";
        container.appendChild(listWrap);

        elenco.forEach(item => {
            let div = document.createElement("div");
            div.className = "menu-item option";
            div.setAttribute("data-tipo", tipo);
            div.setAttribute("data-value", item);
            div.textContent = item;
            if(scelta[tipo] && scelta[tipo].includes(item)) div.classList.add("selected");
            listWrap.appendChild(div);
        });

        // bottoni
        const wrapperBtns = document.createElement("div");
        wrapperBtns.style.display = "flex";
        wrapperBtns.style.gap = "10px";
        wrapperBtns.style.marginTop = "12px";

        const btnNext = document.createElement("a");
        btnNext.className = "btn";
        btnNext.textContent = "Avanti";
        btnNext.onclick = nextStep;
        wrapperBtns.appendChild(btnNext);

        const btnBack = document.createElement("a");
        btnBack.className = "btn btn-back";
        btnBack.textContent = "← Indietro";
        btnBack.onclick = prevStep;
        wrapperBtns.appendChild(btnBack);

        container.appendChild(wrapperBtns);

        return;
    }

    // RIEPILOGO
    let totale = prezzi[scelta.formato] || 0;
    let extraAggiunti = Math.max(0, (scelta.ingredienti.length || 0) - (max.ingredienti || 0));
    if(extraAggiunti > 0) totale += extraAggiunti * prezzi.ingredientiExtra;

    container.innerHTML = `
      <h2>Riepilogo</h2>
      <p><strong>Formato:</strong> ${scelta.formato}</p>
      <p><strong>Gusti:</strong> ${scelta.gusti.join(", ")}</p>
      <p><strong>Granelle:</strong> ${scelta.granelle.join(", ")}</p>
      <p><strong>Topping:</strong> ${scelta.topping.join(", ")}</p>
      <p><strong>Extra:</strong> ${scelta.ingredienti.join(", ")}</p>
      <h3>Totale: € ${totale.toFixed(2)}</h3>
      <a class="btn" onclick="stampaScontrino()">Stampa Scontrino</a>
      <a class="btn btn-back" href="index.html">Home</a>
    `;
}

// ======================= EVENT DELEGATION: CLICK SU LISTA =======================
document.addEventListener("click", function(e){
    const el = e.target;
    // click su item della lista
    if(el.closest && el.closest(".menu-item.option")){
        const item = el.closest(".menu-item.option");
        const tipo = item.dataset.tipo;
        const value = item.dataset.value;
        if(tipo && value) {
            toggleSelection(tipo, value, item);
        }
    }
});

// ======================= UTILITÀ =======================
function stampaScontrino(){ window.print(); }

// assicurati che step-size sia visibile all'avvio
window.addEventListener("load", function(){
    const cont = byId("step-container");
    const sizeEl = byId("step-size");
    if(cont) cont.style.display = "none";
    if(sizeEl) sizeEl.style.display = "block";
});