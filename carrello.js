// 🔥 Aggiorna badge nella bottom bar
window.updateBadgeNav = function() {
    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
    const badge = document.getElementById("badge-nav");
    if (!badge) return;
    badge.textContent = carrello.length;
};

// 🔥 Apre il carrello grafico
window.apriCarrello = function() {
    const overlay = document.getElementById("carrello-overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    avviaTimerSvuotamentoCarrello();
    aggiornaCarrelloUI();
};

// 🔥 Chiude carrello
window.chiudiCarrello = function() {
    const overlay = document.getElementById("carrello-overlay");
    if (!overlay) return;
    overlay.style.display = "none";
};

// 🔥 Aggiorna contenuto carrello
window.aggiornaCarrelloUI = function () {
    const contenuto = document.getElementById("carrello-contenuto");
    let coppeCronologia = JSON.parse(localStorage.getItem("cronologiaCoppe") || "[]");

    if (!contenuto) return;

    if (!carrello.length) {
        contenuto.innerHTML = `<p style="text-align:center; opacity:0.6;">Carrello vuoto</p>`;
        updateBadgeNav();
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

        // 🔥 Calcolo prezzo
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
                    ? coppa.extra.map(e => `${e} (+ €${(prezziExtra[e] || 0).toFixed(2)})`).join(", ")
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

    contenuto.innerHTML = html;

    updateBadgeNav();
};

/* ===============================
   🚀 CONTROLLO SCADENZA ALL’AVVIO
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  avviaTimerSvuotamentoCarrello();
});

let carrelloTimerInterval = null;

function avviaTimerSvuotamentoCarrello() {
  const countdownEl = document.getElementById("carrello-countdown");
  const timerBox = document.getElementById("carrello-timer");
  if (!countdownEl || !timerBox) return;

  const scadenza = Number(localStorage.getItem("carrello_scadenza"));
  if (!scadenza) {
    timerBox.style.display = "none";
    return;
  }

  timerBox.style.display = "block";

  // 🔄 stop eventuale timer precedente
  if (carrelloTimerInterval) {
    clearInterval(carrelloTimerInterval);
  }

  function tick() {
    const now = Date.now();
    const diff = scadenza - now;

 if (diff <= 0) {
  console.log("🗑️ Carrello scaduto → svuotamento");

  // 1️⃣ svuota carrello
  localStorage.removeItem("carrelloCoppe");
  localStorage.removeItem("carrello_scadenza");

  // 2️⃣ reset UI
  countdownEl.textContent = "00:00";
  timerBox.style.display = "none";

  clearInterval(carrelloTimerInterval);
  carrelloTimerInterval = null;

  // 3️⃣ aggiorna interfaccia
  aggiornaCarrelloUI();
  updateBadgeNav();

  return;
}

    const totSec = Math.floor(diff / 1000);
    const h = Math.floor(totSec / 3600);
    const m = Math.floor((totSec % 3600) / 60);
    const s = totSec % 60;

    countdownEl.textContent =
      (h > 0 ? h + ":" : "") +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0");
  }

  tick(); // ⏱️ avvio immediato
  carrelloTimerInterval = setInterval(tick, 1000);
}