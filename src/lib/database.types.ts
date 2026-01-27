export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          property_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          receiver_id: string;
          property_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          receiver_id?: string;
          property_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          property_id: string;
          buyer_id: string;
          seller_id: string;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          buyer_id: string;
          seller_id: string;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          buyer_id?: string;
          seller_id?: string;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filters: Json;
          alert_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          filters: Json;
          alert_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          filters?: Json;
          alert_enabled?: boolean;
          created_at?: string;
        };
      };
      property_views: {
        Row: {
          id: string;
          property_id: string;
          user_id: string | null;
          session_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id?: string | null;
          session_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string | null;
          session_id?: string | null;
          viewed_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          preferred_localities: string[] | null;
          preferred_bhk: number[] | null;
          price_range_min: number | null;
          price_range_max: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          preferred_localities?: string[] | null;
          preferred_bhk?: number[] | null;
          price_range_min?: number | null;
          price_range_max?: number | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          preferred_localities?: string[] | null;
          preferred_bhk?: number[] | null;
          price_range_min?: number | null;
          price_range_max?: number | null;
          updated_at?: string;
        };
      };
      recent_searches: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          query: string;
          filters: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          query: string;
          filters?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          query?: string;
          filters?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
