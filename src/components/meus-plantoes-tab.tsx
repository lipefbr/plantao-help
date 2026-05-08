'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, renderStars, getRoleLabel, getStatusColor, getStatusLabel, getShiftType, getShiftTypeColor, getShiftTypeIcon, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Clock, Star, Briefcase, LogIn, User, RefreshCw, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight, List, CalendarDays, X } from 'lucide-react'

interface ShiftItem {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string
  endTime: string
  value: number
  location: string
  city: string
  state: string
  status: string
  professionalType: string
  sellerId: string
  buyerId: string | null
  seller: {
    id: string
    name: string
    role: string
    professionalDoc: string | null
    avgRating: number
    totalRatings: number
  }
  buyer: {
    id: string
    name: string
    role: string
    avatar: string | null
  } | null
  hospital: { id: string; name: string } | null
}

export function MeusPlantoesTab() {
  const { user, setShowAuthModal, setAuthMode, setSelectedShiftId } = useAppStore()
  const [publishedShifts, setPublishedShifts] = useState<ShiftItem[]>([])
  const [boughtShifts, setBoughtShifts] = useState<ShiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadMyShifts()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadMyShifts = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Load shifts I published (all statuses)
      const publishedRes = await fetch(`/api/shifts?sellerId=${user.id}&allStatuses=true`)
      const published = publishedRes.ok ? await publishedRes.json() : []

      // Load shifts I bought
      const boughtRes = await fetch(`/api/shifts?buyerId=${user.id}&status=SOLD`)
      const bought = boughtRes.ok ? await boughtRes.json() : []

      setPublishedShifts(published)
      setBoughtShifts(bought)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId)
  }

  // Combine all shifts and group by date for calendar
  const allShifts = useMemo(() => {
    const published = publishedShifts.map(s => ({ ...s, shiftType: 'published' as const }))
    const bought = boughtShifts.map(s => ({ ...s, shiftType: 'bought' as const }))
    return [...published, ...bought]
  }, [publishedShifts, boughtShifts])

  const shiftsByDate = useMemo(() => {
    const map: Record<string, typeof allShifts> = {}
    for (const shift of allShifts) {
      const dateKey = new Date(shift.date).toISOString().split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(shift)
    }
    return map
  }, [allShifts])

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() // 0=Sun

    const days: (Date | null)[] = []

    // Add empty slots for days before the first
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add actual days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date())
    setSelectedDate(null)
  }, [])

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const getDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const selectedDateShifts = useMemo(() => {
    if (!selectedDate) return []
    return shiftsByDate[selectedDate] || []
  }, [selectedDate, shiftsByDate])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Meus Plantões</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Faça login para ver seus plantões publicados e comprados
        </p>
        <Button
          onClick={() => {
            setAuthMode('login')
            setShowAuthModal(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </Button>
      </div>
    )
  }

  const ShiftCard = ({ shift, type }: { shift: ShiftItem; type: 'published' | 'bought' }) => {
    // Calculate shift completion percentage
    const shiftStart = new Date(`${shift.date.split('T')[0]}T${shift.startTime}:00`)
    const shiftEnd = new Date(`${shift.date.split('T')[0]}T${shift.endTime}:00`)
    const totalDuration = shiftEnd.getTime() - shiftStart.getTime()
    const elapsed = new Date().getTime() - shiftStart.getTime()
    const completionPct = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0
    const isGoldRated = type === 'bought' && shift.seller.avgRating >= 5

    return (
    <Card
      className={cn(
        'rounded-xl shadow-sm border-0 hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] border-l-4 border-l-emerald-400 hover:border-l-emerald-500 shift-card-hover',
        isGoldRated && 'border-l-amber-400 hover:border-l-amber-500 ring-1 ring-amber-200 dark:ring-amber-800/40'
      )}
      onClick={() => handleShiftClick(shift.id)}
    >
      <CardContent className="p-4">
        {/* Gradient progress bar */}
        {shift.status === 'AVAILABLE' && completionPct > 0 && completionPct < 100 && (
          <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 transition-all duration-1000"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
              {isGoldRated && (
                <span className="text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 rounded-full font-bold shrink-0">⭐ 5★</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
            </div>
            {/* Show buyer for published, seller for bought */}
            {type === 'published' && shift.buyer && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Comprador: {shift.buyer.name}</span>
              </div>
            )}
            {type === 'bought' && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Vendedor: {shift.seller.name}</span>
                {shift.seller.avgRating > 0 && (
                  <span className="text-xs text-amber-500">{renderStars(shift.seller.avgRating)}</span>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-700 font-bold text-sm">{formatCurrency(shift.value)}</p>
            <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium inline-block mt-1 border border-current/20', getShiftTypeColor(getShiftType(shift.startTime, shift.endTime)))}>
              {getShiftTypeIcon(getShiftType(shift.startTime, shift.endTime))} {getShiftType(shift.startTime, shift.endTime)}
            </span>
            <div className="mt-1">
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium inline-block', getStatusColor(shift.status))}>
                {getStatusLabel(shift.status)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }

  // Financial calculations
  const totalEarned = publishedShifts.filter(s => s.status === 'SOLD').reduce((sum, s) => sum + s.value, 0)
  const totalSpent = boughtShifts.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Meus Plantões</h2>
        <Button variant="ghost" size="sm" onClick={loadMyShifts} className="text-emerald-600 gap-1">
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent animate-shimmer-slow bg-[length:200%_100%]" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Resumo Financeiro</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                <p className="text-emerald-200 text-[11px]">Total Ganho</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalEarned)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-200" />
                <p className="text-emerald-200 text-[11px]">Total Gasto</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-emerald-200 text-[11px]">Publicados</p>
              <p className="text-base font-bold">{publishedShifts.length}</p>
            </div>
            <div>
              <p className="text-emerald-200 text-[11px]">Comprados</p>
              <p className="text-base font-bold">{boughtShifts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setViewMode('list')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-300',
            viewMode === 'list'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          )}
        >
          <List className="w-3.5 h-3.5" />
          Lista
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-300',
            viewMode === 'calendar'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Calendário
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'calendar' ? (
        /* ===== Calendar View ===== */
        <div className="animate-fadeIn space-y-4">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevMonth}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {formatMonthYear(currentMonth)}
                  </p>
                  {!isToday(currentMonth) && (
                    <button
                      onClick={goToToday}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                    >
                      Ir para hoje
                    </button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const dateKey = getDateKey(date)
                  const dayShifts = shiftsByDate[dateKey] || []
                  const hasPublished = dayShifts.some(s => s.shiftType === 'published')
                  const hasBought = dayShifts.some(s => s.shiftType === 'bought')
                  const isSelected = selectedDate === dateKey
                  const today = isToday(date)

                  return (
                    <button
                      key={dateKey}
                      onClick={() => {
                        if (dayShifts.length > 0) {
                          setSelectedDate(isSelected ? null : dateKey)
                        }
                      }}
                      className={cn(
                        'aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative transition-all duration-200',
                        dayShifts.length > 0 ? 'cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-95' : 'cursor-default',
                        today && 'font-bold',
                        isSelected
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-500 shadow-sm'
                          : today
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                      )}
                    >
                      <span className={cn(
                        'text-xs leading-none',
                        today ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-gray-300'
                      )}>
                        {date.getDate()}
                      </span>
                      {/* Dot indicators */}
                      {(hasPublished || hasBought) && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {hasPublished && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          {hasBought && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Publicado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Comprado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Shifts Popover/Panel */}
          {selectedDate && (
            <div className="animate-slideUp">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatDate(selectedDate)}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              {selectedDateShifts.length === 0 ? (
                <Card className="rounded-xl bg-gray-50 dark:bg-gray-800 border-0">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600 mb-1" />
                    <p className="text-xs text-gray-500">Nenhum plantão nesta data</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {selectedDateShifts.map(shift => (
                    <Card
                      key={shift.id}
                      className="rounded-xl shadow-sm border-0 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] shift-card-hover"
                      onClick={() => handleShiftClick(shift.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{shift.title}</h5>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[9px] px-1.5 py-0 shrink-0',
                                  shift.shiftType === 'published'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                )}
                              >
                                {shift.shiftType === 'published' ? 'Publicado' : 'Comprado'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{shift.startTime}-{shift.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{shift.city}/{shift.state}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{formatCurrency(shift.value)}</p>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block mt-0.5', getStatusColor(shift.status))}>
                              {getStatusLabel(shift.status)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No shifts in calendar view */}
          {allShifts.length === 0 && (
            <Card className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-0">
              <CardContent className="p-8 text-center">
                <CalendarDays className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum plantão para exibir no calendário</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Publique ou compre plantões para vê-los aqui!</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* ===== List View (original) ===== */
        <Tabs defaultValue="published" className="w-full">
          <TabsList className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <TabsTrigger value="published" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300">
              Publicados ({publishedShifts.length})
            </TabsTrigger>
            <TabsTrigger value="bought" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300">
              Comprados ({boughtShifts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-4">
            {publishedShifts.length === 0 ? (
              <Card className="rounded-2xl bg-gray-50 border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Você ainda não publicou nenhum plantão</p>
                  <p className="text-xs text-gray-400 mt-1">Publique seu primeiro plantão para começar!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {publishedShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} type="published" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bought" className="mt-4">
            {boughtShifts.length === 0 ? (
              <Card className="rounded-2xl bg-gray-50 border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Você ainda não comprou nenhum plantão</p>
                  <p className="text-xs text-gray-400 mt-1">Explore os plantões disponíveis no marketplace!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {boughtShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} type="bought" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
