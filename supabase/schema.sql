-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'employee')) NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) NOT NULL DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_documents table
CREATE TABLE IF NOT EXISTS public.task_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_notes table
CREATE TABLE IF NOT EXISTS public.task_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Users policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

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

-- Create storage bucket for task documents
INSERT INTO storage.buckets (id, name, public) VALUES ('task-documents', 'task-documents', false);

-- Storage policies (simplified)
CREATE POLICY "Allow document access" ON storage.objects
    FOR SELECT USING (bucket_id = 'task-documents');

CREATE POLICY "Allow document upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'task-documents');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert demo users (run this after setting up authentication)
-- Note: You'll need to create these users through Supabase Auth first, then update their profiles

-- Demo admin user profile (create auth user first with email: admin@company.com, password: admin123)
-- Demo employee user profile (create auth user first with email: employee@company.com, password: employee123)
