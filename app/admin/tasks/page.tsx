'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, UserProfile } from '@/lib/auth'
import { getAllTasks, updateTaskStatus, updateTaskNote, Task } from '@/lib/tasks'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { ArrowLeft, Plus, Calendar, AlertCircle, User, MessageSquare } from 'lucide-react'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminTasksPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        const profile = await getUserProfile(currentUser.id)
        if (!profile || profile.role !== 'admin') {
          router.push('/employee')
          return
        }

        setUser(profile)
        
        const tasksData = await getAllTasks()
        setTasks(tasksData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSaveNote = async () => {
    if (!selectedTask) return
    
    setSavingNote(true)
    try {
      const success = await updateTaskNote(selectedTask.id, adminNote)
      if (success) {
        toast.success('Note saved successfully')
        // Update the task in the local state
        setTasks(tasks.map(task => 
          task.id === selectedTask.id 
            ? { ...task, admin_note: adminNote }
            : task
        ))
        setNoteModalOpen(false)
      } else {
        toast.error('Failed to save note')
      }
    } catch (error) {
      toast.error('An error occurred while saving the note')
    } finally {
      setSavingNote(false)
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await updateTaskStatus(taskId, newStatus)
      
      if (error) {
        toast.error('Failed to update task status')
        return
      }

      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      ))
      toast.success('Task status updated')
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-300 border border-green-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
    }
  }

  const getFilteredTasks = () => {
    const now = new Date()
    
    switch (filter) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending')
      case 'in_progress':
        return tasks.filter(task => task.status === 'in_progress')
      case 'completed':
        return tasks.filter(task => task.status === 'completed')
      case 'overdue':
        return tasks.filter(task => {
          if (!task.due_date) return false
          const dueDate = new Date(task.due_date)
          return task.status !== 'completed' && dueDate < now
        })
      default:
        return tasks
    }
  }

  const filteredTasks = getFilteredTasks()

  const getTaskStats = () => {
    const now = new Date()
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => {
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        return t.status !== 'completed' && dueDate < now
      }).length
    }
  }

  const stats = getTaskStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="All Tasks" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="All Tasks" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-sm text-slate-400 hover:text-purple-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className={`cursor-pointer transition-all duration-200 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 ${filter === 'all' ? 'ring-2 ring-purple-500 bg-slate-800/80' : ''}`}
                onClick={() => setFilter('all')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 ${filter === 'pending' ? 'ring-2 ring-yellow-500 bg-slate-800/80' : ''}`}
                onClick={() => setFilter('pending')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 ${filter === 'in_progress' ? 'ring-2 ring-blue-500 bg-slate-800/80' : ''}`}
                onClick={() => setFilter('in_progress')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 ${filter === 'completed' ? 'ring-2 ring-green-500 bg-slate-800/80' : ''}`}
                onClick={() => setFilter('completed')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 ${filter === 'overdue' ? 'ring-2 ring-red-500 bg-slate-800/80' : ''}`}
                onClick={() => setFilter('overdue')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Overdue</p>
                  <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-slate-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  All Tasks {filter !== 'all' && `(${filter.replace('_', ' ')})`}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage and monitor all tasks across the organization
                </CardDescription>
              </div>
              <Link href="/admin/tasks/new">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
                </h3>
                <p className="text-slate-400 mb-6">
                  {filter === 'all' ? 'Get started by creating your first task.' : `No tasks match the ${filter.replace('_', ' ')} filter.`}
                </p>
                {filter === 'all' && (
                  <Link href="/admin/tasks/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                      <Plus className="mr-2 h-4 w-4" />
                      New Task
                    </Button>
                  </Link>
                )}
                {filter !== 'all' && (
                  <Link href="/admin/tasks/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                      <Plus className="mr-2 h-4 w-4" />
                      New Task
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                    {filteredTasks.map((task) => {
                      const isOverdue = task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'completed' : false
                      
                      return (
                        <tr key={task.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-semibold text-slate-100">
                                  {task.title}
                                </div>
                                <div className="text-sm text-slate-400 truncate max-w-xs">
                                  {task.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                  <User className="w-4 h-4 text-purple-400" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-slate-200">
                                  {task.assigned_user?.full_name || 'Unassigned'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>
                              {task.due_date ? formatDate(task.due_date) : 'No due date'}
                              {isOverdue && (
                                <div className="text-xs text-red-400 font-medium">Overdue</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-300 transform"
                              onClick={() => {
                                setSelectedTask(task)
                                setAdminNote(task.admin_note || '')
                                setNoteModalOpen(true)
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Note
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note Modal */}
        <Modal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title={`Admin Note - ${selectedTask?.title}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Leave a note for the employee
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setNoteModalOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
