export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: string
          brand: string | null
          color: string | null
          created_at: string
          created_by: string | null
          household_id: string
          id: string
          kid_user_id: string
          name: string
        }
        Insert: {
          account_type?: string
          brand?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          household_id: string
          id?: string
          kid_user_id: string
          name: string
        }
        Update: {
          account_type?: string
          brand?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          household_id?: string
          id?: string
          kid_user_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          avatar: string | null
          color: string | null
          created_at: string
          display_name: string
          household_id: string
          id: string
          role: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar?: string | null
          color?: string | null
          created_at?: string
          display_name: string
          household_id: string
          id?: string
          role: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar?: string | null
          color?: string | null
          created_at?: string
          display_name?: string
          household_id?: string
          id?: string
          role?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string | null
          display_name: string
          email: string | null
          expires_at: string
          household_id: string
          id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          display_name: string
          email?: string | null
          expires_at?: string
          household_id: string
          id?: string
          role?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          email?: string | null
          expires_at?: string
          household_id?: string
          id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount_cents: number
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          note: string | null
          occurred_at: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          note?: string | null
          occurred_at?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          note?: string | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      account_balances: {
        Row: {
          account_id: string | null
          account_type: string | null
          balance_cents: number | null
          brand: string | null
          color: string | null
          household_id: string | null
          kid_user_id: string | null
          last_activity_at: string | null
          name: string | null
          transaction_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_with_balance: {
        Row: {
          account_id: string | null
          amount_cents: number | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          id: string | null
          note: string | null
          occurred_at: string | null
          running_balance_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_invite: {
        Args: { p_token: string }
        Returns: {
          display_name: string
          household_name: string
          role: string
          valid: boolean
        }[]
      }
      redeem_invite: {
        Args: { p_display_name?: string; p_token: string }
        Returns: string
      }
      set_member_appearance: {
        Args: { p_avatar: string | null; p_color: string; p_user_id: string }
        Returns: undefined
      }
      setup_parent_account: {
        Args: { p_display_name: string; p_household_name: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
