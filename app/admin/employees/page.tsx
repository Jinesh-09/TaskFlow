'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile, getAllUsers, deleteUser, UserProfile } from '@/lib/auth'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Edit, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function EmployeesPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [employees, setEmployees] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
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
        
        const usersData = await getAllUsers()
        setEmployees(usersData.filter(u => u.role === 'employee'))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return
    }

    setDeleting(employeeId)
    try {
      const { error } = await deleteUser(employeeId)
      
      if (error) {
        toast.error('Failed to delete employee')
        return
      }

      setEmployees(employees.filter(emp => emp.id !== employeeId))
      toast.success('Employee deleted successfully')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar title="Manage Employees" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Manage Employees" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-sm text-slate-400 hover:text-purple-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-slate-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  Employee Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage employee accounts and permissions
                </CardDescription>
              </div>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">No employees yet</h3>
                <p className="text-slate-400 mb-6">Get started by adding your first employee.</p>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                <span className="text-sm font-semibold text-purple-400">
                                  {employee.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-slate-100">
                                {employee.full_name}
                              </div>
                              <div className="text-sm text-slate-400">
                                Employee
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">{employee.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">
                            {formatDate(employee.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteEmployee(employee.id, employee.full_name)}
                              disabled={deleting === employee.id}
                              className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:text-red-300 shadow-md hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300 transform"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {deleting === employee.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
