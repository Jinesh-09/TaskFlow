'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, UserProfile } from '@/lib/auth'
import { getTasks, updateTaskStatus, Task } from '@/lib/tasks'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, AlertCircle, User, MessageSquare, Clock } from 'lucide-react'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function EmployeeTasksPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all')
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
        if (!profile || profile.role !== 'employee') {
          router.push('/login')
          return
        }

        setUser(profile)
        const tasksData = await getTasks(currentUser.id)
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

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await updateTaskStatus(taskId, newStatus)
      
      if (error) {
        toast.error('Failed to update task status')
        return
      }

      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      ))
      
      toast.success('Task status updated successfully')
    } catch (error) {
      toast.error('An error occurred while updating the task')
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'overdue') {
      return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
    }
    return task.status === filter
  })

  const getTaskCounts = () => {
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length

    return { pending, inProgress, completed, overdue, total: tasks.length }
  }

  const counts = getTaskCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-slate-300">Loading tasks...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/employee">
            <Button variant="ghost" className="mr-4 text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">My Tasks</h1>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{counts.total}</p>
                  <p className="text-sm text-slate-400">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{counts.pending}</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{counts.inProgress}</p>
                  <p className="text-sm text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{counts.completed}</p>
                  <p className="text-sm text-slate-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mr-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{counts.overdue}</p>
                  <p className="text-sm text-slate-400">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Tasks', count: counts.total },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'in_progress', label: 'In Progress', count: counts.inProgress },
            { key: 'completed', label: 'Completed', count: counts.completed },
            { key: 'overdue', label: 'Overdue', count: counts.overdue },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key as typeof filter)}
              className={
                filter === key
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-slate-500/20 hover:-translate-y-0.5 transition-all duration-300 transform'
              }
            >
              {label} ({count})
            </Button>
          ))}
        </div>

        {/* Tasks Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <CardTitle className="text-slate-100">My Tasks</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">No tasks found</h3>
                <p className="text-slate-400">No tasks match the current filter.</p>
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
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Admin Note
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                    {filteredTasks.map((task) => {
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                      
                      return (
                        <tr key={task.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-200">{task.title}</div>
                              <div className="text-sm text-slate-400 mt-1">{task.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
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
                          <td className="px-6 py-4">
                            {task.admin_note ? (
                              <div className="max-w-xs">
                                <div className="flex items-center text-slate-300 mb-1">
                                  <MessageSquare className="w-4 h-4 mr-1 text-purple-400" />
                                  <span className="text-xs font-medium">Admin Note:</span>
                                </div>
                                <div className="text-sm text-slate-400 bg-slate-700/50 rounded-lg p-2 border-l-2 border-purple-500/50">
                                  {task.admin_note}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-slate-500">No note</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {task.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                                  className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:text-blue-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 transform"
                                >
                                  Start
                                </Button>
                              )}
                              {task.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(task.id, 'completed')}
                                  className="bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 hover:text-green-300 shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 transition-all duration-300 transform"
                                >
                                  Complete
                                </Button>
                              )}
                              <Link href={`/employee/tasks/${task.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-300 transform"
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
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
      </div>
    </div>
  )
}
