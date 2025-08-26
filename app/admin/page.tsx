'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, getAllUsers, UserProfile } from '@/lib/auth'
import { getTasks, Task } from '@/lib/tasks'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ClipboardList, Plus, FileText } from 'lucide-react'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<UserProfile[]>([])
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
        if (!profile || profile.role !== 'admin') {
          router.push('/employee')
          return
        }

        setUser(profile)
        
        // Load all tasks and employees
        const [tasksData, usersData] = await Promise.all([
          getTasks(),
          getAllUsers()
        ])
        
        setTasks(tasksData)
        setEmployees(usersData.filter(u => u.role === 'employee'))
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
      <div className="min-h-screen bg-slate-900">
        <Navbar title="Admin Dashboard" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Admin Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Welcome back, {user?.full_name}</h1>
          <p className="text-slate-400 mt-2">Manage tasks and employees from your admin dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Tasks</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{tasks.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{pendingTasks}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">In Progress</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{inProgressTasks}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-100">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/tasks/new">
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Task
                </Button>
              </Link>
              <Link href="/admin/employees">
                <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-0.5 transition-all duration-300 transform">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Employees
                </Button>
              </Link>
              <Link href="/admin/tasks">
                <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-0.5 transition-all duration-300 transform">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View All Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-100">Employee Overview</CardTitle>
              <CardDescription className="text-slate-400">{employees.length} active employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employees.slice(0, 5).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-200">{employee.full_name}</p>
                      <p className="text-sm text-slate-400">{employee.email}</p>
                    </div>
                    <span className="text-sm text-purple-400 font-medium">
                      {tasks.filter(t => t.assigned_to === employee.id).length} tasks
                    </span>
                  </div>
                ))}
                {employees.length > 5 && (
                  <Link href="/admin/employees">
                    <Button variant="link" className="p-0 h-auto text-purple-400 hover:text-purple-300">
                      View all employees
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Tasks</CardTitle>
            <CardDescription className="text-slate-400">Latest task assignments and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">No tasks yet</h3>
                <p className="text-slate-400 mb-6">Get started by creating your first task.</p>
                <Link href="/admin/tasks/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-100">{task.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-slate-500">
                          Assigned to: {task.assigned_user?.full_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          Created: {formatDate(task.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <div className="text-center">
                    <Link href="/admin/tasks">
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white shadow-md hover:shadow-xl hover:shadow-slate-500/20 hover:-translate-y-0.5 transition-all duration-300 transform">View All Tasks</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
