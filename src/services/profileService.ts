import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';

export const profileService = {
  async fetchProfiles(): Promise<{ data: Profile[] | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Profile[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
};
