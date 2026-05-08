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
  const { activeTab, setActiveTab, user } = useAppStore()

  const items = user?.role === 'ADMIN' ? [...navItems, adminItem] : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200',
                isActive
                  ? 'text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                isActive && 'bg-emerald-50'
              )}>
                <Icon className={cn(
                  'w-5 h-5 transition-all duration-200',
                  isActive && 'stroke-[2.5px]'
                )} />
              </div>
              <span className={cn(
                'text-[10px] mt-0.5 font-medium transition-all duration-200',
                isActive && 'text-emerald-700 font-semibold'
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
