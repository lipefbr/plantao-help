'use client'

import { Stethoscope, LogIn, Bell, Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getRoleLabel } from '@/lib/utils'
import { NotificationCenter } from '@/components/notification-center'
import { useEffect, useRef, useCallback } from 'react'

export function TopHeader() {
  const { user, setShowAuthModal, setAuthMode, toggleDarkMode, darkMode, notifications, setNotifications, setShowNotifications, unreadCount } = useAppStore()
  const bellRef = useRef<HTMLSpanElement>(null)
  const prevUnreadCount = useRef(unreadCount)

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

  // Trigger bell bounce animation via DOM ref when unread count increases
  const triggerBellBounce = useCallback(() => {
    if (unreadCount > prevUnreadCount.current && unreadCount > 0 && bellRef.current) {
      bellRef.current.classList.add('animate-bellBounce')
      setTimeout(() => {
        bellRef.current?.classList.remove('animate-bellBounce')
      }, 700)
    }
    prevUnreadCount.current = unreadCount
  }, [unreadCount])
  useEffect(triggerBellBounce, [triggerBellBounce])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-100/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 bg-emerald-600 rounded-xl shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
              <Stethoscope className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight gradient-text">
                Plantão<span className="text-emerald-500 dark:text-emerald-300">Help</span>
              </span>
              {/* Breathing green live indicator */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulseSoft" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-400/50" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle with scale transition */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
              ) : (
                <Moon className="w-4 h-4 text-gray-500 transition-transform duration-300 rotate-0" />
              )}
            </button>

            {user ? (
              <>
                {/* Notification bell with bounce animation */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors relative"
                >
                  <span ref={bellRef} className="inline-block origin-top-center">
                    <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-900 shadow-sm shadow-red-200 dark:shadow-red-900/30 animate-badge-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{getRoleLabel(user.role)}</p>
                </div>
                {/* Avatar with ring effect */}
                <Avatar className="w-8 h-8 ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Button
                onClick={handleLogin}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-medium rounded-lg shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 hover:shadow-md active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Gradient border-bottom line */}
      <div className="fixed top-14 left-0 right-0 z-40 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-80" />
      <NotificationCenter />
    </>
  )
}
