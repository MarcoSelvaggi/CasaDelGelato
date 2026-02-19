// supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔥 CREA CLIENT SUPABASE
export const supabase = createClient(
  "https://hisxzfieewpuygyejpsv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc3h6ZmllZXdwdXlneWVqcHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzU5MDgsImV4cCI6MjA3OTg1MTkwOH0.YoNo-cdPGYslUb8Eh91aUCHlU9FeMhkmClH5gph4YFU"
);

// =====================================================
// 🔥 GENERA / RECUPERA guest_id
// =====================================================
export function getGuestID() {
  let g = localStorage.getItem("guest_id");
  if (!g) {
    g = crypto.randomUUID();
    localStorage.setItem("guest_id", g);
  }
  return g;
}

// 🔗 COLLEGA COPPE ANONIME ALLA MAIL
async function linkCoppeAnonimeAEmail(email) {
  const guest_id = localStorage.getItem("guest_id");
  if (!guest_id) {
    console.log("Nessun guest_id trovato, niente da collegare");
    return;
  }

  const { error } = await supabase
    .from("coppe")
    .update({ email: email.trim().toLowerCase() })
   .eq("guest_id", guest_id)
   .or("email.is.null,email.eq.");

  if (error) {
    console.error("Errore nel collegare le coppe anonime:", error);
  } else {
    console.log("Coppe anonime collegate all'email:", email);
  }
}

// =====================================================
// 🔥 SALVA / RIATTIVA UTENTE IN SUPABASE
// =====================================================
export async function salvaRegistrazioneSupabase(nome, cognome, email) {
  // 1️⃣ Controllo se esiste già
  const { data: existing, error: checkError } = await supabase
    .from("utenti")
    .select("email, disiscritto")
    .eq("email", email.trim().toLowerCase());

  if (checkError) {
    return { success: false, error: checkError.message };
  }

  // 2️⃣ Se esiste già
  if (existing && existing.length > 0) {
    const u = existing[0];

    // Se era disiscritto → riattivalo
    if (u.disiscritto === true) {
      const { error: updError } = await supabase
        .from("utenti")
        .update({
          disiscritto: false,
          data_disiscrizione: null,
        })
       .eq("email", email.trim().toLowerCase());

      if (updError) {
        return { success: false, error: updError.message };
      }

      // 🔗 collega coppe anonime → questa mail
      await linkCoppeAnonimeAEmail(email);
      return { success: true };
    }

    // Se NON era disiscritto → errore "già registrata"
    return { success: false, error: "Email già registrata" };
  }

  // 3️⃣ Non esiste → inserisco nuovo utente
const { error: insertError } = await supabase.from("utenti").insert([
  {
    nome,
    cognome,
    email: email.trim().toLowerCase(),
    disiscritto: false,
    data_disiscrizione: null,
  },
]);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // 🔗 collega coppe anonime → questa mail
  await linkCoppeAnonimeAEmail(email);

  return { success: true };
}

// =====================================================
// 🔥 SALVA COPPA IN SUPABASE
// =====================================================
export async function salvaCoppaSupabase(coppa) {

    // 🔥 1. Recupero email dell’utente loggato
    let email = localStorage.getItem("user_email");
    if (email) email = email.trim().toLowerCase();
    let guest_id = getGuestID();

    // 🔥 2. Se NON loggato → salvo come anonimo
    if (!email) {
        coppa.email = null;
        coppa.guest_id = guest_id;
    } else {
        coppa.email = email;
        coppa.guest_id = null;
    }

    console.log("📤 Invio coppa:", coppa);
console.log("🧪 coppa ricevuta:", coppa);
console.log("🧪 coppa.coppa_img:", coppa.coppa_img);
console.log("🧪 typeof coppa.coppa_img:", typeof coppa.coppa_img);
    const { data, error } = await supabase
        .from("coppe")
        .insert([coppa]);

    if (error) {
        console.error("🔥 ERRORE SUPABASE:", error);
        alert("Errore Supabase:\n" + error.message);
        return { success:false, error:error.message };
    }

    return { success:true };
}

// =====================================================
// 🔥 LEGGI COPPE (per admin)
// =====================================================
export async function getCoppeSupabase() {
  const { data, error } = await supabase
    .from("coppe")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Errore getCoppeSupabase:", error);
    return [];
  }

  return data || [];
}

// =====================================================
// 🔥 LEGGI UTENTI (registrati + disiscritti) per admin
// =====================================================
export async function getUtentiSupabase() {
  const { data, error } = await supabase
    .from("utenti")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Errore lettura utenti:", error);
    return [];
  }

  return data || [];
}

// =====================================================
// 🔥 ESPONGO FUNZIONI A WINDOW (per script NON module)
// =====================================================
if (typeof window !== "undefined") {
  window.supabase = supabase;
  window.salvaCoppaSupabase = salvaCoppaSupabase;
  window.salvaRegistrazioneSupabase = salvaRegistrazioneSupabase;
}