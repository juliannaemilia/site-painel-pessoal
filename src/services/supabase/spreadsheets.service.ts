import { supabase } from "./client";
import type { Spreadsheet, SpreadsheetFormValues } from "@/types";

function mapRow(row: {
  id: string;
  name: string;
  platform: string;
  url: string;
  category: string;
  is_public: boolean;
}): Spreadsheet {
  return {
    id: row.id,
    name: row.name,
    platform: row.platform,
    url: row.url,
    category: row.category,
    isPublic: row.is_public,
  };
}

export interface SpreadsheetUpdateValues {
  name: string;
  url: string;
  platform: string;
  category: string;
  isPublic: boolean;
}

export const spreadsheetsService = {
  async list(userId: string): Promise<Spreadsheet[]> {
    const { data, error } = await supabase
      .from("spreadsheets")
      .select("id,name,platform,url,category,is_public,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
  },

  /** Lista planilhas marcadas como públicas, de todos os usuários — usada na página do visitante. */
  async listPublic(): Promise<Spreadsheet[]> {
    const { data, error } = await supabase
      .from("spreadsheets")
      .select("id,name,platform,url,category,is_public,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
  },

  async create(userId: string, values: SpreadsheetFormValues): Promise<Spreadsheet> {
    const { data, error } = await supabase
      .from("spreadsheets")
      .insert({
        user_id: userId,
        name: values.name,
        platform: values.platform,
        url: values.url,
        category: values.category,
        is_public: values.isPublic,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
  },

  /** Atualiza nome, URL, plataforma, categoria e visibilidade de uma planilha existente. */
  async update(id: string, values: SpreadsheetUpdateValues): Promise<Spreadsheet> {
    const { data, error } = await supabase
      .from("spreadsheets")
      .update({
        name: values.name,
        url: values.url,
        platform: values.platform,
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
    const { error } = await supabase.from("spreadsheets").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
