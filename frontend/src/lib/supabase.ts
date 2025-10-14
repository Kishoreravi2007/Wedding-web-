/**
 * Supabase Client Configuration
 * 
 * Provides typed Supabase client for frontend operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database types (generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      photos: {
        Row: {
          id: string;
          filename: string;
          file_path: string;
          public_url: string;
          size: number;
          mimetype: string;
          sister: 'sister-a' | 'sister-b';
          title: string | null;
          description: string | null;
          event_type: string | null;
          tags: string[];
          storage_provider: 'supabase' | 'firebase';
          photographer_id: string | null;
          uploaded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          file_path: string;
          public_url: string;
          size: number;
          mimetype: string;
          sister: 'sister-a' | 'sister-b';
          title?: string | null;
          description?: string | null;
          event_type?: string | null;
          tags?: string[];
          storage_provider?: 'supabase' | 'firebase';
          photographer_id?: string | null;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          file_path?: string;
          public_url?: string;
          size?: number;
          mimetype?: string;
          sister?: 'sister-a' | 'sister-b';
          title?: string | null;
          description?: string | null;
          event_type?: string | null;
          tags?: string[];
          storage_provider?: 'supabase' | 'firebase';
          photographer_id?: string | null;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          name: string;
          role: 'bride' | 'groom' | 'family' | 'friend' | 'vendor' | 'other';
          avatar_url: string | null;
          sister: 'sister-a' | 'sister-b' | 'both' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: 'bride' | 'groom' | 'family' | 'friend' | 'vendor' | 'other';
          avatar_url?: string | null;
          sister?: 'sister-a' | 'sister-b' | 'both' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'bride' | 'groom' | 'family' | 'friend' | 'vendor' | 'other';
          avatar_url?: string | null;
          sister?: 'sister-a' | 'sister-b' | 'both' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      face_descriptors: {
        Row: {
          id: string;
          person_id: string | null;
          descriptor: number[];
          photo_id: string | null;
          confidence: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id?: string | null;
          descriptor: number[];
          photo_id?: string | null;
          confidence?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string | null;
          descriptor?: number[];
          photo_id?: string | null;
          confidence?: number | null;
          created_at?: string;
        };
      };
      photo_faces: {
        Row: {
          id: string;
          photo_id: string;
          person_id: string | null;
          face_descriptor_id: string | null;
          bounding_box: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          confidence: number | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          person_id?: string | null;
          face_descriptor_id?: string | null;
          bounding_box: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          confidence?: number | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          person_id?: string | null;
          face_descriptor_id?: string | null;
          bounding_box?: {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          confidence?: number | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      photos_with_faces: {
        Row: {
          id: string;
          filename: string;
          file_path: string;
          public_url: string;
          size: number;
          mimetype: string;
          sister: 'sister-a' | 'sister-b';
          title: string | null;
          description: string | null;
          event_type: string | null;
          tags: string[];
          storage_provider: 'supabase' | 'firebase';
          photographer_id: string | null;
          uploaded_at: string;
          created_at: string;
          updated_at: string;
          face_count: number;
          people_names: string[];
        };
      };
      people_with_stats: {
        Row: {
          id: string;
          name: string;
          role: 'bride' | 'groom' | 'family' | 'friend' | 'vendor' | 'other';
          avatar_url: string | null;
          sister: 'sister-a' | 'sister-b' | 'both' | null;
          created_at: string;
          updated_at: string;
          photo_count: number;
          descriptor_count: number;
        };
      };
    };
  };
}

// Helper function to check Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('photos').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // Table doesn't exist is okay
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Helper function to get storage bucket URL
export function getStorageBucketUrl(): string {
  return `${supabaseUrl}/storage/v1/object/public/wedding-photos`;
}

