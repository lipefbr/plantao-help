'use client'

import { useAppStore } from '@/lib/store'
import { LandingPage } from '@/components/landing-page'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { darkMode, user } = useAppStore()
  const router = useRouter()

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // If user is already logged in and tries to visit "/",
  // redirect them to the mobile app experience.
  useEffect(() => {
    if (user) {
      router.replace('/mobile')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingPage />
    </div>
  )
}
