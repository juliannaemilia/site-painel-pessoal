import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Link2,
  FileSpreadsheet,
  FolderOpen,
  Globe,
  Settings,
  PanelLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/dashboard/links-rapidos", label: "Links Rápidos", icon: Link2 },
  { to: "/dashboard/planilhas", label: "Planilhas", icon: FileSpreadsheet },
  { to: "/dashboard/arquivos", label: "Documentos & Arquivos", icon: FolderOpen },
  { to: "/dashboard/publicos", label: "Itens Públicos", icon: Globe },
  { to: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modo compacto (apenas ícones) para telas grandes — não afeta o comportamento mobile. */
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps): JSX.Element {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        onClick={onToggleCollapse}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[hsl(var(--sidebar-bg))] transition-[transform,width] duration-200 lg:static lg:translate-x-0 lg:cursor-pointer",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className={cn("flex h-16 items-center gap-2 px-5", isCollapsed && "lg:justify-center lg:px-0")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <PanelLeft className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className={cn("text-base font-semibold text-white", isCollapsed && "lg:hidden")}>
            Painel Pessoal
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={(event) => {
                // Navegar por um item não deve recolher/expandir a sidebar —
                // só cliques fora dos links (na "parte vazia" dela) fazem isso.
                event.stopPropagation();
                onClose();
              }}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isCollapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-[hsl(var(--sidebar-active))] text-white"
                    : "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={cn(isCollapsed && "lg:hidden")}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={(event) => {
            // Evita alternar duas vezes (uma pelo botão, outra pelo clique que
            // "vaza" para o <aside>).
            event.stopPropagation();
            onToggleCollapse();
          }}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          className={cn(
            "mx-3 mb-4 hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
            "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-white lg:flex",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              Recolher menu
            </>
          )}
        </button>
      </aside>
    </>
  );
}
