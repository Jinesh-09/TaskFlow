-- Fix user profile and task loading issues
-- Run this in Supabase SQL Editor

-- First, check if user exists in auth.users
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'admin@example.com';

-- Drop restrictive policies that prevent data loading
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create more permissive policies temporarily
CREATE POLICY "Allow task viewing" ON public.tasks
    FOR SELECT USING (true);

CREATE POLICY "Allow user viewing" ON public.users
    FOR SELECT USING (true);

-- Check if admin user exists
SELECT id, email, full_name, role FROM public.users WHERE email = 'admin@example.com';

-- If not exists, create admin profile
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin User';

-- Check all users
SELECT id, email, full_name, role FROM public.users;

-- Verify the profile was created
SELECT * FROM public.users WHERE email = 'admin@example.com';
