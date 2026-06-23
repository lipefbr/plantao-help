'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Moon, Sun, Wifi, BatteryFull, Signal } from 'lucide-react'

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
  const [currentTime, setCurrentTime] = useState('')

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

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
        {/* Phone status bar (desktop only) - mimics a real phone */}
        <div className="hidden sm:flex items-center justify-between px-6 pt-2 pb-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400 shrink-0">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryFull className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Top app bar */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-2 pb-3 shrink-0">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-90 group"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Online</span>
            </div>
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
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center px-6 pb-2 shrink-0">
          <div className="relative">
            {/* Animated glow ring */}
            <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/30 to-teal-400/20 rounded-3xl blur-xl animate-pulse" />
            <img
              src="/logo.jpg"
              alt="Plantão Help"
              className="relative w-20 h-20 rounded-3xl object-cover shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40 ring-2 ring-white dark:ring-gray-800"
            />
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-950 shadow-md">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
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

        {/* Trust footer (subtle) */}
        <div className="hidden sm:flex items-center justify-center gap-4 px-6 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>100% Seguro</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Dados protegidos</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Suporte 24h</span>
          </div>
        </div>
      </div>
    </div>
  )
}
