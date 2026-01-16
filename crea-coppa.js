
console.log("JS CARICATO ✔️");
// 🔑 GARANTISCI guest_id SEMPRE
if (!localStorage.getItem("guest_id")) {
  localStorage.setItem("guest_id", "guest_" + crypto.randomUUID());
}
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
let coppaSalvata = false;
let registrazioneAperta = false;
let loadingFallbackTimer = null;

// 🔥 SE ARRIVO DA "USA QUESTA COPPA" → NASCONDI STEP TAVOLO
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("coppaDaUsare")) {
    const stepTavolo = document.getElementById("step-tavolo");
    if (stepTavolo) {
      stepTavolo.style.display = "none";
    }
  }
});
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
  "VANIGLIA": "img/vaniglia.png",
  "FRAGOLA": "img/gelato-fragola.png",
  "CIOCCOLATO": "img/cioccolato.png",
  "FIOR DI LATTE": "img/fiordilatte.png",
  "NOCCIOLA": "img/nocciola.png",
  "PISTACCHIO": "img/pistacchio.png",
  "LIMONE": "img/limone.png",
  "MELONE": "img/melone.png",
  "KIWI": "img/kiwi.png",
  "BANANA": "img/banana.png",
  "COCCO": "img/cocco.png",
  "LAMPONE": "img/lampone.png",
  "MANGO": "img/mango.png",
  "ANANAS": "img/ananas.png",
  "VARIEGATO AMARENA": "img/amarena.png",
  "STRACCIATELLA": "img/stracciatella.png",
  "YOGURT": "img/yogurt.png",
  "YOGURT FRAGOLINE": "img/yogurtfragoline.png",
  "CREME CARAMEL": "img/caramel.png",
  "BACIO": "img/bacio.png",
  "CAFFÈ": "img/caffe.png",
  "TIRAMISÙ": "img/tiramisu.png",
  "CROCCANTINO AL RUM": "img/croccantino.png",
  "AMARETTO": "img/amaretto.png",
  "MALAGA": "img/malaga.png",
  "CHEESECAKE": "img/cheesecake.png",
  "COOKIES": "img/cookies.png",
  "CREMA ANDALUSA": "img/andalusa.png",
  "CREMINO": "img/cremino.png",
  "CREMINO AL PISTACCHIO": "img/creminopistacchio.png",
  "AFTER EIGHT": "img/aftereight.png",
  "VARIEGATO FICHI NOCI MIELE": "img/variegatofichi.png"
};
const MAP_GRANELLE_IMG = {
  "NOCCIOLA": "img/granella-nocciola.png",
  "CROCCANTE": "img/granella-croccante.png",
  "PISTACCHIO": "img/granella-pistacchio.png",
  "COCCO RAPE'": "img/cocco-rape.png",
  "SCAGLIETTE AL CIOCCOLATO": "img/scagliette.png",
  "SMARTIES": "img/smarties.png",
  "ZUCCHERINI COLORATI": "img/codette.png"
};
const MAP_TOPPING_IMG = {
  "FRUTTI DI BOSCO": "img/topping-bosco.png",
  "ANANAS": "img/topping-ananas.png",
  "ARANCIA": "img/topping-arancia.png",
  "FRAGOLA": "img/topping-fragola.png",
  "KIWI": "img/topping-kiwi.png",
  "MELONE": "img/topping-melone.png",
  "MENTA": "img/topping-menta.png",
  "CARAMELLO": "img/topping-caramello.png",
  "MALAGA": "img/topping-malaga.png",
  "CIOCCOLATO": "img/topping-cioccolato.png",
  "NOCCIOLA": "img/topping-nocciola.png",
  "PISTACCHIO": "img/topping-pistacchio.png",
  "LIQUORE AMARETTO": "img/liquore-amaretto.png",
  "LIQUORE AL CAFFE'": "img/liquore-caffe.png",
  "LIQUORE AL COCCO": "img/liquore-cocco.png",
  "SCIROPPO AMARENA": "img/sciroppo-amarena.png",
  "JOGURT NATURALE": "img/jogurt-naturale.png",
  "VOV": "img/vov.png",
  "CAFFÈ ESPRESSO": "img/espresso.png",
  "CAFFÈ DECAFFEINATO": "img/decaffeinato.png",
  "ORZO": "img/orzo.png",
  "GINSENG": "img/ginseng.png",
  "CAFFÈ FREDDO": "img/caffe-freddo.png",
  "CIOCCOLATO FREDDO": "img/cioccolato-freddo.png",
  "DISARONNO": "img/disaronno.png",
  "BAILEYS": "img/baileys.png",
  "COINTREAU": "img/cointreau.png",
  "GRAND MARNIER": "img/grand-marnier.png",
  "JACK DANIEL'S": "img/jack.png",
  "LIMONCELLO": "img/limoncello.png",
  "RUM": "img/rum.png",
  "STRAVECCHIO": "img/stravecchio.png",
  "VECCHIA ROMAGNA": "img/vecchia.png",
  "VODKA": "img/vodka.png"
};
const MAP_INGREDIENTI_IMG = {
  "FRAGOLE": "img/fragole.png",
  "AMARENE(4PZ)": "img/amarene.png",
  "MACEDONIA": "img/macedonia.png",
  "ANGURIA": "img/anguria.png",
  "ANANAS": "img/ananas-frutto.png",
  "BANANA": "img/banana-frutto.png",
  "KIWI": "img/kiwi-frutto.png",
  "MELONE": "img/melone-frutto.png",
  "MIX BOSCO": "img/mix-bosco.png",
  "MELA": "img/mela.png",
  "PESCA": "img/pesca.png",
  "UVA": "img/uva.png",
  "FRUTTI DI BOSCO": "img/fruttidibosco.png",
  "AMARETTI": "img/amaretti.png",
  "MANDORLE": "img/mandorle.png",
  "NOCCIOLINE": "img/noccioline.png",
  "NOCI": "img/noci.png",
  "UVETTA": "img/uvetta.png",
  "MIKADO": "img/mikado.png",
  "AFTER EIGHT": "img/after-eight.png",
  "BOUNTY": "img/bounty.png",
  "KIT KAT": "img/kit-kat.png",
  "DUPLO": "img/duplo.png",
  "CIOCCOLATINI": "img/cioccolatini.png"
};

const MAP_EXTRA_IMG = {
  "COCCO (3pz)": "img/extra-cocco.png",
  "MIX KINDER": "img/extra-kinder.png",
  "PANNA EXTRA": "img/extra-panna.png"
};

function aggiornaExtraCompattiPiccola() {
  if (coppaSelezionata !== "PICCOLA") return;

  const slots = [
    {
      img: document.getElementById("granella-img"),
      txt: document.getElementById("granella-text"),
      arrow: document.getElementById("granella-arrow")
    },
    {
      img: document.getElementById("topping-img"),
      txt: document.getElementById("topping-text"),
      arrow: document.getElementById("topping-arrow")
    },
    {
      img: document.getElementById("frutta-img"),
      txt: document.getElementById("frutta-text"),
      arrow: document.getElementById("frutta-arrow")
    }
  ];

  // reset totale
  slots.forEach(s => {
    if (s.img) s.img.style.display = "none";
    if (s.txt) s.txt.textContent = "";
    if (s.arrow) s.arrow.style.display = "none";
  });

  // lista compatta in ordine
  const compatti = [];

  if (scelti.granelle?.[0] && MAP_GRANELLE_IMG[scelti.granelle[0]]) {
    compatti.push({
      nome: scelti.granelle[0],
      img: MAP_GRANELLE_IMG[scelti.granelle[0]]
    });
  }

  if (scelti.topping?.[0] && MAP_TOPPING_IMG[scelti.topping[0]]) {
    compatti.push({
      nome: scelti.topping[0],
      img: MAP_TOPPING_IMG[scelti.topping[0]]
    });
  }

  if (scelti.ingredienti?.[0] && MAP_INGREDIENTI_IMG[scelti.ingredienti[0]]) {
    compatti.push({
      nome: scelti.ingredienti[0],
      img: MAP_INGREDIENTI_IMG[scelti.ingredienti[0]]
    });
  }

  // riempi da sinistra → niente buchi
  compatti.forEach((item, i) => {
    const s = slots[i];
    if (!s) return;

    s.img.src = item.img;
    s.img.style.display = "block";
    s.txt.textContent = item.nome;
    s.arrow.style.display = "block";
  });
}

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

function aggiornaExtraCompattiMedia() {
  if (coppaSelezionata !== "MEDIA") return;

  // SLOT VISIVI REALI (da sinistra a destra)
  const slots = [
    { img: byId("granella-1-img"), txt: byId("granella-1-text"), arrow: byId("granella-1-arrow") },
    { img: byId("granella-2-img"), txt: byId("granella-2-text"), arrow: byId("granella-2-arrow") },
    { img: byId("topping-1-img"),  txt: byId("topping-1-text"),  arrow: byId("topping-1-arrow") },
    { img: byId("topping-2-img"),  txt: byId("topping-2-text"),  arrow: byId("topping-2-arrow") },
    { img: byId("frutta-1-img"),   txt: byId("frutta-1-text"),   arrow: byId("frutta-1-arrow") },
  ];

  // ✅ RESET TOTALE (anche se qualche pezzo mancasse)
  slots.forEach(s => {
    if (s.img)   s.img.style.display = "none";
    if (s.txt)   s.txt.textContent = "";
    if (s.arrow) s.arrow.style.display = "none";
  });

  // ✅ LISTA COMPATTA IN ORDINE LOGICO
  const items = [];

  (scelti.granelle || []).forEach(n => {
    if (MAP_GRANELLE_IMG[n]) items.push({ img: MAP_GRANELLE_IMG[n], txt: n });
  });

  (scelti.topping || []).forEach(n => {
    if (MAP_TOPPING_IMG[n]) items.push({ img: MAP_TOPPING_IMG[n], txt: n });
  });

  (scelti.ingredienti || []).forEach(n => {
    if (MAP_INGREDIENTI_IMG[n]) items.push({ img: MAP_INGREDIENTI_IMG[n], txt: n });
  });

  // ✅ RIEMPI DA SINISTRA (SENZA BUCHI)
  items.forEach((item, i) => {
    const s = slots[i];
    if (!s || !s.img || !s.txt || !s.arrow) return;

    s.img.src = item.img;
    s.img.style.display = "block";
    s.txt.textContent = item.txt;
    s.arrow.style.display = "block";
  });
}

