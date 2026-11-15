import { supabase } from '../lib/supabaseClient';
import { Activity } from '../types';

export const activityService = {
  async fetchActivities(): Promise<{ data: Activity[] | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          actor:profiles!activities_actor_id_fkey(id, full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Activity[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async logActivity(
    activityData: Omit<Activity, 'id' | 'created_at'>
  ): Promise<{ data: Activity | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select(`
          *,
          actor:profiles!activities_actor_id_fkey(id, full_name, role)
        `)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Activity, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
};
