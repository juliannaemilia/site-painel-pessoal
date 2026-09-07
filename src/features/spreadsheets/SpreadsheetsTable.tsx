import { useMemo, useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { CategoryFilterTabs } from "@/components/ui/CategoryFilterTabs";
import { CategoryBadge, VisibilityBadge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui/Table";
import type { CategoriaFiltro, Spreadsheet } from "@/types";

export interface SpreadsheetsTableProps {
  spreadsheets: Spreadsheet[];
  onEdit?: (spreadsheet: Spreadsheet) => void;
  onRemove?: (id: string) => void;
  /** Oculta a coluna de visibilidade — usado na página pública, onde é redundante. */
  hideVisibility?: boolean;
}

export function SpreadsheetsTable({ spreadsheets, onEdit, onRemove, hideVisibility }: SpreadsheetsTableProps): JSX.Element {
  const [filter, setFilter] = useState<CategoriaFiltro>("Todas");

  // Deriva as categorias disponíveis a partir dos próprios itens recebidos, em vez
  // de depender do AppDataContext — assim o componente funciona tanto dentro do
  // dashboard autenticado quanto na página pública (sem login).
  const categoryNames = useMemo(
    () => Array.from(new Set(spreadsheets.map((sheet) => sheet.category))).sort(),
    [spreadsheets]
  );

  const filtered = useMemo(
    () => (filter === "Todas" ? spreadsheets : spreadsheets.filter((sheet) => sheet.category === filter)),
    [spreadsheets, filter]
  );

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilterTabs categories={categoryNames} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium text-foreground">Nenhuma planilha nessa categoria ainda</p>
          <p className="text-sm text-muted-foreground">Use "Adicionar Novo Item" para salvar sua primeira planilha.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Planilha</TableHeadCell>
              <TableHeadCell>Plataforma</TableHeadCell>
              <TableHeadCell>Categoria</TableHeadCell>
              {!hideVisibility && <TableHeadCell>Visibilidade</TableHeadCell>}
              <TableHeadCell className="text-right">Ação</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((sheet) => (
              <TableRow key={sheet.id}>
                <TableCell className="font-medium">{sheet.name}</TableCell>
                <TableCell>{sheet.platform}</TableCell>
                <TableCell>
                  <CategoryBadge category={sheet.category} />
                </TableCell>
                {!hideVisibility && (
                  <TableCell>
                    <VisibilityBadge isPublic={sheet.isPublic} />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center justify-end gap-3">
                    <a
                      href={sheet.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Abrir Planilha
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(sheet)}
                        aria-label={`Editar ${sheet.name}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(sheet.id)}
                        aria-label={`Remover ${sheet.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
