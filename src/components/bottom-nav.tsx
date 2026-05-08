'use client'

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

  const items = user?.role === 'ADMIN' ? [...navItems, adminItem] : navItems

  const handleTabChange = (tab: TabType) => {
    // Always clear shift detail when switching tabs
    setSelectedShiftId(null)
    setActiveTab(tab)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-safe">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          return (
            <button
              key={item.tab}
              onClick={() => handleTabChange(item.tab)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-2 min-w-0 flex-1 transition-all duration-300 relative active:scale-90',
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
                'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300',
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 shadow-sm shadow-emerald-200/50 dark:shadow-emerald-800/30 scale-110'
                  : 'scale-100'
              )}>
                <Icon className={cn(
                  'w-[18px] h-[18px] transition-all duration-300',
                  isActive && 'stroke-[2.5px]'
                )} />
              </div>
              <span className={cn(
                'text-[10px] mt-0.5 transition-all duration-300',
                isActive ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'font-medium'
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
