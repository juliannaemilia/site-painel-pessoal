import { createContext, useCallback, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useQuickLinks, type QuickLinkUpdateValues } from "@/hooks/useQuickLinks";
import { useSpreadsheets, type SpreadsheetUpdateValues } from "@/hooks/useSpreadsheets";
import { useFiles, type FileUpdateValues } from "@/hooks/useFiles";
import type {
  AppFile,
  AppFileFormValues,
  Category,
  CategoryFormValues,
  Platform,
  PlatformFormValues,
  QuickLink,
  QuickLinkFormValues,
  Spreadsheet,
  SpreadsheetFormValues,
} from "@/types";

export interface AppDataContextValue {
  categories: Category[];
  categoryNames: string[];
  isCategoriesLoading: boolean;
  addCategory: (values: CategoryFormValues) => Promise<Category>;
  renameCategory: (id: string, newName: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  platforms: Platform[];
  platformNames: string[];
  isPlatformsLoading: boolean;
  addPlatform: (values: PlatformFormValues) => Promise<Platform>;
  renamePlatform: (id: string, newName: string) => Promise<void>;
  removePlatform: (id: string) => Promise<void>;

  quickLinks: QuickLink[];
  isQuickLinksLoading: boolean;
  isQuickLinksDemoData: boolean;
  addQuickLink: (values: QuickLinkFormValues) => Promise<void>;
  updateQuickLink: (id: string, values: QuickLinkUpdateValues) => Promise<void>;
  removeQuickLink: (id: string) => Promise<void>;

  spreadsheets: Spreadsheet[];
  isSpreadsheetsLoading: boolean;
  isSpreadsheetsDemoData: boolean;
  addSpreadsheet: (values: SpreadsheetFormValues) => Promise<void>;
  updateSpreadsheet: (id: string, values: SpreadsheetUpdateValues) => Promise<void>;
  removeSpreadsheet: (id: string) => Promise<void>;

  files: AppFile[];
  isFilesLoading: boolean;
  isFilesDemoData: boolean;
  addFile: (values: AppFileFormValues) => Promise<void>;
  updateFile: (id: string, values: FileUpdateValues) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
}

export const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

/**
 * Fonte única de verdade para Categorias, Plataformas, Links Rápidos, Planilhas
 * e Arquivos. Envolve as páginas do dashboard e o AddItemModal para que todos
 * leiam/escrevam exatamente o mesmo estado.
 */
export function AppDataProvider({ children }: AppDataProviderProps): JSX.Element {
  const { user } = useAuth();
  const userId = user?.id;

  const categoriesState = useCategories(userId);
  const platformsState = usePlatforms(userId);
  const quickLinksState = useQuickLinks(userId);
  const spreadsheetsState = useSpreadsheets(userId);
  const filesState = useFiles(userId);

  const renameCategory = useCallback(
    async (id: string, newName: string): Promise<void> => {
      const { oldName, category } = await categoriesState.renameCategory(id, newName);

      // Propaga o novo nome para todos os itens que usavam a categoria antiga,
      // para que a UI reflita a renomeação imediatamente, sem precisar recarregar.
      if (oldName !== category.name) {
        quickLinksState.renameCategoryInItems(oldName, category.name);
        spreadsheetsState.renameCategoryInItems(oldName, category.name);
        filesState.renameCategoryInItems(oldName, category.name);
      }
    },
    [categoriesState, quickLinksState, spreadsheetsState, filesState]
  );

  const renamePlatform = useCallback(
    async (id: string, newName: string): Promise<void> => {
      const { oldName, platform } = await platformsState.renamePlatform(id, newName);

      // Só planilhas usam plataforma, então a propagação fica restrita a elas.
      if (oldName !== platform.name) {
        spreadsheetsState.renamePlatformInItems(oldName, platform.name);
      }
    },
    [platformsState, spreadsheetsState]
  );

  const value: AppDataContextValue = {
    categories: categoriesState.categories,
    categoryNames: categoriesState.categoryNames,
    isCategoriesLoading: categoriesState.isLoading,
    addCategory: categoriesState.addCategory,
    renameCategory,
    removeCategory: categoriesState.removeCategory,

    platforms: platformsState.platforms,
    platformNames: platformsState.platformNames,
    isPlatformsLoading: platformsState.isLoading,
    addPlatform: platformsState.addPlatform,
    renamePlatform,
    removePlatform: platformsState.removePlatform,

    quickLinks: quickLinksState.quickLinks,
    isQuickLinksLoading: quickLinksState.isLoading,
    isQuickLinksDemoData: quickLinksState.isDemoData,
    addQuickLink: quickLinksState.addQuickLink,
    updateQuickLink: quickLinksState.updateQuickLink,
    removeQuickLink: quickLinksState.removeQuickLink,

    spreadsheets: spreadsheetsState.spreadsheets,
    isSpreadsheetsLoading: spreadsheetsState.isLoading,
    isSpreadsheetsDemoData: spreadsheetsState.isDemoData,
    addSpreadsheet: spreadsheetsState.addSpreadsheet,
    updateSpreadsheet: spreadsheetsState.updateSpreadsheet,
    removeSpreadsheet: spreadsheetsState.removeSpreadsheet,

    files: filesState.files,
    isFilesLoading: filesState.isLoading,
    isFilesDemoData: filesState.isDemoData,
    addFile: filesState.addFile,
    updateFile: filesState.updateFile,
    removeFile: filesState.removeFile,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
