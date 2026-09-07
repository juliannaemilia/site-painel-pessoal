/**
 * Tipos do schema Supabase.
 *
 * Este arquivo segue o formato gerado por:
 *   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts
 *
 * Foi escrito manualmente aqui para refletir o schema SQL em /supabase/schema.sql.
 */

/** Tipo de arquivo/documento (fixo — apenas a CATEGORIA é personalizável pelo usuário). */
export type TipoArquivo = "PDF" | "DOC" | "Imagem" | "Planilha" | "Outro";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      platforms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      quick_links: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          domain: string;
          category: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          domain: string;
          category: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          domain?: string;
          category?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      spreadsheets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          platform: string;
          url: string;
          category: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          platform: string;
          url: string;
          category: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          platform?: string;
          url?: string;
          category?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_type: TipoArquivo;
          url: string;
          category: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_type: TipoArquivo;
          url: string;
          category: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_type?: TipoArquivo;
          url?: string;
          category?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
