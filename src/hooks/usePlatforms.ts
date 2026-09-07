import { useCallback, useMemo, useState } from "react";
import { platformsService } from "@/services/supabase";
import { platformsMock } from "@/features/platforms/mockData";
import { useFetchData } from "./useFetchData";
import type { Platform, PlatformFormValues } from "@/types";

interface UsePlatformsResult {
  platforms: Platform[];
  platformNames: string[];
  isLoading: boolean;
  error: string | null;
  isDemoData: boolean;
  addPlatform: (values: PlatformFormValues) => Promise<Platform>;
  /** Retorna o nome antigo junto com a plataforma atualizada, para quem precisar propagar a mudança. */
  renamePlatform: (id: string, newName: string) => Promise<{ oldName: string; platform: Platform }>;
  removePlatform: (id: string) => Promise<void>;
}

/** Hook de abstração para plataformas personalizadas (ex: qual serviço hospeda cada planilha). */
export function usePlatforms(userId: string | undefined): UsePlatformsResult {
  const [isMutating, setIsMutating] = useState(false);
  const [localOverride, setLocalOverride] = useState<Platform[] | null>(null);

  const { data, isLoading, error, isDemoData } = useFetchData<Platform[]>({
    fetcher: () => platformsService.list(userId as string),
    fallback: platformsMock,
    deps: [userId],
    enabled: Boolean(userId),
  });

  const platforms = useMemo(() => localOverride ?? data ?? [], [localOverride, data]);
  const platformNames = useMemo(() => platforms.map((platform) => platform.name), [platforms]);

  const addPlatform = useCallback(
    async (values: PlatformFormValues): Promise<Platform> => {
      const trimmedName = values.name.trim();
      const existing = platforms.find((p) => p.name.toLowerCase() === trimmedName.toLowerCase());
      if (existing) return existing;

      setIsMutating(true);
      try {
        if (!userId) throw new Error("Usuário não autenticado.");
        const created = await platformsService.create(userId, { name: trimmedName });
        setLocalOverride([...platforms, created]);
        return created;
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        const optimistic: Platform = {
          id: `local-${Date.now()}`,
          name: trimmedName,
          createdAt: new Date().toISOString(),
        };
        setLocalOverride([...platforms, optimistic]);
        return optimistic;
      } finally {
        setIsMutating(false);
      }
    },
    [userId, platforms]
  );

  const removePlatform = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      try {
        await platformsService.remove(id);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Ignora erro de rede em modo demo — remoção local ainda é aplicada abaixo.
      } finally {
        setLocalOverride(platforms.filter((platform) => platform.id !== id));
        setIsMutating(false);
      }
    },
    [platforms]
  );

  const renamePlatform = useCallback(
    async (id: string, newName: string): Promise<{ oldName: string; platform: Platform }> => {
      const trimmedName = newName.trim();
      const target = platforms.find((platform) => platform.id === id);
      const oldName = target?.name ?? trimmedName;

      setIsMutating(true);
      try {
        let renamed: Platform = { id, name: trimmedName, createdAt: target?.createdAt ?? new Date().toISOString() };

        if (userId) {
          try {
            renamed = await platformsService.rename(userId, id, oldName, trimmedName);
          } catch (error) {
            if (!import.meta.env.DEV) throw error;
            // Modo demo / offline: aplica a renomeação apenas localmente.
          }
        }

        setLocalOverride(platforms.map((platform) => (platform.id === id ? renamed : platform)));
        return { oldName, platform: renamed };
      } finally {
        setIsMutating(false);
      }
    },
    [userId, platforms]
  );

  return {
    platforms,
    platformNames,
    isLoading: isLoading || isMutating,
    error,
    isDemoData,
    addPlatform,
    renamePlatform,
    removePlatform,
  };
}
