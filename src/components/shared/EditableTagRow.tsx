import { useState, type ReactNode } from "react";
import { X, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";

export interface EditableTagRowProps {
  id: string;
  name: string;
  /** Renderiza o "chip" visual do item (ex: <CategoryBadge /> ou uma badge simples). */
  renderBadge: (name: string) => ReactNode;
  onRename: (id: string, newName: string) => Promise<void>;
  onRemove: (id: string) => void;
  /** Usado nos aria-labels dos botões, ex: "categoria" ou "plataforma". */
  itemKind: string;
}

/**
 * Linha reutilizável de "tag" com edição inline (clique no lápis vira um
 * input com salvar/cancelar) e remoção — usada tanto para Categorias quanto
 * para Plataformas em Configurações.
 */
export function EditableTagRow({ id, name, renderBadge, onRename, onRemove, itemKind }: EditableTagRowProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(): Promise<void> {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === name) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onRename(id, trimmed);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1">
        <Input
          autoFocus
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSave();
            }
            if (event.key === "Escape") {
              setIsEditing(false);
              setDraftName(name);
            }
          }}
          className="h-8 w-40 text-sm"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          aria-label="Salvar novo nome"
          disabled={isSaving}
          className="rounded-md p-1 text-success hover:bg-success/10 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setDraftName(name);
          }}
          aria-label="Cancelar edição"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      {renderBadge(name)}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label={`Renomear ${itemKind} ${name}`}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={() => onRemove(id)}
        aria-label={`Remover ${itemKind} ${name}`}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
