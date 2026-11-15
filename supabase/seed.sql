-- ==============================================================================
-- BRIGHTPATH CRM — OPTIONAL WORKSHOP DEMO SEED DATA
-- Fictional student enquiries for BrightPath Academy
-- Run this AFTER 20261115000000_init_schema.sql and after registering at least 1 user.
-- ==============================================================================

-- 1. Insert sample leads (uses whatever profiles exist in public.profiles, or null)
DO $$
DECLARE
  v_admin_id UUID;
  v_lead_1 UUID;
  v_lead_2 UUID;
  v_lead_3 UUID;
  v_lead_4 UUID;
BEGIN
  -- Grab the first profile if available
  SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;

  -- Insert Lead 1: New Enquiry
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
  VALUES (
    gen_random_uuid(),
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '+91 98765 43210',
    'Full Stack Web Development',
    'Website Form',
    'New',
    v_admin_id,
    v_admin_id,
    'Inquired about weekend batch schedule and placement support.'
  )
  RETURNING id INTO v_lead_1;

  -- Insert Lead 2: Contacted
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
  VALUES (
    gen_random_uuid(),
    'Priya Patel',
    'priya.patel@example.com',
    '+91 98234 56789',
    'Data Science & AI',
    'Google Ads',
    'Contacted',
    v_admin_id,
    v_admin_id,
    'Introductory counseling call completed. Syllabus sent.'
  )
  RETURNING id INTO v_lead_2;

  -- Insert Lead 3: Converted (Admitted)
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, assigned_to, created_by, notes)
  VALUES (
    gen_random_uuid(),
    'Ananya Gupta',
    'ananya.gupta@example.com',
    '+91 97654 32109',
    'UI/UX Design Bootcamp',
    'Instagram / Social Media',
    'Converted',
    v_admin_id,
    v_admin_id,
    'Enrollment fee confirmed for December batch.'
  )
  RETURNING id INTO v_lead_3;

  -- Insert Lead 4: Lost
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes)
  VALUES (
    gen_random_uuid(),
    'Sneha Rao',
    'sneha.rao@example.com',
    '+91 94567 12340',
    'Full Stack Web Development',
    'Website Form',
    'Lost',
    'Joined university semester internship instead.',
    v_admin_id,
    v_admin_id,
    'Marked lost after follow-up confirmation.'
  )
  RETURNING id INTO v_lead_4;

  -- 2. Insert Follow-ups
  -- Overdue Follow-up for Priya
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
  VALUES (
    v_lead_2,
    v_admin_id,
    now() - interval '1 day',
    'Call Priya to review syllabus questions and schedule demo class',
    'pending',
    v_admin_id
  );

  -- Upcoming Follow-up for Aarav
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, created_by)
  VALUES (
    v_lead_1,
    v_admin_id,
    now() + interval '2 hours',
    'Call Aarav to answer scholarship questions',
    'pending',
    v_admin_id
  );

  -- Completed Follow-up for Ananya
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by)
  VALUES (
    v_lead_3,
    v_admin_id,
    now() - interval '3 days',
    'Dispatch welcome enrollment kit to Ananya',
    'completed',
    now() - interval '2 days',
    v_admin_id
  );

  -- 3. Insert Activities
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description)
  VALUES
    (v_lead_1, v_admin_id, 'lead_created', 'Enquiry received from Website Form for Full Stack Web Development'),
    (v_lead_2, v_admin_id, 'status_changed', 'Status changed from New to Contacted'),
    (v_lead_3, v_admin_id, 'status_changed', 'Enquiry Converted to Admitted! Initial fee paid.');

END $$;
