-- ==============================================================================
-- BRIGHTPATH CRM — SAFE ADMIN BOOTSTRAP SCRIPT
-- Execute this script in the Supabase SQL Editor to elevate an account to 'admin'.
-- Replace 'your_email@example.com' with the email address of the owner account.
-- ==============================================================================

DO $$
DECLARE
  target_email TEXT := 'your_email@example.com'; -- <--- REPLACE THIS EMAIL
  target_user_id UUID;
BEGIN
  -- 1. Find user id from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No user found with email: %. Please create the account in Supabase Auth first.', target_email;
  ELSE
    -- 2. Update profile to 'admin'
    UPDATE public.profiles
    SET role = 'admin', updated_at = now()
    WHERE id = target_user_id;

    RAISE NOTICE 'Successfully promoted user % (%) to administrator.', target_email, target_user_id;
  END IF;
END $$;