function aggiornaPallineRiepilogoMedia() {
  if (coppaSelezionata !== "MEDIA") return;

  const gusti = scelti.gusti || [];

  // 🔥 ORDINE CORRETTO: SINISTRA → DESTRA → ALTO
  const map = [
    { img: "gusto-left-img",  txt: "gusto-left-text" },
    { img: "gusto-right-img", txt: "gusto-right-text" },
    { img: "gusto-top-img",   txt: "gusto-top-text" }
  ];

  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    if (!img || !txt) return;

    const box = img.closest(".box-pallina");
    const arrow = box ? box.querySelector(".arrow") : null;

    if (gusti[i] && MAP_GUSTI_IMG[gusti[i]]) {
      img.src = MAP_GUSTI_IMG[gusti[i]];
      img.style.display = "block";
      txt.textContent = gusti[i];
      if (arrow) arrow.style.display = "block";
    } else {
      img.style.display = "none";
      txt.textContent = "";
      if (arrow) arrow.style.display = "none";
    }
  });

  // ===== GESTIONE PANNA =====
  const wrapper = document.querySelector(".media-coppa");
  if (!wrapper) return;

  // reset
  wrapper.classList.remove("single-gusto", "double-gusto");

  // 1 gusto → pallina centrata + panna più alta
  if (scelti.gusti.length === 1) {
    wrapper.classList.add("single-gusto");
  }

  // 2 gusti → panna che scende un po'
  else if (scelti.gusti.length === 2) {
    wrapper.classList.add("double-gusto");
  }
}

function aggiornaExtraCompattiGrande() {
  if (coppaSelezionata !== "GRANDE") return;

  // SLOT VISIVI REALI (da sinistra a destra)
const slots = [
  { img: byId("granella-1-img"), txt: byId("granella-1-text"), arrow: byId("granella-1-text")?.closest(".arrow") },
  { img: byId("granella-2-img"), txt: byId("granella-2-text"), arrow: byId("granella-2-text")?.closest(".arrow") },
  { img: byId("topping-1-img"),  txt: byId("topping-1-text"),  arrow: byId("topping-1-text")?.closest(".arrow") },
  { img: byId("topping-2-img"),  txt: byId("topping-2-text"),  arrow: byId("topping-2-text")?.closest(".arrow") },
  { img: byId("frutta-1-img"),   txt: byId("frutta-1-text"),   arrow: byId("frutta-1-text")?.closest(".arrow") },
  { img: byId("frutta-2-img"),   txt: byId("frutta-2-text"),   arrow: byId("frutta-2-text")?.closest(".arrow") },
];

  // 🔄 RESET TOTALE
  slots.forEach(s => {
    if (s.img)   s.img.style.display = "none";
    if (s.txt)   s.txt.textContent = "";
    if (s.arrow) s.arrow.style.display = "none";
  });

  // 📦 LISTA COMPATTA IN ORDINE LOGICO
  const items = [];

  (scelti.granelle || []).forEach(n => {
    if (MAP_GRANELLE_IMG[n]) {
      items.push({ img: MAP_GRANELLE_IMG[n], txt: n });
    }
  });

  (scelti.topping || []).forEach(n => {
    if (MAP_TOPPING_IMG[n]) {
      items.push({ img: MAP_TOPPING_IMG[n], txt: n });
    }
  });

  (scelti.ingredienti || []).forEach(n => {
    if (MAP_INGREDIENTI_IMG[n]) {
      items.push({ img: MAP_INGREDIENTI_IMG[n], txt: n });
    }
  });

  // 🧠 RIEMPI DA SINISTRA → ZERO BUCHI
  items.forEach((item, i) => {
    const s = slots[i];
    if (!s || !s.img || !s.txt || !s.arrow) return;

    s.img.src = item.img;
    s.img.style.display = "block";
    s.txt.textContent = item.txt;
    s.arrow.style.display = "block";
  });
}

