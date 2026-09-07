import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { PlatformSelect } from "@/components/shared/PlatformSelect";
import type { TipoArquivo } from "@/types";

const TIPOS_ARQUIVO: TipoArquivo[] = ["PDF", "DOC", "Imagem", "Planilha", "Outro"];

export type EditItemType = "link" | "planilha" | "arquivo";

export interface EditItemSaveValues {
  title: string;
  url: string;
  category: string;
  isPublic: boolean;
  platform?: string;
  fileType?: TipoArquivo;
}

export interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: EditItemType;
  /** Título/nome atual do item (campo "title" no Link, "name" na Planilha, "fileName" no Arquivo). */
  currentTitle: string;
  currentUrl: string;
  currentCategory: string;
  currentIsPublic: boolean;
  /** Obrigatório apenas quando type === "planilha". */
  currentPlatform?: string;
  /** Obrigatório apenas quando type === "arquivo". */
  currentFileType?: TipoArquivo;
  onSave: (values: EditItemSaveValues) => Promise<void>;
}

const TITLE_LABEL: Record<EditItemType, string> = {
  link: "Título",
  planilha: "Nome da planilha",
  arquivo: "Nome do arquivo",
};

const URL_LABEL: Record<EditItemType, string> = {
  link: "URL",
  planilha: "URL",
  arquivo: "Link do arquivo",
};

/**
 * Modal compartilhado para editar todos os campos de um Link Rápido, Planilha
 * ou Arquivo já existente (título/nome, URL, categoria, plataforma quando
 * aplicável, e visibilidade) — usado nas 3 listagens, na Visão Geral e na
 * página "Itens Públicos".
 */
export function EditItemModal({
  isOpen,
  onClose,
  type,
  currentTitle,
  currentUrl,
  currentCategory,
  currentIsPublic,
  currentPlatform,
  currentFileType,
  onSave,
}: EditItemModalProps): JSX.Element {
  const [category, setCategory] = useState(currentCategory);
  const [platform, setPlatform] = useState(currentPlatform ?? "");
  const [isPublic, setIsPublic] = useState(currentIsPublic);
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza o estado interno sempre que o modal é reaberto para um item diferente.
  useEffect(() => {
    if (isOpen) {
      setCategory(currentCategory);
      setPlatform(currentPlatform ?? "");
      setIsPublic(currentIsPublic);
    }
  }, [isOpen, currentCategory, currentPlatform, currentIsPublic]);

  const canSubmit = Boolean(category) && (type !== "planilha" || Boolean(platform));

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      await onSave({
        title: String(formData.get("title") ?? ""),
        url: String(formData.get("url") ?? ""),
        category,
        isPublic,
        ...(type === "planilha" ? { platform } : {}),
        ...(type === "arquivo" ? { fileType: formData.get("fileType") as TipoArquivo } : {}),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar item" description={currentTitle}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
        <Input name="title" label={TITLE_LABEL[type]} defaultValue={currentTitle} required />
        <Input name="url" label={URL_LABEL[type]} type="url" defaultValue={currentUrl} required />

        {type === "arquivo" && (
          <Select name="fileType" label="Tipo" defaultValue={currentFileType ?? TIPOS_ARQUIVO[0]} required>
            {TIPOS_ARQUIVO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </Select>
        )}

        {type === "planilha" && <PlatformSelect value={platform} onChange={setPlatform} />}

        <CategorySelect value={category} onChange={setCategory} />

        <Checkbox
          label="Disponibilizar para usuários visitantes (visível na página pública, sem login)"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={!canSubmit}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
