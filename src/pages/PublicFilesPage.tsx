import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PanelLeft, ArrowLeft, Inbox } from "lucide-react";
import { QuickLinkCard } from "@/features/quick-links/QuickLinkCard";
import { SpreadsheetsTable } from "@/features/spreadsheets/SpreadsheetsTable";
import { FileCard } from "@/features/files/FileCard";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { quickLinksService, spreadsheetsService, filesService } from "@/services/supabase";
import { quickLinksMock } from "@/features/quick-links/mockData";
import { spreadsheetsMock } from "@/features/spreadsheets/mockData";
import { filesMock } from "@/features/files/mockData";
import type { AppFile, QuickLink, Spreadsheet } from "@/types";

/**
 * Página pública, acessível sem login — lista apenas os itens que os usuários
 * marcaram explicitamente como "Disponibilizar para visitantes"
 * (campo `isPublic` / `is_public`), nos três tipos de conteúdo do painel.
 */
export function PublicFilesPage(): JSX.Element {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [files, setFiles] = useState<AppFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    Promise.allSettled([
      quickLinksService.listPublic(),
      spreadsheetsService.listPublic(),
      filesService.listPublic(),
    ]).then((results) => {
      if (isCancelled) return;

      const [linksResult, spreadsheetsResult, filesResult] = results;

      setQuickLinks(
        linksResult.status === "fulfilled" ? linksResult.value : quickLinksMock.filter((l) => l.isPublic)
      );
      setSpreadsheets(
        spreadsheetsResult.status === "fulfilled"
          ? spreadsheetsResult.value
          : spreadsheetsMock.filter((s) => s.isPublic)
      );
      setFiles(filesResult.status === "fulfilled" ? filesResult.value : filesMock.filter((f) => f.isPublic));
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const hasNothing = !isLoading && quickLinks.length === 0 && spreadsheets.length === 0 && files.length === 0;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PanelLeft className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-base font-semibold text-foreground">Painel Pessoal</span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Itens públicos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Links, planilhas e arquivos disponibilizados para visitantes, sem necessidade de login.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>
        ) : hasNothing ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Nada público no momento</p>
            <p className="text-sm text-muted-foreground">
              Os donos dos itens ainda não disponibilizaram nada para visitantes.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-10">
            {quickLinks.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-foreground">Links Rápidos</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {quickLinks.map((link) => (
                    <QuickLinkCard key={link.id} quickLink={link} hideVisibility />
                  ))}
                </div>
              </section>
            )}

            {spreadsheets.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-foreground">Planilhas</h2>
                <SpreadsheetsTable spreadsheets={spreadsheets} hideVisibility />
              </section>
            )}

            {files.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-foreground">Arquivos & Documentos</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {files.map((file) => (
                    <FileCard key={file.id} file={file} hideVisibility />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  );
}
