'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserProfile } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const profile = await getUserProfile(user.id)
        
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else if (profile?.role === 'employee') {
          router.push('/employee')
        } else {
          // If no profile exists, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}
