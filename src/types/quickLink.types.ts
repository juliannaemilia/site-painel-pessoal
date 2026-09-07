export interface QuickLink {
  id: string;
  title: string;
  url: string;
  domain: string;
  /** Nome de uma categoria personalizada do usuário (ver types/category.types.ts). */
  category: string;
  /** Quando true, o link aparece na página pública para visitantes não autenticados. */
  isPublic: boolean;
  createdAt: string;
}

export type QuickLinkFormValues = Omit<QuickLink, "id" | "domain" | "createdAt">;
