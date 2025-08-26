'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getUserProfile } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Briefcase } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Login successful!')
        
        // Get user profile to determine redirect
        try {
          const profile = await getUserProfile(data.user.id)
          
          if (profile?.role === 'admin') {
            router.push('/admin')
          } else if (profile?.role === 'employee') {
            router.push('/employee')
          } else {
            toast.error('User profile not found. Please contact admin.')
          }
        } catch (error) {
          toast.error('Error fetching user profile')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-slate-700/50 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            TaskFlow Pro
          </CardTitle>
          <CardDescription className="text-slate-400 text-lg">
            Sign in to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-purple-500/50 focus:ring-purple-500/20 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 transform" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
