import { Menu, Plus, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export interface HeaderProps {
  onMenuClick: () => void;
  onAddItemClick: () => void;
}

export function Header({ onMenuClick, onAddItemClick }: HeaderProps): JSX.Element {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground">Painel Pessoal</p>
          <h1 className="text-base font-semibold text-foreground sm:text-lg">{user?.fullName ?? "Visitante"}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onAddItemClick} size="md" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
          Adicionar Novo Item
        </Button>
        <Button onClick={onAddItemClick} size="icon" className="sm:hidden" aria-label="Adicionar Novo Item">
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Avatar fullName={user?.fullName ?? "Visitante"} avatarUrl={user?.avatarUrl} size="sm" />
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
