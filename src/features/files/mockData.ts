import type { AppFile } from "@/types";

/**
 * Dados de demonstração — usados como fallback local quando o Supabase ainda
 * não está configurado. Cada arquivo é representado por um link externo, sem
 * upload/armazenamento de binário.
 */
export const filesMock: AppFile[] = [
  { id: "fl-1", fileName: "Contrato-Prestacao-Servicos.pdf", fileType: "PDF", url: "https://drive.google.com/file/d/exemplo-contrato", category: "Trabalho", isPublic: false, createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "fl-2", fileName: "Apresentacao-Q3.pdf", fileType: "PDF", url: "https://drive.google.com/file/d/exemplo-apresentacao", category: "Trabalho", isPublic: true, createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "fl-3", fileName: "Resumo-Estatistica.doc", fileType: "DOC", url: "https://docs.google.com/document/d/exemplo-resumo", category: "Estudos", isPublic: false, createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "fl-4", fileName: "Certificado-SQL.pdf", fileType: "PDF", url: "https://drive.google.com/file/d/exemplo-certificado", category: "Estudos", isPublic: true, createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "fl-5", fileName: "Logo-Marca-Final.png", fileType: "Imagem", url: "https://drive.google.com/file/d/exemplo-logo", category: "Ferramentas", isPublic: true, createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "fl-6", fileName: "Comprovante-IPTU.pdf", fileType: "PDF", url: "https://drive.google.com/file/d/exemplo-iptu", category: "Pessoal", isPublic: false, createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "fl-7", fileName: "Planilha-Viagem.xlsx", fileType: "Planilha", url: "https://docs.google.com/spreadsheets/d/exemplo-viagem", category: "Pessoal", isPublic: false, createdAt: "2026-08-01T00:00:00.000Z" },
];
