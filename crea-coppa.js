console.log("JS CARICATO ✔️");
// ---------------- STATO ----------------
let coppaSelezionata = "";
let titoloGustiVisibile = true;
let scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };
let max = { gusti:0, granelle:0, topping:0, ingredienti:0, extra:0 };
let step = "size"; // iniziamo sulla scelta formato
let allergeniCliente = JSON.parse(
  localStorage.getItem("allergeni_cliente") || "[]"
);
// === SISTEMA QUANTITÀ GUSTI ===
let gustiQuantities = {};      // es: { VANIGLIA: 2, FRAGOLA: 1 }
let gustoInModifica = null;    // es: "VANIGLIA" (quello giallo attualmente in modifica)
let collapseTimer = null
let coppaSalvata = false;


// =======================
// DISPONIBILITÀ INGREDIENTI
// =======================

// Qui salveremo cosa è disponibile o terminato.
// Struttura prevista:
// DISPONIBILITA["Gusti"]["VANIGLIA"] = true / false
// DISPONIBILITA["Granelle"]["NOCCIOLA"] = true / false
let DISPONIBILITA = {};

// 🔗 MAPPA GUSTI → IMMAGINI (PROVVISORIA)
const MAP_GUSTI_IMG = {
  "VANIGLIA": "img/pallina-vaniglia.png",
  "FRAGOLA": "img/pallina-fragola.png"
};
const MAP_GRANELLE_IMG = {
  "NOCCIOLA": "img/granella-nocciola.png"
};
const MAP_TOPPING_IMG = {
  "FRUTTI DI BOSCO": "img/topping-bosco.png"
};
const MAP_INGREDIENTI_IMG = {
  "FRAGOLE": "img/fragola.png"
};

function aggiornaPallineRiepilogo() {
  const gusti = scelti.gusti || [];

  const boxPalline = document.querySelector(".box-palline");

  const leftImg  = document.getElementById("gusto-left-img");
  const rightImg = document.getElementById("gusto-right-img");
  const leftTxt  = document.getElementById("gusto-left-text");
  const rightTxt = document.getElementById("gusto-right-text");

  // 🍨 CASO: UN SOLO GUSTO → centra
  if (gusti.length === 1) {
    boxPalline.classList.add("single");
  } else {
    boxPalline.classList.remove("single");
  }

  // PALLINA SINISTRA
  if (gusti[0] && MAP_GUSTI_IMG[gusti[0]]) {
    leftImg.src = MAP_GUSTI_IMG[gusti[0]];
    leftImg.style.display = "block";
    leftTxt.textContent = gusti[0];
  } else {
    leftImg.style.display = "none";
    leftTxt.textContent = "";
  }

  // PALLINA DESTRA
  if (gusti[1] && MAP_GUSTI_IMG[gusti[1]]) {
    rightImg.src = MAP_GUSTI_IMG[gusti[1]];
    rightImg.style.display = "block";
    rightTxt.textContent = gusti[1];
  } else {
    rightImg.style.display = "none";
    rightTxt.textContent = "";
  }
}

function aggiornaPallineRiepilogoMedia() {
  if (coppaSelezionata !== "MEDIA") return;

  const gusti = scelti.gusti || [];
  const boxPalline = document.querySelector(".box-palline");

  if (!boxPalline) return;

  // ✅ 1 SOLO GUSTO → CENTRA
  if (gusti.length === 1) {
    boxPalline.classList.add("single");
  } else {
    boxPalline.classList.remove("single");
  }

  const map = [
    { img: "gusto-top-img",   txt: "gusto-top-text" },
    { img: "gusto-left-img",  txt: "gusto-left-text" },
    { img: "gusto-right-img", txt: "gusto-right-text" }
  ];

  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    const arrow = txt?.closest(".arrow");

    if (!img || !txt || !arrow) return;

    const nome = gusti[i];

    if (nome && MAP_GUSTI_IMG[nome]) {
      img.src = MAP_GUSTI_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";
    }
  });
}

function aggiornaPallineRiepilogoGrande() {
  if (coppaSelezionata !== "GRANDE") return;

  const gusti = scelti.gusti || [];

  const map = [
    { img: "gusto-top-img",    txt: "gusto-top-text" },
    { img: "gusto-left-img",   txt: "gusto-left-text" },
    { img: "gusto-right-img",  txt: "gusto-right-text" },
    { img: "gusto-bottom-img", txt: "gusto-bottom-text" }
  ];

  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    const arrow = txt?.closest(".arrow");

    if (!img || !txt || !arrow) return;

    const nome = gusti[i];

    if (nome && MAP_GUSTI_IMG[nome]) {
      img.src = MAP_GUSTI_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";   // ✅ mostra freccia
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";    // ❌ nasconde freccia
    }
  });
}

function aggiornaGranellaRiepilogo() {
  const img   = document.getElementById("granella-img");
  const txt   = document.getElementById("granella-text");
  const arrow = document.getElementById("granella-arrow");

  if (!img || !txt || !arrow) return;

  const granella = scelti.granelle?.[0]; // prima granella scelta

  if (granella && MAP_GRANELLE_IMG[granella]) {
    img.src = MAP_GRANELLE_IMG[granella];
    img.style.display = "block";
    txt.textContent = granella;
    arrow.style.display = "block";   // ✅ MOSTRA
  } else {
    img.style.display = "none";
    txt.textContent = "";
    arrow.style.display = "none";    // ❌ NASCONDE
  }
}

function aggiornaGranellaRiepilogoMedia() {
  if (coppaSelezionata !== "MEDIA") return;

  const granelle = scelti.granelle || [];

  const map = [
    { img: "granella-1-img", txt: "granella-1-text", arrow: "granella-1-arrow" },
    { img: "granella-2-img", txt: "granella-2-text", arrow: "granella-2-arrow" }
  ];

  map.forEach((slot, i) => {
    const img   = document.getElementById(slot.img);
    const txt   = document.getElementById(slot.txt);
    const arrow = document.getElementById(slot.arrow);

    if (!img || !txt || !arrow) return;

    const nome = granelle[i];

    if (nome && MAP_GRANELLE_IMG[nome]) {
      img.src = MAP_GRANELLE_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";   // ✅
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";    // ❌
    }
  });
}

function aggiornaGranellaRiepilogoGrande() {
  if (coppaSelezionata !== "GRANDE") return;

  const granelle = scelti.granelle || [];

  const map = [
    { img: "granella-1-img", txt: "granella-1-text", arrow: "granella-1-text" },
    { img: "granella-2-img", txt: "granella-2-text", arrow: "granella-2-text" }
  ];

  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    const arrow = txt?.closest(".arrow");

    if (!img || !txt || !arrow) return;

    const nome = granelle[i];

    if (nome && MAP_GRANELLE_IMG[nome]) {
      img.src = MAP_GRANELLE_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";   // ✅
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";    // ❌
    }
  });
}

