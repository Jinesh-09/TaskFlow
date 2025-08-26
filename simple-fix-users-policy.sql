-- Simple fix for admin to see all users
-- Run this in Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create a more permissive policy temporarily
CREATE POLICY "Allow all user viewing" ON public.users
    FOR SELECT USING (true);

-- Check if your admin user exists and has correct role
SELECT id, email, full_name, role FROM public.users WHERE role = 'admin';

-- Check if your employee users exist
SELECT id, email, full_name, role FROM public.users WHERE role = 'employee';
