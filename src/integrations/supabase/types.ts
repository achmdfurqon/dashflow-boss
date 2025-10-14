export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      eviden: {
        Row: {
          created_at: string
          deskripsi: string | null
          file_eviden: string | null
          id: string
          id_giat: string | null
          id_non_giat: string | null
          id_pok: string | null
          id_ref_eviden: string | null
          tahun: number | null
          tipe_eviden: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          file_eviden?: string | null
          id?: string
          id_giat?: string | null
          id_non_giat?: string | null
          id_pok?: string | null
          id_ref_eviden?: string | null
          tahun?: number | null
          tipe_eviden?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          file_eviden?: string | null
          id?: string
          id_giat?: string | null
          id_non_giat?: string | null
          id_pok?: string | null
          id_ref_eviden?: string | null
          tahun?: number | null
          tipe_eviden?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eviden_id_giat_fkey"
            columns: ["id_giat"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eviden_id_non_giat_fkey"
            columns: ["id_non_giat"]
            isOneToOne: false
            referencedRelation: "non_kegiatan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eviden_id_pok_fkey"
            columns: ["id_pok"]
            isOneToOne: false
            referencedRelation: "pok"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eviden_id_ref_eviden_fkey"
            columns: ["id_ref_eviden"]
            isOneToOne: false
            referencedRelation: "ref_eviden"
            referencedColumns: ["id"]
          },
        ]
      }
      foto: {
        Row: {
          created_at: string
          file_foto: string
          id: string
          id_giat: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_foto: string
          id?: string
          id_giat?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_foto?: string
          id?: string
          id_giat?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "foto_id_giat_fkey"
            columns: ["id_giat"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
        ]
      }
      kegiatan: {
        Row: {
          agenda: string | null
          created_at: string
          disposisi: string | null
          id: string
          id_giat_sblm: string | null
          id_pok: string | null
          jenis_giat: string
          jenis_lokasi: string
          nama: string
          no_surat: string | null
          penyelenggara: string
          tempat: string
          tgl_surat: string | null
          updated_at: string
          user_id: string
          waktu_mulai: string
          waktu_selesai: string
        }
        Insert: {
          agenda?: string | null
          created_at?: string
          disposisi?: string | null
          id?: string
          id_giat_sblm?: string | null
          id_pok?: string | null
          jenis_giat: string
          jenis_lokasi: string
          nama: string
          no_surat?: string | null
          penyelenggara: string
          tempat: string
          tgl_surat?: string | null
          updated_at?: string
          user_id: string
          waktu_mulai: string
          waktu_selesai: string
        }
        Update: {
          agenda?: string | null
          created_at?: string
          disposisi?: string | null
          id?: string
          id_giat_sblm?: string | null
          id_pok?: string | null
          jenis_giat?: string
          jenis_lokasi?: string
          nama?: string
          no_surat?: string | null
          penyelenggara?: string
          tempat?: string
          tgl_surat?: string | null
          updated_at?: string
          user_id?: string
          waktu_mulai?: string
          waktu_selesai?: string
        }
        Relationships: [
          {
            foreignKeyName: "kegiatan_id_pok_fkey"
            columns: ["id_pok"]
            isOneToOne: false
            referencedRelation: "pok"
            referencedColumns: ["id"]
          },
        ]
      }
      materi: {
        Row: {
          created_at: string
          file_materi: string
          id: string
          id_giat: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_materi: string
          id?: string
          id_giat?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_materi?: string
          id?: string
          id_giat?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materi_id_giat_fkey"
            columns: ["id_giat"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
        ]
      }
      non_kegiatan: {
        Row: {
          created_at: string
          id: string
          id_non_giat_sblm: string | null
          id_pok: string | null
          jenis_non_giat: string
          nama_non_giat: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_non_giat_sblm?: string | null
          id_pok?: string | null
          jenis_non_giat: string
          nama_non_giat: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          id_non_giat_sblm?: string | null
          id_pok?: string | null
          jenis_non_giat?: string
          nama_non_giat?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_kegiatan_id_pok_fkey"
            columns: ["id_pok"]
            isOneToOne: false
            referencedRelation: "pok"
            referencedColumns: ["id"]
          },
        ]
      }
      pencairan: {
        Row: {
          created_at: string
          id: string
          id_pok: string | null
          metode_pencairan: string
          nilai_pencairan: number
          status_pencairan: string
          tgl_pencairan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_pok?: string | null
          metode_pencairan: string
          nilai_pencairan: number
          status_pencairan?: string
          tgl_pencairan: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          id_pok?: string | null
          metode_pencairan?: string
          nilai_pencairan?: number
          status_pencairan?: string
          tgl_pencairan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pencairan_id_pok_fkey"
            columns: ["id_pok"]
            isOneToOne: false
            referencedRelation: "pok"
            referencedColumns: ["id"]
          },
        ]
      }
      pok: {
        Row: {
          created_at: string
          id: string
          jenis_akun: string
          kode_akun: string
          nama_akun: string
          nilai_anggaran: number
          updated_at: string
          uraian: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_akun: string
          kode_akun: string
          nama_akun: string
          nilai_anggaran: number
          updated_at?: string
          uraian: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_akun?: string
          kode_akun?: string
          nama_akun?: string
          nilai_anggaran?: number
          updated_at?: string
          uraian?: string
          user_id?: string
        }
        Relationships: []
      }
      ref_eviden: {
        Row: {
          created_at: string
          id: string
          jenis_eviden: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_eviden: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_eviden?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
