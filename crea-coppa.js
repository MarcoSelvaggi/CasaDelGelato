// ======================= LISTE =======================
const gusti = [
"VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
"MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
"STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ","TIRAMISÙ",
"CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES","CREMA ANDALUSA",
"CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT","VARIEGATO FICHI NOCI MIELE"
];

const granelle = [
"NOCCIOLA","CROCCANTE","PISTACCHIO","SCAGLIETTE AL CIOCCOLATO",
"ZUCCHERINI COLORATI","SMARTIES","COCCO RAPE’"
];

const topping = [
"ANANAS","ARANCIA","FRAGOLA","FRUTTI DI BOSCO","KIWI","MELONE","MENTA",
"CARAMELLO","MALAGA","CIOCCOLATO","NOCCIOLA","PISTACCHIO","LIQUORE AMARETTO",
"LIQUORE CAFFÈ","LIQUORE AL COCCO","SCIROPPO AMARENA","JOGURT NATURALE","VOV",
"CAFFÈ ESPRESSO","CAFFÈ DECA","ORZO","GINSENG","CAFFÈ FREDDO","CIOCCOLATO FREDDO",
"DISARONNO","BAYLES","COINTREAU","GRAND MARNIER","JACK DANIEL’S","LIMONCELLO",
"RUM","STRAVECCHIO","VECCHIA","VODKA"
];

const ingredienti = [
"AMARENE (4pz)","MACEDONIA","ANGURIA","ANANAS","BANANA","FRAGOLE","KIWI","MELONE",
"MIX BOSCO","PESCA","UVA","FRUTTI DI BOSCO","AMARETTI","MANDORLE","NOCCIOLINE",
"NOCI","UVETTA","MIKADO","AFTER EIGHT","BOUNTY","KITKAT","DUPLO","CIOCCOLATINI"
];
const prezzi = {
  PICCOLA: 3.50,
  MEDIA: 4.50,
  GRANDE: 5.50,
  ingredientiExtra: 0.50 // prezzo per ogni extra oltre quelli inclusi
};
// ======================= LOGICA =======================
let step = 0;
let max = {};
let scelta = { formato:"", gusti:[], granelle:[], topping:[], ingredienti:[] };

// BARRA PROGRESSO
function updateProgress() {
    const steps = document.querySelectorAll("#step-progress span");
    steps.forEach(s => {
        const n = parseInt(s.dataset.step);
        s.classList.remove("active","done");
        if (n < step) s.classList.add("done");
        if (n === step) s.classList.add("active");
    });
}

function selectSize(nome, g, gra, top, ing) {
    scelta.formato = nome;
    max = { gusti:g, granelle:gra, topping:top, ingredienti:ing };
    step = 1;
    document.getElementById("step-size").style.display = "none";
    showStep();
    updateProgress();
}

function toggle(tipo, item) {
    let arr = scelta[tipo];
    let alertBox = document.getElementById("alert");
    const elemento = [...document.querySelectorAll(".option")]
        .find(e => e.textContent.trim() === item);

    if (arr.includes(item)) {
        scelta[tipo] = arr.filter(x => x !== item);
        elemento.classList.remove("selected","error");
        alertBox.textContent = "";
    } else {
        if (arr.length >= max[tipo]) {
            elemento.classList.add("error");
            alertBox.textContent = `Limite ${tipo} raggiunto`;
            return;
        }
        arr.push(item);
        elemento.classList.add("selected");
        elemento.classList.remove("error");
        alertBox.textContent = "";
    }
    showStep();
}

function nextStep(){
  if(step < 5) step++;
  showStep();
}
function prevStep(){ if(step>1) step--; showStep(); }

function showStep() {
    updateProgress();

    const container = document.getElementById("step-container");
    container.innerHTML = "";

    const lists = [
        ["Scegli i Gusti", gusti, "gusti"],
        ["Scegli le Granelle", granelle, "granelle"],
        ["Scegli i Topping", topping, "topping"],
        ["Scegli Ingredienti Extra", ingredienti, "ingredienti"]
    ];

    // STEP 1-4 (selezioni)
    if(step <= 4){
        const [titolo, elenco, tipo] = lists[step-1];
        container.innerHTML = `<h2>${titolo}</h2><div id="alert"></div>`;

        elenco.forEach(item => {
            let div = document.createElement("div");
            div.className = "menu-item option";
            if(scelta[tipo].includes(item)) div.classList.add("selected");
            div.textContent = item;
            div.onclick = () => toggle(tipo,item);
            container.appendChild(div);
        });

        const btnNext = document.createElement("a");
        btnNext.className = "btn";
        btnNext.textContent = "Avanti";
        btnNext.onclick = nextStep;
        container.appendChild(btnNext);

        const btnBack = document.createElement("a");
        btnBack.className = "btn btn-back";
        btnBack.textContent = "Indietro";
        btnBack.onclick = prevStep;
        container.appendChild(btnBack);

        return;
    }

    // STEP 5 → RIEPILOGO
    let totale = prezzi[scelta.formato];
    let extraInclusi = max.ingredienti;
    let extraAggiunti = scelta.ingredienti.length - extraInclusi;
    if(extraAggiunti > 0){
        totale += extraAggiunti * prezzi.ingredientiExtra;
    }

    container.innerHTML = `
    <h2>Riepilogo</h2>
    <p><strong>Formato:</strong> ${scelta.formato}</p>
    <p><strong>Gusti:</strong> ${scelta.gusti.join(", ")}</p>
    <p><strong>Granelle:</strong> ${scelta.granelle.join(", ")}</p>
    <p><strong>Topping:</strong> ${scelta.topping.join(", ")}</p>
    <p><strong>Extra:</strong> ${scelta.ingredienti.join(", ")}</p>

    <h3>Totale: € ${totale.toFixed(2)}</h3>

    <a class="btn" onclick="stampaScontrino()">Stampa Scontrino</a>
    <a class="btn btn-back" href="index.html">Torna alla Home</a>`;
}
function stampaScontrino(){
    window.print();
}
// Chiude popup
function closePopup(){
  document.getElementById("promo-popup").style.display = "none";
}

// Vai direttamente alla sezione Crea Coppa
function vaiACreaCoppa(){
  document.getElementById("promo-popup").style.display = "none";
  document.getElementById("step-size").scrollIntoView({ behavior: "smooth" });
}