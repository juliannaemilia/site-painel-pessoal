import { useState } from "react";
import { FilesGrid } from "@/features/files/FilesGrid";
import { EditItemModal } from "@/components/modals/EditItemModal";
import { useAppData } from "@/hooks/useAppData";
import type { AppFile } from "@/types";

export function FilesPage(): JSX.Element {
  const { files, updateFile, removeFile, isFilesLoading } = useAppData();
  const [editingFile, setEditingFile] = useState<AppFile | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-foreground">Arquivos & Documentos</h2>
      <p className="mb-4 text-sm text-muted-foreground">PDFs, documentos e imagens com acesso direto</p>

      {isFilesLoading ? (
        <p className="text-sm text-muted-foreground">Carregando arquivos…</p>
      ) : (
        <FilesGrid files={files} onEdit={setEditingFile} onRemove={(id) => void removeFile(id)} />
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
