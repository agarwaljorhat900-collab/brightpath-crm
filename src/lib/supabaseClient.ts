import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  missingUrl: boolean;
  missingKey: boolean;
  isPlaceholder: boolean;
  message: string;
}

export function checkSupabaseConfig(): SupabaseConfigStatus {
  const missingUrl = !supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '';
  const missingKey = !supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '';
  const isPlaceholder =
    supabaseUrl?.includes('your-project-id') ||
    supabaseAnonKey?.includes('your-public-client-key');

  if (missingUrl || missingKey) {
    return {
      isConfigured: false,
      missingUrl,
      missingKey,
      isPlaceholder: false,
      message: 'Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing in .env.'
    };
  }

  if (isPlaceholder) {
    return {
      isConfigured: false,
      missingUrl: false,
      missingKey: false,
      isPlaceholder: true,
      message: 'Supabase environment variables contain placeholder values. Please provide your live Supabase project credentials.'
    };
  }

  return {
    isConfigured: true,
    missingUrl: false,
    missingKey: false,
    isPlaceholder: false,
    message: 'Supabase configuration is valid.'
  };
}

export const configStatus = checkSupabaseConfig();

export const supabase: SupabaseClient | null = configStatus.isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;