function aggiornaToppingRiepilogo() {
  const img   = document.getElementById("topping-img");
  const txt   = document.getElementById("topping-text");
  const arrow = document.getElementById("topping-arrow");

  if (!img || !txt || !arrow) return;

  const topping = scelti.topping?.[0]; // primo topping scelto

  if (topping && MAP_TOPPING_IMG[topping]) {
    img.src = MAP_TOPPING_IMG[topping];
    img.style.display = "block";
    txt.textContent = topping;
    arrow.style.display = "block";
  } else {
    img.style.display = "none";
    txt.textContent = "";
    arrow.style.display = "none";
  }
}

function aggiornaToppingRiepilogoMedia() {
  if (coppaSelezionata !== "MEDIA") return;

  const topping = scelti.topping || [];

  const map = [
    { img: "topping-1-img", txt: "topping-1-text", arrow: "topping-1-arrow" },
    { img: "topping-2-img", txt: "topping-2-text", arrow: "topping-2-arrow" }
  ];

  map.forEach((slot, i) => {
    const img   = document.getElementById(slot.img);
    const txt   = document.getElementById(slot.txt);
    const arrow = document.getElementById(slot.arrow);

    if (!img || !txt || !arrow) return;

    const nome = topping[i];

    if (nome && MAP_TOPPING_IMG[nome]) {
      img.src = MAP_TOPPING_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";   // ✅
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";    // ❌
    }
  });
}

function aggiornaToppingRiepilogoGrande() {
  if (coppaSelezionata !== "GRANDE") return;

  const topping = scelti.topping || [];

  const map = [
    { img: "topping-1-img", txt: "topping-1-text", arrow: "topping-1-text" },
    { img: "topping-2-img", txt: "topping-2-text", arrow: "topping-2-text" }
  ];

  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    const arrow = txt?.closest(".arrow");

    if (!img || !txt || !arrow) return;

    const nome = topping[i];

    if (nome && MAP_TOPPING_IMG[nome]) {
      img.src = MAP_TOPPING_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";   // ✅
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";    // ❌
    }
  });
}

function aggiornaIngredientiRiepilogo() {
  const img   = document.getElementById("frutta-img");
  const txt   = document.getElementById("frutta-text");
  const arrow = document.getElementById("frutta-arrow");

  if (!img || !txt || !arrow) return;

  const ingrediente = scelti.ingredienti?.[0]; // primo ingrediente scelto

  if (ingrediente && MAP_INGREDIENTI_IMG[ingrediente]) {
    img.src = MAP_INGREDIENTI_IMG[ingrediente];
    img.style.display = "block";
    txt.textContent = ingrediente;
    arrow.style.display = "block";
  } else {
    img.style.display = "none";
    txt.textContent = "";
    arrow.style.display = "none";
  }
}

function aggiornaIngredientiRiepilogoMedia() {
  if (coppaSelezionata !== "MEDIA") return;

  const ingrediente = scelti.ingredienti?.[0];

  const img   = document.getElementById("frutta-1-img");
  const txt   = document.getElementById("frutta-1-text");
  const arrow = document.getElementById("frutta-1-arrow");

  if (!img || !txt || !arrow) return;

  if (ingrediente && MAP_INGREDIENTI_IMG[ingrediente]) {
    img.src = MAP_INGREDIENTI_IMG[ingrediente];
    img.style.display = "block";
    txt.textContent = ingrediente;
    arrow.style.display = "block";   // ✅
  } else {
    img.style.display = "none";
    txt.textContent = "";
    arrow.style.display = "none";    // ❌
  }
}

function aggiornaIngredientiRiepilogoGrande() {
  if (coppaSelezionata !== "GRANDE") return;

  const ingredienti = scelti.ingredienti || [];

  const map = [
    { img: "frutta-1-img", txt: "frutta-1-text", arrow: "frutta-1-text" },
    { img: "frutta-2-img", txt: "frutta-2-text", arrow: "frutta-2-text" }
  ];

  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    const arrow = txt?.closest(".arrow");

    if (!img || !txt || !arrow) return;

    const nome = ingredienti[i];

    if (nome && MAP_INGREDIENTI_IMG[nome]) {
      img.src = MAP_INGREDIENTI_IMG[nome];
      img.style.display = "block";
      txt.textContent = nome;
      arrow.style.display = "block";   // ✅
    } else {
      img.style.display = "none";
      txt.textContent = "";
      arrow.style.display = "none";    // ❌
    }
  });
}

function aggiornaExtraRiepilogo() {
  const extras = scelti.extra || [];
  const slots = document.querySelectorAll("#extra-stage .extra-slot");

  // reset totale
  slots.forEach(slot => {
    slot.querySelector(".extra-text").textContent = "";
    slot.style.display = "none";
  });

  if (extras.length === 0) return;

  // 🔹 1 extra → slot centrale
  if (extras.length === 1) {
    const slot = slots[1];
    slot.style.display = "flex";
    slot.querySelector(".extra-text").textContent = extras[0];
    return;
  }

  // 🔹 2 o 3 extra → da sinistra
  extras.slice(0, 3).forEach((extra, i) => {
    const slot = slots[i];
    slot.style.display = "flex";
    slot.querySelector(".extra-text").textContent = extra;
  });
}

// Carica la tabella "disponibilita" da Supabase
async function caricaDisponibilita() {
    try {
        const { data, error } = await supabase
            .from("disponibilita")
            .select("*");

        if (error) {
            console.error("Errore caricamento disponibilità:", error);
            return;
        }

        DISPONIBILITA = {};

        data.forEach(riga => {
            if (!DISPONIBILITA[riga.tipo]) {
                DISPONIBILITA[riga.tipo] = {};
            }
            DISPONIBILITA[riga.tipo][riga.nome] = riga.disponibile; // true/false
        });

        console.log("Disponibilità caricata:", DISPONIBILITA);
    } catch (e) {
        console.error("Errore fetch disponibilità:", e);
    }
}

// =================== AVVIO PAGINA ===================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🌐 Avvio pagina...");
allergeniCliente = JSON.parse(localStorage.getItem("allergeni_cliente") || "[]");
console.log("🧬 Allergeni cliente:", allergeniCliente);
    await caricaDisponibilita();
    attivaRealtimeDisponibilita();

    console.log("🔄 Disponibilità pronta con aggiornamento realtime");

    // 🔥 aggiorno il numeretto carrello al caricamento
    updateCarrelloBadge();
});

