import { useState } from "react";
import { Link } from "react-router-dom";
import { Link2, FileSpreadsheet, FolderOpen, Globe, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { QuickLinksGrid } from "@/features/quick-links/QuickLinksGrid";
import { SpreadsheetsTable } from "@/features/spreadsheets/SpreadsheetsTable";
import { FilesGrid } from "@/features/files/FilesGrid";
import { EditItemModal } from "@/components/modals/EditItemModal";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import type { AppFile, QuickLink, Spreadsheet } from "@/types";

function SummaryCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Link2;
  label: string;
  value: number;
  to?: string;
}): JSX.Element {
  const content = (
    <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

function SectionHeader({ title, description, to }: { title: string; description: string; to: string }): JSX.Element {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Link
        to={to}
        className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
      >
        Ver todos
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function DashboardOverviewPage(): JSX.Element {
  const { user } = useAuth();
  const {
    quickLinks,
    updateQuickLink,
    removeQuickLink,
    spreadsheets,
    updateSpreadsheet,
    removeSpreadsheet,
    files,
    updateFile,
    removeFile,
  } = useAppData();

  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [editingSheet, setEditingSheet] = useState<Spreadsheet | null>(null);
  const [editingFile, setEditingFile] = useState<AppFile | null>(null);

  const publicItemsCount =
    quickLinks.filter((l) => l.isPublic).length +
    spreadsheets.filter((s) => s.isPublic).length +
    files.filter((f) => f.isPublic).length;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá bem-vindo (a), {user?.fullName ?? "visitante"}</h1>
        <p className="text-sm text-muted-foreground">Aqui está um resumo do seu painel pessoal.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={Link2} label="Links Rápidos" value={quickLinks.length} to="/dashboard/links-rapidos" />
        <SummaryCard icon={FileSpreadsheet} label="Planilhas" value={spreadsheets.length} to="/dashboard/planilhas" />
        <SummaryCard icon={FolderOpen} label="Arquivos & Documentos" value={files.length} to="/dashboard/arquivos" />
        <SummaryCard icon={Globe} label="Itens Públicos" value={publicItemsCount} to="/dashboard/publicos" />
      </div>

      <section>
        <SectionHeader
          title="Links Rápidos"
          description="Seus favoritos e atalhos organizados por categoria"
          to="/dashboard/links-rapidos"
        />
        <QuickLinksGrid
          quickLinks={quickLinks}
          onEdit={setEditingLink}
          onRemove={(id) => void removeQuickLink(id)}
          limit={4}
        />
      </section>

      <section>
        <SectionHeader
          title="Central de Planilhas"
          description="Google Sheets, Excel e Notion em um só lugar"
          to="/dashboard/planilhas"
        />
        <SpreadsheetsTable
          spreadsheets={spreadsheets.slice(0, 5)}
          onEdit={setEditingSheet}
          onRemove={(id) => void removeSpreadsheet(id)}
        />
      </section>

      <section>
        <SectionHeader
          title="Arquivos & Documentos"
          description="PDFs, documentos e imagens com acesso direto"
          to="/dashboard/arquivos"
        />
        <FilesGrid files={files} onEdit={setEditingFile} onRemove={(id) => void removeFile(id)} limit={3} />
      </section>

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
      {editingSheet && (
        <EditItemModal
          isOpen={Boolean(editingSheet)}
          onClose={() => setEditingSheet(null)}
          type="planilha"
          currentTitle={editingSheet.name}
          currentUrl={editingSheet.url}
          currentCategory={editingSheet.category}
          currentPlatform={editingSheet.platform}
          currentIsPublic={editingSheet.isPublic}
          onSave={(values) =>
            updateSpreadsheet(editingSheet.id, {
              name: values.title,
              url: values.url,
              category: values.category,
              platform: values.platform ?? editingSheet.platform,
              isPublic: values.isPublic,
            })
          }
        />
      )}
      {editingFile && (
        <EditItemModal
          isOpen={Boolean(editingFile)}
          onClose={() => setEditingFile(null)}
          type="arquivo"
          currentTitle={editingFile.fileName}
          currentUrl={editingFile.url}
          currentCategory={editingFile.category}
          currentFileType={editingFile.fileType}
          currentIsPublic={editingFile.isPublic}
          onSave={(values) =>
            updateFile(editingFile.id, {
              fileName: values.title,
              url: values.url,
              category: values.category,
              fileType: values.fileType ?? editingFile.fileType,
              isPublic: values.isPublic,
            })
          }
        />
      )}
    </div>
  );
}
