// ===== Supabase Client =====
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://hisxzfieewpuygyejpsv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc3h6ZmllZXdwdXlneWVqcHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzU5MDgsImV4cCI6MjA3OTg1MTkwOH0.YoNo-cdPGYslUb8Eh91aUCHlU9FeMhkmClH5gph4YFU"
);
// TEST connessione
supabase.from("users").select("*").limit(1)
  .then(r => console.log("✓ Connessione a Supabase OK", r))
  .catch(err => console.error("❌ Errore Supabase:", err));