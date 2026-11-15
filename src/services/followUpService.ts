import { supabase } from '../lib/supabaseClient';
import { FollowUp, FollowUpStatus } from '../types';

export const followUpService = {
  async fetchFollowUps(): Promise<{ data: FollowUp[] | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          lead:leads(id, full_name, phone, course_interest),
          assignee:profiles!follow_ups_assigned_to_fkey(id, full_name, role)
        `)
        .order('due_at', { ascending: true });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as FollowUp[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createFollowUp(
    followUpData: Omit<FollowUp, 'id' | 'created_at'>
  ): Promise<{ data: FollowUp | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert([followUpData])
        .select(`
          *,
          lead:leads(id, full_name, phone, course_interest),
          assignee:profiles!follow_ups_assigned_to_fkey(id, full_name, role)
        `)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as FollowUp, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updateFollowUpStatus(
    id: string,
    status: FollowUpStatus
  ): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase client not initialized') };
    }

    try {
      const completed_at = status === 'completed' ? new Date().toISOString() : null;
      const { error } = await supabase
        .from('follow_ups')
        .update({ status, completed_at })
        .eq('id', id);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }
};
