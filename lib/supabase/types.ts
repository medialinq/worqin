export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  _realtime: {
    Tables: {
      extensions: {
        Row: {
          id: string
          inserted_at: string
          settings: Json | null
          tenant_external_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          id: string
          inserted_at: string
          settings?: Json | null
          tenant_external_id?: string | null
          type?: string | null
          updated_at: string
        }
        Update: {
          id?: string
          inserted_at?: string
          settings?: Json | null
          tenant_external_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extensions_tenant_external_id_fkey"
            columns: ["tenant_external_id"]
            referencedRelation: "tenants"
            referencedColumns: ["external_id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      tenants: {
        Row: {
          external_id: string | null
          id: string
          inserted_at: string
          jwt_jwks: Json | null
          jwt_secret: string | null
          max_bytes_per_second: number
          max_channels_per_client: number
          max_concurrent_users: number
          max_events_per_second: number
          max_joins_per_second: number
          name: string | null
          notify_private_alpha: boolean | null
          postgres_cdc_default: string | null
          private_only: boolean
          suspend: boolean | null
          updated_at: string
        }
        Insert: {
          external_id?: string | null
          id: string
          inserted_at: string
          jwt_jwks?: Json | null
          jwt_secret?: string | null
          max_bytes_per_second?: number
          max_channels_per_client?: number
          max_concurrent_users?: number
          max_events_per_second?: number
          max_joins_per_second?: number
          name?: string | null
          notify_private_alpha?: boolean | null
          postgres_cdc_default?: string | null
          private_only?: boolean
          suspend?: boolean | null
          updated_at: string
        }
        Update: {
          external_id?: string | null
          id?: string
          inserted_at?: string
          jwt_jwks?: Json | null
          jwt_secret?: string | null
          max_bytes_per_second?: number
          max_channels_per_client?: number
          max_concurrent_users?: number
          max_events_per_second?: number
          max_joins_per_second?: number
          name?: string | null
          notify_private_alpha?: boolean | null
          postgres_cdc_default?: string | null
          private_only?: boolean
          suspend?: boolean | null
          updated_at?: string
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
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown | null
          not_after: string | null
          refreshed_at: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      jwt: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  extensions: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      pg_stat_statements: {
        Row: {
          blk_read_time: number | null
          blk_write_time: number | null
          calls: number | null
          dbid: unknown | null
          jit_emission_count: number | null
          jit_emission_time: number | null
          jit_functions: number | null
          jit_generation_time: number | null
          jit_inlining_count: number | null
          jit_inlining_time: number | null
          jit_optimization_count: number | null
          jit_optimization_time: number | null
          local_blks_dirtied: number | null
          local_blks_hit: number | null
          local_blks_read: number | null
          local_blks_written: number | null
          max_exec_time: number | null
          max_plan_time: number | null
          mean_exec_time: number | null
          mean_plan_time: number | null
          min_exec_time: number | null
          min_plan_time: number | null
          plans: number | null
          query: string | null
          queryid: number | null
          rows: number | null
          shared_blks_dirtied: number | null
          shared_blks_hit: number | null
          shared_blks_read: number | null
          shared_blks_written: number | null
          stddev_exec_time: number | null
          stddev_plan_time: number | null
          temp_blk_read_time: number | null
          temp_blk_write_time: number | null
          temp_blks_read: number | null
          temp_blks_written: number | null
          toplevel: boolean | null
          total_exec_time: number | null
          total_plan_time: number | null
          userid: unknown | null
          wal_bytes: number | null
          wal_fpi: number | null
          wal_records: number | null
        }
        Relationships: []
      }
      pg_stat_statements_info: {
        Row: {
          dealloc: number | null
          stats_reset: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      algorithm_sign: {
        Args: { signables: string; secret: string; algorithm: string }
        Returns: string
      }
      armor: {
        Args: { "": string }
        Returns: string
      }
      dearmor: {
        Args: { "": string }
        Returns: string
      }
      gen_random_bytes: {
        Args: { "": number }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gen_salt: {
        Args: { "": string }
        Returns: string
      }
      pg_stat_statements: {
        Args: { showtext: boolean }
        Returns: Record<string, unknown>[]
      }
      pg_stat_statements_info: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
      pg_stat_statements_reset: {
        Args: { userid?: unknown; dbid?: unknown; queryid?: number }
        Returns: undefined
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      pgp_key_id: {
        Args: { "": string }
        Returns: string
      }
      sign: {
        Args: { payload: Json; secret: string; algorithm?: string }
        Returns: string
      }
      try_cast_double: {
        Args: { inp: string }
        Returns: number
      }
      url_decode: {
        Args: { data: string }
        Returns: string
      }
      url_encode: {
        Args: { data: string }
        Returns: string
      }
      uuid_generate_v1: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v1mc: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v3: {
        Args: { namespace: string; name: string }
        Returns: string
      }
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v5: {
        Args: { namespace: string; name: string }
        Returns: string
      }
      uuid_nil: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_dns: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_oid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_x500: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      verify: {
        Args: { token: string; secret: string; algorithm?: string }
        Returns: {
          header: Json
          payload: Json
          valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _internal_resolve: {
        Args: {
          query: string
          variables?: Json
          operationName?: string
          extensions?: Json
        }
        Returns: Json
      }
      comment_directive: {
        Args: { comment_: string }
        Returns: Json
      }
      exception: {
        Args: { message: string }
        Returns: string
      }
      get_schema_version: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      resolve: {
        Args: {
          query: string
          variables?: Json
          operationName?: string
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  net: {
    Tables: {
      _http_response: {
        Row: {
          content: string | null
          content_type: string | null
          created: string
          error_msg: string | null
          headers: Json | null
          id: number | null
          status_code: number | null
          timed_out: boolean | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created?: string
          error_msg?: string | null
          headers?: Json | null
          id?: number | null
          status_code?: number | null
          timed_out?: boolean | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created?: string
          error_msg?: string | null
          headers?: Json | null
          id?: number | null
          status_code?: number | null
          timed_out?: boolean | null
        }
        Relationships: []
      }
      http_request_queue: {
        Row: {
          body: string | null
          headers: Json
          id: number
          method: string
          timeout_milliseconds: number
          url: string
        }
        Insert: {
          body?: string | null
          headers: Json
          id?: number
          method: string
          timeout_milliseconds: number
          url: string
        }
        Update: {
          body?: string | null
          headers?: Json
          id?: number
          method?: string
          timeout_milliseconds?: number
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _await_response: {
        Args: { request_id: number }
        Returns: boolean
      }
      _encode_url_with_params_array: {
        Args: { url: string; params_array: string[] }
        Returns: string
      }
      _http_collect_response: {
        Args: { request_id: number; async?: boolean }
        Returns: Database["net"]["CompositeTypes"]["http_response_result"]
      }
      _urlencode_string: {
        Args: { string: string }
        Returns: string
      }
      check_worker_is_up: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      http_collect_response: {
        Args: { request_id: number; async?: boolean }
        Returns: Database["net"]["CompositeTypes"]["http_response_result"]
      }
      http_delete: {
        Args: {
          url: string
          params?: Json
          headers?: Json
          timeout_milliseconds?: number
        }
        Returns: number
      }
      http_get: {
        Args: {
          url: string
          params?: Json
          headers?: Json
          timeout_milliseconds?: number
        }
        Returns: number
      }
      http_post: {
        Args: {
          url: string
          body?: Json
          params?: Json
          headers?: Json
          timeout_milliseconds?: number
        }
        Returns: number
      }
      worker_restart: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      request_status: "PENDING" | "SUCCESS" | "ERROR"
    }
    CompositeTypes: {
      http_response: {
        status_code: number | null
        headers: Json | null
        body: string | null
      }
      http_response_result: {
        status: Database["net"]["Enums"]["request_status"] | null
        message: string | null
        response: Database["net"]["CompositeTypes"]["http_response"] | null
      }
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgsodium: {
    Tables: {
      key: {
        Row: {
          associated_data: string | null
          comment: string | null
          created: string
          expires: string | null
          id: string
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          parent_key: string | null
          raw_key: string | null
          raw_key_nonce: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
          user_data: string | null
        }
        Insert: {
          associated_data?: string | null
          comment?: string | null
          created?: string
          expires?: string | null
          id?: string
          key_context?: string | null
          key_id?: number | null
          key_type?: Database["pgsodium"]["Enums"]["key_type"] | null
          name?: string | null
          parent_key?: string | null
          raw_key?: string | null
          raw_key_nonce?: string | null
          status?: Database["pgsodium"]["Enums"]["key_status"] | null
          user_data?: string | null
        }
        Update: {
          associated_data?: string | null
          comment?: string | null
          created?: string
          expires?: string | null
          id?: string
          key_context?: string | null
          key_id?: number | null
          key_type?: Database["pgsodium"]["Enums"]["key_type"] | null
          name?: string | null
          parent_key?: string | null
          raw_key?: string | null
          raw_key_nonce?: string | null
          status?: Database["pgsodium"]["Enums"]["key_status"] | null
          user_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "key_parent_key_fkey"
            columns: ["parent_key"]
            referencedRelation: "decrypted_key"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_parent_key_fkey"
            columns: ["parent_key"]
            referencedRelation: "key"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_parent_key_fkey"
            columns: ["parent_key"]
            referencedRelation: "valid_key"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      decrypted_key: {
        Row: {
          associated_data: string | null
          comment: string | null
          created: string | null
          decrypted_raw_key: string | null
          expires: string | null
          id: string | null
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          parent_key: string | null
          raw_key: string | null
          raw_key_nonce: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
        }
        Insert: {
          associated_data?: string | null
          comment?: string | null
          created?: string | null
          decrypted_raw_key?: never
          expires?: string | null
          id?: string | null
          key_context?: string | null
          key_id?: number | null
          key_type?: Database["pgsodium"]["Enums"]["key_type"] | null
          name?: string | null
          parent_key?: string | null
          raw_key?: string | null
          raw_key_nonce?: string | null
          status?: Database["pgsodium"]["Enums"]["key_status"] | null
        }
        Update: {
          associated_data?: string | null
          comment?: string | null
          created?: string | null
          decrypted_raw_key?: never
          expires?: string | null
          id?: string | null
          key_context?: string | null
          key_id?: number | null
          key_type?: Database["pgsodium"]["Enums"]["key_type"] | null
          name?: string | null
          parent_key?: string | null
          raw_key?: string | null
          raw_key_nonce?: string | null
          status?: Database["pgsodium"]["Enums"]["key_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "key_parent_key_fkey"
            columns: ["parent_key"]
            referencedRelation: "decrypted_key"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_parent_key_fkey"
            columns: ["parent_key"]
            referencedRelation: "key"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_parent_key_fkey"
            columns: ["parent_key"]
            referencedRelation: "valid_key"
            referencedColumns: ["id"]
          },
        ]
      }
      mask_columns: {
        Row: {
          associated_columns: string | null
          attname: unknown | null
          attrelid: unknown | null
          format_type: string | null
          key_id: string | null
          key_id_column: string | null
          nonce_column: string | null
        }
        Relationships: []
      }
      masking_rule: {
        Row: {
          associated_columns: string | null
          attname: unknown | null
          attnum: number | null
          attrelid: unknown | null
          col_description: string | null
          format_type: string | null
          key_id: string | null
          key_id_column: string | null
          nonce_column: string | null
          priority: number | null
          relname: unknown | null
          relnamespace: unknown | null
          security_invoker: boolean | null
          view_name: string | null
        }
        Relationships: []
      }
      valid_key: {
        Row: {
          associated_data: string | null
          created: string | null
          expires: string | null
          id: string | null
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
        }
        Insert: {
          associated_data?: string | null
          created?: string | null
          expires?: string | null
          id?: string | null
          key_context?: string | null
          key_id?: number | null
          key_type?: Database["pgsodium"]["Enums"]["key_type"] | null
          name?: string | null
          status?: Database["pgsodium"]["Enums"]["key_status"] | null
        }
        Update: {
          associated_data?: string | null
          created?: string | null
          expires?: string | null
          id?: string | null
          key_context?: string | null
          key_id?: number | null
          key_type?: Database["pgsodium"]["Enums"]["key_type"] | null
          name?: string | null
          status?: Database["pgsodium"]["Enums"]["key_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_key: {
        Args: {
          key_type?: Database["pgsodium"]["Enums"]["key_type"]
          name?: string
          raw_key?: string
          raw_key_nonce?: string
          parent_key?: string
          key_context?: string
          expires?: string
          associated_data?: string
        }
        Returns: {
          associated_data: string | null
          created: string | null
          expires: string | null
          id: string | null
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
        }
      }
      create_mask_view: {
        Args:
          | { relid: unknown; debug?: boolean }
          | { relid: unknown; subid: number; debug?: boolean }
        Returns: undefined
      }
      crypto_aead_det_decrypt: {
        Args:
          | {
              ciphertext: string
              additional: string
              key: string
              nonce?: string
            }
          | {
              message: string
              additional: string
              key_id: number
              context?: string
              nonce?: string
            }
          | { message: string; additional: string; key_uuid: string }
          | {
              message: string
              additional: string
              key_uuid: string
              nonce: string
            }
        Returns: string
      }
      crypto_aead_det_encrypt: {
        Args:
          | { message: string; additional: string; key: string; nonce?: string }
          | {
              message: string
              additional: string
              key_id: number
              context?: string
              nonce?: string
            }
          | { message: string; additional: string; key_uuid: string }
          | {
              message: string
              additional: string
              key_uuid: string
              nonce: string
            }
        Returns: string
      }
      crypto_aead_det_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_aead_det_noncegen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_aead_ietf_decrypt: {
        Args:
          | { message: string; additional: string; nonce: string; key: string }
          | {
              message: string
              additional: string
              nonce: string
              key_id: number
              context?: string
            }
          | {
              message: string
              additional: string
              nonce: string
              key_uuid: string
            }
        Returns: string
      }
      crypto_aead_ietf_encrypt: {
        Args:
          | { message: string; additional: string; nonce: string; key: string }
          | {
              message: string
              additional: string
              nonce: string
              key_id: number
              context?: string
            }
          | {
              message: string
              additional: string
              nonce: string
              key_uuid: string
            }
        Returns: string
      }
      crypto_aead_ietf_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_aead_ietf_noncegen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_auth: {
        Args:
          | { message: string; key: string }
          | { message: string; key_id: number; context?: string }
          | { message: string; key_uuid: string }
        Returns: string
      }
      crypto_auth_hmacsha256: {
        Args:
          | { message: string; key_id: number; context?: string }
          | { message: string; key_uuid: string }
          | { message: string; secret: string }
        Returns: string
      }
      crypto_auth_hmacsha256_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_auth_hmacsha256_verify: {
        Args:
          | { hash: string; message: string; key_id: number; context?: string }
          | { hash: string; message: string; secret: string }
          | { signature: string; message: string; key_uuid: string }
        Returns: boolean
      }
      crypto_auth_hmacsha512: {
        Args:
          | { message: string; key_id: number; context?: string }
          | { message: string; key_uuid: string }
          | { message: string; secret: string }
        Returns: string
      }
      crypto_auth_hmacsha512_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_auth_hmacsha512_verify: {
        Args:
          | { hash: string; message: string; key_id: number; context?: string }
          | { hash: string; message: string; secret: string }
          | { signature: string; message: string; key_uuid: string }
        Returns: boolean
      }
      crypto_auth_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_auth_verify: {
        Args:
          | { mac: string; message: string; key: string }
          | { mac: string; message: string; key_id: number; context?: string }
          | { mac: string; message: string; key_uuid: string }
        Returns: boolean
      }
      crypto_box: {
        Args: { message: string; nonce: string; public: string; secret: string }
        Returns: string
      }
      crypto_box_new_keypair: {
        Args: Record<PropertyKey, never>
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_box_keypair"]
      }
      crypto_box_new_seed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_box_noncegen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_box_open: {
        Args: {
          ciphertext: string
          nonce: string
          public: string
          secret: string
        }
        Returns: string
      }
      crypto_box_seal: {
        Args: { message: string; public_key: string }
        Returns: string
      }
      crypto_box_seal_open: {
        Args: { ciphertext: string; public_key: string; secret_key: string }
        Returns: string
      }
      crypto_box_seed_new_keypair: {
        Args: { seed: string }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_box_keypair"]
      }
      crypto_generichash: {
        Args:
          | { message: string; key: number; context?: string }
          | { message: string; key?: string }
          | { message: string; key_uuid: string }
        Returns: string
      }
      crypto_generichash_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_hash_sha256: {
        Args: { message: string }
        Returns: string
      }
      crypto_hash_sha512: {
        Args: { message: string }
        Returns: string
      }
      crypto_kdf_derive_from_key: {
        Args:
          | {
              subkey_size: number
              subkey_id: number
              context: string
              primary_key: string
            }
          | {
              subkey_size: number
              subkey_id: number
              context: string
              primary_key: string
            }
        Returns: string
      }
      crypto_kdf_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_kx_client_session_keys: {
        Args: { client_pk: string; client_sk: string; server_pk: string }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_kx_session"]
      }
      crypto_kx_new_keypair: {
        Args: Record<PropertyKey, never>
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_kx_keypair"]
      }
      crypto_kx_new_seed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_kx_seed_new_keypair: {
        Args: { seed: string }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_kx_keypair"]
      }
      crypto_kx_server_session_keys: {
        Args: { server_pk: string; server_sk: string; client_pk: string }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_kx_session"]
      }
      crypto_pwhash: {
        Args: { password: string; salt: string }
        Returns: string
      }
      crypto_pwhash_saltgen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_pwhash_str: {
        Args: { password: string }
        Returns: string
      }
      crypto_pwhash_str_verify: {
        Args: { hashed_password: string; password: string }
        Returns: boolean
      }
      crypto_secretbox: {
        Args:
          | { message: string; nonce: string; key: string }
          | { message: string; nonce: string; key_id: number; context?: string }
          | { message: string; nonce: string; key_uuid: string }
        Returns: string
      }
      crypto_secretbox_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_secretbox_noncegen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_secretbox_open: {
        Args:
          | { ciphertext: string; nonce: string; key: string }
          | { message: string; nonce: string; key_id: number; context?: string }
          | { message: string; nonce: string; key_uuid: string }
        Returns: string
      }
      crypto_secretstream_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_shorthash: {
        Args:
          | { message: string; key: number; context?: string }
          | { message: string; key: string }
          | { message: string; key_uuid: string }
        Returns: string
      }
      crypto_shorthash_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_sign: {
        Args: { message: string; key: string }
        Returns: string
      }
      crypto_sign_detached: {
        Args: { message: string; key: string }
        Returns: string
      }
      crypto_sign_final_create: {
        Args: { state: string; key: string }
        Returns: string
      }
      crypto_sign_final_verify: {
        Args: { state: string; signature: string; key: string }
        Returns: boolean
      }
      crypto_sign_init: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_sign_new_keypair: {
        Args: Record<PropertyKey, never>
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_sign_keypair"]
      }
      crypto_sign_new_seed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_sign_open: {
        Args: { signed_message: string; key: string }
        Returns: string
      }
      crypto_sign_seed_new_keypair: {
        Args: { seed: string }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_sign_keypair"]
      }
      crypto_sign_update: {
        Args: { state: string; message: string }
        Returns: string
      }
      crypto_sign_update_agg1: {
        Args: { state: string; message: string }
        Returns: string
      }
      crypto_sign_update_agg2: {
        Args: { cur_state: string; initial_state: string; message: string }
        Returns: string
      }
      crypto_sign_verify_detached: {
        Args: { sig: string; message: string; key: string }
        Returns: boolean
      }
      crypto_signcrypt_new_keypair: {
        Args: Record<PropertyKey, never>
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_signcrypt_keypair"]
      }
      crypto_signcrypt_sign_after: {
        Args: { state: string; sender_sk: string; ciphertext: string }
        Returns: string
      }
      crypto_signcrypt_sign_before: {
        Args: {
          sender: string
          recipient: string
          sender_sk: string
          recipient_pk: string
          additional: string
        }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_signcrypt_state_key"]
      }
      crypto_signcrypt_verify_after: {
        Args: {
          state: string
          signature: string
          sender_pk: string
          ciphertext: string
        }
        Returns: boolean
      }
      crypto_signcrypt_verify_before: {
        Args: {
          signature: string
          sender: string
          recipient: string
          additional: string
          sender_pk: string
          recipient_sk: string
        }
        Returns: Database["pgsodium"]["CompositeTypes"]["crypto_signcrypt_state_key"]
      }
      crypto_signcrypt_verify_public: {
        Args: {
          signature: string
          sender: string
          recipient: string
          additional: string
          sender_pk: string
          ciphertext: string
        }
        Returns: boolean
      }
      crypto_stream_xchacha20_keygen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      crypto_stream_xchacha20_noncegen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      decrypted_columns: {
        Args: { relid: unknown }
        Returns: string
      }
      derive_key: {
        Args: { key_id: number; key_len?: number; context?: string }
        Returns: string
      }
      disable_security_label_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_security_label_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      encrypted_column: {
        Args: { relid: unknown; m: Record<string, unknown> }
        Returns: string
      }
      encrypted_columns: {
        Args: { relid: unknown }
        Returns: string
      }
      get_key_by_id: {
        Args: { "": string }
        Returns: {
          associated_data: string | null
          created: string | null
          expires: string | null
          id: string | null
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
        }
      }
      get_key_by_name: {
        Args: { "": string }
        Returns: {
          associated_data: string | null
          created: string | null
          expires: string | null
          id: string | null
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
        }
      }
      get_named_keys: {
        Args: { filter?: string }
        Returns: {
          associated_data: string | null
          created: string | null
          expires: string | null
          id: string | null
          key_context: string | null
          key_id: number | null
          key_type: Database["pgsodium"]["Enums"]["key_type"] | null
          name: string | null
          status: Database["pgsodium"]["Enums"]["key_status"] | null
        }[]
      }
      has_mask: {
        Args: { role: unknown; source_name: string }
        Returns: boolean
      }
      mask_columns: {
        Args: { source_relid: unknown }
        Returns: {
          attname: unknown
          key_id: string
          key_id_column: string
          associated_column: string
          nonce_column: string
          format_type: string
        }[]
      }
      mask_role: {
        Args: { masked_role: unknown; source_name: string; view_name: string }
        Returns: undefined
      }
      pgsodium_derive: {
        Args: { key_id: number; key_len?: number; context?: string }
        Returns: string
      }
      randombytes_buf: {
        Args: { size: number }
        Returns: string
      }
      randombytes_buf_deterministic: {
        Args: { size: number; seed: string }
        Returns: string
      }
      randombytes_new_seed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      randombytes_random: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      randombytes_uniform: {
        Args: { upper_bound: number }
        Returns: number
      }
      sodium_base642bin: {
        Args: { base64: string }
        Returns: string
      }
      sodium_bin2base64: {
        Args: { bin: string }
        Returns: string
      }
      update_mask: {
        Args: { target: unknown; debug?: boolean }
        Returns: undefined
      }
      update_masks: {
        Args: { debug?: boolean }
        Returns: undefined
      }
      version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      key_status: "default" | "valid" | "invalid" | "expired"
      key_type:
        | "aead-ietf"
        | "aead-det"
        | "hmacsha512"
        | "hmacsha256"
        | "auth"
        | "shorthash"
        | "generichash"
        | "kdf"
        | "secretbox"
        | "secretstream"
        | "stream_xchacha20"
    }
    CompositeTypes: {
      _key_id_context: {
        key_id: number | null
        key_context: string | null
      }
      crypto_box_keypair: {
        public: string | null
        secret: string | null
      }
      crypto_kx_keypair: {
        public: string | null
        secret: string | null
      }
      crypto_kx_session: {
        rx: string | null
        tx: string | null
      }
      crypto_sign_keypair: {
        public: string | null
        secret: string | null
      }
      crypto_signcrypt_keypair: {
        public: string | null
        secret: string | null
      }
      crypto_signcrypt_state_key: {
        state: string | null
        shared_key: string | null
      }
    }
  }
  pgsodium_masks: {
    Tables: {
      [_ in never]: never
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
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          created_at: string
          id: string
          input: Json
          suggestion: string
          type: string
          user_id: string
          was_accepted: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          input: Json
          suggestion: string
          type: string
          user_id: string
          was_accepted?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          input?: Json
          suggestion?: string
          type?: string
          user_id?: string
          was_accepted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token: string
          account_email: string
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          organization_id: string
          provider: string
          refresh_token: string
          token_expires_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_email: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          organization_id: string
          provider: string
          refresh_token: string
          token_expires_at: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_email?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          organization_id?: string
          provider?: string
          refresh_token?: string
          token_expires_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_connections_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_connections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          confirmed_at: string | null
          connection_id: string
          end_at: string
          id: string
          is_billable: boolean | null
          is_recurring: boolean
          location: string | null
          provider_event_id: string
          start_at: string
          suggested_client_id: string | null
          title: string
        }
        Insert: {
          confirmed_at?: string | null
          connection_id: string
          end_at: string
          id?: string
          is_billable?: boolean | null
          is_recurring?: boolean
          location?: string | null
          provider_event_id: string
          start_at: string
          suggested_client_id?: string | null
          title: string
        }
        Update: {
          confirmed_at?: string | null
          connection_id?: string
          end_at?: string
          id?: string
          is_billable?: boolean | null
          is_recurring?: boolean
          location?: string | null
          provider_event_id?: string
          start_at?: string
          suggested_client_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_connection_id_fkey"
            columns: ["connection_id"]
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_suggested_client_id_fkey"
            columns: ["suggested_client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_filters: {
        Row: {
          calendar_id: string
          calendar_name: string
          color: string | null
          connection_id: string
          id: string
          is_visible: boolean
        }
        Insert: {
          calendar_id: string
          calendar_name: string
          color?: string | null
          connection_id: string
          id?: string
          is_visible?: boolean
        }
        Update: {
          calendar_id?: string
          calendar_name?: string
          color?: string | null
          connection_id?: string
          id?: string
          is_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "calendar_filters_connection_id_fkey"
            columns: ["connection_id"]
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      cashflow_settings: {
        Row: {
          current_balance: number
          id: string
          monthly_fixed_expenses: number
          organization_id: string
          safety_buffer: number
          tax_reserve_percentage: number
          updated_at: string
          vat_frequency: string
        }
        Insert: {
          current_balance?: number
          id?: string
          monthly_fixed_expenses?: number
          organization_id: string
          safety_buffer?: number
          tax_reserve_percentage?: number
          updated_at?: string
          vat_frequency?: string
        }
        Update: {
          current_balance?: number
          id?: string
          monthly_fixed_expenses?: number
          organization_id?: string
          safety_buffer?: number
          tax_reserve_percentage?: number
          updated_at?: string
          vat_frequency?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_settings_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          color: string
          created_at: string
          eboekhoud_id: string | null
          email: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          is_favorite: boolean
          jortt_id: string | null
          km_rate: number | null
          minimum_minutes: number | null
          moneybird_id: string | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          eboekhoud_id?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_favorite?: boolean
          jortt_id?: string | null
          km_rate?: number | null
          minimum_minutes?: number | null
          moneybird_id?: string | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          eboekhoud_id?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          is_favorite?: boolean
          jortt_id?: string | null
          km_rate?: number | null
          minimum_minutes?: number | null
          moneybird_id?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          date: string
          description: string
          exported_at: string | null
          id: string
          is_export_ready: boolean
          organization_id: string
          project_id: string | null
          receipt_url: string | null
          type: string
          user_id: string
          vat_rate: number | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          date: string
          description: string
          exported_at?: string | null
          id?: string
          is_export_ready?: boolean
          organization_id: string
          project_id?: string | null
          receipt_url?: string | null
          type: string
          user_id: string
          vat_rate?: number | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          exported_at?: string | null
          id?: string
          is_export_ready?: boolean
          organization_id?: string
          project_id?: string | null
          receipt_url?: string | null
          type?: string
          user_id?: string
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      export_logs: {
        Row: {
          created_at: string
          entry_count: number
          id: string
          jortt_response: Json | null
          organization_id: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          entry_count: number
          id?: string
          jortt_response?: Json | null
          organization_id: string
          status: string
          type: string
        }
        Update: {
          created_at?: string
          entry_count?: number
          id?: string
          jortt_response?: Json | null
          organization_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_logs_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jortt_connections: {
        Row: {
          access_token: string
          created_at: string
          id: string
          is_active: boolean
          last_tested_at: string | null
          organization_id: string
          refresh_token: string
          token_expires_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          organization_id: string
          refresh_token: string
          token_expires_at: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          organization_id?: string
          refresh_token?: string
          token_expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jortt_connections_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          organization_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          organization_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_entries_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          mollie_id: string | null
          name: string
          plan: string
          slug: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mollie_id?: string | null
          name: string
          plan?: string
          slug: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mollie_id?: string | null
          name?: string
          plan?: string
          slug?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_hours: number | null
          client_id: string
          color: string | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          jortt_project_id: string | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          budget_hours?: number | null
          client_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          jortt_project_id?: string | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          budget_hours?: number | null
          client_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          jortt_project_id?: string | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          calendar_event_id: string | null
          client_id: string | null
          created_at: string
          due_at: string | null
          id: string
          is_completed: boolean
          organization_id: string
          project_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          calendar_event_id?: string | null
          client_id?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          is_completed?: boolean
          organization_id: string
          project_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          calendar_event_id?: string | null
          client_id?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          is_completed?: boolean
          organization_id?: string
          project_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          calendar_event_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          duration_billed_mins: number | null
          duration_mins: number | null
          duration_raw_mins: number | null
          exported_at: string | null
          hourly_rate_snapshot: number | null
          id: string
          is_export_ready: boolean
          is_indirect: boolean
          km_rate_snapshot: number | null
          organization_id: string
          project_id: string | null
          started_at: string
          stopped_at: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_event_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_billed_mins?: number | null
          duration_mins?: number | null
          duration_raw_mins?: number | null
          exported_at?: string | null
          hourly_rate_snapshot?: number | null
          id?: string
          is_export_ready?: boolean
          is_indirect?: boolean
          km_rate_snapshot?: number | null
          organization_id: string
          project_id?: string | null
          started_at: string
          stopped_at?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_event_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_billed_mins?: number | null
          duration_mins?: number | null
          duration_raw_mins?: number | null
          exported_at?: string | null
          hourly_rate_snapshot?: number | null
          id?: string
          is_export_ready?: boolean
          is_indirect?: boolean
          km_rate_snapshot?: number | null
          organization_id?: string
          project_id?: string | null
          started_at?: string
          stopped_at?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      timer_templates: {
        Row: {
          client_id: string | null
          color: string | null
          created_at: string
          default_mins: number | null
          description: string | null
          id: string
          is_favorite: boolean
          last_used_at: string | null
          name: string
          organization_id: string
          project_id: string | null
          type: string
          usage_count: number
          user_id: string
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          default_mins?: number | null
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          name: string
          organization_id: string
          project_id?: string | null
          type?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          default_mins?: number | null
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          name?: string
          organization_id?: string
          project_id?: string | null
          type?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_templates_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timer_templates_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timer_templates_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timer_templates_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          notif_enabled: boolean
          notif_interval_mins: number
          notif_weekdays_only: boolean
          notif_window_end: string
          notif_window_start: string
          onboarded_at: string | null
          organization_id: string
          role: string
          rounding_interval: string
          weekly_hour_goal: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          notif_enabled?: boolean
          notif_interval_mins?: number
          notif_weekdays_only?: boolean
          notif_window_end?: string
          notif_window_start?: string
          onboarded_at?: string | null
          organization_id: string
          role?: string
          rounding_interval?: string
          weekly_hour_goal?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          notif_enabled?: boolean
          notif_interval_mins?: number
          notif_weekdays_only?: boolean
          notif_window_end?: string
          notif_window_start?: string
          onboarded_at?: string | null
          organization_id?: string
          role?: string
          rounding_interval?: string
          weekly_hour_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
  realtime: {
    Tables: {
      messages: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      subscription: {
        Row: {
          claims: Json
          claims_role: unknown
          created_at: string
          entity: unknown
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id: number
          subscription_id: string
        }
        Insert: {
          claims: Json
          claims_role?: unknown
          created_at?: string
          entity: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          subscription_id: string
        }
        Update: {
          claims?: Json
          claims_role?: unknown
          created_at?: string
          entity?: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          subscription_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_rls: {
        Args: { wal: Json; max_record_bytes?: number }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
      }
      broadcast_changes: {
        Args: {
          topic_name: string
          event_name: string
          operation: string
          table_name: string
          table_schema: string
          new: Record<string, unknown>
          old: Record<string, unknown>
          level?: string
        }
        Returns: undefined
      }
      build_prepared_statement_sql: {
        Args: {
          prepared_statement_name: string
          entity: unknown
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
        }
        Returns: string
      }
      cast: {
        Args: { val: string; type_: unknown }
        Returns: Json
      }
      check_equality_op: {
        Args: {
          op: Database["realtime"]["Enums"]["equality_op"]
          type_: unknown
          val_1: string
          val_2: string
        }
        Returns: boolean
      }
      is_visible_through_filters: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
        }
        Returns: boolean
      }
      list_changes: {
        Args: {
          publication: unknown
          slot_name: unknown
          max_changes: number
          max_record_bytes: number
        }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
      }
      quote_wal2json: {
        Args: { entity: unknown }
        Returns: string
      }
      send: {
        Args: { payload: Json; event: string; topic: string; private?: boolean }
        Returns: undefined
      }
      to_regrole: {
        Args: { role_name: string }
        Returns: unknown
      }
      topic: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      action: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE" | "ERROR"
      equality_op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in"
    }
    CompositeTypes: {
      user_defined_filter: {
        column_name: string | null
        op: Database["realtime"]["Enums"]["equality_op"] | null
        value: string | null
      }
      wal_column: {
        name: string | null
        type_name: string | null
        type_oid: unknown | null
        value: Json | null
        is_pkey: boolean | null
        is_selectable: boolean | null
      }
      wal_rls: {
        wal: Json | null
        is_rls_enabled: boolean | null
        subscription_ids: string[] | null
        errors: string[] | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  supabase_functions: {
    Tables: {
      hooks: {
        Row: {
          created_at: string
          hook_name: string
          hook_table_id: number
          id: number
          request_id: number | null
        }
        Insert: {
          created_at?: string
          hook_name: string
          hook_table_id: number
          id?: number
          request_id?: number | null
        }
        Update: {
          created_at?: string
          hook_name?: string
          hook_table_id?: number
          id?: number
          request_id?: number | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          inserted_at: string
          version: string
        }
        Insert: {
          inserted_at?: string
          version: string
        }
        Update: {
          inserted_at?: string
          version?: string
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
  vault: {
    Tables: {
      secrets: {
        Row: {
          created_at: string
          description: string
          id: string
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      decrypted_secrets: {
        Row: {
          created_at: string | null
          decrypted_secret: string | null
          description: string | null
          id: string | null
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_secret: {
        Args: {
          new_secret: string
          new_name?: string
          new_description?: string
          new_key_id?: string
        }
        Returns: string
      }
      update_secret: {
        Args: {
          secret_id: string
          new_secret?: string
          new_name?: string
          new_description?: string
          new_key_id?: string
        }
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  _realtime: {
    Enums: {},
  },
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  extensions: {
    Enums: {},
  },
  graphql: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  net: {
    Enums: {
      request_status: ["PENDING", "SUCCESS", "ERROR"],
    },
  },
  pgbouncer: {
    Enums: {},
  },
  pgsodium: {
    Enums: {
      key_status: ["default", "valid", "invalid", "expired"],
      key_type: [
        "aead-ietf",
        "aead-det",
        "hmacsha512",
        "hmacsha256",
        "auth",
        "shorthash",
        "generichash",
        "kdf",
        "secretbox",
        "secretstream",
        "stream_xchacha20",
      ],
    },
  },
  pgsodium_masks: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  realtime: {
    Enums: {
      action: ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"],
      equality_op: ["eq", "neq", "lt", "lte", "gt", "gte", "in"],
    },
  },
  storage: {
    Enums: {},
  },
  supabase_functions: {
    Enums: {},
  },
  vault: {
    Enums: {},
  },
} as const
