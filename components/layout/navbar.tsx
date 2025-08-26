'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Zap, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface NavbarProps {
  title?: string
  user?: {
    full_name: string
    email: string
    role: string
  }
}

export default function Navbar({ title = 'Dashboard', user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm shadow-2xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700/50">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        {user.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-slate-100">{user.full_name}</div>
                      <div className="text-purple-400 capitalize font-medium">{user.role}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-4 bg-slate-900/98 backdrop-blur-sm border-t border-slate-700/50">
            {user && (
              <>
                <div className="flex items-center space-x-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      {user.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-100">{user.full_name}</div>
                    <div className="text-purple-400 capitalize font-medium">{user.role}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
