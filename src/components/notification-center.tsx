'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Bell, Check, Info, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export function NotificationCenter() {
  const { showNotifications, setShowNotifications, user, notifications, setNotifications, unreadCount } = useAppStore()
  const [markingAll, setMarkingAll] = useState(false)

  const handleMarkAllRead = async () => {
    if (!user) return
    setMarkingAll(true)
    try {
      // Mark all unread notifications as read
      const unreadNotifs = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifs.map(n =>
          fetch(`/api/notifications/${n.id}/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          })
        )
      )
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('Todas as notificações marcadas como lidas')
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
      <SheetContent className="w-full sm:max-w-md p-0" aria-describedby={undefined}>
        <SheetHeader className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell className="w-5 h-5 text-emerald-600" />
              Notificações
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
                className="text-xs text-emerald-600 hover:text-emerald-700 gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
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
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    !notif.read && 'bg-emerald-50/50 dark:bg-emerald-900/10'
                  )}
                  onClick={() => !notif.read && handleMarkRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      !notif.read ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'
                    )}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm truncate',
                          !notif.read ? 'font-semibold text-gray-800 dark:text-gray-200' : 'font-medium text-gray-600 dark:text-gray-400'
                        )}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
