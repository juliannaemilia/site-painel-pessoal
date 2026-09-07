import { useCallback, useMemo, useState } from "react";
import { categoriesService } from "@/services/supabase";
import { categoriesMock } from "@/features/categories/mockData";
import { useFetchData } from "./useFetchData";
import type { Category, CategoryFormValues } from "@/types";

interface UseCategoriesResult {
  categories: Category[];
  categoryNames: string[];
  isLoading: boolean;
  error: string | null;
  isDemoData: boolean;
  addCategory: (values: CategoryFormValues) => Promise<Category>;
  /** Retorna o nome antigo junto com a categoria atualizada, para quem precisar propagar a mudança. */
  renameCategory: (id: string, newName: string) => Promise<{ oldName: string; category: Category }>;
  removeCategory: (id: string) => Promise<void>;
}

/** Hook de abstração para categorias personalizadas (criadas livremente pelo usuário). */
export function useCategories(userId: string | undefined): UseCategoriesResult {
  const [isMutating, setIsMutating] = useState(false);
  const [localOverride, setLocalOverride] = useState<Category[] | null>(null);

  const { data, isLoading, error, isDemoData } = useFetchData<Category[]>({
    fetcher: () => categoriesService.list(userId as string),
    fallback: categoriesMock,
    deps: [userId],
    enabled: Boolean(userId),
  });

  const categories = useMemo(() => localOverride ?? data ?? [], [localOverride, data]);
  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);

  const addCategory = useCallback(
    async (values: CategoryFormValues): Promise<Category> => {
      const trimmedName = values.name.trim();
      const existing = categories.find((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
      if (existing) return existing;

      setIsMutating(true);
      try {
        if (!userId) throw new Error("Usuário não autenticado.");
        const created = await categoriesService.create(userId, { name: trimmedName });
        setLocalOverride([...categories, created]);
        return created;
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        const optimistic: Category = {
          id: `local-${Date.now()}`,
          name: trimmedName,
          createdAt: new Date().toISOString(),
        };
        setLocalOverride([...categories, optimistic]);
        return optimistic;
      } finally {
        setIsMutating(false);
      }
    },
    [userId, categories]
  );

  const removeCategory = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      try {
        await categoriesService.remove(id);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Ignora erro de rede em modo demo — remoção local ainda é aplicada abaixo.
      } finally {
        setLocalOverride(categories.filter((category) => category.id !== id));
        setIsMutating(false);
      }
    },
    [categories]
  );

  const renameCategory = useCallback(
    async (id: string, newName: string): Promise<{ oldName: string; category: Category }> => {
      const trimmedName = newName.trim();
      const target = categories.find((category) => category.id === id);
      const oldName = target?.name ?? trimmedName;

      setIsMutating(true);
      try {
        let renamed: Category = { id, name: trimmedName, createdAt: target?.createdAt ?? new Date().toISOString() };

        if (userId) {
          try {
            renamed = await categoriesService.rename(userId, id, oldName, trimmedName);
          } catch (error) {
            if (!import.meta.env.DEV) throw error;
            // Modo demo / offline: aplica a renomeação apenas localmente.
          }
        }

        setLocalOverride(categories.map((category) => (category.id === id ? renamed : category)));
        return { oldName, category: renamed };
      } finally {
        setIsMutating(false);
      }
    },
    [userId, categories]
  );

  return {
    categories,
    categoryNames,
    isLoading: isLoading || isMutating,
    error,
    isDemoData,
    addCategory,
    renameCategory,
    removeCategory,
  };
}
