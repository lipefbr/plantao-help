'use client'

import { ReactNode, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'

interface MobileAuthShellProps {
  children: ReactNode
  onBack?: () => void
}

/**
 * Mobile-style auth shell — a clean, full-screen responsive layout
 * for /mobile/login and /mobile/register. Designed to be embedded in a
 * webview, so there is NO top status bar and NO title block — the page
 * content begins right at the top with just the logo + dark mode toggle.
 */
export function MobileAuthShell({ children }: MobileAuthShellProps) {
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      {/* Minimal top bar — only the dark mode toggle, no phone status bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-gray-950/70">
        <div className="max-w-md mx-auto w-full px-5 py-3 flex items-center justify-end">
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

      {/* Logo only — no title text, no subtitle (cleaner for webview) */}
      <div className="flex justify-center px-6 pt-2 pb-4 shrink-0">
        <img
          src="/logo.jpg"
          alt="Plantão Help"
          className="w-24 h-24 sm:w-28 sm:h-28 object-cover shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/30 rounded-2xl"
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
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
