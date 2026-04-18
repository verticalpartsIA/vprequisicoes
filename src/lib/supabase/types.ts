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
      approvals: {
        Row: {
          approver_id: string
          created_at: string
          decided_at: string | null
          decision: Database["public"]["Enums"]["approval_decision"]
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
          decision?: Database["public"]["Enums"]["approval_decision"]
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
          decision?: Database["public"]["Enums"]["approval_decision"]
          delegated_to?: string | null
          id?: string
          notes?: string | null
          ticket_id?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_delegated_to_fkey"
            columns: ["delegated_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: unknown
          level: Database["public"]["Enums"]["log_level"]
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
          level?: Database["public"]["Enums"]["log_level"]
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
          level?: Database["public"]["Enums"]["log_level"]
          metadata?: Json
          module?: string | null
          ticket_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
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
        Relationships: [
          {
            foreignKeyName: "fk_departments_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
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
        Relationships: [
          {
            foreignKeyName: "notifications_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
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
          role: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
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
          status: Database["public"]["Enums"]["quotation_status"]
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
          status?: Database["public"]["Enums"]["quotation_status"]
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
          status?: Database["public"]["Enums"]["quotation_status"]
          supplier_id?: string
          ticket_id?: string
          total_value?: number | null
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_quoter_id_fkey"
            columns: ["quoter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
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
      ticket_items: {
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
        Relationships: [
          {
            foreignKeyName: "ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          approved_at: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          department_id: string
          description: string | null
          id: string
          metadata: Json
          module: Database["public"]["Enums"]["module_type"]
          priority: Database["public"]["Enums"]["priority_level"]
          purchased_at: string | null
          quoted_at: string | null
          received_at: string | null
          rejected_at: string | null
          released_at: string | null
          requester_id: string
          status: Database["public"]["Enums"]["ticket_status"]
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
          module: Database["public"]["Enums"]["module_type"]
          priority?: Database["public"]["Enums"]["priority_level"]
          purchased_at?: string | null
          quoted_at?: string | null
          received_at?: string | null
          rejected_at?: string | null
          released_at?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["ticket_status"]
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
          module?: Database["public"]["Enums"]["module_type"]
          priority?: Database["public"]["Enums"]["priority_level"]
          purchased_at?: string | null
          quoted_at?: string | null
          received_at?: string | null
          rejected_at?: string | null
          released_at?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          submitted_at?: string | null
          ticket_number?: string
          title?: string
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tickets_view: {
        Row: {
          approved_at: string | null
          cost_center: string | null
          created_at: string | null
          currency: string | null
          department_name: string | null
          description: string | null
          id: string | null
          metadata: Json | null
          module: Database["public"]["Enums"]["module_type"] | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          released_at: string | null
          requester_email: string | null
          requester_name: string | null
          requester_role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          submitted_at: string | null
          ticket_number: string | null
          title: string | null
          total_value: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_ticket_number: {
        Args: { p_module: Database["public"]["Enums"]["module_type"] }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_valid_transition: {
        Args: {
          p_from: Database["public"]["Enums"]["ticket_status"]
          p_to: Database["public"]["Enums"]["ticket_status"]
        }
        Returns: boolean
      }
      log_audit: {
        Args: {
          p_action: string
          p_details?: string
          p_level: Database["public"]["Enums"]["log_level"]
          p_metadata?: Json
          p_module: string
          p_ticket_id: string
          p_user_id: string
        }
        Returns: string
      }
      transition_ticket: {
        Args: {
          p_new_status: Database["public"]["Enums"]["ticket_status"]
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
          module: Database["public"]["Enums"]["module_type"]
          priority: Database["public"]["Enums"]["priority_level"]
          purchased_at: string | null
          quoted_at: string | null
          received_at: string | null
          rejected_at: string | null
          released_at: string | null
          requester_id: string
          status: Database["public"]["Enums"]["ticket_status"]
          submitted_at: string | null
          ticket_number: string
          title: string
          total_value: number | null
          updated_at: string
        }
      }
    }
    Enums: {
      approval_decision: "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED"
      log_level: "info" | "success" | "warning" | "error"
      module_type:
        | "M1_PRODUTOS"
        | "M2_VIAGENS"
        | "M3_SERVICOS"
        | "M4_MANUTENCAO"
        | "M5_FRETE"
        | "M6_LOCACAO"
      priority_level: "low" | "normal" | "high" | "urgent"
      quotation_status:
        | "PENDING"
        | "SENT"
        | "RECEIVED"
        | "SELECTED"
        | "REJECTED"
      ticket_status:
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
      user_role:
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

export const Constants = {
  public: {
    Enums: {
      approval_decision: ["PENDING", "APPROVED", "REJECTED", "DELEGATED"],
      log_level: ["info", "success", "warning", "error"],
      module_type: [
        "M1_PRODUTOS",
        "M2_VIAGENS",
        "M3_SERVICOS",
        "M4_MANUTENCAO",
        "M5_FRETE",
        "M6_LOCACAO",
      ],
      priority_level: ["low", "normal", "high", "urgent"],
      quotation_status: ["PENDING", "SENT", "RECEIVED", "SELECTED", "REJECTED"],
      ticket_status: [
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
      user_role: [
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
