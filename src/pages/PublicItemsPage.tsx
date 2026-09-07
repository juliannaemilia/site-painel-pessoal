import { useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { QuickLinksGrid } from "@/features/quick-links/QuickLinksGrid";
import { SpreadsheetsTable } from "@/features/spreadsheets/SpreadsheetsTable";
import { FilesGrid } from "@/features/files/FilesGrid";
import { EditItemModal } from "@/components/modals/EditItemModal";
import { useAppData } from "@/hooks/useAppData";
import type { AppFile, QuickLink, Spreadsheet } from "@/types";

/**
 * Página privada (dentro do dashboard) onde o próprio usuário revisa, em um
 * só lugar, todos os Links Rápidos, Planilhas e Arquivos que já marcou como
 * públicos — com atalho para trocar a categoria ou tornar o item privado de
 * novo, sem precisar caçar item por item nas listagens.
 */
export function PublicItemsPage(): JSX.Element {
  const {
    quickLinks,
    updateQuickLink,
    removeQuickLink,
    isQuickLinksLoading,
    spreadsheets,
    updateSpreadsheet,
    removeSpreadsheet,
    isSpreadsheetsLoading,
    files,
    updateFile,
    removeFile,
    isFilesLoading,
  } = useAppData();

  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [editingSheet, setEditingSheet] = useState<Spreadsheet | null>(null);
  const [editingFile, setEditingFile] = useState<AppFile | null>(null);

  const publicQuickLinks = useMemo(() => quickLinks.filter((link) => link.isPublic), [quickLinks]);
  const publicSpreadsheets = useMemo(() => spreadsheets.filter((sheet) => sheet.isPublic), [spreadsheets]);
  const publicFiles = useMemo(() => files.filter((file) => file.isPublic), [files]);

  const isLoading = isQuickLinksLoading || isSpreadsheetsLoading || isFilesLoading;
  const hasNothing =
    !isLoading && publicQuickLinks.length === 0 && publicSpreadsheets.length === 0 && publicFiles.length === 0;

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-foreground">Itens Públicos</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Tudo que você disponibilizou para visitantes, reunido em um só lugar. Veja como aparece para eles em{" "}
        <a href="/visitante" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
          /visitante
        </a>
        .
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : hasNothing ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Globe className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">Nenhum item público ainda</p>
          <p className="text-sm text-muted-foreground">
            Marque "Disponibilizar para usuários visitantes" ao criar ou editar um item para ele aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {publicQuickLinks.length > 0 && (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Links Rápidos <span className="text-sm font-normal text-muted-foreground">({publicQuickLinks.length})</span>
              </h3>
              <QuickLinksGrid
                quickLinks={publicQuickLinks}
                onEdit={setEditingLink}
                onRemove={(id) => void removeQuickLink(id)}
              />
            </section>
          )}

          {publicSpreadsheets.length > 0 && (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Planilhas <span className="text-sm font-normal text-muted-foreground">({publicSpreadsheets.length})</span>
              </h3>
              <SpreadsheetsTable
                spreadsheets={publicSpreadsheets}
                onEdit={setEditingSheet}
                onRemove={(id) => void removeSpreadsheet(id)}
              />
            </section>
          )}

          {publicFiles.length > 0 && (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Arquivos & Documentos <span className="text-sm font-normal text-muted-foreground">({publicFiles.length})</span>
              </h3>
              <FilesGrid files={publicFiles} onEdit={setEditingFile} onRemove={(id) => void removeFile(id)} />
            </section>
          )}
        </div>
      )}

      {editingLink && (
        <EditItemModal
          isOpen={Boolean(editingLink)}
          onClose={() => setEditingLink(null)}
          type="link"
          currentTitle={editingLink.title}
          currentUrl={editingLink.url}
          currentCategory={editingLink.category}
          currentIsPublic={editingLink.isPublic}
          onSave={(values) =>
            updateQuickLink(editingLink.id, {
              title: values.title,
              url: values.url,
              category: values.category,
              isPublic: values.isPublic,
            })
          }
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
      {editingFile && (
        <EditItemModal
          isOpen={Boolean(editingFile)}
          onClose={() => setEditingFile(null)}
          type="arquivo"
          currentTitle={editingFile.fileName}
          currentUrl={editingFile.url}
          currentCategory={editingFile.category}
          currentFileType={editingFile.fileType}
          currentIsPublic={editingFile.isPublic}
          onSave={(values) =>
            updateFile(editingFile.id, {
              fileName: values.title,
              url: values.url,
              category: values.category,
              fileType: values.fileType ?? editingFile.fileType,
              isPublic: values.isPublic,
            })
          }
        />
      )}
    </div>
  );
}