// ===========================
// 🔥 REALTIME DISPONIBILITÀ
// ===========================
function attivaRealtimeDisponibilita() {
    if (!window.supabase) {
        console.error("❌ Supabase non trovato!");
        return;
    }

    console.log("🔌 Attivo aggiornamento realtime disponibilita...");

    window.supabase
        .channel("disponibilita-realtime")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "disponibilita" },
            payload => {
                console.log("⚡ Aggiornamento disponibilità:", payload);

                // ricarico i dati
                caricaDisponibilita().then(() => {
                    // Se l’utente è in uno step, aggiorno subito la grafica
                    if (step === "gusti") {
                        renderStepGusti();
                    } else {
                        render();
                    }
                });
            }
        )
        .subscribe();
}

// ---------------- LISTE ----------------
const gustiList = [
  "VANIGLIA","FIOR DI LATTE","CIOCCOLATO","NOCCIOLA","FRAGOLA","PISTACCHIO","LIMONE",
  "MELONE","KIWI","BANANA","COCCO","LAMPONE","MANGO","ANANAS","VARIEGATO AMARENA",
  "STRACCIATELLA","YOGURT","YOGURT FRAGOLINE","CREME CARAMEL","BACIO","CAFFÈ",
  "TIRAMISÙ","CROCCANTINO AL RUM","AMARETTO","MALAGA","CHEESECAKE","COOKIES",
  "CREMA ANDALUSA","CREMINO","CREMINO AL PISTACCHIO","AFTER EIGHT",
  "VARIEGATO FICHI NOCI MIELE"
]

/* =======================
   ALLERGENI GUSTI
======================= */

const ALLERGENI_GUSTI = {
  "VANIGLIA": ["Latte", "Uova"],
  "FIOR DI LATTE": ["Latte"],
  "CIOCCOLATO": ["Latte"],
  "NOCCIOLA": ["Latte", "Uova"],
  "FRAGOLA": [],
  "PISTACCHIO": ["Latte", "Frutta a guscio"],
  "LIMONE": [],
  "MELONE": [],
  "KIWI": [],
  "BANANA": ["Latte"],
  "COCCO": ["Latte"],
  "LAMPONE": [],
  "MANGO": [],
  "ANANAS": [],
  "VARIEGATO AMARENA": ["Latte"],
  "STRACCIATELLA": ["Latte"],
  "YOGURT": ["Latte"],
  "YOGURT FRAGOLINE": ["Latte"],
  "CREME CARAMEL": ["Latte"],
  "BACIO": ["Latte", "Glutine", "Frutta a guscio", "Uova"],
  "CAFFÈ": ["Latte"],
  "TIRAMISÙ": ["Latte", "Uova"],
  "CROCCANTINO AL RUM": ["Latte", "Glutine"],
  "AMARETTO": ["Latte"],
  "MALAGA": ["Latte"],
  "CHEESECAKE": ["Latte", "Glutine"],
  "COOKIES": ["Latte", "Glutine"],
  "CREMA ANDALUSA": ["Latte", "Uova"],
  "CREMINO": ["Latte", "Uova", "Glutine"],
  "CREMINO AL PISTACCHIO": ["Latte", "Uova", "Glutine"],
  "AFTER EIGHT": ["Latte"],
  "VARIEGATO FICHI NOCI MIELE": ["Latte", "Frutta a guscio"]
};


const granelleList = [
  "NOCCIOLA","CROCCANTE","PISTACCHIO","COCCO RAPE'","SCAGLIETTE AL CIOCCOLATO","SMARTIES","ZUCCHERINI COLORATI"
];

/* =======================
   ALLERGENI → GRANELLE
======================= */
const ALLERGENI_GRANELLE = {
  "NOCCIOLA": ["Frutta a guscio"],
  "CROCCANTE": ["Frutta a guscio"],
  "PISTACCHIO": ["Frutta a guscio"],
  "COCCO RAPE'": [],
  "SCAGLIETTE AL CIOCCOLATO": ["Latte", "Soia"],
  "SMARTIES": ["Latte", "Glutine", "Soia"],
  "ZUCCHERINI COLORATI": ["Soia"]
};

const toppingList = [
  "ANANAS","ARANCIA","FRAGOLA","FRUTTI DI BOSCO","KIWI","MELONE","MENTA","CARAMELLO","MALAGA","CIOCCOLATO","NOCCIOLA","PISTACCHIO",
  "LIQUORE AMARETTO","LIQUORE AL CAFFE'","LIQUORE AL COCCO","SCIROPPO AMARENA","JOGURT NATURALE","VOV","CAFFÈ ESPRESSO","CAFFÈ DECAFFEINATO","ORZO","GINSENG","CAFFÈ FREDDO","CIOCCOLATO FREDDO","DISARONNO","BAYLES","COINTREAU","GRAND MARNIER","JACK DANIEL'S","LIMONCELLO","RUM","STRAVECCHIO","VECCHIA ROMAGNA","VODKA"
];

/* =======================
   ALLERGENI → TOPPING
======================= */
const ALLERGENI_TOPPING = {
  "CIOCCOLATO": ["Latte", "Soia"],
  "NOCCIOLA": ["Frutta a guscio", "Soia"],
  "PISTACCHIO": ["Frutta a guscio", "Soia"],
  "CIOCCOLATO FREDDO": ["Latte"]
};

const ingredientiList = [
  "AMARENE(4PZ)","MACEDONIA","ANGURIA","ANANAS","BANANA","FRAGOLE","KIWI","MELONE",
  "MIX BOSCO","PESCA","UVA","FRUTTI DI BOSCO","AMARETTI","MANDORLE","NOCCIOLINE","NOCI","UVETTA",
  "MIKADO","AFTER EIGHT","BOUNTY","KITKAT","DUPLO","CIOCCOLATINI"
];

/* =======================
   ALLERGENI → INGREDIENTI
======================= */
const ALLERGENI_INGREDIENTI = {
  "AMARETTI": ["Frutta a guscio"],
  "MANDORLE": ["Frutta a guscio"],
  "NOCCIOLINE": ["Frutta a guscio"],
  "NOCI": ["Frutta a guscio"],

  "MIKADO": ["Latte", "Soia", "Glutine"],
  "AFTER EIGHT": ["Latte", "Soia", "Glutine"],
  "BOUNTY": ["Latte", "Soia", "Glutine"],
  "KITKAT": ["Latte", "Soia", "Glutine"],
  "DUPLO": ["Latte", "Soia", "Glutine"],
  "CIOCCOLATINI": ["Latte", "Soia", "Glutine"]
};

const extraList = ["COCCO (3pz)","MIX KINDER","PANNA EXTRA"];

