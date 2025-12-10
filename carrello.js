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
    aggiornaCarrelloUI();
};

// 🔥 Chiude carrello
window.chiudiCarrello = function() {
    const overlay = document.getElementById("carrello-overlay");
    if (!overlay) return;
    overlay.style.display = "none";
};

// 🔥 Aggiorna contenuto carrello
window.aggiornaCarrelloUI = function() {
    const contenuto = document.getElementById("carrello-contenuto");
    let carrello = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");

    if (!contenuto) return;

    if (!carrello.length) {
        contenuto.innerHTML = `<p style="text-align:center; opacity:0.6;">Carrello vuoto</p>`;
        updateBadgeNav();
        return;
    }

    let html = "";
    carrello.forEach(coppa => {
        html += `
        <div class="carrello-card">
            <b>${coppa.formato}</b> x${coppa.quantita}
        </div>`;
    });

    contenuto.innerHTML = html;

    updateBadgeNav();
};
