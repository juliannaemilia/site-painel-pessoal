export * from "./database.types";
export * from "./auth.types";
export * from "./category.types";
export * from "./platform.types";
export * from "./quickLink.types";
export * from "./spreadsheet.types";
export * from "./file.types";

/** Tipo de item que o modal "Adicionar Novo Item" pode criar. */
export type NovoItemTipo = "link" | "planilha" | "arquivo";

export interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}
