export type UserRole = 'admin' | 'manager' | 'counsellor';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export type ActivityType =
  | 'lead_created'
  | 'status_changed'
  | 'note_added'
  | 'follow_up_scheduled'
  | 'follow_up_completed'
  | 'lead_updated';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string;
  course_interest: string;
  source: string;
  status: LeadStatus;
  lost_reason?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  // Joins / UI enrichments
  assignee?: Profile | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to?: string | null;
  due_at: string; // ISO timestamptz
  note: string;
  status: FollowUpStatus;
  completed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  // Joins / UI enrichments
  lead?: Lead | null;
  assignee?: Profile | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  actor_id?: string | null;
  activity_type: ActivityType;
  description: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  // Joins / UI enrichments
  actor?: Profile | null;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number; // percentage (0 - 100)
  overdueFollowUps: number;
}
