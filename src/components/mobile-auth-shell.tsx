'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Wifi, BatteryFull, Signal } from 'lucide-react'

interface MobileAuthShellProps {
  children: ReactNode
  onBack?: () => void
}

/**
 * Mobile-style auth shell — a full-screen responsive layout
 * with the Plantão Help logo at the top. Used by /mobile/login and
 * /mobile/register. No back button (these routes are entry points
 * accessed via direct link).
 */
export function MobileAuthShell({ children }: MobileAuthShellProps) {
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      {/* Top app bar - fixed at top */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-100/60 dark:border-gray-800/60">
        <div className="max-w-md mx-auto w-full px-5 pt-3 pb-3 flex items-center justify-between">
          {/* Phone status bar (desktop only) - mimics a real phone */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryFull className="w-3.5 h-3.5" />
            <span className="ml-1">{currentTime}</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
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
      </div>

      {/* Logo - bigger, no rounded frame */}
      <div className="flex flex-col items-center px-6 pt-6 pb-2 shrink-0">
        <img
          src="/logo.jpg"
          alt="Plantão Help"
          className="w-28 h-28 sm:w-32 sm:h-32 object-cover shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/30"
        />
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
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </div>

      {/* Trust footer (subtle) */}
      <div className="flex items-center justify-center gap-4 px-6 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
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
  )
}
