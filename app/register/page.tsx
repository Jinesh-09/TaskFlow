'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { UserPlus, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'employee' as 'admin' | 'employee'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        router.push('/login')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20"></div>
      <Card className="relative w-full max-w-md bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">Create Account</CardTitle>
          <CardDescription className="text-slate-400">
            Register for the Work Assignment System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-slate-300">
                Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-xs text-slate-300">
              <strong className="text-purple-400">Quick Demo Setup:</strong><br/>
              Use valid email domains like @example.com or @gmail.com<br/>
              Create an admin account first, then create employee accounts to test the full system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
