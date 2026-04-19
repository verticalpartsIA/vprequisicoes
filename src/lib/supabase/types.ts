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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          criado_em: string | null
          details: Json | null
          id: string
          target: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          criado_em?: string | null
          details?: Json | null
          id?: string
          target?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          criado_em?: string | null
          details?: Json | null
          id?: string
          target?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      module_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string | null
          granted_by: string | null
          id: string
          module_slug: string
          user_id: string
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string | null
          granted_by?: string | null
          id?: string
          module_slug: string
          user_id: string
        }
        Update: {
          can_access?: boolean | null
          created_at?: string | null
          granted_by?: string | null
          id?: string
          module_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          url: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          url: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          is_active: boolean | null
          level: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          is_active?: boolean | null
          level?: string
          name: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          level?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      req_approvals: {
        Row: {
          approver_id: string
          created_at: string
          decided_at: string | null
          decision: Database["public"]["Enums"]["req_approval_decision"]
          delegated_to: string | null
          id: string
          notes: string | null
          ticket_id: string
          tier: number
        }
        Insert: {
          approver_id: string
          created_at?: string
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["req_approval_decision"]
          delegated_to?: string | null
          id?: string
          notes?: string | null
          ticket_id: string
          tier: number
        }
        Update: {
          approver_id?: string
          created_at?: string
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["req_approval_decision"]
          delegated_to?: string | null
          id?: string
          notes?: string | null
          ticket_id?: string
          tier?: number
        }
        Relationships: []
      }
      req_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: unknown
          level: Database["public"]["Enums"]["req_log_level"]
          metadata: Json
          module: string | null
          ticket_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: unknown
          level?: Database["public"]["Enums"]["req_log_level"]
          metadata?: Json
          module?: string | null
          ticket_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: unknown
          level?: Database["public"]["Enums"]["req_log_level"]
          metadata?: Json
          module?: string | null
          ticket_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      req_departments: {
        Row: {
          cost_center: string
          created_at: string
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          cost_center: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          cost_center?: string
          created_at?: string
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      req_notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          ticket_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          ticket_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          ticket_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      req_profiles: {
        Row: {
          approval_limit: number | null
          approval_tier: number | null
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["req_user_role"]
          updated_at: string
        }
        Insert: {
          approval_limit?: number | null
          approval_tier?: number | null
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["req_user_role"]
          updated_at?: string
        }
        Update: {
          approval_limit?: number | null
          approval_tier?: number | null
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["req_user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      req_quotations: {
        Row: {
          attachment_url: string | null
          created_at: string
          delivery_days: number | null
          id: string
          is_winner: boolean
          items: Json
          notes: string | null
          quoter_id: string | null
          received_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["req_quotation_status"]
          supplier_id: string
          ticket_id: string
          total_value: number | null
          updated_at: string
          validity_date: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          delivery_days?: number | null
          id?: string
          is_winner?: boolean
          items?: Json
          notes?: string | null
          quoter_id?: string | null
          received_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["req_quotation_status"]
          supplier_id: string
          ticket_id: string
          total_value?: number | null
          updated_at?: string
          validity_date?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          delivery_days?: number | null
          id?: string
          is_winner?: boolean
          items?: Json
          notes?: string | null
          quoter_id?: string | null
          received_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["req_quotation_status"]
          supplier_id?: string
          ticket_id?: string
          total_value?: number | null
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: []
      }
      req_suppliers: {
        Row: {
          address: string | null
          categories: string[]
          created_at: string
          document: string | null
          email: string | null
          id: string
          is_active: boolean
          lead_time_days: number | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          categories?: string[]
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          lead_time_days?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          categories?: string[]
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      req_ticket_items: {
        Row: {
          created_at: string
          description: string
          id: string
          notes: string | null
          quantity: number
          sort_order: number
          ticket_id: string
          total_price: number | null
          unit: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          quantity?: number
          sort_order?: number
          ticket_id: string
          total_price?: number | null
          unit?: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          quantity?: number
          sort_order?: number
          ticket_id?: string
          total_price?: number | null
          unit?: string
          unit_price?: number | null
        }
        Relationships: []
      }
      req_tickets: {
        Row: {
          approved_at: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          department_id: string
          description: string | null
          id: string
          metadata: Json
          module: Database["public"]["Enums"]["req_module_type"]
          priority: Database["public"]["Enums"]["req_priority_level"]
          purchased_at: string | null
          quoted_at: string | null
          received_at: string | null
          rejected_at: string | null
          released_at: string | null
          requester_id: string
          status: Database["public"]["Enums"]["req_ticket_status"]
          submitted_at: string | null
          ticket_number: string
          title: string
          total_value: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          department_id: string
          description?: string | null
          id?: string
          metadata?: Json
          module: Database["public"]["Enums"]["req_module_type"]
          priority?: Database["public"]["Enums"]["req_priority_level"]
          purchased_at?: string | null
          quoted_at?: string | null
          received_at?: string | null
          rejected_at?: string | null
          released_at?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["req_ticket_status"]
          submitted_at?: string | null
          ticket_number: string
          title: string
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          department_id?: string
          description?: string | null
          id?: string
          metadata?: Json
          module?: Database["public"]["Enums"]["req_module_type"]
          priority?: Database["public"]["Enums"]["req_priority_level"]
          purchased_at?: string | null
          quoted_at?: string | null
          received_at?: string | null
          rejected_at?: string | null
          released_at?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["req_ticket_status"]
          submitted_at?: string | null
          ticket_number?: string
          title?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          level: string
          module_slug: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          level: string
          module_slug: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          level?: string
          module_slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      req_tickets_view: {
        Row: {
          approved_at: string | null
          cost_center: string | null
          created_at: string | null
          currency: string | null
          department_name: string | null
          description: string | null
          id: string | null
          metadata: Json | null
          module: Database["public"]["Enums"]["req_module_type"] | null
          priority: Database["public"]["Enums"]["req_priority_level"] | null
          released_at: string | null
          requester_email: string | null
          requester_name: string | null
          requester_role: Database["public"]["Enums"]["req_user_role"] | null
          status: Database["public"]["Enums"]["req_ticket_status"] | null
          submitted_at: string | null
          ticket_number: string | null
          title: string | null
          total_value: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      req_users_public: {
        Row: {
          approval_limit: number | null
          approval_tier: number | null
          department_id: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          role: Database["public"]["Enums"]["req_user_role"] | null
        }
        Insert: {
          approval_limit?: number | null
          approval_tier?: number | null
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["req_user_role"] | null
        }
        Update: {
          approval_limit?: number | null
          approval_tier?: number | null
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["req_user_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      req_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["req_user_role"]
      }
      req_generate_ticket_number: {
        Args: { p_module: Database["public"]["Enums"]["req_module_type"] }
        Returns: string
      }
      req_is_admin: { Args: never; Returns: boolean }
      req_is_valid_transition: {
        Args: {
          p_from: Database["public"]["Enums"]["req_ticket_status"]
          p_to: Database["public"]["Enums"]["req_ticket_status"]
        }
        Returns: boolean
      }
      req_log_audit: {
        Args: {
          p_action: string
          p_details: string
          p_level: Database["public"]["Enums"]["req_log_level"]
          p_metadata?: Json
          p_module: string
          p_ticket_id: string
          p_user_id: string
        }
        Returns: string
      }
      req_set_user_role: {
        Args: {
          p_limit?: number
          p_role: Database["public"]["Enums"]["req_user_role"]
          p_tier?: number
          p_user_id: string
        }
        Returns: undefined
      }
      req_transition_ticket: {
        Args: {
          p_new_status: Database["public"]["Enums"]["req_ticket_status"]
          p_notes?: string
          p_ticket_id: string
          p_user_id: string
        }
        Returns: {
          approved_at: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          department_id: string
          description: string | null
          id: string
          metadata: Json
          module: Database["public"]["Enums"]["req_module_type"]
          priority: Database["public"]["Enums"]["req_priority_level"]
          purchased_at: string | null
          quoted_at: string | null
          received_at: string | null
          rejected_at: string | null
          released_at: string | null
          requester_id: string
          status: Database["public"]["Enums"]["req_ticket_status"]
          submitted_at: string | null
          ticket_number: string
          title: string
          total_value: number | null
          updated_at: string
        }
      }
    }
    Enums: {
      req_approval_decision: "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED"
      req_log_level: "info" | "success" | "warning" | "error"
      req_module_type:
        | "M1_PRODUTOS"
        | "M2_VIAGENS"
        | "M3_SERVICOS"
        | "M4_MANUTENCAO"
        | "M5_FRETE"
        | "M6_LOCACAO"
      req_priority_level: "low" | "normal" | "high" | "urgent"
      req_quotation_status:
        | "PENDING"
        | "SENT"
        | "RECEIVED"
        | "SELECTED"
        | "REJECTED"
      req_ticket_status:
        | "DRAFT"
        | "SUBMITTED"
        | "QUOTING"
        | "PENDING_APPROVAL"
        | "APPROVED"
        | "REJECTED"
        | "PURCHASING"
        | "RECEIVING"
        | "IN_USE"
        | "RETURNED"
        | "RELEASED"
        | "CANCELLED"
      req_user_role:
        | "requester"
        | "quoter"
        | "approver"
        | "buyer"
        | "receiver"
        | "admin"
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
      req_approval_decision: ["PENDING", "APPROVED", "REJECTED", "DELEGATED"],
      req_log_level: ["info", "success", "warning", "error"],
      req_module_type: [
        "M1_PRODUTOS",
        "M2_VIAGENS",
        "M3_SERVICOS",
        "M4_MANUTENCAO",
        "M5_FRETE",
        "M6_LOCACAO",
      ],
      req_priority_level: ["low", "normal", "high", "urgent"],
      req_quotation_status: [
        "PENDING",
        "SENT",
        "RECEIVED",
        "SELECTED",
        "REJECTED",
      ],
      req_ticket_status: [
        "DRAFT",
        "SUBMITTED",
        "QUOTING",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "PURCHASING",
        "RECEIVING",
        "IN_USE",
        "RETURNED",
        "RELEASED",
        "CANCELLED",
      ],
      req_user_role: [
        "requester",
        "quoter",
        "approver",
        "buyer",
        "receiver",
        "admin",
      ],
    },
  },
} as const
