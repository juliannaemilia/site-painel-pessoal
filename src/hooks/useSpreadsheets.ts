import { useCallback, useMemo, useState } from "react";
import { spreadsheetsService, type SpreadsheetUpdateValues } from "@/services/supabase";
import { spreadsheetsMock } from "@/features/spreadsheets/mockData";
import { useFetchData } from "./useFetchData";
import type { Spreadsheet, SpreadsheetFormValues } from "@/types";

export type { SpreadsheetUpdateValues };

interface UseSpreadsheetsResult {
  spreadsheets: Spreadsheet[];
  isLoading: boolean;
  error: string | null;
  isDemoData: boolean;
  addSpreadsheet: (values: SpreadsheetFormValues) => Promise<void>;
  /** Atualiza nome, URL, plataforma, categoria e visibilidade de uma planilha existente. */
  updateSpreadsheet: (id: string, values: SpreadsheetUpdateValues) => Promise<void>;
  removeSpreadsheet: (id: string) => Promise<void>;
  /** Atualiza localmente o nome da categoria em todos os itens que usavam o nome antigo. */
  renameCategoryInItems: (oldName: string, newName: string) => void;
  /** Atualiza localmente o nome da plataforma em todos os itens que usavam o nome antigo. */
  renamePlatformInItems: (oldName: string, newName: string) => void;
}

export function useSpreadsheets(userId: string | undefined): UseSpreadsheetsResult {
  const [isMutating, setIsMutating] = useState(false);
  const [localOverride, setLocalOverride] = useState<Spreadsheet[] | null>(null);

  const { data, isLoading, error, isDemoData } = useFetchData<Spreadsheet[]>({
    fetcher: () => spreadsheetsService.list(userId as string),
    fallback: spreadsheetsMock,
    deps: [userId],
    enabled: Boolean(userId),
  });

  const spreadsheets = useMemo(() => localOverride ?? data ?? [], [localOverride, data]);

  const addSpreadsheet = useCallback(
    async (values: SpreadsheetFormValues): Promise<void> => {
      if (!userId) return;
      setIsMutating(true);
      try {
        const created = await spreadsheetsService.create(userId, values);
        setLocalOverride([created, ...spreadsheets]);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        const optimistic: Spreadsheet = {
          id: `local-${Date.now()}`,
          name: values.name,
          platform: values.platform,
          url: values.url,
          category: values.category,
          isPublic: values.isPublic,
        };
        setLocalOverride([optimistic, ...spreadsheets]);
      } finally {
        setIsMutating(false);
      }
    },
    [userId, spreadsheets]
  );

  const updateSpreadsheet = useCallback(
    async (id: string, values: SpreadsheetUpdateValues): Promise<void> => {
      setIsMutating(true);
      try {
        const updated = await spreadsheetsService.update(id, values);
        setLocalOverride(spreadsheets.map((sheet) => (sheet.id === id ? updated : sheet)));
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        setLocalOverride(
          spreadsheets.map((sheet) =>
            sheet.id === id
              ? {
                  ...sheet,
                  name: values.name,
                  url: values.url,
                  platform: values.platform,
                  category: values.category,
                  isPublic: values.isPublic,
                }
              : sheet
          )
        );
      } finally {
        setIsMutating(false);
      }
    },
    [spreadsheets]
  );

  const removeSpreadsheet = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      try {
        await spreadsheetsService.remove(id);
      } catch (error) {
        if (!import.meta.env.DEV) throw error;
        // Ignora erro de rede em modo demo — remoção local ainda é aplicada abaixo.
      } finally {
        setLocalOverride(spreadsheets.filter((sheet) => sheet.id !== id));
        setIsMutating(false);
      }
    },
    [spreadsheets]
  );

  const renameCategoryInItems = useCallback(
    (oldName: string, newName: string): void => {
      setLocalOverride(
        spreadsheets.map((sheet) => (sheet.category === oldName ? { ...sheet, category: newName } : sheet))
      );
    },
    [spreadsheets]
  );

  const renamePlatformInItems = useCallback(
    (oldName: string, newName: string): void => {
      setLocalOverride(
        spreadsheets.map((sheet) => (sheet.platform === oldName ? { ...sheet, platform: newName } : sheet))
      );
    },
    [spreadsheets]
  );

  return {
    spreadsheets,
    isLoading: isLoading || isMutating,
    error,
    isDemoData,
    addSpreadsheet,
    updateSpreadsheet,
    removeSpreadsheet,
    renameCategoryInItems,
    renamePlatformInItems,
  };
}
