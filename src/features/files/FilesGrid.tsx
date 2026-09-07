import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import { CategoryFilterTabs } from "@/components/ui/CategoryFilterTabs";
import { FileCard } from "./FileCard";
import type { AppFile, CategoriaFiltro } from "@/types";

export interface FilesGridProps {
  files: AppFile[];
  onEdit?: (file: AppFile) => void;
  onRemove?: (id: string) => void;
  limit?: number;
}

export function FilesGrid({ files, onEdit, onRemove, limit }: FilesGridProps): JSX.Element {
  const [filter, setFilter] = useState<CategoriaFiltro>("Todas");

  // Deriva as categorias disponíveis a partir dos próprios itens recebidos, em vez
  // de depender do AppDataContext — assim o componente funciona tanto dentro do
  // dashboard autenticado quanto na página pública (sem login).
  const categoryNames = useMemo(
    () => Array.from(new Set(files.map((file) => file.category))).sort(),
    [files]
  );

  const filtered = useMemo(() => {
    const base = filter === "Todas" ? files : files.filter((file) => file.category === filter);
    return limit ? base.slice(0, limit) : base;
  }, [files, filter, limit]);

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilterTabs categories={categoryNames} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">Nenhum arquivo nessa categoria ainda</p>
          <p className="text-sm text-muted-foreground">Use "Adicionar Novo Item" para salvar o link do seu primeiro arquivo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file) => (
            <FileCard key={file.id} file={file} onEdit={onEdit} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
