import { useCallback, useMemo, useState } from "react";
import { quickLinksService, type QuickLinkUpdateValues } from "@/services/supabase";
import { quickLinksMock } from "@/features/quick-links/mockData";
import { useFetchData } from "./useFetchData";
import type { QuickLink, QuickLinkFormValues } from "@/types";

export type { QuickLinkUpdateValues };

interface UseQuickLinksResult {
  quickLinks: QuickLink[];
  isLoading: boolean;
  error: string | null;
  isDemoData: boolean;
  addQuickLink: (values: QuickLinkFormValues) => Promise<void>;
  /** Atualiza título, URL, categoria e visibilidade de um link existente. */
  updateQuickLink: (id: string, values: QuickLinkUpdateValues) => Promise<void>;
  removeQuickLink: (id: string) => Promise<void>;
  /** Atualiza localmente o nome da categoria em todos os itens que usavam o nome antigo. */
  renameCategoryInItems: (oldName: string, newName: string) => void;
}

export function useQuickLinks(userId: string | undefined): UseQuickLinksResult {
  const [isMutating, setIsMutating] = useState(false);
  const [localOverride, setLocalOverride] = useState<QuickLink[] | null>(null);

  const { data, isLoading, error, isDemoData } = useFetchData<QuickLink[]>({
    fetcher: () => quickLinksService.list(userId as string),
    fallback: quickLinksMock,
    deps: [userId],
    enabled: Boolean(userId),
  });

  const quickLinks = useMemo(() => localOverride ?? data ?? [], [localOverride, data]);

  const addQuickLink = useCallback(
    async (values: QuickLinkFormValues): Promise<void> => {
      if (!userId) return;
      setIsMutating(true);
      try {
        const created = await quickLinksService.create(userId, values);
        setLocalOverride([created, ...quickLinks]);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Modo demo / offline: adiciona localmente para manter a UI responsiva.
        const optimistic: QuickLink = {
          id: `local-${Date.now()}`,
          title: values.title,
          url: values.url,
          domain: new URL(values.url.startsWith("http") ? values.url : `https://${values.url}`).hostname,
          category: values.category,
          isPublic: values.isPublic,
          createdAt: new Date().toISOString(),
        };
        setLocalOverride([optimistic, ...quickLinks]);
      } finally {
        setIsMutating(false);
      }
    },
    [userId, quickLinks]
  );

  const updateQuickLink = useCallback(
    async (id: string, values: QuickLinkUpdateValues): Promise<void> => {
      setIsMutating(true);
      try {
        const updated = await quickLinksService.update(id, values);
        setLocalOverride(quickLinks.map((link) => (link.id === id ? updated : link)));
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Modo demo / offline: aplica a alteração apenas localmente.
        setLocalOverride(
          quickLinks.map((link) => {
            if (link.id !== id) return link;
            let domain = link.domain;
            try {
              domain = new URL(values.url.startsWith("http") ? values.url : `https://${values.url}`).hostname;
            } catch {
              // Mantém o domínio anterior se a URL digitada ainda estiver incompleta.
            }
            return { ...link, title: values.title, url: values.url, domain, category: values.category, isPublic: values.isPublic };
          })
        );
      } finally {
        setIsMutating(false);
      }
    },
    [quickLinks]
  );

  const removeQuickLink = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      try {
        await quickLinksService.remove(id);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Ignora erro de rede em modo demo — remoção local ainda é aplicada abaixo.
      } finally {
        setLocalOverride(quickLinks.filter((link) => link.id !== id));
        setIsMutating(false);
      }
    },
    [quickLinks]
  );

  const renameCategoryInItems = useCallback(
    (oldName: string, newName: string): void => {
      setLocalOverride(
        quickLinks.map((link) => (link.category === oldName ? { ...link, category: newName } : link))
      );
    },
    [quickLinks]
  );

  return {
    quickLinks,
    isLoading: isLoading || isMutating,
    error,
    isDemoData,
    addQuickLink,
    updateQuickLink,
    removeQuickLink,
    renameCategoryInItems,
  };
}
