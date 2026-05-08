'use client'

import { useState, useEffect } from 'react'
import { Home, Calendar, Trophy, Briefcase, User, Shield } from 'lucide-react'
import { useAppStore, type TabType } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems: { tab: TabType; label: string; icon: React.ElementType }[] = [
  { tab: 'home', label: 'Início', icon: Home },
  { tab: 'plantoes', label: 'Plantões', icon: Calendar },
  { tab: 'concursos', label: 'Concursos', icon: Trophy },
  { tab: 'meus-plantoes', label: 'Meus', icon: Briefcase },
  { tab: 'perfil', label: 'Perfil', icon: User },
]

const adminItem: { tab: TabType; label: string; icon: React.ElementType } = {
  tab: 'admin',
  label: 'Admin',
  icon: Shield,
}

export function BottomNav() {
  const { activeTab, setActiveTab, setSelectedShiftId, user } = useAppStore()
  const [myShiftsCount, setMyShiftsCount] = useState(0)

  // Load shifts count for badge
  useEffect(() => {
    if (!user || user.role === 'ADMIN') return
    const loadCount = async () => {
      try {
        const res = await fetch(`/api/shifts?sellerId=${user.id}&allStatuses=true`)
        if (res.ok) {
          const data = await res.json()
          setMyShiftsCount(data.length)
        }
      } catch { /* */ }
    }
    loadCount()
  }, [user])

  const items = user?.role === 'ADMIN' ? [...navItems, adminItem] : navItems

  const handleTabChange = (tab: TabType) => {
    // Always clear shift detail when switching tabs
    setSelectedShiftId(null)
    setActiveTab(tab)
  }

  // Find the index of the active tab for the indicator line
  const activeIndex = items.findIndex(item => item.tab === activeTab)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-safe">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      {/* Active tab indicator line - slides to active tab */}
      <div className="relative h-[2px]">
        <div
          className="absolute top-0 h-full bg-emerald-500 rounded-full tab-indicator-line transition-all duration-300 ease-out"
          style={{
            width: `${100 / items.length}%`,
            left: `${(activeIndex / items.length) * 100}%`,
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          const isMeusTab = item.tab === 'meus-plantoes'
          const showBadge = isMeusTab && myShiftsCount > 0

          return (
            <button
              key={item.tab}
              onClick={() => handleTabChange(item.tab)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-2 min-w-0 flex-1 transition-all duration-300 relative active:scale-90 group',
                isActive
                  ? 'text-emerald-600'
                  : 'text-gray-400 hover:text-gray-500'
              )}
            >
              {/* Active indicator dot below icon */}
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full shadow-sm shadow-emerald-400/50" />
              )}
              <div className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 relative',
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 shadow-sm shadow-emerald-200/50 dark:shadow-emerald-800/30 scale-110'
                  : 'scale-100'
              )}>
                {/* Ripple effect on press */}
                <span className="absolute inset-0 rounded-xl overflow-hidden">
                  <span className="absolute inset-0 bg-emerald-300/20 rounded-full scale-0 active:animate-ripple" />
                </span>
                <Icon className={cn(
                  'w-[18px] h-[18px] transition-all duration-300 relative z-10',
                  isActive && 'stroke-[2.5px]'
                )} />
                {/* Badge notification count on Meus tab */}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-600 dark:bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-badge-pulse">
                    {myShiftsCount > 9 ? '9+' : myShiftsCount}
                  </span>
                )}
              </div>
              {/* Label */}
              <span className={cn(
                'text-[10px] mt-0.5 transition-all duration-300',
                isActive ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'font-medium'
              )}>
                {item.label}
              </span>
              {/* Desktop tooltip */}
              <span className="hidden sm:block absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-[9px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
