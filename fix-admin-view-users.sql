-- Add policy to allow admins to view all users
-- Run this in Supabase SQL Editor

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        -- Allow if user is viewing their own profile
        auth.uid() = id 
        OR 
        -- Allow if current user is admin (check auth metadata)
        (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
        OR
        -- Allow if current user has admin role in raw_user_meta_data
        (auth.jwt() ->> 'raw_user_meta_data' ->> 'role' = 'admin')
    );