/* =======================
   ALLERGENI → EXTRA
======================= */
const ALLERGENI_EXTRA = {
  "MIX KINDER": ["Latte", "Soia", "Glutine"],
  "PANNA EXTRA": ["Latte"]
};

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
// Titolo Dynamic Island
if (title) {
  if (step === "extra") {
    // ❌ niente quantità per extra
    title.textContent = "Extra";
  } else {
    title.textContent = `${step.charAt(0).toUpperCase() + step.slice(1)} (${scelti[step].length}/${max[step]})`;
  }
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

  // 🔥 RESET COMPLETO PER NUOVA COPPA
  coppaSalvata = false;          // ← FONDAMENTALE
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
      // 🚫 Controllo allergeni
const allergeniGusto = ALLERGENI_GUSTI[nome] || [];
const gustoVietato = allergeniGusto.some(a => allergeniCliente.includes(a));
      // 🚫 Controllo disponibilità
const disponibile = DISPONIBILITA["Gusti"]?.[nome] !== false;
        const qty = gustiQuantities[nome] || 0;
        const isEditing = (gustoInModifica === nome);
        const isConfirmed = qty > 0 && !isEditing;
        const showControls = isEditing || qty > 0;

        let cls = "item gusto-item";
if (!disponibile) cls += " gusto-disabled";
if (isEditing) cls += " gusto-pending";
else if (isConfirmed) cls += " gusto-confirmed";
if (gustoVietato) cls += " item-allergene";

   

 html += `
    <div class="${cls}" 
     ${disponibile && !gustoVietato ? `onclick="selectGusto('${nome}')"` : ''}>
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
function render() {
  const area = byId("step-container");
  if (!area) return;

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

  // ---------------- TITOLO STEP ----------------
  const title = document.getElementById("step-title");
  if (title) {
    if (step === "granelle")        title.textContent = "Granelle";
    else if (step === "topping")    title.textContent = "Topping";
    else if (step === "ingredienti")title.textContent = "Ingredienti";
    else if (step === "extra")      title.textContent = "Extra";

    title.style.display = titoloGustiVisibile ? "block" : "none";
  }

  // ---------------- CONTENUTO LISTA + BOTTONI ----------------
  area.innerHTML = `
    <h2 style="display:none"></h2>
    <div class="ingredienti-lista">
      ${
        lista.map(it => {
          const nome = it.split(" (+€")[0].trim();
// 🚫 CONTROLLO ALLERGENI
let allergeneVietato = false;

if (step === "granelle") {
  const a = ALLERGENI_GRANELLE[nome] || [];
  allergeneVietato = a.some(x => allergeniCliente.includes(x));
}

if (step === "topping") {
  const a = ALLERGENI_TOPPING[nome] || [];
  allergeneVietato = a.some(x => allergeniCliente.includes(x));
}

if (step === "ingredienti") {
  const a = ALLERGENI_INGREDIENTI[nome] || [];
  allergeneVietato = a.some(x => allergeniCliente.includes(x));
}
if (step === "extra") {
  const a = ALLERGENI_EXTRA[nome] || [];
  allergeneVietato = a.some(x => allergeniCliente.includes(x));
}
          // 🔥 Mappa step → categoria DB
          const categoria =
              step === "granelle"     ? "Granelle" :
              step === "topping"      ? "Topping" :
              step === "ingredienti"  ? "Ingredienti" :
              step === "extra"        ? "Extra" :
                                        "Gusti";

          // 🔥 Controllo disponibilità
         const disponibile   = DISPONIBILITA[categoria]?.[nome] !== false;
         const sel           = scelti[step].includes(nome) ? "selected" : "";
         const disabledClass = !disponibile ? "item-disabled" : "";
         const allergeneClass = allergeneVietato ? "item-allergene" : "";

          return `
     <div class="item ${sel} ${disabledClass} ${allergeneClass}"
     ${disponibile && !allergeneVietato
       ? `onclick="toggle('${step}','${escForOnclick(nome)}',this)"`
       : ""}>
              ${it}
            </div>
          `;
        }).join("")
      }
    </div>

    <div class="nav-buttons">
      <button class="back-btn" onclick="prevStep()">⬅ Indietro</button>
      <button class="next-btn" onclick="nextStep()">
        ${step === "extra" ? "Conferma ✅" : "Avanti ➜"}
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

  if (step === "gusti") step = "granelle";
  else if (step === "granelle") step = "topping";
  else if (step === "topping") step = "ingredienti";
  else if (step === "ingredienti") step = "extra";

// 🔥 STEP EXTRA → APRI MINI O VAI AL RIEPILOGO
else if (step === "extra") {
    const el = document.getElementById("riepilogo-mini");

    // 👉 SE il mini è già aperto → vai al riepilogo finale
    if (el && el.classList.contains("open")) {
        return mostraRiepilogo();
    }

    // 👉 PRIMO CLICK: apri mini riepilogo
    step = "riepilogo-mini-open";

    if (el) {
        el.classList.remove("collapsed");
        el.classList.add("open");
        el.innerHTML = el.dataset.full || "";
    }

    if (collapseTimer) clearTimeout(collapseTimer);
    collapseTimer = null;
    return;
}

  // 🔥 quando lo step è già "riepilogo-mini-open"
  else if (step === "riepilogo-mini-open") {
      return mostraRiepilogo(); 
  }

  titoloGustiVisibile = true;
  render();
  updateRiepilogo();
}

