import { useContext } from "react";
import { AppDataContext, type AppDataContextValue } from "@/context/AppDataContext";

/** Acessa os dados compartilhados de Links Rápidos, Planilhas e Arquivos. */
export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData deve ser usado dentro de um <AppDataProvider>.");
  }
  return context;
}
