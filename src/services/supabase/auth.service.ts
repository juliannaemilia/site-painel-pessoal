import { supabase } from "./client";
import { usernameToSyntheticEmail } from "@/lib/utils";
import type {
  AuthUser,
  LoginCredentials,
  SignUpValues,
  UpdatePasswordValues,
  UpdateProfileValues,
} from "@/types/auth.types";

/**
 * Camada de acesso a dados para autenticação.
 *
 * O app não pede e-mail ao usuário — apenas "usuário" (username) e senha.
 * Como o Supabase Auth exige um identificador do tipo e-mail/telefone
 * internamente, convertemos o username em um e-mail sintético e nunca
 * mostrado (`usuario@my-space-pad.internal`, ver lib/utils.ts). O username
 * real de exibição/login fica sempre em `profiles.username`.
 */
export const authService = {
  /**
   * Cria a conta no Supabase Auth com o e-mail sintético e envia `username` +
   * `full_name` em `raw_user_meta_data` — o trigger `handle_new_user` (ver
   * supabase/schema.sql) lê esses metadados para criar a linha em `profiles`
   * e semear as categorias padrão automaticamente.
   */
  async signUp(values: SignUpValues): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email: usernameToSyntheticEmail(values.username),
      password: values.password,
      options: {
        data: {
          username: values.username.trim(),
          full_name: values.fullName.trim(),
        },
      },
    });

    if (error) {
      if (/already registered|duplicate key|unique constraint/i.test(error.message)) {
        throw new Error("Esse nome de usuário já está em uso.");
      }
      throw new Error(error.message);
    }
    if (!data.user) throw new Error("Não foi possível criar a conta.");
    if (!data.session) {
      throw new Error(
        "A conta foi criada, mas o projeto exige confirmação de e-mail. Como este aplicativo usa um e-mail interno e não coleta e-mail real, desative a confirmação de e-mail no Supabase antes de publicar."
      );
    }

    return {
      id: data.user.id,
      username: values.username.trim(),
      fullName: values.fullName.trim(),
      avatarUrl: null,
    };
  },

  async signInWithPassword(credentials: LoginCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToSyntheticEmail(credentials.username),
      password: credentials.password,
    });

    if (error) throw new Error("Usuário ou senha inválidos.");
    if (!data.user) throw new Error("Não foi possível autenticar o usuário.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,username,full_name,avatar_url,created_at,updated_at")
      .eq("id", data.user.id)
      .single();

    return {
      id: data.user.id,
      username: profile?.username ?? credentials.username,
      fullName: profile?.full_name ?? credentials.username,
      avatarUrl: profile?.avatar_url ?? null,
    };
  },

  onAuthStateChange(callback: (session: import("@supabase/supabase-js").Session | null) => void) {
    return supabase.auth.onAuthStateChange((_, session) => callback(session));
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (!sessionUser) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,username,full_name,avatar_url,created_at,updated_at")
      .eq("id", sessionUser.id)
      .single();

    return {
      id: sessionUser.id,
      username: profile?.username ?? "",
      fullName: profile?.full_name ?? profile?.username ?? "Usuário",
      avatarUrl: profile?.avatar_url ?? null,
    };
  },

  /** Atualiza o nome completo exibido no perfil (tabela `profiles`). */
  async updateProfile(userId: string, values: UpdateProfileValues): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: values.fullName.trim() })
      .eq("id", userId);

    if (error) throw new Error(error.message);
  },

  /**
   * Troca a senha do usuário. O Supabase não tem um endpoint dedicado para
   * "verificar a senha atual", então reautenticamos com `currentPassword`
   * primeiro (o que falha com erro claro se estiver errada) e só então
   * aplicamos a nova senha via `auth.updateUser`.
   */
  async updatePassword(username: string, values: UpdatePasswordValues): Promise<void> {
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: usernameToSyntheticEmail(username),
      password: values.currentPassword,
    });

    if (reauthError) throw new Error("Senha atual incorreta.");

    const { error } = await supabase.auth.updateUser({ password: values.newPassword });
    if (error) throw new Error(error.message);
  },
};