function nextStepFromMini() {
  // 🔥 forza lo step corretto in base a dove sono
  if (step === "gusti" && scelti.gusti.length === max.gusti) {
    step = "gusti";
  }
  else if (step === "granelle") {
    step = "granelle";
  }
  else if (step === "topping") {
    step = "topping";
  }
  else if (step === "ingredienti") {
    step = "ingredienti";
  }
  else if (step === "extra") {
    step = "extra";
  }

  nextStep();
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

  const btnHtml = ready
  ? `<button class="quick-next-inside" onclick="nextStepFromMini()">Avanti ➜</button>`
  : "";

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

function renderCoppaGrande(stage) {
  stage.innerHTML = `

<div class="grande-wrapper"> 

  <!-- PANNA -->
  <div class="box box-panna">
    <img src="img/panna.png">
  </div>

  <!-- PALLINE -->
  <div class="box-palline">

    <div class="box box-pallina pallina-top">
      <div class="arrow" style="left:-60px; top:55%; transform:translateY(-50%);">
        <div class="arrow-text top gusto-text" id="gusto-top-text">Gusto</div>
        <svg width="50" height="30" viewBox="0 0 50 30" style="transform: scaleY(-1);">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
      </div>
      <img id="gusto-top-img" src="img/pallina-vaniglia.png">
    </div>

    <div class="box box-pallina pallina-left">
      <div class="arrow" style="left:-38px; top:40%; transform:translate(-30px, -50%);">
        <svg width="50" height="30" viewBox="0 0 50 30">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
        <div class="arrow-text left gusto-text" id="gusto-left-text">Gusto</div>
      </div>
      <img id="gusto-left-img" src="img/pallina-fragola.png">
    </div>

    <div class="box box-pallina pallina-right">
      <div class="arrow" style="right:-62px; top:30%; transform:translateY(-50%);">
        <div class="arrow-text right gusto-text" id="gusto-right-text">Gusto</div>
        <svg width="50" height="30" viewBox="0 0 50 30"
             style="transform: rotate(180deg) translateY(-14px);">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
      </div>
      <img id="gusto-right-img" src="img/pallina-cioccolato.png">
    </div>

    <div class="box box-pallina pallina-bottom">
      <div class="arrow" style="top:115%; left:50%; transform:translateX(-50%);">
        <div class="arrow-text bottom gusto-text" id="gusto-bottom-text">Gusto</div>
        <svg width="50" height="30" viewBox="0 0 50 30"
             style="transform: rotate(-90deg);">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
      </div>
      <img id="gusto-bottom-img" src="img/pallina-pistacchio.png">
    </div>

  </div>

  <!-- COPPA -->
  <div class="box box-coppa">
    <img src="img/coppa-grande.png">
  </div>

  <!-- GRANELLE -->
<div class="box box-extra granella-1">
  <img id="granella-1-img" src="img/granella-nocciola.png">

  <div class="arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text bottom granella-text" id="granella-1-text">Granella</div>
    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(-90deg) scaleY(-1);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

<div class="box box-extra granella-2">
  <img id="granella-2-img" src="img/granella-nocciola.png">

  <div class="arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text bottom granella-text" id="granella-2-text">Granella</div>
    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(-90deg);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

  <!-- TOPPING -->
<div class="box box-extra topping-1">
  <img id="topping-1-img" src="img/topping-bosco.png">

  <div class="arrow"
       style="top:-58px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text top topping-text" id="topping-1-text">Topping</div>
    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(90deg);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

<div class="box box-extra topping-2">
  <img id="topping-2-img" src="img/topping-bosco.png">

  <div class="arrow"
       style="top:-58px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text top topping-text" id="topping-2-text">Topping</div>
    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(90deg) scaleY(-1);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

  <!-- FRUTTA -->
<div class="box box-extra frutta-1">
  <img id="frutta-1-img" src="img/fragola.png">

  <div class="arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text bottom frutta-text" id="frutta-1-text">Frutta</div>
    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(-90deg) scaleY(-1);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

<div class="box box-extra frutta-2">
  <img id="frutta-2-img" src="img/fragola.png">

  <div class="arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text bottom frutta-text" id="frutta-2-text">Frutta</div>
    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(-90deg);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

  <!-- EXTRA STAGE -->
  <div id="extra-stage">
    <div class="extra-slot"><div class="extra-img"></div><div class="extra-text"></div></div>
    <div class="extra-slot"><div class="extra-img"></div><div class="extra-text"></div></div>
    <div class="extra-slot"><div class="extra-img"></div><div class="extra-text"></div></div>
  </div>

</div>
`;
}

function renderCoppaMedia(stage) {
  stage.innerHTML = `

<div class="media-coppa">

  <!-- PANNA -->
  <div class="box box-panna">
    <img src="img/panna.png">
  </div>

  <!-- PALLINE -->
  <div class="box-palline">

    <!-- PALLINA IN ALTO -->
    <div class="box box-pallina pallina-top">
      <div class="arrow"
           style="left:-60px; top:55%; transform:translateY(-50%);">
        <div class="arrow-text top gusto-top-text" id="gusto-top-text"></div>
        <svg width="50" height="30" viewBox="0 0 50 30"
             style="transform: scaleY(-1);">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
      </div>
      <img id="gusto-top-img">
    </div>

    <!-- PALLINA SINISTRA -->
    <div class="box box-pallina pallina-left">
      <div class="arrow"
           style="left:-38px; top:40%; transform:translate(-30px, -50%);">
        <svg width="50" height="30" viewBox="0 0 50 30">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
        <div class="arrow-text left" id="gusto-left-text"></div>
      </div>
      <img id="gusto-left-img">
    </div>

    <!-- PALLINA DESTRA -->
    <div class="box box-pallina pallina-right">
      <div class="arrow"
           style="right:-62px; top:30%; transform:translateY(-50%);">
        <div class="arrow-text right" id="gusto-right-text"></div>
        <svg width="50" height="30" viewBox="0 0 50 30"
             style="transform: rotate(180deg) translateY(-14px);">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
      </div>
      <img id="gusto-right-img">
    </div>

  </div>

  <!-- COPPA -->
  <div class="box box-coppa">
    <img src="img/coppa-media.png">
  </div>

</div>

<div class="media-extras">

  <!-- GRANELLA 1 -->
  <div class="box box-extra granella-1">
    <img id="granella-1-img">
    <div class="arrow" id="granella-1-arrow"
         style="bottom:-52px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text bottom granella-text" id="granella-1-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform:rotate(-90deg) scaleY(-1);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

  <!-- GRANELLA 2 -->
  <div class="box box-extra granella-2">
    <img id="granella-2-img">
    <div class="arrow" id="granella-2-arrow"
         style="bottom:-52px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text bottom granella-text" id="granella-2-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform:rotate(-90deg);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

  <!-- TOPPING 1 -->
  <div class="box box-extra topping-1">
    <img id="topping-1-img">
    <div class="arrow" id="topping-1-arrow"
         style="top:-58px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text top topping-text" id="topping-1-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform: rotate(90deg);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

  <!-- TOPPING 2 -->
  <div class="box box-extra topping-2">
    <img id="topping-2-img">
    <div class="arrow" id="topping-2-arrow"
         style="top:-58px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text top topping-text" id="topping-2-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform: rotate(90deg) scaleY(-1);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

  <!-- FRUTTA -->
  <div class="box box-extra box-frutta">
    <img id="frutta-1-img">
    <div class="arrow" id="frutta-1-arrow"
         style="bottom:-52px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text bottom frutta-text" id="frutta-1-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform:rotate(-90deg);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

</div>

<!-- EXTRA STAGE -->
<div id="extra-stage">
  <div class="extra-slot"><div class="extra-text"></div></div>
  <div class="extra-slot"><div class="extra-text"></div></div>
  <div class="extra-slot"><div class="extra-text"></div></div>
</div>

  `;
}

async function mostraRiepilogo(){

  if (coppaSalvata) {
      console.log("⛔ Coppa già salvata");
      return;
  }
  coppaSalvata = true;
  step = "riepilogo";
  const area = byId("step-container");

  // 🔥 Nasconde titoli e residui dello step corrente
  const t = document.getElementById("step-title");
  if (t) t.style.display = "none";
  document.querySelector("header").style.display = "none";

  // ✅ 1) Calcolo il prezzo SUBITO
  const prezzoBase = prezziBase[coppaSelezionata] || 0;
  const prezzoExtraDettaglio = scelti.extra.map(e => ({
    nome: e,
    prezzo: prezziExtra[e] || 0
  }));
  const sommaExtra = prezzoExtraDettaglio.reduce((t,x)=> t + x.prezzo, 0);
  const totale = prezzoBase + sommaExtra;

  // ✅ 2) Recupero email e guest_id
  const email = localStorage.getItem("user_email") || null;

  let guest_id = localStorage.getItem("guest_id");
  if (!guest_id) {
      guest_id = "guest_" + crypto.randomUUID();
      localStorage.setItem("guest_id", guest_id);
  }

  // ✅ 3) Leggo la cronologia per calcolare il nome di default (Coppa #N)
  let cronologiaArr = JSON.parse(localStorage.getItem("cronologiaCoppe") || "[]");
  const coppaNome = `Coppa #${cronologiaArr.length + 1}`;

  // ✅ 3bis) Genero un token univoco per il QR
  const qrToken = (crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : ("qr_" + Date.now() + "_" + Math.floor(Math.random() * 100000));

      window.__lastQrToken = qrToken;

  // ✅ 4) Oggetto coppa da salvare (ORA CON NOME + qr_token)
const coppa = {
  nome: coppaNome,
  email: email || null,
  guest_id: guest_id,
  data: new Date().toISOString(),
  formato: coppaSelezionata,
  gusti: scelti.gusti,
  granelle: scelti.granelle,
  topping: scelti.topping,
  ingredienti: scelti.ingredienti,
  extra: scelti.extra,
  prezzo: totale,
  qr_token: qrToken,
  tavolo: tavoloSelezionato,   // ✅ QUI
  confermate: 0
};

  // ✅ 5) Salva su Supabase
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

 // 🔥 Evita duplicazioni: salva la coppa solo se non esiste già
if (!cronologiaArr.some(x => x.data === coppa.data)) {
    cronologiaArr.unshift(coppa);
    localStorage.setItem("cronologiaCoppe", JSON.stringify(cronologiaArr));
}
console.log("📌 SALVATAGGIO COPPA IN LOCALE:", coppa);

  // ✅ 7) Riepilogo grafico (come prima)
area.innerHTML = `
    <h2 style="display:flex; justify-content:space-between; align-items:center;">
        Riepilogo finale
    </h2>

<div class="scontrino" id="scontrino-da-share">
  <p><b>Formato:</b> ${coppaSelezionata} — €${prezzoBase.toFixed(2)}</p>

  <p><b>Gusti:</b><br>
  ${(() => {
      const grouped = {};
      Object.entries(gustiQuantities).forEach(([nome, qty]) => {
          if (qty > 0) grouped[nome] = qty;
      });

      if (Object.keys(grouped).length === 0) return "-";

      return Object.entries(grouped)
        .map(([nome, qty]) => qty === 1 ? `- ${nome}` : `- ${nome} x${qty}`)
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

<div id="qr-wrapper" style="
    margin-top:18px;
    text-align:center;
">
    <p><b>QR Code per conferma coppa</b></p>
    <div id="qr-code" data-token="${qrToken}"></div>
</div>

<!-- 🍨 COPPA GRAFICA -->
<div id="coppa-wrapper" style="
  margin-top: 24px;
  display: flex;
  justify-content: center;
">
  <div id="coppa-stage"></div>
</div>

<button class="next-btn" style="margin-top:15px;" onclick="aggiungiAlCarrello()">
    🛒 Aggiungi al carrello
</button>

<p style="margin-top:12px; font-size:14px; text-align:center; opacity:0.75;">
 📣 Comunica al cameriere la tua coppa gelato 📣
</p>

<div class="nav-buttons" style="margin-top:18px; display:flex; flex-direction:column; gap:10px;">
  <button class="next-btn" onclick="shareWhatsApp()">📲 Condividi su WhatsApp</button>
  <button class="next-btn" onclick="salvaScontrinoComeImmagine()">📸 Salva immagine (Instagram)</button>
  <button class="back-btn" onclick="showSizeScreen()">➕ Crea un'altra</button>
  <button class="next-btn" onclick="apriRegistrazione()">🧑‍💻 Registrati</button>
</div>
`;
const stage = document.getElementById("coppa-stage");
if (!stage) return;

// reset classi
document.body.classList.remove("coppa-media", "coppa-grande");

// QUI decidi il formato
if (coppaSelezionata === "PICCOLA") {

  stage.innerHTML = `

  <!-- PANNA -->
  <div class="box box-panna">
    <img src="img/panna.png">
    <div class="label">Panna</div>
  </div>

  <!-- PALLINE -->
  <div class="box-palline">

    <!-- Pallina sinistra -->
    <div class="box box-pallina pallina-1">
     <img id="gusto-left-img" src="img/pallina-vaniglia.png">

      <!-- Freccia gusto sinistra -->
      <div class="arrow"
     id="gusto-left-arrow"
     style="left:-38px; top:50%; transform:translate(-30px, -50%);">
        <svg class="arrow-svg" width="50" height="30" viewBox="0 0 50 30">
          <path d="M30 15 C16 14, -6 18, -12 38"
                fill="none" stroke="#000" stroke-width="1.3" stroke-linecap="round" />
          <path d="M38 15 L30 11 M38 15 L30 19"
                fill="none" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
       <div class="arrow-text" id="gusto-left-text">Gusto</div>
      </div>
    </div>

    <!-- Pallina destra -->
    <div class="box box-pallina pallina-2">
      <img id="gusto-right-img" src="img/pallina-fragola.png">

      <!-- Freccia gusto destra -->
      <div class="arrow"
     id="gusto-right-arrow"
     style="right:-62px; top:50%; transform:translateY(-50%);">
        <div class="arrow-text right" id="gusto-right-text">Gusto</div>
        <svg class="arrow-svg" width="50" height="30" viewBox="0 0 50 30"
             style="transform: rotate(180deg) translateY(-14px); transform-origin: center;">
          <path d="M30 15 C16 14, -6 18, -12 38" />
          <path d="M38 15 L30 11 M38 15 L30 19" />
        </svg>
      </div>
    </div>

  </div>

  <!-- COPPA -->
  <div class="box box-coppa">
    <img src="img/coppa-piccola.png">
    <div class="label">Coppa</div>
  </div>

  <!-- GRANELLA -->
<div class="box box-extra box-granella">
  <img id="granella-img" src="img/granella-nocciola.png">

  <div class="arrow" id="granella-arrow"
     style="bottom:-52px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text bottom granella-text" id="granella-text">
      Granella
    </div>

    <svg class="arrow-svg" width="50" height="30" viewBox="0 0 50 30"
         style="transform:rotate(-90deg) scaleY(-1); transform-origin:center;">
      <path d="M30 15 C16 14, -6 18, -12 38" />
      <path d="M38 15 L30 11 M38 15 L30 19" />
    </svg>
  </div>
</div>

  <!-- TOPPING -->
<div class="box box-extra box-topping">
  <img id="topping-img" src="img/topping-bosco.png">

  <div class="arrow"
       id="topping-arrow"
       style="top:-58px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text top topping-text" id="topping-text">
      Topping
    </div>

    <svg class="arrow-svg" width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(90deg) scaleY(-1); transform-origin: center;">
      <path d="M30 15 C16 14, -6 18, -12 38" />
      <path d="M38 15 L30 11 M38 15 L30 19" />
    </svg>
  </div>
</div>

  <!-- FRUTTA -->
<div class="box box-extra box-frutta">
  <img id="frutta-img" src="img/fragola.png">

  <div class="arrow"
       id="frutta-arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text bottom frutta-text" id="frutta-text">
      Frutta
    </div>

    <svg class="arrow-svg" width="50" height="30" viewBox="0 0 50 30"
         style="transform:rotate(-90deg); transform-origin:center;">
      <path d="M30 15 C16 14, -6 18, -12 38" />
      <path d="M38 15 L30 11 M38 15 L30 19" />
    </svg>
  </div>
</div>
<!-- ================= EXTRA STAGE ================= -->
<div id="extra-stage">

  <div class="extra-slot" data-slot="0">
    <div class="extra-img"></div>
    <div class="extra-text"></div>
  </div>

  <div class="extra-slot" data-slot="1">
    <div class="extra-img"></div>
    <div class="extra-text"></div>
  </div>

  <div class="extra-slot" data-slot="2">
    <div class="extra-img"></div>
    <div class="extra-text"></div>
  </div>

</div>
  `;
}

else if (coppaSelezionata === "MEDIA") {

  document.body.classList.add("coppa-media");
  renderCoppaMedia(stage);
}
else if (coppaSelezionata === "GRANDE") {
  document.body.classList.add("coppa-grande");
  renderCoppaGrande(stage);
}
if (coppaSelezionata === "PICCOLA") {
  aggiornaPallineRiepilogo();
  aggiornaGranellaRiepilogo();
  aggiornaToppingRiepilogo();
  aggiornaIngredientiRiepilogo();
}

if (coppaSelezionata === "MEDIA") {
  aggiornaPallineRiepilogoMedia();
  aggiornaGranellaRiepilogoMedia();
  aggiornaToppingRiepilogoMedia();
  aggiornaIngredientiRiepilogoMedia();
}

if (coppaSelezionata === "GRANDE") {
  aggiornaPallineRiepilogoGrande();
  aggiornaGranellaRiepilogoGrande();
  aggiornaToppingRiepilogoGrande();
  aggiornaIngredientiRiepilogoGrande();
}

aggiornaExtraRiepilogo();

// === QR CODE ===
if (window.QRCode) {
    const qrContainer = document.getElementById("qr-code");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
        text: qrToken,
        width: 160,
        height: 160,
    });
} else {
    console.error("Libreria QRCode non trovata");
}

  // 🔒 Chiudi SEMPRE il mini-riepilogo nel riepilogo finale
  const mini = document.getElementById("riepilogo-mini");
  if (mini) {
    mini.classList.add("collapsed");
    mini.classList.remove("open");
    mini.innerHTML = mini.dataset.mini || "";
  }
  updateRiepilogo();
  updateCarrelloBadge();
}

