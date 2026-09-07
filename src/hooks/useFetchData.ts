import { useCallback, useEffect, useState } from "react";

interface UseFetchDataOptions<T> {
  /** Chamada real (tipicamente um service do Supabase). */
  fetcher: () => Promise<T>;
  /**
   * Dado de demonstração retornado se `fetcher` falhar — por exemplo quando
   * VITE_SUPABASE_URL/ANON_KEY ainda não foram configuradas. Isso permite que
   * a interface funcione imediatamente em modo demo, sem quebrar a experiência
   * de desenvolvimento antes da integração real ser conectada.
   */
  fallback?: T;
  /** Dependências que, ao mudar, disparam um novo fetch (ex: [userId]). */
  deps?: unknown[];
  /** Se falso, o fetch não é disparado (ex: aguardando usuário autenticado). */
  enabled?: boolean;
}

export interface UseFetchDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  /** true quando os dados exibidos vieram do fallback local, não do Supabase. */
  isDemoData: boolean;
}

/**
 * Hook genérico de busca de dados com loading/erro/sucesso já tratados.
 * Reaproveitado pelos hooks de feature (useQuickLinks, useSpreadsheets, useFiles),
 * conforme pedido no requisito de "hooks de abstração" do projeto.
 */
export function useFetchData<T>({
  fetcher,
  fallback,
  deps = [],
  enabled = true,
}: UseFetchDataOptions<T>): UseFetchDataResult<T> {
  const [data, setData] = useState<T | undefined>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const refetch = useCallback(() => setReloadToken((prev) => prev + 1), []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (isCancelled) return;
        setData(result);
        setIsDemoData(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        const message = err instanceof Error ? err.message : "Erro inesperado ao buscar dados.";

        if (import.meta.env.DEV && fallback !== undefined) {
          // Dados de demonstração só podem ser usados em desenvolvimento.
          // Em produção, uma falha do Supabase deve aparecer como erro e nunca
          // ser mascarada por dados locais.
          console.warn(`[useFetchData] Falha ao buscar do Supabase, usando dados de demonstração apenas em desenvolvimento: ${message}`);
          setData(fallback);
          setIsDemoData(true);
        } else {
          setData(undefined);
          setIsDemoData(false);
          setError(message);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadToken, ...deps]);

  return { data, isLoading, error, refetch, isDemoData };
}
