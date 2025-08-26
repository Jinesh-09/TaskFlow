import { supabase } from './supabase'

export interface Task {
  id: string
  title: string
  description: string
  assigned_to: string
  assigned_by: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  admin_note: string | null
  created_at: string
  updated_at: string
  assigned_user?: {
    full_name: string
    email: string
  }
  assigned_by_user?: {
    full_name: string
    email: string
  }
}

export interface TaskDocument {
  id: string
  task_id: string
  file_name: string
  file_path: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export interface TaskNote {
  id: string
  task_id: string
  user_id: string
  note: string
  created_at: string
  user?: {
    full_name: string
    email: string
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  return { data, error }
}

export async function getTasks(userId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(full_name, email),
      assigned_by_user:users!tasks_assigned_by_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('assigned_to', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data || []
}

// Alias for admin to get all tasks
export async function getAllTasks(): Promise<Task[]> {
  return getTasks() // Get all tasks without userId filter
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(full_name, email),
      assigned_by_user:users!tasks_assigned_by_fkey(full_name, email)
    `)
    .eq('id', taskId)
    .single()

  if (error) {
    console.error('Error fetching task:', error)
    return null
  }

  return data
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  return { data, error }
}

export async function updateTaskStatus(taskId: string, status: Task['status']) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single()

  return { data, error }
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  return { error }
}

export async function uploadTaskDocument(file: File, taskId: string, uploadedBy: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${taskId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('task-documents')
    .upload(filePath, file)

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const { data, error } = await supabase
    .from('task_documents')
    .insert({
      task_id: taskId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      uploaded_by: uploadedBy,
    })
    .select()
    .single()

  return { data, error }
}

export async function getTaskDocuments(taskId: string): Promise<TaskDocument[]> {
  const { data, error } = await supabase
    .from('task_documents')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching task documents:', error)
    return []
  }

  return data || []
}

export async function downloadTaskDocument(filePath: string) {
  const { data, error } = await supabase.storage
    .from('task-documents')
    .download(filePath)

  return { data, error }
}

export async function addTaskNote(taskId: string, userId: string, note: string) {
  const { data, error } = await supabase
    .from('task_notes')
    .insert({
      task_id: taskId,
      user_id: userId,
      note,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateTaskNote(taskId: string, adminNote: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({ admin_note: adminNote })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task note:', error)
    return false
  }

  return true
}

export async function getTaskNotes(taskId: string): Promise<TaskNote[]> {
  const { data, error } = await supabase
    .from('task_notes')
    .select(`
      *,
      user:users(full_name, email)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching task notes:', error)
    return []
  }

  return data || []
}
