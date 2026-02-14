import { supabase } from "./supabase.js";

/* ===============================
   BADGE + STAT
================================ */

export async function aggiornaBadgeNotifiche(){
  const email  = localStorage.getItem("user_email");
  const logged = localStorage.getItem("userLogged") === "1";

  const badgeMenu   = document.getElementById("notifiche-count");
  const avatarBadge = document.getElementById("profile-notif-badge");
  const statNotif   = document.getElementById("stat-notif");

  if (!logged || !email){
    if (badgeMenu) badgeMenu.style.display = "none";
    if (avatarBadge) avatarBadge.style.display = "none";
    if (statNotif) statNotif.textContent = "0";
    return;
  }

  const { data, error } = await supabase
    .from("notifiche")
    .select("id")
    .eq("email", email)
    .eq("letta", false);

  if (error) return;

  const n = data.length;
  const value = n > 99 ? "99+" : n;

  if (badgeMenu){
    badgeMenu.textContent = value;
    badgeMenu.style.display = n > 0 ? "inline-block" : "none";
  }

  if (avatarBadge){
    avatarBadge.textContent = value;
    avatarBadge.style.display = n > 0 ? "flex" : "none";
  }

  if (statNotif){
    statNotif.textContent = n;
  }
}

/* ===============================
   CARICA NOTIFICHE
================================ */

export async function caricaNotificheUtente() {
  const email = localStorage.getItem("user_email");
  const list = document.getElementById("notifiche-list");
  if (!email || !list) return;

  list.innerHTML = "⏳ Caricamento…";

  const { data, error } = await supabase
    .from("notifiche")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error){
    list.innerHTML = "❌ Errore caricamento notifiche";
    return;
  }

  if (!data.length){
    list.innerHTML = `
      <div class="notification-item">
        🔕 Nessuna notifica al momento
      </div>`;
    return;
  }

  list.innerHTML = "";

  data.forEach(n => {
    const wrapper = document.createElement("div");
    wrapper.className = "notification-swipe";
    wrapper.dataset.id = n.id;

    const item = document.createElement("div");
    item.className = "notification-item";
    if (!n.letta) item.classList.add("unread");

    const dataStr = new Date(n.created_at).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    item.innerHTML = `
      <div>${n.messaggio}</div>
      <div style="font-size:11px;opacity:.6;margin-top:4px">
        ${dataStr}
      </div>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "notif-delete";
    deleteBtn.textContent = "Elimina";

    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(item);
    list.appendChild(wrapper);
  });

  abilitaSwipeNotifiche();
}

/* ===============================
   SWIPE iOS
================================ */

function abilitaSwipeNotifiche(){
  document.querySelectorAll(".notification-swipe").forEach(wrapper => {
    const item = wrapper.querySelector(".notification-item");

    let startX = 0;
    let currentX = 0;
    let dragging = false;

    item.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
      dragging = true;
      item.style.transition = "none";
    });

    item.addEventListener("touchmove", e => {
      if (!dragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      if (diff < 0){
        item.style.transform = `translateX(${Math.max(diff, -110)}px)`;
      }
    });

    item.addEventListener("touchend", () => {
      dragging = false;
      item.style.transition = "transform .25s ease";

      if (currentX - startX < -60){
        wrapper.classList.add("swiped");
        item.style.transform = "translateX(-90px)";
      } else {
        wrapper.classList.remove("swiped");
        item.style.transform = "translateX(0)";
      }
    });
  });
}

/* ===============================
   ELIMINA SINGOLA
================================ */

document.addEventListener("click", async e => {
  const btn = e.target.closest(".notif-delete");
  if (!btn) return;

  const wrapper = btn.closest(".notification-swipe");
  if (!wrapper) return;

  const id = wrapper.dataset.id;

  if (id){
    await supabase
      .from("notifiche")
      .delete()
      .eq("id", id);
  }

  wrapper.remove();
  aggiornaBadgeNotifiche();
});

/* ===============================
   SVUOTA TUTTO
================================ */

window.eliminaTutteNotifiche = async function(){
  const email = localStorage.getItem("user_email");
  if (!email) return;

  const ok = confirm("Vuoi eliminare tutte le notifiche?");
  if (!ok) return;

  await supabase
    .from("notifiche")
    .delete()
    .eq("email", email);

  const list = document.getElementById("notifiche-list");
  if (list){
    list.innerHTML = `
      <div class="notification-item">
        🔕 Nessuna notifica al momento
      </div>`;
  }

  aggiornaBadgeNotifiche();
};

/* ===============================
   OPEN / CLOSE POPUP
================================ */

export function setupPopupNotifiche(){
  const btn = document.getElementById("menu-notifiche");
  const popup = document.getElementById("notifiche-popup");
  const backdrop = document.getElementById("notifiche-backdrop");
  const closeBtn = document.getElementById("chiudi-notifiche");

  if (!btn || !popup || !backdrop || !closeBtn) return;

  btn.addEventListener("click", async () => {
    await caricaNotificheUtente();
    document.body.classList.add("no-scroll");
    backdrop.classList.add("show");
    popup.classList.add("show");
  });

  async function close(){
    popup.classList.remove("show");
    backdrop.classList.remove("show");
    document.body.classList.remove("no-scroll");

    const email = localStorage.getItem("user_email");
    if (email){
      await supabase
        .from("notifiche")
        .update({ letta: true })
        .eq("email", email)
        .eq("letta", false);
    }

    aggiornaBadgeNotifiche();
  }

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
}

/* ===============================
   AUTO REFRESH
================================ */

setInterval(() => {
  aggiornaBadgeNotifiche();
}, 15000);