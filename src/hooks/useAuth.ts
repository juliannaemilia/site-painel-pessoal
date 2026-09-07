import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import type { AuthContextValue } from "@/types/auth.types";

/** Acessa o estado global de autenticação. Deve ser usado dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um <AuthProvider>.");
  }
  return context;
}
