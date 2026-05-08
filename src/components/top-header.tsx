'use client'

import { Stethoscope, LogIn, Bell, Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getRoleLabel } from '@/lib/utils'
import { NotificationCenter } from '@/components/notification-center'
import { useEffect } from 'react'

export function TopHeader() {
  const { user, setShowAuthModal, setAuthMode, toggleDarkMode, darkMode, notifications, setNotifications, setShowNotifications, unreadCount } = useAppStore()

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : ''

  // Load notifications when user is set
  useEffect(() => {
    if (!user) return
    const loadNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch {
        // silently fail
      }
    }
    loadNotifications()
  }, [user, setNotifications])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-lg shadow-sm">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
              Plantão<span className="text-emerald-500 dark:text-emerald-300">Help</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-300"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {user ? (
              <>
                {/* Notification bell */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors relative"
                >
                  <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{getRoleLabel(user.role)}</p>
                </div>
                <Avatar className="w-8 h-8 border-2 border-emerald-200 dark:border-emerald-700">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Button
                onClick={handleLogin}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-medium rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>
      <NotificationCenter />
    </>
  )
}
