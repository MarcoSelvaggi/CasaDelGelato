import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔥 CREA CLIENT SUPABASE
export const supabase = createClient(
  "https://hisxzfieewpuygyejpsv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc3h6ZmllZXdwdXlneWVqcHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzU5MDgsImV4cCI6MjA3OTg1MTkwOH0.YoNo-cdPGYslUb8Eh91aUCHlU9FeMhkmClH5gph4YFU"
);

// =====================================================
// 🔥 FUNZIONE: Salva utente in Supabase
// =====================================================
export async function salvaRegistrazioneSupabase(nome, cognome, email) {

    const { data: existing, error: checkError } = await supabase
        .from("utenti")
        .select("email")
        .eq("email", email);

    if (checkError) return { success:false, error:checkError.message };
    if (existing && existing.length > 0)
        return { success:false, error:"Email già registrata" };

    const { error: insertError } = await supabase
        .from("utenti")
        .insert([{ nome, cognome, email }]);

    if (insertError) return { success:false, error:insertError.message };

    return { success:true };
}

// =====================================================
// 🔥 FUNZIONE: Salva Coppa in Supabase   <<<<<< INCOLLA QUI!!!
// =====================================================
export async function salvaCoppaSupabase(coppa) {

    const { data, error } = await supabase
        .from("coppe")
        .insert([coppa]);

    if (error) {
        console.error("Errore Supabase salvataggio coppa:", error);
        return { success:false, error:error.message };
    }

    return { success:true };
}
// =====================================================
// 🔥 FUNZIONE: Legge tutte le coppe da Supabase
// =====================================================
export async function getCoppeSupabase() {
    const { data, error } = await supabase
        .from("coppe")
        .select("*")
        .order("id", { ascending: false });  // mostra prima le più recenti

    if (error) {
        console.error("Errore getCoppeSupabase:", error);
        return [];
    }

    return data;
}
// =====================================================
// 🔥 LEGGI UTENTI DA SUPABASE (COMPRESI DISISCRITTI)
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