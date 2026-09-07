import type { TipoArquivo } from "./database.types";

export interface AppFile {
  id: string;
  fileName: string;
  fileType: TipoArquivo;
  /** Link externo para o arquivo (Google Drive, OneDrive, etc.) — nada é enviado a um servidor. */
  url: string;
  /** Nome de uma categoria personalizada do usuário (ver types/category.types.ts). */
  category: string;
  /** Quando true, o arquivo aparece na página pública para visitantes não autenticados. */
  isPublic: boolean;
  createdAt: string;
}

export type AppFileFormValues = Omit<AppFile, "id" | "createdAt">;
