'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Bell, Check, Info, AlertTriangle, CheckCircle2,
  ShoppingCart, XCircle, Star, Shield, Landmark,
  FileText
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

// Notification category definitions
const NOTIFICATION_CATEGORIES: Record<string, {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  label: string
}> = {
  SHIFT_PUBLISHED: {
    icon: <FileText className="w-4 h-4" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-l-green-500',
    label: '📋 Publicação',
  },
  SHIFT_UPDATED: {
    icon: <FileText className="w-4 h-4" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-l-green-500',
    label: '📋 Atualização',
  },
  SHIFT_BOUGHT: {
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-l-blue-500',
    label: '🛒 Compra',
  },
  SHIFT_SOLD: {
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-l-blue-500',
    label: '🛒 Venda',
  },
  SHIFT_CANCELLED: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-l-red-500',
    label: '❌ Cancelamento',
  },
  NEW_RATING: {
    icon: <Star className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-l-amber-500',
    label: '⭐ Avaliação',
  },
  REGISTRATION_APPROVED: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-l-emerald-500',
    label: '✅ Aprovação',
  },
  REGISTRATION_REJECTED: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-l-red-500',
    label: '❌ Rejeição',
  },
  CONTEST: {
    icon: <Landmark className="w-4 h-4" />,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'border-l-teal-500',
    label: '🏛️ Concurso',
  },
  // Legacy type fallbacks
  SUCCESS: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-l-emerald-500',
    label: '✅ Sucesso',
  },
  WARNING: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-l-amber-500',
    label: '⚠️ Aviso',
  },
  INFO: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-l-blue-500',
    label: 'ℹ️ Info',
  },
}

// Infer notification category from title/message content
function inferNotificationCategory(title: string, type: string): string {
  const t = title.toLowerCase()
  if (t.includes('publicad') || t.includes('criad')) return 'SHIFT_PUBLISHED'
  if (t.includes('atualizad')) return 'SHIFT_UPDATED'
  if (t.includes('comprad') || t.includes('comprou')) return 'SHIFT_BOUGHT'
  if (t.includes('vendid') || t.includes('vendeu')) return 'SHIFT_SOLD'
  if (t.includes('cancelad')) return 'SHIFT_CANCELLED'
  if (t.includes('avaliação') || t.includes('avaliad') || t.includes('rating')) return 'NEW_RATING'
  if (t.includes('aprovad')) return 'REGISTRATION_APPROVED'
  if (t.includes('rejeitad')) return 'REGISTRATION_REJECTED'
  if (t.includes('concurso') || t.includes('edital')) return 'CONTEST'
  return type || 'INFO'
}

export function NotificationCenter() {
  const { showNotifications, setShowNotifications, user, notifications, setNotifications, unreadCount } = useAppStore()
  const [markingAll, setMarkingAll] = useState(false)

  const handleMarkAllRead = async () => {
    if (!user) return
    setMarkingAll(true)
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        toast.success('Todas as notificações marcadas como lidas')
      } else {
        toast.error('Erro ao atualizar notificações')
      }
    } catch {
      toast.error('Erro ao atualizar notificações')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleMarkRead = async (notifId: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (res.ok) {
        setNotifications(
          notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
        )
      }
    } catch {
      // silently fail
    }
  }

  // Count notifications by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const n of notifications) {
      const cat = inferNotificationCategory(n.title, n.type)
      counts[cat] = (counts[cat] || 0) + 1
    }
    return counts
  }, [notifications])

  // Get top categories for display
  const topCategories = useMemo(() => {
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, count]) => ({
        category: cat,
        count,
        ...NOTIFICATION_CATEGORIES[cat],
      }))
  }, [categoryCounts])

  const getCategoryInfo = (title: string, type: string) => {
    const cat = inferNotificationCategory(title, type)
    return NOTIFICATION_CATEGORIES[cat] || NOTIFICATION_CATEGORIES.INFO
  }

  return (
    <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
      <SheetContent className="w-full sm:max-w-md p-0 animate-slideIn" aria-describedby={undefined}>
        <SheetHeader className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell className="w-5 h-5 text-emerald-600" />
              Notificações
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-badge-pulse">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-xs text-emerald-600 hover:text-emerald-700 gap-1 animate-sweep"
              >
                <Check className="w-3 h-3" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Category counts at top */}
        {topCategories.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-2 flex-wrap">
              {topCategories.map(({ category, count, color, bgColor, label }) => (
                <div
                  key={category}
                  className={cn('flex items-center gap-1 text-[10px] px-2 py-1 rounded-full', bgColor, color)}
                >
                  <span>{label.split(' ')[0]}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-130px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nenhuma notificação</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                As notificações sobre seus plantões aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif) => {
                const catInfo = getCategoryInfo(notif.title, notif.type)
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-3',
                      !notif.read && 'bg-emerald-50/50 dark:bg-emerald-900/10',
                      catInfo.borderColor
                    )}
                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        !notif.read ? catInfo.bgColor : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        <span className={cn(!notif.read ? catInfo.color : 'text-gray-400')}>
                          {catInfo.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            !notif.read ? 'font-semibold text-gray-800 dark:text-gray-200' : 'font-medium text-gray-600 dark:text-gray-400'
                          )}>
                            {notif.title}
                          </p>
                          {/* Pulse on unread */}
                          {!notif.read && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-badge-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {formatDate(notif.createdAt)}
                          </p>
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', catInfo.bgColor, catInfo.color)}>
                            {catInfo.label.split(' ').slice(1).join(' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
