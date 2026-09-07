import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { CategoryFilterTabs } from "@/components/ui/CategoryFilterTabs";
import { QuickLinkCard } from "./QuickLinkCard";
import type { CategoriaFiltro, QuickLink } from "@/types";

export interface QuickLinksGridProps {
  quickLinks: QuickLink[];
  onEdit?: (quickLink: QuickLink) => void;
  onRemove?: (id: string) => void;
  limit?: number;
}

export function QuickLinksGrid({ quickLinks, onEdit, onRemove, limit }: QuickLinksGridProps): JSX.Element {
  const [filter, setFilter] = useState<CategoriaFiltro>("Todas");

  // Deriva as categorias disponíveis a partir dos próprios itens recebidos, em vez
  // de depender do AppDataContext — assim o componente funciona tanto dentro do
  // dashboard autenticado quanto na página pública (sem login).
  const categoryNames = useMemo(
    () => Array.from(new Set(quickLinks.map((link) => link.category))).sort(),
    [quickLinks]
  );

  const filtered = useMemo(() => {
    const base = filter === "Todas" ? quickLinks : quickLinks.filter((link) => link.category === filter);
    return limit ? base.slice(0, limit) : base;
  }, [quickLinks, filter, limit]);

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilterTabs categories={categoryNames} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
          <Link2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">Nenhum link nessa categoria ainda</p>
          <p className="text-sm text-muted-foreground">Use "Adicionar Novo Item" para salvar seu primeiro link.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((quickLink) => (
            <QuickLinkCard key={quickLink.id} quickLink={quickLink} onEdit={onEdit} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
