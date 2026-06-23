'use client'

import { ReactNode, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Moon, Sun } from 'lucide-react'

interface MobileAuthShellProps {
  children: ReactNode
  onBack?: () => void
}

/**
 * Mobile-style auth shell — a phone-like frame centered on the screen
 * with the Plantão Help logo at the top. Used by /mobile/login and
 * /mobile/register.
 */
export function MobileAuthShell({ children, onBack }: MobileAuthShellProps) {
  const { darkMode, toggleDarkMode, user } = useAppStore()
  const router = useRouter()

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // If user is already logged in, redirect to /mobile
  useEffect(() => {
    if (user) {
      router.replace('/mobile')
    }
  }, [user, router])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-0 sm:p-4">
      {/* Decorative background blobs (desktop only) */}
      <div className="hidden sm:block absolute top-10 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute bottom-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Phone-like frame */}
      <div className="relative w-full sm:max-w-md sm:rounded-[2.5rem] sm:border sm:border-gray-200 dark:sm:border-gray-800 sm:shadow-2xl sm:shadow-emerald-200/40 dark:sm:shadow-emerald-900/20 bg-white dark:bg-gray-950 sm:overflow-hidden min-h-screen sm:min-h-0 sm:h-[90vh] sm:max-h-[900px] flex flex-col">
        {/* Top app bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-90"
            aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center px-6 pb-2 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl blur-xl" />
            <img
              src="/logo.jpg"
              alt="Plantão Help"
              className="relative w-20 h-20 rounded-3xl object-cover shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40 ring-2 ring-white dark:ring-gray-800"
            />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            <span className="gradient-text">Plantão</span>
            <span className="text-emerald-600 dark:text-emerald-400">Help</span>
          </h1>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Marketplace de plantões
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
}
