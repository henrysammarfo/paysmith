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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_wallets: {
        Row: {
          api_key: string | null
          balance_ghs: number | null
          balance_ngn: number | null
          balance_usdc: number | null
          chimoney_sub_account_id: string | null
          country: string
          created_at: string
          currency: string
          id: string
          name: string
          owner_id: string
          payment_methods: string[] | null
          spending_policy: Json | null
          status: string
          total_txns: number | null
          total_volume: number | null
        }
        Insert: {
          api_key?: string | null
          balance_ghs?: number | null
          balance_ngn?: number | null
          balance_usdc?: number | null
          chimoney_sub_account_id?: string | null
          country: string
          created_at?: string
          currency: string
          id: string
          name: string
          owner_id: string
          payment_methods?: string[] | null
          spending_policy?: Json | null
          status?: string
          total_txns?: number | null
          total_volume?: number | null
        }
        Update: {
          api_key?: string | null
          balance_ghs?: number | null
          balance_ngn?: number | null
          balance_usdc?: number | null
          chimoney_sub_account_id?: string | null
          country?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          owner_id?: string
          payment_methods?: string[] | null
          spending_policy?: Json | null
          status?: string
          total_txns?: number | null
          total_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_wallets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      api_call_logs: {
        Row: {
          created_at: string
          developer_id: string
          endpoint: string
          id: string
          method: string
          status_code: number | null
        }
        Insert: {
          created_at?: string
          developer_id: string
          endpoint: string
          id?: string
          method?: string
          status_code?: number | null
        }
        Update: {
          created_at?: string
          developer_id?: string
          endpoint?: string
          id?: string
          method?: string
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_call_logs_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          auth_id: string
          company: string | null
          created_at: string
          email: string
          id: string
          live_api_key: string | null
          plan: string
          test_api_key: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          auth_id: string
          company?: string | null
          created_at?: string
          email: string
          id?: string
          live_api_key?: string | null
          plan?: string
          test_api_key?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          auth_id?: string
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          live_api_key?: string | null
          plan?: string
          test_api_key?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          agent_wallet_id: string
          amount: number
          created_at: string
          currency: string
          fee: number | null
          fx_rate: number | null
          id: string
          method: string
          note: string | null
          rail_tx_id: string | null
          recipient: string | null
          status: string
          type: string
        }
        Insert: {
          agent_wallet_id: string
          amount: number
          created_at?: string
          currency: string
          fee?: number | null
          fx_rate?: number | null
          id?: string
          method: string
          note?: string | null
          rail_tx_id?: string | null
          recipient?: string | null
          status?: string
          type: string
        }
        Update: {
          agent_wallet_id?: string
          amount?: number
          created_at?: string
          currency?: string
          fee?: number | null
          fx_rate?: number | null
          id?: string
          method?: string
          note?: string | null
          rail_tx_id?: string | null
          recipient?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_wallet_id_fkey"
            columns: ["agent_wallet_id"]
            isOneToOne: false
            referencedRelation: "agent_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          developer_id: string | null
          event_type: string
          id: string
          payload: Json | null
          response_status: number | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          developer_id?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          response_status?: number | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          developer_id?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          response_status?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
