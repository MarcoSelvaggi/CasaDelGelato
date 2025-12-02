// supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔥 CREA CLIENT SUPABASE
export const supabase = createClient(
  "https://hisxzfieewpuygyejpsv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc3h6ZmllZXdwdXlneWVqcHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzU5MDgsImV4cCI6MjA3OTg1MTkwOH0.YoNo-cdPGYslUb8Eh91aUCHlU9FeMhkmClH5gph4YFU"
);

// =====================================================
// 🔥 SALVA / RIATTIVA UTENTE IN SUPABASE
// =====================================================
export async function salvaRegistrazioneSupabase(nome, cognome, email) {
  // 1️⃣ Controllo se esiste già
  const { data: existing, error: checkError } = await supabase
    .from("utenti")
    .select("email, disiscritto")
    .eq("email", email);

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
        .eq("email", email);

      if (updError) {
        return { success: false, error: updError.message };
      }

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
      email,
      disiscritto: false,
      data_disiscrizione: null,
    },
  ]);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return { success: true };
}

// =====================================================
// 🔥 SALVA COPPA IN SUPABASE
// =====================================================
export async function salvaCoppaSupabase(coppa) {

    console.log("🔍 Invio coppa a Supabase:", coppa);

    const { data, error } = await supabase
        .from("coppe")
        .insert([coppa]);

    if (error) {
        console.error("🔥 ERRORE SUPABASE:", error);
        alert("Errore Supabase:\n" + error.message);
        return { success:false, error:error.message };
    }

    console.log("✔️ Coppa salvata su Supabase!", data);
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
// 🔥 ESPORTO ANCHE SU window PER GLI SCRIPT NON-MODULO
// =====================================================
if (typeof window !== "undefined") {
  window.supabase = supabase;
  window.salvaRegistrazioneSupabase = salvaRegistrazioneSupabase;
  window.salvaCoppaSupabase = salvaCoppaSupabase;
}