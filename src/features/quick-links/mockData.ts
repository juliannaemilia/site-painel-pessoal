import type { QuickLink } from "@/types";

/**
 * Dados de demonstração — usados como fallback local quando o Supabase
 * ainda não está configurado (ver hooks/useQuickLinks.ts), e como seed
 * sugerido para popular a tabela `quick_links` em desenvolvimento.
 * Conteúdo espelha fielmente o protótipo original no Lovable.
 */
export const quickLinksMock: QuickLink[] = [
  { id: "ql-1", title: "Google Drive", url: "https://drive.google.com", domain: "drive.google.com", category: "Trabalho", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-2", title: "Notion — Base de Projetos", url: "https://notion.so", domain: "notion.so", category: "Trabalho", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-3", title: "Trello — Sprint Atual", url: "https://trello.com", domain: "trello.com", category: "Trabalho", isPublic: true, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-4", title: "Coursera — Data Analytics", url: "https://coursera.org", domain: "coursera.org", category: "Estudos", isPublic: true, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-5", title: "Alura — Trilha SQL", url: "https://alura.com.br", domain: "alura.com.br", category: "Estudos", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-6", title: "Figma", url: "https://figma.com", domain: "figma.com", category: "Ferramentas", isPublic: true, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-7", title: "Canva", url: "https://canva.com", domain: "canva.com", category: "Ferramentas", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-8", title: "GitHub", url: "https://github.com", domain: "github.com", category: "Ferramentas", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-9", title: "Banco — Internet Banking", url: "https://bb.com.br", domain: "bb.com.br", category: "Pessoal", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
  { id: "ql-10", title: "Spotify", url: "https://spotify.com", domain: "spotify.com", category: "Pessoal", isPublic: false, createdAt: "2026-08-01T12:00:00.000Z" },
];
