-- Fix employee visibility for admins
-- Run this in Supabase SQL Editor

-- First, drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create a new policy that allows admins to see all users
CREATE POLICY "Users can view profiles" ON public.users
    FOR SELECT USING (
        -- Users can see their own profile
        auth.uid() = id 
        OR 
        -- Or if they are an admin (simple check without recursion)
        auth.uid() IN (
            SELECT u.id FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );
