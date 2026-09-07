import { supabase } from "./client";
import type { Platform, PlatformFormValues } from "@/types";

export const platformsService = {
  async list(userId: string): Promise<Platform[]> {
    const { data, error } = await supabase
      .from("platforms")
      .select("id,name,created_at")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data.map((row) => ({ id: row.id, name: row.name, createdAt: row.created_at }));
  },

  async create(userId: string, values: PlatformFormValues): Promise<Platform> {
    const { data, error } = await supabase
      .from("platforms")
      .insert({ user_id: userId, name: values.name.trim() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { id: data.id, name: data.name, createdAt: data.created_at };
  },

  /**
   * Renomeia uma plataforma e propaga o novo nome para todas as planilhas do
   * usuário que usavam o nome antigo — `platform` é salvo como texto livre
   * (não uma chave estrangeira), então sem essa propagação as planilhas
   * existentes ficariam apontando para um nome que não existe mais.
   */
  async rename(userId: string, id: string, oldName: string, newName: string): Promise<Platform> {
    const trimmed = newName.trim();

    const { data, error } = await supabase
      .from("platforms")
      .update({ name: trimmed })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (oldName !== trimmed) {
      const { error: cascadeError } = await supabase
        .from("spreadsheets")
        .update({ platform: trimmed })
        .eq("user_id", userId)
        .eq("platform", oldName);

      if (cascadeError) throw new Error(cascadeError.message);
    }

    return { id: data.id, name: data.name, createdAt: data.created_at };
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("platforms").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
