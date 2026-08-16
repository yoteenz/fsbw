/**
 * All In One database types — align with all-in-one/supabase/migrations/.
 * Regenerate when schema changes: supabase gen types (dedicated AIO project only).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AioOrgType = 'carrier' | 'owner_operator' | 'fleet' | 'shipper' | 'aio_internal' | 'partner';
export type AioMembershipRole =
  | 'organization_owner'
  | 'organization_admin'
  | 'organization_member'
  | 'shipper_user';
export type AioInternalRole =
  | 'super_admin'
  | 'administrator'
  | 'permitting_specialist'
  | 'compliance_specialist'
  | 'dispatcher'
  | 'insurance_specialist'
  | 'factoring_specialist'
  | 'brokerage_specialist'
  | 'support_specialist';
export type AioVisibility = 'internal' | 'customer' | 'system';

export interface AioDatabase {
  public: {
    Tables: {
      aio_profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_profiles']['Row']> & { id: string; email: string };
        Update: Partial<AioDatabase['public']['Tables']['aio_profiles']['Row']>;
      };
      aio_organizations: {
        Row: {
          id: string;
          name: string;
          organization_type: AioOrgType;
          business_structure: string | null;
          formation_state: string | null;
          primary_operating_state: string | null;
          status: string;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_organizations']['Row']> & {
          name: string;
          organization_type: AioOrgType;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_organizations']['Row']>;
      };
      aio_organization_memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: AioMembershipRole;
          status: string;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_organization_memberships']['Row']> & {
          organization_id: string;
          user_id: string;
          role: AioMembershipRole;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_organization_memberships']['Row']>;
      };
      aio_internal_staff: {
        Row: {
          id: string;
          user_id: string;
          role: AioInternalRole;
          status: string;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_internal_staff']['Row']> & {
          user_id: string;
          role: AioInternalRole;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_internal_staff']['Row']>;
      };
      aio_intake_sessions: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          status: string;
          answers: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_intake_sessions']['Row']> & {
          organization_id: string;
          user_id: string;
          answers: Json;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_intake_sessions']['Row']>;
      };
      aio_roadmaps: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          rule_version: string;
          compliance_progress: number;
          business_progress: number;
          status: string;
          source_intake_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_roadmaps']['Row']> & {
          organization_id: string;
          user_id: string;
          rule_version: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_roadmaps']['Row']>;
      };
      aio_roadmap_items: {
        Row: {
          id: string;
          roadmap_id: string;
          title: string;
          status: string;
          category: string | null;
          reason: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_roadmap_items']['Row']> & {
          roadmap_id: string;
          title: string;
          status: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_roadmap_items']['Row']>;
      };
      aio_service_requests: {
        Row: {
          id: string;
          organization_id: string;
          requester_user_id: string | null;
          request_number: string;
          division: string;
          service_slug: string | null;
          status: string;
          workflow_step: string;
          status_label: string | null;
          priority: string;
          assigned_staff_user_id: string | null;
          customer_notes: string | null;
          target_date: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_service_requests']['Row']> & {
          organization_id: string;
          request_number: string;
          division: string;
          status: string;
          workflow_step: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_service_requests']['Row']>;
      };
      aio_service_request_status_history: {
        Row: {
          id: string;
          request_id: string;
          from_status: string | null;
          to_status: string;
          actor_user_id: string | null;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_service_request_status_history']['Row']> & {
          request_id: string;
          to_status: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_service_request_status_history']['Row']>;
      };
      aio_tasks: {
        Row: {
          id: string;
          organization_id: string | null;
          request_id: string | null;
          title: string;
          assigned_staff_user_id: string | null;
          priority: string;
          status: string;
          category: string | null;
          due_at: string | null;
          notes: string | null;
          visibility: AioVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_tasks']['Row']> & { title: string };
        Update: Partial<AioDatabase['public']['Tables']['aio_tasks']['Row']>;
      };
      aio_documents: {
        Row: {
          id: string;
          organization_id: string;
          request_id: string | null;
          category: string;
          name: string;
          status: string;
          visibility: AioVisibility;
          expires_at: string | null;
          storage_reference: string | null;
          verified_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_documents']['Row']> & {
          organization_id: string;
          category: string;
          name: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_documents']['Row']>;
      };
      aio_internal_notes: {
        Row: {
          id: string;
          organization_id: string;
          request_id: string | null;
          author_user_id: string;
          body: string;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_internal_notes']['Row']> & {
          organization_id: string;
          author_user_id: string;
          body: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_internal_notes']['Row']>;
      };
      aio_conversations: {
        Row: {
          id: string;
          organization_id: string;
          request_id: string | null;
          context_type: string;
          division: string | null;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_conversations']['Row']> & {
          organization_id: string;
          context_type: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_conversations']['Row']>;
      };
      aio_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_user_id: string;
          body: string;
          visibility: AioVisibility;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_messages']['Row']> & {
          conversation_id: string;
          sender_user_id: string;
          body: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_messages']['Row']>;
      };
      aio_activity_events: {
        Row: {
          id: string;
          event_type: string;
          actor_user_id: string | null;
          organization_id: string | null;
          entity_type: string | null;
          entity_id: string | null;
          visibility: AioVisibility;
          title: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_activity_events']['Row']> & {
          event_type: string;
          title: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_activity_events']['Row']>;
      };
      aio_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          entity_type: string | null;
          entity_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_notifications']['Row']> & {
          user_id: string;
          type: string;
          title: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_notifications']['Row']>;
      };
      aio_deadlines: {
        Row: {
          id: string;
          organization_id: string;
          entity_type: string | null;
          entity_id: string | null;
          title: string;
          deadline_type: string;
          due_at: string;
          status: string;
          source: string;
          verified: boolean;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_deadlines']['Row']> & {
          organization_id: string;
          title: string;
          deadline_type: string;
          due_at: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_deadlines']['Row']>;
      };
      aio_dispatch_loads: {
        Row: {
          id: string;
          organization_id: string;
          load_number: string;
          carrier_name: string | null;
          origin: string;
          destination: string;
          rate: number | null;
          miles: number | null;
          status: string;
          has_rate_con: boolean;
          has_pod: boolean;
          has_invoice: boolean;
          factoring_eligible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_dispatch_loads']['Row']> & {
          organization_id: string;
          load_number: string;
          origin: string;
          destination: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_dispatch_loads']['Row']>;
      };
      aio_factoring_cases: {
        Row: {
          id: string;
          organization_id: string;
          load_id: string | null;
          carrier_name: string | null;
          invoice_amount: number | null;
          status: string;
          status_label: string | null;
          eligibility_status: string | null;
          partner_status: string | null;
          estimated_fee: number | null;
          estimated_net: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_factoring_cases']['Row']> & {
          organization_id: string;
          status: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_factoring_cases']['Row']>;
      };
      aio_brokerage_quotes: {
        Row: {
          id: string;
          organization_id: string;
          shipper_name: string;
          origin: string;
          destination: string;
          status: string;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_brokerage_quotes']['Row']> & {
          organization_id: string;
          shipper_name: string;
          origin: string;
          destination: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_brokerage_quotes']['Row']>;
      };
      aio_brokerage_shipments: {
        Row: {
          id: string;
          organization_id: string;
          quote_id: string | null;
          shipment_number: string;
          shipper_name: string;
          origin: string;
          destination: string;
          status: string;
          carrier: string | null;
          rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_brokerage_shipments']['Row']> & {
          organization_id: string;
          shipment_number: string;
          shipper_name: string;
          origin: string;
          destination: string;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_brokerage_shipments']['Row']>;
      };
      aio_invoices: {
        Row: {
          id: string;
          organization_id: string;
          request_id: string | null;
          invoice_number: string;
          service: string;
          amount: number;
          status: string;
          issued_at: string | null;
          due_at: string | null;
          created_at: string;
        };
        Insert: Partial<AioDatabase['public']['Tables']['aio_invoices']['Row']> & {
          organization_id: string;
          invoice_number: string;
          service: string;
          amount: number;
        };
        Update: Partial<AioDatabase['public']['Tables']['aio_invoices']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
