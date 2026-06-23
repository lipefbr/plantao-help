'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlarmClock, ArrowRight, CalendarClock, Hospital, MapPin, Search, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  cn,
  formatDate,
  getShiftType,
  getShiftTypeColor,
  getShiftTypeIcon,
} from '@/lib/utils'
import { useAppStore } from '@/lib/store'

interface UpcomingShift {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  value: number
  city: string
  state: string
  status: string
  sellerId: string
  buyerId: string | null
  seller: { name: string; role: string }
  hospital: { name: string } | null
}

interface UpcomingShiftsWidgetProps {
  /** Logged-in user id. When omitted, the widget reads from the store. */
  userId?: string
  /** Optional callback when the user clicks "Ver todos". Falls back to store navigation. */
  onSeeAll?: () => void
  /** Optional callback when the user clicks "Buscar plantões" in the empty state. */
  onBrowse?: () => void
}

/**
 * Parse a shift's start datetime (date + startTime) safely handling ISO date strings.
 */
function getShiftStartDate(shift: UpcomingShift): Date {
  const dateStr =
    typeof shift.date === 'string'
      ? shift.date.split('T')[0]
      : new Date(shift.date).toISOString().split('T')[0]
  return new Date(`${dateStr}T${shift.startTime}:00`)
}

/**
 * Format the remaining time until a shift starts.
 * Returns: "2d 5h 30min" | "5h 30min" | "30min"
 */
function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Em andamento'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h ${mins}min`
  if (hours > 0) return `${hours}h ${mins}min`
  return `${mins}min`
}

/**
 * Urgency level based on ms remaining until the shift starts.
 * - 'urgent' (< 24h): red text + pulse
 * - 'soon'   (< 3 days): amber text
 * - 'normal' (>= 3 days): emerald text
 */
function getUrgency(ms: number): 'urgent' | 'soon' | 'normal' {
  if (ms < 24 * 60 * 60 * 1000) return 'urgent'
  if (ms < 3 * 24 * 60 * 60 * 1000) return 'soon'
  return 'normal'
}

const URGENCY_STYLES: Record<'urgent' | 'soon' | 'normal', string> = {
  urgent: 'text-red-600 dark:text-red-400',
  soon: 'text-amber-600 dark:text-amber-400',
  normal: 'text-emerald-600 dark:text-emerald-400',
}

const URGENCY_BG_STYLES: Record<'urgent' | 'soon' | 'normal', string> = {
  urgent: 'bg-red-50 dark:bg-red-950/30 ring-red-200 dark:ring-red-900',
  soon: 'bg-amber-50 dark:bg-amber-950/30 ring-amber-200 dark:ring-amber-900',
  normal: 'bg-emerald-50 dark:bg-emerald-950/30 ring-emerald-200 dark:ring-emerald-900',
}

