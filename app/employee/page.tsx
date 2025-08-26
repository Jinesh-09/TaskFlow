'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, UserProfile } from '@/lib/auth'
import { getTasks, Task } from '@/lib/tasks'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, FileText, MessageSquare, Calendar } from 'lucide-react'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import Chatbot from '@/components/ui/chatbot'
import Link from 'next/link'

export default function EmployeeDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
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
        if (!profile) {
          router.push('/login')
          return
        }

        setUser(profile)
        
        // Load user's tasks
        const tasksData = await getTasks(currentUser.id)
        setTasks(tasksData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800/50 border border-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mr-4">
              <ClipboardList className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Welcome back, {user?.full_name}</h1>
          </div>
          <p className="text-slate-400 ml-14">Track your assigned tasks and manage your workload</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <ClipboardList className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{tasks.length}</p>
                  <p className="text-sm text-slate-400">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{pendingTasks}</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{inProgressTasks}</p>
                  <p className="text-sm text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{completedTasks}</p>
                  <p className="text-sm text-slate-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Tasks Alert */}
        {overdueTasks > 0 && (
          <Card className="mb-8 bg-red-900/20 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mr-3">
                  <MessageSquare className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-300">Overdue Tasks</CardTitle>
                  <CardDescription className="text-red-400">
                    You have {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''} that need immediate attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* My Tasks */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                <ClipboardList className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-slate-100">My Tasks</CardTitle>
                <CardDescription className="text-slate-400">Your assigned tasks and their current status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">No tasks assigned</h3>
                <p className="text-slate-400">You don't have any tasks assigned yet. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                  
                  return (
                    <div key={task.id} className={`p-6 border rounded-xl transition-all duration-200 hover:shadow-lg ${isOverdue ? 'border-red-500/30 bg-red-900/10' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-semibold text-slate-100">{task.title}</h4>
                            {isOverdue && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-600/20 text-red-400 border border-red-500/30 rounded-full">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mb-4">{task.description}</p>
                          {task.admin_note && (
                            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border-l-2 border-purple-500/50">
                              <div className="flex items-center text-slate-300 mb-1">
                                <MessageSquare className="w-4 h-4 mr-1 text-purple-400" />
                                <span className="text-xs font-medium">Admin Note:</span>
                              </div>
                              <p className="text-sm text-slate-300">{task.admin_note}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Assigned by: {task.assigned_by_user?.full_name}</span>
                            <span>Created: {formatDate(task.created_at)}</span>
                            {task.due_date && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
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
                          <Link href={`/employee/tasks/${task.id}`}>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-300 transform">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* AI Chatbot */}
        {user && <Chatbot tasks={tasks} userProfile={user} />}
      </div>
    </div>
  )
}
