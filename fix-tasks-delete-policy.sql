-- Allow deleting tasks via RLS
-- 1) Task creator (assigned_by) can delete their tasks
CREATE POLICY IF NOT EXISTS "Creators can delete their tasks" ON public.tasks
    FOR DELETE USING (assigned_by = auth.uid());

-- 2) Admins can delete any task
CREATE POLICY IF NOT EXISTS "Admins can delete any task" ON public.tasks
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
      )
    );
