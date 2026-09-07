export interface Spreadsheet {
  id: string;
  name: string;
  /** Nome de uma plataforma personalizada do usuário (ver types/platform.types.ts). */
  platform: string;
  url: string;
  /** Nome de uma categoria personalizada do usuário (ver types/category.types.ts). */
  category: string;
  /** Quando true, a planilha aparece na página pública para visitantes não autenticados. */
  isPublic: boolean;
}

export type SpreadsheetFormValues = Omit<Spreadsheet, "id">;
