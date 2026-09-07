import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CategoryBadge, VisibilityBadge } from "@/components/ui/Badge";
import { faviconUrlFor } from "@/lib/utils";
import type { QuickLink } from "@/types";

export interface QuickLinkCardProps {
  quickLink: QuickLink;
  onEdit?: (quickLink: QuickLink) => void;
  onRemove?: (id: string) => void;
  /** Oculta a badge de visibilidade e as ações de edição/remoção — usado na página pública. */
  hideVisibility?: boolean;
}

export function QuickLinkCard({ quickLink, onEdit, onRemove, hideVisibility }: QuickLinkCardProps): JSX.Element {
  return (
    <Card className="group relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
      {(onEdit || onRemove) && (
        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(quickLink)}
              aria-label={`Editar ${quickLink.title}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(quickLink.id)}
              aria-label={`Remover ${quickLink.title}`}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <img
          src={faviconUrlFor(quickLink.domain)}
          alt=""
          className="h-9 w-9 rounded-lg border border-border object-contain p-1.5"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{quickLink.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{quickLink.domain}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryBadge category={quickLink.category} />
        {!hideVisibility && <VisibilityBadge isPublic={quickLink.isPublic} />}
      </div>

      <a
        href={quickLink.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Abrir
        <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}
