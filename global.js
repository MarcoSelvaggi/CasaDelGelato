window.__GLOBAL_OK__ = true;
console.log("✅ global.js caricato su", location.pathname);

// Apri overlay carrello

window.apriCarrello = function () {
    const overlay = document.getElementById("carrello-overlay");
    if (overlay) overlay.style.display = "flex";
};

// Chiudi overlay carrello
window.chiudiCarrello = function () {
    const overlay = document.getElementById("carrello-overlay");
    if (overlay) overlay.style.display = "none";
};

// Aggiorna badge nella barra
window.updateBadgeNav = function () {
    const badge = document.getElementById("badge-nav");
    const cart = JSON.parse(localStorage.getItem("carrelloCoppe") || "[]");
    if (badge) badge.textContent = cart.length;
};

// Aggiorna subito alla partenza
document.addEventListener("DOMContentLoaded", updateBadgeNav);