export function UpcomingShiftsWidget({
  userId,
  onSeeAll,
  onBrowse,
}: UpcomingShiftsWidgetProps) {
  // Fall back to the store's logged-in user if no userId was passed in
  const storeUser = useAppStore((s) => s.user)
  const effectiveUserId = userId ?? storeUser?.id

  const [shifts, setShifts] = useState<UpcomingShift[]>([])
  const [loading, setLoading] = useState(true)
  // Ticks every minute so the countdowns stay live
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!effectiveUserId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [publishedRes, boughtRes] = await Promise.all([
          fetch(`/api/shifts?sellerId=${effectiveUserId}&allStatuses=true`),
          fetch(`/api/shifts?buyerId=${effectiveUserId}&status=SOLD`),
        ])

        const published: UpcomingShift[] = publishedRes.ok
          ? await publishedRes.json()
          : []
        const bought: UpcomingShift[] = boughtRes.ok
          ? await boughtRes.json()
          : []

        if (cancelled) return

        // Tag each shift with its relation to the user, then merge & dedupe by id
        const seen = new Set<string>()
        const merged: Array<UpcomingShift & { kind: 'bought' | 'published' }> = []

        for (const s of bought) {
          if (seen.has(s.id)) continue
          seen.add(s.id)
          merged.push({ ...s, kind: 'bought' })
        }
        for (const s of published) {
          if (seen.has(s.id)) continue
          seen.add(s.id)
          merged.push({ ...s, kind: 'published' })
        }

        // Filter: only upcoming (start in the future) and not cancelled
        const upcoming = merged
          .filter((s) => {
            if (s.status === 'CANCELLED') return false
            const start = getShiftStartDate(s)
            if (isNaN(start.getTime())) return false
            return start.getTime() > Date.now()
          })
          .sort((a, b) => {
            const aTime = getShiftStartDate(a).getTime()
            const bTime = getShiftStartDate(b).getTime()
            return aTime - bTime
          })
          .slice(0, 3)

        if (!cancelled) setShifts(upcoming as UpcomingShift[])
      } catch {
        // silently fail - widget will just show empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [effectiveUserId])

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll()
      return
    }
    useAppStore.getState().setActiveTab('meus-plantoes')
  }

  const handleBrowse = () => {
    if (onBrowse) {
      onBrowse()
      return
    }
    useAppStore.getState().setActiveTab('plantoes')
  }

  // Precompute each shift's countdown + urgency for the current tick
  const enriched = useMemo(() => {
    return shifts.map((s) => {
      const start = getShiftStartDate(s)
      const diff = start.getTime() - now
      return {
        shift: s,
        diff,
        countdown: formatCountdown(diff),
        urgency: getUrgency(diff),
        isBought: s.buyerId === effectiveUserId && s.status === 'SOLD',
      }
    })
  }, [shifts, now, effectiveUserId])

  return (
    <section
      aria-label="Próximos Plantões"
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-200/50 dark:shadow-emerald-900/40">
            <AlarmClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              Próximos Plantões
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
              Seus plantões com countdown ao vivo
            </p>
          </div>
        </div>
        <button
          onClick={handleSeeAll}
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-0.5 transition-colors"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <Skeleton className="h-3 w-3/4 rounded-md" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
              </div>
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : enriched.length === 0 ? (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Nenhum plantão próximo
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 max-w-xs mx-auto">
            Você não tem plantões comprados ou publicados agendados. Explore a
            marketplace para encontrar oportunidades.
          </p>
          <Button
            onClick={handleBrowse}
            size="sm"
            className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <Search className="w-4 h-4" />
            Buscar plantões
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map(({ shift, diff, countdown, urgency, isBought }, index) => {
            const shiftType = getShiftType(shift.startTime, shift.endTime)
            const isOngoing = diff <= 0
            return (
              <motion.article
                key={shift.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  'p-3 rounded-xl border border-gray-100 dark:border-gray-800',
                  'hover:border-emerald-200 dark:hover:border-emerald-800',
                  'hover:shadow-md hover:-translate-y-0.5',
                  'transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900',
                )}
                onClick={() =>
                  useAppStore.getState().setSelectedShiftId(shift.id)
                }
              >
                {/* Top row: title + bought/published badge */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 flex-1 min-w-0">
                    {shift.title}
                  </h4>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 border',
                      isBought
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                        : 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900',
                    )}
                  >
                    {isBought ? 'Comprado' : 'Publicado'}
                  </span>
                </div>

                {/* Countdown row */}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ring-1 text-xs font-bold tabular-nums',
                      URGENCY_BG_STYLES[urgency],
                      URGENCY_STYLES[urgency],
                      urgency === 'urgent' && !isOngoing && 'animate-pulse',
                    )}
                  >
                    {urgency === 'urgent' && !isOngoing ? (
                      <Timer className="w-3.5 h-3.5" />
                    ) : (
                      <AlarmClock className="w-3.5 h-3.5" />
                    )}
                    {isOngoing ? 'Em andamento' : countdown}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {urgency === 'urgent' && !isOngoing
                      ? 'Inicia logo!'
                      : urgency === 'soon'
                        ? 'Chegando'
                        : 'Agendado'}
                  </span>
                </div>

                {/* Date & time */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <CalendarClock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span className="truncate">
                    {formatDate(shift.date)} • {shift.startTime} - {shift.endTime}
                  </span>
                </div>

                {/* Location */}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span className="truncate">
                    {shift.city}/{shift.state}
                  </span>
                </div>

                {/* Hospital + shift type badge */}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  {shift.hospital?.name ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 min-w-0">
                      <Hospital className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="truncate">{shift.hospital.name}</span>
                    </div>
                  ) : (
                    <span />
                  )}
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium border border-current/20 shrink-0',
                      getShiftTypeColor(shiftType),
                    )}
                  >
                    {getShiftTypeIcon(shiftType)} {shiftType}
                  </span>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </section>
  )
}
