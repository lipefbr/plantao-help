'use client'

import { Stethoscope, LogIn, Bell } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getRoleLabel } from '@/lib/utils'

export function TopHeader() {
  const { user, setShowAuthModal, setAuthMode } = useAppStore()

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 rounded-lg shadow-sm">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-emerald-700 tracking-tight">
            Plantão<span className="text-emerald-500">Help</span>
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors relative">
              <Bell className="w-4 h-4 text-gray-500" />
              {user.registrationStatus === 'PENDING' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
              )}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-gray-700 leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{getRoleLabel(user.role)}</p>
            </div>
            <Avatar className="w-8 h-8 border-2 border-emerald-200">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
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
    </header>
  )
}
