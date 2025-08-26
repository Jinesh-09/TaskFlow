import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'employee'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'admin' | 'employee'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'employee'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          assigned_to: string
          assigned_by: string
          status: 'pending' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          assigned_to: string
          assigned_by: string
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          assigned_to?: string
          assigned_by?: string
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_documents: {
        Row: {
          id: string
          task_id: string
          file_name: string
          file_path: string
          file_size: number
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          file_name: string
          file_path: string
          file_size: number
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          uploaded_by?: string
          created_at?: string
        }
      }
      task_notes: {
        Row: {
          id: string
          task_id: string
          user_id: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          note?: string
          created_at?: string
        }
      }
    }
  }
}
