-- Clean schema setup - run this AFTER dropping policies
-- This creates only the new simplified policies

-- Users policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users admin_check 
            WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
        )
    );

CREATE POLICY "Allow user profile creation" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Tasks policies (simplified to avoid recursion)
CREATE POLICY "Users can view their assigned tasks" ON public.tasks
    FOR SELECT USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Allow task creation" ON public.tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their tasks" ON public.tasks
    FOR UPDATE USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- Task documents policies (simplified)
CREATE POLICY "Users can view documents for their tasks" ON public.task_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE id = task_id AND (assigned_to = auth.uid() OR assigned_by = auth.uid())
        )
    );

CREATE POLICY "Allow document upload" ON public.task_documents
    FOR INSERT WITH CHECK (true);

-- Task notes policies (simplified)
CREATE POLICY "Users can view notes for their tasks" ON public.task_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE id = task_id AND (assigned_to = auth.uid() OR assigned_by = auth.uid())
        )
    );

CREATE POLICY "Allow note creation" ON public.task_notes
    FOR INSERT WITH CHECK (true);

-- Storage policies (simplified)
CREATE POLICY "Allow document access" ON storage.objects
    FOR SELECT USING (bucket_id = 'task-documents');

CREATE POLICY "Allow document upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'task-documents');

-- Create your admin user profile
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
