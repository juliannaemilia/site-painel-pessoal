import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAppData } from "@/hooks/useAppData";

/** Valor especial da Select que abre o campo de "criar nova categoria". */
const NOVA_CATEGORIA_VALUE = "__nova_categoria__";

export interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Nome do campo no FormData quando usado dentro de um <form> nativo. */
  name?: string;
}

/**
 * Select de categoria com opção embutida de criar uma categoria nova na hora.
 * Compartilhado entre o AddItemModal e o EditItemModal para manter a mesma
 * experiência de "criar categoria sem sair do fluxo" em ambos os lugares.
 */
export function CategorySelect({ value, onChange, name = "category" }: CategorySelectProps): JSX.Element {
  const { categoryNames, addCategory } = useAppData();
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(): Promise<void> {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      const created = await addCategory({ name: trimmed });
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
        <label className="text-sm font-medium text-foreground">Nova categoria</label>
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Ex: Receitas, Viagens…"
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
      label="Categoria"
      value={value}
      onChange={(event) => {
        if (event.target.value === NOVA_CATEGORIA_VALUE) {
          setIsCreating(true);
          return;
        }
        onChange(event.target.value);
      }}
      required
    >
      {categoryNames.length === 0 && <option value="">Nenhuma categoria ainda</option>}
      {categoryNames.map((name_) => (
        <option key={name_} value={name_}>
          {name_}
        </option>
      ))}
      <option value={NOVA_CATEGORIA_VALUE}>+ Criar nova categoria…</option>
    </Select>
  );
}
