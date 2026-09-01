export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audits: {
        Row: {
          id: string;
          user_id: string;
          website_url: string;
          business_name: string;
          industry: string;
          business_description: string | null;
          client_id: string | null;
          overall_score: number | null;
          status: "pending" | "analyzing" | "completed" | "failed";
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          website_url: string;
          business_name: string;
          industry: string;
          business_description?: string | null;
          client_id?: string | null;
          overall_score?: number | null;
          status?: "pending" | "analyzing" | "completed" | "failed";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          website_url?: string;
          business_name?: string;
          industry?: string;
          business_description?: string | null;
          client_id?: string | null;
          overall_score?: number | null;
          status?: "pending" | "analyzing" | "completed" | "failed";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          audit_id: string;
          seo_score: number;
          conversion_score: number;
          ux_score: number;
          trust_score: number;
          brand_score: number;
          category_details: Json;
          executive_summary: Json;
          strengths: Json;
          weaknesses: Json;
          recommendations: Json;
          growth_plan: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          seo_score: number;
          conversion_score: number;
          ux_score: number;
          trust_score: number;
          brand_score: number;
          category_details?: Json;
          executive_summary?: Json;
          strengths?: Json;
          weaknesses?: Json;
          recommendations?: Json;
          growth_plan?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          seo_score?: number;
          conversion_score?: number;
          ux_score?: number;
          trust_score?: number;
          brand_score?: number;
          category_details?: Json;
          executive_summary?: Json;
          strengths?: Json;
          weaknesses?: Json;
          recommendations?: Json;
          growth_plan?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          website_url: string | null;
          industry: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          website_url?: string | null;
          industry?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          website_url?: string | null;
          industry?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_notes: {
        Row: {
          id: string;
          client_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      competitor_analyses: {
        Row: {
          id: string;
          audit_id: string;
          user_id: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          user_id: string;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          user_id?: string;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      report_messages: {
        Row: {
          id: string;
          audit_id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          user_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          company_name: string | null;
          workspace_type: "solo" | "agency";
          default_industry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          company_name?: string | null;
          workspace_type?: "solo" | "agency";
          default_industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          company_name?: string | null;
          workspace_type?: "solo" | "agency";
          default_industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      competitors: {
        Row: {
          id: string;
          user_id: string;
          audit_id: string;
          website_url: string;
          analysis: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          audit_id: string;
          website_url: string;
          analysis?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          audit_id?: string;
          website_url?: string;
          analysis?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "agency";
          status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "pro" | "agency";
          status?: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "pro" | "agency";
          status?: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string | null;
          amount_cents: number;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_id?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      usage_limits: {
        Row: {
          user_id: string;
          plan: "free" | "pro" | "agency";
          audits_used: number;
          period_start: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan?: "free" | "pro" | "agency";
          audits_used?: number;
          period_start?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          plan?: "free" | "pro" | "agency";
          audits_used?: number;
          period_start?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      chat_messages: {
        Row: {
          id: string | null;
          user_id: string | null;
          audit_id: string | null;
          role: string | null;
          message: string | null;
          created_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
