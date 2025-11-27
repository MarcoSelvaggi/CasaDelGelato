// supabase.js
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

    // 1️⃣ Controllo se esiste già
    const { data: existing, error: checkError } = await supabase
        .from("utenti")
        .select("email")
        .eq("email", email);

    if (checkError) {
        return { success:false, error:checkError.message };
    }

    if (existing && existing.length > 0) {
        return { success:false, error:"Email già registrata" };
    }

    // 2️⃣ Inserisco nel DB
    const { error: insertError } = await supabase
        .from("utenti")
        .insert([
            {
                nome: nome,
                cognome: cognome,
                email: email
            }
        ]);

    if (insertError) {
        return { success:false, error:insertError.message };
    }

    return { success:true };
}