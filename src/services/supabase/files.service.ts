import { supabase } from "./client";
import type { AppFile, AppFileFormValues, TipoArquivo } from "@/types";

function mapRow(row: {
  id: string;
  file_name: string;
  file_type: TipoArquivo;
  url: string;
  category: string;
  is_public: boolean;
  created_at: string;
}): AppFile {
  return {
    id: row.id,
    fileName: row.file_name,
    fileType: row.file_type,
    url: row.url,
    category: row.category,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

export interface FileUpdateValues {
  fileName: string;
  fileType: TipoArquivo;
  url: string;
  category: string;
  isPublic: boolean;
}

/**
 * Arquivos & Documentos funciona como Links Rápidos: o usuário informa um link
 * já hospedado em outro lugar (Google Drive, OneDrive, etc.) — nada é enviado
 * a um servidor ou bucket de storage.
 */
export const filesService = {
  async list(userId: string): Promise<AppFile[]> {
    const { data, error } = await supabase
      .from("files")
      .select("id,file_name,file_type,url,category,is_public,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
  },

  /** Lista arquivos marcados como públicos, de todos os usuários — usada na página do visitante. */
  async listPublic(): Promise<AppFile[]> {
    const { data, error } = await supabase
      .from("files")
      .select("id,file_name,file_type,url,category,is_public,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapRow);
  },

  async create(userId: string, values: AppFileFormValues): Promise<AppFile> {
    const { data, error } = await supabase
      .from("files")
      .insert({
        user_id: userId,
        file_name: values.fileName,
        file_type: values.fileType,
        url: values.url,
        category: values.category,
        is_public: values.isPublic,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRow(data);
  },

  /** Atualiza nome, tipo, link, categoria e visibilidade de um arquivo existente. */
  async update(id: string, values: FileUpdateValues): Promise<AppFile> {
    const { data, error } = await supabase
      .from("files")
      .update({
        file_name: values.fileName,
        file_type: values.fileType,
        url: values.url,
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
    const { error } = await supabase.from("files").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
