import { useState } from "react";
import { SpreadsheetsTable } from "@/features/spreadsheets/SpreadsheetsTable";
import { EditItemModal } from "@/components/modals/EditItemModal";
import { useAppData } from "@/hooks/useAppData";
import type { Spreadsheet } from "@/types";

export function SpreadsheetsPage(): JSX.Element {
  const { spreadsheets, updateSpreadsheet, removeSpreadsheet, isSpreadsheetsLoading } = useAppData();
  const [editingSheet, setEditingSheet] = useState<Spreadsheet | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-foreground">Central de Planilhas</h2>
      <p className="mb-4 text-sm text-muted-foreground">Google Sheets, Excel e Notion em um só lugar</p>

      {isSpreadsheetsLoading ? (
        <p className="text-sm text-muted-foreground">Carregando planilhas…</p>
      ) : (
        <SpreadsheetsTable
          spreadsheets={spreadsheets}
          onEdit={setEditingSheet}
          onRemove={(id) => void removeSpreadsheet(id)}
        />
      )}

      {editingSheet && (
        <EditItemModal
          isOpen={Boolean(editingSheet)}
          onClose={() => setEditingSheet(null)}
          type="planilha"
          currentTitle={editingSheet.name}
          currentUrl={editingSheet.url}
          currentCategory={editingSheet.category}
          currentPlatform={editingSheet.platform}
          currentIsPublic={editingSheet.isPublic}
          onSave={(values) =>
            updateSpreadsheet(editingSheet.id, {
              name: values.title,
              url: values.url,
              category: values.category,
              platform: values.platform ?? editingSheet.platform,
              isPublic: values.isPublic,
            })
          }
        />
      )}
    </div>
  );
}
