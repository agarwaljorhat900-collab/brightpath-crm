import { Lead, FollowUp, Activity, Profile } from '../types';

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'p-1',
    full_name: 'Mehul Agarwal',
    role: 'admin',
    created_at: '2026-11-01T09:00:00Z'
  },
  {
    id: 'p-2',
    full_name: 'Rohit Sharma',
    role: 'manager',
    created_at: '2026-11-02T10:00:00Z'
  },
  {
    id: 'p-3',
    full_name: 'Pooja Nair',
    role: 'counsellor',
    created_at: '2026-11-03T11:00:00Z'
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l-1',
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    course_interest: 'Full Stack Web Development',
    source: 'Website Form',
    status: 'New',
    assigned_to: 'p-3',
    created_by: 'p-1',
    notes: 'Inquired about the weekend batch schedule and placement support.',
    created_at: '2026-11-14T08:30:00Z',
    assignee: MOCK_PROFILES[2]
  },
  {
    id: 'l-2',
    full_name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98234 56789',
    course_interest: 'Data Science & AI',
    source: 'Google Ads',
    status: 'Contacted',
    assigned_to: 'p-3',
    created_by: 'p-3',
    notes: 'Completed introductory call. Shared curriculum syllabus PDF via email.',
    created_at: '2026-11-12T10:15:00Z',
    assignee: MOCK_PROFILES[2]
  },
  {
    id: 'l-3',
    full_name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '+91 91234 56780',
    course_interest: 'Cloud & DevOps Engineering',
    source: 'Student Referral',
    status: 'Qualified',
    assigned_to: 'p-2',
    created_by: 'p-2',
    notes: 'B.Tech final year student. High intent, asked about installment payment options.',
    created_at: '2026-11-10T14:20:00Z',
    assignee: MOCK_PROFILES[1]
  },
  {
    id: 'l-4',
    full_name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    phone: '+91 97654 32109',
    course_interest: 'UI/UX Design Bootcamp',
    source: 'Instagram / Social Media',
    status: 'Converted',
    assigned_to: 'p-3',
    created_by: 'p-1',
    notes: 'Admission confirmed! Paid initial registration deposit for December batch.',
    created_at: '2026-11-08T11:00:00Z',
    assignee: MOCK_PROFILES[2]
  },
  {
    id: 'l-5',
    full_name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 99887 76655',
    course_interest: 'Cybersecurity Specialist',
    source: 'Walk-in',
    status: 'Contacted',
    assigned_to: 'p-3',
    created_by: 'p-3',
    notes: 'Visited institute campus. Took counseling session and campus tour.',
    created_at: '2026-11-13T16:00:00Z',
    assignee: MOCK_PROFILES[2]
  },
  {
    id: 'l-6',
    full_name: 'Sneha Rao',
    email: 'sneha.rao@example.com',
    phone: '+91 94567 12340',
    course_interest: 'Full Stack Web Development',
    source: 'Website Form',
    status: 'Lost',
    lost_reason: 'Joined college semester project instead; may revisit next year.',
    assigned_to: 'p-2',
    created_by: 'p-1',
    notes: 'Marked lost after follow-up call confirmed non-availability.',
    created_at: '2026-11-05T09:45:00Z',
    assignee: MOCK_PROFILES[1]
  }
];

// Current reference timestamp: 2026-11-15T13:40:00Z
export const MOCK_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'f-1',
    lead_id: 'l-1',
    assigned_to: 'p-3',
    due_at: '2026-11-15T16:00:00Z', // Later today (Upcoming)
    note: 'Call Aarav to discuss batch timing choices and answer scholarship questions',
    status: 'pending',
    created_by: 'p-3',
    created_at: '2026-11-14T09:00:00Z',
    lead: MOCK_LEADS[0],
    assignee: MOCK_PROFILES[2]
  },
  {
    id: 'f-2',
    lead_id: 'l-2',
    assigned_to: 'p-3',
    due_at: '2026-11-14T11:00:00Z', // Yesterday (Overdue!)
    note: 'Follow up with Priya regarding the syllabus review and demo class booking',
    status: 'pending',
    created_by: 'p-3',
    created_at: '2026-11-12T10:30:00Z',
    lead: MOCK_LEADS[1],
    assignee: MOCK_PROFILES[2]
  },
  {
    id: 'f-3',
    lead_id: 'l-3',
    assigned_to: 'p-2',
    due_at: '2026-11-16T10:00:00Z', // Tomorrow (Upcoming)
    note: 'Send fee structure with installment schedule to Rohan',
    status: 'pending',
    created_by: 'p-2',
    created_at: '2026-11-10T15:00:00Z',
    lead: MOCK_LEADS[2],
    assignee: MOCK_PROFILES[1]
  },
  {
    id: 'f-4',
    lead_id: 'l-4',
    assigned_to: 'p-3',
    due_at: '2026-11-09T12:00:00Z',
    note: 'Verify enrollment form and welcome packet dispatch',
    status: 'completed',
    completed_at: '2026-11-09T14:30:00Z',
    created_by: 'p-3',
    created_at: '2026-11-08T11:30:00Z',
    lead: MOCK_LEADS[3],
    assignee: MOCK_PROFILES[2]
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a-1',
    lead_id: 'l-1',
    actor_id: 'p-1',
    activity_type: 'lead_created',
    description: 'Enquiry received from Website Form for Full Stack Web Development',
    created_at: '2026-11-14T08:30:00Z',
    actor: MOCK_PROFILES[0]
  },
  {
    id: 'a-2',
    lead_id: 'l-2',
    actor_id: 'p-3',
    activity_type: 'status_changed',
    description: 'Status changed from New to Contacted after introductory counseling call',
    created_at: '2026-11-12T10:15:00Z',
    actor: MOCK_PROFILES[2]
  },
  {
    id: 'a-3',
    lead_id: 'l-4',
    actor_id: 'p-3',
    activity_type: 'status_changed',
    description: 'Enquiry converted to Admitted! Registration fee confirmed.',
    created_at: '2026-11-08T11:00:00Z',
    actor: MOCK_PROFILES[2]
  },
  {
    id: 'a-4',
    lead_id: 'l-6',
    actor_id: 'p-2',
    activity_type: 'status_changed',
    description: 'Marked as Lost. Reason: Joined college semester project instead.',
    created_at: '2026-11-05T09:45:00Z',
    actor: MOCK_PROFILES[1]
  }
];
