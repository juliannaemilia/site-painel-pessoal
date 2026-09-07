import { useState, type FormEvent } from "react";
import { Link2, FileSpreadsheet, FolderOpen, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { PlatformSelect } from "@/components/shared/PlatformSelect";
import { cn } from "@/lib/utils";
import { useAppData } from "@/hooks/useAppData";
import type { NovoItemTipo, TipoArquivo } from "@/types";

const TIPOS_ARQUIVO: TipoArquivo[] = ["PDF", "DOC", "Imagem", "Planilha", "Outro"];

const TABS: { id: NovoItemTipo; label: string; icon: typeof Link2 }[] = [
  { id: "link", label: "Link Rápido", icon: Link2 },
  { id: "planilha", label: "Planilha", icon: FileSpreadsheet },
  { id: "arquivo", label: "Arquivo (link)", icon: FolderOpen },
];

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<NovoItemTipo>("link");
  const { addQuickLink, addSpreadsheet, addFile } = useAppData();
  const [category, setCategory] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPlanilhaTab = activeTab === "planilha";
  const canSubmit = Boolean(category) && (!isPlanilhaTab || Boolean(platform));

  function handleClose(): void {
    setActiveTab("link");
    setCategory("");
    setPlatform("");
    setIsPublic(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    try {
      if (activeTab === "link") {
        await addQuickLink({
          title: String(formData.get("title") ?? ""),
          url: String(formData.get("url") ?? ""),
          category,
          isPublic,
        });
      } else if (activeTab === "planilha") {
        await addSpreadsheet({
          name: String(formData.get("name") ?? ""),
          url: String(formData.get("url") ?? ""),
          platform,
          category,
          isPublic,
        });
      } else {
        await addFile({
          fileName: String(formData.get("fileName") ?? ""),
          fileType: formData.get("fileType") as TipoArquivo,
          url: String(formData.get("url") ?? ""),
          category,
          isPublic,
        });
      }
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar Novo Item"
      description="Escolha o tipo de item que deseja salvar no seu painel."
    >
      <div role="tablist" aria-label="Tipo de item" className="mb-5 grid grid-cols-3 gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTab === id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* key força reset do formulário ao trocar de aba */}
      <form
        key={activeTab}
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-4"
      >
        {activeTab === "link" && (
          <>
            <Input name="title" label="Título" placeholder="Ex: Google Drive" required />
            <Input name="url" label="URL" type="url" placeholder="https://..." required />
            <CategorySelect value={category} onChange={setCategory} />
          </>
        )}

        {activeTab === "planilha" && (
          <>
            <Input name="name" label="Nome da planilha" placeholder="Ex: Orçamento Mensal" required />
            <Input name="url" label="URL" type="url" placeholder="https://..." required />
            <PlatformSelect value={platform} onChange={setPlatform} />
            <CategorySelect value={category} onChange={setCategory} />
          </>
        )}

        {activeTab === "arquivo" && (
          <>
            <Input name="fileName" label="Nome do arquivo" placeholder="Ex: Contrato.pdf" required />
            <Input
              name="url"
              label="Link do arquivo"
              type="url"
              placeholder="https://drive.google.com/..."
              required
            />
            <Select name="fileType" label="Tipo" defaultValue={TIPOS_ARQUIVO[0]} required>
              {TIPOS_ARQUIVO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
            <CategorySelect value={category} onChange={setCategory} />
          </>
        )}

        <Checkbox
          label="Disponibilizar para usuários visitantes (visível na página pública, sem login)"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
            <Plus className="h-4 w-4" />
            Salvar Item
          </Button>
        </div>
      </form>
    </Modal>
  );
}
