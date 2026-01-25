// 🔒 usa SEMPRE window.carrelloTimerInterval (una sola variabile globale)
window.carrelloTimerInterval = window.carrelloTimerInterval || null;

function stopTimerCarrello() {
  const timerBox = document.getElementById("carrello-timer");
  const countdownEl = document.getElementById("carrello-countdown");

  if (window.carrelloTimerInterval) {
    clearInterval(window.carrelloTimerInterval);
    window.carrelloTimerInterval = null;
  }

  localStorage.removeItem("carrello_scadenza");

  if (countdownEl) countdownEl.textContent = "00:00";
  if (timerBox) timerBox.style.display = "none";
}

function getTotaleCarrelloQty() {
  const carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
  return carrello.reduce((sum, c) => sum + (c.quantita || 1), 0);
}

// 🔥 Aggiorna badge nella bottom bar
window.updateBadgeNav = function() {
    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
    const badge = document.getElementById("badge-nav");
    if (!badge) return;
    badge.textContent = carrello.length;
};


// 🔥 Chiude carrello (pulizia completa)
window.chiudiCarrello = function() {
  const overlay = document.getElementById("carrello-overlay");
  if (!overlay) return;

  overlay.classList.remove("show");

  setTimeout(() => {
    overlay.style.display = "none";

    // 🔥 pulizia extra (fondamentale)
    overlay.classList.remove("show");
  }, 300);
};

// 🔥 Aggiorna contenuto carrello
window.aggiornaCarrelloUI = function () {
    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
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
avviaTimerSvuotamentoCarrello();
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

  // ✅ se carrello vuoto → reset TOTALE
  if (getTotaleCarrelloQty() === 0) {
    stopTimerCarrello();
    return;
  }

  // ✅ se non esiste scadenza → creala ORA (riparte da zero)
  let scadenza = Number(localStorage.getItem("carrello_scadenza"));
  if (!scadenza) {
    scadenza = Date.now() + (15 * 60 * 1000); // 15 min
    localStorage.setItem("carrello_scadenza", scadenza);
  }

  timerBox.style.display = "block";

  // ✅ se interval già attivo, NON crearne un altro
  if (window.carrelloTimerInterval) return;

  function tick() {
    const diff = scadenza - Date.now();

    if (diff <= 0) {
      localStorage.removeItem("carrelloCoppe");
      stopTimerCarrello();
      aggiornaCarrelloUI?.();
      updateBadgeNav?.();
      return;
    }

    const totSec = Math.floor(diff / 1000);
    const m = Math.floor((totSec % 3600) / 60);
    const s = totSec % 60;
    countdownEl.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  tick();
  window.carrelloTimerInterval = setInterval(tick, 1000);
}

window.resetEAvviaTimerCarrello = function () {
  console.log("⏱️ resetEAvviaTimerCarrello CHIAMATA");

  // ferma timer esistente
  if (window.carrelloTimerInterval) {
    clearInterval(window.carrelloTimerInterval);
    window.carrelloTimerInterval = null;
  }

  // reset scadenza
localStorage.setItem(
  "carrello_scadenza",
  Date.now() + 15 * 60 * 1000 // ⏱️ 15 minuti
);

  // riavvia timer
  avviaTimerSvuotamentoCarrello();
};