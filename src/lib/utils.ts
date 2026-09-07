import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais (clsx) e resolve conflitos do Tailwind (twMerge).
 * Uso: cn("px-2 py-1", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Extrai o domínio de uma URL (ex: "https://drive.google.com" -> "drive.google.com"). */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Retorna a URL do favicon público de um domínio (mesma técnica usada no protótipo). */
export function faviconUrlFor(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

/** Formata uma data ISO no padrão brasileiro dd/mm/aaaa. */
export function formatDateBR(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

/** Gera as iniciais de um nome para usar em avatares (ex: "Renato Alves" -> "RA"). */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Constrói um "e-mail" sintético a partir do username, exigido internamente pelo
 * Supabase Auth (que só aceita e-mail/telefone como identificador), sem que o
 * usuário jamais precise ver ou informar um e-mail de verdade.
 */
export function usernameToSyntheticEmail(username: string): string {
  const normalized = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  return `${normalized}@my-space-pad.internal`;
}

/**
 * Valida o formato de um username antes de tentar cadastrá-lo — mesmas regras
 * usadas para gerar o e-mail sintético (letras, números, ".", "_" e "-").
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_.-]{3,32}$/.test(username.trim());
}

/** Paleta de tons usada para colorir categorias personalizadas de forma estável. */
const CATEGORY_TONES = ["indigo", "violet", "amber", "green", "rose", "neutral"] as const;
export type CategoryTone = (typeof CATEGORY_TONES)[number];

/**
 * Deriva um tom de cor estável a partir do nome da categoria (mesmo nome sempre
 * gera a mesma cor), já que categorias são criadas livremente pelo usuário e não
 * podem ter uma cor fixa pré-definida.
 */
export function categoryToneFor(categoryName: string): CategoryTone {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i += 1) {
    hash = (hash * 31 + categoryName.charCodeAt(i)) >>> 0;
  }
  const tone = CATEGORY_TONES[hash % CATEGORY_TONES.length];
  return tone ?? "neutral";
}
