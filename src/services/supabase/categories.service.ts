import { supabase } from "./client";
import type { Category, CategoryFormValues } from "@/types";

export const categoriesService = {
  async list(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,created_at")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((row) => ({ id: row.id, name: row.name, createdAt: row.created_at }));
  },

  async create(userId: string, values: CategoryFormValues): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, name: values.name.trim() })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return { id: data.id, name: data.name, createdAt: data.created_at };
  },

  /**
   * Renomeia uma categoria e propaga o novo nome para todos os links, planilhas
   * e arquivos do usuário que usavam o nome antigo — como `category` é salvo
   * como texto livre (não uma chave estrangeira), sem essa propagação os itens
   * existentes ficariam "órfãos" apontando para um nome que não existe mais.
   */
  async rename(userId: string, id: string, oldName: string, newName: string): Promise<Category> {
    const trimmed = newName.trim();

    const { data, error } = await supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (oldName !== trimmed) {
      const [linksResult, spreadsheetsResult, filesResult] = await Promise.all([
        supabase.from("quick_links").update({ category: trimmed }).eq("user_id", userId).eq("category", oldName),
        supabase.from("spreadsheets").update({ category: trimmed }).eq("user_id", userId).eq("category", oldName),
        supabase.from("files").update({ category: trimmed }).eq("user_id", userId).eq("category", oldName),
      ]);

      const cascadeError = linksResult.error ?? spreadsheetsResult.error ?? filesResult.error;
      if (cascadeError) throw new Error(cascadeError.message);
    }

    return { id: data.id, name: data.name, createdAt: data.created_at };
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
