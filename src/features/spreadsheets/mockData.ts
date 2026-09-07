import type { Spreadsheet } from "@/types";

/** Dados de demonstração — mesma finalidade descrita em features/quick-links/mockData.ts. */
export const spreadsheetsMock: Spreadsheet[] = [
  { id: "sp-1", name: "Orçamento Mensal 2026", platform: "Google Sheets", url: "https://docs.google.com/spreadsheets", category: "Pessoal", isPublic: false },
  { id: "sp-2", name: "Controle de Clientes", platform: "Excel", url: "https://onedrive.live.com", category: "Trabalho", isPublic: false },
  { id: "sp-3", name: "Roadmap de Produto", platform: "Notion", url: "https://notion.so", category: "Trabalho", isPublic: true },
  { id: "sp-4", name: "Cronograma de Estudos", platform: "Google Sheets", url: "https://docs.google.com/spreadsheets", category: "Estudos", isPublic: true },
  { id: "sp-5", name: "Metas 2025 (histórico)", platform: "Excel", url: "https://onedrive.live.com", category: "Pessoal", isPublic: false },
  { id: "sp-6", name: "Inventário de Ferramentas", platform: "Notion", url: "https://notion.so", category: "Ferramentas", isPublic: false },
];
