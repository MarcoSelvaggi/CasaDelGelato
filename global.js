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

import { supabase } from "./supabase.js";

let notificheChannel = null;

export function startGlobalNotificheListener() {

  const email  = localStorage.getItem("user_email");
  const logged = localStorage.getItem("userLogged") === "1";

  if (!logged || !email) return;

  if (notificheChannel) {
    supabase.removeChannel(notificheChannel);
  }

  notificheChannel = supabase
    .channel("global-notifiche")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifiche",
        filter: `email=eq.${email}`
      },
      async () => {

        console.log("🔔 NOTIFICA GLOBALE");

        // se esiste funzione profilo
        if (typeof window.aggiornaBadgeNotifiche === "function") {
          window.aggiornaBadgeNotifiche();
        }

        // se esiste funzione home
        if (typeof window.aggiornaDotNotificheHome === "function") {
          window.aggiornaDotNotificheHome();
        }

      }
    )
    .subscribe(status => {
      console.log("🌍 GLOBAL STATUS:", status);
    });
}

/* ===============================
   🚨 SITE LOCK GLOBALE
=============================== */

async function checkSiteLockGlobal(){

  console.log("🚨 CHECK SITE LOCK");

  const { data, error } = await supabase
    .from("site_lock")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("❌ ERRORE SITE LOCK:", error);
    return;
  }

  console.log("📦 SITE LOCK DATA:", data);

  if (!data || !data.active) {
    console.log("🔓 Site lock non attivo");
    return;
  }

  // evita duplicazione popup
  if (document.getElementById("site-lock-popup")) return;

  console.log("🔒 ATTIVO BLOCCO SITO");

  const popup = document.createElement("div");
  popup.id = "site-lock-popup";
  popup.style.position = "fixed";
  popup.style.inset = "0";
  popup.style.background = "#ffffff";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";
  popup.style.textAlign = "center";
  popup.style.zIndex = "999999";
  popup.style.padding = "30px";
  popup.style.flexDirection = "column";

  popup.innerHTML = `
    <h1 style="font-size:26px;margin-bottom:16px;">
      ${data.title || "Sito temporaneamente non disponibile"}
    </h1>
    <p style="font-size:16px;max-width:400px;opacity:.8;">
      ${data.message || "Stiamo risolvendo un problema tecnico."}
    </p>
  `;

  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";
}

document.addEventListener("DOMContentLoaded", checkSiteLockGlobal);