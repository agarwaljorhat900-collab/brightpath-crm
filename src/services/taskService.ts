import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Task, TaskStatus, TaskPriority } from '../types';

export const taskService = {
  async fetchTasks() {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    return supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, role),
        related_lead:leads!tasks_related_lead_id_fkey(id, full_name, course_interest, status)
      `)
      .order('created_at', { ascending: false });
  },

  async createTask(task: {
    title: string;
    description?: string | null;
    assigned_to?: string | null;
    created_by: string;
    priority: TaskPriority;
    due_date?: string | null;
    related_lead_id?: string | null;
  }) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    return supabase.from('tasks').insert([{ ...task, status: 'todo' }]).select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(id, full_name, role),
      related_lead:leads!tasks_related_lead_id_fkey(id, full_name, course_interest, status)
    `).single();
  },

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }
    return supabase.from('tasks').update(updateData).eq('id', taskId).select().single();
  },

  async deleteTask(taskId: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    return supabase.from('tasks').delete().eq('id', taskId);
  }
};