function firmaCoppa(c) {
    const normalize = arr =>
        (arr || []).slice().sort().join("|");

    return [
        c.formato,
        normalize(c.gusti),
        normalize(c.granelle),
        normalize(c.topping),
        normalize(c.ingredienti),
        normalize(c.extra)
    ].join("::");
}

window.aggiungiAlCarrello = function () {

    let cronologia = JSON.parse(localStorage.getItem("cronologiaCoppe") || "[]");
    const ultima = cronologia[0];
    if (!ultima) {
        alert("Errore: impossibile aggiungere la coppa!");
        return;
    }

    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");

    const nuovaCoppa = {
        formato: ultima.formato,
        gusti: [...ultima.gusti],
        granelle: [...ultima.granelle],
        topping: [...ultima.topping],
        ingredienti: [...ultima.ingredienti],
        extra: [...ultima.extra],
        quantita: 1
    };

    const firmaNuova = firmaCoppa(nuovaCoppa);

    // 🔥 CERCA COPPA IDENTICA
    const esistente = carrello.find(c => firmaCoppa(c) === firmaNuova);

    if (esistente) {
        // 👉 stessa coppa → aumenta quantità
        esistente.quantita += 1;
    } else {
        // 👉 coppa nuova → aggiungi
        nuovaCoppa.id = crypto.randomUUID();
        carrello.push(nuovaCoppa);
    }

    localStorage.setItem("carrelloCoppe", JSON.stringify(carrello));

    alert("🛒 Coppa aggiunta al carrello!");
    updateBadgeNav();
};

