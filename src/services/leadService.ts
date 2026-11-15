import { supabase } from '../lib/supabaseClient';
import { Lead, LeadStatus } from '../types';

export const leadService = {
  async fetchLeads(): Promise<{ data: Lead[] | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assignee:profiles!leads_assigned_to_fkey(id, full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Lead[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createLead(leadData: Omit<Lead, 'id' | 'created_at'>): Promise<{ data: Lead | null; error: Error | null }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select(`
          *,
          assignee:profiles!leads_assigned_to_fkey(id, full_name, role)
        `)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as Lead, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updateLeadStatus(
    leadId: string,
    status: LeadStatus,
    lostReason?: string
  ): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase client not initialized') };
    }

    try {
      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'Lost') {
        updatePayload.lost_reason = lostReason || 'No reason provided';
      } else {
        updatePayload.lost_reason = null;
      }

      const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }
};
