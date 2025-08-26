'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser, getUserProfile, UserProfile } from '@/lib/auth'
import { getTaskById, updateTask, getTaskDocuments, getTaskNotes, addTaskNote, downloadTaskDocument, Task, TaskDocument, TaskNote } from '@/lib/tasks'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Download, FileText, MessageSquare, Calendar, User } from 'lucide-react'
import { formatDate, formatDateTime, getStatusColor, getPriorityColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function TaskDetailPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [documents, setDocuments] = useState<TaskDocument[]>([])
  const [notes, setNotes] = useState<TaskNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingNote, setAddingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        const profile = await getUserProfile(currentUser.id)
        if (!profile) {
          router.push('/login')
          return
        }

        setUser(profile)
        
        const [taskData, documentsData, notesData] = await Promise.all([
          getTaskById(taskId),
          getTaskDocuments(taskId),
          getTaskNotes(taskId)
        ])

        if (!taskData) {
          toast.error('Task not found')
          router.push('/employee')
          return
        }

        // Check if user has access to this task
        if (profile.role !== 'admin' && taskData.assigned_to !== currentUser.id) {
          toast.error('Access denied')
          router.push('/employee')
          return
        }

        setTask(taskData)
        setDocuments(documentsData)
        setNotes(notesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load task details')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, taskId])

  const handleStatusUpdate = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    if (!task || !user) return

    setUpdatingStatus(true)
    try {
      const { error } = await updateTask(task.id, { status: newStatus })
      
      if (error) {
        toast.error('Failed to update task status')
        return
      }

      setTask({ ...task, status: newStatus })
      toast.success('Task status updated successfully!')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !user || !newNote.trim()) return

    setAddingNote(true)
    try {
      const { data, error } = await addTaskNote(task.id, user.id, newNote.trim())
      
      if (error) {
        toast.error('Failed to add note')
        return
      }

      if (data) {
        const noteWithUser = {
          ...data,
          user: { full_name: user.full_name, email: user.email }
        }
        setNotes([noteWithUser, ...notes])
        setNewNote('')
        toast.success('Note added successfully!')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setAddingNote(false)
    }
  }

  const handleDownloadDocument = async (document: TaskDocument) => {
    try {
      const { data, error } = await downloadTaskDocument(document.file_path)
      
      if (error || !data) {
        toast.error('Failed to download document')
        return
      }

      const url = URL.createObjectURL(data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.file_name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-slate-800/50 border border-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Task not found</h2>
            <p className="text-slate-400 mb-6">The task you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/employee">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/employee" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Task Header */}
        <Card className={`mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm ${isOverdue ? 'border-red-500/30 bg-red-900/10' : ''}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl text-slate-100">{task.title}</CardTitle>
                  {isOverdue && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-600/20 text-red-400 border border-red-500/30 rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mb-4 ml-11">{task.description}</p>
                {task.admin_note && (
                  <div className="mb-4 ml-11 p-3 bg-slate-700/50 rounded-lg border-l-2 border-purple-500/50">
                    <div className="flex items-center text-slate-300 mb-1">
                      <MessageSquare className="w-4 h-4 mr-1 text-purple-400" />
                      <span className="text-xs font-medium">Admin Note:</span>
                    </div>
                    <p className="text-sm text-slate-300">{task.admin_note}</p>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 ml-11">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Assigned by: {task.assigned_by_user?.full_name}
                  </span>
                  <span>Created: {formatDate(task.created_at)}</span>
                  {task.due_date && (
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Update */}
        {user?.role === 'employee' && task.assigned_to === user.id && (
          <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <CardTitle className="text-slate-100">Update Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button
                  variant={task.status === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={updatingStatus}
                  className={task.status === 'pending' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5 transition-all duration-300 transform'}
                >
                  Pending
                </Button>
                <Button
                  variant={task.status === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={updatingStatus}
                  className={task.status === 'in_progress' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 transform'}
                >
                  In Progress
                </Button>
                <Button
                  variant={task.status === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updatingStatus}
                  className={task.status === 'completed' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 transition-all duration-300 transform'}
                >
                  Completed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <CardTitle className="text-slate-100">Documents ({documents.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="text-slate-400 text-sm">No documents attached to this task.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-700 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-200">{doc.file_name}</p>
                        <p className="text-xs text-slate-500">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {formatDateTime(doc.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(doc)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-300 transform flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mr-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <CardTitle className="text-slate-100">Notes ({notes.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-4">
                <div className="flex space-x-2">
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={addingNote || !newNote.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform"
                  >
                    {addingNote ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-slate-400 text-sm">No notes yet. Add the first note above.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 border border-slate-700 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <p className="text-sm text-slate-200 mb-2">{note.note}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{note.user?.full_name}</span>
                        <span>{formatDateTime(note.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
