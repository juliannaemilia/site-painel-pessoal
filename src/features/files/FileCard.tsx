import { FileText, FileImage, FileSpreadsheet, File as FileIcon, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CategoryBadge, VisibilityBadge } from "@/components/ui/Badge";
import type { AppFile, TipoArquivo } from "@/types";

const ICONS: Record<TipoArquivo, typeof FileText> = {
  PDF: FileText,
  DOC: FileText,
  Imagem: FileImage,
  Planilha: FileSpreadsheet,
  Outro: FileIcon,
};

export interface FileCardProps {
  file: AppFile;
  onEdit?: (file: AppFile) => void;
  onRemove?: (id: string) => void;
  /** Oculta a badge de visibilidade e as ações de edição/remoção — usado na página pública. */
  hideVisibility?: boolean;
}

export function FileCard({ file, onEdit, onRemove, hideVisibility }: FileCardProps): JSX.Element {
  const Icon = ICONS[file.fileType];

  return (
    <Card className="group relative flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{file.fileName}</h3>
        <p className="text-xs text-muted-foreground">{file.fileType}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={file.category} />
          {!hideVisibility && <VisibilityBadge isPublic={file.isPublic} />}
        </div>

        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Abrir
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {(onEdit || onRemove) && (
        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(file)}
              aria-label={`Editar ${file.fileName}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              aria-label={`Remover ${file.fileName}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
