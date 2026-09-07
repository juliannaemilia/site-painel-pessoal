import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useTheme, type AccentColor, type ThemeMode } from "@/hooks/useTheme";

const modeOptions: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  Icon: typeof Sun;
}> = [
  { value: "light", label: "Claro", description: "Interface clara", Icon: Sun },
  { value: "dark", label: "Escuro", description: "Interface escura", Icon: Moon },
  { value: "system", label: "Sistema", description: "Segue o dispositivo", Icon: Monitor },
];

const accentOptions: Array<{
  value: AccentColor;
  label: string;
  hex: string;
  swatchClass: string;
}> = [
  { value: "petroleum", label: "Azul Petróleo", hex: "#3A5868", swatchClass: "bg-brand-petroleum" },
  { value: "orange", label: "Laranja", hex: "#B84A0E", swatchClass: "bg-brand-orange" },
  { value: "pink", label: "Rosa", hex: "#B83268", swatchClass: "bg-brand-pink" },
];

export function AppearanceSettings(): JSX.Element {
  const { mode, resolvedMode, accentColor, setMode, setAccentColor } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize o tema do painel. As preferências ficam salvas neste navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-7">
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">Modo</legend>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "system" ? `Usando o modo ${resolvedMode === "dark" ? "escuro" : "claro"} do sistema.` : "Escolha a aparência da interface."}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Modo de aparência">
            {modeOptions.map(({ value, label, description, Icon }) => {
              const selected = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMode(value)}
                  className={cn(
                    "flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">Cor primária</legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Define botões, links, foco, indicadores e outros destaques do dashboard.
          </p>

          <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label="Cor primária do tema">
            {accentOptions.map(({ value, label, hex, swatchClass }) => {
              const selected = accentColor === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${label}, ${hex}`}
                  onClick={() => setAccentColor(value)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60",
                  )}
                >
                  <span className={cn("relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10", swatchClass)}>
                    {selected && <Check className="h-4 w-4 text-white drop-shadow" aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hex}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
