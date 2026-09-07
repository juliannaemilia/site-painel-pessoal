import { cn } from "@/lib/utils";
import type { CategoriaFiltro } from "@/types";

export interface CategoryFilterTabsProps {
  /** Nomes das categorias disponíveis (personalizadas pelo usuário), sem incluir "Todas". */
  categories: string[];
  value: CategoriaFiltro;
  onChange: (value: CategoriaFiltro) => void;
  className?: string;
}

export function CategoryFilterTabs({ categories, value, onChange, className }: CategoryFilterTabsProps): JSX.Element {
  const options: CategoriaFiltro[] = ["Todas", ...categories];

  return (
    <div
      role="tablist"
      aria-label="Filtrar por categoria"
      className={cn("inline-flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1", className)}
    >
      {options.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={value === category}
          onClick={() => onChange(category)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            value === category
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
