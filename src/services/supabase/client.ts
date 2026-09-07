import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Em desenvolvimento, avisa claramente em vez de falhar silenciosamente.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas. " +
      "Copie .env.example para .env e preencha com as credenciais do seu projeto Supabase."
  );
}

/**
 * Cliente único do Supabase, totalmente tipado a partir de `Database`.
 * Importe este client em services/hooks — nunca instancie um novo client em outro lugar.
 */
export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);
