/** Plataforma personalizada criada pelo usuário para suas planilhas (ex: "Google Sheets", "Airtable"...). */
export interface Platform {
  id: string;
  name: string;
  createdAt: string;
}

export type PlatformFormValues = Pick<Platform, "name">;
