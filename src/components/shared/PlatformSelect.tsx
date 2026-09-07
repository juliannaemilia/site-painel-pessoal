import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAppData } from "@/hooks/useAppData";

/** Valor especial da Select que abre o campo de "criar nova plataforma". */
const NOVA_PLATAFORMA_VALUE = "__nova_plataforma__";

export interface PlatformSelectProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

/**
 * Select de plataforma (Google Sheets, Excel, Notion...) com opção embutida
 * de criar uma plataforma nova na hora — mesmo padrão do CategorySelect.
 */
export function PlatformSelect({ value, onChange, name = "platform" }: PlatformSelectProps): JSX.Element {
  const { platformNames, addPlatform } = useAppData();
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(): Promise<void> {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      const created = await addPlatform({ name: trimmed });
      onChange(created.name);
      setIsCreating(false);
      setDraftName("");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCreating) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Nova plataforma</label>
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Ex: Airtable, Coda…"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleCreate();
              }
            }}
          />
          <Button type="button" size="md" onClick={() => void handleCreate()} isLoading={isSaving}>
            Criar
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={() => setIsCreating(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select
      name={name}
      label="Plataforma"
      value={value}
      onChange={(event) => {
        if (event.target.value === NOVA_PLATAFORMA_VALUE) {
          setIsCreating(true);
          return;
        }
        onChange(event.target.value);
      }}
      required
    >
      {platformNames.length === 0 && <option value="">Nenhuma plataforma ainda</option>}
      {platformNames.map((name_) => (
        <option key={name_} value={name_}>
          {name_}
        </option>
      ))}
      <option value={NOVA_PLATAFORMA_VALUE}>+ Criar nova plataforma…</option>
    </Select>
  );
}
