import { supabase } from "./client";
import { extractDomain } from "@/lib/utils";
import type { QuickLink, QuickLinkFormValues } from "@/types";

function mapRow(row: {
  id: string;
  title: string;
  url: string;
  domain: string;
  category: string;
  is_public: boolean;
  created_at: string;
}): QuickLink {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    domain: row.domain,
    category: row.category,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

export interface QuickLinkUpdateValues {
  title: string;
  url: string;
  category: string;
  isPublic: boolean;
}

export const quickLinksService = {
  async list(userId: string): Promise<QuickLink[]> {
    const { data, error } = await supabase
      .from("quick_links")
      .select("id,title,url,domain,category,is_public,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
  },

  /** Lista links marcados como públicos, de todos os usuários — usada na página do visitante. */
  async listPublic(): Promise<QuickLink[]> {
    const { data, error } = await supabase
      .from("quick_links")
      .select("id,title,url,domain,category,is_public,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
  },

  async create(userId: string, values: QuickLinkFormValues): Promise<QuickLink> {
    const domain = extractDomain(values.url);

    const { data, error } = await supabase
      .from("quick_links")
      .insert({
        user_id: userId,
        title: values.title,
        url: values.url,
        domain,
        category: values.category,
        is_public: values.isPublic,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
  },

  /** Atualiza título, URL (recalculando o domínio), categoria e visibilidade de um link existente. */
  async update(id: string, values: QuickLinkUpdateValues): Promise<QuickLink> {
    const domain = extractDomain(values.url);

    const { data, error } = await supabase
      .from("quick_links")
      .update({
        title: values.title,
        url: values.url,
        domain,
        category: values.category,
        is_public: values.isPublic,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("quick_links").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
