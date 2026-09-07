import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/supabase";
import type {
  AuthContextValue,
  AuthUser,
  LoginCredentials,
  SignUpValues,
  UpdatePasswordValues,
  UpdateProfileValues,
} from "@/types/auth.types";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Usuário de demonstração, usado como fallback quando o Supabase ainda não
 * está configurado (VITE_SUPABASE_URL/ANON_KEY ausentes) — mantém o fluxo de
 * login navegável durante o desenvolvimento, replicando o "Olá, Renato" do
 * protótipo original no Lovable. Remova este fallback quando a autenticação
 * real do Supabase estiver conectada em produção.
 */
const DEMO_USER: AuthUser = {
  id: "demo-user",
  username: "renato",
  fullName: "Renato",
  avatarUrl: null,
};

const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (import.meta.env.DEV) {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setUser(null);
      return;
    }

    let mounted = true;
    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const { data: listener } = authService.onAuthStateChange((session) => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        return;
      }
      void authService.getCurrentUser().then((currentUser) => {
        if (mounted) setUser(currentUser);
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        if (!import.meta.env.DEV) throw new Error("Supabase não está configurado.");
        await new Promise((resolve) => setTimeout(resolve, 400));
        setUser(DEMO_USER);
        return;
      }

      const authenticatedUser = await authService.signInWithPassword(credentials);
      setUser(authenticatedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (values: SignUpValues): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        if (!import.meta.env.DEV) throw new Error("Supabase não está configurado.");
        await new Promise((resolve) => setTimeout(resolve, 400));
        setUser({ id: `demo-${Date.now()}`, username: values.username, fullName: values.fullName, avatarUrl: null });
        return;
      }

      const newUser = await authService.signUp(values);
      setUser(newUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível criar a conta. Tente novamente.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await authService.signOut();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (values: UpdateProfileValues): Promise<void> => {
      if (!user) throw new Error("Usuário não autenticado.");

      if (isSupabaseConfigured) {
        await authService.updateProfile(user.id, values);
      } else {
        // Modo demo: apenas simula a latência de rede.
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      setUser((prev) => (prev ? { ...prev, fullName: values.fullName.trim() } : prev));
    },
    [user]
  );

  const updatePassword = useCallback(
    async (values: UpdatePasswordValues): Promise<void> => {
      if (!user) throw new Error("Usuário não autenticado.");

      if (isSupabaseConfigured) {
        await authService.updatePassword(user.username, values);
      } else {
        // Modo demo: sem backend real para validar a senha atual, apenas simula sucesso.
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile,
      updatePassword,
      isAuthenticated: user !== null,
    }),
    [user, isLoading, error, signIn, signUp, signOut, updateProfile, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