function aggiornaPallineRiepilogoGrande() {
  if (coppaSelezionata !== "GRANDE") return;

  const gusti = scelti.gusti || [];

  // 🔥 ORDINE BASE: SINISTRA → BASSO → DESTRA → ALTO
  const map = [
    { img: "gusto-left-img",   txt: "gusto-left-text" },
    { img: "gusto-bottom-img", txt: "gusto-bottom-text" },
    { img: "gusto-right-img",  txt: "gusto-right-text" },
    { img: "gusto-top-img",    txt: "gusto-top-text" }
  ];

  // =========================
  // RESET / RENDER BASE
  // =========================
  map.forEach((slot) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    if (!img || !txt) return;

    const box = img.closest(".box-pallina");
    const arrow = box ? box.querySelector(".arrow") : null;

    img.style.display = "none";
    txt.textContent = "";
    if (arrow) arrow.style.display = "none";
  });

  const wrapper = document.querySelector(".grande-wrapper");
  if (!wrapper) return;

  wrapper.classList.remove("single-gusto", "double-gusto", "triple-gusto");

  // =========================
  // 🔥 1 GUSTO → SOLO BASSO
  // =========================
  if (gusti.length === 1) {
    wrapper.classList.add("single-gusto");

    const img = document.getElementById("gusto-bottom-img");
    const txt = document.getElementById("gusto-bottom-text");
    const arrow = img?.closest(".box-pallina")?.querySelector(".arrow");

    if (img && txt) {
      img.src = MAP_GUSTI_IMG[gusti[0]];
      img.style.display = "block";
      txt.textContent = gusti[0];
      if (arrow) arrow.style.display = "block";
    }

    return;
  }

  // =========================
  // 🔥 2 GUSTI → SINISTRA + DESTRA
  // =========================
  if (gusti.length === 2) {
    wrapper.classList.add("double-gusto");

    const leftImg  = document.getElementById("gusto-left-img");
    const leftTxt  = document.getElementById("gusto-left-text");
    const rightImg = document.getElementById("gusto-right-img");
    const rightTxt = document.getElementById("gusto-right-text");

    const leftArrow  = leftImg?.closest(".box-pallina")?.querySelector(".arrow");
    const rightArrow = rightImg?.closest(".box-pallina")?.querySelector(".arrow");

    if (leftImg && leftTxt) {
      leftImg.src = MAP_GUSTI_IMG[gusti[0]];
      leftImg.style.display = "block";
      leftTxt.textContent = gusti[0];
      if (leftArrow) leftArrow.style.display = "block";
    }

    if (rightImg && rightTxt) {
      rightImg.src = MAP_GUSTI_IMG[gusti[1]];
      rightImg.style.display = "block";
      rightTxt.textContent = gusti[1];
      if (rightArrow) rightArrow.style.display = "block";
    }

    return;
  }

  // =========================
  // 🔥 3 GUSTI → ORDINE NORMALE + PANNA PIÙ BASSA
  // =========================
  if (gusti.length === 3) {
    wrapper.classList.add("triple-gusto");
  }

  // =========================
  // 🔥 3–4 GUSTI → ORDINE NORMALE
  // =========================
  map.forEach((slot, i) => {
    const img = document.getElementById(slot.img);
    const txt = document.getElementById(slot.txt);
    if (!img || !txt) return;

    const box = img.closest(".box-pallina");
    const arrow = box ? box.querySelector(".arrow") : null;

    if (gusti[i] && MAP_GUSTI_IMG[gusti[i]]) {
      img.src = MAP_GUSTI_IMG[gusti[i]];
      img.style.display = "block";
      txt.textContent = gusti[i];
      if (arrow) arrow.style.display = "block";
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
  const slots = document.querySelectorAll("#extra-stage .extra-slot");
  if (!slots.length) return;

  // reset TUTTI gli slot
  slots.forEach(slot => {
    slot.querySelector(".extra-img").innerHTML = "";
    slot.querySelector(".extra-text").textContent = "";
  });

  const extra = scelti.extra || [];
  if (extra.length === 0) return;

  // mappa slot da usare
const slotIndex = [0, 1, 2];

  slotIndex.forEach((slotPos, i) => {
    const nome = extra[i];
    if (!nome) return;
    const slot = slots[slotPos];
    if (!slot) return;

    const imgBox = slot.querySelector(".extra-img");
    const txtBox = slot.querySelector(".extra-text");

    // TEST: immagini che già hai
if (MAP_EXTRA_IMG[nome]) {
  const img = document.createElement("img");
  img.src = MAP_EXTRA_IMG[nome];
  img.classList.add("extra-img-el"); // 🔥 FONDAMENTALE
  imgBox.appendChild(img);
  txtBox.textContent = nome;
}
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
  "LIQUORE AMARETTO","LIQUORE AL CAFFE'","LIQUORE AL COCCO","SCIROPPO AMARENA","JOGURT NATURALE","VOV","CAFFÈ ESPRESSO","CAFFÈ DECAFFEINATO","ORZO","GINSENG","CAFFÈ FREDDO","CIOCCOLATO FREDDO","DISARONNO","BAILEYS","COINTREAU","GRAND MARNIER","JACK DANIEL'S","LIMONCELLO","RUM","STRAVECCHIO","VECCHIA ROMAGNA","VODKA"
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
  "MIX BOSCO","MELA","PESCA","UVA","FRUTTI DI BOSCO","AMARETTI","MANDORLE","NOCCIOLINE","NOCI","UVETTA",
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

function showIslandAvvisoGusti(mancanti) {
  const island = byId("dynamic-island");
  const title = byId("island-title");
  const added = byId("island-added");
  const bar = byId("island-bar");

  if (!island || !title) return;

  // 🧠 testo corretto singolare/plurale
  title.textContent =
    mancanti === 1
      ? "Seleziona ancora 1 gusto"
      : `Seleziona ancora ${mancanti} gusti`;

  // ❌ niente “aggiunto”
  if (added) added.textContent = "";


  // 👀 mostra la island
  island.classList.add("show");

  // ⏱️ si richiude da sola
  clearTimeout(window.__islandTimer);
  window.__islandTimer = setTimeout(() => {
    island.classList.remove("show");
  }, 2000);
}

// ---------------- FORMATO ----------------
function showSizeScreen(){
  document.body.classList.remove("step-riepilogo");
  const header = document.querySelector("header");
if (header) {
  header.style.display = "none";
}

  // 🔥 RESET COMPLETO PER NUOVA COPPA
  coppaSalvata = false;          // ← FONDAMENTALE
  step = "size";

  byId("step-size").style.display = "block";
  byId("step-container").style.display = "none";
// 🔥 NASCONDI SEMPRE IL TITOLO QUANDO TORNI AI FORMATI
const title = document.getElementById("step-title");
if (title) {
  title.classList.add("hidden");
}
  updateRiepilogo();
}

function selectSize(size, g, gr, t, ing){

  // 🔥 RIATTIVA MINI RIEPILOGO DOPO "CREA UN'ALTRA"
  const el = document.getElementById("riepilogo-mini");
  if (el) {
    el.classList.remove("hidden");
    el.style.pointerEvents = "auto";
    el.style.display = "block";
  }

  document.body.classList.remove("step-size");

  const header = document.querySelector("header");
  if (header) header.style.display = "none";

  coppaSelezionata = size;
  titoloGustiVisibile = true;

  max = { gusti:g, granelle:gr, topping:t, ingredienti:ing, extra:Infinity };
  scelti = { gusti:[], granelle:[], topping:[], ingredienti:[], extra:[] };

  // 🔥 reset gusti
  gustiQuantities = {};
  gustiList.forEach(gusto => gustiQuantities[gusto] = 0);
  gustoInModifica = null;

// 🔥 cambio step
step = "gusti";
titoloGustiVisibile = true;


byId("step-size").style.display = "none";
byId("step-container").style.display = "block";

nascondiBottomNav();
renderStepGusti();
updateRiepilogo();

  // mini riepilogo chiuso ma cliccabile
  if (el && el.dataset.mini) {
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
        // Limite raggiunto → errore
        if (totalePrima >= maxTot) {
            limitEffect("gusti", nome);
            return;
        }

        gustiQuantities[nome] = 1;
        rebuildSceltiGustiFromQuantities();

        // 🔥 NASCONDE IL TITOLO SOLO AL PRIMO GUSTO
        titoloGustiVisibile = false;
      

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

function totaleGustiSelezionati() {
  return Object.values(gustiQuantities || {})
    .reduce((sum, q) => sum + q, 0);
}

// === RENDER GUSTI CON QUANTITÀ E BOTTONI + / − ===
function renderStepGusti() {
const title = document.getElementById("step-title");
if (title) {
  title.textContent = "Gusti";

  if (titoloGustiVisibile) {
    title.classList.remove("hidden");
  } else {
    title.classList.add("hidden");
  }
}
    const cont = byId("step-container");
    if (!cont) return;

    const maxTot = max.gusti || 0;
    const totale = Object.values(gustiQuantities).reduce((a, b) => a + b, 0);
// 🔒 BLOCCO AVANTI SE NON HAI ESATTAMENTE max gusti
const gustiCompleti = totale === maxTot;
    updateStatusGusti();

    let html = `
        <div class="ingredienti-lista">
    `;
 const isStepCompleted = totale === maxTot;
    gustiList.forEach(nome => {
      // 🚫 Controllo allergeni
const allergeniGusto = ALLERGENI_GUSTI[nome] || [];
const gustoVietato = allergeniGusto.some(a => allergeniCliente.includes(a));
      // 🚫 Controllo disponibilità
const disponibile = DISPONIBILITA["Gusti"]?.[nome] !== false;
        const qty = gustiQuantities[nome] || 0;
       const isSelected = qty > 0;
const isConfirmed = isSelected && isStepCompleted;
const isPending = isSelected && !isStepCompleted;

const showControls = isSelected || gustoInModifica === nome;

        let cls = "item gusto-item";
if (!disponibile) cls += " gusto-disabled";
if (isPending) cls += " gusto-pending";       // 🟡
if (isConfirmed) cls += " gusto-confirmed";   // 🟢
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
    <button class="back-btn" onclick="prevStep()">Indietro</button>

    <button
<button class="next-btn" onclick="nextStep()">
  Avanti
</button>
</div>
    `;

    cont.innerHTML = html;

    setTimeout(() => {
        stabilizeMiniRiepilogo();
    }, 10);
}

function showStepTitle(text) {
  const title = document.getElementById("step-title");
  if (!title) return;

  if (text) title.textContent = text;

  title.classList.remove("hidden");
}

function hideStepTitle() {
    const title = document.getElementById("step-title");
    if (title) {
        title.classList.add("hidden");
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
        }, 5000);
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

  if (step === "gusti")        title.textContent = "Gusti";
  else if (step === "granelle")title.textContent = "Granelle";
  else if (step === "topping") title.textContent = "Topping";
  else if (step === "ingredienti") title.textContent = "Ingredienti";
  else if (step === "extra")   title.textContent = "Extra";
  else                         title.textContent = "";

  if (titoloGustiVisibile) {
    title.classList.remove("hidden");
  } else {
    title.classList.add("hidden");
  }
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
        ${step === "extra" ? "Conferma" : "Avanti ➜"}
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

    // shake (senza aprire)
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
    // 🚫 se siamo al limite → NON nascondere titolo
    if (scelti[step].length >= max[step]) {
      limitEffect(step, nome);
      return;
    }

  scelti[step].push(nome);

// 🔥 NASCONDI TITOLO DELLO STEP CORRENTE
titoloGustiVisibile = false;
hideStepTitle();
  }

  showIsland(step, nome);
  render();
  updateRiepilogo();
  stabilizeMiniRiepilogo();

  const currentCount = scelti[step].length;
  const maxCount = max[step];

  // ❌ QUI se vuoi non aprirlo più al raggiungimento max, commenta questa parte:
  // if (maxCount && currentCount === maxCount) openMiniRiepilogoTemporaneo();

  // shake
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

  /* =========================
     🍨 BLOCCO GUSTI OBBLIGATORI
  ========================= */
  if (step === "gusti") {
    const tot = Object.values(gustiQuantities).reduce((a, b) => a + b, 0);

    if (tot < max.gusti) {
      const mancanti = max.gusti - tot;
      showIslandAvvisoGusti(mancanti);
      return;
    }
  }

  /* =========================
     ▶️ STEP EXTRA → APRI MINI
  ========================= */
  if (step === "extra") {
    const el = document.getElementById("riepilogo-mini");

    // PRIMO CLICK → apre mini riepilogo
    if (el && !el.classList.contains("open")) {
      el.classList.remove("collapsed");
      el.classList.add("open");
      el.innerHTML = el.dataset.full || "";
 blurBackground();
      if (collapseTimer) clearTimeout(collapseTimer);
      collapseTimer = null;

      step = "riepilogo-mini-open";
      return;
    }
  }

  /* =========================
     🟡 MINI RIEPILOGO APERTO
     → POPUP → RIEPILOGO
  ========================= */
if (step === "riepilogo-mini-open") {

  // 🔥 PRELOAD SUBITO (mentre il popup è visibile)
  preloadCoppaImages();

  // 🔔 POPUP SE NECESSARIO
  if (shouldShowPreRiepilogoPopup()) {
    mostraPopupPreRiepilogo(() => {
      preparaRiepilogoFinale(); // popup → loading → riepilogo
    });
    return; // ⛔ STOP TOTALE QUI
  }

  // 🚀 se popup NON serve
  preparaRiepilogoFinale();
  return;
}

  /* =========================
     ➜ AVANZAMENTO NORMALE
  ========================= */
  if (step === "gusti") step = "granelle";
  else if (step === "granelle") step = "topping";
  else if (step === "topping") step = "ingredienti";
  else if (step === "ingredienti") step = "extra";

  titoloGustiVisibile = true;
  render();
  updateRiepilogo();
}

function nextStepFromMini() {

  // 1️⃣ chiudo il mini riepilogo
  const el = document.getElementById("riepilogo-mini");
  if (el) {
    el.classList.add("collapsed");
    el.classList.remove("open");
    el.innerHTML = el.dataset.mini || "";
  }

  // 🔥 FIX FONDAMENTALE → rimuove SEMPRE il blur
  if (typeof unblurBackground === "function") {
    unblurBackground();
  }

  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }

  const stepDiPartenza = step;

  // ✅ SOLO SE ARRIVO DA EXTRA → popup + loading
  if (stepDiPartenza === "extra") {

    if (typeof preloadCoppaImages === "function") {
      preloadCoppaImages();
    }

    if (shouldShowPreRiepilogoPopup()) {
      mostraPopupPreRiepilogo(() => {
        preparaRiepilogoFinale();
      });
      return;
    }

    preparaRiepilogoFinale();
    return;
  }

  // ✅ TUTTI GLI ALTRI STEP → avanti normale
  nextStep();
}

function prevStep(){

  // 🔥 chiudi sempre il mini riepilogo se aperto
  const el = document.getElementById("riepilogo-mini");
  if (el && el.classList.contains("open")) {
    el.classList.add("collapsed");
    el.classList.remove("open");
    el.innerHTML = el.dataset.mini || "";
  }

  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }

  // ✅ FIX CRITICO: dal mini-riepilogo torni a EXTRA
  if (step === "riepilogo-mini-open") {
    step = "extra";
    titoloGustiVisibile = true;
    render();
    updateRiepilogo();
    return;
  }

  // ✅ CASO RIEPILOGO FINALE
  if (step === "riepilogo") {
    step = "extra";
    titoloGustiVisibile = true;
    render();
    updateRiepilogo();
    return;
  }

  if (step === "gusti") {
    showSizeScreen();
    return;
  }

  if (step === "granelle") step = "gusti";
  else if (step === "topping") step = "granelle";
  else if (step === "ingredienti") step = "topping";
  else if (step === "extra") step = "ingredienti";

  titoloGustiVisibile = true;
  render();
  updateRiepilogo();
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
}, 5000);
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

<div class="grande-coppa">
  <!-- PANNA -->
  <div class="box box-panna">
    <img src="img/panna.png"crossorigin="anonymous">
  </div>

  <!-- PALLINE -->
  <div class="box-palline">

<div class="box box-pallina pallina-top">
  <div class="arrow arrow-top">
    <div
      class="arrow-text top gusto-text gusto-top-text"
      id="gusto-top-text"
    ></div>

    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: scaleY(-1) rotate(-10deg);
                transform-origin: center;">
      <path d="M30 15 C16 14, -6 18, -27 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>

  <img
    id="gusto-top-img"
    src="img/pallina-vaniglia.png"
    crossorigin="anonymous"
  >
</div>

    <div class="box box-pallina pallina-left">
      <div class="arrow" style="left:-38px; top:40%; transform:translate(-30px, -50%);">
        <svg width="50" height="30" viewBox="0 0 50 30">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
        <div class="arrow-text left gusto-text" id="gusto-left-text">Gusto</div>
      </div>
      <img id="gusto-left-img" src="img/pallina-fragola.png"crossorigin="anonymous">
    </div>

    <div class="box box-pallina pallina-right">
      <div class="arrow" style="right:-62px; top:50%; transform:translateY(-50%);">
        <div class="arrow-text right gusto-text" id="gusto-right-text">Gusto</div>
        <svg width="50" height="30" viewBox="0 0 50 30"
             style="transform: rotate(180deg) translateY(-14px);">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
      </div>
      <img id="gusto-right-img" src="img/pallina-cioccolato.png"crossorigin="anonymous">
    </div>

<div class="box box-pallina pallina-bottom">
  <div class="arrow"
       style="left:130px; top:-10%; transform:translateY(0);">
        <div class="arrow-text bottom gusto-text" id="gusto-bottom-text">Gusto</div>
 <svg width="50" height="30" viewBox="0 0 50 30"
     style="transform: scaleX(-1) scaleY(-1) rotate(-10deg);
            transform-origin: center;">
      <path d="M30 15 C16 14, -6 18, -27 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>

  <img id="gusto-bottom-img" src="img/pallina-pistacchio.png"crossorigin="anonymous">
</div>

  </div>

  <!-- COPPA -->
  <div class="box box-coppa">
    <img src="img/coppa-base.png"crossorigin="anonymous">
  </div>
  </div>

 <div class="grande-extras">
  <!-- GRANELLE -->
<div class="box box-extra granella-1">
  <img id="granella-1-img"crossorigin="anonymous">

  <div class="arrow" id="granella-1-arrow"
       style="top:-52px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text top granella-text" id="granella-1-text"></div>

    <svg width="50" height="30" viewBox="0 0 50 30"
         style="transform: rotate(90deg);">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>

  </div>
</div>

<div class="box box-extra granella-2">
  <img id="granella-2-img"crossorigin="anonymous">

  <div class="arrow" id="granella-2-arrow"
       style="top:-52px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text top granella-text" id="granella-2-text"></div>

    <svg width="50" height="55" viewBox="0 0 50 55">
      <!-- asta -->
      <path d="M25 0 L25 38"
            fill="none"
            stroke="#000"
            stroke-width="3"
            stroke-linecap="round" />

      <!-- punta -->
      <path d="M25 38 L20 32 M25 38 L30 32"
            fill="none"
            stroke="#000"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round" />
    </svg>

  </div>
</div>

  <!-- TOPPING -->
<div class="box box-extra topping-1">
  <img id="topping-1-img" src="img/topping-bosco.png"crossorigin="anonymous">

  <div class="arrow"
       style="top:-50px; left:50%; transform:translateX(-50%);">
    <div class="arrow-text top topping-text" id="topping-1-text">Topping</div>
   <svg width="50" height="30" viewBox="0 0 50 30"
     style="
       transform: rotate(90deg) scaleY(-1);
       transform-box: fill-box;
       transform-origin: center;
     ">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>
  </div>
</div>

<!-- TOPPING 2 -->
<div class="box box-extra topping-2">
  <img id="topping-2-img"crossorigin="anonymous">

  <div class="arrow" id="topping-2-arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text bottom topping-text" id="topping-2-text"></div>

    <svg width="50" height="30" viewBox="0 0 50 30"
         style="
           transform: rotate(-90deg) scaleY(-1);
           transform-box: fill-box;
           transform-origin: center;
         ">
      <path d="M30 15 C16 14, -6 18, -12 38"/>
      <path d="M38 15 L30 11 M38 15 L30 19"/>
    </svg>

  </div>
</div>

  <!-- FRUTTA -->
<div class="box box-extra frutta-1">
  <img id="frutta-1-img" src="img/fragola.png"crossorigin="anonymous">

  <div class="arrow"
       style="bottom:-52px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text bottom frutta-text" id="frutta-1-text">Frutta</div>

    <!-- FRECCIA DRITTA VERSO L'ALTO -->
    <svg width="50" height="55" viewBox="0 0 50 55">
      <!-- asta -->
      <path d="M25 55 L25 17"
            fill="none"
            stroke="#000"
            stroke-width="3"
            stroke-linecap="round" />

      <!-- punta -->
      <path d="M25 17 L20 23 M25 17 L30 23"
            fill="none"
            stroke="#000"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round" />
    </svg>

  </div>
</div>


<div class="box box-extra frutta-2">
  <img id="frutta-2-img" src="img/fragola.png"crossorigin="anonymous">

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
<div class="media-wrapper">
<div class="media-coppa">

  <!-- PANNA -->
  <div class="box box-panna">
    <img src="img/panna.png"crossorigin="anonymous">
  </div>

  <!-- PALLINE -->
  <div class="box-palline">

    <!-- PALLINA IN ALTO -->
    <div class="box box-pallina pallina-top">
      <div class="arrow"
           style="left:-80px; top:15%; transform:translateY(-50%);">
        <div class="arrow-text top gusto-top-text" id="gusto-top-text"></div>
<svg width="50" height="30" viewBox="0 0 50 30"
     style="transform: scaleY(-1) rotate(-15deg);
            transform-origin: center;">
  <path d="M30 15 C16 14, -6 18, -27 38"/>
  <path d="M38 15 L30 11 M38 15 L30 19"/>
</svg>
      </div>
      <img id="gusto-top-img"crossorigin="anonymous">
    </div>


    <!-- PALLINA SINISTRA -->
    <div class="box box-pallina pallina-left">
<div class="arrow"
     style="transform:translateY(-50%);">
        <svg width="50" height="30" viewBox="0 0 50 30">
          <path d="M30 15 C16 14, -6 18, -12 38"/>
          <path d="M38 15 L30 11 M38 15 L30 19"/>
        </svg>
        <div class="arrow-text left" id="gusto-left-text"></div>
      </div>
      <img id="gusto-left-img"crossorigin="anonymous">
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
      <img id="gusto-right-img"crossorigin="anonymous">
    </div>

  </div>

  <!-- COPPA -->
  <div class="box box-coppa">
    <img src="img/coppa-base.png"crossorigin="anonymous">
  </div>

</div>

<div class="media-extras">

  <!-- GRANELLA 1 -->
  <div class="box box-extra granella-1">
    <img id="granella-1-img"crossorigin="anonymous">
    <div class="arrow" id="granella-1-arrow"
     style="top:-52px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text top granella-text" id="granella-1-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform: rotate(90deg);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

  <!-- GRANELLA 2 -->
  <div class="box box-extra granella-2">
    <img id="granella-2-img"crossorigin="anonymous">
    <div class="arrow" id="granella-2-arrow"
         style="top:-52px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text top granella-text" id="granella-2-text"></div>
<svg width="50" height="55" viewBox="0 0 50 55">
  <!-- asta dritta -->
  <path d="M25 0 L25 38"
        fill="none"
        stroke="#000"
        stroke-width="3"
        stroke-linecap="round" />

  <!-- PUNTA DRITTA E SIMMETRICA -->
  <path d="M25 38 L20 32 M25 38 L30 32"
        fill="none"
        stroke="#000"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round" />
</svg>
    </div>
  </div>

  <!-- TOPPING 1 -->
  <div class="box box-extra topping-1">
    <img id="topping-1-img"crossorigin="anonymous">
    <div class="arrow" id="topping-1-arrow"
         style="top:-50px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text top topping-text" id="topping-1-text"></div>
<svg width="50" height="30" viewBox="0 0 50 30"
     style="
       transform: rotate(90deg) scaleY(-1);
       transform-box: fill-box;
       transform-origin: center;
     ">
  <path d="M30 15 C16 14, -6 18, -12 38"/>
  <path d="M38 15 L30 11 M38 15 L30 19"/>
</svg>
    </div>
  </div>

  <!-- TOPPING 2 -->
  <div class="box box-extra topping-2">
    <img id="topping-2-img"crossorigin="anonymous">
    <div class="arrow" id="topping-2-arrow"
         style="bottom:-52px; left:50%; transform:translateX(-50%);">
      <div class="arrow-text bottom topping-text" id="topping-2-text"></div>
      <svg width="50" height="30" viewBox="0 0 50 30"
           style="transform: rotate(-90deg) scaleY(-1);">
        <path d="M30 15 C16 14, -6 18, -12 38"/>
        <path d="M38 15 L30 11 M38 15 L30 19"/>
      </svg>
    </div>
  </div>

  <!-- FRUTTA -->
  <div class="box box-extra box-frutta">
    <img id="frutta-1-img"crossorigin="anonymous">
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
  <div class="extra-slot">
    <div class="extra-img"></div>
    <div class="extra-text"></div>
  </div>
  <div class="extra-slot">
    <div class="extra-img"></div>
    <div class="extra-text"></div>
  </div>
  <div class="extra-slot">
    <div class="extra-img"></div>
    <div class="extra-text"></div>
  </div>
</div>
</div>

  `;
}

async function captureCoppaImage() {
  const stage = document.getElementById("coppa-stage");
  if (!stage) return null;

  // html2canvas è già incluso nella pagina
  if (typeof html2canvas !== "function") return null;

  const canvas = await html2canvas(stage, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  });

  return canvas.toDataURL("image/png");
}

function posizionaInstagramButton() {
  const btn = document.querySelector(".share-instagram");
  const wrapper = document.getElementById("coppa-wrapper");
  if (!btn || !wrapper) return;

  // 🎯 coppa reale (box visivo)
  const coppa =
    wrapper.querySelector(".piccola-coppa") ||
    wrapper.querySelector(".media-coppa") ||
    wrapper.querySelector(".grande-coppa");

  if (!coppa) return;

  const coppaRect = coppa.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  // 🔧 OFFSET come WhatsApp nello scontrino
  const OFFSET = 12; // puoi portarlo a 16 se vuoi identico

  // 📍 TOP-RIGHT INTERNO ALLA COPPA
  btn.style.top =
    (coppaRect.top - wrapperRect.top + OFFSET) + "px";

  btn.style.left =
    (coppaRect.left - wrapperRect.left + coppaRect.width - btn.offsetWidth - OFFSET) + "px";
}

async function mostraRiepilogo(){

  console.log("🚀 mostraRiepilogo CHIAMATA");

  step = "riepilogo";
  document.body.classList.add("step-riepilogo");

  // 🔥 CHIUDI IMMEDIATAMENTE MINI RIEPILOGO
  const mini = document.getElementById("riepilogo-mini");
  if (mini) {
    mini.classList.add("collapsed");
    mini.classList.remove("open");
    mini.innerHTML = mini.dataset.mini || "";
  }

  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }

  // 🔥 DISTRUGGE QUALSIASI TITOLO RESIDUO
  const title = document.getElementById("step-title");
  if (title) {
    title.textContent = "";
    title.classList.add("hidden");
  }

  const header = document.querySelector("header");
  if (header) {
    header.style.display = "none";
  }

  if (coppaSalvata) {
    console.log("⛔ Coppa già salvata");
    return;
  }

  coppaSalvata = true;

  const area = byId("step-container");


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
const isLogged =
  localStorage.getItem("userLogged") === "1" &&
  !!localStorage.getItem("user_email");

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
  console.log("🖼️ coppaImgBase64 =", window.coppaImgBase64);
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
console.log("📌 PRIMA DI salvaCoppaSupabase");


console.log("📌 DOPO salvaCoppaSupabase");
 // 🔥 Evita duplicazioni: salva la coppa solo se non esiste già
 /*
if (!cronologiaArr.some(x => x.data === coppa.data)) {
    cronologiaArr.unshift(coppa);
    localStorage.setItem("cronologiaCoppe", JSON.stringify(cronologiaArr));
}
    */
console.log("📌 SALVATAGGIO COPPA IN LOCALE:", coppa);

  // ✅ 7) Riepilogo grafico (come prima)
area.innerHTML = `
<div class="riepilogo-header">
  <h2 class="riepilogo-title">Ecco la tua coppa! 🍨 </h2>

<p class="riepilogo-subtitle" style="
  font-size: 14px;
  font-weight: 700;
  color: #111;
  margin-top: 6px;
  text-align: center;
"> 
  ↓ Scorri fino in fondo per comunicarla al cameriere! ↓
</p>


<button
  class="next-btn riepilogo-registrati"
  onclick="onApriRegistrazione(); apriRegistrazione();"
>
  Registrati
</button>



<!-- 🍨 COPPA GRAFICA -->

<div id="coppa-wrapper" style="
  margin-top: 24px;
  display: flex;
  justify-content: center;
">
  <div id="coppa-stage"></div>
</div>


<div class="scontrino" id="scontrino-da-share">
  <!-- 📲 WHATSAPP TOP RIGHT -->
<button
  class="share-whatsapp-top"
  onclick="shareWhatsApp()"
  aria-label="Condividi su WhatsApp"
>
<svg
  class="share-icon"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <!-- FRECCIA -->
  <path
    d="M12 3v10"
    stroke="currentColor"
    stroke-width="2.4"
    stroke-linecap="round"
  />
  <path
    d="M8.5 6.5L12 3l3.5 3.5"
    stroke="currentColor"
    stroke-width="2.4"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- BOX -->
  <path
    d="M5 11.5v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
    stroke="currentColor"
    stroke-width="2.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>

</button>
  <p><b>Formato:</b> ${coppaSelezionata} — €${prezzoBase.toFixed(2)}</p>

<p>
  <b>Gusti:</b>
  ${(() => {
    const grouped = {};
    Object.entries(gustiQuantities).forEach(([nome, qty]) => {
      if (qty > 0) grouped[nome] = qty;
    });

    if (Object.keys(grouped).length === 0) return "-";

    return Object.entries(grouped)
      .map(([nome, qty]) => qty === 1 ? nome : `${nome} x${qty}`)
      .join(", ");
  })()}
</p>

  <p><b>Granelle:</b> ${safeJoin(scelti.granelle)}</p>
  <p><b>Topping:</b> ${safeJoin(scelti.topping)}</p>
  <p><b>Ingredienti:</b> ${safeJoin(scelti.ingredienti)}</p>

  <p><b>Extra:</b> 
    ${
      prezzoExtraDettaglio.length
      ? prezzoExtraDettaglio.map(x =>
  `${x.nome} <span class="extra-price">(+€${x.prezzo.toFixed(2)})</span>`
).join(", ")
      : "-"
    }
  </p>

<hr>

<div class="riepilogo-totale-row">
  <div class="totale-prezzo">
    <b>Totale:</b> €${totale.toFixed(2)}
  </div>

  <button class="back-btn" onclick="showSizeScreen()">➕ Crea un'altra</button>
</div>
<div class="riepilogo-cart-row">
  <button class="next-btn add-cart-inline" onclick="aggiungiAlCarrello()">
    Aggiungi al carrello
  </button>
</div>
</div> <!-- 🔴 CHIUDE .scontrino -->

<div id="qr-wrapper" style="
    margin-top:24px;
    display:flex;
    flex-direction:column;
    align-items:center;
    text-align:center;
">
<p id="qr-status-text" style="
  font-size:15px;
  font-weight:600;
  margin-bottom:10px;
">
  ${isLogged
    ? "Mostra il QR code per confermare la coppa"
    : "Registrati e accedi per mostrare il QR code"}
</p>

<div class="qr-container">
  <div id="qr-code"
       class="${isLogged ? "" : "qr-locked"}"
       data-token="${qrToken}">
  </div>

  ${!isLogged ? `
    <div class="qr-overlay">
      <div class="qr-lock">
        🔒
        <div class="qr-lock-text">Accesso richiesto</div>
      </div>
    </div>
  ` : ""}
</div>

<div class="qr-actions">
  <button class="next-btn instagram-btn" onclick="condividiSuInstagram()">
    📸 Instagram
  </button>
</div>

`;
// 🔒 Nascondi "Registrati" se l'utente è già loggato
if (
  localStorage.getItem("userLogged") === "1" &&
  localStorage.getItem("user_email")
) {
  document.querySelector(".riepilogo-registrati")?.remove();
}

const stage = document.getElementById("coppa-stage");
if (!stage) return;

// reset classi
document.body.classList.remove("coppa-media", "coppa-grande");

// QUI decidi il formato
if (coppaSelezionata === "PICCOLA") {

  stage.innerHTML = `
  <div class="piccola-wrapper">
<div class="piccola-coppa">
<div class="piccola-coppa-core">
  <!-- PANNA -->
  <div class="box box-panna">
    <img src="img/panna.png"crossorigin="anonymous">
    <div class="label">Panna</div>
  </div>

  <!-- PALLINE -->
  <div class="box-palline">

    <!-- Pallina sinistra -->
    <div class="box box-pallina pallina-1">
     <img id="gusto-left-img" src="img/pallina-vaniglia.png"crossorigin="anonymous">

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
      <img id="gusto-right-img" src="img/pallina-fragola.png"crossorigin="anonymous">

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
    <img src="img/coppa-base.png"crossorigin="anonymous">
    <div class="label">Coppa</div>
  </div>
</div>

  <div class="extra-row">
  <!-- GRANELLA -->
<div class="box box-extra box-granella">
  <img id="granella-img" src="img/granella-nocciola.png"crossorigin="anonymous">

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
  <img id="topping-img" src="img/topping-bosco.png"crossorigin="anonymous">

<div class="arrow"
     id="topping-arrow"
     style="top:-50px; left:50%; transform:translateX(-50%);">

    <div class="arrow-text top topping-text" id="topping-text">
      Topping
    </div>

<svg class="arrow-svg" width="50" height="55" viewBox="0 0 50 55">
  <!-- asta dritta -->
  <path d="M25 0 L25 38"
        fill="none"
        stroke="#000"
        stroke-width="3"
        stroke-linecap="round" />

  <!-- punta simmetrica -->
  <path d="M25 38 L20 32 M25 38 L30 32"
        fill="none"
        stroke="#000"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round" />
</svg>
  </div>
</div>

  <!-- FRUTTA -->
<div class="box box-extra box-frutta">
  <img id="frutta-img" src="img/fragola.png"crossorigin="anonymous">

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
aggiornaExtraCompattiPiccola();
}
if (coppaSelezionata === "PICCOLA") {
  aggiornaPallineRiepilogo();
  aggiornaExtraCompattiPiccola();

  const piccola = document.querySelector(".piccola-coppa");
  if (piccola) {
    piccola.classList.remove("single-gusto", "double-gusto");
    if (scelti.gusti.length === 1) piccola.classList.add("single-gusto");
    if (scelti.gusti.length === 2) piccola.classList.add("double-gusto");
  }
  posizionaInstagramButton();
}

if (coppaSelezionata === "MEDIA") {
aggiornaPallineRiepilogoMedia();
aggiornaExtraCompattiMedia();
}
if (coppaSelezionata === "MEDIA") {

  aggiornaPallineRiepilogoMedia();
  aggiornaExtraCompattiMedia();

  const mediaCoppa = document.querySelector(".media-coppa");
  if (!mediaCoppa) return;

  // reset classi
  mediaCoppa.classList.remove("single-gusto", "double-gusto");

  // 1 gusto
  if (scelti.gusti.length === 1) {
    mediaCoppa.classList.add("single-gusto");
  }

  // 2 gusti
  if (scelti.gusti.length === 2) {
    mediaCoppa.classList.add("double-gusto");
  }
}
posizionaInstagramButton();
if (coppaSelezionata === "GRANDE") {
  aggiornaPallineRiepilogoGrande();
  aggiornaExtraCompattiGrande(); // ✅ UNICA
  posizionaInstagramButton();
}

aggiornaExtraRiepilogo();
// ===============================
// 🖼️ SNAPSHOT COPPA (QUI ESATTO)
// ===============================
await waitNextPaint();

const coppaEl = document.getElementById("coppa-stage");
if (!coppaEl) {
  console.warn("❌ coppa-stage non trovato");
} else {

const canvas = await html2canvas(coppaEl, {
  backgroundColor: null,
  scale: 2,
  useCORS: true
});

coppa.coppa_img = canvas.toDataURL("image/png");
window.coppaCorrente = coppa;
// 🔥 ascolta conferma QR in realtime
ascoltaConfermaCoppaRealtime(coppa.qr_token);
// 🔍 DEBUG: verifica che ESISTA davvero
console.log(
  "🖼️ COPPA CATTURATA OK:",
  coppa.coppa_img.slice(0, 80)
);
// ✅ SOLO ORA salvi in cronologia (VERSIONE LEGGERA)
let cronologiaArr = JSON.parse(localStorage.getItem("cronologiaCoppe") || "[]");

// 🔥 copia SENZA immagine
const coppaForLocal = { ...coppa };
delete coppaForLocal.coppa_img;

if (!cronologiaArr.some(x => x.data === coppaForLocal.data)) {
  cronologiaArr.unshift(coppaForLocal);
  localStorage.setItem("cronologiaCoppe", JSON.stringify(cronologiaArr));
}
}
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
// ✅ SE LA COPPA È GIÀ STATA CONFERMATA (scan QR)
if (window.coppaCorrente?.confermata === true) {
  setCoppaConfermata();
}
  mostraBottomNav();
  updateRiepilogo();
  updateCarrelloBadge();
}

function waitNextPaint() {
  return new Promise(resolve => requestAnimationFrame(() => {
    requestAnimationFrame(resolve);
  }));
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

    // 🔹 recupera ultima coppa dalla cronologia
    const cronologia = JSON.parse(localStorage.getItem("cronologiaCoppe") || "[]");
    const ultima = cronologia[0];

    if (!ultima) {
        alert("Errore: impossibile aggiungere la coppa!");
        return;
    }

    // 🔹 carrello attuale
    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");

    // 🔹 nuova coppa
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

    // 🔍 verifica se esiste già
    const esistente = carrello.find(c => firmaCoppa(c) === firmaNuova);

    if (esistente) {
        esistente.quantita += 1;
    } else {
        nuovaCoppa.id = crypto.randomUUID();
        carrello.push(nuovaCoppa);
    }

    // 💾 salva carrello
    localStorage.setItem("carrelloCoppe", JSON.stringify(carrello));

    // ⏱️ imposta scadenza SOLO se non esiste
    if (!localStorage.getItem("carrello_scadenza")) {
        localStorage.setItem(
            "carrello_scadenza",
            Date.now() + 2 * 60 * 60 * 1000 // 2 ore
        );
    }

    // 🔔 UI
    updateBadgeNav();
    alert("🛒 Coppa aggiunta al carrello!");
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
  if (!scontrino) {
    alert("Errore: scontrino non trovato.");
    return;
  }

  html2canvas(scontrino, { scale: 3 })
    .then(canvas => {

      canvas.toBlob(blob => {
        const file = new File([blob], "coppa.png", { type: "image/png" });

        if (navigator.share) {
          navigator.share({
            files: [file],
            title: "Guarda la coppa che ho creato da Casa Del Gelato! 🍨"
          });
        } else {
          alert("Tieni premuto sull'immagine per condividerla.");
        }
      });

    })
    .catch(err => {
      console.error(err);
      alert("Errore durante la creazione dell'immagine.");
    });
}

function setLoadingDettaCoppa() {
  const txt = document.getElementById("loading-text");
  if (!txt) return;

  txt.textContent = "Nell’attesa puoi dettare la tua coppa al cameriere 👂🍨";
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

/* ===============================
   🍨 POPUP PRE-RIEPILOGO – LOGICA
=============================== */

function shouldShowPreRiepilogoPopup() {
  const hideUntil = localStorage.getItem("popup_pre_riepilogo_hide_until");
  if (!hideUntil) return true;

  return Date.now() > Number(hideUntil);
}

function mostraPopupPreRiepilogo(onContinue) {
  const popup = document.getElementById("popup-pre-riepilogo");
  if (!popup) {
    onContinue();
    return;
  }

  popup.style.display = "flex";

  const btn = popup.querySelector(".popup-continua");
  const checkbox = popup.querySelector("#popup-pre-no-more");

  btn.onclick = () => {
    popup.style.display = "none";

    // salva timestamp ultima visualizzazione
    localStorage.setItem(
      "popup_pre_riepilogo_last",
      Date.now()
    );

    // se spuntato → nascondi per 7 giorni
    if (checkbox && checkbox.checked) {
      localStorage.setItem(
        "popup_pre_riepilogo_hide_until",
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );
    }

    // 🔥 RIPARTE IL FLUSSO
    onContinue();
  };
}

function mostraLoadingRiepilogo() {
  const el = document.getElementById("loading-riepilogo");
  if (el) el.style.display = "flex";
}

function nascondiLoadingRiepilogo() {
  const el = document.getElementById("loading-riepilogo");
  if (el) el.style.display = "none";
}
function waitForImagesWithProgress(container, onProgress) {
  const imgs = Array.from(container.querySelectorAll("img"));
  const total = imgs.length;

  if (total === 0) {
    onProgress?.(100);
    return Promise.resolve();
  }

  let loaded = 0;

  return new Promise(resolve => {
    imgs.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        loaded++;
        onProgress(Math.round((loaded / total) * 100));
        if (loaded === total) resolve();
        return;
      }

      const done = () => {
        loaded++;
        onProgress(Math.round((loaded / total) * 100));
        if (loaded === total) resolve();
      };

      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  });
}
function avviaTimerNuvolettaInstagram() {
  const nuvola = document.getElementById("instagram-nuvola");
  if (!nuvola) return;

  nuvola.classList.remove("show"); // reset sicurezza

  setTimeout(() => {
    if (!window.registrazioneAperta) {
      nuvola.classList.add("show");
    }
  }, 20000);
}
function mostraMiniDuranteLoading() {
  const mini = document.getElementById("riepilogo-mini");
  if (!mini) return;

  // 🔥 FORZA stato APERTO
  mini.classList.remove("collapsed");
  mini.classList.add("open");

  // 🔥 FORZA contenuto COMPLETO
  if (mini.dataset.full) {
    mini.innerHTML = mini.dataset.full;
  }

  mini.style.display = "block";
  mini.style.opacity = "1";
  mini.style.pointerEvents = "auto";
}
function isLocalDev() {
  return location.hostname === "localhost" ||
         location.hostname === "127.0.0.1" ||
         location.protocol === "file:";
}


async function preparaRiepilogoFinale() {
resetBlurTotale();
  // 🔥 RIPRISTINA PAGINA (NO BLUR)
  document.body.classList.remove("blur-bg");

  const miniInit = document.getElementById("riepilogo-mini");
  if (miniInit) {
    miniInit.classList.add("collapsed");
    miniInit.classList.remove("open");
  }

  // 1️⃣ MOSTRA LOADING
  mostraLoadingRiepilogo();
  setLoadingText("Caricamento coppa…");
  setLoadingProgress(0);

  // ⏱️ FALLBACK: se il loading dura troppo → mostra mini riepilogo
  loadingFallbackTimer = setTimeout(() => {
    const loading = document.getElementById("loading-riepilogo");
    if (!loading || loading.style.display === "none") return;

    // 🔥 CAMBIA TESTO LOADING
    setLoadingDettaCoppa();

    const mini = document.getElementById("riepilogo-mini");
    if (!mini) return;

    if (mini.dataset.full) {
      mini.innerHTML = mini.dataset.full;
    }

    mini.style.display = "block";
    mini.classList.remove("collapsed");
    mini.classList.add("open");
    mini.style.pointerEvents = "auto";

    // ✅ SEGNA che è stato aperto SOLO per il loading
    mini.dataset.openedByLoading = "1";
  }, 10000);

  // lascia respirare la UI
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 100));

  // 2️⃣ CREA IL RIEPILOGO (HTML completo)
  await mostraRiepilogo();

  // 3️⃣ ASPETTA LE IMMAGINI (con barra reale)
  const stage = document.getElementById("coppa-stage");

  if (stage && !isLocalDev()) {
    // ✅ PRODUZIONE
    await waitForImagesWithProgress(stage, pct => {
      setLoadingProgress(pct);
      if (pct >= 75) setLoadingAlmostReady();
    });

    setLoadingProgress(100);
  } else {
    // 🧪 LOCALE
    setLoadingProgress(100);
  }

  // 4️⃣ MICRO-DELAY anti-flicker
  await new Promise(r => requestAnimationFrame(r));

  // 🧹 STOP fallback timer
  if (loadingFallbackTimer) {
    clearTimeout(loadingFallbackTimer);
    loadingFallbackTimer = null;
  }

  // 🔒 richiudi mini SOLO se era aperto per il loading
  const mini = document.getElementById("riepilogo-mini");
  if (mini && mini.dataset.openedByLoading === "1") {
    mini.classList.add("collapsed");
    mini.classList.remove("open");
    mini.dataset.openedByLoading = "";
  }

// 5️⃣ NASCONDI LOADING
resetBlurTotale();
nascondiLoadingRiepilogo();

  // 6️⃣ AVVIA TIMER NUVOLA
  avviaTimerNuvolettaInstagram();
}

function resetBlurTotale() {
  document.body.classList.remove("blur-bg");

  // sicurezza extra: rimuove blur forzato
  document.querySelectorAll("#step-container, header").forEach(el => {
    el.style.filter = "none";
    el.style.opacity = "1";
  });

  const overlay = document.getElementById("blur-overlay");
  if (overlay) overlay.style.display = "none";
}

function preloadCoppaImages() {
  const urls = new Set();

  // panna e coppa base (sempre)
  urls.add("img/panna.png");
  urls.add("img/coppa-base.png");

  // gusti
  (scelti.gusti || []).forEach(g => {
    if (MAP_GUSTI_IMG[g]) urls.add(MAP_GUSTI_IMG[g]);
  });

  // granelle
  (scelti.granelle || []).forEach(g => {
    if (MAP_GRANELLE_IMG[g]) urls.add(MAP_GRANELLE_IMG[g]);
  });

  // topping
  (scelti.topping || []).forEach(t => {
    if (MAP_TOPPING_IMG[t]) urls.add(MAP_TOPPING_IMG[t]);
  });

  // ingredienti
  (scelti.ingredienti || []).forEach(i => {
    if (MAP_INGREDIENTI_IMG[i]) urls.add(MAP_INGREDIENTI_IMG[i]);
  });

  // extra
  (scelti.extra || []).forEach(e => {
    if (MAP_EXTRA_IMG[e]) urls.add(MAP_EXTRA_IMG[e]);
  });

  // 🔥 preload reale
  urls.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  console.log("🧊 Preload coppa immagini:", urls.size);
}
// ⬇️ FINE FILE — METTILO QUI ⬇️



function chiudiMiniRiepilogo() {
  const el = document.getElementById("riepilogo-mini");
  if (!el) return;

  el.classList.add("collapsed");
  el.classList.remove("open");
  el.innerHTML = el.dataset.mini || "";

  if (typeof unblurBackground === "function") unblurBackground();

  if (window.collapseTimer) {
    clearTimeout(window.collapseTimer);
    window.collapseTimer = null;
  }

  // se eri nello stato “mini aperto”, torna a extra
  if (window.step === "riepilogo-mini-open") {
    window.step = "extra";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("blur-overlay");
  if (!overlay) return;

  overlay.addEventListener("click", () => {
    chiudiMiniRiepilogo();
  });
});

function blurBackground() {
  document.body.classList.add("blur-bg");
  const ov = document.getElementById("blur-overlay");
  if (ov) ov.style.display = "block";
}

function unblurBackground() {
  document.body.classList.remove("blur-bg");
  const ov = document.getElementById("blur-overlay");
  if (ov) ov.style.display = "none";
}

function setLoadingText(text) {
  const el = document.getElementById("loading-text");
  if (el) el.textContent = text;
}

function setLoadingAlmostReady() {
  setLoadingText("Ci siamo quasi…");
}
function setLoadingProgress(pct) {
  const bar = document.getElementById("loading-bar");
  if (bar) bar.style.width = pct + "%";
}
// ===============================
// 📸 SALVA COPPA COME IMMAGINE
// ===============================

function onApriRegistrazione() {
  registrazioneAperta = true;

  const nuvola = document.getElementById("instagram-nuvola");
  if (nuvola) nuvola.classList.remove("show");
}

function onChiudiRegistrazione() {
  registrazioneAperta = false;

  aggiornaNuvolettaInstagram();
}

function aggiornaNuvolettaInstagram() {
  const nuvola = document.getElementById("instagram-nuvola");
  if (!nuvola) return;

  if (registrazioneAperta) {
    nuvola.classList.remove("show");
    return;
  }

  // appare con un minimo di delay elegante
  setTimeout(() => {
    nuvola.classList.add("show");
  }, 1200);
}

function mostraPopupInstagram(){
  document.getElementById("popup-instagram").style.display = "flex";
}

function chiudiPopupInstagram(){
  document.getElementById("popup-instagram").style.display = "none";
}

function apriInstagramStories(){
  chiudiPopupInstagram();

  const ua = navigator.userAgent.toLowerCase();

  // 📱 mobile
  if (/iphone|ipad|android/.test(ua)) {
    window.location.href = "instagram://story-camera";

    // fallback
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 1200);
  } 
  // 💻 desktop
  else {
    window.open("https://www.instagram.com/", "_blank");
  }
}

window._eseguiCondivisioneInstagram = async function () {

  const blob = await generaCoppaInstagramStory();
  if (!blob) {
    alert("Errore creazione immagine Instagram");
    return;
  }

  const file = new File([blob], "coppa-instagram.png", {
    type: "image/png"
  });

  if (navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: "Guarda la coppa che ho creato da Casa Del Gelato! 🍨"
      });
    } catch (e) {
      console.warn("Condivisione annullata");
    }
  } else {
    alert("Apri Instagram e carica l’immagine manualmente");
  }
};

window.condividiSuInstagram = function () {
  mostraPopupInstagram();
};

window.testExportCoppa = async function () {
  const exportBox = document.getElementById("coppa-export");
  if (!exportBox) return console.error("manca #coppa-export");

  exportBox.innerHTML = "";

  const wrapper =
    document.querySelector(".piccola-wrapper") ||
    document.querySelector(".media-wrapper") ||
    document.querySelector(".grande-wrapper");

  if (!wrapper) return console.error("wrapper non trovato");

  const clone = wrapper.cloneNode(true);

  // IMPORTANTISSIMO: ricrea il "contesto" (body class) dentro export
  // perché i tuoi CSS sono tipo .piccola-coppa .box...
  const ctx = document.createElement("div");
  ctx.className =
    document.body.classList.contains("piccola-coppa") ? "piccola-coppa" :
    document.body.classList.contains("coppa-media")   ? "coppa-media"   :
    document.body.classList.contains("coppa-grande")  ? "coppa-grande"  : "";

  ctx.appendChild(clone);
  exportBox.appendChild(ctx);

  // aspetta render
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 200));

  // LOG dimensioni reali
  const rect = exportBox.getBoundingClientRect();
  console.log("exportBox rect:", rect);

  const canvas = await html2canvas(exportBox, {
    backgroundColor: "#fff",
    scale: 2,
    useCORS: true
  });

  console.log("canvas size:", canvas.width, canvas.height);

  // prova toBlob (più affidabile di toDataURL)
  canvas.toBlob(blob => {
    console.log("blob:", blob, "size:", blob?.size);

    if (!blob || blob.size === 0) {
      alert("❌ Blob vuoto: è quasi certamente un problema di CORS / file://");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TEST-coppa.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert("✅ Export OK (TEST)");
  }, "image/png");
};

async function generaCoppaPNG() {
  document.body.classList.add("exporting");

  const exportBox = preparaCoppaExportPNG();
  if (!exportBox) {
    document.body.classList.remove("exporting");
    return;
  }

  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 200));

  freezeArrowTextPositions(exportBox);

  const canvas = await html2canvas(exportBox, {
    backgroundColor: "#fff",
    scale: 2,
    useCORS: true
  });

  document.body.classList.remove("exporting");
  return canvas.toDataURL("image/png");
}

function preparaCoppaExportPNG() {
  const exportBox = document.getElementById("coppa-export");
  if (!exportBox) {
    console.error("❌ manca #coppa-export");
    return null;
  }

  exportBox.innerHTML = "";

  // ✅ Clona SOLO lo stage (NO wrapper scalati)
  const stage = document.getElementById("coppa-stage");
  if (!stage) {
    console.error("❌ manca #coppa-stage");
    return null;
  }

  const stageClone = stage.cloneNode(true);

  // 🔥 IMPORTANTISSIMO: nessun transform sul clone o contenitori export
  stageClone.style.transform = "none";
  stageClone.style.transformOrigin = "top left";

  // Contesto CSS del formato
  const ctx = document.createElement("div");
  if (document.body.classList.contains("piccola-coppa")) ctx.className = "piccola-coppa";
  else if (document.body.classList.contains("coppa-media")) ctx.className = "coppa-media";
  else if (document.body.classList.contains("coppa-grande")) ctx.className = "coppa-grande";

  // Contenitore neutro: niente scale/translate
  ctx.style.position = "relative";
  ctx.style.transform = "none";
  ctx.style.transformOrigin = "top left";

  ctx.appendChild(stageClone);
  exportBox.appendChild(ctx);

  // opzionale: assicurati che exportBox non venga “stretto” da layout
  exportBox.style.position = "fixed";
  exportBox.style.left = "-10000px";
  exportBox.style.top = "0";
  exportBox.style.background = "#fff";

  return exportBox;
}

function freezeArrowTextPositions(exportRoot) {
  const stage = exportRoot.querySelector("#coppa-stage") || exportRoot;
  const stageRect = stage.getBoundingClientRect();

  exportRoot.querySelectorAll(".arrow-text").forEach(el => {
    const r = el.getBoundingClientRect();

    // posizione relativa allo stage
    const left = r.left - stageRect.left;
    const top  = r.top  - stageRect.top;

    // congela
    el.style.transform = "none";
    el.style.left = left + "px";
    el.style.top  = top + "px";

    // evita regole che usano bottom/right
    el.style.right = "auto";
    el.style.bottom = "auto";
  });
}


// 🛒 APRE IL CARRELLO
window.apriCarrello = function() {
    const overlay = document.getElementById("carrello-overlay");

    // 🔥 Aggiorno SUBITO la UI del carrello
    aggiornaCarrelloUI();

    // 🔥 Aggiorno il numeretto (badge) del carrello
    updateCarrelloBadge();

    // 🔥 Mostro overlay
    overlay.style.display = "flex";

       // ⏱️ AVVIA TIMER SVUOTAMENTO (QUESTA È LA RIGA CHE MANCAVA)
    avviaTimerSvuotamentoCarrello();

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

    // 🧹 svuota carrello
    localStorage.setItem("carrelloCoppe", "[]");

    // 🧹 rimuove scadenza
    localStorage.removeItem("carrello_scadenza");
    localStorage.removeItem("carrello_last_update");

    // ⏱️ ferma e nasconde il timer
    if (window.carrelloTimerInterval) {
        clearInterval(window.carrelloTimerInterval);
        window.carrelloTimerInterval = null;
    }

    const timerBox = document.getElementById("carrello-timer");
    if (timerBox) timerBox.style.display = "none";

    // 🔄 aggiorna UI
    aggiornaCarrelloUI();
    updateBadgeNav();
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

  riepilogo.addEventListener("click", function (e) {
    if (e.target.closest(".quick-next-inside")) return;

    if (this.classList.contains("collapsed")) {
      this.classList.remove("collapsed");
      this.classList.add("open");
      this.innerHTML = this.dataset.full || "";
      blurBackground(); // 🔥 SFONDO SFOCATO
      if (collapseTimer) clearTimeout(collapseTimer);
      autoCollapseRiepilogo();

    } else {
      // 🔥 CHIUSURA MANUALE
      this.classList.add("collapsed");
      this.classList.remove("open");
      this.innerHTML = this.dataset.mini || "";
      unblurBackground(); // 🔥 RIPRISTINA
      // ✅ FIX FONDAMENTALE
      if (step === "riepilogo-mini-open") {
        step = "extra";
      }

      if (collapseTimer) {
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

    // elimina dopo lettura
    localStorage.removeItem("coppaDaUsare");

    // selezione formato
    if (c.formato === "PICCOLA") {
        selectSize("PICCOLA", 2, 1, 1, 1);
    } else if (c.formato === "MEDIA") {
        selectSize("MEDIA", 3, 2, 2, 1);
    } else if (c.formato === "GRANDE") {
        selectSize("GRANDE", 4, 2, 2, 2);
    } else {
        selectSize("PICCOLA", 2, 1, 1, 1);
    }

    // GUSTI
    if (Array.isArray(c.gusti)) {
        gustiQuantities = {};
        gustiList.forEach(g => gustiQuantities[g] = 0);

        c.gusti.forEach(g => {
            if (g in gustiQuantities) {
                gustiQuantities[g] += 1;
            }
        });

        rebuildSceltiGustiFromQuantities();
    }

    // altri ingredienti
    scelti.granelle    = Array.isArray(c.granelle)    ? [...c.granelle]    : [];
    scelti.topping     = Array.isArray(c.topping)     ? [...c.topping]     : [];
    scelti.ingredienti = Array.isArray(c.ingredienti) ? [...c.ingredienti] : [];
    scelti.extra       = Array.isArray(c.extra)       ? [...c.extra]       : [];

    updateStatusGusti();
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
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const step = params.get("step");

  if (step === "size") {
    console.log("➡️ Accesso diretto alla scelta formato");

    // nascondi tavolo
    const tavolo = document.getElementById("step-tavolo");
    if (tavolo) tavolo.style.display = "none";

    // nascondi step container (gusti ecc)
    const container = document.getElementById("step-container");
    if (container) container.style.display = "none";

    // mostra selezione formato
    const size = document.getElementById("step-size");
    if (size) size.style.display = "block";

    // titolo coerente
    const title = document.getElementById("step-title");
    if (title) title.classList.add("hidden");
  }
});
function mostraBottomNav() {
  const nav = document.getElementById("bottom-nav");
  if (nav) nav.style.display = "flex";
}

function nascondiBottomNav() {
  const nav = document.getElementById("bottom-nav");
  if (nav) nav.style.display = "none";
}
// 🔥 FIX RIENTRO DA ALTRE PAGINE (Registrati / Profilo / Back browser)
window.addEventListener("pageshow", () => {

  const title = document.getElementById("step-title");
  if (title) {
    title.textContent = "";
    title.classList.add("hidden");
  }

  // 🔥 Se il riepilogo è visibile → forza stato corretto
  if (document.body.classList.contains("step-riepilogo")) {
    step = "riepilogo";
  }
});
// ===============================
// ☁️ INSTAGRAM NUVOLA UI
// ===============================
(function creaInstagramNuvoletta() {
  if (document.getElementById("instagram-nuvola")) return;

  const nuvola = document.createElement("div");
  nuvola.id = "instagram-nuvola";
  nuvola.innerHTML = `
    <div class="nuvola-content">
      📸 <b>Immagine pronta</b><br>
      <span>Condividi e taggaci su Instagram</span>
    </div>
  `;

  // ✅ CLICK: chiude + scrolla in fondo
  nuvola.addEventListener("click", () => {
    // chiude la nuvoletta
    nuvola.classList.remove("show");

    // scroll fluido fino in fondo pagina
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  });

  document.body.appendChild(nuvola);
})();

function nascondiNuvolaInstagram() {
  const n = document.getElementById("instagram-nuvola");
  if (n) n.classList.remove("show");
}

function mostraNuvolaInstagram() {
  const n = document.getElementById("instagram-nuvola");
  if (n) n.classList.add("show");
}

function apriRegistrazione() {
  // 🔥 segna che veniamo dal riepilogo
  localStorage.setItem("returnToRiepilogo", "1");

  // ✅ NASCONDI NUVOLA mentre ti registri
  nascondiNuvolaInstagram();

  document.getElementById("step-size").style.display = "none";
  document.getElementById("step-container").style.display = "none";
  document.getElementById("step-title").style.display = "none";

  document.getElementById("reg-box").style.display = "block";
}

// CHIUDI MODULO
function chiudiRegistrazione() {
  document.getElementById("reg-box").style.display = "none";
  document.getElementById("step-container").style.display = "block";
  document.getElementById("step-title").style.display = "block";

  // ✅ RI-MOSTRA NUVOLA quando torni al riepilogo finale
  if (document.body.classList.contains("step-riepilogo")) {
    mostraNuvolaInstagram();
  }
}

function forzaCoppaNonConfermata() {
  // 🔥 reset stato logico
  if (window.coppaCorrente) {
    window.coppaCorrente.confermata = false;
  }

  // 🔥 reset UI
  const text = document.getElementById("qr-status-text");
  const qr = document.getElementById("qr-code");
  const overlay = document.querySelector(".qr-overlay");

  if (text) {
    text.textContent = "Mostra il QR code per confermare la coppa";
    text.style.color = "";
    text.style.fontWeight = "600";
  }

  if (qr) {
    qr.classList.remove("qr-locked");
    qr.style.opacity = "1";
    qr.style.pointerEvents = "auto";
  }

  // 🔥 rimuove lucchetto se presente
  if (overlay) overlay.remove();
}

function resetCoppaNonConfermata() {
  const text = document.getElementById("qr-status-text");
  if (!text) return;

  text.textContent = "Mostra il QR code per confermare la coppa";
  text.style.color = "#111";
  text.style.fontWeight = "600";

  const qr = document.getElementById("qr-code");
  if (qr) {
    qr.style.opacity = "1";
    qr.style.pointerEvents = "auto";
  }
}

function setCoppaConfermata() {
  const text = document.getElementById("qr-status-text");
  if (!text) return;

  text.textContent = "✅ Coppa confermata";
  text.style.color = "#34c759";
  text.style.fontWeight = "700";

  // opzionale: rendi il QR “inattivo”
  const qr = document.getElementById("qr-code");
  if (qr) {
    qr.style.opacity = "0.4";
    qr.style.pointerEvents = "none";
  }
}
function ascoltaConfermaCoppaRealtime(qrToken) {
  if (!window.supabase || !qrToken) return;

  supabase
    .channel("coppa-confirmata-" + qrToken)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "coppe",
        filter: `qr_token=eq.${qrToken}`
      },
      payload => {
        console.log("✅ COPPA CONFERMATA (REALTIME)", payload);

        // aggiorna stato locale
        if (window.coppaCorrente) {
          window.coppaCorrente.confermata = true;
        }

        // 🔥 aggiorna UI
        setCoppaConfermata();
      }
    )
    .subscribe();
}
async function generaCoppaInstagramStory() {
  const stage = document.getElementById("coppa-stage");
  if (!stage) return null;

  // crea canvas 9:16
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  // sfondo bianco (Instagram)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // cattura coppa
  const coppaCanvas = await html2canvas(stage, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  });

  // centra la coppa verticalmente
  const scale = Math.min(
    canvas.width / coppaCanvas.width,
    canvas.height / coppaCanvas.height
  ) * 0.85;

  const w = coppaCanvas.width * scale;
  const h = coppaCanvas.height * scale;

  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  ctx.drawImage(coppaCanvas, x, y, w, h);

  return new Promise(res =>
    canvas.toBlob(blob => res(blob), "image/png")
  );
}