function getCarrelloCount() {
    const carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
    if (!Array.isArray(carrello)) return 0;

    // somma le quantità
    return carrello.reduce((sum, c) => {
        const q = typeof c.quantita === "number" ? c.quantita : 1;
        return sum + q;
    }, 0);
}

function updateCarrelloBadge() {
    const count = getCarrelloCount();

    // 🔺 Badge vecchio in alto (se esiste ancora)
    const badgeTop = document.getElementById("carrello-badge");
    if (badgeTop) {
        if (count <= 0) {
            badgeTop.style.display = "none";
        } else {
            badgeTop.style.display = "inline-flex";
            badgeTop.textContent = count;
        }
    }

    // 🔻 Badge nella bottom bar (id="badge-nav")
    const badgeNav = document.getElementById("badge-nav");
    if (badgeNav) {
        if (count <= 0) {
            badgeNav.style.display = "none";
        } else {
            badgeNav.style.display = "inline-block";
            badgeNav.textContent = count;
        }
    }
}

function calcolaPrezzoCoppa(c) {
    const prezzoBase = prezziBase[c.formato] || 0;

    let sommaExtra = 0;
    if (Array.isArray(c.extra)) {
        sommaExtra = c.extra.reduce((acc, nome) => {
            return acc + (prezziExtra[nome] || 0);
        }, 0);
    }

    return (prezzoBase + sommaExtra);
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

  // ❌ NON forziamo più larghezze qui
  el.style.minWidth = "";
  el.style.maxWidth = "";
}

