import { useCallback, useMemo, useState } from "react";
import { filesService, type FileUpdateValues } from "@/services/supabase";
import { filesMock } from "@/features/files/mockData";
import { useFetchData } from "./useFetchData";
import type { AppFile, AppFileFormValues } from "@/types";

export type { FileUpdateValues };

interface UseFilesResult {
  files: AppFile[];
  isLoading: boolean;
  error: string | null;
  isDemoData: boolean;
  addFile: (values: AppFileFormValues) => Promise<void>;
  /** Atualiza nome, tipo, link, categoria e visibilidade de um arquivo existente. */
  updateFile: (id: string, values: FileUpdateValues) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  /** Atualiza localmente o nome da categoria em todos os itens que usavam o nome antigo. */
  renameCategoryInItems: (oldName: string, newName: string) => void;
}

export function useFiles(userId: string | undefined): UseFilesResult {
  const [isMutating, setIsMutating] = useState(false);
  const [localOverride, setLocalOverride] = useState<AppFile[] | null>(null);

  const { data, isLoading, error, isDemoData } = useFetchData<AppFile[]>({
    fetcher: () => filesService.list(userId as string),
    fallback: filesMock,
    deps: [userId],
    enabled: Boolean(userId),
  });

  const files = useMemo(() => localOverride ?? data ?? [], [localOverride, data]);

  const addFile = useCallback(
    async (values: AppFileFormValues): Promise<void> => {
      if (!userId) return;
      setIsMutating(true);
      try {
        const created = await filesService.create(userId, values);
        setLocalOverride([created, ...files]);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        const optimistic: AppFile = {
          id: `local-${Date.now()}`,
          fileName: values.fileName,
          fileType: values.fileType,
          url: values.url,
          category: values.category,
          isPublic: values.isPublic,
          createdAt: new Date().toISOString(),
        };
        setLocalOverride([optimistic, ...files]);
      } finally {
        setIsMutating(false);
      }
    },
    [userId, files]
  );

  const updateFile = useCallback(
    async (id: string, values: FileUpdateValues): Promise<void> => {
      setIsMutating(true);
      try {
        const updated = await filesService.update(id, values);
        setLocalOverride(files.map((file) => (file.id === id ? updated : file)));
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        setLocalOverride(
          files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  fileName: values.fileName,
                  fileType: values.fileType,
                  url: values.url,
                  category: values.category,
                  isPublic: values.isPublic,
                }
              : file
          )
        );
      } finally {
        setIsMutating(false);
      }
    },
    [files]
  );

  const removeFile = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      try {
        await filesService.remove(id);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Ignora erro de rede em modo demo — remoção local ainda é aplicada abaixo.
      } finally {
        setLocalOverride(files.filter((file) => file.id !== id));
        setIsMutating(false);
      }
    },
    [files]
  );

  const renameCategoryInItems = useCallback(
    (oldName: string, newName: string): void => {
      setLocalOverride(files.map((file) => (file.category === oldName ? { ...file, category: newName } : file)));
    },
    [files]
  );

  return {
    files,
    isLoading: isLoading || isMutating,
    error,
    isDemoData,
    addFile,
    updateFile,
    removeFile,
    renameCategoryInItems,
  };
}
