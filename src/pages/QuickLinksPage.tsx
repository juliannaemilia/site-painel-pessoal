import { useState } from "react";
import { QuickLinksGrid } from "@/features/quick-links/QuickLinksGrid";
import { EditItemModal } from "@/components/modals/EditItemModal";
import { useAppData } from "@/hooks/useAppData";
import type { QuickLink } from "@/types";

export function QuickLinksPage(): JSX.Element {
  const { quickLinks, updateQuickLink, removeQuickLink, isQuickLinksLoading } = useAppData();
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-foreground">Links Rápidos</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Seus favoritos e atalhos organizados por categoria
      </p>

      {isQuickLinksLoading ? (
        <p className="text-sm text-muted-foreground">Carregando links…</p>
      ) : (
        <QuickLinksGrid
          quickLinks={quickLinks}
          onEdit={setEditingLink}
          onRemove={(id) => void removeQuickLink(id)}
        />
      )}

      {editingLink && (
        <EditItemModal
          isOpen={Boolean(editingLink)}
          onClose={() => setEditingLink(null)}
          type="link"
          currentTitle={editingLink.title}
          currentUrl={editingLink.url}
          currentCategory={editingLink.category}
          currentIsPublic={editingLink.isPublic}
          onSave={(values) =>
            updateQuickLink(editingLink.id, {
              title: values.title,
              url: values.url,
              category: values.category,
              isPublic: values.isPublic,
            })
          }
        />
      )}
    </div>
  );
}