// 🔓 Se arrivo alla pagina con ?cart=1 apro subito il carrello
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const openCart = params.get("cart");

    if (openCart === "1") {
        const overlay = document.getElementById("carrello-overlay");

        // se l'overlay esiste e c'è la funzione di render → apro
        if (overlay && typeof window.aggiornaCarrelloUI === "function") {
            window.aggiornaCarrelloUI();
            overlay.style.display = "flex";
        }
    }
});

// ⬇️ FINE FILE — METTILO QUI ⬇️

// 🛒 APRE IL CARRELLO
window.apriCarrello = function() {
    const overlay = document.getElementById("carrello-overlay");

    // 🔥 Aggiorno SUBITO la UI del carrello
    aggiornaCarrelloUI();

    // 🔥 Aggiorno il numeretto (badge) del carrello
    updateCarrelloBadge();

    // 🔥 Mostro overlay
    overlay.style.display = "flex";

    // 🔥 Mostro il bottone cronologia solo se registrato
    const btnCron = document.getElementById("btn-cronologia");
    if (btnCron) {
        const email = localStorage.getItem("user_email");
        btnCron.style.display = email ? "inline-flex" : "none";
        updateBadgeNav();
    }
};

// 🔢 CAMBIA QUANTITÀ COPPA NEL CARRELLO
window.cambiaQuantita = function(id, delta) {

    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
    const idx = carrello.findIndex(c => c.id === id);
    if (idx === -1) return;

    const coppa = carrello[idx];

    // 👉 CASO: quantità = 1 e utente preme "-"
    if (delta === -1 && coppa.quantita === 1) {
        const conferma = confirm("Vuoi rimuovere questa coppa dal carrello?");
        if (!conferma) return;

        // Elimina la coppa
        carrello.splice(idx, 1);
    } else {
        // Incremento/decremento normale
        coppa.quantita += delta;
        if (coppa.quantita < 1) coppa.quantita = 1;
    }

    // Salvo aggiornamento
    localStorage.setItem("carrelloCoppe", JSON.stringify(carrello));

    // 🔥 AGGIORNO IMMEDIATAMENTE UI e BADGE
    aggiornaCarrelloUI();
    updateBadgeNav();
};

// ✖ CHIUDE IL CARRELLO
window.chiudiCarrello = function() {
    const overlay = document.getElementById("carrello-overlay");
    overlay.style.display = "none";
};

window.svuotaCarrello = function () {
    if (!confirm("Vuoi svuotare tutto il carrello?")) return;

    localStorage.setItem("carrelloCoppe", "[]");

    updateBadgeNav();
    aggiornaCarrelloUI();
};

// 🔥 Aggiorna il badge della NAV BOTTOM
window.updateBadgeNav = function() {
    const badge = document.getElementById("badge-nav");
    if (!badge) return;

    const carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
    const totale = carrello.reduce((sum, c) => sum + (c.quantita || 1), 0);

    badge.textContent = totale;
    badge.style.display = totale > 0 ? "inline-flex" : "none";
};

window.aggiornaCarrelloUI = function() {
    const contenuto = document.getElementById("carrello-contenuto");
    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");

    if (!carrello.length) {
        contenuto.innerHTML = `<p style="text-align:center; opacity:0.6;">Carrello vuoto</p>`;
        return;
    }

    let html = "";

    carrello.forEach(coppa => {

        // 🔥 Raggruppa gusti x2, x3 ecc
        const count = {};
        coppa.gusti.forEach(g => count[g] = (count[g] || 0) + 1);
        const gustiFormattati = Object.entries(count)
            .map(([g, q]) => q > 1 ? `${g} x${q}` : g)
            .join(", ");

        // 🔥 Calcolo totale di quella coppa
        let prezzoBase = prezziBase[coppa.formato] || 0;
        let extraSomma = 0;
        coppa.extra.forEach(e => extraSomma += (prezziExtra[e] || 0));
        let totaleCoppa = (prezzoBase + extraSomma) * coppa.quantita;

   html += `
<div class="carrello-card">
    <div class="carrello-info">
        <div class="carrello-formato"><b>${coppa.formato}</b></div>

        <div class="carrello-dettagli">
            <div><b>Gusti:</b> ${gustiFormattati || "-"}</div>
            <div><b>Granelle:</b> ${coppa.granelle.join(", ") || "-"}</div>
            <div><b>Topping:</b> ${coppa.topping.join(", ") || "-"}</div>
            <div><b>Ingredienti:</b> ${coppa.ingredienti.join(", ") || "-"}</div>
            <div><b>Extra:</b> ${
    coppa.extra.length
        ? coppa.extra
            .map(e => `${e} (+ €${(prezziExtra[e] || 0).toFixed(2)})`)
            .join(", ")
        : "-"
}</div>
        </div>

        <div class="carrello-prezzo">€ ${totaleCoppa.toFixed(2)}</div>
    </div>

    <div class="carrello-qty-controls">
        <button class="qty-btn" onclick="cambiaQuantita('${coppa.id}', -1)">−</button>
        <span class="qty-number">${coppa.quantita}</span>
        <button class="qty-btn" onclick="cambiaQuantita('${coppa.id}', +1)">+</button>
    </div>
</div>`;
    });
    // 🔥 Aggiorna badge nella bottom bar
updateBadgeNav();

    // 🔥 CALCOLO TOTALE GENERALE DEL CARRELLO
let totaleGenerale = 0;
carrello.forEach(c => {
    let prezzoBase = prezziBase[c.formato] || 0;
    let extraSomma = 0;
    c.extra.forEach(e => extraSomma += (prezziExtra[e] || 0));
    totaleGenerale += (prezzoBase + extraSomma) * c.quantita;
});

// 🧾 Aggiungo il totale in fondo
html += `
  <div id="carrello-totale">
      Totale: <b>€ ${totaleGenerale.toFixed(2)}</b>
  </div>
`;

// Inserisco tutta la UI
contenuto.innerHTML = html;
};

window.apriCronologia = function() {
    // 🔥 metti qui il path giusto se diverso
    window.location.href = "cronologia.html";
};
// 🚀 Pulsante procedi ordine (per ora solo alert)
window.procediOrdine = function() {
    alert("Funzione ordine in arrivo!");
};

document.addEventListener("DOMContentLoaded", () => {
  const riepilogo = document.getElementById("riepilogo-mini");

  // se l'elemento NON esiste → NON fare nulla
  if (!riepilogo) return;

  riepilogo.addEventListener("click", function(e){
    // ⛔ Se ho cliccato il bottone AVANTI → NON toggle, lascia passare il click
    if (e.target.closest(".quick-next-inside")) return;

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

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("riepilogo-mini");
  if (!el) return;

  el.addEventListener("click", () => {
    console.log("🟢 CLICK RICEVUTO SUL MINI RIEPILOGO");
  });
});
